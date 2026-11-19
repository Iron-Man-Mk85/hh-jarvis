import { settingHelp } from '../../settingsHelp';
import { HHModule } from '../../HHModule';
import { currentPage } from '../../game';

export class LeagueTop20 extends HHModule {
    constructor() {
        const baseKey = 'leagueTop20'
        const configSchema = {
            baseKey,
            default: true,
            label: settingHelp("Promotion target", "Show the points needed to reach the larger of the top 20 or top 15% below the highest league tier.")
        }
        super({name: baseKey, configSchema});
    }

    shouldRun() {
        return currentPage.includes('/leagues.html');
    }

    run() {
        if (this.hasRun || !this.shouldRun()) {return}

        window.HHPlusPlus.Helpers.doWhenSelectorAvailable('.scriptLeagueInfo', () => {
            const summary = document.querySelector('.scriptLeagueInfo');
            if (!summary || summary.querySelector('.jarvisTop20')) return;

            const { opponents_list, current_tier_number, max_league } = window;
            const tier = Number(current_tier_number);
            if (!(tier > 0 && tier < Number(max_league))) return;
            const heroId = (window.shared?.Hero || window.Hero)?.infos?.id;
            if (!Array.isArray(opponents_list) || heroId == null) return;

            const player = opponents_list.find(({ player }) => String(player?.id_fighter) === String(heroId));
            const rank = Number(player?.place);
            if (!Number.isInteger(rank) || rank < 1) return;

            const bracketSize = opponents_list.length;
            const promotionRank = Math.max(20, Math.ceil(bracketSize * 15 / 100));
            const inPromotion = rank <= promotionRank;
            const comparisonRank = inPromotion ? promotionRank + 1 : promotionRank;
            const cutoff = opponents_list.find(({ place }) => Number(place) === comparisonRank);
            if (player?.player_league_points == null || cutoff?.player_league_points == null) return;

            const score = Number(player.player_league_points);
            const cutoffScore = Number(cutoff.player_league_points);
            if (!Number.isFinite(score) || !Number.isFinite(cutoffScore)) return;

            const format = new Intl.NumberFormat();
            const target = inPromotion ? cutoffScore : cutoffScore + 1;
            const difference = inPromotion ? score - target : target - score;
            const rule = `Top ${promotionRank} is the promotion target. The cutoff is the larger of 20 places or 15% of ${format.format(bracketSize)} players, rounded up.`;
            const comparison = inPromotion
                ? `Rank ${comparisonRank} has ${format.format(target)} points. Your lead is ${format.format(difference)} points.`
                : `You need ${format.format(target)} points to pass rank ${comparisonRank}.`;
            const tooltip = `${rule} ${comparison}`;

            const entry = document.createElement('span');
            entry.className = 'jarvisTop20';
            entry.setAttribute('hh_title', tooltip);
            entry.setAttribute('tooltip', '');
            entry.setAttribute('aria-label', tooltip);

            const badge = document.createElement('span');
            badge.className = 'scriptLeagueInfoIcon';
            badge.style.backgroundColor = '#3769ba';
            badge.style.textAlign = 'center';
            badge.textContent = String(promotionRank);
            entry.append(badge, `${difference === 0 ? '' : inPromotion ? '-' : '+'}${format.format(Math.abs(difference))}`);
            summary.insertBefore(entry, summary.querySelector('.minTop30, .promotionInfo'));
        });

        this.hasRun = true
    }
}
