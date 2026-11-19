// ==UserScript==
// @name           HH J.A.R.V.I.S. (Dev)
// @version        0.8.0
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
#contests .contest_header .jarvis-contest-title {
    display: flex;
    align-items: center;
    gap: .3em;
    min-inline-size: 0;
}
.jarvis-contest-title-label {
    flex: 1 1 0%;
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.jarvis-contest-title > :is(.jarvis-contest-pin, .jarvis-contest-rank-start) {
    flex: none;
    margin-inline-start: 0;
}
#contests .contest_header .jarvis-contest-title-stacked {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    row-gap: .12em;
}
.jarvis-contest-title-stacked .jarvis-contest-title-label {
    grid-column: 1 / -1;
}
#contests .contest_title_timer:has(> .jarvis-contest-title-stacked) > .contest_timer {
    align-self: flex-start;
}
.jarvis-contest-title-stacked .jarvis-contest-rank-start {
    justify-self: start;
    font-size: .64em;
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
.jarvis-changelog-notice {
    position: absolute;
    z-index: 5;
    translate: calc(-100% - .25em) -50%;
    aspect-ratio: 1;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: #a9e4ff;
    cursor: pointer;
}
.jarvis-changelog-notice svg {
    display: block;
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 1px 1px #071625);
}
.jarvis-changelog-notice:hover {
    color: #dbf5ff;
}
.jarvis-changelog-notice:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}
.jarvis-changelog-notice:is(:hover, :focus-visible)::after {
    content: attr(data-tooltip);
    position: absolute;
    inset-block-start: calc(100% + .4em);
    inset-inline-end: 0;
    padding: .35em .55em;
    border: 1px solid var(--config-setting-border, #a9a3bc);
    border-radius: .35em;
    background: var(--config-setting-background, #241e30);
    color: #fff;
    font: 500 .75rem/1.25 system-ui, sans-serif;
    white-space: nowrap;
    pointer-events: none;
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
    const version = `v${"0.8.0"}${true ? " Dev" : ""}`;
    style.textContent = `${settings_default}
        .hh-plus-plus-config-panel { --jarvis-version: "${version}"; }
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
  function readContestRank(id, fallback) {
    const ranks = readContestSetting("ContestRanks");
    if (ranks && typeof ranks === "object" && Object.hasOwn(ranks, id)) {
      const rank = ranks[id];
      if (rank === "mine" || rank === "top") return rank;
    }
    const saved = readContestSetting("ContestPinnedRank");
    if (saved && typeof saved === "object" && "id" in saved && String(saved.id) === id && "rank" in saved) {
      if (saved.rank === "mine" || saved.rank === "top") return saved.rank;
    }
    return fallback;
  }
  function saveContestRank(id, rank) {
    const saved = readContestSetting("ContestRanks");
    const ranks = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    lsSet("ContestRanks", { ...ranks, [id]: rank });
  }
  function pruneContestRanks(available) {
    const saved = readContestSetting("ContestRanks");
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      const entries = Object.entries(saved);
      const kept = entries.filter(([id, rank]) => available.has(id) && (rank === "top" || rank === "mine"));
      if (!kept.length) lsRm("ContestRanks");
      else if (kept.length !== entries.length) lsSet("ContestRanks", Object.fromEntries(kept));
    }
    const legacy = readContestSetting("ContestPinnedRank");
    if (legacy && typeof legacy === "object" && "id" in legacy && !available.has(String(legacy.id))) {
      lsRm("ContestPinnedRank");
    }
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
      rankLabel.innerHTML = settingHelp("Leaderboard start", "Open at the top or at your rank. A position chosen on a contest card takes priority.");
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
  var INTERACTIVE_CONTENT = 'a[href], button, input, select, textarea, [contenteditable]:not([contenteditable="false"]), [tabindex]';
  var protectedPanes = /* @__PURE__ */ new Set();
  var restoreScrollIntoView;
  function guardScrollIntoView(pane) {
    if (!protectedPanes.size) {
      const previous = Element.prototype.scrollIntoView;
      const guarded = function(options) {
        if (Array.from(protectedPanes).some((scroller) => scroller.contains(this))) return;
        previous.call(this, options);
      };
      Element.prototype.scrollIntoView = guarded;
      restoreScrollIntoView = () => {
        if (Element.prototype.scrollIntoView === guarded) Element.prototype.scrollIntoView = previous;
      };
    }
    protectedPanes.add(pane);
    return () => {
      protectedPanes.delete(pane);
      if (protectedPanes.size) return;
      restoreScrollIntoView?.();
      restoreScrollIntoView = void 0;
    };
  }
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
    titleSizes = null;
    titleLabels = /* @__PURE__ */ new Map();
    focusablePanes = /* @__PURE__ */ new Set();
    prunedRankRoster = null;
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
        const ended = finished.has(id);
        if (!header || !ended && !contest && !header.matches(".in_progress")) return [];
        const title = header.querySelector(CONTEST_TITLE_SELECTOR);
        const name = title && Array.from(title.childNodes).filter((node) => !(node instanceof Element) || !node.matches(".jarvis-contest-pin, .jarvis-contest-rank-start")).map((node) => node.textContent).join("").trim();
        const category = getContestCategory(contest?.category_type);
        return [{
          id,
          card,
          header,
          title,
          ended,
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
    pruneUnavailableRanks(list, finished) {
      const data = window.contests;
      if (document.readyState !== "complete" || !data?.active || !data.finished) return;
      const available = new Set(finished);
      for (const contest of Object.values(data.active)) {
        if (contest?.id_contest != null) available.add(String(contest.id_contest));
      }
      for (const card of list.querySelectorAll(".contest[id_contest]")) {
        const id = card.getAttribute("id_contest");
        if (id) available.add(id);
      }
      const roster = Array.from(available).sort().join(",");
      if (this.prunedRankRoster === roster) return;
      this.prunedRankRoster = roster;
      try {
        pruneContestRanks(available);
      } catch (err) {
        console.warn("Jarvis could not clean up old contest rank choices:", err);
      }
    }
    updateCardControls(list, contests) {
      const hosts = new Set(contests.map(({ title, header }) => title || header));
      for (const control of list.querySelectorAll(".jarvis-contest-pin, .jarvis-contest-rank-start")) {
        if (!control.parentElement || !hosts.has(control.parentElement)) control.remove();
      }
      for (const [title, text] of this.titleLabels) {
        if (hosts.has(title) && text.parentElement === title) continue;
        this.titleSizes?.unobserve(text);
        if (text.parentElement === title) text.replaceWith(...text.childNodes);
        title.classList.remove("jarvis-contest-title", "jarvis-contest-title-stacked");
        this.titleLabels.delete(title);
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
        pin.title = pinned ? "Pinned. Click to unpin this contest." : "Open this contest when the page reloads";
        let position = host.querySelector(":scope > .jarvis-contest-rank-start");
        if (!position) {
          const choice = makeRankChoice("Contest leaderboard start", (rank) => {
            const contestId = choice.closest(".contest[id_contest]")?.getAttribute("id_contest");
            if (!contestId) return;
            try {
              saveContestRank(contestId, rank);
              selectContestChoice(choice, rank);
            } catch (err) {
              console.warn("Jarvis could not save the leaderboard position:", err);
              return;
            }
            if (this.right && this.getSelectedContestId(list, this.right) === contestId) {
              this.stopJump?.();
              this.positionSwitch(list, this.right, contestId);
            }
          });
          choice.classList.add("jarvis-contest-rank-start");
          choice.title = "Leaderboard position for this contest";
          pin.after(choice);
          position = choice;
        }
        selectContestChoice(position, readContestRank(id, this.defaults.rank));
        if (!title) continue;
        let text = this.titleLabels.get(title);
        if (!text) {
          text = document.createElement("span");
          text.className = "jarvis-contest-title-label";
          text.append(...Array.from(title.childNodes).filter((node) => node !== pin && node !== position));
          title.prepend(text);
          title.classList.add("jarvis-contest-title");
          this.titleLabels.set(title, text);
          this.titleSizes?.observe(text);
        }
        if (text.title !== label) {
          text.title = label;
          this.fitTitle(text);
        }
      }
    }
    fitTitle(text) {
      const heading = text.parentElement;
      if (!heading?.clientWidth) return;
      heading.classList.remove("jarvis-contest-title-stacked");
      text.style.removeProperty("font-size");
      const minimumReadableWidth = 4 * parseFloat(getComputedStyle(text).fontSize);
      if (text.clientWidth < minimumReadableWidth && text.scrollWidth > text.clientWidth) {
        heading.classList.add("jarvis-contest-title-stacked");
      }
      if (text.scrollWidth > text.clientWidth) text.style.fontSize = ".8em";
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
      if (id) this.positionSwitch(list, right, id, shortcutCard);
      this.showLeaderboard(right, null);
      document.getElementById("jarvis-contest-startup")?.remove();
    }
    focusScrollPane(pane, target) {
      const control = target.closest(INTERACTIVE_CONTENT);
      if (control && control !== pane && pane.contains(control)) return;
      if (!pane.hasAttribute("tabindex")) {
        pane.tabIndex = -1;
        this.focusablePanes.add(pane);
      }
      pane.focus({ preventScroll: true });
    }
    lockScroll(scroller, guardDescendants = false) {
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
      const releaseDescendants = guardDescendants ? guardScrollIntoView(scroller) : void 0;
      return () => {
        $(scroller).stop(true, false);
        releaseDescendants?.();
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
      const atOwnRank = readContestRank(id, this.defaults.rank) === "mine";
      const releaseList = this.stopSwitchScroll || shortcutCard ? this.lockScroll(list, true) : void 0;
      let manualList = false;
      let manualBoard = false;
      let board;
      let releaseBoard;
      const restore = () => {
        const next = this.getLeaderboardScroller(right, id);
        if (next !== board) {
          releaseBoard?.();
          board = next;
          releaseBoard = board ? this.lockScroll(board, true) : void 0;
          manualBoard = false;
        }
        if (!manualList && releaseList) {
          if (shortcutCard && list.contains(shortcutCard)) this.jumpTo(list, shortcutCard);
          else this.scrollInstantly(list, listTop);
        }
        if (!manualBoard && board?.clientHeight && this.getSelectedContestId(list, right) === id) {
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
      const onManualInput = (event) => {
        if (!event.isTrusted || !(event.target instanceof Node)) return;
        if (list.contains(event.target)) manualList = true;
        if (board?.contains(event.target) && this.getSelectedContestId(list, right) === id) manualBoard = true;
      };
      for (const pane of [list, right]) {
        pane.addEventListener("scroll", onScroll, options);
        for (const type of ["wheel", "touchmove", "pointerdown"]) pane.addEventListener(type, onManualInput, options);
      }
      document.addEventListener("keydown", (event) => {
        if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) onManualInput(event);
      }, options);
      this.switchScroll = { restore, stop };
      restore();
    }
    openContest(list, right, { id, card, header, title }) {
      for (const pane of [list, right]) pane.classList.add("jarvis-contest-instant", "jarvis-contest-loading");
      const rank = readContestRank(id, this.defaults.rank);
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
      for (const pane of this.focusablePanes) {
        if (pane === list || right?.contains(pane)) continue;
        if (pane.tabIndex === -1) pane.removeAttribute("tabindex");
        this.focusablePanes.delete(pane);
      }
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
      const cards = this.getContests(list, finished);
      const contests = cards.filter((card) => !card.ended);
      this.pruneUnavailableRanks(list, finished);
      this.clearExpiredPin(list, contests, finished);
      this.updateCardControls(list, contests);
      if (this.reposition) {
        this.reposition();
      } else if (this.startupPending) {
        let target = this.getTarget(contests);
        if (!contests.length && !this.preference && document.readyState === "complete") {
          const selected = this.getSelectedContestId(list, right);
          target = cards.find((card) => card.id === selected) ?? cards.at(-1);
        }
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
      this.prunedRankRoster = null;
      this.listeners = new AbortController();
      const { signal } = this.listeners;
      this.titleSizes = new ResizeObserver((entries) => {
        for (const { target } of entries) this.fitTitle(target);
      });
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
        const { target } = event;
        if (!event.isTrusted || !(target instanceof Element) || !this.right || !this.list) return;
        if (!this.list.contains(target)) {
          const board = target.closest(".lead_table_view");
          if (board && this.right.contains(board)) this.focusScrollPane(board, target);
          return;
        }
        const header = target.closest(".contest_header");
        if (!header || target.closest(".jarvis-contest-pin, .jarvis-contest-rank-start")) return;
        this.focusScrollPane(this.list, target);
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
      this.titleSizes?.disconnect();
      this.listeners?.abort();
      this.stopJump?.();
      this.switchScroll?.stop();
      this.startupPending = false;
      for (const pane of this.focusablePanes) {
        if (pane.tabIndex === -1) pane.removeAttribute("tabindex");
      }
      this.focusablePanes.clear();
      this.list?.closest("#contests")?.querySelector(":scope > .jarvis-contest-shortcuts")?.remove();
      if (this.list) this.updateCardControls(this.list, []);
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
  var CHANGELOG_default = [{ version: "0.8.0", changes: ["Middle-click or Ctrl-click the game logo, Path of Valor, or Path of Glory to open the page in a new tab."] }, { version: "0.7.10", changes: ["Keep Home, End, and the arrow keys working after a contest click while automatic scrolling is blocked."] }, { version: "0.7.9", changes: ["Save Don’t show again and Silent changelog when closing the update popup, including with HH++ builds that keep settings private."] }, { version: "0.7.8", changes: ["Clear saved Top and My rank choices once their contests are no longer available."] }, { version: "0.7.7", changes: ["Apply Don’t show again when the changelog closes and update the HH++ setting immediately.", "Give the silent update icon its own tooltip.", "Keep long contest titles in the card header alongside the rank controls.", "Identify the Dev build beside its version in settings."] }, { version: "0.7.6", changes: ["Choose Top or My rank on any active contest. Jarvis remembers each contest’s choice when switching and applies the same position and scroll rules to finished contests.", "Keep game scroll animations from restarting while you scroll by hand during a contest switch.", "See a small arc-reactor icon beside HH++ when a silent update notice is available."] }, { version: "0.7.5", changes: ["Keep the homepage responsive after closing the changelog and choose Silent changelog from the popup.", "Stop automatic sidebar scrolling on contest switches by default and use Top or My rank whenever you switch.", "Bring the selected card into view when you use a contest shortcut."] }, { version: "0.7.4", changes: ["See your rank in each active contest beside the close button and switch leaderboards without moving the contest list."] }, { version: "0.7.3", changes: ["See automatic changelogs only when loading the homepage after an update.", "Enable Silent changelog to get a New button beside HH++ and open the notes when you’re ready.", "Keep the contest list and each leaderboard in place when switching contests with Stop scrolling on contest switches."] }, { version: "0.7.2", changes: ["Open the bottom active contest at your rank by default. Choose CbC, CCC, or LC to prefer that event when available.", "Turn off automatic update notices with Don’t show again in the changelog popup. View changelog stays available in settings."] }, { version: "0.7.1", changes: ["Keep the changelog centered when the game window is resized.", "Clean up saved player names, explain unknown names on hover, and give Remove buttons more room."] }, { version: "0.7.0", changes: ["See what changed in Jarvis the first time a new version runs.", "Open View changelog from HH++ settings at any time, even with automatic notices turned off.", "Expand Earlier versions to read past updates."] }, { version: "0.6.7", changes: ["Make marking one action per player, backfill names for older marks, use the bracket-based promotion target, and simplify the selected contest buttons and version badge."] }, { version: "0.6.6", changes: ["Add setting help in HH++, improve mark contrast and management, and add automatic contest defaults.", "Rename the separately installed testing userscript to Dev."] }, { version: "0.6.5", changes: ["Move the userscript source into TypeScript modules and add separate stable and testing builds."] }, { version: "0.6.4", changes: ["Prevent pinned contest startup scrolling, keep native startup without a pin, and clear finished pins"] }, { version: "0.6.3", changes: ["Stop both contest startup scrolls, isolate the selected leaderboard, and restore pinned contests at Top or My rank"] }, { version: "0.6.2", changes: ["Pin contests on their cards, hide the startup scroll, and use right-click marking with isolated settings scrolling"] }, { version: "0.6.1", changes: ["Read native Manga RPG contest titles and recognize active cards when contest data is unavailable"] }, { version: "0.6.0", changes: ["Add a contest start preference, continuous marking, and compact settings with a version label"] }, { version: "0.5.0", changes: ["Add league and contest player marking with custom colors, compact settings, and limit Top 20 to promotable leagues"] }, { version: "0.4.2", changes: ["Fix module startup, league controls, and raid exports; add the Top 20 league target"] }, { version: "0.4.1", changes: ["Fix Love Raids shadows replacement"] }, { version: "0.4.0", changes: ["Add ActivityParser module"] }, { version: "0.3.1", changes: ["Add harem link inside love raid cards"] }, { version: "0.3.0", changes: ["Add LoveRaidsAddon and LoveRaidsParser modules"] }, { version: "0.2.0", changes: ["Add RemovePassLock module"] }, { version: "0.1.3", changes: ["Better code practices"] }, { version: "0.1.2", changes: ["Polishing and update links"] }, { version: "0.1.1", changes: ["Add FriendAndFoes module"] }, { version: "0.0.1", changes: ["Initial release"] }];

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
    const finish = () => {
      if (!dialog.isConnected) return;
      dialog.remove();
      view.onClose();
    };
    const dismiss = () => {
      dialog.close();
      finish();
    };
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
    dialog.addEventListener("close", finish, { once: true });
    document.body.appendChild(dialog);
    try {
      dialog.showModal();
    } catch (err) {
      finish();
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
  var hhPlusPlusStorage = "HHPlusPlus";
  function readHHPlusPlusSettings() {
    const saved = lsGet("Config", hhPlusPlusStorage);
    if (saved && typeof saved === "object" && !Array.isArray(saved)) return saved;
    return {};
  }
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
    noticeLayout = null;
    waitingForNoticeAnchor = false;
    constructor() {
      const baseKey = "changelog";
      super({ name: baseKey, configSchema: {
        baseKey,
        label: settingHelp("Update notices", "Show the changelog the first time you load the homepage after an update. Use View changelog to open it whenever you like."),
        default: true,
        subSettings: [{
          key: "silent",
          label: settingHelp("Silent changelog", "Show a small arc-reactor icon beside HH++ on the homepage after an update. Click it to read the changelog."),
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
        const parent = anchor?.parentElement;
        if (!anchor || !parent || !this.silent || !this.hasUnreadUpdate()) return;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "jarvis-changelog-notice";
        button.dataset.tooltip = "Jarvis was updated";
        button.setAttribute("aria-label", "Jarvis was updated. View changelog.");
        button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="7.4" stroke-dasharray="3 1.65"/>
                <path d="M12 7.6l4.4 7.6H7.6Z"/>
            </svg>`;
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          this.open("manual", button);
        });
        anchor.after(button);
        this.notice = button;
        const position = () => {
          button.style.left = `${anchor.offsetLeft}px`;
          button.style.top = `${anchor.offsetTop + anchor.offsetHeight / 2}px`;
          button.style.height = `${anchor.offsetHeight * 0.7}px`;
        };
        position();
        this.noticeLayout = new ResizeObserver(position);
        this.noticeLayout.observe(anchor);
        this.noticeLayout.observe(parent);
      });
    }
    removeNotice() {
      this.noticeLayout?.disconnect();
      this.noticeLayout = null;
      this.notice?.remove();
      this.notice = null;
    }
    syncNoticeSettings(config) {
      for (const card of document.querySelectorAll(settingsCard)) {
        const enabled = config[configKey] !== false;
        const checkbox = card.querySelector(`input[name="${configKey}"]`);
        const silent = card.querySelector(`input[name="${silentKey}"]`);
        card.classList.toggle("enabled", enabled);
        if (checkbox) checkbox.checked = enabled;
        if (silent) {
          silent.checked = config[silentKey] === true;
          silent.disabled = !enabled;
        }
      }
    }
    saveNoticeSetting(key, value) {
      const config = window.hhPlusPlusConfig;
      if (!config) return;
      try {
        const saved = { ...readHHPlusPlusSettings(), [key]: value };
        lsSet("Config", saved, hhPlusPlusStorage);
        config.loadConfig();
        if (key === silentKey) this.updateSubSetting("silent", value);
        else if (!value) this.tearDown();
        this.syncNoticeSettings(saved);
      } catch (err) {
        console.warn("Jarvis could not save the update notice preference:", err);
      }
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
      silentOption.title = "Show an update icon beside HH++ for future updates.";
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
          if (dontShowAgain.checked) this.saveNoticeSetting(configKey, false);
          else if (this.hasRun && useSilent.checked !== this.silent) {
            this.saveNoticeSetting(silentKey, useSilent.checked);
          }
          this.opener?.focus({ preventScroll: true });
          this.opener = null;
        }
      });
    }
  };

  // src/modules/navigation/GameLinks.ts
  var logoSelector = "#home_logo, .hh_logo";
  var valorSelector = '#pov_open, [rel="path-of-valor"]';
  var glorySelector = '#pog_open, [rel="path-of-glory"]';
  var GameLinks = class extends HHModule {
    listeners = null;
    constructor() {
      const baseKey = "gameLinks";
      super({ name: baseKey, configSchema: {
        baseKey,
        label: settingHelp("Open game links in new tabs", "Middle-click or Ctrl-click the game logo, Path of Valor, or Path of Glory to open that page in another tab."),
        default: true
      } });
    }
    shouldRun() {
      return true;
    }
    run() {
      if (this.hasRun) return;
      const selector = currentPage === "/home.html" || currentPage === "/" ? `${logoSelector}, ${valorSelector}, ${glorySelector}` : logoSelector;
      const getLink = (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return null;
        const control = target.closest(selector);
        if (!control || control.closest('[disabled], [aria-disabled="true"]')) return null;
        const path = control.matches(logoSelector) ? "/home.html" : control.matches(valorSelector) ? "/path-of-valor.html" : "/path-of-glory.html";
        const anchor = target.closest("a[href]");
        if (anchor?.origin === location.origin && (anchor.pathname === path || path === "/home.html" && anchor.pathname === "/")) {
          return { anchor, href: anchor.href };
        }
        if (anchor && anchor !== control && control.contains(anchor)) return null;
        const nativeUrl = control.getAttribute("data-url");
        const href = nativeUrl || window.HHPlusPlus.Helpers.getHref(path);
        const destination = new URL(href, location.href);
        if (destination.origin !== location.origin || destination.pathname !== path) return null;
        return { anchor: null, href: destination.href };
      };
      this.listeners = new AbortController();
      const options = { capture: true, signal: this.listeners.signal };
      const openInNewTab = (event) => {
        const link = getLink(event);
        if (!link) return;
        event.stopImmediatePropagation();
        if (link.anchor) return;
        event.preventDefault();
        window.open(link.href, "_blank", "noopener");
      };
      window.addEventListener("click", (event) => {
        if (event.button === 0 && (event.ctrlKey || event.metaKey)) openInNewTab(event);
      }, options);
      window.addEventListener("auxclick", (event) => {
        if (event.button === 1) openInNewTab(event);
      }, options);
      window.addEventListener("mousedown", (event) => {
        if (event.button === 1 && getLink(event)?.anchor === null) event.preventDefault();
      }, options);
      this.hasRun = true;
    }
    tearDown() {
      this.listeners?.abort();
      this.hasRun = false;
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
      changelog,
      new GameLinks()
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzSGVscC50cyIsICJzcmMvc2V0dGluZ3MuY3NzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvSEhNb2R1bGUudHMiLCAic3JjL3N0b3JhZ2UudHMiLCAic3JjL21vZHVsZXMvcGxheWVycy9tYXJrTWFuYWdlci50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0ZyaWVuZEFuZEZvZXMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzLnRzIiwgInNyYy9tb2R1bGVzL2NvbnRlc3RzL2NvbnRlc3RTaG9ydGN1dHMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvQ29udGVzdFN0YXJ0LnRzIiwgInNyYy9tb2R1bGVzL3BsYXllcnMvTGVhZ3VlVG9wMjAudHMiLCAic3JjL21vZHVsZXMvcHJvZ3Jlc3Npb24vUmVtb3ZlUGFzc0xvY2sudHMiLCAic3JjL21vZHVsZXMvbG92ZS1yYWlkcy9nYW1lRGF0YS50cyIsICJzcmMvbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc0FkZG9uLnRzIiwgInNyYy9tb2R1bGVzL2xvdmUtcmFpZHMvTG92ZVJhaWRzUGFyc2VyLnRzIiwgInNyYy9tb2R1bGVzL2FjdGl2aXRpZXMvQWN0aXZpdHlQYXJzZXIudHMiLCAiQ0hBTkdFTE9HLm1kIiwgInNyYy9tb2R1bGVzL3VwZGF0ZXMvY2hhbmdlbG9nUG9wdXAudHMiLCAic3JjL21vZHVsZXMvdXBkYXRlcy9DaGFuZ2Vsb2cudHMiLCAic3JjL21vZHVsZXMvbmF2aWdhdGlvbi9HYW1lTGlua3MudHMiLCAic3JjL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgbGV0ICQ6IEpRdWVyeVN0YXRpYztcbmV4cG9ydCBsZXQgY3VycmVudFBhZ2U6IHN0cmluZztcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRHYW1lKGpRdWVyeTogSlF1ZXJ5U3RhdGljKSB7XG4gICAgJCA9IGpRdWVyeTtcbiAgICBjdXJyZW50UGFnZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gc2V0dGluZ0hlbHAobGFiZWw6IHN0cmluZywgZGVzY3JpcHRpb246IHN0cmluZykge1xuICAgIGNvbnN0IGVzY2FwZSA9ICh0ZXh0OiBzdHJpbmcpID0+IHRleHQucmVwbGFjZUFsbCgnJicsICcmYW1wOycpLnJlcGxhY2VBbGwoJ1wiJywgJyZxdW90OycpXG4gICAgICAgIC5yZXBsYWNlQWxsKCc8JywgJyZsdDsnKS5yZXBsYWNlQWxsKCc+JywgJyZndDsnKTtcbiAgICByZXR1cm4gZXNjYXBlKGxhYmVsKSArICcgPHNwYW4gY2xhc3M9XCJpcm9ubWFuLXNldHRpbmctaGVscFwiIHJvbGU9XCJidXR0b25cIiB0YWJpbmRleD1cIjBcIiBhcmlhLWxhYmVsPVwiQWJvdXQgJyArXG4gICAgICAgIGVzY2FwZShsYWJlbCkgKyAnXCIgZGF0YS1zZXR0aW5nLWhlbHA9XCInICsgZXNjYXBlKGRlc2NyaXB0aW9uKSArICdcIj4/PC9zcGFuPic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3VudFNldHRpbmdzSGVscChwYW5lbDogSFRNTEVsZW1lbnQsIHRvb2x0aXBJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgdG9vbHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRvb2x0aXAuaWQgPSB0b29sdGlwSWQ7XG4gICAgdG9vbHRpcC5jbGFzc05hbWUgPSAnaXJvbm1hbi1zZXR0aW5nLXRvb2x0aXAnO1xuICAgIHRvb2x0aXAuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3Rvb2x0aXAnKTtcbiAgICBjb25zdCBwb3BvdmVyID0gdHlwZW9mIHRvb2x0aXAuc2hvd1BvcG92ZXIgPT09ICdmdW5jdGlvbic7XG4gICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuc2V0QXR0cmlidXRlKCdwb3BvdmVyJywgJ21hbnVhbCcpO1xuICAgIGVsc2UgdG9vbHRpcC5oaWRkZW4gPSB0cnVlO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodG9vbHRpcCk7XG5cbiAgICBsZXQgYW5jaG9yOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IGdldEhlbHAgPSAodGFyZ2V0OiBFdmVudFRhcmdldCB8IG51bGwpID0+XG4gICAgICAgIHRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgPyB0YXJnZXQuY2xvc2VzdDxIVE1MRWxlbWVudD4oJ1tkYXRhLXNldHRpbmctaGVscF0nKSA6IG51bGw7XG4gICAgY29uc3QgY2xvc2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICghYW5jaG9yKSByZXR1cm47XG4gICAgICAgIGFuY2hvci5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKTtcbiAgICAgICAgYW5jaG9yID0gbnVsbDtcbiAgICAgICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuaGlkZVBvcG92ZXIoKTtcbiAgICAgICAgZWxzZSB0b29sdGlwLmhpZGRlbiA9IHRydWU7XG4gICAgfTtcbiAgICBjb25zdCBzaG93ID0gKGhlbHA6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgIGlmIChhbmNob3IgPT09IGhlbHApIHJldHVybjtcbiAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgYW5jaG9yID0gaGVscDtcbiAgICAgICAgaGVscC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCB0b29sdGlwSWQpO1xuICAgICAgICB0b29sdGlwLnRleHRDb250ZW50ID0gaGVscC5kYXRhc2V0LnNldHRpbmdIZWxwID8/ICcnO1xuICAgICAgICBpZiAocG9wb3ZlcikgdG9vbHRpcC5zaG93UG9wb3ZlcigpO1xuICAgICAgICBlbHNlIHRvb2x0aXAuaGlkZGVuID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gaGVscC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgeyBvZmZzZXRXaWR0aCwgb2Zmc2V0SGVpZ2h0IH0gPSB0b29sdGlwO1xuICAgICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSBNYXRoLm1heCg4LCBNYXRoLm1pbihib3VuZHMubGVmdCwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIC0gb2Zmc2V0V2lkdGggLSA4KSkgKyAncHgnO1xuICAgICAgICBjb25zdCBiZWxvdyA9IGJvdW5kcy5ib3R0b20gKyA2O1xuICAgICAgICB0b29sdGlwLnN0eWxlLnRvcCA9IChiZWxvdyArIG9mZnNldEhlaWdodCA8PSB3aW5kb3cuaW5uZXJIZWlnaHQgLSA4XG4gICAgICAgICAgICA/IGJlbG93IDogTWF0aC5tYXgoOCwgYm91bmRzLnRvcCAtIG9mZnNldEhlaWdodCAtIDYpKSArICdweCc7XG4gICAgfTtcblxuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJvdmVyJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCAmJiBldmVudC5wb2ludGVyVHlwZSAhPT0gJ3RvdWNoJykgc2hvdyhoZWxwKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyb3V0JywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCA9PT0gYW5jaG9yICYmIGhlbHAgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gaGVscCkgY2xvc2UoKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1c2luJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCkgc2hvdyhoZWxwKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGdldEhlbHAoZXZlbnQudGFyZ2V0KSA9PT0gYW5jaG9yKSBjbG9zZSgpO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoIWhlbHApIHJldHVybjtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgJiYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJyB8fCBldmVudC5rZXkgPT09ICcgJykpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHNob3coaGVscCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYW5jaG9yICYmIGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZ2V0SGVscChldmVudC50YXJnZXQpICE9PSBhbmNob3IpIGNsb3NlKCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgY2xvc2UsIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbn1cbiIsICIuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5wYW5lbC1jb250ZW50cyB7XG4gICAgYWxpZ24tY29udGVudDogc3RhcnQ7XG4gICAgYWxpZ24taXRlbXM6IHN0YXJ0O1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgb3ZlcnNjcm9sbC1iZWhhdmlvcjogY29udGFpbjtcbiAgICBzY3JvbGxiYXItd2lkdGg6IHRoaW47XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbDpoYXMoPiAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdLnNob3duKSB7XG4gICAgb3ZlcmZsb3c6IGNsaXA7XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZy5oYXMtc3Vic2V0dGluZ3Mge1xuICAgIGdyaWQtcm93LWVuZDogYXV0bztcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1wYWNrZWQtc2V0dGluZ3Mge1xuICAgIGdyaWQtYXV0by1mbG93OiByb3cgZGVuc2U7XG4gICAgZ3JpZC1hdXRvLXJvd3M6IDFweDtcbiAgICByb3ctZ2FwOiAwO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuamFydmlzLXBhY2tlZC1zZXR0aW5ncyAuY29uZmlnLXNldHRpbmcge1xuICAgIGdyaWQtcm93LWVuZDogc3BhbiB2YXIoLS1qYXJ2aXMtc2V0dGluZy1yb3dzLCAxKTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC50YWJzIGg0W3JlbD1cIkpBUlZJU1wiXSB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLnRhYnMgaDRbcmVsPVwiSkFSVklTXCJdLnNlbGVjdGVkOjphZnRlciB7XG4gICAgY29udGVudDogdmFyKC0tamFydmlzLXZlcnNpb24pO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBpbnNldC1ibG9jay1zdGFydDogMDtcbiAgICBpbnNldC1pbmxpbmUtZW5kOiAuMTVyZW07XG4gICAgZm9udC1zaXplOiAuNjI1cmVtO1xuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4uaXJvbm1hbi1zZXR0aW5nLWhlbHAge1xuICAgIGRpc3BsYXk6IGlubGluZS1ncmlkO1xuICAgIHBsYWNlLWl0ZW1zOiBjZW50ZXI7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBpbmxpbmUtc2l6ZTogMS4yNWVtO1xuICAgIGJsb2NrLXNpemU6IDEuMjVlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgIGZvbnQtc2l6ZTogLjhlbTtcbiAgICBsaW5lLWhlaWdodDogMTtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogLjA4ZW07XG4gICAgY3Vyc29yOiBoZWxwO1xufVxuLmlyb25tYW4tc2V0dGluZy1oZWxwOmhvdmVyLFxuLmlyb25tYW4tc2V0dGluZy1oZWxwOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbi5pcm9ubWFuLXNldHRpbmctdG9vbHRpcCB7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIGluc2V0OiBhdXRvO1xuICAgIHotaW5kZXg6IDEwMDEwO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgbWF4LXdpZHRoOiBtaW4oMThyZW0sIGNhbGMoMTAwdncgLSAxNnB4KSk7XG4gICAgbWFyZ2luOiAwO1xuICAgIHBhZGRpbmc6IC41ZW0gLjdlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40ZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogMTRweC8xLjQgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuamFydmlzLW1hcmstY29sb3IgaW5wdXQge1xuICAgIHdpZHRoOiAzMHB4O1xuICAgIGhlaWdodDogMjBweDtcbiAgICBmbGV4OiBub25lO1xuICAgIHBhZGRpbmc6IDA7XG59XG5idXR0b24uamFydmlzLWNvbnRlc3QtcGluIHtcbiAgICBhbGw6IHVuc2V0O1xuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICBtYXJnaW4taW5saW5lLXN0YXJ0OiAuMzVlbTtcbiAgICBwYWRkaW5nLWlubGluZTogLjJlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250LXNpemU6IC45ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jb250ZXN0LXBpbjo6YmVmb3JlIHtcbiAgICBjb250ZW50OiAn4piGJztcbn1cbi5qYXJ2aXMtY29udGVzdC1waW5bYXJpYS1wcmVzc2VkPVwidHJ1ZVwiXTo6YmVmb3JlIHtcbiAgICBjb250ZW50OiAn4piFJztcbiAgICBjb2xvcjogI2ZmZDM2Yjtcbn1cbi5qYXJ2aXMtY29udGVzdC1waW46Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgIHdpZHRoOiBmaXQtY29udGVudDtcbiAgICBnYXA6IC4xMmVtO1xuICAgIHBhZGRpbmc6IC4xMmVtO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgNTUlLCB0cmFuc3BhcmVudCk7XG4gICAgYm9yZGVyLXJhZGl1czogLjQ1ZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgbGluZS1oZWlnaHQ6IDEuMTU7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIGJ1dHRvbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBwYWRkaW5nOiAuMThlbSAuMzhlbTtcbiAgICBib3JkZXItcmFkaXVzOiAuMjZlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGxpbmUtaGVpZ2h0OiBpbmhlcml0O1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b25bYXJpYS1wcmVzc2VkPVwidHJ1ZVwiXSB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAyMiUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDE1JSwgdHJhbnNwYXJlbnQpO1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b246Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0IHtcbiAgICBtYXJnaW4taW5saW5lLXN0YXJ0OiAuMjhlbTtcbiAgICBmb250LXNpemU6IC43ZW07XG4gICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbn1cbiNjb250ZXN0cyAuY29udGVzdF9oZWFkZXIgLmphcnZpcy1jb250ZXN0LXRpdGxlIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiAuM2VtO1xuICAgIG1pbi1pbmxpbmUtc2l6ZTogMDtcbn1cbi5qYXJ2aXMtY29udGVzdC10aXRsZS1sYWJlbCB7XG4gICAgZmxleDogMSAxIDAlO1xuICAgIG1pbi1pbmxpbmUtc2l6ZTogMDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG59XG4uamFydmlzLWNvbnRlc3QtdGl0bGUgPiA6aXMoLmphcnZpcy1jb250ZXN0LXBpbiwgLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQpIHtcbiAgICBmbGV4OiBub25lO1xuICAgIG1hcmdpbi1pbmxpbmUtc3RhcnQ6IDA7XG59XG4jY29udGVzdHMgLmNvbnRlc3RfaGVhZGVyIC5qYXJ2aXMtY29udGVzdC10aXRsZS1zdGFja2VkIHtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogYXV0byBtaW5tYXgoMCwgMWZyKTtcbiAgICByb3ctZ2FwOiAuMTJlbTtcbn1cbi5qYXJ2aXMtY29udGVzdC10aXRsZS1zdGFja2VkIC5qYXJ2aXMtY29udGVzdC10aXRsZS1sYWJlbCB7XG4gICAgZ3JpZC1jb2x1bW46IDEgLyAtMTtcbn1cbiNjb250ZXN0cyAuY29udGVzdF90aXRsZV90aW1lcjpoYXMoPiAuamFydmlzLWNvbnRlc3QtdGl0bGUtc3RhY2tlZCkgPiAuY29udGVzdF90aW1lciB7XG4gICAgYWxpZ24tc2VsZjogZmxleC1zdGFydDtcbn1cbi5qYXJ2aXMtY29udGVzdC10aXRsZS1zdGFja2VkIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0IHtcbiAgICBqdXN0aWZ5LXNlbGY6IHN0YXJ0O1xuICAgIGZvbnQtc2l6ZTogLjY0ZW07XG59XG4uamFydmlzLWNvbnRlc3Qtc2V0dGluZ3Mge1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ2FwOiAuM2VtO1xuICAgIG1pbi13aWR0aDogMDtcbiAgICBtYXJnaW46IC40NWVtIDAgMDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGJvcmRlcjogMDtcbiAgICBmb250LXNpemU6IC44NWVtO1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzIC5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgbWF4LXdpZHRoOiAxMDAlO1xuICAgIGZsZXgtd3JhcDogd3JhcDtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5ncyBbaGlkZGVuXSB7XG4gICAgZGlzcGxheTogbm9uZTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5nczpkaXNhYmxlZCAuamFydmlzLWNvbnRlc3QtY2hvaWNlIHtcbiAgICBvcGFjaXR5OiAuNTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5nczpkaXNhYmxlZCBidXR0b24ge1xuICAgIGN1cnNvcjogZGVmYXVsdDtcbn1cbi5qYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBpbnNldC1ibG9jay1zdGFydDogMS4zcmVtO1xuICAgIGluc2V0LWlubGluZS1lbmQ6IDNyZW07XG4gICAgei1pbmRleDogMTA7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGdhcDogLjNlbTtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7XG59XG4uamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzIGJ1dHRvbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgcGxhY2UtY29udGVudDogY2VudGVyO1xuICAgIGdhcDogLjE1ZW07XG4gICAgbWluLWlubGluZS1zaXplOiAyLjg1ZW07XG4gICAgcGFkZGluZzogLjI4ZW0gLjQ1ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciA0MCUsIHRyYW5zcGFyZW50KTtcbiAgICBib3JkZXItcmFkaXVzOiAuNGVtO1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMTAlLCB0cmFuc3BhcmVudCk7XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgZm9udDogaW5oZXJpdDtcbiAgICBmb250LXNpemU6IC45ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cyBidXR0b24gc3BhbiB7XG4gICAgZm9udC1zaXplOiAuNzVlbTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMgYnV0dG9uOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDE4JSwgdHJhbnNwYXJlbnQpO1xufVxuLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cyBidXR0b25bYXJpYS1wcmVzc2VkPVwidHJ1ZVwiXSB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAyNyUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMgYnV0dG9uOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDJweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbi5qYXJ2aXMtbWFyay1tZW51IHtcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgei1pbmRleDogMTAwMDA7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBnYXA6IDJweDtcbiAgICBwYWRkaW5nOiA0cHg7XG4gICAgYm9yZGVyOiAxcHggc29saWQgIzg5OTRhNztcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgYmFja2dyb3VuZDogIzIzMjkzNjtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBib3gtc2hhZG93OiAwIDJweCAxMHB4ICMwMDA4O1xuICAgIGZvbnQ6IDEzcHgvMS4zNSBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7XG59XG4uamFydmlzLW1hcmstbWVudSBidXR0b24ge1xuICAgIGFsbDogdW5zZXQ7XG4gICAgcGFkZGluZzogNHB4IDlweDtcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1tYXJrLW1lbnUgYnV0dG9uOmhvdmVyLFxuLmphcnZpcy1tYXJrLW1lbnUgYnV0dG9uOmZvY3VzLXZpc2libGUge1xuICAgIGJhY2tncm91bmQ6ICM0MTRkNjQ7XG59XG4jY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEuamFydmlzLWNvbnRlc3QtaW5zdGFudCxcbiNjb250ZXN0cyAucmlnaHRfcGFydC5qYXJ2aXMtY29udGVzdC1pbnN0YW50IC5sZWFkX3RhYmxlX3ZpZXcge1xuICAgIHNjcm9sbC1iZWhhdmlvcjogYXV0byAhaW1wb3J0YW50O1xuICAgIG92ZXJmbG93LWFuY2hvcjogbm9uZSAhaW1wb3J0YW50O1xufVxuI2NvbnRlc3RzIC5qYXJ2aXMtY29udGVzdC1sb2FkaW5nIHtcbiAgICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7XG4gICAgdHJhbnNpdGlvbjogbm9uZSAhaW1wb3J0YW50O1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuI2NvbnRlc3RzIC5yaWdodF9wYXJ0IC5yYW5raW5nW2lkX2NvbnRlc3RdLmphcnZpcy1jb250ZXN0LW90aGVyIHtcbiAgICBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFyaz1cImZyaWVuZFwiXSB7XG4gICAgY29sb3I6IHZhcigtLWphcnZpcy1mcmllbmQtY29sb3IpICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFyaz1cImZvZVwiXSB7XG4gICAgY29sb3I6IHZhcigtLWphcnZpcy1mb2UtY29sb3IpICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFya10sXG50ZFtkYXRhLWphcnZpcy1tYXJrXSA+IGEge1xuICAgIHRleHQtc2hhZG93OiAxcHggMCAjMTExODI3LCAtMXB4IDAgIzExMTgyNywgMCAxcHggIzExMTgyNywgMCAtMXB4ICMxMTE4MjcgIWltcG9ydGFudDtcbn1cbnRkW2RhdGEtamFydmlzLW1hcmtdID4gYSB7XG4gICAgY29sb3I6IGluaGVyaXQgIWltcG9ydGFudDtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb24ge1xuICAgIGFwcGVhcmFuY2U6IG5vbmU7XG4gICAgcGFkZGluZzogLjJlbSAuNWVtO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbiAgICBib3JkZXItcmFkaXVzOiAuMzVlbTtcbiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246aG92ZXIsXG4uamFydmlzLXNldHRpbmctYWN0aW9uOmZvY3VzLXZpc2libGUge1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMTYlLCB0cmFuc3BhcmVudCk7XG59XG4uamFydmlzLXNldHRpbmctYWN0aW9uOmRpc2FibGVkIHtcbiAgICBjdXJzb3I6IGRlZmF1bHQ7XG4gICAgb3BhY2l0eTogLjU7XG59XG4uamFydmlzLW1hcmstc2V0dGluZy1hY3Rpb25zLFxuLmphcnZpcy1tYXJrLWFjdGlvbnMge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC13cmFwOiB3cmFwO1xuICAgIGdhcDogLjRlbTtcbn1cbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIHtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIHdpZHRoOiBtaW4oMzRyZW0sIGNhbGMoMTAwdncgLSAycmVtKSk7XG4gICAgbWF4LWhlaWdodDogY2FsYygxMDB2aCAtIDJyZW0pO1xuICAgIHBhZGRpbmc6IDFyZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNjVyZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogMTVweC8xLjM1IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbn1cbi5qYXJ2aXMtbWFyay1tYW5hZ2VyOjpiYWNrZHJvcCB7XG4gICAgYmFja2dyb3VuZDogIzA4MGIxMmFhO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXIgaDIsXG4uamFydmlzLW1hcmstbWFuYWdlciBoMyxcbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIHAge1xuICAgIG1hcmdpbjogMDtcbn1cbi5qYXJ2aXMtbWFyay1saXN0cyB7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KG1pbigxM3JlbSwgMTAwJSksIDFmcikpO1xuICAgIGdhcDogLjlyZW07XG4gICAgbWF4LWhlaWdodDogNTB2aDtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIHNjcm9sbGJhci1ndXR0ZXI6IHN0YWJsZTtcbiAgICBwYWRkaW5nLWlubGluZS1lbmQ6IC43cmVtO1xuICAgIG1hcmdpbi1ibG9jazogLjlyZW07XG59XG4uamFydmlzLW1hcmstbGlzdHMgdWwge1xuICAgIG1hcmdpbjogLjNlbSAwIDA7XG4gICAgcGFkZGluZzogMDtcbiAgICBsaXN0LXN0eWxlOiBub25lO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIGxpIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgIGdhcDogLjQ1ZW07XG4gICAgcGFkZGluZzogLjJlbSAwO1xuICAgIG92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIGxpIGJ1dHRvbiB7XG4gICAgZmxleDogbm9uZTtcbn1cbi5qYXJ2aXMtbWFyay1hY3Rpb25zIHtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG59XG4uamFydmlzLXZpZXctY2hhbmdlbG9nIHtcbiAgICBtYXJnaW4tdG9wOiAuNDVlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGljZSB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHotaW5kZXg6IDU7XG4gICAgdHJhbnNsYXRlOiBjYWxjKC0xMDAlIC0gLjI1ZW0pIC01MCU7XG4gICAgYXNwZWN0LXJhdGlvOiAxO1xuICAgIHBhZGRpbmc6IDA7XG4gICAgYm9yZGVyOiAwO1xuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgICBjb2xvcjogI2E5ZTRmZjtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RpY2Ugc3ZnIHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICB3aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gICAgZmlsdGVyOiBkcm9wLXNoYWRvdygwIDFweCAxcHggIzA3MTYyNSk7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RpY2U6aG92ZXIge1xuICAgIGNvbG9yOiAjZGJmNWZmO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90aWNlOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDJweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGljZTppcyg6aG92ZXIsIDpmb2N1cy12aXNpYmxlKTo6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6IGF0dHIoZGF0YS10b29sdGlwKTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgaW5zZXQtYmxvY2stc3RhcnQ6IGNhbGMoMTAwJSArIC40ZW0pO1xuICAgIGluc2V0LWlubGluZS1lbmQ6IDA7XG4gICAgcGFkZGluZzogLjM1ZW0gLjU1ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuMzVlbTtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jb25maWctc2V0dGluZy1iYWNrZ3JvdW5kLCAjMjQxZTMwKTtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBmb250OiA1MDAgLjc1cmVtLzEuMjUgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG5kaWFsb2cuamFydmlzLWNoYW5nZWxvZy1wb3B1cCB7XG4gICAgLS1qYXJ2aXMtY2hhbmdlbG9nLWhlaWdodDogbWluKDMycmVtLCBjYWxjKDEwMHZoIC0gMS4yNXJlbSkpO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIGluc2V0OiAwO1xuICAgIHdpZHRoOiBtaW4oMzdyZW0sIGNhbGMoMTAwJSAtIDEuMjVyZW0pKTtcbiAgICBoZWlnaHQ6IGZpdC1jb250ZW50O1xuICAgIG1heC1oZWlnaHQ6IHZhcigtLWphcnZpcy1jaGFuZ2Vsb2ctaGVpZ2h0KTtcbiAgICBtYXJnaW46IGF1dG87XG4gICAgcGFkZGluZzogMDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbmZpZy1zZXR0aW5nLWJvcmRlciwgI2E5YTNiYyk7XG4gICAgYm9yZGVyLXJhZGl1czogLjZyZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogMTVweC8xLjQ1IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbiAgICB0ZXh0LWFsaWduOiBzdGFydDtcbn1cbkBzdXBwb3J0cyAoaGVpZ2h0OiAxMDBkdmgpIHtcbiAgICBkaWFsb2cuamFydmlzLWNoYW5nZWxvZy1wb3B1cCB7XG4gICAgICAgIC0tamFydmlzLWNoYW5nZWxvZy1oZWlnaHQ6IG1pbigzMnJlbSwgY2FsYygxMDBkdmggLSAxLjI1cmVtKSk7XG4gICAgfVxufVxuLmphcnZpcy1jaGFuZ2Vsb2ctcG9wdXA6OmJhY2tkcm9wIHtcbiAgICBiYWNrZ3JvdW5kOiAjMDgwYjEyYWE7XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IHtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiBhdXRvIG1pbm1heCgwLCAxZnIpIGF1dG87XG4gICAgZ2FwOiBjbGFtcCguNDVyZW0sIDJ2dywgLjlyZW0pO1xuICAgIG1heC1oZWlnaHQ6IGNhbGModmFyKC0tamFydmlzLWNoYW5nZWxvZy1oZWlnaHQpIC0gMnB4KTtcbiAgICBwYWRkaW5nOiBjbGFtcCguNnJlbSwgM3Z3LCAxcmVtKTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgaDIsXG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGgzIHtcbiAgICBtYXJnaW46IDA7XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGgyIHtcbiAgICBmb250LXNpemU6IDEuM2VtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBoMyB7XG4gICAgY29sb3I6IHZhcigtLWNvbmZpZy1zZXR0aW5nLWJvcmRlciwgI2Q5YzdmYik7XG4gICAgZm9udC1zaXplOiAxZW07XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IHNlY3Rpb24gKyBzZWN0aW9uLFxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBkZXRhaWxzIHtcbiAgICBtYXJnaW4tdG9wOiAuNzVyZW07XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RlcyB7XG4gICAgb3ZlcmZsb3cteTogYXV0bztcbiAgICBvdmVyc2Nyb2xsLWJlaGF2aW9yOiBjb250YWluO1xuICAgIHNjcm9sbGJhci13aWR0aDogdGhpbjtcbiAgICBvdmVyZmxvdy13cmFwOiBhbnl3aGVyZTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGVzIHVsIHtcbiAgICBtYXJnaW46IC4yZW0gMCAwO1xuICAgIHBhZGRpbmctaW5saW5lLXN0YXJ0OiAxLjJlbTtcbiAgICBsaXN0LXN0eWxlOiBkaXNjO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90ZXMgbGkgKyBsaSB7XG4gICAgbWFyZ2luLXRvcDogLjI1ZW07XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RlcyBzdW1tYXJ5IHtcbiAgICBtYXJnaW4tYm90dG9tOiAuNHJlbTtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGZvb3RlciB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGVuZDtcbiAgICBnYXA6IC41ZW07XG59XG4uamFydmlzLWNoYW5nZWxvZy1vcHRpb25zIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtd3JhcDogd3JhcDtcbiAgICBnYXA6IC40ZW0gLjllbTtcbiAgICBtYXJnaW4taW5saW5lLWVuZDogYXV0bztcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW9wdGlvbnMgbGFiZWwge1xuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiAuNGVtO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbiIsICJpbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBtb3VudFNldHRpbmdzSGVscCB9IGZyb20gJy4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCBjc3MgZnJvbSAnLi9zZXR0aW5ncy5jc3MnO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0U3R5bGVzKCkge1xuICAgIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZS5jbGFzc05hbWUgPSAnaGgtamFydmlzLXN0eWxlJztcbiAgICBjb25zdCB2ZXJzaW9uID0gYHYke1VTRVJTQ1JJUFRfVkVSU0lPTn0ke1VTRVJTQ1JJUFRfQ0hBTk5FTCA9PT0gJ0RldicgPyAnIERldicgOiAnJ31gO1xuICAgIHN0eWxlLnRleHRDb250ZW50ID0gYCR7Y3NzfVxuICAgICAgICAuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCB7IC0tamFydmlzLXZlcnNpb246IFwiJHt2ZXJzaW9ufVwiOyB9XG4gICAgYDtcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tTZXR0aW5ncygpIHtcbiAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAucGFuZWwtY29udGVudHMnO1xuICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihzZWxlY3Rvcik7XG4gICAgICAgIGlmICghcGFuZWwpIHJldHVybjtcbiAgICAgICAgcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnaGgtc2Nyb2xsJyk7XG4gICAgICAgIG1vdW50U2V0dGluZ3NIZWxwKHBhbmVsLCAnamFydmlzLXNldHRpbmctdG9vbHRpcCcpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuY3RybEtleSB8fCAhKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHx8ICFwYW5lbC5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaXQgPSBldmVudC5kZWx0YU1vZGUgPT09IDEgPyAxNiA6IGV2ZW50LmRlbHRhTW9kZSA9PT0gMiA/IHBhbmVsLmNsaWVudEhlaWdodCA6IDE7XG4gICAgICAgICAgICBjb25zdCBzY2FsZSA9IHBhbmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCAvIHBhbmVsLm9mZnNldEhlaWdodCB8fCAxO1xuICAgICAgICAgICAgcGFuZWwuc2Nyb2xsVG9wICs9IGV2ZW50LmRlbHRhWSAqIHVuaXQgLyBzY2FsZTtcbiAgICAgICAgfSwgeyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiBmYWxzZSB9KTtcblxuICAgICAgICBjb25zdCBjYXJkcyA9IHBhbmVsLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcuY29uZmlnLXNldHRpbmcnKTtcbiAgICAgICAgY29uc3QgcGFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghcGFuZWwub2Zmc2V0V2lkdGgpIHJldHVybjtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBjYXJkIG9mIGNhcmRzKSB7XG4gICAgICAgICAgICAgICAgY2FyZC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1qYXJ2aXMtc2V0dGluZy1yb3dzJywgU3RyaW5nKGNhcmQub2Zmc2V0SGVpZ2h0ICsgMTApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhbmVsLmNsYXNzTGlzdC5hZGQoJ2phcnZpcy1wYWNrZWQtc2V0dGluZ3MnKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZ3JvdXBPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKHBhY2spO1xuICAgICAgICBpZiAocGFuZWwucGFyZW50RWxlbWVudCkgZ3JvdXBPYnNlcnZlci5vYnNlcnZlKHBhbmVsLnBhcmVudEVsZW1lbnQsIHsgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10gfSk7XG4gICAgICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBjb25zdCBzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIocGFjayk7XG4gICAgICAgICAgICBjYXJkcy5mb3JFYWNoKGNhcmQgPT4gc2l6ZU9ic2VydmVyLm9ic2VydmUoY2FyZCkpO1xuICAgICAgICB9XG4gICAgICAgIHBhY2soKTtcbiAgICB9KTtcbn1cbiIsICJleHBvcnQgdHlwZSBNb2R1bGVTZXR0aW5ncyA9IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+O1xuXG5pbnRlcmZhY2UgQ29uZmlnU2NoZW1hIHtcbiAgICBiYXNlS2V5OiBzdHJpbmc7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBkZWZhdWx0OiBib29sZWFuO1xuICAgIHN1YlNldHRpbmdzPzogeyBrZXk6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgZGVmYXVsdDogYm9vbGVhbiB9W107XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBISE1vZHVsZSB7XG4gICAgcmVhZG9ubHkgZ3JvdXAgPSAnSkFSVklTJztcbiAgICByZWFkb25seSBjb25maWdTY2hlbWE6IENvbmZpZ1NjaGVtYTtcbiAgICBoYXNSdW4gPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKHsgY29uZmlnU2NoZW1hIH06IHsgbmFtZTogc3RyaW5nOyBjb25maWdTY2hlbWE6IENvbmZpZ1NjaGVtYSB9KSB7XG4gICAgICAgIHRoaXMuY29uZmlnU2NoZW1hID0gY29uZmlnU2NoZW1hO1xuICAgIH1cblxuICAgIGFic3RyYWN0IHNob3VsZFJ1bigpOiBib29sZWFuO1xuICAgIGFic3RyYWN0IHJ1bihzZXR0aW5nczogTW9kdWxlU2V0dGluZ3MpOiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbn1cbiIsICJleHBvcnQgY29uc3QgTFNfQ09ORklHX05BTUUgPSAnSEhTdGFyayc7XG5cbmV4cG9ydCBmdW5jdGlvbiBsc0dldChrZXk6IHN0cmluZywgbHNfbmFtZSA9IExTX0NPTkZJR19OQU1FKTogdW5rbm93biB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gKSA/PyAnbnVsbCcpXG59XG5leHBvcnQgZnVuY3Rpb24gbHNTZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLnNldEl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gLCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpXG59XG5leHBvcnQgZnVuY3Rpb24gbHNSbShrZXk6IHN0cmluZywgbHNfbmFtZSA9IExTX0NPTkZJR19OQU1FKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGAke2xzX25hbWV9JHtrZXl9YClcbn1cbiIsICJpbXBvcnQgeyBMU19DT05GSUdfTkFNRSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuXG5leHBvcnQgdHlwZSBNYXJrID0gJ2ZyaWVuZCcgfCAnZm9lJztcblxuZXhwb3J0IGludGVyZmFjZSBTYXZlZE1hcmsge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgbmFtZT86IHN0cmluZztcbiAgICBtYXJrOiBNYXJrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3Blbk1hcmtNYW5hZ2VyKHJlYWQ6ICgpID0+IFNhdmVkTWFya1tdLCByZW1vdmU6IChpZDogc3RyaW5nKSA9PiBib29sZWFuLCBjbGVhcjogKCkgPT4gYm9vbGVhbikge1xuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuamFydmlzLW1hcmstbWFuYWdlcicpKSByZXR1cm47XG5cbiAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaWFsb2cnKTtcbiAgICBkaWFsb2cuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLW1hbmFnZXInO1xuICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsICdqYXJ2aXMtbWFyay1tYW5hZ2VyLXRpdGxlJyk7XG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgIHRpdGxlLmlkID0gJ2phcnZpcy1tYXJrLW1hbmFnZXItdGl0bGUnO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gJ0ZyaWVuZHMgYW5kIGZvZXMnO1xuXG4gICAgY29uc3QgbGlzdHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBsaXN0cy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstbGlzdHMnO1xuICAgIGNvbnN0IGFjdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1hY3Rpb25zJztcbiAgICBjb25zdCBjbGVhckFsbCA9IG1ha2VCdXR0b24oJ0NsZWFyIGFsbCBtYXJrcycsICgpID0+IHtcbiAgICAgICAgaWYgKGNvbmZpcm0oJ1JlbW92ZSBhbGwgZnJpZW5kIGFuZCBmb2UgbWFya3MgZm9yIHRoaXMgZ2FtZT8nKSAmJiBjbGVhcigpKSB7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIGNsb3NlLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBjbG9zZSA9IG1ha2VCdXR0b24oJ0Nsb3NlJywgKCkgPT4gZGlhbG9nLmNsb3NlKCkpO1xuICAgIGFjdGlvbnMuYXBwZW5kKGNsZWFyQWxsLCBjbG9zZSk7XG5cbiAgICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSByZWFkKCkuc29ydCgoYSwgYikgPT4gTnVtYmVyKCFhLm5hbWUpIC0gTnVtYmVyKCFiLm5hbWUpIHx8XG4gICAgICAgICAgICAoYS5uYW1lIHx8IGEuaWQpLmxvY2FsZUNvbXBhcmUoYi5uYW1lIHx8IGIuaWQsIHVuZGVmaW5lZCwgeyBudW1lcmljOiB0cnVlIH0pKTtcbiAgICAgICAgY29uc3Qgc2VjdGlvbnMgPSAoWydmcmllbmQnLCAnZm9lJ10gYXMgY29uc3QpLm1hcChtYXJrID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgICAgICAgICBjb25zdCBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBlbnRyaWVzLmZpbHRlcihlbnRyeSA9PiBlbnRyeS5tYXJrID09PSBtYXJrKTtcbiAgICAgICAgICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSAobWFyayA9PT0gJ2ZyaWVuZCcgPyAnRnJpZW5kcycgOiAnRm9lcycpICsgYCAoJHttYXRjaGVzLmxlbmd0aH0pYDtcbiAgICAgICAgICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoaGVhZGluZyk7XG5cbiAgICAgICAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVtcHR5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICAgICAgICAgIGVtcHR5LnRleHRDb250ZW50ID0gJ05vIHNhdmVkIHBsYXllcnMuJztcbiAgICAgICAgICAgICAgICBzZWN0aW9uLmFwcGVuZENoaWxkKGVtcHR5KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VjdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgaWQsIG5hbWUgfSBvZiBtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICAgICAgcGxheWVyLnRleHRDb250ZW50ID0gbmFtZSA/IGAke25hbWV9IMK3ICR7aWR9YCA6IGBQbGF5ZXIgIyR7aWR9YDtcbiAgICAgICAgICAgICAgICBpZiAoIW5hbWUpIHBsYXllci50aXRsZSA9ICdOYW1lIG5vdCByZWNvcmRlZCB5ZXQnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IG1ha2VCdXR0b24oJ1JlbW92ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBBcnJheS5mcm9tKGxpc3RzLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpKS5pbmRleE9mKGJ1dHRvbik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmUoaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbWFpbmluZyA9IGxpc3RzLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgKHJlbWFpbmluZ1tNYXRoLm1pbihpbmRleCwgcmVtYWluaW5nLmxlbmd0aCAtIDEpXSB8fCBjbG9zZSkuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBgUmVtb3ZlICR7bmFtZSB8fCBgcGxheWVyICR7aWR9YH0gZnJvbSAke21hcmsgPT09ICdmcmllbmQnID8gJ2ZyaWVuZHMnIDogJ2ZvZXMnfWApO1xuICAgICAgICAgICAgICAgIHJvdy5hcHBlbmQocGxheWVyLCBidXR0b24pO1xuICAgICAgICAgICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQocm93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQobGlzdCk7XG4gICAgICAgICAgICByZXR1cm4gc2VjdGlvbjtcbiAgICAgICAgfSk7XG4gICAgICAgIGxpc3RzLnJlcGxhY2VDaGlsZHJlbiguLi5zZWN0aW9ucyk7XG4gICAgICAgIGNsZWFyQWxsLmRpc2FibGVkID0gZW50cmllcy5sZW5ndGggPT09IDA7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk7XG4gICAgZGlhbG9nLmFwcGVuZCh0aXRsZSwgbGlzdHMsIGFjdGlvbnMpO1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCFldmVudC5rZXkgfHwgWydQbGF5ZXJNYXJrcycsICdQbGF5ZXJNYXJrTmFtZXMnLCAnRnJpZW5kTGlzdCcsICdGb2VMaXN0J11cbiAgICAgICAgICAgIC5zb21lKGtleSA9PiBldmVudC5rZXkgPT09IExTX0NPTkZJR19OQU1FICsga2V5KSkgcmVuZGVyKCk7XG4gICAgfSwgeyBzaWduYWw6IGxpc3RlbmVycy5zaWduYWwgfSk7XG4gICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICBsaXN0ZW5lcnMuYWJvcnQoKTtcbiAgICAgICAgZGlhbG9nLnJlbW92ZSgpO1xuICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgIGNsb3NlLmZvY3VzKCk7XG59XG5cbmZ1bmN0aW9uIG1ha2VCdXR0b24obGFiZWw6IHN0cmluZywgb25DbGljazogKCkgPT4gdm9pZCkge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IGxhYmVsO1xuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spO1xuICAgIHJldHVybiBidXR0b247XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB0eXBlIHsgQ29udGVzdERhdGEgfSBmcm9tICcuLi8uLi9nYW1lLXR5cGVzJztcbmltcG9ydCB7IExTX0NPTkZJR19OQU1FLCBsc0dldCwgbHNTZXQgfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcbmltcG9ydCB7IG9wZW5NYXJrTWFuYWdlciwgdHlwZSBNYXJrLCB0eXBlIFNhdmVkTWFyayB9IGZyb20gJy4vbWFya01hbmFnZXInO1xuXG5jb25zdCBERUZBVUxUX0NPTE9SUzogUmVjb3JkPE1hcmssIHN0cmluZz4gPSB7IGZyaWVuZDogJyM0OGE5ZmYnLCBmb2U6ICcjZmY2MTczJyB9O1xudHlwZSBTYXZlZE5hbWUgPSBzdHJpbmcgfCB7IG5hbWU6IHN0cmluZyB9O1xuXG5mdW5jdGlvbiByZWFkUm93TmFtZShlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnN0IHRleHQgPSBlbGVtZW50LnRleHRDb250ZW50Py50cmltKCkgPz8gJyc7XG4gICAgaWYgKCF0ZXh0LmVuZHNXaXRoKCcrJykpIHJldHVybiB0ZXh0O1xuICAgIGNvbnN0IHdpdGhvdXRTdGFuZGFsb25lUGx1cyA9IHRleHQucmVwbGFjZSgvXFxzK1xcKyQvLCAnJyk7XG4gICAgaWYgKCFlbGVtZW50LmNoaWxkRWxlbWVudENvdW50KSByZXR1cm4gd2l0aG91dFN0YW5kYWxvbmVQbHVzO1xuXG4gICAgY29uc3QgbGFiZWwgPSBlbGVtZW50LmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MRWxlbWVudDtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGxhYmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJyonKSkge1xuICAgICAgICBpZiAoY2hpbGQudGV4dENvbnRlbnQ/LnRyaW0oKSA9PT0gJysnKSBjaGlsZC5yZW1vdmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGxhYmVsLnRleHRDb250ZW50Py50cmltKCkucmVwbGFjZSgvXFxzK1xcKyQvLCAnJykgfHwgd2l0aG91dFN0YW5kYWxvbmVQbHVzO1xufVxuXG5mdW5jdGlvbiBkaXNwbGF5U2F2ZWROYW1lKHNhdmVkPzogU2F2ZWROYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBzYXZlZCAhPT0gJ3N0cmluZycpIHJldHVybiBzYXZlZD8ubmFtZTtcbiAgICAvLyBPbGQgZW50cmllcyBzdG9yZWQgdGhlIGZ1bGwgcm93IHRleHQsIGluY2x1ZGluZyBhIHRyYWlsaW5nIGFkZCBjb250cm9sLlxuICAgIHJldHVybiBzYXZlZC50cmltKCkucmVwbGFjZSgvKFteK10pXFwrJC8sICckMScpLnRyaW1FbmQoKTtcbn1cblxuZXhwb3J0IGNsYXNzIEZyaWVuZEFuZEZvZXMgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBuYW1lcyA9IG5ldyBNYXA8SFRNTEVsZW1lbnQsIHN0cmluZz4oKTtcbiAgICBwcml2YXRlIG1hcmtNZW51OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcm9vdDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJvb3RTZWxlY3RvciA9ICcnO1xuICAgIHByaXZhdGUgaW5MZWFndWUgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2ZyaWVuZEFuZEZvZXMnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiRnJpZW5kcyBhbmQgZm9lc1wiLCBcIlJpZ2h0LWNsaWNrIGVhY2ggcGxheWVyJ3MgbmFtZSB0byBhZGQgb3IgcmVtb3ZlIGEgbWFyay4gTWFuYWdlIHNhdmVkIG1hcmtzIGJlbG93LlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ2xlYWd1ZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiSW4gbGVhZ3Vlc1wiLCBcIlNob3cgbWFya3MgYW5kIGFsbG93IG1hcmtpbmcgaW4gbGVhZ3VlIHRhYmxlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2NvbnRlc3RzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJJbiBjb250ZXN0c1wiLCBcIlNob3cgbWFya3MgYW5kIGFsbG93IG1hcmtpbmcgb24gY29udGVzdCBsZWFkZXJib2FyZHMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoeyBuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWEgfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gWycvbGVhZ3Vlcy5odG1sJywgJy9hY3Rpdml0aWVzLmh0bWwnXS5pbmNsdWRlcyhjdXJyZW50UGFnZSk7XG4gICAgfVxuXG4gICAgcmVhZFNldHRpbmcoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBsc0dldChrZXkpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVhZE1hcmtzKCk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICAgICAgY29uc3Qgc3RvcmVkID0gdGhpcy5yZWFkU2V0dGluZygnUGxheWVyTWFya3MnKTtcbiAgICAgICAgaWYgKHN0b3JlZCAmJiB0eXBlb2Ygc3RvcmVkID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShzdG9yZWQpKSByZXR1cm4gc3RvcmVkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gICAgICAgIGNvbnN0IG1hcmtzOiBSZWNvcmQ8c3RyaW5nLCBNYXJrPiA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIG1hcmtdIG9mIFtbJ0ZyaWVuZExpc3QnLCAnZnJpZW5kJ10sIFsnRm9lTGlzdCcsICdmb2UnXV0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSB0aGlzLnJlYWRTZXR0aW5nKGtleSk7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdCkpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGxpc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoL15bMS05XVxcZCokLy50ZXN0KFN0cmluZyhpZCkpKSBtYXJrc1tTdHJpbmcoaWQpXSA9IG1hcms7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcmtzO1xuICAgIH1cblxuICAgIHJlYWRDb2xvcnMoKTogUmVjb3JkPE1hcmssIHN0cmluZz4ge1xuICAgICAgICBjb25zdCBzYXZlZCA9IHRoaXMucmVhZFNldHRpbmcoJ1BsYXllck1hcmtDb2xvcnMnKSBhcyBQYXJ0aWFsPFJlY29yZDxNYXJrLCB1bmtub3duPj4gfCBudWxsO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZnJpZW5kOiB0eXBlb2Ygc2F2ZWQ/LmZyaWVuZCA9PT0gJ3N0cmluZycgJiYgL14jW1xcZGEtZl17Nn0kL2kudGVzdChzYXZlZC5mcmllbmQpID8gc2F2ZWQuZnJpZW5kIDogREVGQVVMVF9DT0xPUlMuZnJpZW5kLFxuICAgICAgICAgICAgZm9lOiB0eXBlb2Ygc2F2ZWQ/LmZvZSA9PT0gJ3N0cmluZycgJiYgL14jW1xcZGEtZl17Nn0kL2kudGVzdChzYXZlZC5mb2UpID8gc2F2ZWQuZm9lIDogREVGQVVMVF9DT0xPUlMuZm9lXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmVhZFNhdmVkTmFtZXMoKTogUmVjb3JkPHN0cmluZywgU2F2ZWROYW1lPiB7XG4gICAgICAgIGNvbnN0IHNhdmVkID0gdGhpcy5yZWFkU2V0dGluZygnUGxheWVyTWFya05hbWVzJyk7XG4gICAgICAgIGlmICghc2F2ZWQgfHwgdHlwZW9mIHNhdmVkICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHNhdmVkKSkgcmV0dXJuIHt9O1xuICAgICAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKHNhdmVkKS5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgW3N0cmluZywgU2F2ZWROYW1lXSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbLCB2YWx1ZV0gPSBlbnRyeTtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IEJvb2xlYW4odmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUubmFtZSA9PT0gJ3N0cmluZycpO1xuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgc2F2ZU5hbWVzKG5hbWVzOiBSZWNvcmQ8c3RyaW5nLCBTYXZlZE5hbWU+KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsc1NldCgnUGxheWVyTWFya05hbWVzJywgbmFtZXMpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCByZW1lbWJlciBtYXJrZWQgcGxheWVyIG5hbWVzOicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVNYXJrKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgbWFya3MgPSB0aGlzLnJlYWRNYXJrcygpO1xuICAgICAgICBkZWxldGUgbWFya3NbaWRdO1xuICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtzJywgbWFya3MpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gdGhpcy5yZWFkU2F2ZWROYW1lcygpO1xuICAgICAgICBpZiAoaWQgaW4gbmFtZXMpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBuYW1lc1tpZF07XG4gICAgICAgICAgICB0aGlzLnNhdmVOYW1lcyhuYW1lcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmVhZFNhdmVkTWFya3MoKSB7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gdGhpcy5yZWFkU2F2ZWROYW1lcygpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmVudHJpZXModGhpcy5yZWFkTWFya3MoKSkuZmxhdE1hcDxTYXZlZE1hcms+KChbaWQsIG1hcmtdKSA9PlxuICAgICAgICAgICAgL15bMS05XVxcZCokLy50ZXN0KGlkKSAmJiAobWFyayA9PT0gJ2ZyaWVuZCcgfHwgbWFyayA9PT0gJ2ZvZScpXG4gICAgICAgICAgICAgICAgPyBbeyBpZCwgbmFtZTogZGlzcGxheVNhdmVkTmFtZShuYW1lc1tpZF0pLCBtYXJrIH1dXG4gICAgICAgICAgICAgICAgOiBbXSk7XG4gICAgfVxuXG4gICAgc2F2ZVNldHRpbmcoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsc1NldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIGFsZXJ0KCdKYXJ2aXMgY291bGQgbm90IHNhdmUgeW91ciBGcmllbmRzIGFuZCBGb2VzIHNldHRpbmdzLicpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5zdGFsbFNldHRpbmdzKCkge1xuICAgICAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gJy5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmNvbmZpZy1zZXR0aW5nW3JlbD1cIkpBUlZJU19mcmllbmRBbmRGb2VzXCJdIC5zdWItc2V0dGluZ3MnO1xuICAgICAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZXR0aW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5ncyB8fCBzZXR0aW5ncy5xdWVyeVNlbGVjdG9yKCcuamFydmlzLW1hcmstY29sb3InKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBpbnB1dHMgPSBuZXcgTWFwPE1hcmssIEhUTUxJbnB1dEVsZW1lbnQ+KCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCB0ZXh0XSBvZiBbWydmcmllbmQnLCAnRnJpZW5kIG5hbWUgY29sb3InXSwgWydmb2UnLCAnRm9lIG5hbWUgY29sb3InXV0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLWNvbG9yJztcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICB0aXRsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICAgICAgICAgIGlucHV0LnR5cGUgPSAnY29sb3InO1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdGhpcy5yZWFkQ29sb3JzKClbbWFya107XG4gICAgICAgICAgICAgICAgaW5wdXRzLnNldChtYXJrLCBpbnB1dCk7XG4gICAgICAgICAgICAgICAgaW5wdXQuZGlzYWJsZWQgPSAhc2V0dGluZ3MuY2xvc2VzdCgnLmNvbmZpZy1zZXR0aW5nJyk/LmNsYXNzTGlzdC5jb250YWlucygnZW5hYmxlZCcpO1xuICAgICAgICAgICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sb3JzID0gdGhpcy5yZWFkQ29sb3JzKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya0NvbG9ycycsIHsgLi4uY29sb3JzLCBbbWFya106IGlucHV0LnZhbHVlIH0pKSBpbnB1dC52YWx1ZSA9IGNvbG9yc1ttYXJrXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBsYWJlbC5hcHBlbmQodGl0bGUsIGlucHV0KTtcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5hcHBlbmRDaGlsZChsYWJlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXNldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgcmVzZXQudHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgcmVzZXQuY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgICAgICAgICByZXNldC50ZXh0Q29udGVudCA9ICdSZXNldCBjb2xvcnMnO1xuICAgICAgICAgICAgcmVzZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrQ29sb3JzJywge30pKSByZXR1cm47XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBbbWFyaywgaW5wdXRdIG9mIGlucHV0cykgaW5wdXQudmFsdWUgPSBERUZBVUxUX0NPTE9SU1ttYXJrXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgbWFuYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBtYW5hZ2UudHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgbWFuYWdlLmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgICAgICAgICAgbWFuYWdlLnRleHRDb250ZW50ID0gJ01hbmFnZSBtYXJrcyc7XG4gICAgICAgICAgICBtYW5hZ2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBvcGVuTWFya01hbmFnZXIoXG4gICAgICAgICAgICAgICAgKCkgPT4gdGhpcy5yZWFkU2F2ZWRNYXJrcygpLFxuICAgICAgICAgICAgICAgIGlkID0+IHRoaXMucmVtb3ZlTWFyayhpZCksXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtzJywge30pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZU5hbWVzKHt9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1zZXR0aW5nLWFjdGlvbnMnO1xuICAgICAgICAgICAgYWN0aW9ucy5hcHBlbmQocmVzZXQsIG1hbmFnZSk7XG4gICAgICAgICAgICBzZXR0aW5ncy5hcHBlbmRDaGlsZChhY3Rpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2xvc2VNYXJrTWVudSgpIHtcbiAgICAgICAgdGhpcy5tYXJrTWVudT8ucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMubWFya01lbnUgPSBudWxsO1xuICAgIH1cblxuICAgIG9wZW5NYXJrTWVudShldmVudDogTW91c2VFdmVudCwgbmFtZTogSFRNTEVsZW1lbnQsIGlkOiBzdHJpbmcpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuXG4gICAgICAgIGNvbnN0IG1lbnUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbWVudS5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstbWVudSc7XG4gICAgICAgIG1lbnUuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2dyb3VwJyk7XG4gICAgICAgIG1lbnUuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ01hcmsgcGxheWVyJyk7XG4gICAgICAgIGNvbnN0IGFkZEFjdGlvbiA9ICh0ZXh0OiBzdHJpbmcsIGFjdDogKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZS5pc0Nvbm5lY3RlZCAmJiB0aGlzLm5hbWVzLmdldChuYW1lKSA9PT0gaWQpIGFjdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtZW51LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAoY29uc3QgW21hcmssIHRleHRdIG9mIFtbJ2ZyaWVuZCcsICdNYXJrIGFzIGZyaWVuZCddLCBbJ2ZvZScsICdNYXJrIGFzIGZvZSddXSBhcyBjb25zdCkge1xuICAgICAgICAgICAgYWRkQWN0aW9uKHRleHQsICgpID0+IHRoaXMuYXBwbHlNYXJrKGlkLCBtYXJrKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrKSBhZGRBY3Rpb24oJ1JlbW92ZSB0aGlzIHBsYXllcuKAmXMgbWFyaycsICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlbW92ZU1hcmsoaWQpKSB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGljayA9PiBjbGljay5zdG9wUHJvcGFnYXRpb24oKSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWVudSk7XG4gICAgICAgIHRoaXMubWFya01lbnUgPSBtZW51O1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IG5hbWUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHggPSBldmVudC5jbGllbnRYIHx8IGJvdW5kcy5sZWZ0O1xuICAgICAgICBjb25zdCB5ID0gZXZlbnQuY2xpZW50WSB8fCBib3VuZHMuYm90dG9tO1xuICAgICAgICBtZW51LnN0eWxlLmxlZnQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih4LCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggLSBtZW51Lm9mZnNldFdpZHRoKSkgKyAncHgnO1xuICAgICAgICBtZW51LnN0eWxlLnRvcCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHksIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgLSBtZW51Lm9mZnNldEhlaWdodCkpICsgJ3B4JztcbiAgICAgICAgbWVudS5xdWVyeVNlbGVjdG9yKCdidXR0b24nKT8uZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIGdldENvbnRlc3ROYW1lcyhyb290OiBIVE1MRWxlbWVudCwgY29udGVzdHM6IENvbnRlc3REYXRhW10pIHtcbiAgICAgICAgY29uc3QgbmFtZXMgPSBuZXcgTWFwPEhUTUxFbGVtZW50LCBzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IGJ5Q29udGVzdCA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj4+KCk7XG5cbiAgICAgICAgZm9yIChjb25zdCByb3cgb2Ygcm9vdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxUYWJsZVJvd0VsZW1lbnQ+KCcubGVhZFRhYmxlIHRyJykpIHtcbiAgICAgICAgICAgIGNvbnN0IGNlbGwgPSByb3cuY2VsbHM/LlsxXTtcbiAgICAgICAgICAgIGlmICghY2VsbCB8fCBjZWxsLmxvY2FsTmFtZSAhPT0gJ3RkJykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gY2VsbC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLm5pY2tuYW1lJykgfHwgY2VsbDtcbiAgICAgICAgICAgIGxldCBpZCA9IHJvdy5nZXRBdHRyaWJ1dGUoJ3NvcnRpbmdfaWQnKSB8fCBuYW1lLmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJykgfHxcbiAgICAgICAgICAgICAgICBuYW1lLnF1ZXJ5U2VsZWN0b3IoJ1tpZC1tZW1iZXJdJyk/LmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJyk7XG4gICAgICAgICAgICBjb25zdCBjb250ZXN0SWQgPSByb3cuY2xvc2VzdCgnW2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKGNvbnRlc3RJZCkge1xuICAgICAgICAgICAgICAgIGxldCBieU5hbWUgPSBieUNvbnRlc3QuZ2V0KGNvbnRlc3RJZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFieU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydGljaXBhbnRzID0gY29udGVzdHMuZmluZChjb250ZXN0ID0+IFN0cmluZyhjb250ZXN0LmlkX2NvbnRlc3QpID09PSBjb250ZXN0SWQpPy5wYXJ0aWNpcGFudHM7XG4gICAgICAgICAgICAgICAgICAgIGJ5TmFtZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IG5pY2tuYW1lLCBpZF9tZW1iZXIgfSBvZiBPYmplY3QudmFsdWVzKHBhcnRpY2lwYW50cyB8fCB7fSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5pY2tuYW1lS2V5ID0gU3RyaW5nKG5pY2tuYW1lID8/ICcnKS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5pY2tuYW1lS2V5IHx8ICEvXlsxLTldXFxkKiQvLnRlc3QoU3RyaW5nKGlkX21lbWJlcikpKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBieU5hbWUuZ2V0KG5pY2tuYW1lS2V5KSB8fCBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZXMuYWRkKFN0cmluZyhpZF9tZW1iZXIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5TmFtZS5zZXQobmlja25hbWVLZXksIG1hdGNoZXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJ5Q29udGVzdC5zZXQoY29udGVzdElkLCBieU5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYnlOYW1lLmdldChyZWFkUm93TmFtZShuYW1lKSk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMgJiYgIW1hdGNoZXMuaGFzKGlkID8/ICcnKSkgaWQgPSBtYXRjaGVzLnNpemUgPT09IDEgPyBtYXRjaGVzLnZhbHVlcygpLm5leHQoKS52YWx1ZSA6IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQgJiYgL15bMS05XVxcZCokLy50ZXN0KGlkKSkgbmFtZXMuc2V0KG5hbWUsIGlkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmFtZXM7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KHRoaXMucm9vdFNlbGVjdG9yKTtcbiAgICAgICAgdGhpcy5yb290ID0gcm9vdDtcbiAgICAgICAgY29uc3QgY29udGVzdHMgPSB0aGlzLmluTGVhZ3VlID8gW10gOiBbXG4gICAgICAgICAgICAuLi5PYmplY3QudmFsdWVzKHdpbmRvdy5jb250ZXN0cz8uYWN0aXZlID8/IHt9KSxcbiAgICAgICAgICAgIC4uLk9iamVjdC52YWx1ZXMod2luZG93LmNvbnRlc3RzPy5maW5pc2hlZCA/PyB7fSlcbiAgICAgICAgXS5maWx0ZXIoY29udGVzdCA9PiBjb250ZXN0Py5pZF9jb250ZXN0ICE9IG51bGwpO1xuICAgICAgICBjb25zdCBuYW1lcyA9ICFyb290ID8gbmV3IE1hcDxIVE1MRWxlbWVudCwgc3RyaW5nPigpIDogdGhpcy5pbkxlYWd1ZVxuICAgICAgICAgICAgPyBuZXcgTWFwKEFycmF5LmZyb20ocm9vdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLm5pY2tuYW1lW2lkLW1lbWJlcl0nKSwgbmFtZSA9PiBbbmFtZSwgbmFtZS5nZXRBdHRyaWJ1dGUoJ2lkLW1lbWJlcicpXSBhcyBjb25zdClcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIHJlYWRvbmx5IFtIVE1MRWxlbWVudCwgc3RyaW5nXSA9PiAhIWVudHJ5WzFdICYmIC9eWzEtOV1cXGQqJC8udGVzdChlbnRyeVsxXSkpKVxuICAgICAgICAgICAgOiB0aGlzLmdldENvbnRlc3ROYW1lcyhyb290LCBjb250ZXN0cyk7XG5cbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMubmFtZXMua2V5cygpKSB7XG4gICAgICAgICAgICBpZiAobmFtZXMuaGFzKG5hbWUpKSBjb250aW51ZTtcbiAgICAgICAgICAgIGRlbGV0ZSBuYW1lLmRhdGFzZXQuamFydmlzUGxheWVyO1xuICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5uYW1lcyA9IG5hbWVzO1xuICAgICAgICBpZiAoIXJvb3QpIHJldHVybjtcbiAgICAgICAgY29uc3QgbWFya3MgPSB0aGlzLnJlYWRNYXJrcygpO1xuICAgICAgICBjb25zdCBzYXZlZE5hbWVzID0gdGhpcy5yZWFkU2F2ZWROYW1lcygpO1xuICAgICAgICBjb25zdCByb3N0ZXJOYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBsZXQgbmFtZXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHJlbWVtYmVyTmFtZSA9IChpZDogc3RyaW5nLCB0ZXh0Pzogc3RyaW5nIHwgbnVsbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGlzcGxheU5hbWUgPSB0eXBlb2YgdGV4dCA9PT0gJ3N0cmluZycgPyB0ZXh0LnRyaW0oKSA6ICcnO1xuICAgICAgICAgICAgaWYgKCFkaXNwbGF5TmFtZSB8fCAobWFya3NbaWRdICE9PSAnZnJpZW5kJyAmJiBtYXJrc1tpZF0gIT09ICdmb2UnKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgcHJldmlvdXMgPSBzYXZlZE5hbWVzW2lkXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJldmlvdXMgPT09ICdzdHJpbmcnIHx8IHByZXZpb3VzPy5uYW1lICE9PSBkaXNwbGF5TmFtZSkge1xuICAgICAgICAgICAgICAgIHNhdmVkTmFtZXNbaWRdID0geyBuYW1lOiBkaXNwbGF5TmFtZSB9O1xuICAgICAgICAgICAgICAgIG5hbWVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuaW5MZWFndWUpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBwbGF5ZXIsIG5pY2tuYW1lIH0gb2Ygd2luZG93Lm9wcG9uZW50c19saXN0ID8/IFtdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBTdHJpbmcocGxheWVyPy5pZF9maWdodGVyKTtcbiAgICAgICAgICAgICAgICBpZiAocmVtZW1iZXJOYW1lKGlkLCBuaWNrbmFtZSkpIHJvc3Rlck5hbWVzLmFkZChpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBQcmVmZXIgdGhlIGFjdGl2ZSByb3N0ZXIgaWYgYSBwbGF5ZXIgYXBwZWFycyBpbiBib3RoIG9sZCBhbmQgY3VycmVudCBjb250ZXN0cy5cbiAgICAgICAgICAgIGZvciAoY29uc3QgY29udGVzdCBvZiBjb250ZXN0cykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgeyBpZF9tZW1iZXIsIG5pY2tuYW1lIH0gb2YgT2JqZWN0LnZhbHVlcyhjb250ZXN0LnBhcnRpY2lwYW50cyA/PyB7fSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaWQgPSBTdHJpbmcoaWRfbWVtYmVyKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyb3N0ZXJOYW1lcy5oYXMoaWQpICYmIHJlbWVtYmVyTmFtZShpZCwgbmlja25hbWUpKSByb3N0ZXJOYW1lcy5hZGQoaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnJlYWRDb2xvcnMoKTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFyaywgY29sb3JdIG9mIE9iamVjdC5lbnRyaWVzKGNvbG9ycykpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5ID0gJy0tamFydmlzLScgKyBtYXJrICsgJy1jb2xvcic7XG4gICAgICAgICAgICBpZiAocm9vdC5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5KSAhPT0gY29sb3IpIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkocHJvcGVydHksIGNvbG9yKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCBpZF0gb2YgbmFtZXMpIHtcbiAgICAgICAgICAgIGlmIChuYW1lLmRhdGFzZXQuamFydmlzUGxheWVyICE9PSBpZCkgbmFtZS5kYXRhc2V0LmphcnZpc1BsYXllciA9IGlkO1xuICAgICAgICAgICAgY29uc3QgbWFyayA9IG1hcmtzW2lkXTtcbiAgICAgICAgICAgIGlmIChtYXJrID09PSAnZnJpZW5kJyB8fCBtYXJrID09PSAnZm9lJykge1xuICAgICAgICAgICAgICAgIGlmIChuYW1lLmRhdGFzZXQuamFydmlzTWFyayAhPT0gbWFyaykgbmFtZS5kYXRhc2V0LmphcnZpc01hcmsgPSBtYXJrO1xuICAgICAgICAgICAgICAgIGlmICghcm9zdGVyTmFtZXMuaGFzKGlkKSkgcmVtZW1iZXJOYW1lKGlkLCByZWFkUm93TmFtZShuYW1lKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lc0NoYW5nZWQpIHRoaXMuc2F2ZU5hbWVzKHNhdmVkTmFtZXMpO1xuICAgIH1cblxuICAgIGFwcGx5TWFyayhpZDogc3RyaW5nLCBtYXJrOiBNYXJrKSB7XG4gICAgICAgIGNvbnN0IG1hcmtzID0gdGhpcy5yZWFkTWFya3MoKTtcbiAgICAgICAgbWFya3NbaWRdID0gbWFyaztcblxuICAgICAgICBpZiAodGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya3MnLCBtYXJrcykpIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIGhhbmRsZU1hcmtNZW51KGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlICYmIHRoaXMubWFya01lbnU/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcbiAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG4gICAgICAgIGlmIChldmVudC50eXBlICE9PSAnY29udGV4dG1lbnUnICYmICFldmVudC5hbHRLZXkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBuYW1lID0gZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCA/IGV2ZW50LnRhcmdldC5jbG9zZXN0PEhUTUxFbGVtZW50PignW2RhdGEtamFydmlzLXBsYXllcl0nKSA6IG51bGw7XG4gICAgICAgIGlmICghbmFtZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBpZCA9IHRoaXMubmFtZXMuZ2V0KG5hbWUpO1xuICAgICAgICBpZiAoIWlkKSByZXR1cm47XG4gICAgICAgIHRoaXMub3Blbk1hcmtNZW51KGV2ZW50LCBuYW1lLCBpZCk7XG4gICAgfVxuXG4gICAgcnVuKHsgbGVhZ3VlLCBjb250ZXN0cyB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgdGhpcy5pbkxlYWd1ZSA9IGN1cnJlbnRQYWdlID09PSAnL2xlYWd1ZXMuaHRtbCc7XG4gICAgICAgIGlmICh0aGlzLmluTGVhZ3VlID8gIWxlYWd1ZSA6ICFjb250ZXN0cykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucm9vdFNlbGVjdG9yID0gdGhpcy5pbkxlYWd1ZSA/ICcubGVhZ3VlX3RhYmxlJyA6ICcjY29udGVzdHMgLnJpZ2h0X3BhcnQnO1xuICAgICAgICBjb25zdCBoYW5kbGVNYXJrTWVudSA9IChldmVudDogTW91c2VFdmVudCkgPT4gdGhpcy5oYW5kbGVNYXJrTWVudShldmVudCk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlTWFya01lbnUsIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGhhbmRsZU1hcmtNZW51LCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5rZXkgIT09ICdFc2NhcGUnIHx8ICF0aGlzLm1hcmtNZW51KSByZXR1cm47XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKCFldmVudC5rZXkgfHwgWydQbGF5ZXJNYXJrcycsICdQbGF5ZXJNYXJrQ29sb3JzJywgJ0ZyaWVuZExpc3QnLCAnRm9lTGlzdCddXG4gICAgICAgICAgICAgICAgLnNvbWUoa2V5ID0+IGV2ZW50LmtleSA9PT0gTFNfQ09ORklHX05BTUUgKyBrZXkpKSB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihtdXRhdGlvbnMgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5yb290U2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHJvb3QgIT09IHRoaXMucm9vdCB8fCAocm9vdCAmJiBtdXRhdGlvbnMuc29tZSgoeyB0YXJnZXQgfSkgPT4gcm9vdC5jb250YWlucyh0YXJnZXQpKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZSxcbiAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ3NvcnRpbmdfaWQnLCAnaWQtbWVtYmVyJywgJ2lkX2NvbnRlc3QnXVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBsc0dldCwgbHNSbSwgbHNTZXQgfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcblxuZXhwb3J0IHR5cGUgQ29udGVzdEtpbmQgPSAnZGFpbHknIHwgJ2V2ZW50JztcbmV4cG9ydCB0eXBlIENvbnRlc3RSYW5rID0gJ3RvcCcgfCAnbWluZSc7XG5cbmNvbnN0IENPTlRFU1RfS0lORFMgPSBbWydkYWlseScsICdEYWlseSddLCBbJ2V2ZW50JywgJ0V2ZW50J11dIGFzIGNvbnN0O1xuY29uc3QgQ09OVEVTVF9FVkVOVFMgPSBbWydhbnknLCAnQW55J10sIFsnY2JjJywgJ0NiQyddLCBbJ2NjYycsICdDQ0MnXSwgWydsYycsICdMQyddXSBhcyBjb25zdDtcbmNvbnN0IENPTlRFU1RfUkFOS1MgPSBbWyd0b3AnLCAnVG9wJ10sIFsnbWluZScsICdNeSByYW5rJ11dIGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBDb250ZXN0RXZlbnQgPSBFeGNsdWRlPCh0eXBlb2YgQ09OVEVTVF9FVkVOVFMpW251bWJlcl1bMF0sICdhbnknPjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRDb250ZXN0U2V0dGluZyhrZXk6IHN0cmluZyk6IHVua25vd24ge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBsc0dldChrZXkpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQ29udGVzdERlZmF1bHRzKCkge1xuICAgIGNvbnN0IGtpbmQ6IENvbnRlc3RLaW5kID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0S2luZCcpID09PSAnZGFpbHknID8gJ2RhaWx5JyA6ICdldmVudCc7XG4gICAgY29uc3Qgc2F2ZWRFdmVudCA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdEV2ZW50Jyk7XG4gICAgY29uc3QgZXZlbnQgPSBDT05URVNUX0VWRU5UUy5maW5kKChbdmFsdWVdKSA9PiB2YWx1ZSA9PT0gc2F2ZWRFdmVudCk/LlswXSA/PyAnYW55JztcbiAgICBjb25zdCByYW5rOiBDb250ZXN0UmFuayA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdFJhbmtTdGFydCcpID09PSAndG9wJyA/ICd0b3AnIDogJ21pbmUnO1xuICAgIHJldHVybiB7IGtpbmQsIGV2ZW50LCByYW5rIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQ29udGVzdFJhbmsoaWQ6IHN0cmluZywgZmFsbGJhY2s6IENvbnRlc3RSYW5rKTogQ29udGVzdFJhbmsge1xuICAgIGNvbnN0IHJhbmtzID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0UmFua3MnKTtcbiAgICBpZiAocmFua3MgJiYgdHlwZW9mIHJhbmtzID09PSAnb2JqZWN0JyAmJiBPYmplY3QuaGFzT3duKHJhbmtzLCBpZCkpIHtcbiAgICAgICAgY29uc3QgcmFuayA9IChyYW5rcyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbaWRdO1xuICAgICAgICBpZiAocmFuayA9PT0gJ21pbmUnIHx8IHJhbmsgPT09ICd0b3AnKSByZXR1cm4gcmFuaztcbiAgICB9XG5cbiAgICAvLyBPbGRlciB2ZXJzaW9ucyBzdG9yZWQgYSByYW5rIG92ZXJyaWRlIGZvciBhIHNpbmdsZSBjb250ZXN0LlxuICAgIGNvbnN0IHNhdmVkID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0UGlubmVkUmFuaycpO1xuICAgIGlmIChzYXZlZCAmJiB0eXBlb2Ygc2F2ZWQgPT09ICdvYmplY3QnICYmICdpZCcgaW4gc2F2ZWQgJiYgU3RyaW5nKHNhdmVkLmlkKSA9PT0gaWQgJiYgJ3JhbmsnIGluIHNhdmVkKSB7XG4gICAgICAgIGlmIChzYXZlZC5yYW5rID09PSAnbWluZScgfHwgc2F2ZWQucmFuayA9PT0gJ3RvcCcpIHJldHVybiBzYXZlZC5yYW5rO1xuICAgIH1cbiAgICByZXR1cm4gZmFsbGJhY2s7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYXZlQ29udGVzdFJhbmsoaWQ6IHN0cmluZywgcmFuazogQ29udGVzdFJhbmspIHtcbiAgICBjb25zdCBzYXZlZCA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdFJhbmtzJyk7XG4gICAgY29uc3QgcmFua3MgPSBzYXZlZCAmJiB0eXBlb2Ygc2F2ZWQgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHNhdmVkKSA/IHNhdmVkIDoge307XG4gICAgbHNTZXQoJ0NvbnRlc3RSYW5rcycsIHsgLi4ucmFua3MsIFtpZF06IHJhbmsgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcnVuZUNvbnRlc3RSYW5rcyhhdmFpbGFibGU6IFJlYWRvbmx5U2V0PHN0cmluZz4pIHtcbiAgICBjb25zdCBzYXZlZCA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdFJhbmtzJyk7XG4gICAgaWYgKHNhdmVkICYmIHR5cGVvZiBzYXZlZCA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoc2F2ZWQpKSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhzYXZlZCk7XG4gICAgICAgIGNvbnN0IGtlcHQgPSBlbnRyaWVzLmZpbHRlcigoW2lkLCByYW5rXSkgPT4gYXZhaWxhYmxlLmhhcyhpZCkgJiYgKHJhbmsgPT09ICd0b3AnIHx8IHJhbmsgPT09ICdtaW5lJykpO1xuICAgICAgICBpZiAoIWtlcHQubGVuZ3RoKSBsc1JtKCdDb250ZXN0UmFua3MnKTtcbiAgICAgICAgZWxzZSBpZiAoa2VwdC5sZW5ndGggIT09IGVudHJpZXMubGVuZ3RoKSBsc1NldCgnQ29udGVzdFJhbmtzJywgT2JqZWN0LmZyb21FbnRyaWVzKGtlcHQpKTtcbiAgICB9XG5cbiAgICBjb25zdCBsZWdhY3kgPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RQaW5uZWRSYW5rJyk7XG4gICAgaWYgKGxlZ2FjeSAmJiB0eXBlb2YgbGVnYWN5ID09PSAnb2JqZWN0JyAmJiAnaWQnIGluIGxlZ2FjeSAmJiAhYXZhaWxhYmxlLmhhcyhTdHJpbmcobGVnYWN5LmlkKSkpIHtcbiAgICAgICAgbHNSbSgnQ29udGVzdFBpbm5lZFJhbmsnKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlUmFua0Nob2ljZShsYWJlbDogc3RyaW5nLCBzZWxlY3Q6IChyYW5rOiBDb250ZXN0UmFuaykgPT4gdm9pZCkge1xuICAgIHJldHVybiBtYWtlQ2hvaWNlKGxhYmVsLCBDT05URVNUX1JBTktTLCBzZWxlY3QpO1xufVxuXG5mdW5jdGlvbiBtYWtlQ2hvaWNlPFQgZXh0ZW5kcyBzdHJpbmc+KGxhYmVsOiBzdHJpbmcsIG9wdGlvbnM6IFJlYWRvbmx5QXJyYXk8cmVhZG9ubHkgW1QsIHN0cmluZ10+LCBzZWxlY3Q6ICh2YWx1ZTogVCkgPT4gdm9pZCkge1xuICAgIGNvbnN0IGdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGdyb3VwLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY29udGVzdC1jaG9pY2UnO1xuICAgIGdyb3VwLnNldEF0dHJpYnV0ZSgncm9sZScsICdncm91cCcpO1xuICAgIGdyb3VwLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGxhYmVsKTtcbiAgICBncm91cC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZlbnQgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpO1xuICAgIGZvciAoY29uc3QgW3ZhbHVlLCB0ZXh0XSBvZiBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICBidXR0b24uZGF0YXNldC5jb250ZXN0Q2hvaWNlID0gdmFsdWU7XG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgc2VsZWN0KHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGdyb3VwLmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgfVxuICAgIHJldHVybiBncm91cDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdENvbnRlc3RDaG9pY2UoZ3JvdXA6IEhUTUxFbGVtZW50LCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgZm9yIChjb25zdCBidXR0b24gb2YgZ3JvdXAucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJykpIHtcbiAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgU3RyaW5nKGJ1dHRvbi5kYXRhc2V0LmNvbnRlc3RDaG9pY2UgPT09IHZhbHVlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbENvbnRlc3RTZXR0aW5ncygpIHtcbiAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmdbcmVsPVwiSkFSVklTX2NvbnRlc3RTdGFydFwiXSc7XG4gICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIGlmICghY2FyZCB8fCBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXMtY29udGVzdC1zZXR0aW5ncycpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZmllbGRzZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmaWVsZHNldCcpO1xuICAgICAgICBmaWVsZHNldC5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3Qtc2V0dGluZ3MnO1xuICAgICAgICBmaWVsZHNldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnQ29udGVzdCBzdGFydHVwIGRlZmF1bHRzJyk7XG4gICAgICAgIGNvbnN0IHNhdmUgPSAoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGdyb3VwOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsc1NldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGdyb3VwLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB0aGUgY29udGVzdCBkZWZhdWx0OicsIGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBldmVudExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGV2ZW50TGFiZWwuaW5uZXJIVE1MID0gc2V0dGluZ0hlbHAoJ0V2ZW50IHR5cGUnLCAnUHJlZmVyIENiQyAoQ3VtYmFjayBDb250ZXN0KSwgQ0NDIChDcmF6eSBDdW1iYWNrIENvbnRlc3QpLCBvciBMQyAoTGVnZW5kYXJ5IENvbnRlc3QpIHdoZW4gYWN0aXZlLiBBbnkgb3BlbnMgdGhlIGJvdHRvbSBhY3RpdmUgY29udGVzdCwgYXMgZG9lcyBhbiB1bmF2YWlsYWJsZSBldmVudCB0eXBlLicpO1xuICAgICAgICBjb25zdCBldmVudHMgPSBtYWtlQ2hvaWNlKCdFdmVudCB0eXBlJywgQ09OVEVTVF9FVkVOVFMsIHZhbHVlID0+IHNhdmUoJ0NvbnRlc3RFdmVudCcsIHZhbHVlLCBldmVudHMpKTtcbiAgICAgICAgY29uc3Qgc2hvd0V2ZW50cyA9IChraW5kOiBDb250ZXN0S2luZCkgPT4gZXZlbnRMYWJlbC5oaWRkZW4gPSBldmVudHMuaGlkZGVuID0ga2luZCA9PT0gJ2RhaWx5JztcbiAgICAgICAgY29uc3Qga2luZHMgPSBtYWtlQ2hvaWNlKCdQcmVmZXJyZWQgY29udGVzdCcsIENPTlRFU1RfS0lORFMsIHZhbHVlID0+IHtcbiAgICAgICAgICAgIGlmIChzYXZlKCdDb250ZXN0S2luZCcsIHZhbHVlLCBraW5kcykpIHNob3dFdmVudHModmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcmFua3MgPSBtYWtlUmFua0Nob2ljZSgnRGVmYXVsdCBsZWFkZXJib2FyZCBwb3NpdGlvbicsIHZhbHVlID0+IHNhdmUoJ0NvbnRlc3RSYW5rU3RhcnQnLCB2YWx1ZSwgcmFua3MpKTtcbiAgICAgICAgY29uc3QgZGVmYXVsdHMgPSByZWFkQ29udGVzdERlZmF1bHRzKCk7XG4gICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2Uoa2luZHMsIGRlZmF1bHRzLmtpbmQpO1xuICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGV2ZW50cywgZGVmYXVsdHMuZXZlbnQpO1xuICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKHJhbmtzLCBkZWZhdWx0cy5yYW5rKTtcbiAgICAgICAgc2hvd0V2ZW50cyhkZWZhdWx0cy5raW5kKTtcblxuICAgICAgICBjb25zdCBraW5kTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAga2luZExhYmVsLmlubmVySFRNTCA9IHNldHRpbmdIZWxwKCdQcmVmZXJyZWQgY29udGVzdCcsICdEYWlseSBvcGVucyB0aGUgZmlyc3QgYWN0aXZlIGRhaWx5IGNvbnRlc3QuIEV2ZW50IGNhbiBwcmVmZXIgYW4gZXZlbnQgdHlwZSBvciBmb2xsb3cgdGhlIGdhbWUgYW5kIG9wZW4gdGhlIGJvdHRvbSBhY3RpdmUgY29udGVzdC4nKTtcbiAgICAgICAgY29uc3QgcmFua0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHJhbmtMYWJlbC5pbm5lckhUTUwgPSBzZXR0aW5nSGVscCgnTGVhZGVyYm9hcmQgc3RhcnQnLCAnT3BlbiBhdCB0aGUgdG9wIG9yIGF0IHlvdXIgcmFuay4gQSBwb3NpdGlvbiBjaG9zZW4gb24gYSBjb250ZXN0IGNhcmQgdGFrZXMgcHJpb3JpdHkuJyk7XG4gICAgICAgIGZpZWxkc2V0LmFwcGVuZChraW5kTGFiZWwsIGtpbmRzLCBldmVudExhYmVsLCBldmVudHMsIHJhbmtMYWJlbCwgcmFua3MpO1xuICAgICAgICBjb25zdCByZWZyZXNoRW5hYmxlZCA9ICgpID0+IGZpZWxkc2V0LmRpc2FibGVkID0gIWNhcmQuY2xhc3NMaXN0LmNvbnRhaW5zKCdlbmFibGVkJyk7XG4gICAgICAgIHJlZnJlc2hFbmFibGVkKCk7XG4gICAgICAgIG5ldyBNdXRhdGlvbk9ic2VydmVyKHJlZnJlc2hFbmFibGVkKS5vYnNlcnZlKGNhcmQsIHsgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10gfSk7XG4gICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoZmllbGRzZXQpO1xuICAgIH0pO1xufVxuIiwgImludGVyZmFjZSBDb250ZXN0U2hvcnRjdXQge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY2F0ZWdvcnk6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgcmFuazogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9zaXRpb25Db250ZXN0U2hvcnRjdXRzKGNhbnZhczogSFRNTEVsZW1lbnQsIGJhcjogSFRNTEVsZW1lbnQpIHtcbiAgICBjb25zdCBjbG9zZSA9IGNhbnZhcy5wYXJlbnRFbGVtZW50Py5xdWVyeVNlbGVjdG9yKCc6c2NvcGUgPiAuY2xvc2VfY3Jvc3MnKTtcbiAgICBpZiAoIWNsb3NlKSByZXR1cm47XG5cbiAgICBjb25zdCBmcmFtZSA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBjcm9zcyA9IGNsb3NlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHNjYWxlWCA9IGZyYW1lLndpZHRoIC8gY2FudmFzLm9mZnNldFdpZHRoO1xuICAgIGNvbnN0IHNjYWxlWSA9IGZyYW1lLmhlaWdodCAvIGNhbnZhcy5vZmZzZXRIZWlnaHQ7XG4gICAgaWYgKCFzY2FsZVggfHwgIXNjYWxlWSB8fCAhY3Jvc3Mud2lkdGgpIHJldHVybjtcblxuICAgIGJhci5zdHlsZS5pbnNldElubGluZUVuZCA9IGAke01hdGguY2VpbCgoZnJhbWUucmlnaHQgLSBjcm9zcy5sZWZ0KSAvIHNjYWxlWCArIDgpfXB4YDtcbiAgICBiYXIuc3R5bGUuaW5zZXRCbG9ja1N0YXJ0ID0gYCR7TWF0aC5yb3VuZCgoY3Jvc3MudG9wICsgY3Jvc3MuaGVpZ2h0IC8gMiAtIGZyYW1lLnRvcCkgLyBzY2FsZVkpfXB4YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckNvbnRlc3RTaG9ydGN1dHMoXG4gICAgY2FudmFzOiBIVE1MRWxlbWVudCxcbiAgICBjb250ZXN0czogQ29udGVzdFNob3J0Y3V0W10sXG4gICAgc2VsZWN0ZWQ6IHN0cmluZyB8IG51bGwsXG4gICAgc2VsZWN0OiAoaWQ6IHN0cmluZykgPT4gdm9pZFxuKSB7XG4gICAgbGV0IGJhciA9IGNhbnZhcy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cycpO1xuICAgIGlmICghY29udGVzdHMubGVuZ3RoKSB7XG4gICAgICAgIGJhcj8ucmVtb3ZlKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFiYXIpIHtcbiAgICAgICAgYmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJhci5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzJztcbiAgICAgICAgYmFyLnNldEF0dHJpYnV0ZSgncm9sZScsICdncm91cCcpO1xuICAgICAgICBiYXIuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ0FjdGl2ZSBjb250ZXN0cycpO1xuICAgICAgICBiYXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KSkgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgaWQgPSBldmVudC50YXJnZXQuY2xvc2VzdDxIVE1MQnV0dG9uRWxlbWVudD4oJ2J1dHRvbltkYXRhLWNvbnRlc3QtaWRdJyk/LmRhdGFzZXQuY29udGVzdElkO1xuICAgICAgICAgICAgaWYgKGlkKSBzZWxlY3QoaWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgY2FudmFzLnByZXBlbmQoYmFyKTtcbiAgICAgICAgcG9zaXRpb25Db250ZXN0U2hvcnRjdXRzKGNhbnZhcywgYmFyKTtcbiAgICB9XG5cbiAgICBjb25zdCBidXR0b25zID0gbmV3IE1hcChBcnJheS5mcm9tKGJhci5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKSwgYnV0dG9uID0+IFtidXR0b24uZGF0YXNldC5jb250ZXN0SWQsIGJ1dHRvbl0pKTtcbiAgICBjb25zdCBjYXRlZ29yaWVzID0gY29udGVzdHMubWFwKGNvbnRlc3QgPT4gY29udGVzdC5jYXRlZ29yeSk7XG4gICAgZm9yIChjb25zdCBbaW5kZXgsIHsgaWQsIGNhdGVnb3J5LCBuYW1lLCByYW5rIH1dIG9mIGNvbnRlc3RzLmVudHJpZXMoKSkge1xuICAgICAgICBsZXQgYnV0dG9uID0gYnV0dG9ucy5nZXQoaWQpO1xuICAgICAgICBpZiAoIWJ1dHRvbikge1xuICAgICAgICAgICAgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgYnV0dG9uLmRhdGFzZXQuY29udGVzdElkID0gaWQ7XG4gICAgICAgICAgICBidXR0b24uYXBwZW5kKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3Ryb25nJykpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR5cGUgPSBjYXRlZ29yaWVzLmluZGV4T2YoY2F0ZWdvcnkpID09PSBjYXRlZ29yaWVzLmxhc3RJbmRleE9mKGNhdGVnb3J5KSA/XG4gICAgICAgICAgICBjYXRlZ29yeSA6IGAke2NhdGVnb3J5fSAke2NhdGVnb3JpZXMuc2xpY2UoMCwgaW5kZXggKyAxKS5maWx0ZXIodmFsdWUgPT4gdmFsdWUgPT09IGNhdGVnb3J5KS5sZW5ndGh9YDtcbiAgICAgICAgY29uc3QgW2xhYmVsLCBwbGFjZW1lbnRdID0gQXJyYXkuZnJvbShidXR0b24uY2hpbGRyZW4pO1xuICAgICAgICBpZiAobGFiZWwudGV4dENvbnRlbnQgIT09IHR5cGUpIGxhYmVsLnRleHRDb250ZW50ID0gdHlwZTtcbiAgICAgICAgaWYgKHBsYWNlbWVudC50ZXh0Q29udGVudCAhPT0gKHJhbmsgfHwgJ+KAkycpKSBwbGFjZW1lbnQudGV4dENvbnRlbnQgPSByYW5rIHx8ICfigJMnO1xuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGAke3R5cGV9IMK3ICR7bmFtZX0gwrcgJHtyYW5rID8gYFJhbmsgJHtyYW5rfWAgOiAnUmFuayB1bmF2YWlsYWJsZSd9YDtcbiAgICAgICAgaWYgKGJ1dHRvbi50aXRsZSAhPT0gZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGJ1dHRvbi50aXRsZSA9IGRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGRlc2NyaXB0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcmVzc2VkID0gU3RyaW5nKGlkID09PSBzZWxlY3RlZCk7XG4gICAgICAgIGlmIChidXR0b24uZ2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnKSAhPT0gcHJlc3NlZCkgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgcHJlc3NlZCk7XG5cbiAgICAgICAgaWYgKGJ1dHRvbiAhPT0gYmFyLmNoaWxkcmVuW2luZGV4XSkgYmFyLmluc2VydEJlZm9yZShidXR0b24sIGJhci5jaGlsZHJlbltpbmRleF0gPz8gbnVsbCk7XG4gICAgICAgIGJ1dHRvbnMuZGVsZXRlKGlkKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBidXR0b24gb2YgYnV0dG9ucy52YWx1ZXMoKSkgYnV0dG9uLnJlbW92ZSgpO1xufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlLCB0eXBlIE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgJCwgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCwgbHNSbSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgbWFrZVJhbmtDaG9pY2UsIHBydW5lQ29udGVzdFJhbmtzLCByZWFkQ29udGVzdERlZmF1bHRzLCByZWFkQ29udGVzdFJhbmssIHJlYWRDb250ZXN0U2V0dGluZywgc2F2ZUNvbnRlc3RSYW5rLCBzZWxlY3RDb250ZXN0Q2hvaWNlLCB0eXBlIENvbnRlc3RFdmVudCwgdHlwZSBDb250ZXN0S2luZCB9IGZyb20gJy4vY29udGVzdFByZWZlcmVuY2VzJztcbmltcG9ydCB7IHBvc2l0aW9uQ29udGVzdFNob3J0Y3V0cywgcmVuZGVyQ29udGVzdFNob3J0Y3V0cyB9IGZyb20gJy4vY29udGVzdFNob3J0Y3V0cyc7XG5cbnR5cGUgQ29udGVzdENhdGVnb3J5ID0gQ29udGVzdEtpbmQgfCBDb250ZXN0RXZlbnQ7XG5jb25zdCBDT05URVNUX1NIT1JUX0xBQkVMUzogUmVjb3JkPENvbnRlc3RDYXRlZ29yeSwgc3RyaW5nPiA9IHtcbiAgICBkYWlseTogJ0RDJywgY2JjOiAnQ2JDJywgY2NjOiAnQ0NDJywgbGM6ICdMQycsIGV2ZW50OiAnRXZlbnQnXG59O1xuY29uc3QgQ09OVEVTVF9USVRMRV9TRUxFQ1RPUiA9ICcuY29udGVzdF90aXRsZSwgLmNvbnRlc3RfbmFtZSwgaDMsIGg0LCBoNSc7XG5jb25zdCBJTlRFUkFDVElWRV9DT05URU5UID0gJ2FbaHJlZl0sIGJ1dHRvbiwgaW5wdXQsIHNlbGVjdCwgdGV4dGFyZWEsIFtjb250ZW50ZWRpdGFibGVdOm5vdChbY29udGVudGVkaXRhYmxlPVwiZmFsc2VcIl0pLCBbdGFiaW5kZXhdJztcbmNvbnN0IHByb3RlY3RlZFBhbmVzID0gbmV3IFNldDxIVE1MRWxlbWVudD4oKTtcbmxldCByZXN0b3JlU2Nyb2xsSW50b1ZpZXc6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gZ3VhcmRTY3JvbGxJbnRvVmlldyhwYW5lOiBIVE1MRWxlbWVudCkge1xuICAgIGlmICghcHJvdGVjdGVkUGFuZXMuc2l6ZSkge1xuICAgICAgICBjb25zdCBwcmV2aW91cyA9IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3O1xuICAgICAgICBjb25zdCBndWFyZGVkID0gZnVuY3Rpb24gKHRoaXM6IEVsZW1lbnQsIG9wdGlvbnM/OiBib29sZWFuIHwgU2Nyb2xsSW50b1ZpZXdPcHRpb25zKSB7XG4gICAgICAgICAgICAvLyBzY3JvbGxJbnRvVmlldyBjYW4gbW92ZSBhIHBhbmUgd2l0aG91dCBjYWxsaW5nIGl0cyBzY3JvbGwgbWV0aG9kcy5cbiAgICAgICAgICAgIGlmIChBcnJheS5mcm9tKHByb3RlY3RlZFBhbmVzKS5zb21lKHNjcm9sbGVyID0+IHNjcm9sbGVyLmNvbnRhaW5zKHRoaXMpKSkgcmV0dXJuO1xuICAgICAgICAgICAgcHJldmlvdXMuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgfTtcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXcgPSBndWFyZGVkO1xuICAgICAgICByZXN0b3JlU2Nyb2xsSW50b1ZpZXcgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXcgPT09IGd1YXJkZWQpIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3ID0gcHJldmlvdXM7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHByb3RlY3RlZFBhbmVzLmFkZChwYW5lKTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIHByb3RlY3RlZFBhbmVzLmRlbGV0ZShwYW5lKTtcbiAgICAgICAgaWYgKHByb3RlY3RlZFBhbmVzLnNpemUpIHJldHVybjtcbiAgICAgICAgcmVzdG9yZVNjcm9sbEludG9WaWV3Py4oKTtcbiAgICAgICAgcmVzdG9yZVNjcm9sbEludG9WaWV3ID0gdW5kZWZpbmVkO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIGdldENvbnRlc3RDYXRlZ29yeShjYXRlZ29yeTogc3RyaW5nIHwgdW5kZWZpbmVkKTogQ29udGVzdENhdGVnb3J5IHwgbnVsbCB7XG4gICAgc3dpdGNoIChjYXRlZ29yeT8udHJpbSgpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvWy0gXSsvZywgJ18nKSkge1xuICAgICAgICBjYXNlICdkYWlseSc6XG4gICAgICAgIGNhc2UgJ2RhaWx5X2NvbnRlc3QnOiByZXR1cm4gJ2RhaWx5JztcbiAgICAgICAgY2FzZSAnY3VtYmFjayc6XG4gICAgICAgIGNhc2UgJ2N1bWJhY2tfY29udGVzdCc6XG4gICAgICAgIGNhc2UgJ2NiYyc6IHJldHVybiAnY2JjJztcbiAgICAgICAgY2FzZSAnY3JhenlfY3VtYmFjayc6XG4gICAgICAgIGNhc2UgJ2NyYXp5X2N1bWJhY2tfY29udGVzdCc6XG4gICAgICAgIGNhc2UgJ2NjYmMnOlxuICAgICAgICBjYXNlICdjY2MnOiByZXR1cm4gJ2NjYyc7XG4gICAgICAgIGNhc2UgJ2xlZ2VuZGFyeSc6XG4gICAgICAgIGNhc2UgJ2xlZ2VuZGFyeV9jb250ZXN0JzpcbiAgICAgICAgY2FzZSAnbGMnOiByZXR1cm4gJ2xjJztcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuIGNhdGVnb3J5ID8gJ2V2ZW50JyA6IG51bGw7XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgQ29udGVzdENhcmQge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY2FyZDogSFRNTEVsZW1lbnQ7XG4gICAgaGVhZGVyOiBIVE1MRWxlbWVudDtcbiAgICB0aXRsZTogSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGxhYmVsOiBzdHJpbmc7XG4gICAgY2F0ZWdvcnk6IENvbnRlc3RDYXRlZ29yeSB8IG51bGw7XG4gICAgZW5kZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcm1Db250ZXN0U3RhcnR1cEd1YXJkKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZSAhPT0gJy9hY3Rpdml0aWVzLmh0bWwnIHx8IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKS5nZXQoJ3RhYicpICE9PSAnY29udGVzdHMnKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBpZiAoSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnSEhQbHVzUGx1c0NvbmZpZycpID8/ICdudWxsJyk/LkpBUlZJU19jb250ZXN0U3RhcnQgPT09IGZhbHNlKSByZXR1cm47XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBLZWVwIGJvdGggcGFuZXMgb3V0IG9mIHZpZXcgdW50aWwgdGhlIGNob3NlbiBjb250ZXN0IGFuZCBpdHMgbGVhZGVyYm9hcmQgYXJlIHBvc2l0aW9uZWQuXG4gICAgY29uc3QgZ3VhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIGd1YXJkLmlkID0gJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnO1xuICAgIGd1YXJkLnRleHRDb250ZW50ID0gYFxuICAgICAgICAjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEsXG4gICAgICAgICNjb250ZXN0cyAucmlnaHRfcGFydCB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICAgICAgfVxuICAgIGA7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgIGlmICghZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSByZXR1cm47XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChndWFyZCk7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9KTtcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ3VhcmQpO1xuICAgIGVsc2Ugb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwgeyBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICBndWFyZC5yZW1vdmUoKTtcbiAgICB9LCA0MDAwKTtcbn1cblxuZXhwb3J0IGNsYXNzIENvbnRlc3RTdGFydCBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHByZWZlcmVuY2UgPSAnJztcbiAgICBwcml2YXRlIHN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBkZWZhdWx0cyA9IHJlYWRDb250ZXN0RGVmYXVsdHMoKTtcbiAgICBwcml2YXRlIGxpc3Q6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByaWdodDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJlc3RvcmluZ0NhcmQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByZXBvc2l0aW9uOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHN0b3BKdW1wOiAoKGZpbmlzaD86IGJvb2xlYW4pID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdG9wU3dpdGNoU2Nyb2xsID0gdHJ1ZTtcbiAgICBwcml2YXRlIHN3aXRjaFNjcm9sbDogeyByZXN0b3JlOiAoKSA9PiB2b2lkOyBzdG9wOiAoKSA9PiB2b2lkIH0gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIG9ic2VydmVyOiBNdXRhdGlvbk9ic2VydmVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSB0aXRsZVNpemVzOiBSZXNpemVPYnNlcnZlciB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgdGl0bGVMYWJlbHMgPSBuZXcgTWFwPEhUTUxFbGVtZW50LCBIVE1MRWxlbWVudD4oKTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGZvY3VzYWJsZVBhbmVzID0gbmV3IFNldDxIVE1MRWxlbWVudD4oKTtcbiAgICBwcml2YXRlIHBydW5lZFJhbmtSb3N0ZXI6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgbGlzdGVuZXJzOiBBYm9ydENvbnRyb2xsZXIgfCBudWxsID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2NvbnRlc3RTdGFydCdcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJDb250ZXN0IHN0YXJ0dXBcIiwgXCJPcGVuIHRoZSBwcmVmZXJyZWQgY29udGVzdCBhbmQgcmFuayBvbiBsb2FkLCBhbmQgc3dpdGNoIGFjdGl2ZSBjb250ZXN0cyBmcm9tIHRoZSBoZWFkZXIuIEEgc3RhcnJlZCBjb250ZXN0IHRha2VzIHByaW9yaXR5IG9uIGxvYWQuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAnbm9Td2l0Y2hTY3JvbGwnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscCgnU3RvcCBzY3JvbGxpbmcgb24gY29udGVzdCBzd2l0Y2hlcycsICdLZWVwIHRoZSBjb250ZXN0IGxpc3QgaW4gcGxhY2Ugd2hlbiB5b3Ugc3dpdGNoIGJ5IGNsaWNraW5nIGEgY2FyZC4gVGhlIGxlYWRlcmJvYXJkIG9wZW5zIGF0IHlvdXIgcHJlZmVycmVkIHBvc2l0aW9uLCBhbmQgeW91IGNhbiBzdGlsbCBzY3JvbGwgYnkgaGFuZC4nKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHsgbmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hIH0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlID09PSAnL2FjdGl2aXRpZXMuaHRtbCc7XG4gICAgfVxuXG4gICAgZ2V0Q29udGVzdHMobGlzdDogSFRNTEVsZW1lbnQsIGZpbmlzaGVkOiBSZWFkb25seVNldDxzdHJpbmc+KTogQ29udGVzdENhcmRbXSB7XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IG5ldyBNYXAoT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmFjdGl2ZSB8fCB7fSlcbiAgICAgICAgICAgIC5maWx0ZXIoY29udGVzdCA9PiBjb250ZXN0Py5pZF9jb250ZXN0ICE9IG51bGwpXG4gICAgICAgICAgICAubWFwKGNvbnRlc3QgPT4gW1N0cmluZyhjb250ZXN0LmlkX2NvbnRlc3QpLCBjb250ZXN0XSkpO1xuXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGxpc3QucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5jb250ZXN0W2lkX2NvbnRlc3RdJykpLmZsYXRNYXAoY2FyZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IGNhcmQuZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG4gICAgICAgICAgICBpZiAoIWlkKSByZXR1cm4gW107XG4gICAgICAgICAgICBjb25zdCBjb250ZXN0ID0gYWN0aXZlLmdldChpZCk7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXIgPSBjYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcuY29udGVzdF9oZWFkZXInKTtcbiAgICAgICAgICAgIGNvbnN0IGVuZGVkID0gZmluaXNoZWQuaGFzKGlkKTtcbiAgICAgICAgICAgIGlmICghaGVhZGVyIHx8ICghZW5kZWQgJiYgIWNvbnRlc3QgJiYgIWhlYWRlci5tYXRjaGVzKCcuaW5fcHJvZ3Jlc3MnKSkpIHJldHVybiBbXTtcblxuICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBoZWFkZXIucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oQ09OVEVTVF9USVRMRV9TRUxFQ1RPUik7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gdGl0bGUgJiYgQXJyYXkuZnJvbSh0aXRsZS5jaGlsZE5vZGVzKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIobm9kZSA9PiAhKG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSB8fCAhbm9kZS5tYXRjaGVzKCcuamFydmlzLWNvbnRlc3QtcGluLCAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpKVxuICAgICAgICAgICAgICAgIC5tYXAobm9kZSA9PiBub2RlLnRleHRDb250ZW50KS5qb2luKCcnKS50cmltKCk7XG4gICAgICAgICAgICBjb25zdCBjYXRlZ29yeSA9IGdldENvbnRlc3RDYXRlZ29yeShjb250ZXN0Py5jYXRlZ29yeV90eXBlKTtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIGlkLCBjYXJkLCBoZWFkZXIsIHRpdGxlLCBlbmRlZCxcbiAgICAgICAgICAgICAgICBjYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBsYWJlbDogU3RyaW5nKG5hbWUgfHwgY29udGVzdD8ubmFtZSB8fCBjb250ZXN0Py50aXRsZSB8fFxuICAgICAgICAgICAgICAgICAgICAoY2F0ZWdvcnkgPT09ICdkYWlseScgPyAnRGFpbHkgY29udGVzdCcgOiAnQ29udGVzdCcpKS50cmltKClcbiAgICAgICAgICAgIH1dO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRUYXJnZXQoY29udGVzdHM6IENvbnRlc3RDYXJkW10pIHtcbiAgICAgICAgaWYgKHRoaXMucHJlZmVyZW5jZSkgcmV0dXJuIGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmlkID09PSB0aGlzLnByZWZlcmVuY2UpO1xuXG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRzLmtpbmQgPT09ICdldmVudCcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRlZmF1bHRzLmV2ZW50ICE9PSAnYW55Jykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gWy4uLmNvbnRlc3RzXS5yZXZlcnNlKCkuZmluZChjb250ZXN0ID0+IGNvbnRlc3QuY2F0ZWdvcnkgPT09IHRoaXMuZGVmYXVsdHMuZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChldmVudCB8fCBkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSByZXR1cm4gZXZlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29udGVzdHMuYXQoLTEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb250ZXN0cy5maW5kKGNvbnRlc3QgPT4gY29udGVzdC5jYXRlZ29yeSA9PT0gJ2RhaWx5JykgPz9cbiAgICAgICAgICAgIGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmNhdGVnb3J5ID09PSBudWxsKSA/PyBjb250ZXN0c1swXTtcbiAgICB9XG5cbiAgICBjbGVhckV4cGlyZWRQaW4obGlzdDogSFRNTEVsZW1lbnQsIGNvbnRlc3RzOiBDb250ZXN0Q2FyZFtdLCBmaW5pc2hlZDogUmVhZG9ubHlTZXQ8c3RyaW5nPikge1xuICAgICAgICBpZiAoIXRoaXMucHJlZmVyZW5jZSB8fCBjb250ZXN0cy5zb21lKCh7IGlkIH0pID0+IGlkID09PSB0aGlzLnByZWZlcmVuY2UpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgYWN0aXZlID0gd2luZG93LmNvbnRlc3RzPy5hY3RpdmU7XG4gICAgICAgIGNvbnN0IG1pc3NpbmcgPSBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnICYmIGxpc3QucXVlcnlTZWxlY3RvcignLmNvbnRlc3RfaGVhZGVyJykgJiZcbiAgICAgICAgICAgIGFjdGl2ZSAmJiAhT2JqZWN0LnZhbHVlcyhhY3RpdmUpLnNvbWUoY29udGVzdCA9PiBTdHJpbmcoY29udGVzdD8uaWRfY29udGVzdCkgPT09IHRoaXMucHJlZmVyZW5jZSk7XG4gICAgICAgIGlmICghZmluaXNoZWQuaGFzKHRoaXMucHJlZmVyZW5jZSkgJiYgIW1pc3NpbmcpIHJldHVybjtcblxuICAgICAgICBjb25zdCBleHBpcmVkSWQgPSB0aGlzLnByZWZlcmVuY2U7XG4gICAgICAgIHRoaXMucHJlZmVyZW5jZSA9ICcnO1xuICAgICAgICB0aGlzLnN0b3BKdW1wPy4oZmFsc2UpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKFN0cmluZyhsc0dldCgnQ29udGVzdFN0YXJ0SWQnKSkgPT09IGV4cGlyZWRJZCkgbHNSbSgnQ29udGVzdFN0YXJ0SWQnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3QgY2xlYXIgdGhlIGV4cGlyZWQgY29udGVzdCBwcmVmZXJlbmNlOicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcnVuZVVuYXZhaWxhYmxlUmFua3MobGlzdDogSFRNTEVsZW1lbnQsIGZpbmlzaGVkOiBSZWFkb25seVNldDxzdHJpbmc+KSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSB3aW5kb3cuY29udGVzdHM7XG4gICAgICAgIC8vIEEgcGFydGlhbCByb3N0ZXIgY2FuIGJlIHZpc2libGUgd2hpbGUgdGhlIGdhbWUgbG9hZHMgdGhlIGNvbnRlc3QgdGFiLlxuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJyB8fCAhZGF0YT8uYWN0aXZlIHx8ICFkYXRhLmZpbmlzaGVkKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgYXZhaWxhYmxlID0gbmV3IFNldChmaW5pc2hlZCk7XG4gICAgICAgIGZvciAoY29uc3QgY29udGVzdCBvZiBPYmplY3QudmFsdWVzKGRhdGEuYWN0aXZlKSkge1xuICAgICAgICAgICAgaWYgKGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbCkgYXZhaWxhYmxlLmFkZChTdHJpbmcoY29udGVzdC5pZF9jb250ZXN0KSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBjYXJkIG9mIGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlc3RbaWRfY29udGVzdF0nKSkge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBjYXJkLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKGlkKSBhdmFpbGFibGUuYWRkKGlkKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByb3N0ZXIgPSBBcnJheS5mcm9tKGF2YWlsYWJsZSkuc29ydCgpLmpvaW4oJywnKTtcbiAgICAgICAgaWYgKHRoaXMucHJ1bmVkUmFua1Jvc3RlciA9PT0gcm9zdGVyKSByZXR1cm47XG4gICAgICAgIHRoaXMucHJ1bmVkUmFua1Jvc3RlciA9IHJvc3RlcjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBydW5lQ29udGVzdFJhbmtzKGF2YWlsYWJsZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IGNsZWFuIHVwIG9sZCBjb250ZXN0IHJhbmsgY2hvaWNlczonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FyZENvbnRyb2xzKGxpc3Q6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdENhcmRbXSkge1xuICAgICAgICBjb25zdCBob3N0cyA9IG5ldyBTZXQoY29udGVzdHMubWFwKCh7IHRpdGxlLCBoZWFkZXIgfSkgPT4gdGl0bGUgfHwgaGVhZGVyKSk7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbCBvZiBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1waW4sIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JykpIHtcbiAgICAgICAgICAgIGlmICghY29udHJvbC5wYXJlbnRFbGVtZW50IHx8ICFob3N0cy5oYXMoY29udHJvbC5wYXJlbnRFbGVtZW50KSkgY29udHJvbC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFt0aXRsZSwgdGV4dF0gb2YgdGhpcy50aXRsZUxhYmVscykge1xuICAgICAgICAgICAgaWYgKGhvc3RzLmhhcyh0aXRsZSkgJiYgdGV4dC5wYXJlbnRFbGVtZW50ID09PSB0aXRsZSkgY29udGludWU7XG4gICAgICAgICAgICB0aGlzLnRpdGxlU2l6ZXM/LnVub2JzZXJ2ZSh0ZXh0KTtcbiAgICAgICAgICAgIGlmICh0ZXh0LnBhcmVudEVsZW1lbnQgPT09IHRpdGxlKSB0ZXh0LnJlcGxhY2VXaXRoKC4uLnRleHQuY2hpbGROb2Rlcyk7XG4gICAgICAgICAgICB0aXRsZS5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC10aXRsZScsICdqYXJ2aXMtY29udGVzdC10aXRsZS1zdGFja2VkJyk7XG4gICAgICAgICAgICB0aGlzLnRpdGxlTGFiZWxzLmRlbGV0ZSh0aXRsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IHsgaWQsIHRpdGxlLCBoZWFkZXIsIGxhYmVsIH0gb2YgY29udGVzdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGhvc3QgPSB0aXRsZSB8fCBoZWFkZXI7XG4gICAgICAgICAgICBsZXQgcGluID0gaG9zdC5xdWVyeVNlbGVjdG9yPEhUTUxCdXR0b25FbGVtZW50PignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXBpbicpO1xuICAgICAgICAgICAgaWYgKCFwaW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3QtcGluJztcbiAgICAgICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXN0SWQgPSBidXR0b24uY2xvc2VzdCgnLmNvbnRlc3RbaWRfY29udGVzdF0nKT8uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29udGVzdElkKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMucHJlZmVyZW5jZSA9PT0gY29udGVzdElkID8gJycgOiBjb250ZXN0SWQ7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCkgbHNTZXQoJ0NvbnRlc3RTdGFydElkJywgbmV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGxzUm0oJ0NvbnRlc3RTdGFydElkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByZWZlcmVuY2UgPSBuZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9wSnVtcD8uKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGNvbnRlc3QgcHJlZmVyZW5jZTonLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHBpbiA9IGhvc3QuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBpbm5lZCA9IHRoaXMucHJlZmVyZW5jZSA9PT0gaWQ7XG4gICAgICAgICAgICBwaW4uc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBTdHJpbmcocGlubmVkKSk7XG4gICAgICAgICAgICBwaW4uc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgcGlubmVkID8gYFVucGluICR7bGFiZWx9YCA6IGBQaW4gJHtsYWJlbH0gdG8gb3BlbiBvbiByZWxvYWRgKTtcbiAgICAgICAgICAgIHBpbi50aXRsZSA9IHBpbm5lZCA/ICdQaW5uZWQuIENsaWNrIHRvIHVucGluIHRoaXMgY29udGVzdC4nIDogJ09wZW4gdGhpcyBjb250ZXN0IHdoZW4gdGhlIHBhZ2UgcmVsb2Fkcyc7XG5cbiAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IGhvc3QucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJzpzY29wZSA+IC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0Jyk7XG4gICAgICAgICAgICBpZiAoIXBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hvaWNlID0gbWFrZVJhbmtDaG9pY2UoJ0NvbnRlc3QgbGVhZGVyYm9hcmQgc3RhcnQnLCByYW5rID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVzdElkID0gY2hvaWNlLmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRlc3RJZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUNvbnRlc3RSYW5rKGNvbnRlc3RJZCwgcmFuayk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGNob2ljZSwgcmFuayk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGxlYWRlcmJvYXJkIHBvc2l0aW9uOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmlnaHQgJiYgdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCB0aGlzLnJpZ2h0KSA9PT0gY29udGVzdElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3BKdW1wPy4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb25Td2l0Y2gobGlzdCwgdGhpcy5yaWdodCwgY29udGVzdElkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNob2ljZS5jbGFzc0xpc3QuYWRkKCdqYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgY2hvaWNlLnRpdGxlID0gJ0xlYWRlcmJvYXJkIHBvc2l0aW9uIGZvciB0aGlzIGNvbnRlc3QnO1xuICAgICAgICAgICAgICAgIHBpbi5hZnRlcihjaG9pY2UpO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gY2hvaWNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShwb3NpdGlvbiwgcmVhZENvbnRlc3RSYW5rKGlkLCB0aGlzLmRlZmF1bHRzLnJhbmspKTtcblxuICAgICAgICAgICAgaWYgKCF0aXRsZSkgY29udGludWU7XG4gICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMudGl0bGVMYWJlbHMuZ2V0KHRpdGxlKTtcbiAgICAgICAgICAgIGlmICghdGV4dCkge1xuICAgICAgICAgICAgICAgIHRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICAgICAgdGV4dC5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3QtdGl0bGUtbGFiZWwnO1xuICAgICAgICAgICAgICAgIHRleHQuYXBwZW5kKC4uLkFycmF5LmZyb20odGl0bGUuY2hpbGROb2RlcykuZmlsdGVyKG5vZGUgPT4gbm9kZSAhPT0gcGluICYmIG5vZGUgIT09IHBvc2l0aW9uKSk7XG4gICAgICAgICAgICAgICAgdGl0bGUucHJlcGVuZCh0ZXh0KTtcbiAgICAgICAgICAgICAgICB0aXRsZS5jbGFzc0xpc3QuYWRkKCdqYXJ2aXMtY29udGVzdC10aXRsZScpO1xuICAgICAgICAgICAgICAgIHRoaXMudGl0bGVMYWJlbHMuc2V0KHRpdGxlLCB0ZXh0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnRpdGxlU2l6ZXM/Lm9ic2VydmUodGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGV4dC50aXRsZSAhPT0gbGFiZWwpIHtcbiAgICAgICAgICAgICAgICB0ZXh0LnRpdGxlID0gbGFiZWw7XG4gICAgICAgICAgICAgICAgdGhpcy5maXRUaXRsZSh0ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpdFRpdGxlKHRleHQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGhlYWRpbmcgPSB0ZXh0LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIGlmICghaGVhZGluZz8uY2xpZW50V2lkdGgpIHJldHVybjtcblxuICAgICAgICBoZWFkaW5nLmNsYXNzTGlzdC5yZW1vdmUoJ2phcnZpcy1jb250ZXN0LXRpdGxlLXN0YWNrZWQnKTtcbiAgICAgICAgdGV4dC5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnZm9udC1zaXplJyk7XG4gICAgICAgIGNvbnN0IG1pbmltdW1SZWFkYWJsZVdpZHRoID0gNCAqIHBhcnNlRmxvYXQoZ2V0Q29tcHV0ZWRTdHlsZSh0ZXh0KS5mb250U2l6ZSk7XG4gICAgICAgIGlmICh0ZXh0LmNsaWVudFdpZHRoIDwgbWluaW11bVJlYWRhYmxlV2lkdGggJiYgdGV4dC5zY3JvbGxXaWR0aCA+IHRleHQuY2xpZW50V2lkdGgpIHtcbiAgICAgICAgICAgIGhlYWRpbmcuY2xhc3NMaXN0LmFkZCgnamFydmlzLWNvbnRlc3QtdGl0bGUtc3RhY2tlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ZXh0LnNjcm9sbFdpZHRoID4gdGV4dC5jbGllbnRXaWR0aCkgdGV4dC5zdHlsZS5mb250U2l6ZSA9ICcuOGVtJztcbiAgICB9XG5cbiAgICBnZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0OiBIVE1MRWxlbWVudCwgcmlnaHQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkID0gbGlzdC5xdWVyeVNlbGVjdG9yKCcuY29udGVzdF9oZWFkZXJfYWN0aXZlJyk/LmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk7XG4gICAgICAgIGlmIChzZWxlY3RlZCkgcmV0dXJuIHNlbGVjdGVkLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuXG4gICAgICAgIGNvbnN0IHBhbmVscyA9IEFycmF5LmZyb20ocmlnaHQucXVlcnlTZWxlY3RvckFsbCgnLnJhbmtpbmdbaWRfY29udGVzdF0nKSlcbiAgICAgICAgICAgIC5maWx0ZXIocGFuZWwgPT4gcGFuZWwuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggJiYgZ2V0Q29tcHV0ZWRTdHlsZShwYW5lbCkudmlzaWJpbGl0eSA9PT0gJ3Zpc2libGUnKTtcbiAgICAgICAgcmV0dXJuIHBhbmVscy5sZW5ndGggPT09IDEgPyBwYW5lbHNbMF0uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0JykgOiBudWxsO1xuICAgIH1cblxuICAgIHNob3dMZWFkZXJib2FyZChyaWdodDogSFRNTEVsZW1lbnQsIGNvbnRlc3RJZDogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgICBpZiAoIWNvbnRlc3RJZCkge1xuICAgICAgICAgICAgcmlnaHQucXVlcnlTZWxlY3RvckFsbCgnLmphcnZpcy1jb250ZXN0LW90aGVyJykuZm9yRWFjaChwYW5lbCA9PiBwYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1vdGhlcicpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBhbmVsIG9mIHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYW5raW5nW2lkX2NvbnRlc3RdJykpIHtcbiAgICAgICAgICAgIHBhbmVsLmNsYXNzTGlzdC50b2dnbGUoJ2phcnZpcy1jb250ZXN0LW90aGVyJywgcGFuZWwuZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0JykgIT09IGNvbnRlc3RJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRPd25Sb3coYm9hcmQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IG93biA9IGJvYXJkLnF1ZXJ5U2VsZWN0b3IoJy5sZWFkVGFibGUgdHIubGVhZF90YWJsZV9kZWZhdWx0Jyk7XG4gICAgICAgIGlmIChvd24pIHJldHVybiBvd247XG5cbiAgICAgICAgY29uc3QgaGVyb0lkID0gKHdpbmRvdy5zaGFyZWQ/Lkhlcm8gfHwgd2luZG93Lkhlcm8pPy5pbmZvcz8uaWQ7XG4gICAgICAgIGlmIChoZXJvSWQgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oYm9hcmQucXVlcnlTZWxlY3RvckFsbCgnLmxlYWRUYWJsZSB0cltzb3J0aW5nX2lkXScpKVxuICAgICAgICAgICAgLmZpbmQocm93ID0+IHJvdy5nZXRBdHRyaWJ1dGUoJ3NvcnRpbmdfaWQnKSA9PT0gU3RyaW5nKGhlcm9JZCkpO1xuICAgIH1cblxuICAgIGdldExlYWRlcmJvYXJkU2Nyb2xsZXIocmlnaHQ6IEhUTUxFbGVtZW50LCBpZDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYW5raW5nW2lkX2NvbnRlc3RdJykpXG4gICAgICAgICAgICAuZmluZChwYW5lbCA9PiBwYW5lbC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKSA9PT0gaWQpPy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmxlYWRfdGFibGVfdmlldycpO1xuICAgIH1cblxuICAgIHVwZGF0ZVNob3J0Y3V0cyhsaXN0OiBIVE1MRWxlbWVudCwgcmlnaHQ6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdENhcmRbXSkge1xuICAgICAgICBjb25zdCBjYW52YXMgPSBsaXN0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMnKTtcbiAgICAgICAgaWYgKCFjYW52YXMpIHJldHVybjtcblxuICAgICAgICBjb25zdCBzaG9ydGN1dHMgPSBjb250ZXN0cy5tYXAoKHsgaWQsIGhlYWRlciwgbGFiZWwsIGNhdGVnb3J5IH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJvYXJkID0gdGhpcy5nZXRMZWFkZXJib2FyZFNjcm9sbGVyKHJpZ2h0LCBpZCk7XG4gICAgICAgICAgICBjb25zdCByYW5rID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3IoJy5wZXJzb25hbF9yZXdhcmRzIC5yYW5rJyk/LnRleHRDb250ZW50Py50cmltKCkgfHxcbiAgICAgICAgICAgICAgICAoYm9hcmQgJiYgdGhpcy5nZXRPd25Sb3coYm9hcmQpPy5xdWVyeVNlbGVjdG9yKCd0ZCcpPy50ZXh0Q29udGVudD8udHJpbSgpKSB8fCAnJztcbiAgICAgICAgICAgIHJldHVybiB7IGlkLCBuYW1lOiBsYWJlbCwgY2F0ZWdvcnk6IGNhdGVnb3J5ID8gQ09OVEVTVF9TSE9SVF9MQUJFTFNbY2F0ZWdvcnldIDogJ0NvbnRlc3QnLCByYW5rIH07XG4gICAgICAgIH0pO1xuICAgICAgICByZW5kZXJDb250ZXN0U2hvcnRjdXRzKGNhbnZhcywgc2hvcnRjdXRzLCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSwgaWQgPT4gdGhpcy5vcGVuU2hvcnRjdXQoaWQpKTtcbiAgICB9XG5cbiAgICBvcGVuU2hvcnRjdXQoaWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCB7IGxpc3QsIHJpZ2h0IH0gPSB0aGlzO1xuICAgICAgICBpZiAoIWxpc3QgfHwgIXJpZ2h0KSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgY2FyZCA9IGxpc3QucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oYC5jb250ZXN0W2lkX2NvbnRlc3Q9XCIke0NTUy5lc2NhcGUoaWQpfVwiXWApO1xuICAgICAgICBjb25zdCBoZWFkZXIgPSBjYXJkPy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmNvbnRlc3RfaGVhZGVyJyk7XG4gICAgICAgIGlmICghY2FyZCB8fCAhaGVhZGVyIHx8IGhlYWRlci5tYXRjaGVzKCcuZW5kZWQnKSB8fCBjYXJkLm1hdGNoZXMoJy5lbmRlZCcpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgYWxyZWFkeVNlbGVjdGVkID0gdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCkgPT09IGlkO1xuICAgICAgICB0aGlzLnN0b3BKdW1wPy4oKTtcbiAgICAgICAgdGhpcy5wcmVwYXJlU3dpdGNoKGxpc3QsIHJpZ2h0LCBpZCwgY2FyZCk7XG4gICAgICAgIGlmICghYWxyZWFkeVNlbGVjdGVkKSAoaGVhZGVyLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KENPTlRFU1RfVElUTEVfU0VMRUNUT1IpIHx8IGhlYWRlcikuY2xpY2soKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcHJlcGFyZVN3aXRjaChsaXN0OiBIVE1MRWxlbWVudCwgcmlnaHQ6IEhUTUxFbGVtZW50LCBpZDogc3RyaW5nIHwgbnVsbCwgc2hvcnRjdXRDYXJkPzogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICBpZiAoaWQpIHRoaXMucG9zaXRpb25Td2l0Y2gobGlzdCwgcmlnaHQsIGlkLCBzaG9ydGN1dENhcmQpO1xuICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgbnVsbCk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgIH1cblxuICAgIGZvY3VzU2Nyb2xsUGFuZShwYW5lOiBIVE1MRWxlbWVudCwgdGFyZ2V0OiBFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGNvbnRyb2wgPSB0YXJnZXQuY2xvc2VzdChJTlRFUkFDVElWRV9DT05URU5UKTtcbiAgICAgICAgaWYgKGNvbnRyb2wgJiYgY29udHJvbCAhPT0gcGFuZSAmJiBwYW5lLmNvbnRhaW5zKGNvbnRyb2wpKSByZXR1cm47XG5cbiAgICAgICAgLy8gQ2hyb21pdW0gc2Nyb2xscyB0aGUgZm9jdXNlZCBwYW5lIG9uIEhvbWUsIEVuZCwgYW5kIHRoZSBhcnJvdyBrZXlzLlxuICAgICAgICBpZiAoIXBhbmUuaGFzQXR0cmlidXRlKCd0YWJpbmRleCcpKSB7XG4gICAgICAgICAgICBwYW5lLnRhYkluZGV4ID0gLTE7XG4gICAgICAgICAgICB0aGlzLmZvY3VzYWJsZVBhbmVzLmFkZChwYW5lKTtcbiAgICAgICAgfVxuICAgICAgICBwYW5lLmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBsb2NrU2Nyb2xsKHNjcm9sbGVyOiBIVE1MRWxlbWVudCwgZ3VhcmREZXNjZW5kYW50cyA9IGZhbHNlKSB7XG4gICAgICAgICQoc2Nyb2xsZXIpLnN0b3AodHJ1ZSwgZmFsc2UpO1xuICAgICAgICAvLyBUaGUgZ2FtZSBjYW4gc3RhcnQgYW5vdGhlciBqUXVlcnkgdHdlZW4gYWZ0ZXIgbG9hZC4gQmxvY2sgaXRzIHdyaXRlcyBvbiB0aGlzIHBhbmUgb25seS5cbiAgICAgICAgY29uc3QgaWdub3JlU2Nyb2xsID0gKCkgPT4ge307XG4gICAgICAgIGNvbnN0IGdldCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsICdzY3JvbGxUb3AnKT8uZ2V0O1xuICAgICAgICBjb25zdCBkZXNjcmlwdG9ycyA9IE9iamVjdC5lbnRyaWVzKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogeyBnZXQsIHNldDogaWdub3JlU2Nyb2xsIH0sXG4gICAgICAgICAgICBzY3JvbGw6IHsgdmFsdWU6IGlnbm9yZVNjcm9sbCwgd3JpdGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHNjcm9sbFRvOiB7IHZhbHVlOiBpZ25vcmVTY3JvbGwsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICBzY3JvbGxCeTogeyB2YWx1ZTogaWdub3JlU2Nyb2xsLCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICAgIH0pLmZpbHRlcigoW2tleV0pID0+ICFPYmplY3QuaGFzT3duKHNjcm9sbGVyLCBrZXkpKTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCBkZXNjcmlwdG9yXSBvZiBkZXNjcmlwdG9ycykge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNjcm9sbGVyLCBrZXksIHsgLi4uZGVzY3JpcHRvciwgY29uZmlndXJhYmxlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlbGVhc2VEZXNjZW5kYW50cyA9IGd1YXJkRGVzY2VuZGFudHMgPyBndWFyZFNjcm9sbEludG9WaWV3KHNjcm9sbGVyKSA6IHVuZGVmaW5lZDtcblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgJChzY3JvbGxlcikuc3RvcCh0cnVlLCBmYWxzZSk7XG4gICAgICAgICAgICByZWxlYXNlRGVzY2VuZGFudHM/LigpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCBkZXNjcmlwdG9yXSBvZiBkZXNjcmlwdG9ycykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNjcm9sbGVyLCBrZXkpO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICYmIGN1cnJlbnQudmFsdWUgPT09IGRlc2NyaXB0b3IudmFsdWUgJiYgY3VycmVudC5zZXQgPT09IGRlc2NyaXB0b3Iuc2V0KSBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHNjcm9sbGVyLCBrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGp1bXBUbyhzY3JvbGxlcjogSFRNTEVsZW1lbnQsIHRhcmdldDogRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQsIGNlbnRlciA9IGZhbHNlKSB7XG4gICAgICAgIGxldCB0b3AgPSAwO1xuICAgICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgICAgICBjb25zdCBib3VuZHMgPSBzY3JvbGxlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gYm91bmRzLmhlaWdodCAvIHNjcm9sbGVyLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgIGlmICghc2NhbGUpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIHRvcCA9IHNjcm9sbGVyLnNjcm9sbFRvcCArIChpdGVtLnRvcCAtIGJvdW5kcy50b3ApIC8gc2NhbGUgLSBzY3JvbGxlci5jbGllbnRUb3A7XG4gICAgICAgICAgICBpZiAoY2VudGVyKSB0b3AgLT0gKHNjcm9sbGVyLmNsaWVudEhlaWdodCAtIGl0ZW0uaGVpZ2h0IC8gc2NhbGUpIC8gMjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNjcm9sbEluc3RhbnRseShzY3JvbGxlciwgdG9wKTtcbiAgICB9XG5cbiAgICBzY3JvbGxJbnN0YW50bHkoc2Nyb2xsZXI6IEhUTUxFbGVtZW50LCBwb3NpdGlvbjogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHRvcCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHNjcm9sbGVyLnNjcm9sbEhlaWdodCAtIHNjcm9sbGVyLmNsaWVudEhlaWdodCwgcG9zaXRpb24pKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKHRvcCAtIHNjcm9sbGVyLnNjcm9sbFRvcCkgPj0gMSkge1xuICAgICAgICAgICAgY29uc3Qgc2Nyb2xsVG8gPSBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxUbyBhcyAob3B0aW9uczogU2Nyb2xsVG9PcHRpb25zKSA9PiB2b2lkO1xuICAgICAgICAgICAgc2Nyb2xsVG8uY2FsbChzY3JvbGxlciwgeyB0b3AsIGJlaGF2aW9yOiAnaW5zdGFudCcgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwb3NpdGlvblN3aXRjaChsaXN0OiBIVE1MRWxlbWVudCwgcmlnaHQ6IEhUTUxFbGVtZW50LCBpZDogc3RyaW5nLCBzaG9ydGN1dENhcmQ/OiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLnN3aXRjaFNjcm9sbD8uc3RvcCgpO1xuXG4gICAgICAgIGNvbnN0IGxpc3RUb3AgPSBsaXN0LnNjcm9sbFRvcDtcbiAgICAgICAgY29uc3QgYXRPd25SYW5rID0gcmVhZENvbnRlc3RSYW5rKGlkLCB0aGlzLmRlZmF1bHRzLnJhbmspID09PSAnbWluZSc7XG4gICAgICAgIGNvbnN0IHJlbGVhc2VMaXN0ID0gdGhpcy5zdG9wU3dpdGNoU2Nyb2xsIHx8IHNob3J0Y3V0Q2FyZCA/IHRoaXMubG9ja1Njcm9sbChsaXN0LCB0cnVlKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IG1hbnVhbExpc3QgPSBmYWxzZTtcbiAgICAgICAgbGV0IG1hbnVhbEJvYXJkID0gZmFsc2U7XG4gICAgICAgIGxldCBib2FyZDogSFRNTEVsZW1lbnQgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgICAgICBsZXQgcmVsZWFzZUJvYXJkOiAoKCkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHJlc3RvcmUgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5nZXRMZWFkZXJib2FyZFNjcm9sbGVyKHJpZ2h0LCBpZCk7XG4gICAgICAgICAgICBpZiAobmV4dCAhPT0gYm9hcmQpIHtcbiAgICAgICAgICAgICAgICByZWxlYXNlQm9hcmQ/LigpO1xuICAgICAgICAgICAgICAgIGJvYXJkID0gbmV4dDtcbiAgICAgICAgICAgICAgICByZWxlYXNlQm9hcmQgPSBib2FyZCA/IHRoaXMubG9ja1Njcm9sbChib2FyZCwgdHJ1ZSkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgbWFudWFsQm9hcmQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghbWFudWFsTGlzdCAmJiByZWxlYXNlTGlzdCkge1xuICAgICAgICAgICAgICAgIGlmIChzaG9ydGN1dENhcmQgJiYgbGlzdC5jb250YWlucyhzaG9ydGN1dENhcmQpKSB0aGlzLmp1bXBUbyhsaXN0LCBzaG9ydGN1dENhcmQpO1xuICAgICAgICAgICAgICAgIGVsc2UgdGhpcy5zY3JvbGxJbnN0YW50bHkobGlzdCwgbGlzdFRvcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW1hbnVhbEJvYXJkICYmIGJvYXJkPy5jbGllbnRIZWlnaHQgJiYgdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCkgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5qdW1wVG8oYm9hcmQsIGF0T3duUmFuayA/IHRoaXMuZ2V0T3duUm93KGJvYXJkKSA6IG51bGwsIGF0T3duUmFuayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUsIHNpZ25hbDogaGFuZGxlcnMuc2lnbmFsIH07XG4gICAgICAgIGNvbnN0IHN0b3AgPSAoKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgaGFuZGxlcnMuYWJvcnQoKTtcbiAgICAgICAgICAgIHJlbGVhc2VMaXN0Py4oKTtcbiAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICB0aGlzLnN3aXRjaFNjcm9sbCA9IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dChzdG9wLCA0MDAwKTtcbiAgICAgICAgY29uc3Qgb25TY3JvbGwgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoKHJlbGVhc2VMaXN0ICYmIGV2ZW50LnRhcmdldCA9PT0gbGlzdCkgfHwgZXZlbnQudGFyZ2V0ID09PSBib2FyZCkgcmVzdG9yZSgpO1xuICAgICAgICB9O1xuICAgICAgICAvLyBMZXQgdXNlciBpbnB1dCBtb3ZlIGl0cyBwYW5lIHdpdGhvdXQgYWxsb3dpbmcgYSBkZWxheWVkIGdhbWUgYW5pbWF0aW9uIHRvIHRha2Ugb3Zlci5cbiAgICAgICAgY29uc3Qgb25NYW51YWxJbnB1dCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmICghZXZlbnQuaXNUcnVzdGVkIHx8ICEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkpIHJldHVybjtcbiAgICAgICAgICAgIGlmIChsaXN0LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIG1hbnVhbExpc3QgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGJvYXJkPy5jb250YWlucyhldmVudC50YXJnZXQpICYmIHRoaXMuZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdCwgcmlnaHQpID09PSBpZCkgbWFudWFsQm9hcmQgPSB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgcGFuZS5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgWyd3aGVlbCcsICd0b3VjaG1vdmUnLCAncG9pbnRlcmRvd24nXSkgcGFuZS5hZGRFdmVudExpc3RlbmVyKHR5cGUsIG9uTWFudWFsSW5wdXQsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoWydBcnJvd1VwJywgJ0Fycm93RG93bicsICdQYWdlVXAnLCAnUGFnZURvd24nLCAnSG9tZScsICdFbmQnLCAnICddLmluY2x1ZGVzKGV2ZW50LmtleSkpIG9uTWFudWFsSW5wdXQoZXZlbnQpO1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5zd2l0Y2hTY3JvbGwgPSB7IHJlc3RvcmUsIHN0b3AgfTtcbiAgICAgICAgcmVzdG9yZSgpO1xuICAgIH1cblxuICAgIG9wZW5Db250ZXN0KGxpc3Q6IEhUTUxFbGVtZW50LCByaWdodDogSFRNTEVsZW1lbnQsIHsgaWQsIGNhcmQsIGhlYWRlciwgdGl0bGUgfTogQ29udGVzdENhcmQpIHtcbiAgICAgICAgZm9yIChjb25zdCBwYW5lIG9mIFtsaXN0LCByaWdodF0pIHBhbmUuY2xhc3NMaXN0LmFkZCgnamFydmlzLWNvbnRlc3QtaW5zdGFudCcsICdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgIGNvbnN0IHJhbmsgPSByZWFkQ29udGVzdFJhbmsoaWQsIHRoaXMuZGVmYXVsdHMucmFuayk7XG4gICAgICAgIGNvbnN0IHBsYWNlQXRPd25SYW5rID0gcmFuayA9PT0gJ21pbmUnO1xuICAgICAgICBjb25zdCByZWxlYXNlTGlzdCA9IHRoaXMubG9ja1Njcm9sbChsaXN0KTtcbiAgICAgICAgbGV0IGJvYXJkOiBIVE1MRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCByZWxlYXNlQm9hcmQ6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHBvc2l0aW9uZWQgPSBmYWxzZTtcbiAgICAgICAgbGV0IGxhc3RBdHRlbXB0OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgIGNvbnN0IHVwZGF0ZUJvYXJkID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuZ2V0TGVhZGVyYm9hcmRTY3JvbGxlcihyaWdodCwgaWQpO1xuICAgICAgICAgICAgaWYgKGJvYXJkID09PSBuZXh0KSByZXR1cm47XG4gICAgICAgICAgICByZWxlYXNlQm9hcmQ/LigpO1xuICAgICAgICAgICAgYm9hcmQgPSBuZXh0O1xuICAgICAgICAgICAgcmVsZWFzZUJvYXJkID0gYm9hcmQgPyB0aGlzLmxvY2tTY3JvbGwoYm9hcmQpIDogdW5kZWZpbmVkO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXZlYWwgPSAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkgcGFuZS5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdG9yZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghbGlzdC5pc0Nvbm5lY3RlZCB8fCAhcmlnaHQuaXNDb25uZWN0ZWQgfHwgIWxpc3QuY29udGFpbnMoY2FyZCkpIHJldHVybjtcblxuICAgICAgICAgICAgdXBkYXRlQm9hcmQoKTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCk7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQgIT09IGlkICYmIHNlbGVjdGVkICE9PSBsYXN0QXR0ZW1wdCkge1xuICAgICAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIG51bGwpO1xuICAgICAgICAgICAgICAgICh0aXRsZSB8fCBoZWFkZXIpLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgdXBkYXRlQm9hcmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghYm9hcmQ/LmNsaWVudEhlaWdodCB8fCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSAhPT0gaWQgfHxcbiAgICAgICAgICAgICAgICAocGxhY2VBdE93blJhbmsgJiYgIWJvYXJkLnF1ZXJ5U2VsZWN0b3IoJy5sZWFkVGFibGUnKSkpIHJldHVybjtcbiAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIGlkKTtcbiAgICAgICAgICAgIHRoaXMuanVtcFRvKGxpc3QsIGNhcmQpO1xuICAgICAgICAgICAgdGhpcy5qdW1wVG8oYm9hcmQsIHBsYWNlQXRPd25SYW5rID8gdGhpcy5nZXRPd25Sb3coYm9hcmQpIDogbnVsbCwgcGxhY2VBdE93blJhbmspO1xuICAgICAgICAgICAgaWYgKCFwb3NpdGlvbmVkKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICByZXZlYWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb3JyZWN0IGJyb3dzZXItZHJpdmVuIG1vdmVzLCBzdWNoIGFzIHNjcm9sbEludG9WaWV3IG9uIGEgbGVhZGVyYm9hcmQgcm93LCBiZWZvcmUgcGFpbnQuXG4gICAgICAgIGNvbnN0IG9uU2Nyb2xsID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gbGlzdCB8fCBldmVudC50YXJnZXQgPT09IGJvYXJkKSByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGlucHV0RXZlbnRzID0gWydwb2ludGVyZG93bicsICd0b3VjaHN0YXJ0JywgJ3doZWVsJywgJ2NsaWNrJ107XG4gICAgICAgIGNvbnN0IG9uSW5wdXQgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkKSBzdG9wKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0b3BPbktleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmlzVHJ1c3RlZCAmJiBbJ1RhYicsICdBcnJvd1VwJywgJ0Fycm93RG93bicsICdQYWdlVXAnLCAnUGFnZURvd24nLCAnSG9tZScsICdFbmQnLCAnRW50ZXInLCAnICddLmluY2x1ZGVzKGV2ZW50LmtleSkpIHN0b3AoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgYWZ0ZXJMb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0b3AgPSAoZmluaXNoID0gdHJ1ZSkgPT4ge1xuICAgICAgICAgICAgcmVsZWFzZUxpc3QoKTtcbiAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgICAgIHBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25TY3JvbGwsIHRydWUpO1xuICAgICAgICAgICAgICAgIHBhbmUuY2xhc3NMaXN0LnJlbW92ZSgnamFydmlzLWNvbnRlc3QtaW5zdGFudCcsICdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIGlucHV0RXZlbnRzKSBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBvbklucHV0LCB0cnVlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBzdG9wT25LZXksIHRydWUpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBhZnRlckxvYWQpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgIHRoaXMuc3RvcEp1bXAgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZXBvc2l0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucmVzdG9yaW5nQ2FyZCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoZmluaXNoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldmVhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoc3RvcCwgNDAwMCk7XG4gICAgICAgIHRoaXMuc3RvcEp1bXAgPSBzdG9wO1xuICAgICAgICB0aGlzLnJlcG9zaXRpb24gPSByZXN0b3JlO1xuICAgICAgICB0aGlzLnJlc3RvcmluZ0NhcmQgPSBjYXJkO1xuICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgcGFuZS5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCwgeyBwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgaW5wdXRFdmVudHMpIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uSW5wdXQsIHsgcGFzc2l2ZTogdHJ1ZSwgY2FwdHVyZTogdHJ1ZSB9KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHN0b3BPbktleSwgdHJ1ZSk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFmdGVyTG9hZCwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICByZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEnKTtcbiAgICAgICAgY29uc3QgcmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignI2NvbnRlc3RzIC5yaWdodF9wYXJ0Jyk7XG4gICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiB0aGlzLmZvY3VzYWJsZVBhbmVzKSB7XG4gICAgICAgICAgICBpZiAocGFuZSA9PT0gbGlzdCB8fCByaWdodD8uY29udGFpbnMocGFuZSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKHBhbmUudGFiSW5kZXggPT09IC0xKSBwYW5lLnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICAgICAgICAgIHRoaXMuZm9jdXNhYmxlUGFuZXMuZGVsZXRlKHBhbmUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxpc3QgIT09IGxpc3QgfHwgdGhpcy5yaWdodCAhPT0gcmlnaHQpIHRoaXMuc3dpdGNoU2Nyb2xsPy5zdG9wKCk7XG4gICAgICAgIGlmICh0aGlzLnN0b3BKdW1wICYmICh0aGlzLmxpc3QgIT09IGxpc3QgfHwgdGhpcy5yaWdodCAhPT0gcmlnaHQgfHwgIWxpc3Q/LmNvbnRhaW5zKHRoaXMucmVzdG9yaW5nQ2FyZCkpKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BKdW1wKGZhbHNlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0KSB0aGlzLnNob3dMZWFkZXJib2FyZCh0aGlzLnJpZ2h0LCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxpc3QgPSBsaXN0O1xuICAgICAgICB0aGlzLnJpZ2h0ID0gcmlnaHQ7XG4gICAgICAgIGlmICghbGlzdCB8fCAhcmlnaHQgfHwgIWxpc3QuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggfHwgZ2V0Q29tcHV0ZWRTdHlsZShsaXN0KS52aXNpYmlsaXR5ICE9PSAndmlzaWJsZScpIHJldHVybjtcblxuICAgICAgICBjb25zdCBmaW5pc2hlZCA9IG5ldyBTZXQoT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmZpbmlzaGVkIHx8IHt9KVxuICAgICAgICAgICAgLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbCkubWFwKGNvbnRlc3QgPT4gU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCkpKTtcbiAgICAgICAgZm9yIChjb25zdCBlbmRlZCBvZiBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZXN0LmVuZGVkLCAuY29udGVzdF9oZWFkZXIuZW5kZWQnKSkge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBlbmRlZC5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmIChpZCkgZmluaXNoZWQuYWRkKGlkKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjYXJkcyA9IHRoaXMuZ2V0Q29udGVzdHMobGlzdCwgZmluaXNoZWQpO1xuICAgICAgICBjb25zdCBjb250ZXN0cyA9IGNhcmRzLmZpbHRlcihjYXJkID0+ICFjYXJkLmVuZGVkKTtcbiAgICAgICAgdGhpcy5wcnVuZVVuYXZhaWxhYmxlUmFua3MobGlzdCwgZmluaXNoZWQpO1xuICAgICAgICB0aGlzLmNsZWFyRXhwaXJlZFBpbihsaXN0LCBjb250ZXN0cywgZmluaXNoZWQpO1xuICAgICAgICB0aGlzLnVwZGF0ZUNhcmRDb250cm9scyhsaXN0LCBjb250ZXN0cyk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVwb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy5yZXBvc2l0aW9uKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGFydHVwUGVuZGluZykge1xuICAgICAgICAgICAgbGV0IHRhcmdldCA9IHRoaXMuZ2V0VGFyZ2V0KGNvbnRlc3RzKTtcbiAgICAgICAgICAgIGlmICghY29udGVzdHMubGVuZ3RoICYmICF0aGlzLnByZWZlcmVuY2UgJiYgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCk7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gY2FyZHMuZmluZChjYXJkID0+IGNhcmQuaWQgPT09IHNlbGVjdGVkKSA/PyBjYXJkcy5hdCgtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFyZ2V0KSB0aGlzLm9wZW5Db250ZXN0KGxpc3QsIHJpZ2h0LCB0YXJnZXQpO1xuICAgICAgICAgICAgZWxzZSBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyAmJiAhdGhpcy5wcmVmZXJlbmNlKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCkpO1xuICAgICAgICAgICAgdGhpcy5zd2l0Y2hTY3JvbGw/LnJlc3RvcmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZVNob3J0Y3V0cyhsaXN0LCByaWdodCwgY29udGVzdHMpO1xuICAgIH1cblxuICAgIHJ1bih7IG5vU3dpdGNoU2Nyb2xsID0gdHJ1ZSB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgY29uc3QgcGluID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICB0aGlzLnByZWZlcmVuY2UgPSAoKHR5cGVvZiBwaW4gPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBwaW4gPT09ICdudW1iZXInKSAmJiBwaW4pID8gU3RyaW5nKHBpbikgOiAnJztcbiAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuc3RvcFN3aXRjaFNjcm9sbCA9IG5vU3dpdGNoU2Nyb2xsO1xuICAgICAgICB0aGlzLmRlZmF1bHRzID0gcmVhZENvbnRlc3REZWZhdWx0cygpO1xuICAgICAgICB0aGlzLnBydW5lZFJhbmtSb3N0ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3QgeyBzaWduYWwgfSA9IHRoaXMubGlzdGVuZXJzO1xuICAgICAgICB0aGlzLnRpdGxlU2l6ZXMgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoZW50cmllcyA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgdGFyZ2V0IH0gb2YgZW50cmllcykgdGhpcy5maXRUaXRsZSh0YXJnZXQgYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKG11dGF0aW9ucyA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlc3RzIC5sZWZ0X3BhcnQgLnNjcm9sbF9hcmVhJyk7XG4gICAgICAgICAgICBjb25zdCByaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZXN0cyAucmlnaHRfcGFydCcpO1xuICAgICAgICAgICAgaWYgKGxpc3QgIT09IHRoaXMubGlzdCB8fCByaWdodCAhPT0gdGhpcy5yaWdodCB8fCBtdXRhdGlvbnMuc29tZSgoeyB0YXJnZXQgfSkgPT5cbiAgICAgICAgICAgICAgICAobGlzdCAmJiAobGlzdC5jb250YWlucyh0YXJnZXQpIHx8IHRhcmdldC5jb250YWlucyhsaXN0KSkpIHx8XG4gICAgICAgICAgICAgICAgKHJpZ2h0ICYmIChyaWdodC5jb250YWlucyh0YXJnZXQpIHx8IHRhcmdldC5jb250YWlucyhyaWdodCkpKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogdHJ1ZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcycsICdzdHlsZScsICdoaWRkZW4nLCAnaWRfY29udGVzdCddIH0pO1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB0aGlzLnJlZnJlc2goKSwgeyBvbmNlOiB0cnVlLCBzaWduYWwgfSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYW52YXMgPSB0aGlzLmxpc3Q/LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMnKTtcbiAgICAgICAgICAgIGNvbnN0IGJhciA9IGNhbnZhcz8ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJzpzY29wZSA+IC5qYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMnKTtcbiAgICAgICAgICAgIGlmIChjYW52YXMgJiYgYmFyKSBwb3NpdGlvbkNvbnRlc3RTaG9ydGN1dHMoY2FudmFzLCBiYXIpO1xuICAgICAgICB9LCB7IHNpZ25hbCB9KTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgdGFyZ2V0IH0gPSBldmVudDtcbiAgICAgICAgICAgIGlmICghZXZlbnQuaXNUcnVzdGVkIHx8ICEodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkgfHwgIXRoaXMucmlnaHQgfHwgIXRoaXMubGlzdCkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmxpc3QuY29udGFpbnModGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvYXJkID0gdGFyZ2V0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCcubGVhZF90YWJsZV92aWV3Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGJvYXJkICYmIHRoaXMucmlnaHQuY29udGFpbnMoYm9hcmQpKSB0aGlzLmZvY3VzU2Nyb2xsUGFuZShib2FyZCwgdGFyZ2V0KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IHRhcmdldC5jbG9zZXN0KCcuY29udGVzdF9oZWFkZXInKTtcbiAgICAgICAgICAgIGlmICghaGVhZGVyIHx8IHRhcmdldC5jbG9zZXN0KCcuamFydmlzLWNvbnRlc3QtcGluLCAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmZvY3VzU2Nyb2xsUGFuZSh0aGlzLmxpc3QsIHRhcmdldCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGlkID0gaGVhZGVyLmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgdGhpcy5wcmVwYXJlU3dpdGNoKHRoaXMubGlzdCwgdGhpcy5yaWdodCwgaWQgPz8gbnVsbCk7XG4gICAgICAgIH0sIHsgY2FwdHVyZTogdHJ1ZSwgc2lnbmFsIH0pO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxuXG4gICAgdXBkYXRlU3ViU2V0dGluZyhrZXk6IHN0cmluZywgdmFsdWU6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKGtleSAhPT0gJ25vU3dpdGNoU2Nyb2xsJykgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0b3BTd2l0Y2hTY3JvbGwgPSB2YWx1ZTtcbiAgICAgICAgaWYgKCF2YWx1ZSkgdGhpcy5zd2l0Y2hTY3JvbGw/LnN0b3AoKTtcbiAgICB9XG5cbiAgICB0ZWFyRG93bigpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlcj8uZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLnRpdGxlU2l6ZXM/LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnM/LmFib3J0KCk7XG4gICAgICAgIHRoaXMuc3RvcEp1bXA/LigpO1xuICAgICAgICB0aGlzLnN3aXRjaFNjcm9sbD8uc3RvcCgpO1xuICAgICAgICB0aGlzLnN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiB0aGlzLmZvY3VzYWJsZVBhbmVzKSB7XG4gICAgICAgICAgICBpZiAocGFuZS50YWJJbmRleCA9PT0gLTEpIHBhbmUucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZm9jdXNhYmxlUGFuZXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5saXN0Py5jbG9zZXN0KCcjY29udGVzdHMnKT8ucXVlcnlTZWxlY3RvcignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cycpPy5yZW1vdmUoKTtcbiAgICAgICAgaWYgKHRoaXMubGlzdCkgdGhpcy51cGRhdGVDYXJkQ29udHJvbHModGhpcy5saXN0LCBbXSk7XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0KSB0aGlzLnNob3dMZWFkZXJib2FyZCh0aGlzLnJpZ2h0LCBudWxsKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gZmFsc2U7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuZXhwb3J0IGNsYXNzIExlYWd1ZVRvcDIwIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xlYWd1ZVRvcDIwJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlByb21vdGlvbiB0YXJnZXRcIiwgXCJTaG93IHRoZSBwb2ludHMgbmVlZGVkIHRvIHJlYWNoIHRoZSBsYXJnZXIgb2YgdGhlIHRvcCAyMCBvciB0b3AgMTUlIGJlbG93IHRoZSBoaWdoZXN0IGxlYWd1ZSB0aWVyLlwiKVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZXMuaHRtbCcpO1xuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoJy5zY3JpcHRMZWFndWVJbmZvJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY3JpcHRMZWFndWVJbmZvJyk7XG4gICAgICAgICAgICBpZiAoIXN1bW1hcnkgfHwgc3VtbWFyeS5xdWVyeVNlbGVjdG9yKCcuamFydmlzVG9wMjAnKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCB7IG9wcG9uZW50c19saXN0LCBjdXJyZW50X3RpZXJfbnVtYmVyLCBtYXhfbGVhZ3VlIH0gPSB3aW5kb3c7XG4gICAgICAgICAgICBjb25zdCB0aWVyID0gTnVtYmVyKGN1cnJlbnRfdGllcl9udW1iZXIpO1xuICAgICAgICAgICAgaWYgKCEodGllciA+IDAgJiYgdGllciA8IE51bWJlcihtYXhfbGVhZ3VlKSkpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGhlcm9JZCA9ICh3aW5kb3cuc2hhcmVkPy5IZXJvIHx8IHdpbmRvdy5IZXJvKT8uaW5mb3M/LmlkO1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG9wcG9uZW50c19saXN0KSB8fCBoZXJvSWQgPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBvcHBvbmVudHNfbGlzdC5maW5kKCh7IHBsYXllciB9KSA9PiBTdHJpbmcocGxheWVyPy5pZF9maWdodGVyKSA9PT0gU3RyaW5nKGhlcm9JZCkpO1xuICAgICAgICAgICAgY29uc3QgcmFuayA9IE51bWJlcihwbGF5ZXI/LnBsYWNlKTtcbiAgICAgICAgICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihyYW5rKSB8fCByYW5rIDwgMSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBicmFja2V0U2l6ZSA9IG9wcG9uZW50c19saXN0Lmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IHByb21vdGlvblJhbmsgPSBNYXRoLm1heCgyMCwgTWF0aC5jZWlsKGJyYWNrZXRTaXplICogMTUgLyAxMDApKTtcbiAgICAgICAgICAgIGNvbnN0IGluUHJvbW90aW9uID0gcmFuayA8PSBwcm9tb3Rpb25SYW5rO1xuICAgICAgICAgICAgY29uc3QgY29tcGFyaXNvblJhbmsgPSBpblByb21vdGlvbiA/IHByb21vdGlvblJhbmsgKyAxIDogcHJvbW90aW9uUmFuaztcbiAgICAgICAgICAgIGNvbnN0IGN1dG9mZiA9IG9wcG9uZW50c19saXN0LmZpbmQoKHsgcGxhY2UgfSkgPT4gTnVtYmVyKHBsYWNlKSA9PT0gY29tcGFyaXNvblJhbmspO1xuICAgICAgICAgICAgaWYgKHBsYXllcj8ucGxheWVyX2xlYWd1ZV9wb2ludHMgPT0gbnVsbCB8fCBjdXRvZmY/LnBsYXllcl9sZWFndWVfcG9pbnRzID09IG51bGwpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3Qgc2NvcmUgPSBOdW1iZXIocGxheWVyLnBsYXllcl9sZWFndWVfcG9pbnRzKTtcbiAgICAgICAgICAgIGNvbnN0IGN1dG9mZlNjb3JlID0gTnVtYmVyKGN1dG9mZi5wbGF5ZXJfbGVhZ3VlX3BvaW50cyk7XG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShzY29yZSkgfHwgIU51bWJlci5pc0Zpbml0ZShjdXRvZmZTY29yZSkpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgZm9ybWF0ID0gbmV3IEludGwuTnVtYmVyRm9ybWF0KCk7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBpblByb21vdGlvbiA/IGN1dG9mZlNjb3JlIDogY3V0b2ZmU2NvcmUgKyAxO1xuICAgICAgICAgICAgY29uc3QgZGlmZmVyZW5jZSA9IGluUHJvbW90aW9uID8gc2NvcmUgLSB0YXJnZXQgOiB0YXJnZXQgLSBzY29yZTtcbiAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSBgVG9wICR7cHJvbW90aW9uUmFua30gaXMgdGhlIHByb21vdGlvbiB0YXJnZXQuIFRoZSBjdXRvZmYgaXMgdGhlIGxhcmdlciBvZiAyMCBwbGFjZXMgb3IgMTUlIG9mICR7Zm9ybWF0LmZvcm1hdChicmFja2V0U2l6ZSl9IHBsYXllcnMsIHJvdW5kZWQgdXAuYDtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmlzb24gPSBpblByb21vdGlvblxuICAgICAgICAgICAgICAgID8gYFJhbmsgJHtjb21wYXJpc29uUmFua30gaGFzICR7Zm9ybWF0LmZvcm1hdCh0YXJnZXQpfSBwb2ludHMuIFlvdXIgbGVhZCBpcyAke2Zvcm1hdC5mb3JtYXQoZGlmZmVyZW5jZSl9IHBvaW50cy5gXG4gICAgICAgICAgICAgICAgOiBgWW91IG5lZWQgJHtmb3JtYXQuZm9ybWF0KHRhcmdldCl9IHBvaW50cyB0byBwYXNzIHJhbmsgJHtjb21wYXJpc29uUmFua30uYDtcbiAgICAgICAgICAgIGNvbnN0IHRvb2x0aXAgPSBgJHtydWxlfSAke2NvbXBhcmlzb259YDtcblxuICAgICAgICAgICAgY29uc3QgZW50cnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICBlbnRyeS5jbGFzc05hbWUgPSAnamFydmlzVG9wMjAnO1xuICAgICAgICAgICAgZW50cnkuc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIHRvb2x0aXApO1xuICAgICAgICAgICAgZW50cnkuc2V0QXR0cmlidXRlKCd0b29sdGlwJywgJycpO1xuICAgICAgICAgICAgZW50cnkuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgdG9vbHRpcCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGJhZGdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgYmFkZ2UuY2xhc3NOYW1lID0gJ3NjcmlwdExlYWd1ZUluZm9JY29uJztcbiAgICAgICAgICAgIGJhZGdlLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjMzc2OWJhJztcbiAgICAgICAgICAgIGJhZGdlLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgICAgICAgICAgYmFkZ2UudGV4dENvbnRlbnQgPSBTdHJpbmcocHJvbW90aW9uUmFuayk7XG4gICAgICAgICAgICBlbnRyeS5hcHBlbmQoYmFkZ2UsIGAke2RpZmZlcmVuY2UgPT09IDAgPyAnJyA6IGluUHJvbW90aW9uID8gJy0nIDogJysnfSR7Zm9ybWF0LmZvcm1hdChNYXRoLmFicyhkaWZmZXJlbmNlKSl9YCk7XG4gICAgICAgICAgICBzdW1tYXJ5Lmluc2VydEJlZm9yZShlbnRyeSwgc3VtbWFyeS5xdWVyeVNlbGVjdG9yKCcubWluVG9wMzAsIC5wcm9tb3Rpb25JbmZvJykpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuZXhwb3J0IGNsYXNzIFJlbW92ZVBhc3NMb2NrIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc2VsZWN0b3JUb0ZpbmQgPSAnLmxvY2tfeWVsbG93X2ljbic7XG4gICAgcHJpdmF0ZSByZWFkb25seSBjbGFzc1RvUmVtb3ZlID0gJ2xvY2tfeWVsbG93X2ljbic7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdyZW1vdmVQYXNzTG9jaydcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUGFzcyBsb2NrIGljb25zXCIsIFwiSGlkZSBsb2NrIGljb25zIG9uIHJld2FyZCBwYXNzZXMgc28gdGhlIHJld2FyZHMgYXJlIGVhc2llciB0byByZWFkLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ3BvdicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUGF0aCBvZiBWYWxvclwiLCBcIkhpZGUgbG9jayBpY29ucyBvbiB0aGUgUGF0aCBvZiBWYWxvciBwYXNzZXMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdwb2cnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlBhdGggb2YgR2xvcnlcIiwgXCJIaWRlIGxvY2sgaWNvbnMgb24gdGhlIFBhdGggb2YgR2xvcnkgcGFzc2VzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtdmFsb3IuaHRtbCcpIHx8IGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi1nbG9yeS5odG1sJylcbiAgICB9XG5cbiAgICBvYnNlcnZlVW50aWwoc2VsZWN0b3I6IHN0cmluZywgY2FsbGJhY2s6IChlbGVtZW50czogTm9kZUxpc3RPZjxFbGVtZW50PikgPT4gdm9pZCwgeyBvbmNlID0gdHJ1ZSwgdGltZW91dCA9IDUwMDAgfSA9IHt9KSB7XG4gICAgICAgIGxldCB0aW1lcjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICBpZiAoZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlbGVtZW50cyk7XG4gICAgICAgICAgICBpZiAob25jZSkgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChvbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVyKSBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlbGVtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUgfSk7XG5cbiAgICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZSh0aW1lb3V0KSAmJiB0aW1lb3V0ID4gMCkge1xuICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yOiBzdHJpbmcsIGNsYXNzVG9SZW1vdmU6IHN0cmluZywgeyBvbmNlID0gdHJ1ZSwgdGltZW91dCA9IDUwMDAgfSA9IHt9KSB7XG4gICAgICAgIHRoaXMub2JzZXJ2ZVVudGlsKHNlbGVjdG9yLCAoZWxlbWVudHMpID0+IHtcbiAgICAgICAgICAgIGVsZW1lbnRzLmZvckVhY2goZWwgPT4gZWwuY2xhc3NMaXN0LnJlbW92ZShjbGFzc1RvUmVtb3ZlKSk7XG4gICAgICAgIH0sIHsgdGltZW91dCwgb25jZSB9KTtcbiAgICB9XG5cbiAgICBydW4oeyBwb3YsIHBvZyB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi12YWxvci5odG1sJykgJiYgcG92KSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKHRoaXMuc2VsZWN0b3JUb0ZpbmQsIHRoaXMuY2xhc3NUb1JlbW92ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLWdsb3J5Lmh0bWwnKSAmJiBwb2cpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUodGhpcy5zZWxlY3RvclRvRmluZCwgdGhpcy5jbGFzc1RvUmVtb3ZlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0R2lybERpY3Rpb25hcnkoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZ2V0R2lybERpY3Rpb25hcnkoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IGxvYWQgdGhlIEhIKysgZ2lybCBkaWN0aW9uYXJ5OicsIGVycik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgZ2V0R2lybERpY3Rpb25hcnkgfSBmcm9tICcuL2dhbWVEYXRhJztcblxuZXhwb3J0IGNsYXNzIExvdmVSYWlkc0FkZG9uIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcmFyaXR5Q29sb3JzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnbG92ZVJhaWRzQWRkb24nXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkxvdmUgUmFpZHMgZGlzcGxheVwiLCBcIkN1c3RvbWl6ZSBuYW1lcywgaWNvbnMsIGFuZCBwb3NlcyBvbiBMb3ZlIFJhaWQgY2FyZHMuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAncmFpZF9pZCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUmFpZCBJRHNcIiwgXCJBZGQgdGhlIHJhaWQgSUQgYmVmb3JlIGl0cyBuYW1lLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ25hbWVzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJIaWRkZW4gZ2lybCBuYW1lc1wiLCBcIlNob3cgdGhlIG5hbWUgb24gY2FyZHMgdGhhdCB1c2UgYSBteXN0ZXJpb3VzIGdpcmwgbGFiZWwuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdza2luJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJTa2luIGluZGljYXRvclwiLCBcIk1hcmsgY2FyZHMgdGhhdCBpbmNsdWRlIGEgZ2lybCB3aXRoIGEgc2tpbi5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2NvbG9yJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJSYXJpdHkgY29sb3JzXCIsIFwiQ29sb3IgdGhlIHJhaWQgbmFtZSBiYXNlZCBvbiB0aGUgZ2lybOKAmXMgcmFyaXR5LlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnZmlnaHRfaWNvbicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiRmlnaHQgaWNvblwiLCBcIlVzZSB0aGUgY2xlYXJlciBmaWdodC1lbmVyZ3kgaWNvbi5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ3NoYWRvd3MnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlVuc2hhZG93ZWQgcG9zZXNcIiwgXCJTaG93IHRoZSBub3JtYWwgYXJ0d29yayBpbiBwbGFjZSBvZiBzaGFkb3cgcG9zZXMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuXG4gICAgICAgIHRoaXMucmFyaXR5Q29sb3JzID0ge1xuICAgICAgICAgICAgcmFyZTogJ0xpbWVHcmVlbicsXG4gICAgICAgICAgICBlcGljOiAnR29sZCcsXG4gICAgICAgICAgICBsZWdlbmRhcnk6ICdNZWRpdW1PcmNoaWQnXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sb3ZlLXJhaWRzLmh0bWwnKVxuICAgIH1cblxuICAgIGFzeW5jIHJ1bih7IHJhaWRfaWQsIHNraW4sIG5hbWVzLCBjb2xvciwgZmlnaHRfaWNvbiwgc2hhZG93cyB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgY29uc3QgcmFpZHMgPSAodHlwZW9mIGxvdmVfcmFpZHMgIT09ICd1bmRlZmluZWQnICYmIEFycmF5LmlzQXJyYXkobG92ZV9yYWlkcykpID8gbG92ZV9yYWlkcyA6IFtdO1xuICAgICAgICBpZiAoIXJhaWRzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcblxuICAgICAgICBjb25zdCBnaXJsRGljdCA9IGF3YWl0IGdldEdpcmxEaWN0aW9uYXJ5KCk7XG4gICAgICAgIGNvbnN0IHJhaWRzQnlJZCA9IG5ldyBNYXAocmFpZHMubWFwKHJhaWQgPT4gW1N0cmluZyhyYWlkLmlkX3JhaWQpLCByYWlkXSkpO1xuXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYWlkLWNhcmRbaWRfcmFpZF0nKS5mb3JFYWNoKHJhaWRDYXJkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJhaWQgPSByYWlkc0J5SWQuZ2V0KHJhaWRDYXJkLmdldEF0dHJpYnV0ZSgnaWRfcmFpZCcpID8/ICcnKTtcbiAgICAgICAgICAgIGlmICghcmFpZCB8fCByYWlkLmlkX2dpcmwgPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCB7IG5hbWUsIHJhcml0eSwgc2hhcmRzID0gMCB9ID0gZ2lybERpY3Q/LmdldChTdHJpbmcocmFpZC5pZF9naXJsKSkgfHwge307XG4gICAgICAgICAgICBjb25zdCBoYXJlbUxpbmsgPSB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmdldEhyZWYoYC9jaGFyYWN0ZXJzLyR7cmFpZC5pZF9naXJsfWApO1xuICAgICAgICAgICAgY29uc3QgcmFpZE5hbWVFbGVtID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcignLnJhaWQtbmFtZSA+IHNwYW4gPiBzcGFuJyk7XG4gICAgICAgICAgICBjb25zdCBuYW1lX2xhYmVsID0gKG5hbWVzICYmIG5hbWUpIHx8IHJhaWROYW1lRWxlbT8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCByYWlkLmV2ZW50X25hbWUgfHwgcmFpZC5naXJsX2RhdGE/Lm5hbWUgfHwgJyc7XG4gICAgICAgICAgICBjb25zdCByYWlkX2lkX2xhYmVsID0gcmFpZF9pZCA/IGAoJHtyYWlkLmlkX3JhaWR9KWAgOiAnJztcbiAgICAgICAgICAgIGNvbnN0IHNraW5fbGFiZWwgPSAoc2tpbiAmJiBBcnJheS5pc0FycmF5KHJhaWQ/LmdpcmxfZGF0YT8uZ3JhZGVfc2tpbnMpICYmIHJhaWQuZ2lybF9kYXRhLmdyYWRlX3NraW5zLmxlbmd0aCA+IDApID8gJ/CfkZknIDogJyc7XG5cbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlQYXJ0cyA9IFtdO1xuICAgICAgICAgICAgaWYgKHJhaWRfaWQpIGRpc3BsYXlQYXJ0cy5wdXNoKHJhaWRfaWRfbGFiZWwpO1xuICAgICAgICAgICAgZGlzcGxheVBhcnRzLnB1c2gobmFtZV9sYWJlbCk7XG4gICAgICAgICAgICBpZiAoc2tpbikgZGlzcGxheVBhcnRzLnB1c2goc2tpbl9sYWJlbCk7XG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5TGFiZWwgPSBkaXNwbGF5UGFydHMuam9pbignICcpLnRyaW0oKTtcblxuICAgICAgICAgICAgaWYgKHJhaWROYW1lRWxlbSAmJiBkaXNwbGF5TGFiZWwpIHtcbiAgICAgICAgICAgICAgICByYWlkTmFtZUVsZW0udGV4dENvbnRlbnQgPSBkaXNwbGF5TGFiZWw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG9iamVjdGl2ZXMgPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yQWxsKCcuY2xhc3NpYy1naXJsJyk7XG4gICAgICAgICAgICBjb25zdCBnaXJsID0gb2JqZWN0aXZlc1swXTtcbiAgICAgICAgICAgIGlmIChnaXJsKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ2lybE5hbWVFbGVtID0gZ2lybC5xdWVyeVNlbGVjdG9yKCcuZ2lybC1uYW1lJyk7XG4gICAgICAgICAgICAgICAgaWYgKGdpcmxOYW1lRWxlbSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGluayA9IGdpcmxOYW1lRWxlbS5xdWVyeVNlbGVjdG9yKCdhJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbGluaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsuY2xhc3NOYW1lID0gJ2hoLWdpcmwtbGluayc7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoZ2lybE5hbWVFbGVtLmZpcnN0Q2hpbGQpIGxpbmsuYXBwZW5kQ2hpbGQoZ2lybE5hbWVFbGVtLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2lybE5hbWVFbGVtLmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5TGFiZWwpIGxpbmsudGV4dENvbnRlbnQgPSBkaXNwbGF5TGFiZWw7XG4gICAgICAgICAgICAgICAgICAgIGxpbmsuaHJlZiA9IGhhcmVtTGluaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoc2hhcmRzID09PSAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2JqRWxlbSA9IGdpcmwucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5vYmplY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iakVsZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iakVsZW0uaW5uZXJUZXh0ID0gYEknbSBhbHJlYWR5IGF0dHJhY3RlZCB0byB5b3UuIEZpbmQgbWUgaW4geW91ciBIYXJlbSFgO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY29sb3IgJiYgcmFyaXR5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmFpZE5hbWVDb250YWluZXIgPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLnJhaWQtbmFtZScpO1xuICAgICAgICAgICAgICAgIGlmIChyYWlkTmFtZUNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgICAgICByYWlkTmFtZUNvbnRhaW5lci5zdHlsZS5jb2xvciA9IHRoaXMucmFyaXR5Q29sb3JzW3Jhcml0eV0gfHwgJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZmlnaHRfaWNvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpZ2h0SWNvbiA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcuaHVkQmF0dGxlUHRzX21peF9pY24nKTtcbiAgICAgICAgICAgICAgICBpZiAoZmlnaHRJY29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpZ2h0SWNvbi5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKC9pbWFnZXMvcGljdHVyZXMvZGVzaWduL2ljX2VuZXJneV9maWdodC5wbmcpJztcbiAgICAgICAgICAgICAgICAgICAgZmlnaHRJY29uLnN0eWxlLmJhY2tncm91bmRTaXplID0gJzI0cHgnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNoYWRvd3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsZWZ0SW1hZ2UgPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxJbWFnZUVsZW1lbnQ+KCcuZ2lybC1pbWcubGVmdCcpO1xuICAgICAgICAgICAgICAgIGlmIChsZWZ0SW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdEltYWdlLnNyYyA9IGxlZnRJbWFnZS5zcmMucmVwbGFjZSgnLWJsYWNrJywgJycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmFpZENhcmQuY2xhc3NMaXN0LmNvbnRhaW5zKCdtdWx0aXBsZS1naXJsJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRJbWFnZSA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEltYWdlRWxlbWVudD4oJy5naXJsLWltZy5yaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmlnaHRJbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmlnaHRJbWFnZS5zcmMgPSByaWdodEltYWdlLnNyYy5yZXBsYWNlKCdhdmIwLnBuZycsICdncmFkZV9za2lucy9ncmFkZV9za2luMS5wbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0SW1hZ2Uuc3JjID0gcmlnaHRJbWFnZS5zcmMucmVwbGFjZSgnLWJsYWNrJywgJycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5leWUnKS5mb3JFYWNoKGUgPT4gZS5yZW1vdmUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgdHlwZSB7IEdpcmxEYXRhLCBMb3ZlUmFpZCB9IGZyb20gJy4uLy4uL2dhbWUtdHlwZXMnO1xuaW1wb3J0IHsgbHNHZXQsIGxzU2V0LCBsc1JtIH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5pbXBvcnQgeyBnZXRHaXJsRGljdGlvbmFyeSB9IGZyb20gJy4vZ2FtZURhdGEnO1xuXG50eXBlIFJhaWRDb3B5QnV0dG9uID0gSFRNTERpdkVsZW1lbnQgJiB7IF9ib3VuZENvcHlLZXlIYW5kbGVyPzogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB2b2lkIH07XG5cbmV4cG9ydCBjbGFzcyBMb3ZlUmFpZHNQYXJzZXIgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBnaXJsRGljdDogUmVhZG9ubHlNYXA8c3RyaW5nLCBHaXJsRGF0YT4gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIF9ib3VuZEluc2VydEJ1dHRvbj86ICgpID0+IHZvaWQ7XG5cbiAgICAvKlxuICAgICogUmFpZCBJRCwgQW5ub3VuY2VtZW50IFR5cGUsIEJhY2tncm91bmQgSUQsIEV2ZW50IE5hbWUsIFN0YXJ0IERhdGV0aW1lLFxuICAgICogRW5kIERhdGV0aW1lLCBEdXJhdGlvbiwgUmFpZCBTdGF0dXMsIFNvdXJjZSwgR2lybCBJRCxcbiAgICAqIEdpcmwgTmFtZSwgUmFyaXR5LCBNYXggR3JhZGUsIEZpcnN0IEFwcGVhcmFuY2UsIFNvdXJjZSBJRCxcbiAgICAqIEhhcyBTa2luKHMpXG4gICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdsb3ZlUmFpZHNQYXJzZXInXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkxvdmUgUmFpZHMgZXhwb3J0XCIsIFwiQWRkIGEgYnV0dG9uIHRvIGNvcHkgbmV3IHJhaWRzIGluIGEgc3ByZWFkc2hlZXQtcmVhZHkgZm9ybWF0LlwiKVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xvdmUtcmFpZHMuaHRtbCcpXG4gICAgfVxuXG4gICAgY2FwaXRhbGl6ZUZpcnN0KHN0cjogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBzdHIgPyBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSkgOiBzdHI7XG4gICAgfVxuXG4gICAgZ2V0QW5ub3VuY2VtZW50VHlwZSh0eXBlOiBMb3ZlUmFpZFsnaWRfYW5ub3VuY2VtZW50X3R5cGUnXSkge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIFwiRnVsbFwiO1xuICAgICAgICAgICAgY2FzZSAyOiByZXR1cm4gXCJQYXJ0aWFsXCI7XG4gICAgICAgICAgICBjYXNlIDM6IHJldHVybiBcIk5vbmVcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBcIlVua25vd25cIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFNvdXJjZUlEKGV2ZW50OiBMb3ZlUmFpZCkge1xuICAgICAgICBjb25zdCBzb3VyY2VfaWQgPSBOdW1iZXIoZXZlbnQucmFpZF9tb2R1bGVfcGspO1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LnJhaWRfbW9kdWxlX3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NlYXNvbic6IHJldHVybiAwO1xuICAgICAgICAgICAgY2FzZSAnY2hhbXBpb24nOiByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHNvdXJjZV9pZCkgPyBzb3VyY2VfaWQgOiAtMjtcbiAgICAgICAgICAgIGNhc2UgJ3Ryb2xsJzogcmV0dXJuIE51bWJlci5pc0Zpbml0ZShzb3VyY2VfaWQpID8gc291cmNlX2lkICsgMTAgOiAtMjtcbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdpcmxIYXNTa2lucyhldmVudDogTG92ZVJhaWQpIHtcbiAgICAgICAgY29uc3QgaGFzU2tpbnMgPSBBcnJheS5pc0FycmF5KGV2ZW50Py5naXJsX2RhdGE/LmdyYWRlX3NraW5zKSAmJiBldmVudC5naXJsX2RhdGEuZ3JhZGVfc2tpbnMubGVuZ3RoID4gMDtcbiAgICAgICAgaWYgKGhhc1NraW5zKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJYXCI7XG4gICAgICAgIH0gZWxzZSByZXR1cm4gXCJPXCI7XG4gICAgfVxuXG4gICAgZm9ybWF0RXZlbnRSb3coZXZlbnQ6IExvdmVSYWlkKSB7XG4gICAgICAgIGNvbnN0IGR1cmF0aW9uSG91cnMgPSBNYXRoLmZsb29yKE51bWJlcihldmVudC5ldmVudF9kdXJhdGlvbl9zZWNvbmRzKSAvIDM2MDApO1xuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGAke2R1cmF0aW9uSG91cnN9IGhvdXJzYDtcblxuICAgICAgICBjb25zdCBnaXJsID0gdGhpcy5naXJsRGljdD8uZ2V0KFN0cmluZyhldmVudC5pZF9naXJsKSkgfHwge307XG4gICAgICAgIGNvbnN0IHsgbmFtZSA9ICdVbmtub3duJywgcmFyaXR5ID0gJ04vQScsIGdyYWRlID0gMCB9ID0gZ2lybDtcblxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgZXZlbnQuaWRfcmFpZCxcbiAgICAgICAgICAgIHRoaXMuZ2V0QW5ub3VuY2VtZW50VHlwZShldmVudC5pZF9hbm5vdW5jZW1lbnRfdHlwZSksXG4gICAgICAgICAgICBldmVudC5iYWNrZ3JvdW5kX2lkLFxuICAgICAgICAgICAgZXZlbnQuZXZlbnRfbmFtZSxcbiAgICAgICAgICAgIGV2ZW50LnN0YXJ0X2RhdGV0aW1lLFxuICAgICAgICAgICAgZXZlbnQuZW5kX2RhdGV0aW1lLFxuICAgICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgICAgICBldmVudC5zdGF0dXMsXG4gICAgICAgICAgICBldmVudC5yYWlkX21vZHVsZV90eXBlLFxuICAgICAgICAgICAgZXZlbnQuaWRfZ2lybCxcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICB0aGlzLmNhcGl0YWxpemVGaXJzdChyYXJpdHkpLFxuICAgICAgICAgICAgZ3JhZGUsXG4gICAgICAgICAgICBcIlwiLCAvLyBvbmUgYmxhbmsgdGFiIHJlc2VydmVkIGZvciBmaXJzdCBhcHBlYXJhbmNlIGluIEdTaGVldHNcbiAgICAgICAgICAgIHRoaXMuZ2V0U291cmNlSUQoZXZlbnQpLFxuICAgICAgICAgICAgdGhpcy5naXJsSGFzU2tpbnMoZXZlbnQpXG4gICAgICAgIF0uam9pbihcIlxcdFwiKTtcbiAgICB9XG5cbiAgICBhc3luYyBjb3B5VG9DbGlwYm9hcmQodGV4dDogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQ2xpcGJvYXJkIEFQSSBmYWlsZWQsIHVzaW5nIGV4ZWNDb21tYW5kIGZhbGxiYWNrOicsIGVycik7XG4gICAgICAgICAgICBjb25zdCB0ZXh0YXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyk7XG4gICAgICAgICAgICB0ZXh0YXJlYS52YWx1ZSA9IHRleHQ7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRleHRhcmVhKTtcbiAgICAgICAgICAgIHRleHRhcmVhLnNlbGVjdCgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGV4dGFyZWEucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBoYW5kbGVDb3B5Q2xpY2soZXZ0OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHN0b3JhZ2VLZXkgPSAnTGFzdFNhdmVkUmFpZElEJztcblxuICAgICAgICAvLyBTaGlmdCArIEN0cmwgKyBDbGljayDihpIgY2xlYXIgc3RvcmVkIElEXG4gICAgICAgIGlmIChldnQuc2hpZnRLZXkgJiYgZXZ0LmN0cmxLZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpcm1DbGVhciA9IGNvbmZpcm0oJ+KaoO+4jyBEbyB5b3Ugd2FudCB0byBjbGVhciB0aGUgc2F2ZWQgbGFzdCByYWlkIElEIGZvciB0aGlzIHNpdGU/Jyk7XG4gICAgICAgICAgICBpZiAoY29uZmlybUNsZWFyKSB7XG4gICAgICAgICAgICAgICAgbHNSbShzdG9yYWdlS2V5KTtcbiAgICAgICAgICAgICAgICBhbGVydCgn4pyFIExhc3Qgc2F2ZWQgSUQgY2xlYXJlZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvYWQgcmFpZHNcbiAgICAgICAgY29uc3QgbG9jYWxMb3ZlUmFpZHMgPSAodHlwZW9mIGxvdmVfcmFpZHMgIT09ICd1bmRlZmluZWQnICYmIEFycmF5LmlzQXJyYXkobG92ZV9yYWlkcykpID8gbG92ZV9yYWlkcyA6IFtdO1xuICAgICAgICBpZiAoIWxvY2FsTG92ZVJhaWRzLmxlbmd0aCkge1xuICAgICAgICAgICAgYWxlcnQoJ+KaoO+4jyBObyBsb3ZlX3JhaWRzIGZvdW5kIG9uIHRoaXMgcGFnZS4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5naXJsRGljdCkge1xuICAgICAgICAgICAgYWxlcnQoJ+KaoO+4jyBUaGUgSEgrKyBnaXJsIGRpY3Rpb25hcnkgY291bGQgbm90IGJlIGxvYWRlZC4gUmVsb2FkIHRoZSBwYWdlIGFuZCB0cnkgYWdhaW4uJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbGFzdFNhdmVkSWROdW1iZXIgPSBwYXJzZUludChTdHJpbmcobHNHZXQoc3RvcmFnZUtleSkpLCAxMCk7XG5cbiAgICAgICAgLy8gSWYgU2hpZnQgaXMgaGVsZCBPUiBubyBzYXZlZCBJRCBleGlzdHMg4oaSIGFzayBhZ2FpblxuICAgICAgICBpZiAoaXNOYU4obGFzdFNhdmVkSWROdW1iZXIpIHx8IGV2dC5zaGlmdEtleSkge1xuICAgICAgICAgICAgY29uc3QgbGFzdFNhdmVkSWQgPSBwcm9tcHQoJ1BsZWFzZSBlbnRlciB0aGUgbGFzdCBzYXZlZCBJRDonKTtcbiAgICAgICAgICAgIGxhc3RTYXZlZElkTnVtYmVyID0gcGFyc2VJbnQoU3RyaW5nKGxhc3RTYXZlZElkKSwgMTApO1xuXG4gICAgICAgICAgICBpZiAoaXNOYU4obGFzdFNhdmVkSWROdW1iZXIpKSB7XG4gICAgICAgICAgICAgICAgYWxlcnQoJ+KdjCBJbnZhbGlkIElEIGVudGVyZWQuIFBsZWFzZSBlbnRlciBhIHZhbGlkIG51bWJlci4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaWx0ZXIgbmV3IGV2ZW50c1xuICAgICAgICBjb25zdCBmaWx0ZXJlZERhdGEgPSBsb2NhbExvdmVSYWlkcy5maWx0ZXIoZXZlbnQgPT4gTnVtYmVyKGV2ZW50LmlkX3JhaWQpID4gbGFzdFNhdmVkSWROdW1iZXIpO1xuICAgICAgICBpZiAoIWZpbHRlcmVkRGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFsZXJ0KGDihLnvuI8gTm8gbmV3IGV2ZW50cyBmb3VuZCB3aXRoIElEIGdyZWF0ZXIgdGhhbiAke2xhc3RTYXZlZElkTnVtYmVyfWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZm9ybWF0dGVkRGF0YSA9IGZpbHRlcmVkRGF0YS5tYXAodGhpcy5mb3JtYXRFdmVudFJvdy5iaW5kKHRoaXMpKS5qb2luKFwiXFxuXCIpO1xuXG4gICAgICAgIGlmICghYXdhaXQgdGhpcy5jb3B5VG9DbGlwYm9hcmQoZm9ybWF0dGVkRGF0YSkpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfinYwgQ291bGQgbm90IGNvcHkgdGhlIHJhaWRzLiBUaGUgbGFzdCBzYXZlZCBJRCB3YXMga2VwdC4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNhdmUgaGlnaGVzdCBJRFxuICAgICAgICBjb25zdCBtYXhJZCA9IE1hdGgubWF4KC4uLmZpbHRlcmVkRGF0YS5tYXAoZSA9PiBOdW1iZXIoZS5pZF9yYWlkKSkpO1xuICAgICAgICBsc1NldChzdG9yYWdlS2V5LCBtYXhJZCk7XG5cbiAgICAgICAgYWxlcnQoJ+KchSBEYXRhIGNvcGllZCB0byBjbGlwYm9hcmQhIFlvdSBjYW4gbm93IHBhc3RlIGl0IGludG8gR1NoZWV0cy4nKTtcbiAgICB9XG5cbiAgICBjcmVhdGVDb3B5QnV0dG9uKCkge1xuICAgICAgICBjb25zdCBidXR0b246IFJhaWRDb3B5QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdyZW1pbmRlci1jb3B5Jyk7XG4gICAgICAgIGJ1dHRvbi5zdHlsZS5jc3NUZXh0ID0gYFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgIzAwYWFmZiAwLCAjMDA2Njg4IDUwJSwgIzAwNTU3NyA1MSUsICMwMGFhZmYgMTAwJSk7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgICAgICB3aWR0aDogMzJweDtcbiAgICAgICAgICAgIGhlaWdodDogMzJweDtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiAxMHB4O1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgcmlnaHQ6IDQuNXJlbTtcbiAgICAgICAgICAgIHRvcDogMC4ycmVtO1xuICAgICAgICAgICAgZm9udC1zaXplOiAxOHB4O1xuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDMycHg7XG4gICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kIDAuMnMgZWFzZTtcbiAgICAgICAgYDtcbiAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ/Cfk4snO1xuICAgICAgICBsZXQgYnV0dG9uVGl0bGUgPSAnQ2xpY2sgPSBjb3B5IG5ldyByYWlkcy4gU2hpZnQgLyBTaGlmdCArIEN0cmwgYXZhaWxhYmxlLic7XG4gICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3Rvb2x0aXAnLCAnJyk7XG4gICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuXG4gICAgICAgIGNvbnN0IF9ib3VuZENvcHlLZXlIYW5kbGVyID0gKGU6IEtleWJvYXJkRXZlbnQpID0+IHRoaXMudXBkYXRlQ29weUJ1dHRvbihlLCBidXR0b24pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIF9ib3VuZENvcHlLZXlIYW5kbGVyKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgX2JvdW5kQ29weUtleUhhbmRsZXIpO1xuICAgICAgICAvLyBzdG9yZSBoYW5kbGVyIHJlZmVyZW5jZSBzbyBjYWxsZXJzIGNhbiByZW1vdmUgbGlzdGVuZXJzIGlmIGJ1dHRvbiBpcyByZW1vdmVkIGxhdGVyXG4gICAgICAgIGJ1dHRvbi5fYm91bmRDb3B5S2V5SGFuZGxlciA9IF9ib3VuZENvcHlLZXlIYW5kbGVyO1xuICAgICAgICBidXR0b24ub25jbGljayA9IChlKSA9PiB0aGlzLmhhbmRsZUNvcHlDbGljayhlKTtcbiAgICAgICAgdGhpcy51cGRhdGVDb3B5QnV0dG9uKHsgc2hpZnRLZXk6IGZhbHNlLCBjdHJsS2V5OiBmYWxzZSB9LCBidXR0b24pO1xuICAgICAgICByZXR1cm4gYnV0dG9uO1xuICAgIH1cblxuICAgIHVwZGF0ZUNvcHlCdXR0b24oZTogUGljazxLZXlib2FyZEV2ZW50LCAnc2hpZnRLZXknIHwgJ2N0cmxLZXknPiwgYnV0dG9uOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBsZXQgYnV0dG9uVGl0bGUgPSAnJztcbiAgICAgICAgaWYgKGUuc2hpZnRLZXkgJiYgZS5jdHJsS2V5KSB7XG4gICAgICAgICAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgI2ZmNjY2NiAwLCAjYWEwMDAwIDEwMCUpXCI7IC8vIHJlZFxuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ/Cfl5HvuI8nO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnU2hpZnQgKyBDdHJsICsgQ2xpY2sgPSBjbGVhciBzYXZlZCBJRCc7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgI2ZmZGQ2NiAwLCAjY2M5OTAwIDEwMCUpXCI7IC8vIHllbGxvd1xuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ+Kcj++4jyc7XG4gICAgICAgICAgICBidXR0b25UaXRsZSA9ICdTaGlmdCArIENsaWNrID0gcHJvbXB0IGZvciBJRC4nO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgIzAwYWFmZiAwLCAjMDA2Njg4IDUwJSwgIzAwNTU3NyA1MSUsICMwMGFhZmYgMTAwJSlcIjsgLy8gZGVmYXVsdCBibHVlXG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAn8J+Tiyc7XG4gICAgICAgICAgICBidXR0b25UaXRsZSA9ICdDbGljayA9IGNvcHkgbmV3IHJhaWRzLiBTaGlmdCAvIFNoaWZ0ICsgQ3RybCBhdmFpbGFibGUuJztcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5zZXJ0QnV0dG9uKCkge1xuICAgICAgICBjb25zdCBub3RpZmljYXRpb25CdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnV0dG9uLW5vdGlmaWNhdGlvbi1hY3Rpb24ubm90aWZfYnV0dG9uX3MnKTtcbiAgICAgICAgaWYgKG5vdGlmaWNhdGlvbkJ1dHRvbiAmJiAhZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlbWluZGVyLWNvcHknKSkge1xuICAgICAgICAgICAgY29uc3QgY29weUJ1dHRvbiA9IHRoaXMuY3JlYXRlQ29weUJ1dHRvbigpO1xuICAgICAgICAgICAgbm90aWZpY2F0aW9uQnV0dG9uLnBhcmVudE5vZGU/Lmluc2VydEJlZm9yZShjb3B5QnV0dG9uLCBub3RpZmljYXRpb25CdXR0b24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgICAgIHRoaXMuZ2lybERpY3QgPSBhd2FpdCBnZXRHaXJsRGljdGlvbmFyeSgpO1xuXG4gICAgICAgIHRoaXMuX2JvdW5kSW5zZXJ0QnV0dG9uID0gdGhpcy5pbnNlcnRCdXR0b24uYmluZCh0aGlzKTtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHRoaXMuaW5zZXJ0QnV0dG9uKCk7XG4gICAgICAgIGVsc2Ugd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzLl9ib3VuZEluc2VydEJ1dHRvbiwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuXG5leHBvcnQgY2xhc3MgQWN0aXZpdHlQYXJzZXIgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnYWN0aXZpdHlQYXJzZXInXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIk1pc3Npb24gY29waWVyXCIsIFwiRW5hYmxlIHRoZSBjb3B5IHRvb2wgZm9yIGxlZ2VuZGFyeSBtaXNzaW9uIGRldGFpbHMuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAnbWlzc2lvbkNvcGllcicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTGVnZW5kYXJ5IGRldGFpbHNcIiwgXCJDbGljayBhIGxlZ2VuZGFyeSBtaXNzaW9u4oCZcyB0aXRsZSwgZGVzY3JpcHRpb24sIG9yIGltYWdlIHRvIGNvcHkgaXQuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2FjdGl2aXRpZXMuaHRtbCcpXG4gICAgfVxuXG4gICAgYXN5bmMgY29weVRvQ2xpcGJvYXJkKHRleHQ6IHN0cmluZykge1xuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgICAgY29uc3QgdG9hc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG9hc3QudGV4dENvbnRlbnQgPSAnQ29waWVkISc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICAgICAgdG9hc3Quc3R5bGUuYm90dG9tID0gJzEwcHgnO1xuICAgICAgICB0b2FzdC5zdHlsZS5yaWdodCA9ICcxMHB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUuYmFja2dyb3VuZCA9ICdyZ2JhKDAsMCwwLDAuNyknO1xuICAgICAgICB0b2FzdC5zdHlsZS5jb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnBhZGRpbmcgPSAnNXB4IDEwcHgnO1xuICAgICAgICB0b2FzdC5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNXB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUuekluZGV4ID0gJzk5OTknO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvYXN0KTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0b2FzdC5yZW1vdmUoKSwgMTAwMCk7XG4gICAgfVxuXG4gICAgcnVuKHsgbWlzc2lvbkNvcGllciB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgaWYgKG1pc3Npb25Db3BpZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJpZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWlzc2lvbl9lbnRyeS5sZWdlbmRhcnknKTtcbiAgICAgICAgICAgIGlmICghZW50cmllcy5sZW5ndGgpIHJldHVybjtcblxuICAgICAgICAgICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbWdEaXYgPSBlbnRyeS5xdWVyeVNlbGVjdG9yPEhUTUxJbWFnZUVsZW1lbnQ+KCcubWlzc2lvbl9pbWFnZSBpbWcnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUFsbCA9IGVudHJ5LnF1ZXJ5U2VsZWN0b3I8SFRNTEhlYWRpbmdFbGVtZW50PignLm1pc3Npb25fZGV0YWlscyBoMScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlc2MgPSBlbnRyeS5xdWVyeVNlbGVjdG9yPEhUTUxQYXJhZ3JhcGhFbGVtZW50PignLm1pc3Npb25fZGV0YWlscyBwJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW1nRGl2KSB7XG4gICAgICAgICAgICAgICAgICAgIGltZ0Rpdi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgICAgIGltZ0Rpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKGltZ0Rpdi5zcmMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodGl0bGVBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVBbGwuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvdXRlclRpdGxlID0gdGl0bGVBbGwucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5ldmVudC1taXNzaW9uLWNvbnRlbnQtdGV4dCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob3V0ZXJUaXRsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJUaXRsZS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlclRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZCgob3V0ZXJUaXRsZS50ZXh0Q29udGVudCA/PyAnJykudHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGl0bGVBbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgZS50YXJnZXQuY2xvc2VzdCgnLmV2ZW50LW1pc3Npb24tY29udGVudC10ZXh0JykpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlQ2xvbmUgPSB0aXRsZUFsbC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEhlYWRpbmdFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVDbG9uZS5xdWVyeVNlbGVjdG9yKCcuZXZlbnQtbWlzc2lvbi1jb250ZW50LXRleHQnKT8ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9ICh0aXRsZUNsb25lLnRleHRDb250ZW50ID8/ICcnKS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZCh0aXRsZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkZXNjKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2Muc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICBkZXNjLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQoZGVzYy5pbm5lclRleHQudHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgICAgICB9XG4gICAgfVxufVxuIiwgIlt7XCJ2ZXJzaW9uXCI6XCIwLjguMFwiLFwiY2hhbmdlc1wiOltcIk1pZGRsZS1jbGljayBvciBDdHJsLWNsaWNrIHRoZSBnYW1lIGxvZ28sIFBhdGggb2YgVmFsb3IsIG9yIFBhdGggb2YgR2xvcnkgdG8gb3BlbiB0aGUgcGFnZSBpbiBhIG5ldyB0YWIuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjcuMTBcIixcImNoYW5nZXNcIjpbXCJLZWVwIEhvbWUsIEVuZCwgYW5kIHRoZSBhcnJvdyBrZXlzIHdvcmtpbmcgYWZ0ZXIgYSBjb250ZXN0IGNsaWNrIHdoaWxlIGF1dG9tYXRpYyBzY3JvbGxpbmcgaXMgYmxvY2tlZC5cIl19LHtcInZlcnNpb25cIjpcIjAuNy45XCIsXCJjaGFuZ2VzXCI6W1wiU2F2ZSBEb27igJl0IHNob3cgYWdhaW4gYW5kIFNpbGVudCBjaGFuZ2Vsb2cgd2hlbiBjbG9zaW5nIHRoZSB1cGRhdGUgcG9wdXAsIGluY2x1ZGluZyB3aXRoIEhIKysgYnVpbGRzIHRoYXQga2VlcCBzZXR0aW5ncyBwcml2YXRlLlwiXX0se1widmVyc2lvblwiOlwiMC43LjhcIixcImNoYW5nZXNcIjpbXCJDbGVhciBzYXZlZCBUb3AgYW5kIE15IHJhbmsgY2hvaWNlcyBvbmNlIHRoZWlyIGNvbnRlc3RzIGFyZSBubyBsb25nZXIgYXZhaWxhYmxlLlwiXX0se1widmVyc2lvblwiOlwiMC43LjdcIixcImNoYW5nZXNcIjpbXCJBcHBseSBEb27igJl0IHNob3cgYWdhaW4gd2hlbiB0aGUgY2hhbmdlbG9nIGNsb3NlcyBhbmQgdXBkYXRlIHRoZSBISCsrIHNldHRpbmcgaW1tZWRpYXRlbHkuXCIsXCJHaXZlIHRoZSBzaWxlbnQgdXBkYXRlIGljb24gaXRzIG93biB0b29sdGlwLlwiLFwiS2VlcCBsb25nIGNvbnRlc3QgdGl0bGVzIGluIHRoZSBjYXJkIGhlYWRlciBhbG9uZ3NpZGUgdGhlIHJhbmsgY29udHJvbHMuXCIsXCJJZGVudGlmeSB0aGUgRGV2IGJ1aWxkIGJlc2lkZSBpdHMgdmVyc2lvbiBpbiBzZXR0aW5ncy5cIl19LHtcInZlcnNpb25cIjpcIjAuNy42XCIsXCJjaGFuZ2VzXCI6W1wiQ2hvb3NlIFRvcCBvciBNeSByYW5rIG9uIGFueSBhY3RpdmUgY29udGVzdC4gSmFydmlzIHJlbWVtYmVycyBlYWNoIGNvbnRlc3TigJlzIGNob2ljZSB3aGVuIHN3aXRjaGluZyBhbmQgYXBwbGllcyB0aGUgc2FtZSBwb3NpdGlvbiBhbmQgc2Nyb2xsIHJ1bGVzIHRvIGZpbmlzaGVkIGNvbnRlc3RzLlwiLFwiS2VlcCBnYW1lIHNjcm9sbCBhbmltYXRpb25zIGZyb20gcmVzdGFydGluZyB3aGlsZSB5b3Ugc2Nyb2xsIGJ5IGhhbmQgZHVyaW5nIGEgY29udGVzdCBzd2l0Y2guXCIsXCJTZWUgYSBzbWFsbCBhcmMtcmVhY3RvciBpY29uIGJlc2lkZSBISCsrIHdoZW4gYSBzaWxlbnQgdXBkYXRlIG5vdGljZSBpcyBhdmFpbGFibGUuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjcuNVwiLFwiY2hhbmdlc1wiOltcIktlZXAgdGhlIGhvbWVwYWdlIHJlc3BvbnNpdmUgYWZ0ZXIgY2xvc2luZyB0aGUgY2hhbmdlbG9nIGFuZCBjaG9vc2UgU2lsZW50IGNoYW5nZWxvZyBmcm9tIHRoZSBwb3B1cC5cIixcIlN0b3AgYXV0b21hdGljIHNpZGViYXIgc2Nyb2xsaW5nIG9uIGNvbnRlc3Qgc3dpdGNoZXMgYnkgZGVmYXVsdCBhbmQgdXNlIFRvcCBvciBNeSByYW5rIHdoZW5ldmVyIHlvdSBzd2l0Y2guXCIsXCJCcmluZyB0aGUgc2VsZWN0ZWQgY2FyZCBpbnRvIHZpZXcgd2hlbiB5b3UgdXNlIGEgY29udGVzdCBzaG9ydGN1dC5cIl19LHtcInZlcnNpb25cIjpcIjAuNy40XCIsXCJjaGFuZ2VzXCI6W1wiU2VlIHlvdXIgcmFuayBpbiBlYWNoIGFjdGl2ZSBjb250ZXN0IGJlc2lkZSB0aGUgY2xvc2UgYnV0dG9uIGFuZCBzd2l0Y2ggbGVhZGVyYm9hcmRzIHdpdGhvdXQgbW92aW5nIHRoZSBjb250ZXN0IGxpc3QuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjcuM1wiLFwiY2hhbmdlc1wiOltcIlNlZSBhdXRvbWF0aWMgY2hhbmdlbG9ncyBvbmx5IHdoZW4gbG9hZGluZyB0aGUgaG9tZXBhZ2UgYWZ0ZXIgYW4gdXBkYXRlLlwiLFwiRW5hYmxlIFNpbGVudCBjaGFuZ2Vsb2cgdG8gZ2V0IGEgTmV3IGJ1dHRvbiBiZXNpZGUgSEgrKyBhbmQgb3BlbiB0aGUgbm90ZXMgd2hlbiB5b3XigJlyZSByZWFkeS5cIixcIktlZXAgdGhlIGNvbnRlc3QgbGlzdCBhbmQgZWFjaCBsZWFkZXJib2FyZCBpbiBwbGFjZSB3aGVuIHN3aXRjaGluZyBjb250ZXN0cyB3aXRoIFN0b3Agc2Nyb2xsaW5nIG9uIGNvbnRlc3Qgc3dpdGNoZXMuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjcuMlwiLFwiY2hhbmdlc1wiOltcIk9wZW4gdGhlIGJvdHRvbSBhY3RpdmUgY29udGVzdCBhdCB5b3VyIHJhbmsgYnkgZGVmYXVsdC4gQ2hvb3NlIENiQywgQ0NDLCBvciBMQyB0byBwcmVmZXIgdGhhdCBldmVudCB3aGVuIGF2YWlsYWJsZS5cIixcIlR1cm4gb2ZmIGF1dG9tYXRpYyB1cGRhdGUgbm90aWNlcyB3aXRoIERvbuKAmXQgc2hvdyBhZ2FpbiBpbiB0aGUgY2hhbmdlbG9nIHBvcHVwLiBWaWV3IGNoYW5nZWxvZyBzdGF5cyBhdmFpbGFibGUgaW4gc2V0dGluZ3MuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjcuMVwiLFwiY2hhbmdlc1wiOltcIktlZXAgdGhlIGNoYW5nZWxvZyBjZW50ZXJlZCB3aGVuIHRoZSBnYW1lIHdpbmRvdyBpcyByZXNpemVkLlwiLFwiQ2xlYW4gdXAgc2F2ZWQgcGxheWVyIG5hbWVzLCBleHBsYWluIHVua25vd24gbmFtZXMgb24gaG92ZXIsIGFuZCBnaXZlIFJlbW92ZSBidXR0b25zIG1vcmUgcm9vbS5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4wXCIsXCJjaGFuZ2VzXCI6W1wiU2VlIHdoYXQgY2hhbmdlZCBpbiBKYXJ2aXMgdGhlIGZpcnN0IHRpbWUgYSBuZXcgdmVyc2lvbiBydW5zLlwiLFwiT3BlbiBWaWV3IGNoYW5nZWxvZyBmcm9tIEhIKysgc2V0dGluZ3MgYXQgYW55IHRpbWUsIGV2ZW4gd2l0aCBhdXRvbWF0aWMgbm90aWNlcyB0dXJuZWQgb2ZmLlwiLFwiRXhwYW5kIEVhcmxpZXIgdmVyc2lvbnMgdG8gcmVhZCBwYXN0IHVwZGF0ZXMuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuN1wiLFwiY2hhbmdlc1wiOltcIk1ha2UgbWFya2luZyBvbmUgYWN0aW9uIHBlciBwbGF5ZXIsIGJhY2tmaWxsIG5hbWVzIGZvciBvbGRlciBtYXJrcywgdXNlIHRoZSBicmFja2V0LWJhc2VkIHByb21vdGlvbiB0YXJnZXQsIGFuZCBzaW1wbGlmeSB0aGUgc2VsZWN0ZWQgY29udGVzdCBidXR0b25zIGFuZCB2ZXJzaW9uIGJhZGdlLlwiXX0se1widmVyc2lvblwiOlwiMC42LjZcIixcImNoYW5nZXNcIjpbXCJBZGQgc2V0dGluZyBoZWxwIGluIEhIKyssIGltcHJvdmUgbWFyayBjb250cmFzdCBhbmQgbWFuYWdlbWVudCwgYW5kIGFkZCBhdXRvbWF0aWMgY29udGVzdCBkZWZhdWx0cy5cIixcIlJlbmFtZSB0aGUgc2VwYXJhdGVseSBpbnN0YWxsZWQgdGVzdGluZyB1c2Vyc2NyaXB0IHRvIERldi5cIl19LHtcInZlcnNpb25cIjpcIjAuNi41XCIsXCJjaGFuZ2VzXCI6W1wiTW92ZSB0aGUgdXNlcnNjcmlwdCBzb3VyY2UgaW50byBUeXBlU2NyaXB0IG1vZHVsZXMgYW5kIGFkZCBzZXBhcmF0ZSBzdGFibGUgYW5kIHRlc3RpbmcgYnVpbGRzLlwiXX0se1widmVyc2lvblwiOlwiMC42LjRcIixcImNoYW5nZXNcIjpbXCJQcmV2ZW50IHBpbm5lZCBjb250ZXN0IHN0YXJ0dXAgc2Nyb2xsaW5nLCBrZWVwIG5hdGl2ZSBzdGFydHVwIHdpdGhvdXQgYSBwaW4sIGFuZCBjbGVhciBmaW5pc2hlZCBwaW5zXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuM1wiLFwiY2hhbmdlc1wiOltcIlN0b3AgYm90aCBjb250ZXN0IHN0YXJ0dXAgc2Nyb2xscywgaXNvbGF0ZSB0aGUgc2VsZWN0ZWQgbGVhZGVyYm9hcmQsIGFuZCByZXN0b3JlIHBpbm5lZCBjb250ZXN0cyBhdCBUb3Agb3IgTXkgcmFua1wiXX0se1widmVyc2lvblwiOlwiMC42LjJcIixcImNoYW5nZXNcIjpbXCJQaW4gY29udGVzdHMgb24gdGhlaXIgY2FyZHMsIGhpZGUgdGhlIHN0YXJ0dXAgc2Nyb2xsLCBhbmQgdXNlIHJpZ2h0LWNsaWNrIG1hcmtpbmcgd2l0aCBpc29sYXRlZCBzZXR0aW5ncyBzY3JvbGxpbmdcIl19LHtcInZlcnNpb25cIjpcIjAuNi4xXCIsXCJjaGFuZ2VzXCI6W1wiUmVhZCBuYXRpdmUgTWFuZ2EgUlBHIGNvbnRlc3QgdGl0bGVzIGFuZCByZWNvZ25pemUgYWN0aXZlIGNhcmRzIHdoZW4gY29udGVzdCBkYXRhIGlzIHVuYXZhaWxhYmxlXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBhIGNvbnRlc3Qgc3RhcnQgcHJlZmVyZW5jZSwgY29udGludW91cyBtYXJraW5nLCBhbmQgY29tcGFjdCBzZXR0aW5ncyB3aXRoIGEgdmVyc2lvbiBsYWJlbFwiXX0se1widmVyc2lvblwiOlwiMC41LjBcIixcImNoYW5nZXNcIjpbXCJBZGQgbGVhZ3VlIGFuZCBjb250ZXN0IHBsYXllciBtYXJraW5nIHdpdGggY3VzdG9tIGNvbG9ycywgY29tcGFjdCBzZXR0aW5ncywgYW5kIGxpbWl0IFRvcCAyMCB0byBwcm9tb3RhYmxlIGxlYWd1ZXNcIl19LHtcInZlcnNpb25cIjpcIjAuNC4yXCIsXCJjaGFuZ2VzXCI6W1wiRml4IG1vZHVsZSBzdGFydHVwLCBsZWFndWUgY29udHJvbHMsIGFuZCByYWlkIGV4cG9ydHM7IGFkZCB0aGUgVG9wIDIwIGxlYWd1ZSB0YXJnZXRcIl19LHtcInZlcnNpb25cIjpcIjAuNC4xXCIsXCJjaGFuZ2VzXCI6W1wiRml4IExvdmUgUmFpZHMgc2hhZG93cyByZXBsYWNlbWVudFwiXX0se1widmVyc2lvblwiOlwiMC40LjBcIixcImNoYW5nZXNcIjpbXCJBZGQgQWN0aXZpdHlQYXJzZXIgbW9kdWxlXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjMuMVwiLFwiY2hhbmdlc1wiOltcIkFkZCBoYXJlbSBsaW5rIGluc2lkZSBsb3ZlIHJhaWQgY2FyZHNcIl19LHtcInZlcnNpb25cIjpcIjAuMy4wXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIExvdmVSYWlkc0FkZG9uIGFuZCBMb3ZlUmFpZHNQYXJzZXIgbW9kdWxlc1wiXX0se1widmVyc2lvblwiOlwiMC4yLjBcIixcImNoYW5nZXNcIjpbXCJBZGQgUmVtb3ZlUGFzc0xvY2sgbW9kdWxlXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjEuM1wiLFwiY2hhbmdlc1wiOltcIkJldHRlciBjb2RlIHByYWN0aWNlc1wiXX0se1widmVyc2lvblwiOlwiMC4xLjJcIixcImNoYW5nZXNcIjpbXCJQb2xpc2hpbmcgYW5kIHVwZGF0ZSBsaW5rc1wiXX0se1widmVyc2lvblwiOlwiMC4xLjFcIixcImNoYW5nZXNcIjpbXCJBZGQgRnJpZW5kQW5kRm9lcyBtb2R1bGVcIl19LHtcInZlcnNpb25cIjpcIjAuMC4xXCIsXCJjaGFuZ2VzXCI6W1wiSW5pdGlhbCByZWxlYXNlXCJdfV0iLCAiaW50ZXJmYWNlIENoYW5nZWxvZ1ZpZXcge1xuICAgIGNvbnRlbnQ6IEhUTUxFbGVtZW50O1xuICAgIGNsb3NlQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICBzaG91bGRPcGVuOiAoKSA9PiBib29sZWFuO1xuICAgIG9uT3BlbjogKCkgPT4gdm9pZDtcbiAgICBvbkNsb3NlOiAoKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0NoYW5nZWxvZ1BvcHVwKHZpZXc6IENoYW5nZWxvZ1ZpZXcpIHtcbiAgICBpZiAoIXZpZXcuc2hvdWxkT3BlbigpKSB7XG4gICAgICAgIHZpZXcub25DbG9zZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZGlhbG9nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGlhbG9nJyk7XG4gICAgZGlhbG9nLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY2hhbmdlbG9nLXBvcHVwJztcbiAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsbGVkYnknLCAnamFydmlzLWNoYW5nZWxvZy10aXRsZScpO1xuICAgIGRpYWxvZy5hcHBlbmRDaGlsZCh2aWV3LmNvbnRlbnQpO1xuXG4gICAgY29uc3QgZmluaXNoID0gKCkgPT4ge1xuICAgICAgICBpZiAoIWRpYWxvZy5pc0Nvbm5lY3RlZCkgcmV0dXJuO1xuICAgICAgICBkaWFsb2cucmVtb3ZlKCk7XG4gICAgICAgIHZpZXcub25DbG9zZSgpO1xuICAgIH07XG4gICAgLy8gQXBwbHkgdGhlIHVzZXIncyBjaG9pY2UgYmVmb3JlIGEgc3Vic2VxdWVudCBjbGljayBvciBwYWdlIG5hdmlnYXRpb24uXG4gICAgY29uc3QgZGlzbWlzcyA9ICgpID0+IHtcbiAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgIGZpbmlzaCgpO1xuICAgIH07XG4gICAgdmlldy5jbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRpc21pc3MpO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjYW5jZWwnLCBldmVudCA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRpc21pc3MoKTtcbiAgICB9KTtcbiAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgIT09IGRpYWxvZykgcmV0dXJuO1xuICAgICAgICBjb25zdCBib3VuZHMgPSBkaWFsb2cuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGlmIChldmVudC5jbGllbnRYIDwgYm91bmRzLmxlZnQgfHwgZXZlbnQuY2xpZW50WCA+IGJvdW5kcy5yaWdodCB8fFxuICAgICAgICAgICAgZXZlbnQuY2xpZW50WSA8IGJvdW5kcy50b3AgfHwgZXZlbnQuY2xpZW50WSA+IGJvdW5kcy5ib3R0b20pIGRpc21pc3MoKTtcbiAgICB9KTtcbiAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCBmaW5pc2gsIHsgb25jZTogdHJ1ZSB9KTtcblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcbiAgICB0cnkge1xuICAgICAgICBkaWFsb2cuc2hvd01vZGFsKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGZpbmlzaCgpO1xuICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgb3BlbiB0aGUgY2hhbmdlbG9nOicsIGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmlldy5jbG9zZUJ1dHRvbi5mb2N1cyh7IHByZXZlbnRTY3JvbGw6IHRydWUgfSk7XG4gICAgdmlldy5vbk9wZW4oKTtcbn1cbiIsICJpbXBvcnQgcmVsZWFzZU5vdGVzIGZyb20gJy4uLy4uLy4uL0NIQU5HRUxPRy5tZCc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgSEhNb2R1bGUsIHR5cGUgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBsc0dldCwgbHNTZXQgfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcbmltcG9ydCB7IHNob3dDaGFuZ2Vsb2dQb3B1cCB9IGZyb20gJy4vY2hhbmdlbG9nUG9wdXAnO1xuXG5jb25zdCBzZWVuS2V5ID0gYENoYW5nZWxvZ1NlZW4ke1VTRVJTQ1JJUFRfQ0hBTk5FTH1gO1xuY29uc3QgbGF0ZXN0VmVyc2lvbiA9IHJlbGVhc2VOb3Rlc1swXS52ZXJzaW9uO1xuY29uc3QgY29uZmlnS2V5ID0gJ0pBUlZJU19jaGFuZ2Vsb2cnO1xuY29uc3Qgc2lsZW50S2V5ID0gYCR7Y29uZmlnS2V5fV9zaWxlbnRgO1xuY29uc3Qgc2V0dGluZ3NDYXJkID0gYC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmNvbmZpZy1zZXR0aW5nW3JlbD1cIiR7Y29uZmlnS2V5fVwiXWA7XG5jb25zdCBoaFBsdXNQbHVzU3RvcmFnZSA9ICdISFBsdXNQbHVzJztcblxuZnVuY3Rpb24gcmVhZEhIUGx1c1BsdXNTZXR0aW5ncygpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgY29uc3Qgc2F2ZWQgPSBsc0dldCgnQ29uZmlnJywgaGhQbHVzUGx1c1N0b3JhZ2UpO1xuICAgIGlmIChzYXZlZCAmJiB0eXBlb2Ygc2F2ZWQgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHNhdmVkKSkgcmV0dXJuIHNhdmVkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHJldHVybiB7fTtcbn1cblxuZnVuY3Rpb24gcmVhZFNlZW5WZXJzaW9uKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNlZW4gPSBsc0dldChzZWVuS2V5KTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBzZWVuID09PSAnc3RyaW5nJyAmJiAvXlxcZCtcXC5cXGQrXFwuXFxkKyQvLnRlc3Qoc2VlbikgPyBzZWVuIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc05ld2VyKHZlcnNpb246IHN0cmluZywgcHJldmlvdXM6IHN0cmluZyB8IG51bGwpIHtcbiAgICBpZiAoIXByZXZpb3VzKSByZXR1cm4gdHJ1ZTtcblxuICAgIGNvbnN0IG9sZFBhcnRzID0gcHJldmlvdXMuc3BsaXQoJy4nKS5tYXAoTnVtYmVyKTtcbiAgICBjb25zdCBuZXdQYXJ0cyA9IHZlcnNpb24uc3BsaXQoJy4nKS5tYXAoTnVtYmVyKTtcbiAgICBmb3IgKGNvbnN0IFtpbmRleCwgcGFydF0gb2YgbmV3UGFydHMuZW50cmllcygpKSB7XG4gICAgICAgIGlmIChwYXJ0ICE9PSBvbGRQYXJ0c1tpbmRleF0pIHJldHVybiBwYXJ0ID4gb2xkUGFydHNbaW5kZXhdO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHJlbGVhc2VTZWN0aW9uKHJlbGVhc2U6IHR5cGVvZiByZWxlYXNlTm90ZXNbbnVtYmVyXSkge1xuICAgIGNvbnN0IHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgY29uc3QgaGVhZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgaGVhZGluZy50ZXh0Q29udGVudCA9IGB2JHtyZWxlYXNlLnZlcnNpb259YDtcbiAgICBjb25zdCBjaGFuZ2VzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiByZWxlYXNlLmNoYW5nZXMpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgIGl0ZW0udGV4dENvbnRlbnQgPSBjaGFuZ2U7XG4gICAgICAgIGNoYW5nZXMuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gICAgfVxuICAgIHNlY3Rpb24uYXBwZW5kKGhlYWRpbmcsIGNoYW5nZXMpO1xuICAgIHJldHVybiBzZWN0aW9uO1xufVxuXG5leHBvcnQgY2xhc3MgQ2hhbmdlbG9nIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgcGVuZGluZzogJ2F1dG9tYXRpYycgfCAnbWFudWFsJyB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgb3BlbmVyOiBIVE1MQnV0dG9uRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgdmlld2VkVGhpc1BhZ2UgPSBmYWxzZTtcbiAgICBwcml2YXRlIGxvYWRMaXN0ZW5lcjogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzZXR0aW5nc0luc3RhbGxlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgc2lsZW50ID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBub3RpY2U6IEhUTUxCdXR0b25FbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBub3RpY2VMYXlvdXQ6IFJlc2l6ZU9ic2VydmVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSB3YWl0aW5nRm9yTm90aWNlQW5jaG9yID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdjaGFuZ2Vsb2cnO1xuICAgICAgICBzdXBlcih7IG5hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYToge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscCgnVXBkYXRlIG5vdGljZXMnLCAnU2hvdyB0aGUgY2hhbmdlbG9nIHRoZSBmaXJzdCB0aW1lIHlvdSBsb2FkIHRoZSBob21lcGFnZSBhZnRlciBhbiB1cGRhdGUuIFVzZSBWaWV3IGNoYW5nZWxvZyB0byBvcGVuIGl0IHdoZW5ldmVyIHlvdSBsaWtlLicpLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ3NpbGVudCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKCdTaWxlbnQgY2hhbmdlbG9nJywgJ1Nob3cgYSBzbWFsbCBhcmMtcmVhY3RvciBpY29uIGJlc2lkZSBISCsrIG9uIHRoZSBob21lcGFnZSBhZnRlciBhbiB1cGRhdGUuIENsaWNrIGl0IHRvIHJlYWQgdGhlIGNoYW5nZWxvZy4nKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfSB9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZSA9PT0gJy9ob21lLmh0bWwnO1xuICAgIH1cblxuICAgIGluc3RhbGxTZXR0aW5ncygpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNob3VsZFJ1bigpKSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0dGluZ3NJbnN0YWxsZWQgPSB0cnVlO1xuXG4gICAgICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2V0dGluZ3NDYXJkLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZXR0aW5nc0NhcmQpO1xuICAgICAgICAgICAgaWYgKCFjYXJkIHx8IGNhcmQucXVlcnlTZWxlY3RvcignLmphcnZpcy12aWV3LWNoYW5nZWxvZycpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uIGphcnZpcy12aWV3LWNoYW5nZWxvZyc7XG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAnVmlldyBjaGFuZ2Vsb2cnO1xuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5vcGVuKCdtYW51YWwnLCBidXR0b24pKTtcbiAgICAgICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcnVuKHsgc2lsZW50ID0gZmFsc2UgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSByZXR1cm47XG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zaWxlbnQgPSBzaWxlbnQ7XG4gICAgICAgIC8vIEhIKysgY2FuIHJ1biB0aGUgbW9kdWxlIGFnYWluIHdoZW4gdGhlIHVzZXIgdHVybnMgbm90aWNlcyBvbiBpbiB0aGUgc2V0dGluZ3MgcGFuZS5cbiAgICAgICAgY29uc3QgYWxsb3dBdXRvbWF0aWMgPSAhdGhpcy5zZXR0aW5nc0luc3RhbGxlZDtcblxuICAgICAgICBjb25zdCBjaGVjayA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNVbnJlYWRVcGRhdGUoKSkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2lsZW50KSB0aGlzLnNob3dOb3RpY2UoKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGFsbG93QXV0b21hdGljKSB0aGlzLm9wZW4oJ2F1dG9tYXRpYycpO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykgY2hlY2soKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRMaXN0ZW5lciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgY2hlY2ssIHsgb25jZTogdHJ1ZSwgc2lnbmFsOiB0aGlzLmxvYWRMaXN0ZW5lci5zaWduYWwgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0ZWFyRG93bigpIHtcbiAgICAgICAgdGhpcy5sb2FkTGlzdGVuZXI/LmFib3J0KCk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVtb3ZlTm90aWNlKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlU3ViU2V0dGluZyhrZXk6IHN0cmluZywgdmFsdWU6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKGtleSAhPT0gJ3NpbGVudCcpIHJldHVybjtcbiAgICAgICAgdGhpcy5zaWxlbnQgPSB2YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlKSB0aGlzLnNob3dOb3RpY2UoKTtcbiAgICAgICAgZWxzZSB0aGlzLnJlbW92ZU5vdGljZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFzVW5yZWFkVXBkYXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNSdW4gJiYgIXRoaXMudmlld2VkVGhpc1BhZ2UgJiYgaXNOZXdlcihsYXRlc3RWZXJzaW9uLCByZWFkU2VlblZlcnNpb24oKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG93Tm90aWNlKCkge1xuICAgICAgICBpZiAoIXRoaXMuc2lsZW50IHx8ICF0aGlzLmhhc1VucmVhZFVwZGF0ZSgpIHx8IHRoaXMubm90aWNlIHx8IHRoaXMud2FpdGluZ0Zvck5vdGljZUFuY2hvcikgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gJy5oaC1wbHVzLXBsdXMtY29uZmlnLWJ1dHRvbic7XG4gICAgICAgIHRoaXMud2FpdGluZ0Zvck5vdGljZUFuY2hvciA9IHRydWU7XG4gICAgICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMud2FpdGluZ0Zvck5vdGljZUFuY2hvciA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgYW5jaG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oc2VsZWN0b3IpO1xuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gYW5jaG9yPy5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgaWYgKCFhbmNob3IgfHwgIXBhcmVudCB8fCAhdGhpcy5zaWxlbnQgfHwgIXRoaXMuaGFzVW5yZWFkVXBkYXRlKCkpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY2hhbmdlbG9nLW5vdGljZSc7XG4gICAgICAgICAgICBidXR0b24uZGF0YXNldC50b29sdGlwID0gJ0phcnZpcyB3YXMgdXBkYXRlZCc7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ0phcnZpcyB3YXMgdXBkYXRlZC4gVmlldyBjaGFuZ2Vsb2cuJyk7XG4gICAgICAgICAgICBidXR0b24uaW5uZXJIVE1MID0gYDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS4zNVwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+XG4gICAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIxMFwiLz5cbiAgICAgICAgICAgICAgICA8Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjcuNFwiIHN0cm9rZS1kYXNoYXJyYXk9XCIzIDEuNjVcIi8+XG4gICAgICAgICAgICAgICAgPHBhdGggZD1cIk0xMiA3LjZsNC40IDcuNkg3LjZaXCIvPlxuICAgICAgICAgICAgPC9zdmc+YDtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW4oJ21hbnVhbCcsIGJ1dHRvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIEEgc2libGluZyBrZWVwcyB0aGUgcmVhY3RvciBvdXRzaWRlIEhIKysncyBuYXRpdmUgdG9vbHRpcCB0YXJnZXQuXG4gICAgICAgICAgICBhbmNob3IuYWZ0ZXIoYnV0dG9uKTtcbiAgICAgICAgICAgIHRoaXMubm90aWNlID0gYnV0dG9uO1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmxlZnQgPSBgJHthbmNob3Iub2Zmc2V0TGVmdH1weGA7XG4gICAgICAgICAgICAgICAgYnV0dG9uLnN0eWxlLnRvcCA9IGAke2FuY2hvci5vZmZzZXRUb3AgKyBhbmNob3Iub2Zmc2V0SGVpZ2h0IC8gMn1weGA7XG4gICAgICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmhlaWdodCA9IGAke2FuY2hvci5vZmZzZXRIZWlnaHQgKiAuN31weGA7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcG9zaXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMubm90aWNlTGF5b3V0ID0gbmV3IFJlc2l6ZU9ic2VydmVyKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIHRoaXMubm90aWNlTGF5b3V0Lm9ic2VydmUoYW5jaG9yKTtcbiAgICAgICAgICAgIHRoaXMubm90aWNlTGF5b3V0Lm9ic2VydmUocGFyZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVOb3RpY2UoKSB7XG4gICAgICAgIHRoaXMubm90aWNlTGF5b3V0Py5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubm90aWNlTGF5b3V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5ub3RpY2U/LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLm5vdGljZSA9IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzeW5jTm90aWNlU2V0dGluZ3MoY29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuICAgICAgICBmb3IgKGNvbnN0IGNhcmQgb2YgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZXR0aW5nc0NhcmQpKSB7XG4gICAgICAgICAgICBjb25zdCBlbmFibGVkID0gY29uZmlnW2NvbmZpZ0tleV0gIT09IGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgY2hlY2tib3ggPSBjYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTElucHV0RWxlbWVudD4oYGlucHV0W25hbWU9XCIke2NvbmZpZ0tleX1cIl1gKTtcbiAgICAgICAgICAgIGNvbnN0IHNpbGVudCA9IGNhcmQucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihgaW5wdXRbbmFtZT1cIiR7c2lsZW50S2V5fVwiXWApO1xuICAgICAgICAgICAgY2FyZC5jbGFzc0xpc3QudG9nZ2xlKCdlbmFibGVkJywgZW5hYmxlZCk7XG4gICAgICAgICAgICBpZiAoY2hlY2tib3gpIGNoZWNrYm94LmNoZWNrZWQgPSBlbmFibGVkO1xuICAgICAgICAgICAgaWYgKHNpbGVudCkge1xuICAgICAgICAgICAgICAgIHNpbGVudC5jaGVja2VkID0gY29uZmlnW3NpbGVudEtleV0gPT09IHRydWU7XG4gICAgICAgICAgICAgICAgc2lsZW50LmRpc2FibGVkID0gIWVuYWJsZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNhdmVOb3RpY2VTZXR0aW5nKGtleTogdHlwZW9mIGNvbmZpZ0tleSB8IHR5cGVvZiBzaWxlbnRLZXksIHZhbHVlOiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHdpbmRvdy5oaFBsdXNQbHVzQ29uZmlnO1xuICAgICAgICBpZiAoIWNvbmZpZykgcmV0dXJuO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBUaGUgbGl2ZSBISCsrIGJ1aWxkIGtlZXBzIGl0cyBpbi1tZW1vcnkgc2V0dGluZ3MgcHJpdmF0ZS5cbiAgICAgICAgICAgIGNvbnN0IHNhdmVkID0geyAuLi5yZWFkSEhQbHVzUGx1c1NldHRpbmdzKCksIFtrZXldOiB2YWx1ZSB9O1xuICAgICAgICAgICAgbHNTZXQoJ0NvbmZpZycsIHNhdmVkLCBoaFBsdXNQbHVzU3RvcmFnZSk7XG4gICAgICAgICAgICBjb25maWcubG9hZENvbmZpZygpO1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gc2lsZW50S2V5KSB0aGlzLnVwZGF0ZVN1YlNldHRpbmcoJ3NpbGVudCcsIHZhbHVlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKCF2YWx1ZSkgdGhpcy50ZWFyRG93bigpO1xuICAgICAgICAgICAgdGhpcy5zeW5jTm90aWNlU2V0dGluZ3Moc2F2ZWQpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBzYXZlIHRoZSB1cGRhdGUgbm90aWNlIHByZWZlcmVuY2U6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb3Blbihtb2RlOiAnYXV0b21hdGljJyB8ICdtYW51YWwnLCBvcGVuZXI6IEhUTUxCdXR0b25FbGVtZW50IHwgbnVsbCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNob3VsZFJ1bigpKSByZXR1cm47XG4gICAgICAgIGlmIChtb2RlID09PSAnbWFudWFsJykgdGhpcy5vcGVuZXIgPSBvcGVuZXI7XG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmcpIHtcbiAgICAgICAgICAgIGlmIChtb2RlID09PSAnbWFudWFsJykgdGhpcy5wZW5kaW5nID0gbW9kZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBlbmRpbmcgPSBtb2RlO1xuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzID0gcmVhZFNlZW5WZXJzaW9uKCk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGVudC5jbGFzc05hbWUgPSAnY29udGFpbmVyLXNwZWNpYWwtYmcgamFydmlzLWNoYW5nZWxvZy1jb250ZW50JztcbiAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgICAgICB0aXRsZS5pZCA9ICdqYXJ2aXMtY2hhbmdlbG9nLXRpdGxlJztcbiAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSAnSmFydmlzIGNoYW5nZWxvZyc7XG4gICAgICAgIGNvbnN0IG5vdGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG5vdGVzLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY2hhbmdlbG9nLW5vdGVzJztcbiAgICAgICAgY29uc3QgbmV3UmVsZWFzZXMgPSBwcmV2aW91cyAmJiBpc05ld2VyKGxhdGVzdFZlcnNpb24sIHByZXZpb3VzKVxuICAgICAgICAgICAgPyByZWxlYXNlTm90ZXMuZmlsdGVyKHJlbGVhc2UgPT4gaXNOZXdlcihyZWxlYXNlLnZlcnNpb24sIHByZXZpb3VzKSkubGVuZ3RoXG4gICAgICAgICAgICA6IDE7XG4gICAgICAgIG5vdGVzLmFwcGVuZCguLi5yZWxlYXNlTm90ZXMuc2xpY2UoMCwgbmV3UmVsZWFzZXMpLm1hcChyZWxlYXNlU2VjdGlvbikpO1xuICAgICAgICBjb25zdCBlYXJsaWVyID0gcmVsZWFzZU5vdGVzLnNsaWNlKG5ld1JlbGVhc2VzKTtcbiAgICAgICAgaWYgKGVhcmxpZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBoaXN0b3J5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGV0YWlscycpO1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N1bW1hcnknKTtcbiAgICAgICAgICAgIHN1bW1hcnkudGV4dENvbnRlbnQgPSAnRWFybGllciB2ZXJzaW9ucyc7XG4gICAgICAgICAgICBoaXN0b3J5LmFwcGVuZChzdW1tYXJ5LCAuLi5lYXJsaWVyLm1hcChyZWxlYXNlU2VjdGlvbikpO1xuICAgICAgICAgICAgbm90ZXMuYXBwZW5kQ2hpbGQoaGlzdG9yeSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmb290ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb290ZXInKTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBvcHRpb25zLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY2hhbmdlbG9nLW9wdGlvbnMnO1xuICAgICAgICBjb25zdCBvcHRPdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICBjb25zdCBkb250U2hvd0FnYWluID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgZG9udFNob3dBZ2Fpbi50eXBlID0gJ2NoZWNrYm94JztcbiAgICAgICAgb3B0T3V0LmFwcGVuZChkb250U2hvd0FnYWluLCAnRG9u4oCZdCBzaG93IGFnYWluJyk7XG4gICAgICAgIGNvbnN0IHNpbGVudE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgICAgIGNvbnN0IHVzZVNpbGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIHVzZVNpbGVudC50eXBlID0gJ2NoZWNrYm94JztcbiAgICAgICAgdXNlU2lsZW50LmNoZWNrZWQgPSB0aGlzLnNpbGVudDtcbiAgICAgICAgc2lsZW50T3B0aW9uLnRpdGxlID0gJ1Nob3cgYW4gdXBkYXRlIGljb24gYmVzaWRlIEhIKysgZm9yIGZ1dHVyZSB1cGRhdGVzLic7XG4gICAgICAgIHNpbGVudE9wdGlvbi5hcHBlbmQodXNlU2lsZW50LCAnU2lsZW50IGNoYW5nZWxvZycpO1xuICAgICAgICBkb250U2hvd0FnYWluLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHVzZVNpbGVudC5kaXNhYmxlZCA9IGRvbnRTaG93QWdhaW4uY2hlY2tlZCk7XG4gICAgICAgIG9wdGlvbnMuYXBwZW5kKG9wdE91dCwgc2lsZW50T3B0aW9uKTtcbiAgICAgICAgY29uc3QgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgY2xvc2VCdXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBjbG9zZUJ1dHRvbi5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uJztcbiAgICAgICAgY2xvc2VCdXR0b24udGV4dENvbnRlbnQgPSAnQ2xvc2UnO1xuICAgICAgICBmb290ZXIuYXBwZW5kQ2hpbGQoY2xvc2VCdXR0b24pO1xuICAgICAgICBjb250ZW50LmFwcGVuZCh0aXRsZSwgbm90ZXMsIGZvb3Rlcik7XG5cbiAgICAgICAgc2hvd0NoYW5nZWxvZ1BvcHVwKHtcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICBjbG9zZUJ1dHRvbixcbiAgICAgICAgICAgIHNob3VsZE9wZW46ICgpID0+IHRoaXMucGVuZGluZyA9PT0gJ21hbnVhbCcgfHwgKCF0aGlzLnNpbGVudCAmJiB0aGlzLmhhc1VucmVhZFVwZGF0ZSgpKSxcbiAgICAgICAgICAgIG9uT3BlbjogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudmlld2VkVGhpc1BhZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlTm90aWNlKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGFzUnVuKSBmb290ZXIucHJlcGVuZChvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNOZXdlcihsYXRlc3RWZXJzaW9uLCByZWFkU2VlblZlcnNpb24oKSkpIGxzU2V0KHNlZW5LZXksIGxhdGVzdFZlcnNpb24pO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB0aGUgdmlld2VkIGNoYW5nZWxvZyB2ZXJzaW9uOicsIGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ2xvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBlbmRpbmcgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChkb250U2hvd0FnYWluLmNoZWNrZWQpIHRoaXMuc2F2ZU5vdGljZVNldHRpbmcoY29uZmlnS2V5LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5oYXNSdW4gJiYgdXNlU2lsZW50LmNoZWNrZWQgIT09IHRoaXMuc2lsZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZU5vdGljZVNldHRpbmcoc2lsZW50S2V5LCB1c2VTaWxlbnQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMub3BlbmVyPy5mb2N1cyh7IHByZXZlbnRTY3JvbGw6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuZXIgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuXG5jb25zdCBsb2dvU2VsZWN0b3IgPSAnI2hvbWVfbG9nbywgLmhoX2xvZ28nO1xuY29uc3QgdmFsb3JTZWxlY3RvciA9ICcjcG92X29wZW4sIFtyZWw9XCJwYXRoLW9mLXZhbG9yXCJdJztcbmNvbnN0IGdsb3J5U2VsZWN0b3IgPSAnI3BvZ19vcGVuLCBbcmVsPVwicGF0aC1vZi1nbG9yeVwiXSc7XG5cbmV4cG9ydCBjbGFzcyBHYW1lTGlua3MgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBsaXN0ZW5lcnM6IEFib3J0Q29udHJvbGxlciB8IG51bGwgPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnZ2FtZUxpbmtzJztcbiAgICAgICAgc3VwZXIoeyBuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWE6IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoJ09wZW4gZ2FtZSBsaW5rcyBpbiBuZXcgdGFicycsICdNaWRkbGUtY2xpY2sgb3IgQ3RybC1jbGljayB0aGUgZ2FtZSBsb2dvLCBQYXRoIG9mIFZhbG9yLCBvciBQYXRoIG9mIEdsb3J5IHRvIG9wZW4gdGhhdCBwYWdlIGluIGFub3RoZXIgdGFiLicpLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICB9IH0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4pIHJldHVybjtcblxuICAgICAgICBjb25zdCBzZWxlY3RvciA9IGN1cnJlbnRQYWdlID09PSAnL2hvbWUuaHRtbCcgfHwgY3VycmVudFBhZ2UgPT09ICcvJ1xuICAgICAgICAgICAgPyBgJHtsb2dvU2VsZWN0b3J9LCAke3ZhbG9yU2VsZWN0b3J9LCAke2dsb3J5U2VsZWN0b3J9YFxuICAgICAgICAgICAgOiBsb2dvU2VsZWN0b3I7XG4gICAgICAgIGNvbnN0IGdldExpbmsgPSAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgY29uc3QgY29udHJvbCA9IHRhcmdldC5jbG9zZXN0PEhUTUxFbGVtZW50PihzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoIWNvbnRyb2wgfHwgY29udHJvbC5jbG9zZXN0KCdbZGlzYWJsZWRdLCBbYXJpYS1kaXNhYmxlZD1cInRydWVcIl0nKSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSBjb250cm9sLm1hdGNoZXMobG9nb1NlbGVjdG9yKSA/ICcvaG9tZS5odG1sJ1xuICAgICAgICAgICAgICAgIDogY29udHJvbC5tYXRjaGVzKHZhbG9yU2VsZWN0b3IpID8gJy9wYXRoLW9mLXZhbG9yLmh0bWwnIDogJy9wYXRoLW9mLWdsb3J5Lmh0bWwnO1xuICAgICAgICAgICAgY29uc3QgYW5jaG9yID0gdGFyZ2V0LmNsb3Nlc3Q8SFRNTEFuY2hvckVsZW1lbnQ+KCdhW2hyZWZdJyk7XG4gICAgICAgICAgICBpZiAoYW5jaG9yPy5vcmlnaW4gPT09IGxvY2F0aW9uLm9yaWdpbiAmJlxuICAgICAgICAgICAgICAgIChhbmNob3IucGF0aG5hbWUgPT09IHBhdGggfHwgKHBhdGggPT09ICcvaG9tZS5odG1sJyAmJiBhbmNob3IucGF0aG5hbWUgPT09ICcvJykpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgYW5jaG9yLCBocmVmOiBhbmNob3IuaHJlZiB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFuY2hvciAmJiBhbmNob3IgIT09IGNvbnRyb2wgJiYgY29udHJvbC5jb250YWlucyhhbmNob3IpKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgY29uc3QgbmF0aXZlVXJsID0gY29udHJvbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXJsJyk7XG4gICAgICAgICAgICBjb25zdCBocmVmID0gbmF0aXZlVXJsIHx8IHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZ2V0SHJlZihwYXRoKTtcbiAgICAgICAgICAgIGNvbnN0IGRlc3RpbmF0aW9uID0gbmV3IFVSTChocmVmLCBsb2NhdGlvbi5ocmVmKTtcbiAgICAgICAgICAgIGlmIChkZXN0aW5hdGlvbi5vcmlnaW4gIT09IGxvY2F0aW9uLm9yaWdpbiB8fCBkZXN0aW5hdGlvbi5wYXRobmFtZSAhPT0gcGF0aCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4geyBhbmNob3I6IG51bGwsIGhyZWY6IGRlc3RpbmF0aW9uLmhyZWYgfTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHsgY2FwdHVyZTogdHJ1ZSwgc2lnbmFsOiB0aGlzLmxpc3RlbmVycy5zaWduYWwgfTtcbiAgICAgICAgY29uc3Qgb3BlbkluTmV3VGFiID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaW5rID0gZ2V0TGluayhldmVudCk7XG4gICAgICAgICAgICBpZiAoIWxpbmspIHJldHVybjtcblxuICAgICAgICAgICAgLy8gU3RvcCB0aGUgZ2FtZSdzIGNsaWNrIHJlZGlyZWN0LCB3aGlsZSBhbGxvd2luZyByZWFsIGxpbmtzIHRvIG9wZW4gbm9ybWFsbHkuXG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGlmIChsaW5rLmFuY2hvcikgcmV0dXJuO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHdpbmRvdy5vcGVuKGxpbmsuaHJlZiwgJ19ibGFuaycsICdub29wZW5lcicpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5idXR0b24gPT09IDAgJiYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSkpIG9wZW5Jbk5ld1RhYihldmVudCk7XG4gICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYXV4Y2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAxKSBvcGVuSW5OZXdUYWIoZXZlbnQpO1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5idXR0b24gPT09IDEgJiYgZ2V0TGluayhldmVudCk/LmFuY2hvciA9PT0gbnVsbCkgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0ZWFyRG93bigpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnM/LmFib3J0KCk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gZmFsc2U7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IGluaXRHYW1lIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IGluamVjdFN0eWxlcywgcGFja1NldHRpbmdzIH0gZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBGcmllbmRBbmRGb2VzIH0gZnJvbSAnLi9tb2R1bGVzL3BsYXllcnMvRnJpZW5kQW5kRm9lcyc7XG5pbXBvcnQgeyBhcm1Db250ZXN0U3RhcnR1cEd1YXJkLCBDb250ZXN0U3RhcnQgfSBmcm9tICcuL21vZHVsZXMvY29udGVzdHMvQ29udGVzdFN0YXJ0JztcbmltcG9ydCB7IGluc3RhbGxDb250ZXN0U2V0dGluZ3MgfSBmcm9tICcuL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzJztcbmltcG9ydCB7IExlYWd1ZVRvcDIwIH0gZnJvbSAnLi9tb2R1bGVzL3BsYXllcnMvTGVhZ3VlVG9wMjAnO1xuaW1wb3J0IHsgUmVtb3ZlUGFzc0xvY2sgfSBmcm9tICcuL21vZHVsZXMvcHJvZ3Jlc3Npb24vUmVtb3ZlUGFzc0xvY2snO1xuaW1wb3J0IHsgTG92ZVJhaWRzQWRkb24gfSBmcm9tICcuL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNBZGRvbic7XG5pbXBvcnQgeyBMb3ZlUmFpZHNQYXJzZXIgfSBmcm9tICcuL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNQYXJzZXInO1xuaW1wb3J0IHsgQWN0aXZpdHlQYXJzZXIgfSBmcm9tICcuL21vZHVsZXMvYWN0aXZpdGllcy9BY3Rpdml0eVBhcnNlcic7XG5pbXBvcnQgeyBDaGFuZ2Vsb2cgfSBmcm9tICcuL21vZHVsZXMvdXBkYXRlcy9DaGFuZ2Vsb2cnO1xuaW1wb3J0IHsgR2FtZUxpbmtzIH0gZnJvbSAnLi9tb2R1bGVzL25hdmlnYXRpb24vR2FtZUxpbmtzJztcblxuYXJtQ29udGVzdFN0YXJ0dXBHdWFyZCgpO1xuXG5mdW5jdGlvbiBydW5KYXJ2aXMoKSB7XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcnVuSmFydmlzLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7ICQgfSA9IHdpbmRvdztcblxuICAgIGlmICghJCkge1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBydW5KYXJ2aXMsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1dBUk5JTkc6IE5vIGpRdWVyeSBmb3VuZC4gRW5kaW5nIHNjcmlwdC4nKTtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coJ0hlbGxvLCBTaXIsIEouQS5SLlYuSS5TLiBpcyByZWFkeSB0byBoZWxwIHlvdS4nKTtcblxuICAgIGluaXRHYW1lKCQpO1xuICAgIGluamVjdFN0eWxlcygpO1xuXG4gICAgY29uc3QgZnJpZW5kc0FuZEZvZXMgPSBuZXcgRnJpZW5kQW5kRm9lcygpO1xuICAgIGNvbnN0IGNoYW5nZWxvZyA9IG5ldyBDaGFuZ2Vsb2coKTtcbiAgICBjb25zdCBhbGxNb2R1bGVzID0gW1xuICAgICAgICBmcmllbmRzQW5kRm9lcyxcbiAgICAgICAgbmV3IENvbnRlc3RTdGFydCgpLFxuICAgICAgICBuZXcgTGVhZ3VlVG9wMjAoKSxcbiAgICAgICAgbmV3IFJlbW92ZVBhc3NMb2NrKCksXG4gICAgICAgIG5ldyBMb3ZlUmFpZHNBZGRvbigpLFxuICAgICAgICBuZXcgTG92ZVJhaWRzUGFyc2VyKCksXG4gICAgICAgIG5ldyBBY3Rpdml0eVBhcnNlcigpLFxuICAgICAgICBjaGFuZ2Vsb2csXG4gICAgICAgIG5ldyBHYW1lTGlua3MoKVxuICAgIF1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBydW5TY3JpcHQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGhoUGx1c1BsdXNDb25maWcgfSA9IHdpbmRvd1xuICAgICAgICAgICAgaWYgKCFoaFBsdXNQbHVzQ29uZmlnKSByZXR1cm47XG5cbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJHcm91cCh7XG4gICAgICAgICAgICAgICAga2V5OiAnSkFSVklTJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnSEggSmFydmlzJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGFsbE1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4ge1xuICAgICAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJNb2R1bGUobW9kdWxlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcubG9hZENvbmZpZygpXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJ1bk1vZHVsZXMoKVxuICAgICAgICAgICAgZnJpZW5kc0FuZEZvZXMuaW5zdGFsbFNldHRpbmdzKCk7XG4gICAgICAgICAgICBpbnN0YWxsQ29udGVzdFNldHRpbmdzKCk7XG4gICAgICAgICAgICBjaGFuZ2Vsb2cuaW5zdGFsbFNldHRpbmdzKCk7XG4gICAgICAgICAgICBwYWNrU2V0dGluZ3MoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aW5kb3cuaGhQbHVzUGx1c0NvbmZpZykge1xuICAgICAgICAgICAgcnVuU2NyaXB0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uZSgnaGgrKy1iZHNtOmxvYWRlZCcsIHJ1blNjcmlwdClcbiAgICAgICAgfVxuICAgIH0sIDEpXG59XG5cbnJ1bkphcnZpcygpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFPLE1BQUk7QUFDSixNQUFJO0FBRUosV0FBUyxTQUFTLFFBQXNCO0FBQzNDLFFBQUk7QUFDSixrQkFBYyxPQUFPLFNBQVM7QUFBQSxFQUNsQzs7O0FDTk8sV0FBUyxZQUFZLE9BQWUsYUFBcUI7QUFDNUQsVUFBTSxTQUFTLENBQUMsU0FBaUIsS0FBSyxXQUFXLEtBQUssT0FBTyxFQUFFLFdBQVcsS0FBSyxRQUFRLEVBQ2xGLFdBQVcsS0FBSyxNQUFNLEVBQUUsV0FBVyxLQUFLLE1BQU07QUFDbkQsV0FBTyxPQUFPLEtBQUssSUFBSSxzRkFDbkIsT0FBTyxLQUFLLElBQUksMEJBQTBCLE9BQU8sV0FBVyxJQUFJO0FBQUEsRUFDeEU7QUFFTyxXQUFTLGtCQUFrQixPQUFvQixXQUFtQjtBQUNyRSxVQUFNLFVBQVUsU0FBUyxjQUFjLEtBQUs7QUFDNUMsWUFBUSxLQUFLO0FBQ2IsWUFBUSxZQUFZO0FBQ3BCLFlBQVEsYUFBYSxRQUFRLFNBQVM7QUFDdEMsVUFBTSxVQUFVLE9BQU8sUUFBUSxnQkFBZ0I7QUFDL0MsUUFBSSxRQUFTLFNBQVEsYUFBYSxXQUFXLFFBQVE7QUFBQSxRQUNoRCxTQUFRLFNBQVM7QUFDdEIsYUFBUyxLQUFLLFlBQVksT0FBTztBQUVqQyxRQUFJLFNBQTZCO0FBQ2pDLFVBQU0sVUFB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O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0lPLFdBQVMsZUFBZTtBQUMzQixVQUFNLFFBQVEsU0FBUyxjQUFjLE9BQU87QUFDNUMsVUFBTSxZQUFZO0FBQ2xCLFVBQU0sVUFBVSxJQUFJLE9BQWtCLEdBQUcsT0FBK0IsU0FBUyxFQUFFO0FBQ25GLFVBQU0sY0FBYyxHQUFHLGdCQUFHO0FBQUEsMERBQzRCLE9BQU87QUFBQTtBQUU3RCxhQUFTLEtBQUssWUFBWSxLQUFLO0FBQUEsRUFDbkM7QUFFTyxXQUFTLGVBQWU7QUFDM0IsUUFBSSxnQkFBZ0IsYUFBYztBQUVsQyxVQUFNLFdBQVc7QUFDakIsV0FBTyxXQUFXLFFBQVEsd0JBQXdCLFVBQVUsTUFBTTtBQUM5RCxZQUFNLFFBQVEsU0FBUyxjQUEyQixRQUFRO0FBQzFELFVBQUksQ0FBQyxNQUFPO0FBQ1osWUFBTSxVQUFVLE9BQU8sV0FBVztBQUNsQyx3QkFBa0IsT0FBTyx3QkFBd0I7QUFDakQsYUFBTyxpQkFBaUIsU0FBUyxXQUFTO0FBQ3RDLFlBQUksTUFBTSxXQUFXLEVBQUUsTUFBTSxrQkFBa0IsU0FBUyxDQUFDLE1BQU0sU0FBUyxNQUFNLE1BQU0sRUFBRztBQUV2RixjQUFNLGVBQWU7QUFDckIsY0FBTSx5QkFBeUI7QUFDL0IsY0FBTSxPQUFPLE1BQU0sY0FBYyxJQUFJLEtBQUssTUFBTSxjQUFjLElBQUksTUFBTSxlQUFlO0FBQ3ZGLGNBQU0sUUFBUSxNQUFNLHNCQUFzQixFQUFFLFNBQVMsTUFBTSxnQkFBZ0I7QUFDM0UsY0FBTSxhQUFhLE1BQU0sU0FBUyxPQUFPO0FBQUEsTUFDN0MsR0FBRyxFQUFFLFNBQVMsTUFBTSxTQUFTLE1BQU0sQ0FBQztBQUVwQyxZQUFNLFFBQVEsTUFBTSxpQkFBOEIsaUJBQWlCO0FBQ25FLFlBQU0sT0FBTyxNQUFNO0FBQ2YsWUFBSSxDQUFDLE1BQU0sWUFBYTtBQUV4QixtQkFBVyxRQUFRLE9BQU87QUFDdEIsZUFBSyxNQUFNLFlBQVkseUJBQXlCLE9BQU8sS0FBSyxlQUFlLEVBQUUsQ0FBQztBQUFBLFFBQ2xGO0FBQ0EsY0FBTSxVQUFVLElBQUksd0JBQXdCO0FBQUEsTUFDaEQ7QUFDQSxZQUFNLGdCQUFnQixJQUFJLGlCQUFpQixJQUFJO0FBQy9DLFVBQUksTUFBTSxjQUFlLGVBQWMsUUFBUSxNQUFNLGVBQWUsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsRyxVQUFJLE9BQU8sbUJBQW1CLGFBQWE7QUFDdkMsY0FBTSxlQUFlLElBQUksZUFBZSxJQUFJO0FBQzVDLGNBQU0sUUFBUSxVQUFRLGFBQWEsUUFBUSxJQUFJLENBQUM7QUFBQSxNQUNwRDtBQUNBLFdBQUs7QUFBQSxJQUNULENBQUM7QUFBQSxFQUNMOzs7QUN6Q08sTUFBZSxXQUFmLE1BQXdCO0FBQUEsSUFDbEIsUUFBUTtBQUFBLElBQ1I7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUVULFlBQVksRUFBRSxhQUFhLEdBQWlEO0FBQ3hFLFdBQUssZUFBZTtBQUFBLElBQ3hCO0FBQUEsRUFJSjs7O0FDcEJPLE1BQU0saUJBQWlCO0FBRXZCLFdBQVMsTUFBTSxLQUFhLFVBQVUsZ0JBQXlCO0FBQ2xFLFdBQU8sS0FBSyxNQUFNLGFBQWEsUUFBUSxHQUFHLE9BQU8sR0FBRyxHQUFHLEVBQUUsS0FBSyxNQUFNO0FBQUEsRUFDeEU7QUFDTyxXQUFTLE1BQU0sS0FBYSxPQUFnQixVQUFVLGdCQUFnQjtBQUN6RSxXQUFPLGFBQWEsUUFBUSxHQUFHLE9BQU8sR0FBRyxHQUFHLElBQUksS0FBSyxVQUFVLEtBQUssQ0FBQztBQUFBLEVBQ3pFO0FBQ08sV0FBUyxLQUFLLEtBQWEsVUFBVSxnQkFBZ0I7QUFDeEQsV0FBTyxhQUFhLFdBQVcsR0FBRyxPQUFPLEdBQUcsR0FBRyxFQUFFO0FBQUEsRUFDckQ7OztBQ0FPLFdBQVMsZ0JBQWdCLE1BQXlCLFFBQWlDLE9BQXNCO0FBQzVHLFFBQUksU0FBUyxjQUFjLHNCQUFzQixFQUFHO0FBRXBELFVBQU0sU0FBUyxTQUFTLGNBQWMsUUFBUTtBQUM5QyxXQUFPLFlBQVk7QUFDbkIsV0FBTyxhQUFhLG1CQUFtQiwyQkFBMkI7QUFDbEUsVUFBTSxRQUFRLFNBQVMsY0FBYyxJQUFJO0FBQ3pDLFVBQU0sS0FBSztBQUNYLFVBQU0sY0FBYztBQUVwQixVQUFNLFFBQVEsU0FBUyxjQUFjLEtBQUs7QUFDMUMsVUFBTSxZQUFZO0FBQ2xCLFVBQU0sVUFBVSxTQUFTLGNBQWMsS0FBSztBQUM1QyxZQUFRLFlBQVk7QUFDcEIsVUFBTSxXQUFXLFdBQVcsbUJBQW1CLE1BQU07QUFDakQsVUFBSSxRQUFRLGdEQUFnRCxLQUFLLE1BQU0sR0FBRztBQUN0RSxlQUFPO0FBQ1AsY0FBTSxNQUFNO0FBQUEsTUFDaEI7QUFBQSxJQUNKLENBQUM7QUFDRCxVQUFNLFFBQVEsV0FBVyxTQUFTLE1BQU0sT0FBTyxNQUFNLENBQUM7QUFDdEQsWUFBUSxPQUFPLFVBQVUsS0FBSztBQUU5QixhQUFTLFNBQVM7QUFDZCxZQUFNLFVBQVUsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEVBQUUsSUFBSSxJQUFJLE9BQU8sQ0FBQyxFQUFFLElBQUksTUFDakUsRUFBRSxRQUFRLEVBQUUsSUFBSSxjQUFjLEVBQUUsUUFBUSxFQUFFLElBQUksUUFBVyxFQUFFLFNBQVMsS0FBSyxDQUFDLENBQUM7QUFDaEYsWUFBTSxXQUFZLENBQUMsVUFBVSxLQUFLLEVBQVksSUFBSSxVQUFRO0FBQ3RELGNBQU0sVUFBVSxTQUFTLGNBQWMsU0FBUztBQUNoRCxjQUFNLFVBQVUsU0FBUyxjQUFjLElBQUk7QUFDM0MsY0FBTSxVQUFVLFFBQVEsT0FBTyxXQUFTLE1BQU0sU0FBUyxJQUFJO0FBQzNELGdCQUFRLGVBQWUsU0FBUyxXQUFXLFlBQVksVUFBVSxLQUFLLFFBQVEsTUFBTTtBQUNwRixnQkFBUSxZQUFZLE9BQU87QUFFM0IsWUFBSSxRQUFRLFdBQVcsR0FBRztBQUN0QixnQkFBTSxRQUFRLFNBQVMsY0FBYyxHQUFHO0FBQ3hDLGdCQUFNLGNBQWM7QUFDcEIsa0JBQVEsWUFBWSxLQUFLO0FBQ3pCLGlCQUFPO0FBQUEsUUFDWDtBQUVBLGNBQU0sT0FBTyxTQUFTLGNBQWMsSUFBSTtBQUN4QyxtQkFBVyxFQUFFLElBQUksS0FBSyxLQUFLLFNBQVM7QUFDaEMsZ0JBQU0sTUFBTSxTQUFTLGNBQWMsSUFBSTtBQUN2QyxnQkFBTSxTQUFTLFNBQVMsY0FBYyxNQUFNO0FBQzVDLGlCQUFPLGNBQWMsT0FBTyxHQUFHLElBQUksTUFBTSxFQUFFLEtBQUssV0FBVyxFQUFFO0FBQzdELGNBQUksQ0FBQyxLQUFNLFFBQU8sUUFBUTtBQUMxQixnQkFBTSxTQUFTLFdBQVcsVUFBVSxNQUFNO0FBQ3RDLGtCQUFNLFFBQVEsTUFBTSxLQUFLLE1BQU0saUJBQWlCLFFBQVEsQ0FBQyxFQUFFLFFBQVEsTUFBTTtBQUN6RSxnQkFBSSxPQUFPLEVBQUUsR0FBRztBQUNaLHFCQUFPO0FBQ1Asb0JBQU0sWUFBWSxNQUFNLGlCQUFpQixRQUFRO0FBQ2pELGVBQUMsVUFBVSxLQUFLLElBQUksT0FBTyxVQUFVLFNBQVMsQ0FBQyxDQUFDLEtBQUssT0FBTyxNQUFNO0FBQUEsWUFDdEU7QUFBQSxVQUNKLENBQUM7QUFDRCxpQkFBTyxhQUFhLGNBQWMsVUFBVSxRQUFRLFVBQVUsRUFBRSxFQUFFLFNBQVMsU0FBUyxXQUFXLFlBQVksTUFBTSxFQUFFO0FBQ25ILGNBQUksT0FBTyxRQUFRLE1BQU07QUFDekIsZUFBSyxZQUFZLEdBQUc7QUFBQSxRQUN4QjtBQUNBLGdCQUFRLFlBQVksSUFBSTtBQUN4QixlQUFPO0FBQUEsTUFDWCxDQUFDO0FBQ0QsWUFBTSxnQkFBZ0IsR0FBRyxRQUFRO0FBQ2pDLGVBQVMsV0FBVyxRQUFRLFdBQVc7QUFBQSxJQUMzQztBQUVBLFdBQU87QUFDUCxXQUFPLE9BQU8sT0FBTyxPQUFPLE9BQU87QUFDbkMsVUFBTSxZQUFZLElBQUksZ0JBQWdCO0FBQ3RDLFdBQU8saUJBQWlCLFdBQVcsV0FBUztBQUN4QyxVQUFJLENBQUMsTUFBTSxPQUFPLENBQUMsZUFBZSxtQkFBbUIsY0FBYyxTQUFTLEVBQ3ZFLEtBQUssU0FBTyxNQUFNLFFBQVEsaUJBQWlCLEdBQUcsRUFBRyxRQUFPO0FBQUEsSUFDakUsR0FBRyxFQUFFLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFDL0IsV0FBTyxpQkFBaUIsU0FBUyxNQUFNO0FBQ25DLGdCQUFVLE1BQU07QUFDaEIsYUFBTyxPQUFPO0FBQUEsSUFDbEIsR0FBRyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQ2pCLGFBQVMsS0FBSyxZQUFZLE1BQU07QUFDaEMsV0FBTyxVQUFVO0FBQ2pCLFVBQU0sTUFBTTtBQUFBLEVBQ2hCO0FBRUEsV0FBUyxXQUFXLE9BQWUsU0FBcUI7QUFDcEQsVUFBTSxTQUFTLFNBQVMsY0FBYyxRQUFRO0FBQzlDLFdBQU8sT0FBTztBQUNkLFdBQU8sWUFBWTtBQUNuQixXQUFPLGNBQWM7QUFDckIsV0FBTyxpQkFBaUIsU0FBUyxPQUFPO0FBQ3hDLFdBQU87QUFBQSxFQUNYOzs7QUMxRkEsTUFBTSxpQkFBdUMsRUFBRSxRQUFRLFdBQVcsS0FBSyxVQUFVO0FBR2pGLFdBQVMsWUFBWSxTQUFzQjtBQUN2QyxVQUFNLE9BQU8sUUFBUSxhQUFhLEtBQUssS0FBSztBQUM1QyxRQUFJLENBQUMsS0FBSyxTQUFTLEdBQUcsRUFBRyxRQUFPO0FBQ2hDLFVBQU0sd0JBQXdCLEtBQUssUUFBUSxVQUFVLEVBQUU7QUFDdkQsUUFBSSxDQUFDLFFBQVEsa0JBQW1CLFFBQU87QUFFdkMsVUFBTSxRQUFRLFFBQVEsVUFBVSxJQUFJO0FBQ3BDLGVBQVcsU0FBUyxNQUFNLGlCQUFpQixHQUFHLEdBQUc7QUFDN0MsVUFBSSxNQUFNLGFBQWEsS0FBSyxNQUFNLElBQUssT0FBTSxPQUFPO0FBQUEsSUFDeEQ7QUFDQSxXQUFPLE1BQU0sYUFBYSxLQUFLLEVBQUUsUUFBUSxVQUFVLEVBQUUsS0FBSztBQUFBLEVBQzlEO0FBRUEsV0FBUyxpQkFBaUIsT0FBbUI7QUFDekMsUUFBSSxPQUFPLFVBQVUsU0FBVSxRQUFPLE9BQU87QUFFN0MsV0FBTyxNQUFNLEtBQUssRUFBRSxRQUFRLGFBQWEsSUFBSSxFQUFFLFFBQVE7QUFBQSxFQUMzRDtBQUVPLE1BQU0sZ0JBQU4sY0FBNEIsU0FBUztBQUFBLElBQ2hDLFFBQVEsb0JBQUksSUFBeUI7QUFBQSxJQUNyQyxXQUFrQztBQUFBLElBQ2xDLE9BQTJCO0FBQUEsSUFDM0IsZUFBZTtBQUFBLElBQ2YsV0FBVztBQUFBLElBRW5CLGNBQWM7QUFDVixZQUFNLFVBQVU7QUFDaEIsWUFBTSxlQUFlO0FBQUEsUUFDakI7QUFBQSxRQUNBLFNBQVM7QUFBQSxRQUNULE9BQU8sWUFBWSxvQkFBb0IsbUZBQW1GO0FBQUEsUUFDMUgsYUFBYSxDQUFDO0FBQUEsVUFDVixLQUFLO0FBQUEsVUFDTCxPQUFPLFlBQVksY0FBYyxnREFBZ0Q7QUFBQSxVQUNqRixTQUFTO0FBQUEsUUFDYixHQUFHO0FBQUEsVUFDQyxLQUFLO0FBQUEsVUFDTCxPQUFPLFlBQVksZUFBZSx1REFBdUQ7QUFBQSxVQUN6RixTQUFTO0FBQUEsUUFDYixDQUFDO0FBQUEsTUFDTDtBQUNBLFlBQU0sRUFBRSxNQUFNLFNBQVMsYUFBYSxDQUFDO0FBQUEsSUFDekM7QUFBQSxJQUVBLFlBQVk7QUFDUixhQUFPLENBQUMsaUJBQWlCLGtCQUFrQixFQUFFLFNBQVMsV0FBVztBQUFBLElBQ3JFO0FBQUEsSUFFQSxZQUFZLEtBQWE7QUFDckIsVUFBSTtBQUNBLGVBQU8sTUFBTSxHQUFHO0FBQUEsTUFDcEIsUUFBUTtBQUNKLGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSjtBQUFBLElBRUEsWUFBcUM7QUFDakMsWUFBTSxTQUFTLEtBQUssWUFBWSxhQUFhO0FBQzdDLFVBQUksVUFBVSxPQUFPLFdBQVcsWUFBWSxDQUFDLE1BQU0sUUFBUSxNQUFNLEVBQUcsUUFBTztBQUUzRSxZQUFNLFFBQThCLENBQUM7QUFDckMsaUJBQVcsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsY0FBYyxRQUFRLEdBQUcsQ0FBQyxXQUFXLEtBQUssQ0FBQyxHQUFZO0FBQy9FLGNBQU0sT0FBTyxLQUFLLFlBQVksR0FBRztBQUNqQyxZQUFJLENBQUMsTUFBTSxRQUFRLElBQUksRUFBRztBQUUxQixtQkFBVyxNQUFNLE1BQU07QUFDbkIsY0FBSSxhQUFhLEtBQUssT0FBTyxFQUFFLENBQUMsRUFBRyxPQUFNLE9BQU8sRUFBRSxDQUFDLElBQUk7QUFBQSxRQUMzRDtBQUFBLE1BQ0o7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsYUFBbUM7QUFDL0IsWUFBTSxRQUFRLEtBQUssWUFBWSxrQkFBa0I7QUFDakQsYUFBTztBQUFBLFFBQ0gsUUFBUSxPQUFPLE9BQU8sV0FBVyxZQUFZLGlCQUFpQixLQUFLLE1BQU0sTUFBTSxJQUFJLE1BQU0sU0FBUyxlQUFlO0FBQUEsUUFDakgsS0FBSyxPQUFPLE9BQU8sUUFBUSxZQUFZLGlCQUFpQixLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sTUFBTSxlQUFlO0FBQUEsTUFDekc7QUFBQSxJQUNKO0FBQUEsSUFFQSxpQkFBNEM7QUFDeEMsWUFBTSxRQUFRLEtBQUssWUFBWSxpQkFBaUI7QUFDaEQsVUFBSSxDQUFDLFNBQVMsT0FBTyxVQUFVLFlBQVksTUFBTSxRQUFRLEtBQUssRUFBRyxRQUFPLENBQUM7QUFDekUsYUFBTyxPQUFPLFlBQVksT0FBTyxRQUFRLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBd0M7QUFDNUYsY0FBTSxDQUFDLEVBQUUsS0FBSyxJQUFJO0FBQ2xCLGVBQU8sT0FBTyxVQUFVLFlBQVksUUFBUSxTQUFTLE9BQU8sVUFBVSxZQUFZLE9BQU8sTUFBTSxTQUFTLFFBQVE7QUFBQSxNQUNwSCxDQUFDLENBQUM7QUFBQSxJQUNOO0FBQUEsSUFFQSxVQUFVLE9BQWtDO0FBQ3hDLFVBQUk7QUFDQSxjQUFNLG1CQUFtQixLQUFLO0FBQUEsTUFDbEMsU0FBUyxLQUFLO0FBQ1YsZ0JBQVEsS0FBSyxrREFBa0QsR0FBRztBQUFBLE1BQ3RFO0FBQUEsSUFDSjtBQUFBLElBRUEsV0FBVyxJQUFZO0FBQ25CLFlBQU0sUUFBUSxLQUFLLFVBQVU7QUFDN0IsYUFBTyxNQUFNLEVBQUU7QUFDZixVQUFJLENBQUMsS0FBSyxZQUFZLGVBQWUsS0FBSyxFQUFHLFFBQU87QUFDcEQsWUFBTSxRQUFRLEtBQUssZUFBZTtBQUNsQyxVQUFJLE1BQU0sT0FBTztBQUNiLGVBQU8sTUFBTSxFQUFFO0FBQ2YsYUFBSyxVQUFVLEtBQUs7QUFBQSxNQUN4QjtBQUNBLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxpQkFBaUI7QUFDYixZQUFNLFFBQVEsS0FBSyxlQUFlO0FBQ2xDLGFBQU8sT0FBTyxRQUFRLEtBQUssVUFBVSxDQUFDLEVBQUUsUUFBbUIsQ0FBQyxDQUFDLElBQUksSUFBSSxNQUNqRSxhQUFhLEtBQUssRUFBRSxNQUFNLFNBQVMsWUFBWSxTQUFTLFNBQ2xELENBQUMsRUFBRSxJQUFJLE1BQU0saUJBQWlCLE1BQU0sRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQ2hELENBQUMsQ0FBQztBQUFBLElBQ2hCO0FBQUEsSUFFQSxZQUFZLEtBQWEsT0FBZ0I7QUFDckMsVUFBSTtBQUNBLGNBQU0sS0FBSyxLQUFLO0FBQ2hCLGVBQU87QUFBQSxNQUNYLFFBQVE7QUFDSixjQUFNLHVEQUF1RDtBQUM3RCxlQUFPO0FBQUEsTUFDWDtBQUFBLElBQ0o7QUFBQSxJQUVBLGtCQUFrQjtBQUNkLFVBQUksZ0JBQWdCLGFBQWM7QUFFbEMsWUFBTSxXQUFXO0FBQ2pCLGFBQU8sV0FBVyxRQUFRLHdCQUF3QixVQUFVLE1BQU07QUFDOUQsY0FBTSxXQUFXLFNBQVMsY0FBYyxRQUFRO0FBQ2hELFlBQUksQ0FBQyxZQUFZLFNBQVMsY0FBYyxvQkFBb0IsRUFBRztBQUUvRCxjQUFNLFNBQVMsb0JBQUksSUFBNEI7QUFDL0MsbUJBQVcsQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsVUFBVSxtQkFBbUIsR0FBRyxDQUFDLE9BQU8sZ0JBQWdCLENBQUMsR0FBWTtBQUM5RixnQkFBTSxRQUFRLFNBQVMsY0FBYyxPQUFPO0FBQzVDLGdCQUFNLFlBQVk7QUFDbEIsZ0JBQU0sUUFBUSxTQUFTLGNBQWMsTUFBTTtBQUMzQyxnQkFBTSxjQUFjO0FBQ3BCLGdCQUFNLFFBQVEsU0FBUyxjQUFjLE9BQU87QUFDNUMsZ0JBQU0sT0FBTztBQUNiLGdCQUFNLFFBQVEsS0FBSyxXQUFXLEVBQUUsSUFBSTtBQUNwQyxpQkFBTyxJQUFJLE1BQU0sS0FBSztBQUN0QixnQkFBTSxXQUFXLENBQUMsU0FBUyxRQUFRLGlCQUFpQixHQUFHLFVBQVUsU0FBUyxTQUFTO0FBQ25GLGdCQUFNLGlCQUFpQixVQUFVLE1BQU07QUFDbkMsa0JBQU0sU0FBUyxLQUFLLFdBQVc7QUFDL0IsZ0JBQUksQ0FBQyxLQUFLLFlBQVksb0JBQW9CLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLEVBQUcsT0FBTSxRQUFRLE9BQU8sSUFBSTtBQUFBLFVBQzVHLENBQUM7QUFDRCxnQkFBTSxPQUFPLE9BQU8sS0FBSztBQUN6QixtQkFBUyxZQUFZLEtBQUs7QUFBQSxRQUM5QjtBQUNBLGNBQU0sUUFBUSxTQUFTLGNBQWMsUUFBUTtBQUM3QyxjQUFNLE9BQU87QUFDYixjQUFNLFlBQVk7QUFDbEIsY0FBTSxjQUFjO0FBQ3BCLGNBQU0saUJBQWlCLFNBQVMsTUFBTTtBQUNsQyxjQUFJLENBQUMsS0FBSyxZQUFZLG9CQUFvQixDQUFDLENBQUMsRUFBRztBQUMvQyxxQkFBVyxDQUFDLE1BQU0sS0FBSyxLQUFLLE9BQVEsT0FBTSxRQUFRLGVBQWUsSUFBSTtBQUFBLFFBQ3pFLENBQUM7QUFDRCxjQUFNLFNBQVMsU0FBUyxjQUFjLFFBQVE7QUFDOUMsZUFBTyxPQUFPO0FBQ2QsZUFBTyxZQUFZO0FBQ25CLGVBQU8sY0FBYztBQUNyQixlQUFPLGlCQUFpQixTQUFTLE1BQU07QUFBQSxVQUNuQyxNQUFNLEtBQUssZUFBZTtBQUFBLFVBQzFCLFFBQU0sS0FBSyxXQUFXLEVBQUU7QUFBQSxVQUN4QixNQUFNO0FBQ0YsZ0JBQUksQ0FBQyxLQUFLLFlBQVksZUFBZSxDQUFDLENBQUMsRUFBRyxRQUFPO0FBQ2pELGlCQUFLLFVBQVUsQ0FBQyxDQUFDO0FBQ2pCLG1CQUFPO0FBQUEsVUFDWDtBQUFBLFFBQ0osQ0FBQztBQUNELGNBQU0sVUFBVSxTQUFTLGNBQWMsS0FBSztBQUM1QyxnQkFBUSxZQUFZO0FBQ3BCLGdCQUFRLE9BQU8sT0FBTyxNQUFNO0FBQzVCLGlCQUFTLFlBQVksT0FBTztBQUFBLE1BQ2hDLENBQUM7QUFBQSxJQUNMO0FBQUEsSUFFQSxnQkFBZ0I7QUFDWixXQUFLLFVBQVUsT0FBTztBQUN0QixXQUFLLFdBQVc7QUFBQSxJQUNwQjtBQUFBLElBRUEsYUFBYSxPQUFtQixNQUFtQixJQUFZO0FBQzNELFlBQU0sZUFBZTtBQUNyQixZQUFNLGdCQUFnQjtBQUN0QixXQUFLLGNBQWM7QUFFbkIsWUFBTSxPQUFPLFNBQVMsY0FBYyxLQUFLO0FBQ3pDLFdBQUssWUFBWTtBQUNqQixXQUFLLGFBQWEsUUFBUSxPQUFPO0FBQ2pDLFdBQUssYUFBYSxjQUFjLGFBQWE7QUFDN0MsWUFBTSxZQUFZLENBQUMsTUFBYyxRQUFvQjtBQUNqRCxjQUFNLFNBQVMsU0FBUyxjQUFjLFFBQVE7QUFDOUMsZUFBTyxPQUFPO0FBQ2QsZUFBTyxjQUFjO0FBQ3JCLGVBQU8saUJBQWlCLFNBQVMsTUFBTTtBQUNuQyxlQUFLLGNBQWM7QUFDbkIsY0FBSSxLQUFLLGVBQWUsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLEdBQUksS0FBSTtBQUFBLFFBQzdELENBQUM7QUFDRCxhQUFLLFlBQVksTUFBTTtBQUFBLE1BQzNCO0FBQ0EsaUJBQVcsQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsVUFBVSxnQkFBZ0IsR0FBRyxDQUFDLE9BQU8sYUFBYSxDQUFDLEdBQVk7QUFDeEYsa0JBQVUsTUFBTSxNQUFNLEtBQUssVUFBVSxJQUFJLElBQUksQ0FBQztBQUFBLE1BQ2xEO0FBQ0EsVUFBSSxLQUFLLFFBQVEsV0FBWSxXQUFVLDZCQUE2QixNQUFNO0FBQ3RFLFlBQUksS0FBSyxXQUFXLEVBQUUsRUFBRyxNQUFLLFFBQVE7QUFBQSxNQUMxQyxDQUFDO0FBQ0QsV0FBSyxpQkFBaUIsU0FBUyxXQUFTLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0QsZUFBUyxLQUFLLFlBQVksSUFBSTtBQUM5QixXQUFLLFdBQVc7QUFFaEIsWUFBTSxTQUFTLEtBQUssc0JBQXNCO0FBQzFDLFlBQU0sSUFBSSxNQUFNLFdBQVcsT0FBTztBQUNsQyxZQUFNLElBQUksTUFBTSxXQUFXLE9BQU87QUFDbEMsV0FBSyxNQUFNLE9BQU8sS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLEdBQUcsU0FBUyxnQkFBZ0IsY0FBYyxLQUFLLFdBQVcsQ0FBQyxJQUFJO0FBQ3RHLFdBQUssTUFBTSxNQUFNLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSSxHQUFHLFNBQVMsZ0JBQWdCLGVBQWUsS0FBSyxZQUFZLENBQUMsSUFBSTtBQUN2RyxXQUFLLGNBQWMsUUFBUSxHQUFHLE1BQU0sRUFBRSxlQUFlLEtBQUssQ0FBQztBQUFBLElBQy9EO0FBQUEsSUFFQSxnQkFBZ0IsTUFBbUIsVUFBeUI7QUFDeEQsWUFBTSxRQUFRLG9CQUFJLElBQXlCO0FBQzNDLFlBQU0sWUFBWSxvQkFBSSxJQUFzQztBQUU1RCxpQkFBVyxPQUFPLEtBQUssaUJBQXNDLGVBQWUsR0FBRztBQUMzRSxjQUFNLE9BQU8sSUFBSSxRQUFRLENBQUM7QUFDMUIsWUFBSSxDQUFDLFFBQVEsS0FBSyxjQUFjLEtBQU07QUFDdEMsY0FBTSxPQUFPLEtBQUssY0FBMkIsV0FBVyxLQUFLO0FBQzdELFlBQUksS0FBSyxJQUFJLGFBQWEsWUFBWSxLQUFLLEtBQUssYUFBYSxXQUFXLEtBQ3BFLEtBQUssY0FBYyxhQUFhLEdBQUcsYUFBYSxXQUFXO0FBQy9ELGNBQU0sWUFBWSxJQUFJLFFBQVEsY0FBYyxHQUFHLGFBQWEsWUFBWTtBQUN4RSxZQUFJLFdBQVc7QUFDWCxjQUFJLFNBQVMsVUFBVSxJQUFJLFNBQVM7QUFDcEMsY0FBSSxDQUFDLFFBQVE7QUFDVCxrQkFBTSxlQUFlLFNBQVMsS0FBSyxhQUFXLE9BQU8sUUFBUSxVQUFVLE1BQU0sU0FBUyxHQUFHO0FBQ3pGLHFCQUFTLG9CQUFJLElBQUk7QUFDakIsdUJBQVcsRUFBRSxVQUFVLFVBQVUsS0FBSyxPQUFPLE9BQU8sZ0JBQWdCLENBQUMsQ0FBQyxHQUFHO0FBQ3JFLG9CQUFNLGNBQWMsT0FBTyxZQUFZLEVBQUUsRUFBRSxLQUFLO0FBQ2hELGtCQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsS0FBSyxPQUFPLFNBQVMsQ0FBQyxFQUFHO0FBQzNELG9CQUFNQSxXQUFVLE9BQU8sSUFBSSxXQUFXLEtBQUssb0JBQUksSUFBWTtBQUMzRCxjQUFBQSxTQUFRLElBQUksT0FBTyxTQUFTLENBQUM7QUFDN0IscUJBQU8sSUFBSSxhQUFhQSxRQUFPO0FBQUEsWUFDbkM7QUFDQSxzQkFBVSxJQUFJLFdBQVcsTUFBTTtBQUFBLFVBQ25DO0FBQ0EsZ0JBQU0sVUFBVSxPQUFPLElBQUksWUFBWSxJQUFJLENBQUM7QUFDNUMsY0FBSSxXQUFXLENBQUMsUUFBUSxJQUFJLE1BQU0sRUFBRSxFQUFHLE1BQUssUUFBUSxTQUFTLElBQUksUUFBUSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVE7QUFBQSxRQUNyRztBQUNBLFlBQUksTUFBTSxhQUFhLEtBQUssRUFBRSxFQUFHLE9BQU0sSUFBSSxNQUFNLEVBQUU7QUFBQSxNQUN2RDtBQUNBLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxVQUFVO0FBQ04sWUFBTSxPQUFPLFNBQVMsY0FBMkIsS0FBSyxZQUFZO0FBQ2xFLFdBQUssT0FBTztBQUNaLFlBQU0sV0FBVyxLQUFLLFdBQVcsQ0FBQyxJQUFJO0FBQUEsUUFDbEMsR0FBRyxPQUFPLE9BQU8sT0FBTyxVQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQUEsUUFDOUMsR0FBRyxPQUFPLE9BQU8sT0FBTyxVQUFVLFlBQVksQ0FBQyxDQUFDO0FBQUEsTUFDcEQsRUFBRSxPQUFPLGFBQVcsU0FBUyxjQUFjLElBQUk7QUFDL0MsWUFBTSxRQUFRLENBQUMsT0FBTyxvQkFBSSxJQUF5QixJQUFJLEtBQUssV0FDdEQsSUFBSSxJQUFJLE1BQU0sS0FBSyxLQUFLLGlCQUE4QixzQkFBc0IsR0FBRyxVQUFRLENBQUMsTUFBTSxLQUFLLGFBQWEsV0FBVyxDQUFDLENBQVUsRUFDbkksT0FBTyxDQUFDLFVBQW1ELENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxhQUFhLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQ3hHLEtBQUssZ0JBQWdCLE1BQU0sUUFBUTtBQUV6QyxpQkFBVyxRQUFRLEtBQUssTUFBTSxLQUFLLEdBQUc7QUFDbEMsWUFBSSxNQUFNLElBQUksSUFBSSxFQUFHO0FBQ3JCLGVBQU8sS0FBSyxRQUFRO0FBQ3BCLGVBQU8sS0FBSyxRQUFRO0FBQUEsTUFDeEI7QUFFQSxXQUFLLFFBQVE7QUFDYixVQUFJLENBQUMsS0FBTTtBQUNYLFlBQU0sUUFBUSxLQUFLLFVBQVU7QUFDN0IsWUFBTSxhQUFhLEtBQUssZUFBZTtBQUN2QyxZQUFNLGNBQWMsb0JBQUksSUFBWTtBQUNwQyxVQUFJLGVBQWU7QUFDbkIsWUFBTSxlQUFlLENBQUMsSUFBWSxTQUF5QjtBQUN2RCxjQUFNLGNBQWMsT0FBTyxTQUFTLFdBQVcsS0FBSyxLQUFLLElBQUk7QUFDN0QsWUFBSSxDQUFDLGVBQWdCLE1BQU0sRUFBRSxNQUFNLFlBQVksTUFBTSxFQUFFLE1BQU0sTUFBUSxRQUFPO0FBQzVFLGNBQU0sV0FBVyxXQUFXLEVBQUU7QUFDOUIsWUFBSSxPQUFPLGFBQWEsWUFBWSxVQUFVLFNBQVMsYUFBYTtBQUNoRSxxQkFBVyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVk7QUFDckMseUJBQWU7QUFBQSxRQUNuQjtBQUNBLGVBQU87QUFBQSxNQUNYO0FBQ0EsVUFBSSxLQUFLLFVBQVU7QUFDZixtQkFBVyxFQUFFLFFBQVEsU0FBUyxLQUFLLE9BQU8sa0JBQWtCLENBQUMsR0FBRztBQUM1RCxnQkFBTSxLQUFLLE9BQU8sUUFBUSxVQUFVO0FBQ3BDLGNBQUksYUFBYSxJQUFJLFFBQVEsRUFBRyxhQUFZLElBQUksRUFBRTtBQUFBLFFBQ3REO0FBQUEsTUFDSixPQUFPO0FBRUgsbUJBQVcsV0FBVyxVQUFVO0FBQzVCLHFCQUFXLEVBQUUsV0FBVyxTQUFTLEtBQUssT0FBTyxPQUFPLFFBQVEsZ0JBQWdCLENBQUMsQ0FBQyxHQUFHO0FBQzdFLGtCQUFNLEtBQUssT0FBTyxTQUFTO0FBQzNCLGdCQUFJLENBQUMsWUFBWSxJQUFJLEVBQUUsS0FBSyxhQUFhLElBQUksUUFBUSxFQUFHLGFBQVksSUFBSSxFQUFFO0FBQUEsVUFDOUU7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUNBLFlBQU0sU0FBUyxLQUFLLFdBQVc7QUFDL0IsaUJBQVcsQ0FBQyxNQUFNLEtBQUssS0FBSyxPQUFPLFFBQVEsTUFBTSxHQUFHO0FBQ2hELGNBQU0sV0FBVyxjQUFjLE9BQU87QUFDdEMsWUFBSSxLQUFLLE1BQU0saUJBQWlCLFFBQVEsTUFBTSxNQUFPLE1BQUssTUFBTSxZQUFZLFVBQVUsS0FBSztBQUFBLE1BQy9GO0FBQ0EsaUJBQVcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxPQUFPO0FBQzVCLFlBQUksS0FBSyxRQUFRLGlCQUFpQixHQUFJLE1BQUssUUFBUSxlQUFlO0FBQ2xFLGNBQU0sT0FBTyxNQUFNLEVBQUU7QUFDckIsWUFBSSxTQUFTLFlBQVksU0FBUyxPQUFPO0FBQ3JDLGNBQUksS0FBSyxRQUFRLGVBQWUsS0FBTSxNQUFLLFFBQVEsYUFBYTtBQUNoRSxjQUFJLENBQUMsWUFBWSxJQUFJLEVBQUUsRUFBRyxjQUFhLElBQUksWUFBWSxJQUFJLENBQUM7QUFBQSxRQUNoRSxXQUFXLEtBQUssUUFBUSxZQUFZO0FBQ2hDLGlCQUFPLEtBQUssUUFBUTtBQUFBLFFBQ3hCO0FBQUEsTUFDSjtBQUNBLFVBQUksYUFBYyxNQUFLLFVBQVUsVUFBVTtBQUFBLElBQy9DO0FBQUEsSUFFQSxVQUFVLElBQVksTUFBWTtBQUM5QixZQUFNLFFBQVEsS0FBSyxVQUFVO0FBQzdCLFlBQU0sRUFBRSxJQUFJO0FBRVosVUFBSSxLQUFLLFlBQVksZUFBZSxLQUFLLEVBQUcsTUFBSyxRQUFRO0FBQUEsSUFDN0Q7QUFBQSxJQUVBLGVBQWUsT0FBbUI7QUFDOUIsVUFBSSxNQUFNLGtCQUFrQixRQUFRLEtBQUssVUFBVSxTQUFTLE1BQU0sTUFBTSxFQUFHO0FBQzNFLFdBQUssY0FBYztBQUNuQixVQUFJLE1BQU0sU0FBUyxpQkFBaUIsQ0FBQyxNQUFNLE9BQVE7QUFFbkQsWUFBTSxPQUFPLE1BQU0sa0JBQWtCLFVBQVUsTUFBTSxPQUFPLFFBQXFCLHNCQUFzQixJQUFJO0FBQzNHLFVBQUksQ0FBQyxLQUFNO0FBQ1gsWUFBTSxLQUFLLEtBQUssTUFBTSxJQUFJLElBQUk7QUFDOUIsVUFBSSxDQUFDLEdBQUk7QUFDVCxXQUFLLGFBQWEsT0FBTyxNQUFNLEVBQUU7QUFBQSxJQUNyQztBQUFBLElBRUEsSUFBSSxFQUFFLFFBQVEsU0FBUyxHQUFtQjtBQUN0QyxVQUFJLEtBQUssVUFBVSxDQUFDLEtBQUssVUFBVSxHQUFHO0FBQUM7QUFBQSxNQUFNO0FBRTdDLFdBQUssV0FBVyxnQkFBZ0I7QUFDaEMsVUFBSSxLQUFLLFdBQVcsQ0FBQyxTQUFTLENBQUMsU0FBVTtBQUV6QyxXQUFLLGVBQWUsS0FBSyxXQUFXLGtCQUFrQjtBQUN0RCxZQUFNLGlCQUFpQixDQUFDLFVBQXNCLEtBQUssZUFBZSxLQUFLO0FBQ3ZFLGVBQVMsaUJBQWlCLFNBQVMsZ0JBQWdCLElBQUk7QUFDdkQsZUFBUyxpQkFBaUIsZUFBZSxnQkFBZ0IsSUFBSTtBQUM3RCxlQUFTLGlCQUFpQixXQUFXLFdBQVM7QUFDMUMsWUFBSSxNQUFNLFFBQVEsWUFBWSxDQUFDLEtBQUssU0FBVTtBQUM5QyxjQUFNLGVBQWU7QUFDckIsY0FBTSxnQkFBZ0I7QUFDdEIsYUFBSyxjQUFjO0FBQUEsTUFDdkIsR0FBRyxJQUFJO0FBQ1AsYUFBTyxpQkFBaUIsV0FBVyxXQUFTO0FBQ3hDLFlBQUksQ0FBQyxNQUFNLE9BQU8sQ0FBQyxlQUFlLG9CQUFvQixjQUFjLFNBQVMsRUFDeEUsS0FBSyxTQUFPLE1BQU0sUUFBUSxpQkFBaUIsR0FBRyxFQUFHLE1BQUssUUFBUTtBQUFBLE1BQ3ZFLENBQUM7QUFFRCxZQUFNLFdBQVcsSUFBSSxpQkFBaUIsZUFBYTtBQUMvQyxjQUFNLE9BQU8sU0FBUyxjQUFjLEtBQUssWUFBWTtBQUNyRCxZQUFJLFNBQVMsS0FBSyxRQUFTLFFBQVEsVUFBVSxLQUFLLENBQUMsRUFBRSxPQUFPLE1BQU0sS0FBSyxTQUFTLE1BQU0sQ0FBQyxHQUFJO0FBQ3ZGLGVBQUssUUFBUTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixDQUFDO0FBQ0QsZUFBUyxRQUFRLFNBQVMsTUFBTTtBQUFBLFFBQzVCLFdBQVc7QUFBQSxRQUNYLGVBQWU7QUFBQSxRQUNmLFNBQVM7QUFBQSxRQUNULFlBQVk7QUFBQSxRQUNaLGlCQUFpQixDQUFDLGNBQWMsYUFBYSxZQUFZO0FBQUEsTUFDN0QsQ0FBQztBQUVELFdBQUssUUFBUTtBQUNiLFdBQUssU0FBUztBQUFBLElBQ2xCO0FBQUEsRUFDSjs7O0FDaFlBLE1BQU0sZ0JBQWdCLENBQUMsQ0FBQyxTQUFTLE9BQU8sR0FBRyxDQUFDLFNBQVMsT0FBTyxDQUFDO0FBQzdELE1BQU0saUJBQWlCLENBQUMsQ0FBQyxPQUFPLEtBQUssR0FBRyxDQUFDLE9BQU8sS0FBSyxHQUFHLENBQUMsT0FBTyxLQUFLLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQztBQUNwRixNQUFNLGdCQUFnQixDQUFDLENBQUMsT0FBTyxLQUFLLEdBQUcsQ0FBQyxRQUFRLFNBQVMsQ0FBQztBQUluRCxXQUFTLG1CQUFtQixLQUFzQjtBQUNyRCxRQUFJO0FBQ0EsYUFBTyxNQUFNLEdBQUc7QUFBQSxJQUNwQixRQUFRO0FBQ0osYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKO0FBRU8sV0FBUyxzQkFBc0I7QUFDbEMsVUFBTSxPQUFvQixtQkFBbUIsYUFBYSxNQUFNLFVBQVUsVUFBVTtBQUNwRixVQUFNLGFBQWEsbUJBQW1CLGNBQWM7QUFDcEQsVUFBTSxRQUFRLGVBQWUsS0FBSyxDQUFDLENBQUMsS0FBSyxNQUFNLFVBQVUsVUFBVSxJQUFJLENBQUMsS0FBSztBQUM3RSxVQUFNLE9BQW9CLG1CQUFtQixrQkFBa0IsTUFBTSxRQUFRLFFBQVE7QUFDckYsV0FBTyxFQUFFLE1BQU0sT0FBTyxLQUFLO0FBQUEsRUFDL0I7QUFFTyxXQUFTLGdCQUFnQixJQUFZLFVBQW9DO0FBQzVFLFVBQU0sUUFBUSxtQkFBbUIsY0FBYztBQUMvQyxRQUFJLFNBQVMsT0FBTyxVQUFVLFlBQVksT0FBTyxPQUFPLE9BQU8sRUFBRSxHQUFHO0FBQ2hFLFlBQU0sT0FBUSxNQUFrQyxFQUFFO0FBQ2xELFVBQUksU0FBUyxVQUFVLFNBQVMsTUFBTyxRQUFPO0FBQUEsSUFDbEQ7QUFHQSxVQUFNLFFBQVEsbUJBQW1CLG1CQUFtQjtBQUNwRCxRQUFJLFNBQVMsT0FBTyxVQUFVLFlBQVksUUFBUSxTQUFTLE9BQU8sTUFBTSxFQUFFLE1BQU0sTUFBTSxVQUFVLE9BQU87QUFDbkcsVUFBSSxNQUFNLFNBQVMsVUFBVSxNQUFNLFNBQVMsTUFBTyxRQUFPLE1BQU07QUFBQSxJQUNwRTtBQUNBLFdBQU87QUFBQSxFQUNYO0FBRU8sV0FBUyxnQkFBZ0IsSUFBWSxNQUFtQjtBQUMzRCxVQUFNLFFBQVEsbUJBQW1CLGNBQWM7QUFDL0MsVUFBTSxRQUFRLFNBQVMsT0FBTyxVQUFVLFlBQVksQ0FBQyxNQUFNLFFBQVEsS0FBSyxJQUFJLFFBQVEsQ0FBQztBQUNyRixVQUFNLGdCQUFnQixFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUM7QUFBQSxFQUNsRDtBQUVPLFdBQVMsa0JBQWtCLFdBQWdDO0FBQzlELFVBQU0sUUFBUSxtQkFBbUIsY0FBYztBQUMvQyxRQUFJLFNBQVMsT0FBTyxVQUFVLFlBQVksQ0FBQyxNQUFNLFFBQVEsS0FBSyxHQUFHO0FBQzdELFlBQU0sVUFBVSxPQUFPLFFBQVEsS0FBSztBQUNwQyxZQUFNLE9BQU8sUUFBUSxPQUFPLENBQUMsQ0FBQyxJQUFJLElBQUksTUFBTSxVQUFVLElBQUksRUFBRSxNQUFNLFNBQVMsU0FBUyxTQUFTLE9BQU87QUFDcEcsVUFBSSxDQUFDLEtBQUssT0FBUSxNQUFLLGNBQWM7QUFBQSxlQUM1QixLQUFLLFdBQVcsUUFBUSxPQUFRLE9BQU0sZ0JBQWdCLE9BQU8sWUFBWSxJQUFJLENBQUM7QUFBQSxJQUMzRjtBQUVBLFVBQU0sU0FBUyxtQkFBbUIsbUJBQW1CO0FBQ3JELFFBQUksVUFBVSxPQUFPLFdBQVcsWUFBWSxRQUFRLFVBQVUsQ0FBQyxVQUFVLElBQUksT0FBTyxPQUFPLEVBQUUsQ0FBQyxHQUFHO0FBQzdGLFdBQUssbUJBQW1CO0FBQUEsSUFDNUI7QUFBQSxFQUNKO0FBRU8sV0FBUyxlQUFlLE9BQWUsUUFBcUM7QUFDL0UsV0FBTyxXQUFXLE9BQU8sZUFBZSxNQUFNO0FBQUEsRUFDbEQ7QUFFQSxXQUFTLFdBQTZCLE9BQWUsU0FBOEMsUUFBNEI7QUFDM0gsVUFBTSxRQUFRLFNBQVMsY0FBYyxNQUFNO0FBQzNDLFVBQU0sWUFBWTtBQUNsQixVQUFNLGFBQWEsUUFBUSxPQUFPO0FBQ2xDLFVBQU0sYUFBYSxjQUFjLEtBQUs7QUFDdEMsVUFBTSxpQkFBaUIsV0FBVyxXQUFTLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEUsZUFBVyxDQUFDLE9BQU8sSUFBSSxLQUFLLFNBQVM7QUFDakMsWUFBTSxTQUFTLFNBQVMsY0FBYyxRQUFRO0FBQzlDLGFBQU8sT0FBTztBQUNkLGFBQU8sY0FBYztBQUNyQixhQUFPLFFBQVEsZ0JBQWdCO0FBQy9CLGFBQU8saUJBQWlCLFNBQVMsV0FBUztBQUN0QyxjQUFNLGdCQUFnQjtBQUN0QixlQUFPLEtBQUs7QUFBQSxNQUNoQixDQUFDO0FBQ0QsWUFBTSxZQUFZLE1BQU07QUFBQSxJQUM1QjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBRU8sV0FBUyxvQkFBb0IsT0FBb0IsT0FBZTtBQUNuRSxlQUFXLFVBQVUsTUFBTSxpQkFBaUIsUUFBUSxHQUFHO0FBQ25ELGFBQU8sYUFBYSxnQkFBZ0IsT0FBTyxPQUFPLFFBQVEsa0JBQWtCLEtBQUssQ0FBQztBQUFBLElBQ3RGO0FBQUEsRUFDSjtBQUVPLFdBQVMseUJBQXlCO0FBQ3JDLFFBQUksZ0JBQWdCLGFBQWM7QUFFbEMsVUFBTSxXQUFXO0FBQ2pCLFdBQU8sV0FBVyxRQUFRLHdCQUF3QixVQUFVLE1BQU07QUFDOUQsWUFBTSxPQUFPLFNBQVMsY0FBYyxRQUFRO0FBQzVDLFVBQUksQ0FBQyxRQUFRLEtBQUssY0FBYywwQkFBMEIsRUFBRztBQUU3RCxZQUFNLFdBQVcsU0FBUyxjQUFjLFVBQVU7QUFDbEQsZUFBUyxZQUFZO0FBQ3JCLGVBQVMsYUFBYSxjQUFjLDBCQUEwQjtBQUM5RCxZQUFNLE9BQU8sQ0FBQyxLQUFhLE9BQWUsVUFBdUI7QUFDN0QsWUFBSTtBQUNBLGdCQUFNLEtBQUssS0FBSztBQUNoQiw4QkFBb0IsT0FBTyxLQUFLO0FBQ2hDLGlCQUFPO0FBQUEsUUFDWCxTQUFTLEtBQUs7QUFDVixrQkFBUSxLQUFLLDhDQUE4QyxHQUFHO0FBQzlELGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0o7QUFDQSxZQUFNLGFBQWEsU0FBUyxjQUFjLEtBQUs7QUFDL0MsaUJBQVcsWUFBWSxZQUFZLGNBQWMsMktBQTJLO0FBQzVOLFlBQU0sU0FBUyxXQUFXLGNBQWMsZ0JBQWdCLFdBQVMsS0FBSyxnQkFBZ0IsT0FBTyxNQUFNLENBQUM7QUFDcEcsWUFBTSxhQUFhLENBQUMsU0FBc0IsV0FBVyxTQUFTLE9BQU8sU0FBUyxTQUFTO0FBQ3ZGLFlBQU0sUUFBUSxXQUFXLHFCQUFxQixlQUFlLFdBQVM7QUFDbEUsWUFBSSxLQUFLLGVBQWUsT0FBTyxLQUFLLEVBQUcsWUFBVyxLQUFLO0FBQUEsTUFDM0QsQ0FBQztBQUNELFlBQU0sUUFBUSxlQUFlLGdDQUFnQyxXQUFTLEtBQUssb0JBQW9CLE9BQU8sS0FBSyxDQUFDO0FBQzVHLFlBQU0sV0FBVyxvQkFBb0I7QUFDckMsMEJBQW9CLE9BQU8sU0FBUyxJQUFJO0FBQ3hDLDBCQUFvQixRQUFRLFNBQVMsS0FBSztBQUMxQywwQkFBb0IsT0FBTyxTQUFTLElBQUk7QUFDeEMsaUJBQVcsU0FBUyxJQUFJO0FBRXhCLFlBQU0sWUFBWSxTQUFTLGNBQWMsS0FBSztBQUM5QyxnQkFBVSxZQUFZLFlBQVkscUJBQXFCLG1JQUFtSTtBQUMxTCxZQUFNLFlBQVksU0FBUyxjQUFjLEtBQUs7QUFDOUMsZ0JBQVUsWUFBWSxZQUFZLHFCQUFxQixzRkFBc0Y7QUFDN0ksZUFBUyxPQUFPLFdBQVcsT0FBTyxZQUFZLFFBQVEsV0FBVyxLQUFLO0FBQ3RFLFlBQU0saUJBQWlCLE1BQU0sU0FBUyxXQUFXLENBQUMsS0FBSyxVQUFVLFNBQVMsU0FBUztBQUNuRixxQkFBZTtBQUNmLFVBQUksaUJBQWlCLGNBQWMsRUFBRSxRQUFRLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNqRixXQUFLLFlBQVksUUFBUTtBQUFBLElBQzdCLENBQUM7QUFBQSxFQUNMOzs7QUNySU8sV0FBUyx5QkFBeUIsUUFBcUIsS0FBa0I7QUFDNUUsVUFBTSxRQUFRLE9BQU8sZUFBZSxjQUFjLHVCQUF1QjtBQUN6RSxRQUFJLENBQUMsTUFBTztBQUVaLFVBQU0sUUFBUSxPQUFPLHNCQUFzQjtBQUMzQyxVQUFNLFFBQVEsTUFBTSxzQkFBc0I7QUFDMUMsVUFBTSxTQUFTLE1BQU0sUUFBUSxPQUFPO0FBQ3BDLFVBQU0sU0FBUyxNQUFNLFNBQVMsT0FBTztBQUNyQyxRQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLE1BQU87QUFFeEMsUUFBSSxNQUFNLGlCQUFpQixHQUFHLEtBQUssTUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLFNBQVMsQ0FBQyxDQUFDO0FBQ2hGLFFBQUksTUFBTSxrQkFBa0IsR0FBRyxLQUFLLE9BQU8sTUFBTSxNQUFNLE1BQU0sU0FBUyxJQUFJLE1BQU0sT0FBTyxNQUFNLENBQUM7QUFBQSxFQUNsRztBQUVPLFdBQVMsdUJBQ1osUUFDQSxVQUNBLFVBQ0EsUUFDRjtBQUNFLFFBQUksTUFBTSxPQUFPLGNBQTJCLG9DQUFvQztBQUNoRixRQUFJLENBQUMsU0FBUyxRQUFRO0FBQ2xCLFdBQUssT0FBTztBQUNaO0FBQUEsSUFDSjtBQUNBLFFBQUksQ0FBQyxLQUFLO0FBQ04sWUFBTSxTQUFTLGNBQWMsS0FBSztBQUNsQyxVQUFJLFlBQVk7QUFDaEIsVUFBSSxhQUFhLFFBQVEsT0FBTztBQUNoQyxVQUFJLGFBQWEsY0FBYyxpQkFBaUI7QUFDaEQsVUFBSSxpQkFBaUIsU0FBUyxXQUFTO0FBQ25DLFlBQUksRUFBRSxNQUFNLGtCQUFrQixTQUFVO0FBQ3hDLGNBQU0sS0FBSyxNQUFNLE9BQU8sUUFBMkIseUJBQXlCLEdBQUcsUUFBUTtBQUN2RixZQUFJLEdBQUksUUFBTyxFQUFFO0FBQUEsTUFDckIsQ0FBQztBQUNELGFBQU8sUUFBUSxHQUFHO0FBQ2xCLCtCQUF5QixRQUFRLEdBQUc7QUFBQSxJQUN4QztBQUVBLFVBQU0sVUFBVSxJQUFJLElBQUksTUFBTSxLQUFLLElBQUksaUJBQWlCLFFBQVEsR0FBRyxZQUFVLENBQUMsT0FBTyxRQUFRLFdBQVcsTUFBTSxDQUFDLENBQUM7QUFDaEgsVUFBTSxhQUFhLFNBQVMsSUFBSSxhQUFXLFFBQVEsUUFBUTtBQUMzRCxlQUFXLENBQUMsT0FBTyxFQUFFLElBQUksVUFBVSxNQUFNLEtBQUssQ0FBQyxLQUFLLFNBQVMsUUFBUSxHQUFHO0FBQ3BFLFVBQUksU0FBUyxRQUFRLElBQUksRUFBRTtBQUMzQixVQUFJLENBQUMsUUFBUTtBQUNULGlCQUFTLFNBQVMsY0FBYyxRQUFRO0FBQ3hDLGVBQU8sT0FBTztBQUNkLGVBQU8sUUFBUSxZQUFZO0FBQzNCLGVBQU8sT0FBTyxTQUFTLGNBQWMsTUFBTSxHQUFHLFNBQVMsY0FBYyxRQUFRLENBQUM7QUFBQSxNQUNsRjtBQUNBLFlBQU0sT0FBTyxXQUFXLFFBQVEsUUFBUSxNQUFNLFdBQVcsWUFBWSxRQUFRLElBQ3pFLFdBQVcsR0FBRyxRQUFRLElBQUksV0FBVyxNQUFNLEdBQUcsUUFBUSxDQUFDLEVBQUUsT0FBTyxXQUFTLFVBQVUsUUFBUSxFQUFFLE1BQU07QUFDdkcsWUFBTSxDQUFDLE9BQU8sU0FBUyxJQUFJLE1BQU0sS0FBSyxPQUFPLFFBQVE7QUFDckQsVUFBSSxNQUFNLGdCQUFnQixLQUFNLE9BQU0sY0FBYztBQUNwRCxVQUFJLFVBQVUsaUJBQWlCLFFBQVEsS0FBTSxXQUFVLGNBQWMsUUFBUTtBQUM3RSxZQUFNLGNBQWMsR0FBRyxJQUFJLE1BQU0sSUFBSSxNQUFNLE9BQU8sUUFBUSxJQUFJLEtBQUssa0JBQWtCO0FBQ3JGLFVBQUksT0FBTyxVQUFVLGFBQWE7QUFDOUIsZUFBTyxRQUFRO0FBQ2YsZUFBTyxhQUFhLGNBQWMsV0FBVztBQUFBLE1BQ2pEO0FBQ0EsWUFBTSxVQUFVLE9BQU8sT0FBTyxRQUFRO0FBQ3RDLFVBQUksT0FBTyxhQUFhLGNBQWMsTUFBTSxRQUFTLFFBQU8sYUFBYSxnQkFBZ0IsT0FBTztBQUVoRyxVQUFJLFdBQVcsSUFBSSxTQUFTLEtBQUssRUFBRyxLQUFJLGFBQWEsUUFBUSxJQUFJLFNBQVMsS0FBSyxLQUFLLElBQUk7QUFDeEYsY0FBUSxPQUFPLEVBQUU7QUFBQSxJQUNyQjtBQUNBLGVBQVcsVUFBVSxRQUFRLE9BQU8sRUFBRyxRQUFPLE9BQU87QUFBQSxFQUN6RDs7O0FDakVBLE1BQU0sdUJBQXdEO0FBQUEsSUFDMUQsT0FBTztBQUFBLElBQU0sS0FBSztBQUFBLElBQU8sS0FBSztBQUFBLElBQU8sSUFBSTtBQUFBLElBQU0sT0FBTztBQUFBLEVBQzFEO0FBQ0EsTUFBTSx5QkFBeUI7QUFDL0IsTUFBTSxzQkFBc0I7QUFDNUIsTUFBTSxpQkFBaUIsb0JBQUksSUFBaUI7QUFDNUMsTUFBSTtBQUVKLFdBQVMsb0JBQW9CLE1BQW1CO0FBQzVDLFFBQUksQ0FBQyxlQUFlLE1BQU07QUFDdEIsWUFBTSxXQUFXLFFBQVEsVUFBVTtBQUNuQyxZQUFNLFVBQVUsU0FBeUIsU0FBMkM7QUFFaEYsWUFBSSxNQUFNLEtBQUssY0FBYyxFQUFFLEtBQUssY0FBWSxTQUFTLFNBQVMsSUFBSSxDQUFDLEVBQUc7QUFDMUUsaUJBQVMsS0FBSyxNQUFNLE9BQU87QUFBQSxNQUMvQjtBQUNBLGNBQVEsVUFBVSxpQkFBaUI7QUFDbkMsOEJBQXdCLE1BQU07QUFDMUIsWUFBSSxRQUFRLFVBQVUsbUJBQW1CLFFBQVMsU0FBUSxVQUFVLGlCQUFpQjtBQUFBLE1BQ3pGO0FBQUEsSUFDSjtBQUNBLG1CQUFlLElBQUksSUFBSTtBQUV2QixXQUFPLE1BQU07QUFDVCxxQkFBZSxPQUFPLElBQUk7QUFDMUIsVUFBSSxlQUFlLEtBQU07QUFDekIsOEJBQXdCO0FBQ3hCLDhCQUF3QjtBQUFBLElBQzVCO0FBQUEsRUFDSjtBQUVBLFdBQVMsbUJBQW1CLFVBQXNEO0FBQzlFLFlBQVEsVUFBVSxLQUFLLEVBQUUsWUFBWSxFQUFFLFFBQVEsVUFBVSxHQUFHLEdBQUc7QUFBQSxNQUMzRCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQWlCLGVBQU87QUFBQSxNQUM3QixLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQU8sZUFBTztBQUFBLE1BQ25CLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBTyxlQUFPO0FBQUEsTUFDbkIsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFNLGVBQU87QUFBQSxNQUNsQjtBQUFTLGVBQU8sV0FBVyxVQUFVO0FBQUEsSUFDekM7QUFBQSxFQUNKO0FBWU8sV0FBUyx5QkFBeUI7QUFDckM7QUFFQSxRQUFJLFNBQVMsYUFBYSxzQkFBc0IsSUFBSSxnQkFBZ0IsU0FBUyxNQUFNLEVBQUUsSUFBSSxLQUFLLE1BQU0sV0FBWTtBQUVoSCxRQUFJO0FBQ0EsVUFBSSxLQUFLLE1BQU0sYUFBYSxRQUFRLGtCQUFrQixLQUFLLE1BQU0sR0FBRyx3QkFBd0IsTUFBTztBQUFBLElBQ3ZHLFFBQVE7QUFDSjtBQUFBLElBQ0o7QUFHQSxVQUFNLFFBQVEsU0FBUyxjQUFjLE9BQU87QUFDNUMsVUFBTSxLQUFLO0FBQ1gsVUFBTSxjQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFRcEIsVUFBTSxXQUFXLElBQUksaUJBQWlCLE1BQU07QUFDeEMsVUFBSSxDQUFDLFNBQVMsZ0JBQWlCO0FBQy9CLGVBQVMsZ0JBQWdCLFlBQVksS0FBSztBQUMxQyxlQUFTLFdBQVc7QUFBQSxJQUN4QixDQUFDO0FBQ0QsUUFBSSxTQUFTLGdCQUFpQixVQUFTLGdCQUFnQixZQUFZLEtBQUs7QUFBQSxRQUNuRSxVQUFTLFFBQVEsVUFBVSxFQUFFLFdBQVcsS0FBSyxDQUFDO0FBRW5ELGVBQVcsTUFBTTtBQUNiLGVBQVMsV0FBVztBQUNwQixZQUFNLE9BQU87QUFBQSxJQUNqQixHQUFHLEdBQUk7QUFBQSxFQUNYO0FBRU8sTUFBTSxlQUFOLGNBQTJCLFNBQVM7QUFBQSxJQUMvQixhQUFhO0FBQUEsSUFDYixpQkFBaUI7QUFBQSxJQUNqQixXQUFXLG9CQUFvQjtBQUFBLElBQy9CLE9BQTJCO0FBQUEsSUFDM0IsUUFBNEI7QUFBQSxJQUM1QixnQkFBb0M7QUFBQSxJQUNwQyxhQUFrQztBQUFBLElBQ2xDLFdBQWdEO0FBQUEsSUFDaEQsbUJBQW1CO0FBQUEsSUFDbkIsZUFBaUU7QUFBQSxJQUNqRSxXQUFvQztBQUFBLElBQ3BDLGFBQW9DO0FBQUEsSUFDM0IsY0FBYyxvQkFBSSxJQUE4QjtBQUFBLElBQ2hELGlCQUFpQixvQkFBSSxJQUFpQjtBQUFBLElBQy9DLG1CQUFrQztBQUFBLElBQ2xDLFlBQW9DO0FBQUEsSUFFNUMsY0FBYztBQUNWLFlBQU0sVUFBVTtBQUNoQixZQUFNLGVBQWU7QUFBQSxRQUNqQjtBQUFBLFFBQ0EsU0FBUztBQUFBLFFBQ1QsT0FBTyxZQUFZLG1CQUFtQixvSUFBb0k7QUFBQSxRQUMxSyxhQUFhLENBQUM7QUFBQSxVQUNWLEtBQUs7QUFBQSxVQUNMLE9BQU8sWUFBWSxzQ0FBc0Msd0pBQXdKO0FBQUEsVUFDak4sU0FBUztBQUFBLFFBQ2IsQ0FBQztBQUFBLE1BQ0w7QUFDQSxZQUFNLEVBQUUsTUFBTSxTQUFTLGFBQWEsQ0FBQztBQUFBLElBQ3pDO0FBQUEsSUFFQSxZQUFZO0FBQ1IsYUFBTyxnQkFBZ0I7QUFBQSxJQUMzQjtBQUFBLElBRUEsWUFBWSxNQUFtQixVQUE4QztBQUN6RSxZQUFNLFNBQVMsSUFBSSxJQUFJLE9BQU8sT0FBTyxPQUFPLFVBQVUsVUFBVSxDQUFDLENBQUMsRUFDN0QsT0FBTyxhQUFXLFNBQVMsY0FBYyxJQUFJLEVBQzdDLElBQUksYUFBVyxDQUFDLE9BQU8sUUFBUSxVQUFVLEdBQUcsT0FBTyxDQUFDLENBQUM7QUFFMUQsYUFBTyxNQUFNLEtBQUssS0FBSyxpQkFBOEIsc0JBQXNCLENBQUMsRUFBRSxRQUFRLFVBQVE7QUFDMUYsY0FBTSxLQUFLLEtBQUssYUFBYSxZQUFZO0FBQ3pDLFlBQUksQ0FBQyxHQUFJLFFBQU8sQ0FBQztBQUNqQixjQUFNLFVBQVUsT0FBTyxJQUFJLEVBQUU7QUFDN0IsY0FBTSxTQUFTLEtBQUssY0FBMkIsaUJBQWlCO0FBQ2hFLGNBQU0sUUFBUSxTQUFTLElBQUksRUFBRTtBQUM3QixZQUFJLENBQUMsVUFBVyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxRQUFRLGNBQWMsRUFBSSxRQUFPLENBQUM7QUFFaEYsY0FBTSxRQUFRLE9BQU8sY0FBMkIsc0JBQXNCO0FBQ3RFLGNBQU0sT0FBTyxTQUFTLE1BQU0sS0FBSyxNQUFNLFVBQVUsRUFDNUMsT0FBTyxVQUFRLEVBQUUsZ0JBQWdCLFlBQVksQ0FBQyxLQUFLLFFBQVEsaURBQWlELENBQUMsRUFDN0csSUFBSSxVQUFRLEtBQUssV0FBVyxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUs7QUFDakQsY0FBTSxXQUFXLG1CQUFtQixTQUFTLGFBQWE7QUFDMUQsZUFBTyxDQUFDO0FBQUEsVUFDSjtBQUFBLFVBQUk7QUFBQSxVQUFNO0FBQUEsVUFBUTtBQUFBLFVBQU87QUFBQSxVQUN6QjtBQUFBLFVBQ0EsT0FBTyxPQUFPLFFBQVEsU0FBUyxRQUFRLFNBQVMsVUFDM0MsYUFBYSxVQUFVLGtCQUFrQixVQUFVLEVBQUUsS0FBSztBQUFBLFFBQ25FLENBQUM7QUFBQSxNQUNMLENBQUM7QUFBQSxJQUNMO0FBQUEsSUFFQSxVQUFVLFVBQXlCO0FBQy9CLFVBQUksS0FBSyxXQUFZLFFBQU8sU0FBUyxLQUFLLGFBQVcsUUFBUSxPQUFPLEtBQUssVUFBVTtBQUVuRixVQUFJLEtBQUssU0FBUyxTQUFTLFNBQVM7QUFDaEMsWUFBSSxLQUFLLFNBQVMsVUFBVSxPQUFPO0FBQy9CLGdCQUFNLFFBQVEsQ0FBQyxHQUFHLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxhQUFXLFFBQVEsYUFBYSxLQUFLLFNBQVMsS0FBSztBQUM5RixjQUFJLFNBQVMsU0FBUyxlQUFlLFdBQVksUUFBTztBQUFBLFFBQzVEO0FBQ0EsZUFBTyxTQUFTLEdBQUcsRUFBRTtBQUFBLE1BQ3pCO0FBQ0EsYUFBTyxTQUFTLEtBQUssYUFBVyxRQUFRLGFBQWEsT0FBTyxLQUN4RCxTQUFTLEtBQUssYUFBVyxRQUFRLGFBQWEsSUFBSSxLQUFLLFNBQVMsQ0FBQztBQUFBLElBQ3pFO0FBQUEsSUFFQSxnQkFBZ0IsTUFBbUIsVUFBeUIsVUFBK0I7QUFDdkYsVUFBSSxDQUFDLEtBQUssY0FBYyxTQUFTLEtBQUssQ0FBQyxFQUFFLEdBQUcsTUFBTSxPQUFPLEtBQUssVUFBVSxFQUFHO0FBRTNFLFlBQU0sU0FBUyxPQUFPLFVBQVU7QUFDaEMsWUFBTSxVQUFVLFNBQVMsZUFBZSxjQUFjLEtBQUssY0FBYyxpQkFBaUIsS0FDdEYsVUFBVSxDQUFDLE9BQU8sT0FBTyxNQUFNLEVBQUUsS0FBSyxhQUFXLE9BQU8sU0FBUyxVQUFVLE1BQU0sS0FBSyxVQUFVO0FBQ3BHLFVBQUksQ0FBQyxTQUFTLElBQUksS0FBSyxVQUFVLEtBQUssQ0FBQyxRQUFTO0FBRWhELFlBQU0sWUFBWSxLQUFLO0FBQ3ZCLFdBQUssYUFBYTtBQUNsQixXQUFLLFdBQVcsS0FBSztBQUNyQixVQUFJO0FBQ0EsWUFBSSxPQUFPLE1BQU0sZ0JBQWdCLENBQUMsTUFBTSxVQUFXLE1BQUssZ0JBQWdCO0FBQUEsTUFDNUUsU0FBUyxLQUFLO0FBQ1YsZ0JBQVEsS0FBSywwREFBMEQsR0FBRztBQUFBLE1BQzlFO0FBQUEsSUFDSjtBQUFBLElBRUEsc0JBQXNCLE1BQW1CLFVBQStCO0FBQ3BFLFlBQU0sT0FBTyxPQUFPO0FBRXBCLFVBQUksU0FBUyxlQUFlLGNBQWMsQ0FBQyxNQUFNLFVBQVUsQ0FBQyxLQUFLLFNBQVU7QUFFM0UsWUFBTSxZQUFZLElBQUksSUFBSSxRQUFRO0FBQ2xDLGlCQUFXLFdBQVcsT0FBTyxPQUFPLEtBQUssTUFBTSxHQUFHO0FBQzlDLFlBQUksU0FBUyxjQUFjLEtBQU0sV0FBVSxJQUFJLE9BQU8sUUFBUSxVQUFVLENBQUM7QUFBQSxNQUM3RTtBQUNBLGlCQUFXLFFBQVEsS0FBSyxpQkFBaUIsc0JBQXNCLEdBQUc7QUFDOUQsY0FBTSxLQUFLLEtBQUssYUFBYSxZQUFZO0FBQ3pDLFlBQUksR0FBSSxXQUFVLElBQUksRUFBRTtBQUFBLE1BQzVCO0FBQ0EsWUFBTSxTQUFTLE1BQU0sS0FBSyxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssR0FBRztBQUNwRCxVQUFJLEtBQUsscUJBQXFCLE9BQVE7QUFDdEMsV0FBSyxtQkFBbUI7QUFDeEIsVUFBSTtBQUNBLDBCQUFrQixTQUFTO0FBQUEsTUFDL0IsU0FBUyxLQUFLO0FBQ1YsZ0JBQVEsS0FBSyx1REFBdUQsR0FBRztBQUFBLE1BQzNFO0FBQUEsSUFDSjtBQUFBLElBRUEsbUJBQW1CLE1BQW1CLFVBQXlCO0FBQzNELFlBQU0sUUFBUSxJQUFJLElBQUksU0FBUyxJQUFJLENBQUMsRUFBRSxPQUFPLE9BQU8sTUFBTSxTQUFTLE1BQU0sQ0FBQztBQUMxRSxpQkFBVyxXQUFXLEtBQUssaUJBQWlCLGlEQUFpRCxHQUFHO0FBQzVGLFlBQUksQ0FBQyxRQUFRLGlCQUFpQixDQUFDLE1BQU0sSUFBSSxRQUFRLGFBQWEsRUFBRyxTQUFRLE9BQU87QUFBQSxNQUNwRjtBQUNBLGlCQUFXLENBQUMsT0FBTyxJQUFJLEtBQUssS0FBSyxhQUFhO0FBQzFDLFlBQUksTUFBTSxJQUFJLEtBQUssS0FBSyxLQUFLLGtCQUFrQixNQUFPO0FBQ3RELGFBQUssWUFBWSxVQUFVLElBQUk7QUFDL0IsWUFBSSxLQUFLLGtCQUFrQixNQUFPLE1BQUssWUFBWSxHQUFHLEtBQUssVUFBVTtBQUNyRSxjQUFNLFVBQVUsT0FBTyx3QkFBd0IsOEJBQThCO0FBQzdFLGFBQUssWUFBWSxPQUFPLEtBQUs7QUFBQSxNQUNqQztBQUVBLGlCQUFXLEVBQUUsSUFBSSxPQUFPLFFBQVEsTUFBTSxLQUFLLFVBQVU7QUFDakQsY0FBTSxPQUFPLFNBQVM7QUFDdEIsWUFBSSxNQUFNLEtBQUssY0FBaUMsOEJBQThCO0FBQzlFLFlBQUksQ0FBQyxLQUFLO0FBQ04sZ0JBQU0sU0FBUyxTQUFTLGNBQWMsUUFBUTtBQUM5QyxpQkFBTyxPQUFPO0FBQ2QsaUJBQU8sWUFBWTtBQUNuQixpQkFBTyxpQkFBaUIsU0FBUyxXQUFTO0FBQ3RDLGtCQUFNLGVBQWU7QUFDckIsa0JBQU0sZ0JBQWdCO0FBQ3RCLGtCQUFNLFlBQVksT0FBTyxRQUFRLHNCQUFzQixHQUFHLGFBQWEsWUFBWTtBQUNuRixnQkFBSSxDQUFDLFVBQVc7QUFFaEIsa0JBQU0sT0FBTyxLQUFLLGVBQWUsWUFBWSxLQUFLO0FBQ2xELGdCQUFJO0FBQ0Esa0JBQUksS0FBTSxPQUFNLGtCQUFrQixJQUFJO0FBQUEsa0JBQ2pDLE1BQUssZ0JBQWdCO0FBQzFCLG1CQUFLLGFBQWE7QUFDbEIsbUJBQUssaUJBQWlCO0FBQ3RCLG1CQUFLLFdBQVc7QUFBQSxZQUNwQixTQUFTLEtBQUs7QUFDVixzQkFBUSxLQUFLLGlEQUFpRCxHQUFHO0FBQUEsWUFDckU7QUFDQSxpQkFBSyxRQUFRO0FBQUEsVUFDakIsQ0FBQztBQUNELGdCQUFNLEtBQUssWUFBWSxNQUFNO0FBQUEsUUFDakM7QUFDQSxjQUFNLFNBQVMsS0FBSyxlQUFlO0FBQ25DLFlBQUksYUFBYSxnQkFBZ0IsT0FBTyxNQUFNLENBQUM7QUFDL0MsWUFBSSxhQUFhLGNBQWMsU0FBUyxTQUFTLEtBQUssS0FBSyxPQUFPLEtBQUssb0JBQW9CO0FBQzNGLFlBQUksUUFBUSxTQUFTLHlDQUF5QztBQUU5RCxZQUFJLFdBQVcsS0FBSyxjQUEyQixxQ0FBcUM7QUFDcEYsWUFBSSxDQUFDLFVBQVU7QUFDWCxnQkFBTSxTQUFTLGVBQWUsNkJBQTZCLFVBQVE7QUFDL0Qsa0JBQU0sWUFBWSxPQUFPLFFBQVEsc0JBQXNCLEdBQUcsYUFBYSxZQUFZO0FBQ25GLGdCQUFJLENBQUMsVUFBVztBQUNoQixnQkFBSTtBQUNBLDhCQUFnQixXQUFXLElBQUk7QUFDL0Isa0NBQW9CLFFBQVEsSUFBSTtBQUFBLFlBQ3BDLFNBQVMsS0FBSztBQUNWLHNCQUFRLEtBQUssbURBQW1ELEdBQUc7QUFDbkU7QUFBQSxZQUNKO0FBQ0EsZ0JBQUksS0FBSyxTQUFTLEtBQUsscUJBQXFCLE1BQU0sS0FBSyxLQUFLLE1BQU0sV0FBVztBQUN6RSxtQkFBSyxXQUFXO0FBQ2hCLG1CQUFLLGVBQWUsTUFBTSxLQUFLLE9BQU8sU0FBUztBQUFBLFlBQ25EO0FBQUEsVUFDSixDQUFDO0FBQ0QsaUJBQU8sVUFBVSxJQUFJLDJCQUEyQjtBQUNoRCxpQkFBTyxRQUFRO0FBQ2YsY0FBSSxNQUFNLE1BQU07QUFDaEIscUJBQVc7QUFBQSxRQUNmO0FBQ0EsNEJBQW9CLFVBQVUsZ0JBQWdCLElBQUksS0FBSyxTQUFTLElBQUksQ0FBQztBQUVyRSxZQUFJLENBQUMsTUFBTztBQUNaLFlBQUksT0FBTyxLQUFLLFlBQVksSUFBSSxLQUFLO0FBQ3JDLFlBQUksQ0FBQyxNQUFNO0FBQ1AsaUJBQU8sU0FBUyxjQUFjLE1BQU07QUFDcEMsZUFBSyxZQUFZO0FBQ2pCLGVBQUssT0FBTyxHQUFHLE1BQU0sS0FBSyxNQUFNLFVBQVUsRUFBRSxPQUFPLFVBQVEsU0FBUyxPQUFPLFNBQVMsUUFBUSxDQUFDO0FBQzdGLGdCQUFNLFFBQVEsSUFBSTtBQUNsQixnQkFBTSxVQUFVLElBQUksc0JBQXNCO0FBQzFDLGVBQUssWUFBWSxJQUFJLE9BQU8sSUFBSTtBQUNoQyxlQUFLLFlBQVksUUFBUSxJQUFJO0FBQUEsUUFDakM7QUFDQSxZQUFJLEtBQUssVUFBVSxPQUFPO0FBQ3RCLGVBQUssUUFBUTtBQUNiLGVBQUssU0FBUyxJQUFJO0FBQUEsUUFDdEI7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBRUEsU0FBUyxNQUFtQjtBQUN4QixZQUFNLFVBQVUsS0FBSztBQUNyQixVQUFJLENBQUMsU0FBUyxZQUFhO0FBRTNCLGNBQVEsVUFBVSxPQUFPLDhCQUE4QjtBQUN2RCxXQUFLLE1BQU0sZUFBZSxXQUFXO0FBQ3JDLFlBQU0sdUJBQXVCLElBQUksV0FBVyxpQkFBaUIsSUFBSSxFQUFFLFFBQVE7QUFDM0UsVUFBSSxLQUFLLGNBQWMsd0JBQXdCLEtBQUssY0FBYyxLQUFLLGFBQWE7QUFDaEYsZ0JBQVEsVUFBVSxJQUFJLDhCQUE4QjtBQUFBLE1BQ3hEO0FBQ0EsVUFBSSxLQUFLLGNBQWMsS0FBSyxZQUFhLE1BQUssTUFBTSxXQUFXO0FBQUEsSUFDbkU7QUFBQSxJQUVBLHFCQUFxQixNQUFtQixPQUFvQjtBQUN4RCxZQUFNLFdBQVcsS0FBSyxjQUFjLHdCQUF3QixHQUFHLFFBQVEsc0JBQXNCO0FBQzdGLFVBQUksU0FBVSxRQUFPLFNBQVMsYUFBYSxZQUFZO0FBRXZELFlBQU0sU0FBUyxNQUFNLEtBQUssTUFBTSxpQkFBaUIsc0JBQXNCLENBQUMsRUFDbkUsT0FBTyxXQUFTLE1BQU0sZUFBZSxFQUFFLFVBQVUsaUJBQWlCLEtBQUssRUFBRSxlQUFlLFNBQVM7QUFDdEcsYUFBTyxPQUFPLFdBQVcsSUFBSSxPQUFPLENBQUMsRUFBRSxhQUFhLFlBQVksSUFBSTtBQUFBLElBQ3hFO0FBQUEsSUFFQSxnQkFBZ0IsT0FBb0IsV0FBMEI7QUFDMUQsVUFBSSxDQUFDLFdBQVc7QUFDWixjQUFNLGlCQUFpQix1QkFBdUIsRUFBRSxRQUFRLFdBQVMsTUFBTSxVQUFVLE9BQU8sc0JBQXNCLENBQUM7QUFDL0c7QUFBQSxNQUNKO0FBQ0EsaUJBQVcsU0FBUyxNQUFNLGlCQUFpQixzQkFBc0IsR0FBRztBQUNoRSxjQUFNLFVBQVUsT0FBTyx3QkFBd0IsTUFBTSxhQUFhLFlBQVksTUFBTSxTQUFTO0FBQUEsTUFDakc7QUFBQSxJQUNKO0FBQUEsSUFFQSxVQUFVLE9BQW9CO0FBQzFCLFlBQU0sTUFBTSxNQUFNLGNBQWMsa0NBQWtDO0FBQ2xFLFVBQUksSUFBSyxRQUFPO0FBRWhCLFlBQU0sVUFBVSxPQUFPLFFBQVEsUUFBUSxPQUFPLE9BQU8sT0FBTztBQUM1RCxVQUFJLFVBQVUsS0FBTSxRQUFPO0FBRTNCLGFBQU8sTUFBTSxLQUFLLE1BQU0saUJBQWlCLDJCQUEyQixDQUFDLEVBQ2hFLEtBQUssU0FBTyxJQUFJLGFBQWEsWUFBWSxNQUFNLE9BQU8sTUFBTSxDQUFDO0FBQUEsSUFDdEU7QUFBQSxJQUVBLHVCQUF1QixPQUFvQixJQUFZO0FBQ25ELGFBQU8sTUFBTSxLQUFLLE1BQU0saUJBQWlCLHNCQUFzQixDQUFDLEVBQzNELEtBQUssV0FBUyxNQUFNLGFBQWEsWUFBWSxNQUFNLEVBQUUsR0FBRyxjQUEyQixrQkFBa0I7QUFBQSxJQUM5RztBQUFBLElBRUEsZ0JBQWdCLE1BQW1CLE9BQW9CLFVBQXlCO0FBQzVFLFlBQU0sU0FBUyxLQUFLLFFBQXFCLFdBQVc7QUFDcEQsVUFBSSxDQUFDLE9BQVE7QUFFYixZQUFNLFlBQVksU0FBUyxJQUFJLENBQUMsRUFBRSxJQUFJLFFBQVEsT0FBTyxTQUFTLE1BQU07QUFDaEUsY0FBTSxRQUFRLEtBQUssdUJBQXVCLE9BQU8sRUFBRTtBQUNuRCxjQUFNLE9BQU8sT0FBTyxjQUFjLHlCQUF5QixHQUFHLGFBQWEsS0FBSyxLQUMzRSxTQUFTLEtBQUssVUFBVSxLQUFLLEdBQUcsY0FBYyxJQUFJLEdBQUcsYUFBYSxLQUFLLEtBQU07QUFDbEYsZUFBTyxFQUFFLElBQUksTUFBTSxPQUFPLFVBQVUsV0FBVyxxQkFBcUIsUUFBUSxJQUFJLFdBQVcsS0FBSztBQUFBLE1BQ3BHLENBQUM7QUFDRCw2QkFBdUIsUUFBUSxXQUFXLEtBQUsscUJBQXFCLE1BQU0sS0FBSyxHQUFHLFFBQU0sS0FBSyxhQUFhLEVBQUUsQ0FBQztBQUFBLElBQ2pIO0FBQUEsSUFFQSxhQUFhLElBQVk7QUFDckIsWUFBTSxFQUFFLE1BQU0sTUFBTSxJQUFJO0FBQ3hCLFVBQUksQ0FBQyxRQUFRLENBQUMsTUFBTztBQUVyQixZQUFNLE9BQU8sS0FBSyxjQUEyQix3QkFBd0IsSUFBSSxPQUFPLEVBQUUsQ0FBQyxJQUFJO0FBQ3ZGLFlBQU0sU0FBUyxNQUFNLGNBQTJCLGlCQUFpQjtBQUNqRSxVQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsT0FBTyxRQUFRLFFBQVEsS0FBSyxLQUFLLFFBQVEsUUFBUSxFQUFHO0FBRTVFLFlBQU0sa0JBQWtCLEtBQUsscUJBQXFCLE1BQU0sS0FBSyxNQUFNO0FBQ25FLFdBQUssV0FBVztBQUNoQixXQUFLLGNBQWMsTUFBTSxPQUFPLElBQUksSUFBSTtBQUN4QyxVQUFJLENBQUMsZ0JBQWlCLEVBQUMsT0FBTyxjQUEyQixzQkFBc0IsS0FBSyxRQUFRLE1BQU07QUFDbEcsV0FBSyxRQUFRO0FBQUEsSUFDakI7QUFBQSxJQUVBLGNBQWMsTUFBbUIsT0FBb0IsSUFBbUIsY0FBNEI7QUFDaEcsV0FBSyxpQkFBaUI7QUFDdEIsVUFBSSxHQUFJLE1BQUssZUFBZSxNQUFNLE9BQU8sSUFBSSxZQUFZO0FBQ3pELFdBQUssZ0JBQWdCLE9BQU8sSUFBSTtBQUNoQyxlQUFTLGVBQWUsd0JBQXdCLEdBQUcsT0FBTztBQUFBLElBQzlEO0FBQUEsSUFFQSxnQkFBZ0IsTUFBbUIsUUFBaUI7QUFDaEQsWUFBTSxVQUFVLE9BQU8sUUFBUSxtQkFBbUI7QUFDbEQsVUFBSSxXQUFXLFlBQVksUUFBUSxLQUFLLFNBQVMsT0FBTyxFQUFHO0FBRzNELFVBQUksQ0FBQyxLQUFLLGFBQWEsVUFBVSxHQUFHO0FBQ2hDLGFBQUssV0FBVztBQUNoQixhQUFLLGVBQWUsSUFBSSxJQUFJO0FBQUEsTUFDaEM7QUFDQSxXQUFLLE1BQU0sRUFBRSxlQUFlLEtBQUssQ0FBQztBQUFBLElBQ3RDO0FBQUEsSUFFQSxXQUFXLFVBQXVCLG1CQUFtQixPQUFPO0FBQ3hELFFBQUUsUUFBUSxFQUFFLEtBQUssTUFBTSxLQUFLO0FBRTVCLFlBQU0sZUFBZSxNQUFNO0FBQUEsTUFBQztBQUM1QixZQUFNLE1BQU0sT0FBTyx5QkFBeUIsUUFBUSxXQUFXLFdBQVcsR0FBRztBQUM3RSxZQUFNLGNBQWMsT0FBTyxRQUFRO0FBQUEsUUFDL0IsV0FBVyxFQUFFLEtBQUssS0FBSyxhQUFhO0FBQUEsUUFDcEMsUUFBUSxFQUFFLE9BQU8sY0FBYyxVQUFVLEtBQUs7QUFBQSxRQUM5QyxVQUFVLEVBQUUsT0FBTyxjQUFjLFVBQVUsS0FBSztBQUFBLFFBQ2hELFVBQVUsRUFBRSxPQUFPLGNBQWMsVUFBVSxLQUFLO0FBQUEsTUFDcEQsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sT0FBTyxVQUFVLEdBQUcsQ0FBQztBQUNsRCxpQkFBVyxDQUFDLEtBQUssVUFBVSxLQUFLLGFBQWE7QUFDekMsZUFBTyxlQUFlLFVBQVUsS0FBSyxFQUFFLEdBQUcsWUFBWSxjQUFjLEtBQUssQ0FBQztBQUFBLE1BQzlFO0FBQ0EsWUFBTSxxQkFBcUIsbUJBQW1CLG9CQUFvQixRQUFRLElBQUk7QUFFOUUsYUFBTyxNQUFNO0FBQ1QsVUFBRSxRQUFRLEVBQUUsS0FBSyxNQUFNLEtBQUs7QUFDNUIsNkJBQXFCO0FBQ3JCLG1CQUFXLENBQUMsS0FBSyxVQUFVLEtBQUssYUFBYTtBQUN6QyxnQkFBTSxVQUFVLE9BQU8seUJBQXlCLFVBQVUsR0FBRztBQUM3RCxjQUFJLFdBQVcsUUFBUSxVQUFVLFdBQVcsU0FBUyxRQUFRLFFBQVEsV0FBVyxJQUFLLFNBQVEsZUFBZSxVQUFVLEdBQUc7QUFBQSxRQUM3SDtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFFQSxPQUFPLFVBQXVCLFFBQW9DLFNBQVMsT0FBTztBQUM5RSxVQUFJLE1BQU07QUFDVixVQUFJLFFBQVE7QUFDUixjQUFNLFNBQVMsU0FBUyxzQkFBc0I7QUFDOUMsY0FBTSxRQUFRLE9BQU8sU0FBUyxTQUFTO0FBQ3ZDLFlBQUksQ0FBQyxNQUFPO0FBRVosY0FBTSxPQUFPLE9BQU8sc0JBQXNCO0FBQzFDLGNBQU0sU0FBUyxhQUFhLEtBQUssTUFBTSxPQUFPLE9BQU8sUUFBUSxTQUFTO0FBQ3RFLFlBQUksT0FBUSxTQUFRLFNBQVMsZUFBZSxLQUFLLFNBQVMsU0FBUztBQUFBLE1BQ3ZFO0FBQ0EsV0FBSyxnQkFBZ0IsVUFBVSxHQUFHO0FBQUEsSUFDdEM7QUFBQSxJQUVBLGdCQUFnQixVQUF1QixVQUFrQjtBQUNyRCxZQUFNLE1BQU0sS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLFNBQVMsZUFBZSxTQUFTLGNBQWMsUUFBUSxDQUFDO0FBQ3pGLFVBQUksS0FBSyxJQUFJLE1BQU0sU0FBUyxTQUFTLEtBQUssR0FBRztBQUN6QyxjQUFNLFdBQVcsUUFBUSxVQUFVO0FBQ25DLGlCQUFTLEtBQUssVUFBVSxFQUFFLEtBQUssVUFBVSxVQUFVLENBQUM7QUFBQSxNQUN4RDtBQUFBLElBQ0o7QUFBQSxJQUVBLGVBQWUsTUFBbUIsT0FBb0IsSUFBWSxjQUE0QjtBQUMxRixXQUFLLGNBQWMsS0FBSztBQUV4QixZQUFNLFVBQVUsS0FBSztBQUNyQixZQUFNLFlBQVksZ0JBQWdCLElBQUksS0FBSyxTQUFTLElBQUksTUFBTTtBQUM5RCxZQUFNLGNBQWMsS0FBSyxvQkFBb0IsZUFBZSxLQUFLLFdBQVcsTUFBTSxJQUFJLElBQUk7QUFDMUYsVUFBSSxhQUFhO0FBQ2pCLFVBQUksY0FBYztBQUNsQixVQUFJO0FBQ0osVUFBSTtBQUNKLFlBQU0sVUFBVSxNQUFNO0FBQ2xCLGNBQU0sT0FBTyxLQUFLLHVCQUF1QixPQUFPLEVBQUU7QUFDbEQsWUFBSSxTQUFTLE9BQU87QUFDaEIseUJBQWU7QUFDZixrQkFBUTtBQUNSLHlCQUFlLFFBQVEsS0FBSyxXQUFXLE9BQU8sSUFBSSxJQUFJO0FBQ3RELHdCQUFjO0FBQUEsUUFDbEI7QUFDQSxZQUFJLENBQUMsY0FBYyxhQUFhO0FBQzVCLGNBQUksZ0JBQWdCLEtBQUssU0FBUyxZQUFZLEVBQUcsTUFBSyxPQUFPLE1BQU0sWUFBWTtBQUFBLGNBQzFFLE1BQUssZ0JBQWdCLE1BQU0sT0FBTztBQUFBLFFBQzNDO0FBQ0EsWUFBSSxDQUFDLGVBQWUsT0FBTyxnQkFBZ0IsS0FBSyxxQkFBcUIsTUFBTSxLQUFLLE1BQU0sSUFBSTtBQUN0RixlQUFLLE9BQU8sT0FBTyxZQUFZLEtBQUssVUFBVSxLQUFLLElBQUksTUFBTSxTQUFTO0FBQUEsUUFDMUU7QUFBQSxNQUNKO0FBRUEsWUFBTSxXQUFXLElBQUksZ0JBQWdCO0FBQ3JDLFlBQU0sVUFBVSxFQUFFLFNBQVMsTUFBTSxTQUFTLE1BQU0sUUFBUSxTQUFTLE9BQU87QUFDeEUsWUFBTSxPQUFPLE1BQU07QUFDZixxQkFBYSxLQUFLO0FBQ2xCLGlCQUFTLE1BQU07QUFDZixzQkFBYztBQUNkLHVCQUFlO0FBQ2YsYUFBSyxlQUFlO0FBQUEsTUFDeEI7QUFDQSxZQUFNLFFBQVEsV0FBVyxNQUFNLEdBQUk7QUFDbkMsWUFBTSxXQUFXLENBQUMsVUFBaUI7QUFDL0IsWUFBSyxlQUFlLE1BQU0sV0FBVyxRQUFTLE1BQU0sV0FBVyxNQUFPLFNBQVE7QUFBQSxNQUNsRjtBQUVBLFlBQU0sZ0JBQWdCLENBQUMsVUFBaUI7QUFDcEMsWUFBSSxDQUFDLE1BQU0sYUFBYSxFQUFFLE1BQU0sa0JBQWtCLE1BQU87QUFDekQsWUFBSSxLQUFLLFNBQVMsTUFBTSxNQUFNLEVBQUcsY0FBYTtBQUM5QyxZQUFJLE9BQU8sU0FBUyxNQUFNLE1BQU0sS0FBSyxLQUFLLHFCQUFxQixNQUFNLEtBQUssTUFBTSxHQUFJLGVBQWM7QUFBQSxNQUN0RztBQUNBLGlCQUFXLFFBQVEsQ0FBQyxNQUFNLEtBQUssR0FBRztBQUM5QixhQUFLLGlCQUFpQixVQUFVLFVBQVUsT0FBTztBQUNqRCxtQkFBVyxRQUFRLENBQUMsU0FBUyxhQUFhLGFBQWEsRUFBRyxNQUFLLGlCQUFpQixNQUFNLGVBQWUsT0FBTztBQUFBLE1BQ2hIO0FBQ0EsZUFBUyxpQkFBaUIsV0FBVyxXQUFTO0FBQzFDLFlBQUksQ0FBQyxXQUFXLGFBQWEsVUFBVSxZQUFZLFFBQVEsT0FBTyxHQUFHLEVBQUUsU0FBUyxNQUFNLEdBQUcsRUFBRyxlQUFjLEtBQUs7QUFBQSxNQUNuSCxHQUFHLE9BQU87QUFDVixXQUFLLGVBQWUsRUFBRSxTQUFTLEtBQUs7QUFDcEMsY0FBUTtBQUFBLElBQ1o7QUFBQSxJQUVBLFlBQVksTUFBbUIsT0FBb0IsRUFBRSxJQUFJLE1BQU0sUUFBUSxNQUFNLEdBQWdCO0FBQ3pGLGlCQUFXLFFBQVEsQ0FBQyxNQUFNLEtBQUssRUFBRyxNQUFLLFVBQVUsSUFBSSwwQkFBMEIsd0JBQXdCO0FBQ3ZHLFlBQU0sT0FBTyxnQkFBZ0IsSUFBSSxLQUFLLFNBQVMsSUFBSTtBQUNuRCxZQUFNLGlCQUFpQixTQUFTO0FBQ2hDLFlBQU0sY0FBYyxLQUFLLFdBQVcsSUFBSTtBQUN4QyxVQUFJO0FBQ0osVUFBSTtBQUNKLFVBQUksYUFBYTtBQUNqQixVQUFJO0FBRUosWUFBTSxjQUFjLE1BQU07QUFDdEIsY0FBTSxPQUFPLEtBQUssdUJBQXVCLE9BQU8sRUFBRTtBQUNsRCxZQUFJLFVBQVUsS0FBTTtBQUNwQix1QkFBZTtBQUNmLGdCQUFRO0FBQ1IsdUJBQWUsUUFBUSxLQUFLLFdBQVcsS0FBSyxJQUFJO0FBQUEsTUFDcEQ7QUFDQSxZQUFNLFNBQVMsTUFBTTtBQUNqQixtQkFBVyxRQUFRLENBQUMsTUFBTSxLQUFLLEVBQUcsTUFBSyxVQUFVLE9BQU8sd0JBQXdCO0FBQ2hGLGlCQUFTLGVBQWUsd0JBQXdCLEdBQUcsT0FBTztBQUFBLE1BQzlEO0FBQ0EsWUFBTSxVQUFVLE1BQU07QUFDbEIsWUFBSSxDQUFDLEtBQUssZUFBZSxDQUFDLE1BQU0sZUFBZSxDQUFDLEtBQUssU0FBUyxJQUFJLEVBQUc7QUFFckUsb0JBQVk7QUFDWixjQUFNLFdBQVcsS0FBSyxxQkFBcUIsTUFBTSxLQUFLO0FBQ3RELFlBQUksYUFBYSxNQUFNLGFBQWEsYUFBYTtBQUM3Qyx3QkFBYztBQUNkLGVBQUssZ0JBQWdCLE9BQU8sSUFBSTtBQUNoQyxXQUFDLFNBQVMsUUFBUSxNQUFNO0FBQ3hCLHNCQUFZO0FBQUEsUUFDaEI7QUFDQSxZQUFJLENBQUMsT0FBTyxnQkFBZ0IsS0FBSyxxQkFBcUIsTUFBTSxLQUFLLE1BQU0sTUFDbEUsa0JBQWtCLENBQUMsTUFBTSxjQUFjLFlBQVksRUFBSTtBQUM1RCxzQkFBYztBQUNkLGFBQUssZ0JBQWdCLE9BQU8sRUFBRTtBQUM5QixhQUFLLE9BQU8sTUFBTSxJQUFJO0FBQ3RCLGFBQUssT0FBTyxPQUFPLGlCQUFpQixLQUFLLFVBQVUsS0FBSyxJQUFJLE1BQU0sY0FBYztBQUNoRixZQUFJLENBQUMsWUFBWTtBQUNiLHVCQUFhO0FBQ2IsdUJBQWEsS0FBSztBQUNsQixpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKO0FBR0EsWUFBTSxXQUFXLENBQUMsVUFBaUI7QUFDL0IsWUFBSSxNQUFNLFdBQVcsUUFBUSxNQUFNLFdBQVcsTUFBTyxTQUFRO0FBQUEsTUFDakU7QUFDQSxZQUFNLGNBQWMsQ0FBQyxlQUFlLGNBQWMsU0FBUyxPQUFPO0FBQ2xFLFlBQU0sVUFBVSxDQUFDLFVBQWlCO0FBQzlCLFlBQUksTUFBTSxVQUFXLE1BQUs7QUFBQSxNQUM5QjtBQUNBLFlBQU0sWUFBWSxDQUFDLFVBQXlCO0FBQ3hDLFlBQUksTUFBTSxhQUFhLENBQUMsT0FBTyxXQUFXLGFBQWEsVUFBVSxZQUFZLFFBQVEsT0FBTyxTQUFTLEdBQUcsRUFBRSxTQUFTLE1BQU0sR0FBRyxFQUFHLE1BQUs7QUFBQSxNQUN4STtBQUNBLFlBQU0sWUFBWSxNQUFNO0FBQ3BCLHNCQUFjO0FBQ2QsZ0JBQVE7QUFBQSxNQUNaO0FBQ0EsWUFBTSxPQUFPLENBQUMsU0FBUyxTQUFTO0FBQzVCLG9CQUFZO0FBQ1osdUJBQWU7QUFDZixtQkFBVyxRQUFRLENBQUMsTUFBTSxLQUFLLEdBQUc7QUFDOUIsZUFBSyxvQkFBb0IsVUFBVSxVQUFVLElBQUk7QUFDakQsZUFBSyxVQUFVLE9BQU8sMEJBQTBCLHdCQUF3QjtBQUFBLFFBQzVFO0FBQ0EsbUJBQVcsU0FBUyxZQUFhLFVBQVMsb0JBQW9CLE9BQU8sU0FBUyxJQUFJO0FBQ2xGLGlCQUFTLG9CQUFvQixXQUFXLFdBQVcsSUFBSTtBQUN2RCxlQUFPLG9CQUFvQixRQUFRLFNBQVM7QUFDNUMscUJBQWEsS0FBSztBQUNsQixhQUFLLFdBQVc7QUFDaEIsYUFBSyxhQUFhO0FBQ2xCLGFBQUssZ0JBQWdCO0FBQ3JCLFlBQUksUUFBUTtBQUNSLGVBQUssaUJBQWlCO0FBQ3RCLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0o7QUFDQSxZQUFNLFFBQVEsV0FBVyxNQUFNLEdBQUk7QUFDbkMsV0FBSyxXQUFXO0FBQ2hCLFdBQUssYUFBYTtBQUNsQixXQUFLLGdCQUFnQjtBQUNyQixpQkFBVyxRQUFRLENBQUMsTUFBTSxLQUFLLEdBQUc7QUFDOUIsYUFBSyxpQkFBaUIsVUFBVSxVQUFVLEVBQUUsU0FBUyxNQUFNLFNBQVMsS0FBSyxDQUFDO0FBQUEsTUFDOUU7QUFDQSxpQkFBVyxTQUFTLFlBQWEsVUFBUyxpQkFBaUIsT0FBTyxTQUFTLEVBQUUsU0FBUyxNQUFNLFNBQVMsS0FBSyxDQUFDO0FBQzNHLGVBQVMsaUJBQWlCLFdBQVcsV0FBVyxJQUFJO0FBQ3BELFVBQUksU0FBUyxlQUFlLFdBQVksUUFBTyxpQkFBaUIsUUFBUSxXQUFXLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDakcsY0FBUTtBQUFBLElBQ1o7QUFBQSxJQUVBLFVBQVU7QUFDTixZQUFNLE9BQU8sU0FBUyxjQUEyQixtQ0FBbUM7QUFDcEYsWUFBTSxRQUFRLFNBQVMsY0FBMkIsdUJBQXVCO0FBQ3pFLGlCQUFXLFFBQVEsS0FBSyxnQkFBZ0I7QUFDcEMsWUFBSSxTQUFTLFFBQVEsT0FBTyxTQUFTLElBQUksRUFBRztBQUM1QyxZQUFJLEtBQUssYUFBYSxHQUFJLE1BQUssZ0JBQWdCLFVBQVU7QUFDekQsYUFBSyxlQUFlLE9BQU8sSUFBSTtBQUFBLE1BQ25DO0FBQ0EsVUFBSSxLQUFLLFNBQVMsUUFBUSxLQUFLLFVBQVUsTUFBTyxNQUFLLGNBQWMsS0FBSztBQUN4RSxVQUFJLEtBQUssYUFBYSxLQUFLLFNBQVMsUUFBUSxLQUFLLFVBQVUsU0FBUyxDQUFDLE1BQU0sU0FBUyxLQUFLLGFBQWEsSUFBSTtBQUN0RyxhQUFLLFNBQVMsS0FBSztBQUNuQixZQUFJLEtBQUssTUFBTyxNQUFLLGdCQUFnQixLQUFLLE9BQU8sSUFBSTtBQUFBLE1BQ3pEO0FBQ0EsV0FBSyxPQUFPO0FBQ1osV0FBSyxRQUFRO0FBQ2IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxlQUFlLEVBQUUsVUFBVSxpQkFBaUIsSUFBSSxFQUFFLGVBQWUsVUFBVztBQUV6RyxZQUFNLFdBQVcsSUFBSSxJQUFJLE9BQU8sT0FBTyxPQUFPLFVBQVUsWUFBWSxDQUFDLENBQUMsRUFDakUsT0FBTyxhQUFXLFNBQVMsY0FBYyxJQUFJLEVBQUUsSUFBSSxhQUFXLE9BQU8sUUFBUSxVQUFVLENBQUMsQ0FBQztBQUM5RixpQkFBVyxTQUFTLEtBQUssaUJBQWlCLHVDQUF1QyxHQUFHO0FBQ2hGLGNBQU0sS0FBSyxNQUFNLFFBQVEsc0JBQXNCLEdBQUcsYUFBYSxZQUFZO0FBQzNFLFlBQUksR0FBSSxVQUFTLElBQUksRUFBRTtBQUFBLE1BQzNCO0FBQ0EsWUFBTSxRQUFRLEtBQUssWUFBWSxNQUFNLFFBQVE7QUFDN0MsWUFBTSxXQUFXLE1BQU0sT0FBTyxVQUFRLENBQUMsS0FBSyxLQUFLO0FBQ2pELFdBQUssc0JBQXNCLE1BQU0sUUFBUTtBQUN6QyxXQUFLLGdCQUFnQixNQUFNLFVBQVUsUUFBUTtBQUM3QyxXQUFLLG1CQUFtQixNQUFNLFFBQVE7QUFFdEMsVUFBSSxLQUFLLFlBQVk7QUFDakIsYUFBSyxXQUFXO0FBQUEsTUFDcEIsV0FBVyxLQUFLLGdCQUFnQjtBQUM1QixZQUFJLFNBQVMsS0FBSyxVQUFVLFFBQVE7QUFDcEMsWUFBSSxDQUFDLFNBQVMsVUFBVSxDQUFDLEtBQUssY0FBYyxTQUFTLGVBQWUsWUFBWTtBQUM1RSxnQkFBTSxXQUFXLEtBQUsscUJBQXFCLE1BQU0sS0FBSztBQUN0RCxtQkFBUyxNQUFNLEtBQUssVUFBUSxLQUFLLE9BQU8sUUFBUSxLQUFLLE1BQU0sR0FBRyxFQUFFO0FBQUEsUUFDcEU7QUFDQSxZQUFJLE9BQVEsTUFBSyxZQUFZLE1BQU0sT0FBTyxNQUFNO0FBQUEsaUJBQ3ZDLFNBQVMsZUFBZSxjQUFjLENBQUMsS0FBSyxZQUFZO0FBQzdELG1CQUFTLGVBQWUsd0JBQXdCLEdBQUcsT0FBTztBQUFBLFFBQzlEO0FBQUEsTUFDSixPQUFPO0FBQ0gsYUFBSyxnQkFBZ0IsT0FBTyxLQUFLLHFCQUFxQixNQUFNLEtBQUssQ0FBQztBQUNsRSxhQUFLLGNBQWMsUUFBUTtBQUFBLE1BQy9CO0FBQ0EsV0FBSyxnQkFBZ0IsTUFBTSxPQUFPLFFBQVE7QUFBQSxJQUM5QztBQUFBLElBRUEsSUFBSSxFQUFFLGlCQUFpQixLQUFLLEdBQW1CO0FBQzNDLFVBQUksS0FBSyxVQUFVLENBQUMsS0FBSyxVQUFVLEdBQUc7QUFBQztBQUFBLE1BQU07QUFFN0MsWUFBTSxNQUFNLG1CQUFtQixnQkFBZ0I7QUFDL0MsV0FBSyxjQUFlLE9BQU8sUUFBUSxZQUFZLE9BQU8sUUFBUSxhQUFhLE1BQU8sT0FBTyxHQUFHLElBQUk7QUFDaEcsV0FBSyxpQkFBaUI7QUFDdEIsV0FBSyxtQkFBbUI7QUFDeEIsV0FBSyxXQUFXLG9CQUFvQjtBQUNwQyxXQUFLLG1CQUFtQjtBQUN4QixXQUFLLFlBQVksSUFBSSxnQkFBZ0I7QUFDckMsWUFBTSxFQUFFLE9BQU8sSUFBSSxLQUFLO0FBQ3hCLFdBQUssYUFBYSxJQUFJLGVBQWUsYUFBVztBQUM1QyxtQkFBVyxFQUFFLE9BQU8sS0FBSyxRQUFTLE1BQUssU0FBUyxNQUFxQjtBQUFBLE1BQ3pFLENBQUM7QUFDRCxXQUFLLFdBQVcsSUFBSSxpQkFBaUIsZUFBYTtBQUM5QyxjQUFNLE9BQU8sU0FBUyxjQUFjLG1DQUFtQztBQUN2RSxjQUFNLFFBQVEsU0FBUyxjQUFjLHVCQUF1QjtBQUM1RCxZQUFJLFNBQVMsS0FBSyxRQUFRLFVBQVUsS0FBSyxTQUFTLFVBQVUsS0FBSyxDQUFDLEVBQUUsT0FBTyxNQUN0RSxTQUFTLEtBQUssU0FBUyxNQUFNLEtBQUssT0FBTyxTQUFTLElBQUksTUFDdEQsVUFBVSxNQUFNLFNBQVMsTUFBTSxLQUFLLE9BQU8sU0FBUyxLQUFLLEVBQUcsR0FBRztBQUNoRSxlQUFLLFFBQVE7QUFBQSxRQUNqQjtBQUFBLE1BQ0osQ0FBQztBQUNELFdBQUssU0FBUyxRQUFRLFNBQVMsTUFBTTtBQUFBLFFBQUUsV0FBVztBQUFBLFFBQU0sZUFBZTtBQUFBLFFBQU0sU0FBUztBQUFBLFFBQU0sWUFBWTtBQUFBLFFBQ3BHLGlCQUFpQixDQUFDLFNBQVMsU0FBUyxVQUFVLFlBQVk7QUFBQSxNQUFFLENBQUM7QUFDakUsVUFBSSxTQUFTLGVBQWUsV0FBWSxRQUFPLGlCQUFpQixRQUFRLE1BQU0sS0FBSyxRQUFRLEdBQUcsRUFBRSxNQUFNLE1BQU0sT0FBTyxDQUFDO0FBQ3BILGFBQU8saUJBQWlCLFVBQVUsTUFBTTtBQUNwQyxjQUFNLFNBQVMsS0FBSyxNQUFNLFFBQXFCLFdBQVc7QUFDMUQsY0FBTSxNQUFNLFFBQVEsY0FBMkIsb0NBQW9DO0FBQ25GLFlBQUksVUFBVSxJQUFLLDBCQUF5QixRQUFRLEdBQUc7QUFBQSxNQUMzRCxHQUFHLEVBQUUsT0FBTyxDQUFDO0FBQ2IsZUFBUyxLQUFLLGlCQUFpQixTQUFTLFdBQVM7QUFDN0MsY0FBTSxFQUFFLE9BQU8sSUFBSTtBQUNuQixZQUFJLENBQUMsTUFBTSxhQUFhLEVBQUUsa0JBQWtCLFlBQVksQ0FBQyxLQUFLLFNBQVMsQ0FBQyxLQUFLLEtBQU07QUFDbkYsWUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLE1BQU0sR0FBRztBQUM3QixnQkFBTSxRQUFRLE9BQU8sUUFBcUIsa0JBQWtCO0FBQzVELGNBQUksU0FBUyxLQUFLLE1BQU0sU0FBUyxLQUFLLEVBQUcsTUFBSyxnQkFBZ0IsT0FBTyxNQUFNO0FBQzNFO0FBQUEsUUFDSjtBQUVBLGNBQU0sU0FBUyxPQUFPLFFBQVEsaUJBQWlCO0FBQy9DLFlBQUksQ0FBQyxVQUFVLE9BQU8sUUFBUSxpREFBaUQsRUFBRztBQUNsRixhQUFLLGdCQUFnQixLQUFLLE1BQU0sTUFBTTtBQUV0QyxjQUFNLEtBQUssT0FBTyxRQUFRLHNCQUFzQixHQUFHLGFBQWEsWUFBWTtBQUM1RSxhQUFLLGNBQWMsS0FBSyxNQUFNLEtBQUssT0FBTyxNQUFNLElBQUk7QUFBQSxNQUN4RCxHQUFHLEVBQUUsU0FBUyxNQUFNLE9BQU8sQ0FBQztBQUM1QixXQUFLLFFBQVE7QUFDYixXQUFLLFNBQVM7QUFBQSxJQUNsQjtBQUFBLElBRUEsaUJBQWlCLEtBQWEsT0FBZ0I7QUFDMUMsVUFBSSxRQUFRLGlCQUFrQjtBQUM5QixXQUFLLG1CQUFtQjtBQUN4QixVQUFJLENBQUMsTUFBTyxNQUFLLGNBQWMsS0FBSztBQUFBLElBQ3hDO0FBQUEsSUFFQSxXQUFXO0FBQ1AsV0FBSyxVQUFVLFdBQVc7QUFDMUIsV0FBSyxZQUFZLFdBQVc7QUFDNUIsV0FBSyxXQUFXLE1BQU07QUFDdEIsV0FBSyxXQUFXO0FBQ2hCLFdBQUssY0FBYyxLQUFLO0FBQ3hCLFdBQUssaUJBQWlCO0FBQ3RCLGlCQUFXLFFBQVEsS0FBSyxnQkFBZ0I7QUFDcEMsWUFBSSxLQUFLLGFBQWEsR0FBSSxNQUFLLGdCQUFnQixVQUFVO0FBQUEsTUFDN0Q7QUFDQSxXQUFLLGVBQWUsTUFBTTtBQUMxQixXQUFLLE1BQU0sUUFBUSxXQUFXLEdBQUcsY0FBYyxvQ0FBb0MsR0FBRyxPQUFPO0FBQzdGLFVBQUksS0FBSyxLQUFNLE1BQUssbUJBQW1CLEtBQUssTUFBTSxDQUFDLENBQUM7QUFDcEQsVUFBSSxLQUFLLE1BQU8sTUFBSyxnQkFBZ0IsS0FBSyxPQUFPLElBQUk7QUFDckQsZUFBUyxlQUFlLHdCQUF3QixHQUFHLE9BQU87QUFDMUQsV0FBSyxTQUFTO0FBQUEsSUFDbEI7QUFBQSxFQUNKOzs7QUMvc0JPLE1BQU0sY0FBTixjQUEwQixTQUFTO0FBQUEsSUFDdEMsY0FBYztBQUNWLFlBQU0sVUFBVTtBQUNoQixZQUFNLGVBQWU7QUFBQSxRQUNqQjtBQUFBLFFBQ0EsU0FBUztBQUFBLFFBQ1QsT0FBTyxZQUFZLG9CQUFvQixvR0FBb0c7QUFBQSxNQUMvSTtBQUNBLFlBQU0sRUFBQyxNQUFNLFNBQVMsYUFBWSxDQUFDO0FBQUEsSUFDdkM7QUFBQSxJQUVBLFlBQVk7QUFDUixhQUFPLFlBQVksU0FBUyxlQUFlO0FBQUEsSUFDL0M7QUFBQSxJQUVBLE1BQU07QUFDRixVQUFJLEtBQUssVUFBVSxDQUFDLEtBQUssVUFBVSxHQUFHO0FBQUM7QUFBQSxNQUFNO0FBRTdDLGFBQU8sV0FBVyxRQUFRLHdCQUF3QixxQkFBcUIsTUFBTTtBQUN6RSxjQUFNLFVBQVUsU0FBUyxjQUFjLG1CQUFtQjtBQUMxRCxZQUFJLENBQUMsV0FBVyxRQUFRLGNBQWMsY0FBYyxFQUFHO0FBRXZELGNBQU0sRUFBRSxnQkFBZ0IscUJBQXFCLFdBQVcsSUFBSTtBQUM1RCxjQUFNLE9BQU8sT0FBTyxtQkFBbUI7QUFDdkMsWUFBSSxFQUFFLE9BQU8sS0FBSyxPQUFPLE9BQU8sVUFBVSxHQUFJO0FBQzlDLGNBQU0sVUFBVSxPQUFPLFFBQVEsUUFBUSxPQUFPLE9BQU8sT0FBTztBQUM1RCxZQUFJLENBQUMsTUFBTSxRQUFRLGNBQWMsS0FBSyxVQUFVLEtBQU07QUFFdEQsY0FBTSxTQUFTLGVBQWUsS0FBSyxDQUFDLEVBQUUsUUFBQUMsUUFBTyxNQUFNLE9BQU9BLFNBQVEsVUFBVSxNQUFNLE9BQU8sTUFBTSxDQUFDO0FBQ2hHLGNBQU0sT0FBTyxPQUFPLFFBQVEsS0FBSztBQUNqQyxZQUFJLENBQUMsT0FBTyxVQUFVLElBQUksS0FBSyxPQUFPLEVBQUc7QUFFekMsY0FBTSxjQUFjLGVBQWU7QUFDbkMsY0FBTSxnQkFBZ0IsS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLGNBQWMsS0FBSyxHQUFHLENBQUM7QUFDcEUsY0FBTSxjQUFjLFFBQVE7QUFDNUIsY0FBTSxpQkFBaUIsY0FBYyxnQkFBZ0IsSUFBSTtBQUN6RCxjQUFNLFNBQVMsZUFBZSxLQUFLLENBQUMsRUFBRSxNQUFNLE1BQU0sT0FBTyxLQUFLLE1BQU0sY0FBYztBQUNsRixZQUFJLFFBQVEsd0JBQXdCLFFBQVEsUUFBUSx3QkFBd0IsS0FBTTtBQUVsRixjQUFNLFFBQVEsT0FBTyxPQUFPLG9CQUFvQjtBQUNoRCxjQUFNLGNBQWMsT0FBTyxPQUFPLG9CQUFvQjtBQUN0RCxZQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssS0FBSyxDQUFDLE9BQU8sU0FBUyxXQUFXLEVBQUc7QUFFOUQsY0FBTSxTQUFTLElBQUksS0FBSyxhQUFhO0FBQ3JDLGNBQU0sU0FBUyxjQUFjLGNBQWMsY0FBYztBQUN6RCxjQUFNLGFBQWEsY0FBYyxRQUFRLFNBQVMsU0FBUztBQUMzRCxjQUFNLE9BQU8sT0FBTyxhQUFhLDZFQUE2RSxPQUFPLE9BQU8sV0FBVyxDQUFDO0FBQ3hJLGNBQU0sYUFBYSxjQUNiLFFBQVEsY0FBYyxRQUFRLE9BQU8sT0FBTyxNQUFNLENBQUMseUJBQXlCLE9BQU8sT0FBTyxVQUFVLENBQUMsYUFDckcsWUFBWSxPQUFPLE9BQU8sTUFBTSxDQUFDLHdCQUF3QixjQUFjO0FBQzdFLGNBQU0sVUFBVSxHQUFHLElBQUksSUFBSSxVQUFVO0FBRXJDLGNBQU0sUUFBUSxTQUFTLGNBQWMsTUFBTTtBQUMzQyxjQUFNLFlBQVk7QUFDbEIsY0FBTSxhQUFhLFlBQVksT0FBTztBQUN0QyxjQUFNLGFBQWEsV0FBVyxFQUFFO0FBQ2hDLGNBQU0sYUFBYSxjQUFjLE9BQU87QUFFeEMsY0FBTSxRQUFRLFNBQVMsY0FBYyxNQUFNO0FBQzNDLGNBQU0sWUFBWTtBQUNsQixjQUFNLE1BQU0sa0JBQWtCO0FBQzlCLGNBQU0sTUFBTSxZQUFZO0FBQ3hCLGNBQU0sY0FBYyxPQUFPLGFBQWE7QUFDeEMsY0FBTSxPQUFPLE9BQU8sR0FBRyxlQUFlLElBQUksS0FBSyxjQUFjLE1BQU0sR0FBRyxHQUFHLE9BQU8sT0FBTyxLQUFLLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRTtBQUM5RyxnQkFBUSxhQUFhLE9BQU8sUUFBUSxjQUFjLDJCQUEyQixDQUFDO0FBQUEsTUFDbEYsQ0FBQztBQUVELFdBQUssU0FBUztBQUFBLElBQ2xCO0FBQUEsRUFDSjs7O0FDcEVPLE1BQU0saUJBQU4sY0FBNkIsU0FBUztBQUFBLElBQ3hCLGlCQUFpQjtBQUFBLElBQ2pCLGdCQUFnQjtBQUFBLElBRWpDLGNBQWM7QUFDVixZQUFNLFVBQVU7QUFDaEIsWUFBTSxlQUFlO0FBQUEsUUFDakI7QUFBQSxRQUNBLFNBQVM7QUFBQSxRQUNULE9BQU8sWUFBWSxtQkFBbUIscUVBQXFFO0FBQUEsUUFDM0csYUFBYSxDQUFDO0FBQUEsVUFDVixLQUFLO0FBQUEsVUFDTCxPQUFPLFlBQVksaUJBQWlCLDhDQUE4QztBQUFBLFVBQ2xGLFNBQVM7QUFBQSxRQUNiLEdBQUc7QUFBQSxVQUNDLEtBQUs7QUFBQSxVQUNMLE9BQU8sWUFBWSxpQkFBaUIsOENBQThDO0FBQUEsVUFDbEYsU0FBUztBQUFBLFFBQ2IsQ0FBQztBQUFBLE1BQ0w7QUFDQSxZQUFNLEVBQUMsTUFBTSxTQUFTLGFBQVksQ0FBQztBQUFBLElBQ3ZDO0FBQUEsSUFFQSxZQUFZO0FBQ1IsYUFBTyxZQUFZLFNBQVMscUJBQXFCLEtBQUssWUFBWSxTQUFTLHFCQUFxQjtBQUFBLElBQ3BHO0FBQUEsSUFFQSxhQUFhLFVBQWtCLFVBQW1ELEVBQUUsT0FBTyxNQUFNLFVBQVUsSUFBSyxJQUFJLENBQUMsR0FBRztBQUNwSCxVQUFJLFFBQXVCO0FBQzNCLFVBQUksV0FBVyxTQUFTLGlCQUFpQixRQUFRO0FBQ2pELFVBQUksU0FBUyxRQUFRO0FBQ2pCLGlCQUFTLFFBQVE7QUFDakIsWUFBSSxLQUFNO0FBQUEsTUFDZDtBQUVBLFlBQU0sV0FBVyxJQUFJLGlCQUFpQixNQUFNO0FBQ3hDLG1CQUFXLFNBQVMsaUJBQWlCLFFBQVE7QUFDN0MsWUFBSSxTQUFTLFFBQVE7QUFDakIsY0FBSSxNQUFNO0FBQ04scUJBQVMsV0FBVztBQUNwQixnQkFBSSxNQUFPLGNBQWEsS0FBSztBQUFBLFVBQ2pDO0FBQ0EsbUJBQVMsUUFBUTtBQUFBLFFBQ3JCO0FBQUEsTUFDSixDQUFDO0FBQ0QsZUFBUyxRQUFRLFNBQVMsaUJBQWlCLEVBQUUsV0FBVyxNQUFNLFNBQVMsS0FBSyxDQUFDO0FBRTdFLFVBQUksT0FBTyxTQUFTLE9BQU8sS0FBSyxVQUFVLEdBQUc7QUFDekMsZ0JBQVEsV0FBVyxNQUFNO0FBQ3JCLG1CQUFTLFdBQVc7QUFBQSxRQUN4QixHQUFHLE9BQU87QUFBQSxNQUNkO0FBQUEsSUFDSjtBQUFBLElBRUEsaUNBQWlDLFVBQWtCLGVBQXVCLEVBQUUsT0FBTyxNQUFNLFVBQVUsSUFBSyxJQUFJLENBQUMsR0FBRztBQUM1RyxXQUFLLGFBQWEsVUFBVSxDQUFDLGFBQWE7QUFDdEMsaUJBQVMsUUFBUSxRQUFNLEdBQUcsVUFBVSxPQUFPLGFBQWEsQ0FBQztBQUFBLE1BQzdELEdBQUcsRUFBRSxTQUFTLEtBQUssQ0FBQztBQUFBLElBQ3hCO0FBQUEsSUFFQSxJQUFJLEVBQUUsS0FBSyxJQUFJLEdBQW1CO0FBQzlCLFVBQUksS0FBSyxVQUFVLENBQUMsS0FBSyxVQUFVLEdBQUc7QUFBQztBQUFBLE1BQU07QUFFN0MsVUFBSSxZQUFZLFNBQVMscUJBQXFCLEtBQUssS0FBSztBQUNwRCxhQUFLLGlDQUFpQyxLQUFLLGdCQUFnQixLQUFLLGFBQWE7QUFBQSxNQUNqRixXQUFXLFlBQVksU0FBUyxxQkFBcUIsS0FBSyxLQUFLO0FBQzNELGFBQUssaUNBQWlDLEtBQUssZ0JBQWdCLEtBQUssYUFBYTtBQUFBLE1BQ2pGO0FBRUEsV0FBSyxTQUFTO0FBQUEsSUFDbEI7QUFBQSxFQUNKOzs7QUM1RUEsaUJBQXNCLG9CQUFvQjtBQUN0QyxRQUFJO0FBQ0EsYUFBTyxNQUFNLE9BQU8sV0FBVyxRQUFRLGtCQUFrQjtBQUFBLElBQzdELFNBQVMsS0FBSztBQUNWLGNBQVEsS0FBSyxtREFBbUQsR0FBRztBQUNuRSxhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7OztBQ0RPLE1BQU0saUJBQU4sY0FBNkIsU0FBUztBQUFBLElBQ3hCO0FBQUEsSUFFakIsY0FBYztBQUNWLFlBQU0sVUFBVTtBQUNoQixZQUFNLGVBQWU7QUFBQSxRQUNqQjtBQUFBLFFBQ0EsU0FBUztBQUFBLFFBQ1QsT0FBTyxZQUFZLHNCQUFzQix1REFBdUQ7QUFBQSxRQUNoRyxhQUFhLENBQUM7QUFBQSxVQUNWLEtBQUs7QUFBQSxVQUNMLE9BQU8sWUFBWSxZQUFZLGtDQUFrQztBQUFBLFVBQ2pFLFNBQVM7QUFBQSxRQUNiLEdBQUc7QUFBQSxVQUNDLEtBQUs7QUFBQSxVQUNMLE9BQU8sWUFBWSxxQkFBcUIsMERBQTBEO0FBQUEsVUFDbEcsU0FBUztBQUFBLFFBQ2IsR0FBRztBQUFBLFVBQ0MsS0FBSztBQUFBLFVBQ0wsT0FBTyxZQUFZLGtCQUFrQiw2Q0FBNkM7QUFBQSxVQUNsRixTQUFTO0FBQUEsUUFDYixHQUFHO0FBQUEsVUFDQyxLQUFLO0FBQUEsVUFDTCxPQUFPLFlBQVksaUJBQWlCLGlEQUFpRDtBQUFBLFVBQ3JGLFNBQVM7QUFBQSxRQUNiLEdBQUc7QUFBQSxVQUNDLEtBQUs7QUFBQSxVQUNMLE9BQU8sWUFBWSxjQUFjLG9DQUFvQztBQUFBLFVBQ3JFLFNBQVM7QUFBQSxRQUNiLEdBQUc7QUFBQSxVQUNDLEtBQUs7QUFBQSxVQUNMLE9BQU8sWUFBWSxvQkFBb0IsbURBQW1EO0FBQUEsVUFDMUYsU0FBUztBQUFBLFFBQ2IsQ0FBQztBQUFBLE1BQ0w7QUFDQSxZQUFNLEVBQUMsTUFBTSxTQUFTLGFBQVksQ0FBQztBQUVuQyxXQUFLLGVBQWU7QUFBQSxRQUNoQixNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTixXQUFXO0FBQUEsTUFDZjtBQUFBLElBQ0o7QUFBQSxJQUVBLFlBQVk7QUFDUixhQUFPLFlBQVksU0FBUyxrQkFBa0I7QUFBQSxJQUNsRDtBQUFBLElBRUEsTUFBTSxJQUFJLEVBQUUsU0FBUyxNQUFNLE9BQU8sT0FBTyxZQUFZLFFBQVEsR0FBbUI7QUFDNUUsVUFBSSxLQUFLLFVBQVUsQ0FBQyxLQUFLLFVBQVUsR0FBRztBQUFDO0FBQUEsTUFBTTtBQUU3QyxZQUFNLFFBQVMsT0FBTyxlQUFlLGVBQWUsTUFBTSxRQUFRLFVBQVUsSUFBSyxhQUFhLENBQUM7QUFDL0YsVUFBSSxDQUFDLE1BQU0sT0FBUTtBQUNuQixXQUFLLFNBQVM7QUFFZCxZQUFNLFdBQVcsTUFBTSxrQkFBa0I7QUFDekMsWUFBTSxZQUFZLElBQUksSUFBSSxNQUFNLElBQUksVUFBUSxDQUFDLE9BQU8sS0FBSyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFFekUsZUFBUyxpQkFBaUIscUJBQXFCLEVBQUUsUUFBUSxjQUFZO0FBQ2pFLGNBQU0sT0FBTyxVQUFVLElBQUksU0FBUyxhQUFhLFNBQVMsS0FBSyxFQUFFO0FBQ2pFLFlBQUksQ0FBQyxRQUFRLEtBQUssV0FBVyxLQUFNO0FBRW5DLGNBQU0sRUFBRSxNQUFNLFFBQVEsU0FBUyxFQUFFLElBQUksVUFBVSxJQUFJLE9BQU8sS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDO0FBQzdFLGNBQU0sWUFBWSxPQUFPLFdBQVcsUUFBUSxRQUFRLGVBQWUsS0FBSyxPQUFPLEVBQUU7QUFDakYsY0FBTSxlQUFlLFNBQVMsY0FBYywwQkFBMEI7QUFDdEUsY0FBTSxhQUFjLFNBQVMsUUFBUyxjQUFjLGFBQWEsS0FBSyxLQUFLLEtBQUssY0FBYyxLQUFLLFdBQVcsUUFBUTtBQUN0SCxjQUFNLGdCQUFnQixVQUFVLElBQUksS0FBSyxPQUFPLE1BQU07QUFDdEQsY0FBTSxhQUFjLFFBQVEsTUFBTSxRQUFRLE1BQU0sV0FBVyxXQUFXLEtBQUssS0FBSyxVQUFVLFlBQVksU0FBUyxJQUFLLE9BQU87QUFFM0gsY0FBTSxlQUFlLENBQUM7QUFDdEIsWUFBSSxRQUFTLGNBQWEsS0FBSyxhQUFhO0FBQzVDLHFCQUFhLEtBQUssVUFBVTtBQUM1QixZQUFJLEtBQU0sY0FBYSxLQUFLLFVBQVU7QUFDdEMsY0FBTSxlQUFlLGFBQWEsS0FBSyxHQUFHLEVBQUUsS0FBSztBQUVqRCxZQUFJLGdCQUFnQixjQUFjO0FBQzlCLHVCQUFhLGNBQWM7QUFBQSxRQUMvQjtBQUVBLGNBQU0sYUFBYSxTQUFTLGlCQUFpQixlQUFlO0FBQzVELGNBQU0sT0FBTyxXQUFXLENBQUM7QUFDekIsWUFBSSxNQUFNO0FBQ04sZ0JBQU0sZUFBZSxLQUFLLGNBQWMsWUFBWTtBQUNwRCxjQUFJLGNBQWM7QUFDZCxnQkFBSSxPQUFPLGFBQWEsY0FBYyxHQUFHO0FBQ3pDLGdCQUFJLENBQUMsTUFBTTtBQUNQLHFCQUFPLFNBQVMsY0FBYyxHQUFHO0FBQ2pDLG1CQUFLLFlBQVk7QUFDakIscUJBQU8sYUFBYSxXQUFZLE1BQUssWUFBWSxhQUFhLFVBQVU7QUFDeEUsMkJBQWEsWUFBWSxJQUFJO0FBQUEsWUFDakM7QUFDQSxnQkFBSSxhQUFjLE1BQUssY0FBYztBQUNyQyxpQkFBSyxPQUFPO0FBQUEsVUFDaEI7QUFFQSxjQUFJLFdBQVcsS0FBSztBQUNoQixrQkFBTSxVQUFVLEtBQUssY0FBMkIsWUFBWTtBQUM1RCxnQkFBSSxTQUFTO0FBQ1Qsc0JBQVEsWUFBWTtBQUFBLFlBQ3hCO0FBQUEsVUFDSjtBQUFBLFFBQ0o7QUFFQSxZQUFJLFNBQVMsUUFBUTtBQUNqQixnQkFBTSxvQkFBb0IsU0FBUyxjQUEyQixZQUFZO0FBQzFFLGNBQUksbUJBQW1CO0FBQ25CLDhCQUFrQixNQUFNLFFBQVEsS0FBSyxhQUFhLE1BQU0sS0FBSztBQUFBLFVBQ2pFO0FBQUEsUUFDSjtBQUVBLFlBQUksWUFBWTtBQUNaLGdCQUFNLFlBQVksU0FBUyxjQUEyQix1QkFBdUI7QUFDN0UsY0FBSSxXQUFXO0FBQ1gsc0JBQVUsTUFBTSxrQkFBa0I7QUFDbEMsc0JBQVUsTUFBTSxpQkFBaUI7QUFBQSxVQUNyQztBQUFBLFFBQ0o7QUFFQSxZQUFJLFNBQVM7QUFDVCxnQkFBTSxZQUFZLFNBQVMsY0FBZ0MsZ0JBQWdCO0FBQzNFLGNBQUksV0FBVztBQUNYLHNCQUFVLE1BQU0sVUFBVSxJQUFJLFFBQVEsVUFBVSxFQUFFO0FBQUEsVUFDdEQ7QUFDQSxjQUFJLFNBQVMsVUFBVSxTQUFTLGVBQWUsR0FBRztBQUM5QyxrQkFBTSxhQUFhLFNBQVMsY0FBZ0MsaUJBQWlCO0FBQzdFLGdCQUFJLFlBQVk7QUFFWix5QkFBVyxNQUFNLFdBQVcsSUFBSSxRQUFRLFVBQVUsRUFBRTtBQUFBLFlBQ3hEO0FBQUEsVUFDSjtBQUNBLG1CQUFTLGlCQUFpQixNQUFNLEVBQUUsUUFBUSxPQUFLLEVBQUUsT0FBTyxDQUFDO0FBQUEsUUFDN0Q7QUFBQSxNQUNKLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjs7O0FDbklPLE1BQU0sa0JBQU4sY0FBOEIsU0FBUztBQUFBLElBQ2xDLFdBQWlEO0FBQUEsSUFDakQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVFSLGNBQWM7QUFDVixZQUFNLFVBQVU7QUFDaEIsWUFBTSxlQUFlO0FBQUEsUUFDakI7QUFBQSxRQUNBLFNBQVM7QUFBQSxRQUNULE9BQU8sWUFBWSxxQkFBcUIsK0RBQStEO0FBQUEsTUFDM0c7QUFDQSxZQUFNLEVBQUMsTUFBTSxTQUFTLGFBQVksQ0FBQztBQUFBLElBQ3ZDO0FBQUEsSUFFQSxZQUFZO0FBQ1IsYUFBTyxZQUFZLFNBQVMsa0JBQWtCO0FBQUEsSUFDbEQ7QUFBQSxJQUVBLGdCQUFnQixLQUFhO0FBQ3pCLGFBQU8sTUFBTSxJQUFJLE9BQU8sQ0FBQyxFQUFFLFlBQVksSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJO0FBQUEsSUFDOUQ7QUFBQSxJQUVBLG9CQUFvQixNQUF3QztBQUN4RCxjQUFRLE1BQU07QUFBQSxRQUNWLEtBQUs7QUFBRyxpQkFBTztBQUFBLFFBQ2YsS0FBSztBQUFHLGlCQUFPO0FBQUEsUUFDZixLQUFLO0FBQUcsaUJBQU87QUFBQSxRQUNmO0FBQVMsaUJBQU87QUFBQSxNQUNwQjtBQUFBLElBQ0o7QUFBQSxJQUVBLFlBQVksT0FBaUI7QUFDekIsWUFBTSxZQUFZLE9BQU8sTUFBTSxjQUFjO0FBQzdDLGNBQVEsTUFBTSxrQkFBa0I7QUFBQSxRQUM1QixLQUFLO0FBQVUsaUJBQU87QUFBQSxRQUN0QixLQUFLO0FBQVksaUJBQU8sT0FBTyxTQUFTLFNBQVMsSUFBSSxZQUFZO0FBQUEsUUFDakUsS0FBSztBQUFTLGlCQUFPLE9BQU8sU0FBUyxTQUFTLElBQUksWUFBWSxLQUFLO0FBQUEsUUFDbkU7QUFBUyxpQkFBTztBQUFBLE1BQ3BCO0FBQUEsSUFDSjtBQUFBLElBRUEsYUFBYSxPQUFpQjtBQUMxQixZQUFNLFdBQVcsTUFBTSxRQUFRLE9BQU8sV0FBVyxXQUFXLEtBQUssTUFBTSxVQUFVLFlBQVksU0FBUztBQUN0RyxVQUFJLFVBQVU7QUFDVixlQUFPO0FBQUEsTUFDWCxNQUFPLFFBQU87QUFBQSxJQUNsQjtBQUFBLElBRUEsZUFBZSxPQUFpQjtBQUM1QixZQUFNLGdCQUFnQixLQUFLLE1BQU0sT0FBTyxNQUFNLHNCQUFzQixJQUFJLElBQUk7QUFDNUUsWUFBTSxXQUFXLEdBQUcsYUFBYTtBQUVqQyxZQUFNLE9BQU8sS0FBSyxVQUFVLElBQUksT0FBTyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDM0QsWUFBTSxFQUFFLE9BQU8sV0FBVyxTQUFTLE9BQU8sUUFBUSxFQUFFLElBQUk7QUFFeEQsYUFBTztBQUFBLFFBQ0gsTUFBTTtBQUFBLFFBQ04sS0FBSyxvQkFBb0IsTUFBTSxvQkFBb0I7QUFBQSxRQUNuRCxNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTjtBQUFBLFFBQ0EsTUFBTTtBQUFBLFFBQ04sTUFBTTtBQUFBLFFBQ04sTUFBTTtBQUFBLFFBQ047QUFBQSxRQUNBLEtBQUssZ0JBQWdCLE1BQU07QUFBQSxRQUMzQjtBQUFBLFFBQ0E7QUFBQTtBQUFBLFFBQ0EsS0FBSyxZQUFZLEtBQUs7QUFBQSxRQUN0QixLQUFLLGFBQWEsS0FBSztBQUFBLE1BQzNCLEVBQUUsS0FBSyxHQUFJO0FBQUEsSUFDZjtBQUFBLElBRUEsTUFBTSxnQkFBZ0IsTUFBYztBQUNoQyxVQUFJO0FBQ0EsY0FBTSxVQUFVLFVBQVUsVUFBVSxJQUFJO0FBQ3hDLGVBQU87QUFBQSxNQUNYLFNBQVMsS0FBSztBQUNWLGdCQUFRLEtBQUsscURBQXFELEdBQUc7QUFDckUsY0FBTSxXQUFXLFNBQVMsY0FBYyxVQUFVO0FBQ2xELGlCQUFTLFFBQVE7QUFDakIsaUJBQVMsS0FBSyxZQUFZLFFBQVE7QUFDbEMsaUJBQVMsT0FBTztBQUNoQixZQUFJO0FBQ0EsaUJBQU8sU0FBUyxZQUFZLE1BQU07QUFBQSxRQUN0QyxTQUFTQyxNQUFLO0FBQ1YsaUJBQU87QUFBQSxRQUNYLFVBQUU7QUFDRSxtQkFBUyxPQUFPO0FBQUEsUUFDcEI7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBRUEsTUFBTSxnQkFBZ0IsS0FBaUI7QUFDbkMsWUFBTSxhQUFhO0FBR25CLFVBQUksSUFBSSxZQUFZLElBQUksU0FBUztBQUM3QixjQUFNLGVBQWUsUUFBUSwrREFBK0Q7QUFDNUYsWUFBSSxjQUFjO0FBQ2QsZUFBSyxVQUFVO0FBQ2YsZ0JBQU0sMEJBQTBCO0FBQUEsUUFDcEM7QUFDQTtBQUFBLE1BQ0o7QUFHQSxZQUFNLGlCQUFrQixPQUFPLGVBQWUsZUFBZSxNQUFNLFFBQVEsVUFBVSxJQUFLLGFBQWEsQ0FBQztBQUN4RyxVQUFJLENBQUMsZUFBZSxRQUFRO0FBQ3hCLGNBQU0sc0NBQXNDO0FBQzVDO0FBQUEsTUFDSjtBQUVBLFVBQUksQ0FBQyxLQUFLLFVBQVU7QUFDaEIsY0FBTSxpRkFBaUY7QUFDdkY7QUFBQSxNQUNKO0FBRUEsVUFBSSxvQkFBb0IsU0FBUyxPQUFPLE1BQU0sVUFBVSxDQUFDLEdBQUcsRUFBRTtBQUc5RCxVQUFJLE1BQU0saUJBQWlCLEtBQUssSUFBSSxVQUFVO0FBQzFDLGNBQU0sY0FBYyxPQUFPLGlDQUFpQztBQUM1RCw0QkFBb0IsU0FBUyxPQUFPLFdBQVcsR0FBRyxFQUFFO0FBRXBELFlBQUksTUFBTSxpQkFBaUIsR0FBRztBQUMxQixnQkFBTSxvREFBb0Q7QUFDMUQ7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUdBLFlBQU0sZUFBZSxlQUFlLE9BQU8sV0FBUyxPQUFPLE1BQU0sT0FBTyxJQUFJLGlCQUFpQjtBQUM3RixVQUFJLENBQUMsYUFBYSxRQUFRO0FBQ3RCLGNBQU0sK0NBQStDLGlCQUFpQixFQUFFO0FBQ3hFO0FBQUEsTUFDSjtBQUVBLFlBQU0sZ0JBQWdCLGFBQWEsSUFBSSxLQUFLLGVBQWUsS0FBSyxJQUFJLENBQUMsRUFBRSxLQUFLLElBQUk7QUFFaEYsVUFBSSxDQUFDLE1BQU0sS0FBSyxnQkFBZ0IsYUFBYSxHQUFHO0FBQzVDLGNBQU0seURBQXlEO0FBQy9EO0FBQUEsTUFDSjtBQUdBLFlBQU0sUUFBUSxLQUFLLElBQUksR0FBRyxhQUFhLElBQUksT0FBSyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbEUsWUFBTSxZQUFZLEtBQUs7QUFFdkIsWUFBTSxnRUFBZ0U7QUFBQSxJQUMxRTtBQUFBLElBRUEsbUJBQW1CO0FBQ2YsWUFBTSxTQUF5QixTQUFTLGNBQWMsS0FBSztBQUMzRCxhQUFPLFVBQVUsSUFBSSxlQUFlO0FBQ3BDLGFBQU8sTUFBTSxVQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBZ0J2QixhQUFPLGNBQWM7QUFDckIsVUFBSSxjQUFjO0FBQ2xCLGFBQU8sYUFBYSxXQUFXLEVBQUU7QUFDakMsYUFBTyxhQUFhLFlBQVksV0FBVztBQUUzQyxZQUFNLHVCQUF1QixDQUFDLE1BQXFCLEtBQUssaUJBQWlCLEdBQUcsTUFBTTtBQUNsRixhQUFPLGlCQUFpQixXQUFXLG9CQUFvQjtBQUN2RCxhQUFPLGlCQUFpQixTQUFTLG9CQUFvQjtBQUVyRCxhQUFPLHVCQUF1QjtBQUM5QixhQUFPLFVBQVUsQ0FBQyxNQUFNLEtBQUssZ0JBQWdCLENBQUM7QUFDOUMsV0FBSyxpQkFBaUIsRUFBRSxVQUFVLE9BQU8sU0FBUyxNQUFNLEdBQUcsTUFBTTtBQUNqRSxhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsaUJBQWlCLEdBQWdELFFBQXFCO0FBQ2xGLFVBQUksY0FBYztBQUNsQixVQUFJLEVBQUUsWUFBWSxFQUFFLFNBQVM7QUFDekIsZUFBTyxNQUFNLGFBQWE7QUFDMUIsZUFBTyxjQUFjO0FBQ3JCLHNCQUFjO0FBQ2QsZUFBTyxhQUFhLFlBQVksV0FBVztBQUFBLE1BQy9DLFdBQVcsRUFBRSxVQUFVO0FBQ25CLGVBQU8sTUFBTSxhQUFhO0FBQzFCLGVBQU8sY0FBYztBQUNyQixzQkFBYztBQUNkLGVBQU8sYUFBYSxZQUFZLFdBQVc7QUFBQSxNQUMvQyxPQUFPO0FBQ0gsZUFBTyxNQUFNLGFBQWE7QUFDMUIsZUFBTyxjQUFjO0FBQ3JCLHNCQUFjO0FBQ2QsZUFBTyxhQUFhLFlBQVksV0FBVztBQUFBLE1BQy9DO0FBQUEsSUFDSjtBQUFBLElBRUEsZUFBZTtBQUNYLFlBQU0scUJBQXFCLFNBQVMsY0FBYyw0Q0FBNEM7QUFDOUYsVUFBSSxzQkFBc0IsQ0FBQyxTQUFTLGNBQWMsZ0JBQWdCLEdBQUc7QUFDakUsY0FBTSxhQUFhLEtBQUssaUJBQWlCO0FBQ3pDLDJCQUFtQixZQUFZLGFBQWEsWUFBWSxrQkFBa0I7QUFBQSxNQUM5RTtBQUFBLElBQ0o7QUFBQSxJQUVBLE1BQU0sTUFBTTtBQUNSLFVBQUksS0FBSyxVQUFVLENBQUMsS0FBSyxVQUFVLEdBQUc7QUFBQztBQUFBLE1BQU07QUFFN0MsV0FBSyxTQUFTO0FBQ2QsV0FBSyxXQUFXLE1BQU0sa0JBQWtCO0FBRXhDLFdBQUsscUJBQXFCLEtBQUssYUFBYSxLQUFLLElBQUk7QUFDckQsVUFBSSxTQUFTLGVBQWUsV0FBWSxNQUFLLGFBQWE7QUFBQSxVQUNyRCxRQUFPLGlCQUFpQixRQUFRLEtBQUssb0JBQW9CLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFBQSxJQUNoRjtBQUFBLEVBQ0o7OztBQzVPTyxNQUFNLGlCQUFOLGNBQTZCLFNBQVM7QUFBQSxJQUN6QyxjQUFjO0FBQ1YsWUFBTSxVQUFVO0FBQ2hCLFlBQU0sZUFBZTtBQUFBLFFBQ2pCO0FBQUEsUUFDQSxTQUFTO0FBQUEsUUFDVCxPQUFPLFlBQVksa0JBQWtCLHFEQUFxRDtBQUFBLFFBQzFGLGFBQWEsQ0FBQztBQUFBLFVBQ1YsS0FBSztBQUFBLFVBQ0wsT0FBTyxZQUFZLHFCQUFxQixzRUFBc0U7QUFBQSxVQUM5RyxTQUFTO0FBQUEsUUFDYixDQUFDO0FBQUEsTUFDTDtBQUNBLFlBQU0sRUFBQyxNQUFNLFNBQVMsYUFBWSxDQUFDO0FBQUEsSUFDdkM7QUFBQSxJQUVBLFlBQVk7QUFDUixhQUFPLFlBQVksU0FBUyxrQkFBa0I7QUFBQSxJQUNsRDtBQUFBLElBRUEsTUFBTSxnQkFBZ0IsTUFBYztBQUNoQyxZQUFNLFVBQVUsVUFBVSxVQUFVLElBQUk7QUFDeEMsWUFBTSxRQUFRLFNBQVMsY0FBYyxLQUFLO0FBQzFDLFlBQU0sY0FBYztBQUNwQixZQUFNLE1BQU0sV0FBVztBQUN2QixZQUFNLE1BQU0sU0FBUztBQUNyQixZQUFNLE1BQU0sUUFBUTtBQUNwQixZQUFNLE1BQU0sYUFBYTtBQUN6QixZQUFNLE1BQU0sUUFBUTtBQUNwQixZQUFNLE1BQU0sVUFBVTtBQUN0QixZQUFNLE1BQU0sZUFBZTtBQUMzQixZQUFNLE1BQU0sU0FBUztBQUNyQixlQUFTLEtBQUssWUFBWSxLQUFLO0FBQy9CLGlCQUFXLE1BQU0sTUFBTSxPQUFPLEdBQUcsR0FBSTtBQUFBLElBQ3pDO0FBQUEsSUFFQSxJQUFJLEVBQUUsY0FBYyxHQUFtQjtBQUNuQyxVQUFJLEtBQUssVUFBVSxDQUFDLEtBQUssVUFBVSxHQUFHO0FBQUM7QUFBQSxNQUFNO0FBRTdDLFVBQUksZUFBZTtBQUNmLGNBQU0sVUFBVSxTQUFTLGlCQUFpQiwwQkFBMEI7QUFDcEUsWUFBSSxDQUFDLFFBQVEsT0FBUTtBQUVyQixnQkFBUSxRQUFRLFdBQVM7QUFDckIsZ0JBQU0sU0FBUyxNQUFNLGNBQWdDLG9CQUFvQjtBQUN6RSxnQkFBTSxXQUFXLE1BQU0sY0FBa0MscUJBQXFCO0FBQzlFLGdCQUFNLE9BQU8sTUFBTSxjQUFvQyxvQkFBb0I7QUFFM0UsY0FBSSxRQUFRO0FBQ1IsbUJBQU8sTUFBTSxTQUFTO0FBQ3RCLG1CQUFPLGlCQUFpQixTQUFTLE9BQUs7QUFDbEMsZ0JBQUUsZ0JBQWdCO0FBQ2xCLG1CQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFBQSxZQUNuQyxDQUFDO0FBQUEsVUFDTDtBQUVBLGNBQUksVUFBVTtBQUNWLHFCQUFTLE1BQU0sU0FBUztBQUN4QixrQkFBTSxhQUFhLFNBQVMsY0FBMkIsNkJBQTZCO0FBQ3BGLGdCQUFJLFlBQVk7QUFDWix5QkFBVyxNQUFNLFNBQVM7QUFDMUIseUJBQVcsaUJBQWlCLFNBQVMsT0FBSztBQUN0QyxrQkFBRSxnQkFBZ0I7QUFDbEIscUJBQUssaUJBQWlCLFdBQVcsZUFBZSxJQUFJLEtBQUssQ0FBQztBQUFBLGNBQzlELENBQUM7QUFBQSxZQUNMO0FBRUEscUJBQVMsaUJBQWlCLFNBQVMsT0FBSztBQUNwQyxrQkFBSSxFQUFFLGtCQUFrQixXQUFXLEVBQUUsT0FBTyxRQUFRLDZCQUE2QixFQUFHO0FBQ3BGLG9CQUFNLGFBQWEsU0FBUyxVQUFVLElBQUk7QUFDMUMseUJBQVcsY0FBYyw2QkFBNkIsR0FBRyxPQUFPO0FBQ2hFLG9CQUFNLFNBQVMsV0FBVyxlQUFlLElBQUksS0FBSztBQUNsRCxtQkFBSyxnQkFBZ0IsS0FBSztBQUFBLFlBQzlCLENBQUM7QUFBQSxVQUNMO0FBRUEsY0FBSSxNQUFNO0FBQ04saUJBQUssTUFBTSxTQUFTO0FBQ3BCLGlCQUFLLGlCQUFpQixTQUFTLE9BQUs7QUFDaEMsZ0JBQUUsZ0JBQWdCO0FBQ2xCLG1CQUFLLGdCQUFnQixLQUFLLFVBQVUsS0FBSyxDQUFDO0FBQUEsWUFDOUMsQ0FBQztBQUFBLFVBQ0w7QUFBQSxRQUNKLENBQUM7QUFFRCxhQUFLLFNBQVM7QUFBQSxNQUNsQjtBQUFBLElBQ0o7QUFBQSxFQUNKOzs7QUM3RkEsMkJBQUMsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLDBHQUEwRyxFQUFDLEdBQUUsRUFBQyxTQUFVLFVBQVMsU0FBVSxDQUFDLHdHQUF3RyxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLGtJQUFrSSxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLGtGQUFrRixFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLDZGQUE0RixnREFBK0MsNEVBQTJFLHdEQUF3RCxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLDJLQUEwSyxpR0FBZ0csb0ZBQW9GLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsd0dBQXVHLCtHQUE4RyxvRUFBb0UsRUFBQyxHQUFFLEVBQUMsU0FBVSxTQUFRLFNBQVUsQ0FBQyx1SEFBdUgsRUFBQyxHQUFFLEVBQUMsU0FBVSxTQUFRLFNBQVUsQ0FBQyw0RUFBMkUsaUdBQWdHLHNIQUFzSCxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLHVIQUFzSCw2SEFBNkgsRUFBQyxHQUFFLEVBQUMsU0FBVSxTQUFRLFNBQVUsQ0FBQyxnRUFBK0QsaUdBQWlHLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsaUVBQWdFLCtGQUE4RiwrQ0FBK0MsRUFBQyxHQUFFLEVBQUMsU0FBVSxTQUFRLFNBQVUsQ0FBQywwS0FBMEssRUFBQyxHQUFFLEVBQUMsU0FBVSxTQUFRLFNBQVUsQ0FBQyx1R0FBc0csNERBQTRELEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsZ0dBQWdHLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsc0dBQXNHLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsb0hBQW9ILEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsb0hBQW9ILEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsa0dBQWtHLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsK0ZBQStGLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsb0hBQW9ILEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMscUZBQXFGLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsb0NBQW9DLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsMkJBQTJCLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsdUNBQXVDLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsZ0RBQWdELEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsMkJBQTJCLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsdUJBQXVCLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsNEJBQTRCLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsMEJBQTBCLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsaUJBQWlCLEVBQUMsQ0FBQzs7O0FDUS9xSixXQUFTLG1CQUFtQixNQUFxQjtBQUNwRCxRQUFJLENBQUMsS0FBSyxXQUFXLEdBQUc7QUFDcEIsV0FBSyxRQUFRO0FBQ2I7QUFBQSxJQUNKO0FBRUEsVUFBTSxTQUFTLFNBQVMsY0FBYyxRQUFRO0FBQzlDLFdBQU8sWUFBWTtBQUNuQixXQUFPLGFBQWEsbUJBQW1CLHdCQUF3QjtBQUMvRCxXQUFPLFlBQVksS0FBSyxPQUFPO0FBRS9CLFVBQU0sU0FBUyxNQUFNO0FBQ2pCLFVBQUksQ0FBQyxPQUFPLFlBQWE7QUFDekIsYUFBTyxPQUFPO0FBQ2QsV0FBSyxRQUFRO0FBQUEsSUFDakI7QUFFQSxVQUFNLFVBQVUsTUFBTTtBQUNsQixhQUFPLE1BQU07QUFDYixhQUFPO0FBQUEsSUFDWDtBQUNBLFNBQUssWUFBWSxpQkFBaUIsU0FBUyxPQUFPO0FBQ2xELFdBQU8saUJBQWlCLFVBQVUsV0FBUztBQUN2QyxZQUFNLGVBQWU7QUFDckIsY0FBUTtBQUFBLElBQ1osQ0FBQztBQUNELFdBQU8saUJBQWlCLFNBQVMsV0FBUztBQUN0QyxVQUFJLE1BQU0sV0FBVyxPQUFRO0FBQzdCLFlBQU0sU0FBUyxPQUFPLHNCQUFzQjtBQUM1QyxVQUFJLE1BQU0sVUFBVSxPQUFPLFFBQVEsTUFBTSxVQUFVLE9BQU8sU0FDdEQsTUFBTSxVQUFVLE9BQU8sT0FBTyxNQUFNLFVBQVUsT0FBTyxPQUFRLFNBQVE7QUFBQSxJQUM3RSxDQUFDO0FBQ0QsV0FBTyxpQkFBaUIsU0FBUyxRQUFRLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFFdkQsYUFBUyxLQUFLLFlBQVksTUFBTTtBQUNoQyxRQUFJO0FBQ0EsYUFBTyxVQUFVO0FBQUEsSUFDckIsU0FBUyxLQUFLO0FBQ1YsYUFBTztBQUNQLGNBQVEsS0FBSyx3Q0FBd0MsR0FBRztBQUN4RDtBQUFBLElBQ0o7QUFDQSxTQUFLLFlBQVksTUFBTSxFQUFFLGVBQWUsS0FBSyxDQUFDO0FBQzlDLFNBQUssT0FBTztBQUFBLEVBQ2hCOzs7QUM3Q0EsTUFBTSxVQUFVLGdCQUFnQixLQUFrQjtBQUNsRCxNQUFNLGdCQUFnQixrQkFBYSxDQUFDLEVBQUU7QUFDdEMsTUFBTSxZQUFZO0FBQ2xCLE1BQU0sWUFBWSxHQUFHLFNBQVM7QUFDOUIsTUFBTSxlQUFlLG1EQUFtRCxTQUFTO0FBQ2pGLE1BQU0sb0JBQW9CO0FBRTFCLFdBQVMseUJBQWtEO0FBQ3ZELFVBQU0sUUFBUSxNQUFNLFVBQVUsaUJBQWlCO0FBQy9DLFFBQUksU0FBUyxPQUFPLFVBQVUsWUFBWSxDQUFDLE1BQU0sUUFBUSxLQUFLLEVBQUcsUUFBTztBQUN4RSxXQUFPLENBQUM7QUFBQSxFQUNaO0FBRUEsV0FBUyxrQkFBa0I7QUFDdkIsUUFBSTtBQUNBLFlBQU0sT0FBTyxNQUFNLE9BQU87QUFDMUIsYUFBTyxPQUFPLFNBQVMsWUFBWSxrQkFBa0IsS0FBSyxJQUFJLElBQUksT0FBTztBQUFBLElBQzdFLFFBQVE7QUFDSixhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFFQSxXQUFTLFFBQVEsU0FBaUIsVUFBeUI7QUFDdkQsUUFBSSxDQUFDLFNBQVUsUUFBTztBQUV0QixVQUFNLFdBQVcsU0FBUyxNQUFNLEdBQUcsRUFBRSxJQUFJLE1BQU07QUFDL0MsVUFBTSxXQUFXLFFBQVEsTUFBTSxHQUFHLEVBQUUsSUFBSSxNQUFNO0FBQzlDLGVBQVcsQ0FBQyxPQUFPLElBQUksS0FBSyxTQUFTLFFBQVEsR0FBRztBQUM1QyxVQUFJLFNBQVMsU0FBUyxLQUFLLEVBQUcsUUFBTyxPQUFPLFNBQVMsS0FBSztBQUFBLElBQzlEO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFFQSxXQUFTLGVBQWUsU0FBc0M7QUFDMUQsVUFBTSxVQUFVLFNBQVMsY0FBYyxTQUFTO0FBQ2hELFVBQU0sVUFBVSxTQUFTLGNBQWMsSUFBSTtBQUMzQyxZQUFRLGNBQWMsSUFBSSxRQUFRLE9BQU87QUFDekMsVUFBTSxVQUFVLFNBQVMsY0FBYyxJQUFJO0FBQzNDLGVBQVcsVUFBVSxRQUFRLFNBQVM7QUFDbEMsWUFBTSxPQUFPLFNBQVMsY0FBYyxJQUFJO0FBQ3hDLFdBQUssY0FBYztBQUNuQixjQUFRLFlBQVksSUFBSTtBQUFBLElBQzVCO0FBQ0EsWUFBUSxPQUFPLFNBQVMsT0FBTztBQUMvQixXQUFPO0FBQUEsRUFDWDtBQUVPLE1BQU0sWUFBTixjQUF3QixTQUFTO0FBQUEsSUFDNUIsVUFBeUM7QUFBQSxJQUN6QyxTQUFtQztBQUFBLElBQ25DLGlCQUFpQjtBQUFBLElBQ2pCLGVBQXVDO0FBQUEsSUFDdkMsb0JBQW9CO0FBQUEsSUFDcEIsU0FBUztBQUFBLElBQ1QsU0FBbUM7QUFBQSxJQUNuQyxlQUFzQztBQUFBLElBQ3RDLHlCQUF5QjtBQUFBLElBRWpDLGNBQWM7QUFDVixZQUFNLFVBQVU7QUFDaEIsWUFBTSxFQUFFLE1BQU0sU0FBUyxjQUFjO0FBQUEsUUFDakM7QUFBQSxRQUNBLE9BQU8sWUFBWSxrQkFBa0IsMkhBQTJIO0FBQUEsUUFDaEssU0FBUztBQUFBLFFBQ1QsYUFBYSxDQUFDO0FBQUEsVUFDVixLQUFLO0FBQUEsVUFDTCxPQUFPLFlBQVksb0JBQW9CLDRHQUE0RztBQUFBLFVBQ25KLFNBQVM7QUFBQSxRQUNiLENBQUM7QUFBQSxNQUNMLEVBQUUsQ0FBQztBQUFBLElBQ1A7QUFBQSxJQUVBLFlBQVk7QUFDUixhQUFPLGdCQUFnQjtBQUFBLElBQzNCO0FBQUEsSUFFQSxrQkFBa0I7QUFDZCxVQUFJLENBQUMsS0FBSyxVQUFVLEVBQUc7QUFDdkIsV0FBSyxvQkFBb0I7QUFFekIsYUFBTyxXQUFXLFFBQVEsd0JBQXdCLGNBQWMsTUFBTTtBQUNsRSxjQUFNLE9BQU8sU0FBUyxjQUFjLFlBQVk7QUFDaEQsWUFBSSxDQUFDLFFBQVEsS0FBSyxjQUFjLHdCQUF3QixFQUFHO0FBRTNELGNBQU0sU0FBUyxTQUFTLGNBQWMsUUFBUTtBQUM5QyxlQUFPLE9BQU87QUFDZCxlQUFPLFlBQVk7QUFDbkIsZUFBTyxjQUFjO0FBQ3JCLGVBQU8saUJBQWlCLFNBQVMsTUFBTSxLQUFLLEtBQUssVUFBVSxNQUFNLENBQUM7QUFDbEUsYUFBSyxZQUFZLE1BQU07QUFBQSxNQUMzQixDQUFDO0FBQUEsSUFDTDtBQUFBLElBRUEsSUFBSSxFQUFFLFNBQVMsTUFBTSxHQUFtQjtBQUNwQyxVQUFJLEtBQUssVUFBVSxDQUFDLEtBQUssVUFBVSxFQUFHO0FBQ3RDLFdBQUssU0FBUztBQUNkLFdBQUssU0FBUztBQUVkLFlBQU0saUJBQWlCLENBQUMsS0FBSztBQUU3QixZQUFNLFFBQVEsTUFBTTtBQUNoQixZQUFJLENBQUMsS0FBSyxnQkFBZ0IsRUFBRztBQUM3QixZQUFJLEtBQUssT0FBUSxNQUFLLFdBQVc7QUFBQSxpQkFDeEIsZUFBZ0IsTUFBSyxLQUFLLFdBQVc7QUFBQSxNQUNsRDtBQUNBLFVBQUksU0FBUyxlQUFlLFdBQVksT0FBTTtBQUFBLFdBQ3pDO0FBQ0QsYUFBSyxlQUFlLElBQUksZ0JBQWdCO0FBQ3hDLGVBQU8saUJBQWlCLFFBQVEsT0FBTyxFQUFFLE1BQU0sTUFBTSxRQUFRLEtBQUssYUFBYSxPQUFPLENBQUM7QUFBQSxNQUMzRjtBQUFBLElBQ0o7QUFBQSxJQUVBLFdBQVc7QUFDUCxXQUFLLGNBQWMsTUFBTTtBQUN6QixXQUFLLFNBQVM7QUFDZCxXQUFLLGFBQWE7QUFBQSxJQUN0QjtBQUFBLElBRUEsaUJBQWlCLEtBQWEsT0FBZ0I7QUFDMUMsVUFBSSxRQUFRLFNBQVU7QUFDdEIsV0FBSyxTQUFTO0FBQ2QsVUFBSSxNQUFPLE1BQUssV0FBVztBQUFBLFVBQ3RCLE1BQUssYUFBYTtBQUFBLElBQzNCO0FBQUEsSUFFUSxrQkFBa0I7QUFDdEIsYUFBTyxLQUFLLFVBQVUsQ0FBQyxLQUFLLGtCQUFrQixRQUFRLGVBQWUsZ0JBQWdCLENBQUM7QUFBQSxJQUMxRjtBQUFBLElBRVEsYUFBYTtBQUNqQixVQUFJLENBQUMsS0FBSyxVQUFVLENBQUMsS0FBSyxnQkFBZ0IsS0FBSyxLQUFLLFVBQVUsS0FBSyx1QkFBd0I7QUFFM0YsWUFBTSxXQUFXO0FBQ2pCLFdBQUsseUJBQXlCO0FBQzlCLGFBQU8sV0FBVyxRQUFRLHdCQUF3QixVQUFVLE1BQU07QUFDOUQsYUFBSyx5QkFBeUI7QUFDOUIsY0FBTSxTQUFTLFNBQVMsY0FBMkIsUUFBUTtBQUMzRCxjQUFNLFNBQVMsUUFBUTtBQUN2QixZQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxLQUFLLFVBQVUsQ0FBQyxLQUFLLGdCQUFnQixFQUFHO0FBRW5FLGNBQU0sU0FBUyxTQUFTLGNBQWMsUUFBUTtBQUM5QyxlQUFPLE9BQU87QUFDZCxlQUFPLFlBQVk7QUFDbkIsZUFBTyxRQUFRLFVBQVU7QUFDekIsZUFBTyxhQUFhLGNBQWMscUNBQXFDO0FBQ3ZFLGVBQU8sWUFBWTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBS25CLGVBQU8saUJBQWlCLFNBQVMsV0FBUztBQUN0QyxnQkFBTSxnQkFBZ0I7QUFDdEIsZUFBSyxLQUFLLFVBQVUsTUFBTTtBQUFBLFFBQzlCLENBQUM7QUFFRCxlQUFPLE1BQU0sTUFBTTtBQUNuQixhQUFLLFNBQVM7QUFDZCxjQUFNLFdBQVcsTUFBTTtBQUNuQixpQkFBTyxNQUFNLE9BQU8sR0FBRyxPQUFPLFVBQVU7QUFDeEMsaUJBQU8sTUFBTSxNQUFNLEdBQUcsT0FBTyxZQUFZLE9BQU8sZUFBZSxDQUFDO0FBQ2hFLGlCQUFPLE1BQU0sU0FBUyxHQUFHLE9BQU8sZUFBZSxHQUFFO0FBQUEsUUFDckQ7QUFDQSxpQkFBUztBQUNULGFBQUssZUFBZSxJQUFJLGVBQWUsUUFBUTtBQUMvQyxhQUFLLGFBQWEsUUFBUSxNQUFNO0FBQ2hDLGFBQUssYUFBYSxRQUFRLE1BQU07QUFBQSxNQUNwQyxDQUFDO0FBQUEsSUFDTDtBQUFBLElBRVEsZUFBZTtBQUNuQixXQUFLLGNBQWMsV0FBVztBQUM5QixXQUFLLGVBQWU7QUFDcEIsV0FBSyxRQUFRLE9BQU87QUFDcEIsV0FBSyxTQUFTO0FBQUEsSUFDbEI7QUFBQSxJQUVRLG1CQUFtQixRQUFpQztBQUN4RCxpQkFBVyxRQUFRLFNBQVMsaUJBQWlCLFlBQVksR0FBRztBQUN4RCxjQUFNLFVBQVUsT0FBTyxTQUFTLE1BQU07QUFDdEMsY0FBTSxXQUFXLEtBQUssY0FBZ0MsZUFBZSxTQUFTLElBQUk7QUFDbEYsY0FBTSxTQUFTLEtBQUssY0FBZ0MsZUFBZSxTQUFTLElBQUk7QUFDaEYsYUFBSyxVQUFVLE9BQU8sV0FBVyxPQUFPO0FBQ3hDLFlBQUksU0FBVSxVQUFTLFVBQVU7QUFDakMsWUFBSSxRQUFRO0FBQ1IsaUJBQU8sVUFBVSxPQUFPLFNBQVMsTUFBTTtBQUN2QyxpQkFBTyxXQUFXLENBQUM7QUFBQSxRQUN2QjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFFUSxrQkFBa0IsS0FBMEMsT0FBZ0I7QUFDaEYsWUFBTSxTQUFTLE9BQU87QUFDdEIsVUFBSSxDQUFDLE9BQVE7QUFFYixVQUFJO0FBRUEsY0FBTSxRQUFRLEVBQUUsR0FBRyx1QkFBdUIsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNO0FBQzFELGNBQU0sVUFBVSxPQUFPLGlCQUFpQjtBQUN4QyxlQUFPLFdBQVc7QUFDbEIsWUFBSSxRQUFRLFVBQVcsTUFBSyxpQkFBaUIsVUFBVSxLQUFLO0FBQUEsaUJBQ25ELENBQUMsTUFBTyxNQUFLLFNBQVM7QUFDL0IsYUFBSyxtQkFBbUIsS0FBSztBQUFBLE1BQ2pDLFNBQVMsS0FBSztBQUNWLGdCQUFRLEtBQUssdURBQXVELEdBQUc7QUFBQSxNQUMzRTtBQUFBLElBQ0o7QUFBQSxJQUVRLEtBQUssTUFBOEIsU0FBbUMsTUFBTTtBQUNoRixVQUFJLENBQUMsS0FBSyxVQUFVLEVBQUc7QUFDdkIsVUFBSSxTQUFTLFNBQVUsTUFBSyxTQUFTO0FBQ3JDLFVBQUksS0FBSyxTQUFTO0FBQ2QsWUFBSSxTQUFTLFNBQVUsTUFBSyxVQUFVO0FBQ3RDO0FBQUEsTUFDSjtBQUNBLFdBQUssVUFBVTtBQUVmLFlBQU0sV0FBVyxnQkFBZ0I7QUFDakMsWUFBTSxVQUFVLFNBQVMsY0FBYyxLQUFLO0FBQzVDLGNBQVEsWUFBWTtBQUNwQixZQUFNLFFBQVEsU0FBUyxjQUFjLElBQUk7QUFDekMsWUFBTSxLQUFLO0FBQ1gsWUFBTSxjQUFjO0FBQ3BCLFlBQU0sUUFBUSxTQUFTLGNBQWMsS0FBSztBQUMxQyxZQUFNLFlBQVk7QUFDbEIsWUFBTSxjQUFjLFlBQVksUUFBUSxlQUFlLFFBQVEsSUFDekQsa0JBQWEsT0FBTyxhQUFXLFFBQVEsUUFBUSxTQUFTLFFBQVEsQ0FBQyxFQUFFLFNBQ25FO0FBQ04sWUFBTSxPQUFPLEdBQUcsa0JBQWEsTUFBTSxHQUFHLFdBQVcsRUFBRSxJQUFJLGNBQWMsQ0FBQztBQUN0RSxZQUFNLFVBQVUsa0JBQWEsTUFBTSxXQUFXO0FBQzlDLFVBQUksUUFBUSxRQUFRO0FBQ2hCLGNBQU0sVUFBVSxTQUFTLGNBQWMsU0FBUztBQUNoRCxjQUFNLFVBQVUsU0FBUyxjQUFjLFNBQVM7QUFDaEQsZ0JBQVEsY0FBYztBQUN0QixnQkFBUSxPQUFPLFNBQVMsR0FBRyxRQUFRLElBQUksY0FBYyxDQUFDO0FBQ3RELGNBQU0sWUFBWSxPQUFPO0FBQUEsTUFDN0I7QUFFQSxZQUFNLFNBQVMsU0FBUyxjQUFjLFFBQVE7QUFDOUMsWUFBTSxVQUFVLFNBQVMsY0FBYyxLQUFLO0FBQzVDLGNBQVEsWUFBWTtBQUNwQixZQUFNLFNBQVMsU0FBUyxjQUFjLE9BQU87QUFDN0MsWUFBTSxnQkFBZ0IsU0FBUyxjQUFjLE9BQU87QUFDcEQsb0JBQWMsT0FBTztBQUNyQixhQUFPLE9BQU8sZUFBZSxrQkFBa0I7QUFDL0MsWUFBTSxlQUFlLFNBQVMsY0FBYyxPQUFPO0FBQ25ELFlBQU0sWUFBWSxTQUFTLGNBQWMsT0FBTztBQUNoRCxnQkFBVSxPQUFPO0FBQ2pCLGdCQUFVLFVBQVUsS0FBSztBQUN6QixtQkFBYSxRQUFRO0FBQ3JCLG1CQUFhLE9BQU8sV0FBVyxrQkFBa0I7QUFDakQsb0JBQWMsaUJBQWlCLFVBQVUsTUFBTSxVQUFVLFdBQVcsY0FBYyxPQUFPO0FBQ3pGLGNBQVEsT0FBTyxRQUFRLFlBQVk7QUFDbkMsWUFBTSxjQUFjLFNBQVMsY0FBYyxRQUFRO0FBQ25ELGtCQUFZLE9BQU87QUFDbkIsa0JBQVksWUFBWTtBQUN4QixrQkFBWSxjQUFjO0FBQzFCLGFBQU8sWUFBWSxXQUFXO0FBQzlCLGNBQVEsT0FBTyxPQUFPLE9BQU8sTUFBTTtBQUVuQyx5QkFBbUI7QUFBQSxRQUNmO0FBQUEsUUFDQTtBQUFBLFFBQ0EsWUFBWSxNQUFNLEtBQUssWUFBWSxZQUFhLENBQUMsS0FBSyxVQUFVLEtBQUssZ0JBQWdCO0FBQUEsUUFDckYsUUFBUSxNQUFNO0FBQ1YsZUFBSyxpQkFBaUI7QUFDdEIsZUFBSyxhQUFhO0FBQ2xCLGNBQUksS0FBSyxPQUFRLFFBQU8sUUFBUSxPQUFPO0FBQ3ZDLGNBQUk7QUFDQSxnQkFBSSxRQUFRLGVBQWUsZ0JBQWdCLENBQUMsRUFBRyxPQUFNLFNBQVMsYUFBYTtBQUFBLFVBQy9FLFNBQVMsS0FBSztBQUNWLG9CQUFRLEtBQUssdURBQXVELEdBQUc7QUFBQSxVQUMzRTtBQUFBLFFBQ0o7QUFBQSxRQUNBLFNBQVMsTUFBTTtBQUNYLGVBQUssVUFBVTtBQUNmLGNBQUksY0FBYyxRQUFTLE1BQUssa0JBQWtCLFdBQVcsS0FBSztBQUFBLG1CQUN6RCxLQUFLLFVBQVUsVUFBVSxZQUFZLEtBQUssUUFBUTtBQUN2RCxpQkFBSyxrQkFBa0IsV0FBVyxVQUFVLE9BQU87QUFBQSxVQUN2RDtBQUNBLGVBQUssUUFBUSxNQUFNLEVBQUUsZUFBZSxLQUFLLENBQUM7QUFDMUMsZUFBSyxTQUFTO0FBQUEsUUFDbEI7QUFBQSxNQUNKLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjs7O0FDL1JBLE1BQU0sZUFBZTtBQUNyQixNQUFNLGdCQUFnQjtBQUN0QixNQUFNLGdCQUFnQjtBQUVmLE1BQU0sWUFBTixjQUF3QixTQUFTO0FBQUEsSUFDNUIsWUFBb0M7QUFBQSxJQUU1QyxjQUFjO0FBQ1YsWUFBTSxVQUFVO0FBQ2hCLFlBQU0sRUFBRSxNQUFNLFNBQVMsY0FBYztBQUFBLFFBQ2pDO0FBQUEsUUFDQSxPQUFPLFlBQVksK0JBQStCLDZHQUE2RztBQUFBLFFBQy9KLFNBQVM7QUFBQSxNQUNiLEVBQUUsQ0FBQztBQUFBLElBQ1A7QUFBQSxJQUVBLFlBQVk7QUFDUixhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsTUFBTTtBQUNGLFVBQUksS0FBSyxPQUFRO0FBRWpCLFlBQU0sV0FBVyxnQkFBZ0IsZ0JBQWdCLGdCQUFnQixNQUMzRCxHQUFHLFlBQVksS0FBSyxhQUFhLEtBQUssYUFBYSxLQUNuRDtBQUNOLFlBQU0sVUFBVSxDQUFDLFVBQXNCO0FBQ25DLGNBQU0sU0FBUyxNQUFNO0FBQ3JCLFlBQUksRUFBRSxrQkFBa0IsU0FBVSxRQUFPO0FBRXpDLGNBQU0sVUFBVSxPQUFPLFFBQXFCLFFBQVE7QUFDcEQsWUFBSSxDQUFDLFdBQVcsUUFBUSxRQUFRLG9DQUFvQyxFQUFHLFFBQU87QUFFOUUsY0FBTSxPQUFPLFFBQVEsUUFBUSxZQUFZLElBQUksZUFDdkMsUUFBUSxRQUFRLGFBQWEsSUFBSSx3QkFBd0I7QUFDL0QsY0FBTSxTQUFTLE9BQU8sUUFBMkIsU0FBUztBQUMxRCxZQUFJLFFBQVEsV0FBVyxTQUFTLFdBQzNCLE9BQU8sYUFBYSxRQUFTLFNBQVMsZ0JBQWdCLE9BQU8sYUFBYSxNQUFPO0FBQ2xGLGlCQUFPLEVBQUUsUUFBUSxNQUFNLE9BQU8sS0FBSztBQUFBLFFBQ3ZDO0FBQ0EsWUFBSSxVQUFVLFdBQVcsV0FBVyxRQUFRLFNBQVMsTUFBTSxFQUFHLFFBQU87QUFFckUsY0FBTSxZQUFZLFFBQVEsYUFBYSxVQUFVO0FBQ2pELGNBQU0sT0FBTyxhQUFhLE9BQU8sV0FBVyxRQUFRLFFBQVEsSUFBSTtBQUNoRSxjQUFNLGNBQWMsSUFBSSxJQUFJLE1BQU0sU0FBUyxJQUFJO0FBQy9DLFlBQUksWUFBWSxXQUFXLFNBQVMsVUFBVSxZQUFZLGFBQWEsS0FBTSxRQUFPO0FBQ3BGLGVBQU8sRUFBRSxRQUFRLE1BQU0sTUFBTSxZQUFZLEtBQUs7QUFBQSxNQUNsRDtBQUVBLFdBQUssWUFBWSxJQUFJLGdCQUFnQjtBQUNyQyxZQUFNLFVBQVUsRUFBRSxTQUFTLE1BQU0sUUFBUSxLQUFLLFVBQVUsT0FBTztBQUMvRCxZQUFNLGVBQWUsQ0FBQyxVQUFzQjtBQUN4QyxjQUFNLE9BQU8sUUFBUSxLQUFLO0FBQzFCLFlBQUksQ0FBQyxLQUFNO0FBR1gsY0FBTSx5QkFBeUI7QUFDL0IsWUFBSSxLQUFLLE9BQVE7QUFDakIsY0FBTSxlQUFlO0FBQ3JCLGVBQU8sS0FBSyxLQUFLLE1BQU0sVUFBVSxVQUFVO0FBQUEsTUFDL0M7QUFFQSxhQUFPLGlCQUFpQixTQUFTLFdBQVM7QUFDdEMsWUFBSSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxTQUFVLGNBQWEsS0FBSztBQUFBLE1BQ2xGLEdBQUcsT0FBTztBQUNWLGFBQU8saUJBQWlCLFlBQVksV0FBUztBQUN6QyxZQUFJLE1BQU0sV0FBVyxFQUFHLGNBQWEsS0FBSztBQUFBLE1BQzlDLEdBQUcsT0FBTztBQUNWLGFBQU8saUJBQWlCLGFBQWEsV0FBUztBQUMxQyxZQUFJLE1BQU0sV0FBVyxLQUFLLFFBQVEsS0FBSyxHQUFHLFdBQVcsS0FBTSxPQUFNLGVBQWU7QUFBQSxNQUNwRixHQUFHLE9BQU87QUFDVixXQUFLLFNBQVM7QUFBQSxJQUNsQjtBQUFBLElBRUEsV0FBVztBQUNQLFdBQUssV0FBVyxNQUFNO0FBQ3RCLFdBQUssU0FBUztBQUFBLElBQ2xCO0FBQUEsRUFDSjs7O0FDckVBLHlCQUF1QjtBQUV2QixXQUFTLFlBQVk7QUFDakIsUUFBSSxTQUFTLGVBQWUsV0FBVztBQUNuQyxlQUFTLGlCQUFpQixvQkFBb0IsV0FBVyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQ3ZFO0FBQUEsSUFDSjtBQUVBLFVBQU0sRUFBRSxHQUFBQyxHQUFFLElBQUk7QUFFZCxRQUFJLENBQUNBLElBQUc7QUFDSixVQUFJLFNBQVMsZUFBZSxZQUFZO0FBQ3BDLGVBQU8saUJBQWlCLFFBQVEsV0FBVyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQ3pEO0FBQUEsTUFDSjtBQUNBLGVBQVMsZUFBZSx3QkFBd0IsR0FBRyxPQUFPO0FBQzFELGNBQVEsSUFBSSwwQ0FBMEM7QUFDdEQ7QUFBQSxJQUNKO0FBRUEsWUFBUSxJQUFJLGdEQUFnRDtBQUU1RCxhQUFTQSxFQUFDO0FBQ1YsaUJBQWE7QUFFYixVQUFNLGlCQUFpQixJQUFJLGNBQWM7QUFDekMsVUFBTSxZQUFZLElBQUksVUFBVTtBQUNoQyxVQUFNLGFBQWE7QUFBQSxNQUNmO0FBQUEsTUFDQSxJQUFJLGFBQWE7QUFBQSxNQUNqQixJQUFJLFlBQVk7QUFBQSxNQUNoQixJQUFJLGVBQWU7QUFBQSxNQUNuQixJQUFJLGVBQWU7QUFBQSxNQUNuQixJQUFJLGdCQUFnQjtBQUFBLE1BQ3BCLElBQUksZUFBZTtBQUFBLE1BQ25CO0FBQUEsTUFDQSxJQUFJLFVBQVU7QUFBQSxJQUNsQjtBQUVBLGVBQVcsTUFBTTtBQUNiLFlBQU0sWUFBWSxNQUFNO0FBQ3BCLGNBQU0sRUFBRSxpQkFBaUIsSUFBSTtBQUM3QixZQUFJLENBQUMsaUJBQWtCO0FBRXZCLHlCQUFpQixjQUFjO0FBQUEsVUFDM0IsS0FBSztBQUFBLFVBQ0wsTUFBTTtBQUFBLFFBQ1YsQ0FBQztBQUNELG1CQUFXLFFBQVEsWUFBVTtBQUN6QiwyQkFBaUIsZUFBZSxNQUFNO0FBQUEsUUFDMUMsQ0FBQztBQUNELHlCQUFpQixXQUFXO0FBQzVCLHlCQUFpQixXQUFXO0FBQzVCLHVCQUFlLGdCQUFnQjtBQUMvQiwrQkFBdUI7QUFDdkIsa0JBQVUsZ0JBQWdCO0FBQzFCLHFCQUFhO0FBQUEsTUFDakI7QUFFQSxVQUFJLE9BQU8sa0JBQWtCO0FBQ3pCLGtCQUFVO0FBQUEsTUFDZCxPQUFPO0FBQ0gsUUFBQUEsR0FBRSxRQUFRLEVBQUUsSUFBSSxvQkFBb0IsU0FBUztBQUFBLE1BQ2pEO0FBQUEsSUFDSixHQUFHLENBQUM7QUFBQSxFQUNSO0FBRUEsWUFBVTsiLAogICJuYW1lcyI6IFsibWF0Y2hlcyIsICJwbGF5ZXIiLCAiZXJyIiwgIiQiXQp9Cg==
