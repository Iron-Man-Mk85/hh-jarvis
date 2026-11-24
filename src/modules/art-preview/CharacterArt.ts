import { $ } from '../../game';
import { hasPreviewArt, normalizeReward, requestRewardArt, type RewardArt, type RewardResponse } from './gameArt';

export class CharacterArt {
    private rewards = new Map<string, RewardArt>();
    private requests = new Map<string, Promise<RewardArt | undefined>>();

    constructor(sync: () => void) {
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
    }

    destroy() {
        $(document).off('.jarvisCharacterArt');
    }

    getTarget() {
        const panel = document.querySelector<HTMLElement>('#harem_right > [girl].opened') ??
            document.querySelector<HTMLElement>('#harem_right > [girl]');
        const id = panel?.getAttribute('girl');
        if (!panel || !id || !/^\d+$/.test(id)) return null;
        const native = panel.querySelector<HTMLElement>('.middle_part .avatar-box, .middle_part.missing_girl') ?? undefined;
        const reward = this.rewards.get(id) ?? {
            id_girl: id,
            name: panel.querySelector('.girl_infos_area h3, .dialog-box h3')?.textContent?.trim()
        };
        const loadDetails = hasPreviewArt(reward) ? undefined : () => this.loadDetails(id);
        return { host: native ?? panel, entries: [{ reward, native, loadDetails }], galleryOnOpen: true };
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
