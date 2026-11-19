import { $ } from '../../game';

interface ChangelogView {
    content: HTMLElement;
    closeButton: HTMLButtonElement;
    shouldOpen: () => boolean;
    onOpen: () => void;
    onClose: () => void;
}

export function showChangelogPopup(view: ChangelogView) {
    const dialog = document.createElement('dialog');
    dialog.className = 'jarvis-changelog-popup';
    dialog.setAttribute('aria-labelledby', 'jarvis-changelog-title');
    dialog.appendChild(view.content);

    const openDialog = () => {
        dialog.showModal();
        view.closeButton.focus({ preventScroll: true });
        view.onOpen();
    };
    const bindClose = (dismiss: () => void) => {
        const handlers = new AbortController();
        const options = { signal: handlers.signal };
        view.closeButton.addEventListener('click', dismiss, options);
        dialog.addEventListener('cancel', event => {
            event.preventDefault();
            dismiss();
        }, options);
        dialog.addEventListener('click', event => {
            if (event.target !== dialog) return;
            const bounds = dialog.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right ||
                event.clientY < bounds.top || event.clientY > bounds.bottom) dismiss();
        }, options);
        return handlers;
    };

    const queue = window.shared?.PopupQueueManager;
    const host = document.getElementById('common-popups');
    if (host && typeof queue?.add === 'function' && typeof queue.close === 'function') {
        const wrapper = document.createElement('div');
        wrapper.className = 'popup_wrapper jarvis-changelog-native';
        wrapper.appendChild(dialog);
        let active = false;
        const dismiss = () => {
            if (!active) return;
            active = false;
            queue.close({ type: 'common' });
        };
        const handlers = bindClose(dismiss);
        try {
            queue.add({ popup: {
                type: 'common',
                popup_name: 'jarvis_changelog',
                close_on_esc: false, // The dialog handles Escape, so the queue is closed only once.
                $dom_element: $(wrapper),
                init: () => host.appendChild(wrapper),
                onOpen: () => {
                    active = true;
                    if (!view.shouldOpen()) {
                        queueMicrotask(dismiss);
                        return;
                    }
                    if (!wrapper.isConnected) host.appendChild(wrapper);
                    openDialog();
                },
                addEventListeners: () => {},
                onClose: () => {
                    active = false;
                    if (dialog.open) dialog.close();
                    wrapper.remove();
                    view.onClose();
                },
                removeEventListeners: () => handlers.abort(),
                destroy: dismiss
            } });
            return;
        } catch (err) {
            handlers.abort();
            if (dialog.open) dialog.close();
            wrapper.remove();
            console.warn('Jarvis could not use the game popup queue:', err);
        }
    }

    if (!view.shouldOpen()) {
        view.onClose();
        return;
    }
    const handlers = bindClose(() => dialog.close());
    dialog.addEventListener('close', () => {
        handlers.abort();
        dialog.remove();
        view.onClose();
    }, { once: true });
    document.body.appendChild(dialog);
    openDialog();
}
