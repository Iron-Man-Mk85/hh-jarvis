// ==UserScript==
// @name           HH J.A.R.V.I.S. (Dev)
// @version        0.7.4
// @description    QoL for KK games
// @author         Iron Man
// @match          https://*.pornstarharem.com/*
// @match          https://*.hentaiheroes.com/*
// @match          https://*.comixharem.com/*
// @match          https://*.mangarpg.com/*
// @match          https://*.amouragent.com/*
// @run-at         document-start
// @namespace      https://github.com/Iron-Man-Mk85/hh-jarvis/testing
// @downloadURL    https://raw.githubusercontent.com/Iron-Man-Mk85/hh-jarvis/testing/hh-jarvis.user.js
// @updateURL      https://raw.githubusercontent.com/Iron-Man-Mk85/hh-jarvis/testing/hh-jarvis.user.js
// @icon           https://www.google.com/s2/favicons?sz=64&domain=hentaiheroes.com
// @grant          none
// ==/UserScript==

"use strict";
"use strict";
(() => {
  // src/game.ts
  var $;
  var currentPage;
  function initGame(jQuery) {
    $ = jQuery;
    currentPage = window.location.pathname;
  }

  // src/settingsHelp.ts
  function settingHelp(label, description) {
    const escape = (text) => text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    return escape(label) + ' <span class="ironman-setting-help" role="button" tabindex="0" aria-label="About ' + escape(label) + '" data-setting-help="' + escape(description) + '">?</span>';
  }
  function mountSettingsHelp(panel, tooltipId) {
    const tooltip = document.createElement("div");
    tooltip.id = tooltipId;
    tooltip.className = "ironman-setting-tooltip";
    tooltip.setAttribute("role", "tooltip");
    const popover = typeof tooltip.showPopover === "function";
    if (popover) tooltip.setAttribute("popover", "manual");
    else tooltip.hidden = true;
    document.body.appendChild(tooltip);
    let anchor = null;
    const getHelp = (target) => target instanceof Element ? target.closest("[data-setting-help]") : null;
    const close = () => {
      if (!anchor) return;
      anchor.removeAttribute("aria-describedby");
      anchor = null;
      if (popover) tooltip.hidePopover();
      else tooltip.hidden = true;
    };
    const show = (help) => {
      if (anchor === help) return;
      close();
      anchor = help;
      help.setAttribute("aria-describedby", tooltipId);
      tooltip.textContent = help.dataset.settingHelp ?? "";
      if (popover) tooltip.showPopover();
      else tooltip.hidden = false;
      const bounds = help.getBoundingClientRect();
      const { offsetWidth, offsetHeight } = tooltip;
      tooltip.style.left = Math.max(8, Math.min(bounds.left, document.documentElement.clientWidth - offsetWidth - 8)) + "px";
      const below = bounds.bottom + 6;
      tooltip.style.top = (below + offsetHeight <= window.innerHeight - 8 ? below : Math.max(8, bounds.top - offsetHeight - 6)) + "px";
    };
    panel.addEventListener("pointerover", (event) => {
      const help = getHelp(event.target);
      if (help && event.pointerType !== "touch") show(help);
    });
    panel.addEventListener("pointerout", (event) => {
      const help = getHelp(event.target);
      if (help === anchor && help && document.activeElement !== help) close();
    });
    panel.addEventListener("focusin", (event) => {
      const help = getHelp(event.target);
      if (help) show(help);
    });
    panel.addEventListener("focusout", (event) => {
      if (getHelp(event.target) === anchor) close();
    });
    panel.addEventListener("click", (event) => {
      const help = getHelp(event.target);
      if (!help) return;
      event.preventDefault();
      event.stopPropagation();
      show(help);
    });
    panel.addEventListener("keydown", (event) => {
      const help = getHelp(event.target);
      if (help && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        event.stopPropagation();
        show(help);
      } else if (anchor && event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    });
    document.addEventListener("pointerdown", (event) => {
      if (getHelp(event.target) !== anchor) close();
    });
    panel.addEventListener("scroll", close, { passive: true });
  }

  // src/settings.css
  var settings_default = `.hh-plus-plus-config-panel .group-panel[rel="JARVIS"] .panel-contents {
    align-content: start;
    align-items: start;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
}
.hh-plus-plus-config-panel:has(> .group-panel[rel="JARVIS"].shown) {
    overflow: clip;
}
.hh-plus-plus-config-panel .group-panel[rel="JARVIS"] .config-setting.has-subsettings {
    grid-row-end: auto;
}
.hh-plus-plus-config-panel .group-panel[rel="JARVIS"] .jarvis-packed-settings {
    grid-auto-flow: row dense;
    grid-auto-rows: 1px;
    row-gap: 0;
}
.hh-plus-plus-config-panel .group-panel[rel="JARVIS"] .jarvis-packed-settings .config-setting {
    grid-row-end: span var(--jarvis-setting-rows, 1);
}
.hh-plus-plus-config-panel .tabs h4[rel="JARVIS"] {
    position: relative;
}
.hh-plus-plus-config-panel .tabs h4[rel="JARVIS"].selected::after {
    content: var(--jarvis-version);
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: .15rem;
    font-size: .625rem;
    font-weight: normal;
    line-height: 1;
    text-transform: none;
    pointer-events: none;
}
.ironman-setting-help {
    display: inline-grid;
    place-items: center;
    box-sizing: border-box;
    inline-size: 1.25em;
    block-size: 1.25em;
    border: 1px solid currentColor;
    border-radius: 50%;
    font-size: .8em;
    line-height: 1;
    vertical-align: .08em;
    cursor: help;
}
.ironman-setting-help:hover,
.ironman-setting-help:focus-visible {
    outline: 1px solid currentColor;
    outline-offset: 2px;
}
.ironman-setting-tooltip {
    position: fixed;
    inset: auto;
    z-index: 10010;
    box-sizing: border-box;
    max-width: min(18rem, calc(100vw - 16px));
    margin: 0;
    padding: .5em .7em;
    border: 1px solid var(--config-setting-border, #a9a3bc);
    border-radius: .4em;
    background: var(--config-setting-background, #241e30);
    color: #fff;
    font: 14px/1.4 system-ui, sans-serif;
    pointer-events: none;
}
.hh-plus-plus-config-panel .group-panel[rel="JARVIS"] .jarvis-mark-color input {
    width: 30px;
    height: 20px;
    flex: none;
    padding: 0;
}
button.jarvis-contest-pin {
    all: unset;
    display: inline-block;
    margin-inline-start: .35em;
    padding-inline: .2em;
    color: inherit;
    font-size: .9em;
    line-height: 1;
    cursor: pointer;
}
.jarvis-contest-pin::before {
    content: '☆';
}
.jarvis-contest-pin[aria-pressed="true"]::before {
    content: '★';
    color: #ffd36b;
}
.jarvis-contest-pin:focus-visible {
    outline: 1px solid currentColor;
}
.jarvis-contest-choice {
    display: inline-flex;
    width: fit-content;
    gap: .12em;
    padding: .12em;
    border: 1px solid color-mix(in srgb, currentColor 55%, transparent);
    border-radius: .45em;
    color: inherit;
    line-height: 1.15;
}
.jarvis-contest-choice button {
    all: unset;
    padding: .18em .38em;
    border-radius: .26em;
    color: inherit;
    font: inherit;
    line-height: inherit;
    white-space: nowrap;
    cursor: pointer;
}
.jarvis-contest-choice button[aria-pressed="true"] {
    background: color-mix(in srgb, currentColor 22%, transparent);
}
.jarvis-contest-choice button:hover {
    background: color-mix(in srgb, currentColor 15%, transparent);
}
.jarvis-contest-choice button:focus-visible {
    outline: 1px solid currentColor;
}
.jarvis-contest-rank-start {
    margin-inline-start: .28em;
    font-size: .7em;
    vertical-align: middle;
}
.jarvis-contest-settings {
    display: grid;
    gap: .3em;
    min-width: 0;
    margin: .45em 0 0;
    padding: 0;
    border: 0;
    font-size: .85em;
}
.jarvis-contest-settings .jarvis-contest-choice {
    box-sizing: border-box;
    max-width: 100%;
    flex-wrap: wrap;
}
.jarvis-contest-settings [hidden] {
    display: none;
}
.jarvis-contest-settings:disabled .jarvis-contest-choice {
    opacity: .5;
}
.jarvis-contest-settings:disabled button {
    cursor: default;
}
.jarvis-contest-shortcuts {
    position: absolute;
    inset-block-start: 1.3rem;
    inset-inline-end: 3rem;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: .3em;
    transform: translateY(-50%);
}
.jarvis-contest-shortcuts button {
    all: unset;
    box-sizing: border-box;
    display: grid;
    place-content: center;
    gap: .15em;
    min-inline-size: 2.85em;
    padding: .28em .45em;
    border: 1px solid color-mix(in srgb, currentColor 40%, transparent);
    border-radius: .4em;
    background: color-mix(in srgb, currentColor 10%, transparent);
    color: inherit;
    font: inherit;
    font-size: .9em;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
}
.jarvis-contest-shortcuts button span {
    font-size: .75em;
}
.jarvis-contest-shortcuts button:hover {
    background: color-mix(in srgb, currentColor 18%, transparent);
}
.jarvis-contest-shortcuts button[aria-pressed="true"] {
    background: color-mix(in srgb, currentColor 27%, transparent);
}
.jarvis-contest-shortcuts button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}
.jarvis-mark-menu {
    position: fixed;
    z-index: 10000;
    display: grid;
    gap: 2px;
    padding: 4px;
    border: 1px solid #8994a7;
    border-radius: 6px;
    background: #232936;
    color: #fff;
    box-shadow: 0 2px 10px #0008;
    font: 13px/1.35 system-ui, sans-serif;
}
.jarvis-mark-menu button {
    all: unset;
    padding: 4px 9px;
    border-radius: 3px;
    cursor: pointer;
}
.jarvis-mark-menu button:hover,
.jarvis-mark-menu button:focus-visible {
    background: #414d64;
}
#contests .left_part .scroll_area.jarvis-contest-instant,
#contests .right_part.jarvis-contest-instant .lead_table_view {
    scroll-behavior: auto !important;
    overflow-anchor: none !important;
}
#contests .jarvis-contest-loading {
    opacity: 0 !important;
    transition: none !important;
    pointer-events: none;
}
#contests .right_part .ranking[id_contest].jarvis-contest-other {
    display: none !important;
}
[data-jarvis-mark="friend"] {
    color: var(--jarvis-friend-color) !important;
}
[data-jarvis-mark="foe"] {
    color: var(--jarvis-foe-color) !important;
}
[data-jarvis-mark],
td[data-jarvis-mark] > a {
    text-shadow: 1px 0 #111827, -1px 0 #111827, 0 1px #111827, 0 -1px #111827 !important;
}
td[data-jarvis-mark] > a {
    color: inherit !important;
}
.jarvis-setting-action {
    appearance: none;
    padding: .2em .5em;
    border: 1px solid currentColor;
    border-radius: .35em;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
}
.jarvis-setting-action:hover,
.jarvis-setting-action:focus-visible {
    background: color-mix(in srgb, currentColor 16%, transparent);
}
.jarvis-setting-action:disabled {
    cursor: default;
    opacity: .5;
}
.jarvis-mark-setting-actions,
.jarvis-mark-actions {
    display: flex;
    flex-wrap: wrap;
    gap: .4em;
}
.jarvis-mark-manager {
    box-sizing: border-box;
    width: min(34rem, calc(100vw - 2rem));
    max-height: calc(100vh - 2rem);
    padding: 1rem;
    border: 1px solid var(--config-setting-border, #a9a3bc);
    border-radius: .65rem;
    background: var(--config-setting-background, #241e30);
    color: #fff;
    font: 15px/1.35 system-ui, sans-serif;
}
.jarvis-mark-manager::backdrop {
    background: #080b12aa;
}
.jarvis-mark-manager h2,
.jarvis-mark-manager h3,
.jarvis-mark-manager p {
    margin: 0;
}
.jarvis-mark-lists {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(13rem, 100%), 1fr));
    gap: .9rem;
    max-height: 50vh;
    overflow-y: auto;
    scrollbar-gutter: stable;
    padding-inline-end: .7rem;
    margin-block: .9rem;
}
.jarvis-mark-lists ul {
    margin: .3em 0 0;
    padding: 0;
    list-style: none;
}
.jarvis-mark-lists li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .45em;
    padding: .2em 0;
    overflow-wrap: anywhere;
}
.jarvis-mark-lists li button {
    flex: none;
}
.jarvis-mark-actions {
    justify-content: space-between;
}
.jarvis-view-changelog {
    margin-top: .45em;
}
.hh-plus-plus-config-button > .jarvis-changelog-notice {
    position: absolute;
    inset-inline-end: calc(100% + .35em);
    top: 50%;
    translate: 0 -50%;
    height: 64%;
    padding: 0 .45em;
    border: 1px solid var(--config-setting-border, #a9a3bc);
    border-radius: .45em;
    background: var(--config-setting-background, #241e30);
    color: #fff;
    font: 600 .75rem/1 system-ui, sans-serif;
    cursor: pointer;
}
.jarvis-changelog-notice:hover {
    filter: brightness(1.2);
}
.jarvis-changelog-notice:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}
dialog.jarvis-changelog-popup {
    --jarvis-changelog-height: min(32rem, calc(100vh - 1.25rem));
    box-sizing: border-box;
    position: fixed;
    inset: 0;
    width: min(37rem, calc(100% - 1.25rem));
    height: fit-content;
    max-height: var(--jarvis-changelog-height);
    margin: auto;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--config-setting-border, #a9a3bc);
    border-radius: .6rem;
    background: var(--config-setting-background, #241e30);
    color: #fff;
    font: 15px/1.45 system-ui, sans-serif;
    text-align: start;
}
@supports (height: 100dvh) {
    dialog.jarvis-changelog-popup {
        --jarvis-changelog-height: min(32rem, calc(100dvh - 1.25rem));
    }
}
.jarvis-changelog-popup::backdrop {
    background: #080b12aa;
}
.jarvis-changelog-content {
    box-sizing: border-box;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    gap: clamp(.45rem, 2vw, .9rem);
    max-height: calc(var(--jarvis-changelog-height) - 2px);
    padding: clamp(.6rem, 3vw, 1rem);
}
.jarvis-changelog-content h2,
.jarvis-changelog-content h3 {
    margin: 0;
}
.jarvis-changelog-content h2 {
    font-size: 1.3em;
}
.jarvis-changelog-content h3 {
    color: var(--config-setting-border, #d9c7fb);
    font-size: 1em;
}
.jarvis-changelog-content section + section,
.jarvis-changelog-content details {
    margin-top: .75rem;
}
.jarvis-changelog-notes {
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    overflow-wrap: anywhere;
}
.jarvis-changelog-notes ul {
    margin: .2em 0 0;
    padding-inline-start: 1.2em;
    list-style: disc;
}
.jarvis-changelog-notes li + li {
    margin-top: .25em;
}
.jarvis-changelog-notes summary {
    margin-bottom: .4rem;
    cursor: pointer;
}
.jarvis-changelog-content footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: end;
    gap: .5em;
}
.jarvis-changelog-opt-out {
    display: inline-flex;
    align-items: center;
    gap: .4em;
    margin-inline-end: auto;
    cursor: pointer;
}
`;

  // src/settings.ts
  function injectStyles() {
    const style = document.createElement("style");
    style.className = "hh-jarvis-style";
    style.textContent = `${settings_default}
        .hh-plus-plus-config-panel { --jarvis-version: "v${"0.7.4"}"; }
    `;
    document.head.appendChild(style);
  }
  function packSettings() {
    if (currentPage !== "/home.html") return;
    const selector = '.hh-plus-plus-config-panel .group-panel[rel="JARVIS"] .panel-contents';
    window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
      const panel = document.querySelector(selector);
      if (!panel) return;
      panel.classList.remove("hh-scroll");
      mountSettingsHelp(panel, "jarvis-setting-tooltip");
      window.addEventListener("wheel", (event) => {
        if (event.ctrlKey || !(event.target instanceof Node) || !panel.contains(event.target)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? panel.clientHeight : 1;
        const scale = panel.getBoundingClientRect().height / panel.offsetHeight || 1;
        panel.scrollTop += event.deltaY * unit / scale;
      }, { capture: true, passive: false });
      const cards = panel.querySelectorAll(".config-setting");
      const pack = () => {
        if (!panel.offsetWidth) return;
        for (const card of cards) {
          card.style.setProperty("--jarvis-setting-rows", String(card.offsetHeight + 10));
        }
        panel.classList.add("jarvis-packed-settings");
      };
      const groupObserver = new MutationObserver(pack);
      if (panel.parentElement) groupObserver.observe(panel.parentElement, { attributeFilter: ["class"] });
      if (typeof ResizeObserver !== "undefined") {
        const sizeObserver = new ResizeObserver(pack);
        cards.forEach((card) => sizeObserver.observe(card));
      }
      pack();
    });
  }

  // src/HHModule.ts
  var HHModule = class {
    group = "JARVIS";
    configSchema;
    hasRun = false;
    constructor({ configSchema }) {
      this.configSchema = configSchema;
    }
  };

  // src/storage.ts
  var LS_CONFIG_NAME = "HHStark";
  function lsGet(key, ls_name = LS_CONFIG_NAME) {
    return JSON.parse(localStorage.getItem(`${ls_name}${key}`) ?? "null");
  }
  function lsSet(key, value, ls_name = LS_CONFIG_NAME) {
    return localStorage.setItem(`${ls_name}${key}`, JSON.stringify(value));
  }
  function lsRm(key, ls_name = LS_CONFIG_NAME) {
    return localStorage.removeItem(`${ls_name}${key}`);
  }

  // src/modules/players/markManager.ts
  function openMarkManager(read, remove, clear) {
    if (document.querySelector(".jarvis-mark-manager")) return;
    const dialog = document.createElement("dialog");
    dialog.className = "jarvis-mark-manager";
    dialog.setAttribute("aria-labelledby", "jarvis-mark-manager-title");
    const title = document.createElement("h2");
    title.id = "jarvis-mark-manager-title";
    title.textContent = "Friends and foes";
    const lists = document.createElement("div");
    lists.className = "jarvis-mark-lists";
    const actions = document.createElement("div");
    actions.className = "jarvis-mark-actions";
    const clearAll = makeButton("Clear all marks", () => {
      if (confirm("Remove all friend and foe marks for this game?") && clear()) {
        render();
        close.focus();
      }
    });
    const close = makeButton("Close", () => dialog.close());
    actions.append(clearAll, close);
    function render() {
      const entries = read().sort((a, b) => Number(!a.name) - Number(!b.name) || (a.name || a.id).localeCompare(b.name || b.id, void 0, { numeric: true }));
      const sections = ["friend", "foe"].map((mark) => {
        const section = document.createElement("section");
        const heading = document.createElement("h3");
        const matches = entries.filter((entry) => entry.mark === mark);
        heading.textContent = (mark === "friend" ? "Friends" : "Foes") + ` (${matches.length})`;
        section.appendChild(heading);
        if (matches.length === 0) {
          const empty = document.createElement("p");
          empty.textContent = "No saved players.";
          section.appendChild(empty);
          return section;
        }
        const list = document.createElement("ul");
        for (const { id, name } of matches) {
          const row = document.createElement("li");
          const player = document.createElement("span");
          player.textContent = name ? `${name} · ${id}` : `Player #${id}`;
          if (!name) player.title = "Name not recorded yet";
          const button = makeButton("Remove", () => {
            const index = Array.from(lists.querySelectorAll("button")).indexOf(button);
            if (remove(id)) {
              render();
              const remaining = lists.querySelectorAll("button");
              (remaining[Math.min(index, remaining.length - 1)] || close).focus();
            }
          });
          button.setAttribute("aria-label", `Remove ${name || `player ${id}`} from ${mark === "friend" ? "friends" : "foes"}`);
          row.append(player, button);
          list.appendChild(row);
        }
        section.appendChild(list);
        return section;
      });
      lists.replaceChildren(...sections);
      clearAll.disabled = entries.length === 0;
    }
    render();
    dialog.append(title, lists, actions);
    const listeners = new AbortController();
    window.addEventListener("storage", (event) => {
      if (!event.key || ["PlayerMarks", "PlayerMarkNames", "FriendList", "FoeList"].some((key) => event.key === LS_CONFIG_NAME + key)) render();
    }, { signal: listeners.signal });
    dialog.addEventListener("close", () => {
      listeners.abort();
      dialog.remove();
    }, { once: true });
    document.body.appendChild(dialog);
    dialog.showModal();
    close.focus();
  }
  function makeButton(label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "jarvis-setting-action";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  // src/modules/players/FriendAndFoes.ts
  var DEFAULT_COLORS = { friend: "#48a9ff", foe: "#ff6173" };
  function readRowName(element) {
    const text = element.textContent?.trim() ?? "";
    if (!text.endsWith("+")) return text;
    const withoutStandalonePlus = text.replace(/\s+\+$/, "");
    if (!element.childElementCount) return withoutStandalonePlus;
    const label = element.cloneNode(true);
    for (const child of label.querySelectorAll("*")) {
      if (child.textContent?.trim() === "+") child.remove();
    }
    return label.textContent?.trim().replace(/\s+\+$/, "") || withoutStandalonePlus;
  }
  function displaySavedName(saved) {
    if (typeof saved !== "string") return saved?.name;
    return saved.trim().replace(/([^+])\+$/, "$1").trimEnd();
  }
  var FriendAndFoes = class extends HHModule {
    names = /* @__PURE__ */ new Map();
    markMenu = null;
    root = null;
    rootSelector = "";
    inLeague = false;
    constructor() {
      const baseKey = "friendAndFoes";
      const configSchema = {
        baseKey,
        default: true,
        label: settingHelp("Friends and foes", "Right-click each player's name to add or remove a mark. Manage saved marks below."),
        subSettings: [{
          key: "league",
          label: settingHelp("In leagues", "Show marks and allow marking in league tables."),
          default: true
        }, {
          key: "contests",
          label: settingHelp("In contests", "Show marks and allow marking on contest leaderboards."),
          default: true
        }]
      };
      super({ name: baseKey, configSchema });
    }
    shouldRun() {
      return ["/leagues.html", "/activities.html"].includes(currentPage);
    }
    readSetting(key) {
      try {
        return lsGet(key);
      } catch {
        return null;
      }
    }
    readMarks() {
      const stored = this.readSetting("PlayerMarks");
      if (stored && typeof stored === "object" && !Array.isArray(stored)) return stored;
      const marks = {};
      for (const [key, mark] of [["FriendList", "friend"], ["FoeList", "foe"]]) {
        const list = this.readSetting(key);
        if (!Array.isArray(list)) continue;
        for (const id of list) {
          if (/^[1-9]\d*$/.test(String(id))) marks[String(id)] = mark;
        }
      }
      return marks;
    }
    readColors() {
      const saved = this.readSetting("PlayerMarkColors");
      return {
        friend: typeof saved?.friend === "string" && /^#[\da-f]{6}$/i.test(saved.friend) ? saved.friend : DEFAULT_COLORS.friend,
        foe: typeof saved?.foe === "string" && /^#[\da-f]{6}$/i.test(saved.foe) ? saved.foe : DEFAULT_COLORS.foe
      };
    }
    readSavedNames() {
      const saved = this.readSetting("PlayerMarkNames");
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
      return Object.fromEntries(Object.entries(saved).filter((entry) => {
        const [, value] = entry;
        return typeof value === "string" || Boolean(value && typeof value === "object" && typeof value.name === "string");
      }));
    }
    saveNames(names) {
      try {
        lsSet("PlayerMarkNames", names);
      } catch (err) {
        console.warn("Jarvis could not remember marked player names:", err);
      }
    }
    removeMark(id) {
      const marks = this.readMarks();
      delete marks[id];
      if (!this.saveSetting("PlayerMarks", marks)) return false;
      const names = this.readSavedNames();
      if (id in names) {
        delete names[id];
        this.saveNames(names);
      }
      return true;
    }
    readSavedMarks() {
      const names = this.readSavedNames();
      return Object.entries(this.readMarks()).flatMap(([id, mark]) => /^[1-9]\d*$/.test(id) && (mark === "friend" || mark === "foe") ? [{ id, name: displaySavedName(names[id]), mark }] : []);
    }
    saveSetting(key, value) {
      try {
        lsSet(key, value);
        return true;
      } catch {
        alert("Jarvis could not save your Friends and Foes settings.");
        return false;
      }
    }
    installSettings() {
      if (currentPage !== "/home.html") return;
      const selector = '.group-panel[rel="JARVIS"] .config-setting[rel="JARVIS_friendAndFoes"] .sub-settings';
      window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
        const settings = document.querySelector(selector);
        if (!settings || settings.querySelector(".jarvis-mark-color")) return;
        const inputs = /* @__PURE__ */ new Map();
        for (const [mark, text] of [["friend", "Friend name color"], ["foe", "Foe name color"]]) {
          const label = document.createElement("label");
          label.className = "jarvis-mark-color";
          const title = document.createElement("span");
          title.textContent = text;
          const input = document.createElement("input");
          input.type = "color";
          input.value = this.readColors()[mark];
          inputs.set(mark, input);
          input.disabled = !settings.closest(".config-setting")?.classList.contains("enabled");
          input.addEventListener("change", () => {
            const colors = this.readColors();
            if (!this.saveSetting("PlayerMarkColors", { ...colors, [mark]: input.value })) input.value = colors[mark];
          });
          label.append(title, input);
          settings.appendChild(label);
        }
        const reset = document.createElement("button");
        reset.type = "button";
        reset.className = "jarvis-setting-action";
        reset.textContent = "Reset colors";
        reset.addEventListener("click", () => {
          if (!this.saveSetting("PlayerMarkColors", {})) return;
          for (const [mark, input] of inputs) input.value = DEFAULT_COLORS[mark];
        });
        const manage = document.createElement("button");
        manage.type = "button";
        manage.className = "jarvis-setting-action";
        manage.textContent = "Manage marks";
        manage.addEventListener("click", () => openMarkManager(
          () => this.readSavedMarks(),
          (id) => this.removeMark(id),
          () => {
            if (!this.saveSetting("PlayerMarks", {})) return false;
            this.saveNames({});
            return true;
          }
        ));
        const actions = document.createElement("div");
        actions.className = "jarvis-mark-setting-actions";
        actions.append(reset, manage);
        settings.appendChild(actions);
      });
    }
    closeMarkMenu() {
      this.markMenu?.remove();
      this.markMenu = null;
    }
    openMarkMenu(event, name, id) {
      event.preventDefault();
      event.stopPropagation();
      this.closeMarkMenu();
      const menu = document.createElement("div");
      menu.className = "jarvis-mark-menu";
      menu.setAttribute("role", "group");
      menu.setAttribute("aria-label", "Mark player");
      const addAction = (text, act) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = text;
        button.addEventListener("click", () => {
          this.closeMarkMenu();
          if (name.isConnected && this.names.get(name) === id) act();
        });
        menu.appendChild(button);
      };
      for (const [mark, text] of [["friend", "Mark as friend"], ["foe", "Mark as foe"]]) {
        addAction(text, () => this.applyMark(id, mark));
      }
      if (name.dataset.jarvisMark) addAction("Remove this player’s mark", () => {
        if (this.removeMark(id)) this.refresh();
      });
      menu.addEventListener("click", (click) => click.stopPropagation());
      document.body.appendChild(menu);
      this.markMenu = menu;
      const bounds = name.getBoundingClientRect();
      const x = event.clientX || bounds.left;
      const y = event.clientY || bounds.bottom;
      menu.style.left = Math.max(0, Math.min(x, document.documentElement.clientWidth - menu.offsetWidth)) + "px";
      menu.style.top = Math.max(0, Math.min(y, document.documentElement.clientHeight - menu.offsetHeight)) + "px";
      menu.querySelector("button")?.focus({ preventScroll: true });
    }
    getContestNames(root, contests) {
      const names = /* @__PURE__ */ new Map();
      const byContest = /* @__PURE__ */ new Map();
      for (const row of root.querySelectorAll(".leadTable tr")) {
        const cell = row.cells?.[1];
        if (!cell || cell.localName !== "td") continue;
        const name = cell.querySelector(".nickname") || cell;
        let id = row.getAttribute("sorting_id") || name.getAttribute("id-member") || name.querySelector("[id-member]")?.getAttribute("id-member");
        const contestId = row.closest("[id_contest]")?.getAttribute("id_contest");
        if (contestId) {
          let byName = byContest.get(contestId);
          if (!byName) {
            const participants = contests.find((contest) => String(contest.id_contest) === contestId)?.participants;
            byName = /* @__PURE__ */ new Map();
            for (const { nickname, id_member } of Object.values(participants || {})) {
              const nicknameKey = String(nickname ?? "").trim();
              if (!nicknameKey || !/^[1-9]\d*$/.test(String(id_member))) continue;
              const matches2 = byName.get(nicknameKey) || /* @__PURE__ */ new Set();
              matches2.add(String(id_member));
              byName.set(nicknameKey, matches2);
            }
            byContest.set(contestId, byName);
          }
          const matches = byName.get(readRowName(name));
          if (matches && !matches.has(id ?? "")) id = matches.size === 1 ? matches.values().next().value : null;
        }
        if (id && /^[1-9]\d*$/.test(id)) names.set(name, id);
      }
      return names;
    }
    refresh() {
      const root = document.querySelector(this.rootSelector);
      this.root = root;
      const contests = this.inLeague ? [] : [
        ...Object.values(window.contests?.active ?? {}),
        ...Object.values(window.contests?.finished ?? {})
      ].filter((contest) => contest?.id_contest != null);
      const names = !root ? /* @__PURE__ */ new Map() : this.inLeague ? new Map(Array.from(root.querySelectorAll(".nickname[id-member]"), (name) => [name, name.getAttribute("id-member")]).filter((entry) => !!entry[1] && /^[1-9]\d*$/.test(entry[1]))) : this.getContestNames(root, contests);
      for (const name of this.names.keys()) {
        if (names.has(name)) continue;
        delete name.dataset.jarvisPlayer;
        delete name.dataset.jarvisMark;
      }
      this.names = names;
      if (!root) return;
      const marks = this.readMarks();
      const savedNames = this.readSavedNames();
      const rosterNames = /* @__PURE__ */ new Set();
      let namesChanged = false;
      const rememberName = (id, text) => {
        const displayName = typeof text === "string" ? text.trim() : "";
        if (!displayName || marks[id] !== "friend" && marks[id] !== "foe") return false;
        const previous = savedNames[id];
        if (typeof previous === "string" || previous?.name !== displayName) {
          savedNames[id] = { name: displayName };
          namesChanged = true;
        }
        return true;
      };
      if (this.inLeague) {
        for (const { player, nickname } of window.opponents_list ?? []) {
          const id = String(player?.id_fighter);
          if (rememberName(id, nickname)) rosterNames.add(id);
        }
      } else {
        for (const contest of contests) {
          for (const { id_member, nickname } of Object.values(contest.participants ?? {})) {
            const id = String(id_member);
            if (!rosterNames.has(id) && rememberName(id, nickname)) rosterNames.add(id);
          }
        }
      }
      const colors = this.readColors();
      for (const [mark, color] of Object.entries(colors)) {
        const property = "--jarvis-" + mark + "-color";
        if (root.style.getPropertyValue(property) !== color) root.style.setProperty(property, color);
      }
      for (const [name, id] of names) {
        if (name.dataset.jarvisPlayer !== id) name.dataset.jarvisPlayer = id;
        const mark = marks[id];
        if (mark === "friend" || mark === "foe") {
          if (name.dataset.jarvisMark !== mark) name.dataset.jarvisMark = mark;
          if (!rosterNames.has(id)) rememberName(id, readRowName(name));
        } else if (name.dataset.jarvisMark) {
          delete name.dataset.jarvisMark;
        }
      }
      if (namesChanged) this.saveNames(savedNames);
    }
    applyMark(id, mark) {
      const marks = this.readMarks();
      marks[id] = mark;
      if (this.saveSetting("PlayerMarks", marks)) this.refresh();
    }
    handleMarkMenu(event) {
      if (event.target instanceof Node && this.markMenu?.contains(event.target)) return;
      this.closeMarkMenu();
      if (event.type !== "contextmenu" && !event.altKey) return;
      const name = event.target instanceof Element ? event.target.closest("[data-jarvis-player]") : null;
      if (!name) return;
      const id = this.names.get(name);
      if (!id) return;
      this.openMarkMenu(event, name, id);
    }
    run({ league, contests }) {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      this.inLeague = currentPage === "/leagues.html";
      if (this.inLeague ? !league : !contests) return;
      this.rootSelector = this.inLeague ? ".league_table" : "#contests .right_part";
      const handleMarkMenu = (event) => this.handleMarkMenu(event);
      document.addEventListener("click", handleMarkMenu, true);
      document.addEventListener("contextmenu", handleMarkMenu, true);
      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !this.markMenu) return;
        event.preventDefault();
        event.stopPropagation();
        this.closeMarkMenu();
      }, true);
      window.addEventListener("storage", (event) => {
        if (!event.key || ["PlayerMarks", "PlayerMarkColors", "FriendList", "FoeList"].some((key) => event.key === LS_CONFIG_NAME + key)) this.refresh();
      });
      const observer = new MutationObserver((mutations) => {
        const root = document.querySelector(this.rootSelector);
        if (root !== this.root || root && mutations.some(({ target }) => root.contains(target))) {
          this.refresh();
        }
      });
      observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["sorting_id", "id-member", "id_contest"]
      });
      this.refresh();
      this.hasRun = true;
    }
  };

  // src/modules/contests/contestPreferences.ts
  var CONTEST_KINDS = [["daily", "Daily"], ["event", "Event"]];
  var CONTEST_EVENTS = [["any", "Any"], ["cbc", "CbC"], ["ccc", "CCC"], ["lc", "LC"]];
  var CONTEST_RANKS = [["top", "Top"], ["mine", "My rank"]];
  function readContestSetting(key) {
    try {
      return lsGet(key);
    } catch {
      return null;
    }
  }
  function readContestDefaults() {
    const kind = readContestSetting("ContestKind") === "daily" ? "daily" : "event";
    const savedEvent = readContestSetting("ContestEvent");
    const event = CONTEST_EVENTS.find(([value]) => value === savedEvent)?.[0] ?? "any";
    const rank = readContestSetting("ContestRankStart") === "top" ? "top" : "mine";
    return { kind, event, rank };
  }
  function readPinnedRank(id, fallback) {
    const saved = readContestSetting("ContestPinnedRank");
    if (saved && typeof saved === "object" && "id" in saved && saved.id === id && "rank" in saved) {
      if (saved.rank === "mine" || saved.rank === "top") return saved.rank;
    }
    return fallback;
  }
  function makeRankChoice(label, select) {
    return makeChoice(label, CONTEST_RANKS, select);
  }
  function makeChoice(label, options, select) {
    const group = document.createElement("span");
    group.className = "jarvis-contest-choice";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", label);
    group.addEventListener("keydown", (event) => event.stopPropagation());
    for (const [value, text] of options) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = text;
      button.dataset.contestChoice = value;
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        select(value);
      });
      group.appendChild(button);
    }
    return group;
  }
  function selectContestChoice(group, value) {
    for (const button of group.querySelectorAll("button")) {
      button.setAttribute("aria-pressed", String(button.dataset.contestChoice === value));
    }
  }
  function installContestSettings() {
    if (currentPage !== "/home.html") return;
    const selector = '.group-panel[rel="JARVIS"] .config-setting[rel="JARVIS_contestStart"]';
    window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
      const card = document.querySelector(selector);
      if (!card || card.querySelector(".jarvis-contest-settings")) return;
      const fieldset = document.createElement("fieldset");
      fieldset.className = "jarvis-contest-settings";
      fieldset.setAttribute("aria-label", "Contest startup defaults");
      const save = (key, value, group) => {
        try {
          lsSet(key, value);
          selectContestChoice(group, value);
          return true;
        } catch (err) {
          console.warn("Jarvis could not save the contest default:", err);
          return false;
        }
      };
      const eventLabel = document.createElement("div");
      eventLabel.innerHTML = settingHelp("Event type", "Prefer CbC (Cumback Contest), CCC (Crazy Cumback Contest), or LC (Legendary Contest) when active. Any opens the bottom active contest, as does an unavailable event type.");
      const events = makeChoice("Event type", CONTEST_EVENTS, (value) => save("ContestEvent", value, events));
      const showEvents = (kind) => eventLabel.hidden = events.hidden = kind === "daily";
      const kinds = makeChoice("Preferred contest", CONTEST_KINDS, (value) => {
        if (save("ContestKind", value, kinds)) showEvents(value);
      });
      const ranks = makeRankChoice("Default leaderboard position", (value) => save("ContestRankStart", value, ranks));
      const defaults = readContestDefaults();
      selectContestChoice(kinds, defaults.kind);
      selectContestChoice(events, defaults.event);
      selectContestChoice(ranks, defaults.rank);
      showEvents(defaults.kind);
      const kindLabel = document.createElement("div");
      kindLabel.innerHTML = settingHelp("Preferred contest", "Daily opens the first active daily contest. Event can prefer an event type or follow the game and open the bottom active contest.");
      const rankLabel = document.createElement("div");
      rankLabel.innerHTML = settingHelp("Leaderboard start", "Open at the top or at your rank. A starred contest can have its own position.");
      fieldset.append(kindLabel, kinds, eventLabel, events, rankLabel, ranks);
      const refreshEnabled = () => fieldset.disabled = !card.classList.contains("enabled");
      refreshEnabled();
      new MutationObserver(refreshEnabled).observe(card, { attributeFilter: ["class"] });
      card.appendChild(fieldset);
    });
  }

  // src/modules/contests/contestShortcuts.ts
  function positionContestShortcuts(canvas, bar) {
    const close = canvas.parentElement?.querySelector(":scope > .close_cross");
    if (!close) return;
    const frame = canvas.getBoundingClientRect();
    const cross = close.getBoundingClientRect();
    const scaleX = frame.width / canvas.offsetWidth;
    const scaleY = frame.height / canvas.offsetHeight;
    if (!scaleX || !scaleY || !cross.width) return;
    bar.style.insetInlineEnd = `${Math.ceil((frame.right - cross.left) / scaleX + 8)}px`;
    bar.style.insetBlockStart = `${Math.round((cross.top + cross.height / 2 - frame.top) / scaleY)}px`;
  }
  function renderContestShortcuts(canvas, contests, selected, select) {
    let bar = canvas.querySelector(":scope > .jarvis-contest-shortcuts");
    if (!contests.length) {
      bar?.remove();
      return;
    }
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "jarvis-contest-shortcuts";
      bar.setAttribute("role", "group");
      bar.setAttribute("aria-label", "Active contests");
      bar.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) return;
        const id = event.target.closest("button[data-contest-id]")?.dataset.contestId;
        if (id) select(id);
      });
      canvas.prepend(bar);
      positionContestShortcuts(canvas, bar);
    }
    const buttons = new Map(Array.from(bar.querySelectorAll("button"), (button) => [button.dataset.contestId, button]));
    const categories = contests.map((contest) => contest.category);
    for (const [index, { id, category, name, rank }] of contests.entries()) {
      let button = buttons.get(id);
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.dataset.contestId = id;
        button.append(document.createElement("span"), document.createElement("strong"));
      }
      const type = categories.indexOf(category) === categories.lastIndexOf(category) ? category : `${category} ${categories.slice(0, index + 1).filter((value) => value === category).length}`;
      const [label, placement] = Array.from(button.children);
      if (label.textContent !== type) label.textContent = type;
      if (placement.textContent !== (rank || "–")) placement.textContent = rank || "–";
      const description = `${type} · ${name} · ${rank ? `Rank ${rank}` : "Rank unavailable"}`;
      if (button.title !== description) {
        button.title = description;
        button.setAttribute("aria-label", description);
      }
      const pressed = String(id === selected);
      if (button.getAttribute("aria-pressed") !== pressed) button.setAttribute("aria-pressed", pressed);
      if (button !== bar.children[index]) bar.insertBefore(button, bar.children[index] ?? null);
      buttons.delete(id);
    }
    for (const button of buttons.values()) button.remove();
  }

  // src/modules/contests/ContestStart.ts
  var CONTEST_SHORT_LABELS = {
    daily: "DC",
    cbc: "CbC",
    ccc: "CCC",
    lc: "LC",
    event: "Event"
  };
  var CONTEST_TITLE_SELECTOR = ".contest_title, .contest_name, h3, h4, h5";
  function getContestCategory(category) {
    switch (category?.trim().toLowerCase().replace(/[- ]+/g, "_")) {
      case "daily":
      case "daily_contest":
        return "daily";
      case "cumback":
      case "cumback_contest":
      case "cbc":
        return "cbc";
      case "crazy_cumback":
      case "crazy_cumback_contest":
      case "ccbc":
      case "ccc":
        return "ccc";
      case "legendary":
      case "legendary_contest":
      case "lc":
        return "lc";
      default:
        return category ? "event" : null;
    }
  }
  function armContestStartupGuard() {
    "use strict";
    if (location.pathname !== "/activities.html" || new URLSearchParams(location.search).get("tab") !== "contests") return;
    try {
      if (JSON.parse(localStorage.getItem("HHPlusPlusConfig") ?? "null")?.JARVIS_contestStart === false) return;
    } catch {
      return;
    }
    const guard = document.createElement("style");
    guard.id = "jarvis-contest-startup";
    guard.textContent = `
        #contests .left_part .scroll_area,
        #contests .right_part {
            opacity: 0 !important;
            transition: none !important;
            pointer-events: none;
        }
    `;
    const observer = new MutationObserver(() => {
      if (!document.documentElement) return;
      document.documentElement.appendChild(guard);
      observer.disconnect();
    });
    if (document.documentElement) document.documentElement.appendChild(guard);
    else observer.observe(document, { childList: true });
    setTimeout(() => {
      observer.disconnect();
      guard.remove();
    }, 4e3);
  }
  var ContestStart = class extends HHModule {
    preference = "";
    startupPending = false;
    defaults = readContestDefaults();
    list = null;
    right = null;
    restoringCard = null;
    reposition = null;
    stopJump = null;
    stopSwitchScroll = false;
    switchScroll = null;
    leaderboardPositions = /* @__PURE__ */ new Map();
    observer = null;
    listeners = null;
    constructor() {
      const baseKey = "contestStart";
      const configSchema = {
        baseKey,
        default: true,
        label: settingHelp("Contest startup", "Open the preferred contest and rank on load, and switch active contests from the header. A starred contest takes priority on load."),
        subSettings: [{
          key: "noSwitchScroll",
          label: settingHelp("Stop scrolling on contest switches", "Keep the contest list in place and remember each leaderboard’s position when you switch cards. You can still scroll either pane by hand."),
          default: false
        }]
      };
      super({ name: baseKey, configSchema });
    }
    shouldRun() {
      return currentPage === "/activities.html";
    }
    getContests(list, finished) {
      const active = new Map(Object.values(window.contests?.active || {}).filter((contest) => contest?.id_contest != null).map((contest) => [String(contest.id_contest), contest]));
      return Array.from(list.querySelectorAll(".contest[id_contest]")).flatMap((card) => {
        const id = card.getAttribute("id_contest");
        if (!id) return [];
        const contest = active.get(id);
        const header = card.querySelector(".contest_header");
        if (!header || finished.has(id)) return [];
        if (!contest && !header.matches(".in_progress")) return [];
        const title = header.querySelector(CONTEST_TITLE_SELECTOR);
        const name = title && Array.from(title.childNodes).filter((node) => !(node instanceof Element) || !node.matches(".jarvis-contest-pin, .jarvis-contest-rank-start")).map((node) => node.textContent).join("").trim();
        const category = getContestCategory(contest?.category_type);
        return [{
          id,
          card,
          header,
          title,
          category,
          label: String(name || contest?.name || contest?.title || (category === "daily" ? "Daily contest" : "Contest")).trim()
        }];
      });
    }
    getTarget(contests) {
      if (this.preference) return contests.find((contest) => contest.id === this.preference);
      if (this.defaults.kind === "event") {
        if (this.defaults.event !== "any") {
          const event = [...contests].reverse().find((contest) => contest.category === this.defaults.event);
          if (event || document.readyState !== "complete") return event;
        }
        return contests.at(-1);
      }
      return contests.find((contest) => contest.category === "daily") ?? contests.find((contest) => contest.category === null) ?? contests[0];
    }
    clearExpiredPin(list, contests, finished) {
      if (!this.preference || contests.some(({ id }) => id === this.preference)) return;
      const active = window.contests?.active;
      const missing = document.readyState === "complete" && list.querySelector(".contest_header") && active && !Object.values(active).some((contest) => String(contest?.id_contest) === this.preference);
      if (!finished.has(this.preference) && !missing) return;
      const expiredId = this.preference;
      this.preference = "";
      this.stopJump?.(false);
      try {
        if (String(lsGet("ContestStartId")) === expiredId) lsRm("ContestStartId");
      } catch (err) {
        console.warn("Jarvis could not clear the expired contest preference:", err);
      }
    }
    updatePins(list, contests) {
      const hosts = new Set(contests.map(({ title, header }) => title || header));
      for (const control of list.querySelectorAll(".jarvis-contest-pin, .jarvis-contest-rank-start")) {
        if (!control.parentElement || !hosts.has(control.parentElement)) control.remove();
      }
      for (const { id, title, header, label } of contests) {
        const host = title || header;
        let pin = host.querySelector(":scope > .jarvis-contest-pin");
        if (!pin) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "jarvis-contest-pin";
          button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const contestId = button.closest(".contest[id_contest]")?.getAttribute("id_contest");
            if (!contestId) return;
            const next = this.preference === contestId ? "" : contestId;
            try {
              if (next) lsSet("ContestStartId", next);
              else lsRm("ContestStartId");
              this.preference = next;
              this.startupPending = false;
              this.stopJump?.();
            } catch (err) {
              console.warn("Jarvis could not save the contest preference:", err);
            }
            this.refresh();
          });
          pin = host.appendChild(button);
        }
        const pinned = this.preference === id;
        pin.setAttribute("aria-pressed", String(pinned));
        pin.setAttribute("aria-label", pinned ? `Unpin ${label}` : `Pin ${label} to open on reload`);
        pin.title = pinned ? "Pinned. Click to use your contest defaults." : "Open this contest when the page reloads";
        let position = host.querySelector(":scope > .jarvis-contest-rank-start");
        if (!pinned) {
          position?.remove();
          continue;
        }
        if (!position) {
          const choice = makeRankChoice("Pinned leaderboard start", (rank) => {
            try {
              lsSet("ContestPinnedRank", { id, rank });
              selectContestChoice(choice, rank);
            } catch (err) {
              console.warn("Jarvis could not save the leaderboard position:", err);
            }
          });
          choice.classList.add("jarvis-contest-rank-start");
          pin.after(choice);
          position = choice;
        }
        selectContestChoice(position, readPinnedRank(id, this.defaults.rank));
      }
    }
    getSelectedContestId(list, right) {
      const selected = list.querySelector(".contest_header_active")?.closest(".contest[id_contest]");
      if (selected) return selected.getAttribute("id_contest");
      const panels = Array.from(right.querySelectorAll(".ranking[id_contest]")).filter((panel) => panel.getClientRects().length && getComputedStyle(panel).visibility === "visible");
      return panels.length === 1 ? panels[0].getAttribute("id_contest") : null;
    }
    showLeaderboard(right, contestId) {
      if (!contestId) {
        right.querySelectorAll(".jarvis-contest-other").forEach((panel) => panel.classList.remove("jarvis-contest-other"));
        return;
      }
      for (const panel of right.querySelectorAll(".ranking[id_contest]")) {
        panel.classList.toggle("jarvis-contest-other", panel.getAttribute("id_contest") !== contestId);
      }
    }
    getOwnRow(board) {
      const own = board.querySelector(".leadTable tr.lead_table_default");
      if (own) return own;
      const heroId = (window.shared?.Hero || window.Hero)?.infos?.id;
      if (heroId == null) return null;
      return Array.from(board.querySelectorAll(".leadTable tr[sorting_id]")).find((row) => row.getAttribute("sorting_id") === String(heroId));
    }
    getLeaderboardScroller(right, id) {
      return Array.from(right.querySelectorAll(".ranking[id_contest]")).find((panel) => panel.getAttribute("id_contest") === id)?.querySelector(".lead_table_view");
    }
    updateShortcuts(list, right, contests) {
      const canvas = list.closest("#contests");
      if (!canvas) return;
      const shortcuts = contests.map(({ id, header, label, category }) => {
        const board = this.getLeaderboardScroller(right, id);
        const rank = header.querySelector(".personal_rewards .rank")?.textContent?.trim() || board && this.getOwnRow(board)?.querySelector("td")?.textContent?.trim() || "";
        return { id, name: label, category: category ? CONTEST_SHORT_LABELS[category] : "Contest", rank };
      });
      renderContestShortcuts(canvas, shortcuts, this.getSelectedContestId(list, right), (id) => this.openShortcut(id));
    }
    openShortcut(id) {
      const { list, right } = this;
      if (!list || !right || this.getSelectedContestId(list, right) === id) return;
      const card = list.querySelector(`.contest[id_contest="${CSS.escape(id)}"]`);
      const header = card?.querySelector(".contest_header");
      if (!header || header.matches(".ended") || card?.matches(".ended")) return;
      this.stopJump?.();
      this.prepareSwitch(list, right, id, true);
      (header.querySelector(CONTEST_TITLE_SELECTOR) || header).click();
      this.refresh();
    }
    prepareSwitch(list, right, id, keepPosition) {
      this.startupPending = false;
      if (keepPosition && id && id !== this.getSelectedContestId(list, right)) this.holdSwitchPosition(list, right, id);
      this.showLeaderboard(right, null);
      document.getElementById("jarvis-contest-startup")?.remove();
    }
    lockScroll(scroller) {
      $(scroller).stop(true, false);
      const ignoreScroll = () => {
      };
      const get = Object.getOwnPropertyDescriptor(Element.prototype, "scrollTop")?.get;
      const descriptors = Object.entries({
        scrollTop: { get, set: ignoreScroll },
        scroll: { value: ignoreScroll, writable: true },
        scrollTo: { value: ignoreScroll, writable: true },
        scrollBy: { value: ignoreScroll, writable: true }
      }).filter(([key]) => !Object.hasOwn(scroller, key));
      for (const [key, descriptor] of descriptors) {
        Object.defineProperty(scroller, key, { ...descriptor, configurable: true });
      }
      return () => {
        $(scroller).stop(true, false);
        for (const [key, descriptor] of descriptors) {
          const current = Object.getOwnPropertyDescriptor(scroller, key);
          if (current && current.value === descriptor.value && current.set === descriptor.set) Reflect.deleteProperty(scroller, key);
        }
      };
    }
    jumpTo(scroller, target, center = false) {
      let top = 0;
      if (target) {
        const bounds = scroller.getBoundingClientRect();
        const scale = bounds.height / scroller.offsetHeight;
        if (!scale) return;
        const item = target.getBoundingClientRect();
        top = scroller.scrollTop + (item.top - bounds.top) / scale - scroller.clientTop;
        if (center) top -= (scroller.clientHeight - item.height / scale) / 2;
      }
      this.scrollInstantly(scroller, top);
    }
    scrollInstantly(scroller, position) {
      const top = Math.max(0, Math.min(scroller.scrollHeight - scroller.clientHeight, position));
      if (Math.abs(top - scroller.scrollTop) >= 1) {
        const scrollTo = Element.prototype.scrollTo;
        scrollTo.call(scroller, { top, behavior: "instant" });
      }
    }
    holdSwitchPosition(list, right, id) {
      this.switchScroll?.stop();
      const selected = this.getSelectedContestId(list, right);
      if (selected) {
        const previous = this.getLeaderboardScroller(right, selected);
        if (previous?.clientHeight) this.leaderboardPositions.set(selected, previous.scrollTop);
      }
      const listTop = list.scrollTop;
      const boardTop = this.leaderboardPositions.get(id) ?? 0;
      const releaseList = this.lockScroll(list);
      let board;
      let releaseBoard;
      const restore = () => {
        const next = this.getLeaderboardScroller(right, id);
        if (next !== board) {
          releaseBoard?.();
          board = next;
          releaseBoard = board ? this.lockScroll(board) : void 0;
        }
        this.scrollInstantly(list, listTop);
        if (board?.clientHeight) this.scrollInstantly(board, boardTop);
      };
      const handlers = new AbortController();
      const options = { capture: true, passive: true, signal: handlers.signal };
      const stop = () => {
        clearTimeout(timer);
        handlers.abort();
        releaseList();
        releaseBoard?.();
        this.switchScroll = null;
      };
      const timer = setTimeout(stop, 4e3);
      const onScroll = (event) => {
        if (event.target === list || event.target === board) restore();
      };
      for (const pane of [list, right]) {
        pane.addEventListener("scroll", onScroll, options);
        for (const type of ["wheel", "touchmove", "pointerdown"]) pane.addEventListener(type, stop, options);
      }
      document.addEventListener("keydown", (event) => {
        if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) stop();
      }, options);
      this.switchScroll = { restore, stop };
      restore();
    }
    openContest(list, right, { id, card, header, title }) {
      for (const pane of [list, right]) pane.classList.add("jarvis-contest-instant", "jarvis-contest-loading");
      const rank = id === this.preference ? readPinnedRank(id, this.defaults.rank) : this.defaults.rank;
      const placeAtOwnRank = rank === "mine";
      const releaseList = this.lockScroll(list);
      let board;
      let releaseBoard;
      let positioned = false;
      let lastAttempt;
      const updateBoard = () => {
        const next = this.getLeaderboardScroller(right, id);
        if (board === next) return;
        releaseBoard?.();
        board = next;
        releaseBoard = board ? this.lockScroll(board) : void 0;
      };
      const reveal = () => {
        for (const pane of [list, right]) pane.classList.remove("jarvis-contest-loading");
        document.getElementById("jarvis-contest-startup")?.remove();
      };
      const restore = () => {
        if (!list.isConnected || !right.isConnected || !list.contains(card)) return;
        updateBoard();
        const selected = this.getSelectedContestId(list, right);
        if (selected !== id && selected !== lastAttempt) {
          lastAttempt = selected;
          this.showLeaderboard(right, null);
          (title || header).click();
          updateBoard();
        }
        if (!board?.clientHeight || this.getSelectedContestId(list, right) !== id || placeAtOwnRank && !board.querySelector(".leadTable")) return;
        lastAttempt = void 0;
        this.showLeaderboard(right, id);
        this.jumpTo(list, card);
        this.jumpTo(board, placeAtOwnRank ? this.getOwnRow(board) : null, placeAtOwnRank);
        if (!positioned) {
          positioned = true;
          clearTimeout(timer);
          reveal();
        }
      };
      const onScroll = (event) => {
        if (event.target === list || event.target === board) restore();
      };
      const inputEvents = ["pointerdown", "touchstart", "wheel", "click"];
      const onInput = (event) => {
        if (event.isTrusted) stop();
      };
      const stopOnKey = (event) => {
        if (event.isTrusted && ["Tab", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", "Enter", " "].includes(event.key)) stop();
      };
      const afterLoad = () => {
        lastAttempt = void 0;
        restore();
      };
      const stop = (finish = true) => {
        releaseList();
        releaseBoard?.();
        for (const pane of [list, right]) {
          pane.removeEventListener("scroll", onScroll, true);
          pane.classList.remove("jarvis-contest-instant", "jarvis-contest-loading");
        }
        for (const event of inputEvents) document.removeEventListener(event, onInput, true);
        document.removeEventListener("keydown", stopOnKey, true);
        window.removeEventListener("load", afterLoad);
        clearTimeout(timer);
        this.stopJump = null;
        this.reposition = null;
        this.restoringCard = null;
        if (finish) {
          this.startupPending = false;
          reveal();
        }
      };
      const timer = setTimeout(stop, 4e3);
      this.stopJump = stop;
      this.reposition = restore;
      this.restoringCard = card;
      for (const pane of [list, right]) {
        pane.addEventListener("scroll", onScroll, { passive: true, capture: true });
      }
      for (const event of inputEvents) document.addEventListener(event, onInput, { passive: true, capture: true });
      document.addEventListener("keydown", stopOnKey, true);
      if (document.readyState !== "complete") window.addEventListener("load", afterLoad, { once: true });
      restore();
    }
    refresh() {
      const list = document.querySelector("#contests .left_part .scroll_area");
      const right = document.querySelector("#contests .right_part");
      if (this.list !== list || this.right !== right) this.switchScroll?.stop();
      if (this.stopJump && (this.list !== list || this.right !== right || !list?.contains(this.restoringCard))) {
        this.stopJump(false);
        if (this.right) this.showLeaderboard(this.right, null);
      }
      this.list = list;
      this.right = right;
      if (!list || !right || !list.getClientRects().length || getComputedStyle(list).visibility !== "visible") return;
      const finished = new Set(Object.values(window.contests?.finished || {}).filter((contest) => contest?.id_contest != null).map((contest) => String(contest.id_contest)));
      for (const ended of list.querySelectorAll(".contest.ended, .contest_header.ended")) {
        const id = ended.closest(".contest[id_contest]")?.getAttribute("id_contest");
        if (id) finished.add(id);
      }
      const contests = this.getContests(list, finished);
      this.clearExpiredPin(list, contests, finished);
      this.updatePins(list, contests);
      if (this.reposition) {
        this.reposition();
      } else if (this.startupPending) {
        const target = this.getTarget(contests);
        if (target) this.openContest(list, right, target);
        else if (document.readyState === "complete" && !this.preference) {
          document.getElementById("jarvis-contest-startup")?.remove();
        }
      } else {
        this.showLeaderboard(right, this.getSelectedContestId(list, right));
        this.switchScroll?.restore();
      }
      this.updateShortcuts(list, right, contests);
    }
    run({ noSwitchScroll = false }) {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      const pin = readContestSetting("ContestStartId");
      this.preference = (typeof pin === "string" || typeof pin === "number") && pin ? String(pin) : "";
      this.startupPending = true;
      this.stopSwitchScroll = noSwitchScroll;
      this.defaults = readContestDefaults();
      this.listeners = new AbortController();
      const { signal } = this.listeners;
      this.observer = new MutationObserver((mutations) => {
        const list = document.querySelector("#contests .left_part .scroll_area");
        const right = document.querySelector("#contests .right_part");
        if (list !== this.list || right !== this.right || mutations.some(({ target }) => list && (list.contains(target) || target.contains(list)) || right && (right.contains(target) || target.contains(right)))) {
          this.refresh();
        }
      });
      this.observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style", "hidden", "id_contest"]
      });
      if (document.readyState !== "complete") window.addEventListener("load", () => this.refresh(), { once: true, signal });
      window.addEventListener("resize", () => {
        const canvas = this.list?.closest("#contests");
        const bar = canvas?.querySelector(":scope > .jarvis-contest-shortcuts");
        if (canvas && bar) positionContestShortcuts(canvas, bar);
      }, { signal });
      document.body.addEventListener("click", (event) => {
        if (!event.isTrusted || !(event.target instanceof Element) || !this.right || !this.list?.contains(event.target)) return;
        const header = event.target.closest(".contest_header");
        if (!header || event.target.closest(".jarvis-contest-pin, .jarvis-contest-rank-start")) return;
        const id = header.closest(".contest[id_contest]")?.getAttribute("id_contest");
        this.prepareSwitch(this.list, this.right, id ?? null, this.stopSwitchScroll);
      }, { capture: true, signal });
      this.refresh();
      this.hasRun = true;
    }
    updateSubSetting(key, value) {
      if (key !== "noSwitchScroll") return;
      this.stopSwitchScroll = value;
      if (!value) this.switchScroll?.stop();
    }
    tearDown() {
      this.observer?.disconnect();
      this.listeners?.abort();
      this.stopJump?.();
      this.switchScroll?.stop();
      this.leaderboardPositions.clear();
      this.startupPending = false;
      this.list?.closest("#contests")?.querySelector(":scope > .jarvis-contest-shortcuts")?.remove();
      this.list?.querySelectorAll(".jarvis-contest-pin, .jarvis-contest-rank-start").forEach((control) => control.remove());
      if (this.right) this.showLeaderboard(this.right, null);
      document.getElementById("jarvis-contest-startup")?.remove();
      this.hasRun = false;
    }
  };

  // src/modules/players/LeagueTop20.ts
  var LeagueTop20 = class extends HHModule {
    constructor() {
      const baseKey = "leagueTop20";
      const configSchema = {
        baseKey,
        default: true,
        label: settingHelp("Promotion target", "Show the points needed to reach the larger of the top 20 or top 15% below the highest league tier.")
      };
      super({ name: baseKey, configSchema });
    }
    shouldRun() {
      return currentPage.includes("/leagues.html");
    }
    run() {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      window.HHPlusPlus.Helpers.doWhenSelectorAvailable(".scriptLeagueInfo", () => {
        const summary = document.querySelector(".scriptLeagueInfo");
        if (!summary || summary.querySelector(".jarvisTop20")) return;
        const { opponents_list, current_tier_number, max_league } = window;
        const tier = Number(current_tier_number);
        if (!(tier > 0 && tier < Number(max_league))) return;
        const heroId = (window.shared?.Hero || window.Hero)?.infos?.id;
        if (!Array.isArray(opponents_list) || heroId == null) return;
        const player = opponents_list.find(({ player: player2 }) => String(player2?.id_fighter) === String(heroId));
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
        const comparison = inPromotion ? `Rank ${comparisonRank} has ${format.format(target)} points. Your lead is ${format.format(difference)} points.` : `You need ${format.format(target)} points to pass rank ${comparisonRank}.`;
        const tooltip = `${rule} ${comparison}`;
        const entry = document.createElement("span");
        entry.className = "jarvisTop20";
        entry.setAttribute("hh_title", tooltip);
        entry.setAttribute("tooltip", "");
        entry.setAttribute("aria-label", tooltip);
        const badge = document.createElement("span");
        badge.className = "scriptLeagueInfoIcon";
        badge.style.backgroundColor = "#3769ba";
        badge.style.textAlign = "center";
        badge.textContent = String(promotionRank);
        entry.append(badge, `${difference === 0 ? "" : inPromotion ? "-" : "+"}${format.format(Math.abs(difference))}`);
        summary.insertBefore(entry, summary.querySelector(".minTop30, .promotionInfo"));
      });
      this.hasRun = true;
    }
  };

  // src/modules/progression/RemovePassLock.ts
  var RemovePassLock = class extends HHModule {
    selectorToFind = ".lock_yellow_icn";
    classToRemove = "lock_yellow_icn";
    constructor() {
      const baseKey = "removePassLock";
      const configSchema = {
        baseKey,
        default: false,
        label: settingHelp("Pass lock icons", "Hide lock icons on reward passes so the rewards are easier to read."),
        subSettings: [{
          key: "pov",
          label: settingHelp("Path of Valor", "Hide lock icons on the Path of Valor passes."),
          default: true
        }, {
          key: "pog",
          label: settingHelp("Path of Glory", "Hide lock icons on the Path of Glory passes."),
          default: true
        }]
      };
      super({ name: baseKey, configSchema });
    }
    shouldRun() {
      return currentPage.includes("/path-of-valor.html") || currentPage.includes("/path-of-glory.html");
    }
    observeUntil(selector, callback, { once = true, timeout = 5e3 } = {}) {
      let timer = null;
      let elements = document.querySelectorAll(selector);
      if (elements.length) {
        callback(elements);
        if (once) return;
      }
      const observer = new MutationObserver(() => {
        elements = document.querySelectorAll(selector);
        if (elements.length) {
          if (once) {
            observer.disconnect();
            if (timer) clearTimeout(timer);
          }
          callback(elements);
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      if (Number.isFinite(timeout) && timeout > 0) {
        timer = setTimeout(() => {
          observer.disconnect();
        }, timeout);
      }
    }
    removeClassWhenSelectorAvailable(selector, classToRemove, { once = true, timeout = 5e3 } = {}) {
      this.observeUntil(selector, (elements) => {
        elements.forEach((el) => el.classList.remove(classToRemove));
      }, { timeout, once });
    }
    run({ pov, pog }) {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      if (currentPage.includes("/path-of-valor.html") && pov) {
        this.removeClassWhenSelectorAvailable(this.selectorToFind, this.classToRemove);
      } else if (currentPage.includes("/path-of-glory.html") && pog) {
        this.removeClassWhenSelectorAvailable(this.selectorToFind, this.classToRemove);
      }
      this.hasRun = true;
    }
  };

  // src/modules/love-raids/gameData.ts
  async function getGirlDictionary() {
    try {
      return await window.HHPlusPlus.Helpers.getGirlDictionary();
    } catch (err) {
      console.warn("Jarvis could not load the HH++ girl dictionary:", err);
      return null;
    }
  }

  // src/modules/love-raids/LoveRaidsAddon.ts
  var LoveRaidsAddon = class extends HHModule {
    rarityColors;
    constructor() {
      const baseKey = "loveRaidsAddon";
      const configSchema = {
        baseKey,
        default: false,
        label: settingHelp("Love Raids display", "Customize names, icons, and poses on Love Raid cards."),
        subSettings: [{
          key: "raid_id",
          label: settingHelp("Raid IDs", "Add the raid ID before its name."),
          default: false
        }, {
          key: "names",
          label: settingHelp("Hidden girl names", "Show the name on cards that use a mysterious girl label."),
          default: true
        }, {
          key: "skin",
          label: settingHelp("Skin indicator", "Mark cards that include a girl with a skin."),
          default: true
        }, {
          key: "color",
          label: settingHelp("Rarity colors", "Color the raid name based on the girl’s rarity."),
          default: true
        }, {
          key: "fight_icon",
          label: settingHelp("Fight icon", "Use the clearer fight-energy icon."),
          default: true
        }, {
          key: "shadows",
          label: settingHelp("Unshadowed poses", "Show the normal artwork in place of shadow poses."),
          default: true
        }]
      };
      super({ name: baseKey, configSchema });
      this.rarityColors = {
        rare: "LimeGreen",
        epic: "Gold",
        legendary: "MediumOrchid"
      };
    }
    shouldRun() {
      return currentPage.includes("/love-raids.html");
    }
    async run({ raid_id, skin, names, color, fight_icon, shadows }) {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      const raids = typeof love_raids !== "undefined" && Array.isArray(love_raids) ? love_raids : [];
      if (!raids.length) return;
      this.hasRun = true;
      const girlDict = await getGirlDictionary();
      const raidsById = new Map(raids.map((raid) => [String(raid.id_raid), raid]));
      document.querySelectorAll(".raid-card[id_raid]").forEach((raidCard) => {
        const raid = raidsById.get(raidCard.getAttribute("id_raid") ?? "");
        if (!raid || raid.id_girl == null) return;
        const { name, rarity, shards = 0 } = girlDict?.get(String(raid.id_girl)) || {};
        const haremLink = window.HHPlusPlus.Helpers.getHref(`/characters/${raid.id_girl}`);
        const raidNameElem = raidCard.querySelector(".raid-name > span > span");
        const name_label = names && name || raidNameElem?.textContent?.trim() || raid.event_name || raid.girl_data?.name || "";
        const raid_id_label = raid_id ? `(${raid.id_raid})` : "";
        const skin_label = skin && Array.isArray(raid?.girl_data?.grade_skins) && raid.girl_data.grade_skins.length > 0 ? "👙" : "";
        const displayParts = [];
        if (raid_id) displayParts.push(raid_id_label);
        displayParts.push(name_label);
        if (skin) displayParts.push(skin_label);
        const displayLabel = displayParts.join(" ").trim();
        if (raidNameElem && displayLabel) {
          raidNameElem.textContent = displayLabel;
        }
        const objectives = raidCard.querySelectorAll(".classic-girl");
        const girl = objectives[0];
        if (girl) {
          const girlNameElem = girl.querySelector(".girl-name");
          if (girlNameElem) {
            let link = girlNameElem.querySelector("a");
            if (!link) {
              link = document.createElement("a");
              link.className = "hh-girl-link";
              while (girlNameElem.firstChild) link.appendChild(girlNameElem.firstChild);
              girlNameElem.appendChild(link);
            }
            if (displayLabel) link.textContent = displayLabel;
            link.href = haremLink;
          }
          if (shards === 100) {
            const objElem = girl.querySelector(".objective");
            if (objElem) {
              objElem.innerText = `I'm already attracted to you. Find me in your Harem!`;
            }
          }
        }
        if (color && rarity) {
          const raidNameContainer = raidCard.querySelector(".raid-name");
          if (raidNameContainer) {
            raidNameContainer.style.color = this.rarityColors[rarity] || "";
          }
        }
        if (fight_icon) {
          const fightIcon = raidCard.querySelector(".hudBattlePts_mix_icn");
          if (fightIcon) {
            fightIcon.style.backgroundImage = "url(/images/pictures/design/ic_energy_fight.png)";
            fightIcon.style.backgroundSize = "24px";
          }
        }
        if (shadows) {
          const leftImage = raidCard.querySelector(".girl-img.left");
          if (leftImage) {
            leftImage.src = leftImage.src.replace("-black", "");
          }
          if (raidCard.classList.contains("multiple-girl")) {
            const rightImage = raidCard.querySelector(".girl-img.right");
            if (rightImage) {
              rightImage.src = rightImage.src.replace("-black", "");
            }
          }
          raidCard.querySelectorAll(".eye").forEach((e) => e.remove());
        }
      });
    }
  };

  // src/modules/love-raids/LoveRaidsParser.ts
  var LoveRaidsParser = class extends HHModule {
    girlDict = null;
    _boundInsertButton;
    /*
    * Raid ID, Announcement Type, Background ID, Event Name, Start Datetime,
    * End Datetime, Duration, Raid Status, Source, Girl ID,
    * Girl Name, Rarity, Max Grade, First Appearance, Source ID,
    * Has Skin(s)
    */
    constructor() {
      const baseKey = "loveRaidsParser";
      const configSchema = {
        baseKey,
        default: false,
        label: settingHelp("Love Raids export", "Add a button to copy new raids in a spreadsheet-ready format.")
      };
      super({ name: baseKey, configSchema });
    }
    shouldRun() {
      return currentPage.includes("/love-raids.html");
    }
    capitalizeFirst(str) {
      return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
    }
    getAnnouncementType(type) {
      switch (type) {
        case 1:
          return "Full";
        case 2:
          return "Partial";
        case 3:
          return "None";
        default:
          return "Unknown";
      }
    }
    getSourceID(event) {
      const source_id = Number(event.raid_module_pk);
      switch (event.raid_module_type) {
        case "season":
          return 0;
        case "champion":
          return Number.isFinite(source_id) ? source_id : -2;
        case "troll":
          return Number.isFinite(source_id) ? source_id + 10 : -2;
        default:
          return -1;
      }
    }
    girlHasSkins(event) {
      const hasSkins = Array.isArray(event?.girl_data?.grade_skins) && event.girl_data.grade_skins.length > 0;
      if (hasSkins) {
        return "X";
      } else return "O";
    }
    formatEventRow(event) {
      const durationHours = Math.floor(Number(event.event_duration_seconds) / 3600);
      const duration = `${durationHours} hours`;
      const girl = this.girlDict?.get(String(event.id_girl)) || {};
      const { name = "Unknown", rarity = "N/A", grade = 0 } = girl;
      return [
        event.id_raid,
        this.getAnnouncementType(event.id_announcement_type),
        event.background_id,
        event.event_name,
        event.start_datetime,
        event.end_datetime,
        duration,
        event.status,
        event.raid_module_type,
        event.id_girl,
        name,
        this.capitalizeFirst(rarity),
        grade,
        "",
        // one blank tab reserved for first appearance in GSheets
        this.getSourceID(event),
        this.girlHasSkins(event)
      ].join("	");
    }
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn("Clipboard API failed, using execCommand fallback:", err);
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          return document.execCommand("copy");
        } catch (err2) {
          return false;
        } finally {
          textarea.remove();
        }
      }
    }
    async handleCopyClick(evt) {
      const storageKey = "LastSavedRaidID";
      if (evt.shiftKey && evt.ctrlKey) {
        const confirmClear = confirm("⚠️ Do you want to clear the saved last raid ID for this site?");
        if (confirmClear) {
          lsRm(storageKey);
          alert("✅ Last saved ID cleared.");
        }
        return;
      }
      const localLoveRaids = typeof love_raids !== "undefined" && Array.isArray(love_raids) ? love_raids : [];
      if (!localLoveRaids.length) {
        alert("⚠️ No love_raids found on this page.");
        return;
      }
      if (!this.girlDict) {
        alert("⚠️ The HH++ girl dictionary could not be loaded. Reload the page and try again.");
        return;
      }
      let lastSavedIdNumber = parseInt(String(lsGet(storageKey)), 10);
      if (isNaN(lastSavedIdNumber) || evt.shiftKey) {
        const lastSavedId = prompt("Please enter the last saved ID:");
        lastSavedIdNumber = parseInt(String(lastSavedId), 10);
        if (isNaN(lastSavedIdNumber)) {
          alert("❌ Invalid ID entered. Please enter a valid number.");
          return;
        }
      }
      const filteredData = localLoveRaids.filter((event) => Number(event.id_raid) > lastSavedIdNumber);
      if (!filteredData.length) {
        alert(`ℹ️ No new events found with ID greater than ${lastSavedIdNumber}`);
        return;
      }
      const formattedData = filteredData.map(this.formatEventRow.bind(this)).join("\n");
      if (!await this.copyToClipboard(formattedData)) {
        alert("❌ Could not copy the raids. The last saved ID was kept.");
        return;
      }
      const maxId = Math.max(...filteredData.map((e) => Number(e.id_raid)));
      lsSet(storageKey, maxId);
      alert("✅ Data copied to clipboard! You can now paste it into GSheets.");
    }
    createCopyButton() {
      const button = document.createElement("div");
      button.classList.add("reminder-copy");
      button.style.cssText = `
            background: linear-gradient(180deg, #00aaff 0, #006688 50%, #005577 51%, #00aaff 100%);
            display: inline-block;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            margin-left: 10px;
            cursor: pointer;
            position: absolute;
            right: 4.5rem;
            top: 0.2rem;
            font-size: 18px;
            line-height: 32px;
            text-align: center;
            transition: background 0.2s ease;
        `;
      button.textContent = "📋";
      let buttonTitle = "Click = copy new raids. Shift / Shift + Ctrl available.";
      button.setAttribute("tooltip", "");
      button.setAttribute("hh_title", buttonTitle);
      const _boundCopyKeyHandler = (e) => this.updateCopyButton(e, button);
      window.addEventListener("keydown", _boundCopyKeyHandler);
      window.addEventListener("keyup", _boundCopyKeyHandler);
      button._boundCopyKeyHandler = _boundCopyKeyHandler;
      button.onclick = (e) => this.handleCopyClick(e);
      this.updateCopyButton({ shiftKey: false, ctrlKey: false }, button);
      return button;
    }
    updateCopyButton(e, button) {
      let buttonTitle = "";
      if (e.shiftKey && e.ctrlKey) {
        button.style.background = "linear-gradient(180deg, #ff6666 0, #aa0000 100%)";
        button.textContent = "🗑️";
        buttonTitle = "Shift + Ctrl + Click = clear saved ID";
        button.setAttribute("hh_title", buttonTitle);
      } else if (e.shiftKey) {
        button.style.background = "linear-gradient(180deg, #ffdd66 0, #cc9900 100%)";
        button.textContent = "✏️";
        buttonTitle = "Shift + Click = prompt for ID.";
        button.setAttribute("hh_title", buttonTitle);
      } else {
        button.style.background = "linear-gradient(180deg, #00aaff 0, #006688 50%, #005577 51%, #00aaff 100%)";
        button.textContent = "📋";
        buttonTitle = "Click = copy new raids. Shift / Shift + Ctrl available.";
        button.setAttribute("hh_title", buttonTitle);
      }
    }
    insertButton() {
      const notificationButton = document.querySelector(".button-notification-action.notif_button_s");
      if (notificationButton && !document.querySelector(".reminder-copy")) {
        const copyButton = this.createCopyButton();
        notificationButton.parentNode?.insertBefore(copyButton, notificationButton);
      }
    }
    async run() {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      this.hasRun = true;
      this.girlDict = await getGirlDictionary();
      this._boundInsertButton = this.insertButton.bind(this);
      if (document.readyState === "complete") this.insertButton();
      else window.addEventListener("load", this._boundInsertButton, { once: true });
    }
  };

  // src/modules/activities/ActivityParser.ts
  var ActivityParser = class extends HHModule {
    constructor() {
      const baseKey = "activityParser";
      const configSchema = {
        baseKey,
        default: false,
        label: settingHelp("Mission copier", "Enable the copy tool for legendary mission details."),
        subSettings: [{
          key: "missionCopier",
          label: settingHelp("Legendary details", "Click a legendary mission’s title, description, or image to copy it."),
          default: false
        }]
      };
      super({ name: baseKey, configSchema });
    }
    shouldRun() {
      return currentPage.includes("/activities.html");
    }
    async copyToClipboard(text) {
      await navigator.clipboard.writeText(text);
      const toast = document.createElement("div");
      toast.textContent = "Copied!";
      toast.style.position = "fixed";
      toast.style.bottom = "10px";
      toast.style.right = "10px";
      toast.style.background = "rgba(0,0,0,0.7)";
      toast.style.color = "white";
      toast.style.padding = "5px 10px";
      toast.style.borderRadius = "5px";
      toast.style.zIndex = "9999";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1e3);
    }
    run({ missionCopier }) {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      if (missionCopier) {
        const entries = document.querySelectorAll(".mission_entry.legendary");
        if (!entries.length) return;
        entries.forEach((entry) => {
          const imgDiv = entry.querySelector(".mission_image img");
          const titleAll = entry.querySelector(".mission_details h1");
          const desc = entry.querySelector(".mission_details p");
          if (imgDiv) {
            imgDiv.style.cursor = "pointer";
            imgDiv.addEventListener("click", (e) => {
              e.stopPropagation();
              this.copyToClipboard(imgDiv.src);
            });
          }
          if (titleAll) {
            titleAll.style.cursor = "pointer";
            const outerTitle = titleAll.querySelector(".event-mission-content-text");
            if (outerTitle) {
              outerTitle.style.cursor = "pointer";
              outerTitle.addEventListener("click", (e) => {
                e.stopPropagation();
                this.copyToClipboard((outerTitle.textContent ?? "").trim());
              });
            }
            titleAll.addEventListener("click", (e) => {
              if (e.target instanceof Element && e.target.closest(".event-mission-content-text")) return;
              const titleClone = titleAll.cloneNode(true);
              titleClone.querySelector(".event-mission-content-text")?.remove();
              const title = (titleClone.textContent ?? "").trim();
              this.copyToClipboard(title);
            });
          }
          if (desc) {
            desc.style.cursor = "pointer";
            desc.addEventListener("click", (e) => {
              e.stopPropagation();
              this.copyToClipboard(desc.innerText.trim());
            });
          }
        });
        this.hasRun = true;
      }
    }
  };

  // CHANGELOG.md
  var CHANGELOG_default = [{ version: "0.7.4", changes: ["See your rank in each active contest beside the close button and switch leaderboards without moving the contest list."] }, { version: "0.7.3", changes: ["See automatic changelogs only when loading the homepage after an update.", "Enable Silent changelog to get a New button beside HH++ and open the notes when you’re ready.", "Keep the contest list and each leaderboard in place when switching contests with Stop scrolling on contest switches."] }, { version: "0.7.2", changes: ["Open the bottom active contest at your rank by default. Choose CbC, CCC, or LC to prefer that event when available.", "Turn off automatic update notices with Don’t show again in the changelog popup. View changelog stays available in settings."] }, { version: "0.7.1", changes: ["Keep the changelog centered when the game window is resized.", "Clean up saved player names, explain unknown names on hover, and give Remove buttons more room."] }, { version: "0.7.0", changes: ["See what changed in Jarvis the first time a new version runs.", "Open View changelog from HH++ settings at any time, even with automatic notices turned off.", "Expand Earlier versions to read past updates."] }, { version: "0.6.7", changes: ["Make marking one action per player, backfill names for older marks, use the bracket-based promotion target, and simplify the selected contest buttons and version badge."] }, { version: "0.6.6", changes: ["Add setting help in HH++, improve mark contrast and management, and add automatic contest defaults.", "Rename the separately installed testing userscript to Dev."] }, { version: "0.6.5", changes: ["Move the userscript source into TypeScript modules and add separate stable and testing builds."] }, { version: "0.6.4", changes: ["Prevent pinned contest startup scrolling, keep native startup without a pin, and clear finished pins"] }, { version: "0.6.3", changes: ["Stop both contest startup scrolls, isolate the selected leaderboard, and restore pinned contests at Top or My rank"] }, { version: "0.6.2", changes: ["Pin contests on their cards, hide the startup scroll, and use right-click marking with isolated settings scrolling"] }, { version: "0.6.1", changes: ["Read native Manga RPG contest titles and recognize active cards when contest data is unavailable"] }, { version: "0.6.0", changes: ["Add a contest start preference, continuous marking, and compact settings with a version label"] }, { version: "0.5.0", changes: ["Add league and contest player marking with custom colors, compact settings, and limit Top 20 to promotable leagues"] }, { version: "0.4.2", changes: ["Fix module startup, league controls, and raid exports; add the Top 20 league target"] }, { version: "0.4.1", changes: ["Fix Love Raids shadows replacement"] }, { version: "0.4.0", changes: ["Add ActivityParser module"] }, { version: "0.3.1", changes: ["Add harem link inside love raid cards"] }, { version: "0.3.0", changes: ["Add LoveRaidsAddon and LoveRaidsParser modules"] }, { version: "0.2.0", changes: ["Add RemovePassLock module"] }, { version: "0.1.3", changes: ["Better code practices"] }, { version: "0.1.2", changes: ["Polishing and update links"] }, { version: "0.1.1", changes: ["Add FriendAndFoes module"] }, { version: "0.0.1", changes: ["Initial release"] }];

  // src/modules/updates/changelogPopup.ts
  function showChangelogPopup(view) {
    const dialog = document.createElement("dialog");
    dialog.className = "jarvis-changelog-popup";
    dialog.setAttribute("aria-labelledby", "jarvis-changelog-title");
    dialog.appendChild(view.content);
    const openDialog = () => {
      dialog.showModal();
      view.closeButton.focus({ preventScroll: true });
      view.onOpen();
    };
    const bindClose = (dismiss) => {
      const handlers2 = new AbortController();
      const options = { signal: handlers2.signal };
      view.closeButton.addEventListener("click", dismiss, options);
      dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        dismiss();
      }, options);
      dialog.addEventListener("click", (event) => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dismiss();
      }, options);
      return handlers2;
    };
    const queue = window.shared?.PopupQueueManager;
    const host = document.getElementById("common-popups");
    if (host && typeof queue?.add === "function" && typeof queue.close === "function") {
      const wrapper = document.createElement("div");
      wrapper.className = "popup_wrapper jarvis-changelog-native";
      wrapper.appendChild(dialog);
      let active = false;
      const dismiss = () => {
        if (!active) return;
        active = false;
        queue.close({ type: "common" });
      };
      const handlers2 = bindClose(dismiss);
      try {
        queue.add({ popup: {
          type: "common",
          popup_name: "jarvis_changelog",
          close_on_esc: false,
          // The dialog handles Escape, so the queue is closed only once.
          $dom_element: $(wrapper),
          init: () => host.appendChild(wrapper),
          onOpen: () => {
            active = true;
            if (!view.shouldOpen()) {
              queueMicrotask(dismiss);
              return;
            }
            if (!wrapper.isConnected) host.appendChild(wrapper);
            openDialog();
          },
          addEventListeners: () => {
          },
          onClose: () => {
            active = false;
            if (dialog.open) dialog.close();
            wrapper.remove();
            view.onClose();
          },
          removeEventListeners: () => handlers2.abort(),
          destroy: dismiss
        } });
        return;
      } catch (err) {
        handlers2.abort();
        if (dialog.open) dialog.close();
        wrapper.remove();
        console.warn("Jarvis could not use the game popup queue:", err);
      }
    }
    if (!view.shouldOpen()) {
      view.onClose();
      return;
    }
    const finish = () => {
      handlers.abort();
      dialog.remove();
      view.onClose();
    };
    const handlers = bindClose(() => {
      dialog.close();
      finish();
    });
    dialog.addEventListener("close", finish, { signal: handlers.signal });
    document.body.appendChild(dialog);
    openDialog();
  }

  // src/modules/updates/Changelog.ts
  var seenKey = `ChangelogSeen${"Dev"}`;
  var latestVersion = CHANGELOG_default[0].version;
  var configKey = "JARVIS_changelog";
  var settingsCard = `.group-panel[rel="JARVIS"] .config-setting[rel="${configKey}"]`;
  function readSeenVersion() {
    try {
      const seen = lsGet(seenKey);
      return typeof seen === "string" && /^\d+\.\d+\.\d+$/.test(seen) ? seen : null;
    } catch {
      return null;
    }
  }
  function isNewer(version, previous) {
    if (!previous) return true;
    const oldParts = previous.split(".").map(Number);
    const newParts = version.split(".").map(Number);
    for (const [index, part] of newParts.entries()) {
      if (part !== oldParts[index]) return part > oldParts[index];
    }
    return false;
  }
  function releaseSection(release) {
    const section = document.createElement("section");
    const heading = document.createElement("h3");
    heading.textContent = `v${release.version}`;
    const changes = document.createElement("ul");
    for (const change of release.changes) {
      const item = document.createElement("li");
      item.textContent = change;
      changes.appendChild(item);
    }
    section.append(heading, changes);
    return section;
  }
  var Changelog = class extends HHModule {
    pending = null;
    opener = null;
    viewedThisPage = false;
    loadListener = null;
    settingsInstalled = false;
    silent = false;
    notice = null;
    waitingForNoticeAnchor = false;
    constructor() {
      const baseKey = "changelog";
      super({ name: baseKey, configSchema: {
        baseKey,
        label: settingHelp("Update notices", "Show the changelog the first time you load the homepage after an update. Use View changelog to open it whenever you like."),
        default: true,
        subSettings: [{
          key: "silent",
          label: settingHelp("Silent changelog", "Put a New button beside HH++ on the homepage when an update is available. Click it to read the changelog."),
          default: false
        }]
      } });
    }
    shouldRun() {
      return currentPage === "/home.html";
    }
    installSettings() {
      if (!this.shouldRun()) return;
      this.settingsInstalled = true;
      window.HHPlusPlus.Helpers.doWhenSelectorAvailable(settingsCard, () => {
        const card = document.querySelector(settingsCard);
        if (!card || card.querySelector(".jarvis-view-changelog")) return;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "jarvis-setting-action jarvis-view-changelog";
        button.textContent = "View changelog";
        button.addEventListener("click", () => this.open("manual", button));
        card.appendChild(button);
      });
    }
    run({ silent = false }) {
      if (this.hasRun || !this.shouldRun()) return;
      this.hasRun = true;
      this.silent = silent;
      const allowAutomatic = !this.settingsInstalled;
      const check = () => {
        if (!this.hasUnreadUpdate()) return;
        if (this.silent) this.showNotice();
        else if (allowAutomatic) this.open("automatic");
      };
      if (document.readyState === "complete") check();
      else {
        this.loadListener = new AbortController();
        window.addEventListener("load", check, { once: true, signal: this.loadListener.signal });
      }
    }
    tearDown() {
      this.loadListener?.abort();
      this.hasRun = false;
      this.removeNotice();
    }
    updateSubSetting(key, value) {
      if (key !== "silent") return;
      this.silent = value;
      if (value) this.showNotice();
      else this.removeNotice();
    }
    hasUnreadUpdate() {
      return this.hasRun && !this.viewedThisPage && isNewer(latestVersion, readSeenVersion());
    }
    showNotice() {
      if (!this.silent || !this.hasUnreadUpdate() || this.notice || this.waitingForNoticeAnchor) return;
      const selector = ".hh-plus-plus-config-button";
      this.waitingForNoticeAnchor = true;
      window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
        this.waitingForNoticeAnchor = false;
        const anchor = document.querySelector(selector);
        if (!anchor || !this.silent || !this.hasUnreadUpdate()) return;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "jarvis-changelog-notice";
        button.textContent = "New";
        button.title = "Read the Jarvis changelog";
        button.setAttribute("aria-label", "New Jarvis update. Read the changelog.");
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          this.open("manual", button);
        });
        this.notice = anchor.appendChild(button);
      });
    }
    removeNotice() {
      this.notice?.remove();
      this.notice = null;
    }
    disableNotices() {
      const config = window.hhPlusPlusConfig;
      if (!config || !config.config[configKey]) return;
      try {
        config.loadConfig();
        config.config[configKey] = false;
        config.saveConfig();
      } catch (err) {
        config.config[configKey] = true;
        console.warn("Jarvis could not turn off update notices:", err);
        return;
      }
      const card = document.querySelector(settingsCard);
      const checkbox = card?.querySelector(`input[name="${configKey}"]`);
      if (checkbox) checkbox.checked = false;
      card?.classList.remove("enabled");
      const silent = card?.querySelector(`input[name="${configKey}_silent"]`);
      if (silent) silent.disabled = true;
      this.tearDown();
    }
    open(mode, opener = null) {
      if (!this.shouldRun()) return;
      if (mode === "manual") this.opener = opener;
      if (this.pending) {
        if (mode === "manual") this.pending = mode;
        return;
      }
      this.pending = mode;
      const previous = readSeenVersion();
      const content = document.createElement("div");
      content.className = "container-special-bg jarvis-changelog-content";
      const title = document.createElement("h2");
      title.id = "jarvis-changelog-title";
      title.textContent = "Jarvis changelog";
      const notes = document.createElement("div");
      notes.className = "jarvis-changelog-notes";
      const newReleases = previous && isNewer(latestVersion, previous) ? CHANGELOG_default.filter((release) => isNewer(release.version, previous)).length : 1;
      notes.append(...CHANGELOG_default.slice(0, newReleases).map(releaseSection));
      const earlier = CHANGELOG_default.slice(newReleases);
      if (earlier.length) {
        const history = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = "Earlier versions";
        history.append(summary, ...earlier.map(releaseSection));
        notes.appendChild(history);
      }
      const footer = document.createElement("footer");
      const optOut = document.createElement("label");
      optOut.className = "jarvis-changelog-opt-out";
      const dontShowAgain = document.createElement("input");
      dontShowAgain.type = "checkbox";
      optOut.append(dontShowAgain, "Don’t show again");
      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "jarvis-setting-action";
      closeButton.textContent = "Close";
      footer.appendChild(closeButton);
      content.append(title, notes, footer);
      showChangelogPopup({
        content,
        closeButton,
        shouldOpen: () => this.pending === "manual" || !this.silent && this.hasUnreadUpdate(),
        onOpen: () => {
          this.viewedThisPage = true;
          this.removeNotice();
          if (this.hasRun) footer.prepend(optOut);
          try {
            if (isNewer(latestVersion, readSeenVersion())) lsSet(seenKey, latestVersion);
          } catch (err) {
            console.warn("Jarvis could not save the viewed changelog version:", err);
          }
        },
        onClose: () => {
          this.pending = null;
          if (dontShowAgain.checked) this.disableNotices();
          this.opener?.focus({ preventScroll: true });
          this.opener = null;
        }
      });
    }
  };

  // src/index.ts
  armContestStartupGuard();
  function runJarvis() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runJarvis, { once: true });
      return;
    }
    const { $: $2 } = window;
    if (!$2) {
      if (document.readyState !== "complete") {
        window.addEventListener("load", runJarvis, { once: true });
        return;
      }
      document.getElementById("jarvis-contest-startup")?.remove();
      console.log("WARNING: No jQuery found. Ending script.");
      return;
    }
    console.log("Hello, Sir, J.A.R.V.I.S. is ready to help you.");
    initGame($2);
    injectStyles();
    const friendsAndFoes = new FriendAndFoes();
    const changelog = new Changelog();
    const allModules = [
      friendsAndFoes,
      new ContestStart(),
      new LeagueTop20(),
      new RemovePassLock(),
      new LoveRaidsAddon(),
      new LoveRaidsParser(),
      new ActivityParser(),
      changelog
    ];
    setTimeout(() => {
      const runScript = () => {
        const { hhPlusPlusConfig } = window;
        if (!hhPlusPlusConfig) return;
        hhPlusPlusConfig.registerGroup({
          key: "JARVIS",
          name: "HH Jarvis"
        });
        allModules.forEach((module) => {
          hhPlusPlusConfig.registerModule(module);
        });
        hhPlusPlusConfig.loadConfig();
        hhPlusPlusConfig.runModules();
        friendsAndFoes.installSettings();
        installContestSettings();
        changelog.installSettings();
        packSettings();
      };
      if (window.hhPlusPlusConfig) {
        runScript();
      } else {
        $2(document).one("hh++-bdsm:loaded", runScript);
      }
    }, 1);
  }
  runJarvis();
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzSGVscC50cyIsICJzcmMvc2V0dGluZ3MuY3NzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvSEhNb2R1bGUudHMiLCAic3JjL3N0b3JhZ2UudHMiLCAic3JjL21vZHVsZXMvcGxheWVycy9tYXJrTWFuYWdlci50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0ZyaWVuZEFuZEZvZXMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzLnRzIiwgInNyYy9tb2R1bGVzL2NvbnRlc3RzL2NvbnRlc3RTaG9ydGN1dHMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvQ29udGVzdFN0YXJ0LnRzIiwgInNyYy9tb2R1bGVzL3BsYXllcnMvTGVhZ3VlVG9wMjAudHMiLCAic3JjL21vZHVsZXMvcHJvZ3Jlc3Npb24vUmVtb3ZlUGFzc0xvY2sudHMiLCAic3JjL21vZHVsZXMvbG92ZS1yYWlkcy9nYW1lRGF0YS50cyIsICJzcmMvbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc0FkZG9uLnRzIiwgInNyYy9tb2R1bGVzL2xvdmUtcmFpZHMvTG92ZVJhaWRzUGFyc2VyLnRzIiwgInNyYy9tb2R1bGVzL2FjdGl2aXRpZXMvQWN0aXZpdHlQYXJzZXIudHMiLCAiQ0hBTkdFTE9HLm1kIiwgInNyYy9tb2R1bGVzL3VwZGF0ZXMvY2hhbmdlbG9nUG9wdXAudHMiLCAic3JjL21vZHVsZXMvdXBkYXRlcy9DaGFuZ2Vsb2cudHMiLCAic3JjL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgbGV0ICQ6IEpRdWVyeVN0YXRpYztcbmV4cG9ydCBsZXQgY3VycmVudFBhZ2U6IHN0cmluZztcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRHYW1lKGpRdWVyeTogSlF1ZXJ5U3RhdGljKSB7XG4gICAgJCA9IGpRdWVyeTtcbiAgICBjdXJyZW50UGFnZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gc2V0dGluZ0hlbHAobGFiZWw6IHN0cmluZywgZGVzY3JpcHRpb246IHN0cmluZykge1xuICAgIGNvbnN0IGVzY2FwZSA9ICh0ZXh0OiBzdHJpbmcpID0+IHRleHQucmVwbGFjZUFsbCgnJicsICcmYW1wOycpLnJlcGxhY2VBbGwoJ1wiJywgJyZxdW90OycpXG4gICAgICAgIC5yZXBsYWNlQWxsKCc8JywgJyZsdDsnKS5yZXBsYWNlQWxsKCc+JywgJyZndDsnKTtcbiAgICByZXR1cm4gZXNjYXBlKGxhYmVsKSArICcgPHNwYW4gY2xhc3M9XCJpcm9ubWFuLXNldHRpbmctaGVscFwiIHJvbGU9XCJidXR0b25cIiB0YWJpbmRleD1cIjBcIiBhcmlhLWxhYmVsPVwiQWJvdXQgJyArXG4gICAgICAgIGVzY2FwZShsYWJlbCkgKyAnXCIgZGF0YS1zZXR0aW5nLWhlbHA9XCInICsgZXNjYXBlKGRlc2NyaXB0aW9uKSArICdcIj4/PC9zcGFuPic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3VudFNldHRpbmdzSGVscChwYW5lbDogSFRNTEVsZW1lbnQsIHRvb2x0aXBJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgdG9vbHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRvb2x0aXAuaWQgPSB0b29sdGlwSWQ7XG4gICAgdG9vbHRpcC5jbGFzc05hbWUgPSAnaXJvbm1hbi1zZXR0aW5nLXRvb2x0aXAnO1xuICAgIHRvb2x0aXAuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3Rvb2x0aXAnKTtcbiAgICBjb25zdCBwb3BvdmVyID0gdHlwZW9mIHRvb2x0aXAuc2hvd1BvcG92ZXIgPT09ICdmdW5jdGlvbic7XG4gICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuc2V0QXR0cmlidXRlKCdwb3BvdmVyJywgJ21hbnVhbCcpO1xuICAgIGVsc2UgdG9vbHRpcC5oaWRkZW4gPSB0cnVlO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodG9vbHRpcCk7XG5cbiAgICBsZXQgYW5jaG9yOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IGdldEhlbHAgPSAodGFyZ2V0OiBFdmVudFRhcmdldCB8IG51bGwpID0+XG4gICAgICAgIHRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgPyB0YXJnZXQuY2xvc2VzdDxIVE1MRWxlbWVudD4oJ1tkYXRhLXNldHRpbmctaGVscF0nKSA6IG51bGw7XG4gICAgY29uc3QgY2xvc2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICghYW5jaG9yKSByZXR1cm47XG4gICAgICAgIGFuY2hvci5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKTtcbiAgICAgICAgYW5jaG9yID0gbnVsbDtcbiAgICAgICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuaGlkZVBvcG92ZXIoKTtcbiAgICAgICAgZWxzZSB0b29sdGlwLmhpZGRlbiA9IHRydWU7XG4gICAgfTtcbiAgICBjb25zdCBzaG93ID0gKGhlbHA6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgIGlmIChhbmNob3IgPT09IGhlbHApIHJldHVybjtcbiAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgYW5jaG9yID0gaGVscDtcbiAgICAgICAgaGVscC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCB0b29sdGlwSWQpO1xuICAgICAgICB0b29sdGlwLnRleHRDb250ZW50ID0gaGVscC5kYXRhc2V0LnNldHRpbmdIZWxwID8/ICcnO1xuICAgICAgICBpZiAocG9wb3ZlcikgdG9vbHRpcC5zaG93UG9wb3ZlcigpO1xuICAgICAgICBlbHNlIHRvb2x0aXAuaGlkZGVuID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gaGVscC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgeyBvZmZzZXRXaWR0aCwgb2Zmc2V0SGVpZ2h0IH0gPSB0b29sdGlwO1xuICAgICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSBNYXRoLm1heCg4LCBNYXRoLm1pbihib3VuZHMubGVmdCwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIC0gb2Zmc2V0V2lkdGggLSA4KSkgKyAncHgnO1xuICAgICAgICBjb25zdCBiZWxvdyA9IGJvdW5kcy5ib3R0b20gKyA2O1xuICAgICAgICB0b29sdGlwLnN0eWxlLnRvcCA9IChiZWxvdyArIG9mZnNldEhlaWdodCA8PSB3aW5kb3cuaW5uZXJIZWlnaHQgLSA4XG4gICAgICAgICAgICA/IGJlbG93IDogTWF0aC5tYXgoOCwgYm91bmRzLnRvcCAtIG9mZnNldEhlaWdodCAtIDYpKSArICdweCc7XG4gICAgfTtcblxuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJvdmVyJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCAmJiBldmVudC5wb2ludGVyVHlwZSAhPT0gJ3RvdWNoJykgc2hvdyhoZWxwKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyb3V0JywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCA9PT0gYW5jaG9yICYmIGhlbHAgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gaGVscCkgY2xvc2UoKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1c2luJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCkgc2hvdyhoZWxwKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGdldEhlbHAoZXZlbnQudGFyZ2V0KSA9PT0gYW5jaG9yKSBjbG9zZSgpO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoIWhlbHApIHJldHVybjtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgJiYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJyB8fCBldmVudC5rZXkgPT09ICcgJykpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHNob3coaGVscCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYW5jaG9yICYmIGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZ2V0SGVscChldmVudC50YXJnZXQpICE9PSBhbmNob3IpIGNsb3NlKCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgY2xvc2UsIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbn1cbiIsICIuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5wYW5lbC1jb250ZW50cyB7XG4gICAgYWxpZ24tY29udGVudDogc3RhcnQ7XG4gICAgYWxpZ24taXRlbXM6IHN0YXJ0O1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgb3ZlcnNjcm9sbC1iZWhhdmlvcjogY29udGFpbjtcbiAgICBzY3JvbGxiYXItd2lkdGg6IHRoaW47XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbDpoYXMoPiAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdLnNob3duKSB7XG4gICAgb3ZlcmZsb3c6IGNsaXA7XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZy5oYXMtc3Vic2V0dGluZ3Mge1xuICAgIGdyaWQtcm93LWVuZDogYXV0bztcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1wYWNrZWQtc2V0dGluZ3Mge1xuICAgIGdyaWQtYXV0by1mbG93OiByb3cgZGVuc2U7XG4gICAgZ3JpZC1hdXRvLXJvd3M6IDFweDtcbiAgICByb3ctZ2FwOiAwO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuamFydmlzLXBhY2tlZC1zZXR0aW5ncyAuY29uZmlnLXNldHRpbmcge1xuICAgIGdyaWQtcm93LWVuZDogc3BhbiB2YXIoLS1qYXJ2aXMtc2V0dGluZy1yb3dzLCAxKTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC50YWJzIGg0W3JlbD1cIkpBUlZJU1wiXSB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLnRhYnMgaDRbcmVsPVwiSkFSVklTXCJdLnNlbGVjdGVkOjphZnRlciB7XG4gICAgY29udGVudDogdmFyKC0tamFydmlzLXZlcnNpb24pO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBpbnNldC1ibG9jay1zdGFydDogMDtcbiAgICBpbnNldC1pbmxpbmUtZW5kOiAuMTVyZW07XG4gICAgZm9udC1zaXplOiAuNjI1cmVtO1xuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4uaXJvbm1hbi1zZXR0aW5nLWhlbHAge1xuICAgIGRpc3BsYXk6IGlubGluZS1ncmlkO1xuICAgIHBsYWNlLWl0ZW1zOiBjZW50ZXI7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBpbmxpbmUtc2l6ZTogMS4yNWVtO1xuICAgIGJsb2NrLXNpemU6IDEuMjVlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgIGZvbnQtc2l6ZTogLjhlbTtcbiAgICBsaW5lLWhlaWdodDogMTtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogLjA4ZW07XG4gICAgY3Vyc29yOiBoZWxwO1xufVxuLmlyb25tYW4tc2V0dGluZy1oZWxwOmhvdmVyLFxuLmlyb25tYW4tc2V0dGluZy1oZWxwOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbi5pcm9ubWFuLXNldHRpbmctdG9vbHRpcCB7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIGluc2V0OiBhdXRvO1xuICAgIHotaW5kZXg6IDEwMDEwO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgbWF4LXdpZHRoOiBtaW4oMThyZW0sIGNhbGMoMTAwdncgLSAxNnB4KSk7XG4gICAgbWFyZ2luOiAwO1xuICAgIHBhZGRpbmc6IC41ZW0gLjdlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40ZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogMTRweC8xLjQgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuamFydmlzLW1hcmstY29sb3IgaW5wdXQge1xuICAgIHdpZHRoOiAzMHB4O1xuICAgIGhlaWdodDogMjBweDtcbiAgICBmbGV4OiBub25lO1xuICAgIHBhZGRpbmc6IDA7XG59XG5idXR0b24uamFydmlzLWNvbnRlc3QtcGluIHtcbiAgICBhbGw6IHVuc2V0O1xuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICBtYXJnaW4taW5saW5lLXN0YXJ0OiAuMzVlbTtcbiAgICBwYWRkaW5nLWlubGluZTogLjJlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250LXNpemU6IC45ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jb250ZXN0LXBpbjo6YmVmb3JlIHtcbiAgICBjb250ZW50OiAn4piGJztcbn1cbi5qYXJ2aXMtY29udGVzdC1waW5bYXJpYS1wcmVzc2VkPVwidHJ1ZVwiXTo6YmVmb3JlIHtcbiAgICBjb250ZW50OiAn4piFJztcbiAgICBjb2xvcjogI2ZmZDM2Yjtcbn1cbi5qYXJ2aXMtY29udGVzdC1waW46Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgIHdpZHRoOiBmaXQtY29udGVudDtcbiAgICBnYXA6IC4xMmVtO1xuICAgIHBhZGRpbmc6IC4xMmVtO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgNTUlLCB0cmFuc3BhcmVudCk7XG4gICAgYm9yZGVyLXJhZGl1czogLjQ1ZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgbGluZS1oZWlnaHQ6IDEuMTU7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIGJ1dHRvbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBwYWRkaW5nOiAuMThlbSAuMzhlbTtcbiAgICBib3JkZXItcmFkaXVzOiAuMjZlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGxpbmUtaGVpZ2h0OiBpbmhlcml0O1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b25bYXJpYS1wcmVzc2VkPVwidHJ1ZVwiXSB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAyMiUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDE1JSwgdHJhbnNwYXJlbnQpO1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b246Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0IHtcbiAgICBtYXJnaW4taW5saW5lLXN0YXJ0OiAuMjhlbTtcbiAgICBmb250LXNpemU6IC43ZW07XG4gICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5ncyB7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBnYXA6IC4zZW07XG4gICAgbWluLXdpZHRoOiAwO1xuICAgIG1hcmdpbjogLjQ1ZW0gMCAwO1xuICAgIHBhZGRpbmc6IDA7XG4gICAgYm9yZGVyOiAwO1xuICAgIGZvbnQtc2l6ZTogLjg1ZW07XG59XG4uamFydmlzLWNvbnRlc3Qtc2V0dGluZ3MgLmphcnZpcy1jb250ZXN0LWNob2ljZSB7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBtYXgtd2lkdGg6IDEwMCU7XG4gICAgZmxleC13cmFwOiB3cmFwO1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzIFtoaWRkZW5dIHtcbiAgICBkaXNwbGF5OiBub25lO1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzOmRpc2FibGVkIC5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIG9wYWNpdHk6IC41O1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzOmRpc2FibGVkIGJ1dHRvbiB7XG4gICAgY3Vyc29yOiBkZWZhdWx0O1xufVxuLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cyB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGluc2V0LWJsb2NrLXN0YXJ0OiAxLjNyZW07XG4gICAgaW5zZXQtaW5saW5lLWVuZDogM3JlbTtcbiAgICB6LWluZGV4OiAxMDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiAuM2VtO1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTAlKTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMgYnV0dG9uIHtcbiAgICBhbGw6IHVuc2V0O1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBwbGFjZS1jb250ZW50OiBjZW50ZXI7XG4gICAgZ2FwOiAuMTVlbTtcbiAgICBtaW4taW5saW5lLXNpemU6IDIuODVlbTtcbiAgICBwYWRkaW5nOiAuMjhlbSAuNDVlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDQwJSwgdHJhbnNwYXJlbnQpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40ZW07XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAxMCUsIHRyYW5zcGFyZW50KTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGZvbnQtc2l6ZTogLjllbTtcbiAgICBsaW5lLWhlaWdodDogMTtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzIGJ1dHRvbiBzcGFuIHtcbiAgICBmb250LXNpemU6IC43NWVtO1xufVxuLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cyBidXR0b246aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMTglLCB0cmFuc3BhcmVudCk7XG59XG4uamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzIGJ1dHRvblthcmlhLXByZXNzZWQ9XCJ0cnVlXCJdIHtcbiAgICBiYWNrZ3JvdW5kOiBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDI3JSwgdHJhbnNwYXJlbnQpO1xufVxuLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cyBidXR0b246Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMnB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbiAgICBvdXRsaW5lLW9mZnNldDogMnB4O1xufVxuLmphcnZpcy1tYXJrLW1lbnUge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB6LWluZGV4OiAxMDAwMDtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdhcDogMnB4O1xuICAgIHBhZGRpbmc6IDRweDtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjODk5NGE3O1xuICAgIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgICBiYWNrZ3JvdW5kOiAjMjMyOTM2O1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGJveC1zaGFkb3c6IDAgMnB4IDEwcHggIzAwMDg7XG4gICAgZm9udDogMTNweC8xLjM1IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbn1cbi5qYXJ2aXMtbWFyay1tZW51IGJ1dHRvbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBwYWRkaW5nOiA0cHggOXB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLW1hcmstbWVudSBidXR0b246aG92ZXIsXG4uamFydmlzLW1hcmstbWVudSBidXR0b246Zm9jdXMtdmlzaWJsZSB7XG4gICAgYmFja2dyb3VuZDogIzQxNGQ2NDtcbn1cbiNjb250ZXN0cyAubGVmdF9wYXJ0IC5zY3JvbGxfYXJlYS5qYXJ2aXMtY29udGVzdC1pbnN0YW50LFxuI2NvbnRlc3RzIC5yaWdodF9wYXJ0LmphcnZpcy1jb250ZXN0LWluc3RhbnQgLmxlYWRfdGFibGVfdmlldyB7XG4gICAgc2Nyb2xsLWJlaGF2aW9yOiBhdXRvICFpbXBvcnRhbnQ7XG4gICAgb3ZlcmZsb3ctYW5jaG9yOiBub25lICFpbXBvcnRhbnQ7XG59XG4jY29udGVzdHMgLmphcnZpcy1jb250ZXN0LWxvYWRpbmcge1xuICAgIG9wYWNpdHk6IDAgIWltcG9ydGFudDtcbiAgICB0cmFuc2l0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4jY29udGVzdHMgLnJpZ2h0X3BhcnQgLnJhbmtpbmdbaWRfY29udGVzdF0uamFydmlzLWNvbnRlc3Qtb3RoZXIge1xuICAgIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrPVwiZnJpZW5kXCJdIHtcbiAgICBjb2xvcjogdmFyKC0tamFydmlzLWZyaWVuZC1jb2xvcikgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrPVwiZm9lXCJdIHtcbiAgICBjb2xvcjogdmFyKC0tamFydmlzLWZvZS1jb2xvcikgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrXSxcbnRkW2RhdGEtamFydmlzLW1hcmtdID4gYSB7XG4gICAgdGV4dC1zaGFkb3c6IDFweCAwICMxMTE4MjcsIC0xcHggMCAjMTExODI3LCAwIDFweCAjMTExODI3LCAwIC0xcHggIzExMTgyNyAhaW1wb3J0YW50O1xufVxudGRbZGF0YS1qYXJ2aXMtbWFya10gPiBhIHtcbiAgICBjb2xvcjogaW5oZXJpdCAhaW1wb3J0YW50O1xufVxuLmphcnZpcy1zZXR0aW5nLWFjdGlvbiB7XG4gICAgYXBwZWFyYW5jZTogbm9uZTtcbiAgICBwYWRkaW5nOiAuMmVtIC41ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIGJvcmRlci1yYWRpdXM6IC4zNWVtO1xuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIGZvbnQ6IGluaGVyaXQ7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1zZXR0aW5nLWFjdGlvbjpob3Zlcixcbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246Zm9jdXMtdmlzaWJsZSB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAxNiUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246ZGlzYWJsZWQge1xuICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICBvcGFjaXR5OiAuNTtcbn1cbi5qYXJ2aXMtbWFyay1zZXR0aW5nLWFjdGlvbnMsXG4uamFydmlzLW1hcmstYWN0aW9ucyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgZ2FwOiAuNGVtO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXIge1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgd2lkdGg6IG1pbigzNHJlbSwgY2FsYygxMDB2dyAtIDJyZW0pKTtcbiAgICBtYXgtaGVpZ2h0OiBjYWxjKDEwMHZoIC0gMnJlbSk7XG4gICAgcGFkZGluZzogMXJlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC42NXJlbTtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jb25maWctc2V0dGluZy1iYWNrZ3JvdW5kLCAjMjQxZTMwKTtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBmb250OiAxNXB4LzEuMzUgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXI6OmJhY2tkcm9wIHtcbiAgICBiYWNrZ3JvdW5kOiAjMDgwYjEyYWE7XG59XG4uamFydmlzLW1hcmstbWFuYWdlciBoMixcbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIGgzLFxuLmphcnZpcy1tYXJrLW1hbmFnZXIgcCB7XG4gICAgbWFyZ2luOiAwO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIHtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgobWluKDEzcmVtLCAxMDAlKSwgMWZyKSk7XG4gICAgZ2FwOiAuOXJlbTtcbiAgICBtYXgtaGVpZ2h0OiA1MHZoO1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgc2Nyb2xsYmFyLWd1dHRlcjogc3RhYmxlO1xuICAgIHBhZGRpbmctaW5saW5lLWVuZDogLjdyZW07XG4gICAgbWFyZ2luLWJsb2NrOiAuOXJlbTtcbn1cbi5qYXJ2aXMtbWFyay1saXN0cyB1bCB7XG4gICAgbWFyZ2luOiAuM2VtIDAgMDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XG59XG4uamFydmlzLW1hcmstbGlzdHMgbGkge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgZ2FwOiAuNDVlbTtcbiAgICBwYWRkaW5nOiAuMmVtIDA7XG4gICAgb3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XG59XG4uamFydmlzLW1hcmstbGlzdHMgbGkgYnV0dG9uIHtcbiAgICBmbGV4OiBub25lO1xufVxuLmphcnZpcy1tYXJrLWFjdGlvbnMge1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2Vlbjtcbn1cbi5qYXJ2aXMtdmlldy1jaGFuZ2Vsb2cge1xuICAgIG1hcmdpbi10b3A6IC40NWVtO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctYnV0dG9uID4gLmphcnZpcy1jaGFuZ2Vsb2ctbm90aWNlIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgaW5zZXQtaW5saW5lLWVuZDogY2FsYygxMDAlICsgLjM1ZW0pO1xuICAgIHRvcDogNTAlO1xuICAgIHRyYW5zbGF0ZTogMCAtNTAlO1xuICAgIGhlaWdodDogNjQlO1xuICAgIHBhZGRpbmc6IDAgLjQ1ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNDVlbTtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jb25maWctc2V0dGluZy1iYWNrZ3JvdW5kLCAjMjQxZTMwKTtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBmb250OiA2MDAgLjc1cmVtLzEgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGljZTpob3ZlciB7XG4gICAgZmlsdGVyOiBicmlnaHRuZXNzKDEuMik7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RpY2U6Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMnB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbiAgICBvdXRsaW5lLW9mZnNldDogMnB4O1xufVxuZGlhbG9nLmphcnZpcy1jaGFuZ2Vsb2ctcG9wdXAge1xuICAgIC0tamFydmlzLWNoYW5nZWxvZy1oZWlnaHQ6IG1pbigzMnJlbSwgY2FsYygxMDB2aCAtIDEuMjVyZW0pKTtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICBpbnNldDogMDtcbiAgICB3aWR0aDogbWluKDM3cmVtLCBjYWxjKDEwMCUgLSAxLjI1cmVtKSk7XG4gICAgaGVpZ2h0OiBmaXQtY29udGVudDtcbiAgICBtYXgtaGVpZ2h0OiB2YXIoLS1qYXJ2aXMtY2hhbmdlbG9nLWhlaWdodCk7XG4gICAgbWFyZ2luOiBhdXRvO1xuICAgIHBhZGRpbmc6IDA7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC42cmVtO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWNvbmZpZy1zZXR0aW5nLWJhY2tncm91bmQsICMyNDFlMzApO1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGZvbnQ6IDE1cHgvMS40NSBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7XG4gICAgdGV4dC1hbGlnbjogc3RhcnQ7XG59XG5Ac3VwcG9ydHMgKGhlaWdodDogMTAwZHZoKSB7XG4gICAgZGlhbG9nLmphcnZpcy1jaGFuZ2Vsb2ctcG9wdXAge1xuICAgICAgICAtLWphcnZpcy1jaGFuZ2Vsb2ctaGVpZ2h0OiBtaW4oMzJyZW0sIGNhbGMoMTAwZHZoIC0gMS4yNXJlbSkpO1xuICAgIH1cbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLXBvcHVwOjpiYWNrZHJvcCB7XG4gICAgYmFja2dyb3VuZDogIzA4MGIxMmFhO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCB7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtcm93czogYXV0byBtaW5tYXgoMCwgMWZyKSBhdXRvO1xuICAgIGdhcDogY2xhbXAoLjQ1cmVtLCAydncsIC45cmVtKTtcbiAgICBtYXgtaGVpZ2h0OiBjYWxjKHZhcigtLWphcnZpcy1jaGFuZ2Vsb2ctaGVpZ2h0KSAtIDJweCk7XG4gICAgcGFkZGluZzogY2xhbXAoLjZyZW0sIDN2dywgMXJlbSk7XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGgyLFxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBoMyB7XG4gICAgbWFyZ2luOiAwO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBoMiB7XG4gICAgZm9udC1zaXplOiAxLjNlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgaDMge1xuICAgIGNvbG9yOiB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNkOWM3ZmIpO1xuICAgIGZvbnQtc2l6ZTogMWVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBzZWN0aW9uICsgc2VjdGlvbixcbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgZGV0YWlscyB7XG4gICAgbWFyZ2luLXRvcDogLjc1cmVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90ZXMge1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgb3ZlcnNjcm9sbC1iZWhhdmlvcjogY29udGFpbjtcbiAgICBzY3JvbGxiYXItd2lkdGg6IHRoaW47XG4gICAgb3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RlcyB1bCB7XG4gICAgbWFyZ2luOiAuMmVtIDAgMDtcbiAgICBwYWRkaW5nLWlubGluZS1zdGFydDogMS4yZW07XG4gICAgbGlzdC1zdHlsZTogZGlzYztcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGVzIGxpICsgbGkge1xuICAgIG1hcmdpbi10b3A6IC4yNWVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90ZXMgc3VtbWFyeSB7XG4gICAgbWFyZ2luLWJvdHRvbTogLjRyZW07XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBmb290ZXIge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC13cmFwOiB3cmFwO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBlbmQ7XG4gICAgZ2FwOiAuNWVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctb3B0LW91dCB7XG4gICAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBnYXA6IC40ZW07XG4gICAgbWFyZ2luLWlubGluZS1lbmQ6IGF1dG87XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuIiwgImltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IG1vdW50U2V0dGluZ3NIZWxwIH0gZnJvbSAnLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IGNzcyBmcm9tICcuL3NldHRpbmdzLmNzcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RTdHlsZXMoKSB7XG4gICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHN0eWxlLmNsYXNzTmFtZSA9ICdoaC1qYXJ2aXMtc3R5bGUnO1xuICAgIHN0eWxlLnRleHRDb250ZW50ID0gYCR7Y3NzfVxuICAgICAgICAuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCB7IC0tamFydmlzLXZlcnNpb246IFwidiR7VVNFUlNDUklQVF9WRVJTSU9OfVwiOyB9XG4gICAgYDtcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tTZXR0aW5ncygpIHtcbiAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAucGFuZWwtY29udGVudHMnO1xuICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihzZWxlY3Rvcik7XG4gICAgICAgIGlmICghcGFuZWwpIHJldHVybjtcbiAgICAgICAgcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnaGgtc2Nyb2xsJyk7XG4gICAgICAgIG1vdW50U2V0dGluZ3NIZWxwKHBhbmVsLCAnamFydmlzLXNldHRpbmctdG9vbHRpcCcpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuY3RybEtleSB8fCAhKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHx8ICFwYW5lbC5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaXQgPSBldmVudC5kZWx0YU1vZGUgPT09IDEgPyAxNiA6IGV2ZW50LmRlbHRhTW9kZSA9PT0gMiA/IHBhbmVsLmNsaWVudEhlaWdodCA6IDE7XG4gICAgICAgICAgICBjb25zdCBzY2FsZSA9IHBhbmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCAvIHBhbmVsLm9mZnNldEhlaWdodCB8fCAxO1xuICAgICAgICAgICAgcGFuZWwuc2Nyb2xsVG9wICs9IGV2ZW50LmRlbHRhWSAqIHVuaXQgLyBzY2FsZTtcbiAgICAgICAgfSwgeyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiBmYWxzZSB9KTtcblxuICAgICAgICBjb25zdCBjYXJkcyA9IHBhbmVsLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcuY29uZmlnLXNldHRpbmcnKTtcbiAgICAgICAgY29uc3QgcGFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghcGFuZWwub2Zmc2V0V2lkdGgpIHJldHVybjtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBjYXJkIG9mIGNhcmRzKSB7XG4gICAgICAgICAgICAgICAgY2FyZC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1qYXJ2aXMtc2V0dGluZy1yb3dzJywgU3RyaW5nKGNhcmQub2Zmc2V0SGVpZ2h0ICsgMTApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhbmVsLmNsYXNzTGlzdC5hZGQoJ2phcnZpcy1wYWNrZWQtc2V0dGluZ3MnKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZ3JvdXBPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKHBhY2spO1xuICAgICAgICBpZiAocGFuZWwucGFyZW50RWxlbWVudCkgZ3JvdXBPYnNlcnZlci5vYnNlcnZlKHBhbmVsLnBhcmVudEVsZW1lbnQsIHsgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10gfSk7XG4gICAgICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBjb25zdCBzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIocGFjayk7XG4gICAgICAgICAgICBjYXJkcy5mb3JFYWNoKGNhcmQgPT4gc2l6ZU9ic2VydmVyLm9ic2VydmUoY2FyZCkpO1xuICAgICAgICB9XG4gICAgICAgIHBhY2soKTtcbiAgICB9KTtcbn1cbiIsICJleHBvcnQgdHlwZSBNb2R1bGVTZXR0aW5ncyA9IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+O1xuXG5pbnRlcmZhY2UgQ29uZmlnU2NoZW1hIHtcbiAgICBiYXNlS2V5OiBzdHJpbmc7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBkZWZhdWx0OiBib29sZWFuO1xuICAgIHN1YlNldHRpbmdzPzogeyBrZXk6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgZGVmYXVsdDogYm9vbGVhbiB9W107XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBISE1vZHVsZSB7XG4gICAgcmVhZG9ubHkgZ3JvdXAgPSAnSkFSVklTJztcbiAgICByZWFkb25seSBjb25maWdTY2hlbWE6IENvbmZpZ1NjaGVtYTtcbiAgICBoYXNSdW4gPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKHsgY29uZmlnU2NoZW1hIH06IHsgbmFtZTogc3RyaW5nOyBjb25maWdTY2hlbWE6IENvbmZpZ1NjaGVtYSB9KSB7XG4gICAgICAgIHRoaXMuY29uZmlnU2NoZW1hID0gY29uZmlnU2NoZW1hO1xuICAgIH1cblxuICAgIGFic3RyYWN0IHNob3VsZFJ1bigpOiBib29sZWFuO1xuICAgIGFic3RyYWN0IHJ1bihzZXR0aW5nczogTW9kdWxlU2V0dGluZ3MpOiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbn1cbiIsICJleHBvcnQgY29uc3QgTFNfQ09ORklHX05BTUUgPSAnSEhTdGFyayc7XG5cbmV4cG9ydCBmdW5jdGlvbiBsc0dldChrZXk6IHN0cmluZywgbHNfbmFtZSA9IExTX0NPTkZJR19OQU1FKTogdW5rbm93biB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gKSA/PyAnbnVsbCcpXG59XG5leHBvcnQgZnVuY3Rpb24gbHNTZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLnNldEl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gLCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpXG59XG5leHBvcnQgZnVuY3Rpb24gbHNSbShrZXk6IHN0cmluZywgbHNfbmFtZSA9IExTX0NPTkZJR19OQU1FKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGAke2xzX25hbWV9JHtrZXl9YClcbn1cbiIsICJpbXBvcnQgeyBMU19DT05GSUdfTkFNRSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuXG5leHBvcnQgdHlwZSBNYXJrID0gJ2ZyaWVuZCcgfCAnZm9lJztcblxuZXhwb3J0IGludGVyZmFjZSBTYXZlZE1hcmsge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgbmFtZT86IHN0cmluZztcbiAgICBtYXJrOiBNYXJrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3Blbk1hcmtNYW5hZ2VyKHJlYWQ6ICgpID0+IFNhdmVkTWFya1tdLCByZW1vdmU6IChpZDogc3RyaW5nKSA9PiBib29sZWFuLCBjbGVhcjogKCkgPT4gYm9vbGVhbikge1xuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuamFydmlzLW1hcmstbWFuYWdlcicpKSByZXR1cm47XG5cbiAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaWFsb2cnKTtcbiAgICBkaWFsb2cuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLW1hbmFnZXInO1xuICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsICdqYXJ2aXMtbWFyay1tYW5hZ2VyLXRpdGxlJyk7XG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgIHRpdGxlLmlkID0gJ2phcnZpcy1tYXJrLW1hbmFnZXItdGl0bGUnO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gJ0ZyaWVuZHMgYW5kIGZvZXMnO1xuXG4gICAgY29uc3QgbGlzdHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBsaXN0cy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstbGlzdHMnO1xuICAgIGNvbnN0IGFjdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1hY3Rpb25zJztcbiAgICBjb25zdCBjbGVhckFsbCA9IG1ha2VCdXR0b24oJ0NsZWFyIGFsbCBtYXJrcycsICgpID0+IHtcbiAgICAgICAgaWYgKGNvbmZpcm0oJ1JlbW92ZSBhbGwgZnJpZW5kIGFuZCBmb2UgbWFya3MgZm9yIHRoaXMgZ2FtZT8nKSAmJiBjbGVhcigpKSB7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIGNsb3NlLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBjbG9zZSA9IG1ha2VCdXR0b24oJ0Nsb3NlJywgKCkgPT4gZGlhbG9nLmNsb3NlKCkpO1xuICAgIGFjdGlvbnMuYXBwZW5kKGNsZWFyQWxsLCBjbG9zZSk7XG5cbiAgICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSByZWFkKCkuc29ydCgoYSwgYikgPT4gTnVtYmVyKCFhLm5hbWUpIC0gTnVtYmVyKCFiLm5hbWUpIHx8XG4gICAgICAgICAgICAoYS5uYW1lIHx8IGEuaWQpLmxvY2FsZUNvbXBhcmUoYi5uYW1lIHx8IGIuaWQsIHVuZGVmaW5lZCwgeyBudW1lcmljOiB0cnVlIH0pKTtcbiAgICAgICAgY29uc3Qgc2VjdGlvbnMgPSAoWydmcmllbmQnLCAnZm9lJ10gYXMgY29uc3QpLm1hcChtYXJrID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgICAgICAgICBjb25zdCBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBlbnRyaWVzLmZpbHRlcihlbnRyeSA9PiBlbnRyeS5tYXJrID09PSBtYXJrKTtcbiAgICAgICAgICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSAobWFyayA9PT0gJ2ZyaWVuZCcgPyAnRnJpZW5kcycgOiAnRm9lcycpICsgYCAoJHttYXRjaGVzLmxlbmd0aH0pYDtcbiAgICAgICAgICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoaGVhZGluZyk7XG5cbiAgICAgICAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVtcHR5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICAgICAgICAgIGVtcHR5LnRleHRDb250ZW50ID0gJ05vIHNhdmVkIHBsYXllcnMuJztcbiAgICAgICAgICAgICAgICBzZWN0aW9uLmFwcGVuZENoaWxkKGVtcHR5KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VjdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgaWQsIG5hbWUgfSBvZiBtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICAgICAgcGxheWVyLnRleHRDb250ZW50ID0gbmFtZSA/IGAke25hbWV9IMK3ICR7aWR9YCA6IGBQbGF5ZXIgIyR7aWR9YDtcbiAgICAgICAgICAgICAgICBpZiAoIW5hbWUpIHBsYXllci50aXRsZSA9ICdOYW1lIG5vdCByZWNvcmRlZCB5ZXQnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IG1ha2VCdXR0b24oJ1JlbW92ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBBcnJheS5mcm9tKGxpc3RzLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpKS5pbmRleE9mKGJ1dHRvbik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmUoaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbWFpbmluZyA9IGxpc3RzLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgKHJlbWFpbmluZ1tNYXRoLm1pbihpbmRleCwgcmVtYWluaW5nLmxlbmd0aCAtIDEpXSB8fCBjbG9zZSkuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBgUmVtb3ZlICR7bmFtZSB8fCBgcGxheWVyICR7aWR9YH0gZnJvbSAke21hcmsgPT09ICdmcmllbmQnID8gJ2ZyaWVuZHMnIDogJ2ZvZXMnfWApO1xuICAgICAgICAgICAgICAgIHJvdy5hcHBlbmQocGxheWVyLCBidXR0b24pO1xuICAgICAgICAgICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQocm93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQobGlzdCk7XG4gICAgICAgICAgICByZXR1cm4gc2VjdGlvbjtcbiAgICAgICAgfSk7XG4gICAgICAgIGxpc3RzLnJlcGxhY2VDaGlsZHJlbiguLi5zZWN0aW9ucyk7XG4gICAgICAgIGNsZWFyQWxsLmRpc2FibGVkID0gZW50cmllcy5sZW5ndGggPT09IDA7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk7XG4gICAgZGlhbG9nLmFwcGVuZCh0aXRsZSwgbGlzdHMsIGFjdGlvbnMpO1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCFldmVudC5rZXkgfHwgWydQbGF5ZXJNYXJrcycsICdQbGF5ZXJNYXJrTmFtZXMnLCAnRnJpZW5kTGlzdCcsICdGb2VMaXN0J11cbiAgICAgICAgICAgIC5zb21lKGtleSA9PiBldmVudC5rZXkgPT09IExTX0NPTkZJR19OQU1FICsga2V5KSkgcmVuZGVyKCk7XG4gICAgfSwgeyBzaWduYWw6IGxpc3RlbmVycy5zaWduYWwgfSk7XG4gICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICBsaXN0ZW5lcnMuYWJvcnQoKTtcbiAgICAgICAgZGlhbG9nLnJlbW92ZSgpO1xuICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgIGNsb3NlLmZvY3VzKCk7XG59XG5cbmZ1bmN0aW9uIG1ha2VCdXR0b24obGFiZWw6IHN0cmluZywgb25DbGljazogKCkgPT4gdm9pZCkge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IGxhYmVsO1xuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spO1xuICAgIHJldHVybiBidXR0b247XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB0eXBlIHsgQ29udGVzdERhdGEgfSBmcm9tICcuLi8uLi9nYW1lLXR5cGVzJztcbmltcG9ydCB7IExTX0NPTkZJR19OQU1FLCBsc0dldCwgbHNTZXQgfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcbmltcG9ydCB7IG9wZW5NYXJrTWFuYWdlciwgdHlwZSBNYXJrLCB0eXBlIFNhdmVkTWFyayB9IGZyb20gJy4vbWFya01hbmFnZXInO1xuXG5jb25zdCBERUZBVUxUX0NPTE9SUzogUmVjb3JkPE1hcmssIHN0cmluZz4gPSB7IGZyaWVuZDogJyM0OGE5ZmYnLCBmb2U6ICcjZmY2MTczJyB9O1xudHlwZSBTYXZlZE5hbWUgPSBzdHJpbmcgfCB7IG5hbWU6IHN0cmluZyB9O1xuXG5mdW5jdGlvbiByZWFkUm93TmFtZShlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnN0IHRleHQgPSBlbGVtZW50LnRleHRDb250ZW50Py50cmltKCkgPz8gJyc7XG4gICAgaWYgKCF0ZXh0LmVuZHNXaXRoKCcrJykpIHJldHVybiB0ZXh0O1xuICAgIGNvbnN0IHdpdGhvdXRTdGFuZGFsb25lUGx1cyA9IHRleHQucmVwbGFjZSgvXFxzK1xcKyQvLCAnJyk7XG4gICAgaWYgKCFlbGVtZW50LmNoaWxkRWxlbWVudENvdW50KSByZXR1cm4gd2l0aG91dFN0YW5kYWxvbmVQbHVzO1xuXG4gICAgY29uc3QgbGFiZWwgPSBlbGVtZW50LmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MRWxlbWVudDtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGxhYmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJyonKSkge1xuICAgICAgICBpZiAoY2hpbGQudGV4dENvbnRlbnQ/LnRyaW0oKSA9PT0gJysnKSBjaGlsZC5yZW1vdmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGxhYmVsLnRleHRDb250ZW50Py50cmltKCkucmVwbGFjZSgvXFxzK1xcKyQvLCAnJykgfHwgd2l0aG91dFN0YW5kYWxvbmVQbHVzO1xufVxuXG5mdW5jdGlvbiBkaXNwbGF5U2F2ZWROYW1lKHNhdmVkPzogU2F2ZWROYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBzYXZlZCAhPT0gJ3N0cmluZycpIHJldHVybiBzYXZlZD8ubmFtZTtcbiAgICAvLyBPbGQgZW50cmllcyBzdG9yZWQgdGhlIGZ1bGwgcm93IHRleHQsIGluY2x1ZGluZyBhIHRyYWlsaW5nIGFkZCBjb250cm9sLlxuICAgIHJldHVybiBzYXZlZC50cmltKCkucmVwbGFjZSgvKFteK10pXFwrJC8sICckMScpLnRyaW1FbmQoKTtcbn1cblxuZXhwb3J0IGNsYXNzIEZyaWVuZEFuZEZvZXMgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBuYW1lcyA9IG5ldyBNYXA8SFRNTEVsZW1lbnQsIHN0cmluZz4oKTtcbiAgICBwcml2YXRlIG1hcmtNZW51OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcm9vdDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJvb3RTZWxlY3RvciA9ICcnO1xuICAgIHByaXZhdGUgaW5MZWFndWUgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2ZyaWVuZEFuZEZvZXMnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiRnJpZW5kcyBhbmQgZm9lc1wiLCBcIlJpZ2h0LWNsaWNrIGVhY2ggcGxheWVyJ3MgbmFtZSB0byBhZGQgb3IgcmVtb3ZlIGEgbWFyay4gTWFuYWdlIHNhdmVkIG1hcmtzIGJlbG93LlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ2xlYWd1ZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiSW4gbGVhZ3Vlc1wiLCBcIlNob3cgbWFya3MgYW5kIGFsbG93IG1hcmtpbmcgaW4gbGVhZ3VlIHRhYmxlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2NvbnRlc3RzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJJbiBjb250ZXN0c1wiLCBcIlNob3cgbWFya3MgYW5kIGFsbG93IG1hcmtpbmcgb24gY29udGVzdCBsZWFkZXJib2FyZHMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoeyBuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWEgfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gWycvbGVhZ3Vlcy5odG1sJywgJy9hY3Rpdml0aWVzLmh0bWwnXS5pbmNsdWRlcyhjdXJyZW50UGFnZSk7XG4gICAgfVxuXG4gICAgcmVhZFNldHRpbmcoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBsc0dldChrZXkpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVhZE1hcmtzKCk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICAgICAgY29uc3Qgc3RvcmVkID0gdGhpcy5yZWFkU2V0dGluZygnUGxheWVyTWFya3MnKTtcbiAgICAgICAgaWYgKHN0b3JlZCAmJiB0eXBlb2Ygc3RvcmVkID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShzdG9yZWQpKSByZXR1cm4gc3RvcmVkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gICAgICAgIGNvbnN0IG1hcmtzOiBSZWNvcmQ8c3RyaW5nLCBNYXJrPiA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIG1hcmtdIG9mIFtbJ0ZyaWVuZExpc3QnLCAnZnJpZW5kJ10sIFsnRm9lTGlzdCcsICdmb2UnXV0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSB0aGlzLnJlYWRTZXR0aW5nKGtleSk7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdCkpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGxpc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoL15bMS05XVxcZCokLy50ZXN0KFN0cmluZyhpZCkpKSBtYXJrc1tTdHJpbmcoaWQpXSA9IG1hcms7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcmtzO1xuICAgIH1cblxuICAgIHJlYWRDb2xvcnMoKTogUmVjb3JkPE1hcmssIHN0cmluZz4ge1xuICAgICAgICBjb25zdCBzYXZlZCA9IHRoaXMucmVhZFNldHRpbmcoJ1BsYXllck1hcmtDb2xvcnMnKSBhcyBQYXJ0aWFsPFJlY29yZDxNYXJrLCB1bmtub3duPj4gfCBudWxsO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZnJpZW5kOiB0eXBlb2Ygc2F2ZWQ/LmZyaWVuZCA9PT0gJ3N0cmluZycgJiYgL14jW1xcZGEtZl17Nn0kL2kudGVzdChzYXZlZC5mcmllbmQpID8gc2F2ZWQuZnJpZW5kIDogREVGQVVMVF9DT0xPUlMuZnJpZW5kLFxuICAgICAgICAgICAgZm9lOiB0eXBlb2Ygc2F2ZWQ/LmZvZSA9PT0gJ3N0cmluZycgJiYgL14jW1xcZGEtZl17Nn0kL2kudGVzdChzYXZlZC5mb2UpID8gc2F2ZWQuZm9lIDogREVGQVVMVF9DT0xPUlMuZm9lXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmVhZFNhdmVkTmFtZXMoKTogUmVjb3JkPHN0cmluZywgU2F2ZWROYW1lPiB7XG4gICAgICAgIGNvbnN0IHNhdmVkID0gdGhpcy5yZWFkU2V0dGluZygnUGxheWVyTWFya05hbWVzJyk7XG4gICAgICAgIGlmICghc2F2ZWQgfHwgdHlwZW9mIHNhdmVkICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHNhdmVkKSkgcmV0dXJuIHt9O1xuICAgICAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKHNhdmVkKS5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgW3N0cmluZywgU2F2ZWROYW1lXSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbLCB2YWx1ZV0gPSBlbnRyeTtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IEJvb2xlYW4odmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUubmFtZSA9PT0gJ3N0cmluZycpO1xuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgc2F2ZU5hbWVzKG5hbWVzOiBSZWNvcmQ8c3RyaW5nLCBTYXZlZE5hbWU+KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsc1NldCgnUGxheWVyTWFya05hbWVzJywgbmFtZXMpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCByZW1lbWJlciBtYXJrZWQgcGxheWVyIG5hbWVzOicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVNYXJrKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgbWFya3MgPSB0aGlzLnJlYWRNYXJrcygpO1xuICAgICAgICBkZWxldGUgbWFya3NbaWRdO1xuICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtzJywgbWFya3MpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gdGhpcy5yZWFkU2F2ZWROYW1lcygpO1xuICAgICAgICBpZiAoaWQgaW4gbmFtZXMpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBuYW1lc1tpZF07XG4gICAgICAgICAgICB0aGlzLnNhdmVOYW1lcyhuYW1lcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmVhZFNhdmVkTWFya3MoKSB7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gdGhpcy5yZWFkU2F2ZWROYW1lcygpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmVudHJpZXModGhpcy5yZWFkTWFya3MoKSkuZmxhdE1hcDxTYXZlZE1hcms+KChbaWQsIG1hcmtdKSA9PlxuICAgICAgICAgICAgL15bMS05XVxcZCokLy50ZXN0KGlkKSAmJiAobWFyayA9PT0gJ2ZyaWVuZCcgfHwgbWFyayA9PT0gJ2ZvZScpXG4gICAgICAgICAgICAgICAgPyBbeyBpZCwgbmFtZTogZGlzcGxheVNhdmVkTmFtZShuYW1lc1tpZF0pLCBtYXJrIH1dXG4gICAgICAgICAgICAgICAgOiBbXSk7XG4gICAgfVxuXG4gICAgc2F2ZVNldHRpbmcoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsc1NldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIGFsZXJ0KCdKYXJ2aXMgY291bGQgbm90IHNhdmUgeW91ciBGcmllbmRzIGFuZCBGb2VzIHNldHRpbmdzLicpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5zdGFsbFNldHRpbmdzKCkge1xuICAgICAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gJy5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmNvbmZpZy1zZXR0aW5nW3JlbD1cIkpBUlZJU19mcmllbmRBbmRGb2VzXCJdIC5zdWItc2V0dGluZ3MnO1xuICAgICAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZXR0aW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5ncyB8fCBzZXR0aW5ncy5xdWVyeVNlbGVjdG9yKCcuamFydmlzLW1hcmstY29sb3InKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBpbnB1dHMgPSBuZXcgTWFwPE1hcmssIEhUTUxJbnB1dEVsZW1lbnQ+KCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCB0ZXh0XSBvZiBbWydmcmllbmQnLCAnRnJpZW5kIG5hbWUgY29sb3InXSwgWydmb2UnLCAnRm9lIG5hbWUgY29sb3InXV0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLWNvbG9yJztcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICB0aXRsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICAgICAgICAgIGlucHV0LnR5cGUgPSAnY29sb3InO1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdGhpcy5yZWFkQ29sb3JzKClbbWFya107XG4gICAgICAgICAgICAgICAgaW5wdXRzLnNldChtYXJrLCBpbnB1dCk7XG4gICAgICAgICAgICAgICAgaW5wdXQuZGlzYWJsZWQgPSAhc2V0dGluZ3MuY2xvc2VzdCgnLmNvbmZpZy1zZXR0aW5nJyk/LmNsYXNzTGlzdC5jb250YWlucygnZW5hYmxlZCcpO1xuICAgICAgICAgICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sb3JzID0gdGhpcy5yZWFkQ29sb3JzKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya0NvbG9ycycsIHsgLi4uY29sb3JzLCBbbWFya106IGlucHV0LnZhbHVlIH0pKSBpbnB1dC52YWx1ZSA9IGNvbG9yc1ttYXJrXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBsYWJlbC5hcHBlbmQodGl0bGUsIGlucHV0KTtcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5hcHBlbmRDaGlsZChsYWJlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXNldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgcmVzZXQudHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgcmVzZXQuY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgICAgICAgICByZXNldC50ZXh0Q29udGVudCA9ICdSZXNldCBjb2xvcnMnO1xuICAgICAgICAgICAgcmVzZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrQ29sb3JzJywge30pKSByZXR1cm47XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBbbWFyaywgaW5wdXRdIG9mIGlucHV0cykgaW5wdXQudmFsdWUgPSBERUZBVUxUX0NPTE9SU1ttYXJrXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgbWFuYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBtYW5hZ2UudHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgbWFuYWdlLmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgICAgICAgICAgbWFuYWdlLnRleHRDb250ZW50ID0gJ01hbmFnZSBtYXJrcyc7XG4gICAgICAgICAgICBtYW5hZ2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBvcGVuTWFya01hbmFnZXIoXG4gICAgICAgICAgICAgICAgKCkgPT4gdGhpcy5yZWFkU2F2ZWRNYXJrcygpLFxuICAgICAgICAgICAgICAgIGlkID0+IHRoaXMucmVtb3ZlTWFyayhpZCksXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtzJywge30pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZU5hbWVzKHt9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1zZXR0aW5nLWFjdGlvbnMnO1xuICAgICAgICAgICAgYWN0aW9ucy5hcHBlbmQocmVzZXQsIG1hbmFnZSk7XG4gICAgICAgICAgICBzZXR0aW5ncy5hcHBlbmRDaGlsZChhY3Rpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2xvc2VNYXJrTWVudSgpIHtcbiAgICAgICAgdGhpcy5tYXJrTWVudT8ucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMubWFya01lbnUgPSBudWxsO1xuICAgIH1cblxuICAgIG9wZW5NYXJrTWVudShldmVudDogTW91c2VFdmVudCwgbmFtZTogSFRNTEVsZW1lbnQsIGlkOiBzdHJpbmcpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuXG4gICAgICAgIGNvbnN0IG1lbnUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbWVudS5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstbWVudSc7XG4gICAgICAgIG1lbnUuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2dyb3VwJyk7XG4gICAgICAgIG1lbnUuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ01hcmsgcGxheWVyJyk7XG4gICAgICAgIGNvbnN0IGFkZEFjdGlvbiA9ICh0ZXh0OiBzdHJpbmcsIGFjdDogKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZS5pc0Nvbm5lY3RlZCAmJiB0aGlzLm5hbWVzLmdldChuYW1lKSA9PT0gaWQpIGFjdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtZW51LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAoY29uc3QgW21hcmssIHRleHRdIG9mIFtbJ2ZyaWVuZCcsICdNYXJrIGFzIGZyaWVuZCddLCBbJ2ZvZScsICdNYXJrIGFzIGZvZSddXSBhcyBjb25zdCkge1xuICAgICAgICAgICAgYWRkQWN0aW9uKHRleHQsICgpID0+IHRoaXMuYXBwbHlNYXJrKGlkLCBtYXJrKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrKSBhZGRBY3Rpb24oJ1JlbW92ZSB0aGlzIHBsYXllcuKAmXMgbWFyaycsICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlbW92ZU1hcmsoaWQpKSB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGljayA9PiBjbGljay5zdG9wUHJvcGFnYXRpb24oKSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWVudSk7XG4gICAgICAgIHRoaXMubWFya01lbnUgPSBtZW51O1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IG5hbWUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHggPSBldmVudC5jbGllbnRYIHx8IGJvdW5kcy5sZWZ0O1xuICAgICAgICBjb25zdCB5ID0gZXZlbnQuY2xpZW50WSB8fCBib3VuZHMuYm90dG9tO1xuICAgICAgICBtZW51LnN0eWxlLmxlZnQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih4LCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggLSBtZW51Lm9mZnNldFdpZHRoKSkgKyAncHgnO1xuICAgICAgICBtZW51LnN0eWxlLnRvcCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHksIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgLSBtZW51Lm9mZnNldEhlaWdodCkpICsgJ3B4JztcbiAgICAgICAgbWVudS5xdWVyeVNlbGVjdG9yKCdidXR0b24nKT8uZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIGdldENvbnRlc3ROYW1lcyhyb290OiBIVE1MRWxlbWVudCwgY29udGVzdHM6IENvbnRlc3REYXRhW10pIHtcbiAgICAgICAgY29uc3QgbmFtZXMgPSBuZXcgTWFwPEhUTUxFbGVtZW50LCBzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IGJ5Q29udGVzdCA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj4+KCk7XG5cbiAgICAgICAgZm9yIChjb25zdCByb3cgb2Ygcm9vdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxUYWJsZVJvd0VsZW1lbnQ+KCcubGVhZFRhYmxlIHRyJykpIHtcbiAgICAgICAgICAgIGNvbnN0IGNlbGwgPSByb3cuY2VsbHM/LlsxXTtcbiAgICAgICAgICAgIGlmICghY2VsbCB8fCBjZWxsLmxvY2FsTmFtZSAhPT0gJ3RkJykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gY2VsbC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLm5pY2tuYW1lJykgfHwgY2VsbDtcbiAgICAgICAgICAgIGxldCBpZCA9IHJvdy5nZXRBdHRyaWJ1dGUoJ3NvcnRpbmdfaWQnKSB8fCBuYW1lLmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJykgfHxcbiAgICAgICAgICAgICAgICBuYW1lLnF1ZXJ5U2VsZWN0b3IoJ1tpZC1tZW1iZXJdJyk/LmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJyk7XG4gICAgICAgICAgICBjb25zdCBjb250ZXN0SWQgPSByb3cuY2xvc2VzdCgnW2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKGNvbnRlc3RJZCkge1xuICAgICAgICAgICAgICAgIGxldCBieU5hbWUgPSBieUNvbnRlc3QuZ2V0KGNvbnRlc3RJZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFieU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydGljaXBhbnRzID0gY29udGVzdHMuZmluZChjb250ZXN0ID0+IFN0cmluZyhjb250ZXN0LmlkX2NvbnRlc3QpID09PSBjb250ZXN0SWQpPy5wYXJ0aWNpcGFudHM7XG4gICAgICAgICAgICAgICAgICAgIGJ5TmFtZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IG5pY2tuYW1lLCBpZF9tZW1iZXIgfSBvZiBPYmplY3QudmFsdWVzKHBhcnRpY2lwYW50cyB8fCB7fSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5pY2tuYW1lS2V5ID0gU3RyaW5nKG5pY2tuYW1lID8/ICcnKS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5pY2tuYW1lS2V5IHx8ICEvXlsxLTldXFxkKiQvLnRlc3QoU3RyaW5nKGlkX21lbWJlcikpKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBieU5hbWUuZ2V0KG5pY2tuYW1lS2V5KSB8fCBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZXMuYWRkKFN0cmluZyhpZF9tZW1iZXIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5TmFtZS5zZXQobmlja25hbWVLZXksIG1hdGNoZXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJ5Q29udGVzdC5zZXQoY29udGVzdElkLCBieU5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYnlOYW1lLmdldChyZWFkUm93TmFtZShuYW1lKSk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMgJiYgIW1hdGNoZXMuaGFzKGlkID8/ICcnKSkgaWQgPSBtYXRjaGVzLnNpemUgPT09IDEgPyBtYXRjaGVzLnZhbHVlcygpLm5leHQoKS52YWx1ZSA6IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQgJiYgL15bMS05XVxcZCokLy50ZXN0KGlkKSkgbmFtZXMuc2V0KG5hbWUsIGlkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmFtZXM7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KHRoaXMucm9vdFNlbGVjdG9yKTtcbiAgICAgICAgdGhpcy5yb290ID0gcm9vdDtcbiAgICAgICAgY29uc3QgY29udGVzdHMgPSB0aGlzLmluTGVhZ3VlID8gW10gOiBbXG4gICAgICAgICAgICAuLi5PYmplY3QudmFsdWVzKHdpbmRvdy5jb250ZXN0cz8uYWN0aXZlID8/IHt9KSxcbiAgICAgICAgICAgIC4uLk9iamVjdC52YWx1ZXMod2luZG93LmNvbnRlc3RzPy5maW5pc2hlZCA/PyB7fSlcbiAgICAgICAgXS5maWx0ZXIoY29udGVzdCA9PiBjb250ZXN0Py5pZF9jb250ZXN0ICE9IG51bGwpO1xuICAgICAgICBjb25zdCBuYW1lcyA9ICFyb290ID8gbmV3IE1hcDxIVE1MRWxlbWVudCwgc3RyaW5nPigpIDogdGhpcy5pbkxlYWd1ZVxuICAgICAgICAgICAgPyBuZXcgTWFwKEFycmF5LmZyb20ocm9vdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLm5pY2tuYW1lW2lkLW1lbWJlcl0nKSwgbmFtZSA9PiBbbmFtZSwgbmFtZS5nZXRBdHRyaWJ1dGUoJ2lkLW1lbWJlcicpXSBhcyBjb25zdClcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIHJlYWRvbmx5IFtIVE1MRWxlbWVudCwgc3RyaW5nXSA9PiAhIWVudHJ5WzFdICYmIC9eWzEtOV1cXGQqJC8udGVzdChlbnRyeVsxXSkpKVxuICAgICAgICAgICAgOiB0aGlzLmdldENvbnRlc3ROYW1lcyhyb290LCBjb250ZXN0cyk7XG5cbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMubmFtZXMua2V5cygpKSB7XG4gICAgICAgICAgICBpZiAobmFtZXMuaGFzKG5hbWUpKSBjb250aW51ZTtcbiAgICAgICAgICAgIGRlbGV0ZSBuYW1lLmRhdGFzZXQuamFydmlzUGxheWVyO1xuICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5uYW1lcyA9IG5hbWVzO1xuICAgICAgICBpZiAoIXJvb3QpIHJldHVybjtcbiAgICAgICAgY29uc3QgbWFya3MgPSB0aGlzLnJlYWRNYXJrcygpO1xuICAgICAgICBjb25zdCBzYXZlZE5hbWVzID0gdGhpcy5yZWFkU2F2ZWROYW1lcygpO1xuICAgICAgICBjb25zdCByb3N0ZXJOYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBsZXQgbmFtZXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHJlbWVtYmVyTmFtZSA9IChpZDogc3RyaW5nLCB0ZXh0Pzogc3RyaW5nIHwgbnVsbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGlzcGxheU5hbWUgPSB0eXBlb2YgdGV4dCA9PT0gJ3N0cmluZycgPyB0ZXh0LnRyaW0oKSA6ICcnO1xuICAgICAgICAgICAgaWYgKCFkaXNwbGF5TmFtZSB8fCAobWFya3NbaWRdICE9PSAnZnJpZW5kJyAmJiBtYXJrc1tpZF0gIT09ICdmb2UnKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgcHJldmlvdXMgPSBzYXZlZE5hbWVzW2lkXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJldmlvdXMgPT09ICdzdHJpbmcnIHx8IHByZXZpb3VzPy5uYW1lICE9PSBkaXNwbGF5TmFtZSkge1xuICAgICAgICAgICAgICAgIHNhdmVkTmFtZXNbaWRdID0geyBuYW1lOiBkaXNwbGF5TmFtZSB9O1xuICAgICAgICAgICAgICAgIG5hbWVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuaW5MZWFndWUpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBwbGF5ZXIsIG5pY2tuYW1lIH0gb2Ygd2luZG93Lm9wcG9uZW50c19saXN0ID8/IFtdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBTdHJpbmcocGxheWVyPy5pZF9maWdodGVyKTtcbiAgICAgICAgICAgICAgICBpZiAocmVtZW1iZXJOYW1lKGlkLCBuaWNrbmFtZSkpIHJvc3Rlck5hbWVzLmFkZChpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBQcmVmZXIgdGhlIGFjdGl2ZSByb3N0ZXIgaWYgYSBwbGF5ZXIgYXBwZWFycyBpbiBib3RoIG9sZCBhbmQgY3VycmVudCBjb250ZXN0cy5cbiAgICAgICAgICAgIGZvciAoY29uc3QgY29udGVzdCBvZiBjb250ZXN0cykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgeyBpZF9tZW1iZXIsIG5pY2tuYW1lIH0gb2YgT2JqZWN0LnZhbHVlcyhjb250ZXN0LnBhcnRpY2lwYW50cyA/PyB7fSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaWQgPSBTdHJpbmcoaWRfbWVtYmVyKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyb3N0ZXJOYW1lcy5oYXMoaWQpICYmIHJlbWVtYmVyTmFtZShpZCwgbmlja25hbWUpKSByb3N0ZXJOYW1lcy5hZGQoaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnJlYWRDb2xvcnMoKTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFyaywgY29sb3JdIG9mIE9iamVjdC5lbnRyaWVzKGNvbG9ycykpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5ID0gJy0tamFydmlzLScgKyBtYXJrICsgJy1jb2xvcic7XG4gICAgICAgICAgICBpZiAocm9vdC5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5KSAhPT0gY29sb3IpIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkocHJvcGVydHksIGNvbG9yKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCBpZF0gb2YgbmFtZXMpIHtcbiAgICAgICAgICAgIGlmIChuYW1lLmRhdGFzZXQuamFydmlzUGxheWVyICE9PSBpZCkgbmFtZS5kYXRhc2V0LmphcnZpc1BsYXllciA9IGlkO1xuICAgICAgICAgICAgY29uc3QgbWFyayA9IG1hcmtzW2lkXTtcbiAgICAgICAgICAgIGlmIChtYXJrID09PSAnZnJpZW5kJyB8fCBtYXJrID09PSAnZm9lJykge1xuICAgICAgICAgICAgICAgIGlmIChuYW1lLmRhdGFzZXQuamFydmlzTWFyayAhPT0gbWFyaykgbmFtZS5kYXRhc2V0LmphcnZpc01hcmsgPSBtYXJrO1xuICAgICAgICAgICAgICAgIGlmICghcm9zdGVyTmFtZXMuaGFzKGlkKSkgcmVtZW1iZXJOYW1lKGlkLCByZWFkUm93TmFtZShuYW1lKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lc0NoYW5nZWQpIHRoaXMuc2F2ZU5hbWVzKHNhdmVkTmFtZXMpO1xuICAgIH1cblxuICAgIGFwcGx5TWFyayhpZDogc3RyaW5nLCBtYXJrOiBNYXJrKSB7XG4gICAgICAgIGNvbnN0IG1hcmtzID0gdGhpcy5yZWFkTWFya3MoKTtcbiAgICAgICAgbWFya3NbaWRdID0gbWFyaztcblxuICAgICAgICBpZiAodGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya3MnLCBtYXJrcykpIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIGhhbmRsZU1hcmtNZW51KGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlICYmIHRoaXMubWFya01lbnU/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcbiAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG4gICAgICAgIGlmIChldmVudC50eXBlICE9PSAnY29udGV4dG1lbnUnICYmICFldmVudC5hbHRLZXkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBuYW1lID0gZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCA/IGV2ZW50LnRhcmdldC5jbG9zZXN0PEhUTUxFbGVtZW50PignW2RhdGEtamFydmlzLXBsYXllcl0nKSA6IG51bGw7XG4gICAgICAgIGlmICghbmFtZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBpZCA9IHRoaXMubmFtZXMuZ2V0KG5hbWUpO1xuICAgICAgICBpZiAoIWlkKSByZXR1cm47XG4gICAgICAgIHRoaXMub3Blbk1hcmtNZW51KGV2ZW50LCBuYW1lLCBpZCk7XG4gICAgfVxuXG4gICAgcnVuKHsgbGVhZ3VlLCBjb250ZXN0cyB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgdGhpcy5pbkxlYWd1ZSA9IGN1cnJlbnRQYWdlID09PSAnL2xlYWd1ZXMuaHRtbCc7XG4gICAgICAgIGlmICh0aGlzLmluTGVhZ3VlID8gIWxlYWd1ZSA6ICFjb250ZXN0cykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucm9vdFNlbGVjdG9yID0gdGhpcy5pbkxlYWd1ZSA/ICcubGVhZ3VlX3RhYmxlJyA6ICcjY29udGVzdHMgLnJpZ2h0X3BhcnQnO1xuICAgICAgICBjb25zdCBoYW5kbGVNYXJrTWVudSA9IChldmVudDogTW91c2VFdmVudCkgPT4gdGhpcy5oYW5kbGVNYXJrTWVudShldmVudCk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlTWFya01lbnUsIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGhhbmRsZU1hcmtNZW51LCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5rZXkgIT09ICdFc2NhcGUnIHx8ICF0aGlzLm1hcmtNZW51KSByZXR1cm47XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKCFldmVudC5rZXkgfHwgWydQbGF5ZXJNYXJrcycsICdQbGF5ZXJNYXJrQ29sb3JzJywgJ0ZyaWVuZExpc3QnLCAnRm9lTGlzdCddXG4gICAgICAgICAgICAgICAgLnNvbWUoa2V5ID0+IGV2ZW50LmtleSA9PT0gTFNfQ09ORklHX05BTUUgKyBrZXkpKSB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihtdXRhdGlvbnMgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5yb290U2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHJvb3QgIT09IHRoaXMucm9vdCB8fCAocm9vdCAmJiBtdXRhdGlvbnMuc29tZSgoeyB0YXJnZXQgfSkgPT4gcm9vdC5jb250YWlucyh0YXJnZXQpKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZSxcbiAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ3NvcnRpbmdfaWQnLCAnaWQtbWVtYmVyJywgJ2lkX2NvbnRlc3QnXVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBsc0dldCwgbHNTZXQgfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcblxuZXhwb3J0IHR5cGUgQ29udGVzdEtpbmQgPSAnZGFpbHknIHwgJ2V2ZW50JztcbmV4cG9ydCB0eXBlIENvbnRlc3RSYW5rID0gJ3RvcCcgfCAnbWluZSc7XG5cbmNvbnN0IENPTlRFU1RfS0lORFMgPSBbWydkYWlseScsICdEYWlseSddLCBbJ2V2ZW50JywgJ0V2ZW50J11dIGFzIGNvbnN0O1xuY29uc3QgQ09OVEVTVF9FVkVOVFMgPSBbWydhbnknLCAnQW55J10sIFsnY2JjJywgJ0NiQyddLCBbJ2NjYycsICdDQ0MnXSwgWydsYycsICdMQyddXSBhcyBjb25zdDtcbmNvbnN0IENPTlRFU1RfUkFOS1MgPSBbWyd0b3AnLCAnVG9wJ10sIFsnbWluZScsICdNeSByYW5rJ11dIGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBDb250ZXN0RXZlbnQgPSBFeGNsdWRlPCh0eXBlb2YgQ09OVEVTVF9FVkVOVFMpW251bWJlcl1bMF0sICdhbnknPjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRDb250ZXN0U2V0dGluZyhrZXk6IHN0cmluZyk6IHVua25vd24ge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBsc0dldChrZXkpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQ29udGVzdERlZmF1bHRzKCkge1xuICAgIGNvbnN0IGtpbmQ6IENvbnRlc3RLaW5kID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0S2luZCcpID09PSAnZGFpbHknID8gJ2RhaWx5JyA6ICdldmVudCc7XG4gICAgY29uc3Qgc2F2ZWRFdmVudCA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdEV2ZW50Jyk7XG4gICAgY29uc3QgZXZlbnQgPSBDT05URVNUX0VWRU5UUy5maW5kKChbdmFsdWVdKSA9PiB2YWx1ZSA9PT0gc2F2ZWRFdmVudCk/LlswXSA/PyAnYW55JztcbiAgICBjb25zdCByYW5rOiBDb250ZXN0UmFuayA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdFJhbmtTdGFydCcpID09PSAndG9wJyA/ICd0b3AnIDogJ21pbmUnO1xuICAgIHJldHVybiB7IGtpbmQsIGV2ZW50LCByYW5rIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkUGlubmVkUmFuayhpZDogc3RyaW5nLCBmYWxsYmFjazogQ29udGVzdFJhbmspOiBDb250ZXN0UmFuayB7XG4gICAgY29uc3Qgc2F2ZWQgPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RQaW5uZWRSYW5rJyk7XG4gICAgaWYgKHNhdmVkICYmIHR5cGVvZiBzYXZlZCA9PT0gJ29iamVjdCcgJiYgJ2lkJyBpbiBzYXZlZCAmJiBzYXZlZC5pZCA9PT0gaWQgJiYgJ3JhbmsnIGluIHNhdmVkKSB7XG4gICAgICAgIGlmIChzYXZlZC5yYW5rID09PSAnbWluZScgfHwgc2F2ZWQucmFuayA9PT0gJ3RvcCcpIHJldHVybiBzYXZlZC5yYW5rO1xuICAgIH1cbiAgICByZXR1cm4gZmFsbGJhY2s7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlUmFua0Nob2ljZShsYWJlbDogc3RyaW5nLCBzZWxlY3Q6IChyYW5rOiBDb250ZXN0UmFuaykgPT4gdm9pZCkge1xuICAgIHJldHVybiBtYWtlQ2hvaWNlKGxhYmVsLCBDT05URVNUX1JBTktTLCBzZWxlY3QpO1xufVxuXG5mdW5jdGlvbiBtYWtlQ2hvaWNlPFQgZXh0ZW5kcyBzdHJpbmc+KGxhYmVsOiBzdHJpbmcsIG9wdGlvbnM6IFJlYWRvbmx5QXJyYXk8cmVhZG9ubHkgW1QsIHN0cmluZ10+LCBzZWxlY3Q6ICh2YWx1ZTogVCkgPT4gdm9pZCkge1xuICAgIGNvbnN0IGdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGdyb3VwLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY29udGVzdC1jaG9pY2UnO1xuICAgIGdyb3VwLnNldEF0dHJpYnV0ZSgncm9sZScsICdncm91cCcpO1xuICAgIGdyb3VwLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGxhYmVsKTtcbiAgICBncm91cC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZlbnQgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpO1xuICAgIGZvciAoY29uc3QgW3ZhbHVlLCB0ZXh0XSBvZiBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICBidXR0b24uZGF0YXNldC5jb250ZXN0Q2hvaWNlID0gdmFsdWU7XG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgc2VsZWN0KHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGdyb3VwLmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgfVxuICAgIHJldHVybiBncm91cDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdENvbnRlc3RDaG9pY2UoZ3JvdXA6IEhUTUxFbGVtZW50LCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgZm9yIChjb25zdCBidXR0b24gb2YgZ3JvdXAucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJykpIHtcbiAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgU3RyaW5nKGJ1dHRvbi5kYXRhc2V0LmNvbnRlc3RDaG9pY2UgPT09IHZhbHVlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbENvbnRlc3RTZXR0aW5ncygpIHtcbiAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmdbcmVsPVwiSkFSVklTX2NvbnRlc3RTdGFydFwiXSc7XG4gICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIGlmICghY2FyZCB8fCBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXMtY29udGVzdC1zZXR0aW5ncycpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZmllbGRzZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmaWVsZHNldCcpO1xuICAgICAgICBmaWVsZHNldC5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3Qtc2V0dGluZ3MnO1xuICAgICAgICBmaWVsZHNldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnQ29udGVzdCBzdGFydHVwIGRlZmF1bHRzJyk7XG4gICAgICAgIGNvbnN0IHNhdmUgPSAoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGdyb3VwOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsc1NldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGdyb3VwLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB0aGUgY29udGVzdCBkZWZhdWx0OicsIGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBldmVudExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGV2ZW50TGFiZWwuaW5uZXJIVE1MID0gc2V0dGluZ0hlbHAoJ0V2ZW50IHR5cGUnLCAnUHJlZmVyIENiQyAoQ3VtYmFjayBDb250ZXN0KSwgQ0NDIChDcmF6eSBDdW1iYWNrIENvbnRlc3QpLCBvciBMQyAoTGVnZW5kYXJ5IENvbnRlc3QpIHdoZW4gYWN0aXZlLiBBbnkgb3BlbnMgdGhlIGJvdHRvbSBhY3RpdmUgY29udGVzdCwgYXMgZG9lcyBhbiB1bmF2YWlsYWJsZSBldmVudCB0eXBlLicpO1xuICAgICAgICBjb25zdCBldmVudHMgPSBtYWtlQ2hvaWNlKCdFdmVudCB0eXBlJywgQ09OVEVTVF9FVkVOVFMsIHZhbHVlID0+IHNhdmUoJ0NvbnRlc3RFdmVudCcsIHZhbHVlLCBldmVudHMpKTtcbiAgICAgICAgY29uc3Qgc2hvd0V2ZW50cyA9IChraW5kOiBDb250ZXN0S2luZCkgPT4gZXZlbnRMYWJlbC5oaWRkZW4gPSBldmVudHMuaGlkZGVuID0ga2luZCA9PT0gJ2RhaWx5JztcbiAgICAgICAgY29uc3Qga2luZHMgPSBtYWtlQ2hvaWNlKCdQcmVmZXJyZWQgY29udGVzdCcsIENPTlRFU1RfS0lORFMsIHZhbHVlID0+IHtcbiAgICAgICAgICAgIGlmIChzYXZlKCdDb250ZXN0S2luZCcsIHZhbHVlLCBraW5kcykpIHNob3dFdmVudHModmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcmFua3MgPSBtYWtlUmFua0Nob2ljZSgnRGVmYXVsdCBsZWFkZXJib2FyZCBwb3NpdGlvbicsIHZhbHVlID0+IHNhdmUoJ0NvbnRlc3RSYW5rU3RhcnQnLCB2YWx1ZSwgcmFua3MpKTtcbiAgICAgICAgY29uc3QgZGVmYXVsdHMgPSByZWFkQ29udGVzdERlZmF1bHRzKCk7XG4gICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2Uoa2luZHMsIGRlZmF1bHRzLmtpbmQpO1xuICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGV2ZW50cywgZGVmYXVsdHMuZXZlbnQpO1xuICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKHJhbmtzLCBkZWZhdWx0cy5yYW5rKTtcbiAgICAgICAgc2hvd0V2ZW50cyhkZWZhdWx0cy5raW5kKTtcblxuICAgICAgICBjb25zdCBraW5kTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAga2luZExhYmVsLmlubmVySFRNTCA9IHNldHRpbmdIZWxwKCdQcmVmZXJyZWQgY29udGVzdCcsICdEYWlseSBvcGVucyB0aGUgZmlyc3QgYWN0aXZlIGRhaWx5IGNvbnRlc3QuIEV2ZW50IGNhbiBwcmVmZXIgYW4gZXZlbnQgdHlwZSBvciBmb2xsb3cgdGhlIGdhbWUgYW5kIG9wZW4gdGhlIGJvdHRvbSBhY3RpdmUgY29udGVzdC4nKTtcbiAgICAgICAgY29uc3QgcmFua0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHJhbmtMYWJlbC5pbm5lckhUTUwgPSBzZXR0aW5nSGVscCgnTGVhZGVyYm9hcmQgc3RhcnQnLCAnT3BlbiBhdCB0aGUgdG9wIG9yIGF0IHlvdXIgcmFuay4gQSBzdGFycmVkIGNvbnRlc3QgY2FuIGhhdmUgaXRzIG93biBwb3NpdGlvbi4nKTtcbiAgICAgICAgZmllbGRzZXQuYXBwZW5kKGtpbmRMYWJlbCwga2luZHMsIGV2ZW50TGFiZWwsIGV2ZW50cywgcmFua0xhYmVsLCByYW5rcyk7XG4gICAgICAgIGNvbnN0IHJlZnJlc2hFbmFibGVkID0gKCkgPT4gZmllbGRzZXQuZGlzYWJsZWQgPSAhY2FyZC5jbGFzc0xpc3QuY29udGFpbnMoJ2VuYWJsZWQnKTtcbiAgICAgICAgcmVmcmVzaEVuYWJsZWQoKTtcbiAgICAgICAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIocmVmcmVzaEVuYWJsZWQpLm9ic2VydmUoY2FyZCwgeyBhdHRyaWJ1dGVGaWx0ZXI6IFsnY2xhc3MnXSB9KTtcbiAgICAgICAgY2FyZC5hcHBlbmRDaGlsZChmaWVsZHNldCk7XG4gICAgfSk7XG59XG4iLCAiaW50ZXJmYWNlIENvbnRlc3RTaG9ydGN1dCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBjYXRlZ29yeTogc3RyaW5nO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICByYW5rOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb3NpdGlvbkNvbnRlc3RTaG9ydGN1dHMoY2FudmFzOiBIVE1MRWxlbWVudCwgYmFyOiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnN0IGNsb3NlID0gY2FudmFzLnBhcmVudEVsZW1lbnQ/LnF1ZXJ5U2VsZWN0b3IoJzpzY29wZSA+IC5jbG9zZV9jcm9zcycpO1xuICAgIGlmICghY2xvc2UpIHJldHVybjtcblxuICAgIGNvbnN0IGZyYW1lID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGNyb3NzID0gY2xvc2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3Qgc2NhbGVYID0gZnJhbWUud2lkdGggLyBjYW52YXMub2Zmc2V0V2lkdGg7XG4gICAgY29uc3Qgc2NhbGVZID0gZnJhbWUuaGVpZ2h0IC8gY2FudmFzLm9mZnNldEhlaWdodDtcbiAgICBpZiAoIXNjYWxlWCB8fCAhc2NhbGVZIHx8ICFjcm9zcy53aWR0aCkgcmV0dXJuO1xuXG4gICAgYmFyLnN0eWxlLmluc2V0SW5saW5lRW5kID0gYCR7TWF0aC5jZWlsKChmcmFtZS5yaWdodCAtIGNyb3NzLmxlZnQpIC8gc2NhbGVYICsgOCl9cHhgO1xuICAgIGJhci5zdHlsZS5pbnNldEJsb2NrU3RhcnQgPSBgJHtNYXRoLnJvdW5kKChjcm9zcy50b3AgKyBjcm9zcy5oZWlnaHQgLyAyIC0gZnJhbWUudG9wKSAvIHNjYWxlWSl9cHhgO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQ29udGVzdFNob3J0Y3V0cyhcbiAgICBjYW52YXM6IEhUTUxFbGVtZW50LFxuICAgIGNvbnRlc3RzOiBDb250ZXN0U2hvcnRjdXRbXSxcbiAgICBzZWxlY3RlZDogc3RyaW5nIHwgbnVsbCxcbiAgICBzZWxlY3Q6IChpZDogc3RyaW5nKSA9PiB2b2lkXG4pIHtcbiAgICBsZXQgYmFyID0gY2FudmFzLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCc6c2NvcGUgPiAuamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzJyk7XG4gICAgaWYgKCFjb250ZXN0cy5sZW5ndGgpIHtcbiAgICAgICAgYmFyPy5yZW1vdmUoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIWJhcikge1xuICAgICAgICBiYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYmFyLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMnO1xuICAgICAgICBiYXIuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2dyb3VwJyk7XG4gICAgICAgIGJhci5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnQWN0aXZlIGNvbnRlc3RzJyk7XG4gICAgICAgIGJhci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBpZCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0PEhUTUxCdXR0b25FbGVtZW50PignYnV0dG9uW2RhdGEtY29udGVzdC1pZF0nKT8uZGF0YXNldC5jb250ZXN0SWQ7XG4gICAgICAgICAgICBpZiAoaWQpIHNlbGVjdChpZCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjYW52YXMucHJlcGVuZChiYXIpO1xuICAgICAgICBwb3NpdGlvbkNvbnRlc3RTaG9ydGN1dHMoY2FudmFzLCBiYXIpO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1dHRvbnMgPSBuZXcgTWFwKEFycmF5LmZyb20oYmFyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpLCBidXR0b24gPT4gW2J1dHRvbi5kYXRhc2V0LmNvbnRlc3RJZCwgYnV0dG9uXSkpO1xuICAgIGNvbnN0IGNhdGVnb3JpZXMgPSBjb250ZXN0cy5tYXAoY29udGVzdCA9PiBjb250ZXN0LmNhdGVnb3J5KTtcbiAgICBmb3IgKGNvbnN0IFtpbmRleCwgeyBpZCwgY2F0ZWdvcnksIG5hbWUsIHJhbmsgfV0gb2YgY29udGVzdHMuZW50cmllcygpKSB7XG4gICAgICAgIGxldCBidXR0b24gPSBidXR0b25zLmdldChpZCk7XG4gICAgICAgIGlmICghYnV0dG9uKSB7XG4gICAgICAgICAgICBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBidXR0b24uZGF0YXNldC5jb250ZXN0SWQgPSBpZDtcbiAgICAgICAgICAgIGJ1dHRvbi5hcHBlbmQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpLCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHJvbmcnKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZSA9IGNhdGVnb3JpZXMuaW5kZXhPZihjYXRlZ29yeSkgPT09IGNhdGVnb3JpZXMubGFzdEluZGV4T2YoY2F0ZWdvcnkpID9cbiAgICAgICAgICAgIGNhdGVnb3J5IDogYCR7Y2F0ZWdvcnl9ICR7Y2F0ZWdvcmllcy5zbGljZSgwLCBpbmRleCArIDEpLmZpbHRlcih2YWx1ZSA9PiB2YWx1ZSA9PT0gY2F0ZWdvcnkpLmxlbmd0aH1gO1xuICAgICAgICBjb25zdCBbbGFiZWwsIHBsYWNlbWVudF0gPSBBcnJheS5mcm9tKGJ1dHRvbi5jaGlsZHJlbik7XG4gICAgICAgIGlmIChsYWJlbC50ZXh0Q29udGVudCAhPT0gdHlwZSkgbGFiZWwudGV4dENvbnRlbnQgPSB0eXBlO1xuICAgICAgICBpZiAocGxhY2VtZW50LnRleHRDb250ZW50ICE9PSAocmFuayB8fCAn4oCTJykpIHBsYWNlbWVudC50ZXh0Q29udGVudCA9IHJhbmsgfHwgJ+KAkyc7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gYCR7dHlwZX0gwrcgJHtuYW1lfSDCtyAke3JhbmsgPyBgUmFuayAke3Jhbmt9YCA6ICdSYW5rIHVuYXZhaWxhYmxlJ31gO1xuICAgICAgICBpZiAoYnV0dG9uLnRpdGxlICE9PSBkZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgYnV0dG9uLnRpdGxlID0gZGVzY3JpcHRpb247XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgZGVzY3JpcHRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByZXNzZWQgPSBTdHJpbmcoaWQgPT09IHNlbGVjdGVkKTtcbiAgICAgICAgaWYgKGJ1dHRvbi5nZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcpICE9PSBwcmVzc2VkKSBidXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBwcmVzc2VkKTtcblxuICAgICAgICBpZiAoYnV0dG9uICE9PSBiYXIuY2hpbGRyZW5baW5kZXhdKSBiYXIuaW5zZXJ0QmVmb3JlKGJ1dHRvbiwgYmFyLmNoaWxkcmVuW2luZGV4XSA/PyBudWxsKTtcbiAgICAgICAgYnV0dG9ucy5kZWxldGUoaWQpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGJ1dHRvbiBvZiBidXR0b25zLnZhbHVlcygpKSBidXR0b24ucmVtb3ZlKCk7XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUsIHR5cGUgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyAkLCBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgbHNHZXQsIGxzU2V0LCBsc1JtIH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5pbXBvcnQgeyBtYWtlUmFua0Nob2ljZSwgcmVhZENvbnRlc3REZWZhdWx0cywgcmVhZENvbnRlc3RTZXR0aW5nLCByZWFkUGlubmVkUmFuaywgc2VsZWN0Q29udGVzdENob2ljZSwgdHlwZSBDb250ZXN0RXZlbnQsIHR5cGUgQ29udGVzdEtpbmQgfSBmcm9tICcuL2NvbnRlc3RQcmVmZXJlbmNlcyc7XG5pbXBvcnQgeyBwb3NpdGlvbkNvbnRlc3RTaG9ydGN1dHMsIHJlbmRlckNvbnRlc3RTaG9ydGN1dHMgfSBmcm9tICcuL2NvbnRlc3RTaG9ydGN1dHMnO1xuXG50eXBlIENvbnRlc3RDYXRlZ29yeSA9IENvbnRlc3RLaW5kIHwgQ29udGVzdEV2ZW50O1xuY29uc3QgQ09OVEVTVF9TSE9SVF9MQUJFTFM6IFJlY29yZDxDb250ZXN0Q2F0ZWdvcnksIHN0cmluZz4gPSB7XG4gICAgZGFpbHk6ICdEQycsIGNiYzogJ0NiQycsIGNjYzogJ0NDQycsIGxjOiAnTEMnLCBldmVudDogJ0V2ZW50J1xufTtcbmNvbnN0IENPTlRFU1RfVElUTEVfU0VMRUNUT1IgPSAnLmNvbnRlc3RfdGl0bGUsIC5jb250ZXN0X25hbWUsIGgzLCBoNCwgaDUnO1xuXG5mdW5jdGlvbiBnZXRDb250ZXN0Q2F0ZWdvcnkoY2F0ZWdvcnk6IHN0cmluZyB8IHVuZGVmaW5lZCk6IENvbnRlc3RDYXRlZ29yeSB8IG51bGwge1xuICAgIHN3aXRjaCAoY2F0ZWdvcnk/LnRyaW0oKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1stIF0rL2csICdfJykpIHtcbiAgICAgICAgY2FzZSAnZGFpbHknOlxuICAgICAgICBjYXNlICdkYWlseV9jb250ZXN0JzogcmV0dXJuICdkYWlseSc7XG4gICAgICAgIGNhc2UgJ2N1bWJhY2snOlxuICAgICAgICBjYXNlICdjdW1iYWNrX2NvbnRlc3QnOlxuICAgICAgICBjYXNlICdjYmMnOiByZXR1cm4gJ2NiYyc7XG4gICAgICAgIGNhc2UgJ2NyYXp5X2N1bWJhY2snOlxuICAgICAgICBjYXNlICdjcmF6eV9jdW1iYWNrX2NvbnRlc3QnOlxuICAgICAgICBjYXNlICdjY2JjJzpcbiAgICAgICAgY2FzZSAnY2NjJzogcmV0dXJuICdjY2MnO1xuICAgICAgICBjYXNlICdsZWdlbmRhcnknOlxuICAgICAgICBjYXNlICdsZWdlbmRhcnlfY29udGVzdCc6XG4gICAgICAgIGNhc2UgJ2xjJzogcmV0dXJuICdsYyc7XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiBjYXRlZ29yeSA/ICdldmVudCcgOiBudWxsO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIENvbnRlc3RDYXJkIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIGNhcmQ6IEhUTUxFbGVtZW50O1xuICAgIGhlYWRlcjogSFRNTEVsZW1lbnQ7XG4gICAgdGl0bGU6IEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIGNhdGVnb3J5OiBDb250ZXN0Q2F0ZWdvcnkgfCBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJtQ29udGVzdFN0YXJ0dXBHdWFyZCgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBpZiAobG9jYXRpb24ucGF0aG5hbWUgIT09ICcvYWN0aXZpdGllcy5odG1sJyB8fCBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KCd0YWInKSAhPT0gJ2NvbnRlc3RzJykgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ0hIUGx1c1BsdXNDb25maWcnKSA/PyAnbnVsbCcpPy5KQVJWSVNfY29udGVzdFN0YXJ0ID09PSBmYWxzZSkgcmV0dXJuO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gS2VlcCBib3RoIHBhbmVzIG91dCBvZiB2aWV3IHVudGlsIHRoZSBjaG9zZW4gY29udGVzdCBhbmQgaXRzIGxlYWRlcmJvYXJkIGFyZSBwb3NpdGlvbmVkLlxuICAgIGNvbnN0IGd1YXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBndWFyZC5pZCA9ICdqYXJ2aXMtY29udGVzdC1zdGFydHVwJztcbiAgICBndWFyZC50ZXh0Q29udGVudCA9IGBcbiAgICAgICAgI2NvbnRlc3RzIC5sZWZ0X3BhcnQgLnNjcm9sbF9hcmVhLFxuICAgICAgICAjY29udGVzdHMgLnJpZ2h0X3BhcnQge1xuICAgICAgICAgICAgb3BhY2l0eTogMCAhaW1wb3J0YW50O1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogbm9uZSAhaW1wb3J0YW50O1xuICAgICAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgICAgIH1cbiAgICBgO1xuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICBpZiAoIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkgcmV0dXJuO1xuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ3VhcmQpO1xuICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgfSk7XG4gICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKGd1YXJkKTtcbiAgICBlbHNlIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQsIHsgY2hpbGRMaXN0OiB0cnVlIH0pO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgZ3VhcmQucmVtb3ZlKCk7XG4gICAgfSwgNDAwMCk7XG59XG5cbmV4cG9ydCBjbGFzcyBDb250ZXN0U3RhcnQgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBwcmVmZXJlbmNlID0gJyc7XG4gICAgcHJpdmF0ZSBzdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgIHByaXZhdGUgZGVmYXVsdHMgPSByZWFkQ29udGVzdERlZmF1bHRzKCk7XG4gICAgcHJpdmF0ZSBsaXN0OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmlnaHQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByZXN0b3JpbmdDYXJkOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmVwb3NpdGlvbjogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdG9wSnVtcDogKChmaW5pc2g/OiBib29sZWFuKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc3RvcFN3aXRjaFNjcm9sbCA9IGZhbHNlO1xuICAgIHByaXZhdGUgc3dpdGNoU2Nyb2xsOiB7IHJlc3RvcmU6ICgpID0+IHZvaWQ7IHN0b3A6ICgpID0+IHZvaWQgfSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgbGVhZGVyYm9hcmRQb3NpdGlvbnMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuICAgIHByaXZhdGUgb2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGxpc3RlbmVyczogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdjb250ZXN0U3RhcnQnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiQ29udGVzdCBzdGFydHVwXCIsIFwiT3BlbiB0aGUgcHJlZmVycmVkIGNvbnRlc3QgYW5kIHJhbmsgb24gbG9hZCwgYW5kIHN3aXRjaCBhY3RpdmUgY29udGVzdHMgZnJvbSB0aGUgaGVhZGVyLiBBIHN0YXJyZWQgY29udGVzdCB0YWtlcyBwcmlvcml0eSBvbiBsb2FkLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ25vU3dpdGNoU2Nyb2xsJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoJ1N0b3Agc2Nyb2xsaW5nIG9uIGNvbnRlc3Qgc3dpdGNoZXMnLCAnS2VlcCB0aGUgY29udGVzdCBsaXN0IGluIHBsYWNlIGFuZCByZW1lbWJlciBlYWNoIGxlYWRlcmJvYXJk4oCZcyBwb3NpdGlvbiB3aGVuIHlvdSBzd2l0Y2ggY2FyZHMuIFlvdSBjYW4gc3RpbGwgc2Nyb2xsIGVpdGhlciBwYW5lIGJ5IGhhbmQuJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoeyBuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWEgfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UgPT09ICcvYWN0aXZpdGllcy5odG1sJztcbiAgICB9XG5cbiAgICBnZXRDb250ZXN0cyhsaXN0OiBIVE1MRWxlbWVudCwgZmluaXNoZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz4pOiBDb250ZXN0Q2FyZFtdIHtcbiAgICAgICAgY29uc3QgYWN0aXZlID0gbmV3IE1hcChPYmplY3QudmFsdWVzKHdpbmRvdy5jb250ZXN0cz8uYWN0aXZlIHx8IHt9KVxuICAgICAgICAgICAgLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbClcbiAgICAgICAgICAgIC5tYXAoY29udGVzdCA9PiBbU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCksIGNvbnRlc3RdKSk7XG5cbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obGlzdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLmNvbnRlc3RbaWRfY29udGVzdF0nKSkuZmxhdE1hcChjYXJkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gY2FyZC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmICghaWQpIHJldHVybiBbXTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlc3QgPSBhY3RpdmUuZ2V0KGlkKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IGNhcmQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jb250ZXN0X2hlYWRlcicpO1xuICAgICAgICAgICAgaWYgKCFoZWFkZXIgfHwgZmluaXNoZWQuaGFzKGlkKSkgcmV0dXJuIFtdO1xuICAgICAgICAgICAgaWYgKCFjb250ZXN0ICYmICFoZWFkZXIubWF0Y2hlcygnLmluX3Byb2dyZXNzJykpIHJldHVybiBbXTtcblxuICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBoZWFkZXIucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oQ09OVEVTVF9USVRMRV9TRUxFQ1RPUik7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gdGl0bGUgJiYgQXJyYXkuZnJvbSh0aXRsZS5jaGlsZE5vZGVzKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIobm9kZSA9PiAhKG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSB8fCAhbm9kZS5tYXRjaGVzKCcuamFydmlzLWNvbnRlc3QtcGluLCAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpKVxuICAgICAgICAgICAgICAgIC5tYXAobm9kZSA9PiBub2RlLnRleHRDb250ZW50KS5qb2luKCcnKS50cmltKCk7XG4gICAgICAgICAgICBjb25zdCBjYXRlZ29yeSA9IGdldENvbnRlc3RDYXRlZ29yeShjb250ZXN0Py5jYXRlZ29yeV90eXBlKTtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIGlkLCBjYXJkLCBoZWFkZXIsIHRpdGxlLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIGxhYmVsOiBTdHJpbmcobmFtZSB8fCBjb250ZXN0Py5uYW1lIHx8IGNvbnRlc3Q/LnRpdGxlIHx8XG4gICAgICAgICAgICAgICAgICAgIChjYXRlZ29yeSA9PT0gJ2RhaWx5JyA/ICdEYWlseSBjb250ZXN0JyA6ICdDb250ZXN0JykpLnRyaW0oKVxuICAgICAgICAgICAgfV07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFRhcmdldChjb250ZXN0czogQ29udGVzdENhcmRbXSkge1xuICAgICAgICBpZiAodGhpcy5wcmVmZXJlbmNlKSByZXR1cm4gY29udGVzdHMuZmluZChjb250ZXN0ID0+IGNvbnRlc3QuaWQgPT09IHRoaXMucHJlZmVyZW5jZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuZGVmYXVsdHMua2luZCA9PT0gJ2V2ZW50Jykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGVmYXVsdHMuZXZlbnQgIT09ICdhbnknKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBbLi4uY29udGVzdHNdLnJldmVyc2UoKS5maW5kKGNvbnRlc3QgPT4gY29udGVzdC5jYXRlZ29yeSA9PT0gdGhpcy5kZWZhdWx0cy5ldmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50IHx8IGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHJldHVybiBldmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb250ZXN0cy5hdCgtMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmNhdGVnb3J5ID09PSAnZGFpbHknKSA/P1xuICAgICAgICAgICAgY29udGVzdHMuZmluZChjb250ZXN0ID0+IGNvbnRlc3QuY2F0ZWdvcnkgPT09IG51bGwpID8/IGNvbnRlc3RzWzBdO1xuICAgIH1cblxuICAgIGNsZWFyRXhwaXJlZFBpbihsaXN0OiBIVE1MRWxlbWVudCwgY29udGVzdHM6IENvbnRlc3RDYXJkW10sIGZpbmlzaGVkOiBSZWFkb25seVNldDxzdHJpbmc+KSB7XG4gICAgICAgIGlmICghdGhpcy5wcmVmZXJlbmNlIHx8IGNvbnRlc3RzLnNvbWUoKHsgaWQgfSkgPT4gaWQgPT09IHRoaXMucHJlZmVyZW5jZSkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBhY3RpdmUgPSB3aW5kb3cuY29udGVzdHM/LmFjdGl2ZTtcbiAgICAgICAgY29uc3QgbWlzc2luZyA9IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScgJiYgbGlzdC5xdWVyeVNlbGVjdG9yKCcuY29udGVzdF9oZWFkZXInKSAmJlxuICAgICAgICAgICAgYWN0aXZlICYmICFPYmplY3QudmFsdWVzKGFjdGl2ZSkuc29tZShjb250ZXN0ID0+IFN0cmluZyhjb250ZXN0Py5pZF9jb250ZXN0KSA9PT0gdGhpcy5wcmVmZXJlbmNlKTtcbiAgICAgICAgaWYgKCFmaW5pc2hlZC5oYXModGhpcy5wcmVmZXJlbmNlKSAmJiAhbWlzc2luZykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGV4cGlyZWRJZCA9IHRoaXMucHJlZmVyZW5jZTtcbiAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gJyc7XG4gICAgICAgIHRoaXMuc3RvcEp1bXA/LihmYWxzZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoU3RyaW5nKGxzR2V0KCdDb250ZXN0U3RhcnRJZCcpKSA9PT0gZXhwaXJlZElkKSBsc1JtKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBjbGVhciB0aGUgZXhwaXJlZCBjb250ZXN0IHByZWZlcmVuY2U6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZVBpbnMobGlzdDogSFRNTEVsZW1lbnQsIGNvbnRlc3RzOiBDb250ZXN0Q2FyZFtdKSB7XG4gICAgICAgIGNvbnN0IGhvc3RzID0gbmV3IFNldChjb250ZXN0cy5tYXAoKHsgdGl0bGUsIGhlYWRlciB9KSA9PiB0aXRsZSB8fCBoZWFkZXIpKTtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sIG9mIGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLmphcnZpcy1jb250ZXN0LXBpbiwgLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKSkge1xuICAgICAgICAgICAgaWYgKCFjb250cm9sLnBhcmVudEVsZW1lbnQgfHwgIWhvc3RzLmhhcyhjb250cm9sLnBhcmVudEVsZW1lbnQpKSBjb250cm9sLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCB7IGlkLCB0aXRsZSwgaGVhZGVyLCBsYWJlbCB9IG9mIGNvbnRlc3RzKSB7XG4gICAgICAgICAgICBjb25zdCBob3N0ID0gdGl0bGUgfHwgaGVhZGVyO1xuICAgICAgICAgICAgbGV0IHBpbiA9IGhvc3QucXVlcnlTZWxlY3RvcjxIVE1MQnV0dG9uRWxlbWVudD4oJzpzY29wZSA+IC5qYXJ2aXMtY29udGVzdC1waW4nKTtcbiAgICAgICAgICAgIGlmICghcGluKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1jb250ZXN0LXBpbic7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVzdElkID0gYnV0dG9uLmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRlc3RJZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLnByZWZlcmVuY2UgPT09IGNvbnRlc3RJZCA/ICcnIDogY29udGVzdElkO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQpIGxzU2V0KCdDb250ZXN0U3RhcnRJZCcsIG5leHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBsc1JtKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gbmV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcEp1bXA/LigpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBzYXZlIHRoZSBjb250ZXN0IHByZWZlcmVuY2U6JywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBwaW4gPSBob3N0LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwaW5uZWQgPSB0aGlzLnByZWZlcmVuY2UgPT09IGlkO1xuICAgICAgICAgICAgcGluLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgU3RyaW5nKHBpbm5lZCkpO1xuICAgICAgICAgICAgcGluLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHBpbm5lZCA/IGBVbnBpbiAke2xhYmVsfWAgOiBgUGluICR7bGFiZWx9IHRvIG9wZW4gb24gcmVsb2FkYCk7XG4gICAgICAgICAgICBwaW4udGl0bGUgPSBwaW5uZWQgPyAnUGlubmVkLiBDbGljayB0byB1c2UgeW91ciBjb250ZXN0IGRlZmF1bHRzLicgOiAnT3BlbiB0aGlzIGNvbnRlc3Qgd2hlbiB0aGUgcGFnZSByZWxvYWRzJztcblxuICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gaG9zdC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKTtcbiAgICAgICAgICAgIGlmICghcGlubmVkKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24/LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNob2ljZSA9IG1ha2VSYW5rQ2hvaWNlKCdQaW5uZWQgbGVhZGVyYm9hcmQgc3RhcnQnLCByYW5rID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxzU2V0KCdDb250ZXN0UGlubmVkUmFuaycsIHsgaWQsIHJhbmsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGNob2ljZSwgcmFuayk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGxlYWRlcmJvYXJkIHBvc2l0aW9uOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjaG9pY2UuY2xhc3NMaXN0LmFkZCgnamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpO1xuICAgICAgICAgICAgICAgIHBpbi5hZnRlcihjaG9pY2UpO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gY2hvaWNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShwb3NpdGlvbiwgcmVhZFBpbm5lZFJhbmsoaWQsIHRoaXMuZGVmYXVsdHMucmFuaykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IGxpc3QucXVlcnlTZWxlY3RvcignLmNvbnRlc3RfaGVhZGVyX2FjdGl2ZScpPy5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpO1xuICAgICAgICBpZiAoc2VsZWN0ZWQpIHJldHVybiBzZWxlY3RlZC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcblxuICAgICAgICBjb25zdCBwYW5lbHMgPSBBcnJheS5mcm9tKHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYW5raW5nW2lkX2NvbnRlc3RdJykpXG4gICAgICAgICAgICAuZmlsdGVyKHBhbmVsID0+IHBhbmVsLmdldENsaWVudFJlY3RzKCkubGVuZ3RoICYmIGdldENvbXB1dGVkU3R5bGUocGFuZWwpLnZpc2liaWxpdHkgPT09ICd2aXNpYmxlJyk7XG4gICAgICAgIHJldHVybiBwYW5lbHMubGVuZ3RoID09PSAxID8gcGFuZWxzWzBdLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpIDogbnVsbDtcbiAgICB9XG5cbiAgICBzaG93TGVhZGVyYm9hcmQocmlnaHQ6IEhUTUxFbGVtZW50LCBjb250ZXN0SWQ6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgaWYgKCFjb250ZXN0SWQpIHtcbiAgICAgICAgICAgIHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1vdGhlcicpLmZvckVhY2gocGFuZWwgPT4gcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnamFydmlzLWNvbnRlc3Qtb3RoZXInKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwYW5lbCBvZiByaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcucmFua2luZ1tpZF9jb250ZXN0XScpKSB7XG4gICAgICAgICAgICBwYW5lbC5jbGFzc0xpc3QudG9nZ2xlKCdqYXJ2aXMtY29udGVzdC1vdGhlcicsIHBhbmVsLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpICE9PSBjb250ZXN0SWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0T3duUm93KGJvYXJkOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBvd24gPSBib2FyZC5xdWVyeVNlbGVjdG9yKCcubGVhZFRhYmxlIHRyLmxlYWRfdGFibGVfZGVmYXVsdCcpO1xuICAgICAgICBpZiAob3duKSByZXR1cm4gb3duO1xuXG4gICAgICAgIGNvbnN0IGhlcm9JZCA9ICh3aW5kb3cuc2hhcmVkPy5IZXJvIHx8IHdpbmRvdy5IZXJvKT8uaW5mb3M/LmlkO1xuICAgICAgICBpZiAoaGVyb0lkID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGJvYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5sZWFkVGFibGUgdHJbc29ydGluZ19pZF0nKSlcbiAgICAgICAgICAgIC5maW5kKHJvdyA9PiByb3cuZ2V0QXR0cmlidXRlKCdzb3J0aW5nX2lkJykgPT09IFN0cmluZyhoZXJvSWQpKTtcbiAgICB9XG5cbiAgICBnZXRMZWFkZXJib2FyZFNjcm9sbGVyKHJpZ2h0OiBIVE1MRWxlbWVudCwgaWQ6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShyaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcucmFua2luZ1tpZF9jb250ZXN0XScpKVxuICAgICAgICAgICAgLmZpbmQocGFuZWwgPT4gcGFuZWwuZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0JykgPT09IGlkKT8ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5sZWFkX3RhYmxlX3ZpZXcnKTtcbiAgICB9XG5cbiAgICB1cGRhdGVTaG9ydGN1dHMobGlzdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudCwgY29udGVzdHM6IENvbnRlc3RDYXJkW10pIHtcbiAgICAgICAgY29uc3QgY2FudmFzID0gbGlzdC5jbG9zZXN0PEhUTUxFbGVtZW50PignI2NvbnRlc3RzJyk7XG4gICAgICAgIGlmICghY2FudmFzKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgc2hvcnRjdXRzID0gY29udGVzdHMubWFwKCh7IGlkLCBoZWFkZXIsIGxhYmVsLCBjYXRlZ29yeSB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBib2FyZCA9IHRoaXMuZ2V0TGVhZGVyYm9hcmRTY3JvbGxlcihyaWdodCwgaWQpO1xuICAgICAgICAgICAgY29uc3QgcmFuayA9IGhlYWRlci5xdWVyeVNlbGVjdG9yKCcucGVyc29uYWxfcmV3YXJkcyAucmFuaycpPy50ZXh0Q29udGVudD8udHJpbSgpIHx8XG4gICAgICAgICAgICAgICAgKGJvYXJkICYmIHRoaXMuZ2V0T3duUm93KGJvYXJkKT8ucXVlcnlTZWxlY3RvcigndGQnKT8udGV4dENvbnRlbnQ/LnRyaW0oKSkgfHwgJyc7XG4gICAgICAgICAgICByZXR1cm4geyBpZCwgbmFtZTogbGFiZWwsIGNhdGVnb3J5OiBjYXRlZ29yeSA/IENPTlRFU1RfU0hPUlRfTEFCRUxTW2NhdGVnb3J5XSA6ICdDb250ZXN0JywgcmFuayB9O1xuICAgICAgICB9KTtcbiAgICAgICAgcmVuZGVyQ29udGVzdFNob3J0Y3V0cyhjYW52YXMsIHNob3J0Y3V0cywgdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCksIGlkID0+IHRoaXMub3BlblNob3J0Y3V0KGlkKSk7XG4gICAgfVxuXG4gICAgb3BlblNob3J0Y3V0KGlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgeyBsaXN0LCByaWdodCB9ID0gdGhpcztcbiAgICAgICAgaWYgKCFsaXN0IHx8ICFyaWdodCB8fCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSA9PT0gaWQpIHJldHVybjtcblxuICAgICAgICBjb25zdCBjYXJkID0gbGlzdC5xdWVyeVNlbGVjdG9yKGAuY29udGVzdFtpZF9jb250ZXN0PVwiJHtDU1MuZXNjYXBlKGlkKX1cIl1gKTtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gY2FyZD8ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jb250ZXN0X2hlYWRlcicpO1xuICAgICAgICBpZiAoIWhlYWRlciB8fCBoZWFkZXIubWF0Y2hlcygnLmVuZGVkJykgfHwgY2FyZD8ubWF0Y2hlcygnLmVuZGVkJykpIHJldHVybjtcblxuICAgICAgICB0aGlzLnN0b3BKdW1wPy4oKTtcbiAgICAgICAgdGhpcy5wcmVwYXJlU3dpdGNoKGxpc3QsIHJpZ2h0LCBpZCwgdHJ1ZSk7XG4gICAgICAgIChoZWFkZXIucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oQ09OVEVTVF9USVRMRV9TRUxFQ1RPUikgfHwgaGVhZGVyKS5jbGljaygpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBwcmVwYXJlU3dpdGNoKGxpc3Q6IEhUTUxFbGVtZW50LCByaWdodDogSFRNTEVsZW1lbnQsIGlkOiBzdHJpbmcgfCBudWxsLCBrZWVwUG9zaXRpb246IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICBpZiAoa2VlcFBvc2l0aW9uICYmIGlkICYmIGlkICE9PSB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSkgdGhpcy5ob2xkU3dpdGNoUG9zaXRpb24obGlzdCwgcmlnaHQsIGlkKTtcbiAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIG51bGwpO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBsb2NrU2Nyb2xsKHNjcm9sbGVyOiBIVE1MRWxlbWVudCkge1xuICAgICAgICAkKHNjcm9sbGVyKS5zdG9wKHRydWUsIGZhbHNlKTtcbiAgICAgICAgLy8gVGhlIGdhbWUgY2FuIHN0YXJ0IGFub3RoZXIgalF1ZXJ5IHR3ZWVuIGFmdGVyIGxvYWQuIEJsb2NrIGl0cyB3cml0ZXMgb24gdGhpcyBwYW5lIG9ubHkuXG4gICAgICAgIGNvbnN0IGlnbm9yZVNjcm9sbCA9ICgpID0+IHt9O1xuICAgICAgICBjb25zdCBnZXQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEVsZW1lbnQucHJvdG90eXBlLCAnc2Nyb2xsVG9wJyk/LmdldDtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRvcnMgPSBPYmplY3QuZW50cmllcyh7XG4gICAgICAgICAgICBzY3JvbGxUb3A6IHsgZ2V0LCBzZXQ6IGlnbm9yZVNjcm9sbCB9LFxuICAgICAgICAgICAgc2Nyb2xsOiB7IHZhbHVlOiBpZ25vcmVTY3JvbGwsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICBzY3JvbGxUbzogeyB2YWx1ZTogaWdub3JlU2Nyb2xsLCB3cml0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgc2Nyb2xsQnk6IHsgdmFsdWU6IGlnbm9yZVNjcm9sbCwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgICB9KS5maWx0ZXIoKFtrZXldKSA9PiAhT2JqZWN0Lmhhc093bihzY3JvbGxlciwga2V5KSk7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgZGVzY3JpcHRvcl0gb2YgZGVzY3JpcHRvcnMpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzY3JvbGxlciwga2V5LCB7IC4uLmRlc2NyaXB0b3IsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAkKHNjcm9sbGVyKS5zdG9wKHRydWUsIGZhbHNlKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgZGVzY3JpcHRvcl0gb2YgZGVzY3JpcHRvcnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzY3JvbGxlciwga2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudCAmJiBjdXJyZW50LnZhbHVlID09PSBkZXNjcmlwdG9yLnZhbHVlICYmIGN1cnJlbnQuc2V0ID09PSBkZXNjcmlwdG9yLnNldCkgUmVmbGVjdC5kZWxldGVQcm9wZXJ0eShzY3JvbGxlciwga2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBqdW1wVG8oc2Nyb2xsZXI6IEhUTUxFbGVtZW50LCB0YXJnZXQ6IEVsZW1lbnQgfCBudWxsIHwgdW5kZWZpbmVkLCBjZW50ZXIgPSBmYWxzZSkge1xuICAgICAgICBsZXQgdG9wID0gMDtcbiAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgICAgY29uc3QgYm91bmRzID0gc2Nyb2xsZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBjb25zdCBzY2FsZSA9IGJvdW5kcy5oZWlnaHQgLyBzY3JvbGxlci5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICBpZiAoIXNjYWxlKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0b3AgPSBzY3JvbGxlci5zY3JvbGxUb3AgKyAoaXRlbS50b3AgLSBib3VuZHMudG9wKSAvIHNjYWxlIC0gc2Nyb2xsZXIuY2xpZW50VG9wO1xuICAgICAgICAgICAgaWYgKGNlbnRlcikgdG9wIC09IChzY3JvbGxlci5jbGllbnRIZWlnaHQgLSBpdGVtLmhlaWdodCAvIHNjYWxlKSAvIDI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zY3JvbGxJbnN0YW50bHkoc2Nyb2xsZXIsIHRvcCk7XG4gICAgfVxuXG4gICAgc2Nyb2xsSW5zdGFudGx5KHNjcm9sbGVyOiBIVE1MRWxlbWVudCwgcG9zaXRpb246IG51bWJlcikge1xuICAgICAgICBjb25zdCB0b3AgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihzY3JvbGxlci5zY3JvbGxIZWlnaHQgLSBzY3JvbGxlci5jbGllbnRIZWlnaHQsIHBvc2l0aW9uKSk7XG4gICAgICAgIGlmIChNYXRoLmFicyh0b3AgLSBzY3JvbGxlci5zY3JvbGxUb3ApID49IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbFRvID0gRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsVG8gYXMgKG9wdGlvbnM6IFNjcm9sbFRvT3B0aW9ucykgPT4gdm9pZDtcbiAgICAgICAgICAgIHNjcm9sbFRvLmNhbGwoc2Nyb2xsZXIsIHsgdG9wLCBiZWhhdmlvcjogJ2luc3RhbnQnIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaG9sZFN3aXRjaFBvc2l0aW9uKGxpc3Q6IEhUTUxFbGVtZW50LCByaWdodDogSFRNTEVsZW1lbnQsIGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zd2l0Y2hTY3JvbGw/LnN0b3AoKTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KTtcbiAgICAgICAgaWYgKHNlbGVjdGVkKSB7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91cyA9IHRoaXMuZ2V0TGVhZGVyYm9hcmRTY3JvbGxlcihyaWdodCwgc2VsZWN0ZWQpO1xuICAgICAgICAgICAgaWYgKHByZXZpb3VzPy5jbGllbnRIZWlnaHQpIHRoaXMubGVhZGVyYm9hcmRQb3NpdGlvbnMuc2V0KHNlbGVjdGVkLCBwcmV2aW91cy5zY3JvbGxUb3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGlzdFRvcCA9IGxpc3Quc2Nyb2xsVG9wO1xuICAgICAgICBjb25zdCBib2FyZFRvcCA9IHRoaXMubGVhZGVyYm9hcmRQb3NpdGlvbnMuZ2V0KGlkKSA/PyAwO1xuICAgICAgICBjb25zdCByZWxlYXNlTGlzdCA9IHRoaXMubG9ja1Njcm9sbChsaXN0KTtcbiAgICAgICAgbGV0IGJvYXJkOiBIVE1MRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCByZWxlYXNlQm9hcmQ6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgcmVzdG9yZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmdldExlYWRlcmJvYXJkU2Nyb2xsZXIocmlnaHQsIGlkKTtcbiAgICAgICAgICAgIGlmIChuZXh0ICE9PSBib2FyZCkge1xuICAgICAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICAgICAgYm9hcmQgPSBuZXh0O1xuICAgICAgICAgICAgICAgIHJlbGVhc2VCb2FyZCA9IGJvYXJkID8gdGhpcy5sb2NrU2Nyb2xsKGJvYXJkKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsSW5zdGFudGx5KGxpc3QsIGxpc3RUb3ApO1xuICAgICAgICAgICAgaWYgKGJvYXJkPy5jbGllbnRIZWlnaHQpIHRoaXMuc2Nyb2xsSW5zdGFudGx5KGJvYXJkLCBib2FyZFRvcCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUsIHNpZ25hbDogaGFuZGxlcnMuc2lnbmFsIH07XG4gICAgICAgIGNvbnN0IHN0b3AgPSAoKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgaGFuZGxlcnMuYWJvcnQoKTtcbiAgICAgICAgICAgIHJlbGVhc2VMaXN0KCk7XG4gICAgICAgICAgICByZWxlYXNlQm9hcmQ/LigpO1xuICAgICAgICAgICAgdGhpcy5zd2l0Y2hTY3JvbGwgPSBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoc3RvcCwgNDAwMCk7XG4gICAgICAgIGNvbnN0IG9uU2Nyb2xsID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gbGlzdCB8fCBldmVudC50YXJnZXQgPT09IGJvYXJkKSByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSB7XG4gICAgICAgICAgICBwYW5lLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBbJ3doZWVsJywgJ3RvdWNobW92ZScsICdwb2ludGVyZG93biddKSBwYW5lLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgc3RvcCwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChbJ0Fycm93VXAnLCAnQXJyb3dEb3duJywgJ1BhZ2VVcCcsICdQYWdlRG93bicsICdIb21lJywgJ0VuZCcsICcgJ10uaW5jbHVkZXMoZXZlbnQua2V5KSkgc3RvcCgpO1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5zd2l0Y2hTY3JvbGwgPSB7IHJlc3RvcmUsIHN0b3AgfTtcbiAgICAgICAgcmVzdG9yZSgpO1xuICAgIH1cblxuICAgIG9wZW5Db250ZXN0KGxpc3Q6IEhUTUxFbGVtZW50LCByaWdodDogSFRNTEVsZW1lbnQsIHsgaWQsIGNhcmQsIGhlYWRlciwgdGl0bGUgfTogQ29udGVzdENhcmQpIHtcbiAgICAgICAgZm9yIChjb25zdCBwYW5lIG9mIFtsaXN0LCByaWdodF0pIHBhbmUuY2xhc3NMaXN0LmFkZCgnamFydmlzLWNvbnRlc3QtaW5zdGFudCcsICdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgIGNvbnN0IHJhbmsgPSBpZCA9PT0gdGhpcy5wcmVmZXJlbmNlID8gcmVhZFBpbm5lZFJhbmsoaWQsIHRoaXMuZGVmYXVsdHMucmFuaykgOiB0aGlzLmRlZmF1bHRzLnJhbms7XG4gICAgICAgIGNvbnN0IHBsYWNlQXRPd25SYW5rID0gcmFuayA9PT0gJ21pbmUnO1xuICAgICAgICBjb25zdCByZWxlYXNlTGlzdCA9IHRoaXMubG9ja1Njcm9sbChsaXN0KTtcbiAgICAgICAgbGV0IGJvYXJkOiBIVE1MRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCByZWxlYXNlQm9hcmQ6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHBvc2l0aW9uZWQgPSBmYWxzZTtcbiAgICAgICAgbGV0IGxhc3RBdHRlbXB0OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgIGNvbnN0IHVwZGF0ZUJvYXJkID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuZ2V0TGVhZGVyYm9hcmRTY3JvbGxlcihyaWdodCwgaWQpO1xuICAgICAgICAgICAgaWYgKGJvYXJkID09PSBuZXh0KSByZXR1cm47XG4gICAgICAgICAgICByZWxlYXNlQm9hcmQ/LigpO1xuICAgICAgICAgICAgYm9hcmQgPSBuZXh0O1xuICAgICAgICAgICAgcmVsZWFzZUJvYXJkID0gYm9hcmQgPyB0aGlzLmxvY2tTY3JvbGwoYm9hcmQpIDogdW5kZWZpbmVkO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXZlYWwgPSAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkgcGFuZS5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdG9yZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghbGlzdC5pc0Nvbm5lY3RlZCB8fCAhcmlnaHQuaXNDb25uZWN0ZWQgfHwgIWxpc3QuY29udGFpbnMoY2FyZCkpIHJldHVybjtcblxuICAgICAgICAgICAgdXBkYXRlQm9hcmQoKTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCk7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQgIT09IGlkICYmIHNlbGVjdGVkICE9PSBsYXN0QXR0ZW1wdCkge1xuICAgICAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIG51bGwpO1xuICAgICAgICAgICAgICAgICh0aXRsZSB8fCBoZWFkZXIpLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgdXBkYXRlQm9hcmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghYm9hcmQ/LmNsaWVudEhlaWdodCB8fCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSAhPT0gaWQgfHxcbiAgICAgICAgICAgICAgICAocGxhY2VBdE93blJhbmsgJiYgIWJvYXJkLnF1ZXJ5U2VsZWN0b3IoJy5sZWFkVGFibGUnKSkpIHJldHVybjtcbiAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIGlkKTtcbiAgICAgICAgICAgIHRoaXMuanVtcFRvKGxpc3QsIGNhcmQpO1xuICAgICAgICAgICAgdGhpcy5qdW1wVG8oYm9hcmQsIHBsYWNlQXRPd25SYW5rID8gdGhpcy5nZXRPd25Sb3coYm9hcmQpIDogbnVsbCwgcGxhY2VBdE93blJhbmspO1xuICAgICAgICAgICAgaWYgKCFwb3NpdGlvbmVkKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICByZXZlYWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb3JyZWN0IGJyb3dzZXItZHJpdmVuIG1vdmVzLCBzdWNoIGFzIHNjcm9sbEludG9WaWV3IG9uIGEgbGVhZGVyYm9hcmQgcm93LCBiZWZvcmUgcGFpbnQuXG4gICAgICAgIGNvbnN0IG9uU2Nyb2xsID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gbGlzdCB8fCBldmVudC50YXJnZXQgPT09IGJvYXJkKSByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGlucHV0RXZlbnRzID0gWydwb2ludGVyZG93bicsICd0b3VjaHN0YXJ0JywgJ3doZWVsJywgJ2NsaWNrJ107XG4gICAgICAgIGNvbnN0IG9uSW5wdXQgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkKSBzdG9wKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0b3BPbktleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmlzVHJ1c3RlZCAmJiBbJ1RhYicsICdBcnJvd1VwJywgJ0Fycm93RG93bicsICdQYWdlVXAnLCAnUGFnZURvd24nLCAnSG9tZScsICdFbmQnLCAnRW50ZXInLCAnICddLmluY2x1ZGVzKGV2ZW50LmtleSkpIHN0b3AoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgYWZ0ZXJMb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0b3AgPSAoZmluaXNoID0gdHJ1ZSkgPT4ge1xuICAgICAgICAgICAgcmVsZWFzZUxpc3QoKTtcbiAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgICAgIHBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25TY3JvbGwsIHRydWUpO1xuICAgICAgICAgICAgICAgIHBhbmUuY2xhc3NMaXN0LnJlbW92ZSgnamFydmlzLWNvbnRlc3QtaW5zdGFudCcsICdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIGlucHV0RXZlbnRzKSBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBvbklucHV0LCB0cnVlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBzdG9wT25LZXksIHRydWUpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBhZnRlckxvYWQpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgIHRoaXMuc3RvcEp1bXAgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZXBvc2l0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucmVzdG9yaW5nQ2FyZCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoZmluaXNoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldmVhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoc3RvcCwgNDAwMCk7XG4gICAgICAgIHRoaXMuc3RvcEp1bXAgPSBzdG9wO1xuICAgICAgICB0aGlzLnJlcG9zaXRpb24gPSByZXN0b3JlO1xuICAgICAgICB0aGlzLnJlc3RvcmluZ0NhcmQgPSBjYXJkO1xuICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgcGFuZS5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCwgeyBwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgaW5wdXRFdmVudHMpIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uSW5wdXQsIHsgcGFzc2l2ZTogdHJ1ZSwgY2FwdHVyZTogdHJ1ZSB9KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHN0b3BPbktleSwgdHJ1ZSk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFmdGVyTG9hZCwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICByZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEnKTtcbiAgICAgICAgY29uc3QgcmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignI2NvbnRlc3RzIC5yaWdodF9wYXJ0Jyk7XG4gICAgICAgIGlmICh0aGlzLmxpc3QgIT09IGxpc3QgfHwgdGhpcy5yaWdodCAhPT0gcmlnaHQpIHRoaXMuc3dpdGNoU2Nyb2xsPy5zdG9wKCk7XG4gICAgICAgIGlmICh0aGlzLnN0b3BKdW1wICYmICh0aGlzLmxpc3QgIT09IGxpc3QgfHwgdGhpcy5yaWdodCAhPT0gcmlnaHQgfHwgIWxpc3Q/LmNvbnRhaW5zKHRoaXMucmVzdG9yaW5nQ2FyZCkpKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BKdW1wKGZhbHNlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0KSB0aGlzLnNob3dMZWFkZXJib2FyZCh0aGlzLnJpZ2h0LCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxpc3QgPSBsaXN0O1xuICAgICAgICB0aGlzLnJpZ2h0ID0gcmlnaHQ7XG4gICAgICAgIGlmICghbGlzdCB8fCAhcmlnaHQgfHwgIWxpc3QuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggfHwgZ2V0Q29tcHV0ZWRTdHlsZShsaXN0KS52aXNpYmlsaXR5ICE9PSAndmlzaWJsZScpIHJldHVybjtcblxuICAgICAgICBjb25zdCBmaW5pc2hlZCA9IG5ldyBTZXQoT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmZpbmlzaGVkIHx8IHt9KVxuICAgICAgICAgICAgLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbCkubWFwKGNvbnRlc3QgPT4gU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCkpKTtcbiAgICAgICAgZm9yIChjb25zdCBlbmRlZCBvZiBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZXN0LmVuZGVkLCAuY29udGVzdF9oZWFkZXIuZW5kZWQnKSkge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBlbmRlZC5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmIChpZCkgZmluaXNoZWQuYWRkKGlkKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb250ZXN0cyA9IHRoaXMuZ2V0Q29udGVzdHMobGlzdCwgZmluaXNoZWQpO1xuICAgICAgICB0aGlzLmNsZWFyRXhwaXJlZFBpbihsaXN0LCBjb250ZXN0cywgZmluaXNoZWQpO1xuICAgICAgICB0aGlzLnVwZGF0ZVBpbnMobGlzdCwgY29udGVzdHMpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlcG9zaXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMucmVwb3NpdGlvbigpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhcnR1cFBlbmRpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuZ2V0VGFyZ2V0KGNvbnRlc3RzKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXQpIHRoaXMub3BlbkNvbnRlc3QobGlzdCwgcmlnaHQsIHRhcmdldCk7XG4gICAgICAgICAgICBlbHNlIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnICYmICF0aGlzLnByZWZlcmVuY2UpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHJpZ2h0LCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSk7XG4gICAgICAgICAgICB0aGlzLnN3aXRjaFNjcm9sbD8ucmVzdG9yZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlU2hvcnRjdXRzKGxpc3QsIHJpZ2h0LCBjb250ZXN0cyk7XG4gICAgfVxuXG4gICAgcnVuKHsgbm9Td2l0Y2hTY3JvbGwgPSBmYWxzZSB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgY29uc3QgcGluID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICB0aGlzLnByZWZlcmVuY2UgPSAoKHR5cGVvZiBwaW4gPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBwaW4gPT09ICdudW1iZXInKSAmJiBwaW4pID8gU3RyaW5nKHBpbikgOiAnJztcbiAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuc3RvcFN3aXRjaFNjcm9sbCA9IG5vU3dpdGNoU2Nyb2xsO1xuICAgICAgICB0aGlzLmRlZmF1bHRzID0gcmVhZENvbnRlc3REZWZhdWx0cygpO1xuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3QgeyBzaWduYWwgfSA9IHRoaXMubGlzdGVuZXJzO1xuICAgICAgICB0aGlzLm9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobXV0YXRpb25zID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEnKTtcbiAgICAgICAgICAgIGNvbnN0IHJpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlc3RzIC5yaWdodF9wYXJ0Jyk7XG4gICAgICAgICAgICBpZiAobGlzdCAhPT0gdGhpcy5saXN0IHx8IHJpZ2h0ICE9PSB0aGlzLnJpZ2h0IHx8IG11dGF0aW9ucy5zb21lKCh7IHRhcmdldCB9KSA9PlxuICAgICAgICAgICAgICAgIChsaXN0ICYmIChsaXN0LmNvbnRhaW5zKHRhcmdldCkgfHwgdGFyZ2V0LmNvbnRhaW5zKGxpc3QpKSkgfHxcbiAgICAgICAgICAgICAgICAocmlnaHQgJiYgKHJpZ2h0LmNvbnRhaW5zKHRhcmdldCkgfHwgdGFyZ2V0LmNvbnRhaW5zKHJpZ2h0KSkpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiB0cnVlLCBzdWJ0cmVlOiB0cnVlLCBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJywgJ3N0eWxlJywgJ2hpZGRlbicsICdpZF9jb250ZXN0J10gfSk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHRoaXMucmVmcmVzaCgpLCB7IG9uY2U6IHRydWUsIHNpZ25hbCB9KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMubGlzdD8uY2xvc2VzdDxIVE1MRWxlbWVudD4oJyNjb250ZXN0cycpO1xuICAgICAgICAgICAgY29uc3QgYmFyID0gY2FudmFzPy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cycpO1xuICAgICAgICAgICAgaWYgKGNhbnZhcyAmJiBiYXIpIHBvc2l0aW9uQ29udGVzdFNob3J0Y3V0cyhjYW52YXMsIGJhcik7XG4gICAgICAgIH0sIHsgc2lnbmFsIH0pO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKCFldmVudC5pc1RydXN0ZWQgfHwgIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KSB8fCAhdGhpcy5yaWdodCB8fCAhdGhpcy5saXN0Py5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBoZWFkZXIgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnLmNvbnRlc3RfaGVhZGVyJyk7XG4gICAgICAgICAgICBpZiAoIWhlYWRlciB8fCBldmVudC50YXJnZXQuY2xvc2VzdCgnLmphcnZpcy1jb250ZXN0LXBpbiwgLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBpZCA9IGhlYWRlci5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIHRoaXMucHJlcGFyZVN3aXRjaCh0aGlzLmxpc3QsIHRoaXMucmlnaHQsIGlkID8/IG51bGwsIHRoaXMuc3RvcFN3aXRjaFNjcm9sbCk7XG4gICAgICAgIH0sIHsgY2FwdHVyZTogdHJ1ZSwgc2lnbmFsIH0pO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxuXG4gICAgdXBkYXRlU3ViU2V0dGluZyhrZXk6IHN0cmluZywgdmFsdWU6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKGtleSAhPT0gJ25vU3dpdGNoU2Nyb2xsJykgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0b3BTd2l0Y2hTY3JvbGwgPSB2YWx1ZTtcbiAgICAgICAgaWYgKCF2YWx1ZSkgdGhpcy5zd2l0Y2hTY3JvbGw/LnN0b3AoKTtcbiAgICB9XG5cbiAgICB0ZWFyRG93bigpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlcj8uZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLmxpc3RlbmVycz8uYWJvcnQoKTtcbiAgICAgICAgdGhpcy5zdG9wSnVtcD8uKCk7XG4gICAgICAgIHRoaXMuc3dpdGNoU2Nyb2xsPy5zdG9wKCk7XG4gICAgICAgIHRoaXMubGVhZGVyYm9hcmRQb3NpdGlvbnMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxpc3Q/LmNsb3Nlc3QoJyNjb250ZXN0cycpPy5xdWVyeVNlbGVjdG9yKCc6c2NvcGUgPiAuamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzJyk/LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLmxpc3Q/LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1waW4sIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JykuZm9yRWFjaChjb250cm9sID0+IGNvbnRyb2wucmVtb3ZlKCkpO1xuICAgICAgICBpZiAodGhpcy5yaWdodCkgdGhpcy5zaG93TGVhZGVyYm9hcmQodGhpcy5yaWdodCwgbnVsbCk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLmhhc1J1biA9IGZhbHNlO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBMZWFndWVUb3AyMCBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdsZWFndWVUb3AyMCdcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQcm9tb3Rpb24gdGFyZ2V0XCIsIFwiU2hvdyB0aGUgcG9pbnRzIG5lZWRlZCB0byByZWFjaCB0aGUgbGFyZ2VyIG9mIHRoZSB0b3AgMjAgb3IgdG9wIDE1JSBiZWxvdyB0aGUgaGlnaGVzdCBsZWFndWUgdGllci5cIilcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWVzLmh0bWwnKTtcbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcuc2NyaXB0TGVhZ3VlSW5mbycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2NyaXB0TGVhZ3VlSW5mbycpO1xuICAgICAgICAgICAgaWYgKCFzdW1tYXJ5IHx8IHN1bW1hcnkucXVlcnlTZWxlY3RvcignLmphcnZpc1RvcDIwJykpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgeyBvcHBvbmVudHNfbGlzdCwgY3VycmVudF90aWVyX251bWJlciwgbWF4X2xlYWd1ZSB9ID0gd2luZG93O1xuICAgICAgICAgICAgY29uc3QgdGllciA9IE51bWJlcihjdXJyZW50X3RpZXJfbnVtYmVyKTtcbiAgICAgICAgICAgIGlmICghKHRpZXIgPiAwICYmIHRpZXIgPCBOdW1iZXIobWF4X2xlYWd1ZSkpKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBoZXJvSWQgPSAod2luZG93LnNoYXJlZD8uSGVybyB8fCB3aW5kb3cuSGVybyk/LmluZm9zPy5pZDtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShvcHBvbmVudHNfbGlzdCkgfHwgaGVyb0lkID09IG51bGwpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgcGxheWVyID0gb3Bwb25lbnRzX2xpc3QuZmluZCgoeyBwbGF5ZXIgfSkgPT4gU3RyaW5nKHBsYXllcj8uaWRfZmlnaHRlcikgPT09IFN0cmluZyhoZXJvSWQpKTtcbiAgICAgICAgICAgIGNvbnN0IHJhbmsgPSBOdW1iZXIocGxheWVyPy5wbGFjZSk7XG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc0ludGVnZXIocmFuaykgfHwgcmFuayA8IDEpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgYnJhY2tldFNpemUgPSBvcHBvbmVudHNfbGlzdC5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBwcm9tb3Rpb25SYW5rID0gTWF0aC5tYXgoMjAsIE1hdGguY2VpbChicmFja2V0U2l6ZSAqIDE1IC8gMTAwKSk7XG4gICAgICAgICAgICBjb25zdCBpblByb21vdGlvbiA9IHJhbmsgPD0gcHJvbW90aW9uUmFuaztcbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmlzb25SYW5rID0gaW5Qcm9tb3Rpb24gPyBwcm9tb3Rpb25SYW5rICsgMSA6IHByb21vdGlvblJhbms7XG4gICAgICAgICAgICBjb25zdCBjdXRvZmYgPSBvcHBvbmVudHNfbGlzdC5maW5kKCh7IHBsYWNlIH0pID0+IE51bWJlcihwbGFjZSkgPT09IGNvbXBhcmlzb25SYW5rKTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXI/LnBsYXllcl9sZWFndWVfcG9pbnRzID09IG51bGwgfHwgY3V0b2ZmPy5wbGF5ZXJfbGVhZ3VlX3BvaW50cyA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHNjb3JlID0gTnVtYmVyKHBsYXllci5wbGF5ZXJfbGVhZ3VlX3BvaW50cyk7XG4gICAgICAgICAgICBjb25zdCBjdXRvZmZTY29yZSA9IE51bWJlcihjdXRvZmYucGxheWVyX2xlYWd1ZV9wb2ludHMpO1xuICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoc2NvcmUpIHx8ICFOdW1iZXIuaXNGaW5pdGUoY3V0b2ZmU2NvcmUpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGZvcm1hdCA9IG5ldyBJbnRsLk51bWJlckZvcm1hdCgpO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gaW5Qcm9tb3Rpb24gPyBjdXRvZmZTY29yZSA6IGN1dG9mZlNjb3JlICsgMTtcbiAgICAgICAgICAgIGNvbnN0IGRpZmZlcmVuY2UgPSBpblByb21vdGlvbiA/IHNjb3JlIC0gdGFyZ2V0IDogdGFyZ2V0IC0gc2NvcmU7XG4gICAgICAgICAgICBjb25zdCBydWxlID0gYFRvcCAke3Byb21vdGlvblJhbmt9IGlzIHRoZSBwcm9tb3Rpb24gdGFyZ2V0LiBUaGUgY3V0b2ZmIGlzIHRoZSBsYXJnZXIgb2YgMjAgcGxhY2VzIG9yIDE1JSBvZiAke2Zvcm1hdC5mb3JtYXQoYnJhY2tldFNpemUpfSBwbGF5ZXJzLCByb3VuZGVkIHVwLmA7XG4gICAgICAgICAgICBjb25zdCBjb21wYXJpc29uID0gaW5Qcm9tb3Rpb25cbiAgICAgICAgICAgICAgICA/IGBSYW5rICR7Y29tcGFyaXNvblJhbmt9IGhhcyAke2Zvcm1hdC5mb3JtYXQodGFyZ2V0KX0gcG9pbnRzLiBZb3VyIGxlYWQgaXMgJHtmb3JtYXQuZm9ybWF0KGRpZmZlcmVuY2UpfSBwb2ludHMuYFxuICAgICAgICAgICAgICAgIDogYFlvdSBuZWVkICR7Zm9ybWF0LmZvcm1hdCh0YXJnZXQpfSBwb2ludHMgdG8gcGFzcyByYW5rICR7Y29tcGFyaXNvblJhbmt9LmA7XG4gICAgICAgICAgICBjb25zdCB0b29sdGlwID0gYCR7cnVsZX0gJHtjb21wYXJpc29ufWA7XG5cbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgZW50cnkuY2xhc3NOYW1lID0gJ2phcnZpc1RvcDIwJztcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCB0b29sdGlwKTtcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgndG9vbHRpcCcsICcnKTtcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHRvb2x0aXApO1xuXG4gICAgICAgICAgICBjb25zdCBiYWRnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIGJhZGdlLmNsYXNzTmFtZSA9ICdzY3JpcHRMZWFndWVJbmZvSWNvbic7XG4gICAgICAgICAgICBiYWRnZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIzM3NjliYSc7XG4gICAgICAgICAgICBiYWRnZS5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICAgICAgICAgIGJhZGdlLnRleHRDb250ZW50ID0gU3RyaW5nKHByb21vdGlvblJhbmspO1xuICAgICAgICAgICAgZW50cnkuYXBwZW5kKGJhZGdlLCBgJHtkaWZmZXJlbmNlID09PSAwID8gJycgOiBpblByb21vdGlvbiA/ICctJyA6ICcrJ30ke2Zvcm1hdC5mb3JtYXQoTWF0aC5hYnMoZGlmZmVyZW5jZSkpfWApO1xuICAgICAgICAgICAgc3VtbWFyeS5pbnNlcnRCZWZvcmUoZW50cnksIHN1bW1hcnkucXVlcnlTZWxlY3RvcignLm1pblRvcDMwLCAucHJvbW90aW9uSW5mbycpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBSZW1vdmVQYXNzTG9jayBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNlbGVjdG9yVG9GaW5kID0gJy5sb2NrX3llbGxvd19pY24nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgY2xhc3NUb1JlbW92ZSA9ICdsb2NrX3llbGxvd19pY24nO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAncmVtb3ZlUGFzc0xvY2snXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlBhc3MgbG9jayBpY29uc1wiLCBcIkhpZGUgbG9jayBpY29ucyBvbiByZXdhcmQgcGFzc2VzIHNvIHRoZSByZXdhcmRzIGFyZSBlYXNpZXIgdG8gcmVhZC5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdwb3YnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlBhdGggb2YgVmFsb3JcIiwgXCJIaWRlIGxvY2sgaWNvbnMgb24gdGhlIFBhdGggb2YgVmFsb3IgcGFzc2VzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAncG9nJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQYXRoIG9mIEdsb3J5XCIsIFwiSGlkZSBsb2NrIGljb25zIG9uIHRoZSBQYXRoIG9mIEdsb3J5IHBhc3Nlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLXZhbG9yLmh0bWwnKSB8fCBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtZ2xvcnkuaHRtbCcpXG4gICAgfVxuXG4gICAgb2JzZXJ2ZVVudGlsKHNlbGVjdG9yOiBzdHJpbmcsIGNhbGxiYWNrOiAoZWxlbWVudHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4pID0+IHZvaWQsIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH0gPSB7fSkge1xuICAgICAgICBsZXQgdGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgICAgICBsZXQgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FsbGJhY2soZWxlbWVudHMpO1xuICAgICAgICAgICAgaWYgKG9uY2UpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAob25jZSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lcikgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZWxlbWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuXG4gICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodGltZW91dCkgJiYgdGltZW91dCA+IDApIHtcbiAgICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3Rvcjogc3RyaW5nLCBjbGFzc1RvUmVtb3ZlOiBzdHJpbmcsIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH0gPSB7fSkge1xuICAgICAgICB0aGlzLm9ic2VydmVVbnRpbChzZWxlY3RvciwgKGVsZW1lbnRzKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGVsID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NUb1JlbW92ZSkpO1xuICAgICAgICB9LCB7IHRpbWVvdXQsIG9uY2UgfSk7XG4gICAgfVxuXG4gICAgcnVuKHsgcG92LCBwb2cgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtdmFsb3IuaHRtbCcpICYmIHBvdikge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZSh0aGlzLnNlbGVjdG9yVG9GaW5kLCB0aGlzLmNsYXNzVG9SZW1vdmUpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi1nbG9yeS5odG1sJykgJiYgcG9nKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKHRoaXMuc2VsZWN0b3JUb0ZpbmQsIHRoaXMuY2xhc3NUb1JlbW92ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEdpcmxEaWN0aW9uYXJ5KCkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmdldEdpcmxEaWN0aW9uYXJ5KCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBsb2FkIHRoZSBISCsrIGdpcmwgZGljdGlvbmFyeTonLCBlcnIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGdldEdpcmxEaWN0aW9uYXJ5IH0gZnJvbSAnLi9nYW1lRGF0YSc7XG5cbmV4cG9ydCBjbGFzcyBMb3ZlUmFpZHNBZGRvbiBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJhcml0eUNvbG9yczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xvdmVSYWlkc0FkZG9uJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMb3ZlIFJhaWRzIGRpc3BsYXlcIiwgXCJDdXN0b21pemUgbmFtZXMsIGljb25zLCBhbmQgcG9zZXMgb24gTG92ZSBSYWlkIGNhcmRzLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ3JhaWRfaWQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlJhaWQgSURzXCIsIFwiQWRkIHRoZSByYWlkIElEIGJlZm9yZSBpdHMgbmFtZS5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICduYW1lcycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiSGlkZGVuIGdpcmwgbmFtZXNcIiwgXCJTaG93IHRoZSBuYW1lIG9uIGNhcmRzIHRoYXQgdXNlIGEgbXlzdGVyaW91cyBnaXJsIGxhYmVsLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnc2tpbicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiU2tpbiBpbmRpY2F0b3JcIiwgXCJNYXJrIGNhcmRzIHRoYXQgaW5jbHVkZSBhIGdpcmwgd2l0aCBhIHNraW4uXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdjb2xvcicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUmFyaXR5IGNvbG9yc1wiLCBcIkNvbG9yIHRoZSByYWlkIG5hbWUgYmFzZWQgb24gdGhlIGdpcmzigJlzIHJhcml0eS5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2ZpZ2h0X2ljb24nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkZpZ2h0IGljb25cIiwgXCJVc2UgdGhlIGNsZWFyZXIgZmlnaHQtZW5lcmd5IGljb24uXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdzaGFkb3dzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJVbnNoYWRvd2VkIHBvc2VzXCIsIFwiU2hvdyB0aGUgbm9ybWFsIGFydHdvcmsgaW4gcGxhY2Ugb2Ygc2hhZG93IHBvc2VzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcblxuICAgICAgICB0aGlzLnJhcml0eUNvbG9ycyA9IHtcbiAgICAgICAgICAgIHJhcmU6ICdMaW1lR3JlZW4nLFxuICAgICAgICAgICAgZXBpYzogJ0dvbGQnLFxuICAgICAgICAgICAgbGVnZW5kYXJ5OiAnTWVkaXVtT3JjaGlkJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbG92ZS1yYWlkcy5odG1sJylcbiAgICB9XG5cbiAgICBhc3luYyBydW4oeyByYWlkX2lkLCBza2luLCBuYW1lcywgY29sb3IsIGZpZ2h0X2ljb24sIHNoYWRvd3MgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGNvbnN0IHJhaWRzID0gKHR5cGVvZiBsb3ZlX3JhaWRzICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KGxvdmVfcmFpZHMpKSA/IGxvdmVfcmFpZHMgOiBbXTtcbiAgICAgICAgaWYgKCFyYWlkcy5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG5cbiAgICAgICAgY29uc3QgZ2lybERpY3QgPSBhd2FpdCBnZXRHaXJsRGljdGlvbmFyeSgpO1xuICAgICAgICBjb25zdCByYWlkc0J5SWQgPSBuZXcgTWFwKHJhaWRzLm1hcChyYWlkID0+IFtTdHJpbmcocmFpZC5pZF9yYWlkKSwgcmFpZF0pKTtcblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucmFpZC1jYXJkW2lkX3JhaWRdJykuZm9yRWFjaChyYWlkQ2FyZCA9PiB7XG4gICAgICAgICAgICBjb25zdCByYWlkID0gcmFpZHNCeUlkLmdldChyYWlkQ2FyZC5nZXRBdHRyaWJ1dGUoJ2lkX3JhaWQnKSA/PyAnJyk7XG4gICAgICAgICAgICBpZiAoIXJhaWQgfHwgcmFpZC5pZF9naXJsID09IG51bGwpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgeyBuYW1lLCByYXJpdHksIHNoYXJkcyA9IDAgfSA9IGdpcmxEaWN0Py5nZXQoU3RyaW5nKHJhaWQuaWRfZ2lybCkpIHx8IHt9O1xuICAgICAgICAgICAgY29uc3QgaGFyZW1MaW5rID0gd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5nZXRIcmVmKGAvY2hhcmFjdGVycy8ke3JhaWQuaWRfZ2lybH1gKTtcbiAgICAgICAgICAgIGNvbnN0IHJhaWROYW1lRWxlbSA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3IoJy5yYWlkLW5hbWUgPiBzcGFuID4gc3BhbicpO1xuICAgICAgICAgICAgY29uc3QgbmFtZV9sYWJlbCA9IChuYW1lcyAmJiBuYW1lKSB8fCByYWlkTmFtZUVsZW0/LnRleHRDb250ZW50Py50cmltKCkgfHwgcmFpZC5ldmVudF9uYW1lIHx8IHJhaWQuZ2lybF9kYXRhPy5uYW1lIHx8ICcnO1xuICAgICAgICAgICAgY29uc3QgcmFpZF9pZF9sYWJlbCA9IHJhaWRfaWQgPyBgKCR7cmFpZC5pZF9yYWlkfSlgIDogJyc7XG4gICAgICAgICAgICBjb25zdCBza2luX2xhYmVsID0gKHNraW4gJiYgQXJyYXkuaXNBcnJheShyYWlkPy5naXJsX2RhdGE/LmdyYWRlX3NraW5zKSAmJiByYWlkLmdpcmxfZGF0YS5ncmFkZV9za2lucy5sZW5ndGggPiAwKSA/ICfwn5GZJyA6ICcnO1xuXG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5UGFydHMgPSBbXTtcbiAgICAgICAgICAgIGlmIChyYWlkX2lkKSBkaXNwbGF5UGFydHMucHVzaChyYWlkX2lkX2xhYmVsKTtcbiAgICAgICAgICAgIGRpc3BsYXlQYXJ0cy5wdXNoKG5hbWVfbGFiZWwpO1xuICAgICAgICAgICAgaWYgKHNraW4pIGRpc3BsYXlQYXJ0cy5wdXNoKHNraW5fbGFiZWwpO1xuICAgICAgICAgICAgY29uc3QgZGlzcGxheUxhYmVsID0gZGlzcGxheVBhcnRzLmpvaW4oJyAnKS50cmltKCk7XG5cbiAgICAgICAgICAgIGlmIChyYWlkTmFtZUVsZW0gJiYgZGlzcGxheUxhYmVsKSB7XG4gICAgICAgICAgICAgICAgcmFpZE5hbWVFbGVtLnRleHRDb250ZW50ID0gZGlzcGxheUxhYmVsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBvYmplY3RpdmVzID0gcmFpZENhcmQucXVlcnlTZWxlY3RvckFsbCgnLmNsYXNzaWMtZ2lybCcpO1xuICAgICAgICAgICAgY29uc3QgZ2lybCA9IG9iamVjdGl2ZXNbMF07XG4gICAgICAgICAgICBpZiAoZ2lybCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdpcmxOYW1lRWxlbSA9IGdpcmwucXVlcnlTZWxlY3RvcignLmdpcmwtbmFtZScpO1xuICAgICAgICAgICAgICAgIGlmIChnaXJsTmFtZUVsZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmsgPSBnaXJsTmFtZUVsZW0ucXVlcnlTZWxlY3RvcignYScpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWxpbmspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rLmNsYXNzTmFtZSA9ICdoaC1naXJsLWxpbmsnO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGdpcmxOYW1lRWxlbS5maXJzdENoaWxkKSBsaW5rLmFwcGVuZENoaWxkKGdpcmxOYW1lRWxlbS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdpcmxOYW1lRWxlbS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZGlzcGxheUxhYmVsKSBsaW5rLnRleHRDb250ZW50ID0gZGlzcGxheUxhYmVsO1xuICAgICAgICAgICAgICAgICAgICBsaW5rLmhyZWYgPSBoYXJlbUxpbms7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHNoYXJkcyA9PT0gMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9iakVsZW0gPSBnaXJsLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcub2JqZWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmpFbGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpFbGVtLmlubmVyVGV4dCA9IGBJJ20gYWxyZWFkeSBhdHRyYWN0ZWQgdG8geW91LiBGaW5kIG1lIGluIHlvdXIgSGFyZW0hYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvbG9yICYmIHJhcml0eSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhaWROYW1lQ29udGFpbmVyID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5yYWlkLW5hbWUnKTtcbiAgICAgICAgICAgICAgICBpZiAocmFpZE5hbWVDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFpZE5hbWVDb250YWluZXIuc3R5bGUuY29sb3IgPSB0aGlzLnJhcml0eUNvbG9yc1tyYXJpdHldIHx8ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZpZ2h0X2ljb24pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWdodEljb24gPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmh1ZEJhdHRsZVB0c19taXhfaWNuJyk7XG4gICAgICAgICAgICAgICAgaWYgKGZpZ2h0SWNvbikge1xuICAgICAgICAgICAgICAgICAgICBmaWdodEljb24uc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybCgvaW1hZ2VzL3BpY3R1cmVzL2Rlc2lnbi9pY19lbmVyZ3lfZmlnaHQucG5nKSc7XG4gICAgICAgICAgICAgICAgICAgIGZpZ2h0SWNvbi5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9ICcyNHB4JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzaGFkb3dzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGVmdEltYWdlID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MSW1hZ2VFbGVtZW50PignLmdpcmwtaW1nLmxlZnQnKTtcbiAgICAgICAgICAgICAgICBpZiAobGVmdEltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlZnRJbWFnZS5zcmMgPSBsZWZ0SW1hZ2Uuc3JjLnJlcGxhY2UoJy1ibGFjaycsICcnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJhaWRDYXJkLmNsYXNzTGlzdC5jb250YWlucygnbXVsdGlwbGUtZ2lybCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0SW1hZ2UgPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxJbWFnZUVsZW1lbnQ+KCcuZ2lybC1pbWcucmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJpZ2h0SW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJpZ2h0SW1hZ2Uuc3JjID0gcmlnaHRJbWFnZS5zcmMucmVwbGFjZSgnYXZiMC5wbmcnLCAnZ3JhZGVfc2tpbnMvZ3JhZGVfc2tpbjEucG5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodEltYWdlLnNyYyA9IHJpZ2h0SW1hZ2Uuc3JjLnJlcGxhY2UoJy1ibGFjaycsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yQWxsKCcuZXllJykuZm9yRWFjaChlID0+IGUucmVtb3ZlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHR5cGUgeyBHaXJsRGF0YSwgTG92ZVJhaWQgfSBmcm9tICcuLi8uLi9nYW1lLXR5cGVzJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCwgbHNSbSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgZ2V0R2lybERpY3Rpb25hcnkgfSBmcm9tICcuL2dhbWVEYXRhJztcblxudHlwZSBSYWlkQ29weUJ1dHRvbiA9IEhUTUxEaXZFbGVtZW50ICYgeyBfYm91bmRDb3B5S2V5SGFuZGxlcj86IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gdm9pZCB9O1xuXG5leHBvcnQgY2xhc3MgTG92ZVJhaWRzUGFyc2VyIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgZ2lybERpY3Q6IFJlYWRvbmx5TWFwPHN0cmluZywgR2lybERhdGE+IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBfYm91bmRJbnNlcnRCdXR0b24/OiAoKSA9PiB2b2lkO1xuXG4gICAgLypcbiAgICAqIFJhaWQgSUQsIEFubm91bmNlbWVudCBUeXBlLCBCYWNrZ3JvdW5kIElELCBFdmVudCBOYW1lLCBTdGFydCBEYXRldGltZSxcbiAgICAqIEVuZCBEYXRldGltZSwgRHVyYXRpb24sIFJhaWQgU3RhdHVzLCBTb3VyY2UsIEdpcmwgSUQsXG4gICAgKiBHaXJsIE5hbWUsIFJhcml0eSwgTWF4IEdyYWRlLCBGaXJzdCBBcHBlYXJhbmNlLCBTb3VyY2UgSUQsXG4gICAgKiBIYXMgU2tpbihzKVxuICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnbG92ZVJhaWRzUGFyc2VyJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMb3ZlIFJhaWRzIGV4cG9ydFwiLCBcIkFkZCBhIGJ1dHRvbiB0byBjb3B5IG5ldyByYWlkcyBpbiBhIHNwcmVhZHNoZWV0LXJlYWR5IGZvcm1hdC5cIilcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sb3ZlLXJhaWRzLmh0bWwnKVxuICAgIH1cblxuICAgIGNhcGl0YWxpemVGaXJzdChzdHI6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyID8gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpIDogc3RyO1xuICAgIH1cblxuICAgIGdldEFubm91bmNlbWVudFR5cGUodHlwZTogTG92ZVJhaWRbJ2lkX2Fubm91bmNlbWVudF90eXBlJ10pIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiBcIkZ1bGxcIjtcbiAgICAgICAgICAgIGNhc2UgMjogcmV0dXJuIFwiUGFydGlhbFwiO1xuICAgICAgICAgICAgY2FzZSAzOiByZXR1cm4gXCJOb25lXCI7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gXCJVbmtub3duXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTb3VyY2VJRChldmVudDogTG92ZVJhaWQpIHtcbiAgICAgICAgY29uc3Qgc291cmNlX2lkID0gTnVtYmVyKGV2ZW50LnJhaWRfbW9kdWxlX3BrKTtcbiAgICAgICAgc3dpdGNoIChldmVudC5yYWlkX21vZHVsZV90eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzZWFzb24nOiByZXR1cm4gMDtcbiAgICAgICAgICAgIGNhc2UgJ2NoYW1waW9uJzogcmV0dXJuIE51bWJlci5pc0Zpbml0ZShzb3VyY2VfaWQpID8gc291cmNlX2lkIDogLTI7XG4gICAgICAgICAgICBjYXNlICd0cm9sbCc6IHJldHVybiBOdW1iZXIuaXNGaW5pdGUoc291cmNlX2lkKSA/IHNvdXJjZV9pZCArIDEwIDogLTI7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnaXJsSGFzU2tpbnMoZXZlbnQ6IExvdmVSYWlkKSB7XG4gICAgICAgIGNvbnN0IGhhc1NraW5zID0gQXJyYXkuaXNBcnJheShldmVudD8uZ2lybF9kYXRhPy5ncmFkZV9za2lucykgJiYgZXZlbnQuZ2lybF9kYXRhLmdyYWRlX3NraW5zLmxlbmd0aCA+IDA7XG4gICAgICAgIGlmIChoYXNTa2lucykge1xuICAgICAgICAgICAgcmV0dXJuIFwiWFwiO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIFwiT1wiO1xuICAgIH1cblxuICAgIGZvcm1hdEV2ZW50Um93KGV2ZW50OiBMb3ZlUmFpZCkge1xuICAgICAgICBjb25zdCBkdXJhdGlvbkhvdXJzID0gTWF0aC5mbG9vcihOdW1iZXIoZXZlbnQuZXZlbnRfZHVyYXRpb25fc2Vjb25kcykgLyAzNjAwKTtcbiAgICAgICAgY29uc3QgZHVyYXRpb24gPSBgJHtkdXJhdGlvbkhvdXJzfSBob3Vyc2A7XG5cbiAgICAgICAgY29uc3QgZ2lybCA9IHRoaXMuZ2lybERpY3Q/LmdldChTdHJpbmcoZXZlbnQuaWRfZ2lybCkpIHx8IHt9O1xuICAgICAgICBjb25zdCB7IG5hbWUgPSAnVW5rbm93bicsIHJhcml0eSA9ICdOL0EnLCBncmFkZSA9IDAgfSA9IGdpcmw7XG5cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGV2ZW50LmlkX3JhaWQsXG4gICAgICAgICAgICB0aGlzLmdldEFubm91bmNlbWVudFR5cGUoZXZlbnQuaWRfYW5ub3VuY2VtZW50X3R5cGUpLFxuICAgICAgICAgICAgZXZlbnQuYmFja2dyb3VuZF9pZCxcbiAgICAgICAgICAgIGV2ZW50LmV2ZW50X25hbWUsXG4gICAgICAgICAgICBldmVudC5zdGFydF9kYXRldGltZSxcbiAgICAgICAgICAgIGV2ZW50LmVuZF9kYXRldGltZSxcbiAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgZXZlbnQuc3RhdHVzLFxuICAgICAgICAgICAgZXZlbnQucmFpZF9tb2R1bGVfdHlwZSxcbiAgICAgICAgICAgIGV2ZW50LmlkX2dpcmwsXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgdGhpcy5jYXBpdGFsaXplRmlyc3QocmFyaXR5KSxcbiAgICAgICAgICAgIGdyYWRlLFxuICAgICAgICAgICAgXCJcIiwgLy8gb25lIGJsYW5rIHRhYiByZXNlcnZlZCBmb3IgZmlyc3QgYXBwZWFyYW5jZSBpbiBHU2hlZXRzXG4gICAgICAgICAgICB0aGlzLmdldFNvdXJjZUlEKGV2ZW50KSxcbiAgICAgICAgICAgIHRoaXMuZ2lybEhhc1NraW5zKGV2ZW50KVxuICAgICAgICBdLmpvaW4oXCJcXHRcIik7XG4gICAgfVxuXG4gICAgYXN5bmMgY29weVRvQ2xpcGJvYXJkKHRleHQ6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NsaXBib2FyZCBBUEkgZmFpbGVkLCB1c2luZyBleGVjQ29tbWFuZCBmYWxsYmFjazonLCBlcnIpO1xuICAgICAgICAgICAgY29uc3QgdGV4dGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xuICAgICAgICAgICAgdGV4dGFyZWEudmFsdWUgPSB0ZXh0O1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG4gICAgICAgICAgICB0ZXh0YXJlYS5zZWxlY3QoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRleHRhcmVhLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgaGFuZGxlQ29weUNsaWNrKGV2dDogTW91c2VFdmVudCkge1xuICAgICAgICBjb25zdCBzdG9yYWdlS2V5ID0gJ0xhc3RTYXZlZFJhaWRJRCc7XG5cbiAgICAgICAgLy8gU2hpZnQgKyBDdHJsICsgQ2xpY2sg4oaSIGNsZWFyIHN0b3JlZCBJRFxuICAgICAgICBpZiAoZXZ0LnNoaWZ0S2V5ICYmIGV2dC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBjb25zdCBjb25maXJtQ2xlYXIgPSBjb25maXJtKCfimqDvuI8gRG8geW91IHdhbnQgdG8gY2xlYXIgdGhlIHNhdmVkIGxhc3QgcmFpZCBJRCBmb3IgdGhpcyBzaXRlPycpO1xuICAgICAgICAgICAgaWYgKGNvbmZpcm1DbGVhcikge1xuICAgICAgICAgICAgICAgIGxzUm0oc3RvcmFnZUtleSk7XG4gICAgICAgICAgICAgICAgYWxlcnQoJ+KchSBMYXN0IHNhdmVkIElEIGNsZWFyZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb2FkIHJhaWRzXG4gICAgICAgIGNvbnN0IGxvY2FsTG92ZVJhaWRzID0gKHR5cGVvZiBsb3ZlX3JhaWRzICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KGxvdmVfcmFpZHMpKSA/IGxvdmVfcmFpZHMgOiBbXTtcbiAgICAgICAgaWYgKCFsb2NhbExvdmVSYWlkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfimqDvuI8gTm8gbG92ZV9yYWlkcyBmb3VuZCBvbiB0aGlzIHBhZ2UuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZ2lybERpY3QpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfimqDvuI8gVGhlIEhIKysgZ2lybCBkaWN0aW9uYXJ5IGNvdWxkIG5vdCBiZSBsb2FkZWQuIFJlbG9hZCB0aGUgcGFnZSBhbmQgdHJ5IGFnYWluLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxhc3RTYXZlZElkTnVtYmVyID0gcGFyc2VJbnQoU3RyaW5nKGxzR2V0KHN0b3JhZ2VLZXkpKSwgMTApO1xuXG4gICAgICAgIC8vIElmIFNoaWZ0IGlzIGhlbGQgT1Igbm8gc2F2ZWQgSUQgZXhpc3RzIOKGkiBhc2sgYWdhaW5cbiAgICAgICAgaWYgKGlzTmFOKGxhc3RTYXZlZElkTnVtYmVyKSB8fCBldnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RTYXZlZElkID0gcHJvbXB0KCdQbGVhc2UgZW50ZXIgdGhlIGxhc3Qgc2F2ZWQgSUQ6Jyk7XG4gICAgICAgICAgICBsYXN0U2F2ZWRJZE51bWJlciA9IHBhcnNlSW50KFN0cmluZyhsYXN0U2F2ZWRJZCksIDEwKTtcblxuICAgICAgICAgICAgaWYgKGlzTmFOKGxhc3RTYXZlZElkTnVtYmVyKSkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCfinYwgSW52YWxpZCBJRCBlbnRlcmVkLiBQbGVhc2UgZW50ZXIgYSB2YWxpZCBudW1iZXIuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlsdGVyIG5ldyBldmVudHNcbiAgICAgICAgY29uc3QgZmlsdGVyZWREYXRhID0gbG9jYWxMb3ZlUmFpZHMuZmlsdGVyKGV2ZW50ID0+IE51bWJlcihldmVudC5pZF9yYWlkKSA+IGxhc3RTYXZlZElkTnVtYmVyKTtcbiAgICAgICAgaWYgKCFmaWx0ZXJlZERhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbGVydChg4oS577iPIE5vIG5ldyBldmVudHMgZm91bmQgd2l0aCBJRCBncmVhdGVyIHRoYW4gJHtsYXN0U2F2ZWRJZE51bWJlcn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZERhdGEgPSBmaWx0ZXJlZERhdGEubWFwKHRoaXMuZm9ybWF0RXZlbnRSb3cuYmluZCh0aGlzKSkuam9pbihcIlxcblwiKTtcblxuICAgICAgICBpZiAoIWF3YWl0IHRoaXMuY29weVRvQ2xpcGJvYXJkKGZvcm1hdHRlZERhdGEpKSB7XG4gICAgICAgICAgICBhbGVydCgn4p2MIENvdWxkIG5vdCBjb3B5IHRoZSByYWlkcy4gVGhlIGxhc3Qgc2F2ZWQgSUQgd2FzIGtlcHQuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTYXZlIGhpZ2hlc3QgSURcbiAgICAgICAgY29uc3QgbWF4SWQgPSBNYXRoLm1heCguLi5maWx0ZXJlZERhdGEubWFwKGUgPT4gTnVtYmVyKGUuaWRfcmFpZCkpKTtcbiAgICAgICAgbHNTZXQoc3RvcmFnZUtleSwgbWF4SWQpO1xuXG4gICAgICAgIGFsZXJ0KCfinIUgRGF0YSBjb3BpZWQgdG8gY2xpcGJvYXJkISBZb3UgY2FuIG5vdyBwYXN0ZSBpdCBpbnRvIEdTaGVldHMuJyk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ29weUJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uOiBSYWlkQ29weUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgncmVtaW5kZXItY29weScpO1xuICAgICAgICBidXR0b24uc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxODBkZWcsICMwMGFhZmYgMCwgIzAwNjY4OCA1MCUsICMwMDU1NzcgNTElLCAjMDBhYWZmIDEwMCUpO1xuICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgd2lkdGg6IDMycHg7XG4gICAgICAgICAgICBoZWlnaHQ6IDMycHg7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogMTBweDtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgIHJpZ2h0OiA0LjVyZW07XG4gICAgICAgICAgICB0b3A6IDAuMnJlbTtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMThweDtcbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAzMnB4O1xuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAwLjJzIGVhc2U7XG4gICAgICAgIGA7XG4gICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5OLJztcbiAgICAgICAgbGV0IGJ1dHRvblRpdGxlID0gJ0NsaWNrID0gY29weSBuZXcgcmFpZHMuIFNoaWZ0IC8gU2hpZnQgKyBDdHJsIGF2YWlsYWJsZS4nO1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCd0b29sdGlwJywgJycpO1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcblxuICAgICAgICBjb25zdCBfYm91bmRDb3B5S2V5SGFuZGxlciA9IChlOiBLZXlib2FyZEV2ZW50KSA9PiB0aGlzLnVwZGF0ZUNvcHlCdXR0b24oZSwgYnV0dG9uKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBfYm91bmRDb3B5S2V5SGFuZGxlcik7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIF9ib3VuZENvcHlLZXlIYW5kbGVyKTtcbiAgICAgICAgLy8gc3RvcmUgaGFuZGxlciByZWZlcmVuY2Ugc28gY2FsbGVycyBjYW4gcmVtb3ZlIGxpc3RlbmVycyBpZiBidXR0b24gaXMgcmVtb3ZlZCBsYXRlclxuICAgICAgICBidXR0b24uX2JvdW5kQ29weUtleUhhbmRsZXIgPSBfYm91bmRDb3B5S2V5SGFuZGxlcjtcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoZSkgPT4gdGhpcy5oYW5kbGVDb3B5Q2xpY2soZSk7XG4gICAgICAgIHRoaXMudXBkYXRlQ29weUJ1dHRvbih7IHNoaWZ0S2V5OiBmYWxzZSwgY3RybEtleTogZmFsc2UgfSwgYnV0dG9uKTtcbiAgICAgICAgcmV0dXJuIGJ1dHRvbjtcbiAgICB9XG5cbiAgICB1cGRhdGVDb3B5QnV0dG9uKGU6IFBpY2s8S2V5Ym9hcmRFdmVudCwgJ3NoaWZ0S2V5JyB8ICdjdHJsS2V5Jz4sIGJ1dHRvbjogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgbGV0IGJ1dHRvblRpdGxlID0gJyc7XG4gICAgICAgIGlmIChlLnNoaWZ0S2V5ICYmIGUuY3RybEtleSkge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmZjY2NjYgMCwgI2FhMDAwMCAxMDAlKVwiOyAvLyByZWRcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5eR77iPJztcbiAgICAgICAgICAgIGJ1dHRvblRpdGxlID0gJ1NoaWZ0ICsgQ3RybCArIENsaWNrID0gY2xlYXIgc2F2ZWQgSUQnO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmZmRkNjYgMCwgI2NjOTkwMCAxMDAlKVwiOyAvLyB5ZWxsb3dcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfinI/vuI8nO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnU2hpZnQgKyBDbGljayA9IHByb21wdCBmb3IgSUQuJztcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICMwMGFhZmYgMCwgIzAwNjY4OCA1MCUsICMwMDU1NzcgNTElLCAjMDBhYWZmIDEwMCUpXCI7IC8vIGRlZmF1bHQgYmx1ZVxuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ/Cfk4snO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnQ2xpY2sgPSBjb3B5IG5ldyByYWlkcy4gU2hpZnQgLyBTaGlmdCArIEN0cmwgYXZhaWxhYmxlLic7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluc2VydEJ1dHRvbigpIHtcbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbi1ub3RpZmljYXRpb24tYWN0aW9uLm5vdGlmX2J1dHRvbl9zJyk7XG4gICAgICAgIGlmIChub3RpZmljYXRpb25CdXR0b24gJiYgIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW1pbmRlci1jb3B5JykpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvcHlCdXR0b24gPSB0aGlzLmNyZWF0ZUNvcHlCdXR0b24oKTtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbkJ1dHRvbi5wYXJlbnROb2RlPy5pbnNlcnRCZWZvcmUoY29weUJ1dHRvbiwgbm90aWZpY2F0aW9uQnV0dG9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgICAgICB0aGlzLmdpcmxEaWN0ID0gYXdhaXQgZ2V0R2lybERpY3Rpb25hcnkoKTtcblxuICAgICAgICB0aGlzLl9ib3VuZEluc2VydEJ1dHRvbiA9IHRoaXMuaW5zZXJ0QnV0dG9uLmJpbmQodGhpcyk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB0aGlzLmluc2VydEJ1dHRvbigpO1xuICAgICAgICBlbHNlIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcy5fYm91bmRJbnNlcnRCdXR0b24sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuZXhwb3J0IGNsYXNzIEFjdGl2aXR5UGFyc2VyIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2FjdGl2aXR5UGFyc2VyJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJNaXNzaW9uIGNvcGllclwiLCBcIkVuYWJsZSB0aGUgY29weSB0b29sIGZvciBsZWdlbmRhcnkgbWlzc2lvbiBkZXRhaWxzLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ21pc3Npb25Db3BpZXInLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkxlZ2VuZGFyeSBkZXRhaWxzXCIsIFwiQ2xpY2sgYSBsZWdlbmRhcnkgbWlzc2lvbuKAmXMgdGl0bGUsIGRlc2NyaXB0aW9uLCBvciBpbWFnZSB0byBjb3B5IGl0LlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9hY3Rpdml0aWVzLmh0bWwnKVxuICAgIH1cblxuICAgIGFzeW5jIGNvcHlUb0NsaXBib2FyZCh0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgIGNvbnN0IHRvYXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvYXN0LnRleHRDb250ZW50ID0gJ0NvcGllZCEnO1xuICAgICAgICB0b2FzdC5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmJvdHRvbSA9ICcxMHB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUucmlnaHQgPSAnMTBweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmJhY2tncm91bmQgPSAncmdiYSgwLDAsMCwwLjcpJztcbiAgICAgICAgdG9hc3Quc3R5bGUuY29sb3IgPSAnd2hpdGUnO1xuICAgICAgICB0b2FzdC5zdHlsZS5wYWRkaW5nID0gJzVweCAxMHB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUuYm9yZGVyUmFkaXVzID0gJzVweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnpJbmRleCA9ICc5OTk5JztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0b2FzdCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdG9hc3QucmVtb3ZlKCksIDEwMDApO1xuICAgIH1cblxuICAgIHJ1bih7IG1pc3Npb25Db3BpZXIgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGlmIChtaXNzaW9uQ29waWVyKSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1pc3Npb25fZW50cnkubGVnZW5kYXJ5Jyk7XG4gICAgICAgICAgICBpZiAoIWVudHJpZXMubGVuZ3RoKSByZXR1cm47XG5cbiAgICAgICAgICAgIGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW1nRGl2ID0gZW50cnkucXVlcnlTZWxlY3RvcjxIVE1MSW1hZ2VFbGVtZW50PignLm1pc3Npb25faW1hZ2UgaW1nJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGVBbGwgPSBlbnRyeS5xdWVyeVNlbGVjdG9yPEhUTUxIZWFkaW5nRWxlbWVudD4oJy5taXNzaW9uX2RldGFpbHMgaDEnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkZXNjID0gZW50cnkucXVlcnlTZWxlY3RvcjxIVE1MUGFyYWdyYXBoRWxlbWVudD4oJy5taXNzaW9uX2RldGFpbHMgcCcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGltZ0Rpdikge1xuICAgICAgICAgICAgICAgICAgICBpbWdEaXYuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICBpbWdEaXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZChpbWdEaXYuc3JjKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlQWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlQWxsLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3V0ZXJUaXRsZSA9IHRpdGxlQWxsLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcuZXZlbnQtbWlzc2lvbi1jb250ZW50LXRleHQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dGVyVGl0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyVGl0bGUuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJUaXRsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQoKG91dGVyVGl0bGUudGV4dENvbnRlbnQgPz8gJycpLnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlQWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ICYmIGUudGFyZ2V0LmNsb3Nlc3QoJy5ldmVudC1taXNzaW9uLWNvbnRlbnQtdGV4dCcpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUNsb25lID0gdGl0bGVBbGwuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxIZWFkaW5nRWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlQ2xvbmUucXVlcnlTZWxlY3RvcignLmV2ZW50LW1pc3Npb24tY29udGVudC10ZXh0Jyk/LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSAodGl0bGVDbG9uZS50ZXh0Q29udGVudCA/PyAnJykudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQodGl0bGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICAgICAgICBkZXNjLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgZGVzYy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKGRlc2MuaW5uZXJUZXh0LnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsICJbe1widmVyc2lvblwiOlwiMC43LjRcIixcImNoYW5nZXNcIjpbXCJTZWUgeW91ciByYW5rIGluIGVhY2ggYWN0aXZlIGNvbnRlc3QgYmVzaWRlIHRoZSBjbG9zZSBidXR0b24gYW5kIHN3aXRjaCBsZWFkZXJib2FyZHMgd2l0aG91dCBtb3ZpbmcgdGhlIGNvbnRlc3QgbGlzdC5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4zXCIsXCJjaGFuZ2VzXCI6W1wiU2VlIGF1dG9tYXRpYyBjaGFuZ2Vsb2dzIG9ubHkgd2hlbiBsb2FkaW5nIHRoZSBob21lcGFnZSBhZnRlciBhbiB1cGRhdGUuXCIsXCJFbmFibGUgU2lsZW50IGNoYW5nZWxvZyB0byBnZXQgYSBOZXcgYnV0dG9uIGJlc2lkZSBISCsrIGFuZCBvcGVuIHRoZSBub3RlcyB3aGVuIHlvdeKAmXJlIHJlYWR5LlwiLFwiS2VlcCB0aGUgY29udGVzdCBsaXN0IGFuZCBlYWNoIGxlYWRlcmJvYXJkIGluIHBsYWNlIHdoZW4gc3dpdGNoaW5nIGNvbnRlc3RzIHdpdGggU3RvcCBzY3JvbGxpbmcgb24gY29udGVzdCBzd2l0Y2hlcy5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4yXCIsXCJjaGFuZ2VzXCI6W1wiT3BlbiB0aGUgYm90dG9tIGFjdGl2ZSBjb250ZXN0IGF0IHlvdXIgcmFuayBieSBkZWZhdWx0LiBDaG9vc2UgQ2JDLCBDQ0MsIG9yIExDIHRvIHByZWZlciB0aGF0IGV2ZW50IHdoZW4gYXZhaWxhYmxlLlwiLFwiVHVybiBvZmYgYXV0b21hdGljIHVwZGF0ZSBub3RpY2VzIHdpdGggRG9u4oCZdCBzaG93IGFnYWluIGluIHRoZSBjaGFuZ2Vsb2cgcG9wdXAuIFZpZXcgY2hhbmdlbG9nIHN0YXlzIGF2YWlsYWJsZSBpbiBzZXR0aW5ncy5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4xXCIsXCJjaGFuZ2VzXCI6W1wiS2VlcCB0aGUgY2hhbmdlbG9nIGNlbnRlcmVkIHdoZW4gdGhlIGdhbWUgd2luZG93IGlzIHJlc2l6ZWQuXCIsXCJDbGVhbiB1cCBzYXZlZCBwbGF5ZXIgbmFtZXMsIGV4cGxhaW4gdW5rbm93biBuYW1lcyBvbiBob3ZlciwgYW5kIGdpdmUgUmVtb3ZlIGJ1dHRvbnMgbW9yZSByb29tLlwiXX0se1widmVyc2lvblwiOlwiMC43LjBcIixcImNoYW5nZXNcIjpbXCJTZWUgd2hhdCBjaGFuZ2VkIGluIEphcnZpcyB0aGUgZmlyc3QgdGltZSBhIG5ldyB2ZXJzaW9uIHJ1bnMuXCIsXCJPcGVuIFZpZXcgY2hhbmdlbG9nIGZyb20gSEgrKyBzZXR0aW5ncyBhdCBhbnkgdGltZSwgZXZlbiB3aXRoIGF1dG9tYXRpYyBub3RpY2VzIHR1cm5lZCBvZmYuXCIsXCJFeHBhbmQgRWFybGllciB2ZXJzaW9ucyB0byByZWFkIHBhc3QgdXBkYXRlcy5cIl19LHtcInZlcnNpb25cIjpcIjAuNi43XCIsXCJjaGFuZ2VzXCI6W1wiTWFrZSBtYXJraW5nIG9uZSBhY3Rpb24gcGVyIHBsYXllciwgYmFja2ZpbGwgbmFtZXMgZm9yIG9sZGVyIG1hcmtzLCB1c2UgdGhlIGJyYWNrZXQtYmFzZWQgcHJvbW90aW9uIHRhcmdldCwgYW5kIHNpbXBsaWZ5IHRoZSBzZWxlY3RlZCBjb250ZXN0IGJ1dHRvbnMgYW5kIHZlcnNpb24gYmFkZ2UuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuNlwiLFwiY2hhbmdlc1wiOltcIkFkZCBzZXR0aW5nIGhlbHAgaW4gSEgrKywgaW1wcm92ZSBtYXJrIGNvbnRyYXN0IGFuZCBtYW5hZ2VtZW50LCBhbmQgYWRkIGF1dG9tYXRpYyBjb250ZXN0IGRlZmF1bHRzLlwiLFwiUmVuYW1lIHRoZSBzZXBhcmF0ZWx5IGluc3RhbGxlZCB0ZXN0aW5nIHVzZXJzY3JpcHQgdG8gRGV2LlwiXX0se1widmVyc2lvblwiOlwiMC42LjVcIixcImNoYW5nZXNcIjpbXCJNb3ZlIHRoZSB1c2Vyc2NyaXB0IHNvdXJjZSBpbnRvIFR5cGVTY3JpcHQgbW9kdWxlcyBhbmQgYWRkIHNlcGFyYXRlIHN0YWJsZSBhbmQgdGVzdGluZyBidWlsZHMuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuNFwiLFwiY2hhbmdlc1wiOltcIlByZXZlbnQgcGlubmVkIGNvbnRlc3Qgc3RhcnR1cCBzY3JvbGxpbmcsIGtlZXAgbmF0aXZlIHN0YXJ0dXAgd2l0aG91dCBhIHBpbiwgYW5kIGNsZWFyIGZpbmlzaGVkIHBpbnNcIl19LHtcInZlcnNpb25cIjpcIjAuNi4zXCIsXCJjaGFuZ2VzXCI6W1wiU3RvcCBib3RoIGNvbnRlc3Qgc3RhcnR1cCBzY3JvbGxzLCBpc29sYXRlIHRoZSBzZWxlY3RlZCBsZWFkZXJib2FyZCwgYW5kIHJlc3RvcmUgcGlubmVkIGNvbnRlc3RzIGF0IFRvcCBvciBNeSByYW5rXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuMlwiLFwiY2hhbmdlc1wiOltcIlBpbiBjb250ZXN0cyBvbiB0aGVpciBjYXJkcywgaGlkZSB0aGUgc3RhcnR1cCBzY3JvbGwsIGFuZCB1c2UgcmlnaHQtY2xpY2sgbWFya2luZyB3aXRoIGlzb2xhdGVkIHNldHRpbmdzIHNjcm9sbGluZ1wiXX0se1widmVyc2lvblwiOlwiMC42LjFcIixcImNoYW5nZXNcIjpbXCJSZWFkIG5hdGl2ZSBNYW5nYSBSUEcgY29udGVzdCB0aXRsZXMgYW5kIHJlY29nbml6ZSBhY3RpdmUgY2FyZHMgd2hlbiBjb250ZXN0IGRhdGEgaXMgdW5hdmFpbGFibGVcIl19LHtcInZlcnNpb25cIjpcIjAuNi4wXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIGEgY29udGVzdCBzdGFydCBwcmVmZXJlbmNlLCBjb250aW51b3VzIG1hcmtpbmcsIGFuZCBjb21wYWN0IHNldHRpbmdzIHdpdGggYSB2ZXJzaW9uIGxhYmVsXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjUuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBsZWFndWUgYW5kIGNvbnRlc3QgcGxheWVyIG1hcmtpbmcgd2l0aCBjdXN0b20gY29sb3JzLCBjb21wYWN0IHNldHRpbmdzLCBhbmQgbGltaXQgVG9wIDIwIHRvIHByb21vdGFibGUgbGVhZ3Vlc1wiXX0se1widmVyc2lvblwiOlwiMC40LjJcIixcImNoYW5nZXNcIjpbXCJGaXggbW9kdWxlIHN0YXJ0dXAsIGxlYWd1ZSBjb250cm9scywgYW5kIHJhaWQgZXhwb3J0czsgYWRkIHRoZSBUb3AgMjAgbGVhZ3VlIHRhcmdldFwiXX0se1widmVyc2lvblwiOlwiMC40LjFcIixcImNoYW5nZXNcIjpbXCJGaXggTG92ZSBSYWlkcyBzaGFkb3dzIHJlcGxhY2VtZW50XCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjQuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBBY3Rpdml0eVBhcnNlciBtb2R1bGVcIl19LHtcInZlcnNpb25cIjpcIjAuMy4xXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIGhhcmVtIGxpbmsgaW5zaWRlIGxvdmUgcmFpZCBjYXJkc1wiXX0se1widmVyc2lvblwiOlwiMC4zLjBcIixcImNoYW5nZXNcIjpbXCJBZGQgTG92ZVJhaWRzQWRkb24gYW5kIExvdmVSYWlkc1BhcnNlciBtb2R1bGVzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjIuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBSZW1vdmVQYXNzTG9jayBtb2R1bGVcIl19LHtcInZlcnNpb25cIjpcIjAuMS4zXCIsXCJjaGFuZ2VzXCI6W1wiQmV0dGVyIGNvZGUgcHJhY3RpY2VzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjEuMlwiLFwiY2hhbmdlc1wiOltcIlBvbGlzaGluZyBhbmQgdXBkYXRlIGxpbmtzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjEuMVwiLFwiY2hhbmdlc1wiOltcIkFkZCBGcmllbmRBbmRGb2VzIG1vZHVsZVwiXX0se1widmVyc2lvblwiOlwiMC4wLjFcIixcImNoYW5nZXNcIjpbXCJJbml0aWFsIHJlbGVhc2VcIl19XSIsICJpbXBvcnQgeyAkIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5cbmludGVyZmFjZSBDaGFuZ2Vsb2dWaWV3IHtcbiAgICBjb250ZW50OiBIVE1MRWxlbWVudDtcbiAgICBjbG9zZUJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gICAgc2hvdWxkT3BlbjogKCkgPT4gYm9vbGVhbjtcbiAgICBvbk9wZW46ICgpID0+IHZvaWQ7XG4gICAgb25DbG9zZTogKCkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dDaGFuZ2Vsb2dQb3B1cCh2aWV3OiBDaGFuZ2Vsb2dWaWV3KSB7XG4gICAgY29uc3QgZGlhbG9nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGlhbG9nJyk7XG4gICAgZGlhbG9nLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY2hhbmdlbG9nLXBvcHVwJztcbiAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsbGVkYnknLCAnamFydmlzLWNoYW5nZWxvZy10aXRsZScpO1xuICAgIGRpYWxvZy5hcHBlbmRDaGlsZCh2aWV3LmNvbnRlbnQpO1xuXG4gICAgY29uc3Qgb3BlbkRpYWxvZyA9ICgpID0+IHtcbiAgICAgICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgICAgICB2aWV3LmNsb3NlQnV0dG9uLmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcbiAgICAgICAgdmlldy5vbk9wZW4oKTtcbiAgICB9O1xuICAgIGNvbnN0IGJpbmRDbG9zZSA9IChkaXNtaXNzOiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXJzID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICBjb25zdCBvcHRpb25zID0geyBzaWduYWw6IGhhbmRsZXJzLnNpZ25hbCB9O1xuICAgICAgICB2aWV3LmNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZGlzbWlzcywgb3B0aW9ucyk7XG4gICAgICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjYW5jZWwnLCBldmVudCA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZGlzbWlzcygpO1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCAhPT0gZGlhbG9nKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBib3VuZHMgPSBkaWFsb2cuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBpZiAoZXZlbnQuY2xpZW50WCA8IGJvdW5kcy5sZWZ0IHx8IGV2ZW50LmNsaWVudFggPiBib3VuZHMucmlnaHQgfHxcbiAgICAgICAgICAgICAgICBldmVudC5jbGllbnRZIDwgYm91bmRzLnRvcCB8fCBldmVudC5jbGllbnRZID4gYm91bmRzLmJvdHRvbSkgZGlzbWlzcygpO1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIGhhbmRsZXJzO1xuICAgIH07XG5cbiAgICBjb25zdCBxdWV1ZSA9IHdpbmRvdy5zaGFyZWQ/LlBvcHVwUXVldWVNYW5hZ2VyO1xuICAgIGNvbnN0IGhvc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29tbW9uLXBvcHVwcycpO1xuICAgIGlmIChob3N0ICYmIHR5cGVvZiBxdWV1ZT8uYWRkID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBxdWV1ZS5jbG9zZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb25zdCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHdyYXBwZXIuY2xhc3NOYW1lID0gJ3BvcHVwX3dyYXBwZXIgamFydmlzLWNoYW5nZWxvZy1uYXRpdmUnO1xuICAgICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgICAgIGxldCBhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgZGlzbWlzcyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghYWN0aXZlKSByZXR1cm47XG4gICAgICAgICAgICBhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHF1ZXVlLmNsb3NlKHsgdHlwZTogJ2NvbW1vbicgfSk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGhhbmRsZXJzID0gYmluZENsb3NlKGRpc21pc3MpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcXVldWUuYWRkKHsgcG9wdXA6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnY29tbW9uJyxcbiAgICAgICAgICAgICAgICBwb3B1cF9uYW1lOiAnamFydmlzX2NoYW5nZWxvZycsXG4gICAgICAgICAgICAgICAgY2xvc2Vfb25fZXNjOiBmYWxzZSwgLy8gVGhlIGRpYWxvZyBoYW5kbGVzIEVzY2FwZSwgc28gdGhlIHF1ZXVlIGlzIGNsb3NlZCBvbmx5IG9uY2UuXG4gICAgICAgICAgICAgICAgJGRvbV9lbGVtZW50OiAkKHdyYXBwZXIpLFxuICAgICAgICAgICAgICAgIGluaXQ6ICgpID0+IGhvc3QuYXBwZW5kQ2hpbGQod3JhcHBlciksXG4gICAgICAgICAgICAgICAgb25PcGVuOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdmlldy5zaG91bGRPcGVuKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTWljcm90YXNrKGRpc21pc3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghd3JhcHBlci5pc0Nvbm5lY3RlZCkgaG9zdC5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcbiAgICAgICAgICAgICAgICAgICAgb3BlbkRpYWxvZygpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnM6ICgpID0+IHt9LFxuICAgICAgICAgICAgICAgIG9uQ2xvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkaWFsb2cub3BlbikgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHZpZXcub25DbG9zZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6ICgpID0+IGhhbmRsZXJzLmFib3J0KCksXG4gICAgICAgICAgICAgICAgZGVzdHJveTogZGlzbWlzc1xuICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBoYW5kbGVycy5hYm9ydCgpO1xuICAgICAgICAgICAgaWYgKGRpYWxvZy5vcGVuKSBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgICAgIHdyYXBwZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3QgdXNlIHRoZSBnYW1lIHBvcHVwIHF1ZXVlOicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXZpZXcuc2hvdWxkT3BlbigpKSB7XG4gICAgICAgIHZpZXcub25DbG9zZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZpbmlzaCA9ICgpID0+IHtcbiAgICAgICAgaGFuZGxlcnMuYWJvcnQoKTtcbiAgICAgICAgZGlhbG9nLnJlbW92ZSgpO1xuICAgICAgICB2aWV3Lm9uQ2xvc2UoKTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZXJzID0gYmluZENsb3NlKCgpID0+IHtcbiAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgIGZpbmlzaCgpO1xuICAgIH0pO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGZpbmlzaCwgeyBzaWduYWw6IGhhbmRsZXJzLnNpZ25hbCB9KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgb3BlbkRpYWxvZygpO1xufVxuIiwgImltcG9ydCByZWxlYXNlTm90ZXMgZnJvbSAnLi4vLi4vLi4vQ0hBTkdFTE9HLm1kJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBISE1vZHVsZSwgdHlwZSBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgc2hvd0NoYW5nZWxvZ1BvcHVwIH0gZnJvbSAnLi9jaGFuZ2Vsb2dQb3B1cCc7XG5cbmNvbnN0IHNlZW5LZXkgPSBgQ2hhbmdlbG9nU2VlbiR7VVNFUlNDUklQVF9DSEFOTkVMfWA7XG5jb25zdCBsYXRlc3RWZXJzaW9uID0gcmVsZWFzZU5vdGVzWzBdLnZlcnNpb247XG5jb25zdCBjb25maWdLZXkgPSAnSkFSVklTX2NoYW5nZWxvZyc7XG5jb25zdCBzZXR0aW5nc0NhcmQgPSBgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmdbcmVsPVwiJHtjb25maWdLZXl9XCJdYDtcblxuZnVuY3Rpb24gcmVhZFNlZW5WZXJzaW9uKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNlZW4gPSBsc0dldChzZWVuS2V5KTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBzZWVuID09PSAnc3RyaW5nJyAmJiAvXlxcZCtcXC5cXGQrXFwuXFxkKyQvLnRlc3Qoc2VlbikgPyBzZWVuIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc05ld2VyKHZlcnNpb246IHN0cmluZywgcHJldmlvdXM6IHN0cmluZyB8IG51bGwpIHtcbiAgICBpZiAoIXByZXZpb3VzKSByZXR1cm4gdHJ1ZTtcblxuICAgIGNvbnN0IG9sZFBhcnRzID0gcHJldmlvdXMuc3BsaXQoJy4nKS5tYXAoTnVtYmVyKTtcbiAgICBjb25zdCBuZXdQYXJ0cyA9IHZlcnNpb24uc3BsaXQoJy4nKS5tYXAoTnVtYmVyKTtcbiAgICBmb3IgKGNvbnN0IFtpbmRleCwgcGFydF0gb2YgbmV3UGFydHMuZW50cmllcygpKSB7XG4gICAgICAgIGlmIChwYXJ0ICE9PSBvbGRQYXJ0c1tpbmRleF0pIHJldHVybiBwYXJ0ID4gb2xkUGFydHNbaW5kZXhdO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHJlbGVhc2VTZWN0aW9uKHJlbGVhc2U6IHR5cGVvZiByZWxlYXNlTm90ZXNbbnVtYmVyXSkge1xuICAgIGNvbnN0IHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgY29uc3QgaGVhZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgaGVhZGluZy50ZXh0Q29udGVudCA9IGB2JHtyZWxlYXNlLnZlcnNpb259YDtcbiAgICBjb25zdCBjaGFuZ2VzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiByZWxlYXNlLmNoYW5nZXMpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgIGl0ZW0udGV4dENvbnRlbnQgPSBjaGFuZ2U7XG4gICAgICAgIGNoYW5nZXMuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gICAgfVxuICAgIHNlY3Rpb24uYXBwZW5kKGhlYWRpbmcsIGNoYW5nZXMpO1xuICAgIHJldHVybiBzZWN0aW9uO1xufVxuXG5leHBvcnQgY2xhc3MgQ2hhbmdlbG9nIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgcGVuZGluZzogJ2F1dG9tYXRpYycgfCAnbWFudWFsJyB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgb3BlbmVyOiBIVE1MQnV0dG9uRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgdmlld2VkVGhpc1BhZ2UgPSBmYWxzZTtcbiAgICBwcml2YXRlIGxvYWRMaXN0ZW5lcjogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzZXR0aW5nc0luc3RhbGxlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgc2lsZW50ID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBub3RpY2U6IEhUTUxCdXR0b25FbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSB3YWl0aW5nRm9yTm90aWNlQW5jaG9yID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdjaGFuZ2Vsb2cnO1xuICAgICAgICBzdXBlcih7IG5hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYToge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscCgnVXBkYXRlIG5vdGljZXMnLCAnU2hvdyB0aGUgY2hhbmdlbG9nIHRoZSBmaXJzdCB0aW1lIHlvdSBsb2FkIHRoZSBob21lcGFnZSBhZnRlciBhbiB1cGRhdGUuIFVzZSBWaWV3IGNoYW5nZWxvZyB0byBvcGVuIGl0IHdoZW5ldmVyIHlvdSBsaWtlLicpLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ3NpbGVudCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKCdTaWxlbnQgY2hhbmdlbG9nJywgJ1B1dCBhIE5ldyBidXR0b24gYmVzaWRlIEhIKysgb24gdGhlIGhvbWVwYWdlIHdoZW4gYW4gdXBkYXRlIGlzIGF2YWlsYWJsZS4gQ2xpY2sgaXQgdG8gcmVhZCB0aGUgY2hhbmdlbG9nLicpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9IH0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlID09PSAnL2hvbWUuaHRtbCc7XG4gICAgfVxuXG4gICAgaW5zdGFsbFNldHRpbmdzKCkge1xuICAgICAgICBpZiAoIXRoaXMuc2hvdWxkUnVuKCkpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXR0aW5nc0luc3RhbGxlZCA9IHRydWU7XG5cbiAgICAgICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZXR0aW5nc0NhcmQsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNldHRpbmdzQ2FyZCk7XG4gICAgICAgICAgICBpZiAoIWNhcmQgfHwgY2FyZC5xdWVyeVNlbGVjdG9yKCcuamFydmlzLXZpZXctY2hhbmdlbG9nJykpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24gamFydmlzLXZpZXctY2hhbmdlbG9nJztcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICdWaWV3IGNoYW5nZWxvZyc7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLm9wZW4oJ21hbnVhbCcsIGJ1dHRvbikpO1xuICAgICAgICAgICAgY2FyZC5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBydW4oeyBzaWxlbnQgPSBmYWxzZSB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHJldHVybjtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnNpbGVudCA9IHNpbGVudDtcbiAgICAgICAgLy8gSEgrKyBjYW4gcnVuIHRoZSBtb2R1bGUgYWdhaW4gd2hlbiB0aGUgdXNlciB0dXJucyBub3RpY2VzIG9uIGluIHRoZSBzZXR0aW5ncyBwYW5lLlxuICAgICAgICBjb25zdCBhbGxvd0F1dG9tYXRpYyA9ICF0aGlzLnNldHRpbmdzSW5zdGFsbGVkO1xuXG4gICAgICAgIGNvbnN0IGNoZWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmhhc1VucmVhZFVwZGF0ZSgpKSByZXR1cm47XG4gICAgICAgICAgICBpZiAodGhpcy5zaWxlbnQpIHRoaXMuc2hvd05vdGljZSgpO1xuICAgICAgICAgICAgZWxzZSBpZiAoYWxsb3dBdXRvbWF0aWMpIHRoaXMub3BlbignYXV0b21hdGljJyk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSBjaGVjaygpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9hZExpc3RlbmVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBjaGVjaywgeyBvbmNlOiB0cnVlLCBzaWduYWw6IHRoaXMubG9hZExpc3RlbmVyLnNpZ25hbCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRlYXJEb3duKCkge1xuICAgICAgICB0aGlzLmxvYWRMaXN0ZW5lcj8uYWJvcnQoKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZW1vdmVOb3RpY2UoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVTdWJTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogYm9vbGVhbikge1xuICAgICAgICBpZiAoa2V5ICE9PSAnc2lsZW50JykgcmV0dXJuO1xuICAgICAgICB0aGlzLnNpbGVudCA9IHZhbHVlO1xuICAgICAgICBpZiAodmFsdWUpIHRoaXMuc2hvd05vdGljZSgpO1xuICAgICAgICBlbHNlIHRoaXMucmVtb3ZlTm90aWNlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYXNVbnJlYWRVcGRhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc1J1biAmJiAhdGhpcy52aWV3ZWRUaGlzUGFnZSAmJiBpc05ld2VyKGxhdGVzdFZlcnNpb24sIHJlYWRTZWVuVmVyc2lvbigpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNob3dOb3RpY2UoKSB7XG4gICAgICAgIGlmICghdGhpcy5zaWxlbnQgfHwgIXRoaXMuaGFzVW5yZWFkVXBkYXRlKCkgfHwgdGhpcy5ub3RpY2UgfHwgdGhpcy53YWl0aW5nRm9yTm90aWNlQW5jaG9yKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSAnLmhoLXBsdXMtcGx1cy1jb25maWctYnV0dG9uJztcbiAgICAgICAgdGhpcy53YWl0aW5nRm9yTm90aWNlQW5jaG9yID0gdHJ1ZTtcbiAgICAgICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy53YWl0aW5nRm9yTm90aWNlQW5jaG9yID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCBhbmNob3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICghYW5jaG9yIHx8ICF0aGlzLnNpbGVudCB8fCAhdGhpcy5oYXNVbnJlYWRVcGRhdGUoKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1jaGFuZ2Vsb2ctbm90aWNlJztcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICdOZXcnO1xuICAgICAgICAgICAgYnV0dG9uLnRpdGxlID0gJ1JlYWQgdGhlIEphcnZpcyBjaGFuZ2Vsb2cnO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdOZXcgSmFydmlzIHVwZGF0ZS4gUmVhZCB0aGUgY2hhbmdlbG9nLicpO1xuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMub3BlbignbWFudWFsJywgYnV0dG9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5ub3RpY2UgPSBhbmNob3IuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVOb3RpY2UoKSB7XG4gICAgICAgIHRoaXMubm90aWNlPy5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5ub3RpY2UgPSBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGlzYWJsZU5vdGljZXMoKSB7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHdpbmRvdy5oaFBsdXNQbHVzQ29uZmlnO1xuICAgICAgICBpZiAoIWNvbmZpZyB8fCAhY29uZmlnLmNvbmZpZ1tjb25maWdLZXldKSByZXR1cm47XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbmZpZy5sb2FkQ29uZmlnKCk7XG4gICAgICAgICAgICBjb25maWcuY29uZmlnW2NvbmZpZ0tleV0gPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbmZpZy5zYXZlQ29uZmlnKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uZmlnLmNvbmZpZ1tjb25maWdLZXldID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCB0dXJuIG9mZiB1cGRhdGUgbm90aWNlczonLCBlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSEgrKyBjcmVhdGVzIGl0cyBzZXR0aW5ncyBwYW5lIGxhemlseSwgc28gdGhlIHBvcHVwIGNhbiBjbG9zZSBiZWZvcmUgdGhlIHBhbmUgZXhpc3RzLlxuICAgICAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZXR0aW5nc0NhcmQpO1xuICAgICAgICBjb25zdCBjaGVja2JveCA9IGNhcmQ/LnF1ZXJ5U2VsZWN0b3I8SFRNTElucHV0RWxlbWVudD4oYGlucHV0W25hbWU9XCIke2NvbmZpZ0tleX1cIl1gKTtcbiAgICAgICAgaWYgKGNoZWNrYm94KSBjaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIGNhcmQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2VuYWJsZWQnKTtcbiAgICAgICAgY29uc3Qgc2lsZW50ID0gY2FyZD8ucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihgaW5wdXRbbmFtZT1cIiR7Y29uZmlnS2V5fV9zaWxlbnRcIl1gKTtcbiAgICAgICAgaWYgKHNpbGVudCkgc2lsZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50ZWFyRG93bigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb3Blbihtb2RlOiAnYXV0b21hdGljJyB8ICdtYW51YWwnLCBvcGVuZXI6IEhUTUxCdXR0b25FbGVtZW50IHwgbnVsbCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNob3VsZFJ1bigpKSByZXR1cm47XG4gICAgICAgIGlmIChtb2RlID09PSAnbWFudWFsJykgdGhpcy5vcGVuZXIgPSBvcGVuZXI7XG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmcpIHtcbiAgICAgICAgICAgIGlmIChtb2RlID09PSAnbWFudWFsJykgdGhpcy5wZW5kaW5nID0gbW9kZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBlbmRpbmcgPSBtb2RlO1xuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzID0gcmVhZFNlZW5WZXJzaW9uKCk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGVudC5jbGFzc05hbWUgPSAnY29udGFpbmVyLXNwZWNpYWwtYmcgamFydmlzLWNoYW5nZWxvZy1jb250ZW50JztcbiAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgICAgICB0aXRsZS5pZCA9ICdqYXJ2aXMtY2hhbmdlbG9nLXRpdGxlJztcbiAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSAnSmFydmlzIGNoYW5nZWxvZyc7XG4gICAgICAgIGNvbnN0IG5vdGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG5vdGVzLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY2hhbmdlbG9nLW5vdGVzJztcbiAgICAgICAgY29uc3QgbmV3UmVsZWFzZXMgPSBwcmV2aW91cyAmJiBpc05ld2VyKGxhdGVzdFZlcnNpb24sIHByZXZpb3VzKVxuICAgICAgICAgICAgPyByZWxlYXNlTm90ZXMuZmlsdGVyKHJlbGVhc2UgPT4gaXNOZXdlcihyZWxlYXNlLnZlcnNpb24sIHByZXZpb3VzKSkubGVuZ3RoXG4gICAgICAgICAgICA6IDE7XG4gICAgICAgIG5vdGVzLmFwcGVuZCguLi5yZWxlYXNlTm90ZXMuc2xpY2UoMCwgbmV3UmVsZWFzZXMpLm1hcChyZWxlYXNlU2VjdGlvbikpO1xuICAgICAgICBjb25zdCBlYXJsaWVyID0gcmVsZWFzZU5vdGVzLnNsaWNlKG5ld1JlbGVhc2VzKTtcbiAgICAgICAgaWYgKGVhcmxpZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBoaXN0b3J5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGV0YWlscycpO1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N1bW1hcnknKTtcbiAgICAgICAgICAgIHN1bW1hcnkudGV4dENvbnRlbnQgPSAnRWFybGllciB2ZXJzaW9ucyc7XG4gICAgICAgICAgICBoaXN0b3J5LmFwcGVuZChzdW1tYXJ5LCAuLi5lYXJsaWVyLm1hcChyZWxlYXNlU2VjdGlvbikpO1xuICAgICAgICAgICAgbm90ZXMuYXBwZW5kQ2hpbGQoaGlzdG9yeSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmb290ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb290ZXInKTtcbiAgICAgICAgY29uc3Qgb3B0T3V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAgICAgb3B0T3V0LmNsYXNzTmFtZSA9ICdqYXJ2aXMtY2hhbmdlbG9nLW9wdC1vdXQnO1xuICAgICAgICBjb25zdCBkb250U2hvd0FnYWluID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgZG9udFNob3dBZ2Fpbi50eXBlID0gJ2NoZWNrYm94JztcbiAgICAgICAgb3B0T3V0LmFwcGVuZChkb250U2hvd0FnYWluLCAnRG9u4oCZdCBzaG93IGFnYWluJyk7XG4gICAgICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNsb3NlQnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgY2xvc2VCdXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgICAgIGNsb3NlQnV0dG9uLnRleHRDb250ZW50ID0gJ0Nsb3NlJztcbiAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uKTtcbiAgICAgICAgY29udGVudC5hcHBlbmQodGl0bGUsIG5vdGVzLCBmb290ZXIpO1xuXG4gICAgICAgIHNob3dDaGFuZ2Vsb2dQb3B1cCh7XG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgY2xvc2VCdXR0b24sXG4gICAgICAgICAgICBzaG91bGRPcGVuOiAoKSA9PiB0aGlzLnBlbmRpbmcgPT09ICdtYW51YWwnIHx8ICghdGhpcy5zaWxlbnQgJiYgdGhpcy5oYXNVbnJlYWRVcGRhdGUoKSksXG4gICAgICAgICAgICBvbk9wZW46ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdlZFRoaXNQYWdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZU5vdGljZSgpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhhc1J1bikgZm9vdGVyLnByZXBlbmQob3B0T3V0KTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNOZXdlcihsYXRlc3RWZXJzaW9uLCByZWFkU2VlblZlcnNpb24oKSkpIGxzU2V0KHNlZW5LZXksIGxhdGVzdFZlcnNpb24pO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB0aGUgdmlld2VkIGNoYW5nZWxvZyB2ZXJzaW9uOicsIGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ2xvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBlbmRpbmcgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChkb250U2hvd0FnYWluLmNoZWNrZWQpIHRoaXMuZGlzYWJsZU5vdGljZXMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5lcj8uZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMub3BlbmVyID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IGluaXRHYW1lIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IGluamVjdFN0eWxlcywgcGFja1NldHRpbmdzIH0gZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBGcmllbmRBbmRGb2VzIH0gZnJvbSAnLi9tb2R1bGVzL3BsYXllcnMvRnJpZW5kQW5kRm9lcyc7XG5pbXBvcnQgeyBhcm1Db250ZXN0U3RhcnR1cEd1YXJkLCBDb250ZXN0U3RhcnQgfSBmcm9tICcuL21vZHVsZXMvY29udGVzdHMvQ29udGVzdFN0YXJ0JztcbmltcG9ydCB7IGluc3RhbGxDb250ZXN0U2V0dGluZ3MgfSBmcm9tICcuL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzJztcbmltcG9ydCB7IExlYWd1ZVRvcDIwIH0gZnJvbSAnLi9tb2R1bGVzL3BsYXllcnMvTGVhZ3VlVG9wMjAnO1xuaW1wb3J0IHsgUmVtb3ZlUGFzc0xvY2sgfSBmcm9tICcuL21vZHVsZXMvcHJvZ3Jlc3Npb24vUmVtb3ZlUGFzc0xvY2snO1xuaW1wb3J0IHsgTG92ZVJhaWRzQWRkb24gfSBmcm9tICcuL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNBZGRvbic7XG5pbXBvcnQgeyBMb3ZlUmFpZHNQYXJzZXIgfSBmcm9tICcuL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNQYXJzZXInO1xuaW1wb3J0IHsgQWN0aXZpdHlQYXJzZXIgfSBmcm9tICcuL21vZHVsZXMvYWN0aXZpdGllcy9BY3Rpdml0eVBhcnNlcic7XG5pbXBvcnQgeyBDaGFuZ2Vsb2cgfSBmcm9tICcuL21vZHVsZXMvdXBkYXRlcy9DaGFuZ2Vsb2cnO1xuXG5hcm1Db250ZXN0U3RhcnR1cEd1YXJkKCk7XG5cbmZ1bmN0aW9uIHJ1bkphcnZpcygpIHtcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBydW5KYXJ2aXMsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgJCB9ID0gd2luZG93O1xuXG4gICAgaWYgKCEkKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJ1bkphcnZpcywgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICBjb25zb2xlLmxvZygnV0FSTklORzogTm8galF1ZXJ5IGZvdW5kLiBFbmRpbmcgc2NyaXB0LicpO1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnSGVsbG8sIFNpciwgSi5BLlIuVi5JLlMuIGlzIHJlYWR5IHRvIGhlbHAgeW91LicpO1xuXG4gICAgaW5pdEdhbWUoJCk7XG4gICAgaW5qZWN0U3R5bGVzKCk7XG5cbiAgICBjb25zdCBmcmllbmRzQW5kRm9lcyA9IG5ldyBGcmllbmRBbmRGb2VzKCk7XG4gICAgY29uc3QgY2hhbmdlbG9nID0gbmV3IENoYW5nZWxvZygpO1xuICAgIGNvbnN0IGFsbE1vZHVsZXMgPSBbXG4gICAgICAgIGZyaWVuZHNBbmRGb2VzLFxuICAgICAgICBuZXcgQ29udGVzdFN0YXJ0KCksXG4gICAgICAgIG5ldyBMZWFndWVUb3AyMCgpLFxuICAgICAgICBuZXcgUmVtb3ZlUGFzc0xvY2soKSxcbiAgICAgICAgbmV3IExvdmVSYWlkc0FkZG9uKCksXG4gICAgICAgIG5ldyBMb3ZlUmFpZHNQYXJzZXIoKSxcbiAgICAgICAgbmV3IEFjdGl2aXR5UGFyc2VyKCksXG4gICAgICAgIGNoYW5nZWxvZ1xuICAgIF1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBydW5TY3JpcHQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGhoUGx1c1BsdXNDb25maWcgfSA9IHdpbmRvd1xuICAgICAgICAgICAgaWYgKCFoaFBsdXNQbHVzQ29uZmlnKSByZXR1cm47XG5cbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJHcm91cCh7XG4gICAgICAgICAgICAgICAga2V5OiAnSkFSVklTJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnSEggSmFydmlzJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGFsbE1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4ge1xuICAgICAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJNb2R1bGUobW9kdWxlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcubG9hZENvbmZpZygpXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJ1bk1vZHVsZXMoKVxuICAgICAgICAgICAgZnJpZW5kc0FuZEZvZXMuaW5zdGFsbFNldHRpbmdzKCk7XG4gICAgICAgICAgICBpbnN0YWxsQ29udGVzdFNldHRpbmdzKCk7XG4gICAgICAgICAgICBjaGFuZ2Vsb2cuaW5zdGFsbFNldHRpbmdzKCk7XG4gICAgICAgICAgICBwYWNrU2V0dGluZ3MoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aW5kb3cuaGhQbHVzUGx1c0NvbmZpZykge1xuICAgICAgICAgICAgcnVuU2NyaXB0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uZSgnaGgrKy1iZHNtOmxvYWRlZCcsIHJ1blNjcmlwdClcbiAgICAgICAgfVxuICAgIH0sIDEpXG59XG5cbnJ1bkphcnZpcygpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFPLE1BQUk7QUFDSixNQUFJO0FBRUosV0FBUyxTQUFTLFFBQXNCO0FBQzNDLFFBQUk7QUFDSixrQkFBYyxPQUFPLFNBQVM7QUFB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QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7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QUEsRUFDSjs7O0FDek9BLHlCQUF1QjtBQUV2QixXQUFTLFlBQVk7QUFDakIsUUFBSSxTQUFTLGVBQWUsV0FBVztBQUNuQyxlQUFTLGlCQUFpQixvQkFBb0IsV0FBVyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQ3ZFO0FBQUEsSUFDSjtBQUVBLFVBQU0sRUFBRSxHQUFBQyxHQUFFLElBQUk7QUFFZCxRQUFJLENBQUNBLElBQUc7QUFDSixVQUFJLFNBQVMsZUFBZSxZQUFZO0FBQ3BDLGVBQU8saUJBQWlCLFFBQVEsV0FBVyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQ3pEO0FBQUEsTUFDSjtBQUNBLGVBQVMsZUFBZSx3QkFBd0IsR0FBRyxPQUFPO0FBQzFELGNBQVEsSUFBSSwwQ0FBMEM7QUFDdEQ7QUFBQSxJQUNKO0FBRUEsWUFBUSxJQUFJLGdEQUFnRDtBQUU1RCxhQUFTQSxFQUFDO0FBQ1YsaUJBQWE7QUFFYixVQUFNLGlCQUFpQixJQUFJLGNBQWM7QUFDekMsVUFBTSxZQUFZLElBQUksVUFBVTtBQUNoQyxVQUFNLGFBQWE7QUFBQSxNQUNmO0FBQUEsTUFDQSxJQUFJLGFBQWE7QUFBQSxNQUNqQixJQUFJLFlBQVk7QUFBQSxNQUNoQixJQUFJLGVBQWU7QUFBQSxNQUNuQixJQUFJLGVBQWU7QUFBQSxNQUNuQixJQUFJLGdCQUFnQjtBQUFBLE1BQ3BCLElBQUksZUFBZTtBQUFBLE1BQ25CO0FBQUEsSUFDSjtBQUVBLGVBQVcsTUFBTTtBQUNiLFlBQU0sWUFBWSxNQUFNO0FBQ3BCLGNBQU0sRUFBRSxpQkFBaUIsSUFBSTtBQUM3QixZQUFJLENBQUMsaUJBQWtCO0FBRXZCLHlCQUFpQixjQUFjO0FBQUEsVUFDM0IsS0FBSztBQUFBLFVBQ0wsTUFBTTtBQUFBLFFBQ1YsQ0FBQztBQUNELG1CQUFXLFFBQVEsWUFBVTtBQUN6QiwyQkFBaUIsZUFBZSxNQUFNO0FBQUEsUUFDMUMsQ0FBQztBQUNELHlCQUFpQixXQUFXO0FBQzVCLHlCQUFpQixXQUFXO0FBQzVCLHVCQUFlLGdCQUFnQjtBQUMvQiwrQkFBdUI7QUFDdkIsa0JBQVUsZ0JBQWdCO0FBQzFCLHFCQUFhO0FBQUEsTUFDakI7QUFFQSxVQUFJLE9BQU8sa0JBQWtCO0FBQ3pCLGtCQUFVO0FBQUEsTUFDZCxPQUFPO0FBQ0gsUUFBQUEsR0FBRSxRQUFRLEVBQUUsSUFBSSxvQkFBb0IsU0FBUztBQUFBLE1BQ2pEO0FBQUEsSUFDSixHQUFHLENBQUM7QUFBQSxFQUNSO0FBRUEsWUFBVTsiLAogICJuYW1lcyI6IFsibWF0Y2hlcyIsICJwbGF5ZXIiLCAiZXJyIiwgImhhbmRsZXJzIiwgIiQiXQp9Cg==
