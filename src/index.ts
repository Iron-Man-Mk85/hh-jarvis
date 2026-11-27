import { initGame } from './game';
import { injectStyles, packSettings } from './settings';
import { FriendAndFoes } from './modules/players/FriendAndFoes';
import { armContestStartupGuard, ContestStart } from './modules/contests/ContestStart';
import { installContestSettings } from './modules/contests/contestPreferences';
import { LeagueTop20 } from './modules/players/LeagueTop20';
import { installLeagueClubmatesSettings, LeagueClubmates } from './modules/players/LeagueClubmates';
import { RemovePassLock } from './modules/progression/RemovePassLock';
import { LoveRaidsAddon } from './modules/love-raids/LoveRaidsAddon';
import { LoveRaidsParser } from './modules/love-raids/LoveRaidsParser';
import { ActivityParser } from './modules/activities/ActivityParser';
import { Changelog } from './modules/updates/Changelog';
import { GameLinks } from './modules/navigation/GameLinks';
import { MythicPreviewFix } from './modules/events/MythicPreviewFix';
import { EventExport } from './modules/events/EventExport';
import { EventArtPreview } from './modules/events/EventArtPreview';
import { installArtViewSettings } from './modules/art-preview/artViewSettings';

armContestStartupGuard();

function runJarvis() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runJarvis, { once: true });
        return;
    }

    const { $ } = window;

    if (!$) {
        if (document.readyState !== 'complete') {
            window.addEventListener('load', runJarvis, { once: true });
            return;
        }
        document.getElementById('jarvis-contest-startup')?.remove();
        console.log('WARNING: No jQuery found. Ending script.');
        return
    }

    console.log('Hello, Sir, J.A.R.V.I.S. is ready to help you.');

    initGame($);
    injectStyles();

    const friendsAndFoes = new FriendAndFoes();
    const changelog = new Changelog();
    const allModules = [
        friendsAndFoes,
        new ContestStart(),
        new LeagueTop20(),
        new LeagueClubmates(),
        new RemovePassLock(),
        new LoveRaidsAddon(),
        new LoveRaidsParser(),
        new ActivityParser(),
        new EventExport(),
        new EventArtPreview(),
        changelog,
        new MythicPreviewFix(),
        new GameLinks()
    ]

    setTimeout(() => {
        const runScript = () => {
            const { hhPlusPlusConfig } = window
            if (!hhPlusPlusConfig) return;

            hhPlusPlusConfig.registerGroup({
                key: 'JARVIS',
                name: 'HH Jarvis'
            })
            allModules.forEach(module => {
                hhPlusPlusConfig.registerModule(module)
            })
            hhPlusPlusConfig.loadConfig()
            hhPlusPlusConfig.runModules()
            friendsAndFoes.installSettings();
            installContestSettings();
            installLeagueClubmatesSettings();
            installArtViewSettings();
            changelog.installSettings();
            packSettings();
        }

        if (window.hhPlusPlusConfig) {
            runScript()
        } else {
            $(document).one('hh++-bdsm:loaded', runScript)
        }
    }, 1)
}

runJarvis();
