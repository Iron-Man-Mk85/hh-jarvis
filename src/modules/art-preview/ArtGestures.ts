export class ArtGestures {
    private surface = document.createElement('div');
    private zoom = 1;
    private x = 0;
    private y = 0;
    private drag: { id: number; startX: number; startY: number; x: number; y: number; moved: boolean } | null = null;

    constructor(private host: HTMLElement, layer: HTMLElement, private apply: (zoom: number, x: number, y: number) => void) {
        this.surface.className = 'jarvis-art-gestures';
        this.surface.title = 'Wheel to zoom, drag to move, double-click to reset';
        this.surface.setAttribute('role', 'group');
        this.surface.setAttribute('aria-label', 'Adjust art with plus, minus, and arrow keys. Press Home to reset.');
        this.surface.tabIndex = 0;
        this.surface.hidden = true;
        layer.append(this.surface);

        this.surface.addEventListener('wheel', event => {
            if (event.ctrlKey || !event.deltaY) return;
            event.preventDefault();
            event.stopPropagation();
            const delta = event.deltaY * (event.deltaMode === 0 ? 1 : event.deltaMode === 1 ? 16 : 100);
            this.setZoom(this.zoom * Math.exp(-Math.max(-150, Math.min(150, delta)) * .0016));
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
            const bounds = this.host.getBoundingClientRect();
            if (!bounds.width || !bounds.height) return;
            this.setPosition(drag.x + dx * this.host.clientWidth / bounds.width, drag.y + dy * this.host.clientHeight / bounds.height);
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
        this.surface.hidden = !enabled;
        if (!enabled) this.endDrag();
    }

    reset() {
        this.endDrag();
        this.zoom = 1;
        this.x = this.y = 0;
        this.apply(this.zoom, this.x, this.y);
    }

    private endDrag() {
        const drag = this.drag;
        this.drag = null;
        this.surface.classList.remove('jarvis-art-dragging');
        if (drag && this.surface.hasPointerCapture(drag.id)) this.surface.releasePointerCapture(drag.id);
    }

    private setZoom(zoom: number) {
        this.zoom = Math.max(.6, Math.min(2.6, zoom));
        this.apply(this.zoom, this.x, this.y);
    }

    private setPosition(x: number, y: number) {
        const limitX = this.host.clientWidth * .65;
        const limitY = this.host.clientHeight * .65;
        this.x = Math.max(-limitX, Math.min(limitX, x));
        this.y = Math.max(-limitY, Math.min(limitY, y));
        this.apply(this.zoom, this.x, this.y);
    }
}
