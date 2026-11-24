import { ArtPreview } from './ArtPreview';
import { getArtGroups, getOriginalArt, type RewardArt } from './gameArt';

export interface RewardArtEntry {
    reward: RewardArt;
    native?: HTMLElement;
}

export class RewardArtDialog {
    private session: { dialog: HTMLDialogElement; viewer: ArtPreview; opener: HTMLElement } | null = null;

    show(entries: RewardArtEntry[], opener: HTMLElement) {
        if (!entries.length) return;
        this.close();
        const dialog = document.createElement('dialog');
        dialog.className = 'jarvis-art-dialog container-special-bg';
        dialog.setAttribute('aria-labelledby', 'jarvis-art-dialog-title');
        const header = document.createElement('header');
        const title = document.createElement('h2');
        title.id = 'jarvis-art-dialog-title';
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'blue_button_L';
        close.textContent = 'Close';
        close.addEventListener('click', () => this.close());
        header.append(title);

        const picker = document.createElement('select');
        if (entries.length > 1) {
            picker.setAttribute('aria-label', 'Reward character');
            entries.forEach(({ reward }, index) => {
                const option = document.createElement('option');
                option.value = String(index);
                option.textContent = reward.name || `Reward ${index + 1}`;
                picker.append(option);
            });
            header.append(picker);
        }
        header.append(close);

        const viewerArea = document.createElement('div');
        viewerArea.className = 'jarvis-art-dialog-body';
        const stage = document.createElement('div');
        stage.className = 'jarvis-art-dialog-stage';
        viewerArea.append(stage);
        dialog.append(header, viewerArea);
        document.body.append(dialog);
        const viewer = new ArtPreview(stage, this.scenesEnabled, viewerArea);
        this.session = { dialog, viewer, opener };
        dialog.addEventListener('keydown', event => { if (event.key === 'Escape') event.stopPropagation(); });
        dialog.addEventListener('cancel', event => { event.preventDefault(); this.close(); });
        dialog.addEventListener('close', () => { if (this.session?.dialog === dialog) this.close(); });
        const render = (index: number) => {
            const { reward, native } = entries[index];
            title.textContent = reward.name || 'Reward art';
            viewer.setCharacter(getArtGroups(reward.preview ?? {}), null, getOriginalArt(reward, native ?? null));
        };
        picker.addEventListener('change', () => render(Number(picker.value)));
        dialog.showModal();
        render(0);
        close.focus({ preventScroll: true });
    }

    constructor(private scenesEnabled: boolean) {}

    setScenesEnabled(enabled: boolean) {
        this.scenesEnabled = enabled;
        this.session?.viewer.setScenesEnabled(enabled);
    }

    close() {
        if (!this.session) return;
        const { dialog, viewer, opener } = this.session;
        this.session = null;
        viewer.destroy();
        dialog.close();
        dialog.remove();
        if (opener.isConnected) opener.focus({ preventScroll: true });
    }
}
