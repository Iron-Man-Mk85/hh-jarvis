import type { PathEventTier } from '../../game-types';

export const pathEventControls = '#events .nc-panel-header .events-list';

export function isPathOfAttraction() {
    return Boolean(window.event_data?.path_of_attraction) || /^path_event_\d+$/.test(new URLSearchParams(location.search).get('tab') ?? '');
}

function getTrackRewards(tier: PathEventTier, track: 'free' | 'locked') {
    const reward = tier.rewards?.[track]?.reward;
    return reward?.girls?.length ? reward.girls : reward?.shards ?? [];
}

export function getPathRewardTiers({ includeOwned = false } = {}) {
    const tiers = Object.values(window.event_data?.path_of_attraction?.tiers ?? {});
    const rewardTiers = tiers.sort((a, b) => a.num_step - b.num_step).map(tier => ({
        step: tier.num_step,
        free: getTrackRewards(tier, 'free'),
        paid: getTrackRewards(tier, 'locked')
    }));
    const visible = rewardTiers.filter(({ free, paid }) => free.length || paid.length);
    if (!includeOwned) return visible;

    // The four-character path lists its full roster in tier order, with Free before Paid.
    const first = rewardTiers.find(({ step }) => step === 10);
    const second = rewardTiers.find(({ step }) => step === 20);
    if (!first || !second || visible.some(tier => tier !== first && tier !== second)) return visible;

    const slots = [first.free, first.paid, second.free, second.paid];
    if (slots.every(slot => slot.length) || slots.some(slot => slot.length > 1)) return visible;

    const roster = window.event_girls ?? [];
    const ids = roster.map(({ id_girl }) => String(id_girl ?? ''));
    if (ids.length !== slots.length || ids.includes('') || new Set(ids).size !== slots.length) return visible;

    const matches = slots.every(([reward], index) => reward
        ? String(reward.id_girl) === ids[index]
        : roster[index].own === true);
    if (!matches) return [first, second];

    const [firstFree, firstPaid, secondFree, secondPaid] = slots.map((slot, index) => slot.length ? slot : [roster[index]]);
    return [
        { step: first.step, free: firstFree, paid: firstPaid },
        { step: second.step, free: secondFree, paid: secondPaid }
    ];
}
