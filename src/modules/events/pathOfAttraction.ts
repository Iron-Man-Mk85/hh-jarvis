export const pathEventControls = '#events .nc-panel-header .events-list';

export function isPathOfAttraction() {
    return Boolean(window.event_data?.path_of_attraction) || /^path_event_\d+$/.test(new URLSearchParams(location.search).get('tab') ?? '');
}

export function getPathRewardTiers() {
    const tiers = Object.values(window.event_data?.path_of_attraction?.tiers ?? {});
    return tiers.sort((a, b) => a.num_step - b.num_step).flatMap(({ rewards }) => {
        const free = rewards?.free?.reward?.girls ?? [];
        const paid = rewards?.locked?.reward?.girls ?? [];
        return free.length || paid.length ? [{ free, paid }] : [];
    });
}
