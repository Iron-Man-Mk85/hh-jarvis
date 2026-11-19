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

    const finish = () => {
        if (!dialog.isConnected) return;
        dialog.remove();
        view.onClose();
    };
    // Apply the user's choice before a subsequent click or page navigation.
    const dismiss = () => {
        dialog.close();
        finish();
    };
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
    dialog.addEventListener('close', finish, { once: true });

    document.body.appendChild(dialog);
    try {
        dialog.showModal();
    } catch (err) {
        finish();
        console.warn('Jarvis could not open the changelog:', err);
        return;
    }
    view.closeButton.focus({ preventScroll: true });
    view.onOpen();
}
