import type { ArtGroups, ArtKind } from './gameArt';
import { playSpine } from './spinePreview';
import { ArtGestures } from './ArtGestures';
import css from './artPreview.css';

const labels = { poses: 'Poses', skins: 'Skins', scenes: 'Scenes' } as const;
const kinds = Object.keys(labels) as ArtKind[];
const originalMedia = 'jarvis-art-native';
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
    private replacement: HTMLElement | null = null;
    private loading: AbortController | null = null;
    private kind: ArtKind | null = null;
    private index = 0;
    private scenesEnabled: boolean;
    private gestures: ArtGestures;
    private adjustButton: HTMLButtonElement;
    private originalAdjust = false;

    constructor(readonly host: HTMLElement, scenesEnabled: boolean, readonly controlHost = host) {
        this.scenesEnabled = scenesEnabled;
        this.style.textContent = css;
        document.head.append(this.style);

        this.layer.className = 'jarvis-art-preview';
        this.gestures = new ArtGestures(this.host, this.layer, (zoom, x, y) => this.applyFraming(zoom, x, y));
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
                if (this.kind === null) this.gestures.reset();
                this.kind = kind;
                this.index = 0;
                this.showItem();
            });
            this.groupButtons.set(kind, button);
            groups.append(button);
        }
        this.adjustButton = this.button('Adjust', () => {
            this.originalAdjust = !this.originalAdjust;
            if (!this.originalAdjust) this.gestures.reset();
            this.refreshControls();
        });
        this.adjustButton.title = 'Enable wheel zoom and drag to move the original art';
        groups.append(this.adjustButton);
        const resetView = this.button('Reset', () => this.gestures.reset());
        resetView.title = 'Reset zoom and position';
        groups.append(resetView);

        this.navigation.className = 'jarvis-art-navigation';
        this.previous = this.button('‹', () => this.step(-1));
        this.previous.setAttribute('aria-label', 'Previous preview');
        this.next = this.button('›', () => this.step(1));
        this.next.setAttribute('aria-label', 'Next preview');
        this.status.setAttribute('role', 'status');
        this.navigation.append(this.previous, this.status, this.next);
        this.controls.append(groups, this.navigation);
        this.controlHost.append(this.controls);
        this.host.append(this.layer);
        this.refreshControls();
    }

    get mounted() {
        return this.layer.isConnected && this.controls.isConnected;
    }

    dockBefore(anchor: HTMLElement | null) {
        const bounds = this.controlHost.getBoundingClientRect();
        const target = anchor?.getBoundingClientRect();
        const visible = Boolean(target?.width && target.height && bounds.width && bounds.height);
        this.controls.toggleAttribute('data-jarvis-art-docked', visible);
        if (!visible || !target) return;

        const x = (target.left - bounds.left) * this.controlHost.clientWidth / bounds.width - 8;
        const y = (target.top + target.height / 2 - bounds.top) * this.controlHost.clientHeight / bounds.height;
        this.controls.style.setProperty('--jarvis-art-anchor-x', `${x}px`);
        this.controls.style.setProperty('--jarvis-art-anchor-y', `${y}px`);
    }

    setCharacter(art: ArtGroups | null, portrait: HTMLElement | null) {
        this.reset();
        this.portrait?.classList.remove(originalMedia);
        this.art = art;
        this.portrait = portrait;
        this.portrait?.classList.add(originalMedia);
        this.refreshControls();
    }

    setScenesEnabled(enabled: boolean) {
        this.scenesEnabled = enabled;
        if (!enabled && this.kind === 'scenes') this.reset();
        else this.refreshControls();
    }

    destroy() {
        this.clearImage();
        this.gestures.reset();
        this.portrait?.classList.remove(originalMedia);
        this.layer.remove();
        this.controls.remove();
        this.style.remove();
    }

    private button(label: string, action: () => void) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'blue_button_L';
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
        this.adjustButton.hidden = this.kind !== null;
        this.adjustButton.setAttribute('aria-pressed', String(this.originalAdjust));
        this.navigation.hidden = this.kind === null;
        this.previous.disabled = this.next.disabled = this.items.length < 2;
        this.gestures.setEnabled(!this.controls.hidden && (this.kind !== null || this.originalAdjust));
    }

    private clearImage() {
        this.loading?.abort();
        this.loading = null;
        this.replacement?.remove();
        this.replacement = null;
        this.portrait?.classList.remove(hiddenPortrait);
    }

    private applyFraming(zoom: number, x: number, y: number) {
        const changed = zoom !== 1 || x !== 0 || y !== 0;
        this.portrait?.toggleAttribute('data-jarvis-art-framed', changed);
        for (const node of [this.portrait, this.layer]) {
            if (!node) continue;
            if (!changed) {
                node.style.removeProperty('--jarvis-art-shift');
                node.style.removeProperty('--jarvis-art-scale');
            } else {
                node.style.setProperty('--jarvis-art-shift', `${x}px ${y}px`);
                node.style.setProperty('--jarvis-art-scale', String(zoom));
            }
        }
    }

    private reset() {
        this.clearImage();
        this.gestures.reset();
        this.kind = null;
        this.originalAdjust = false;
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
        this.loading = new AbortController();
        const { signal } = this.loading;
        const stage = document.createElement('div');
        stage.className = 'jarvis-art-image';
        stage.classList.toggle('jarvis-art-scene', this.kind === 'scenes');
        stage.setAttribute('aria-hidden', 'true');
        this.layer.append(stage);
        this.replacement = stage;

        const ready = () => {
            if (signal.aborted) return;
            stage.classList.add('jarvis-art-ready');
            stage.removeAttribute('aria-hidden');
            this.portrait?.classList.add(hiddenPortrait);
            this.status.textContent = `${item.label} · ${this.index + 1}/${this.items.length}`;
        };
        const unavailable = () => {
            this.status.textContent = 'Preview unavailable';
        };
        const showStill = () => {
            stage.replaceChildren();
            if (!item.url) return unavailable();
            const image = document.createElement('img');
            image.alt = item.label;
            image.addEventListener('load', ready, { once: true, signal });
            image.addEventListener('error', unavailable, { once: true, signal });
            stage.append(image);
            image.src = item.url;
        };

        const animation = item.animation;
        if (animation?.format === 'spine') {
            if (playSpine(stage, animation, signal, ready, showStill)) return;
        } else if (animation?.format === 'video') {
            const video = document.createElement('video');
            video.muted = video.loop = video.autoplay = video.playsInline = true;
            video.setAttribute('aria-label', item.label);
            video.addEventListener('playing', ready, { once: true, signal });
            const stop = () => {
                video.pause();
                video.removeAttribute('src');
                video.load();
            };
            const fallback = () => {
                if (signal.aborted || !stage.contains(video)) return;
                stop();
                showStill();
            };
            video.addEventListener('error', fallback, { once: true, signal });
            signal.addEventListener('abort', stop, { once: true });
            stage.append(video);
            video.src = animation.asset;
            void video.play().catch(fallback);
            return;
        }
        showStill();
    }
}
