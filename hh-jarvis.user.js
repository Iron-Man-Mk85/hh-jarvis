// ==UserScript==
// @name           HH J.A.R.V.I.S. (Testing)
// @version        0.6.2
// @description    QoL for KK games
// @author         Iron Man
// @match          https://*.pornstarharem.com/*
// @match          https://*.hentaiheroes.com/*
// @match          https://*.comixharem.com/*
// @match          https://*.mangarpg.com/*
// @match          https://*.amouragent.com/*
// @run-at         document-start
// @namespace      https://github.com/Iron-Man-Mk85/hh-jarvis/testing
// @downloadURL    https://raw.githubusercontent.com/Iron-Man-Mk85/hh-jarvis/testing/hh-jarvis.user.js
// @updateURL      https://raw.githubusercontent.com/Iron-Man-Mk85/hh-jarvis/testing/hh-jarvis.user.js
// @icon           https://www.google.com/s2/favicons?sz=64&domain=hentaiheroes.com
// @grant          none
// ==/UserScript==

/* =================
*  =   Changelog   =
*  =================
* 0.6.2 - Pin contests on their cards, hide the startup scroll, and use right-click marking with isolated settings scrolling
* 0.6.1 - Read native Manga RPG contest titles and recognize active cards when contest data is unavailable
* 0.6.0 - Add a contest start preference, continuous marking, and compact settings with a version label
* 0.5.0 - Add league and contest player marking with custom colors, compact settings, and limit Top 20 to promotable leagues
* 0.4.2 - Fix module startup, league controls, and raid exports; add the Top 20 league target
* 0.4.1 - Fix Love Raids shadows replacement
* 0.4.0 - Add ActivityParser module
* 0.3.1 - Add harem link inside love raid cards
* 0.3.0 - Add LoveRaidsAddon and LoveRaidsParser modules
* 0.2.0 - Add RemovePassLock module
* 0.1.3 - Better code practices
* 0.1.2 - Polishing and update links
* 0.1.1 - Add FriendAndFoes module
* 0.0.1 - Initial release
*/

(function () {
    'use strict';

    if (location.pathname !== '/activities.html' || new URLSearchParams(location.search).get('tab') !== 'contests') return;

    try {
        if (JSON.parse(localStorage.getItem('HHPlusPlusConfig'))?.JARVIS_contestStart === false) return;
    } catch {
        return;
    }

    // Keep the game's initial scroll out of view until Jarvis restores the pinned card.
    const guard = document.createElement('style');
    guard.id = 'jarvis-contest-startup';
    guard.textContent = '#contests .left_part .scroll_area { opacity: 0 !important; pointer-events: none; scroll-behavior: auto !important; }';
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
    }, 2000);
})();

