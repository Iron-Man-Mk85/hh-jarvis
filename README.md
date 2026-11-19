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

The changelog popup uses the notes in `CHANGELOG.md`. Put the current version first as `- **x.y.z**` and add a summary or indented bullets below it.

Run `npm ci` with Node.js 20 or newer.

| Command | Result |
| --- | --- |
| `npm run build:testing` | Writes the readable `hh-jarvis.user.js` with inline TypeScript source maps. Commit this file with the source on `testing`. |
| `npm run watch` | Rebuilds the testing userscript when source files change. |
| `npm run build` | Writes a minified stable userscript to `dist/hh-jarvis.user.js`. |
| `npm run check` | Type-checks the source and verifies the committed testing userscript. |

Install the [Dev userscript](https://raw.githubusercontent.com/Iron-Man-Mk85/hh-jarvis/testing/hh-jarvis.user.js) from the testing branch in Tampermonkey and enable one channel at a time.

For an approved stable release, use a release branch, run `npm run build:release` to write the stable build to the root, and run `npm run check -- stable` before opening the PR to `main`. If merging `main` into the release branch conflicts on the generated file, rebuild it from the merged source and stage the result.

## License & Disclaimer

This project is provided "as is" for personal use.  
**Disclaimer:** The author is not responsible for any damage, loss, or issues caused by using this script. Use at your own risk.
