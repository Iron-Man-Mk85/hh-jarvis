import { ArtGestures } from './ArtGestures';
import { mountArt } from './artMedia';
import { getArtGroups, getOriginalArt, rewardThumbnail, type ArtItem, type ArtKind, type RewardArt } from './gameArt';
import css from './artPreview.css';

const rarities = new Set(['common', 'rare', 'epic', 'legendary', 'mythic']);
const labels = { all: 'All art', original: 'Original', poses: 'Poses', skins: 'Skins', scenes: 'Scenes' } as const;
type Filter = keyof typeof labels;
type Artwork = ArtItem & { kind: 'original' | ArtKind };

export interface RewardArtEntry {
    reward: RewardArt;
    native?: HTMLElement;
    loadDetails?: () => Promise<RewardArt | undefined>;
}

function control(label: string, action: () => void) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', action);
    return button;
}

function scrollSideways(strip: HTMLElement) {
    strip.addEventListener('wheel', event => {
        if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY) || strip.scrollWidth <= strip.clientWidth) return;
        event.preventDefault();
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? strip.clientWidth : 1;
        strip.scrollLeft += event.deltaY * unit;
    }, { passive: false });
}

function observeStrip(strip: HTMLElement, onVisibility: (node: Element, visible: boolean) => void) {
    return new IntersectionObserver(entries => {
        const bounds = strip.getBoundingClientRect();
        for (const { target, intersectionRatio } of entries) {
            const tile = target.getBoundingClientRect();
            onVisibility(target, intersectionRatio > 0 && tile.left < bounds.right && tile.right > bounds.left);
        }
    }, { root: strip, threshold: [0, .001] });
}

function artworkFor({ reward, native }: RewardArtEntry): Artwork[] {
    const groups = getArtGroups(reward.preview ?? {});
    const original = getOriginalArt(reward, native ?? null);
    const artwork: Artwork[] = [];
    if (original.url || original.animation) artwork.push({ ...original, label: 'Original', kind: 'original' });
    for (const kind of Object.keys(groups) as ArtKind[]) {
        artwork.push(...groups[kind].map(item => ({ ...item, kind })));
    }
    return artwork;
}

export class RewardArtDialog {
    private session: { close: () => void; refresh: () => void } | null = null;

