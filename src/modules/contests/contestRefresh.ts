import type { ContestData } from '../../game-types';

interface ContestParticipant {
    id_member: string | number;
    rank: number;
    contest_points: number;
    nickname: string;
    country?: string;
    country_text?: string;
}

interface ContestSnapshot extends ContestData {
    ended: boolean;
    rank: number;
    rewards_segment: number;
    participants: Record<string, ContestParticipant>;
}

export async function loadContestSnapshot(id: string, signal: AbortSignal): Promise<ContestSnapshot | undefined> {
    const response = await fetch('/activities.html?tab=contests', {
        cache: 'no-store',
        mode: 'same-origin',
        redirect: 'error',
        signal: AbortSignal.any([signal, AbortSignal.timeout(15000)])
    });
    if (!response.ok) throw new Error('Activities request failed');

    // Activities embeds the contest roster and its standings in a JSON variable on its own line.
    const payload = (await response.text()).match(/^[\t ]*var contests\s*=\s*(\{[^\r\n]*\});[\t ]*$/m)?.[1];
    if (!payload) throw new Error('Contest data is unavailable');

    const { active } = JSON.parse(payload) as { active?: Record<string, ContestSnapshot> | ContestSnapshot[] };
    if (!active || typeof active !== 'object') throw new Error('Contest data is unavailable');
    return Object.values(active).find(contest => String(contest?.id_contest) === id && !contest.ended);
}

function createLeaderboardRow(participant: ContestParticipant, extraColumns: number) {
    const row = document.createElement('tr');
    row.setAttribute('sorting_id', String(participant.id_member));
    row.addEventListener('click', () => {
        window.shared?.general?.hero_page_popup?.({ id: Number(participant.id_member), profile_fallback: true });
    });
    row.insertCell();
    const name = row.insertCell();
    if (participant.country && /^[a-z]{2}$/i.test(participant.country)) {
        const flag = document.createElement('span');
        flag.className = `country country-${participant.country.toLowerCase()}`;
        if (participant.country_text) flag.title = participant.country_text;
        name.append(flag, ' ');
    }
    name.append(participant.nickname);
    for (let column = 0; column < extraColumns; column++) row.insertCell();
    const points = row.insertCell();
    points.className = 'cont_points_number';
    points.append(document.createElement('span'), document.createElement('div'));
    return row;
}

export function applyContestSnapshot(snapshot: ContestSnapshot, card: HTMLElement, board: HTMLElement, ownRow: Element | null) {
    const personal = card.querySelector('.personal_rewards .rank_reward');
    const rank = personal?.querySelector('.rank');
    const personalReward = personal?.querySelector('.reward_wrap');
    const tiers = Array.from(card.querySelectorAll('.contest_rewards .reward_position[data-reward-index]'));
    const tier = tiers.find(item => item.getAttribute('data-reward-index') === String(snapshot.rewards_segment));
    const tierReward = tier?.querySelector('.reward_wrap');
    const table = board.querySelector<HTMLTableSectionElement>('tbody.leadTable');
    const ownId = ownRow?.getAttribute('sorting_id');
    if (!rank || !personalReward || !tier || !tierReward || !table || !ownId || !snapshot.participants) return false;

    const participants = Object.values(snapshot.participants);
    if (!participants.every(player => player && /^\d+$/.test(String(player.id_member)) &&
        Number.isInteger(player.rank) && player.rank > 0 && Number.isFinite(player.contest_points) &&
        typeof player.nickname === 'string') ||
        new Set(participants.map(player => String(player.id_member))).size !== participants.length ||
        !participants.some(player => String(player.id_member) === ownId && player.rank === snapshot.rank)) return false;

    const rows = new Map(Array.from(table.rows, row => [row.getAttribute('sorting_id'), row]));
    // Reuse the live rows so player actions, marks, and extra columns survive rank changes.
    const extraColumns = Math.max(0, (table.rows[0]?.cells.length ?? 3) - 3);
    const updates = participants.sort((left, right) => left.rank - right.rank).map(player => {
        const row = rows.get(String(player.id_member)) ?? createLeaderboardRow(player, extraColumns);
        rows.delete(String(player.id_member));
        return { row, player, placement: row.cells[0], points: row.querySelector('.cont_points_number > span') };
    });
    if (updates.some(({ placement, points }) => !placement || !points)) return false;

    if (!tier.classList.contains('pink')) personalReward.replaceWith(tierReward.cloneNode(true));
    for (const item of tiers) item.classList.toggle('pink', item === tier);
    const rankText = String(snapshot.rank);
    const ordinals = { one: 'st', two: 'nd', few: 'rd', other: 'th', zero: 'th', many: 'th' };
    const suffix = ordinals[new Intl.PluralRules('en', { type: 'ordinal' }).select(snapshot.rank)];
    if (rank.textContent?.trim() !== rankText + suffix) {
        const ordinal = document.createElement('sup');
        ordinal.textContent = suffix;
        rank.replaceChildren(rankText, ordinal);
    }

    const pointsFormat = new Intl.NumberFormat(document.documentElement.lang || 'en');
    for (const row of rows.values()) {
        if (row.hasAttribute('sorting_id')) row.remove();
    }
    let next = table.querySelector('tr[sorting_id]');
    for (const { row, player, placement, points } of updates) {
        const place = String(player.rank);
        const score = pointsFormat.format(player.contest_points);
        if (row.getAttribute('rank') !== place) row.setAttribute('rank', place);
        if (placement.textContent?.trim() !== place) placement.textContent = place;
        if (points && points.textContent?.trim() !== score) points.textContent = score;
        if (row === next) next = row.nextElementSibling;
        else table.insertBefore(row, next);
    }

    const contest = Object.values(window.contests?.active ?? {}).find(item => String(item.id_contest) === String(snapshot.id_contest));
    if (contest) Object.assign(contest, snapshot);
    return true;
}
