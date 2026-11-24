import type { ArtGroups, ArtKind } from './gameArt';
import css from './artPreview.css';

const labels = { poses: 'Poses', skins: 'Skins', scenes: 'Scenes' } as const;
const kinds = Object.keys(labels) as ArtKind[];
const hiddenPortrait = 'jarvis-art-original-hidden';

export class ArtPreview {
    private layer = document.createElement('div');
    private style = document.createElement('style');
    private controls = document.createElement('div');
    private groupButtons = new Map<ArtKind, HTMLButtonElement>();
    private originalButton: HTMLButtonElement;
    private navigation = document.createElement('div');
    private previous: HTMLButtonElement;
    private next: HTMLButtonElement;
    private status = document.createElement('span');
    private art: ArtGroups | null = null;
    private portrait: HTMLElement | null = null;
    private displayed: HTMLImageElement | null = null;
    private pending: HTMLImageElement | null = null;
    private kind: ArtKind | null = null;
    private index = 0;
    private scenesEnabled: boolean;

    constructor(readonly host: HTMLElement, scenesEnabled: boolean) {
        this.scenesEnabled = scenesEnabled;
        this.style.textContent = css;
        document.head.append(this.style);

        this.layer.className = 'jarvis-art-preview';
        this.controls.className = 'jarvis-art-controls';
        this.controls.setAttribute('role', 'group');
        this.controls.setAttribute('aria-label', 'Inline art preview');
        this.controls.addEventListener('click', event => event.stopPropagation());
        const groups = document.createElement('div');
        groups.className = 'jarvis-art-groups';
        this.originalButton = this.button('Original', () => this.reset());
        groups.append(this.originalButton);
        for (const kind of kinds) {
            const button = this.button(labels[kind], () => {
                if (kind === this.kind) return;
                this.kind = kind;
                this.index = 0;
                this.showItem();
            });
            this.groupButtons.set(kind, button);
            groups.append(button);
        }

        this.navigation.className = 'jarvis-art-navigation';
        this.previous = this.button('‹', () => this.step(-1));
        this.previous.setAttribute('aria-label', 'Previous preview');
        this.next = this.button('›', () => this.step(1));
        this.next.setAttribute('aria-label', 'Next preview');
        this.status.setAttribute('role', 'status');
        this.navigation.append(this.previous, this.status, this.next);
        this.controls.append(groups, this.navigation);
        this.layer.append(this.controls);
        this.host.append(this.layer);
        this.refreshControls();
    }

    setCharacter(art: ArtGroups | null, portrait: HTMLElement | null) {
        this.reset();
        this.art = art;
        this.portrait = portrait;
        this.refreshControls();
    }

    setScenesEnabled(enabled: boolean) {
        this.scenesEnabled = enabled;
        if (!enabled && this.kind === 'scenes') this.reset();
        else this.refreshControls();
    }

    destroy() {
        this.clearImage();
        this.layer.remove();
        this.style.remove();
    }

    private button(label: string, action: () => void) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'jarvis-setting-action';
        button.textContent = label;
        button.addEventListener('click', action);
        return button;
    }

    private get items() {
        return this.kind ? this.art?.[this.kind] ?? [] : [];
    }

    private refreshControls() {
        for (const [kind, button] of this.groupButtons) {
            button.hidden = !this.art?.[kind].length || (kind === 'scenes' && !this.scenesEnabled);
            button.setAttribute('aria-pressed', String(kind === this.kind));
        }
        this.controls.hidden = ![...this.groupButtons.values()].some(button => !button.hidden);
        this.originalButton.setAttribute('aria-pressed', String(this.kind === null));
        this.navigation.hidden = this.kind === null;
        this.previous.disabled = this.next.disabled = this.items.length < 2;
    }

    private clearImage() {
        this.pending = null;
        this.displayed?.remove();
        this.displayed = null;
        this.portrait?.classList.remove(hiddenPortrait);
    }

    private reset() {
        this.clearImage();
        this.kind = null;
        this.index = 0;
        this.status.textContent = '';
        this.refreshControls();
    }

    private step(delta: number) {
        const { length } = this.items;
        if (length < 2) return;
        this.index = (this.index + delta + length) % length;
        this.showItem();
    }

    private showItem() {
        const item = this.items[this.index];
        if (!item) return;

        this.clearImage();
        this.refreshControls();
        this.status.textContent = 'Loading…';
        const image = document.createElement('img');
        image.className = 'jarvis-art-image';
        image.classList.toggle('jarvis-art-scene', this.kind === 'scenes');
        image.alt = item.label;
        this.pending = image;

        image.onload = () => {
            if (this.pending !== image) return;
            this.pending = null;
            this.displayed = image;
            this.layer.prepend(image);
            this.portrait?.classList.add(hiddenPortrait);
            this.status.textContent = `${item.label} · ${this.index + 1}/${this.items.length}`;
        };
        image.onerror = () => {
            if (this.pending !== image) return;
            this.pending = null;
            this.status.textContent = 'Preview unavailable';
        };
        image.src = item.url;
    }
}
