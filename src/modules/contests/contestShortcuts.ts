interface ContestShortcut {
    id: string;
    category: string;
    name: string;
    rank: string;
    skipped: boolean;
}

export function positionContestShortcuts(canvas: HTMLElement, bar: HTMLElement) {
    const close = canvas.parentElement?.querySelector(':scope > .close_cross');
    if (!close) return;

    const frame = canvas.getBoundingClientRect();
    const cross = close.getBoundingClientRect();
    const scaleX = frame.width / canvas.offsetWidth;
    const scaleY = frame.height / canvas.offsetHeight;
    if (!scaleX || !scaleY || !cross.width) return;

    bar.style.insetInlineEnd = `${Math.ceil((frame.right - cross.left) / scaleX + 8)}px`;
    bar.style.insetBlockStart = `${Math.round((cross.top + cross.height / 2 - frame.top) / scaleY)}px`;
}

export function renderContestShortcuts(
    canvas: HTMLElement,
    contests: ContestShortcut[],
    selected: string | null,
    select: (id: string) => void,
    reload: () => Promise<string | undefined>
) {
    let bar = canvas.querySelector<HTMLElement>(':scope > .jarvis-contest-shortcuts');
    if (!contests.length) {
        bar?.remove();
        return;
    }
    if (!bar) {
        bar = document.createElement('div');
        bar.className = 'jarvis-contest-shortcuts';
        bar.setAttribute('role', 'group');
        bar.setAttribute('aria-label', 'Contest shortcuts');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'jarvis-contest-reload';
        button.title = 'Reload selected contest';
        button.setAttribute('aria-label', button.title);
        const icon = document.createElement('strong');
        icon.textContent = '↻';
        icon.setAttribute('aria-hidden', 'true');
        const label = document.createElement('span');
        label.textContent = 'Reload';
        button.append(icon, label);
        const status = document.createElement('div');
        status.className = 'jarvis-contest-reload-status';
        status.setAttribute('role', 'status');
        button.addEventListener('click', async event => {
            event.stopPropagation();
            if (button.getAttribute('aria-busy') === 'true') return;
            status.textContent = '';
            button.setAttribute('aria-busy', 'true');
            try {
                status.textContent = await reload() ?? '';
            } finally {
                button.removeAttribute('aria-busy');
            }
        });
        bar.addEventListener('click', event => {
            if (!(event.target instanceof Element)) return;
            const id = event.target.closest<HTMLButtonElement>('button[data-contest-id]')?.dataset.contestId;
            if (id) select(id);
        });
        bar.append(button, status);
        canvas.prepend(bar);
        positionContestShortcuts(canvas, bar);
    }

    const reloadButton = bar.querySelector<HTMLButtonElement>('.jarvis-contest-reload');
    if (reloadButton) reloadButton.disabled = !contests.some(contest => contest.id === selected);
    if (bar.dataset.selectedContest !== (selected ?? '')) {
        bar.dataset.selectedContest = selected ?? '';
        bar.querySelector('.jarvis-contest-reload-status')?.replaceChildren();
    }
    const buttons = new Map(Array.from(bar.querySelectorAll<HTMLButtonElement>('button[data-contest-id]'),
        button => [button.dataset.contestId, button]));
    const categories = contests.map(contest => contest.category);
    for (const [index, { id, category, name, rank, skipped }] of contests.entries()) {
        let button = buttons.get(id);
        if (!button) {
            button = document.createElement('button');
            button.type = 'button';
            button.dataset.contestId = id;
            button.append(document.createElement('span'), document.createElement('strong'));
        }
        const type = categories.indexOf(category) === categories.lastIndexOf(category) ?
            category : `${category} ${categories.slice(0, index + 1).filter(value => value === category).length}`;
        const [label, placement] = Array.from(button.children);
        if (label.textContent !== type) label.textContent = type;
        if (placement.textContent !== (rank || '–')) placement.textContent = rank || '–';
        button.classList.toggle('jarvis-contest-shortcut-skipped', skipped);
        const description = `${type} · ${name} · ${rank ? `Rank ${rank}` : 'Rank unavailable'}${skipped ? ' · Skipped for today' : ''}`;
        if (button.title !== description) {
            button.title = description;
            button.setAttribute('aria-label', description);
        }
        const pressed = String(id === selected);
        if (button.getAttribute('aria-pressed') !== pressed) button.setAttribute('aria-pressed', pressed);

        if (button !== bar.children[index]) bar.insertBefore(button, bar.children[index] ?? null);
        buttons.delete(id);
    }
    for (const button of buttons.values()) button.remove();
}
