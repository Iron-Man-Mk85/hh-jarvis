import { currentPage } from '../../game';
import { settingHelp } from '../../settingsHelp';
import { lsGet, lsSet } from '../../storage';

export type ContestKind = 'daily' | 'event';
export type ContestRank = 'top' | 'mine';

const CONTEST_KINDS = [['daily', 'Daily'], ['event', 'Event']] as const;
const CONTEST_RANKS = [['top', 'Top'], ['mine', 'My rank']] as const;

export function readContestSetting(key: string): unknown {
    try {
        return lsGet(key);
    } catch {
        return null;
    }
}

export function readContestDefaults() {
    const kind: ContestKind = readContestSetting('ContestKind') === 'daily' ? 'daily' : 'event';
    const rank: ContestRank = readContestSetting('ContestRankStart') === 'top' ? 'top' : 'mine';
    return { kind, rank };
}

export function readPinnedRank(id: string, fallback: ContestRank): ContestRank {
    const saved = readContestSetting('ContestPinnedRank');
    if (saved && typeof saved === 'object' && 'id' in saved && saved.id === id && 'rank' in saved) {
        if (saved.rank === 'mine' || saved.rank === 'top') return saved.rank;
    }
    return fallback;
}

export function makeRankChoice(label: string, select: (rank: ContestRank) => void) {
    return makeChoice(label, CONTEST_RANKS, select);
}

function makeChoice<T extends string>(label: string, options: ReadonlyArray<readonly [T, string]>, select: (value: T) => void) {
    const group = document.createElement('span');
    group.className = 'jarvis-contest-choice';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', label);
    group.addEventListener('keydown', event => event.stopPropagation());
    for (const [value, text] of options) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = text;
        button.dataset.contestChoice = value;
        button.addEventListener('click', event => {
            event.stopPropagation();
            select(value);
        });
        group.appendChild(button);
    }
    return group;
}

export function selectContestChoice(group: HTMLElement, value: string) {
    for (const button of group.querySelectorAll('button')) {
        button.setAttribute('aria-pressed', String(button.dataset.contestChoice === value));
    }
}

export function installContestSettings() {
    if (currentPage !== '/home.html') return;

    const selector = '.group-panel[rel="JARVIS"] .config-setting[rel="JARVIS_contestStart"]';
    window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
        const card = document.querySelector(selector);
        if (!card || card.querySelector('.jarvis-contest-settings')) return;

        const fieldset = document.createElement('fieldset');
        fieldset.className = 'jarvis-contest-settings';
        fieldset.setAttribute('aria-label', 'Contest startup defaults');
        const save = (key: string, value: string, group: HTMLElement) => {
            try {
                lsSet(key, value);
                selectContestChoice(group, value);
            } catch (err) {
                console.warn('Jarvis could not save the contest default:', err);
            }
        };
        const kinds = makeChoice('Preferred contest', CONTEST_KINDS, value => save('ContestKind', value, kinds));
        const ranks = makeRankChoice('Default leaderboard position', value => save('ContestRankStart', value, ranks));
        const defaults = readContestDefaults();
        selectContestChoice(kinds, defaults.kind);
        selectContestChoice(ranks, defaults.rank);

        const kindLabel = document.createElement('div');
        kindLabel.innerHTML = settingHelp('Preferred contest', 'Daily opens the first active daily contest. Event follows the game and opens the bottom active contest.');
        const rankLabel = document.createElement('div');
        rankLabel.innerHTML = settingHelp('Leaderboard start', 'Open at the top or at your rank. A starred contest can have its own position.');
        fieldset.append(kindLabel, kinds, rankLabel, ranks);
        const refreshEnabled = () => fieldset.disabled = !card.classList.contains('enabled');
        refreshEnabled();
        new MutationObserver(refreshEnabled).observe(card, { attributeFilter: ['class'] });
        card.appendChild(fieldset);
    });
}
