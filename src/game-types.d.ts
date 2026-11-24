import type { HHModule } from './HHModule';
import type { GameReward, RewardArt, RewardResponse } from './modules/art-preview/gameArt';
import type { GirlAnimationRenderer } from './modules/art-preview/spinePreview';

type GameId = number | string;

export interface GirlData {
    name?: string;
    rarity?: string;
    grade?: number;
    shards?: number;
}

export interface EventRewardSource {
    name?: string;
    group?: { name?: string; id?: GameId | null };
    anchor_source?: { url?: string };
    sentence?: string;
}

export interface EventReward extends RewardArt {
    source?: EventRewardSource;
    source_list?: Record<string, EventRewardSource[] | undefined>;
}

export interface LoveRaid {
    id_raid: GameId;
    id_girl: GameId;
    id_announcement_type?: GameId;
    background_id?: GameId;
    event_name?: string;
    start_datetime?: string;
    end_datetime?: string;
    event_duration_seconds: number | string;
    status?: string;
    raid_module_type?: string;
    raid_module_pk?: GameId;
    girl_data?: RewardArt & { nb_grades?: number | string; grade_skins?: unknown[] };
}

export interface ContestData {
    id_contest: GameId;
    category_type?: string;
    name?: string;
    title?: string;
    participants?: Record<string, { nickname?: string; id_member: GameId }>;
}

interface HeroData {
    infos?: { id?: GameId };
}

interface LeagueOpponent {
    player?: { id_fighter?: GameId };
    nickname?: string;
    place?: number | string;
    player_league_points?: number | string;
}

interface GameAjax {
    hh_ajax?(params: { action: 'get_girl'; id_girl: string }): { promise(): Promise<RewardResponse> };
}

declare global {
    const love_raids: LoveRaid[] | undefined;

    interface Window extends GameAjax {
        $?: JQueryStatic;
        hhPlusPlusConfig?: {
            registerGroup(group: { key: string; name: string }): void;
            registerModule(module: HHModule): void;
            loadConfig(): void;
            runModules(): void;
        };
        HHPlusPlus: {
            Helpers: {
                doWhenSelectorAvailable(selector: string, callback: () => void): void;
                getGirlDictionary(): Promise<ReadonlyMap<string, GirlData>>;
                getHref(path: string): string;
            };
        };
        contests?: {
            active?: ContestData[] | Record<string, ContestData>;
            finished?: ContestData[] | Record<string, ContestData>;
        };
        event_girls?: EventReward[];
        event_data?: { identifier?: string; girls?: EventReward[] };
        path_girls?: RewardArt[];
        seasons_girls?: RewardArt[];
        leagues_girl?: RewardArt | null;
        girls?: GameReward[];
        penta_drill_data?: {
            girl_data?: RewardArt;
            pass_reminder?: { penta_drill_pass?: { season_girls?: RewardArt[] }[] };
        };
        Hero?: HeroData;
        shared?: {
            general?: GameAjax;
            Hero?: HeroData;
            girl_animation?: GirlAnimationRenderer;
        };
        opponents_list?: LeagueOpponent[];
        current_tier_number?: number | string;
        max_league?: number | string;
    }
}
