import { settingHelp } from '../../settingsHelp';
import { HHModule, type ModuleSettings } from '../../HHModule';
import { $, currentPage } from '../../game';
import { LS_CONFIG_NAME, lsGet, lsSet, lsRm } from '../../storage';
import { CONTEST_SKIPS_KEY, makeRankChoice, pruneContestRanks, readContestDefaults, readContestRank,
    readContestSetting, readContestSkips, saveContestRank, selectContestChoice, toggleContestSkip,
    type ContestEvent, type ContestKind } from './contestPreferences';
import { positionContestShortcuts, renderContestShortcuts } from './contestShortcuts';

type ContestCategory = ContestKind | ContestEvent;
const CONTEST_SHORT_LABELS: Record<ContestCategory, string> = {
    daily: 'DC', cbc: 'CbC', ccc: 'CCC', lc: 'LC', event: 'Event'
};
const CONTEST_TITLE_SELECTOR = '.contest_title, .contest_name, h3, h4, h5';
const CONTEST_CONTROL_SELECTOR = '.jarvis-contest-pin, .jarvis-contest-skip, .jarvis-contest-rank-start';
const INTERACTIVE_CONTENT = 'a[href], button, input, select, textarea, [contenteditable]:not([contenteditable="false"]), [tabindex]';
const protectedPanes = new Set<HTMLElement>();
let restoreScrollIntoView: (() => void) | undefined;

function guardScrollIntoView(pane: HTMLElement) {
    if (!protectedPanes.size) {
        const previous = Element.prototype.scrollIntoView;
        const guarded = function (this: Element, options?: boolean | ScrollIntoViewOptions) {
            // scrollIntoView can move a pane without calling its scroll methods.
            if (Array.from(protectedPanes).some(scroller => scroller.contains(this))) return;
            previous.call(this, options);
        };
        Element.prototype.scrollIntoView = guarded;
        restoreScrollIntoView = () => {
            if (Element.prototype.scrollIntoView === guarded) Element.prototype.scrollIntoView = previous;
        };
    }
    protectedPanes.add(pane);

    return () => {
        protectedPanes.delete(pane);
        if (protectedPanes.size) return;
        restoreScrollIntoView?.();
        restoreScrollIntoView = undefined;
    };
}

function getContestCategory(category: string | undefined): ContestCategory | null {
    switch (category?.trim().toLowerCase().replace(/[- ]+/g, '_')) {
        case 'daily':
        case 'daily_contest': return 'daily';
        case 'cumback':
        case 'cumback_contest':
        case 'cbc': return 'cbc';
        case 'crazy_cumback':
        case 'crazy_cumback_contest':
        case 'ccbc':
        case 'ccc': return 'ccc';
        case 'legendary':
        case 'legendary_contest':
        case 'lc': return 'lc';
        default: return category ? 'event' : null;
    }
}

interface ContestCard {
    id: string;
    card: HTMLElement;
    header: HTMLElement;
    title: HTMLElement | null;
    label: string;
    category: ContestCategory | null;
    ended: boolean;
}

export function armContestStartupGuard() {
    'use strict';

    if (location.pathname !== '/activities.html' || new URLSearchParams(location.search).get('tab') !== 'contests') return;

    try {
        if (JSON.parse(localStorage.getItem('HHPlusPlusConfig') ?? 'null')?.JARVIS_contestStart === false) return;
    } catch {
        return;
    }

    // Keep both panes out of view until the chosen contest and its leaderboard are positioned.
    const guard = document.createElement('style');
    guard.id = 'jarvis-contest-startup';
    guard.textContent = `
        #contests .left_part .scroll_area,
        #contests .right_part {
            opacity: 0 !important;
            transition: none !important;
            pointer-events: none;
        }
    `;
    const observer = new MutationObserver(() => {
        if (!document.documentElement) return;
        document.documentElement.appendChild(guard);
        observer.disconnect();
    });
    if (document.documentElement) document.documentElement.appendChild(guard);
    else observer.observe(document, { childList: true });

    setTimeout(() => {
        observer.disconnect();
        guard.remove();
    }, 4000);
}

