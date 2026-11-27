import { currentPage } from '../../game';
import { HHModule } from '../../HHModule';
import { settingHelp } from '../../settingsHelp';
import { LS_CONFIG_NAME, lsGet, lsRm, lsSet } from '../../storage';

const linkKey = 'LeagueClubmatesLink';
const baseKey = 'leagueClubmates';
const leagueTimer = '#leagues .league_end_in';

function parseLink(value: string) {
    if (!URL.canParse(value)) return null;
    const url = new URL(value);
    if (url.origin !== 'https://script.google.com' || url.username || url.password ||
        !/^\/macros\/s\/[\w-]+\/exec$/.test(url.pathname)) return null;
    url.hash = '';
    return url;
}

function savedLink() {
    try {
        const value = lsGet(linkKey);
        return typeof value === 'string' ? parseLink(value) : null;
    } catch {
        return null;
    }
}

export function installLeagueClubmatesSettings() {
    if (currentPage !== '/home.html') return;
    const selector = `.group-panel[rel="JARVIS"] .config-setting[rel="JARVIS_${baseKey}"]`;
    window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
        const card = document.querySelector(selector);
        if (!card || card.querySelector('.jarvis-league-link')) return;

        const fieldset = document.createElement('fieldset');
        fieldset.className = 'jarvis-league-link';
        const label = document.createElement('label');
        label.htmlFor = 'jarvis-league-clubmates-link';
        label.textContent = 'Apps Script web app link';
        const input = document.createElement('input');
        input.id = label.htmlFor;
        input.type = 'password';
        input.placeholder = 'Paste the /exec link';
        input.autocomplete = 'off';
        input.spellcheck = false;
        input.value = savedLink()?.href ?? '';

        const save = document.createElement('button');
        save.type = 'button';
        save.className = 'blue_button_L';
        save.textContent = 'Save';
        const status = document.createElement('span');
        status.setAttribute('role', 'status');
        const saveLink = () => {
            const value = input.value.trim();
            const url = parseLink(value);
            if (value && !url) {
                status.textContent = 'Enter a Google Apps Script link ending in /exec.';
                return;
            }
            try {
                if (url) lsSet(linkKey, url.href);
                else lsRm(linkKey);
                input.value = url?.href ?? '';
                status.textContent = url ? 'Saved for this game.' : 'Link removed.';
            } catch {
                status.textContent = 'Could not save the link.';
            }
        };
        input.addEventListener('input', () => { status.textContent = ''; });
        input.addEventListener('keydown', event => {
            event.stopPropagation();
            if (event.key !== 'Enter') return;
            event.preventDefault();
            saveLink();
        });
        save.addEventListener('click', saveLink);

        const refresh = () => { fieldset.hidden = fieldset.disabled = !card.classList.contains('enabled'); };
        refresh();
        new MutationObserver(refresh).observe(card, { attributeFilter: ['class'] });
        fieldset.append(label, input, save, status);
        card.append(fieldset);
    });
}

function normalizeId(value: string | number) {
    return String(value).replace(/\s+/g, '');
}

function leagueReport(heading: string, rows: unknown[], opponents: NonNullable<Window['opponents_list']>) {
    const members = new Map<string, string>();
    for (const row of rows) {
        if (!Array.isArray(row) || row.length !== 2 ||
            typeof row[0] !== 'string' || typeof row[1] !== 'string') return null;
        const id = normalizeId(row[0]);
        if (!/^\d+$/.test(id)) return null;
        if (!members.has(id)) members.set(id, row[1]);
    }

    const heroId = (window.shared?.Hero ?? window.Hero)?.infos?.id;
    const yes: string[] = [];
    const notes: string[] = [];
    const no: string[] = [];
    for (const { player, nickname } of opponents) {
        if (player?.id_fighter == null || String(player.id_fighter) === String(heroId)) continue;
        const name = player.nickname || nickname;
        const weakening = members.get(normalizeId(player.id_fighter));
        if (!name || !weakening) continue;
        switch (weakening.toLowerCase()) {
            case 'yes': yes.push(name); break;
            case 'no': no.push(`~~${name}~~`); break;
            default: notes.push(`${name} (${weakening})`);
        }
    }

    const lines = [yes, notes, no].filter(group => group.length)
        .map(group => group.sort((a, b) => a.localeCompare(b, 'en-US')).join(', '));
    return [`## ${heading}`, '```', ...(lines.length ? lines : ['Me, myself and I 🥲']), '```'].join('\n');
}

