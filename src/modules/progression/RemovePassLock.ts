import { HHModule } from '../../HHModule';
import type { ModuleSettings } from '../../HHModule';
import { currentPage } from '../../game';

export class RemovePassLock extends HHModule {
    private readonly selectorToFind = '.lock_yellow_icn';
    private readonly classToRemove = 'lock_yellow_icn';

    constructor() {
        const baseKey = 'removePassLock'
        const configSchema = {
            baseKey,
            default: false,
            label: `Remove the lock icon in PoV/PoG Pass/Pass+ for easier reading`,
            subSettings: [{
                key: 'pov',
                label: `Remove in PoV`,
                default: true
            }, {
                key: 'pog',
                label: `Remove in PoG`,
                default: true
            }]
        }
        super({name: baseKey, configSchema});
    }

    shouldRun() {
        return currentPage.includes('/path-of-valor.html') || currentPage.includes('/path-of-glory.html')
    }

    observeUntil(selector: string, callback: (elements: NodeListOf<Element>) => void, { once = true, timeout = 5000 } = {}) {
        let timer: number | null = null;
        let elements = document.querySelectorAll(selector);
        if (elements.length) {
            callback(elements);
            if (once) return;
        }

        const observer = new MutationObserver(() => {
            elements = document.querySelectorAll(selector);
            if (elements.length) {
                if (once) {
                    observer.disconnect();
                    if (timer) clearTimeout(timer);
                }
                callback(elements);
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });

        if (Number.isFinite(timeout) && timeout > 0) {
            timer = setTimeout(() => {
                observer.disconnect();
            }, timeout);
        }
    }

    removeClassWhenSelectorAvailable(selector: string, classToRemove: string, { once = true, timeout = 5000 } = {}) {
        this.observeUntil(selector, (elements) => {
            elements.forEach(el => el.classList.remove(classToRemove));
        }, { timeout, once });
    }

    run({ pov, pog }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) {return}

        if (currentPage.includes('/path-of-valor.html') && pov) {
            this.removeClassWhenSelectorAvailable(this.selectorToFind, this.classToRemove);
        } else if (currentPage.includes('/path-of-glory.html') && pog) {
            this.removeClassWhenSelectorAvailable(this.selectorToFind, this.classToRemove);
        }

        this.hasRun = true
    }
}
