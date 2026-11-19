// ==UserScript==
// @name           HH J.A.R.V.I.S. (Dev)
// @version        0.7.5
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
.jarvis-changelog-options {
    display: flex;
    flex-wrap: wrap;
    gap: .4em .9em;
    margin-inline-end: auto;
}
.jarvis-changelog-options label {
    display: inline-flex;
    align-items: center;
    gap: .4em;
    cursor: pointer;
}
`;

  // src/settings.ts
  function injectStyles() {
    const style = document.createElement("style");
    style.className = "hh-jarvis-style";
    style.textContent = `${settings_default}
        .hh-plus-plus-config-panel { --jarvis-version: "v${"0.7.5"}"; }
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
    stopSwitchScroll = true;
    switchScroll = null;
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
          label: settingHelp("Stop scrolling on contest switches", "Keep the contest list in place when you switch by clicking a card. The leaderboard opens at your preferred position, and you can still scroll by hand."),
          default: true
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
      if (!list || !right) return;
      const card = list.querySelector(`.contest[id_contest="${CSS.escape(id)}"]`);
      const header = card?.querySelector(".contest_header");
      if (!card || !header || header.matches(".ended") || card.matches(".ended")) return;
      const alreadySelected = this.getSelectedContestId(list, right) === id;
      this.stopJump?.();
      this.prepareSwitch(list, right, id, card);
      if (!alreadySelected) (header.querySelector(CONTEST_TITLE_SELECTOR) || header).click();
      this.refresh();
    }
    prepareSwitch(list, right, id, shortcutCard) {
      this.startupPending = false;
      if (id && (shortcutCard || id !== this.getSelectedContestId(list, right))) this.positionSwitch(list, right, id, shortcutCard);
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
    positionSwitch(list, right, id, shortcutCard) {
      this.switchScroll?.stop();
      const listTop = list.scrollTop;
      const atOwnRank = this.defaults.rank === "mine";
      const releaseList = this.stopSwitchScroll || shortcutCard ? this.lockScroll(list) : void 0;
      let board;
      let releaseBoard;
      const restore = () => {
        const next = this.getLeaderboardScroller(right, id);
        if (next !== board) {
          releaseBoard?.();
          board = next;
          releaseBoard = board ? this.lockScroll(board) : void 0;
        }
        if (shortcutCard && list.contains(shortcutCard)) this.jumpTo(list, shortcutCard);
        else if (releaseList) this.scrollInstantly(list, listTop);
        if (board?.clientHeight && this.getSelectedContestId(list, right) === id) {
          this.jumpTo(board, atOwnRank ? this.getOwnRow(board) : null, atOwnRank);
        }
      };
      const handlers = new AbortController();
      const options = { capture: true, passive: true, signal: handlers.signal };
      const stop = () => {
        clearTimeout(timer);
        handlers.abort();
        releaseList?.();
        releaseBoard?.();
        this.switchScroll = null;
      };
      const timer = setTimeout(stop, 4e3);
      const onScroll = (event) => {
        if (releaseList && event.target === list || event.target === board) restore();
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
    run({ noSwitchScroll = true }) {
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
        this.prepareSwitch(this.list, this.right, id ?? null);
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
  var CHANGELOG_default = [{ version: "0.7.5", changes: ["Keep the homepage responsive after closing the changelog and choose Silent changelog from the popup.", "Stop automatic sidebar scrolling on contest switches by default and use Top or My rank whenever you switch.", "Bring the selected card into view when you use a contest shortcut."] }, { version: "0.7.4", changes: ["See your rank in each active contest beside the close button and switch leaderboards without moving the contest list."] }, { version: "0.7.3", changes: ["See automatic changelogs only when loading the homepage after an update.", "Enable Silent changelog to get a New button beside HH++ and open the notes when you’re ready.", "Keep the contest list and each leaderboard in place when switching contests with Stop scrolling on contest switches."] }, { version: "0.7.2", changes: ["Open the bottom active contest at your rank by default. Choose CbC, CCC, or LC to prefer that event when available.", "Turn off automatic update notices with Don’t show again in the changelog popup. View changelog stays available in settings."] }, { version: "0.7.1", changes: ["Keep the changelog centered when the game window is resized.", "Clean up saved player names, explain unknown names on hover, and give Remove buttons more room."] }, { version: "0.7.0", changes: ["See what changed in Jarvis the first time a new version runs.", "Open View changelog from HH++ settings at any time, even with automatic notices turned off.", "Expand Earlier versions to read past updates."] }, { version: "0.6.7", changes: ["Make marking one action per player, backfill names for older marks, use the bracket-based promotion target, and simplify the selected contest buttons and version badge."] }, { version: "0.6.6", changes: ["Add setting help in HH++, improve mark contrast and management, and add automatic contest defaults.", "Rename the separately installed testing userscript to Dev."] }, { version: "0.6.5", changes: ["Move the userscript source into TypeScript modules and add separate stable and testing builds."] }, { version: "0.6.4", changes: ["Prevent pinned contest startup scrolling, keep native startup without a pin, and clear finished pins"] }, { version: "0.6.3", changes: ["Stop both contest startup scrolls, isolate the selected leaderboard, and restore pinned contests at Top or My rank"] }, { version: "0.6.2", changes: ["Pin contests on their cards, hide the startup scroll, and use right-click marking with isolated settings scrolling"] }, { version: "0.6.1", changes: ["Read native Manga RPG contest titles and recognize active cards when contest data is unavailable"] }, { version: "0.6.0", changes: ["Add a contest start preference, continuous marking, and compact settings with a version label"] }, { version: "0.5.0", changes: ["Add league and contest player marking with custom colors, compact settings, and limit Top 20 to promotable leagues"] }, { version: "0.4.2", changes: ["Fix module startup, league controls, and raid exports; add the Top 20 league target"] }, { version: "0.4.1", changes: ["Fix Love Raids shadows replacement"] }, { version: "0.4.0", changes: ["Add ActivityParser module"] }, { version: "0.3.1", changes: ["Add harem link inside love raid cards"] }, { version: "0.3.0", changes: ["Add LoveRaidsAddon and LoveRaidsParser modules"] }, { version: "0.2.0", changes: ["Add RemovePassLock module"] }, { version: "0.1.3", changes: ["Better code practices"] }, { version: "0.1.2", changes: ["Polishing and update links"] }, { version: "0.1.1", changes: ["Add FriendAndFoes module"] }, { version: "0.0.1", changes: ["Initial release"] }];

  // src/modules/updates/changelogPopup.ts
  function showChangelogPopup(view) {
    if (!view.shouldOpen()) {
      view.onClose();
      return;
    }
    const dialog = document.createElement("dialog");
    dialog.className = "jarvis-changelog-popup";
    dialog.setAttribute("aria-labelledby", "jarvis-changelog-title");
    dialog.appendChild(view.content);
    const dismiss = () => dialog.close();
    view.closeButton.addEventListener("click", dismiss);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      dismiss();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dismiss();
    });
    dialog.addEventListener("close", () => {
      dialog.remove();
      view.onClose();
    }, { once: true });
    document.body.appendChild(dialog);
    try {
      dialog.showModal();
    } catch (err) {
      dialog.remove();
      view.onClose();
      console.warn("Jarvis could not open the changelog:", err);
      return;
    }
    view.closeButton.focus({ preventScroll: true });
    view.onOpen();
  }

  // src/modules/updates/Changelog.ts
  var seenKey = `ChangelogSeen${"Dev"}`;
  var latestVersion = CHANGELOG_default[0].version;
  var configKey = "JARVIS_changelog";
  var silentKey = `${configKey}_silent`;
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
    saveNoticeSetting(key, value) {
      const config = window.hhPlusPlusConfig;
      if (!config) return false;
      let previous = config.config[key];
      try {
        config.loadConfig();
        previous = config.config[key];
        config.config[key] = value;
        config.saveConfig();
      } catch (err) {
        config.config[key] = previous;
        console.warn("Jarvis could not save the update notice preference:", err);
        return false;
      }
      const checkbox = document.querySelector(`${settingsCard} input[name="${key}"]`);
      if (checkbox) checkbox.checked = value;
      return true;
    }
    disableNotices() {
      if (!this.saveNoticeSetting(configKey, false)) return;
      const card = document.querySelector(settingsCard);
      card?.classList.remove("enabled");
      const silent = card?.querySelector(`input[name="${silentKey}"]`);
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
      const options = document.createElement("div");
      options.className = "jarvis-changelog-options";
      const optOut = document.createElement("label");
      const dontShowAgain = document.createElement("input");
      dontShowAgain.type = "checkbox";
      optOut.append(dontShowAgain, "Don’t show again");
      const silentOption = document.createElement("label");
      const useSilent = document.createElement("input");
      useSilent.type = "checkbox";
      useSilent.checked = this.silent;
      silentOption.title = "Show a New button by HH++ for future updates.";
      silentOption.append(useSilent, "Silent changelog");
      dontShowAgain.addEventListener("change", () => useSilent.disabled = dontShowAgain.checked);
      options.append(optOut, silentOption);
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
          if (this.hasRun) footer.prepend(options);
          try {
            if (isNewer(latestVersion, readSeenVersion())) lsSet(seenKey, latestVersion);
          } catch (err) {
            console.warn("Jarvis could not save the viewed changelog version:", err);
          }
        },
        onClose: () => {
          this.pending = null;
          if (dontShowAgain.checked) this.disableNotices();
          else if (this.hasRun && useSilent.checked !== this.silent && this.saveNoticeSetting(silentKey, useSilent.checked)) {
            this.updateSubSetting("silent", useSilent.checked);
          }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzSGVscC50cyIsICJzcmMvc2V0dGluZ3MuY3NzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvSEhNb2R1bGUudHMiLCAic3JjL3N0b3JhZ2UudHMiLCAic3JjL21vZHVsZXMvcGxheWVycy9tYXJrTWFuYWdlci50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0ZyaWVuZEFuZEZvZXMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzLnRzIiwgInNyYy9tb2R1bGVzL2NvbnRlc3RzL2NvbnRlc3RTaG9ydGN1dHMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvQ29udGVzdFN0YXJ0LnRzIiwgInNyYy9tb2R1bGVzL3BsYXllcnMvTGVhZ3VlVG9wMjAudHMiLCAic3JjL21vZHVsZXMvcHJvZ3Jlc3Npb24vUmVtb3ZlUGFzc0xvY2sudHMiLCAic3JjL21vZHVsZXMvbG92ZS1yYWlkcy9nYW1lRGF0YS50cyIsICJzcmMvbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc0FkZG9uLnRzIiwgInNyYy9tb2R1bGVzL2xvdmUtcmFpZHMvTG92ZVJhaWRzUGFyc2VyLnRzIiwgInNyYy9tb2R1bGVzL2FjdGl2aXRpZXMvQWN0aXZpdHlQYXJzZXIudHMiLCAiQ0hBTkdFTE9HLm1kIiwgInNyYy9tb2R1bGVzL3VwZGF0ZXMvY2hhbmdlbG9nUG9wdXAudHMiLCAic3JjL21vZHVsZXMvdXBkYXRlcy9DaGFuZ2Vsb2cudHMiLCAic3JjL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgbGV0ICQ6IEpRdWVyeVN0YXRpYztcbmV4cG9ydCBsZXQgY3VycmVudFBhZ2U6IHN0cmluZztcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRHYW1lKGpRdWVyeTogSlF1ZXJ5U3RhdGljKSB7XG4gICAgJCA9IGpRdWVyeTtcbiAgICBjdXJyZW50UGFnZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gc2V0dGluZ0hlbHAobGFiZWw6IHN0cmluZywgZGVzY3JpcHRpb246IHN0cmluZykge1xuICAgIGNvbnN0IGVzY2FwZSA9ICh0ZXh0OiBzdHJpbmcpID0+IHRleHQucmVwbGFjZUFsbCgnJicsICcmYW1wOycpLnJlcGxhY2VBbGwoJ1wiJywgJyZxdW90OycpXG4gICAgICAgIC5yZXBsYWNlQWxsKCc8JywgJyZsdDsnKS5yZXBsYWNlQWxsKCc+JywgJyZndDsnKTtcbiAgICByZXR1cm4gZXNjYXBlKGxhYmVsKSArICcgPHNwYW4gY2xhc3M9XCJpcm9ubWFuLXNldHRpbmctaGVscFwiIHJvbGU9XCJidXR0b25cIiB0YWJpbmRleD1cIjBcIiBhcmlhLWxhYmVsPVwiQWJvdXQgJyArXG4gICAgICAgIGVzY2FwZShsYWJlbCkgKyAnXCIgZGF0YS1zZXR0aW5nLWhlbHA9XCInICsgZXNjYXBlKGRlc2NyaXB0aW9uKSArICdcIj4/PC9zcGFuPic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3VudFNldHRpbmdzSGVscChwYW5lbDogSFRNTEVsZW1lbnQsIHRvb2x0aXBJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgdG9vbHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRvb2x0aXAuaWQgPSB0b29sdGlwSWQ7XG4gICAgdG9vbHRpcC5jbGFzc05hbWUgPSAnaXJvbm1hbi1zZXR0aW5nLXRvb2x0aXAnO1xuICAgIHRvb2x0aXAuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3Rvb2x0aXAnKTtcbiAgICBjb25zdCBwb3BvdmVyID0gdHlwZW9mIHRvb2x0aXAuc2hvd1BvcG92ZXIgPT09ICdmdW5jdGlvbic7XG4gICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuc2V0QXR0cmlidXRlKCdwb3BvdmVyJywgJ21hbnVhbCcpO1xuICAgIGVsc2UgdG9vbHRpcC5oaWRkZW4gPSB0cnVlO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodG9vbHRpcCk7XG5cbiAgICBsZXQgYW5jaG9yOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IGdldEhlbHAgPSAodGFyZ2V0OiBFdmVudFRhcmdldCB8IG51bGwpID0+XG4gICAgICAgIHRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgPyB0YXJnZXQuY2xvc2VzdDxIVE1MRWxlbWVudD4oJ1tkYXRhLXNldHRpbmctaGVscF0nKSA6IG51bGw7XG4gICAgY29uc3QgY2xvc2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICghYW5jaG9yKSByZXR1cm47XG4gICAgICAgIGFuY2hvci5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKTtcbiAgICAgICAgYW5jaG9yID0gbnVsbDtcbiAgICAgICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuaGlkZVBvcG92ZXIoKTtcbiAgICAgICAgZWxzZSB0b29sdGlwLmhpZGRlbiA9IHRydWU7XG4gICAgfTtcbiAgICBjb25zdCBzaG93ID0gKGhlbHA6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgIGlmIChhbmNob3IgPT09IGhlbHApIHJldHVybjtcbiAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgYW5jaG9yID0gaGVscDtcbiAgICAgICAgaGVscC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCB0b29sdGlwSWQpO1xuICAgICAgICB0b29sdGlwLnRleHRDb250ZW50ID0gaGVscC5kYXRhc2V0LnNldHRpbmdIZWxwID8/ICcnO1xuICAgICAgICBpZiAocG9wb3ZlcikgdG9vbHRpcC5zaG93UG9wb3ZlcigpO1xuICAgICAgICBlbHNlIHRvb2x0aXAuaGlkZGVuID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gaGVscC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgeyBvZmZzZXRXaWR0aCwgb2Zmc2V0SGVpZ2h0IH0gPSB0b29sdGlwO1xuICAgICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSBNYXRoLm1heCg4LCBNYXRoLm1pbihib3VuZHMubGVmdCwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIC0gb2Zmc2V0V2lkdGggLSA4KSkgKyAncHgnO1xuICAgICAgICBjb25zdCBiZWxvdyA9IGJvdW5kcy5ib3R0b20gKyA2O1xuICAgICAgICB0b29sdGlwLnN0eWxlLnRvcCA9IChiZWxvdyArIG9mZnNldEhlaWdodCA8PSB3aW5kb3cuaW5uZXJIZWlnaHQgLSA4XG4gICAgICAgICAgICA/IGJlbG93IDogTWF0aC5tYXgoOCwgYm91bmRzLnRvcCAtIG9mZnNldEhlaWdodCAtIDYpKSArICdweCc7XG4gICAgfTtcblxuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJvdmVyJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCAmJiBldmVudC5wb2ludGVyVHlwZSAhPT0gJ3RvdWNoJykgc2hvdyhoZWxwKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyb3V0JywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCA9PT0gYW5jaG9yICYmIGhlbHAgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gaGVscCkgY2xvc2UoKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1c2luJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCkgc2hvdyhoZWxwKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGdldEhlbHAoZXZlbnQudGFyZ2V0KSA9PT0gYW5jaG9yKSBjbG9zZSgpO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoIWhlbHApIHJldHVybjtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgJiYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJyB8fCBldmVudC5rZXkgPT09ICcgJykpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHNob3coaGVscCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYW5jaG9yICYmIGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZ2V0SGVscChldmVudC50YXJnZXQpICE9PSBhbmNob3IpIGNsb3NlKCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgY2xvc2UsIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbn1cbiIsICIuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5wYW5lbC1jb250ZW50cyB7XG4gICAgYWxpZ24tY29udGVudDogc3RhcnQ7XG4gICAgYWxpZ24taXRlbXM6IHN0YXJ0O1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgb3ZlcnNjcm9sbC1iZWhhdmlvcjogY29udGFpbjtcbiAgICBzY3JvbGxiYXItd2lkdGg6IHRoaW47XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbDpoYXMoPiAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdLnNob3duKSB7XG4gICAgb3ZlcmZsb3c6IGNsaXA7XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZy5oYXMtc3Vic2V0dGluZ3Mge1xuICAgIGdyaWQtcm93LWVuZDogYXV0bztcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1wYWNrZWQtc2V0dGluZ3Mge1xuICAgIGdyaWQtYXV0by1mbG93OiByb3cgZGVuc2U7XG4gICAgZ3JpZC1hdXRvLXJvd3M6IDFweDtcbiAgICByb3ctZ2FwOiAwO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuamFydmlzLXBhY2tlZC1zZXR0aW5ncyAuY29uZmlnLXNldHRpbmcge1xuICAgIGdyaWQtcm93LWVuZDogc3BhbiB2YXIoLS1qYXJ2aXMtc2V0dGluZy1yb3dzLCAxKTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC50YWJzIGg0W3JlbD1cIkpBUlZJU1wiXSB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLnRhYnMgaDRbcmVsPVwiSkFSVklTXCJdLnNlbGVjdGVkOjphZnRlciB7XG4gICAgY29udGVudDogdmFyKC0tamFydmlzLXZlcnNpb24pO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBpbnNldC1ibG9jay1zdGFydDogMDtcbiAgICBpbnNldC1pbmxpbmUtZW5kOiAuMTVyZW07XG4gICAgZm9udC1zaXplOiAuNjI1cmVtO1xuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4uaXJvbm1hbi1zZXR0aW5nLWhlbHAge1xuICAgIGRpc3BsYXk6IGlubGluZS1ncmlkO1xuICAgIHBsYWNlLWl0ZW1zOiBjZW50ZXI7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBpbmxpbmUtc2l6ZTogMS4yNWVtO1xuICAgIGJsb2NrLXNpemU6IDEuMjVlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgIGZvbnQtc2l6ZTogLjhlbTtcbiAgICBsaW5lLWhlaWdodDogMTtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogLjA4ZW07XG4gICAgY3Vyc29yOiBoZWxwO1xufVxuLmlyb25tYW4tc2V0dGluZy1oZWxwOmhvdmVyLFxuLmlyb25tYW4tc2V0dGluZy1oZWxwOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbi5pcm9ubWFuLXNldHRpbmctdG9vbHRpcCB7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIGluc2V0OiBhdXRvO1xuICAgIHotaW5kZXg6IDEwMDEwO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgbWF4LXdpZHRoOiBtaW4oMThyZW0sIGNhbGMoMTAwdncgLSAxNnB4KSk7XG4gICAgbWFyZ2luOiAwO1xuICAgIHBhZGRpbmc6IC41ZW0gLjdlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40ZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogMTRweC8xLjQgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuamFydmlzLW1hcmstY29sb3IgaW5wdXQge1xuICAgIHdpZHRoOiAzMHB4O1xuICAgIGhlaWdodDogMjBweDtcbiAgICBmbGV4OiBub25lO1xuICAgIHBhZGRpbmc6IDA7XG59XG5idXR0b24uamFydmlzLWNvbnRlc3QtcGluIHtcbiAgICBhbGw6IHVuc2V0O1xuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICBtYXJnaW4taW5saW5lLXN0YXJ0OiAuMzVlbTtcbiAgICBwYWRkaW5nLWlubGluZTogLjJlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250LXNpemU6IC45ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jb250ZXN0LXBpbjo6YmVmb3JlIHtcbiAgICBjb250ZW50OiAn4piGJztcbn1cbi5qYXJ2aXMtY29udGVzdC1waW5bYXJpYS1wcmVzc2VkPVwidHJ1ZVwiXTo6YmVmb3JlIHtcbiAgICBjb250ZW50OiAn4piFJztcbiAgICBjb2xvcjogI2ZmZDM2Yjtcbn1cbi5qYXJ2aXMtY29udGVzdC1waW46Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgIHdpZHRoOiBmaXQtY29udGVudDtcbiAgICBnYXA6IC4xMmVtO1xuICAgIHBhZGRpbmc6IC4xMmVtO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgNTUlLCB0cmFuc3BhcmVudCk7XG4gICAgYm9yZGVyLXJhZGl1czogLjQ1ZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgbGluZS1oZWlnaHQ6IDEuMTU7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIGJ1dHRvbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBwYWRkaW5nOiAuMThlbSAuMzhlbTtcbiAgICBib3JkZXItcmFkaXVzOiAuMjZlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGxpbmUtaGVpZ2h0OiBpbmhlcml0O1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b25bYXJpYS1wcmVzc2VkPVwidHJ1ZVwiXSB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAyMiUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDE1JSwgdHJhbnNwYXJlbnQpO1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b246Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0IHtcbiAgICBtYXJnaW4taW5saW5lLXN0YXJ0OiAuMjhlbTtcbiAgICBmb250LXNpemU6IC43ZW07XG4gICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5ncyB7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBnYXA6IC4zZW07XG4gICAgbWluLXdpZHRoOiAwO1xuICAgIG1hcmdpbjogLjQ1ZW0gMCAwO1xuICAgIHBhZGRpbmc6IDA7XG4gICAgYm9yZGVyOiAwO1xuICAgIGZvbnQtc2l6ZTogLjg1ZW07XG59XG4uamFydmlzLWNvbnRlc3Qtc2V0dGluZ3MgLmphcnZpcy1jb250ZXN0LWNob2ljZSB7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBtYXgtd2lkdGg6IDEwMCU7XG4gICAgZmxleC13cmFwOiB3cmFwO1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzIFtoaWRkZW5dIHtcbiAgICBkaXNwbGF5OiBub25lO1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzOmRpc2FibGVkIC5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIG9wYWNpdHk6IC41O1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzOmRpc2FibGVkIGJ1dHRvbiB7XG4gICAgY3Vyc29yOiBkZWZhdWx0O1xufVxuLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cyB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGluc2V0LWJsb2NrLXN0YXJ0OiAxLjNyZW07XG4gICAgaW5zZXQtaW5saW5lLWVuZDogM3JlbTtcbiAgICB6LWluZGV4OiAxMDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiAuM2VtO1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTAlKTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMgYnV0dG9uIHtcbiAgICBhbGw6IHVuc2V0O1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBwbGFjZS1jb250ZW50OiBjZW50ZXI7XG4gICAgZ2FwOiAuMTVlbTtcbiAgICBtaW4taW5saW5lLXNpemU6IDIuODVlbTtcbiAgICBwYWRkaW5nOiAuMjhlbSAuNDVlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDQwJSwgdHJhbnNwYXJlbnQpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40ZW07XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAxMCUsIHRyYW5zcGFyZW50KTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGZvbnQtc2l6ZTogLjllbTtcbiAgICBsaW5lLWhlaWdodDogMTtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzIGJ1dHRvbiBzcGFuIHtcbiAgICBmb250LXNpemU6IC43NWVtO1xufVxuLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cyBidXR0b246aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMTglLCB0cmFuc3BhcmVudCk7XG59XG4uamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzIGJ1dHRvblthcmlhLXByZXNzZWQ9XCJ0cnVlXCJdIHtcbiAgICBiYWNrZ3JvdW5kOiBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDI3JSwgdHJhbnNwYXJlbnQpO1xufVxuLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cyBidXR0b246Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMnB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbiAgICBvdXRsaW5lLW9mZnNldDogMnB4O1xufVxuLmphcnZpcy1tYXJrLW1lbnUge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB6LWluZGV4OiAxMDAwMDtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdhcDogMnB4O1xuICAgIHBhZGRpbmc6IDRweDtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjODk5NGE3O1xuICAgIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgICBiYWNrZ3JvdW5kOiAjMjMyOTM2O1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGJveC1zaGFkb3c6IDAgMnB4IDEwcHggIzAwMDg7XG4gICAgZm9udDogMTNweC8xLjM1IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbn1cbi5qYXJ2aXMtbWFyay1tZW51IGJ1dHRvbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBwYWRkaW5nOiA0cHggOXB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLW1hcmstbWVudSBidXR0b246aG92ZXIsXG4uamFydmlzLW1hcmstbWVudSBidXR0b246Zm9jdXMtdmlzaWJsZSB7XG4gICAgYmFja2dyb3VuZDogIzQxNGQ2NDtcbn1cbiNjb250ZXN0cyAubGVmdF9wYXJ0IC5zY3JvbGxfYXJlYS5qYXJ2aXMtY29udGVzdC1pbnN0YW50LFxuI2NvbnRlc3RzIC5yaWdodF9wYXJ0LmphcnZpcy1jb250ZXN0LWluc3RhbnQgLmxlYWRfdGFibGVfdmlldyB7XG4gICAgc2Nyb2xsLWJlaGF2aW9yOiBhdXRvICFpbXBvcnRhbnQ7XG4gICAgb3ZlcmZsb3ctYW5jaG9yOiBub25lICFpbXBvcnRhbnQ7XG59XG4jY29udGVzdHMgLmphcnZpcy1jb250ZXN0LWxvYWRpbmcge1xuICAgIG9wYWNpdHk6IDAgIWltcG9ydGFudDtcbiAgICB0cmFuc2l0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4jY29udGVzdHMgLnJpZ2h0X3BhcnQgLnJhbmtpbmdbaWRfY29udGVzdF0uamFydmlzLWNvbnRlc3Qtb3RoZXIge1xuICAgIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrPVwiZnJpZW5kXCJdIHtcbiAgICBjb2xvcjogdmFyKC0tamFydmlzLWZyaWVuZC1jb2xvcikgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrPVwiZm9lXCJdIHtcbiAgICBjb2xvcjogdmFyKC0tamFydmlzLWZvZS1jb2xvcikgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrXSxcbnRkW2RhdGEtamFydmlzLW1hcmtdID4gYSB7XG4gICAgdGV4dC1zaGFkb3c6IDFweCAwICMxMTE4MjcsIC0xcHggMCAjMTExODI3LCAwIDFweCAjMTExODI3LCAwIC0xcHggIzExMTgyNyAhaW1wb3J0YW50O1xufVxudGRbZGF0YS1qYXJ2aXMtbWFya10gPiBhIHtcbiAgICBjb2xvcjogaW5oZXJpdCAhaW1wb3J0YW50O1xufVxuLmphcnZpcy1zZXR0aW5nLWFjdGlvbiB7XG4gICAgYXBwZWFyYW5jZTogbm9uZTtcbiAgICBwYWRkaW5nOiAuMmVtIC41ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIGJvcmRlci1yYWRpdXM6IC4zNWVtO1xuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIGZvbnQ6IGluaGVyaXQ7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1zZXR0aW5nLWFjdGlvbjpob3Zlcixcbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246Zm9jdXMtdmlzaWJsZSB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAxNiUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246ZGlzYWJsZWQge1xuICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICBvcGFjaXR5OiAuNTtcbn1cbi5qYXJ2aXMtbWFyay1zZXR0aW5nLWFjdGlvbnMsXG4uamFydmlzLW1hcmstYWN0aW9ucyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgZ2FwOiAuNGVtO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXIge1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgd2lkdGg6IG1pbigzNHJlbSwgY2FsYygxMDB2dyAtIDJyZW0pKTtcbiAgICBtYXgtaGVpZ2h0OiBjYWxjKDEwMHZoIC0gMnJlbSk7XG4gICAgcGFkZGluZzogMXJlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC42NXJlbTtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jb25maWctc2V0dGluZy1iYWNrZ3JvdW5kLCAjMjQxZTMwKTtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBmb250OiAxNXB4LzEuMzUgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXI6OmJhY2tkcm9wIHtcbiAgICBiYWNrZ3JvdW5kOiAjMDgwYjEyYWE7XG59XG4uamFydmlzLW1hcmstbWFuYWdlciBoMixcbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIGgzLFxuLmphcnZpcy1tYXJrLW1hbmFnZXIgcCB7XG4gICAgbWFyZ2luOiAwO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIHtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgobWluKDEzcmVtLCAxMDAlKSwgMWZyKSk7XG4gICAgZ2FwOiAuOXJlbTtcbiAgICBtYXgtaGVpZ2h0OiA1MHZoO1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgc2Nyb2xsYmFyLWd1dHRlcjogc3RhYmxlO1xuICAgIHBhZGRpbmctaW5saW5lLWVuZDogLjdyZW07XG4gICAgbWFyZ2luLWJsb2NrOiAuOXJlbTtcbn1cbi5qYXJ2aXMtbWFyay1saXN0cyB1bCB7XG4gICAgbWFyZ2luOiAuM2VtIDAgMDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XG59XG4uamFydmlzLW1hcmstbGlzdHMgbGkge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgZ2FwOiAuNDVlbTtcbiAgICBwYWRkaW5nOiAuMmVtIDA7XG4gICAgb3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XG59XG4uamFydmlzLW1hcmstbGlzdHMgbGkgYnV0dG9uIHtcbiAgICBmbGV4OiBub25lO1xufVxuLmphcnZpcy1tYXJrLWFjdGlvbnMge1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2Vlbjtcbn1cbi5qYXJ2aXMtdmlldy1jaGFuZ2Vsb2cge1xuICAgIG1hcmdpbi10b3A6IC40NWVtO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctYnV0dG9uID4gLmphcnZpcy1jaGFuZ2Vsb2ctbm90aWNlIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgaW5zZXQtaW5saW5lLWVuZDogY2FsYygxMDAlICsgLjM1ZW0pO1xuICAgIHRvcDogNTAlO1xuICAgIHRyYW5zbGF0ZTogMCAtNTAlO1xuICAgIGhlaWdodDogNjQlO1xuICAgIHBhZGRpbmc6IDAgLjQ1ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNDVlbTtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jb25maWctc2V0dGluZy1iYWNrZ3JvdW5kLCAjMjQxZTMwKTtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBmb250OiA2MDAgLjc1cmVtLzEgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGljZTpob3ZlciB7XG4gICAgZmlsdGVyOiBicmlnaHRuZXNzKDEuMik7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RpY2U6Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMnB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbiAgICBvdXRsaW5lLW9mZnNldDogMnB4O1xufVxuZGlhbG9nLmphcnZpcy1jaGFuZ2Vsb2ctcG9wdXAge1xuICAgIC0tamFydmlzLWNoYW5nZWxvZy1oZWlnaHQ6IG1pbigzMnJlbSwgY2FsYygxMDB2aCAtIDEuMjVyZW0pKTtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICBpbnNldDogMDtcbiAgICB3aWR0aDogbWluKDM3cmVtLCBjYWxjKDEwMCUgLSAxLjI1cmVtKSk7XG4gICAgaGVpZ2h0OiBmaXQtY29udGVudDtcbiAgICBtYXgtaGVpZ2h0OiB2YXIoLS1qYXJ2aXMtY2hhbmdlbG9nLWhlaWdodCk7XG4gICAgbWFyZ2luOiBhdXRvO1xuICAgIHBhZGRpbmc6IDA7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC42cmVtO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWNvbmZpZy1zZXR0aW5nLWJhY2tncm91bmQsICMyNDFlMzApO1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGZvbnQ6IDE1cHgvMS40NSBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7XG4gICAgdGV4dC1hbGlnbjogc3RhcnQ7XG59XG5Ac3VwcG9ydHMgKGhlaWdodDogMTAwZHZoKSB7XG4gICAgZGlhbG9nLmphcnZpcy1jaGFuZ2Vsb2ctcG9wdXAge1xuICAgICAgICAtLWphcnZpcy1jaGFuZ2Vsb2ctaGVpZ2h0OiBtaW4oMzJyZW0sIGNhbGMoMTAwZHZoIC0gMS4yNXJlbSkpO1xuICAgIH1cbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLXBvcHVwOjpiYWNrZHJvcCB7XG4gICAgYmFja2dyb3VuZDogIzA4MGIxMmFhO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCB7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtcm93czogYXV0byBtaW5tYXgoMCwgMWZyKSBhdXRvO1xuICAgIGdhcDogY2xhbXAoLjQ1cmVtLCAydncsIC45cmVtKTtcbiAgICBtYXgtaGVpZ2h0OiBjYWxjKHZhcigtLWphcnZpcy1jaGFuZ2Vsb2ctaGVpZ2h0KSAtIDJweCk7XG4gICAgcGFkZGluZzogY2xhbXAoLjZyZW0sIDN2dywgMXJlbSk7XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGgyLFxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBoMyB7XG4gICAgbWFyZ2luOiAwO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBoMiB7XG4gICAgZm9udC1zaXplOiAxLjNlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgaDMge1xuICAgIGNvbG9yOiB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNkOWM3ZmIpO1xuICAgIGZvbnQtc2l6ZTogMWVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBzZWN0aW9uICsgc2VjdGlvbixcbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgZGV0YWlscyB7XG4gICAgbWFyZ2luLXRvcDogLjc1cmVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90ZXMge1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgb3ZlcnNjcm9sbC1iZWhhdmlvcjogY29udGFpbjtcbiAgICBzY3JvbGxiYXItd2lkdGg6IHRoaW47XG4gICAgb3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RlcyB1bCB7XG4gICAgbWFyZ2luOiAuMmVtIDAgMDtcbiAgICBwYWRkaW5nLWlubGluZS1zdGFydDogMS4yZW07XG4gICAgbGlzdC1zdHlsZTogZGlzYztcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGVzIGxpICsgbGkge1xuICAgIG1hcmdpbi10b3A6IC4yNWVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90ZXMgc3VtbWFyeSB7XG4gICAgbWFyZ2luLWJvdHRvbTogLjRyZW07XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBmb290ZXIge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC13cmFwOiB3cmFwO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBlbmQ7XG4gICAgZ2FwOiAuNWVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctb3B0aW9ucyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgZ2FwOiAuNGVtIC45ZW07XG4gICAgbWFyZ2luLWlubGluZS1lbmQ6IGF1dG87XG59XG4uamFydmlzLWNoYW5nZWxvZy1vcHRpb25zIGxhYmVsIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGdhcDogLjRlbTtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4iLCAiaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgbW91bnRTZXR0aW5nc0hlbHAgfSBmcm9tICcuL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgY3NzIGZyb20gJy4vc2V0dGluZ3MuY3NzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdFN0eWxlcygpIHtcbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgc3R5bGUuY2xhc3NOYW1lID0gJ2hoLWphcnZpcy1zdHlsZSc7XG4gICAgc3R5bGUudGV4dENvbnRlbnQgPSBgJHtjc3N9XG4gICAgICAgIC5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIHsgLS1qYXJ2aXMtdmVyc2lvbjogXCJ2JHtVU0VSU0NSSVBUX1ZFUlNJT059XCI7IH1cbiAgICBgO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1NldHRpbmdzKCkge1xuICAgIGlmIChjdXJyZW50UGFnZSAhPT0gJy9ob21lLmh0bWwnKSByZXR1cm47XG5cbiAgICBjb25zdCBzZWxlY3RvciA9ICcuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5wYW5lbC1jb250ZW50cyc7XG4gICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKCFwYW5lbCkgcmV0dXJuO1xuICAgICAgICBwYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdoaC1zY3JvbGwnKTtcbiAgICAgICAgbW91bnRTZXR0aW5nc0hlbHAocGFuZWwsICdqYXJ2aXMtc2V0dGluZy10b29sdGlwJyk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5IHx8ICEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkgfHwgIXBhbmVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY29uc3QgdW5pdCA9IGV2ZW50LmRlbHRhTW9kZSA9PT0gMSA/IDE2IDogZXZlbnQuZGVsdGFNb2RlID09PSAyID8gcGFuZWwuY2xpZW50SGVpZ2h0IDogMTtcbiAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gcGFuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0IC8gcGFuZWwub2Zmc2V0SGVpZ2h0IHx8IDE7XG4gICAgICAgICAgICBwYW5lbC5zY3JvbGxUb3AgKz0gZXZlbnQuZGVsdGFZICogdW5pdCAvIHNjYWxlO1xuICAgICAgICB9LCB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IGZhbHNlIH0pO1xuXG4gICAgICAgIGNvbnN0IGNhcmRzID0gcGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5jb25maWctc2V0dGluZycpO1xuICAgICAgICBjb25zdCBwYWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFwYW5lbC5vZmZzZXRXaWR0aCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcbiAgICAgICAgICAgICAgICBjYXJkLnN0eWxlLnNldFByb3BlcnR5KCctLWphcnZpcy1zZXR0aW5nLXJvd3MnLCBTdHJpbmcoY2FyZC5vZmZzZXRIZWlnaHQgKyAxMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFuZWwuY2xhc3NMaXN0LmFkZCgnamFydmlzLXBhY2tlZC1zZXR0aW5ncycpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBncm91cE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIocGFjayk7XG4gICAgICAgIGlmIChwYW5lbC5wYXJlbnRFbGVtZW50KSBncm91cE9ic2VydmVyLm9ic2VydmUocGFuZWwucGFyZW50RWxlbWVudCwgeyBhdHRyaWJ1dGVGaWx0ZXI6IFsnY2xhc3MnXSB9KTtcbiAgICAgICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcihwYWNrKTtcbiAgICAgICAgICAgIGNhcmRzLmZvckVhY2goY2FyZCA9PiBzaXplT2JzZXJ2ZXIub2JzZXJ2ZShjYXJkKSk7XG4gICAgICAgIH1cbiAgICAgICAgcGFjaygpO1xuICAgIH0pO1xufVxuIiwgImV4cG9ydCB0eXBlIE1vZHVsZVNldHRpbmdzID0gUmVjb3JkPHN0cmluZywgYm9vbGVhbj47XG5cbmludGVyZmFjZSBDb25maWdTY2hlbWEge1xuICAgIGJhc2VLZXk6IHN0cmluZztcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIGRlZmF1bHQ6IGJvb2xlYW47XG4gICAgc3ViU2V0dGluZ3M/OiB7IGtleTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyBkZWZhdWx0OiBib29sZWFuIH1bXTtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhITW9kdWxlIHtcbiAgICByZWFkb25seSBncm91cCA9ICdKQVJWSVMnO1xuICAgIHJlYWRvbmx5IGNvbmZpZ1NjaGVtYTogQ29uZmlnU2NoZW1hO1xuICAgIGhhc1J1biA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoeyBjb25maWdTY2hlbWEgfTogeyBuYW1lOiBzdHJpbmc7IGNvbmZpZ1NjaGVtYTogQ29uZmlnU2NoZW1hIH0pIHtcbiAgICAgICAgdGhpcy5jb25maWdTY2hlbWEgPSBjb25maWdTY2hlbWE7XG4gICAgfVxuXG4gICAgYWJzdHJhY3Qgc2hvdWxkUnVuKCk6IGJvb2xlYW47XG4gICAgYWJzdHJhY3QgcnVuKHNldHRpbmdzOiBNb2R1bGVTZXR0aW5ncyk6IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xufVxuIiwgImV4cG9ydCBjb25zdCBMU19DT05GSUdfTkFNRSA9ICdISFN0YXJrJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxzR2V0KGtleTogc3RyaW5nLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpOiB1bmtub3duIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShgJHtsc19uYW1lfSR7a2V5fWApID8/ICdudWxsJylcbn1cbmV4cG9ydCBmdW5jdGlvbiBsc1NldChrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24sIGxzX25hbWUgPSBMU19DT05GSUdfTkFNRSkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgJHtsc19uYW1lfSR7a2V5fWAsIEpTT04uc3RyaW5naWZ5KHZhbHVlKSlcbn1cbmV4cG9ydCBmdW5jdGlvbiBsc1JtKGtleTogc3RyaW5nLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gKVxufVxuIiwgImltcG9ydCB7IExTX0NPTkZJR19OQU1FIH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5cbmV4cG9ydCB0eXBlIE1hcmsgPSAnZnJpZW5kJyB8ICdmb2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNhdmVkTWFyayB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBuYW1lPzogc3RyaW5nO1xuICAgIG1hcms6IE1hcms7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcGVuTWFya01hbmFnZXIocmVhZDogKCkgPT4gU2F2ZWRNYXJrW10sIHJlbW92ZTogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW4sIGNsZWFyOiAoKSA9PiBib29sZWFuKSB7XG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXMtbWFyay1tYW5hZ2VyJykpIHJldHVybjtcblxuICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpYWxvZycpO1xuICAgIGRpYWxvZy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstbWFuYWdlcic7XG4gICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JywgJ2phcnZpcy1tYXJrLW1hbmFnZXItdGl0bGUnKTtcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgdGl0bGUuaWQgPSAnamFydmlzLW1hcmstbWFuYWdlci10aXRsZSc7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSAnRnJpZW5kcyBhbmQgZm9lcyc7XG5cbiAgICBjb25zdCBsaXN0cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxpc3RzLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1saXN0cyc7XG4gICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGFjdGlvbnMuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLWFjdGlvbnMnO1xuICAgIGNvbnN0IGNsZWFyQWxsID0gbWFrZUJ1dHRvbignQ2xlYXIgYWxsIG1hcmtzJywgKCkgPT4ge1xuICAgICAgICBpZiAoY29uZmlybSgnUmVtb3ZlIGFsbCBmcmllbmQgYW5kIGZvZSBtYXJrcyBmb3IgdGhpcyBnYW1lPycpICYmIGNsZWFyKCkpIHtcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgY2xvc2UuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IGNsb3NlID0gbWFrZUJ1dHRvbignQ2xvc2UnLCAoKSA9PiBkaWFsb2cuY2xvc2UoKSk7XG4gICAgYWN0aW9ucy5hcHBlbmQoY2xlYXJBbGwsIGNsb3NlKTtcblxuICAgIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IHJlYWQoKS5zb3J0KChhLCBiKSA9PiBOdW1iZXIoIWEubmFtZSkgLSBOdW1iZXIoIWIubmFtZSkgfHxcbiAgICAgICAgICAgIChhLm5hbWUgfHwgYS5pZCkubG9jYWxlQ29tcGFyZShiLm5hbWUgfHwgYi5pZCwgdW5kZWZpbmVkLCB7IG51bWVyaWM6IHRydWUgfSkpO1xuICAgICAgICBjb25zdCBzZWN0aW9ucyA9IChbJ2ZyaWVuZCcsICdmb2UnXSBhcyBjb25zdCkubWFwKG1hcmsgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlY3Rpb24nKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGVudHJpZXMuZmlsdGVyKGVudHJ5ID0+IGVudHJ5Lm1hcmsgPT09IG1hcmspO1xuICAgICAgICAgICAgaGVhZGluZy50ZXh0Q29udGVudCA9IChtYXJrID09PSAnZnJpZW5kJyA/ICdGcmllbmRzJyA6ICdGb2VzJykgKyBgICgke21hdGNoZXMubGVuZ3RofSlgO1xuICAgICAgICAgICAgc2VjdGlvbi5hcHBlbmRDaGlsZChoZWFkaW5nKTtcblxuICAgICAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW1wdHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgICAgICAgICAgZW1wdHkudGV4dENvbnRlbnQgPSAnTm8gc2F2ZWQgcGxheWVycy4nO1xuICAgICAgICAgICAgICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoZW1wdHkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWN0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBpZCwgbmFtZSB9IG9mIG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBsYXllciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIudGV4dENvbnRlbnQgPSBuYW1lID8gYCR7bmFtZX0gwrcgJHtpZH1gIDogYFBsYXllciAjJHtpZH1gO1xuICAgICAgICAgICAgICAgIGlmICghbmFtZSkgcGxheWVyLnRpdGxlID0gJ05hbWUgbm90IHJlY29yZGVkIHlldCc7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gbWFrZUJ1dHRvbignUmVtb3ZlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IEFycmF5LmZyb20obGlzdHMucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJykpLmluZGV4T2YoYnV0dG9uKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZShpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nID0gbGlzdHMucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAocmVtYWluaW5nW01hdGgubWluKGluZGV4LCByZW1haW5pbmcubGVuZ3RoIC0gMSldIHx8IGNsb3NlKS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGBSZW1vdmUgJHtuYW1lIHx8IGBwbGF5ZXIgJHtpZH1gfSBmcm9tICR7bWFyayA9PT0gJ2ZyaWVuZCcgPyAnZnJpZW5kcycgOiAnZm9lcyd9YCk7XG4gICAgICAgICAgICAgICAgcm93LmFwcGVuZChwbGF5ZXIsIGJ1dHRvbik7XG4gICAgICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChyb3cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VjdGlvbi5hcHBlbmRDaGlsZChsaXN0KTtcbiAgICAgICAgICAgIHJldHVybiBzZWN0aW9uO1xuICAgICAgICB9KTtcbiAgICAgICAgbGlzdHMucmVwbGFjZUNoaWxkcmVuKC4uLnNlY3Rpb25zKTtcbiAgICAgICAgY2xlYXJBbGwuZGlzYWJsZWQgPSBlbnRyaWVzLmxlbmd0aCA9PT0gMDtcbiAgICB9XG5cbiAgICByZW5kZXIoKTtcbiAgICBkaWFsb2cuYXBwZW5kKHRpdGxlLCBsaXN0cywgYWN0aW9ucyk7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgZXZlbnQgPT4ge1xuICAgICAgICBpZiAoIWV2ZW50LmtleSB8fCBbJ1BsYXllck1hcmtzJywgJ1BsYXllck1hcmtOYW1lcycsICdGcmllbmRMaXN0JywgJ0ZvZUxpc3QnXVxuICAgICAgICAgICAgLnNvbWUoa2V5ID0+IGV2ZW50LmtleSA9PT0gTFNfQ09ORklHX05BTUUgKyBrZXkpKSByZW5kZXIoKTtcbiAgICB9LCB7IHNpZ25hbDogbGlzdGVuZXJzLnNpZ25hbCB9KTtcbiAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB7XG4gICAgICAgIGxpc3RlbmVycy5hYm9ydCgpO1xuICAgICAgICBkaWFsb2cucmVtb3ZlKCk7XG4gICAgfSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcbiAgICBkaWFsb2cuc2hvd01vZGFsKCk7XG4gICAgY2xvc2UuZm9jdXMoKTtcbn1cblxuZnVuY3Rpb24gbWFrZUJ1dHRvbihsYWJlbDogc3RyaW5nLCBvbkNsaWNrOiAoKSA9PiB2b2lkKSB7XG4gICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICBidXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgYnV0dG9uLnRleHRDb250ZW50ID0gbGFiZWw7XG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljayk7XG4gICAgcmV0dXJuIGJ1dHRvbjtcbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHR5cGUgeyBDb250ZXN0RGF0YSB9IGZyb20gJy4uLy4uL2dhbWUtdHlwZXMnO1xuaW1wb3J0IHsgTFNfQ09ORklHX05BTUUsIGxzR2V0LCBsc1NldCB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgb3Blbk1hcmtNYW5hZ2VyLCB0eXBlIE1hcmssIHR5cGUgU2F2ZWRNYXJrIH0gZnJvbSAnLi9tYXJrTWFuYWdlcic7XG5cbmNvbnN0IERFRkFVTFRfQ09MT1JTOiBSZWNvcmQ8TWFyaywgc3RyaW5nPiA9IHsgZnJpZW5kOiAnIzQ4YTlmZicsIGZvZTogJyNmZjYxNzMnIH07XG50eXBlIFNhdmVkTmFtZSA9IHN0cmluZyB8IHsgbmFtZTogc3RyaW5nIH07XG5cbmZ1bmN0aW9uIHJlYWRSb3dOYW1lKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgY29uc3QgdGV4dCA9IGVsZW1lbnQudGV4dENvbnRlbnQ/LnRyaW0oKSA/PyAnJztcbiAgICBpZiAoIXRleHQuZW5kc1dpdGgoJysnKSkgcmV0dXJuIHRleHQ7XG4gICAgY29uc3Qgd2l0aG91dFN0YW5kYWxvbmVQbHVzID0gdGV4dC5yZXBsYWNlKC9cXHMrXFwrJC8sICcnKTtcbiAgICBpZiAoIWVsZW1lbnQuY2hpbGRFbGVtZW50Q291bnQpIHJldHVybiB3aXRob3V0U3RhbmRhbG9uZVBsdXM7XG5cbiAgICBjb25zdCBsYWJlbCA9IGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxFbGVtZW50O1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgbGFiZWwucXVlcnlTZWxlY3RvckFsbCgnKicpKSB7XG4gICAgICAgIGlmIChjaGlsZC50ZXh0Q29udGVudD8udHJpbSgpID09PSAnKycpIGNoaWxkLnJlbW92ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbGFiZWwudGV4dENvbnRlbnQ/LnRyaW0oKS5yZXBsYWNlKC9cXHMrXFwrJC8sICcnKSB8fCB3aXRob3V0U3RhbmRhbG9uZVBsdXM7XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlTYXZlZE5hbWUoc2F2ZWQ/OiBTYXZlZE5hbWUpIHtcbiAgICBpZiAodHlwZW9mIHNhdmVkICE9PSAnc3RyaW5nJykgcmV0dXJuIHNhdmVkPy5uYW1lO1xuICAgIC8vIE9sZCBlbnRyaWVzIHN0b3JlZCB0aGUgZnVsbCByb3cgdGV4dCwgaW5jbHVkaW5nIGEgdHJhaWxpbmcgYWRkIGNvbnRyb2wuXG4gICAgcmV0dXJuIHNhdmVkLnRyaW0oKS5yZXBsYWNlKC8oW14rXSlcXCskLywgJyQxJykudHJpbUVuZCgpO1xufVxuXG5leHBvcnQgY2xhc3MgRnJpZW5kQW5kRm9lcyBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIG5hbWVzID0gbmV3IE1hcDxIVE1MRWxlbWVudCwgc3RyaW5nPigpO1xuICAgIHByaXZhdGUgbWFya01lbnU6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByb290OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcm9vdFNlbGVjdG9yID0gJyc7XG4gICAgcHJpdmF0ZSBpbkxlYWd1ZSA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnZnJpZW5kQW5kRm9lcydcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJGcmllbmRzIGFuZCBmb2VzXCIsIFwiUmlnaHQtY2xpY2sgZWFjaCBwbGF5ZXIncyBuYW1lIHRvIGFkZCBvciByZW1vdmUgYSBtYXJrLiBNYW5hZ2Ugc2F2ZWQgbWFya3MgYmVsb3cuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAnbGVhZ3VlJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJJbiBsZWFndWVzXCIsIFwiU2hvdyBtYXJrcyBhbmQgYWxsb3cgbWFya2luZyBpbiBsZWFndWUgdGFibGVzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnY29udGVzdHMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkluIGNvbnRlc3RzXCIsIFwiU2hvdyBtYXJrcyBhbmQgYWxsb3cgbWFya2luZyBvbiBjb250ZXN0IGxlYWRlcmJvYXJkcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7IG5hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYSB9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBbJy9sZWFndWVzLmh0bWwnLCAnL2FjdGl2aXRpZXMuaHRtbCddLmluY2x1ZGVzKGN1cnJlbnRQYWdlKTtcbiAgICB9XG5cbiAgICByZWFkU2V0dGluZyhrZXk6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGxzR2V0KGtleSk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkTWFya3MoKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgICAgICBjb25zdCBzdG9yZWQgPSB0aGlzLnJlYWRTZXR0aW5nKCdQbGF5ZXJNYXJrcycpO1xuICAgICAgICBpZiAoc3RvcmVkICYmIHR5cGVvZiBzdG9yZWQgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHN0b3JlZCkpIHJldHVybiBzdG9yZWQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgICAgICAgY29uc3QgbWFya3M6IFJlY29yZDxzdHJpbmcsIE1hcms+ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgbWFya10gb2YgW1snRnJpZW5kTGlzdCcsICdmcmllbmQnXSwgWydGb2VMaXN0JywgJ2ZvZSddXSBhcyBjb25zdCkge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IHRoaXMucmVhZFNldHRpbmcoa2V5KTtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgaWQgb2YgbGlzdCkge1xuICAgICAgICAgICAgICAgIGlmICgvXlsxLTldXFxkKiQvLnRlc3QoU3RyaW5nKGlkKSkpIG1hcmtzW1N0cmluZyhpZCldID0gbWFyaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFya3M7XG4gICAgfVxuXG4gICAgcmVhZENvbG9ycygpOiBSZWNvcmQ8TWFyaywgc3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IHNhdmVkID0gdGhpcy5yZWFkU2V0dGluZygnUGxheWVyTWFya0NvbG9ycycpIGFzIFBhcnRpYWw8UmVjb3JkPE1hcmssIHVua25vd24+PiB8IG51bGw7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmcmllbmQ6IHR5cGVvZiBzYXZlZD8uZnJpZW5kID09PSAnc3RyaW5nJyAmJiAvXiNbXFxkYS1mXXs2fSQvaS50ZXN0KHNhdmVkLmZyaWVuZCkgPyBzYXZlZC5mcmllbmQgOiBERUZBVUxUX0NPTE9SUy5mcmllbmQsXG4gICAgICAgICAgICBmb2U6IHR5cGVvZiBzYXZlZD8uZm9lID09PSAnc3RyaW5nJyAmJiAvXiNbXFxkYS1mXXs2fSQvaS50ZXN0KHNhdmVkLmZvZSkgPyBzYXZlZC5mb2UgOiBERUZBVUxUX0NPTE9SUy5mb2VcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZWFkU2F2ZWROYW1lcygpOiBSZWNvcmQ8c3RyaW5nLCBTYXZlZE5hbWU+IHtcbiAgICAgICAgY29uc3Qgc2F2ZWQgPSB0aGlzLnJlYWRTZXR0aW5nKCdQbGF5ZXJNYXJrTmFtZXMnKTtcbiAgICAgICAgaWYgKCFzYXZlZCB8fCB0eXBlb2Ygc2F2ZWQgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoc2F2ZWQpKSByZXR1cm4ge307XG4gICAgICAgIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXMoc2F2ZWQpLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyBbc3RyaW5nLCBTYXZlZE5hbWVdID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFssIHZhbHVlXSA9IGVudHJ5O1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgQm9vbGVhbih2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZS5uYW1lID09PSAnc3RyaW5nJyk7XG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICBzYXZlTmFtZXMobmFtZXM6IFJlY29yZDxzdHJpbmcsIFNhdmVkTmFtZT4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxzU2V0KCdQbGF5ZXJNYXJrTmFtZXMnLCBuYW1lcyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHJlbWVtYmVyIG1hcmtlZCBwbGF5ZXIgbmFtZXM6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZU1hcmsoaWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBtYXJrcyA9IHRoaXMucmVhZE1hcmtzKCk7XG4gICAgICAgIGRlbGV0ZSBtYXJrc1tpZF07XG4gICAgICAgIGlmICghdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya3MnLCBtYXJrcykpIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgbmFtZXMgPSB0aGlzLnJlYWRTYXZlZE5hbWVzKCk7XG4gICAgICAgIGlmIChpZCBpbiBuYW1lcykge1xuICAgICAgICAgICAgZGVsZXRlIG5hbWVzW2lkXTtcbiAgICAgICAgICAgIHRoaXMuc2F2ZU5hbWVzKG5hbWVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZWFkU2F2ZWRNYXJrcygpIHtcbiAgICAgICAgY29uc3QgbmFtZXMgPSB0aGlzLnJlYWRTYXZlZE5hbWVzKCk7XG4gICAgICAgIHJldHVybiBPYmplY3QuZW50cmllcyh0aGlzLnJlYWRNYXJrcygpKS5mbGF0TWFwPFNhdmVkTWFyaz4oKFtpZCwgbWFya10pID0+XG4gICAgICAgICAgICAvXlsxLTldXFxkKiQvLnRlc3QoaWQpICYmIChtYXJrID09PSAnZnJpZW5kJyB8fCBtYXJrID09PSAnZm9lJylcbiAgICAgICAgICAgICAgICA/IFt7IGlkLCBuYW1lOiBkaXNwbGF5U2F2ZWROYW1lKG5hbWVzW2lkXSksIG1hcmsgfV1cbiAgICAgICAgICAgICAgICA6IFtdKTtcbiAgICB9XG5cbiAgICBzYXZlU2V0dGluZyhrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxzU2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgYWxlcnQoJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB5b3VyIEZyaWVuZHMgYW5kIEZvZXMgc2V0dGluZ3MuJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbnN0YWxsU2V0dGluZ3MoKSB7XG4gICAgICAgIGlmIChjdXJyZW50UGFnZSAhPT0gJy9ob21lLmh0bWwnKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSAnLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmdbcmVsPVwiSkFSVklTX2ZyaWVuZEFuZEZvZXNcIl0gLnN1Yi1zZXR0aW5ncyc7XG4gICAgICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoIXNldHRpbmdzIHx8IHNldHRpbmdzLnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXMtbWFyay1jb2xvcicpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGlucHV0cyA9IG5ldyBNYXA8TWFyaywgSFRNTElucHV0RWxlbWVudD4oKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW21hcmssIHRleHRdIG9mIFtbJ2ZyaWVuZCcsICdGcmllbmQgbmFtZSBjb2xvciddLCBbJ2ZvZScsICdGb2UgbmFtZSBjb2xvciddXSBhcyBjb25zdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstY29sb3InO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgICAgICAgICAgaW5wdXQudHlwZSA9ICdjb2xvcic7XG4gICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSB0aGlzLnJlYWRDb2xvcnMoKVttYXJrXTtcbiAgICAgICAgICAgICAgICBpbnB1dHMuc2V0KG1hcmssIGlucHV0KTtcbiAgICAgICAgICAgICAgICBpbnB1dC5kaXNhYmxlZCA9ICFzZXR0aW5ncy5jbG9zZXN0KCcuY29uZmlnLXNldHRpbmcnKT8uY2xhc3NMaXN0LmNvbnRhaW5zKCdlbmFibGVkJyk7XG4gICAgICAgICAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnJlYWRDb2xvcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrQ29sb3JzJywgeyAuLi5jb2xvcnMsIFttYXJrXTogaW5wdXQudmFsdWUgfSkpIGlucHV0LnZhbHVlID0gY29sb3JzW21hcmtdO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGxhYmVsLmFwcGVuZCh0aXRsZSwgaW5wdXQpO1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlc2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICByZXNldC50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICByZXNldC5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uJztcbiAgICAgICAgICAgIHJlc2V0LnRleHRDb250ZW50ID0gJ1Jlc2V0IGNvbG9ycyc7XG4gICAgICAgICAgICByZXNldC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtDb2xvcnMnLCB7fSkpIHJldHVybjtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCBpbnB1dF0gb2YgaW5wdXRzKSBpbnB1dC52YWx1ZSA9IERFRkFVTFRfQ09MT1JTW21hcmtdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBtYW5hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIG1hbmFnZS50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBtYW5hZ2UuY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgICAgICAgICBtYW5hZ2UudGV4dENvbnRlbnQgPSAnTWFuYWdlIG1hcmtzJztcbiAgICAgICAgICAgIG1hbmFnZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IG9wZW5NYXJrTWFuYWdlcihcbiAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLnJlYWRTYXZlZE1hcmtzKCksXG4gICAgICAgICAgICAgICAgaWQgPT4gdGhpcy5yZW1vdmVNYXJrKGlkKSxcbiAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya3MnLCB7fSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlTmFtZXMoe30pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApKTtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGFjdGlvbnMuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLXNldHRpbmctYWN0aW9ucyc7XG4gICAgICAgICAgICBhY3Rpb25zLmFwcGVuZChyZXNldCwgbWFuYWdlKTtcbiAgICAgICAgICAgIHNldHRpbmdzLmFwcGVuZENoaWxkKGFjdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjbG9zZU1hcmtNZW51KCkge1xuICAgICAgICB0aGlzLm1hcmtNZW51Py5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5tYXJrTWVudSA9IG51bGw7XG4gICAgfVxuXG4gICAgb3Blbk1hcmtNZW51KGV2ZW50OiBNb3VzZUV2ZW50LCBuYW1lOiBIVE1MRWxlbWVudCwgaWQ6IHN0cmluZykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG5cbiAgICAgICAgY29uc3QgbWVudSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBtZW51LmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1tZW51JztcbiAgICAgICAgbWVudS5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnZ3JvdXAnKTtcbiAgICAgICAgbWVudS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnTWFyayBwbGF5ZXInKTtcbiAgICAgICAgY29uc3QgYWRkQWN0aW9uID0gKHRleHQ6IHN0cmluZywgYWN0OiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lLmlzQ29ubmVjdGVkICYmIHRoaXMubmFtZXMuZ2V0KG5hbWUpID09PSBpZCkgYWN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1lbnUuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgfTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFyaywgdGV4dF0gb2YgW1snZnJpZW5kJywgJ01hcmsgYXMgZnJpZW5kJ10sIFsnZm9lJywgJ01hcmsgYXMgZm9lJ11dIGFzIGNvbnN0KSB7XG4gICAgICAgICAgICBhZGRBY3Rpb24odGV4dCwgKCkgPT4gdGhpcy5hcHBseU1hcmsoaWQsIG1hcmspKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZS5kYXRhc2V0LmphcnZpc01hcmspIGFkZEFjdGlvbignUmVtb3ZlIHRoaXMgcGxheWVy4oCZcyBtYXJrJywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVtb3ZlTWFyayhpZCkpIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgbWVudS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrID0+IGNsaWNrLnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtZW51KTtcbiAgICAgICAgdGhpcy5tYXJrTWVudSA9IG1lbnU7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gbmFtZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgeCA9IGV2ZW50LmNsaWVudFggfHwgYm91bmRzLmxlZnQ7XG4gICAgICAgIGNvbnN0IHkgPSBldmVudC5jbGllbnRZIHx8IGJvdW5kcy5ib3R0b207XG4gICAgICAgIG1lbnUuc3R5bGUubGVmdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHgsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCAtIG1lbnUub2Zmc2V0V2lkdGgpKSArICdweCc7XG4gICAgICAgIG1lbnUuc3R5bGUudG9wID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oeSwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCAtIG1lbnUub2Zmc2V0SGVpZ2h0KSkgKyAncHgnO1xuICAgICAgICBtZW51LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpPy5mb2N1cyh7IHByZXZlbnRTY3JvbGw6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgZ2V0Q29udGVzdE5hbWVzKHJvb3Q6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdERhdGFbXSkge1xuICAgICAgICBjb25zdCBuYW1lcyA9IG5ldyBNYXA8SFRNTEVsZW1lbnQsIHN0cmluZz4oKTtcbiAgICAgICAgY29uc3QgYnlDb250ZXN0ID0gbmV3IE1hcDxzdHJpbmcsIE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+Pj4oKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiByb290LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTFRhYmxlUm93RWxlbWVudD4oJy5sZWFkVGFibGUgdHInKSkge1xuICAgICAgICAgICAgY29uc3QgY2VsbCA9IHJvdy5jZWxscz8uWzFdO1xuICAgICAgICAgICAgaWYgKCFjZWxsIHx8IGNlbGwubG9jYWxOYW1lICE9PSAndGQnKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBjZWxsLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcubmlja25hbWUnKSB8fCBjZWxsO1xuICAgICAgICAgICAgbGV0IGlkID0gcm93LmdldEF0dHJpYnV0ZSgnc29ydGluZ19pZCcpIHx8IG5hbWUuZ2V0QXR0cmlidXRlKCdpZC1tZW1iZXInKSB8fFxuICAgICAgICAgICAgICAgIG5hbWUucXVlcnlTZWxlY3RvcignW2lkLW1lbWJlcl0nKT8uZ2V0QXR0cmlidXRlKCdpZC1tZW1iZXInKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlc3RJZCA9IHJvdy5jbG9zZXN0KCdbaWRfY29udGVzdF0nKT8uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG4gICAgICAgICAgICBpZiAoY29udGVzdElkKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJ5TmFtZSA9IGJ5Q29udGVzdC5nZXQoY29udGVzdElkKTtcbiAgICAgICAgICAgICAgICBpZiAoIWJ5TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0aWNpcGFudHMgPSBjb250ZXN0cy5maW5kKGNvbnRlc3QgPT4gU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCkgPT09IGNvbnRlc3RJZCk/LnBhcnRpY2lwYW50cztcbiAgICAgICAgICAgICAgICAgICAgYnlOYW1lID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHsgbmlja25hbWUsIGlkX21lbWJlciB9IG9mIE9iamVjdC52YWx1ZXMocGFydGljaXBhbnRzIHx8IHt9KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbmlja25hbWVLZXkgPSBTdHJpbmcobmlja25hbWUgPz8gJycpLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbmlja25hbWVLZXkgfHwgIS9eWzEtOV1cXGQqJC8udGVzdChTdHJpbmcoaWRfbWVtYmVyKSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGJ5TmFtZS5nZXQobmlja25hbWVLZXkpIHx8IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlcy5hZGQoU3RyaW5nKGlkX21lbWJlcikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnlOYW1lLnNldChuaWNrbmFtZUtleSwgbWF0Y2hlcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnlDb250ZXN0LnNldChjb250ZXN0SWQsIGJ5TmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBieU5hbWUuZ2V0KHJlYWRSb3dOYW1lKG5hbWUpKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcyAmJiAhbWF0Y2hlcy5oYXMoaWQgPz8gJycpKSBpZCA9IG1hdGNoZXMuc2l6ZSA9PT0gMSA/IG1hdGNoZXMudmFsdWVzKCkubmV4dCgpLnZhbHVlIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZCAmJiAvXlsxLTldXFxkKiQvLnRlc3QoaWQpKSBuYW1lcy5zZXQobmFtZSwgaWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYW1lcztcbiAgICB9XG5cbiAgICByZWZyZXNoKCkge1xuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4odGhpcy5yb290U2VsZWN0b3IpO1xuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xuICAgICAgICBjb25zdCBjb250ZXN0cyA9IHRoaXMuaW5MZWFndWUgPyBbXSA6IFtcbiAgICAgICAgICAgIC4uLk9iamVjdC52YWx1ZXMod2luZG93LmNvbnRlc3RzPy5hY3RpdmUgPz8ge30pLFxuICAgICAgICAgICAgLi4uT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmZpbmlzaGVkID8/IHt9KVxuICAgICAgICBdLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbCk7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gIXJvb3QgPyBuZXcgTWFwPEhUTUxFbGVtZW50LCBzdHJpbmc+KCkgOiB0aGlzLmluTGVhZ3VlXG4gICAgICAgICAgICA/IG5ldyBNYXAoQXJyYXkuZnJvbShyb290LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcubmlja25hbWVbaWQtbWVtYmVyXScpLCBuYW1lID0+IFtuYW1lLCBuYW1lLmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJyldIGFzIGNvbnN0KVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgcmVhZG9ubHkgW0hUTUxFbGVtZW50LCBzdHJpbmddID0+ICEhZW50cnlbMV0gJiYgL15bMS05XVxcZCokLy50ZXN0KGVudHJ5WzFdKSkpXG4gICAgICAgICAgICA6IHRoaXMuZ2V0Q29udGVzdE5hbWVzKHJvb3QsIGNvbnRlc3RzKTtcblxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5uYW1lcy5rZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChuYW1lcy5oYXMobmFtZSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNQbGF5ZXI7XG4gICAgICAgICAgICBkZWxldGUgbmFtZS5kYXRhc2V0LmphcnZpc01hcms7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5hbWVzID0gbmFtZXM7XG4gICAgICAgIGlmICghcm9vdCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBtYXJrcyA9IHRoaXMucmVhZE1hcmtzKCk7XG4gICAgICAgIGNvbnN0IHNhdmVkTmFtZXMgPSB0aGlzLnJlYWRTYXZlZE5hbWVzKCk7XG4gICAgICAgIGNvbnN0IHJvc3Rlck5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGxldCBuYW1lc0NoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgcmVtZW1iZXJOYW1lID0gKGlkOiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcgfCBudWxsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IHR5cGVvZiB0ZXh0ID09PSAnc3RyaW5nJyA/IHRleHQudHJpbSgpIDogJyc7XG4gICAgICAgICAgICBpZiAoIWRpc3BsYXlOYW1lIHx8IChtYXJrc1tpZF0gIT09ICdmcmllbmQnICYmIG1hcmtzW2lkXSAhPT0gJ2ZvZScpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91cyA9IHNhdmVkTmFtZXNbaWRdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcmV2aW91cyA9PT0gJ3N0cmluZycgfHwgcHJldmlvdXM/Lm5hbWUgIT09IGRpc3BsYXlOYW1lKSB7XG4gICAgICAgICAgICAgICAgc2F2ZWROYW1lc1tpZF0gPSB7IG5hbWU6IGRpc3BsYXlOYW1lIH07XG4gICAgICAgICAgICAgICAgbmFtZXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5pbkxlYWd1ZSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IHBsYXllciwgbmlja25hbWUgfSBvZiB3aW5kb3cub3Bwb25lbnRzX2xpc3QgPz8gW10pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IFN0cmluZyhwbGF5ZXI/LmlkX2ZpZ2h0ZXIpO1xuICAgICAgICAgICAgICAgIGlmIChyZW1lbWJlck5hbWUoaWQsIG5pY2tuYW1lKSkgcm9zdGVyTmFtZXMuYWRkKGlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFByZWZlciB0aGUgYWN0aXZlIHJvc3RlciBpZiBhIHBsYXllciBhcHBlYXJzIGluIGJvdGggb2xkIGFuZCBjdXJyZW50IGNvbnRlc3RzLlxuICAgICAgICAgICAgZm9yIChjb25zdCBjb250ZXN0IG9mIGNvbnRlc3RzKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IGlkX21lbWJlciwgbmlja25hbWUgfSBvZiBPYmplY3QudmFsdWVzKGNvbnRlc3QucGFydGljaXBhbnRzID8/IHt9KSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZCA9IFN0cmluZyhpZF9tZW1iZXIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJvc3Rlck5hbWVzLmhhcyhpZCkgJiYgcmVtZW1iZXJOYW1lKGlkLCBuaWNrbmFtZSkpIHJvc3Rlck5hbWVzLmFkZChpZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbG9ycyA9IHRoaXMucmVhZENvbG9ycygpO1xuICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCBjb2xvcl0gb2YgT2JqZWN0LmVudHJpZXMoY29sb3JzKSkge1xuICAgICAgICAgICAgY29uc3QgcHJvcGVydHkgPSAnLS1qYXJ2aXMtJyArIG1hcmsgKyAnLWNvbG9yJztcbiAgICAgICAgICAgIGlmIChyb290LnN0eWxlLmdldFByb3BlcnR5VmFsdWUocHJvcGVydHkpICE9PSBjb2xvcikgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgY29sb3IpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIGlkXSBvZiBuYW1lcykge1xuICAgICAgICAgICAgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNQbGF5ZXIgIT09IGlkKSBuYW1lLmRhdGFzZXQuamFydmlzUGxheWVyID0gaWQ7XG4gICAgICAgICAgICBjb25zdCBtYXJrID0gbWFya3NbaWRdO1xuICAgICAgICAgICAgaWYgKG1hcmsgPT09ICdmcmllbmQnIHx8IG1hcmsgPT09ICdmb2UnKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrICE9PSBtYXJrKSBuYW1lLmRhdGFzZXQuamFydmlzTWFyayA9IG1hcms7XG4gICAgICAgICAgICAgICAgaWYgKCFyb3N0ZXJOYW1lcy5oYXMoaWQpKSByZW1lbWJlck5hbWUoaWQsIHJlYWRSb3dOYW1lKG5hbWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmFtZS5kYXRhc2V0LmphcnZpc01hcmspIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgbmFtZS5kYXRhc2V0LmphcnZpc01hcms7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWVzQ2hhbmdlZCkgdGhpcy5zYXZlTmFtZXMoc2F2ZWROYW1lcyk7XG4gICAgfVxuXG4gICAgYXBwbHlNYXJrKGlkOiBzdHJpbmcsIG1hcms6IE1hcmspIHtcbiAgICAgICAgY29uc3QgbWFya3MgPSB0aGlzLnJlYWRNYXJrcygpO1xuICAgICAgICBtYXJrc1tpZF0gPSBtYXJrO1xuXG4gICAgICAgIGlmICh0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrcycsIG1hcmtzKSkgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgaGFuZGxlTWFya01lbnUoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUgJiYgdGhpcy5tYXJrTWVudT8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgIT09ICdjb250ZXh0bWVudScgJiYgIWV2ZW50LmFsdEtleSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG5hbWUgPSBldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ID8gZXZlbnQudGFyZ2V0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCdbZGF0YS1qYXJ2aXMtcGxheWVyXScpIDogbnVsbDtcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGlkID0gdGhpcy5uYW1lcy5nZXQobmFtZSk7XG4gICAgICAgIGlmICghaWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5vcGVuTWFya01lbnUoZXZlbnQsIG5hbWUsIGlkKTtcbiAgICB9XG5cbiAgICBydW4oeyBsZWFndWUsIGNvbnRlc3RzIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICB0aGlzLmluTGVhZ3VlID0gY3VycmVudFBhZ2UgPT09ICcvbGVhZ3Vlcy5odG1sJztcbiAgICAgICAgaWYgKHRoaXMuaW5MZWFndWUgPyAhbGVhZ3VlIDogIWNvbnRlc3RzKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5yb290U2VsZWN0b3IgPSB0aGlzLmluTGVhZ3VlID8gJy5sZWFndWVfdGFibGUnIDogJyNjb250ZXN0cyAucmlnaHRfcGFydCc7XG4gICAgICAgIGNvbnN0IGhhbmRsZU1hcmtNZW51ID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB0aGlzLmhhbmRsZU1hcmtNZW51KGV2ZW50KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVNYXJrTWVudSwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgaGFuZGxlTWFya01lbnUsIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmtleSAhPT0gJ0VzY2FwZScgfHwgIXRoaXMubWFya01lbnUpIHJldHVybjtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3N0b3JhZ2UnLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoIWV2ZW50LmtleSB8fCBbJ1BsYXllck1hcmtzJywgJ1BsYXllck1hcmtDb2xvcnMnLCAnRnJpZW5kTGlzdCcsICdGb2VMaXN0J11cbiAgICAgICAgICAgICAgICAuc29tZShrZXkgPT4gZXZlbnQua2V5ID09PSBMU19DT05GSUdfTkFNRSArIGtleSkpIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKG11dGF0aW9ucyA9PiB7XG4gICAgICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnJvb3RTZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAocm9vdCAhPT0gdGhpcy5yb290IHx8IChyb290ICYmIG11dGF0aW9ucy5zb21lKCh7IHRhcmdldCB9KSA9PiByb290LmNvbnRhaW5zKHRhcmdldCkpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICBjaGFyYWN0ZXJEYXRhOiB0cnVlLFxuICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFsnc29ydGluZ19pZCcsICdpZC1tZW1iZXInLCAnaWRfY29udGVzdCddXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuXG5leHBvcnQgdHlwZSBDb250ZXN0S2luZCA9ICdkYWlseScgfCAnZXZlbnQnO1xuZXhwb3J0IHR5cGUgQ29udGVzdFJhbmsgPSAndG9wJyB8ICdtaW5lJztcblxuY29uc3QgQ09OVEVTVF9LSU5EUyA9IFtbJ2RhaWx5JywgJ0RhaWx5J10sIFsnZXZlbnQnLCAnRXZlbnQnXV0gYXMgY29uc3Q7XG5jb25zdCBDT05URVNUX0VWRU5UUyA9IFtbJ2FueScsICdBbnknXSwgWydjYmMnLCAnQ2JDJ10sIFsnY2NjJywgJ0NDQyddLCBbJ2xjJywgJ0xDJ11dIGFzIGNvbnN0O1xuY29uc3QgQ09OVEVTVF9SQU5LUyA9IFtbJ3RvcCcsICdUb3AnXSwgWydtaW5lJywgJ015IHJhbmsnXV0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIENvbnRlc3RFdmVudCA9IEV4Y2x1ZGU8KHR5cGVvZiBDT05URVNUX0VWRU5UUylbbnVtYmVyXVswXSwgJ2FueSc+O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVhZENvbnRlc3RTZXR0aW5nKGtleTogc3RyaW5nKTogdW5rbm93biB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGxzR2V0KGtleSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRDb250ZXN0RGVmYXVsdHMoKSB7XG4gICAgY29uc3Qga2luZDogQ29udGVzdEtpbmQgPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RLaW5kJykgPT09ICdkYWlseScgPyAnZGFpbHknIDogJ2V2ZW50JztcbiAgICBjb25zdCBzYXZlZEV2ZW50ID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0RXZlbnQnKTtcbiAgICBjb25zdCBldmVudCA9IENPTlRFU1RfRVZFTlRTLmZpbmQoKFt2YWx1ZV0pID0+IHZhbHVlID09PSBzYXZlZEV2ZW50KT8uWzBdID8/ICdhbnknO1xuICAgIGNvbnN0IHJhbms6IENvbnRlc3RSYW5rID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0UmFua1N0YXJ0JykgPT09ICd0b3AnID8gJ3RvcCcgOiAnbWluZSc7XG4gICAgcmV0dXJuIHsga2luZCwgZXZlbnQsIHJhbmsgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRQaW5uZWRSYW5rKGlkOiBzdHJpbmcsIGZhbGxiYWNrOiBDb250ZXN0UmFuayk6IENvbnRlc3RSYW5rIHtcbiAgICBjb25zdCBzYXZlZCA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdFBpbm5lZFJhbmsnKTtcbiAgICBpZiAoc2F2ZWQgJiYgdHlwZW9mIHNhdmVkID09PSAnb2JqZWN0JyAmJiAnaWQnIGluIHNhdmVkICYmIHNhdmVkLmlkID09PSBpZCAmJiAncmFuaycgaW4gc2F2ZWQpIHtcbiAgICAgICAgaWYgKHNhdmVkLnJhbmsgPT09ICdtaW5lJyB8fCBzYXZlZC5yYW5rID09PSAndG9wJykgcmV0dXJuIHNhdmVkLnJhbms7XG4gICAgfVxuICAgIHJldHVybiBmYWxsYmFjaztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VSYW5rQ2hvaWNlKGxhYmVsOiBzdHJpbmcsIHNlbGVjdDogKHJhbms6IENvbnRlc3RSYW5rKSA9PiB2b2lkKSB7XG4gICAgcmV0dXJuIG1ha2VDaG9pY2UobGFiZWwsIENPTlRFU1RfUkFOS1MsIHNlbGVjdCk7XG59XG5cbmZ1bmN0aW9uIG1ha2VDaG9pY2U8VCBleHRlbmRzIHN0cmluZz4obGFiZWw6IHN0cmluZywgb3B0aW9uczogUmVhZG9ubHlBcnJheTxyZWFkb25seSBbVCwgc3RyaW5nXT4sIHNlbGVjdDogKHZhbHVlOiBUKSA9PiB2b2lkKSB7XG4gICAgY29uc3QgZ3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgZ3JvdXAuY2xhc3NOYW1lID0gJ2phcnZpcy1jb250ZXN0LWNob2ljZSc7XG4gICAgZ3JvdXAuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2dyb3VwJyk7XG4gICAgZ3JvdXAuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgbGFiZWwpO1xuICAgIGdyb3VwLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKSk7XG4gICAgZm9yIChjb25zdCBbdmFsdWUsIHRleHRdIG9mIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgIGJ1dHRvbi5kYXRhc2V0LmNvbnRlc3RDaG9pY2UgPSB2YWx1ZTtcbiAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBzZWxlY3QodmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgZ3JvdXAuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICB9XG4gICAgcmV0dXJuIGdyb3VwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0Q29udGVzdENob2ljZShncm91cDogSFRNTEVsZW1lbnQsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICBmb3IgKGNvbnN0IGJ1dHRvbiBvZiBncm91cC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKSkge1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBTdHJpbmcoYnV0dG9uLmRhdGFzZXQuY29udGVzdENob2ljZSA9PT0gdmFsdWUpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsQ29udGVzdFNldHRpbmdzKCkge1xuICAgIGlmIChjdXJyZW50UGFnZSAhPT0gJy9ob21lLmh0bWwnKSByZXR1cm47XG5cbiAgICBjb25zdCBzZWxlY3RvciA9ICcuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZ1tyZWw9XCJKQVJWSVNfY29udGVzdFN0YXJ0XCJdJztcbiAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKCFjYXJkIHx8IGNhcmQucXVlcnlTZWxlY3RvcignLmphcnZpcy1jb250ZXN0LXNldHRpbmdzJykpIHJldHVybjtcblxuICAgICAgICBjb25zdCBmaWVsZHNldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkc2V0Jyk7XG4gICAgICAgIGZpZWxkc2V0LmNsYXNzTmFtZSA9ICdqYXJ2aXMtY29udGVzdC1zZXR0aW5ncyc7XG4gICAgICAgIGZpZWxkc2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdDb250ZXN0IHN0YXJ0dXAgZGVmYXVsdHMnKTtcbiAgICAgICAgY29uc3Qgc2F2ZSA9IChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZywgZ3JvdXA6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxzU2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2UoZ3JvdXAsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBzYXZlIHRoZSBjb250ZXN0IGRlZmF1bHQ6JywgZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGV2ZW50TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZXZlbnRMYWJlbC5pbm5lckhUTUwgPSBzZXR0aW5nSGVscCgnRXZlbnQgdHlwZScsICdQcmVmZXIgQ2JDIChDdW1iYWNrIENvbnRlc3QpLCBDQ0MgKENyYXp5IEN1bWJhY2sgQ29udGVzdCksIG9yIExDIChMZWdlbmRhcnkgQ29udGVzdCkgd2hlbiBhY3RpdmUuIEFueSBvcGVucyB0aGUgYm90dG9tIGFjdGl2ZSBjb250ZXN0LCBhcyBkb2VzIGFuIHVuYXZhaWxhYmxlIGV2ZW50IHR5cGUuJyk7XG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IG1ha2VDaG9pY2UoJ0V2ZW50IHR5cGUnLCBDT05URVNUX0VWRU5UUywgdmFsdWUgPT4gc2F2ZSgnQ29udGVzdEV2ZW50JywgdmFsdWUsIGV2ZW50cykpO1xuICAgICAgICBjb25zdCBzaG93RXZlbnRzID0gKGtpbmQ6IENvbnRlc3RLaW5kKSA9PiBldmVudExhYmVsLmhpZGRlbiA9IGV2ZW50cy5oaWRkZW4gPSBraW5kID09PSAnZGFpbHknO1xuICAgICAgICBjb25zdCBraW5kcyA9IG1ha2VDaG9pY2UoJ1ByZWZlcnJlZCBjb250ZXN0JywgQ09OVEVTVF9LSU5EUywgdmFsdWUgPT4ge1xuICAgICAgICAgICAgaWYgKHNhdmUoJ0NvbnRlc3RLaW5kJywgdmFsdWUsIGtpbmRzKSkgc2hvd0V2ZW50cyh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByYW5rcyA9IG1ha2VSYW5rQ2hvaWNlKCdEZWZhdWx0IGxlYWRlcmJvYXJkIHBvc2l0aW9uJywgdmFsdWUgPT4gc2F2ZSgnQ29udGVzdFJhbmtTdGFydCcsIHZhbHVlLCByYW5rcykpO1xuICAgICAgICBjb25zdCBkZWZhdWx0cyA9IHJlYWRDb250ZXN0RGVmYXVsdHMoKTtcbiAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShraW5kcywgZGVmYXVsdHMua2luZCk7XG4gICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2UoZXZlbnRzLCBkZWZhdWx0cy5ldmVudCk7XG4gICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2UocmFua3MsIGRlZmF1bHRzLnJhbmspO1xuICAgICAgICBzaG93RXZlbnRzKGRlZmF1bHRzLmtpbmQpO1xuXG4gICAgICAgIGNvbnN0IGtpbmRMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBraW5kTGFiZWwuaW5uZXJIVE1MID0gc2V0dGluZ0hlbHAoJ1ByZWZlcnJlZCBjb250ZXN0JywgJ0RhaWx5IG9wZW5zIHRoZSBmaXJzdCBhY3RpdmUgZGFpbHkgY29udGVzdC4gRXZlbnQgY2FuIHByZWZlciBhbiBldmVudCB0eXBlIG9yIGZvbGxvdyB0aGUgZ2FtZSBhbmQgb3BlbiB0aGUgYm90dG9tIGFjdGl2ZSBjb250ZXN0LicpO1xuICAgICAgICBjb25zdCByYW5rTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcmFua0xhYmVsLmlubmVySFRNTCA9IHNldHRpbmdIZWxwKCdMZWFkZXJib2FyZCBzdGFydCcsICdPcGVuIGF0IHRoZSB0b3Agb3IgYXQgeW91ciByYW5rLiBBIHN0YXJyZWQgY29udGVzdCBjYW4gaGF2ZSBpdHMgb3duIHBvc2l0aW9uLicpO1xuICAgICAgICBmaWVsZHNldC5hcHBlbmQoa2luZExhYmVsLCBraW5kcywgZXZlbnRMYWJlbCwgZXZlbnRzLCByYW5rTGFiZWwsIHJhbmtzKTtcbiAgICAgICAgY29uc3QgcmVmcmVzaEVuYWJsZWQgPSAoKSA9PiBmaWVsZHNldC5kaXNhYmxlZCA9ICFjYXJkLmNsYXNzTGlzdC5jb250YWlucygnZW5hYmxlZCcpO1xuICAgICAgICByZWZyZXNoRW5hYmxlZCgpO1xuICAgICAgICBuZXcgTXV0YXRpb25PYnNlcnZlcihyZWZyZXNoRW5hYmxlZCkub2JzZXJ2ZShjYXJkLCB7IGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcyddIH0pO1xuICAgICAgICBjYXJkLmFwcGVuZENoaWxkKGZpZWxkc2V0KTtcbiAgICB9KTtcbn1cbiIsICJpbnRlcmZhY2UgQ29udGVzdFNob3J0Y3V0IHtcbiAgICBpZDogc3RyaW5nO1xuICAgIGNhdGVnb3J5OiBzdHJpbmc7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHJhbms6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvc2l0aW9uQ29udGVzdFNob3J0Y3V0cyhjYW52YXM6IEhUTUxFbGVtZW50LCBiYXI6IEhUTUxFbGVtZW50KSB7XG4gICAgY29uc3QgY2xvc2UgPSBjYW52YXMucGFyZW50RWxlbWVudD8ucXVlcnlTZWxlY3RvcignOnNjb3BlID4gLmNsb3NlX2Nyb3NzJyk7XG4gICAgaWYgKCFjbG9zZSkgcmV0dXJuO1xuXG4gICAgY29uc3QgZnJhbWUgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgY3Jvc3MgPSBjbG9zZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBzY2FsZVggPSBmcmFtZS53aWR0aCAvIGNhbnZhcy5vZmZzZXRXaWR0aDtcbiAgICBjb25zdCBzY2FsZVkgPSBmcmFtZS5oZWlnaHQgLyBjYW52YXMub2Zmc2V0SGVpZ2h0O1xuICAgIGlmICghc2NhbGVYIHx8ICFzY2FsZVkgfHwgIWNyb3NzLndpZHRoKSByZXR1cm47XG5cbiAgICBiYXIuc3R5bGUuaW5zZXRJbmxpbmVFbmQgPSBgJHtNYXRoLmNlaWwoKGZyYW1lLnJpZ2h0IC0gY3Jvc3MubGVmdCkgLyBzY2FsZVggKyA4KX1weGA7XG4gICAgYmFyLnN0eWxlLmluc2V0QmxvY2tTdGFydCA9IGAke01hdGgucm91bmQoKGNyb3NzLnRvcCArIGNyb3NzLmhlaWdodCAvIDIgLSBmcmFtZS50b3ApIC8gc2NhbGVZKX1weGA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJDb250ZXN0U2hvcnRjdXRzKFxuICAgIGNhbnZhczogSFRNTEVsZW1lbnQsXG4gICAgY29udGVzdHM6IENvbnRlc3RTaG9ydGN1dFtdLFxuICAgIHNlbGVjdGVkOiBzdHJpbmcgfCBudWxsLFxuICAgIHNlbGVjdDogKGlkOiBzdHJpbmcpID0+IHZvaWRcbikge1xuICAgIGxldCBiYXIgPSBjYW52YXMucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJzpzY29wZSA+IC5qYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMnKTtcbiAgICBpZiAoIWNvbnRlc3RzLmxlbmd0aCkge1xuICAgICAgICBiYXI/LnJlbW92ZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghYmFyKSB7XG4gICAgICAgIGJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBiYXIuY2xhc3NOYW1lID0gJ2phcnZpcy1jb250ZXN0LXNob3J0Y3V0cyc7XG4gICAgICAgIGJhci5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnZ3JvdXAnKTtcbiAgICAgICAgYmFyLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdBY3RpdmUgY29udGVzdHMnKTtcbiAgICAgICAgYmFyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKCEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3Q8SFRNTEJ1dHRvbkVsZW1lbnQ+KCdidXR0b25bZGF0YS1jb250ZXN0LWlkXScpPy5kYXRhc2V0LmNvbnRlc3RJZDtcbiAgICAgICAgICAgIGlmIChpZCkgc2VsZWN0KGlkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNhbnZhcy5wcmVwZW5kKGJhcik7XG4gICAgICAgIHBvc2l0aW9uQ29udGVzdFNob3J0Y3V0cyhjYW52YXMsIGJhcik7XG4gICAgfVxuXG4gICAgY29uc3QgYnV0dG9ucyA9IG5ldyBNYXAoQXJyYXkuZnJvbShiYXIucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJyksIGJ1dHRvbiA9PiBbYnV0dG9uLmRhdGFzZXQuY29udGVzdElkLCBidXR0b25dKSk7XG4gICAgY29uc3QgY2F0ZWdvcmllcyA9IGNvbnRlc3RzLm1hcChjb250ZXN0ID0+IGNvbnRlc3QuY2F0ZWdvcnkpO1xuICAgIGZvciAoY29uc3QgW2luZGV4LCB7IGlkLCBjYXRlZ29yeSwgbmFtZSwgcmFuayB9XSBvZiBjb250ZXN0cy5lbnRyaWVzKCkpIHtcbiAgICAgICAgbGV0IGJ1dHRvbiA9IGJ1dHRvbnMuZ2V0KGlkKTtcbiAgICAgICAgaWYgKCFidXR0b24pIHtcbiAgICAgICAgICAgIGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGJ1dHRvbi5kYXRhc2V0LmNvbnRlc3RJZCA9IGlkO1xuICAgICAgICAgICAgYnV0dG9uLmFwcGVuZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyksIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0cm9uZycpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0eXBlID0gY2F0ZWdvcmllcy5pbmRleE9mKGNhdGVnb3J5KSA9PT0gY2F0ZWdvcmllcy5sYXN0SW5kZXhPZihjYXRlZ29yeSkgP1xuICAgICAgICAgICAgY2F0ZWdvcnkgOiBgJHtjYXRlZ29yeX0gJHtjYXRlZ29yaWVzLnNsaWNlKDAsIGluZGV4ICsgMSkuZmlsdGVyKHZhbHVlID0+IHZhbHVlID09PSBjYXRlZ29yeSkubGVuZ3RofWA7XG4gICAgICAgIGNvbnN0IFtsYWJlbCwgcGxhY2VtZW50XSA9IEFycmF5LmZyb20oYnV0dG9uLmNoaWxkcmVuKTtcbiAgICAgICAgaWYgKGxhYmVsLnRleHRDb250ZW50ICE9PSB0eXBlKSBsYWJlbC50ZXh0Q29udGVudCA9IHR5cGU7XG4gICAgICAgIGlmIChwbGFjZW1lbnQudGV4dENvbnRlbnQgIT09IChyYW5rIHx8ICfigJMnKSkgcGxhY2VtZW50LnRleHRDb250ZW50ID0gcmFuayB8fCAn4oCTJztcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBgJHt0eXBlfSDCtyAke25hbWV9IMK3ICR7cmFuayA/IGBSYW5rICR7cmFua31gIDogJ1JhbmsgdW5hdmFpbGFibGUnfWA7XG4gICAgICAgIGlmIChidXR0b24udGl0bGUgIT09IGRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICBidXR0b24udGl0bGUgPSBkZXNjcmlwdGlvbjtcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBkZXNjcmlwdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJlc3NlZCA9IFN0cmluZyhpZCA9PT0gc2VsZWN0ZWQpO1xuICAgICAgICBpZiAoYnV0dG9uLmdldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJykgIT09IHByZXNzZWQpIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIHByZXNzZWQpO1xuXG4gICAgICAgIGlmIChidXR0b24gIT09IGJhci5jaGlsZHJlbltpbmRleF0pIGJhci5pbnNlcnRCZWZvcmUoYnV0dG9uLCBiYXIuY2hpbGRyZW5baW5kZXhdID8/IG51bGwpO1xuICAgICAgICBidXR0b25zLmRlbGV0ZShpZCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgYnV0dG9uIG9mIGJ1dHRvbnMudmFsdWVzKCkpIGJ1dHRvbi5yZW1vdmUoKTtcbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSwgdHlwZSBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7ICQsIGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBsc0dldCwgbHNTZXQsIGxzUm0gfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcbmltcG9ydCB7IG1ha2VSYW5rQ2hvaWNlLCByZWFkQ29udGVzdERlZmF1bHRzLCByZWFkQ29udGVzdFNldHRpbmcsIHJlYWRQaW5uZWRSYW5rLCBzZWxlY3RDb250ZXN0Q2hvaWNlLCB0eXBlIENvbnRlc3RFdmVudCwgdHlwZSBDb250ZXN0S2luZCB9IGZyb20gJy4vY29udGVzdFByZWZlcmVuY2VzJztcbmltcG9ydCB7IHBvc2l0aW9uQ29udGVzdFNob3J0Y3V0cywgcmVuZGVyQ29udGVzdFNob3J0Y3V0cyB9IGZyb20gJy4vY29udGVzdFNob3J0Y3V0cyc7XG5cbnR5cGUgQ29udGVzdENhdGVnb3J5ID0gQ29udGVzdEtpbmQgfCBDb250ZXN0RXZlbnQ7XG5jb25zdCBDT05URVNUX1NIT1JUX0xBQkVMUzogUmVjb3JkPENvbnRlc3RDYXRlZ29yeSwgc3RyaW5nPiA9IHtcbiAgICBkYWlseTogJ0RDJywgY2JjOiAnQ2JDJywgY2NjOiAnQ0NDJywgbGM6ICdMQycsIGV2ZW50OiAnRXZlbnQnXG59O1xuY29uc3QgQ09OVEVTVF9USVRMRV9TRUxFQ1RPUiA9ICcuY29udGVzdF90aXRsZSwgLmNvbnRlc3RfbmFtZSwgaDMsIGg0LCBoNSc7XG5cbmZ1bmN0aW9uIGdldENvbnRlc3RDYXRlZ29yeShjYXRlZ29yeTogc3RyaW5nIHwgdW5kZWZpbmVkKTogQ29udGVzdENhdGVnb3J5IHwgbnVsbCB7XG4gICAgc3dpdGNoIChjYXRlZ29yeT8udHJpbSgpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvWy0gXSsvZywgJ18nKSkge1xuICAgICAgICBjYXNlICdkYWlseSc6XG4gICAgICAgIGNhc2UgJ2RhaWx5X2NvbnRlc3QnOiByZXR1cm4gJ2RhaWx5JztcbiAgICAgICAgY2FzZSAnY3VtYmFjayc6XG4gICAgICAgIGNhc2UgJ2N1bWJhY2tfY29udGVzdCc6XG4gICAgICAgIGNhc2UgJ2NiYyc6IHJldHVybiAnY2JjJztcbiAgICAgICAgY2FzZSAnY3JhenlfY3VtYmFjayc6XG4gICAgICAgIGNhc2UgJ2NyYXp5X2N1bWJhY2tfY29udGVzdCc6XG4gICAgICAgIGNhc2UgJ2NjYmMnOlxuICAgICAgICBjYXNlICdjY2MnOiByZXR1cm4gJ2NjYyc7XG4gICAgICAgIGNhc2UgJ2xlZ2VuZGFyeSc6XG4gICAgICAgIGNhc2UgJ2xlZ2VuZGFyeV9jb250ZXN0JzpcbiAgICAgICAgY2FzZSAnbGMnOiByZXR1cm4gJ2xjJztcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuIGNhdGVnb3J5ID8gJ2V2ZW50JyA6IG51bGw7XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgQ29udGVzdENhcmQge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY2FyZDogSFRNTEVsZW1lbnQ7XG4gICAgaGVhZGVyOiBIVE1MRWxlbWVudDtcbiAgICB0aXRsZTogSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGxhYmVsOiBzdHJpbmc7XG4gICAgY2F0ZWdvcnk6IENvbnRlc3RDYXRlZ29yeSB8IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcm1Db250ZXN0U3RhcnR1cEd1YXJkKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZSAhPT0gJy9hY3Rpdml0aWVzLmh0bWwnIHx8IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKS5nZXQoJ3RhYicpICE9PSAnY29udGVzdHMnKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBpZiAoSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnSEhQbHVzUGx1c0NvbmZpZycpID8/ICdudWxsJyk/LkpBUlZJU19jb250ZXN0U3RhcnQgPT09IGZhbHNlKSByZXR1cm47XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBLZWVwIGJvdGggcGFuZXMgb3V0IG9mIHZpZXcgdW50aWwgdGhlIGNob3NlbiBjb250ZXN0IGFuZCBpdHMgbGVhZGVyYm9hcmQgYXJlIHBvc2l0aW9uZWQuXG4gICAgY29uc3QgZ3VhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIGd1YXJkLmlkID0gJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnO1xuICAgIGd1YXJkLnRleHRDb250ZW50ID0gYFxuICAgICAgICAjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEsXG4gICAgICAgICNjb250ZXN0cyAucmlnaHRfcGFydCB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICAgICAgfVxuICAgIGA7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgIGlmICghZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSByZXR1cm47XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChndWFyZCk7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9KTtcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ3VhcmQpO1xuICAgIGVsc2Ugb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwgeyBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICBndWFyZC5yZW1vdmUoKTtcbiAgICB9LCA0MDAwKTtcbn1cblxuZXhwb3J0IGNsYXNzIENvbnRlc3RTdGFydCBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHByZWZlcmVuY2UgPSAnJztcbiAgICBwcml2YXRlIHN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBkZWZhdWx0cyA9IHJlYWRDb250ZXN0RGVmYXVsdHMoKTtcbiAgICBwcml2YXRlIGxpc3Q6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByaWdodDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJlc3RvcmluZ0NhcmQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByZXBvc2l0aW9uOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHN0b3BKdW1wOiAoKGZpbmlzaD86IGJvb2xlYW4pID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdG9wU3dpdGNoU2Nyb2xsID0gdHJ1ZTtcbiAgICBwcml2YXRlIHN3aXRjaFNjcm9sbDogeyByZXN0b3JlOiAoKSA9PiB2b2lkOyBzdG9wOiAoKSA9PiB2b2lkIH0gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIG9ic2VydmVyOiBNdXRhdGlvbk9ic2VydmVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBsaXN0ZW5lcnM6IEFib3J0Q29udHJvbGxlciB8IG51bGwgPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnY29udGVzdFN0YXJ0J1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkNvbnRlc3Qgc3RhcnR1cFwiLCBcIk9wZW4gdGhlIHByZWZlcnJlZCBjb250ZXN0IGFuZCByYW5rIG9uIGxvYWQsIGFuZCBzd2l0Y2ggYWN0aXZlIGNvbnRlc3RzIGZyb20gdGhlIGhlYWRlci4gQSBzdGFycmVkIGNvbnRlc3QgdGFrZXMgcHJpb3JpdHkgb24gbG9hZC5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdub1N3aXRjaFNjcm9sbCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKCdTdG9wIHNjcm9sbGluZyBvbiBjb250ZXN0IHN3aXRjaGVzJywgJ0tlZXAgdGhlIGNvbnRlc3QgbGlzdCBpbiBwbGFjZSB3aGVuIHlvdSBzd2l0Y2ggYnkgY2xpY2tpbmcgYSBjYXJkLiBUaGUgbGVhZGVyYm9hcmQgb3BlbnMgYXQgeW91ciBwcmVmZXJyZWQgcG9zaXRpb24sIGFuZCB5b3UgY2FuIHN0aWxsIHNjcm9sbCBieSBoYW5kLicpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoeyBuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWEgfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UgPT09ICcvYWN0aXZpdGllcy5odG1sJztcbiAgICB9XG5cbiAgICBnZXRDb250ZXN0cyhsaXN0OiBIVE1MRWxlbWVudCwgZmluaXNoZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz4pOiBDb250ZXN0Q2FyZFtdIHtcbiAgICAgICAgY29uc3QgYWN0aXZlID0gbmV3IE1hcChPYmplY3QudmFsdWVzKHdpbmRvdy5jb250ZXN0cz8uYWN0aXZlIHx8IHt9KVxuICAgICAgICAgICAgLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbClcbiAgICAgICAgICAgIC5tYXAoY29udGVzdCA9PiBbU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCksIGNvbnRlc3RdKSk7XG5cbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obGlzdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLmNvbnRlc3RbaWRfY29udGVzdF0nKSkuZmxhdE1hcChjYXJkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gY2FyZC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmICghaWQpIHJldHVybiBbXTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlc3QgPSBhY3RpdmUuZ2V0KGlkKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IGNhcmQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jb250ZXN0X2hlYWRlcicpO1xuICAgICAgICAgICAgaWYgKCFoZWFkZXIgfHwgZmluaXNoZWQuaGFzKGlkKSkgcmV0dXJuIFtdO1xuICAgICAgICAgICAgaWYgKCFjb250ZXN0ICYmICFoZWFkZXIubWF0Y2hlcygnLmluX3Byb2dyZXNzJykpIHJldHVybiBbXTtcblxuICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBoZWFkZXIucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oQ09OVEVTVF9USVRMRV9TRUxFQ1RPUik7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gdGl0bGUgJiYgQXJyYXkuZnJvbSh0aXRsZS5jaGlsZE5vZGVzKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIobm9kZSA9PiAhKG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSB8fCAhbm9kZS5tYXRjaGVzKCcuamFydmlzLWNvbnRlc3QtcGluLCAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpKVxuICAgICAgICAgICAgICAgIC5tYXAobm9kZSA9PiBub2RlLnRleHRDb250ZW50KS5qb2luKCcnKS50cmltKCk7XG4gICAgICAgICAgICBjb25zdCBjYXRlZ29yeSA9IGdldENvbnRlc3RDYXRlZ29yeShjb250ZXN0Py5jYXRlZ29yeV90eXBlKTtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIGlkLCBjYXJkLCBoZWFkZXIsIHRpdGxlLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIGxhYmVsOiBTdHJpbmcobmFtZSB8fCBjb250ZXN0Py5uYW1lIHx8IGNvbnRlc3Q/LnRpdGxlIHx8XG4gICAgICAgICAgICAgICAgICAgIChjYXRlZ29yeSA9PT0gJ2RhaWx5JyA/ICdEYWlseSBjb250ZXN0JyA6ICdDb250ZXN0JykpLnRyaW0oKVxuICAgICAgICAgICAgfV07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFRhcmdldChjb250ZXN0czogQ29udGVzdENhcmRbXSkge1xuICAgICAgICBpZiAodGhpcy5wcmVmZXJlbmNlKSByZXR1cm4gY29udGVzdHMuZmluZChjb250ZXN0ID0+IGNvbnRlc3QuaWQgPT09IHRoaXMucHJlZmVyZW5jZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuZGVmYXVsdHMua2luZCA9PT0gJ2V2ZW50Jykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGVmYXVsdHMuZXZlbnQgIT09ICdhbnknKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBbLi4uY29udGVzdHNdLnJldmVyc2UoKS5maW5kKGNvbnRlc3QgPT4gY29udGVzdC5jYXRlZ29yeSA9PT0gdGhpcy5kZWZhdWx0cy5ldmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50IHx8IGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHJldHVybiBldmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb250ZXN0cy5hdCgtMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmNhdGVnb3J5ID09PSAnZGFpbHknKSA/P1xuICAgICAgICAgICAgY29udGVzdHMuZmluZChjb250ZXN0ID0+IGNvbnRlc3QuY2F0ZWdvcnkgPT09IG51bGwpID8/IGNvbnRlc3RzWzBdO1xuICAgIH1cblxuICAgIGNsZWFyRXhwaXJlZFBpbihsaXN0OiBIVE1MRWxlbWVudCwgY29udGVzdHM6IENvbnRlc3RDYXJkW10sIGZpbmlzaGVkOiBSZWFkb25seVNldDxzdHJpbmc+KSB7XG4gICAgICAgIGlmICghdGhpcy5wcmVmZXJlbmNlIHx8IGNvbnRlc3RzLnNvbWUoKHsgaWQgfSkgPT4gaWQgPT09IHRoaXMucHJlZmVyZW5jZSkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBhY3RpdmUgPSB3aW5kb3cuY29udGVzdHM/LmFjdGl2ZTtcbiAgICAgICAgY29uc3QgbWlzc2luZyA9IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScgJiYgbGlzdC5xdWVyeVNlbGVjdG9yKCcuY29udGVzdF9oZWFkZXInKSAmJlxuICAgICAgICAgICAgYWN0aXZlICYmICFPYmplY3QudmFsdWVzKGFjdGl2ZSkuc29tZShjb250ZXN0ID0+IFN0cmluZyhjb250ZXN0Py5pZF9jb250ZXN0KSA9PT0gdGhpcy5wcmVmZXJlbmNlKTtcbiAgICAgICAgaWYgKCFmaW5pc2hlZC5oYXModGhpcy5wcmVmZXJlbmNlKSAmJiAhbWlzc2luZykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGV4cGlyZWRJZCA9IHRoaXMucHJlZmVyZW5jZTtcbiAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gJyc7XG4gICAgICAgIHRoaXMuc3RvcEp1bXA/LihmYWxzZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoU3RyaW5nKGxzR2V0KCdDb250ZXN0U3RhcnRJZCcpKSA9PT0gZXhwaXJlZElkKSBsc1JtKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBjbGVhciB0aGUgZXhwaXJlZCBjb250ZXN0IHByZWZlcmVuY2U6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZVBpbnMobGlzdDogSFRNTEVsZW1lbnQsIGNvbnRlc3RzOiBDb250ZXN0Q2FyZFtdKSB7XG4gICAgICAgIGNvbnN0IGhvc3RzID0gbmV3IFNldChjb250ZXN0cy5tYXAoKHsgdGl0bGUsIGhlYWRlciB9KSA9PiB0aXRsZSB8fCBoZWFkZXIpKTtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sIG9mIGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLmphcnZpcy1jb250ZXN0LXBpbiwgLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKSkge1xuICAgICAgICAgICAgaWYgKCFjb250cm9sLnBhcmVudEVsZW1lbnQgfHwgIWhvc3RzLmhhcyhjb250cm9sLnBhcmVudEVsZW1lbnQpKSBjb250cm9sLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCB7IGlkLCB0aXRsZSwgaGVhZGVyLCBsYWJlbCB9IG9mIGNvbnRlc3RzKSB7XG4gICAgICAgICAgICBjb25zdCBob3N0ID0gdGl0bGUgfHwgaGVhZGVyO1xuICAgICAgICAgICAgbGV0IHBpbiA9IGhvc3QucXVlcnlTZWxlY3RvcjxIVE1MQnV0dG9uRWxlbWVudD4oJzpzY29wZSA+IC5qYXJ2aXMtY29udGVzdC1waW4nKTtcbiAgICAgICAgICAgIGlmICghcGluKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1jb250ZXN0LXBpbic7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVzdElkID0gYnV0dG9uLmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRlc3RJZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLnByZWZlcmVuY2UgPT09IGNvbnRlc3RJZCA/ICcnIDogY29udGVzdElkO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQpIGxzU2V0KCdDb250ZXN0U3RhcnRJZCcsIG5leHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBsc1JtKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gbmV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcEp1bXA/LigpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBzYXZlIHRoZSBjb250ZXN0IHByZWZlcmVuY2U6JywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBwaW4gPSBob3N0LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwaW5uZWQgPSB0aGlzLnByZWZlcmVuY2UgPT09IGlkO1xuICAgICAgICAgICAgcGluLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgU3RyaW5nKHBpbm5lZCkpO1xuICAgICAgICAgICAgcGluLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHBpbm5lZCA/IGBVbnBpbiAke2xhYmVsfWAgOiBgUGluICR7bGFiZWx9IHRvIG9wZW4gb24gcmVsb2FkYCk7XG4gICAgICAgICAgICBwaW4udGl0bGUgPSBwaW5uZWQgPyAnUGlubmVkLiBDbGljayB0byB1c2UgeW91ciBjb250ZXN0IGRlZmF1bHRzLicgOiAnT3BlbiB0aGlzIGNvbnRlc3Qgd2hlbiB0aGUgcGFnZSByZWxvYWRzJztcblxuICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gaG9zdC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKTtcbiAgICAgICAgICAgIGlmICghcGlubmVkKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24/LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNob2ljZSA9IG1ha2VSYW5rQ2hvaWNlKCdQaW5uZWQgbGVhZGVyYm9hcmQgc3RhcnQnLCByYW5rID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxzU2V0KCdDb250ZXN0UGlubmVkUmFuaycsIHsgaWQsIHJhbmsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGNob2ljZSwgcmFuayk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGxlYWRlcmJvYXJkIHBvc2l0aW9uOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjaG9pY2UuY2xhc3NMaXN0LmFkZCgnamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpO1xuICAgICAgICAgICAgICAgIHBpbi5hZnRlcihjaG9pY2UpO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gY2hvaWNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShwb3NpdGlvbiwgcmVhZFBpbm5lZFJhbmsoaWQsIHRoaXMuZGVmYXVsdHMucmFuaykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IGxpc3QucXVlcnlTZWxlY3RvcignLmNvbnRlc3RfaGVhZGVyX2FjdGl2ZScpPy5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpO1xuICAgICAgICBpZiAoc2VsZWN0ZWQpIHJldHVybiBzZWxlY3RlZC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcblxuICAgICAgICBjb25zdCBwYW5lbHMgPSBBcnJheS5mcm9tKHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYW5raW5nW2lkX2NvbnRlc3RdJykpXG4gICAgICAgICAgICAuZmlsdGVyKHBhbmVsID0+IHBhbmVsLmdldENsaWVudFJlY3RzKCkubGVuZ3RoICYmIGdldENvbXB1dGVkU3R5bGUocGFuZWwpLnZpc2liaWxpdHkgPT09ICd2aXNpYmxlJyk7XG4gICAgICAgIHJldHVybiBwYW5lbHMubGVuZ3RoID09PSAxID8gcGFuZWxzWzBdLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpIDogbnVsbDtcbiAgICB9XG5cbiAgICBzaG93TGVhZGVyYm9hcmQocmlnaHQ6IEhUTUxFbGVtZW50LCBjb250ZXN0SWQ6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgaWYgKCFjb250ZXN0SWQpIHtcbiAgICAgICAgICAgIHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1vdGhlcicpLmZvckVhY2gocGFuZWwgPT4gcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnamFydmlzLWNvbnRlc3Qtb3RoZXInKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwYW5lbCBvZiByaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcucmFua2luZ1tpZF9jb250ZXN0XScpKSB7XG4gICAgICAgICAgICBwYW5lbC5jbGFzc0xpc3QudG9nZ2xlKCdqYXJ2aXMtY29udGVzdC1vdGhlcicsIHBhbmVsLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpICE9PSBjb250ZXN0SWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0T3duUm93KGJvYXJkOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBvd24gPSBib2FyZC5xdWVyeVNlbGVjdG9yKCcubGVhZFRhYmxlIHRyLmxlYWRfdGFibGVfZGVmYXVsdCcpO1xuICAgICAgICBpZiAob3duKSByZXR1cm4gb3duO1xuXG4gICAgICAgIGNvbnN0IGhlcm9JZCA9ICh3aW5kb3cuc2hhcmVkPy5IZXJvIHx8IHdpbmRvdy5IZXJvKT8uaW5mb3M/LmlkO1xuICAgICAgICBpZiAoaGVyb0lkID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGJvYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5sZWFkVGFibGUgdHJbc29ydGluZ19pZF0nKSlcbiAgICAgICAgICAgIC5maW5kKHJvdyA9PiByb3cuZ2V0QXR0cmlidXRlKCdzb3J0aW5nX2lkJykgPT09IFN0cmluZyhoZXJvSWQpKTtcbiAgICB9XG5cbiAgICBnZXRMZWFkZXJib2FyZFNjcm9sbGVyKHJpZ2h0OiBIVE1MRWxlbWVudCwgaWQ6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShyaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcucmFua2luZ1tpZF9jb250ZXN0XScpKVxuICAgICAgICAgICAgLmZpbmQocGFuZWwgPT4gcGFuZWwuZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0JykgPT09IGlkKT8ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5sZWFkX3RhYmxlX3ZpZXcnKTtcbiAgICB9XG5cbiAgICB1cGRhdGVTaG9ydGN1dHMobGlzdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudCwgY29udGVzdHM6IENvbnRlc3RDYXJkW10pIHtcbiAgICAgICAgY29uc3QgY2FudmFzID0gbGlzdC5jbG9zZXN0PEhUTUxFbGVtZW50PignI2NvbnRlc3RzJyk7XG4gICAgICAgIGlmICghY2FudmFzKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgc2hvcnRjdXRzID0gY29udGVzdHMubWFwKCh7IGlkLCBoZWFkZXIsIGxhYmVsLCBjYXRlZ29yeSB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBib2FyZCA9IHRoaXMuZ2V0TGVhZGVyYm9hcmRTY3JvbGxlcihyaWdodCwgaWQpO1xuICAgICAgICAgICAgY29uc3QgcmFuayA9IGhlYWRlci5xdWVyeVNlbGVjdG9yKCcucGVyc29uYWxfcmV3YXJkcyAucmFuaycpPy50ZXh0Q29udGVudD8udHJpbSgpIHx8XG4gICAgICAgICAgICAgICAgKGJvYXJkICYmIHRoaXMuZ2V0T3duUm93KGJvYXJkKT8ucXVlcnlTZWxlY3RvcigndGQnKT8udGV4dENvbnRlbnQ/LnRyaW0oKSkgfHwgJyc7XG4gICAgICAgICAgICByZXR1cm4geyBpZCwgbmFtZTogbGFiZWwsIGNhdGVnb3J5OiBjYXRlZ29yeSA/IENPTlRFU1RfU0hPUlRfTEFCRUxTW2NhdGVnb3J5XSA6ICdDb250ZXN0JywgcmFuayB9O1xuICAgICAgICB9KTtcbiAgICAgICAgcmVuZGVyQ29udGVzdFNob3J0Y3V0cyhjYW52YXMsIHNob3J0Y3V0cywgdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCksIGlkID0+IHRoaXMub3BlblNob3J0Y3V0KGlkKSk7XG4gICAgfVxuXG4gICAgb3BlblNob3J0Y3V0KGlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgeyBsaXN0LCByaWdodCB9ID0gdGhpcztcbiAgICAgICAgaWYgKCFsaXN0IHx8ICFyaWdodCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGNhcmQgPSBsaXN0LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KGAuY29udGVzdFtpZF9jb250ZXN0PVwiJHtDU1MuZXNjYXBlKGlkKX1cIl1gKTtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gY2FyZD8ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jb250ZXN0X2hlYWRlcicpO1xuICAgICAgICBpZiAoIWNhcmQgfHwgIWhlYWRlciB8fCBoZWFkZXIubWF0Y2hlcygnLmVuZGVkJykgfHwgY2FyZC5tYXRjaGVzKCcuZW5kZWQnKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGFscmVhZHlTZWxlY3RlZCA9IHRoaXMuZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdCwgcmlnaHQpID09PSBpZDtcbiAgICAgICAgdGhpcy5zdG9wSnVtcD8uKCk7XG4gICAgICAgIHRoaXMucHJlcGFyZVN3aXRjaChsaXN0LCByaWdodCwgaWQsIGNhcmQpO1xuICAgICAgICBpZiAoIWFscmVhZHlTZWxlY3RlZCkgKGhlYWRlci5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihDT05URVNUX1RJVExFX1NFTEVDVE9SKSB8fCBoZWFkZXIpLmNsaWNrKCk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHByZXBhcmVTd2l0Y2gobGlzdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudCwgaWQ6IHN0cmluZyB8IG51bGwsIHNob3J0Y3V0Q2FyZD86IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgaWYgKGlkICYmIChzaG9ydGN1dENhcmQgfHwgaWQgIT09IHRoaXMuZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdCwgcmlnaHQpKSkgdGhpcy5wb3NpdGlvblN3aXRjaChsaXN0LCByaWdodCwgaWQsIHNob3J0Y3V0Q2FyZCk7XG4gICAgICAgIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHJpZ2h0LCBudWxsKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgbG9ja1Njcm9sbChzY3JvbGxlcjogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgJChzY3JvbGxlcikuc3RvcCh0cnVlLCBmYWxzZSk7XG4gICAgICAgIC8vIFRoZSBnYW1lIGNhbiBzdGFydCBhbm90aGVyIGpRdWVyeSB0d2VlbiBhZnRlciBsb2FkLiBCbG9jayBpdHMgd3JpdGVzIG9uIHRoaXMgcGFuZSBvbmx5LlxuICAgICAgICBjb25zdCBpZ25vcmVTY3JvbGwgPSAoKSA9PiB7fTtcbiAgICAgICAgY29uc3QgZ2V0ID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwgJ3Njcm9sbFRvcCcpPy5nZXQ7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3JzID0gT2JqZWN0LmVudHJpZXMoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiB7IGdldCwgc2V0OiBpZ25vcmVTY3JvbGwgfSxcbiAgICAgICAgICAgIHNjcm9sbDogeyB2YWx1ZTogaWdub3JlU2Nyb2xsLCB3cml0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgc2Nyb2xsVG86IHsgdmFsdWU6IGlnbm9yZVNjcm9sbCwgd3JpdGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHNjcm9sbEJ5OiB7IHZhbHVlOiBpZ25vcmVTY3JvbGwsIHdyaXRhYmxlOiB0cnVlIH1cbiAgICAgICAgfSkuZmlsdGVyKChba2V5XSkgPT4gIU9iamVjdC5oYXNPd24oc2Nyb2xsZXIsIGtleSkpO1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGRlc2NyaXB0b3JdIG9mIGRlc2NyaXB0b3JzKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2Nyb2xsZXIsIGtleSwgeyAuLi5kZXNjcmlwdG9yLCBjb25maWd1cmFibGU6IHRydWUgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgJChzY3JvbGxlcikuc3RvcCh0cnVlLCBmYWxzZSk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGRlc2NyaXB0b3JdIG9mIGRlc2NyaXB0b3JzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc2Nyb2xsZXIsIGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgJiYgY3VycmVudC52YWx1ZSA9PT0gZGVzY3JpcHRvci52YWx1ZSAmJiBjdXJyZW50LnNldCA9PT0gZGVzY3JpcHRvci5zZXQpIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoc2Nyb2xsZXIsIGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAganVtcFRvKHNjcm9sbGVyOiBIVE1MRWxlbWVudCwgdGFyZ2V0OiBFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCwgY2VudGVyID0gZmFsc2UpIHtcbiAgICAgICAgbGV0IHRvcCA9IDA7XG4gICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGJvdW5kcyA9IHNjcm9sbGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3Qgc2NhbGUgPSBib3VuZHMuaGVpZ2h0IC8gc2Nyb2xsZXIub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgaWYgKCFzY2FsZSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBpdGVtID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgdG9wID0gc2Nyb2xsZXIuc2Nyb2xsVG9wICsgKGl0ZW0udG9wIC0gYm91bmRzLnRvcCkgLyBzY2FsZSAtIHNjcm9sbGVyLmNsaWVudFRvcDtcbiAgICAgICAgICAgIGlmIChjZW50ZXIpIHRvcCAtPSAoc2Nyb2xsZXIuY2xpZW50SGVpZ2h0IC0gaXRlbS5oZWlnaHQgLyBzY2FsZSkgLyAyO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2Nyb2xsSW5zdGFudGx5KHNjcm9sbGVyLCB0b3ApO1xuICAgIH1cblxuICAgIHNjcm9sbEluc3RhbnRseShzY3JvbGxlcjogSFRNTEVsZW1lbnQsIHBvc2l0aW9uOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgdG9wID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oc2Nyb2xsZXIuc2Nyb2xsSGVpZ2h0IC0gc2Nyb2xsZXIuY2xpZW50SGVpZ2h0LCBwb3NpdGlvbikpO1xuICAgICAgICBpZiAoTWF0aC5hYnModG9wIC0gc2Nyb2xsZXIuc2Nyb2xsVG9wKSA+PSAxKSB7XG4gICAgICAgICAgICBjb25zdCBzY3JvbGxUbyA9IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbFRvIGFzIChvcHRpb25zOiBTY3JvbGxUb09wdGlvbnMpID0+IHZvaWQ7XG4gICAgICAgICAgICBzY3JvbGxUby5jYWxsKHNjcm9sbGVyLCB7IHRvcCwgYmVoYXZpb3I6ICdpbnN0YW50JyB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBvc2l0aW9uU3dpdGNoKGxpc3Q6IEhUTUxFbGVtZW50LCByaWdodDogSFRNTEVsZW1lbnQsIGlkOiBzdHJpbmcsIHNob3J0Y3V0Q2FyZD86IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuc3dpdGNoU2Nyb2xsPy5zdG9wKCk7XG5cbiAgICAgICAgY29uc3QgbGlzdFRvcCA9IGxpc3Quc2Nyb2xsVG9wO1xuICAgICAgICBjb25zdCBhdE93blJhbmsgPSB0aGlzLmRlZmF1bHRzLnJhbmsgPT09ICdtaW5lJztcbiAgICAgICAgY29uc3QgcmVsZWFzZUxpc3QgPSB0aGlzLnN0b3BTd2l0Y2hTY3JvbGwgfHwgc2hvcnRjdXRDYXJkID8gdGhpcy5sb2NrU2Nyb2xsKGxpc3QpIDogdW5kZWZpbmVkO1xuICAgICAgICBsZXQgYm9hcmQ6IEhUTUxFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHJlbGVhc2VCb2FyZDogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCByZXN0b3JlID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuZ2V0TGVhZGVyYm9hcmRTY3JvbGxlcihyaWdodCwgaWQpO1xuICAgICAgICAgICAgaWYgKG5leHQgIT09IGJvYXJkKSB7XG4gICAgICAgICAgICAgICAgcmVsZWFzZUJvYXJkPy4oKTtcbiAgICAgICAgICAgICAgICBib2FyZCA9IG5leHQ7XG4gICAgICAgICAgICAgICAgcmVsZWFzZUJvYXJkID0gYm9hcmQgPyB0aGlzLmxvY2tTY3JvbGwoYm9hcmQpIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNob3J0Y3V0Q2FyZCAmJiBsaXN0LmNvbnRhaW5zKHNob3J0Y3V0Q2FyZCkpIHRoaXMuanVtcFRvKGxpc3QsIHNob3J0Y3V0Q2FyZCk7XG4gICAgICAgICAgICBlbHNlIGlmIChyZWxlYXNlTGlzdCkgdGhpcy5zY3JvbGxJbnN0YW50bHkobGlzdCwgbGlzdFRvcCk7XG4gICAgICAgICAgICBpZiAoYm9hcmQ/LmNsaWVudEhlaWdodCAmJiB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSA9PT0gaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmp1bXBUbyhib2FyZCwgYXRPd25SYW5rID8gdGhpcy5nZXRPd25Sb3coYm9hcmQpIDogbnVsbCwgYXRPd25SYW5rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBoYW5kbGVycyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSwgc2lnbmFsOiBoYW5kbGVycy5zaWduYWwgfTtcbiAgICAgICAgY29uc3Qgc3RvcCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICBoYW5kbGVycy5hYm9ydCgpO1xuICAgICAgICAgICAgcmVsZWFzZUxpc3Q/LigpO1xuICAgICAgICAgICAgcmVsZWFzZUJvYXJkPy4oKTtcbiAgICAgICAgICAgIHRoaXMuc3dpdGNoU2Nyb2xsID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KHN0b3AsIDQwMDApO1xuICAgICAgICBjb25zdCBvblNjcm9sbCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmICgocmVsZWFzZUxpc3QgJiYgZXZlbnQudGFyZ2V0ID09PSBsaXN0KSB8fCBldmVudC50YXJnZXQgPT09IGJvYXJkKSByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSB7XG4gICAgICAgICAgICBwYW5lLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBbJ3doZWVsJywgJ3RvdWNobW92ZScsICdwb2ludGVyZG93biddKSBwYW5lLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgc3RvcCwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChbJ0Fycm93VXAnLCAnQXJyb3dEb3duJywgJ1BhZ2VVcCcsICdQYWdlRG93bicsICdIb21lJywgJ0VuZCcsICcgJ10uaW5jbHVkZXMoZXZlbnQua2V5KSkgc3RvcCgpO1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5zd2l0Y2hTY3JvbGwgPSB7IHJlc3RvcmUsIHN0b3AgfTtcbiAgICAgICAgcmVzdG9yZSgpO1xuICAgIH1cblxuICAgIG9wZW5Db250ZXN0KGxpc3Q6IEhUTUxFbGVtZW50LCByaWdodDogSFRNTEVsZW1lbnQsIHsgaWQsIGNhcmQsIGhlYWRlciwgdGl0bGUgfTogQ29udGVzdENhcmQpIHtcbiAgICAgICAgZm9yIChjb25zdCBwYW5lIG9mIFtsaXN0LCByaWdodF0pIHBhbmUuY2xhc3NMaXN0LmFkZCgnamFydmlzLWNvbnRlc3QtaW5zdGFudCcsICdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgIGNvbnN0IHJhbmsgPSBpZCA9PT0gdGhpcy5wcmVmZXJlbmNlID8gcmVhZFBpbm5lZFJhbmsoaWQsIHRoaXMuZGVmYXVsdHMucmFuaykgOiB0aGlzLmRlZmF1bHRzLnJhbms7XG4gICAgICAgIGNvbnN0IHBsYWNlQXRPd25SYW5rID0gcmFuayA9PT0gJ21pbmUnO1xuICAgICAgICBjb25zdCByZWxlYXNlTGlzdCA9IHRoaXMubG9ja1Njcm9sbChsaXN0KTtcbiAgICAgICAgbGV0IGJvYXJkOiBIVE1MRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCByZWxlYXNlQm9hcmQ6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHBvc2l0aW9uZWQgPSBmYWxzZTtcbiAgICAgICAgbGV0IGxhc3RBdHRlbXB0OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgIGNvbnN0IHVwZGF0ZUJvYXJkID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuZ2V0TGVhZGVyYm9hcmRTY3JvbGxlcihyaWdodCwgaWQpO1xuICAgICAgICAgICAgaWYgKGJvYXJkID09PSBuZXh0KSByZXR1cm47XG4gICAgICAgICAgICByZWxlYXNlQm9hcmQ/LigpO1xuICAgICAgICAgICAgYm9hcmQgPSBuZXh0O1xuICAgICAgICAgICAgcmVsZWFzZUJvYXJkID0gYm9hcmQgPyB0aGlzLmxvY2tTY3JvbGwoYm9hcmQpIDogdW5kZWZpbmVkO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXZlYWwgPSAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkgcGFuZS5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdG9yZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghbGlzdC5pc0Nvbm5lY3RlZCB8fCAhcmlnaHQuaXNDb25uZWN0ZWQgfHwgIWxpc3QuY29udGFpbnMoY2FyZCkpIHJldHVybjtcblxuICAgICAgICAgICAgdXBkYXRlQm9hcmQoKTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCk7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQgIT09IGlkICYmIHNlbGVjdGVkICE9PSBsYXN0QXR0ZW1wdCkge1xuICAgICAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIG51bGwpO1xuICAgICAgICAgICAgICAgICh0aXRsZSB8fCBoZWFkZXIpLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgdXBkYXRlQm9hcmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghYm9hcmQ/LmNsaWVudEhlaWdodCB8fCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSAhPT0gaWQgfHxcbiAgICAgICAgICAgICAgICAocGxhY2VBdE93blJhbmsgJiYgIWJvYXJkLnF1ZXJ5U2VsZWN0b3IoJy5sZWFkVGFibGUnKSkpIHJldHVybjtcbiAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIGlkKTtcbiAgICAgICAgICAgIHRoaXMuanVtcFRvKGxpc3QsIGNhcmQpO1xuICAgICAgICAgICAgdGhpcy5qdW1wVG8oYm9hcmQsIHBsYWNlQXRPd25SYW5rID8gdGhpcy5nZXRPd25Sb3coYm9hcmQpIDogbnVsbCwgcGxhY2VBdE93blJhbmspO1xuICAgICAgICAgICAgaWYgKCFwb3NpdGlvbmVkKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICByZXZlYWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb3JyZWN0IGJyb3dzZXItZHJpdmVuIG1vdmVzLCBzdWNoIGFzIHNjcm9sbEludG9WaWV3IG9uIGEgbGVhZGVyYm9hcmQgcm93LCBiZWZvcmUgcGFpbnQuXG4gICAgICAgIGNvbnN0IG9uU2Nyb2xsID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gbGlzdCB8fCBldmVudC50YXJnZXQgPT09IGJvYXJkKSByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGlucHV0RXZlbnRzID0gWydwb2ludGVyZG93bicsICd0b3VjaHN0YXJ0JywgJ3doZWVsJywgJ2NsaWNrJ107XG4gICAgICAgIGNvbnN0IG9uSW5wdXQgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkKSBzdG9wKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0b3BPbktleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmlzVHJ1c3RlZCAmJiBbJ1RhYicsICdBcnJvd1VwJywgJ0Fycm93RG93bicsICdQYWdlVXAnLCAnUGFnZURvd24nLCAnSG9tZScsICdFbmQnLCAnRW50ZXInLCAnICddLmluY2x1ZGVzKGV2ZW50LmtleSkpIHN0b3AoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgYWZ0ZXJMb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0b3AgPSAoZmluaXNoID0gdHJ1ZSkgPT4ge1xuICAgICAgICAgICAgcmVsZWFzZUxpc3QoKTtcbiAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgICAgIHBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25TY3JvbGwsIHRydWUpO1xuICAgICAgICAgICAgICAgIHBhbmUuY2xhc3NMaXN0LnJlbW92ZSgnamFydmlzLWNvbnRlc3QtaW5zdGFudCcsICdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIGlucHV0RXZlbnRzKSBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBvbklucHV0LCB0cnVlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBzdG9wT25LZXksIHRydWUpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBhZnRlckxvYWQpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgIHRoaXMuc3RvcEp1bXAgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZXBvc2l0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucmVzdG9yaW5nQ2FyZCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoZmluaXNoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldmVhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoc3RvcCwgNDAwMCk7XG4gICAgICAgIHRoaXMuc3RvcEp1bXAgPSBzdG9wO1xuICAgICAgICB0aGlzLnJlcG9zaXRpb24gPSByZXN0b3JlO1xuICAgICAgICB0aGlzLnJlc3RvcmluZ0NhcmQgPSBjYXJkO1xuICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgcGFuZS5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCwgeyBwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgaW5wdXRFdmVudHMpIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uSW5wdXQsIHsgcGFzc2l2ZTogdHJ1ZSwgY2FwdHVyZTogdHJ1ZSB9KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHN0b3BPbktleSwgdHJ1ZSk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFmdGVyTG9hZCwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICByZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEnKTtcbiAgICAgICAgY29uc3QgcmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignI2NvbnRlc3RzIC5yaWdodF9wYXJ0Jyk7XG4gICAgICAgIGlmICh0aGlzLmxpc3QgIT09IGxpc3QgfHwgdGhpcy5yaWdodCAhPT0gcmlnaHQpIHRoaXMuc3dpdGNoU2Nyb2xsPy5zdG9wKCk7XG4gICAgICAgIGlmICh0aGlzLnN0b3BKdW1wICYmICh0aGlzLmxpc3QgIT09IGxpc3QgfHwgdGhpcy5yaWdodCAhPT0gcmlnaHQgfHwgIWxpc3Q/LmNvbnRhaW5zKHRoaXMucmVzdG9yaW5nQ2FyZCkpKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BKdW1wKGZhbHNlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0KSB0aGlzLnNob3dMZWFkZXJib2FyZCh0aGlzLnJpZ2h0LCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxpc3QgPSBsaXN0O1xuICAgICAgICB0aGlzLnJpZ2h0ID0gcmlnaHQ7XG4gICAgICAgIGlmICghbGlzdCB8fCAhcmlnaHQgfHwgIWxpc3QuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggfHwgZ2V0Q29tcHV0ZWRTdHlsZShsaXN0KS52aXNpYmlsaXR5ICE9PSAndmlzaWJsZScpIHJldHVybjtcblxuICAgICAgICBjb25zdCBmaW5pc2hlZCA9IG5ldyBTZXQoT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmZpbmlzaGVkIHx8IHt9KVxuICAgICAgICAgICAgLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbCkubWFwKGNvbnRlc3QgPT4gU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCkpKTtcbiAgICAgICAgZm9yIChjb25zdCBlbmRlZCBvZiBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZXN0LmVuZGVkLCAuY29udGVzdF9oZWFkZXIuZW5kZWQnKSkge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBlbmRlZC5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmIChpZCkgZmluaXNoZWQuYWRkKGlkKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb250ZXN0cyA9IHRoaXMuZ2V0Q29udGVzdHMobGlzdCwgZmluaXNoZWQpO1xuICAgICAgICB0aGlzLmNsZWFyRXhwaXJlZFBpbihsaXN0LCBjb250ZXN0cywgZmluaXNoZWQpO1xuICAgICAgICB0aGlzLnVwZGF0ZVBpbnMobGlzdCwgY29udGVzdHMpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlcG9zaXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMucmVwb3NpdGlvbigpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhcnR1cFBlbmRpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuZ2V0VGFyZ2V0KGNvbnRlc3RzKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXQpIHRoaXMub3BlbkNvbnRlc3QobGlzdCwgcmlnaHQsIHRhcmdldCk7XG4gICAgICAgICAgICBlbHNlIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnICYmICF0aGlzLnByZWZlcmVuY2UpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHJpZ2h0LCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSk7XG4gICAgICAgICAgICB0aGlzLnN3aXRjaFNjcm9sbD8ucmVzdG9yZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlU2hvcnRjdXRzKGxpc3QsIHJpZ2h0LCBjb250ZXN0cyk7XG4gICAgfVxuXG4gICAgcnVuKHsgbm9Td2l0Y2hTY3JvbGwgPSB0cnVlIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBjb25zdCBwaW4gPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RTdGFydElkJyk7XG4gICAgICAgIHRoaXMucHJlZmVyZW5jZSA9ICgodHlwZW9mIHBpbiA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHBpbiA9PT0gJ251bWJlcicpICYmIHBpbikgPyBTdHJpbmcocGluKSA6ICcnO1xuICAgICAgICB0aGlzLnN0YXJ0dXBQZW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdG9wU3dpdGNoU2Nyb2xsID0gbm9Td2l0Y2hTY3JvbGw7XG4gICAgICAgIHRoaXMuZGVmYXVsdHMgPSByZWFkQ29udGVzdERlZmF1bHRzKCk7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICBjb25zdCB7IHNpZ25hbCB9ID0gdGhpcy5saXN0ZW5lcnM7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihtdXRhdGlvbnMgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZXN0cyAubGVmdF9wYXJ0IC5zY3JvbGxfYXJlYScpO1xuICAgICAgICAgICAgY29uc3QgcmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY29udGVzdHMgLnJpZ2h0X3BhcnQnKTtcbiAgICAgICAgICAgIGlmIChsaXN0ICE9PSB0aGlzLmxpc3QgfHwgcmlnaHQgIT09IHRoaXMucmlnaHQgfHwgbXV0YXRpb25zLnNvbWUoKHsgdGFyZ2V0IH0pID0+XG4gICAgICAgICAgICAgICAgKGxpc3QgJiYgKGxpc3QuY29udGFpbnModGFyZ2V0KSB8fCB0YXJnZXQuY29udGFpbnMobGlzdCkpKSB8fFxuICAgICAgICAgICAgICAgIChyaWdodCAmJiAocmlnaHQuY29udGFpbnModGFyZ2V0KSB8fCB0YXJnZXQuY29udGFpbnMocmlnaHQpKSkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IHRydWUsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFsnY2xhc3MnLCAnc3R5bGUnLCAnaGlkZGVuJywgJ2lkX2NvbnRlc3QnXSB9KTtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4gdGhpcy5yZWZyZXNoKCksIHsgb25jZTogdHJ1ZSwgc2lnbmFsIH0pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2FudmFzID0gdGhpcy5saXN0Py5jbG9zZXN0PEhUTUxFbGVtZW50PignI2NvbnRlc3RzJyk7XG4gICAgICAgICAgICBjb25zdCBiYXIgPSBjYW52YXM/LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCc6c2NvcGUgPiAuamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzJyk7XG4gICAgICAgICAgICBpZiAoY2FudmFzICYmIGJhcikgcG9zaXRpb25Db250ZXN0U2hvcnRjdXRzKGNhbnZhcywgYmFyKTtcbiAgICAgICAgfSwgeyBzaWduYWwgfSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoIWV2ZW50LmlzVHJ1c3RlZCB8fCAhKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpIHx8ICF0aGlzLnJpZ2h0IHx8ICF0aGlzLmxpc3Q/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCcuY29udGVzdF9oZWFkZXInKTtcbiAgICAgICAgICAgIGlmICghaGVhZGVyIHx8IGV2ZW50LnRhcmdldC5jbG9zZXN0KCcuamFydmlzLWNvbnRlc3QtcGluLCAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGlkID0gaGVhZGVyLmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgdGhpcy5wcmVwYXJlU3dpdGNoKHRoaXMubGlzdCwgdGhpcy5yaWdodCwgaWQgPz8gbnVsbCk7XG4gICAgICAgIH0sIHsgY2FwdHVyZTogdHJ1ZSwgc2lnbmFsIH0pO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxuXG4gICAgdXBkYXRlU3ViU2V0dGluZyhrZXk6IHN0cmluZywgdmFsdWU6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKGtleSAhPT0gJ25vU3dpdGNoU2Nyb2xsJykgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0b3BTd2l0Y2hTY3JvbGwgPSB2YWx1ZTtcbiAgICAgICAgaWYgKCF2YWx1ZSkgdGhpcy5zd2l0Y2hTY3JvbGw/LnN0b3AoKTtcbiAgICB9XG5cbiAgICB0ZWFyRG93bigpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlcj8uZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLmxpc3RlbmVycz8uYWJvcnQoKTtcbiAgICAgICAgdGhpcy5zdG9wSnVtcD8uKCk7XG4gICAgICAgIHRoaXMuc3dpdGNoU2Nyb2xsPy5zdG9wKCk7XG4gICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5saXN0Py5jbG9zZXN0KCcjY29udGVzdHMnKT8ucXVlcnlTZWxlY3RvcignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cycpPy5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5saXN0Py5xdWVyeVNlbGVjdG9yQWxsKCcuamFydmlzLWNvbnRlc3QtcGluLCAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpLmZvckVhY2goY29udHJvbCA9PiBjb250cm9sLnJlbW92ZSgpKTtcbiAgICAgICAgaWYgKHRoaXMucmlnaHQpIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHRoaXMucmlnaHQsIG51bGwpO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSBmYWxzZTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuXG5leHBvcnQgY2xhc3MgTGVhZ3VlVG9wMjAgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnbGVhZ3VlVG9wMjAnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUHJvbW90aW9uIHRhcmdldFwiLCBcIlNob3cgdGhlIHBvaW50cyBuZWVkZWQgdG8gcmVhY2ggdGhlIGxhcmdlciBvZiB0aGUgdG9wIDIwIG9yIHRvcCAxNSUgYmVsb3cgdGhlIGhpZ2hlc3QgbGVhZ3VlIHRpZXIuXCIpXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3Vlcy5odG1sJyk7XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZSgnLnNjcmlwdExlYWd1ZUluZm8nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdW1tYXJ5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjcmlwdExlYWd1ZUluZm8nKTtcbiAgICAgICAgICAgIGlmICghc3VtbWFyeSB8fCBzdW1tYXJ5LnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXNUb3AyMCcpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHsgb3Bwb25lbnRzX2xpc3QsIGN1cnJlbnRfdGllcl9udW1iZXIsIG1heF9sZWFndWUgfSA9IHdpbmRvdztcbiAgICAgICAgICAgIGNvbnN0IHRpZXIgPSBOdW1iZXIoY3VycmVudF90aWVyX251bWJlcik7XG4gICAgICAgICAgICBpZiAoISh0aWVyID4gMCAmJiB0aWVyIDwgTnVtYmVyKG1heF9sZWFndWUpKSkgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgaGVyb0lkID0gKHdpbmRvdy5zaGFyZWQ/Lkhlcm8gfHwgd2luZG93Lkhlcm8pPy5pbmZvcz8uaWQ7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkob3Bwb25lbnRzX2xpc3QpIHx8IGhlcm9JZCA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHBsYXllciA9IG9wcG9uZW50c19saXN0LmZpbmQoKHsgcGxheWVyIH0pID0+IFN0cmluZyhwbGF5ZXI/LmlkX2ZpZ2h0ZXIpID09PSBTdHJpbmcoaGVyb0lkKSk7XG4gICAgICAgICAgICBjb25zdCByYW5rID0gTnVtYmVyKHBsYXllcj8ucGxhY2UpO1xuICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKHJhbmspIHx8IHJhbmsgPCAxKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGJyYWNrZXRTaXplID0gb3Bwb25lbnRzX2xpc3QubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3QgcHJvbW90aW9uUmFuayA9IE1hdGgubWF4KDIwLCBNYXRoLmNlaWwoYnJhY2tldFNpemUgKiAxNSAvIDEwMCkpO1xuICAgICAgICAgICAgY29uc3QgaW5Qcm9tb3Rpb24gPSByYW5rIDw9IHByb21vdGlvblJhbms7XG4gICAgICAgICAgICBjb25zdCBjb21wYXJpc29uUmFuayA9IGluUHJvbW90aW9uID8gcHJvbW90aW9uUmFuayArIDEgOiBwcm9tb3Rpb25SYW5rO1xuICAgICAgICAgICAgY29uc3QgY3V0b2ZmID0gb3Bwb25lbnRzX2xpc3QuZmluZCgoeyBwbGFjZSB9KSA9PiBOdW1iZXIocGxhY2UpID09PSBjb21wYXJpc29uUmFuayk7XG4gICAgICAgICAgICBpZiAocGxheWVyPy5wbGF5ZXJfbGVhZ3VlX3BvaW50cyA9PSBudWxsIHx8IGN1dG9mZj8ucGxheWVyX2xlYWd1ZV9wb2ludHMgPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBzY29yZSA9IE51bWJlcihwbGF5ZXIucGxheWVyX2xlYWd1ZV9wb2ludHMpO1xuICAgICAgICAgICAgY29uc3QgY3V0b2ZmU2NvcmUgPSBOdW1iZXIoY3V0b2ZmLnBsYXllcl9sZWFndWVfcG9pbnRzKTtcbiAgICAgICAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHNjb3JlKSB8fCAhTnVtYmVyLmlzRmluaXRlKGN1dG9mZlNjb3JlKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBmb3JtYXQgPSBuZXcgSW50bC5OdW1iZXJGb3JtYXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGluUHJvbW90aW9uID8gY3V0b2ZmU2NvcmUgOiBjdXRvZmZTY29yZSArIDE7XG4gICAgICAgICAgICBjb25zdCBkaWZmZXJlbmNlID0gaW5Qcm9tb3Rpb24gPyBzY29yZSAtIHRhcmdldCA6IHRhcmdldCAtIHNjb3JlO1xuICAgICAgICAgICAgY29uc3QgcnVsZSA9IGBUb3AgJHtwcm9tb3Rpb25SYW5rfSBpcyB0aGUgcHJvbW90aW9uIHRhcmdldC4gVGhlIGN1dG9mZiBpcyB0aGUgbGFyZ2VyIG9mIDIwIHBsYWNlcyBvciAxNSUgb2YgJHtmb3JtYXQuZm9ybWF0KGJyYWNrZXRTaXplKX0gcGxheWVycywgcm91bmRlZCB1cC5gO1xuICAgICAgICAgICAgY29uc3QgY29tcGFyaXNvbiA9IGluUHJvbW90aW9uXG4gICAgICAgICAgICAgICAgPyBgUmFuayAke2NvbXBhcmlzb25SYW5rfSBoYXMgJHtmb3JtYXQuZm9ybWF0KHRhcmdldCl9IHBvaW50cy4gWW91ciBsZWFkIGlzICR7Zm9ybWF0LmZvcm1hdChkaWZmZXJlbmNlKX0gcG9pbnRzLmBcbiAgICAgICAgICAgICAgICA6IGBZb3UgbmVlZCAke2Zvcm1hdC5mb3JtYXQodGFyZ2V0KX0gcG9pbnRzIHRvIHBhc3MgcmFuayAke2NvbXBhcmlzb25SYW5rfS5gO1xuICAgICAgICAgICAgY29uc3QgdG9vbHRpcCA9IGAke3J1bGV9ICR7Y29tcGFyaXNvbn1gO1xuXG4gICAgICAgICAgICBjb25zdCBlbnRyeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIGVudHJ5LmNsYXNzTmFtZSA9ICdqYXJ2aXNUb3AyMCc7XG4gICAgICAgICAgICBlbnRyeS5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgdG9vbHRpcCk7XG4gICAgICAgICAgICBlbnRyeS5zZXRBdHRyaWJ1dGUoJ3Rvb2x0aXAnLCAnJyk7XG4gICAgICAgICAgICBlbnRyeS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCB0b29sdGlwKTtcblxuICAgICAgICAgICAgY29uc3QgYmFkZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICBiYWRnZS5jbGFzc05hbWUgPSAnc2NyaXB0TGVhZ3VlSW5mb0ljb24nO1xuICAgICAgICAgICAgYmFkZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyMzNzY5YmEnO1xuICAgICAgICAgICAgYmFkZ2Uuc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgICAgICAgICBiYWRnZS50ZXh0Q29udGVudCA9IFN0cmluZyhwcm9tb3Rpb25SYW5rKTtcbiAgICAgICAgICAgIGVudHJ5LmFwcGVuZChiYWRnZSwgYCR7ZGlmZmVyZW5jZSA9PT0gMCA/ICcnIDogaW5Qcm9tb3Rpb24gPyAnLScgOiAnKyd9JHtmb3JtYXQuZm9ybWF0KE1hdGguYWJzKGRpZmZlcmVuY2UpKX1gKTtcbiAgICAgICAgICAgIHN1bW1hcnkuaW5zZXJ0QmVmb3JlKGVudHJ5LCBzdW1tYXJ5LnF1ZXJ5U2VsZWN0b3IoJy5taW5Ub3AzMCwgLnByb21vdGlvbkluZm8nKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuXG5leHBvcnQgY2xhc3MgUmVtb3ZlUGFzc0xvY2sgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBzZWxlY3RvclRvRmluZCA9ICcubG9ja195ZWxsb3dfaWNuJztcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNsYXNzVG9SZW1vdmUgPSAnbG9ja195ZWxsb3dfaWNuJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ3JlbW92ZVBhc3NMb2NrJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQYXNzIGxvY2sgaWNvbnNcIiwgXCJIaWRlIGxvY2sgaWNvbnMgb24gcmV3YXJkIHBhc3NlcyBzbyB0aGUgcmV3YXJkcyBhcmUgZWFzaWVyIHRvIHJlYWQuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAncG92JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQYXRoIG9mIFZhbG9yXCIsIFwiSGlkZSBsb2NrIGljb25zIG9uIHRoZSBQYXRoIG9mIFZhbG9yIHBhc3Nlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ3BvZycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUGF0aCBvZiBHbG9yeVwiLCBcIkhpZGUgbG9jayBpY29ucyBvbiB0aGUgUGF0aCBvZiBHbG9yeSBwYXNzZXMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi12YWxvci5odG1sJykgfHwgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLWdsb3J5Lmh0bWwnKVxuICAgIH1cblxuICAgIG9ic2VydmVVbnRpbChzZWxlY3Rvcjogc3RyaW5nLCBjYWxsYmFjazogKGVsZW1lbnRzOiBOb2RlTGlzdE9mPEVsZW1lbnQ+KSA9PiB2b2lkLCB7IG9uY2UgPSB0cnVlLCB0aW1lb3V0ID0gNTAwMCB9ID0ge30pIHtcbiAgICAgICAgbGV0IHRpbWVyOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgICAgICAgbGV0IGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVsZW1lbnRzKTtcbiAgICAgICAgICAgIGlmIChvbmNlKSByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGltZXIpIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVsZW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcblxuICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHRpbWVvdXQpICYmIHRpbWVvdXQgPiAwKSB7XG4gICAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3I6IHN0cmluZywgY2xhc3NUb1JlbW92ZTogc3RyaW5nLCB7IG9uY2UgPSB0cnVlLCB0aW1lb3V0ID0gNTAwMCB9ID0ge30pIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlVW50aWwoc2VsZWN0b3IsIChlbGVtZW50cykgPT4ge1xuICAgICAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbCA9PiBlbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzVG9SZW1vdmUpKTtcbiAgICAgICAgfSwgeyB0aW1lb3V0LCBvbmNlIH0pO1xuICAgIH1cblxuICAgIHJ1bih7IHBvdiwgcG9nIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLXZhbG9yLmh0bWwnKSAmJiBwb3YpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUodGhpcy5zZWxlY3RvclRvRmluZCwgdGhpcy5jbGFzc1RvUmVtb3ZlKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtZ2xvcnkuaHRtbCcpICYmIHBvZykge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZSh0aGlzLnNlbGVjdG9yVG9GaW5kLCB0aGlzLmNsYXNzVG9SZW1vdmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRHaXJsRGljdGlvbmFyeSgpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5nZXRHaXJsRGljdGlvbmFyeSgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3QgbG9hZCB0aGUgSEgrKyBnaXJsIGRpY3Rpb25hcnk6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBnZXRHaXJsRGljdGlvbmFyeSB9IGZyb20gJy4vZ2FtZURhdGEnO1xuXG5leHBvcnQgY2xhc3MgTG92ZVJhaWRzQWRkb24gZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSByZWFkb25seSByYXJpdHlDb2xvcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdsb3ZlUmFpZHNBZGRvbidcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTG92ZSBSYWlkcyBkaXNwbGF5XCIsIFwiQ3VzdG9taXplIG5hbWVzLCBpY29ucywgYW5kIHBvc2VzIG9uIExvdmUgUmFpZCBjYXJkcy5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdyYWlkX2lkJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJSYWlkIElEc1wiLCBcIkFkZCB0aGUgcmFpZCBJRCBiZWZvcmUgaXRzIG5hbWUuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnbmFtZXMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkhpZGRlbiBnaXJsIG5hbWVzXCIsIFwiU2hvdyB0aGUgbmFtZSBvbiBjYXJkcyB0aGF0IHVzZSBhIG15c3RlcmlvdXMgZ2lybCBsYWJlbC5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ3NraW4nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlNraW4gaW5kaWNhdG9yXCIsIFwiTWFyayBjYXJkcyB0aGF0IGluY2x1ZGUgYSBnaXJsIHdpdGggYSBza2luLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnY29sb3InLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlJhcml0eSBjb2xvcnNcIiwgXCJDb2xvciB0aGUgcmFpZCBuYW1lIGJhc2VkIG9uIHRoZSBnaXJs4oCZcyByYXJpdHkuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdmaWdodF9pY29uJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJGaWdodCBpY29uXCIsIFwiVXNlIHRoZSBjbGVhcmVyIGZpZ2h0LWVuZXJneSBpY29uLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnc2hhZG93cycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiVW5zaGFkb3dlZCBwb3Nlc1wiLCBcIlNob3cgdGhlIG5vcm1hbCBhcnR3b3JrIGluIHBsYWNlIG9mIHNoYWRvdyBwb3Nlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG5cbiAgICAgICAgdGhpcy5yYXJpdHlDb2xvcnMgPSB7XG4gICAgICAgICAgICByYXJlOiAnTGltZUdyZWVuJyxcbiAgICAgICAgICAgIGVwaWM6ICdHb2xkJyxcbiAgICAgICAgICAgIGxlZ2VuZGFyeTogJ01lZGl1bU9yY2hpZCdcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xvdmUtcmFpZHMuaHRtbCcpXG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKHsgcmFpZF9pZCwgc2tpbiwgbmFtZXMsIGNvbG9yLCBmaWdodF9pY29uLCBzaGFkb3dzIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBjb25zdCByYWlkcyA9ICh0eXBlb2YgbG92ZV9yYWlkcyAhPT0gJ3VuZGVmaW5lZCcgJiYgQXJyYXkuaXNBcnJheShsb3ZlX3JhaWRzKSkgPyBsb3ZlX3JhaWRzIDogW107XG4gICAgICAgIGlmICghcmFpZHMubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuXG4gICAgICAgIGNvbnN0IGdpcmxEaWN0ID0gYXdhaXQgZ2V0R2lybERpY3Rpb25hcnkoKTtcbiAgICAgICAgY29uc3QgcmFpZHNCeUlkID0gbmV3IE1hcChyYWlkcy5tYXAocmFpZCA9PiBbU3RyaW5nKHJhaWQuaWRfcmFpZCksIHJhaWRdKSk7XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnJhaWQtY2FyZFtpZF9yYWlkXScpLmZvckVhY2gocmFpZENhcmQgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmFpZCA9IHJhaWRzQnlJZC5nZXQocmFpZENhcmQuZ2V0QXR0cmlidXRlKCdpZF9yYWlkJykgPz8gJycpO1xuICAgICAgICAgICAgaWYgKCFyYWlkIHx8IHJhaWQuaWRfZ2lybCA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHsgbmFtZSwgcmFyaXR5LCBzaGFyZHMgPSAwIH0gPSBnaXJsRGljdD8uZ2V0KFN0cmluZyhyYWlkLmlkX2dpcmwpKSB8fCB7fTtcbiAgICAgICAgICAgIGNvbnN0IGhhcmVtTGluayA9IHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZ2V0SHJlZihgL2NoYXJhY3RlcnMvJHtyYWlkLmlkX2dpcmx9YCk7XG4gICAgICAgICAgICBjb25zdCByYWlkTmFtZUVsZW0gPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yKCcucmFpZC1uYW1lID4gc3BhbiA+IHNwYW4nKTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVfbGFiZWwgPSAobmFtZXMgJiYgbmFtZSkgfHwgcmFpZE5hbWVFbGVtPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IHJhaWQuZXZlbnRfbmFtZSB8fCByYWlkLmdpcmxfZGF0YT8ubmFtZSB8fCAnJztcbiAgICAgICAgICAgIGNvbnN0IHJhaWRfaWRfbGFiZWwgPSByYWlkX2lkID8gYCgke3JhaWQuaWRfcmFpZH0pYCA6ICcnO1xuICAgICAgICAgICAgY29uc3Qgc2tpbl9sYWJlbCA9IChza2luICYmIEFycmF5LmlzQXJyYXkocmFpZD8uZ2lybF9kYXRhPy5ncmFkZV9za2lucykgJiYgcmFpZC5naXJsX2RhdGEuZ3JhZGVfc2tpbnMubGVuZ3RoID4gMCkgPyAn8J+RmScgOiAnJztcblxuICAgICAgICAgICAgY29uc3QgZGlzcGxheVBhcnRzID0gW107XG4gICAgICAgICAgICBpZiAocmFpZF9pZCkgZGlzcGxheVBhcnRzLnB1c2gocmFpZF9pZF9sYWJlbCk7XG4gICAgICAgICAgICBkaXNwbGF5UGFydHMucHVzaChuYW1lX2xhYmVsKTtcbiAgICAgICAgICAgIGlmIChza2luKSBkaXNwbGF5UGFydHMucHVzaChza2luX2xhYmVsKTtcbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlMYWJlbCA9IGRpc3BsYXlQYXJ0cy5qb2luKCcgJykudHJpbSgpO1xuXG4gICAgICAgICAgICBpZiAocmFpZE5hbWVFbGVtICYmIGRpc3BsYXlMYWJlbCkge1xuICAgICAgICAgICAgICAgIHJhaWROYW1lRWxlbS50ZXh0Q29udGVudCA9IGRpc3BsYXlMYWJlbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgb2JqZWN0aXZlcyA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jbGFzc2ljLWdpcmwnKTtcbiAgICAgICAgICAgIGNvbnN0IGdpcmwgPSBvYmplY3RpdmVzWzBdO1xuICAgICAgICAgICAgaWYgKGdpcmwpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBnaXJsTmFtZUVsZW0gPSBnaXJsLnF1ZXJ5U2VsZWN0b3IoJy5naXJsLW5hbWUnKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2lybE5hbWVFbGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5rID0gZ2lybE5hbWVFbGVtLnF1ZXJ5U2VsZWN0b3IoJ2EnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsaW5rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluay5jbGFzc05hbWUgPSAnaGgtZ2lybC1saW5rJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChnaXJsTmFtZUVsZW0uZmlyc3RDaGlsZCkgbGluay5hcHBlbmRDaGlsZChnaXJsTmFtZUVsZW0uZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnaXJsTmFtZUVsZW0uYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3BsYXlMYWJlbCkgbGluay50ZXh0Q29udGVudCA9IGRpc3BsYXlMYWJlbDtcbiAgICAgICAgICAgICAgICAgICAgbGluay5ocmVmID0gaGFyZW1MaW5rO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzaGFyZHMgPT09IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvYmpFbGVtID0gZ2lybC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLm9iamVjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob2JqRWxlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqRWxlbS5pbm5lclRleHQgPSBgSSdtIGFscmVhZHkgYXR0cmFjdGVkIHRvIHlvdS4gRmluZCBtZSBpbiB5b3VyIEhhcmVtIWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjb2xvciAmJiByYXJpdHkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByYWlkTmFtZUNvbnRhaW5lciA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcucmFpZC1uYW1lJyk7XG4gICAgICAgICAgICAgICAgaWYgKHJhaWROYW1lQ29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhaWROYW1lQ29udGFpbmVyLnN0eWxlLmNvbG9yID0gdGhpcy5yYXJpdHlDb2xvcnNbcmFyaXR5XSB8fCAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaWdodF9pY29uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlnaHRJY29uID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5odWRCYXR0bGVQdHNfbWl4X2ljbicpO1xuICAgICAgICAgICAgICAgIGlmIChmaWdodEljb24pIHtcbiAgICAgICAgICAgICAgICAgICAgZmlnaHRJY29uLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9ICd1cmwoL2ltYWdlcy9waWN0dXJlcy9kZXNpZ24vaWNfZW5lcmd5X2ZpZ2h0LnBuZyknO1xuICAgICAgICAgICAgICAgICAgICBmaWdodEljb24uc3R5bGUuYmFja2dyb3VuZFNpemUgPSAnMjRweCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2hhZG93cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRJbWFnZSA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEltYWdlRWxlbWVudD4oJy5naXJsLWltZy5sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGxlZnRJbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICBsZWZ0SW1hZ2Uuc3JjID0gbGVmdEltYWdlLnNyYy5yZXBsYWNlKCctYmxhY2snLCAnJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyYWlkQ2FyZC5jbGFzc0xpc3QuY29udGFpbnMoJ211bHRpcGxlLWdpcmwnKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodEltYWdlID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MSW1hZ2VFbGVtZW50PignLmdpcmwtaW1nLnJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyaWdodEltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByaWdodEltYWdlLnNyYyA9IHJpZ2h0SW1hZ2Uuc3JjLnJlcGxhY2UoJ2F2YjAucG5nJywgJ2dyYWRlX3NraW5zL2dyYWRlX3NraW4xLnBuZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHRJbWFnZS5zcmMgPSByaWdodEltYWdlLnNyYy5yZXBsYWNlKCctYmxhY2snLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmFpZENhcmQucXVlcnlTZWxlY3RvckFsbCgnLmV5ZScpLmZvckVhY2goZSA9PiBlLnJlbW92ZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB0eXBlIHsgR2lybERhdGEsIExvdmVSYWlkIH0gZnJvbSAnLi4vLi4vZ2FtZS10eXBlcyc7XG5pbXBvcnQgeyBsc0dldCwgbHNTZXQsIGxzUm0gfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcbmltcG9ydCB7IGdldEdpcmxEaWN0aW9uYXJ5IH0gZnJvbSAnLi9nYW1lRGF0YSc7XG5cbnR5cGUgUmFpZENvcHlCdXR0b24gPSBIVE1MRGl2RWxlbWVudCAmIHsgX2JvdW5kQ29weUtleUhhbmRsZXI/OiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHZvaWQgfTtcblxuZXhwb3J0IGNsYXNzIExvdmVSYWlkc1BhcnNlciBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIGdpcmxEaWN0OiBSZWFkb25seU1hcDxzdHJpbmcsIEdpcmxEYXRhPiB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgX2JvdW5kSW5zZXJ0QnV0dG9uPzogKCkgPT4gdm9pZDtcblxuICAgIC8qXG4gICAgKiBSYWlkIElELCBBbm5vdW5jZW1lbnQgVHlwZSwgQmFja2dyb3VuZCBJRCwgRXZlbnQgTmFtZSwgU3RhcnQgRGF0ZXRpbWUsXG4gICAgKiBFbmQgRGF0ZXRpbWUsIER1cmF0aW9uLCBSYWlkIFN0YXR1cywgU291cmNlLCBHaXJsIElELFxuICAgICogR2lybCBOYW1lLCBSYXJpdHksIE1heCBHcmFkZSwgRmlyc3QgQXBwZWFyYW5jZSwgU291cmNlIElELFxuICAgICogSGFzIFNraW4ocylcbiAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xvdmVSYWlkc1BhcnNlcidcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTG92ZSBSYWlkcyBleHBvcnRcIiwgXCJBZGQgYSBidXR0b24gdG8gY29weSBuZXcgcmFpZHMgaW4gYSBzcHJlYWRzaGVldC1yZWFkeSBmb3JtYXQuXCIpXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbG92ZS1yYWlkcy5odG1sJylcbiAgICB9XG5cbiAgICBjYXBpdGFsaXplRmlyc3Qoc3RyOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHN0ciA/IHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKSA6IHN0cjtcbiAgICB9XG5cbiAgICBnZXRBbm5vdW5jZW1lbnRUeXBlKHR5cGU6IExvdmVSYWlkWydpZF9hbm5vdW5jZW1lbnRfdHlwZSddKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gXCJGdWxsXCI7XG4gICAgICAgICAgICBjYXNlIDI6IHJldHVybiBcIlBhcnRpYWxcIjtcbiAgICAgICAgICAgIGNhc2UgMzogcmV0dXJuIFwiTm9uZVwiO1xuICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIFwiVW5rbm93blwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U291cmNlSUQoZXZlbnQ6IExvdmVSYWlkKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZV9pZCA9IE51bWJlcihldmVudC5yYWlkX21vZHVsZV9wayk7XG4gICAgICAgIHN3aXRjaCAoZXZlbnQucmFpZF9tb2R1bGVfdHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc2Vhc29uJzogcmV0dXJuIDA7XG4gICAgICAgICAgICBjYXNlICdjaGFtcGlvbic6IHJldHVybiBOdW1iZXIuaXNGaW5pdGUoc291cmNlX2lkKSA/IHNvdXJjZV9pZCA6IC0yO1xuICAgICAgICAgICAgY2FzZSAndHJvbGwnOiByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHNvdXJjZV9pZCkgPyBzb3VyY2VfaWQgKyAxMCA6IC0yO1xuICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2lybEhhc1NraW5zKGV2ZW50OiBMb3ZlUmFpZCkge1xuICAgICAgICBjb25zdCBoYXNTa2lucyA9IEFycmF5LmlzQXJyYXkoZXZlbnQ/LmdpcmxfZGF0YT8uZ3JhZGVfc2tpbnMpICYmIGV2ZW50LmdpcmxfZGF0YS5ncmFkZV9za2lucy5sZW5ndGggPiAwO1xuICAgICAgICBpZiAoaGFzU2tpbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBcIlhcIjtcbiAgICAgICAgfSBlbHNlIHJldHVybiBcIk9cIjtcbiAgICB9XG5cbiAgICBmb3JtYXRFdmVudFJvdyhldmVudDogTG92ZVJhaWQpIHtcbiAgICAgICAgY29uc3QgZHVyYXRpb25Ib3VycyA9IE1hdGguZmxvb3IoTnVtYmVyKGV2ZW50LmV2ZW50X2R1cmF0aW9uX3NlY29uZHMpIC8gMzYwMCk7XG4gICAgICAgIGNvbnN0IGR1cmF0aW9uID0gYCR7ZHVyYXRpb25Ib3Vyc30gaG91cnNgO1xuXG4gICAgICAgIGNvbnN0IGdpcmwgPSB0aGlzLmdpcmxEaWN0Py5nZXQoU3RyaW5nKGV2ZW50LmlkX2dpcmwpKSB8fCB7fTtcbiAgICAgICAgY29uc3QgeyBuYW1lID0gJ1Vua25vd24nLCByYXJpdHkgPSAnTi9BJywgZ3JhZGUgPSAwIH0gPSBnaXJsO1xuXG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBldmVudC5pZF9yYWlkLFxuICAgICAgICAgICAgdGhpcy5nZXRBbm5vdW5jZW1lbnRUeXBlKGV2ZW50LmlkX2Fubm91bmNlbWVudF90eXBlKSxcbiAgICAgICAgICAgIGV2ZW50LmJhY2tncm91bmRfaWQsXG4gICAgICAgICAgICBldmVudC5ldmVudF9uYW1lLFxuICAgICAgICAgICAgZXZlbnQuc3RhcnRfZGF0ZXRpbWUsXG4gICAgICAgICAgICBldmVudC5lbmRfZGF0ZXRpbWUsXG4gICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgIGV2ZW50LnN0YXR1cyxcbiAgICAgICAgICAgIGV2ZW50LnJhaWRfbW9kdWxlX3R5cGUsXG4gICAgICAgICAgICBldmVudC5pZF9naXJsLFxuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIHRoaXMuY2FwaXRhbGl6ZUZpcnN0KHJhcml0eSksXG4gICAgICAgICAgICBncmFkZSxcbiAgICAgICAgICAgIFwiXCIsIC8vIG9uZSBibGFuayB0YWIgcmVzZXJ2ZWQgZm9yIGZpcnN0IGFwcGVhcmFuY2UgaW4gR1NoZWV0c1xuICAgICAgICAgICAgdGhpcy5nZXRTb3VyY2VJRChldmVudCksXG4gICAgICAgICAgICB0aGlzLmdpcmxIYXNTa2lucyhldmVudClcbiAgICAgICAgXS5qb2luKFwiXFx0XCIpO1xuICAgIH1cblxuICAgIGFzeW5jIGNvcHlUb0NsaXBib2FyZCh0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdDbGlwYm9hcmQgQVBJIGZhaWxlZCwgdXNpbmcgZXhlY0NvbW1hbmQgZmFsbGJhY2s6JywgZXJyKTtcbiAgICAgICAgICAgIGNvbnN0IHRleHRhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgICAgICAgICAgIHRleHRhcmVhLnZhbHVlID0gdGV4dDtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGV4dGFyZWEpO1xuICAgICAgICAgICAgdGV4dGFyZWEuc2VsZWN0KCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0ZXh0YXJlYS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGhhbmRsZUNvcHlDbGljayhldnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgY29uc3Qgc3RvcmFnZUtleSA9ICdMYXN0U2F2ZWRSYWlkSUQnO1xuXG4gICAgICAgIC8vIFNoaWZ0ICsgQ3RybCArIENsaWNrIOKGkiBjbGVhciBzdG9yZWQgSURcbiAgICAgICAgaWYgKGV2dC5zaGlmdEtleSAmJiBldnQuY3RybEtleSkge1xuICAgICAgICAgICAgY29uc3QgY29uZmlybUNsZWFyID0gY29uZmlybSgn4pqg77iPIERvIHlvdSB3YW50IHRvIGNsZWFyIHRoZSBzYXZlZCBsYXN0IHJhaWQgSUQgZm9yIHRoaXMgc2l0ZT8nKTtcbiAgICAgICAgICAgIGlmIChjb25maXJtQ2xlYXIpIHtcbiAgICAgICAgICAgICAgICBsc1JtKHN0b3JhZ2VLZXkpO1xuICAgICAgICAgICAgICAgIGFsZXJ0KCfinIUgTGFzdCBzYXZlZCBJRCBjbGVhcmVkLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9hZCByYWlkc1xuICAgICAgICBjb25zdCBsb2NhbExvdmVSYWlkcyA9ICh0eXBlb2YgbG92ZV9yYWlkcyAhPT0gJ3VuZGVmaW5lZCcgJiYgQXJyYXkuaXNBcnJheShsb3ZlX3JhaWRzKSkgPyBsb3ZlX3JhaWRzIDogW107XG4gICAgICAgIGlmICghbG9jYWxMb3ZlUmFpZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbGVydCgn4pqg77iPIE5vIGxvdmVfcmFpZHMgZm91bmQgb24gdGhpcyBwYWdlLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmdpcmxEaWN0KSB7XG4gICAgICAgICAgICBhbGVydCgn4pqg77iPIFRoZSBISCsrIGdpcmwgZGljdGlvbmFyeSBjb3VsZCBub3QgYmUgbG9hZGVkLiBSZWxvYWQgdGhlIHBhZ2UgYW5kIHRyeSBhZ2Fpbi4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsYXN0U2F2ZWRJZE51bWJlciA9IHBhcnNlSW50KFN0cmluZyhsc0dldChzdG9yYWdlS2V5KSksIDEwKTtcblxuICAgICAgICAvLyBJZiBTaGlmdCBpcyBoZWxkIE9SIG5vIHNhdmVkIElEIGV4aXN0cyDihpIgYXNrIGFnYWluXG4gICAgICAgIGlmIChpc05hTihsYXN0U2F2ZWRJZE51bWJlcikgfHwgZXZ0LnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBjb25zdCBsYXN0U2F2ZWRJZCA9IHByb21wdCgnUGxlYXNlIGVudGVyIHRoZSBsYXN0IHNhdmVkIElEOicpO1xuICAgICAgICAgICAgbGFzdFNhdmVkSWROdW1iZXIgPSBwYXJzZUludChTdHJpbmcobGFzdFNhdmVkSWQpLCAxMCk7XG5cbiAgICAgICAgICAgIGlmIChpc05hTihsYXN0U2F2ZWRJZE51bWJlcikpIHtcbiAgICAgICAgICAgICAgICBhbGVydCgn4p2MIEludmFsaWQgSUQgZW50ZXJlZC4gUGxlYXNlIGVudGVyIGEgdmFsaWQgbnVtYmVyLicpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbHRlciBuZXcgZXZlbnRzXG4gICAgICAgIGNvbnN0IGZpbHRlcmVkRGF0YSA9IGxvY2FsTG92ZVJhaWRzLmZpbHRlcihldmVudCA9PiBOdW1iZXIoZXZlbnQuaWRfcmFpZCkgPiBsYXN0U2F2ZWRJZE51bWJlcik7XG4gICAgICAgIGlmICghZmlsdGVyZWREYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgYWxlcnQoYOKEue+4jyBObyBuZXcgZXZlbnRzIGZvdW5kIHdpdGggSUQgZ3JlYXRlciB0aGFuICR7bGFzdFNhdmVkSWROdW1iZXJ9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmb3JtYXR0ZWREYXRhID0gZmlsdGVyZWREYXRhLm1hcCh0aGlzLmZvcm1hdEV2ZW50Um93LmJpbmQodGhpcykpLmpvaW4oXCJcXG5cIik7XG5cbiAgICAgICAgaWYgKCFhd2FpdCB0aGlzLmNvcHlUb0NsaXBib2FyZChmb3JtYXR0ZWREYXRhKSkge1xuICAgICAgICAgICAgYWxlcnQoJ+KdjCBDb3VsZCBub3QgY29weSB0aGUgcmFpZHMuIFRoZSBsYXN0IHNhdmVkIElEIHdhcyBrZXB0LicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2F2ZSBoaWdoZXN0IElEXG4gICAgICAgIGNvbnN0IG1heElkID0gTWF0aC5tYXgoLi4uZmlsdGVyZWREYXRhLm1hcChlID0+IE51bWJlcihlLmlkX3JhaWQpKSk7XG4gICAgICAgIGxzU2V0KHN0b3JhZ2VLZXksIG1heElkKTtcblxuICAgICAgICBhbGVydCgn4pyFIERhdGEgY29waWVkIHRvIGNsaXBib2FyZCEgWW91IGNhbiBub3cgcGFzdGUgaXQgaW50byBHU2hlZXRzLicpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNvcHlCdXR0b24oKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbjogUmFpZENvcHlCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3JlbWluZGVyLWNvcHknKTtcbiAgICAgICAgYnV0dG9uLnN0eWxlLmNzc1RleHQgPSBgXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjMDBhYWZmIDAsICMwMDY2ODggNTAlLCAjMDA1NTc3IDUxJSwgIzAwYWFmZiAxMDAlKTtcbiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgICAgIHdpZHRoOiAzMnB4O1xuICAgICAgICAgICAgaGVpZ2h0OiAzMnB4O1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IDEwcHg7XG4gICAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICByaWdodDogNC41cmVtO1xuICAgICAgICAgICAgdG9wOiAwLjJyZW07XG4gICAgICAgICAgICBmb250LXNpemU6IDE4cHg7XG4gICAgICAgICAgICBsaW5lLWhlaWdodDogMzJweDtcbiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IGJhY2tncm91bmQgMC4ycyBlYXNlO1xuICAgICAgICBgO1xuICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAn8J+Tiyc7XG4gICAgICAgIGxldCBidXR0b25UaXRsZSA9ICdDbGljayA9IGNvcHkgbmV3IHJhaWRzLiBTaGlmdCAvIFNoaWZ0ICsgQ3RybCBhdmFpbGFibGUuJztcbiAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgndG9vbHRpcCcsICcnKTtcbiAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG5cbiAgICAgICAgY29uc3QgX2JvdW5kQ29weUtleUhhbmRsZXIgPSAoZTogS2V5Ym9hcmRFdmVudCkgPT4gdGhpcy51cGRhdGVDb3B5QnV0dG9uKGUsIGJ1dHRvbik7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgX2JvdW5kQ29weUtleUhhbmRsZXIpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBfYm91bmRDb3B5S2V5SGFuZGxlcik7XG4gICAgICAgIC8vIHN0b3JlIGhhbmRsZXIgcmVmZXJlbmNlIHNvIGNhbGxlcnMgY2FuIHJlbW92ZSBsaXN0ZW5lcnMgaWYgYnV0dG9uIGlzIHJlbW92ZWQgbGF0ZXJcbiAgICAgICAgYnV0dG9uLl9ib3VuZENvcHlLZXlIYW5kbGVyID0gX2JvdW5kQ29weUtleUhhbmRsZXI7XG4gICAgICAgIGJ1dHRvbi5vbmNsaWNrID0gKGUpID0+IHRoaXMuaGFuZGxlQ29weUNsaWNrKGUpO1xuICAgICAgICB0aGlzLnVwZGF0ZUNvcHlCdXR0b24oeyBzaGlmdEtleTogZmFsc2UsIGN0cmxLZXk6IGZhbHNlIH0sIGJ1dHRvbik7XG4gICAgICAgIHJldHVybiBidXR0b247XG4gICAgfVxuXG4gICAgdXBkYXRlQ29weUJ1dHRvbihlOiBQaWNrPEtleWJvYXJkRXZlbnQsICdzaGlmdEtleScgfCAnY3RybEtleSc+LCBidXR0b246IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGxldCBidXR0b25UaXRsZSA9ICcnO1xuICAgICAgICBpZiAoZS5zaGlmdEtleSAmJiBlLmN0cmxLZXkpIHtcbiAgICAgICAgICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjZmY2NjY2IDAsICNhYTAwMDAgMTAwJSlcIjsgLy8gcmVkXG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAn8J+Xke+4jyc7XG4gICAgICAgICAgICBidXR0b25UaXRsZSA9ICdTaGlmdCArIEN0cmwgKyBDbGljayA9IGNsZWFyIHNhdmVkIElEJztcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGUuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjZmZkZDY2IDAsICNjYzk5MDAgMTAwJSlcIjsgLy8geWVsbG93XG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAn4pyP77iPJztcbiAgICAgICAgICAgIGJ1dHRvblRpdGxlID0gJ1NoaWZ0ICsgQ2xpY2sgPSBwcm9tcHQgZm9yIElELic7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjMDBhYWZmIDAsICMwMDY2ODggNTAlLCAjMDA1NTc3IDUxJSwgIzAwYWFmZiAxMDAlKVwiOyAvLyBkZWZhdWx0IGJsdWVcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5OLJztcbiAgICAgICAgICAgIGJ1dHRvblRpdGxlID0gJ0NsaWNrID0gY29weSBuZXcgcmFpZHMuIFNoaWZ0IC8gU2hpZnQgKyBDdHJsIGF2YWlsYWJsZS4nO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbnNlcnRCdXR0b24oKSB7XG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXR0b24tbm90aWZpY2F0aW9uLWFjdGlvbi5ub3RpZl9idXR0b25fcycpO1xuICAgICAgICBpZiAobm90aWZpY2F0aW9uQnV0dG9uICYmICFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVtaW5kZXItY29weScpKSB7XG4gICAgICAgICAgICBjb25zdCBjb3B5QnV0dG9uID0gdGhpcy5jcmVhdGVDb3B5QnV0dG9uKCk7XG4gICAgICAgICAgICBub3RpZmljYXRpb25CdXR0b24ucGFyZW50Tm9kZT8uaW5zZXJ0QmVmb3JlKGNvcHlCdXR0b24sIG5vdGlmaWNhdGlvbkJ1dHRvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICAgICAgdGhpcy5naXJsRGljdCA9IGF3YWl0IGdldEdpcmxEaWN0aW9uYXJ5KCk7XG5cbiAgICAgICAgdGhpcy5fYm91bmRJbnNlcnRCdXR0b24gPSB0aGlzLmluc2VydEJ1dHRvbi5iaW5kKHRoaXMpO1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykgdGhpcy5pbnNlcnRCdXR0b24oKTtcbiAgICAgICAgZWxzZSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuX2JvdW5kSW5zZXJ0QnV0dG9uLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBBY3Rpdml0eVBhcnNlciBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdhY3Rpdml0eVBhcnNlcidcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTWlzc2lvbiBjb3BpZXJcIiwgXCJFbmFibGUgdGhlIGNvcHkgdG9vbCBmb3IgbGVnZW5kYXJ5IG1pc3Npb24gZGV0YWlscy5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdtaXNzaW9uQ29waWVyJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMZWdlbmRhcnkgZGV0YWlsc1wiLCBcIkNsaWNrIGEgbGVnZW5kYXJ5IG1pc3Npb27igJlzIHRpdGxlLCBkZXNjcmlwdGlvbiwgb3IgaW1hZ2UgdG8gY29weSBpdC5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvYWN0aXZpdGllcy5odG1sJylcbiAgICB9XG5cbiAgICBhc3luYyBjb3B5VG9DbGlwYm9hcmQodGV4dDogc3RyaW5nKSB7XG4gICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpO1xuICAgICAgICBjb25zdCB0b2FzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0b2FzdC50ZXh0Q29udGVudCA9ICdDb3BpZWQhJztcbiAgICAgICAgdG9hc3Quc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgICAgICB0b2FzdC5zdHlsZS5ib3R0b20gPSAnMTBweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnJpZ2h0ID0gJzEwcHgnO1xuICAgICAgICB0b2FzdC5zdHlsZS5iYWNrZ3JvdW5kID0gJ3JnYmEoMCwwLDAsMC43KSc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmNvbG9yID0gJ3doaXRlJztcbiAgICAgICAgdG9hc3Quc3R5bGUucGFkZGluZyA9ICc1cHggMTBweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmJvcmRlclJhZGl1cyA9ICc1cHgnO1xuICAgICAgICB0b2FzdC5zdHlsZS56SW5kZXggPSAnOTk5OSc7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodG9hc3QpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRvYXN0LnJlbW92ZSgpLCAxMDAwKTtcbiAgICB9XG5cbiAgICBydW4oeyBtaXNzaW9uQ29waWVyIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBpZiAobWlzc2lvbkNvcGllcikge1xuICAgICAgICAgICAgY29uc3QgZW50cmllcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5taXNzaW9uX2VudHJ5LmxlZ2VuZGFyeScpO1xuICAgICAgICAgICAgaWYgKCFlbnRyaWVzLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBlbnRyaWVzLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGltZ0RpdiA9IGVudHJ5LnF1ZXJ5U2VsZWN0b3I8SFRNTEltYWdlRWxlbWVudD4oJy5taXNzaW9uX2ltYWdlIGltZycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlQWxsID0gZW50cnkucXVlcnlTZWxlY3RvcjxIVE1MSGVhZGluZ0VsZW1lbnQ+KCcubWlzc2lvbl9kZXRhaWxzIGgxJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVzYyA9IGVudHJ5LnF1ZXJ5U2VsZWN0b3I8SFRNTFBhcmFncmFwaEVsZW1lbnQ+KCcubWlzc2lvbl9kZXRhaWxzIHAnKTtcblxuICAgICAgICAgICAgICAgIGlmIChpbWdEaXYpIHtcbiAgICAgICAgICAgICAgICAgICAgaW1nRGl2LnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgaW1nRGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQoaW1nRGl2LnNyYyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0aXRsZUFsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZUFsbC5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG91dGVyVGl0bGUgPSB0aXRsZUFsbC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmV2ZW50LW1pc3Npb24tY29udGVudC10ZXh0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvdXRlclRpdGxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlclRpdGxlLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyVGl0bGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKChvdXRlclRpdGxlLnRleHRDb250ZW50ID8/ICcnKS50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aXRsZUFsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCAmJiBlLnRhcmdldC5jbG9zZXN0KCcuZXZlbnQtbWlzc2lvbi1jb250ZW50LXRleHQnKSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGl0bGVDbG9uZSA9IHRpdGxlQWxsLmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MSGVhZGluZ0VsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZUNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5ldmVudC1taXNzaW9uLWNvbnRlbnQtdGV4dCcpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gKHRpdGxlQ2xvbmUudGV4dENvbnRlbnQgPz8gJycpLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKHRpdGxlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGRlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzYy5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgICAgIGRlc2MuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZChkZXNjLmlubmVyVGV4dC50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCAiW3tcInZlcnNpb25cIjpcIjAuNy41XCIsXCJjaGFuZ2VzXCI6W1wiS2VlcCB0aGUgaG9tZXBhZ2UgcmVzcG9uc2l2ZSBhZnRlciBjbG9zaW5nIHRoZSBjaGFuZ2Vsb2cgYW5kIGNob29zZSBTaWxlbnQgY2hhbmdlbG9nIGZyb20gdGhlIHBvcHVwLlwiLFwiU3RvcCBhdXRvbWF0aWMgc2lkZWJhciBzY3JvbGxpbmcgb24gY29udGVzdCBzd2l0Y2hlcyBieSBkZWZhdWx0IGFuZCB1c2UgVG9wIG9yIE15IHJhbmsgd2hlbmV2ZXIgeW91IHN3aXRjaC5cIixcIkJyaW5nIHRoZSBzZWxlY3RlZCBjYXJkIGludG8gdmlldyB3aGVuIHlvdSB1c2UgYSBjb250ZXN0IHNob3J0Y3V0LlwiXX0se1widmVyc2lvblwiOlwiMC43LjRcIixcImNoYW5nZXNcIjpbXCJTZWUgeW91ciByYW5rIGluIGVhY2ggYWN0aXZlIGNvbnRlc3QgYmVzaWRlIHRoZSBjbG9zZSBidXR0b24gYW5kIHN3aXRjaCBsZWFkZXJib2FyZHMgd2l0aG91dCBtb3ZpbmcgdGhlIGNvbnRlc3QgbGlzdC5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4zXCIsXCJjaGFuZ2VzXCI6W1wiU2VlIGF1dG9tYXRpYyBjaGFuZ2Vsb2dzIG9ubHkgd2hlbiBsb2FkaW5nIHRoZSBob21lcGFnZSBhZnRlciBhbiB1cGRhdGUuXCIsXCJFbmFibGUgU2lsZW50IGNoYW5nZWxvZyB0byBnZXQgYSBOZXcgYnV0dG9uIGJlc2lkZSBISCsrIGFuZCBvcGVuIHRoZSBub3RlcyB3aGVuIHlvdeKAmXJlIHJlYWR5LlwiLFwiS2VlcCB0aGUgY29udGVzdCBsaXN0IGFuZCBlYWNoIGxlYWRlcmJvYXJkIGluIHBsYWNlIHdoZW4gc3dpdGNoaW5nIGNvbnRlc3RzIHdpdGggU3RvcCBzY3JvbGxpbmcgb24gY29udGVzdCBzd2l0Y2hlcy5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4yXCIsXCJjaGFuZ2VzXCI6W1wiT3BlbiB0aGUgYm90dG9tIGFjdGl2ZSBjb250ZXN0IGF0IHlvdXIgcmFuayBieSBkZWZhdWx0LiBDaG9vc2UgQ2JDLCBDQ0MsIG9yIExDIHRvIHByZWZlciB0aGF0IGV2ZW50IHdoZW4gYXZhaWxhYmxlLlwiLFwiVHVybiBvZmYgYXV0b21hdGljIHVwZGF0ZSBub3RpY2VzIHdpdGggRG9u4oCZdCBzaG93IGFnYWluIGluIHRoZSBjaGFuZ2Vsb2cgcG9wdXAuIFZpZXcgY2hhbmdlbG9nIHN0YXlzIGF2YWlsYWJsZSBpbiBzZXR0aW5ncy5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4xXCIsXCJjaGFuZ2VzXCI6W1wiS2VlcCB0aGUgY2hhbmdlbG9nIGNlbnRlcmVkIHdoZW4gdGhlIGdhbWUgd2luZG93IGlzIHJlc2l6ZWQuXCIsXCJDbGVhbiB1cCBzYXZlZCBwbGF5ZXIgbmFtZXMsIGV4cGxhaW4gdW5rbm93biBuYW1lcyBvbiBob3ZlciwgYW5kIGdpdmUgUmVtb3ZlIGJ1dHRvbnMgbW9yZSByb29tLlwiXX0se1widmVyc2lvblwiOlwiMC43LjBcIixcImNoYW5nZXNcIjpbXCJTZWUgd2hhdCBjaGFuZ2VkIGluIEphcnZpcyB0aGUgZmlyc3QgdGltZSBhIG5ldyB2ZXJzaW9uIHJ1bnMuXCIsXCJPcGVuIFZpZXcgY2hhbmdlbG9nIGZyb20gSEgrKyBzZXR0aW5ncyBhdCBhbnkgdGltZSwgZXZlbiB3aXRoIGF1dG9tYXRpYyBub3RpY2VzIHR1cm5lZCBvZmYuXCIsXCJFeHBhbmQgRWFybGllciB2ZXJzaW9ucyB0byByZWFkIHBhc3QgdXBkYXRlcy5cIl19LHtcInZlcnNpb25cIjpcIjAuNi43XCIsXCJjaGFuZ2VzXCI6W1wiTWFrZSBtYXJraW5nIG9uZSBhY3Rpb24gcGVyIHBsYXllciwgYmFja2ZpbGwgbmFtZXMgZm9yIG9sZGVyIG1hcmtzLCB1c2UgdGhlIGJyYWNrZXQtYmFzZWQgcHJvbW90aW9uIHRhcmdldCwgYW5kIHNpbXBsaWZ5IHRoZSBzZWxlY3RlZCBjb250ZXN0IGJ1dHRvbnMgYW5kIHZlcnNpb24gYmFkZ2UuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuNlwiLFwiY2hhbmdlc1wiOltcIkFkZCBzZXR0aW5nIGhlbHAgaW4gSEgrKywgaW1wcm92ZSBtYXJrIGNvbnRyYXN0IGFuZCBtYW5hZ2VtZW50LCBhbmQgYWRkIGF1dG9tYXRpYyBjb250ZXN0IGRlZmF1bHRzLlwiLFwiUmVuYW1lIHRoZSBzZXBhcmF0ZWx5IGluc3RhbGxlZCB0ZXN0aW5nIHVzZXJzY3JpcHQgdG8gRGV2LlwiXX0se1widmVyc2lvblwiOlwiMC42LjVcIixcImNoYW5nZXNcIjpbXCJNb3ZlIHRoZSB1c2Vyc2NyaXB0IHNvdXJjZSBpbnRvIFR5cGVTY3JpcHQgbW9kdWxlcyBhbmQgYWRkIHNlcGFyYXRlIHN0YWJsZSBhbmQgdGVzdGluZyBidWlsZHMuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuNFwiLFwiY2hhbmdlc1wiOltcIlByZXZlbnQgcGlubmVkIGNvbnRlc3Qgc3RhcnR1cCBzY3JvbGxpbmcsIGtlZXAgbmF0aXZlIHN0YXJ0dXAgd2l0aG91dCBhIHBpbiwgYW5kIGNsZWFyIGZpbmlzaGVkIHBpbnNcIl19LHtcInZlcnNpb25cIjpcIjAuNi4zXCIsXCJjaGFuZ2VzXCI6W1wiU3RvcCBib3RoIGNvbnRlc3Qgc3RhcnR1cCBzY3JvbGxzLCBpc29sYXRlIHRoZSBzZWxlY3RlZCBsZWFkZXJib2FyZCwgYW5kIHJlc3RvcmUgcGlubmVkIGNvbnRlc3RzIGF0IFRvcCBvciBNeSByYW5rXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuMlwiLFwiY2hhbmdlc1wiOltcIlBpbiBjb250ZXN0cyBvbiB0aGVpciBjYXJkcywgaGlkZSB0aGUgc3RhcnR1cCBzY3JvbGwsIGFuZCB1c2UgcmlnaHQtY2xpY2sgbWFya2luZyB3aXRoIGlzb2xhdGVkIHNldHRpbmdzIHNjcm9sbGluZ1wiXX0se1widmVyc2lvblwiOlwiMC42LjFcIixcImNoYW5nZXNcIjpbXCJSZWFkIG5hdGl2ZSBNYW5nYSBSUEcgY29udGVzdCB0aXRsZXMgYW5kIHJlY29nbml6ZSBhY3RpdmUgY2FyZHMgd2hlbiBjb250ZXN0IGRhdGEgaXMgdW5hdmFpbGFibGVcIl19LHtcInZlcnNpb25cIjpcIjAuNi4wXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIGEgY29udGVzdCBzdGFydCBwcmVmZXJlbmNlLCBjb250aW51b3VzIG1hcmtpbmcsIGFuZCBjb21wYWN0IHNldHRpbmdzIHdpdGggYSB2ZXJzaW9uIGxhYmVsXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjUuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBsZWFndWUgYW5kIGNvbnRlc3QgcGxheWVyIG1hcmtpbmcgd2l0aCBjdXN0b20gY29sb3JzLCBjb21wYWN0IHNldHRpbmdzLCBhbmQgbGltaXQgVG9wIDIwIHRvIHByb21vdGFibGUgbGVhZ3Vlc1wiXX0se1widmVyc2lvblwiOlwiMC40LjJcIixcImNoYW5nZXNcIjpbXCJGaXggbW9kdWxlIHN0YXJ0dXAsIGxlYWd1ZSBjb250cm9scywgYW5kIHJhaWQgZXhwb3J0czsgYWRkIHRoZSBUb3AgMjAgbGVhZ3VlIHRhcmdldFwiXX0se1widmVyc2lvblwiOlwiMC40LjFcIixcImNoYW5nZXNcIjpbXCJGaXggTG92ZSBSYWlkcyBzaGFkb3dzIHJlcGxhY2VtZW50XCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjQuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBBY3Rpdml0eVBhcnNlciBtb2R1bGVcIl19LHtcInZlcnNpb25cIjpcIjAuMy4xXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIGhhcmVtIGxpbmsgaW5zaWRlIGxvdmUgcmFpZCBjYXJkc1wiXX0se1widmVyc2lvblwiOlwiMC4zLjBcIixcImNoYW5nZXNcIjpbXCJBZGQgTG92ZVJhaWRzQWRkb24gYW5kIExvdmVSYWlkc1BhcnNlciBtb2R1bGVzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjIuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBSZW1vdmVQYXNzTG9jayBtb2R1bGVcIl19LHtcInZlcnNpb25cIjpcIjAuMS4zXCIsXCJjaGFuZ2VzXCI6W1wiQmV0dGVyIGNvZGUgcHJhY3RpY2VzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjEuMlwiLFwiY2hhbmdlc1wiOltcIlBvbGlzaGluZyBhbmQgdXBkYXRlIGxpbmtzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjEuMVwiLFwiY2hhbmdlc1wiOltcIkFkZCBGcmllbmRBbmRGb2VzIG1vZHVsZVwiXX0se1widmVyc2lvblwiOlwiMC4wLjFcIixcImNoYW5nZXNcIjpbXCJJbml0aWFsIHJlbGVhc2VcIl19XSIsICJpbnRlcmZhY2UgQ2hhbmdlbG9nVmlldyB7XG4gICAgY29udGVudDogSFRNTEVsZW1lbnQ7XG4gICAgY2xvc2VCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xuICAgIHNob3VsZE9wZW46ICgpID0+IGJvb2xlYW47XG4gICAgb25PcGVuOiAoKSA9PiB2b2lkO1xuICAgIG9uQ2xvc2U6ICgpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93Q2hhbmdlbG9nUG9wdXAodmlldzogQ2hhbmdlbG9nVmlldykge1xuICAgIGlmICghdmlldy5zaG91bGRPcGVuKCkpIHtcbiAgICAgICAgdmlldy5vbkNsb3NlKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaWFsb2cnKTtcbiAgICBkaWFsb2cuY2xhc3NOYW1lID0gJ2phcnZpcy1jaGFuZ2Vsb2ctcG9wdXAnO1xuICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsICdqYXJ2aXMtY2hhbmdlbG9nLXRpdGxlJyk7XG4gICAgZGlhbG9nLmFwcGVuZENoaWxkKHZpZXcuY29udGVudCk7XG5cbiAgICAvLyBMZXQgdGhlIGJyb3dzZXIgb3duIHRoZSBtb2RhbCBzdGF0ZSBhbmQgcmVzdG9yZSBwYWdlIGlucHV0IHdoZW4gaXQgY2xvc2VzLlxuICAgIGNvbnN0IGRpc21pc3MgPSAoKSA9PiBkaWFsb2cuY2xvc2UoKTtcbiAgICB2aWV3LmNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZGlzbWlzcyk7XG4gICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbmNlbCcsIGV2ZW50ID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZGlzbWlzcygpO1xuICAgIH0pO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCAhPT0gZGlhbG9nKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IGRpYWxvZy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaWYgKGV2ZW50LmNsaWVudFggPCBib3VuZHMubGVmdCB8fCBldmVudC5jbGllbnRYID4gYm91bmRzLnJpZ2h0IHx8XG4gICAgICAgICAgICBldmVudC5jbGllbnRZIDwgYm91bmRzLnRvcCB8fCBldmVudC5jbGllbnRZID4gYm91bmRzLmJvdHRvbSkgZGlzbWlzcygpO1xuICAgIH0pO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgZGlhbG9nLnJlbW92ZSgpO1xuICAgICAgICB2aWV3Lm9uQ2xvc2UoKTtcbiAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgdHJ5IHtcbiAgICAgICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBkaWFsb2cucmVtb3ZlKCk7XG4gICAgICAgIHZpZXcub25DbG9zZSgpO1xuICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgb3BlbiB0aGUgY2hhbmdlbG9nOicsIGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmlldy5jbG9zZUJ1dHRvbi5mb2N1cyh7IHByZXZlbnRTY3JvbGw6IHRydWUgfSk7XG4gICAgdmlldy5vbk9wZW4oKTtcbn1cbiIsICJpbXBvcnQgcmVsZWFzZU5vdGVzIGZyb20gJy4uLy4uLy4uL0NIQU5HRUxPRy5tZCc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgSEhNb2R1bGUsIHR5cGUgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBsc0dldCwgbHNTZXQgfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcbmltcG9ydCB7IHNob3dDaGFuZ2Vsb2dQb3B1cCB9IGZyb20gJy4vY2hhbmdlbG9nUG9wdXAnO1xuXG5jb25zdCBzZWVuS2V5ID0gYENoYW5nZWxvZ1NlZW4ke1VTRVJTQ1JJUFRfQ0hBTk5FTH1gO1xuY29uc3QgbGF0ZXN0VmVyc2lvbiA9IHJlbGVhc2VOb3Rlc1swXS52ZXJzaW9uO1xuY29uc3QgY29uZmlnS2V5ID0gJ0pBUlZJU19jaGFuZ2Vsb2cnO1xuY29uc3Qgc2lsZW50S2V5ID0gYCR7Y29uZmlnS2V5fV9zaWxlbnRgO1xuY29uc3Qgc2V0dGluZ3NDYXJkID0gYC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmNvbmZpZy1zZXR0aW5nW3JlbD1cIiR7Y29uZmlnS2V5fVwiXWA7XG5cbmZ1bmN0aW9uIHJlYWRTZWVuVmVyc2lvbigpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzZWVuID0gbHNHZXQoc2VlbktleSk7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygc2VlbiA9PT0gJ3N0cmluZycgJiYgL15cXGQrXFwuXFxkK1xcLlxcZCskLy50ZXN0KHNlZW4pID8gc2VlbiA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNOZXdlcih2ZXJzaW9uOiBzdHJpbmcsIHByZXZpb3VzOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgaWYgKCFwcmV2aW91cykgcmV0dXJuIHRydWU7XG5cbiAgICBjb25zdCBvbGRQYXJ0cyA9IHByZXZpb3VzLnNwbGl0KCcuJykubWFwKE51bWJlcik7XG4gICAgY29uc3QgbmV3UGFydHMgPSB2ZXJzaW9uLnNwbGl0KCcuJykubWFwKE51bWJlcik7XG4gICAgZm9yIChjb25zdCBbaW5kZXgsIHBhcnRdIG9mIG5ld1BhcnRzLmVudHJpZXMoKSkge1xuICAgICAgICBpZiAocGFydCAhPT0gb2xkUGFydHNbaW5kZXhdKSByZXR1cm4gcGFydCA+IG9sZFBhcnRzW2luZGV4XTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiByZWxlYXNlU2VjdGlvbihyZWxlYXNlOiB0eXBlb2YgcmVsZWFzZU5vdGVzW251bWJlcl0pIHtcbiAgICBjb25zdCBzZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpO1xuICAgIGNvbnN0IGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSBgdiR7cmVsZWFzZS52ZXJzaW9ufWA7XG4gICAgY29uc3QgY2hhbmdlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgcmVsZWFzZS5jaGFuZ2VzKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICBpdGVtLnRleHRDb250ZW50ID0gY2hhbmdlO1xuICAgICAgICBjaGFuZ2VzLmFwcGVuZENoaWxkKGl0ZW0pO1xuICAgIH1cbiAgICBzZWN0aW9uLmFwcGVuZChoZWFkaW5nLCBjaGFuZ2VzKTtcbiAgICByZXR1cm4gc2VjdGlvbjtcbn1cblxuZXhwb3J0IGNsYXNzIENoYW5nZWxvZyBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHBlbmRpbmc6ICdhdXRvbWF0aWMnIHwgJ21hbnVhbCcgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIG9wZW5lcjogSFRNTEJ1dHRvbkVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHZpZXdlZFRoaXNQYWdlID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBsb2FkTGlzdGVuZXI6IEFib3J0Q29udHJvbGxlciB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc2V0dGluZ3NJbnN0YWxsZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIHNpbGVudCA9IGZhbHNlO1xuICAgIHByaXZhdGUgbm90aWNlOiBIVE1MQnV0dG9uRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgd2FpdGluZ0Zvck5vdGljZUFuY2hvciA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnY2hhbmdlbG9nJztcbiAgICAgICAgc3VwZXIoeyBuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWE6IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoJ1VwZGF0ZSBub3RpY2VzJywgJ1Nob3cgdGhlIGNoYW5nZWxvZyB0aGUgZmlyc3QgdGltZSB5b3UgbG9hZCB0aGUgaG9tZXBhZ2UgYWZ0ZXIgYW4gdXBkYXRlLiBVc2UgVmlldyBjaGFuZ2Vsb2cgdG8gb3BlbiBpdCB3aGVuZXZlciB5b3UgbGlrZS4nKSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdzaWxlbnQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscCgnU2lsZW50IGNoYW5nZWxvZycsICdQdXQgYSBOZXcgYnV0dG9uIGJlc2lkZSBISCsrIG9uIHRoZSBob21lcGFnZSB3aGVuIGFuIHVwZGF0ZSBpcyBhdmFpbGFibGUuIENsaWNrIGl0IHRvIHJlYWQgdGhlIGNoYW5nZWxvZy4nKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfSB9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZSA9PT0gJy9ob21lLmh0bWwnO1xuICAgIH1cblxuICAgIGluc3RhbGxTZXR0aW5ncygpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNob3VsZFJ1bigpKSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0dGluZ3NJbnN0YWxsZWQgPSB0cnVlO1xuXG4gICAgICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2V0dGluZ3NDYXJkLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZXR0aW5nc0NhcmQpO1xuICAgICAgICAgICAgaWYgKCFjYXJkIHx8IGNhcmQucXVlcnlTZWxlY3RvcignLmphcnZpcy12aWV3LWNoYW5nZWxvZycpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uIGphcnZpcy12aWV3LWNoYW5nZWxvZyc7XG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAnVmlldyBjaGFuZ2Vsb2cnO1xuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5vcGVuKCdtYW51YWwnLCBidXR0b24pKTtcbiAgICAgICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcnVuKHsgc2lsZW50ID0gZmFsc2UgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSByZXR1cm47XG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zaWxlbnQgPSBzaWxlbnQ7XG4gICAgICAgIC8vIEhIKysgY2FuIHJ1biB0aGUgbW9kdWxlIGFnYWluIHdoZW4gdGhlIHVzZXIgdHVybnMgbm90aWNlcyBvbiBpbiB0aGUgc2V0dGluZ3MgcGFuZS5cbiAgICAgICAgY29uc3QgYWxsb3dBdXRvbWF0aWMgPSAhdGhpcy5zZXR0aW5nc0luc3RhbGxlZDtcblxuICAgICAgICBjb25zdCBjaGVjayA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNVbnJlYWRVcGRhdGUoKSkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2lsZW50KSB0aGlzLnNob3dOb3RpY2UoKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGFsbG93QXV0b21hdGljKSB0aGlzLm9wZW4oJ2F1dG9tYXRpYycpO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykgY2hlY2soKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRMaXN0ZW5lciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgY2hlY2ssIHsgb25jZTogdHJ1ZSwgc2lnbmFsOiB0aGlzLmxvYWRMaXN0ZW5lci5zaWduYWwgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0ZWFyRG93bigpIHtcbiAgICAgICAgdGhpcy5sb2FkTGlzdGVuZXI/LmFib3J0KCk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVtb3ZlTm90aWNlKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlU3ViU2V0dGluZyhrZXk6IHN0cmluZywgdmFsdWU6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKGtleSAhPT0gJ3NpbGVudCcpIHJldHVybjtcbiAgICAgICAgdGhpcy5zaWxlbnQgPSB2YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlKSB0aGlzLnNob3dOb3RpY2UoKTtcbiAgICAgICAgZWxzZSB0aGlzLnJlbW92ZU5vdGljZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFzVW5yZWFkVXBkYXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNSdW4gJiYgIXRoaXMudmlld2VkVGhpc1BhZ2UgJiYgaXNOZXdlcihsYXRlc3RWZXJzaW9uLCByZWFkU2VlblZlcnNpb24oKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG93Tm90aWNlKCkge1xuICAgICAgICBpZiAoIXRoaXMuc2lsZW50IHx8ICF0aGlzLmhhc1VucmVhZFVwZGF0ZSgpIHx8IHRoaXMubm90aWNlIHx8IHRoaXMud2FpdGluZ0Zvck5vdGljZUFuY2hvcikgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gJy5oaC1wbHVzLXBsdXMtY29uZmlnLWJ1dHRvbic7XG4gICAgICAgIHRoaXMud2FpdGluZ0Zvck5vdGljZUFuY2hvciA9IHRydWU7XG4gICAgICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMud2FpdGluZ0Zvck5vdGljZUFuY2hvciA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgYW5jaG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoIWFuY2hvciB8fCAhdGhpcy5zaWxlbnQgfHwgIXRoaXMuaGFzVW5yZWFkVXBkYXRlKCkpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY2hhbmdlbG9nLW5vdGljZSc7XG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAnTmV3JztcbiAgICAgICAgICAgIGJ1dHRvbi50aXRsZSA9ICdSZWFkIHRoZSBKYXJ2aXMgY2hhbmdlbG9nJztcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnTmV3IEphcnZpcyB1cGRhdGUuIFJlYWQgdGhlIGNoYW5nZWxvZy4nKTtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW4oJ21hbnVhbCcsIGJ1dHRvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubm90aWNlID0gYW5jaG9yLmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVtb3ZlTm90aWNlKCkge1xuICAgICAgICB0aGlzLm5vdGljZT8ucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMubm90aWNlID0gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNhdmVOb3RpY2VTZXR0aW5nKGtleTogdHlwZW9mIGNvbmZpZ0tleSB8IHR5cGVvZiBzaWxlbnRLZXksIHZhbHVlOiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHdpbmRvdy5oaFBsdXNQbHVzQ29uZmlnO1xuICAgICAgICBpZiAoIWNvbmZpZykgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGxldCBwcmV2aW91cyA9IGNvbmZpZy5jb25maWdba2V5XTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbmZpZy5sb2FkQ29uZmlnKCk7XG4gICAgICAgICAgICBwcmV2aW91cyA9IGNvbmZpZy5jb25maWdba2V5XTtcbiAgICAgICAgICAgIGNvbmZpZy5jb25maWdba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgY29uZmlnLnNhdmVDb25maWcoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25maWcuY29uZmlnW2tleV0gPSBwcmV2aW91cztcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBzYXZlIHRoZSB1cGRhdGUgbm90aWNlIHByZWZlcmVuY2U6JywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhIKysgY3JlYXRlcyBpdHMgc2V0dGluZ3MgcGFuZSBsYXppbHksIHNvIHRoZSBwb3B1cCBjYW4gY2xvc2UgYmVmb3JlIHRoZSBwYW5lIGV4aXN0cy5cbiAgICAgICAgY29uc3QgY2hlY2tib3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KGAke3NldHRpbmdzQ2FyZH0gaW5wdXRbbmFtZT1cIiR7a2V5fVwiXWApO1xuICAgICAgICBpZiAoY2hlY2tib3gpIGNoZWNrYm94LmNoZWNrZWQgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkaXNhYmxlTm90aWNlcygpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNhdmVOb3RpY2VTZXR0aW5nKGNvbmZpZ0tleSwgZmFsc2UpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2V0dGluZ3NDYXJkKTtcbiAgICAgICAgY2FyZD8uY2xhc3NMaXN0LnJlbW92ZSgnZW5hYmxlZCcpO1xuICAgICAgICBjb25zdCBzaWxlbnQgPSBjYXJkPy5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KGBpbnB1dFtuYW1lPVwiJHtzaWxlbnRLZXl9XCJdYCk7XG4gICAgICAgIGlmIChzaWxlbnQpIHNpbGVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMudGVhckRvd24oKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9wZW4obW9kZTogJ2F1dG9tYXRpYycgfCAnbWFudWFsJywgb3BlbmVyOiBIVE1MQnV0dG9uRWxlbWVudCB8IG51bGwgPSBudWxsKSB7XG4gICAgICAgIGlmICghdGhpcy5zaG91bGRSdW4oKSkgcmV0dXJuO1xuICAgICAgICBpZiAobW9kZSA9PT0gJ21hbnVhbCcpIHRoaXMub3BlbmVyID0gb3BlbmVyO1xuICAgICAgICBpZiAodGhpcy5wZW5kaW5nKSB7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gJ21hbnVhbCcpIHRoaXMucGVuZGluZyA9IG1vZGU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wZW5kaW5nID0gbW9kZTtcblxuICAgICAgICBjb25zdCBwcmV2aW91cyA9IHJlYWRTZWVuVmVyc2lvbigpO1xuICAgICAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNvbnRlbnQuY2xhc3NOYW1lID0gJ2NvbnRhaW5lci1zcGVjaWFsLWJnIGphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCc7XG4gICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcbiAgICAgICAgdGl0bGUuaWQgPSAnamFydmlzLWNoYW5nZWxvZy10aXRsZSc7XG4gICAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gJ0phcnZpcyBjaGFuZ2Vsb2cnO1xuICAgICAgICBjb25zdCBub3RlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBub3Rlcy5jbGFzc05hbWUgPSAnamFydmlzLWNoYW5nZWxvZy1ub3Rlcyc7XG4gICAgICAgIGNvbnN0IG5ld1JlbGVhc2VzID0gcHJldmlvdXMgJiYgaXNOZXdlcihsYXRlc3RWZXJzaW9uLCBwcmV2aW91cylcbiAgICAgICAgICAgID8gcmVsZWFzZU5vdGVzLmZpbHRlcihyZWxlYXNlID0+IGlzTmV3ZXIocmVsZWFzZS52ZXJzaW9uLCBwcmV2aW91cykpLmxlbmd0aFxuICAgICAgICAgICAgOiAxO1xuICAgICAgICBub3Rlcy5hcHBlbmQoLi4ucmVsZWFzZU5vdGVzLnNsaWNlKDAsIG5ld1JlbGVhc2VzKS5tYXAocmVsZWFzZVNlY3Rpb24pKTtcbiAgICAgICAgY29uc3QgZWFybGllciA9IHJlbGVhc2VOb3Rlcy5zbGljZShuZXdSZWxlYXNlcyk7XG4gICAgICAgIGlmIChlYXJsaWVyLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgaGlzdG9yeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RldGFpbHMnKTtcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdW1tYXJ5Jyk7XG4gICAgICAgICAgICBzdW1tYXJ5LnRleHRDb250ZW50ID0gJ0VhcmxpZXIgdmVyc2lvbnMnO1xuICAgICAgICAgICAgaGlzdG9yeS5hcHBlbmQoc3VtbWFyeSwgLi4uZWFybGllci5tYXAocmVsZWFzZVNlY3Rpb24pKTtcbiAgICAgICAgICAgIG5vdGVzLmFwcGVuZENoaWxkKGhpc3RvcnkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZm9vdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9vdGVyJyk7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgb3B0aW9ucy5jbGFzc05hbWUgPSAnamFydmlzLWNoYW5nZWxvZy1vcHRpb25zJztcbiAgICAgICAgY29uc3Qgb3B0T3V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAgICAgY29uc3QgZG9udFNob3dBZ2FpbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIGRvbnRTaG93QWdhaW4udHlwZSA9ICdjaGVja2JveCc7XG4gICAgICAgIG9wdE91dC5hcHBlbmQoZG9udFNob3dBZ2FpbiwgJ0RvbuKAmXQgc2hvdyBhZ2FpbicpO1xuICAgICAgICBjb25zdCBzaWxlbnRPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICBjb25zdCB1c2VTaWxlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICB1c2VTaWxlbnQudHlwZSA9ICdjaGVja2JveCc7XG4gICAgICAgIHVzZVNpbGVudC5jaGVja2VkID0gdGhpcy5zaWxlbnQ7XG4gICAgICAgIHNpbGVudE9wdGlvbi50aXRsZSA9ICdTaG93IGEgTmV3IGJ1dHRvbiBieSBISCsrIGZvciBmdXR1cmUgdXBkYXRlcy4nO1xuICAgICAgICBzaWxlbnRPcHRpb24uYXBwZW5kKHVzZVNpbGVudCwgJ1NpbGVudCBjaGFuZ2Vsb2cnKTtcbiAgICAgICAgZG9udFNob3dBZ2Fpbi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB1c2VTaWxlbnQuZGlzYWJsZWQgPSBkb250U2hvd0FnYWluLmNoZWNrZWQpO1xuICAgICAgICBvcHRpb25zLmFwcGVuZChvcHRPdXQsIHNpbGVudE9wdGlvbik7XG4gICAgICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNsb3NlQnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgY2xvc2VCdXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgICAgIGNsb3NlQnV0dG9uLnRleHRDb250ZW50ID0gJ0Nsb3NlJztcbiAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uKTtcbiAgICAgICAgY29udGVudC5hcHBlbmQodGl0bGUsIG5vdGVzLCBmb290ZXIpO1xuXG4gICAgICAgIHNob3dDaGFuZ2Vsb2dQb3B1cCh7XG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgY2xvc2VCdXR0b24sXG4gICAgICAgICAgICBzaG91bGRPcGVuOiAoKSA9PiB0aGlzLnBlbmRpbmcgPT09ICdtYW51YWwnIHx8ICghdGhpcy5zaWxlbnQgJiYgdGhpcy5oYXNVbnJlYWRVcGRhdGUoKSksXG4gICAgICAgICAgICBvbk9wZW46ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdlZFRoaXNQYWdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZU5vdGljZSgpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhhc1J1bikgZm9vdGVyLnByZXBlbmQob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmV3ZXIobGF0ZXN0VmVyc2lvbiwgcmVhZFNlZW5WZXJzaW9uKCkpKSBsc1NldChzZWVuS2V5LCBsYXRlc3RWZXJzaW9uKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIHZpZXdlZCBjaGFuZ2Vsb2cgdmVyc2lvbjonLCBlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkNsb3NlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZW5kaW5nID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoZG9udFNob3dBZ2Fpbi5jaGVja2VkKSB0aGlzLmRpc2FibGVOb3RpY2VzKCk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5oYXNSdW4gJiYgdXNlU2lsZW50LmNoZWNrZWQgIT09IHRoaXMuc2lsZW50ICYmIHRoaXMuc2F2ZU5vdGljZVNldHRpbmcoc2lsZW50S2V5LCB1c2VTaWxlbnQuY2hlY2tlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTdWJTZXR0aW5nKCdzaWxlbnQnLCB1c2VTaWxlbnQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMub3BlbmVyPy5mb2N1cyh7IHByZXZlbnRTY3JvbGw6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuZXIgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgaW5pdEdhbWUgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgaW5qZWN0U3R5bGVzLCBwYWNrU2V0dGluZ3MgfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB7IEZyaWVuZEFuZEZvZXMgfSBmcm9tICcuL21vZHVsZXMvcGxheWVycy9GcmllbmRBbmRGb2VzJztcbmltcG9ydCB7IGFybUNvbnRlc3RTdGFydHVwR3VhcmQsIENvbnRlc3RTdGFydCB9IGZyb20gJy4vbW9kdWxlcy9jb250ZXN0cy9Db250ZXN0U3RhcnQnO1xuaW1wb3J0IHsgaW5zdGFsbENvbnRlc3RTZXR0aW5ncyB9IGZyb20gJy4vbW9kdWxlcy9jb250ZXN0cy9jb250ZXN0UHJlZmVyZW5jZXMnO1xuaW1wb3J0IHsgTGVhZ3VlVG9wMjAgfSBmcm9tICcuL21vZHVsZXMvcGxheWVycy9MZWFndWVUb3AyMCc7XG5pbXBvcnQgeyBSZW1vdmVQYXNzTG9jayB9IGZyb20gJy4vbW9kdWxlcy9wcm9ncmVzc2lvbi9SZW1vdmVQYXNzTG9jayc7XG5pbXBvcnQgeyBMb3ZlUmFpZHNBZGRvbiB9IGZyb20gJy4vbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc0FkZG9uJztcbmltcG9ydCB7IExvdmVSYWlkc1BhcnNlciB9IGZyb20gJy4vbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc1BhcnNlcic7XG5pbXBvcnQgeyBBY3Rpdml0eVBhcnNlciB9IGZyb20gJy4vbW9kdWxlcy9hY3Rpdml0aWVzL0FjdGl2aXR5UGFyc2VyJztcbmltcG9ydCB7IENoYW5nZWxvZyB9IGZyb20gJy4vbW9kdWxlcy91cGRhdGVzL0NoYW5nZWxvZyc7XG5cbmFybUNvbnRlc3RTdGFydHVwR3VhcmQoKTtcblxuZnVuY3Rpb24gcnVuSmFydmlzKCkge1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHJ1bkphcnZpcywgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgeyAkIH0gPSB3aW5kb3c7XG5cbiAgICBpZiAoISQpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgcnVuSmFydmlzLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdXQVJOSU5HOiBObyBqUXVlcnkgZm91bmQuIEVuZGluZyBzY3JpcHQuJyk7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKCdIZWxsbywgU2lyLCBKLkEuUi5WLkkuUy4gaXMgcmVhZHkgdG8gaGVscCB5b3UuJyk7XG5cbiAgICBpbml0R2FtZSgkKTtcbiAgICBpbmplY3RTdHlsZXMoKTtcblxuICAgIGNvbnN0IGZyaWVuZHNBbmRGb2VzID0gbmV3IEZyaWVuZEFuZEZvZXMoKTtcbiAgICBjb25zdCBjaGFuZ2Vsb2cgPSBuZXcgQ2hhbmdlbG9nKCk7XG4gICAgY29uc3QgYWxsTW9kdWxlcyA9IFtcbiAgICAgICAgZnJpZW5kc0FuZEZvZXMsXG4gICAgICAgIG5ldyBDb250ZXN0U3RhcnQoKSxcbiAgICAgICAgbmV3IExlYWd1ZVRvcDIwKCksXG4gICAgICAgIG5ldyBSZW1vdmVQYXNzTG9jaygpLFxuICAgICAgICBuZXcgTG92ZVJhaWRzQWRkb24oKSxcbiAgICAgICAgbmV3IExvdmVSYWlkc1BhcnNlcigpLFxuICAgICAgICBuZXcgQWN0aXZpdHlQYXJzZXIoKSxcbiAgICAgICAgY2hhbmdlbG9nXG4gICAgXVxuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJ1blNjcmlwdCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgaGhQbHVzUGx1c0NvbmZpZyB9ID0gd2luZG93XG4gICAgICAgICAgICBpZiAoIWhoUGx1c1BsdXNDb25maWcpIHJldHVybjtcblxuICAgICAgICAgICAgaGhQbHVzUGx1c0NvbmZpZy5yZWdpc3Rlckdyb3VwKHtcbiAgICAgICAgICAgICAgICBrZXk6ICdKQVJWSVMnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdISCBKYXJ2aXMnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgYWxsTW9kdWxlcy5mb3JFYWNoKG1vZHVsZSA9PiB7XG4gICAgICAgICAgICAgICAgaGhQbHVzUGx1c0NvbmZpZy5yZWdpc3Rlck1vZHVsZShtb2R1bGUpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgaGhQbHVzUGx1c0NvbmZpZy5sb2FkQ29uZmlnKClcbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucnVuTW9kdWxlcygpXG4gICAgICAgICAgICBmcmllbmRzQW5kRm9lcy5pbnN0YWxsU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIGluc3RhbGxDb250ZXN0U2V0dGluZ3MoKTtcbiAgICAgICAgICAgIGNoYW5nZWxvZy5pbnN0YWxsU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIHBhY2tTZXR0aW5ncygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpbmRvdy5oaFBsdXNQbHVzQ29uZmlnKSB7XG4gICAgICAgICAgICBydW5TY3JpcHQoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJChkb2N1bWVudCkub25lKCdoaCsrLWJkc206bG9hZGVkJywgcnVuU2NyaXB0KVxuICAgICAgICB9XG4gICAgfSwgMSlcbn1cblxucnVuSmFydmlzKCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQU8sTUFBSTtBQUNKLE1BQUk7QUFFSixXQUFTLFNBQVMsUUFBc0I7QUFDM0MsUUFBSTtBQUNKLGtCQUFjLE9BQU8sU0FBUztBQUFBLEVBQ2xDOzs7QUNOTyxXQUFTLFlBQVksT0FBZSxhQUFxQjtBQUM1RCxVQUFNLFNBQVMsQ0FBQyxTQUFpQixLQUFLLFdBQVcsS0FBSyxPQUFPLEVBQUUsV0FBVyxLQUFLLFFBQVEsRUFDbEYsV0FBVyxLQUFLLE1BQU0sRUFBRSxXQUFXLEtBQUssTUFBTTtBQUNuRCxXQUFPLE9BQU8sS0FBSyxJQUFJLHNGQUNuQixPQUFPLEtBQUssSUFBSSwwQkFBMEIsT0FBTyxXQUFXLElBQUk7QUFBQSxFQUN4RTtBQUVPLFdBQVMsa0JBQWtCLE9BQW9CLFdBQW1CO0FBQ3JFLFVBQU0sVUFBVSxTQUFTLGNBQWMsS0FBSztBQUM1QyxZQUFRLEtBQUs7QUFDYixZQUFRLFlBQVk7QUFDcEIsWUFBUSxhQUFhLFFBQVEsU0FBUztBQUN0QyxVQUFNLFVBQVUsT0FBTyxRQUFRLGdCQUFnQjtBQUMvQyxRQUFJLFFBQVMsU0FBUSxhQUFhLFdBQVcsUUFBUTtBQUFBLFFBQ2hELFNBQVEsU0FBUztBQUN0QixhQUFTLEtBQUssWUFBWSxPQUFPO0FBRWpDLFFBQUksU0FBNkI7QUFDakMsVUFBTSxVQUFVLENBQUMsV0FDYixrQkFBa0IsVUFBVSxPQUFPLFFBQXFCLHFCQUFxQixJQUFJO0FBQ3JGLFVBQU0sUUFBUSxNQUFNO0FBQ2hCLFVBQUksQ0FBQyxPQUFRO0FBQ2IsYUFBTyxnQkFBZ0Isa0JBQWtCO0FBQ3pDLGVBQVM7QUFDVCxV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O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNJTyxXQUFTLGVB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
