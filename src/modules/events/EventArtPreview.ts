import { currentPage } from '../../game';
import { HHModule, type ModuleSettings } from '../../HHModule';
import { settingHelp } from '../../settingsHelp';
import { ArtPreview } from '../art-preview/ArtPreview';
import { getArtGroups } from '../art-preview/gameArt';
import type { EventReward } from '../../game-types';

export class EventArtPreview extends HHModule {
    private observer: MutationObserver | null = null;
    private viewer: ArtPreview | null = null;
    private reward: EventReward | undefined;
    private slide: HTMLElement | null = null;
    private info: HTMLElement | null = null;
    private layout: ResizeObserver | null = null;
    private scenesEnabled = true;

    constructor() {
        const baseKey = 'eventArtPreview';
        super({ name: baseKey, configSchema: {
            baseKey,
            default: false,
            label: settingHelp('Inline event previews', 'Browse the selected event character’s poses and released skins beside the main image.'),
            subSettings: [{
                key: 'scenes',
                label: settingHelp('Show scene previews', 'Also browse the still scene previews that the game provides.'),
                default: true
            }]
        } });
    }

    shouldRun() {
        return currentPage === '/event.html';
    }

    run({ scenes = true }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) return;
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
                this.reward = undefined;
                this.slide = null;
            }
            const info = eventPanel?.querySelector<HTMLElement>('.nc-event-reward-container.selected .girl-information') ?? null;
            const rewardPanel = info?.closest<HTMLElement>('.nc-events-prize-locations-container') ?? null;
            this.viewer?.dockBefore(info, rewardPanel);
            if (info !== this.info && this.viewer && eventPanel) {
                this.info = info;
                this.layout?.disconnect();
                if (info) {
                    this.layout = new ResizeObserver(() => this.viewer?.dockBefore(info, rewardPanel));
                    this.layout.observe(info);
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
        if (key !== 'scenes') return;
        this.scenesEnabled = value;
        this.viewer?.setScenesEnabled(value);
    }

    tearDown() {
        this.observer?.disconnect();
        this.observer = null;
        this.layout?.disconnect();
        this.layout = null;
        this.info = null;
        this.viewer?.destroy();
        this.viewer = null;
        this.reward = undefined;
        this.slide = null;
        this.hasRun = false;
    }
}