export class LeagueClubmates extends HHModule {
    private control?: HTMLElement;
    private active?: AbortController;

    constructor() {
        super({ name: baseKey, configSchema: {
            baseKey,
            default: false,
            label: settingHelp('League clubmates', 'Copy a Discord-ready list of clubmates in your current league. Add your club’s Apps Script web app link to read the latest roster when you click.')
        } });
    }

    shouldRun() {
        return currentPage.includes('/leagues.html');
    }

    run() {
        if (this.hasRun || !this.shouldRun()) return;
        this.hasRun = true;
        const { signal } = this.active = new AbortController();
        const mount = () => {
            const timer = document.querySelector(leagueTimer);
            if (!signal.aborted && timer && !this.control && savedLink()) this.mountButton(timer);
        };
        window.HHPlusPlus.Helpers.doWhenSelectorAvailable(leagueTimer, mount);
        window.addEventListener('storage', event => {
            if (event.key !== LS_CONFIG_NAME + linkKey && event.key !== null) return;
            this.removeButton();
            mount();
        }, { signal });
    }

    tearDown() {
        this.hasRun = false;
        this.active?.abort();
        this.active = undefined;
        this.removeButton();
    }

    private removeButton() {
        this.control?.remove();
        this.control = undefined;
    }

    private mountButton(timer: Element) {
        const control = document.createElement('span');
        control.className = 'jarvis-league-copy';
        const button = document.createElement('button');
        button.type = 'button';
        const label = 'Copy clubmates for Discord';
        button.setAttribute('aria-label', label);
        button.setAttribute('hh_title', label);
        button.setAttribute('tooltip', '');
        const status = document.createElement('span');
        status.setAttribute('role', 'status');
        control.append(button, status);
        timer.after(control);
        this.control = control;

        let clearStatus: number;
        button.addEventListener('click', async () => {
            clearTimeout(clearStatus);
            status.textContent = 'Reading roster…';
            button.disabled = true;
            const message = await this.copy(control);
            button.disabled = false;
            status.textContent = message;
            clearStatus = window.setTimeout(() => { status.textContent = ''; }, message === 'Copied' ? 2200 : 6500);
        });
    }

    private async copy(control: HTMLElement) {
        const url = savedLink();
        if (!url) {
            this.removeButton();
            return '';
        }
        const { opponents_list: opponents } = window;
        if (!opponents?.length) return 'League standings are unavailable.';
        url.searchParams.set('game', location.hostname.split('.').slice(-2).join('.'));

        let report: string | null;
        try {
            const response = await fetch(url, {
                cache: 'no-store',
                credentials: 'omit',
                referrerPolicy: 'no-referrer',
                signal: AbortSignal.timeout(15000)
            });
            if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json')) {
                return 'Check that the Apps Script web app allows anyone.';
            }
            const roster: unknown = await response.json();
            if (!roster || typeof roster !== 'object' || !('heading' in roster) || typeof roster.heading !== 'string' ||
                !roster.heading.trim() || !('rows' in roster) || !Array.isArray(roster.rows)) {
                return 'The web app did not return a league roster.';
            }
            report = leagueReport(roster.heading, roster.rows, opponents);
            if (!report) return 'The league roster has an unexpected format.';
        } catch {
            return 'Could not read the roster. Check the link and try again.';
        }

        if (!control.isConnected) return '';
        try {
            await navigator.clipboard.writeText(report);
            return 'Copied';
        } catch {
            return 'Keep this tab focused and try copying again.';
        }
    }
}
