import { settingHelp } from '../../settingsHelp';
import { HHModule } from '../../HHModule';
import type { ModuleSettings } from '../../HHModule';
import { currentPage } from '../../game';
import type { ContestData } from '../../game-types';
import { LS_CONFIG_NAME, lsGet, lsSet } from '../../storage';
import { openMarkManager, type Mark, type SavedMark } from './markManager';

type MarkMode = Mark | '';
const DEFAULT_COLORS: Record<Mark, string> = { friend: '#48a9ff', foe: '#ff6173' };

export class FriendAndFoes extends HHModule {
    private names = new Map<HTMLElement, string>();
    private readonly focusableNames = new Map<HTMLElement, string | null>();
    private mode: MarkMode = '';
    private markMenu: HTMLDivElement | null = null;
    private root: HTMLElement | null = null;
    private rootSelector = '';
    private inLeague = false;

    constructor() {
        const baseKey = 'friendAndFoes'
        const configSchema = {
            baseKey,
            default: true,
            label: settingHelp("Friends and foes", "Right-click a name to mark or unmark it. Click more names to keep marking and press Esc to exit. Manage saved marks below."),
            subSettings: [{
                key: 'league',
                label: settingHelp("In leagues", "Show marks and allow marking in league tables."),
                default: true
            }, {
                key: 'contests',
                label: settingHelp("In contests", "Show marks and allow marking on contest leaderboards."),
                default: true
            }]
        }
        super({ name: baseKey, configSchema });
    }

    shouldRun() {
        return ['/leagues.html', '/activities.html'].includes(currentPage);
    }

    readSetting(key: string) {
        try {
            return lsGet(key);
        } catch {
            return null;
        }
    }

    readMarks(): Record<string, unknown> {
        const stored = this.readSetting('PlayerMarks');
        if (stored && typeof stored === 'object' && !Array.isArray(stored)) return stored as Record<string, unknown>;

        const marks: Record<string, Mark> = {};
        for (const [key, mark] of [['FriendList', 'friend'], ['FoeList', 'foe']] as const) {
            const list = this.readSetting(key);
            if (!Array.isArray(list)) continue;

            for (const id of list) {
                if (/^[1-9]\d*$/.test(String(id))) marks[String(id)] = mark;
            }
        }
        return marks;
    }

    readColors(): Record<Mark, string> {
        const saved = this.readSetting('PlayerMarkColors') as Partial<Record<Mark, unknown>> | null;
        return {
            friend: typeof saved?.friend === 'string' && /^#[\da-f]{6}$/i.test(saved.friend) ? saved.friend : DEFAULT_COLORS.friend,
            foe: typeof saved?.foe === 'string' && /^#[\da-f]{6}$/i.test(saved.foe) ? saved.foe : DEFAULT_COLORS.foe
        };
    }

