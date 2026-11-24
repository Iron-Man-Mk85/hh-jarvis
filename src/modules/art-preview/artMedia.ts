import type { ArtItem } from './gameArt';
import { playSpine } from './spinePreview';

export function mountArt(stage: HTMLElement, item: ArtItem, signal: AbortSignal, ready: () => void,
    unavailable: () => void) {
    const showStill = () => {
        stage.replaceChildren();
        if (!item.url) return unavailable();
        const image = document.createElement('img');
        image.alt = item.label;
        image.addEventListener('load', ready, { once: true, signal });
        image.addEventListener('error', unavailable, { once: true, signal });
        signal.addEventListener('abort', () => { if (!image.complete) image.removeAttribute('src'); }, { once: true });
        stage.append(image);
        image.src = item.url;
    };

    const animation = item.animation;
    if (animation?.format === 'spine') {
        if (playSpine(stage, animation, signal, ready, showStill)) return;
    } else if (animation?.format === 'video') {
        const video = document.createElement('video');
        video.preload = 'none';
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
