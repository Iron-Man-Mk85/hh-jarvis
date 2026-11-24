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
    private image: HTMLImageElement | null = null;
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
            const host = root.querySelector<HTMLElement>('.nc-event-reward-container.selected .nc-event-reward-preview');
            const slide = host?.querySelector('.slide.selected[id-girl]');
            const image = slide?.querySelector<HTMLImageElement>('img.slide-img') ?? null;
            const id = slide?.getAttribute('id-girl');
            const rewards = window.event_girls ?? window.event_data?.girls ?? [];
            const reward = id ? rewards.find(reward => String(reward.id_girl) === id) : undefined;

            if (host !== this.viewer?.host) {
                this.viewer?.destroy();
                this.viewer = host && reward?.preview ? new ArtPreview(host, this.scenesEnabled) : null;
                this.reward = undefined;
                this.image = null;
            }
            if (reward === this.reward && image === this.image) return;
            this.reward = reward;
            this.image = image;
            this.viewer?.setCharacter(reward?.preview && image ? getArtGroups(reward.preview) : null, image);
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
        this.viewer?.destroy();
        this.viewer = null;
        this.reward = undefined;
        this.image = null;
        this.hasRun = false;
    }
}
