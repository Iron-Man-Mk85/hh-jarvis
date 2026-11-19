// ==UserScript==
// @name           HH J.A.R.V.I.S. (Dev)
// @version        0.7.2
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
        .hh-plus-plus-config-panel { --jarvis-version: "v${"0.7.2"}"; }
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
    observer = null;
    listeners = null;
    constructor() {
      const baseKey = "contestStart";
      const configSchema = {
        baseKey,
        default: true,
        label: settingHelp("Contest startup", "Open the preferred contest and leaderboard position on load. A starred contest takes priority.")
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
      top = Math.max(0, Math.min(scroller.scrollHeight - scroller.clientHeight, top));
      if (Math.abs(top - scroller.scrollTop) >= 1) {
        const scrollTo = Element.prototype.scrollTo;
        scrollTo.call(scroller, { top, behavior: "instant" });
      }
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
      const getBoard = () => Array.from(right.querySelectorAll(".ranking[id_contest]")).find((panel) => panel.getAttribute("id_contest") === id)?.querySelector(".lead_table_view");
      const updateBoard = () => {
        const next = getBoard();
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
      }
    }
    run() {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      const pin = readContestSetting("ContestStartId");
      this.preference = (typeof pin === "string" || typeof pin === "number") && pin ? String(pin) : "";
      this.startupPending = true;
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
        if (event.isTrusted && event.target instanceof Element && this.right && this.list?.contains(event.target) && event.target.closest(".contest_header")) {
          this.startupPending = false;
          this.showLeaderboard(this.right, null);
          document.getElementById("jarvis-contest-startup")?.remove();
        }
      }, { capture: true, signal });
      this.refresh();
      this.hasRun = true;
    }
    tearDown() {
      this.observer?.disconnect();
      this.listeners?.abort();
      this.stopJump?.();
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
  var CHANGELOG_default = [{ version: "0.7.2", changes: ["Open the bottom active contest at your rank by default. Choose CbC, CCC, or LC to prefer that event when available.", "Turn off automatic update notices with Don’t show again in the changelog popup. View changelog stays available in settings."] }, { version: "0.7.1", changes: ["Keep the changelog centered when the game window is resized.", "Clean up saved player names, explain unknown names on hover, and give Remove buttons more room."] }, { version: "0.7.0", changes: ["See what changed in Jarvis the first time a new version runs.", "Open View changelog from HH++ settings at any time, even with automatic notices turned off.", "Expand Earlier versions to read past updates."] }, { version: "0.6.7", changes: ["Make marking one action per player, backfill names for older marks, use the bracket-based promotion target, and simplify the selected contest buttons and version badge."] }, { version: "0.6.6", changes: ["Add setting help in HH++, improve mark contrast and management, and add automatic contest defaults.", "Rename the separately installed testing userscript to Dev."] }, { version: "0.6.5", changes: ["Move the userscript source into TypeScript modules and add separate stable and testing builds."] }, { version: "0.6.4", changes: ["Prevent pinned contest startup scrolling, keep native startup without a pin, and clear finished pins"] }, { version: "0.6.3", changes: ["Stop both contest startup scrolls, isolate the selected leaderboard, and restore pinned contests at Top or My rank"] }, { version: "0.6.2", changes: ["Pin contests on their cards, hide the startup scroll, and use right-click marking with isolated settings scrolling"] }, { version: "0.6.1", changes: ["Read native Manga RPG contest titles and recognize active cards when contest data is unavailable"] }, { version: "0.6.0", changes: ["Add a contest start preference, continuous marking, and compact settings with a version label"] }, { version: "0.5.0", changes: ["Add league and contest player marking with custom colors, compact settings, and limit Top 20 to promotable leagues"] }, { version: "0.4.2", changes: ["Fix module startup, league controls, and raid exports; add the Top 20 league target"] }, { version: "0.4.1", changes: ["Fix Love Raids shadows replacement"] }, { version: "0.4.0", changes: ["Add ActivityParser module"] }, { version: "0.3.1", changes: ["Add harem link inside love raid cards"] }, { version: "0.3.0", changes: ["Add LoveRaidsAddon and LoveRaidsParser modules"] }, { version: "0.2.0", changes: ["Add RemovePassLock module"] }, { version: "0.1.3", changes: ["Better code practices"] }, { version: "0.1.2", changes: ["Polishing and update links"] }, { version: "0.1.1", changes: ["Add FriendAndFoes module"] }, { version: "0.0.1", changes: ["Initial release"] }];

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
    constructor() {
      const baseKey = "changelog";
      super({ name: baseKey, configSchema: {
        baseKey,
        label: settingHelp("Update notices", "Show the changelog once after an update. Use View changelog to open it whenever you like."),
        default: true
      } });
    }
    shouldRun() {
      return true;
    }
    installSettings() {
      if (currentPage !== "/home.html") return;
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
    run() {
      if (this.hasRun) return;
      this.hasRun = true;
      const check = () => {
        if (this.hasRun && !this.viewedThisPage && isNewer(latestVersion, readSeenVersion())) this.open("automatic");
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
      this.tearDown();
    }
    open(mode, opener = null) {
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
        shouldOpen: () => this.pending === "manual" || this.hasRun && !this.viewedThisPage && isNewer(latestVersion, readSeenVersion()),
        onOpen: () => {
          this.viewedThisPage = true;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzSGVscC50cyIsICJzcmMvc2V0dGluZ3MuY3NzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvSEhNb2R1bGUudHMiLCAic3JjL3N0b3JhZ2UudHMiLCAic3JjL21vZHVsZXMvcGxheWVycy9tYXJrTWFuYWdlci50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0ZyaWVuZEFuZEZvZXMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzLnRzIiwgInNyYy9tb2R1bGVzL2NvbnRlc3RzL0NvbnRlc3RTdGFydC50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0xlYWd1ZVRvcDIwLnRzIiwgInNyYy9tb2R1bGVzL3Byb2dyZXNzaW9uL1JlbW92ZVBhc3NMb2NrLnRzIiwgInNyYy9tb2R1bGVzL2xvdmUtcmFpZHMvZ2FtZURhdGEudHMiLCAic3JjL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNBZGRvbi50cyIsICJzcmMvbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc1BhcnNlci50cyIsICJzcmMvbW9kdWxlcy9hY3Rpdml0aWVzL0FjdGl2aXR5UGFyc2VyLnRzIiwgIkNIQU5HRUxPRy5tZCIsICJzcmMvbW9kdWxlcy91cGRhdGVzL2NoYW5nZWxvZ1BvcHVwLnRzIiwgInNyYy9tb2R1bGVzL3VwZGF0ZXMvQ2hhbmdlbG9nLnRzIiwgInNyYy9pbmRleC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCAkOiBKUXVlcnlTdGF0aWM7XG5leHBvcnQgbGV0IGN1cnJlbnRQYWdlOiBzdHJpbmc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0R2FtZShqUXVlcnk6IEpRdWVyeVN0YXRpYykge1xuICAgICQgPSBqUXVlcnk7XG4gICAgY3VycmVudFBhZ2UgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIHNldHRpbmdIZWxwKGxhYmVsOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgICBjb25zdCBlc2NhcGUgPSAodGV4dDogc3RyaW5nKSA9PiB0ZXh0LnJlcGxhY2VBbGwoJyYnLCAnJmFtcDsnKS5yZXBsYWNlQWxsKCdcIicsICcmcXVvdDsnKVxuICAgICAgICAucmVwbGFjZUFsbCgnPCcsICcmbHQ7JykucmVwbGFjZUFsbCgnPicsICcmZ3Q7Jyk7XG4gICAgcmV0dXJuIGVzY2FwZShsYWJlbCkgKyAnIDxzcGFuIGNsYXNzPVwiaXJvbm1hbi1zZXR0aW5nLWhlbHBcIiByb2xlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgYXJpYS1sYWJlbD1cIkFib3V0ICcgK1xuICAgICAgICBlc2NhcGUobGFiZWwpICsgJ1wiIGRhdGEtc2V0dGluZy1oZWxwPVwiJyArIGVzY2FwZShkZXNjcmlwdGlvbikgKyAnXCI+Pzwvc3Bhbj4nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW91bnRTZXR0aW5nc0hlbHAocGFuZWw6IEhUTUxFbGVtZW50LCB0b29sdGlwSWQ6IHN0cmluZykge1xuICAgIGNvbnN0IHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0b29sdGlwLmlkID0gdG9vbHRpcElkO1xuICAgIHRvb2x0aXAuY2xhc3NOYW1lID0gJ2lyb25tYW4tc2V0dGluZy10b29sdGlwJztcbiAgICB0b29sdGlwLnNldEF0dHJpYnV0ZSgncm9sZScsICd0b29sdGlwJyk7XG4gICAgY29uc3QgcG9wb3ZlciA9IHR5cGVvZiB0b29sdGlwLnNob3dQb3BvdmVyID09PSAnZnVuY3Rpb24nO1xuICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLnNldEF0dHJpYnV0ZSgncG9wb3ZlcicsICdtYW51YWwnKTtcbiAgICBlbHNlIHRvb2x0aXAuaGlkZGVuID0gdHJ1ZTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvb2x0aXApO1xuXG4gICAgbGV0IGFuY2hvcjogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBnZXRIZWxwID0gKHRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsKSA9PlxuICAgICAgICB0YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ID8gdGFyZ2V0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCdbZGF0YS1zZXR0aW5nLWhlbHBdJykgOiBudWxsO1xuICAgIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIWFuY2hvcikgcmV0dXJuO1xuICAgICAgICBhbmNob3IucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jyk7XG4gICAgICAgIGFuY2hvciA9IG51bGw7XG4gICAgICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLmhpZGVQb3BvdmVyKCk7XG4gICAgICAgIGVsc2UgdG9vbHRpcC5oaWRkZW4gPSB0cnVlO1xuICAgIH07XG4gICAgY29uc3Qgc2hvdyA9IChoZWxwOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICBpZiAoYW5jaG9yID09PSBoZWxwKSByZXR1cm47XG4gICAgICAgIGNsb3NlKCk7XG4gICAgICAgIGFuY2hvciA9IGhlbHA7XG4gICAgICAgIGhlbHAuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgdG9vbHRpcElkKTtcbiAgICAgICAgdG9vbHRpcC50ZXh0Q29udGVudCA9IGhlbHAuZGF0YXNldC5zZXR0aW5nSGVscCA/PyAnJztcbiAgICAgICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuc2hvd1BvcG92ZXIoKTtcbiAgICAgICAgZWxzZSB0b29sdGlwLmhpZGRlbiA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IGhlbHAuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0V2lkdGgsIG9mZnNldEhlaWdodCB9ID0gdG9vbHRpcDtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoOCwgTWF0aC5taW4oYm91bmRzLmxlZnQsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCAtIG9mZnNldFdpZHRoIC0gOCkpICsgJ3B4JztcbiAgICAgICAgY29uc3QgYmVsb3cgPSBib3VuZHMuYm90dG9tICsgNjtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS50b3AgPSAoYmVsb3cgKyBvZmZzZXRIZWlnaHQgPD0gd2luZG93LmlubmVySGVpZ2h0IC0gOFxuICAgICAgICAgICAgPyBiZWxvdyA6IE1hdGgubWF4KDgsIGJvdW5kcy50b3AgLSBvZmZzZXRIZWlnaHQgLSA2KSkgKyAncHgnO1xuICAgIH07XG5cbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyb3ZlcicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgJiYgZXZlbnQucG9pbnRlclR5cGUgIT09ICd0b3VjaCcpIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm91dCcsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgPT09IGFuY2hvciAmJiBoZWxwICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGhlbHApIGNsb3NlKCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHApIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCBldmVudCA9PiB7XG4gICAgICAgIGlmIChnZXRIZWxwKGV2ZW50LnRhcmdldCkgPT09IGFuY2hvcikgY2xvc2UoKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKCFoZWxwKSByZXR1cm47XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzaG93KGhlbHApO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGhlbHAgPSBnZXRIZWxwKGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGlmIChoZWxwICYmIChldmVudC5rZXkgPT09ICdFbnRlcicgfHwgZXZlbnQua2V5ID09PSAnICcpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBzaG93KGhlbHApO1xuICAgICAgICB9IGVsc2UgaWYgKGFuY2hvciAmJiBldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGdldEhlbHAoZXZlbnQudGFyZ2V0KSAhPT0gYW5jaG9yKSBjbG9zZSgpO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGNsb3NlLCB7IHBhc3NpdmU6IHRydWUgfSk7XG59XG4iLCAiLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAucGFuZWwtY29udGVudHMge1xuICAgIGFsaWduLWNvbnRlbnQ6IHN0YXJ0O1xuICAgIGFsaWduLWl0ZW1zOiBzdGFydDtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIG92ZXJzY3JvbGwtYmVoYXZpb3I6IGNvbnRhaW47XG4gICAgc2Nyb2xsYmFyLXdpZHRoOiB0aGluO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWw6aGFzKD4gLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXS5zaG93bikge1xuICAgIG92ZXJmbG93OiBjbGlwO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmcuaGFzLXN1YnNldHRpbmdzIHtcbiAgICBncmlkLXJvdy1lbmQ6IGF1dG87XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5qYXJ2aXMtcGFja2VkLXNldHRpbmdzIHtcbiAgICBncmlkLWF1dG8tZmxvdzogcm93IGRlbnNlO1xuICAgIGdyaWQtYXV0by1yb3dzOiAxcHg7XG4gICAgcm93LWdhcDogMDtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1wYWNrZWQtc2V0dGluZ3MgLmNvbmZpZy1zZXR0aW5nIHtcbiAgICBncmlkLXJvdy1lbmQ6IHNwYW4gdmFyKC0tamFydmlzLXNldHRpbmctcm93cywgMSk7XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAudGFicyBoNFtyZWw9XCJKQVJWSVNcIl0ge1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC50YWJzIGg0W3JlbD1cIkpBUlZJU1wiXS5zZWxlY3RlZDo6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6IHZhcigtLWphcnZpcy12ZXJzaW9uKTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgaW5zZXQtYmxvY2stc3RhcnQ6IDA7XG4gICAgaW5zZXQtaW5saW5lLWVuZDogLjE1cmVtO1xuICAgIGZvbnQtc2l6ZTogLjYyNXJlbTtcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIHRleHQtdHJhbnNmb3JtOiBub25lO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLmlyb25tYW4tc2V0dGluZy1oZWxwIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtZ3JpZDtcbiAgICBwbGFjZS1pdGVtczogY2VudGVyO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgaW5saW5lLXNpemU6IDEuMjVlbTtcbiAgICBibG9jay1zaXplOiAxLjI1ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICBmb250LXNpemU6IC44ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgdmVydGljYWwtYWxpZ246IC4wOGVtO1xuICAgIGN1cnNvcjogaGVscDtcbn1cbi5pcm9ubWFuLXNldHRpbmctaGVscDpob3Zlcixcbi5pcm9ubWFuLXNldHRpbmctaGVscDpmb2N1cy12aXNpYmxlIHtcbiAgICBvdXRsaW5lOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIG91dGxpbmUtb2Zmc2V0OiAycHg7XG59XG4uaXJvbm1hbi1zZXR0aW5nLXRvb2x0aXAge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICBpbnNldDogYXV0bztcbiAgICB6LWluZGV4OiAxMDAxMDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIG1heC13aWR0aDogbWluKDE4cmVtLCBjYWxjKDEwMHZ3IC0gMTZweCkpO1xuICAgIG1hcmdpbjogMDtcbiAgICBwYWRkaW5nOiAuNWVtIC43ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNGVtO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWNvbmZpZy1zZXR0aW5nLWJhY2tncm91bmQsICMyNDFlMzApO1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGZvbnQ6IDE0cHgvMS40IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1tYXJrLWNvbG9yIGlucHV0IHtcbiAgICB3aWR0aDogMzBweDtcbiAgICBoZWlnaHQ6IDIwcHg7XG4gICAgZmxleDogbm9uZTtcbiAgICBwYWRkaW5nOiAwO1xufVxuYnV0dG9uLmphcnZpcy1jb250ZXN0LXBpbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgbWFyZ2luLWlubGluZS1zdGFydDogLjM1ZW07XG4gICAgcGFkZGluZy1pbmxpbmU6IC4yZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgZm9udC1zaXplOiAuOWVtO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1waW46OmJlZm9yZSB7XG4gICAgY29udGVudDogJ+KYhic7XG59XG4uamFydmlzLWNvbnRlc3QtcGluW2FyaWEtcHJlc3NlZD1cInRydWVcIl06OmJlZm9yZSB7XG4gICAgY29udGVudDogJ+KYhSc7XG4gICAgY29sb3I6ICNmZmQzNmI7XG59XG4uamFydmlzLWNvbnRlc3QtcGluOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICB3aWR0aDogZml0LWNvbnRlbnQ7XG4gICAgZ2FwOiAuMTJlbTtcbiAgICBwYWRkaW5nOiAuMTJlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDU1JSwgdHJhbnNwYXJlbnQpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40NWVtO1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIGxpbmUtaGVpZ2h0OiAxLjE1O1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b24ge1xuICAgIGFsbDogdW5zZXQ7XG4gICAgcGFkZGluZzogLjE4ZW0gLjM4ZW07XG4gICAgYm9yZGVyLXJhZGl1czogLjI2ZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgZm9udDogaW5oZXJpdDtcbiAgICBsaW5lLWhlaWdodDogaW5oZXJpdDtcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uW2FyaWEtcHJlc3NlZD1cInRydWVcIl0ge1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMjIlLCB0cmFuc3BhcmVudCk7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIGJ1dHRvbjpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAxNSUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG59XG4uamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCB7XG4gICAgbWFyZ2luLWlubGluZS1zdGFydDogLjI4ZW07XG4gICAgZm9udC1zaXplOiAuN2VtO1xuICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XG59XG4uamFydmlzLWNvbnRlc3Qtc2V0dGluZ3Mge1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ2FwOiAuM2VtO1xuICAgIG1pbi13aWR0aDogMDtcbiAgICBtYXJnaW46IC40NWVtIDAgMDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGJvcmRlcjogMDtcbiAgICBmb250LXNpemU6IC44NWVtO1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzIC5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgbWF4LXdpZHRoOiAxMDAlO1xuICAgIGZsZXgtd3JhcDogd3JhcDtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5ncyBbaGlkZGVuXSB7XG4gICAgZGlzcGxheTogbm9uZTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5nczpkaXNhYmxlZCAuamFydmlzLWNvbnRlc3QtY2hvaWNlIHtcbiAgICBvcGFjaXR5OiAuNTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5nczpkaXNhYmxlZCBidXR0b24ge1xuICAgIGN1cnNvcjogZGVmYXVsdDtcbn1cbi5qYXJ2aXMtbWFyay1tZW51IHtcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgei1pbmRleDogMTAwMDA7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBnYXA6IDJweDtcbiAgICBwYWRkaW5nOiA0cHg7XG4gICAgYm9yZGVyOiAxcHggc29saWQgIzg5OTRhNztcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgYmFja2dyb3VuZDogIzIzMjkzNjtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBib3gtc2hhZG93OiAwIDJweCAxMHB4ICMwMDA4O1xuICAgIGZvbnQ6IDEzcHgvMS4zNSBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7XG59XG4uamFydmlzLW1hcmstbWVudSBidXR0b24ge1xuICAgIGFsbDogdW5zZXQ7XG4gICAgcGFkZGluZzogNHB4IDlweDtcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1tYXJrLW1lbnUgYnV0dG9uOmhvdmVyLFxuLmphcnZpcy1tYXJrLW1lbnUgYnV0dG9uOmZvY3VzLXZpc2libGUge1xuICAgIGJhY2tncm91bmQ6ICM0MTRkNjQ7XG59XG4jY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEuamFydmlzLWNvbnRlc3QtaW5zdGFudCxcbiNjb250ZXN0cyAucmlnaHRfcGFydC5qYXJ2aXMtY29udGVzdC1pbnN0YW50IC5sZWFkX3RhYmxlX3ZpZXcge1xuICAgIHNjcm9sbC1iZWhhdmlvcjogYXV0byAhaW1wb3J0YW50O1xuICAgIG92ZXJmbG93LWFuY2hvcjogbm9uZSAhaW1wb3J0YW50O1xufVxuI2NvbnRlc3RzIC5qYXJ2aXMtY29udGVzdC1sb2FkaW5nIHtcbiAgICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7XG4gICAgdHJhbnNpdGlvbjogbm9uZSAhaW1wb3J0YW50O1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuI2NvbnRlc3RzIC5yaWdodF9wYXJ0IC5yYW5raW5nW2lkX2NvbnRlc3RdLmphcnZpcy1jb250ZXN0LW90aGVyIHtcbiAgICBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFyaz1cImZyaWVuZFwiXSB7XG4gICAgY29sb3I6IHZhcigtLWphcnZpcy1mcmllbmQtY29sb3IpICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFyaz1cImZvZVwiXSB7XG4gICAgY29sb3I6IHZhcigtLWphcnZpcy1mb2UtY29sb3IpICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFya10sXG50ZFtkYXRhLWphcnZpcy1tYXJrXSA+IGEge1xuICAgIHRleHQtc2hhZG93OiAxcHggMCAjMTExODI3LCAtMXB4IDAgIzExMTgyNywgMCAxcHggIzExMTgyNywgMCAtMXB4ICMxMTE4MjcgIWltcG9ydGFudDtcbn1cbnRkW2RhdGEtamFydmlzLW1hcmtdID4gYSB7XG4gICAgY29sb3I6IGluaGVyaXQgIWltcG9ydGFudDtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb24ge1xuICAgIGFwcGVhcmFuY2U6IG5vbmU7XG4gICAgcGFkZGluZzogLjJlbSAuNWVtO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbiAgICBib3JkZXItcmFkaXVzOiAuMzVlbTtcbiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246aG92ZXIsXG4uamFydmlzLXNldHRpbmctYWN0aW9uOmZvY3VzLXZpc2libGUge1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMTYlLCB0cmFuc3BhcmVudCk7XG59XG4uamFydmlzLXNldHRpbmctYWN0aW9uOmRpc2FibGVkIHtcbiAgICBjdXJzb3I6IGRlZmF1bHQ7XG4gICAgb3BhY2l0eTogLjU7XG59XG4uamFydmlzLW1hcmstc2V0dGluZy1hY3Rpb25zLFxuLmphcnZpcy1tYXJrLWFjdGlvbnMge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC13cmFwOiB3cmFwO1xuICAgIGdhcDogLjRlbTtcbn1cbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIHtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIHdpZHRoOiBtaW4oMzRyZW0sIGNhbGMoMTAwdncgLSAycmVtKSk7XG4gICAgbWF4LWhlaWdodDogY2FsYygxMDB2aCAtIDJyZW0pO1xuICAgIHBhZGRpbmc6IDFyZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNjVyZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogMTVweC8xLjM1IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbn1cbi5qYXJ2aXMtbWFyay1tYW5hZ2VyOjpiYWNrZHJvcCB7XG4gICAgYmFja2dyb3VuZDogIzA4MGIxMmFhO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXIgaDIsXG4uamFydmlzLW1hcmstbWFuYWdlciBoMyxcbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIHAge1xuICAgIG1hcmdpbjogMDtcbn1cbi5qYXJ2aXMtbWFyay1saXN0cyB7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KG1pbigxM3JlbSwgMTAwJSksIDFmcikpO1xuICAgIGdhcDogLjlyZW07XG4gICAgbWF4LWhlaWdodDogNTB2aDtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIHNjcm9sbGJhci1ndXR0ZXI6IHN0YWJsZTtcbiAgICBwYWRkaW5nLWlubGluZS1lbmQ6IC43cmVtO1xuICAgIG1hcmdpbi1ibG9jazogLjlyZW07XG59XG4uamFydmlzLW1hcmstbGlzdHMgdWwge1xuICAgIG1hcmdpbjogLjNlbSAwIDA7XG4gICAgcGFkZGluZzogMDtcbiAgICBsaXN0LXN0eWxlOiBub25lO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIGxpIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgIGdhcDogLjQ1ZW07XG4gICAgcGFkZGluZzogLjJlbSAwO1xuICAgIG92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIGxpIGJ1dHRvbiB7XG4gICAgZmxleDogbm9uZTtcbn1cbi5qYXJ2aXMtbWFyay1hY3Rpb25zIHtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG59XG4uamFydmlzLXZpZXctY2hhbmdlbG9nIHtcbiAgICBtYXJnaW4tdG9wOiAuNDVlbTtcbn1cbmRpYWxvZy5qYXJ2aXMtY2hhbmdlbG9nLXBvcHVwIHtcbiAgICAtLWphcnZpcy1jaGFuZ2Vsb2ctaGVpZ2h0OiBtaW4oMzJyZW0sIGNhbGMoMTAwdmggLSAxLjI1cmVtKSk7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgaW5zZXQ6IDA7XG4gICAgd2lkdGg6IG1pbigzN3JlbSwgY2FsYygxMDAlIC0gMS4yNXJlbSkpO1xuICAgIGhlaWdodDogZml0LWNvbnRlbnQ7XG4gICAgbWF4LWhlaWdodDogdmFyKC0tamFydmlzLWNoYW5nZWxvZy1oZWlnaHQpO1xuICAgIG1hcmdpbjogYXV0bztcbiAgICBwYWRkaW5nOiAwO1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNnJlbTtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jb25maWctc2V0dGluZy1iYWNrZ3JvdW5kLCAjMjQxZTMwKTtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBmb250OiAxNXB4LzEuNDUgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgIHRleHQtYWxpZ246IHN0YXJ0O1xufVxuQHN1cHBvcnRzIChoZWlnaHQ6IDEwMGR2aCkge1xuICAgIGRpYWxvZy5qYXJ2aXMtY2hhbmdlbG9nLXBvcHVwIHtcbiAgICAgICAgLS1qYXJ2aXMtY2hhbmdlbG9nLWhlaWdodDogbWluKDMycmVtLCBjYWxjKDEwMGR2aCAtIDEuMjVyZW0pKTtcbiAgICB9XG59XG4uamFydmlzLWNoYW5nZWxvZy1wb3B1cDo6YmFja2Ryb3Age1xuICAgIGJhY2tncm91bmQ6ICMwODBiMTJhYTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQge1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IGF1dG8gbWlubWF4KDAsIDFmcikgYXV0bztcbiAgICBnYXA6IGNsYW1wKC40NXJlbSwgMnZ3LCAuOXJlbSk7XG4gICAgbWF4LWhlaWdodDogY2FsYyh2YXIoLS1qYXJ2aXMtY2hhbmdlbG9nLWhlaWdodCkgLSAycHgpO1xuICAgIHBhZGRpbmc6IGNsYW1wKC42cmVtLCAzdncsIDFyZW0pO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBoMixcbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgaDMge1xuICAgIG1hcmdpbjogMDtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgaDIge1xuICAgIGZvbnQtc2l6ZTogMS4zZW07XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGgzIHtcbiAgICBjb2xvcjogdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjZDljN2ZiKTtcbiAgICBmb250LXNpemU6IDFlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgc2VjdGlvbiArIHNlY3Rpb24sXG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGRldGFpbHMge1xuICAgIG1hcmdpbi10b3A6IC43NXJlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGVzIHtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIG92ZXJzY3JvbGwtYmVoYXZpb3I6IGNvbnRhaW47XG4gICAgc2Nyb2xsYmFyLXdpZHRoOiB0aGluO1xuICAgIG92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90ZXMgdWwge1xuICAgIG1hcmdpbjogLjJlbSAwIDA7XG4gICAgcGFkZGluZy1pbmxpbmUtc3RhcnQ6IDEuMmVtO1xuICAgIGxpc3Qtc3R5bGU6IGRpc2M7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RlcyBsaSArIGxpIHtcbiAgICBtYXJnaW4tdG9wOiAuMjVlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGVzIHN1bW1hcnkge1xuICAgIG1hcmdpbi1ib3R0b206IC40cmVtO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgZm9vdGVyIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtd3JhcDogd3JhcDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogZW5kO1xuICAgIGdhcDogLjVlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW9wdC1vdXQge1xuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiAuNGVtO1xuICAgIG1hcmdpbi1pbmxpbmUtZW5kOiBhdXRvO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbiIsICJpbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBtb3VudFNldHRpbmdzSGVscCB9IGZyb20gJy4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCBjc3MgZnJvbSAnLi9zZXR0aW5ncy5jc3MnO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0U3R5bGVzKCkge1xuICAgIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZS5jbGFzc05hbWUgPSAnaGgtamFydmlzLXN0eWxlJztcbiAgICBzdHlsZS50ZXh0Q29udGVudCA9IGAke2Nzc31cbiAgICAgICAgLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgeyAtLWphcnZpcy12ZXJzaW9uOiBcInYke1VTRVJTQ1JJUFRfVkVSU0lPTn1cIjsgfVxuICAgIGA7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrU2V0dGluZ3MoKSB7XG4gICAgaWYgKGN1cnJlbnRQYWdlICE9PSAnL2hvbWUuaHRtbCcpIHJldHVybjtcblxuICAgIGNvbnN0IHNlbGVjdG9yID0gJy5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLnBhbmVsLWNvbnRlbnRzJztcbiAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oc2VsZWN0b3IpO1xuICAgICAgICBpZiAoIXBhbmVsKSByZXR1cm47XG4gICAgICAgIHBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hoLXNjcm9sbCcpO1xuICAgICAgICBtb3VudFNldHRpbmdzSGVscChwYW5lbCwgJ2phcnZpcy1zZXR0aW5nLXRvb2x0aXAnKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmN0cmxLZXkgfHwgIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSB8fCAhcGFuZWwuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCB1bml0ID0gZXZlbnQuZGVsdGFNb2RlID09PSAxID8gMTYgOiBldmVudC5kZWx0YU1vZGUgPT09IDIgPyBwYW5lbC5jbGllbnRIZWlnaHQgOiAxO1xuICAgICAgICAgICAgY29uc3Qgc2NhbGUgPSBwYW5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQgLyBwYW5lbC5vZmZzZXRIZWlnaHQgfHwgMTtcbiAgICAgICAgICAgIHBhbmVsLnNjcm9sbFRvcCArPSBldmVudC5kZWx0YVkgKiB1bml0IC8gc2NhbGU7XG4gICAgICAgIH0sIHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogZmFsc2UgfSk7XG5cbiAgICAgICAgY29uc3QgY2FyZHMgPSBwYW5lbC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLmNvbmZpZy1zZXR0aW5nJyk7XG4gICAgICAgIGNvbnN0IHBhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXBhbmVsLm9mZnNldFdpZHRoKSByZXR1cm47XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgY2FyZCBvZiBjYXJkcykge1xuICAgICAgICAgICAgICAgIGNhcmQuc3R5bGUuc2V0UHJvcGVydHkoJy0tamFydmlzLXNldHRpbmctcm93cycsIFN0cmluZyhjYXJkLm9mZnNldEhlaWdodCArIDEwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYW5lbC5jbGFzc0xpc3QuYWRkKCdqYXJ2aXMtcGFja2VkLXNldHRpbmdzJyk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGdyb3VwT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihwYWNrKTtcbiAgICAgICAgaWYgKHBhbmVsLnBhcmVudEVsZW1lbnQpIGdyb3VwT2JzZXJ2ZXIub2JzZXJ2ZShwYW5lbC5wYXJlbnRFbGVtZW50LCB7IGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcyddIH0pO1xuICAgICAgICBpZiAodHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY29uc3Qgc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHBhY2spO1xuICAgICAgICAgICAgY2FyZHMuZm9yRWFjaChjYXJkID0+IHNpemVPYnNlcnZlci5vYnNlcnZlKGNhcmQpKTtcbiAgICAgICAgfVxuICAgICAgICBwYWNrKCk7XG4gICAgfSk7XG59XG4iLCAiZXhwb3J0IHR5cGUgTW9kdWxlU2V0dGluZ3MgPSBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPjtcblxuaW50ZXJmYWNlIENvbmZpZ1NjaGVtYSB7XG4gICAgYmFzZUtleTogc3RyaW5nO1xuICAgIGxhYmVsOiBzdHJpbmc7XG4gICAgZGVmYXVsdDogYm9vbGVhbjtcbiAgICBzdWJTZXR0aW5ncz86IHsga2V5OiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IGRlZmF1bHQ6IGJvb2xlYW4gfVtdO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSEhNb2R1bGUge1xuICAgIHJlYWRvbmx5IGdyb3VwID0gJ0pBUlZJUyc7XG4gICAgcmVhZG9ubHkgY29uZmlnU2NoZW1hOiBDb25maWdTY2hlbWE7XG4gICAgaGFzUnVuID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3Rvcih7IGNvbmZpZ1NjaGVtYSB9OiB7IG5hbWU6IHN0cmluZzsgY29uZmlnU2NoZW1hOiBDb25maWdTY2hlbWEgfSkge1xuICAgICAgICB0aGlzLmNvbmZpZ1NjaGVtYSA9IGNvbmZpZ1NjaGVtYTtcbiAgICB9XG5cbiAgICBhYnN0cmFjdCBzaG91bGRSdW4oKTogYm9vbGVhbjtcbiAgICBhYnN0cmFjdCBydW4oc2V0dGluZ3M6IE1vZHVsZVNldHRpbmdzKTogdm9pZCB8IFByb21pc2U8dm9pZD47XG59XG4iLCAiZXhwb3J0IGNvbnN0IExTX0NPTkZJR19OQU1FID0gJ0hIU3RhcmsnO1xuXG5leHBvcnQgZnVuY3Rpb24gbHNHZXQoa2V5OiBzdHJpbmcsIGxzX25hbWUgPSBMU19DT05GSUdfTkFNRSk6IHVua25vd24ge1xuICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGAke2xzX25hbWV9JHtrZXl9YCkgPz8gJ251bGwnKVxufVxuZXhwb3J0IGZ1bmN0aW9uIGxzU2V0KGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93biwgbHNfbmFtZSA9IExTX0NPTkZJR19OQU1FKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGAke2xzX25hbWV9JHtrZXl9YCwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKVxufVxuZXhwb3J0IGZ1bmN0aW9uIGxzUm0oa2V5OiBzdHJpbmcsIGxzX25hbWUgPSBMU19DT05GSUdfTkFNRSkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShgJHtsc19uYW1lfSR7a2V5fWApXG59XG4iLCAiaW1wb3J0IHsgTFNfQ09ORklHX05BTUUgfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcblxuZXhwb3J0IHR5cGUgTWFyayA9ICdmcmllbmQnIHwgJ2ZvZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2F2ZWRNYXJrIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIG5hbWU/OiBzdHJpbmc7XG4gICAgbWFyazogTWFyaztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5NYXJrTWFuYWdlcihyZWFkOiAoKSA9PiBTYXZlZE1hcmtbXSwgcmVtb3ZlOiAoaWQ6IHN0cmluZykgPT4gYm9vbGVhbiwgY2xlYXI6ICgpID0+IGJvb2xlYW4pIHtcbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmphcnZpcy1tYXJrLW1hbmFnZXInKSkgcmV0dXJuO1xuXG4gICAgY29uc3QgZGlhbG9nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGlhbG9nJyk7XG4gICAgZGlhbG9nLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1tYW5hZ2VyJztcbiAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsbGVkYnknLCAnamFydmlzLW1hcmstbWFuYWdlci10aXRsZScpO1xuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcbiAgICB0aXRsZS5pZCA9ICdqYXJ2aXMtbWFyay1tYW5hZ2VyLXRpdGxlJztcbiAgICB0aXRsZS50ZXh0Q29udGVudCA9ICdGcmllbmRzIGFuZCBmb2VzJztcblxuICAgIGNvbnN0IGxpc3RzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbGlzdHMuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLWxpc3RzJztcbiAgICBjb25zdCBhY3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYWN0aW9ucy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstYWN0aW9ucyc7XG4gICAgY29uc3QgY2xlYXJBbGwgPSBtYWtlQnV0dG9uKCdDbGVhciBhbGwgbWFya3MnLCAoKSA9PiB7XG4gICAgICAgIGlmIChjb25maXJtKCdSZW1vdmUgYWxsIGZyaWVuZCBhbmQgZm9lIG1hcmtzIGZvciB0aGlzIGdhbWU/JykgJiYgY2xlYXIoKSkge1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICBjbG9zZS5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgY29uc3QgY2xvc2UgPSBtYWtlQnV0dG9uKCdDbG9zZScsICgpID0+IGRpYWxvZy5jbG9zZSgpKTtcbiAgICBhY3Rpb25zLmFwcGVuZChjbGVhckFsbCwgY2xvc2UpO1xuXG4gICAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gcmVhZCgpLnNvcnQoKGEsIGIpID0+IE51bWJlcighYS5uYW1lKSAtIE51bWJlcighYi5uYW1lKSB8fFxuICAgICAgICAgICAgKGEubmFtZSB8fCBhLmlkKS5sb2NhbGVDb21wYXJlKGIubmFtZSB8fCBiLmlkLCB1bmRlZmluZWQsIHsgbnVtZXJpYzogdHJ1ZSB9KSk7XG4gICAgICAgIGNvbnN0IHNlY3Rpb25zID0gKFsnZnJpZW5kJywgJ2ZvZSddIGFzIGNvbnN0KS5tYXAobWFyayA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpO1xuICAgICAgICAgICAgY29uc3QgaGVhZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gZW50cmllcy5maWx0ZXIoZW50cnkgPT4gZW50cnkubWFyayA9PT0gbWFyayk7XG4gICAgICAgICAgICBoZWFkaW5nLnRleHRDb250ZW50ID0gKG1hcmsgPT09ICdmcmllbmQnID8gJ0ZyaWVuZHMnIDogJ0ZvZXMnKSArIGAgKCR7bWF0Y2hlcy5sZW5ndGh9KWA7XG4gICAgICAgICAgICBzZWN0aW9uLmFwcGVuZENoaWxkKGhlYWRpbmcpO1xuXG4gICAgICAgICAgICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbXB0eSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgICAgICAgICBlbXB0eS50ZXh0Q29udGVudCA9ICdObyBzYXZlZCBwbGF5ZXJzLic7XG4gICAgICAgICAgICAgICAgc2VjdGlvbi5hcHBlbmRDaGlsZChlbXB0eSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlY3Rpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IGlkLCBuYW1lIH0gb2YgbWF0Y2hlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGxheWVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgICAgIHBsYXllci50ZXh0Q29udGVudCA9IG5hbWUgPyBgJHtuYW1lfSDCtyAke2lkfWAgOiBgUGxheWVyICMke2lkfWA7XG4gICAgICAgICAgICAgICAgaWYgKCFuYW1lKSBwbGF5ZXIudGl0bGUgPSAnTmFtZSBub3QgcmVjb3JkZWQgeWV0JztcbiAgICAgICAgICAgICAgICBjb25zdCBidXR0b24gPSBtYWtlQnV0dG9uKCdSZW1vdmUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gQXJyYXkuZnJvbShsaXN0cy5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKSkuaW5kZXhPZihidXR0b24pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3ZlKGlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmcgPSBsaXN0cy5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIChyZW1haW5pbmdbTWF0aC5taW4oaW5kZXgsIHJlbWFpbmluZy5sZW5ndGggLSAxKV0gfHwgY2xvc2UpLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgYFJlbW92ZSAke25hbWUgfHwgYHBsYXllciAke2lkfWB9IGZyb20gJHttYXJrID09PSAnZnJpZW5kJyA/ICdmcmllbmRzJyA6ICdmb2VzJ31gKTtcbiAgICAgICAgICAgICAgICByb3cuYXBwZW5kKHBsYXllciwgYnV0dG9uKTtcbiAgICAgICAgICAgICAgICBsaXN0LmFwcGVuZENoaWxkKHJvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWN0aW9uLmFwcGVuZENoaWxkKGxpc3QpO1xuICAgICAgICAgICAgcmV0dXJuIHNlY3Rpb247XG4gICAgICAgIH0pO1xuICAgICAgICBsaXN0cy5yZXBsYWNlQ2hpbGRyZW4oLi4uc2VjdGlvbnMpO1xuICAgICAgICBjbGVhckFsbC5kaXNhYmxlZCA9IGVudHJpZXMubGVuZ3RoID09PSAwO1xuICAgIH1cblxuICAgIHJlbmRlcigpO1xuICAgIGRpYWxvZy5hcHBlbmQodGl0bGUsIGxpc3RzLCBhY3Rpb25zKTtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3N0b3JhZ2UnLCBldmVudCA9PiB7XG4gICAgICAgIGlmICghZXZlbnQua2V5IHx8IFsnUGxheWVyTWFya3MnLCAnUGxheWVyTWFya05hbWVzJywgJ0ZyaWVuZExpc3QnLCAnRm9lTGlzdCddXG4gICAgICAgICAgICAuc29tZShrZXkgPT4gZXZlbnQua2V5ID09PSBMU19DT05GSUdfTkFNRSArIGtleSkpIHJlbmRlcigpO1xuICAgIH0sIHsgc2lnbmFsOiBsaXN0ZW5lcnMuc2lnbmFsIH0pO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgbGlzdGVuZXJzLmFib3J0KCk7XG4gICAgICAgIGRpYWxvZy5yZW1vdmUoKTtcbiAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaWFsb2cpO1xuICAgIGRpYWxvZy5zaG93TW9kYWwoKTtcbiAgICBjbG9zZS5mb2N1cygpO1xufVxuXG5mdW5jdGlvbiBtYWtlQnV0dG9uKGxhYmVsOiBzdHJpbmcsIG9uQ2xpY2s6ICgpID0+IHZvaWQpIHtcbiAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uJztcbiAgICBidXR0b24udGV4dENvbnRlbnQgPSBsYWJlbDtcbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrKTtcbiAgICByZXR1cm4gYnV0dG9uO1xufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgdHlwZSB7IENvbnRlc3REYXRhIH0gZnJvbSAnLi4vLi4vZ2FtZS10eXBlcyc7XG5pbXBvcnQgeyBMU19DT05GSUdfTkFNRSwgbHNHZXQsIGxzU2V0IH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5pbXBvcnQgeyBvcGVuTWFya01hbmFnZXIsIHR5cGUgTWFyaywgdHlwZSBTYXZlZE1hcmsgfSBmcm9tICcuL21hcmtNYW5hZ2VyJztcblxuY29uc3QgREVGQVVMVF9DT0xPUlM6IFJlY29yZDxNYXJrLCBzdHJpbmc+ID0geyBmcmllbmQ6ICcjNDhhOWZmJywgZm9lOiAnI2ZmNjE3MycgfTtcbnR5cGUgU2F2ZWROYW1lID0gc3RyaW5nIHwgeyBuYW1lOiBzdHJpbmcgfTtcblxuZnVuY3Rpb24gcmVhZFJvd05hbWUoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICBjb25zdCB0ZXh0ID0gZWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpID8/ICcnO1xuICAgIGlmICghdGV4dC5lbmRzV2l0aCgnKycpKSByZXR1cm4gdGV4dDtcbiAgICBjb25zdCB3aXRob3V0U3RhbmRhbG9uZVBsdXMgPSB0ZXh0LnJlcGxhY2UoL1xccytcXCskLywgJycpO1xuICAgIGlmICghZWxlbWVudC5jaGlsZEVsZW1lbnRDb3VudCkgcmV0dXJuIHdpdGhvdXRTdGFuZGFsb25lUGx1cztcblxuICAgIGNvbnN0IGxhYmVsID0gZWxlbWVudC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBsYWJlbC5xdWVyeVNlbGVjdG9yQWxsKCcqJykpIHtcbiAgICAgICAgaWYgKGNoaWxkLnRleHRDb250ZW50Py50cmltKCkgPT09ICcrJykgY2hpbGQucmVtb3ZlKCk7XG4gICAgfVxuICAgIHJldHVybiBsYWJlbC50ZXh0Q29udGVudD8udHJpbSgpLnJlcGxhY2UoL1xccytcXCskLywgJycpIHx8IHdpdGhvdXRTdGFuZGFsb25lUGx1cztcbn1cblxuZnVuY3Rpb24gZGlzcGxheVNhdmVkTmFtZShzYXZlZD86IFNhdmVkTmFtZSkge1xuICAgIGlmICh0eXBlb2Ygc2F2ZWQgIT09ICdzdHJpbmcnKSByZXR1cm4gc2F2ZWQ/Lm5hbWU7XG4gICAgLy8gT2xkIGVudHJpZXMgc3RvcmVkIHRoZSBmdWxsIHJvdyB0ZXh0LCBpbmNsdWRpbmcgYSB0cmFpbGluZyBhZGQgY29udHJvbC5cbiAgICByZXR1cm4gc2F2ZWQudHJpbSgpLnJlcGxhY2UoLyhbXitdKVxcKyQvLCAnJDEnKS50cmltRW5kKCk7XG59XG5cbmV4cG9ydCBjbGFzcyBGcmllbmRBbmRGb2VzIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgbmFtZXMgPSBuZXcgTWFwPEhUTUxFbGVtZW50LCBzdHJpbmc+KCk7XG4gICAgcHJpdmF0ZSBtYXJrTWVudTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJvb3Q6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByb290U2VsZWN0b3IgPSAnJztcbiAgICBwcml2YXRlIGluTGVhZ3VlID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdmcmllbmRBbmRGb2VzJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkZyaWVuZHMgYW5kIGZvZXNcIiwgXCJSaWdodC1jbGljayBlYWNoIHBsYXllcidzIG5hbWUgdG8gYWRkIG9yIHJlbW92ZSBhIG1hcmsuIE1hbmFnZSBzYXZlZCBtYXJrcyBiZWxvdy5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdsZWFndWUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkluIGxlYWd1ZXNcIiwgXCJTaG93IG1hcmtzIGFuZCBhbGxvdyBtYXJraW5nIGluIGxlYWd1ZSB0YWJsZXMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdjb250ZXN0cycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiSW4gY29udGVzdHNcIiwgXCJTaG93IG1hcmtzIGFuZCBhbGxvdyBtYXJraW5nIG9uIGNvbnRlc3QgbGVhZGVyYm9hcmRzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHsgbmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hIH0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIFsnL2xlYWd1ZXMuaHRtbCcsICcvYWN0aXZpdGllcy5odG1sJ10uaW5jbHVkZXMoY3VycmVudFBhZ2UpO1xuICAgIH1cblxuICAgIHJlYWRTZXR0aW5nKGtleTogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gbHNHZXQoa2V5KTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlYWRNYXJrcygpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgICAgIGNvbnN0IHN0b3JlZCA9IHRoaXMucmVhZFNldHRpbmcoJ1BsYXllck1hcmtzJyk7XG4gICAgICAgIGlmIChzdG9yZWQgJiYgdHlwZW9mIHN0b3JlZCA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoc3RvcmVkKSkgcmV0dXJuIHN0b3JlZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAgICAgICBjb25zdCBtYXJrczogUmVjb3JkPHN0cmluZywgTWFyaz4gPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCBtYXJrXSBvZiBbWydGcmllbmRMaXN0JywgJ2ZyaWVuZCddLCBbJ0ZvZUxpc3QnLCAnZm9lJ11dIGFzIGNvbnN0KSB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gdGhpcy5yZWFkU2V0dGluZyhrZXkpO1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3QpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBpZCBvZiBsaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKC9eWzEtOV1cXGQqJC8udGVzdChTdHJpbmcoaWQpKSkgbWFya3NbU3RyaW5nKGlkKV0gPSBtYXJrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXJrcztcbiAgICB9XG5cbiAgICByZWFkQ29sb3JzKCk6IFJlY29yZDxNYXJrLCBzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgc2F2ZWQgPSB0aGlzLnJlYWRTZXR0aW5nKCdQbGF5ZXJNYXJrQ29sb3JzJykgYXMgUGFydGlhbDxSZWNvcmQ8TWFyaywgdW5rbm93bj4+IHwgbnVsbDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZyaWVuZDogdHlwZW9mIHNhdmVkPy5mcmllbmQgPT09ICdzdHJpbmcnICYmIC9eI1tcXGRhLWZdezZ9JC9pLnRlc3Qoc2F2ZWQuZnJpZW5kKSA/IHNhdmVkLmZyaWVuZCA6IERFRkFVTFRfQ09MT1JTLmZyaWVuZCxcbiAgICAgICAgICAgIGZvZTogdHlwZW9mIHNhdmVkPy5mb2UgPT09ICdzdHJpbmcnICYmIC9eI1tcXGRhLWZdezZ9JC9pLnRlc3Qoc2F2ZWQuZm9lKSA/IHNhdmVkLmZvZSA6IERFRkFVTFRfQ09MT1JTLmZvZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJlYWRTYXZlZE5hbWVzKCk6IFJlY29yZDxzdHJpbmcsIFNhdmVkTmFtZT4ge1xuICAgICAgICBjb25zdCBzYXZlZCA9IHRoaXMucmVhZFNldHRpbmcoJ1BsYXllck1hcmtOYW1lcycpO1xuICAgICAgICBpZiAoIXNhdmVkIHx8IHR5cGVvZiBzYXZlZCAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShzYXZlZCkpIHJldHVybiB7fTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyhzYXZlZCkuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIFtzdHJpbmcsIFNhdmVkTmFtZV0gPT4ge1xuICAgICAgICAgICAgY29uc3QgWywgdmFsdWVdID0gZW50cnk7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCBCb29sZWFuKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlLm5hbWUgPT09ICdzdHJpbmcnKTtcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIHNhdmVOYW1lcyhuYW1lczogUmVjb3JkPHN0cmluZywgU2F2ZWROYW1lPikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbHNTZXQoJ1BsYXllck1hcmtOYW1lcycsIG5hbWVzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3QgcmVtZW1iZXIgbWFya2VkIHBsYXllciBuYW1lczonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlTWFyayhpZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IG1hcmtzID0gdGhpcy5yZWFkTWFya3MoKTtcbiAgICAgICAgZGVsZXRlIG1hcmtzW2lkXTtcbiAgICAgICAgaWYgKCF0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrcycsIG1hcmtzKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBuYW1lcyA9IHRoaXMucmVhZFNhdmVkTmFtZXMoKTtcbiAgICAgICAgaWYgKGlkIGluIG5hbWVzKSB7XG4gICAgICAgICAgICBkZWxldGUgbmFtZXNbaWRdO1xuICAgICAgICAgICAgdGhpcy5zYXZlTmFtZXMobmFtZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJlYWRTYXZlZE1hcmtzKCkge1xuICAgICAgICBjb25zdCBuYW1lcyA9IHRoaXMucmVhZFNhdmVkTmFtZXMoKTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKHRoaXMucmVhZE1hcmtzKCkpLmZsYXRNYXA8U2F2ZWRNYXJrPigoW2lkLCBtYXJrXSkgPT5cbiAgICAgICAgICAgIC9eWzEtOV1cXGQqJC8udGVzdChpZCkgJiYgKG1hcmsgPT09ICdmcmllbmQnIHx8IG1hcmsgPT09ICdmb2UnKVxuICAgICAgICAgICAgICAgID8gW3sgaWQsIG5hbWU6IGRpc3BsYXlTYXZlZE5hbWUobmFtZXNbaWRdKSwgbWFyayB9XVxuICAgICAgICAgICAgICAgIDogW10pO1xuICAgIH1cblxuICAgIHNhdmVTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbHNTZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICBhbGVydCgnSmFydmlzIGNvdWxkIG5vdCBzYXZlIHlvdXIgRnJpZW5kcyBhbmQgRm9lcyBzZXR0aW5ncy4nKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluc3RhbGxTZXR0aW5ncygpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRQYWdlICE9PSAnL2hvbWUuaHRtbCcpIHJldHVybjtcblxuICAgICAgICBjb25zdCBzZWxlY3RvciA9ICcuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZ1tyZWw9XCJKQVJWSVNfZnJpZW5kQW5kRm9lc1wiXSAuc3ViLXNldHRpbmdzJztcbiAgICAgICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICghc2V0dGluZ3MgfHwgc2V0dGluZ3MucXVlcnlTZWxlY3RvcignLmphcnZpcy1tYXJrLWNvbG9yJykpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgaW5wdXRzID0gbmV3IE1hcDxNYXJrLCBIVE1MSW5wdXRFbGVtZW50PigpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBbbWFyaywgdGV4dF0gb2YgW1snZnJpZW5kJywgJ0ZyaWVuZCBuYW1lIGNvbG9yJ10sIFsnZm9lJywgJ0ZvZSBuYW1lIGNvbG9yJ11dIGFzIGNvbnN0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1jb2xvcic7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgICAgICBpbnB1dC50eXBlID0gJ2NvbG9yJztcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHRoaXMucmVhZENvbG9ycygpW21hcmtdO1xuICAgICAgICAgICAgICAgIGlucHV0cy5zZXQobWFyaywgaW5wdXQpO1xuICAgICAgICAgICAgICAgIGlucHV0LmRpc2FibGVkID0gIXNldHRpbmdzLmNsb3Nlc3QoJy5jb25maWctc2V0dGluZycpPy5jbGFzc0xpc3QuY29udGFpbnMoJ2VuYWJsZWQnKTtcbiAgICAgICAgICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9ycyA9IHRoaXMucmVhZENvbG9ycygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtDb2xvcnMnLCB7IC4uLmNvbG9ycywgW21hcmtdOiBpbnB1dC52YWx1ZSB9KSkgaW5wdXQudmFsdWUgPSBjb2xvcnNbbWFya107XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbGFiZWwuYXBwZW5kKHRpdGxlLCBpbnB1dCk7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYXBwZW5kQ2hpbGQobGFiZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVzZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIHJlc2V0LnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIHJlc2V0LmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgICAgICAgICAgcmVzZXQudGV4dENvbnRlbnQgPSAnUmVzZXQgY29sb3JzJztcbiAgICAgICAgICAgIHJlc2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya0NvbG9ycycsIHt9KSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW21hcmssIGlucHV0XSBvZiBpbnB1dHMpIGlucHV0LnZhbHVlID0gREVGQVVMVF9DT0xPUlNbbWFya107XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IG1hbmFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgbWFuYWdlLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIG1hbmFnZS5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uJztcbiAgICAgICAgICAgIG1hbmFnZS50ZXh0Q29udGVudCA9ICdNYW5hZ2UgbWFya3MnO1xuICAgICAgICAgICAgbWFuYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gb3Blbk1hcmtNYW5hZ2VyKFxuICAgICAgICAgICAgICAgICgpID0+IHRoaXMucmVhZFNhdmVkTWFya3MoKSxcbiAgICAgICAgICAgICAgICBpZCA9PiB0aGlzLnJlbW92ZU1hcmsoaWQpLFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrcycsIHt9KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVOYW1lcyh7fSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgYWN0aW9ucy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstc2V0dGluZy1hY3Rpb25zJztcbiAgICAgICAgICAgIGFjdGlvbnMuYXBwZW5kKHJlc2V0LCBtYW5hZ2UpO1xuICAgICAgICAgICAgc2V0dGluZ3MuYXBwZW5kQ2hpbGQoYWN0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNsb3NlTWFya01lbnUoKSB7XG4gICAgICAgIHRoaXMubWFya01lbnU/LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLm1hcmtNZW51ID0gbnVsbDtcbiAgICB9XG5cbiAgICBvcGVuTWFya01lbnUoZXZlbnQ6IE1vdXNlRXZlbnQsIG5hbWU6IEhUTUxFbGVtZW50LCBpZDogc3RyaW5nKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcblxuICAgICAgICBjb25zdCBtZW51ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG1lbnUuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLW1lbnUnO1xuICAgICAgICBtZW51LnNldEF0dHJpYnV0ZSgncm9sZScsICdncm91cCcpO1xuICAgICAgICBtZW51LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdNYXJrIHBsYXllcicpO1xuICAgICAgICBjb25zdCBhZGRBY3Rpb24gPSAodGV4dDogc3RyaW5nLCBhY3Q6ICgpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUuaXNDb25uZWN0ZWQgJiYgdGhpcy5uYW1lcy5nZXQobmFtZSkgPT09IGlkKSBhY3QoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbWVudS5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB9O1xuICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCB0ZXh0XSBvZiBbWydmcmllbmQnLCAnTWFyayBhcyBmcmllbmQnXSwgWydmb2UnLCAnTWFyayBhcyBmb2UnXV0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgIGFkZEFjdGlvbih0ZXh0LCAoKSA9PiB0aGlzLmFwcGx5TWFyayhpZCwgbWFyaykpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lLmRhdGFzZXQuamFydmlzTWFyaykgYWRkQWN0aW9uKCdSZW1vdmUgdGhpcyBwbGF5ZXLigJlzIG1hcmsnLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZW1vdmVNYXJrKGlkKSkgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBtZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xpY2sgPT4gY2xpY2suc3RvcFByb3BhZ2F0aW9uKCkpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1lbnUpO1xuICAgICAgICB0aGlzLm1hcmtNZW51ID0gbWVudTtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBuYW1lLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCB4ID0gZXZlbnQuY2xpZW50WCB8fCBib3VuZHMubGVmdDtcbiAgICAgICAgY29uc3QgeSA9IGV2ZW50LmNsaWVudFkgfHwgYm91bmRzLmJvdHRvbTtcbiAgICAgICAgbWVudS5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oeCwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIC0gbWVudS5vZmZzZXRXaWR0aCkpICsgJ3B4JztcbiAgICAgICAgbWVudS5zdHlsZS50b3AgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih5LCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IC0gbWVudS5vZmZzZXRIZWlnaHQpKSArICdweCc7XG4gICAgICAgIG1lbnUucXVlcnlTZWxlY3RvcignYnV0dG9uJyk/LmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBnZXRDb250ZXN0TmFtZXMocm9vdDogSFRNTEVsZW1lbnQsIGNvbnRlc3RzOiBDb250ZXN0RGF0YVtdKSB7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gbmV3IE1hcDxIVE1MRWxlbWVudCwgc3RyaW5nPigpO1xuICAgICAgICBjb25zdCBieUNvbnRlc3QgPSBuZXcgTWFwPHN0cmluZywgTWFwPHN0cmluZywgU2V0PHN0cmluZz4+PigpO1xuXG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHJvb3QucXVlcnlTZWxlY3RvckFsbDxIVE1MVGFibGVSb3dFbGVtZW50PignLmxlYWRUYWJsZSB0cicpKSB7XG4gICAgICAgICAgICBjb25zdCBjZWxsID0gcm93LmNlbGxzPy5bMV07XG4gICAgICAgICAgICBpZiAoIWNlbGwgfHwgY2VsbC5sb2NhbE5hbWUgIT09ICd0ZCcpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGNlbGwucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5uaWNrbmFtZScpIHx8IGNlbGw7XG4gICAgICAgICAgICBsZXQgaWQgPSByb3cuZ2V0QXR0cmlidXRlKCdzb3J0aW5nX2lkJykgfHwgbmFtZS5nZXRBdHRyaWJ1dGUoJ2lkLW1lbWJlcicpIHx8XG4gICAgICAgICAgICAgICAgbmFtZS5xdWVyeVNlbGVjdG9yKCdbaWQtbWVtYmVyXScpPy5nZXRBdHRyaWJ1dGUoJ2lkLW1lbWJlcicpO1xuICAgICAgICAgICAgY29uc3QgY29udGVzdElkID0gcm93LmNsb3Nlc3QoJ1tpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmIChjb250ZXN0SWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgYnlOYW1lID0gYnlDb250ZXN0LmdldChjb250ZXN0SWQpO1xuICAgICAgICAgICAgICAgIGlmICghYnlOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRpY2lwYW50cyA9IGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBTdHJpbmcoY29udGVzdC5pZF9jb250ZXN0KSA9PT0gY29udGVzdElkKT8ucGFydGljaXBhbnRzO1xuICAgICAgICAgICAgICAgICAgICBieU5hbWUgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgeyBuaWNrbmFtZSwgaWRfbWVtYmVyIH0gb2YgT2JqZWN0LnZhbHVlcyhwYXJ0aWNpcGFudHMgfHwge30pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuaWNrbmFtZUtleSA9IFN0cmluZyhuaWNrbmFtZSA/PyAnJykudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFuaWNrbmFtZUtleSB8fCAhL15bMS05XVxcZCokLy50ZXN0KFN0cmluZyhpZF9tZW1iZXIpKSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYnlOYW1lLmdldChuaWNrbmFtZUtleSkgfHwgbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVzLmFkZChTdHJpbmcoaWRfbWVtYmVyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBieU5hbWUuc2V0KG5pY2tuYW1lS2V5LCBtYXRjaGVzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBieUNvbnRlc3Quc2V0KGNvbnRlc3RJZCwgYnlOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGJ5TmFtZS5nZXQocmVhZFJvd05hbWUobmFtZSkpO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzICYmICFtYXRjaGVzLmhhcyhpZCA/PyAnJykpIGlkID0gbWF0Y2hlcy5zaXplID09PSAxID8gbWF0Y2hlcy52YWx1ZXMoKS5uZXh0KCkudmFsdWUgOiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkICYmIC9eWzEtOV1cXGQqJC8udGVzdChpZCkpIG5hbWVzLnNldChuYW1lLCBpZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5hbWVzO1xuICAgIH1cblxuICAgIHJlZnJlc2goKSB7XG4gICAgICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50Pih0aGlzLnJvb3RTZWxlY3Rvcik7XG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3Q7XG4gICAgICAgIGNvbnN0IGNvbnRlc3RzID0gdGhpcy5pbkxlYWd1ZSA/IFtdIDogW1xuICAgICAgICAgICAgLi4uT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmFjdGl2ZSA/PyB7fSksXG4gICAgICAgICAgICAuLi5PYmplY3QudmFsdWVzKHdpbmRvdy5jb250ZXN0cz8uZmluaXNoZWQgPz8ge30pXG4gICAgICAgIF0uZmlsdGVyKGNvbnRlc3QgPT4gY29udGVzdD8uaWRfY29udGVzdCAhPSBudWxsKTtcbiAgICAgICAgY29uc3QgbmFtZXMgPSAhcm9vdCA/IG5ldyBNYXA8SFRNTEVsZW1lbnQsIHN0cmluZz4oKSA6IHRoaXMuaW5MZWFndWVcbiAgICAgICAgICAgID8gbmV3IE1hcChBcnJheS5mcm9tKHJvb3QucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5uaWNrbmFtZVtpZC1tZW1iZXJdJyksIG5hbWUgPT4gW25hbWUsIG5hbWUuZ2V0QXR0cmlidXRlKCdpZC1tZW1iZXInKV0gYXMgY29uc3QpXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyByZWFkb25seSBbSFRNTEVsZW1lbnQsIHN0cmluZ10gPT4gISFlbnRyeVsxXSAmJiAvXlsxLTldXFxkKiQvLnRlc3QoZW50cnlbMV0pKSlcbiAgICAgICAgICAgIDogdGhpcy5nZXRDb250ZXN0TmFtZXMocm9vdCwgY29udGVzdHMpO1xuXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiB0aGlzLm5hbWVzLmtleXMoKSkge1xuICAgICAgICAgICAgaWYgKG5hbWVzLmhhcyhuYW1lKSkgY29udGludWU7XG4gICAgICAgICAgICBkZWxldGUgbmFtZS5kYXRhc2V0LmphcnZpc1BsYXllcjtcbiAgICAgICAgICAgIGRlbGV0ZSBuYW1lLmRhdGFzZXQuamFydmlzTWFyaztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubmFtZXMgPSBuYW1lcztcbiAgICAgICAgaWYgKCFyb290KSByZXR1cm47XG4gICAgICAgIGNvbnN0IG1hcmtzID0gdGhpcy5yZWFkTWFya3MoKTtcbiAgICAgICAgY29uc3Qgc2F2ZWROYW1lcyA9IHRoaXMucmVhZFNhdmVkTmFtZXMoKTtcbiAgICAgICAgY29uc3Qgcm9zdGVyTmFtZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgbGV0IG5hbWVzQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICBjb25zdCByZW1lbWJlck5hbWUgPSAoaWQ6IHN0cmluZywgdGV4dD86IHN0cmluZyB8IG51bGwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlOYW1lID0gdHlwZW9mIHRleHQgPT09ICdzdHJpbmcnID8gdGV4dC50cmltKCkgOiAnJztcbiAgICAgICAgICAgIGlmICghZGlzcGxheU5hbWUgfHwgKG1hcmtzW2lkXSAhPT0gJ2ZyaWVuZCcgJiYgbWFya3NbaWRdICE9PSAnZm9lJykpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzID0gc2F2ZWROYW1lc1tpZF07XG4gICAgICAgICAgICBpZiAodHlwZW9mIHByZXZpb3VzID09PSAnc3RyaW5nJyB8fCBwcmV2aW91cz8ubmFtZSAhPT0gZGlzcGxheU5hbWUpIHtcbiAgICAgICAgICAgICAgICBzYXZlZE5hbWVzW2lkXSA9IHsgbmFtZTogZGlzcGxheU5hbWUgfTtcbiAgICAgICAgICAgICAgICBuYW1lc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmluTGVhZ3VlKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgcGxheWVyLCBuaWNrbmFtZSB9IG9mIHdpbmRvdy5vcHBvbmVudHNfbGlzdCA/PyBbXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gU3RyaW5nKHBsYXllcj8uaWRfZmlnaHRlcik7XG4gICAgICAgICAgICAgICAgaWYgKHJlbWVtYmVyTmFtZShpZCwgbmlja25hbWUpKSByb3N0ZXJOYW1lcy5hZGQoaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gUHJlZmVyIHRoZSBhY3RpdmUgcm9zdGVyIGlmIGEgcGxheWVyIGFwcGVhcnMgaW4gYm90aCBvbGQgYW5kIGN1cnJlbnQgY29udGVzdHMuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNvbnRlc3Qgb2YgY29udGVzdHMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHsgaWRfbWVtYmVyLCBuaWNrbmFtZSB9IG9mIE9iamVjdC52YWx1ZXMoY29udGVzdC5wYXJ0aWNpcGFudHMgPz8ge30pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gU3RyaW5nKGlkX21lbWJlcik7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcm9zdGVyTmFtZXMuaGFzKGlkKSAmJiByZW1lbWJlck5hbWUoaWQsIG5pY2tuYW1lKSkgcm9zdGVyTmFtZXMuYWRkKGlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29sb3JzID0gdGhpcy5yZWFkQ29sb3JzKCk7XG4gICAgICAgIGZvciAoY29uc3QgW21hcmssIGNvbG9yXSBvZiBPYmplY3QuZW50cmllcyhjb2xvcnMpKSB7XG4gICAgICAgICAgICBjb25zdCBwcm9wZXJ0eSA9ICctLWphcnZpcy0nICsgbWFyayArICctY29sb3InO1xuICAgICAgICAgICAgaWYgKHJvb3Quc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eSkgIT09IGNvbG9yKSByb290LnN0eWxlLnNldFByb3BlcnR5KHByb3BlcnR5LCBjb2xvcik7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgaWRdIG9mIG5hbWVzKSB7XG4gICAgICAgICAgICBpZiAobmFtZS5kYXRhc2V0LmphcnZpc1BsYXllciAhPT0gaWQpIG5hbWUuZGF0YXNldC5qYXJ2aXNQbGF5ZXIgPSBpZDtcbiAgICAgICAgICAgIGNvbnN0IG1hcmsgPSBtYXJrc1tpZF07XG4gICAgICAgICAgICBpZiAobWFyayA9PT0gJ2ZyaWVuZCcgfHwgbWFyayA9PT0gJ2ZvZScpIHtcbiAgICAgICAgICAgICAgICBpZiAobmFtZS5kYXRhc2V0LmphcnZpc01hcmsgIT09IG1hcmspIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrID0gbWFyaztcbiAgICAgICAgICAgICAgICBpZiAoIXJvc3Rlck5hbWVzLmhhcyhpZCkpIHJlbWVtYmVyTmFtZShpZCwgcmVhZFJvd05hbWUobmFtZSkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuYW1lLmRhdGFzZXQuamFydmlzTWFyaykge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBuYW1lLmRhdGFzZXQuamFydmlzTWFyaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZXNDaGFuZ2VkKSB0aGlzLnNhdmVOYW1lcyhzYXZlZE5hbWVzKTtcbiAgICB9XG5cbiAgICBhcHBseU1hcmsoaWQ6IHN0cmluZywgbWFyazogTWFyaykge1xuICAgICAgICBjb25zdCBtYXJrcyA9IHRoaXMucmVhZE1hcmtzKCk7XG4gICAgICAgIG1hcmtzW2lkXSA9IG1hcms7XG5cbiAgICAgICAgaWYgKHRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtzJywgbWFya3MpKSB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBoYW5kbGVNYXJrTWVudShldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSAmJiB0aGlzLm1hcmtNZW51Py5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm47XG4gICAgICAgIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuICAgICAgICBpZiAoZXZlbnQudHlwZSAhPT0gJ2NvbnRleHRtZW51JyAmJiAhZXZlbnQuYWx0S2V5KSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgbmFtZSA9IGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgPyBldmVudC50YXJnZXQuY2xvc2VzdDxIVE1MRWxlbWVudD4oJ1tkYXRhLWphcnZpcy1wbGF5ZXJdJykgOiBudWxsO1xuICAgICAgICBpZiAoIW5hbWUpIHJldHVybjtcbiAgICAgICAgY29uc3QgaWQgPSB0aGlzLm5hbWVzLmdldChuYW1lKTtcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLm9wZW5NYXJrTWVudShldmVudCwgbmFtZSwgaWQpO1xuICAgIH1cblxuICAgIHJ1bih7IGxlYWd1ZSwgY29udGVzdHMgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHRoaXMuaW5MZWFndWUgPSBjdXJyZW50UGFnZSA9PT0gJy9sZWFndWVzLmh0bWwnO1xuICAgICAgICBpZiAodGhpcy5pbkxlYWd1ZSA/ICFsZWFndWUgOiAhY29udGVzdHMpIHJldHVybjtcblxuICAgICAgICB0aGlzLnJvb3RTZWxlY3RvciA9IHRoaXMuaW5MZWFndWUgPyAnLmxlYWd1ZV90YWJsZScgOiAnI2NvbnRlc3RzIC5yaWdodF9wYXJ0JztcbiAgICAgICAgY29uc3QgaGFuZGxlTWFya01lbnUgPSAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHRoaXMuaGFuZGxlTWFya01lbnUoZXZlbnQpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZU1hcmtNZW51LCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBoYW5kbGVNYXJrTWVudSwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5ICE9PSAnRXNjYXBlJyB8fCAhdGhpcy5tYXJrTWVudSkgcmV0dXJuO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmICghZXZlbnQua2V5IHx8IFsnUGxheWVyTWFya3MnLCAnUGxheWVyTWFya0NvbG9ycycsICdGcmllbmRMaXN0JywgJ0ZvZUxpc3QnXVxuICAgICAgICAgICAgICAgIC5zb21lKGtleSA9PiBldmVudC5rZXkgPT09IExTX0NPTkZJR19OQU1FICsga2V5KSkgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobXV0YXRpb25zID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMucm9vdFNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChyb290ICE9PSB0aGlzLnJvb3QgfHwgKHJvb3QgJiYgbXV0YXRpb25zLnNvbWUoKHsgdGFyZ2V0IH0pID0+IHJvb3QuY29udGFpbnModGFyZ2V0KSkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgIGNoYXJhY3RlckRhdGE6IHRydWUsXG4gICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydzb3J0aW5nX2lkJywgJ2lkLW1lbWJlcicsICdpZF9jb250ZXN0J11cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgbHNHZXQsIGxzU2V0IH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5cbmV4cG9ydCB0eXBlIENvbnRlc3RLaW5kID0gJ2RhaWx5JyB8ICdldmVudCc7XG5leHBvcnQgdHlwZSBDb250ZXN0UmFuayA9ICd0b3AnIHwgJ21pbmUnO1xuXG5jb25zdCBDT05URVNUX0tJTkRTID0gW1snZGFpbHknLCAnRGFpbHknXSwgWydldmVudCcsICdFdmVudCddXSBhcyBjb25zdDtcbmNvbnN0IENPTlRFU1RfRVZFTlRTID0gW1snYW55JywgJ0FueSddLCBbJ2NiYycsICdDYkMnXSwgWydjY2MnLCAnQ0NDJ10sIFsnbGMnLCAnTEMnXV0gYXMgY29uc3Q7XG5jb25zdCBDT05URVNUX1JBTktTID0gW1sndG9wJywgJ1RvcCddLCBbJ21pbmUnLCAnTXkgcmFuayddXSBhcyBjb25zdDtcblxuZXhwb3J0IHR5cGUgQ29udGVzdEV2ZW50ID0gRXhjbHVkZTwodHlwZW9mIENPTlRFU1RfRVZFTlRTKVtudW1iZXJdWzBdLCAnYW55Jz47XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQ29udGVzdFNldHRpbmcoa2V5OiBzdHJpbmcpOiB1bmtub3duIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gbHNHZXQoa2V5KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZENvbnRlc3REZWZhdWx0cygpIHtcbiAgICBjb25zdCBraW5kOiBDb250ZXN0S2luZCA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdEtpbmQnKSA9PT0gJ2RhaWx5JyA/ICdkYWlseScgOiAnZXZlbnQnO1xuICAgIGNvbnN0IHNhdmVkRXZlbnQgPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RFdmVudCcpO1xuICAgIGNvbnN0IGV2ZW50ID0gQ09OVEVTVF9FVkVOVFMuZmluZCgoW3ZhbHVlXSkgPT4gdmFsdWUgPT09IHNhdmVkRXZlbnQpPy5bMF0gPz8gJ2FueSc7XG4gICAgY29uc3QgcmFuazogQ29udGVzdFJhbmsgPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RSYW5rU3RhcnQnKSA9PT0gJ3RvcCcgPyAndG9wJyA6ICdtaW5lJztcbiAgICByZXR1cm4geyBraW5kLCBldmVudCwgcmFuayB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZFBpbm5lZFJhbmsoaWQ6IHN0cmluZywgZmFsbGJhY2s6IENvbnRlc3RSYW5rKTogQ29udGVzdFJhbmsge1xuICAgIGNvbnN0IHNhdmVkID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0UGlubmVkUmFuaycpO1xuICAgIGlmIChzYXZlZCAmJiB0eXBlb2Ygc2F2ZWQgPT09ICdvYmplY3QnICYmICdpZCcgaW4gc2F2ZWQgJiYgc2F2ZWQuaWQgPT09IGlkICYmICdyYW5rJyBpbiBzYXZlZCkge1xuICAgICAgICBpZiAoc2F2ZWQucmFuayA9PT0gJ21pbmUnIHx8IHNhdmVkLnJhbmsgPT09ICd0b3AnKSByZXR1cm4gc2F2ZWQucmFuaztcbiAgICB9XG4gICAgcmV0dXJuIGZhbGxiYWNrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVJhbmtDaG9pY2UobGFiZWw6IHN0cmluZywgc2VsZWN0OiAocmFuazogQ29udGVzdFJhbmspID0+IHZvaWQpIHtcbiAgICByZXR1cm4gbWFrZUNob2ljZShsYWJlbCwgQ09OVEVTVF9SQU5LUywgc2VsZWN0KTtcbn1cblxuZnVuY3Rpb24gbWFrZUNob2ljZTxUIGV4dGVuZHMgc3RyaW5nPihsYWJlbDogc3RyaW5nLCBvcHRpb25zOiBSZWFkb25seUFycmF5PHJlYWRvbmx5IFtULCBzdHJpbmddPiwgc2VsZWN0OiAodmFsdWU6IFQpID0+IHZvaWQpIHtcbiAgICBjb25zdCBncm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBncm91cC5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3QtY2hvaWNlJztcbiAgICBncm91cC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnZ3JvdXAnKTtcbiAgICBncm91cC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBsYWJlbCk7XG4gICAgZ3JvdXAuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICBmb3IgKGNvbnN0IFt2YWx1ZSwgdGV4dF0gb2Ygb3B0aW9ucykge1xuICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgYnV0dG9uLmRhdGFzZXQuY29udGVzdENob2ljZSA9IHZhbHVlO1xuICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHNlbGVjdCh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBncm91cC5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgIH1cbiAgICByZXR1cm4gZ3JvdXA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RDb250ZXN0Q2hvaWNlKGdyb3VwOiBIVE1MRWxlbWVudCwgdmFsdWU6IHN0cmluZykge1xuICAgIGZvciAoY29uc3QgYnV0dG9uIG9mIGdyb3VwLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpKSB7XG4gICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIFN0cmluZyhidXR0b24uZGF0YXNldC5jb250ZXN0Q2hvaWNlID09PSB2YWx1ZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxDb250ZXN0U2V0dGluZ3MoKSB7XG4gICAgaWYgKGN1cnJlbnRQYWdlICE9PSAnL2hvbWUuaHRtbCcpIHJldHVybjtcblxuICAgIGNvbnN0IHNlbGVjdG9yID0gJy5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmNvbmZpZy1zZXR0aW5nW3JlbD1cIkpBUlZJU19jb250ZXN0U3RhcnRcIl0nO1xuICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICBpZiAoIWNhcmQgfHwgY2FyZC5xdWVyeVNlbGVjdG9yKCcuamFydmlzLWNvbnRlc3Qtc2V0dGluZ3MnKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGZpZWxkc2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZmllbGRzZXQnKTtcbiAgICAgICAgZmllbGRzZXQuY2xhc3NOYW1lID0gJ2phcnZpcy1jb250ZXN0LXNldHRpbmdzJztcbiAgICAgICAgZmllbGRzZXQuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ0NvbnRlc3Qgc3RhcnR1cCBkZWZhdWx0cycpO1xuICAgICAgICBjb25zdCBzYXZlID0gKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBncm91cDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbHNTZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShncm91cCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGNvbnRlc3QgZGVmYXVsdDonLCBlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXZlbnRMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBldmVudExhYmVsLmlubmVySFRNTCA9IHNldHRpbmdIZWxwKCdFdmVudCB0eXBlJywgJ1ByZWZlciBDYkMgKEN1bWJhY2sgQ29udGVzdCksIENDQyAoQ3JhenkgQ3VtYmFjayBDb250ZXN0KSwgb3IgTEMgKExlZ2VuZGFyeSBDb250ZXN0KSB3aGVuIGFjdGl2ZS4gQW55IG9wZW5zIHRoZSBib3R0b20gYWN0aXZlIGNvbnRlc3QsIGFzIGRvZXMgYW4gdW5hdmFpbGFibGUgZXZlbnQgdHlwZS4nKTtcbiAgICAgICAgY29uc3QgZXZlbnRzID0gbWFrZUNob2ljZSgnRXZlbnQgdHlwZScsIENPTlRFU1RfRVZFTlRTLCB2YWx1ZSA9PiBzYXZlKCdDb250ZXN0RXZlbnQnLCB2YWx1ZSwgZXZlbnRzKSk7XG4gICAgICAgIGNvbnN0IHNob3dFdmVudHMgPSAoa2luZDogQ29udGVzdEtpbmQpID0+IGV2ZW50TGFiZWwuaGlkZGVuID0gZXZlbnRzLmhpZGRlbiA9IGtpbmQgPT09ICdkYWlseSc7XG4gICAgICAgIGNvbnN0IGtpbmRzID0gbWFrZUNob2ljZSgnUHJlZmVycmVkIGNvbnRlc3QnLCBDT05URVNUX0tJTkRTLCB2YWx1ZSA9PiB7XG4gICAgICAgICAgICBpZiAoc2F2ZSgnQ29udGVzdEtpbmQnLCB2YWx1ZSwga2luZHMpKSBzaG93RXZlbnRzKHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJhbmtzID0gbWFrZVJhbmtDaG9pY2UoJ0RlZmF1bHQgbGVhZGVyYm9hcmQgcG9zaXRpb24nLCB2YWx1ZSA9PiBzYXZlKCdDb250ZXN0UmFua1N0YXJ0JywgdmFsdWUsIHJhbmtzKSk7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRzID0gcmVhZENvbnRlc3REZWZhdWx0cygpO1xuICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGtpbmRzLCBkZWZhdWx0cy5raW5kKTtcbiAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShldmVudHMsIGRlZmF1bHRzLmV2ZW50KTtcbiAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShyYW5rcywgZGVmYXVsdHMucmFuayk7XG4gICAgICAgIHNob3dFdmVudHMoZGVmYXVsdHMua2luZCk7XG5cbiAgICAgICAgY29uc3Qga2luZExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGtpbmRMYWJlbC5pbm5lckhUTUwgPSBzZXR0aW5nSGVscCgnUHJlZmVycmVkIGNvbnRlc3QnLCAnRGFpbHkgb3BlbnMgdGhlIGZpcnN0IGFjdGl2ZSBkYWlseSBjb250ZXN0LiBFdmVudCBjYW4gcHJlZmVyIGFuIGV2ZW50IHR5cGUgb3IgZm9sbG93IHRoZSBnYW1lIGFuZCBvcGVuIHRoZSBib3R0b20gYWN0aXZlIGNvbnRlc3QuJyk7XG4gICAgICAgIGNvbnN0IHJhbmtMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICByYW5rTGFiZWwuaW5uZXJIVE1MID0gc2V0dGluZ0hlbHAoJ0xlYWRlcmJvYXJkIHN0YXJ0JywgJ09wZW4gYXQgdGhlIHRvcCBvciBhdCB5b3VyIHJhbmsuIEEgc3RhcnJlZCBjb250ZXN0IGNhbiBoYXZlIGl0cyBvd24gcG9zaXRpb24uJyk7XG4gICAgICAgIGZpZWxkc2V0LmFwcGVuZChraW5kTGFiZWwsIGtpbmRzLCBldmVudExhYmVsLCBldmVudHMsIHJhbmtMYWJlbCwgcmFua3MpO1xuICAgICAgICBjb25zdCByZWZyZXNoRW5hYmxlZCA9ICgpID0+IGZpZWxkc2V0LmRpc2FibGVkID0gIWNhcmQuY2xhc3NMaXN0LmNvbnRhaW5zKCdlbmFibGVkJyk7XG4gICAgICAgIHJlZnJlc2hFbmFibGVkKCk7XG4gICAgICAgIG5ldyBNdXRhdGlvbk9ic2VydmVyKHJlZnJlc2hFbmFibGVkKS5vYnNlcnZlKGNhcmQsIHsgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10gfSk7XG4gICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoZmllbGRzZXQpO1xuICAgIH0pO1xufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgJCwgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCwgbHNSbSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgbWFrZVJhbmtDaG9pY2UsIHJlYWRDb250ZXN0RGVmYXVsdHMsIHJlYWRDb250ZXN0U2V0dGluZywgcmVhZFBpbm5lZFJhbmssIHNlbGVjdENvbnRlc3RDaG9pY2UsIHR5cGUgQ29udGVzdEV2ZW50LCB0eXBlIENvbnRlc3RLaW5kIH0gZnJvbSAnLi9jb250ZXN0UHJlZmVyZW5jZXMnO1xuXG50eXBlIENvbnRlc3RDYXRlZ29yeSA9IENvbnRlc3RLaW5kIHwgQ29udGVzdEV2ZW50O1xuXG5mdW5jdGlvbiBnZXRDb250ZXN0Q2F0ZWdvcnkoY2F0ZWdvcnk6IHN0cmluZyB8IHVuZGVmaW5lZCk6IENvbnRlc3RDYXRlZ29yeSB8IG51bGwge1xuICAgIHN3aXRjaCAoY2F0ZWdvcnk/LnRyaW0oKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1stIF0rL2csICdfJykpIHtcbiAgICAgICAgY2FzZSAnZGFpbHknOlxuICAgICAgICBjYXNlICdkYWlseV9jb250ZXN0JzogcmV0dXJuICdkYWlseSc7XG4gICAgICAgIGNhc2UgJ2N1bWJhY2snOlxuICAgICAgICBjYXNlICdjdW1iYWNrX2NvbnRlc3QnOlxuICAgICAgICBjYXNlICdjYmMnOiByZXR1cm4gJ2NiYyc7XG4gICAgICAgIGNhc2UgJ2NyYXp5X2N1bWJhY2snOlxuICAgICAgICBjYXNlICdjcmF6eV9jdW1iYWNrX2NvbnRlc3QnOlxuICAgICAgICBjYXNlICdjY2JjJzpcbiAgICAgICAgY2FzZSAnY2NjJzogcmV0dXJuICdjY2MnO1xuICAgICAgICBjYXNlICdsZWdlbmRhcnknOlxuICAgICAgICBjYXNlICdsZWdlbmRhcnlfY29udGVzdCc6XG4gICAgICAgIGNhc2UgJ2xjJzogcmV0dXJuICdsYyc7XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiBjYXRlZ29yeSA/ICdldmVudCcgOiBudWxsO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIENvbnRlc3RDYXJkIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIGNhcmQ6IEhUTUxFbGVtZW50O1xuICAgIGhlYWRlcjogSFRNTEVsZW1lbnQ7XG4gICAgdGl0bGU6IEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIGNhdGVnb3J5OiBDb250ZXN0Q2F0ZWdvcnkgfCBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJtQ29udGVzdFN0YXJ0dXBHdWFyZCgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBpZiAobG9jYXRpb24ucGF0aG5hbWUgIT09ICcvYWN0aXZpdGllcy5odG1sJyB8fCBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KCd0YWInKSAhPT0gJ2NvbnRlc3RzJykgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ0hIUGx1c1BsdXNDb25maWcnKSA/PyAnbnVsbCcpPy5KQVJWSVNfY29udGVzdFN0YXJ0ID09PSBmYWxzZSkgcmV0dXJuO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gS2VlcCBib3RoIHBhbmVzIG91dCBvZiB2aWV3IHVudGlsIHRoZSBjaG9zZW4gY29udGVzdCBhbmQgaXRzIGxlYWRlcmJvYXJkIGFyZSBwb3NpdGlvbmVkLlxuICAgIGNvbnN0IGd1YXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBndWFyZC5pZCA9ICdqYXJ2aXMtY29udGVzdC1zdGFydHVwJztcbiAgICBndWFyZC50ZXh0Q29udGVudCA9IGBcbiAgICAgICAgI2NvbnRlc3RzIC5sZWZ0X3BhcnQgLnNjcm9sbF9hcmVhLFxuICAgICAgICAjY29udGVzdHMgLnJpZ2h0X3BhcnQge1xuICAgICAgICAgICAgb3BhY2l0eTogMCAhaW1wb3J0YW50O1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogbm9uZSAhaW1wb3J0YW50O1xuICAgICAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgICAgIH1cbiAgICBgO1xuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICBpZiAoIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkgcmV0dXJuO1xuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ3VhcmQpO1xuICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgfSk7XG4gICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKGd1YXJkKTtcbiAgICBlbHNlIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQsIHsgY2hpbGRMaXN0OiB0cnVlIH0pO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgZ3VhcmQucmVtb3ZlKCk7XG4gICAgfSwgNDAwMCk7XG59XG5cbmV4cG9ydCBjbGFzcyBDb250ZXN0U3RhcnQgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBwcmVmZXJlbmNlID0gJyc7XG4gICAgcHJpdmF0ZSBzdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgIHByaXZhdGUgZGVmYXVsdHMgPSByZWFkQ29udGVzdERlZmF1bHRzKCk7XG4gICAgcHJpdmF0ZSBsaXN0OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmlnaHQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByZXN0b3JpbmdDYXJkOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmVwb3NpdGlvbjogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdG9wSnVtcDogKChmaW5pc2g/OiBib29sZWFuKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgb2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGxpc3RlbmVyczogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdjb250ZXN0U3RhcnQnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiQ29udGVzdCBzdGFydHVwXCIsIFwiT3BlbiB0aGUgcHJlZmVycmVkIGNvbnRlc3QgYW5kIGxlYWRlcmJvYXJkIHBvc2l0aW9uIG9uIGxvYWQuIEEgc3RhcnJlZCBjb250ZXN0IHRha2VzIHByaW9yaXR5LlwiKVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHsgbmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hIH0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlID09PSAnL2FjdGl2aXRpZXMuaHRtbCc7XG4gICAgfVxuXG4gICAgZ2V0Q29udGVzdHMobGlzdDogSFRNTEVsZW1lbnQsIGZpbmlzaGVkOiBSZWFkb25seVNldDxzdHJpbmc+KTogQ29udGVzdENhcmRbXSB7XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IG5ldyBNYXAoT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmFjdGl2ZSB8fCB7fSlcbiAgICAgICAgICAgIC5maWx0ZXIoY29udGVzdCA9PiBjb250ZXN0Py5pZF9jb250ZXN0ICE9IG51bGwpXG4gICAgICAgICAgICAubWFwKGNvbnRlc3QgPT4gW1N0cmluZyhjb250ZXN0LmlkX2NvbnRlc3QpLCBjb250ZXN0XSkpO1xuXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGxpc3QucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5jb250ZXN0W2lkX2NvbnRlc3RdJykpLmZsYXRNYXAoY2FyZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IGNhcmQuZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG4gICAgICAgICAgICBpZiAoIWlkKSByZXR1cm4gW107XG4gICAgICAgICAgICBjb25zdCBjb250ZXN0ID0gYWN0aXZlLmdldChpZCk7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXIgPSBjYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcuY29udGVzdF9oZWFkZXInKTtcbiAgICAgICAgICAgIGlmICghaGVhZGVyIHx8IGZpbmlzaGVkLmhhcyhpZCkpIHJldHVybiBbXTtcbiAgICAgICAgICAgIGlmICghY29udGVzdCAmJiAhaGVhZGVyLm1hdGNoZXMoJy5pbl9wcm9ncmVzcycpKSByZXR1cm4gW107XG5cbiAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcuY29udGVzdF90aXRsZSwgLmNvbnRlc3RfbmFtZSwgaDMsIGg0LCBoNScpO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHRpdGxlICYmIEFycmF5LmZyb20odGl0bGUuY2hpbGROb2RlcylcbiAgICAgICAgICAgICAgICAuZmlsdGVyKG5vZGUgPT4gIShub2RlIGluc3RhbmNlb2YgRWxlbWVudCkgfHwgIW5vZGUubWF0Y2hlcygnLmphcnZpcy1jb250ZXN0LXBpbiwgLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKSlcbiAgICAgICAgICAgICAgICAubWFwKG5vZGUgPT4gbm9kZS50ZXh0Q29udGVudCkuam9pbignJykudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBnZXRDb250ZXN0Q2F0ZWdvcnkoY29udGVzdD8uY2F0ZWdvcnlfdHlwZSk7XG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICBpZCwgY2FyZCwgaGVhZGVyLCB0aXRsZSxcbiAgICAgICAgICAgICAgICBjYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBsYWJlbDogU3RyaW5nKG5hbWUgfHwgY29udGVzdD8ubmFtZSB8fCBjb250ZXN0Py50aXRsZSB8fFxuICAgICAgICAgICAgICAgICAgICAoY2F0ZWdvcnkgPT09ICdkYWlseScgPyAnRGFpbHkgY29udGVzdCcgOiAnQ29udGVzdCcpKS50cmltKClcbiAgICAgICAgICAgIH1dO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRUYXJnZXQoY29udGVzdHM6IENvbnRlc3RDYXJkW10pIHtcbiAgICAgICAgaWYgKHRoaXMucHJlZmVyZW5jZSkgcmV0dXJuIGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmlkID09PSB0aGlzLnByZWZlcmVuY2UpO1xuXG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRzLmtpbmQgPT09ICdldmVudCcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRlZmF1bHRzLmV2ZW50ICE9PSAnYW55Jykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gWy4uLmNvbnRlc3RzXS5yZXZlcnNlKCkuZmluZChjb250ZXN0ID0+IGNvbnRlc3QuY2F0ZWdvcnkgPT09IHRoaXMuZGVmYXVsdHMuZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChldmVudCB8fCBkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSByZXR1cm4gZXZlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29udGVzdHMuYXQoLTEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb250ZXN0cy5maW5kKGNvbnRlc3QgPT4gY29udGVzdC5jYXRlZ29yeSA9PT0gJ2RhaWx5JykgPz9cbiAgICAgICAgICAgIGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmNhdGVnb3J5ID09PSBudWxsKSA/PyBjb250ZXN0c1swXTtcbiAgICB9XG5cbiAgICBjbGVhckV4cGlyZWRQaW4obGlzdDogSFRNTEVsZW1lbnQsIGNvbnRlc3RzOiBDb250ZXN0Q2FyZFtdLCBmaW5pc2hlZDogUmVhZG9ubHlTZXQ8c3RyaW5nPikge1xuICAgICAgICBpZiAoIXRoaXMucHJlZmVyZW5jZSB8fCBjb250ZXN0cy5zb21lKCh7IGlkIH0pID0+IGlkID09PSB0aGlzLnByZWZlcmVuY2UpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgYWN0aXZlID0gd2luZG93LmNvbnRlc3RzPy5hY3RpdmU7XG4gICAgICAgIGNvbnN0IG1pc3NpbmcgPSBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnICYmIGxpc3QucXVlcnlTZWxlY3RvcignLmNvbnRlc3RfaGVhZGVyJykgJiZcbiAgICAgICAgICAgIGFjdGl2ZSAmJiAhT2JqZWN0LnZhbHVlcyhhY3RpdmUpLnNvbWUoY29udGVzdCA9PiBTdHJpbmcoY29udGVzdD8uaWRfY29udGVzdCkgPT09IHRoaXMucHJlZmVyZW5jZSk7XG4gICAgICAgIGlmICghZmluaXNoZWQuaGFzKHRoaXMucHJlZmVyZW5jZSkgJiYgIW1pc3NpbmcpIHJldHVybjtcblxuICAgICAgICBjb25zdCBleHBpcmVkSWQgPSB0aGlzLnByZWZlcmVuY2U7XG4gICAgICAgIHRoaXMucHJlZmVyZW5jZSA9ICcnO1xuICAgICAgICB0aGlzLnN0b3BKdW1wPy4oZmFsc2UpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKFN0cmluZyhsc0dldCgnQ29udGVzdFN0YXJ0SWQnKSkgPT09IGV4cGlyZWRJZCkgbHNSbSgnQ29udGVzdFN0YXJ0SWQnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3QgY2xlYXIgdGhlIGV4cGlyZWQgY29udGVzdCBwcmVmZXJlbmNlOicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGVQaW5zKGxpc3Q6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdENhcmRbXSkge1xuICAgICAgICBjb25zdCBob3N0cyA9IG5ldyBTZXQoY29udGVzdHMubWFwKCh7IHRpdGxlLCBoZWFkZXIgfSkgPT4gdGl0bGUgfHwgaGVhZGVyKSk7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbCBvZiBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1waW4sIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JykpIHtcbiAgICAgICAgICAgIGlmICghY29udHJvbC5wYXJlbnRFbGVtZW50IHx8ICFob3N0cy5oYXMoY29udHJvbC5wYXJlbnRFbGVtZW50KSkgY29udHJvbC5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgeyBpZCwgdGl0bGUsIGhlYWRlciwgbGFiZWwgfSBvZiBjb250ZXN0cykge1xuICAgICAgICAgICAgY29uc3QgaG9zdCA9IHRpdGxlIHx8IGhlYWRlcjtcbiAgICAgICAgICAgIGxldCBwaW4gPSBob3N0LnF1ZXJ5U2VsZWN0b3I8SFRNTEJ1dHRvbkVsZW1lbnQ+KCc6c2NvcGUgPiAuamFydmlzLWNvbnRlc3QtcGluJyk7XG4gICAgICAgICAgICBpZiAoIXBpbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY29udGVzdC1waW4nO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlc3RJZCA9IGJ1dHRvbi5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb250ZXN0SWQpIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5wcmVmZXJlbmNlID09PSBjb250ZXN0SWQgPyAnJyA6IGNvbnRlc3RJZDtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0KSBsc1NldCgnQ29udGVzdFN0YXJ0SWQnLCBuZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgbHNSbSgnQ29udGVzdFN0YXJ0SWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJlZmVyZW5jZSA9IG5leHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3BKdW1wPy4oKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB0aGUgY29udGVzdCBwcmVmZXJlbmNlOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcGluID0gaG9zdC5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGlubmVkID0gdGhpcy5wcmVmZXJlbmNlID09PSBpZDtcbiAgICAgICAgICAgIHBpbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIFN0cmluZyhwaW5uZWQpKTtcbiAgICAgICAgICAgIHBpbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBwaW5uZWQgPyBgVW5waW4gJHtsYWJlbH1gIDogYFBpbiAke2xhYmVsfSB0byBvcGVuIG9uIHJlbG9hZGApO1xuICAgICAgICAgICAgcGluLnRpdGxlID0gcGlubmVkID8gJ1Bpbm5lZC4gQ2xpY2sgdG8gdXNlIHlvdXIgY29udGVzdCBkZWZhdWx0cy4nIDogJ09wZW4gdGhpcyBjb250ZXN0IHdoZW4gdGhlIHBhZ2UgcmVsb2Fkcyc7XG5cbiAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IGhvc3QucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJzpzY29wZSA+IC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0Jyk7XG4gICAgICAgICAgICBpZiAoIXBpbm5lZCkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uPy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaG9pY2UgPSBtYWtlUmFua0Nob2ljZSgnUGlubmVkIGxlYWRlcmJvYXJkIHN0YXJ0JywgcmFuayA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsc1NldCgnQ29udGVzdFBpbm5lZFJhbmsnLCB7IGlkLCByYW5rIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShjaG9pY2UsIHJhbmspO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBzYXZlIHRoZSBsZWFkZXJib2FyZCBwb3NpdGlvbjonLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2hvaWNlLmNsYXNzTGlzdC5hZGQoJ2phcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKTtcbiAgICAgICAgICAgICAgICBwaW4uYWZ0ZXIoY2hvaWNlKTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IGNob2ljZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2UocG9zaXRpb24sIHJlYWRQaW5uZWRSYW5rKGlkLCB0aGlzLmRlZmF1bHRzLnJhbmspKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFNlbGVjdGVkQ29udGVzdElkKGxpc3Q6IEhUTUxFbGVtZW50LCByaWdodDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBsaXN0LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZXN0X2hlYWRlcl9hY3RpdmUnKT8uY2xvc2VzdCgnLmNvbnRlc3RbaWRfY29udGVzdF0nKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkKSByZXR1cm4gc2VsZWN0ZWQuZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG5cbiAgICAgICAgY29uc3QgcGFuZWxzID0gQXJyYXkuZnJvbShyaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcucmFua2luZ1tpZF9jb250ZXN0XScpKVxuICAgICAgICAgICAgLmZpbHRlcihwYW5lbCA9PiBwYW5lbC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCAmJiBnZXRDb21wdXRlZFN0eWxlKHBhbmVsKS52aXNpYmlsaXR5ID09PSAndmlzaWJsZScpO1xuICAgICAgICByZXR1cm4gcGFuZWxzLmxlbmd0aCA9PT0gMSA/IHBhbmVsc1swXS5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKSA6IG51bGw7XG4gICAgfVxuXG4gICAgc2hvd0xlYWRlcmJvYXJkKHJpZ2h0OiBIVE1MRWxlbWVudCwgY29udGVzdElkOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgICAgIGlmICghY29udGVzdElkKSB7XG4gICAgICAgICAgICByaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcuamFydmlzLWNvbnRlc3Qtb3RoZXInKS5mb3JFYWNoKHBhbmVsID0+IHBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2phcnZpcy1jb250ZXN0LW90aGVyJykpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgcGFuZWwgb2YgcmlnaHQucXVlcnlTZWxlY3RvckFsbCgnLnJhbmtpbmdbaWRfY29udGVzdF0nKSkge1xuICAgICAgICAgICAgcGFuZWwuY2xhc3NMaXN0LnRvZ2dsZSgnamFydmlzLWNvbnRlc3Qtb3RoZXInLCBwYW5lbC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKSAhPT0gY29udGVzdElkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldE93blJvdyhib2FyZDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3Qgb3duID0gYm9hcmQucXVlcnlTZWxlY3RvcignLmxlYWRUYWJsZSB0ci5sZWFkX3RhYmxlX2RlZmF1bHQnKTtcbiAgICAgICAgaWYgKG93bikgcmV0dXJuIG93bjtcblxuICAgICAgICBjb25zdCBoZXJvSWQgPSAod2luZG93LnNoYXJlZD8uSGVybyB8fCB3aW5kb3cuSGVybyk/LmluZm9zPy5pZDtcbiAgICAgICAgaWYgKGhlcm9JZCA9PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShib2FyZC5xdWVyeVNlbGVjdG9yQWxsKCcubGVhZFRhYmxlIHRyW3NvcnRpbmdfaWRdJykpXG4gICAgICAgICAgICAuZmluZChyb3cgPT4gcm93LmdldEF0dHJpYnV0ZSgnc29ydGluZ19pZCcpID09PSBTdHJpbmcoaGVyb0lkKSk7XG4gICAgfVxuXG4gICAgbG9ja1Njcm9sbChzY3JvbGxlcjogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgJChzY3JvbGxlcikuc3RvcCh0cnVlLCBmYWxzZSk7XG4gICAgICAgIC8vIFRoZSBnYW1lIGNhbiBzdGFydCBhbm90aGVyIGpRdWVyeSB0d2VlbiBhZnRlciBsb2FkLiBCbG9jayBpdHMgd3JpdGVzIG9uIHRoaXMgcGFuZSBvbmx5LlxuICAgICAgICBjb25zdCBpZ25vcmVTY3JvbGwgPSAoKSA9PiB7fTtcbiAgICAgICAgY29uc3QgZ2V0ID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwgJ3Njcm9sbFRvcCcpPy5nZXQ7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3JzID0gT2JqZWN0LmVudHJpZXMoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiB7IGdldCwgc2V0OiBpZ25vcmVTY3JvbGwgfSxcbiAgICAgICAgICAgIHNjcm9sbDogeyB2YWx1ZTogaWdub3JlU2Nyb2xsLCB3cml0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgc2Nyb2xsVG86IHsgdmFsdWU6IGlnbm9yZVNjcm9sbCwgd3JpdGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHNjcm9sbEJ5OiB7IHZhbHVlOiBpZ25vcmVTY3JvbGwsIHdyaXRhYmxlOiB0cnVlIH1cbiAgICAgICAgfSkuZmlsdGVyKChba2V5XSkgPT4gIU9iamVjdC5oYXNPd24oc2Nyb2xsZXIsIGtleSkpO1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGRlc2NyaXB0b3JdIG9mIGRlc2NyaXB0b3JzKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2Nyb2xsZXIsIGtleSwgeyAuLi5kZXNjcmlwdG9yLCBjb25maWd1cmFibGU6IHRydWUgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgJChzY3JvbGxlcikuc3RvcCh0cnVlLCBmYWxzZSk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGRlc2NyaXB0b3JdIG9mIGRlc2NyaXB0b3JzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc2Nyb2xsZXIsIGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgJiYgY3VycmVudC52YWx1ZSA9PT0gZGVzY3JpcHRvci52YWx1ZSAmJiBjdXJyZW50LnNldCA9PT0gZGVzY3JpcHRvci5zZXQpIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoc2Nyb2xsZXIsIGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAganVtcFRvKHNjcm9sbGVyOiBIVE1MRWxlbWVudCwgdGFyZ2V0OiBFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCwgY2VudGVyID0gZmFsc2UpIHtcbiAgICAgICAgbGV0IHRvcCA9IDA7XG4gICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGJvdW5kcyA9IHNjcm9sbGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3Qgc2NhbGUgPSBib3VuZHMuaGVpZ2h0IC8gc2Nyb2xsZXIub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgaWYgKCFzY2FsZSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBpdGVtID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgdG9wID0gc2Nyb2xsZXIuc2Nyb2xsVG9wICsgKGl0ZW0udG9wIC0gYm91bmRzLnRvcCkgLyBzY2FsZSAtIHNjcm9sbGVyLmNsaWVudFRvcDtcbiAgICAgICAgICAgIGlmIChjZW50ZXIpIHRvcCAtPSAoc2Nyb2xsZXIuY2xpZW50SGVpZ2h0IC0gaXRlbS5oZWlnaHQgLyBzY2FsZSkgLyAyO1xuICAgICAgICB9XG4gICAgICAgIHRvcCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHNjcm9sbGVyLnNjcm9sbEhlaWdodCAtIHNjcm9sbGVyLmNsaWVudEhlaWdodCwgdG9wKSk7XG4gICAgICAgIGlmIChNYXRoLmFicyh0b3AgLSBzY3JvbGxlci5zY3JvbGxUb3ApID49IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbFRvID0gRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsVG8gYXMgKG9wdGlvbnM6IFNjcm9sbFRvT3B0aW9ucykgPT4gdm9pZDtcbiAgICAgICAgICAgIHNjcm9sbFRvLmNhbGwoc2Nyb2xsZXIsIHsgdG9wLCBiZWhhdmlvcjogJ2luc3RhbnQnIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb3BlbkNvbnRlc3QobGlzdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudCwgeyBpZCwgY2FyZCwgaGVhZGVyLCB0aXRsZSB9OiBDb250ZXN0Q2FyZCkge1xuICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkgcGFuZS5jbGFzc0xpc3QuYWRkKCdqYXJ2aXMtY29udGVzdC1pbnN0YW50JywgJ2phcnZpcy1jb250ZXN0LWxvYWRpbmcnKTtcbiAgICAgICAgY29uc3QgcmFuayA9IGlkID09PSB0aGlzLnByZWZlcmVuY2UgPyByZWFkUGlubmVkUmFuayhpZCwgdGhpcy5kZWZhdWx0cy5yYW5rKSA6IHRoaXMuZGVmYXVsdHMucmFuaztcbiAgICAgICAgY29uc3QgcGxhY2VBdE93blJhbmsgPSByYW5rID09PSAnbWluZSc7XG4gICAgICAgIGNvbnN0IHJlbGVhc2VMaXN0ID0gdGhpcy5sb2NrU2Nyb2xsKGxpc3QpO1xuICAgICAgICBsZXQgYm9hcmQ6IEhUTUxFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHJlbGVhc2VCb2FyZDogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgICAgICBsZXQgcG9zaXRpb25lZCA9IGZhbHNlO1xuICAgICAgICBsZXQgbGFzdEF0dGVtcHQ6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgY29uc3QgZ2V0Qm9hcmQgPSAoKSA9PiBBcnJheS5mcm9tKHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYW5raW5nW2lkX2NvbnRlc3RdJykpXG4gICAgICAgICAgICAuZmluZChwYW5lbCA9PiBwYW5lbC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKSA9PT0gaWQpPy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmxlYWRfdGFibGVfdmlldycpO1xuICAgICAgICBjb25zdCB1cGRhdGVCb2FyZCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSBnZXRCb2FyZCgpO1xuICAgICAgICAgICAgaWYgKGJvYXJkID09PSBuZXh0KSByZXR1cm47XG4gICAgICAgICAgICByZWxlYXNlQm9hcmQ/LigpO1xuICAgICAgICAgICAgYm9hcmQgPSBuZXh0O1xuICAgICAgICAgICAgcmVsZWFzZUJvYXJkID0gYm9hcmQgPyB0aGlzLmxvY2tTY3JvbGwoYm9hcmQpIDogdW5kZWZpbmVkO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXZlYWwgPSAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkgcGFuZS5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdG9yZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghbGlzdC5pc0Nvbm5lY3RlZCB8fCAhcmlnaHQuaXNDb25uZWN0ZWQgfHwgIWxpc3QuY29udGFpbnMoY2FyZCkpIHJldHVybjtcblxuICAgICAgICAgICAgdXBkYXRlQm9hcmQoKTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCk7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQgIT09IGlkICYmIHNlbGVjdGVkICE9PSBsYXN0QXR0ZW1wdCkge1xuICAgICAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIG51bGwpO1xuICAgICAgICAgICAgICAgICh0aXRsZSB8fCBoZWFkZXIpLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgdXBkYXRlQm9hcmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghYm9hcmQ/LmNsaWVudEhlaWdodCB8fCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSAhPT0gaWQgfHxcbiAgICAgICAgICAgICAgICAocGxhY2VBdE93blJhbmsgJiYgIWJvYXJkLnF1ZXJ5U2VsZWN0b3IoJy5sZWFkVGFibGUnKSkpIHJldHVybjtcbiAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIGlkKTtcbiAgICAgICAgICAgIHRoaXMuanVtcFRvKGxpc3QsIGNhcmQpO1xuICAgICAgICAgICAgdGhpcy5qdW1wVG8oYm9hcmQsIHBsYWNlQXRPd25SYW5rID8gdGhpcy5nZXRPd25Sb3coYm9hcmQpIDogbnVsbCwgcGxhY2VBdE93blJhbmspO1xuICAgICAgICAgICAgaWYgKCFwb3NpdGlvbmVkKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICByZXZlYWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb3JyZWN0IGJyb3dzZXItZHJpdmVuIG1vdmVzLCBzdWNoIGFzIHNjcm9sbEludG9WaWV3IG9uIGEgbGVhZGVyYm9hcmQgcm93LCBiZWZvcmUgcGFpbnQuXG4gICAgICAgIGNvbnN0IG9uU2Nyb2xsID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gbGlzdCB8fCBldmVudC50YXJnZXQgPT09IGJvYXJkKSByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGlucHV0RXZlbnRzID0gWydwb2ludGVyZG93bicsICd0b3VjaHN0YXJ0JywgJ3doZWVsJywgJ2NsaWNrJ107XG4gICAgICAgIGNvbnN0IG9uSW5wdXQgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkKSBzdG9wKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0b3BPbktleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmlzVHJ1c3RlZCAmJiBbJ1RhYicsICdBcnJvd1VwJywgJ0Fycm93RG93bicsICdQYWdlVXAnLCAnUGFnZURvd24nLCAnSG9tZScsICdFbmQnLCAnRW50ZXInLCAnICddLmluY2x1ZGVzKGV2ZW50LmtleSkpIHN0b3AoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgYWZ0ZXJMb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0b3AgPSAoZmluaXNoID0gdHJ1ZSkgPT4ge1xuICAgICAgICAgICAgcmVsZWFzZUxpc3QoKTtcbiAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgICAgIHBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25TY3JvbGwsIHRydWUpO1xuICAgICAgICAgICAgICAgIHBhbmUuY2xhc3NMaXN0LnJlbW92ZSgnamFydmlzLWNvbnRlc3QtaW5zdGFudCcsICdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIGlucHV0RXZlbnRzKSBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBvbklucHV0LCB0cnVlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBzdG9wT25LZXksIHRydWUpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBhZnRlckxvYWQpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgIHRoaXMuc3RvcEp1bXAgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZXBvc2l0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucmVzdG9yaW5nQ2FyZCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoZmluaXNoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldmVhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoc3RvcCwgNDAwMCk7XG4gICAgICAgIHRoaXMuc3RvcEp1bXAgPSBzdG9wO1xuICAgICAgICB0aGlzLnJlcG9zaXRpb24gPSByZXN0b3JlO1xuICAgICAgICB0aGlzLnJlc3RvcmluZ0NhcmQgPSBjYXJkO1xuICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgcGFuZS5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCwgeyBwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgaW5wdXRFdmVudHMpIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uSW5wdXQsIHsgcGFzc2l2ZTogdHJ1ZSwgY2FwdHVyZTogdHJ1ZSB9KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHN0b3BPbktleSwgdHJ1ZSk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFmdGVyTG9hZCwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICByZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEnKTtcbiAgICAgICAgY29uc3QgcmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignI2NvbnRlc3RzIC5yaWdodF9wYXJ0Jyk7XG4gICAgICAgIGlmICh0aGlzLnN0b3BKdW1wICYmICh0aGlzLmxpc3QgIT09IGxpc3QgfHwgdGhpcy5yaWdodCAhPT0gcmlnaHQgfHwgIWxpc3Q/LmNvbnRhaW5zKHRoaXMucmVzdG9yaW5nQ2FyZCkpKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BKdW1wKGZhbHNlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0KSB0aGlzLnNob3dMZWFkZXJib2FyZCh0aGlzLnJpZ2h0LCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxpc3QgPSBsaXN0O1xuICAgICAgICB0aGlzLnJpZ2h0ID0gcmlnaHQ7XG4gICAgICAgIGlmICghbGlzdCB8fCAhcmlnaHQgfHwgIWxpc3QuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggfHwgZ2V0Q29tcHV0ZWRTdHlsZShsaXN0KS52aXNpYmlsaXR5ICE9PSAndmlzaWJsZScpIHJldHVybjtcblxuICAgICAgICBjb25zdCBmaW5pc2hlZCA9IG5ldyBTZXQoT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmZpbmlzaGVkIHx8IHt9KVxuICAgICAgICAgICAgLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbCkubWFwKGNvbnRlc3QgPT4gU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCkpKTtcbiAgICAgICAgZm9yIChjb25zdCBlbmRlZCBvZiBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZXN0LmVuZGVkLCAuY29udGVzdF9oZWFkZXIuZW5kZWQnKSkge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBlbmRlZC5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmIChpZCkgZmluaXNoZWQuYWRkKGlkKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb250ZXN0cyA9IHRoaXMuZ2V0Q29udGVzdHMobGlzdCwgZmluaXNoZWQpO1xuICAgICAgICB0aGlzLmNsZWFyRXhwaXJlZFBpbihsaXN0LCBjb250ZXN0cywgZmluaXNoZWQpO1xuICAgICAgICB0aGlzLnVwZGF0ZVBpbnMobGlzdCwgY29udGVzdHMpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlcG9zaXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMucmVwb3NpdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0YXJ0dXBQZW5kaW5nKSB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmdldFRhcmdldChjb250ZXN0cyk7XG4gICAgICAgICAgICBpZiAodGFyZ2V0KSB0aGlzLm9wZW5Db250ZXN0KGxpc3QsIHJpZ2h0LCB0YXJnZXQpO1xuICAgICAgICAgICAgZWxzZSBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyAmJiAhdGhpcy5wcmVmZXJlbmNlKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgY29uc3QgcGluID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICB0aGlzLnByZWZlcmVuY2UgPSAoKHR5cGVvZiBwaW4gPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBwaW4gPT09ICdudW1iZXInKSAmJiBwaW4pID8gU3RyaW5nKHBpbikgOiAnJztcbiAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuZGVmYXVsdHMgPSByZWFkQ29udGVzdERlZmF1bHRzKCk7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICBjb25zdCB7IHNpZ25hbCB9ID0gdGhpcy5saXN0ZW5lcnM7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihtdXRhdGlvbnMgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZXN0cyAubGVmdF9wYXJ0IC5zY3JvbGxfYXJlYScpO1xuICAgICAgICAgICAgY29uc3QgcmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY29udGVzdHMgLnJpZ2h0X3BhcnQnKTtcbiAgICAgICAgICAgIGlmIChsaXN0ICE9PSB0aGlzLmxpc3QgfHwgcmlnaHQgIT09IHRoaXMucmlnaHQgfHwgbXV0YXRpb25zLnNvbWUoKHsgdGFyZ2V0IH0pID0+XG4gICAgICAgICAgICAgICAgKGxpc3QgJiYgKGxpc3QuY29udGFpbnModGFyZ2V0KSB8fCB0YXJnZXQuY29udGFpbnMobGlzdCkpKSB8fFxuICAgICAgICAgICAgICAgIChyaWdodCAmJiAocmlnaHQuY29udGFpbnModGFyZ2V0KSB8fCB0YXJnZXQuY29udGFpbnMocmlnaHQpKSkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFsnY2xhc3MnLCAnc3R5bGUnLCAnaGlkZGVuJywgJ2lkX2NvbnRlc3QnXSB9KTtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4gdGhpcy5yZWZyZXNoKCksIHsgb25jZTogdHJ1ZSwgc2lnbmFsIH0pO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmlzVHJ1c3RlZCAmJiBldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ICYmIHRoaXMucmlnaHQgJiYgdGhpcy5saXN0Py5jb250YWlucyhldmVudC50YXJnZXQpICYmXG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5jb250ZXN0X2hlYWRlcicpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHRoaXMucmlnaHQsIG51bGwpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB7IGNhcHR1cmU6IHRydWUsIHNpZ25hbCB9KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cblxuICAgIHRlYXJEb3duKCkge1xuICAgICAgICB0aGlzLm9ic2VydmVyPy5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzPy5hYm9ydCgpO1xuICAgICAgICB0aGlzLnN0b3BKdW1wPy4oKTtcbiAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxpc3Q/LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1waW4sIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JykuZm9yRWFjaChjb250cm9sID0+IGNvbnRyb2wucmVtb3ZlKCkpO1xuICAgICAgICBpZiAodGhpcy5yaWdodCkgdGhpcy5zaG93TGVhZGVyYm9hcmQodGhpcy5yaWdodCwgbnVsbCk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLmhhc1J1biA9IGZhbHNlO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBMZWFndWVUb3AyMCBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdsZWFndWVUb3AyMCdcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQcm9tb3Rpb24gdGFyZ2V0XCIsIFwiU2hvdyB0aGUgcG9pbnRzIG5lZWRlZCB0byByZWFjaCB0aGUgbGFyZ2VyIG9mIHRoZSB0b3AgMjAgb3IgdG9wIDE1JSBiZWxvdyB0aGUgaGlnaGVzdCBsZWFndWUgdGllci5cIilcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWVzLmh0bWwnKTtcbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcuc2NyaXB0TGVhZ3VlSW5mbycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2NyaXB0TGVhZ3VlSW5mbycpO1xuICAgICAgICAgICAgaWYgKCFzdW1tYXJ5IHx8IHN1bW1hcnkucXVlcnlTZWxlY3RvcignLmphcnZpc1RvcDIwJykpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgeyBvcHBvbmVudHNfbGlzdCwgY3VycmVudF90aWVyX251bWJlciwgbWF4X2xlYWd1ZSB9ID0gd2luZG93O1xuICAgICAgICAgICAgY29uc3QgdGllciA9IE51bWJlcihjdXJyZW50X3RpZXJfbnVtYmVyKTtcbiAgICAgICAgICAgIGlmICghKHRpZXIgPiAwICYmIHRpZXIgPCBOdW1iZXIobWF4X2xlYWd1ZSkpKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBoZXJvSWQgPSAod2luZG93LnNoYXJlZD8uSGVybyB8fCB3aW5kb3cuSGVybyk/LmluZm9zPy5pZDtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShvcHBvbmVudHNfbGlzdCkgfHwgaGVyb0lkID09IG51bGwpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgcGxheWVyID0gb3Bwb25lbnRzX2xpc3QuZmluZCgoeyBwbGF5ZXIgfSkgPT4gU3RyaW5nKHBsYXllcj8uaWRfZmlnaHRlcikgPT09IFN0cmluZyhoZXJvSWQpKTtcbiAgICAgICAgICAgIGNvbnN0IHJhbmsgPSBOdW1iZXIocGxheWVyPy5wbGFjZSk7XG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc0ludGVnZXIocmFuaykgfHwgcmFuayA8IDEpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgYnJhY2tldFNpemUgPSBvcHBvbmVudHNfbGlzdC5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBwcm9tb3Rpb25SYW5rID0gTWF0aC5tYXgoMjAsIE1hdGguY2VpbChicmFja2V0U2l6ZSAqIDE1IC8gMTAwKSk7XG4gICAgICAgICAgICBjb25zdCBpblByb21vdGlvbiA9IHJhbmsgPD0gcHJvbW90aW9uUmFuaztcbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmlzb25SYW5rID0gaW5Qcm9tb3Rpb24gPyBwcm9tb3Rpb25SYW5rICsgMSA6IHByb21vdGlvblJhbms7XG4gICAgICAgICAgICBjb25zdCBjdXRvZmYgPSBvcHBvbmVudHNfbGlzdC5maW5kKCh7IHBsYWNlIH0pID0+IE51bWJlcihwbGFjZSkgPT09IGNvbXBhcmlzb25SYW5rKTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXI/LnBsYXllcl9sZWFndWVfcG9pbnRzID09IG51bGwgfHwgY3V0b2ZmPy5wbGF5ZXJfbGVhZ3VlX3BvaW50cyA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHNjb3JlID0gTnVtYmVyKHBsYXllci5wbGF5ZXJfbGVhZ3VlX3BvaW50cyk7XG4gICAgICAgICAgICBjb25zdCBjdXRvZmZTY29yZSA9IE51bWJlcihjdXRvZmYucGxheWVyX2xlYWd1ZV9wb2ludHMpO1xuICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoc2NvcmUpIHx8ICFOdW1iZXIuaXNGaW5pdGUoY3V0b2ZmU2NvcmUpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGZvcm1hdCA9IG5ldyBJbnRsLk51bWJlckZvcm1hdCgpO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gaW5Qcm9tb3Rpb24gPyBjdXRvZmZTY29yZSA6IGN1dG9mZlNjb3JlICsgMTtcbiAgICAgICAgICAgIGNvbnN0IGRpZmZlcmVuY2UgPSBpblByb21vdGlvbiA/IHNjb3JlIC0gdGFyZ2V0IDogdGFyZ2V0IC0gc2NvcmU7XG4gICAgICAgICAgICBjb25zdCBydWxlID0gYFRvcCAke3Byb21vdGlvblJhbmt9IGlzIHRoZSBwcm9tb3Rpb24gdGFyZ2V0LiBUaGUgY3V0b2ZmIGlzIHRoZSBsYXJnZXIgb2YgMjAgcGxhY2VzIG9yIDE1JSBvZiAke2Zvcm1hdC5mb3JtYXQoYnJhY2tldFNpemUpfSBwbGF5ZXJzLCByb3VuZGVkIHVwLmA7XG4gICAgICAgICAgICBjb25zdCBjb21wYXJpc29uID0gaW5Qcm9tb3Rpb25cbiAgICAgICAgICAgICAgICA/IGBSYW5rICR7Y29tcGFyaXNvblJhbmt9IGhhcyAke2Zvcm1hdC5mb3JtYXQodGFyZ2V0KX0gcG9pbnRzLiBZb3VyIGxlYWQgaXMgJHtmb3JtYXQuZm9ybWF0KGRpZmZlcmVuY2UpfSBwb2ludHMuYFxuICAgICAgICAgICAgICAgIDogYFlvdSBuZWVkICR7Zm9ybWF0LmZvcm1hdCh0YXJnZXQpfSBwb2ludHMgdG8gcGFzcyByYW5rICR7Y29tcGFyaXNvblJhbmt9LmA7XG4gICAgICAgICAgICBjb25zdCB0b29sdGlwID0gYCR7cnVsZX0gJHtjb21wYXJpc29ufWA7XG5cbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgZW50cnkuY2xhc3NOYW1lID0gJ2phcnZpc1RvcDIwJztcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCB0b29sdGlwKTtcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgndG9vbHRpcCcsICcnKTtcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHRvb2x0aXApO1xuXG4gICAgICAgICAgICBjb25zdCBiYWRnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIGJhZGdlLmNsYXNzTmFtZSA9ICdzY3JpcHRMZWFndWVJbmZvSWNvbic7XG4gICAgICAgICAgICBiYWRnZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIzM3NjliYSc7XG4gICAgICAgICAgICBiYWRnZS5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICAgICAgICAgIGJhZGdlLnRleHRDb250ZW50ID0gU3RyaW5nKHByb21vdGlvblJhbmspO1xuICAgICAgICAgICAgZW50cnkuYXBwZW5kKGJhZGdlLCBgJHtkaWZmZXJlbmNlID09PSAwID8gJycgOiBpblByb21vdGlvbiA/ICctJyA6ICcrJ30ke2Zvcm1hdC5mb3JtYXQoTWF0aC5hYnMoZGlmZmVyZW5jZSkpfWApO1xuICAgICAgICAgICAgc3VtbWFyeS5pbnNlcnRCZWZvcmUoZW50cnksIHN1bW1hcnkucXVlcnlTZWxlY3RvcignLm1pblRvcDMwLCAucHJvbW90aW9uSW5mbycpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBSZW1vdmVQYXNzTG9jayBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNlbGVjdG9yVG9GaW5kID0gJy5sb2NrX3llbGxvd19pY24nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgY2xhc3NUb1JlbW92ZSA9ICdsb2NrX3llbGxvd19pY24nO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAncmVtb3ZlUGFzc0xvY2snXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlBhc3MgbG9jayBpY29uc1wiLCBcIkhpZGUgbG9jayBpY29ucyBvbiByZXdhcmQgcGFzc2VzIHNvIHRoZSByZXdhcmRzIGFyZSBlYXNpZXIgdG8gcmVhZC5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdwb3YnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlBhdGggb2YgVmFsb3JcIiwgXCJIaWRlIGxvY2sgaWNvbnMgb24gdGhlIFBhdGggb2YgVmFsb3IgcGFzc2VzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAncG9nJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQYXRoIG9mIEdsb3J5XCIsIFwiSGlkZSBsb2NrIGljb25zIG9uIHRoZSBQYXRoIG9mIEdsb3J5IHBhc3Nlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLXZhbG9yLmh0bWwnKSB8fCBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtZ2xvcnkuaHRtbCcpXG4gICAgfVxuXG4gICAgb2JzZXJ2ZVVudGlsKHNlbGVjdG9yOiBzdHJpbmcsIGNhbGxiYWNrOiAoZWxlbWVudHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4pID0+IHZvaWQsIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH0gPSB7fSkge1xuICAgICAgICBsZXQgdGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgICAgICBsZXQgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FsbGJhY2soZWxlbWVudHMpO1xuICAgICAgICAgICAgaWYgKG9uY2UpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAob25jZSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lcikgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZWxlbWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuXG4gICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodGltZW91dCkgJiYgdGltZW91dCA+IDApIHtcbiAgICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3Rvcjogc3RyaW5nLCBjbGFzc1RvUmVtb3ZlOiBzdHJpbmcsIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH0gPSB7fSkge1xuICAgICAgICB0aGlzLm9ic2VydmVVbnRpbChzZWxlY3RvciwgKGVsZW1lbnRzKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGVsID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NUb1JlbW92ZSkpO1xuICAgICAgICB9LCB7IHRpbWVvdXQsIG9uY2UgfSk7XG4gICAgfVxuXG4gICAgcnVuKHsgcG92LCBwb2cgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtdmFsb3IuaHRtbCcpICYmIHBvdikge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZSh0aGlzLnNlbGVjdG9yVG9GaW5kLCB0aGlzLmNsYXNzVG9SZW1vdmUpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi1nbG9yeS5odG1sJykgJiYgcG9nKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKHRoaXMuc2VsZWN0b3JUb0ZpbmQsIHRoaXMuY2xhc3NUb1JlbW92ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEdpcmxEaWN0aW9uYXJ5KCkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmdldEdpcmxEaWN0aW9uYXJ5KCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBsb2FkIHRoZSBISCsrIGdpcmwgZGljdGlvbmFyeTonLCBlcnIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGdldEdpcmxEaWN0aW9uYXJ5IH0gZnJvbSAnLi9nYW1lRGF0YSc7XG5cbmV4cG9ydCBjbGFzcyBMb3ZlUmFpZHNBZGRvbiBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJhcml0eUNvbG9yczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xvdmVSYWlkc0FkZG9uJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMb3ZlIFJhaWRzIGRpc3BsYXlcIiwgXCJDdXN0b21pemUgbmFtZXMsIGljb25zLCBhbmQgcG9zZXMgb24gTG92ZSBSYWlkIGNhcmRzLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ3JhaWRfaWQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlJhaWQgSURzXCIsIFwiQWRkIHRoZSByYWlkIElEIGJlZm9yZSBpdHMgbmFtZS5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICduYW1lcycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiSGlkZGVuIGdpcmwgbmFtZXNcIiwgXCJTaG93IHRoZSBuYW1lIG9uIGNhcmRzIHRoYXQgdXNlIGEgbXlzdGVyaW91cyBnaXJsIGxhYmVsLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnc2tpbicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiU2tpbiBpbmRpY2F0b3JcIiwgXCJNYXJrIGNhcmRzIHRoYXQgaW5jbHVkZSBhIGdpcmwgd2l0aCBhIHNraW4uXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdjb2xvcicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUmFyaXR5IGNvbG9yc1wiLCBcIkNvbG9yIHRoZSByYWlkIG5hbWUgYmFzZWQgb24gdGhlIGdpcmzigJlzIHJhcml0eS5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2ZpZ2h0X2ljb24nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkZpZ2h0IGljb25cIiwgXCJVc2UgdGhlIGNsZWFyZXIgZmlnaHQtZW5lcmd5IGljb24uXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdzaGFkb3dzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJVbnNoYWRvd2VkIHBvc2VzXCIsIFwiU2hvdyB0aGUgbm9ybWFsIGFydHdvcmsgaW4gcGxhY2Ugb2Ygc2hhZG93IHBvc2VzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcblxuICAgICAgICB0aGlzLnJhcml0eUNvbG9ycyA9IHtcbiAgICAgICAgICAgIHJhcmU6ICdMaW1lR3JlZW4nLFxuICAgICAgICAgICAgZXBpYzogJ0dvbGQnLFxuICAgICAgICAgICAgbGVnZW5kYXJ5OiAnTWVkaXVtT3JjaGlkJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbG92ZS1yYWlkcy5odG1sJylcbiAgICB9XG5cbiAgICBhc3luYyBydW4oeyByYWlkX2lkLCBza2luLCBuYW1lcywgY29sb3IsIGZpZ2h0X2ljb24sIHNoYWRvd3MgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGNvbnN0IHJhaWRzID0gKHR5cGVvZiBsb3ZlX3JhaWRzICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KGxvdmVfcmFpZHMpKSA/IGxvdmVfcmFpZHMgOiBbXTtcbiAgICAgICAgaWYgKCFyYWlkcy5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG5cbiAgICAgICAgY29uc3QgZ2lybERpY3QgPSBhd2FpdCBnZXRHaXJsRGljdGlvbmFyeSgpO1xuICAgICAgICBjb25zdCByYWlkc0J5SWQgPSBuZXcgTWFwKHJhaWRzLm1hcChyYWlkID0+IFtTdHJpbmcocmFpZC5pZF9yYWlkKSwgcmFpZF0pKTtcblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucmFpZC1jYXJkW2lkX3JhaWRdJykuZm9yRWFjaChyYWlkQ2FyZCA9PiB7XG4gICAgICAgICAgICBjb25zdCByYWlkID0gcmFpZHNCeUlkLmdldChyYWlkQ2FyZC5nZXRBdHRyaWJ1dGUoJ2lkX3JhaWQnKSA/PyAnJyk7XG4gICAgICAgICAgICBpZiAoIXJhaWQgfHwgcmFpZC5pZF9naXJsID09IG51bGwpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgeyBuYW1lLCByYXJpdHksIHNoYXJkcyA9IDAgfSA9IGdpcmxEaWN0Py5nZXQoU3RyaW5nKHJhaWQuaWRfZ2lybCkpIHx8IHt9O1xuICAgICAgICAgICAgY29uc3QgaGFyZW1MaW5rID0gd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5nZXRIcmVmKGAvY2hhcmFjdGVycy8ke3JhaWQuaWRfZ2lybH1gKTtcbiAgICAgICAgICAgIGNvbnN0IHJhaWROYW1lRWxlbSA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3IoJy5yYWlkLW5hbWUgPiBzcGFuID4gc3BhbicpO1xuICAgICAgICAgICAgY29uc3QgbmFtZV9sYWJlbCA9IChuYW1lcyAmJiBuYW1lKSB8fCByYWlkTmFtZUVsZW0/LnRleHRDb250ZW50Py50cmltKCkgfHwgcmFpZC5ldmVudF9uYW1lIHx8IHJhaWQuZ2lybF9kYXRhPy5uYW1lIHx8ICcnO1xuICAgICAgICAgICAgY29uc3QgcmFpZF9pZF9sYWJlbCA9IHJhaWRfaWQgPyBgKCR7cmFpZC5pZF9yYWlkfSlgIDogJyc7XG4gICAgICAgICAgICBjb25zdCBza2luX2xhYmVsID0gKHNraW4gJiYgQXJyYXkuaXNBcnJheShyYWlkPy5naXJsX2RhdGE/LmdyYWRlX3NraW5zKSAmJiByYWlkLmdpcmxfZGF0YS5ncmFkZV9za2lucy5sZW5ndGggPiAwKSA/ICfwn5GZJyA6ICcnO1xuXG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5UGFydHMgPSBbXTtcbiAgICAgICAgICAgIGlmIChyYWlkX2lkKSBkaXNwbGF5UGFydHMucHVzaChyYWlkX2lkX2xhYmVsKTtcbiAgICAgICAgICAgIGRpc3BsYXlQYXJ0cy5wdXNoKG5hbWVfbGFiZWwpO1xuICAgICAgICAgICAgaWYgKHNraW4pIGRpc3BsYXlQYXJ0cy5wdXNoKHNraW5fbGFiZWwpO1xuICAgICAgICAgICAgY29uc3QgZGlzcGxheUxhYmVsID0gZGlzcGxheVBhcnRzLmpvaW4oJyAnKS50cmltKCk7XG5cbiAgICAgICAgICAgIGlmIChyYWlkTmFtZUVsZW0gJiYgZGlzcGxheUxhYmVsKSB7XG4gICAgICAgICAgICAgICAgcmFpZE5hbWVFbGVtLnRleHRDb250ZW50ID0gZGlzcGxheUxhYmVsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBvYmplY3RpdmVzID0gcmFpZENhcmQucXVlcnlTZWxlY3RvckFsbCgnLmNsYXNzaWMtZ2lybCcpO1xuICAgICAgICAgICAgY29uc3QgZ2lybCA9IG9iamVjdGl2ZXNbMF07XG4gICAgICAgICAgICBpZiAoZ2lybCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdpcmxOYW1lRWxlbSA9IGdpcmwucXVlcnlTZWxlY3RvcignLmdpcmwtbmFtZScpO1xuICAgICAgICAgICAgICAgIGlmIChnaXJsTmFtZUVsZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmsgPSBnaXJsTmFtZUVsZW0ucXVlcnlTZWxlY3RvcignYScpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWxpbmspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rLmNsYXNzTmFtZSA9ICdoaC1naXJsLWxpbmsnO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGdpcmxOYW1lRWxlbS5maXJzdENoaWxkKSBsaW5rLmFwcGVuZENoaWxkKGdpcmxOYW1lRWxlbS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdpcmxOYW1lRWxlbS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZGlzcGxheUxhYmVsKSBsaW5rLnRleHRDb250ZW50ID0gZGlzcGxheUxhYmVsO1xuICAgICAgICAgICAgICAgICAgICBsaW5rLmhyZWYgPSBoYXJlbUxpbms7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHNoYXJkcyA9PT0gMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9iakVsZW0gPSBnaXJsLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcub2JqZWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmpFbGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpFbGVtLmlubmVyVGV4dCA9IGBJJ20gYWxyZWFkeSBhdHRyYWN0ZWQgdG8geW91LiBGaW5kIG1lIGluIHlvdXIgSGFyZW0hYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvbG9yICYmIHJhcml0eSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhaWROYW1lQ29udGFpbmVyID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5yYWlkLW5hbWUnKTtcbiAgICAgICAgICAgICAgICBpZiAocmFpZE5hbWVDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFpZE5hbWVDb250YWluZXIuc3R5bGUuY29sb3IgPSB0aGlzLnJhcml0eUNvbG9yc1tyYXJpdHldIHx8ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZpZ2h0X2ljb24pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWdodEljb24gPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmh1ZEJhdHRsZVB0c19taXhfaWNuJyk7XG4gICAgICAgICAgICAgICAgaWYgKGZpZ2h0SWNvbikge1xuICAgICAgICAgICAgICAgICAgICBmaWdodEljb24uc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybCgvaW1hZ2VzL3BpY3R1cmVzL2Rlc2lnbi9pY19lbmVyZ3lfZmlnaHQucG5nKSc7XG4gICAgICAgICAgICAgICAgICAgIGZpZ2h0SWNvbi5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9ICcyNHB4JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzaGFkb3dzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGVmdEltYWdlID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MSW1hZ2VFbGVtZW50PignLmdpcmwtaW1nLmxlZnQnKTtcbiAgICAgICAgICAgICAgICBpZiAobGVmdEltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlZnRJbWFnZS5zcmMgPSBsZWZ0SW1hZ2Uuc3JjLnJlcGxhY2UoJy1ibGFjaycsICcnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJhaWRDYXJkLmNsYXNzTGlzdC5jb250YWlucygnbXVsdGlwbGUtZ2lybCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0SW1hZ2UgPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxJbWFnZUVsZW1lbnQ+KCcuZ2lybC1pbWcucmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJpZ2h0SW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJpZ2h0SW1hZ2Uuc3JjID0gcmlnaHRJbWFnZS5zcmMucmVwbGFjZSgnYXZiMC5wbmcnLCAnZ3JhZGVfc2tpbnMvZ3JhZGVfc2tpbjEucG5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodEltYWdlLnNyYyA9IHJpZ2h0SW1hZ2Uuc3JjLnJlcGxhY2UoJy1ibGFjaycsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yQWxsKCcuZXllJykuZm9yRWFjaChlID0+IGUucmVtb3ZlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHR5cGUgeyBHaXJsRGF0YSwgTG92ZVJhaWQgfSBmcm9tICcuLi8uLi9nYW1lLXR5cGVzJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCwgbHNSbSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgZ2V0R2lybERpY3Rpb25hcnkgfSBmcm9tICcuL2dhbWVEYXRhJztcblxudHlwZSBSYWlkQ29weUJ1dHRvbiA9IEhUTUxEaXZFbGVtZW50ICYgeyBfYm91bmRDb3B5S2V5SGFuZGxlcj86IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gdm9pZCB9O1xuXG5leHBvcnQgY2xhc3MgTG92ZVJhaWRzUGFyc2VyIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgZ2lybERpY3Q6IFJlYWRvbmx5TWFwPHN0cmluZywgR2lybERhdGE+IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBfYm91bmRJbnNlcnRCdXR0b24/OiAoKSA9PiB2b2lkO1xuXG4gICAgLypcbiAgICAqIFJhaWQgSUQsIEFubm91bmNlbWVudCBUeXBlLCBCYWNrZ3JvdW5kIElELCBFdmVudCBOYW1lLCBTdGFydCBEYXRldGltZSxcbiAgICAqIEVuZCBEYXRldGltZSwgRHVyYXRpb24sIFJhaWQgU3RhdHVzLCBTb3VyY2UsIEdpcmwgSUQsXG4gICAgKiBHaXJsIE5hbWUsIFJhcml0eSwgTWF4IEdyYWRlLCBGaXJzdCBBcHBlYXJhbmNlLCBTb3VyY2UgSUQsXG4gICAgKiBIYXMgU2tpbihzKVxuICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnbG92ZVJhaWRzUGFyc2VyJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMb3ZlIFJhaWRzIGV4cG9ydFwiLCBcIkFkZCBhIGJ1dHRvbiB0byBjb3B5IG5ldyByYWlkcyBpbiBhIHNwcmVhZHNoZWV0LXJlYWR5IGZvcm1hdC5cIilcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sb3ZlLXJhaWRzLmh0bWwnKVxuICAgIH1cblxuICAgIGNhcGl0YWxpemVGaXJzdChzdHI6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyID8gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpIDogc3RyO1xuICAgIH1cblxuICAgIGdldEFubm91bmNlbWVudFR5cGUodHlwZTogTG92ZVJhaWRbJ2lkX2Fubm91bmNlbWVudF90eXBlJ10pIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiBcIkZ1bGxcIjtcbiAgICAgICAgICAgIGNhc2UgMjogcmV0dXJuIFwiUGFydGlhbFwiO1xuICAgICAgICAgICAgY2FzZSAzOiByZXR1cm4gXCJOb25lXCI7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gXCJVbmtub3duXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTb3VyY2VJRChldmVudDogTG92ZVJhaWQpIHtcbiAgICAgICAgY29uc3Qgc291cmNlX2lkID0gTnVtYmVyKGV2ZW50LnJhaWRfbW9kdWxlX3BrKTtcbiAgICAgICAgc3dpdGNoIChldmVudC5yYWlkX21vZHVsZV90eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzZWFzb24nOiByZXR1cm4gMDtcbiAgICAgICAgICAgIGNhc2UgJ2NoYW1waW9uJzogcmV0dXJuIE51bWJlci5pc0Zpbml0ZShzb3VyY2VfaWQpID8gc291cmNlX2lkIDogLTI7XG4gICAgICAgICAgICBjYXNlICd0cm9sbCc6IHJldHVybiBOdW1iZXIuaXNGaW5pdGUoc291cmNlX2lkKSA/IHNvdXJjZV9pZCArIDEwIDogLTI7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnaXJsSGFzU2tpbnMoZXZlbnQ6IExvdmVSYWlkKSB7XG4gICAgICAgIGNvbnN0IGhhc1NraW5zID0gQXJyYXkuaXNBcnJheShldmVudD8uZ2lybF9kYXRhPy5ncmFkZV9za2lucykgJiYgZXZlbnQuZ2lybF9kYXRhLmdyYWRlX3NraW5zLmxlbmd0aCA+IDA7XG4gICAgICAgIGlmIChoYXNTa2lucykge1xuICAgICAgICAgICAgcmV0dXJuIFwiWFwiO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIFwiT1wiO1xuICAgIH1cblxuICAgIGZvcm1hdEV2ZW50Um93KGV2ZW50OiBMb3ZlUmFpZCkge1xuICAgICAgICBjb25zdCBkdXJhdGlvbkhvdXJzID0gTWF0aC5mbG9vcihOdW1iZXIoZXZlbnQuZXZlbnRfZHVyYXRpb25fc2Vjb25kcykgLyAzNjAwKTtcbiAgICAgICAgY29uc3QgZHVyYXRpb24gPSBgJHtkdXJhdGlvbkhvdXJzfSBob3Vyc2A7XG5cbiAgICAgICAgY29uc3QgZ2lybCA9IHRoaXMuZ2lybERpY3Q/LmdldChTdHJpbmcoZXZlbnQuaWRfZ2lybCkpIHx8IHt9O1xuICAgICAgICBjb25zdCB7IG5hbWUgPSAnVW5rbm93bicsIHJhcml0eSA9ICdOL0EnLCBncmFkZSA9IDAgfSA9IGdpcmw7XG5cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGV2ZW50LmlkX3JhaWQsXG4gICAgICAgICAgICB0aGlzLmdldEFubm91bmNlbWVudFR5cGUoZXZlbnQuaWRfYW5ub3VuY2VtZW50X3R5cGUpLFxuICAgICAgICAgICAgZXZlbnQuYmFja2dyb3VuZF9pZCxcbiAgICAgICAgICAgIGV2ZW50LmV2ZW50X25hbWUsXG4gICAgICAgICAgICBldmVudC5zdGFydF9kYXRldGltZSxcbiAgICAgICAgICAgIGV2ZW50LmVuZF9kYXRldGltZSxcbiAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgZXZlbnQuc3RhdHVzLFxuICAgICAgICAgICAgZXZlbnQucmFpZF9tb2R1bGVfdHlwZSxcbiAgICAgICAgICAgIGV2ZW50LmlkX2dpcmwsXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgdGhpcy5jYXBpdGFsaXplRmlyc3QocmFyaXR5KSxcbiAgICAgICAgICAgIGdyYWRlLFxuICAgICAgICAgICAgXCJcIiwgLy8gb25lIGJsYW5rIHRhYiByZXNlcnZlZCBmb3IgZmlyc3QgYXBwZWFyYW5jZSBpbiBHU2hlZXRzXG4gICAgICAgICAgICB0aGlzLmdldFNvdXJjZUlEKGV2ZW50KSxcbiAgICAgICAgICAgIHRoaXMuZ2lybEhhc1NraW5zKGV2ZW50KVxuICAgICAgICBdLmpvaW4oXCJcXHRcIik7XG4gICAgfVxuXG4gICAgYXN5bmMgY29weVRvQ2xpcGJvYXJkKHRleHQ6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NsaXBib2FyZCBBUEkgZmFpbGVkLCB1c2luZyBleGVjQ29tbWFuZCBmYWxsYmFjazonLCBlcnIpO1xuICAgICAgICAgICAgY29uc3QgdGV4dGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xuICAgICAgICAgICAgdGV4dGFyZWEudmFsdWUgPSB0ZXh0O1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG4gICAgICAgICAgICB0ZXh0YXJlYS5zZWxlY3QoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRleHRhcmVhLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgaGFuZGxlQ29weUNsaWNrKGV2dDogTW91c2VFdmVudCkge1xuICAgICAgICBjb25zdCBzdG9yYWdlS2V5ID0gJ0xhc3RTYXZlZFJhaWRJRCc7XG5cbiAgICAgICAgLy8gU2hpZnQgKyBDdHJsICsgQ2xpY2sg4oaSIGNsZWFyIHN0b3JlZCBJRFxuICAgICAgICBpZiAoZXZ0LnNoaWZ0S2V5ICYmIGV2dC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBjb25zdCBjb25maXJtQ2xlYXIgPSBjb25maXJtKCfimqDvuI8gRG8geW91IHdhbnQgdG8gY2xlYXIgdGhlIHNhdmVkIGxhc3QgcmFpZCBJRCBmb3IgdGhpcyBzaXRlPycpO1xuICAgICAgICAgICAgaWYgKGNvbmZpcm1DbGVhcikge1xuICAgICAgICAgICAgICAgIGxzUm0oc3RvcmFnZUtleSk7XG4gICAgICAgICAgICAgICAgYWxlcnQoJ+KchSBMYXN0IHNhdmVkIElEIGNsZWFyZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb2FkIHJhaWRzXG4gICAgICAgIGNvbnN0IGxvY2FsTG92ZVJhaWRzID0gKHR5cGVvZiBsb3ZlX3JhaWRzICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KGxvdmVfcmFpZHMpKSA/IGxvdmVfcmFpZHMgOiBbXTtcbiAgICAgICAgaWYgKCFsb2NhbExvdmVSYWlkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfimqDvuI8gTm8gbG92ZV9yYWlkcyBmb3VuZCBvbiB0aGlzIHBhZ2UuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZ2lybERpY3QpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfimqDvuI8gVGhlIEhIKysgZ2lybCBkaWN0aW9uYXJ5IGNvdWxkIG5vdCBiZSBsb2FkZWQuIFJlbG9hZCB0aGUgcGFnZSBhbmQgdHJ5IGFnYWluLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxhc3RTYXZlZElkTnVtYmVyID0gcGFyc2VJbnQoU3RyaW5nKGxzR2V0KHN0b3JhZ2VLZXkpKSwgMTApO1xuXG4gICAgICAgIC8vIElmIFNoaWZ0IGlzIGhlbGQgT1Igbm8gc2F2ZWQgSUQgZXhpc3RzIOKGkiBhc2sgYWdhaW5cbiAgICAgICAgaWYgKGlzTmFOKGxhc3RTYXZlZElkTnVtYmVyKSB8fCBldnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RTYXZlZElkID0gcHJvbXB0KCdQbGVhc2UgZW50ZXIgdGhlIGxhc3Qgc2F2ZWQgSUQ6Jyk7XG4gICAgICAgICAgICBsYXN0U2F2ZWRJZE51bWJlciA9IHBhcnNlSW50KFN0cmluZyhsYXN0U2F2ZWRJZCksIDEwKTtcblxuICAgICAgICAgICAgaWYgKGlzTmFOKGxhc3RTYXZlZElkTnVtYmVyKSkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCfinYwgSW52YWxpZCBJRCBlbnRlcmVkLiBQbGVhc2UgZW50ZXIgYSB2YWxpZCBudW1iZXIuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlsdGVyIG5ldyBldmVudHNcbiAgICAgICAgY29uc3QgZmlsdGVyZWREYXRhID0gbG9jYWxMb3ZlUmFpZHMuZmlsdGVyKGV2ZW50ID0+IE51bWJlcihldmVudC5pZF9yYWlkKSA+IGxhc3RTYXZlZElkTnVtYmVyKTtcbiAgICAgICAgaWYgKCFmaWx0ZXJlZERhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbGVydChg4oS577iPIE5vIG5ldyBldmVudHMgZm91bmQgd2l0aCBJRCBncmVhdGVyIHRoYW4gJHtsYXN0U2F2ZWRJZE51bWJlcn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZERhdGEgPSBmaWx0ZXJlZERhdGEubWFwKHRoaXMuZm9ybWF0RXZlbnRSb3cuYmluZCh0aGlzKSkuam9pbihcIlxcblwiKTtcblxuICAgICAgICBpZiAoIWF3YWl0IHRoaXMuY29weVRvQ2xpcGJvYXJkKGZvcm1hdHRlZERhdGEpKSB7XG4gICAgICAgICAgICBhbGVydCgn4p2MIENvdWxkIG5vdCBjb3B5IHRoZSByYWlkcy4gVGhlIGxhc3Qgc2F2ZWQgSUQgd2FzIGtlcHQuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTYXZlIGhpZ2hlc3QgSURcbiAgICAgICAgY29uc3QgbWF4SWQgPSBNYXRoLm1heCguLi5maWx0ZXJlZERhdGEubWFwKGUgPT4gTnVtYmVyKGUuaWRfcmFpZCkpKTtcbiAgICAgICAgbHNTZXQoc3RvcmFnZUtleSwgbWF4SWQpO1xuXG4gICAgICAgIGFsZXJ0KCfinIUgRGF0YSBjb3BpZWQgdG8gY2xpcGJvYXJkISBZb3UgY2FuIG5vdyBwYXN0ZSBpdCBpbnRvIEdTaGVldHMuJyk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ29weUJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uOiBSYWlkQ29weUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgncmVtaW5kZXItY29weScpO1xuICAgICAgICBidXR0b24uc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxODBkZWcsICMwMGFhZmYgMCwgIzAwNjY4OCA1MCUsICMwMDU1NzcgNTElLCAjMDBhYWZmIDEwMCUpO1xuICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgd2lkdGg6IDMycHg7XG4gICAgICAgICAgICBoZWlnaHQ6IDMycHg7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogMTBweDtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgIHJpZ2h0OiA0LjVyZW07XG4gICAgICAgICAgICB0b3A6IDAuMnJlbTtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMThweDtcbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAzMnB4O1xuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAwLjJzIGVhc2U7XG4gICAgICAgIGA7XG4gICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5OLJztcbiAgICAgICAgbGV0IGJ1dHRvblRpdGxlID0gJ0NsaWNrID0gY29weSBuZXcgcmFpZHMuIFNoaWZ0IC8gU2hpZnQgKyBDdHJsIGF2YWlsYWJsZS4nO1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCd0b29sdGlwJywgJycpO1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcblxuICAgICAgICBjb25zdCBfYm91bmRDb3B5S2V5SGFuZGxlciA9IChlOiBLZXlib2FyZEV2ZW50KSA9PiB0aGlzLnVwZGF0ZUNvcHlCdXR0b24oZSwgYnV0dG9uKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBfYm91bmRDb3B5S2V5SGFuZGxlcik7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIF9ib3VuZENvcHlLZXlIYW5kbGVyKTtcbiAgICAgICAgLy8gc3RvcmUgaGFuZGxlciByZWZlcmVuY2Ugc28gY2FsbGVycyBjYW4gcmVtb3ZlIGxpc3RlbmVycyBpZiBidXR0b24gaXMgcmVtb3ZlZCBsYXRlclxuICAgICAgICBidXR0b24uX2JvdW5kQ29weUtleUhhbmRsZXIgPSBfYm91bmRDb3B5S2V5SGFuZGxlcjtcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoZSkgPT4gdGhpcy5oYW5kbGVDb3B5Q2xpY2soZSk7XG4gICAgICAgIHRoaXMudXBkYXRlQ29weUJ1dHRvbih7IHNoaWZ0S2V5OiBmYWxzZSwgY3RybEtleTogZmFsc2UgfSwgYnV0dG9uKTtcbiAgICAgICAgcmV0dXJuIGJ1dHRvbjtcbiAgICB9XG5cbiAgICB1cGRhdGVDb3B5QnV0dG9uKGU6IFBpY2s8S2V5Ym9hcmRFdmVudCwgJ3NoaWZ0S2V5JyB8ICdjdHJsS2V5Jz4sIGJ1dHRvbjogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgbGV0IGJ1dHRvblRpdGxlID0gJyc7XG4gICAgICAgIGlmIChlLnNoaWZ0S2V5ICYmIGUuY3RybEtleSkge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmZjY2NjYgMCwgI2FhMDAwMCAxMDAlKVwiOyAvLyByZWRcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5eR77iPJztcbiAgICAgICAgICAgIGJ1dHRvblRpdGxlID0gJ1NoaWZ0ICsgQ3RybCArIENsaWNrID0gY2xlYXIgc2F2ZWQgSUQnO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmZmRkNjYgMCwgI2NjOTkwMCAxMDAlKVwiOyAvLyB5ZWxsb3dcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfinI/vuI8nO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnU2hpZnQgKyBDbGljayA9IHByb21wdCBmb3IgSUQuJztcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICMwMGFhZmYgMCwgIzAwNjY4OCA1MCUsICMwMDU1NzcgNTElLCAjMDBhYWZmIDEwMCUpXCI7IC8vIGRlZmF1bHQgYmx1ZVxuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ/Cfk4snO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnQ2xpY2sgPSBjb3B5IG5ldyByYWlkcy4gU2hpZnQgLyBTaGlmdCArIEN0cmwgYXZhaWxhYmxlLic7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluc2VydEJ1dHRvbigpIHtcbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbi1ub3RpZmljYXRpb24tYWN0aW9uLm5vdGlmX2J1dHRvbl9zJyk7XG4gICAgICAgIGlmIChub3RpZmljYXRpb25CdXR0b24gJiYgIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW1pbmRlci1jb3B5JykpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvcHlCdXR0b24gPSB0aGlzLmNyZWF0ZUNvcHlCdXR0b24oKTtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbkJ1dHRvbi5wYXJlbnROb2RlPy5pbnNlcnRCZWZvcmUoY29weUJ1dHRvbiwgbm90aWZpY2F0aW9uQnV0dG9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgICAgICB0aGlzLmdpcmxEaWN0ID0gYXdhaXQgZ2V0R2lybERpY3Rpb25hcnkoKTtcblxuICAgICAgICB0aGlzLl9ib3VuZEluc2VydEJ1dHRvbiA9IHRoaXMuaW5zZXJ0QnV0dG9uLmJpbmQodGhpcyk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB0aGlzLmluc2VydEJ1dHRvbigpO1xuICAgICAgICBlbHNlIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcy5fYm91bmRJbnNlcnRCdXR0b24sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuZXhwb3J0IGNsYXNzIEFjdGl2aXR5UGFyc2VyIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2FjdGl2aXR5UGFyc2VyJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJNaXNzaW9uIGNvcGllclwiLCBcIkVuYWJsZSB0aGUgY29weSB0b29sIGZvciBsZWdlbmRhcnkgbWlzc2lvbiBkZXRhaWxzLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ21pc3Npb25Db3BpZXInLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkxlZ2VuZGFyeSBkZXRhaWxzXCIsIFwiQ2xpY2sgYSBsZWdlbmRhcnkgbWlzc2lvbuKAmXMgdGl0bGUsIGRlc2NyaXB0aW9uLCBvciBpbWFnZSB0byBjb3B5IGl0LlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9hY3Rpdml0aWVzLmh0bWwnKVxuICAgIH1cblxuICAgIGFzeW5jIGNvcHlUb0NsaXBib2FyZCh0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgIGNvbnN0IHRvYXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvYXN0LnRleHRDb250ZW50ID0gJ0NvcGllZCEnO1xuICAgICAgICB0b2FzdC5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmJvdHRvbSA9ICcxMHB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUucmlnaHQgPSAnMTBweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmJhY2tncm91bmQgPSAncmdiYSgwLDAsMCwwLjcpJztcbiAgICAgICAgdG9hc3Quc3R5bGUuY29sb3IgPSAnd2hpdGUnO1xuICAgICAgICB0b2FzdC5zdHlsZS5wYWRkaW5nID0gJzVweCAxMHB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUuYm9yZGVyUmFkaXVzID0gJzVweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnpJbmRleCA9ICc5OTk5JztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0b2FzdCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdG9hc3QucmVtb3ZlKCksIDEwMDApO1xuICAgIH1cblxuICAgIHJ1bih7IG1pc3Npb25Db3BpZXIgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGlmIChtaXNzaW9uQ29waWVyKSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1pc3Npb25fZW50cnkubGVnZW5kYXJ5Jyk7XG4gICAgICAgICAgICBpZiAoIWVudHJpZXMubGVuZ3RoKSByZXR1cm47XG5cbiAgICAgICAgICAgIGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW1nRGl2ID0gZW50cnkucXVlcnlTZWxlY3RvcjxIVE1MSW1hZ2VFbGVtZW50PignLm1pc3Npb25faW1hZ2UgaW1nJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGVBbGwgPSBlbnRyeS5xdWVyeVNlbGVjdG9yPEhUTUxIZWFkaW5nRWxlbWVudD4oJy5taXNzaW9uX2RldGFpbHMgaDEnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkZXNjID0gZW50cnkucXVlcnlTZWxlY3RvcjxIVE1MUGFyYWdyYXBoRWxlbWVudD4oJy5taXNzaW9uX2RldGFpbHMgcCcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGltZ0Rpdikge1xuICAgICAgICAgICAgICAgICAgICBpbWdEaXYuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICBpbWdEaXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZChpbWdEaXYuc3JjKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlQWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlQWxsLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3V0ZXJUaXRsZSA9IHRpdGxlQWxsLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcuZXZlbnQtbWlzc2lvbi1jb250ZW50LXRleHQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dGVyVGl0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyVGl0bGUuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJUaXRsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQoKG91dGVyVGl0bGUudGV4dENvbnRlbnQgPz8gJycpLnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlQWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ICYmIGUudGFyZ2V0LmNsb3Nlc3QoJy5ldmVudC1taXNzaW9uLWNvbnRlbnQtdGV4dCcpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUNsb25lID0gdGl0bGVBbGwuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxIZWFkaW5nRWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlQ2xvbmUucXVlcnlTZWxlY3RvcignLmV2ZW50LW1pc3Npb24tY29udGVudC10ZXh0Jyk/LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSAodGl0bGVDbG9uZS50ZXh0Q29udGVudCA/PyAnJykudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQodGl0bGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICAgICAgICBkZXNjLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgZGVzYy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKGRlc2MuaW5uZXJUZXh0LnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsICJbe1widmVyc2lvblwiOlwiMC43LjJcIixcImNoYW5nZXNcIjpbXCJPcGVuIHRoZSBib3R0b20gYWN0aXZlIGNvbnRlc3QgYXQgeW91ciByYW5rIGJ5IGRlZmF1bHQuIENob29zZSBDYkMsIENDQywgb3IgTEMgdG8gcHJlZmVyIHRoYXQgZXZlbnQgd2hlbiBhdmFpbGFibGUuXCIsXCJUdXJuIG9mZiBhdXRvbWF0aWMgdXBkYXRlIG5vdGljZXMgd2l0aCBEb27igJl0IHNob3cgYWdhaW4gaW4gdGhlIGNoYW5nZWxvZyBwb3B1cC4gVmlldyBjaGFuZ2Vsb2cgc3RheXMgYXZhaWxhYmxlIGluIHNldHRpbmdzLlwiXX0se1widmVyc2lvblwiOlwiMC43LjFcIixcImNoYW5nZXNcIjpbXCJLZWVwIHRoZSBjaGFuZ2Vsb2cgY2VudGVyZWQgd2hlbiB0aGUgZ2FtZSB3aW5kb3cgaXMgcmVzaXplZC5cIixcIkNsZWFuIHVwIHNhdmVkIHBsYXllciBuYW1lcywgZXhwbGFpbiB1bmtub3duIG5hbWVzIG9uIGhvdmVyLCBhbmQgZ2l2ZSBSZW1vdmUgYnV0dG9ucyBtb3JlIHJvb20uXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjcuMFwiLFwiY2hhbmdlc1wiOltcIlNlZSB3aGF0IGNoYW5nZWQgaW4gSmFydmlzIHRoZSBmaXJzdCB0aW1lIGEgbmV3IHZlcnNpb24gcnVucy5cIixcIk9wZW4gVmlldyBjaGFuZ2Vsb2cgZnJvbSBISCsrIHNldHRpbmdzIGF0IGFueSB0aW1lLCBldmVuIHdpdGggYXV0b21hdGljIG5vdGljZXMgdHVybmVkIG9mZi5cIixcIkV4cGFuZCBFYXJsaWVyIHZlcnNpb25zIHRvIHJlYWQgcGFzdCB1cGRhdGVzLlwiXX0se1widmVyc2lvblwiOlwiMC42LjdcIixcImNoYW5nZXNcIjpbXCJNYWtlIG1hcmtpbmcgb25lIGFjdGlvbiBwZXIgcGxheWVyLCBiYWNrZmlsbCBuYW1lcyBmb3Igb2xkZXIgbWFya3MsIHVzZSB0aGUgYnJhY2tldC1iYXNlZCBwcm9tb3Rpb24gdGFyZ2V0LCBhbmQgc2ltcGxpZnkgdGhlIHNlbGVjdGVkIGNvbnRlc3QgYnV0dG9ucyBhbmQgdmVyc2lvbiBiYWRnZS5cIl19LHtcInZlcnNpb25cIjpcIjAuNi42XCIsXCJjaGFuZ2VzXCI6W1wiQWRkIHNldHRpbmcgaGVscCBpbiBISCsrLCBpbXByb3ZlIG1hcmsgY29udHJhc3QgYW5kIG1hbmFnZW1lbnQsIGFuZCBhZGQgYXV0b21hdGljIGNvbnRlc3QgZGVmYXVsdHMuXCIsXCJSZW5hbWUgdGhlIHNlcGFyYXRlbHkgaW5zdGFsbGVkIHRlc3RpbmcgdXNlcnNjcmlwdCB0byBEZXYuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuNVwiLFwiY2hhbmdlc1wiOltcIk1vdmUgdGhlIHVzZXJzY3JpcHQgc291cmNlIGludG8gVHlwZVNjcmlwdCBtb2R1bGVzIGFuZCBhZGQgc2VwYXJhdGUgc3RhYmxlIGFuZCB0ZXN0aW5nIGJ1aWxkcy5cIl19LHtcInZlcnNpb25cIjpcIjAuNi40XCIsXCJjaGFuZ2VzXCI6W1wiUHJldmVudCBwaW5uZWQgY29udGVzdCBzdGFydHVwIHNjcm9sbGluZywga2VlcCBuYXRpdmUgc3RhcnR1cCB3aXRob3V0IGEgcGluLCBhbmQgY2xlYXIgZmluaXNoZWQgcGluc1wiXX0se1widmVyc2lvblwiOlwiMC42LjNcIixcImNoYW5nZXNcIjpbXCJTdG9wIGJvdGggY29udGVzdCBzdGFydHVwIHNjcm9sbHMsIGlzb2xhdGUgdGhlIHNlbGVjdGVkIGxlYWRlcmJvYXJkLCBhbmQgcmVzdG9yZSBwaW5uZWQgY29udGVzdHMgYXQgVG9wIG9yIE15IHJhbmtcIl19LHtcInZlcnNpb25cIjpcIjAuNi4yXCIsXCJjaGFuZ2VzXCI6W1wiUGluIGNvbnRlc3RzIG9uIHRoZWlyIGNhcmRzLCBoaWRlIHRoZSBzdGFydHVwIHNjcm9sbCwgYW5kIHVzZSByaWdodC1jbGljayBtYXJraW5nIHdpdGggaXNvbGF0ZWQgc2V0dGluZ3Mgc2Nyb2xsaW5nXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuMVwiLFwiY2hhbmdlc1wiOltcIlJlYWQgbmF0aXZlIE1hbmdhIFJQRyBjb250ZXN0IHRpdGxlcyBhbmQgcmVjb2duaXplIGFjdGl2ZSBjYXJkcyB3aGVuIGNvbnRlc3QgZGF0YSBpcyB1bmF2YWlsYWJsZVwiXX0se1widmVyc2lvblwiOlwiMC42LjBcIixcImNoYW5nZXNcIjpbXCJBZGQgYSBjb250ZXN0IHN0YXJ0IHByZWZlcmVuY2UsIGNvbnRpbnVvdXMgbWFya2luZywgYW5kIGNvbXBhY3Qgc2V0dGluZ3Mgd2l0aCBhIHZlcnNpb24gbGFiZWxcIl19LHtcInZlcnNpb25cIjpcIjAuNS4wXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIGxlYWd1ZSBhbmQgY29udGVzdCBwbGF5ZXIgbWFya2luZyB3aXRoIGN1c3RvbSBjb2xvcnMsIGNvbXBhY3Qgc2V0dGluZ3MsIGFuZCBsaW1pdCBUb3AgMjAgdG8gcHJvbW90YWJsZSBsZWFndWVzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjQuMlwiLFwiY2hhbmdlc1wiOltcIkZpeCBtb2R1bGUgc3RhcnR1cCwgbGVhZ3VlIGNvbnRyb2xzLCBhbmQgcmFpZCBleHBvcnRzOyBhZGQgdGhlIFRvcCAyMCBsZWFndWUgdGFyZ2V0XCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjQuMVwiLFwiY2hhbmdlc1wiOltcIkZpeCBMb3ZlIFJhaWRzIHNoYWRvd3MgcmVwbGFjZW1lbnRcIl19LHtcInZlcnNpb25cIjpcIjAuNC4wXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIEFjdGl2aXR5UGFyc2VyIG1vZHVsZVwiXX0se1widmVyc2lvblwiOlwiMC4zLjFcIixcImNoYW5nZXNcIjpbXCJBZGQgaGFyZW0gbGluayBpbnNpZGUgbG92ZSByYWlkIGNhcmRzXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjMuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBMb3ZlUmFpZHNBZGRvbiBhbmQgTG92ZVJhaWRzUGFyc2VyIG1vZHVsZXNcIl19LHtcInZlcnNpb25cIjpcIjAuMi4wXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIFJlbW92ZVBhc3NMb2NrIG1vZHVsZVwiXX0se1widmVyc2lvblwiOlwiMC4xLjNcIixcImNoYW5nZXNcIjpbXCJCZXR0ZXIgY29kZSBwcmFjdGljZXNcIl19LHtcInZlcnNpb25cIjpcIjAuMS4yXCIsXCJjaGFuZ2VzXCI6W1wiUG9saXNoaW5nIGFuZCB1cGRhdGUgbGlua3NcIl19LHtcInZlcnNpb25cIjpcIjAuMS4xXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIEZyaWVuZEFuZEZvZXMgbW9kdWxlXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjAuMVwiLFwiY2hhbmdlc1wiOltcIkluaXRpYWwgcmVsZWFzZVwiXX1dIiwgImltcG9ydCB7ICQgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuaW50ZXJmYWNlIENoYW5nZWxvZ1ZpZXcge1xuICAgIGNvbnRlbnQ6IEhUTUxFbGVtZW50O1xuICAgIGNsb3NlQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICBzaG91bGRPcGVuOiAoKSA9PiBib29sZWFuO1xuICAgIG9uT3BlbjogKCkgPT4gdm9pZDtcbiAgICBvbkNsb3NlOiAoKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0NoYW5nZWxvZ1BvcHVwKHZpZXc6IENoYW5nZWxvZ1ZpZXcpIHtcbiAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaWFsb2cnKTtcbiAgICBkaWFsb2cuY2xhc3NOYW1lID0gJ2phcnZpcy1jaGFuZ2Vsb2ctcG9wdXAnO1xuICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsICdqYXJ2aXMtY2hhbmdlbG9nLXRpdGxlJyk7XG4gICAgZGlhbG9nLmFwcGVuZENoaWxkKHZpZXcuY29udGVudCk7XG5cbiAgICBjb25zdCBvcGVuRGlhbG9nID0gKCkgPT4ge1xuICAgICAgICBkaWFsb2cuc2hvd01vZGFsKCk7XG4gICAgICAgIHZpZXcuY2xvc2VCdXR0b24uZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xuICAgICAgICB2aWV3Lm9uT3BlbigpO1xuICAgIH07XG4gICAgY29uc3QgYmluZENsb3NlID0gKGRpc21pc3M6ICgpID0+IHZvaWQpID0+IHtcbiAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7IHNpZ25hbDogaGFuZGxlcnMuc2lnbmFsIH07XG4gICAgICAgIHZpZXcuY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkaXNtaXNzLCBvcHRpb25zKTtcbiAgICAgICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbmNlbCcsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBkaXNtaXNzKCk7XG4gICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ICE9PSBkaWFsb2cpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGJvdW5kcyA9IGRpYWxvZy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGlmIChldmVudC5jbGllbnRYIDwgYm91bmRzLmxlZnQgfHwgZXZlbnQuY2xpZW50WCA+IGJvdW5kcy5yaWdodCB8fFxuICAgICAgICAgICAgICAgIGV2ZW50LmNsaWVudFkgPCBib3VuZHMudG9wIHx8IGV2ZW50LmNsaWVudFkgPiBib3VuZHMuYm90dG9tKSBkaXNtaXNzKCk7XG4gICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gaGFuZGxlcnM7XG4gICAgfTtcblxuICAgIGNvbnN0IHF1ZXVlID0gd2luZG93LnNoYXJlZD8uUG9wdXBRdWV1ZU1hbmFnZXI7XG4gICAgY29uc3QgaG9zdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb21tb24tcG9wdXBzJyk7XG4gICAgaWYgKGhvc3QgJiYgdHlwZW9mIHF1ZXVlPy5hZGQgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHF1ZXVlLmNsb3NlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgd3JhcHBlci5jbGFzc05hbWUgPSAncG9wdXBfd3JhcHBlciBqYXJ2aXMtY2hhbmdlbG9nLW5hdGl2ZSc7XG4gICAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcbiAgICAgICAgbGV0IGFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICBjb25zdCBkaXNtaXNzID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFhY3RpdmUpIHJldHVybjtcbiAgICAgICAgICAgIGFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgcXVldWUuY2xvc2UoeyB0eXBlOiAnY29tbW9uJyB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBiaW5kQ2xvc2UoZGlzbWlzcyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBxdWV1ZS5hZGQoeyBwb3B1cDoge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdjb21tb24nLFxuICAgICAgICAgICAgICAgIHBvcHVwX25hbWU6ICdqYXJ2aXNfY2hhbmdlbG9nJyxcbiAgICAgICAgICAgICAgICBjbG9zZV9vbl9lc2M6IGZhbHNlLCAvLyBUaGUgZGlhbG9nIGhhbmRsZXMgRXNjYXBlLCBzbyB0aGUgcXVldWUgaXMgY2xvc2VkIG9ubHkgb25jZS5cbiAgICAgICAgICAgICAgICAkZG9tX2VsZW1lbnQ6ICQod3JhcHBlciksXG4gICAgICAgICAgICAgICAgaW5pdDogKCkgPT4gaG9zdC5hcHBlbmRDaGlsZCh3cmFwcGVyKSxcbiAgICAgICAgICAgICAgICBvbk9wZW46ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2aWV3LnNob3VsZE9wZW4oKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVNaWNyb3Rhc2soZGlzbWlzcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3cmFwcGVyLmlzQ29ubmVjdGVkKSBob3N0LmFwcGVuZENoaWxkKHdyYXBwZXIpO1xuICAgICAgICAgICAgICAgICAgICBvcGVuRGlhbG9nKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhZGRFdmVudExpc3RlbmVyczogKCkgPT4ge30sXG4gICAgICAgICAgICAgICAgb25DbG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpYWxvZy5vcGVuKSBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlci5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgdmlldy5vbkNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyczogKCkgPT4gaGFuZGxlcnMuYWJvcnQoKSxcbiAgICAgICAgICAgICAgICBkZXN0cm95OiBkaXNtaXNzXG4gICAgICAgICAgICB9IH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGhhbmRsZXJzLmFib3J0KCk7XG4gICAgICAgICAgICBpZiAoZGlhbG9nLm9wZW4pIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICAgICAgd3JhcHBlci5yZW1vdmUoKTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCB1c2UgdGhlIGdhbWUgcG9wdXAgcXVldWU6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdmlldy5zaG91bGRPcGVuKCkpIHtcbiAgICAgICAgdmlldy5vbkNsb3NlKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmluaXNoID0gKCkgPT4ge1xuICAgICAgICBoYW5kbGVycy5hYm9ydCgpO1xuICAgICAgICBkaWFsb2cucmVtb3ZlKCk7XG4gICAgICAgIHZpZXcub25DbG9zZSgpO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlcnMgPSBiaW5kQ2xvc2UoKCkgPT4ge1xuICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgZmluaXNoKCk7XG4gICAgfSk7XG4gICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgZmluaXNoLCB7IHNpZ25hbDogaGFuZGxlcnMuc2lnbmFsIH0pO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcbiAgICBvcGVuRGlhbG9nKCk7XG59XG4iLCAiaW1wb3J0IHJlbGVhc2VOb3RlcyBmcm9tICcuLi8uLi8uLi9DSEFOR0VMT0cubWQnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgbHNHZXQsIGxzU2V0IH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5pbXBvcnQgeyBzaG93Q2hhbmdlbG9nUG9wdXAgfSBmcm9tICcuL2NoYW5nZWxvZ1BvcHVwJztcblxuY29uc3Qgc2VlbktleSA9IGBDaGFuZ2Vsb2dTZWVuJHtVU0VSU0NSSVBUX0NIQU5ORUx9YDtcbmNvbnN0IGxhdGVzdFZlcnNpb24gPSByZWxlYXNlTm90ZXNbMF0udmVyc2lvbjtcbmNvbnN0IGNvbmZpZ0tleSA9ICdKQVJWSVNfY2hhbmdlbG9nJztcbmNvbnN0IHNldHRpbmdzQ2FyZCA9IGAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZ1tyZWw9XCIke2NvbmZpZ0tleX1cIl1gO1xuXG5mdW5jdGlvbiByZWFkU2VlblZlcnNpb24oKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2VlbiA9IGxzR2V0KHNlZW5LZXkpO1xuICAgICAgICByZXR1cm4gdHlwZW9mIHNlZW4gPT09ICdzdHJpbmcnICYmIC9eXFxkK1xcLlxcZCtcXC5cXGQrJC8udGVzdChzZWVuKSA/IHNlZW4gOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzTmV3ZXIodmVyc2lvbjogc3RyaW5nLCBwcmV2aW91czogc3RyaW5nIHwgbnVsbCkge1xuICAgIGlmICghcHJldmlvdXMpIHJldHVybiB0cnVlO1xuXG4gICAgY29uc3Qgb2xkUGFydHMgPSBwcmV2aW91cy5zcGxpdCgnLicpLm1hcChOdW1iZXIpO1xuICAgIGNvbnN0IG5ld1BhcnRzID0gdmVyc2lvbi5zcGxpdCgnLicpLm1hcChOdW1iZXIpO1xuICAgIGZvciAoY29uc3QgW2luZGV4LCBwYXJ0XSBvZiBuZXdQYXJ0cy5lbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKHBhcnQgIT09IG9sZFBhcnRzW2luZGV4XSkgcmV0dXJuIHBhcnQgPiBvbGRQYXJ0c1tpbmRleF07XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gcmVsZWFzZVNlY3Rpb24ocmVsZWFzZTogdHlwZW9mIHJlbGVhc2VOb3Rlc1tudW1iZXJdKSB7XG4gICAgY29uc3Qgc2VjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlY3Rpb24nKTtcbiAgICBjb25zdCBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICBoZWFkaW5nLnRleHRDb250ZW50ID0gYHYke3JlbGVhc2UudmVyc2lvbn1gO1xuICAgIGNvbnN0IGNoYW5nZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIHJlbGVhc2UuY2hhbmdlcykge1xuICAgICAgICBjb25zdCBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgaXRlbS50ZXh0Q29udGVudCA9IGNoYW5nZTtcbiAgICAgICAgY2hhbmdlcy5hcHBlbmRDaGlsZChpdGVtKTtcbiAgICB9XG4gICAgc2VjdGlvbi5hcHBlbmQoaGVhZGluZywgY2hhbmdlcyk7XG4gICAgcmV0dXJuIHNlY3Rpb247XG59XG5cbmV4cG9ydCBjbGFzcyBDaGFuZ2Vsb2cgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBwZW5kaW5nOiAnYXV0b21hdGljJyB8ICdtYW51YWwnIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBvcGVuZXI6IEhUTUxCdXR0b25FbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSB2aWV3ZWRUaGlzUGFnZSA9IGZhbHNlO1xuICAgIHByaXZhdGUgbG9hZExpc3RlbmVyOiBBYm9ydENvbnRyb2xsZXIgfCBudWxsID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2NoYW5nZWxvZyc7XG4gICAgICAgIHN1cGVyKHsgbmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hOiB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKCdVcGRhdGUgbm90aWNlcycsICdTaG93IHRoZSBjaGFuZ2Vsb2cgb25jZSBhZnRlciBhbiB1cGRhdGUuIFVzZSBWaWV3IGNoYW5nZWxvZyB0byBvcGVuIGl0IHdoZW5ldmVyIHlvdSBsaWtlLicpLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICB9IH0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaW5zdGFsbFNldHRpbmdzKCkge1xuICAgICAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2V0dGluZ3NDYXJkLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZXR0aW5nc0NhcmQpO1xuICAgICAgICAgICAgaWYgKCFjYXJkIHx8IGNhcmQucXVlcnlTZWxlY3RvcignLmphcnZpcy12aWV3LWNoYW5nZWxvZycpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uIGphcnZpcy12aWV3LWNoYW5nZWxvZyc7XG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAnVmlldyBjaGFuZ2Vsb2cnO1xuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5vcGVuKCdtYW51YWwnLCBidXR0b24pKTtcbiAgICAgICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4pIHJldHVybjtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IGNoZWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzUnVuICYmICF0aGlzLnZpZXdlZFRoaXNQYWdlICYmIGlzTmV3ZXIobGF0ZXN0VmVyc2lvbiwgcmVhZFNlZW5WZXJzaW9uKCkpKSB0aGlzLm9wZW4oJ2F1dG9tYXRpYycpO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykgY2hlY2soKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRMaXN0ZW5lciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgY2hlY2ssIHsgb25jZTogdHJ1ZSwgc2lnbmFsOiB0aGlzLmxvYWRMaXN0ZW5lci5zaWduYWwgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0ZWFyRG93bigpIHtcbiAgICAgICAgdGhpcy5sb2FkTGlzdGVuZXI/LmFib3J0KCk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkaXNhYmxlTm90aWNlcygpIHtcbiAgICAgICAgY29uc3QgY29uZmlnID0gd2luZG93LmhoUGx1c1BsdXNDb25maWc7XG4gICAgICAgIGlmICghY29uZmlnIHx8ICFjb25maWcuY29uZmlnW2NvbmZpZ0tleV0pIHJldHVybjtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uZmlnLmxvYWRDb25maWcoKTtcbiAgICAgICAgICAgIGNvbmZpZy5jb25maWdbY29uZmlnS2V5XSA9IGZhbHNlO1xuICAgICAgICAgICAgY29uZmlnLnNhdmVDb25maWcoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25maWcuY29uZmlnW2NvbmZpZ0tleV0gPSB0cnVlO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHR1cm4gb2ZmIHVwZGF0ZSBub3RpY2VzOicsIGVycik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBISCsrIGNyZWF0ZXMgaXRzIHNldHRpbmdzIHBhbmUgbGF6aWx5LCBzbyB0aGUgcG9wdXAgY2FuIGNsb3NlIGJlZm9yZSB0aGUgcGFuZSBleGlzdHMuXG4gICAgICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNldHRpbmdzQ2FyZCk7XG4gICAgICAgIGNvbnN0IGNoZWNrYm94ID0gY2FyZD8ucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihgaW5wdXRbbmFtZT1cIiR7Y29uZmlnS2V5fVwiXWApO1xuICAgICAgICBpZiAoY2hlY2tib3gpIGNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgY2FyZD8uY2xhc3NMaXN0LnJlbW92ZSgnZW5hYmxlZCcpO1xuICAgICAgICB0aGlzLnRlYXJEb3duKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvcGVuKG1vZGU6ICdhdXRvbWF0aWMnIHwgJ21hbnVhbCcsIG9wZW5lcjogSFRNTEJ1dHRvbkVsZW1lbnQgfCBudWxsID0gbnVsbCkge1xuICAgICAgICBpZiAobW9kZSA9PT0gJ21hbnVhbCcpIHRoaXMub3BlbmVyID0gb3BlbmVyO1xuICAgICAgICBpZiAodGhpcy5wZW5kaW5nKSB7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gJ21hbnVhbCcpIHRoaXMucGVuZGluZyA9IG1vZGU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wZW5kaW5nID0gbW9kZTtcblxuICAgICAgICBjb25zdCBwcmV2aW91cyA9IHJlYWRTZWVuVmVyc2lvbigpO1xuICAgICAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNvbnRlbnQuY2xhc3NOYW1lID0gJ2NvbnRhaW5lci1zcGVjaWFsLWJnIGphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCc7XG4gICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcbiAgICAgICAgdGl0bGUuaWQgPSAnamFydmlzLWNoYW5nZWxvZy10aXRsZSc7XG4gICAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gJ0phcnZpcyBjaGFuZ2Vsb2cnO1xuICAgICAgICBjb25zdCBub3RlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBub3Rlcy5jbGFzc05hbWUgPSAnamFydmlzLWNoYW5nZWxvZy1ub3Rlcyc7XG4gICAgICAgIGNvbnN0IG5ld1JlbGVhc2VzID0gcHJldmlvdXMgJiYgaXNOZXdlcihsYXRlc3RWZXJzaW9uLCBwcmV2aW91cylcbiAgICAgICAgICAgID8gcmVsZWFzZU5vdGVzLmZpbHRlcihyZWxlYXNlID0+IGlzTmV3ZXIocmVsZWFzZS52ZXJzaW9uLCBwcmV2aW91cykpLmxlbmd0aFxuICAgICAgICAgICAgOiAxO1xuICAgICAgICBub3Rlcy5hcHBlbmQoLi4ucmVsZWFzZU5vdGVzLnNsaWNlKDAsIG5ld1JlbGVhc2VzKS5tYXAocmVsZWFzZVNlY3Rpb24pKTtcbiAgICAgICAgY29uc3QgZWFybGllciA9IHJlbGVhc2VOb3Rlcy5zbGljZShuZXdSZWxlYXNlcyk7XG4gICAgICAgIGlmIChlYXJsaWVyLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgaGlzdG9yeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RldGFpbHMnKTtcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdW1tYXJ5Jyk7XG4gICAgICAgICAgICBzdW1tYXJ5LnRleHRDb250ZW50ID0gJ0VhcmxpZXIgdmVyc2lvbnMnO1xuICAgICAgICAgICAgaGlzdG9yeS5hcHBlbmQoc3VtbWFyeSwgLi4uZWFybGllci5tYXAocmVsZWFzZVNlY3Rpb24pKTtcbiAgICAgICAgICAgIG5vdGVzLmFwcGVuZENoaWxkKGhpc3RvcnkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZm9vdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9vdGVyJyk7XG4gICAgICAgIGNvbnN0IG9wdE91dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgICAgIG9wdE91dC5jbGFzc05hbWUgPSAnamFydmlzLWNoYW5nZWxvZy1vcHQtb3V0JztcbiAgICAgICAgY29uc3QgZG9udFNob3dBZ2FpbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIGRvbnRTaG93QWdhaW4udHlwZSA9ICdjaGVja2JveCc7XG4gICAgICAgIG9wdE91dC5hcHBlbmQoZG9udFNob3dBZ2FpbiwgJ0RvbuKAmXQgc2hvdyBhZ2FpbicpO1xuICAgICAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBjbG9zZUJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGNsb3NlQnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgICAgICBjbG9zZUJ1dHRvbi50ZXh0Q29udGVudCA9ICdDbG9zZSc7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChjbG9zZUJ1dHRvbik7XG4gICAgICAgIGNvbnRlbnQuYXBwZW5kKHRpdGxlLCBub3RlcywgZm9vdGVyKTtcblxuICAgICAgICBzaG93Q2hhbmdlbG9nUG9wdXAoe1xuICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgIGNsb3NlQnV0dG9uLFxuICAgICAgICAgICAgc2hvdWxkT3BlbjogKCkgPT4gdGhpcy5wZW5kaW5nID09PSAnbWFudWFsJyB8fFxuICAgICAgICAgICAgICAgICh0aGlzLmhhc1J1biAmJiAhdGhpcy52aWV3ZWRUaGlzUGFnZSAmJiBpc05ld2VyKGxhdGVzdFZlcnNpb24sIHJlYWRTZWVuVmVyc2lvbigpKSksXG4gICAgICAgICAgICBvbk9wZW46ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdlZFRoaXNQYWdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oYXNSdW4pIGZvb3Rlci5wcmVwZW5kKG9wdE91dCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmV3ZXIobGF0ZXN0VmVyc2lvbiwgcmVhZFNlZW5WZXJzaW9uKCkpKSBsc1NldChzZWVuS2V5LCBsYXRlc3RWZXJzaW9uKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIHZpZXdlZCBjaGFuZ2Vsb2cgdmVyc2lvbjonLCBlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkNsb3NlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZW5kaW5nID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoZG9udFNob3dBZ2Fpbi5jaGVja2VkKSB0aGlzLmRpc2FibGVOb3RpY2VzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuZXI/LmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5lciA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBpbml0R2FtZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBpbmplY3RTdHlsZXMsIHBhY2tTZXR0aW5ncyB9IGZyb20gJy4vc2V0dGluZ3MnO1xuaW1wb3J0IHsgRnJpZW5kQW5kRm9lcyB9IGZyb20gJy4vbW9kdWxlcy9wbGF5ZXJzL0ZyaWVuZEFuZEZvZXMnO1xuaW1wb3J0IHsgYXJtQ29udGVzdFN0YXJ0dXBHdWFyZCwgQ29udGVzdFN0YXJ0IH0gZnJvbSAnLi9tb2R1bGVzL2NvbnRlc3RzL0NvbnRlc3RTdGFydCc7XG5pbXBvcnQgeyBpbnN0YWxsQ29udGVzdFNldHRpbmdzIH0gZnJvbSAnLi9tb2R1bGVzL2NvbnRlc3RzL2NvbnRlc3RQcmVmZXJlbmNlcyc7XG5pbXBvcnQgeyBMZWFndWVUb3AyMCB9IGZyb20gJy4vbW9kdWxlcy9wbGF5ZXJzL0xlYWd1ZVRvcDIwJztcbmltcG9ydCB7IFJlbW92ZVBhc3NMb2NrIH0gZnJvbSAnLi9tb2R1bGVzL3Byb2dyZXNzaW9uL1JlbW92ZVBhc3NMb2NrJztcbmltcG9ydCB7IExvdmVSYWlkc0FkZG9uIH0gZnJvbSAnLi9tb2R1bGVzL2xvdmUtcmFpZHMvTG92ZVJhaWRzQWRkb24nO1xuaW1wb3J0IHsgTG92ZVJhaWRzUGFyc2VyIH0gZnJvbSAnLi9tb2R1bGVzL2xvdmUtcmFpZHMvTG92ZVJhaWRzUGFyc2VyJztcbmltcG9ydCB7IEFjdGl2aXR5UGFyc2VyIH0gZnJvbSAnLi9tb2R1bGVzL2FjdGl2aXRpZXMvQWN0aXZpdHlQYXJzZXInO1xuaW1wb3J0IHsgQ2hhbmdlbG9nIH0gZnJvbSAnLi9tb2R1bGVzL3VwZGF0ZXMvQ2hhbmdlbG9nJztcblxuYXJtQ29udGVzdFN0YXJ0dXBHdWFyZCgpO1xuXG5mdW5jdGlvbiBydW5KYXJ2aXMoKSB7XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcnVuSmFydmlzLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7ICQgfSA9IHdpbmRvdztcblxuICAgIGlmICghJCkge1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBydW5KYXJ2aXMsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1dBUk5JTkc6IE5vIGpRdWVyeSBmb3VuZC4gRW5kaW5nIHNjcmlwdC4nKTtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coJ0hlbGxvLCBTaXIsIEouQS5SLlYuSS5TLiBpcyByZWFkeSB0byBoZWxwIHlvdS4nKTtcblxuICAgIGluaXRHYW1lKCQpO1xuICAgIGluamVjdFN0eWxlcygpO1xuXG4gICAgY29uc3QgZnJpZW5kc0FuZEZvZXMgPSBuZXcgRnJpZW5kQW5kRm9lcygpO1xuICAgIGNvbnN0IGNoYW5nZWxvZyA9IG5ldyBDaGFuZ2Vsb2coKTtcbiAgICBjb25zdCBhbGxNb2R1bGVzID0gW1xuICAgICAgICBmcmllbmRzQW5kRm9lcyxcbiAgICAgICAgbmV3IENvbnRlc3RTdGFydCgpLFxuICAgICAgICBuZXcgTGVhZ3VlVG9wMjAoKSxcbiAgICAgICAgbmV3IFJlbW92ZVBhc3NMb2NrKCksXG4gICAgICAgIG5ldyBMb3ZlUmFpZHNBZGRvbigpLFxuICAgICAgICBuZXcgTG92ZVJhaWRzUGFyc2VyKCksXG4gICAgICAgIG5ldyBBY3Rpdml0eVBhcnNlcigpLFxuICAgICAgICBjaGFuZ2Vsb2dcbiAgICBdXG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29uc3QgcnVuU2NyaXB0ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBoaFBsdXNQbHVzQ29uZmlnIH0gPSB3aW5kb3dcbiAgICAgICAgICAgIGlmICghaGhQbHVzUGx1c0NvbmZpZykgcmV0dXJuO1xuXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJlZ2lzdGVyR3JvdXAoe1xuICAgICAgICAgICAgICAgIGtleTogJ0pBUlZJUycsXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hIIEphcnZpcydcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBhbGxNb2R1bGVzLmZvckVhY2gobW9kdWxlID0+IHtcbiAgICAgICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJlZ2lzdGVyTW9kdWxlKG1vZHVsZSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLmxvYWRDb25maWcoKVxuICAgICAgICAgICAgaGhQbHVzUGx1c0NvbmZpZy5ydW5Nb2R1bGVzKClcbiAgICAgICAgICAgIGZyaWVuZHNBbmRGb2VzLmluc3RhbGxTZXR0aW5ncygpO1xuICAgICAgICAgICAgaW5zdGFsbENvbnRlc3RTZXR0aW5ncygpO1xuICAgICAgICAgICAgY2hhbmdlbG9nLmluc3RhbGxTZXR0aW5ncygpO1xuICAgICAgICAgICAgcGFja1NldHRpbmdzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2luZG93LmhoUGx1c1BsdXNDb25maWcpIHtcbiAgICAgICAgICAgIHJ1blNjcmlwdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbmUoJ2hoKystYmRzbTpsb2FkZWQnLCBydW5TY3JpcHQpXG4gICAgICAgIH1cbiAgICB9LCAxKVxufVxuXG5ydW5KYXJ2aXMoKTtcbiJd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QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7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
