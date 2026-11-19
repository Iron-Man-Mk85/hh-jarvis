interface ContestShortcut {
    id: string;
    category: string;
    name: string;
    rank: string;
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
    select: (id: string) => void
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
        bar.setAttribute('aria-label', 'Active contests');
        bar.addEventListener('click', event => {
            if (!(event.target instanceof Element)) return;
            const id = event.target.closest<HTMLButtonElement>('button[data-contest-id]')?.dataset.contestId;
            if (id) select(id);
        });
        canvas.prepend(bar);
        positionContestShortcuts(canvas, bar);
    }

    const buttons = new Map(Array.from(bar.querySelectorAll('button'), button => [button.dataset.contestId, button]));
    const categories = contests.map(contest => contest.category);
    for (const [index, { id, category, name, rank }] of contests.entries()) {
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
        const description = `${type} · ${name} · ${rank ? `Rank ${rank}` : 'Rank unavailable'}`;
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
