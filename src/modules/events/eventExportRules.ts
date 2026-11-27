import type { EventReward, EventRewardSource } from '../../game-types';
import { getPathRewardTiers, isPathOfAttraction, pathEventControls } from './pathOfAttraction';

type SourceForReward = (reward: EventReward, id: string) => string;
interface ExportRule { source?: SourceForReward }

interface TitledEventLayout {
    matches(): boolean;
    controls: string;
    getEventName(): string | undefined;
    getRewardRows(): EventReward[][][];
}

const titledEventLayouts: TitledEventLayout[] = [{
    matches: isPathOfAttraction,
    controls: pathEventControls,
    getEventName: () => window.event_data?.path_of_attraction?.name,
    getRewardRows: () => getPathRewardTiers({ includeOwned: true }).map(({ free, paid }) => [free, paid])
}];

export function getTitledEventLayout() {
    return titledEventLayouts.find(layout => layout.matches());
}

const rules = new Map<string, ExportRule>([
    ['event', { source: (reward, id) => currentSource(reward, 'event', id) }],
    ['mythic_event', { source: (reward, id) => currentSource(reward, 'mythic_event', id) }],
    ['crazy_cumback_contest', {}]
]);

export function getEventExportRule(identifier: string) {
    const match = identifier.match(/^([a-z_]+)_(\d+)$/);
    if (!match) return null;
    const [, kind, id] = match;
    const rule = rules.get(kind);
    return rule ? { id, source: rule.source } : null;
}

function formatSource(source: EventRewardSource): string {
    switch (source.name) {
        case 'event_dm': return 'Daily Missions';
        case 'pachinko_event':
        case 'pachinko_epic': return 'Night-Club';
        case 'event_troll':
        case 'event_champion_girl': {
            const href = source.anchor_source?.url;
            if (!href || !URL.canParse(href, location.origin)) return '';
            const url = new URL(href, location.origin);
            const villain = source.name === 'event_troll';
            const id = villain && url.pathname === '/troll-pre-battle.html'
                ? url.searchParams.get('id_opponent')
                : !villain ? url.pathname.match(/^\/champions\/(\d+)\/?$/)?.[1] : null;
            if (!id || !/^\d+$/.test(id)) return '';

            const sentence = document.createElement('template');
            sentence.innerHTML = source.sentence ?? '';
            const name = sentence.content.querySelector('i')?.textContent?.replace(/\s+/g, ' ').trim();
            return name ? `${villain ? 'Villain' : 'Champion'} #${id} ${name}` : '';
        }
        default: return '';
    }
}

function currentSource(reward: EventReward, kind: string, id: string) {
    const isCurrent = (source: EventRewardSource) =>
        source.group?.name === kind && String(source.group.id) === id;
    const primary = reward.source;
    if (primary && isCurrent(primary)) return formatSource(primary);

    const sources = Object.values(reward.source_list ?? {}).flatMap(list => list ?? []).filter(isCurrent);
    if (!sources.length && kind === 'event' && primary?.name === 'pachinko_epic') return formatSource(primary);
    const labels = new Set(sources.map(formatSource));
    return labels.size === 1 ? [...labels][0] : '';
}
