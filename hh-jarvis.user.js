// ==UserScript==
// @name           HH J.A.R.V.I.S. (Dev)
// @version        0.7.3
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
        .hh-plus-plus-config-panel { --jarvis-version: "v${"0.7.3"}"; }
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

  // src/modules/contests/ContestStart.ts
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
        label: settingHelp("Contest startup", "Open the preferred contest and leaderboard position on load. A starred contest takes priority."),
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
        const title = header.querySelector(".contest_title, .contest_name, h3, h4, h5");
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
        return;
      }
      if (this.startupPending) {
        const target = this.getTarget(contests);
        if (target) this.openContest(list, right, target);
        else if (document.readyState === "complete" && !this.preference) {
          document.getElementById("jarvis-contest-startup")?.remove();
        }
      } else {
        this.showLeaderboard(right, this.getSelectedContestId(list, right));
        this.switchScroll?.restore();
      }
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
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style", "hidden", "id_contest"]
      });
      if (document.readyState !== "complete") window.addEventListener("load", () => this.refresh(), { once: true, signal });
      document.body.addEventListener("click", (event) => {
        if (!event.isTrusted || !(event.target instanceof Element) || !this.right || !this.list?.contains(event.target)) return;
        const header = event.target.closest(".contest_header");
        if (!header || event.target.closest(".jarvis-contest-pin, .jarvis-contest-rank-start")) return;
        this.startupPending = false;
        const id = header.closest(".contest[id_contest]")?.getAttribute("id_contest");
        if (this.stopSwitchScroll && id && id !== this.getSelectedContestId(this.list, this.right)) {
          this.holdSwitchPosition(this.list, this.right, id);
        }
        this.showLeaderboard(this.right, null);
        document.getElementById("jarvis-contest-startup")?.remove();
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
  var CHANGELOG_default = [{ version: "0.7.3", changes: ["See automatic changelogs only when loading the homepage after an update.", "Enable Silent changelog to get a New button beside HH++ and open the notes when you’re ready.", "Keep the contest list and each leaderboard in place when switching contests with Stop scrolling on contest switches."] }, { version: "0.7.2", changes: ["Open the bottom active contest at your rank by default. Choose CbC, CCC, or LC to prefer that event when available.", "Turn off automatic update notices with Don’t show again in the changelog popup. View changelog stays available in settings."] }, { version: "0.7.1", changes: ["Keep the changelog centered when the game window is resized.", "Clean up saved player names, explain unknown names on hover, and give Remove buttons more room."] }, { version: "0.7.0", changes: ["See what changed in Jarvis the first time a new version runs.", "Open View changelog from HH++ settings at any time, even with automatic notices turned off.", "Expand Earlier versions to read past updates."] }, { version: "0.6.7", changes: ["Make marking one action per player, backfill names for older marks, use the bracket-based promotion target, and simplify the selected contest buttons and version badge."] }, { version: "0.6.6", changes: ["Add setting help in HH++, improve mark contrast and management, and add automatic contest defaults.", "Rename the separately installed testing userscript to Dev."] }, { version: "0.6.5", changes: ["Move the userscript source into TypeScript modules and add separate stable and testing builds."] }, { version: "0.6.4", changes: ["Prevent pinned contest startup scrolling, keep native startup without a pin, and clear finished pins"] }, { version: "0.6.3", changes: ["Stop both contest startup scrolls, isolate the selected leaderboard, and restore pinned contests at Top or My rank"] }, { version: "0.6.2", changes: ["Pin contests on their cards, hide the startup scroll, and use right-click marking with isolated settings scrolling"] }, { version: "0.6.1", changes: ["Read native Manga RPG contest titles and recognize active cards when contest data is unavailable"] }, { version: "0.6.0", changes: ["Add a contest start preference, continuous marking, and compact settings with a version label"] }, { version: "0.5.0", changes: ["Add league and contest player marking with custom colors, compact settings, and limit Top 20 to promotable leagues"] }, { version: "0.4.2", changes: ["Fix module startup, league controls, and raid exports; add the Top 20 league target"] }, { version: "0.4.1", changes: ["Fix Love Raids shadows replacement"] }, { version: "0.4.0", changes: ["Add ActivityParser module"] }, { version: "0.3.1", changes: ["Add harem link inside love raid cards"] }, { version: "0.3.0", changes: ["Add LoveRaidsAddon and LoveRaidsParser modules"] }, { version: "0.2.0", changes: ["Add RemovePassLock module"] }, { version: "0.1.3", changes: ["Better code practices"] }, { version: "0.1.2", changes: ["Polishing and update links"] }, { version: "0.1.1", changes: ["Add FriendAndFoes module"] }, { version: "0.0.1", changes: ["Initial release"] }];

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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzSGVscC50cyIsICJzcmMvc2V0dGluZ3MuY3NzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvSEhNb2R1bGUudHMiLCAic3JjL3N0b3JhZ2UudHMiLCAic3JjL21vZHVsZXMvcGxheWVycy9tYXJrTWFuYWdlci50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0ZyaWVuZEFuZEZvZXMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzLnRzIiwgInNyYy9tb2R1bGVzL2NvbnRlc3RzL0NvbnRlc3RTdGFydC50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0xlYWd1ZVRvcDIwLnRzIiwgInNyYy9tb2R1bGVzL3Byb2dyZXNzaW9uL1JlbW92ZVBhc3NMb2NrLnRzIiwgInNyYy9tb2R1bGVzL2xvdmUtcmFpZHMvZ2FtZURhdGEudHMiLCAic3JjL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNBZGRvbi50cyIsICJzcmMvbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc1BhcnNlci50cyIsICJzcmMvbW9kdWxlcy9hY3Rpdml0aWVzL0FjdGl2aXR5UGFyc2VyLnRzIiwgIkNIQU5HRUxPRy5tZCIsICJzcmMvbW9kdWxlcy91cGRhdGVzL2NoYW5nZWxvZ1BvcHVwLnRzIiwgInNyYy9tb2R1bGVzL3VwZGF0ZXMvQ2hhbmdlbG9nLnRzIiwgInNyYy9pbmRleC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCAkOiBKUXVlcnlTdGF0aWM7XG5leHBvcnQgbGV0IGN1cnJlbnRQYWdlOiBzdHJpbmc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0R2FtZShqUXVlcnk6IEpRdWVyeVN0YXRpYykge1xuICAgICQgPSBqUXVlcnk7XG4gICAgY3VycmVudFBhZ2UgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIHNldHRpbmdIZWxwKGxhYmVsOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgICBjb25zdCBlc2NhcGUgPSAodGV4dDogc3RyaW5nKSA9PiB0ZXh0LnJlcGxhY2VBbGwoJyYnLCAnJmFtcDsnKS5yZXBsYWNlQWxsKCdcIicsICcmcXVvdDsnKVxuICAgICAgICAucmVwbGFjZUFsbCgnPCcsICcmbHQ7JykucmVwbGFjZUFsbCgnPicsICcmZ3Q7Jyk7XG4gICAgcmV0dXJuIGVzY2FwZShsYWJlbCkgKyAnIDxzcGFuIGNsYXNzPVwiaXJvbm1hbi1zZXR0aW5nLWhlbHBcIiByb2xlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgYXJpYS1sYWJlbD1cIkFib3V0ICcgK1xuICAgICAgICBlc2NhcGUobGFiZWwpICsgJ1wiIGRhdGEtc2V0dGluZy1oZWxwPVwiJyArIGVzY2FwZShkZXNjcmlwdGlvbikgKyAnXCI+Pzwvc3Bhbj4nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW91bnRTZXR0aW5nc0hlbHAocGFuZWw6IEhUTUxFbGVtZW50LCB0b29sdGlwSWQ6IHN0cmluZykge1xuICAgIGNvbnN0IHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0b29sdGlwLmlkID0gdG9vbHRpcElkO1xuICAgIHRvb2x0aXAuY2xhc3NOYW1lID0gJ2lyb25tYW4tc2V0dGluZy10b29sdGlwJztcbiAgICB0b29sdGlwLnNldEF0dHJpYnV0ZSgncm9sZScsICd0b29sdGlwJyk7XG4gICAgY29uc3QgcG9wb3ZlciA9IHR5cGVvZiB0b29sdGlwLnNob3dQb3BvdmVyID09PSAnZnVuY3Rpb24nO1xuICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLnNldEF0dHJpYnV0ZSgncG9wb3ZlcicsICdtYW51YWwnKTtcbiAgICBlbHNlIHRvb2x0aXAuaGlkZGVuID0gdHJ1ZTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvb2x0aXApO1xuXG4gICAgbGV0IGFuY2hvcjogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBnZXRIZWxwID0gKHRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsKSA9PlxuICAgICAgICB0YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ID8gdGFyZ2V0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCdbZGF0YS1zZXR0aW5nLWhlbHBdJykgOiBudWxsO1xuICAgIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIWFuY2hvcikgcmV0dXJuO1xuICAgICAgICBhbmNob3IucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jyk7XG4gICAgICAgIGFuY2hvciA9IG51bGw7XG4gICAgICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLmhpZGVQb3BvdmVyKCk7XG4gICAgICAgIGVsc2UgdG9vbHRpcC5oaWRkZW4gPSB0cnVlO1xuICAgIH07XG4gICAgY29uc3Qgc2hvdyA9IChoZWxwOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICBpZiAoYW5jaG9yID09PSBoZWxwKSByZXR1cm47XG4gICAgICAgIGNsb3NlKCk7XG4gICAgICAgIGFuY2hvciA9IGhlbHA7XG4gICAgICAgIGhlbHAuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgdG9vbHRpcElkKTtcbiAgICAgICAgdG9vbHRpcC50ZXh0Q29udGVudCA9IGhlbHAuZGF0YXNldC5zZXR0aW5nSGVscCA/PyAnJztcbiAgICAgICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuc2hvd1BvcG92ZXIoKTtcbiAgICAgICAgZWxzZSB0b29sdGlwLmhpZGRlbiA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IGhlbHAuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0V2lkdGgsIG9mZnNldEhlaWdodCB9ID0gdG9vbHRpcDtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoOCwgTWF0aC5taW4oYm91bmRzLmxlZnQsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCAtIG9mZnNldFdpZHRoIC0gOCkpICsgJ3B4JztcbiAgICAgICAgY29uc3QgYmVsb3cgPSBib3VuZHMuYm90dG9tICsgNjtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS50b3AgPSAoYmVsb3cgKyBvZmZzZXRIZWlnaHQgPD0gd2luZG93LmlubmVySGVpZ2h0IC0gOFxuICAgICAgICAgICAgPyBiZWxvdyA6IE1hdGgubWF4KDgsIGJvdW5kcy50b3AgLSBvZmZzZXRIZWlnaHQgLSA2KSkgKyAncHgnO1xuICAgIH07XG5cbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyb3ZlcicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgJiYgZXZlbnQucG9pbnRlclR5cGUgIT09ICd0b3VjaCcpIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm91dCcsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgPT09IGFuY2hvciAmJiBoZWxwICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGhlbHApIGNsb3NlKCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHApIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCBldmVudCA9PiB7XG4gICAgICAgIGlmIChnZXRIZWxwKGV2ZW50LnRhcmdldCkgPT09IGFuY2hvcikgY2xvc2UoKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKCFoZWxwKSByZXR1cm47XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzaG93KGhlbHApO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGhlbHAgPSBnZXRIZWxwKGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGlmIChoZWxwICYmIChldmVudC5rZXkgPT09ICdFbnRlcicgfHwgZXZlbnQua2V5ID09PSAnICcpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBzaG93KGhlbHApO1xuICAgICAgICB9IGVsc2UgaWYgKGFuY2hvciAmJiBldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGdldEhlbHAoZXZlbnQudGFyZ2V0KSAhPT0gYW5jaG9yKSBjbG9zZSgpO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGNsb3NlLCB7IHBhc3NpdmU6IHRydWUgfSk7XG59XG4iLCAiLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAucGFuZWwtY29udGVudHMge1xuICAgIGFsaWduLWNvbnRlbnQ6IHN0YXJ0O1xuICAgIGFsaWduLWl0ZW1zOiBzdGFydDtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIG92ZXJzY3JvbGwtYmVoYXZpb3I6IGNvbnRhaW47XG4gICAgc2Nyb2xsYmFyLXdpZHRoOiB0aGluO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWw6aGFzKD4gLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXS5zaG93bikge1xuICAgIG92ZXJmbG93OiBjbGlwO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmcuaGFzLXN1YnNldHRpbmdzIHtcbiAgICBncmlkLXJvdy1lbmQ6IGF1dG87XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5qYXJ2aXMtcGFja2VkLXNldHRpbmdzIHtcbiAgICBncmlkLWF1dG8tZmxvdzogcm93IGRlbnNlO1xuICAgIGdyaWQtYXV0by1yb3dzOiAxcHg7XG4gICAgcm93LWdhcDogMDtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1wYWNrZWQtc2V0dGluZ3MgLmNvbmZpZy1zZXR0aW5nIHtcbiAgICBncmlkLXJvdy1lbmQ6IHNwYW4gdmFyKC0tamFydmlzLXNldHRpbmctcm93cywgMSk7XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAudGFicyBoNFtyZWw9XCJKQVJWSVNcIl0ge1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC50YWJzIGg0W3JlbD1cIkpBUlZJU1wiXS5zZWxlY3RlZDo6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6IHZhcigtLWphcnZpcy12ZXJzaW9uKTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgaW5zZXQtYmxvY2stc3RhcnQ6IDA7XG4gICAgaW5zZXQtaW5saW5lLWVuZDogLjE1cmVtO1xuICAgIGZvbnQtc2l6ZTogLjYyNXJlbTtcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIHRleHQtdHJhbnNmb3JtOiBub25lO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLmlyb25tYW4tc2V0dGluZy1oZWxwIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtZ3JpZDtcbiAgICBwbGFjZS1pdGVtczogY2VudGVyO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgaW5saW5lLXNpemU6IDEuMjVlbTtcbiAgICBibG9jay1zaXplOiAxLjI1ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICBmb250LXNpemU6IC44ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgdmVydGljYWwtYWxpZ246IC4wOGVtO1xuICAgIGN1cnNvcjogaGVscDtcbn1cbi5pcm9ubWFuLXNldHRpbmctaGVscDpob3Zlcixcbi5pcm9ubWFuLXNldHRpbmctaGVscDpmb2N1cy12aXNpYmxlIHtcbiAgICBvdXRsaW5lOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIG91dGxpbmUtb2Zmc2V0OiAycHg7XG59XG4uaXJvbm1hbi1zZXR0aW5nLXRvb2x0aXAge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICBpbnNldDogYXV0bztcbiAgICB6LWluZGV4OiAxMDAxMDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIG1heC13aWR0aDogbWluKDE4cmVtLCBjYWxjKDEwMHZ3IC0gMTZweCkpO1xuICAgIG1hcmdpbjogMDtcbiAgICBwYWRkaW5nOiAuNWVtIC43ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNGVtO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWNvbmZpZy1zZXR0aW5nLWJhY2tncm91bmQsICMyNDFlMzApO1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGZvbnQ6IDE0cHgvMS40IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1tYXJrLWNvbG9yIGlucHV0IHtcbiAgICB3aWR0aDogMzBweDtcbiAgICBoZWlnaHQ6IDIwcHg7XG4gICAgZmxleDogbm9uZTtcbiAgICBwYWRkaW5nOiAwO1xufVxuYnV0dG9uLmphcnZpcy1jb250ZXN0LXBpbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgbWFyZ2luLWlubGluZS1zdGFydDogLjM1ZW07XG4gICAgcGFkZGluZy1pbmxpbmU6IC4yZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgZm9udC1zaXplOiAuOWVtO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1waW46OmJlZm9yZSB7XG4gICAgY29udGVudDogJ+KYhic7XG59XG4uamFydmlzLWNvbnRlc3QtcGluW2FyaWEtcHJlc3NlZD1cInRydWVcIl06OmJlZm9yZSB7XG4gICAgY29udGVudDogJ+KYhSc7XG4gICAgY29sb3I6ICNmZmQzNmI7XG59XG4uamFydmlzLWNvbnRlc3QtcGluOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICB3aWR0aDogZml0LWNvbnRlbnQ7XG4gICAgZ2FwOiAuMTJlbTtcbiAgICBwYWRkaW5nOiAuMTJlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDU1JSwgdHJhbnNwYXJlbnQpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40NWVtO1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIGxpbmUtaGVpZ2h0OiAxLjE1O1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b24ge1xuICAgIGFsbDogdW5zZXQ7XG4gICAgcGFkZGluZzogLjE4ZW0gLjM4ZW07XG4gICAgYm9yZGVyLXJhZGl1czogLjI2ZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgZm9udDogaW5oZXJpdDtcbiAgICBsaW5lLWhlaWdodDogaW5oZXJpdDtcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uW2FyaWEtcHJlc3NlZD1cInRydWVcIl0ge1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMjIlLCB0cmFuc3BhcmVudCk7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIGJ1dHRvbjpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAxNSUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG59XG4uamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCB7XG4gICAgbWFyZ2luLWlubGluZS1zdGFydDogLjI4ZW07XG4gICAgZm9udC1zaXplOiAuN2VtO1xuICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XG59XG4uamFydmlzLWNvbnRlc3Qtc2V0dGluZ3Mge1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ2FwOiAuM2VtO1xuICAgIG1pbi13aWR0aDogMDtcbiAgICBtYXJnaW46IC40NWVtIDAgMDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGJvcmRlcjogMDtcbiAgICBmb250LXNpemU6IC44NWVtO1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzIC5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgbWF4LXdpZHRoOiAxMDAlO1xuICAgIGZsZXgtd3JhcDogd3JhcDtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5ncyBbaGlkZGVuXSB7XG4gICAgZGlzcGxheTogbm9uZTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5nczpkaXNhYmxlZCAuamFydmlzLWNvbnRlc3QtY2hvaWNlIHtcbiAgICBvcGFjaXR5OiAuNTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5nczpkaXNhYmxlZCBidXR0b24ge1xuICAgIGN1cnNvcjogZGVmYXVsdDtcbn1cbi5qYXJ2aXMtbWFyay1tZW51IHtcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgei1pbmRleDogMTAwMDA7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBnYXA6IDJweDtcbiAgICBwYWRkaW5nOiA0cHg7XG4gICAgYm9yZGVyOiAxcHggc29saWQgIzg5OTRhNztcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgYmFja2dyb3VuZDogIzIzMjkzNjtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBib3gtc2hhZG93OiAwIDJweCAxMHB4ICMwMDA4O1xuICAgIGZvbnQ6IDEzcHgvMS4zNSBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7XG59XG4uamFydmlzLW1hcmstbWVudSBidXR0b24ge1xuICAgIGFsbDogdW5zZXQ7XG4gICAgcGFkZGluZzogNHB4IDlweDtcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1tYXJrLW1lbnUgYnV0dG9uOmhvdmVyLFxuLmphcnZpcy1tYXJrLW1lbnUgYnV0dG9uOmZvY3VzLXZpc2libGUge1xuICAgIGJhY2tncm91bmQ6ICM0MTRkNjQ7XG59XG4jY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEuamFydmlzLWNvbnRlc3QtaW5zdGFudCxcbiNjb250ZXN0cyAucmlnaHRfcGFydC5qYXJ2aXMtY29udGVzdC1pbnN0YW50IC5sZWFkX3RhYmxlX3ZpZXcge1xuICAgIHNjcm9sbC1iZWhhdmlvcjogYXV0byAhaW1wb3J0YW50O1xuICAgIG92ZXJmbG93LWFuY2hvcjogbm9uZSAhaW1wb3J0YW50O1xufVxuI2NvbnRlc3RzIC5qYXJ2aXMtY29udGVzdC1sb2FkaW5nIHtcbiAgICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7XG4gICAgdHJhbnNpdGlvbjogbm9uZSAhaW1wb3J0YW50O1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuI2NvbnRlc3RzIC5yaWdodF9wYXJ0IC5yYW5raW5nW2lkX2NvbnRlc3RdLmphcnZpcy1jb250ZXN0LW90aGVyIHtcbiAgICBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFyaz1cImZyaWVuZFwiXSB7XG4gICAgY29sb3I6IHZhcigtLWphcnZpcy1mcmllbmQtY29sb3IpICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFyaz1cImZvZVwiXSB7XG4gICAgY29sb3I6IHZhcigtLWphcnZpcy1mb2UtY29sb3IpICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFya10sXG50ZFtkYXRhLWphcnZpcy1tYXJrXSA+IGEge1xuICAgIHRleHQtc2hhZG93OiAxcHggMCAjMTExODI3LCAtMXB4IDAgIzExMTgyNywgMCAxcHggIzExMTgyNywgMCAtMXB4ICMxMTE4MjcgIWltcG9ydGFudDtcbn1cbnRkW2RhdGEtamFydmlzLW1hcmtdID4gYSB7XG4gICAgY29sb3I6IGluaGVyaXQgIWltcG9ydGFudDtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb24ge1xuICAgIGFwcGVhcmFuY2U6IG5vbmU7XG4gICAgcGFkZGluZzogLjJlbSAuNWVtO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbiAgICBib3JkZXItcmFkaXVzOiAuMzVlbTtcbiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246aG92ZXIsXG4uamFydmlzLXNldHRpbmctYWN0aW9uOmZvY3VzLXZpc2libGUge1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMTYlLCB0cmFuc3BhcmVudCk7XG59XG4uamFydmlzLXNldHRpbmctYWN0aW9uOmRpc2FibGVkIHtcbiAgICBjdXJzb3I6IGRlZmF1bHQ7XG4gICAgb3BhY2l0eTogLjU7XG59XG4uamFydmlzLW1hcmstc2V0dGluZy1hY3Rpb25zLFxuLmphcnZpcy1tYXJrLWFjdGlvbnMge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC13cmFwOiB3cmFwO1xuICAgIGdhcDogLjRlbTtcbn1cbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIHtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIHdpZHRoOiBtaW4oMzRyZW0sIGNhbGMoMTAwdncgLSAycmVtKSk7XG4gICAgbWF4LWhlaWdodDogY2FsYygxMDB2aCAtIDJyZW0pO1xuICAgIHBhZGRpbmc6IDFyZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNjVyZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogMTVweC8xLjM1IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbn1cbi5qYXJ2aXMtbWFyay1tYW5hZ2VyOjpiYWNrZHJvcCB7XG4gICAgYmFja2dyb3VuZDogIzA4MGIxMmFhO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXIgaDIsXG4uamFydmlzLW1hcmstbWFuYWdlciBoMyxcbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIHAge1xuICAgIG1hcmdpbjogMDtcbn1cbi5qYXJ2aXMtbWFyay1saXN0cyB7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KG1pbigxM3JlbSwgMTAwJSksIDFmcikpO1xuICAgIGdhcDogLjlyZW07XG4gICAgbWF4LWhlaWdodDogNTB2aDtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIHNjcm9sbGJhci1ndXR0ZXI6IHN0YWJsZTtcbiAgICBwYWRkaW5nLWlubGluZS1lbmQ6IC43cmVtO1xuICAgIG1hcmdpbi1ibG9jazogLjlyZW07XG59XG4uamFydmlzLW1hcmstbGlzdHMgdWwge1xuICAgIG1hcmdpbjogLjNlbSAwIDA7XG4gICAgcGFkZGluZzogMDtcbiAgICBsaXN0LXN0eWxlOiBub25lO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIGxpIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgIGdhcDogLjQ1ZW07XG4gICAgcGFkZGluZzogLjJlbSAwO1xuICAgIG92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIGxpIGJ1dHRvbiB7XG4gICAgZmxleDogbm9uZTtcbn1cbi5qYXJ2aXMtbWFyay1hY3Rpb25zIHtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG59XG4uamFydmlzLXZpZXctY2hhbmdlbG9nIHtcbiAgICBtYXJnaW4tdG9wOiAuNDVlbTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLWJ1dHRvbiA+IC5qYXJ2aXMtY2hhbmdlbG9nLW5vdGljZSB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGluc2V0LWlubGluZS1lbmQ6IGNhbGMoMTAwJSArIC4zNWVtKTtcbiAgICB0b3A6IDUwJTtcbiAgICB0cmFuc2xhdGU6IDAgLTUwJTtcbiAgICBoZWlnaHQ6IDY0JTtcbiAgICBwYWRkaW5nOiAwIC40NWVtO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbmZpZy1zZXR0aW5nLWJvcmRlciwgI2E5YTNiYyk7XG4gICAgYm9yZGVyLXJhZGl1czogLjQ1ZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogNjAwIC43NXJlbS8xIHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RpY2U6aG92ZXIge1xuICAgIGZpbHRlcjogYnJpZ2h0bmVzcygxLjIpO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90aWNlOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDJweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbmRpYWxvZy5qYXJ2aXMtY2hhbmdlbG9nLXBvcHVwIHtcbiAgICAtLWphcnZpcy1jaGFuZ2Vsb2ctaGVpZ2h0OiBtaW4oMzJyZW0sIGNhbGMoMTAwdmggLSAxLjI1cmVtKSk7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgaW5zZXQ6IDA7XG4gICAgd2lkdGg6IG1pbigzN3JlbSwgY2FsYygxMDAlIC0gMS4yNXJlbSkpO1xuICAgIGhlaWdodDogZml0LWNvbnRlbnQ7XG4gICAgbWF4LWhlaWdodDogdmFyKC0tamFydmlzLWNoYW5nZWxvZy1oZWlnaHQpO1xuICAgIG1hcmdpbjogYXV0bztcbiAgICBwYWRkaW5nOiAwO1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNnJlbTtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jb25maWctc2V0dGluZy1iYWNrZ3JvdW5kLCAjMjQxZTMwKTtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBmb250OiAxNXB4LzEuNDUgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgIHRleHQtYWxpZ246IHN0YXJ0O1xufVxuQHN1cHBvcnRzIChoZWlnaHQ6IDEwMGR2aCkge1xuICAgIGRpYWxvZy5qYXJ2aXMtY2hhbmdlbG9nLXBvcHVwIHtcbiAgICAgICAgLS1qYXJ2aXMtY2hhbmdlbG9nLWhlaWdodDogbWluKDMycmVtLCBjYWxjKDEwMGR2aCAtIDEuMjVyZW0pKTtcbiAgICB9XG59XG4uamFydmlzLWNoYW5nZWxvZy1wb3B1cDo6YmFja2Ryb3Age1xuICAgIGJhY2tncm91bmQ6ICMwODBiMTJhYTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQge1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IGF1dG8gbWlubWF4KDAsIDFmcikgYXV0bztcbiAgICBnYXA6IGNsYW1wKC40NXJlbSwgMnZ3LCAuOXJlbSk7XG4gICAgbWF4LWhlaWdodDogY2FsYyh2YXIoLS1qYXJ2aXMtY2hhbmdlbG9nLWhlaWdodCkgLSAycHgpO1xuICAgIHBhZGRpbmc6IGNsYW1wKC42cmVtLCAzdncsIDFyZW0pO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBoMixcbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgaDMge1xuICAgIG1hcmdpbjogMDtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgaDIge1xuICAgIGZvbnQtc2l6ZTogMS4zZW07XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGgzIHtcbiAgICBjb2xvcjogdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjZDljN2ZiKTtcbiAgICBmb250LXNpemU6IDFlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgc2VjdGlvbiArIHNlY3Rpb24sXG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGRldGFpbHMge1xuICAgIG1hcmdpbi10b3A6IC43NXJlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGVzIHtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIG92ZXJzY3JvbGwtYmVoYXZpb3I6IGNvbnRhaW47XG4gICAgc2Nyb2xsYmFyLXdpZHRoOiB0aGluO1xuICAgIG92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90ZXMgdWwge1xuICAgIG1hcmdpbjogLjJlbSAwIDA7XG4gICAgcGFkZGluZy1pbmxpbmUtc3RhcnQ6IDEuMmVtO1xuICAgIGxpc3Qtc3R5bGU6IGRpc2M7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RlcyBsaSArIGxpIHtcbiAgICBtYXJnaW4tdG9wOiAuMjVlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGVzIHN1bW1hcnkge1xuICAgIG1hcmdpbi1ib3R0b206IC40cmVtO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgZm9vdGVyIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtd3JhcDogd3JhcDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogZW5kO1xuICAgIGdhcDogLjVlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW9wdC1vdXQge1xuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiAuNGVtO1xuICAgIG1hcmdpbi1pbmxpbmUtZW5kOiBhdXRvO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbiIsICJpbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBtb3VudFNldHRpbmdzSGVscCB9IGZyb20gJy4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCBjc3MgZnJvbSAnLi9zZXR0aW5ncy5jc3MnO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0U3R5bGVzKCkge1xuICAgIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZS5jbGFzc05hbWUgPSAnaGgtamFydmlzLXN0eWxlJztcbiAgICBzdHlsZS50ZXh0Q29udGVudCA9IGAke2Nzc31cbiAgICAgICAgLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgeyAtLWphcnZpcy12ZXJzaW9uOiBcInYke1VTRVJTQ1JJUFRfVkVSU0lPTn1cIjsgfVxuICAgIGA7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrU2V0dGluZ3MoKSB7XG4gICAgaWYgKGN1cnJlbnRQYWdlICE9PSAnL2hvbWUuaHRtbCcpIHJldHVybjtcblxuICAgIGNvbnN0IHNlbGVjdG9yID0gJy5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLnBhbmVsLWNvbnRlbnRzJztcbiAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oc2VsZWN0b3IpO1xuICAgICAgICBpZiAoIXBhbmVsKSByZXR1cm47XG4gICAgICAgIHBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hoLXNjcm9sbCcpO1xuICAgICAgICBtb3VudFNldHRpbmdzSGVscChwYW5lbCwgJ2phcnZpcy1zZXR0aW5nLXRvb2x0aXAnKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmN0cmxLZXkgfHwgIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSB8fCAhcGFuZWwuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCB1bml0ID0gZXZlbnQuZGVsdGFNb2RlID09PSAxID8gMTYgOiBldmVudC5kZWx0YU1vZGUgPT09IDIgPyBwYW5lbC5jbGllbnRIZWlnaHQgOiAxO1xuICAgICAgICAgICAgY29uc3Qgc2NhbGUgPSBwYW5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQgLyBwYW5lbC5vZmZzZXRIZWlnaHQgfHwgMTtcbiAgICAgICAgICAgIHBhbmVsLnNjcm9sbFRvcCArPSBldmVudC5kZWx0YVkgKiB1bml0IC8gc2NhbGU7XG4gICAgICAgIH0sIHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogZmFsc2UgfSk7XG5cbiAgICAgICAgY29uc3QgY2FyZHMgPSBwYW5lbC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLmNvbmZpZy1zZXR0aW5nJyk7XG4gICAgICAgIGNvbnN0IHBhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXBhbmVsLm9mZnNldFdpZHRoKSByZXR1cm47XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgY2FyZCBvZiBjYXJkcykge1xuICAgICAgICAgICAgICAgIGNhcmQuc3R5bGUuc2V0UHJvcGVydHkoJy0tamFydmlzLXNldHRpbmctcm93cycsIFN0cmluZyhjYXJkLm9mZnNldEhlaWdodCArIDEwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYW5lbC5jbGFzc0xpc3QuYWRkKCdqYXJ2aXMtcGFja2VkLXNldHRpbmdzJyk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGdyb3VwT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihwYWNrKTtcbiAgICAgICAgaWYgKHBhbmVsLnBhcmVudEVsZW1lbnQpIGdyb3VwT2JzZXJ2ZXIub2JzZXJ2ZShwYW5lbC5wYXJlbnRFbGVtZW50LCB7IGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcyddIH0pO1xuICAgICAgICBpZiAodHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY29uc3Qgc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHBhY2spO1xuICAgICAgICAgICAgY2FyZHMuZm9yRWFjaChjYXJkID0+IHNpemVPYnNlcnZlci5vYnNlcnZlKGNhcmQpKTtcbiAgICAgICAgfVxuICAgICAgICBwYWNrKCk7XG4gICAgfSk7XG59XG4iLCAiZXhwb3J0IHR5cGUgTW9kdWxlU2V0dGluZ3MgPSBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPjtcblxuaW50ZXJmYWNlIENvbmZpZ1NjaGVtYSB7XG4gICAgYmFzZUtleTogc3RyaW5nO1xuICAgIGxhYmVsOiBzdHJpbmc7XG4gICAgZGVmYXVsdDogYm9vbGVhbjtcbiAgICBzdWJTZXR0aW5ncz86IHsga2V5OiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IGRlZmF1bHQ6IGJvb2xlYW4gfVtdO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSEhNb2R1bGUge1xuICAgIHJlYWRvbmx5IGdyb3VwID0gJ0pBUlZJUyc7XG4gICAgcmVhZG9ubHkgY29uZmlnU2NoZW1hOiBDb25maWdTY2hlbWE7XG4gICAgaGFzUnVuID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3Rvcih7IGNvbmZpZ1NjaGVtYSB9OiB7IG5hbWU6IHN0cmluZzsgY29uZmlnU2NoZW1hOiBDb25maWdTY2hlbWEgfSkge1xuICAgICAgICB0aGlzLmNvbmZpZ1NjaGVtYSA9IGNvbmZpZ1NjaGVtYTtcbiAgICB9XG5cbiAgICBhYnN0cmFjdCBzaG91bGRSdW4oKTogYm9vbGVhbjtcbiAgICBhYnN0cmFjdCBydW4oc2V0dGluZ3M6IE1vZHVsZVNldHRpbmdzKTogdm9pZCB8IFByb21pc2U8dm9pZD47XG59XG4iLCAiZXhwb3J0IGNvbnN0IExTX0NPTkZJR19OQU1FID0gJ0hIU3RhcmsnO1xuXG5leHBvcnQgZnVuY3Rpb24gbHNHZXQoa2V5OiBzdHJpbmcsIGxzX25hbWUgPSBMU19DT05GSUdfTkFNRSk6IHVua25vd24ge1xuICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGAke2xzX25hbWV9JHtrZXl9YCkgPz8gJ251bGwnKVxufVxuZXhwb3J0IGZ1bmN0aW9uIGxzU2V0KGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93biwgbHNfbmFtZSA9IExTX0NPTkZJR19OQU1FKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGAke2xzX25hbWV9JHtrZXl9YCwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKVxufVxuZXhwb3J0IGZ1bmN0aW9uIGxzUm0oa2V5OiBzdHJpbmcsIGxzX25hbWUgPSBMU19DT05GSUdfTkFNRSkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShgJHtsc19uYW1lfSR7a2V5fWApXG59XG4iLCAiaW1wb3J0IHsgTFNfQ09ORklHX05BTUUgfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcblxuZXhwb3J0IHR5cGUgTWFyayA9ICdmcmllbmQnIHwgJ2ZvZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2F2ZWRNYXJrIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIG5hbWU/OiBzdHJpbmc7XG4gICAgbWFyazogTWFyaztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5NYXJrTWFuYWdlcihyZWFkOiAoKSA9PiBTYXZlZE1hcmtbXSwgcmVtb3ZlOiAoaWQ6IHN0cmluZykgPT4gYm9vbGVhbiwgY2xlYXI6ICgpID0+IGJvb2xlYW4pIHtcbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmphcnZpcy1tYXJrLW1hbmFnZXInKSkgcmV0dXJuO1xuXG4gICAgY29uc3QgZGlhbG9nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGlhbG9nJyk7XG4gICAgZGlhbG9nLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1tYW5hZ2VyJztcbiAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsbGVkYnknLCAnamFydmlzLW1hcmstbWFuYWdlci10aXRsZScpO1xuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcbiAgICB0aXRsZS5pZCA9ICdqYXJ2aXMtbWFyay1tYW5hZ2VyLXRpdGxlJztcbiAgICB0aXRsZS50ZXh0Q29udGVudCA9ICdGcmllbmRzIGFuZCBmb2VzJztcblxuICAgIGNvbnN0IGxpc3RzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbGlzdHMuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLWxpc3RzJztcbiAgICBjb25zdCBhY3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYWN0aW9ucy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstYWN0aW9ucyc7XG4gICAgY29uc3QgY2xlYXJBbGwgPSBtYWtlQnV0dG9uKCdDbGVhciBhbGwgbWFya3MnLCAoKSA9PiB7XG4gICAgICAgIGlmIChjb25maXJtKCdSZW1vdmUgYWxsIGZyaWVuZCBhbmQgZm9lIG1hcmtzIGZvciB0aGlzIGdhbWU/JykgJiYgY2xlYXIoKSkge1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICBjbG9zZS5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgY29uc3QgY2xvc2UgPSBtYWtlQnV0dG9uKCdDbG9zZScsICgpID0+IGRpYWxvZy5jbG9zZSgpKTtcbiAgICBhY3Rpb25zLmFwcGVuZChjbGVhckFsbCwgY2xvc2UpO1xuXG4gICAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gcmVhZCgpLnNvcnQoKGEsIGIpID0+IE51bWJlcighYS5uYW1lKSAtIE51bWJlcighYi5uYW1lKSB8fFxuICAgICAgICAgICAgKGEubmFtZSB8fCBhLmlkKS5sb2NhbGVDb21wYXJlKGIubmFtZSB8fCBiLmlkLCB1bmRlZmluZWQsIHsgbnVtZXJpYzogdHJ1ZSB9KSk7XG4gICAgICAgIGNvbnN0IHNlY3Rpb25zID0gKFsnZnJpZW5kJywgJ2ZvZSddIGFzIGNvbnN0KS5tYXAobWFyayA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpO1xuICAgICAgICAgICAgY29uc3QgaGVhZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gZW50cmllcy5maWx0ZXIoZW50cnkgPT4gZW50cnkubWFyayA9PT0gbWFyayk7XG4gICAgICAgICAgICBoZWFkaW5nLnRleHRDb250ZW50ID0gKG1hcmsgPT09ICdmcmllbmQnID8gJ0ZyaWVuZHMnIDogJ0ZvZXMnKSArIGAgKCR7bWF0Y2hlcy5sZW5ndGh9KWA7XG4gICAgICAgICAgICBzZWN0aW9uLmFwcGVuZENoaWxkKGhlYWRpbmcpO1xuXG4gICAgICAgICAgICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbXB0eSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgICAgICAgICBlbXB0eS50ZXh0Q29udGVudCA9ICdObyBzYXZlZCBwbGF5ZXJzLic7XG4gICAgICAgICAgICAgICAgc2VjdGlvbi5hcHBlbmRDaGlsZChlbXB0eSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlY3Rpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IGlkLCBuYW1lIH0gb2YgbWF0Y2hlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGxheWVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgICAgIHBsYXllci50ZXh0Q29udGVudCA9IG5hbWUgPyBgJHtuYW1lfSDCtyAke2lkfWAgOiBgUGxheWVyICMke2lkfWA7XG4gICAgICAgICAgICAgICAgaWYgKCFuYW1lKSBwbGF5ZXIudGl0bGUgPSAnTmFtZSBub3QgcmVjb3JkZWQgeWV0JztcbiAgICAgICAgICAgICAgICBjb25zdCBidXR0b24gPSBtYWtlQnV0dG9uKCdSZW1vdmUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gQXJyYXkuZnJvbShsaXN0cy5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKSkuaW5kZXhPZihidXR0b24pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3ZlKGlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmcgPSBsaXN0cy5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIChyZW1haW5pbmdbTWF0aC5taW4oaW5kZXgsIHJlbWFpbmluZy5sZW5ndGggLSAxKV0gfHwgY2xvc2UpLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgYFJlbW92ZSAke25hbWUgfHwgYHBsYXllciAke2lkfWB9IGZyb20gJHttYXJrID09PSAnZnJpZW5kJyA/ICdmcmllbmRzJyA6ICdmb2VzJ31gKTtcbiAgICAgICAgICAgICAgICByb3cuYXBwZW5kKHBsYXllciwgYnV0dG9uKTtcbiAgICAgICAgICAgICAgICBsaXN0LmFwcGVuZENoaWxkKHJvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWN0aW9uLmFwcGVuZENoaWxkKGxpc3QpO1xuICAgICAgICAgICAgcmV0dXJuIHNlY3Rpb247XG4gICAgICAgIH0pO1xuICAgICAgICBsaXN0cy5yZXBsYWNlQ2hpbGRyZW4oLi4uc2VjdGlvbnMpO1xuICAgICAgICBjbGVhckFsbC5kaXNhYmxlZCA9IGVudHJpZXMubGVuZ3RoID09PSAwO1xuICAgIH1cblxuICAgIHJlbmRlcigpO1xuICAgIGRpYWxvZy5hcHBlbmQodGl0bGUsIGxpc3RzLCBhY3Rpb25zKTtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3N0b3JhZ2UnLCBldmVudCA9PiB7XG4gICAgICAgIGlmICghZXZlbnQua2V5IHx8IFsnUGxheWVyTWFya3MnLCAnUGxheWVyTWFya05hbWVzJywgJ0ZyaWVuZExpc3QnLCAnRm9lTGlzdCddXG4gICAgICAgICAgICAuc29tZShrZXkgPT4gZXZlbnQua2V5ID09PSBMU19DT05GSUdfTkFNRSArIGtleSkpIHJlbmRlcigpO1xuICAgIH0sIHsgc2lnbmFsOiBsaXN0ZW5lcnMuc2lnbmFsIH0pO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgbGlzdGVuZXJzLmFib3J0KCk7XG4gICAgICAgIGRpYWxvZy5yZW1vdmUoKTtcbiAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaWFsb2cpO1xuICAgIGRpYWxvZy5zaG93TW9kYWwoKTtcbiAgICBjbG9zZS5mb2N1cygpO1xufVxuXG5mdW5jdGlvbiBtYWtlQnV0dG9uKGxhYmVsOiBzdHJpbmcsIG9uQ2xpY2s6ICgpID0+IHZvaWQpIHtcbiAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uJztcbiAgICBidXR0b24udGV4dENvbnRlbnQgPSBsYWJlbDtcbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrKTtcbiAgICByZXR1cm4gYnV0dG9uO1xufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgdHlwZSB7IENvbnRlc3REYXRhIH0gZnJvbSAnLi4vLi4vZ2FtZS10eXBlcyc7XG5pbXBvcnQgeyBMU19DT05GSUdfTkFNRSwgbHNHZXQsIGxzU2V0IH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5pbXBvcnQgeyBvcGVuTWFya01hbmFnZXIsIHR5cGUgTWFyaywgdHlwZSBTYXZlZE1hcmsgfSBmcm9tICcuL21hcmtNYW5hZ2VyJztcblxuY29uc3QgREVGQVVMVF9DT0xPUlM6IFJlY29yZDxNYXJrLCBzdHJpbmc+ID0geyBmcmllbmQ6ICcjNDhhOWZmJywgZm9lOiAnI2ZmNjE3MycgfTtcbnR5cGUgU2F2ZWROYW1lID0gc3RyaW5nIHwgeyBuYW1lOiBzdHJpbmcgfTtcblxuZnVuY3Rpb24gcmVhZFJvd05hbWUoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICBjb25zdCB0ZXh0ID0gZWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpID8/ICcnO1xuICAgIGlmICghdGV4dC5lbmRzV2l0aCgnKycpKSByZXR1cm4gdGV4dDtcbiAgICBjb25zdCB3aXRob3V0U3RhbmRhbG9uZVBsdXMgPSB0ZXh0LnJlcGxhY2UoL1xccytcXCskLywgJycpO1xuICAgIGlmICghZWxlbWVudC5jaGlsZEVsZW1lbnRDb3VudCkgcmV0dXJuIHdpdGhvdXRTdGFuZGFsb25lUGx1cztcblxuICAgIGNvbnN0IGxhYmVsID0gZWxlbWVudC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBsYWJlbC5xdWVyeVNlbGVjdG9yQWxsKCcqJykpIHtcbiAgICAgICAgaWYgKGNoaWxkLnRleHRDb250ZW50Py50cmltKCkgPT09ICcrJykgY2hpbGQucmVtb3ZlKCk7XG4gICAgfVxuICAgIHJldHVybiBsYWJlbC50ZXh0Q29udGVudD8udHJpbSgpLnJlcGxhY2UoL1xccytcXCskLywgJycpIHx8IHdpdGhvdXRTdGFuZGFsb25lUGx1cztcbn1cblxuZnVuY3Rpb24gZGlzcGxheVNhdmVkTmFtZShzYXZlZD86IFNhdmVkTmFtZSkge1xuICAgIGlmICh0eXBlb2Ygc2F2ZWQgIT09ICdzdHJpbmcnKSByZXR1cm4gc2F2ZWQ/Lm5hbWU7XG4gICAgLy8gT2xkIGVudHJpZXMgc3RvcmVkIHRoZSBmdWxsIHJvdyB0ZXh0LCBpbmNsdWRpbmcgYSB0cmFpbGluZyBhZGQgY29udHJvbC5cbiAgICByZXR1cm4gc2F2ZWQudHJpbSgpLnJlcGxhY2UoLyhbXitdKVxcKyQvLCAnJDEnKS50cmltRW5kKCk7XG59XG5cbmV4cG9ydCBjbGFzcyBGcmllbmRBbmRGb2VzIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgbmFtZXMgPSBuZXcgTWFwPEhUTUxFbGVtZW50LCBzdHJpbmc+KCk7XG4gICAgcHJpdmF0ZSBtYXJrTWVudTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJvb3Q6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByb290U2VsZWN0b3IgPSAnJztcbiAgICBwcml2YXRlIGluTGVhZ3VlID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdmcmllbmRBbmRGb2VzJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkZyaWVuZHMgYW5kIGZvZXNcIiwgXCJSaWdodC1jbGljayBlYWNoIHBsYXllcidzIG5hbWUgdG8gYWRkIG9yIHJlbW92ZSBhIG1hcmsuIE1hbmFnZSBzYXZlZCBtYXJrcyBiZWxvdy5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdsZWFndWUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkluIGxlYWd1ZXNcIiwgXCJTaG93IG1hcmtzIGFuZCBhbGxvdyBtYXJraW5nIGluIGxlYWd1ZSB0YWJsZXMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdjb250ZXN0cycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiSW4gY29udGVzdHNcIiwgXCJTaG93IG1hcmtzIGFuZCBhbGxvdyBtYXJraW5nIG9uIGNvbnRlc3QgbGVhZGVyYm9hcmRzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHsgbmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hIH0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIFsnL2xlYWd1ZXMuaHRtbCcsICcvYWN0aXZpdGllcy5odG1sJ10uaW5jbHVkZXMoY3VycmVudFBhZ2UpO1xuICAgIH1cblxuICAgIHJlYWRTZXR0aW5nKGtleTogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gbHNHZXQoa2V5KTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlYWRNYXJrcygpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgICAgIGNvbnN0IHN0b3JlZCA9IHRoaXMucmVhZFNldHRpbmcoJ1BsYXllck1hcmtzJyk7XG4gICAgICAgIGlmIChzdG9yZWQgJiYgdHlwZW9mIHN0b3JlZCA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoc3RvcmVkKSkgcmV0dXJuIHN0b3JlZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAgICAgICBjb25zdCBtYXJrczogUmVjb3JkPHN0cmluZywgTWFyaz4gPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCBtYXJrXSBvZiBbWydGcmllbmRMaXN0JywgJ2ZyaWVuZCddLCBbJ0ZvZUxpc3QnLCAnZm9lJ11dIGFzIGNvbnN0KSB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gdGhpcy5yZWFkU2V0dGluZyhrZXkpO1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3QpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBpZCBvZiBsaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKC9eWzEtOV1cXGQqJC8udGVzdChTdHJpbmcoaWQpKSkgbWFya3NbU3RyaW5nKGlkKV0gPSBtYXJrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXJrcztcbiAgICB9XG5cbiAgICByZWFkQ29sb3JzKCk6IFJlY29yZDxNYXJrLCBzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgc2F2ZWQgPSB0aGlzLnJlYWRTZXR0aW5nKCdQbGF5ZXJNYXJrQ29sb3JzJykgYXMgUGFydGlhbDxSZWNvcmQ8TWFyaywgdW5rbm93bj4+IHwgbnVsbDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZyaWVuZDogdHlwZW9mIHNhdmVkPy5mcmllbmQgPT09ICdzdHJpbmcnICYmIC9eI1tcXGRhLWZdezZ9JC9pLnRlc3Qoc2F2ZWQuZnJpZW5kKSA/IHNhdmVkLmZyaWVuZCA6IERFRkFVTFRfQ09MT1JTLmZyaWVuZCxcbiAgICAgICAgICAgIGZvZTogdHlwZW9mIHNhdmVkPy5mb2UgPT09ICdzdHJpbmcnICYmIC9eI1tcXGRhLWZdezZ9JC9pLnRlc3Qoc2F2ZWQuZm9lKSA/IHNhdmVkLmZvZSA6IERFRkFVTFRfQ09MT1JTLmZvZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJlYWRTYXZlZE5hbWVzKCk6IFJlY29yZDxzdHJpbmcsIFNhdmVkTmFtZT4ge1xuICAgICAgICBjb25zdCBzYXZlZCA9IHRoaXMucmVhZFNldHRpbmcoJ1BsYXllck1hcmtOYW1lcycpO1xuICAgICAgICBpZiAoIXNhdmVkIHx8IHR5cGVvZiBzYXZlZCAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShzYXZlZCkpIHJldHVybiB7fTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyhzYXZlZCkuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIFtzdHJpbmcsIFNhdmVkTmFtZV0gPT4ge1xuICAgICAgICAgICAgY29uc3QgWywgdmFsdWVdID0gZW50cnk7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCBCb29sZWFuKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlLm5hbWUgPT09ICdzdHJpbmcnKTtcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIHNhdmVOYW1lcyhuYW1lczogUmVjb3JkPHN0cmluZywgU2F2ZWROYW1lPikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbHNTZXQoJ1BsYXllck1hcmtOYW1lcycsIG5hbWVzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3QgcmVtZW1iZXIgbWFya2VkIHBsYXllciBuYW1lczonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlTWFyayhpZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IG1hcmtzID0gdGhpcy5yZWFkTWFya3MoKTtcbiAgICAgICAgZGVsZXRlIG1hcmtzW2lkXTtcbiAgICAgICAgaWYgKCF0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrcycsIG1hcmtzKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBuYW1lcyA9IHRoaXMucmVhZFNhdmVkTmFtZXMoKTtcbiAgICAgICAgaWYgKGlkIGluIG5hbWVzKSB7XG4gICAgICAgICAgICBkZWxldGUgbmFtZXNbaWRdO1xuICAgICAgICAgICAgdGhpcy5zYXZlTmFtZXMobmFtZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJlYWRTYXZlZE1hcmtzKCkge1xuICAgICAgICBjb25zdCBuYW1lcyA9IHRoaXMucmVhZFNhdmVkTmFtZXMoKTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKHRoaXMucmVhZE1hcmtzKCkpLmZsYXRNYXA8U2F2ZWRNYXJrPigoW2lkLCBtYXJrXSkgPT5cbiAgICAgICAgICAgIC9eWzEtOV1cXGQqJC8udGVzdChpZCkgJiYgKG1hcmsgPT09ICdmcmllbmQnIHx8IG1hcmsgPT09ICdmb2UnKVxuICAgICAgICAgICAgICAgID8gW3sgaWQsIG5hbWU6IGRpc3BsYXlTYXZlZE5hbWUobmFtZXNbaWRdKSwgbWFyayB9XVxuICAgICAgICAgICAgICAgIDogW10pO1xuICAgIH1cblxuICAgIHNhdmVTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbHNTZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICBhbGVydCgnSmFydmlzIGNvdWxkIG5vdCBzYXZlIHlvdXIgRnJpZW5kcyBhbmQgRm9lcyBzZXR0aW5ncy4nKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluc3RhbGxTZXR0aW5ncygpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRQYWdlICE9PSAnL2hvbWUuaHRtbCcpIHJldHVybjtcblxuICAgICAgICBjb25zdCBzZWxlY3RvciA9ICcuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZ1tyZWw9XCJKQVJWSVNfZnJpZW5kQW5kRm9lc1wiXSAuc3ViLXNldHRpbmdzJztcbiAgICAgICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICghc2V0dGluZ3MgfHwgc2V0dGluZ3MucXVlcnlTZWxlY3RvcignLmphcnZpcy1tYXJrLWNvbG9yJykpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgaW5wdXRzID0gbmV3IE1hcDxNYXJrLCBIVE1MSW5wdXRFbGVtZW50PigpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBbbWFyaywgdGV4dF0gb2YgW1snZnJpZW5kJywgJ0ZyaWVuZCBuYW1lIGNvbG9yJ10sIFsnZm9lJywgJ0ZvZSBuYW1lIGNvbG9yJ11dIGFzIGNvbnN0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1jb2xvcic7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgICAgICBpbnB1dC50eXBlID0gJ2NvbG9yJztcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHRoaXMucmVhZENvbG9ycygpW21hcmtdO1xuICAgICAgICAgICAgICAgIGlucHV0cy5zZXQobWFyaywgaW5wdXQpO1xuICAgICAgICAgICAgICAgIGlucHV0LmRpc2FibGVkID0gIXNldHRpbmdzLmNsb3Nlc3QoJy5jb25maWctc2V0dGluZycpPy5jbGFzc0xpc3QuY29udGFpbnMoJ2VuYWJsZWQnKTtcbiAgICAgICAgICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9ycyA9IHRoaXMucmVhZENvbG9ycygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtDb2xvcnMnLCB7IC4uLmNvbG9ycywgW21hcmtdOiBpbnB1dC52YWx1ZSB9KSkgaW5wdXQudmFsdWUgPSBjb2xvcnNbbWFya107XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbGFiZWwuYXBwZW5kKHRpdGxlLCBpbnB1dCk7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYXBwZW5kQ2hpbGQobGFiZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVzZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIHJlc2V0LnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIHJlc2V0LmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgICAgICAgICAgcmVzZXQudGV4dENvbnRlbnQgPSAnUmVzZXQgY29sb3JzJztcbiAgICAgICAgICAgIHJlc2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya0NvbG9ycycsIHt9KSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW21hcmssIGlucHV0XSBvZiBpbnB1dHMpIGlucHV0LnZhbHVlID0gREVGQVVMVF9DT0xPUlNbbWFya107XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IG1hbmFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgbWFuYWdlLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIG1hbmFnZS5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uJztcbiAgICAgICAgICAgIG1hbmFnZS50ZXh0Q29udGVudCA9ICdNYW5hZ2UgbWFya3MnO1xuICAgICAgICAgICAgbWFuYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gb3Blbk1hcmtNYW5hZ2VyKFxuICAgICAgICAgICAgICAgICgpID0+IHRoaXMucmVhZFNhdmVkTWFya3MoKSxcbiAgICAgICAgICAgICAgICBpZCA9PiB0aGlzLnJlbW92ZU1hcmsoaWQpLFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrcycsIHt9KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVOYW1lcyh7fSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgYWN0aW9ucy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstc2V0dGluZy1hY3Rpb25zJztcbiAgICAgICAgICAgIGFjdGlvbnMuYXBwZW5kKHJlc2V0LCBtYW5hZ2UpO1xuICAgICAgICAgICAgc2V0dGluZ3MuYXBwZW5kQ2hpbGQoYWN0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNsb3NlTWFya01lbnUoKSB7XG4gICAgICAgIHRoaXMubWFya01lbnU/LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLm1hcmtNZW51ID0gbnVsbDtcbiAgICB9XG5cbiAgICBvcGVuTWFya01lbnUoZXZlbnQ6IE1vdXNlRXZlbnQsIG5hbWU6IEhUTUxFbGVtZW50LCBpZDogc3RyaW5nKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcblxuICAgICAgICBjb25zdCBtZW51ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG1lbnUuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLW1lbnUnO1xuICAgICAgICBtZW51LnNldEF0dHJpYnV0ZSgncm9sZScsICdncm91cCcpO1xuICAgICAgICBtZW51LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdNYXJrIHBsYXllcicpO1xuICAgICAgICBjb25zdCBhZGRBY3Rpb24gPSAodGV4dDogc3RyaW5nLCBhY3Q6ICgpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUuaXNDb25uZWN0ZWQgJiYgdGhpcy5uYW1lcy5nZXQobmFtZSkgPT09IGlkKSBhY3QoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbWVudS5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB9O1xuICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCB0ZXh0XSBvZiBbWydmcmllbmQnLCAnTWFyayBhcyBmcmllbmQnXSwgWydmb2UnLCAnTWFyayBhcyBmb2UnXV0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgIGFkZEFjdGlvbih0ZXh0LCAoKSA9PiB0aGlzLmFwcGx5TWFyayhpZCwgbWFyaykpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lLmRhdGFzZXQuamFydmlzTWFyaykgYWRkQWN0aW9uKCdSZW1vdmUgdGhpcyBwbGF5ZXLigJlzIG1hcmsnLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZW1vdmVNYXJrKGlkKSkgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBtZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xpY2sgPT4gY2xpY2suc3RvcFByb3BhZ2F0aW9uKCkpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1lbnUpO1xuICAgICAgICB0aGlzLm1hcmtNZW51ID0gbWVudTtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBuYW1lLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCB4ID0gZXZlbnQuY2xpZW50WCB8fCBib3VuZHMubGVmdDtcbiAgICAgICAgY29uc3QgeSA9IGV2ZW50LmNsaWVudFkgfHwgYm91bmRzLmJvdHRvbTtcbiAgICAgICAgbWVudS5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oeCwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIC0gbWVudS5vZmZzZXRXaWR0aCkpICsgJ3B4JztcbiAgICAgICAgbWVudS5zdHlsZS50b3AgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih5LCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IC0gbWVudS5vZmZzZXRIZWlnaHQpKSArICdweCc7XG4gICAgICAgIG1lbnUucXVlcnlTZWxlY3RvcignYnV0dG9uJyk/LmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBnZXRDb250ZXN0TmFtZXMocm9vdDogSFRNTEVsZW1lbnQsIGNvbnRlc3RzOiBDb250ZXN0RGF0YVtdKSB7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gbmV3IE1hcDxIVE1MRWxlbWVudCwgc3RyaW5nPigpO1xuICAgICAgICBjb25zdCBieUNvbnRlc3QgPSBuZXcgTWFwPHN0cmluZywgTWFwPHN0cmluZywgU2V0PHN0cmluZz4+PigpO1xuXG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHJvb3QucXVlcnlTZWxlY3RvckFsbDxIVE1MVGFibGVSb3dFbGVtZW50PignLmxlYWRUYWJsZSB0cicpKSB7XG4gICAgICAgICAgICBjb25zdCBjZWxsID0gcm93LmNlbGxzPy5bMV07XG4gICAgICAgICAgICBpZiAoIWNlbGwgfHwgY2VsbC5sb2NhbE5hbWUgIT09ICd0ZCcpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGNlbGwucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5uaWNrbmFtZScpIHx8IGNlbGw7XG4gICAgICAgICAgICBsZXQgaWQgPSByb3cuZ2V0QXR0cmlidXRlKCdzb3J0aW5nX2lkJykgfHwgbmFtZS5nZXRBdHRyaWJ1dGUoJ2lkLW1lbWJlcicpIHx8XG4gICAgICAgICAgICAgICAgbmFtZS5xdWVyeVNlbGVjdG9yKCdbaWQtbWVtYmVyXScpPy5nZXRBdHRyaWJ1dGUoJ2lkLW1lbWJlcicpO1xuICAgICAgICAgICAgY29uc3QgY29udGVzdElkID0gcm93LmNsb3Nlc3QoJ1tpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmIChjb250ZXN0SWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgYnlOYW1lID0gYnlDb250ZXN0LmdldChjb250ZXN0SWQpO1xuICAgICAgICAgICAgICAgIGlmICghYnlOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRpY2lwYW50cyA9IGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBTdHJpbmcoY29udGVzdC5pZF9jb250ZXN0KSA9PT0gY29udGVzdElkKT8ucGFydGljaXBhbnRzO1xuICAgICAgICAgICAgICAgICAgICBieU5hbWUgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgeyBuaWNrbmFtZSwgaWRfbWVtYmVyIH0gb2YgT2JqZWN0LnZhbHVlcyhwYXJ0aWNpcGFudHMgfHwge30pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuaWNrbmFtZUtleSA9IFN0cmluZyhuaWNrbmFtZSA/PyAnJykudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFuaWNrbmFtZUtleSB8fCAhL15bMS05XVxcZCokLy50ZXN0KFN0cmluZyhpZF9tZW1iZXIpKSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYnlOYW1lLmdldChuaWNrbmFtZUtleSkgfHwgbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVzLmFkZChTdHJpbmcoaWRfbWVtYmVyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBieU5hbWUuc2V0KG5pY2tuYW1lS2V5LCBtYXRjaGVzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBieUNvbnRlc3Quc2V0KGNvbnRlc3RJZCwgYnlOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGJ5TmFtZS5nZXQocmVhZFJvd05hbWUobmFtZSkpO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzICYmICFtYXRjaGVzLmhhcyhpZCA/PyAnJykpIGlkID0gbWF0Y2hlcy5zaXplID09PSAxID8gbWF0Y2hlcy52YWx1ZXMoKS5uZXh0KCkudmFsdWUgOiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkICYmIC9eWzEtOV1cXGQqJC8udGVzdChpZCkpIG5hbWVzLnNldChuYW1lLCBpZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5hbWVzO1xuICAgIH1cblxuICAgIHJlZnJlc2goKSB7XG4gICAgICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50Pih0aGlzLnJvb3RTZWxlY3Rvcik7XG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3Q7XG4gICAgICAgIGNvbnN0IGNvbnRlc3RzID0gdGhpcy5pbkxlYWd1ZSA/IFtdIDogW1xuICAgICAgICAgICAgLi4uT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmFjdGl2ZSA/PyB7fSksXG4gICAgICAgICAgICAuLi5PYmplY3QudmFsdWVzKHdpbmRvdy5jb250ZXN0cz8uZmluaXNoZWQgPz8ge30pXG4gICAgICAgIF0uZmlsdGVyKGNvbnRlc3QgPT4gY29udGVzdD8uaWRfY29udGVzdCAhPSBudWxsKTtcbiAgICAgICAgY29uc3QgbmFtZXMgPSAhcm9vdCA/IG5ldyBNYXA8SFRNTEVsZW1lbnQsIHN0cmluZz4oKSA6IHRoaXMuaW5MZWFndWVcbiAgICAgICAgICAgID8gbmV3IE1hcChBcnJheS5mcm9tKHJvb3QucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5uaWNrbmFtZVtpZC1tZW1iZXJdJyksIG5hbWUgPT4gW25hbWUsIG5hbWUuZ2V0QXR0cmlidXRlKCdpZC1tZW1iZXInKV0gYXMgY29uc3QpXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyByZWFkb25seSBbSFRNTEVsZW1lbnQsIHN0cmluZ10gPT4gISFlbnRyeVsxXSAmJiAvXlsxLTldXFxkKiQvLnRlc3QoZW50cnlbMV0pKSlcbiAgICAgICAgICAgIDogdGhpcy5nZXRDb250ZXN0TmFtZXMocm9vdCwgY29udGVzdHMpO1xuXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiB0aGlzLm5hbWVzLmtleXMoKSkge1xuICAgICAgICAgICAgaWYgKG5hbWVzLmhhcyhuYW1lKSkgY29udGludWU7XG4gICAgICAgICAgICBkZWxldGUgbmFtZS5kYXRhc2V0LmphcnZpc1BsYXllcjtcbiAgICAgICAgICAgIGRlbGV0ZSBuYW1lLmRhdGFzZXQuamFydmlzTWFyaztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubmFtZXMgPSBuYW1lcztcbiAgICAgICAgaWYgKCFyb290KSByZXR1cm47XG4gICAgICAgIGNvbnN0IG1hcmtzID0gdGhpcy5yZWFkTWFya3MoKTtcbiAgICAgICAgY29uc3Qgc2F2ZWROYW1lcyA9IHRoaXMucmVhZFNhdmVkTmFtZXMoKTtcbiAgICAgICAgY29uc3Qgcm9zdGVyTmFtZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgbGV0IG5hbWVzQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICBjb25zdCByZW1lbWJlck5hbWUgPSAoaWQ6IHN0cmluZywgdGV4dD86IHN0cmluZyB8IG51bGwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlOYW1lID0gdHlwZW9mIHRleHQgPT09ICdzdHJpbmcnID8gdGV4dC50cmltKCkgOiAnJztcbiAgICAgICAgICAgIGlmICghZGlzcGxheU5hbWUgfHwgKG1hcmtzW2lkXSAhPT0gJ2ZyaWVuZCcgJiYgbWFya3NbaWRdICE9PSAnZm9lJykpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzID0gc2F2ZWROYW1lc1tpZF07XG4gICAgICAgICAgICBpZiAodHlwZW9mIHByZXZpb3VzID09PSAnc3RyaW5nJyB8fCBwcmV2aW91cz8ubmFtZSAhPT0gZGlzcGxheU5hbWUpIHtcbiAgICAgICAgICAgICAgICBzYXZlZE5hbWVzW2lkXSA9IHsgbmFtZTogZGlzcGxheU5hbWUgfTtcbiAgICAgICAgICAgICAgICBuYW1lc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmluTGVhZ3VlKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgcGxheWVyLCBuaWNrbmFtZSB9IG9mIHdpbmRvdy5vcHBvbmVudHNfbGlzdCA/PyBbXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gU3RyaW5nKHBsYXllcj8uaWRfZmlnaHRlcik7XG4gICAgICAgICAgICAgICAgaWYgKHJlbWVtYmVyTmFtZShpZCwgbmlja25hbWUpKSByb3N0ZXJOYW1lcy5hZGQoaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gUHJlZmVyIHRoZSBhY3RpdmUgcm9zdGVyIGlmIGEgcGxheWVyIGFwcGVhcnMgaW4gYm90aCBvbGQgYW5kIGN1cnJlbnQgY29udGVzdHMuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNvbnRlc3Qgb2YgY29udGVzdHMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHsgaWRfbWVtYmVyLCBuaWNrbmFtZSB9IG9mIE9iamVjdC52YWx1ZXMoY29udGVzdC5wYXJ0aWNpcGFudHMgPz8ge30pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gU3RyaW5nKGlkX21lbWJlcik7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcm9zdGVyTmFtZXMuaGFzKGlkKSAmJiByZW1lbWJlck5hbWUoaWQsIG5pY2tuYW1lKSkgcm9zdGVyTmFtZXMuYWRkKGlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29sb3JzID0gdGhpcy5yZWFkQ29sb3JzKCk7XG4gICAgICAgIGZvciAoY29uc3QgW21hcmssIGNvbG9yXSBvZiBPYmplY3QuZW50cmllcyhjb2xvcnMpKSB7XG4gICAgICAgICAgICBjb25zdCBwcm9wZXJ0eSA9ICctLWphcnZpcy0nICsgbWFyayArICctY29sb3InO1xuICAgICAgICAgICAgaWYgKHJvb3Quc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eSkgIT09IGNvbG9yKSByb290LnN0eWxlLnNldFByb3BlcnR5KHByb3BlcnR5LCBjb2xvcik7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgaWRdIG9mIG5hbWVzKSB7XG4gICAgICAgICAgICBpZiAobmFtZS5kYXRhc2V0LmphcnZpc1BsYXllciAhPT0gaWQpIG5hbWUuZGF0YXNldC5qYXJ2aXNQbGF5ZXIgPSBpZDtcbiAgICAgICAgICAgIGNvbnN0IG1hcmsgPSBtYXJrc1tpZF07XG4gICAgICAgICAgICBpZiAobWFyayA9PT0gJ2ZyaWVuZCcgfHwgbWFyayA9PT0gJ2ZvZScpIHtcbiAgICAgICAgICAgICAgICBpZiAobmFtZS5kYXRhc2V0LmphcnZpc01hcmsgIT09IG1hcmspIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrID0gbWFyaztcbiAgICAgICAgICAgICAgICBpZiAoIXJvc3Rlck5hbWVzLmhhcyhpZCkpIHJlbWVtYmVyTmFtZShpZCwgcmVhZFJvd05hbWUobmFtZSkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuYW1lLmRhdGFzZXQuamFydmlzTWFyaykge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBuYW1lLmRhdGFzZXQuamFydmlzTWFyaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZXNDaGFuZ2VkKSB0aGlzLnNhdmVOYW1lcyhzYXZlZE5hbWVzKTtcbiAgICB9XG5cbiAgICBhcHBseU1hcmsoaWQ6IHN0cmluZywgbWFyazogTWFyaykge1xuICAgICAgICBjb25zdCBtYXJrcyA9IHRoaXMucmVhZE1hcmtzKCk7XG4gICAgICAgIG1hcmtzW2lkXSA9IG1hcms7XG5cbiAgICAgICAgaWYgKHRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtzJywgbWFya3MpKSB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBoYW5kbGVNYXJrTWVudShldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSAmJiB0aGlzLm1hcmtNZW51Py5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm47XG4gICAgICAgIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuICAgICAgICBpZiAoZXZlbnQudHlwZSAhPT0gJ2NvbnRleHRtZW51JyAmJiAhZXZlbnQuYWx0S2V5KSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgbmFtZSA9IGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgPyBldmVudC50YXJnZXQuY2xvc2VzdDxIVE1MRWxlbWVudD4oJ1tkYXRhLWphcnZpcy1wbGF5ZXJdJykgOiBudWxsO1xuICAgICAgICBpZiAoIW5hbWUpIHJldHVybjtcbiAgICAgICAgY29uc3QgaWQgPSB0aGlzLm5hbWVzLmdldChuYW1lKTtcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLm9wZW5NYXJrTWVudShldmVudCwgbmFtZSwgaWQpO1xuICAgIH1cblxuICAgIHJ1bih7IGxlYWd1ZSwgY29udGVzdHMgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHRoaXMuaW5MZWFndWUgPSBjdXJyZW50UGFnZSA9PT0gJy9sZWFndWVzLmh0bWwnO1xuICAgICAgICBpZiAodGhpcy5pbkxlYWd1ZSA/ICFsZWFndWUgOiAhY29udGVzdHMpIHJldHVybjtcblxuICAgICAgICB0aGlzLnJvb3RTZWxlY3RvciA9IHRoaXMuaW5MZWFndWUgPyAnLmxlYWd1ZV90YWJsZScgOiAnI2NvbnRlc3RzIC5yaWdodF9wYXJ0JztcbiAgICAgICAgY29uc3QgaGFuZGxlTWFya01lbnUgPSAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHRoaXMuaGFuZGxlTWFya01lbnUoZXZlbnQpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZU1hcmtNZW51LCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBoYW5kbGVNYXJrTWVudSwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5ICE9PSAnRXNjYXBlJyB8fCAhdGhpcy5tYXJrTWVudSkgcmV0dXJuO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmICghZXZlbnQua2V5IHx8IFsnUGxheWVyTWFya3MnLCAnUGxheWVyTWFya0NvbG9ycycsICdGcmllbmRMaXN0JywgJ0ZvZUxpc3QnXVxuICAgICAgICAgICAgICAgIC5zb21lKGtleSA9PiBldmVudC5rZXkgPT09IExTX0NPTkZJR19OQU1FICsga2V5KSkgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobXV0YXRpb25zID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMucm9vdFNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChyb290ICE9PSB0aGlzLnJvb3QgfHwgKHJvb3QgJiYgbXV0YXRpb25zLnNvbWUoKHsgdGFyZ2V0IH0pID0+IHJvb3QuY29udGFpbnModGFyZ2V0KSkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgIGNoYXJhY3RlckRhdGE6IHRydWUsXG4gICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydzb3J0aW5nX2lkJywgJ2lkLW1lbWJlcicsICdpZF9jb250ZXN0J11cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgbHNHZXQsIGxzU2V0IH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5cbmV4cG9ydCB0eXBlIENvbnRlc3RLaW5kID0gJ2RhaWx5JyB8ICdldmVudCc7XG5leHBvcnQgdHlwZSBDb250ZXN0UmFuayA9ICd0b3AnIHwgJ21pbmUnO1xuXG5jb25zdCBDT05URVNUX0tJTkRTID0gW1snZGFpbHknLCAnRGFpbHknXSwgWydldmVudCcsICdFdmVudCddXSBhcyBjb25zdDtcbmNvbnN0IENPTlRFU1RfRVZFTlRTID0gW1snYW55JywgJ0FueSddLCBbJ2NiYycsICdDYkMnXSwgWydjY2MnLCAnQ0NDJ10sIFsnbGMnLCAnTEMnXV0gYXMgY29uc3Q7XG5jb25zdCBDT05URVNUX1JBTktTID0gW1sndG9wJywgJ1RvcCddLCBbJ21pbmUnLCAnTXkgcmFuayddXSBhcyBjb25zdDtcblxuZXhwb3J0IHR5cGUgQ29udGVzdEV2ZW50ID0gRXhjbHVkZTwodHlwZW9mIENPTlRFU1RfRVZFTlRTKVtudW1iZXJdWzBdLCAnYW55Jz47XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQ29udGVzdFNldHRpbmcoa2V5OiBzdHJpbmcpOiB1bmtub3duIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gbHNHZXQoa2V5KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZENvbnRlc3REZWZhdWx0cygpIHtcbiAgICBjb25zdCBraW5kOiBDb250ZXN0S2luZCA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdEtpbmQnKSA9PT0gJ2RhaWx5JyA/ICdkYWlseScgOiAnZXZlbnQnO1xuICAgIGNvbnN0IHNhdmVkRXZlbnQgPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RFdmVudCcpO1xuICAgIGNvbnN0IGV2ZW50ID0gQ09OVEVTVF9FVkVOVFMuZmluZCgoW3ZhbHVlXSkgPT4gdmFsdWUgPT09IHNhdmVkRXZlbnQpPy5bMF0gPz8gJ2FueSc7XG4gICAgY29uc3QgcmFuazogQ29udGVzdFJhbmsgPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RSYW5rU3RhcnQnKSA9PT0gJ3RvcCcgPyAndG9wJyA6ICdtaW5lJztcbiAgICByZXR1cm4geyBraW5kLCBldmVudCwgcmFuayB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZFBpbm5lZFJhbmsoaWQ6IHN0cmluZywgZmFsbGJhY2s6IENvbnRlc3RSYW5rKTogQ29udGVzdFJhbmsge1xuICAgIGNvbnN0IHNhdmVkID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0UGlubmVkUmFuaycpO1xuICAgIGlmIChzYXZlZCAmJiB0eXBlb2Ygc2F2ZWQgPT09ICdvYmplY3QnICYmICdpZCcgaW4gc2F2ZWQgJiYgc2F2ZWQuaWQgPT09IGlkICYmICdyYW5rJyBpbiBzYXZlZCkge1xuICAgICAgICBpZiAoc2F2ZWQucmFuayA9PT0gJ21pbmUnIHx8IHNhdmVkLnJhbmsgPT09ICd0b3AnKSByZXR1cm4gc2F2ZWQucmFuaztcbiAgICB9XG4gICAgcmV0dXJuIGZhbGxiYWNrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVJhbmtDaG9pY2UobGFiZWw6IHN0cmluZywgc2VsZWN0OiAocmFuazogQ29udGVzdFJhbmspID0+IHZvaWQpIHtcbiAgICByZXR1cm4gbWFrZUNob2ljZShsYWJlbCwgQ09OVEVTVF9SQU5LUywgc2VsZWN0KTtcbn1cblxuZnVuY3Rpb24gbWFrZUNob2ljZTxUIGV4dGVuZHMgc3RyaW5nPihsYWJlbDogc3RyaW5nLCBvcHRpb25zOiBSZWFkb25seUFycmF5PHJlYWRvbmx5IFtULCBzdHJpbmddPiwgc2VsZWN0OiAodmFsdWU6IFQpID0+IHZvaWQpIHtcbiAgICBjb25zdCBncm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBncm91cC5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3QtY2hvaWNlJztcbiAgICBncm91cC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnZ3JvdXAnKTtcbiAgICBncm91cC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBsYWJlbCk7XG4gICAgZ3JvdXAuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICBmb3IgKGNvbnN0IFt2YWx1ZSwgdGV4dF0gb2Ygb3B0aW9ucykge1xuICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgYnV0dG9uLmRhdGFzZXQuY29udGVzdENob2ljZSA9IHZhbHVlO1xuICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHNlbGVjdCh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBncm91cC5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgIH1cbiAgICByZXR1cm4gZ3JvdXA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RDb250ZXN0Q2hvaWNlKGdyb3VwOiBIVE1MRWxlbWVudCwgdmFsdWU6IHN0cmluZykge1xuICAgIGZvciAoY29uc3QgYnV0dG9uIG9mIGdyb3VwLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpKSB7XG4gICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIFN0cmluZyhidXR0b24uZGF0YXNldC5jb250ZXN0Q2hvaWNlID09PSB2YWx1ZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxDb250ZXN0U2V0dGluZ3MoKSB7XG4gICAgaWYgKGN1cnJlbnRQYWdlICE9PSAnL2hvbWUuaHRtbCcpIHJldHVybjtcblxuICAgIGNvbnN0IHNlbGVjdG9yID0gJy5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmNvbmZpZy1zZXR0aW5nW3JlbD1cIkpBUlZJU19jb250ZXN0U3RhcnRcIl0nO1xuICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICBpZiAoIWNhcmQgfHwgY2FyZC5xdWVyeVNlbGVjdG9yKCcuamFydmlzLWNvbnRlc3Qtc2V0dGluZ3MnKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGZpZWxkc2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZmllbGRzZXQnKTtcbiAgICAgICAgZmllbGRzZXQuY2xhc3NOYW1lID0gJ2phcnZpcy1jb250ZXN0LXNldHRpbmdzJztcbiAgICAgICAgZmllbGRzZXQuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ0NvbnRlc3Qgc3RhcnR1cCBkZWZhdWx0cycpO1xuICAgICAgICBjb25zdCBzYXZlID0gKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBncm91cDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbHNTZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShncm91cCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGNvbnRlc3QgZGVmYXVsdDonLCBlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXZlbnRMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBldmVudExhYmVsLmlubmVySFRNTCA9IHNldHRpbmdIZWxwKCdFdmVudCB0eXBlJywgJ1ByZWZlciBDYkMgKEN1bWJhY2sgQ29udGVzdCksIENDQyAoQ3JhenkgQ3VtYmFjayBDb250ZXN0KSwgb3IgTEMgKExlZ2VuZGFyeSBDb250ZXN0KSB3aGVuIGFjdGl2ZS4gQW55IG9wZW5zIHRoZSBib3R0b20gYWN0aXZlIGNvbnRlc3QsIGFzIGRvZXMgYW4gdW5hdmFpbGFibGUgZXZlbnQgdHlwZS4nKTtcbiAgICAgICAgY29uc3QgZXZlbnRzID0gbWFrZUNob2ljZSgnRXZlbnQgdHlwZScsIENPTlRFU1RfRVZFTlRTLCB2YWx1ZSA9PiBzYXZlKCdDb250ZXN0RXZlbnQnLCB2YWx1ZSwgZXZlbnRzKSk7XG4gICAgICAgIGNvbnN0IHNob3dFdmVudHMgPSAoa2luZDogQ29udGVzdEtpbmQpID0+IGV2ZW50TGFiZWwuaGlkZGVuID0gZXZlbnRzLmhpZGRlbiA9IGtpbmQgPT09ICdkYWlseSc7XG4gICAgICAgIGNvbnN0IGtpbmRzID0gbWFrZUNob2ljZSgnUHJlZmVycmVkIGNvbnRlc3QnLCBDT05URVNUX0tJTkRTLCB2YWx1ZSA9PiB7XG4gICAgICAgICAgICBpZiAoc2F2ZSgnQ29udGVzdEtpbmQnLCB2YWx1ZSwga2luZHMpKSBzaG93RXZlbnRzKHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJhbmtzID0gbWFrZVJhbmtDaG9pY2UoJ0RlZmF1bHQgbGVhZGVyYm9hcmQgcG9zaXRpb24nLCB2YWx1ZSA9PiBzYXZlKCdDb250ZXN0UmFua1N0YXJ0JywgdmFsdWUsIHJhbmtzKSk7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRzID0gcmVhZENvbnRlc3REZWZhdWx0cygpO1xuICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGtpbmRzLCBkZWZhdWx0cy5raW5kKTtcbiAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShldmVudHMsIGRlZmF1bHRzLmV2ZW50KTtcbiAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShyYW5rcywgZGVmYXVsdHMucmFuayk7XG4gICAgICAgIHNob3dFdmVudHMoZGVmYXVsdHMua2luZCk7XG5cbiAgICAgICAgY29uc3Qga2luZExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGtpbmRMYWJlbC5pbm5lckhUTUwgPSBzZXR0aW5nSGVscCgnUHJlZmVycmVkIGNvbnRlc3QnLCAnRGFpbHkgb3BlbnMgdGhlIGZpcnN0IGFjdGl2ZSBkYWlseSBjb250ZXN0LiBFdmVudCBjYW4gcHJlZmVyIGFuIGV2ZW50IHR5cGUgb3IgZm9sbG93IHRoZSBnYW1lIGFuZCBvcGVuIHRoZSBib3R0b20gYWN0aXZlIGNvbnRlc3QuJyk7XG4gICAgICAgIGNvbnN0IHJhbmtMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICByYW5rTGFiZWwuaW5uZXJIVE1MID0gc2V0dGluZ0hlbHAoJ0xlYWRlcmJvYXJkIHN0YXJ0JywgJ09wZW4gYXQgdGhlIHRvcCBvciBhdCB5b3VyIHJhbmsuIEEgc3RhcnJlZCBjb250ZXN0IGNhbiBoYXZlIGl0cyBvd24gcG9zaXRpb24uJyk7XG4gICAgICAgIGZpZWxkc2V0LmFwcGVuZChraW5kTGFiZWwsIGtpbmRzLCBldmVudExhYmVsLCBldmVudHMsIHJhbmtMYWJlbCwgcmFua3MpO1xuICAgICAgICBjb25zdCByZWZyZXNoRW5hYmxlZCA9ICgpID0+IGZpZWxkc2V0LmRpc2FibGVkID0gIWNhcmQuY2xhc3NMaXN0LmNvbnRhaW5zKCdlbmFibGVkJyk7XG4gICAgICAgIHJlZnJlc2hFbmFibGVkKCk7XG4gICAgICAgIG5ldyBNdXRhdGlvbk9ic2VydmVyKHJlZnJlc2hFbmFibGVkKS5vYnNlcnZlKGNhcmQsIHsgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10gfSk7XG4gICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoZmllbGRzZXQpO1xuICAgIH0pO1xufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlLCB0eXBlIE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgJCwgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCwgbHNSbSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgbWFrZVJhbmtDaG9pY2UsIHJlYWRDb250ZXN0RGVmYXVsdHMsIHJlYWRDb250ZXN0U2V0dGluZywgcmVhZFBpbm5lZFJhbmssIHNlbGVjdENvbnRlc3RDaG9pY2UsIHR5cGUgQ29udGVzdEV2ZW50LCB0eXBlIENvbnRlc3RLaW5kIH0gZnJvbSAnLi9jb250ZXN0UHJlZmVyZW5jZXMnO1xuXG50eXBlIENvbnRlc3RDYXRlZ29yeSA9IENvbnRlc3RLaW5kIHwgQ29udGVzdEV2ZW50O1xuXG5mdW5jdGlvbiBnZXRDb250ZXN0Q2F0ZWdvcnkoY2F0ZWdvcnk6IHN0cmluZyB8IHVuZGVmaW5lZCk6IENvbnRlc3RDYXRlZ29yeSB8IG51bGwge1xuICAgIHN3aXRjaCAoY2F0ZWdvcnk/LnRyaW0oKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1stIF0rL2csICdfJykpIHtcbiAgICAgICAgY2FzZSAnZGFpbHknOlxuICAgICAgICBjYXNlICdkYWlseV9jb250ZXN0JzogcmV0dXJuICdkYWlseSc7XG4gICAgICAgIGNhc2UgJ2N1bWJhY2snOlxuICAgICAgICBjYXNlICdjdW1iYWNrX2NvbnRlc3QnOlxuICAgICAgICBjYXNlICdjYmMnOiByZXR1cm4gJ2NiYyc7XG4gICAgICAgIGNhc2UgJ2NyYXp5X2N1bWJhY2snOlxuICAgICAgICBjYXNlICdjcmF6eV9jdW1iYWNrX2NvbnRlc3QnOlxuICAgICAgICBjYXNlICdjY2JjJzpcbiAgICAgICAgY2FzZSAnY2NjJzogcmV0dXJuICdjY2MnO1xuICAgICAgICBjYXNlICdsZWdlbmRhcnknOlxuICAgICAgICBjYXNlICdsZWdlbmRhcnlfY29udGVzdCc6XG4gICAgICAgIGNhc2UgJ2xjJzogcmV0dXJuICdsYyc7XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiBjYXRlZ29yeSA/ICdldmVudCcgOiBudWxsO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIENvbnRlc3RDYXJkIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIGNhcmQ6IEhUTUxFbGVtZW50O1xuICAgIGhlYWRlcjogSFRNTEVsZW1lbnQ7XG4gICAgdGl0bGU6IEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIGNhdGVnb3J5OiBDb250ZXN0Q2F0ZWdvcnkgfCBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJtQ29udGVzdFN0YXJ0dXBHdWFyZCgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBpZiAobG9jYXRpb24ucGF0aG5hbWUgIT09ICcvYWN0aXZpdGllcy5odG1sJyB8fCBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KCd0YWInKSAhPT0gJ2NvbnRlc3RzJykgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ0hIUGx1c1BsdXNDb25maWcnKSA/PyAnbnVsbCcpPy5KQVJWSVNfY29udGVzdFN0YXJ0ID09PSBmYWxzZSkgcmV0dXJuO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gS2VlcCBib3RoIHBhbmVzIG91dCBvZiB2aWV3IHVudGlsIHRoZSBjaG9zZW4gY29udGVzdCBhbmQgaXRzIGxlYWRlcmJvYXJkIGFyZSBwb3NpdGlvbmVkLlxuICAgIGNvbnN0IGd1YXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBndWFyZC5pZCA9ICdqYXJ2aXMtY29udGVzdC1zdGFydHVwJztcbiAgICBndWFyZC50ZXh0Q29udGVudCA9IGBcbiAgICAgICAgI2NvbnRlc3RzIC5sZWZ0X3BhcnQgLnNjcm9sbF9hcmVhLFxuICAgICAgICAjY29udGVzdHMgLnJpZ2h0X3BhcnQge1xuICAgICAgICAgICAgb3BhY2l0eTogMCAhaW1wb3J0YW50O1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogbm9uZSAhaW1wb3J0YW50O1xuICAgICAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgICAgIH1cbiAgICBgO1xuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICBpZiAoIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkgcmV0dXJuO1xuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ3VhcmQpO1xuICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgfSk7XG4gICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKGd1YXJkKTtcbiAgICBlbHNlIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQsIHsgY2hpbGRMaXN0OiB0cnVlIH0pO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgZ3VhcmQucmVtb3ZlKCk7XG4gICAgfSwgNDAwMCk7XG59XG5cbmV4cG9ydCBjbGFzcyBDb250ZXN0U3RhcnQgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBwcmVmZXJlbmNlID0gJyc7XG4gICAgcHJpdmF0ZSBzdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgIHByaXZhdGUgZGVmYXVsdHMgPSByZWFkQ29udGVzdERlZmF1bHRzKCk7XG4gICAgcHJpdmF0ZSBsaXN0OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmlnaHQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByZXN0b3JpbmdDYXJkOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmVwb3NpdGlvbjogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdG9wSnVtcDogKChmaW5pc2g/OiBib29sZWFuKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc3RvcFN3aXRjaFNjcm9sbCA9IGZhbHNlO1xuICAgIHByaXZhdGUgc3dpdGNoU2Nyb2xsOiB7IHJlc3RvcmU6ICgpID0+IHZvaWQ7IHN0b3A6ICgpID0+IHZvaWQgfSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgbGVhZGVyYm9hcmRQb3NpdGlvbnMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuICAgIHByaXZhdGUgb2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGxpc3RlbmVyczogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdjb250ZXN0U3RhcnQnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiQ29udGVzdCBzdGFydHVwXCIsIFwiT3BlbiB0aGUgcHJlZmVycmVkIGNvbnRlc3QgYW5kIGxlYWRlcmJvYXJkIHBvc2l0aW9uIG9uIGxvYWQuIEEgc3RhcnJlZCBjb250ZXN0IHRha2VzIHByaW9yaXR5LlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ25vU3dpdGNoU2Nyb2xsJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoJ1N0b3Agc2Nyb2xsaW5nIG9uIGNvbnRlc3Qgc3dpdGNoZXMnLCAnS2VlcCB0aGUgY29udGVzdCBsaXN0IGluIHBsYWNlIGFuZCByZW1lbWJlciBlYWNoIGxlYWRlcmJvYXJk4oCZcyBwb3NpdGlvbiB3aGVuIHlvdSBzd2l0Y2ggY2FyZHMuIFlvdSBjYW4gc3RpbGwgc2Nyb2xsIGVpdGhlciBwYW5lIGJ5IGhhbmQuJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoeyBuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWEgfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UgPT09ICcvYWN0aXZpdGllcy5odG1sJztcbiAgICB9XG5cbiAgICBnZXRDb250ZXN0cyhsaXN0OiBIVE1MRWxlbWVudCwgZmluaXNoZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz4pOiBDb250ZXN0Q2FyZFtdIHtcbiAgICAgICAgY29uc3QgYWN0aXZlID0gbmV3IE1hcChPYmplY3QudmFsdWVzKHdpbmRvdy5jb250ZXN0cz8uYWN0aXZlIHx8IHt9KVxuICAgICAgICAgICAgLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbClcbiAgICAgICAgICAgIC5tYXAoY29udGVzdCA9PiBbU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCksIGNvbnRlc3RdKSk7XG5cbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obGlzdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLmNvbnRlc3RbaWRfY29udGVzdF0nKSkuZmxhdE1hcChjYXJkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gY2FyZC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmICghaWQpIHJldHVybiBbXTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlc3QgPSBhY3RpdmUuZ2V0KGlkKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IGNhcmQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jb250ZXN0X2hlYWRlcicpO1xuICAgICAgICAgICAgaWYgKCFoZWFkZXIgfHwgZmluaXNoZWQuaGFzKGlkKSkgcmV0dXJuIFtdO1xuICAgICAgICAgICAgaWYgKCFjb250ZXN0ICYmICFoZWFkZXIubWF0Y2hlcygnLmluX3Byb2dyZXNzJykpIHJldHVybiBbXTtcblxuICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBoZWFkZXIucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jb250ZXN0X3RpdGxlLCAuY29udGVzdF9uYW1lLCBoMywgaDQsIGg1Jyk7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gdGl0bGUgJiYgQXJyYXkuZnJvbSh0aXRsZS5jaGlsZE5vZGVzKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIobm9kZSA9PiAhKG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSB8fCAhbm9kZS5tYXRjaGVzKCcuamFydmlzLWNvbnRlc3QtcGluLCAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpKVxuICAgICAgICAgICAgICAgIC5tYXAobm9kZSA9PiBub2RlLnRleHRDb250ZW50KS5qb2luKCcnKS50cmltKCk7XG4gICAgICAgICAgICBjb25zdCBjYXRlZ29yeSA9IGdldENvbnRlc3RDYXRlZ29yeShjb250ZXN0Py5jYXRlZ29yeV90eXBlKTtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIGlkLCBjYXJkLCBoZWFkZXIsIHRpdGxlLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIGxhYmVsOiBTdHJpbmcobmFtZSB8fCBjb250ZXN0Py5uYW1lIHx8IGNvbnRlc3Q/LnRpdGxlIHx8XG4gICAgICAgICAgICAgICAgICAgIChjYXRlZ29yeSA9PT0gJ2RhaWx5JyA/ICdEYWlseSBjb250ZXN0JyA6ICdDb250ZXN0JykpLnRyaW0oKVxuICAgICAgICAgICAgfV07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFRhcmdldChjb250ZXN0czogQ29udGVzdENhcmRbXSkge1xuICAgICAgICBpZiAodGhpcy5wcmVmZXJlbmNlKSByZXR1cm4gY29udGVzdHMuZmluZChjb250ZXN0ID0+IGNvbnRlc3QuaWQgPT09IHRoaXMucHJlZmVyZW5jZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuZGVmYXVsdHMua2luZCA9PT0gJ2V2ZW50Jykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGVmYXVsdHMuZXZlbnQgIT09ICdhbnknKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBbLi4uY29udGVzdHNdLnJldmVyc2UoKS5maW5kKGNvbnRlc3QgPT4gY29udGVzdC5jYXRlZ29yeSA9PT0gdGhpcy5kZWZhdWx0cy5ldmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50IHx8IGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHJldHVybiBldmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb250ZXN0cy5hdCgtMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmNhdGVnb3J5ID09PSAnZGFpbHknKSA/P1xuICAgICAgICAgICAgY29udGVzdHMuZmluZChjb250ZXN0ID0+IGNvbnRlc3QuY2F0ZWdvcnkgPT09IG51bGwpID8/IGNvbnRlc3RzWzBdO1xuICAgIH1cblxuICAgIGNsZWFyRXhwaXJlZFBpbihsaXN0OiBIVE1MRWxlbWVudCwgY29udGVzdHM6IENvbnRlc3RDYXJkW10sIGZpbmlzaGVkOiBSZWFkb25seVNldDxzdHJpbmc+KSB7XG4gICAgICAgIGlmICghdGhpcy5wcmVmZXJlbmNlIHx8IGNvbnRlc3RzLnNvbWUoKHsgaWQgfSkgPT4gaWQgPT09IHRoaXMucHJlZmVyZW5jZSkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBhY3RpdmUgPSB3aW5kb3cuY29udGVzdHM/LmFjdGl2ZTtcbiAgICAgICAgY29uc3QgbWlzc2luZyA9IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScgJiYgbGlzdC5xdWVyeVNlbGVjdG9yKCcuY29udGVzdF9oZWFkZXInKSAmJlxuICAgICAgICAgICAgYWN0aXZlICYmICFPYmplY3QudmFsdWVzKGFjdGl2ZSkuc29tZShjb250ZXN0ID0+IFN0cmluZyhjb250ZXN0Py5pZF9jb250ZXN0KSA9PT0gdGhpcy5wcmVmZXJlbmNlKTtcbiAgICAgICAgaWYgKCFmaW5pc2hlZC5oYXModGhpcy5wcmVmZXJlbmNlKSAmJiAhbWlzc2luZykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGV4cGlyZWRJZCA9IHRoaXMucHJlZmVyZW5jZTtcbiAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gJyc7XG4gICAgICAgIHRoaXMuc3RvcEp1bXA/LihmYWxzZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoU3RyaW5nKGxzR2V0KCdDb250ZXN0U3RhcnRJZCcpKSA9PT0gZXhwaXJlZElkKSBsc1JtKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBjbGVhciB0aGUgZXhwaXJlZCBjb250ZXN0IHByZWZlcmVuY2U6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZVBpbnMobGlzdDogSFRNTEVsZW1lbnQsIGNvbnRlc3RzOiBDb250ZXN0Q2FyZFtdKSB7XG4gICAgICAgIGNvbnN0IGhvc3RzID0gbmV3IFNldChjb250ZXN0cy5tYXAoKHsgdGl0bGUsIGhlYWRlciB9KSA9PiB0aXRsZSB8fCBoZWFkZXIpKTtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sIG9mIGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLmphcnZpcy1jb250ZXN0LXBpbiwgLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKSkge1xuICAgICAgICAgICAgaWYgKCFjb250cm9sLnBhcmVudEVsZW1lbnQgfHwgIWhvc3RzLmhhcyhjb250cm9sLnBhcmVudEVsZW1lbnQpKSBjb250cm9sLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCB7IGlkLCB0aXRsZSwgaGVhZGVyLCBsYWJlbCB9IG9mIGNvbnRlc3RzKSB7XG4gICAgICAgICAgICBjb25zdCBob3N0ID0gdGl0bGUgfHwgaGVhZGVyO1xuICAgICAgICAgICAgbGV0IHBpbiA9IGhvc3QucXVlcnlTZWxlY3RvcjxIVE1MQnV0dG9uRWxlbWVudD4oJzpzY29wZSA+IC5qYXJ2aXMtY29udGVzdC1waW4nKTtcbiAgICAgICAgICAgIGlmICghcGluKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1jb250ZXN0LXBpbic7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVzdElkID0gYnV0dG9uLmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRlc3RJZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLnByZWZlcmVuY2UgPT09IGNvbnRlc3RJZCA/ICcnIDogY29udGVzdElkO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQpIGxzU2V0KCdDb250ZXN0U3RhcnRJZCcsIG5leHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBsc1JtKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gbmV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcEp1bXA/LigpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBzYXZlIHRoZSBjb250ZXN0IHByZWZlcmVuY2U6JywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBwaW4gPSBob3N0LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwaW5uZWQgPSB0aGlzLnByZWZlcmVuY2UgPT09IGlkO1xuICAgICAgICAgICAgcGluLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgU3RyaW5nKHBpbm5lZCkpO1xuICAgICAgICAgICAgcGluLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHBpbm5lZCA/IGBVbnBpbiAke2xhYmVsfWAgOiBgUGluICR7bGFiZWx9IHRvIG9wZW4gb24gcmVsb2FkYCk7XG4gICAgICAgICAgICBwaW4udGl0bGUgPSBwaW5uZWQgPyAnUGlubmVkLiBDbGljayB0byB1c2UgeW91ciBjb250ZXN0IGRlZmF1bHRzLicgOiAnT3BlbiB0aGlzIGNvbnRlc3Qgd2hlbiB0aGUgcGFnZSByZWxvYWRzJztcblxuICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gaG9zdC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKTtcbiAgICAgICAgICAgIGlmICghcGlubmVkKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24/LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNob2ljZSA9IG1ha2VSYW5rQ2hvaWNlKCdQaW5uZWQgbGVhZGVyYm9hcmQgc3RhcnQnLCByYW5rID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxzU2V0KCdDb250ZXN0UGlubmVkUmFuaycsIHsgaWQsIHJhbmsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGNob2ljZSwgcmFuayk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGxlYWRlcmJvYXJkIHBvc2l0aW9uOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjaG9pY2UuY2xhc3NMaXN0LmFkZCgnamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpO1xuICAgICAgICAgICAgICAgIHBpbi5hZnRlcihjaG9pY2UpO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gY2hvaWNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShwb3NpdGlvbiwgcmVhZFBpbm5lZFJhbmsoaWQsIHRoaXMuZGVmYXVsdHMucmFuaykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IGxpc3QucXVlcnlTZWxlY3RvcignLmNvbnRlc3RfaGVhZGVyX2FjdGl2ZScpPy5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpO1xuICAgICAgICBpZiAoc2VsZWN0ZWQpIHJldHVybiBzZWxlY3RlZC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcblxuICAgICAgICBjb25zdCBwYW5lbHMgPSBBcnJheS5mcm9tKHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYW5raW5nW2lkX2NvbnRlc3RdJykpXG4gICAgICAgICAgICAuZmlsdGVyKHBhbmVsID0+IHBhbmVsLmdldENsaWVudFJlY3RzKCkubGVuZ3RoICYmIGdldENvbXB1dGVkU3R5bGUocGFuZWwpLnZpc2liaWxpdHkgPT09ICd2aXNpYmxlJyk7XG4gICAgICAgIHJldHVybiBwYW5lbHMubGVuZ3RoID09PSAxID8gcGFuZWxzWzBdLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpIDogbnVsbDtcbiAgICB9XG5cbiAgICBzaG93TGVhZGVyYm9hcmQocmlnaHQ6IEhUTUxFbGVtZW50LCBjb250ZXN0SWQ6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgaWYgKCFjb250ZXN0SWQpIHtcbiAgICAgICAgICAgIHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1vdGhlcicpLmZvckVhY2gocGFuZWwgPT4gcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnamFydmlzLWNvbnRlc3Qtb3RoZXInKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwYW5lbCBvZiByaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcucmFua2luZ1tpZF9jb250ZXN0XScpKSB7XG4gICAgICAgICAgICBwYW5lbC5jbGFzc0xpc3QudG9nZ2xlKCdqYXJ2aXMtY29udGVzdC1vdGhlcicsIHBhbmVsLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpICE9PSBjb250ZXN0SWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0T3duUm93KGJvYXJkOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBvd24gPSBib2FyZC5xdWVyeVNlbGVjdG9yKCcubGVhZFRhYmxlIHRyLmxlYWRfdGFibGVfZGVmYXVsdCcpO1xuICAgICAgICBpZiAob3duKSByZXR1cm4gb3duO1xuXG4gICAgICAgIGNvbnN0IGhlcm9JZCA9ICh3aW5kb3cuc2hhcmVkPy5IZXJvIHx8IHdpbmRvdy5IZXJvKT8uaW5mb3M/LmlkO1xuICAgICAgICBpZiAoaGVyb0lkID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGJvYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5sZWFkVGFibGUgdHJbc29ydGluZ19pZF0nKSlcbiAgICAgICAgICAgIC5maW5kKHJvdyA9PiByb3cuZ2V0QXR0cmlidXRlKCdzb3J0aW5nX2lkJykgPT09IFN0cmluZyhoZXJvSWQpKTtcbiAgICB9XG5cbiAgICBnZXRMZWFkZXJib2FyZFNjcm9sbGVyKHJpZ2h0OiBIVE1MRWxlbWVudCwgaWQ6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShyaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcucmFua2luZ1tpZF9jb250ZXN0XScpKVxuICAgICAgICAgICAgLmZpbmQocGFuZWwgPT4gcGFuZWwuZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0JykgPT09IGlkKT8ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5sZWFkX3RhYmxlX3ZpZXcnKTtcbiAgICB9XG5cbiAgICBsb2NrU2Nyb2xsKHNjcm9sbGVyOiBIVE1MRWxlbWVudCkge1xuICAgICAgICAkKHNjcm9sbGVyKS5zdG9wKHRydWUsIGZhbHNlKTtcbiAgICAgICAgLy8gVGhlIGdhbWUgY2FuIHN0YXJ0IGFub3RoZXIgalF1ZXJ5IHR3ZWVuIGFmdGVyIGxvYWQuIEJsb2NrIGl0cyB3cml0ZXMgb24gdGhpcyBwYW5lIG9ubHkuXG4gICAgICAgIGNvbnN0IGlnbm9yZVNjcm9sbCA9ICgpID0+IHt9O1xuICAgICAgICBjb25zdCBnZXQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEVsZW1lbnQucHJvdG90eXBlLCAnc2Nyb2xsVG9wJyk/LmdldDtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRvcnMgPSBPYmplY3QuZW50cmllcyh7XG4gICAgICAgICAgICBzY3JvbGxUb3A6IHsgZ2V0LCBzZXQ6IGlnbm9yZVNjcm9sbCB9LFxuICAgICAgICAgICAgc2Nyb2xsOiB7IHZhbHVlOiBpZ25vcmVTY3JvbGwsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICBzY3JvbGxUbzogeyB2YWx1ZTogaWdub3JlU2Nyb2xsLCB3cml0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgc2Nyb2xsQnk6IHsgdmFsdWU6IGlnbm9yZVNjcm9sbCwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgICB9KS5maWx0ZXIoKFtrZXldKSA9PiAhT2JqZWN0Lmhhc093bihzY3JvbGxlciwga2V5KSk7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgZGVzY3JpcHRvcl0gb2YgZGVzY3JpcHRvcnMpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzY3JvbGxlciwga2V5LCB7IC4uLmRlc2NyaXB0b3IsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAkKHNjcm9sbGVyKS5zdG9wKHRydWUsIGZhbHNlKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgZGVzY3JpcHRvcl0gb2YgZGVzY3JpcHRvcnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzY3JvbGxlciwga2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudCAmJiBjdXJyZW50LnZhbHVlID09PSBkZXNjcmlwdG9yLnZhbHVlICYmIGN1cnJlbnQuc2V0ID09PSBkZXNjcmlwdG9yLnNldCkgUmVmbGVjdC5kZWxldGVQcm9wZXJ0eShzY3JvbGxlciwga2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBqdW1wVG8oc2Nyb2xsZXI6IEhUTUxFbGVtZW50LCB0YXJnZXQ6IEVsZW1lbnQgfCBudWxsIHwgdW5kZWZpbmVkLCBjZW50ZXIgPSBmYWxzZSkge1xuICAgICAgICBsZXQgdG9wID0gMDtcbiAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgICAgY29uc3QgYm91bmRzID0gc2Nyb2xsZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBjb25zdCBzY2FsZSA9IGJvdW5kcy5oZWlnaHQgLyBzY3JvbGxlci5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICBpZiAoIXNjYWxlKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0b3AgPSBzY3JvbGxlci5zY3JvbGxUb3AgKyAoaXRlbS50b3AgLSBib3VuZHMudG9wKSAvIHNjYWxlIC0gc2Nyb2xsZXIuY2xpZW50VG9wO1xuICAgICAgICAgICAgaWYgKGNlbnRlcikgdG9wIC09IChzY3JvbGxlci5jbGllbnRIZWlnaHQgLSBpdGVtLmhlaWdodCAvIHNjYWxlKSAvIDI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zY3JvbGxJbnN0YW50bHkoc2Nyb2xsZXIsIHRvcCk7XG4gICAgfVxuXG4gICAgc2Nyb2xsSW5zdGFudGx5KHNjcm9sbGVyOiBIVE1MRWxlbWVudCwgcG9zaXRpb246IG51bWJlcikge1xuICAgICAgICBjb25zdCB0b3AgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihzY3JvbGxlci5zY3JvbGxIZWlnaHQgLSBzY3JvbGxlci5jbGllbnRIZWlnaHQsIHBvc2l0aW9uKSk7XG4gICAgICAgIGlmIChNYXRoLmFicyh0b3AgLSBzY3JvbGxlci5zY3JvbGxUb3ApID49IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbFRvID0gRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsVG8gYXMgKG9wdGlvbnM6IFNjcm9sbFRvT3B0aW9ucykgPT4gdm9pZDtcbiAgICAgICAgICAgIHNjcm9sbFRvLmNhbGwoc2Nyb2xsZXIsIHsgdG9wLCBiZWhhdmlvcjogJ2luc3RhbnQnIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaG9sZFN3aXRjaFBvc2l0aW9uKGxpc3Q6IEhUTUxFbGVtZW50LCByaWdodDogSFRNTEVsZW1lbnQsIGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zd2l0Y2hTY3JvbGw/LnN0b3AoKTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KTtcbiAgICAgICAgaWYgKHNlbGVjdGVkKSB7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91cyA9IHRoaXMuZ2V0TGVhZGVyYm9hcmRTY3JvbGxlcihyaWdodCwgc2VsZWN0ZWQpO1xuICAgICAgICAgICAgaWYgKHByZXZpb3VzPy5jbGllbnRIZWlnaHQpIHRoaXMubGVhZGVyYm9hcmRQb3NpdGlvbnMuc2V0KHNlbGVjdGVkLCBwcmV2aW91cy5zY3JvbGxUb3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGlzdFRvcCA9IGxpc3Quc2Nyb2xsVG9wO1xuICAgICAgICBjb25zdCBib2FyZFRvcCA9IHRoaXMubGVhZGVyYm9hcmRQb3NpdGlvbnMuZ2V0KGlkKSA/PyAwO1xuICAgICAgICBjb25zdCByZWxlYXNlTGlzdCA9IHRoaXMubG9ja1Njcm9sbChsaXN0KTtcbiAgICAgICAgbGV0IGJvYXJkOiBIVE1MRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCByZWxlYXNlQm9hcmQ6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgcmVzdG9yZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmdldExlYWRlcmJvYXJkU2Nyb2xsZXIocmlnaHQsIGlkKTtcbiAgICAgICAgICAgIGlmIChuZXh0ICE9PSBib2FyZCkge1xuICAgICAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICAgICAgYm9hcmQgPSBuZXh0O1xuICAgICAgICAgICAgICAgIHJlbGVhc2VCb2FyZCA9IGJvYXJkID8gdGhpcy5sb2NrU2Nyb2xsKGJvYXJkKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsSW5zdGFudGx5KGxpc3QsIGxpc3RUb3ApO1xuICAgICAgICAgICAgaWYgKGJvYXJkPy5jbGllbnRIZWlnaHQpIHRoaXMuc2Nyb2xsSW5zdGFudGx5KGJvYXJkLCBib2FyZFRvcCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUsIHNpZ25hbDogaGFuZGxlcnMuc2lnbmFsIH07XG4gICAgICAgIGNvbnN0IHN0b3AgPSAoKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgaGFuZGxlcnMuYWJvcnQoKTtcbiAgICAgICAgICAgIHJlbGVhc2VMaXN0KCk7XG4gICAgICAgICAgICByZWxlYXNlQm9hcmQ/LigpO1xuICAgICAgICAgICAgdGhpcy5zd2l0Y2hTY3JvbGwgPSBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoc3RvcCwgNDAwMCk7XG4gICAgICAgIGNvbnN0IG9uU2Nyb2xsID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gbGlzdCB8fCBldmVudC50YXJnZXQgPT09IGJvYXJkKSByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSB7XG4gICAgICAgICAgICBwYW5lLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBbJ3doZWVsJywgJ3RvdWNobW92ZScsICdwb2ludGVyZG93biddKSBwYW5lLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgc3RvcCwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChbJ0Fycm93VXAnLCAnQXJyb3dEb3duJywgJ1BhZ2VVcCcsICdQYWdlRG93bicsICdIb21lJywgJ0VuZCcsICcgJ10uaW5jbHVkZXMoZXZlbnQua2V5KSkgc3RvcCgpO1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5zd2l0Y2hTY3JvbGwgPSB7IHJlc3RvcmUsIHN0b3AgfTtcbiAgICAgICAgcmVzdG9yZSgpO1xuICAgIH1cblxuICAgIG9wZW5Db250ZXN0KGxpc3Q6IEhUTUxFbGVtZW50LCByaWdodDogSFRNTEVsZW1lbnQsIHsgaWQsIGNhcmQsIGhlYWRlciwgdGl0bGUgfTogQ29udGVzdENhcmQpIHtcbiAgICAgICAgZm9yIChjb25zdCBwYW5lIG9mIFtsaXN0LCByaWdodF0pIHBhbmUuY2xhc3NMaXN0LmFkZCgnamFydmlzLWNvbnRlc3QtaW5zdGFudCcsICdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgIGNvbnN0IHJhbmsgPSBpZCA9PT0gdGhpcy5wcmVmZXJlbmNlID8gcmVhZFBpbm5lZFJhbmsoaWQsIHRoaXMuZGVmYXVsdHMucmFuaykgOiB0aGlzLmRlZmF1bHRzLnJhbms7XG4gICAgICAgIGNvbnN0IHBsYWNlQXRPd25SYW5rID0gcmFuayA9PT0gJ21pbmUnO1xuICAgICAgICBjb25zdCByZWxlYXNlTGlzdCA9IHRoaXMubG9ja1Njcm9sbChsaXN0KTtcbiAgICAgICAgbGV0IGJvYXJkOiBIVE1MRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCByZWxlYXNlQm9hcmQ6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHBvc2l0aW9uZWQgPSBmYWxzZTtcbiAgICAgICAgbGV0IGxhc3RBdHRlbXB0OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgIGNvbnN0IHVwZGF0ZUJvYXJkID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuZ2V0TGVhZGVyYm9hcmRTY3JvbGxlcihyaWdodCwgaWQpO1xuICAgICAgICAgICAgaWYgKGJvYXJkID09PSBuZXh0KSByZXR1cm47XG4gICAgICAgICAgICByZWxlYXNlQm9hcmQ/LigpO1xuICAgICAgICAgICAgYm9hcmQgPSBuZXh0O1xuICAgICAgICAgICAgcmVsZWFzZUJvYXJkID0gYm9hcmQgPyB0aGlzLmxvY2tTY3JvbGwoYm9hcmQpIDogdW5kZWZpbmVkO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXZlYWwgPSAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkgcGFuZS5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdG9yZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghbGlzdC5pc0Nvbm5lY3RlZCB8fCAhcmlnaHQuaXNDb25uZWN0ZWQgfHwgIWxpc3QuY29udGFpbnMoY2FyZCkpIHJldHVybjtcblxuICAgICAgICAgICAgdXBkYXRlQm9hcmQoKTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCk7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQgIT09IGlkICYmIHNlbGVjdGVkICE9PSBsYXN0QXR0ZW1wdCkge1xuICAgICAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIG51bGwpO1xuICAgICAgICAgICAgICAgICh0aXRsZSB8fCBoZWFkZXIpLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgdXBkYXRlQm9hcmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghYm9hcmQ/LmNsaWVudEhlaWdodCB8fCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSAhPT0gaWQgfHxcbiAgICAgICAgICAgICAgICAocGxhY2VBdE93blJhbmsgJiYgIWJvYXJkLnF1ZXJ5U2VsZWN0b3IoJy5sZWFkVGFibGUnKSkpIHJldHVybjtcbiAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIGlkKTtcbiAgICAgICAgICAgIHRoaXMuanVtcFRvKGxpc3QsIGNhcmQpO1xuICAgICAgICAgICAgdGhpcy5qdW1wVG8oYm9hcmQsIHBsYWNlQXRPd25SYW5rID8gdGhpcy5nZXRPd25Sb3coYm9hcmQpIDogbnVsbCwgcGxhY2VBdE93blJhbmspO1xuICAgICAgICAgICAgaWYgKCFwb3NpdGlvbmVkKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICByZXZlYWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb3JyZWN0IGJyb3dzZXItZHJpdmVuIG1vdmVzLCBzdWNoIGFzIHNjcm9sbEludG9WaWV3IG9uIGEgbGVhZGVyYm9hcmQgcm93LCBiZWZvcmUgcGFpbnQuXG4gICAgICAgIGNvbnN0IG9uU2Nyb2xsID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gbGlzdCB8fCBldmVudC50YXJnZXQgPT09IGJvYXJkKSByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGlucHV0RXZlbnRzID0gWydwb2ludGVyZG93bicsICd0b3VjaHN0YXJ0JywgJ3doZWVsJywgJ2NsaWNrJ107XG4gICAgICAgIGNvbnN0IG9uSW5wdXQgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkKSBzdG9wKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0b3BPbktleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmlzVHJ1c3RlZCAmJiBbJ1RhYicsICdBcnJvd1VwJywgJ0Fycm93RG93bicsICdQYWdlVXAnLCAnUGFnZURvd24nLCAnSG9tZScsICdFbmQnLCAnRW50ZXInLCAnICddLmluY2x1ZGVzKGV2ZW50LmtleSkpIHN0b3AoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgYWZ0ZXJMb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0b3AgPSAoZmluaXNoID0gdHJ1ZSkgPT4ge1xuICAgICAgICAgICAgcmVsZWFzZUxpc3QoKTtcbiAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgICAgIHBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25TY3JvbGwsIHRydWUpO1xuICAgICAgICAgICAgICAgIHBhbmUuY2xhc3NMaXN0LnJlbW92ZSgnamFydmlzLWNvbnRlc3QtaW5zdGFudCcsICdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIGlucHV0RXZlbnRzKSBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBvbklucHV0LCB0cnVlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBzdG9wT25LZXksIHRydWUpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBhZnRlckxvYWQpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgIHRoaXMuc3RvcEp1bXAgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZXBvc2l0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucmVzdG9yaW5nQ2FyZCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoZmluaXNoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldmVhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoc3RvcCwgNDAwMCk7XG4gICAgICAgIHRoaXMuc3RvcEp1bXAgPSBzdG9wO1xuICAgICAgICB0aGlzLnJlcG9zaXRpb24gPSByZXN0b3JlO1xuICAgICAgICB0aGlzLnJlc3RvcmluZ0NhcmQgPSBjYXJkO1xuICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgcGFuZS5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCwgeyBwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgaW5wdXRFdmVudHMpIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uSW5wdXQsIHsgcGFzc2l2ZTogdHJ1ZSwgY2FwdHVyZTogdHJ1ZSB9KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHN0b3BPbktleSwgdHJ1ZSk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFmdGVyTG9hZCwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICByZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEnKTtcbiAgICAgICAgY29uc3QgcmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignI2NvbnRlc3RzIC5yaWdodF9wYXJ0Jyk7XG4gICAgICAgIGlmICh0aGlzLmxpc3QgIT09IGxpc3QgfHwgdGhpcy5yaWdodCAhPT0gcmlnaHQpIHRoaXMuc3dpdGNoU2Nyb2xsPy5zdG9wKCk7XG4gICAgICAgIGlmICh0aGlzLnN0b3BKdW1wICYmICh0aGlzLmxpc3QgIT09IGxpc3QgfHwgdGhpcy5yaWdodCAhPT0gcmlnaHQgfHwgIWxpc3Q/LmNvbnRhaW5zKHRoaXMucmVzdG9yaW5nQ2FyZCkpKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BKdW1wKGZhbHNlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0KSB0aGlzLnNob3dMZWFkZXJib2FyZCh0aGlzLnJpZ2h0LCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxpc3QgPSBsaXN0O1xuICAgICAgICB0aGlzLnJpZ2h0ID0gcmlnaHQ7XG4gICAgICAgIGlmICghbGlzdCB8fCAhcmlnaHQgfHwgIWxpc3QuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggfHwgZ2V0Q29tcHV0ZWRTdHlsZShsaXN0KS52aXNpYmlsaXR5ICE9PSAndmlzaWJsZScpIHJldHVybjtcblxuICAgICAgICBjb25zdCBmaW5pc2hlZCA9IG5ldyBTZXQoT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmZpbmlzaGVkIHx8IHt9KVxuICAgICAgICAgICAgLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbCkubWFwKGNvbnRlc3QgPT4gU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCkpKTtcbiAgICAgICAgZm9yIChjb25zdCBlbmRlZCBvZiBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZXN0LmVuZGVkLCAuY29udGVzdF9oZWFkZXIuZW5kZWQnKSkge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBlbmRlZC5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmIChpZCkgZmluaXNoZWQuYWRkKGlkKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb250ZXN0cyA9IHRoaXMuZ2V0Q29udGVzdHMobGlzdCwgZmluaXNoZWQpO1xuICAgICAgICB0aGlzLmNsZWFyRXhwaXJlZFBpbihsaXN0LCBjb250ZXN0cywgZmluaXNoZWQpO1xuICAgICAgICB0aGlzLnVwZGF0ZVBpbnMobGlzdCwgY29udGVzdHMpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlcG9zaXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMucmVwb3NpdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0YXJ0dXBQZW5kaW5nKSB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmdldFRhcmdldChjb250ZXN0cyk7XG4gICAgICAgICAgICBpZiAodGFyZ2V0KSB0aGlzLm9wZW5Db250ZXN0KGxpc3QsIHJpZ2h0LCB0YXJnZXQpO1xuICAgICAgICAgICAgZWxzZSBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyAmJiAhdGhpcy5wcmVmZXJlbmNlKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCkpO1xuICAgICAgICAgICAgdGhpcy5zd2l0Y2hTY3JvbGw/LnJlc3RvcmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJ1bih7IG5vU3dpdGNoU2Nyb2xsID0gZmFsc2UgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGNvbnN0IHBpbiA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdFN0YXJ0SWQnKTtcbiAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gKCh0eXBlb2YgcGluID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgcGluID09PSAnbnVtYmVyJykgJiYgcGluKSA/IFN0cmluZyhwaW4pIDogJyc7XG4gICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0b3BTd2l0Y2hTY3JvbGwgPSBub1N3aXRjaFNjcm9sbDtcbiAgICAgICAgdGhpcy5kZWZhdWx0cyA9IHJlYWRDb250ZXN0RGVmYXVsdHMoKTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IHsgc2lnbmFsIH0gPSB0aGlzLmxpc3RlbmVycztcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKG11dGF0aW9ucyA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlc3RzIC5sZWZ0X3BhcnQgLnNjcm9sbF9hcmVhJyk7XG4gICAgICAgICAgICBjb25zdCByaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZXN0cyAucmlnaHRfcGFydCcpO1xuICAgICAgICAgICAgaWYgKGxpc3QgIT09IHRoaXMubGlzdCB8fCByaWdodCAhPT0gdGhpcy5yaWdodCB8fCBtdXRhdGlvbnMuc29tZSgoeyB0YXJnZXQgfSkgPT5cbiAgICAgICAgICAgICAgICAobGlzdCAmJiAobGlzdC5jb250YWlucyh0YXJnZXQpIHx8IHRhcmdldC5jb250YWlucyhsaXN0KSkpIHx8XG4gICAgICAgICAgICAgICAgKHJpZ2h0ICYmIChyaWdodC5jb250YWlucyh0YXJnZXQpIHx8IHRhcmdldC5jb250YWlucyhyaWdodCkpKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcycsICdzdHlsZScsICdoaWRkZW4nLCAnaWRfY29udGVzdCddIH0pO1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB0aGlzLnJlZnJlc2goKSwgeyBvbmNlOiB0cnVlLCBzaWduYWwgfSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoIWV2ZW50LmlzVHJ1c3RlZCB8fCAhKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpIHx8ICF0aGlzLnJpZ2h0IHx8ICF0aGlzLmxpc3Q/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCcuY29udGVzdF9oZWFkZXInKTtcbiAgICAgICAgICAgIGlmICghaGVhZGVyIHx8IGV2ZW50LnRhcmdldC5jbG9zZXN0KCcuamFydmlzLWNvbnRlc3QtcGluLCAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpKSByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gaGVhZGVyLmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcFN3aXRjaFNjcm9sbCAmJiBpZCAmJiBpZCAhPT0gdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZCh0aGlzLmxpc3QsIHRoaXMucmlnaHQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ob2xkU3dpdGNoUG9zaXRpb24odGhpcy5saXN0LCB0aGlzLnJpZ2h0LCBpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZCh0aGlzLnJpZ2h0LCBudWxsKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICB9LCB7IGNhcHR1cmU6IHRydWUsIHNpZ25hbCB9KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cblxuICAgIHVwZGF0ZVN1YlNldHRpbmcoa2V5OiBzdHJpbmcsIHZhbHVlOiBib29sZWFuKSB7XG4gICAgICAgIGlmIChrZXkgIT09ICdub1N3aXRjaFNjcm9sbCcpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdG9wU3dpdGNoU2Nyb2xsID0gdmFsdWU7XG4gICAgICAgIGlmICghdmFsdWUpIHRoaXMuc3dpdGNoU2Nyb2xsPy5zdG9wKCk7XG4gICAgfVxuXG4gICAgdGVhckRvd24oKSB7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnM/LmFib3J0KCk7XG4gICAgICAgIHRoaXMuc3RvcEp1bXA/LigpO1xuICAgICAgICB0aGlzLnN3aXRjaFNjcm9sbD8uc3RvcCgpO1xuICAgICAgICB0aGlzLmxlYWRlcmJvYXJkUG9zaXRpb25zLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5saXN0Py5xdWVyeVNlbGVjdG9yQWxsKCcuamFydmlzLWNvbnRlc3QtcGluLCAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpLmZvckVhY2goY29udHJvbCA9PiBjb250cm9sLnJlbW92ZSgpKTtcbiAgICAgICAgaWYgKHRoaXMucmlnaHQpIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHRoaXMucmlnaHQsIG51bGwpO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSBmYWxzZTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuXG5leHBvcnQgY2xhc3MgTGVhZ3VlVG9wMjAgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnbGVhZ3VlVG9wMjAnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUHJvbW90aW9uIHRhcmdldFwiLCBcIlNob3cgdGhlIHBvaW50cyBuZWVkZWQgdG8gcmVhY2ggdGhlIGxhcmdlciBvZiB0aGUgdG9wIDIwIG9yIHRvcCAxNSUgYmVsb3cgdGhlIGhpZ2hlc3QgbGVhZ3VlIHRpZXIuXCIpXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3Vlcy5odG1sJyk7XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZSgnLnNjcmlwdExlYWd1ZUluZm8nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdW1tYXJ5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjcmlwdExlYWd1ZUluZm8nKTtcbiAgICAgICAgICAgIGlmICghc3VtbWFyeSB8fCBzdW1tYXJ5LnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXNUb3AyMCcpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHsgb3Bwb25lbnRzX2xpc3QsIGN1cnJlbnRfdGllcl9udW1iZXIsIG1heF9sZWFndWUgfSA9IHdpbmRvdztcbiAgICAgICAgICAgIGNvbnN0IHRpZXIgPSBOdW1iZXIoY3VycmVudF90aWVyX251bWJlcik7XG4gICAgICAgICAgICBpZiAoISh0aWVyID4gMCAmJiB0aWVyIDwgTnVtYmVyKG1heF9sZWFndWUpKSkgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgaGVyb0lkID0gKHdpbmRvdy5zaGFyZWQ/Lkhlcm8gfHwgd2luZG93Lkhlcm8pPy5pbmZvcz8uaWQ7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkob3Bwb25lbnRzX2xpc3QpIHx8IGhlcm9JZCA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHBsYXllciA9IG9wcG9uZW50c19saXN0LmZpbmQoKHsgcGxheWVyIH0pID0+IFN0cmluZyhwbGF5ZXI/LmlkX2ZpZ2h0ZXIpID09PSBTdHJpbmcoaGVyb0lkKSk7XG4gICAgICAgICAgICBjb25zdCByYW5rID0gTnVtYmVyKHBsYXllcj8ucGxhY2UpO1xuICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKHJhbmspIHx8IHJhbmsgPCAxKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGJyYWNrZXRTaXplID0gb3Bwb25lbnRzX2xpc3QubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3QgcHJvbW90aW9uUmFuayA9IE1hdGgubWF4KDIwLCBNYXRoLmNlaWwoYnJhY2tldFNpemUgKiAxNSAvIDEwMCkpO1xuICAgICAgICAgICAgY29uc3QgaW5Qcm9tb3Rpb24gPSByYW5rIDw9IHByb21vdGlvblJhbms7XG4gICAgICAgICAgICBjb25zdCBjb21wYXJpc29uUmFuayA9IGluUHJvbW90aW9uID8gcHJvbW90aW9uUmFuayArIDEgOiBwcm9tb3Rpb25SYW5rO1xuICAgICAgICAgICAgY29uc3QgY3V0b2ZmID0gb3Bwb25lbnRzX2xpc3QuZmluZCgoeyBwbGFjZSB9KSA9PiBOdW1iZXIocGxhY2UpID09PSBjb21wYXJpc29uUmFuayk7XG4gICAgICAgICAgICBpZiAocGxheWVyPy5wbGF5ZXJfbGVhZ3VlX3BvaW50cyA9PSBudWxsIHx8IGN1dG9mZj8ucGxheWVyX2xlYWd1ZV9wb2ludHMgPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBzY29yZSA9IE51bWJlcihwbGF5ZXIucGxheWVyX2xlYWd1ZV9wb2ludHMpO1xuICAgICAgICAgICAgY29uc3QgY3V0b2ZmU2NvcmUgPSBOdW1iZXIoY3V0b2ZmLnBsYXllcl9sZWFndWVfcG9pbnRzKTtcbiAgICAgICAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHNjb3JlKSB8fCAhTnVtYmVyLmlzRmluaXRlKGN1dG9mZlNjb3JlKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBmb3JtYXQgPSBuZXcgSW50bC5OdW1iZXJGb3JtYXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGluUHJvbW90aW9uID8gY3V0b2ZmU2NvcmUgOiBjdXRvZmZTY29yZSArIDE7XG4gICAgICAgICAgICBjb25zdCBkaWZmZXJlbmNlID0gaW5Qcm9tb3Rpb24gPyBzY29yZSAtIHRhcmdldCA6IHRhcmdldCAtIHNjb3JlO1xuICAgICAgICAgICAgY29uc3QgcnVsZSA9IGBUb3AgJHtwcm9tb3Rpb25SYW5rfSBpcyB0aGUgcHJvbW90aW9uIHRhcmdldC4gVGhlIGN1dG9mZiBpcyB0aGUgbGFyZ2VyIG9mIDIwIHBsYWNlcyBvciAxNSUgb2YgJHtmb3JtYXQuZm9ybWF0KGJyYWNrZXRTaXplKX0gcGxheWVycywgcm91bmRlZCB1cC5gO1xuICAgICAgICAgICAgY29uc3QgY29tcGFyaXNvbiA9IGluUHJvbW90aW9uXG4gICAgICAgICAgICAgICAgPyBgUmFuayAke2NvbXBhcmlzb25SYW5rfSBoYXMgJHtmb3JtYXQuZm9ybWF0KHRhcmdldCl9IHBvaW50cy4gWW91ciBsZWFkIGlzICR7Zm9ybWF0LmZvcm1hdChkaWZmZXJlbmNlKX0gcG9pbnRzLmBcbiAgICAgICAgICAgICAgICA6IGBZb3UgbmVlZCAke2Zvcm1hdC5mb3JtYXQodGFyZ2V0KX0gcG9pbnRzIHRvIHBhc3MgcmFuayAke2NvbXBhcmlzb25SYW5rfS5gO1xuICAgICAgICAgICAgY29uc3QgdG9vbHRpcCA9IGAke3J1bGV9ICR7Y29tcGFyaXNvbn1gO1xuXG4gICAgICAgICAgICBjb25zdCBlbnRyeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIGVudHJ5LmNsYXNzTmFtZSA9ICdqYXJ2aXNUb3AyMCc7XG4gICAgICAgICAgICBlbnRyeS5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgdG9vbHRpcCk7XG4gICAgICAgICAgICBlbnRyeS5zZXRBdHRyaWJ1dGUoJ3Rvb2x0aXAnLCAnJyk7XG4gICAgICAgICAgICBlbnRyeS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCB0b29sdGlwKTtcblxuICAgICAgICAgICAgY29uc3QgYmFkZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICBiYWRnZS5jbGFzc05hbWUgPSAnc2NyaXB0TGVhZ3VlSW5mb0ljb24nO1xuICAgICAgICAgICAgYmFkZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyMzNzY5YmEnO1xuICAgICAgICAgICAgYmFkZ2Uuc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgICAgICAgICBiYWRnZS50ZXh0Q29udGVudCA9IFN0cmluZyhwcm9tb3Rpb25SYW5rKTtcbiAgICAgICAgICAgIGVudHJ5LmFwcGVuZChiYWRnZSwgYCR7ZGlmZmVyZW5jZSA9PT0gMCA/ICcnIDogaW5Qcm9tb3Rpb24gPyAnLScgOiAnKyd9JHtmb3JtYXQuZm9ybWF0KE1hdGguYWJzKGRpZmZlcmVuY2UpKX1gKTtcbiAgICAgICAgICAgIHN1bW1hcnkuaW5zZXJ0QmVmb3JlKGVudHJ5LCBzdW1tYXJ5LnF1ZXJ5U2VsZWN0b3IoJy5taW5Ub3AzMCwgLnByb21vdGlvbkluZm8nKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuXG5leHBvcnQgY2xhc3MgUmVtb3ZlUGFzc0xvY2sgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBzZWxlY3RvclRvRmluZCA9ICcubG9ja195ZWxsb3dfaWNuJztcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNsYXNzVG9SZW1vdmUgPSAnbG9ja195ZWxsb3dfaWNuJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ3JlbW92ZVBhc3NMb2NrJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQYXNzIGxvY2sgaWNvbnNcIiwgXCJIaWRlIGxvY2sgaWNvbnMgb24gcmV3YXJkIHBhc3NlcyBzbyB0aGUgcmV3YXJkcyBhcmUgZWFzaWVyIHRvIHJlYWQuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAncG92JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQYXRoIG9mIFZhbG9yXCIsIFwiSGlkZSBsb2NrIGljb25zIG9uIHRoZSBQYXRoIG9mIFZhbG9yIHBhc3Nlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ3BvZycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUGF0aCBvZiBHbG9yeVwiLCBcIkhpZGUgbG9jayBpY29ucyBvbiB0aGUgUGF0aCBvZiBHbG9yeSBwYXNzZXMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi12YWxvci5odG1sJykgfHwgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLWdsb3J5Lmh0bWwnKVxuICAgIH1cblxuICAgIG9ic2VydmVVbnRpbChzZWxlY3Rvcjogc3RyaW5nLCBjYWxsYmFjazogKGVsZW1lbnRzOiBOb2RlTGlzdE9mPEVsZW1lbnQ+KSA9PiB2b2lkLCB7IG9uY2UgPSB0cnVlLCB0aW1lb3V0ID0gNTAwMCB9ID0ge30pIHtcbiAgICAgICAgbGV0IHRpbWVyOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgICAgICAgbGV0IGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVsZW1lbnRzKTtcbiAgICAgICAgICAgIGlmIChvbmNlKSByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGltZXIpIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVsZW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcblxuICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHRpbWVvdXQpICYmIHRpbWVvdXQgPiAwKSB7XG4gICAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3I6IHN0cmluZywgY2xhc3NUb1JlbW92ZTogc3RyaW5nLCB7IG9uY2UgPSB0cnVlLCB0aW1lb3V0ID0gNTAwMCB9ID0ge30pIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlVW50aWwoc2VsZWN0b3IsIChlbGVtZW50cykgPT4ge1xuICAgICAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbCA9PiBlbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzVG9SZW1vdmUpKTtcbiAgICAgICAgfSwgeyB0aW1lb3V0LCBvbmNlIH0pO1xuICAgIH1cblxuICAgIHJ1bih7IHBvdiwgcG9nIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLXZhbG9yLmh0bWwnKSAmJiBwb3YpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUodGhpcy5zZWxlY3RvclRvRmluZCwgdGhpcy5jbGFzc1RvUmVtb3ZlKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtZ2xvcnkuaHRtbCcpICYmIHBvZykge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZSh0aGlzLnNlbGVjdG9yVG9GaW5kLCB0aGlzLmNsYXNzVG9SZW1vdmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRHaXJsRGljdGlvbmFyeSgpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5nZXRHaXJsRGljdGlvbmFyeSgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3QgbG9hZCB0aGUgSEgrKyBnaXJsIGRpY3Rpb25hcnk6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBnZXRHaXJsRGljdGlvbmFyeSB9IGZyb20gJy4vZ2FtZURhdGEnO1xuXG5leHBvcnQgY2xhc3MgTG92ZVJhaWRzQWRkb24gZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSByZWFkb25seSByYXJpdHlDb2xvcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdsb3ZlUmFpZHNBZGRvbidcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTG92ZSBSYWlkcyBkaXNwbGF5XCIsIFwiQ3VzdG9taXplIG5hbWVzLCBpY29ucywgYW5kIHBvc2VzIG9uIExvdmUgUmFpZCBjYXJkcy5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdyYWlkX2lkJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJSYWlkIElEc1wiLCBcIkFkZCB0aGUgcmFpZCBJRCBiZWZvcmUgaXRzIG5hbWUuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnbmFtZXMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkhpZGRlbiBnaXJsIG5hbWVzXCIsIFwiU2hvdyB0aGUgbmFtZSBvbiBjYXJkcyB0aGF0IHVzZSBhIG15c3RlcmlvdXMgZ2lybCBsYWJlbC5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ3NraW4nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlNraW4gaW5kaWNhdG9yXCIsIFwiTWFyayBjYXJkcyB0aGF0IGluY2x1ZGUgYSBnaXJsIHdpdGggYSBza2luLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnY29sb3InLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlJhcml0eSBjb2xvcnNcIiwgXCJDb2xvciB0aGUgcmFpZCBuYW1lIGJhc2VkIG9uIHRoZSBnaXJs4oCZcyByYXJpdHkuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdmaWdodF9pY29uJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJGaWdodCBpY29uXCIsIFwiVXNlIHRoZSBjbGVhcmVyIGZpZ2h0LWVuZXJneSBpY29uLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnc2hhZG93cycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiVW5zaGFkb3dlZCBwb3Nlc1wiLCBcIlNob3cgdGhlIG5vcm1hbCBhcnR3b3JrIGluIHBsYWNlIG9mIHNoYWRvdyBwb3Nlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG5cbiAgICAgICAgdGhpcy5yYXJpdHlDb2xvcnMgPSB7XG4gICAgICAgICAgICByYXJlOiAnTGltZUdyZWVuJyxcbiAgICAgICAgICAgIGVwaWM6ICdHb2xkJyxcbiAgICAgICAgICAgIGxlZ2VuZGFyeTogJ01lZGl1bU9yY2hpZCdcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xvdmUtcmFpZHMuaHRtbCcpXG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKHsgcmFpZF9pZCwgc2tpbiwgbmFtZXMsIGNvbG9yLCBmaWdodF9pY29uLCBzaGFkb3dzIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBjb25zdCByYWlkcyA9ICh0eXBlb2YgbG92ZV9yYWlkcyAhPT0gJ3VuZGVmaW5lZCcgJiYgQXJyYXkuaXNBcnJheShsb3ZlX3JhaWRzKSkgPyBsb3ZlX3JhaWRzIDogW107XG4gICAgICAgIGlmICghcmFpZHMubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuXG4gICAgICAgIGNvbnN0IGdpcmxEaWN0ID0gYXdhaXQgZ2V0R2lybERpY3Rpb25hcnkoKTtcbiAgICAgICAgY29uc3QgcmFpZHNCeUlkID0gbmV3IE1hcChyYWlkcy5tYXAocmFpZCA9PiBbU3RyaW5nKHJhaWQuaWRfcmFpZCksIHJhaWRdKSk7XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnJhaWQtY2FyZFtpZF9yYWlkXScpLmZvckVhY2gocmFpZENhcmQgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmFpZCA9IHJhaWRzQnlJZC5nZXQocmFpZENhcmQuZ2V0QXR0cmlidXRlKCdpZF9yYWlkJykgPz8gJycpO1xuICAgICAgICAgICAgaWYgKCFyYWlkIHx8IHJhaWQuaWRfZ2lybCA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHsgbmFtZSwgcmFyaXR5LCBzaGFyZHMgPSAwIH0gPSBnaXJsRGljdD8uZ2V0KFN0cmluZyhyYWlkLmlkX2dpcmwpKSB8fCB7fTtcbiAgICAgICAgICAgIGNvbnN0IGhhcmVtTGluayA9IHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZ2V0SHJlZihgL2NoYXJhY3RlcnMvJHtyYWlkLmlkX2dpcmx9YCk7XG4gICAgICAgICAgICBjb25zdCByYWlkTmFtZUVsZW0gPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yKCcucmFpZC1uYW1lID4gc3BhbiA+IHNwYW4nKTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVfbGFiZWwgPSAobmFtZXMgJiYgbmFtZSkgfHwgcmFpZE5hbWVFbGVtPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IHJhaWQuZXZlbnRfbmFtZSB8fCByYWlkLmdpcmxfZGF0YT8ubmFtZSB8fCAnJztcbiAgICAgICAgICAgIGNvbnN0IHJhaWRfaWRfbGFiZWwgPSByYWlkX2lkID8gYCgke3JhaWQuaWRfcmFpZH0pYCA6ICcnO1xuICAgICAgICAgICAgY29uc3Qgc2tpbl9sYWJlbCA9IChza2luICYmIEFycmF5LmlzQXJyYXkocmFpZD8uZ2lybF9kYXRhPy5ncmFkZV9za2lucykgJiYgcmFpZC5naXJsX2RhdGEuZ3JhZGVfc2tpbnMubGVuZ3RoID4gMCkgPyAn8J+RmScgOiAnJztcblxuICAgICAgICAgICAgY29uc3QgZGlzcGxheVBhcnRzID0gW107XG4gICAgICAgICAgICBpZiAocmFpZF9pZCkgZGlzcGxheVBhcnRzLnB1c2gocmFpZF9pZF9sYWJlbCk7XG4gICAgICAgICAgICBkaXNwbGF5UGFydHMucHVzaChuYW1lX2xhYmVsKTtcbiAgICAgICAgICAgIGlmIChza2luKSBkaXNwbGF5UGFydHMucHVzaChza2luX2xhYmVsKTtcbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlMYWJlbCA9IGRpc3BsYXlQYXJ0cy5qb2luKCcgJykudHJpbSgpO1xuXG4gICAgICAgICAgICBpZiAocmFpZE5hbWVFbGVtICYmIGRpc3BsYXlMYWJlbCkge1xuICAgICAgICAgICAgICAgIHJhaWROYW1lRWxlbS50ZXh0Q29udGVudCA9IGRpc3BsYXlMYWJlbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgb2JqZWN0aXZlcyA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jbGFzc2ljLWdpcmwnKTtcbiAgICAgICAgICAgIGNvbnN0IGdpcmwgPSBvYmplY3RpdmVzWzBdO1xuICAgICAgICAgICAgaWYgKGdpcmwpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBnaXJsTmFtZUVsZW0gPSBnaXJsLnF1ZXJ5U2VsZWN0b3IoJy5naXJsLW5hbWUnKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2lybE5hbWVFbGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5rID0gZ2lybE5hbWVFbGVtLnF1ZXJ5U2VsZWN0b3IoJ2EnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsaW5rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluay5jbGFzc05hbWUgPSAnaGgtZ2lybC1saW5rJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChnaXJsTmFtZUVsZW0uZmlyc3RDaGlsZCkgbGluay5hcHBlbmRDaGlsZChnaXJsTmFtZUVsZW0uZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnaXJsTmFtZUVsZW0uYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3BsYXlMYWJlbCkgbGluay50ZXh0Q29udGVudCA9IGRpc3BsYXlMYWJlbDtcbiAgICAgICAgICAgICAgICAgICAgbGluay5ocmVmID0gaGFyZW1MaW5rO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzaGFyZHMgPT09IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvYmpFbGVtID0gZ2lybC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLm9iamVjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob2JqRWxlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqRWxlbS5pbm5lclRleHQgPSBgSSdtIGFscmVhZHkgYXR0cmFjdGVkIHRvIHlvdS4gRmluZCBtZSBpbiB5b3VyIEhhcmVtIWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjb2xvciAmJiByYXJpdHkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByYWlkTmFtZUNvbnRhaW5lciA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcucmFpZC1uYW1lJyk7XG4gICAgICAgICAgICAgICAgaWYgKHJhaWROYW1lQ29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhaWROYW1lQ29udGFpbmVyLnN0eWxlLmNvbG9yID0gdGhpcy5yYXJpdHlDb2xvcnNbcmFyaXR5XSB8fCAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaWdodF9pY29uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlnaHRJY29uID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5odWRCYXR0bGVQdHNfbWl4X2ljbicpO1xuICAgICAgICAgICAgICAgIGlmIChmaWdodEljb24pIHtcbiAgICAgICAgICAgICAgICAgICAgZmlnaHRJY29uLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9ICd1cmwoL2ltYWdlcy9waWN0dXJlcy9kZXNpZ24vaWNfZW5lcmd5X2ZpZ2h0LnBuZyknO1xuICAgICAgICAgICAgICAgICAgICBmaWdodEljb24uc3R5bGUuYmFja2dyb3VuZFNpemUgPSAnMjRweCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2hhZG93cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRJbWFnZSA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEltYWdlRWxlbWVudD4oJy5naXJsLWltZy5sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGxlZnRJbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICBsZWZ0SW1hZ2Uuc3JjID0gbGVmdEltYWdlLnNyYy5yZXBsYWNlKCctYmxhY2snLCAnJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyYWlkQ2FyZC5jbGFzc0xpc3QuY29udGFpbnMoJ211bHRpcGxlLWdpcmwnKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodEltYWdlID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MSW1hZ2VFbGVtZW50PignLmdpcmwtaW1nLnJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyaWdodEltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByaWdodEltYWdlLnNyYyA9IHJpZ2h0SW1hZ2Uuc3JjLnJlcGxhY2UoJ2F2YjAucG5nJywgJ2dyYWRlX3NraW5zL2dyYWRlX3NraW4xLnBuZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHRJbWFnZS5zcmMgPSByaWdodEltYWdlLnNyYy5yZXBsYWNlKCctYmxhY2snLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmFpZENhcmQucXVlcnlTZWxlY3RvckFsbCgnLmV5ZScpLmZvckVhY2goZSA9PiBlLnJlbW92ZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB0eXBlIHsgR2lybERhdGEsIExvdmVSYWlkIH0gZnJvbSAnLi4vLi4vZ2FtZS10eXBlcyc7XG5pbXBvcnQgeyBsc0dldCwgbHNTZXQsIGxzUm0gfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcbmltcG9ydCB7IGdldEdpcmxEaWN0aW9uYXJ5IH0gZnJvbSAnLi9nYW1lRGF0YSc7XG5cbnR5cGUgUmFpZENvcHlCdXR0b24gPSBIVE1MRGl2RWxlbWVudCAmIHsgX2JvdW5kQ29weUtleUhhbmRsZXI/OiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHZvaWQgfTtcblxuZXhwb3J0IGNsYXNzIExvdmVSYWlkc1BhcnNlciBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIGdpcmxEaWN0OiBSZWFkb25seU1hcDxzdHJpbmcsIEdpcmxEYXRhPiB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgX2JvdW5kSW5zZXJ0QnV0dG9uPzogKCkgPT4gdm9pZDtcblxuICAgIC8qXG4gICAgKiBSYWlkIElELCBBbm5vdW5jZW1lbnQgVHlwZSwgQmFja2dyb3VuZCBJRCwgRXZlbnQgTmFtZSwgU3RhcnQgRGF0ZXRpbWUsXG4gICAgKiBFbmQgRGF0ZXRpbWUsIER1cmF0aW9uLCBSYWlkIFN0YXR1cywgU291cmNlLCBHaXJsIElELFxuICAgICogR2lybCBOYW1lLCBSYXJpdHksIE1heCBHcmFkZSwgRmlyc3QgQXBwZWFyYW5jZSwgU291cmNlIElELFxuICAgICogSGFzIFNraW4ocylcbiAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xvdmVSYWlkc1BhcnNlcidcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTG92ZSBSYWlkcyBleHBvcnRcIiwgXCJBZGQgYSBidXR0b24gdG8gY29weSBuZXcgcmFpZHMgaW4gYSBzcHJlYWRzaGVldC1yZWFkeSBmb3JtYXQuXCIpXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbG92ZS1yYWlkcy5odG1sJylcbiAgICB9XG5cbiAgICBjYXBpdGFsaXplRmlyc3Qoc3RyOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHN0ciA/IHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKSA6IHN0cjtcbiAgICB9XG5cbiAgICBnZXRBbm5vdW5jZW1lbnRUeXBlKHR5cGU6IExvdmVSYWlkWydpZF9hbm5vdW5jZW1lbnRfdHlwZSddKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gXCJGdWxsXCI7XG4gICAgICAgICAgICBjYXNlIDI6IHJldHVybiBcIlBhcnRpYWxcIjtcbiAgICAgICAgICAgIGNhc2UgMzogcmV0dXJuIFwiTm9uZVwiO1xuICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIFwiVW5rbm93blwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U291cmNlSUQoZXZlbnQ6IExvdmVSYWlkKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZV9pZCA9IE51bWJlcihldmVudC5yYWlkX21vZHVsZV9wayk7XG4gICAgICAgIHN3aXRjaCAoZXZlbnQucmFpZF9tb2R1bGVfdHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc2Vhc29uJzogcmV0dXJuIDA7XG4gICAgICAgICAgICBjYXNlICdjaGFtcGlvbic6IHJldHVybiBOdW1iZXIuaXNGaW5pdGUoc291cmNlX2lkKSA/IHNvdXJjZV9pZCA6IC0yO1xuICAgICAgICAgICAgY2FzZSAndHJvbGwnOiByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHNvdXJjZV9pZCkgPyBzb3VyY2VfaWQgKyAxMCA6IC0yO1xuICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2lybEhhc1NraW5zKGV2ZW50OiBMb3ZlUmFpZCkge1xuICAgICAgICBjb25zdCBoYXNTa2lucyA9IEFycmF5LmlzQXJyYXkoZXZlbnQ/LmdpcmxfZGF0YT8uZ3JhZGVfc2tpbnMpICYmIGV2ZW50LmdpcmxfZGF0YS5ncmFkZV9za2lucy5sZW5ndGggPiAwO1xuICAgICAgICBpZiAoaGFzU2tpbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBcIlhcIjtcbiAgICAgICAgfSBlbHNlIHJldHVybiBcIk9cIjtcbiAgICB9XG5cbiAgICBmb3JtYXRFdmVudFJvdyhldmVudDogTG92ZVJhaWQpIHtcbiAgICAgICAgY29uc3QgZHVyYXRpb25Ib3VycyA9IE1hdGguZmxvb3IoTnVtYmVyKGV2ZW50LmV2ZW50X2R1cmF0aW9uX3NlY29uZHMpIC8gMzYwMCk7XG4gICAgICAgIGNvbnN0IGR1cmF0aW9uID0gYCR7ZHVyYXRpb25Ib3Vyc30gaG91cnNgO1xuXG4gICAgICAgIGNvbnN0IGdpcmwgPSB0aGlzLmdpcmxEaWN0Py5nZXQoU3RyaW5nKGV2ZW50LmlkX2dpcmwpKSB8fCB7fTtcbiAgICAgICAgY29uc3QgeyBuYW1lID0gJ1Vua25vd24nLCByYXJpdHkgPSAnTi9BJywgZ3JhZGUgPSAwIH0gPSBnaXJsO1xuXG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBldmVudC5pZF9yYWlkLFxuICAgICAgICAgICAgdGhpcy5nZXRBbm5vdW5jZW1lbnRUeXBlKGV2ZW50LmlkX2Fubm91bmNlbWVudF90eXBlKSxcbiAgICAgICAgICAgIGV2ZW50LmJhY2tncm91bmRfaWQsXG4gICAgICAgICAgICBldmVudC5ldmVudF9uYW1lLFxuICAgICAgICAgICAgZXZlbnQuc3RhcnRfZGF0ZXRpbWUsXG4gICAgICAgICAgICBldmVudC5lbmRfZGF0ZXRpbWUsXG4gICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgIGV2ZW50LnN0YXR1cyxcbiAgICAgICAgICAgIGV2ZW50LnJhaWRfbW9kdWxlX3R5cGUsXG4gICAgICAgICAgICBldmVudC5pZF9naXJsLFxuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIHRoaXMuY2FwaXRhbGl6ZUZpcnN0KHJhcml0eSksXG4gICAgICAgICAgICBncmFkZSxcbiAgICAgICAgICAgIFwiXCIsIC8vIG9uZSBibGFuayB0YWIgcmVzZXJ2ZWQgZm9yIGZpcnN0IGFwcGVhcmFuY2UgaW4gR1NoZWV0c1xuICAgICAgICAgICAgdGhpcy5nZXRTb3VyY2VJRChldmVudCksXG4gICAgICAgICAgICB0aGlzLmdpcmxIYXNTa2lucyhldmVudClcbiAgICAgICAgXS5qb2luKFwiXFx0XCIpO1xuICAgIH1cblxuICAgIGFzeW5jIGNvcHlUb0NsaXBib2FyZCh0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdDbGlwYm9hcmQgQVBJIGZhaWxlZCwgdXNpbmcgZXhlY0NvbW1hbmQgZmFsbGJhY2s6JywgZXJyKTtcbiAgICAgICAgICAgIGNvbnN0IHRleHRhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgICAgICAgICAgIHRleHRhcmVhLnZhbHVlID0gdGV4dDtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGV4dGFyZWEpO1xuICAgICAgICAgICAgdGV4dGFyZWEuc2VsZWN0KCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0ZXh0YXJlYS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGhhbmRsZUNvcHlDbGljayhldnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgY29uc3Qgc3RvcmFnZUtleSA9ICdMYXN0U2F2ZWRSYWlkSUQnO1xuXG4gICAgICAgIC8vIFNoaWZ0ICsgQ3RybCArIENsaWNrIOKGkiBjbGVhciBzdG9yZWQgSURcbiAgICAgICAgaWYgKGV2dC5zaGlmdEtleSAmJiBldnQuY3RybEtleSkge1xuICAgICAgICAgICAgY29uc3QgY29uZmlybUNsZWFyID0gY29uZmlybSgn4pqg77iPIERvIHlvdSB3YW50IHRvIGNsZWFyIHRoZSBzYXZlZCBsYXN0IHJhaWQgSUQgZm9yIHRoaXMgc2l0ZT8nKTtcbiAgICAgICAgICAgIGlmIChjb25maXJtQ2xlYXIpIHtcbiAgICAgICAgICAgICAgICBsc1JtKHN0b3JhZ2VLZXkpO1xuICAgICAgICAgICAgICAgIGFsZXJ0KCfinIUgTGFzdCBzYXZlZCBJRCBjbGVhcmVkLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9hZCByYWlkc1xuICAgICAgICBjb25zdCBsb2NhbExvdmVSYWlkcyA9ICh0eXBlb2YgbG92ZV9yYWlkcyAhPT0gJ3VuZGVmaW5lZCcgJiYgQXJyYXkuaXNBcnJheShsb3ZlX3JhaWRzKSkgPyBsb3ZlX3JhaWRzIDogW107XG4gICAgICAgIGlmICghbG9jYWxMb3ZlUmFpZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbGVydCgn4pqg77iPIE5vIGxvdmVfcmFpZHMgZm91bmQgb24gdGhpcyBwYWdlLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmdpcmxEaWN0KSB7XG4gICAgICAgICAgICBhbGVydCgn4pqg77iPIFRoZSBISCsrIGdpcmwgZGljdGlvbmFyeSBjb3VsZCBub3QgYmUgbG9hZGVkLiBSZWxvYWQgdGhlIHBhZ2UgYW5kIHRyeSBhZ2Fpbi4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsYXN0U2F2ZWRJZE51bWJlciA9IHBhcnNlSW50KFN0cmluZyhsc0dldChzdG9yYWdlS2V5KSksIDEwKTtcblxuICAgICAgICAvLyBJZiBTaGlmdCBpcyBoZWxkIE9SIG5vIHNhdmVkIElEIGV4aXN0cyDihpIgYXNrIGFnYWluXG4gICAgICAgIGlmIChpc05hTihsYXN0U2F2ZWRJZE51bWJlcikgfHwgZXZ0LnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBjb25zdCBsYXN0U2F2ZWRJZCA9IHByb21wdCgnUGxlYXNlIGVudGVyIHRoZSBsYXN0IHNhdmVkIElEOicpO1xuICAgICAgICAgICAgbGFzdFNhdmVkSWROdW1iZXIgPSBwYXJzZUludChTdHJpbmcobGFzdFNhdmVkSWQpLCAxMCk7XG5cbiAgICAgICAgICAgIGlmIChpc05hTihsYXN0U2F2ZWRJZE51bWJlcikpIHtcbiAgICAgICAgICAgICAgICBhbGVydCgn4p2MIEludmFsaWQgSUQgZW50ZXJlZC4gUGxlYXNlIGVudGVyIGEgdmFsaWQgbnVtYmVyLicpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbHRlciBuZXcgZXZlbnRzXG4gICAgICAgIGNvbnN0IGZpbHRlcmVkRGF0YSA9IGxvY2FsTG92ZVJhaWRzLmZpbHRlcihldmVudCA9PiBOdW1iZXIoZXZlbnQuaWRfcmFpZCkgPiBsYXN0U2F2ZWRJZE51bWJlcik7XG4gICAgICAgIGlmICghZmlsdGVyZWREYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgYWxlcnQoYOKEue+4jyBObyBuZXcgZXZlbnRzIGZvdW5kIHdpdGggSUQgZ3JlYXRlciB0aGFuICR7bGFzdFNhdmVkSWROdW1iZXJ9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmb3JtYXR0ZWREYXRhID0gZmlsdGVyZWREYXRhLm1hcCh0aGlzLmZvcm1hdEV2ZW50Um93LmJpbmQodGhpcykpLmpvaW4oXCJcXG5cIik7XG5cbiAgICAgICAgaWYgKCFhd2FpdCB0aGlzLmNvcHlUb0NsaXBib2FyZChmb3JtYXR0ZWREYXRhKSkge1xuICAgICAgICAgICAgYWxlcnQoJ+KdjCBDb3VsZCBub3QgY29weSB0aGUgcmFpZHMuIFRoZSBsYXN0IHNhdmVkIElEIHdhcyBrZXB0LicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2F2ZSBoaWdoZXN0IElEXG4gICAgICAgIGNvbnN0IG1heElkID0gTWF0aC5tYXgoLi4uZmlsdGVyZWREYXRhLm1hcChlID0+IE51bWJlcihlLmlkX3JhaWQpKSk7XG4gICAgICAgIGxzU2V0KHN0b3JhZ2VLZXksIG1heElkKTtcblxuICAgICAgICBhbGVydCgn4pyFIERhdGEgY29waWVkIHRvIGNsaXBib2FyZCEgWW91IGNhbiBub3cgcGFzdGUgaXQgaW50byBHU2hlZXRzLicpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNvcHlCdXR0b24oKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbjogUmFpZENvcHlCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3JlbWluZGVyLWNvcHknKTtcbiAgICAgICAgYnV0dG9uLnN0eWxlLmNzc1RleHQgPSBgXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjMDBhYWZmIDAsICMwMDY2ODggNTAlLCAjMDA1NTc3IDUxJSwgIzAwYWFmZiAxMDAlKTtcbiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgICAgIHdpZHRoOiAzMnB4O1xuICAgICAgICAgICAgaGVpZ2h0OiAzMnB4O1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IDEwcHg7XG4gICAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICByaWdodDogNC41cmVtO1xuICAgICAgICAgICAgdG9wOiAwLjJyZW07XG4gICAgICAgICAgICBmb250LXNpemU6IDE4cHg7XG4gICAgICAgICAgICBsaW5lLWhlaWdodDogMzJweDtcbiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IGJhY2tncm91bmQgMC4ycyBlYXNlO1xuICAgICAgICBgO1xuICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAn8J+Tiyc7XG4gICAgICAgIGxldCBidXR0b25UaXRsZSA9ICdDbGljayA9IGNvcHkgbmV3IHJhaWRzLiBTaGlmdCAvIFNoaWZ0ICsgQ3RybCBhdmFpbGFibGUuJztcbiAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgndG9vbHRpcCcsICcnKTtcbiAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG5cbiAgICAgICAgY29uc3QgX2JvdW5kQ29weUtleUhhbmRsZXIgPSAoZTogS2V5Ym9hcmRFdmVudCkgPT4gdGhpcy51cGRhdGVDb3B5QnV0dG9uKGUsIGJ1dHRvbik7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgX2JvdW5kQ29weUtleUhhbmRsZXIpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBfYm91bmRDb3B5S2V5SGFuZGxlcik7XG4gICAgICAgIC8vIHN0b3JlIGhhbmRsZXIgcmVmZXJlbmNlIHNvIGNhbGxlcnMgY2FuIHJlbW92ZSBsaXN0ZW5lcnMgaWYgYnV0dG9uIGlzIHJlbW92ZWQgbGF0ZXJcbiAgICAgICAgYnV0dG9uLl9ib3VuZENvcHlLZXlIYW5kbGVyID0gX2JvdW5kQ29weUtleUhhbmRsZXI7XG4gICAgICAgIGJ1dHRvbi5vbmNsaWNrID0gKGUpID0+IHRoaXMuaGFuZGxlQ29weUNsaWNrKGUpO1xuICAgICAgICB0aGlzLnVwZGF0ZUNvcHlCdXR0b24oeyBzaGlmdEtleTogZmFsc2UsIGN0cmxLZXk6IGZhbHNlIH0sIGJ1dHRvbik7XG4gICAgICAgIHJldHVybiBidXR0b247XG4gICAgfVxuXG4gICAgdXBkYXRlQ29weUJ1dHRvbihlOiBQaWNrPEtleWJvYXJkRXZlbnQsICdzaGlmdEtleScgfCAnY3RybEtleSc+LCBidXR0b246IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGxldCBidXR0b25UaXRsZSA9ICcnO1xuICAgICAgICBpZiAoZS5zaGlmdEtleSAmJiBlLmN0cmxLZXkpIHtcbiAgICAgICAgICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjZmY2NjY2IDAsICNhYTAwMDAgMTAwJSlcIjsgLy8gcmVkXG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAn8J+Xke+4jyc7XG4gICAgICAgICAgICBidXR0b25UaXRsZSA9ICdTaGlmdCArIEN0cmwgKyBDbGljayA9IGNsZWFyIHNhdmVkIElEJztcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGUuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjZmZkZDY2IDAsICNjYzk5MDAgMTAwJSlcIjsgLy8geWVsbG93XG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAn4pyP77iPJztcbiAgICAgICAgICAgIGJ1dHRvblRpdGxlID0gJ1NoaWZ0ICsgQ2xpY2sgPSBwcm9tcHQgZm9yIElELic7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjMDBhYWZmIDAsICMwMDY2ODggNTAlLCAjMDA1NTc3IDUxJSwgIzAwYWFmZiAxMDAlKVwiOyAvLyBkZWZhdWx0IGJsdWVcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5OLJztcbiAgICAgICAgICAgIGJ1dHRvblRpdGxlID0gJ0NsaWNrID0gY29weSBuZXcgcmFpZHMuIFNoaWZ0IC8gU2hpZnQgKyBDdHJsIGF2YWlsYWJsZS4nO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbnNlcnRCdXR0b24oKSB7XG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXR0b24tbm90aWZpY2F0aW9uLWFjdGlvbi5ub3RpZl9idXR0b25fcycpO1xuICAgICAgICBpZiAobm90aWZpY2F0aW9uQnV0dG9uICYmICFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVtaW5kZXItY29weScpKSB7XG4gICAgICAgICAgICBjb25zdCBjb3B5QnV0dG9uID0gdGhpcy5jcmVhdGVDb3B5QnV0dG9uKCk7XG4gICAgICAgICAgICBub3RpZmljYXRpb25CdXR0b24ucGFyZW50Tm9kZT8uaW5zZXJ0QmVmb3JlKGNvcHlCdXR0b24sIG5vdGlmaWNhdGlvbkJ1dHRvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICAgICAgdGhpcy5naXJsRGljdCA9IGF3YWl0IGdldEdpcmxEaWN0aW9uYXJ5KCk7XG5cbiAgICAgICAgdGhpcy5fYm91bmRJbnNlcnRCdXR0b24gPSB0aGlzLmluc2VydEJ1dHRvbi5iaW5kKHRoaXMpO1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykgdGhpcy5pbnNlcnRCdXR0b24oKTtcbiAgICAgICAgZWxzZSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuX2JvdW5kSW5zZXJ0QnV0dG9uLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBBY3Rpdml0eVBhcnNlciBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdhY3Rpdml0eVBhcnNlcidcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTWlzc2lvbiBjb3BpZXJcIiwgXCJFbmFibGUgdGhlIGNvcHkgdG9vbCBmb3IgbGVnZW5kYXJ5IG1pc3Npb24gZGV0YWlscy5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdtaXNzaW9uQ29waWVyJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMZWdlbmRhcnkgZGV0YWlsc1wiLCBcIkNsaWNrIGEgbGVnZW5kYXJ5IG1pc3Npb27igJlzIHRpdGxlLCBkZXNjcmlwdGlvbiwgb3IgaW1hZ2UgdG8gY29weSBpdC5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvYWN0aXZpdGllcy5odG1sJylcbiAgICB9XG5cbiAgICBhc3luYyBjb3B5VG9DbGlwYm9hcmQodGV4dDogc3RyaW5nKSB7XG4gICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpO1xuICAgICAgICBjb25zdCB0b2FzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0b2FzdC50ZXh0Q29udGVudCA9ICdDb3BpZWQhJztcbiAgICAgICAgdG9hc3Quc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgICAgICB0b2FzdC5zdHlsZS5ib3R0b20gPSAnMTBweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnJpZ2h0ID0gJzEwcHgnO1xuICAgICAgICB0b2FzdC5zdHlsZS5iYWNrZ3JvdW5kID0gJ3JnYmEoMCwwLDAsMC43KSc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmNvbG9yID0gJ3doaXRlJztcbiAgICAgICAgdG9hc3Quc3R5bGUucGFkZGluZyA9ICc1cHggMTBweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmJvcmRlclJhZGl1cyA9ICc1cHgnO1xuICAgICAgICB0b2FzdC5zdHlsZS56SW5kZXggPSAnOTk5OSc7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodG9hc3QpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRvYXN0LnJlbW92ZSgpLCAxMDAwKTtcbiAgICB9XG5cbiAgICBydW4oeyBtaXNzaW9uQ29waWVyIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBpZiAobWlzc2lvbkNvcGllcikge1xuICAgICAgICAgICAgY29uc3QgZW50cmllcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5taXNzaW9uX2VudHJ5LmxlZ2VuZGFyeScpO1xuICAgICAgICAgICAgaWYgKCFlbnRyaWVzLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBlbnRyaWVzLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGltZ0RpdiA9IGVudHJ5LnF1ZXJ5U2VsZWN0b3I8SFRNTEltYWdlRWxlbWVudD4oJy5taXNzaW9uX2ltYWdlIGltZycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlQWxsID0gZW50cnkucXVlcnlTZWxlY3RvcjxIVE1MSGVhZGluZ0VsZW1lbnQ+KCcubWlzc2lvbl9kZXRhaWxzIGgxJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVzYyA9IGVudHJ5LnF1ZXJ5U2VsZWN0b3I8SFRNTFBhcmFncmFwaEVsZW1lbnQ+KCcubWlzc2lvbl9kZXRhaWxzIHAnKTtcblxuICAgICAgICAgICAgICAgIGlmIChpbWdEaXYpIHtcbiAgICAgICAgICAgICAgICAgICAgaW1nRGl2LnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgaW1nRGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQoaW1nRGl2LnNyYyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0aXRsZUFsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZUFsbC5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG91dGVyVGl0bGUgPSB0aXRsZUFsbC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmV2ZW50LW1pc3Npb24tY29udGVudC10ZXh0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvdXRlclRpdGxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlclRpdGxlLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyVGl0bGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKChvdXRlclRpdGxlLnRleHRDb250ZW50ID8/ICcnKS50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aXRsZUFsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCAmJiBlLnRhcmdldC5jbG9zZXN0KCcuZXZlbnQtbWlzc2lvbi1jb250ZW50LXRleHQnKSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGl0bGVDbG9uZSA9IHRpdGxlQWxsLmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MSGVhZGluZ0VsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZUNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5ldmVudC1taXNzaW9uLWNvbnRlbnQtdGV4dCcpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gKHRpdGxlQ2xvbmUudGV4dENvbnRlbnQgPz8gJycpLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKHRpdGxlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGRlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzYy5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgICAgIGRlc2MuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZChkZXNjLmlubmVyVGV4dC50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCAiW3tcInZlcnNpb25cIjpcIjAuNy4zXCIsXCJjaGFuZ2VzXCI6W1wiU2VlIGF1dG9tYXRpYyBjaGFuZ2Vsb2dzIG9ubHkgd2hlbiBsb2FkaW5nIHRoZSBob21lcGFnZSBhZnRlciBhbiB1cGRhdGUuXCIsXCJFbmFibGUgU2lsZW50IGNoYW5nZWxvZyB0byBnZXQgYSBOZXcgYnV0dG9uIGJlc2lkZSBISCsrIGFuZCBvcGVuIHRoZSBub3RlcyB3aGVuIHlvdeKAmXJlIHJlYWR5LlwiLFwiS2VlcCB0aGUgY29udGVzdCBsaXN0IGFuZCBlYWNoIGxlYWRlcmJvYXJkIGluIHBsYWNlIHdoZW4gc3dpdGNoaW5nIGNvbnRlc3RzIHdpdGggU3RvcCBzY3JvbGxpbmcgb24gY29udGVzdCBzd2l0Y2hlcy5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4yXCIsXCJjaGFuZ2VzXCI6W1wiT3BlbiB0aGUgYm90dG9tIGFjdGl2ZSBjb250ZXN0IGF0IHlvdXIgcmFuayBieSBkZWZhdWx0LiBDaG9vc2UgQ2JDLCBDQ0MsIG9yIExDIHRvIHByZWZlciB0aGF0IGV2ZW50IHdoZW4gYXZhaWxhYmxlLlwiLFwiVHVybiBvZmYgYXV0b21hdGljIHVwZGF0ZSBub3RpY2VzIHdpdGggRG9u4oCZdCBzaG93IGFnYWluIGluIHRoZSBjaGFuZ2Vsb2cgcG9wdXAuIFZpZXcgY2hhbmdlbG9nIHN0YXlzIGF2YWlsYWJsZSBpbiBzZXR0aW5ncy5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4xXCIsXCJjaGFuZ2VzXCI6W1wiS2VlcCB0aGUgY2hhbmdlbG9nIGNlbnRlcmVkIHdoZW4gdGhlIGdhbWUgd2luZG93IGlzIHJlc2l6ZWQuXCIsXCJDbGVhbiB1cCBzYXZlZCBwbGF5ZXIgbmFtZXMsIGV4cGxhaW4gdW5rbm93biBuYW1lcyBvbiBob3ZlciwgYW5kIGdpdmUgUmVtb3ZlIGJ1dHRvbnMgbW9yZSByb29tLlwiXX0se1widmVyc2lvblwiOlwiMC43LjBcIixcImNoYW5nZXNcIjpbXCJTZWUgd2hhdCBjaGFuZ2VkIGluIEphcnZpcyB0aGUgZmlyc3QgdGltZSBhIG5ldyB2ZXJzaW9uIHJ1bnMuXCIsXCJPcGVuIFZpZXcgY2hhbmdlbG9nIGZyb20gSEgrKyBzZXR0aW5ncyBhdCBhbnkgdGltZSwgZXZlbiB3aXRoIGF1dG9tYXRpYyBub3RpY2VzIHR1cm5lZCBvZmYuXCIsXCJFeHBhbmQgRWFybGllciB2ZXJzaW9ucyB0byByZWFkIHBhc3QgdXBkYXRlcy5cIl19LHtcInZlcnNpb25cIjpcIjAuNi43XCIsXCJjaGFuZ2VzXCI6W1wiTWFrZSBtYXJraW5nIG9uZSBhY3Rpb24gcGVyIHBsYXllciwgYmFja2ZpbGwgbmFtZXMgZm9yIG9sZGVyIG1hcmtzLCB1c2UgdGhlIGJyYWNrZXQtYmFzZWQgcHJvbW90aW9uIHRhcmdldCwgYW5kIHNpbXBsaWZ5IHRoZSBzZWxlY3RlZCBjb250ZXN0IGJ1dHRvbnMgYW5kIHZlcnNpb24gYmFkZ2UuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuNlwiLFwiY2hhbmdlc1wiOltcIkFkZCBzZXR0aW5nIGhlbHAgaW4gSEgrKywgaW1wcm92ZSBtYXJrIGNvbnRyYXN0IGFuZCBtYW5hZ2VtZW50LCBhbmQgYWRkIGF1dG9tYXRpYyBjb250ZXN0IGRlZmF1bHRzLlwiLFwiUmVuYW1lIHRoZSBzZXBhcmF0ZWx5IGluc3RhbGxlZCB0ZXN0aW5nIHVzZXJzY3JpcHQgdG8gRGV2LlwiXX0se1widmVyc2lvblwiOlwiMC42LjVcIixcImNoYW5nZXNcIjpbXCJNb3ZlIHRoZSB1c2Vyc2NyaXB0IHNvdXJjZSBpbnRvIFR5cGVTY3JpcHQgbW9kdWxlcyBhbmQgYWRkIHNlcGFyYXRlIHN0YWJsZSBhbmQgdGVzdGluZyBidWlsZHMuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuNFwiLFwiY2hhbmdlc1wiOltcIlByZXZlbnQgcGlubmVkIGNvbnRlc3Qgc3RhcnR1cCBzY3JvbGxpbmcsIGtlZXAgbmF0aXZlIHN0YXJ0dXAgd2l0aG91dCBhIHBpbiwgYW5kIGNsZWFyIGZpbmlzaGVkIHBpbnNcIl19LHtcInZlcnNpb25cIjpcIjAuNi4zXCIsXCJjaGFuZ2VzXCI6W1wiU3RvcCBib3RoIGNvbnRlc3Qgc3RhcnR1cCBzY3JvbGxzLCBpc29sYXRlIHRoZSBzZWxlY3RlZCBsZWFkZXJib2FyZCwgYW5kIHJlc3RvcmUgcGlubmVkIGNvbnRlc3RzIGF0IFRvcCBvciBNeSByYW5rXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuMlwiLFwiY2hhbmdlc1wiOltcIlBpbiBjb250ZXN0cyBvbiB0aGVpciBjYXJkcywgaGlkZSB0aGUgc3RhcnR1cCBzY3JvbGwsIGFuZCB1c2UgcmlnaHQtY2xpY2sgbWFya2luZyB3aXRoIGlzb2xhdGVkIHNldHRpbmdzIHNjcm9sbGluZ1wiXX0se1widmVyc2lvblwiOlwiMC42LjFcIixcImNoYW5nZXNcIjpbXCJSZWFkIG5hdGl2ZSBNYW5nYSBSUEcgY29udGVzdCB0aXRsZXMgYW5kIHJlY29nbml6ZSBhY3RpdmUgY2FyZHMgd2hlbiBjb250ZXN0IGRhdGEgaXMgdW5hdmFpbGFibGVcIl19LHtcInZlcnNpb25cIjpcIjAuNi4wXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIGEgY29udGVzdCBzdGFydCBwcmVmZXJlbmNlLCBjb250aW51b3VzIG1hcmtpbmcsIGFuZCBjb21wYWN0IHNldHRpbmdzIHdpdGggYSB2ZXJzaW9uIGxhYmVsXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjUuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBsZWFndWUgYW5kIGNvbnRlc3QgcGxheWVyIG1hcmtpbmcgd2l0aCBjdXN0b20gY29sb3JzLCBjb21wYWN0IHNldHRpbmdzLCBhbmQgbGltaXQgVG9wIDIwIHRvIHByb21vdGFibGUgbGVhZ3Vlc1wiXX0se1widmVyc2lvblwiOlwiMC40LjJcIixcImNoYW5nZXNcIjpbXCJGaXggbW9kdWxlIHN0YXJ0dXAsIGxlYWd1ZSBjb250cm9scywgYW5kIHJhaWQgZXhwb3J0czsgYWRkIHRoZSBUb3AgMjAgbGVhZ3VlIHRhcmdldFwiXX0se1widmVyc2lvblwiOlwiMC40LjFcIixcImNoYW5nZXNcIjpbXCJGaXggTG92ZSBSYWlkcyBzaGFkb3dzIHJlcGxhY2VtZW50XCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjQuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBBY3Rpdml0eVBhcnNlciBtb2R1bGVcIl19LHtcInZlcnNpb25cIjpcIjAuMy4xXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIGhhcmVtIGxpbmsgaW5zaWRlIGxvdmUgcmFpZCBjYXJkc1wiXX0se1widmVyc2lvblwiOlwiMC4zLjBcIixcImNoYW5nZXNcIjpbXCJBZGQgTG92ZVJhaWRzQWRkb24gYW5kIExvdmVSYWlkc1BhcnNlciBtb2R1bGVzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjIuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBSZW1vdmVQYXNzTG9jayBtb2R1bGVcIl19LHtcInZlcnNpb25cIjpcIjAuMS4zXCIsXCJjaGFuZ2VzXCI6W1wiQmV0dGVyIGNvZGUgcHJhY3RpY2VzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjEuMlwiLFwiY2hhbmdlc1wiOltcIlBvbGlzaGluZyBhbmQgdXBkYXRlIGxpbmtzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjEuMVwiLFwiY2hhbmdlc1wiOltcIkFkZCBGcmllbmRBbmRGb2VzIG1vZHVsZVwiXX0se1widmVyc2lvblwiOlwiMC4wLjFcIixcImNoYW5nZXNcIjpbXCJJbml0aWFsIHJlbGVhc2VcIl19XSIsICJpbXBvcnQgeyAkIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5cbmludGVyZmFjZSBDaGFuZ2Vsb2dWaWV3IHtcbiAgICBjb250ZW50OiBIVE1MRWxlbWVudDtcbiAgICBjbG9zZUJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gICAgc2hvdWxkT3BlbjogKCkgPT4gYm9vbGVhbjtcbiAgICBvbk9wZW46ICgpID0+IHZvaWQ7XG4gICAgb25DbG9zZTogKCkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dDaGFuZ2Vsb2dQb3B1cCh2aWV3OiBDaGFuZ2Vsb2dWaWV3KSB7XG4gICAgY29uc3QgZGlhbG9nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGlhbG9nJyk7XG4gICAgZGlhbG9nLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY2hhbmdlbG9nLXBvcHVwJztcbiAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsbGVkYnknLCAnamFydmlzLWNoYW5nZWxvZy10aXRsZScpO1xuICAgIGRpYWxvZy5hcHBlbmRDaGlsZCh2aWV3LmNvbnRlbnQpO1xuXG4gICAgY29uc3Qgb3BlbkRpYWxvZyA9ICgpID0+IHtcbiAgICAgICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgICAgICB2aWV3LmNsb3NlQnV0dG9uLmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcbiAgICAgICAgdmlldy5vbk9wZW4oKTtcbiAgICB9O1xuICAgIGNvbnN0IGJpbmRDbG9zZSA9IChkaXNtaXNzOiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXJzID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICBjb25zdCBvcHRpb25zID0geyBzaWduYWw6IGhhbmRsZXJzLnNpZ25hbCB9O1xuICAgICAgICB2aWV3LmNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZGlzbWlzcywgb3B0aW9ucyk7XG4gICAgICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjYW5jZWwnLCBldmVudCA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZGlzbWlzcygpO1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCAhPT0gZGlhbG9nKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBib3VuZHMgPSBkaWFsb2cuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBpZiAoZXZlbnQuY2xpZW50WCA8IGJvdW5kcy5sZWZ0IHx8IGV2ZW50LmNsaWVudFggPiBib3VuZHMucmlnaHQgfHxcbiAgICAgICAgICAgICAgICBldmVudC5jbGllbnRZIDwgYm91bmRzLnRvcCB8fCBldmVudC5jbGllbnRZID4gYm91bmRzLmJvdHRvbSkgZGlzbWlzcygpO1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIGhhbmRsZXJzO1xuICAgIH07XG5cbiAgICBjb25zdCBxdWV1ZSA9IHdpbmRvdy5zaGFyZWQ/LlBvcHVwUXVldWVNYW5hZ2VyO1xuICAgIGNvbnN0IGhvc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29tbW9uLXBvcHVwcycpO1xuICAgIGlmIChob3N0ICYmIHR5cGVvZiBxdWV1ZT8uYWRkID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBxdWV1ZS5jbG9zZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb25zdCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHdyYXBwZXIuY2xhc3NOYW1lID0gJ3BvcHVwX3dyYXBwZXIgamFydmlzLWNoYW5nZWxvZy1uYXRpdmUnO1xuICAgICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgICAgIGxldCBhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgZGlzbWlzcyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghYWN0aXZlKSByZXR1cm47XG4gICAgICAgICAgICBhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHF1ZXVlLmNsb3NlKHsgdHlwZTogJ2NvbW1vbicgfSk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGhhbmRsZXJzID0gYmluZENsb3NlKGRpc21pc3MpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcXVldWUuYWRkKHsgcG9wdXA6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnY29tbW9uJyxcbiAgICAgICAgICAgICAgICBwb3B1cF9uYW1lOiAnamFydmlzX2NoYW5nZWxvZycsXG4gICAgICAgICAgICAgICAgY2xvc2Vfb25fZXNjOiBmYWxzZSwgLy8gVGhlIGRpYWxvZyBoYW5kbGVzIEVzY2FwZSwgc28gdGhlIHF1ZXVlIGlzIGNsb3NlZCBvbmx5IG9uY2UuXG4gICAgICAgICAgICAgICAgJGRvbV9lbGVtZW50OiAkKHdyYXBwZXIpLFxuICAgICAgICAgICAgICAgIGluaXQ6ICgpID0+IGhvc3QuYXBwZW5kQ2hpbGQod3JhcHBlciksXG4gICAgICAgICAgICAgICAgb25PcGVuOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdmlldy5zaG91bGRPcGVuKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTWljcm90YXNrKGRpc21pc3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghd3JhcHBlci5pc0Nvbm5lY3RlZCkgaG9zdC5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcbiAgICAgICAgICAgICAgICAgICAgb3BlbkRpYWxvZygpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnM6ICgpID0+IHt9LFxuICAgICAgICAgICAgICAgIG9uQ2xvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkaWFsb2cub3BlbikgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHZpZXcub25DbG9zZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6ICgpID0+IGhhbmRsZXJzLmFib3J0KCksXG4gICAgICAgICAgICAgICAgZGVzdHJveTogZGlzbWlzc1xuICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBoYW5kbGVycy5hYm9ydCgpO1xuICAgICAgICAgICAgaWYgKGRpYWxvZy5vcGVuKSBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgICAgIHdyYXBwZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3QgdXNlIHRoZSBnYW1lIHBvcHVwIHF1ZXVlOicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXZpZXcuc2hvdWxkT3BlbigpKSB7XG4gICAgICAgIHZpZXcub25DbG9zZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZpbmlzaCA9ICgpID0+IHtcbiAgICAgICAgaGFuZGxlcnMuYWJvcnQoKTtcbiAgICAgICAgZGlhbG9nLnJlbW92ZSgpO1xuICAgICAgICB2aWV3Lm9uQ2xvc2UoKTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZXJzID0gYmluZENsb3NlKCgpID0+IHtcbiAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgIGZpbmlzaCgpO1xuICAgIH0pO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGZpbmlzaCwgeyBzaWduYWw6IGhhbmRsZXJzLnNpZ25hbCB9KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgb3BlbkRpYWxvZygpO1xufVxuIiwgImltcG9ydCByZWxlYXNlTm90ZXMgZnJvbSAnLi4vLi4vLi4vQ0hBTkdFTE9HLm1kJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBISE1vZHVsZSwgdHlwZSBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgc2hvd0NoYW5nZWxvZ1BvcHVwIH0gZnJvbSAnLi9jaGFuZ2Vsb2dQb3B1cCc7XG5cbmNvbnN0IHNlZW5LZXkgPSBgQ2hhbmdlbG9nU2VlbiR7VVNFUlNDUklQVF9DSEFOTkVMfWA7XG5jb25zdCBsYXRlc3RWZXJzaW9uID0gcmVsZWFzZU5vdGVzWzBdLnZlcnNpb247XG5jb25zdCBjb25maWdLZXkgPSAnSkFSVklTX2NoYW5nZWxvZyc7XG5jb25zdCBzZXR0aW5nc0NhcmQgPSBgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmdbcmVsPVwiJHtjb25maWdLZXl9XCJdYDtcblxuZnVuY3Rpb24gcmVhZFNlZW5WZXJzaW9uKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNlZW4gPSBsc0dldChzZWVuS2V5KTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBzZWVuID09PSAnc3RyaW5nJyAmJiAvXlxcZCtcXC5cXGQrXFwuXFxkKyQvLnRlc3Qoc2VlbikgPyBzZWVuIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc05ld2VyKHZlcnNpb246IHN0cmluZywgcHJldmlvdXM6IHN0cmluZyB8IG51bGwpIHtcbiAgICBpZiAoIXByZXZpb3VzKSByZXR1cm4gdHJ1ZTtcblxuICAgIGNvbnN0IG9sZFBhcnRzID0gcHJldmlvdXMuc3BsaXQoJy4nKS5tYXAoTnVtYmVyKTtcbiAgICBjb25zdCBuZXdQYXJ0cyA9IHZlcnNpb24uc3BsaXQoJy4nKS5tYXAoTnVtYmVyKTtcbiAgICBmb3IgKGNvbnN0IFtpbmRleCwgcGFydF0gb2YgbmV3UGFydHMuZW50cmllcygpKSB7XG4gICAgICAgIGlmIChwYXJ0ICE9PSBvbGRQYXJ0c1tpbmRleF0pIHJldHVybiBwYXJ0ID4gb2xkUGFydHNbaW5kZXhdO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHJlbGVhc2VTZWN0aW9uKHJlbGVhc2U6IHR5cGVvZiByZWxlYXNlTm90ZXNbbnVtYmVyXSkge1xuICAgIGNvbnN0IHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgY29uc3QgaGVhZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgaGVhZGluZy50ZXh0Q29udGVudCA9IGB2JHtyZWxlYXNlLnZlcnNpb259YDtcbiAgICBjb25zdCBjaGFuZ2VzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiByZWxlYXNlLmNoYW5nZXMpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgIGl0ZW0udGV4dENvbnRlbnQgPSBjaGFuZ2U7XG4gICAgICAgIGNoYW5nZXMuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gICAgfVxuICAgIHNlY3Rpb24uYXBwZW5kKGhlYWRpbmcsIGNoYW5nZXMpO1xuICAgIHJldHVybiBzZWN0aW9uO1xufVxuXG5leHBvcnQgY2xhc3MgQ2hhbmdlbG9nIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgcGVuZGluZzogJ2F1dG9tYXRpYycgfCAnbWFudWFsJyB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgb3BlbmVyOiBIVE1MQnV0dG9uRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgdmlld2VkVGhpc1BhZ2UgPSBmYWxzZTtcbiAgICBwcml2YXRlIGxvYWRMaXN0ZW5lcjogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzZXR0aW5nc0luc3RhbGxlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgc2lsZW50ID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBub3RpY2U6IEhUTUxCdXR0b25FbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSB3YWl0aW5nRm9yTm90aWNlQW5jaG9yID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdjaGFuZ2Vsb2cnO1xuICAgICAgICBzdXBlcih7IG5hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYToge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscCgnVXBkYXRlIG5vdGljZXMnLCAnU2hvdyB0aGUgY2hhbmdlbG9nIHRoZSBmaXJzdCB0aW1lIHlvdSBsb2FkIHRoZSBob21lcGFnZSBhZnRlciBhbiB1cGRhdGUuIFVzZSBWaWV3IGNoYW5nZWxvZyB0byBvcGVuIGl0IHdoZW5ldmVyIHlvdSBsaWtlLicpLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ3NpbGVudCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKCdTaWxlbnQgY2hhbmdlbG9nJywgJ1B1dCBhIE5ldyBidXR0b24gYmVzaWRlIEhIKysgb24gdGhlIGhvbWVwYWdlIHdoZW4gYW4gdXBkYXRlIGlzIGF2YWlsYWJsZS4gQ2xpY2sgaXQgdG8gcmVhZCB0aGUgY2hhbmdlbG9nLicpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9IH0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlID09PSAnL2hvbWUuaHRtbCc7XG4gICAgfVxuXG4gICAgaW5zdGFsbFNldHRpbmdzKCkge1xuICAgICAgICBpZiAoIXRoaXMuc2hvdWxkUnVuKCkpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXR0aW5nc0luc3RhbGxlZCA9IHRydWU7XG5cbiAgICAgICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZXR0aW5nc0NhcmQsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNldHRpbmdzQ2FyZCk7XG4gICAgICAgICAgICBpZiAoIWNhcmQgfHwgY2FyZC5xdWVyeVNlbGVjdG9yKCcuamFydmlzLXZpZXctY2hhbmdlbG9nJykpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24gamFydmlzLXZpZXctY2hhbmdlbG9nJztcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICdWaWV3IGNoYW5nZWxvZyc7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLm9wZW4oJ21hbnVhbCcsIGJ1dHRvbikpO1xuICAgICAgICAgICAgY2FyZC5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBydW4oeyBzaWxlbnQgPSBmYWxzZSB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHJldHVybjtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnNpbGVudCA9IHNpbGVudDtcbiAgICAgICAgLy8gSEgrKyBjYW4gcnVuIHRoZSBtb2R1bGUgYWdhaW4gd2hlbiB0aGUgdXNlciB0dXJucyBub3RpY2VzIG9uIGluIHRoZSBzZXR0aW5ncyBwYW5lLlxuICAgICAgICBjb25zdCBhbGxvd0F1dG9tYXRpYyA9ICF0aGlzLnNldHRpbmdzSW5zdGFsbGVkO1xuXG4gICAgICAgIGNvbnN0IGNoZWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmhhc1VucmVhZFVwZGF0ZSgpKSByZXR1cm47XG4gICAgICAgICAgICBpZiAodGhpcy5zaWxlbnQpIHRoaXMuc2hvd05vdGljZSgpO1xuICAgICAgICAgICAgZWxzZSBpZiAoYWxsb3dBdXRvbWF0aWMpIHRoaXMub3BlbignYXV0b21hdGljJyk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSBjaGVjaygpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9hZExpc3RlbmVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBjaGVjaywgeyBvbmNlOiB0cnVlLCBzaWduYWw6IHRoaXMubG9hZExpc3RlbmVyLnNpZ25hbCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRlYXJEb3duKCkge1xuICAgICAgICB0aGlzLmxvYWRMaXN0ZW5lcj8uYWJvcnQoKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZW1vdmVOb3RpY2UoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVTdWJTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogYm9vbGVhbikge1xuICAgICAgICBpZiAoa2V5ICE9PSAnc2lsZW50JykgcmV0dXJuO1xuICAgICAgICB0aGlzLnNpbGVudCA9IHZhbHVlO1xuICAgICAgICBpZiAodmFsdWUpIHRoaXMuc2hvd05vdGljZSgpO1xuICAgICAgICBlbHNlIHRoaXMucmVtb3ZlTm90aWNlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYXNVbnJlYWRVcGRhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc1J1biAmJiAhdGhpcy52aWV3ZWRUaGlzUGFnZSAmJiBpc05ld2VyKGxhdGVzdFZlcnNpb24sIHJlYWRTZWVuVmVyc2lvbigpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNob3dOb3RpY2UoKSB7XG4gICAgICAgIGlmICghdGhpcy5zaWxlbnQgfHwgIXRoaXMuaGFzVW5yZWFkVXBkYXRlKCkgfHwgdGhpcy5ub3RpY2UgfHwgdGhpcy53YWl0aW5nRm9yTm90aWNlQW5jaG9yKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSAnLmhoLXBsdXMtcGx1cy1jb25maWctYnV0dG9uJztcbiAgICAgICAgdGhpcy53YWl0aW5nRm9yTm90aWNlQW5jaG9yID0gdHJ1ZTtcbiAgICAgICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy53YWl0aW5nRm9yTm90aWNlQW5jaG9yID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCBhbmNob3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICghYW5jaG9yIHx8ICF0aGlzLnNpbGVudCB8fCAhdGhpcy5oYXNVbnJlYWRVcGRhdGUoKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1jaGFuZ2Vsb2ctbm90aWNlJztcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICdOZXcnO1xuICAgICAgICAgICAgYnV0dG9uLnRpdGxlID0gJ1JlYWQgdGhlIEphcnZpcyBjaGFuZ2Vsb2cnO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdOZXcgSmFydmlzIHVwZGF0ZS4gUmVhZCB0aGUgY2hhbmdlbG9nLicpO1xuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMub3BlbignbWFudWFsJywgYnV0dG9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5ub3RpY2UgPSBhbmNob3IuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVOb3RpY2UoKSB7XG4gICAgICAgIHRoaXMubm90aWNlPy5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5ub3RpY2UgPSBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGlzYWJsZU5vdGljZXMoKSB7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHdpbmRvdy5oaFBsdXNQbHVzQ29uZmlnO1xuICAgICAgICBpZiAoIWNvbmZpZyB8fCAhY29uZmlnLmNvbmZpZ1tjb25maWdLZXldKSByZXR1cm47XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbmZpZy5sb2FkQ29uZmlnKCk7XG4gICAgICAgICAgICBjb25maWcuY29uZmlnW2NvbmZpZ0tleV0gPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbmZpZy5zYXZlQ29uZmlnKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uZmlnLmNvbmZpZ1tjb25maWdLZXldID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCB0dXJuIG9mZiB1cGRhdGUgbm90aWNlczonLCBlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSEgrKyBjcmVhdGVzIGl0cyBzZXR0aW5ncyBwYW5lIGxhemlseSwgc28gdGhlIHBvcHVwIGNhbiBjbG9zZSBiZWZvcmUgdGhlIHBhbmUgZXhpc3RzLlxuICAgICAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZXR0aW5nc0NhcmQpO1xuICAgICAgICBjb25zdCBjaGVja2JveCA9IGNhcmQ/LnF1ZXJ5U2VsZWN0b3I8SFRNTElucHV0RWxlbWVudD4oYGlucHV0W25hbWU9XCIke2NvbmZpZ0tleX1cIl1gKTtcbiAgICAgICAgaWYgKGNoZWNrYm94KSBjaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIGNhcmQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2VuYWJsZWQnKTtcbiAgICAgICAgY29uc3Qgc2lsZW50ID0gY2FyZD8ucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihgaW5wdXRbbmFtZT1cIiR7Y29uZmlnS2V5fV9zaWxlbnRcIl1gKTtcbiAgICAgICAgaWYgKHNpbGVudCkgc2lsZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50ZWFyRG93bigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb3Blbihtb2RlOiAnYXV0b21hdGljJyB8ICdtYW51YWwnLCBvcGVuZXI6IEhUTUxCdXR0b25FbGVtZW50IHwgbnVsbCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNob3VsZFJ1bigpKSByZXR1cm47XG4gICAgICAgIGlmIChtb2RlID09PSAnbWFudWFsJykgdGhpcy5vcGVuZXIgPSBvcGVuZXI7XG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmcpIHtcbiAgICAgICAgICAgIGlmIChtb2RlID09PSAnbWFudWFsJykgdGhpcy5wZW5kaW5nID0gbW9kZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBlbmRpbmcgPSBtb2RlO1xuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzID0gcmVhZFNlZW5WZXJzaW9uKCk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGVudC5jbGFzc05hbWUgPSAnY29udGFpbmVyLXNwZWNpYWwtYmcgamFydmlzLWNoYW5nZWxvZy1jb250ZW50JztcbiAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgICAgICB0aXRsZS5pZCA9ICdqYXJ2aXMtY2hhbmdlbG9nLXRpdGxlJztcbiAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSAnSmFydmlzIGNoYW5nZWxvZyc7XG4gICAgICAgIGNvbnN0IG5vdGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG5vdGVzLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY2hhbmdlbG9nLW5vdGVzJztcbiAgICAgICAgY29uc3QgbmV3UmVsZWFzZXMgPSBwcmV2aW91cyAmJiBpc05ld2VyKGxhdGVzdFZlcnNpb24sIHByZXZpb3VzKVxuICAgICAgICAgICAgPyByZWxlYXNlTm90ZXMuZmlsdGVyKHJlbGVhc2UgPT4gaXNOZXdlcihyZWxlYXNlLnZlcnNpb24sIHByZXZpb3VzKSkubGVuZ3RoXG4gICAgICAgICAgICA6IDE7XG4gICAgICAgIG5vdGVzLmFwcGVuZCguLi5yZWxlYXNlTm90ZXMuc2xpY2UoMCwgbmV3UmVsZWFzZXMpLm1hcChyZWxlYXNlU2VjdGlvbikpO1xuICAgICAgICBjb25zdCBlYXJsaWVyID0gcmVsZWFzZU5vdGVzLnNsaWNlKG5ld1JlbGVhc2VzKTtcbiAgICAgICAgaWYgKGVhcmxpZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBoaXN0b3J5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGV0YWlscycpO1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N1bW1hcnknKTtcbiAgICAgICAgICAgIHN1bW1hcnkudGV4dENvbnRlbnQgPSAnRWFybGllciB2ZXJzaW9ucyc7XG4gICAgICAgICAgICBoaXN0b3J5LmFwcGVuZChzdW1tYXJ5LCAuLi5lYXJsaWVyLm1hcChyZWxlYXNlU2VjdGlvbikpO1xuICAgICAgICAgICAgbm90ZXMuYXBwZW5kQ2hpbGQoaGlzdG9yeSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmb290ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb290ZXInKTtcbiAgICAgICAgY29uc3Qgb3B0T3V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAgICAgb3B0T3V0LmNsYXNzTmFtZSA9ICdqYXJ2aXMtY2hhbmdlbG9nLW9wdC1vdXQnO1xuICAgICAgICBjb25zdCBkb250U2hvd0FnYWluID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgZG9udFNob3dBZ2Fpbi50eXBlID0gJ2NoZWNrYm94JztcbiAgICAgICAgb3B0T3V0LmFwcGVuZChkb250U2hvd0FnYWluLCAnRG9u4oCZdCBzaG93IGFnYWluJyk7XG4gICAgICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNsb3NlQnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgY2xvc2VCdXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgICAgIGNsb3NlQnV0dG9uLnRleHRDb250ZW50ID0gJ0Nsb3NlJztcbiAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uKTtcbiAgICAgICAgY29udGVudC5hcHBlbmQodGl0bGUsIG5vdGVzLCBmb290ZXIpO1xuXG4gICAgICAgIHNob3dDaGFuZ2Vsb2dQb3B1cCh7XG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgY2xvc2VCdXR0b24sXG4gICAgICAgICAgICBzaG91bGRPcGVuOiAoKSA9PiB0aGlzLnBlbmRpbmcgPT09ICdtYW51YWwnIHx8ICghdGhpcy5zaWxlbnQgJiYgdGhpcy5oYXNVbnJlYWRVcGRhdGUoKSksXG4gICAgICAgICAgICBvbk9wZW46ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdlZFRoaXNQYWdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZU5vdGljZSgpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhhc1J1bikgZm9vdGVyLnByZXBlbmQob3B0T3V0KTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNOZXdlcihsYXRlc3RWZXJzaW9uLCByZWFkU2VlblZlcnNpb24oKSkpIGxzU2V0KHNlZW5LZXksIGxhdGVzdFZlcnNpb24pO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB0aGUgdmlld2VkIGNoYW5nZWxvZyB2ZXJzaW9uOicsIGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ2xvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBlbmRpbmcgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChkb250U2hvd0FnYWluLmNoZWNrZWQpIHRoaXMuZGlzYWJsZU5vdGljZXMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5lcj8uZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMub3BlbmVyID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IGluaXRHYW1lIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IGluamVjdFN0eWxlcywgcGFja1NldHRpbmdzIH0gZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBGcmllbmRBbmRGb2VzIH0gZnJvbSAnLi9tb2R1bGVzL3BsYXllcnMvRnJpZW5kQW5kRm9lcyc7XG5pbXBvcnQgeyBhcm1Db250ZXN0U3RhcnR1cEd1YXJkLCBDb250ZXN0U3RhcnQgfSBmcm9tICcuL21vZHVsZXMvY29udGVzdHMvQ29udGVzdFN0YXJ0JztcbmltcG9ydCB7IGluc3RhbGxDb250ZXN0U2V0dGluZ3MgfSBmcm9tICcuL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzJztcbmltcG9ydCB7IExlYWd1ZVRvcDIwIH0gZnJvbSAnLi9tb2R1bGVzL3BsYXllcnMvTGVhZ3VlVG9wMjAnO1xuaW1wb3J0IHsgUmVtb3ZlUGFzc0xvY2sgfSBmcm9tICcuL21vZHVsZXMvcHJvZ3Jlc3Npb24vUmVtb3ZlUGFzc0xvY2snO1xuaW1wb3J0IHsgTG92ZVJhaWRzQWRkb24gfSBmcm9tICcuL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNBZGRvbic7XG5pbXBvcnQgeyBMb3ZlUmFpZHNQYXJzZXIgfSBmcm9tICcuL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNQYXJzZXInO1xuaW1wb3J0IHsgQWN0aXZpdHlQYXJzZXIgfSBmcm9tICcuL21vZHVsZXMvYWN0aXZpdGllcy9BY3Rpdml0eVBhcnNlcic7XG5pbXBvcnQgeyBDaGFuZ2Vsb2cgfSBmcm9tICcuL21vZHVsZXMvdXBkYXRlcy9DaGFuZ2Vsb2cnO1xuXG5hcm1Db250ZXN0U3RhcnR1cEd1YXJkKCk7XG5cbmZ1bmN0aW9uIHJ1bkphcnZpcygpIHtcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBydW5KYXJ2aXMsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgJCB9ID0gd2luZG93O1xuXG4gICAgaWYgKCEkKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJ1bkphcnZpcywgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICBjb25zb2xlLmxvZygnV0FSTklORzogTm8galF1ZXJ5IGZvdW5kLiBFbmRpbmcgc2NyaXB0LicpO1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnSGVsbG8sIFNpciwgSi5BLlIuVi5JLlMuIGlzIHJlYWR5IHRvIGhlbHAgeW91LicpO1xuXG4gICAgaW5pdEdhbWUoJCk7XG4gICAgaW5qZWN0U3R5bGVzKCk7XG5cbiAgICBjb25zdCBmcmllbmRzQW5kRm9lcyA9IG5ldyBGcmllbmRBbmRGb2VzKCk7XG4gICAgY29uc3QgY2hhbmdlbG9nID0gbmV3IENoYW5nZWxvZygpO1xuICAgIGNvbnN0IGFsbE1vZHVsZXMgPSBbXG4gICAgICAgIGZyaWVuZHNBbmRGb2VzLFxuICAgICAgICBuZXcgQ29udGVzdFN0YXJ0KCksXG4gICAgICAgIG5ldyBMZWFndWVUb3AyMCgpLFxuICAgICAgICBuZXcgUmVtb3ZlUGFzc0xvY2soKSxcbiAgICAgICAgbmV3IExvdmVSYWlkc0FkZG9uKCksXG4gICAgICAgIG5ldyBMb3ZlUmFpZHNQYXJzZXIoKSxcbiAgICAgICAgbmV3IEFjdGl2aXR5UGFyc2VyKCksXG4gICAgICAgIGNoYW5nZWxvZ1xuICAgIF1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBydW5TY3JpcHQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGhoUGx1c1BsdXNDb25maWcgfSA9IHdpbmRvd1xuICAgICAgICAgICAgaWYgKCFoaFBsdXNQbHVzQ29uZmlnKSByZXR1cm47XG5cbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJHcm91cCh7XG4gICAgICAgICAgICAgICAga2V5OiAnSkFSVklTJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnSEggSmFydmlzJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGFsbE1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4ge1xuICAgICAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJNb2R1bGUobW9kdWxlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcubG9hZENvbmZpZygpXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJ1bk1vZHVsZXMoKVxuICAgICAgICAgICAgZnJpZW5kc0FuZEZvZXMuaW5zdGFsbFNldHRpbmdzKCk7XG4gICAgICAgICAgICBpbnN0YWxsQ29udGVzdFNldHRpbmdzKCk7XG4gICAgICAgICAgICBjaGFuZ2Vsb2cuaW5zdGFsbFNldHRpbmdzKCk7XG4gICAgICAgICAgICBwYWNrU2V0dGluZ3MoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aW5kb3cuaGhQbHVzUGx1c0NvbmZpZykge1xuICAgICAgICAgICAgcnVuU2NyaXB0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uZSgnaGgrKy1iZHNtOmxvYWRlZCcsIHJ1blNjcmlwdClcbiAgICAgICAgfVxuICAgIH0sIDEpXG59XG5cbnJ1bkphcnZpcygpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFPLE1BQUk7QUFDSixNQUFJO0FBRUosV0FBUyxTQUFTLFFBQXNCO0FBQzNDLFFBQUk7QUFDSixrQkFBYyxPQUFPLFNBQVM7QUFBQSxFQUNsQzs7O0FDTk8sV0FBUyxZQUFZLE9BQWUsYUFBcUI7QUFDNUQsVUFBTSxTQUFTLENBQUMsU0FBaUIsS0FBSyxXQUFXLEtBQUssT0FBTyxFQUFFLFdBQVcsS0FBSyxRQUFRLEVBQ2xGLFdBQVcsS0FBSyxNQUFNLEVBQUUsV0FBVyxLQUFLLE1BQU07QUFDbkQsV0FBTyxPQUFPLEtBQUssSUFBSSxzRkFDbkIsT0FBTyxLQUFLLElBQUksMEJBQTBCLE9BQU8sV0FBVyxJQUFJO0FBQUEsRUFDeEU7QUFFTyxXQUFTLGtCQUFrQixPQUFvQixXQUFtQjtBQUNyRSxVQUFNLFVBQVUsU0FBUyxjQUFjLEtBQUs7QUFDNUMsWUFBUSxLQUFLO0FBQ2IsWUFBUSxZQUFZO0FBQ3BCLFlBQVEsYUFBYSxRQUFRLFNBQVM7QUFDdEMsVUFBTSxVQUFVLE9BQU8sUUFBUSxnQkFBZ0I7QUFDL0MsUUFBSSxRQUFTLFNBQVEsYUFBYSxXQUFXLFFBQVE7QUFBQSxRQUNoRCxTQUFRLFNBQVM7QUFDdEIsYUFBUyxLQUFLLFlBQVksT0FBTztBQUVqQyxRQUFJLFNBQTZCO0FBQ2pDLFVBQU0sVUFBVSxDQUFDLFdBQ2Isa0JBQWtCLFVBQVUsT0FBTyxRQUFxQixxQkFBcUIsSUFBSTtBQUNyRixVQUFNLFFBQVEsTUFBTTtBQUNoQixVQUFJLENBQUMsT0FBUTtBQUNiLGFBQU8sZ0JBQWdCLGtCQUFrQjtBQUN6QyxlQUFTO0FBQ1QsVUFBSSxRQUFTLFNBQVEsWUFBWTtBQUFBLFVBQzVCLFNBQVEsU0FBUztBQUFBLElBQzFCO0FBQ0EsVUFBTSxPQUFPLENBQUMsU0FBc0I7QUFDaEMsVUFB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QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7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QjtBQUFBLE1BQ3BCLElBQUksZUFBZTtBQUFBLE1BQ25CO0FBQUEsSUFDSjtBQUVBLGVBQVcsTUFBTTtBQUNiLFlBQU0sWUFBWSxNQUFNO0FBQ3BCLGNBQU0sRUFBRSxpQkFBaUIsSUFBSTtBQUM3QixZQUFJLENBQUMsaUJBQWtCO0FBRXZCLHlCQUFpQixjQUFjO0FBQUEsVUFDM0IsS0FBSztBQUFBLFVBQ0wsTUFBTTtBQUFBLFFBQ1YsQ0FBQztBQUNELG1CQUFXLFFBQVEsWUFBVTtBQUN6QiwyQkFBaUIsZUFBZSxNQUFNO0FBQUEsUUFDMUMsQ0FBQztBQUNELHlCQUFpQixXQUFXO0FBQzVCLHlCQUFpQixXQUFXO0FBQzVCLHVCQUFlLGdCQUFnQjtBQUMvQiwrQkFBdUI7QUFDdkIsa0JBQVUsZ0JBQWdCO0FBQzFCLHFCQUFhO0FBQUEsTUFDakI7QUFFQSxVQUFJLE9BQU8sa0JBQWtCO0FBQ3pCLGtCQUFVO0FBQUEsTUFDZCxPQUFPO0FBQ0gsUUFBQUEsR0FBRSxRQUFRLEVBQUUsSUFBSSxvQkFBb0IsU0FBUztBQUFBLE1BQ2pEO0FBQUEsSUFDSixHQUFHLENBQUM7QUFBQSxFQUNSO0FBRUEsWUFBVTsiLAogICJuYW1lcyI6IFsibWF0Y2hlcyIsICJwbGF5ZXIiLCAiZXJyIiwgImhhbmRsZXJzIiwgIiQiXQp9Cg==
