import { LS_CONFIG_NAME } from '../../storage';

export type Mark = 'friend' | 'foe';

export interface SavedMark {
    id: string;
    name?: string;
    mark: Mark;
}

export function openMarkManager(read: () => SavedMark[], remove: (id: string) => boolean, clear: () => boolean) {
    if (document.querySelector('.jarvis-mark-manager')) return;

    const dialog = document.createElement('dialog');
    dialog.className = 'jarvis-mark-manager';
    dialog.setAttribute('aria-labelledby', 'jarvis-mark-manager-title');
    const title = document.createElement('h2');
    title.id = 'jarvis-mark-manager-title';
    title.textContent = 'Friends and foes';

    const lists = document.createElement('div');
    lists.className = 'jarvis-mark-lists';
    const actions = document.createElement('div');
    actions.className = 'jarvis-mark-actions';
    const clearAll = makeButton('Clear all marks', () => {
        if (confirm('Remove all friend and foe marks for this game?') && clear()) {
            render();
            close.focus();
        }
    });
    const close = makeButton('Close', () => dialog.close());
    actions.append(clearAll, close);

    function render() {
        const entries = read().sort((a, b) => Number(!a.name) - Number(!b.name) ||
            (a.name || a.id).localeCompare(b.name || b.id, undefined, { numeric: true }));
        const sections = (['friend', 'foe'] as const).map(mark => {
            const section = document.createElement('section');
            const heading = document.createElement('h3');
            const matches = entries.filter(entry => entry.mark === mark);
            heading.textContent = (mark === 'friend' ? 'Friends' : 'Foes') + ` (${matches.length})`;
            section.appendChild(heading);

            if (matches.length === 0) {
                const empty = document.createElement('p');
                empty.textContent = 'No saved players.';
                section.appendChild(empty);
                return section;
            }

            const list = document.createElement('ul');
            for (const { id, name } of matches) {
                const row = document.createElement('li');
                const player = document.createElement('span');
                player.textContent = name ? `${name} · ${id}` : `Player #${id}`;
                if (!name) player.title = 'Name not recorded yet';
                const button = makeButton('Remove', () => {
                    const index = Array.from(lists.querySelectorAll('button')).indexOf(button);
                    if (remove(id)) {
                        render();
                        const remaining = lists.querySelectorAll('button');
                        (remaining[Math.min(index, remaining.length - 1)] || close).focus();
                    }
                });
                button.setAttribute('aria-label', `Remove ${name || `player ${id}`} from ${mark === 'friend' ? 'friends' : 'foes'}`);
                row.append(player, button);
                list.appendChild(row);
            }
            section.appendChild(list);
            return section;
        });
        lists.replaceChildren(...sections);
        clearAll.disabled = entries.length === 0;
    }

    render();
    dialog.append(title, lists, actions);
    const listeners = new AbortController();
    window.addEventListener('storage', event => {
        if (!event.key || ['PlayerMarks', 'PlayerMarkNames', 'FriendList', 'FoeList']
            .some(key => event.key === LS_CONFIG_NAME + key)) render();
    }, { signal: listeners.signal });
    dialog.addEventListener('close', () => {
        listeners.abort();
        dialog.remove();
    }, { once: true });
    document.body.appendChild(dialog);
    dialog.showModal();
    close.focus();
}

function makeButton(label: string, onClick: () => void) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'jarvis-setting-action';
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
}
