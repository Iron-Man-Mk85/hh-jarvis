type ArtMedia = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;

function mediaBounds(media: ArtMedia) {
    const rect = media.getBoundingClientRect();
    if (media instanceof HTMLCanvasElement || getComputedStyle(media).objectFit !== 'contain') return rect;

    const width = media instanceof HTMLImageElement ? media.naturalWidth : media.videoWidth;
    const height = media instanceof HTMLImageElement ? media.naturalHeight : media.videoHeight;
    if (!width || !height) return rect;
    const scale = Math.min(rect.width / width, rect.height / height);
    const fittedWidth = width * scale;
    const fittedHeight = height * scale;
    return new DOMRect(rect.left + (rect.width - fittedWidth) / 2, rect.top + (rect.height - fittedHeight) / 2, fittedWidth, fittedHeight);
}

export class ArtGestures {
    private surface = document.createElement('div');
    private zoom = 1;
    private x = 0;
    private y = 0;
    private enabled = false;
    private listeners = new AbortController();
    private layout: ResizeObserver;
    private drag: { id: number; startX: number; startY: number; x: number; y: number; moved: boolean } | null = null;

    constructor(private layer: HTMLElement, private viewport: HTMLElement, private media: () => ArtMedia | null,
        private apply: (zoom: number, x: number, y: number) => void) {
        this.surface.className = 'jarvis-art-gestures';
        this.surface.title = 'Wheel to zoom, drag to move, double-click to reset';
        this.surface.setAttribute('role', 'group');
        this.surface.setAttribute('aria-label', 'Adjust art with plus, minus, and arrow keys. Press Home to reset.');
        this.surface.tabIndex = 0;
        this.surface.hidden = true;
        layer.append(this.surface);
        this.layout = new ResizeObserver(() => this.fitViewport());
        this.layout.observe(layer);
        this.layout.observe(viewport);
        const { signal } = this.listeners;
        window.addEventListener('resize', () => this.fitViewport(), { signal });
        window.addEventListener('scroll', () => this.refresh(), { signal, capture: true, passive: true });

        this.surface.addEventListener('wheel', event => {
            if (event.ctrlKey || !event.deltaY) return;
            event.preventDefault();
            event.stopPropagation();
            const delta = event.deltaY * (event.deltaMode === 0 ? 1 : event.deltaMode === 1 ? 16 : 100);
            this.setZoom(this.zoom * Math.exp(-Math.max(-150, Math.min(150, delta)) * .0016), event);
        }, { passive: false });

        this.surface.addEventListener('pointerdown', event => {
            if (!event.isPrimary || event.button !== 0) return;
            event.stopPropagation();
            this.drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: this.x, y: this.y, moved: false };
            this.surface.setPointerCapture(event.pointerId);
        });
        this.surface.addEventListener('pointermove', event => {
            const drag = this.drag;
            if (drag?.id !== event.pointerId) return;
            const dx = event.clientX - drag.startX;
            const dy = event.clientY - drag.startY;
            if (!drag.moved && Math.hypot(dx, dy) < 4) return;
            drag.moved = true;
            this.surface.classList.add('jarvis-art-dragging');
            const bounds = this.layer.getBoundingClientRect();
            if (!bounds.width || !bounds.height) return;
            this.setPosition(drag.x + dx * this.layer.clientWidth / bounds.width, drag.y + dy * this.layer.clientHeight / bounds.height);
        });
        this.surface.addEventListener('lostpointercapture', () => this.endDrag());
        this.surface.addEventListener('click', event => event.stopPropagation());
        this.surface.addEventListener('dblclick', event => { event.stopPropagation(); this.reset(); });
        this.surface.addEventListener('keydown', event => {
            switch (event.key) {
                case '+':
                case '=': this.setZoom(this.zoom * 1.15); break;
                case '-': this.setZoom(this.zoom / 1.15); break;
                case 'ArrowLeft': this.setPosition(this.x - 16, this.y); break;
                case 'ArrowRight': this.setPosition(this.x + 16, this.y); break;
                case 'ArrowUp': this.setPosition(this.x, this.y - 16); break;
                case 'ArrowDown': this.setPosition(this.x, this.y + 16); break;
                case 'Home': this.reset(); break;
                default: return;
            }
            event.preventDefault();
            event.stopPropagation();
        });
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (!enabled) this.endDrag();
        this.refresh();
    }

    reset() {
        this.endDrag();
        this.zoom = 1;
        this.x = this.y = 0;
        this.apply(this.zoom, this.x, this.y);
        this.refresh();
    }

    destroy() {
        this.setEnabled(false);
        this.reset();
        this.listeners.abort();
        this.layout.disconnect();
    }

    fitViewport() {
        if (this.enabled && (this.zoom !== 1 || this.x || this.y)) this.setPosition(this.x, this.y);
        else this.refresh();
    }

    refresh() {
        const geometry = this.enabled ? this.geometry() : null;
        if (!geometry) {
            this.surface.hidden = true;
            return;
        }
        const { art, clip, layer, scaleX, scaleY } = geometry;
        const left = Math.max(clip.left, art.left);
        const top = Math.max(clip.top, art.top);
        const right = Math.min(clip.right, art.right);
        const bottom = Math.min(clip.bottom, art.bottom);
        this.surface.hidden = right <= left || bottom <= top;
        this.surface.style.left = `${(left - layer.left) * scaleX}px`;
        this.surface.style.top = `${(top - layer.top) * scaleY}px`;
        this.surface.style.width = `${Math.max(0, right - left) * scaleX}px`;
        this.surface.style.height = `${Math.max(0, bottom - top) * scaleY}px`;
    }

    private geometry() {
        const media = this.media();
        if (!media) return null;
        const art = mediaBounds(media);
        const layer = this.layer.getBoundingClientRect();
        if (!art.width || !art.height || !layer.width || !layer.height) return null;
        const viewport = this.viewport.getBoundingClientRect();
        const clip = {
            left: Math.max(0, layer.left, viewport.left), top: Math.max(0, layer.top, viewport.top),
            right: Math.min(document.documentElement.clientWidth, layer.right, viewport.right),
            bottom: Math.min(document.documentElement.clientHeight, layer.bottom, viewport.bottom)
        };
        if (clip.right <= clip.left || clip.bottom <= clip.top) return null;
        return { art, clip, layer, scaleX: this.layer.clientWidth / layer.width, scaleY: this.layer.clientHeight / layer.height };
    }

    private endDrag() {
        const drag = this.drag;
        this.drag = null;
        this.surface.classList.remove('jarvis-art-dragging');
        if (drag && this.surface.hasPointerCapture(drag.id)) this.surface.releasePointerCapture(drag.id);
    }

    private setZoom(zoom: number, pointer?: { clientX: number; clientY: number }) {
        if (!Number.isFinite(zoom)) return;
        const next = Math.max(.6, zoom);
        if (next === this.zoom) return;
        const before = pointer && this.geometry()?.art;
        this.zoom = next;
        this.apply(this.zoom, this.x, this.y);
        const after = before && this.geometry();
        if (pointer && before && after) {
            const x = (pointer.clientX - before.left) / before.width;
            const y = (pointer.clientY - before.top) / before.height;
            this.setPosition(this.x + (pointer.clientX - after.art.left - x * after.art.width) * after.scaleX,
                this.y + (pointer.clientY - after.art.top - y * after.art.height) * after.scaleY);
        } else this.setPosition(this.x, this.y);
    }

    private setPosition(x: number, y: number) {
        const geometry = this.geometry();
        if (!geometry) return;
        const { art, clip, scaleX, scaleY } = geometry;
        // A small image stays fully inside the view. An enlarged image can pan between its two edges.
        const clampDelta = (delta: number, near: number, far: number) =>
            Math.max(Math.min(near, far), Math.min(Math.max(near, far), delta));
        this.x += clampDelta(x - this.x, (clip.left - art.left) * scaleX, (clip.right - art.right) * scaleX);
        this.y += clampDelta(y - this.y, (clip.top - art.top) * scaleY, (clip.bottom - art.bottom) * scaleY);
        this.apply(this.zoom, this.x, this.y);
        this.refresh();
    }
}