(function runJarvis() {
    'use strict';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runJarvis, { once: true });
        return;
    }

    const { $, localStorage, location } = window
    const LS_CONFIG_NAME = 'HHStark'
    const currentPage = location.pathname

    if (!$) {
        if (document.readyState !== 'complete') {
            window.addEventListener('load', runJarvis, { once: true });
            return;
        }
        document.getElementById('jarvis-contest-startup')?.remove();
        console.log('WARNING: No jQuery found. Ending script.');
        return
    }

    console.log('Hello, Sir, J.A.R.V.I.S. is ready to help you.');

    // Define CSS
    const style = document.createElement('style');
    style.className = 'hh-jarvis-style';
    style.textContent = `
        .hh-plus-plus-config-panel .group-panel[rel="JARVIS"] .panel-contents {
            align-content: start;
            align-items: start;
            overflow-y: auto;
            overscroll-behavior: contain;
            scrollbar-width: thin;
        }
        .hh-plus-plus-config-panel:has(> .group-panel[rel="JARVIS"].shown) {
            overflow: clip;
        }
        .hh-plus-plus-config-panel .group-panel[rel="JARVIS"] .config-setting.has-subsettings {
            grid-row-end: auto;
        }
        .hh-plus-plus-config-panel .group-panel[rel="JARVIS"] .jarvis-packed-settings {
            grid-auto-flow: row dense;
            grid-auto-rows: 1px;
            row-gap: 0;
        }
        .hh-plus-plus-config-panel .group-panel[rel="JARVIS"] .jarvis-packed-settings .config-setting {
            grid-row-end: span var(--jarvis-setting-rows, 1);
        }
        .hh-plus-plus-config-panel .jarvis-version {
            font-size: .66em;
            font-weight: normal;
            opacity: .8;
        }
        .hh-plus-plus-config-panel .group-panel[rel="JARVIS"] .jarvis-mark-color input {
            width: 30px;
            height: 20px;
            flex: none;
            padding: 0;
        }
        button.jarvis-contest-pin {
            all: unset;
            display: inline-block;
            margin-inline-start: .35em;
            padding-inline: .2em;
            color: inherit;
            font-size: .9em;
            line-height: 1;
            cursor: pointer;
        }
        .jarvis-contest-pin::before {
            content: '☆';
        }
        .jarvis-contest-pin[aria-pressed="true"]::before {
            content: '★';
            color: #ffd36b;
        }
        .jarvis-contest-pin:focus-visible {
            outline: 1px solid currentColor;
        }
        .jarvis-mark-menu {
            position: fixed;
            z-index: 10000;
            display: grid;
            gap: 2px;
            padding: 4px;
            border: 1px solid #8994a7;
            border-radius: 6px;
            background: #232936;
            color: #fff;
            box-shadow: 0 2px 10px #0008;
            font: 13px/1.35 system-ui, sans-serif;
        }
        .jarvis-mark-menu button {
            all: unset;
            padding: 4px 9px;
            border-radius: 3px;
            cursor: pointer;
        }
        .jarvis-mark-menu button:hover,
        .jarvis-mark-menu button:focus-visible {
            background: #414d64;
        }
        #contests .left_part .scroll_area.jarvis-contest-instant {
            scroll-behavior: auto !important;
        }
        [data-jarvis-mark="friend"] {
            color: var(--jarvis-friend-color) !important;
        }
        [data-jarvis-mark="foe"] {
            color: var(--jarvis-foe-color) !important;
        }
        td[data-jarvis-mark] > a {
            color: inherit !important;
        }
        .jarvis-mark-mode [data-jarvis-player] {
            cursor: crosshair;
        }
        .jarvis-mark-mode [data-jarvis-player]:hover,
        .jarvis-mark-mode [data-jarvis-player]:focus-visible {
            outline: 1px solid currentColor;
        }
    `;
    document.head.appendChild(style);

    function lsGet(key, ls_name = LS_CONFIG_NAME) {
        return JSON.parse(localStorage.getItem(`${ls_name}${key}`))
    }
    function lsSet(key, value, ls_name = LS_CONFIG_NAME) {
        return localStorage.setItem(`${ls_name}${key}`, JSON.stringify(value))
    }
    function lsRm(key, ls_name = LS_CONFIG_NAME) {
        return localStorage.removeItem(`${ls_name}${key}`)
    }

    function packSettings() {
        if (currentPage !== '/home.html') return;

        const selector = '.hh-plus-plus-config-panel .group-panel[rel="JARVIS"] .panel-contents';
        window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
            const panel = document.querySelector(selector);
            panel.classList.remove('hh-scroll');
            window.addEventListener('wheel', event => {
                if (event.ctrlKey || !panel.contains(event.target)) return;

                event.preventDefault();
                event.stopImmediatePropagation();
                const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? panel.clientHeight : 1;
                const scale = panel.getBoundingClientRect().height / panel.offsetHeight || 1;
                panel.scrollTop += event.deltaY * unit / scale;
            }, { capture: true, passive: false });

            const cards = panel.querySelectorAll('.config-setting');
            const pack = () => {
                if (!panel.offsetWidth) return;

                for (const card of cards) {
                    card.style.setProperty('--jarvis-setting-rows', card.offsetHeight + 10);
                }
                panel.classList.add('jarvis-packed-settings');
            };
            const groupObserver = new MutationObserver(pack);
            groupObserver.observe(panel.parentElement, { attributeFilter: ['class'] });
            if (typeof ResizeObserver !== 'undefined') {
                const sizeObserver = new ResizeObserver(pack);
                cards.forEach(card => sizeObserver.observe(card));
            }
            pack();
        });
    }

    async function getGirlDictionary() {
        try {
            return await window.HHPlusPlus.Helpers.getGirlDictionary();
        } catch (err) {
            console.warn('Jarvis could not load the HH++ girl dictionary:', err);
            return null;
        }
    }

    class HHModule {
        constructor({ group, configSchema }) {
            this.group = 'JARVIS'
            this.configSchema = configSchema
            this.hasRun = false
        }
    }

    class FriendAndFoes extends HHModule {
        constructor() {
            const baseKey = 'friendAndFoes'
            const configSchema = {
                baseKey,
                default: true,
                label: '<span tooltip="Right-click a player name to mark it. Press Esc to stop marking.">Show Friends and Foes</span>',
                subSettings: [{
                    key: 'league',
                    label: 'Show in League',
                    default: true
                }, {
                    key: 'contests',
                    label: 'Show in Contests',
                    default: true
                }]
            }
            super({ name: baseKey, configSchema });

            this.names = new Map();
            this.focusableNames = new Map();
            this.mode = '';
        }

        shouldRun() {
            return ['/home.html', '/leagues.html', '/activities.html'].includes(currentPage);
        }

        readSetting(key) {
            try {
                return lsGet(key);
            } catch {
                return null;
            }
        }

        readMarks() {
            const stored = this.readSetting('PlayerMarks');
            if (stored && typeof stored === 'object' && !Array.isArray(stored)) return stored;

            const marks = {};
            for (const [key, mark] of [['FriendList', 'friend'], ['FoeList', 'foe']]) {
                const list = this.readSetting(key);
                if (!Array.isArray(list)) continue;

                for (const id of list) {
                    if (/^[1-9]\d*$/.test(String(id))) marks[id] = mark;
                }
            }
            return marks;
        }

        readColors() {
            const saved = this.readSetting('PlayerMarkColors');
            return {
                friend: /^#[\da-f]{6}$/i.test(saved?.friend) ? saved.friend : '#72caff',
                foe: /^#[\da-f]{6}$/i.test(saved?.foe) ? saved.foe : '#ff8383'
            };
        }

        saveSetting(key, value) {
            try {
                lsSet(key, value);
                return true;
            } catch {
                alert('Jarvis could not save your Friends and Foes settings.');
                return false;
            }
        }

        addColorSettings() {
            const selector = '.group-panel[rel="JARVIS"] .config-setting[rel="JARVIS_friendAndFoes"] .sub-settings';
            window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
                const settings = document.querySelector(selector);
                if (!settings || settings.querySelector('.jarvis-mark-color')) return;

                for (const [mark, text] of [['friend', 'Friend name color'], ['foe', 'Foe name color']]) {
                    const label = document.createElement('label');
                    label.className = 'jarvis-mark-color';
                    const title = document.createElement('span');
                    title.textContent = text;
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = this.readColors()[mark];
                    input.disabled = !settings.closest('.config-setting').classList.contains('enabled');
                    input.addEventListener('change', () => {
                        const colors = this.readColors();
                        if (!this.saveSetting('PlayerMarkColors', { ...colors, [mark]: input.value })) input.value = colors[mark];
                    });
                    label.append(title, input);
                    settings.appendChild(label);
                }
            });
        }

        closeMarkMenu() {
            this.markMenu?.remove();
            this.markMenu = null;
        }

        openMarkMenu(event, name, id) {
            event.preventDefault();
            event.stopPropagation();
            this.closeMarkMenu();

            const menu = document.createElement('div');
            menu.className = 'jarvis-mark-menu';
            menu.setAttribute('role', 'group');
            menu.setAttribute('aria-label', 'Mark player');
            const actions = [['friend', 'Mark friend'], ['foe', 'Mark foe'], ['clear', 'Clear mark']];
            if (this.mode) actions.push(['', 'Stop marking']);

            for (const [mode, text] of actions) {
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = text;
                button.addEventListener('click', () => {
                    this.closeMarkMenu();
                    this.setMode(mode);
                    if (mode && this.names.get(name) === id) this.applyMark(id);
                    if (mode) name.focus({ preventScroll: true });
                });
                menu.appendChild(button);
            }
            menu.addEventListener('click', click => click.stopPropagation());
            document.body.appendChild(menu);
            this.markMenu = menu;

            const bounds = name.getBoundingClientRect();
            const x = event.clientX || bounds.left;
            const y = event.clientY || bounds.bottom;
            menu.style.left = Math.max(0, Math.min(x, document.documentElement.clientWidth - menu.offsetWidth)) + 'px';
            menu.style.top = Math.max(0, Math.min(y, document.documentElement.clientHeight - menu.offsetHeight)) + 'px';
            menu.querySelector('button').focus({ preventScroll: true });
        }

        setMode(mode) {
            this.mode = mode;
            this.root?.classList.toggle('jarvis-mark-mode', !!mode);

            for (const name of this.names.keys()) {
                if (mode && name.tabIndex < 0) {
                    this.focusableNames.set(name, name.getAttribute('tabindex'));
                    name.tabIndex = 0;
                } else if (!mode) {
                    this.restoreFocus(name);
                }
            }
        }

        restoreFocus(name) {
            if (!this.focusableNames.has(name)) return;

            const tabindex = this.focusableNames.get(name);
            if (tabindex === null) name.removeAttribute('tabindex');
            else name.setAttribute('tabindex', tabindex);
            this.focusableNames.delete(name);
        }

        getContestNames(root) {
            const names = new Map();
            const byContest = new Map();
            const contests = Object.values(window.contests || {}).filter(Array.isArray).flat();

            for (const row of root.querySelectorAll('.leadTable tr')) {
                const cell = row.cells?.[1];
                if (!cell || cell.localName !== 'td') continue;
                const name = cell.querySelector('.nickname') || cell;
                let id = row.getAttribute('sorting_id') || name.getAttribute('id-member') ||
                    name.querySelector('[id-member]')?.getAttribute('id-member');
                const contestId = row.closest('[id_contest]')?.getAttribute('id_contest');
                if (contestId) {
                    if (!byContest.has(contestId)) {
                        const participants = contests.find(contest => String(contest.id_contest) === contestId)?.participants;
                        const byName = new Map();
                        for (const { nickname, id_member } of Object.values(participants || {})) {
                            const nicknameKey = String(nickname ?? '').trim();
                            if (!nicknameKey || !/^[1-9]\d*$/.test(String(id_member))) continue;
                            if (!byName.has(nicknameKey)) byName.set(nicknameKey, new Set());
                            byName.get(nicknameKey).add(String(id_member));
                        }
                        byContest.set(contestId, byName);
                    }
                    const matches = byContest.get(contestId).get(name.textContent.trim());
                    if (matches && !matches.has(id)) id = matches.size === 1 ? matches.values().next().value : null;
                }
                if (/^[1-9]\d*$/.test(id)) names.set(name, id);
            }
            return names;
        }

        refresh() {
            const root = document.querySelector(this.rootSelector);
            if (this.root && this.root !== root) this.root.classList.remove('jarvis-mark-mode');
            this.root = root;
            const names = !root ? new Map() : this.inLeague
                ? new Map(Array.from(root.querySelectorAll('.nickname[id-member]'), name => [name, name.getAttribute('id-member')])
                    .filter(([, id]) => /^[1-9]\d*$/.test(id)))
                : this.getContestNames(root);

            for (const name of this.names.keys()) {
                if (names.has(name)) continue;
                delete name.dataset.jarvisPlayer;
                delete name.dataset.jarvisMark;
                this.restoreFocus(name);
            }

            this.names = names;
            if (!root) return;
            const marks = this.readMarks();
            const colors = this.readColors();
            for (const [mark, color] of Object.entries(colors)) {
                const property = '--jarvis-' + mark + '-color';
                if (root.style.getPropertyValue(property) !== color) root.style.setProperty(property, color);
            }
            for (const [name, id] of names) {
                if (name.dataset.jarvisPlayer !== id) name.dataset.jarvisPlayer = id;
                const mark = marks[id];
                if (mark === 'friend' || mark === 'foe') {
                    if (name.dataset.jarvisMark !== mark) name.dataset.jarvisMark = mark;
                } else if (name.dataset.jarvisMark) {
                    delete name.dataset.jarvisMark;
                }
            }
            this.setMode(this.mode);
        }

        applyMark(id) {
            const marks = this.readMarks();
            if (this.mode === 'clear') delete marks[id];
            else marks[id] = this.mode;

            this.saveSetting('PlayerMarks', marks);
            this.refresh();
        }

        markPlayer(event) {
            if (event.type === 'keydown' && event.key === 'Escape' && (this.mode || this.markMenu)) {
                event.preventDefault();
                event.stopPropagation();
                this.closeMarkMenu();
                this.setMode('');
                return;
            }
            if (this.markMenu?.contains(event.target)) return;
            if (event.type === 'click') this.closeMarkMenu();

            const name = event.target?.closest?.('[data-jarvis-player]');
            const id = this.names.get(name);
            if (!id) return;
            if (event.type === 'contextmenu' || (event.type === 'click' && event.altKey)) {
                this.openMarkMenu(event, name, id);
                return;
            }
            if (!this.mode || (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ')) return;

            event.preventDefault();
            event.stopPropagation();
            this.applyMark(id);
        }

        run({ league, contests }) {
            if (this.hasRun || !this.shouldRun()) {return}

            this.inLeague = currentPage === '/leagues.html';
            if (currentPage === '/home.html') {
                this.addColorSettings();
                this.hasRun = true;
                return;
            }
            if (this.inLeague ? !league : !contests) return;

            this.rootSelector = this.inLeague ? '.league_table' : '#contests .right_part';
            const markPlayer = event => this.markPlayer(event);
            document.addEventListener('click', markPlayer, true);
            document.addEventListener('keydown', markPlayer, true);
            document.addEventListener('contextmenu', markPlayer, true);
            window.addEventListener('storage', event => {
                if (!event.key || ['PlayerMarks', 'PlayerMarkColors', 'FriendList', 'FoeList']
                    .some(key => event.key === LS_CONFIG_NAME + key)) this.refresh();
            });

            const observer = new MutationObserver(mutations => {
                const root = document.querySelector(this.rootSelector);
                if (root !== this.root || (root && mutations.some(({ target }) => root.contains(target)))) {
                    this.refresh();
                }
            });
            observer.observe(document.body, {
                childList: true,
                characterData: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['sorting_id', 'id-member', 'id_contest']
            });

            this.refresh();
            this.hasRun = true
        }
    }

    class ContestStart extends HHModule {
        constructor() {
            const baseKey = 'contestStart'
            const configSchema = {
                baseKey,
                default: true,
                label: 'Open a preferred contest without the scroll animation'
            }
            super({ name: baseKey, configSchema });
        }

        shouldRun() {
            return currentPage === '/activities.html';
        }

        getContests(list) {
            const active = new Map(Object.values(window.contests?.active || {})
                .filter(contest => contest?.id_contest != null)
                .map(contest => [String(contest.id_contest), contest]));

            return Array.from(list.querySelectorAll('.contest[id_contest]')).flatMap(card => {
                const id = card.getAttribute('id_contest');
                const contest = active.get(id);
                const header = card.querySelector('.contest_header');
                if (!header || card.matches('.ended') || header.matches('.ended')) return [];
                if (!contest && !header.matches('.in_progress')) return [];

                const title = header.querySelector('.contest_title, .contest_name, h3, h4, h5');
                const name = title?.textContent?.trim() || contest?.name || contest?.title;
                return [{
                    id, card, header, title,
                    daily: contest?.category_type === 'daily',
                    label: String(name || (contest?.category_type === 'daily' ? 'Daily contest' : 'Contest')).trim()
                }];
            });
        }

        getTarget(contests) {
            const preferred = contests.find(contest => contest.id === this.preference);
            if (preferred) return preferred;

            const active = Object.values(window.contests?.active || {});
            if (this.preference && active.some(contest => String(contest?.id_contest) === this.preference)) return;

            const daily = contests.filter(contest => contest.daily).sort((a, b) => Number(b.id) - Number(a.id))[0];
            if (daily) return daily;
            if (!active.some(contest => contest?.category_type === 'daily')) return contests[0];
        }

        updatePins(list, contests) {
            const hosts = new Set(contests.map(({ title, header }) => title || header));
            for (const pin of list.querySelectorAll('.jarvis-contest-pin')) {
                if (!hosts.has(pin.parentElement)) pin.remove();
            }

            for (const { id, title, header, label } of contests) {
                const host = title || header;
                let pin = host.querySelector(':scope > .jarvis-contest-pin');
                if (!pin) {
                    pin = document.createElement('button');
                    pin.type = 'button';
                    pin.className = 'jarvis-contest-pin';
                    pin.addEventListener('click', event => {
                        event.preventDefault();
                        event.stopPropagation();
                        const contestId = pin.closest('.contest[id_contest]')?.getAttribute('id_contest');
                        if (!contestId) return;

                        const next = this.preference === contestId ? '' : contestId;
                        try {
                            if (next) lsSet('ContestStartId', next);
                            else lsRm('ContestStartId');
                            this.preference = next;
                        } catch (err) {
                            console.warn('Jarvis could not save the contest preference:', err);
                        }
                        this.refresh();
                    });
                    host.appendChild(pin);
                }
                const pinned = this.preference === id;
                pin.setAttribute('aria-pressed', String(pinned));
                pin.setAttribute('aria-label', pinned ? `Unpin ${label}` : `Pin ${label} to open on reload`);
                pin.title = pinned ? 'Pinned. Click to return to the Daily default.' : 'Open this contest when the page reloads';
            }
        }

        openContest(list, { id, card, header, title }) {
            this.stopJump?.();
            list.classList.add('jarvis-contest-instant');

            const jump = () => {
                if (!list.isConnected || !list.contains(card)) return;

                // The game may already have queued a scroll on the left-hand list.
                $(list).stop(true, false);
                const bounds = list.getBoundingClientRect();
                const scale = bounds.height / list.offsetHeight;
                if (!scale) return;

                const offset = (card.getBoundingClientRect().top - bounds.top) / scale - list.clientTop;
                const top = Math.max(0, Math.min(list.scrollHeight - list.clientHeight, list.scrollTop + offset));
                if (Math.abs(top - list.scrollTop) >= 1) list.scrollTop = top;
            };

            const stop = () => {
                list.removeEventListener('scroll', jump);
                list.removeEventListener('pointerdown', stop, true);
                list.removeEventListener('wheel', stop, true);
                list.removeEventListener('keydown', stop, true);
                list.classList.remove('jarvis-contest-instant');
                clearTimeout(timer);
                this.stopJump = null;
            };
            const timer = setTimeout(stop, 1500);
            this.stopJump = stop;
            list.addEventListener('scroll', jump, { passive: true });
            list.addEventListener('pointerdown', stop, true);
            list.addEventListener('wheel', stop, { passive: true, capture: true });
            list.addEventListener('keydown', stop, true);

            jump();
            const alreadyOpen = Array.from(document.querySelectorAll('#contests .right_part .ranking[id_contest]'))
                .some(panel => panel.getAttribute('id_contest') === id && panel.getClientRects().length &&
                    getComputedStyle(panel).visibility === 'visible');
            if (!alreadyOpen && !header.matches('.contest_header_active')) (title || header).click();
            jump();
            document.getElementById('jarvis-contest-startup')?.remove();
        }

        refresh() {
            const list = document.querySelector('#contests .left_part .scroll_area');
            this.list = list;
            if (!list || !list.getClientRects().length || getComputedStyle(list).visibility !== 'visible') return;

            const contests = this.getContests(list);
            this.updatePins(list, contests);

            if (this.restoredList === list) return;
            const target = this.getTarget(contests);
            if (!target) return;
            this.restoredList = list;
            this.openContest(list, target);
        }

        run() {
            if (this.hasRun || !this.shouldRun()) {return}

            try {
                this.preference = lsGet('ContestStartId') || '';
            } catch {
                this.preference = '';
            }
            const observer = new MutationObserver(mutations => {
                const list = document.querySelector('#contests .left_part .scroll_area');
                if (list !== this.list || (list && mutations.some(({ target }) => list.contains(target) || target.contains(list)))) {
                    this.refresh();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true, attributes: true,
                attributeFilter: ['class', 'style', 'hidden', 'id_contest'] });
            this.refresh();
            this.hasRun = true
        }
    }

    class LeagueTop20 extends HHModule {
        constructor() {
            const baseKey = 'leagueTop20'
            const configSchema = {
                baseKey,
                default: true,
                label: `Show the Top 20 promotion target in lower leagues`
            }
            super({name: baseKey, configSchema});
        }

        shouldRun() {
            return currentPage.includes('/leagues.html');
        }

        run() {
            if (this.hasRun || !this.shouldRun()) {return}

            window.HHPlusPlus.Helpers.doWhenSelectorAvailable('.scriptLeagueInfo', () => {
                const summary = document.querySelector('.scriptLeagueInfo');
                if (!summary || summary.querySelector('.jarvisTop20')) return;

                const { opponents_list, current_tier_number, max_league } = window;
                const tier = Number(current_tier_number);
                if (!(tier > 0 && tier < Number(max_league))) return;
                const heroId = (window.shared?.Hero || window.Hero)?.infos?.id;
                if (!Array.isArray(opponents_list) || heroId == null) return;

                const player = opponents_list.find(({ player }) => String(player?.id_fighter) === String(heroId));
                const rank = Number(player?.place);
                if (!Number.isInteger(rank) || rank < 1) return;

                const inTop20 = rank <= 20;
                const cutoff = opponents_list.find(({ place }) => Number(place) === (inTop20 ? 21 : 20));
                if (player.player_league_points == null || cutoff?.player_league_points == null) return;

                const score = Number(player.player_league_points);
                const cutoffScore = Number(cutoff.player_league_points);
                if (!Number.isFinite(score) || !Number.isFinite(cutoffScore)) return;

                const format = new Intl.NumberFormat();
                const target = inTop20 ? cutoffScore : cutoffScore + 1;
                const difference = inTop20 ? score - target : target - score;
                const tooltip = inTop20
                    ? `Top 20 promotion target: ${format.format(target)} points at rank 21. Your lead: ${format.format(difference)} points.`
                    : `Top 20 promotion target: ${format.format(target)} points to pass rank 20.`;

                const entry = document.createElement('span');
                entry.className = 'minTop20 jarvisTop20';
                entry.setAttribute('hh_title', tooltip);
                entry.setAttribute('tooltip', '');
                entry.setAttribute('aria-label', tooltip);

                const badge = document.createElement('span');
                badge.className = 'scriptLeagueInfoIcon';
                badge.style.backgroundColor = '#3769ba';
                badge.style.textAlign = 'center';
                badge.textContent = '20';
                entry.append(badge, `${difference === 0 ? '' : inTop20 ? '-' : '+'}${format.format(Math.abs(difference))}`);
                summary.insertBefore(entry, summary.querySelector('.minTop30, .promotionInfo'));
            });

            this.hasRun = true
        }
    }

    class RemovePassLock extends HHModule {
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

            this.selectorToFind = '.lock_yellow_icn';
            this.classToRemove = 'lock_yellow_icn';
        }

        shouldRun() {
            return currentPage.includes('/path-of-valor.html') || currentPage.includes('/path-of-glory.html')
        }

        observeUntil(selector, callback, { once = true, timeout = 5000 } = {}) {
            let timer = null;
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

        removeClassWhenSelectorAvailable(selector, classToRemove, { once = true, timeout = 5000 } = {}) {
            this.observeUntil(selector, (elements) => {
                elements.forEach(el => el.classList.remove(classToRemove));
            }, { timeout, once });
        }

        run({ pov, pog }) {
            if (this.hasRun || !this.shouldRun()) {return}

            if (currentPage.includes('/path-of-valor.html') && pov) {
                this.removeClassWhenSelectorAvailable(this.selectorToFind, this.classToRemove);
            } else if (currentPage.includes('/path-of-glory.html') && pog) {
                this.removeClassWhenSelectorAvailable(this.selectorToFind, this.classToRemove);
            }

            this.hasRun = true
        }
    }

    class LoveRaidsAddon extends HHModule {
        constructor() {
            const baseKey = 'loveRaidsAddon'
            const configSchema = {
                baseKey,
                default: false,
                label: `Visual enhancements for Love Raids page`,
                subSettings: [{
                    key: 'raid_id',
                    label: `Show raid ID before raid name`,
                    default: false
                }, {
                    key: 'names',
                    label: `Show names on mysterious girls`,
                    default: true
                }, {
                    key: 'skin',
                    label: `Show 👙 icon if a girl has a skin (works on hidden ones)`,
                    default: true
                }, {
                    key: 'color',
                    label: `Set the color based on rarity`,
                    default: true
                }, {
                    key: 'fight_icon',
                    label: `Show better fight icon`,
                    default: true
                }, {
                    key: 'shadows',
                    label: `Replace shadow poses`,
                    default: true
                }]
            }
            super({name: baseKey, configSchema});

            this.rarityColors = {
                rare: 'LimeGreen',
                epic: 'Gold',
                legendary: 'MediumOrchid'
            };
        }

        shouldRun() {
            return currentPage.includes('/love-raids.html')
        }

        async run({ raid_id, skin, names, color, fight_icon, shadows }) {
            if (this.hasRun || !this.shouldRun()) {return}

            const raids = (typeof love_raids !== 'undefined' && Array.isArray(love_raids)) ? love_raids : [];
            if (!raids.length) return;
            this.hasRun = true

            const girlDict = await getGirlDictionary();
            const raidsById = new Map(raids.map(raid => [String(raid.id_raid), raid]));

            document.querySelectorAll('.raid-card[id_raid]').forEach(raidCard => {
                const raid = raidsById.get(raidCard.getAttribute('id_raid'));
                if (!raid || raid.id_girl == null) return;

                const { name, rarity, shards = 0 } = girlDict?.get(String(raid.id_girl)) || {};
                const haremLink = window.HHPlusPlus.Helpers.getHref(`/characters/${raid.id_girl}`);
                const raidNameElem = raidCard.querySelector('.raid-name > span > span');
                const name_label = (names && name) || raidNameElem?.textContent?.trim() || raid.event_name || raid.girl_data?.name || '';
                const raid_id_label = raid_id ? `(${raid.id_raid})` : '';
                const skin_label = (skin && Array.isArray(raid?.girl_data?.grade_skins) && raid.girl_data.grade_skins.length > 0) ? '👙' : '';

                const displayParts = [];
                if (raid_id) displayParts.push(raid_id_label);
                displayParts.push(name_label);
                if (skin) displayParts.push(skin_label);
                const displayLabel = displayParts.join(' ').trim();

                if (raidNameElem && displayLabel) {
                    raidNameElem.textContent = displayLabel;
                }

                const objectives = raidCard.querySelectorAll('.classic-girl');
                const girl = objectives[0];
                if (girl) {
                    const girlNameElem = girl.querySelector('.girl-name');
                    if (girlNameElem) {
                        let link = girlNameElem.querySelector('a');
                        if (!link) {
                            link = document.createElement('a');
                            link.className = 'hh-girl-link';
                            while (girlNameElem.firstChild) link.appendChild(girlNameElem.firstChild);
                            girlNameElem.appendChild(link);
                        }
                        if (displayLabel) link.textContent = displayLabel;
                        link.href = haremLink;
                    }

                    if (shards === 100) {
                        const objElem = girl.querySelector('.objective');
                        if (objElem) {
                            objElem.innerText = `I'm already attracted to you. Find me in your Harem!`;
                        }
                    }
                }

                if (color && rarity) {
                    const raidNameContainer = raidCard.querySelector('.raid-name');
                    if (raidNameContainer) {
                        raidNameContainer.style.color = this.rarityColors[rarity] || '';
                    }
                }

                if (fight_icon) {
                    const fightIcon = raidCard.querySelector('.hudBattlePts_mix_icn');
                    if (fightIcon) {
                        fightIcon.style.backgroundImage = 'url(/images/pictures/design/ic_energy_fight.png)';
                        fightIcon.style.backgroundSize = '24px';
                    }
                }

                if (shadows) {
                    const leftImage = raidCard.querySelector('.girl-img.left');
                    if (leftImage) {
                        leftImage.src = leftImage.src.replace('-black', '');
                    }
                    if (raidCard.classList.contains('multiple-girl')) {
                        const rightImage = raidCard.querySelector('.girl-img.right');
                        if (rightImage) {
                            // rightImage.src = rightImage.src.replace('avb0.png', 'grade_skins/grade_skin1.png');
                            rightImage.src = rightImage.src.replace('-black', '');
                        }
                    }
                    raidCard.querySelectorAll('.eye').forEach(e => e.remove());
                }
            });
        }
    }

    class LoveRaidsParser extends HHModule {
        /*
        * Raid ID, Announcement Type, Background ID, Event Name, Start Datetime,
        * End Datetime, Duration, Raid Status, Source, Girl ID,
        * Girl Name, Rarity, Max Grade, First Appearance, Source ID,
        * Has Skin(s)
        */
        constructor() {
            const baseKey = 'loveRaidsParser'
            const configSchema = {
                baseKey,
                default: false,
                label: `Add a parser in Love Raids page for GSheet management`
            }
            super({name: baseKey, configSchema});
        }

        shouldRun() {
            return currentPage.includes('/love-raids.html')
        }

        capitalizeFirst(str) {
            return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
        }

        getAnnouncementType(type) {
            switch (type) {
                case 1: return "Full";
                case 2: return "Partial";
                case 3: return "None";
                default: return "Unknown";
            }
        }

        getSourceID(event) {
            const source_id = Number(event.raid_module_pk);
            switch (event.raid_module_type) {
                case 'season': return 0;
                case 'champion': return Number.isFinite(source_id) ? source_id : -2;
                case 'troll': return Number.isFinite(source_id) ? source_id + 10 : -2;
                default: return -1;
            }
        }

        girlHasSkins(event) {
            const hasSkins = Array.isArray(event?.girl_data?.grade_skins) && event.girl_data.grade_skins.length > 0;
            if (hasSkins) {
                return "X";
            } else return "O";
        }

        formatEventRow(event) {
            const durationHours = Math.floor(event.event_duration_seconds / 3600);
            const duration = `${durationHours} hours`;

            const girl = this.girlDict.get(String(event.id_girl)) || {};
            const { name = 'Unknown', rarity = 'N/A', grade = 0 } = girl;

            return [
                event.id_raid,
                this.getAnnouncementType(event.id_announcement_type),
                event.background_id,
                event.event_name,
                event.start_datetime,
                event.end_datetime,
                duration,
                event.status,
                event.raid_module_type,
                event.id_girl,
                name,
                this.capitalizeFirst(rarity),
                grade,
                "", // one blank tab reserved for first appearance in GSheets
                this.getSourceID(event),
                this.girlHasSkins(event)
            ].join("\t");
        }

        async copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.warn('Clipboard API failed, using execCommand fallback:', err);
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    return document.execCommand('copy');
                } catch (err) {
                    return false;
                } finally {
                    textarea.remove();
                }
            }
        }

        async handleCopyClick(evt) {
            const storageKey = 'LastSavedRaidID';

            // Shift + Ctrl + Click → clear stored ID
            if (evt.shiftKey && evt.ctrlKey) {
                const confirmClear = confirm('⚠️ Do you want to clear the saved last raid ID for this site?');
                if (confirmClear) {
                    lsRm(storageKey);
                    alert('✅ Last saved ID cleared.');
                }
                return;
            }

            // Load raids
            const localLoveRaids = (typeof love_raids !== 'undefined' && Array.isArray(love_raids)) ? love_raids : [];
            if (!localLoveRaids.length) {
                alert('⚠️ No love_raids found on this page.');
                return;
            }

            if (!this.girlDict) {
                alert('⚠️ The HH++ girl dictionary could not be loaded. Reload the page and try again.');
                return;
            }

            let lastSavedIdNumber = parseInt(lsGet(storageKey), 10);

            // If Shift is held OR no saved ID exists → ask again
            if (isNaN(lastSavedIdNumber) || evt.shiftKey) {
                const lastSavedId = prompt('Please enter the last saved ID:');
                lastSavedIdNumber = parseInt(lastSavedId, 10);

                if (isNaN(lastSavedIdNumber)) {
                    alert('❌ Invalid ID entered. Please enter a valid number.');
                    return;
                }
            }

            // Filter new events
            const filteredData = localLoveRaids.filter(event => event.id_raid > lastSavedIdNumber);
            if (!filteredData.length) {
                alert(`ℹ️ No new events found with ID greater than ${lastSavedIdNumber}`);
                return;
            }

            const formattedData = filteredData.map(this.formatEventRow.bind(this)).join("\n");

            if (!await this.copyToClipboard(formattedData)) {
                alert('❌ Could not copy the raids. The last saved ID was kept.');
                return;
            }

            // Save highest ID
            const maxId = Math.max(...filteredData.map(e => e.id_raid));
            lsSet(storageKey, maxId);

            alert('✅ Data copied to clipboard! You can now paste it into GSheets.');
        }

        createCopyButton() {
            const button = document.createElement('div');
            button.classList.add('reminder-copy');
            button.style.cssText = `
                background: linear-gradient(180deg, #00aaff 0, #006688 50%, #005577 51%, #00aaff 100%);
                display: inline-block;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                margin-left: 10px;
                cursor: pointer;
                position: absolute;
                right: 4.5rem;
                top: 0.2rem;
                font-size: 18px;
                line-height: 32px;
                text-align: center;
                transition: background 0.2s ease;
            `;
            button.textContent = '📋';
            let buttonTitle = 'Click = copy new raids. Shift / Shift + Ctrl available.';
            button.setAttribute('tooltip', '');
            button.setAttribute('hh_title', buttonTitle);

            const _boundCopyKeyHandler = (e) => this.updateCopyButton(e, button);
            window.addEventListener('keydown', _boundCopyKeyHandler);
            window.addEventListener('keyup', _boundCopyKeyHandler);
            // store handler reference so callers can remove listeners if button is removed later
            button._boundCopyKeyHandler = _boundCopyKeyHandler;
            button.onclick = (e) => this.handleCopyClick(e);
            this.updateCopyButton({ shiftKey: false, ctrlKey: false }, button);
            return button;
        }

        updateCopyButton(e, button) {
            let buttonTitle = '';
            if (e.shiftKey && e.ctrlKey) {
                button.style.background = "linear-gradient(180deg, #ff6666 0, #aa0000 100%)"; // red
                button.textContent = '🗑️';
                buttonTitle = 'Shift + Ctrl + Click = clear saved ID';
                button.setAttribute('hh_title', buttonTitle);
            } else if (e.shiftKey) {
                button.style.background = "linear-gradient(180deg, #ffdd66 0, #cc9900 100%)"; // yellow
                button.textContent = '✏️';
                buttonTitle = 'Shift + Click = prompt for ID.';
                button.setAttribute('hh_title', buttonTitle);
            } else {
                button.style.background = "linear-gradient(180deg, #00aaff 0, #006688 50%, #005577 51%, #00aaff 100%)"; // default blue
                button.textContent = '📋';
                buttonTitle = 'Click = copy new raids. Shift / Shift + Ctrl available.';
                button.setAttribute('hh_title', buttonTitle);
            }
        }

        insertButton() {
            const notificationButton = document.querySelector('.button-notification-action.notif_button_s');
            if (notificationButton && !document.querySelector('.reminder-copy')) {
                const copyButton = this.createCopyButton();
                notificationButton.parentNode.insertBefore(copyButton, notificationButton);
            }
        }

        async run() {
            if (this.hasRun || !this.shouldRun()) {return}

            this.hasRun = true
            this.girlDict = await getGirlDictionary();

            this._boundInsertButton = this.insertButton.bind(this);
            if (document.readyState === 'complete') this.insertButton();
            else window.addEventListener('load', this._boundInsertButton, { once: true });
        }
    }

    class ActivityParser extends HHModule {
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

        async copyToClipboard(text) {
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

        run({ missionCopier }) {
            if (this.hasRun || !this.shouldRun()) {return}

            if (missionCopier) {
                const entries = document.querySelectorAll('.mission_entry.legendary');
                if (!entries.length) return;

                entries.forEach(entry => {
                    const imgDiv = entry.querySelector('.mission_image img');
                    const titleAll = entry.querySelector('.mission_details h1');
                    const desc = entry.querySelector('.mission_details p');

                    if (imgDiv) {
                        imgDiv.style.cursor = 'pointer';
                        imgDiv.addEventListener('click', e => {
                            e.stopPropagation();
                            this.copyToClipboard(imgDiv.src);
                        });
                    }

                    if (titleAll) {
                        titleAll.style.cursor = 'pointer';
                        const outerTitle = titleAll.querySelector('.event-mission-content-text');
                        if (outerTitle) {
                            outerTitle.style.cursor = 'pointer';
                            outerTitle.addEventListener('click', e => {
                                e.stopPropagation();
                                this.copyToClipboard(outerTitle.textContent.trim());
                            });
                        }

                        titleAll.addEventListener('click', e => {
                            if (e.target && e.target.closest && e.target.closest('.event-mission-content-text')) return;
                            const titleClone = titleAll.cloneNode(true);
                            titleClone.querySelector('.event-mission-content-text')?.remove();
                            const title = titleClone.textContent.trim();
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

    const allModules = [
        new FriendAndFoes(),
        new ContestStart(),
        new LeagueTop20(),
        new RemovePassLock(),
        new LoveRaidsAddon(),
        new LoveRaidsParser(),
        new ActivityParser()
    ]

    setTimeout(() => {
        const runScript = () => {
            const { hhPlusPlusConfig } = window

            hhPlusPlusConfig.registerGroup({
                key: 'JARVIS',
                name: 'HH Jarvis <small class="jarvis-version">v0.6.2 testing</small>'
            })
            allModules.forEach(module => {
                hhPlusPlusConfig.registerModule(module)
            })
            hhPlusPlusConfig.loadConfig()
            hhPlusPlusConfig.runModules()
            packSettings();
        }

        if (window.hhPlusPlusConfig) {
            runScript()
        } else {
            $(document).one('hh++-bdsm:loaded', runScript)
        }
    }, 1)
})();
