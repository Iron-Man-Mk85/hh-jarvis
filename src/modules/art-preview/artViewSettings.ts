import { currentPage } from '../../game';
import { makeChoice, selectChoice } from '../../settingsChoice';
import { settingHelp } from '../../settingsHelp';
import { lsGet, lsSet } from '../../storage';
import { artFilterLabels, artFilters } from './gameArt';

const viewKey = 'RewardArtDefaultView';
const filterKey = 'RewardArtDefaultFilter';
const viewOptions = [['page', 'Page default'], ['single', 'One at a time'], ['gallery', 'Show all']] as const;
const filterOptions = artFilters.map(filter => [filter, artFilterLabels[filter]] as const);

function readOption<T extends string>(key: string, options: ReadonlyArray<readonly [T, string]>, fallback: T): T {
    try {
        const value = lsGet(key);
        return options.find(([option]) => option === value)?.[0] ?? fallback;
    } catch {
        return fallback;
    }
}

export function openArtInGallery(pageDefault = false) {
    const value = readOption(viewKey, viewOptions, 'page');
    return value === 'gallery' || (value === 'page' && pageDefault);
}

export function readDefaultArtFilter() {
    return readOption(filterKey, filterOptions, 'original');
}

function preference<T extends string>(label: string, help: string, key: string, options: ReadonlyArray<readonly [T, string]>, fallback: T) {
    const heading = document.createElement('div');
    heading.innerHTML = settingHelp(label, help);
    const group = makeChoice(label, options, value => {
        try {
            lsSet(key, value);
            selectChoice(group, value);
        } catch (err) {
            console.warn('Jarvis could not save the art viewer default:', err);
        }
    });
    selectChoice(group, readOption(key, options, fallback));
    return [heading, group];
}

export function installArtViewSettings() {
    if (currentPage !== '/home.html') return;
    const selector = '.group-panel[rel="JARVIS"] .config-setting[rel="JARVIS_eventArtPreview"]';
    window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
        const card = document.querySelector(selector);
        if (!card || card.querySelector('.jarvis-art-defaults')) return;
        const fieldset = document.createElement('fieldset');
        fieldset.className = 'jarvis-art-defaults';
        fieldset.setAttribute('aria-label', 'Art viewer defaults');
        fieldset.append(
            ...preference('Default viewer mode', 'Choose the layout used when the art viewer opens.', viewKey, viewOptions, 'page'),
            ...preference('Default artwork', 'Choose the artwork tab used when the viewer opens. If that artwork is unavailable, the viewer opens on Original.', filterKey, filterOptions, 'original')
        );
        const refreshEnabled = () => fieldset.disabled = !card.classList.contains('enabled');
        refreshEnabled();
        new MutationObserver(refreshEnabled).observe(card, { attributeFilter: ['class'] });
        card.append(fieldset);
    });
}
