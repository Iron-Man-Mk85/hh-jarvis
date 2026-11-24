import type { SpineSkin } from './gameArt';
import { $ } from '../../game';

interface SpinePlayback {
    animation_frame_id: number | null;
    animation_skeletons: unknown[];
    animation_asset_manager: { isLoadingComplete(): boolean };
}

export interface GirlAnimationRenderer {
    displayGirlAnimation(playbacks: SpinePlayback[], container: JQuery<HTMLElement>, skin: SpineSkin,
        options: { scale: number; disable_offset: boolean }, isSkin: boolean): SpinePlayback;
    removeCurrentAnimations(key: string): void;
}

let nextAnimation = 0;

export function playSpine(host: HTMLElement, skin: SpineSkin, signal: AbortSignal, ready: () => void, failed: () => void) {
    const renderer = window.shared?.girl_animation;
    if (!renderer?.displayGirlAnimation || !renderer.removeCurrentAnimations) return false;

    // The game clears its own animation array when switching rewards. Keep our canvas separate.
    const storage = window as unknown as Record<string, unknown>;
    const key = `jarvisArtAnimations${++nextAnimation}`;
    const playbacks: SpinePlayback[] = [];
    storage[key] = playbacks;
    let playback: SpinePlayback;
    const dispose = () => {
        renderer.removeCurrentAnimations(key);
        delete storage[key];
    };
    try {
        const height = host.clientHeight;
        host.style.setProperty('--jarvis-art-stage-height', `${height}px`);
        const scale = height / 4800;
        playback = renderer.displayGirlAnimation(playbacks, $(host), skin, { scale, disable_offset: true }, true);
    } catch {
        dispose();
        return false;
    }

    let completeFrames = 0;
    let started = false;
    const check = () => {
        if (playback.animation_frame_id !== null) {
            started = true;
            if (signal.aborted) dispose();
            else ready();
            return;
        }
        // The native loader only records a cancelable frame after its first draw.
        if (playback.animation_asset_manager.isLoadingComplete() && ++completeFrames > 2 && !playback.animation_skeletons.length) {
            dispose();
            if (!signal.aborted) failed();
            return;
        }
        requestAnimationFrame(check);
    };
    signal.addEventListener('abort', () => { if (started) dispose(); }, { once: true });
    requestAnimationFrame(check);
    return true;
}
