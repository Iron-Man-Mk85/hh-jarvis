# HH J.A.R.V.I.S.

## Description

HH J.A.R.V.I.S. is a Quality of Life userscript for Kinkoid games.

## Features

- **Friends & Foes Management:** Easily mark players as friends or foes in leagues and contests.
- **Better PoV/PoG** Remove the lock icon in PoV/PoG Pass/Pass+ for easier reading
- **Love Raids Addon:** Adds useful infos to the Love Raids page.
- **Love Raids Parser:** If you manage a Sheet to track Love Raids girls, you can easily get all the info in a click!

## Installation

1. **Install a userscript manager:**  
- [Tampermonkey](https://www.tampermonkey.net/)
- [Violentmonkey](https://violentmonkey.github.io/)
- [Userscripts (iOS)](https://apps.apple.com/us/app/userscripts/id1463298887)
- [Stay (iOS)](https://apps.apple.com/us/app/stay-for-safari/id1591620171)

2. **Install the script:**  
- [Click here to install](https://raw.githubusercontent.com/Iron-Man-Mk85/hh-jarvis/main/hh-jarvis.user.js)
- Or copy the contents of `hh-jarvis.user.js` and paste into your userscript manager.

3. **HH++ BDSM:**
- Make sure you've got [HH++ BDSM](https://github.com/zoop0kemon/hh-plus-plus/) installed and active, it only works with it.

## Development

Edit the TypeScript modules in `src/modules/`. `src/index.ts` starts Jarvis and registers the modules with HH++. `package.json` supplies the version for both the userscript header and the HH++ tab. Record changes in `CHANGELOG.md`.

Record every testing update in `CHANGELOG-DEV.md`, including fixes to features that are still in testing. For a public release, add one summary to `CHANGELOG.md` covering what players gain compared with the previous public release. Describe the finished feature once. The Dev popup uses the detailed entry when both files contain the same version. Start each entry with `- **x.y.z**` and add a summary or indented bullets below it.

Run `npm ci` with Node.js 20 or newer.

| Command | Result |
| --- | --- |
| `npm run build:testing` | Writes the minified `hh-jarvis-dev.user.js` and a transition copy for the old Dev install URL on `testing`. |
| `npm run watch` | Rebuilds the testing userscript when source files change. |
| `npm run build` | Writes a minified stable userscript to `dist/hh-jarvis.user.js`. |
| `npm run check` | Type-checks the source and verifies the committed testing userscript. |

Install the [Dev userscript](https://raw.githubusercontent.com/Iron-Man-Mk85/hh-jarvis/testing/hh-jarvis-dev.user.js) from the testing branch in Tampermonkey and enable one channel at a time. The transition copy retains the Dev identity and points to the new update URL.

For an approved stable release, fast-forward the reusable `release` branch to `main`. Merge the approved `testing` commit if the full batch is approved, or cherry-pick the approved source commits and their dependencies for a partial release. Set the release version and notes for the selected changes. Run `npm run build:release` to write the stable userscript and remove the Dev artifact, then run `npm run check -- stable` before opening the PR from `release` to `main`.

After the merge, sync `main` into `testing` and run `npm run build:testing` and `npm run check`. Keep any newer work and version already on `testing`.

after verifying the release on `main`, give the requester a ready-to-paste discord announcement. use lowercase discord markdown with a script and version heading and short bullets on what changed for players since the last stable release. put the raw message in a plain fenced block for copying.

## License & Disclaimer

This project is provided "as is" for personal use.  
**Disclaimer:** The author is not responsible for any damage, loss, or issues caused by using this script. Use at your own risk.
