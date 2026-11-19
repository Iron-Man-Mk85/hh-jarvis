import { settingHelp } from '../../settingsHelp';
import { HHModule } from '../../HHModule';
import { currentPage } from '../../game';
import type { GirlData, LoveRaid } from '../../game-types';
import { lsGet, lsSet, lsRm } from '../../storage';
import { getGirlDictionary } from './gameData';

type RaidCopyButton = HTMLDivElement & { _boundCopyKeyHandler?: (event: KeyboardEvent) => void };

export class LoveRaidsParser extends HHModule {
    private girlDict: ReadonlyMap<string, GirlData> | null = null;
    private _boundInsertButton?: () => void;

    /*
    * Raid ID, Announcement Type, Background ID, Event Name, Start Datetime,
    * End Datetime, Duration, Raid Status, Source, Girl ID,
    * Girl Name, Rarity, Max Grade, First Appearance, Source ID,
    * Has Skin(s)
    */
    constructor() {
        const baseKey = 'loveRaidsParser'
        const configSchema = {
            baseKey,
            default: false,
            label: settingHelp("Love Raids export", "Add a button to copy new raids in a spreadsheet-ready format.")
        }
        super({name: baseKey, configSchema});
    }

    shouldRun() {
        return currentPage.includes('/love-raids.html')
    }

