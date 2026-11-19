import { $ } from '../../game';

interface ChangelogView {
    content: HTMLElement;
    closeButton: HTMLButtonElement;
    shouldOpen: () => boolean;
    onOpen: () => void;
    onClose: () => void;
}

export function showChangelogPopup(view: ChangelogView) {
    const queue = window.shared?.PopupQueueManager;
    const host = document.getElementById('common-popups');
    if (host && typeof queue?.add === 'function' && typeof queue.close === 'function') {
        const wrapper = document.createElement('div');
        wrapper.className = 'popup_wrapper jarvis-changelog-native';
        const backdrop = document.createElement('div');
        backdrop.className = 'popup_background clickable';
        const panel = document.createElement('div');
        panel.className = 'popup jarvis-changelog-popup';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-labelledby', 'jarvis-changelog-title');
        panel.appendChild(view.content);
        wrapper.append(backdrop, panel);

        const handlers = new AbortController();
        const dismiss = () => queue.close({ type: 'common' });
        try {
            queue.add({ popup: {
                type: 'common',
                popup_name: 'jarvis_changelog',
                close_on_esc: true,
                $dom_element: $(wrapper),
                init: () => host.appendChild(wrapper),
                onOpen: () => {
                    if (!view.shouldOpen()) {
                        queueMicrotask(dismiss);
                        return;
                    }
                    if (!wrapper.isConnected) host.appendChild(wrapper);
                    view.onOpen();
                    requestAnimationFrame(() => view.closeButton.focus({ preventScroll: true }));
                },
                addEventListeners: () => {
                    for (const target of [backdrop, view.closeButton]) {
                        target.addEventListener('click', dismiss, { signal: handlers.signal });
                    }
                },
                onClose: () => {
                    wrapper.remove();
                    view.onClose();
                },
                removeEventListeners: () => handlers.abort(),
                destroy: dismiss
            } });
            return;
        } catch (err) {
            handlers.abort();
            wrapper.remove();
            console.warn('Jarvis could not use the game popup queue:', err);
        }
    }

    if (!view.shouldOpen()) {
        view.onClose();
        return;
    }
    const dialog = document.createElement('dialog');
    dialog.className = 'jarvis-changelog-popup';
    dialog.setAttribute('aria-labelledby', 'jarvis-changelog-title');
    dialog.appendChild(view.content);
    view.closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
        dialog.remove();
        view.onClose();
    }, { once: true });
    document.body.appendChild(dialog);
    dialog.showModal();
    view.closeButton.focus({ preventScroll: true });
    view.onOpen();
}
