export interface GameArt {
    poses?: (string | null)[];
    scenes?: (string | null)[];
    grade_skins_data?: {
        image_path?: string;
        grade_skin_name?: string;
        is_released?: boolean;
        animation_format?: string;
        animation_infos?: { asset?: string; filename?: string; path?: string };
        offset_values?: { animated?: number[] };
    }[];
}

export type ArtKind = 'poses' | 'skins' | 'scenes';
export type SpineSkin = { format: 'spine'; path: string; filename: string; offset: number[]; isSkin?: boolean };
export type ArtItem = { url?: string; label: string; animation?: SpineSkin | { format: 'video'; asset: string } };
export type ArtGroups = Record<ArtKind, ArtItem[]>;

export interface RewardArt {
    id_girl?: string | number;
    name?: string;
    ico?: string;
    rarity?: string;
    preview?: GameArt;
    avatar?: string;
    default_avatar?: string;
    animated_grades?: { grade: number; format?: string; asset?: string; filename?: string; path?: string }[];
}

function assetUrl(path: string | null | undefined) {
    if (!path || !URL.canParse(path, location.href)) return undefined;
    const url = new URL(path, location.href);
    const usable = url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin);
    return usable ? url.href : undefined;
}

export function rewardThumbnail(reward: RewardArt) {
    return assetUrl(reward.ico) ?? assetUrl(reward.avatar) ?? assetUrl(reward.preview?.poses?.[0]);
}

function image(path: string | null, label: string): ArtItem[] {
    const url = assetUrl(path);
    return url ? [{ url, label }] : [];
}

export function getOriginalArt(reward: RewardArt, native: HTMLElement | null): ArtItem {
    const photo = native?.querySelector<HTMLImageElement>(':scope > img, :scope > .girl_block img');
    const video = native?.querySelector<HTMLVideoElement>(':scope > video, :scope > .girl_block video');
    const renderedVideo = assetUrl(video?.currentSrc || video?.getAttribute('src') || video?.querySelector('source[type="video/webm"]')?.getAttribute('src'));
    const url = assetUrl(photo?.currentSrc || photo?.getAttribute('src')) ?? assetUrl(reward.avatar) ??
        assetUrl(reward.default_avatar) ?? assetUrl(reward.preview?.poses?.[0]);
    const item: ArtItem = { url, label: reward.name || 'Original' };
    if (renderedVideo) {
        item.animation = { format: 'video', asset: renderedVideo };
    } else if (!native || native.querySelector('canvas.animated-girl-display')) {
        const grade = reward.animated_grades?.find(grade => grade.grade === 0);
        const asset = assetUrl(grade?.asset);
        const path = assetUrl(grade?.path);
        if (grade?.format === 'video' && asset) item.animation = { format: 'video', asset };
        if (grade?.format === 'spine' && path && grade.filename && /^[\w-]+$/.test(grade.filename)) {
            item.animation = { format: 'spine', path, filename: grade.filename, offset: [], isSkin: false };
        }
    }
    return item;
}

export function getArtGroups(preview: GameArt): ArtGroups {
    return {
        poses: (preview.poses ?? []).flatMap((path, index) => image(path, `Pose ${index + 1}`)),
        skins: (preview.grade_skins_data ?? []).flatMap((skin, index) => {
            if (!skin || skin.is_released === false) return [];
            const item: ArtItem = { url: assetUrl(skin.image_path), label: skin.grade_skin_name || `Skin ${index + 1}` };
            const info = skin.animation_infos;
            const asset = assetUrl(info?.asset);
            const path = assetUrl(info?.path);
            if (skin.animation_format === 'video' && asset) item.animation = { format: 'video', asset };
            if (skin.animation_format === 'spine' && path && info?.filename && /^[\w-]+$/.test(info.filename)) {
                item.animation = { format: 'spine', path, filename: info.filename, offset: skin.offset_values?.animated ?? [] };
            }
            return item.url || item.animation ? [item] : [];
        }),
        scenes: (preview.scenes ?? []).flatMap((path, index) => image(path, `Scene ${index + 1}`))
    };
}
