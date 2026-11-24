import { currentPage } from '../../game';
import { HHModule } from '../../HHModule';
import { settingHelp } from '../../settingsHelp';

export class MythicPreviewFix extends HHModule {
    private style: HTMLStyleElement | null = null;

    constructor() {
        const baseKey = 'mythicPreviewFix';
        super({ name: baseKey, configSchema: {
            baseKey,
            default: false,
            label: settingHelp('Fix Mythic Revival preview', 'Restore the selected skin preview on Pornstar Harem if the loaded image stays transparent.')
        } });
    }

    shouldRun() {
        return currentPage === '/event.html' && /(^|\.)pornstarharem\.com$/.test(location.hostname);
    }

    run() {
        if (this.hasRun || !this.shouldRun()) return;
        this.hasRun = true;

        this.style = document.createElement('style');
        this.style.textContent = `
            #events .nc-event-container.mythic_event:has(.girl-information.with-skin-shards)
            #carousel.one-reward .slide.selected > img.slide-img[style*="opacity: 0;"] {
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(this.style);
    }

    tearDown() {
        this.style?.remove();
        this.style = null;
        this.hasRun = false;
    }
}
