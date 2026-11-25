import { currentPage } from '../../game';
import { HHModule, type ModuleSettings } from '../../HHModule';
import { settingHelp } from '../../settingsHelp';
import { getEventExportRule, getTitledEventLayout } from './eventExportRules';
import type { EventReward } from '../../game-types';

// Keep the saved HH++ setting key from when Path of Attraction was the first supported layout.
const includeEventNameKey = 'includePathTitle';

function sheetCell(value: string) {
    return value.replace(/\s+/g, ' ').trim();
}

async function copyRewardRows(rewardRows: EventReward[][][], eventName?: string) {
    const names = rewardRows.map(row => row.map(cell => cell.map(reward => sheetCell(reward.name ?? ''))));
    const allNames = names.flat(2);
    if (eventName === '' || !allNames.length || allNames.some(name => !name)) return 0;

    const rows = names.map((row, index) => {
        const cells = row.map(cell => cell.join(', '));
        if (eventName !== undefined) cells.unshift(index === 0 ? eventName : '');
        return cells.join('\t');
    });
    await navigator.clipboard.writeText(rows.join('\n'));
    return allNames.length;
}

export class EventExport extends HHModule {
    private rewardButton: HTMLButtonElement | null = null;
    private titleButton: HTMLButtonElement | null = null;
    private row: HTMLElement | null = null;
    private observer: MutationObserver | null = null;
    private feedbackTimers = new Map<HTMLButtonElement, number>();
    private includeSources = true;
    private includeEventName = true;

    constructor() {
        const baseKey = 'eventExport';
        super({ name: baseKey, configSchema: {
            baseKey,
            default: false,
            label: settingHelp('Event names export', 'Copy names from regular events, Mythic Days, Crazy Cumback Contest, and Path of Attraction.'),
            subSettings: [{
                key: 'includeSources',
                label: settingHelp('Include event sources', 'Add a second column on supported event types when every reward has an identifiable source.'),
                default: true
            }, {
                key: includeEventNameKey,
                label: settingHelp('Include event name', 'On supported events, copy the event name and reward names together. Turn this off for two clipboard buttons. The left copies the event name and the right copies the rewards.'),
                default: true
            }]
        } });
    }

    shouldRun() {
        return currentPage === '/event.html';
    }

    run({ includeSources = true, [includeEventNameKey]: includeEventName = true }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) return;
        const event = new URLSearchParams(location.search).get('tab') ?? window.event_data?.identifier ?? '';
        const layout = getTitledEventLayout();
        const rule = getEventExportRule(event);
        const eventPanel = document.querySelector(layout ? '#events' : '#events .nc-event-container');
        if ((!layout && !rule) || !eventPanel) return;
        this.hasRun = true;
        this.includeSources = includeSources;
        this.includeEventName = includeEventName;

        const rewardButton = this.createCopyButton('Copy event names', 'Names unavailable', async () => {
            const count = layout
                ? await copyRewardRows(layout.getRewardRows(), this.includeEventName ? sheetCell(layout.getEventName() ?? '') : undefined)
                : await this.copyEventNames(rule);
            return count ? `${count} ${count === 1 ? 'name' : 'names'} copied` : null;
        });
        this.rewardButton = rewardButton;
        if (layout) {
            this.titleButton = this.createCopyButton('Copy event name', 'Event name unavailable', async () => {
                const name = sheetCell(layout.getEventName() ?? '');
                if (!name) return null;
                await navigator.clipboard.writeText(name);
                return 'Event name copied';
            });
        }

        const mount = () => {
            if (layout) {
                const controls = eventPanel.querySelector(layout.controls);
                if (controls && rewardButton.parentElement !== controls) controls.append(rewardButton);
                this.syncTitleButton();
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
            row.append(rewardButton);
            this.row = row;
        };
        this.observer = new MutationObserver(mount);
        this.observer.observe(eventPanel, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        mount();
    }

    private syncTitleButton() {
        const { titleButton, rewardButton } = this;
        if (!titleButton || !rewardButton) return;

        if (this.includeEventName) titleButton.remove();
        else if (titleButton.nextElementSibling !== rewardButton) rewardButton.before(titleButton);

        const label = this.includeEventName ? 'Copy event names' : 'Copy reward names';
        rewardButton.setAttribute('aria-label', label);
        if (!this.feedbackTimers.has(rewardButton)) rewardButton.title = label;
    }

    private createCopyButton(label: string, unavailable: string, copy: () => Promise<string | null>) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'blue_button_L jarvis-event-copy';
        button.title = label;
        button.setAttribute('aria-label', label);
        const icon = document.createElement('span');
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '📋';
        const status = document.createElement('span');
        status.className = 'jarvis-event-copy-status';
        status.setAttribute('role', 'status');
        button.append(icon, status);
        button.addEventListener('click', async () => {
            button.disabled = true;
            clearTimeout(this.feedbackTimers.get(button));
            status.textContent = '';
            try {
                const message = await copy();
                status.textContent = message ?? unavailable;
                icon.textContent = message ? '✓' : '!';
            } catch (err) {
                console.warn('Jarvis could not copy event data:', err);
                status.textContent = 'Copy failed';
                icon.textContent = '!';
            } finally {
                if (this.rewardButton === button || this.titleButton === button) {
                    button.disabled = false;
                    button.title = status.textContent;
                    this.feedbackTimers.set(button, window.setTimeout(() => {
                        this.feedbackTimers.delete(button);
                        button.title = button.getAttribute('aria-label') ?? label;
                        icon.textContent = '📋';
                        status.textContent = '';
                    }, 2500));
                }
            }
        });
        return button;
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
        if (key === includeEventNameKey) {
            this.includeEventName = value;
            this.syncTitleButton();
        }
    }

    tearDown() {
        this.observer?.disconnect();
        this.observer = null;
        for (const timer of this.feedbackTimers.values()) clearTimeout(timer);
        this.feedbackTimers.clear();
        this.rewardButton?.remove();
        this.titleButton?.remove();
        this.removeRow();
        this.rewardButton = null;
        this.titleButton = null;
        this.hasRun = false;
    }

    private removeRow() {
        const nativeControls = this.row?.querySelector(':scope > .controls-button-container');
        if (nativeControls) this.row?.replaceWith(nativeControls);
        else this.row?.remove();
        this.row = null;
    }
}
