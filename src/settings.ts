import { currentPage } from './game';
import { mountSettingsHelp } from './settingsHelp';
import css from './settings.css';

const columns = [
    [
        { id: 'jarvis-leagues-and-contests', label: 'Leagues and contests', keys: ['friendAndFoes', 'contestStart', 'leagueTop20'] },
        { id: 'jarvis-navigation-and-passes', label: 'Navigation and passes', keys: ['gameLinks', 'removePassLock'] }
    ],
    [
        { id: 'jarvis-raids-and-exports', label: 'Love Raids and exports', keys: ['loveRaidsAddon', 'loveRaidsParser', 'activityParser'] },
        { id: 'jarvis-script-updates', label: 'Script updates', keys: ['changelog'] }
    ]
];

export function injectStyles() {
    const style = document.createElement('style');
    style.className = 'hh-jarvis-style';
    const version = `v${USERSCRIPT_VERSION}${USERSCRIPT_CHANNEL === 'Dev' ? ' Dev' : ''}`;
    style.textContent = `${css}
        .hh-plus-plus-config-panel { --jarvis-version: "${version}"; }
    `;
    document.head.appendChild(style);
}

export function packSettings() {
    if (currentPage !== '/home.html') return;

    const selector = '.hh-plus-plus-config-panel .group-panel[rel="JARVIS"] .panel-contents';
    window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
        const panel = document.querySelector<HTMLElement>(selector);
        if (!panel || panel.classList.contains('jarvis-settings-layout')) return;
        panel.classList.remove('hh-scroll');
        for (const sections of columns) {
            const column = document.createElement('div');
            column.className = 'jarvis-settings-column';
            for (const { id, label, keys } of sections) {
                const cards = keys.flatMap(key => {
                    const card = panel.querySelector(`.config-setting[rel="JARVIS_${key}"]`);
                    return card ? [card] : [];
                });
                if (!cards.length) continue;

                const section = document.createElement('section');
                section.className = 'jarvis-settings-section';
                section.setAttribute('aria-labelledby', id);
                const heading = document.createElement('h5');
                heading.id = id;
                heading.textContent = label;
                section.append(heading, ...cards);
                column.appendChild(section);
            }
            if (column.childElementCount) panel.appendChild(column);
        }
        panel.classList.add('jarvis-settings-layout');
        mountSettingsHelp(panel, 'jarvis-setting-tooltip');
        window.addEventListener('wheel', event => {
            if (event.ctrlKey || !(event.target instanceof Node) || !panel.contains(event.target)) return;

            event.preventDefault();
            event.stopImmediatePropagation();
            const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? panel.clientHeight : 1;
            const scale = panel.getBoundingClientRect().height / panel.offsetHeight || 1;
            panel.scrollTop += event.deltaY * unit / scale;
        }, { capture: true, passive: false });
    });
}
