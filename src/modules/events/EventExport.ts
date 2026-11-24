import { currentPage } from '../../game';
import type { EventReward, EventRewardSource } from '../../game-types';
import { HHModule, type ModuleSettings } from '../../HHModule';
import { settingHelp } from '../../settingsHelp';

const supportedTab = /^(event|mythic_event|crazy_cumback_contest)_(\d+)$/;

function sheetCell(value: string) {
    return value.replace(/\s+/g, ' ').trim();
}

function formatSource(source: EventRewardSource): string {
    switch (source.name) {
        case 'event_dm': return 'Daily Missions';
        case 'pachinko_event':
        case 'pachinko_epic': return 'Night-Club';
        case 'crazy_cumback_contest': return 'Crazy Cumback Contest';
        case 'event_troll':
        case 'event_champion_girl': {
            const href = source.anchor_source?.url;
            if (!href || !URL.canParse(href, location.origin)) return '';
            const url = new URL(href, location.origin);
            const villain = source.name === 'event_troll';
            const id = villain && url.pathname === '/troll-pre-battle.html'
                ? url.searchParams.get('id_opponent')
                : !villain ? url.pathname.match(/^\/champions\/(\d+)\/?$/)?.[1] : null;
            if (!id || !/^\d+$/.test(id)) return '';

            const sentence = document.createElement('template');
            sentence.innerHTML = source.sentence ?? '';
            const name = sheetCell(sentence.content.querySelector('i')?.textContent ?? '');
            return name ? `${villain ? 'Villain' : 'Champion'} #${id} ${name}` : '';
        }
        default: return '';
    }
}

function currentSource(reward: EventReward, kind: string, id: string) {
    const isCurrent = (source: EventRewardSource) =>
        source.group?.name === kind && String(source.group.id) === id;
    const primary = reward.source;
    if (primary && isCurrent(primary)) return formatSource(primary);

    const sources = Object.values(reward.source_list ?? {}).flatMap(list => list ?? []).filter(isCurrent);
    if (!sources.length && kind === 'event' && primary?.name === 'pachinko_epic') return formatSource(primary);
    const labels = new Set(sources.map(formatSource));
    return labels.size === 1 ? [...labels][0] : '';
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
                label: settingHelp('Include event sources', 'Add a second column when the current event source can be identified for every reward.'),
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
        const match = event.match(supportedTab);
        const eventPanel = document.querySelector('#events .nc-event-container');
        if (!match || !eventPanel) return;
        const [, kind, id] = match;
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
                    label.textContent = 'Event names unavailable';
                    return;
                }
                const sources = this.includeSources ? rewards.map(reward => currentSource(reward, kind, id)) : [];
                const completeSources = sources.length === names.length && sources.every(Boolean);
                const rows = completeSources ? names.map((name, index) => `${name}\t${sources[index]}`) : names;
                await navigator.clipboard.writeText(rows.join('\n'));
                label.textContent = `${names.length} ${names.length === 1 ? 'name' : 'names'} copied`;
            } catch (err) {
                console.warn('Jarvis could not copy the event names:', err);
                label.textContent = 'Could not copy names';
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
