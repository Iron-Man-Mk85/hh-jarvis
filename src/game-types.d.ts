import type { HHModule } from './HHModule';

type GameId = number | string;

export interface GirlData {
    name?: string;
    rarity?: string;
    grade?: number;
    shards?: number;
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
    girl_data?: { name?: string; grade_skins?: unknown[] };
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

declare global {
    const love_raids: LoveRaid[] | undefined;

    interface Window {
        $?: JQueryStatic;
        hhPlusPlusConfig?: {
            config: Record<string, boolean>;
            registerGroup(group: { key: string; name: string }): void;
            registerModule(module: HHModule): void;
            loadConfig(): void;
            saveConfig(): void;
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
        Hero?: HeroData;
        shared?: {
            Hero?: HeroData;
        };
        opponents_list?: LeagueOpponent[];
        current_tier_number?: number | string;
        max_league?: number | string;
    }
}