export class ContestStart extends HHModule {
    private preference = '';
    private startupPending = false;
    private defaults = readContestDefaults();
    private list: HTMLElement | null = null;
    private right: HTMLElement | null = null;
    private restoringCard: HTMLElement | null = null;
    private reposition: (() => void) | null = null;
    private stopJump: ((finish?: boolean) => void) | null = null;
    private stopSwitchScroll = true;
    private switchScroll: { restore: () => void; stop: () => void } | null = null;
    private observer: MutationObserver | null = null;
    private titleSizes: ResizeObserver | null = null;
    private readonly titleLabels = new Map<HTMLElement, HTMLElement>();
    private readonly focusablePanes = new Set<HTMLElement>();
    private prunedRankRoster: string | null = null;
    private listeners: AbortController | null = null;
    private skipResetTimer: number | undefined;

    constructor() {
        const baseKey = 'contestStart'
        const configSchema = {
            baseKey,
            default: true,
            label: settingHelp("Contest startup", "Open the preferred contest and rank on load, and switch active contests from the header. A starred contest takes priority on load."),
            subSettings: [{
                key: 'noSwitchScroll',
                label: settingHelp('Stop scrolling on contest switches', 'Keep the contest list in place when you switch by clicking a card. The leaderboard opens at your preferred position, and you can still scroll by hand.'),
                default: true
            }]
        }
        super({ name: baseKey, configSchema });
    }

    shouldRun() {
        return currentPage === '/activities.html';
    }

    getContests(list: HTMLElement, finished: ReadonlySet<string>): ContestCard[] {
        const active = new Map(Object.values(window.contests?.active || {})
            .filter(contest => contest?.id_contest != null)
            .map(contest => [String(contest.id_contest), contest]));

        return Array.from(list.querySelectorAll<HTMLElement>('.contest[id_contest]')).flatMap(card => {
            const id = card.getAttribute('id_contest');
            if (!id) return [];
            const contest = active.get(id);
            const header = card.querySelector<HTMLElement>('.contest_header');
            const ended = finished.has(id);
            if (!header || (!ended && !contest && !header.matches('.in_progress'))) return [];

            const title = header.querySelector<HTMLElement>(CONTEST_TITLE_SELECTOR);
            const name = title && Array.from(title.childNodes)
                .filter(node => !(node instanceof Element) || !node.matches(CONTEST_CONTROL_SELECTOR))
                .map(node => node.textContent).join('').trim();
            const category = getContestCategory(contest?.category_type);
            return [{
                id, card, header, title, ended,
                category,
                label: String(name || contest?.name || contest?.title ||
                    (category === 'daily' ? 'Daily contest' : 'Contest')).trim()
            }];
        });
    }

    getTarget(contests: ContestCard[], skipped: ReadonlySet<string>) {
        const unskipped = contests.filter(({ id }) => !skipped.has(id));
        if (!unskipped.length && contests.length && document.readyState !== 'complete') return;

        const candidates = unskipped.length ? unskipped : contests;
        if (this.preference) {
            const pinned = contests.find(contest => contest.id === this.preference);
            if (!pinned || candidates.includes(pinned)) return pinned;
        }

        if (this.defaults.kind === 'event') {
            if (this.defaults.event !== 'any') {
                const event = [...candidates].reverse().find(contest => contest.category === this.defaults.event);
                if (event || document.readyState !== 'complete') return event;
            }
            return candidates.at(-1);
        }
        return candidates.find(contest => contest.category === 'daily') ??
            candidates.find(contest => contest.category === null) ?? candidates[0];
    }

    clearExpiredPin(list: HTMLElement, contests: ContestCard[], finished: ReadonlySet<string>) {
        if (!this.preference || contests.some(({ id }) => id === this.preference)) return;

        const active = window.contests?.active;
        const missing = document.readyState === 'complete' && list.querySelector('.contest_header') &&
            active && !Object.values(active).some(contest => String(contest?.id_contest) === this.preference);
        if (!finished.has(this.preference) && !missing) return;

        const expiredId = this.preference;
        this.preference = '';
        this.stopJump?.(false);
        try {
            if (String(lsGet('ContestStartId')) === expiredId) lsRm('ContestStartId');
        } catch (err) {
            console.warn('Jarvis could not clear the expired contest preference:', err);
        }
    }

