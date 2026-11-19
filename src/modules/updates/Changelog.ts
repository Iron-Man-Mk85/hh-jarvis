import releaseNotes from '../../../CHANGELOG.md';
import { currentPage } from '../../game';
import { HHModule } from '../../HHModule';
import { settingHelp } from '../../settingsHelp';
import { lsGet, lsSet } from '../../storage';
import { showChangelogPopup } from './changelogPopup';

const seenKey = `ChangelogSeen${USERSCRIPT_CHANNEL}`;
const latestVersion = releaseNotes[0].version;
const configKey = 'JARVIS_changelog';
const settingsCard = `.group-panel[rel="JARVIS"] .config-setting[rel="${configKey}"]`;

function readSeenVersion() {
    try {
        const seen = lsGet(seenKey);
        return typeof seen === 'string' && /^\d+\.\d+\.\d+$/.test(seen) ? seen : null;
    } catch {
        return null;
    }
}

function isNewer(version: string, previous: string | null) {
    if (!previous) return true;

    const oldParts = previous.split('.').map(Number);
    const newParts = version.split('.').map(Number);
    for (const [index, part] of newParts.entries()) {
        if (part !== oldParts[index]) return part > oldParts[index];
    }
    return false;
}

function releaseSection(release: typeof releaseNotes[number]) {
    const section = document.createElement('section');
    const heading = document.createElement('h3');
    heading.textContent = `v${release.version}`;
    const changes = document.createElement('ul');
    for (const change of release.changes) {
        const item = document.createElement('li');
        item.textContent = change;
        changes.appendChild(item);
    }
    section.append(heading, changes);
    return section;
}

export class Changelog extends HHModule {
    private pending: 'automatic' | 'manual' | null = null;
    private opener: HTMLButtonElement | null = null;
    private viewedThisPage = false;
    private loadListener: AbortController | null = null;
    private settingsInstalled = false;

    constructor() {
        const baseKey = 'changelog';
        super({ name: baseKey, configSchema: {
            baseKey,
            label: settingHelp('Update notices', 'Show the changelog the first time you load the homepage after an update. Use View changelog to open it whenever you like.'),
            default: true
        } });
    }

    shouldRun() {
        return currentPage === '/home.html';
    }

    installSettings() {
        if (!this.shouldRun()) return;
        this.settingsInstalled = true;

        window.HHPlusPlus.Helpers.doWhenSelectorAvailable(settingsCard, () => {
            const card = document.querySelector(settingsCard);
            if (!card || card.querySelector('.jarvis-view-changelog')) return;

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'jarvis-setting-action jarvis-view-changelog';
            button.textContent = 'View changelog';
            button.addEventListener('click', () => this.open('manual', button));
            card.appendChild(button);
        });
    }

    run() {
        if (this.hasRun || !this.shouldRun()) return;
        this.hasRun = true;
        // HH++ can run the module again when the user turns notices on in the settings pane.
        if (this.settingsInstalled) return;

        const check = () => {
            if (this.hasRun && !this.viewedThisPage && isNewer(latestVersion, readSeenVersion())) this.open('automatic');
        };
        if (document.readyState === 'complete') check();
        else {
            this.loadListener = new AbortController();
            window.addEventListener('load', check, { once: true, signal: this.loadListener.signal });
        }
    }

    tearDown() {
        this.loadListener?.abort();
        this.hasRun = false;
    }

    private disableNotices() {
        const config = window.hhPlusPlusConfig;
        if (!config || !config.config[configKey]) return;

        try {
            config.loadConfig();
            config.config[configKey] = false;
            config.saveConfig();
        } catch (err) {
            config.config[configKey] = true;
            console.warn('Jarvis could not turn off update notices:', err);
            return;
        }

        // HH++ creates its settings pane lazily, so the popup can close before the pane exists.
        const card = document.querySelector(settingsCard);
        const checkbox = card?.querySelector<HTMLInputElement>(`input[name="${configKey}"]`);
        if (checkbox) checkbox.checked = false;
        card?.classList.remove('enabled');
        this.tearDown();
    }

    private open(mode: 'automatic' | 'manual', opener: HTMLButtonElement | null = null) {
        if (!this.shouldRun()) return;
        if (mode === 'manual') this.opener = opener;
        if (this.pending) {
            if (mode === 'manual') this.pending = mode;
            return;
        }
        this.pending = mode;

        const previous = readSeenVersion();
        const content = document.createElement('div');
        content.className = 'container-special-bg jarvis-changelog-content';
        const title = document.createElement('h2');
        title.id = 'jarvis-changelog-title';
        title.textContent = 'Jarvis changelog';
        const notes = document.createElement('div');
        notes.className = 'jarvis-changelog-notes';
        const newReleases = previous && isNewer(latestVersion, previous)
            ? releaseNotes.filter(release => isNewer(release.version, previous)).length
            : 1;
        notes.append(...releaseNotes.slice(0, newReleases).map(releaseSection));
        const earlier = releaseNotes.slice(newReleases);
        if (earlier.length) {
            const history = document.createElement('details');
            const summary = document.createElement('summary');
            summary.textContent = 'Earlier versions';
            history.append(summary, ...earlier.map(releaseSection));
            notes.appendChild(history);
        }

        const footer = document.createElement('footer');
        const optOut = document.createElement('label');
        optOut.className = 'jarvis-changelog-opt-out';
        const dontShowAgain = document.createElement('input');
        dontShowAgain.type = 'checkbox';
        optOut.append(dontShowAgain, 'Don’t show again');
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'jarvis-setting-action';
        closeButton.textContent = 'Close';
        footer.appendChild(closeButton);
        content.append(title, notes, footer);

        showChangelogPopup({
            content,
            closeButton,
            shouldOpen: () => this.pending === 'manual' ||
                (this.hasRun && !this.viewedThisPage && isNewer(latestVersion, readSeenVersion())),
            onOpen: () => {
                this.viewedThisPage = true;
                if (this.hasRun) footer.prepend(optOut);
                try {
                    if (isNewer(latestVersion, readSeenVersion())) lsSet(seenKey, latestVersion);
                } catch (err) {
                    console.warn('Jarvis could not save the viewed changelog version:', err);
                }
            },
            onClose: () => {
                this.pending = null;
                if (dontShowAgain.checked) this.disableNotices();
                this.opener?.focus({ preventScroll: true });
                this.opener = null;
            }
        });
    }
}
