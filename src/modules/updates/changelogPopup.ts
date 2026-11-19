interface ChangelogView {
    content: HTMLElement;
    closeButton: HTMLButtonElement;
    shouldOpen: () => boolean;
    onOpen: () => void;
    onClose: () => void;
}

export function showChangelogPopup(view: ChangelogView) {
    if (!view.shouldOpen()) {
        view.onClose();
        return;
    }

    const dialog = document.createElement('dialog');
    dialog.className = 'jarvis-changelog-popup';
    dialog.setAttribute('aria-labelledby', 'jarvis-changelog-title');
    dialog.appendChild(view.content);

    // Let the browser own the modal state and restore page input when it closes.
    const dismiss = () => dialog.close();
    view.closeButton.addEventListener('click', dismiss);
    dialog.addEventListener('cancel', event => {
        event.preventDefault();
        dismiss();
    });
    dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) dismiss();
    });
    dialog.addEventListener('close', () => {
        dialog.remove();
        view.onClose();
    }, { once: true });

    document.body.appendChild(dialog);
    try {
        dialog.showModal();
    } catch (err) {
        dialog.remove();
        view.onClose();
        console.warn('Jarvis could not open the changelog:', err);
        return;
    }
    view.closeButton.focus({ preventScroll: true });
    view.onOpen();
}
