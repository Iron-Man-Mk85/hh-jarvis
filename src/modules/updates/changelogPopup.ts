interface ChangelogView {
    content: HTMLElement;
    closeButton: HTMLButtonElement;
    shouldOpen: () => boolean;
    onOpen: () => void;
    onClose: (dismissed: boolean) => void;
}

const gamePopupRoots = '#common-popups, #popups, #sliding-popups';
const gamePopupPanels = '#common-popups .popup_wrapper .popup, #popups > div:not(.notifs), #sliding-popups > div:not(.notifs)';

export function showChangelogPopup(view: ChangelogView) {
    const dialog = document.createElement('dialog');
    dialog.className = 'jarvis-changelog-popup';
    dialog.setAttribute('aria-labelledby', 'jarvis-changelog-title');
    dialog.appendChild(view.content);

    const gamePopupOpen = () => Array.from(document.querySelectorAll(gamePopupPanels)).some(popup =>
        popup.getClientRects().length > 0 && getComputedStyle(popup).visibility === 'visible'
    );
    let opened = false;
    const finish = (dismissed: boolean) => {
        observer.disconnect();
        if (dialog.open) dialog.close();
        dialog.remove();
        view.onClose(dismissed);
    };
    const sync = () => {
        if (!opened && !view.shouldOpen()) {
            finish(false);
            return;
        }
        if (gamePopupOpen()) {
            // Release the browser's modal state so the game can receive input.
            if (dialog.open) dialog.close();
            return;
        }
        if (dialog.open) return;
        if (!dialog.isConnected) document.body.appendChild(dialog);
        try {
            dialog.showModal();
        } catch (err) {
            finish(false);
            console.warn('Jarvis could not open the changelog:', err);
            return;
        }
        view.closeButton.focus({ preventScroll: true });
        if (!opened) {
            opened = true;
            view.onOpen();
        }
    };
    const observer = new MutationObserver(sync);
    for (const root of document.querySelectorAll(gamePopupRoots)) {
        observer.observe(root, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'hidden']
        });
    }

    const dismiss = () => {
        if (dialog.open && !gamePopupOpen()) finish(true);
    };
    view.closeButton.addEventListener('click', dismiss);
    dialog.addEventListener('cancel', event => {
        event.preventDefault();
        dismiss();
    });
    sync();
}
