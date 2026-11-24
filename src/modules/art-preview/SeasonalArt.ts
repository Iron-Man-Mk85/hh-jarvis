import { $ } from '../../game';
import { hasPreviewArt, normalizeReward, type GameReward, type RewardArt, type RewardResponse } from './gameArt';
import type { RewardArtEntry } from './RewardArtDialog';

const overviewId = 'home_tab_container';
const marketId = 'market_tab_container';

export class SeasonalArt {
    private inventory: GameReward[] | null = null;
    private details = new Map<string, Promise<RewardArt | undefined>>();

    constructor(private sync: () => void) {
        $(document).on('ajaxComplete.jarvisSeasonalArt', (_event, xhr: JQuery.jqXHR, options: JQuery.AjaxSettings) => {
            if (typeof options.data !== 'string') return;
            const params = new URLSearchParams(options.data);
            if (params.get('action') !== 'event_market_get_data' || params.get('feature') !== 'seasonal_event') return;
            const response = xhr.responseJSON as RewardResponse | undefined;
            if (!response?.success || !Array.isArray(response.inventory)) return;
            this.inventory = response.inventory.flatMap(item => [...(item.shards ?? []), ...(item.girls ?? [])]);
            this.sync();
        });
        window.addEventListener('popstate', this.sync);
    }

    destroy() {
        $(document).off('.jarvisSeasonalArt');
        window.removeEventListener('popstate', this.sync);
    }

    getTarget() {
        const tab = new URLSearchParams(location.search).get('tab');
        if (tab && tab !== overviewId && tab !== marketId) return null;
        const panel = document.getElementById(tab ?? overviewId);
        if (!panel) return null;
        const market = panel.id === marketId;
        const host = market ? panel : panel.querySelector<HTMLElement>('.girls-reward-container') ?? panel;
        const rewards = market ? this.inventory ?? this.renderedMarketRewards(panel) : window.girls ?? [];
        const seen = new Set<string>();
        const entries = rewards.flatMap((data): RewardArtEntry[] => {
            const reward = normalizeReward(data);
            const id = String(reward.id_girl ?? '');
            if (!id || seen.has(id)) return [];
            seen.add(id);
            const loadDetails = market && !hasPreviewArt(reward) ? () => this.loadDetails(reward, id) : undefined;
            return [{ reward, loadDetails }];
        });
        return { host, entries, prepend: host === panel };
    }

    private renderedMarketRewards(panel: HTMLElement): GameReward[] {
        return [...panel.querySelectorAll<HTMLImageElement>('.slot img, .girl-preview img')].flatMap(icon => {
            const url = icon.currentSrc || icon.src;
            const id = url.match(/\/pictures\/girls\/(\d+)\//)?.[1];
            return id ? [{ id_girl: id, ico: url, name: icon.alt || icon.title || undefined }] : [];
        });
    }

    private loadDetails(reward: RewardArt, id: string): Promise<RewardArt | undefined> {
        const cached = this.details.get(id);
        if (cached) return cached;
        const request = this.requestGirl(id).then(detail => {
            if (!detail) {
                this.details.delete(id);
                return undefined;
            }
            return { ...reward, ...detail, avatar: reward.avatar ?? detail.avatar, ico: reward.ico ?? detail.ico };
        });
        this.details.set(id, request);
        return request;
    }

    private async requestGirl(id: string) {
        if (!/^\d+$/.test(id)) return undefined;
        try {
            const game = window.shared?.general ?? window;
            const response = await game.hh_ajax?.({ action: 'get_girl', id_girl: id }).promise();
            if (!response?.success || !response.girl) return undefined;
            const reward = normalizeReward(response.girl);
            return String(reward.id_girl) === id ? reward : undefined;
        } catch {
            return undefined;
        }
    }
}
