import { HHModule } from '../../HHModule';
import type { ModuleSettings } from '../../HHModule';
import { currentPage } from '../../game';

export class ActivityParser extends HHModule {
    constructor() {
        const baseKey = 'activityParser'
        const configSchema = {
            baseKey,
            default: false,
            label: `Helper for GSheet management`,
            subSettings: [{
                key: 'missionCopier',
                label: `Legendary missions info copier`,
                default: false
            }]
        }
        super({name: baseKey, configSchema});
    }

    shouldRun() {
        return currentPage.includes('/activities.html')
    }

    async copyToClipboard(text: string) {
        await navigator.clipboard.writeText(text);
        const toast = document.createElement('div');
        toast.textContent = 'Copied!';
        toast.style.position = 'fixed';
        toast.style.bottom = '10px';
        toast.style.right = '10px';
        toast.style.background = 'rgba(0,0,0,0.7)';
        toast.style.color = 'white';
        toast.style.padding = '5px 10px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '9999';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1000);
    }

    run({ missionCopier }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) {return}

        if (missionCopier) {
            const entries = document.querySelectorAll('.mission_entry.legendary');
            if (!entries.length) return;

            entries.forEach(entry => {
                const imgDiv = entry.querySelector<HTMLImageElement>('.mission_image img');
                const titleAll = entry.querySelector<HTMLHeadingElement>('.mission_details h1');
                const desc = entry.querySelector<HTMLParagraphElement>('.mission_details p');

                if (imgDiv) {
                    imgDiv.style.cursor = 'pointer';
                    imgDiv.addEventListener('click', e => {
                        e.stopPropagation();
                        this.copyToClipboard(imgDiv.src);
                    });
                }

                if (titleAll) {
                    titleAll.style.cursor = 'pointer';
                    const outerTitle = titleAll.querySelector<HTMLElement>('.event-mission-content-text');
                    if (outerTitle) {
                        outerTitle.style.cursor = 'pointer';
                        outerTitle.addEventListener('click', e => {
                            e.stopPropagation();
                            this.copyToClipboard((outerTitle.textContent ?? '').trim());
                        });
                    }

                    titleAll.addEventListener('click', e => {
                        if (e.target instanceof Element && e.target.closest('.event-mission-content-text')) return;
                        const titleClone = titleAll.cloneNode(true) as HTMLHeadingElement;
                        titleClone.querySelector('.event-mission-content-text')?.remove();
                        const title = (titleClone.textContent ?? '').trim();
                        this.copyToClipboard(title);
                    });
                }

                if (desc) {
                    desc.style.cursor = 'pointer';
                    desc.addEventListener('click', e => {
                        e.stopPropagation();
                        this.copyToClipboard(desc.innerText.trim());
                    });
                }
            });

            this.hasRun = true
        }
    }
}
