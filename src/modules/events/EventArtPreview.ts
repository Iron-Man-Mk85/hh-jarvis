import { currentPage } from '../../game';
import { HHModule, type ModuleSettings } from '../../HHModule';
import { settingHelp } from '../../settingsHelp';
import { ArtPreview } from '../art-preview/ArtPreview';
import { RewardArtButtons } from '../art-preview/RewardArtButtons';
import { getArtGroups } from '../art-preview/gameArt';
import type { EventReward } from '../../game-types';

const rewardPages = new Set(['/event.html', '/path-of-valor.html', '/path-of-glory.html', '/penta-drill.html', '/season.html', '/seasonal.html', '/leagues.html', '/love-raids.html']);

export class EventArtPreview extends HHModule {
    private observer: MutationObserver | null = null;
    private viewer: ArtPreview | null = null;
    private reward: EventReward | undefined;
    private slide: HTMLElement | null = null;
    private info: HTMLElement | null = null;
    private rewardPanel: HTMLElement | null = null;
    private layout: ResizeObserver | null = null;
    private buttons: RewardArtButtons | null = null;
    private scenesEnabled = true;

    constructor() {
        const baseKey = 'eventArtPreview';
        super({ name: baseKey, configSchema: {
            baseKey,
            default: false,
            label: settingHelp('Reward art preview', 'Open a viewer for art on events, Love Raids, Path of Valor, Path of Glory, Penta Drill, Season, Seasonal Events, Leagues, and character pages.'),
            subSettings: [{
                key: 'scenes',
                label: settingHelp('Show scene previews', 'Also browse the still scene previews that the game provides.'),
                default: true
            }, {
                key: 'inline',
                label: settingHelp('Inline event controls', 'Put preview controls beside the artwork on event pages.'),
                default: false
            }]
        } });
    }

    shouldRun() {
        return rewardPages.has(currentPage) || currentPage.startsWith('/characters/');
    }

    run({ scenes = true, inline = false }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) return;
        if (!inline || currentPage !== '/event.html') {
            this.hasRun = true;
            this.scenesEnabled = scenes;
            this.buttons = new RewardArtButtons(currentPage, scenes);
            return;
        }
        const root = document.querySelector('#events');
        if (!root) return;
        this.hasRun = true;
        this.scenesEnabled = scenes;

        const sync = () => {
            const eventPanel = root.querySelector<HTMLElement>('.nc-event-container');
            const host = eventPanel?.querySelector<HTMLElement>('.nc-event-reward-container.selected .nc-event-reward-preview');
            const slide = host?.querySelector<HTMLElement>('.slide.selected[id-girl]') ?? null;
            const id = slide?.getAttribute('id-girl');
            const rewards = window.event_girls ?? window.event_data?.girls ?? [];
            const reward = id ? rewards.find(reward => String(reward.id_girl) === id) : undefined;

            if (!this.viewer?.mounted || host !== this.viewer.host || eventPanel !== this.viewer.controlHost) {
                this.viewer?.destroy();
                this.viewer = host && eventPanel && reward?.preview ? new ArtPreview(host, this.scenesEnabled, eventPanel) : null;
                this.layout?.disconnect();
                this.info = null;
                this.rewardPanel = null;
                this.reward = undefined;
                this.slide = null;
            }
            const info = eventPanel?.querySelector<HTMLElement>('.nc-event-reward-container.selected .girl-information') ?? null;
            const rewardPanel = eventPanel?.querySelector<HTMLElement>('.nc-event-reward-container.selected .nc-events-prize-locations-container') ?? null;
            this.viewer?.dockBefore(info, rewardPanel);
            if ((info !== this.info || rewardPanel !== this.rewardPanel) && this.viewer && eventPanel) {
                this.info = info;
                this.rewardPanel = rewardPanel;
                this.layout?.disconnect();
                if (info || rewardPanel) {
                    this.layout = new ResizeObserver(() => this.viewer?.dockBefore(info, rewardPanel));
                    if (info) this.layout.observe(info);
                    if (rewardPanel) this.layout.observe(rewardPanel);
                    this.layout.observe(eventPanel);
                }
            }
            if (reward === this.reward && slide === this.slide) {
                this.viewer?.refreshGestureArea();
                return;
            }
            this.reward = reward;
            this.slide = slide;
            this.viewer?.setCharacter(reward?.preview && slide ? getArtGroups(reward.preview) : null, slide);
        };
        this.observer = new MutationObserver(sync);
        this.observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'id-girl'] });
        sync();
    }

    updateSubSetting(key: string, value: boolean) {
        if (key === 'scenes') {
            this.scenesEnabled = value;
            this.viewer?.setScenesEnabled(value);
            this.buttons?.setScenesEnabled(value);
        } else if (key === 'inline' && this.hasRun && currentPage === '/event.html') {
            this.tearDown();
            this.run({ scenes: this.scenesEnabled, inline: value });
        }
    }

    tearDown() {
        this.buttons?.destroy();
        this.buttons = null;
        this.observer?.disconnect();
        this.observer = null;
        this.layout?.disconnect();
        this.layout = null;
        this.info = null;
        this.rewardPanel = null;
        this.viewer?.destroy();
        this.viewer = null;
        this.reward = undefined;
        this.slide = null;
        this.hasRun = false;
    }
}
