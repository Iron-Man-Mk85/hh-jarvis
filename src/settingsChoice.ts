export function makeChoice<T extends string>(label: string, options: ReadonlyArray<readonly [T, string]>, select: (value: T) => void) {
    const group = document.createElement('span');
    group.className = 'jarvis-choice';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', label);
    group.addEventListener('keydown', event => event.stopPropagation());
    for (const [value, text] of options) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = text;
        button.dataset.choice = value;
        button.addEventListener('click', event => {
            event.stopPropagation();
            select(value);
        });
        group.appendChild(button);
    }
    return group;
}

export function selectChoice(group: HTMLElement, value: string) {
    for (const button of group.querySelectorAll('button')) {
        button.setAttribute('aria-pressed', String(button.dataset.choice === value));
    }
}
