// ==UserScript==
// @name           HH J.A.R.V.I.S. (Dev)
// @version        0.7.6
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
    inset-inline-end: calc(100% + .25em);
    top: 50%;
    translate: 0 -50%;
    height: 70%;
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
    style.textContent = `${settings_default}
        .hh-plus-plus-config-panel { --jarvis-version: "v${"0.7.6"}"; }
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
  var CHANGELOG_default = [{ version: "0.7.6", changes: ["Choose Top or My rank on any active contest. Jarvis remembers each contest’s choice when switching and applies the same position and scroll rules to finished contests.", "Keep game scroll animations from restarting while you scroll by hand during a contest switch.", "See a small arc-reactor icon beside HH++ when a silent update notice is available."] }, { version: "0.7.5", changes: ["Keep the homepage responsive after closing the changelog and choose Silent changelog from the popup.", "Stop automatic sidebar scrolling on contest switches by default and use Top or My rank whenever you switch.", "Bring the selected card into view when you use a contest shortcut."] }, { version: "0.7.4", changes: ["See your rank in each active contest beside the close button and switch leaderboards without moving the contest list."] }, { version: "0.7.3", changes: ["See automatic changelogs only when loading the homepage after an update.", "Enable Silent changelog to get a New button beside HH++ and open the notes when you’re ready.", "Keep the contest list and each leaderboard in place when switching contests with Stop scrolling on contest switches."] }, { version: "0.7.2", changes: ["Open the bottom active contest at your rank by default. Choose CbC, CCC, or LC to prefer that event when available.", "Turn off automatic update notices with Don’t show again in the changelog popup. View changelog stays available in settings."] }, { version: "0.7.1", changes: ["Keep the changelog centered when the game window is resized.", "Clean up saved player names, explain unknown names on hover, and give Remove buttons more room."] }, { version: "0.7.0", changes: ["See what changed in Jarvis the first time a new version runs.", "Open View changelog from HH++ settings at any time, even with automatic notices turned off.", "Expand Earlier versions to read past updates."] }, { version: "0.6.7", changes: ["Make marking one action per player, backfill names for older marks, use the bracket-based promotion target, and simplify the selected contest buttons and version badge."] }, { version: "0.6.6", changes: ["Add setting help in HH++, improve mark contrast and management, and add automatic contest defaults.", "Rename the separately installed testing userscript to Dev."] }, { version: "0.6.5", changes: ["Move the userscript source into TypeScript modules and add separate stable and testing builds."] }, { version: "0.6.4", changes: ["Prevent pinned contest startup scrolling, keep native startup without a pin, and clear finished pins"] }, { version: "0.6.3", changes: ["Stop both contest startup scrolls, isolate the selected leaderboard, and restore pinned contests at Top or My rank"] }, { version: "0.6.2", changes: ["Pin contests on their cards, hide the startup scroll, and use right-click marking with isolated settings scrolling"] }, { version: "0.6.1", changes: ["Read native Manga RPG contest titles and recognize active cards when contest data is unavailable"] }, { version: "0.6.0", changes: ["Add a contest start preference, continuous marking, and compact settings with a version label"] }, { version: "0.5.0", changes: ["Add league and contest player marking with custom colors, compact settings, and limit Top 20 to promotable leagues"] }, { version: "0.4.2", changes: ["Fix module startup, league controls, and raid exports; add the Top 20 league target"] }, { version: "0.4.1", changes: ["Fix Love Raids shadows replacement"] }, { version: "0.4.0", changes: ["Add ActivityParser module"] }, { version: "0.3.1", changes: ["Add harem link inside love raid cards"] }, { version: "0.3.0", changes: ["Add LoveRaidsAddon and LoveRaidsParser modules"] }, { version: "0.2.0", changes: ["Add RemovePassLock module"] }, { version: "0.1.3", changes: ["Better code practices"] }, { version: "0.1.2", changes: ["Polishing and update links"] }, { version: "0.1.1", changes: ["Add FriendAndFoes module"] }, { version: "0.0.1", changes: ["Initial release"] }];

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
        if (!anchor || !this.silent || !this.hasUnreadUpdate()) return;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzSGVscC50cyIsICJzcmMvc2V0dGluZ3MuY3NzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvSEhNb2R1bGUudHMiLCAic3JjL3N0b3JhZ2UudHMiLCAic3JjL21vZHVsZXMvcGxheWVycy9tYXJrTWFuYWdlci50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0ZyaWVuZEFuZEZvZXMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzLnRzIiwgInNyYy9tb2R1bGVzL2NvbnRlc3RzL2NvbnRlc3RTaG9ydGN1dHMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvQ29udGVzdFN0YXJ0LnRzIiwgInNyYy9tb2R1bGVzL3BsYXllcnMvTGVhZ3VlVG9wMjAudHMiLCAic3JjL21vZHVsZXMvcHJvZ3Jlc3Npb24vUmVtb3ZlUGFzc0xvY2sudHMiLCAic3JjL21vZHVsZXMvbG92ZS1yYWlkcy9nYW1lRGF0YS50cyIsICJzcmMvbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc0FkZG9uLnRzIiwgInNyYy9tb2R1bGVzL2xvdmUtcmFpZHMvTG92ZVJhaWRzUGFyc2VyLnRzIiwgInNyYy9tb2R1bGVzL2FjdGl2aXRpZXMvQWN0aXZpdHlQYXJzZXIudHMiLCAiQ0hBTkdFTE9HLm1kIiwgInNyYy9tb2R1bGVzL3VwZGF0ZXMvY2hhbmdlbG9nUG9wdXAudHMiLCAic3JjL21vZHVsZXMvdXBkYXRlcy9DaGFuZ2Vsb2cudHMiLCAic3JjL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgbGV0ICQ6IEpRdWVyeVN0YXRpYztcbmV4cG9ydCBsZXQgY3VycmVudFBhZ2U6IHN0cmluZztcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRHYW1lKGpRdWVyeTogSlF1ZXJ5U3RhdGljKSB7XG4gICAgJCA9IGpRdWVyeTtcbiAgICBjdXJyZW50UGFnZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gc2V0dGluZ0hlbHAobGFiZWw6IHN0cmluZywgZGVzY3JpcHRpb246IHN0cmluZykge1xuICAgIGNvbnN0IGVzY2FwZSA9ICh0ZXh0OiBzdHJpbmcpID0+IHRleHQucmVwbGFjZUFsbCgnJicsICcmYW1wOycpLnJlcGxhY2VBbGwoJ1wiJywgJyZxdW90OycpXG4gICAgICAgIC5yZXBsYWNlQWxsKCc8JywgJyZsdDsnKS5yZXBsYWNlQWxsKCc+JywgJyZndDsnKTtcbiAgICByZXR1cm4gZXNjYXBlKGxhYmVsKSArICcgPHNwYW4gY2xhc3M9XCJpcm9ubWFuLXNldHRpbmctaGVscFwiIHJvbGU9XCJidXR0b25cIiB0YWJpbmRleD1cIjBcIiBhcmlhLWxhYmVsPVwiQWJvdXQgJyArXG4gICAgICAgIGVzY2FwZShsYWJlbCkgKyAnXCIgZGF0YS1zZXR0aW5nLWhlbHA9XCInICsgZXNjYXBlKGRlc2NyaXB0aW9uKSArICdcIj4/PC9zcGFuPic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3VudFNldHRpbmdzSGVscChwYW5lbDogSFRNTEVsZW1lbnQsIHRvb2x0aXBJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgdG9vbHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRvb2x0aXAuaWQgPSB0b29sdGlwSWQ7XG4gICAgdG9vbHRpcC5jbGFzc05hbWUgPSAnaXJvbm1hbi1zZXR0aW5nLXRvb2x0aXAnO1xuICAgIHRvb2x0aXAuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3Rvb2x0aXAnKTtcbiAgICBjb25zdCBwb3BvdmVyID0gdHlwZW9mIHRvb2x0aXAuc2hvd1BvcG92ZXIgPT09ICdmdW5jdGlvbic7XG4gICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuc2V0QXR0cmlidXRlKCdwb3BvdmVyJywgJ21hbnVhbCcpO1xuICAgIGVsc2UgdG9vbHRpcC5oaWRkZW4gPSB0cnVlO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodG9vbHRpcCk7XG5cbiAgICBsZXQgYW5jaG9yOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IGdldEhlbHAgPSAodGFyZ2V0OiBFdmVudFRhcmdldCB8IG51bGwpID0+XG4gICAgICAgIHRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgPyB0YXJnZXQuY2xvc2VzdDxIVE1MRWxlbWVudD4oJ1tkYXRhLXNldHRpbmctaGVscF0nKSA6IG51bGw7XG4gICAgY29uc3QgY2xvc2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICghYW5jaG9yKSByZXR1cm47XG4gICAgICAgIGFuY2hvci5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKTtcbiAgICAgICAgYW5jaG9yID0gbnVsbDtcbiAgICAgICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuaGlkZVBvcG92ZXIoKTtcbiAgICAgICAgZWxzZSB0b29sdGlwLmhpZGRlbiA9IHRydWU7XG4gICAgfTtcbiAgICBjb25zdCBzaG93ID0gKGhlbHA6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgIGlmIChhbmNob3IgPT09IGhlbHApIHJldHVybjtcbiAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgYW5jaG9yID0gaGVscDtcbiAgICAgICAgaGVscC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCB0b29sdGlwSWQpO1xuICAgICAgICB0b29sdGlwLnRleHRDb250ZW50ID0gaGVscC5kYXRhc2V0LnNldHRpbmdIZWxwID8/ICcnO1xuICAgICAgICBpZiAocG9wb3ZlcikgdG9vbHRpcC5zaG93UG9wb3ZlcigpO1xuICAgICAgICBlbHNlIHRvb2x0aXAuaGlkZGVuID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gaGVscC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgeyBvZmZzZXRXaWR0aCwgb2Zmc2V0SGVpZ2h0IH0gPSB0b29sdGlwO1xuICAgICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSBNYXRoLm1heCg4LCBNYXRoLm1pbihib3VuZHMubGVmdCwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIC0gb2Zmc2V0V2lkdGggLSA4KSkgKyAncHgnO1xuICAgICAgICBjb25zdCBiZWxvdyA9IGJvdW5kcy5ib3R0b20gKyA2O1xuICAgICAgICB0b29sdGlwLnN0eWxlLnRvcCA9IChiZWxvdyArIG9mZnNldEhlaWdodCA8PSB3aW5kb3cuaW5uZXJIZWlnaHQgLSA4XG4gICAgICAgICAgICA/IGJlbG93IDogTWF0aC5tYXgoOCwgYm91bmRzLnRvcCAtIG9mZnNldEhlaWdodCAtIDYpKSArICdweCc7XG4gICAgfTtcblxuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJvdmVyJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCAmJiBldmVudC5wb2ludGVyVHlwZSAhPT0gJ3RvdWNoJykgc2hvdyhoZWxwKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyb3V0JywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCA9PT0gYW5jaG9yICYmIGhlbHAgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gaGVscCkgY2xvc2UoKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1c2luJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoaGVscCkgc2hvdyhoZWxwKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGdldEhlbHAoZXZlbnQudGFyZ2V0KSA9PT0gYW5jaG9yKSBjbG9zZSgpO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBoZWxwID0gZ2V0SGVscChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAoIWhlbHApIHJldHVybjtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgJiYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJyB8fCBldmVudC5rZXkgPT09ICcgJykpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHNob3coaGVscCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYW5jaG9yICYmIGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZ2V0SGVscChldmVudC50YXJnZXQpICE9PSBhbmNob3IpIGNsb3NlKCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgY2xvc2UsIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbn1cbiIsICIuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5wYW5lbC1jb250ZW50cyB7XG4gICAgYWxpZ24tY29udGVudDogc3RhcnQ7XG4gICAgYWxpZ24taXRlbXM6IHN0YXJ0O1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgb3ZlcnNjcm9sbC1iZWhhdmlvcjogY29udGFpbjtcbiAgICBzY3JvbGxiYXItd2lkdGg6IHRoaW47XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbDpoYXMoPiAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdLnNob3duKSB7XG4gICAgb3ZlcmZsb3c6IGNsaXA7XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZy5oYXMtc3Vic2V0dGluZ3Mge1xuICAgIGdyaWQtcm93LWVuZDogYXV0bztcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1wYWNrZWQtc2V0dGluZ3Mge1xuICAgIGdyaWQtYXV0by1mbG93OiByb3cgZGVuc2U7XG4gICAgZ3JpZC1hdXRvLXJvd3M6IDFweDtcbiAgICByb3ctZ2FwOiAwO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuamFydmlzLXBhY2tlZC1zZXR0aW5ncyAuY29uZmlnLXNldHRpbmcge1xuICAgIGdyaWQtcm93LWVuZDogc3BhbiB2YXIoLS1qYXJ2aXMtc2V0dGluZy1yb3dzLCAxKTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC50YWJzIGg0W3JlbD1cIkpBUlZJU1wiXSB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLnRhYnMgaDRbcmVsPVwiSkFSVklTXCJdLnNlbGVjdGVkOjphZnRlciB7XG4gICAgY29udGVudDogdmFyKC0tamFydmlzLXZlcnNpb24pO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBpbnNldC1ibG9jay1zdGFydDogMDtcbiAgICBpbnNldC1pbmxpbmUtZW5kOiAuMTVyZW07XG4gICAgZm9udC1zaXplOiAuNjI1cmVtO1xuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4uaXJvbm1hbi1zZXR0aW5nLWhlbHAge1xuICAgIGRpc3BsYXk6IGlubGluZS1ncmlkO1xuICAgIHBsYWNlLWl0ZW1zOiBjZW50ZXI7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBpbmxpbmUtc2l6ZTogMS4yNWVtO1xuICAgIGJsb2NrLXNpemU6IDEuMjVlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgIGZvbnQtc2l6ZTogLjhlbTtcbiAgICBsaW5lLWhlaWdodDogMTtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogLjA4ZW07XG4gICAgY3Vyc29yOiBoZWxwO1xufVxuLmlyb25tYW4tc2V0dGluZy1oZWxwOmhvdmVyLFxuLmlyb25tYW4tc2V0dGluZy1oZWxwOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbi5pcm9ubWFuLXNldHRpbmctdG9vbHRpcCB7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIGluc2V0OiBhdXRvO1xuICAgIHotaW5kZXg6IDEwMDEwO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgbWF4LXdpZHRoOiBtaW4oMThyZW0sIGNhbGMoMTAwdncgLSAxNnB4KSk7XG4gICAgbWFyZ2luOiAwO1xuICAgIHBhZGRpbmc6IC41ZW0gLjdlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40ZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogMTRweC8xLjQgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuamFydmlzLW1hcmstY29sb3IgaW5wdXQge1xuICAgIHdpZHRoOiAzMHB4O1xuICAgIGhlaWdodDogMjBweDtcbiAgICBmbGV4OiBub25lO1xuICAgIHBhZGRpbmc6IDA7XG59XG5idXR0b24uamFydmlzLWNvbnRlc3QtcGluIHtcbiAgICBhbGw6IHVuc2V0O1xuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICBtYXJnaW4taW5saW5lLXN0YXJ0OiAuMzVlbTtcbiAgICBwYWRkaW5nLWlubGluZTogLjJlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250LXNpemU6IC45ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jb250ZXN0LXBpbjo6YmVmb3JlIHtcbiAgICBjb250ZW50OiAn4piGJztcbn1cbi5qYXJ2aXMtY29udGVzdC1waW5bYXJpYS1wcmVzc2VkPVwidHJ1ZVwiXTo6YmVmb3JlIHtcbiAgICBjb250ZW50OiAn4piFJztcbiAgICBjb2xvcjogI2ZmZDM2Yjtcbn1cbi5qYXJ2aXMtY29udGVzdC1waW46Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgIHdpZHRoOiBmaXQtY29udGVudDtcbiAgICBnYXA6IC4xMmVtO1xuICAgIHBhZGRpbmc6IC4xMmVtO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgNTUlLCB0cmFuc3BhcmVudCk7XG4gICAgYm9yZGVyLXJhZGl1czogLjQ1ZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgbGluZS1oZWlnaHQ6IDEuMTU7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIGJ1dHRvbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBwYWRkaW5nOiAuMThlbSAuMzhlbTtcbiAgICBib3JkZXItcmFkaXVzOiAuMjZlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGxpbmUtaGVpZ2h0OiBpbmhlcml0O1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b25bYXJpYS1wcmVzc2VkPVwidHJ1ZVwiXSB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAyMiUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDE1JSwgdHJhbnNwYXJlbnQpO1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b246Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0IHtcbiAgICBtYXJnaW4taW5saW5lLXN0YXJ0OiAuMjhlbTtcbiAgICBmb250LXNpemU6IC43ZW07XG4gICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5ncyB7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBnYXA6IC4zZW07XG4gICAgbWluLXdpZHRoOiAwO1xuICAgIG1hcmdpbjogLjQ1ZW0gMCAwO1xuICAgIHBhZGRpbmc6IDA7XG4gICAgYm9yZGVyOiAwO1xuICAgIGZvbnQtc2l6ZTogLjg1ZW07XG59XG4uamFydmlzLWNvbnRlc3Qtc2V0dGluZ3MgLmphcnZpcy1jb250ZXN0LWNob2ljZSB7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBtYXgtd2lkdGg6IDEwMCU7XG4gICAgZmxleC13cmFwOiB3cmFwO1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzIFtoaWRkZW5dIHtcbiAgICBkaXNwbGF5OiBub25lO1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzOmRpc2FibGVkIC5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIG9wYWNpdHk6IC41O1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzOmRpc2FibGVkIGJ1dHRvbiB7XG4gICAgY3Vyc29yOiBkZWZhdWx0O1xufVxuLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cyB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGluc2V0LWJsb2NrLXN0YXJ0OiAxLjNyZW07XG4gICAgaW5zZXQtaW5saW5lLWVuZDogM3JlbTtcbiAgICB6LWluZGV4OiAxMDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiAuM2VtO1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTAlKTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMgYnV0dG9uIHtcbiAgICBhbGw6IHVuc2V0O1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBwbGFjZS1jb250ZW50OiBjZW50ZXI7XG4gICAgZ2FwOiAuMTVlbTtcbiAgICBtaW4taW5saW5lLXNpemU6IDIuODVlbTtcbiAgICBwYWRkaW5nOiAuMjhlbSAuNDVlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDQwJSwgdHJhbnNwYXJlbnQpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40ZW07XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAxMCUsIHRyYW5zcGFyZW50KTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGZvbnQtc2l6ZTogLjllbTtcbiAgICBsaW5lLWhlaWdodDogMTtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzIGJ1dHRvbiBzcGFuIHtcbiAgICBmb250LXNpemU6IC43NWVtO1xufVxuLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cyBidXR0b246aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMTglLCB0cmFuc3BhcmVudCk7XG59XG4uamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzIGJ1dHRvblthcmlhLXByZXNzZWQ9XCJ0cnVlXCJdIHtcbiAgICBiYWNrZ3JvdW5kOiBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDI3JSwgdHJhbnNwYXJlbnQpO1xufVxuLmphcnZpcy1jb250ZXN0LXNob3J0Y3V0cyBidXR0b246Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMnB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbiAgICBvdXRsaW5lLW9mZnNldDogMnB4O1xufVxuLmphcnZpcy1tYXJrLW1lbnUge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB6LWluZGV4OiAxMDAwMDtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdhcDogMnB4O1xuICAgIHBhZGRpbmc6IDRweDtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjODk5NGE3O1xuICAgIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgICBiYWNrZ3JvdW5kOiAjMjMyOTM2O1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGJveC1zaGFkb3c6IDAgMnB4IDEwcHggIzAwMDg7XG4gICAgZm9udDogMTNweC8xLjM1IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbn1cbi5qYXJ2aXMtbWFyay1tZW51IGJ1dHRvbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBwYWRkaW5nOiA0cHggOXB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLW1hcmstbWVudSBidXR0b246aG92ZXIsXG4uamFydmlzLW1hcmstbWVudSBidXR0b246Zm9jdXMtdmlzaWJsZSB7XG4gICAgYmFja2dyb3VuZDogIzQxNGQ2NDtcbn1cbiNjb250ZXN0cyAubGVmdF9wYXJ0IC5zY3JvbGxfYXJlYS5qYXJ2aXMtY29udGVzdC1pbnN0YW50LFxuI2NvbnRlc3RzIC5yaWdodF9wYXJ0LmphcnZpcy1jb250ZXN0LWluc3RhbnQgLmxlYWRfdGFibGVfdmlldyB7XG4gICAgc2Nyb2xsLWJlaGF2aW9yOiBhdXRvICFpbXBvcnRhbnQ7XG4gICAgb3ZlcmZsb3ctYW5jaG9yOiBub25lICFpbXBvcnRhbnQ7XG59XG4jY29udGVzdHMgLmphcnZpcy1jb250ZXN0LWxvYWRpbmcge1xuICAgIG9wYWNpdHk6IDAgIWltcG9ydGFudDtcbiAgICB0cmFuc2l0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4jY29udGVzdHMgLnJpZ2h0X3BhcnQgLnJhbmtpbmdbaWRfY29udGVzdF0uamFydmlzLWNvbnRlc3Qtb3RoZXIge1xuICAgIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrPVwiZnJpZW5kXCJdIHtcbiAgICBjb2xvcjogdmFyKC0tamFydmlzLWZyaWVuZC1jb2xvcikgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrPVwiZm9lXCJdIHtcbiAgICBjb2xvcjogdmFyKC0tamFydmlzLWZvZS1jb2xvcikgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrXSxcbnRkW2RhdGEtamFydmlzLW1hcmtdID4gYSB7XG4gICAgdGV4dC1zaGFkb3c6IDFweCAwICMxMTE4MjcsIC0xcHggMCAjMTExODI3LCAwIDFweCAjMTExODI3LCAwIC0xcHggIzExMTgyNyAhaW1wb3J0YW50O1xufVxudGRbZGF0YS1qYXJ2aXMtbWFya10gPiBhIHtcbiAgICBjb2xvcjogaW5oZXJpdCAhaW1wb3J0YW50O1xufVxuLmphcnZpcy1zZXR0aW5nLWFjdGlvbiB7XG4gICAgYXBwZWFyYW5jZTogbm9uZTtcbiAgICBwYWRkaW5nOiAuMmVtIC41ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIGJvcmRlci1yYWRpdXM6IC4zNWVtO1xuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIGZvbnQ6IGluaGVyaXQ7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1zZXR0aW5nLWFjdGlvbjpob3Zlcixcbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246Zm9jdXMtdmlzaWJsZSB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAxNiUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246ZGlzYWJsZWQge1xuICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICBvcGFjaXR5OiAuNTtcbn1cbi5qYXJ2aXMtbWFyay1zZXR0aW5nLWFjdGlvbnMsXG4uamFydmlzLW1hcmstYWN0aW9ucyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgZ2FwOiAuNGVtO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXIge1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgd2lkdGg6IG1pbigzNHJlbSwgY2FsYygxMDB2dyAtIDJyZW0pKTtcbiAgICBtYXgtaGVpZ2h0OiBjYWxjKDEwMHZoIC0gMnJlbSk7XG4gICAgcGFkZGluZzogMXJlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC42NXJlbTtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jb25maWctc2V0dGluZy1iYWNrZ3JvdW5kLCAjMjQxZTMwKTtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBmb250OiAxNXB4LzEuMzUgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXI6OmJhY2tkcm9wIHtcbiAgICBiYWNrZ3JvdW5kOiAjMDgwYjEyYWE7XG59XG4uamFydmlzLW1hcmstbWFuYWdlciBoMixcbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIGgzLFxuLmphcnZpcy1tYXJrLW1hbmFnZXIgcCB7XG4gICAgbWFyZ2luOiAwO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIHtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgobWluKDEzcmVtLCAxMDAlKSwgMWZyKSk7XG4gICAgZ2FwOiAuOXJlbTtcbiAgICBtYXgtaGVpZ2h0OiA1MHZoO1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgc2Nyb2xsYmFyLWd1dHRlcjogc3RhYmxlO1xuICAgIHBhZGRpbmctaW5saW5lLWVuZDogLjdyZW07XG4gICAgbWFyZ2luLWJsb2NrOiAuOXJlbTtcbn1cbi5qYXJ2aXMtbWFyay1saXN0cyB1bCB7XG4gICAgbWFyZ2luOiAuM2VtIDAgMDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XG59XG4uamFydmlzLW1hcmstbGlzdHMgbGkge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgZ2FwOiAuNDVlbTtcbiAgICBwYWRkaW5nOiAuMmVtIDA7XG4gICAgb3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XG59XG4uamFydmlzLW1hcmstbGlzdHMgbGkgYnV0dG9uIHtcbiAgICBmbGV4OiBub25lO1xufVxuLmphcnZpcy1tYXJrLWFjdGlvbnMge1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2Vlbjtcbn1cbi5qYXJ2aXMtdmlldy1jaGFuZ2Vsb2cge1xuICAgIG1hcmdpbi10b3A6IC40NWVtO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctYnV0dG9uID4gLmphcnZpcy1jaGFuZ2Vsb2ctbm90aWNlIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgaW5zZXQtaW5saW5lLWVuZDogY2FsYygxMDAlICsgLjI1ZW0pO1xuICAgIHRvcDogNTAlO1xuICAgIHRyYW5zbGF0ZTogMCAtNTAlO1xuICAgIGhlaWdodDogNzAlO1xuICAgIGFzcGVjdC1yYXRpbzogMTtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGJvcmRlcjogMDtcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gICAgY29sb3I6ICNhOWU0ZmY7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90aWNlIHN2ZyB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIGZpbHRlcjogZHJvcC1zaGFkb3coMCAxcHggMXB4ICMwNzE2MjUpO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90aWNlOmhvdmVyIHtcbiAgICBjb2xvcjogI2RiZjVmZjtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGljZTpmb2N1cy12aXNpYmxlIHtcbiAgICBvdXRsaW5lOiAycHggc29saWQgY3VycmVudENvbG9yO1xuICAgIG91dGxpbmUtb2Zmc2V0OiAycHg7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RpY2U6aXMoOmhvdmVyLCA6Zm9jdXMtdmlzaWJsZSk6OmFmdGVyIHtcbiAgICBjb250ZW50OiBhdHRyKGRhdGEtdG9vbHRpcCk7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGluc2V0LWJsb2NrLXN0YXJ0OiBjYWxjKDEwMCUgKyAuNGVtKTtcbiAgICBpbnNldC1pbmxpbmUtZW5kOiAwO1xuICAgIHBhZGRpbmc6IC4zNWVtIC41NWVtO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbmZpZy1zZXR0aW5nLWJvcmRlciwgI2E5YTNiYyk7XG4gICAgYm9yZGVyLXJhZGl1czogLjM1ZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogNTAwIC43NXJlbS8xLjI1IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuZGlhbG9nLmphcnZpcy1jaGFuZ2Vsb2ctcG9wdXAge1xuICAgIC0tamFydmlzLWNoYW5nZWxvZy1oZWlnaHQ6IG1pbigzMnJlbSwgY2FsYygxMDB2aCAtIDEuMjVyZW0pKTtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICBpbnNldDogMDtcbiAgICB3aWR0aDogbWluKDM3cmVtLCBjYWxjKDEwMCUgLSAxLjI1cmVtKSk7XG4gICAgaGVpZ2h0OiBmaXQtY29udGVudDtcbiAgICBtYXgtaGVpZ2h0OiB2YXIoLS1qYXJ2aXMtY2hhbmdlbG9nLWhlaWdodCk7XG4gICAgbWFyZ2luOiBhdXRvO1xuICAgIHBhZGRpbmc6IDA7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC42cmVtO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWNvbmZpZy1zZXR0aW5nLWJhY2tncm91bmQsICMyNDFlMzApO1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGZvbnQ6IDE1cHgvMS40NSBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7XG4gICAgdGV4dC1hbGlnbjogc3RhcnQ7XG59XG5Ac3VwcG9ydHMgKGhlaWdodDogMTAwZHZoKSB7XG4gICAgZGlhbG9nLmphcnZpcy1jaGFuZ2Vsb2ctcG9wdXAge1xuICAgICAgICAtLWphcnZpcy1jaGFuZ2Vsb2ctaGVpZ2h0OiBtaW4oMzJyZW0sIGNhbGMoMTAwZHZoIC0gMS4yNXJlbSkpO1xuICAgIH1cbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLXBvcHVwOjpiYWNrZHJvcCB7XG4gICAgYmFja2dyb3VuZDogIzA4MGIxMmFhO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCB7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtcm93czogYXV0byBtaW5tYXgoMCwgMWZyKSBhdXRvO1xuICAgIGdhcDogY2xhbXAoLjQ1cmVtLCAydncsIC45cmVtKTtcbiAgICBtYXgtaGVpZ2h0OiBjYWxjKHZhcigtLWphcnZpcy1jaGFuZ2Vsb2ctaGVpZ2h0KSAtIDJweCk7XG4gICAgcGFkZGluZzogY2xhbXAoLjZyZW0sIDN2dywgMXJlbSk7XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGgyLFxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBoMyB7XG4gICAgbWFyZ2luOiAwO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBoMiB7XG4gICAgZm9udC1zaXplOiAxLjNlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgaDMge1xuICAgIGNvbG9yOiB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNkOWM3ZmIpO1xuICAgIGZvbnQtc2l6ZTogMWVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBzZWN0aW9uICsgc2VjdGlvbixcbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgZGV0YWlscyB7XG4gICAgbWFyZ2luLXRvcDogLjc1cmVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90ZXMge1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgb3ZlcnNjcm9sbC1iZWhhdmlvcjogY29udGFpbjtcbiAgICBzY3JvbGxiYXItd2lkdGg6IHRoaW47XG4gICAgb3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RlcyB1bCB7XG4gICAgbWFyZ2luOiAuMmVtIDAgMDtcbiAgICBwYWRkaW5nLWlubGluZS1zdGFydDogMS4yZW07XG4gICAgbGlzdC1zdHlsZTogZGlzYztcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGVzIGxpICsgbGkge1xuICAgIG1hcmdpbi10b3A6IC4yNWVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90ZXMgc3VtbWFyeSB7XG4gICAgbWFyZ2luLWJvdHRvbTogLjRyZW07XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBmb290ZXIge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC13cmFwOiB3cmFwO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBlbmQ7XG4gICAgZ2FwOiAuNWVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctb3B0aW9ucyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgZ2FwOiAuNGVtIC45ZW07XG4gICAgbWFyZ2luLWlubGluZS1lbmQ6IGF1dG87XG59XG4uamFydmlzLWNoYW5nZWxvZy1vcHRpb25zIGxhYmVsIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGdhcDogLjRlbTtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4iLCAiaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgbW91bnRTZXR0aW5nc0hlbHAgfSBmcm9tICcuL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgY3NzIGZyb20gJy4vc2V0dGluZ3MuY3NzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdFN0eWxlcygpIHtcbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgc3R5bGUuY2xhc3NOYW1lID0gJ2hoLWphcnZpcy1zdHlsZSc7XG4gICAgc3R5bGUudGV4dENvbnRlbnQgPSBgJHtjc3N9XG4gICAgICAgIC5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIHsgLS1qYXJ2aXMtdmVyc2lvbjogXCJ2JHtVU0VSU0NSSVBUX1ZFUlNJT059XCI7IH1cbiAgICBgO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1NldHRpbmdzKCkge1xuICAgIGlmIChjdXJyZW50UGFnZSAhPT0gJy9ob21lLmh0bWwnKSByZXR1cm47XG5cbiAgICBjb25zdCBzZWxlY3RvciA9ICcuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5wYW5lbC1jb250ZW50cyc7XG4gICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKCFwYW5lbCkgcmV0dXJuO1xuICAgICAgICBwYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdoaC1zY3JvbGwnKTtcbiAgICAgICAgbW91bnRTZXR0aW5nc0hlbHAocGFuZWwsICdqYXJ2aXMtc2V0dGluZy10b29sdGlwJyk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5IHx8ICEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkgfHwgIXBhbmVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY29uc3QgdW5pdCA9IGV2ZW50LmRlbHRhTW9kZSA9PT0gMSA/IDE2IDogZXZlbnQuZGVsdGFNb2RlID09PSAyID8gcGFuZWwuY2xpZW50SGVpZ2h0IDogMTtcbiAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gcGFuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0IC8gcGFuZWwub2Zmc2V0SGVpZ2h0IHx8IDE7XG4gICAgICAgICAgICBwYW5lbC5zY3JvbGxUb3AgKz0gZXZlbnQuZGVsdGFZICogdW5pdCAvIHNjYWxlO1xuICAgICAgICB9LCB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IGZhbHNlIH0pO1xuXG4gICAgICAgIGNvbnN0IGNhcmRzID0gcGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5jb25maWctc2V0dGluZycpO1xuICAgICAgICBjb25zdCBwYWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFwYW5lbC5vZmZzZXRXaWR0aCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcbiAgICAgICAgICAgICAgICBjYXJkLnN0eWxlLnNldFByb3BlcnR5KCctLWphcnZpcy1zZXR0aW5nLXJvd3MnLCBTdHJpbmcoY2FyZC5vZmZzZXRIZWlnaHQgKyAxMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFuZWwuY2xhc3NMaXN0LmFkZCgnamFydmlzLXBhY2tlZC1zZXR0aW5ncycpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBncm91cE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIocGFjayk7XG4gICAgICAgIGlmIChwYW5lbC5wYXJlbnRFbGVtZW50KSBncm91cE9ic2VydmVyLm9ic2VydmUocGFuZWwucGFyZW50RWxlbWVudCwgeyBhdHRyaWJ1dGVGaWx0ZXI6IFsnY2xhc3MnXSB9KTtcbiAgICAgICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcihwYWNrKTtcbiAgICAgICAgICAgIGNhcmRzLmZvckVhY2goY2FyZCA9PiBzaXplT2JzZXJ2ZXIub2JzZXJ2ZShjYXJkKSk7XG4gICAgICAgIH1cbiAgICAgICAgcGFjaygpO1xuICAgIH0pO1xufVxuIiwgImV4cG9ydCB0eXBlIE1vZHVsZVNldHRpbmdzID0gUmVjb3JkPHN0cmluZywgYm9vbGVhbj47XG5cbmludGVyZmFjZSBDb25maWdTY2hlbWEge1xuICAgIGJhc2VLZXk6IHN0cmluZztcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIGRlZmF1bHQ6IGJvb2xlYW47XG4gICAgc3ViU2V0dGluZ3M/OiB7IGtleTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyBkZWZhdWx0OiBib29sZWFuIH1bXTtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhITW9kdWxlIHtcbiAgICByZWFkb25seSBncm91cCA9ICdKQVJWSVMnO1xuICAgIHJlYWRvbmx5IGNvbmZpZ1NjaGVtYTogQ29uZmlnU2NoZW1hO1xuICAgIGhhc1J1biA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoeyBjb25maWdTY2hlbWEgfTogeyBuYW1lOiBzdHJpbmc7IGNvbmZpZ1NjaGVtYTogQ29uZmlnU2NoZW1hIH0pIHtcbiAgICAgICAgdGhpcy5jb25maWdTY2hlbWEgPSBjb25maWdTY2hlbWE7XG4gICAgfVxuXG4gICAgYWJzdHJhY3Qgc2hvdWxkUnVuKCk6IGJvb2xlYW47XG4gICAgYWJzdHJhY3QgcnVuKHNldHRpbmdzOiBNb2R1bGVTZXR0aW5ncyk6IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xufVxuIiwgImV4cG9ydCBjb25zdCBMU19DT05GSUdfTkFNRSA9ICdISFN0YXJrJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxzR2V0KGtleTogc3RyaW5nLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpOiB1bmtub3duIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShgJHtsc19uYW1lfSR7a2V5fWApID8/ICdudWxsJylcbn1cbmV4cG9ydCBmdW5jdGlvbiBsc1NldChrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24sIGxzX25hbWUgPSBMU19DT05GSUdfTkFNRSkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgJHtsc19uYW1lfSR7a2V5fWAsIEpTT04uc3RyaW5naWZ5KHZhbHVlKSlcbn1cbmV4cG9ydCBmdW5jdGlvbiBsc1JtKGtleTogc3RyaW5nLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gKVxufVxuIiwgImltcG9ydCB7IExTX0NPTkZJR19OQU1FIH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5cbmV4cG9ydCB0eXBlIE1hcmsgPSAnZnJpZW5kJyB8ICdmb2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNhdmVkTWFyayB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBuYW1lPzogc3RyaW5nO1xuICAgIG1hcms6IE1hcms7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcGVuTWFya01hbmFnZXIocmVhZDogKCkgPT4gU2F2ZWRNYXJrW10sIHJlbW92ZTogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW4sIGNsZWFyOiAoKSA9PiBib29sZWFuKSB7XG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXMtbWFyay1tYW5hZ2VyJykpIHJldHVybjtcblxuICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpYWxvZycpO1xuICAgIGRpYWxvZy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstbWFuYWdlcic7XG4gICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JywgJ2phcnZpcy1tYXJrLW1hbmFnZXItdGl0bGUnKTtcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgdGl0bGUuaWQgPSAnamFydmlzLW1hcmstbWFuYWdlci10aXRsZSc7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSAnRnJpZW5kcyBhbmQgZm9lcyc7XG5cbiAgICBjb25zdCBsaXN0cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxpc3RzLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1saXN0cyc7XG4gICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGFjdGlvbnMuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLWFjdGlvbnMnO1xuICAgIGNvbnN0IGNsZWFyQWxsID0gbWFrZUJ1dHRvbignQ2xlYXIgYWxsIG1hcmtzJywgKCkgPT4ge1xuICAgICAgICBpZiAoY29uZmlybSgnUmVtb3ZlIGFsbCBmcmllbmQgYW5kIGZvZSBtYXJrcyBmb3IgdGhpcyBnYW1lPycpICYmIGNsZWFyKCkpIHtcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgY2xvc2UuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IGNsb3NlID0gbWFrZUJ1dHRvbignQ2xvc2UnLCAoKSA9PiBkaWFsb2cuY2xvc2UoKSk7XG4gICAgYWN0aW9ucy5hcHBlbmQoY2xlYXJBbGwsIGNsb3NlKTtcblxuICAgIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IHJlYWQoKS5zb3J0KChhLCBiKSA9PiBOdW1iZXIoIWEubmFtZSkgLSBOdW1iZXIoIWIubmFtZSkgfHxcbiAgICAgICAgICAgIChhLm5hbWUgfHwgYS5pZCkubG9jYWxlQ29tcGFyZShiLm5hbWUgfHwgYi5pZCwgdW5kZWZpbmVkLCB7IG51bWVyaWM6IHRydWUgfSkpO1xuICAgICAgICBjb25zdCBzZWN0aW9ucyA9IChbJ2ZyaWVuZCcsICdmb2UnXSBhcyBjb25zdCkubWFwKG1hcmsgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlY3Rpb24nKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGVudHJpZXMuZmlsdGVyKGVudHJ5ID0+IGVudHJ5Lm1hcmsgPT09IG1hcmspO1xuICAgICAgICAgICAgaGVhZGluZy50ZXh0Q29udGVudCA9IChtYXJrID09PSAnZnJpZW5kJyA/ICdGcmllbmRzJyA6ICdGb2VzJykgKyBgICgke21hdGNoZXMubGVuZ3RofSlgO1xuICAgICAgICAgICAgc2VjdGlvbi5hcHBlbmRDaGlsZChoZWFkaW5nKTtcblxuICAgICAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW1wdHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgICAgICAgICAgZW1wdHkudGV4dENvbnRlbnQgPSAnTm8gc2F2ZWQgcGxheWVycy4nO1xuICAgICAgICAgICAgICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoZW1wdHkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWN0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBpZCwgbmFtZSB9IG9mIG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBsYXllciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIudGV4dENvbnRlbnQgPSBuYW1lID8gYCR7bmFtZX0gwrcgJHtpZH1gIDogYFBsYXllciAjJHtpZH1gO1xuICAgICAgICAgICAgICAgIGlmICghbmFtZSkgcGxheWVyLnRpdGxlID0gJ05hbWUgbm90IHJlY29yZGVkIHlldCc7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gbWFrZUJ1dHRvbignUmVtb3ZlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IEFycmF5LmZyb20obGlzdHMucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJykpLmluZGV4T2YoYnV0dG9uKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZShpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nID0gbGlzdHMucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAocmVtYWluaW5nW01hdGgubWluKGluZGV4LCByZW1haW5pbmcubGVuZ3RoIC0gMSldIHx8IGNsb3NlKS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGBSZW1vdmUgJHtuYW1lIHx8IGBwbGF5ZXIgJHtpZH1gfSBmcm9tICR7bWFyayA9PT0gJ2ZyaWVuZCcgPyAnZnJpZW5kcycgOiAnZm9lcyd9YCk7XG4gICAgICAgICAgICAgICAgcm93LmFwcGVuZChwbGF5ZXIsIGJ1dHRvbik7XG4gICAgICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChyb3cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VjdGlvbi5hcHBlbmRDaGlsZChsaXN0KTtcbiAgICAgICAgICAgIHJldHVybiBzZWN0aW9uO1xuICAgICAgICB9KTtcbiAgICAgICAgbGlzdHMucmVwbGFjZUNoaWxkcmVuKC4uLnNlY3Rpb25zKTtcbiAgICAgICAgY2xlYXJBbGwuZGlzYWJsZWQgPSBlbnRyaWVzLmxlbmd0aCA9PT0gMDtcbiAgICB9XG5cbiAgICByZW5kZXIoKTtcbiAgICBkaWFsb2cuYXBwZW5kKHRpdGxlLCBsaXN0cywgYWN0aW9ucyk7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgZXZlbnQgPT4ge1xuICAgICAgICBpZiAoIWV2ZW50LmtleSB8fCBbJ1BsYXllck1hcmtzJywgJ1BsYXllck1hcmtOYW1lcycsICdGcmllbmRMaXN0JywgJ0ZvZUxpc3QnXVxuICAgICAgICAgICAgLnNvbWUoa2V5ID0+IGV2ZW50LmtleSA9PT0gTFNfQ09ORklHX05BTUUgKyBrZXkpKSByZW5kZXIoKTtcbiAgICB9LCB7IHNpZ25hbDogbGlzdGVuZXJzLnNpZ25hbCB9KTtcbiAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB7XG4gICAgICAgIGxpc3RlbmVycy5hYm9ydCgpO1xuICAgICAgICBkaWFsb2cucmVtb3ZlKCk7XG4gICAgfSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcbiAgICBkaWFsb2cuc2hvd01vZGFsKCk7XG4gICAgY2xvc2UuZm9jdXMoKTtcbn1cblxuZnVuY3Rpb24gbWFrZUJ1dHRvbihsYWJlbDogc3RyaW5nLCBvbkNsaWNrOiAoKSA9PiB2b2lkKSB7XG4gICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICBidXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgYnV0dG9uLnRleHRDb250ZW50ID0gbGFiZWw7XG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljayk7XG4gICAgcmV0dXJuIGJ1dHRvbjtcbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHR5cGUgeyBDb250ZXN0RGF0YSB9IGZyb20gJy4uLy4uL2dhbWUtdHlwZXMnO1xuaW1wb3J0IHsgTFNfQ09ORklHX05BTUUsIGxzR2V0LCBsc1NldCB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgb3Blbk1hcmtNYW5hZ2VyLCB0eXBlIE1hcmssIHR5cGUgU2F2ZWRNYXJrIH0gZnJvbSAnLi9tYXJrTWFuYWdlcic7XG5cbmNvbnN0IERFRkFVTFRfQ09MT1JTOiBSZWNvcmQ8TWFyaywgc3RyaW5nPiA9IHsgZnJpZW5kOiAnIzQ4YTlmZicsIGZvZTogJyNmZjYxNzMnIH07XG50eXBlIFNhdmVkTmFtZSA9IHN0cmluZyB8IHsgbmFtZTogc3RyaW5nIH07XG5cbmZ1bmN0aW9uIHJlYWRSb3dOYW1lKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgY29uc3QgdGV4dCA9IGVsZW1lbnQudGV4dENvbnRlbnQ/LnRyaW0oKSA/PyAnJztcbiAgICBpZiAoIXRleHQuZW5kc1dpdGgoJysnKSkgcmV0dXJuIHRleHQ7XG4gICAgY29uc3Qgd2l0aG91dFN0YW5kYWxvbmVQbHVzID0gdGV4dC5yZXBsYWNlKC9cXHMrXFwrJC8sICcnKTtcbiAgICBpZiAoIWVsZW1lbnQuY2hpbGRFbGVtZW50Q291bnQpIHJldHVybiB3aXRob3V0U3RhbmRhbG9uZVBsdXM7XG5cbiAgICBjb25zdCBsYWJlbCA9IGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxFbGVtZW50O1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgbGFiZWwucXVlcnlTZWxlY3RvckFsbCgnKicpKSB7XG4gICAgICAgIGlmIChjaGlsZC50ZXh0Q29udGVudD8udHJpbSgpID09PSAnKycpIGNoaWxkLnJlbW92ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbGFiZWwudGV4dENvbnRlbnQ/LnRyaW0oKS5yZXBsYWNlKC9cXHMrXFwrJC8sICcnKSB8fCB3aXRob3V0U3RhbmRhbG9uZVBsdXM7XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlTYXZlZE5hbWUoc2F2ZWQ/OiBTYXZlZE5hbWUpIHtcbiAgICBpZiAodHlwZW9mIHNhdmVkICE9PSAnc3RyaW5nJykgcmV0dXJuIHNhdmVkPy5uYW1lO1xuICAgIC8vIE9sZCBlbnRyaWVzIHN0b3JlZCB0aGUgZnVsbCByb3cgdGV4dCwgaW5jbHVkaW5nIGEgdHJhaWxpbmcgYWRkIGNvbnRyb2wuXG4gICAgcmV0dXJuIHNhdmVkLnRyaW0oKS5yZXBsYWNlKC8oW14rXSlcXCskLywgJyQxJykudHJpbUVuZCgpO1xufVxuXG5leHBvcnQgY2xhc3MgRnJpZW5kQW5kRm9lcyBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIG5hbWVzID0gbmV3IE1hcDxIVE1MRWxlbWVudCwgc3RyaW5nPigpO1xuICAgIHByaXZhdGUgbWFya01lbnU6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByb290OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcm9vdFNlbGVjdG9yID0gJyc7XG4gICAgcHJpdmF0ZSBpbkxlYWd1ZSA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnZnJpZW5kQW5kRm9lcydcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJGcmllbmRzIGFuZCBmb2VzXCIsIFwiUmlnaHQtY2xpY2sgZWFjaCBwbGF5ZXIncyBuYW1lIHRvIGFkZCBvciByZW1vdmUgYSBtYXJrLiBNYW5hZ2Ugc2F2ZWQgbWFya3MgYmVsb3cuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAnbGVhZ3VlJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJJbiBsZWFndWVzXCIsIFwiU2hvdyBtYXJrcyBhbmQgYWxsb3cgbWFya2luZyBpbiBsZWFndWUgdGFibGVzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnY29udGVzdHMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkluIGNvbnRlc3RzXCIsIFwiU2hvdyBtYXJrcyBhbmQgYWxsb3cgbWFya2luZyBvbiBjb250ZXN0IGxlYWRlcmJvYXJkcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7IG5hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYSB9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBbJy9sZWFndWVzLmh0bWwnLCAnL2FjdGl2aXRpZXMuaHRtbCddLmluY2x1ZGVzKGN1cnJlbnRQYWdlKTtcbiAgICB9XG5cbiAgICByZWFkU2V0dGluZyhrZXk6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGxzR2V0KGtleSk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkTWFya3MoKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgICAgICBjb25zdCBzdG9yZWQgPSB0aGlzLnJlYWRTZXR0aW5nKCdQbGF5ZXJNYXJrcycpO1xuICAgICAgICBpZiAoc3RvcmVkICYmIHR5cGVvZiBzdG9yZWQgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHN0b3JlZCkpIHJldHVybiBzdG9yZWQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgICAgICAgY29uc3QgbWFya3M6IFJlY29yZDxzdHJpbmcsIE1hcms+ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgbWFya10gb2YgW1snRnJpZW5kTGlzdCcsICdmcmllbmQnXSwgWydGb2VMaXN0JywgJ2ZvZSddXSBhcyBjb25zdCkge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IHRoaXMucmVhZFNldHRpbmcoa2V5KTtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgaWQgb2YgbGlzdCkge1xuICAgICAgICAgICAgICAgIGlmICgvXlsxLTldXFxkKiQvLnRlc3QoU3RyaW5nKGlkKSkpIG1hcmtzW1N0cmluZyhpZCldID0gbWFyaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFya3M7XG4gICAgfVxuXG4gICAgcmVhZENvbG9ycygpOiBSZWNvcmQ8TWFyaywgc3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IHNhdmVkID0gdGhpcy5yZWFkU2V0dGluZygnUGxheWVyTWFya0NvbG9ycycpIGFzIFBhcnRpYWw8UmVjb3JkPE1hcmssIHVua25vd24+PiB8IG51bGw7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmcmllbmQ6IHR5cGVvZiBzYXZlZD8uZnJpZW5kID09PSAnc3RyaW5nJyAmJiAvXiNbXFxkYS1mXXs2fSQvaS50ZXN0KHNhdmVkLmZyaWVuZCkgPyBzYXZlZC5mcmllbmQgOiBERUZBVUxUX0NPTE9SUy5mcmllbmQsXG4gICAgICAgICAgICBmb2U6IHR5cGVvZiBzYXZlZD8uZm9lID09PSAnc3RyaW5nJyAmJiAvXiNbXFxkYS1mXXs2fSQvaS50ZXN0KHNhdmVkLmZvZSkgPyBzYXZlZC5mb2UgOiBERUZBVUxUX0NPTE9SUy5mb2VcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZWFkU2F2ZWROYW1lcygpOiBSZWNvcmQ8c3RyaW5nLCBTYXZlZE5hbWU+IHtcbiAgICAgICAgY29uc3Qgc2F2ZWQgPSB0aGlzLnJlYWRTZXR0aW5nKCdQbGF5ZXJNYXJrTmFtZXMnKTtcbiAgICAgICAgaWYgKCFzYXZlZCB8fCB0eXBlb2Ygc2F2ZWQgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoc2F2ZWQpKSByZXR1cm4ge307XG4gICAgICAgIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXMoc2F2ZWQpLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyBbc3RyaW5nLCBTYXZlZE5hbWVdID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFssIHZhbHVlXSA9IGVudHJ5O1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgQm9vbGVhbih2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZS5uYW1lID09PSAnc3RyaW5nJyk7XG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICBzYXZlTmFtZXMobmFtZXM6IFJlY29yZDxzdHJpbmcsIFNhdmVkTmFtZT4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxzU2V0KCdQbGF5ZXJNYXJrTmFtZXMnLCBuYW1lcyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHJlbWVtYmVyIG1hcmtlZCBwbGF5ZXIgbmFtZXM6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZU1hcmsoaWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBtYXJrcyA9IHRoaXMucmVhZE1hcmtzKCk7XG4gICAgICAgIGRlbGV0ZSBtYXJrc1tpZF07XG4gICAgICAgIGlmICghdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya3MnLCBtYXJrcykpIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgbmFtZXMgPSB0aGlzLnJlYWRTYXZlZE5hbWVzKCk7XG4gICAgICAgIGlmIChpZCBpbiBuYW1lcykge1xuICAgICAgICAgICAgZGVsZXRlIG5hbWVzW2lkXTtcbiAgICAgICAgICAgIHRoaXMuc2F2ZU5hbWVzKG5hbWVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZWFkU2F2ZWRNYXJrcygpIHtcbiAgICAgICAgY29uc3QgbmFtZXMgPSB0aGlzLnJlYWRTYXZlZE5hbWVzKCk7XG4gICAgICAgIHJldHVybiBPYmplY3QuZW50cmllcyh0aGlzLnJlYWRNYXJrcygpKS5mbGF0TWFwPFNhdmVkTWFyaz4oKFtpZCwgbWFya10pID0+XG4gICAgICAgICAgICAvXlsxLTldXFxkKiQvLnRlc3QoaWQpICYmIChtYXJrID09PSAnZnJpZW5kJyB8fCBtYXJrID09PSAnZm9lJylcbiAgICAgICAgICAgICAgICA/IFt7IGlkLCBuYW1lOiBkaXNwbGF5U2F2ZWROYW1lKG5hbWVzW2lkXSksIG1hcmsgfV1cbiAgICAgICAgICAgICAgICA6IFtdKTtcbiAgICB9XG5cbiAgICBzYXZlU2V0dGluZyhrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxzU2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgYWxlcnQoJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB5b3VyIEZyaWVuZHMgYW5kIEZvZXMgc2V0dGluZ3MuJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbnN0YWxsU2V0dGluZ3MoKSB7XG4gICAgICAgIGlmIChjdXJyZW50UGFnZSAhPT0gJy9ob21lLmh0bWwnKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSAnLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmdbcmVsPVwiSkFSVklTX2ZyaWVuZEFuZEZvZXNcIl0gLnN1Yi1zZXR0aW5ncyc7XG4gICAgICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoIXNldHRpbmdzIHx8IHNldHRpbmdzLnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXMtbWFyay1jb2xvcicpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGlucHV0cyA9IG5ldyBNYXA8TWFyaywgSFRNTElucHV0RWxlbWVudD4oKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW21hcmssIHRleHRdIG9mIFtbJ2ZyaWVuZCcsICdGcmllbmQgbmFtZSBjb2xvciddLCBbJ2ZvZScsICdGb2UgbmFtZSBjb2xvciddXSBhcyBjb25zdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstY29sb3InO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgICAgICAgICAgaW5wdXQudHlwZSA9ICdjb2xvcic7XG4gICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSB0aGlzLnJlYWRDb2xvcnMoKVttYXJrXTtcbiAgICAgICAgICAgICAgICBpbnB1dHMuc2V0KG1hcmssIGlucHV0KTtcbiAgICAgICAgICAgICAgICBpbnB1dC5kaXNhYmxlZCA9ICFzZXR0aW5ncy5jbG9zZXN0KCcuY29uZmlnLXNldHRpbmcnKT8uY2xhc3NMaXN0LmNvbnRhaW5zKCdlbmFibGVkJyk7XG4gICAgICAgICAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnJlYWRDb2xvcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrQ29sb3JzJywgeyAuLi5jb2xvcnMsIFttYXJrXTogaW5wdXQudmFsdWUgfSkpIGlucHV0LnZhbHVlID0gY29sb3JzW21hcmtdO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGxhYmVsLmFwcGVuZCh0aXRsZSwgaW5wdXQpO1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlc2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICByZXNldC50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICByZXNldC5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uJztcbiAgICAgICAgICAgIHJlc2V0LnRleHRDb250ZW50ID0gJ1Jlc2V0IGNvbG9ycyc7XG4gICAgICAgICAgICByZXNldC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtDb2xvcnMnLCB7fSkpIHJldHVybjtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCBpbnB1dF0gb2YgaW5wdXRzKSBpbnB1dC52YWx1ZSA9IERFRkFVTFRfQ09MT1JTW21hcmtdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBtYW5hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIG1hbmFnZS50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBtYW5hZ2UuY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgICAgICAgICBtYW5hZ2UudGV4dENvbnRlbnQgPSAnTWFuYWdlIG1hcmtzJztcbiAgICAgICAgICAgIG1hbmFnZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IG9wZW5NYXJrTWFuYWdlcihcbiAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLnJlYWRTYXZlZE1hcmtzKCksXG4gICAgICAgICAgICAgICAgaWQgPT4gdGhpcy5yZW1vdmVNYXJrKGlkKSxcbiAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya3MnLCB7fSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlTmFtZXMoe30pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApKTtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGFjdGlvbnMuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLXNldHRpbmctYWN0aW9ucyc7XG4gICAgICAgICAgICBhY3Rpb25zLmFwcGVuZChyZXNldCwgbWFuYWdlKTtcbiAgICAgICAgICAgIHNldHRpbmdzLmFwcGVuZENoaWxkKGFjdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjbG9zZU1hcmtNZW51KCkge1xuICAgICAgICB0aGlzLm1hcmtNZW51Py5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5tYXJrTWVudSA9IG51bGw7XG4gICAgfVxuXG4gICAgb3Blbk1hcmtNZW51KGV2ZW50OiBNb3VzZUV2ZW50LCBuYW1lOiBIVE1MRWxlbWVudCwgaWQ6IHN0cmluZykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG5cbiAgICAgICAgY29uc3QgbWVudSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBtZW51LmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1tZW51JztcbiAgICAgICAgbWVudS5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnZ3JvdXAnKTtcbiAgICAgICAgbWVudS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnTWFyayBwbGF5ZXInKTtcbiAgICAgICAgY29uc3QgYWRkQWN0aW9uID0gKHRleHQ6IHN0cmluZywgYWN0OiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lLmlzQ29ubmVjdGVkICYmIHRoaXMubmFtZXMuZ2V0KG5hbWUpID09PSBpZCkgYWN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1lbnUuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgfTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFyaywgdGV4dF0gb2YgW1snZnJpZW5kJywgJ01hcmsgYXMgZnJpZW5kJ10sIFsnZm9lJywgJ01hcmsgYXMgZm9lJ11dIGFzIGNvbnN0KSB7XG4gICAgICAgICAgICBhZGRBY3Rpb24odGV4dCwgKCkgPT4gdGhpcy5hcHBseU1hcmsoaWQsIG1hcmspKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZS5kYXRhc2V0LmphcnZpc01hcmspIGFkZEFjdGlvbignUmVtb3ZlIHRoaXMgcGxheWVy4oCZcyBtYXJrJywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVtb3ZlTWFyayhpZCkpIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgbWVudS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrID0+IGNsaWNrLnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtZW51KTtcbiAgICAgICAgdGhpcy5tYXJrTWVudSA9IG1lbnU7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gbmFtZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgeCA9IGV2ZW50LmNsaWVudFggfHwgYm91bmRzLmxlZnQ7XG4gICAgICAgIGNvbnN0IHkgPSBldmVudC5jbGllbnRZIHx8IGJvdW5kcy5ib3R0b207XG4gICAgICAgIG1lbnUuc3R5bGUubGVmdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHgsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCAtIG1lbnUub2Zmc2V0V2lkdGgpKSArICdweCc7XG4gICAgICAgIG1lbnUuc3R5bGUudG9wID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oeSwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCAtIG1lbnUub2Zmc2V0SGVpZ2h0KSkgKyAncHgnO1xuICAgICAgICBtZW51LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpPy5mb2N1cyh7IHByZXZlbnRTY3JvbGw6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgZ2V0Q29udGVzdE5hbWVzKHJvb3Q6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdERhdGFbXSkge1xuICAgICAgICBjb25zdCBuYW1lcyA9IG5ldyBNYXA8SFRNTEVsZW1lbnQsIHN0cmluZz4oKTtcbiAgICAgICAgY29uc3QgYnlDb250ZXN0ID0gbmV3IE1hcDxzdHJpbmcsIE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+Pj4oKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiByb290LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTFRhYmxlUm93RWxlbWVudD4oJy5sZWFkVGFibGUgdHInKSkge1xuICAgICAgICAgICAgY29uc3QgY2VsbCA9IHJvdy5jZWxscz8uWzFdO1xuICAgICAgICAgICAgaWYgKCFjZWxsIHx8IGNlbGwubG9jYWxOYW1lICE9PSAndGQnKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBjZWxsLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcubmlja25hbWUnKSB8fCBjZWxsO1xuICAgICAgICAgICAgbGV0IGlkID0gcm93LmdldEF0dHJpYnV0ZSgnc29ydGluZ19pZCcpIHx8IG5hbWUuZ2V0QXR0cmlidXRlKCdpZC1tZW1iZXInKSB8fFxuICAgICAgICAgICAgICAgIG5hbWUucXVlcnlTZWxlY3RvcignW2lkLW1lbWJlcl0nKT8uZ2V0QXR0cmlidXRlKCdpZC1tZW1iZXInKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlc3RJZCA9IHJvdy5jbG9zZXN0KCdbaWRfY29udGVzdF0nKT8uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG4gICAgICAgICAgICBpZiAoY29udGVzdElkKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJ5TmFtZSA9IGJ5Q29udGVzdC5nZXQoY29udGVzdElkKTtcbiAgICAgICAgICAgICAgICBpZiAoIWJ5TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0aWNpcGFudHMgPSBjb250ZXN0cy5maW5kKGNvbnRlc3QgPT4gU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCkgPT09IGNvbnRlc3RJZCk/LnBhcnRpY2lwYW50cztcbiAgICAgICAgICAgICAgICAgICAgYnlOYW1lID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHsgbmlja25hbWUsIGlkX21lbWJlciB9IG9mIE9iamVjdC52YWx1ZXMocGFydGljaXBhbnRzIHx8IHt9KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbmlja25hbWVLZXkgPSBTdHJpbmcobmlja25hbWUgPz8gJycpLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbmlja25hbWVLZXkgfHwgIS9eWzEtOV1cXGQqJC8udGVzdChTdHJpbmcoaWRfbWVtYmVyKSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGJ5TmFtZS5nZXQobmlja25hbWVLZXkpIHx8IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlcy5hZGQoU3RyaW5nKGlkX21lbWJlcikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnlOYW1lLnNldChuaWNrbmFtZUtleSwgbWF0Y2hlcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnlDb250ZXN0LnNldChjb250ZXN0SWQsIGJ5TmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBieU5hbWUuZ2V0KHJlYWRSb3dOYW1lKG5hbWUpKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcyAmJiAhbWF0Y2hlcy5oYXMoaWQgPz8gJycpKSBpZCA9IG1hdGNoZXMuc2l6ZSA9PT0gMSA/IG1hdGNoZXMudmFsdWVzKCkubmV4dCgpLnZhbHVlIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZCAmJiAvXlsxLTldXFxkKiQvLnRlc3QoaWQpKSBuYW1lcy5zZXQobmFtZSwgaWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYW1lcztcbiAgICB9XG5cbiAgICByZWZyZXNoKCkge1xuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4odGhpcy5yb290U2VsZWN0b3IpO1xuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xuICAgICAgICBjb25zdCBjb250ZXN0cyA9IHRoaXMuaW5MZWFndWUgPyBbXSA6IFtcbiAgICAgICAgICAgIC4uLk9iamVjdC52YWx1ZXMod2luZG93LmNvbnRlc3RzPy5hY3RpdmUgPz8ge30pLFxuICAgICAgICAgICAgLi4uT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmZpbmlzaGVkID8/IHt9KVxuICAgICAgICBdLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbCk7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gIXJvb3QgPyBuZXcgTWFwPEhUTUxFbGVtZW50LCBzdHJpbmc+KCkgOiB0aGlzLmluTGVhZ3VlXG4gICAgICAgICAgICA/IG5ldyBNYXAoQXJyYXkuZnJvbShyb290LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcubmlja25hbWVbaWQtbWVtYmVyXScpLCBuYW1lID0+IFtuYW1lLCBuYW1lLmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJyldIGFzIGNvbnN0KVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgcmVhZG9ubHkgW0hUTUxFbGVtZW50LCBzdHJpbmddID0+ICEhZW50cnlbMV0gJiYgL15bMS05XVxcZCokLy50ZXN0KGVudHJ5WzFdKSkpXG4gICAgICAgICAgICA6IHRoaXMuZ2V0Q29udGVzdE5hbWVzKHJvb3QsIGNvbnRlc3RzKTtcblxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5uYW1lcy5rZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChuYW1lcy5oYXMobmFtZSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNQbGF5ZXI7XG4gICAgICAgICAgICBkZWxldGUgbmFtZS5kYXRhc2V0LmphcnZpc01hcms7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5hbWVzID0gbmFtZXM7XG4gICAgICAgIGlmICghcm9vdCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBtYXJrcyA9IHRoaXMucmVhZE1hcmtzKCk7XG4gICAgICAgIGNvbnN0IHNhdmVkTmFtZXMgPSB0aGlzLnJlYWRTYXZlZE5hbWVzKCk7XG4gICAgICAgIGNvbnN0IHJvc3Rlck5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGxldCBuYW1lc0NoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgcmVtZW1iZXJOYW1lID0gKGlkOiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcgfCBudWxsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IHR5cGVvZiB0ZXh0ID09PSAnc3RyaW5nJyA/IHRleHQudHJpbSgpIDogJyc7XG4gICAgICAgICAgICBpZiAoIWRpc3BsYXlOYW1lIHx8IChtYXJrc1tpZF0gIT09ICdmcmllbmQnICYmIG1hcmtzW2lkXSAhPT0gJ2ZvZScpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91cyA9IHNhdmVkTmFtZXNbaWRdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcmV2aW91cyA9PT0gJ3N0cmluZycgfHwgcHJldmlvdXM/Lm5hbWUgIT09IGRpc3BsYXlOYW1lKSB7XG4gICAgICAgICAgICAgICAgc2F2ZWROYW1lc1tpZF0gPSB7IG5hbWU6IGRpc3BsYXlOYW1lIH07XG4gICAgICAgICAgICAgICAgbmFtZXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5pbkxlYWd1ZSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IHBsYXllciwgbmlja25hbWUgfSBvZiB3aW5kb3cub3Bwb25lbnRzX2xpc3QgPz8gW10pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IFN0cmluZyhwbGF5ZXI/LmlkX2ZpZ2h0ZXIpO1xuICAgICAgICAgICAgICAgIGlmIChyZW1lbWJlck5hbWUoaWQsIG5pY2tuYW1lKSkgcm9zdGVyTmFtZXMuYWRkKGlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFByZWZlciB0aGUgYWN0aXZlIHJvc3RlciBpZiBhIHBsYXllciBhcHBlYXJzIGluIGJvdGggb2xkIGFuZCBjdXJyZW50IGNvbnRlc3RzLlxuICAgICAgICAgICAgZm9yIChjb25zdCBjb250ZXN0IG9mIGNvbnRlc3RzKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IGlkX21lbWJlciwgbmlja25hbWUgfSBvZiBPYmplY3QudmFsdWVzKGNvbnRlc3QucGFydGljaXBhbnRzID8/IHt9KSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZCA9IFN0cmluZyhpZF9tZW1iZXIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJvc3Rlck5hbWVzLmhhcyhpZCkgJiYgcmVtZW1iZXJOYW1lKGlkLCBuaWNrbmFtZSkpIHJvc3Rlck5hbWVzLmFkZChpZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbG9ycyA9IHRoaXMucmVhZENvbG9ycygpO1xuICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCBjb2xvcl0gb2YgT2JqZWN0LmVudHJpZXMoY29sb3JzKSkge1xuICAgICAgICAgICAgY29uc3QgcHJvcGVydHkgPSAnLS1qYXJ2aXMtJyArIG1hcmsgKyAnLWNvbG9yJztcbiAgICAgICAgICAgIGlmIChyb290LnN0eWxlLmdldFByb3BlcnR5VmFsdWUocHJvcGVydHkpICE9PSBjb2xvcikgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgY29sb3IpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIGlkXSBvZiBuYW1lcykge1xuICAgICAgICAgICAgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNQbGF5ZXIgIT09IGlkKSBuYW1lLmRhdGFzZXQuamFydmlzUGxheWVyID0gaWQ7XG4gICAgICAgICAgICBjb25zdCBtYXJrID0gbWFya3NbaWRdO1xuICAgICAgICAgICAgaWYgKG1hcmsgPT09ICdmcmllbmQnIHx8IG1hcmsgPT09ICdmb2UnKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrICE9PSBtYXJrKSBuYW1lLmRhdGFzZXQuamFydmlzTWFyayA9IG1hcms7XG4gICAgICAgICAgICAgICAgaWYgKCFyb3N0ZXJOYW1lcy5oYXMoaWQpKSByZW1lbWJlck5hbWUoaWQsIHJlYWRSb3dOYW1lKG5hbWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmFtZS5kYXRhc2V0LmphcnZpc01hcmspIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgbmFtZS5kYXRhc2V0LmphcnZpc01hcms7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWVzQ2hhbmdlZCkgdGhpcy5zYXZlTmFtZXMoc2F2ZWROYW1lcyk7XG4gICAgfVxuXG4gICAgYXBwbHlNYXJrKGlkOiBzdHJpbmcsIG1hcms6IE1hcmspIHtcbiAgICAgICAgY29uc3QgbWFya3MgPSB0aGlzLnJlYWRNYXJrcygpO1xuICAgICAgICBtYXJrc1tpZF0gPSBtYXJrO1xuXG4gICAgICAgIGlmICh0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrcycsIG1hcmtzKSkgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgaGFuZGxlTWFya01lbnUoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUgJiYgdGhpcy5tYXJrTWVudT8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgIT09ICdjb250ZXh0bWVudScgJiYgIWV2ZW50LmFsdEtleSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG5hbWUgPSBldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ID8gZXZlbnQudGFyZ2V0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCdbZGF0YS1qYXJ2aXMtcGxheWVyXScpIDogbnVsbDtcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGlkID0gdGhpcy5uYW1lcy5nZXQobmFtZSk7XG4gICAgICAgIGlmICghaWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5vcGVuTWFya01lbnUoZXZlbnQsIG5hbWUsIGlkKTtcbiAgICB9XG5cbiAgICBydW4oeyBsZWFndWUsIGNvbnRlc3RzIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICB0aGlzLmluTGVhZ3VlID0gY3VycmVudFBhZ2UgPT09ICcvbGVhZ3Vlcy5odG1sJztcbiAgICAgICAgaWYgKHRoaXMuaW5MZWFndWUgPyAhbGVhZ3VlIDogIWNvbnRlc3RzKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5yb290U2VsZWN0b3IgPSB0aGlzLmluTGVhZ3VlID8gJy5sZWFndWVfdGFibGUnIDogJyNjb250ZXN0cyAucmlnaHRfcGFydCc7XG4gICAgICAgIGNvbnN0IGhhbmRsZU1hcmtNZW51ID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB0aGlzLmhhbmRsZU1hcmtNZW51KGV2ZW50KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVNYXJrTWVudSwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgaGFuZGxlTWFya01lbnUsIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmtleSAhPT0gJ0VzY2FwZScgfHwgIXRoaXMubWFya01lbnUpIHJldHVybjtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3N0b3JhZ2UnLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoIWV2ZW50LmtleSB8fCBbJ1BsYXllck1hcmtzJywgJ1BsYXllck1hcmtDb2xvcnMnLCAnRnJpZW5kTGlzdCcsICdGb2VMaXN0J11cbiAgICAgICAgICAgICAgICAuc29tZShrZXkgPT4gZXZlbnQua2V5ID09PSBMU19DT05GSUdfTkFNRSArIGtleSkpIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKG11dGF0aW9ucyA9PiB7XG4gICAgICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnJvb3RTZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAocm9vdCAhPT0gdGhpcy5yb290IHx8IChyb290ICYmIG11dGF0aW9ucy5zb21lKCh7IHRhcmdldCB9KSA9PiByb290LmNvbnRhaW5zKHRhcmdldCkpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICBjaGFyYWN0ZXJEYXRhOiB0cnVlLFxuICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFsnc29ydGluZ19pZCcsICdpZC1tZW1iZXInLCAnaWRfY29udGVzdCddXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuXG5leHBvcnQgdHlwZSBDb250ZXN0S2luZCA9ICdkYWlseScgfCAnZXZlbnQnO1xuZXhwb3J0IHR5cGUgQ29udGVzdFJhbmsgPSAndG9wJyB8ICdtaW5lJztcblxuY29uc3QgQ09OVEVTVF9LSU5EUyA9IFtbJ2RhaWx5JywgJ0RhaWx5J10sIFsnZXZlbnQnLCAnRXZlbnQnXV0gYXMgY29uc3Q7XG5jb25zdCBDT05URVNUX0VWRU5UUyA9IFtbJ2FueScsICdBbnknXSwgWydjYmMnLCAnQ2JDJ10sIFsnY2NjJywgJ0NDQyddLCBbJ2xjJywgJ0xDJ11dIGFzIGNvbnN0O1xuY29uc3QgQ09OVEVTVF9SQU5LUyA9IFtbJ3RvcCcsICdUb3AnXSwgWydtaW5lJywgJ015IHJhbmsnXV0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIENvbnRlc3RFdmVudCA9IEV4Y2x1ZGU8KHR5cGVvZiBDT05URVNUX0VWRU5UUylbbnVtYmVyXVswXSwgJ2FueSc+O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVhZENvbnRlc3RTZXR0aW5nKGtleTogc3RyaW5nKTogdW5rbm93biB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGxzR2V0KGtleSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRDb250ZXN0RGVmYXVsdHMoKSB7XG4gICAgY29uc3Qga2luZDogQ29udGVzdEtpbmQgPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RLaW5kJykgPT09ICdkYWlseScgPyAnZGFpbHknIDogJ2V2ZW50JztcbiAgICBjb25zdCBzYXZlZEV2ZW50ID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0RXZlbnQnKTtcbiAgICBjb25zdCBldmVudCA9IENPTlRFU1RfRVZFTlRTLmZpbmQoKFt2YWx1ZV0pID0+IHZhbHVlID09PSBzYXZlZEV2ZW50KT8uWzBdID8/ICdhbnknO1xuICAgIGNvbnN0IHJhbms6IENvbnRlc3RSYW5rID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0UmFua1N0YXJ0JykgPT09ICd0b3AnID8gJ3RvcCcgOiAnbWluZSc7XG4gICAgcmV0dXJuIHsga2luZCwgZXZlbnQsIHJhbmsgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRDb250ZXN0UmFuayhpZDogc3RyaW5nLCBmYWxsYmFjazogQ29udGVzdFJhbmspOiBDb250ZXN0UmFuayB7XG4gICAgY29uc3QgcmFua3MgPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RSYW5rcycpO1xuICAgIGlmIChyYW5rcyAmJiB0eXBlb2YgcmFua3MgPT09ICdvYmplY3QnICYmIE9iamVjdC5oYXNPd24ocmFua3MsIGlkKSkge1xuICAgICAgICBjb25zdCByYW5rID0gKHJhbmtzIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVtpZF07XG4gICAgICAgIGlmIChyYW5rID09PSAnbWluZScgfHwgcmFuayA9PT0gJ3RvcCcpIHJldHVybiByYW5rO1xuICAgIH1cblxuICAgIC8vIE9sZGVyIHZlcnNpb25zIHN0b3JlZCBhIHJhbmsgb3ZlcnJpZGUgZm9yIGEgc2luZ2xlIGNvbnRlc3QuXG4gICAgY29uc3Qgc2F2ZWQgPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RQaW5uZWRSYW5rJyk7XG4gICAgaWYgKHNhdmVkICYmIHR5cGVvZiBzYXZlZCA9PT0gJ29iamVjdCcgJiYgJ2lkJyBpbiBzYXZlZCAmJiBTdHJpbmcoc2F2ZWQuaWQpID09PSBpZCAmJiAncmFuaycgaW4gc2F2ZWQpIHtcbiAgICAgICAgaWYgKHNhdmVkLnJhbmsgPT09ICdtaW5lJyB8fCBzYXZlZC5yYW5rID09PSAndG9wJykgcmV0dXJuIHNhdmVkLnJhbms7XG4gICAgfVxuICAgIHJldHVybiBmYWxsYmFjaztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVDb250ZXN0UmFuayhpZDogc3RyaW5nLCByYW5rOiBDb250ZXN0UmFuaykge1xuICAgIGNvbnN0IHNhdmVkID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0UmFua3MnKTtcbiAgICBjb25zdCByYW5rcyA9IHNhdmVkICYmIHR5cGVvZiBzYXZlZCA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoc2F2ZWQpID8gc2F2ZWQgOiB7fTtcbiAgICBsc1NldCgnQ29udGVzdFJhbmtzJywgeyAuLi5yYW5rcywgW2lkXTogcmFuayB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VSYW5rQ2hvaWNlKGxhYmVsOiBzdHJpbmcsIHNlbGVjdDogKHJhbms6IENvbnRlc3RSYW5rKSA9PiB2b2lkKSB7XG4gICAgcmV0dXJuIG1ha2VDaG9pY2UobGFiZWwsIENPTlRFU1RfUkFOS1MsIHNlbGVjdCk7XG59XG5cbmZ1bmN0aW9uIG1ha2VDaG9pY2U8VCBleHRlbmRzIHN0cmluZz4obGFiZWw6IHN0cmluZywgb3B0aW9uczogUmVhZG9ubHlBcnJheTxyZWFkb25seSBbVCwgc3RyaW5nXT4sIHNlbGVjdDogKHZhbHVlOiBUKSA9PiB2b2lkKSB7XG4gICAgY29uc3QgZ3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgZ3JvdXAuY2xhc3NOYW1lID0gJ2phcnZpcy1jb250ZXN0LWNob2ljZSc7XG4gICAgZ3JvdXAuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2dyb3VwJyk7XG4gICAgZ3JvdXAuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgbGFiZWwpO1xuICAgIGdyb3VwLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKSk7XG4gICAgZm9yIChjb25zdCBbdmFsdWUsIHRleHRdIG9mIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgIGJ1dHRvbi5kYXRhc2V0LmNvbnRlc3RDaG9pY2UgPSB2YWx1ZTtcbiAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBzZWxlY3QodmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgZ3JvdXAuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICB9XG4gICAgcmV0dXJuIGdyb3VwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0Q29udGVzdENob2ljZShncm91cDogSFRNTEVsZW1lbnQsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICBmb3IgKGNvbnN0IGJ1dHRvbiBvZiBncm91cC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKSkge1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBTdHJpbmcoYnV0dG9uLmRhdGFzZXQuY29udGVzdENob2ljZSA9PT0gdmFsdWUpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsQ29udGVzdFNldHRpbmdzKCkge1xuICAgIGlmIChjdXJyZW50UGFnZSAhPT0gJy9ob21lLmh0bWwnKSByZXR1cm47XG5cbiAgICBjb25zdCBzZWxlY3RvciA9ICcuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZ1tyZWw9XCJKQVJWSVNfY29udGVzdFN0YXJ0XCJdJztcbiAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKCFjYXJkIHx8IGNhcmQucXVlcnlTZWxlY3RvcignLmphcnZpcy1jb250ZXN0LXNldHRpbmdzJykpIHJldHVybjtcblxuICAgICAgICBjb25zdCBmaWVsZHNldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkc2V0Jyk7XG4gICAgICAgIGZpZWxkc2V0LmNsYXNzTmFtZSA9ICdqYXJ2aXMtY29udGVzdC1zZXR0aW5ncyc7XG4gICAgICAgIGZpZWxkc2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdDb250ZXN0IHN0YXJ0dXAgZGVmYXVsdHMnKTtcbiAgICAgICAgY29uc3Qgc2F2ZSA9IChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZywgZ3JvdXA6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxzU2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2UoZ3JvdXAsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBzYXZlIHRoZSBjb250ZXN0IGRlZmF1bHQ6JywgZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGV2ZW50TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZXZlbnRMYWJlbC5pbm5lckhUTUwgPSBzZXR0aW5nSGVscCgnRXZlbnQgdHlwZScsICdQcmVmZXIgQ2JDIChDdW1iYWNrIENvbnRlc3QpLCBDQ0MgKENyYXp5IEN1bWJhY2sgQ29udGVzdCksIG9yIExDIChMZWdlbmRhcnkgQ29udGVzdCkgd2hlbiBhY3RpdmUuIEFueSBvcGVucyB0aGUgYm90dG9tIGFjdGl2ZSBjb250ZXN0LCBhcyBkb2VzIGFuIHVuYXZhaWxhYmxlIGV2ZW50IHR5cGUuJyk7XG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IG1ha2VDaG9pY2UoJ0V2ZW50IHR5cGUnLCBDT05URVNUX0VWRU5UUywgdmFsdWUgPT4gc2F2ZSgnQ29udGVzdEV2ZW50JywgdmFsdWUsIGV2ZW50cykpO1xuICAgICAgICBjb25zdCBzaG93RXZlbnRzID0gKGtpbmQ6IENvbnRlc3RLaW5kKSA9PiBldmVudExhYmVsLmhpZGRlbiA9IGV2ZW50cy5oaWRkZW4gPSBraW5kID09PSAnZGFpbHknO1xuICAgICAgICBjb25zdCBraW5kcyA9IG1ha2VDaG9pY2UoJ1ByZWZlcnJlZCBjb250ZXN0JywgQ09OVEVTVF9LSU5EUywgdmFsdWUgPT4ge1xuICAgICAgICAgICAgaWYgKHNhdmUoJ0NvbnRlc3RLaW5kJywgdmFsdWUsIGtpbmRzKSkgc2hvd0V2ZW50cyh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByYW5rcyA9IG1ha2VSYW5rQ2hvaWNlKCdEZWZhdWx0IGxlYWRlcmJvYXJkIHBvc2l0aW9uJywgdmFsdWUgPT4gc2F2ZSgnQ29udGVzdFJhbmtTdGFydCcsIHZhbHVlLCByYW5rcykpO1xuICAgICAgICBjb25zdCBkZWZhdWx0cyA9IHJlYWRDb250ZXN0RGVmYXVsdHMoKTtcbiAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShraW5kcywgZGVmYXVsdHMua2luZCk7XG4gICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2UoZXZlbnRzLCBkZWZhdWx0cy5ldmVudCk7XG4gICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2UocmFua3MsIGRlZmF1bHRzLnJhbmspO1xuICAgICAgICBzaG93RXZlbnRzKGRlZmF1bHRzLmtpbmQpO1xuXG4gICAgICAgIGNvbnN0IGtpbmRMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBraW5kTGFiZWwuaW5uZXJIVE1MID0gc2V0dGluZ0hlbHAoJ1ByZWZlcnJlZCBjb250ZXN0JywgJ0RhaWx5IG9wZW5zIHRoZSBmaXJzdCBhY3RpdmUgZGFpbHkgY29udGVzdC4gRXZlbnQgY2FuIHByZWZlciBhbiBldmVudCB0eXBlIG9yIGZvbGxvdyB0aGUgZ2FtZSBhbmQgb3BlbiB0aGUgYm90dG9tIGFjdGl2ZSBjb250ZXN0LicpO1xuICAgICAgICBjb25zdCByYW5rTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcmFua0xhYmVsLmlubmVySFRNTCA9IHNldHRpbmdIZWxwKCdMZWFkZXJib2FyZCBzdGFydCcsICdPcGVuIGF0IHRoZSB0b3Agb3IgYXQgeW91ciByYW5rLiBBIHBvc2l0aW9uIGNob3NlbiBvbiBhIGNvbnRlc3QgY2FyZCB0YWtlcyBwcmlvcml0eS4nKTtcbiAgICAgICAgZmllbGRzZXQuYXBwZW5kKGtpbmRMYWJlbCwga2luZHMsIGV2ZW50TGFiZWwsIGV2ZW50cywgcmFua0xhYmVsLCByYW5rcyk7XG4gICAgICAgIGNvbnN0IHJlZnJlc2hFbmFibGVkID0gKCkgPT4gZmllbGRzZXQuZGlzYWJsZWQgPSAhY2FyZC5jbGFzc0xpc3QuY29udGFpbnMoJ2VuYWJsZWQnKTtcbiAgICAgICAgcmVmcmVzaEVuYWJsZWQoKTtcbiAgICAgICAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIocmVmcmVzaEVuYWJsZWQpLm9ic2VydmUoY2FyZCwgeyBhdHRyaWJ1dGVGaWx0ZXI6IFsnY2xhc3MnXSB9KTtcbiAgICAgICAgY2FyZC5hcHBlbmRDaGlsZChmaWVsZHNldCk7XG4gICAgfSk7XG59XG4iLCAiaW50ZXJmYWNlIENvbnRlc3RTaG9ydGN1dCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBjYXRlZ29yeTogc3RyaW5nO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICByYW5rOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb3NpdGlvbkNvbnRlc3RTaG9ydGN1dHMoY2FudmFzOiBIVE1MRWxlbWVudCwgYmFyOiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnN0IGNsb3NlID0gY2FudmFzLnBhcmVudEVsZW1lbnQ/LnF1ZXJ5U2VsZWN0b3IoJzpzY29wZSA+IC5jbG9zZV9jcm9zcycpO1xuICAgIGlmICghY2xvc2UpIHJldHVybjtcblxuICAgIGNvbnN0IGZyYW1lID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGNyb3NzID0gY2xvc2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3Qgc2NhbGVYID0gZnJhbWUud2lkdGggLyBjYW52YXMub2Zmc2V0V2lkdGg7XG4gICAgY29uc3Qgc2NhbGVZID0gZnJhbWUuaGVpZ2h0IC8gY2FudmFzLm9mZnNldEhlaWdodDtcbiAgICBpZiAoIXNjYWxlWCB8fCAhc2NhbGVZIHx8ICFjcm9zcy53aWR0aCkgcmV0dXJuO1xuXG4gICAgYmFyLnN0eWxlLmluc2V0SW5saW5lRW5kID0gYCR7TWF0aC5jZWlsKChmcmFtZS5yaWdodCAtIGNyb3NzLmxlZnQpIC8gc2NhbGVYICsgOCl9cHhgO1xuICAgIGJhci5zdHlsZS5pbnNldEJsb2NrU3RhcnQgPSBgJHtNYXRoLnJvdW5kKChjcm9zcy50b3AgKyBjcm9zcy5oZWlnaHQgLyAyIC0gZnJhbWUudG9wKSAvIHNjYWxlWSl9cHhgO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQ29udGVzdFNob3J0Y3V0cyhcbiAgICBjYW52YXM6IEhUTUxFbGVtZW50LFxuICAgIGNvbnRlc3RzOiBDb250ZXN0U2hvcnRjdXRbXSxcbiAgICBzZWxlY3RlZDogc3RyaW5nIHwgbnVsbCxcbiAgICBzZWxlY3Q6IChpZDogc3RyaW5nKSA9PiB2b2lkXG4pIHtcbiAgICBsZXQgYmFyID0gY2FudmFzLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCc6c2NvcGUgPiAuamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzJyk7XG4gICAgaWYgKCFjb250ZXN0cy5sZW5ndGgpIHtcbiAgICAgICAgYmFyPy5yZW1vdmUoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIWJhcikge1xuICAgICAgICBiYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYmFyLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMnO1xuICAgICAgICBiYXIuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2dyb3VwJyk7XG4gICAgICAgIGJhci5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnQWN0aXZlIGNvbnRlc3RzJyk7XG4gICAgICAgIGJhci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBpZCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0PEhUTUxCdXR0b25FbGVtZW50PignYnV0dG9uW2RhdGEtY29udGVzdC1pZF0nKT8uZGF0YXNldC5jb250ZXN0SWQ7XG4gICAgICAgICAgICBpZiAoaWQpIHNlbGVjdChpZCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjYW52YXMucHJlcGVuZChiYXIpO1xuICAgICAgICBwb3NpdGlvbkNvbnRlc3RTaG9ydGN1dHMoY2FudmFzLCBiYXIpO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1dHRvbnMgPSBuZXcgTWFwKEFycmF5LmZyb20oYmFyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpLCBidXR0b24gPT4gW2J1dHRvbi5kYXRhc2V0LmNvbnRlc3RJZCwgYnV0dG9uXSkpO1xuICAgIGNvbnN0IGNhdGVnb3JpZXMgPSBjb250ZXN0cy5tYXAoY29udGVzdCA9PiBjb250ZXN0LmNhdGVnb3J5KTtcbiAgICBmb3IgKGNvbnN0IFtpbmRleCwgeyBpZCwgY2F0ZWdvcnksIG5hbWUsIHJhbmsgfV0gb2YgY29udGVzdHMuZW50cmllcygpKSB7XG4gICAgICAgIGxldCBidXR0b24gPSBidXR0b25zLmdldChpZCk7XG4gICAgICAgIGlmICghYnV0dG9uKSB7XG4gICAgICAgICAgICBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBidXR0b24uZGF0YXNldC5jb250ZXN0SWQgPSBpZDtcbiAgICAgICAgICAgIGJ1dHRvbi5hcHBlbmQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpLCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHJvbmcnKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZSA9IGNhdGVnb3JpZXMuaW5kZXhPZihjYXRlZ29yeSkgPT09IGNhdGVnb3JpZXMubGFzdEluZGV4T2YoY2F0ZWdvcnkpID9cbiAgICAgICAgICAgIGNhdGVnb3J5IDogYCR7Y2F0ZWdvcnl9ICR7Y2F0ZWdvcmllcy5zbGljZSgwLCBpbmRleCArIDEpLmZpbHRlcih2YWx1ZSA9PiB2YWx1ZSA9PT0gY2F0ZWdvcnkpLmxlbmd0aH1gO1xuICAgICAgICBjb25zdCBbbGFiZWwsIHBsYWNlbWVudF0gPSBBcnJheS5mcm9tKGJ1dHRvbi5jaGlsZHJlbik7XG4gICAgICAgIGlmIChsYWJlbC50ZXh0Q29udGVudCAhPT0gdHlwZSkgbGFiZWwudGV4dENvbnRlbnQgPSB0eXBlO1xuICAgICAgICBpZiAocGxhY2VtZW50LnRleHRDb250ZW50ICE9PSAocmFuayB8fCAn4oCTJykpIHBsYWNlbWVudC50ZXh0Q29udGVudCA9IHJhbmsgfHwgJ+KAkyc7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gYCR7dHlwZX0gwrcgJHtuYW1lfSDCtyAke3JhbmsgPyBgUmFuayAke3Jhbmt9YCA6ICdSYW5rIHVuYXZhaWxhYmxlJ31gO1xuICAgICAgICBpZiAoYnV0dG9uLnRpdGxlICE9PSBkZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgYnV0dG9uLnRpdGxlID0gZGVzY3JpcHRpb247XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgZGVzY3JpcHRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByZXNzZWQgPSBTdHJpbmcoaWQgPT09IHNlbGVjdGVkKTtcbiAgICAgICAgaWYgKGJ1dHRvbi5nZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcpICE9PSBwcmVzc2VkKSBidXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBwcmVzc2VkKTtcblxuICAgICAgICBpZiAoYnV0dG9uICE9PSBiYXIuY2hpbGRyZW5baW5kZXhdKSBiYXIuaW5zZXJ0QmVmb3JlKGJ1dHRvbiwgYmFyLmNoaWxkcmVuW2luZGV4XSA/PyBudWxsKTtcbiAgICAgICAgYnV0dG9ucy5kZWxldGUoaWQpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGJ1dHRvbiBvZiBidXR0b25zLnZhbHVlcygpKSBidXR0b24ucmVtb3ZlKCk7XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUsIHR5cGUgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyAkLCBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgbHNHZXQsIGxzU2V0LCBsc1JtIH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5pbXBvcnQgeyBtYWtlUmFua0Nob2ljZSwgcmVhZENvbnRlc3REZWZhdWx0cywgcmVhZENvbnRlc3RSYW5rLCByZWFkQ29udGVzdFNldHRpbmcsIHNhdmVDb250ZXN0UmFuaywgc2VsZWN0Q29udGVzdENob2ljZSwgdHlwZSBDb250ZXN0RXZlbnQsIHR5cGUgQ29udGVzdEtpbmQgfSBmcm9tICcuL2NvbnRlc3RQcmVmZXJlbmNlcyc7XG5pbXBvcnQgeyBwb3NpdGlvbkNvbnRlc3RTaG9ydGN1dHMsIHJlbmRlckNvbnRlc3RTaG9ydGN1dHMgfSBmcm9tICcuL2NvbnRlc3RTaG9ydGN1dHMnO1xuXG50eXBlIENvbnRlc3RDYXRlZ29yeSA9IENvbnRlc3RLaW5kIHwgQ29udGVzdEV2ZW50O1xuY29uc3QgQ09OVEVTVF9TSE9SVF9MQUJFTFM6IFJlY29yZDxDb250ZXN0Q2F0ZWdvcnksIHN0cmluZz4gPSB7XG4gICAgZGFpbHk6ICdEQycsIGNiYzogJ0NiQycsIGNjYzogJ0NDQycsIGxjOiAnTEMnLCBldmVudDogJ0V2ZW50J1xufTtcbmNvbnN0IENPTlRFU1RfVElUTEVfU0VMRUNUT1IgPSAnLmNvbnRlc3RfdGl0bGUsIC5jb250ZXN0X25hbWUsIGgzLCBoNCwgaDUnO1xuY29uc3QgcHJvdGVjdGVkUGFuZXMgPSBuZXcgU2V0PEhUTUxFbGVtZW50PigpO1xubGV0IHJlc3RvcmVTY3JvbGxJbnRvVmlldzogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBndWFyZFNjcm9sbEludG9WaWV3KHBhbmU6IEhUTUxFbGVtZW50KSB7XG4gICAgaWYgKCFwcm90ZWN0ZWRQYW5lcy5zaXplKSB7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzID0gRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXc7XG4gICAgICAgIGNvbnN0IGd1YXJkZWQgPSBmdW5jdGlvbiAodGhpczogRWxlbWVudCwgb3B0aW9ucz86IGJvb2xlYW4gfCBTY3JvbGxJbnRvVmlld09wdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIHNjcm9sbEludG9WaWV3IGNhbiBtb3ZlIGEgcGFuZSB3aXRob3V0IGNhbGxpbmcgaXRzIHNjcm9sbCBtZXRob2RzLlxuICAgICAgICAgICAgaWYgKEFycmF5LmZyb20ocHJvdGVjdGVkUGFuZXMpLnNvbWUoc2Nyb2xsZXIgPT4gc2Nyb2xsZXIuY29udGFpbnModGhpcykpKSByZXR1cm47XG4gICAgICAgICAgICBwcmV2aW91cy5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB9O1xuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlldyA9IGd1YXJkZWQ7XG4gICAgICAgIHJlc3RvcmVTY3JvbGxJbnRvVmlldyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlldyA9PT0gZ3VhcmRlZCkgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXcgPSBwcmV2aW91cztcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcHJvdGVjdGVkUGFuZXMuYWRkKHBhbmUpO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgcHJvdGVjdGVkUGFuZXMuZGVsZXRlKHBhbmUpO1xuICAgICAgICBpZiAocHJvdGVjdGVkUGFuZXMuc2l6ZSkgcmV0dXJuO1xuICAgICAgICByZXN0b3JlU2Nyb2xsSW50b1ZpZXc/LigpO1xuICAgICAgICByZXN0b3JlU2Nyb2xsSW50b1ZpZXcgPSB1bmRlZmluZWQ7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0Q29udGVzdENhdGVnb3J5KGNhdGVnb3J5OiBzdHJpbmcgfCB1bmRlZmluZWQpOiBDb250ZXN0Q2F0ZWdvcnkgfCBudWxsIHtcbiAgICBzd2l0Y2ggKGNhdGVnb3J5Py50cmltKCkudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bLSBdKy9nLCAnXycpKSB7XG4gICAgICAgIGNhc2UgJ2RhaWx5JzpcbiAgICAgICAgY2FzZSAnZGFpbHlfY29udGVzdCc6IHJldHVybiAnZGFpbHknO1xuICAgICAgICBjYXNlICdjdW1iYWNrJzpcbiAgICAgICAgY2FzZSAnY3VtYmFja19jb250ZXN0JzpcbiAgICAgICAgY2FzZSAnY2JjJzogcmV0dXJuICdjYmMnO1xuICAgICAgICBjYXNlICdjcmF6eV9jdW1iYWNrJzpcbiAgICAgICAgY2FzZSAnY3JhenlfY3VtYmFja19jb250ZXN0JzpcbiAgICAgICAgY2FzZSAnY2NiYyc6XG4gICAgICAgIGNhc2UgJ2NjYyc6IHJldHVybiAnY2NjJztcbiAgICAgICAgY2FzZSAnbGVnZW5kYXJ5JzpcbiAgICAgICAgY2FzZSAnbGVnZW5kYXJ5X2NvbnRlc3QnOlxuICAgICAgICBjYXNlICdsYyc6IHJldHVybiAnbGMnO1xuICAgICAgICBkZWZhdWx0OiByZXR1cm4gY2F0ZWdvcnkgPyAnZXZlbnQnIDogbnVsbDtcbiAgICB9XG59XG5cbmludGVyZmFjZSBDb250ZXN0Q2FyZCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBjYXJkOiBIVE1MRWxlbWVudDtcbiAgICBoZWFkZXI6IEhUTUxFbGVtZW50O1xuICAgIHRpdGxlOiBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBjYXRlZ29yeTogQ29udGVzdENhdGVnb3J5IHwgbnVsbDtcbiAgICBlbmRlZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFybUNvbnRlc3RTdGFydHVwR3VhcmQoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lICE9PSAnL2FjdGl2aXRpZXMuaHRtbCcgfHwgbmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpLmdldCgndGFiJykgIT09ICdjb250ZXN0cycpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIGlmIChKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdISFBsdXNQbHVzQ29uZmlnJykgPz8gJ251bGwnKT8uSkFSVklTX2NvbnRlc3RTdGFydCA9PT0gZmFsc2UpIHJldHVybjtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEtlZXAgYm90aCBwYW5lcyBvdXQgb2YgdmlldyB1bnRpbCB0aGUgY2hvc2VuIGNvbnRlc3QgYW5kIGl0cyBsZWFkZXJib2FyZCBhcmUgcG9zaXRpb25lZC5cbiAgICBjb25zdCBndWFyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgZ3VhcmQuaWQgPSAnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCc7XG4gICAgZ3VhcmQudGV4dENvbnRlbnQgPSBgXG4gICAgICAgICNjb250ZXN0cyAubGVmdF9wYXJ0IC5zY3JvbGxfYXJlYSxcbiAgICAgICAgI2NvbnRlc3RzIC5yaWdodF9wYXJ0IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDAgIWltcG9ydGFudDtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IG5vbmUgIWltcG9ydGFudDtcbiAgICAgICAgICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgICAgICB9XG4gICAgYDtcbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgaWYgKCFkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHJldHVybjtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKGd1YXJkKTtcbiAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH0pO1xuICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChndWFyZCk7XG4gICAgZWxzZSBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LCB7IGNoaWxkTGlzdDogdHJ1ZSB9KTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgIGd1YXJkLnJlbW92ZSgpO1xuICAgIH0sIDQwMDApO1xufVxuXG5leHBvcnQgY2xhc3MgQ29udGVzdFN0YXJ0IGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgcHJlZmVyZW5jZSA9ICcnO1xuICAgIHByaXZhdGUgc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICBwcml2YXRlIGRlZmF1bHRzID0gcmVhZENvbnRlc3REZWZhdWx0cygpO1xuICAgIHByaXZhdGUgbGlzdDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJpZ2h0OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmVzdG9yaW5nQ2FyZDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJlcG9zaXRpb246ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc3RvcEp1bXA6ICgoZmluaXNoPzogYm9vbGVhbikgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHN0b3BTd2l0Y2hTY3JvbGwgPSB0cnVlO1xuICAgIHByaXZhdGUgc3dpdGNoU2Nyb2xsOiB7IHJlc3RvcmU6ICgpID0+IHZvaWQ7IHN0b3A6ICgpID0+IHZvaWQgfSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgb2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGxpc3RlbmVyczogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdjb250ZXN0U3RhcnQnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiQ29udGVzdCBzdGFydHVwXCIsIFwiT3BlbiB0aGUgcHJlZmVycmVkIGNvbnRlc3QgYW5kIHJhbmsgb24gbG9hZCwgYW5kIHN3aXRjaCBhY3RpdmUgY29udGVzdHMgZnJvbSB0aGUgaGVhZGVyLiBBIHN0YXJyZWQgY29udGVzdCB0YWtlcyBwcmlvcml0eSBvbiBsb2FkLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ25vU3dpdGNoU2Nyb2xsJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoJ1N0b3Agc2Nyb2xsaW5nIG9uIGNvbnRlc3Qgc3dpdGNoZXMnLCAnS2VlcCB0aGUgY29udGVzdCBsaXN0IGluIHBsYWNlIHdoZW4geW91IHN3aXRjaCBieSBjbGlja2luZyBhIGNhcmQuIFRoZSBsZWFkZXJib2FyZCBvcGVucyBhdCB5b3VyIHByZWZlcnJlZCBwb3NpdGlvbiwgYW5kIHlvdSBjYW4gc3RpbGwgc2Nyb2xsIGJ5IGhhbmQuJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7IG5hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYSB9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZSA9PT0gJy9hY3Rpdml0aWVzLmh0bWwnO1xuICAgIH1cblxuICAgIGdldENvbnRlc3RzKGxpc3Q6IEhUTUxFbGVtZW50LCBmaW5pc2hlZDogUmVhZG9ubHlTZXQ8c3RyaW5nPik6IENvbnRlc3RDYXJkW10ge1xuICAgICAgICBjb25zdCBhY3RpdmUgPSBuZXcgTWFwKE9iamVjdC52YWx1ZXMod2luZG93LmNvbnRlc3RzPy5hY3RpdmUgfHwge30pXG4gICAgICAgICAgICAuZmlsdGVyKGNvbnRlc3QgPT4gY29udGVzdD8uaWRfY29udGVzdCAhPSBudWxsKVxuICAgICAgICAgICAgLm1hcChjb250ZXN0ID0+IFtTdHJpbmcoY29udGVzdC5pZF9jb250ZXN0KSwgY29udGVzdF0pKTtcblxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShsaXN0LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcuY29udGVzdFtpZF9jb250ZXN0XScpKS5mbGF0TWFwKGNhcmQgPT4ge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBjYXJkLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKCFpZCkgcmV0dXJuIFtdO1xuICAgICAgICAgICAgY29uc3QgY29udGVzdCA9IGFjdGl2ZS5nZXQoaWQpO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVyID0gY2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmNvbnRlc3RfaGVhZGVyJyk7XG4gICAgICAgICAgICBjb25zdCBlbmRlZCA9IGZpbmlzaGVkLmhhcyhpZCk7XG4gICAgICAgICAgICBpZiAoIWhlYWRlciB8fCAoIWVuZGVkICYmICFjb250ZXN0ICYmICFoZWFkZXIubWF0Y2hlcygnLmluX3Byb2dyZXNzJykpKSByZXR1cm4gW107XG5cbiAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KENPTlRFU1RfVElUTEVfU0VMRUNUT1IpO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHRpdGxlICYmIEFycmF5LmZyb20odGl0bGUuY2hpbGROb2RlcylcbiAgICAgICAgICAgICAgICAuZmlsdGVyKG5vZGUgPT4gIShub2RlIGluc3RhbmNlb2YgRWxlbWVudCkgfHwgIW5vZGUubWF0Y2hlcygnLmphcnZpcy1jb250ZXN0LXBpbiwgLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKSlcbiAgICAgICAgICAgICAgICAubWFwKG5vZGUgPT4gbm9kZS50ZXh0Q29udGVudCkuam9pbignJykudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBnZXRDb250ZXN0Q2F0ZWdvcnkoY29udGVzdD8uY2F0ZWdvcnlfdHlwZSk7XG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICBpZCwgY2FyZCwgaGVhZGVyLCB0aXRsZSwgZW5kZWQsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgbGFiZWw6IFN0cmluZyhuYW1lIHx8IGNvbnRlc3Q/Lm5hbWUgfHwgY29udGVzdD8udGl0bGUgfHxcbiAgICAgICAgICAgICAgICAgICAgKGNhdGVnb3J5ID09PSAnZGFpbHknID8gJ0RhaWx5IGNvbnRlc3QnIDogJ0NvbnRlc3QnKSkudHJpbSgpXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0VGFyZ2V0KGNvbnRlc3RzOiBDb250ZXN0Q2FyZFtdKSB7XG4gICAgICAgIGlmICh0aGlzLnByZWZlcmVuY2UpIHJldHVybiBjb250ZXN0cy5maW5kKGNvbnRlc3QgPT4gY29udGVzdC5pZCA9PT0gdGhpcy5wcmVmZXJlbmNlKTtcblxuICAgICAgICBpZiAodGhpcy5kZWZhdWx0cy5raW5kID09PSAnZXZlbnQnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kZWZhdWx0cy5ldmVudCAhPT0gJ2FueScpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IFsuLi5jb250ZXN0c10ucmV2ZXJzZSgpLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmNhdGVnb3J5ID09PSB0aGlzLmRlZmF1bHRzLmV2ZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykgcmV0dXJuIGV2ZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbnRlc3RzLmF0KC0xKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29udGVzdHMuZmluZChjb250ZXN0ID0+IGNvbnRlc3QuY2F0ZWdvcnkgPT09ICdkYWlseScpID8/XG4gICAgICAgICAgICBjb250ZXN0cy5maW5kKGNvbnRlc3QgPT4gY29udGVzdC5jYXRlZ29yeSA9PT0gbnVsbCkgPz8gY29udGVzdHNbMF07XG4gICAgfVxuXG4gICAgY2xlYXJFeHBpcmVkUGluKGxpc3Q6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdENhcmRbXSwgZmluaXNoZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz4pIHtcbiAgICAgICAgaWYgKCF0aGlzLnByZWZlcmVuY2UgfHwgY29udGVzdHMuc29tZSgoeyBpZCB9KSA9PiBpZCA9PT0gdGhpcy5wcmVmZXJlbmNlKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IHdpbmRvdy5jb250ZXN0cz8uYWN0aXZlO1xuICAgICAgICBjb25zdCBtaXNzaW5nID0gZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyAmJiBsaXN0LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZXN0X2hlYWRlcicpICYmXG4gICAgICAgICAgICBhY3RpdmUgJiYgIU9iamVjdC52YWx1ZXMoYWN0aXZlKS5zb21lKGNvbnRlc3QgPT4gU3RyaW5nKGNvbnRlc3Q/LmlkX2NvbnRlc3QpID09PSB0aGlzLnByZWZlcmVuY2UpO1xuICAgICAgICBpZiAoIWZpbmlzaGVkLmhhcyh0aGlzLnByZWZlcmVuY2UpICYmICFtaXNzaW5nKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZXhwaXJlZElkID0gdGhpcy5wcmVmZXJlbmNlO1xuICAgICAgICB0aGlzLnByZWZlcmVuY2UgPSAnJztcbiAgICAgICAgdGhpcy5zdG9wSnVtcD8uKGZhbHNlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChTdHJpbmcobHNHZXQoJ0NvbnRlc3RTdGFydElkJykpID09PSBleHBpcmVkSWQpIGxzUm0oJ0NvbnRlc3RTdGFydElkJyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IGNsZWFyIHRoZSBleHBpcmVkIGNvbnRlc3QgcHJlZmVyZW5jZTonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FyZENvbnRyb2xzKGxpc3Q6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdENhcmRbXSkge1xuICAgICAgICBjb25zdCBob3N0cyA9IG5ldyBTZXQoY29udGVzdHMubWFwKCh7IHRpdGxlLCBoZWFkZXIgfSkgPT4gdGl0bGUgfHwgaGVhZGVyKSk7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbCBvZiBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1waW4sIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JykpIHtcbiAgICAgICAgICAgIGlmICghY29udHJvbC5wYXJlbnRFbGVtZW50IHx8ICFob3N0cy5oYXMoY29udHJvbC5wYXJlbnRFbGVtZW50KSkgY29udHJvbC5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgeyBpZCwgdGl0bGUsIGhlYWRlciwgbGFiZWwgfSBvZiBjb250ZXN0cykge1xuICAgICAgICAgICAgY29uc3QgaG9zdCA9IHRpdGxlIHx8IGhlYWRlcjtcbiAgICAgICAgICAgIGxldCBwaW4gPSBob3N0LnF1ZXJ5U2VsZWN0b3I8SFRNTEJ1dHRvbkVsZW1lbnQ+KCc6c2NvcGUgPiAuamFydmlzLWNvbnRlc3QtcGluJyk7XG4gICAgICAgICAgICBpZiAoIXBpbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY29udGVzdC1waW4nO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlc3RJZCA9IGJ1dHRvbi5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb250ZXN0SWQpIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5wcmVmZXJlbmNlID09PSBjb250ZXN0SWQgPyAnJyA6IGNvbnRlc3RJZDtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0KSBsc1NldCgnQ29udGVzdFN0YXJ0SWQnLCBuZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgbHNSbSgnQ29udGVzdFN0YXJ0SWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJlZmVyZW5jZSA9IG5leHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3BKdW1wPy4oKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB0aGUgY29udGVzdCBwcmVmZXJlbmNlOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcGluID0gaG9zdC5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGlubmVkID0gdGhpcy5wcmVmZXJlbmNlID09PSBpZDtcbiAgICAgICAgICAgIHBpbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIFN0cmluZyhwaW5uZWQpKTtcbiAgICAgICAgICAgIHBpbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBwaW5uZWQgPyBgVW5waW4gJHtsYWJlbH1gIDogYFBpbiAke2xhYmVsfSB0byBvcGVuIG9uIHJlbG9hZGApO1xuICAgICAgICAgICAgcGluLnRpdGxlID0gcGlubmVkID8gJ1Bpbm5lZC4gQ2xpY2sgdG8gdW5waW4gdGhpcyBjb250ZXN0LicgOiAnT3BlbiB0aGlzIGNvbnRlc3Qgd2hlbiB0aGUgcGFnZSByZWxvYWRzJztcblxuICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gaG9zdC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKTtcbiAgICAgICAgICAgIGlmICghcG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaG9pY2UgPSBtYWtlUmFua0Nob2ljZSgnQ29udGVzdCBsZWFkZXJib2FyZCBzdGFydCcsIHJhbmsgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXN0SWQgPSBjaG9pY2UuY2xvc2VzdCgnLmNvbnRlc3RbaWRfY29udGVzdF0nKT8uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29udGVzdElkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQ29udGVzdFJhbmsoY29udGVzdElkLCByYW5rKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2UoY2hvaWNlLCByYW5rKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB0aGUgbGVhZGVyYm9hcmQgcG9zaXRpb246JywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yaWdodCAmJiB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHRoaXMucmlnaHQpID09PSBjb250ZXN0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcEp1bXA/LigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvblN3aXRjaChsaXN0LCB0aGlzLnJpZ2h0LCBjb250ZXN0SWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2hvaWNlLmNsYXNzTGlzdC5hZGQoJ2phcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKTtcbiAgICAgICAgICAgICAgICBjaG9pY2UudGl0bGUgPSAnTGVhZGVyYm9hcmQgcG9zaXRpb24gZm9yIHRoaXMgY29udGVzdCc7XG4gICAgICAgICAgICAgICAgcGluLmFmdGVyKGNob2ljZSk7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSBjaG9pY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKHBvc2l0aW9uLCByZWFkQ29udGVzdFJhbmsoaWQsIHRoaXMuZGVmYXVsdHMucmFuaykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IGxpc3QucXVlcnlTZWxlY3RvcignLmNvbnRlc3RfaGVhZGVyX2FjdGl2ZScpPy5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpO1xuICAgICAgICBpZiAoc2VsZWN0ZWQpIHJldHVybiBzZWxlY3RlZC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcblxuICAgICAgICBjb25zdCBwYW5lbHMgPSBBcnJheS5mcm9tKHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYW5raW5nW2lkX2NvbnRlc3RdJykpXG4gICAgICAgICAgICAuZmlsdGVyKHBhbmVsID0+IHBhbmVsLmdldENsaWVudFJlY3RzKCkubGVuZ3RoICYmIGdldENvbXB1dGVkU3R5bGUocGFuZWwpLnZpc2liaWxpdHkgPT09ICd2aXNpYmxlJyk7XG4gICAgICAgIHJldHVybiBwYW5lbHMubGVuZ3RoID09PSAxID8gcGFuZWxzWzBdLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpIDogbnVsbDtcbiAgICB9XG5cbiAgICBzaG93TGVhZGVyYm9hcmQocmlnaHQ6IEhUTUxFbGVtZW50LCBjb250ZXN0SWQ6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgaWYgKCFjb250ZXN0SWQpIHtcbiAgICAgICAgICAgIHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1vdGhlcicpLmZvckVhY2gocGFuZWwgPT4gcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnamFydmlzLWNvbnRlc3Qtb3RoZXInKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwYW5lbCBvZiByaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcucmFua2luZ1tpZF9jb250ZXN0XScpKSB7XG4gICAgICAgICAgICBwYW5lbC5jbGFzc0xpc3QudG9nZ2xlKCdqYXJ2aXMtY29udGVzdC1vdGhlcicsIHBhbmVsLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpICE9PSBjb250ZXN0SWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0T3duUm93KGJvYXJkOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBvd24gPSBib2FyZC5xdWVyeVNlbGVjdG9yKCcubGVhZFRhYmxlIHRyLmxlYWRfdGFibGVfZGVmYXVsdCcpO1xuICAgICAgICBpZiAob3duKSByZXR1cm4gb3duO1xuXG4gICAgICAgIGNvbnN0IGhlcm9JZCA9ICh3aW5kb3cuc2hhcmVkPy5IZXJvIHx8IHdpbmRvdy5IZXJvKT8uaW5mb3M/LmlkO1xuICAgICAgICBpZiAoaGVyb0lkID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGJvYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5sZWFkVGFibGUgdHJbc29ydGluZ19pZF0nKSlcbiAgICAgICAgICAgIC5maW5kKHJvdyA9PiByb3cuZ2V0QXR0cmlidXRlKCdzb3J0aW5nX2lkJykgPT09IFN0cmluZyhoZXJvSWQpKTtcbiAgICB9XG5cbiAgICBnZXRMZWFkZXJib2FyZFNjcm9sbGVyKHJpZ2h0OiBIVE1MRWxlbWVudCwgaWQ6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShyaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcucmFua2luZ1tpZF9jb250ZXN0XScpKVxuICAgICAgICAgICAgLmZpbmQocGFuZWwgPT4gcGFuZWwuZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0JykgPT09IGlkKT8ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5sZWFkX3RhYmxlX3ZpZXcnKTtcbiAgICB9XG5cbiAgICB1cGRhdGVTaG9ydGN1dHMobGlzdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudCwgY29udGVzdHM6IENvbnRlc3RDYXJkW10pIHtcbiAgICAgICAgY29uc3QgY2FudmFzID0gbGlzdC5jbG9zZXN0PEhUTUxFbGVtZW50PignI2NvbnRlc3RzJyk7XG4gICAgICAgIGlmICghY2FudmFzKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgc2hvcnRjdXRzID0gY29udGVzdHMubWFwKCh7IGlkLCBoZWFkZXIsIGxhYmVsLCBjYXRlZ29yeSB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBib2FyZCA9IHRoaXMuZ2V0TGVhZGVyYm9hcmRTY3JvbGxlcihyaWdodCwgaWQpO1xuICAgICAgICAgICAgY29uc3QgcmFuayA9IGhlYWRlci5xdWVyeVNlbGVjdG9yKCcucGVyc29uYWxfcmV3YXJkcyAucmFuaycpPy50ZXh0Q29udGVudD8udHJpbSgpIHx8XG4gICAgICAgICAgICAgICAgKGJvYXJkICYmIHRoaXMuZ2V0T3duUm93KGJvYXJkKT8ucXVlcnlTZWxlY3RvcigndGQnKT8udGV4dENvbnRlbnQ/LnRyaW0oKSkgfHwgJyc7XG4gICAgICAgICAgICByZXR1cm4geyBpZCwgbmFtZTogbGFiZWwsIGNhdGVnb3J5OiBjYXRlZ29yeSA/IENPTlRFU1RfU0hPUlRfTEFCRUxTW2NhdGVnb3J5XSA6ICdDb250ZXN0JywgcmFuayB9O1xuICAgICAgICB9KTtcbiAgICAgICAgcmVuZGVyQ29udGVzdFNob3J0Y3V0cyhjYW52YXMsIHNob3J0Y3V0cywgdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCksIGlkID0+IHRoaXMub3BlblNob3J0Y3V0KGlkKSk7XG4gICAgfVxuXG4gICAgb3BlblNob3J0Y3V0KGlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgeyBsaXN0LCByaWdodCB9ID0gdGhpcztcbiAgICAgICAgaWYgKCFsaXN0IHx8ICFyaWdodCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGNhcmQgPSBsaXN0LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KGAuY29udGVzdFtpZF9jb250ZXN0PVwiJHtDU1MuZXNjYXBlKGlkKX1cIl1gKTtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gY2FyZD8ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jb250ZXN0X2hlYWRlcicpO1xuICAgICAgICBpZiAoIWNhcmQgfHwgIWhlYWRlciB8fCBoZWFkZXIubWF0Y2hlcygnLmVuZGVkJykgfHwgY2FyZC5tYXRjaGVzKCcuZW5kZWQnKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGFscmVhZHlTZWxlY3RlZCA9IHRoaXMuZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdCwgcmlnaHQpID09PSBpZDtcbiAgICAgICAgdGhpcy5zdG9wSnVtcD8uKCk7XG4gICAgICAgIHRoaXMucHJlcGFyZVN3aXRjaChsaXN0LCByaWdodCwgaWQsIGNhcmQpO1xuICAgICAgICBpZiAoIWFscmVhZHlTZWxlY3RlZCkgKGhlYWRlci5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihDT05URVNUX1RJVExFX1NFTEVDVE9SKSB8fCBoZWFkZXIpLmNsaWNrKCk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHByZXBhcmVTd2l0Y2gobGlzdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudCwgaWQ6IHN0cmluZyB8IG51bGwsIHNob3J0Y3V0Q2FyZD86IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgaWYgKGlkKSB0aGlzLnBvc2l0aW9uU3dpdGNoKGxpc3QsIHJpZ2h0LCBpZCwgc2hvcnRjdXRDYXJkKTtcbiAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIG51bGwpO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBsb2NrU2Nyb2xsKHNjcm9sbGVyOiBIVE1MRWxlbWVudCwgZ3VhcmREZXNjZW5kYW50cyA9IGZhbHNlKSB7XG4gICAgICAgICQoc2Nyb2xsZXIpLnN0b3AodHJ1ZSwgZmFsc2UpO1xuICAgICAgICAvLyBUaGUgZ2FtZSBjYW4gc3RhcnQgYW5vdGhlciBqUXVlcnkgdHdlZW4gYWZ0ZXIgbG9hZC4gQmxvY2sgaXRzIHdyaXRlcyBvbiB0aGlzIHBhbmUgb25seS5cbiAgICAgICAgY29uc3QgaWdub3JlU2Nyb2xsID0gKCkgPT4ge307XG4gICAgICAgIGNvbnN0IGdldCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsICdzY3JvbGxUb3AnKT8uZ2V0O1xuICAgICAgICBjb25zdCBkZXNjcmlwdG9ycyA9IE9iamVjdC5lbnRyaWVzKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogeyBnZXQsIHNldDogaWdub3JlU2Nyb2xsIH0sXG4gICAgICAgICAgICBzY3JvbGw6IHsgdmFsdWU6IGlnbm9yZVNjcm9sbCwgd3JpdGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHNjcm9sbFRvOiB7IHZhbHVlOiBpZ25vcmVTY3JvbGwsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICBzY3JvbGxCeTogeyB2YWx1ZTogaWdub3JlU2Nyb2xsLCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICAgIH0pLmZpbHRlcigoW2tleV0pID0+ICFPYmplY3QuaGFzT3duKHNjcm9sbGVyLCBrZXkpKTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCBkZXNjcmlwdG9yXSBvZiBkZXNjcmlwdG9ycykge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNjcm9sbGVyLCBrZXksIHsgLi4uZGVzY3JpcHRvciwgY29uZmlndXJhYmxlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlbGVhc2VEZXNjZW5kYW50cyA9IGd1YXJkRGVzY2VuZGFudHMgPyBndWFyZFNjcm9sbEludG9WaWV3KHNjcm9sbGVyKSA6IHVuZGVmaW5lZDtcblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgJChzY3JvbGxlcikuc3RvcCh0cnVlLCBmYWxzZSk7XG4gICAgICAgICAgICByZWxlYXNlRGVzY2VuZGFudHM/LigpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCBkZXNjcmlwdG9yXSBvZiBkZXNjcmlwdG9ycykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNjcm9sbGVyLCBrZXkpO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICYmIGN1cnJlbnQudmFsdWUgPT09IGRlc2NyaXB0b3IudmFsdWUgJiYgY3VycmVudC5zZXQgPT09IGRlc2NyaXB0b3Iuc2V0KSBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHNjcm9sbGVyLCBrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGp1bXBUbyhzY3JvbGxlcjogSFRNTEVsZW1lbnQsIHRhcmdldDogRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQsIGNlbnRlciA9IGZhbHNlKSB7XG4gICAgICAgIGxldCB0b3AgPSAwO1xuICAgICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgICAgICBjb25zdCBib3VuZHMgPSBzY3JvbGxlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gYm91bmRzLmhlaWdodCAvIHNjcm9sbGVyLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgIGlmICghc2NhbGUpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIHRvcCA9IHNjcm9sbGVyLnNjcm9sbFRvcCArIChpdGVtLnRvcCAtIGJvdW5kcy50b3ApIC8gc2NhbGUgLSBzY3JvbGxlci5jbGllbnRUb3A7XG4gICAgICAgICAgICBpZiAoY2VudGVyKSB0b3AgLT0gKHNjcm9sbGVyLmNsaWVudEhlaWdodCAtIGl0ZW0uaGVpZ2h0IC8gc2NhbGUpIC8gMjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNjcm9sbEluc3RhbnRseShzY3JvbGxlciwgdG9wKTtcbiAgICB9XG5cbiAgICBzY3JvbGxJbnN0YW50bHkoc2Nyb2xsZXI6IEhUTUxFbGVtZW50LCBwb3NpdGlvbjogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHRvcCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHNjcm9sbGVyLnNjcm9sbEhlaWdodCAtIHNjcm9sbGVyLmNsaWVudEhlaWdodCwgcG9zaXRpb24pKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKHRvcCAtIHNjcm9sbGVyLnNjcm9sbFRvcCkgPj0gMSkge1xuICAgICAgICAgICAgY29uc3Qgc2Nyb2xsVG8gPSBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxUbyBhcyAob3B0aW9uczogU2Nyb2xsVG9PcHRpb25zKSA9PiB2b2lkO1xuICAgICAgICAgICAgc2Nyb2xsVG8uY2FsbChzY3JvbGxlciwgeyB0b3AsIGJlaGF2aW9yOiAnaW5zdGFudCcgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwb3NpdGlvblN3aXRjaChsaXN0OiBIVE1MRWxlbWVudCwgcmlnaHQ6IEhUTUxFbGVtZW50LCBpZDogc3RyaW5nLCBzaG9ydGN1dENhcmQ/OiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLnN3aXRjaFNjcm9sbD8uc3RvcCgpO1xuXG4gICAgICAgIGNvbnN0IGxpc3RUb3AgPSBsaXN0LnNjcm9sbFRvcDtcbiAgICAgICAgY29uc3QgYXRPd25SYW5rID0gcmVhZENvbnRlc3RSYW5rKGlkLCB0aGlzLmRlZmF1bHRzLnJhbmspID09PSAnbWluZSc7XG4gICAgICAgIGNvbnN0IHJlbGVhc2VMaXN0ID0gdGhpcy5zdG9wU3dpdGNoU2Nyb2xsIHx8IHNob3J0Y3V0Q2FyZCA/IHRoaXMubG9ja1Njcm9sbChsaXN0LCB0cnVlKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IG1hbnVhbExpc3QgPSBmYWxzZTtcbiAgICAgICAgbGV0IG1hbnVhbEJvYXJkID0gZmFsc2U7XG4gICAgICAgIGxldCBib2FyZDogSFRNTEVsZW1lbnQgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgICAgICBsZXQgcmVsZWFzZUJvYXJkOiAoKCkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHJlc3RvcmUgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5nZXRMZWFkZXJib2FyZFNjcm9sbGVyKHJpZ2h0LCBpZCk7XG4gICAgICAgICAgICBpZiAobmV4dCAhPT0gYm9hcmQpIHtcbiAgICAgICAgICAgICAgICByZWxlYXNlQm9hcmQ/LigpO1xuICAgICAgICAgICAgICAgIGJvYXJkID0gbmV4dDtcbiAgICAgICAgICAgICAgICByZWxlYXNlQm9hcmQgPSBib2FyZCA/IHRoaXMubG9ja1Njcm9sbChib2FyZCwgdHJ1ZSkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgbWFudWFsQm9hcmQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghbWFudWFsTGlzdCAmJiByZWxlYXNlTGlzdCkge1xuICAgICAgICAgICAgICAgIGlmIChzaG9ydGN1dENhcmQgJiYgbGlzdC5jb250YWlucyhzaG9ydGN1dENhcmQpKSB0aGlzLmp1bXBUbyhsaXN0LCBzaG9ydGN1dENhcmQpO1xuICAgICAgICAgICAgICAgIGVsc2UgdGhpcy5zY3JvbGxJbnN0YW50bHkobGlzdCwgbGlzdFRvcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW1hbnVhbEJvYXJkICYmIGJvYXJkPy5jbGllbnRIZWlnaHQgJiYgdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCkgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5qdW1wVG8oYm9hcmQsIGF0T3duUmFuayA/IHRoaXMuZ2V0T3duUm93KGJvYXJkKSA6IG51bGwsIGF0T3duUmFuayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUsIHNpZ25hbDogaGFuZGxlcnMuc2lnbmFsIH07XG4gICAgICAgIGNvbnN0IHN0b3AgPSAoKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgaGFuZGxlcnMuYWJvcnQoKTtcbiAgICAgICAgICAgIHJlbGVhc2VMaXN0Py4oKTtcbiAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICB0aGlzLnN3aXRjaFNjcm9sbCA9IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dChzdG9wLCA0MDAwKTtcbiAgICAgICAgY29uc3Qgb25TY3JvbGwgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoKHJlbGVhc2VMaXN0ICYmIGV2ZW50LnRhcmdldCA9PT0gbGlzdCkgfHwgZXZlbnQudGFyZ2V0ID09PSBib2FyZCkgcmVzdG9yZSgpO1xuICAgICAgICB9O1xuICAgICAgICAvLyBMZXQgdXNlciBpbnB1dCBtb3ZlIGl0cyBwYW5lIHdpdGhvdXQgYWxsb3dpbmcgYSBkZWxheWVkIGdhbWUgYW5pbWF0aW9uIHRvIHRha2Ugb3Zlci5cbiAgICAgICAgY29uc3Qgb25NYW51YWxJbnB1dCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmICghZXZlbnQuaXNUcnVzdGVkIHx8ICEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkpIHJldHVybjtcbiAgICAgICAgICAgIGlmIChsaXN0LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIG1hbnVhbExpc3QgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGJvYXJkPy5jb250YWlucyhldmVudC50YXJnZXQpICYmIHRoaXMuZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdCwgcmlnaHQpID09PSBpZCkgbWFudWFsQm9hcmQgPSB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgcGFuZS5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgWyd3aGVlbCcsICd0b3VjaG1vdmUnLCAncG9pbnRlcmRvd24nXSkgcGFuZS5hZGRFdmVudExpc3RlbmVyKHR5cGUsIG9uTWFudWFsSW5wdXQsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoWydBcnJvd1VwJywgJ0Fycm93RG93bicsICdQYWdlVXAnLCAnUGFnZURvd24nLCAnSG9tZScsICdFbmQnLCAnICddLmluY2x1ZGVzKGV2ZW50LmtleSkpIG9uTWFudWFsSW5wdXQoZXZlbnQpO1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5zd2l0Y2hTY3JvbGwgPSB7IHJlc3RvcmUsIHN0b3AgfTtcbiAgICAgICAgcmVzdG9yZSgpO1xuICAgIH1cblxuICAgIG9wZW5Db250ZXN0KGxpc3Q6IEhUTUxFbGVtZW50LCByaWdodDogSFRNTEVsZW1lbnQsIHsgaWQsIGNhcmQsIGhlYWRlciwgdGl0bGUgfTogQ29udGVzdENhcmQpIHtcbiAgICAgICAgZm9yIChjb25zdCBwYW5lIG9mIFtsaXN0LCByaWdodF0pIHBhbmUuY2xhc3NMaXN0LmFkZCgnamFydmlzLWNvbnRlc3QtaW5zdGFudCcsICdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgIGNvbnN0IHJhbmsgPSByZWFkQ29udGVzdFJhbmsoaWQsIHRoaXMuZGVmYXVsdHMucmFuayk7XG4gICAgICAgIGNvbnN0IHBsYWNlQXRPd25SYW5rID0gcmFuayA9PT0gJ21pbmUnO1xuICAgICAgICBjb25zdCByZWxlYXNlTGlzdCA9IHRoaXMubG9ja1Njcm9sbChsaXN0KTtcbiAgICAgICAgbGV0IGJvYXJkOiBIVE1MRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCByZWxlYXNlQm9hcmQ6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHBvc2l0aW9uZWQgPSBmYWxzZTtcbiAgICAgICAgbGV0IGxhc3RBdHRlbXB0OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgIGNvbnN0IHVwZGF0ZUJvYXJkID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuZ2V0TGVhZGVyYm9hcmRTY3JvbGxlcihyaWdodCwgaWQpO1xuICAgICAgICAgICAgaWYgKGJvYXJkID09PSBuZXh0KSByZXR1cm47XG4gICAgICAgICAgICByZWxlYXNlQm9hcmQ/LigpO1xuICAgICAgICAgICAgYm9hcmQgPSBuZXh0O1xuICAgICAgICAgICAgcmVsZWFzZUJvYXJkID0gYm9hcmQgPyB0aGlzLmxvY2tTY3JvbGwoYm9hcmQpIDogdW5kZWZpbmVkO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXZlYWwgPSAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkgcGFuZS5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdG9yZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghbGlzdC5pc0Nvbm5lY3RlZCB8fCAhcmlnaHQuaXNDb25uZWN0ZWQgfHwgIWxpc3QuY29udGFpbnMoY2FyZCkpIHJldHVybjtcblxuICAgICAgICAgICAgdXBkYXRlQm9hcmQoKTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCk7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQgIT09IGlkICYmIHNlbGVjdGVkICE9PSBsYXN0QXR0ZW1wdCkge1xuICAgICAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIG51bGwpO1xuICAgICAgICAgICAgICAgICh0aXRsZSB8fCBoZWFkZXIpLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgdXBkYXRlQm9hcmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghYm9hcmQ/LmNsaWVudEhlaWdodCB8fCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSAhPT0gaWQgfHxcbiAgICAgICAgICAgICAgICAocGxhY2VBdE93blJhbmsgJiYgIWJvYXJkLnF1ZXJ5U2VsZWN0b3IoJy5sZWFkVGFibGUnKSkpIHJldHVybjtcbiAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIGlkKTtcbiAgICAgICAgICAgIHRoaXMuanVtcFRvKGxpc3QsIGNhcmQpO1xuICAgICAgICAgICAgdGhpcy5qdW1wVG8oYm9hcmQsIHBsYWNlQXRPd25SYW5rID8gdGhpcy5nZXRPd25Sb3coYm9hcmQpIDogbnVsbCwgcGxhY2VBdE93blJhbmspO1xuICAgICAgICAgICAgaWYgKCFwb3NpdGlvbmVkKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICByZXZlYWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb3JyZWN0IGJyb3dzZXItZHJpdmVuIG1vdmVzLCBzdWNoIGFzIHNjcm9sbEludG9WaWV3IG9uIGEgbGVhZGVyYm9hcmQgcm93LCBiZWZvcmUgcGFpbnQuXG4gICAgICAgIGNvbnN0IG9uU2Nyb2xsID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gbGlzdCB8fCBldmVudC50YXJnZXQgPT09IGJvYXJkKSByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGlucHV0RXZlbnRzID0gWydwb2ludGVyZG93bicsICd0b3VjaHN0YXJ0JywgJ3doZWVsJywgJ2NsaWNrJ107XG4gICAgICAgIGNvbnN0IG9uSW5wdXQgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkKSBzdG9wKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0b3BPbktleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmlzVHJ1c3RlZCAmJiBbJ1RhYicsICdBcnJvd1VwJywgJ0Fycm93RG93bicsICdQYWdlVXAnLCAnUGFnZURvd24nLCAnSG9tZScsICdFbmQnLCAnRW50ZXInLCAnICddLmluY2x1ZGVzKGV2ZW50LmtleSkpIHN0b3AoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgYWZ0ZXJMb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0b3AgPSAoZmluaXNoID0gdHJ1ZSkgPT4ge1xuICAgICAgICAgICAgcmVsZWFzZUxpc3QoKTtcbiAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgICAgIHBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25TY3JvbGwsIHRydWUpO1xuICAgICAgICAgICAgICAgIHBhbmUuY2xhc3NMaXN0LnJlbW92ZSgnamFydmlzLWNvbnRlc3QtaW5zdGFudCcsICdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIGlucHV0RXZlbnRzKSBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBvbklucHV0LCB0cnVlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBzdG9wT25LZXksIHRydWUpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBhZnRlckxvYWQpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgIHRoaXMuc3RvcEp1bXAgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZXBvc2l0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucmVzdG9yaW5nQ2FyZCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoZmluaXNoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldmVhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoc3RvcCwgNDAwMCk7XG4gICAgICAgIHRoaXMuc3RvcEp1bXAgPSBzdG9wO1xuICAgICAgICB0aGlzLnJlcG9zaXRpb24gPSByZXN0b3JlO1xuICAgICAgICB0aGlzLnJlc3RvcmluZ0NhcmQgPSBjYXJkO1xuICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgcGFuZS5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCwgeyBwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgaW5wdXRFdmVudHMpIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uSW5wdXQsIHsgcGFzc2l2ZTogdHJ1ZSwgY2FwdHVyZTogdHJ1ZSB9KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHN0b3BPbktleSwgdHJ1ZSk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFmdGVyTG9hZCwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICByZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEnKTtcbiAgICAgICAgY29uc3QgcmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignI2NvbnRlc3RzIC5yaWdodF9wYXJ0Jyk7XG4gICAgICAgIGlmICh0aGlzLmxpc3QgIT09IGxpc3QgfHwgdGhpcy5yaWdodCAhPT0gcmlnaHQpIHRoaXMuc3dpdGNoU2Nyb2xsPy5zdG9wKCk7XG4gICAgICAgIGlmICh0aGlzLnN0b3BKdW1wICYmICh0aGlzLmxpc3QgIT09IGxpc3QgfHwgdGhpcy5yaWdodCAhPT0gcmlnaHQgfHwgIWxpc3Q/LmNvbnRhaW5zKHRoaXMucmVzdG9yaW5nQ2FyZCkpKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BKdW1wKGZhbHNlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0KSB0aGlzLnNob3dMZWFkZXJib2FyZCh0aGlzLnJpZ2h0LCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxpc3QgPSBsaXN0O1xuICAgICAgICB0aGlzLnJpZ2h0ID0gcmlnaHQ7XG4gICAgICAgIGlmICghbGlzdCB8fCAhcmlnaHQgfHwgIWxpc3QuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggfHwgZ2V0Q29tcHV0ZWRTdHlsZShsaXN0KS52aXNpYmlsaXR5ICE9PSAndmlzaWJsZScpIHJldHVybjtcblxuICAgICAgICBjb25zdCBmaW5pc2hlZCA9IG5ldyBTZXQoT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmZpbmlzaGVkIHx8IHt9KVxuICAgICAgICAgICAgLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbCkubWFwKGNvbnRlc3QgPT4gU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCkpKTtcbiAgICAgICAgZm9yIChjb25zdCBlbmRlZCBvZiBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZXN0LmVuZGVkLCAuY29udGVzdF9oZWFkZXIuZW5kZWQnKSkge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBlbmRlZC5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmIChpZCkgZmluaXNoZWQuYWRkKGlkKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjYXJkcyA9IHRoaXMuZ2V0Q29udGVzdHMobGlzdCwgZmluaXNoZWQpO1xuICAgICAgICBjb25zdCBjb250ZXN0cyA9IGNhcmRzLmZpbHRlcihjYXJkID0+ICFjYXJkLmVuZGVkKTtcbiAgICAgICAgdGhpcy5jbGVhckV4cGlyZWRQaW4obGlzdCwgY29udGVzdHMsIGZpbmlzaGVkKTtcbiAgICAgICAgdGhpcy51cGRhdGVDYXJkQ29udHJvbHMobGlzdCwgY29udGVzdHMpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlcG9zaXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMucmVwb3NpdGlvbigpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhcnR1cFBlbmRpbmcpIHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLmdldFRhcmdldChjb250ZXN0cyk7XG4gICAgICAgICAgICBpZiAoIWNvbnRlc3RzLmxlbmd0aCAmJiAhdGhpcy5wcmVmZXJlbmNlICYmIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdCwgcmlnaHQpO1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IGNhcmRzLmZpbmQoY2FyZCA9PiBjYXJkLmlkID09PSBzZWxlY3RlZCkgPz8gY2FyZHMuYXQoLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhcmdldCkgdGhpcy5vcGVuQ29udGVzdChsaXN0LCByaWdodCwgdGFyZ2V0KTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScgJiYgIXRoaXMucHJlZmVyZW5jZSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIHRoaXMuZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdCwgcmlnaHQpKTtcbiAgICAgICAgICAgIHRoaXMuc3dpdGNoU2Nyb2xsPy5yZXN0b3JlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVTaG9ydGN1dHMobGlzdCwgcmlnaHQsIGNvbnRlc3RzKTtcbiAgICB9XG5cbiAgICBydW4oeyBub1N3aXRjaFNjcm9sbCA9IHRydWUgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGNvbnN0IHBpbiA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdFN0YXJ0SWQnKTtcbiAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gKCh0eXBlb2YgcGluID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgcGluID09PSAnbnVtYmVyJykgJiYgcGluKSA/IFN0cmluZyhwaW4pIDogJyc7XG4gICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0b3BTd2l0Y2hTY3JvbGwgPSBub1N3aXRjaFNjcm9sbDtcbiAgICAgICAgdGhpcy5kZWZhdWx0cyA9IHJlYWRDb250ZXN0RGVmYXVsdHMoKTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IHsgc2lnbmFsIH0gPSB0aGlzLmxpc3RlbmVycztcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKG11dGF0aW9ucyA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlc3RzIC5sZWZ0X3BhcnQgLnNjcm9sbF9hcmVhJyk7XG4gICAgICAgICAgICBjb25zdCByaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZXN0cyAucmlnaHRfcGFydCcpO1xuICAgICAgICAgICAgaWYgKGxpc3QgIT09IHRoaXMubGlzdCB8fCByaWdodCAhPT0gdGhpcy5yaWdodCB8fCBtdXRhdGlvbnMuc29tZSgoeyB0YXJnZXQgfSkgPT5cbiAgICAgICAgICAgICAgICAobGlzdCAmJiAobGlzdC5jb250YWlucyh0YXJnZXQpIHx8IHRhcmdldC5jb250YWlucyhsaXN0KSkpIHx8XG4gICAgICAgICAgICAgICAgKHJpZ2h0ICYmIChyaWdodC5jb250YWlucyh0YXJnZXQpIHx8IHRhcmdldC5jb250YWlucyhyaWdodCkpKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogdHJ1ZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcycsICdzdHlsZScsICdoaWRkZW4nLCAnaWRfY29udGVzdCddIH0pO1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB0aGlzLnJlZnJlc2goKSwgeyBvbmNlOiB0cnVlLCBzaWduYWwgfSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYW52YXMgPSB0aGlzLmxpc3Q/LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMnKTtcbiAgICAgICAgICAgIGNvbnN0IGJhciA9IGNhbnZhcz8ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJzpzY29wZSA+IC5qYXJ2aXMtY29udGVzdC1zaG9ydGN1dHMnKTtcbiAgICAgICAgICAgIGlmIChjYW52YXMgJiYgYmFyKSBwb3NpdGlvbkNvbnRlc3RTaG9ydGN1dHMoY2FudmFzLCBiYXIpO1xuICAgICAgICB9LCB7IHNpZ25hbCB9KTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmICghZXZlbnQuaXNUcnVzdGVkIHx8ICEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkgfHwgIXRoaXMucmlnaHQgfHwgIXRoaXMubGlzdD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVyID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5jb250ZXN0X2hlYWRlcicpO1xuICAgICAgICAgICAgaWYgKCFoZWFkZXIgfHwgZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5qYXJ2aXMtY29udGVzdC1waW4sIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JykpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgaWQgPSBoZWFkZXIuY2xvc2VzdCgnLmNvbnRlc3RbaWRfY29udGVzdF0nKT8uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG4gICAgICAgICAgICB0aGlzLnByZXBhcmVTd2l0Y2godGhpcy5saXN0LCB0aGlzLnJpZ2h0LCBpZCA/PyBudWxsKTtcbiAgICAgICAgfSwgeyBjYXB0dXJlOiB0cnVlLCBzaWduYWwgfSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG5cbiAgICB1cGRhdGVTdWJTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogYm9vbGVhbikge1xuICAgICAgICBpZiAoa2V5ICE9PSAnbm9Td2l0Y2hTY3JvbGwnKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RvcFN3aXRjaFNjcm9sbCA9IHZhbHVlO1xuICAgICAgICBpZiAoIXZhbHVlKSB0aGlzLnN3aXRjaFNjcm9sbD8uc3RvcCgpO1xuICAgIH1cblxuICAgIHRlYXJEb3duKCkge1xuICAgICAgICB0aGlzLm9ic2VydmVyPy5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzPy5hYm9ydCgpO1xuICAgICAgICB0aGlzLnN0b3BKdW1wPy4oKTtcbiAgICAgICAgdGhpcy5zd2l0Y2hTY3JvbGw/LnN0b3AoKTtcbiAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxpc3Q/LmNsb3Nlc3QoJyNjb250ZXN0cycpPy5xdWVyeVNlbGVjdG9yKCc6c2NvcGUgPiAuamFydmlzLWNvbnRlc3Qtc2hvcnRjdXRzJyk/LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLmxpc3Q/LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1waW4sIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JykuZm9yRWFjaChjb250cm9sID0+IGNvbnRyb2wucmVtb3ZlKCkpO1xuICAgICAgICBpZiAodGhpcy5yaWdodCkgdGhpcy5zaG93TGVhZGVyYm9hcmQodGhpcy5yaWdodCwgbnVsbCk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLmhhc1J1biA9IGZhbHNlO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBMZWFndWVUb3AyMCBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdsZWFndWVUb3AyMCdcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQcm9tb3Rpb24gdGFyZ2V0XCIsIFwiU2hvdyB0aGUgcG9pbnRzIG5lZWRlZCB0byByZWFjaCB0aGUgbGFyZ2VyIG9mIHRoZSB0b3AgMjAgb3IgdG9wIDE1JSBiZWxvdyB0aGUgaGlnaGVzdCBsZWFndWUgdGllci5cIilcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWVzLmh0bWwnKTtcbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcuc2NyaXB0TGVhZ3VlSW5mbycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2NyaXB0TGVhZ3VlSW5mbycpO1xuICAgICAgICAgICAgaWYgKCFzdW1tYXJ5IHx8IHN1bW1hcnkucXVlcnlTZWxlY3RvcignLmphcnZpc1RvcDIwJykpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgeyBvcHBvbmVudHNfbGlzdCwgY3VycmVudF90aWVyX251bWJlciwgbWF4X2xlYWd1ZSB9ID0gd2luZG93O1xuICAgICAgICAgICAgY29uc3QgdGllciA9IE51bWJlcihjdXJyZW50X3RpZXJfbnVtYmVyKTtcbiAgICAgICAgICAgIGlmICghKHRpZXIgPiAwICYmIHRpZXIgPCBOdW1iZXIobWF4X2xlYWd1ZSkpKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBoZXJvSWQgPSAod2luZG93LnNoYXJlZD8uSGVybyB8fCB3aW5kb3cuSGVybyk/LmluZm9zPy5pZDtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShvcHBvbmVudHNfbGlzdCkgfHwgaGVyb0lkID09IG51bGwpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgcGxheWVyID0gb3Bwb25lbnRzX2xpc3QuZmluZCgoeyBwbGF5ZXIgfSkgPT4gU3RyaW5nKHBsYXllcj8uaWRfZmlnaHRlcikgPT09IFN0cmluZyhoZXJvSWQpKTtcbiAgICAgICAgICAgIGNvbnN0IHJhbmsgPSBOdW1iZXIocGxheWVyPy5wbGFjZSk7XG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc0ludGVnZXIocmFuaykgfHwgcmFuayA8IDEpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgYnJhY2tldFNpemUgPSBvcHBvbmVudHNfbGlzdC5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBwcm9tb3Rpb25SYW5rID0gTWF0aC5tYXgoMjAsIE1hdGguY2VpbChicmFja2V0U2l6ZSAqIDE1IC8gMTAwKSk7XG4gICAgICAgICAgICBjb25zdCBpblByb21vdGlvbiA9IHJhbmsgPD0gcHJvbW90aW9uUmFuaztcbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmlzb25SYW5rID0gaW5Qcm9tb3Rpb24gPyBwcm9tb3Rpb25SYW5rICsgMSA6IHByb21vdGlvblJhbms7XG4gICAgICAgICAgICBjb25zdCBjdXRvZmYgPSBvcHBvbmVudHNfbGlzdC5maW5kKCh7IHBsYWNlIH0pID0+IE51bWJlcihwbGFjZSkgPT09IGNvbXBhcmlzb25SYW5rKTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXI/LnBsYXllcl9sZWFndWVfcG9pbnRzID09IG51bGwgfHwgY3V0b2ZmPy5wbGF5ZXJfbGVhZ3VlX3BvaW50cyA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHNjb3JlID0gTnVtYmVyKHBsYXllci5wbGF5ZXJfbGVhZ3VlX3BvaW50cyk7XG4gICAgICAgICAgICBjb25zdCBjdXRvZmZTY29yZSA9IE51bWJlcihjdXRvZmYucGxheWVyX2xlYWd1ZV9wb2ludHMpO1xuICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoc2NvcmUpIHx8ICFOdW1iZXIuaXNGaW5pdGUoY3V0b2ZmU2NvcmUpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGZvcm1hdCA9IG5ldyBJbnRsLk51bWJlckZvcm1hdCgpO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gaW5Qcm9tb3Rpb24gPyBjdXRvZmZTY29yZSA6IGN1dG9mZlNjb3JlICsgMTtcbiAgICAgICAgICAgIGNvbnN0IGRpZmZlcmVuY2UgPSBpblByb21vdGlvbiA/IHNjb3JlIC0gdGFyZ2V0IDogdGFyZ2V0IC0gc2NvcmU7XG4gICAgICAgICAgICBjb25zdCBydWxlID0gYFRvcCAke3Byb21vdGlvblJhbmt9IGlzIHRoZSBwcm9tb3Rpb24gdGFyZ2V0LiBUaGUgY3V0b2ZmIGlzIHRoZSBsYXJnZXIgb2YgMjAgcGxhY2VzIG9yIDE1JSBvZiAke2Zvcm1hdC5mb3JtYXQoYnJhY2tldFNpemUpfSBwbGF5ZXJzLCByb3VuZGVkIHVwLmA7XG4gICAgICAgICAgICBjb25zdCBjb21wYXJpc29uID0gaW5Qcm9tb3Rpb25cbiAgICAgICAgICAgICAgICA/IGBSYW5rICR7Y29tcGFyaXNvblJhbmt9IGhhcyAke2Zvcm1hdC5mb3JtYXQodGFyZ2V0KX0gcG9pbnRzLiBZb3VyIGxlYWQgaXMgJHtmb3JtYXQuZm9ybWF0KGRpZmZlcmVuY2UpfSBwb2ludHMuYFxuICAgICAgICAgICAgICAgIDogYFlvdSBuZWVkICR7Zm9ybWF0LmZvcm1hdCh0YXJnZXQpfSBwb2ludHMgdG8gcGFzcyByYW5rICR7Y29tcGFyaXNvblJhbmt9LmA7XG4gICAgICAgICAgICBjb25zdCB0b29sdGlwID0gYCR7cnVsZX0gJHtjb21wYXJpc29ufWA7XG5cbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgZW50cnkuY2xhc3NOYW1lID0gJ2phcnZpc1RvcDIwJztcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCB0b29sdGlwKTtcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgndG9vbHRpcCcsICcnKTtcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHRvb2x0aXApO1xuXG4gICAgICAgICAgICBjb25zdCBiYWRnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIGJhZGdlLmNsYXNzTmFtZSA9ICdzY3JpcHRMZWFndWVJbmZvSWNvbic7XG4gICAgICAgICAgICBiYWRnZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIzM3NjliYSc7XG4gICAgICAgICAgICBiYWRnZS5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICAgICAgICAgIGJhZGdlLnRleHRDb250ZW50ID0gU3RyaW5nKHByb21vdGlvblJhbmspO1xuICAgICAgICAgICAgZW50cnkuYXBwZW5kKGJhZGdlLCBgJHtkaWZmZXJlbmNlID09PSAwID8gJycgOiBpblByb21vdGlvbiA/ICctJyA6ICcrJ30ke2Zvcm1hdC5mb3JtYXQoTWF0aC5hYnMoZGlmZmVyZW5jZSkpfWApO1xuICAgICAgICAgICAgc3VtbWFyeS5pbnNlcnRCZWZvcmUoZW50cnksIHN1bW1hcnkucXVlcnlTZWxlY3RvcignLm1pblRvcDMwLCAucHJvbW90aW9uSW5mbycpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBSZW1vdmVQYXNzTG9jayBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNlbGVjdG9yVG9GaW5kID0gJy5sb2NrX3llbGxvd19pY24nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgY2xhc3NUb1JlbW92ZSA9ICdsb2NrX3llbGxvd19pY24nO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAncmVtb3ZlUGFzc0xvY2snXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlBhc3MgbG9jayBpY29uc1wiLCBcIkhpZGUgbG9jayBpY29ucyBvbiByZXdhcmQgcGFzc2VzIHNvIHRoZSByZXdhcmRzIGFyZSBlYXNpZXIgdG8gcmVhZC5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdwb3YnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlBhdGggb2YgVmFsb3JcIiwgXCJIaWRlIGxvY2sgaWNvbnMgb24gdGhlIFBhdGggb2YgVmFsb3IgcGFzc2VzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAncG9nJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQYXRoIG9mIEdsb3J5XCIsIFwiSGlkZSBsb2NrIGljb25zIG9uIHRoZSBQYXRoIG9mIEdsb3J5IHBhc3Nlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLXZhbG9yLmh0bWwnKSB8fCBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtZ2xvcnkuaHRtbCcpXG4gICAgfVxuXG4gICAgb2JzZXJ2ZVVudGlsKHNlbGVjdG9yOiBzdHJpbmcsIGNhbGxiYWNrOiAoZWxlbWVudHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4pID0+IHZvaWQsIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH0gPSB7fSkge1xuICAgICAgICBsZXQgdGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgICAgICBsZXQgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FsbGJhY2soZWxlbWVudHMpO1xuICAgICAgICAgICAgaWYgKG9uY2UpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAob25jZSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lcikgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZWxlbWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuXG4gICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodGltZW91dCkgJiYgdGltZW91dCA+IDApIHtcbiAgICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3Rvcjogc3RyaW5nLCBjbGFzc1RvUmVtb3ZlOiBzdHJpbmcsIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH0gPSB7fSkge1xuICAgICAgICB0aGlzLm9ic2VydmVVbnRpbChzZWxlY3RvciwgKGVsZW1lbnRzKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGVsID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NUb1JlbW92ZSkpO1xuICAgICAgICB9LCB7IHRpbWVvdXQsIG9uY2UgfSk7XG4gICAgfVxuXG4gICAgcnVuKHsgcG92LCBwb2cgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtdmFsb3IuaHRtbCcpICYmIHBvdikge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZSh0aGlzLnNlbGVjdG9yVG9GaW5kLCB0aGlzLmNsYXNzVG9SZW1vdmUpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi1nbG9yeS5odG1sJykgJiYgcG9nKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKHRoaXMuc2VsZWN0b3JUb0ZpbmQsIHRoaXMuY2xhc3NUb1JlbW92ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEdpcmxEaWN0aW9uYXJ5KCkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmdldEdpcmxEaWN0aW9uYXJ5KCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBsb2FkIHRoZSBISCsrIGdpcmwgZGljdGlvbmFyeTonLCBlcnIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGdldEdpcmxEaWN0aW9uYXJ5IH0gZnJvbSAnLi9nYW1lRGF0YSc7XG5cbmV4cG9ydCBjbGFzcyBMb3ZlUmFpZHNBZGRvbiBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJhcml0eUNvbG9yczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xvdmVSYWlkc0FkZG9uJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMb3ZlIFJhaWRzIGRpc3BsYXlcIiwgXCJDdXN0b21pemUgbmFtZXMsIGljb25zLCBhbmQgcG9zZXMgb24gTG92ZSBSYWlkIGNhcmRzLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ3JhaWRfaWQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlJhaWQgSURzXCIsIFwiQWRkIHRoZSByYWlkIElEIGJlZm9yZSBpdHMgbmFtZS5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICduYW1lcycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiSGlkZGVuIGdpcmwgbmFtZXNcIiwgXCJTaG93IHRoZSBuYW1lIG9uIGNhcmRzIHRoYXQgdXNlIGEgbXlzdGVyaW91cyBnaXJsIGxhYmVsLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnc2tpbicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiU2tpbiBpbmRpY2F0b3JcIiwgXCJNYXJrIGNhcmRzIHRoYXQgaW5jbHVkZSBhIGdpcmwgd2l0aCBhIHNraW4uXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdjb2xvcicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUmFyaXR5IGNvbG9yc1wiLCBcIkNvbG9yIHRoZSByYWlkIG5hbWUgYmFzZWQgb24gdGhlIGdpcmzigJlzIHJhcml0eS5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2ZpZ2h0X2ljb24nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkZpZ2h0IGljb25cIiwgXCJVc2UgdGhlIGNsZWFyZXIgZmlnaHQtZW5lcmd5IGljb24uXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdzaGFkb3dzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJVbnNoYWRvd2VkIHBvc2VzXCIsIFwiU2hvdyB0aGUgbm9ybWFsIGFydHdvcmsgaW4gcGxhY2Ugb2Ygc2hhZG93IHBvc2VzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcblxuICAgICAgICB0aGlzLnJhcml0eUNvbG9ycyA9IHtcbiAgICAgICAgICAgIHJhcmU6ICdMaW1lR3JlZW4nLFxuICAgICAgICAgICAgZXBpYzogJ0dvbGQnLFxuICAgICAgICAgICAgbGVnZW5kYXJ5OiAnTWVkaXVtT3JjaGlkJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbG92ZS1yYWlkcy5odG1sJylcbiAgICB9XG5cbiAgICBhc3luYyBydW4oeyByYWlkX2lkLCBza2luLCBuYW1lcywgY29sb3IsIGZpZ2h0X2ljb24sIHNoYWRvd3MgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGNvbnN0IHJhaWRzID0gKHR5cGVvZiBsb3ZlX3JhaWRzICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KGxvdmVfcmFpZHMpKSA/IGxvdmVfcmFpZHMgOiBbXTtcbiAgICAgICAgaWYgKCFyYWlkcy5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG5cbiAgICAgICAgY29uc3QgZ2lybERpY3QgPSBhd2FpdCBnZXRHaXJsRGljdGlvbmFyeSgpO1xuICAgICAgICBjb25zdCByYWlkc0J5SWQgPSBuZXcgTWFwKHJhaWRzLm1hcChyYWlkID0+IFtTdHJpbmcocmFpZC5pZF9yYWlkKSwgcmFpZF0pKTtcblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucmFpZC1jYXJkW2lkX3JhaWRdJykuZm9yRWFjaChyYWlkQ2FyZCA9PiB7XG4gICAgICAgICAgICBjb25zdCByYWlkID0gcmFpZHNCeUlkLmdldChyYWlkQ2FyZC5nZXRBdHRyaWJ1dGUoJ2lkX3JhaWQnKSA/PyAnJyk7XG4gICAgICAgICAgICBpZiAoIXJhaWQgfHwgcmFpZC5pZF9naXJsID09IG51bGwpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgeyBuYW1lLCByYXJpdHksIHNoYXJkcyA9IDAgfSA9IGdpcmxEaWN0Py5nZXQoU3RyaW5nKHJhaWQuaWRfZ2lybCkpIHx8IHt9O1xuICAgICAgICAgICAgY29uc3QgaGFyZW1MaW5rID0gd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5nZXRIcmVmKGAvY2hhcmFjdGVycy8ke3JhaWQuaWRfZ2lybH1gKTtcbiAgICAgICAgICAgIGNvbnN0IHJhaWROYW1lRWxlbSA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3IoJy5yYWlkLW5hbWUgPiBzcGFuID4gc3BhbicpO1xuICAgICAgICAgICAgY29uc3QgbmFtZV9sYWJlbCA9IChuYW1lcyAmJiBuYW1lKSB8fCByYWlkTmFtZUVsZW0/LnRleHRDb250ZW50Py50cmltKCkgfHwgcmFpZC5ldmVudF9uYW1lIHx8IHJhaWQuZ2lybF9kYXRhPy5uYW1lIHx8ICcnO1xuICAgICAgICAgICAgY29uc3QgcmFpZF9pZF9sYWJlbCA9IHJhaWRfaWQgPyBgKCR7cmFpZC5pZF9yYWlkfSlgIDogJyc7XG4gICAgICAgICAgICBjb25zdCBza2luX2xhYmVsID0gKHNraW4gJiYgQXJyYXkuaXNBcnJheShyYWlkPy5naXJsX2RhdGE/LmdyYWRlX3NraW5zKSAmJiByYWlkLmdpcmxfZGF0YS5ncmFkZV9za2lucy5sZW5ndGggPiAwKSA/ICfwn5GZJyA6ICcnO1xuXG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5UGFydHMgPSBbXTtcbiAgICAgICAgICAgIGlmIChyYWlkX2lkKSBkaXNwbGF5UGFydHMucHVzaChyYWlkX2lkX2xhYmVsKTtcbiAgICAgICAgICAgIGRpc3BsYXlQYXJ0cy5wdXNoKG5hbWVfbGFiZWwpO1xuICAgICAgICAgICAgaWYgKHNraW4pIGRpc3BsYXlQYXJ0cy5wdXNoKHNraW5fbGFiZWwpO1xuICAgICAgICAgICAgY29uc3QgZGlzcGxheUxhYmVsID0gZGlzcGxheVBhcnRzLmpvaW4oJyAnKS50cmltKCk7XG5cbiAgICAgICAgICAgIGlmIChyYWlkTmFtZUVsZW0gJiYgZGlzcGxheUxhYmVsKSB7XG4gICAgICAgICAgICAgICAgcmFpZE5hbWVFbGVtLnRleHRDb250ZW50ID0gZGlzcGxheUxhYmVsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBvYmplY3RpdmVzID0gcmFpZENhcmQucXVlcnlTZWxlY3RvckFsbCgnLmNsYXNzaWMtZ2lybCcpO1xuICAgICAgICAgICAgY29uc3QgZ2lybCA9IG9iamVjdGl2ZXNbMF07XG4gICAgICAgICAgICBpZiAoZ2lybCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdpcmxOYW1lRWxlbSA9IGdpcmwucXVlcnlTZWxlY3RvcignLmdpcmwtbmFtZScpO1xuICAgICAgICAgICAgICAgIGlmIChnaXJsTmFtZUVsZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmsgPSBnaXJsTmFtZUVsZW0ucXVlcnlTZWxlY3RvcignYScpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWxpbmspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rLmNsYXNzTmFtZSA9ICdoaC1naXJsLWxpbmsnO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGdpcmxOYW1lRWxlbS5maXJzdENoaWxkKSBsaW5rLmFwcGVuZENoaWxkKGdpcmxOYW1lRWxlbS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdpcmxOYW1lRWxlbS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZGlzcGxheUxhYmVsKSBsaW5rLnRleHRDb250ZW50ID0gZGlzcGxheUxhYmVsO1xuICAgICAgICAgICAgICAgICAgICBsaW5rLmhyZWYgPSBoYXJlbUxpbms7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHNoYXJkcyA9PT0gMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9iakVsZW0gPSBnaXJsLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcub2JqZWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmpFbGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpFbGVtLmlubmVyVGV4dCA9IGBJJ20gYWxyZWFkeSBhdHRyYWN0ZWQgdG8geW91LiBGaW5kIG1lIGluIHlvdXIgSGFyZW0hYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvbG9yICYmIHJhcml0eSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhaWROYW1lQ29udGFpbmVyID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5yYWlkLW5hbWUnKTtcbiAgICAgICAgICAgICAgICBpZiAocmFpZE5hbWVDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFpZE5hbWVDb250YWluZXIuc3R5bGUuY29sb3IgPSB0aGlzLnJhcml0eUNvbG9yc1tyYXJpdHldIHx8ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZpZ2h0X2ljb24pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWdodEljb24gPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmh1ZEJhdHRsZVB0c19taXhfaWNuJyk7XG4gICAgICAgICAgICAgICAgaWYgKGZpZ2h0SWNvbikge1xuICAgICAgICAgICAgICAgICAgICBmaWdodEljb24uc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybCgvaW1hZ2VzL3BpY3R1cmVzL2Rlc2lnbi9pY19lbmVyZ3lfZmlnaHQucG5nKSc7XG4gICAgICAgICAgICAgICAgICAgIGZpZ2h0SWNvbi5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9ICcyNHB4JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzaGFkb3dzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGVmdEltYWdlID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MSW1hZ2VFbGVtZW50PignLmdpcmwtaW1nLmxlZnQnKTtcbiAgICAgICAgICAgICAgICBpZiAobGVmdEltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlZnRJbWFnZS5zcmMgPSBsZWZ0SW1hZ2Uuc3JjLnJlcGxhY2UoJy1ibGFjaycsICcnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJhaWRDYXJkLmNsYXNzTGlzdC5jb250YWlucygnbXVsdGlwbGUtZ2lybCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0SW1hZ2UgPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxJbWFnZUVsZW1lbnQ+KCcuZ2lybC1pbWcucmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJpZ2h0SW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJpZ2h0SW1hZ2Uuc3JjID0gcmlnaHRJbWFnZS5zcmMucmVwbGFjZSgnYXZiMC5wbmcnLCAnZ3JhZGVfc2tpbnMvZ3JhZGVfc2tpbjEucG5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodEltYWdlLnNyYyA9IHJpZ2h0SW1hZ2Uuc3JjLnJlcGxhY2UoJy1ibGFjaycsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yQWxsKCcuZXllJykuZm9yRWFjaChlID0+IGUucmVtb3ZlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHR5cGUgeyBHaXJsRGF0YSwgTG92ZVJhaWQgfSBmcm9tICcuLi8uLi9nYW1lLXR5cGVzJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCwgbHNSbSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgZ2V0R2lybERpY3Rpb25hcnkgfSBmcm9tICcuL2dhbWVEYXRhJztcblxudHlwZSBSYWlkQ29weUJ1dHRvbiA9IEhUTUxEaXZFbGVtZW50ICYgeyBfYm91bmRDb3B5S2V5SGFuZGxlcj86IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gdm9pZCB9O1xuXG5leHBvcnQgY2xhc3MgTG92ZVJhaWRzUGFyc2VyIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgZ2lybERpY3Q6IFJlYWRvbmx5TWFwPHN0cmluZywgR2lybERhdGE+IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBfYm91bmRJbnNlcnRCdXR0b24/OiAoKSA9PiB2b2lkO1xuXG4gICAgLypcbiAgICAqIFJhaWQgSUQsIEFubm91bmNlbWVudCBUeXBlLCBCYWNrZ3JvdW5kIElELCBFdmVudCBOYW1lLCBTdGFydCBEYXRldGltZSxcbiAgICAqIEVuZCBEYXRldGltZSwgRHVyYXRpb24sIFJhaWQgU3RhdHVzLCBTb3VyY2UsIEdpcmwgSUQsXG4gICAgKiBHaXJsIE5hbWUsIFJhcml0eSwgTWF4IEdyYWRlLCBGaXJzdCBBcHBlYXJhbmNlLCBTb3VyY2UgSUQsXG4gICAgKiBIYXMgU2tpbihzKVxuICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnbG92ZVJhaWRzUGFyc2VyJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMb3ZlIFJhaWRzIGV4cG9ydFwiLCBcIkFkZCBhIGJ1dHRvbiB0byBjb3B5IG5ldyByYWlkcyBpbiBhIHNwcmVhZHNoZWV0LXJlYWR5IGZvcm1hdC5cIilcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sb3ZlLXJhaWRzLmh0bWwnKVxuICAgIH1cblxuICAgIGNhcGl0YWxpemVGaXJzdChzdHI6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyID8gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpIDogc3RyO1xuICAgIH1cblxuICAgIGdldEFubm91bmNlbWVudFR5cGUodHlwZTogTG92ZVJhaWRbJ2lkX2Fubm91bmNlbWVudF90eXBlJ10pIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiBcIkZ1bGxcIjtcbiAgICAgICAgICAgIGNhc2UgMjogcmV0dXJuIFwiUGFydGlhbFwiO1xuICAgICAgICAgICAgY2FzZSAzOiByZXR1cm4gXCJOb25lXCI7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gXCJVbmtub3duXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTb3VyY2VJRChldmVudDogTG92ZVJhaWQpIHtcbiAgICAgICAgY29uc3Qgc291cmNlX2lkID0gTnVtYmVyKGV2ZW50LnJhaWRfbW9kdWxlX3BrKTtcbiAgICAgICAgc3dpdGNoIChldmVudC5yYWlkX21vZHVsZV90eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzZWFzb24nOiByZXR1cm4gMDtcbiAgICAgICAgICAgIGNhc2UgJ2NoYW1waW9uJzogcmV0dXJuIE51bWJlci5pc0Zpbml0ZShzb3VyY2VfaWQpID8gc291cmNlX2lkIDogLTI7XG4gICAgICAgICAgICBjYXNlICd0cm9sbCc6IHJldHVybiBOdW1iZXIuaXNGaW5pdGUoc291cmNlX2lkKSA/IHNvdXJjZV9pZCArIDEwIDogLTI7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnaXJsSGFzU2tpbnMoZXZlbnQ6IExvdmVSYWlkKSB7XG4gICAgICAgIGNvbnN0IGhhc1NraW5zID0gQXJyYXkuaXNBcnJheShldmVudD8uZ2lybF9kYXRhPy5ncmFkZV9za2lucykgJiYgZXZlbnQuZ2lybF9kYXRhLmdyYWRlX3NraW5zLmxlbmd0aCA+IDA7XG4gICAgICAgIGlmIChoYXNTa2lucykge1xuICAgICAgICAgICAgcmV0dXJuIFwiWFwiO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIFwiT1wiO1xuICAgIH1cblxuICAgIGZvcm1hdEV2ZW50Um93KGV2ZW50OiBMb3ZlUmFpZCkge1xuICAgICAgICBjb25zdCBkdXJhdGlvbkhvdXJzID0gTWF0aC5mbG9vcihOdW1iZXIoZXZlbnQuZXZlbnRfZHVyYXRpb25fc2Vjb25kcykgLyAzNjAwKTtcbiAgICAgICAgY29uc3QgZHVyYXRpb24gPSBgJHtkdXJhdGlvbkhvdXJzfSBob3Vyc2A7XG5cbiAgICAgICAgY29uc3QgZ2lybCA9IHRoaXMuZ2lybERpY3Q/LmdldChTdHJpbmcoZXZlbnQuaWRfZ2lybCkpIHx8IHt9O1xuICAgICAgICBjb25zdCB7IG5hbWUgPSAnVW5rbm93bicsIHJhcml0eSA9ICdOL0EnLCBncmFkZSA9IDAgfSA9IGdpcmw7XG5cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGV2ZW50LmlkX3JhaWQsXG4gICAgICAgICAgICB0aGlzLmdldEFubm91bmNlbWVudFR5cGUoZXZlbnQuaWRfYW5ub3VuY2VtZW50X3R5cGUpLFxuICAgICAgICAgICAgZXZlbnQuYmFja2dyb3VuZF9pZCxcbiAgICAgICAgICAgIGV2ZW50LmV2ZW50X25hbWUsXG4gICAgICAgICAgICBldmVudC5zdGFydF9kYXRldGltZSxcbiAgICAgICAgICAgIGV2ZW50LmVuZF9kYXRldGltZSxcbiAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgZXZlbnQuc3RhdHVzLFxuICAgICAgICAgICAgZXZlbnQucmFpZF9tb2R1bGVfdHlwZSxcbiAgICAgICAgICAgIGV2ZW50LmlkX2dpcmwsXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgdGhpcy5jYXBpdGFsaXplRmlyc3QocmFyaXR5KSxcbiAgICAgICAgICAgIGdyYWRlLFxuICAgICAgICAgICAgXCJcIiwgLy8gb25lIGJsYW5rIHRhYiByZXNlcnZlZCBmb3IgZmlyc3QgYXBwZWFyYW5jZSBpbiBHU2hlZXRzXG4gICAgICAgICAgICB0aGlzLmdldFNvdXJjZUlEKGV2ZW50KSxcbiAgICAgICAgICAgIHRoaXMuZ2lybEhhc1NraW5zKGV2ZW50KVxuICAgICAgICBdLmpvaW4oXCJcXHRcIik7XG4gICAgfVxuXG4gICAgYXN5bmMgY29weVRvQ2xpcGJvYXJkKHRleHQ6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NsaXBib2FyZCBBUEkgZmFpbGVkLCB1c2luZyBleGVjQ29tbWFuZCBmYWxsYmFjazonLCBlcnIpO1xuICAgICAgICAgICAgY29uc3QgdGV4dGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xuICAgICAgICAgICAgdGV4dGFyZWEudmFsdWUgPSB0ZXh0O1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG4gICAgICAgICAgICB0ZXh0YXJlYS5zZWxlY3QoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRleHRhcmVhLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgaGFuZGxlQ29weUNsaWNrKGV2dDogTW91c2VFdmVudCkge1xuICAgICAgICBjb25zdCBzdG9yYWdlS2V5ID0gJ0xhc3RTYXZlZFJhaWRJRCc7XG5cbiAgICAgICAgLy8gU2hpZnQgKyBDdHJsICsgQ2xpY2sg4oaSIGNsZWFyIHN0b3JlZCBJRFxuICAgICAgICBpZiAoZXZ0LnNoaWZ0S2V5ICYmIGV2dC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBjb25zdCBjb25maXJtQ2xlYXIgPSBjb25maXJtKCfimqDvuI8gRG8geW91IHdhbnQgdG8gY2xlYXIgdGhlIHNhdmVkIGxhc3QgcmFpZCBJRCBmb3IgdGhpcyBzaXRlPycpO1xuICAgICAgICAgICAgaWYgKGNvbmZpcm1DbGVhcikge1xuICAgICAgICAgICAgICAgIGxzUm0oc3RvcmFnZUtleSk7XG4gICAgICAgICAgICAgICAgYWxlcnQoJ+KchSBMYXN0IHNhdmVkIElEIGNsZWFyZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb2FkIHJhaWRzXG4gICAgICAgIGNvbnN0IGxvY2FsTG92ZVJhaWRzID0gKHR5cGVvZiBsb3ZlX3JhaWRzICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KGxvdmVfcmFpZHMpKSA/IGxvdmVfcmFpZHMgOiBbXTtcbiAgICAgICAgaWYgKCFsb2NhbExvdmVSYWlkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfimqDvuI8gTm8gbG92ZV9yYWlkcyBmb3VuZCBvbiB0aGlzIHBhZ2UuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZ2lybERpY3QpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfimqDvuI8gVGhlIEhIKysgZ2lybCBkaWN0aW9uYXJ5IGNvdWxkIG5vdCBiZSBsb2FkZWQuIFJlbG9hZCB0aGUgcGFnZSBhbmQgdHJ5IGFnYWluLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxhc3RTYXZlZElkTnVtYmVyID0gcGFyc2VJbnQoU3RyaW5nKGxzR2V0KHN0b3JhZ2VLZXkpKSwgMTApO1xuXG4gICAgICAgIC8vIElmIFNoaWZ0IGlzIGhlbGQgT1Igbm8gc2F2ZWQgSUQgZXhpc3RzIOKGkiBhc2sgYWdhaW5cbiAgICAgICAgaWYgKGlzTmFOKGxhc3RTYXZlZElkTnVtYmVyKSB8fCBldnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RTYXZlZElkID0gcHJvbXB0KCdQbGVhc2UgZW50ZXIgdGhlIGxhc3Qgc2F2ZWQgSUQ6Jyk7XG4gICAgICAgICAgICBsYXN0U2F2ZWRJZE51bWJlciA9IHBhcnNlSW50KFN0cmluZyhsYXN0U2F2ZWRJZCksIDEwKTtcblxuICAgICAgICAgICAgaWYgKGlzTmFOKGxhc3RTYXZlZElkTnVtYmVyKSkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCfinYwgSW52YWxpZCBJRCBlbnRlcmVkLiBQbGVhc2UgZW50ZXIgYSB2YWxpZCBudW1iZXIuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlsdGVyIG5ldyBldmVudHNcbiAgICAgICAgY29uc3QgZmlsdGVyZWREYXRhID0gbG9jYWxMb3ZlUmFpZHMuZmlsdGVyKGV2ZW50ID0+IE51bWJlcihldmVudC5pZF9yYWlkKSA+IGxhc3RTYXZlZElkTnVtYmVyKTtcbiAgICAgICAgaWYgKCFmaWx0ZXJlZERhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbGVydChg4oS577iPIE5vIG5ldyBldmVudHMgZm91bmQgd2l0aCBJRCBncmVhdGVyIHRoYW4gJHtsYXN0U2F2ZWRJZE51bWJlcn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZERhdGEgPSBmaWx0ZXJlZERhdGEubWFwKHRoaXMuZm9ybWF0RXZlbnRSb3cuYmluZCh0aGlzKSkuam9pbihcIlxcblwiKTtcblxuICAgICAgICBpZiAoIWF3YWl0IHRoaXMuY29weVRvQ2xpcGJvYXJkKGZvcm1hdHRlZERhdGEpKSB7XG4gICAgICAgICAgICBhbGVydCgn4p2MIENvdWxkIG5vdCBjb3B5IHRoZSByYWlkcy4gVGhlIGxhc3Qgc2F2ZWQgSUQgd2FzIGtlcHQuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTYXZlIGhpZ2hlc3QgSURcbiAgICAgICAgY29uc3QgbWF4SWQgPSBNYXRoLm1heCguLi5maWx0ZXJlZERhdGEubWFwKGUgPT4gTnVtYmVyKGUuaWRfcmFpZCkpKTtcbiAgICAgICAgbHNTZXQoc3RvcmFnZUtleSwgbWF4SWQpO1xuXG4gICAgICAgIGFsZXJ0KCfinIUgRGF0YSBjb3BpZWQgdG8gY2xpcGJvYXJkISBZb3UgY2FuIG5vdyBwYXN0ZSBpdCBpbnRvIEdTaGVldHMuJyk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ29weUJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uOiBSYWlkQ29weUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgncmVtaW5kZXItY29weScpO1xuICAgICAgICBidXR0b24uc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxODBkZWcsICMwMGFhZmYgMCwgIzAwNjY4OCA1MCUsICMwMDU1NzcgNTElLCAjMDBhYWZmIDEwMCUpO1xuICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgd2lkdGg6IDMycHg7XG4gICAgICAgICAgICBoZWlnaHQ6IDMycHg7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogMTBweDtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgIHJpZ2h0OiA0LjVyZW07XG4gICAgICAgICAgICB0b3A6IDAuMnJlbTtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMThweDtcbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAzMnB4O1xuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAwLjJzIGVhc2U7XG4gICAgICAgIGA7XG4gICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5OLJztcbiAgICAgICAgbGV0IGJ1dHRvblRpdGxlID0gJ0NsaWNrID0gY29weSBuZXcgcmFpZHMuIFNoaWZ0IC8gU2hpZnQgKyBDdHJsIGF2YWlsYWJsZS4nO1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCd0b29sdGlwJywgJycpO1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcblxuICAgICAgICBjb25zdCBfYm91bmRDb3B5S2V5SGFuZGxlciA9IChlOiBLZXlib2FyZEV2ZW50KSA9PiB0aGlzLnVwZGF0ZUNvcHlCdXR0b24oZSwgYnV0dG9uKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBfYm91bmRDb3B5S2V5SGFuZGxlcik7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIF9ib3VuZENvcHlLZXlIYW5kbGVyKTtcbiAgICAgICAgLy8gc3RvcmUgaGFuZGxlciByZWZlcmVuY2Ugc28gY2FsbGVycyBjYW4gcmVtb3ZlIGxpc3RlbmVycyBpZiBidXR0b24gaXMgcmVtb3ZlZCBsYXRlclxuICAgICAgICBidXR0b24uX2JvdW5kQ29weUtleUhhbmRsZXIgPSBfYm91bmRDb3B5S2V5SGFuZGxlcjtcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoZSkgPT4gdGhpcy5oYW5kbGVDb3B5Q2xpY2soZSk7XG4gICAgICAgIHRoaXMudXBkYXRlQ29weUJ1dHRvbih7IHNoaWZ0S2V5OiBmYWxzZSwgY3RybEtleTogZmFsc2UgfSwgYnV0dG9uKTtcbiAgICAgICAgcmV0dXJuIGJ1dHRvbjtcbiAgICB9XG5cbiAgICB1cGRhdGVDb3B5QnV0dG9uKGU6IFBpY2s8S2V5Ym9hcmRFdmVudCwgJ3NoaWZ0S2V5JyB8ICdjdHJsS2V5Jz4sIGJ1dHRvbjogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgbGV0IGJ1dHRvblRpdGxlID0gJyc7XG4gICAgICAgIGlmIChlLnNoaWZ0S2V5ICYmIGUuY3RybEtleSkge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmZjY2NjYgMCwgI2FhMDAwMCAxMDAlKVwiOyAvLyByZWRcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5eR77iPJztcbiAgICAgICAgICAgIGJ1dHRvblRpdGxlID0gJ1NoaWZ0ICsgQ3RybCArIENsaWNrID0gY2xlYXIgc2F2ZWQgSUQnO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmZmRkNjYgMCwgI2NjOTkwMCAxMDAlKVwiOyAvLyB5ZWxsb3dcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfinI/vuI8nO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnU2hpZnQgKyBDbGljayA9IHByb21wdCBmb3IgSUQuJztcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICMwMGFhZmYgMCwgIzAwNjY4OCA1MCUsICMwMDU1NzcgNTElLCAjMDBhYWZmIDEwMCUpXCI7IC8vIGRlZmF1bHQgYmx1ZVxuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ/Cfk4snO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnQ2xpY2sgPSBjb3B5IG5ldyByYWlkcy4gU2hpZnQgLyBTaGlmdCArIEN0cmwgYXZhaWxhYmxlLic7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluc2VydEJ1dHRvbigpIHtcbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbi1ub3RpZmljYXRpb24tYWN0aW9uLm5vdGlmX2J1dHRvbl9zJyk7XG4gICAgICAgIGlmIChub3RpZmljYXRpb25CdXR0b24gJiYgIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW1pbmRlci1jb3B5JykpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvcHlCdXR0b24gPSB0aGlzLmNyZWF0ZUNvcHlCdXR0b24oKTtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbkJ1dHRvbi5wYXJlbnROb2RlPy5pbnNlcnRCZWZvcmUoY29weUJ1dHRvbiwgbm90aWZpY2F0aW9uQnV0dG9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgICAgICB0aGlzLmdpcmxEaWN0ID0gYXdhaXQgZ2V0R2lybERpY3Rpb25hcnkoKTtcblxuICAgICAgICB0aGlzLl9ib3VuZEluc2VydEJ1dHRvbiA9IHRoaXMuaW5zZXJ0QnV0dG9uLmJpbmQodGhpcyk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB0aGlzLmluc2VydEJ1dHRvbigpO1xuICAgICAgICBlbHNlIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcy5fYm91bmRJbnNlcnRCdXR0b24sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuZXhwb3J0IGNsYXNzIEFjdGl2aXR5UGFyc2VyIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2FjdGl2aXR5UGFyc2VyJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJNaXNzaW9uIGNvcGllclwiLCBcIkVuYWJsZSB0aGUgY29weSB0b29sIGZvciBsZWdlbmRhcnkgbWlzc2lvbiBkZXRhaWxzLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ21pc3Npb25Db3BpZXInLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkxlZ2VuZGFyeSBkZXRhaWxzXCIsIFwiQ2xpY2sgYSBsZWdlbmRhcnkgbWlzc2lvbuKAmXMgdGl0bGUsIGRlc2NyaXB0aW9uLCBvciBpbWFnZSB0byBjb3B5IGl0LlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9hY3Rpdml0aWVzLmh0bWwnKVxuICAgIH1cblxuICAgIGFzeW5jIGNvcHlUb0NsaXBib2FyZCh0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgIGNvbnN0IHRvYXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvYXN0LnRleHRDb250ZW50ID0gJ0NvcGllZCEnO1xuICAgICAgICB0b2FzdC5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmJvdHRvbSA9ICcxMHB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUucmlnaHQgPSAnMTBweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmJhY2tncm91bmQgPSAncmdiYSgwLDAsMCwwLjcpJztcbiAgICAgICAgdG9hc3Quc3R5bGUuY29sb3IgPSAnd2hpdGUnO1xuICAgICAgICB0b2FzdC5zdHlsZS5wYWRkaW5nID0gJzVweCAxMHB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUuYm9yZGVyUmFkaXVzID0gJzVweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnpJbmRleCA9ICc5OTk5JztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0b2FzdCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdG9hc3QucmVtb3ZlKCksIDEwMDApO1xuICAgIH1cblxuICAgIHJ1bih7IG1pc3Npb25Db3BpZXIgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGlmIChtaXNzaW9uQ29waWVyKSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1pc3Npb25fZW50cnkubGVnZW5kYXJ5Jyk7XG4gICAgICAgICAgICBpZiAoIWVudHJpZXMubGVuZ3RoKSByZXR1cm47XG5cbiAgICAgICAgICAgIGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW1nRGl2ID0gZW50cnkucXVlcnlTZWxlY3RvcjxIVE1MSW1hZ2VFbGVtZW50PignLm1pc3Npb25faW1hZ2UgaW1nJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGVBbGwgPSBlbnRyeS5xdWVyeVNlbGVjdG9yPEhUTUxIZWFkaW5nRWxlbWVudD4oJy5taXNzaW9uX2RldGFpbHMgaDEnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkZXNjID0gZW50cnkucXVlcnlTZWxlY3RvcjxIVE1MUGFyYWdyYXBoRWxlbWVudD4oJy5taXNzaW9uX2RldGFpbHMgcCcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGltZ0Rpdikge1xuICAgICAgICAgICAgICAgICAgICBpbWdEaXYuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICBpbWdEaXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZChpbWdEaXYuc3JjKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlQWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlQWxsLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3V0ZXJUaXRsZSA9IHRpdGxlQWxsLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcuZXZlbnQtbWlzc2lvbi1jb250ZW50LXRleHQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dGVyVGl0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyVGl0bGUuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJUaXRsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQoKG91dGVyVGl0bGUudGV4dENvbnRlbnQgPz8gJycpLnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlQWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ICYmIGUudGFyZ2V0LmNsb3Nlc3QoJy5ldmVudC1taXNzaW9uLWNvbnRlbnQtdGV4dCcpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUNsb25lID0gdGl0bGVBbGwuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxIZWFkaW5nRWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlQ2xvbmUucXVlcnlTZWxlY3RvcignLmV2ZW50LW1pc3Npb24tY29udGVudC10ZXh0Jyk/LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSAodGl0bGVDbG9uZS50ZXh0Q29udGVudCA/PyAnJykudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQodGl0bGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICAgICAgICBkZXNjLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgZGVzYy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKGRlc2MuaW5uZXJUZXh0LnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsICJbe1widmVyc2lvblwiOlwiMC43LjZcIixcImNoYW5nZXNcIjpbXCJDaG9vc2UgVG9wIG9yIE15IHJhbmsgb24gYW55IGFjdGl2ZSBjb250ZXN0LiBKYXJ2aXMgcmVtZW1iZXJzIGVhY2ggY29udGVzdOKAmXMgY2hvaWNlIHdoZW4gc3dpdGNoaW5nIGFuZCBhcHBsaWVzIHRoZSBzYW1lIHBvc2l0aW9uIGFuZCBzY3JvbGwgcnVsZXMgdG8gZmluaXNoZWQgY29udGVzdHMuXCIsXCJLZWVwIGdhbWUgc2Nyb2xsIGFuaW1hdGlvbnMgZnJvbSByZXN0YXJ0aW5nIHdoaWxlIHlvdSBzY3JvbGwgYnkgaGFuZCBkdXJpbmcgYSBjb250ZXN0IHN3aXRjaC5cIixcIlNlZSBhIHNtYWxsIGFyYy1yZWFjdG9yIGljb24gYmVzaWRlIEhIKysgd2hlbiBhIHNpbGVudCB1cGRhdGUgbm90aWNlIGlzIGF2YWlsYWJsZS5cIl19LHtcInZlcnNpb25cIjpcIjAuNy41XCIsXCJjaGFuZ2VzXCI6W1wiS2VlcCB0aGUgaG9tZXBhZ2UgcmVzcG9uc2l2ZSBhZnRlciBjbG9zaW5nIHRoZSBjaGFuZ2Vsb2cgYW5kIGNob29zZSBTaWxlbnQgY2hhbmdlbG9nIGZyb20gdGhlIHBvcHVwLlwiLFwiU3RvcCBhdXRvbWF0aWMgc2lkZWJhciBzY3JvbGxpbmcgb24gY29udGVzdCBzd2l0Y2hlcyBieSBkZWZhdWx0IGFuZCB1c2UgVG9wIG9yIE15IHJhbmsgd2hlbmV2ZXIgeW91IHN3aXRjaC5cIixcIkJyaW5nIHRoZSBzZWxlY3RlZCBjYXJkIGludG8gdmlldyB3aGVuIHlvdSB1c2UgYSBjb250ZXN0IHNob3J0Y3V0LlwiXX0se1widmVyc2lvblwiOlwiMC43LjRcIixcImNoYW5nZXNcIjpbXCJTZWUgeW91ciByYW5rIGluIGVhY2ggYWN0aXZlIGNvbnRlc3QgYmVzaWRlIHRoZSBjbG9zZSBidXR0b24gYW5kIHN3aXRjaCBsZWFkZXJib2FyZHMgd2l0aG91dCBtb3ZpbmcgdGhlIGNvbnRlc3QgbGlzdC5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4zXCIsXCJjaGFuZ2VzXCI6W1wiU2VlIGF1dG9tYXRpYyBjaGFuZ2Vsb2dzIG9ubHkgd2hlbiBsb2FkaW5nIHRoZSBob21lcGFnZSBhZnRlciBhbiB1cGRhdGUuXCIsXCJFbmFibGUgU2lsZW50IGNoYW5nZWxvZyB0byBnZXQgYSBOZXcgYnV0dG9uIGJlc2lkZSBISCsrIGFuZCBvcGVuIHRoZSBub3RlcyB3aGVuIHlvdeKAmXJlIHJlYWR5LlwiLFwiS2VlcCB0aGUgY29udGVzdCBsaXN0IGFuZCBlYWNoIGxlYWRlcmJvYXJkIGluIHBsYWNlIHdoZW4gc3dpdGNoaW5nIGNvbnRlc3RzIHdpdGggU3RvcCBzY3JvbGxpbmcgb24gY29udGVzdCBzd2l0Y2hlcy5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4yXCIsXCJjaGFuZ2VzXCI6W1wiT3BlbiB0aGUgYm90dG9tIGFjdGl2ZSBjb250ZXN0IGF0IHlvdXIgcmFuayBieSBkZWZhdWx0LiBDaG9vc2UgQ2JDLCBDQ0MsIG9yIExDIHRvIHByZWZlciB0aGF0IGV2ZW50IHdoZW4gYXZhaWxhYmxlLlwiLFwiVHVybiBvZmYgYXV0b21hdGljIHVwZGF0ZSBub3RpY2VzIHdpdGggRG9u4oCZdCBzaG93IGFnYWluIGluIHRoZSBjaGFuZ2Vsb2cgcG9wdXAuIFZpZXcgY2hhbmdlbG9nIHN0YXlzIGF2YWlsYWJsZSBpbiBzZXR0aW5ncy5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4xXCIsXCJjaGFuZ2VzXCI6W1wiS2VlcCB0aGUgY2hhbmdlbG9nIGNlbnRlcmVkIHdoZW4gdGhlIGdhbWUgd2luZG93IGlzIHJlc2l6ZWQuXCIsXCJDbGVhbiB1cCBzYXZlZCBwbGF5ZXIgbmFtZXMsIGV4cGxhaW4gdW5rbm93biBuYW1lcyBvbiBob3ZlciwgYW5kIGdpdmUgUmVtb3ZlIGJ1dHRvbnMgbW9yZSByb29tLlwiXX0se1widmVyc2lvblwiOlwiMC43LjBcIixcImNoYW5nZXNcIjpbXCJTZWUgd2hhdCBjaGFuZ2VkIGluIEphcnZpcyB0aGUgZmlyc3QgdGltZSBhIG5ldyB2ZXJzaW9uIHJ1bnMuXCIsXCJPcGVuIFZpZXcgY2hhbmdlbG9nIGZyb20gSEgrKyBzZXR0aW5ncyBhdCBhbnkgdGltZSwgZXZlbiB3aXRoIGF1dG9tYXRpYyBub3RpY2VzIHR1cm5lZCBvZmYuXCIsXCJFeHBhbmQgRWFybGllciB2ZXJzaW9ucyB0byByZWFkIHBhc3QgdXBkYXRlcy5cIl19LHtcInZlcnNpb25cIjpcIjAuNi43XCIsXCJjaGFuZ2VzXCI6W1wiTWFrZSBtYXJraW5nIG9uZSBhY3Rpb24gcGVyIHBsYXllciwgYmFja2ZpbGwgbmFtZXMgZm9yIG9sZGVyIG1hcmtzLCB1c2UgdGhlIGJyYWNrZXQtYmFzZWQgcHJvbW90aW9uIHRhcmdldCwgYW5kIHNpbXBsaWZ5IHRoZSBzZWxlY3RlZCBjb250ZXN0IGJ1dHRvbnMgYW5kIHZlcnNpb24gYmFkZ2UuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuNlwiLFwiY2hhbmdlc1wiOltcIkFkZCBzZXR0aW5nIGhlbHAgaW4gSEgrKywgaW1wcm92ZSBtYXJrIGNvbnRyYXN0IGFuZCBtYW5hZ2VtZW50LCBhbmQgYWRkIGF1dG9tYXRpYyBjb250ZXN0IGRlZmF1bHRzLlwiLFwiUmVuYW1lIHRoZSBzZXBhcmF0ZWx5IGluc3RhbGxlZCB0ZXN0aW5nIHVzZXJzY3JpcHQgdG8gRGV2LlwiXX0se1widmVyc2lvblwiOlwiMC42LjVcIixcImNoYW5nZXNcIjpbXCJNb3ZlIHRoZSB1c2Vyc2NyaXB0IHNvdXJjZSBpbnRvIFR5cGVTY3JpcHQgbW9kdWxlcyBhbmQgYWRkIHNlcGFyYXRlIHN0YWJsZSBhbmQgdGVzdGluZyBidWlsZHMuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuNFwiLFwiY2hhbmdlc1wiOltcIlByZXZlbnQgcGlubmVkIGNvbnRlc3Qgc3RhcnR1cCBzY3JvbGxpbmcsIGtlZXAgbmF0aXZlIHN0YXJ0dXAgd2l0aG91dCBhIHBpbiwgYW5kIGNsZWFyIGZpbmlzaGVkIHBpbnNcIl19LHtcInZlcnNpb25cIjpcIjAuNi4zXCIsXCJjaGFuZ2VzXCI6W1wiU3RvcCBib3RoIGNvbnRlc3Qgc3RhcnR1cCBzY3JvbGxzLCBpc29sYXRlIHRoZSBzZWxlY3RlZCBsZWFkZXJib2FyZCwgYW5kIHJlc3RvcmUgcGlubmVkIGNvbnRlc3RzIGF0IFRvcCBvciBNeSByYW5rXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuMlwiLFwiY2hhbmdlc1wiOltcIlBpbiBjb250ZXN0cyBvbiB0aGVpciBjYXJkcywgaGlkZSB0aGUgc3RhcnR1cCBzY3JvbGwsIGFuZCB1c2UgcmlnaHQtY2xpY2sgbWFya2luZyB3aXRoIGlzb2xhdGVkIHNldHRpbmdzIHNjcm9sbGluZ1wiXX0se1widmVyc2lvblwiOlwiMC42LjFcIixcImNoYW5nZXNcIjpbXCJSZWFkIG5hdGl2ZSBNYW5nYSBSUEcgY29udGVzdCB0aXRsZXMgYW5kIHJlY29nbml6ZSBhY3RpdmUgY2FyZHMgd2hlbiBjb250ZXN0IGRhdGEgaXMgdW5hdmFpbGFibGVcIl19LHtcInZlcnNpb25cIjpcIjAuNi4wXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIGEgY29udGVzdCBzdGFydCBwcmVmZXJlbmNlLCBjb250aW51b3VzIG1hcmtpbmcsIGFuZCBjb21wYWN0IHNldHRpbmdzIHdpdGggYSB2ZXJzaW9uIGxhYmVsXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjUuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBsZWFndWUgYW5kIGNvbnRlc3QgcGxheWVyIG1hcmtpbmcgd2l0aCBjdXN0b20gY29sb3JzLCBjb21wYWN0IHNldHRpbmdzLCBhbmQgbGltaXQgVG9wIDIwIHRvIHByb21vdGFibGUgbGVhZ3Vlc1wiXX0se1widmVyc2lvblwiOlwiMC40LjJcIixcImNoYW5nZXNcIjpbXCJGaXggbW9kdWxlIHN0YXJ0dXAsIGxlYWd1ZSBjb250cm9scywgYW5kIHJhaWQgZXhwb3J0czsgYWRkIHRoZSBUb3AgMjAgbGVhZ3VlIHRhcmdldFwiXX0se1widmVyc2lvblwiOlwiMC40LjFcIixcImNoYW5nZXNcIjpbXCJGaXggTG92ZSBSYWlkcyBzaGFkb3dzIHJlcGxhY2VtZW50XCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjQuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBBY3Rpdml0eVBhcnNlciBtb2R1bGVcIl19LHtcInZlcnNpb25cIjpcIjAuMy4xXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIGhhcmVtIGxpbmsgaW5zaWRlIGxvdmUgcmFpZCBjYXJkc1wiXX0se1widmVyc2lvblwiOlwiMC4zLjBcIixcImNoYW5nZXNcIjpbXCJBZGQgTG92ZVJhaWRzQWRkb24gYW5kIExvdmVSYWlkc1BhcnNlciBtb2R1bGVzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjIuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBSZW1vdmVQYXNzTG9jayBtb2R1bGVcIl19LHtcInZlcnNpb25cIjpcIjAuMS4zXCIsXCJjaGFuZ2VzXCI6W1wiQmV0dGVyIGNvZGUgcHJhY3RpY2VzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjEuMlwiLFwiY2hhbmdlc1wiOltcIlBvbGlzaGluZyBhbmQgdXBkYXRlIGxpbmtzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjEuMVwiLFwiY2hhbmdlc1wiOltcIkFkZCBGcmllbmRBbmRGb2VzIG1vZHVsZVwiXX0se1widmVyc2lvblwiOlwiMC4wLjFcIixcImNoYW5nZXNcIjpbXCJJbml0aWFsIHJlbGVhc2VcIl19XSIsICJpbnRlcmZhY2UgQ2hhbmdlbG9nVmlldyB7XG4gICAgY29udGVudDogSFRNTEVsZW1lbnQ7XG4gICAgY2xvc2VCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xuICAgIHNob3VsZE9wZW46ICgpID0+IGJvb2xlYW47XG4gICAgb25PcGVuOiAoKSA9PiB2b2lkO1xuICAgIG9uQ2xvc2U6ICgpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93Q2hhbmdlbG9nUG9wdXAodmlldzogQ2hhbmdlbG9nVmlldykge1xuICAgIGlmICghdmlldy5zaG91bGRPcGVuKCkpIHtcbiAgICAgICAgdmlldy5vbkNsb3NlKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaWFsb2cnKTtcbiAgICBkaWFsb2cuY2xhc3NOYW1lID0gJ2phcnZpcy1jaGFuZ2Vsb2ctcG9wdXAnO1xuICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsICdqYXJ2aXMtY2hhbmdlbG9nLXRpdGxlJyk7XG4gICAgZGlhbG9nLmFwcGVuZENoaWxkKHZpZXcuY29udGVudCk7XG5cbiAgICAvLyBMZXQgdGhlIGJyb3dzZXIgb3duIHRoZSBtb2RhbCBzdGF0ZSBhbmQgcmVzdG9yZSBwYWdlIGlucHV0IHdoZW4gaXQgY2xvc2VzLlxuICAgIGNvbnN0IGRpc21pc3MgPSAoKSA9PiBkaWFsb2cuY2xvc2UoKTtcbiAgICB2aWV3LmNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZGlzbWlzcyk7XG4gICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbmNlbCcsIGV2ZW50ID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZGlzbWlzcygpO1xuICAgIH0pO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCAhPT0gZGlhbG9nKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IGRpYWxvZy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaWYgKGV2ZW50LmNsaWVudFggPCBib3VuZHMubGVmdCB8fCBldmVudC5jbGllbnRYID4gYm91bmRzLnJpZ2h0IHx8XG4gICAgICAgICAgICBldmVudC5jbGllbnRZIDwgYm91bmRzLnRvcCB8fCBldmVudC5jbGllbnRZID4gYm91bmRzLmJvdHRvbSkgZGlzbWlzcygpO1xuICAgIH0pO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgZGlhbG9nLnJlbW92ZSgpO1xuICAgICAgICB2aWV3Lm9uQ2xvc2UoKTtcbiAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgdHJ5IHtcbiAgICAgICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBkaWFsb2cucmVtb3ZlKCk7XG4gICAgICAgIHZpZXcub25DbG9zZSgpO1xuICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgb3BlbiB0aGUgY2hhbmdlbG9nOicsIGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmlldy5jbG9zZUJ1dHRvbi5mb2N1cyh7IHByZXZlbnRTY3JvbGw6IHRydWUgfSk7XG4gICAgdmlldy5vbk9wZW4oKTtcbn1cbiIsICJpbXBvcnQgcmVsZWFzZU5vdGVzIGZyb20gJy4uLy4uLy4uL0NIQU5HRUxPRy5tZCc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgSEhNb2R1bGUsIHR5cGUgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBsc0dldCwgbHNTZXQgfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcbmltcG9ydCB7IHNob3dDaGFuZ2Vsb2dQb3B1cCB9IGZyb20gJy4vY2hhbmdlbG9nUG9wdXAnO1xuXG5jb25zdCBzZWVuS2V5ID0gYENoYW5nZWxvZ1NlZW4ke1VTRVJTQ1JJUFRfQ0hBTk5FTH1gO1xuY29uc3QgbGF0ZXN0VmVyc2lvbiA9IHJlbGVhc2VOb3Rlc1swXS52ZXJzaW9uO1xuY29uc3QgY29uZmlnS2V5ID0gJ0pBUlZJU19jaGFuZ2Vsb2cnO1xuY29uc3Qgc2lsZW50S2V5ID0gYCR7Y29uZmlnS2V5fV9zaWxlbnRgO1xuY29uc3Qgc2V0dGluZ3NDYXJkID0gYC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmNvbmZpZy1zZXR0aW5nW3JlbD1cIiR7Y29uZmlnS2V5fVwiXWA7XG5cbmZ1bmN0aW9uIHJlYWRTZWVuVmVyc2lvbigpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzZWVuID0gbHNHZXQoc2VlbktleSk7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygc2VlbiA9PT0gJ3N0cmluZycgJiYgL15cXGQrXFwuXFxkK1xcLlxcZCskLy50ZXN0KHNlZW4pID8gc2VlbiA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNOZXdlcih2ZXJzaW9uOiBzdHJpbmcsIHByZXZpb3VzOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgaWYgKCFwcmV2aW91cykgcmV0dXJuIHRydWU7XG5cbiAgICBjb25zdCBvbGRQYXJ0cyA9IHByZXZpb3VzLnNwbGl0KCcuJykubWFwKE51bWJlcik7XG4gICAgY29uc3QgbmV3UGFydHMgPSB2ZXJzaW9uLnNwbGl0KCcuJykubWFwKE51bWJlcik7XG4gICAgZm9yIChjb25zdCBbaW5kZXgsIHBhcnRdIG9mIG5ld1BhcnRzLmVudHJpZXMoKSkge1xuICAgICAgICBpZiAocGFydCAhPT0gb2xkUGFydHNbaW5kZXhdKSByZXR1cm4gcGFydCA+IG9sZFBhcnRzW2luZGV4XTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiByZWxlYXNlU2VjdGlvbihyZWxlYXNlOiB0eXBlb2YgcmVsZWFzZU5vdGVzW251bWJlcl0pIHtcbiAgICBjb25zdCBzZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpO1xuICAgIGNvbnN0IGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSBgdiR7cmVsZWFzZS52ZXJzaW9ufWA7XG4gICAgY29uc3QgY2hhbmdlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgcmVsZWFzZS5jaGFuZ2VzKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICBpdGVtLnRleHRDb250ZW50ID0gY2hhbmdlO1xuICAgICAgICBjaGFuZ2VzLmFwcGVuZENoaWxkKGl0ZW0pO1xuICAgIH1cbiAgICBzZWN0aW9uLmFwcGVuZChoZWFkaW5nLCBjaGFuZ2VzKTtcbiAgICByZXR1cm4gc2VjdGlvbjtcbn1cblxuZXhwb3J0IGNsYXNzIENoYW5nZWxvZyBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHBlbmRpbmc6ICdhdXRvbWF0aWMnIHwgJ21hbnVhbCcgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIG9wZW5lcjogSFRNTEJ1dHRvbkVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHZpZXdlZFRoaXNQYWdlID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBsb2FkTGlzdGVuZXI6IEFib3J0Q29udHJvbGxlciB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc2V0dGluZ3NJbnN0YWxsZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIHNpbGVudCA9IGZhbHNlO1xuICAgIHByaXZhdGUgbm90aWNlOiBIVE1MQnV0dG9uRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgd2FpdGluZ0Zvck5vdGljZUFuY2hvciA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnY2hhbmdlbG9nJztcbiAgICAgICAgc3VwZXIoeyBuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWE6IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoJ1VwZGF0ZSBub3RpY2VzJywgJ1Nob3cgdGhlIGNoYW5nZWxvZyB0aGUgZmlyc3QgdGltZSB5b3UgbG9hZCB0aGUgaG9tZXBhZ2UgYWZ0ZXIgYW4gdXBkYXRlLiBVc2UgVmlldyBjaGFuZ2Vsb2cgdG8gb3BlbiBpdCB3aGVuZXZlciB5b3UgbGlrZS4nKSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdzaWxlbnQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscCgnU2lsZW50IGNoYW5nZWxvZycsICdTaG93IGEgc21hbGwgYXJjLXJlYWN0b3IgaWNvbiBiZXNpZGUgSEgrKyBvbiB0aGUgaG9tZXBhZ2UgYWZ0ZXIgYW4gdXBkYXRlLiBDbGljayBpdCB0byByZWFkIHRoZSBjaGFuZ2Vsb2cuJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH0gfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UgPT09ICcvaG9tZS5odG1sJztcbiAgICB9XG5cbiAgICBpbnN0YWxsU2V0dGluZ3MoKSB7XG4gICAgICAgIGlmICghdGhpcy5zaG91bGRSdW4oKSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnNldHRpbmdzSW5zdGFsbGVkID0gdHJ1ZTtcblxuICAgICAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNldHRpbmdzQ2FyZCwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2V0dGluZ3NDYXJkKTtcbiAgICAgICAgICAgIGlmICghY2FyZCB8fCBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXMtdmlldy1jaGFuZ2Vsb2cnKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbiBqYXJ2aXMtdmlldy1jaGFuZ2Vsb2cnO1xuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ1ZpZXcgY2hhbmdlbG9nJztcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMub3BlbignbWFudWFsJywgYnV0dG9uKSk7XG4gICAgICAgICAgICBjYXJkLmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJ1bih7IHNpbGVudCA9IGZhbHNlIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWU7XG4gICAgICAgIHRoaXMuc2lsZW50ID0gc2lsZW50O1xuICAgICAgICAvLyBISCsrIGNhbiBydW4gdGhlIG1vZHVsZSBhZ2FpbiB3aGVuIHRoZSB1c2VyIHR1cm5zIG5vdGljZXMgb24gaW4gdGhlIHNldHRpbmdzIHBhbmUuXG4gICAgICAgIGNvbnN0IGFsbG93QXV0b21hdGljID0gIXRoaXMuc2V0dGluZ3NJbnN0YWxsZWQ7XG5cbiAgICAgICAgY29uc3QgY2hlY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaGFzVW5yZWFkVXBkYXRlKCkpIHJldHVybjtcbiAgICAgICAgICAgIGlmICh0aGlzLnNpbGVudCkgdGhpcy5zaG93Tm90aWNlKCk7XG4gICAgICAgICAgICBlbHNlIGlmIChhbGxvd0F1dG9tYXRpYykgdGhpcy5vcGVuKCdhdXRvbWF0aWMnKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIGNoZWNrKCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2FkTGlzdGVuZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGNoZWNrLCB7IG9uY2U6IHRydWUsIHNpZ25hbDogdGhpcy5sb2FkTGlzdGVuZXIuc2lnbmFsIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGVhckRvd24oKSB7XG4gICAgICAgIHRoaXMubG9hZExpc3RlbmVyPy5hYm9ydCgpO1xuICAgICAgICB0aGlzLmhhc1J1biA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlbW92ZU5vdGljZSgpO1xuICAgIH1cblxuICAgIHVwZGF0ZVN1YlNldHRpbmcoa2V5OiBzdHJpbmcsIHZhbHVlOiBib29sZWFuKSB7XG4gICAgICAgIGlmIChrZXkgIT09ICdzaWxlbnQnKSByZXR1cm47XG4gICAgICAgIHRoaXMuc2lsZW50ID0gdmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSkgdGhpcy5zaG93Tm90aWNlKCk7XG4gICAgICAgIGVsc2UgdGhpcy5yZW1vdmVOb3RpY2UoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhhc1VucmVhZFVwZGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzUnVuICYmICF0aGlzLnZpZXdlZFRoaXNQYWdlICYmIGlzTmV3ZXIobGF0ZXN0VmVyc2lvbiwgcmVhZFNlZW5WZXJzaW9uKCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2hvd05vdGljZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNpbGVudCB8fCAhdGhpcy5oYXNVbnJlYWRVcGRhdGUoKSB8fCB0aGlzLm5vdGljZSB8fCB0aGlzLndhaXRpbmdGb3JOb3RpY2VBbmNob3IpIHJldHVybjtcblxuICAgICAgICBjb25zdCBzZWxlY3RvciA9ICcuaGgtcGx1cy1wbHVzLWNvbmZpZy1idXR0b24nO1xuICAgICAgICB0aGlzLndhaXRpbmdGb3JOb3RpY2VBbmNob3IgPSB0cnVlO1xuICAgICAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLndhaXRpbmdGb3JOb3RpY2VBbmNob3IgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IGFuY2hvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKCFhbmNob3IgfHwgIXRoaXMuc2lsZW50IHx8ICF0aGlzLmhhc1VucmVhZFVwZGF0ZSgpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnamFydmlzLWNoYW5nZWxvZy1ub3RpY2UnO1xuICAgICAgICAgICAgYnV0dG9uLmRhdGFzZXQudG9vbHRpcCA9ICdKYXJ2aXMgd2FzIHVwZGF0ZWQnO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdKYXJ2aXMgd2FzIHVwZGF0ZWQuIFZpZXcgY2hhbmdlbG9nLicpO1xuICAgICAgICAgICAgYnV0dG9uLmlubmVySFRNTCA9IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuMzVcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPlxuICAgICAgICAgICAgICAgIDxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiMTBcIi8+XG4gICAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCI3LjRcIiBzdHJva2UtZGFzaGFycmF5PVwiMyAxLjY1XCIvPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTIgNy42bDQuNCA3LjZINy42WlwiLz5cbiAgICAgICAgICAgIDwvc3ZnPmA7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuKCdtYW51YWwnLCBidXR0b24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm5vdGljZSA9IGFuY2hvci5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbW92ZU5vdGljZSgpIHtcbiAgICAgICAgdGhpcy5ub3RpY2U/LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLm5vdGljZSA9IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzYXZlTm90aWNlU2V0dGluZyhrZXk6IHR5cGVvZiBjb25maWdLZXkgfCB0eXBlb2Ygc2lsZW50S2V5LCB2YWx1ZTogYm9vbGVhbikge1xuICAgICAgICBjb25zdCBjb25maWcgPSB3aW5kb3cuaGhQbHVzUGx1c0NvbmZpZztcbiAgICAgICAgaWYgKCFjb25maWcpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBsZXQgcHJldmlvdXMgPSBjb25maWcuY29uZmlnW2tleV07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25maWcubG9hZENvbmZpZygpO1xuICAgICAgICAgICAgcHJldmlvdXMgPSBjb25maWcuY29uZmlnW2tleV07XG4gICAgICAgICAgICBjb25maWcuY29uZmlnW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIGNvbmZpZy5zYXZlQ29uZmlnKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uZmlnLmNvbmZpZ1trZXldID0gcHJldmlvdXM7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB0aGUgdXBkYXRlIG5vdGljZSBwcmVmZXJlbmNlOicsIGVycik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBISCsrIGNyZWF0ZXMgaXRzIHNldHRpbmdzIHBhbmUgbGF6aWx5LCBzbyB0aGUgcG9wdXAgY2FuIGNsb3NlIGJlZm9yZSB0aGUgcGFuZSBleGlzdHMuXG4gICAgICAgIGNvbnN0IGNoZWNrYm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihgJHtzZXR0aW5nc0NhcmR9IGlucHV0W25hbWU9XCIke2tleX1cIl1gKTtcbiAgICAgICAgaWYgKGNoZWNrYm94KSBjaGVja2JveC5jaGVja2VkID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGlzYWJsZU5vdGljZXMoKSB7XG4gICAgICAgIGlmICghdGhpcy5zYXZlTm90aWNlU2V0dGluZyhjb25maWdLZXksIGZhbHNlKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNldHRpbmdzQ2FyZCk7XG4gICAgICAgIGNhcmQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2VuYWJsZWQnKTtcbiAgICAgICAgY29uc3Qgc2lsZW50ID0gY2FyZD8ucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihgaW5wdXRbbmFtZT1cIiR7c2lsZW50S2V5fVwiXWApO1xuICAgICAgICBpZiAoc2lsZW50KSBzaWxlbnQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnRlYXJEb3duKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvcGVuKG1vZGU6ICdhdXRvbWF0aWMnIHwgJ21hbnVhbCcsIG9wZW5lcjogSFRNTEJ1dHRvbkVsZW1lbnQgfCBudWxsID0gbnVsbCkge1xuICAgICAgICBpZiAoIXRoaXMuc2hvdWxkUnVuKCkpIHJldHVybjtcbiAgICAgICAgaWYgKG1vZGUgPT09ICdtYW51YWwnKSB0aGlzLm9wZW5lciA9IG9wZW5lcjtcbiAgICAgICAgaWYgKHRoaXMucGVuZGluZykge1xuICAgICAgICAgICAgaWYgKG1vZGUgPT09ICdtYW51YWwnKSB0aGlzLnBlbmRpbmcgPSBtb2RlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGVuZGluZyA9IG1vZGU7XG5cbiAgICAgICAgY29uc3QgcHJldmlvdXMgPSByZWFkU2VlblZlcnNpb24oKTtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBjb250ZW50LmNsYXNzTmFtZSA9ICdjb250YWluZXItc3BlY2lhbC1iZyBqYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQnO1xuICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgICAgIHRpdGxlLmlkID0gJ2phcnZpcy1jaGFuZ2Vsb2ctdGl0bGUnO1xuICAgICAgICB0aXRsZS50ZXh0Q29udGVudCA9ICdKYXJ2aXMgY2hhbmdlbG9nJztcbiAgICAgICAgY29uc3Qgbm90ZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbm90ZXMuY2xhc3NOYW1lID0gJ2phcnZpcy1jaGFuZ2Vsb2ctbm90ZXMnO1xuICAgICAgICBjb25zdCBuZXdSZWxlYXNlcyA9IHByZXZpb3VzICYmIGlzTmV3ZXIobGF0ZXN0VmVyc2lvbiwgcHJldmlvdXMpXG4gICAgICAgICAgICA/IHJlbGVhc2VOb3Rlcy5maWx0ZXIocmVsZWFzZSA9PiBpc05ld2VyKHJlbGVhc2UudmVyc2lvbiwgcHJldmlvdXMpKS5sZW5ndGhcbiAgICAgICAgICAgIDogMTtcbiAgICAgICAgbm90ZXMuYXBwZW5kKC4uLnJlbGVhc2VOb3Rlcy5zbGljZSgwLCBuZXdSZWxlYXNlcykubWFwKHJlbGVhc2VTZWN0aW9uKSk7XG4gICAgICAgIGNvbnN0IGVhcmxpZXIgPSByZWxlYXNlTm90ZXMuc2xpY2UobmV3UmVsZWFzZXMpO1xuICAgICAgICBpZiAoZWFybGllci5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IGhpc3RvcnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkZXRhaWxzJyk7XG4gICAgICAgICAgICBjb25zdCBzdW1tYXJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3VtbWFyeScpO1xuICAgICAgICAgICAgc3VtbWFyeS50ZXh0Q29udGVudCA9ICdFYXJsaWVyIHZlcnNpb25zJztcbiAgICAgICAgICAgIGhpc3RvcnkuYXBwZW5kKHN1bW1hcnksIC4uLmVhcmxpZXIubWFwKHJlbGVhc2VTZWN0aW9uKSk7XG4gICAgICAgICAgICBub3Rlcy5hcHBlbmRDaGlsZChoaXN0b3J5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZvb3RlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvb3RlcicpO1xuICAgICAgICBjb25zdCBvcHRpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG9wdGlvbnMuY2xhc3NOYW1lID0gJ2phcnZpcy1jaGFuZ2Vsb2ctb3B0aW9ucyc7XG4gICAgICAgIGNvbnN0IG9wdE91dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgICAgIGNvbnN0IGRvbnRTaG93QWdhaW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICBkb250U2hvd0FnYWluLnR5cGUgPSAnY2hlY2tib3gnO1xuICAgICAgICBvcHRPdXQuYXBwZW5kKGRvbnRTaG93QWdhaW4sICdEb27igJl0IHNob3cgYWdhaW4nKTtcbiAgICAgICAgY29uc3Qgc2lsZW50T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAgICAgY29uc3QgdXNlU2lsZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgdXNlU2lsZW50LnR5cGUgPSAnY2hlY2tib3gnO1xuICAgICAgICB1c2VTaWxlbnQuY2hlY2tlZCA9IHRoaXMuc2lsZW50O1xuICAgICAgICBzaWxlbnRPcHRpb24udGl0bGUgPSAnU2hvdyBhbiB1cGRhdGUgaWNvbiBiZXNpZGUgSEgrKyBmb3IgZnV0dXJlIHVwZGF0ZXMuJztcbiAgICAgICAgc2lsZW50T3B0aW9uLmFwcGVuZCh1c2VTaWxlbnQsICdTaWxlbnQgY2hhbmdlbG9nJyk7XG4gICAgICAgIGRvbnRTaG93QWdhaW4uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4gdXNlU2lsZW50LmRpc2FibGVkID0gZG9udFNob3dBZ2Fpbi5jaGVja2VkKTtcbiAgICAgICAgb3B0aW9ucy5hcHBlbmQob3B0T3V0LCBzaWxlbnRPcHRpb24pO1xuICAgICAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBjbG9zZUJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGNsb3NlQnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgICAgICBjbG9zZUJ1dHRvbi50ZXh0Q29udGVudCA9ICdDbG9zZSc7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChjbG9zZUJ1dHRvbik7XG4gICAgICAgIGNvbnRlbnQuYXBwZW5kKHRpdGxlLCBub3RlcywgZm9vdGVyKTtcblxuICAgICAgICBzaG93Q2hhbmdlbG9nUG9wdXAoe1xuICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgIGNsb3NlQnV0dG9uLFxuICAgICAgICAgICAgc2hvdWxkT3BlbjogKCkgPT4gdGhpcy5wZW5kaW5nID09PSAnbWFudWFsJyB8fCAoIXRoaXMuc2lsZW50ICYmIHRoaXMuaGFzVW5yZWFkVXBkYXRlKCkpLFxuICAgICAgICAgICAgb25PcGVuOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3ZWRUaGlzUGFnZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVOb3RpY2UoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oYXNSdW4pIGZvb3Rlci5wcmVwZW5kKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc05ld2VyKGxhdGVzdFZlcnNpb24sIHJlYWRTZWVuVmVyc2lvbigpKSkgbHNTZXQoc2VlbktleSwgbGF0ZXN0VmVyc2lvbik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBzYXZlIHRoZSB2aWV3ZWQgY2hhbmdlbG9nIHZlcnNpb246JywgZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25DbG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucGVuZGluZyA9IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKGRvbnRTaG93QWdhaW4uY2hlY2tlZCkgdGhpcy5kaXNhYmxlTm90aWNlcygpO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaGFzUnVuICYmIHVzZVNpbGVudC5jaGVja2VkICE9PSB0aGlzLnNpbGVudCAmJiB0aGlzLnNhdmVOb3RpY2VTZXR0aW5nKHNpbGVudEtleSwgdXNlU2lsZW50LmNoZWNrZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU3ViU2V0dGluZygnc2lsZW50JywgdXNlU2lsZW50LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5lcj8uZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMub3BlbmVyID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IGluaXRHYW1lIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IGluamVjdFN0eWxlcywgcGFja1NldHRpbmdzIH0gZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBGcmllbmRBbmRGb2VzIH0gZnJvbSAnLi9tb2R1bGVzL3BsYXllcnMvRnJpZW5kQW5kRm9lcyc7XG5pbXBvcnQgeyBhcm1Db250ZXN0U3RhcnR1cEd1YXJkLCBDb250ZXN0U3RhcnQgfSBmcm9tICcuL21vZHVsZXMvY29udGVzdHMvQ29udGVzdFN0YXJ0JztcbmltcG9ydCB7IGluc3RhbGxDb250ZXN0U2V0dGluZ3MgfSBmcm9tICcuL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzJztcbmltcG9ydCB7IExlYWd1ZVRvcDIwIH0gZnJvbSAnLi9tb2R1bGVzL3BsYXllcnMvTGVhZ3VlVG9wMjAnO1xuaW1wb3J0IHsgUmVtb3ZlUGFzc0xvY2sgfSBmcm9tICcuL21vZHVsZXMvcHJvZ3Jlc3Npb24vUmVtb3ZlUGFzc0xvY2snO1xuaW1wb3J0IHsgTG92ZVJhaWRzQWRkb24gfSBmcm9tICcuL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNBZGRvbic7XG5pbXBvcnQgeyBMb3ZlUmFpZHNQYXJzZXIgfSBmcm9tICcuL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNQYXJzZXInO1xuaW1wb3J0IHsgQWN0aXZpdHlQYXJzZXIgfSBmcm9tICcuL21vZHVsZXMvYWN0aXZpdGllcy9BY3Rpdml0eVBhcnNlcic7XG5pbXBvcnQgeyBDaGFuZ2Vsb2cgfSBmcm9tICcuL21vZHVsZXMvdXBkYXRlcy9DaGFuZ2Vsb2cnO1xuXG5hcm1Db250ZXN0U3RhcnR1cEd1YXJkKCk7XG5cbmZ1bmN0aW9uIHJ1bkphcnZpcygpIHtcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBydW5KYXJ2aXMsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgJCB9ID0gd2luZG93O1xuXG4gICAgaWYgKCEkKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJ1bkphcnZpcywgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICBjb25zb2xlLmxvZygnV0FSTklORzogTm8galF1ZXJ5IGZvdW5kLiBFbmRpbmcgc2NyaXB0LicpO1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnSGVsbG8sIFNpciwgSi5BLlIuVi5JLlMuIGlzIHJlYWR5IHRvIGhlbHAgeW91LicpO1xuXG4gICAgaW5pdEdhbWUoJCk7XG4gICAgaW5qZWN0U3R5bGVzKCk7XG5cbiAgICBjb25zdCBmcmllbmRzQW5kRm9lcyA9IG5ldyBGcmllbmRBbmRGb2VzKCk7XG4gICAgY29uc3QgY2hhbmdlbG9nID0gbmV3IENoYW5nZWxvZygpO1xuICAgIGNvbnN0IGFsbE1vZHVsZXMgPSBbXG4gICAgICAgIGZyaWVuZHNBbmRGb2VzLFxuICAgICAgICBuZXcgQ29udGVzdFN0YXJ0KCksXG4gICAgICAgIG5ldyBMZWFndWVUb3AyMCgpLFxuICAgICAgICBuZXcgUmVtb3ZlUGFzc0xvY2soKSxcbiAgICAgICAgbmV3IExvdmVSYWlkc0FkZG9uKCksXG4gICAgICAgIG5ldyBMb3ZlUmFpZHNQYXJzZXIoKSxcbiAgICAgICAgbmV3IEFjdGl2aXR5UGFyc2VyKCksXG4gICAgICAgIGNoYW5nZWxvZ1xuICAgIF1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBydW5TY3JpcHQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGhoUGx1c1BsdXNDb25maWcgfSA9IHdpbmRvd1xuICAgICAgICAgICAgaWYgKCFoaFBsdXNQbHVzQ29uZmlnKSByZXR1cm47XG5cbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJHcm91cCh7XG4gICAgICAgICAgICAgICAga2V5OiAnSkFSVklTJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnSEggSmFydmlzJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGFsbE1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4ge1xuICAgICAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJNb2R1bGUobW9kdWxlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcubG9hZENvbmZpZygpXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJ1bk1vZHVsZXMoKVxuICAgICAgICAgICAgZnJpZW5kc0FuZEZvZXMuaW5zdGFsbFNldHRpbmdzKCk7XG4gICAgICAgICAgICBpbnN0YWxsQ29udGVzdFNldHRpbmdzKCk7XG4gICAgICAgICAgICBjaGFuZ2Vsb2cuaW5zdGFsbFNldHRpbmdzKCk7XG4gICAgICAgICAgICBwYWNrU2V0dGluZ3MoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aW5kb3cuaGhQbHVzUGx1c0NvbmZpZykge1xuICAgICAgICAgICAgcnVuU2NyaXB0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uZSgnaGgrKy1iZHNtOmxvYWRlZCcsIHJ1blNjcmlwdClcbiAg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O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0lPLFdBQVMsZUFBZTtBQUMzQixVQUFNLFFBQVEsU0FBUyxj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
