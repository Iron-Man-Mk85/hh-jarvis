export interface GameArt {
    poses?: (string | null)[];
    scenes?: (string | null)[];
    grade_skins_data?: {
        image_path?: string;
        grade_skin_name?: string;
        is_released?: boolean;
    }[];
}

export type ArtKind = 'poses' | 'skins' | 'scenes';
export type ArtGroups = Record<ArtKind, { url: string; label: string }[]>;

export function getArtGroups(preview: GameArt): ArtGroups {
    function image(path: string | null | undefined, label: string) {
        if (!path || !URL.canParse(path, location.href)) return [];
        const url = new URL(path, location.href);
        const usable = url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin);
        return usable ? [{ url: url.href, label }] : [];
    }

    return {
        poses: (preview.poses ?? []).flatMap((path, index) => image(path, `Pose ${index + 1}`)),
        skins: (preview.grade_skins_data ?? []).flatMap((skin, index) =>
            skin.is_released === false ? [] : image(skin.image_path, skin.grade_skin_name || `Skin ${index + 1}`)),
        scenes: (preview.scenes ?? []).flatMap((path, index) => image(path, `Scene ${index + 1}`))
    };
}
