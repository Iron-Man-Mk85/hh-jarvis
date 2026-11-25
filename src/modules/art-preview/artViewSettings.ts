import { currentPage } from '../../game';
import { lsGet, lsSet } from '../../storage';

const storageKey = 'RewardArtDefaultView';

function readDefaultView() {
    try {
        const value = lsGet(storageKey);
        if (value === 'single' || value === 'gallery') return value;
    } catch {
        // An invalid or unavailable setting falls back to the page's default.
    }
    return 'page';
}

export function openArtInGallery(pageDefault = false) {
    const value = readDefaultView();
    return value === 'gallery' || (value === 'page' && pageDefault);
}

export function installArtViewSettings() {
    if (currentPage !== '/home.html') return;
    const selector = '.group-panel[rel="JARVIS"] .config-setting[rel="JARVIS_eventArtPreview"]';
    window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
        const card = document.querySelector(selector);
        if (!card || card.querySelector('.jarvis-art-default-view')) return;
        const label = document.createElement('label');
        label.className = 'jarvis-art-default-view';
        label.textContent = 'Default viewer mode';
        const select = document.createElement('select');
        select.append(new Option('Page default', 'page'), new Option('One at a time', 'single'), new Option('Show all', 'gallery'));
        select.value = readDefaultView();
        select.addEventListener('keydown', event => event.stopPropagation());
        select.addEventListener('change', () => {
            try {
                lsSet(storageKey, select.value);
            } catch (err) {
                select.value = readDefaultView();
                console.warn('Jarvis could not save the default art viewer mode:', err);
            }
        });
        const refreshEnabled = () => select.disabled = !card.classList.contains('enabled');
        refreshEnabled();
        new MutationObserver(refreshEnabled).observe(card, { attributeFilter: ['class'] });
        label.append(select);
        card.append(label);
    });
}
