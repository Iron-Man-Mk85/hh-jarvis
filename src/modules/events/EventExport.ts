import { currentPage } from '../../game';
import { HHModule, type ModuleSettings } from '../../HHModule';
import { settingHelp } from '../../settingsHelp';
import { getEventExportRule } from './eventExportRules';

function sheetCell(value: string) {
    return value.replace(/\s+/g, ' ').trim();
}

export class EventExport extends HHModule {
    private button: HTMLButtonElement | null = null;
    private row: HTMLElement | null = null;
    private observer: MutationObserver | null = null;
    private feedbackTimer: number | undefined;
    private includeSources = true;

    constructor() {
        const baseKey = 'eventExport';
        super({ name: baseKey, configSchema: {
            baseKey,
            default: false,
            label: settingHelp('Event names export', 'Add a Copy event names button to regular event, Mythic Days, and Crazy Cumback Contest pages. Paste into Sheets for one base character name per row.'),
            subSettings: [{
                key: 'includeSources',
                label: settingHelp('Include event sources', 'Add a second column on supported event types when every reward has an identifiable source.'),
                default: true
            }]
        } });
    }

    shouldRun() {
        return currentPage === '/event.html';
    }

    run({ includeSources = true }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) return;
        const event = new URLSearchParams(location.search).get('tab') ?? window.event_data?.identifier ?? '';
        const rule = getEventExportRule(event);
        const eventPanel = document.querySelector('#events .nc-event-container');
        if (!rule || !eventPanel) return;
        const { id, source } = rule;
        this.hasRun = true;
        this.includeSources = includeSources;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'blue_button_L jarvis-event-copy';
        const label = document.createElement('span');
        label.setAttribute('aria-live', 'polite');
        label.textContent = 'Copy event names';
        button.appendChild(label);
        button.addEventListener('click', async () => {
            button.disabled = true;
            clearTimeout(this.feedbackTimer);
            try {
                const rewards = window.event_girls ?? window.event_data?.girls;
                const names = rewards?.map(reward => sheetCell(reward.name ?? ''));
                if (!rewards || !names?.length || names.some(name => !name)) {
                    label.textContent = 'Names unavailable';
                    return;
                }
                const sources = this.includeSources && source ? rewards.map(reward => source(reward, id)) : [];
                const completeSources = sources.length === names.length && sources.every(Boolean);
                const rows = completeSources ? names.map((name, index) => `${name}\t${sources[index]}`) : names;
                await navigator.clipboard.writeText(rows.join('\n'));
                label.textContent = `${names.length} ${names.length === 1 ? 'name' : 'names'} copied`;
            } catch (err) {
                console.warn('Jarvis could not copy the event names:', err);
                label.textContent = 'Copy failed';
            } finally {
                if (this.button === button) {
                    button.disabled = false;
                    this.feedbackTimer = window.setTimeout(() => label.textContent = 'Copy event names', 2500);
                }
            }
        });
        this.button = button;
        const mount = () => {
            const source = eventPanel.querySelector('.nc-event-reward-container.selected .nc-events-prize-locations-container');
            if (!source || this.row?.parentElement === source) return;

            this.removeRow();
            const row = document.createElement('div');
            row.className = 'jarvis-event-copy-row';
            const carousel = source.querySelector(':scope > .controls-button-container');
            if (carousel) {
                carousel.before(row);
                row.append(carousel);
            } else {
                const details = source.querySelector(':scope > :is(.prize-locations-infos-container, .shards-info-container)');
                if (details) details.after(row);
                else source.prepend(row);
            }
            row.append(button);
            this.row = row;
        };
        this.observer = new MutationObserver(mount);
        this.observer.observe(eventPanel, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        mount();
    }

    updateSubSetting(key: string, value: boolean) {
        if (key === 'includeSources') this.includeSources = value;
    }

    tearDown() {
        this.observer?.disconnect();
        this.observer = null;
        clearTimeout(this.feedbackTimer);
        this.button?.remove();
        this.removeRow();
        this.button = null;
        this.hasRun = false;
    }

    private removeRow() {
        const nativeControls = this.row?.querySelector(':scope > .controls-button-container');
        if (nativeControls) this.row?.replaceWith(nativeControls);
        else this.row?.remove();
        this.row = null;
    }
}