    pruneUnavailableRanks(list: HTMLElement, finished: ReadonlySet<string>) {
        const data = window.contests;
        // A partial roster can be visible while the game loads the contest tab.
        if (document.readyState !== 'complete' || !data?.active || !data.finished) return;

        const available = new Set(finished);
        for (const contest of Object.values(data.active)) {
            if (contest?.id_contest != null) available.add(String(contest.id_contest));
        }
        for (const card of list.querySelectorAll('.contest[id_contest]')) {
            const id = card.getAttribute('id_contest');
            if (id) available.add(id);
        }
        const roster = Array.from(available).sort().join(',');
        if (this.prunedRankRoster === roster) return;
        this.prunedRankRoster = roster;
        try {
            pruneContestRanks(available);
        } catch (err) {
            console.warn('Jarvis could not clean up old contest rank choices:', err);
        }
    }

    updateCardControls(list: HTMLElement, contests: ContestCard[], skipped: ReadonlySet<string>) {
        const hosts = new Set(contests.map(({ title, header }) => title || header));
        for (const control of list.querySelectorAll(CONTEST_CONTROL_SELECTOR)) {
            if (!control.parentElement || !hosts.has(control.parentElement)) control.remove();
        }
        for (const [title, text] of this.titleLabels) {
            if (hosts.has(title) && text.parentElement === title) continue;
            this.titleSizes?.unobserve(text);
            if (text.parentElement === title) text.replaceWith(...text.childNodes);
            title.classList.remove('jarvis-contest-title', 'jarvis-contest-title-stacked');
            this.titleLabels.delete(title);
        }

        for (const { id, title, header, label } of contests) {
            const host = title || header;
            let pin = host.querySelector<HTMLButtonElement>(':scope > .jarvis-contest-pin');
            if (!pin) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'jarvis-contest-pin';
                button.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    const contestId = button.closest('.contest[id_contest]')?.getAttribute('id_contest');
                    if (!contestId) return;

                    const next = this.preference === contestId ? '' : contestId;
                    try {
                        if (next) lsSet('ContestStartId', next);
                        else lsRm('ContestStartId');
                        this.preference = next;
                        this.startupPending = false;
                        this.stopJump?.();
                    } catch (err) {
                        console.warn('Jarvis could not save the contest preference:', err);
                    }
                    this.refresh();
                });
                pin = host.appendChild(button);
            }
            const pinned = this.preference === id;
            pin.setAttribute('aria-pressed', String(pinned));
            pin.setAttribute('aria-label', pinned ? `Unpin ${label}` : `Pin ${label} to open on reload`);
            pin.title = pinned ? 'Pinned. Click to unpin this contest.' : 'Open this contest when the page reloads';

            let skip = host.querySelector<HTMLButtonElement>(':scope > .jarvis-contest-skip');
            if (!skip) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'jarvis-contest-skip';
                button.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    const contestId = button.closest('.contest[id_contest]')?.getAttribute('id_contest');
                    if (!contestId) return;
                    try {
                        toggleContestSkip(contestId);
                        this.refresh(contestId);
                    } catch (err) {
                        console.warn('Jarvis could not save the contest skip:', err);
                    }
                });
                pin.after(button);
                skip = button;
            }
            const isSkipped = skipped.has(id);
            skip.setAttribute('aria-pressed', String(isSkipped));
            skip.setAttribute('aria-label', `Skip ${label} for today`);
            skip.title = isSkipped ? 'Skipped for today. Click to clear the mark.' : 'Mark this contest as skipped for today';

            let position = host.querySelector<HTMLElement>(':scope > .jarvis-contest-rank-start');
            if (!position) {
                const choice = makeRankChoice('Contest leaderboard start', rank => {
                    const contestId = choice.closest('.contest[id_contest]')?.getAttribute('id_contest');
                    if (!contestId) return;
                    try {
                        saveContestRank(contestId, rank);
                        selectContestChoice(choice, rank);
                    } catch (err) {
                        console.warn('Jarvis could not save the leaderboard position:', err);
                        return;
                    }
                    if (this.right && this.getSelectedContestId(list, this.right) === contestId) {
                        this.stopJump?.();
                        this.positionSwitch(list, this.right, contestId);
                    }
                });
                choice.classList.add('jarvis-contest-rank-start');
                choice.title = 'Leaderboard position for this contest';
                skip.after(choice);
                position = choice;
            }
            selectContestChoice(position, readContestRank(id, this.defaults.rank));

            if (!title) continue;
            let text = this.titleLabels.get(title);
            if (!text) {
                text = document.createElement('span');
                text.className = 'jarvis-contest-title-label';
                text.append(...Array.from(title.childNodes).filter(node => node !== pin && node !== skip && node !== position));
                title.prepend(text);
                title.classList.add('jarvis-contest-title');
                this.titleLabels.set(title, text);
                this.titleSizes?.observe(text);
            }
            if (text.title !== label) {
                text.title = label;
                this.fitTitle(text);
            }
        }
    }

    fitTitle(text: HTMLElement) {
        const heading = text.parentElement;
        if (!heading?.clientWidth) return;

        heading.classList.remove('jarvis-contest-title-stacked');
        text.style.removeProperty('font-size');
        const minimumReadableWidth = 4 * parseFloat(getComputedStyle(text).fontSize);
        if (text.clientWidth < minimumReadableWidth && text.scrollWidth > text.clientWidth) {
            heading.classList.add('jarvis-contest-title-stacked');
        }
        if (text.scrollWidth > text.clientWidth) text.style.fontSize = '.8em';
    }

    getSelectedContestId(list: HTMLElement, right: HTMLElement) {
        const selected = list.querySelector('.contest_header_active')?.closest('.contest[id_contest]');
        if (selected) return selected.getAttribute('id_contest');

        const panels = Array.from(right.querySelectorAll('.ranking[id_contest]'))
            .filter(panel => panel.getClientRects().length && getComputedStyle(panel).visibility === 'visible');
        return panels.length === 1 ? panels[0].getAttribute('id_contest') : null;
    }

    showLeaderboard(right: HTMLElement, contestId: string | null) {
        if (!contestId) {
            right.querySelectorAll('.jarvis-contest-other').forEach(panel => panel.classList.remove('jarvis-contest-other'));
            return;
        }
        for (const panel of right.querySelectorAll('.ranking[id_contest]')) {
            panel.classList.toggle('jarvis-contest-other', panel.getAttribute('id_contest') !== contestId);
        }
    }

    getOwnRow(board: HTMLElement) {
        const own = board.querySelector('.leadTable tr.lead_table_default');
        if (own) return own;

        const heroId = (window.shared?.Hero || window.Hero)?.infos?.id;
        if (heroId == null) return null;

        return Array.from(board.querySelectorAll('.leadTable tr[sorting_id]'))
            .find(row => row.getAttribute('sorting_id') === String(heroId));
    }

    getLeaderboardScroller(right: HTMLElement, id: string) {
        return Array.from(right.querySelectorAll('.ranking[id_contest]'))
            .find(panel => panel.getAttribute('id_contest') === id)?.querySelector<HTMLElement>('.lead_table_view');
    }

    updateShortcuts(list: HTMLElement, right: HTMLElement, contests: ContestCard[], skipped: ReadonlySet<string>) {
        const canvas = list.closest<HTMLElement>('#contests');
        if (!canvas) return;

        const shortcuts = contests.map(({ id, header, label, category }) => {
            const board = this.getLeaderboardScroller(right, id);
            const rank = header.querySelector('.personal_rewards .rank')?.textContent?.trim() ||
                (board && this.getOwnRow(board)?.querySelector('td')?.textContent?.trim()) || '';
            return { id, name: label, category: category ? CONTEST_SHORT_LABELS[category] : 'Contest', rank,
                skipped: skipped.has(id) };
        });
        renderContestShortcuts(canvas, shortcuts, this.getSelectedContestId(list, right), id => this.openShortcut(id));
    }

    openShortcut(id: string) {
        const { list, right } = this;
        if (!list || !right) return;

        const card = list.querySelector<HTMLElement>(`.contest[id_contest="${CSS.escape(id)}"]`);
        const header = card?.querySelector<HTMLElement>('.contest_header');
        if (!card || !header || header.matches('.ended') || card.matches('.ended')) return;

        const alreadySelected = this.getSelectedContestId(list, right) === id;
        this.stopJump?.();
        this.prepareSwitch(list, right, id, card);
        if (!alreadySelected) (header.querySelector<HTMLElement>(CONTEST_TITLE_SELECTOR) || header).click();
        this.refresh();
    }

    prepareSwitch(list: HTMLElement, right: HTMLElement, id: string | null, shortcutCard?: HTMLElement) {
        this.startupPending = false;
        if (id) this.positionSwitch(list, right, id, shortcutCard);
        this.showLeaderboard(right, null);
        document.getElementById('jarvis-contest-startup')?.remove();
    }

    focusScrollPane(pane: HTMLElement, target: Element) {
        const control = target.closest(INTERACTIVE_CONTENT);
        if (control && control !== pane && pane.contains(control)) return;

        // Chromium scrolls the focused pane on Home, End, and the arrow keys.
        if (!pane.hasAttribute('tabindex')) {
            pane.tabIndex = -1;
            this.focusablePanes.add(pane);
        }
        pane.focus({ preventScroll: true });
    }

    lockScroll(scroller: HTMLElement, guardDescendants = false) {
        $(scroller).stop(true, false);
        // The game can start another jQuery tween after load. Block its writes on this pane only.
        const ignoreScroll = () => {};
        const get = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop')?.get;
        const descriptors = Object.entries({
            scrollTop: { get, set: ignoreScroll },
            scroll: { value: ignoreScroll, writable: true },
            scrollTo: { value: ignoreScroll, writable: true },
            scrollBy: { value: ignoreScroll, writable: true }
        }).filter(([key]) => !Object.hasOwn(scroller, key));
        for (const [key, descriptor] of descriptors) {
            Object.defineProperty(scroller, key, { ...descriptor, configurable: true });
        }
        const releaseDescendants = guardDescendants ? guardScrollIntoView(scroller) : undefined;

        return () => {
            $(scroller).stop(true, false);
            releaseDescendants?.();
            for (const [key, descriptor] of descriptors) {
                const current = Object.getOwnPropertyDescriptor(scroller, key);
                if (current && current.value === descriptor.value && current.set === descriptor.set) Reflect.deleteProperty(scroller, key);
            }
        };
    }

    jumpTo(scroller: HTMLElement, target: Element | null | undefined, center = false) {
        let top = 0;
        if (target) {
            const bounds = scroller.getBoundingClientRect();
            const scale = bounds.height / scroller.offsetHeight;
            if (!scale) return;

            const item = target.getBoundingClientRect();
            top = scroller.scrollTop + (item.top - bounds.top) / scale - scroller.clientTop;
            if (center) top -= (scroller.clientHeight - item.height / scale) / 2;
        }
        this.scrollInstantly(scroller, top);
    }

    scrollInstantly(scroller: HTMLElement, position: number) {
        const top = Math.max(0, Math.min(scroller.scrollHeight - scroller.clientHeight, position));
        if (Math.abs(top - scroller.scrollTop) >= 1) {
            const scrollTo = Element.prototype.scrollTo as (options: ScrollToOptions) => void;
            scrollTo.call(scroller, { top, behavior: 'instant' });
        }
    }

    positionSwitch(list: HTMLElement, right: HTMLElement, id: string, shortcutCard?: HTMLElement) {
        this.switchScroll?.stop();

        const listTop = list.scrollTop;
        const atOwnRank = readContestRank(id, this.defaults.rank) === 'mine';
        const releaseList = this.stopSwitchScroll || shortcutCard ? this.lockScroll(list, true) : undefined;
        let manualList = false;
        let manualBoard = false;
        let board: HTMLElement | null | undefined;
        let releaseBoard: (() => void) | undefined;
        const restore = () => {
            const next = this.getLeaderboardScroller(right, id);
            if (next !== board) {
                releaseBoard?.();
                board = next;
                releaseBoard = board ? this.lockScroll(board, true) : undefined;
                manualBoard = false;
            }
            if (!manualList && releaseList) {
                if (shortcutCard && list.contains(shortcutCard)) this.jumpTo(list, shortcutCard);
                else this.scrollInstantly(list, listTop);
            }
            if (!manualBoard && board?.clientHeight && this.getSelectedContestId(list, right) === id) {
                this.jumpTo(board, atOwnRank ? this.getOwnRow(board) : null, atOwnRank);
            }
        };

        const handlers = new AbortController();
        const options = { capture: true, passive: true, signal: handlers.signal };
        const stop = () => {
            clearTimeout(timer);
            handlers.abort();
            releaseList?.();
            releaseBoard?.();
            this.switchScroll = null;
        };
        const timer = setTimeout(stop, 4000);
        const onScroll = (event: Event) => {
            if ((releaseList && event.target === list) || event.target === board) restore();
        };
        // Let user input move its pane without allowing a delayed game animation to take over.
        const onManualInput = (event: Event) => {
            if (!event.isTrusted || !(event.target instanceof Node)) return;
            if (list.contains(event.target)) manualList = true;
            if (board?.contains(event.target) && this.getSelectedContestId(list, right) === id) manualBoard = true;
        };
        for (const pane of [list, right]) {
            pane.addEventListener('scroll', onScroll, options);
            for (const type of ['wheel', 'touchmove', 'pointerdown']) pane.addEventListener(type, onManualInput, options);
        }
        document.addEventListener('keydown', event => {
            if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) onManualInput(event);
        }, options);
        this.switchScroll = { restore, stop };
        restore();
    }

    openContest(list: HTMLElement, right: HTMLElement, { id, card, header, title }: ContestCard) {
        for (const pane of [list, right]) pane.classList.add('jarvis-contest-instant', 'jarvis-contest-loading');
        const rank = readContestRank(id, this.defaults.rank);
        const placeAtOwnRank = rank === 'mine';
        const releaseList = this.lockScroll(list);
        let board: HTMLElement | null | undefined;
        let releaseBoard: (() => void) | undefined;
        let positioned = false;
        let lastAttempt: string | null | undefined;

        const updateBoard = () => {
            const next = this.getLeaderboardScroller(right, id);
            if (board === next) return;
            releaseBoard?.();
            board = next;
            releaseBoard = board ? this.lockScroll(board) : undefined;
        };
        const reveal = () => {
            for (const pane of [list, right]) pane.classList.remove('jarvis-contest-loading');
            document.getElementById('jarvis-contest-startup')?.remove();
        };
        const restore = () => {
            if (!list.isConnected || !right.isConnected || !list.contains(card)) return;

            updateBoard();
            const selected = this.getSelectedContestId(list, right);
            if (selected !== id && selected !== lastAttempt) {
                lastAttempt = selected;
                this.showLeaderboard(right, null);
                (title || header).click();
                updateBoard();
            }
            if (!board?.clientHeight || this.getSelectedContestId(list, right) !== id ||
                (placeAtOwnRank && !board.querySelector('.leadTable'))) return;
            lastAttempt = undefined;
            this.showLeaderboard(right, id);
            this.jumpTo(list, card);
            this.jumpTo(board, placeAtOwnRank ? this.getOwnRow(board) : null, placeAtOwnRank);
            if (!positioned) {
                positioned = true;
                clearTimeout(timer);
                reveal();
            }
        };

        // Correct browser-driven moves, such as scrollIntoView on a leaderboard row, before paint.
        const onScroll = (event: Event) => {
            if (event.target === list || event.target === board) restore();
        };
        const inputEvents = ['pointerdown', 'touchstart', 'wheel', 'click'];
        const onInput = (event: Event) => {
            if (event.isTrusted) stop();
        };
        const stopOnKey = (event: KeyboardEvent) => {
            if (event.isTrusted && ['Tab', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Enter', ' '].includes(event.key)) stop();
        };
        const afterLoad = () => {
            lastAttempt = undefined;
            restore();
        };
        const stop = (finish = true) => {
            releaseList();
            releaseBoard?.();
            for (const pane of [list, right]) {
                pane.removeEventListener('scroll', onScroll, true);
                pane.classList.remove('jarvis-contest-instant', 'jarvis-contest-loading');
            }
            for (const event of inputEvents) document.removeEventListener(event, onInput, true);
            document.removeEventListener('keydown', stopOnKey, true);
            window.removeEventListener('load', afterLoad);
            clearTimeout(timer);
            this.stopJump = null;
            this.reposition = null;
            this.restoringCard = null;
            if (finish) {
                this.startupPending = false;
                reveal();
            }
        };
        const timer = setTimeout(stop, 4000);
        this.stopJump = stop;
        this.reposition = restore;
        this.restoringCard = card;
        for (const pane of [list, right]) {
            pane.addEventListener('scroll', onScroll, { passive: true, capture: true });
        }
        for (const event of inputEvents) document.addEventListener(event, onInput, { passive: true, capture: true });
        document.addEventListener('keydown', stopOnKey, true);
        if (document.readyState !== 'complete') window.addEventListener('load', afterLoad, { once: true });
        restore();
    }

    refresh(toggledSkipId?: string) {
        const list = document.querySelector<HTMLElement>('#contests .left_part .scroll_area');
        const right = document.querySelector<HTMLElement>('#contests .right_part');
        for (const pane of this.focusablePanes) {
            if (pane === list || right?.contains(pane)) continue;
            if (pane.tabIndex === -1) pane.removeAttribute('tabindex');
            this.focusablePanes.delete(pane);
        }
        if (this.list !== list || this.right !== right) this.switchScroll?.stop();
        if (this.stopJump && (this.list !== list || this.right !== right || !list?.contains(this.restoringCard))) {
            this.stopJump(false);
            if (this.right) this.showLeaderboard(this.right, null);
        }
        this.list = list;
        this.right = right;
        if (!list || !right || !list.getClientRects().length || getComputedStyle(list).visibility !== 'visible') return;

        const finished = new Set(Object.values(window.contests?.finished || {})
            .filter(contest => contest?.id_contest != null).map(contest => String(contest.id_contest)));
        for (const ended of list.querySelectorAll('.contest.ended, .contest_header.ended')) {
            const id = ended.closest('.contest[id_contest]')?.getAttribute('id_contest');
            if (id) finished.add(id);
        }
        const cards = this.getContests(list, finished);
        const contests = cards.filter(card => !card.ended);
        this.pruneUnavailableRanks(list, finished);
        this.clearExpiredPin(list, contests, finished);
        const skipped = readContestSkips();
        this.updateCardControls(list, contests, skipped);

        if (toggledSkipId && skipped.has(toggledSkipId) && this.getSelectedContestId(list, right) === toggledSkipId) {
            const preferred = this.getTarget(contests, skipped);
            const next = preferred && !skipped.has(preferred.id) ? preferred :
                contests.find(({ id }) => !skipped.has(id));
            if (next) {
                this.openShortcut(next.id);
                return;
            }
        }

        if (this.reposition) {
            this.reposition();
        } else if (this.startupPending) {
            let target = this.getTarget(contests, skipped);
            if (!contests.length && !this.preference && document.readyState === 'complete') {
                const selected = this.getSelectedContestId(list, right);
                target = cards.find(card => card.id === selected) ?? cards.at(-1);
            }
            if (target) this.openContest(list, right, target);
            else if (document.readyState === 'complete' && !this.preference) {
                document.getElementById('jarvis-contest-startup')?.remove();
            }
        } else {
            this.showLeaderboard(right, this.getSelectedContestId(list, right));
            this.switchScroll?.restore();
        }
        this.updateShortcuts(list, right, contests, skipped);
    }

    scheduleSkipReset() {
        window.clearTimeout(this.skipResetTimer);
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        this.skipResetTimer = window.setTimeout(() => {
            this.refresh();
            this.scheduleSkipReset();
        }, midnight.getTime() - Date.now());
    }

    run({ noSwitchScroll = true }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) {return}

        const pin = readContestSetting('ContestStartId');
        this.preference = ((typeof pin === 'string' || typeof pin === 'number') && pin) ? String(pin) : '';
        this.startupPending = true;
        this.stopSwitchScroll = noSwitchScroll;
        this.defaults = readContestDefaults();
        this.prunedRankRoster = null;
        this.listeners = new AbortController();
        const { signal } = this.listeners;
        this.scheduleSkipReset();
        window.addEventListener('storage', event => {
            if (event.key === null || event.key === `${LS_CONFIG_NAME}${CONTEST_SKIPS_KEY}`) this.refresh();
        }, { signal });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) return;
            this.scheduleSkipReset();
            this.refresh();
        }, { signal });
        this.titleSizes = new ResizeObserver(entries => {
            for (const { target } of entries) this.fitTitle(target as HTMLElement);
        });
        this.observer = new MutationObserver(mutations => {
            const list = document.querySelector('#contests .left_part .scroll_area');
            const right = document.querySelector('#contests .right_part');
            if (list !== this.list || right !== this.right || mutations.some(({ target }) =>
                (list && (list.contains(target) || target.contains(list))) ||
                (right && (right.contains(target) || target.contains(right))))) {
                this.refresh();
            }
        });
        this.observer.observe(document.body, { childList: true, characterData: true, subtree: true, attributes: true,
            attributeFilter: ['class', 'style', 'hidden', 'id_contest'] });
        if (document.readyState !== 'complete') window.addEventListener('load', () => this.refresh(), { once: true, signal });
        window.addEventListener('resize', () => {
            const canvas = this.list?.closest<HTMLElement>('#contests');
            const bar = canvas?.querySelector<HTMLElement>(':scope > .jarvis-contest-shortcuts');
            if (canvas && bar) positionContestShortcuts(canvas, bar);
        }, { signal });
        document.body.addEventListener('click', event => {
            const { target } = event;
            if (!event.isTrusted || !(target instanceof Element) || !this.right || !this.list) return;
            if (!this.list.contains(target)) {
                const board = target.closest<HTMLElement>('.lead_table_view');
                if (board && this.right.contains(board)) this.focusScrollPane(board, target);
                return;
            }

            const header = target.closest('.contest_header');
            if (!header || target.closest(CONTEST_CONTROL_SELECTOR)) return;
            this.focusScrollPane(this.list, target);

            const id = header.closest('.contest[id_contest]')?.getAttribute('id_contest');
            this.prepareSwitch(this.list, this.right, id ?? null);
        }, { capture: true, signal });
        this.refresh();
        this.hasRun = true
    }

    updateSubSetting(key: string, value: boolean) {
        if (key !== 'noSwitchScroll') return;
        this.stopSwitchScroll = value;
        if (!value) this.switchScroll?.stop();
    }

    tearDown() {
        this.observer?.disconnect();
        this.titleSizes?.disconnect();
        this.listeners?.abort();
        window.clearTimeout(this.skipResetTimer);
        this.stopJump?.();
        this.switchScroll?.stop();
        this.startupPending = false;
        for (const pane of this.focusablePanes) {
            if (pane.tabIndex === -1) pane.removeAttribute('tabindex');
        }
        this.focusablePanes.clear();
        this.list?.closest('#contests')?.querySelector(':scope > .jarvis-contest-shortcuts')?.remove();
        if (this.list) this.updateCardControls(this.list, [], new Set());
        if (this.right) this.showLeaderboard(this.right, null);
        document.getElementById('jarvis-contest-startup')?.remove();
        this.hasRun = false;
    }
}
