import type { GirlData } from '../../game-types';
import { hasPreviewArt, requestRewardArt, type RewardArt } from './gameArt';
import { RewardArtDialog, type RewardArtEntry } from './RewardArtDialog';
import { SeasonalArt } from './SeasonalArt';
import { CharacterArt } from './CharacterArt';
import { openArtInGallery, readDefaultArtFilter } from './artViewSettings';
import { getGirlDictionary, getLoveRaids } from '../love-raids/gameData';
import { getPathRewardTiers, isPathOfAttraction, pathEventControls } from '../events/pathOfAttraction';

interface Target {
    host: HTMLElement;
    entries: RewardArtEntry[];
    anchor?: HTMLElement | null;
    side?: 'above' | 'below' | 'right' | 'top-left';
    leftAligned?: boolean;
    initialIndex?: number;
    prepend?: boolean;
    galleryOnOpen?: boolean;
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

function raidTargets(girls: ReadonlyMap<string, GirlData> | null, loadDetails: (id: string) => Promise<RewardArt | undefined>): Target[] {
    const raidsById = new Map(getLoveRaids().map(raid => [String(raid.id_raid), raid]));
    const entries: RewardArtEntry[] = [];
    const indices = new Map<string, number>();
    const targets: Target[] = [];
    for (const card of document.querySelectorAll<HTMLElement>('#love-raids .raid-card[id_raid]')) {
        const raid = raidsById.get(card.getAttribute('id_raid') ?? '');
        if (!raid?.girl_data) continue;
        const id = String(raid.id_girl);
        let index = indices.get(id);
        if (index === undefined) {
            index = entries.length;
            const hidden = raid.status === 'upcoming' && !raid.all_is_owned && raid.girl_data.id_girl == null &&
                (raid.announcement_type_name === 'none' || raid.announcement_type_name === 'partial');
            const girl = hidden ? girls?.get(id) : undefined;
            const reward = {
                ...raid.girl_data,
                id_girl: raid.id_girl,
                name: girl?.name || raid.girl_data.name,
                ico: hidden ? undefined : raid.girl_data.ico,
                rarity: raid.girl_data.rarity || girl?.rarity
            };
            entries.push({
                reward,
                native: card.querySelector<HTMLElement>('.left-girl-container') ?? undefined,
                loadDetails: hidden || !hasPreviewArt(reward) ? () => loadDetails(id) : undefined,
                thumbnailFromDetails: hidden
            });
            indices.set(id, index);
        }
        targets.push({ host: card, entries, initialIndex: index });
    }
    return targets;
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
            const combatLink = host.querySelector<HTMLElement>('a[href*="/season-arena.html"]');
            const anchor = combatLink?.querySelector<HTMLElement>('.blue_button_L') ?? combatLink;
            const portraits = document.querySelectorAll<HTMLElement>('#seasons_tab_container #girls_holder .girl_block');
            const entries = (window.seasons_girls ?? []).flatMap((reward, index) =>
                reward.preview ? [{ reward, native: portraits[index] }] : []);
            return [{ host, entries, anchor, side: 'right' }];
        }
        case '/leagues.html': {
            const host = first('.league_girl .girl-preview');
            return target(host, window.leagues_girl, host?.querySelector('.shards_bar_wrapper'), 'below', host ?? undefined);
        }
        case '/event.html': {
            if (isPathOfAttraction()) {
                const host = first(pathEventControls);
                if (!host) return [];
                const byId = new Map((window.event_girls ?? []).map(reward => [String(reward.id_girl), reward]));
                const participants = getPathRewardTiers().flatMap(({ free, paid }) => [...free, ...paid]);
                const ids = new Set(participants.map(reward => String(reward.id_girl)));
                const entries = [...ids].flatMap(id => {
                    const reward = byId.get(id);
                    return reward?.preview ? [{ reward }] : [];
                });
                return [{ host, entries }];
            }
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
    private seasonal: SeasonalArt | undefined;
    private character: CharacterArt | undefined;
    private raidGirls: ReadonlyMap<string, GirlData> | null = null;
    private raidNamesReady: Promise<void> | undefined;
    private raidDetails = new Map<string, Promise<RewardArt | undefined>>();

    constructor(private page: string, scenes: boolean) {
        this.dialog = new RewardArtDialog(scenes);
        const schedule = () => {
            if (this.frame) return;
            this.frame = requestAnimationFrame(() => { this.frame = 0; this.sync(); });
        };
        this.seasonal = page === '/seasonal.html' ? new SeasonalArt(schedule) : undefined;
        const haremPlusPlus = page === '/waifu.html';
        this.character = haremPlusPlus || page.startsWith('/characters/') ? new CharacterArt(schedule, haremPlusPlus) : undefined;
        if (page === '/love-raids.html') {
            this.raidNamesReady = getGirlDictionary().then(girls => {
                this.raidGirls = girls;
                if (this.launchers.size) this.sync();
            });
        }
        this.observer = new MutationObserver(records => {
            if (records.some(({ target }) => !(target instanceof Element && target.closest('.jarvis-art-dialog')))) schedule();
        });
        const attributeFilter = ['class', 'girl', 'girl-id', 'id-girl'];
        if (haremPlusPlus) attributeFilter.push('href', 'alt');
        this.observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter });
        this.sync();
    }

    setScenesEnabled(enabled: boolean) {
        this.dialog.setScenesEnabled(enabled);
    }

    destroy() {
        this.seasonal?.destroy();
        this.character?.destroy();
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
        const pageTarget = this.seasonal?.getTarget() ?? this.character?.getTarget();
        const targets: Target[] = pageTarget ? [pageTarget] : this.page === '/love-raids.html'
            ? raidTargets(this.raidGirls, id => this.loadRaidDetails(id)) : rewardTargets(this.page);
        const populated = targets.filter(target => target.entries.length);
        const active = new Set(populated.map(target => target.host));
        for (const [host, { button, layout }] of this.launchers) {
            if (active.has(host) && button.parentElement === host) continue;
            layout.disconnect();
            button.remove();
            this.launchers.delete(host);
        }
        for (const target of populated) {
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
            button.textContent = '📷';
            button.setAttribute('aria-label', 'Open artwork');
            button.setAttribute('aria-haspopup', 'dialog');
            const launcher: Launcher = { button, target, layout: new ResizeObserver(() => this.position(button, launcher.target)) };
            button.addEventListener('click', event => {
                event.stopPropagation();
                const show = () => {
                    if (!button.isConnected) return;
                    const { entries, initialIndex, galleryOnOpen } = launcher.target;
                    this.dialog.show(entries, button, initialIndex, openArtInGallery(galleryOnOpen), readDefaultArtFilter());
                };
                if (this.raidNamesReady) void this.raidNamesReady.then(show);
                else show();
            });
            if (target.prepend) target.host.prepend(button);
            else target.host.append(button);
            this.launchers.set(target.host, launcher);
            this.observe(launcher.layout, target);
            this.position(button, target);
        }
    }

    private loadRaidDetails(id: string) {
        const cached = this.raidDetails.get(id);
        if (cached) return cached;
        const request = requestRewardArt(id).then(reward => {
            if (!reward) this.raidDetails.delete(id);
            return reward;
        });
        this.raidDetails.set(id, request);
        return request;
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
        button.toggleAttribute('data-jarvis-art-beside', side === 'right');
        button.toggleAttribute('data-jarvis-art-top-left', side === 'top-left');
        if (!anchor) return;
        const box = host.getBoundingClientRect();
        const edge = anchor.getBoundingClientRect();
        if (!box.width || !box.height || !edge.width) return;
        const beside = side === 'right';
        const topLeft = side === 'top-left';
        const anchorX = beside ? edge.right : edge.left + edge.width * (topLeft ? 0 : leftAligned ? .33 : .5);
        const anchorY = beside ? edge.top + edge.height / 2 : side === 'above' || topLeft ? edge.top : edge.bottom;
        const x = (anchorX - box.left) * host.clientWidth / box.width;
        const y = (anchorY - box.top) * host.clientHeight / box.height;
        button.style.setProperty('--jarvis-art-launcher-x', `${x + (beside || topLeft ? 6 : 0)}px`);
        button.style.setProperty('--jarvis-art-launcher-y', `${y + (beside ? 0 : side === 'above' ? -4 : 4)}px`);
    }
}