    readSavedNames(): Record<string, string> {
        const saved = this.readSetting('PlayerMarkNames');
        if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
        return Object.fromEntries(Object.entries(saved).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
    }

    saveNames(names: Record<string, string>) {
        try {
            lsSet('PlayerMarkNames', names);
        } catch (err) {
            console.warn('Jarvis could not remember marked player names:', err);
        }
    }

    removeMark(id: string) {
        const marks = this.readMarks();
        delete marks[id];
        if (!this.saveSetting('PlayerMarks', marks)) return false;
        const names = this.readSavedNames();
        if (id in names) {
            delete names[id];
            this.saveNames(names);
        }
        return true;
    }

    readSavedMarks() {
        const names = this.readSavedNames();
        return Object.entries(this.readMarks()).flatMap<SavedMark>(([id, mark]) =>
            /^[1-9]\d*$/.test(id) && (mark === 'friend' || mark === 'foe')
                ? [{ id, name: names[id] || `Player #${id}`, mark }]
                : []);
    }

    saveSetting(key: string, value: unknown) {
        try {
            lsSet(key, value);
            return true;
        } catch {
            alert('Jarvis could not save your Friends and Foes settings.');
            return false;
        }
    }

    installSettings() {
        if (currentPage !== '/home.html') return;

        const selector = '.group-panel[rel="JARVIS"] .config-setting[rel="JARVIS_friendAndFoes"] .sub-settings';
        window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
            const settings = document.querySelector(selector);
            if (!settings || settings.querySelector('.jarvis-mark-color')) return;

            const inputs = new Map<Mark, HTMLInputElement>();
            for (const [mark, text] of [['friend', 'Friend name color'], ['foe', 'Foe name color']] as const) {
                const label = document.createElement('label');
                label.className = 'jarvis-mark-color';
                const title = document.createElement('span');
                title.textContent = text;
                const input = document.createElement('input');
                input.type = 'color';
                input.value = this.readColors()[mark];
                inputs.set(mark, input);
                input.disabled = !settings.closest('.config-setting')?.classList.contains('enabled');
                input.addEventListener('change', () => {
                    const colors = this.readColors();
                    if (!this.saveSetting('PlayerMarkColors', { ...colors, [mark]: input.value })) input.value = colors[mark];
                });
                label.append(title, input);
                settings.appendChild(label);
            }
            const reset = document.createElement('button');
            reset.type = 'button';
            reset.className = 'jarvis-setting-action';
            reset.textContent = 'Reset colors';
            reset.addEventListener('click', () => {
                if (!this.saveSetting('PlayerMarkColors', {})) return;
                for (const [mark, input] of inputs) input.value = DEFAULT_COLORS[mark];
            });
            const manage = document.createElement('button');
            manage.type = 'button';
            manage.className = 'jarvis-setting-action';
            manage.textContent = 'Manage marks';
            manage.addEventListener('click', () => openMarkManager(
                () => this.readSavedMarks(),
                id => this.removeMark(id),
                () => {
                    if (!this.saveSetting('PlayerMarks', {})) return false;
                    this.saveNames({});
                    return true;
                }
            ));
            const actions = document.createElement('div');
            actions.className = 'jarvis-mark-setting-actions';
            actions.append(reset, manage);
            settings.appendChild(actions);
        });
    }

    closeMarkMenu() {
        this.markMenu?.remove();
        this.markMenu = null;
    }

    openMarkMenu(event: MouseEvent, name: HTMLElement, id: string) {
        event.preventDefault();
        event.stopPropagation();
        this.closeMarkMenu();

        const menu = document.createElement('div');
        menu.className = 'jarvis-mark-menu';
        menu.setAttribute('role', 'group');
        menu.setAttribute('aria-label', 'Mark player');
        const addAction = (text: string, act: () => void) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = text;
            button.addEventListener('click', () => {
                this.closeMarkMenu();
                act();
                if (name.isConnected && this.mode) name.focus({ preventScroll: true });
            });
            menu.appendChild(button);
        };
        for (const [mode, text] of [['friend', 'Mark as friend'], ['foe', 'Mark as foe']] as const) {
            addAction(text, () => {
                this.setMode(mode);
                if (this.names.get(name) === id) this.applyMark(id);
            });
        }
        if (name.dataset.jarvisMark) addAction('Remove this player’s mark', () => {
            if (this.removeMark(id)) this.refresh();
        });
        if (this.mode) addAction('Exit marking mode (Esc)', () => this.setMode(''));
        menu.addEventListener('click', click => click.stopPropagation());
        document.body.appendChild(menu);
        this.markMenu = menu;

        const bounds = name.getBoundingClientRect();
        const x = event.clientX || bounds.left;
        const y = event.clientY || bounds.bottom;
        menu.style.left = Math.max(0, Math.min(x, document.documentElement.clientWidth - menu.offsetWidth)) + 'px';
        menu.style.top = Math.max(0, Math.min(y, document.documentElement.clientHeight - menu.offsetHeight)) + 'px';
        menu.querySelector('button')?.focus({ preventScroll: true });
    }

    setMode(mode: MarkMode) {
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

    restoreFocus(name: HTMLElement) {
        const tabindex = this.focusableNames.get(name);
        if (tabindex === undefined) return;
        if (tabindex === null) name.removeAttribute('tabindex');
        else name.setAttribute('tabindex', tabindex);
        this.focusableNames.delete(name);
    }

    getContestNames(root: HTMLElement) {
        const names = new Map<HTMLElement, string>();
        const byContest = new Map<string, Map<string, Set<string>>>();
        const contests = Object.values(window.contests || {}).filter((list): list is ContestData[] => Array.isArray(list)).flat();

        for (const row of root.querySelectorAll<HTMLTableRowElement>('.leadTable tr')) {
            const cell = row.cells?.[1];
            if (!cell || cell.localName !== 'td') continue;
            const name = cell.querySelector<HTMLElement>('.nickname') || cell;
            let id = row.getAttribute('sorting_id') || name.getAttribute('id-member') ||
                name.querySelector('[id-member]')?.getAttribute('id-member');
            const contestId = row.closest('[id_contest]')?.getAttribute('id_contest');
            if (contestId) {
                let byName = byContest.get(contestId);
                if (!byName) {
                    const participants = contests.find(contest => String(contest.id_contest) === contestId)?.participants;
                    byName = new Map();
                    for (const { nickname, id_member } of Object.values(participants || {})) {
                        const nicknameKey = String(nickname ?? '').trim();
                        if (!nicknameKey || !/^[1-9]\d*$/.test(String(id_member))) continue;
                        const matches = byName.get(nicknameKey) || new Set<string>();
                        matches.add(String(id_member));
                        byName.set(nicknameKey, matches);
                    }
                    byContest.set(contestId, byName);
                }
                const matches = byName.get((name.textContent ?? '').trim());
                if (matches && !matches.has(id ?? '')) id = matches.size === 1 ? matches.values().next().value : null;
            }
            if (id && /^[1-9]\d*$/.test(id)) names.set(name, id);
        }
        return names;
    }

    refresh() {
        const root = document.querySelector<HTMLElement>(this.rootSelector);
        if (this.root && this.root !== root) this.root.classList.remove('jarvis-mark-mode');
        this.root = root;
        const names = !root ? new Map<HTMLElement, string>() : this.inLeague
            ? new Map(Array.from(root.querySelectorAll<HTMLElement>('.nickname[id-member]'), name => [name, name.getAttribute('id-member')] as const)
                .filter((entry): entry is readonly [HTMLElement, string] => !!entry[1] && /^[1-9]\d*$/.test(entry[1])))
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
        const savedNames = this.readSavedNames();
        let namesChanged = false;
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
                const displayName = name.textContent?.trim();
                if (displayName && savedNames[id] !== displayName) {
                    savedNames[id] = displayName;
                    namesChanged = true;
                }
            } else if (name.dataset.jarvisMark) {
                delete name.dataset.jarvisMark;
            }
        }
        if (namesChanged) this.saveNames(savedNames);
        this.setMode(this.mode);
    }

    applyMark(id: string) {
        if (!this.mode) return;
        const marks = this.readMarks();
        marks[id] = this.mode;

        this.saveSetting('PlayerMarks', marks);
        this.refresh();
    }

    markPlayer(event: MouseEvent | KeyboardEvent) {
        const key = event instanceof KeyboardEvent ? event.key : undefined;
        if (key === 'Escape' && (this.mode || this.markMenu)) {
            event.preventDefault();
            event.stopPropagation();
            this.closeMarkMenu();
            this.setMode('');
            return;
        }
        if (event.target instanceof Node && this.markMenu?.contains(event.target)) return;
        if (event.type === 'click') this.closeMarkMenu();

        const name = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-jarvis-player]') : null;
        if (!name) return;
        const id = this.names.get(name);
        if (!id) return;
        if (event instanceof MouseEvent && (event.type === 'contextmenu' || (event.type === 'click' && event.altKey))) {
            this.openMarkMenu(event, name, id);
            return;
        }
        if (!this.mode || (event.type === 'keydown' && key !== 'Enter' && key !== ' ')) return;

        event.preventDefault();
        event.stopPropagation();
        this.applyMark(id);
    }

    run({ league, contests }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) {return}

        this.inLeague = currentPage === '/leagues.html';
        if (this.inLeague ? !league : !contests) return;

        this.rootSelector = this.inLeague ? '.league_table' : '#contests .right_part';
        const markPlayer = (event: MouseEvent | KeyboardEvent) => this.markPlayer(event);
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