    capitalizeFirst(str: string) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
    }

    getAnnouncementType(type: LoveRaid['id_announcement_type']) {
        switch (type) {
            case 1: return "Full";
            case 2: return "Partial";
            case 3: return "None";
            default: return "Unknown";
        }
    }

    getSourceID(event: LoveRaid) {
        const source_id = Number(event.raid_module_pk);
        switch (event.raid_module_type) {
            case 'season': return 0;
            case 'champion': return Number.isFinite(source_id) ? source_id : -2;
            case 'troll': return Number.isFinite(source_id) ? source_id + 10 : -2;
            default: return -1;
        }
    }

    girlHasSkins(event: LoveRaid) {
        const hasSkins = Array.isArray(event?.girl_data?.grade_skins) && event.girl_data.grade_skins.length > 0;
        if (hasSkins) {
            return "X";
        } else return "O";
    }

    formatEventRow(event: LoveRaid) {
        const durationHours = Math.floor(Number(event.event_duration_seconds) / 3600);
        const duration = `${durationHours} hours`;

        const girl = this.girlDict?.get(String(event.id_girl)) || {};
        const { name = 'Unknown', rarity = 'N/A', grade = 0 } = girl;

        return [
            event.id_raid,
            this.getAnnouncementType(event.id_announcement_type),
            event.background_id,
            event.event_name,
            event.start_datetime,
            event.end_datetime,
            duration,
            event.status,
            event.raid_module_type,
            event.id_girl,
            name,
            this.capitalizeFirst(rarity),
            grade,
            "", // one blank tab reserved for first appearance in GSheets
            this.getSourceID(event),
            this.girlHasSkins(event)
        ].join("\t");
    }

    async copyToClipboard(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn('Clipboard API failed, using execCommand fallback:', err);
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand('copy');
            } catch (err) {
                return false;
            } finally {
                textarea.remove();
            }
        }
    }

    async handleCopyClick(evt: MouseEvent) {
        const storageKey = 'LastSavedRaidID';

        // Shift + Ctrl + Click → clear stored ID
        if (evt.shiftKey && evt.ctrlKey) {
            const confirmClear = confirm('⚠️ Do you want to clear the saved last raid ID for this site?');
            if (confirmClear) {
                lsRm(storageKey);
                alert('✅ Last saved ID cleared.');
            }
            return;
        }

        // Load raids
        const localLoveRaids = (typeof love_raids !== 'undefined' && Array.isArray(love_raids)) ? love_raids : [];
        if (!localLoveRaids.length) {
            alert('⚠️ No love_raids found on this page.');
            return;
        }

        if (!this.girlDict) {
            alert('⚠️ The HH++ girl dictionary could not be loaded. Reload the page and try again.');
            return;
        }

        let lastSavedIdNumber = parseInt(String(lsGet(storageKey)), 10);

        // If Shift is held OR no saved ID exists → ask again
        if (isNaN(lastSavedIdNumber) || evt.shiftKey) {
            const lastSavedId = prompt('Please enter the last saved ID:');
            lastSavedIdNumber = parseInt(String(lastSavedId), 10);

            if (isNaN(lastSavedIdNumber)) {
                alert('❌ Invalid ID entered. Please enter a valid number.');
                return;
            }
        }

        // Filter new events
        const filteredData = localLoveRaids.filter(event => Number(event.id_raid) > lastSavedIdNumber);
        if (!filteredData.length) {
            alert(`ℹ️ No new events found with ID greater than ${lastSavedIdNumber}`);
            return;
        }

        const formattedData = filteredData.map(this.formatEventRow.bind(this)).join("\n");

        if (!await this.copyToClipboard(formattedData)) {
            alert('❌ Could not copy the raids. The last saved ID was kept.');
            return;
        }

        // Save highest ID
        const maxId = Math.max(...filteredData.map(e => Number(e.id_raid)));
        lsSet(storageKey, maxId);

        alert('✅ Data copied to clipboard! You can now paste it into GSheets.');
    }

    createCopyButton() {
        const button: RaidCopyButton = document.createElement('div');
        button.classList.add('reminder-copy');
        button.style.cssText = `
            background: linear-gradient(180deg, #00aaff 0, #006688 50%, #005577 51%, #00aaff 100%);
            display: inline-block;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            margin-left: 10px;
            cursor: pointer;
            position: absolute;
            right: 4.5rem;
            top: 0.2rem;
            font-size: 18px;
            line-height: 32px;
            text-align: center;
            transition: background 0.2s ease;
        `;
        button.textContent = '📋';
        let buttonTitle = 'Click = copy new raids. Shift / Shift + Ctrl available.';
        button.setAttribute('tooltip', '');
        button.setAttribute('hh_title', buttonTitle);

        const _boundCopyKeyHandler = (e: KeyboardEvent) => this.updateCopyButton(e, button);
        window.addEventListener('keydown', _boundCopyKeyHandler);
        window.addEventListener('keyup', _boundCopyKeyHandler);
        // store handler reference so callers can remove listeners if button is removed later
        button._boundCopyKeyHandler = _boundCopyKeyHandler;
        button.onclick = (e) => this.handleCopyClick(e);
        this.updateCopyButton({ shiftKey: false, ctrlKey: false }, button);
        return button;
    }

    updateCopyButton(e: Pick<KeyboardEvent, 'shiftKey' | 'ctrlKey'>, button: HTMLElement) {
        let buttonTitle = '';
        if (e.shiftKey && e.ctrlKey) {
            button.style.background = "linear-gradient(180deg, #ff6666 0, #aa0000 100%)"; // red
            button.textContent = '🗑️';
            buttonTitle = 'Shift + Ctrl + Click = clear saved ID';
            button.setAttribute('hh_title', buttonTitle);
        } else if (e.shiftKey) {
            button.style.background = "linear-gradient(180deg, #ffdd66 0, #cc9900 100%)"; // yellow
            button.textContent = '✏️';
            buttonTitle = 'Shift + Click = prompt for ID.';
            button.setAttribute('hh_title', buttonTitle);
        } else {
            button.style.background = "linear-gradient(180deg, #00aaff 0, #006688 50%, #005577 51%, #00aaff 100%)"; // default blue
            button.textContent = '📋';
            buttonTitle = 'Click = copy new raids. Shift / Shift + Ctrl available.';
            button.setAttribute('hh_title', buttonTitle);
        }
    }

    insertButton() {
        const notificationButton = document.querySelector('.button-notification-action.notif_button_s');
        if (notificationButton && !document.querySelector('.reminder-copy')) {
            const copyButton = this.createCopyButton();
            notificationButton.parentNode?.insertBefore(copyButton, notificationButton);
        }
    }

    async run() {
        if (this.hasRun || !this.shouldRun()) {return}

        this.hasRun = true
        this.girlDict = await getGirlDictionary();

        this._boundInsertButton = this.insertButton.bind(this);
        if (document.readyState === 'complete') this.insertButton();
        else window.addEventListener('load', this._boundInsertButton, { once: true });
    }
}
