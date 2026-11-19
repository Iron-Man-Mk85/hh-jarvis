// ==UserScript==
// @name           HH J.A.R.V.I.S. (Dev)
// @version        0.7.1
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
    justify-content: end;
}
`;

  // src/settings.ts
  function injectStyles() {
    const style = document.createElement("style");
    style.className = "hh-jarvis-style";
    style.textContent = `${settings_default}
        .hh-plus-plus-config-panel { --jarvis-version: "v${"0.7.1"}"; }
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
  var CONTEST_RANKS = [["top", "Top"], ["mine", "My rank"]];
  function readContestSetting(key) {
    try {
      return lsGet(key);
    } catch {
      return null;
    }
  }
  function readContestDefaults() {
    const kind = readContestSetting("ContestKind") === "event" ? "event" : "daily";
    const rank = readContestSetting("ContestRankStart") === "mine" ? "mine" : "top";
    return { kind, rank };
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
        } catch (err) {
          console.warn("Jarvis could not save the contest default:", err);
        }
      };
      const kinds = makeChoice("Preferred contest", CONTEST_KINDS, (value) => save("ContestKind", value, kinds));
      const ranks = makeRankChoice("Default leaderboard position", (value) => save("ContestRankStart", value, ranks));
      const defaults = readContestDefaults();
      selectContestChoice(kinds, defaults.kind);
      selectContestChoice(ranks, defaults.rank);
      const kindLabel = document.createElement("div");
      kindLabel.innerHTML = settingHelp("Preferred contest", "Daily opens the first active daily contest. Event opens the last active event contest, or the daily contest if there is no event.");
      const rankLabel = document.createElement("div");
      rankLabel.innerHTML = settingHelp("Leaderboard start", "Open at the top or at your rank. A starred contest can have its own position.");
      fieldset.append(kindLabel, kinds, rankLabel, ranks);
      const refreshEnabled = () => fieldset.disabled = !card.classList.contains("enabled");
      refreshEnabled();
      new MutationObserver(refreshEnabled).observe(card, { attributeFilter: ["class"] });
      card.appendChild(fieldset);
    });
  }

  // src/modules/contests/ContestStart.ts
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
        return [{
          id,
          card,
          header,
          title,
          kind: contest?.category_type ? contest.category_type === "daily" ? "daily" : "event" : null,
          label: String(name || contest?.name || contest?.title || (contest?.category_type === "daily" ? "Daily contest" : "Contest")).trim()
        }];
      });
    }
    getTarget(contests) {
      if (this.preference) return contests.find((contest) => contest.id === this.preference);
      if (this.defaults.kind === "event") {
        const event = [...contests].reverse().find((contest) => contest.kind === "event");
        if (event) return event;
      }
      return contests.find((contest) => contest.kind === "daily") ?? contests.find((contest) => contest.kind === null) ?? contests[0];
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
  var CHANGELOG_default = [{ version: "0.7.1", changes: ["Keep the changelog centered when the game window is resized.", "Clean up saved player names, explain unknown names on hover, and give Remove buttons more room."] }, { version: "0.7.0", changes: ["See what changed in Jarvis the first time a new version runs.", "Open View changelog from HH++ settings at any time, even with automatic notices turned off.", "Expand Earlier versions to read past updates."] }, { version: "0.6.7", changes: ["Make marking one action per player, backfill names for older marks, use the bracket-based promotion target, and simplify the selected contest buttons and version badge."] }, { version: "0.6.6", changes: ["Add setting help in HH++, improve mark contrast and management, and add automatic contest defaults.", "Rename the separately installed testing userscript to Dev."] }, { version: "0.6.5", changes: ["Move the userscript source into TypeScript modules and add separate stable and testing builds."] }, { version: "0.6.4", changes: ["Prevent pinned contest startup scrolling, keep native startup without a pin, and clear finished pins"] }, { version: "0.6.3", changes: ["Stop both contest startup scrolls, isolate the selected leaderboard, and restore pinned contests at Top or My rank"] }, { version: "0.6.2", changes: ["Pin contests on their cards, hide the startup scroll, and use right-click marking with isolated settings scrolling"] }, { version: "0.6.1", changes: ["Read native Manga RPG contest titles and recognize active cards when contest data is unavailable"] }, { version: "0.6.0", changes: ["Add a contest start preference, continuous marking, and compact settings with a version label"] }, { version: "0.5.0", changes: ["Add league and contest player marking with custom colors, compact settings, and limit Top 20 to promotable leagues"] }, { version: "0.4.2", changes: ["Fix module startup, league controls, and raid exports; add the Top 20 league target"] }, { version: "0.4.1", changes: ["Fix Love Raids shadows replacement"] }, { version: "0.4.0", changes: ["Add ActivityParser module"] }, { version: "0.3.1", changes: ["Add harem link inside love raid cards"] }, { version: "0.3.0", changes: ["Add LoveRaidsAddon and LoveRaidsParser modules"] }, { version: "0.2.0", changes: ["Add RemovePassLock module"] }, { version: "0.1.3", changes: ["Better code practices"] }, { version: "0.1.2", changes: ["Polishing and update links"] }, { version: "0.1.1", changes: ["Add FriendAndFoes module"] }, { version: "0.0.1", changes: ["Initial release"] }];

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
      const selector = '.group-panel[rel="JARVIS"] .config-setting[rel="JARVIS_changelog"]';
      window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
        const card = document.querySelector(selector);
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
          try {
            if (isNewer(latestVersion, readSeenVersion())) lsSet(seenKey, latestVersion);
          } catch (err) {
            console.warn("Jarvis could not save the viewed changelog version:", err);
          }
        },
        onClose: () => {
          this.pending = null;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzSGVscC50cyIsICJzcmMvc2V0dGluZ3MuY3NzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvSEhNb2R1bGUudHMiLCAic3JjL3N0b3JhZ2UudHMiLCAic3JjL21vZHVsZXMvcGxheWVycy9tYXJrTWFuYWdlci50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0ZyaWVuZEFuZEZvZXMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzLnRzIiwgInNyYy9tb2R1bGVzL2NvbnRlc3RzL0NvbnRlc3RTdGFydC50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0xlYWd1ZVRvcDIwLnRzIiwgInNyYy9tb2R1bGVzL3Byb2dyZXNzaW9uL1JlbW92ZVBhc3NMb2NrLnRzIiwgInNyYy9tb2R1bGVzL2xvdmUtcmFpZHMvZ2FtZURhdGEudHMiLCAic3JjL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNBZGRvbi50cyIsICJzcmMvbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc1BhcnNlci50cyIsICJzcmMvbW9kdWxlcy9hY3Rpdml0aWVzL0FjdGl2aXR5UGFyc2VyLnRzIiwgIkNIQU5HRUxPRy5tZCIsICJzcmMvbW9kdWxlcy91cGRhdGVzL2NoYW5nZWxvZ1BvcHVwLnRzIiwgInNyYy9tb2R1bGVzL3VwZGF0ZXMvQ2hhbmdlbG9nLnRzIiwgInNyYy9pbmRleC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCAkOiBKUXVlcnlTdGF0aWM7XG5leHBvcnQgbGV0IGN1cnJlbnRQYWdlOiBzdHJpbmc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0R2FtZShqUXVlcnk6IEpRdWVyeVN0YXRpYykge1xuICAgICQgPSBqUXVlcnk7XG4gICAgY3VycmVudFBhZ2UgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIHNldHRpbmdIZWxwKGxhYmVsOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgICBjb25zdCBlc2NhcGUgPSAodGV4dDogc3RyaW5nKSA9PiB0ZXh0LnJlcGxhY2VBbGwoJyYnLCAnJmFtcDsnKS5yZXBsYWNlQWxsKCdcIicsICcmcXVvdDsnKVxuICAgICAgICAucmVwbGFjZUFsbCgnPCcsICcmbHQ7JykucmVwbGFjZUFsbCgnPicsICcmZ3Q7Jyk7XG4gICAgcmV0dXJuIGVzY2FwZShsYWJlbCkgKyAnIDxzcGFuIGNsYXNzPVwiaXJvbm1hbi1zZXR0aW5nLWhlbHBcIiByb2xlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgYXJpYS1sYWJlbD1cIkFib3V0ICcgK1xuICAgICAgICBlc2NhcGUobGFiZWwpICsgJ1wiIGRhdGEtc2V0dGluZy1oZWxwPVwiJyArIGVzY2FwZShkZXNjcmlwdGlvbikgKyAnXCI+Pzwvc3Bhbj4nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW91bnRTZXR0aW5nc0hlbHAocGFuZWw6IEhUTUxFbGVtZW50LCB0b29sdGlwSWQ6IHN0cmluZykge1xuICAgIGNvbnN0IHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0b29sdGlwLmlkID0gdG9vbHRpcElkO1xuICAgIHRvb2x0aXAuY2xhc3NOYW1lID0gJ2lyb25tYW4tc2V0dGluZy10b29sdGlwJztcbiAgICB0b29sdGlwLnNldEF0dHJpYnV0ZSgncm9sZScsICd0b29sdGlwJyk7XG4gICAgY29uc3QgcG9wb3ZlciA9IHR5cGVvZiB0b29sdGlwLnNob3dQb3BvdmVyID09PSAnZnVuY3Rpb24nO1xuICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLnNldEF0dHJpYnV0ZSgncG9wb3ZlcicsICdtYW51YWwnKTtcbiAgICBlbHNlIHRvb2x0aXAuaGlkZGVuID0gdHJ1ZTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvb2x0aXApO1xuXG4gICAgbGV0IGFuY2hvcjogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBnZXRIZWxwID0gKHRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsKSA9PlxuICAgICAgICB0YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ID8gdGFyZ2V0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCdbZGF0YS1zZXR0aW5nLWhlbHBdJykgOiBudWxsO1xuICAgIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIWFuY2hvcikgcmV0dXJuO1xuICAgICAgICBhbmNob3IucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jyk7XG4gICAgICAgIGFuY2hvciA9IG51bGw7XG4gICAgICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLmhpZGVQb3BvdmVyKCk7XG4gICAgICAgIGVsc2UgdG9vbHRpcC5oaWRkZW4gPSB0cnVlO1xuICAgIH07XG4gICAgY29uc3Qgc2hvdyA9IChoZWxwOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICBpZiAoYW5jaG9yID09PSBoZWxwKSByZXR1cm47XG4gICAgICAgIGNsb3NlKCk7XG4gICAgICAgIGFuY2hvciA9IGhlbHA7XG4gICAgICAgIGhlbHAuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgdG9vbHRpcElkKTtcbiAgICAgICAgdG9vbHRpcC50ZXh0Q29udGVudCA9IGhlbHAuZGF0YXNldC5zZXR0aW5nSGVscCA/PyAnJztcbiAgICAgICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuc2hvd1BvcG92ZXIoKTtcbiAgICAgICAgZWxzZSB0b29sdGlwLmhpZGRlbiA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IGhlbHAuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0V2lkdGgsIG9mZnNldEhlaWdodCB9ID0gdG9vbHRpcDtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoOCwgTWF0aC5taW4oYm91bmRzLmxlZnQsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCAtIG9mZnNldFdpZHRoIC0gOCkpICsgJ3B4JztcbiAgICAgICAgY29uc3QgYmVsb3cgPSBib3VuZHMuYm90dG9tICsgNjtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS50b3AgPSAoYmVsb3cgKyBvZmZzZXRIZWlnaHQgPD0gd2luZG93LmlubmVySGVpZ2h0IC0gOFxuICAgICAgICAgICAgPyBiZWxvdyA6IE1hdGgubWF4KDgsIGJvdW5kcy50b3AgLSBvZmZzZXRIZWlnaHQgLSA2KSkgKyAncHgnO1xuICAgIH07XG5cbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyb3ZlcicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgJiYgZXZlbnQucG9pbnRlclR5cGUgIT09ICd0b3VjaCcpIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm91dCcsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgPT09IGFuY2hvciAmJiBoZWxwICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGhlbHApIGNsb3NlKCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHApIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCBldmVudCA9PiB7XG4gICAgICAgIGlmIChnZXRIZWxwKGV2ZW50LnRhcmdldCkgPT09IGFuY2hvcikgY2xvc2UoKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKCFoZWxwKSByZXR1cm47XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzaG93KGhlbHApO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGhlbHAgPSBnZXRIZWxwKGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGlmIChoZWxwICYmIChldmVudC5rZXkgPT09ICdFbnRlcicgfHwgZXZlbnQua2V5ID09PSAnICcpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBzaG93KGhlbHApO1xuICAgICAgICB9IGVsc2UgaWYgKGFuY2hvciAmJiBldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGdldEhlbHAoZXZlbnQudGFyZ2V0KSAhPT0gYW5jaG9yKSBjbG9zZSgpO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGNsb3NlLCB7IHBhc3NpdmU6IHRydWUgfSk7XG59XG4iLCAiLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAucGFuZWwtY29udGVudHMge1xuICAgIGFsaWduLWNvbnRlbnQ6IHN0YXJ0O1xuICAgIGFsaWduLWl0ZW1zOiBzdGFydDtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIG92ZXJzY3JvbGwtYmVoYXZpb3I6IGNvbnRhaW47XG4gICAgc2Nyb2xsYmFyLXdpZHRoOiB0aGluO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWw6aGFzKD4gLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXS5zaG93bikge1xuICAgIG92ZXJmbG93OiBjbGlwO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmcuaGFzLXN1YnNldHRpbmdzIHtcbiAgICBncmlkLXJvdy1lbmQ6IGF1dG87XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5qYXJ2aXMtcGFja2VkLXNldHRpbmdzIHtcbiAgICBncmlkLWF1dG8tZmxvdzogcm93IGRlbnNlO1xuICAgIGdyaWQtYXV0by1yb3dzOiAxcHg7XG4gICAgcm93LWdhcDogMDtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1wYWNrZWQtc2V0dGluZ3MgLmNvbmZpZy1zZXR0aW5nIHtcbiAgICBncmlkLXJvdy1lbmQ6IHNwYW4gdmFyKC0tamFydmlzLXNldHRpbmctcm93cywgMSk7XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAudGFicyBoNFtyZWw9XCJKQVJWSVNcIl0ge1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC50YWJzIGg0W3JlbD1cIkpBUlZJU1wiXS5zZWxlY3RlZDo6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6IHZhcigtLWphcnZpcy12ZXJzaW9uKTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgaW5zZXQtYmxvY2stc3RhcnQ6IDA7XG4gICAgaW5zZXQtaW5saW5lLWVuZDogLjE1cmVtO1xuICAgIGZvbnQtc2l6ZTogLjYyNXJlbTtcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIHRleHQtdHJhbnNmb3JtOiBub25lO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLmlyb25tYW4tc2V0dGluZy1oZWxwIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtZ3JpZDtcbiAgICBwbGFjZS1pdGVtczogY2VudGVyO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgaW5saW5lLXNpemU6IDEuMjVlbTtcbiAgICBibG9jay1zaXplOiAxLjI1ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICBmb250LXNpemU6IC44ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgdmVydGljYWwtYWxpZ246IC4wOGVtO1xuICAgIGN1cnNvcjogaGVscDtcbn1cbi5pcm9ubWFuLXNldHRpbmctaGVscDpob3Zlcixcbi5pcm9ubWFuLXNldHRpbmctaGVscDpmb2N1cy12aXNpYmxlIHtcbiAgICBvdXRsaW5lOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIG91dGxpbmUtb2Zmc2V0OiAycHg7XG59XG4uaXJvbm1hbi1zZXR0aW5nLXRvb2x0aXAge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICBpbnNldDogYXV0bztcbiAgICB6LWluZGV4OiAxMDAxMDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIG1heC13aWR0aDogbWluKDE4cmVtLCBjYWxjKDEwMHZ3IC0gMTZweCkpO1xuICAgIG1hcmdpbjogMDtcbiAgICBwYWRkaW5nOiAuNWVtIC43ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNGVtO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWNvbmZpZy1zZXR0aW5nLWJhY2tncm91bmQsICMyNDFlMzApO1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGZvbnQ6IDE0cHgvMS40IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1tYXJrLWNvbG9yIGlucHV0IHtcbiAgICB3aWR0aDogMzBweDtcbiAgICBoZWlnaHQ6IDIwcHg7XG4gICAgZmxleDogbm9uZTtcbiAgICBwYWRkaW5nOiAwO1xufVxuYnV0dG9uLmphcnZpcy1jb250ZXN0LXBpbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgbWFyZ2luLWlubGluZS1zdGFydDogLjM1ZW07XG4gICAgcGFkZGluZy1pbmxpbmU6IC4yZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgZm9udC1zaXplOiAuOWVtO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1waW46OmJlZm9yZSB7XG4gICAgY29udGVudDogJ+KYhic7XG59XG4uamFydmlzLWNvbnRlc3QtcGluW2FyaWEtcHJlc3NlZD1cInRydWVcIl06OmJlZm9yZSB7XG4gICAgY29udGVudDogJ+KYhSc7XG4gICAgY29sb3I6ICNmZmQzNmI7XG59XG4uamFydmlzLWNvbnRlc3QtcGluOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICB3aWR0aDogZml0LWNvbnRlbnQ7XG4gICAgZ2FwOiAuMTJlbTtcbiAgICBwYWRkaW5nOiAuMTJlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDU1JSwgdHJhbnNwYXJlbnQpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40NWVtO1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIGxpbmUtaGVpZ2h0OiAxLjE1O1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b24ge1xuICAgIGFsbDogdW5zZXQ7XG4gICAgcGFkZGluZzogLjE4ZW0gLjM4ZW07XG4gICAgYm9yZGVyLXJhZGl1czogLjI2ZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgZm9udDogaW5oZXJpdDtcbiAgICBsaW5lLWhlaWdodDogaW5oZXJpdDtcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uW2FyaWEtcHJlc3NlZD1cInRydWVcIl0ge1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMjIlLCB0cmFuc3BhcmVudCk7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIGJ1dHRvbjpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAxNSUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG59XG4uamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCB7XG4gICAgbWFyZ2luLWlubGluZS1zdGFydDogLjI4ZW07XG4gICAgZm9udC1zaXplOiAuN2VtO1xuICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XG59XG4uamFydmlzLWNvbnRlc3Qtc2V0dGluZ3Mge1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ2FwOiAuM2VtO1xuICAgIG1pbi13aWR0aDogMDtcbiAgICBtYXJnaW46IC40NWVtIDAgMDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGJvcmRlcjogMDtcbiAgICBmb250LXNpemU6IC44NWVtO1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzOmRpc2FibGVkIC5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIG9wYWNpdHk6IC41O1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzOmRpc2FibGVkIGJ1dHRvbiB7XG4gICAgY3Vyc29yOiBkZWZhdWx0O1xufVxuLmphcnZpcy1tYXJrLW1lbnUge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB6LWluZGV4OiAxMDAwMDtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdhcDogMnB4O1xuICAgIHBhZGRpbmc6IDRweDtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjODk5NGE3O1xuICAgIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgICBiYWNrZ3JvdW5kOiAjMjMyOTM2O1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGJveC1zaGFkb3c6IDAgMnB4IDEwcHggIzAwMDg7XG4gICAgZm9udDogMTNweC8xLjM1IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbn1cbi5qYXJ2aXMtbWFyay1tZW51IGJ1dHRvbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBwYWRkaW5nOiA0cHggOXB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLW1hcmstbWVudSBidXR0b246aG92ZXIsXG4uamFydmlzLW1hcmstbWVudSBidXR0b246Zm9jdXMtdmlzaWJsZSB7XG4gICAgYmFja2dyb3VuZDogIzQxNGQ2NDtcbn1cbiNjb250ZXN0cyAubGVmdF9wYXJ0IC5zY3JvbGxfYXJlYS5qYXJ2aXMtY29udGVzdC1pbnN0YW50LFxuI2NvbnRlc3RzIC5yaWdodF9wYXJ0LmphcnZpcy1jb250ZXN0LWluc3RhbnQgLmxlYWRfdGFibGVfdmlldyB7XG4gICAgc2Nyb2xsLWJlaGF2aW9yOiBhdXRvICFpbXBvcnRhbnQ7XG4gICAgb3ZlcmZsb3ctYW5jaG9yOiBub25lICFpbXBvcnRhbnQ7XG59XG4jY29udGVzdHMgLmphcnZpcy1jb250ZXN0LWxvYWRpbmcge1xuICAgIG9wYWNpdHk6IDAgIWltcG9ydGFudDtcbiAgICB0cmFuc2l0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4jY29udGVzdHMgLnJpZ2h0X3BhcnQgLnJhbmtpbmdbaWRfY29udGVzdF0uamFydmlzLWNvbnRlc3Qtb3RoZXIge1xuICAgIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrPVwiZnJpZW5kXCJdIHtcbiAgICBjb2xvcjogdmFyKC0tamFydmlzLWZyaWVuZC1jb2xvcikgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrPVwiZm9lXCJdIHtcbiAgICBjb2xvcjogdmFyKC0tamFydmlzLWZvZS1jb2xvcikgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrXSxcbnRkW2RhdGEtamFydmlzLW1hcmtdID4gYSB7XG4gICAgdGV4dC1zaGFkb3c6IDFweCAwICMxMTE4MjcsIC0xcHggMCAjMTExODI3LCAwIDFweCAjMTExODI3LCAwIC0xcHggIzExMTgyNyAhaW1wb3J0YW50O1xufVxudGRbZGF0YS1qYXJ2aXMtbWFya10gPiBhIHtcbiAgICBjb2xvcjogaW5oZXJpdCAhaW1wb3J0YW50O1xufVxuLmphcnZpcy1zZXR0aW5nLWFjdGlvbiB7XG4gICAgYXBwZWFyYW5jZTogbm9uZTtcbiAgICBwYWRkaW5nOiAuMmVtIC41ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIGJvcmRlci1yYWRpdXM6IC4zNWVtO1xuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIGZvbnQ6IGluaGVyaXQ7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1zZXR0aW5nLWFjdGlvbjpob3Zlcixcbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246Zm9jdXMtdmlzaWJsZSB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAxNiUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246ZGlzYWJsZWQge1xuICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICBvcGFjaXR5OiAuNTtcbn1cbi5qYXJ2aXMtbWFyay1zZXR0aW5nLWFjdGlvbnMsXG4uamFydmlzLW1hcmstYWN0aW9ucyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgZ2FwOiAuNGVtO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXIge1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgd2lkdGg6IG1pbigzNHJlbSwgY2FsYygxMDB2dyAtIDJyZW0pKTtcbiAgICBtYXgtaGVpZ2h0OiBjYWxjKDEwMHZoIC0gMnJlbSk7XG4gICAgcGFkZGluZzogMXJlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC42NXJlbTtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jb25maWctc2V0dGluZy1iYWNrZ3JvdW5kLCAjMjQxZTMwKTtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBmb250OiAxNXB4LzEuMzUgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXI6OmJhY2tkcm9wIHtcbiAgICBiYWNrZ3JvdW5kOiAjMDgwYjEyYWE7XG59XG4uamFydmlzLW1hcmstbWFuYWdlciBoMixcbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIGgzLFxuLmphcnZpcy1tYXJrLW1hbmFnZXIgcCB7XG4gICAgbWFyZ2luOiAwO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIHtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgobWluKDEzcmVtLCAxMDAlKSwgMWZyKSk7XG4gICAgZ2FwOiAuOXJlbTtcbiAgICBtYXgtaGVpZ2h0OiA1MHZoO1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgc2Nyb2xsYmFyLWd1dHRlcjogc3RhYmxlO1xuICAgIHBhZGRpbmctaW5saW5lLWVuZDogLjdyZW07XG4gICAgbWFyZ2luLWJsb2NrOiAuOXJlbTtcbn1cbi5qYXJ2aXMtbWFyay1saXN0cyB1bCB7XG4gICAgbWFyZ2luOiAuM2VtIDAgMDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XG59XG4uamFydmlzLW1hcmstbGlzdHMgbGkge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgZ2FwOiAuNDVlbTtcbiAgICBwYWRkaW5nOiAuMmVtIDA7XG4gICAgb3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XG59XG4uamFydmlzLW1hcmstbGlzdHMgbGkgYnV0dG9uIHtcbiAgICBmbGV4OiBub25lO1xufVxuLmphcnZpcy1tYXJrLWFjdGlvbnMge1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2Vlbjtcbn1cbi5qYXJ2aXMtdmlldy1jaGFuZ2Vsb2cge1xuICAgIG1hcmdpbi10b3A6IC40NWVtO1xufVxuZGlhbG9nLmphcnZpcy1jaGFuZ2Vsb2ctcG9wdXAge1xuICAgIC0tamFydmlzLWNoYW5nZWxvZy1oZWlnaHQ6IG1pbigzMnJlbSwgY2FsYygxMDB2aCAtIDEuMjVyZW0pKTtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICBpbnNldDogMDtcbiAgICB3aWR0aDogbWluKDM3cmVtLCBjYWxjKDEwMCUgLSAxLjI1cmVtKSk7XG4gICAgaGVpZ2h0OiBmaXQtY29udGVudDtcbiAgICBtYXgtaGVpZ2h0OiB2YXIoLS1qYXJ2aXMtY2hhbmdlbG9nLWhlaWdodCk7XG4gICAgbWFyZ2luOiBhdXRvO1xuICAgIHBhZGRpbmc6IDA7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC42cmVtO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWNvbmZpZy1zZXR0aW5nLWJhY2tncm91bmQsICMyNDFlMzApO1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGZvbnQ6IDE1cHgvMS40NSBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7XG4gICAgdGV4dC1hbGlnbjogc3RhcnQ7XG59XG5Ac3VwcG9ydHMgKGhlaWdodDogMTAwZHZoKSB7XG4gICAgZGlhbG9nLmphcnZpcy1jaGFuZ2Vsb2ctcG9wdXAge1xuICAgICAgICAtLWphcnZpcy1jaGFuZ2Vsb2ctaGVpZ2h0OiBtaW4oMzJyZW0sIGNhbGMoMTAwZHZoIC0gMS4yNXJlbSkpO1xuICAgIH1cbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLXBvcHVwOjpiYWNrZHJvcCB7XG4gICAgYmFja2dyb3VuZDogIzA4MGIxMmFhO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCB7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtcm93czogYXV0byBtaW5tYXgoMCwgMWZyKSBhdXRvO1xuICAgIGdhcDogY2xhbXAoLjQ1cmVtLCAydncsIC45cmVtKTtcbiAgICBtYXgtaGVpZ2h0OiBjYWxjKHZhcigtLWphcnZpcy1jaGFuZ2Vsb2ctaGVpZ2h0KSAtIDJweCk7XG4gICAgcGFkZGluZzogY2xhbXAoLjZyZW0sIDN2dywgMXJlbSk7XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGgyLFxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBoMyB7XG4gICAgbWFyZ2luOiAwO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBoMiB7XG4gICAgZm9udC1zaXplOiAxLjNlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgaDMge1xuICAgIGNvbG9yOiB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNkOWM3ZmIpO1xuICAgIGZvbnQtc2l6ZTogMWVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBzZWN0aW9uICsgc2VjdGlvbixcbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgZGV0YWlscyB7XG4gICAgbWFyZ2luLXRvcDogLjc1cmVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90ZXMge1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgb3ZlcnNjcm9sbC1iZWhhdmlvcjogY29udGFpbjtcbiAgICBzY3JvbGxiYXItd2lkdGg6IHRoaW47XG4gICAgb3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RlcyB1bCB7XG4gICAgbWFyZ2luOiAuMmVtIDAgMDtcbiAgICBwYWRkaW5nLWlubGluZS1zdGFydDogMS4yZW07XG4gICAgbGlzdC1zdHlsZTogZGlzYztcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGVzIGxpICsgbGkge1xuICAgIG1hcmdpbi10b3A6IC4yNWVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90ZXMgc3VtbWFyeSB7XG4gICAgbWFyZ2luLWJvdHRvbTogLjRyZW07XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBmb290ZXIge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBlbmQ7XG59XG4iLCAiaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgbW91bnRTZXR0aW5nc0hlbHAgfSBmcm9tICcuL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgY3NzIGZyb20gJy4vc2V0dGluZ3MuY3NzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdFN0eWxlcygpIHtcbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgc3R5bGUuY2xhc3NOYW1lID0gJ2hoLWphcnZpcy1zdHlsZSc7XG4gICAgc3R5bGUudGV4dENvbnRlbnQgPSBgJHtjc3N9XG4gICAgICAgIC5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIHsgLS1qYXJ2aXMtdmVyc2lvbjogXCJ2JHtVU0VSU0NSSVBUX1ZFUlNJT059XCI7IH1cbiAgICBgO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1NldHRpbmdzKCkge1xuICAgIGlmIChjdXJyZW50UGFnZSAhPT0gJy9ob21lLmh0bWwnKSByZXR1cm47XG5cbiAgICBjb25zdCBzZWxlY3RvciA9ICcuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5wYW5lbC1jb250ZW50cyc7XG4gICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKCFwYW5lbCkgcmV0dXJuO1xuICAgICAgICBwYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdoaC1zY3JvbGwnKTtcbiAgICAgICAgbW91bnRTZXR0aW5nc0hlbHAocGFuZWwsICdqYXJ2aXMtc2V0dGluZy10b29sdGlwJyk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5IHx8ICEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkgfHwgIXBhbmVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY29uc3QgdW5pdCA9IGV2ZW50LmRlbHRhTW9kZSA9PT0gMSA/IDE2IDogZXZlbnQuZGVsdGFNb2RlID09PSAyID8gcGFuZWwuY2xpZW50SGVpZ2h0IDogMTtcbiAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gcGFuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0IC8gcGFuZWwub2Zmc2V0SGVpZ2h0IHx8IDE7XG4gICAgICAgICAgICBwYW5lbC5zY3JvbGxUb3AgKz0gZXZlbnQuZGVsdGFZICogdW5pdCAvIHNjYWxlO1xuICAgICAgICB9LCB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IGZhbHNlIH0pO1xuXG4gICAgICAgIGNvbnN0IGNhcmRzID0gcGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5jb25maWctc2V0dGluZycpO1xuICAgICAgICBjb25zdCBwYWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFwYW5lbC5vZmZzZXRXaWR0aCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcbiAgICAgICAgICAgICAgICBjYXJkLnN0eWxlLnNldFByb3BlcnR5KCctLWphcnZpcy1zZXR0aW5nLXJvd3MnLCBTdHJpbmcoY2FyZC5vZmZzZXRIZWlnaHQgKyAxMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFuZWwuY2xhc3NMaXN0LmFkZCgnamFydmlzLXBhY2tlZC1zZXR0aW5ncycpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBncm91cE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIocGFjayk7XG4gICAgICAgIGlmIChwYW5lbC5wYXJlbnRFbGVtZW50KSBncm91cE9ic2VydmVyLm9ic2VydmUocGFuZWwucGFyZW50RWxlbWVudCwgeyBhdHRyaWJ1dGVGaWx0ZXI6IFsnY2xhc3MnXSB9KTtcbiAgICAgICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcihwYWNrKTtcbiAgICAgICAgICAgIGNhcmRzLmZvckVhY2goY2FyZCA9PiBzaXplT2JzZXJ2ZXIub2JzZXJ2ZShjYXJkKSk7XG4gICAgICAgIH1cbiAgICAgICAgcGFjaygpO1xuICAgIH0pO1xufVxuIiwgImV4cG9ydCB0eXBlIE1vZHVsZVNldHRpbmdzID0gUmVjb3JkPHN0cmluZywgYm9vbGVhbj47XG5cbmludGVyZmFjZSBDb25maWdTY2hlbWEge1xuICAgIGJhc2VLZXk6IHN0cmluZztcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIGRlZmF1bHQ6IGJvb2xlYW47XG4gICAgc3ViU2V0dGluZ3M/OiB7IGtleTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyBkZWZhdWx0OiBib29sZWFuIH1bXTtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhITW9kdWxlIHtcbiAgICByZWFkb25seSBncm91cCA9ICdKQVJWSVMnO1xuICAgIHJlYWRvbmx5IGNvbmZpZ1NjaGVtYTogQ29uZmlnU2NoZW1hO1xuICAgIGhhc1J1biA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoeyBjb25maWdTY2hlbWEgfTogeyBuYW1lOiBzdHJpbmc7IGNvbmZpZ1NjaGVtYTogQ29uZmlnU2NoZW1hIH0pIHtcbiAgICAgICAgdGhpcy5jb25maWdTY2hlbWEgPSBjb25maWdTY2hlbWE7XG4gICAgfVxuXG4gICAgYWJzdHJhY3Qgc2hvdWxkUnVuKCk6IGJvb2xlYW47XG4gICAgYWJzdHJhY3QgcnVuKHNldHRpbmdzOiBNb2R1bGVTZXR0aW5ncyk6IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xufVxuIiwgImV4cG9ydCBjb25zdCBMU19DT05GSUdfTkFNRSA9ICdISFN0YXJrJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxzR2V0KGtleTogc3RyaW5nLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpOiB1bmtub3duIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShgJHtsc19uYW1lfSR7a2V5fWApID8/ICdudWxsJylcbn1cbmV4cG9ydCBmdW5jdGlvbiBsc1NldChrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24sIGxzX25hbWUgPSBMU19DT05GSUdfTkFNRSkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgJHtsc19uYW1lfSR7a2V5fWAsIEpTT04uc3RyaW5naWZ5KHZhbHVlKSlcbn1cbmV4cG9ydCBmdW5jdGlvbiBsc1JtKGtleTogc3RyaW5nLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gKVxufVxuIiwgImltcG9ydCB7IExTX0NPTkZJR19OQU1FIH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5cbmV4cG9ydCB0eXBlIE1hcmsgPSAnZnJpZW5kJyB8ICdmb2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNhdmVkTWFyayB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBuYW1lPzogc3RyaW5nO1xuICAgIG1hcms6IE1hcms7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcGVuTWFya01hbmFnZXIocmVhZDogKCkgPT4gU2F2ZWRNYXJrW10sIHJlbW92ZTogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW4sIGNsZWFyOiAoKSA9PiBib29sZWFuKSB7XG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXMtbWFyay1tYW5hZ2VyJykpIHJldHVybjtcblxuICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpYWxvZycpO1xuICAgIGRpYWxvZy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstbWFuYWdlcic7XG4gICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JywgJ2phcnZpcy1tYXJrLW1hbmFnZXItdGl0bGUnKTtcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgdGl0bGUuaWQgPSAnamFydmlzLW1hcmstbWFuYWdlci10aXRsZSc7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSAnRnJpZW5kcyBhbmQgZm9lcyc7XG5cbiAgICBjb25zdCBsaXN0cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxpc3RzLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1saXN0cyc7XG4gICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGFjdGlvbnMuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLWFjdGlvbnMnO1xuICAgIGNvbnN0IGNsZWFyQWxsID0gbWFrZUJ1dHRvbignQ2xlYXIgYWxsIG1hcmtzJywgKCkgPT4ge1xuICAgICAgICBpZiAoY29uZmlybSgnUmVtb3ZlIGFsbCBmcmllbmQgYW5kIGZvZSBtYXJrcyBmb3IgdGhpcyBnYW1lPycpICYmIGNsZWFyKCkpIHtcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgY2xvc2UuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IGNsb3NlID0gbWFrZUJ1dHRvbignQ2xvc2UnLCAoKSA9PiBkaWFsb2cuY2xvc2UoKSk7XG4gICAgYWN0aW9ucy5hcHBlbmQoY2xlYXJBbGwsIGNsb3NlKTtcblxuICAgIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IHJlYWQoKS5zb3J0KChhLCBiKSA9PiBOdW1iZXIoIWEubmFtZSkgLSBOdW1iZXIoIWIubmFtZSkgfHxcbiAgICAgICAgICAgIChhLm5hbWUgfHwgYS5pZCkubG9jYWxlQ29tcGFyZShiLm5hbWUgfHwgYi5pZCwgdW5kZWZpbmVkLCB7IG51bWVyaWM6IHRydWUgfSkpO1xuICAgICAgICBjb25zdCBzZWN0aW9ucyA9IChbJ2ZyaWVuZCcsICdmb2UnXSBhcyBjb25zdCkubWFwKG1hcmsgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlY3Rpb24nKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGVudHJpZXMuZmlsdGVyKGVudHJ5ID0+IGVudHJ5Lm1hcmsgPT09IG1hcmspO1xuICAgICAgICAgICAgaGVhZGluZy50ZXh0Q29udGVudCA9IChtYXJrID09PSAnZnJpZW5kJyA/ICdGcmllbmRzJyA6ICdGb2VzJykgKyBgICgke21hdGNoZXMubGVuZ3RofSlgO1xuICAgICAgICAgICAgc2VjdGlvbi5hcHBlbmRDaGlsZChoZWFkaW5nKTtcblxuICAgICAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW1wdHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgICAgICAgICAgZW1wdHkudGV4dENvbnRlbnQgPSAnTm8gc2F2ZWQgcGxheWVycy4nO1xuICAgICAgICAgICAgICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoZW1wdHkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWN0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBpZCwgbmFtZSB9IG9mIG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBsYXllciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIudGV4dENvbnRlbnQgPSBuYW1lID8gYCR7bmFtZX0gwrcgJHtpZH1gIDogYFBsYXllciAjJHtpZH1gO1xuICAgICAgICAgICAgICAgIGlmICghbmFtZSkgcGxheWVyLnRpdGxlID0gJ05hbWUgbm90IHJlY29yZGVkIHlldCc7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gbWFrZUJ1dHRvbignUmVtb3ZlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IEFycmF5LmZyb20obGlzdHMucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJykpLmluZGV4T2YoYnV0dG9uKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZShpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nID0gbGlzdHMucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAocmVtYWluaW5nW01hdGgubWluKGluZGV4LCByZW1haW5pbmcubGVuZ3RoIC0gMSldIHx8IGNsb3NlKS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGBSZW1vdmUgJHtuYW1lIHx8IGBwbGF5ZXIgJHtpZH1gfSBmcm9tICR7bWFyayA9PT0gJ2ZyaWVuZCcgPyAnZnJpZW5kcycgOiAnZm9lcyd9YCk7XG4gICAgICAgICAgICAgICAgcm93LmFwcGVuZChwbGF5ZXIsIGJ1dHRvbik7XG4gICAgICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChyb3cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VjdGlvbi5hcHBlbmRDaGlsZChsaXN0KTtcbiAgICAgICAgICAgIHJldHVybiBzZWN0aW9uO1xuICAgICAgICB9KTtcbiAgICAgICAgbGlzdHMucmVwbGFjZUNoaWxkcmVuKC4uLnNlY3Rpb25zKTtcbiAgICAgICAgY2xlYXJBbGwuZGlzYWJsZWQgPSBlbnRyaWVzLmxlbmd0aCA9PT0gMDtcbiAgICB9XG5cbiAgICByZW5kZXIoKTtcbiAgICBkaWFsb2cuYXBwZW5kKHRpdGxlLCBsaXN0cywgYWN0aW9ucyk7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgZXZlbnQgPT4ge1xuICAgICAgICBpZiAoIWV2ZW50LmtleSB8fCBbJ1BsYXllck1hcmtzJywgJ1BsYXllck1hcmtOYW1lcycsICdGcmllbmRMaXN0JywgJ0ZvZUxpc3QnXVxuICAgICAgICAgICAgLnNvbWUoa2V5ID0+IGV2ZW50LmtleSA9PT0gTFNfQ09ORklHX05BTUUgKyBrZXkpKSByZW5kZXIoKTtcbiAgICB9LCB7IHNpZ25hbDogbGlzdGVuZXJzLnNpZ25hbCB9KTtcbiAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB7XG4gICAgICAgIGxpc3RlbmVycy5hYm9ydCgpO1xuICAgICAgICBkaWFsb2cucmVtb3ZlKCk7XG4gICAgfSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcbiAgICBkaWFsb2cuc2hvd01vZGFsKCk7XG4gICAgY2xvc2UuZm9jdXMoKTtcbn1cblxuZnVuY3Rpb24gbWFrZUJ1dHRvbihsYWJlbDogc3RyaW5nLCBvbkNsaWNrOiAoKSA9PiB2b2lkKSB7XG4gICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICBidXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgYnV0dG9uLnRleHRDb250ZW50ID0gbGFiZWw7XG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljayk7XG4gICAgcmV0dXJuIGJ1dHRvbjtcbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHR5cGUgeyBDb250ZXN0RGF0YSB9IGZyb20gJy4uLy4uL2dhbWUtdHlwZXMnO1xuaW1wb3J0IHsgTFNfQ09ORklHX05BTUUsIGxzR2V0LCBsc1NldCB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgb3Blbk1hcmtNYW5hZ2VyLCB0eXBlIE1hcmssIHR5cGUgU2F2ZWRNYXJrIH0gZnJvbSAnLi9tYXJrTWFuYWdlcic7XG5cbmNvbnN0IERFRkFVTFRfQ09MT1JTOiBSZWNvcmQ8TWFyaywgc3RyaW5nPiA9IHsgZnJpZW5kOiAnIzQ4YTlmZicsIGZvZTogJyNmZjYxNzMnIH07XG50eXBlIFNhdmVkTmFtZSA9IHN0cmluZyB8IHsgbmFtZTogc3RyaW5nIH07XG5cbmZ1bmN0aW9uIHJlYWRSb3dOYW1lKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgY29uc3QgdGV4dCA9IGVsZW1lbnQudGV4dENvbnRlbnQ/LnRyaW0oKSA/PyAnJztcbiAgICBpZiAoIXRleHQuZW5kc1dpdGgoJysnKSkgcmV0dXJuIHRleHQ7XG4gICAgY29uc3Qgd2l0aG91dFN0YW5kYWxvbmVQbHVzID0gdGV4dC5yZXBsYWNlKC9cXHMrXFwrJC8sICcnKTtcbiAgICBpZiAoIWVsZW1lbnQuY2hpbGRFbGVtZW50Q291bnQpIHJldHVybiB3aXRob3V0U3RhbmRhbG9uZVBsdXM7XG5cbiAgICBjb25zdCBsYWJlbCA9IGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxFbGVtZW50O1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgbGFiZWwucXVlcnlTZWxlY3RvckFsbCgnKicpKSB7XG4gICAgICAgIGlmIChjaGlsZC50ZXh0Q29udGVudD8udHJpbSgpID09PSAnKycpIGNoaWxkLnJlbW92ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbGFiZWwudGV4dENvbnRlbnQ/LnRyaW0oKS5yZXBsYWNlKC9cXHMrXFwrJC8sICcnKSB8fCB3aXRob3V0U3RhbmRhbG9uZVBsdXM7XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlTYXZlZE5hbWUoc2F2ZWQ/OiBTYXZlZE5hbWUpIHtcbiAgICBpZiAodHlwZW9mIHNhdmVkICE9PSAnc3RyaW5nJykgcmV0dXJuIHNhdmVkPy5uYW1lO1xuICAgIC8vIE9sZCBlbnRyaWVzIHN0b3JlZCB0aGUgZnVsbCByb3cgdGV4dCwgaW5jbHVkaW5nIGEgdHJhaWxpbmcgYWRkIGNvbnRyb2wuXG4gICAgcmV0dXJuIHNhdmVkLnRyaW0oKS5yZXBsYWNlKC8oW14rXSlcXCskLywgJyQxJykudHJpbUVuZCgpO1xufVxuXG5leHBvcnQgY2xhc3MgRnJpZW5kQW5kRm9lcyBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIG5hbWVzID0gbmV3IE1hcDxIVE1MRWxlbWVudCwgc3RyaW5nPigpO1xuICAgIHByaXZhdGUgbWFya01lbnU6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByb290OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcm9vdFNlbGVjdG9yID0gJyc7XG4gICAgcHJpdmF0ZSBpbkxlYWd1ZSA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnZnJpZW5kQW5kRm9lcydcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJGcmllbmRzIGFuZCBmb2VzXCIsIFwiUmlnaHQtY2xpY2sgZWFjaCBwbGF5ZXIncyBuYW1lIHRvIGFkZCBvciByZW1vdmUgYSBtYXJrLiBNYW5hZ2Ugc2F2ZWQgbWFya3MgYmVsb3cuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAnbGVhZ3VlJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJJbiBsZWFndWVzXCIsIFwiU2hvdyBtYXJrcyBhbmQgYWxsb3cgbWFya2luZyBpbiBsZWFndWUgdGFibGVzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnY29udGVzdHMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkluIGNvbnRlc3RzXCIsIFwiU2hvdyBtYXJrcyBhbmQgYWxsb3cgbWFya2luZyBvbiBjb250ZXN0IGxlYWRlcmJvYXJkcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7IG5hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYSB9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBbJy9sZWFndWVzLmh0bWwnLCAnL2FjdGl2aXRpZXMuaHRtbCddLmluY2x1ZGVzKGN1cnJlbnRQYWdlKTtcbiAgICB9XG5cbiAgICByZWFkU2V0dGluZyhrZXk6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGxzR2V0KGtleSk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkTWFya3MoKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgICAgICBjb25zdCBzdG9yZWQgPSB0aGlzLnJlYWRTZXR0aW5nKCdQbGF5ZXJNYXJrcycpO1xuICAgICAgICBpZiAoc3RvcmVkICYmIHR5cGVvZiBzdG9yZWQgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHN0b3JlZCkpIHJldHVybiBzdG9yZWQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgICAgICAgY29uc3QgbWFya3M6IFJlY29yZDxzdHJpbmcsIE1hcms+ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgbWFya10gb2YgW1snRnJpZW5kTGlzdCcsICdmcmllbmQnXSwgWydGb2VMaXN0JywgJ2ZvZSddXSBhcyBjb25zdCkge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IHRoaXMucmVhZFNldHRpbmcoa2V5KTtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgaWQgb2YgbGlzdCkge1xuICAgICAgICAgICAgICAgIGlmICgvXlsxLTldXFxkKiQvLnRlc3QoU3RyaW5nKGlkKSkpIG1hcmtzW1N0cmluZyhpZCldID0gbWFyaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFya3M7XG4gICAgfVxuXG4gICAgcmVhZENvbG9ycygpOiBSZWNvcmQ8TWFyaywgc3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IHNhdmVkID0gdGhpcy5yZWFkU2V0dGluZygnUGxheWVyTWFya0NvbG9ycycpIGFzIFBhcnRpYWw8UmVjb3JkPE1hcmssIHVua25vd24+PiB8IG51bGw7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmcmllbmQ6IHR5cGVvZiBzYXZlZD8uZnJpZW5kID09PSAnc3RyaW5nJyAmJiAvXiNbXFxkYS1mXXs2fSQvaS50ZXN0KHNhdmVkLmZyaWVuZCkgPyBzYXZlZC5mcmllbmQgOiBERUZBVUxUX0NPTE9SUy5mcmllbmQsXG4gICAgICAgICAgICBmb2U6IHR5cGVvZiBzYXZlZD8uZm9lID09PSAnc3RyaW5nJyAmJiAvXiNbXFxkYS1mXXs2fSQvaS50ZXN0KHNhdmVkLmZvZSkgPyBzYXZlZC5mb2UgOiBERUZBVUxUX0NPTE9SUy5mb2VcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZWFkU2F2ZWROYW1lcygpOiBSZWNvcmQ8c3RyaW5nLCBTYXZlZE5hbWU+IHtcbiAgICAgICAgY29uc3Qgc2F2ZWQgPSB0aGlzLnJlYWRTZXR0aW5nKCdQbGF5ZXJNYXJrTmFtZXMnKTtcbiAgICAgICAgaWYgKCFzYXZlZCB8fCB0eXBlb2Ygc2F2ZWQgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoc2F2ZWQpKSByZXR1cm4ge307XG4gICAgICAgIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXMoc2F2ZWQpLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyBbc3RyaW5nLCBTYXZlZE5hbWVdID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFssIHZhbHVlXSA9IGVudHJ5O1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgQm9vbGVhbih2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZS5uYW1lID09PSAnc3RyaW5nJyk7XG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICBzYXZlTmFtZXMobmFtZXM6IFJlY29yZDxzdHJpbmcsIFNhdmVkTmFtZT4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxzU2V0KCdQbGF5ZXJNYXJrTmFtZXMnLCBuYW1lcyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHJlbWVtYmVyIG1hcmtlZCBwbGF5ZXIgbmFtZXM6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZU1hcmsoaWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBtYXJrcyA9IHRoaXMucmVhZE1hcmtzKCk7XG4gICAgICAgIGRlbGV0ZSBtYXJrc1tpZF07XG4gICAgICAgIGlmICghdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya3MnLCBtYXJrcykpIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgbmFtZXMgPSB0aGlzLnJlYWRTYXZlZE5hbWVzKCk7XG4gICAgICAgIGlmIChpZCBpbiBuYW1lcykge1xuICAgICAgICAgICAgZGVsZXRlIG5hbWVzW2lkXTtcbiAgICAgICAgICAgIHRoaXMuc2F2ZU5hbWVzKG5hbWVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZWFkU2F2ZWRNYXJrcygpIHtcbiAgICAgICAgY29uc3QgbmFtZXMgPSB0aGlzLnJlYWRTYXZlZE5hbWVzKCk7XG4gICAgICAgIHJldHVybiBPYmplY3QuZW50cmllcyh0aGlzLnJlYWRNYXJrcygpKS5mbGF0TWFwPFNhdmVkTWFyaz4oKFtpZCwgbWFya10pID0+XG4gICAgICAgICAgICAvXlsxLTldXFxkKiQvLnRlc3QoaWQpICYmIChtYXJrID09PSAnZnJpZW5kJyB8fCBtYXJrID09PSAnZm9lJylcbiAgICAgICAgICAgICAgICA/IFt7IGlkLCBuYW1lOiBkaXNwbGF5U2F2ZWROYW1lKG5hbWVzW2lkXSksIG1hcmsgfV1cbiAgICAgICAgICAgICAgICA6IFtdKTtcbiAgICB9XG5cbiAgICBzYXZlU2V0dGluZyhrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxzU2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgYWxlcnQoJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB5b3VyIEZyaWVuZHMgYW5kIEZvZXMgc2V0dGluZ3MuJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbnN0YWxsU2V0dGluZ3MoKSB7XG4gICAgICAgIGlmIChjdXJyZW50UGFnZSAhPT0gJy9ob21lLmh0bWwnKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSAnLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmdbcmVsPVwiSkFSVklTX2ZyaWVuZEFuZEZvZXNcIl0gLnN1Yi1zZXR0aW5ncyc7XG4gICAgICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoIXNldHRpbmdzIHx8IHNldHRpbmdzLnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXMtbWFyay1jb2xvcicpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGlucHV0cyA9IG5ldyBNYXA8TWFyaywgSFRNTElucHV0RWxlbWVudD4oKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW21hcmssIHRleHRdIG9mIFtbJ2ZyaWVuZCcsICdGcmllbmQgbmFtZSBjb2xvciddLCBbJ2ZvZScsICdGb2UgbmFtZSBjb2xvciddXSBhcyBjb25zdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAgICAgICAgICAgICBsYWJlbC5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstY29sb3InO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgICAgICAgICAgaW5wdXQudHlwZSA9ICdjb2xvcic7XG4gICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSB0aGlzLnJlYWRDb2xvcnMoKVttYXJrXTtcbiAgICAgICAgICAgICAgICBpbnB1dHMuc2V0KG1hcmssIGlucHV0KTtcbiAgICAgICAgICAgICAgICBpbnB1dC5kaXNhYmxlZCA9ICFzZXR0aW5ncy5jbG9zZXN0KCcuY29uZmlnLXNldHRpbmcnKT8uY2xhc3NMaXN0LmNvbnRhaW5zKCdlbmFibGVkJyk7XG4gICAgICAgICAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnJlYWRDb2xvcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrQ29sb3JzJywgeyAuLi5jb2xvcnMsIFttYXJrXTogaW5wdXQudmFsdWUgfSkpIGlucHV0LnZhbHVlID0gY29sb3JzW21hcmtdO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGxhYmVsLmFwcGVuZCh0aXRsZSwgaW5wdXQpO1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlc2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICByZXNldC50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICByZXNldC5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uJztcbiAgICAgICAgICAgIHJlc2V0LnRleHRDb250ZW50ID0gJ1Jlc2V0IGNvbG9ycyc7XG4gICAgICAgICAgICByZXNldC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtDb2xvcnMnLCB7fSkpIHJldHVybjtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCBpbnB1dF0gb2YgaW5wdXRzKSBpbnB1dC52YWx1ZSA9IERFRkFVTFRfQ09MT1JTW21hcmtdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBtYW5hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIG1hbmFnZS50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBtYW5hZ2UuY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgICAgICAgICBtYW5hZ2UudGV4dENvbnRlbnQgPSAnTWFuYWdlIG1hcmtzJztcbiAgICAgICAgICAgIG1hbmFnZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IG9wZW5NYXJrTWFuYWdlcihcbiAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLnJlYWRTYXZlZE1hcmtzKCksXG4gICAgICAgICAgICAgICAgaWQgPT4gdGhpcy5yZW1vdmVNYXJrKGlkKSxcbiAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya3MnLCB7fSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlTmFtZXMoe30pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApKTtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGFjdGlvbnMuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLXNldHRpbmctYWN0aW9ucyc7XG4gICAgICAgICAgICBhY3Rpb25zLmFwcGVuZChyZXNldCwgbWFuYWdlKTtcbiAgICAgICAgICAgIHNldHRpbmdzLmFwcGVuZENoaWxkKGFjdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjbG9zZU1hcmtNZW51KCkge1xuICAgICAgICB0aGlzLm1hcmtNZW51Py5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5tYXJrTWVudSA9IG51bGw7XG4gICAgfVxuXG4gICAgb3Blbk1hcmtNZW51KGV2ZW50OiBNb3VzZUV2ZW50LCBuYW1lOiBIVE1MRWxlbWVudCwgaWQ6IHN0cmluZykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG5cbiAgICAgICAgY29uc3QgbWVudSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBtZW51LmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1tZW51JztcbiAgICAgICAgbWVudS5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnZ3JvdXAnKTtcbiAgICAgICAgbWVudS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnTWFyayBwbGF5ZXInKTtcbiAgICAgICAgY29uc3QgYWRkQWN0aW9uID0gKHRleHQ6IHN0cmluZywgYWN0OiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lLmlzQ29ubmVjdGVkICYmIHRoaXMubmFtZXMuZ2V0KG5hbWUpID09PSBpZCkgYWN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1lbnUuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgfTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFyaywgdGV4dF0gb2YgW1snZnJpZW5kJywgJ01hcmsgYXMgZnJpZW5kJ10sIFsnZm9lJywgJ01hcmsgYXMgZm9lJ11dIGFzIGNvbnN0KSB7XG4gICAgICAgICAgICBhZGRBY3Rpb24odGV4dCwgKCkgPT4gdGhpcy5hcHBseU1hcmsoaWQsIG1hcmspKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZS5kYXRhc2V0LmphcnZpc01hcmspIGFkZEFjdGlvbignUmVtb3ZlIHRoaXMgcGxheWVy4oCZcyBtYXJrJywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVtb3ZlTWFyayhpZCkpIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgbWVudS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrID0+IGNsaWNrLnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtZW51KTtcbiAgICAgICAgdGhpcy5tYXJrTWVudSA9IG1lbnU7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gbmFtZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgeCA9IGV2ZW50LmNsaWVudFggfHwgYm91bmRzLmxlZnQ7XG4gICAgICAgIGNvbnN0IHkgPSBldmVudC5jbGllbnRZIHx8IGJvdW5kcy5ib3R0b207XG4gICAgICAgIG1lbnUuc3R5bGUubGVmdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHgsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCAtIG1lbnUub2Zmc2V0V2lkdGgpKSArICdweCc7XG4gICAgICAgIG1lbnUuc3R5bGUudG9wID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oeSwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCAtIG1lbnUub2Zmc2V0SGVpZ2h0KSkgKyAncHgnO1xuICAgICAgICBtZW51LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpPy5mb2N1cyh7IHByZXZlbnRTY3JvbGw6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgZ2V0Q29udGVzdE5hbWVzKHJvb3Q6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdERhdGFbXSkge1xuICAgICAgICBjb25zdCBuYW1lcyA9IG5ldyBNYXA8SFRNTEVsZW1lbnQsIHN0cmluZz4oKTtcbiAgICAgICAgY29uc3QgYnlDb250ZXN0ID0gbmV3IE1hcDxzdHJpbmcsIE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+Pj4oKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiByb290LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTFRhYmxlUm93RWxlbWVudD4oJy5sZWFkVGFibGUgdHInKSkge1xuICAgICAgICAgICAgY29uc3QgY2VsbCA9IHJvdy5jZWxscz8uWzFdO1xuICAgICAgICAgICAgaWYgKCFjZWxsIHx8IGNlbGwubG9jYWxOYW1lICE9PSAndGQnKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBjZWxsLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcubmlja25hbWUnKSB8fCBjZWxsO1xuICAgICAgICAgICAgbGV0IGlkID0gcm93LmdldEF0dHJpYnV0ZSgnc29ydGluZ19pZCcpIHx8IG5hbWUuZ2V0QXR0cmlidXRlKCdpZC1tZW1iZXInKSB8fFxuICAgICAgICAgICAgICAgIG5hbWUucXVlcnlTZWxlY3RvcignW2lkLW1lbWJlcl0nKT8uZ2V0QXR0cmlidXRlKCdpZC1tZW1iZXInKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlc3RJZCA9IHJvdy5jbG9zZXN0KCdbaWRfY29udGVzdF0nKT8uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG4gICAgICAgICAgICBpZiAoY29udGVzdElkKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJ5TmFtZSA9IGJ5Q29udGVzdC5nZXQoY29udGVzdElkKTtcbiAgICAgICAgICAgICAgICBpZiAoIWJ5TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0aWNpcGFudHMgPSBjb250ZXN0cy5maW5kKGNvbnRlc3QgPT4gU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCkgPT09IGNvbnRlc3RJZCk/LnBhcnRpY2lwYW50cztcbiAgICAgICAgICAgICAgICAgICAgYnlOYW1lID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHsgbmlja25hbWUsIGlkX21lbWJlciB9IG9mIE9iamVjdC52YWx1ZXMocGFydGljaXBhbnRzIHx8IHt9KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbmlja25hbWVLZXkgPSBTdHJpbmcobmlja25hbWUgPz8gJycpLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbmlja25hbWVLZXkgfHwgIS9eWzEtOV1cXGQqJC8udGVzdChTdHJpbmcoaWRfbWVtYmVyKSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGJ5TmFtZS5nZXQobmlja25hbWVLZXkpIHx8IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlcy5hZGQoU3RyaW5nKGlkX21lbWJlcikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnlOYW1lLnNldChuaWNrbmFtZUtleSwgbWF0Y2hlcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnlDb250ZXN0LnNldChjb250ZXN0SWQsIGJ5TmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBieU5hbWUuZ2V0KHJlYWRSb3dOYW1lKG5hbWUpKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcyAmJiAhbWF0Y2hlcy5oYXMoaWQgPz8gJycpKSBpZCA9IG1hdGNoZXMuc2l6ZSA9PT0gMSA/IG1hdGNoZXMudmFsdWVzKCkubmV4dCgpLnZhbHVlIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZCAmJiAvXlsxLTldXFxkKiQvLnRlc3QoaWQpKSBuYW1lcy5zZXQobmFtZSwgaWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYW1lcztcbiAgICB9XG5cbiAgICByZWZyZXNoKCkge1xuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4odGhpcy5yb290U2VsZWN0b3IpO1xuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xuICAgICAgICBjb25zdCBjb250ZXN0cyA9IHRoaXMuaW5MZWFndWUgPyBbXSA6IFtcbiAgICAgICAgICAgIC4uLk9iamVjdC52YWx1ZXMod2luZG93LmNvbnRlc3RzPy5hY3RpdmUgPz8ge30pLFxuICAgICAgICAgICAgLi4uT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmZpbmlzaGVkID8/IHt9KVxuICAgICAgICBdLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbCk7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gIXJvb3QgPyBuZXcgTWFwPEhUTUxFbGVtZW50LCBzdHJpbmc+KCkgOiB0aGlzLmluTGVhZ3VlXG4gICAgICAgICAgICA/IG5ldyBNYXAoQXJyYXkuZnJvbShyb290LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcubmlja25hbWVbaWQtbWVtYmVyXScpLCBuYW1lID0+IFtuYW1lLCBuYW1lLmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJyldIGFzIGNvbnN0KVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgcmVhZG9ubHkgW0hUTUxFbGVtZW50LCBzdHJpbmddID0+ICEhZW50cnlbMV0gJiYgL15bMS05XVxcZCokLy50ZXN0KGVudHJ5WzFdKSkpXG4gICAgICAgICAgICA6IHRoaXMuZ2V0Q29udGVzdE5hbWVzKHJvb3QsIGNvbnRlc3RzKTtcblxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5uYW1lcy5rZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChuYW1lcy5oYXMobmFtZSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNQbGF5ZXI7XG4gICAgICAgICAgICBkZWxldGUgbmFtZS5kYXRhc2V0LmphcnZpc01hcms7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5hbWVzID0gbmFtZXM7XG4gICAgICAgIGlmICghcm9vdCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBtYXJrcyA9IHRoaXMucmVhZE1hcmtzKCk7XG4gICAgICAgIGNvbnN0IHNhdmVkTmFtZXMgPSB0aGlzLnJlYWRTYXZlZE5hbWVzKCk7XG4gICAgICAgIGNvbnN0IHJvc3Rlck5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGxldCBuYW1lc0NoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgcmVtZW1iZXJOYW1lID0gKGlkOiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcgfCBudWxsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IHR5cGVvZiB0ZXh0ID09PSAnc3RyaW5nJyA/IHRleHQudHJpbSgpIDogJyc7XG4gICAgICAgICAgICBpZiAoIWRpc3BsYXlOYW1lIHx8IChtYXJrc1tpZF0gIT09ICdmcmllbmQnICYmIG1hcmtzW2lkXSAhPT0gJ2ZvZScpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91cyA9IHNhdmVkTmFtZXNbaWRdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcmV2aW91cyA9PT0gJ3N0cmluZycgfHwgcHJldmlvdXM/Lm5hbWUgIT09IGRpc3BsYXlOYW1lKSB7XG4gICAgICAgICAgICAgICAgc2F2ZWROYW1lc1tpZF0gPSB7IG5hbWU6IGRpc3BsYXlOYW1lIH07XG4gICAgICAgICAgICAgICAgbmFtZXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5pbkxlYWd1ZSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IHBsYXllciwgbmlja25hbWUgfSBvZiB3aW5kb3cub3Bwb25lbnRzX2xpc3QgPz8gW10pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IFN0cmluZyhwbGF5ZXI/LmlkX2ZpZ2h0ZXIpO1xuICAgICAgICAgICAgICAgIGlmIChyZW1lbWJlck5hbWUoaWQsIG5pY2tuYW1lKSkgcm9zdGVyTmFtZXMuYWRkKGlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFByZWZlciB0aGUgYWN0aXZlIHJvc3RlciBpZiBhIHBsYXllciBhcHBlYXJzIGluIGJvdGggb2xkIGFuZCBjdXJyZW50IGNvbnRlc3RzLlxuICAgICAgICAgICAgZm9yIChjb25zdCBjb250ZXN0IG9mIGNvbnRlc3RzKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IGlkX21lbWJlciwgbmlja25hbWUgfSBvZiBPYmplY3QudmFsdWVzKGNvbnRlc3QucGFydGljaXBhbnRzID8/IHt9KSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZCA9IFN0cmluZyhpZF9tZW1iZXIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJvc3Rlck5hbWVzLmhhcyhpZCkgJiYgcmVtZW1iZXJOYW1lKGlkLCBuaWNrbmFtZSkpIHJvc3Rlck5hbWVzLmFkZChpZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbG9ycyA9IHRoaXMucmVhZENvbG9ycygpO1xuICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCBjb2xvcl0gb2YgT2JqZWN0LmVudHJpZXMoY29sb3JzKSkge1xuICAgICAgICAgICAgY29uc3QgcHJvcGVydHkgPSAnLS1qYXJ2aXMtJyArIG1hcmsgKyAnLWNvbG9yJztcbiAgICAgICAgICAgIGlmIChyb290LnN0eWxlLmdldFByb3BlcnR5VmFsdWUocHJvcGVydHkpICE9PSBjb2xvcikgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgY29sb3IpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIGlkXSBvZiBuYW1lcykge1xuICAgICAgICAgICAgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNQbGF5ZXIgIT09IGlkKSBuYW1lLmRhdGFzZXQuamFydmlzUGxheWVyID0gaWQ7XG4gICAgICAgICAgICBjb25zdCBtYXJrID0gbWFya3NbaWRdO1xuICAgICAgICAgICAgaWYgKG1hcmsgPT09ICdmcmllbmQnIHx8IG1hcmsgPT09ICdmb2UnKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrICE9PSBtYXJrKSBuYW1lLmRhdGFzZXQuamFydmlzTWFyayA9IG1hcms7XG4gICAgICAgICAgICAgICAgaWYgKCFyb3N0ZXJOYW1lcy5oYXMoaWQpKSByZW1lbWJlck5hbWUoaWQsIHJlYWRSb3dOYW1lKG5hbWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmFtZS5kYXRhc2V0LmphcnZpc01hcmspIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgbmFtZS5kYXRhc2V0LmphcnZpc01hcms7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWVzQ2hhbmdlZCkgdGhpcy5zYXZlTmFtZXMoc2F2ZWROYW1lcyk7XG4gICAgfVxuXG4gICAgYXBwbHlNYXJrKGlkOiBzdHJpbmcsIG1hcms6IE1hcmspIHtcbiAgICAgICAgY29uc3QgbWFya3MgPSB0aGlzLnJlYWRNYXJrcygpO1xuICAgICAgICBtYXJrc1tpZF0gPSBtYXJrO1xuXG4gICAgICAgIGlmICh0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrcycsIG1hcmtzKSkgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgaGFuZGxlTWFya01lbnUoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUgJiYgdGhpcy5tYXJrTWVudT8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgIT09ICdjb250ZXh0bWVudScgJiYgIWV2ZW50LmFsdEtleSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG5hbWUgPSBldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ID8gZXZlbnQudGFyZ2V0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCdbZGF0YS1qYXJ2aXMtcGxheWVyXScpIDogbnVsbDtcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGlkID0gdGhpcy5uYW1lcy5nZXQobmFtZSk7XG4gICAgICAgIGlmICghaWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5vcGVuTWFya01lbnUoZXZlbnQsIG5hbWUsIGlkKTtcbiAgICB9XG5cbiAgICBydW4oeyBsZWFndWUsIGNvbnRlc3RzIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICB0aGlzLmluTGVhZ3VlID0gY3VycmVudFBhZ2UgPT09ICcvbGVhZ3Vlcy5odG1sJztcbiAgICAgICAgaWYgKHRoaXMuaW5MZWFndWUgPyAhbGVhZ3VlIDogIWNvbnRlc3RzKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5yb290U2VsZWN0b3IgPSB0aGlzLmluTGVhZ3VlID8gJy5sZWFndWVfdGFibGUnIDogJyNjb250ZXN0cyAucmlnaHRfcGFydCc7XG4gICAgICAgIGNvbnN0IGhhbmRsZU1hcmtNZW51ID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB0aGlzLmhhbmRsZU1hcmtNZW51KGV2ZW50KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVNYXJrTWVudSwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgaGFuZGxlTWFya01lbnUsIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmtleSAhPT0gJ0VzY2FwZScgfHwgIXRoaXMubWFya01lbnUpIHJldHVybjtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3N0b3JhZ2UnLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoIWV2ZW50LmtleSB8fCBbJ1BsYXllck1hcmtzJywgJ1BsYXllck1hcmtDb2xvcnMnLCAnRnJpZW5kTGlzdCcsICdGb2VMaXN0J11cbiAgICAgICAgICAgICAgICAuc29tZShrZXkgPT4gZXZlbnQua2V5ID09PSBMU19DT05GSUdfTkFNRSArIGtleSkpIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKG11dGF0aW9ucyA9PiB7XG4gICAgICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnJvb3RTZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAocm9vdCAhPT0gdGhpcy5yb290IHx8IChyb290ICYmIG11dGF0aW9ucy5zb21lKCh7IHRhcmdldCB9KSA9PiByb290LmNvbnRhaW5zKHRhcmdldCkpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICBjaGFyYWN0ZXJEYXRhOiB0cnVlLFxuICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFsnc29ydGluZ19pZCcsICdpZC1tZW1iZXInLCAnaWRfY29udGVzdCddXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuXG5leHBvcnQgdHlwZSBDb250ZXN0S2luZCA9ICdkYWlseScgfCAnZXZlbnQnO1xuZXhwb3J0IHR5cGUgQ29udGVzdFJhbmsgPSAndG9wJyB8ICdtaW5lJztcblxuY29uc3QgQ09OVEVTVF9LSU5EUyA9IFtbJ2RhaWx5JywgJ0RhaWx5J10sIFsnZXZlbnQnLCAnRXZlbnQnXV0gYXMgY29uc3Q7XG5jb25zdCBDT05URVNUX1JBTktTID0gW1sndG9wJywgJ1RvcCddLCBbJ21pbmUnLCAnTXkgcmFuayddXSBhcyBjb25zdDtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRDb250ZXN0U2V0dGluZyhrZXk6IHN0cmluZyk6IHVua25vd24ge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBsc0dldChrZXkpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQ29udGVzdERlZmF1bHRzKCkge1xuICAgIGNvbnN0IGtpbmQ6IENvbnRlc3RLaW5kID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0S2luZCcpID09PSAnZXZlbnQnID8gJ2V2ZW50JyA6ICdkYWlseSc7XG4gICAgY29uc3QgcmFuazogQ29udGVzdFJhbmsgPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RSYW5rU3RhcnQnKSA9PT0gJ21pbmUnID8gJ21pbmUnIDogJ3RvcCc7XG4gICAgcmV0dXJuIHsga2luZCwgcmFuayB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZFBpbm5lZFJhbmsoaWQ6IHN0cmluZywgZmFsbGJhY2s6IENvbnRlc3RSYW5rKTogQ29udGVzdFJhbmsge1xuICAgIGNvbnN0IHNhdmVkID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0UGlubmVkUmFuaycpO1xuICAgIGlmIChzYXZlZCAmJiB0eXBlb2Ygc2F2ZWQgPT09ICdvYmplY3QnICYmICdpZCcgaW4gc2F2ZWQgJiYgc2F2ZWQuaWQgPT09IGlkICYmICdyYW5rJyBpbiBzYXZlZCkge1xuICAgICAgICBpZiAoc2F2ZWQucmFuayA9PT0gJ21pbmUnIHx8IHNhdmVkLnJhbmsgPT09ICd0b3AnKSByZXR1cm4gc2F2ZWQucmFuaztcbiAgICB9XG4gICAgcmV0dXJuIGZhbGxiYWNrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVJhbmtDaG9pY2UobGFiZWw6IHN0cmluZywgc2VsZWN0OiAocmFuazogQ29udGVzdFJhbmspID0+IHZvaWQpIHtcbiAgICByZXR1cm4gbWFrZUNob2ljZShsYWJlbCwgQ09OVEVTVF9SQU5LUywgc2VsZWN0KTtcbn1cblxuZnVuY3Rpb24gbWFrZUNob2ljZTxUIGV4dGVuZHMgc3RyaW5nPihsYWJlbDogc3RyaW5nLCBvcHRpb25zOiBSZWFkb25seUFycmF5PHJlYWRvbmx5IFtULCBzdHJpbmddPiwgc2VsZWN0OiAodmFsdWU6IFQpID0+IHZvaWQpIHtcbiAgICBjb25zdCBncm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBncm91cC5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3QtY2hvaWNlJztcbiAgICBncm91cC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnZ3JvdXAnKTtcbiAgICBncm91cC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBsYWJlbCk7XG4gICAgZ3JvdXAuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICBmb3IgKGNvbnN0IFt2YWx1ZSwgdGV4dF0gb2Ygb3B0aW9ucykge1xuICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgYnV0dG9uLmRhdGFzZXQuY29udGVzdENob2ljZSA9IHZhbHVlO1xuICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHNlbGVjdCh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBncm91cC5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgIH1cbiAgICByZXR1cm4gZ3JvdXA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RDb250ZXN0Q2hvaWNlKGdyb3VwOiBIVE1MRWxlbWVudCwgdmFsdWU6IHN0cmluZykge1xuICAgIGZvciAoY29uc3QgYnV0dG9uIG9mIGdyb3VwLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpKSB7XG4gICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIFN0cmluZyhidXR0b24uZGF0YXNldC5jb250ZXN0Q2hvaWNlID09PSB2YWx1ZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxDb250ZXN0U2V0dGluZ3MoKSB7XG4gICAgaWYgKGN1cnJlbnRQYWdlICE9PSAnL2hvbWUuaHRtbCcpIHJldHVybjtcblxuICAgIGNvbnN0IHNlbGVjdG9yID0gJy5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmNvbmZpZy1zZXR0aW5nW3JlbD1cIkpBUlZJU19jb250ZXN0U3RhcnRcIl0nO1xuICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICBpZiAoIWNhcmQgfHwgY2FyZC5xdWVyeVNlbGVjdG9yKCcuamFydmlzLWNvbnRlc3Qtc2V0dGluZ3MnKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGZpZWxkc2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZmllbGRzZXQnKTtcbiAgICAgICAgZmllbGRzZXQuY2xhc3NOYW1lID0gJ2phcnZpcy1jb250ZXN0LXNldHRpbmdzJztcbiAgICAgICAgZmllbGRzZXQuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ0NvbnRlc3Qgc3RhcnR1cCBkZWZhdWx0cycpO1xuICAgICAgICBjb25zdCBzYXZlID0gKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBncm91cDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbHNTZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShncm91cCwgdmFsdWUpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGNvbnRlc3QgZGVmYXVsdDonLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBraW5kcyA9IG1ha2VDaG9pY2UoJ1ByZWZlcnJlZCBjb250ZXN0JywgQ09OVEVTVF9LSU5EUywgdmFsdWUgPT4gc2F2ZSgnQ29udGVzdEtpbmQnLCB2YWx1ZSwga2luZHMpKTtcbiAgICAgICAgY29uc3QgcmFua3MgPSBtYWtlUmFua0Nob2ljZSgnRGVmYXVsdCBsZWFkZXJib2FyZCBwb3NpdGlvbicsIHZhbHVlID0+IHNhdmUoJ0NvbnRlc3RSYW5rU3RhcnQnLCB2YWx1ZSwgcmFua3MpKTtcbiAgICAgICAgY29uc3QgZGVmYXVsdHMgPSByZWFkQ29udGVzdERlZmF1bHRzKCk7XG4gICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2Uoa2luZHMsIGRlZmF1bHRzLmtpbmQpO1xuICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKHJhbmtzLCBkZWZhdWx0cy5yYW5rKTtcblxuICAgICAgICBjb25zdCBraW5kTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAga2luZExhYmVsLmlubmVySFRNTCA9IHNldHRpbmdIZWxwKCdQcmVmZXJyZWQgY29udGVzdCcsICdEYWlseSBvcGVucyB0aGUgZmlyc3QgYWN0aXZlIGRhaWx5IGNvbnRlc3QuIEV2ZW50IG9wZW5zIHRoZSBsYXN0IGFjdGl2ZSBldmVudCBjb250ZXN0LCBvciB0aGUgZGFpbHkgY29udGVzdCBpZiB0aGVyZSBpcyBubyBldmVudC4nKTtcbiAgICAgICAgY29uc3QgcmFua0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHJhbmtMYWJlbC5pbm5lckhUTUwgPSBzZXR0aW5nSGVscCgnTGVhZGVyYm9hcmQgc3RhcnQnLCAnT3BlbiBhdCB0aGUgdG9wIG9yIGF0IHlvdXIgcmFuay4gQSBzdGFycmVkIGNvbnRlc3QgY2FuIGhhdmUgaXRzIG93biBwb3NpdGlvbi4nKTtcbiAgICAgICAgZmllbGRzZXQuYXBwZW5kKGtpbmRMYWJlbCwga2luZHMsIHJhbmtMYWJlbCwgcmFua3MpO1xuICAgICAgICBjb25zdCByZWZyZXNoRW5hYmxlZCA9ICgpID0+IGZpZWxkc2V0LmRpc2FibGVkID0gIWNhcmQuY2xhc3NMaXN0LmNvbnRhaW5zKCdlbmFibGVkJyk7XG4gICAgICAgIHJlZnJlc2hFbmFibGVkKCk7XG4gICAgICAgIG5ldyBNdXRhdGlvbk9ic2VydmVyKHJlZnJlc2hFbmFibGVkKS5vYnNlcnZlKGNhcmQsIHsgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10gfSk7XG4gICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoZmllbGRzZXQpO1xuICAgIH0pO1xufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgJCwgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCwgbHNSbSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgbWFrZVJhbmtDaG9pY2UsIHJlYWRDb250ZXN0RGVmYXVsdHMsIHJlYWRDb250ZXN0U2V0dGluZywgcmVhZFBpbm5lZFJhbmssIHNlbGVjdENvbnRlc3RDaG9pY2UsIHR5cGUgQ29udGVzdEtpbmQgfSBmcm9tICcuL2NvbnRlc3RQcmVmZXJlbmNlcyc7XG5cbmludGVyZmFjZSBDb250ZXN0Q2FyZCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBjYXJkOiBIVE1MRWxlbWVudDtcbiAgICBoZWFkZXI6IEhUTUxFbGVtZW50O1xuICAgIHRpdGxlOiBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBraW5kOiBDb250ZXN0S2luZCB8IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcm1Db250ZXN0U3RhcnR1cEd1YXJkKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZSAhPT0gJy9hY3Rpdml0aWVzLmh0bWwnIHx8IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKS5nZXQoJ3RhYicpICE9PSAnY29udGVzdHMnKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBpZiAoSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnSEhQbHVzUGx1c0NvbmZpZycpID8/ICdudWxsJyk/LkpBUlZJU19jb250ZXN0U3RhcnQgPT09IGZhbHNlKSByZXR1cm47XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBLZWVwIGJvdGggcGFuZXMgb3V0IG9mIHZpZXcgdW50aWwgdGhlIGNob3NlbiBjb250ZXN0IGFuZCBpdHMgbGVhZGVyYm9hcmQgYXJlIHBvc2l0aW9uZWQuXG4gICAgY29uc3QgZ3VhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIGd1YXJkLmlkID0gJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnO1xuICAgIGd1YXJkLnRleHRDb250ZW50ID0gYFxuICAgICAgICAjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEsXG4gICAgICAgICNjb250ZXN0cyAucmlnaHRfcGFydCB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICAgICAgfVxuICAgIGA7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgIGlmICghZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSByZXR1cm47XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChndWFyZCk7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9KTtcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ3VhcmQpO1xuICAgIGVsc2Ugb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwgeyBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICBndWFyZC5yZW1vdmUoKTtcbiAgICB9LCA0MDAwKTtcbn1cblxuZXhwb3J0IGNsYXNzIENvbnRlc3RTdGFydCBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHByZWZlcmVuY2UgPSAnJztcbiAgICBwcml2YXRlIHN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBkZWZhdWx0cyA9IHJlYWRDb250ZXN0RGVmYXVsdHMoKTtcbiAgICBwcml2YXRlIGxpc3Q6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByaWdodDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJlc3RvcmluZ0NhcmQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByZXBvc2l0aW9uOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHN0b3BKdW1wOiAoKGZpbmlzaD86IGJvb2xlYW4pID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBvYnNlcnZlcjogTXV0YXRpb25PYnNlcnZlciB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgbGlzdGVuZXJzOiBBYm9ydENvbnRyb2xsZXIgfCBudWxsID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2NvbnRlc3RTdGFydCdcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJDb250ZXN0IHN0YXJ0dXBcIiwgXCJPcGVuIHRoZSBwcmVmZXJyZWQgY29udGVzdCBhbmQgbGVhZGVyYm9hcmQgcG9zaXRpb24gb24gbG9hZC4gQSBzdGFycmVkIGNvbnRlc3QgdGFrZXMgcHJpb3JpdHkuXCIpXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoeyBuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWEgfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UgPT09ICcvYWN0aXZpdGllcy5odG1sJztcbiAgICB9XG5cbiAgICBnZXRDb250ZXN0cyhsaXN0OiBIVE1MRWxlbWVudCwgZmluaXNoZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz4pOiBDb250ZXN0Q2FyZFtdIHtcbiAgICAgICAgY29uc3QgYWN0aXZlID0gbmV3IE1hcChPYmplY3QudmFsdWVzKHdpbmRvdy5jb250ZXN0cz8uYWN0aXZlIHx8IHt9KVxuICAgICAgICAgICAgLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbClcbiAgICAgICAgICAgIC5tYXAoY29udGVzdCA9PiBbU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCksIGNvbnRlc3RdKSk7XG5cbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obGlzdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLmNvbnRlc3RbaWRfY29udGVzdF0nKSkuZmxhdE1hcChjYXJkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gY2FyZC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmICghaWQpIHJldHVybiBbXTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlc3QgPSBhY3RpdmUuZ2V0KGlkKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IGNhcmQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jb250ZXN0X2hlYWRlcicpO1xuICAgICAgICAgICAgaWYgKCFoZWFkZXIgfHwgZmluaXNoZWQuaGFzKGlkKSkgcmV0dXJuIFtdO1xuICAgICAgICAgICAgaWYgKCFjb250ZXN0ICYmICFoZWFkZXIubWF0Y2hlcygnLmluX3Byb2dyZXNzJykpIHJldHVybiBbXTtcblxuICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBoZWFkZXIucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jb250ZXN0X3RpdGxlLCAuY29udGVzdF9uYW1lLCBoMywgaDQsIGg1Jyk7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gdGl0bGUgJiYgQXJyYXkuZnJvbSh0aXRsZS5jaGlsZE5vZGVzKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIobm9kZSA9PiAhKG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSB8fCAhbm9kZS5tYXRjaGVzKCcuamFydmlzLWNvbnRlc3QtcGluLCAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpKVxuICAgICAgICAgICAgICAgIC5tYXAobm9kZSA9PiBub2RlLnRleHRDb250ZW50KS5qb2luKCcnKS50cmltKCk7XG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICBpZCwgY2FyZCwgaGVhZGVyLCB0aXRsZSxcbiAgICAgICAgICAgICAgICBraW5kOiBjb250ZXN0Py5jYXRlZ29yeV90eXBlID8gKGNvbnRlc3QuY2F0ZWdvcnlfdHlwZSA9PT0gJ2RhaWx5JyA/ICdkYWlseScgOiAnZXZlbnQnKSA6IG51bGwsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFN0cmluZyhuYW1lIHx8IGNvbnRlc3Q/Lm5hbWUgfHwgY29udGVzdD8udGl0bGUgfHxcbiAgICAgICAgICAgICAgICAgICAgKGNvbnRlc3Q/LmNhdGVnb3J5X3R5cGUgPT09ICdkYWlseScgPyAnRGFpbHkgY29udGVzdCcgOiAnQ29udGVzdCcpKS50cmltKClcbiAgICAgICAgICAgIH1dO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRUYXJnZXQoY29udGVzdHM6IENvbnRlc3RDYXJkW10pIHtcbiAgICAgICAgaWYgKHRoaXMucHJlZmVyZW5jZSkgcmV0dXJuIGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmlkID09PSB0aGlzLnByZWZlcmVuY2UpO1xuXG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRzLmtpbmQgPT09ICdldmVudCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gWy4uLmNvbnRlc3RzXS5yZXZlcnNlKCkuZmluZChjb250ZXN0ID0+IGNvbnRlc3Qua2luZCA9PT0gJ2V2ZW50Jyk7XG4gICAgICAgICAgICBpZiAoZXZlbnQpIHJldHVybiBldmVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29udGVzdHMuZmluZChjb250ZXN0ID0+IGNvbnRlc3Qua2luZCA9PT0gJ2RhaWx5JykgPz9cbiAgICAgICAgICAgIGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmtpbmQgPT09IG51bGwpID8/IGNvbnRlc3RzWzBdO1xuICAgIH1cblxuICAgIGNsZWFyRXhwaXJlZFBpbihsaXN0OiBIVE1MRWxlbWVudCwgY29udGVzdHM6IENvbnRlc3RDYXJkW10sIGZpbmlzaGVkOiBSZWFkb25seVNldDxzdHJpbmc+KSB7XG4gICAgICAgIGlmICghdGhpcy5wcmVmZXJlbmNlIHx8IGNvbnRlc3RzLnNvbWUoKHsgaWQgfSkgPT4gaWQgPT09IHRoaXMucHJlZmVyZW5jZSkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBhY3RpdmUgPSB3aW5kb3cuY29udGVzdHM/LmFjdGl2ZTtcbiAgICAgICAgY29uc3QgbWlzc2luZyA9IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScgJiYgbGlzdC5xdWVyeVNlbGVjdG9yKCcuY29udGVzdF9oZWFkZXInKSAmJlxuICAgICAgICAgICAgYWN0aXZlICYmICFPYmplY3QudmFsdWVzKGFjdGl2ZSkuc29tZShjb250ZXN0ID0+IFN0cmluZyhjb250ZXN0Py5pZF9jb250ZXN0KSA9PT0gdGhpcy5wcmVmZXJlbmNlKTtcbiAgICAgICAgaWYgKCFmaW5pc2hlZC5oYXModGhpcy5wcmVmZXJlbmNlKSAmJiAhbWlzc2luZykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGV4cGlyZWRJZCA9IHRoaXMucHJlZmVyZW5jZTtcbiAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gJyc7XG4gICAgICAgIHRoaXMuc3RvcEp1bXA/LihmYWxzZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoU3RyaW5nKGxzR2V0KCdDb250ZXN0U3RhcnRJZCcpKSA9PT0gZXhwaXJlZElkKSBsc1JtKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBjbGVhciB0aGUgZXhwaXJlZCBjb250ZXN0IHByZWZlcmVuY2U6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZVBpbnMobGlzdDogSFRNTEVsZW1lbnQsIGNvbnRlc3RzOiBDb250ZXN0Q2FyZFtdKSB7XG4gICAgICAgIGNvbnN0IGhvc3RzID0gbmV3IFNldChjb250ZXN0cy5tYXAoKHsgdGl0bGUsIGhlYWRlciB9KSA9PiB0aXRsZSB8fCBoZWFkZXIpKTtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sIG9mIGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLmphcnZpcy1jb250ZXN0LXBpbiwgLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKSkge1xuICAgICAgICAgICAgaWYgKCFjb250cm9sLnBhcmVudEVsZW1lbnQgfHwgIWhvc3RzLmhhcyhjb250cm9sLnBhcmVudEVsZW1lbnQpKSBjb250cm9sLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCB7IGlkLCB0aXRsZSwgaGVhZGVyLCBsYWJlbCB9IG9mIGNvbnRlc3RzKSB7XG4gICAgICAgICAgICBjb25zdCBob3N0ID0gdGl0bGUgfHwgaGVhZGVyO1xuICAgICAgICAgICAgbGV0IHBpbiA9IGhvc3QucXVlcnlTZWxlY3RvcjxIVE1MQnV0dG9uRWxlbWVudD4oJzpzY29wZSA+IC5qYXJ2aXMtY29udGVzdC1waW4nKTtcbiAgICAgICAgICAgIGlmICghcGluKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1jb250ZXN0LXBpbic7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVzdElkID0gYnV0dG9uLmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRlc3RJZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLnByZWZlcmVuY2UgPT09IGNvbnRlc3RJZCA/ICcnIDogY29udGVzdElkO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQpIGxzU2V0KCdDb250ZXN0U3RhcnRJZCcsIG5leHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBsc1JtKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gbmV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcEp1bXA/LigpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBzYXZlIHRoZSBjb250ZXN0IHByZWZlcmVuY2U6JywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBwaW4gPSBob3N0LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwaW5uZWQgPSB0aGlzLnByZWZlcmVuY2UgPT09IGlkO1xuICAgICAgICAgICAgcGluLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgU3RyaW5nKHBpbm5lZCkpO1xuICAgICAgICAgICAgcGluLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHBpbm5lZCA/IGBVbnBpbiAke2xhYmVsfWAgOiBgUGluICR7bGFiZWx9IHRvIG9wZW4gb24gcmVsb2FkYCk7XG4gICAgICAgICAgICBwaW4udGl0bGUgPSBwaW5uZWQgPyAnUGlubmVkLiBDbGljayB0byB1c2UgeW91ciBjb250ZXN0IGRlZmF1bHRzLicgOiAnT3BlbiB0aGlzIGNvbnRlc3Qgd2hlbiB0aGUgcGFnZSByZWxvYWRzJztcblxuICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gaG9zdC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKTtcbiAgICAgICAgICAgIGlmICghcGlubmVkKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24/LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNob2ljZSA9IG1ha2VSYW5rQ2hvaWNlKCdQaW5uZWQgbGVhZGVyYm9hcmQgc3RhcnQnLCByYW5rID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxzU2V0KCdDb250ZXN0UGlubmVkUmFuaycsIHsgaWQsIHJhbmsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGNob2ljZSwgcmFuayk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGxlYWRlcmJvYXJkIHBvc2l0aW9uOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjaG9pY2UuY2xhc3NMaXN0LmFkZCgnamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpO1xuICAgICAgICAgICAgICAgIHBpbi5hZnRlcihjaG9pY2UpO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gY2hvaWNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShwb3NpdGlvbiwgcmVhZFBpbm5lZFJhbmsoaWQsIHRoaXMuZGVmYXVsdHMucmFuaykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IGxpc3QucXVlcnlTZWxlY3RvcignLmNvbnRlc3RfaGVhZGVyX2FjdGl2ZScpPy5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpO1xuICAgICAgICBpZiAoc2VsZWN0ZWQpIHJldHVybiBzZWxlY3RlZC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcblxuICAgICAgICBjb25zdCBwYW5lbHMgPSBBcnJheS5mcm9tKHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYW5raW5nW2lkX2NvbnRlc3RdJykpXG4gICAgICAgICAgICAuZmlsdGVyKHBhbmVsID0+IHBhbmVsLmdldENsaWVudFJlY3RzKCkubGVuZ3RoICYmIGdldENvbXB1dGVkU3R5bGUocGFuZWwpLnZpc2liaWxpdHkgPT09ICd2aXNpYmxlJyk7XG4gICAgICAgIHJldHVybiBwYW5lbHMubGVuZ3RoID09PSAxID8gcGFuZWxzWzBdLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpIDogbnVsbDtcbiAgICB9XG5cbiAgICBzaG93TGVhZGVyYm9hcmQocmlnaHQ6IEhUTUxFbGVtZW50LCBjb250ZXN0SWQ6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgaWYgKCFjb250ZXN0SWQpIHtcbiAgICAgICAgICAgIHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1vdGhlcicpLmZvckVhY2gocGFuZWwgPT4gcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnamFydmlzLWNvbnRlc3Qtb3RoZXInKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwYW5lbCBvZiByaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcucmFua2luZ1tpZF9jb250ZXN0XScpKSB7XG4gICAgICAgICAgICBwYW5lbC5jbGFzc0xpc3QudG9nZ2xlKCdqYXJ2aXMtY29udGVzdC1vdGhlcicsIHBhbmVsLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpICE9PSBjb250ZXN0SWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0T3duUm93KGJvYXJkOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBvd24gPSBib2FyZC5xdWVyeVNlbGVjdG9yKCcubGVhZFRhYmxlIHRyLmxlYWRfdGFibGVfZGVmYXVsdCcpO1xuICAgICAgICBpZiAob3duKSByZXR1cm4gb3duO1xuXG4gICAgICAgIGNvbnN0IGhlcm9JZCA9ICh3aW5kb3cuc2hhcmVkPy5IZXJvIHx8IHdpbmRvdy5IZXJvKT8uaW5mb3M/LmlkO1xuICAgICAgICBpZiAoaGVyb0lkID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGJvYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5sZWFkVGFibGUgdHJbc29ydGluZ19pZF0nKSlcbiAgICAgICAgICAgIC5maW5kKHJvdyA9PiByb3cuZ2V0QXR0cmlidXRlKCdzb3J0aW5nX2lkJykgPT09IFN0cmluZyhoZXJvSWQpKTtcbiAgICB9XG5cbiAgICBsb2NrU2Nyb2xsKHNjcm9sbGVyOiBIVE1MRWxlbWVudCkge1xuICAgICAgICAkKHNjcm9sbGVyKS5zdG9wKHRydWUsIGZhbHNlKTtcbiAgICAgICAgLy8gVGhlIGdhbWUgY2FuIHN0YXJ0IGFub3RoZXIgalF1ZXJ5IHR3ZWVuIGFmdGVyIGxvYWQuIEJsb2NrIGl0cyB3cml0ZXMgb24gdGhpcyBwYW5lIG9ubHkuXG4gICAgICAgIGNvbnN0IGlnbm9yZVNjcm9sbCA9ICgpID0+IHt9O1xuICAgICAgICBjb25zdCBnZXQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEVsZW1lbnQucHJvdG90eXBlLCAnc2Nyb2xsVG9wJyk/LmdldDtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRvcnMgPSBPYmplY3QuZW50cmllcyh7XG4gICAgICAgICAgICBzY3JvbGxUb3A6IHsgZ2V0LCBzZXQ6IGlnbm9yZVNjcm9sbCB9LFxuICAgICAgICAgICAgc2Nyb2xsOiB7IHZhbHVlOiBpZ25vcmVTY3JvbGwsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICBzY3JvbGxUbzogeyB2YWx1ZTogaWdub3JlU2Nyb2xsLCB3cml0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgc2Nyb2xsQnk6IHsgdmFsdWU6IGlnbm9yZVNjcm9sbCwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgICB9KS5maWx0ZXIoKFtrZXldKSA9PiAhT2JqZWN0Lmhhc093bihzY3JvbGxlciwga2V5KSk7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgZGVzY3JpcHRvcl0gb2YgZGVzY3JpcHRvcnMpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzY3JvbGxlciwga2V5LCB7IC4uLmRlc2NyaXB0b3IsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAkKHNjcm9sbGVyKS5zdG9wKHRydWUsIGZhbHNlKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgZGVzY3JpcHRvcl0gb2YgZGVzY3JpcHRvcnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzY3JvbGxlciwga2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudCAmJiBjdXJyZW50LnZhbHVlID09PSBkZXNjcmlwdG9yLnZhbHVlICYmIGN1cnJlbnQuc2V0ID09PSBkZXNjcmlwdG9yLnNldCkgUmVmbGVjdC5kZWxldGVQcm9wZXJ0eShzY3JvbGxlciwga2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBqdW1wVG8oc2Nyb2xsZXI6IEhUTUxFbGVtZW50LCB0YXJnZXQ6IEVsZW1lbnQgfCBudWxsIHwgdW5kZWZpbmVkLCBjZW50ZXIgPSBmYWxzZSkge1xuICAgICAgICBsZXQgdG9wID0gMDtcbiAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgICAgY29uc3QgYm91bmRzID0gc2Nyb2xsZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBjb25zdCBzY2FsZSA9IGJvdW5kcy5oZWlnaHQgLyBzY3JvbGxlci5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICBpZiAoIXNjYWxlKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0b3AgPSBzY3JvbGxlci5zY3JvbGxUb3AgKyAoaXRlbS50b3AgLSBib3VuZHMudG9wKSAvIHNjYWxlIC0gc2Nyb2xsZXIuY2xpZW50VG9wO1xuICAgICAgICAgICAgaWYgKGNlbnRlcikgdG9wIC09IChzY3JvbGxlci5jbGllbnRIZWlnaHQgLSBpdGVtLmhlaWdodCAvIHNjYWxlKSAvIDI7XG4gICAgICAgIH1cbiAgICAgICAgdG9wID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oc2Nyb2xsZXIuc2Nyb2xsSGVpZ2h0IC0gc2Nyb2xsZXIuY2xpZW50SGVpZ2h0LCB0b3ApKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKHRvcCAtIHNjcm9sbGVyLnNjcm9sbFRvcCkgPj0gMSkge1xuICAgICAgICAgICAgY29uc3Qgc2Nyb2xsVG8gPSBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxUbyBhcyAob3B0aW9uczogU2Nyb2xsVG9PcHRpb25zKSA9PiB2b2lkO1xuICAgICAgICAgICAgc2Nyb2xsVG8uY2FsbChzY3JvbGxlciwgeyB0b3AsIGJlaGF2aW9yOiAnaW5zdGFudCcgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvcGVuQ29udGVzdChsaXN0OiBIVE1MRWxlbWVudCwgcmlnaHQ6IEhUTUxFbGVtZW50LCB7IGlkLCBjYXJkLCBoZWFkZXIsIHRpdGxlIH06IENvbnRlc3RDYXJkKSB7XG4gICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSBwYW5lLmNsYXNzTGlzdC5hZGQoJ2phcnZpcy1jb250ZXN0LWluc3RhbnQnLCAnamFydmlzLWNvbnRlc3QtbG9hZGluZycpO1xuICAgICAgICBjb25zdCByYW5rID0gaWQgPT09IHRoaXMucHJlZmVyZW5jZSA/IHJlYWRQaW5uZWRSYW5rKGlkLCB0aGlzLmRlZmF1bHRzLnJhbmspIDogdGhpcy5kZWZhdWx0cy5yYW5rO1xuICAgICAgICBjb25zdCBwbGFjZUF0T3duUmFuayA9IHJhbmsgPT09ICdtaW5lJztcbiAgICAgICAgY29uc3QgcmVsZWFzZUxpc3QgPSB0aGlzLmxvY2tTY3JvbGwobGlzdCk7XG4gICAgICAgIGxldCBib2FyZDogSFRNTEVsZW1lbnQgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgICAgICBsZXQgcmVsZWFzZUJvYXJkOiAoKCkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCBwb3NpdGlvbmVkID0gZmFsc2U7XG4gICAgICAgIGxldCBsYXN0QXR0ZW1wdDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuICAgICAgICBjb25zdCBnZXRCb2FyZCA9ICgpID0+IEFycmF5LmZyb20ocmlnaHQucXVlcnlTZWxlY3RvckFsbCgnLnJhbmtpbmdbaWRfY29udGVzdF0nKSlcbiAgICAgICAgICAgIC5maW5kKHBhbmVsID0+IHBhbmVsLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpID09PSBpZCk/LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcubGVhZF90YWJsZV92aWV3Jyk7XG4gICAgICAgIGNvbnN0IHVwZGF0ZUJvYXJkID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV4dCA9IGdldEJvYXJkKCk7XG4gICAgICAgICAgICBpZiAoYm9hcmQgPT09IG5leHQpIHJldHVybjtcbiAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICBib2FyZCA9IG5leHQ7XG4gICAgICAgICAgICByZWxlYXNlQm9hcmQgPSBib2FyZCA/IHRoaXMubG9ja1Njcm9sbChib2FyZCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJldmVhbCA9ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSBwYW5lLmNsYXNzTGlzdC5yZW1vdmUoJ2phcnZpcy1jb250ZXN0LWxvYWRpbmcnKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXN0b3JlID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFsaXN0LmlzQ29ubmVjdGVkIHx8ICFyaWdodC5pc0Nvbm5lY3RlZCB8fCAhbGlzdC5jb250YWlucyhjYXJkKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICB1cGRhdGVCb2FyZCgpO1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KTtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZCAhPT0gaWQgJiYgc2VsZWN0ZWQgIT09IGxhc3RBdHRlbXB0KSB7XG4gICAgICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSBzZWxlY3RlZDtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgKHRpdGxlIHx8IGhlYWRlcikuY2xpY2soKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVCb2FyZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFib2FyZD8uY2xpZW50SGVpZ2h0IHx8IHRoaXMuZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdCwgcmlnaHQpICE9PSBpZCB8fFxuICAgICAgICAgICAgICAgIChwbGFjZUF0T3duUmFuayAmJiAhYm9hcmQucXVlcnlTZWxlY3RvcignLmxlYWRUYWJsZScpKSkgcmV0dXJuO1xuICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgaWQpO1xuICAgICAgICAgICAgdGhpcy5qdW1wVG8obGlzdCwgY2FyZCk7XG4gICAgICAgICAgICB0aGlzLmp1bXBUbyhib2FyZCwgcGxhY2VBdE93blJhbmsgPyB0aGlzLmdldE93blJvdyhib2FyZCkgOiBudWxsLCBwbGFjZUF0T3duUmFuayk7XG4gICAgICAgICAgICBpZiAoIXBvc2l0aW9uZWQpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgIHJldmVhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvcnJlY3QgYnJvd3Nlci1kcml2ZW4gbW92ZXMsIHN1Y2ggYXMgc2Nyb2xsSW50b1ZpZXcgb24gYSBsZWFkZXJib2FyZCByb3csIGJlZm9yZSBwYWludC5cbiAgICAgICAgY29uc3Qgb25TY3JvbGwgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSBsaXN0IHx8IGV2ZW50LnRhcmdldCA9PT0gYm9hcmQpIHJlc3RvcmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaW5wdXRFdmVudHMgPSBbJ3BvaW50ZXJkb3duJywgJ3RvdWNoc3RhcnQnLCAnd2hlZWwnLCAnY2xpY2snXTtcbiAgICAgICAgY29uc3Qgb25JbnB1dCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5pc1RydXN0ZWQpIHN0b3AoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3RvcE9uS2V5ID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkICYmIFsnVGFiJywgJ0Fycm93VXAnLCAnQXJyb3dEb3duJywgJ1BhZ2VVcCcsICdQYWdlRG93bicsICdIb21lJywgJ0VuZCcsICdFbnRlcicsICcgJ10uaW5jbHVkZXMoZXZlbnQua2V5KSkgc3RvcCgpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBhZnRlckxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICBsYXN0QXR0ZW1wdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJlc3RvcmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3RvcCA9IChmaW5pc2ggPSB0cnVlKSA9PiB7XG4gICAgICAgICAgICByZWxlYXNlTGlzdCgpO1xuICAgICAgICAgICAgcmVsZWFzZUJvYXJkPy4oKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSB7XG4gICAgICAgICAgICAgICAgcGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcGFuZS5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1pbnN0YW50JywgJ2phcnZpcy1jb250ZXN0LWxvYWRpbmcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgaW5wdXRFdmVudHMpIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uSW5wdXQsIHRydWUpO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHN0b3BPbktleSwgdHJ1ZSk7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFmdGVyTG9hZCk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgdGhpcy5zdG9wSnVtcCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnJlcG9zaXRpb24gPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZXN0b3JpbmdDYXJkID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChmaW5pc2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV2ZWFsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dChzdG9wLCA0MDAwKTtcbiAgICAgICAgdGhpcy5zdG9wSnVtcCA9IHN0b3A7XG4gICAgICAgIHRoaXMucmVwb3NpdGlvbiA9IHJlc3RvcmU7XG4gICAgICAgIHRoaXMucmVzdG9yaW5nQ2FyZCA9IGNhcmQ7XG4gICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSB7XG4gICAgICAgICAgICBwYW5lLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsLCB7IHBhc3NpdmU6IHRydWUsIGNhcHR1cmU6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBldmVudCBvZiBpbnB1dEV2ZW50cykgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgb25JbnB1dCwgeyBwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiB0cnVlIH0pO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc3RvcE9uS2V5LCB0cnVlKTtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgYWZ0ZXJMb2FkLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgIHJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICByZWZyZXNoKCkge1xuICAgICAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJyNjb250ZXN0cyAubGVmdF9wYXJ0IC5zY3JvbGxfYXJlYScpO1xuICAgICAgICBjb25zdCByaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMgLnJpZ2h0X3BhcnQnKTtcbiAgICAgICAgaWYgKHRoaXMuc3RvcEp1bXAgJiYgKHRoaXMubGlzdCAhPT0gbGlzdCB8fCB0aGlzLnJpZ2h0ICE9PSByaWdodCB8fCAhbGlzdD8uY29udGFpbnModGhpcy5yZXN0b3JpbmdDYXJkKSkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcEp1bXAoZmFsc2UpO1xuICAgICAgICAgICAgaWYgKHRoaXMucmlnaHQpIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHRoaXMucmlnaHQsIG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGlzdCA9IGxpc3Q7XG4gICAgICAgIHRoaXMucmlnaHQgPSByaWdodDtcbiAgICAgICAgaWYgKCFsaXN0IHx8ICFyaWdodCB8fCAhbGlzdC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCB8fCBnZXRDb21wdXRlZFN0eWxlKGxpc3QpLnZpc2liaWxpdHkgIT09ICd2aXNpYmxlJykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGZpbmlzaGVkID0gbmV3IFNldChPYmplY3QudmFsdWVzKHdpbmRvdy5jb250ZXN0cz8uZmluaXNoZWQgfHwge30pXG4gICAgICAgICAgICAuZmlsdGVyKGNvbnRlc3QgPT4gY29udGVzdD8uaWRfY29udGVzdCAhPSBudWxsKS5tYXAoY29udGVzdCA9PiBTdHJpbmcoY29udGVzdC5pZF9jb250ZXN0KSkpO1xuICAgICAgICBmb3IgKGNvbnN0IGVuZGVkIG9mIGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlc3QuZW5kZWQsIC5jb250ZXN0X2hlYWRlci5lbmRlZCcpKSB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IGVuZGVkLmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKGlkKSBmaW5pc2hlZC5hZGQoaWQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbnRlc3RzID0gdGhpcy5nZXRDb250ZXN0cyhsaXN0LCBmaW5pc2hlZCk7XG4gICAgICAgIHRoaXMuY2xlYXJFeHBpcmVkUGluKGxpc3QsIGNvbnRlc3RzLCBmaW5pc2hlZCk7XG4gICAgICAgIHRoaXMudXBkYXRlUGlucyhsaXN0LCBjb250ZXN0cyk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVwb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy5yZXBvc2l0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc3RhcnR1cFBlbmRpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuZ2V0VGFyZ2V0KGNvbnRlc3RzKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXQpIHRoaXMub3BlbkNvbnRlc3QobGlzdCwgcmlnaHQsIHRhcmdldCk7XG4gICAgICAgICAgICBlbHNlIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnICYmICF0aGlzLnByZWZlcmVuY2UpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHJpZ2h0LCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBjb25zdCBwaW4gPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RTdGFydElkJyk7XG4gICAgICAgIHRoaXMucHJlZmVyZW5jZSA9ICgodHlwZW9mIHBpbiA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHBpbiA9PT0gJ251bWJlcicpICYmIHBpbikgPyBTdHJpbmcocGluKSA6ICcnO1xuICAgICAgICB0aGlzLnN0YXJ0dXBQZW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kZWZhdWx0cyA9IHJlYWRDb250ZXN0RGVmYXVsdHMoKTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IHsgc2lnbmFsIH0gPSB0aGlzLmxpc3RlbmVycztcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKG11dGF0aW9ucyA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlc3RzIC5sZWZ0X3BhcnQgLnNjcm9sbF9hcmVhJyk7XG4gICAgICAgICAgICBjb25zdCByaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZXN0cyAucmlnaHRfcGFydCcpO1xuICAgICAgICAgICAgaWYgKGxpc3QgIT09IHRoaXMubGlzdCB8fCByaWdodCAhPT0gdGhpcy5yaWdodCB8fCBtdXRhdGlvbnMuc29tZSgoeyB0YXJnZXQgfSkgPT5cbiAgICAgICAgICAgICAgICAobGlzdCAmJiAobGlzdC5jb250YWlucyh0YXJnZXQpIHx8IHRhcmdldC5jb250YWlucyhsaXN0KSkpIHx8XG4gICAgICAgICAgICAgICAgKHJpZ2h0ICYmIChyaWdodC5jb250YWlucyh0YXJnZXQpIHx8IHRhcmdldC5jb250YWlucyhyaWdodCkpKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcycsICdzdHlsZScsICdoaWRkZW4nLCAnaWRfY29udGVzdCddIH0pO1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB0aGlzLnJlZnJlc2goKSwgeyBvbmNlOiB0cnVlLCBzaWduYWwgfSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkICYmIGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgdGhpcy5yaWdodCAmJiB0aGlzLmxpc3Q/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkgJiZcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQuY2xvc2VzdCgnLmNvbnRlc3RfaGVhZGVyJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQodGhpcy5yaWdodCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHsgY2FwdHVyZTogdHJ1ZSwgc2lnbmFsIH0pO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxuXG4gICAgdGVhckRvd24oKSB7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnM/LmFib3J0KCk7XG4gICAgICAgIHRoaXMuc3RvcEp1bXA/LigpO1xuICAgICAgICB0aGlzLnN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGlzdD8ucXVlcnlTZWxlY3RvckFsbCgnLmphcnZpcy1jb250ZXN0LXBpbiwgLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKS5mb3JFYWNoKGNvbnRyb2wgPT4gY29udHJvbC5yZW1vdmUoKSk7XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0KSB0aGlzLnNob3dMZWFkZXJib2FyZCh0aGlzLnJpZ2h0LCBudWxsKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gZmFsc2U7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuZXhwb3J0IGNsYXNzIExlYWd1ZVRvcDIwIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xlYWd1ZVRvcDIwJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlByb21vdGlvbiB0YXJnZXRcIiwgXCJTaG93IHRoZSBwb2ludHMgbmVlZGVkIHRvIHJlYWNoIHRoZSBsYXJnZXIgb2YgdGhlIHRvcCAyMCBvciB0b3AgMTUlIGJlbG93IHRoZSBoaWdoZXN0IGxlYWd1ZSB0aWVyLlwiKVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZXMuaHRtbCcpO1xuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoJy5zY3JpcHRMZWFndWVJbmZvJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY3JpcHRMZWFndWVJbmZvJyk7XG4gICAgICAgICAgICBpZiAoIXN1bW1hcnkgfHwgc3VtbWFyeS5xdWVyeVNlbGVjdG9yKCcuamFydmlzVG9wMjAnKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCB7IG9wcG9uZW50c19saXN0LCBjdXJyZW50X3RpZXJfbnVtYmVyLCBtYXhfbGVhZ3VlIH0gPSB3aW5kb3c7XG4gICAgICAgICAgICBjb25zdCB0aWVyID0gTnVtYmVyKGN1cnJlbnRfdGllcl9udW1iZXIpO1xuICAgICAgICAgICAgaWYgKCEodGllciA+IDAgJiYgdGllciA8IE51bWJlcihtYXhfbGVhZ3VlKSkpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGhlcm9JZCA9ICh3aW5kb3cuc2hhcmVkPy5IZXJvIHx8IHdpbmRvdy5IZXJvKT8uaW5mb3M/LmlkO1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG9wcG9uZW50c19saXN0KSB8fCBoZXJvSWQgPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBvcHBvbmVudHNfbGlzdC5maW5kKCh7IHBsYXllciB9KSA9PiBTdHJpbmcocGxheWVyPy5pZF9maWdodGVyKSA9PT0gU3RyaW5nKGhlcm9JZCkpO1xuICAgICAgICAgICAgY29uc3QgcmFuayA9IE51bWJlcihwbGF5ZXI/LnBsYWNlKTtcbiAgICAgICAgICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihyYW5rKSB8fCByYW5rIDwgMSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBicmFja2V0U2l6ZSA9IG9wcG9uZW50c19saXN0Lmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IHByb21vdGlvblJhbmsgPSBNYXRoLm1heCgyMCwgTWF0aC5jZWlsKGJyYWNrZXRTaXplICogMTUgLyAxMDApKTtcbiAgICAgICAgICAgIGNvbnN0IGluUHJvbW90aW9uID0gcmFuayA8PSBwcm9tb3Rpb25SYW5rO1xuICAgICAgICAgICAgY29uc3QgY29tcGFyaXNvblJhbmsgPSBpblByb21vdGlvbiA/IHByb21vdGlvblJhbmsgKyAxIDogcHJvbW90aW9uUmFuaztcbiAgICAgICAgICAgIGNvbnN0IGN1dG9mZiA9IG9wcG9uZW50c19saXN0LmZpbmQoKHsgcGxhY2UgfSkgPT4gTnVtYmVyKHBsYWNlKSA9PT0gY29tcGFyaXNvblJhbmspO1xuICAgICAgICAgICAgaWYgKHBsYXllcj8ucGxheWVyX2xlYWd1ZV9wb2ludHMgPT0gbnVsbCB8fCBjdXRvZmY/LnBsYXllcl9sZWFndWVfcG9pbnRzID09IG51bGwpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3Qgc2NvcmUgPSBOdW1iZXIocGxheWVyLnBsYXllcl9sZWFndWVfcG9pbnRzKTtcbiAgICAgICAgICAgIGNvbnN0IGN1dG9mZlNjb3JlID0gTnVtYmVyKGN1dG9mZi5wbGF5ZXJfbGVhZ3VlX3BvaW50cyk7XG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShzY29yZSkgfHwgIU51bWJlci5pc0Zpbml0ZShjdXRvZmZTY29yZSkpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgZm9ybWF0ID0gbmV3IEludGwuTnVtYmVyRm9ybWF0KCk7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBpblByb21vdGlvbiA/IGN1dG9mZlNjb3JlIDogY3V0b2ZmU2NvcmUgKyAxO1xuICAgICAgICAgICAgY29uc3QgZGlmZmVyZW5jZSA9IGluUHJvbW90aW9uID8gc2NvcmUgLSB0YXJnZXQgOiB0YXJnZXQgLSBzY29yZTtcbiAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSBgVG9wICR7cHJvbW90aW9uUmFua30gaXMgdGhlIHByb21vdGlvbiB0YXJnZXQuIFRoZSBjdXRvZmYgaXMgdGhlIGxhcmdlciBvZiAyMCBwbGFjZXMgb3IgMTUlIG9mICR7Zm9ybWF0LmZvcm1hdChicmFja2V0U2l6ZSl9IHBsYXllcnMsIHJvdW5kZWQgdXAuYDtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmlzb24gPSBpblByb21vdGlvblxuICAgICAgICAgICAgICAgID8gYFJhbmsgJHtjb21wYXJpc29uUmFua30gaGFzICR7Zm9ybWF0LmZvcm1hdCh0YXJnZXQpfSBwb2ludHMuIFlvdXIgbGVhZCBpcyAke2Zvcm1hdC5mb3JtYXQoZGlmZmVyZW5jZSl9IHBvaW50cy5gXG4gICAgICAgICAgICAgICAgOiBgWW91IG5lZWQgJHtmb3JtYXQuZm9ybWF0KHRhcmdldCl9IHBvaW50cyB0byBwYXNzIHJhbmsgJHtjb21wYXJpc29uUmFua30uYDtcbiAgICAgICAgICAgIGNvbnN0IHRvb2x0aXAgPSBgJHtydWxlfSAke2NvbXBhcmlzb259YDtcblxuICAgICAgICAgICAgY29uc3QgZW50cnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICBlbnRyeS5jbGFzc05hbWUgPSAnamFydmlzVG9wMjAnO1xuICAgICAgICAgICAgZW50cnkuc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIHRvb2x0aXApO1xuICAgICAgICAgICAgZW50cnkuc2V0QXR0cmlidXRlKCd0b29sdGlwJywgJycpO1xuICAgICAgICAgICAgZW50cnkuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgdG9vbHRpcCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGJhZGdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgYmFkZ2UuY2xhc3NOYW1lID0gJ3NjcmlwdExlYWd1ZUluZm9JY29uJztcbiAgICAgICAgICAgIGJhZGdlLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjMzc2OWJhJztcbiAgICAgICAgICAgIGJhZGdlLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgICAgICAgICAgYmFkZ2UudGV4dENvbnRlbnQgPSBTdHJpbmcocHJvbW90aW9uUmFuayk7XG4gICAgICAgICAgICBlbnRyeS5hcHBlbmQoYmFkZ2UsIGAke2RpZmZlcmVuY2UgPT09IDAgPyAnJyA6IGluUHJvbW90aW9uID8gJy0nIDogJysnfSR7Zm9ybWF0LmZvcm1hdChNYXRoLmFicyhkaWZmZXJlbmNlKSl9YCk7XG4gICAgICAgICAgICBzdW1tYXJ5Lmluc2VydEJlZm9yZShlbnRyeSwgc3VtbWFyeS5xdWVyeVNlbGVjdG9yKCcubWluVG9wMzAsIC5wcm9tb3Rpb25JbmZvJykpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuZXhwb3J0IGNsYXNzIFJlbW92ZVBhc3NMb2NrIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc2VsZWN0b3JUb0ZpbmQgPSAnLmxvY2tfeWVsbG93X2ljbic7XG4gICAgcHJpdmF0ZSByZWFkb25seSBjbGFzc1RvUmVtb3ZlID0gJ2xvY2tfeWVsbG93X2ljbic7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdyZW1vdmVQYXNzTG9jaydcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUGFzcyBsb2NrIGljb25zXCIsIFwiSGlkZSBsb2NrIGljb25zIG9uIHJld2FyZCBwYXNzZXMgc28gdGhlIHJld2FyZHMgYXJlIGVhc2llciB0byByZWFkLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ3BvdicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUGF0aCBvZiBWYWxvclwiLCBcIkhpZGUgbG9jayBpY29ucyBvbiB0aGUgUGF0aCBvZiBWYWxvciBwYXNzZXMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdwb2cnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlBhdGggb2YgR2xvcnlcIiwgXCJIaWRlIGxvY2sgaWNvbnMgb24gdGhlIFBhdGggb2YgR2xvcnkgcGFzc2VzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtdmFsb3IuaHRtbCcpIHx8IGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi1nbG9yeS5odG1sJylcbiAgICB9XG5cbiAgICBvYnNlcnZlVW50aWwoc2VsZWN0b3I6IHN0cmluZywgY2FsbGJhY2s6IChlbGVtZW50czogTm9kZUxpc3RPZjxFbGVtZW50PikgPT4gdm9pZCwgeyBvbmNlID0gdHJ1ZSwgdGltZW91dCA9IDUwMDAgfSA9IHt9KSB7XG4gICAgICAgIGxldCB0aW1lcjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICBpZiAoZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlbGVtZW50cyk7XG4gICAgICAgICAgICBpZiAob25jZSkgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChvbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVyKSBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlbGVtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUgfSk7XG5cbiAgICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZSh0aW1lb3V0KSAmJiB0aW1lb3V0ID4gMCkge1xuICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yOiBzdHJpbmcsIGNsYXNzVG9SZW1vdmU6IHN0cmluZywgeyBvbmNlID0gdHJ1ZSwgdGltZW91dCA9IDUwMDAgfSA9IHt9KSB7XG4gICAgICAgIHRoaXMub2JzZXJ2ZVVudGlsKHNlbGVjdG9yLCAoZWxlbWVudHMpID0+IHtcbiAgICAgICAgICAgIGVsZW1lbnRzLmZvckVhY2goZWwgPT4gZWwuY2xhc3NMaXN0LnJlbW92ZShjbGFzc1RvUmVtb3ZlKSk7XG4gICAgICAgIH0sIHsgdGltZW91dCwgb25jZSB9KTtcbiAgICB9XG5cbiAgICBydW4oeyBwb3YsIHBvZyB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi12YWxvci5odG1sJykgJiYgcG92KSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKHRoaXMuc2VsZWN0b3JUb0ZpbmQsIHRoaXMuY2xhc3NUb1JlbW92ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLWdsb3J5Lmh0bWwnKSAmJiBwb2cpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUodGhpcy5zZWxlY3RvclRvRmluZCwgdGhpcy5jbGFzc1RvUmVtb3ZlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0R2lybERpY3Rpb25hcnkoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZ2V0R2lybERpY3Rpb25hcnkoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IGxvYWQgdGhlIEhIKysgZ2lybCBkaWN0aW9uYXJ5OicsIGVycik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgZ2V0R2lybERpY3Rpb25hcnkgfSBmcm9tICcuL2dhbWVEYXRhJztcblxuZXhwb3J0IGNsYXNzIExvdmVSYWlkc0FkZG9uIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcmFyaXR5Q29sb3JzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnbG92ZVJhaWRzQWRkb24nXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkxvdmUgUmFpZHMgZGlzcGxheVwiLCBcIkN1c3RvbWl6ZSBuYW1lcywgaWNvbnMsIGFuZCBwb3NlcyBvbiBMb3ZlIFJhaWQgY2FyZHMuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAncmFpZF9pZCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUmFpZCBJRHNcIiwgXCJBZGQgdGhlIHJhaWQgSUQgYmVmb3JlIGl0cyBuYW1lLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ25hbWVzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJIaWRkZW4gZ2lybCBuYW1lc1wiLCBcIlNob3cgdGhlIG5hbWUgb24gY2FyZHMgdGhhdCB1c2UgYSBteXN0ZXJpb3VzIGdpcmwgbGFiZWwuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdza2luJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJTa2luIGluZGljYXRvclwiLCBcIk1hcmsgY2FyZHMgdGhhdCBpbmNsdWRlIGEgZ2lybCB3aXRoIGEgc2tpbi5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2NvbG9yJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJSYXJpdHkgY29sb3JzXCIsIFwiQ29sb3IgdGhlIHJhaWQgbmFtZSBiYXNlZCBvbiB0aGUgZ2lybOKAmXMgcmFyaXR5LlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnZmlnaHRfaWNvbicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiRmlnaHQgaWNvblwiLCBcIlVzZSB0aGUgY2xlYXJlciBmaWdodC1lbmVyZ3kgaWNvbi5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ3NoYWRvd3MnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlVuc2hhZG93ZWQgcG9zZXNcIiwgXCJTaG93IHRoZSBub3JtYWwgYXJ0d29yayBpbiBwbGFjZSBvZiBzaGFkb3cgcG9zZXMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuXG4gICAgICAgIHRoaXMucmFyaXR5Q29sb3JzID0ge1xuICAgICAgICAgICAgcmFyZTogJ0xpbWVHcmVlbicsXG4gICAgICAgICAgICBlcGljOiAnR29sZCcsXG4gICAgICAgICAgICBsZWdlbmRhcnk6ICdNZWRpdW1PcmNoaWQnXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sb3ZlLXJhaWRzLmh0bWwnKVxuICAgIH1cblxuICAgIGFzeW5jIHJ1bih7IHJhaWRfaWQsIHNraW4sIG5hbWVzLCBjb2xvciwgZmlnaHRfaWNvbiwgc2hhZG93cyB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgY29uc3QgcmFpZHMgPSAodHlwZW9mIGxvdmVfcmFpZHMgIT09ICd1bmRlZmluZWQnICYmIEFycmF5LmlzQXJyYXkobG92ZV9yYWlkcykpID8gbG92ZV9yYWlkcyA6IFtdO1xuICAgICAgICBpZiAoIXJhaWRzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcblxuICAgICAgICBjb25zdCBnaXJsRGljdCA9IGF3YWl0IGdldEdpcmxEaWN0aW9uYXJ5KCk7XG4gICAgICAgIGNvbnN0IHJhaWRzQnlJZCA9IG5ldyBNYXAocmFpZHMubWFwKHJhaWQgPT4gW1N0cmluZyhyYWlkLmlkX3JhaWQpLCByYWlkXSkpO1xuXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYWlkLWNhcmRbaWRfcmFpZF0nKS5mb3JFYWNoKHJhaWRDYXJkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJhaWQgPSByYWlkc0J5SWQuZ2V0KHJhaWRDYXJkLmdldEF0dHJpYnV0ZSgnaWRfcmFpZCcpID8/ICcnKTtcbiAgICAgICAgICAgIGlmICghcmFpZCB8fCByYWlkLmlkX2dpcmwgPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCB7IG5hbWUsIHJhcml0eSwgc2hhcmRzID0gMCB9ID0gZ2lybERpY3Q/LmdldChTdHJpbmcocmFpZC5pZF9naXJsKSkgfHwge307XG4gICAgICAgICAgICBjb25zdCBoYXJlbUxpbmsgPSB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmdldEhyZWYoYC9jaGFyYWN0ZXJzLyR7cmFpZC5pZF9naXJsfWApO1xuICAgICAgICAgICAgY29uc3QgcmFpZE5hbWVFbGVtID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcignLnJhaWQtbmFtZSA+IHNwYW4gPiBzcGFuJyk7XG4gICAgICAgICAgICBjb25zdCBuYW1lX2xhYmVsID0gKG5hbWVzICYmIG5hbWUpIHx8IHJhaWROYW1lRWxlbT8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCByYWlkLmV2ZW50X25hbWUgfHwgcmFpZC5naXJsX2RhdGE/Lm5hbWUgfHwgJyc7XG4gICAgICAgICAgICBjb25zdCByYWlkX2lkX2xhYmVsID0gcmFpZF9pZCA/IGAoJHtyYWlkLmlkX3JhaWR9KWAgOiAnJztcbiAgICAgICAgICAgIGNvbnN0IHNraW5fbGFiZWwgPSAoc2tpbiAmJiBBcnJheS5pc0FycmF5KHJhaWQ/LmdpcmxfZGF0YT8uZ3JhZGVfc2tpbnMpICYmIHJhaWQuZ2lybF9kYXRhLmdyYWRlX3NraW5zLmxlbmd0aCA+IDApID8gJ/CfkZknIDogJyc7XG5cbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlQYXJ0cyA9IFtdO1xuICAgICAgICAgICAgaWYgKHJhaWRfaWQpIGRpc3BsYXlQYXJ0cy5wdXNoKHJhaWRfaWRfbGFiZWwpO1xuICAgICAgICAgICAgZGlzcGxheVBhcnRzLnB1c2gobmFtZV9sYWJlbCk7XG4gICAgICAgICAgICBpZiAoc2tpbikgZGlzcGxheVBhcnRzLnB1c2goc2tpbl9sYWJlbCk7XG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5TGFiZWwgPSBkaXNwbGF5UGFydHMuam9pbignICcpLnRyaW0oKTtcblxuICAgICAgICAgICAgaWYgKHJhaWROYW1lRWxlbSAmJiBkaXNwbGF5TGFiZWwpIHtcbiAgICAgICAgICAgICAgICByYWlkTmFtZUVsZW0udGV4dENvbnRlbnQgPSBkaXNwbGF5TGFiZWw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG9iamVjdGl2ZXMgPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yQWxsKCcuY2xhc3NpYy1naXJsJyk7XG4gICAgICAgICAgICBjb25zdCBnaXJsID0gb2JqZWN0aXZlc1swXTtcbiAgICAgICAgICAgIGlmIChnaXJsKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ2lybE5hbWVFbGVtID0gZ2lybC5xdWVyeVNlbGVjdG9yKCcuZ2lybC1uYW1lJyk7XG4gICAgICAgICAgICAgICAgaWYgKGdpcmxOYW1lRWxlbSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGluayA9IGdpcmxOYW1lRWxlbS5xdWVyeVNlbGVjdG9yKCdhJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbGluaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsuY2xhc3NOYW1lID0gJ2hoLWdpcmwtbGluayc7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoZ2lybE5hbWVFbGVtLmZpcnN0Q2hpbGQpIGxpbmsuYXBwZW5kQ2hpbGQoZ2lybE5hbWVFbGVtLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2lybE5hbWVFbGVtLmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5TGFiZWwpIGxpbmsudGV4dENvbnRlbnQgPSBkaXNwbGF5TGFiZWw7XG4gICAgICAgICAgICAgICAgICAgIGxpbmsuaHJlZiA9IGhhcmVtTGluaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoc2hhcmRzID09PSAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2JqRWxlbSA9IGdpcmwucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5vYmplY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iakVsZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iakVsZW0uaW5uZXJUZXh0ID0gYEknbSBhbHJlYWR5IGF0dHJhY3RlZCB0byB5b3UuIEZpbmQgbWUgaW4geW91ciBIYXJlbSFgO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY29sb3IgJiYgcmFyaXR5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmFpZE5hbWVDb250YWluZXIgPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLnJhaWQtbmFtZScpO1xuICAgICAgICAgICAgICAgIGlmIChyYWlkTmFtZUNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgICAgICByYWlkTmFtZUNvbnRhaW5lci5zdHlsZS5jb2xvciA9IHRoaXMucmFyaXR5Q29sb3JzW3Jhcml0eV0gfHwgJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZmlnaHRfaWNvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpZ2h0SWNvbiA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcuaHVkQmF0dGxlUHRzX21peF9pY24nKTtcbiAgICAgICAgICAgICAgICBpZiAoZmlnaHRJY29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpZ2h0SWNvbi5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKC9pbWFnZXMvcGljdHVyZXMvZGVzaWduL2ljX2VuZXJneV9maWdodC5wbmcpJztcbiAgICAgICAgICAgICAgICAgICAgZmlnaHRJY29uLnN0eWxlLmJhY2tncm91bmRTaXplID0gJzI0cHgnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNoYWRvd3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsZWZ0SW1hZ2UgPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxJbWFnZUVsZW1lbnQ+KCcuZ2lybC1pbWcubGVmdCcpO1xuICAgICAgICAgICAgICAgIGlmIChsZWZ0SW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdEltYWdlLnNyYyA9IGxlZnRJbWFnZS5zcmMucmVwbGFjZSgnLWJsYWNrJywgJycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmFpZENhcmQuY2xhc3NMaXN0LmNvbnRhaW5zKCdtdWx0aXBsZS1naXJsJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRJbWFnZSA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEltYWdlRWxlbWVudD4oJy5naXJsLWltZy5yaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmlnaHRJbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmlnaHRJbWFnZS5zcmMgPSByaWdodEltYWdlLnNyYy5yZXBsYWNlKCdhdmIwLnBuZycsICdncmFkZV9za2lucy9ncmFkZV9za2luMS5wbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0SW1hZ2Uuc3JjID0gcmlnaHRJbWFnZS5zcmMucmVwbGFjZSgnLWJsYWNrJywgJycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5leWUnKS5mb3JFYWNoKGUgPT4gZS5yZW1vdmUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgdHlwZSB7IEdpcmxEYXRhLCBMb3ZlUmFpZCB9IGZyb20gJy4uLy4uL2dhbWUtdHlwZXMnO1xuaW1wb3J0IHsgbHNHZXQsIGxzU2V0LCBsc1JtIH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5pbXBvcnQgeyBnZXRHaXJsRGljdGlvbmFyeSB9IGZyb20gJy4vZ2FtZURhdGEnO1xuXG50eXBlIFJhaWRDb3B5QnV0dG9uID0gSFRNTERpdkVsZW1lbnQgJiB7IF9ib3VuZENvcHlLZXlIYW5kbGVyPzogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB2b2lkIH07XG5cbmV4cG9ydCBjbGFzcyBMb3ZlUmFpZHNQYXJzZXIgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBnaXJsRGljdDogUmVhZG9ubHlNYXA8c3RyaW5nLCBHaXJsRGF0YT4gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIF9ib3VuZEluc2VydEJ1dHRvbj86ICgpID0+IHZvaWQ7XG5cbiAgICAvKlxuICAgICogUmFpZCBJRCwgQW5ub3VuY2VtZW50IFR5cGUsIEJhY2tncm91bmQgSUQsIEV2ZW50IE5hbWUsIFN0YXJ0IERhdGV0aW1lLFxuICAgICogRW5kIERhdGV0aW1lLCBEdXJhdGlvbiwgUmFpZCBTdGF0dXMsIFNvdXJjZSwgR2lybCBJRCxcbiAgICAqIEdpcmwgTmFtZSwgUmFyaXR5LCBNYXggR3JhZGUsIEZpcnN0IEFwcGVhcmFuY2UsIFNvdXJjZSBJRCxcbiAgICAqIEhhcyBTa2luKHMpXG4gICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdsb3ZlUmFpZHNQYXJzZXInXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkxvdmUgUmFpZHMgZXhwb3J0XCIsIFwiQWRkIGEgYnV0dG9uIHRvIGNvcHkgbmV3IHJhaWRzIGluIGEgc3ByZWFkc2hlZXQtcmVhZHkgZm9ybWF0LlwiKVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xvdmUtcmFpZHMuaHRtbCcpXG4gICAgfVxuXG4gICAgY2FwaXRhbGl6ZUZpcnN0KHN0cjogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBzdHIgPyBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSkgOiBzdHI7XG4gICAgfVxuXG4gICAgZ2V0QW5ub3VuY2VtZW50VHlwZSh0eXBlOiBMb3ZlUmFpZFsnaWRfYW5ub3VuY2VtZW50X3R5cGUnXSkge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIFwiRnVsbFwiO1xuICAgICAgICAgICAgY2FzZSAyOiByZXR1cm4gXCJQYXJ0aWFsXCI7XG4gICAgICAgICAgICBjYXNlIDM6IHJldHVybiBcIk5vbmVcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBcIlVua25vd25cIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFNvdXJjZUlEKGV2ZW50OiBMb3ZlUmFpZCkge1xuICAgICAgICBjb25zdCBzb3VyY2VfaWQgPSBOdW1iZXIoZXZlbnQucmFpZF9tb2R1bGVfcGspO1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LnJhaWRfbW9kdWxlX3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NlYXNvbic6IHJldHVybiAwO1xuICAgICAgICAgICAgY2FzZSAnY2hhbXBpb24nOiByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHNvdXJjZV9pZCkgPyBzb3VyY2VfaWQgOiAtMjtcbiAgICAgICAgICAgIGNhc2UgJ3Ryb2xsJzogcmV0dXJuIE51bWJlci5pc0Zpbml0ZShzb3VyY2VfaWQpID8gc291cmNlX2lkICsgMTAgOiAtMjtcbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdpcmxIYXNTa2lucyhldmVudDogTG92ZVJhaWQpIHtcbiAgICAgICAgY29uc3QgaGFzU2tpbnMgPSBBcnJheS5pc0FycmF5KGV2ZW50Py5naXJsX2RhdGE/LmdyYWRlX3NraW5zKSAmJiBldmVudC5naXJsX2RhdGEuZ3JhZGVfc2tpbnMubGVuZ3RoID4gMDtcbiAgICAgICAgaWYgKGhhc1NraW5zKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJYXCI7XG4gICAgICAgIH0gZWxzZSByZXR1cm4gXCJPXCI7XG4gICAgfVxuXG4gICAgZm9ybWF0RXZlbnRSb3coZXZlbnQ6IExvdmVSYWlkKSB7XG4gICAgICAgIGNvbnN0IGR1cmF0aW9uSG91cnMgPSBNYXRoLmZsb29yKE51bWJlcihldmVudC5ldmVudF9kdXJhdGlvbl9zZWNvbmRzKSAvIDM2MDApO1xuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGAke2R1cmF0aW9uSG91cnN9IGhvdXJzYDtcblxuICAgICAgICBjb25zdCBnaXJsID0gdGhpcy5naXJsRGljdD8uZ2V0KFN0cmluZyhldmVudC5pZF9naXJsKSkgfHwge307XG4gICAgICAgIGNvbnN0IHsgbmFtZSA9ICdVbmtub3duJywgcmFyaXR5ID0gJ04vQScsIGdyYWRlID0gMCB9ID0gZ2lybDtcblxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgZXZlbnQuaWRfcmFpZCxcbiAgICAgICAgICAgIHRoaXMuZ2V0QW5ub3VuY2VtZW50VHlwZShldmVudC5pZF9hbm5vdW5jZW1lbnRfdHlwZSksXG4gICAgICAgICAgICBldmVudC5iYWNrZ3JvdW5kX2lkLFxuICAgICAgICAgICAgZXZlbnQuZXZlbnRfbmFtZSxcbiAgICAgICAgICAgIGV2ZW50LnN0YXJ0X2RhdGV0aW1lLFxuICAgICAgICAgICAgZXZlbnQuZW5kX2RhdGV0aW1lLFxuICAgICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgICAgICBldmVudC5zdGF0dXMsXG4gICAgICAgICAgICBldmVudC5yYWlkX21vZHVsZV90eXBlLFxuICAgICAgICAgICAgZXZlbnQuaWRfZ2lybCxcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICB0aGlzLmNhcGl0YWxpemVGaXJzdChyYXJpdHkpLFxuICAgICAgICAgICAgZ3JhZGUsXG4gICAgICAgICAgICBcIlwiLCAvLyBvbmUgYmxhbmsgdGFiIHJlc2VydmVkIGZvciBmaXJzdCBhcHBlYXJhbmNlIGluIEdTaGVldHNcbiAgICAgICAgICAgIHRoaXMuZ2V0U291cmNlSUQoZXZlbnQpLFxuICAgICAgICAgICAgdGhpcy5naXJsSGFzU2tpbnMoZXZlbnQpXG4gICAgICAgIF0uam9pbihcIlxcdFwiKTtcbiAgICB9XG5cbiAgICBhc3luYyBjb3B5VG9DbGlwYm9hcmQodGV4dDogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQ2xpcGJvYXJkIEFQSSBmYWlsZWQsIHVzaW5nIGV4ZWNDb21tYW5kIGZhbGxiYWNrOicsIGVycik7XG4gICAgICAgICAgICBjb25zdCB0ZXh0YXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyk7XG4gICAgICAgICAgICB0ZXh0YXJlYS52YWx1ZSA9IHRleHQ7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRleHRhcmVhKTtcbiAgICAgICAgICAgIHRleHRhcmVhLnNlbGVjdCgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGV4dGFyZWEucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBoYW5kbGVDb3B5Q2xpY2soZXZ0OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHN0b3JhZ2VLZXkgPSAnTGFzdFNhdmVkUmFpZElEJztcblxuICAgICAgICAvLyBTaGlmdCArIEN0cmwgKyBDbGljayDihpIgY2xlYXIgc3RvcmVkIElEXG4gICAgICAgIGlmIChldnQuc2hpZnRLZXkgJiYgZXZ0LmN0cmxLZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpcm1DbGVhciA9IGNvbmZpcm0oJ+KaoO+4jyBEbyB5b3Ugd2FudCB0byBjbGVhciB0aGUgc2F2ZWQgbGFzdCByYWlkIElEIGZvciB0aGlzIHNpdGU/Jyk7XG4gICAgICAgICAgICBpZiAoY29uZmlybUNsZWFyKSB7XG4gICAgICAgICAgICAgICAgbHNSbShzdG9yYWdlS2V5KTtcbiAgICAgICAgICAgICAgICBhbGVydCgn4pyFIExhc3Qgc2F2ZWQgSUQgY2xlYXJlZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvYWQgcmFpZHNcbiAgICAgICAgY29uc3QgbG9jYWxMb3ZlUmFpZHMgPSAodHlwZW9mIGxvdmVfcmFpZHMgIT09ICd1bmRlZmluZWQnICYmIEFycmF5LmlzQXJyYXkobG92ZV9yYWlkcykpID8gbG92ZV9yYWlkcyA6IFtdO1xuICAgICAgICBpZiAoIWxvY2FsTG92ZVJhaWRzLmxlbmd0aCkge1xuICAgICAgICAgICAgYWxlcnQoJ+KaoO+4jyBObyBsb3ZlX3JhaWRzIGZvdW5kIG9uIHRoaXMgcGFnZS4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5naXJsRGljdCkge1xuICAgICAgICAgICAgYWxlcnQoJ+KaoO+4jyBUaGUgSEgrKyBnaXJsIGRpY3Rpb25hcnkgY291bGQgbm90IGJlIGxvYWRlZC4gUmVsb2FkIHRoZSBwYWdlIGFuZCB0cnkgYWdhaW4uJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbGFzdFNhdmVkSWROdW1iZXIgPSBwYXJzZUludChTdHJpbmcobHNHZXQoc3RvcmFnZUtleSkpLCAxMCk7XG5cbiAgICAgICAgLy8gSWYgU2hpZnQgaXMgaGVsZCBPUiBubyBzYXZlZCBJRCBleGlzdHMg4oaSIGFzayBhZ2FpblxuICAgICAgICBpZiAoaXNOYU4obGFzdFNhdmVkSWROdW1iZXIpIHx8IGV2dC5zaGlmdEtleSkge1xuICAgICAgICAgICAgY29uc3QgbGFzdFNhdmVkSWQgPSBwcm9tcHQoJ1BsZWFzZSBlbnRlciB0aGUgbGFzdCBzYXZlZCBJRDonKTtcbiAgICAgICAgICAgIGxhc3RTYXZlZElkTnVtYmVyID0gcGFyc2VJbnQoU3RyaW5nKGxhc3RTYXZlZElkKSwgMTApO1xuXG4gICAgICAgICAgICBpZiAoaXNOYU4obGFzdFNhdmVkSWROdW1iZXIpKSB7XG4gICAgICAgICAgICAgICAgYWxlcnQoJ+KdjCBJbnZhbGlkIElEIGVudGVyZWQuIFBsZWFzZSBlbnRlciBhIHZhbGlkIG51bWJlci4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaWx0ZXIgbmV3IGV2ZW50c1xuICAgICAgICBjb25zdCBmaWx0ZXJlZERhdGEgPSBsb2NhbExvdmVSYWlkcy5maWx0ZXIoZXZlbnQgPT4gTnVtYmVyKGV2ZW50LmlkX3JhaWQpID4gbGFzdFNhdmVkSWROdW1iZXIpO1xuICAgICAgICBpZiAoIWZpbHRlcmVkRGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFsZXJ0KGDihLnvuI8gTm8gbmV3IGV2ZW50cyBmb3VuZCB3aXRoIElEIGdyZWF0ZXIgdGhhbiAke2xhc3RTYXZlZElkTnVtYmVyfWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZm9ybWF0dGVkRGF0YSA9IGZpbHRlcmVkRGF0YS5tYXAodGhpcy5mb3JtYXRFdmVudFJvdy5iaW5kKHRoaXMpKS5qb2luKFwiXFxuXCIpO1xuXG4gICAgICAgIGlmICghYXdhaXQgdGhpcy5jb3B5VG9DbGlwYm9hcmQoZm9ybWF0dGVkRGF0YSkpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfinYwgQ291bGQgbm90IGNvcHkgdGhlIHJhaWRzLiBUaGUgbGFzdCBzYXZlZCBJRCB3YXMga2VwdC4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNhdmUgaGlnaGVzdCBJRFxuICAgICAgICBjb25zdCBtYXhJZCA9IE1hdGgubWF4KC4uLmZpbHRlcmVkRGF0YS5tYXAoZSA9PiBOdW1iZXIoZS5pZF9yYWlkKSkpO1xuICAgICAgICBsc1NldChzdG9yYWdlS2V5LCBtYXhJZCk7XG5cbiAgICAgICAgYWxlcnQoJ+KchSBEYXRhIGNvcGllZCB0byBjbGlwYm9hcmQhIFlvdSBjYW4gbm93IHBhc3RlIGl0IGludG8gR1NoZWV0cy4nKTtcbiAgICB9XG5cbiAgICBjcmVhdGVDb3B5QnV0dG9uKCkge1xuICAgICAgICBjb25zdCBidXR0b246IFJhaWRDb3B5QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdyZW1pbmRlci1jb3B5Jyk7XG4gICAgICAgIGJ1dHRvbi5zdHlsZS5jc3NUZXh0ID0gYFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgIzAwYWFmZiAwLCAjMDA2Njg4IDUwJSwgIzAwNTU3NyA1MSUsICMwMGFhZmYgMTAwJSk7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgICAgICB3aWR0aDogMzJweDtcbiAgICAgICAgICAgIGhlaWdodDogMzJweDtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiAxMHB4O1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgcmlnaHQ6IDQuNXJlbTtcbiAgICAgICAgICAgIHRvcDogMC4ycmVtO1xuICAgICAgICAgICAgZm9udC1zaXplOiAxOHB4O1xuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDMycHg7XG4gICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kIDAuMnMgZWFzZTtcbiAgICAgICAgYDtcbiAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ/Cfk4snO1xuICAgICAgICBsZXQgYnV0dG9uVGl0bGUgPSAnQ2xpY2sgPSBjb3B5IG5ldyByYWlkcy4gU2hpZnQgLyBTaGlmdCArIEN0cmwgYXZhaWxhYmxlLic7XG4gICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3Rvb2x0aXAnLCAnJyk7XG4gICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuXG4gICAgICAgIGNvbnN0IF9ib3VuZENvcHlLZXlIYW5kbGVyID0gKGU6IEtleWJvYXJkRXZlbnQpID0+IHRoaXMudXBkYXRlQ29weUJ1dHRvbihlLCBidXR0b24pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIF9ib3VuZENvcHlLZXlIYW5kbGVyKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgX2JvdW5kQ29weUtleUhhbmRsZXIpO1xuICAgICAgICAvLyBzdG9yZSBoYW5kbGVyIHJlZmVyZW5jZSBzbyBjYWxsZXJzIGNhbiByZW1vdmUgbGlzdGVuZXJzIGlmIGJ1dHRvbiBpcyByZW1vdmVkIGxhdGVyXG4gICAgICAgIGJ1dHRvbi5fYm91bmRDb3B5S2V5SGFuZGxlciA9IF9ib3VuZENvcHlLZXlIYW5kbGVyO1xuICAgICAgICBidXR0b24ub25jbGljayA9IChlKSA9PiB0aGlzLmhhbmRsZUNvcHlDbGljayhlKTtcbiAgICAgICAgdGhpcy51cGRhdGVDb3B5QnV0dG9uKHsgc2hpZnRLZXk6IGZhbHNlLCBjdHJsS2V5OiBmYWxzZSB9LCBidXR0b24pO1xuICAgICAgICByZXR1cm4gYnV0dG9uO1xuICAgIH1cblxuICAgIHVwZGF0ZUNvcHlCdXR0b24oZTogUGljazxLZXlib2FyZEV2ZW50LCAnc2hpZnRLZXknIHwgJ2N0cmxLZXknPiwgYnV0dG9uOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBsZXQgYnV0dG9uVGl0bGUgPSAnJztcbiAgICAgICAgaWYgKGUuc2hpZnRLZXkgJiYgZS5jdHJsS2V5KSB7XG4gICAgICAgICAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgI2ZmNjY2NiAwLCAjYWEwMDAwIDEwMCUpXCI7IC8vIHJlZFxuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ/Cfl5HvuI8nO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnU2hpZnQgKyBDdHJsICsgQ2xpY2sgPSBjbGVhciBzYXZlZCBJRCc7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgI2ZmZGQ2NiAwLCAjY2M5OTAwIDEwMCUpXCI7IC8vIHllbGxvd1xuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ+Kcj++4jyc7XG4gICAgICAgICAgICBidXR0b25UaXRsZSA9ICdTaGlmdCArIENsaWNrID0gcHJvbXB0IGZvciBJRC4nO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgIzAwYWFmZiAwLCAjMDA2Njg4IDUwJSwgIzAwNTU3NyA1MSUsICMwMGFhZmYgMTAwJSlcIjsgLy8gZGVmYXVsdCBibHVlXG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAn8J+Tiyc7XG4gICAgICAgICAgICBidXR0b25UaXRsZSA9ICdDbGljayA9IGNvcHkgbmV3IHJhaWRzLiBTaGlmdCAvIFNoaWZ0ICsgQ3RybCBhdmFpbGFibGUuJztcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5zZXJ0QnV0dG9uKCkge1xuICAgICAgICBjb25zdCBub3RpZmljYXRpb25CdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnV0dG9uLW5vdGlmaWNhdGlvbi1hY3Rpb24ubm90aWZfYnV0dG9uX3MnKTtcbiAgICAgICAgaWYgKG5vdGlmaWNhdGlvbkJ1dHRvbiAmJiAhZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlbWluZGVyLWNvcHknKSkge1xuICAgICAgICAgICAgY29uc3QgY29weUJ1dHRvbiA9IHRoaXMuY3JlYXRlQ29weUJ1dHRvbigpO1xuICAgICAgICAgICAgbm90aWZpY2F0aW9uQnV0dG9uLnBhcmVudE5vZGU/Lmluc2VydEJlZm9yZShjb3B5QnV0dG9uLCBub3RpZmljYXRpb25CdXR0b24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgICAgIHRoaXMuZ2lybERpY3QgPSBhd2FpdCBnZXRHaXJsRGljdGlvbmFyeSgpO1xuXG4gICAgICAgIHRoaXMuX2JvdW5kSW5zZXJ0QnV0dG9uID0gdGhpcy5pbnNlcnRCdXR0b24uYmluZCh0aGlzKTtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHRoaXMuaW5zZXJ0QnV0dG9uKCk7XG4gICAgICAgIGVsc2Ugd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzLl9ib3VuZEluc2VydEJ1dHRvbiwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuXG5leHBvcnQgY2xhc3MgQWN0aXZpdHlQYXJzZXIgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnYWN0aXZpdHlQYXJzZXInXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIk1pc3Npb24gY29waWVyXCIsIFwiRW5hYmxlIHRoZSBjb3B5IHRvb2wgZm9yIGxlZ2VuZGFyeSBtaXNzaW9uIGRldGFpbHMuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAnbWlzc2lvbkNvcGllcicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTGVnZW5kYXJ5IGRldGFpbHNcIiwgXCJDbGljayBhIGxlZ2VuZGFyeSBtaXNzaW9u4oCZcyB0aXRsZSwgZGVzY3JpcHRpb24sIG9yIGltYWdlIHRvIGNvcHkgaXQuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2FjdGl2aXRpZXMuaHRtbCcpXG4gICAgfVxuXG4gICAgYXN5bmMgY29weVRvQ2xpcGJvYXJkKHRleHQ6IHN0cmluZykge1xuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgICAgY29uc3QgdG9hc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG9hc3QudGV4dENvbnRlbnQgPSAnQ29waWVkISc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICAgICAgdG9hc3Quc3R5bGUuYm90dG9tID0gJzEwcHgnO1xuICAgICAgICB0b2FzdC5zdHlsZS5yaWdodCA9ICcxMHB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUuYmFja2dyb3VuZCA9ICdyZ2JhKDAsMCwwLDAuNyknO1xuICAgICAgICB0b2FzdC5zdHlsZS5jb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnBhZGRpbmcgPSAnNXB4IDEwcHgnO1xuICAgICAgICB0b2FzdC5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNXB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUuekluZGV4ID0gJzk5OTknO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvYXN0KTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0b2FzdC5yZW1vdmUoKSwgMTAwMCk7XG4gICAgfVxuXG4gICAgcnVuKHsgbWlzc2lvbkNvcGllciB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgaWYgKG1pc3Npb25Db3BpZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJpZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWlzc2lvbl9lbnRyeS5sZWdlbmRhcnknKTtcbiAgICAgICAgICAgIGlmICghZW50cmllcy5sZW5ndGgpIHJldHVybjtcblxuICAgICAgICAgICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbWdEaXYgPSBlbnRyeS5xdWVyeVNlbGVjdG9yPEhUTUxJbWFnZUVsZW1lbnQ+KCcubWlzc2lvbl9pbWFnZSBpbWcnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUFsbCA9IGVudHJ5LnF1ZXJ5U2VsZWN0b3I8SFRNTEhlYWRpbmdFbGVtZW50PignLm1pc3Npb25fZGV0YWlscyBoMScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlc2MgPSBlbnRyeS5xdWVyeVNlbGVjdG9yPEhUTUxQYXJhZ3JhcGhFbGVtZW50PignLm1pc3Npb25fZGV0YWlscyBwJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW1nRGl2KSB7XG4gICAgICAgICAgICAgICAgICAgIGltZ0Rpdi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgICAgIGltZ0Rpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKGltZ0Rpdi5zcmMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodGl0bGVBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVBbGwuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvdXRlclRpdGxlID0gdGl0bGVBbGwucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5ldmVudC1taXNzaW9uLWNvbnRlbnQtdGV4dCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob3V0ZXJUaXRsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJUaXRsZS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlclRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZCgob3V0ZXJUaXRsZS50ZXh0Q29udGVudCA/PyAnJykudHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGl0bGVBbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgZS50YXJnZXQuY2xvc2VzdCgnLmV2ZW50LW1pc3Npb24tY29udGVudC10ZXh0JykpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlQ2xvbmUgPSB0aXRsZUFsbC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEhlYWRpbmdFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVDbG9uZS5xdWVyeVNlbGVjdG9yKCcuZXZlbnQtbWlzc2lvbi1jb250ZW50LXRleHQnKT8ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9ICh0aXRsZUNsb25lLnRleHRDb250ZW50ID8/ICcnKS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZCh0aXRsZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkZXNjKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2Muc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICBkZXNjLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQoZGVzYy5pbm5lclRleHQudHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgICAgICB9XG4gICAgfVxufVxuIiwgIlt7XCJ2ZXJzaW9uXCI6XCIwLjcuMVwiLFwiY2hhbmdlc1wiOltcIktlZXAgdGhlIGNoYW5nZWxvZyBjZW50ZXJlZCB3aGVuIHRoZSBnYW1lIHdpbmRvdyBpcyByZXNpemVkLlwiLFwiQ2xlYW4gdXAgc2F2ZWQgcGxheWVyIG5hbWVzLCBleHBsYWluIHVua25vd24gbmFtZXMgb24gaG92ZXIsIGFuZCBnaXZlIFJlbW92ZSBidXR0b25zIG1vcmUgcm9vbS5cIl19LHtcInZlcnNpb25cIjpcIjAuNy4wXCIsXCJjaGFuZ2VzXCI6W1wiU2VlIHdoYXQgY2hhbmdlZCBpbiBKYXJ2aXMgdGhlIGZpcnN0IHRpbWUgYSBuZXcgdmVyc2lvbiBydW5zLlwiLFwiT3BlbiBWaWV3IGNoYW5nZWxvZyBmcm9tIEhIKysgc2V0dGluZ3MgYXQgYW55IHRpbWUsIGV2ZW4gd2l0aCBhdXRvbWF0aWMgbm90aWNlcyB0dXJuZWQgb2ZmLlwiLFwiRXhwYW5kIEVhcmxpZXIgdmVyc2lvbnMgdG8gcmVhZCBwYXN0IHVwZGF0ZXMuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuN1wiLFwiY2hhbmdlc1wiOltcIk1ha2UgbWFya2luZyBvbmUgYWN0aW9uIHBlciBwbGF5ZXIsIGJhY2tmaWxsIG5hbWVzIGZvciBvbGRlciBtYXJrcywgdXNlIHRoZSBicmFja2V0LWJhc2VkIHByb21vdGlvbiB0YXJnZXQsIGFuZCBzaW1wbGlmeSB0aGUgc2VsZWN0ZWQgY29udGVzdCBidXR0b25zIGFuZCB2ZXJzaW9uIGJhZGdlLlwiXX0se1widmVyc2lvblwiOlwiMC42LjZcIixcImNoYW5nZXNcIjpbXCJBZGQgc2V0dGluZyBoZWxwIGluIEhIKyssIGltcHJvdmUgbWFyayBjb250cmFzdCBhbmQgbWFuYWdlbWVudCwgYW5kIGFkZCBhdXRvbWF0aWMgY29udGVzdCBkZWZhdWx0cy5cIixcIlJlbmFtZSB0aGUgc2VwYXJhdGVseSBpbnN0YWxsZWQgdGVzdGluZyB1c2Vyc2NyaXB0IHRvIERldi5cIl19LHtcInZlcnNpb25cIjpcIjAuNi41XCIsXCJjaGFuZ2VzXCI6W1wiTW92ZSB0aGUgdXNlcnNjcmlwdCBzb3VyY2UgaW50byBUeXBlU2NyaXB0IG1vZHVsZXMgYW5kIGFkZCBzZXBhcmF0ZSBzdGFibGUgYW5kIHRlc3RpbmcgYnVpbGRzLlwiXX0se1widmVyc2lvblwiOlwiMC42LjRcIixcImNoYW5nZXNcIjpbXCJQcmV2ZW50IHBpbm5lZCBjb250ZXN0IHN0YXJ0dXAgc2Nyb2xsaW5nLCBrZWVwIG5hdGl2ZSBzdGFydHVwIHdpdGhvdXQgYSBwaW4sIGFuZCBjbGVhciBmaW5pc2hlZCBwaW5zXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuM1wiLFwiY2hhbmdlc1wiOltcIlN0b3AgYm90aCBjb250ZXN0IHN0YXJ0dXAgc2Nyb2xscywgaXNvbGF0ZSB0aGUgc2VsZWN0ZWQgbGVhZGVyYm9hcmQsIGFuZCByZXN0b3JlIHBpbm5lZCBjb250ZXN0cyBhdCBUb3Agb3IgTXkgcmFua1wiXX0se1widmVyc2lvblwiOlwiMC42LjJcIixcImNoYW5nZXNcIjpbXCJQaW4gY29udGVzdHMgb24gdGhlaXIgY2FyZHMsIGhpZGUgdGhlIHN0YXJ0dXAgc2Nyb2xsLCBhbmQgdXNlIHJpZ2h0LWNsaWNrIG1hcmtpbmcgd2l0aCBpc29sYXRlZCBzZXR0aW5ncyBzY3JvbGxpbmdcIl19LHtcInZlcnNpb25cIjpcIjAuNi4xXCIsXCJjaGFuZ2VzXCI6W1wiUmVhZCBuYXRpdmUgTWFuZ2EgUlBHIGNvbnRlc3QgdGl0bGVzIGFuZCByZWNvZ25pemUgYWN0aXZlIGNhcmRzIHdoZW4gY29udGVzdCBkYXRhIGlzIHVuYXZhaWxhYmxlXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBhIGNvbnRlc3Qgc3RhcnQgcHJlZmVyZW5jZSwgY29udGludW91cyBtYXJraW5nLCBhbmQgY29tcGFjdCBzZXR0aW5ncyB3aXRoIGEgdmVyc2lvbiBsYWJlbFwiXX0se1widmVyc2lvblwiOlwiMC41LjBcIixcImNoYW5nZXNcIjpbXCJBZGQgbGVhZ3VlIGFuZCBjb250ZXN0IHBsYXllciBtYXJraW5nIHdpdGggY3VzdG9tIGNvbG9ycywgY29tcGFjdCBzZXR0aW5ncywgYW5kIGxpbWl0IFRvcCAyMCB0byBwcm9tb3RhYmxlIGxlYWd1ZXNcIl19LHtcInZlcnNpb25cIjpcIjAuNC4yXCIsXCJjaGFuZ2VzXCI6W1wiRml4IG1vZHVsZSBzdGFydHVwLCBsZWFndWUgY29udHJvbHMsIGFuZCByYWlkIGV4cG9ydHM7IGFkZCB0aGUgVG9wIDIwIGxlYWd1ZSB0YXJnZXRcIl19LHtcInZlcnNpb25cIjpcIjAuNC4xXCIsXCJjaGFuZ2VzXCI6W1wiRml4IExvdmUgUmFpZHMgc2hhZG93cyByZXBsYWNlbWVudFwiXX0se1widmVyc2lvblwiOlwiMC40LjBcIixcImNoYW5nZXNcIjpbXCJBZGQgQWN0aXZpdHlQYXJzZXIgbW9kdWxlXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjMuMVwiLFwiY2hhbmdlc1wiOltcIkFkZCBoYXJlbSBsaW5rIGluc2lkZSBsb3ZlIHJhaWQgY2FyZHNcIl19LHtcInZlcnNpb25cIjpcIjAuMy4wXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIExvdmVSYWlkc0FkZG9uIGFuZCBMb3ZlUmFpZHNQYXJzZXIgbW9kdWxlc1wiXX0se1widmVyc2lvblwiOlwiMC4yLjBcIixcImNoYW5nZXNcIjpbXCJBZGQgUmVtb3ZlUGFzc0xvY2sgbW9kdWxlXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjEuM1wiLFwiY2hhbmdlc1wiOltcIkJldHRlciBjb2RlIHByYWN0aWNlc1wiXX0se1widmVyc2lvblwiOlwiMC4xLjJcIixcImNoYW5nZXNcIjpbXCJQb2xpc2hpbmcgYW5kIHVwZGF0ZSBsaW5rc1wiXX0se1widmVyc2lvblwiOlwiMC4xLjFcIixcImNoYW5nZXNcIjpbXCJBZGQgRnJpZW5kQW5kRm9lcyBtb2R1bGVcIl19LHtcInZlcnNpb25cIjpcIjAuMC4xXCIsXCJjaGFuZ2VzXCI6W1wiSW5pdGlhbCByZWxlYXNlXCJdfV0iLCAiaW1wb3J0IHsgJCB9IGZyb20gJy4uLy4uL2dhbWUnO1xuXG5pbnRlcmZhY2UgQ2hhbmdlbG9nVmlldyB7XG4gICAgY29udGVudDogSFRNTEVsZW1lbnQ7XG4gICAgY2xvc2VCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xuICAgIHNob3VsZE9wZW46ICgpID0+IGJvb2xlYW47XG4gICAgb25PcGVuOiAoKSA9PiB2b2lkO1xuICAgIG9uQ2xvc2U6ICgpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93Q2hhbmdlbG9nUG9wdXAodmlldzogQ2hhbmdlbG9nVmlldykge1xuICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpYWxvZycpO1xuICAgIGRpYWxvZy5jbGFzc05hbWUgPSAnamFydmlzLWNoYW5nZWxvZy1wb3B1cCc7XG4gICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JywgJ2phcnZpcy1jaGFuZ2Vsb2ctdGl0bGUnKTtcbiAgICBkaWFsb2cuYXBwZW5kQ2hpbGQodmlldy5jb250ZW50KTtcblxuICAgIGNvbnN0IG9wZW5EaWFsb2cgPSAoKSA9PiB7XG4gICAgICAgIGRpYWxvZy5zaG93TW9kYWwoKTtcbiAgICAgICAgdmlldy5jbG9zZUJ1dHRvbi5mb2N1cyh7IHByZXZlbnRTY3JvbGw6IHRydWUgfSk7XG4gICAgICAgIHZpZXcub25PcGVuKCk7XG4gICAgfTtcbiAgICBjb25zdCBiaW5kQ2xvc2UgPSAoZGlzbWlzczogKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVycyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHsgc2lnbmFsOiBoYW5kbGVycy5zaWduYWwgfTtcbiAgICAgICAgdmlldy5jbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRpc21pc3MsIG9wdGlvbnMpO1xuICAgICAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcignY2FuY2VsJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGRpc21pc3MoKTtcbiAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgIT09IGRpYWxvZykgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgYm91bmRzID0gZGlhbG9nLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgaWYgKGV2ZW50LmNsaWVudFggPCBib3VuZHMubGVmdCB8fCBldmVudC5jbGllbnRYID4gYm91bmRzLnJpZ2h0IHx8XG4gICAgICAgICAgICAgICAgZXZlbnQuY2xpZW50WSA8IGJvdW5kcy50b3AgfHwgZXZlbnQuY2xpZW50WSA+IGJvdW5kcy5ib3R0b20pIGRpc21pc3MoKTtcbiAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBoYW5kbGVycztcbiAgICB9O1xuXG4gICAgY29uc3QgcXVldWUgPSB3aW5kb3cuc2hhcmVkPy5Qb3B1cFF1ZXVlTWFuYWdlcjtcbiAgICBjb25zdCBob3N0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbW1vbi1wb3B1cHMnKTtcbiAgICBpZiAoaG9zdCAmJiB0eXBlb2YgcXVldWU/LmFkZCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgcXVldWUuY2xvc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB3cmFwcGVyLmNsYXNzTmFtZSA9ICdwb3B1cF93cmFwcGVyIGphcnZpcy1jaGFuZ2Vsb2ctbmF0aXZlJztcbiAgICAgICAgd3JhcHBlci5hcHBlbmRDaGlsZChkaWFsb2cpO1xuICAgICAgICBsZXQgYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGRpc21pc3MgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWFjdGl2ZSkgcmV0dXJuO1xuICAgICAgICAgICAgYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICBxdWV1ZS5jbG9zZSh7IHR5cGU6ICdjb21tb24nIH0pO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBoYW5kbGVycyA9IGJpbmRDbG9zZShkaXNtaXNzKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHF1ZXVlLmFkZCh7IHBvcHVwOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2NvbW1vbicsXG4gICAgICAgICAgICAgICAgcG9wdXBfbmFtZTogJ2phcnZpc19jaGFuZ2Vsb2cnLFxuICAgICAgICAgICAgICAgIGNsb3NlX29uX2VzYzogZmFsc2UsIC8vIFRoZSBkaWFsb2cgaGFuZGxlcyBFc2NhcGUsIHNvIHRoZSBxdWV1ZSBpcyBjbG9zZWQgb25seSBvbmNlLlxuICAgICAgICAgICAgICAgICRkb21fZWxlbWVudDogJCh3cmFwcGVyKSxcbiAgICAgICAgICAgICAgICBpbml0OiAoKSA9PiBob3N0LmFwcGVuZENoaWxkKHdyYXBwZXIpLFxuICAgICAgICAgICAgICAgIG9uT3BlbjogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXZpZXcuc2hvdWxkT3BlbigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZU1pY3JvdGFzayhkaXNtaXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIXdyYXBwZXIuaXNDb25uZWN0ZWQpIGhvc3QuYXBwZW5kQ2hpbGQod3JhcHBlcik7XG4gICAgICAgICAgICAgICAgICAgIG9wZW5EaWFsb2coKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzOiAoKSA9PiB7fSxcbiAgICAgICAgICAgICAgICBvbkNsb3NlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGlhbG9nLm9wZW4pIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB2aWV3Lm9uQ2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAoKSA9PiBoYW5kbGVycy5hYm9ydCgpLFxuICAgICAgICAgICAgICAgIGRlc3Ryb3k6IGRpc21pc3NcbiAgICAgICAgICAgIH0gfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaGFuZGxlcnMuYWJvcnQoKTtcbiAgICAgICAgICAgIGlmIChkaWFsb2cub3BlbikgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgICAgICB3cmFwcGVyLnJlbW92ZSgpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHVzZSB0aGUgZ2FtZSBwb3B1cCBxdWV1ZTonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCF2aWV3LnNob3VsZE9wZW4oKSkge1xuICAgICAgICB2aWV3Lm9uQ2xvc2UoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmaW5pc2ggPSAoKSA9PiB7XG4gICAgICAgIGhhbmRsZXJzLmFib3J0KCk7XG4gICAgICAgIGRpYWxvZy5yZW1vdmUoKTtcbiAgICAgICAgdmlldy5vbkNsb3NlKCk7XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVycyA9IGJpbmRDbG9zZSgoKSA9PiB7XG4gICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICBmaW5pc2goKTtcbiAgICB9KTtcbiAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCBmaW5pc2gsIHsgc2lnbmFsOiBoYW5kbGVycy5zaWduYWwgfSk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaWFsb2cpO1xuICAgIG9wZW5EaWFsb2coKTtcbn1cbiIsICJpbXBvcnQgcmVsZWFzZU5vdGVzIGZyb20gJy4uLy4uLy4uL0NIQU5HRUxPRy5tZCc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBsc0dldCwgbHNTZXQgfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcbmltcG9ydCB7IHNob3dDaGFuZ2Vsb2dQb3B1cCB9IGZyb20gJy4vY2hhbmdlbG9nUG9wdXAnO1xuXG5jb25zdCBzZWVuS2V5ID0gYENoYW5nZWxvZ1NlZW4ke1VTRVJTQ1JJUFRfQ0hBTk5FTH1gO1xuY29uc3QgbGF0ZXN0VmVyc2lvbiA9IHJlbGVhc2VOb3Rlc1swXS52ZXJzaW9uO1xuXG5mdW5jdGlvbiByZWFkU2VlblZlcnNpb24oKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2VlbiA9IGxzR2V0KHNlZW5LZXkpO1xuICAgICAgICByZXR1cm4gdHlwZW9mIHNlZW4gPT09ICdzdHJpbmcnICYmIC9eXFxkK1xcLlxcZCtcXC5cXGQrJC8udGVzdChzZWVuKSA/IHNlZW4gOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzTmV3ZXIodmVyc2lvbjogc3RyaW5nLCBwcmV2aW91czogc3RyaW5nIHwgbnVsbCkge1xuICAgIGlmICghcHJldmlvdXMpIHJldHVybiB0cnVlO1xuXG4gICAgY29uc3Qgb2xkUGFydHMgPSBwcmV2aW91cy5zcGxpdCgnLicpLm1hcChOdW1iZXIpO1xuICAgIGNvbnN0IG5ld1BhcnRzID0gdmVyc2lvbi5zcGxpdCgnLicpLm1hcChOdW1iZXIpO1xuICAgIGZvciAoY29uc3QgW2luZGV4LCBwYXJ0XSBvZiBuZXdQYXJ0cy5lbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKHBhcnQgIT09IG9sZFBhcnRzW2luZGV4XSkgcmV0dXJuIHBhcnQgPiBvbGRQYXJ0c1tpbmRleF07XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gcmVsZWFzZVNlY3Rpb24ocmVsZWFzZTogdHlwZW9mIHJlbGVhc2VOb3Rlc1tudW1iZXJdKSB7XG4gICAgY29uc3Qgc2VjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlY3Rpb24nKTtcbiAgICBjb25zdCBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICBoZWFkaW5nLnRleHRDb250ZW50ID0gYHYke3JlbGVhc2UudmVyc2lvbn1gO1xuICAgIGNvbnN0IGNoYW5nZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIHJlbGVhc2UuY2hhbmdlcykge1xuICAgICAgICBjb25zdCBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgaXRlbS50ZXh0Q29udGVudCA9IGNoYW5nZTtcbiAgICAgICAgY2hhbmdlcy5hcHBlbmRDaGlsZChpdGVtKTtcbiAgICB9XG4gICAgc2VjdGlvbi5hcHBlbmQoaGVhZGluZywgY2hhbmdlcyk7XG4gICAgcmV0dXJuIHNlY3Rpb247XG59XG5cbmV4cG9ydCBjbGFzcyBDaGFuZ2Vsb2cgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBwZW5kaW5nOiAnYXV0b21hdGljJyB8ICdtYW51YWwnIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBvcGVuZXI6IEhUTUxCdXR0b25FbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSB2aWV3ZWRUaGlzUGFnZSA9IGZhbHNlO1xuICAgIHByaXZhdGUgbG9hZExpc3RlbmVyOiBBYm9ydENvbnRyb2xsZXIgfCBudWxsID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2NoYW5nZWxvZyc7XG4gICAgICAgIHN1cGVyKHsgbmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hOiB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKCdVcGRhdGUgbm90aWNlcycsICdTaG93IHRoZSBjaGFuZ2Vsb2cgb25jZSBhZnRlciBhbiB1cGRhdGUuIFVzZSBWaWV3IGNoYW5nZWxvZyB0byBvcGVuIGl0IHdoZW5ldmVyIHlvdSBsaWtlLicpLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICB9IH0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaW5zdGFsbFNldHRpbmdzKCkge1xuICAgICAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gJy5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmNvbmZpZy1zZXR0aW5nW3JlbD1cIkpBUlZJU19jaGFuZ2Vsb2dcIl0nO1xuICAgICAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoIWNhcmQgfHwgY2FyZC5xdWVyeVNlbGVjdG9yKCcuamFydmlzLXZpZXctY2hhbmdlbG9nJykpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24gamFydmlzLXZpZXctY2hhbmdlbG9nJztcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICdWaWV3IGNoYW5nZWxvZyc7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLm9wZW4oJ21hbnVhbCcsIGJ1dHRvbikpO1xuICAgICAgICAgICAgY2FyZC5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1bikgcmV0dXJuO1xuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWU7XG5cbiAgICAgICAgY29uc3QgY2hlY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNSdW4gJiYgIXRoaXMudmlld2VkVGhpc1BhZ2UgJiYgaXNOZXdlcihsYXRlc3RWZXJzaW9uLCByZWFkU2VlblZlcnNpb24oKSkpIHRoaXMub3BlbignYXV0b21hdGljJyk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSBjaGVjaygpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9hZExpc3RlbmVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBjaGVjaywgeyBvbmNlOiB0cnVlLCBzaWduYWw6IHRoaXMubG9hZExpc3RlbmVyLnNpZ25hbCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRlYXJEb3duKCkge1xuICAgICAgICB0aGlzLmxvYWRMaXN0ZW5lcj8uYWJvcnQoKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9wZW4obW9kZTogJ2F1dG9tYXRpYycgfCAnbWFudWFsJywgb3BlbmVyOiBIVE1MQnV0dG9uRWxlbWVudCB8IG51bGwgPSBudWxsKSB7XG4gICAgICAgIGlmIChtb2RlID09PSAnbWFudWFsJykgdGhpcy5vcGVuZXIgPSBvcGVuZXI7XG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmcpIHtcbiAgICAgICAgICAgIGlmIChtb2RlID09PSAnbWFudWFsJykgdGhpcy5wZW5kaW5nID0gbW9kZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBlbmRpbmcgPSBtb2RlO1xuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzID0gcmVhZFNlZW5WZXJzaW9uKCk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGVudC5jbGFzc05hbWUgPSAnY29udGFpbmVyLXNwZWNpYWwtYmcgamFydmlzLWNoYW5nZWxvZy1jb250ZW50JztcbiAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgICAgICB0aXRsZS5pZCA9ICdqYXJ2aXMtY2hhbmdlbG9nLXRpdGxlJztcbiAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSAnSmFydmlzIGNoYW5nZWxvZyc7XG4gICAgICAgIGNvbnN0IG5vdGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG5vdGVzLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY2hhbmdlbG9nLW5vdGVzJztcbiAgICAgICAgY29uc3QgbmV3UmVsZWFzZXMgPSBwcmV2aW91cyAmJiBpc05ld2VyKGxhdGVzdFZlcnNpb24sIHByZXZpb3VzKVxuICAgICAgICAgICAgPyByZWxlYXNlTm90ZXMuZmlsdGVyKHJlbGVhc2UgPT4gaXNOZXdlcihyZWxlYXNlLnZlcnNpb24sIHByZXZpb3VzKSkubGVuZ3RoXG4gICAgICAgICAgICA6IDE7XG4gICAgICAgIG5vdGVzLmFwcGVuZCguLi5yZWxlYXNlTm90ZXMuc2xpY2UoMCwgbmV3UmVsZWFzZXMpLm1hcChyZWxlYXNlU2VjdGlvbikpO1xuICAgICAgICBjb25zdCBlYXJsaWVyID0gcmVsZWFzZU5vdGVzLnNsaWNlKG5ld1JlbGVhc2VzKTtcbiAgICAgICAgaWYgKGVhcmxpZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBoaXN0b3J5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGV0YWlscycpO1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N1bW1hcnknKTtcbiAgICAgICAgICAgIHN1bW1hcnkudGV4dENvbnRlbnQgPSAnRWFybGllciB2ZXJzaW9ucyc7XG4gICAgICAgICAgICBoaXN0b3J5LmFwcGVuZChzdW1tYXJ5LCAuLi5lYXJsaWVyLm1hcChyZWxlYXNlU2VjdGlvbikpO1xuICAgICAgICAgICAgbm90ZXMuYXBwZW5kQ2hpbGQoaGlzdG9yeSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmb290ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb290ZXInKTtcbiAgICAgICAgY29uc3QgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgY2xvc2VCdXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBjbG9zZUJ1dHRvbi5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uJztcbiAgICAgICAgY2xvc2VCdXR0b24udGV4dENvbnRlbnQgPSAnQ2xvc2UnO1xuICAgICAgICBmb290ZXIuYXBwZW5kQ2hpbGQoY2xvc2VCdXR0b24pO1xuICAgICAgICBjb250ZW50LmFwcGVuZCh0aXRsZSwgbm90ZXMsIGZvb3Rlcik7XG5cbiAgICAgICAgc2hvd0NoYW5nZWxvZ1BvcHVwKHtcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICBjbG9zZUJ1dHRvbixcbiAgICAgICAgICAgIHNob3VsZE9wZW46ICgpID0+IHRoaXMucGVuZGluZyA9PT0gJ21hbnVhbCcgfHxcbiAgICAgICAgICAgICAgICAodGhpcy5oYXNSdW4gJiYgIXRoaXMudmlld2VkVGhpc1BhZ2UgJiYgaXNOZXdlcihsYXRlc3RWZXJzaW9uLCByZWFkU2VlblZlcnNpb24oKSkpLFxuICAgICAgICAgICAgb25PcGVuOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3ZWRUaGlzUGFnZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmV3ZXIobGF0ZXN0VmVyc2lvbiwgcmVhZFNlZW5WZXJzaW9uKCkpKSBsc1NldChzZWVuS2V5LCBsYXRlc3RWZXJzaW9uKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIHZpZXdlZCBjaGFuZ2Vsb2cgdmVyc2lvbjonLCBlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkNsb3NlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZW5kaW5nID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5lcj8uZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMub3BlbmVyID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IGluaXRHYW1lIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IGluamVjdFN0eWxlcywgcGFja1NldHRpbmdzIH0gZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBGcmllbmRBbmRGb2VzIH0gZnJvbSAnLi9tb2R1bGVzL3BsYXllcnMvRnJpZW5kQW5kRm9lcyc7XG5pbXBvcnQgeyBhcm1Db250ZXN0U3RhcnR1cEd1YXJkLCBDb250ZXN0U3RhcnQgfSBmcm9tICcuL21vZHVsZXMvY29udGVzdHMvQ29udGVzdFN0YXJ0JztcbmltcG9ydCB7IGluc3RhbGxDb250ZXN0U2V0dGluZ3MgfSBmcm9tICcuL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzJztcbmltcG9ydCB7IExlYWd1ZVRvcDIwIH0gZnJvbSAnLi9tb2R1bGVzL3BsYXllcnMvTGVhZ3VlVG9wMjAnO1xuaW1wb3J0IHsgUmVtb3ZlUGFzc0xvY2sgfSBmcm9tICcuL21vZHVsZXMvcHJvZ3Jlc3Npb24vUmVtb3ZlUGFzc0xvY2snO1xuaW1wb3J0IHsgTG92ZVJhaWRzQWRkb24gfSBmcm9tICcuL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNBZGRvbic7XG5pbXBvcnQgeyBMb3ZlUmFpZHNQYXJzZXIgfSBmcm9tICcuL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNQYXJzZXInO1xuaW1wb3J0IHsgQWN0aXZpdHlQYXJzZXIgfSBmcm9tICcuL21vZHVsZXMvYWN0aXZpdGllcy9BY3Rpdml0eVBhcnNlcic7XG5pbXBvcnQgeyBDaGFuZ2Vsb2cgfSBmcm9tICcuL21vZHVsZXMvdXBkYXRlcy9DaGFuZ2Vsb2cnO1xuXG5hcm1Db250ZXN0U3RhcnR1cEd1YXJkKCk7XG5cbmZ1bmN0aW9uIHJ1bkphcnZpcygpIHtcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBydW5KYXJ2aXMsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgJCB9ID0gd2luZG93O1xuXG4gICAgaWYgKCEkKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJ1bkphcnZpcywgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICBjb25zb2xlLmxvZygnV0FSTklORzogTm8galF1ZXJ5IGZvdW5kLiBFbmRpbmcgc2NyaXB0LicpO1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnSGVsbG8sIFNpciwgSi5BLlIuVi5JLlMuIGlzIHJlYWR5IHRvIGhlbHAgeW91LicpO1xuXG4gICAgaW5pdEdhbWUoJCk7XG4gICAgaW5qZWN0U3R5bGVzKCk7XG5cbiAgICBjb25zdCBmcmllbmRzQW5kRm9lcyA9IG5ldyBGcmllbmRBbmRGb2VzKCk7XG4gICAgY29uc3QgY2hhbmdlbG9nID0gbmV3IENoYW5nZWxvZygpO1xuICAgIGNvbnN0IGFsbE1vZHVsZXMgPSBbXG4gICAgICAgIGZyaWVuZHNBbmRGb2VzLFxuICAgICAgICBuZXcgQ29udGVzdFN0YXJ0KCksXG4gICAgICAgIG5ldyBMZWFndWVUb3AyMCgpLFxuICAgICAgICBuZXcgUmVtb3ZlUGFzc0xvY2soKSxcbiAgICAgICAgbmV3IExvdmVSYWlkc0FkZG9uKCksXG4gICAgICAgIG5ldyBMb3ZlUmFpZHNQYXJzZXIoKSxcbiAgICAgICAgbmV3IEFjdGl2aXR5UGFyc2VyKCksXG4gICAgICAgIGNoYW5nZWxvZ1xuICAgIF1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBydW5TY3JpcHQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGhoUGx1c1BsdXNDb25maWcgfSA9IHdpbmRvd1xuICAgICAgICAgICAgaWYgKCFoaFBsdXNQbHVzQ29uZmlnKSByZXR1cm47XG5cbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJHcm91cCh7XG4gICAgICAgICAgICAgICAga2V5OiAnSkFSVklTJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnSEggSmFydmlzJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGFsbE1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4ge1xuICAgICAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJNb2R1bGUobW9kdWxlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcubG9hZENvbmZpZygpXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJ1bk1vZHVsZXMoKVxuICAgICAgICAgICAgZnJpZW5kc0FuZEZvZXMuaW5zdGFsbFNldHRpbmdzKCk7XG4gICAgICAgICAgICBpbnN0YWxsQ29udGVzdFNldHRpbmdzKCk7XG4gICAgICAgICAgICBjaGFuZ2Vsb2cuaW5zdGFsbFNldHRpbmdzKCk7XG4gICAgICAgICAgICBwYWNrU2V0dGluZ3MoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aW5kb3cuaGhQbHVzUGx1c0NvbmZpZykge1xuICAgICAgICAgICAgcnVuU2NyaXB0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uZSgnaGgrKy1iZHNtOmxvYWRlZCcsIHJ1blNjcmlwdClcbiAgICAgICAgfVxuICAgIH0sIDEpXG59XG5cbnJ1bkphcnZpcygpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFPLE1BQUk7QUFDSixNQUFJO0FBRUosV0FBUyxTQUFTLFFBQXNCO0FBQzNDLFFBQUk7QUFDSixrQkFBYyxPQUFPLFNBQVM7QUFBQSxFQUNsQzs7O0FDTk8sV0FBUyxZQUFZLE9BQWUsYUFBcUI7QUFDNUQsVUFBTSxTQUFTLENBQUMsU0FBaUIsS0FBSyxXQUFXLEtBQUssT0FBTyxFQUFFLFdBQVcsS0FBSyxRQUFRLEVBQ2xGLFdBQVcsS0FBSyxNQUFNLEVBQUUsV0FBVyxLQUFLLE1BQU07QUFDbkQsV0FBTyxPQUFPLEtBQUssSUFBSSxzRkFDbkIsT0FBTyxLQUFLLElBQUksMEJBQTBCLE9BQU8sV0FBVyxJQUFJO0FBQUEsRUFDeEU7QUFFTyxXQUFTLGtCQUFrQixPQUFvQixXQUFtQjtBQUNyRSxVQUFNLFVBQVUsU0FBUyxjQUFjLEtBQUs7QUFDNUMsWUFBUSxLQUFLO0FBQ2IsWUFBUSxZQUFZO0FBQ3BCLFlBQVEsYUFBYSxRQUFRLFNBQVM7QUFDdEMsVUFBTSxVQUFVLE9BQU8sUUFBUSxnQkFBZ0I7QUFDL0MsUUFBSSxRQUFTLFNBQVEsYUFBYSxXQUFXLFFBQVE7QUFBQSxRQUNoRCxTQUFRLFNBQVM7QUFDdEIsYUFBUyxLQUFLLFlBQVksT0FBTztBQUVqQyxRQUFJLFNBQTZCO0FBQ2pDLFVBQU0sVUFBVSxDQUFDLFdBQ2Isa0JBQWtCLFVBQVUsT0FBTyxRQUFxQixxQkFBcUIsSUFBSTtBQUNyRixVQUFNLFFBQVEsTUFBTTtBQUNoQixVQUFJLENBQUMsT0FBUTtBQUNiLGFBQU8sZ0JBQWdCLGtCQUFrQjtBQUN6QyxlQUFTO0FBQ1QsVUFBSSxRQUFTLFNBQVEsWUFBWTtBQUFBLFVBQzVCLFNBQVEsU0FBUztBQUFBLElBQzFCO0FBQ0EsVUFBTSxPQUFPLENBQUMsU0FBc0I7QUFDaEMsVUFBSSxXQUFXLEtBQU07QUFDckIsWUFBTTtBQUNOLGVBQVM7QUFDVCxXQUFLLGFBQWEsb0JBQW9CLFNBQVM7QUFDL0MsY0FBUSxjQUFjLEtBQUssUUFBUSxlQUFlO0FBQ2xELFVBQUksUUFBUyxTQUFRLFlBQVk7QUFBQSxVQUM1QixTQUFRLFNBQVM7QUFFdEIsWUFBTSxTQUFTLEtBQUssc0JBQXNCO0FBQzFDLFlBQU0sRUFBRSxhQUFhLGFBQWEsSUFBSTtBQUN0QyxjQUFRLE1BQU0sT0FBTyxLQUFLLElBQUksR0FBRyxLQUFLLElBQUksT0FBTyxNQUFNLFNBQVMsZ0JBQWdCLGNBQWMsY0FBYyxDQUFDLENBQUMsSUFBSTtBQUNsSCxZQUFNLFFBQVEsT0FBTyxTQUFTO0FBQzlCLGNBQVEsTUFBTSxPQUFPLFFBQVEsZ0JBQWdCLE9BQU8sY0FBYyxJQUM1RCxRQUFRLEtBQUssSUFBSSxHQUFHLE9BQU8sTUFBTSxlQUFlLENBQUMsS0FBSztBQUFBLElBQ2hFO0FBRUEsVUFBTSxpQkFBaUIsZUFBZSxXQUFTO0FBQzNDLFlBQU0sT0FBTyxRQUFRLE1BQU0sTUFBTTtBQUNqQyxVQUFJLFFBQVEsTUFBTSxnQkFBZ0IsUUFBUyxNQUFLLElBQUk7QUFBQSxJQUN4RCxDQUFDO0FBQ0QsVUFBTSxpQkFBaUIsY0FBYyxXQUFTO0FBQzFDLFlBQU0sT0FBTyxRQUFRLE1BQU0sTUFBTTtBQUNqQyxVQUFJLFNBQVMsVUFBVSxRQUFRLFNBQVMsa0JBQWtCLEtBQU0sT0FBTTtBQUFBLElBQzFFLENBQUM7QUFDRCxVQUFNLGlCQUFpQixXQUFXLFdBQVM7QUFDdkMsWUFBTSxPQUFPLFFBQVEsTUFBTSxNQUFNO0FBQ2pDLFVBQUksS0FBTSxNQUFLLElBQUk7QUFBQSxJQUN2QixDQUFDO0FBQ0QsVUFBTSxpQkFBaUIsWUFBWSxXQUFTO0FBQ3hDLFVBQUksUUFBUSxNQUFNLE1BQU0sTUFBTSxPQUFRLE9BQU07QUFBQSxJQUNoRCxDQUFDO0FBQ0QsVUFBTSxpQkFBaUIsU0FBUyxXQUFTO0FBQ3JDLFlBQU0sT0FBTyxRQUFRLE1BQU0sTUFBTTtBQUNqQyxVQUFJLENBQUMsS0FBTTtBQUNYLFlBQU0sZUFBZTtBQUNyQixZQUFNLGdCQUFnQjtBQUN0QixXQUFLLElBQUk7QUFBQSxJQUNiLENBQUM7QUFDRCxVQUFNLGlCQUFpQixXQUFXLFdBQVM7QUFDdkMsWUFBTSxPQUFPLFFBQVEsTUFBTSxNQUFNO0FBQ2pDLFVBQUksU0FBUyxNQUFNLFFBQVEsV0FBVyxNQUFNLFFBQVEsTUFBTTtBQUN0RCxjQUFNLGVBQWU7QUFDckIsY0FBTSxnQkFBZ0I7QUFDdEIsYUFBSyxJQUFJO0FBQUEsTUFDYixXQUFXLFVBQVUsTUFBTSxRQUFRLFVBQVU7QUFDekMsY0FBTSxnQkFBZ0I7QUFDdEIsY0FBTTtBQUFBLE1BQ1Y7QUFBQSxJQUNKLENBQUM7QUFDRCxhQUFTLGlCQUFpQixlQUFlLFdBQVM7QUFDOUMsVUFBSSxRQUFRLE1BQU0sTUFBTSxNQUFNLE9BQVEsT0FBTTtBQUFBLElBQ2hELENBQUM7QUFDRCxVQUFNLGlCQUFpQixVQUFVLE9BQU8sRUFBRSxTQUFTLEtBQUssQ0FBQztBQUFBLEVBQzdEOzs7QUNqRkE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNJTyxXQUFTLGVBQWU7QUFDM0IsVUFBTSxRQUFRLFNBQVMsY0FBYyxPQUFPO0FBQzVDLFVBQU0sWUFBWTtBQUNsQixVQUFNLGNBQWMsR0FBRyxnQkFBRztBQUFBLDJEQUM2QixPQUFrQjtBQUFBO0FBRXpFLGFBQVMsS0FBSyxZQUFZLEtBQUs7QUFBQSxFQUNuQztBQUVPLFdBQVMsZUFBZTtBQUMzQixRQUFJLGdCQUFnQixhQUFjO0FBRWxDLFVBQU0sV0FBVztBQUNqQixXQUFPLFdBQVcsUUFBUSx3QkFBd0IsVUFBVSxNQUFNO0FBQzlELFlBQU0sUUFBUSxTQUFTLGNBQTJCLFFBQVE7QUFDMUQsVUFBSSxDQUFDLE1BQU87QUFDWixZQUFNLFVBQVUsT0FBTyxXQUFXO0FBQ2xDLHdCQUFrQixPQUFPLHdCQUF3QjtBQUNqRCxhQUFPLGlCQUFpQixTQUFTLFdBQVM7QUFDdEMsWUFBSSxNQUFNLFdBQVcsRUFBRSxNQUFNLGtCQUFrQixTQUFTLENBQUMsTUFBTSxTQUFTLE1BQU0sTUFBTSxFQUFHO0FBRXZGLGNBQU0sZUFBZTtBQUNyQixjQUFNLHlCQUF5QjtBQUMvQixjQUFNLE9BQU8sTUFBTSxjQUFjLElBQUksS0FBSyxNQUFNLGNBQWMsSUFBSSxNQUFNLGVBQWU7QUFDdkYsY0FBTSxRQUFRLE1BQU0sc0JBQXNCLEVBQUUsU0FBUyxNQUFNLGdCQUFnQjtBQUMzRSxjQUFNLGFBQWEsTUFBTSxTQUFTLE9BQU87QUFBQSxNQUM3QyxHQUFHLEVBQUUsU0FBUyxNQUFNLFNBQVMsTUFBTSxDQUFDO0FBRXBDLFlBQU0sUUFBUSxNQUFNLGlCQUE4QixpQkFBaUI7QUFDbkUsWUFBTSxPQUFPLE1BQU07QUFDZixZQUFJLENBQUMsTUFBTSxZQUFhO0FBRXhCLG1CQUFXLFFBQVEsT0FBTztBQUN0QixlQUFLLE1BQU0sWUFBWSx5QkFBeUIsT0FBTyxLQUFLLGVBQWUsRUFBRSxDQUFDO0FBQUEsUUFDbEY7QUFDQSxjQUFNLFVBQVUsSUFBSSx3QkFBd0I7QUFBQSxNQUNoRDtBQUNBLFlBQU0sZ0JBQWdCLElBQUksaUJBQWlCLElBQUk7QUFDL0MsVUFBSSxNQUFNLGNBQWUsZUFBYyxRQUFRLE1BQU0sZUFBZSxFQUFFLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xHLFVBQUksT0FBTyxtQkFBbUIsYUFBYTtBQUN2QyxjQUFNLGVBQWUsSUFBSSxlQUFlLElBQUk7QUFDNUMsY0FBTSxRQUFRLFVBQVEsYUFBYSxRQUFRLElBQUksQ0FBQztBQUFBLE1BQ3BEO0FBQ0EsV0FBSztBQUFBLElBQ1QsQ0FBQztBQUFBLEVBQ0w7OztBQ3hDTyxNQUFlLFdBQWYsTUFBd0I7QUFBQSxJQUNsQixRQUFRO0FBQUEsSUFDUjtBQUFBLElBQ1QsU0FBUztBQUFBLElBRVQsWUFBWSxFQUFFLGFBQWEsR0FBaUQ7QUFDeEUsV0FBSyxlQUFlO0FBQUEsSUFDeEI7QUFBQSxFQUlKOzs7QUNwQk8sTUFBTSxpQkFBaUI7QUFFdkIsV0FBUyxNQUFNLEtBQWEsVUFBVSxnQkFBeUI7QUFDbEUsV0FBTyxLQUFLLE1BQU0sYUFBYSxRQUFRLEdBQUcsT0FBTyxHQUFHLEdBQUcsRUFBRSxLQUFLLE1BQU07QUFBQSxFQUN4RTtBQUNPLFdBQVMsTUFBTSxLQUFhLE9BQWdCLFVBQVUsZ0JBQWdCO0FBQ3pFLFdBQU8sYUFBYSxRQUFRLEdBQUcsT0FBTyxHQUFHLEdBQUcsSUFBSSxLQUFLLFVBQVUsS0FBSyxDQUFDO0FBQUEsRUFDekU7QUFDTyxXQUFTLEtBQUssS0FBYSxVQUFVLGdCQUFnQjtBQUN4RCxXQUFPLGFBQWEsV0FBVyxHQUFHLE9BQU8sR0FBRyxHQUFHLEVBQUU7QUFBQSxFQUNyRDs7O0FDQU8sV0FBUyxnQkFBZ0IsTUFBeUIsUUFBaUMsT0FBc0I7QUFDNUcsUUFBSSxTQUFTLGNBQWMsc0JBQXNCLEVBQUc7QUFFcEQsVUFBTSxTQUFTLFNBQVMsY0FBYyxRQUFRO0FBQzlDLFdBQU8sWUFBWTtBQUNuQixXQUFPLGFBQWEsbUJBQW1CLDJCQUEyQjtBQUNsRSxVQUFNLFFBQVEsU0FBUyxjQUFjLElBQUk7QUFDekMsVUFBTSxLQUFLO0FBQ1gsVUFBTSxjQUFjO0FBRXBCLFVBQU0sUUFBUSxTQUFTLGNBQWMsS0FBSztBQUMxQyxVQUFNLFlBQVk7QUFDbEIsVUFBTSxVQUFVLFNBQVMsY0FBYyxLQUFLO0FBQzVDLFlBQVEsWUFBWTtBQUNwQixVQUFNLFdBQVcsV0FBVyxtQkFBbUIsTUFBTTtBQUNqRCxVQUFJLFFBQVEsZ0RBQWdELEtBQUssTUFBTSxHQUFHO0FBQ3RFLGVBQU87QUFDUCxjQUFNLE1BQU07QUFBQSxNQUNoQjtBQUFBLElBQ0osQ0FBQztBQUNELFVBQU0sUUFBUSxXQUFXLFNBQVMsTUFBTSxPQUFPLE1BQU0sQ0FBQztBQUN0RCxZQUFRLE9BQU8sVUFBVSxLQUFLO0FBRTlCLGFBQVMsU0FBUztBQUNkLFlBQU0sVUFBVSxLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUMsRUFBRSxJQUFJLElBQUksT0FBTyxDQUFDLEVBQUUsSUFBSSxNQUNqRSxFQUFFLFFBQVEsRUFBRSxJQUFJLGNBQWMsRUFBRSxRQUFRLEVBQUUsSUFBSSxRQUFXLEVBQUUsU0FBUyxLQUFLLENBQUMsQ0FBQztBQUNoRixZQUFNLFdBQVksQ0FBQyxVQUFVLEtBQUssRUFBWSxJQUFJLFVBQVE7QUFDdEQsY0FBTSxVQUFVLFNBQVMsY0FBYyxTQUFTO0FBQ2hELGNBQU0sVUFBVSxTQUFTLGNBQWMsSUFBSTtBQUMzQyxjQUFNLFVBQVUsUUFBUSxPQUFPLFdBQVMsTUFBTSxTQUFTLElBQUk7QUFDM0QsZ0JBQVEsZUFBZSxTQUFTLFdBQVcsWUFBWSxVQUFVLEtBQUssUUFBUSxNQUFNO0FBQ3BGLGdCQUFRLFlBQVksT0FBTztBQUUzQixZQUFJLFFBQVEsV0FBVyxHQUFHO0FBQ3RCLGdCQUFNLFFBQVEsU0FBUyxjQUFjLEdBQUc7QUFDeEMsZ0JBQU0sY0FBYztBQUNwQixrQkFBUSxZQUFZLEtBQUs7QUFDekIsaUJBQU87QUFBQSxRQUNYO0FBRUEsY0FBTSxPQUFPLFNBQVMsY0FBYyxJQUFJO0FBQ3hDLG1CQUFXLEVBQUUsSUFBSSxLQUFLLEtBQUssU0FBUztBQUNoQyxnQkFBTSxNQUFNLFNBQVMsY0FBYyxJQUFJO0FBQ3ZDLGdCQUFNLFNBQVMsU0FBUyxjQUFjLE1BQU07QUFDNUMsaUJBQU8sY0FBYyxPQUFPLEdBQUcsSUFBSSxNQUFNLEVBQUUsS0FBSyxXQUFXLEVBQUU7QUFDN0QsY0FBSSxDQUFDLEtBQU0sUUFBTyxRQUFRO0FBQzFCLGdCQUFNLFNBQVMsV0FBVyxVQUFVLE1BQU07QUFDdEMsa0JBQU0sUUFBUSxNQUFNLEtBQUssTUFBTSxpQkFBaUIsUUFBUSxDQUFDLEVBQUUsUUFBUSxNQUFNO0FBQ3pFLGdCQUFJLE9BQU8sRUFBRSxHQUFHO0FBQ1oscUJBQU87QUFDUCxvQkFBTSxZQUFZLE1BQU0saUJBQWlCLFFBQVE7QUFDakQsZUFBQyxVQUFVLEtBQUssSUFBSSxPQUFPLFVBQVUsU0FBUyxDQUFDLENBQUMsS0FBSyxPQUFPLE1BQU07QUFBQSxZQUN0RTtBQUFBLFVBQ0osQ0FBQztBQUNELGlCQUFPLGFBQWEsY0FBYyxVQUFVLFFBQVEsVUFBVSxFQUFFLEVBQUUsU0FBUyxTQUFTLFdBQVcsWUFBWSxNQUFNLEVBQUU7QUFDbkgsY0FBSSxPQUFPLFFBQVEsTUFBTTtBQUN6QixlQUFLLFlBQVksR0FBRztBQUFBLFFBQ3hCO0FBQ0EsZ0JBQVEsWUFBWSxJQUFJO0FBQ3hCLGVBQU87QUFBQSxNQUNYLENBQUM7QUFDRCxZQUFNLGdCQUFnQixHQUFHLFFBQVE7QUFDakMsZUFBUyxXQUFXLFFBQVEsV0FBVztBQUFBLElBQzNDO0FBRUEsV0FBTztBQUNQLFdBQU8sT0FBTyxPQUFPLE9BQU8sT0FBTztBQUNuQyxVQUFNLFlBQVksSUFBSSxnQkFBZ0I7QUFDdEMsV0FBTyxpQkFBaUIsV0FBVyxXQUFTO0FBQ3hDLFVBQUksQ0FBQyxNQUFNLE9BQU8sQ0FBQyxlQUFlLG1CQUFtQixjQUFjLFNBQVMsRUFDdkUsS0FBSyxTQUFPLE1BQU0sUUFBUSxpQkFBaUIsR0FBRyxFQUFHLFFBQU87QUFBQSxJQUNqRSxHQUFHLEVBQUUsUUFBUSxVQUFVLE9BQU8sQ0FBQztBQUMvQixXQUFPLGlCQUFpQixTQUFTLE1BQU07QUFDbkMsZ0JBQVUsTUFBTTtBQUNoQixhQUFPLE9BQU87QUFBQSxJQUNsQixHQUFHLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDakIsYUFBUyxLQUFLLFlBQVksTUFBTTtBQUNoQyxXQUFPLFVBQVU7QUFDakIsVUFBTSxNQUFNO0FBQUEsRUFDaEI7QUFFQSxXQUFTLFdBQVcsT0FBZSxTQUFxQjtBQUNwRCxVQUFNLFNBQVMsU0FBUyxjQUFjLFFBQVE7QUFDOUMsV0FBTyxPQUFPO0FBQ2QsV0FBTyxZQUFZO0FBQ25CLFdBQU8sY0FBYztBQUNyQixXQUFPLGlCQUFpQixTQUFTLE9BQU87QUFDeEMsV0FBTztBQUFBLEVBQ1g7OztBQzFGQSxNQUFNLGlCQUF1QyxFQUFFLFFBQVEsV0FBVyxLQUFLLFVBQVU7QUFHakYsV0FBUyxZQUFZLFNBQXNCO0FBQ3ZDLFVBQU0sT0FBTyxRQUFRLGFBQWEsS0FBSyxLQUFLO0FBQzVDLFFBQUksQ0FBQyxLQUFLLFNBQVMsR0FBRyxFQUFHLFFBQU87QUFDaEMsVUFBTSx3QkFBd0IsS0FBSyxRQUFRLFVBQVUsRUFBRTtBQUN2RCxRQUFJLENBQUMsUUFBUSxrQkFBbUIsUUFBTztBQUV2QyxVQUFNLFFBQVEsUUFBUSxVQUFVLElBQUk7QUFDcEMsZUFBVyxTQUFTLE1BQU0saUJBQWlCLEdBQUcsR0FBRztBQUM3QyxVQUFJLE1BQU0sYUFBYSxLQUFLLE1BQU0sSUFBSyxPQUFNLE9BQU87QUFBQSxJQUN4RDtBQUNBLFdBQU8sTUFBTSxhQUFhLEtBQUssRUFBRSxRQUFRLFVBQVUsRUFBRSxLQUFLO0FBQUEsRUFDOUQ7QUFFQSxXQUFTLGlCQUFpQixPQUFtQjtBQUN6QyxRQUFJLE9BQU8sVUFBVSxTQUFVLFFBQU8sT0FBTztBQUU3QyxXQUFPLE1BQU0sS0FBSyxFQUFFLFFBQVEsYUFBYSxJQUFJLEVBQUUsUUFBUTtBQUFBLEVBQzNEO0FBRU8sTUFBTSxnQkFBTixjQUE0QixTQUFTO0FBQUEsSUFDaEMsUUFBUSxvQkFBSSxJQUF5QjtBQUFBLElBQ3JDLFdBQWtDO0FBQUEsSUFDbEMsT0FBMkI7QUFBQSxJQUMzQixlQUFlO0FBQUEsSUFDZixXQUFXO0FBQUEsSUFFbkIsY0FBYztBQUNWLFlBQU0sVUFBVTtBQUNoQixZQUFNLGVBQWU7QUFBQSxRQUNqQjtBQUFBLFFBQ0EsU0FBUztBQUFBLFFBQ1QsT0FBTyxZQUFZLG9CQUFvQixtRkFBbUY7QUFBQSxRQUMxSCxhQUFhLENBQUM7QUFBQSxVQUNWLEtBQUs7QUFBQSxVQUNMLE9BQU8sWUFBWSxjQUFjLGdEQUFnRDtBQUFBLFVBQ2pGLFNBQVM7QUFBQSxRQUNiLEdBQUc7QUFBQSxVQUNDLEtBQUs7QUFBQSxVQUNMLE9BQU8sWUFBWSxlQUFlLHVEQUF1RDtBQUFBLFVBQ3pGLFNBQVM7QUFBQSxRQUNiLENBQUM7QUFBQSxNQUNMO0FBQ0EsWUFBTSxFQUFFLE1BQU0sU0FBUyxhQUFhLENBQUM7QUFBQSxJQUN6QztBQUFBLElBRUEsWUFBWTtBQUNSLGFBQU8sQ0FBQyxpQkFBaUIsa0JBQWtCLEVBQUUsU0FBUyxXQUFXO0FBQUEsSUFDckU7QUFBQSxJQUVBLFlBQVksS0FBYTtBQUNyQixVQUFJO0FBQ0EsZUFBTyxNQUFNLEdBQUc7QUFBQSxNQUNwQixRQUFRO0FBQ0osZUFBTztBQUFBLE1BQ1g7QUFBQSxJQUNKO0FBQUEsSUFFQSxZQUFxQztBQUNqQyxZQUFNLFNBQVMsS0FBSyxZQUFZLGFBQWE7QUFDN0MsVUFBSSxVQUFVLE9BQU8sV0FBVyxZQUFZLENBQUMsTUFBTSxRQUFRLE1BQU0sRUFBRyxRQUFPO0FBRTNFLFlBQU0sUUFBOEIsQ0FBQztBQUNyQyxpQkFBVyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQyxjQUFjLFFBQVEsR0FBRyxDQUFDLFdBQVcsS0FBSyxDQUFDLEdBQVk7QUFDL0UsY0FBTSxPQUFPLEtBQUssWUFBWSxHQUFHO0FBQ2pDLFlBQUksQ0FBQyxNQUFNLFFBQVEsSUFBSSxFQUFHO0FBRTFCLG1CQUFXLE1BQU0sTUFBTTtBQUNuQixjQUFJLGFBQWEsS0FBSyxPQUFPLEVBQUUsQ0FBQyxFQUFHLE9BQU0sT0FBTyxFQUFFLENBQUMsSUFBSTtBQUFBLFFBQzNEO0FBQUEsTUFDSjtBQUNBLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxhQUFtQztBQUMvQixZQUFNLFFBQVEsS0FBSyxZQUFZLGtCQUFrQjtBQUNqRCxhQUFPO0FBQUEsUUFDSCxRQUFRLE9BQU8sT0FBTyxXQUFXLFlBQVksaUJBQWlCLEtBQUssTUFBTSxNQUFNLElBQUksTUFBTSxTQUFTLGVBQWU7QUFBQSxRQUNqSCxLQUFLLE9BQU8sT0FBTyxRQUFRLFlBQVksaUJBQWlCLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxNQUFNLGVBQWU7QUFBQSxNQUN6RztBQUFBLElBQ0o7QUFBQSxJQUVBLGlCQUE0QztBQUN4QyxZQUFNLFFBQVEsS0FBSyxZQUFZLGlCQUFpQjtBQUNoRCxVQUFJLENBQUMsU0FBUyxPQUFPLFVBQVUsWUFBWSxNQUFNLFFBQVEsS0FBSyxFQUFHLFFBQU8sQ0FBQztBQUN6RSxhQUFPLE9BQU8sWUFBWSxPQUFPLFFBQVEsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUF3QztBQUM1RixjQUFNLENBQUMsRUFBRSxLQUFLLElBQUk7QUFDbEIsZUFBTyxPQUFPLFVBQVUsWUFBWSxRQUFRLFNBQVMsT0FBTyxVQUFVLFlBQVksT0FBTyxNQUFNLFNBQVMsUUFBUTtBQUFBLE1BQ3BILENBQUMsQ0FBQztBQUFBLElBQ047QUFBQSxJQUVBLFVBQVUsT0FBa0M7QUFDeEMsVUFBSTtBQUNBLGNBQU0sbUJBQW1CLEtBQUs7QUFBQSxNQUNsQyxTQUFTLEtBQUs7QUFDVixnQkFBUSxLQUFLLGtEQUFrRCxHQUFHO0FBQUEsTUFDdEU7QUFBQSxJQUNKO0FBQUEsSUFFQSxXQUFXLElBQVk7QUFDbkIsWUFBTSxRQUFRLEtBQUssVUFBVTtBQUM3QixhQUFPLE1BQU0sRUFBRTtBQUNmLFVBQUksQ0FBQyxLQUFLLFlBQVksZUFBZSxLQUFLLEVBQUcsUUFBTztBQUNwRCxZQUFNLFFBQVEsS0FBSyxlQUFlO0FBQ2xDLFVBQUksTUFBTSxPQUFPO0FBQ2IsZUFBTyxNQUFNLEVBQUU7QUFDZixhQUFLLFVBQVUsS0FBSztBQUFBLE1BQ3hCO0FBQ0EsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUVBLGlCQUFpQjtBQUNiLFlBQU0sUUFBUSxLQUFLLGVBQWU7QUFDbEMsYUFBTyxPQUFPLFFBQVEsS0FBSyxVQUFVLENBQUMsRUFBRSxRQUFtQixDQUFDLENBQUMsSUFBSSxJQUFJLE1BQ2pFLGFBQWEsS0FBSyxFQUFFLE1BQU0sU0FBUyxZQUFZLFNBQVMsU0FDbEQsQ0FBQyxFQUFFLElBQUksTUFBTSxpQkFBaUIsTUFBTSxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsSUFDaEQsQ0FBQyxDQUFDO0FBQUEsSUFDaEI7QUFBQSxJQUVBLFlBQVksS0FBYSxPQUFnQjtBQUNyQyxVQUFJO0FBQ0EsY0FBTSxLQUFLLEtBQUs7QUFDaEIsZUFBTztBQUFBLE1BQ1gsUUFBUTtBQUNKLGNBQU0sdURBQXVEO0FBQzdELGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSjtBQUFBLElBRUEsa0JBQWtCO0FBQ2QsVUFBSSxnQkFBZ0IsYUFBYztBQUVsQyxZQUFNLFdBQVc7QUFDakIsYUFBTyxXQUFXLFFBQVEsd0JBQXdCLFVBQVUsTUFBTTtBQUM5RCxjQUFNLFdBQVcsU0FBUyxjQUFjLFFBQVE7QUFDaEQsWUFBSSxDQUFDLFlBQVksU0FBUyxjQUFjLG9CQUFvQixFQUFHO0FBRS9ELGNBQU0sU0FBUyxvQkFBSSxJQUE0QjtBQUMvQyxtQkFBVyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxVQUFVLG1CQUFtQixHQUFHLENBQUMsT0FBTyxnQkFBZ0IsQ0FBQyxHQUFZO0FBQzlGLGdCQUFNLFFBQVEsU0FBUyxjQUFjLE9BQU87QUFDNUMsZ0JBQU0sWUFBWTtBQUNsQixnQkFBTSxRQUFRLFNBQVMsY0FBYyxNQUFNO0FBQzNDLGdCQUFNLGNBQWM7QUFDcEIsZ0JBQU0sUUFBUSxTQUFTLGNBQWMsT0FBTztBQUM1QyxnQkFBTSxPQUFPO0FBQ2IsZ0JBQU0sUUFBUSxLQUFLLFdBQVcsRUFBRSxJQUFJO0FBQ3BDLGlCQUFPLElBQUksTUFBTSxLQUFLO0FBQ3RCLGdCQUFNLFdBQVcsQ0FBQyxTQUFTLFFBQVEsaUJBQWlCLEdBQUcsVUFBVSxTQUFTLFNBQVM7QUFDbkYsZ0JBQU0saUJBQWlCLFVBQVUsTUFBTTtBQUNuQyxrQkFBTSxTQUFTLEtBQUssV0FBVztBQUMvQixnQkFBSSxDQUFDLEtBQUssWUFBWSxvQkFBb0IsRUFBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsRUFBRyxPQUFNLFFBQVEsT0FBTyxJQUFJO0FBQUEsVUFDNUcsQ0FBQztBQUNELGdCQUFNLE9BQU8sT0FBTyxLQUFLO0FBQ3pCLG1CQUFTLFlBQVksS0FBSztBQUFBLFFBQzlCO0FBQ0EsY0FBTSxRQUFRLFNBQVMsY0FBYyxRQUFRO0FBQzdDLGNBQU0sT0FBTztBQUNiLGNBQU0sWUFBWTtBQUNsQixjQUFNLGNBQWM7QUFDcEIsY0FBTSxpQkFBaUIsU0FBUyxNQUFNO0FBQ2xDLGNBQUksQ0FBQyxLQUFLLFlBQVksb0JBQW9CLENBQUMsQ0FBQyxFQUFHO0FBQy9DLHFCQUFXLENBQUMsTUFBTSxLQUFLLEtBQUssT0FBUSxPQUFNLFFBQVEsZUFBZSxJQUFJO0FBQUEsUUFDekUsQ0FBQztBQUNELGNBQU0sU0FBUyxTQUFTLGNBQWMsUUFBUTtBQUM5QyxlQUFPLE9BQU87QUFDZCxlQUFPLFlBQVk7QUFDbkIsZUFBTyxjQUFjO0FBQ3JCLGVBQU8saUJBQWlCLFNBQVMsTUFBTTtBQUFBLFVBQ25DLE1BQU0sS0FBSyxlQUFlO0FBQUEsVUFDMUIsUUFBTSxLQUFLLFdBQVcsRUFBRTtBQUFBLFVBQ3hCLE1BQU07QUFDRixnQkFBSSxDQUFDLEtBQUssWUFBWSxlQUFlLENBQUMsQ0FBQyxFQUFHLFFBQU87QUFDakQsaUJBQUssVUFBVSxDQUFDLENBQUM7QUFDakIsbUJBQU87QUFBQSxVQUNYO0FBQUEsUUFDSixDQUFDO0FBQ0QsY0FBTSxVQUFVLFNBQVMsY0FBYyxLQUFLO0FBQzVDLGdCQUFRLFlBQVk7QUFDcEIsZ0JBQVEsT0FBTyxPQUFPLE1BQU07QUFDNUIsaUJBQVMsWUFBWSxPQUFPO0FBQUEsTUFDaEMsQ0FBQztBQUFBLElBQ0w7QUFBQSxJQUVBLGdCQUFnQjtBQUNaLFdBQUssVUFBVSxPQUFPO0FBQ3RCLFdBQUssV0FBVztBQUFBLElBQ3BCO0FBQUEsSUFFQSxhQUFhLE9BQW1CLE1BQW1CLElBQVk7QUFDM0QsWUFBTSxlQUFlO0FBQ3JCLFlBQU0sZ0JBQWdCO0FBQ3RCLFdBQUssY0FBYztBQUVuQixZQUFNLE9BQU8sU0FBUyxjQUFjLEtBQUs7QUFDekMsV0FBSyxZQUFZO0FBQ2pCLFdBQUssYUFBYSxRQUFRLE9BQU87QUFDakMsV0FBSyxhQUFhLGNBQWMsYUFBYTtBQUM3QyxZQUFNLFlBQVksQ0FBQyxNQUFjLFFBQW9CO0FBQ2pELGNBQU0sU0FBUyxTQUFTLGNBQWMsUUFBUTtBQUM5QyxlQUFPLE9BQU87QUFDZCxlQUFPLGNBQWM7QUFDckIsZUFBTyxpQkFBaUIsU0FBUyxNQUFNO0FBQ25DLGVBQUssY0FBYztBQUNuQixjQUFJLEtBQUssZUFBZSxLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0sR0FBSSxLQUFJO0FBQUEsUUFDN0QsQ0FBQztBQUNELGFBQUssWUFBWSxNQUFNO0FBQUEsTUFDM0I7QUFDQSxpQkFBVyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxVQUFVLGdCQUFnQixHQUFHLENBQUMsT0FBTyxhQUFhLENBQUMsR0FBWTtBQUN4RixrQkFBVSxNQUFNLE1BQU0sS0FBSyxVQUFVLElBQUksSUFBSSxDQUFDO0FBQUEsTUFDbEQ7QUFDQSxVQUFJLEtBQUssUUFBUSxXQUFZLFdBQVUsNkJBQTZCLE1BQU07QUFDdEUsWUFBSSxLQUFLLFdBQVcsRUFBRSxFQUFHLE1BQUssUUFBUTtBQUFBLE1BQzFDLENBQUM7QUFDRCxXQUFLLGlCQUFpQixTQUFTLFdBQVMsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvRCxlQUFTLEtBQUssWUFBWSxJQUFJO0FBQzlCLFdBQUssV0FBVztBQUVoQixZQUFNLFNBQVMsS0FBSyxzQkFBc0I7QUFDMUMsWUFBTSxJQUFJLE1BQU0sV0FBVyxPQUFPO0FBQ2xDLFlBQU0sSUFBSSxNQUFNLFdBQVcsT0FBTztBQUNsQyxXQUFLLE1BQU0sT0FBTyxLQUFLLElBQUksR0FBRyxLQUFLLElBQUksR0FBRyxTQUFTLGdCQUFnQixjQUFjLEtBQUssV0FBVyxDQUFDLElBQUk7QUFDdEcsV0FBSyxNQUFNLE1BQU0sS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLEdBQUcsU0FBUyxnQkFBZ0IsZUFBZSxLQUFLLFlBQVksQ0FBQyxJQUFJO0FBQ3ZHLFdBQUssY0FBYyxRQUFRLEdBQUcsTUFBTSxFQUFFLGVBQWUsS0FBSyxDQUFDO0FBQUEsSUFDL0Q7QUFBQSxJQUVBLGdCQUFnQixNQUFtQixVQUF5QjtBQUN4RCxZQUFNLFFBQVEsb0JBQUksSUFBeUI7QUFDM0MsWUFBTSxZQUFZLG9CQUFJLElBQXNDO0FBRTVELGlCQUFXLE9BQU8sS0FBSyxpQkFBc0MsZUFBZSxHQUFHO0FBQzNFLGNBQU0sT0FBTyxJQUFJLFFBQVEsQ0FBQztBQUMxQixZQUFJLENBQUMsUUFBUSxLQUFLLGNBQWMsS0FBTTtBQUN0QyxjQUFNLE9BQU8sS0FBSyxjQUEyQixXQUFXLEtBQUs7QUFDN0QsWUFBSSxLQUFLLElBQUksYUFBYSxZQUFZLEtBQUssS0FBSyxhQUFhLFdBQVcsS0FDcEUsS0FBSyxjQUFjLGFBQWEsR0FBRyxhQUFhLFdBQVc7QUFDL0QsY0FBTSxZQUFZLElBQUksUUFBUSxjQUFjLEdBQUcsYUFBYSxZQUFZO0FBQ3hFLFlBQUksV0FBVztBQUNYLGNBQUksU0FBUyxVQUFVLElBQUksU0FBUztBQUNwQyxjQUFJLENBQUMsUUFBUTtBQUNULGtCQUFNLGVBQWUsU0FBUyxLQUFLLGFBQVcsT0FBTyxRQUFRLFVBQVUsTUFBTSxTQUFTLEdBQUc7QUFDekYscUJBQVMsb0JBQUksSUFBSTtBQUNqQix1QkFBVyxFQUFFLFVBQVUsVUFBVSxLQUFLLE9BQU8sT0FBTyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUc7QUFDckUsb0JBQU0sY0FBYyxPQUFPLFlBQVksRUFBRSxFQUFFLEtBQUs7QUFDaEQsa0JBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxLQUFLLE9BQU8sU0FBUyxDQUFDLEVBQUc7QUFDM0Qsb0JBQU1BLFdBQVUsT0FBTyxJQUFJLFdBQVcsS0FBSyxvQkFBSSxJQUFZO0FBQzNELGNBQUFBLFNBQVEsSUFBSSxPQUFPLFNBQVMsQ0FBQztBQUM3QixxQkFBTyxJQUFJLGFBQWFBLFFBQU87QUFBQSxZQUNuQztBQUNBLHNCQUFVLElBQUksV0FBVyxNQUFNO0FBQUEsVUFDbkM7QUFDQSxnQkFBTSxVQUFVLE9BQU8sSUFBSSxZQUFZLElBQUksQ0FBQztBQUM1QyxjQUFJLFdBQVcsQ0FBQyxRQUFRLElBQUksTUFBTSxFQUFFLEVBQUcsTUFBSyxRQUFRLFNBQVMsSUFBSSxRQUFRLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUTtBQUFBLFFBQ3JHO0FBQ0EsWUFBSSxNQUFNLGFBQWEsS0FBSyxFQUFFLEVBQUcsT0FBTSxJQUFJLE1BQU0sRUFBRTtBQUFBLE1BQ3ZEO0FBQ0EsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUVBLFVBQVU7QUFDTixZQUFNLE9BQU8sU0FBUyxjQUEyQixLQUFLLFlBQVk7QUFDbEUsV0FBSyxPQUFPO0FBQ1osWUFBTSxXQUFXLEtBQUssV0FBVyxDQUFDLElBQUk7QUFBQSxRQUNsQyxHQUFHLE9BQU8sT0FBTyxPQUFPLFVBQVUsVUFBVSxDQUFDLENBQUM7QUFBQSxRQUM5QyxHQUFHLE9BQU8sT0FBTyxPQUFPLFVBQVUsWUFBWSxDQUFDLENBQUM7QUFBQSxNQUNwRCxFQUFFLE9BQU8sYUFBVyxTQUFTLGNBQWMsSUFBSTtBQUMvQyxZQUFNLFFBQVEsQ0FBQyxPQUFPLG9CQUFJLElBQXlCLElBQUksS0FBSyxXQUN0RCxJQUFJLElBQUksTUFBTSxLQUFLLEtBQUssaUJBQThCLHNCQUFzQixHQUFHLFVBQVEsQ0FBQyxNQUFNLEtBQUssYUFBYSxXQUFXLENBQUMsQ0FBVSxFQUNuSSxPQUFPLENBQUMsVUFBbUQsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLGFBQWEsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFDeEcsS0FBSyxnQkFBZ0IsTUFBTSxRQUFRO0FBRXpDLGlCQUFXLFFBQVEsS0FBSyxNQUFNLEtBQUssR0FBRztBQUNsQyxZQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUc7QUFDckIsZUFBTyxLQUFLLFFBQVE7QUFDcEIsZUFBTyxLQUFLLFFBQVE7QUFBQSxNQUN4QjtBQUVBLFdBQUssUUFBUTtBQUNiLFVBQUksQ0FBQyxLQUFNO0FBQ1gsWUFBTSxRQUFRLEtBQUssVUFBVTtBQUM3QixZQUFNLGFBQWEsS0FBSyxlQUFlO0FBQ3ZDLFlBQU0sY0FBYyxvQkFBSSxJQUFZO0FBQ3BDLFVBQUksZUFBZTtBQUNuQixZQUFNLGVBQWUsQ0FBQyxJQUFZLFNBQXlCO0FBQ3ZELGNBQU0sY0FBYyxPQUFPLFNBQVMsV0FBVyxLQUFLLEtBQUssSUFBSTtBQUM3RCxZQUFJLENBQUMsZUFBZ0IsTUFBTSxFQUFFLE1BQU0sWUFBWSxNQUFNLEVBQUUsTUFBTSxNQUFRLFFBQU87QUFDNUUsY0FBTSxXQUFXLFdBQVcsRUFBRTtBQUM5QixZQUFJLE9BQU8sYUFBYSxZQUFZLFVBQVUsU0FBUyxhQUFhO0FBQ2hFLHFCQUFXLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWTtBQUNyQyx5QkFBZTtBQUFBLFFBQ25CO0FBQ0EsZUFBTztBQUFBLE1BQ1g7QUFDQSxVQUFJLEtBQUssVUFBVTtBQUNmLG1CQUFXLEVBQUUsUUFBUSxTQUFTLEtBQUssT0FBTyxrQkFBa0IsQ0FBQyxHQUFHO0FBQzVELGdCQUFNLEtBQUssT0FBTyxRQUFRLFVBQVU7QUFDcEMsY0FBSSxhQUFhLElBQUksUUFBUSxFQUFHLGFBQVksSUFBSSxFQUFFO0FBQUEsUUFDdEQ7QUFBQSxNQUNKLE9BQU87QUFFSCxtQkFBVyxXQUFXLFVBQVU7QUFDNUIscUJBQVcsRUFBRSxXQUFXLFNBQVMsS0FBSyxPQUFPLE9BQU8sUUFBUSxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUc7QUFDN0Usa0JBQU0sS0FBSyxPQUFPLFNBQVM7QUFDM0IsZ0JBQUksQ0FBQyxZQUFZLElBQUksRUFBRSxLQUFLLGFBQWEsSUFBSSxRQUFRLEVBQUcsYUFBWSxJQUFJLEVBQUU7QUFBQSxVQUM5RTtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQ0EsWUFBTSxTQUFTLEtBQUssV0FBVztBQUMvQixpQkFBVyxDQUFDLE1BQU0sS0FBSyxLQUFLLE9BQU8sUUFBUSxNQUFNLEdBQUc7QUFDaEQsY0FBTSxXQUFXLGNBQWMsT0FBTztBQUN0QyxZQUFJLEtBQUssTUFBTSxpQkFBaUIsUUFBUSxNQUFNLE1BQU8sTUFBSyxNQUFNLFlBQVksVUFBVSxLQUFLO0FBQUEsTUFDL0Y7QUFDQSxpQkFBVyxDQUFDLE1BQU0sRUFBRSxLQUFLLE9BQU87QUFDNUIsWUFBSSxLQUFLLFFBQVEsaUJBQWlCLEdBQUksTUFBSyxRQUFRLGVBQWU7QUFDbEUsY0FBTSxPQUFPLE1BQU0sRUFBRTtBQUNyQixZQUFJLFNBQVMsWUFBWSxTQUFTLE9BQU87QUFDckMsY0FBSSxLQUFLLFFBQVEsZUFBZSxLQUFNLE1BQUssUUFBUSxhQUFhO0FBQ2hFLGNBQUksQ0FBQyxZQUFZLElBQUksRUFBRSxFQUFHLGNBQWEsSUFBSSxZQUFZLElBQUksQ0FBQztBQUFBLFFBQ2hFLFdBQVcsS0FBSyxRQUFRLFlBQVk7QUFDaEMsaUJBQU8sS0FBSyxRQUFRO0FBQUEsUUFDeEI7QUFBQSxNQUNKO0FBQ0EsVUFBSSxhQUFjLE1BQUssVUFBVSxVQUFVO0FBQUEsSUFDL0M7QUFBQSxJQUVBLFVBQVUsSUFBWSxNQUFZO0FBQzlCLFlBQU0sUUFBUSxLQUFLLFVBQVU7QUFDN0IsWUFBTSxFQUFFLElBQUk7QUFFWixVQUFJLEtBQUssWUFBWSxlQUFlLEtBQUssRUFBRyxNQUFLLFFBQVE7QUFBQSxJQUM3RDtBQUFBLElBRUEsZUFBZSxPQUFtQjtBQUM5QixVQUFJLE1BQU0sa0JBQWtCLFFBQVEsS0FBSyxVQUFVLFNBQVMsTUFBTSxNQUFNLEVBQUc7QUFDM0UsV0FBSyxjQUFjO0FBQ25CLFVBQUksTUFBTSxTQUFTLGlCQUFpQixDQUFDLE1BQU0sT0FBUTtBQUVuRCxZQUFNLE9BQU8sTUFBTSxrQkFBa0IsVUFBVSxNQUFNLE9BQU8sUUFBcUIsc0JBQXNCLElBQUk7QUFDM0csVUFBSSxDQUFDLEtBQU07QUFDWCxZQUFNLEtBQUssS0FBSyxNQUFNLElBQUksSUFBSTtBQUM5QixVQUFJLENBQUMsR0FBSTtBQUNULFdBQUssYUFBYSxPQUFPLE1BQU0sRUFBRTtBQUFBLElBQ3JDO0FBQUEsSUFFQSxJQUFJLEVBQUUsUUFBUSxTQUFTLEdBQW1CO0FBQ3RDLFVBQUksS0FBSyxVQUFVLENBQUMsS0FBSyxVQUFVLEdBQUc7QUFBQztBQUFBLE1BQU07QUFFN0MsV0FBSyxXQUFXLGdCQUFnQjtBQUNoQyxVQUFJLEtBQUssV0FBVyxDQUFDLFNBQVMsQ0FBQyxTQUFVO0FBRXpDLFdBQUssZUFBZSxLQUFLLFdBQVcsa0JBQWtCO0FBQ3RELFlBQU0saUJBQWlCLENBQUMsVUFBc0IsS0FBSyxlQUFlLEtBQUs7QUFDdkUsZUFBUyxpQkFBaUIsU0FBUyxnQkFBZ0IsSUFBSTtBQUN2RCxlQUFTLGlCQUFpQixlQUFlLGdCQUFnQixJQUFJO0FBQzdELGVBQVMsaUJBQWlCLFdBQVcsV0FBUztBQUMxQyxZQUFJLE1BQU0sUUFBUSxZQUFZLENBQUMsS0FBSyxTQUFVO0FBQzlDLGNBQU0sZUFBZTtBQUNyQixjQUFNLGdCQUFnQjtBQUN0QixhQUFLLGNBQWM7QUFBQSxNQUN2QixHQUFHLElBQUk7QUFDUCxhQUFPLGlCQUFpQixXQUFXLFdBQVM7QUFDeEMsWUFBSSxDQUFDLE1BQU0sT0FBTyxDQUFDLGVBQWUsb0JBQW9CLGNBQWMsU0FBUyxFQUN4RSxLQUFLLFNBQU8sTUFBTSxRQUFRLGlCQUFpQixHQUFHLEVBQUcsTUFBSyxRQUFRO0FBQUEsTUFDdkUsQ0FBQztBQUVELFlBQU0sV0FBVyxJQUFJLGlCQUFpQixlQUFhO0FBQy9DLGNBQU0sT0FBTyxTQUFTLGNBQWMsS0FBSyxZQUFZO0FBQ3JELFlBQUksU0FBUyxLQUFLLFFBQVMsUUFBUSxVQUFVLEtBQUssQ0FBQyxFQUFFLE9BQU8sTUFBTSxLQUFLLFNBQVMsTUFBTSxDQUFDLEdBQUk7QUFDdkYsZUFBSyxRQUFRO0FBQUEsUUFDakI7QUFBQSxNQUNKLENBQUM7QUFDRCxlQUFTLFFBQVEsU0FBUyxNQUFNO0FBQUEsUUFDNUIsV0FBVztBQUFBLFFBQ1gsZUFBZTtBQUFBLFFBQ2YsU0FBUztBQUFBLFFBQ1QsWUFBWTtBQUFBLFFBQ1osaUJBQWlCLENBQUMsY0FBYyxhQUFhLFlBQVk7QUFBQSxNQUM3RCxDQUFDO0FBRUQsV0FBSyxRQUFRO0FBQ2IsV0FBSyxTQUFTO0FBQUEsSUFDbEI7QUFBQSxFQUNKOzs7QUNoWUEsTUFBTSxnQkFBZ0IsQ0FBQyxDQUFDLFNBQVMsT0FBTyxHQUFHLENBQUMsU0FBUyxPQUFPLENBQUM7QUFDN0QsTUFBTSxnQkFBZ0IsQ0FBQyxDQUFDLE9BQU8sS0FBSyxHQUFHLENBQUMsUUFBUSxTQUFTLENBQUM7QUFFbkQsV0FBUyxtQkFBbUIsS0FBc0I7QUFDckQsUUFBSTtBQUNBLGFBQU8sTUFBTSxHQUFHO0FBQUEsSUFDcEIsUUFBUTtBQUNKLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSjtBQUVPLFdBQVMsc0JBQXNCO0FBQ2xDLFVBQU0sT0FBb0IsbUJBQW1CLGFBQWEsTUFBTSxVQUFVLFVBQVU7QUFDcEYsVUFBTSxPQUFvQixtQkFBbUIsa0JBQWtCLE1BQU0sU0FBUyxTQUFTO0FBQ3ZGLFdBQU8sRUFBRSxNQUFNLEtBQUs7QUFBQSxFQUN4QjtBQUVPLFdBQVMsZUFBZSxJQUFZLFVBQW9DO0FBQzNFLFVBQU0sUUFBUSxtQkFBbUIsbUJBQW1CO0FBQ3BELFFBQUksU0FBUyxPQUFPLFVBQVUsWUFBWSxRQUFRLFNBQVMsTUFBTSxPQUFPLE1BQU0sVUFBVSxPQUFPO0FBQzNGLFVBQUksTUFBTSxTQUFTLFVBQVUsTUFBTSxTQUFTLE1BQU8sUUFBTyxNQUFNO0FBQUEsSUFDcEU7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUVPLFdBQVMsZUFBZSxPQUFlLFFBQXFDO0FBQy9FLFdBQU8sV0FBVyxPQUFPLGVBQWUsTUFBTTtBQUFBLEVBQ2xEO0FBRUEsV0FBUyxXQUE2QixPQUFlLFNBQThDLFFBQTRCO0FBQzNILFVBQU0sUUFBUSxTQUFTLGNBQWMsTUFBTTtBQUMzQyxVQUFNLFlBQVk7QUFDbEIsVUFBTSxhQUFhLFFBQVEsT0FBTztBQUNsQyxVQUFNLGFBQWEsY0FBYyxLQUFLO0FBQ3RDLFVBQU0saUJBQWlCLFdBQVcsV0FBUyxNQUFNLGdCQUFnQixDQUFDO0FBQ2xFLGVBQVcsQ0FBQyxPQUFPLElBQUksS0FBSyxTQUFTO0FBQ2pDLFlBQU0sU0FBUyxTQUFTLGNBQWMsUUFBUTtBQUM5QyxhQUFPLE9BQU87QUFDZCxhQUFPLGNBQWM7QUFDckIsYUFBTyxRQUFRLGdCQUFnQjtBQUMvQixhQUFPLGlCQUFpQixTQUFTLFdBQVM7QUFDdEMsY0FBTSxnQkFBZ0I7QUFDdEIsZUFBTyxLQUFLO0FBQUEsTUFDaEIsQ0FBQztBQUNELFlBQU0sWUFBWSxNQUFNO0FBQUEsSUFDNUI7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUVPLFdBQVMsb0JBQW9CLE9BQW9CLE9BQWU7QUFDbkUsZUFBVyxVQUFVLE1BQU0saUJBQWlCLFFBQVEsR0FBRztBQUNuRCxhQUFPLGFBQWEsZ0JBQWdCLE9BQU8sT0FBTyxRQUFRLGtCQUFrQixLQUFLLENBQUM7QUFBQSxJQUN0RjtBQUFBLEVBQ0o7QUFFTyxXQUFTLHlCQUF5QjtBQUNyQyxRQUFJLGdCQUFnQixhQUFjO0FBRWxDLFVBQU0sV0FBVztBQUNqQixXQUFPLFdBQVcsUUFBUSx3QkFBd0IsVUFBVSxNQUFNO0FBQzlELFlBQU0sT0FBTyxTQUFTLGNBQWMsUUFBUTtBQUM1QyxVQUFJLENBQUMsUUFBUSxLQUFLLGNBQWMsMEJBQTBCLEVBQUc7QUFFN0QsWUFBTSxXQUFXLFNBQVMsY0FBYyxVQUFVO0FBQ2xELGVBQVMsWUFBWTtBQUNyQixlQUFTLGFBQWEsY0FBYywwQkFBMEI7QUFDOUQsWUFBTSxPQUFPLENBQUMsS0FBYSxPQUFlLFVBQXVCO0FBQzdELFlBQUk7QUFDQSxnQkFBTSxLQUFLLEtBQUs7QUFDaEIsOEJBQW9CLE9BQU8sS0FBSztBQUFBLFFBQ3BDLFNBQVMsS0FBSztBQUNWLGtCQUFRLEtBQUssOENBQThDLEdBQUc7QUFBQSxRQUNsRTtBQUFBLE1BQ0o7QUFDQSxZQUFNLFFBQVEsV0FBVyxxQkFBcUIsZUFBZSxXQUFTLEtBQUssZUFBZSxPQUFPLEtBQUssQ0FBQztBQUN2RyxZQUFNLFFBQVEsZUFBZSxnQ0FBZ0MsV0FBUyxLQUFLLG9CQUFvQixPQUFPLEtBQUssQ0FBQztBQUM1RyxZQUFNLFdBQVcsb0JBQW9CO0FBQ3JDLDBCQUFvQixPQUFPLFNBQVMsSUFBSTtBQUN4QywwQkFBb0IsT0FBTyxTQUFTLElBQUk7QUFFeEMsWUFBTSxZQUFZLFNBQVMsY0FBYyxLQUFLO0FBQzlDLGdCQUFVLFlBQVksWUFBWSxxQkFBcUIsbUlBQW1JO0FBQzFMLFlBQU0sWUFBWSxTQUFTLGNBQWMsS0FBSztBQUM5QyxnQkFBVSxZQUFZLFlBQVkscUJBQXFCLCtFQUErRTtBQUN0SSxlQUFTLE9BQU8sV0FBVyxPQUFPLFdBQVcsS0FBSztBQUNsRCxZQUFNLGlCQUFpQixNQUFNLFNBQVMsV0FBVyxDQUFDLEtBQUssVUFBVSxTQUFTLFNBQVM7QUFDbkYscUJBQWU7QUFDZixVQUFJLGlCQUFpQixjQUFjLEVBQUUsUUFBUSxNQUFNLEVBQUUsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDakYsV0FBSyxZQUFZLFFBQVE7QUFBQSxJQUM3QixDQUFDO0FBQUEsRUFDTDs7O0FDbEZPLFdBQVMseUJBQXlCO0FBQ3JDO0FBRUEsUUFBSSxTQUFTLGFBQWEsc0JBQXNCLElBQUksZ0JBQWdCLFNBQVMsTUFBTSxFQUFFLElBQUksS0FBSyxNQUFNLFdBQVk7QUFFaEgsUUFBSTtBQUNBLFVBQUksS0FBSyxNQUFNLGFBQWEsUUFBUSxrQkFBa0IsS0FBSyxNQUFNLEdBQUcsd0JBQXdCLE1BQU87QUFBQSxJQUN2RyxRQUFRO0FBQ0o7QUFBQSxJQUNKO0FBR0EsVUFBTSxRQUFRLFNBQVMsY0FBYyxPQUFPO0FBQzVDLFVBQU0sS0FBSztBQUNYLFVBQU0sY0FBYztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBUXBCLFVBQU0sV0FBVyxJQUFJLGlCQUFpQixNQUFNO0FBQ3hDLFVBQUksQ0FBQyxTQUFTLGdCQUFpQjtBQUMvQixlQUFTLGdCQUFnQixZQUFZLEtBQUs7QUFDMUMsZUFBUyxXQUFXO0FBQUEsSUFDeEIsQ0FBQztBQUNELFFBQUksU0FBUyxnQkFBaUIsVUFBUyxnQkFBZ0IsWUFBWSxLQUFLO0FBQUEsUUFDbkUsVUFBUyxRQUFRLFVBQVUsRUFBRSxXQUFXLEtBQUssQ0FBQztBQUVuRCxlQUFXLE1BQU07QUFDYixlQUFTLFdBQVc7QUFDcEIsWUFBTSxPQUFPO0FBQUEsSUFDakIsR0FBRyxHQUFJO0FBQUEsRUFDWDtBQUVPLE1BQU0sZUFBTixjQUEyQixTQUFTO0FBQUEsSUFDL0IsYUFBYTtBQUFBLElBQ2IsaUJBQWlCO0FBQUEsSUFDakIsV0FBVyxvQkFBb0I7QUFBQSxJQUMvQixPQUEyQjtBQUFBLElBQzNCLFFBQTRCO0FBQUEsSUFDNUIsZ0JBQW9DO0FBQUEsSUFDcEMsYUFBa0M7QUFBQSxJQUNsQyxXQUFnRDtBQUFBLElBQ2hELFdBQW9DO0FBQUEsSUFDcEMsWUFBb0M7QUFBQSxJQUU1QyxjQUFjO0FBQ1YsWUFBTSxVQUFVO0FBQ2hCLFlBQU0sZUFBZTtBQUFBLFFBQ2pCO0FBQUEsUUFDQSxTQUFTO0FBQUEsUUFDVCxPQUFPLFlBQVksbUJBQW1CLGdHQUFnRztBQUFBLE1BQzFJO0FBQ0EsWUFBTSxFQUFFLE1BQU0sU0FBUyxhQUFhLENBQUM7QUFBQSxJQUN6QztBQUFBLElBRUEsWUFBWTtBQUNSLGFBQU8sZ0JBQWdCO0FBQUEsSUFDM0I7QUFBQSxJQUVBLFlBQVksTUFBbUIsVUFBOEM7QUFDekUsWUFBTSxTQUFTLElBQUksSUFBSSxPQUFPLE9BQU8sT0FBTyxVQUFVLFVBQVUsQ0FBQyxDQUFDLEVBQzdELE9BQU8sYUFBVyxTQUFTLGNBQWMsSUFBSSxFQUM3QyxJQUFJLGFBQVcsQ0FBQyxPQUFPLFFBQVEsVUFBVSxHQUFHLE9BQU8sQ0FBQyxDQUFDO0FBRTFELGFBQU8sTUFBTSxLQUFLLEtBQUssaUJBQThCLHNCQUFzQixDQUFDLEVBQUUsUUFBUSxVQUFRO0FBQzFGLGNBQU0sS0FBSyxLQUFLLGFBQWEsWUFBWTtBQUN6QyxZQUFJLENBQUMsR0FBSSxRQUFPLENBQUM7QUFDakIsY0FBTSxVQUFVLE9BQU8sSUFBSSxFQUFFO0FBQzdCLGNBQU0sU0FBUyxLQUFLLGNBQTJCLGlCQUFpQjtBQUNoRSxZQUFJLENBQUMsVUFBVSxTQUFTLElBQUksRUFBRSxFQUFHLFFBQU8sQ0FBQztBQUN6QyxZQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sUUFBUSxjQUFjLEVBQUcsUUFBTyxDQUFDO0FBRXpELGNBQU0sUUFBUSxPQUFPLGNBQTJCLDJDQUEyQztBQUMzRixjQUFNLE9BQU8sU0FBUyxNQUFNLEtBQUssTUFBTSxVQUFVLEVBQzVDLE9BQU8sVUFBUSxFQUFFLGdCQUFnQixZQUFZLENBQUMsS0FBSyxRQUFRLGlEQUFpRCxDQUFDLEVBQzdHLElBQUksVUFBUSxLQUFLLFdBQVcsRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLO0FBQ2pELGVBQU8sQ0FBQztBQUFBLFVBQ0o7QUFBQSxVQUFJO0FBQUEsVUFBTTtBQUFBLFVBQVE7QUFBQSxVQUNsQixNQUFNLFNBQVMsZ0JBQWlCLFFBQVEsa0JBQWtCLFVBQVUsVUFBVSxVQUFXO0FBQUEsVUFDekYsT0FBTyxPQUFPLFFBQVEsU0FBUyxRQUFRLFNBQVMsVUFDM0MsU0FBUyxrQkFBa0IsVUFBVSxrQkFBa0IsVUFBVSxFQUFFLEtBQUs7QUFBQSxRQUNqRixDQUFDO0FBQUEsTUFDTCxDQUFDO0FBQUEsSUFDTDtBQUFBLElBRUEsVUFBVSxVQUF5QjtBQUMvQixVQUFJLEtBQUssV0FBWSxRQUFPLFNBQVMsS0FBSyxhQUFXLFFBQVEsT0FBTyxLQUFLLFVBQVU7QUFFbkYsVUFBSSxLQUFLLFNBQVMsU0FBUyxTQUFTO0FBQ2hDLGNBQU0sUUFBUSxDQUFDLEdBQUcsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLGFBQVcsUUFBUSxTQUFTLE9BQU87QUFDOUUsWUFBSSxNQUFPLFFBQU87QUFBQSxNQUN0QjtBQUNBLGFBQU8sU0FBUyxLQUFLLGFBQVcsUUFBUSxTQUFTLE9BQU8sS0FDcEQsU0FBUyxLQUFLLGFBQVcsUUFBUSxTQUFTLElBQUksS0FBSyxTQUFTLENBQUM7QUFBQSxJQUNyRTtBQUFBLElBRUEsZ0JBQWdCLE1BQW1CLFVBQXlCLFVBQStCO0FBQ3ZGLFVBQUksQ0FBQyxLQUFLLGNBQWMsU0FBUyxLQUFLLENBQUMsRUFBRSxHQUFHLE1BQU0sT0FBTyxLQUFLLFVBQVUsRUFBRztBQUUzRSxZQUFNLFNBQVMsT0FBTyxVQUFVO0FBQ2hDLFlBQU0sVUFBVSxTQUFTLGVBQWUsY0FBYyxLQUFLLGNBQWMsaUJBQWlCLEtBQ3RGLFVBQVUsQ0FBQyxPQUFPLE9BQU8sTUFBTSxFQUFFLEtBQUssYUFBVyxPQUFPLFNBQVMsVUFBVSxNQUFNLEtBQUssVUFBVTtBQUNwRyxVQUFJLENBQUMsU0FBUyxJQUFJLEtBQUssVUFBVSxLQUFLLENBQUMsUUFBUztBQUVoRCxZQUFNLFlBQVksS0FBSztBQUN2QixXQUFLLGFBQWE7QUFDbEIsV0FBSyxXQUFXLEtBQUs7QUFDckIsVUFBSTtBQUNBLFlBQUksT0FBTyxNQUFNLGdCQUFnQixDQUFDLE1BQU0sVUFBVyxNQUFLLGdCQUFnQjtBQUFBLE1BQzVFLFNBQVMsS0FBSztBQUNWLGdCQUFRLEtBQUssMERBQTBELEdBQUc7QUFBQSxNQUM5RTtBQUFBLElBQ0o7QUFBQSxJQUVBLFdBQVcsTUFBbUIsVUFBeUI7QUFDbkQsWUFBTSxRQUFRLElBQUksSUFBSSxTQUFTLElBQUksQ0FBQyxFQUFFLE9BQU8sT0FBTyxNQUFNLFNBQVMsTUFBTSxDQUFDO0FBQzFFLGlCQUFXLFdBQVcsS0FBSyxpQkFBaUIsaURBQWlELEdBQUc7QUFDNUYsWUFBSSxDQUFDLFFBQVEsaUJBQWlCLENBQUMsTUFBTSxJQUFJLFFBQVEsYUFBYSxFQUFHLFNBQVEsT0FBTztBQUFBLE1BQ3BGO0FBRUEsaUJBQVcsRUFBRSxJQUFJLE9BQU8sUUFBUSxNQUFNLEtBQUssVUFBVTtBQUNqRCxjQUFNLE9BQU8sU0FBUztBQUN0QixZQUFJLE1BQU0sS0FBSyxjQUFpQyw4QkFBOEI7QUFDOUUsWUFBSSxDQUFDLEtBQUs7QUFDTixnQkFBTSxTQUFTLFNBQVMsY0FBYyxRQUFRO0FBQzlDLGlCQUFPLE9BQU87QUFDZCxpQkFBTyxZQUFZO0FBQ25CLGlCQUFPLGlCQUFpQixTQUFTLFdBQVM7QUFDdEMsa0JBQU0sZUFBZTtBQUNyQixrQkFBTSxnQkFBZ0I7QUFDdEIsa0JBQU0sWUFBWSxPQUFPLFFBQVEsc0JBQXNCLEdBQUcsYUFBYSxZQUFZO0FBQ25GLGdCQUFJLENBQUMsVUFBVztBQUVoQixrQkFBTSxPQUFPLEtBQUssZUFBZSxZQUFZLEtBQUs7QUFDbEQsZ0JBQUk7QUFDQSxrQkFBSSxLQUFNLE9BQU0sa0JBQWtCLElBQUk7QUFBQSxrQkFDakMsTUFBSyxnQkFBZ0I7QUFDMUIsbUJBQUssYUFBYTtBQUNsQixtQkFBSyxpQkFBaUI7QUFDdEIsbUJBQUssV0FBVztBQUFBLFlBQ3BCLFNBQVMsS0FBSztBQUNWLHNCQUFRLEtBQUssaURBQWlELEdBQUc7QUFBQSxZQUNyRTtBQUNBLGlCQUFLLFFBQVE7QUFBQSxVQUNqQixDQUFDO0FBQ0QsZ0JBQU0sS0FBSyxZQUFZLE1BQU07QUFBQSxRQUNqQztBQUNBLGNBQU0sU0FBUyxLQUFLLGVBQWU7QUFDbkMsWUFBSSxhQUFhLGdCQUFnQixPQUFPLE1BQU0sQ0FBQztBQUMvQyxZQUFJLGFBQWEsY0FBYyxTQUFTLFNBQVMsS0FBSyxLQUFLLE9BQU8sS0FBSyxvQkFBb0I7QUFDM0YsWUFBSSxRQUFRLFNBQVMsZ0RBQWdEO0FBRXJFLFlBQUksV0FBVyxLQUFLLGNBQTJCLHFDQUFxQztBQUNwRixZQUFJLENBQUMsUUFBUTtBQUNULG9CQUFVLE9BQU87QUFDakI7QUFBQSxRQUNKO0FBQ0EsWUFBSSxDQUFDLFVBQVU7QUFDWCxnQkFBTSxTQUFTLGVBQWUsNEJBQTRCLFVBQVE7QUFDOUQsZ0JBQUk7QUFDQSxvQkFBTSxxQkFBcUIsRUFBRSxJQUFJLEtBQUssQ0FBQztBQUN2QyxrQ0FBb0IsUUFBUSxJQUFJO0FBQUEsWUFDcEMsU0FBUyxLQUFLO0FBQ1Ysc0JBQVEsS0FBSyxtREFBbUQsR0FBRztBQUFBLFlBQ3ZFO0FBQUEsVUFDSixDQUFDO0FBQ0QsaUJBQU8sVUFBVSxJQUFJLDJCQUEyQjtBQUNoRCxjQUFJLE1BQU0sTUFBTTtBQUNoQixxQkFBVztBQUFBLFFBQ2Y7QUFDQSw0QkFBb0IsVUFBVSxlQUFlLElBQUksS0FBSyxTQUFTLElBQUksQ0FBQztBQUFBLE1BQ3hFO0FBQUEsSUFDSjtBQUFBLElBRUEscUJBQXFCLE1BQW1CLE9BQW9CO0FBQ3hELFlBQU0sV0FBVyxLQUFLLGNBQWMsd0JBQXdCLEdBQUcsUUFBUSxzQkFBc0I7QUFDN0YsVUFBSSxTQUFVLFFBQU8sU0FBUyxhQUFhLFlBQVk7QUFFdkQsWUFBTSxTQUFTLE1BQU0sS0FBSyxNQUFNLGlCQUFpQixzQkFBc0IsQ0FBQyxFQUNuRSxPQUFPLFdBQVMsTUFBTSxlQUFlLEVBQUUsVUFBVSxpQkFBaUIsS0FBSyxFQUFFLGVBQWUsU0FBUztBQUN0RyxhQUFPLE9BQU8sV0FBVyxJQUFJLE9BQU8sQ0FBQyxFQUFFLGFBQWEsWUFBWSxJQUFJO0FBQUEsSUFDeEU7QUFBQSxJQUVBLGdCQUFnQixPQUFvQixXQUEwQjtBQUMxRCxVQUFJLENBQUMsV0FBVztBQUNaLGNBQU0saUJBQWlCLHVCQUF1QixFQUFFLFFBQVEsV0FBUyxNQUFNLFVBQVUsT0FBTyxzQkFBc0IsQ0FBQztBQUMvRztBQUFBLE1BQ0o7QUFDQSxpQkFBVyxTQUFTLE1BQU0saUJBQWlCLHNCQUFzQixHQUFHO0FBQ2hFLGNBQU0sVUFBVSxPQUFPLHdCQUF3QixNQUFNLGFBQWEsWUFBWSxNQUFNLFNBQVM7QUFBQSxNQUNqRztBQUFBLElBQ0o7QUFBQSxJQUVBLFVBQVUsT0FBb0I7QUFDMUIsWUFBTSxNQUFNLE1BQU0sY0FBYyxrQ0FBa0M7QUFDbEUsVUFBSSxJQUFLLFFBQU87QUFFaEIsWUFBTSxVQUFVLE9BQU8sUUFBUSxRQUFRLE9BQU8sT0FBTyxPQUFPO0FBQzVELFVBQUksVUFBVSxLQUFNLFFBQU87QUFFM0IsYUFBTyxNQUFNLEtBQUssTUFBTSxpQkFBaUIsMkJBQTJCLENBQUMsRUFDaEUsS0FBSyxTQUFPLElBQUksYUFBYSxZQUFZLE1BQU0sT0FBTyxNQUFNLENBQUM7QUFBQSxJQUN0RTtBQUFBLElBRUEsV0FBVyxVQUF1QjtBQUM5QixRQUFFLFFBQVEsRUFBRSxLQUFLLE1BQU0sS0FBSztBQUU1QixZQUFNLGVBQWUsTUFBTTtBQUFBLE1BQUM7QUFDNUIsWUFBTSxNQUFNLE9BQU8seUJBQXlCLFFBQVEsV0FBVyxXQUFXLEdBQUc7QUFDN0UsWUFBTSxjQUFjLE9BQU8sUUFBUTtBQUFBLFFBQy9CLFdBQVcsRUFBRSxLQUFLLEtBQUssYUFBYTtBQUFBLFFBQ3BDLFFBQVEsRUFBRSxPQUFPLGNBQWMsVUFBVSxLQUFLO0FBQUEsUUFDOUMsVUFBVSxFQUFFLE9BQU8sY0FBYyxVQUFVLEtBQUs7QUFBQSxRQUNoRCxVQUFVLEVBQUUsT0FBTyxjQUFjLFVBQVUsS0FBSztBQUFBLE1BQ3BELENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLE9BQU8sVUFBVSxHQUFHLENBQUM7QUFDbEQsaUJBQVcsQ0FBQyxLQUFLLFVBQVUsS0FBSyxhQUFhO0FBQ3pDLGVBQU8sZUFBZSxVQUFVLEtBQUssRUFBRSxHQUFHLFlBQVksY0FBYyxLQUFLLENBQUM7QUFBQSxNQUM5RTtBQUVBLGFBQU8sTUFBTTtBQUNULFVBQUUsUUFBUSxFQUFFLEtBQUssTUFBTSxLQUFLO0FBQzVCLG1CQUFXLENBQUMsS0FBSyxVQUFVLEtBQUssYUFBYTtBQUN6QyxnQkFBTSxVQUFVLE9BQU8seUJBQXlCLFVBQVUsR0FBRztBQUM3RCxjQUFJLFdBQVcsUUFBUSxVQUFVLFdBQVcsU0FBUyxRQUFRLFFBQVEsV0FBVyxJQUFLLFNBQVEsZUFBZSxVQUFVLEdBQUc7QUFBQSxRQUM3SDtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFFQSxPQUFPLFVBQXVCLFFBQW9DLFNBQVMsT0FBTztBQUM5RSxVQUFJLE1BQU07QUFDVixVQUFJLFFBQVE7QUFDUixjQUFNLFNBQVMsU0FBUyxzQkFBc0I7QUFDOUMsY0FBTSxRQUFRLE9BQU8sU0FBUyxTQUFTO0FBQ3ZDLFlBQUksQ0FBQyxNQUFPO0FBRVosY0FBTSxPQUFPLE9BQU8sc0JBQXNCO0FBQzFDLGNBQU0sU0FBUyxhQUFhLEtBQUssTUFBTSxPQUFPLE9BQU8sUUFBUSxTQUFTO0FBQ3RFLFlBQUksT0FBUSxTQUFRLFNBQVMsZUFBZSxLQUFLLFNBQVMsU0FBUztBQUFBLE1BQ3ZFO0FBQ0EsWUFBTSxLQUFLLElBQUksR0FBRyxLQUFLLElBQUksU0FBUyxlQUFlLFNBQVMsY0FBYyxHQUFHLENBQUM7QUFDOUUsVUFBSSxLQUFLLElBQUksTUFBTSxTQUFTLFNBQVMsS0FBSyxHQUFHO0FBQ3pDLGNBQU0sV0FBVyxRQUFRLFVBQVU7QUFDbkMsaUJBQVMsS0FBSyxVQUFVLEVBQUUsS0FBSyxVQUFVLFVBQVUsQ0FBQztBQUFBLE1BQ3hEO0FBQUEsSUFDSjtBQUFBLElBRUEsWUFBWSxNQUFtQixPQUFvQixFQUFFLElBQUksTUFBTSxRQUFRLE1BQU0sR0FBZ0I7QUFDekYsaUJBQVcsUUFBUSxDQUFDLE1BQU0sS0FBSyxFQUFHLE1BQUssVUFBVSxJQUFJLDBCQUEwQix3QkFBd0I7QUFDdkcsWUFBTSxPQUFPLE9BQU8sS0FBSyxhQUFhLGVBQWUsSUFBSSxLQUFLLFNBQVMsSUFBSSxJQUFJLEtBQUssU0FBUztBQUM3RixZQUFNLGlCQUFpQixTQUFTO0FBQ2hDLFlBQU0sY0FBYyxLQUFLLFdBQVcsSUFBSTtBQUN4QyxVQUFJO0FBQ0osVUFBSTtBQUNKLFVBQUksYUFBYTtBQUNqQixVQUFJO0FBRUosWUFBTSxXQUFXLE1BQU0sTUFBTSxLQUFLLE1BQU0saUJBQWlCLHNCQUFzQixDQUFDLEVBQzNFLEtBQUssV0FBUyxNQUFNLGFBQWEsWUFBWSxNQUFNLEVBQUUsR0FBRyxjQUEyQixrQkFBa0I7QUFDMUcsWUFBTSxjQUFjLE1BQU07QUFDdEIsY0FBTSxPQUFPLFNBQVM7QUFDdEIsWUFBSSxVQUFVLEtBQU07QUFDcEIsdUJBQWU7QUFDZixnQkFBUTtBQUNSLHVCQUFlLFFBQVEsS0FBSyxXQUFXLEtBQUssSUFBSTtBQUFBLE1BQ3BEO0FBQ0EsWUFBTSxTQUFTLE1BQU07QUFDakIsbUJBQVcsUUFBUSxDQUFDLE1BQU0sS0FBSyxFQUFHLE1BQUssVUFBVSxPQUFPLHdCQUF3QjtBQUNoRixpQkFBUyxlQUFlLHdCQUF3QixHQUFHLE9BQU87QUFBQSxNQUM5RDtBQUNBLFlBQU0sVUFBVSxNQUFNO0FBQ2xCLFlBQUksQ0FBQyxLQUFLLGVBQWUsQ0FBQyxNQUFNLGVBQWUsQ0FBQyxLQUFLLFNBQVMsSUFBSSxFQUFHO0FBRXJFLG9CQUFZO0FBQ1osY0FBTSxXQUFXLEtBQUsscUJBQXFCLE1BQU0sS0FBSztBQUN0RCxZQUFJLGFBQWEsTUFBTSxhQUFhLGFBQWE7QUFDN0Msd0JBQWM7QUFDZCxlQUFLLGdCQUFnQixPQUFPLElBQUk7QUFDaEMsV0FBQyxTQUFTLFFBQVEsTUFBTTtBQUN4QixzQkFBWTtBQUFBLFFBQ2hCO0FBQ0EsWUFBSSxDQUFDLE9BQU8sZ0JBQWdCLEtBQUsscUJBQXFCLE1BQU0sS0FBSyxNQUFNLE1BQ2xFLGtCQUFrQixDQUFDLE1BQU0sY0FBYyxZQUFZLEVBQUk7QUFDNUQsc0JBQWM7QUFDZCxhQUFLLGdCQUFnQixPQUFPLEVBQUU7QUFDOUIsYUFBSyxPQUFPLE1BQU0sSUFBSTtBQUN0QixhQUFLLE9BQU8sT0FBTyxpQkFBaUIsS0FBSyxVQUFVLEtBQUssSUFBSSxNQUFNLGNBQWM7QUFDaEYsWUFBSSxDQUFDLFlBQVk7QUFDYix1QkFBYTtBQUNiLHVCQUFhLEtBQUs7QUFDbEIsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSjtBQUdBLFlBQU0sV0FBVyxDQUFDLFVBQWlCO0FBQy9CLFlBQUksTUFBTSxXQUFXLFFBQVEsTUFBTSxXQUFXLE1BQU8sU0FBUTtBQUFBLE1BQ2pFO0FBQ0EsWUFBTSxjQUFjLENBQUMsZUFBZSxjQUFjLFNBQVMsT0FBTztBQUNsRSxZQUFNLFVBQVUsQ0FBQyxVQUFpQjtBQUM5QixZQUFJLE1BQU0sVUFBVyxNQUFLO0FBQUEsTUFDOUI7QUFDQSxZQUFNLFlBQVksQ0FBQyxVQUF5QjtBQUN4QyxZQUFJLE1BQU0sYUFBYSxDQUFDLE9BQU8sV0FBVyxhQUFhLFVBQVUsWUFBWSxRQUFRLE9BQU8sU0FBUyxHQUFHLEVBQUUsU0FBUyxNQUFNLEdBQUcsRUFBRyxNQUFLO0FBQUEsTUFDeEk7QUFDQSxZQUFNLFlBQVksTUFBTTtBQUNwQixzQkFBYztBQUNkLGdCQUFRO0FBQUEsTUFDWjtBQUNBLFlBQU0sT0FBTyxDQUFDLFNBQVMsU0FBUztBQUM1QixvQkFBWTtBQUNaLHVCQUFlO0FBQ2YsbUJBQVcsUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHO0FBQzlCLGVBQUssb0JBQW9CLFVBQVUsVUFBVSxJQUFJO0FBQ2pELGVBQUssVUFBVSxPQUFPLDBCQUEwQix3QkFBd0I7QUFBQSxRQUM1RTtBQUNBLG1CQUFXLFNBQVMsWUFBYSxVQUFTLG9CQUFvQixPQUFPLFNBQVMsSUFBSTtBQUNsRixpQkFBUyxvQkFBb0IsV0FBVyxXQUFXLElBQUk7QUFDdkQsZUFBTyxvQkFBb0IsUUFBUSxTQUFTO0FBQzVDLHFCQUFhLEtBQUs7QUFDbEIsYUFBSyxXQUFXO0FBQ2hCLGFBQUssYUFBYTtBQUNsQixhQUFLLGdCQUFnQjtBQUNyQixZQUFJLFFBQVE7QUFDUixlQUFLLGlCQUFpQjtBQUN0QixpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKO0FBQ0EsWUFBTSxRQUFRLFdBQVcsTUFBTSxHQUFJO0FBQ25DLFdBQUssV0FBVztBQUNoQixXQUFLLGFBQWE7QUFDbEIsV0FBSyxnQkFBZ0I7QUFDckIsaUJBQVcsUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHO0FBQzlCLGFBQUssaUJBQWlCLFVBQVUsVUFBVSxFQUFFLFNBQVMsTUFBTSxTQUFTLEtBQUssQ0FBQztBQUFBLE1BQzlFO0FBQ0EsaUJBQVcsU0FBUyxZQUFhLFVBQVMsaUJBQWlCLE9BQU8sU0FBUyxFQUFFLFNBQVMsTUFBTSxTQUFTLEtBQUssQ0FBQztBQUMzRyxlQUFTLGlCQUFpQixXQUFXLFdBQVcsSUFBSTtBQUNwRCxVQUFJLFNBQVMsZUFBZSxXQUFZLFFBQU8saUJBQWlCLFFBQVEsV0FBVyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQ2pHLGNBQVE7QUFBQSxJQUNaO0FBQUEsSUFFQSxVQUFVO0FBQ04sWUFBTSxPQUFPLFNBQVMsY0FBMkIsbUNBQW1DO0FBQ3BGLFlBQU0sUUFBUSxTQUFTLGNBQTJCLHVCQUF1QjtBQUN6RSxVQUFJLEtBQUssYUFBYSxLQUFLLFNBQVMsUUFBUSxLQUFLLFVBQVUsU0FBUyxDQUFDLE1BQU0sU0FBUyxLQUFLLGFBQWEsSUFBSTtBQUN0RyxhQUFLLFNBQVMsS0FBSztBQUNuQixZQUFJLEtBQUssTUFBTyxNQUFLLGdCQUFnQixLQUFLLE9BQU8sSUFBSTtBQUFBLE1BQ3pEO0FBQ0EsV0FBSyxPQUFPO0FBQ1osV0FBSyxRQUFRO0FBQ2IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxlQUFlLEVBQUUsVUFBVSxpQkFBaUIsSUFBSSxFQUFFLGVBQWUsVUFBVztBQUV6RyxZQUFNLFdBQVcsSUFBSSxJQUFJLE9BQU8sT0FBTyxPQUFPLFVBQVUsWUFBWSxDQUFDLENBQUMsRUFDakUsT0FBTyxhQUFXLFNBQVMsY0FBYyxJQUFJLEVBQUUsSUFBSSxhQUFXLE9BQU8sUUFBUSxVQUFVLENBQUMsQ0FBQztBQUM5RixpQkFBVyxTQUFTLEtBQUssaUJBQWlCLHVDQUF1QyxHQUFHO0FBQ2hGLGNBQU0sS0FBSyxNQUFNLFFBQVEsc0JBQXNCLEdBQUcsYUFBYSxZQUFZO0FBQzNFLFlBQUksR0FBSSxVQUFTLElBQUksRUFBRTtBQUFBLE1BQzNCO0FBQ0EsWUFBTSxXQUFXLEtBQUssWUFBWSxNQUFNLFFBQVE7QUFDaEQsV0FBSyxnQkFBZ0IsTUFBTSxVQUFVLFFBQVE7QUFDN0MsV0FBSyxXQUFXLE1BQU0sUUFBUTtBQUU5QixVQUFJLEtBQUssWUFBWTtBQUNqQixhQUFLLFdBQVc7QUFDaEI7QUFBQSxNQUNKO0FBQ0EsVUFBSSxLQUFLLGdCQUFnQjtBQUNyQixjQUFNLFNBQVMsS0FBSyxVQUFVLFFBQVE7QUFDdEMsWUFBSSxPQUFRLE1BQUssWUFBWSxNQUFNLE9BQU8sTUFBTTtBQUFBLGlCQUN2QyxTQUFTLGVBQWUsY0FBYyxDQUFDLEtBQUssWUFBWTtBQUM3RCxtQkFBUyxlQUFlLHdCQUF3QixHQUFHLE9BQU87QUFBQSxRQUM5RDtBQUFBLE1BQ0osT0FBTztBQUNILGFBQUssZ0JBQWdCLE9BQU8sS0FBSyxxQkFBcUIsTUFBTSxLQUFLLENBQUM7QUFBQSxNQUN0RTtBQUFBLElBQ0o7QUFBQSxJQUVBLE1BQU07QUFDRixVQUFJLEtBQUssVUFBVSxDQUFDLEtBQUssVUFBVSxHQUFHO0FBQUM7QUFBQSxNQUFNO0FBRTdDLFlBQU0sTUFBTSxtQkFBbUIsZ0JBQWdCO0FBQy9DLFdBQUssY0FBZSxPQUFPLFFBQVEsWUFBWSxPQUFPLFFBQVEsYUFBYSxNQUFPLE9BQU8sR0FBRyxJQUFJO0FBQ2hHLFdBQUssaUJBQWlCO0FBQ3RCLFdBQUssV0FBVyxvQkFBb0I7QUFDcEMsV0FBSyxZQUFZLElBQUksZ0JBQWdCO0FBQ3JDLFlBQU0sRUFBRSxPQUFPLElBQUksS0FBSztBQUN4QixXQUFLLFdBQVcsSUFBSSxpQkFBaUIsZUFBYTtBQUM5QyxjQUFNLE9BQU8sU0FBUyxjQUFjLG1DQUFtQztBQUN2RSxjQUFNLFFBQVEsU0FBUyxjQUFjLHVCQUF1QjtBQUM1RCxZQUFJLFNBQVMsS0FBSyxRQUFRLFVBQVUsS0FBSyxTQUFTLFVBQVUsS0FBSyxDQUFDLEVBQUUsT0FBTyxNQUN0RSxTQUFTLEtBQUssU0FBUyxNQUFNLEtBQUssT0FBTyxTQUFTLElBQUksTUFDdEQsVUFBVSxNQUFNLFNBQVMsTUFBTSxLQUFLLE9BQU8sU0FBUyxLQUFLLEVBQUcsR0FBRztBQUNoRSxlQUFLLFFBQVE7QUFBQSxRQUNqQjtBQUFBLE1BQ0osQ0FBQztBQUNELFdBQUssU0FBUyxRQUFRLFNBQVMsTUFBTTtBQUFBLFFBQUUsV0FBVztBQUFBLFFBQU0sU0FBUztBQUFBLFFBQU0sWUFBWTtBQUFBLFFBQy9FLGlCQUFpQixDQUFDLFNBQVMsU0FBUyxVQUFVLFlBQVk7QUFBQSxNQUFFLENBQUM7QUFDakUsVUFBSSxTQUFTLGVBQWUsV0FBWSxRQUFPLGlCQUFpQixRQUFRLE1BQU0sS0FBSyxRQUFRLEdBQUcsRUFBRSxNQUFNLE1BQU0sT0FBTyxDQUFDO0FBQ3BILGVBQVMsS0FBSyxpQkFBaUIsU0FBUyxXQUFTO0FBQzdDLFlBQUksTUFBTSxhQUFhLE1BQU0sa0JBQWtCLFdBQVcsS0FBSyxTQUFTLEtBQUssTUFBTSxTQUFTLE1BQU0sTUFBTSxLQUNwRyxNQUFNLE9BQU8sUUFBUSxpQkFBaUIsR0FBRztBQUN6QyxlQUFLLGlCQUFpQjtBQUN0QixlQUFLLGdCQUFnQixLQUFLLE9BQU8sSUFBSTtBQUNyQyxtQkFBUyxlQUFlLHdCQUF3QixHQUFHLE9BQU87QUFBQSxRQUM5RDtBQUFBLE1BQ0osR0FBRyxFQUFFLFNBQVMsTUFBTSxPQUFPLENBQUM7QUFDNUIsV0FBSyxRQUFRO0FBQ2IsV0FBSyxTQUFTO0FBQUEsSUFDbEI7QUFBQSxJQUVBLFdBQVc7QUFDUCxXQUFLLFVBQVUsV0FBVztBQUMxQixXQUFLLFdBQVcsTUFBTTtBQUN0QixXQUFLLFdBQVc7QUFDaEIsV0FBSyxpQkFBaUI7QUFDdEIsV0FBSyxNQUFNLGlCQUFpQixpREFBaUQsRUFBRSxRQUFRLGFBQVcsUUFBUSxPQUFPLENBQUM7QUFDbEgsVUFBSSxLQUFLLE1BQU8sTUFBSyxnQkFBZ0IsS0FBSyxPQUFPLElBQUk7QUFDckQsZUFBUyxlQUFlLHdCQUF3QixHQUFHLE9BQU87QUFDMUQsV0FBSyxTQUFTO0FBQUEsSUFDbEI7QUFBQSxFQUNKOzs7QUNqYk8sTUFBTSxjQUFOLGNBQTBCLFNBQVM7QUFBQSxJQUN0QyxjQUFjO0FBQ1YsWUFBTSxVQUFVO0FBQ2hCLFlBQU0sZUFBZTtBQUFBLFFBQ2pCO0FBQUEsUUFDQSxTQUFTO0FBQUEsUUFDVCxPQUFPLFlBQVksb0JBQW9CLG9HQUFvRztBQUFBLE1BQy9JO0FBQ0EsWUFBTSxFQUFDLE1BQU0sU0FBUyxhQUFZLENBQUM7QUFBQSxJQUN2QztBQUFBLElBRUEsWUFBWTtBQUNSLGFBQU8sWUFBWSxTQUFTLGVBQWU7QUFBQSxJQUMvQztBQUFBLElBRUEsTUFBTTtBQUNGLFVBQUksS0FBSyxVQUFVLENBQUMsS0FBSyxVQUFVLEdBQUc7QUFBQztBQUFBLE1BQU07QUFFN0MsYUFBTyxXQUFXLFFBQVEsd0JBQXdCLHFCQUFxQixNQUFNO0FBQ3pFLGNBQU0sVUFBVSxTQUFTLGNBQWMsbUJBQW1CO0FBQzFELFlBQUksQ0FBQyxXQUFXLFFBQVEsY0FBYyxjQUFjLEVBQUc7QUFFdkQsY0FBTSxFQUFFLGdCQUFnQixxQkFBcUIsV0FBVyxJQUFJO0FBQzVELGNBQU0sT0FBTyxPQUFPLG1CQUFtQjtBQUN2QyxZQUFJLEVBQUUsT0FBTyxLQUFLLE9BQU8sT0FBTyxVQUFVLEdBQUk7QUFDOUMsY0FBTSxVQUFVLE9BQU8sUUFBUSxRQUFRLE9BQU8sT0FBTyxPQUFPO0FBQzVELFlBQUksQ0FBQyxNQUFNLFFBQVEsY0FBYyxLQUFLLFVBQVUsS0FBTTtBQUV0RCxjQUFNLFNBQVMsZUFBZSxLQUFLLENBQUMsRUFBRSxRQUFBQyxRQUFPLE1BQU0sT0FBT0EsU0FBUSxVQUFVLE1BQU0sT0FBTyxNQUFNLENBQUM7QUFDaEcsY0FBTSxPQUFPLE9BQU8sUUFBUSxLQUFLO0FBQ2pDLFlBQUksQ0FBQyxPQUFPLFVBQVUsSUFBSSxLQUFLLE9BQU8sRUFBRztBQUV6QyxjQUFNLGNBQWMsZUFBZTtBQUNuQyxjQUFNLGdCQUFnQixLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssY0FBYyxLQUFLLEdBQUcsQ0FBQztBQUNwRSxjQUFNLGNBQWMsUUFBUTtBQUM1QixjQUFNLGlCQUFpQixjQUFjLGdCQUFnQixJQUFJO0FBQ3pELGNBQU0sU0FBUyxlQUFlLEtBQUssQ0FBQyxFQUFFLE1BQU0sTUFBTSxPQUFPLEtBQUssTUFBTSxjQUFjO0FBQ2xGLFlBQUksUUFBUSx3QkFBd0IsUUFBUSxRQUFRLHdCQUF3QixLQUFNO0FBRWxGLGNBQU0sUUFBUSxPQUFPLE9BQU8sb0JBQW9CO0FBQ2hELGNBQU0sY0FBYyxPQUFPLE9BQU8sb0JBQW9CO0FBQ3RELFlBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxLQUFLLENBQUMsT0FBTyxTQUFTLFdBQVcsRUFBRztBQUU5RCxjQUFNLFNBQVMsSUFBSSxLQUFLLGFBQWE7QUFDckMsY0FBTSxTQUFTLGNBQWMsY0FBYyxjQUFjO0FBQ3pELGNBQU0sYUFBYSxjQUFjLFFBQVEsU0FBUyxTQUFTO0FBQzNELGNBQU0sT0FBTyxPQUFPLGFBQWEsNkVBQTZFLE9BQU8sT0FBTyxXQUFXLENBQUM7QUFDeEksY0FBTSxhQUFhLGNBQ2IsUUFBUSxjQUFjLFFBQVEsT0FBTyxPQUFPLE1BQU0sQ0FBQyx5QkFBeUIsT0FBTyxPQUFPLFVBQVUsQ0FBQyxhQUNyRyxZQUFZLE9BQU8sT0FBTyxNQUFNLENBQUMsd0JBQXdCLGNBQWM7QUFDN0UsY0FBTSxVQUFVLEdBQUcsSUFBSSxJQUFJLFVBQVU7QUFFckMsY0FBTSxRQUFRLFNBQVMsY0FBYyxNQUFNO0FBQzNDLGNBQU0sWUFBWTtBQUNsQixjQUFNLGFBQWEsWUFBWSxPQUFPO0FBQ3RDLGNBQU0sYUFBYSxXQUFXLEVBQUU7QUFDaEMsY0FBTSxhQUFhLGNBQWMsT0FBTztBQUV4QyxjQUFNLFFBQVEsU0FBUyxjQUFjLE1BQU07QUFDM0MsY0FBTSxZQUFZO0FBQ2xCLGNBQU0sTUFBTSxrQkFBa0I7QUFDOUIsY0FBTSxNQUFNLFlBQVk7QUFDeEIsY0FBTSxjQUFjLE9BQU8sYUFBYTtBQUN4QyxjQUFNLE9BQU8sT0FBTyxHQUFHLGVBQWUsSUFBSSxLQUFLLGNBQWMsTUFBTSxHQUFHLEdBQUcsT0FBTyxPQUFPLEtBQUssSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFO0FBQzlHLGdCQUFRLGFBQWEsT0FBTyxRQUFRLGNBQWMsMkJBQTJCLENBQUM7QUFBQSxNQUNsRixDQUFDO0FBRUQsV0FBSyxTQUFTO0FBQUEsSUFDbEI7QUFBQSxFQUNKOzs7QUNwRU8sTUFBTSxpQkFBTixjQUE2QixTQUFTO0FBQUEsSUFDeEIsaUJBQWlCO0FBQUEsSUFDakIsZ0JBQWdCO0FBQUEsSUFFakMsY0FBYztBQUNWLFlBQU0sVUFBVTtBQUNoQixZQUFNLGVBQWU7QUFBQSxRQUNqQjtBQUFBLFFBQ0EsU0FBUztBQUFBLFFBQ1QsT0FBTyxZQUFZLG1CQUFtQixxRUFBcUU7QUFBQSxRQUMzRyxhQUFhLENBQUM7QUFBQSxVQUNWLEtBQUs7QUFBQSxVQUNMLE9BQU8sWUFBWSxpQkFBaUIsOENBQThDO0FBQUEsVUFDbEYsU0FBUztBQUFBLFFBQ2IsR0FBRztBQUFBLFVBQ0MsS0FBSztBQUFBLFVBQ0wsT0FBTyxZQUFZLGlCQUFpQiw4Q0FBOEM7QUFBQSxVQUNsRixTQUFTO0FBQUEsUUFDYixDQUFDO0FBQUEsTUFDTDtBQUNBLFlBQU0sRUFBQyxNQUFNLFNBQVMsYUFBWSxDQUFDO0FBQUEsSUFDdkM7QUFBQSxJQUVBLFlBQVk7QUFDUixhQUFPLFlBQVksU0FBUyxxQkFBcUIsS0FBSyxZQUFZLFNBQVMscUJBQXFCO0FBQUEsSUFDcEc7QUFBQSxJQUVBLGFBQWEsVUFBa0IsVUFBbUQsRUFBRSxPQUFPLE1BQU0sVUFBVSxJQUFLLElBQUksQ0FBQyxHQUFHO0FBQ3BILFVBQUksUUFBdUI7QUFDM0IsVUFBSSxXQUFXLFNBQVMsaUJBQWlCLFFBQVE7QUFDakQsVUFBSSxTQUFTLFFBQVE7QUFDakIsaUJBQVMsUUFBUTtBQUNqQixZQUFJLEtBQU07QUFBQSxNQUNkO0FBRUEsWUFBTSxXQUFXLElBQUksaUJBQWlCLE1BQU07QUFDeEMsbUJBQVcsU0FBUyxpQkFBaUIsUUFBUTtBQUM3QyxZQUFJLFNBQVMsUUFBUTtBQUNqQixjQUFJLE1BQU07QUFDTixxQkFBUyxXQUFXO0FBQ3BCLGdCQUFJLE1BQU8sY0FBYSxLQUFLO0FBQUEsVUFDakM7QUFDQSxtQkFBUyxRQUFRO0FBQUEsUUFDckI7QUFBQSxNQUNKLENBQUM7QUFDRCxlQUFTLFFBQVEsU0FBUyxpQkFBaUIsRUFBRSxXQUFXLE1BQU0sU0FBUyxLQUFLLENBQUM7QUFFN0UsVUFBSSxPQUFPLFNBQVMsT0FBTyxLQUFLLFVBQVUsR0FBRztBQUN6QyxnQkFBUSxXQUFXLE1BQU07QUFDckIsbUJBQVMsV0FBVztBQUFBLFFBQ3hCLEdBQUcsT0FBTztBQUFBLE1BQ2Q7QUFBQSxJQUNKO0FBQUEsSUFFQSxpQ0FBaUMsVUFBa0IsZUFBdUIsRUFBRSxPQUFPLE1BQU0sVUFBVSxJQUFLLElBQUksQ0FBQyxHQUFHO0FBQzVHLFdBQUssYUFBYSxVQUFVLENBQUMsYUFBYTtBQUN0QyxpQkFBUyxRQUFRLFFBQU0sR0FBRyxVQUFVLE9BQU8sYUFBYSxDQUFDO0FBQUEsTUFDN0QsR0FBRyxFQUFFLFNBQVMsS0FBSyxDQUFDO0FBQUEsSUFDeEI7QUFBQSxJQUVBLElBQUksRUFBRSxLQUFLLElBQUksR0FBbUI7QUFDOUIsVUFBSSxLQUFLLFVBQVUsQ0FBQyxLQUFLLFVBQVUsR0FBRztBQUFDO0FBQUEsTUFBTTtBQUU3QyxVQUFJLFlBQVksU0FBUyxxQkFBcUIsS0FBSyxLQUFLO0FBQ3BELGFBQUssaUNBQWlDLEtBQUssZ0JBQWdCLEtBQUssYUFBYTtBQUFBLE1BQ2pGLFdBQVcsWUFBWSxTQUFTLHFCQUFxQixLQUFLLEtBQUs7QUFDM0QsYUFBSyxpQ0FBaUMsS0FBSyxnQkFBZ0IsS0FBSyxhQUFhO0FBQUEsTUFDakY7QUFFQSxXQUFLLFNBQVM7QUFBQSxJQUNsQjtBQUFBLEVBQ0o7OztBQzVFQSxpQkFBc0Isb0JBQW9CO0FBQ3RDLFFBQUk7QUFDQSxhQUFPLE1BQU0sT0FBTyxXQUFXLFFBQVEsa0JBQWtCO0FBQUEsSUFDN0QsU0FBUyxLQUFLO0FBQ1YsY0FBUSxLQUFLLG1EQUFtRCxHQUFHO0FBQ25FLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSjs7O0FDRE8sTUFBTSxpQkFBTixjQUE2QixTQUFTO0FBQUEsSUFDeEI7QUFBQSxJQUVqQixjQUFjO0FBQ1YsWUFBTSxVQUFVO0FBQ2hCLFlBQU0sZUFBZTtBQUFBLFFBQ2pCO0FBQUEsUUFDQSxTQUFTO0FBQUEsUUFDVCxPQUFPLFlBQVksc0JBQXNCLHVEQUF1RDtBQUFBLFFBQ2hHLGFBQWEsQ0FBQztBQUFBLFVBQ1YsS0FBSztBQUFBLFVBQ0wsT0FBTyxZQUFZLFlBQVksa0NBQWtDO0FBQUEsVUFDakUsU0FBUztBQUFBLFFBQ2IsR0FBRztBQUFBLFVBQ0MsS0FBSztBQUFBLFVBQ0wsT0FBTyxZQUFZLHFCQUFxQiwwREFBMEQ7QUFBQSxVQUNsRyxTQUFTO0FBQUEsUUFDYixHQUFHO0FBQUEsVUFDQyxLQUFLO0FBQUEsVUFDTCxPQUFPLFlBQVksa0JBQWtCLDZDQUE2QztBQUFBLFVBQ2xGLFNBQVM7QUFBQSxRQUNiLEdBQUc7QUFBQSxVQUNDLEtBQUs7QUFBQSxVQUNMLE9BQU8sWUFBWSxpQkFBaUIsaURBQWlEO0FBQUEsVUFDckYsU0FBUztBQUFBLFFBQ2IsR0FBRztBQUFBLFVBQ0MsS0FBSztBQUFBLFVBQ0wsT0FBTyxZQUFZLGNBQWMsb0NBQW9DO0FBQUEsVUFDckUsU0FBUztBQUFBLFFBQ2IsR0FBRztBQUFBLFVBQ0MsS0FBSztBQUFBLFVBQ0wsT0FBTyxZQUFZLG9CQUFvQixtREFBbUQ7QUFBQSxVQUMxRixTQUFTO0FBQUEsUUFDYixDQUFDO0FBQUEsTUFDTDtBQUNBLFlBQU0sRUFBQyxNQUFNLFNBQVMsYUFBWSxDQUFDO0FBRW5DLFdBQUssZUFBZTtBQUFBLFFBQ2hCLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLFdBQVc7QUFBQSxNQUNmO0FBQUEsSUFDSjtBQUFBLElBRUEsWUFBWTtBQUNSLGFBQU8sWUFBWSxTQUFTLGtCQUFrQjtBQUFBLElBQ2xEO0FBQUEsSUFFQSxNQUFNLElBQUksRUFBRSxTQUFTLE1BQU0sT0FBTyxPQUFPLFlBQVksUUFBUSxHQUFtQjtBQUM1RSxVQUFJLEtBQUssVUFBVSxDQUFDLEtBQUssVUFBVSxHQUFHO0FBQUM7QUFBQSxNQUFNO0FBRTdDLFlBQU0sUUFBUyxPQUFPLGVBQWUsZUFBZSxNQUFNLFFBQVEsVUFBVSxJQUFLLGFBQWEsQ0FBQztBQUMvRixVQUFJLENBQUMsTUFBTSxPQUFRO0FBQ25CLFdBQUssU0FBUztBQUVkLFlBQU0sV0FBVyxNQUFNLGtCQUFrQjtBQUN6QyxZQUFNLFlBQVksSUFBSSxJQUFJLE1BQU0sSUFBSSxVQUFRLENBQUMsT0FBTyxLQUFLLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQztBQUV6RSxlQUFTLGlCQUFpQixxQkFBcUIsRUFBRSxRQUFRLGNBQVk7QUFDakUsY0FBTSxPQUFPLFVBQVUsSUFBSSxTQUFTLGFBQWEsU0FBUyxLQUFLLEVBQUU7QUFDakUsWUFBSSxDQUFDLFFBQVEsS0FBSyxXQUFXLEtBQU07QUFFbkMsY0FBTSxFQUFFLE1BQU0sUUFBUSxTQUFTLEVBQUUsSUFBSSxVQUFVLElBQUksT0FBTyxLQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDN0UsY0FBTSxZQUFZLE9BQU8sV0FBVyxRQUFRLFFBQVEsZUFBZSxLQUFLLE9BQU8sRUFBRTtBQUNqRixjQUFNLGVBQWUsU0FBUyxjQUFjLDBCQUEwQjtBQUN0RSxjQUFNLGFBQWMsU0FBUyxRQUFTLGNBQWMsYUFBYSxLQUFLLEtBQUssS0FBSyxjQUFjLEtBQUssV0FBVyxRQUFRO0FBQ3RILGNBQU0sZ0JBQWdCLFVBQVUsSUFBSSxLQUFLLE9BQU8sTUFBTTtBQUN0RCxjQUFNLGFBQWMsUUFBUSxNQUFNLFFBQVEsTUFBTSxXQUFXLFdBQVcsS0FBSyxLQUFLLFVBQVUsWUFBWSxTQUFTLElBQUssT0FBTztBQUUzSCxjQUFNLGVBQWUsQ0FBQztBQUN0QixZQUFJLFFBQVMsY0FBYSxLQUFLLGFBQWE7QUFDNUMscUJBQWEsS0FBSyxVQUFVO0FBQzVCLFlBQUksS0FBTSxjQUFhLEtBQUssVUFBVTtBQUN0QyxjQUFNLGVBQWUsYUFBYSxLQUFLLEdBQUcsRUFBRSxLQUFLO0FBRWpELFlBQUksZ0JBQWdCLGNBQWM7QUFDOUIsdUJBQWEsY0FBYztBQUFBLFFBQy9CO0FBRUEsY0FBTSxhQUFhLFNBQVMsaUJBQWlCLGVBQWU7QUFDNUQsY0FBTSxPQUFPLFdBQVcsQ0FBQztBQUN6QixZQUFJLE1BQU07QUFDTixnQkFBTSxlQUFlLEtBQUssY0FBYyxZQUFZO0FBQ3BELGNBQUksY0FBYztBQUNkLGdCQUFJLE9BQU8sYUFBYSxjQUFjLEdBQUc7QUFDekMsZ0JBQUksQ0FBQyxNQUFNO0FBQ1AscUJBQU8sU0FBUyxjQUFjLEdBQUc7QUFDakMsbUJBQUssWUFBWTtBQUNqQixxQkFBTyxhQUFhLFdBQVksTUFBSyxZQUFZLGFBQWEsVUFBVTtBQUN4RSwyQkFBYSxZQUFZLElBQUk7QUFBQSxZQUNqQztBQUNBLGdCQUFJLGFBQWMsTUFBSyxjQUFjO0FBQ3JDLGlCQUFLLE9BQU87QUFBQSxVQUNoQjtBQUVBLGNBQUksV0FBVyxLQUFLO0FBQ2hCLGtCQUFNLFVBQVUsS0FBSyxjQUEyQixZQUFZO0FBQzVELGdCQUFJLFNBQVM7QUFDVCxzQkFBUSxZQUFZO0FBQUEsWUFDeEI7QUFBQSxVQUNKO0FBQUEsUUFDSjtBQUVBLFlBQUksU0FBUyxRQUFRO0FBQ2pCLGdCQUFNLG9CQUFvQixTQUFTLGNBQTJCLFlBQVk7QUFDMUUsY0FBSSxtQkFBbUI7QUFDbkIsOEJBQWtCLE1BQU0sUUFBUSxLQUFLLGFBQWEsTUFBTSxLQUFLO0FBQUEsVUFDakU7QUFBQSxRQUNKO0FBRUEsWUFBSSxZQUFZO0FBQ1osZ0JBQU0sWUFBWSxTQUFTLGNBQTJCLHVCQUF1QjtBQUM3RSxjQUFJLFdBQVc7QUFDWCxzQkFBVSxNQUFNLGtCQUFrQjtBQUNsQyxzQkFBVSxNQUFNLGlCQUFpQjtBQUFBLFVBQ3JDO0FBQUEsUUFDSjtBQUVBLFlBQUksU0FBUztBQUNULGdCQUFNLFlBQVksU0FBUyxjQUFnQyxnQkFBZ0I7QUFDM0UsY0FBSSxXQUFXO0FBQ1gsc0JBQVUsTUFBTSxVQUFVLElBQUksUUFBUSxVQUFVLEVBQUU7QUFBQSxVQUN0RDtBQUNBLGNBQUksU0FBUyxVQUFVLFNBQVMsZUFBZSxHQUFHO0FBQzlDLGtCQUFNLGFBQWEsU0FBUyxjQUFnQyxpQkFBaUI7QUFDN0UsZ0JBQUksWUFBWTtBQUVaLHlCQUFXLE1BQU0sV0FBVyxJQUFJLFFBQVEsVUFBVSxFQUFFO0FBQUEsWUFDeEQ7QUFBQSxVQUNKO0FBQ0EsbUJBQVMsaUJBQWlCLE1BQU0sRUFBRSxRQUFRLE9BQUssRUFBRSxPQUFPLENBQUM7QUFBQSxRQUM3RDtBQUFBLE1BQ0osQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKOzs7QUNuSU8sTUFBTSxrQkFBTixjQUE4QixTQUFTO0FBQUEsSUFDbEMsV0FBaUQ7QUFBQSxJQUNqRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBUVIsY0FBYztBQUNWLFlBQU0sVUFBVTtBQUNoQixZQUFNLGVBQWU7QUFBQSxRQUNqQjtBQUFBLFFBQ0EsU0FBUztBQUFBLFFBQ1QsT0FBTyxZQUFZLHFCQUFxQiwrREFBK0Q7QUFBQSxNQUMzRztBQUNBLFlBQU0sRUFBQyxNQUFNLFNBQVMsYUFBWSxDQUFDO0FBQUEsSUFDdkM7QUFBQSxJQUVBLFlBQVk7QUFDUixhQUFPLFlBQVksU0FBUyxrQkFBa0I7QUFBQSxJQUNsRDtBQUFBLElBRUEsZ0JBQWdCLEtBQWE7QUFDekIsYUFBTyxNQUFNLElBQUksT0FBTyxDQUFDLEVBQUUsWUFBWSxJQUFJLElBQUksTUFBTSxDQUFDLElBQUk7QUFBQSxJQUM5RDtBQUFBLElBRUEsb0JBQW9CLE1BQXdDO0FBQ3hELGNBQVEsTUFBTTtBQUFBLFFBQ1YsS0FBSztBQUFHLGlCQUFPO0FBQUEsUUFDZixLQUFLO0FBQUcsaUJBQU87QUFBQSxRQUNmLEtBQUs7QUFBRyxpQkFBTztBQUFBLFFBQ2Y7QUFBUyxpQkFBTztBQUFBLE1BQ3BCO0FBQUEsSUFDSjtBQUFBLElBRUEsWUFBWSxPQUFpQjtBQUN6QixZQUFNLFlBQVksT0FBTyxNQUFNLGNBQWM7QUFDN0MsY0FBUSxNQUFNLGtCQUFrQjtBQUFBLFFBQzVCLEtBQUs7QUFBVSxpQkFBTztBQUFBLFFBQ3RCLEtBQUs7QUFBWSxpQkFBTyxPQUFPLFNBQVMsU0FBUyxJQUFJLFlBQVk7QUFBQSxRQUNqRSxLQUFLO0FBQVMsaUJBQU8sT0FBTyxTQUFTLFNBQVMsSUFBSSxZQUFZLEtBQUs7QUFBQSxRQUNuRTtBQUFTLGlCQUFPO0FBQUEsTUFDcEI7QUFBQSxJQUNKO0FBQUEsSUFFQSxhQUFhLE9BQWlCO0FBQzFCLFlBQU0sV0FBVyxNQUFNLFFBQVEsT0FBTyxXQUFXLFdBQVcsS0FBSyxNQUFNLFVBQVUsWUFBWSxTQUFTO0FBQ3RHLFVBQUksVUFBVTtBQUNWLGVBQU87QUFBQSxNQUNYLE1BQU8sUUFBTztBQUFBLElBQ2xCO0FBQUEsSUFFQSxlQUFlLE9BQWlCO0FBQzVCLFlBQU0sZ0JBQWdCLEtBQUssTUFBTSxPQUFPLE1BQU0sc0JBQXNCLElBQUksSUFBSTtBQUM1RSxZQUFNLFdBQVcsR0FBRyxhQUFhO0FBRWpDLFlBQU0sT0FBTyxLQUFLLFVBQVUsSUFBSSxPQUFPLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQztBQUMzRCxZQUFNLEVBQUUsT0FBTyxXQUFXLFNBQVMsT0FBTyxRQUFRLEVBQUUsSUFBSTtBQUV4RCxhQUFPO0FBQUEsUUFDSCxNQUFNO0FBQUEsUUFDTixLQUFLLG9CQUFvQixNQUFNLG9CQUFvQjtBQUFBLFFBQ25ELE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOO0FBQUEsUUFDQSxNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTjtBQUFBLFFBQ0EsS0FBSyxnQkFBZ0IsTUFBTTtBQUFBLFFBQzNCO0FBQUEsUUFDQTtBQUFBO0FBQUEsUUFDQSxLQUFLLFlBQVksS0FBSztBQUFBLFFBQ3RCLEtBQUssYUFBYSxLQUFLO0FBQUEsTUFDM0IsRUFBRSxLQUFLLEdBQUk7QUFBQSxJQUNmO0FBQUEsSUFFQSxNQUFNLGdCQUFnQixNQUFjO0FBQ2hDLFVBQUk7QUFDQSxjQUFNLFVBQVUsVUFBVSxVQUFVLElBQUk7QUFDeEMsZUFBTztBQUFBLE1BQ1gsU0FBUyxLQUFLO0FBQ1YsZ0JBQVEsS0FBSyxxREFBcUQsR0FBRztBQUNyRSxjQUFNLFdBQVcsU0FBUyxjQUFjLFVBQVU7QUFDbEQsaUJBQVMsUUFBUTtBQUNqQixpQkFBUyxLQUFLLFlBQVksUUFBUTtBQUNsQyxpQkFBUyxPQUFPO0FBQ2hCLFlBQUk7QUFDQSxpQkFBTyxTQUFTLFlBQVksTUFBTTtBQUFBLFFBQ3RDLFNBQVNDLE1BQUs7QUFDVixpQkFBTztBQUFBLFFBQ1gsVUFBRTtBQUNFLG1CQUFTLE9BQU87QUFBQSxRQUNwQjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFFQSxNQUFNLGdCQUFnQixLQUFpQjtBQUNuQyxZQUFNLGFBQWE7QUFHbkIsVUFBSSxJQUFJLFlBQVksSUFBSSxTQUFTO0FBQzdCLGNBQU0sZUFBZSxRQUFRLCtEQUErRDtBQUM1RixZQUFJLGNBQWM7QUFDZCxlQUFLLFVBQVU7QUFDZixnQkFBTSwwQkFBMEI7QUFBQSxRQUNwQztBQUNBO0FBQUEsTUFDSjtBQUdBLFlBQU0saUJBQWtCLE9BQU8sZUFBZSxlQUFlLE1BQU0sUUFBUSxVQUFVLElBQUssYUFBYSxDQUFDO0FBQ3hHLFVBQUksQ0FBQyxlQUFlLFFBQVE7QUFDeEIsY0FBTSxzQ0FBc0M7QUFDNUM7QUFBQSxNQUNKO0FBRUEsVUFBSSxDQUFDLEtBQUssVUFBVTtBQUNoQixjQUFNLGlGQUFpRjtBQUN2RjtBQUFBLE1BQ0o7QUFFQSxVQUFJLG9CQUFvQixTQUFTLE9BQU8sTUFBTSxVQUFVLENBQUMsR0FBRyxFQUFFO0FBRzlELFVBQUksTUFBTSxpQkFBaUIsS0FBSyxJQUFJLFVBQVU7QUFDMUMsY0FBTSxjQUFjLE9BQU8saUNBQWlDO0FBQzVELDRCQUFvQixTQUFTLE9BQU8sV0FBVyxHQUFHLEVBQUU7QUFFcEQsWUFBSSxNQUFNLGlCQUFpQixHQUFHO0FBQzFCLGdCQUFNLG9EQUFvRDtBQUMxRDtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBR0EsWUFBTSxlQUFlLGVBQWUsT0FBTyxXQUFTLE9BQU8sTUFBTSxPQUFPLElBQUksaUJBQWlCO0FBQzdGLFVBQUksQ0FBQyxhQUFhLFFBQVE7QUFDdEIsY0FBTSwrQ0FBK0MsaUJBQWlCLEVBQUU7QUFDeEU7QUFBQSxNQUNKO0FBRUEsWUFBTSxnQkFBZ0IsYUFBYSxJQUFJLEtBQUssZUFBZSxLQUFLLElBQUksQ0FBQyxFQUFFLEtBQUssSUFBSTtBQUVoRixVQUFJLENBQUMsTUFBTSxLQUFLLGdCQUFnQixhQUFhLEdBQUc7QUFDNUMsY0FBTSx5REFBeUQ7QUFDL0Q7QUFBQSxNQUNKO0FBR0EsWUFBTSxRQUFRLEtBQUssSUFBSSxHQUFHLGFBQWEsSUFBSSxPQUFLLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNsRSxZQUFNLFlBQVksS0FBSztBQUV2QixZQUFNLGdFQUFnRTtBQUFBLElBQzFFO0FBQUEsSUFFQSxtQkFBbUI7QUFDZixZQUFNLFNBQXlCLFNBQVMsY0FBYyxLQUFLO0FBQzNELGFBQU8sVUFBVSxJQUFJLGVBQWU7QUFDcEMsYUFBTyxNQUFNLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFnQnZCLGFBQU8sY0FBYztBQUNyQixVQUFJLGNBQWM7QUFDbEIsYUFBTyxhQUFhLFdBQVcsRUFBRTtBQUNqQyxhQUFPLGFBQWEsWUFBWSxXQUFXO0FBRTNDLFlBQU0sdUJBQXVCLENBQUMsTUFBcUIsS0FBSyxpQkFBaUIsR0FBRyxNQUFNO0FBQ2xGLGFBQU8saUJBQWlCLFdBQVcsb0JBQW9CO0FBQ3ZELGFBQU8saUJBQWlCLFNBQVMsb0JBQW9CO0FBRXJELGFBQU8sdUJBQXVCO0FBQzlCLGFBQU8sVUFBVSxDQUFDLE1BQU0sS0FBSyxnQkFBZ0IsQ0FBQztBQUM5QyxXQUFLLGlCQUFpQixFQUFFLFVBQVUsT0FBTyxTQUFTLE1BQU0sR0FBRyxNQUFNO0FBQ2pFLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxpQkFBaUIsR0FBZ0QsUUFBcUI7QUFDbEYsVUFBSSxjQUFjO0FBQ2xCLFVBQUksRUFBRSxZQUFZLEVBQUUsU0FBUztBQUN6QixlQUFPLE1BQU0sYUFBYTtBQUMxQixlQUFPLGNBQWM7QUFDckIsc0JBQWM7QUFDZCxlQUFPLGFBQWEsWUFBWSxXQUFXO0FBQUEsTUFDL0MsV0FBVyxFQUFFLFVBQVU7QUFDbkIsZUFBTyxNQUFNLGFBQWE7QUFDMUIsZUFBTyxjQUFjO0FBQ3JCLHNCQUFjO0FBQ2QsZUFBTyxhQUFhLFlBQVksV0FBVztBQUFBLE1BQy9DLE9BQU87QUFDSCxlQUFPLE1BQU0sYUFBYTtBQUMxQixlQUFPLGNBQWM7QUFDckIsc0JBQWM7QUFDZCxlQUFPLGFBQWEsWUFBWSxXQUFXO0FBQUEsTUFDL0M7QUFBQSxJQUNKO0FBQUEsSUFFQSxlQUFlO0FBQ1gsWUFBTSxxQkFBcUIsU0FBUyxjQUFjLDRDQUE0QztBQUM5RixVQUFJLHNCQUFzQixDQUFDLFNBQVMsY0FBYyxnQkFBZ0IsR0FBRztBQUNqRSxjQUFNLGFBQWEsS0FBSyxpQkFBaUI7QUFDekMsMkJBQW1CLFlBQVksYUFBYSxZQUFZLGtCQUFrQjtBQUFBLE1BQzlFO0FBQUEsSUFDSjtBQUFBLElBRUEsTUFBTSxNQUFNO0FBQ1IsVUFBSSxLQUFLLFVBQVUsQ0FBQyxLQUFLLFVBQVUsR0FBRztBQUFDO0FBQUEsTUFBTTtBQUU3QyxXQUFLLFNBQVM7QUFDZCxXQUFLLFdBQVcsTUFBTSxrQkFBa0I7QUFFeEMsV0FBSyxxQkFBcUIsS0FBSyxhQUFhLEtBQUssSUFBSTtBQUNyRCxVQUFJLFNBQVMsZUFBZSxXQUFZLE1BQUssYUFBYTtBQUFBLFVBQ3JELFFBQU8saUJBQWlCLFFBQVEsS0FBSyxvQkFBb0IsRUFBRSxNQUFNLEtBQUssQ0FBQztBQUFBLElBQ2hGO0FBQUEsRUFDSjs7O0FDNU9PLE1BQU0saUJBQU4sY0FBNkIsU0FBUztBQUFBLElBQ3pDLGNBQWM7QUFDVixZQUFNLFVBQVU7QUFDaEIsWUFBTSxlQUFlO0FBQUEsUUFDakI7QUFBQSxRQUNBLFNBQVM7QUFBQSxRQUNULE9BQU8sWUFBWSxrQkFBa0IscURBQXFEO0FBQUEsUUFDMUYsYUFBYSxDQUFDO0FBQUEsVUFDVixLQUFLO0FBQUEsVUFDTCxPQUFPLFlBQVkscUJBQXFCLHNFQUFzRTtBQUFBLFVBQzlHLFNBQVM7QUFBQSxRQUNiLENBQUM7QUFBQSxNQUNMO0FBQ0EsWUFBTSxFQUFDLE1BQU0sU0FBUyxhQUFZLENBQUM7QUFBQSxJQUN2QztBQUFBLElBRUEsWUFBWTtBQUNSLGFBQU8sWUFBWSxTQUFTLGtCQUFrQjtBQUFBLElBQ2xEO0FBQUEsSUFFQSxNQUFNLGdCQUFnQixNQUFjO0FBQ2hDLFlBQU0sVUFBVSxVQUFVLFVBQVUsSUFBSTtBQUN4QyxZQUFNLFFBQVEsU0FBUyxjQUFjLEtBQUs7QUFDMUMsWUFBTSxjQUFjO0FBQ3BCLFlBQU0sTUFBTSxXQUFXO0FBQ3ZCLFlBQU0sTUFBTSxTQUFTO0FBQ3JCLFlBQU0sTUFBTSxRQUFRO0FBQ3BCLFlBQU0sTUFBTSxhQUFhO0FBQ3pCLFlBQU0sTUFBTSxRQUFRO0FBQ3BCLFlBQU0sTUFBTSxVQUFVO0FBQ3RCLFlBQU0sTUFBTSxlQUFlO0FBQzNCLFlBQU0sTUFBTSxTQUFTO0FBQ3JCLGVBQVMsS0FBSyxZQUFZLEtBQUs7QUFDL0IsaUJBQVcsTUFBTSxNQUFNLE9BQU8sR0FBRyxHQUFJO0FBQUEsSUFDekM7QUFBQSxJQUVBLElBQUksRUFBRSxjQUFjLEdBQW1CO0FBQ25DLFVBQUksS0FBSyxVQUFVLENBQUMsS0FBSyxVQUFVLEdBQUc7QUFBQztBQUFBLE1BQU07QUFFN0MsVUFBSSxlQUFlO0FBQ2YsY0FBTSxVQUFVLFNBQVMsaUJBQWlCLDBCQUEwQjtBQUNwRSxZQUFJLENBQUMsUUFBUSxPQUFRO0FBRXJCLGdCQUFRLFFBQVEsV0FBUztBQUNyQixnQkFBTSxTQUFTLE1BQU0sY0FBZ0Msb0JBQW9CO0FBQ3pFLGdCQUFNLFdBQVcsTUFBTSxjQUFrQyxxQkFBcUI7QUFDOUUsZ0JBQU0sT0FBTyxNQUFNLGNBQW9DLG9CQUFvQjtBQUUzRSxjQUFJLFFBQVE7QUFDUixtQkFBTyxNQUFNLFNBQVM7QUFDdEIsbUJBQU8saUJBQWlCLFNBQVMsT0FBSztBQUNsQyxnQkFBRSxnQkFBZ0I7QUFDbEIsbUJBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUFBLFlBQ25DLENBQUM7QUFBQSxVQUNMO0FBRUEsY0FBSSxVQUFVO0FBQ1YscUJBQVMsTUFBTSxTQUFTO0FBQ3hCLGtCQUFNLGFBQWEsU0FBUyxjQUEyQiw2QkFBNkI7QUFDcEYsZ0JBQUksWUFBWTtBQUNaLHlCQUFXLE1BQU0sU0FBUztBQUMxQix5QkFBVyxpQkFBaUIsU0FBUyxPQUFLO0FBQ3RDLGtCQUFFLGdCQUFnQjtBQUNsQixxQkFBSyxpQkFBaUIsV0FBVyxlQUFlLElBQUksS0FBSyxDQUFDO0FBQUEsY0FDOUQsQ0FBQztBQUFBLFlBQ0w7QUFFQSxxQkFBUyxpQkFBaUIsU0FBUyxPQUFLO0FBQ3BDLGtCQUFJLEVBQUUsa0JBQWtCLFdBQVcsRUFBRSxPQUFPLFFBQVEsNkJBQTZCLEVBQUc7QUFDcEYsb0JBQU0sYUFBYSxTQUFTLFVBQVUsSUFBSTtBQUMxQyx5QkFBVyxjQUFjLDZCQUE2QixHQUFHLE9BQU87QUFDaEUsb0JBQU0sU0FBUyxXQUFXLGVBQWUsSUFBSSxLQUFLO0FBQ2xELG1CQUFLLGdCQUFnQixLQUFLO0FBQUEsWUFDOUIsQ0FBQztBQUFBLFVBQ0w7QUFFQSxjQUFJLE1BQU07QUFDTixpQkFBSyxNQUFNLFNBQVM7QUFDcEIsaUJBQUssaUJBQWlCLFNBQVMsT0FBSztBQUNoQyxnQkFBRSxnQkFBZ0I7QUFDbEIsbUJBQUssZ0JBQWdCLEtBQUssVUFBVSxLQUFLLENBQUM7QUFBQSxZQUM5QyxDQUFDO0FBQUEsVUFDTDtBQUFBLFFBQ0osQ0FBQztBQUVELGFBQUssU0FBUztBQUFBLE1BQ2xCO0FBQUEsSUFDSjtBQUFBLEVBQ0o7OztBQzdGQSwyQkFBQyxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsZ0VBQStELGlHQUFpRyxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLGlFQUFnRSwrRkFBOEYsK0NBQStDLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsMEtBQTBLLEVBQUMsR0FBRSxFQUFDLFNBQVUsU0FBUSxTQUFVLENBQUMsdUdBQXNHLDREQUE0RCxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLGdHQUFnRyxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLHNHQUFzRyxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLG9IQUFvSCxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLG9IQUFvSCxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLGtHQUFrRyxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLCtGQUErRixFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLG9IQUFvSCxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLHFGQUFxRixFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLG9DQUFvQyxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLDJCQUEyQixFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLHVDQUF1QyxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLGdEQUFnRCxFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLDJCQUEyQixFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLHVCQUF1QixFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLDRCQUE0QixFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLDBCQUEwQixFQUFDLEdBQUUsRUFBQyxTQUFVLFNBQVEsU0FBVSxDQUFDLGlCQUFpQixFQUFDLENBQUM7OztBQ1U5NkUsV0FBUyxtQkFBbUIsTUFBcUI7QUFDcEQsVUFBTSxTQUFTLFNBQVMsY0FBYyxRQUFRO0FBQzlDLFdBQU8sWUFBWTtBQUNuQixXQUFPLGFBQWEsbUJBQW1CLHdCQUF3QjtBQUMvRCxXQUFPLFlBQVksS0FBSyxPQUFPO0FBRS9CLFVBQU0sYUFBYSxNQUFNO0FBQ3JCLGFBQU8sVUFBVTtBQUNqQixXQUFLLFlBQVksTUFBTSxFQUFFLGVBQWUsS0FBSyxDQUFDO0FBQzlDLFdBQUssT0FBTztBQUFBLElBQ2hCO0FBQ0EsVUFBTSxZQUFZLENBQUMsWUFBd0I7QUFDdkMsWUFBTUMsWUFBVyxJQUFJLGdCQUFnQjtBQUNyQyxZQUFNLFVBQVUsRUFBRSxRQUFRQSxVQUFTLE9BQU87QUFDMUMsV0FBSyxZQUFZLGlCQUFpQixTQUFTLFNBQVMsT0FBTztBQUMzRCxhQUFPLGlCQUFpQixVQUFVLFdBQVM7QUFDdkMsY0FBTSxlQUFlO0FBQ3JCLGdCQUFRO0FBQUEsTUFDWixHQUFHLE9BQU87QUFDVixhQUFPLGlCQUFpQixTQUFTLFdBQVM7QUFDdEMsWUFBSSxNQUFNLFdBQVcsT0FBUTtBQUM3QixjQUFNLFNBQVMsT0FBTyxzQkFBc0I7QUFDNUMsWUFBSSxNQUFNLFVBQVUsT0FBTyxRQUFRLE1BQU0sVUFBVSxPQUFPLFNBQ3RELE1BQU0sVUFBVSxPQUFPLE9BQU8sTUFBTSxVQUFVLE9BQU8sT0FBUSxTQUFRO0FBQUEsTUFDN0UsR0FBRyxPQUFPO0FBQ1YsYUFBT0E7QUFBQSxJQUNYO0FBRUEsVUFBTSxRQUFRLE9BQU8sUUFBUTtBQUM3QixVQUFNLE9BQU8sU0FBUyxlQUFlLGVBQWU7QUFDcEQsUUFBSSxRQUFRLE9BQU8sT0FBTyxRQUFRLGNBQWMsT0FBTyxNQUFNLFVBQVUsWUFBWTtBQUMvRSxZQUFNLFVBQVUsU0FBUyxjQUFjLEtBQUs7QUFDNUMsY0FBUSxZQUFZO0FBQ3BCLGNBQVEsWUFBWSxNQUFNO0FBQzFCLFVBQUksU0FBUztBQUNiLFlBQU0sVUFBVSxNQUFNO0FBQ2xCLFlBQUksQ0FBQyxPQUFRO0FBQ2IsaUJBQVM7QUFDVCxjQUFNLE1BQU0sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUFBLE1BQ2xDO0FBQ0EsWUFBTUEsWUFBVyxVQUFVLE9BQU87QUFDbEMsVUFBSTtBQUNBLGNBQU0sSUFBSSxFQUFFLE9BQU87QUFBQSxVQUNmLE1BQU07QUFBQSxVQUNOLFlBQVk7QUFBQSxVQUNaLGNBQWM7QUFBQTtBQUFBLFVBQ2QsY0FBYyxFQUFFLE9BQU87QUFBQSxVQUN2QixNQUFNLE1BQU0sS0FBSyxZQUFZLE9BQU87QUFBQSxVQUNwQyxRQUFRLE1BQU07QUFDVixxQkFBUztBQUNULGdCQUFJLENBQUMsS0FBSyxXQUFXLEdBQUc7QUFDcEIsNkJBQWUsT0FBTztBQUN0QjtBQUFBLFlBQ0o7QUFDQSxnQkFBSSxDQUFDLFFBQVEsWUFBYSxNQUFLLFlBQVksT0FBTztBQUNsRCx1QkFBVztBQUFBLFVBQ2Y7QUFBQSxVQUNBLG1CQUFtQixNQUFNO0FBQUEsVUFBQztBQUFBLFVBQzFCLFNBQVMsTUFBTTtBQUNYLHFCQUFTO0FBQ1QsZ0JBQUksT0FBTyxLQUFNLFFBQU8sTUFBTTtBQUM5QixvQkFBUSxPQUFPO0FBQ2YsaUJBQUssUUFBUTtBQUFBLFVBQ2pCO0FBQUEsVUFDQSxzQkFBc0IsTUFBTUEsVUFBUyxNQUFNO0FBQUEsVUFDM0MsU0FBUztBQUFBLFFBQ2IsRUFBRSxDQUFDO0FBQ0g7QUFBQSxNQUNKLFNBQVMsS0FBSztBQUNWLFFBQUFBLFVBQVMsTUFBTTtBQUNmLFlBQUksT0FBTyxLQUFNLFFBQU8sTUFBTTtBQUM5QixnQkFBUSxPQUFPO0FBQ2YsZ0JBQVEsS0FBSyw4Q0FBOEMsR0FBRztBQUFBLE1BQ2xFO0FBQUEsSUFDSjtBQUVBLFFBQUksQ0FBQyxLQUFLLFdBQVcsR0FBRztBQUNwQixXQUFLLFFBQVE7QUFDYjtBQUFBLElBQ0o7QUFDQSxVQUFNLFNBQVMsTUFBTTtBQUNqQixlQUFTLE1BQU07QUFDZixhQUFPLE9BQU87QUFDZCxXQUFLLFFBQVE7QUFBQSxJQUNqQjtBQUNBLFVBQU0sV0FBVyxVQUFVLE1BQU07QUFDN0IsYUFBTyxNQUFNO0FBQ2IsYUFBTztBQUFBLElBQ1gsQ0FBQztBQUNELFdBQU8saUJBQWlCLFNBQVMsUUFBUSxFQUFFLFFBQVEsU0FBUyxPQUFPLENBQUM7QUFDcEUsYUFBUyxLQUFLLFlBQVksTUFBTTtBQUNoQyxlQUFXO0FBQUEsRUFDZjs7O0FDL0ZBLE1BQU0sVUFBVSxnQkFBZ0IsS0FBa0I7QUFDbEQsTUFBTSxnQkFBZ0Isa0JBQWEsQ0FBQyxFQUFFO0FBRXRDLFdBQVMsa0JBQWtCO0FBQ3ZCLFFBQUk7QUFDQSxZQUFNLE9BQU8sTUFBTSxPQUFPO0FBQzFCLGFBQU8sT0FBTyxTQUFTLFlBQVksa0JBQWtCLEtBQUssSUFBSSxJQUFJLE9BQU87QUFBQSxJQUM3RSxRQUFRO0FBQ0osYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKO0FBRUEsV0FBUyxRQUFRLFNBQWlCLFVBQXlCO0FBQ3ZELFFBQUksQ0FBQyxTQUFVLFFBQU87QUFFdEIsVUFBTSxXQUFXLFNBQVMsTUFBTSxHQUFHLEVBQUUsSUFBSSxNQUFNO0FBQy9DLFVBQU0sV0FBVyxRQUFRLE1BQU0sR0FBRyxFQUFFLElBQUksTUFBTTtBQUM5QyxlQUFXLENBQUMsT0FBTyxJQUFJLEtBQUssU0FBUyxRQUFRLEdBQUc7QUFDNUMsVUFBSSxTQUFTLFNBQVMsS0FBSyxFQUFHLFFBQU8sT0FBTyxTQUFTLEtBQUs7QUFBQSxJQUM5RDtBQUNBLFdBQU87QUFBQSxFQUNYO0FBRUEsV0FBUyxlQUFlLFNBQXNDO0FBQzFELFVBQU0sVUFBVSxTQUFTLGNBQWMsU0FBUztBQUNoRCxVQUFNLFVBQVUsU0FBUyxjQUFjLElBQUk7QUFDM0MsWUFBUSxjQUFjLElBQUksUUFBUSxPQUFPO0FBQ3pDLFVBQU0sVUFBVSxTQUFTLGNBQWMsSUFBSTtBQUMzQyxlQUFXLFVBQVUsUUFBUSxTQUFTO0FBQ2xDLFlBQU0sT0FBTyxTQUFTLGNBQWMsSUFBSTtBQUN4QyxXQUFLLGNBQWM7QUFDbkIsY0FBUSxZQUFZLElBQUk7QUFBQSxJQUM1QjtBQUNBLFlBQVEsT0FBTyxTQUFTLE9BQU87QUFDL0IsV0FBTztBQUFBLEVBQ1g7QUFFTyxNQUFNLFlBQU4sY0FBd0IsU0FBUztBQUFBLElBQzVCLFVBQXlDO0FBQUEsSUFDekMsU0FBbUM7QUFBQSxJQUNuQyxpQkFBaUI7QUFBQSxJQUNqQixlQUF1QztBQUFBLElBRS9DLGNBQWM7QUFDVixZQUFNLFVBQVU7QUFDaEIsWUFBTSxFQUFFLE1BQU0sU0FBUyxjQUFjO0FBQUEsUUFDakM7QUFBQSxRQUNBLE9BQU8sWUFBWSxrQkFBa0IsMkZBQTJGO0FBQUEsUUFDaEksU0FBUztBQUFBLE1BQ2IsRUFBRSxDQUFDO0FBQUEsSUFDUDtBQUFBLElBRUEsWUFBWTtBQUNSLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxrQkFBa0I7QUFDZCxVQUFJLGdCQUFnQixhQUFjO0FBRWxDLFlBQU0sV0FBVztBQUNqQixhQUFPLFdBQVcsUUFBUSx3QkFBd0IsVUFBVSxNQUFNO0FBQzlELGNBQU0sT0FBTyxTQUFTLGNBQWMsUUFBUTtBQUM1QyxZQUFJLENBQUMsUUFBUSxLQUFLLGNBQWMsd0JBQXdCLEVBQUc7QUFFM0QsY0FBTSxTQUFTLFNBQVMsY0FBYyxRQUFRO0FBQzlDLGVBQU8sT0FBTztBQUNkLGVBQU8sWUFBWTtBQUNuQixlQUFPLGNBQWM7QUFDckIsZUFBTyxpQkFBaUIsU0FBUyxNQUFNLEtBQUssS0FBSyxVQUFVLE1BQU0sQ0FBQztBQUNsRSxhQUFLLFlBQVksTUFBTTtBQUFBLE1BQzNCLENBQUM7QUFBQSxJQUNMO0FBQUEsSUFFQSxNQUFNO0FBQ0YsVUFBSSxLQUFLLE9BQVE7QUFDakIsV0FBSyxTQUFTO0FBRWQsWUFBTSxRQUFRLE1BQU07QUFDaEIsWUFBSSxLQUFLLFVBQVUsQ0FBQyxLQUFLLGtCQUFrQixRQUFRLGVBQWUsZ0JBQWdCLENBQUMsRUFBRyxNQUFLLEtBQUssV0FBVztBQUFBLE1BQy9HO0FBQ0EsVUFBSSxTQUFTLGVBQWUsV0FBWSxPQUFNO0FBQUEsV0FDekM7QUFDRCxhQUFLLGVBQWUsSUFBSSxnQkFBZ0I7QUFDeEMsZUFBTyxpQkFBaUIsUUFBUSxPQUFPLEVBQUUsTUFBTSxNQUFNLFFBQVEsS0FBSyxhQUFhLE9BQU8sQ0FBQztBQUFBLE1BQzNGO0FBQUEsSUFDSjtBQUFBLElBRUEsV0FBVztBQUNQLFdBQUssY0FBYyxNQUFNO0FBQ3pCLFdBQUssU0FBUztBQUFBLElBQ2xCO0FBQUEsSUFFUSxLQUFLLE1BQThCLFNBQW1DLE1BQU07QUFDaEYsVUFBSSxTQUFTLFNBQVUsTUFBSyxTQUFTO0FBQ3JDLFVBQUksS0FBSyxTQUFTO0FBQ2QsWUFBSSxTQUFTLFNBQVUsTUFBSyxVQUFVO0FBQ3RDO0FBQUEsTUFDSjtBQUNBLFdBQUssVUFBVTtBQUVmLFlBQU0sV0FBVyxnQkFBZ0I7QUFDakMsWUFBTSxVQUFVLFNBQVMsY0FBYyxLQUFLO0FBQzVDLGNBQVEsWUFBWTtBQUNwQixZQUFNLFFBQVEsU0FBUyxjQUFjLElBQUk7QUFDekMsWUFBTSxLQUFLO0FBQ1gsWUFBTSxjQUFjO0FBQ3BCLFlBQU0sUUFBUSxTQUFTLGNBQWMsS0FBSztBQUMxQyxZQUFNLFlBQVk7QUFDbEIsWUFBTSxjQUFjLFlBQVksUUFBUSxlQUFlLFFBQVEsSUFDekQsa0JBQWEsT0FBTyxhQUFXLFFBQVEsUUFBUSxTQUFTLFFBQVEsQ0FBQyxFQUFFLFNBQ25FO0FBQ04sWUFBTSxPQUFPLEdBQUcsa0JBQWEsTUFBTSxHQUFHLFdBQVcsRUFBRSxJQUFJLGNBQWMsQ0FBQztBQUN0RSxZQUFNLFVBQVUsa0JBQWEsTUFBTSxXQUFXO0FBQzlDLFVBQUksUUFBUSxRQUFRO0FBQ2hCLGNBQU0sVUFBVSxTQUFTLGNBQWMsU0FBUztBQUNoRCxjQUFNLFVBQVUsU0FBUyxjQUFjLFNBQVM7QUFDaEQsZ0JBQVEsY0FBYztBQUN0QixnQkFBUSxPQUFPLFNBQVMsR0FBRyxRQUFRLElBQUksY0FBYyxDQUFDO0FBQ3RELGNBQU0sWUFBWSxPQUFPO0FBQUEsTUFDN0I7QUFFQSxZQUFNLFNBQVMsU0FBUyxjQUFjLFFBQVE7QUFDOUMsWUFBTSxjQUFjLFNBQVMsY0FBYyxRQUFRO0FBQ25ELGtCQUFZLE9BQU87QUFDbkIsa0JBQVksWUFBWTtBQUN4QixrQkFBWSxjQUFjO0FBQzFCLGFBQU8sWUFBWSxXQUFXO0FBQzlCLGNBQVEsT0FBTyxPQUFPLE9BQU8sTUFBTTtBQUVuQyx5QkFBbUI7QUFBQSxRQUNmO0FBQUEsUUFDQTtBQUFBLFFBQ0EsWUFBWSxNQUFNLEtBQUssWUFBWSxZQUM5QixLQUFLLFVBQVUsQ0FBQyxLQUFLLGtCQUFrQixRQUFRLGVBQWUsZ0JBQWdCLENBQUM7QUFBQSxRQUNwRixRQUFRLE1BQU07QUFDVixlQUFLLGlCQUFpQjtBQUN0QixjQUFJO0FBQ0EsZ0JBQUksUUFBUSxlQUFlLGdCQUFnQixDQUFDLEVBQUcsT0FBTSxTQUFTLGFBQWE7QUFBQSxVQUMvRSxTQUFTLEtBQUs7QUFDVixvQkFBUSxLQUFLLHVEQUF1RCxHQUFHO0FBQUEsVUFDM0U7QUFBQSxRQUNKO0FBQUEsUUFDQSxTQUFTLE1BQU07QUFDWCxlQUFLLFVBQVU7QUFDZixlQUFLLFFBQVEsTUFBTSxFQUFFLGVBQWUsS0FBSyxDQUFDO0FBQzFDLGVBQUssU0FBUztBQUFBLFFBQ2xCO0FBQUEsTUFDSixDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7OztBQ2hKQSx5QkFBdUI7QUFFdkIsV0FBUyxZQUFZO0FBQ2pCLFFBQUksU0FBUyxlQUFlLFdBQVc7QUFDbkMsZUFBUyxpQkFBaUIsb0JBQW9CLFdBQVcsRUFBRSxNQUFNLEtBQUssQ0FBQztBQUN2RTtBQUFBLElBQ0o7QUFFQSxVQUFNLEVBQUUsR0FBQUMsR0FBRSxJQUFJO0FBRWQsUUFBSSxDQUFDQSxJQUFHO0FBQ0osVUFBSSxTQUFTLGVBQWUsWUFBWTtBQUNwQyxlQUFPLGlCQUFpQixRQUFRLFdBQVcsRUFBRSxNQUFNLEtBQUssQ0FBQztBQUN6RDtBQUFBLE1BQ0o7QUFDQSxlQUFTLGVBQWUsd0JBQXdCLEdBQUcsT0FBTztBQUMxRCxjQUFRLElBQUksMENBQTBDO0FBQ3REO0FBQUEsSUFDSjtBQUVBLFlBQVEsSUFBSSxnREFBZ0Q7QUFFNUQsYUFBU0EsRUFBQztBQUNWLGlCQUFhO0FBRWIsVUFBTSxpQkFBaUIsSUFBSSxjQUFjO0FBQ3pDLFVBQU0sWUFBWSxJQUFJLFVBQVU7QUFDaEMsVUFBTSxhQUFhO0FBQUEsTUFDZjtBQUFBLE1BQ0EsSUFBSSxhQUFhO0FBQUEsTUFDakIsSUFBSSxZQUFZO0FBQUEsTUFDaEIsSUFBSSxlQUFlO0FBQUEsTUFDbkIsSUFBSSxlQUFlO0FBQUEsTUFDbkIsSUFBSSxnQkFBZ0I7QUFBQSxNQUNwQixJQUFJLGVBQWU7QUFBQSxNQUNuQjtBQUFBLElBQ0o7QUFFQSxlQUFXLE1BQU07QUFDYixZQUFNLFlBQVksTUFBTTtBQUNwQixjQUFNLEVBQUUsaUJBQWlCLElBQUk7QUFDN0IsWUFBSSxDQUFDLGlCQUFrQjtBQUV2Qix5QkFBaUIsY0FBYztBQUFBLFVBQzNCLEtBQUs7QUFBQSxVQUNMLE1BQU07QUFBQSxRQUNWLENBQUM7QUFDRCxtQkFBVyxRQUFRLFlBQVU7QUFDekIsMkJBQWlCLGVBQWUsTUFBTTtBQUFBLFFBQzFDLENBQUM7QUFDRCx5QkFBaUIsV0FBVztBQUM1Qix5QkFBaUIsV0FBVztBQUM1Qix1QkFBZSxnQkFBZ0I7QUFDL0IsK0JBQXVCO0FBQ3ZCLGtCQUFVLGdCQUFnQjtBQUMxQixxQkFBYTtBQUFBLE1BQ2pCO0FBRUEsVUFBSSxPQUFPLGtCQUFrQjtBQUN6QixrQkFBVTtBQUFBLE1BQ2QsT0FBTztBQUNILFFBQUFBLEdBQUUsUUFBUSxFQUFFLElBQUksb0JBQW9CLFNBQVM7QUFBQSxNQUNqRDtBQUFBLElBQ0osR0FBRyxDQUFDO0FBQUEsRUFDUjtBQUVBLFlBQVU7IiwKICAibmFtZXMiOiBbIm1hdGNoZXMiLCAicGxheWVyIiwgImVyciIsICJoYW5kbGVycyIsICIkIl0KfQo=
