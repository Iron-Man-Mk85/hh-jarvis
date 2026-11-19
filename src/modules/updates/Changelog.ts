import releaseNotes from '../../../CHANGELOG.md';
import { currentPage } from '../../game';
import { HHModule, type ModuleSettings } from '../../HHModule';
import { settingHelp } from '../../settingsHelp';
import { lsGet, lsSet } from '../../storage';
import { showChangelogPopup } from './changelogPopup';

const seenKey = `ChangelogSeen${USERSCRIPT_CHANNEL}`;
const latestVersion = releaseNotes[0].version;
const configKey = 'JARVIS_changelog';
const silentKey = `${configKey}_silent`;
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
    private silent = false;
    private notice: HTMLButtonElement | null = null;
    private waitingForNoticeAnchor = false;

    constructor() {
        const baseKey = 'changelog';
        super({ name: baseKey, configSchema: {
            baseKey,
            label: settingHelp('Update notices', 'Show the changelog the first time you load the homepage after an update. Use View changelog to open it whenever you like.'),
            default: true,
            subSettings: [{
                key: 'silent',
                label: settingHelp('Silent changelog', 'Show a small arc-reactor icon beside HH++ on the homepage after an update. Click it to read the changelog.'),
                default: false
            }]
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

            this.syncNoticeSettings();
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'jarvis-setting-action jarvis-view-changelog';
            button.textContent = 'View changelog';
            button.addEventListener('click', () => this.open('manual', button));
            card.appendChild(button);
        });
    }

    run({ silent = false }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) return;
        this.hasRun = true;
        this.silent = silent;
        // HH++ can run the module again when the user turns notices on in the settings pane.
        const allowAutomatic = !this.settingsInstalled;

        const check = () => {
            if (!this.hasUnreadUpdate()) return;
            if (this.silent) this.showNotice();
            else if (allowAutomatic) this.open('automatic');
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
        this.removeNotice();
    }

    updateSubSetting(key: string, value: boolean) {
        if (key !== 'silent') return;
        this.silent = value;
        if (value) this.showNotice();
        else this.removeNotice();
    }

    private hasUnreadUpdate() {
        return this.hasRun && !this.viewedThisPage && isNewer(latestVersion, readSeenVersion());
    }

    private showNotice() {
        if (!this.silent || !this.hasUnreadUpdate() || this.notice || this.waitingForNoticeAnchor) return;

        const selector = '.hh-plus-plus-config-button';
        this.waitingForNoticeAnchor = true;
        window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
            this.waitingForNoticeAnchor = false;
            const anchor = document.querySelector(selector);
            if (!anchor || !this.silent || !this.hasUnreadUpdate()) return;

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'jarvis-changelog-notice';
            button.dataset.tooltip = 'Jarvis was updated';
            button.setAttribute('aria-label', 'Jarvis was updated. View changelog.');
            button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="7.4" stroke-dasharray="3 1.65"/>
                <path d="M12 7.6l4.4 7.6H7.6Z"/>
            </svg>`;
            button.addEventListener('click', event => {
                event.stopPropagation();
                this.open('manual', button);
            });
            this.notice = anchor.appendChild(button);
        });
    }

    private removeNotice() {
        this.notice?.remove();
        this.notice = null;
    }

    private syncNoticeSettings() {
        const config = window.hhPlusPlusConfig?.config;
        if (!config) return;

        for (const card of document.querySelectorAll(settingsCard)) {
            const enabled = config[configKey];
            const checkbox = card.querySelector<HTMLInputElement>(`input[name="${configKey}"]`);
            const silent = card.querySelector<HTMLInputElement>(`input[name="${silentKey}"]`);
            card.classList.toggle('enabled', enabled);
            if (checkbox) checkbox.checked = enabled;
            if (silent) {
                silent.checked = config[silentKey];
                silent.disabled = !enabled;
            }
        }
    }

    private saveNoticeSetting(key: typeof configKey | typeof silentKey, value: boolean) {
        const config = window.hhPlusPlusConfig;
        if (!config) return;

        let previous = config.config[key];
        try {
            config.loadConfig();
            previous = config.config[key];
            if (config.$configPane && config.updateConfig) {
                config.updateConfig(key, value);
            } else {
                // HH++ builds its settings pane the first time it is opened.
                config.config[key] = value;
                config.saveConfig();
                if (key === silentKey) this.updateSubSetting('silent', value);
                else if (!value) this.tearDown();
            }
        } catch (err) {
            config.config[key] = previous;
            console.warn('Jarvis could not save the update notice preference:', err);
            return;
        }

        this.syncNoticeSettings();
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
        const options = document.createElement('div');
        options.className = 'jarvis-changelog-options';
        const optOut = document.createElement('label');
        const dontShowAgain = document.createElement('input');
        dontShowAgain.type = 'checkbox';
        optOut.append(dontShowAgain, 'Don’t show again');
        const silentOption = document.createElement('label');
        const useSilent = document.createElement('input');
        useSilent.type = 'checkbox';
        useSilent.checked = this.silent;
        silentOption.title = 'Show an update icon beside HH++ for future updates.';
        silentOption.append(useSilent, 'Silent changelog');
        dontShowAgain.addEventListener('change', () => useSilent.disabled = dontShowAgain.checked);
        options.append(optOut, silentOption);
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'jarvis-setting-action';
        closeButton.textContent = 'Close';
        footer.appendChild(closeButton);
        content.append(title, notes, footer);

        showChangelogPopup({
            content,
            closeButton,
            shouldOpen: () => this.pending === 'manual' || (!this.silent && this.hasUnreadUpdate()),
            onOpen: () => {
                this.viewedThisPage = true;
                this.removeNotice();
                if (this.hasRun) footer.prepend(options);
                try {
                    if (isNewer(latestVersion, readSeenVersion())) lsSet(seenKey, latestVersion);
                } catch (err) {
                    console.warn('Jarvis could not save the viewed changelog version:', err);
                }
            },
            onClose: () => {
                this.pending = null;
                if (dontShowAgain.checked) this.saveNoticeSetting(configKey, false);
                else if (this.hasRun && useSilent.checked !== this.silent) {
                    this.saveNoticeSetting(silentKey, useSilent.checked);
                }
                this.opener?.focus({ preventScroll: true });
                this.opener = null;
            }
        });
    }
}