    show(entries: RewardArtEntry[], opener: HTMLElement, initialIndex = 0, galleryOnOpen = false) {
        if (!entries.length) return;
        this.close();
        const style = document.createElement('style');
        style.textContent = css;
        document.head.append(style);

        const dialog = document.createElement('dialog');
        dialog.className = 'jarvis-art-dialog container-special-bg';
        dialog.setAttribute('aria-labelledby', 'jarvis-art-dialog-title');
        const header = document.createElement('div');
        header.className = 'jarvis-art-dialog-header';
        const toolbar = document.createElement('div');
        toolbar.className = 'jarvis-art-toolbar';
        const title = document.createElement('h2');
        title.id = 'jarvis-art-dialog-title';
        const name = control('', () => name.setAttribute('aria-expanded', String(name.getAttribute('aria-expanded') === 'false')));
        name.className = 'jarvis-art-name';
        const fullName = document.createElement('span');
        name.replaceChildren(fullName);
        const close = control('×', () => this.close());
        close.className = 'red_button_L jarvis-art-close';
        close.setAttribute('aria-label', 'Close art preview');
        close.title = 'Close art preview';
        title.append(name);

        const filters = document.createElement('div');
        filters.className = 'jarvis-art-filters';
        filters.setAttribute('role', 'group');
        filters.setAttribute('aria-label', 'Artwork type');
        const filterButtons = new Map((Object.keys(labels) as Filter[]).map(filter => {
            const button = control(labels[filter], () => {
                if (category === filter) return;
                category = filter;
                index = 0;
                gestures.reset();
                render();
            });
            button.className = 'jarvis-art-tab';
            filters.append(button);
            return [filter, button];
        }));

        const navigation = document.createElement('div');
        navigation.className = 'jarvis-art-dialog-navigation';
        const view = control('Show all', () => {
            galleryMode = !galleryMode;
            gestures.reset();
            render();
        });
        view.className = 'jarvis-art-mode';
        const previous = control('‹', () => step(-1));
        previous.setAttribute('aria-label', 'Previous preview');
        const next = control('›', () => step(1));
        next.setAttribute('aria-label', 'Next preview');
        const reset = control('↺', () => gestures.reset());
        reset.title = 'Reset zoom and position';
        reset.setAttribute('aria-label', reset.title);
        const status = document.createElement('span');
        status.setAttribute('role', 'status');
        const paging = document.createElement('div');
        paging.className = 'jarvis-art-paging';
        for (const button of [previous, next, reset]) button.className = 'jarvis-art-page-button';
        paging.append(previous, next, reset);
        navigation.append(view, paging, status);
        toolbar.append(title, filters, navigation);
        header.append(toolbar);

        const picker = document.createElement('div');
        picker.className = 'jarvis-art-character-picker hh-scroll';
        picker.setAttribute('role', 'group');
        picker.setAttribute('aria-label', 'Characters');
        const thumbnails = new Map<Element, () => void>();
        const pickerObserver = observeStrip(picker, (choice, visible) => {
            if (!visible) return;
            pickerObserver.unobserve(choice);
            thumbnails.get(choice)?.();
            thumbnails.delete(choice);
        });
        const choices = entries.length > 1 ? entries.map(({ reward }, entryIndex) => {
            const label = reward.name || `Character ${entryIndex + 1}`;
            const choice = control(label, () => selectCharacter(entryIndex));
            const rarity = reward.rarity || 'common';
            choice.className = `slot slot_girl_shards size_small jarvis-art-character ${rarities.has(rarity) ? rarity : 'common'}`;
            choice.setAttribute('aria-label', label);
            choice.title = label;
            const thumbnail = rewardThumbnail(reward);
            if (thumbnail) {
                thumbnails.set(choice, () => {
                    const icon = document.createElement('img');
                    icon.alt = '';
                    icon.addEventListener('error', () => { choice.textContent = label; }, { once: true });
                    choice.replaceChildren(icon);
                    icon.src = thumbnail;
                });
                pickerObserver.observe(choice);
            }
            picker.append(choice);
            return choice;
        }) : [];
        picker.hidden = !choices.length;
        scrollSideways(picker);
        header.append(picker, close);

        const stage = document.createElement('div');
        stage.className = 'jarvis-art-dialog-stage';
        const layer = document.createElement('div');
        layer.className = 'jarvis-art-preview';
        const gallery = document.createElement('div');
        gallery.className = 'jarvis-art-gallery hh-scroll';
        gallery.setAttribute('role', 'group');
        gallery.setAttribute('aria-label', 'Artwork gallery');
        scrollSideways(gallery);
        stage.append(layer, gallery);
        dialog.append(header, stage);
        document.body.append(dialog);

        let selected = -1;
        let index = 0;
        let category: Filter = 'all';
        let galleryMode = galleryOnOpen;
        let artwork: Artwork[] = [];
        let visible: Artwork[] = [];
        let displayed: { media: HTMLElement; load: AbortController } | undefined;
        let pending: typeof displayed;
        let stopGallery: (() => void) | undefined;

        const gestures = new ArtGestures(layer, stage, () => displayed?.media.querySelector('img, canvas, video') ?? null,
            (zoom, x, y) => {
                layer.style.setProperty('--jarvis-art-shift', `${x}px ${y}px`);
                layer.style.setProperty('--jarvis-art-scale', String(zoom));
            });
        const clearPending = () => {
            pending?.load.abort();
            pending?.media.remove();
            pending = undefined;
        };
        const clearDisplayed = () => {
            displayed?.load.abort();
            displayed?.media.remove();
            displayed = undefined;
            gestures.refresh();
        };
        const showItem = () => {
            clearPending();
            const item = visible[index];
            if (!item) {
                clearDisplayed();
                status.textContent = 'No artwork available';
                return;
            }
            const caption = `${item.label} · ${index + 1}/${visible.length}`;
            status.textContent = 'Loading…';
            const media = document.createElement('div');
            media.className = 'jarvis-art-image';
            media.setAttribute('aria-hidden', 'true');
            layer.append(media);
            const load = new AbortController();
            pending = { media, load };
            mountArt(media, item, load.signal, () => {
                if (load.signal.aborted || pending?.media !== media) return;
                clearDisplayed();
                displayed = pending;
                pending = undefined;
                media.classList.add('jarvis-art-ready');
                media.removeAttribute('aria-hidden');
                status.textContent = caption;
                gestures.fitViewport();
            }, () => {
                if (load.signal.aborted) return;
                clearPending();
                status.textContent = 'Preview unavailable';
            });
        };
        const showGallery = () => {
            clearPending();
            clearDisplayed();
            const load = new AbortController();
            const tiles = new Map<HTMLElement, { item: Artwork; media: HTMLElement; started: boolean; visible: boolean }>();
            const observer = observeStrip(gallery, (element, shown) => {
                if (load.signal.aborted) return;
                const tile = element as HTMLElement;
                const state = tiles.get(tile);
                if (!state) return;
                state.visible = shown;
                const { media, item } = state;
                if (state.started) {
                    const video = media.querySelector('video');
                    if (!video || !media.classList.contains('jarvis-art-ready')) return;
                    if (shown) void video.play().catch(() => {});
                    else video.pause();
                    return;
                }
                if (!shown) return;
                state.started = true;
                mountArt(media, item, load.signal, () => {
                    const photo = media.querySelector('img');
                    const video = media.querySelector('video');
                    const width = photo?.naturalWidth ?? video?.videoWidth;
                    const height = photo?.naturalHeight ?? video?.videoHeight;
                    if (width && height) tile.style.setProperty('--jarvis-art-ratio', String(width / height));
                    media.classList.add('jarvis-art-ready');
                    if (video) {
                        if (!state.visible) video.pause();
                    } else observer.unobserve(tile);
                }, () => {
                    observer.unobserve(tile);
                    media.textContent = 'Preview unavailable';
                });
            });
            stopGallery = () => {
                observer.disconnect();
                load.abort();
            };
            visible.forEach((item, itemIndex) => {
                const tile = control('', () => {
                    index = itemIndex;
                    galleryMode = false;
                    render();
                    view.focus();
                });
                tile.className = 'jarvis-art-tile';
                tile.title = item.label;
                tile.setAttribute('aria-label', `Open ${item.label}`);
                if (item.animation?.format === 'spine') tile.style.setProperty('--jarvis-art-ratio', String(5 / 12));
                const media = document.createElement('span');
                media.className = 'jarvis-art-tile-media';
                tile.append(media);
                gallery.append(tile);
                tiles.set(tile, { item, media, started: false, visible: false });
                observer.observe(tile);
            });
            gallery.scrollLeft = 0;
            status.textContent = visible.length ? `${visible.length} ${visible.length === 1 ? 'image' : 'images'}` : 'No artwork available';
        };
        const step = (delta: number) => {
            if (galleryMode || visible.length < 2) return;
            index = (index + delta + visible.length) % visible.length;
            showItem();
        };
        const render = (current?: Artwork) => {
            const available = artwork.filter(item => item.kind !== 'scenes' || this.scenesEnabled);
            const kinds = new Set(available.map(item => item.kind));
            if (category !== 'all' && !kinds.has(category)) category = 'all';
            for (const [filter, button] of filterButtons) {
                button.hidden = filter === 'all' ? kinds.size < 2 : !kinds.has(filter);
                button.setAttribute('aria-pressed', String(filter === category || (category === 'all' && kinds.size === 1)));
            }
            visible = category === 'all' ? available.filter(item => item.kind !== 'original' || item.animation ||
                !available.some(pose => pose.kind === 'poses' && pose.url === item.url)) : available.filter(item => item.kind === category);
            if (current) index = Math.max(0, visible.findIndex(item => item.kind === current.kind && item.url === current.url));
            index = Math.min(index, Math.max(0, visible.length - 1));
            view.textContent = galleryMode ? 'One at a time' : 'Show all';
            paging.hidden = layer.hidden = galleryMode;
            previous.disabled = next.disabled = visible.length < 2;
            gallery.hidden = !galleryMode;
            gestures.setEnabled(!galleryMode);
            stopGallery?.();
            stopGallery = undefined;
            gallery.replaceChildren();
            if (galleryMode) showGallery();
            else showItem();
        };
        const selectCharacter = (entryIndex: number) => {
            if (selected === entryIndex) return;
            selected = entryIndex;
            choices.forEach((choice, choiceIndex) => choice.setAttribute('aria-pressed', String(choiceIndex === selected)));
            fullName.textContent = entries[selected].reward.name || 'Reward art';
            name.setAttribute('aria-expanded', 'false');
            artwork = artworkFor(entries[selected]);
            category = 'all';
            index = 0;
            clearDisplayed();
            gestures.reset();
            render();
            const entry = entries[selected];
            void entry.loadDetails?.().then(reward => {
                if (!reward || this.session?.refresh !== render || selected !== entryIndex) return;
                const current = visible[index];
                fullName.textContent = reward.name || fullName.textContent;
                artwork = artworkFor({ ...entry, reward });
                render(current);
            });
        };

        this.session = {
            refresh: render,
            close: () => {
                clearPending();
                clearDisplayed();
                pickerObserver.disconnect();
                stopGallery?.();
                gestures.destroy();
                dialog.close();
                dialog.remove();
                style.remove();
                if (opener.isConnected) opener.focus({ preventScroll: true });
            }
        };
        dialog.addEventListener('keydown', event => {
            if (event.key === 'Escape') event.stopPropagation();
            if (galleryMode || !['ArrowLeft', 'ArrowRight'].includes(event.key) || event.defaultPrevented) return;
            event.preventDefault();
            event.stopPropagation();
            step(event.key === 'ArrowLeft' ? -1 : 1);
        });
        dialog.addEventListener('cancel', event => { event.preventDefault(); this.close(); });
        dialog.addEventListener('close', () => { if (this.session?.refresh === render) this.close(); });
        dialog.showModal();
        selectCharacter(initialIndex);
        close.focus({ preventScroll: true });
    }

    constructor(private scenesEnabled: boolean) {}

    setScenesEnabled(enabled: boolean) {
        this.scenesEnabled = enabled;
        this.session?.refresh();
    }

    close() {
        const session = this.session;
        this.session = null;
        session?.close();
    }
}
