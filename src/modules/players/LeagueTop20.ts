import { settingHelp } from '../../settingsHelp';
import { HHModule } from '../../HHModule';
import { currentPage } from '../../game';

export class LeagueTop20 extends HHModule {
    constructor() {
        const baseKey = 'leagueTop20'
        const configSchema = {
            baseKey,
            default: true,
            label: settingHelp("Top 20 promotion target", "Show points needed for 20th place below the highest league tier.")
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

            const inTop20 = rank <= 20;
            const cutoff = opponents_list.find(({ place }) => Number(place) === (inTop20 ? 21 : 20));
            if (player?.player_league_points == null || cutoff?.player_league_points == null) return;

            const score = Number(player.player_league_points);
            const cutoffScore = Number(cutoff.player_league_points);
            if (!Number.isFinite(score) || !Number.isFinite(cutoffScore)) return;

            const format = new Intl.NumberFormat();
            const target = inTop20 ? cutoffScore : cutoffScore + 1;
            const difference = inTop20 ? score - target : target - score;
            const tooltip = inTop20
                ? `Top 20 promotion target: ${format.format(target)} points at rank 21. Your lead: ${format.format(difference)} points.`
                : `Top 20 promotion target: ${format.format(target)} points to pass rank 20.`;

            const entry = document.createElement('span');
            entry.className = 'minTop20 jarvisTop20';
            entry.setAttribute('hh_title', tooltip);
            entry.setAttribute('tooltip', '');
            entry.setAttribute('aria-label', tooltip);

            const badge = document.createElement('span');
            badge.className = 'scriptLeagueInfoIcon';
            badge.style.backgroundColor = '#3769ba';
            badge.style.textAlign = 'center';
            badge.textContent = '20';
            entry.append(badge, `${difference === 0 ? '' : inTop20 ? '-' : '+'}${format.format(Math.abs(difference))}`);
            summary.insertBefore(entry, summary.querySelector('.minTop30, .promotionInfo'));
        });

        this.hasRun = true
    }
}
