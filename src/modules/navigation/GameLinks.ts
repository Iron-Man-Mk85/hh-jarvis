import { currentPage } from '../../game';
import { HHModule } from '../../HHModule';
import { settingHelp } from '../../settingsHelp';

const logoSelector = '#home_logo, .hh_logo';
const valorSelector = '#pov_open, [rel="path-of-valor"]';
const glorySelector = '#pog_open, [rel="path-of-glory"]';

export class GameLinks extends HHModule {
    private listeners: AbortController | null = null;

    constructor() {
        const baseKey = 'gameLinks';
        super({ name: baseKey, configSchema: {
            baseKey,
            label: settingHelp('Open game links in new tabs', 'Middle-click or Ctrl-click the game logo, Path of Valor, or Path of Glory to open that page in another tab.'),
            default: true
        } });
    }

    shouldRun() {
        return true;
    }

    run() {
        if (this.hasRun) return;

        const selector = currentPage === '/home.html' || currentPage === '/'
            ? `${logoSelector}, ${valorSelector}, ${glorySelector}`
            : logoSelector;
        const getLink = (event: MouseEvent) => {
            const target = event.target;
            if (!(target instanceof Element)) return null;

            const control = target.closest<HTMLElement>(selector);
            if (!control || control.closest('[disabled], [aria-disabled="true"]')) return null;

            const path = control.matches(logoSelector) ? '/home.html'
                : control.matches(valorSelector) ? '/path-of-valor.html' : '/path-of-glory.html';
            const anchor = target.closest<HTMLAnchorElement>('a[href]');
            if (anchor?.origin === location.origin &&
                (anchor.pathname === path || (path === '/home.html' && anchor.pathname === '/'))) {
                return { anchor, href: anchor.href };
            }
            if (anchor && anchor !== control && control.contains(anchor)) return null;

            const nativeUrl = control.getAttribute('data-url');
            const href = nativeUrl || window.HHPlusPlus.Helpers.getHref(path);
            const destination = new URL(href, location.href);
            if (destination.origin !== location.origin || destination.pathname !== path) return null;
            return { anchor: null, href: destination.href };
        };

        this.listeners = new AbortController();
        const options = { capture: true, signal: this.listeners.signal };
        const openInNewTab = (event: MouseEvent) => {
            const link = getLink(event);
            if (!link) return;

            // Stop the game's click redirect, while allowing real links to open normally.
            event.stopImmediatePropagation();
            if (link.anchor) return;
            event.preventDefault();
            window.open(link.href, '_blank', 'noopener');
        };

        window.addEventListener('click', event => {
            if (event.button === 0 && (event.ctrlKey || event.metaKey)) openInNewTab(event);
        }, options);
        window.addEventListener('auxclick', event => {
            if (event.button === 1) openInNewTab(event);
        }, options);
        window.addEventListener('mousedown', event => {
            if (event.button === 1 && getLink(event)?.anchor === null) event.preventDefault();
        }, options);
        this.hasRun = true;
    }

    tearDown() {
        this.listeners?.abort();
        this.hasRun = false;
    }
}
