import { currentPage } from '../../game';
import { settingHelp } from '../../settingsHelp';
import { lsGet, lsRm, lsSet } from '../../storage';

export type ContestKind = 'daily' | 'event';
export type ContestRank = 'top' | 'mine';

const CONTEST_KINDS = [['daily', 'Daily'], ['event', 'Event']] as const;
const CONTEST_EVENTS = [['any', 'Any'], ['cbc', 'CbC'], ['ccc', 'CCC'], ['lc', 'LC']] as const;
const CONTEST_RANKS = [['top', 'Top'], ['mine', 'My rank']] as const;

export type ContestEvent = Exclude<(typeof CONTEST_EVENTS)[number][0], 'any'>;

export function readContestSetting(key: string): unknown {
    try {
        return lsGet(key);
    } catch {
        return null;
    }
}

export const CONTEST_SKIPS_KEY = 'ContestSkips';

function contestSkipDay() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export function readContestSkips(day = contestSkipDay()): Set<string> {
    const saved = readContestSetting(CONTEST_SKIPS_KEY);
    if (!saved || typeof saved !== 'object' || !('day' in saved) || saved.day !== day ||
        !('ids' in saved) || !Array.isArray(saved.ids)) return new Set();
    return new Set(saved.ids.filter(id => typeof id === 'string'));
}

export function toggleContestSkip(id: string) {
    const day = contestSkipDay();
    const ids = readContestSkips(day);
    if (!ids.delete(id)) ids.add(id);
    if (ids.size) lsSet(CONTEST_SKIPS_KEY, { day, ids: [...ids] });
    else lsRm(CONTEST_SKIPS_KEY);
}

export function readContestDefaults() {
    const kind: ContestKind = readContestSetting('ContestKind') === 'daily' ? 'daily' : 'event';
    const savedEvent = readContestSetting('ContestEvent');
    const event = CONTEST_EVENTS.find(([value]) => value === savedEvent)?.[0] ?? 'any';
    const rank: ContestRank = readContestSetting('ContestRankStart') === 'top' ? 'top' : 'mine';
    return { kind, event, rank };
}

export function readContestRank(id: string, fallback: ContestRank): ContestRank {
    const ranks = readContestSetting('ContestRanks');
    if (ranks && typeof ranks === 'object' && Object.hasOwn(ranks, id)) {
        const rank = (ranks as Record<string, unknown>)[id];
        if (rank === 'mine' || rank === 'top') return rank;
    }

    // Older versions stored a rank override for a single contest.
    const saved = readContestSetting('ContestPinnedRank');
    if (saved && typeof saved === 'object' && 'id' in saved && String(saved.id) === id && 'rank' in saved) {
        if (saved.rank === 'mine' || saved.rank === 'top') return saved.rank;
    }
    return fallback;
}

export function saveContestRank(id: string, rank: ContestRank) {
    const saved = readContestSetting('ContestRanks');
    const ranks = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    lsSet('ContestRanks', { ...ranks, [id]: rank });
}

export function pruneContestRanks(available: ReadonlySet<string>) {
    const saved = readContestSetting('ContestRanks');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        const entries = Object.entries(saved);
        const kept = entries.filter(([id, rank]) => available.has(id) && (rank === 'top' || rank === 'mine'));
        if (!kept.length) lsRm('ContestRanks');
        else if (kept.length !== entries.length) lsSet('ContestRanks', Object.fromEntries(kept));
    }

    const legacy = readContestSetting('ContestPinnedRank');
    if (legacy && typeof legacy === 'object' && 'id' in legacy && !available.has(String(legacy.id))) {
        lsRm('ContestPinnedRank');
    }
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
                return true;
            } catch (err) {
                console.warn('Jarvis could not save the contest default:', err);
                return false;
            }
        };
        const eventLabel = document.createElement('div');
        eventLabel.innerHTML = settingHelp('Event type', 'Prefer CbC (Cumback Contest), CCC (Crazy Cumback Contest), or LC (Legendary Contest) when active. Any opens the bottom active contest, as does an unavailable event type.');
        const events = makeChoice('Event type', CONTEST_EVENTS, value => save('ContestEvent', value, events));
        const showEvents = (kind: ContestKind) => eventLabel.hidden = events.hidden = kind === 'daily';
        const kinds = makeChoice('Preferred contest', CONTEST_KINDS, value => {
            if (save('ContestKind', value, kinds)) showEvents(value);
        });
        const ranks = makeRankChoice('Default leaderboard position', value => save('ContestRankStart', value, ranks));
        const defaults = readContestDefaults();
        selectContestChoice(kinds, defaults.kind);
        selectContestChoice(events, defaults.event);
        selectContestChoice(ranks, defaults.rank);
        showEvents(defaults.kind);

        const kindLabel = document.createElement('div');
        kindLabel.innerHTML = settingHelp('Preferred contest', 'Daily opens the first active daily contest. Event can prefer an event type or follow the game and open the bottom active contest.');
        const rankLabel = document.createElement('div');
        rankLabel.innerHTML = settingHelp('Leaderboard start', 'Open at the top or at your rank. A position chosen on a contest card takes priority.');
        fieldset.append(kindLabel, kinds, eventLabel, events, rankLabel, ranks);
        const refreshEnabled = () => fieldset.disabled = !card.classList.contains('enabled');
        refreshEnabled();
        new MutationObserver(refreshEnabled).observe(card, { attributeFilter: ['class'] });
        card.appendChild(fieldset);
    });
}
