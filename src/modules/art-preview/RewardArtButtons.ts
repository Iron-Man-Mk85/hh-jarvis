import type { RewardArt } from './gameArt';
import { RewardArtDialog, type RewardArtEntry } from './RewardArtDialog';

interface Target {
    host: HTMLElement;
    entries: RewardArtEntry[];
    anchor?: HTMLElement | null;
    side?: 'above' | 'below';
    leftAligned?: boolean;
}

function target(host: HTMLElement | null, reward: RewardArt | undefined | null, anchor?: HTMLElement | null,
    side?: Target['side'], native?: HTMLElement): Target[] {
    return host && reward?.preview ? [{ host, anchor, side, entries: [{ reward, native }] }] : [];
}

function first(selector: string) {
    return document.querySelector<HTMLElement>(selector);
}

function cards(selector: string, rewards: RewardArt[], side: Target['side']): Target[] {
    return [...document.querySelectorAll<HTMLElement>(selector)].flatMap(card => {
        const reward = rewards.find(reward => String(reward.id_girl) === card.getAttribute('girl-id'));
        const shards = card.querySelector<HTMLElement>(':scope > .shards_bar_wrapper .shards_bar_wrapper, :scope > .shards_bar_wrapper');
        const inner = shards?.querySelector<HTMLElement>('.shards_bar_wrapper');
        return target(card, reward, inner ?? shards, side, card);
    });
}

function rewardTargets(page: string): Target[] {
    switch (page) {
        case '/path-of-valor.html':
        case '/path-of-glory.html':
            return cards('.potions-paths-second-row .girl-preview[girl-id]', window.path_girls ?? [], 'below');
        case '/penta-drill.html': {
            const rewards = window.penta_drill_data;
            const holder = first('#rewards_tab_container #girls_holder');
            return [
                ...target(holder, rewards?.girl_data, first('#see_all_girls'), 'above', holder ?? undefined),
                ...cards('#girls_row_popup .girl-preview[girl-id]', rewards?.pass_reminder?.penta_drill_pass?.[0]?.season_girls ?? [], 'above')
            ];
        }
        case '/season.html': {
            const host = first('#seasons_tab_container .seasons_controls_holder');
            if (!host) return [];
            const energy = host.querySelector<HTMLElement>('#season_tab_kiss_energy');
            const anchor = energy?.getClientRects().length ? energy : host.querySelector<HTMLElement>('#seasons_tab_sub_title');
            const portraits = document.querySelectorAll<HTMLElement>('#seasons_tab_container #girls_holder .girl_block');
            const entries = (window.seasons_girls ?? []).flatMap((reward, index) =>
                reward.preview ? [{ reward, native: portraits[index] }] : []);
            return [{ host, entries, anchor, side: 'below' }];
        }
        case '/leagues.html': {
            const host = first('.league_girl .girl-preview');
            return target(host, window.leagues_girl, host?.querySelector('.shards_bar_wrapper'), 'below', host ?? undefined);
        }
        case '/event.html': {
            const host = first('#events .nc-event-container');
            if (!host) return [];
            const selected = host.querySelector<HTMLElement>('.nc-event-reward-container.selected');
            const slides = host.querySelectorAll<HTMLElement>('.slide[id-girl]');
            const active = selected?.querySelector('.slide.selected[id-girl]')?.getAttribute('id-girl');
            const entries = (window.event_girls ?? window.event_data?.girls ?? []).flatMap(reward => {
                const native = [...slides].find(slide => slide.getAttribute('id-girl') === String(reward.id_girl));
                return reward.preview ? [{ reward, native }] : [];
            });
            const index = entries.findIndex(({ reward }) => String(reward.id_girl) === active);
            if (index > 0) entries.unshift(...entries.splice(index, 1));
            const anchor = selected?.querySelector<HTMLElement>('.nc-events-prize-locations-container');
            return [{ host, entries, anchor, side: 'above', leftAligned: true }];
        }
        default: return [];
    }
}

interface Launcher {
    button: HTMLButtonElement;
    target: Target;
    layout: ResizeObserver;
}

export class RewardArtButtons {
    private launchers = new Map<HTMLElement, Launcher>();
    private observer: MutationObserver;
    private frame = 0;
    private dialog: RewardArtDialog;

    constructor(private page: string, scenes: boolean) {
        this.dialog = new RewardArtDialog(scenes);
        this.observer = new MutationObserver(() => {
            if (this.frame) return;
            this.frame = requestAnimationFrame(() => { this.frame = 0; this.sync(); });
        });
        this.observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'girl-id', 'id-girl'] });
        this.sync();
    }

    setScenesEnabled(enabled: boolean) {
        this.dialog.setScenesEnabled(enabled);
    }

    destroy() {
        this.observer.disconnect();
        cancelAnimationFrame(this.frame);
        this.dialog.close();
        for (const { button, layout } of this.launchers.values()) {
            layout.disconnect();
            button.remove();
        }
        this.launchers.clear();
    }

    private sync() {
        const targets = rewardTargets(this.page).filter(target => target.entries.length);
        const active = new Set(targets.map(target => target.host));
        for (const [host, { button, layout }] of this.launchers) {
            if (active.has(host) && button.parentElement === host) continue;
            layout.disconnect();
            button.remove();
            this.launchers.delete(host);
        }
        for (const target of targets) {
            const existing = this.launchers.get(target.host);
            if (existing) {
                if (existing.target.anchor !== target.anchor) {
                    existing.layout.disconnect();
                    this.observe(existing.layout, target);
                }
                existing.target = target;
                this.position(existing.button, target);
                continue;
            }
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'blue_button_L jarvis-art-launcher';
            button.textContent = 'Preview art';
            button.setAttribute('aria-haspopup', 'dialog');
            const launcher: Launcher = { button, target, layout: new ResizeObserver(() => this.position(button, launcher.target)) };
            button.addEventListener('click', event => {
                event.stopPropagation();
                this.dialog.show(launcher.target.entries, button);
            });
            target.host.append(button);
            this.launchers.set(target.host, launcher);
            this.observe(launcher.layout, target);
            this.position(button, target);
        }
    }

    private observe(layout: ResizeObserver, { host, anchor }: Target) {
        if (anchor) {
            layout.observe(host);
            layout.observe(anchor);
        }
    }

    private position(button: HTMLButtonElement, { host, anchor, side, leftAligned }: Target) {
        button.toggleAttribute('data-jarvis-art-anchor', Boolean(anchor));
        button.toggleAttribute('data-jarvis-art-above', side === 'above');
        if (!anchor) return;
        const box = host.getBoundingClientRect();
        const edge = anchor.getBoundingClientRect();
        if (!box.width || !box.height || !edge.width) return;
        const x = (edge.left + edge.width * (leftAligned ? .33 : .5) - box.left) * host.clientWidth / box.width;
        const y = ((side === 'above' ? edge.top : edge.bottom) - box.top) * host.clientHeight / box.height;
        button.style.setProperty('--jarvis-art-launcher-x', `${x}px`);
        button.style.setProperty('--jarvis-art-launcher-y', `${y + (side === 'above' ? -4 : 4)}px`);
    }
}
