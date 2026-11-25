import { currentPage } from '../../game';
import { HHModule, type ModuleSettings } from '../../HHModule';
import { settingHelp } from '../../settingsHelp';
import { getEventExportRule } from './eventExportRules';
import { getPathRewardTiers, isPathOfAttraction, pathEventControls } from './pathOfAttraction';

function sheetCell(value: string) {
    return value.replace(/\s+/g, ' ').trim();
}

async function copyPathNames() {
    const title = sheetCell(window.event_data?.path_of_attraction?.name ?? '');
    const rewards = getPathRewardTiers().map(({ free, paid }) => [
        free.map(reward => sheetCell(reward.name ?? '')),
        paid.map(reward => sheetCell(reward.name ?? ''))
    ]);
    const names = rewards.flat(2);
    if (!title || !names.length || names.some(name => !name)) return 0;

    const rows = rewards.map(([free, paid], index) => [index === 0 ? title : '', free.join(', '), paid.join(', ')]);
    const tsv = rows.map(row => row.join('\t')).join('\n');
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
        const table = document.createElement('table');
        rows.forEach(([event, free, paid], index) => {
            const row = table.insertRow();
            if (index === 0) {
                const titleCell = row.insertCell();
                titleCell.textContent = event;
                titleCell.rowSpan = rows.length;
            }
            row.insertCell().textContent = free;
            row.insertCell().textContent = paid;
        });
        await navigator.clipboard.write([new ClipboardItem({
            'text/html': new Blob([table.outerHTML], { type: 'text/html' }),
            'text/plain': new Blob([tsv], { type: 'text/plain' })
        })]);
    } else {
        await navigator.clipboard.writeText(tsv);
    }
    return names.length;
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
            label: settingHelp('Event names export', 'Copy names from regular events, Mythic Days, Crazy Cumback Contest, and Path of Attraction. Path of Attraction includes the event name and one row per character reward tier, with free and paid columns.'),
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
        const pathEvent = isPathOfAttraction();
        const rule = getEventExportRule(event);
        const eventPanel = document.querySelector(pathEvent ? '#events' : '#events .nc-event-container');
        if ((!pathEvent && !rule) || !eventPanel) return;
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
                const count = pathEvent ? await copyPathNames() : await this.copyEventNames(rule);
                label.textContent = count ? `${count} ${count === 1 ? 'name' : 'names'} copied` : 'Names unavailable';
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
            if (pathEvent) {
                const controls = eventPanel.querySelector(pathEventControls);
                if (controls && button.parentElement !== controls) controls.append(button);
                return;
            }
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

    private async copyEventNames(rule: ReturnType<typeof getEventExportRule>) {
        if (!rule) return 0;
        const rewards = window.event_girls ?? window.event_data?.girls;
        const names = rewards?.map(reward => sheetCell(reward.name ?? ''));
        if (!rewards || !names?.length || names.some(name => !name)) return 0;

        const source = this.includeSources ? rule.source : undefined;
        const sources = source ? rewards.map(reward => source(reward, rule.id)) : [];
        const completeSources = sources.length === names.length && sources.every(Boolean);
        const rows = completeSources ? names.map((name, index) => `${name}\t${sources[index]}`) : names;
        await navigator.clipboard.writeText(rows.join('\n'));
        return names.length;
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
