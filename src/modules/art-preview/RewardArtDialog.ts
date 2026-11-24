import { ArtPreview } from './ArtPreview';
import { getArtGroups, getOriginalArt, rewardThumbnail, type RewardArt } from './gameArt';

const rarities = new Set(['common', 'rare', 'epic', 'legendary', 'mythic']);

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

        const choices: HTMLButtonElement[] = [];
        if (entries.length > 1) {
            const picker = document.createElement('div');
            picker.className = 'jarvis-art-character-picker hh-scroll';
            picker.setAttribute('role', 'group');
            picker.setAttribute('aria-label', 'Reward character');
            entries.forEach(({ reward }, index) => {
                const choice = document.createElement('button');
                const name = reward.name || `Reward ${index + 1}`;
                const rarity = reward.rarity || 'common';
                choice.type = 'button';
                choice.className = `slot slot_girl_shards size_small jarvis-art-character ${rarities.has(rarity) ? rarity : 'common'}`;
                choice.setAttribute('aria-label', name);
                choice.title = name;
                const thumbnail = rewardThumbnail(reward);
                if (thumbnail) {
                    const icon = document.createElement('img');
                    icon.alt = '';
                    icon.addEventListener('error', () => { choice.textContent = name; }, { once: true });
                    icon.src = thumbnail;
                    choice.append(icon);
                } else choice.textContent = name;
                choice.addEventListener('click', () => render(index));
                choices.push(choice);
                picker.append(choice);
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
        let selected = -1;
        const render = (index: number) => {
            if (selected === index) return;
            selected = index;
            choices.forEach((choice, index) => choice.setAttribute('aria-pressed', String(index === selected)));
            const { reward, native } = entries[index];
            title.textContent = reward.name || 'Reward art';
            viewer.setCharacter(getArtGroups(reward.preview ?? {}), null, getOriginalArt(reward, native ?? null));
        };
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
