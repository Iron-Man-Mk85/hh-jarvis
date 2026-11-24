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
export type SpineSkin = { format: 'spine'; path: string; filename: string; offset: number[] };
export type ArtItem = { url?: string; label: string; animation?: SpineSkin | { format: 'video'; asset: string } };
export type ArtGroups = Record<ArtKind, ArtItem[]>;

function assetUrl(path: string | null | undefined) {
    if (!path || !URL.canParse(path, location.href)) return undefined;
    const url = new URL(path, location.href);
    const usable = url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin);
    return usable ? url.href : undefined;
}

function image(path: string | null, label: string): ArtItem[] {
    const url = assetUrl(path);
    return url ? [{ url, label }] : [];
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
