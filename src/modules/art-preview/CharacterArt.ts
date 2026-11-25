import { $ } from '../../game';
import { hasPreviewArt, normalizeReward, requestRewardArt, type GameReward, type RewardArt, type RewardResponse } from './gameArt';

export class CharacterArt {
    private rewards = new Map<string, RewardArt>();
    private requests = new Map<string, Promise<RewardArt | undefined>>();
    private waifuSelection: { list: GameReward[]; id: string; reward?: RewardArt } | undefined;

    constructor(private sync: () => void, private haremPlusPlus = false) {
        $(document).on('ajaxComplete.jarvisCharacterArt', (_event, xhr: JQuery.jqXHR, options: JQuery.AjaxSettings) => {
            if (typeof options.data !== 'string') return;
            const action = new URLSearchParams(options.data).get('action');
            if (action !== 'get_girl' && action !== 'get_girls_list') return;
            const response = xhr.responseJSON as RewardResponse | undefined;
            if (!response?.success) return;
            const results = action === 'get_girl' ? [response.girl] : response.girls_list ?? [];
            if (!Array.isArray(results)) return;
            for (const result of results) {
                if (!result) continue;
                const reward = normalizeReward(result);
                if (!reward.id_girl) continue;
                const id = String(reward.id_girl);
                if (action === 'get_girl' || !this.rewards.has(id)) this.rewards.set(id, reward);
            }
            sync();
        });
        if (haremPlusPlus) window.addEventListener('hashchange', sync);
    }

    destroy() {
        $(document).off('.jarvisCharacterArt');
        if (this.haremPlusPlus) window.removeEventListener('hashchange', this.sync);
    }

    getTarget() {
        if (this.haremPlusPlus) return this.getHaremPlusPlusTarget();
        const panel = document.querySelector<HTMLElement>('#harem_right > [girl].opened') ??
            document.querySelector<HTMLElement>('#harem_right > [girl]');
        const id = panel?.getAttribute('girl');
        if (!panel || !id || !/^\d+$/.test(id)) return null;
        const native = panel.querySelector<HTMLElement>('.middle_part .avatar-box, .middle_part.missing_girl') ?? undefined;
        const name = panel.querySelector('.girl_infos_area h3, .dialog-box h3')?.textContent?.trim();
        return this.target(id, native ?? panel, name, native);
    }

    private getHaremPlusPlusTarget() {
        if (!/^#characters(?:-\d+)?$/.test(location.hash)) return null;
        const host = document.querySelector<HTMLElement>('#quick-harem-wrapper .QuickHarem:not(.hidden) .qh-harem > .pose');
        const portrait = host?.querySelector<HTMLImageElement>(':scope > img');
        const link = host?.parentElement?.querySelector<HTMLAnchorElement>(':scope > .details a[href*="/characters/"]');
        const id = link?.pathname.match(/^\/characters\/(\d+)\/?$/)?.[1];
        if (!host || !portrait || !id) return null;
        return { ...this.target(id, host, portrait.alt, host), anchor: portrait, side: 'top-left' as const };
    }

    private target(id: string, host: HTMLElement, name?: string, native?: HTMLElement) {
        const reward = this.rewards.get(id) ?? (this.haremPlusPlus ? this.getWaifuReward(id) : undefined) ?? { id_girl: id, name };
        const loadDetails = hasPreviewArt(reward) ? undefined : () => this.loadDetails(id);
        return { host, entries: [{ reward, native, loadDetails }], galleryOnOpen: true };
    }

    private getWaifuReward(id: string) {
        const list = window.girls_data_list;
        if (!Array.isArray(list)) return undefined;
        if (this.waifuSelection?.list === list && this.waifuSelection.id === id) return this.waifuSelection.reward;
        const data = list.find(girl => String(girl?.id_girl) === id);
        const reward = data && normalizeReward(data);
        this.waifuSelection = { list, id, reward };
        return reward;
    }

    private loadDetails(id: string) {
        const pending = this.requests.get(id);
        if (pending) return pending;
        const request = requestRewardArt(id).then(reward => {
            this.requests.delete(id);
            if (reward) this.rewards.set(id, reward);
            return reward;
        });
        this.requests.set(id, request);
        return request;
    }
}
