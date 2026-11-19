// ==UserScript==
// @name           HH J.A.R.V.I.S. (Dev)
// @version        0.7.7
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
    const version = `v${"0.7.7"}${true ? " Dev" : ""}`;
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
      this.titleSizes?.disconnect();
      this.listeners?.abort();
      this.stopJump?.();
      this.switchScroll?.stop();
      this.startupPending = false;
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
  var CHANGELOG_default = [{ version: "0.7.7", changes: ["Apply Don’t show again when the changelog closes and update the HH++ setting immediately.", "Give the silent update icon its own tooltip.", "Keep long contest titles in the card header alongside the rank controls.", "Identify the Dev build beside its version in settings."] }, { version: "0.7.6", changes: ["Choose Top or My rank on any active contest. Jarvis remembers each contest’s choice when switching and applies the same position and scroll rules to finished contests.", "Keep game scroll animations from restarting while you scroll by hand during a contest switch.", "See a small arc-reactor icon beside HH++ when a silent update notice is available."] }, { version: "0.7.5", changes: ["Keep the homepage responsive after closing the changelog and choose Silent changelog from the popup.", "Stop automatic sidebar scrolling on contest switches by default and use Top or My rank whenever you switch.", "Bring the selected card into view when you use a contest shortcut."] }, { version: "0.7.4", changes: ["See your rank in each active contest beside the close button and switch leaderboards without moving the contest list."] }, { version: "0.7.3", changes: ["See automatic changelogs only when loading the homepage after an update.", "Enable Silent changelog to get a New button beside HH++ and open the notes when you’re ready.", "Keep the contest list and each leaderboard in place when switching contests with Stop scrolling on contest switches."] }, { version: "0.7.2", changes: ["Open the bottom active contest at your rank by default. Choose CbC, CCC, or LC to prefer that event when available.", "Turn off automatic update notices with Don’t show again in the changelog popup. View changelog stays available in settings."] }, { version: "0.7.1", changes: ["Keep the changelog centered when the game window is resized.", "Clean up saved player names, explain unknown names on hover, and give Remove buttons more room."] }, { version: "0.7.0", changes: ["See what changed in Jarvis the first time a new version runs.", "Open View changelog from HH++ settings at any time, even with automatic notices turned off.", "Expand Earlier versions to read past updates."] }, { version: "0.6.7", changes: ["Make marking one action per player, backfill names for older marks, use the bracket-based promotion target, and simplify the selected contest buttons and version badge."] }, { version: "0.6.6", changes: ["Add setting help in HH++, improve mark contrast and management, and add automatic contest defaults.", "Rename the separately installed testing userscript to Dev."] }, { version: "0.6.5", changes: ["Move the userscript source into TypeScript modules and add separate stable and testing builds."] }, { version: "0.6.4", changes: ["Prevent pinned contest startup scrolling, keep native startup without a pin, and clear finished pins"] }, { version: "0.6.3", changes: ["Stop both contest startup scrolls, isolate the selected leaderboard, and restore pinned contests at Top or My rank"] }, { version: "0.6.2", changes: ["Pin contests on their cards, hide the startup scroll, and use right-click marking with isolated settings scrolling"] }, { version: "0.6.1", changes: ["Read native Manga RPG contest titles and recognize active cards when contest data is unavailable"] }, { version: "0.6.0", changes: ["Add a contest start preference, continuous marking, and compact settings with a version label"] }, { version: "0.5.0", changes: ["Add league and contest player marking with custom colors, compact settings, and limit Top 20 to promotable leagues"] }, { version: "0.4.2", changes: ["Fix module startup, league controls, and raid exports; add the Top 20 league target"] }, { version: "0.4.1", changes: ["Fix Love Raids shadows replacement"] }, { version: "0.4.0", changes: ["Add ActivityParser module"] }, { version: "0.3.1", changes: ["Add harem link inside love raid cards"] }, { version: "0.3.0", changes: ["Add LoveRaidsAddon and LoveRaidsParser modules"] }, { version: "0.2.0", changes: ["Add RemovePassLock module"] }, { version: "0.1.3", changes: ["Better code practices"] }, { version: "0.1.2", changes: ["Polishing and update links"] }, { version: "0.1.1", changes: ["Add FriendAndFoes module"] }, { version: "0.0.1", changes: ["Initial release"] }];

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
        this.syncNoticeSettings();
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
    syncNoticeSettings() {
      const config = window.hhPlusPlusConfig?.config;
      if (!config) return;
      for (const card of document.querySelectorAll(settingsCard)) {
        const enabled = config[configKey];
        const checkbox = card.querySelector(`input[name="${configKey}"]`);
        const silent = card.querySelector(`input[name="${silentKey}"]`);
        card.classList.toggle("enabled", enabled);
        if (checkbox) checkbox.checked = enabled;
        if (silent) {
          silent.checked = config[silentKey];
          silent.disabled = !enabled;
        }
      }
    }
    saveNoticeSetting(key, value) {
      const config = window.hhPlusPlusConfig;
      if (!config) return;
      let previous = config.config[key];
      try {
        config.loadConfig();
        previous = config.config[key];
        if (config.$configPane && config.updateConfig) {
          config.updateConfig(key, value);
        } else {
          config.config[key] = value;
          config.saveConfig();
          if (key === silentKey) this.updateSubSetting("silent", value);
          else if (!value) this.tearDown();
        }
      } catch (err) {
        config.config[key] = previous;
        console.warn("Jarvis could not save the update notice preference:", err);
        return;
      }
      this.syncNoticeSettings();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzSGVscC50cyIsICJzcmMvc2V0dGluZ3MuY3NzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvSEhNb2R1bGUudHMiLCAic3JjL3N0b3JhZ2UudHMiLCAic3JjL21vZHVsZXMvcGxheWVycy9tYXJrTWFuYWdlci50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0ZyaWVuZEFuZEZvZXMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzLnRzIiwgInNyYy9tb2R1bGVzL2NvbnRlc3RzL2NvbnRlc3RTaG9ydGN1dHMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvQ29udGVzdFN0YXJ0LnRzIiwgInNyYy9tb2R1bGVzL3BsYXllcnMvTGVhZ3VlVG9wMjAudHMiLCAic3JjL21vZHVsZXMvcHJvZ3Jlc3Npb24vUmVtb3ZlUGFzc0xvY2sudHMiLCAic3JjL21vZHVsZXMvbG92ZS1yYWlkcy9nYW1lRGF0YS50cyIsICJzcmMvbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc0FkZG9uLnRzIiwgInNyYy9tb2R1bGVzL2xvdmUtcmFpZHMvTG92ZVJhaWRzUGFyc2VyLnRzIiwgInNyYy9tb2R1bGVzL2FjdGl2aXRpZXMvQWN0aXZpdHlQYXJzZXIudHMiLCAiQ0hBTkdFTE9HLm1kIiwgInNyYy9tb2R1bGVzL3VwZGF0ZXMvY2hhbmdlbG9nUG9wdXAudHMiLCAic3JjL21vZHVsZXMvdXBkYXRlcy9DaGFuZ2Vsb2cudHMiLCAic3JjL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgbGV0ICQ6IEpRdWVyeVN0YXRpYztcbmV4cG9ydCBsZXQgY3VycmVudFBhZ2U6IHN0cmluZztcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRHYW1lKGpRdWVyeTogSlF1ZXJ5U3RhdGljKSB7XG4gICAgJCA9IGpRdWVyeTtcbiAgICBjdXJyZW50UGFnZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gc2V0dGluZ0hlbHAobGFiZWw6IHN0cmluZywgZGVzY3JpcHRpb246IHN0cmluZykge1xuICAgIGNvbnN0IGVzY2FwZSA9ICh0ZXh0OiBzdHJpbmcpID0+IHRleHQucmVwbGFjZUFsbCgnJicsICcmYW1wOycpLnJlcGxhY2VBbGwoJ1wiJywgJyZxdW90OycpXG4gICAgICAgIC5yZXBsYWNlQWxsKCc8JywgJyZsdDsnKS5yZXBsYWNlQWxsKCc+JywgJyZndDsnKTtcbiAgICByZXR1cm4gZXNjYXBlKGxhYmVsKSArICcgPHNwYW4gY2xhc3M9XCJpcm9ubWFuLXNldHRpbmctaGVscFwiIHJvbGU9XCJidXR0b25cIiB0YWJpbmRleD1cIjBcIiBhcmlhLWxhYmVsPVwiQWJvdXQgJyArXG4gICAgICAgIGVzY2FwZShsYWJlbCkgKyAnXCIgZGF0YS1zZXR0aW5nLWhlbHA9XCInICsgZXNjYXBlKGRlc2NyaXB0aW9uKSArICdcIj4/PC9zcGFuPic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3VudFNldHRpbmdzSGVscChwYW5lbDogSFRNTEVsZW1lbnQsIHRvb2x0aXBJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgdG9vbHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRvb2x0aXAuaWQgPSB0b29sdGlwSWQ7XG4gICAgdG9vbHRpcC5jbGFzc05hbWUgPSAnaXJvbm1hbi1zZXR0aW5nLXRvb2x0aXAnO1xuICAgIHRvb2x0aXAuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3Rvb2x0aXAnKTtcbiAgICBjb25zdCBwb3BvdmVyID0gdHlwZW9mIHRvb2x0aXAuc2hvd1BvcG92ZXIgPT09ICdmdW5jdGlvbic7XG4gICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuc2V0QXR0cmlidXRlKCdwb3BvdmVyJywgJ21hbnVhbCcpO1xuICAgIGVsc2UgdG9vbHRpcC5oaWRkZW4gPSB0cnVlO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodG9vbHRpcCk7XG5cbiAgICBsZXQgYW5jaG9yOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IGdldEhlbHAgPSAodGFyZ2V0OiBFdmVudFRhcmdldCB8IG51bGwpID0+XG4gICAgICAgIHRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgPyB0YXJnZXQuY2xvc2VzdDxIVE1MRWxlbWVudD4oJ1tkYXRhLXNldHRpbmctaGVscF0nKSA6IG51bGw7XG4gICAgY29uc3QgY2xvc2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICghYW5jaG9yKSByZXR1cm47XG4gICAgICAgIGFuY2hvci5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKTtcbiAgICAgICAgYW5jaG9yID0gbnVsbDtcbiAgICAgICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuaGlkZVBvcG92ZXIoKTtcbiAgICAgICAgZWxzZSB0b29sdGlwLmhpZGRlbiA9IHRydWU7XG4gICAgfTtcbiAgICBjb25zdCBzaG93ID0gKGhlbHA6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgIGlmIChhbmNob3IgPT09IGhlbHApIHJldHVybjtcbiAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgYW5jaG9yID0gaGVscDtcbiAgICAgICAgaGVscC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCB0b29sdGlwSWQpO1xuICAgICAgICB0b29sdGlwLnRleHRDb250ZW50ID0gaGVscC5kYXRhc2V0LnNldHRpbmdIZWxwID8/ICcnO1xuICAgICAgICBpZiAocG9wb3ZlcikgdG9vbHRpcC5zaG93UG9wb3ZlcigpO1xuICAgICAgICBlbHNlIHRvb2x0aXAuaGlkZGVuID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gaGVscC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgeyBvZmZzZXRXaWR0aCwgb2Zmc2V0SGVpZ2h0IH0gPSB0b29sdGlwO1xuICAgICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSBNYXRoLm1heCg4LCBNYXRoLm1pbihib3VuZHMubGVmdCwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIC0gb2Zmc2V0V2lkdGggLSA4KSkgKyAncHgnO1xuICAgICAgICBjb25zdCBiZWxvdyA9IGJvdW5kcy5ib3R0b20gKyA2O1xuICAgICAgICB0b29sdGlwLnN0eWxlLnRvcCA9IChiZWxvdyArIG9mZnNldEhlaWdodCA8PSB3aW5kb3cuaW5uZXJIZWlnaHQgLSA4XG4gICAgICAgICAgICA/IGJlbG93IDogTWF0aC5tYXgoOCwgYm91bmRzLnRvcCAtIG9mZnNldEhlaWdodCAtIDYpKSArICdweCc7XG4gICAgfTtcblxuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJvdmVyJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCAmJiBldmVudC5wb2ludGVyVHlwZSAhPT0gJ3RvdWNoJykgc2hvdyhoZWxwKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyb3V0JywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCA9PT0gYW5jaG9yICYmIGhlbHAgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gaGVscCkgY2xvc2UoKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1c2luJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCkgc2hvdyhoZWxwKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGdldEhlbHAoZXZlbnQudGFyZ2V0KSA9PT0gYW5jaG9yKSBjbG9zZSgpO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoIWhlbHApIHJldHVybjtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgJiYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJyB8fCBldmVudC5rZXkgPT09ICcgJykpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHNob3coaGVscCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYW5jaG9yICYmIGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZ2V0SGVscChldmVudC50YXJnZXQpICE9PSBhbmNob3IpIGNsb3NlKCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgY2xvc2UsIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbn1cbiIsICIuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5wYW5lbC1jb250ZW50cyB7XG4gICAgYWxpZ24tY29udGVudDogc3RhcnQ7XG4gICAgYWxpZ24taXRlbXM6IHN0YXJ0O1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgb3ZlcnNjcm9sbC1iZWhhdmlvcjogY29udGFpbjtcbiAgICBzY3JvbGxiYXItd2lkdGg6IHRoaW47XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbDpoYXMoPiAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdLnNob3duKSB7XG4gICAgb3ZlcmZsb3c6IGNsaXA7XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZy5oYXMtc3Vic2V0dGluZ3Mge1xuICAgIGdyaWQtcm93LWVuZDogYXV0bztcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1wYWNrZWQtc2V0dGluZ3Mge1xuICAgIGdyaWQtYXV0by1mbG93OiByb3cgZGVuc2U7XG4gICAgZ3JpZC1hdXRvLXJvd3M6IDFweDtcbiAgICByb3ctZ2FwOiAwO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuamFydmlzLXBhY2tlZC1zZXR0aW5ncyAuY29uZmlnLXNldHRpbmcge1xuICAgIGdyaWQtcm93LWVuZDogc3BhbiB2YXIoLS1qYXJ2aXMtc2V0dGluZy1yb3dzLCAxKTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC50YWJzIGg0W3JlbD1cIkpBUlZJU1wiXSB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLnRhYnMgaDRbcmVsPVwiSkFSVklTXCJdLnNlbGVjdGVkOjphZnRlciB7XG4gICAgY29udGVudDogdmFyKC0tamFydmlzLXZlcnNpb24pO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBpbnNldC1ibG9jay1zdGFydDogMDtcbiAgICBpbnNldC1pbmxpbmUtZW5kOiAuMTVyZW07XG4gICAgZm9udC1zaXplOiAuNjI1cmVtO1xuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4uaXJvbm1hbi1zZXR0aW5nLWhlbHAge1xuICAgIGRpc3BsYXk6IGlubGluZS1ncmlkO1xuICAgIHBsYWNlLWl0ZW1zOiBjZW50ZXI7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBpbmxpbmUtc2l6ZTogMS4yNWVtO1xuICAgIGJsb2NrLXNpemU6IDEuMjVlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgIGZvbnQtc2l6ZTogLjhlbTtcbiAgICBsaW5lLWhlaWdodDogMTtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogLjA4ZW07XG4gICAgY3Vyc29yOiBoZWxwO1xufVxuLmlyb25tYW4tc2V0dGluZy1oZWxwOmhvdmVyLFxuLmlyb25tYW4tc2V0dGluZy1oZWxwOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbi5pcm9ubWFuLXNldHRpbmctdG9vbHRpcCB7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIGluc2V0OiBhdXRvO1xuICAgIHotaW5kZXg6IDEwMDEwO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgbWF4LXdpZHRoOiBtaW4oMThyZW0sIGNhbGMoMTAwdncgLSAxNnB4KSk7XG4gICAgbWFyZ2luOiAwO1xuICAgIHBhZGRpbmc6IC41ZW0gLjdlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40ZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogMTRweC8xLjQgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuamFydmlzLW1hcmstY29sb3IgaW5wdXQge1xuICAgIHdpZHRoOiAzMHB4O1xuICAgIGhlaWdodDogMjBweDtcbiAgICBmbGV4OiBub25lO1xuICAgIHBhZGRpbmc6IDA7XG59XG5idXR0b24uamFydmlzLWNvbnRlc3QtcGluIHtcbiAgICBhbGw6IHVuc2V0O1xuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICBtYXJnaW4taW5saW5lLXN0YXJ0OiAuMzVlbTtcbiAgICBwYWRkaW5nLWlubGluZTogLjJlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250LXNpemU6IC45ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jb250ZXN0LXBpbjo6YmVmb3JlIHtcbiAgICBjb250ZW50OiAn4piGJztcbn1cbi5qYXJ2aXMtY29udGVzdC1waW5bYXJpYS1wcmVzc2VkPVwidHJ1ZVwiXTo6YmVmb3JlIHtcbiAgICBjb250ZW50OiAn4piFJztcbiAgICBjb2xvcjogI2ZmZDM2Yjtcbn1cbi5qYXJ2aXMtY29udGVzdC1waW46Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgIHdpZHRoOiBmaXQtY29udGVudDtcbiAgICBnYXA6IC4xMmVtO1xuICAgIHBhZGRpbmc6IC4xMmVtO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgNTUlLCB0cmFuc3BhcmVudCk7XG4gICAgYm9yZGVyLXJhZGl1czogLjQ1ZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgbGluZS1oZWlnaHQ6IDEuMTU7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIGJ1dHRvbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBwYWRkaW5nOiAuMThlbSAuMzhlbTtcbiAgICBib3JkZXItcmFkaXVzOiAuMjZlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGxpbmUtaGVpZ2h0OiBpbmhlcml0O1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b25bYXJpYS1wcmVzc2VkPVwidHJ1ZVwiXSB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAyMiUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDE1JSwgdHJhbnNwYXJlbnQpO1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b246Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0IHtcbiAgICBtYXJnaW4taW5saW5lLXN0YXJ0OiAuMjhlbTtcbiAgICBmb250LXNpemU6IC43ZW07XG4gICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbn1cbiNjb250ZXN0cyAuY29udGVzdF9oZWFkZXIgLmphcnZpcy1jb250ZXN0LXRpdGxlIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiAuM2VtO1xuICAgIG1pbi1pbmxpbmUtc2l6ZTogMDtcbn1cbi5qYXJ2aXMtY29udGVzdC10aXRsZS1sYWJlbCB7XG4gICAgZmxleDogMSAxIDAlO1xuICAgIG1pbi1pbmxpbmUtc2l6ZTogMDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG59XG4uamFydmlzLWNvbnRlc3QtdGl0bGUgPiA6aXMoLmphcnZpcy1jb250ZXN0LXBpbiwgLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQpIHtcbiAgICBmbGV4OiBub25lO1xuICAgIG1hcmdpbi1pbmxpbmUtc3RhcnQ6IDA7XG59XG4jY29udGVzdHMgLmNvbnRlc3RfaGVhZGVyIC5qYXJ2aXMtY29udGVzdC10aXRsZS1zdGFja2VkIHtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogYXV0byBtaW5tYXgoMCwgMWZyKTtcbiAgICByb3ctZ2FwOiAuMTJlbTtcbn1cbi5qYXJ2aXMtY29udGVzdC10aXRsZS1zdGFja2VkIC5qYXJ2aXMtY29udGVzdC10aXRsZS1sYWJlbCB7XG4gICAgZ3JpZC1jb2x1bW46IDEgLyAtMTtcbn1cbiNjb250ZXN0cyAuY29udGVzdF90aXRsZV90aW1lcjpoYXMoPiAuamFydmlzLWNvbnRlc3QtdGl0bGUtc3RhY2tlZCkgPiAuY29udGVzdF90aW1lciB7XG4gICAgYWxpZ24tc2VsZjogZmxleC1zdGFydDtcbn1cbi5qYXJ2aXMtY29udGVzdC10aXRsZS1zdGFja2VkIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0IHtcbiAgICBqdXN0aWZ5LXNlbGY6IHN0YXJ0O1xuICAgIGZvbnQtc2l6ZTogLjY0ZW07XG59XG4uamFydmlzLWNvbnRlc3Qtc2V0dGluZ3Mge1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ2FwOiAuM2VtO1xuICAgIG1pbi13aWR0aDogMDtcbiAgICBtYXJnaW46IC40NWVtIDAgMDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGJvcmRlcjogMDtcbiAgICBmb250LXNpemU6IC44NWVtO1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzIC5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgbWF4LXdpZHRoOiAxMDAlO1xuICAgIGZsZXgtd3JhcDogd3JhcDtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5ncyBbaGlkZGVuXSB7XG4gICAgZGlzcGxheTogbm9uZTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5nczpkaXNhYmxlZCAuamFydmlzLWNvbnRlc3QtY2hvaWNlIHtcbiAgICBvcGFjaXR5OiAuNTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5nczpkaXNhYmxlZCBidXR0b24ge1xuICAgIGN1cnNvcjogZGVmYXVsdDtcbn1cbi5qYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBpbnNldC1ibG9jay1zdGFydDogMS4zcmVtO1xuICAgIGluc2V0LWlubGluZS1lbmQ6IDNyZW07XG4gICAgei1pbmRleDogMTA7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGdhcDogLjNlbTtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7XG59XG4uamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzIGJ1dHRvbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgcGxhY2UtY29udGVudDogY2VudGVyO1xuICAgIGdhcDogLjE1ZW07XG4gICAgbWluLWlubGluZS1zaXplOiAyLjg1ZW07XG4gICAgcGFkZGluZzogLjI4ZW0gLjQ1ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciA0MCUsIHRyYW5zcGFyZW50KTtcbiAgICBib3JkZXItcmFkaXVzOiAuNGVtO1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMTAlLCB0cmFuc3BhcmVudCk7XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgZm9udDogaW5oZXJpdDtcbiAgICBmb250LXNpemU6IC45ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cyBidXR0b24gc3BhbiB7XG4gICAgZm9udC1zaXplOiAuNzVlbTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMgYnV0dG9uOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDE4JSwgdHJhbnNwYXJlbnQpO1xufVxuLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cyBidXR0b25bYXJpYS1wcmVzc2VkPVwidHJ1ZVwiXSB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAyNyUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMgYnV0dG9uOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDJweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbi5qYXJ2aXMtbWFyay1tZW51IHtcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgei1pbmRleDogMTAwMDA7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBnYXA6IDJweDtcbiAgICBwYWRkaW5nOiA0cHg7XG4gICAgYm9yZGVyOiAxcHggc29saWQgIzg5OTRhNztcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgYmFja2dyb3VuZDogIzIzMjkzNjtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBib3gtc2hhZG93OiAwIDJweCAxMHB4ICMwMDA4O1xuICAgIGZvbnQ6IDEzcHgvMS4zNSBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7XG59XG4uamFydmlzLW1hcmstbWVudSBidXR0b24ge1xuICAgIGFsbDogdW5zZXQ7XG4gICAgcGFkZGluZzogNHB4IDlweDtcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1tYXJrLW1lbnUgYnV0dG9uOmhvdmVyLFxuLmphcnZpcy1tYXJrLW1lbnUgYnV0dG9uOmZvY3VzLXZpc2libGUge1xuICAgIGJhY2tncm91bmQ6ICM0MTRkNjQ7XG59XG4jY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEuamFydmlzLWNvbnRlc3QtaW5zdGFudCxcbiNjb250ZXN0cyAucmlnaHRfcGFydC5qYXJ2aXMtY29udGVzdC1pbnN0YW50IC5sZWFkX3RhYmxlX3ZpZXcge1xuICAgIHNjcm9sbC1iZWhhdmlvcjogYXV0byAhaW1wb3J0YW50O1xuICAgIG92ZXJmbG93LWFuY2hvcjogbm9uZSAhaW1wb3J0YW50O1xufVxuI2NvbnRlc3RzIC5qYXJ2aXMtY29udGVzdC1sb2FkaW5nIHtcbiAgICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7XG4gICAgdHJhbnNpdGlvbjogbm9uZSAhaW1wb3J0YW50O1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuI2NvbnRlc3RzIC5yaWdodF9wYXJ0IC5yYW5raW5nW2lkX2NvbnRlc3RdLmphcnZpcy1jb250ZXN0LW90aGVyIHtcbiAgICBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFyaz1cImZyaWVuZFwiXSB7XG4gICAgY29sb3I6IHZhcigtLWphcnZpcy1mcmllbmQtY29sb3IpICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFyaz1cImZvZVwiXSB7XG4gICAgY29sb3I6IHZhcigtLWphcnZpcy1mb2UtY29sb3IpICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFya10sXG50ZFtkYXRhLWphcnZpcy1tYXJrXSA+IGEge1xuICAgIHRleHQtc2hhZG93OiAxcHggMCAjMTExODI3LCAtMXB4IDAgIzExMTgyNywgMCAxcHggIzExMTgyNywgMCAtMXB4ICMxMTE4MjcgIWltcG9ydGFudDtcbn1cbnRkW2RhdGEtamFydmlzLW1hcmtdID4gYSB7XG4gICAgY29sb3I6IGluaGVyaXQgIWltcG9ydGFudDtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb24ge1xuICAgIGFwcGVhcmFuY2U6IG5vbmU7XG4gICAgcGFkZGluZzogLjJlbSAuNWVtO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbiAgICBib3JkZXItcmFkaXVzOiAuMzVlbTtcbiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246aG92ZXIsXG4uamFydmlzLXNldHRpbmctYWN0aW9uOmZvY3VzLXZpc2libGUge1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMTYlLCB0cmFuc3BhcmVudCk7XG59XG4uamFydmlzLXNldHRpbmctYWN0aW9uOmRpc2FibGVkIHtcbiAgICBjdXJzb3I6IGRlZmF1bHQ7XG4gICAgb3BhY2l0eTogLjU7XG59XG4uamFydmlzLW1hcmstc2V0dGluZy1hY3Rpb25zLFxuLmphcnZpcy1tYXJrLWFjdGlvbnMge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC13cmFwOiB3cmFwO1xuICAgIGdhcDogLjRlbTtcbn1cbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIHtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIHdpZHRoOiBtaW4oMzRyZW0sIGNhbGMoMTAwdncgLSAycmVtKSk7XG4gICAgbWF4LWhlaWdodDogY2FsYygxMDB2aCAtIDJyZW0pO1xuICAgIHBhZGRpbmc6IDFyZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNjVyZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogMTVweC8xLjM1IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbn1cbi5qYXJ2aXMtbWFyay1tYW5hZ2VyOjpiYWNrZHJvcCB7XG4gICAgYmFja2dyb3VuZDogIzA4MGIxMmFhO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXIgaDIsXG4uamFydmlzLW1hcmstbWFuYWdlciBoMyxcbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIHAge1xuICAgIG1hcmdpbjogMDtcbn1cbi5qYXJ2aXMtbWFyay1saXN0cyB7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KG1pbigxM3JlbSwgMTAwJSksIDFmcikpO1xuICAgIGdhcDogLjlyZW07XG4gICAgbWF4LWhlaWdodDogNTB2aDtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIHNjcm9sbGJhci1ndXR0ZXI6IHN0YWJsZTtcbiAgICBwYWRkaW5nLWlubGluZS1lbmQ6IC43cmVtO1xuICAgIG1hcmdpbi1ibG9jazogLjlyZW07XG59XG4uamFydmlzLW1hcmstbGlzdHMgdWwge1xuICAgIG1hcmdpbjogLjNlbSAwIDA7XG4gICAgcGFkZGluZzogMDtcbiAgICBsaXN0LXN0eWxlOiBub25lO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIGxpIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgIGdhcDogLjQ1ZW07XG4gICAgcGFkZGluZzogLjJlbSAwO1xuICAgIG92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIGxpIGJ1dHRvbiB7XG4gICAgZmxleDogbm9uZTtcbn1cbi5qYXJ2aXMtbWFyay1hY3Rpb25zIHtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG59XG4uamFydmlzLXZpZXctY2hhbmdlbG9nIHtcbiAgICBtYXJnaW4tdG9wOiAuNDVlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGljZSB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHotaW5kZXg6IDU7XG4gICAgdHJhbnNsYXRlOiBjYWxjKC0xMDAlIC0gLjI1ZW0pIC01MCU7XG4gICAgYXNwZWN0LXJhdGlvOiAxO1xuICAgIHBhZGRpbmc6IDA7XG4gICAgYm9yZGVyOiAwO1xuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgICBjb2xvcjogI2E5ZTRmZjtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RpY2Ugc3ZnIHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICB3aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gICAgZmlsdGVyOiBkcm9wLXNoYWRvdygwIDFweCAxcHggIzA3MTYyNSk7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RpY2U6aG92ZXIge1xuICAgIGNvbG9yOiAjZGJmNWZmO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90aWNlOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDJweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGljZTppcyg6aG92ZXIsIDpmb2N1cy12aXNpYmxlKTo6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6IGF0dHIoZGF0YS10b29sdGlwKTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgaW5zZXQtYmxvY2stc3RhcnQ6IGNhbGMoMTAwJSArIC40ZW0pO1xuICAgIGluc2V0LWlubGluZS1lbmQ6IDA7XG4gICAgcGFkZGluZzogLjM1ZW0gLjU1ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuMzVlbTtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jb25maWctc2V0dGluZy1iYWNrZ3JvdW5kLCAjMjQxZTMwKTtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBmb250OiA1MDAgLjc1cmVtLzEuMjUgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG5kaWFsb2cuamFydmlzLWNoYW5nZWxvZy1wb3B1cCB7XG4gICAgLS1qYXJ2aXMtY2hhbmdlbG9nLWhlaWdodDogbWluKDMycmVtLCBjYWxjKDEwMHZoIC0gMS4yNXJlbSkpO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIGluc2V0OiAwO1xuICAgIHdpZHRoOiBtaW4oMzdyZW0sIGNhbGMoMTAwJSAtIDEuMjVyZW0pKTtcbiAgICBoZWlnaHQ6IGZpdC1jb250ZW50O1xuICAgIG1heC1oZWlnaHQ6IHZhcigtLWphcnZpcy1jaGFuZ2Vsb2ctaGVpZ2h0KTtcbiAgICBtYXJnaW46IGF1dG87XG4gICAgcGFkZGluZzogMDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbmZpZy1zZXR0aW5nLWJvcmRlciwgI2E5YTNiYyk7XG4gICAgYm9yZGVyLXJhZGl1czogLjZyZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogMTVweC8xLjQ1IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbiAgICB0ZXh0LWFsaWduOiBzdGFydDtcbn1cbkBzdXBwb3J0cyAoaGVpZ2h0OiAxMDBkdmgpIHtcbiAgICBkaWFsb2cuamFydmlzLWNoYW5nZWxvZy1wb3B1cCB7XG4gICAgICAgIC0tamFydmlzLWNoYW5nZWxvZy1oZWlnaHQ6IG1pbigzMnJlbSwgY2FsYygxMDBkdmggLSAxLjI1cmVtKSk7XG4gICAgfVxufVxuLmphcnZpcy1jaGFuZ2Vsb2ctcG9wdXA6OmJhY2tkcm9wIHtcbiAgICBiYWNrZ3JvdW5kOiAjMDgwYjEyYWE7XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IHtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiBhdXRvIG1pbm1heCgwLCAxZnIpIGF1dG87XG4gICAgZ2FwOiBjbGFtcCguNDVyZW0sIDJ2dywgLjlyZW0pO1xuICAgIG1heC1oZWlnaHQ6IGNhbGModmFyKC0tamFydmlzLWNoYW5nZWxvZy1oZWlnaHQpIC0gMnB4KTtcbiAgICBwYWRkaW5nOiBjbGFtcCguNnJlbSwgM3Z3LCAxcmVtKTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgaDIsXG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGgzIHtcbiAgICBtYXJnaW46IDA7XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGgyIHtcbiAgICBmb250LXNpemU6IDEuM2VtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBoMyB7XG4gICAgY29sb3I6IHZhcigtLWNvbmZpZy1zZXR0aW5nLWJvcmRlciwgI2Q5YzdmYik7XG4gICAgZm9udC1zaXplOiAxZW07XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IHNlY3Rpb24gKyBzZWN0aW9uLFxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBkZXRhaWxzIHtcbiAgICBtYXJnaW4tdG9wOiAuNzVyZW07XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RlcyB7XG4gICAgb3ZlcmZsb3cteTogYXV0bztcbiAgICBvdmVyc2Nyb2xsLWJlaGF2aW9yOiBjb250YWluO1xuICAgIHNjcm9sbGJhci13aWR0aDogdGhpbjtcbiAgICBvdmVyZmxvdy13cmFwOiBhbnl3aGVyZTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGVzIHVsIHtcbiAgICBtYXJnaW46IC4yZW0gMCAwO1xuICAgIHBhZGRpbmctaW5saW5lLXN0YXJ0OiAxLjJlbTtcbiAgICBsaXN0LXN0eWxlOiBkaXNjO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90ZXMgbGkgKyBsaSB7XG4gICAgbWFyZ2luLXRvcDogLjI1ZW07XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RlcyBzdW1tYXJ5IHtcbiAgICBtYXJnaW4tYm90dG9tOiAuNHJlbTtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGZvb3RlciB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGVuZDtcbiAgICBnYXA6IC41ZW07XG59XG4uamFydmlzLWNoYW5nZWxvZy1vcHRpb25zIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtd3JhcDogd3JhcDtcbiAgICBnYXA6IC40ZW0gLjllbTtcbiAgICBtYXJnaW4taW5saW5lLWVuZDogYXV0bztcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW9wdGlvbnMgbGFiZWwge1xuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiAuNGVtO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbiIsICJpbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBtb3VudFNldHRpbmdzSGVscCB9IGZyb20gJy4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCBjc3MgZnJvbSAnLi9zZXR0aW5ncy5jc3MnO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0U3R5bGVzKCkge1xuICAgIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZS5jbGFzc05hbWUgPSAnaGgtamFydmlzLXN0eWxlJztcbiAgICBjb25zdCB2ZXJzaW9uID0gYHYke1VTRVJTQ1JJUFRfVkVSU0lPTn0ke1VTRVJTQ1JJUFRfQ0hBTk5FTCA9PT0gJ0RldicgPyAnIERldicgOiAnJ31gO1xuICAgIHN0eWxlLnRleHRDb250ZW50ID0gYCR7Y3NzfVxuICAgICAgICAuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCB7IC0tamFydmlzLXZlcnNpb246IFwiJHt2ZXJzaW9ufVwiOyB9XG4gICAgYDtcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tTZXR0aW5ncygpIHtcbiAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAucGFuZWwtY29udGVudHMnO1xuICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihzZWxlY3Rvcik7XG4gICAgICAgIGlmICghcGFuZWwpIHJldHVybjtcbiAgICAgICAgcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnaGgtc2Nyb2xsJyk7XG4gICAgICAgIG1vdW50U2V0dGluZ3NIZWxwKHBhbmVsLCAnamFydmlzLXNldHRpbmctdG9vbHRpcCcpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuY3RybEtleSB8fCAhKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHx8ICFwYW5lbC5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaXQgPSBldmVudC5kZWx0YU1vZGUgPT09IDEgPyAxNiA6IGV2ZW50LmRlbHRhTW9kZSA9PT0gMiA/IHBhbmVsLmNsaWVudEhlaWdodCA6IDE7XG4gICAgICAgICAgICBjb25zdCBzY2FsZSA9IHBhbmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCAvIHBhbmVsLm9mZnNldEhlaWdodCB8fCAxO1xuICAgICAgICAgICAgcGFuZWwuc2Nyb2xsVG9wICs9IGV2ZW50LmRlbHRhWSAqIHVuaXQgLyBzY2FsZTtcbiAgICAgICAgfSwgeyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiBmYWxzZSB9KTtcblxuICAgICAgICBjb25zdCBjYXJkcyA9IHBhbmVsLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcuY29uZmlnLXNldHRpbmcnKTtcbiAgICAgICAgY29uc3QgcGFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghcGFuZWwub2Zmc2V0V2lkdGgpIHJldHVybjtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBjYXJkIG9mIGNhcmRzKSB7XG4gICAgICAgICAgICAgICAgY2FyZC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1qYXJ2aXMtc2V0dGluZy1yb3dzJywgU3RyaW5nKGNhcmQub2Zmc2V0SGVpZ2h0ICsgMTApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhbmVsLmNsYXNzTGlzdC5hZGQoJ2phcnZpcy1wYWNrZWQtc2V0dGluZ3MnKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZ3JvdXBPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKHBhY2spO1xuICAgICAgICBpZiAocGFuZWwucGFyZW50RWxlbWVudCkgZ3JvdXBPYnNlcnZlci5vYnNlcnZlKHBhbmVsLnBhcmVudEVsZW1lbnQsIHsgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10gfSk7XG4gICAgICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBjb25zdCBzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIocGFjayk7XG4gICAgICAgICAgICBjYXJkcy5mb3JFYWNoKGNhcmQgPT4gc2l6ZU9ic2VydmVyLm9ic2VydmUoY2FyZCkpO1xuICAgICAgICB9XG4gICAgICAgIHBhY2soKTtcbiAgICB9KTtcbn1cbiIsICJleHBvcnQgdHlwZSBNb2R1bGVTZXR0aW5ncyA9IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+O1xuXG5pbnRlcmZhY2UgQ29uZmlnU2NoZW1hIHtcbiAgICBiYXNlS2V5OiBzdHJpbmc7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBkZWZhdWx0OiBib29sZWFuO1xuICAgIHN1YlNldHRpbmdzPzogeyBrZXk6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgZGVmYXVsdDogYm9vbGVhbiB9W107XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBISE1vZHVsZSB7XG4gICAgcmVhZG9ubHkgZ3JvdXAgPSAnSkFSVklTJztcbiAgICByZWFkb25seSBjb25maWdTY2hlbWE6IENvbmZpZ1NjaGVtYTtcbiAgICBoYXNSdW4gPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKHsgY29uZmlnU2NoZW1hIH06IHsgbmFtZTogc3RyaW5nOyBjb25maWdTY2hlbWE6IENvbmZpZ1NjaGVtYSB9KSB7XG4gICAgICAgIHRoaXMuY29uZmlnU2NoZW1hID0gY29uZmlnU2NoZW1hO1xuICAgIH1cblxuICAgIGFic3RyYWN0IHNob3VsZFJ1bigpOiBib29sZWFuO1xuICAgIGFic3RyYWN0IHJ1bihzZXR0aW5nczogTW9kdWxlU2V0dGluZ3MpOiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbn1cbiIsICJleHBvcnQgY29uc3QgTFNfQ09ORklHX05BTUUgPSAnSEhTdGFyayc7XG5cbmV4cG9ydCBmdW5jdGlvbiBsc0dldChrZXk6IHN0cmluZywgbHNfbmFtZSA9IExTX0NPTkZJR19OQU1FKTogdW5rbm93biB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gKSA/PyAnbnVsbCcpXG59XG5leHBvcnQgZnVuY3Rpb24gbHNTZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLnNldEl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gLCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpXG59XG5leHBvcnQgZnVuY3Rpb24gbHNSbShrZXk6IHN0cmluZywgbHNfbmFtZSA9IExTX0NPTkZJR19OQU1FKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGAke2xzX25hbWV9JHtrZXl9YClcbn1cbiIsICJpbXBvcnQgeyBMU19DT05GSUdfTkFNRSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuXG5leHBvcnQgdHlwZSBNYXJrID0gJ2ZyaWVuZCcgfCAnZm9lJztcblxuZXhwb3J0IGludGVyZmFjZSBTYXZlZE1hcmsge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgbmFtZT86IHN0cmluZztcbiAgICBtYXJrOiBNYXJrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3Blbk1hcmtNYW5hZ2VyKHJlYWQ6ICgpID0+IFNhdmVkTWFya1tdLCByZW1vdmU6IChpZDogc3RyaW5nKSA9PiBib29sZWFuLCBjbGVhcjogKCkgPT4gYm9vbGVhbikge1xuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuamFydmlzLW1hcmstbWFuYWdlcicpKSByZXR1cm47XG5cbiAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaWFsb2cnKTtcbiAgICBkaWFsb2cuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLW1hbmFnZXInO1xuICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsICdqYXJ2aXMtbWFyay1tYW5hZ2VyLXRpdGxlJyk7XG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgIHRpdGxlLmlkID0gJ2phcnZpcy1tYXJrLW1hbmFnZXItdGl0bGUnO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gJ0ZyaWVuZHMgYW5kIGZvZXMnO1xuXG4gICAgY29uc3QgbGlzdHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBsaXN0cy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstbGlzdHMnO1xuICAgIGNvbnN0IGFjdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1hY3Rpb25zJztcbiAgICBjb25zdCBjbGVhckFsbCA9IG1ha2VCdXR0b24oJ0NsZWFyIGFsbCBtYXJrcycsICgpID0+IHtcbiAgICAgICAgaWYgKGNvbmZpcm0oJ1JlbW92ZSBhbGwgZnJpZW5kIGFuZCBmb2UgbWFya3MgZm9yIHRoaXMgZ2FtZT8nKSAmJiBjbGVhcigpKSB7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIGNsb3NlLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBjbG9zZSA9IG1ha2VCdXR0b24oJ0Nsb3NlJywgKCkgPT4gZGlhbG9nLmNsb3NlKCkpO1xuICAgIGFjdGlvbnMuYXBwZW5kKGNsZWFyQWxsLCBjbG9zZSk7XG5cbiAgICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSByZWFkKCkuc29ydCgoYSwgYikgPT4gTnVtYmVyKCFhLm5hbWUpIC0gTnVtYmVyKCFiLm5hbWUpIHx8XG4gICAgICAgICAgICAoYS5uYW1lIHx8IGEuaWQpLmxvY2FsZUNvbXBhcmUoYi5uYW1lIHx8IGIuaWQsIHVuZGVmaW5lZCwgeyBudW1lcmljOiB0cnVlIH0pKTtcbiAgICAgICAgY29uc3Qgc2VjdGlvbnMgPSAoWydmcmllbmQnLCAnZm9lJ10gYXMgY29uc3QpLm1hcChtYXJrID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgICAgICAgICBjb25zdCBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBlbnRyaWVzLmZpbHRlcihlbnRyeSA9PiBlbnRyeS5tYXJrID09PSBtYXJrKTtcbiAgICAgICAgICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSAobWFyayA9PT0gJ2ZyaWVuZCcgPyAnRnJpZW5kcycgOiAnRm9lcycpICsgYCAoJHttYXRjaGVzLmxlbmd0aH0pYDtcbiAgICAgICAgICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoaGVhZGluZyk7XG5cbiAgICAgICAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVtcHR5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICAgICAgICAgIGVtcHR5LnRleHRDb250ZW50ID0gJ05vIHNhdmVkIHBsYXllcnMuJztcbiAgICAgICAgICAgICAgICBzZWN0aW9uLmFwcGVuZENoaWxkKGVtcHR5KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VjdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgaWQsIG5hbWUgfSBvZiBtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICAgICAgcGxheWVyLnRleHRDb250ZW50ID0gbmFtZSA/IGAke25hbWV9IMK3ICR7aWR9YCA6IGBQbGF5ZXIgIyR7aWR9YDtcbiAgICAgICAgICAgICAgICBpZiAoIW5hbWUpIHBsYXllci50aXRsZSA9ICdOYW1lIG5vdCByZWNvcmRlZCB5ZXQnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IG1ha2VCdXR0b24oJ1JlbW92ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBBcnJheS5mcm9tKGxpc3RzLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpKS5pbmRleE9mKGJ1dHRvbik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmUoaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbWFpbmluZyA9IGxpc3RzLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgKHJlbWFpbmluZ1tNYXRoLm1pbihpbmRleCwgcmVtYWluaW5nLmxlbmd0aCAtIDEpXSB8fCBjbG9zZSkuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBgUmVtb3ZlICR7bmFtZSB8fCBgcGxheWVyICR7aWR9YH0gZnJvbSAke21hcmsgPT09ICdmcmllbmQnID8gJ2ZyaWVuZHMnIDogJ2ZvZXMnfWApO1xuICAgICAgICAgICAgICAgIHJvdy5hcHBlbmQocGxheWVyLCBidXR0b24pO1xuICAgICAgICAgICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQocm93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQobGlzdCk7XG4gICAgICAgICAgICByZXR1cm4gc2VjdGlvbjtcbiAgICAgICAgfSk7XG4gICAgICAgIGxpc3RzLnJlcGxhY2VDaGlsZHJlbiguLi5zZWN0aW9ucyk7XG4gICAgICAgIGNsZWFyQWxsLmRpc2FibGVkID0gZW50cmllcy5sZW5ndGggPT09IDA7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk7XG4gICAgZGlhbG9nLmFwcGVuZCh0aXRsZSwgbGlzdHMsIGFjdGlvbnMpO1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCFldmVudC5rZXkgfHwgWydQbGF5ZXJNYXJrcycsICdQbGF5ZXJNYXJrTmFtZXMnLCAnRnJpZW5kTGlzdCcsICdGb2VMaXN0J11cbiAgICAgICAgICAgIC5zb21lKGtleSA9PiBldmVudC5rZXkgPT09IExTX0NPTkZJR19OQU1FICsga2V5KSkgcmVuZGVyKCk7XG4gICAgfSwgeyBzaWduYWw6IGxpc3RlbmVycy5zaWduYWwgfSk7XG4gICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICBsaXN0ZW5lcnMuYWJvcnQoKTtcbiAgICAgICAgZGlhbG9nLnJlbW92ZSgpO1xuICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgIGNsb3NlLmZvY3VzKCk7XG59XG5cbmZ1bmN0aW9uIG1ha2VCdXR0b24obGFiZWw6IHN0cmluZywgb25DbGljazogKCkgPT4gdm9pZCkge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IGxhYmVsO1xuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spO1xuICAgIHJldHVybiBidXR0b247XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB0eXBlIHsgQ29udGVzdERhdGEgfSBmcm9tICcuLi8uLi9nYW1lLXR5cGVzJztcbmltcG9ydCB7IExTX0NPTkZJR19OQU1FLCBsc0dldCwgbHNTZXQgfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcbmltcG9ydCB7IG9wZW5NYXJrTWFuYWdlciwgdHlwZSBNYXJrLCB0eXBlIFNhdmVkTWFyayB9IGZyb20gJy4vbWFya01hbmFnZXInO1xuXG5jb25zdCBERUZBVUxUX0NPTE9SUzogUmVjb3JkPE1hcmssIHN0cmluZz4gPSB7IGZyaWVuZDogJyM0OGE5ZmYnLCBmb2U6ICcjZmY2MTczJyB9O1xudHlwZSBTYXZlZE5hbWUgPSBzdHJpbmcgfCB7IG5hbWU6IHN0cmluZyB9O1xuXG5mdW5jdGlvbiByZWFkUm93TmFtZShlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnN0IHRleHQgPSBlbGVtZW50LnRleHRDb250ZW50Py50cmltKCkgPz8gJyc7XG4gICAgaWYgKCF0ZXh0LmVuZHNXaXRoKCcrJykpIHJldHVybiB0ZXh0O1xuICAgIGNvbnN0IHdpdGhvdXRTdGFuZGFsb25lUGx1cyA9IHRleHQucmVwbGFjZSgvXFxzK1xcKyQvLCAnJyk7XG4gICAgaWYgKCFlbGVtZW50LmNoaWxkRWxlbWVudENvdW50KSByZXR1cm4gd2l0aG91dFN0YW5kYWxvbmVQbHVzO1xuXG4gICAgY29uc3QgbGFiZWwgPSBlbGVtZW50LmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MRWxlbWVudDtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGxhYmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJyonKSkge1xuICAgICAgICBpZiAoY2hpbGQudGV4dENvbnRlbnQ/LnRyaW0oKSA9PT0gJysnKSBjaGlsZC5yZW1vdmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGxhYmVsLnRleHRDb250ZW50Py50cmltKCkucmVwbGFjZSgvXFxzK1xcKyQvLCAnJykgfHwgd2l0aG91dFN0YW5kYWxvbmVQbHVzO1xufVxuXG5mdW5jdGlvbiBkaXNwbGF5U2F2ZWROYW1lKHNhdmVkPzogU2F2ZWROYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBzYXZlZCAhPT0gJ3N0cmluZycpIHJldHVybiBzYXZlZD8ubmFtZTtcbiAgICAvLyBPbGQgZW50cmllcyBzdG9yZWQgdGhlIGZ1bGwgcm93IHRleHQsIGluY2x1ZGluZyBhIHRyYWlsaW5nIGFkZCBjb250cm9sLlxuICAgIHJldHVybiBzYXZlZC50cmltKCkucmVwbGFjZSgvKFteK10pXFwrJC8sICckMScpLnRyaW1FbmQoKTtcbn1cblxuZXhwb3J0IGNsYXNzIEZyaWVuZEFuZEZvZXMgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBuYW1lcyA9IG5ldyBNYXA8SFRNTEVsZW1lbnQsIHN0cmluZz4oKTtcbiAgICBwcml2YXRlIG1hcmtNZW51OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcm9vdDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJvb3RTZWxlY3RvciA9ICcnO1xuICAgIHByaXZhdGUgaW5MZWFndWUgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2ZyaWVuZEFuZEZvZXMnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiRnJpZW5kcyBhbmQgZm9lc1wiLCBcIlJpZ2h0LWNsaWNrIGVhY2ggcGxheWVyJ3MgbmFtZSB0byBhZGQgb3IgcmVtb3ZlIGEgbWFyay4gTWFuYWdlIHNhdmVkIG1hcmtzIGJlbG93LlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ2xlYWd1ZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiSW4gbGVhZ3Vlc1wiLCBcIlNob3cgbWFya3MgYW5kIGFsbG93IG1hcmtpbmcgaW4gbGVhZ3VlIHRhYmxlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2NvbnRlc3RzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJJbiBjb250ZXN0c1wiLCBcIlNob3cgbWFya3MgYW5kIGFsbG93IG1hcmtpbmcgb24gY29udGVzdCBsZWFkZXJib2FyZHMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoeyBuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWEgfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gWycvbGVhZ3Vlcy5odG1sJywgJy9hY3Rpdml0aWVzLmh0bWwnXS5pbmNsdWRlcyhjdXJyZW50UGFnZSk7XG4gICAgfVxuXG4gICAgcmVhZFNldHRpbmcoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBsc0dldChrZXkpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVhZE1hcmtzKCk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICAgICAgY29uc3Qgc3RvcmVkID0gdGhpcy5yZWFkU2V0dGluZygnUGxheWVyTWFya3MnKTtcbiAgICAgICAgaWYgKHN0b3JlZCAmJiB0eXBlb2Ygc3RvcmVkID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShzdG9yZWQpKSByZXR1cm4gc3RvcmVkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gICAgICAgIGNvbnN0IG1hcmtzOiBSZWNvcmQ8c3RyaW5nLCBNYXJrPiA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIG1hcmtdIG9mIFtbJ0ZyaWVuZExpc3QnLCAnZnJpZW5kJ10sIFsnRm9lTGlzdCcsICdmb2UnXV0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSB0aGlzLnJlYWRTZXR0aW5nKGtleSk7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdCkpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGxpc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoL15bMS05XVxcZCokLy50ZXN0KFN0cmluZyhpZCkpKSBtYXJrc1tTdHJpbmcoaWQpXSA9IG1hcms7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcmtzO1xuICAgIH1cblxuICAgIHJlYWRDb2xvcnMoKTogUmVjb3JkPE1hcmssIHN0cmluZz4ge1xuICAgICAgICBjb25zdCBzYXZlZCA9IHRoaXMucmVhZFNldHRpbmcoJ1BsYXllck1hcmtDb2xvcnMnKSBhcyBQYXJ0aWFsPFJlY29yZDxNYXJrLCB1bmtub3duPj4gfCBudWxsO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZnJpZW5kOiB0eXBlb2Ygc2F2ZWQ/LmZyaWVuZCA9PT0gJ3N0cmluZycgJiYgL14jW1xcZGEtZl17Nn0kL2kudGVzdChzYXZlZC5mcmllbmQpID8gc2F2ZWQuZnJpZW5kIDogREVGQVVMVF9DT0xPUlMuZnJpZW5kLFxuICAgICAgICAgICAgZm9lOiB0eXBlb2Ygc2F2ZWQ/LmZvZSA9PT0gJ3N0cmluZycgJiYgL14jW1xcZGEtZl17Nn0kL2kudGVzdChzYXZlZC5mb2UpID8gc2F2ZWQuZm9lIDogREVGQVVMVF9DT0xPUlMuZm9lXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmVhZFNhdmVkTmFtZXMoKTogUmVjb3JkPHN0cmluZywgU2F2ZWROYW1lPiB7XG4gICAgICAgIGNvbnN0IHNhdmVkID0gdGhpcy5yZWFkU2V0dGluZygnUGxheWVyTWFya05hbWVzJyk7XG4gICAgICAgIGlmICghc2F2ZWQgfHwgdHlwZW9mIHNhdmVkICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHNhdmVkKSkgcmV0dXJuIHt9O1xuICAgICAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKHNhdmVkKS5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgW3N0cmluZywgU2F2ZWROYW1lXSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbLCB2YWx1ZV0gPSBlbnRyeTtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IEJvb2xlYW4odmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUubmFtZSA9PT0gJ3N0cmluZycpO1xuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgc2F2ZU5hbWVzKG5hbWVzOiBSZWNvcmQ8c3RyaW5nLCBTYXZlZE5hbWU+KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsc1NldCgnUGxheWVyTWFya05hbWVzJywgbmFtZXMpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCByZW1lbWJlciBtYXJrZWQgcGxheWVyIG5hbWVzOicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVNYXJrKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgbWFya3MgPSB0aGlzLnJlYWRNYXJrcygpO1xuICAgICAgICBkZWxldGUgbWFya3NbaWRdO1xuICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtzJywgbWFya3MpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gdGhpcy5yZWFkU2F2ZWROYW1lcygpO1xuICAgICAgICBpZiAoaWQgaW4gbmFtZXMpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBuYW1lc1tpZF07XG4gICAgICAgICAgICB0aGlzLnNhdmVOYW1lcyhuYW1lcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmVhZFNhdmVkTWFya3MoKSB7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gdGhpcy5yZWFkU2F2ZWROYW1lcygpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmVudHJpZXModGhpcy5yZWFkTWFya3MoKSkuZmxhdE1hcDxTYXZlZE1hcms+KChbaWQsIG1hcmtdKSA9PlxuICAgICAgICAgICAgL15bMS05XVxcZCokLy50ZXN0KGlkKSAmJiAobWFyayA9PT0gJ2ZyaWVuZCcgfHwgbWFyayA9PT0gJ2ZvZScpXG4gICAgICAgICAgICAgICAgPyBbeyBpZCwgbmFtZTogZGlzcGxheVNhdmVkTmFtZShuYW1lc1tpZF0pLCBtYXJrIH1dXG4gICAgICAgICAgICAgICAgOiBbXSk7XG4gICAgfVxuXG4gICAgc2F2ZVNldHRpbmcoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsc1NldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIGFsZXJ0KCdKYXJ2aXMgY291bGQgbm90IHNhdmUgeW91ciBGcmllbmRzIGFuZCBGb2VzIHNldHRpbmdzLicpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5zdGFsbFNldHRpbmdzKCkge1xuICAgICAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gJy5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmNvbmZpZy1zZXR0aW5nW3JlbD1cIkpBUlZJU19mcmllbmRBbmRGb2VzXCJdIC5zdWItc2V0dGluZ3MnO1xuICAgICAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZXR0aW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5ncyB8fCBzZXR0aW5ncy5xdWVyeVNlbGVjdG9yKCcuamFydmlzLW1hcmstY29sb3InKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBpbnB1dHMgPSBuZXcgTWFwPE1hcmssIEhUTUxJbnB1dEVsZW1lbnQ+KCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCB0ZXh0XSBvZiBbWydmcmllbmQnLCAnRnJpZW5kIG5hbWUgY29sb3InXSwgWydmb2UnLCAnRm9lIG5hbWUgY29sb3InXV0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLWNvbG9yJztcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICB0aXRsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICAgICAgICAgIGlucHV0LnR5cGUgPSAnY29sb3InO1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdGhpcy5yZWFkQ29sb3JzKClbbWFya107XG4gICAgICAgICAgICAgICAgaW5wdXRzLnNldChtYXJrLCBpbnB1dCk7XG4gICAgICAgICAgICAgICAgaW5wdXQuZGlzYWJsZWQgPSAhc2V0dGluZ3MuY2xvc2VzdCgnLmNvbmZpZy1zZXR0aW5nJyk/LmNsYXNzTGlzdC5jb250YWlucygnZW5hYmxlZCcpO1xuICAgICAgICAgICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sb3JzID0gdGhpcy5yZWFkQ29sb3JzKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya0NvbG9ycycsIHsgLi4uY29sb3JzLCBbbWFya106IGlucHV0LnZhbHVlIH0pKSBpbnB1dC52YWx1ZSA9IGNvbG9yc1ttYXJrXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBsYWJlbC5hcHBlbmQodGl0bGUsIGlucHV0KTtcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5hcHBlbmRDaGlsZChsYWJlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXNldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgcmVzZXQudHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgcmVzZXQuY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgICAgICAgICByZXNldC50ZXh0Q29udGVudCA9ICdSZXNldCBjb2xvcnMnO1xuICAgICAgICAgICAgcmVzZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrQ29sb3JzJywge30pKSByZXR1cm47XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBbbWFyaywgaW5wdXRdIG9mIGlucHV0cykgaW5wdXQudmFsdWUgPSBERUZBVUxUX0NPTE9SU1ttYXJrXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgbWFuYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBtYW5hZ2UudHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgbWFuYWdlLmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgICAgICAgICAgbWFuYWdlLnRleHRDb250ZW50ID0gJ01hbmFnZSBtYXJrcyc7XG4gICAgICAgICAgICBtYW5hZ2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBvcGVuTWFya01hbmFnZXIoXG4gICAgICAgICAgICAgICAgKCkgPT4gdGhpcy5yZWFkU2F2ZWRNYXJrcygpLFxuICAgICAgICAgICAgICAgIGlkID0+IHRoaXMucmVtb3ZlTWFyayhpZCksXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtzJywge30pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZU5hbWVzKHt9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1zZXR0aW5nLWFjdGlvbnMnO1xuICAgICAgICAgICAgYWN0aW9ucy5hcHBlbmQocmVzZXQsIG1hbmFnZSk7XG4gICAgICAgICAgICBzZXR0aW5ncy5hcHBlbmRDaGlsZChhY3Rpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2xvc2VNYXJrTWVudSgpIHtcbiAgICAgICAgdGhpcy5tYXJrTWVudT8ucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMubWFya01lbnUgPSBudWxsO1xuICAgIH1cblxuICAgIG9wZW5NYXJrTWVudShldmVudDogTW91c2VFdmVudCwgbmFtZTogSFRNTEVsZW1lbnQsIGlkOiBzdHJpbmcpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuXG4gICAgICAgIGNvbnN0IG1lbnUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbWVudS5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstbWVudSc7XG4gICAgICAgIG1lbnUuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2dyb3VwJyk7XG4gICAgICAgIG1lbnUuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ01hcmsgcGxheWVyJyk7XG4gICAgICAgIGNvbnN0IGFkZEFjdGlvbiA9ICh0ZXh0OiBzdHJpbmcsIGFjdDogKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZS5pc0Nvbm5lY3RlZCAmJiB0aGlzLm5hbWVzLmdldChuYW1lKSA9PT0gaWQpIGFjdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtZW51LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAoY29uc3QgW21hcmssIHRleHRdIG9mIFtbJ2ZyaWVuZCcsICdNYXJrIGFzIGZyaWVuZCddLCBbJ2ZvZScsICdNYXJrIGFzIGZvZSddXSBhcyBjb25zdCkge1xuICAgICAgICAgICAgYWRkQWN0aW9uKHRleHQsICgpID0+IHRoaXMuYXBwbHlNYXJrKGlkLCBtYXJrKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrKSBhZGRBY3Rpb24oJ1JlbW92ZSB0aGlzIHBsYXllcuKAmXMgbWFyaycsICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlbW92ZU1hcmsoaWQpKSB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGljayA9PiBjbGljay5zdG9wUHJvcGFnYXRpb24oKSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWVudSk7XG4gICAgICAgIHRoaXMubWFya01lbnUgPSBtZW51O1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IG5hbWUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHggPSBldmVudC5jbGllbnRYIHx8IGJvdW5kcy5sZWZ0O1xuICAgICAgICBjb25zdCB5ID0gZXZlbnQuY2xpZW50WSB8fCBib3VuZHMuYm90dG9tO1xuICAgICAgICBtZW51LnN0eWxlLmxlZnQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih4LCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggLSBtZW51Lm9mZnNldFdpZHRoKSkgKyAncHgnO1xuICAgICAgICBtZW51LnN0eWxlLnRvcCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHksIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgLSBtZW51Lm9mZnNldEhlaWdodCkpICsgJ3B4JztcbiAgICAgICAgbWVudS5xdWVyeVNlbGVjdG9yKCdidXR0b24nKT8uZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIGdldENvbnRlc3ROYW1lcyhyb290OiBIVE1MRWxlbWVudCwgY29udGVzdHM6IENvbnRlc3REYXRhW10pIHtcbiAgICAgICAgY29uc3QgbmFtZXMgPSBuZXcgTWFwPEhUTUxFbGVtZW50LCBzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IGJ5Q29udGVzdCA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj4+KCk7XG5cbiAgICAgICAgZm9yIChjb25zdCByb3cgb2Ygcm9vdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxUYWJsZVJvd0VsZW1lbnQ+KCcubGVhZFRhYmxlIHRyJykpIHtcbiAgICAgICAgICAgIGNvbnN0IGNlbGwgPSByb3cuY2VsbHM/LlsxXTtcbiAgICAgICAgICAgIGlmICghY2VsbCB8fCBjZWxsLmxvY2FsTmFtZSAhPT0gJ3RkJykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gY2VsbC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLm5pY2tuYW1lJykgfHwgY2VsbDtcbiAgICAgICAgICAgIGxldCBpZCA9IHJvdy5nZXRBdHRyaWJ1dGUoJ3NvcnRpbmdfaWQnKSB8fCBuYW1lLmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJykgfHxcbiAgICAgICAgICAgICAgICBuYW1lLnF1ZXJ5U2VsZWN0b3IoJ1tpZC1tZW1iZXJdJyk/LmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJyk7XG4gICAgICAgICAgICBjb25zdCBjb250ZXN0SWQgPSByb3cuY2xvc2VzdCgnW2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKGNvbnRlc3RJZCkge1xuICAgICAgICAgICAgICAgIGxldCBieU5hbWUgPSBieUNvbnRlc3QuZ2V0KGNvbnRlc3RJZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFieU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydGljaXBhbnRzID0gY29udGVzdHMuZmluZChjb250ZXN0ID0+IFN0cmluZyhjb250ZXN0LmlkX2NvbnRlc3QpID09PSBjb250ZXN0SWQpPy5wYXJ0aWNpcGFudHM7XG4gICAgICAgICAgICAgICAgICAgIGJ5TmFtZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IG5pY2tuYW1lLCBpZF9tZW1iZXIgfSBvZiBPYmplY3QudmFsdWVzKHBhcnRpY2lwYW50cyB8fCB7fSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5pY2tuYW1lS2V5ID0gU3RyaW5nKG5pY2tuYW1lID8/ICcnKS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5pY2tuYW1lS2V5IHx8ICEvXlsxLTldXFxkKiQvLnRlc3QoU3RyaW5nKGlkX21lbWJlcikpKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBieU5hbWUuZ2V0KG5pY2tuYW1lS2V5KSB8fCBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZXMuYWRkKFN0cmluZyhpZF9tZW1iZXIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5TmFtZS5zZXQobmlja25hbWVLZXksIG1hdGNoZXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJ5Q29udGVzdC5zZXQoY29udGVzdElkLCBieU5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYnlOYW1lLmdldChyZWFkUm93TmFtZShuYW1lKSk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMgJiYgIW1hdGNoZXMuaGFzKGlkID8/ICcnKSkgaWQgPSBtYXRjaGVzLnNpemUgPT09IDEgPyBtYXRjaGVzLnZhbHVlcygpLm5leHQoKS52YWx1ZSA6IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQgJiYgL15bMS05XVxcZCokLy50ZXN0KGlkKSkgbmFtZXMuc2V0KG5hbWUsIGlkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmFtZXM7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KHRoaXMucm9vdFNlbGVjdG9yKTtcbiAgICAgICAgdGhpcy5yb290ID0gcm9vdDtcbiAgICAgICAgY29uc3QgY29udGVzdHMgPSB0aGlzLmluTGVhZ3VlID8gW10gOiBbXG4gICAgICAgICAgICAuLi5PYmplY3QudmFsdWVzKHdpbmRvdy5jb250ZXN0cz8uYWN0aXZlID8/IHt9KSxcbiAgICAgICAgICAgIC4uLk9iamVjdC52YWx1ZXMod2luZG93LmNvbnRlc3RzPy5maW5pc2hlZCA/PyB7fSlcbiAgICAgICAgXS5maWx0ZXIoY29udGVzdCA9PiBjb250ZXN0Py5pZF9jb250ZXN0ICE9IG51bGwpO1xuICAgICAgICBjb25zdCBuYW1lcyA9ICFyb290ID8gbmV3IE1hcDxIVE1MRWxlbWVudCwgc3RyaW5nPigpIDogdGhpcy5pbkxlYWd1ZVxuICAgICAgICAgICAgPyBuZXcgTWFwKEFycmF5LmZyb20ocm9vdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLm5pY2tuYW1lW2lkLW1lbWJlcl0nKSwgbmFtZSA9PiBbbmFtZSwgbmFtZS5nZXRBdHRyaWJ1dGUoJ2lkLW1lbWJlcicpXSBhcyBjb25zdClcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIHJlYWRvbmx5IFtIVE1MRWxlbWVudCwgc3RyaW5nXSA9PiAhIWVudHJ5WzFdICYmIC9eWzEtOV1cXGQqJC8udGVzdChlbnRyeVsxXSkpKVxuICAgICAgICAgICAgOiB0aGlzLmdldENvbnRlc3ROYW1lcyhyb290LCBjb250ZXN0cyk7XG5cbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMubmFtZXMua2V5cygpKSB7XG4gICAgICAgICAgICBpZiAobmFtZXMuaGFzKG5hbWUpKSBjb250aW51ZTtcbiAgICAgICAgICAgIGRlbGV0ZSBuYW1lLmRhdGFzZXQuamFydmlzUGxheWVyO1xuICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5uYW1lcyA9IG5hbWVzO1xuICAgICAgICBpZiAoIXJvb3QpIHJldHVybjtcbiAgICAgICAgY29uc3QgbWFya3MgPSB0aGlzLnJlYWRNYXJrcygpO1xuICAgICAgICBjb25zdCBzYXZlZE5hbWVzID0gdGhpcy5yZWFkU2F2ZWROYW1lcygpO1xuICAgICAgICBjb25zdCByb3N0ZXJOYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBsZXQgbmFtZXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHJlbWVtYmVyTmFtZSA9IChpZDogc3RyaW5nLCB0ZXh0Pzogc3RyaW5nIHwgbnVsbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGlzcGxheU5hbWUgPSB0eXBlb2YgdGV4dCA9PT0gJ3N0cmluZycgPyB0ZXh0LnRyaW0oKSA6ICcnO1xuICAgICAgICAgICAgaWYgKCFkaXNwbGF5TmFtZSB8fCAobWFya3NbaWRdICE9PSAnZnJpZW5kJyAmJiBtYXJrc1tpZF0gIT09ICdmb2UnKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgcHJldmlvdXMgPSBzYXZlZE5hbWVzW2lkXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJldmlvdXMgPT09ICdzdHJpbmcnIHx8IHByZXZpb3VzPy5uYW1lICE9PSBkaXNwbGF5TmFtZSkge1xuICAgICAgICAgICAgICAgIHNhdmVkTmFtZXNbaWRdID0geyBuYW1lOiBkaXNwbGF5TmFtZSB9O1xuICAgICAgICAgICAgICAgIG5hbWVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuaW5MZWFndWUpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBwbGF5ZXIsIG5pY2tuYW1lIH0gb2Ygd2luZG93Lm9wcG9uZW50c19saXN0ID8/IFtdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBTdHJpbmcocGxheWVyPy5pZF9maWdodGVyKTtcbiAgICAgICAgICAgICAgICBpZiAocmVtZW1iZXJOYW1lKGlkLCBuaWNrbmFtZSkpIHJvc3Rlck5hbWVzLmFkZChpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBQcmVmZXIgdGhlIGFjdGl2ZSByb3N0ZXIgaWYgYSBwbGF5ZXIgYXBwZWFycyBpbiBib3RoIG9sZCBhbmQgY3VycmVudCBjb250ZXN0cy5cbiAgICAgICAgICAgIGZvciAoY29uc3QgY29udGVzdCBvZiBjb250ZXN0cykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgeyBpZF9tZW1iZXIsIG5pY2tuYW1lIH0gb2YgT2JqZWN0LnZhbHVlcyhjb250ZXN0LnBhcnRpY2lwYW50cyA/PyB7fSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaWQgPSBTdHJpbmcoaWRfbWVtYmVyKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyb3N0ZXJOYW1lcy5oYXMoaWQpICYmIHJlbWVtYmVyTmFtZShpZCwgbmlja25hbWUpKSByb3N0ZXJOYW1lcy5hZGQoaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnJlYWRDb2xvcnMoKTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFyaywgY29sb3JdIG9mIE9iamVjdC5lbnRyaWVzKGNvbG9ycykpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5ID0gJy0tamFydmlzLScgKyBtYXJrICsgJy1jb2xvcic7XG4gICAgICAgICAgICBpZiAocm9vdC5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5KSAhPT0gY29sb3IpIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkocHJvcGVydHksIGNvbG9yKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCBpZF0gb2YgbmFtZXMpIHtcbiAgICAgICAgICAgIGlmIChuYW1lLmRhdGFzZXQuamFydmlzUGxheWVyICE9PSBpZCkgbmFtZS5kYXRhc2V0LmphcnZpc1BsYXllciA9IGlkO1xuICAgICAgICAgICAgY29uc3QgbWFyayA9IG1hcmtzW2lkXTtcbiAgICAgICAgICAgIGlmIChtYXJrID09PSAnZnJpZW5kJyB8fCBtYXJrID09PSAnZm9lJykge1xuICAgICAgICAgICAgICAgIGlmIChuYW1lLmRhdGFzZXQuamFydmlzTWFyayAhPT0gbWFyaykgbmFtZS5kYXRhc2V0LmphcnZpc01hcmsgPSBtYXJrO1xuICAgICAgICAgICAgICAgIGlmICghcm9zdGVyTmFtZXMuaGFzKGlkKSkgcmVtZW1iZXJOYW1lKGlkLCByZWFkUm93TmFtZShuYW1lKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lc0NoYW5nZWQpIHRoaXMuc2F2ZU5hbWVzKHNhdmVkTmFtZXMpO1xuICAgIH1cblxuICAgIGFwcGx5TWFyayhpZDogc3RyaW5nLCBtYXJrOiBNYXJrKSB7XG4gICAgICAgIGNvbnN0IG1hcmtzID0gdGhpcy5yZWFkTWFya3MoKTtcbiAgICAgICAgbWFya3NbaWRdID0gbWFyaztcblxuICAgICAgICBpZiAodGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya3MnLCBtYXJrcykpIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIGhhbmRsZU1hcmtNZW51KGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlICYmIHRoaXMubWFya01lbnU/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcbiAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG4gICAgICAgIGlmIChldmVudC50eXBlICE9PSAnY29udGV4dG1lbnUnICYmICFldmVudC5hbHRLZXkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBuYW1lID0gZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCA/IGV2ZW50LnRhcmdldC5jbG9zZXN0PEhUTUxFbGVtZW50PignW2RhdGEtamFydmlzLXBsYXllcl0nKSA6IG51bGw7XG4gICAgICAgIGlmICghbmFtZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBpZCA9IHRoaXMubmFtZXMuZ2V0KG5hbWUpO1xuICAgICAgICBpZiAoIWlkKSByZXR1cm47XG4gICAgICAgIHRoaXMub3Blbk1hcmtNZW51KGV2ZW50LCBuYW1lLCBpZCk7XG4gICAgfVxuXG4gICAgcnVuKHsgbGVhZ3VlLCBjb250ZXN0cyB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgdGhpcy5pbkxlYWd1ZSA9IGN1cnJlbnRQYWdlID09PSAnL2xlYWd1ZXMuaHRtbCc7XG4gICAgICAgIGlmICh0aGlzLmluTGVhZ3VlID8gIWxlYWd1ZSA6ICFjb250ZXN0cykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucm9vdFNlbGVjdG9yID0gdGhpcy5pbkxlYWd1ZSA/ICcubGVhZ3VlX3RhYmxlJyA6ICcjY29udGVzdHMgLnJpZ2h0X3BhcnQnO1xuICAgICAgICBjb25zdCBoYW5kbGVNYXJrTWVudSA9IChldmVudDogTW91c2VFdmVudCkgPT4gdGhpcy5oYW5kbGVNYXJrTWVudShldmVudCk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlTWFya01lbnUsIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGhhbmRsZU1hcmtNZW51LCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5rZXkgIT09ICdFc2NhcGUnIHx8ICF0aGlzLm1hcmtNZW51KSByZXR1cm47XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKCFldmVudC5rZXkgfHwgWydQbGF5ZXJNYXJrcycsICdQbGF5ZXJNYXJrQ29sb3JzJywgJ0ZyaWVuZExpc3QnLCAnRm9lTGlzdCddXG4gICAgICAgICAgICAgICAgLnNvbWUoa2V5ID0+IGV2ZW50LmtleSA9PT0gTFNfQ09ORklHX05BTUUgKyBrZXkpKSB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihtdXRhdGlvbnMgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5yb290U2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHJvb3QgIT09IHRoaXMucm9vdCB8fCAocm9vdCAmJiBtdXRhdGlvbnMuc29tZSgoeyB0YXJnZXQgfSkgPT4gcm9vdC5jb250YWlucyh0YXJnZXQpKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZSxcbiAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ3NvcnRpbmdfaWQnLCAnaWQtbWVtYmVyJywgJ2lkX2NvbnRlc3QnXVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBsc0dldCwgbHNTZXQgfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcblxuZXhwb3J0IHR5cGUgQ29udGVzdEtpbmQgPSAnZGFpbHknIHwgJ2V2ZW50JztcbmV4cG9ydCB0eXBlIENvbnRlc3RSYW5rID0gJ3RvcCcgfCAnbWluZSc7XG5cbmNvbnN0IENPTlRFU1RfS0lORFMgPSBbWydkYWlseScsICdEYWlseSddLCBbJ2V2ZW50JywgJ0V2ZW50J11dIGFzIGNvbnN0O1xuY29uc3QgQ09OVEVTVF9FVkVOVFMgPSBbWydhbnknLCAnQW55J10sIFsnY2JjJywgJ0NiQyddLCBbJ2NjYycsICdDQ0MnXSwgWydsYycsICdMQyddXSBhcyBjb25zdDtcbmNvbnN0IENPTlRFU1RfUkFOS1MgPSBbWyd0b3AnLCAnVG9wJ10sIFsnbWluZScsICdNeSByYW5rJ11dIGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBDb250ZXN0RXZlbnQgPSBFeGNsdWRlPCh0eXBlb2YgQ09OVEVTVF9FVkVOVFMpW251bWJlcl1bMF0sICdhbnknPjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRDb250ZXN0U2V0dGluZyhrZXk6IHN0cmluZyk6IHVua25vd24ge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBsc0dldChrZXkpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQ29udGVzdERlZmF1bHRzKCkge1xuICAgIGNvbnN0IGtpbmQ6IENvbnRlc3RLaW5kID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0S2luZCcpID09PSAnZGFpbHknID8gJ2RhaWx5JyA6ICdldmVudCc7XG4gICAgY29uc3Qgc2F2ZWRFdmVudCA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdEV2ZW50Jyk7XG4gICAgY29uc3QgZXZlbnQgPSBDT05URVNUX0VWRU5UUy5maW5kKChbdmFsdWVdKSA9PiB2YWx1ZSA9PT0gc2F2ZWRFdmVudCk/LlswXSA/PyAnYW55JztcbiAgICBjb25zdCByYW5rOiBDb250ZXN0UmFuayA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdFJhbmtTdGFydCcpID09PSAndG9wJyA/ICd0b3AnIDogJ21pbmUnO1xuICAgIHJldHVybiB7IGtpbmQsIGV2ZW50LCByYW5rIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQ29udGVzdFJhbmsoaWQ6IHN0cmluZywgZmFsbGJhY2s6IENvbnRlc3RSYW5rKTogQ29udGVzdFJhbmsge1xuICAgIGNvbnN0IHJhbmtzID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0UmFua3MnKTtcbiAgICBpZiAocmFua3MgJiYgdHlwZW9mIHJhbmtzID09PSAnb2JqZWN0JyAmJiBPYmplY3QuaGFzT3duKHJhbmtzLCBpZCkpIHtcbiAgICAgICAgY29uc3QgcmFuayA9IChyYW5rcyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbaWRdO1xuICAgICAgICBpZiAocmFuayA9PT0gJ21pbmUnIHx8IHJhbmsgPT09ICd0b3AnKSByZXR1cm4gcmFuaztcbiAgICB9XG5cbiAgICAvLyBPbGRlciB2ZXJzaW9ucyBzdG9yZWQgYSByYW5rIG92ZXJyaWRlIGZvciBhIHNpbmdsZSBjb250ZXN0LlxuICAgIGNvbnN0IHNhdmVkID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0UGlubmVkUmFuaycpO1xuICAgIGlmIChzYXZlZCAmJiB0eXBlb2Ygc2F2ZWQgPT09ICdvYmplY3QnICYmICdpZCcgaW4gc2F2ZWQgJiYgU3RyaW5nKHNhdmVkLmlkKSA9PT0gaWQgJiYgJ3JhbmsnIGluIHNhdmVkKSB7XG4gICAgICAgIGlmIChzYXZlZC5yYW5rID09PSAnbWluZScgfHwgc2F2ZWQucmFuayA9PT0gJ3RvcCcpIHJldHVybiBzYXZlZC5yYW5rO1xuICAgIH1cbiAgICByZXR1cm4gZmFsbGJhY2s7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYXZlQ29udGVzdFJhbmsoaWQ6IHN0cmluZywgcmFuazogQ29udGVzdFJhbmspIHtcbiAgICBjb25zdCBzYXZlZCA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdFJhbmtzJyk7XG4gICAgY29uc3QgcmFua3MgPSBzYXZlZCAmJiB0eXBlb2Ygc2F2ZWQgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHNhdmVkKSA/IHNhdmVkIDoge307XG4gICAgbHNTZXQoJ0NvbnRlc3RSYW5rcycsIHsgLi4ucmFua3MsIFtpZF06IHJhbmsgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlUmFua0Nob2ljZShsYWJlbDogc3RyaW5nLCBzZWxlY3Q6IChyYW5rOiBDb250ZXN0UmFuaykgPT4gdm9pZCkge1xuICAgIHJldHVybiBtYWtlQ2hvaWNlKGxhYmVsLCBDT05URVNUX1JBTktTLCBzZWxlY3QpO1xufVxuXG5mdW5jdGlvbiBtYWtlQ2hvaWNlPFQgZXh0ZW5kcyBzdHJpbmc+KGxhYmVsOiBzdHJpbmcsIG9wdGlvbnM6IFJlYWRvbmx5QXJyYXk8cmVhZG9ubHkgW1QsIHN0cmluZ10+LCBzZWxlY3Q6ICh2YWx1ZTogVCkgPT4gdm9pZCkge1xuICAgIGNvbnN0IGdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGdyb3VwLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY29udGVzdC1jaG9pY2UnO1xuICAgIGdyb3VwLnNldEF0dHJpYnV0ZSgncm9sZScsICdncm91cCcpO1xuICAgIGdyb3VwLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGxhYmVsKTtcbiAgICBncm91cC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZlbnQgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpO1xuICAgIGZvciAoY29uc3QgW3ZhbHVlLCB0ZXh0XSBvZiBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICBidXR0b24uZGF0YXNldC5jb250ZXN0Q2hvaWNlID0gdmFsdWU7XG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgc2VsZWN0KHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGdyb3VwLmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgfVxuICAgIHJldHVybiBncm91cDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdENvbnRlc3RDaG9pY2UoZ3JvdXA6IEhUTUxFbGVtZW50LCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgZm9yIChjb25zdCBidXR0b24gb2YgZ3JvdXAucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJykpIHtcbiAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgU3RyaW5nKGJ1dHRvbi5kYXRhc2V0LmNvbnRlc3RDaG9pY2UgPT09IHZhbHVlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbENvbnRlc3RTZXR0aW5ncygpIHtcbiAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmdbcmVsPVwiSkFSVklTX2NvbnRlc3RTdGFydFwiXSc7XG4gICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIGlmICghY2FyZCB8fCBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXMtY29udGVzdC1zZXR0aW5ncycpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZmllbGRzZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmaWVsZHNldCcpO1xuICAgICAgICBmaWVsZHNldC5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3Qtc2V0dGluZ3MnO1xuICAgICAgICBmaWVsZHNldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnQ29udGVzdCBzdGFydHVwIGRlZmF1bHRzJyk7XG4gICAgICAgIGNvbnN0IHNhdmUgPSAoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGdyb3VwOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsc1NldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGdyb3VwLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB0aGUgY29udGVzdCBkZWZhdWx0OicsIGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBldmVudExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGV2ZW50TGFiZWwuaW5uZXJIVE1MID0gc2V0dGluZ0hlbHAoJ0V2ZW50IHR5cGUnLCAnUHJlZmVyIENiQyAoQ3VtYmFjayBDb250ZXN0KSwgQ0NDIChDcmF6eSBDdW1iYWNrIENvbnRlc3QpLCBvciBMQyAoTGVnZW5kYXJ5IENvbnRlc3QpIHdoZW4gYWN0aXZlLiBBbnkgb3BlbnMgdGhlIGJvdHRvbSBhY3RpdmUgY29udGVzdCwgYXMgZG9lcyBhbiB1bmF2YWlsYWJsZSBldmVudCB0eXBlLicpO1xuICAgICAgICBjb25zdCBldmVudHMgPSBtYWtlQ2hvaWNlKCdFdmVudCB0eXBlJywgQ09OVEVTVF9FVkVOVFMsIHZhbHVlID0+IHNhdmUoJ0NvbnRlc3RFdmVudCcsIHZhbHVlLCBldmVudHMpKTtcbiAgICAgICAgY29uc3Qgc2hvd0V2ZW50cyA9IChraW5kOiBDb250ZXN0S2luZCkgPT4gZXZlbnRMYWJlbC5oaWRkZW4gPSBldmVudHMuaGlkZGVuID0ga2luZCA9PT0gJ2RhaWx5JztcbiAgICAgICAgY29uc3Qga2luZHMgPSBtYWtlQ2hvaWNlKCdQcmVmZXJyZWQgY29udGVzdCcsIENPTlRFU1RfS0lORFMsIHZhbHVlID0+IHtcbiAgICAgICAgICAgIGlmIChzYXZlKCdDb250ZXN0S2luZCcsIHZhbHVlLCBraW5kcykpIHNob3dFdmVudHModmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcmFua3MgPSBtYWtlUmFua0Nob2ljZSgnRGVmYXVsdCBsZWFkZXJib2FyZCBwb3NpdGlvbicsIHZhbHVlID0+IHNhdmUoJ0NvbnRlc3RSYW5rU3RhcnQnLCB2YWx1ZSwgcmFua3MpKTtcbiAgICAgICAgY29uc3QgZGVmYXVsdHMgPSByZWFkQ29udGVzdERlZmF1bHRzKCk7XG4gICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2Uoa2luZHMsIGRlZmF1bHRzLmtpbmQpO1xuICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGV2ZW50cywgZGVmYXVsdHMuZXZlbnQpO1xuICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKHJhbmtzLCBkZWZhdWx0cy5yYW5rKTtcbiAgICAgICAgc2hvd0V2ZW50cyhkZWZhdWx0cy5raW5kKTtcblxuICAgICAgICBjb25zdCBraW5kTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAga2luZExhYmVsLmlubmVySFRNTCA9IHNldHRpbmdIZWxwKCdQcmVmZXJyZWQgY29udGVzdCcsICdEYWlseSBvcGVucyB0aGUgZmlyc3QgYWN0aXZlIGRhaWx5IGNvbnRlc3QuIEV2ZW50IGNhbiBwcmVmZXIgYW4gZXZlbnQgdHlwZSBvciBmb2xsb3cgdGhlIGdhbWUgYW5kIG9wZW4gdGhlIGJvdHRvbSBhY3RpdmUgY29udGVzdC4nKTtcbiAgICAgICAgY29uc3QgcmFua0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHJhbmtMYWJlbC5pbm5lckhUTUwgPSBzZXR0aW5nSGVscCgnTGVhZGVyYm9hcmQgc3RhcnQnLCAnT3BlbiBhdCB0aGUgdG9wIG9yIGF0IHlvdXIgcmFuay4gQSBwb3NpdGlvbiBjaG9zZW4gb24gYSBjb250ZXN0IGNhcmQgdGFrZXMgcHJpb3JpdHkuJyk7XG4gICAgICAgIGZpZWxkc2V0LmFwcGVuZChraW5kTGFiZWwsIGtpbmRzLCBldmVudExhYmVsLCBldmVudHMsIHJhbmtMYWJlbCwgcmFua3MpO1xuICAgICAgICBjb25zdCByZWZyZXNoRW5hYmxlZCA9ICgpID0+IGZpZWxkc2V0LmRpc2FibGVkID0gIWNhcmQuY2xhc3NMaXN0LmNvbnRhaW5zKCdlbmFibGVkJyk7XG4gICAgICAgIHJlZnJlc2hFbmFibGVkKCk7XG4gICAgICAgIG5ldyBNdXRhdGlvbk9ic2VydmVyKHJlZnJlc2hFbmFibGVkKS5vYnNlcnZlKGNhcmQsIHsgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10gfSk7XG4gICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoZmllbGRzZXQpO1xuICAgIH0pO1xufVxuIiwgImludGVyZmFjZSBDb250ZXN0U2hvcnRjdXQge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY2F0ZWdvcnk6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgcmFuazogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9zaXRpb25Db250ZXN0U2hvcnRjdXRzKGNhbnZhczogSFRNTEVsZW1lbnQsIGJhcjogSFRNTEVsZW1lbnQpIHtcbiAgICBjb25zdCBjbG9zZSA9IGNhbnZhcy5wYXJlbnRFbGVtZW50Py5xdWVyeVNlbGVjdG9yKCc6c2NvcGUgPiAuY2xvc2VfY3Jvc3MnKTtcbiAgICBpZiAoIWNsb3NlKSByZXR1cm47XG5cbiAgICBjb25zdCBmcmFtZSA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBjcm9zcyA9IGNsb3NlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHNjYWxlWCA9IGZyYW1lLndpZHRoIC8gY2FudmFzLm9mZnNldFdpZHRoO1xuICAgIGNvbnN0IHNjYWxlWSA9IGZyYW1lLmhlaWdodCAvIGNhbnZhcy5vZmZzZXRIZWlnaHQ7XG4gICAgaWYgKCFzY2FsZVggfHwgIXNjYWxlWSB8fCAhY3Jvc3Mud2lkdGgpIHJldHVybjtcblxuICAgIGJhci5zdHlsZS5pbnNldElubGluZUVuZCA9IGAke01hdGguY2VpbCgoZnJhbWUucmlnaHQgLSBjcm9zcy5sZWZ0KSAvIHNjYWxlWCArIDgpfXB4YDtcbiAgICBiYXIuc3R5bGUuaW5zZXRCbG9ja1N0YXJ0ID0gYCR7TWF0aC5yb3VuZCgoY3Jvc3MudG9wICsgY3Jvc3MuaGVpZ2h0IC8gMiAtIGZyYW1lLnRvcCkgLyBzY2FsZVkpfXB4YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckNvbnRlc3RTaG9ydGN1dHMoXG4gICAgY2FudmFzOiBIVE1MRWxlbWVudCxcbiAgICBjb250ZXN0czogQ29udGVzdFNob3J0Y3V0W10sXG4gICAgc2VsZWN0ZWQ6IHN0cmluZyB8IG51bGwsXG4gICAgc2VsZWN0OiAoaWQ6IHN0cmluZykgPT4gdm9pZFxuKSB7XG4gICAgbGV0IGJhciA9IGNhbnZhcy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cycpO1xuICAgIGlmICghY29udGVzdHMubGVuZ3RoKSB7XG4gICAgICAgIGJhcj8ucmVtb3ZlKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFiYXIpIHtcbiAgICAgICAgYmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJhci5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzJztcbiAgICAgICAgYmFyLnNldEF0dHJpYnV0ZSgncm9sZScsICdncm91cCcpO1xuICAgICAgICBiYXIuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ0FjdGl2ZSBjb250ZXN0cycpO1xuICAgICAgICBiYXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KSkgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgaWQgPSBldmVudC50YXJnZXQuY2xvc2VzdDxIVE1MQnV0dG9uRWxlbWVudD4oJ2J1dHRvbltkYXRhLWNvbnRlc3QtaWRdJyk/LmRhdGFzZXQuY29udGVzdElkO1xuICAgICAgICAgICAgaWYgKGlkKSBzZWxlY3QoaWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgY2FudmFzLnByZXBlbmQoYmFyKTtcbiAgICAgICAgcG9zaXRpb25Db250ZXN0U2hvcnRjdXRzKGNhbnZhcywgYmFyKTtcbiAgICB9XG5cbiAgICBjb25zdCBidXR0b25zID0gbmV3IE1hcChBcnJheS5mcm9tKGJhci5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKSwgYnV0dG9uID0+IFtidXR0b24uZGF0YXNldC5jb250ZXN0SWQsIGJ1dHRvbl0pKTtcbiAgICBjb25zdCBjYXRlZ29yaWVzID0gY29udGVzdHMubWFwKGNvbnRlc3QgPT4gY29udGVzdC5jYXRlZ29yeSk7XG4gICAgZm9yIChjb25zdCBbaW5kZXgsIHsgaWQsIGNhdGVnb3J5LCBuYW1lLCByYW5rIH1dIG9mIGNvbnRlc3RzLmVudHJpZXMoKSkge1xuICAgICAgICBsZXQgYnV0dG9uID0gYnV0dG9ucy5nZXQoaWQpO1xuICAgICAgICBpZiAoIWJ1dHRvbikge1xuICAgICAgICAgICAgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgYnV0dG9uLmRhdGFzZXQuY29udGVzdElkID0gaWQ7XG4gICAgICAgICAgICBidXR0b24uYXBwZW5kKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3Ryb25nJykpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR5cGUgPSBjYXRlZ29yaWVzLmluZGV4T2YoY2F0ZWdvcnkpID09PSBjYXRlZ29yaWVzLmxhc3RJbmRleE9mKGNhdGVnb3J5KSA/XG4gICAgICAgICAgICBjYXRlZ29yeSA6IGAke2NhdGVnb3J5fSAke2NhdGVnb3JpZXMuc2xpY2UoMCwgaW5kZXggKyAxKS5maWx0ZXIodmFsdWUgPT4gdmFsdWUgPT09IGNhdGVnb3J5KS5sZW5ndGh9YDtcbiAgICAgICAgY29uc3QgW2xhYmVsLCBwbGFjZW1lbnRdID0gQXJyYXkuZnJvbShidXR0b24uY2hpbGRyZW4pO1xuICAgICAgICBpZiAobGFiZWwudGV4dENvbnRlbnQgIT09IHR5cGUpIGxhYmVsLnRleHRDb250ZW50ID0gdHlwZTtcbiAgICAgICAgaWYgKHBsYWNlbWVudC50ZXh0Q29udGVudCAhPT0gKHJhbmsgfHwgJ+KAkycpKSBwbGFjZW1lbnQudGV4dENvbnRlbnQgPSByYW5rIHx8ICfigJMnO1xuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGAke3R5cGV9IMK3ICR7bmFtZX0gwrcgJHtyYW5rID8gYFJhbmsgJHtyYW5rfWAgOiAnUmFuayB1bmF2YWlsYWJsZSd9YDtcbiAgICAgICAgaWYgKGJ1dHRvbi50aXRsZSAhPT0gZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGJ1dHRvbi50aXRsZSA9IGRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGRlc2NyaXB0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcmVzc2VkID0gU3RyaW5nKGlkID09PSBzZWxlY3RlZCk7XG4gICAgICAgIGlmIChidXR0b24uZ2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnKSAhPT0gcHJlc3NlZCkgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgcHJlc3NlZCk7XG5cbiAgICAgICAgaWYgKGJ1dHRvbiAhPT0gYmFyLmNoaWxkcmVuW2luZGV4XSkgYmFyLmluc2VydEJlZm9yZShidXR0b24sIGJhci5jaGlsZHJlbltpbmRleF0gPz8gbnVsbCk7XG4gICAgICAgIGJ1dHRvbnMuZGVsZXRlKGlkKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBidXR0b24gb2YgYnV0dG9ucy52YWx1ZXMoKSkgYnV0dG9uLnJlbW92ZSgpO1xufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlLCB0eXBlIE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgJCwgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCwgbHNSbSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgbWFrZVJhbmtDaG9pY2UsIHJlYWRDb250ZXN0RGVmYXVsdHMsIHJlYWRDb250ZXN0UmFuaywgcmVhZENvbnRlc3RTZXR0aW5nLCBzYXZlQ29udGVzdFJhbmssIHNlbGVjdENvbnRlc3RDaG9pY2UsIHR5cGUgQ29udGVzdEV2ZW50LCB0eXBlIENvbnRlc3RLaW5kIH0gZnJvbSAnLi9jb250ZXN0UHJlZmVyZW5jZXMnO1xuaW1wb3J0IHsgcG9zaXRpb25Db250ZXN0U2hvcnRjdXRzLCByZW5kZXJDb250ZXN0U2hvcnRjdXRzIH0gZnJvbSAnLi9jb250ZXN0U2hvcnRjdXRzJztcblxudHlwZSBDb250ZXN0Q2F0ZWdvcnkgPSBDb250ZXN0S2luZCB8IENvbnRlc3RFdmVudDtcbmNvbnN0IENPTlRFU1RfU0hPUlRfTEFCRUxTOiBSZWNvcmQ8Q29udGVzdENhdGVnb3J5LCBzdHJpbmc+ID0ge1xuICAgIGRhaWx5OiAnREMnLCBjYmM6ICdDYkMnLCBjY2M6ICdDQ0MnLCBsYzogJ0xDJywgZXZlbnQ6ICdFdmVudCdcbn07XG5jb25zdCBDT05URVNUX1RJVExFX1NFTEVDVE9SID0gJy5jb250ZXN0X3RpdGxlLCAuY29udGVzdF9uYW1lLCBoMywgaDQsIGg1JztcbmNvbnN0IHByb3RlY3RlZFBhbmVzID0gbmV3IFNldDxIVE1MRWxlbWVudD4oKTtcbmxldCByZXN0b3JlU2Nyb2xsSW50b1ZpZXc6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gZ3VhcmRTY3JvbGxJbnRvVmlldyhwYW5lOiBIVE1MRWxlbWVudCkge1xuICAgIGlmICghcHJvdGVjdGVkUGFuZXMuc2l6ZSkge1xuICAgICAgICBjb25zdCBwcmV2aW91cyA9IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3O1xuICAgICAgICBjb25zdCBndWFyZGVkID0gZnVuY3Rpb24gKHRoaXM6IEVsZW1lbnQsIG9wdGlvbnM/OiBib29sZWFuIHwgU2Nyb2xsSW50b1ZpZXdPcHRpb25zKSB7XG4gICAgICAgICAgICAvLyBzY3JvbGxJbnRvVmlldyBjYW4gbW92ZSBhIHBhbmUgd2l0aG91dCBjYWxsaW5nIGl0cyBzY3JvbGwgbWV0aG9kcy5cbiAgICAgICAgICAgIGlmIChBcnJheS5mcm9tKHByb3RlY3RlZFBhbmVzKS5zb21lKHNjcm9sbGVyID0+IHNjcm9sbGVyLmNvbnRhaW5zKHRoaXMpKSkgcmV0dXJuO1xuICAgICAgICAgICAgcHJldmlvdXMuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgfTtcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXcgPSBndWFyZGVkO1xuICAgICAgICByZXN0b3JlU2Nyb2xsSW50b1ZpZXcgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXcgPT09IGd1YXJkZWQpIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3ID0gcHJldmlvdXM7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHByb3RlY3RlZFBhbmVzLmFkZChwYW5lKTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIHByb3RlY3RlZFBhbmVzLmRlbGV0ZShwYW5lKTtcbiAgICAgICAgaWYgKHByb3RlY3RlZFBhbmVzLnNpemUpIHJldHVybjtcbiAgICAgICAgcmVzdG9yZVNjcm9sbEludG9WaWV3Py4oKTtcbiAgICAgICAgcmVzdG9yZVNjcm9sbEludG9WaWV3ID0gdW5kZWZpbmVkO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIGdldENvbnRlc3RDYXRlZ29yeShjYXRlZ29yeTogc3RyaW5nIHwgdW5kZWZpbmVkKTogQ29udGVzdENhdGVnb3J5IHwgbnVsbCB7XG4gICAgc3dpdGNoIChjYXRlZ29yeT8udHJpbSgpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvWy0gXSsvZywgJ18nKSkge1xuICAgICAgICBjYXNlICdkYWlseSc6XG4gICAgICAgIGNhc2UgJ2RhaWx5X2NvbnRlc3QnOiByZXR1cm4gJ2RhaWx5JztcbiAgICAgICAgY2FzZSAnY3VtYmFjayc6XG4gICAgICAgIGNhc2UgJ2N1bWJhY2tfY29udGVzdCc6XG4gICAgICAgIGNhc2UgJ2NiYyc6IHJldHVybiAnY2JjJztcbiAgICAgICAgY2FzZSAnY3JhenlfY3VtYmFjayc6XG4gICAgICAgIGNhc2UgJ2NyYXp5X2N1bWJhY2tfY29udGVzdCc6XG4gICAgICAgIGNhc2UgJ2NjYmMnOlxuICAgICAgICBjYXNlICdjY2MnOiByZXR1cm4gJ2NjYyc7XG4gICAgICAgIGNhc2UgJ2xlZ2VuZGFyeSc6XG4gICAgICAgIGNhc2UgJ2xlZ2VuZGFyeV9jb250ZXN0JzpcbiAgICAgICAgY2FzZSAnbGMnOiByZXR1cm4gJ2xjJztcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuIGNhdGVnb3J5ID8gJ2V2ZW50JyA6IG51bGw7XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgQ29udGVzdENhcmQge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY2FyZDogSFRNTEVsZW1lbnQ7XG4gICAgaGVhZGVyOiBIVE1MRWxlbWVudDtcbiAgICB0aXRsZTogSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGxhYmVsOiBzdHJpbmc7XG4gICAgY2F0ZWdvcnk6IENvbnRlc3RDYXRlZ29yeSB8IG51bGw7XG4gICAgZW5kZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcm1Db250ZXN0U3RhcnR1cEd1YXJkKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZSAhPT0gJy9hY3Rpdml0aWVzLmh0bWwnIHx8IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKS5nZXQoJ3RhYicpICE9PSAnY29udGVzdHMnKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBpZiAoSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnSEhQbHVzUGx1c0NvbmZpZycpID8/ICdudWxsJyk/LkpBUlZJU19jb250ZXN0U3RhcnQgPT09IGZhbHNlKSByZXR1cm47XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBLZWVwIGJvdGggcGFuZXMgb3V0IG9mIHZpZXcgdW50aWwgdGhlIGNob3NlbiBjb250ZXN0IGFuZCBpdHMgbGVhZGVyYm9hcmQgYXJlIHBvc2l0aW9uZWQuXG4gICAgY29uc3QgZ3VhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIGd1YXJkLmlkID0gJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnO1xuICAgIGd1YXJkLnRleHRDb250ZW50ID0gYFxuICAgICAgICAjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEsXG4gICAgICAgICNjb250ZXN0cyAucmlnaHRfcGFydCB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICAgICAgfVxuICAgIGA7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgIGlmICghZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSByZXR1cm47XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChndWFyZCk7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9KTtcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ3VhcmQpO1xuICAgIGVsc2Ugb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwgeyBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICBndWFyZC5yZW1vdmUoKTtcbiAgICB9LCA0MDAwKTtcbn1cblxuZXhwb3J0IGNsYXNzIENvbnRlc3RTdGFydCBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHByZWZlcmVuY2UgPSAnJztcbiAgICBwcml2YXRlIHN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBkZWZhdWx0cyA9IHJlYWRDb250ZXN0RGVmYXVsdHMoKTtcbiAgICBwcml2YXRlIGxpc3Q6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByaWdodDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJlc3RvcmluZ0NhcmQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByZXBvc2l0aW9uOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHN0b3BKdW1wOiAoKGZpbmlzaD86IGJvb2xlYW4pID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdG9wU3dpdGNoU2Nyb2xsID0gdHJ1ZTtcbiAgICBwcml2YXRlIHN3aXRjaFNjcm9sbDogeyByZXN0b3JlOiAoKSA9PiB2b2lkOyBzdG9wOiAoKSA9PiB2b2lkIH0gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIG9ic2VydmVyOiBNdXRhdGlvbk9ic2VydmVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSB0aXRsZVNpemVzOiBSZXNpemVPYnNlcnZlciB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgdGl0bGVMYWJlbHMgPSBuZXcgTWFwPEhUTUxFbGVtZW50LCBIVE1MRWxlbWVudD4oKTtcbiAgICBwcml2YXRlIGxpc3RlbmVyczogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdjb250ZXN0U3RhcnQnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiQ29udGVzdCBzdGFydHVwXCIsIFwiT3BlbiB0aGUgcHJlZmVycmVkIGNvbnRlc3QgYW5kIHJhbmsgb24gbG9hZCwgYW5kIHN3aXRjaCBhY3RpdmUgY29udGVzdHMgZnJvbSB0aGUgaGVhZGVyLiBBIHN0YXJyZWQgY29udGVzdCB0YWtlcyBwcmlvcml0eSBvbiBsb2FkLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ25vU3dpdGNoU2Nyb2xsJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoJ1N0b3Agc2Nyb2xsaW5nIG9uIGNvbnRlc3Qgc3dpdGNoZXMnLCAnS2VlcCB0aGUgY29udGVzdCBsaXN0IGluIHBsYWNlIHdoZW4geW91IHN3aXRjaCBieSBjbGlja2luZyBhIGNhcmQuIFRoZSBsZWFkZXJib2FyZCBvcGVucyBhdCB5b3VyIHByZWZlcnJlZCBwb3NpdGlvbiwgYW5kIHlvdSBjYW4gc3RpbGwgc2Nyb2xsIGJ5IGhhbmQuJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7IG5hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYSB9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZSA9PT0gJy9hY3Rpdml0aWVzLmh0bWwnO1xuICAgIH1cblxuICAgIGdldENvbnRlc3RzKGxpc3Q6IEhUTUxFbGVtZW50LCBmaW5pc2hlZDogUmVhZG9ubHlTZXQ8c3RyaW5nPik6IENvbnRlc3RDYXJkW10ge1xuICAgICAgICBjb25zdCBhY3RpdmUgPSBuZXcgTWFwKE9iamVjdC52YWx1ZXMod2luZG93LmNvbnRlc3RzPy5hY3RpdmUgfHwge30pXG4gICAgICAgICAgICAuZmlsdGVyKGNvbnRlc3QgPT4gY29udGVzdD8uaWRfY29udGVzdCAhPSBudWxsKVxuICAgICAgICAgICAgLm1hcChjb250ZXN0ID0+IFtTdHJpbmcoY29udGVzdC5pZF9jb250ZXN0KSwgY29udGVzdF0pKTtcblxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShsaXN0LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcuY29udGVzdFtpZF9jb250ZXN0XScpKS5mbGF0TWFwKGNhcmQgPT4ge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBjYXJkLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKCFpZCkgcmV0dXJuIFtdO1xuICAgICAgICAgICAgY29uc3QgY29udGVzdCA9IGFjdGl2ZS5nZXQoaWQpO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVyID0gY2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmNvbnRlc3RfaGVhZGVyJyk7XG4gICAgICAgICAgICBjb25zdCBlbmRlZCA9IGZpbmlzaGVkLmhhcyhpZCk7XG4gICAgICAgICAgICBpZiAoIWhlYWRlciB8fCAoIWVuZGVkICYmICFjb250ZXN0ICYmICFoZWFkZXIubWF0Y2hlcygnLmluX3Byb2dyZXNzJykpKSByZXR1cm4gW107XG5cbiAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KENPTlRFU1RfVElUTEVfU0VMRUNUT1IpO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHRpdGxlICYmIEFycmF5LmZyb20odGl0bGUuY2hpbGROb2RlcylcbiAgICAgICAgICAgICAgICAuZmlsdGVyKG5vZGUgPT4gIShub2RlIGluc3RhbmNlb2YgRWxlbWVudCkgfHwgIW5vZGUubWF0Y2hlcygnLmphcnZpcy1jb250ZXN0LXBpbiwgLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKSlcbiAgICAgICAgICAgICAgICAubWFwKG5vZGUgPT4gbm9kZS50ZXh0Q29udGVudCkuam9pbignJykudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBnZXRDb250ZXN0Q2F0ZWdvcnkoY29udGVzdD8uY2F0ZWdvcnlfdHlwZSk7XG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICBpZCwgY2FyZCwgaGVhZGVyLCB0aXRsZSwgZW5kZWQsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgbGFiZWw6IFN0cmluZyhuYW1lIHx8IGNvbnRlc3Q/Lm5hbWUgfHwgY29udGVzdD8udGl0bGUgfHxcbiAgICAgICAgICAgICAgICAgICAgKGNhdGVnb3J5ID09PSAnZGFpbHknID8gJ0RhaWx5IGNvbnRlc3QnIDogJ0NvbnRlc3QnKSkudHJpbSgpXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0VGFyZ2V0KGNvbnRlc3RzOiBDb250ZXN0Q2FyZFtdKSB7XG4gICAgICAgIGlmICh0aGlzLnByZWZlcmVuY2UpIHJldHVybiBjb250ZXN0cy5maW5kKGNvbnRlc3QgPT4gY29udGVzdC5pZCA9PT0gdGhpcy5wcmVmZXJlbmNlKTtcblxuICAgICAgICBpZiAodGhpcy5kZWZhdWx0cy5raW5kID09PSAnZXZlbnQnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kZWZhdWx0cy5ldmVudCAhPT0gJ2FueScpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IFsuLi5jb250ZXN0c10ucmV2ZXJzZSgpLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmNhdGVnb3J5ID09PSB0aGlzLmRlZmF1bHRzLmV2ZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykgcmV0dXJuIGV2ZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbnRlc3RzLmF0KC0xKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29udGVzdHMuZmluZChjb250ZXN0ID0+IGNvbnRlc3QuY2F0ZWdvcnkgPT09ICdkYWlseScpID8/XG4gICAgICAgICAgICBjb250ZXN0cy5maW5kKGNvbnRlc3QgPT4gY29udGVzdC5jYXRlZ29yeSA9PT0gbnVsbCkgPz8gY29udGVzdHNbMF07XG4gICAgfVxuXG4gICAgY2xlYXJFeHBpcmVkUGluKGxpc3Q6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdENhcmRbXSwgZmluaXNoZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz4pIHtcbiAgICAgICAgaWYgKCF0aGlzLnByZWZlcmVuY2UgfHwgY29udGVzdHMuc29tZSgoeyBpZCB9KSA9PiBpZCA9PT0gdGhpcy5wcmVmZXJlbmNlKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IHdpbmRvdy5jb250ZXN0cz8uYWN0aXZlO1xuICAgICAgICBjb25zdCBtaXNzaW5nID0gZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyAmJiBsaXN0LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZXN0X2hlYWRlcicpICYmXG4gICAgICAgICAgICBhY3RpdmUgJiYgIU9iamVjdC52YWx1ZXMoYWN0aXZlKS5zb21lKGNvbnRlc3QgPT4gU3RyaW5nKGNvbnRlc3Q/LmlkX2NvbnRlc3QpID09PSB0aGlzLnByZWZlcmVuY2UpO1xuICAgICAgICBpZiAoIWZpbmlzaGVkLmhhcyh0aGlzLnByZWZlcmVuY2UpICYmICFtaXNzaW5nKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZXhwaXJlZElkID0gdGhpcy5wcmVmZXJlbmNlO1xuICAgICAgICB0aGlzLnByZWZlcmVuY2UgPSAnJztcbiAgICAgICAgdGhpcy5zdG9wSnVtcD8uKGZhbHNlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChTdHJpbmcobHNHZXQoJ0NvbnRlc3RTdGFydElkJykpID09PSBleHBpcmVkSWQpIGxzUm0oJ0NvbnRlc3RTdGFydElkJyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IGNsZWFyIHRoZSBleHBpcmVkIGNvbnRlc3QgcHJlZmVyZW5jZTonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FyZENvbnRyb2xzKGxpc3Q6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdENhcmRbXSkge1xuICAgICAgICBjb25zdCBob3N0cyA9IG5ldyBTZXQoY29udGVzdHMubWFwKCh7IHRpdGxlLCBoZWFkZXIgfSkgPT4gdGl0bGUgfHwgaGVhZGVyKSk7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbCBvZiBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1waW4sIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JykpIHtcbiAgICAgICAgICAgIGlmICghY29udHJvbC5wYXJlbnRFbGVtZW50IHx8ICFob3N0cy5oYXMoY29udHJvbC5wYXJlbnRFbGVtZW50KSkgY29udHJvbC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFt0aXRsZSwgdGV4dF0gb2YgdGhpcy50aXRsZUxhYmVscykge1xuICAgICAgICAgICAgaWYgKGhvc3RzLmhhcyh0aXRsZSkgJiYgdGV4dC5wYXJlbnRFbGVtZW50ID09PSB0aXRsZSkgY29udGludWU7XG4gICAgICAgICAgICB0aGlzLnRpdGxlU2l6ZXM/LnVub2JzZXJ2ZSh0ZXh0KTtcbiAgICAgICAgICAgIGlmICh0ZXh0LnBhcmVudEVsZW1lbnQgPT09IHRpdGxlKSB0ZXh0LnJlcGxhY2VXaXRoKC4uLnRleHQuY2hpbGROb2Rlcyk7XG4gICAgICAgICAgICB0aXRsZS5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC10aXRsZScsICdqYXJ2aXMtY29udGVzdC10aXRsZS1zdGFja2VkJyk7XG4gICAgICAgICAgICB0aGlzLnRpdGxlTGFiZWxzLmRlbGV0ZSh0aXRsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IHsgaWQsIHRpdGxlLCBoZWFkZXIsIGxhYmVsIH0gb2YgY29udGVzdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGhvc3QgPSB0aXRsZSB8fCBoZWFkZXI7XG4gICAgICAgICAgICBsZXQgcGluID0gaG9zdC5xdWVyeVNlbGVjdG9yPEhUTUxCdXR0b25FbGVtZW50PignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXBpbicpO1xuICAgICAgICAgICAgaWYgKCFwaW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3QtcGluJztcbiAgICAgICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXN0SWQgPSBidXR0b24uY2xvc2VzdCgnLmNvbnRlc3RbaWRfY29udGVzdF0nKT8uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29udGVzdElkKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMucHJlZmVyZW5jZSA9PT0gY29udGVzdElkID8gJycgOiBjb250ZXN0SWQ7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCkgbHNTZXQoJ0NvbnRlc3RTdGFydElkJywgbmV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGxzUm0oJ0NvbnRlc3RTdGFydElkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByZWZlcmVuY2UgPSBuZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9wSnVtcD8uKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGNvbnRlc3QgcHJlZmVyZW5jZTonLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHBpbiA9IGhvc3QuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBpbm5lZCA9IHRoaXMucHJlZmVyZW5jZSA9PT0gaWQ7XG4gICAgICAgICAgICBwaW4uc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBTdHJpbmcocGlubmVkKSk7XG4gICAgICAgICAgICBwaW4uc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgcGlubmVkID8gYFVucGluICR7bGFiZWx9YCA6IGBQaW4gJHtsYWJlbH0gdG8gb3BlbiBvbiByZWxvYWRgKTtcbiAgICAgICAgICAgIHBpbi50aXRsZSA9IHBpbm5lZCA/ICdQaW5uZWQuIENsaWNrIHRvIHVucGluIHRoaXMgY29udGVzdC4nIDogJ09wZW4gdGhpcyBjb250ZXN0IHdoZW4gdGhlIHBhZ2UgcmVsb2Fkcyc7XG5cbiAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IGhvc3QucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJzpzY29wZSA+IC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0Jyk7XG4gICAgICAgICAgICBpZiAoIXBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hvaWNlID0gbWFrZVJhbmtDaG9pY2UoJ0NvbnRlc3QgbGVhZGVyYm9hcmQgc3RhcnQnLCByYW5rID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVzdElkID0gY2hvaWNlLmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRlc3RJZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUNvbnRlc3RSYW5rKGNvbnRlc3RJZCwgcmFuayk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGNob2ljZSwgcmFuayk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGxlYWRlcmJvYXJkIHBvc2l0aW9uOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmlnaHQgJiYgdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCB0aGlzLnJpZ2h0KSA9PT0gY29udGVzdElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3BKdW1wPy4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb25Td2l0Y2gobGlzdCwgdGhpcy5yaWdodCwgY29udGVzdElkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNob2ljZS5jbGFzc0xpc3QuYWRkKCdqYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgY2hvaWNlLnRpdGxlID0gJ0xlYWRlcmJvYXJkIHBvc2l0aW9uIGZvciB0aGlzIGNvbnRlc3QnO1xuICAgICAgICAgICAgICAgIHBpbi5hZnRlcihjaG9pY2UpO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gY2hvaWNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShwb3NpdGlvbiwgcmVhZENvbnRlc3RSYW5rKGlkLCB0aGlzLmRlZmF1bHRzLnJhbmspKTtcblxuICAgICAgICAgICAgaWYgKCF0aXRsZSkgY29udGludWU7XG4gICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMudGl0bGVMYWJlbHMuZ2V0KHRpdGxlKTtcbiAgICAgICAgICAgIGlmICghdGV4dCkge1xuICAgICAgICAgICAgICAgIHRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICAgICAgdGV4dC5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3QtdGl0bGUtbGFiZWwnO1xuICAgICAgICAgICAgICAgIHRleHQuYXBwZW5kKC4uLkFycmF5LmZyb20odGl0bGUuY2hpbGROb2RlcykuZmlsdGVyKG5vZGUgPT4gbm9kZSAhPT0gcGluICYmIG5vZGUgIT09IHBvc2l0aW9uKSk7XG4gICAgICAgICAgICAgICAgdGl0bGUucHJlcGVuZCh0ZXh0KTtcbiAgICAgICAgICAgICAgICB0aXRsZS5jbGFzc0xpc3QuYWRkKCdqYXJ2aXMtY29udGVzdC10aXRsZScpO1xuICAgICAgICAgICAgICAgIHRoaXMudGl0bGVMYWJlbHMuc2V0KHRpdGxlLCB0ZXh0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnRpdGxlU2l6ZXM/Lm9ic2VydmUodGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGV4dC50aXRsZSAhPT0gbGFiZWwpIHtcbiAgICAgICAgICAgICAgICB0ZXh0LnRpdGxlID0gbGFiZWw7XG4gICAgICAgICAgICAgICAgdGhpcy5maXRUaXRsZSh0ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpdFRpdGxlKHRleHQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGhlYWRpbmcgPSB0ZXh0LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIGlmICghaGVhZGluZz8uY2xpZW50V2lkdGgpIHJldHVybjtcblxuICAgICAgICBoZWFkaW5nLmNsYXNzTGlzdC5yZW1vdmUoJ2phcnZpcy1jb250ZXN0LXRpdGxlLXN0YWNrZWQnKTtcbiAgICAgICAgdGV4dC5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnZm9udC1zaXplJyk7XG4gICAgICAgIGNvbnN0IG1pbmltdW1SZWFkYWJsZVdpZHRoID0gNCAqIHBhcnNlRmxvYXQoZ2V0Q29tcHV0ZWRTdHlsZSh0ZXh0KS5mb250U2l6ZSk7XG4gICAgICAgIGlmICh0ZXh0LmNsaWVudFdpZHRoIDwgbWluaW11bVJlYWRhYmxlV2lkdGggJiYgdGV4dC5zY3JvbGxXaWR0aCA+IHRleHQuY2xpZW50V2lkdGgpIHtcbiAgICAgICAgICAgIGhlYWRpbmcuY2xhc3NMaXN0LmFkZCgnamFydmlzLWNvbnRlc3QtdGl0bGUtc3RhY2tlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ZXh0LnNjcm9sbFdpZHRoID4gdGV4dC5jbGllbnRXaWR0aCkgdGV4dC5zdHlsZS5mb250U2l6ZSA9ICcuOGVtJztcbiAgICB9XG5cbiAgICBnZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0OiBIVE1MRWxlbWVudCwgcmlnaHQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkID0gbGlzdC5xdWVyeVNlbGVjdG9yKCcuY29udGVzdF9oZWFkZXJfYWN0aXZlJyk/LmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk7XG4gICAgICAgIGlmIChzZWxlY3RlZCkgcmV0dXJuIHNlbGVjdGVkLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuXG4gICAgICAgIGNvbnN0IHBhbmVscyA9IEFycmF5LmZyb20ocmlnaHQucXVlcnlTZWxlY3RvckFsbCgnLnJhbmtpbmdbaWRfY29udGVzdF0nKSlcbiAgICAgICAgICAgIC5maWx0ZXIocGFuZWwgPT4gcGFuZWwuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggJiYgZ2V0Q29tcHV0ZWRTdHlsZShwYW5lbCkudmlzaWJpbGl0eSA9PT0gJ3Zpc2libGUnKTtcbiAgICAgICAgcmV0dXJuIHBhbmVscy5sZW5ndGggPT09IDEgPyBwYW5lbHNbMF0uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0JykgOiBudWxsO1xuICAgIH1cblxuICAgIHNob3dMZWFkZXJib2FyZChyaWdodDogSFRNTEVsZW1lbnQsIGNvbnRlc3RJZDogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgICBpZiAoIWNvbnRlc3RJZCkge1xuICAgICAgICAgICAgcmlnaHQucXVlcnlTZWxlY3RvckFsbCgnLmphcnZpcy1jb250ZXN0LW90aGVyJykuZm9yRWFjaChwYW5lbCA9PiBwYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1vdGhlcicpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBhbmVsIG9mIHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYW5raW5nW2lkX2NvbnRlc3RdJykpIHtcbiAgICAgICAgICAgIHBhbmVsLmNsYXNzTGlzdC50b2dnbGUoJ2phcnZpcy1jb250ZXN0LW90aGVyJywgcGFuZWwuZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0JykgIT09IGNvbnRlc3RJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRPd25Sb3coYm9hcmQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IG93biA9IGJvYXJkLnF1ZXJ5U2VsZWN0b3IoJy5sZWFkVGFibGUgdHIubGVhZF90YWJsZV9kZWZhdWx0Jyk7XG4gICAgICAgIGlmIChvd24pIHJldHVybiBvd247XG5cbiAgICAgICAgY29uc3QgaGVyb0lkID0gKHdpbmRvdy5zaGFyZWQ/Lkhlcm8gfHwgd2luZG93Lkhlcm8pPy5pbmZvcz8uaWQ7XG4gICAgICAgIGlmIChoZXJvSWQgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oYm9hcmQucXVlcnlTZWxlY3RvckFsbCgnLmxlYWRUYWJsZSB0cltzb3J0aW5nX2lkXScpKVxuICAgICAgICAgICAgLmZpbmQocm93ID0+IHJvdy5nZXRBdHRyaWJ1dGUoJ3NvcnRpbmdfaWQnKSA9PT0gU3RyaW5nKGhlcm9JZCkpO1xuICAgIH1cblxuICAgIGdldExlYWRlcmJvYXJkU2Nyb2xsZXIocmlnaHQ6IEhUTUxFbGVtZW50LCBpZDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYW5raW5nW2lkX2NvbnRlc3RdJykpXG4gICAgICAgICAgICAuZmluZChwYW5lbCA9PiBwYW5lbC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKSA9PT0gaWQpPy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmxlYWRfdGFibGVfdmlldycpO1xuICAgIH1cblxuICAgIHVwZGF0ZVNob3J0Y3V0cyhsaXN0OiBIVE1MRWxlbWVudCwgcmlnaHQ6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdENhcmRbXSkge1xuICAgICAgICBjb25zdCBjYW52YXMgPSBsaXN0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMnKTtcbiAgICAgICAgaWYgKCFjYW52YXMpIHJldHVybjtcblxuICAgICAgICBjb25zdCBzaG9ydGN1dHMgPSBjb250ZXN0cy5tYXAoKHsgaWQsIGhlYWRlciwgbGFiZWwsIGNhdGVnb3J5IH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJvYXJkID0gdGhpcy5nZXRMZWFkZXJib2FyZFNjcm9sbGVyKHJpZ2h0LCBpZCk7XG4gICAgICAgICAgICBjb25zdCByYW5rID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3IoJy5wZXJzb25hbF9yZXdhcmRzIC5yYW5rJyk/LnRleHRDb250ZW50Py50cmltKCkgfHxcbiAgICAgICAgICAgICAgICAoYm9hcmQgJiYgdGhpcy5nZXRPd25Sb3coYm9hcmQpPy5xdWVyeVNlbGVjdG9yKCd0ZCcpPy50ZXh0Q29udGVudD8udHJpbSgpKSB8fCAnJztcbiAgICAgICAgICAgIHJldHVybiB7IGlkLCBuYW1lOiBsYWJlbCwgY2F0ZWdvcnk6IGNhdGVnb3J5ID8gQ09OVEVTVF9TSE9SVF9MQUJFTFNbY2F0ZWdvcnldIDogJ0NvbnRlc3QnLCByYW5rIH07XG4gICAgICAgIH0pO1xuICAgICAgICByZW5kZXJDb250ZXN0U2hvcnRjdXRzKGNhbnZhcywgc2hvcnRjdXRzLCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSwgaWQgPT4gdGhpcy5vcGVuU2hvcnRjdXQoaWQpKTtcbiAgICB9XG5cbiAgICBvcGVuU2hvcnRjdXQoaWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCB7IGxpc3QsIHJpZ2h0IH0gPSB0aGlzO1xuICAgICAgICBpZiAoIWxpc3QgfHwgIXJpZ2h0KSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgY2FyZCA9IGxpc3QucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oYC5jb250ZXN0W2lkX2NvbnRlc3Q9XCIke0NTUy5lc2NhcGUoaWQpfVwiXWApO1xuICAgICAgICBjb25zdCBoZWFkZXIgPSBjYXJkPy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmNvbnRlc3RfaGVhZGVyJyk7XG4gICAgICAgIGlmICghY2FyZCB8fCAhaGVhZGVyIHx8IGhlYWRlci5tYXRjaGVzKCcuZW5kZWQnKSB8fCBjYXJkLm1hdGNoZXMoJy5lbmRlZCcpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgYWxyZWFkeVNlbGVjdGVkID0gdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCkgPT09IGlkO1xuICAgICAgICB0aGlzLnN0b3BKdW1wPy4oKTtcbiAgICAgICAgdGhpcy5wcmVwYXJlU3dpdGNoKGxpc3QsIHJpZ2h0LCBpZCwgY2FyZCk7XG4gICAgICAgIGlmICghYWxyZWFkeVNlbGVjdGVkKSAoaGVhZGVyLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KENPTlRFU1RfVElUTEVfU0VMRUNUT1IpIHx8IGhlYWRlcikuY2xpY2soKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcHJlcGFyZVN3aXRjaChsaXN0OiBIVE1MRWxlbWVudCwgcmlnaHQ6IEhUTUxFbGVtZW50LCBpZDogc3RyaW5nIHwgbnVsbCwgc2hvcnRjdXRDYXJkPzogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICBpZiAoaWQpIHRoaXMucG9zaXRpb25Td2l0Y2gobGlzdCwgcmlnaHQsIGlkLCBzaG9ydGN1dENhcmQpO1xuICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgbnVsbCk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgIH1cblxuICAgIGxvY2tTY3JvbGwoc2Nyb2xsZXI6IEhUTUxFbGVtZW50LCBndWFyZERlc2NlbmRhbnRzID0gZmFsc2UpIHtcbiAgICAgICAgJChzY3JvbGxlcikuc3RvcCh0cnVlLCBmYWxzZSk7XG4gICAgICAgIC8vIFRoZSBnYW1lIGNhbiBzdGFydCBhbm90aGVyIGpRdWVyeSB0d2VlbiBhZnRlciBsb2FkLiBCbG9jayBpdHMgd3JpdGVzIG9uIHRoaXMgcGFuZSBvbmx5LlxuICAgICAgICBjb25zdCBpZ25vcmVTY3JvbGwgPSAoKSA9PiB7fTtcbiAgICAgICAgY29uc3QgZ2V0ID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwgJ3Njcm9sbFRvcCcpPy5nZXQ7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3JzID0gT2JqZWN0LmVudHJpZXMoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiB7IGdldCwgc2V0OiBpZ25vcmVTY3JvbGwgfSxcbiAgICAgICAgICAgIHNjcm9sbDogeyB2YWx1ZTogaWdub3JlU2Nyb2xsLCB3cml0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgc2Nyb2xsVG86IHsgdmFsdWU6IGlnbm9yZVNjcm9sbCwgd3JpdGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHNjcm9sbEJ5OiB7IHZhbHVlOiBpZ25vcmVTY3JvbGwsIHdyaXRhYmxlOiB0cnVlIH1cbiAgICAgICAgfSkuZmlsdGVyKChba2V5XSkgPT4gIU9iamVjdC5oYXNPd24oc2Nyb2xsZXIsIGtleSkpO1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGRlc2NyaXB0b3JdIG9mIGRlc2NyaXB0b3JzKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2Nyb2xsZXIsIGtleSwgeyAuLi5kZXNjcmlwdG9yLCBjb25maWd1cmFibGU6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVsZWFzZURlc2NlbmRhbnRzID0gZ3VhcmREZXNjZW5kYW50cyA/IGd1YXJkU2Nyb2xsSW50b1ZpZXcoc2Nyb2xsZXIpIDogdW5kZWZpbmVkO1xuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAkKHNjcm9sbGVyKS5zdG9wKHRydWUsIGZhbHNlKTtcbiAgICAgICAgICAgIHJlbGVhc2VEZXNjZW5kYW50cz8uKCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGRlc2NyaXB0b3JdIG9mIGRlc2NyaXB0b3JzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc2Nyb2xsZXIsIGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgJiYgY3VycmVudC52YWx1ZSA9PT0gZGVzY3JpcHRvci52YWx1ZSAmJiBjdXJyZW50LnNldCA9PT0gZGVzY3JpcHRvci5zZXQpIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoc2Nyb2xsZXIsIGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAganVtcFRvKHNjcm9sbGVyOiBIVE1MRWxlbWVudCwgdGFyZ2V0OiBFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCwgY2VudGVyID0gZmFsc2UpIHtcbiAgICAgICAgbGV0IHRvcCA9IDA7XG4gICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGJvdW5kcyA9IHNjcm9sbGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3Qgc2NhbGUgPSBib3VuZHMuaGVpZ2h0IC8gc2Nyb2xsZXIub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgaWYgKCFzY2FsZSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBpdGVtID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgdG9wID0gc2Nyb2xsZXIuc2Nyb2xsVG9wICsgKGl0ZW0udG9wIC0gYm91bmRzLnRvcCkgLyBzY2FsZSAtIHNjcm9sbGVyLmNsaWVudFRvcDtcbiAgICAgICAgICAgIGlmIChjZW50ZXIpIHRvcCAtPSAoc2Nyb2xsZXIuY2xpZW50SGVpZ2h0IC0gaXRlbS5oZWlnaHQgLyBzY2FsZSkgLyAyO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2Nyb2xsSW5zdGFudGx5KHNjcm9sbGVyLCB0b3ApO1xuICAgIH1cblxuICAgIHNjcm9sbEluc3RhbnRseShzY3JvbGxlcjogSFRNTEVsZW1lbnQsIHBvc2l0aW9uOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgdG9wID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oc2Nyb2xsZXIuc2Nyb2xsSGVpZ2h0IC0gc2Nyb2xsZXIuY2xpZW50SGVpZ2h0LCBwb3NpdGlvbikpO1xuICAgICAgICBpZiAoTWF0aC5hYnModG9wIC0gc2Nyb2xsZXIuc2Nyb2xsVG9wKSA+PSAxKSB7XG4gICAgICAgICAgICBjb25zdCBzY3JvbGxUbyA9IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbFRvIGFzIChvcHRpb25zOiBTY3JvbGxUb09wdGlvbnMpID0+IHZvaWQ7XG4gICAgICAgICAgICBzY3JvbGxUby5jYWxsKHNjcm9sbGVyLCB7IHRvcCwgYmVoYXZpb3I6ICdpbnN0YW50JyB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBvc2l0aW9uU3dpdGNoKGxpc3Q6IEhUTUxFbGVtZW50LCByaWdodDogSFRNTEVsZW1lbnQsIGlkOiBzdHJpbmcsIHNob3J0Y3V0Q2FyZD86IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuc3dpdGNoU2Nyb2xsPy5zdG9wKCk7XG5cbiAgICAgICAgY29uc3QgbGlzdFRvcCA9IGxpc3Quc2Nyb2xsVG9wO1xuICAgICAgICBjb25zdCBhdE93blJhbmsgPSByZWFkQ29udGVzdFJhbmsoaWQsIHRoaXMuZGVmYXVsdHMucmFuaykgPT09ICdtaW5lJztcbiAgICAgICAgY29uc3QgcmVsZWFzZUxpc3QgPSB0aGlzLnN0b3BTd2l0Y2hTY3JvbGwgfHwgc2hvcnRjdXRDYXJkID8gdGhpcy5sb2NrU2Nyb2xsKGxpc3QsIHRydWUpIDogdW5kZWZpbmVkO1xuICAgICAgICBsZXQgbWFudWFsTGlzdCA9IGZhbHNlO1xuICAgICAgICBsZXQgbWFudWFsQm9hcmQgPSBmYWxzZTtcbiAgICAgICAgbGV0IGJvYXJkOiBIVE1MRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCByZWxlYXNlQm9hcmQ6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgcmVzdG9yZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmdldExlYWRlcmJvYXJkU2Nyb2xsZXIocmlnaHQsIGlkKTtcbiAgICAgICAgICAgIGlmIChuZXh0ICE9PSBib2FyZCkge1xuICAgICAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICAgICAgYm9hcmQgPSBuZXh0O1xuICAgICAgICAgICAgICAgIHJlbGVhc2VCb2FyZCA9IGJvYXJkID8gdGhpcy5sb2NrU2Nyb2xsKGJvYXJkLCB0cnVlKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBtYW51YWxCb2FyZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFtYW51YWxMaXN0ICYmIHJlbGVhc2VMaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3J0Y3V0Q2FyZCAmJiBsaXN0LmNvbnRhaW5zKHNob3J0Y3V0Q2FyZCkpIHRoaXMuanVtcFRvKGxpc3QsIHNob3J0Y3V0Q2FyZCk7XG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLnNjcm9sbEluc3RhbnRseShsaXN0LCBsaXN0VG9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghbWFudWFsQm9hcmQgJiYgYm9hcmQ/LmNsaWVudEhlaWdodCAmJiB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSA9PT0gaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmp1bXBUbyhib2FyZCwgYXRPd25SYW5rID8gdGhpcy5nZXRPd25Sb3coYm9hcmQpIDogbnVsbCwgYXRPd25SYW5rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBoYW5kbGVycyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSwgc2lnbmFsOiBoYW5kbGVycy5zaWduYWwgfTtcbiAgICAgICAgY29uc3Qgc3RvcCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICBoYW5kbGVycy5hYm9ydCgpO1xuICAgICAgICAgICAgcmVsZWFzZUxpc3Q/LigpO1xuICAgICAgICAgICAgcmVsZWFzZUJvYXJkPy4oKTtcbiAgICAgICAgICAgIHRoaXMuc3dpdGNoU2Nyb2xsID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KHN0b3AsIDQwMDApO1xuICAgICAgICBjb25zdCBvblNjcm9sbCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmICgocmVsZWFzZUxpc3QgJiYgZXZlbnQudGFyZ2V0ID09PSBsaXN0KSB8fCBldmVudC50YXJnZXQgPT09IGJvYXJkKSByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIExldCB1c2VyIGlucHV0IG1vdmUgaXRzIHBhbmUgd2l0aG91dCBhbGxvd2luZyBhIGRlbGF5ZWQgZ2FtZSBhbmltYXRpb24gdG8gdGFrZSBvdmVyLlxuICAgICAgICBjb25zdCBvbk1hbnVhbElucHV0ID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFldmVudC5pc1RydXN0ZWQgfHwgIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGxpc3QuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgbWFudWFsTGlzdCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoYm9hcmQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkgJiYgdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCkgPT09IGlkKSBtYW51YWxCb2FyZCA9IHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSB7XG4gICAgICAgICAgICBwYW5lLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBbJ3doZWVsJywgJ3RvdWNobW92ZScsICdwb2ludGVyZG93biddKSBwYW5lLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgb25NYW51YWxJbnB1dCwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChbJ0Fycm93VXAnLCAnQXJyb3dEb3duJywgJ1BhZ2VVcCcsICdQYWdlRG93bicsICdIb21lJywgJ0VuZCcsICcgJ10uaW5jbHVkZXMoZXZlbnQua2V5KSkgb25NYW51YWxJbnB1dChldmVudCk7XG4gICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLnN3aXRjaFNjcm9sbCA9IHsgcmVzdG9yZSwgc3RvcCB9O1xuICAgICAgICByZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgb3BlbkNvbnRlc3QobGlzdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudCwgeyBpZCwgY2FyZCwgaGVhZGVyLCB0aXRsZSB9OiBDb250ZXN0Q2FyZCkge1xuICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkgcGFuZS5jbGFzc0xpc3QuYWRkKCdqYXJ2aXMtY29udGVzdC1pbnN0YW50JywgJ2phcnZpcy1jb250ZXN0LWxvYWRpbmcnKTtcbiAgICAgICAgY29uc3QgcmFuayA9IHJlYWRDb250ZXN0UmFuayhpZCwgdGhpcy5kZWZhdWx0cy5yYW5rKTtcbiAgICAgICAgY29uc3QgcGxhY2VBdE93blJhbmsgPSByYW5rID09PSAnbWluZSc7XG4gICAgICAgIGNvbnN0IHJlbGVhc2VMaXN0ID0gdGhpcy5sb2NrU2Nyb2xsKGxpc3QpO1xuICAgICAgICBsZXQgYm9hcmQ6IEhUTUxFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHJlbGVhc2VCb2FyZDogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgICAgICBsZXQgcG9zaXRpb25lZCA9IGZhbHNlO1xuICAgICAgICBsZXQgbGFzdEF0dGVtcHQ6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgY29uc3QgdXBkYXRlQm9hcmQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5nZXRMZWFkZXJib2FyZFNjcm9sbGVyKHJpZ2h0LCBpZCk7XG4gICAgICAgICAgICBpZiAoYm9hcmQgPT09IG5leHQpIHJldHVybjtcbiAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICBib2FyZCA9IG5leHQ7XG4gICAgICAgICAgICByZWxlYXNlQm9hcmQgPSBib2FyZCA/IHRoaXMubG9ja1Njcm9sbChib2FyZCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJldmVhbCA9ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSBwYW5lLmNsYXNzTGlzdC5yZW1vdmUoJ2phcnZpcy1jb250ZXN0LWxvYWRpbmcnKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXN0b3JlID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFsaXN0LmlzQ29ubmVjdGVkIHx8ICFyaWdodC5pc0Nvbm5lY3RlZCB8fCAhbGlzdC5jb250YWlucyhjYXJkKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICB1cGRhdGVCb2FyZCgpO1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KTtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZCAhPT0gaWQgJiYgc2VsZWN0ZWQgIT09IGxhc3RBdHRlbXB0KSB7XG4gICAgICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSBzZWxlY3RlZDtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgKHRpdGxlIHx8IGhlYWRlcikuY2xpY2soKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVCb2FyZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFib2FyZD8uY2xpZW50SGVpZ2h0IHx8IHRoaXMuZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdCwgcmlnaHQpICE9PSBpZCB8fFxuICAgICAgICAgICAgICAgIChwbGFjZUF0T3duUmFuayAmJiAhYm9hcmQucXVlcnlTZWxlY3RvcignLmxlYWRUYWJsZScpKSkgcmV0dXJuO1xuICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgaWQpO1xuICAgICAgICAgICAgdGhpcy5qdW1wVG8obGlzdCwgY2FyZCk7XG4gICAgICAgICAgICB0aGlzLmp1bXBUbyhib2FyZCwgcGxhY2VBdE93blJhbmsgPyB0aGlzLmdldE93blJvdyhib2FyZCkgOiBudWxsLCBwbGFjZUF0T3duUmFuayk7XG4gICAgICAgICAgICBpZiAoIXBvc2l0aW9uZWQpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgIHJldmVhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvcnJlY3QgYnJvd3Nlci1kcml2ZW4gbW92ZXMsIHN1Y2ggYXMgc2Nyb2xsSW50b1ZpZXcgb24gYSBsZWFkZXJib2FyZCByb3csIGJlZm9yZSBwYWludC5cbiAgICAgICAgY29uc3Qgb25TY3JvbGwgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSBsaXN0IHx8IGV2ZW50LnRhcmdldCA9PT0gYm9hcmQpIHJlc3RvcmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaW5wdXRFdmVudHMgPSBbJ3BvaW50ZXJkb3duJywgJ3RvdWNoc3RhcnQnLCAnd2hlZWwnLCAnY2xpY2snXTtcbiAgICAgICAgY29uc3Qgb25JbnB1dCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5pc1RydXN0ZWQpIHN0b3AoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3RvcE9uS2V5ID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkICYmIFsnVGFiJywgJ0Fycm93VXAnLCAnQXJyb3dEb3duJywgJ1BhZ2VVcCcsICdQYWdlRG93bicsICdIb21lJywgJ0VuZCcsICdFbnRlcicsICcgJ10uaW5jbHVkZXMoZXZlbnQua2V5KSkgc3RvcCgpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBhZnRlckxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICBsYXN0QXR0ZW1wdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJlc3RvcmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3RvcCA9IChmaW5pc2ggPSB0cnVlKSA9PiB7XG4gICAgICAgICAgICByZWxlYXNlTGlzdCgpO1xuICAgICAgICAgICAgcmVsZWFzZUJvYXJkPy4oKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSB7XG4gICAgICAgICAgICAgICAgcGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcGFuZS5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1pbnN0YW50JywgJ2phcnZpcy1jb250ZXN0LWxvYWRpbmcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgaW5wdXRFdmVudHMpIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uSW5wdXQsIHRydWUpO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHN0b3BPbktleSwgdHJ1ZSk7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFmdGVyTG9hZCk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgdGhpcy5zdG9wSnVtcCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnJlcG9zaXRpb24gPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZXN0b3JpbmdDYXJkID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChmaW5pc2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV2ZWFsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dChzdG9wLCA0MDAwKTtcbiAgICAgICAgdGhpcy5zdG9wSnVtcCA9IHN0b3A7XG4gICAgICAgIHRoaXMucmVwb3NpdGlvbiA9IHJlc3RvcmU7XG4gICAgICAgIHRoaXMucmVzdG9yaW5nQ2FyZCA9IGNhcmQ7XG4gICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSB7XG4gICAgICAgICAgICBwYW5lLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsLCB7IHBhc3NpdmU6IHRydWUsIGNhcHR1cmU6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBldmVudCBvZiBpbnB1dEV2ZW50cykgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgb25JbnB1dCwgeyBwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiB0cnVlIH0pO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc3RvcE9uS2V5LCB0cnVlKTtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgYWZ0ZXJMb2FkLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgIHJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICByZWZyZXNoKCkge1xuICAgICAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJyNjb250ZXN0cyAubGVmdF9wYXJ0IC5zY3JvbGxfYXJlYScpO1xuICAgICAgICBjb25zdCByaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMgLnJpZ2h0X3BhcnQnKTtcbiAgICAgICAgaWYgKHRoaXMubGlzdCAhPT0gbGlzdCB8fCB0aGlzLnJpZ2h0ICE9PSByaWdodCkgdGhpcy5zd2l0Y2hTY3JvbGw/LnN0b3AoKTtcbiAgICAgICAgaWYgKHRoaXMuc3RvcEp1bXAgJiYgKHRoaXMubGlzdCAhPT0gbGlzdCB8fCB0aGlzLnJpZ2h0ICE9PSByaWdodCB8fCAhbGlzdD8uY29udGFpbnModGhpcy5yZXN0b3JpbmdDYXJkKSkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcEp1bXAoZmFsc2UpO1xuICAgICAgICAgICAgaWYgKHRoaXMucmlnaHQpIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHRoaXMucmlnaHQsIG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGlzdCA9IGxpc3Q7XG4gICAgICAgIHRoaXMucmlnaHQgPSByaWdodDtcbiAgICAgICAgaWYgKCFsaXN0IHx8ICFyaWdodCB8fCAhbGlzdC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCB8fCBnZXRDb21wdXRlZFN0eWxlKGxpc3QpLnZpc2liaWxpdHkgIT09ICd2aXNpYmxlJykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGZpbmlzaGVkID0gbmV3IFNldChPYmplY3QudmFsdWVzKHdpbmRvdy5jb250ZXN0cz8uZmluaXNoZWQgfHwge30pXG4gICAgICAgICAgICAuZmlsdGVyKGNvbnRlc3QgPT4gY29udGVzdD8uaWRfY29udGVzdCAhPSBudWxsKS5tYXAoY29udGVzdCA9PiBTdHJpbmcoY29udGVzdC5pZF9jb250ZXN0KSkpO1xuICAgICAgICBmb3IgKGNvbnN0IGVuZGVkIG9mIGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlc3QuZW5kZWQsIC5jb250ZXN0X2hlYWRlci5lbmRlZCcpKSB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IGVuZGVkLmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKGlkKSBmaW5pc2hlZC5hZGQoaWQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNhcmRzID0gdGhpcy5nZXRDb250ZXN0cyhsaXN0LCBmaW5pc2hlZCk7XG4gICAgICAgIGNvbnN0IGNvbnRlc3RzID0gY2FyZHMuZmlsdGVyKGNhcmQgPT4gIWNhcmQuZW5kZWQpO1xuICAgICAgICB0aGlzLmNsZWFyRXhwaXJlZFBpbihsaXN0LCBjb250ZXN0cywgZmluaXNoZWQpO1xuICAgICAgICB0aGlzLnVwZGF0ZUNhcmRDb250cm9scyhsaXN0LCBjb250ZXN0cyk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVwb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy5yZXBvc2l0aW9uKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGFydHVwUGVuZGluZykge1xuICAgICAgICAgICAgbGV0IHRhcmdldCA9IHRoaXMuZ2V0VGFyZ2V0KGNvbnRlc3RzKTtcbiAgICAgICAgICAgIGlmICghY29udGVzdHMubGVuZ3RoICYmICF0aGlzLnByZWZlcmVuY2UgJiYgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCk7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gY2FyZHMuZmluZChjYXJkID0+IGNhcmQuaWQgPT09IHNlbGVjdGVkKSA/PyBjYXJkcy5hdCgtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFyZ2V0KSB0aGlzLm9wZW5Db250ZXN0KGxpc3QsIHJpZ2h0LCB0YXJnZXQpO1xuICAgICAgICAgICAgZWxzZSBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyAmJiAhdGhpcy5wcmVmZXJlbmNlKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCkpO1xuICAgICAgICAgICAgdGhpcy5zd2l0Y2hTY3JvbGw/LnJlc3RvcmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZVNob3J0Y3V0cyhsaXN0LCByaWdodCwgY29udGVzdHMpO1xuICAgIH1cblxuICAgIHJ1bih7IG5vU3dpdGNoU2Nyb2xsID0gdHJ1ZSB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgY29uc3QgcGluID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICB0aGlzLnByZWZlcmVuY2UgPSAoKHR5cGVvZiBwaW4gPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBwaW4gPT09ICdudW1iZXInKSAmJiBwaW4pID8gU3RyaW5nKHBpbikgOiAnJztcbiAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuc3RvcFN3aXRjaFNjcm9sbCA9IG5vU3dpdGNoU2Nyb2xsO1xuICAgICAgICB0aGlzLmRlZmF1bHRzID0gcmVhZENvbnRlc3REZWZhdWx0cygpO1xuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3QgeyBzaWduYWwgfSA9IHRoaXMubGlzdGVuZXJzO1xuICAgICAgICB0aGlzLnRpdGxlU2l6ZXMgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoZW50cmllcyA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgdGFyZ2V0IH0gb2YgZW50cmllcykgdGhpcy5maXRUaXRsZSh0YXJnZXQgYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKG11dGF0aW9ucyA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlc3RzIC5sZWZ0X3BhcnQgLnNjcm9sbF9hcmVhJyk7XG4gICAgICAgICAgICBjb25zdCByaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZXN0cyAucmlnaHRfcGFydCcpO1xuICAgICAgICAgICAgaWYgKGxpc3QgIT09IHRoaXMubGlzdCB8fCByaWdodCAhPT0gdGhpcy5yaWdodCB8fCBtdXRhdGlvbnMuc29tZSgoeyB0YXJnZXQgfSkgPT5cbiAgICAgICAgICAgICAgICAobGlzdCAmJiAobGlzdC5jb250YWlucyh0YXJnZXQpIHx8IHRhcmdldC5jb250YWlucyhsaXN0KSkpIHx8XG4gICAgICAgICAgICAgICAgKHJpZ2h0ICYmIChyaWdodC5jb250YWlucyh0YXJnZXQpIHx8IHRhcmdldC5jb250YWlucyhyaWdodCkpKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogdHJ1ZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcycsICdzdHlsZScsICdoaWRkZW4nLCAnaWRfY29udGVzdCddIH0pO1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB0aGlzLnJlZnJlc2goKSwgeyBvbmNlOiB0cnVlLCBzaWduYWwgfSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYW52YXMgPSB0aGlzLmxpc3Q/LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMnKTtcbiAgICAgICAgICAgIGNvbnN0IGJhciA9IGNhbnZhcz8ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJzpzY29wZSA+IC5qYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMnKTtcbiAgICAgICAgICAgIGlmIChjYW52YXMgJiYgYmFyKSBwb3NpdGlvbkNvbnRlc3RTaG9ydGN1dHMoY2FudmFzLCBiYXIpO1xuICAgICAgICB9LCB7IHNpZ25hbCB9KTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmICghZXZlbnQuaXNUcnVzdGVkIHx8ICEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkgfHwgIXRoaXMucmlnaHQgfHwgIXRoaXMubGlzdD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVyID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5jb250ZXN0X2hlYWRlcicpO1xuICAgICAgICAgICAgaWYgKCFoZWFkZXIgfHwgZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5qYXJ2aXMtY29udGVzdC1waW4sIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JykpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgaWQgPSBoZWFkZXIuY2xvc2VzdCgnLmNvbnRlc3RbaWRfY29udGVzdF0nKT8uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG4gICAgICAgICAgICB0aGlzLnByZXBhcmVTd2l0Y2godGhpcy5saXN0LCB0aGlzLnJpZ2h0LCBpZCA/PyBudWxsKTtcbiAgICAgICAgfSwgeyBjYXB0dXJlOiB0cnVlLCBzaWduYWwgfSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG5cbiAgICB1cGRhdGVTdWJTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogYm9vbGVhbikge1xuICAgICAgICBpZiAoa2V5ICE9PSAnbm9Td2l0Y2hTY3JvbGwnKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RvcFN3aXRjaFNjcm9sbCA9IHZhbHVlO1xuICAgICAgICBpZiAoIXZhbHVlKSB0aGlzLnN3aXRjaFNjcm9sbD8uc3RvcCgpO1xuICAgIH1cblxuICAgIHRlYXJEb3duKCkge1xuICAgICAgICB0aGlzLm9ic2VydmVyPy5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMudGl0bGVTaXplcz8uZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLmxpc3RlbmVycz8uYWJvcnQoKTtcbiAgICAgICAgdGhpcy5zdG9wSnVtcD8uKCk7XG4gICAgICAgIHRoaXMuc3dpdGNoU2Nyb2xsPy5zdG9wKCk7XG4gICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5saXN0Py5jbG9zZXN0KCcjY29udGVzdHMnKT8ucXVlcnlTZWxlY3RvcignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cycpPy5yZW1vdmUoKTtcbiAgICAgICAgaWYgKHRoaXMubGlzdCkgdGhpcy51cGRhdGVDYXJkQ29udHJvbHModGhpcy5saXN0LCBbXSk7XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0KSB0aGlzLnNob3dMZWFkZXJib2FyZCh0aGlzLnJpZ2h0LCBudWxsKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gZmFsc2U7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuZXhwb3J0IGNsYXNzIExlYWd1ZVRvcDIwIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xlYWd1ZVRvcDIwJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlByb21vdGlvbiB0YXJnZXRcIiwgXCJTaG93IHRoZSBwb2ludHMgbmVlZGVkIHRvIHJlYWNoIHRoZSBsYXJnZXIgb2YgdGhlIHRvcCAyMCBvciB0b3AgMTUlIGJlbG93IHRoZSBoaWdoZXN0IGxlYWd1ZSB0aWVyLlwiKVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZXMuaHRtbCcpO1xuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoJy5zY3JpcHRMZWFndWVJbmZvJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY3JpcHRMZWFndWVJbmZvJyk7XG4gICAgICAgICAgICBpZiAoIXN1bW1hcnkgfHwgc3VtbWFyeS5xdWVyeVNlbGVjdG9yKCcuamFydmlzVG9wMjAnKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCB7IG9wcG9uZW50c19saXN0LCBjdXJyZW50X3RpZXJfbnVtYmVyLCBtYXhfbGVhZ3VlIH0gPSB3aW5kb3c7XG4gICAgICAgICAgICBjb25zdCB0aWVyID0gTnVtYmVyKGN1cnJlbnRfdGllcl9udW1iZXIpO1xuICAgICAgICAgICAgaWYgKCEodGllciA+IDAgJiYgdGllciA8IE51bWJlcihtYXhfbGVhZ3VlKSkpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGhlcm9JZCA9ICh3aW5kb3cuc2hhcmVkPy5IZXJvIHx8IHdpbmRvdy5IZXJvKT8uaW5mb3M/LmlkO1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG9wcG9uZW50c19saXN0KSB8fCBoZXJvSWQgPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBvcHBvbmVudHNfbGlzdC5maW5kKCh7IHBsYXllciB9KSA9PiBTdHJpbmcocGxheWVyPy5pZF9maWdodGVyKSA9PT0gU3RyaW5nKGhlcm9JZCkpO1xuICAgICAgICAgICAgY29uc3QgcmFuayA9IE51bWJlcihwbGF5ZXI/LnBsYWNlKTtcbiAgICAgICAgICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihyYW5rKSB8fCByYW5rIDwgMSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBicmFja2V0U2l6ZSA9IG9wcG9uZW50c19saXN0Lmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IHByb21vdGlvblJhbmsgPSBNYXRoLm1heCgyMCwgTWF0aC5jZWlsKGJyYWNrZXRTaXplICogMTUgLyAxMDApKTtcbiAgICAgICAgICAgIGNvbnN0IGluUHJvbW90aW9uID0gcmFuayA8PSBwcm9tb3Rpb25SYW5rO1xuICAgICAgICAgICAgY29uc3QgY29tcGFyaXNvblJhbmsgPSBpblByb21vdGlvbiA/IHByb21vdGlvblJhbmsgKyAxIDogcHJvbW90aW9uUmFuaztcbiAgICAgICAgICAgIGNvbnN0IGN1dG9mZiA9IG9wcG9uZW50c19saXN0LmZpbmQoKHsgcGxhY2UgfSkgPT4gTnVtYmVyKHBsYWNlKSA9PT0gY29tcGFyaXNvblJhbmspO1xuICAgICAgICAgICAgaWYgKHBsYXllcj8ucGxheWVyX2xlYWd1ZV9wb2ludHMgPT0gbnVsbCB8fCBjdXRvZmY/LnBsYXllcl9sZWFndWVfcG9pbnRzID09IG51bGwpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3Qgc2NvcmUgPSBOdW1iZXIocGxheWVyLnBsYXllcl9sZWFndWVfcG9pbnRzKTtcbiAgICAgICAgICAgIGNvbnN0IGN1dG9mZlNjb3JlID0gTnVtYmVyKGN1dG9mZi5wbGF5ZXJfbGVhZ3VlX3BvaW50cyk7XG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShzY29yZSkgfHwgIU51bWJlci5pc0Zpbml0ZShjdXRvZmZTY29yZSkpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgZm9ybWF0ID0gbmV3IEludGwuTnVtYmVyRm9ybWF0KCk7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBpblByb21vdGlvbiA/IGN1dG9mZlNjb3JlIDogY3V0b2ZmU2NvcmUgKyAxO1xuICAgICAgICAgICAgY29uc3QgZGlmZmVyZW5jZSA9IGluUHJvbW90aW9uID8gc2NvcmUgLSB0YXJnZXQgOiB0YXJnZXQgLSBzY29yZTtcbiAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSBgVG9wICR7cHJvbW90aW9uUmFua30gaXMgdGhlIHByb21vdGlvbiB0YXJnZXQuIFRoZSBjdXRvZmYgaXMgdGhlIGxhcmdlciBvZiAyMCBwbGFjZXMgb3IgMTUlIG9mICR7Zm9ybWF0LmZvcm1hdChicmFja2V0U2l6ZSl9IHBsYXllcnMsIHJvdW5kZWQgdXAuYDtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmlzb24gPSBpblByb21vdGlvblxuICAgICAgICAgICAgICAgID8gYFJhbmsgJHtjb21wYXJpc29uUmFua30gaGFzICR7Zm9ybWF0LmZvcm1hdCh0YXJnZXQpfSBwb2ludHMuIFlvdXIgbGVhZCBpcyAke2Zvcm1hdC5mb3JtYXQoZGlmZmVyZW5jZSl9IHBvaW50cy5gXG4gICAgICAgICAgICAgICAgOiBgWW91IG5lZWQgJHtmb3JtYXQuZm9ybWF0KHRhcmdldCl9IHBvaW50cyB0byBwYXNzIHJhbmsgJHtjb21wYXJpc29uUmFua30uYDtcbiAgICAgICAgICAgIGNvbnN0IHRvb2x0aXAgPSBgJHtydWxlfSAke2NvbXBhcmlzb259YDtcblxuICAgICAgICAgICAgY29uc3QgZW50cnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICBlbnRyeS5jbGFzc05hbWUgPSAnamFydmlzVG9wMjAnO1xuICAgICAgICAgICAgZW50cnkuc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIHRvb2x0aXApO1xuICAgICAgICAgICAgZW50cnkuc2V0QXR0cmlidXRlKCd0b29sdGlwJywgJycpO1xuICAgICAgICAgICAgZW50cnkuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgdG9vbHRpcCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGJhZGdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgYmFkZ2UuY2xhc3NOYW1lID0gJ3NjcmlwdExlYWd1ZUluZm9JY29uJztcbiAgICAgICAgICAgIGJhZGdlLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjMzc2OWJhJztcbiAgICAgICAgICAgIGJhZGdlLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgICAgICAgICAgYmFkZ2UudGV4dENvbnRlbnQgPSBTdHJpbmcocHJvbW90aW9uUmFuayk7XG4gICAgICAgICAgICBlbnRyeS5hcHBlbmQoYmFkZ2UsIGAke2RpZmZlcmVuY2UgPT09IDAgPyAnJyA6IGluUHJvbW90aW9uID8gJy0nIDogJysnfSR7Zm9ybWF0LmZvcm1hdChNYXRoLmFicyhkaWZmZXJlbmNlKSl9YCk7XG4gICAgICAgICAgICBzdW1tYXJ5Lmluc2VydEJlZm9yZShlbnRyeSwgc3VtbWFyeS5xdWVyeVNlbGVjdG9yKCcubWluVG9wMzAsIC5wcm9tb3Rpb25JbmZvJykpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuZXhwb3J0IGNsYXNzIFJlbW92ZVBhc3NMb2NrIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc2VsZWN0b3JUb0ZpbmQgPSAnLmxvY2tfeWVsbG93X2ljbic7XG4gICAgcHJpdmF0ZSByZWFkb25seSBjbGFzc1RvUmVtb3ZlID0gJ2xvY2tfeWVsbG93X2ljbic7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdyZW1vdmVQYXNzTG9jaydcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUGFzcyBsb2NrIGljb25zXCIsIFwiSGlkZSBsb2NrIGljb25zIG9uIHJld2FyZCBwYXNzZXMgc28gdGhlIHJld2FyZHMgYXJlIGVhc2llciB0byByZWFkLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ3BvdicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUGF0aCBvZiBWYWxvclwiLCBcIkhpZGUgbG9jayBpY29ucyBvbiB0aGUgUGF0aCBvZiBWYWxvciBwYXNzZXMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdwb2cnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlBhdGggb2YgR2xvcnlcIiwgXCJIaWRlIGxvY2sgaWNvbnMgb24gdGhlIFBhdGggb2YgR2xvcnkgcGFzc2VzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtdmFsb3IuaHRtbCcpIHx8IGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi1nbG9yeS5odG1sJylcbiAgICB9XG5cbiAgICBvYnNlcnZlVW50aWwoc2VsZWN0b3I6IHN0cmluZywgY2FsbGJhY2s6IChlbGVtZW50czogTm9kZUxpc3RPZjxFbGVtZW50PikgPT4gdm9pZCwgeyBvbmNlID0gdHJ1ZSwgdGltZW91dCA9IDUwMDAgfSA9IHt9KSB7XG4gICAgICAgIGxldCB0aW1lcjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICBpZiAoZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlbGVtZW50cyk7XG4gICAgICAgICAgICBpZiAob25jZSkgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChvbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVyKSBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlbGVtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUgfSk7XG5cbiAgICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZSh0aW1lb3V0KSAmJiB0aW1lb3V0ID4gMCkge1xuICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yOiBzdHJpbmcsIGNsYXNzVG9SZW1vdmU6IHN0cmluZywgeyBvbmNlID0gdHJ1ZSwgdGltZW91dCA9IDUwMDAgfSA9IHt9KSB7XG4gICAgICAgIHRoaXMub2JzZXJ2ZVVudGlsKHNlbGVjdG9yLCAoZWxlbWVudHMpID0+IHtcbiAgICAgICAgICAgIGVsZW1lbnRzLmZvckVhY2goZWwgPT4gZWwuY2xhc3NMaXN0LnJlbW92ZShjbGFzc1RvUmVtb3ZlKSk7XG4gICAgICAgIH0sIHsgdGltZW91dCwgb25jZSB9KTtcbiAgICB9XG5cbiAgICBydW4oeyBwb3YsIHBvZyB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi12YWxvci5odG1sJykgJiYgcG92KSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKHRoaXMuc2VsZWN0b3JUb0ZpbmQsIHRoaXMuY2xhc3NUb1JlbW92ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLWdsb3J5Lmh0bWwnKSAmJiBwb2cpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUodGhpcy5zZWxlY3RvclRvRmluZCwgdGhpcy5jbGFzc1RvUmVtb3ZlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0R2lybERpY3Rpb25hcnkoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZ2V0R2lybERpY3Rpb25hcnkoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IGxvYWQgdGhlIEhIKysgZ2lybCBkaWN0aW9uYXJ5OicsIGVycik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgZ2V0R2lybERpY3Rpb25hcnkgfSBmcm9tICcuL2dhbWVEYXRhJztcblxuZXhwb3J0IGNsYXNzIExvdmVSYWlkc0FkZG9uIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcmFyaXR5Q29sb3JzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnbG92ZVJhaWRzQWRkb24nXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkxvdmUgUmFpZHMgZGlzcGxheVwiLCBcIkN1c3RvbWl6ZSBuYW1lcywgaWNvbnMsIGFuZCBwb3NlcyBvbiBMb3ZlIFJhaWQgY2FyZHMuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAncmFpZF9pZCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUmFpZCBJRHNcIiwgXCJBZGQgdGhlIHJhaWQgSUQgYmVmb3JlIGl0cyBuYW1lLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ25hbWVzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJIaWRkZW4gZ2lybCBuYW1lc1wiLCBcIlNob3cgdGhlIG5hbWUgb24gY2FyZHMgdGhhdCB1c2UgYSBteXN0ZXJpb3VzIGdpcmwgbGFiZWwuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdza2luJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJTa2luIGluZGljYXRvclwiLCBcIk1hcmsgY2FyZHMgdGhhdCBpbmNsdWRlIGEgZ2lybCB3aXRoIGEgc2tpbi5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2NvbG9yJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJSYXJpdHkgY29sb3JzXCIsIFwiQ29sb3IgdGhlIHJhaWQgbmFtZSBiYXNlZCBvbiB0aGUgZ2lybOKAmXMgcmFyaXR5LlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnZmlnaHRfaWNvbicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiRmlnaHQgaWNvblwiLCBcIlVzZSB0aGUgY2xlYXJlciBmaWdodC1lbmVyZ3kgaWNvbi5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ3NoYWRvd3MnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlVuc2hhZG93ZWQgcG9zZXNcIiwgXCJTaG93IHRoZSBub3JtYWwgYXJ0d29yayBpbiBwbGFjZSBvZiBzaGFkb3cgcG9zZXMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuXG4gICAgICAgIHRoaXMucmFyaXR5Q29sb3JzID0ge1xuICAgICAgICAgICAgcmFyZTogJ0xpbWVHcmVlbicsXG4gICAgICAgICAgICBlcGljOiAnR29sZCcsXG4gICAgICAgICAgICBsZWdlbmRhcnk6ICdNZWRpdW1PcmNoaWQnXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sb3ZlLXJhaWRzLmh0bWwnKVxuICAgIH1cblxuICAgIGFzeW5jIHJ1bih7IHJhaWRfaWQsIHNraW4sIG5hbWVzLCBjb2xvciwgZmlnaHRfaWNvbiwgc2hhZG93cyB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgY29uc3QgcmFpZHMgPSAodHlwZW9mIGxvdmVfcmFpZHMgIT09ICd1bmRlZmluZWQnICYmIEFycmF5LmlzQXJyYXkobG92ZV9yYWlkcykpID8gbG92ZV9yYWlkcyA6IFtdO1xuICAgICAgICBpZiAoIXJhaWRzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcblxuICAgICAgICBjb25zdCBnaXJsRGljdCA9IGF3YWl0IGdldEdpcmxEaWN0aW9uYXJ5KCk7XG4gICAgICAgIGNvbnN0IHJhaWRzQnlJZCA9IG5ldyBNYXAocmFpZHMubWFwKHJhaWQgPT4gW1N0cmluZyhyYWlkLmlkX3JhaWQpLCByYWlkXSkpO1xuXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYWlkLWNhcmRbaWRfcmFpZF0nKS5mb3JFYWNoKHJhaWRDYXJkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJhaWQgPSByYWlkc0J5SWQuZ2V0KHJhaWRDYXJkLmdldEF0dHJpYnV0ZSgnaWRfcmFpZCcpID8/ICcnKTtcbiAgICAgICAgICAgIGlmICghcmFpZCB8fCByYWlkLmlkX2dpcmwgPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCB7IG5hbWUsIHJhcml0eSwgc2hhcmRzID0gMCB9ID0gZ2lybERpY3Q/LmdldChTdHJpbmcocmFpZC5pZF9naXJsKSkgfHwge307XG4gICAgICAgICAgICBjb25zdCBoYXJlbUxpbmsgPSB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmdldEhyZWYoYC9jaGFyYWN0ZXJzLyR7cmFpZC5pZF9naXJsfWApO1xuICAgICAgICAgICAgY29uc3QgcmFpZE5hbWVFbGVtID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcignLnJhaWQtbmFtZSA+IHNwYW4gPiBzcGFuJyk7XG4gICAgICAgICAgICBjb25zdCBuYW1lX2xhYmVsID0gKG5hbWVzICYmIG5hbWUpIHx8IHJhaWROYW1lRWxlbT8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCByYWlkLmV2ZW50X25hbWUgfHwgcmFpZC5naXJsX2RhdGE/Lm5hbWUgfHwgJyc7XG4gICAgICAgICAgICBjb25zdCByYWlkX2lkX2xhYmVsID0gcmFpZF9pZCA/IGAoJHtyYWlkLmlkX3JhaWR9KWAgOiAnJztcbiAgICAgICAgICAgIGNvbnN0IHNraW5fbGFiZWwgPSAoc2tpbiAmJiBBcnJheS5pc0FycmF5KHJhaWQ/LmdpcmxfZGF0YT8uZ3JhZGVfc2tpbnMpICYmIHJhaWQuZ2lybF9kYXRhLmdyYWRlX3NraW5zLmxlbmd0aCA+IDApID8gJ/CfkZknIDogJyc7XG5cbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlQYXJ0cyA9IFtdO1xuICAgICAgICAgICAgaWYgKHJhaWRfaWQpIGRpc3BsYXlQYXJ0cy5wdXNoKHJhaWRfaWRfbGFiZWwpO1xuICAgICAgICAgICAgZGlzcGxheVBhcnRzLnB1c2gobmFtZV9sYWJlbCk7XG4gICAgICAgICAgICBpZiAoc2tpbikgZGlzcGxheVBhcnRzLnB1c2goc2tpbl9sYWJlbCk7XG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5TGFiZWwgPSBkaXNwbGF5UGFydHMuam9pbignICcpLnRyaW0oKTtcblxuICAgICAgICAgICAgaWYgKHJhaWROYW1lRWxlbSAmJiBkaXNwbGF5TGFiZWwpIHtcbiAgICAgICAgICAgICAgICByYWlkTmFtZUVsZW0udGV4dENvbnRlbnQgPSBkaXNwbGF5TGFiZWw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG9iamVjdGl2ZXMgPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yQWxsKCcuY2xhc3NpYy1naXJsJyk7XG4gICAgICAgICAgICBjb25zdCBnaXJsID0gb2JqZWN0aXZlc1swXTtcbiAgICAgICAgICAgIGlmIChnaXJsKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ2lybE5hbWVFbGVtID0gZ2lybC5xdWVyeVNlbGVjdG9yKCcuZ2lybC1uYW1lJyk7XG4gICAgICAgICAgICAgICAgaWYgKGdpcmxOYW1lRWxlbSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGluayA9IGdpcmxOYW1lRWxlbS5xdWVyeVNlbGVjdG9yKCdhJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbGluaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsuY2xhc3NOYW1lID0gJ2hoLWdpcmwtbGluayc7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoZ2lybE5hbWVFbGVtLmZpcnN0Q2hpbGQpIGxpbmsuYXBwZW5kQ2hpbGQoZ2lybE5hbWVFbGVtLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2lybE5hbWVFbGVtLmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5TGFiZWwpIGxpbmsudGV4dENvbnRlbnQgPSBkaXNwbGF5TGFiZWw7XG4gICAgICAgICAgICAgICAgICAgIGxpbmsuaHJlZiA9IGhhcmVtTGluaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoc2hhcmRzID09PSAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2JqRWxlbSA9IGdpcmwucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5vYmplY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iakVsZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iakVsZW0uaW5uZXJUZXh0ID0gYEknbSBhbHJlYWR5IGF0dHJhY3RlZCB0byB5b3UuIEZpbmQgbWUgaW4geW91ciBIYXJlbSFgO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY29sb3IgJiYgcmFyaXR5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmFpZE5hbWVDb250YWluZXIgPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLnJhaWQtbmFtZScpO1xuICAgICAgICAgICAgICAgIGlmIChyYWlkTmFtZUNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgICAgICByYWlkTmFtZUNvbnRhaW5lci5zdHlsZS5jb2xvciA9IHRoaXMucmFyaXR5Q29sb3JzW3Jhcml0eV0gfHwgJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZmlnaHRfaWNvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpZ2h0SWNvbiA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcuaHVkQmF0dGxlUHRzX21peF9pY24nKTtcbiAgICAgICAgICAgICAgICBpZiAoZmlnaHRJY29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpZ2h0SWNvbi5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKC9pbWFnZXMvcGljdHVyZXMvZGVzaWduL2ljX2VuZXJneV9maWdodC5wbmcpJztcbiAgICAgICAgICAgICAgICAgICAgZmlnaHRJY29uLnN0eWxlLmJhY2tncm91bmRTaXplID0gJzI0cHgnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNoYWRvd3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsZWZ0SW1hZ2UgPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxJbWFnZUVsZW1lbnQ+KCcuZ2lybC1pbWcubGVmdCcpO1xuICAgICAgICAgICAgICAgIGlmIChsZWZ0SW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdEltYWdlLnNyYyA9IGxlZnRJbWFnZS5zcmMucmVwbGFjZSgnLWJsYWNrJywgJycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmFpZENhcmQuY2xhc3NMaXN0LmNvbnRhaW5zKCdtdWx0aXBsZS1naXJsJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRJbWFnZSA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEltYWdlRWxlbWVudD4oJy5naXJsLWltZy5yaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmlnaHRJbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmlnaHRJbWFnZS5zcmMgPSByaWdodEltYWdlLnNyYy5yZXBsYWNlKCdhdmIwLnBuZycsICdncmFkZV9za2lucy9ncmFkZV9za2luMS5wbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0SW1hZ2Uuc3JjID0gcmlnaHRJbWFnZS5zcmMucmVwbGFjZSgnLWJsYWNrJywgJycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5leWUnKS5mb3JFYWNoKGUgPT4gZS5yZW1vdmUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgdHlwZSB7IEdpcmxEYXRhLCBMb3ZlUmFpZCB9IGZyb20gJy4uLy4uL2dhbWUtdHlwZXMnO1xuaW1wb3J0IHsgbHNHZXQsIGxzU2V0LCBsc1JtIH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5pbXBvcnQgeyBnZXRHaXJsRGljdGlvbmFyeSB9IGZyb20gJy4vZ2FtZURhdGEnO1xuXG50eXBlIFJhaWRDb3B5QnV0dG9uID0gSFRNTERpdkVsZW1lbnQgJiB7IF9ib3VuZENvcHlLZXlIYW5kbGVyPzogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB2b2lkIH07XG5cbmV4cG9ydCBjbGFzcyBMb3ZlUmFpZHNQYXJzZXIgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBnaXJsRGljdDogUmVhZG9ubHlNYXA8c3RyaW5nLCBHaXJsRGF0YT4gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIF9ib3VuZEluc2VydEJ1dHRvbj86ICgpID0+IHZvaWQ7XG5cbiAgICAvKlxuICAgICogUmFpZCBJRCwgQW5ub3VuY2VtZW50IFR5cGUsIEJhY2tncm91bmQgSUQsIEV2ZW50IE5hbWUsIFN0YXJ0IERhdGV0aW1lLFxuICAgICogRW5kIERhdGV0aW1lLCBEdXJhdGlvbiwgUmFpZCBTdGF0dXMsIFNvdXJjZSwgR2lybCBJRCxcbiAgICAqIEdpcmwgTmFtZSwgUmFyaXR5LCBNYXggR3JhZGUsIEZpcnN0IEFwcGVhcmFuY2UsIFNvdXJjZSBJRCxcbiAgICAqIEhhcyBTa2luKHMpXG4gICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdsb3ZlUmFpZHNQYXJzZXInXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkxvdmUgUmFpZHMgZXhwb3J0XCIsIFwiQWRkIGEgYnV0dG9uIHRvIGNvcHkgbmV3IHJhaWRzIGluIGEgc3ByZWFkc2hlZXQtcmVhZHkgZm9ybWF0LlwiKVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xvdmUtcmFpZHMuaHRtbCcpXG4gICAgfVxuXG4gICAgY2FwaXRhbGl6ZUZpcnN0KHN0cjogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBzdHIgPyBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSkgOiBzdHI7XG4gICAgfVxuXG4gICAgZ2V0QW5ub3VuY2VtZW50VHlwZSh0eXBlOiBMb3ZlUmFpZFsnaWRfYW5ub3VuY2VtZW50X3R5cGUnXSkge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIFwiRnVsbFwiO1xuICAgICAgICAgICAgY2FzZSAyOiByZXR1cm4gXCJQYXJ0aWFsXCI7XG4gICAgICAgICAgICBjYXNlIDM6IHJldHVybiBcIk5vbmVcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBcIlVua25vd25cIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFNvdXJjZUlEKGV2ZW50OiBMb3ZlUmFpZCkge1xuICAgICAgICBjb25zdCBzb3VyY2VfaWQgPSBOdW1iZXIoZXZlbnQucmFpZF9tb2R1bGVfcGspO1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LnJhaWRfbW9kdWxlX3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NlYXNvbic6IHJldHVybiAwO1xuICAgICAgICAgICAgY2FzZSAnY2hhbXBpb24nOiByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHNvdXJjZV9pZCkgPyBzb3VyY2VfaWQgOiAtMjtcbiAgICAgICAgICAgIGNhc2UgJ3Ryb2xsJzogcmV0dXJuIE51bWJlci5pc0Zpbml0ZShzb3VyY2VfaWQpID8gc291cmNlX2lkICsgMTAgOiAtMjtcbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdpcmxIYXNTa2lucyhldmVudDogTG92ZVJhaWQpIHtcbiAgICAgICAgY29uc3QgaGFzU2tpbnMgPSBBcnJheS5pc0FycmF5KGV2ZW50Py5naXJsX2RhdGE/LmdyYWRlX3NraW5zKSAmJiBldmVudC5naXJsX2RhdGEuZ3JhZGVfc2tpbnMubGVuZ3RoID4gMDtcbiAgICAgICAgaWYgKGhhc1NraW5zKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJYXCI7XG4gICAgICAgIH0gZWxzZSByZXR1cm4gXCJPXCI7XG4gICAgfVxuXG4gICAgZm9ybWF0RXZlbnRSb3coZXZlbnQ6IExvdmVSYWlkKSB7XG4gICAgICAgIGNvbnN0IGR1cmF0aW9uSG91cnMgPSBNYXRoLmZsb29yKE51bWJlcihldmVudC5ldmVudF9kdXJhdGlvbl9zZWNvbmRzKSAvIDM2MDApO1xuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGAke2R1cmF0aW9uSG91cnN9IGhvdXJzYDtcblxuICAgICAgICBjb25zdCBnaXJsID0gdGhpcy5naXJsRGljdD8uZ2V0KFN0cmluZyhldmVudC5pZF9naXJsKSkgfHwge307XG4gICAgICAgIGNvbnN0IHsgbmFtZSA9ICdVbmtub3duJywgcmFyaXR5ID0gJ04vQScsIGdyYWRlID0gMCB9ID0gZ2lybDtcblxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgZXZlbnQuaWRfcmFpZCxcbiAgICAgICAgICAgIHRoaXMuZ2V0QW5ub3VuY2VtZW50VHlwZShldmVudC5pZF9hbm5vdW5jZW1lbnRfdHlwZSksXG4gICAgICAgICAgICBldmVudC5iYWNrZ3JvdW5kX2lkLFxuICAgICAgICAgICAgZXZlbnQuZXZlbnRfbmFtZSxcbiAgICAgICAgICAgIGV2ZW50LnN0YXJ0X2RhdGV0aW1lLFxuICAgICAgICAgICAgZXZlbnQuZW5kX2RhdGV0aW1lLFxuICAgICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgICAgICBldmVudC5zdGF0dXMsXG4gICAgICAgICAgICBldmVudC5yYWlkX21vZHVsZV90eXBlLFxuICAgICAgICAgICAgZXZlbnQuaWRfZ2lybCxcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICB0aGlzLmNhcGl0YWxpemVGaXJzdChyYXJpdHkpLFxuICAgICAgICAgICAgZ3JhZGUsXG4gICAgICAgICAgICBcIlwiLCAvLyBvbmUgYmxhbmsgdGFiIHJlc2VydmVkIGZvciBmaXJzdCBhcHBlYXJhbmNlIGluIEdTaGVldHNcbiAgICAgICAgICAgIHRoaXMuZ2V0U291cmNlSUQoZXZlbnQpLFxuICAgICAgICAgICAgdGhpcy5naXJsSGFzU2tpbnMoZXZlbnQpXG4gICAgICAgIF0uam9pbihcIlxcdFwiKTtcbiAgICB9XG5cbiAgICBhc3luYyBjb3B5VG9DbGlwYm9hcmQodGV4dDogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQ2xpcGJvYXJkIEFQSSBmYWlsZWQsIHVzaW5nIGV4ZWNDb21tYW5kIGZhbGxiYWNrOicsIGVycik7XG4gICAgICAgICAgICBjb25zdCB0ZXh0YXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyk7XG4gICAgICAgICAgICB0ZXh0YXJlYS52YWx1ZSA9IHRleHQ7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRleHRhcmVhKTtcbiAgICAgICAgICAgIHRleHRhcmVhLnNlbGVjdCgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGV4dGFyZWEucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBoYW5kbGVDb3B5Q2xpY2soZXZ0OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHN0b3JhZ2VLZXkgPSAnTGFzdFNhdmVkUmFpZElEJztcblxuICAgICAgICAvLyBTaGlmdCArIEN0cmwgKyBDbGljayDihpIgY2xlYXIgc3RvcmVkIElEXG4gICAgICAgIGlmIChldnQuc2hpZnRLZXkgJiYgZXZ0LmN0cmxLZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpcm1DbGVhciA9IGNvbmZpcm0oJ+KaoO+4jyBEbyB5b3Ugd2FudCB0byBjbGVhciB0aGUgc2F2ZWQgbGFzdCByYWlkIElEIGZvciB0aGlzIHNpdGU/Jyk7XG4gICAgICAgICAgICBpZiAoY29uZmlybUNsZWFyKSB7XG4gICAgICAgICAgICAgICAgbHNSbShzdG9yYWdlS2V5KTtcbiAgICAgICAgICAgICAgICBhbGVydCgn4pyFIExhc3Qgc2F2ZWQgSUQgY2xlYXJlZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvYWQgcmFpZHNcbiAgICAgICAgY29uc3QgbG9jYWxMb3ZlUmFpZHMgPSAodHlwZW9mIGxvdmVfcmFpZHMgIT09ICd1bmRlZmluZWQnICYmIEFycmF5LmlzQXJyYXkobG92ZV9yYWlkcykpID8gbG92ZV9yYWlkcyA6IFtdO1xuICAgICAgICBpZiAoIWxvY2FsTG92ZVJhaWRzLmxlbmd0aCkge1xuICAgICAgICAgICAgYWxlcnQoJ+KaoO+4jyBObyBsb3ZlX3JhaWRzIGZvdW5kIG9uIHRoaXMgcGFnZS4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5naXJsRGljdCkge1xuICAgICAgICAgICAgYWxlcnQoJ+KaoO+4jyBUaGUgSEgrKyBnaXJsIGRpY3Rpb25hcnkgY291bGQgbm90IGJlIGxvYWRlZC4gUmVsb2FkIHRoZSBwYWdlIGFuZCB0cnkgYWdhaW4uJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbGFzdFNhdmVkSWROdW1iZXIgPSBwYXJzZUludChTdHJpbmcobHNHZXQoc3RvcmFnZUtleSkpLCAxMCk7XG5cbiAgICAgICAgLy8gSWYgU2hpZnQgaXMgaGVsZCBPUiBubyBzYXZlZCBJRCBleGlzdHMg4oaSIGFzayBhZ2FpblxuICAgICAgICBpZiAoaXNOYU4obGFzdFNhdmVkSWROdW1iZXIpIHx8IGV2dC5zaGlmdEtleSkge1xuICAgICAgICAgICAgY29uc3QgbGFzdFNhdmVkSWQgPSBwcm9tcHQoJ1BsZWFzZSBlbnRlciB0aGUgbGFzdCBzYXZlZCBJRDonKTtcbiAgICAgICAgICAgIGxhc3RTYXZlZElkTnVtYmVyID0gcGFyc2VJbnQoU3RyaW5nKGxhc3RTYXZlZElkKSwgMTApO1xuXG4gICAgICAgICAgICBpZiAoaXNOYU4obGFzdFNhdmVkSWROdW1iZXIpKSB7XG4gICAgICAgICAgICAgICAgYWxlcnQoJ+KdjCBJbnZhbGlkIElEIGVudGVyZWQuIFBsZWFzZSBlbnRlciBhIHZhbGlkIG51bWJlci4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaWx0ZXIgbmV3IGV2ZW50c1xuICAgICAgICBjb25zdCBmaWx0ZXJlZERhdGEgPSBsb2NhbExvdmVSYWlkcy5maWx0ZXIoZXZlbnQgPT4gTnVtYmVyKGV2ZW50LmlkX3JhaWQpID4gbGFzdFNhdmVkSWROdW1iZXIpO1xuICAgICAgICBpZiAoIWZpbHRlcmVkRGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFsZXJ0KGDihLnvuI8gTm8gbmV3IGV2ZW50cyBmb3VuZCB3aXRoIElEIGdyZWF0ZXIgdGhhbiAke2xhc3RTYXZlZElkTnVtYmVyfWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZm9ybWF0dGVkRGF0YSA9IGZpbHRlcmVkRGF0YS5tYXAodGhpcy5mb3JtYXRFdmVudFJvdy5iaW5kKHRoaXMpKS5qb2luKFwiXFxuXCIpO1xuXG4gICAgICAgIGlmICghYXdhaXQgdGhpcy5jb3B5VG9DbGlwYm9hcmQoZm9ybWF0dGVkRGF0YSkpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfinYwgQ291bGQgbm90IGNvcHkgdGhlIHJhaWRzLiBUaGUgbGFzdCBzYXZlZCBJRCB3YXMga2VwdC4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNhdmUgaGlnaGVzdCBJRFxuICAgICAgICBjb25zdCBtYXhJZCA9IE1hdGgubWF4KC4uLmZpbHRlcmVkRGF0YS5tYXAoZSA9PiBOdW1iZXIoZS5pZF9yYWlkKSkpO1xuICAgICAgICBsc1NldChzdG9yYWdlS2V5LCBtYXhJZCk7XG5cbiAgICAgICAgYWxlcnQoJ+KchSBEYXRhIGNvcGllZCB0byBjbGlwYm9hcmQhIFlvdSBjYW4gbm93IHBhc3RlIGl0IGludG8gR1NoZWV0cy4nKTtcbiAgICB9XG5cbiAgICBjcmVhdGVDb3B5QnV0dG9uKCkge1xuICAgICAgICBjb25zdCBidXR0b246IFJhaWRDb3B5QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdyZW1pbmRlci1jb3B5Jyk7XG4gICAgICAgIGJ1dHRvbi5zdHlsZS5jc3NUZXh0ID0gYFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgIzAwYWFmZiAwLCAjMDA2Njg4IDUwJSwgIzAwNTU3NyA1MSUsICMwMGFhZmYgMTAwJSk7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgICAgICB3aWR0aDogMzJweDtcbiAgICAgICAgICAgIGhlaWdodDogMzJweDtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiAxMHB4O1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgcmlnaHQ6IDQuNXJlbTtcbiAgICAgICAgICAgIHRvcDogMC4ycmVtO1xuICAgICAgICAgICAgZm9udC1zaXplOiAxOHB4O1xuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDMycHg7XG4gICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kIDAuMnMgZWFzZTtcbiAgICAgICAgYDtcbiAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ/Cfk4snO1xuICAgICAgICBsZXQgYnV0dG9uVGl0bGUgPSAnQ2xpY2sgPSBjb3B5IG5ldyByYWlkcy4gU2hpZnQgLyBTaGlmdCArIEN0cmwgYXZhaWxhYmxlLic7XG4gICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3Rvb2x0aXAnLCAnJyk7XG4gICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuXG4gICAgICAgIGNvbnN0IF9ib3VuZENvcHlLZXlIYW5kbGVyID0gKGU6IEtleWJvYXJkRXZlbnQpID0+IHRoaXMudXBkYXRlQ29weUJ1dHRvbihlLCBidXR0b24pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIF9ib3VuZENvcHlLZXlIYW5kbGVyKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgX2JvdW5kQ29weUtleUhhbmRsZXIpO1xuICAgICAgICAvLyBzdG9yZSBoYW5kbGVyIHJlZmVyZW5jZSBzbyBjYWxsZXJzIGNhbiByZW1vdmUgbGlzdGVuZXJzIGlmIGJ1dHRvbiBpcyByZW1vdmVkIGxhdGVyXG4gICAgICAgIGJ1dHRvbi5fYm91bmRDb3B5S2V5SGFuZGxlciA9IF9ib3VuZENvcHlLZXlIYW5kbGVyO1xuICAgICAgICBidXR0b24ub25jbGljayA9IChlKSA9PiB0aGlzLmhhbmRsZUNvcHlDbGljayhlKTtcbiAgICAgICAgdGhpcy51cGRhdGVDb3B5QnV0dG9uKHsgc2hpZnRLZXk6IGZhbHNlLCBjdHJsS2V5OiBmYWxzZSB9LCBidXR0b24pO1xuICAgICAgICByZXR1cm4gYnV0dG9uO1xuICAgIH1cblxuICAgIHVwZGF0ZUNvcHlCdXR0b24oZTogUGljazxLZXlib2FyZEV2ZW50LCAnc2hpZnRLZXknIHwgJ2N0cmxLZXknPiwgYnV0dG9uOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBsZXQgYnV0dG9uVGl0bGUgPSAnJztcbiAgICAgICAgaWYgKGUuc2hpZnRLZXkgJiYgZS5jdHJsS2V5KSB7XG4gICAgICAgICAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgI2ZmNjY2NiAwLCAjYWEwMDAwIDEwMCUpXCI7IC8vIHJlZFxuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ/Cfl5HvuI8nO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnU2hpZnQgKyBDdHJsICsgQ2xpY2sgPSBjbGVhciBzYXZlZCBJRCc7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgI2ZmZGQ2NiAwLCAjY2M5OTAwIDEwMCUpXCI7IC8vIHllbGxvd1xuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ+Kcj++4jyc7XG4gICAgICAgICAgICBidXR0b25UaXRsZSA9ICdTaGlmdCArIENsaWNrID0gcHJvbXB0IGZvciBJRC4nO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgIzAwYWFmZiAwLCAjMDA2Njg4IDUwJSwgIzAwNTU3NyA1MSUsICMwMGFhZmYgMTAwJSlcIjsgLy8gZGVmYXVsdCBibHVlXG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAn8J+Tiyc7XG4gICAgICAgICAgICBidXR0b25UaXRsZSA9ICdDbGljayA9IGNvcHkgbmV3IHJhaWRzLiBTaGlmdCAvIFNoaWZ0ICsgQ3RybCBhdmFpbGFibGUuJztcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5zZXJ0QnV0dG9uKCkge1xuICAgICAgICBjb25zdCBub3RpZmljYXRpb25CdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnV0dG9uLW5vdGlmaWNhdGlvbi1hY3Rpb24ubm90aWZfYnV0dG9uX3MnKTtcbiAgICAgICAgaWYgKG5vdGlmaWNhdGlvbkJ1dHRvbiAmJiAhZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlbWluZGVyLWNvcHknKSkge1xuICAgICAgICAgICAgY29uc3QgY29weUJ1dHRvbiA9IHRoaXMuY3JlYXRlQ29weUJ1dHRvbigpO1xuICAgICAgICAgICAgbm90aWZpY2F0aW9uQnV0dG9uLnBhcmVudE5vZGU/Lmluc2VydEJlZm9yZShjb3B5QnV0dG9uLCBub3RpZmljYXRpb25CdXR0b24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgICAgIHRoaXMuZ2lybERpY3QgPSBhd2FpdCBnZXRHaXJsRGljdGlvbmFyeSgpO1xuXG4gICAgICAgIHRoaXMuX2JvdW5kSW5zZXJ0QnV0dG9uID0gdGhpcy5pbnNlcnRCdXR0b24uYmluZCh0aGlzKTtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHRoaXMuaW5zZXJ0QnV0dG9uKCk7XG4gICAgICAgIGVsc2Ugd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzLl9ib3VuZEluc2VydEJ1dHRvbiwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuXG5leHBvcnQgY2xhc3MgQWN0aXZpdHlQYXJzZXIgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnYWN0aXZpdHlQYXJzZXInXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIk1pc3Npb24gY29waWVyXCIsIFwiRW5hYmxlIHRoZSBjb3B5IHRvb2wgZm9yIGxlZ2VuZGFyeSBtaXNzaW9uIGRldGFpbHMuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAnbWlzc2lvbkNvcGllcicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTGVnZW5kYXJ5IGRldGFpbHNcIiwgXCJDbGljayBhIGxlZ2VuZGFyeSBtaXNzaW9u4oCZcyB0aXRsZSwgZGVzY3JpcHRpb24sIG9yIGltYWdlIHRvIGNvcHkgaXQuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2FjdGl2aXRpZXMuaHRtbCcpXG4gICAgfVxuXG4gICAgYXN5bmMgY29weVRvQ2xpcGJvYXJkKHRleHQ6IHN0cmluZykge1xuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgICAgY29uc3QgdG9hc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG9hc3QudGV4dENvbnRlbnQgPSAnQ29waWVkISc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICAgICAgdG9hc3Quc3R5bGUuYm90dG9tID0gJzEwcHgnO1xuICAgICAgICB0b2FzdC5zdHlsZS5yaWdodCA9ICcxMHB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUuYmFja2dyb3VuZCA9ICdyZ2JhKDAsMCwwLDAuNyknO1xuICAgICAgICB0b2FzdC5zdHlsZS5jb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnBhZGRpbmcgPSAnNXB4IDEwcHgnO1xuICAgICAgICB0b2FzdC5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNXB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUuekluZGV4ID0gJzk5OTknO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvYXN0KTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0b2FzdC5yZW1vdmUoKSwgMTAwMCk7XG4gICAgfVxuXG4gICAgcnVuKHsgbWlzc2lvbkNvcGllciB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgaWYgKG1pc3Npb25Db3BpZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJpZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWlzc2lvbl9lbnRyeS5sZWdlbmRhcnknKTtcbiAgICAgICAgICAgIGlmICghZW50cmllcy5sZW5ndGgpIHJldHVybjtcblxuICAgICAgICAgICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbWdEaXYgPSBlbnRyeS5xdWVyeVNlbGVjdG9yPEhUTUxJbWFnZUVsZW1lbnQ+KCcubWlzc2lvbl9pbWFnZSBpbWcnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUFsbCA9IGVudHJ5LnF1ZXJ5U2VsZWN0b3I8SFRNTEhlYWRpbmdFbGVtZW50PignLm1pc3Npb25fZGV0YWlscyBoMScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlc2MgPSBlbnRyeS5xdWVyeVNlbGVjdG9yPEhUTUxQYXJhZ3JhcGhFbGVtZW50PignLm1pc3Npb25fZGV0YWlscyBwJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW1nRGl2KSB7XG4gICAgICAgICAgICAgICAgICAgIGltZ0Rpdi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgICAgIGltZ0Rpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKGltZ0Rpdi5zcmMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodGl0bGVBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVBbGwuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvdXRlclRpdGxlID0gdGl0bGVBbGwucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5ldmVudC1taXNzaW9uLWNvbnRlbnQtdGV4dCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob3V0ZXJUaXRsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJUaXRsZS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlclRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZCgob3V0ZXJUaXRsZS50ZXh0Q29udGVudCA/PyAnJykudHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGl0bGVBbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgZS50YXJnZXQuY2xvc2VzdCgnLmV2ZW50LW1pc3Npb24tY29udGVudC10ZXh0JykpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlQ2xvbmUgPSB0aXRsZUFsbC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEhlYWRpbmdFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVDbG9uZS5xdWVyeVNlbGVjdG9yKCcuZXZlbnQtbWlzc2lvbi1jb250ZW50LXRleHQnKT8ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9ICh0aXRsZUNsb25lLnRleHRDb250ZW50ID8/ICcnKS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZCh0aXRsZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkZXNjKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2Muc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICBkZXNjLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQoZGVzYy5pbm5lclRleHQudHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgICAgICB9XG4gICAgfVxufVxuIiwgIlt7XCJ2ZXJzaW9uXCI6XCIwLjcuN1wiLFwiY2hhbmdlc1wiOltcIkFwcGx5IERvbuKAmXQgc2hvdyBhZ2FpbiB3aGVuIHRoZSBjaGFuZ2Vsb2cgY2xvc2VzIGFuZCB1cGRhdGUgdGhlIEhIKysgc2V0dGluZyBpbW1lZGlhdGVseS5cIixcIkdpdmUgdGhlIHNpbGVudCB1cGRhdGUgaWNvbiBpdHMgb3duIHRvb2x0aXAuXCIsXCJLZWVwIGxvbmcgY29udGVzdCB0aXRsZXMgaW4gdGhlIGNhcmQgaGVhZGVyIGFsb25nc2lkZSB0aGUgcmFuayBjb250cm9scy5cIixcIklkZW50aWZ5IHRoZSBEZXYgYnVpbGQgYmVzaWRlIGl0cyB2ZXJzaW9uIGluIHNldHRpbmdzLlwiXX0se1widmVyc2lvblwiOlwiMC43LjZcIixcImNoYW5nZXNcIjpbXCJDaG9vc2UgVG9wIG9yIE15IHJhbmsgb24gYW55IGFjdGl2ZSBjb250ZXN0LiBKYXJ2aXMgcmVtZW1iZXJzIGVhY2ggY29udGVzdOKAmXMgY2hvaWNlIHdoZW4gc3dpdGNoaW5nIGFuZCBhcHBsaWVzIHRoZSBzYW1lIHBvc2l0aW9uIGFuZCBzY3JvbGwgcnVsZXMgdG8gZmluaXNoZWQgY29udGVzdHMuXCIsXCJLZWVwIGdhbWUgc2Nyb2xsIGFuaW1hdGlvbnMgZnJvbSByZXN0YXJ0aW5nIHdoaWxlIHlvdSBzY3JvbGwgYnkgaGFuZCBkdXJpbmcgYSBjb250ZXN0IHN3aXRjaC5cIixcIlNlZSBhIHNtYWxsIGFyYy1yZWFjdG9yIGljb24gYmVzaWRlIEhIKysgd2hlbiBhIHNpbGVudCB1cGRhdGUgbm90aWNlIGlzIGF2YWlsYWJsZS5cIl19LHtcInZlcnNpb25cIjpcIjAuNy41XCIsXCJjaGFuZ2VzXCI6W1wiS2VlcCB0aGUgaG9tZXBhZ2UgcmVzcG9uc2l2ZSBhZnRlciBjbG9zaW5nIHRoZSBjaGFuZ2Vsb2cgYW5kIGNob29zZSBTaWxlbnQgY2hhbmdlbG9nIGZyb20gdGhlIHBvcHVwLlwiLFwiU3RvcCBhdXRvbWF0aWMgc2lkZWJhciBzY3JvbGxpbmcgb24gY29udGVzdCBzd2l0Y2hlcyBieSBkZWZhdWx0IGFuZCB1c2UgVG9wIG9yIE15IHJhbmsgd2hlbmV2ZXIgeW91IHN3aXRjaC5cIixcIkJyaW5nIHRoZSBzZWxlY3RlZCBjYXJkIGludG8gdmlldyB3aGVuIHlvdSB1c2UgYSBjb250ZXN0IHNob3J0Y3V0LlwiXX0se1widmVyc2lvblwiOlwiMC43LjRcIixcImNoYW5nZXNcIjpbXCJTZWUgeW91ciByYW5rIGluIGVhY2ggYWN0aXZlIGNvbnRlc3QgYmVzaWRlIHRoZSBjbG9zZSBidXR0b24gYW5kIHN3aXRjaCBsZWFkZXJib2FyZHMgd2l0aG91dCBtb3ZpbmcgdGhlIGNvbnRlc3QgbGlzdC5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4zXCIsXCJjaGFuZ2VzXCI6W1wiU2VlIGF1dG9tYXRpYyBjaGFuZ2Vsb2dzIG9ubHkgd2hlbiBsb2FkaW5nIHRoZSBob21lcGFnZSBhZnRlciBhbiB1cGRhdGUuXCIsXCJFbmFibGUgU2lsZW50IGNoYW5nZWxvZyB0byBnZXQgYSBOZXcgYnV0dG9uIGJlc2lkZSBISCsrIGFuZCBvcGVuIHRoZSBub3RlcyB3aGVuIHlvdeKAmXJlIHJlYWR5LlwiLFwiS2VlcCB0aGUgY29udGVzdCBsaXN0IGFuZCBlYWNoIGxlYWRlcmJvYXJkIGluIHBsYWNlIHdoZW4gc3dpdGNoaW5nIGNvbnRlc3RzIHdpdGggU3RvcCBzY3JvbGxpbmcgb24gY29udGVzdCBzd2l0Y2hlcy5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4yXCIsXCJjaGFuZ2VzXCI6W1wiT3BlbiB0aGUgYm90dG9tIGFjdGl2ZSBjb250ZXN0IGF0IHlvdXIgcmFuayBieSBkZWZhdWx0LiBDaG9vc2UgQ2JDLCBDQ0MsIG9yIExDIHRvIHByZWZlciB0aGF0IGV2ZW50IHdoZW4gYXZhaWxhYmxlLlwiLFwiVHVybiBvZmYgYXV0b21hdGljIHVwZGF0ZSBub3RpY2VzIHdpdGggRG9u4oCZdCBzaG93IGFnYWluIGluIHRoZSBjaGFuZ2Vsb2cgcG9wdXAuIFZpZXcgY2hhbmdlbG9nIHN0YXlzIGF2YWlsYWJsZSBpbiBzZXR0aW5ncy5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4xXCIsXCJjaGFuZ2VzXCI6W1wiS2VlcCB0aGUgY2hhbmdlbG9nIGNlbnRlcmVkIHdoZW4gdGhlIGdhbWUgd2luZG93IGlzIHJlc2l6ZWQuXCIsXCJDbGVhbiB1cCBzYXZlZCBwbGF5ZXIgbmFtZXMsIGV4cGxhaW4gdW5rbm93biBuYW1lcyBvbiBob3ZlciwgYW5kIGdpdmUgUmVtb3ZlIGJ1dHRvbnMgbW9yZSByb29tLlwiXX0se1widmVyc2lvblwiOlwiMC43LjBcIixcImNoYW5nZXNcIjpbXCJTZWUgd2hhdCBjaGFuZ2VkIGluIEphcnZpcyB0aGUgZmlyc3QgdGltZSBhIG5ldyB2ZXJzaW9uIHJ1bnMuXCIsXCJPcGVuIFZpZXcgY2hhbmdlbG9nIGZyb20gSEgrKyBzZXR0aW5ncyBhdCBhbnkgdGltZSwgZXZlbiB3aXRoIGF1dG9tYXRpYyBub3RpY2VzIHR1cm5lZCBvZmYuXCIsXCJFeHBhbmQgRWFybGllciB2ZXJzaW9ucyB0byByZWFkIHBhc3QgdXBkYXRlcy5cIl19LHtcInZlcnNpb25cIjpcIjAuNi43XCIsXCJjaGFuZ2VzXCI6W1wiTWFrZSBtYXJraW5nIG9uZSBhY3Rpb24gcGVyIHBsYXllciwgYmFja2ZpbGwgbmFtZXMgZm9yIG9sZGVyIG1hcmtzLCB1c2UgdGhlIGJyYWNrZXQtYmFzZWQgcHJvbW90aW9uIHRhcmdldCwgYW5kIHNpbXBsaWZ5IHRoZSBzZWxlY3RlZCBjb250ZXN0IGJ1dHRvbnMgYW5kIHZlcnNpb24gYmFkZ2UuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuNlwiLFwiY2hhbmdlc1wiOltcIkFkZCBzZXR0aW5nIGhlbHAgaW4gSEgrKywgaW1wcm92ZSBtYXJrIGNvbnRyYXN0IGFuZCBtYW5hZ2VtZW50LCBhbmQgYWRkIGF1dG9tYXRpYyBjb250ZXN0IGRlZmF1bHRzLlwiLFwiUmVuYW1lIHRoZSBzZXBhcmF0ZWx5IGluc3RhbGxlZCB0ZXN0aW5nIHVzZXJzY3JpcHQgdG8gRGV2LlwiXX0se1widmVyc2lvblwiOlwiMC42LjVcIixcImNoYW5nZXNcIjpbXCJNb3ZlIHRoZSB1c2Vyc2NyaXB0IHNvdXJjZSBpbnRvIFR5cGVTY3JpcHQgbW9kdWxlcyBhbmQgYWRkIHNlcGFyYXRlIHN0YWJsZSBhbmQgdGVzdGluZyBidWlsZHMuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuNFwiLFwiY2hhbmdlc1wiOltcIlByZXZlbnQgcGlubmVkIGNvbnRlc3Qgc3RhcnR1cCBzY3JvbGxpbmcsIGtlZXAgbmF0aXZlIHN0YXJ0dXAgd2l0aG91dCBhIHBpbiwgYW5kIGNsZWFyIGZpbmlzaGVkIHBpbnNcIl19LHtcInZlcnNpb25cIjpcIjAuNi4zXCIsXCJjaGFuZ2VzXCI6W1wiU3RvcCBib3RoIGNvbnRlc3Qgc3RhcnR1cCBzY3JvbGxzLCBpc29sYXRlIHRoZSBzZWxlY3RlZCBsZWFkZXJib2FyZCwgYW5kIHJlc3RvcmUgcGlubmVkIGNvbnRlc3RzIGF0IFRvcCBvciBNeSByYW5rXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuMlwiLFwiY2hhbmdlc1wiOltcIlBpbiBjb250ZXN0cyBvbiB0aGVpciBjYXJkcywgaGlkZSB0aGUgc3RhcnR1cCBzY3JvbGwsIGFuZCB1c2UgcmlnaHQtY2xpY2sgbWFya2luZyB3aXRoIGlzb2xhdGVkIHNldHRpbmdzIHNjcm9sbGluZ1wiXX0se1widmVyc2lvblwiOlwiMC42LjFcIixcImNoYW5nZXNcIjpbXCJSZWFkIG5hdGl2ZSBNYW5nYSBSUEcgY29udGVzdCB0aXRsZXMgYW5kIHJlY29nbml6ZSBhY3RpdmUgY2FyZHMgd2hlbiBjb250ZXN0IGRhdGEgaXMgdW5hdmFpbGFibGVcIl19LHtcInZlcnNpb25cIjpcIjAuNi4wXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIGEgY29udGVzdCBzdGFydCBwcmVmZXJlbmNlLCBjb250aW51b3VzIG1hcmtpbmcsIGFuZCBjb21wYWN0IHNldHRpbmdzIHdpdGggYSB2ZXJzaW9uIGxhYmVsXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjUuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBsZWFndWUgYW5kIGNvbnRlc3QgcGxheWVyIG1hcmtpbmcgd2l0aCBjdXN0b20gY29sb3JzLCBjb21wYWN0IHNldHRpbmdzLCBhbmQgbGltaXQgVG9wIDIwIHRvIHByb21vdGFibGUgbGVhZ3Vlc1wiXX0se1widmVyc2lvblwiOlwiMC40LjJcIixcImNoYW5nZXNcIjpbXCJGaXggbW9kdWxlIHN0YXJ0dXAsIGxlYWd1ZSBjb250cm9scywgYW5kIHJhaWQgZXhwb3J0czsgYWRkIHRoZSBUb3AgMjAgbGVhZ3VlIHRhcmdldFwiXX0se1widmVyc2lvblwiOlwiMC40LjFcIixcImNoYW5nZXNcIjpbXCJGaXggTG92ZSBSYWlkcyBzaGFkb3dzIHJlcGxhY2VtZW50XCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjQuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBBY3Rpdml0eVBhcnNlciBtb2R1bGVcIl19LHtcInZlcnNpb25cIjpcIjAuMy4xXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIGhhcmVtIGxpbmsgaW5zaWRlIGxvdmUgcmFpZCBjYXJkc1wiXX0se1widmVyc2lvblwiOlwiMC4zLjBcIixcImNoYW5nZXNcIjpbXCJBZGQgTG92ZVJhaWRzQWRkb24gYW5kIExvdmVSYWlkc1BhcnNlciBtb2R1bGVzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjIuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBSZW1vdmVQYXNzTG9jayBtb2R1bGVcIl19LHtcInZlcnNpb25cIjpcIjAuMS4zXCIsXCJjaGFuZ2VzXCI6W1wiQmV0dGVyIGNvZGUgcHJhY3RpY2VzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjEuMlwiLFwiY2hhbmdlc1wiOltcIlBvbGlzaGluZyBhbmQgdXBkYXRlIGxpbmtzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjEuMVwiLFwiY2hhbmdlc1wiOltcIkFkZCBGcmllbmRBbmRGb2VzIG1vZHVsZVwiXX0se1widmVyc2lvblwiOlwiMC4wLjFcIixcImNoYW5nZXNcIjpbXCJJbml0aWFsIHJlbGVhc2VcIl19XSIsICJpbnRlcmZhY2UgQ2hhbmdlbG9nVmlldyB7XG4gICAgY29udGVudDogSFRNTEVsZW1lbnQ7XG4gICAgY2xvc2VCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xuICAgIHNob3VsZE9wZW46ICgpID0+IGJvb2xlYW47XG4gICAgb25PcGVuOiAoKSA9PiB2b2lkO1xuICAgIG9uQ2xvc2U6ICgpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93Q2hhbmdlbG9nUG9wdXAodmlldzogQ2hhbmdlbG9nVmlldykge1xuICAgIGlmICghdmlldy5zaG91bGRPcGVuKCkpIHtcbiAgICAgICAgdmlldy5vbkNsb3NlKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaWFsb2cnKTtcbiAgICBkaWFsb2cuY2xhc3NOYW1lID0gJ2phcnZpcy1jaGFuZ2Vsb2ctcG9wdXAnO1xuICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsICdqYXJ2aXMtY2hhbmdlbG9nLXRpdGxlJyk7XG4gICAgZGlhbG9nLmFwcGVuZENoaWxkKHZpZXcuY29udGVudCk7XG5cbiAgICBjb25zdCBmaW5pc2ggPSAoKSA9PiB7XG4gICAgICAgIGlmICghZGlhbG9nLmlzQ29ubmVjdGVkKSByZXR1cm47XG4gICAgICAgIGRpYWxvZy5yZW1vdmUoKTtcbiAgICAgICAgdmlldy5vbkNsb3NlKCk7XG4gICAgfTtcbiAgICAvLyBBcHBseSB0aGUgdXNlcidzIGNob2ljZSBiZWZvcmUgYSBzdWJzZXF1ZW50IGNsaWNrIG9yIHBhZ2UgbmF2aWdhdGlvbi5cbiAgICBjb25zdCBkaXNtaXNzID0gKCkgPT4ge1xuICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgZmluaXNoKCk7XG4gICAgfTtcbiAgICB2aWV3LmNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZGlzbWlzcyk7XG4gICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbmNlbCcsIGV2ZW50ID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZGlzbWlzcygpO1xuICAgIH0pO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCAhPT0gZGlhbG9nKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IGRpYWxvZy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaWYgKGV2ZW50LmNsaWVudFggPCBib3VuZHMubGVmdCB8fCBldmVudC5jbGllbnRYID4gYm91bmRzLnJpZ2h0IHx8XG4gICAgICAgICAgICBldmVudC5jbGllbnRZIDwgYm91bmRzLnRvcCB8fCBldmVudC5jbGllbnRZID4gYm91bmRzLmJvdHRvbSkgZGlzbWlzcygpO1xuICAgIH0pO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGZpbmlzaCwgeyBvbmNlOiB0cnVlIH0pO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaWFsb2cpO1xuICAgIHRyeSB7XG4gICAgICAgIGRpYWxvZy5zaG93TW9kYWwoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgZmluaXNoKCk7XG4gICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBvcGVuIHRoZSBjaGFuZ2Vsb2c6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2aWV3LmNsb3NlQnV0dG9uLmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcbiAgICB2aWV3Lm9uT3BlbigpO1xufVxuIiwgImltcG9ydCByZWxlYXNlTm90ZXMgZnJvbSAnLi4vLi4vLi4vQ0hBTkdFTE9HLm1kJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBISE1vZHVsZSwgdHlwZSBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgc2hvd0NoYW5nZWxvZ1BvcHVwIH0gZnJvbSAnLi9jaGFuZ2Vsb2dQb3B1cCc7XG5cbmNvbnN0IHNlZW5LZXkgPSBgQ2hhbmdlbG9nU2VlbiR7VVNFUlNDUklQVF9DSEFOTkVMfWA7XG5jb25zdCBsYXRlc3RWZXJzaW9uID0gcmVsZWFzZU5vdGVzWzBdLnZlcnNpb247XG5jb25zdCBjb25maWdLZXkgPSAnSkFSVklTX2NoYW5nZWxvZyc7XG5jb25zdCBzaWxlbnRLZXkgPSBgJHtjb25maWdLZXl9X3NpbGVudGA7XG5jb25zdCBzZXR0aW5nc0NhcmQgPSBgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmdbcmVsPVwiJHtjb25maWdLZXl9XCJdYDtcblxuZnVuY3Rpb24gcmVhZFNlZW5WZXJzaW9uKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNlZW4gPSBsc0dldChzZWVuS2V5KTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBzZWVuID09PSAnc3RyaW5nJyAmJiAvXlxcZCtcXC5cXGQrXFwuXFxkKyQvLnRlc3Qoc2VlbikgPyBzZWVuIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc05ld2VyKHZlcnNpb246IHN0cmluZywgcHJldmlvdXM6IHN0cmluZyB8IG51bGwpIHtcbiAgICBpZiAoIXByZXZpb3VzKSByZXR1cm4gdHJ1ZTtcblxuICAgIGNvbnN0IG9sZFBhcnRzID0gcHJldmlvdXMuc3BsaXQoJy4nKS5tYXAoTnVtYmVyKTtcbiAgICBjb25zdCBuZXdQYXJ0cyA9IHZlcnNpb24uc3BsaXQoJy4nKS5tYXAoTnVtYmVyKTtcbiAgICBmb3IgKGNvbnN0IFtpbmRleCwgcGFydF0gb2YgbmV3UGFydHMuZW50cmllcygpKSB7XG4gICAgICAgIGlmIChwYXJ0ICE9PSBvbGRQYXJ0c1tpbmRleF0pIHJldHVybiBwYXJ0ID4gb2xkUGFydHNbaW5kZXhdO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHJlbGVhc2VTZWN0aW9uKHJlbGVhc2U6IHR5cGVvZiByZWxlYXNlTm90ZXNbbnVtYmVyXSkge1xuICAgIGNvbnN0IHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgY29uc3QgaGVhZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgaGVhZGluZy50ZXh0Q29udGVudCA9IGB2JHtyZWxlYXNlLnZlcnNpb259YDtcbiAgICBjb25zdCBjaGFuZ2VzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiByZWxlYXNlLmNoYW5nZXMpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgIGl0ZW0udGV4dENvbnRlbnQgPSBjaGFuZ2U7XG4gICAgICAgIGNoYW5nZXMuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gICAgfVxuICAgIHNlY3Rpb24uYXBwZW5kKGhlYWRpbmcsIGNoYW5nZXMpO1xuICAgIHJldHVybiBzZWN0aW9uO1xufVxuXG5leHBvcnQgY2xhc3MgQ2hhbmdlbG9nIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgcGVuZGluZzogJ2F1dG9tYXRpYycgfCAnbWFudWFsJyB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgb3BlbmVyOiBIVE1MQnV0dG9uRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgdmlld2VkVGhpc1BhZ2UgPSBmYWxzZTtcbiAgICBwcml2YXRlIGxvYWRMaXN0ZW5lcjogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzZXR0aW5nc0luc3RhbGxlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgc2lsZW50ID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBub3RpY2U6IEhUTUxCdXR0b25FbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBub3RpY2VMYXlvdXQ6IFJlc2l6ZU9ic2VydmVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSB3YWl0aW5nRm9yTm90aWNlQW5jaG9yID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdjaGFuZ2Vsb2cnO1xuICAgICAgICBzdXBlcih7IG5hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYToge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscCgnVXBkYXRlIG5vdGljZXMnLCAnU2hvdyB0aGUgY2hhbmdlbG9nIHRoZSBmaXJzdCB0aW1lIHlvdSBsb2FkIHRoZSBob21lcGFnZSBhZnRlciBhbiB1cGRhdGUuIFVzZSBWaWV3IGNoYW5nZWxvZyB0byBvcGVuIGl0IHdoZW5ldmVyIHlvdSBsaWtlLicpLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ3NpbGVudCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKCdTaWxlbnQgY2hhbmdlbG9nJywgJ1Nob3cgYSBzbWFsbCBhcmMtcmVhY3RvciBpY29uIGJlc2lkZSBISCsrIG9uIHRoZSBob21lcGFnZSBhZnRlciBhbiB1cGRhdGUuIENsaWNrIGl0IHRvIHJlYWQgdGhlIGNoYW5nZWxvZy4nKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfSB9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZSA9PT0gJy9ob21lLmh0bWwnO1xuICAgIH1cblxuICAgIGluc3RhbGxTZXR0aW5ncygpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNob3VsZFJ1bigpKSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0dGluZ3NJbnN0YWxsZWQgPSB0cnVlO1xuXG4gICAgICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2V0dGluZ3NDYXJkLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZXR0aW5nc0NhcmQpO1xuICAgICAgICAgICAgaWYgKCFjYXJkIHx8IGNhcmQucXVlcnlTZWxlY3RvcignLmphcnZpcy12aWV3LWNoYW5nZWxvZycpKSByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuc3luY05vdGljZVNldHRpbmdzKCk7XG4gICAgICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbiBqYXJ2aXMtdmlldy1jaGFuZ2Vsb2cnO1xuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ1ZpZXcgY2hhbmdlbG9nJztcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMub3BlbignbWFudWFsJywgYnV0dG9uKSk7XG4gICAgICAgICAgICBjYXJkLmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJ1bih7IHNpbGVudCA9IGZhbHNlIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWU7XG4gICAgICAgIHRoaXMuc2lsZW50ID0gc2lsZW50O1xuICAgICAgICAvLyBISCsrIGNhbiBydW4gdGhlIG1vZHVsZSBhZ2FpbiB3aGVuIHRoZSB1c2VyIHR1cm5zIG5vdGljZXMgb24gaW4gdGhlIHNldHRpbmdzIHBhbmUuXG4gICAgICAgIGNvbnN0IGFsbG93QXV0b21hdGljID0gIXRoaXMuc2V0dGluZ3NJbnN0YWxsZWQ7XG5cbiAgICAgICAgY29uc3QgY2hlY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaGFzVW5yZWFkVXBkYXRlKCkpIHJldHVybjtcbiAgICAgICAgICAgIGlmICh0aGlzLnNpbGVudCkgdGhpcy5zaG93Tm90aWNlKCk7XG4gICAgICAgICAgICBlbHNlIGlmIChhbGxvd0F1dG9tYXRpYykgdGhpcy5vcGVuKCdhdXRvbWF0aWMnKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIGNoZWNrKCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2FkTGlzdGVuZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGNoZWNrLCB7IG9uY2U6IHRydWUsIHNpZ25hbDogdGhpcy5sb2FkTGlzdGVuZXIuc2lnbmFsIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGVhckRvd24oKSB7XG4gICAgICAgIHRoaXMubG9hZExpc3RlbmVyPy5hYm9ydCgpO1xuICAgICAgICB0aGlzLmhhc1J1biA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlbW92ZU5vdGljZSgpO1xuICAgIH1cblxuICAgIHVwZGF0ZVN1YlNldHRpbmcoa2V5OiBzdHJpbmcsIHZhbHVlOiBib29sZWFuKSB7XG4gICAgICAgIGlmIChrZXkgIT09ICdzaWxlbnQnKSByZXR1cm47XG4gICAgICAgIHRoaXMuc2lsZW50ID0gdmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSkgdGhpcy5zaG93Tm90aWNlKCk7XG4gICAgICAgIGVsc2UgdGhpcy5yZW1vdmVOb3RpY2UoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhhc1VucmVhZFVwZGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzUnVuICYmICF0aGlzLnZpZXdlZFRoaXNQYWdlICYmIGlzTmV3ZXIobGF0ZXN0VmVyc2lvbiwgcmVhZFNlZW5WZXJzaW9uKCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2hvd05vdGljZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNpbGVudCB8fCAhdGhpcy5oYXNVbnJlYWRVcGRhdGUoKSB8fCB0aGlzLm5vdGljZSB8fCB0aGlzLndhaXRpbmdGb3JOb3RpY2VBbmNob3IpIHJldHVybjtcblxuICAgICAgICBjb25zdCBzZWxlY3RvciA9ICcuaGgtcGx1cy1wbHVzLWNvbmZpZy1idXR0b24nO1xuICAgICAgICB0aGlzLndhaXRpbmdGb3JOb3RpY2VBbmNob3IgPSB0cnVlO1xuICAgICAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLndhaXRpbmdGb3JOb3RpY2VBbmNob3IgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IGFuY2hvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IGFuY2hvcj8ucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgIGlmICghYW5jaG9yIHx8ICFwYXJlbnQgfHwgIXRoaXMuc2lsZW50IHx8ICF0aGlzLmhhc1VucmVhZFVwZGF0ZSgpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnamFydmlzLWNoYW5nZWxvZy1ub3RpY2UnO1xuICAgICAgICAgICAgYnV0dG9uLmRhdGFzZXQudG9vbHRpcCA9ICdKYXJ2aXMgd2FzIHVwZGF0ZWQnO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdKYXJ2aXMgd2FzIHVwZGF0ZWQuIFZpZXcgY2hhbmdlbG9nLicpO1xuICAgICAgICAgICAgYnV0dG9uLmlubmVySFRNTCA9IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuMzVcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPlxuICAgICAgICAgICAgICAgIDxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiMTBcIi8+XG4gICAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCI3LjRcIiBzdHJva2UtZGFzaGFycmF5PVwiMyAxLjY1XCIvPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTIgNy42bDQuNCA3LjZINy42WlwiLz5cbiAgICAgICAgICAgIDwvc3ZnPmA7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuKCdtYW51YWwnLCBidXR0b24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBBIHNpYmxpbmcga2VlcHMgdGhlIHJlYWN0b3Igb3V0c2lkZSBISCsrJ3MgbmF0aXZlIHRvb2x0aXAgdGFyZ2V0LlxuICAgICAgICAgICAgYW5jaG9yLmFmdGVyKGJ1dHRvbik7XG4gICAgICAgICAgICB0aGlzLm5vdGljZSA9IGJ1dHRvbjtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5zdHlsZS5sZWZ0ID0gYCR7YW5jaG9yLm9mZnNldExlZnR9cHhgO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5zdHlsZS50b3AgPSBgJHthbmNob3Iub2Zmc2V0VG9wICsgYW5jaG9yLm9mZnNldEhlaWdodCAvIDJ9cHhgO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5zdHlsZS5oZWlnaHQgPSBgJHthbmNob3Iub2Zmc2V0SGVpZ2h0ICogLjd9cHhgO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHBvc2l0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLm5vdGljZUxheW91dCA9IG5ldyBSZXNpemVPYnNlcnZlcihwb3NpdGlvbik7XG4gICAgICAgICAgICB0aGlzLm5vdGljZUxheW91dC5vYnNlcnZlKGFuY2hvcik7XG4gICAgICAgICAgICB0aGlzLm5vdGljZUxheW91dC5vYnNlcnZlKHBhcmVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVtb3ZlTm90aWNlKCkge1xuICAgICAgICB0aGlzLm5vdGljZUxheW91dD8uZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLm5vdGljZUxheW91dCA9IG51bGw7XG4gICAgICAgIHRoaXMubm90aWNlPy5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5ub3RpY2UgPSBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3luY05vdGljZVNldHRpbmdzKCkge1xuICAgICAgICBjb25zdCBjb25maWcgPSB3aW5kb3cuaGhQbHVzUGx1c0NvbmZpZz8uY29uZmlnO1xuICAgICAgICBpZiAoIWNvbmZpZykgcmV0dXJuO1xuXG4gICAgICAgIGZvciAoY29uc3QgY2FyZCBvZiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNldHRpbmdzQ2FyZCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGVuYWJsZWQgPSBjb25maWdbY29uZmlnS2V5XTtcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrYm94ID0gY2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KGBpbnB1dFtuYW1lPVwiJHtjb25maWdLZXl9XCJdYCk7XG4gICAgICAgICAgICBjb25zdCBzaWxlbnQgPSBjYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTElucHV0RWxlbWVudD4oYGlucHV0W25hbWU9XCIke3NpbGVudEtleX1cIl1gKTtcbiAgICAgICAgICAgIGNhcmQuY2xhc3NMaXN0LnRvZ2dsZSgnZW5hYmxlZCcsIGVuYWJsZWQpO1xuICAgICAgICAgICAgaWYgKGNoZWNrYm94KSBjaGVja2JveC5jaGVja2VkID0gZW5hYmxlZDtcbiAgICAgICAgICAgIGlmIChzaWxlbnQpIHtcbiAgICAgICAgICAgICAgICBzaWxlbnQuY2hlY2tlZCA9IGNvbmZpZ1tzaWxlbnRLZXldO1xuICAgICAgICAgICAgICAgIHNpbGVudC5kaXNhYmxlZCA9ICFlbmFibGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzYXZlTm90aWNlU2V0dGluZyhrZXk6IHR5cGVvZiBjb25maWdLZXkgfCB0eXBlb2Ygc2lsZW50S2V5LCB2YWx1ZTogYm9vbGVhbikge1xuICAgICAgICBjb25zdCBjb25maWcgPSB3aW5kb3cuaGhQbHVzUGx1c0NvbmZpZztcbiAgICAgICAgaWYgKCFjb25maWcpIHJldHVybjtcblxuICAgICAgICBsZXQgcHJldmlvdXMgPSBjb25maWcuY29uZmlnW2tleV07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25maWcubG9hZENvbmZpZygpO1xuICAgICAgICAgICAgcHJldmlvdXMgPSBjb25maWcuY29uZmlnW2tleV07XG4gICAgICAgICAgICBpZiAoY29uZmlnLiRjb25maWdQYW5lICYmIGNvbmZpZy51cGRhdGVDb25maWcpIHtcbiAgICAgICAgICAgICAgICBjb25maWcudXBkYXRlQ29uZmlnKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBISCsrIGJ1aWxkcyBpdHMgc2V0dGluZ3MgcGFuZSB0aGUgZmlyc3QgdGltZSBpdCBpcyBvcGVuZWQuXG4gICAgICAgICAgICAgICAgY29uZmlnLmNvbmZpZ1trZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgY29uZmlnLnNhdmVDb25maWcoKTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBzaWxlbnRLZXkpIHRoaXMudXBkYXRlU3ViU2V0dGluZygnc2lsZW50JywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCF2YWx1ZSkgdGhpcy50ZWFyRG93bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5jb25maWdba2V5XSA9IHByZXZpb3VzO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIHVwZGF0ZSBub3RpY2UgcHJlZmVyZW5jZTonLCBlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zeW5jTm90aWNlU2V0dGluZ3MoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9wZW4obW9kZTogJ2F1dG9tYXRpYycgfCAnbWFudWFsJywgb3BlbmVyOiBIVE1MQnV0dG9uRWxlbWVudCB8IG51bGwgPSBudWxsKSB7XG4gICAgICAgIGlmICghdGhpcy5zaG91bGRSdW4oKSkgcmV0dXJuO1xuICAgICAgICBpZiAobW9kZSA9PT0gJ21hbnVhbCcpIHRoaXMub3BlbmVyID0gb3BlbmVyO1xuICAgICAgICBpZiAodGhpcy5wZW5kaW5nKSB7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gJ21hbnVhbCcpIHRoaXMucGVuZGluZyA9IG1vZGU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wZW5kaW5nID0gbW9kZTtcblxuICAgICAgICBjb25zdCBwcmV2aW91cyA9IHJlYWRTZWVuVmVyc2lvbigpO1xuICAgICAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNvbnRlbnQuY2xhc3NOYW1lID0gJ2NvbnRhaW5lci1zcGVjaWFsLWJnIGphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCc7XG4gICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcbiAgICAgICAgdGl0bGUuaWQgPSAnamFydmlzLWNoYW5nZWxvZy10aXRsZSc7XG4gICAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gJ0phcnZpcyBjaGFuZ2Vsb2cnO1xuICAgICAgICBjb25zdCBub3RlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBub3Rlcy5jbGFzc05hbWUgPSAnamFydmlzLWNoYW5nZWxvZy1ub3Rlcyc7XG4gICAgICAgIGNvbnN0IG5ld1JlbGVhc2VzID0gcHJldmlvdXMgJiYgaXNOZXdlcihsYXRlc3RWZXJzaW9uLCBwcmV2aW91cylcbiAgICAgICAgICAgID8gcmVsZWFzZU5vdGVzLmZpbHRlcihyZWxlYXNlID0+IGlzTmV3ZXIocmVsZWFzZS52ZXJzaW9uLCBwcmV2aW91cykpLmxlbmd0aFxuICAgICAgICAgICAgOiAxO1xuICAgICAgICBub3Rlcy5hcHBlbmQoLi4ucmVsZWFzZU5vdGVzLnNsaWNlKDAsIG5ld1JlbGVhc2VzKS5tYXAocmVsZWFzZVNlY3Rpb24pKTtcbiAgICAgICAgY29uc3QgZWFybGllciA9IHJlbGVhc2VOb3Rlcy5zbGljZShuZXdSZWxlYXNlcyk7XG4gICAgICAgIGlmIChlYXJsaWVyLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgaGlzdG9yeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RldGFpbHMnKTtcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdW1tYXJ5Jyk7XG4gICAgICAgICAgICBzdW1tYXJ5LnRleHRDb250ZW50ID0gJ0VhcmxpZXIgdmVyc2lvbnMnO1xuICAgICAgICAgICAgaGlzdG9yeS5hcHBlbmQoc3VtbWFyeSwgLi4uZWFybGllci5tYXAocmVsZWFzZVNlY3Rpb24pKTtcbiAgICAgICAgICAgIG5vdGVzLmFwcGVuZENoaWxkKGhpc3RvcnkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZm9vdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9vdGVyJyk7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgb3B0aW9ucy5jbGFzc05hbWUgPSAnamFydmlzLWNoYW5nZWxvZy1vcHRpb25zJztcbiAgICAgICAgY29uc3Qgb3B0T3V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAgICAgY29uc3QgZG9udFNob3dBZ2FpbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIGRvbnRTaG93QWdhaW4udHlwZSA9ICdjaGVja2JveCc7XG4gICAgICAgIG9wdE91dC5hcHBlbmQoZG9udFNob3dBZ2FpbiwgJ0RvbuKAmXQgc2hvdyBhZ2FpbicpO1xuICAgICAgICBjb25zdCBzaWxlbnRPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICBjb25zdCB1c2VTaWxlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICB1c2VTaWxlbnQudHlwZSA9ICdjaGVja2JveCc7XG4gICAgICAgIHVzZVNpbGVudC5jaGVja2VkID0gdGhpcy5zaWxlbnQ7XG4gICAgICAgIHNpbGVudE9wdGlvbi50aXRsZSA9ICdTaG93IGFuIHVwZGF0ZSBpY29uIGJlc2lkZSBISCsrIGZvciBmdXR1cmUgdXBkYXRlcy4nO1xuICAgICAgICBzaWxlbnRPcHRpb24uYXBwZW5kKHVzZVNpbGVudCwgJ1NpbGVudCBjaGFuZ2Vsb2cnKTtcbiAgICAgICAgZG9udFNob3dBZ2Fpbi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB1c2VTaWxlbnQuZGlzYWJsZWQgPSBkb250U2hvd0FnYWluLmNoZWNrZWQpO1xuICAgICAgICBvcHRpb25zLmFwcGVuZChvcHRPdXQsIHNpbGVudE9wdGlvbik7XG4gICAgICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNsb3NlQnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgY2xvc2VCdXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgICAgIGNsb3NlQnV0dG9uLnRleHRDb250ZW50ID0gJ0Nsb3NlJztcbiAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uKTtcbiAgICAgICAgY29udGVudC5hcHBlbmQodGl0bGUsIG5vdGVzLCBmb290ZXIpO1xuXG4gICAgICAgIHNob3dDaGFuZ2Vsb2dQb3B1cCh7XG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgY2xvc2VCdXR0b24sXG4gICAgICAgICAgICBzaG91bGRPcGVuOiAoKSA9PiB0aGlzLnBlbmRpbmcgPT09ICdtYW51YWwnIHx8ICghdGhpcy5zaWxlbnQgJiYgdGhpcy5oYXNVbnJlYWRVcGRhdGUoKSksXG4gICAgICAgICAgICBvbk9wZW46ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdlZFRoaXNQYWdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZU5vdGljZSgpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhhc1J1bikgZm9vdGVyLnByZXBlbmQob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmV3ZXIobGF0ZXN0VmVyc2lvbiwgcmVhZFNlZW5WZXJzaW9uKCkpKSBsc1NldChzZWVuS2V5LCBsYXRlc3RWZXJzaW9uKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIHZpZXdlZCBjaGFuZ2Vsb2cgdmVyc2lvbjonLCBlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkNsb3NlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZW5kaW5nID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoZG9udFNob3dBZ2Fpbi5jaGVja2VkKSB0aGlzLnNhdmVOb3RpY2VTZXR0aW5nKGNvbmZpZ0tleSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaGFzUnVuICYmIHVzZVNpbGVudC5jaGVja2VkICE9PSB0aGlzLnNpbGVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVOb3RpY2VTZXR0aW5nKHNpbGVudEtleSwgdXNlU2lsZW50LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5lcj8uZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMub3BlbmVyID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IGluaXRHYW1lIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IGluamVjdFN0eWxlcywgcGFja1NldHRpbmdzIH0gZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBGcmllbmRBbmRGb2VzIH0gZnJvbSAnLi9tb2R1bGVzL3BsYXllcnMvRnJpZW5kQW5kRm9lcyc7XG5pbXBvcnQgeyBhcm1Db250ZXN0U3RhcnR1cEd1YXJkLCBDb250ZXN0U3RhcnQgfSBmcm9tICcuL21vZHVsZXMvY29udGVzdHMvQ29udGVzdFN0YXJ0JztcbmltcG9ydCB7IGluc3RhbGxDb250ZXN0U2V0dGluZ3MgfSBmcm9tICcuL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzJztcbmltcG9ydCB7IExlYWd1ZVRvcDIwIH0gZnJvbSAnLi9tb2R1bGVzL3BsYXllcnMvTGVhZ3VlVG9wMjAnO1xuaW1wb3J0IHsgUmVtb3ZlUGFzc0xvY2sgfSBmcm9tICcuL21vZHVsZXMvcHJvZ3Jlc3Npb24vUmVtb3ZlUGFzc0xvY2snO1xuaW1wb3J0IHsgTG92ZVJhaWRzQWRkb24gfSBmcm9tICcuL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNBZGRvbic7XG5pbXBvcnQgeyBMb3ZlUmFpZHNQYXJzZXIgfSBmcm9tICcuL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNQYXJzZXInO1xuaW1wb3J0IHsgQWN0aXZpdHlQYXJzZXIgfSBmcm9tICcuL21vZHVsZXMvYWN0aXZpdGllcy9BY3Rpdml0eVBhcnNlcic7XG5pbXBvcnQgeyBDaGFuZ2Vsb2cgfSBmcm9tICcuL21vZHVsZXMvdXBkYXRlcy9DaGFuZ2Vsb2cnO1xuXG5hcm1Db250ZXN0U3RhcnR1cEd1YXJkKCk7XG5cbmZ1bmN0aW9uIHJ1bkphcnZpcygpIHtcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBydW5KYXJ2aXMsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgJCB9ID0gd2luZG93O1xuXG4gICAgaWYgKCEkKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJ1bkphcnZpcywgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICBjb25zb2xlLmxvZygnV0FSTklORzogTm8galF1ZXJ5IGZvdW5kLiBFbmRpbmcgc2NyaXB0LicpO1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnSGVsbG8sIFNpciwgSi5BLlIuVi5JLlMuIGlzIHJlYWR5IHRvIGhlbHAgeW91LicpO1xuXG4gICAgaW5pdEdhbWUoJCk7XG4gICAgaW5qZWN0U3R5bGVzKCk7XG5cbiAgICBjb25zdCBmcmllbmRzQW5kRm9lcyA9IG5ldyBGcmllbmRBbmRGb2VzKCk7XG4gICAgY29uc3QgY2hhbmdlbG9nID0gbmV3IENoYW5nZWxvZygpO1xuICAgIGNvbnN0IGFsbE1vZHVsZXMgPSBbXG4gICAgICAgIGZyaWVuZHNBbmRGb2VzLFxuICAgICAgICBuZXcgQ29udGVzdFN0YXJ0KCksXG4gICAgICAgIG5ldyBMZWFndWVUb3AyMCgpLFxuICAgICAgICBuZXcgUmVtb3ZlUGFzc0xvY2soKSxcbiAgICAgICAgbmV3IExvdmVSYWlkc0FkZG9uKCksXG4gICAgICAgIG5ldyBMb3ZlUmFpZHNQYXJzZXIoKSxcbiAgICAgICAgbmV3IEFjdGl2aXR5UGFyc2VyKCksXG4gICAgICAgIGNoYW5nZWxvZ1xuICAgIF1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBydW5TY3JpcHQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGhoUGx1c1BsdXNDb25maWcgfSA9IHdpbmRvd1xuICAgICAgICAgICAgaWYgKCFoaFBsdXNQbHVzQ29uZmlnKSByZXR1cm47XG5cbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJHcm91cCh7XG4gICAgICAgICAgICAgICAga2V5OiAnSkFSVklTJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnSEggSmFydmlzJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGFsbE1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4ge1xuICAgICAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJNb2R1bGUobW9kdWxlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcubG9hZENvbmZpZygpXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJ1bk1vZHVsZXMoKVxuICAgICAgICAgICAgZnJpZW5kc0FuZEZvZXMuaW5zdGFsbFNldHRpbmdzKCk7XG4gICAgICAgICAgICBpbnN0YWxsQ29udGVzdFNldHRpbmdzKCk7XG4gICAgICAgICAgICBjaGFuZ2Vsb2cuaW5zdGFsbFNldHRpbmdzKCk7XG4gICAgICAgICAgICBwYWNrU2V0dGluZ3MoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aW5kb3cuaGhQbHVzUGx1c0NvbmZpZykge1xuICAgICAgICAgICAgcnVuU2NyaXB0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uZSgnaGgrKy1iZHNtOmxvYWRlZCcsIHJ1blNjcmlwdClcbiAgICAgICAgfVxuICAgIH0sIDEpXG59XG5cbnJ1bkphcnZpcygpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFPLE1BQUk7QUFDSixNQUFJO0FBRUosV0FBUyxTQUFTLFFBQXNCO0FBQzNDLFFBQUk7QUFDSixrQkFBYyxPQUFPLFNBQVM7QUFBQSxFQUNsQzs7O0FDTk8sV0FBUyxZQUFZLE9BQWUsYUFBcUI7QUFDNUQsVUFBTSxTQUFTLENBQUMsU0FBaUIsS0FBSyxXQUFXLEtBQUssT0FBTyxFQUFFLFdBQVcsS0FBSyxRQUFRLEVBQ2xGLFdBQVcsS0FBSyxNQUFNLEVBQUUsV0FBVyxLQUFLLE1BQU07QUFDbkQsV0FBTyxPQUFPLEtBQUssSUFBSSxzRkFDbkIsT0FBTyxLQUFLLElBQUksMEJBQTBCLE9BQU8sV0FBVyxJQUFJO0FBQUEsRUFDeEU7QUFFTyxXQUFTLGtCQUFrQixPQUFvQixXQUFtQjtBQUNyRSxVQUFNLFVBQVUsU0FBUyxjQUFjLEtBQUs7QUFDNUMsWUFBUSxLQUFLO0FBQ2IsWUFBUSxZQUFZO0FBQ3BCLFlBQVEsYUFBYSxRQUFRLFNBQVM7QUFDdEMsVUFBTSxVQUFVLE9BQU8sUUFBUSxnQkFBZ0I7QUFDL0MsUUFBSSxRQUFTLFNBQVEsYUFBYSxXQUFXLFFBQVE7QUFBQSxRQUNoRCxTQUFRLFNBQVM7QUFDdEIsYUFBUyxLQUFLLFlBQVksT0FBTztBQUVqQyxRQUFJLFNBQTZCO0FBQ2pDLFVBQU0sVUFBVSxDQUFDLFdBQ2Isa0JBQWtCLFVBQVUsT0FBTyxRQUFxQixxQkFBcUIsSUFBSTtBQUNyRixVQUFNLFFBQVEsTUFBTTtBQUNoQixVQUFJLENBQUMsT0FBUTtBQUNiLGFBQU8sZ0JBQWdCLGtCQUFrQjtBQUN6QyxlQUFTO0FBQ1QsVUFBSSxRQUFTLFNBQVEsWUFBWTtBQUFBLFVBQzVCLFNBQVEsU0FBUztBQUFBLElBQzFCO0FBQ0EsVUFBTSxPQUFPLENBQUMsU0FBc0I7QUFDaEMsVUFBSSxXQUFXLEtBQU07QUFDckIsWUFBTTtBQUNOLGVBQVM7QUFDVCxXQUFLLGFBQWEsb0JBQW9CLFNBQVM7QUFDL0MsY0FBUSxjQUFjLEtBQUssUUFBUSxlQUFlO0FBQ2xELFVBQUksUUFBUyxTQUFRLFlBQVk7QUFBQSxVQUM1QixTQUFRLFNBQVM7QUFFdEIsWUFBTSxTQUFTLEtBQUssc0JBQXNCO0FBQzFDLFlBQU0sRUFBRSxhQUFhLGFBQWEsSUFBSTtBQUN0QyxjQUFRLE1BQU0sT0FBTyxLQUFLLElBQUksR0FBRyxLQUFLLElBQUksT0FBTyxNQUFNLFNBQVMsZ0JBQWdCLGNBQWMsY0FBYyxDQUFDLENBQUMsSUFBSTtBQUNsSCxZQUFNLFFBQVEsT0FBTyxTQUFTO0FBQzlCLGNBQVEsTUFBTSxPQUFPLFFBQVEsZ0JBQWdCLE9BQU8sY0FBYyxJQUM1RCxRQUFRLEtBQUssSUFBSSxHQUFHLE9BQU8sTUFBTSxlQUFlLENBQUMsS0FBSztBQUFBLElBQ2hFO0FBRUEsVUFBTSxpQkFBaUIsZUFBZSxXQUFTO0FBQzNDLFlBQU0sT0FBTyxRQUFRLE1BQU0sTUFBTTtBQUNqQyxVQUFJLFFBQVEsTUFBTSxnQkFBZ0IsUUFBUyxNQUFLLElBQUk7QUFBQSxJQUN4RCxDQUFDO0FBQ0QsVUFBTSxpQkFBaUIsY0FBYyxXQUFTO0FBQzFDLFlBQU0sT0FBTyxRQUFRLE1BQU0sTUFBTTtBQUNqQyxVQUFJLFNBQVMsVUFBVSxRQUFRLFNBQVMsa0JBQWtCLEtBQU0sT0FBTTtBQUFBLElBQzFFLENBQUM7QUFDRCxVQUFNLGlCQUFpQixXQUFXLFdBQVM7QUFDdkMsWUFBTSxPQUFPLFFBQVEsTUFBTSxNQUFNO0FBQ2pDLFVBQUksS0FBTSxNQUFLLElBQUk7QUFBQSxJQUN2QixDQUFDO0FBQ0QsVUFBTSxpQkFBaUIsWUFBWSxXQUFTO0FBQ3hDLFVBQUksUUFBUSxNQUFNLE1BQU0sTUFBTSxPQUFRLE9BQU07QUFBQSxJQUNoRCxDQUFDO0FBQ0QsVUFBTSxpQkFBaUIsU0FBUyxXQUFTO0FBQ3JDLFlBQU0sT0FBTyxRQUFRLE1BQU0sTUFBTTtBQUNqQyxVQUFJLENBQUMsS0FBTTtBQUNYLFlBQU0sZUFBZTtBQUNyQixZQUFNLGdCQUFnQjtBQUN0QixXQUFLLElBQUk7QUFBQSxJQUNiLENBQUM7QUFDRCxVQUFNLGlCQUFpQixXQUFXLFdBQVM7QUFDdkMsWUFBTSxPQUFPLFFBQVEsTUFBTSxNQUFNO0FBQ2pDLFVBQUksU0FBUyxNQUFNLFFBQVEsV0FBVyxNQUFNLFFBQVEsTUFBTTtBQUN0RCxjQUFNLGVBQWU7QUFDckIsY0FBTSxnQkFBZ0I7QUFDdEIsYUFBSyxJQUFJO0FBQUEsTUFDYixXQUFXLFVBQVUsTUFBTSxRQUFRLFVBQVU7QUFDekMsY0FBTSxnQkFBZ0I7QUFDdEIsY0FBTTtBQUFBLE1BQ1Y7QUFBQSxJQUNKLENBQUM7QUFDRCxhQUFTLGlCQUFpQixlQUFlLFdBQVM7QUFDOUMsVUFBSSxRQUFRLE1BQU0sTUFBTSxNQUFNLE9BQVEsT0FBTTtBQUFBLElBQ2hELENBQUM7QUFDRCxVQUFNLGlCQUFpQixVQUFVLE9BQU8sRUFBRSxTQUFTLEtBQUssQ0FBQztBQUFBLEVBQzdEOzs7QUNqRkE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFB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
