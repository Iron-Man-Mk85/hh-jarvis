import { settingHelp } from '../../settingsHelp';
import { HHModule } from '../../HHModule';
import type { ModuleSettings } from '../../HHModule';
import { currentPage } from '../../game';
import type { ContestData } from '../../game-types';
import { LS_CONFIG_NAME, lsGet, lsSet } from '../../storage';
import { openMarkManager, type Mark, type SavedMark } from './markManager';

const DEFAULT_COLORS: Record<Mark, string> = { friend: '#48a9ff', foe: '#ff6173' };
type SavedName = string | { name: string };

function readRowName(element: HTMLElement) {
    const text = element.textContent?.trim() ?? '';
    if (!text.endsWith('+')) return text;
    const withoutStandalonePlus = text.replace(/\s+\+$/, '');
    if (!element.childElementCount) return withoutStandalonePlus;

    const label = element.cloneNode(true) as HTMLElement;
    for (const child of label.querySelectorAll('*')) {
        if (child.textContent?.trim() === '+') child.remove();
    }
    return label.textContent?.trim().replace(/\s+\+$/, '') || withoutStandalonePlus;
}

function displaySavedName(saved?: SavedName) {
    if (typeof saved !== 'string') return saved?.name;
    // Old entries stored the full row text, including a trailing add control.
    return saved.trim().replace(/([^+])\+$/, '$1').trimEnd();
}

export class FriendAndFoes extends HHModule {
    private names = new Map<HTMLElement, string>();
    private markMenu: HTMLDivElement | null = null;
    private root: HTMLElement | null = null;
    private rootSelector = '';
    private inLeague = false;

    constructor() {
        const baseKey = 'friendAndFoes'
        const configSchema = {
            baseKey,
            default: true,
            label: settingHelp("Friends and foes", "Right-click each player's name to add or remove a mark. Manage saved marks below."),
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

    readSavedNames(): Record<string, SavedName> {
        const saved = this.readSetting('PlayerMarkNames');
        if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
        return Object.fromEntries(Object.entries(saved).filter((entry): entry is [string, SavedName] => {
            const [, value] = entry;
            return typeof value === 'string' || Boolean(value && typeof value === 'object' && typeof value.name === 'string');
        }));
    }

    saveNames(names: Record<string, SavedName>) {
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
                ? [{ id, name: displaySavedName(names[id]), mark }]
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
                if (name.isConnected && this.names.get(name) === id) act();
            });
            menu.appendChild(button);
        };
        for (const [mark, text] of [['friend', 'Mark as friend'], ['foe', 'Mark as foe']] as const) {
            addAction(text, () => this.applyMark(id, mark));
        }
        if (name.dataset.jarvisMark) addAction('Remove this player’s mark', () => {
            if (this.removeMark(id)) this.refresh();
        });
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

    getContestNames(root: HTMLElement, contests: ContestData[]) {
        const names = new Map<HTMLElement, string>();
        const byContest = new Map<string, Map<string, Set<string>>>();

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
                const matches = byName.get(readRowName(name));
                if (matches && !matches.has(id ?? '')) id = matches.size === 1 ? matches.values().next().value : null;
            }
            if (id && /^[1-9]\d*$/.test(id)) names.set(name, id);
        }
        return names;
    }

    refresh() {
        const root = document.querySelector<HTMLElement>(this.rootSelector);
        this.root = root;
        const contests = this.inLeague ? [] : [
            ...Object.values(window.contests?.active ?? {}),
            ...Object.values(window.contests?.finished ?? {})
        ].filter(contest => contest?.id_contest != null);
        const names = !root ? new Map<HTMLElement, string>() : this.inLeague
            ? new Map(Array.from(root.querySelectorAll<HTMLElement>('.nickname[id-member]'), name => [name, name.getAttribute('id-member')] as const)
                .filter((entry): entry is readonly [HTMLElement, string] => !!entry[1] && /^[1-9]\d*$/.test(entry[1])))
            : this.getContestNames(root, contests);

        for (const name of this.names.keys()) {
            if (names.has(name)) continue;
            delete name.dataset.jarvisPlayer;
            delete name.dataset.jarvisMark;
        }

        this.names = names;
        if (!root) return;
        const marks = this.readMarks();
        const savedNames = this.readSavedNames();
        const rosterNames = new Set<string>();
        let namesChanged = false;
        const rememberName = (id: string, text?: string | null) => {
            const displayName = typeof text === 'string' ? text.trim() : '';
            if (!displayName || (marks[id] !== 'friend' && marks[id] !== 'foe')) return false;
            const previous = savedNames[id];
            if (typeof previous === 'string' || previous?.name !== displayName) {
                savedNames[id] = { name: displayName };
                namesChanged = true;
            }
            return true;
        };
        if (this.inLeague) {
            for (const { player, nickname } of window.opponents_list ?? []) {
                const id = String(player?.id_fighter);
                if (rememberName(id, nickname)) rosterNames.add(id);
            }
        } else {
            // Prefer the active roster if a player appears in both old and current contests.
            for (const contest of contests) {
                for (const { id_member, nickname } of Object.values(contest.participants ?? {})) {
                    const id = String(id_member);
                    if (!rosterNames.has(id) && rememberName(id, nickname)) rosterNames.add(id);
                }
            }
        }
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
                if (!rosterNames.has(id)) rememberName(id, readRowName(name));
            } else if (name.dataset.jarvisMark) {
                delete name.dataset.jarvisMark;
            }
        }
        if (namesChanged) this.saveNames(savedNames);
    }

    applyMark(id: string, mark: Mark) {
        const marks = this.readMarks();
        marks[id] = mark;

        if (this.saveSetting('PlayerMarks', marks)) this.refresh();
    }

    handleMarkMenu(event: MouseEvent) {
        if (event.target instanceof Node && this.markMenu?.contains(event.target)) return;
        this.closeMarkMenu();
        if (event.type !== 'contextmenu' && !event.altKey) return;

        const name = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-jarvis-player]') : null;
        if (!name) return;
        const id = this.names.get(name);
        if (!id) return;
        this.openMarkMenu(event, name, id);
    }

    run({ league, contests }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) {return}

        this.inLeague = currentPage === '/leagues.html';
        if (this.inLeague ? !league : !contests) return;

        this.rootSelector = this.inLeague ? '.league_table' : '#contests .right_part';
        const handleMarkMenu = (event: MouseEvent) => this.handleMarkMenu(event);
        document.addEventListener('click', handleMarkMenu, true);
        document.addEventListener('contextmenu', handleMarkMenu, true);
        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape' || !this.markMenu) return;
            event.preventDefault();
            event.stopPropagation();
            this.closeMarkMenu();
        }, true);
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
