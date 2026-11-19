// ==UserScript==
// @name           HH J.A.R.V.I.S. (Dev)
// @version        0.7.0
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
.jarvis-mark-actions {
    justify-content: space-between;
}
.jarvis-view-changelog {
    margin-top: .45em;
}
.jarvis-changelog-popup {
    box-sizing: border-box;
    width: min(37rem, calc(100% - 2rem));
    padding: 0;
    border: 1px solid var(--config-setting-border, #a9a3bc);
    border-radius: .6rem;
    background: var(--config-setting-background, #241e30);
    color: #fff;
    font: 15px/1.45 system-ui, sans-serif;
    text-align: start;
}
.jarvis-changelog-native > .jarvis-changelog-popup {
    position: absolute;
    inset: 50% auto auto 50%;
    height: auto;
    margin: 0;
    transform: translate(-50%, -50%);
}
.jarvis-changelog-popup::backdrop {
    background: #080b12aa;
}
.jarvis-changelog-content {
    box-sizing: border-box;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    gap: .9rem;
    max-height: min(32rem, 75vh);
    padding: 1rem;
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
        .hh-plus-plus-config-panel { --jarvis-version: "v${"0.7.0"}"; }
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
          player.textContent = name ? `${name} · ${id}` : id;
          if (!name) player.title = "The name will appear after Jarvis sees this player.";
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
      return Object.fromEntries(Object.entries(saved).filter((entry) => typeof entry[1] === "string"));
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
      return Object.entries(this.readMarks()).flatMap(([id, mark]) => /^[1-9]\d*$/.test(id) && (mark === "friend" || mark === "foe") ? [{ id, name: names[id], mark }] : []);
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
          const matches = byName.get((name.textContent ?? "").trim());
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
        if (savedNames[id] !== displayName) {
          savedNames[id] = displayName;
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
          if (!rosterNames.has(id)) rememberName(id, name.textContent);
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
  var CHANGELOG_default = [{ version: "0.7.0", changes: ["See what changed in Jarvis the first time a new version runs.", "Open View changelog from HH++ settings at any time, even with automatic notices turned off.", "Expand Earlier versions to read past updates."] }, { version: "0.6.7", changes: ["Make marking one action per player, backfill names for older marks, use the bracket-based promotion target, and simplify the selected contest buttons and version badge."] }, { version: "0.6.6", changes: ["Name the testing install Dev, move HH++ version and setting details to tooltips, improve mark contrast and management, and add automatic contest defaults."] }, { version: "0.6.5", changes: ["Move the userscript source into TypeScript modules and add separate stable and testing builds."] }, { version: "0.6.4", changes: ["Prevent pinned contest startup scrolling, keep native startup without a pin, and clear finished pins"] }, { version: "0.6.3", changes: ["Stop both contest startup scrolls, isolate the selected leaderboard, and restore pinned contests at Top or My rank"] }, { version: "0.6.2", changes: ["Pin contests on their cards, hide the startup scroll, and use right-click marking with isolated settings scrolling"] }, { version: "0.6.1", changes: ["Read native Manga RPG contest titles and recognize active cards when contest data is unavailable"] }, { version: "0.6.0", changes: ["Add a contest start preference, continuous marking, and compact settings with a version label"] }, { version: "0.5.0", changes: ["Add league and contest player marking with custom colors, compact settings, and limit Top 20 to promotable leagues"] }, { version: "0.4.2", changes: ["Fix module startup, league controls, and raid exports; add the Top 20 league target"] }, { version: "0.4.1", changes: ["Fix Love Raids shadows replacement"] }, { version: "0.4.0", changes: ["Add ActivityParser module"] }, { version: "0.3.1", changes: ["Add harem link inside love raid cards"] }, { version: "0.3.0", changes: ["Add LoveRaidsAddon and LoveRaidsParser modules"] }, { version: "0.2.0", changes: ["Add RemovePassLock module"] }, { version: "0.1.3", changes: ["Better code practices"] }, { version: "0.1.2", changes: ["Polishing and update links"] }, { version: "0.1.1", changes: ["Add FriendAndFoes module"] }, { version: "0.0.1", changes: ["Initial release"] }];

  // src/modules/updates/changelogPopup.ts
  function showChangelogPopup(view) {
    const queue = window.shared?.PopupQueueManager;
    const host = document.getElementById("common-popups");
    if (host && typeof queue?.add === "function" && typeof queue.close === "function") {
      const wrapper = document.createElement("div");
      wrapper.className = "popup_wrapper jarvis-changelog-native";
      const backdrop = document.createElement("div");
      backdrop.className = "popup_background clickable";
      const panel = document.createElement("div");
      panel.className = "popup jarvis-changelog-popup";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      panel.setAttribute("aria-labelledby", "jarvis-changelog-title");
      panel.appendChild(view.content);
      wrapper.append(backdrop, panel);
      const handlers = new AbortController();
      const dismiss = () => queue.close({ type: "common" });
      try {
        queue.add({ popup: {
          type: "common",
          popup_name: "jarvis_changelog",
          close_on_esc: true,
          $dom_element: $(wrapper),
          init: () => host.appendChild(wrapper),
          onOpen: () => {
            if (!view.shouldOpen()) {
              queueMicrotask(dismiss);
              return;
            }
            if (!wrapper.isConnected) host.appendChild(wrapper);
            view.onOpen();
            requestAnimationFrame(() => view.closeButton.focus({ preventScroll: true }));
          },
          addEventListeners: () => {
            for (const target of [backdrop, view.closeButton]) {
              target.addEventListener("click", dismiss, { signal: handlers.signal });
            }
          },
          onClose: () => {
            wrapper.remove();
            view.onClose();
          },
          removeEventListeners: () => handlers.abort(),
          destroy: dismiss
        } });
        return;
      } catch (err) {
        handlers.abort();
        wrapper.remove();
        console.warn("Jarvis could not use the game popup queue:", err);
      }
    }
    if (!view.shouldOpen()) {
      view.onClose();
      return;
    }
    const dialog = document.createElement("dialog");
    dialog.className = "jarvis-changelog-popup";
    dialog.setAttribute("aria-labelledby", "jarvis-changelog-title");
    dialog.appendChild(view.content);
    view.closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
      dialog.remove();
      view.onClose();
    }, { once: true });
    document.body.appendChild(dialog);
    dialog.showModal();
    view.closeButton.focus({ preventScroll: true });
    view.onOpen();
  }

  // src/modules/updates/Changelog.ts
  var seenKey = `ChangelogSeen${"Dev"}`;
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
        if (this.hasRun && !this.viewedThisPage && isNewer("0.7.0", readSeenVersion())) this.open("automatic");
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
      const newReleases = previous && isNewer("0.7.0", previous) ? CHANGELOG_default.filter((release) => isNewer(release.version, previous)).length : 1;
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
        shouldOpen: () => this.pending === "manual" || this.hasRun && !this.viewedThisPage && isNewer("0.7.0", readSeenVersion()),
        onOpen: () => {
          this.viewedThisPage = true;
          try {
            if (isNewer("0.7.0", readSeenVersion())) lsSet(seenKey, "0.7.0");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzSGVscC50cyIsICJzcmMvc2V0dGluZ3MuY3NzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvSEhNb2R1bGUudHMiLCAic3JjL3N0b3JhZ2UudHMiLCAic3JjL21vZHVsZXMvcGxheWVycy9tYXJrTWFuYWdlci50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0ZyaWVuZEFuZEZvZXMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzLnRzIiwgInNyYy9tb2R1bGVzL2NvbnRlc3RzL0NvbnRlc3RTdGFydC50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0xlYWd1ZVRvcDIwLnRzIiwgInNyYy9tb2R1bGVzL3Byb2dyZXNzaW9uL1JlbW92ZVBhc3NMb2NrLnRzIiwgInNyYy9tb2R1bGVzL2xvdmUtcmFpZHMvZ2FtZURhdGEudHMiLCAic3JjL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNBZGRvbi50cyIsICJzcmMvbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc1BhcnNlci50cyIsICJzcmMvbW9kdWxlcy9hY3Rpdml0aWVzL0FjdGl2aXR5UGFyc2VyLnRzIiwgIkNIQU5HRUxPRy5tZCIsICJzcmMvbW9kdWxlcy91cGRhdGVzL2NoYW5nZWxvZ1BvcHVwLnRzIiwgInNyYy9tb2R1bGVzL3VwZGF0ZXMvQ2hhbmdlbG9nLnRzIiwgInNyYy9pbmRleC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCAkOiBKUXVlcnlTdGF0aWM7XG5leHBvcnQgbGV0IGN1cnJlbnRQYWdlOiBzdHJpbmc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0R2FtZShqUXVlcnk6IEpRdWVyeVN0YXRpYykge1xuICAgICQgPSBqUXVlcnk7XG4gICAgY3VycmVudFBhZ2UgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIHNldHRpbmdIZWxwKGxhYmVsOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgICBjb25zdCBlc2NhcGUgPSAodGV4dDogc3RyaW5nKSA9PiB0ZXh0LnJlcGxhY2VBbGwoJyYnLCAnJmFtcDsnKS5yZXBsYWNlQWxsKCdcIicsICcmcXVvdDsnKVxuICAgICAgICAucmVwbGFjZUFsbCgnPCcsICcmbHQ7JykucmVwbGFjZUFsbCgnPicsICcmZ3Q7Jyk7XG4gICAgcmV0dXJuIGVzY2FwZShsYWJlbCkgKyAnIDxzcGFuIGNsYXNzPVwiaXJvbm1hbi1zZXR0aW5nLWhlbHBcIiByb2xlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgYXJpYS1sYWJlbD1cIkFib3V0ICcgK1xuICAgICAgICBlc2NhcGUobGFiZWwpICsgJ1wiIGRhdGEtc2V0dGluZy1oZWxwPVwiJyArIGVzY2FwZShkZXNjcmlwdGlvbikgKyAnXCI+Pzwvc3Bhbj4nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW91bnRTZXR0aW5nc0hlbHAocGFuZWw6IEhUTUxFbGVtZW50LCB0b29sdGlwSWQ6IHN0cmluZykge1xuICAgIGNvbnN0IHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0b29sdGlwLmlkID0gdG9vbHRpcElkO1xuICAgIHRvb2x0aXAuY2xhc3NOYW1lID0gJ2lyb25tYW4tc2V0dGluZy10b29sdGlwJztcbiAgICB0b29sdGlwLnNldEF0dHJpYnV0ZSgncm9sZScsICd0b29sdGlwJyk7XG4gICAgY29uc3QgcG9wb3ZlciA9IHR5cGVvZiB0b29sdGlwLnNob3dQb3BvdmVyID09PSAnZnVuY3Rpb24nO1xuICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLnNldEF0dHJpYnV0ZSgncG9wb3ZlcicsICdtYW51YWwnKTtcbiAgICBlbHNlIHRvb2x0aXAuaGlkZGVuID0gdHJ1ZTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvb2x0aXApO1xuXG4gICAgbGV0IGFuY2hvcjogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBnZXRIZWxwID0gKHRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsKSA9PlxuICAgICAgICB0YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ID8gdGFyZ2V0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCdbZGF0YS1zZXR0aW5nLWhlbHBdJykgOiBudWxsO1xuICAgIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIWFuY2hvcikgcmV0dXJuO1xuICAgICAgICBhbmNob3IucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jyk7XG4gICAgICAgIGFuY2hvciA9IG51bGw7XG4gICAgICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLmhpZGVQb3BvdmVyKCk7XG4gICAgICAgIGVsc2UgdG9vbHRpcC5oaWRkZW4gPSB0cnVlO1xuICAgIH07XG4gICAgY29uc3Qgc2hvdyA9IChoZWxwOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICBpZiAoYW5jaG9yID09PSBoZWxwKSByZXR1cm47XG4gICAgICAgIGNsb3NlKCk7XG4gICAgICAgIGFuY2hvciA9IGhlbHA7XG4gICAgICAgIGhlbHAuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgdG9vbHRpcElkKTtcbiAgICAgICAgdG9vbHRpcC50ZXh0Q29udGVudCA9IGhlbHAuZGF0YXNldC5zZXR0aW5nSGVscCA/PyAnJztcbiAgICAgICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuc2hvd1BvcG92ZXIoKTtcbiAgICAgICAgZWxzZSB0b29sdGlwLmhpZGRlbiA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IGhlbHAuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0V2lkdGgsIG9mZnNldEhlaWdodCB9ID0gdG9vbHRpcDtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoOCwgTWF0aC5taW4oYm91bmRzLmxlZnQsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCAtIG9mZnNldFdpZHRoIC0gOCkpICsgJ3B4JztcbiAgICAgICAgY29uc3QgYmVsb3cgPSBib3VuZHMuYm90dG9tICsgNjtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS50b3AgPSAoYmVsb3cgKyBvZmZzZXRIZWlnaHQgPD0gd2luZG93LmlubmVySGVpZ2h0IC0gOFxuICAgICAgICAgICAgPyBiZWxvdyA6IE1hdGgubWF4KDgsIGJvdW5kcy50b3AgLSBvZmZzZXRIZWlnaHQgLSA2KSkgKyAncHgnO1xuICAgIH07XG5cbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyb3ZlcicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgJiYgZXZlbnQucG9pbnRlclR5cGUgIT09ICd0b3VjaCcpIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm91dCcsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgPT09IGFuY2hvciAmJiBoZWxwICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGhlbHApIGNsb3NlKCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHApIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCBldmVudCA9PiB7XG4gICAgICAgIGlmIChnZXRIZWxwKGV2ZW50LnRhcmdldCkgPT09IGFuY2hvcikgY2xvc2UoKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKCFoZWxwKSByZXR1cm47XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzaG93KGhlbHApO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGhlbHAgPSBnZXRIZWxwKGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGlmIChoZWxwICYmIChldmVudC5rZXkgPT09ICdFbnRlcicgfHwgZXZlbnQua2V5ID09PSAnICcpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBzaG93KGhlbHApO1xuICAgICAgICB9IGVsc2UgaWYgKGFuY2hvciAmJiBldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGdldEhlbHAoZXZlbnQudGFyZ2V0KSAhPT0gYW5jaG9yKSBjbG9zZSgpO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGNsb3NlLCB7IHBhc3NpdmU6IHRydWUgfSk7XG59XG4iLCAiLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAucGFuZWwtY29udGVudHMge1xuICAgIGFsaWduLWNvbnRlbnQ6IHN0YXJ0O1xuICAgIGFsaWduLWl0ZW1zOiBzdGFydDtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIG92ZXJzY3JvbGwtYmVoYXZpb3I6IGNvbnRhaW47XG4gICAgc2Nyb2xsYmFyLXdpZHRoOiB0aGluO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWw6aGFzKD4gLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXS5zaG93bikge1xuICAgIG92ZXJmbG93OiBjbGlwO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmcuaGFzLXN1YnNldHRpbmdzIHtcbiAgICBncmlkLXJvdy1lbmQ6IGF1dG87XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5qYXJ2aXMtcGFja2VkLXNldHRpbmdzIHtcbiAgICBncmlkLWF1dG8tZmxvdzogcm93IGRlbnNlO1xuICAgIGdyaWQtYXV0by1yb3dzOiAxcHg7XG4gICAgcm93LWdhcDogMDtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1wYWNrZWQtc2V0dGluZ3MgLmNvbmZpZy1zZXR0aW5nIHtcbiAgICBncmlkLXJvdy1lbmQ6IHNwYW4gdmFyKC0tamFydmlzLXNldHRpbmctcm93cywgMSk7XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAudGFicyBoNFtyZWw9XCJKQVJWSVNcIl0ge1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC50YWJzIGg0W3JlbD1cIkpBUlZJU1wiXS5zZWxlY3RlZDo6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6IHZhcigtLWphcnZpcy12ZXJzaW9uKTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgaW5zZXQtYmxvY2stc3RhcnQ6IDA7XG4gICAgaW5zZXQtaW5saW5lLWVuZDogLjE1cmVtO1xuICAgIGZvbnQtc2l6ZTogLjYyNXJlbTtcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIHRleHQtdHJhbnNmb3JtOiBub25lO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLmlyb25tYW4tc2V0dGluZy1oZWxwIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtZ3JpZDtcbiAgICBwbGFjZS1pdGVtczogY2VudGVyO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgaW5saW5lLXNpemU6IDEuMjVlbTtcbiAgICBibG9jay1zaXplOiAxLjI1ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICBmb250LXNpemU6IC44ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgdmVydGljYWwtYWxpZ246IC4wOGVtO1xuICAgIGN1cnNvcjogaGVscDtcbn1cbi5pcm9ubWFuLXNldHRpbmctaGVscDpob3Zlcixcbi5pcm9ubWFuLXNldHRpbmctaGVscDpmb2N1cy12aXNpYmxlIHtcbiAgICBvdXRsaW5lOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIG91dGxpbmUtb2Zmc2V0OiAycHg7XG59XG4uaXJvbm1hbi1zZXR0aW5nLXRvb2x0aXAge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICBpbnNldDogYXV0bztcbiAgICB6LWluZGV4OiAxMDAxMDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIG1heC13aWR0aDogbWluKDE4cmVtLCBjYWxjKDEwMHZ3IC0gMTZweCkpO1xuICAgIG1hcmdpbjogMDtcbiAgICBwYWRkaW5nOiAuNWVtIC43ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNGVtO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWNvbmZpZy1zZXR0aW5nLWJhY2tncm91bmQsICMyNDFlMzApO1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGZvbnQ6IDE0cHgvMS40IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1tYXJrLWNvbG9yIGlucHV0IHtcbiAgICB3aWR0aDogMzBweDtcbiAgICBoZWlnaHQ6IDIwcHg7XG4gICAgZmxleDogbm9uZTtcbiAgICBwYWRkaW5nOiAwO1xufVxuYnV0dG9uLmphcnZpcy1jb250ZXN0LXBpbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgbWFyZ2luLWlubGluZS1zdGFydDogLjM1ZW07XG4gICAgcGFkZGluZy1pbmxpbmU6IC4yZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgZm9udC1zaXplOiAuOWVtO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1waW46OmJlZm9yZSB7XG4gICAgY29udGVudDogJ+KYhic7XG59XG4uamFydmlzLWNvbnRlc3QtcGluW2FyaWEtcHJlc3NlZD1cInRydWVcIl06OmJlZm9yZSB7XG4gICAgY29udGVudDogJ+KYhSc7XG4gICAgY29sb3I6ICNmZmQzNmI7XG59XG4uamFydmlzLWNvbnRlc3QtcGluOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICB3aWR0aDogZml0LWNvbnRlbnQ7XG4gICAgZ2FwOiAuMTJlbTtcbiAgICBwYWRkaW5nOiAuMTJlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDU1JSwgdHJhbnNwYXJlbnQpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40NWVtO1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIGxpbmUtaGVpZ2h0OiAxLjE1O1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b24ge1xuICAgIGFsbDogdW5zZXQ7XG4gICAgcGFkZGluZzogLjE4ZW0gLjM4ZW07XG4gICAgYm9yZGVyLXJhZGl1czogLjI2ZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgZm9udDogaW5oZXJpdDtcbiAgICBsaW5lLWhlaWdodDogaW5oZXJpdDtcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uW2FyaWEtcHJlc3NlZD1cInRydWVcIl0ge1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMjIlLCB0cmFuc3BhcmVudCk7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIGJ1dHRvbjpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAxNSUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG59XG4uamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCB7XG4gICAgbWFyZ2luLWlubGluZS1zdGFydDogLjI4ZW07XG4gICAgZm9udC1zaXplOiAuN2VtO1xuICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XG59XG4uamFydmlzLWNvbnRlc3Qtc2V0dGluZ3Mge1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ2FwOiAuM2VtO1xuICAgIG1pbi13aWR0aDogMDtcbiAgICBtYXJnaW46IC40NWVtIDAgMDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGJvcmRlcjogMDtcbiAgICBmb250LXNpemU6IC44NWVtO1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzOmRpc2FibGVkIC5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIG9wYWNpdHk6IC41O1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzOmRpc2FibGVkIGJ1dHRvbiB7XG4gICAgY3Vyc29yOiBkZWZhdWx0O1xufVxuLmphcnZpcy1tYXJrLW1lbnUge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB6LWluZGV4OiAxMDAwMDtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdhcDogMnB4O1xuICAgIHBhZGRpbmc6IDRweDtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjODk5NGE3O1xuICAgIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgICBiYWNrZ3JvdW5kOiAjMjMyOTM2O1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGJveC1zaGFkb3c6IDAgMnB4IDEwcHggIzAwMDg7XG4gICAgZm9udDogMTNweC8xLjM1IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbn1cbi5qYXJ2aXMtbWFyay1tZW51IGJ1dHRvbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBwYWRkaW5nOiA0cHggOXB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLW1hcmstbWVudSBidXR0b246aG92ZXIsXG4uamFydmlzLW1hcmstbWVudSBidXR0b246Zm9jdXMtdmlzaWJsZSB7XG4gICAgYmFja2dyb3VuZDogIzQxNGQ2NDtcbn1cbiNjb250ZXN0cyAubGVmdF9wYXJ0IC5zY3JvbGxfYXJlYS5qYXJ2aXMtY29udGVzdC1pbnN0YW50LFxuI2NvbnRlc3RzIC5yaWdodF9wYXJ0LmphcnZpcy1jb250ZXN0LWluc3RhbnQgLmxlYWRfdGFibGVfdmlldyB7XG4gICAgc2Nyb2xsLWJlaGF2aW9yOiBhdXRvICFpbXBvcnRhbnQ7XG4gICAgb3ZlcmZsb3ctYW5jaG9yOiBub25lICFpbXBvcnRhbnQ7XG59XG4jY29udGVzdHMgLmphcnZpcy1jb250ZXN0LWxvYWRpbmcge1xuICAgIG9wYWNpdHk6IDAgIWltcG9ydGFudDtcbiAgICB0cmFuc2l0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4jY29udGVzdHMgLnJpZ2h0X3BhcnQgLnJhbmtpbmdbaWRfY29udGVzdF0uamFydmlzLWNvbnRlc3Qtb3RoZXIge1xuICAgIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrPVwiZnJpZW5kXCJdIHtcbiAgICBjb2xvcjogdmFyKC0tamFydmlzLWZyaWVuZC1jb2xvcikgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrPVwiZm9lXCJdIHtcbiAgICBjb2xvcjogdmFyKC0tamFydmlzLWZvZS1jb2xvcikgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrXSxcbnRkW2RhdGEtamFydmlzLW1hcmtdID4gYSB7XG4gICAgdGV4dC1zaGFkb3c6IDFweCAwICMxMTE4MjcsIC0xcHggMCAjMTExODI3LCAwIDFweCAjMTExODI3LCAwIC0xcHggIzExMTgyNyAhaW1wb3J0YW50O1xufVxudGRbZGF0YS1qYXJ2aXMtbWFya10gPiBhIHtcbiAgICBjb2xvcjogaW5oZXJpdCAhaW1wb3J0YW50O1xufVxuLmphcnZpcy1zZXR0aW5nLWFjdGlvbiB7XG4gICAgYXBwZWFyYW5jZTogbm9uZTtcbiAgICBwYWRkaW5nOiAuMmVtIC41ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIGJvcmRlci1yYWRpdXM6IC4zNWVtO1xuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIGZvbnQ6IGluaGVyaXQ7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1zZXR0aW5nLWFjdGlvbjpob3Zlcixcbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246Zm9jdXMtdmlzaWJsZSB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAxNiUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246ZGlzYWJsZWQge1xuICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICBvcGFjaXR5OiAuNTtcbn1cbi5qYXJ2aXMtbWFyay1zZXR0aW5nLWFjdGlvbnMsXG4uamFydmlzLW1hcmstYWN0aW9ucyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgZ2FwOiAuNGVtO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXIge1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgd2lkdGg6IG1pbigzNHJlbSwgY2FsYygxMDB2dyAtIDJyZW0pKTtcbiAgICBtYXgtaGVpZ2h0OiBjYWxjKDEwMHZoIC0gMnJlbSk7XG4gICAgcGFkZGluZzogMXJlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC42NXJlbTtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jb25maWctc2V0dGluZy1iYWNrZ3JvdW5kLCAjMjQxZTMwKTtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBmb250OiAxNXB4LzEuMzUgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXI6OmJhY2tkcm9wIHtcbiAgICBiYWNrZ3JvdW5kOiAjMDgwYjEyYWE7XG59XG4uamFydmlzLW1hcmstbWFuYWdlciBoMixcbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIGgzLFxuLmphcnZpcy1tYXJrLW1hbmFnZXIgcCB7XG4gICAgbWFyZ2luOiAwO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIHtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgobWluKDEzcmVtLCAxMDAlKSwgMWZyKSk7XG4gICAgZ2FwOiAuOXJlbTtcbiAgICBtYXgtaGVpZ2h0OiA1MHZoO1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgbWFyZ2luLWJsb2NrOiAuOXJlbTtcbn1cbi5qYXJ2aXMtbWFyay1saXN0cyB1bCB7XG4gICAgbWFyZ2luOiAuM2VtIDAgMDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XG59XG4uamFydmlzLW1hcmstbGlzdHMgbGkge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgZ2FwOiAuNDVlbTtcbiAgICBwYWRkaW5nOiAuMmVtIDA7XG4gICAgb3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XG59XG4uamFydmlzLW1hcmstYWN0aW9ucyB7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xufVxuLmphcnZpcy12aWV3LWNoYW5nZWxvZyB7XG4gICAgbWFyZ2luLXRvcDogLjQ1ZW07XG59XG4uamFydmlzLWNoYW5nZWxvZy1wb3B1cCB7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICB3aWR0aDogbWluKDM3cmVtLCBjYWxjKDEwMCUgLSAycmVtKSk7XG4gICAgcGFkZGluZzogMDtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC42cmVtO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWNvbmZpZy1zZXR0aW5nLWJhY2tncm91bmQsICMyNDFlMzApO1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGZvbnQ6IDE1cHgvMS40NSBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7XG4gICAgdGV4dC1hbGlnbjogc3RhcnQ7XG59XG4uamFydmlzLWNoYW5nZWxvZy1uYXRpdmUgPiAuamFydmlzLWNoYW5nZWxvZy1wb3B1cCB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGluc2V0OiA1MCUgYXV0byBhdXRvIDUwJTtcbiAgICBoZWlnaHQ6IGF1dG87XG4gICAgbWFyZ2luOiAwO1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctcG9wdXA6OmJhY2tkcm9wIHtcbiAgICBiYWNrZ3JvdW5kOiAjMDgwYjEyYWE7XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IHtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiBhdXRvIG1pbm1heCgwLCAxZnIpIGF1dG87XG4gICAgZ2FwOiAuOXJlbTtcbiAgICBtYXgtaGVpZ2h0OiBtaW4oMzJyZW0sIDc1dmgpO1xuICAgIHBhZGRpbmc6IDFyZW07XG59XG4uamFydmlzLWNoYW5nZWxvZy1jb250ZW50IGgyLFxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBoMyB7XG4gICAgbWFyZ2luOiAwO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBoMiB7XG4gICAgZm9udC1zaXplOiAxLjNlbTtcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgaDMge1xuICAgIGNvbG9yOiB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNkOWM3ZmIpO1xuICAgIGZvbnQtc2l6ZTogMWVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBzZWN0aW9uICsgc2VjdGlvbixcbi5qYXJ2aXMtY2hhbmdlbG9nLWNvbnRlbnQgZGV0YWlscyB7XG4gICAgbWFyZ2luLXRvcDogLjc1cmVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90ZXMge1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgb3ZlcnNjcm9sbC1iZWhhdmlvcjogY29udGFpbjtcbiAgICBzY3JvbGxiYXItd2lkdGg6IHRoaW47XG4gICAgb3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XG59XG4uamFydmlzLWNoYW5nZWxvZy1ub3RlcyB1bCB7XG4gICAgbWFyZ2luOiAuMmVtIDAgMDtcbiAgICBwYWRkaW5nLWlubGluZS1zdGFydDogMS4yZW07XG4gICAgbGlzdC1zdHlsZTogZGlzYztcbn1cbi5qYXJ2aXMtY2hhbmdlbG9nLW5vdGVzIGxpICsgbGkge1xuICAgIG1hcmdpbi10b3A6IC4yNWVtO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctbm90ZXMgc3VtbWFyeSB7XG4gICAgbWFyZ2luLWJvdHRvbTogLjRyZW07XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jaGFuZ2Vsb2ctY29udGVudCBmb290ZXIge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBlbmQ7XG59XG4iLCAiaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgbW91bnRTZXR0aW5nc0hlbHAgfSBmcm9tICcuL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgY3NzIGZyb20gJy4vc2V0dGluZ3MuY3NzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdFN0eWxlcygpIHtcbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgc3R5bGUuY2xhc3NOYW1lID0gJ2hoLWphcnZpcy1zdHlsZSc7XG4gICAgc3R5bGUudGV4dENvbnRlbnQgPSBgJHtjc3N9XG4gICAgICAgIC5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIHsgLS1qYXJ2aXMtdmVyc2lvbjogXCJ2JHtVU0VSU0NSSVBUX1ZFUlNJT059XCI7IH1cbiAgICBgO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1NldHRpbmdzKCkge1xuICAgIGlmIChjdXJyZW50UGFnZSAhPT0gJy9ob21lLmh0bWwnKSByZXR1cm47XG5cbiAgICBjb25zdCBzZWxlY3RvciA9ICcuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5wYW5lbC1jb250ZW50cyc7XG4gICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKCFwYW5lbCkgcmV0dXJuO1xuICAgICAgICBwYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdoaC1zY3JvbGwnKTtcbiAgICAgICAgbW91bnRTZXR0aW5nc0hlbHAocGFuZWwsICdqYXJ2aXMtc2V0dGluZy10b29sdGlwJyk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5IHx8ICEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkgfHwgIXBhbmVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY29uc3QgdW5pdCA9IGV2ZW50LmRlbHRhTW9kZSA9PT0gMSA/IDE2IDogZXZlbnQuZGVsdGFNb2RlID09PSAyID8gcGFuZWwuY2xpZW50SGVpZ2h0IDogMTtcbiAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gcGFuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0IC8gcGFuZWwub2Zmc2V0SGVpZ2h0IHx8IDE7XG4gICAgICAgICAgICBwYW5lbC5zY3JvbGxUb3AgKz0gZXZlbnQuZGVsdGFZICogdW5pdCAvIHNjYWxlO1xuICAgICAgICB9LCB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IGZhbHNlIH0pO1xuXG4gICAgICAgIGNvbnN0IGNhcmRzID0gcGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5jb25maWctc2V0dGluZycpO1xuICAgICAgICBjb25zdCBwYWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFwYW5lbC5vZmZzZXRXaWR0aCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcbiAgICAgICAgICAgICAgICBjYXJkLnN0eWxlLnNldFByb3BlcnR5KCctLWphcnZpcy1zZXR0aW5nLXJvd3MnLCBTdHJpbmcoY2FyZC5vZmZzZXRIZWlnaHQgKyAxMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFuZWwuY2xhc3NMaXN0LmFkZCgnamFydmlzLXBhY2tlZC1zZXR0aW5ncycpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBncm91cE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIocGFjayk7XG4gICAgICAgIGlmIChwYW5lbC5wYXJlbnRFbGVtZW50KSBncm91cE9ic2VydmVyLm9ic2VydmUocGFuZWwucGFyZW50RWxlbWVudCwgeyBhdHRyaWJ1dGVGaWx0ZXI6IFsnY2xhc3MnXSB9KTtcbiAgICAgICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcihwYWNrKTtcbiAgICAgICAgICAgIGNhcmRzLmZvckVhY2goY2FyZCA9PiBzaXplT2JzZXJ2ZXIub2JzZXJ2ZShjYXJkKSk7XG4gICAgICAgIH1cbiAgICAgICAgcGFjaygpO1xuICAgIH0pO1xufVxuIiwgImV4cG9ydCB0eXBlIE1vZHVsZVNldHRpbmdzID0gUmVjb3JkPHN0cmluZywgYm9vbGVhbj47XG5cbmludGVyZmFjZSBDb25maWdTY2hlbWEge1xuICAgIGJhc2VLZXk6IHN0cmluZztcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIGRlZmF1bHQ6IGJvb2xlYW47XG4gICAgc3ViU2V0dGluZ3M/OiB7IGtleTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyBkZWZhdWx0OiBib29sZWFuIH1bXTtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhITW9kdWxlIHtcbiAgICByZWFkb25seSBncm91cCA9ICdKQVJWSVMnO1xuICAgIHJlYWRvbmx5IGNvbmZpZ1NjaGVtYTogQ29uZmlnU2NoZW1hO1xuICAgIGhhc1J1biA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoeyBjb25maWdTY2hlbWEgfTogeyBuYW1lOiBzdHJpbmc7IGNvbmZpZ1NjaGVtYTogQ29uZmlnU2NoZW1hIH0pIHtcbiAgICAgICAgdGhpcy5jb25maWdTY2hlbWEgPSBjb25maWdTY2hlbWE7XG4gICAgfVxuXG4gICAgYWJzdHJhY3Qgc2hvdWxkUnVuKCk6IGJvb2xlYW47XG4gICAgYWJzdHJhY3QgcnVuKHNldHRpbmdzOiBNb2R1bGVTZXR0aW5ncyk6IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xufVxuIiwgImV4cG9ydCBjb25zdCBMU19DT05GSUdfTkFNRSA9ICdISFN0YXJrJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxzR2V0KGtleTogc3RyaW5nLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpOiB1bmtub3duIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShgJHtsc19uYW1lfSR7a2V5fWApID8/ICdudWxsJylcbn1cbmV4cG9ydCBmdW5jdGlvbiBsc1NldChrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24sIGxzX25hbWUgPSBMU19DT05GSUdfTkFNRSkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgJHtsc19uYW1lfSR7a2V5fWAsIEpTT04uc3RyaW5naWZ5KHZhbHVlKSlcbn1cbmV4cG9ydCBmdW5jdGlvbiBsc1JtKGtleTogc3RyaW5nLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gKVxufVxuIiwgImltcG9ydCB7IExTX0NPTkZJR19OQU1FIH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5cbmV4cG9ydCB0eXBlIE1hcmsgPSAnZnJpZW5kJyB8ICdmb2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNhdmVkTWFyayB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBuYW1lPzogc3RyaW5nO1xuICAgIG1hcms6IE1hcms7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcGVuTWFya01hbmFnZXIocmVhZDogKCkgPT4gU2F2ZWRNYXJrW10sIHJlbW92ZTogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW4sIGNsZWFyOiAoKSA9PiBib29sZWFuKSB7XG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXMtbWFyay1tYW5hZ2VyJykpIHJldHVybjtcblxuICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpYWxvZycpO1xuICAgIGRpYWxvZy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstbWFuYWdlcic7XG4gICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JywgJ2phcnZpcy1tYXJrLW1hbmFnZXItdGl0bGUnKTtcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgdGl0bGUuaWQgPSAnamFydmlzLW1hcmstbWFuYWdlci10aXRsZSc7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSAnRnJpZW5kcyBhbmQgZm9lcyc7XG5cbiAgICBjb25zdCBsaXN0cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxpc3RzLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1saXN0cyc7XG4gICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGFjdGlvbnMuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLWFjdGlvbnMnO1xuICAgIGNvbnN0IGNsZWFyQWxsID0gbWFrZUJ1dHRvbignQ2xlYXIgYWxsIG1hcmtzJywgKCkgPT4ge1xuICAgICAgICBpZiAoY29uZmlybSgnUmVtb3ZlIGFsbCBmcmllbmQgYW5kIGZvZSBtYXJrcyBmb3IgdGhpcyBnYW1lPycpICYmIGNsZWFyKCkpIHtcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgY2xvc2UuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IGNsb3NlID0gbWFrZUJ1dHRvbignQ2xvc2UnLCAoKSA9PiBkaWFsb2cuY2xvc2UoKSk7XG4gICAgYWN0aW9ucy5hcHBlbmQoY2xlYXJBbGwsIGNsb3NlKTtcblxuICAgIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IHJlYWQoKS5zb3J0KChhLCBiKSA9PiBOdW1iZXIoIWEubmFtZSkgLSBOdW1iZXIoIWIubmFtZSkgfHxcbiAgICAgICAgICAgIChhLm5hbWUgfHwgYS5pZCkubG9jYWxlQ29tcGFyZShiLm5hbWUgfHwgYi5pZCwgdW5kZWZpbmVkLCB7IG51bWVyaWM6IHRydWUgfSkpO1xuICAgICAgICBjb25zdCBzZWN0aW9ucyA9IChbJ2ZyaWVuZCcsICdmb2UnXSBhcyBjb25zdCkubWFwKG1hcmsgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlY3Rpb24nKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGVudHJpZXMuZmlsdGVyKGVudHJ5ID0+IGVudHJ5Lm1hcmsgPT09IG1hcmspO1xuICAgICAgICAgICAgaGVhZGluZy50ZXh0Q29udGVudCA9IChtYXJrID09PSAnZnJpZW5kJyA/ICdGcmllbmRzJyA6ICdGb2VzJykgKyBgICgke21hdGNoZXMubGVuZ3RofSlgO1xuICAgICAgICAgICAgc2VjdGlvbi5hcHBlbmRDaGlsZChoZWFkaW5nKTtcblxuICAgICAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW1wdHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgICAgICAgICAgZW1wdHkudGV4dENvbnRlbnQgPSAnTm8gc2F2ZWQgcGxheWVycy4nO1xuICAgICAgICAgICAgICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoZW1wdHkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWN0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBpZCwgbmFtZSB9IG9mIG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBsYXllciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIudGV4dENvbnRlbnQgPSBuYW1lID8gYCR7bmFtZX0gwrcgJHtpZH1gIDogaWQ7XG4gICAgICAgICAgICAgICAgaWYgKCFuYW1lKSBwbGF5ZXIudGl0bGUgPSAnVGhlIG5hbWUgd2lsbCBhcHBlYXIgYWZ0ZXIgSmFydmlzIHNlZXMgdGhpcyBwbGF5ZXIuJztcbiAgICAgICAgICAgICAgICBjb25zdCBidXR0b24gPSBtYWtlQnV0dG9uKCdSZW1vdmUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gQXJyYXkuZnJvbShsaXN0cy5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKSkuaW5kZXhPZihidXR0b24pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3ZlKGlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmcgPSBsaXN0cy5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIChyZW1haW5pbmdbTWF0aC5taW4oaW5kZXgsIHJlbWFpbmluZy5sZW5ndGggLSAxKV0gfHwgY2xvc2UpLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgYFJlbW92ZSAke25hbWUgfHwgYHBsYXllciAke2lkfWB9IGZyb20gJHttYXJrID09PSAnZnJpZW5kJyA/ICdmcmllbmRzJyA6ICdmb2VzJ31gKTtcbiAgICAgICAgICAgICAgICByb3cuYXBwZW5kKHBsYXllciwgYnV0dG9uKTtcbiAgICAgICAgICAgICAgICBsaXN0LmFwcGVuZENoaWxkKHJvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWN0aW9uLmFwcGVuZENoaWxkKGxpc3QpO1xuICAgICAgICAgICAgcmV0dXJuIHNlY3Rpb247XG4gICAgICAgIH0pO1xuICAgICAgICBsaXN0cy5yZXBsYWNlQ2hpbGRyZW4oLi4uc2VjdGlvbnMpO1xuICAgICAgICBjbGVhckFsbC5kaXNhYmxlZCA9IGVudHJpZXMubGVuZ3RoID09PSAwO1xuICAgIH1cblxuICAgIHJlbmRlcigpO1xuICAgIGRpYWxvZy5hcHBlbmQodGl0bGUsIGxpc3RzLCBhY3Rpb25zKTtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3N0b3JhZ2UnLCBldmVudCA9PiB7XG4gICAgICAgIGlmICghZXZlbnQua2V5IHx8IFsnUGxheWVyTWFya3MnLCAnUGxheWVyTWFya05hbWVzJywgJ0ZyaWVuZExpc3QnLCAnRm9lTGlzdCddXG4gICAgICAgICAgICAuc29tZShrZXkgPT4gZXZlbnQua2V5ID09PSBMU19DT05GSUdfTkFNRSArIGtleSkpIHJlbmRlcigpO1xuICAgIH0sIHsgc2lnbmFsOiBsaXN0ZW5lcnMuc2lnbmFsIH0pO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgbGlzdGVuZXJzLmFib3J0KCk7XG4gICAgICAgIGRpYWxvZy5yZW1vdmUoKTtcbiAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaWFsb2cpO1xuICAgIGRpYWxvZy5zaG93TW9kYWwoKTtcbiAgICBjbG9zZS5mb2N1cygpO1xufVxuXG5mdW5jdGlvbiBtYWtlQnV0dG9uKGxhYmVsOiBzdHJpbmcsIG9uQ2xpY2s6ICgpID0+IHZvaWQpIHtcbiAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uJztcbiAgICBidXR0b24udGV4dENvbnRlbnQgPSBsYWJlbDtcbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrKTtcbiAgICByZXR1cm4gYnV0dG9uO1xufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgdHlwZSB7IENvbnRlc3REYXRhIH0gZnJvbSAnLi4vLi4vZ2FtZS10eXBlcyc7XG5pbXBvcnQgeyBMU19DT05GSUdfTkFNRSwgbHNHZXQsIGxzU2V0IH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5pbXBvcnQgeyBvcGVuTWFya01hbmFnZXIsIHR5cGUgTWFyaywgdHlwZSBTYXZlZE1hcmsgfSBmcm9tICcuL21hcmtNYW5hZ2VyJztcblxuY29uc3QgREVGQVVMVF9DT0xPUlM6IFJlY29yZDxNYXJrLCBzdHJpbmc+ID0geyBmcmllbmQ6ICcjNDhhOWZmJywgZm9lOiAnI2ZmNjE3MycgfTtcblxuZXhwb3J0IGNsYXNzIEZyaWVuZEFuZEZvZXMgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBuYW1lcyA9IG5ldyBNYXA8SFRNTEVsZW1lbnQsIHN0cmluZz4oKTtcbiAgICBwcml2YXRlIG1hcmtNZW51OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcm9vdDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJvb3RTZWxlY3RvciA9ICcnO1xuICAgIHByaXZhdGUgaW5MZWFndWUgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2ZyaWVuZEFuZEZvZXMnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiRnJpZW5kcyBhbmQgZm9lc1wiLCBcIlJpZ2h0LWNsaWNrIGVhY2ggcGxheWVyJ3MgbmFtZSB0byBhZGQgb3IgcmVtb3ZlIGEgbWFyay4gTWFuYWdlIHNhdmVkIG1hcmtzIGJlbG93LlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ2xlYWd1ZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiSW4gbGVhZ3Vlc1wiLCBcIlNob3cgbWFya3MgYW5kIGFsbG93IG1hcmtpbmcgaW4gbGVhZ3VlIHRhYmxlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2NvbnRlc3RzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJJbiBjb250ZXN0c1wiLCBcIlNob3cgbWFya3MgYW5kIGFsbG93IG1hcmtpbmcgb24gY29udGVzdCBsZWFkZXJib2FyZHMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoeyBuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWEgfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gWycvbGVhZ3Vlcy5odG1sJywgJy9hY3Rpdml0aWVzLmh0bWwnXS5pbmNsdWRlcyhjdXJyZW50UGFnZSk7XG4gICAgfVxuXG4gICAgcmVhZFNldHRpbmcoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBsc0dldChrZXkpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVhZE1hcmtzKCk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICAgICAgY29uc3Qgc3RvcmVkID0gdGhpcy5yZWFkU2V0dGluZygnUGxheWVyTWFya3MnKTtcbiAgICAgICAgaWYgKHN0b3JlZCAmJiB0eXBlb2Ygc3RvcmVkID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShzdG9yZWQpKSByZXR1cm4gc3RvcmVkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gICAgICAgIGNvbnN0IG1hcmtzOiBSZWNvcmQ8c3RyaW5nLCBNYXJrPiA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIG1hcmtdIG9mIFtbJ0ZyaWVuZExpc3QnLCAnZnJpZW5kJ10sIFsnRm9lTGlzdCcsICdmb2UnXV0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSB0aGlzLnJlYWRTZXR0aW5nKGtleSk7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdCkpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGxpc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoL15bMS05XVxcZCokLy50ZXN0KFN0cmluZyhpZCkpKSBtYXJrc1tTdHJpbmcoaWQpXSA9IG1hcms7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcmtzO1xuICAgIH1cblxuICAgIHJlYWRDb2xvcnMoKTogUmVjb3JkPE1hcmssIHN0cmluZz4ge1xuICAgICAgICBjb25zdCBzYXZlZCA9IHRoaXMucmVhZFNldHRpbmcoJ1BsYXllck1hcmtDb2xvcnMnKSBhcyBQYXJ0aWFsPFJlY29yZDxNYXJrLCB1bmtub3duPj4gfCBudWxsO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZnJpZW5kOiB0eXBlb2Ygc2F2ZWQ/LmZyaWVuZCA9PT0gJ3N0cmluZycgJiYgL14jW1xcZGEtZl17Nn0kL2kudGVzdChzYXZlZC5mcmllbmQpID8gc2F2ZWQuZnJpZW5kIDogREVGQVVMVF9DT0xPUlMuZnJpZW5kLFxuICAgICAgICAgICAgZm9lOiB0eXBlb2Ygc2F2ZWQ/LmZvZSA9PT0gJ3N0cmluZycgJiYgL14jW1xcZGEtZl17Nn0kL2kudGVzdChzYXZlZC5mb2UpID8gc2F2ZWQuZm9lIDogREVGQVVMVF9DT0xPUlMuZm9lXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmVhZFNhdmVkTmFtZXMoKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IHNhdmVkID0gdGhpcy5yZWFkU2V0dGluZygnUGxheWVyTWFya05hbWVzJyk7XG4gICAgICAgIGlmICghc2F2ZWQgfHwgdHlwZW9mIHNhdmVkICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHNhdmVkKSkgcmV0dXJuIHt9O1xuICAgICAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKHNhdmVkKS5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgW3N0cmluZywgc3RyaW5nXSA9PiB0eXBlb2YgZW50cnlbMV0gPT09ICdzdHJpbmcnKSk7XG4gICAgfVxuXG4gICAgc2F2ZU5hbWVzKG5hbWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsc1NldCgnUGxheWVyTWFya05hbWVzJywgbmFtZXMpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCByZW1lbWJlciBtYXJrZWQgcGxheWVyIG5hbWVzOicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVNYXJrKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgbWFya3MgPSB0aGlzLnJlYWRNYXJrcygpO1xuICAgICAgICBkZWxldGUgbWFya3NbaWRdO1xuICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtzJywgbWFya3MpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gdGhpcy5yZWFkU2F2ZWROYW1lcygpO1xuICAgICAgICBpZiAoaWQgaW4gbmFtZXMpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBuYW1lc1tpZF07XG4gICAgICAgICAgICB0aGlzLnNhdmVOYW1lcyhuYW1lcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmVhZFNhdmVkTWFya3MoKSB7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gdGhpcy5yZWFkU2F2ZWROYW1lcygpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmVudHJpZXModGhpcy5yZWFkTWFya3MoKSkuZmxhdE1hcDxTYXZlZE1hcms+KChbaWQsIG1hcmtdKSA9PlxuICAgICAgICAgICAgL15bMS05XVxcZCokLy50ZXN0KGlkKSAmJiAobWFyayA9PT0gJ2ZyaWVuZCcgfHwgbWFyayA9PT0gJ2ZvZScpXG4gICAgICAgICAgICAgICAgPyBbeyBpZCwgbmFtZTogbmFtZXNbaWRdLCBtYXJrIH1dXG4gICAgICAgICAgICAgICAgOiBbXSk7XG4gICAgfVxuXG4gICAgc2F2ZVNldHRpbmcoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsc1NldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIGFsZXJ0KCdKYXJ2aXMgY291bGQgbm90IHNhdmUgeW91ciBGcmllbmRzIGFuZCBGb2VzIHNldHRpbmdzLicpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5zdGFsbFNldHRpbmdzKCkge1xuICAgICAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gJy5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmNvbmZpZy1zZXR0aW5nW3JlbD1cIkpBUlZJU19mcmllbmRBbmRGb2VzXCJdIC5zdWItc2V0dGluZ3MnO1xuICAgICAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZXR0aW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5ncyB8fCBzZXR0aW5ncy5xdWVyeVNlbGVjdG9yKCcuamFydmlzLW1hcmstY29sb3InKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBpbnB1dHMgPSBuZXcgTWFwPE1hcmssIEhUTUxJbnB1dEVsZW1lbnQ+KCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCB0ZXh0XSBvZiBbWydmcmllbmQnLCAnRnJpZW5kIG5hbWUgY29sb3InXSwgWydmb2UnLCAnRm9lIG5hbWUgY29sb3InXV0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLWNvbG9yJztcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICB0aXRsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICAgICAgICAgIGlucHV0LnR5cGUgPSAnY29sb3InO1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdGhpcy5yZWFkQ29sb3JzKClbbWFya107XG4gICAgICAgICAgICAgICAgaW5wdXRzLnNldChtYXJrLCBpbnB1dCk7XG4gICAgICAgICAgICAgICAgaW5wdXQuZGlzYWJsZWQgPSAhc2V0dGluZ3MuY2xvc2VzdCgnLmNvbmZpZy1zZXR0aW5nJyk/LmNsYXNzTGlzdC5jb250YWlucygnZW5hYmxlZCcpO1xuICAgICAgICAgICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sb3JzID0gdGhpcy5yZWFkQ29sb3JzKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya0NvbG9ycycsIHsgLi4uY29sb3JzLCBbbWFya106IGlucHV0LnZhbHVlIH0pKSBpbnB1dC52YWx1ZSA9IGNvbG9yc1ttYXJrXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBsYWJlbC5hcHBlbmQodGl0bGUsIGlucHV0KTtcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5hcHBlbmRDaGlsZChsYWJlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXNldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgcmVzZXQudHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgcmVzZXQuY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgICAgICAgICByZXNldC50ZXh0Q29udGVudCA9ICdSZXNldCBjb2xvcnMnO1xuICAgICAgICAgICAgcmVzZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrQ29sb3JzJywge30pKSByZXR1cm47XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBbbWFyaywgaW5wdXRdIG9mIGlucHV0cykgaW5wdXQudmFsdWUgPSBERUZBVUxUX0NPTE9SU1ttYXJrXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgbWFuYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBtYW5hZ2UudHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgbWFuYWdlLmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgICAgICAgICAgbWFuYWdlLnRleHRDb250ZW50ID0gJ01hbmFnZSBtYXJrcyc7XG4gICAgICAgICAgICBtYW5hZ2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBvcGVuTWFya01hbmFnZXIoXG4gICAgICAgICAgICAgICAgKCkgPT4gdGhpcy5yZWFkU2F2ZWRNYXJrcygpLFxuICAgICAgICAgICAgICAgIGlkID0+IHRoaXMucmVtb3ZlTWFyayhpZCksXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtzJywge30pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZU5hbWVzKHt9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1zZXR0aW5nLWFjdGlvbnMnO1xuICAgICAgICAgICAgYWN0aW9ucy5hcHBlbmQocmVzZXQsIG1hbmFnZSk7XG4gICAgICAgICAgICBzZXR0aW5ncy5hcHBlbmRDaGlsZChhY3Rpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2xvc2VNYXJrTWVudSgpIHtcbiAgICAgICAgdGhpcy5tYXJrTWVudT8ucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMubWFya01lbnUgPSBudWxsO1xuICAgIH1cblxuICAgIG9wZW5NYXJrTWVudShldmVudDogTW91c2VFdmVudCwgbmFtZTogSFRNTEVsZW1lbnQsIGlkOiBzdHJpbmcpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuXG4gICAgICAgIGNvbnN0IG1lbnUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbWVudS5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstbWVudSc7XG4gICAgICAgIG1lbnUuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2dyb3VwJyk7XG4gICAgICAgIG1lbnUuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ01hcmsgcGxheWVyJyk7XG4gICAgICAgIGNvbnN0IGFkZEFjdGlvbiA9ICh0ZXh0OiBzdHJpbmcsIGFjdDogKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZS5pc0Nvbm5lY3RlZCAmJiB0aGlzLm5hbWVzLmdldChuYW1lKSA9PT0gaWQpIGFjdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtZW51LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAoY29uc3QgW21hcmssIHRleHRdIG9mIFtbJ2ZyaWVuZCcsICdNYXJrIGFzIGZyaWVuZCddLCBbJ2ZvZScsICdNYXJrIGFzIGZvZSddXSBhcyBjb25zdCkge1xuICAgICAgICAgICAgYWRkQWN0aW9uKHRleHQsICgpID0+IHRoaXMuYXBwbHlNYXJrKGlkLCBtYXJrKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrKSBhZGRBY3Rpb24oJ1JlbW92ZSB0aGlzIHBsYXllcuKAmXMgbWFyaycsICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlbW92ZU1hcmsoaWQpKSB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGljayA9PiBjbGljay5zdG9wUHJvcGFnYXRpb24oKSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWVudSk7XG4gICAgICAgIHRoaXMubWFya01lbnUgPSBtZW51O1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IG5hbWUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHggPSBldmVudC5jbGllbnRYIHx8IGJvdW5kcy5sZWZ0O1xuICAgICAgICBjb25zdCB5ID0gZXZlbnQuY2xpZW50WSB8fCBib3VuZHMuYm90dG9tO1xuICAgICAgICBtZW51LnN0eWxlLmxlZnQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih4LCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggLSBtZW51Lm9mZnNldFdpZHRoKSkgKyAncHgnO1xuICAgICAgICBtZW51LnN0eWxlLnRvcCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHksIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgLSBtZW51Lm9mZnNldEhlaWdodCkpICsgJ3B4JztcbiAgICAgICAgbWVudS5xdWVyeVNlbGVjdG9yKCdidXR0b24nKT8uZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIGdldENvbnRlc3ROYW1lcyhyb290OiBIVE1MRWxlbWVudCwgY29udGVzdHM6IENvbnRlc3REYXRhW10pIHtcbiAgICAgICAgY29uc3QgbmFtZXMgPSBuZXcgTWFwPEhUTUxFbGVtZW50LCBzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IGJ5Q29udGVzdCA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj4+KCk7XG5cbiAgICAgICAgZm9yIChjb25zdCByb3cgb2Ygcm9vdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxUYWJsZVJvd0VsZW1lbnQ+KCcubGVhZFRhYmxlIHRyJykpIHtcbiAgICAgICAgICAgIGNvbnN0IGNlbGwgPSByb3cuY2VsbHM/LlsxXTtcbiAgICAgICAgICAgIGlmICghY2VsbCB8fCBjZWxsLmxvY2FsTmFtZSAhPT0gJ3RkJykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gY2VsbC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLm5pY2tuYW1lJykgfHwgY2VsbDtcbiAgICAgICAgICAgIGxldCBpZCA9IHJvdy5nZXRBdHRyaWJ1dGUoJ3NvcnRpbmdfaWQnKSB8fCBuYW1lLmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJykgfHxcbiAgICAgICAgICAgICAgICBuYW1lLnF1ZXJ5U2VsZWN0b3IoJ1tpZC1tZW1iZXJdJyk/LmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJyk7XG4gICAgICAgICAgICBjb25zdCBjb250ZXN0SWQgPSByb3cuY2xvc2VzdCgnW2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKGNvbnRlc3RJZCkge1xuICAgICAgICAgICAgICAgIGxldCBieU5hbWUgPSBieUNvbnRlc3QuZ2V0KGNvbnRlc3RJZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFieU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydGljaXBhbnRzID0gY29udGVzdHMuZmluZChjb250ZXN0ID0+IFN0cmluZyhjb250ZXN0LmlkX2NvbnRlc3QpID09PSBjb250ZXN0SWQpPy5wYXJ0aWNpcGFudHM7XG4gICAgICAgICAgICAgICAgICAgIGJ5TmFtZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IG5pY2tuYW1lLCBpZF9tZW1iZXIgfSBvZiBPYmplY3QudmFsdWVzKHBhcnRpY2lwYW50cyB8fCB7fSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5pY2tuYW1lS2V5ID0gU3RyaW5nKG5pY2tuYW1lID8/ICcnKS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5pY2tuYW1lS2V5IHx8ICEvXlsxLTldXFxkKiQvLnRlc3QoU3RyaW5nKGlkX21lbWJlcikpKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBieU5hbWUuZ2V0KG5pY2tuYW1lS2V5KSB8fCBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZXMuYWRkKFN0cmluZyhpZF9tZW1iZXIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5TmFtZS5zZXQobmlja25hbWVLZXksIG1hdGNoZXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJ5Q29udGVzdC5zZXQoY29udGVzdElkLCBieU5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYnlOYW1lLmdldCgobmFtZS50ZXh0Q29udGVudCA/PyAnJykudHJpbSgpKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcyAmJiAhbWF0Y2hlcy5oYXMoaWQgPz8gJycpKSBpZCA9IG1hdGNoZXMuc2l6ZSA9PT0gMSA/IG1hdGNoZXMudmFsdWVzKCkubmV4dCgpLnZhbHVlIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZCAmJiAvXlsxLTldXFxkKiQvLnRlc3QoaWQpKSBuYW1lcy5zZXQobmFtZSwgaWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYW1lcztcbiAgICB9XG5cbiAgICByZWZyZXNoKCkge1xuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4odGhpcy5yb290U2VsZWN0b3IpO1xuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xuICAgICAgICBjb25zdCBjb250ZXN0cyA9IHRoaXMuaW5MZWFndWUgPyBbXSA6IFtcbiAgICAgICAgICAgIC4uLk9iamVjdC52YWx1ZXMod2luZG93LmNvbnRlc3RzPy5hY3RpdmUgPz8ge30pLFxuICAgICAgICAgICAgLi4uT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmZpbmlzaGVkID8/IHt9KVxuICAgICAgICBdLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbCk7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gIXJvb3QgPyBuZXcgTWFwPEhUTUxFbGVtZW50LCBzdHJpbmc+KCkgOiB0aGlzLmluTGVhZ3VlXG4gICAgICAgICAgICA/IG5ldyBNYXAoQXJyYXkuZnJvbShyb290LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcubmlja25hbWVbaWQtbWVtYmVyXScpLCBuYW1lID0+IFtuYW1lLCBuYW1lLmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJyldIGFzIGNvbnN0KVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgcmVhZG9ubHkgW0hUTUxFbGVtZW50LCBzdHJpbmddID0+ICEhZW50cnlbMV0gJiYgL15bMS05XVxcZCokLy50ZXN0KGVudHJ5WzFdKSkpXG4gICAgICAgICAgICA6IHRoaXMuZ2V0Q29udGVzdE5hbWVzKHJvb3QsIGNvbnRlc3RzKTtcblxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5uYW1lcy5rZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChuYW1lcy5oYXMobmFtZSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNQbGF5ZXI7XG4gICAgICAgICAgICBkZWxldGUgbmFtZS5kYXRhc2V0LmphcnZpc01hcms7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5hbWVzID0gbmFtZXM7XG4gICAgICAgIGlmICghcm9vdCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBtYXJrcyA9IHRoaXMucmVhZE1hcmtzKCk7XG4gICAgICAgIGNvbnN0IHNhdmVkTmFtZXMgPSB0aGlzLnJlYWRTYXZlZE5hbWVzKCk7XG4gICAgICAgIGNvbnN0IHJvc3Rlck5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGxldCBuYW1lc0NoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgcmVtZW1iZXJOYW1lID0gKGlkOiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcgfCBudWxsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IHR5cGVvZiB0ZXh0ID09PSAnc3RyaW5nJyA/IHRleHQudHJpbSgpIDogJyc7XG4gICAgICAgICAgICBpZiAoIWRpc3BsYXlOYW1lIHx8IChtYXJrc1tpZF0gIT09ICdmcmllbmQnICYmIG1hcmtzW2lkXSAhPT0gJ2ZvZScpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAoc2F2ZWROYW1lc1tpZF0gIT09IGRpc3BsYXlOYW1lKSB7XG4gICAgICAgICAgICAgICAgc2F2ZWROYW1lc1tpZF0gPSBkaXNwbGF5TmFtZTtcbiAgICAgICAgICAgICAgICBuYW1lc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmluTGVhZ3VlKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgcGxheWVyLCBuaWNrbmFtZSB9IG9mIHdpbmRvdy5vcHBvbmVudHNfbGlzdCA/PyBbXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gU3RyaW5nKHBsYXllcj8uaWRfZmlnaHRlcik7XG4gICAgICAgICAgICAgICAgaWYgKHJlbWVtYmVyTmFtZShpZCwgbmlja25hbWUpKSByb3N0ZXJOYW1lcy5hZGQoaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gUHJlZmVyIHRoZSBhY3RpdmUgcm9zdGVyIGlmIGEgcGxheWVyIGFwcGVhcnMgaW4gYm90aCBvbGQgYW5kIGN1cnJlbnQgY29udGVzdHMuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNvbnRlc3Qgb2YgY29udGVzdHMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHsgaWRfbWVtYmVyLCBuaWNrbmFtZSB9IG9mIE9iamVjdC52YWx1ZXMoY29udGVzdC5wYXJ0aWNpcGFudHMgPz8ge30pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gU3RyaW5nKGlkX21lbWJlcik7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcm9zdGVyTmFtZXMuaGFzKGlkKSAmJiByZW1lbWJlck5hbWUoaWQsIG5pY2tuYW1lKSkgcm9zdGVyTmFtZXMuYWRkKGlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29sb3JzID0gdGhpcy5yZWFkQ29sb3JzKCk7XG4gICAgICAgIGZvciAoY29uc3QgW21hcmssIGNvbG9yXSBvZiBPYmplY3QuZW50cmllcyhjb2xvcnMpKSB7XG4gICAgICAgICAgICBjb25zdCBwcm9wZXJ0eSA9ICctLWphcnZpcy0nICsgbWFyayArICctY29sb3InO1xuICAgICAgICAgICAgaWYgKHJvb3Quc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eSkgIT09IGNvbG9yKSByb290LnN0eWxlLnNldFByb3BlcnR5KHByb3BlcnR5LCBjb2xvcik7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgaWRdIG9mIG5hbWVzKSB7XG4gICAgICAgICAgICBpZiAobmFtZS5kYXRhc2V0LmphcnZpc1BsYXllciAhPT0gaWQpIG5hbWUuZGF0YXNldC5qYXJ2aXNQbGF5ZXIgPSBpZDtcbiAgICAgICAgICAgIGNvbnN0IG1hcmsgPSBtYXJrc1tpZF07XG4gICAgICAgICAgICBpZiAobWFyayA9PT0gJ2ZyaWVuZCcgfHwgbWFyayA9PT0gJ2ZvZScpIHtcbiAgICAgICAgICAgICAgICBpZiAobmFtZS5kYXRhc2V0LmphcnZpc01hcmsgIT09IG1hcmspIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrID0gbWFyaztcbiAgICAgICAgICAgICAgICBpZiAoIXJvc3Rlck5hbWVzLmhhcyhpZCkpIHJlbWVtYmVyTmFtZShpZCwgbmFtZS50ZXh0Q29udGVudCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lc0NoYW5nZWQpIHRoaXMuc2F2ZU5hbWVzKHNhdmVkTmFtZXMpO1xuICAgIH1cblxuICAgIGFwcGx5TWFyayhpZDogc3RyaW5nLCBtYXJrOiBNYXJrKSB7XG4gICAgICAgIGNvbnN0IG1hcmtzID0gdGhpcy5yZWFkTWFya3MoKTtcbiAgICAgICAgbWFya3NbaWRdID0gbWFyaztcblxuICAgICAgICBpZiAodGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya3MnLCBtYXJrcykpIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIGhhbmRsZU1hcmtNZW51KGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlICYmIHRoaXMubWFya01lbnU/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcbiAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG4gICAgICAgIGlmIChldmVudC50eXBlICE9PSAnY29udGV4dG1lbnUnICYmICFldmVudC5hbHRLZXkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBuYW1lID0gZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCA/IGV2ZW50LnRhcmdldC5jbG9zZXN0PEhUTUxFbGVtZW50PignW2RhdGEtamFydmlzLXBsYXllcl0nKSA6IG51bGw7XG4gICAgICAgIGlmICghbmFtZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBpZCA9IHRoaXMubmFtZXMuZ2V0KG5hbWUpO1xuICAgICAgICBpZiAoIWlkKSByZXR1cm47XG4gICAgICAgIHRoaXMub3Blbk1hcmtNZW51KGV2ZW50LCBuYW1lLCBpZCk7XG4gICAgfVxuXG4gICAgcnVuKHsgbGVhZ3VlLCBjb250ZXN0cyB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgdGhpcy5pbkxlYWd1ZSA9IGN1cnJlbnRQYWdlID09PSAnL2xlYWd1ZXMuaHRtbCc7XG4gICAgICAgIGlmICh0aGlzLmluTGVhZ3VlID8gIWxlYWd1ZSA6ICFjb250ZXN0cykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucm9vdFNlbGVjdG9yID0gdGhpcy5pbkxlYWd1ZSA/ICcubGVhZ3VlX3RhYmxlJyA6ICcjY29udGVzdHMgLnJpZ2h0X3BhcnQnO1xuICAgICAgICBjb25zdCBoYW5kbGVNYXJrTWVudSA9IChldmVudDogTW91c2VFdmVudCkgPT4gdGhpcy5oYW5kbGVNYXJrTWVudShldmVudCk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlTWFya01lbnUsIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGhhbmRsZU1hcmtNZW51LCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5rZXkgIT09ICdFc2NhcGUnIHx8ICF0aGlzLm1hcmtNZW51KSByZXR1cm47XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKCFldmVudC5rZXkgfHwgWydQbGF5ZXJNYXJrcycsICdQbGF5ZXJNYXJrQ29sb3JzJywgJ0ZyaWVuZExpc3QnLCAnRm9lTGlzdCddXG4gICAgICAgICAgICAgICAgLnNvbWUoa2V5ID0+IGV2ZW50LmtleSA9PT0gTFNfQ09ORklHX05BTUUgKyBrZXkpKSB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihtdXRhdGlvbnMgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5yb290U2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHJvb3QgIT09IHRoaXMucm9vdCB8fCAocm9vdCAmJiBtdXRhdGlvbnMuc29tZSgoeyB0YXJnZXQgfSkgPT4gcm9vdC5jb250YWlucyh0YXJnZXQpKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZSxcbiAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ3NvcnRpbmdfaWQnLCAnaWQtbWVtYmVyJywgJ2lkX2NvbnRlc3QnXVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBsc0dldCwgbHNTZXQgfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcblxuZXhwb3J0IHR5cGUgQ29udGVzdEtpbmQgPSAnZGFpbHknIHwgJ2V2ZW50JztcbmV4cG9ydCB0eXBlIENvbnRlc3RSYW5rID0gJ3RvcCcgfCAnbWluZSc7XG5cbmNvbnN0IENPTlRFU1RfS0lORFMgPSBbWydkYWlseScsICdEYWlseSddLCBbJ2V2ZW50JywgJ0V2ZW50J11dIGFzIGNvbnN0O1xuY29uc3QgQ09OVEVTVF9SQU5LUyA9IFtbJ3RvcCcsICdUb3AnXSwgWydtaW5lJywgJ015IHJhbmsnXV0gYXMgY29uc3Q7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQ29udGVzdFNldHRpbmcoa2V5OiBzdHJpbmcpOiB1bmtub3duIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gbHNHZXQoa2V5KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZENvbnRlc3REZWZhdWx0cygpIHtcbiAgICBjb25zdCBraW5kOiBDb250ZXN0S2luZCA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdEtpbmQnKSA9PT0gJ2V2ZW50JyA/ICdldmVudCcgOiAnZGFpbHknO1xuICAgIGNvbnN0IHJhbms6IENvbnRlc3RSYW5rID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0UmFua1N0YXJ0JykgPT09ICdtaW5lJyA/ICdtaW5lJyA6ICd0b3AnO1xuICAgIHJldHVybiB7IGtpbmQsIHJhbmsgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRQaW5uZWRSYW5rKGlkOiBzdHJpbmcsIGZhbGxiYWNrOiBDb250ZXN0UmFuayk6IENvbnRlc3RSYW5rIHtcbiAgICBjb25zdCBzYXZlZCA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdFBpbm5lZFJhbmsnKTtcbiAgICBpZiAoc2F2ZWQgJiYgdHlwZW9mIHNhdmVkID09PSAnb2JqZWN0JyAmJiAnaWQnIGluIHNhdmVkICYmIHNhdmVkLmlkID09PSBpZCAmJiAncmFuaycgaW4gc2F2ZWQpIHtcbiAgICAgICAgaWYgKHNhdmVkLnJhbmsgPT09ICdtaW5lJyB8fCBzYXZlZC5yYW5rID09PSAndG9wJykgcmV0dXJuIHNhdmVkLnJhbms7XG4gICAgfVxuICAgIHJldHVybiBmYWxsYmFjaztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VSYW5rQ2hvaWNlKGxhYmVsOiBzdHJpbmcsIHNlbGVjdDogKHJhbms6IENvbnRlc3RSYW5rKSA9PiB2b2lkKSB7XG4gICAgcmV0dXJuIG1ha2VDaG9pY2UobGFiZWwsIENPTlRFU1RfUkFOS1MsIHNlbGVjdCk7XG59XG5cbmZ1bmN0aW9uIG1ha2VDaG9pY2U8VCBleHRlbmRzIHN0cmluZz4obGFiZWw6IHN0cmluZywgb3B0aW9uczogUmVhZG9ubHlBcnJheTxyZWFkb25seSBbVCwgc3RyaW5nXT4sIHNlbGVjdDogKHZhbHVlOiBUKSA9PiB2b2lkKSB7XG4gICAgY29uc3QgZ3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgZ3JvdXAuY2xhc3NOYW1lID0gJ2phcnZpcy1jb250ZXN0LWNob2ljZSc7XG4gICAgZ3JvdXAuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2dyb3VwJyk7XG4gICAgZ3JvdXAuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgbGFiZWwpO1xuICAgIGdyb3VwLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKSk7XG4gICAgZm9yIChjb25zdCBbdmFsdWUsIHRleHRdIG9mIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgIGJ1dHRvbi5kYXRhc2V0LmNvbnRlc3RDaG9pY2UgPSB2YWx1ZTtcbiAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBzZWxlY3QodmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgZ3JvdXAuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICB9XG4gICAgcmV0dXJuIGdyb3VwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0Q29udGVzdENob2ljZShncm91cDogSFRNTEVsZW1lbnQsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICBmb3IgKGNvbnN0IGJ1dHRvbiBvZiBncm91cC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKSkge1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBTdHJpbmcoYnV0dG9uLmRhdGFzZXQuY29udGVzdENob2ljZSA9PT0gdmFsdWUpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsQ29udGVzdFNldHRpbmdzKCkge1xuICAgIGlmIChjdXJyZW50UGFnZSAhPT0gJy9ob21lLmh0bWwnKSByZXR1cm47XG5cbiAgICBjb25zdCBzZWxlY3RvciA9ICcuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZ1tyZWw9XCJKQVJWSVNfY29udGVzdFN0YXJ0XCJdJztcbiAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKCFjYXJkIHx8IGNhcmQucXVlcnlTZWxlY3RvcignLmphcnZpcy1jb250ZXN0LXNldHRpbmdzJykpIHJldHVybjtcblxuICAgICAgICBjb25zdCBmaWVsZHNldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkc2V0Jyk7XG4gICAgICAgIGZpZWxkc2V0LmNsYXNzTmFtZSA9ICdqYXJ2aXMtY29udGVzdC1zZXR0aW5ncyc7XG4gICAgICAgIGZpZWxkc2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdDb250ZXN0IHN0YXJ0dXAgZGVmYXVsdHMnKTtcbiAgICAgICAgY29uc3Qgc2F2ZSA9IChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZywgZ3JvdXA6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxzU2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2UoZ3JvdXAsIHZhbHVlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBzYXZlIHRoZSBjb250ZXN0IGRlZmF1bHQ6JywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qga2luZHMgPSBtYWtlQ2hvaWNlKCdQcmVmZXJyZWQgY29udGVzdCcsIENPTlRFU1RfS0lORFMsIHZhbHVlID0+IHNhdmUoJ0NvbnRlc3RLaW5kJywgdmFsdWUsIGtpbmRzKSk7XG4gICAgICAgIGNvbnN0IHJhbmtzID0gbWFrZVJhbmtDaG9pY2UoJ0RlZmF1bHQgbGVhZGVyYm9hcmQgcG9zaXRpb24nLCB2YWx1ZSA9PiBzYXZlKCdDb250ZXN0UmFua1N0YXJ0JywgdmFsdWUsIHJhbmtzKSk7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRzID0gcmVhZENvbnRlc3REZWZhdWx0cygpO1xuICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGtpbmRzLCBkZWZhdWx0cy5raW5kKTtcbiAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShyYW5rcywgZGVmYXVsdHMucmFuayk7XG5cbiAgICAgICAgY29uc3Qga2luZExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGtpbmRMYWJlbC5pbm5lckhUTUwgPSBzZXR0aW5nSGVscCgnUHJlZmVycmVkIGNvbnRlc3QnLCAnRGFpbHkgb3BlbnMgdGhlIGZpcnN0IGFjdGl2ZSBkYWlseSBjb250ZXN0LiBFdmVudCBvcGVucyB0aGUgbGFzdCBhY3RpdmUgZXZlbnQgY29udGVzdCwgb3IgdGhlIGRhaWx5IGNvbnRlc3QgaWYgdGhlcmUgaXMgbm8gZXZlbnQuJyk7XG4gICAgICAgIGNvbnN0IHJhbmtMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICByYW5rTGFiZWwuaW5uZXJIVE1MID0gc2V0dGluZ0hlbHAoJ0xlYWRlcmJvYXJkIHN0YXJ0JywgJ09wZW4gYXQgdGhlIHRvcCBvciBhdCB5b3VyIHJhbmsuIEEgc3RhcnJlZCBjb250ZXN0IGNhbiBoYXZlIGl0cyBvd24gcG9zaXRpb24uJyk7XG4gICAgICAgIGZpZWxkc2V0LmFwcGVuZChraW5kTGFiZWwsIGtpbmRzLCByYW5rTGFiZWwsIHJhbmtzKTtcbiAgICAgICAgY29uc3QgcmVmcmVzaEVuYWJsZWQgPSAoKSA9PiBmaWVsZHNldC5kaXNhYmxlZCA9ICFjYXJkLmNsYXNzTGlzdC5jb250YWlucygnZW5hYmxlZCcpO1xuICAgICAgICByZWZyZXNoRW5hYmxlZCgpO1xuICAgICAgICBuZXcgTXV0YXRpb25PYnNlcnZlcihyZWZyZXNoRW5hYmxlZCkub2JzZXJ2ZShjYXJkLCB7IGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcyddIH0pO1xuICAgICAgICBjYXJkLmFwcGVuZENoaWxkKGZpZWxkc2V0KTtcbiAgICB9KTtcbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7ICQsIGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBsc0dldCwgbHNTZXQsIGxzUm0gfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcbmltcG9ydCB7IG1ha2VSYW5rQ2hvaWNlLCByZWFkQ29udGVzdERlZmF1bHRzLCByZWFkQ29udGVzdFNldHRpbmcsIHJlYWRQaW5uZWRSYW5rLCBzZWxlY3RDb250ZXN0Q2hvaWNlLCB0eXBlIENvbnRlc3RLaW5kIH0gZnJvbSAnLi9jb250ZXN0UHJlZmVyZW5jZXMnO1xuXG5pbnRlcmZhY2UgQ29udGVzdENhcmQge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY2FyZDogSFRNTEVsZW1lbnQ7XG4gICAgaGVhZGVyOiBIVE1MRWxlbWVudDtcbiAgICB0aXRsZTogSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGxhYmVsOiBzdHJpbmc7XG4gICAga2luZDogQ29udGVzdEtpbmQgfCBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJtQ29udGVzdFN0YXJ0dXBHdWFyZCgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBpZiAobG9jYXRpb24ucGF0aG5hbWUgIT09ICcvYWN0aXZpdGllcy5odG1sJyB8fCBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KCd0YWInKSAhPT0gJ2NvbnRlc3RzJykgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ0hIUGx1c1BsdXNDb25maWcnKSA/PyAnbnVsbCcpPy5KQVJWSVNfY29udGVzdFN0YXJ0ID09PSBmYWxzZSkgcmV0dXJuO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gS2VlcCBib3RoIHBhbmVzIG91dCBvZiB2aWV3IHVudGlsIHRoZSBjaG9zZW4gY29udGVzdCBhbmQgaXRzIGxlYWRlcmJvYXJkIGFyZSBwb3NpdGlvbmVkLlxuICAgIGNvbnN0IGd1YXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBndWFyZC5pZCA9ICdqYXJ2aXMtY29udGVzdC1zdGFydHVwJztcbiAgICBndWFyZC50ZXh0Q29udGVudCA9IGBcbiAgICAgICAgI2NvbnRlc3RzIC5sZWZ0X3BhcnQgLnNjcm9sbF9hcmVhLFxuICAgICAgICAjY29udGVzdHMgLnJpZ2h0X3BhcnQge1xuICAgICAgICAgICAgb3BhY2l0eTogMCAhaW1wb3J0YW50O1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogbm9uZSAhaW1wb3J0YW50O1xuICAgICAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgICAgIH1cbiAgICBgO1xuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICBpZiAoIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkgcmV0dXJuO1xuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ3VhcmQpO1xuICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgfSk7XG4gICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKGd1YXJkKTtcbiAgICBlbHNlIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQsIHsgY2hpbGRMaXN0OiB0cnVlIH0pO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgZ3VhcmQucmVtb3ZlKCk7XG4gICAgfSwgNDAwMCk7XG59XG5cbmV4cG9ydCBjbGFzcyBDb250ZXN0U3RhcnQgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBwcmVmZXJlbmNlID0gJyc7XG4gICAgcHJpdmF0ZSBzdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgIHByaXZhdGUgZGVmYXVsdHMgPSByZWFkQ29udGVzdERlZmF1bHRzKCk7XG4gICAgcHJpdmF0ZSBsaXN0OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmlnaHQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByZXN0b3JpbmdDYXJkOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmVwb3NpdGlvbjogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdG9wSnVtcDogKChmaW5pc2g/OiBib29sZWFuKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgb2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGxpc3RlbmVyczogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdjb250ZXN0U3RhcnQnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiQ29udGVzdCBzdGFydHVwXCIsIFwiT3BlbiB0aGUgcHJlZmVycmVkIGNvbnRlc3QgYW5kIGxlYWRlcmJvYXJkIHBvc2l0aW9uIG9uIGxvYWQuIEEgc3RhcnJlZCBjb250ZXN0IHRha2VzIHByaW9yaXR5LlwiKVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHsgbmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hIH0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlID09PSAnL2FjdGl2aXRpZXMuaHRtbCc7XG4gICAgfVxuXG4gICAgZ2V0Q29udGVzdHMobGlzdDogSFRNTEVsZW1lbnQsIGZpbmlzaGVkOiBSZWFkb25seVNldDxzdHJpbmc+KTogQ29udGVzdENhcmRbXSB7XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IG5ldyBNYXAoT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmFjdGl2ZSB8fCB7fSlcbiAgICAgICAgICAgIC5maWx0ZXIoY29udGVzdCA9PiBjb250ZXN0Py5pZF9jb250ZXN0ICE9IG51bGwpXG4gICAgICAgICAgICAubWFwKGNvbnRlc3QgPT4gW1N0cmluZyhjb250ZXN0LmlkX2NvbnRlc3QpLCBjb250ZXN0XSkpO1xuXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGxpc3QucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5jb250ZXN0W2lkX2NvbnRlc3RdJykpLmZsYXRNYXAoY2FyZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IGNhcmQuZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG4gICAgICAgICAgICBpZiAoIWlkKSByZXR1cm4gW107XG4gICAgICAgICAgICBjb25zdCBjb250ZXN0ID0gYWN0aXZlLmdldChpZCk7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXIgPSBjYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcuY29udGVzdF9oZWFkZXInKTtcbiAgICAgICAgICAgIGlmICghaGVhZGVyIHx8IGZpbmlzaGVkLmhhcyhpZCkpIHJldHVybiBbXTtcbiAgICAgICAgICAgIGlmICghY29udGVzdCAmJiAhaGVhZGVyLm1hdGNoZXMoJy5pbl9wcm9ncmVzcycpKSByZXR1cm4gW107XG5cbiAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcuY29udGVzdF90aXRsZSwgLmNvbnRlc3RfbmFtZSwgaDMsIGg0LCBoNScpO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHRpdGxlICYmIEFycmF5LmZyb20odGl0bGUuY2hpbGROb2RlcylcbiAgICAgICAgICAgICAgICAuZmlsdGVyKG5vZGUgPT4gIShub2RlIGluc3RhbmNlb2YgRWxlbWVudCkgfHwgIW5vZGUubWF0Y2hlcygnLmphcnZpcy1jb250ZXN0LXBpbiwgLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKSlcbiAgICAgICAgICAgICAgICAubWFwKG5vZGUgPT4gbm9kZS50ZXh0Q29udGVudCkuam9pbignJykudHJpbSgpO1xuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgaWQsIGNhcmQsIGhlYWRlciwgdGl0bGUsXG4gICAgICAgICAgICAgICAga2luZDogY29udGVzdD8uY2F0ZWdvcnlfdHlwZSA/IChjb250ZXN0LmNhdGVnb3J5X3R5cGUgPT09ICdkYWlseScgPyAnZGFpbHknIDogJ2V2ZW50JykgOiBudWxsLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBTdHJpbmcobmFtZSB8fCBjb250ZXN0Py5uYW1lIHx8IGNvbnRlc3Q/LnRpdGxlIHx8XG4gICAgICAgICAgICAgICAgICAgIChjb250ZXN0Py5jYXRlZ29yeV90eXBlID09PSAnZGFpbHknID8gJ0RhaWx5IGNvbnRlc3QnIDogJ0NvbnRlc3QnKSkudHJpbSgpXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0VGFyZ2V0KGNvbnRlc3RzOiBDb250ZXN0Q2FyZFtdKSB7XG4gICAgICAgIGlmICh0aGlzLnByZWZlcmVuY2UpIHJldHVybiBjb250ZXN0cy5maW5kKGNvbnRlc3QgPT4gY29udGVzdC5pZCA9PT0gdGhpcy5wcmVmZXJlbmNlKTtcblxuICAgICAgICBpZiAodGhpcy5kZWZhdWx0cy5raW5kID09PSAnZXZlbnQnKSB7XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IFsuLi5jb250ZXN0c10ucmV2ZXJzZSgpLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmtpbmQgPT09ICdldmVudCcpO1xuICAgICAgICAgICAgaWYgKGV2ZW50KSByZXR1cm4gZXZlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmtpbmQgPT09ICdkYWlseScpID8/XG4gICAgICAgICAgICBjb250ZXN0cy5maW5kKGNvbnRlc3QgPT4gY29udGVzdC5raW5kID09PSBudWxsKSA/PyBjb250ZXN0c1swXTtcbiAgICB9XG5cbiAgICBjbGVhckV4cGlyZWRQaW4obGlzdDogSFRNTEVsZW1lbnQsIGNvbnRlc3RzOiBDb250ZXN0Q2FyZFtdLCBmaW5pc2hlZDogUmVhZG9ubHlTZXQ8c3RyaW5nPikge1xuICAgICAgICBpZiAoIXRoaXMucHJlZmVyZW5jZSB8fCBjb250ZXN0cy5zb21lKCh7IGlkIH0pID0+IGlkID09PSB0aGlzLnByZWZlcmVuY2UpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgYWN0aXZlID0gd2luZG93LmNvbnRlc3RzPy5hY3RpdmU7XG4gICAgICAgIGNvbnN0IG1pc3NpbmcgPSBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnICYmIGxpc3QucXVlcnlTZWxlY3RvcignLmNvbnRlc3RfaGVhZGVyJykgJiZcbiAgICAgICAgICAgIGFjdGl2ZSAmJiAhT2JqZWN0LnZhbHVlcyhhY3RpdmUpLnNvbWUoY29udGVzdCA9PiBTdHJpbmcoY29udGVzdD8uaWRfY29udGVzdCkgPT09IHRoaXMucHJlZmVyZW5jZSk7XG4gICAgICAgIGlmICghZmluaXNoZWQuaGFzKHRoaXMucHJlZmVyZW5jZSkgJiYgIW1pc3NpbmcpIHJldHVybjtcblxuICAgICAgICBjb25zdCBleHBpcmVkSWQgPSB0aGlzLnByZWZlcmVuY2U7XG4gICAgICAgIHRoaXMucHJlZmVyZW5jZSA9ICcnO1xuICAgICAgICB0aGlzLnN0b3BKdW1wPy4oZmFsc2UpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKFN0cmluZyhsc0dldCgnQ29udGVzdFN0YXJ0SWQnKSkgPT09IGV4cGlyZWRJZCkgbHNSbSgnQ29udGVzdFN0YXJ0SWQnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3QgY2xlYXIgdGhlIGV4cGlyZWQgY29udGVzdCBwcmVmZXJlbmNlOicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGVQaW5zKGxpc3Q6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdENhcmRbXSkge1xuICAgICAgICBjb25zdCBob3N0cyA9IG5ldyBTZXQoY29udGVzdHMubWFwKCh7IHRpdGxlLCBoZWFkZXIgfSkgPT4gdGl0bGUgfHwgaGVhZGVyKSk7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbCBvZiBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1waW4sIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JykpIHtcbiAgICAgICAgICAgIGlmICghY29udHJvbC5wYXJlbnRFbGVtZW50IHx8ICFob3N0cy5oYXMoY29udHJvbC5wYXJlbnRFbGVtZW50KSkgY29udHJvbC5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgeyBpZCwgdGl0bGUsIGhlYWRlciwgbGFiZWwgfSBvZiBjb250ZXN0cykge1xuICAgICAgICAgICAgY29uc3QgaG9zdCA9IHRpdGxlIHx8IGhlYWRlcjtcbiAgICAgICAgICAgIGxldCBwaW4gPSBob3N0LnF1ZXJ5U2VsZWN0b3I8SFRNTEJ1dHRvbkVsZW1lbnQ+KCc6c2NvcGUgPiAuamFydmlzLWNvbnRlc3QtcGluJyk7XG4gICAgICAgICAgICBpZiAoIXBpbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY29udGVzdC1waW4nO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlc3RJZCA9IGJ1dHRvbi5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb250ZXN0SWQpIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5wcmVmZXJlbmNlID09PSBjb250ZXN0SWQgPyAnJyA6IGNvbnRlc3RJZDtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0KSBsc1NldCgnQ29udGVzdFN0YXJ0SWQnLCBuZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgbHNSbSgnQ29udGVzdFN0YXJ0SWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJlZmVyZW5jZSA9IG5leHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3BKdW1wPy4oKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB0aGUgY29udGVzdCBwcmVmZXJlbmNlOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcGluID0gaG9zdC5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGlubmVkID0gdGhpcy5wcmVmZXJlbmNlID09PSBpZDtcbiAgICAgICAgICAgIHBpbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIFN0cmluZyhwaW5uZWQpKTtcbiAgICAgICAgICAgIHBpbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBwaW5uZWQgPyBgVW5waW4gJHtsYWJlbH1gIDogYFBpbiAke2xhYmVsfSB0byBvcGVuIG9uIHJlbG9hZGApO1xuICAgICAgICAgICAgcGluLnRpdGxlID0gcGlubmVkID8gJ1Bpbm5lZC4gQ2xpY2sgdG8gdXNlIHlvdXIgY29udGVzdCBkZWZhdWx0cy4nIDogJ09wZW4gdGhpcyBjb250ZXN0IHdoZW4gdGhlIHBhZ2UgcmVsb2Fkcyc7XG5cbiAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IGhvc3QucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJzpzY29wZSA+IC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0Jyk7XG4gICAgICAgICAgICBpZiAoIXBpbm5lZCkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uPy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaG9pY2UgPSBtYWtlUmFua0Nob2ljZSgnUGlubmVkIGxlYWRlcmJvYXJkIHN0YXJ0JywgcmFuayA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsc1NldCgnQ29udGVzdFBpbm5lZFJhbmsnLCB7IGlkLCByYW5rIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShjaG9pY2UsIHJhbmspO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBzYXZlIHRoZSBsZWFkZXJib2FyZCBwb3NpdGlvbjonLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2hvaWNlLmNsYXNzTGlzdC5hZGQoJ2phcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKTtcbiAgICAgICAgICAgICAgICBwaW4uYWZ0ZXIoY2hvaWNlKTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IGNob2ljZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2UocG9zaXRpb24sIHJlYWRQaW5uZWRSYW5rKGlkLCB0aGlzLmRlZmF1bHRzLnJhbmspKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFNlbGVjdGVkQ29udGVzdElkKGxpc3Q6IEhUTUxFbGVtZW50LCByaWdodDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBsaXN0LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZXN0X2hlYWRlcl9hY3RpdmUnKT8uY2xvc2VzdCgnLmNvbnRlc3RbaWRfY29udGVzdF0nKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkKSByZXR1cm4gc2VsZWN0ZWQuZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG5cbiAgICAgICAgY29uc3QgcGFuZWxzID0gQXJyYXkuZnJvbShyaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcucmFua2luZ1tpZF9jb250ZXN0XScpKVxuICAgICAgICAgICAgLmZpbHRlcihwYW5lbCA9PiBwYW5lbC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCAmJiBnZXRDb21wdXRlZFN0eWxlKHBhbmVsKS52aXNpYmlsaXR5ID09PSAndmlzaWJsZScpO1xuICAgICAgICByZXR1cm4gcGFuZWxzLmxlbmd0aCA9PT0gMSA/IHBhbmVsc1swXS5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKSA6IG51bGw7XG4gICAgfVxuXG4gICAgc2hvd0xlYWRlcmJvYXJkKHJpZ2h0OiBIVE1MRWxlbWVudCwgY29udGVzdElkOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgICAgIGlmICghY29udGVzdElkKSB7XG4gICAgICAgICAgICByaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcuamFydmlzLWNvbnRlc3Qtb3RoZXInKS5mb3JFYWNoKHBhbmVsID0+IHBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2phcnZpcy1jb250ZXN0LW90aGVyJykpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgcGFuZWwgb2YgcmlnaHQucXVlcnlTZWxlY3RvckFsbCgnLnJhbmtpbmdbaWRfY29udGVzdF0nKSkge1xuICAgICAgICAgICAgcGFuZWwuY2xhc3NMaXN0LnRvZ2dsZSgnamFydmlzLWNvbnRlc3Qtb3RoZXInLCBwYW5lbC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKSAhPT0gY29udGVzdElkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldE93blJvdyhib2FyZDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3Qgb3duID0gYm9hcmQucXVlcnlTZWxlY3RvcignLmxlYWRUYWJsZSB0ci5sZWFkX3RhYmxlX2RlZmF1bHQnKTtcbiAgICAgICAgaWYgKG93bikgcmV0dXJuIG93bjtcblxuICAgICAgICBjb25zdCBoZXJvSWQgPSAod2luZG93LnNoYXJlZD8uSGVybyB8fCB3aW5kb3cuSGVybyk/LmluZm9zPy5pZDtcbiAgICAgICAgaWYgKGhlcm9JZCA9PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShib2FyZC5xdWVyeVNlbGVjdG9yQWxsKCcubGVhZFRhYmxlIHRyW3NvcnRpbmdfaWRdJykpXG4gICAgICAgICAgICAuZmluZChyb3cgPT4gcm93LmdldEF0dHJpYnV0ZSgnc29ydGluZ19pZCcpID09PSBTdHJpbmcoaGVyb0lkKSk7XG4gICAgfVxuXG4gICAgbG9ja1Njcm9sbChzY3JvbGxlcjogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgJChzY3JvbGxlcikuc3RvcCh0cnVlLCBmYWxzZSk7XG4gICAgICAgIC8vIFRoZSBnYW1lIGNhbiBzdGFydCBhbm90aGVyIGpRdWVyeSB0d2VlbiBhZnRlciBsb2FkLiBCbG9jayBpdHMgd3JpdGVzIG9uIHRoaXMgcGFuZSBvbmx5LlxuICAgICAgICBjb25zdCBpZ25vcmVTY3JvbGwgPSAoKSA9PiB7fTtcbiAgICAgICAgY29uc3QgZ2V0ID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwgJ3Njcm9sbFRvcCcpPy5nZXQ7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3JzID0gT2JqZWN0LmVudHJpZXMoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiB7IGdldCwgc2V0OiBpZ25vcmVTY3JvbGwgfSxcbiAgICAgICAgICAgIHNjcm9sbDogeyB2YWx1ZTogaWdub3JlU2Nyb2xsLCB3cml0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgc2Nyb2xsVG86IHsgdmFsdWU6IGlnbm9yZVNjcm9sbCwgd3JpdGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHNjcm9sbEJ5OiB7IHZhbHVlOiBpZ25vcmVTY3JvbGwsIHdyaXRhYmxlOiB0cnVlIH1cbiAgICAgICAgfSkuZmlsdGVyKChba2V5XSkgPT4gIU9iamVjdC5oYXNPd24oc2Nyb2xsZXIsIGtleSkpO1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGRlc2NyaXB0b3JdIG9mIGRlc2NyaXB0b3JzKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2Nyb2xsZXIsIGtleSwgeyAuLi5kZXNjcmlwdG9yLCBjb25maWd1cmFibGU6IHRydWUgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgJChzY3JvbGxlcikuc3RvcCh0cnVlLCBmYWxzZSk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGRlc2NyaXB0b3JdIG9mIGRlc2NyaXB0b3JzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc2Nyb2xsZXIsIGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgJiYgY3VycmVudC52YWx1ZSA9PT0gZGVzY3JpcHRvci52YWx1ZSAmJiBjdXJyZW50LnNldCA9PT0gZGVzY3JpcHRvci5zZXQpIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoc2Nyb2xsZXIsIGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAganVtcFRvKHNjcm9sbGVyOiBIVE1MRWxlbWVudCwgdGFyZ2V0OiBFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCwgY2VudGVyID0gZmFsc2UpIHtcbiAgICAgICAgbGV0IHRvcCA9IDA7XG4gICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGJvdW5kcyA9IHNjcm9sbGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3Qgc2NhbGUgPSBib3VuZHMuaGVpZ2h0IC8gc2Nyb2xsZXIub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgaWYgKCFzY2FsZSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBpdGVtID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgdG9wID0gc2Nyb2xsZXIuc2Nyb2xsVG9wICsgKGl0ZW0udG9wIC0gYm91bmRzLnRvcCkgLyBzY2FsZSAtIHNjcm9sbGVyLmNsaWVudFRvcDtcbiAgICAgICAgICAgIGlmIChjZW50ZXIpIHRvcCAtPSAoc2Nyb2xsZXIuY2xpZW50SGVpZ2h0IC0gaXRlbS5oZWlnaHQgLyBzY2FsZSkgLyAyO1xuICAgICAgICB9XG4gICAgICAgIHRvcCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHNjcm9sbGVyLnNjcm9sbEhlaWdodCAtIHNjcm9sbGVyLmNsaWVudEhlaWdodCwgdG9wKSk7XG4gICAgICAgIGlmIChNYXRoLmFicyh0b3AgLSBzY3JvbGxlci5zY3JvbGxUb3ApID49IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbFRvID0gRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsVG8gYXMgKG9wdGlvbnM6IFNjcm9sbFRvT3B0aW9ucykgPT4gdm9pZDtcbiAgICAgICAgICAgIHNjcm9sbFRvLmNhbGwoc2Nyb2xsZXIsIHsgdG9wLCBiZWhhdmlvcjogJ2luc3RhbnQnIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb3BlbkNvbnRlc3QobGlzdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudCwgeyBpZCwgY2FyZCwgaGVhZGVyLCB0aXRsZSB9OiBDb250ZXN0Q2FyZCkge1xuICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkgcGFuZS5jbGFzc0xpc3QuYWRkKCdqYXJ2aXMtY29udGVzdC1pbnN0YW50JywgJ2phcnZpcy1jb250ZXN0LWxvYWRpbmcnKTtcbiAgICAgICAgY29uc3QgcmFuayA9IGlkID09PSB0aGlzLnByZWZlcmVuY2UgPyByZWFkUGlubmVkUmFuayhpZCwgdGhpcy5kZWZhdWx0cy5yYW5rKSA6IHRoaXMuZGVmYXVsdHMucmFuaztcbiAgICAgICAgY29uc3QgcGxhY2VBdE93blJhbmsgPSByYW5rID09PSAnbWluZSc7XG4gICAgICAgIGNvbnN0IHJlbGVhc2VMaXN0ID0gdGhpcy5sb2NrU2Nyb2xsKGxpc3QpO1xuICAgICAgICBsZXQgYm9hcmQ6IEhUTUxFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHJlbGVhc2VCb2FyZDogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgICAgICBsZXQgcG9zaXRpb25lZCA9IGZhbHNlO1xuICAgICAgICBsZXQgbGFzdEF0dGVtcHQ6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgY29uc3QgZ2V0Qm9hcmQgPSAoKSA9PiBBcnJheS5mcm9tKHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYW5raW5nW2lkX2NvbnRlc3RdJykpXG4gICAgICAgICAgICAuZmluZChwYW5lbCA9PiBwYW5lbC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKSA9PT0gaWQpPy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmxlYWRfdGFibGVfdmlldycpO1xuICAgICAgICBjb25zdCB1cGRhdGVCb2FyZCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSBnZXRCb2FyZCgpO1xuICAgICAgICAgICAgaWYgKGJvYXJkID09PSBuZXh0KSByZXR1cm47XG4gICAgICAgICAgICByZWxlYXNlQm9hcmQ/LigpO1xuICAgICAgICAgICAgYm9hcmQgPSBuZXh0O1xuICAgICAgICAgICAgcmVsZWFzZUJvYXJkID0gYm9hcmQgPyB0aGlzLmxvY2tTY3JvbGwoYm9hcmQpIDogdW5kZWZpbmVkO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXZlYWwgPSAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkgcGFuZS5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdG9yZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghbGlzdC5pc0Nvbm5lY3RlZCB8fCAhcmlnaHQuaXNDb25uZWN0ZWQgfHwgIWxpc3QuY29udGFpbnMoY2FyZCkpIHJldHVybjtcblxuICAgICAgICAgICAgdXBkYXRlQm9hcmQoKTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCk7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQgIT09IGlkICYmIHNlbGVjdGVkICE9PSBsYXN0QXR0ZW1wdCkge1xuICAgICAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIG51bGwpO1xuICAgICAgICAgICAgICAgICh0aXRsZSB8fCBoZWFkZXIpLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgdXBkYXRlQm9hcmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghYm9hcmQ/LmNsaWVudEhlaWdodCB8fCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSAhPT0gaWQgfHxcbiAgICAgICAgICAgICAgICAocGxhY2VBdE93blJhbmsgJiYgIWJvYXJkLnF1ZXJ5U2VsZWN0b3IoJy5sZWFkVGFibGUnKSkpIHJldHVybjtcbiAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIGlkKTtcbiAgICAgICAgICAgIHRoaXMuanVtcFRvKGxpc3QsIGNhcmQpO1xuICAgICAgICAgICAgdGhpcy5qdW1wVG8oYm9hcmQsIHBsYWNlQXRPd25SYW5rID8gdGhpcy5nZXRPd25Sb3coYm9hcmQpIDogbnVsbCwgcGxhY2VBdE93blJhbmspO1xuICAgICAgICAgICAgaWYgKCFwb3NpdGlvbmVkKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICByZXZlYWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb3JyZWN0IGJyb3dzZXItZHJpdmVuIG1vdmVzLCBzdWNoIGFzIHNjcm9sbEludG9WaWV3IG9uIGEgbGVhZGVyYm9hcmQgcm93LCBiZWZvcmUgcGFpbnQuXG4gICAgICAgIGNvbnN0IG9uU2Nyb2xsID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gbGlzdCB8fCBldmVudC50YXJnZXQgPT09IGJvYXJkKSByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGlucHV0RXZlbnRzID0gWydwb2ludGVyZG93bicsICd0b3VjaHN0YXJ0JywgJ3doZWVsJywgJ2NsaWNrJ107XG4gICAgICAgIGNvbnN0IG9uSW5wdXQgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkKSBzdG9wKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0b3BPbktleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmlzVHJ1c3RlZCAmJiBbJ1RhYicsICdBcnJvd1VwJywgJ0Fycm93RG93bicsICdQYWdlVXAnLCAnUGFnZURvd24nLCAnSG9tZScsICdFbmQnLCAnRW50ZXInLCAnICddLmluY2x1ZGVzKGV2ZW50LmtleSkpIHN0b3AoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgYWZ0ZXJMb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZXN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN0b3AgPSAoZmluaXNoID0gdHJ1ZSkgPT4ge1xuICAgICAgICAgICAgcmVsZWFzZUxpc3QoKTtcbiAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgICAgIHBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25TY3JvbGwsIHRydWUpO1xuICAgICAgICAgICAgICAgIHBhbmUuY2xhc3NMaXN0LnJlbW92ZSgnamFydmlzLWNvbnRlc3QtaW5zdGFudCcsICdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIGlucHV0RXZlbnRzKSBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBvbklucHV0LCB0cnVlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBzdG9wT25LZXksIHRydWUpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBhZnRlckxvYWQpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgIHRoaXMuc3RvcEp1bXAgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZXBvc2l0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucmVzdG9yaW5nQ2FyZCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoZmluaXNoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldmVhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoc3RvcCwgNDAwMCk7XG4gICAgICAgIHRoaXMuc3RvcEp1bXAgPSBzdG9wO1xuICAgICAgICB0aGlzLnJlcG9zaXRpb24gPSByZXN0b3JlO1xuICAgICAgICB0aGlzLnJlc3RvcmluZ0NhcmQgPSBjYXJkO1xuICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgW2xpc3QsIHJpZ2h0XSkge1xuICAgICAgICAgICAgcGFuZS5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCwgeyBwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgaW5wdXRFdmVudHMpIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uSW5wdXQsIHsgcGFzc2l2ZTogdHJ1ZSwgY2FwdHVyZTogdHJ1ZSB9KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHN0b3BPbktleSwgdHJ1ZSk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFmdGVyTG9hZCwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICByZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEnKTtcbiAgICAgICAgY29uc3QgcmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignI2NvbnRlc3RzIC5yaWdodF9wYXJ0Jyk7XG4gICAgICAgIGlmICh0aGlzLnN0b3BKdW1wICYmICh0aGlzLmxpc3QgIT09IGxpc3QgfHwgdGhpcy5yaWdodCAhPT0gcmlnaHQgfHwgIWxpc3Q/LmNvbnRhaW5zKHRoaXMucmVzdG9yaW5nQ2FyZCkpKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BKdW1wKGZhbHNlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0KSB0aGlzLnNob3dMZWFkZXJib2FyZCh0aGlzLnJpZ2h0LCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxpc3QgPSBsaXN0O1xuICAgICAgICB0aGlzLnJpZ2h0ID0gcmlnaHQ7XG4gICAgICAgIGlmICghbGlzdCB8fCAhcmlnaHQgfHwgIWxpc3QuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggfHwgZ2V0Q29tcHV0ZWRTdHlsZShsaXN0KS52aXNpYmlsaXR5ICE9PSAndmlzaWJsZScpIHJldHVybjtcblxuICAgICAgICBjb25zdCBmaW5pc2hlZCA9IG5ldyBTZXQoT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHM/LmZpbmlzaGVkIHx8IHt9KVxuICAgICAgICAgICAgLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbCkubWFwKGNvbnRlc3QgPT4gU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCkpKTtcbiAgICAgICAgZm9yIChjb25zdCBlbmRlZCBvZiBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZXN0LmVuZGVkLCAuY29udGVzdF9oZWFkZXIuZW5kZWQnKSkge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBlbmRlZC5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmIChpZCkgZmluaXNoZWQuYWRkKGlkKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb250ZXN0cyA9IHRoaXMuZ2V0Q29udGVzdHMobGlzdCwgZmluaXNoZWQpO1xuICAgICAgICB0aGlzLmNsZWFyRXhwaXJlZFBpbihsaXN0LCBjb250ZXN0cywgZmluaXNoZWQpO1xuICAgICAgICB0aGlzLnVwZGF0ZVBpbnMobGlzdCwgY29udGVzdHMpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlcG9zaXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMucmVwb3NpdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0YXJ0dXBQZW5kaW5nKSB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmdldFRhcmdldChjb250ZXN0cyk7XG4gICAgICAgICAgICBpZiAodGFyZ2V0KSB0aGlzLm9wZW5Db250ZXN0KGxpc3QsIHJpZ2h0LCB0YXJnZXQpO1xuICAgICAgICAgICAgZWxzZSBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyAmJiAhdGhpcy5wcmVmZXJlbmNlKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgY29uc3QgcGluID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICB0aGlzLnByZWZlcmVuY2UgPSAoKHR5cGVvZiBwaW4gPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBwaW4gPT09ICdudW1iZXInKSAmJiBwaW4pID8gU3RyaW5nKHBpbikgOiAnJztcbiAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuZGVmYXVsdHMgPSByZWFkQ29udGVzdERlZmF1bHRzKCk7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICBjb25zdCB7IHNpZ25hbCB9ID0gdGhpcy5saXN0ZW5lcnM7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihtdXRhdGlvbnMgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZXN0cyAubGVmdF9wYXJ0IC5zY3JvbGxfYXJlYScpO1xuICAgICAgICAgICAgY29uc3QgcmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY29udGVzdHMgLnJpZ2h0X3BhcnQnKTtcbiAgICAgICAgICAgIGlmIChsaXN0ICE9PSB0aGlzLmxpc3QgfHwgcmlnaHQgIT09IHRoaXMucmlnaHQgfHwgbXV0YXRpb25zLnNvbWUoKHsgdGFyZ2V0IH0pID0+XG4gICAgICAgICAgICAgICAgKGxpc3QgJiYgKGxpc3QuY29udGFpbnModGFyZ2V0KSB8fCB0YXJnZXQuY29udGFpbnMobGlzdCkpKSB8fFxuICAgICAgICAgICAgICAgIChyaWdodCAmJiAocmlnaHQuY29udGFpbnModGFyZ2V0KSB8fCB0YXJnZXQuY29udGFpbnMocmlnaHQpKSkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFsnY2xhc3MnLCAnc3R5bGUnLCAnaGlkZGVuJywgJ2lkX2NvbnRlc3QnXSB9KTtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4gdGhpcy5yZWZyZXNoKCksIHsgb25jZTogdHJ1ZSwgc2lnbmFsIH0pO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmlzVHJ1c3RlZCAmJiBldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ICYmIHRoaXMucmlnaHQgJiYgdGhpcy5saXN0Py5jb250YWlucyhldmVudC50YXJnZXQpICYmXG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5jb250ZXN0X2hlYWRlcicpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHRoaXMucmlnaHQsIG51bGwpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB7IGNhcHR1cmU6IHRydWUsIHNpZ25hbCB9KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cblxuICAgIHRlYXJEb3duKCkge1xuICAgICAgICB0aGlzLm9ic2VydmVyPy5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzPy5hYm9ydCgpO1xuICAgICAgICB0aGlzLnN0b3BKdW1wPy4oKTtcbiAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxpc3Q/LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1waW4sIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JykuZm9yRWFjaChjb250cm9sID0+IGNvbnRyb2wucmVtb3ZlKCkpO1xuICAgICAgICBpZiAodGhpcy5yaWdodCkgdGhpcy5zaG93TGVhZGVyYm9hcmQodGhpcy5yaWdodCwgbnVsbCk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLmhhc1J1biA9IGZhbHNlO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBMZWFndWVUb3AyMCBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdsZWFndWVUb3AyMCdcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQcm9tb3Rpb24gdGFyZ2V0XCIsIFwiU2hvdyB0aGUgcG9pbnRzIG5lZWRlZCB0byByZWFjaCB0aGUgbGFyZ2VyIG9mIHRoZSB0b3AgMjAgb3IgdG9wIDE1JSBiZWxvdyB0aGUgaGlnaGVzdCBsZWFndWUgdGllci5cIilcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWVzLmh0bWwnKTtcbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcuc2NyaXB0TGVhZ3VlSW5mbycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2NyaXB0TGVhZ3VlSW5mbycpO1xuICAgICAgICAgICAgaWYgKCFzdW1tYXJ5IHx8IHN1bW1hcnkucXVlcnlTZWxlY3RvcignLmphcnZpc1RvcDIwJykpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgeyBvcHBvbmVudHNfbGlzdCwgY3VycmVudF90aWVyX251bWJlciwgbWF4X2xlYWd1ZSB9ID0gd2luZG93O1xuICAgICAgICAgICAgY29uc3QgdGllciA9IE51bWJlcihjdXJyZW50X3RpZXJfbnVtYmVyKTtcbiAgICAgICAgICAgIGlmICghKHRpZXIgPiAwICYmIHRpZXIgPCBOdW1iZXIobWF4X2xlYWd1ZSkpKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBoZXJvSWQgPSAod2luZG93LnNoYXJlZD8uSGVybyB8fCB3aW5kb3cuSGVybyk/LmluZm9zPy5pZDtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShvcHBvbmVudHNfbGlzdCkgfHwgaGVyb0lkID09IG51bGwpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgcGxheWVyID0gb3Bwb25lbnRzX2xpc3QuZmluZCgoeyBwbGF5ZXIgfSkgPT4gU3RyaW5nKHBsYXllcj8uaWRfZmlnaHRlcikgPT09IFN0cmluZyhoZXJvSWQpKTtcbiAgICAgICAgICAgIGNvbnN0IHJhbmsgPSBOdW1iZXIocGxheWVyPy5wbGFjZSk7XG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc0ludGVnZXIocmFuaykgfHwgcmFuayA8IDEpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgYnJhY2tldFNpemUgPSBvcHBvbmVudHNfbGlzdC5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBwcm9tb3Rpb25SYW5rID0gTWF0aC5tYXgoMjAsIE1hdGguY2VpbChicmFja2V0U2l6ZSAqIDE1IC8gMTAwKSk7XG4gICAgICAgICAgICBjb25zdCBpblByb21vdGlvbiA9IHJhbmsgPD0gcHJvbW90aW9uUmFuaztcbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmlzb25SYW5rID0gaW5Qcm9tb3Rpb24gPyBwcm9tb3Rpb25SYW5rICsgMSA6IHByb21vdGlvblJhbms7XG4gICAgICAgICAgICBjb25zdCBjdXRvZmYgPSBvcHBvbmVudHNfbGlzdC5maW5kKCh7IHBsYWNlIH0pID0+IE51bWJlcihwbGFjZSkgPT09IGNvbXBhcmlzb25SYW5rKTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXI/LnBsYXllcl9sZWFndWVfcG9pbnRzID09IG51bGwgfHwgY3V0b2ZmPy5wbGF5ZXJfbGVhZ3VlX3BvaW50cyA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHNjb3JlID0gTnVtYmVyKHBsYXllci5wbGF5ZXJfbGVhZ3VlX3BvaW50cyk7XG4gICAgICAgICAgICBjb25zdCBjdXRvZmZTY29yZSA9IE51bWJlcihjdXRvZmYucGxheWVyX2xlYWd1ZV9wb2ludHMpO1xuICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoc2NvcmUpIHx8ICFOdW1iZXIuaXNGaW5pdGUoY3V0b2ZmU2NvcmUpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGZvcm1hdCA9IG5ldyBJbnRsLk51bWJlckZvcm1hdCgpO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gaW5Qcm9tb3Rpb24gPyBjdXRvZmZTY29yZSA6IGN1dG9mZlNjb3JlICsgMTtcbiAgICAgICAgICAgIGNvbnN0IGRpZmZlcmVuY2UgPSBpblByb21vdGlvbiA/IHNjb3JlIC0gdGFyZ2V0IDogdGFyZ2V0IC0gc2NvcmU7XG4gICAgICAgICAgICBjb25zdCBydWxlID0gYFRvcCAke3Byb21vdGlvblJhbmt9IGlzIHRoZSBwcm9tb3Rpb24gdGFyZ2V0LiBUaGUgY3V0b2ZmIGlzIHRoZSBsYXJnZXIgb2YgMjAgcGxhY2VzIG9yIDE1JSBvZiAke2Zvcm1hdC5mb3JtYXQoYnJhY2tldFNpemUpfSBwbGF5ZXJzLCByb3VuZGVkIHVwLmA7XG4gICAgICAgICAgICBjb25zdCBjb21wYXJpc29uID0gaW5Qcm9tb3Rpb25cbiAgICAgICAgICAgICAgICA/IGBSYW5rICR7Y29tcGFyaXNvblJhbmt9IGhhcyAke2Zvcm1hdC5mb3JtYXQodGFyZ2V0KX0gcG9pbnRzLiBZb3VyIGxlYWQgaXMgJHtmb3JtYXQuZm9ybWF0KGRpZmZlcmVuY2UpfSBwb2ludHMuYFxuICAgICAgICAgICAgICAgIDogYFlvdSBuZWVkICR7Zm9ybWF0LmZvcm1hdCh0YXJnZXQpfSBwb2ludHMgdG8gcGFzcyByYW5rICR7Y29tcGFyaXNvblJhbmt9LmA7XG4gICAgICAgICAgICBjb25zdCB0b29sdGlwID0gYCR7cnVsZX0gJHtjb21wYXJpc29ufWA7XG5cbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgZW50cnkuY2xhc3NOYW1lID0gJ2phcnZpc1RvcDIwJztcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCB0b29sdGlwKTtcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgndG9vbHRpcCcsICcnKTtcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHRvb2x0aXApO1xuXG4gICAgICAgICAgICBjb25zdCBiYWRnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIGJhZGdlLmNsYXNzTmFtZSA9ICdzY3JpcHRMZWFndWVJbmZvSWNvbic7XG4gICAgICAgICAgICBiYWRnZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIzM3NjliYSc7XG4gICAgICAgICAgICBiYWRnZS5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICAgICAgICAgIGJhZGdlLnRleHRDb250ZW50ID0gU3RyaW5nKHByb21vdGlvblJhbmspO1xuICAgICAgICAgICAgZW50cnkuYXBwZW5kKGJhZGdlLCBgJHtkaWZmZXJlbmNlID09PSAwID8gJycgOiBpblByb21vdGlvbiA/ICctJyA6ICcrJ30ke2Zvcm1hdC5mb3JtYXQoTWF0aC5hYnMoZGlmZmVyZW5jZSkpfWApO1xuICAgICAgICAgICAgc3VtbWFyeS5pbnNlcnRCZWZvcmUoZW50cnksIHN1bW1hcnkucXVlcnlTZWxlY3RvcignLm1pblRvcDMwLCAucHJvbW90aW9uSW5mbycpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBSZW1vdmVQYXNzTG9jayBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNlbGVjdG9yVG9GaW5kID0gJy5sb2NrX3llbGxvd19pY24nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgY2xhc3NUb1JlbW92ZSA9ICdsb2NrX3llbGxvd19pY24nO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAncmVtb3ZlUGFzc0xvY2snXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlBhc3MgbG9jayBpY29uc1wiLCBcIkhpZGUgbG9jayBpY29ucyBvbiByZXdhcmQgcGFzc2VzIHNvIHRoZSByZXdhcmRzIGFyZSBlYXNpZXIgdG8gcmVhZC5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdwb3YnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlBhdGggb2YgVmFsb3JcIiwgXCJIaWRlIGxvY2sgaWNvbnMgb24gdGhlIFBhdGggb2YgVmFsb3IgcGFzc2VzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAncG9nJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQYXRoIG9mIEdsb3J5XCIsIFwiSGlkZSBsb2NrIGljb25zIG9uIHRoZSBQYXRoIG9mIEdsb3J5IHBhc3Nlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLXZhbG9yLmh0bWwnKSB8fCBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtZ2xvcnkuaHRtbCcpXG4gICAgfVxuXG4gICAgb2JzZXJ2ZVVudGlsKHNlbGVjdG9yOiBzdHJpbmcsIGNhbGxiYWNrOiAoZWxlbWVudHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4pID0+IHZvaWQsIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH0gPSB7fSkge1xuICAgICAgICBsZXQgdGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgICAgICBsZXQgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FsbGJhY2soZWxlbWVudHMpO1xuICAgICAgICAgICAgaWYgKG9uY2UpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAob25jZSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lcikgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZWxlbWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuXG4gICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodGltZW91dCkgJiYgdGltZW91dCA+IDApIHtcbiAgICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3Rvcjogc3RyaW5nLCBjbGFzc1RvUmVtb3ZlOiBzdHJpbmcsIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH0gPSB7fSkge1xuICAgICAgICB0aGlzLm9ic2VydmVVbnRpbChzZWxlY3RvciwgKGVsZW1lbnRzKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGVsID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NUb1JlbW92ZSkpO1xuICAgICAgICB9LCB7IHRpbWVvdXQsIG9uY2UgfSk7XG4gICAgfVxuXG4gICAgcnVuKHsgcG92LCBwb2cgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtdmFsb3IuaHRtbCcpICYmIHBvdikge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZSh0aGlzLnNlbGVjdG9yVG9GaW5kLCB0aGlzLmNsYXNzVG9SZW1vdmUpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi1nbG9yeS5odG1sJykgJiYgcG9nKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKHRoaXMuc2VsZWN0b3JUb0ZpbmQsIHRoaXMuY2xhc3NUb1JlbW92ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEdpcmxEaWN0aW9uYXJ5KCkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmdldEdpcmxEaWN0aW9uYXJ5KCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBsb2FkIHRoZSBISCsrIGdpcmwgZGljdGlvbmFyeTonLCBlcnIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGdldEdpcmxEaWN0aW9uYXJ5IH0gZnJvbSAnLi9nYW1lRGF0YSc7XG5cbmV4cG9ydCBjbGFzcyBMb3ZlUmFpZHNBZGRvbiBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJhcml0eUNvbG9yczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xvdmVSYWlkc0FkZG9uJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMb3ZlIFJhaWRzIGRpc3BsYXlcIiwgXCJDdXN0b21pemUgbmFtZXMsIGljb25zLCBhbmQgcG9zZXMgb24gTG92ZSBSYWlkIGNhcmRzLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ3JhaWRfaWQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlJhaWQgSURzXCIsIFwiQWRkIHRoZSByYWlkIElEIGJlZm9yZSBpdHMgbmFtZS5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICduYW1lcycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiSGlkZGVuIGdpcmwgbmFtZXNcIiwgXCJTaG93IHRoZSBuYW1lIG9uIGNhcmRzIHRoYXQgdXNlIGEgbXlzdGVyaW91cyBnaXJsIGxhYmVsLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnc2tpbicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiU2tpbiBpbmRpY2F0b3JcIiwgXCJNYXJrIGNhcmRzIHRoYXQgaW5jbHVkZSBhIGdpcmwgd2l0aCBhIHNraW4uXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdjb2xvcicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUmFyaXR5IGNvbG9yc1wiLCBcIkNvbG9yIHRoZSByYWlkIG5hbWUgYmFzZWQgb24gdGhlIGdpcmzigJlzIHJhcml0eS5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2ZpZ2h0X2ljb24nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkZpZ2h0IGljb25cIiwgXCJVc2UgdGhlIGNsZWFyZXIgZmlnaHQtZW5lcmd5IGljb24uXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdzaGFkb3dzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJVbnNoYWRvd2VkIHBvc2VzXCIsIFwiU2hvdyB0aGUgbm9ybWFsIGFydHdvcmsgaW4gcGxhY2Ugb2Ygc2hhZG93IHBvc2VzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcblxuICAgICAgICB0aGlzLnJhcml0eUNvbG9ycyA9IHtcbiAgICAgICAgICAgIHJhcmU6ICdMaW1lR3JlZW4nLFxuICAgICAgICAgICAgZXBpYzogJ0dvbGQnLFxuICAgICAgICAgICAgbGVnZW5kYXJ5OiAnTWVkaXVtT3JjaGlkJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbG92ZS1yYWlkcy5odG1sJylcbiAgICB9XG5cbiAgICBhc3luYyBydW4oeyByYWlkX2lkLCBza2luLCBuYW1lcywgY29sb3IsIGZpZ2h0X2ljb24sIHNoYWRvd3MgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGNvbnN0IHJhaWRzID0gKHR5cGVvZiBsb3ZlX3JhaWRzICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KGxvdmVfcmFpZHMpKSA/IGxvdmVfcmFpZHMgOiBbXTtcbiAgICAgICAgaWYgKCFyYWlkcy5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG5cbiAgICAgICAgY29uc3QgZ2lybERpY3QgPSBhd2FpdCBnZXRHaXJsRGljdGlvbmFyeSgpO1xuICAgICAgICBjb25zdCByYWlkc0J5SWQgPSBuZXcgTWFwKHJhaWRzLm1hcChyYWlkID0+IFtTdHJpbmcocmFpZC5pZF9yYWlkKSwgcmFpZF0pKTtcblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucmFpZC1jYXJkW2lkX3JhaWRdJykuZm9yRWFjaChyYWlkQ2FyZCA9PiB7XG4gICAgICAgICAgICBjb25zdCByYWlkID0gcmFpZHNCeUlkLmdldChyYWlkQ2FyZC5nZXRBdHRyaWJ1dGUoJ2lkX3JhaWQnKSA/PyAnJyk7XG4gICAgICAgICAgICBpZiAoIXJhaWQgfHwgcmFpZC5pZF9naXJsID09IG51bGwpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgeyBuYW1lLCByYXJpdHksIHNoYXJkcyA9IDAgfSA9IGdpcmxEaWN0Py5nZXQoU3RyaW5nKHJhaWQuaWRfZ2lybCkpIHx8IHt9O1xuICAgICAgICAgICAgY29uc3QgaGFyZW1MaW5rID0gd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5nZXRIcmVmKGAvY2hhcmFjdGVycy8ke3JhaWQuaWRfZ2lybH1gKTtcbiAgICAgICAgICAgIGNvbnN0IHJhaWROYW1lRWxlbSA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3IoJy5yYWlkLW5hbWUgPiBzcGFuID4gc3BhbicpO1xuICAgICAgICAgICAgY29uc3QgbmFtZV9sYWJlbCA9IChuYW1lcyAmJiBuYW1lKSB8fCByYWlkTmFtZUVsZW0/LnRleHRDb250ZW50Py50cmltKCkgfHwgcmFpZC5ldmVudF9uYW1lIHx8IHJhaWQuZ2lybF9kYXRhPy5uYW1lIHx8ICcnO1xuICAgICAgICAgICAgY29uc3QgcmFpZF9pZF9sYWJlbCA9IHJhaWRfaWQgPyBgKCR7cmFpZC5pZF9yYWlkfSlgIDogJyc7XG4gICAgICAgICAgICBjb25zdCBza2luX2xhYmVsID0gKHNraW4gJiYgQXJyYXkuaXNBcnJheShyYWlkPy5naXJsX2RhdGE/LmdyYWRlX3NraW5zKSAmJiByYWlkLmdpcmxfZGF0YS5ncmFkZV9za2lucy5sZW5ndGggPiAwKSA/ICfwn5GZJyA6ICcnO1xuXG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5UGFydHMgPSBbXTtcbiAgICAgICAgICAgIGlmIChyYWlkX2lkKSBkaXNwbGF5UGFydHMucHVzaChyYWlkX2lkX2xhYmVsKTtcbiAgICAgICAgICAgIGRpc3BsYXlQYXJ0cy5wdXNoKG5hbWVfbGFiZWwpO1xuICAgICAgICAgICAgaWYgKHNraW4pIGRpc3BsYXlQYXJ0cy5wdXNoKHNraW5fbGFiZWwpO1xuICAgICAgICAgICAgY29uc3QgZGlzcGxheUxhYmVsID0gZGlzcGxheVBhcnRzLmpvaW4oJyAnKS50cmltKCk7XG5cbiAgICAgICAgICAgIGlmIChyYWlkTmFtZUVsZW0gJiYgZGlzcGxheUxhYmVsKSB7XG4gICAgICAgICAgICAgICAgcmFpZE5hbWVFbGVtLnRleHRDb250ZW50ID0gZGlzcGxheUxhYmVsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBvYmplY3RpdmVzID0gcmFpZENhcmQucXVlcnlTZWxlY3RvckFsbCgnLmNsYXNzaWMtZ2lybCcpO1xuICAgICAgICAgICAgY29uc3QgZ2lybCA9IG9iamVjdGl2ZXNbMF07XG4gICAgICAgICAgICBpZiAoZ2lybCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdpcmxOYW1lRWxlbSA9IGdpcmwucXVlcnlTZWxlY3RvcignLmdpcmwtbmFtZScpO1xuICAgICAgICAgICAgICAgIGlmIChnaXJsTmFtZUVsZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmsgPSBnaXJsTmFtZUVsZW0ucXVlcnlTZWxlY3RvcignYScpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWxpbmspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rLmNsYXNzTmFtZSA9ICdoaC1naXJsLWxpbmsnO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGdpcmxOYW1lRWxlbS5maXJzdENoaWxkKSBsaW5rLmFwcGVuZENoaWxkKGdpcmxOYW1lRWxlbS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdpcmxOYW1lRWxlbS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZGlzcGxheUxhYmVsKSBsaW5rLnRleHRDb250ZW50ID0gZGlzcGxheUxhYmVsO1xuICAgICAgICAgICAgICAgICAgICBsaW5rLmhyZWYgPSBoYXJlbUxpbms7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHNoYXJkcyA9PT0gMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9iakVsZW0gPSBnaXJsLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcub2JqZWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmpFbGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpFbGVtLmlubmVyVGV4dCA9IGBJJ20gYWxyZWFkeSBhdHRyYWN0ZWQgdG8geW91LiBGaW5kIG1lIGluIHlvdXIgSGFyZW0hYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvbG9yICYmIHJhcml0eSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhaWROYW1lQ29udGFpbmVyID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5yYWlkLW5hbWUnKTtcbiAgICAgICAgICAgICAgICBpZiAocmFpZE5hbWVDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFpZE5hbWVDb250YWluZXIuc3R5bGUuY29sb3IgPSB0aGlzLnJhcml0eUNvbG9yc1tyYXJpdHldIHx8ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZpZ2h0X2ljb24pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWdodEljb24gPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmh1ZEJhdHRsZVB0c19taXhfaWNuJyk7XG4gICAgICAgICAgICAgICAgaWYgKGZpZ2h0SWNvbikge1xuICAgICAgICAgICAgICAgICAgICBmaWdodEljb24uc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybCgvaW1hZ2VzL3BpY3R1cmVzL2Rlc2lnbi9pY19lbmVyZ3lfZmlnaHQucG5nKSc7XG4gICAgICAgICAgICAgICAgICAgIGZpZ2h0SWNvbi5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9ICcyNHB4JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzaGFkb3dzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGVmdEltYWdlID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MSW1hZ2VFbGVtZW50PignLmdpcmwtaW1nLmxlZnQnKTtcbiAgICAgICAgICAgICAgICBpZiAobGVmdEltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlZnRJbWFnZS5zcmMgPSBsZWZ0SW1hZ2Uuc3JjLnJlcGxhY2UoJy1ibGFjaycsICcnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJhaWRDYXJkLmNsYXNzTGlzdC5jb250YWlucygnbXVsdGlwbGUtZ2lybCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0SW1hZ2UgPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxJbWFnZUVsZW1lbnQ+KCcuZ2lybC1pbWcucmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJpZ2h0SW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJpZ2h0SW1hZ2Uuc3JjID0gcmlnaHRJbWFnZS5zcmMucmVwbGFjZSgnYXZiMC5wbmcnLCAnZ3JhZGVfc2tpbnMvZ3JhZGVfc2tpbjEucG5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodEltYWdlLnNyYyA9IHJpZ2h0SW1hZ2Uuc3JjLnJlcGxhY2UoJy1ibGFjaycsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yQWxsKCcuZXllJykuZm9yRWFjaChlID0+IGUucmVtb3ZlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHR5cGUgeyBHaXJsRGF0YSwgTG92ZVJhaWQgfSBmcm9tICcuLi8uLi9nYW1lLXR5cGVzJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCwgbHNSbSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgZ2V0R2lybERpY3Rpb25hcnkgfSBmcm9tICcuL2dhbWVEYXRhJztcblxudHlwZSBSYWlkQ29weUJ1dHRvbiA9IEhUTUxEaXZFbGVtZW50ICYgeyBfYm91bmRDb3B5S2V5SGFuZGxlcj86IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gdm9pZCB9O1xuXG5leHBvcnQgY2xhc3MgTG92ZVJhaWRzUGFyc2VyIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgZ2lybERpY3Q6IFJlYWRvbmx5TWFwPHN0cmluZywgR2lybERhdGE+IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBfYm91bmRJbnNlcnRCdXR0b24/OiAoKSA9PiB2b2lkO1xuXG4gICAgLypcbiAgICAqIFJhaWQgSUQsIEFubm91bmNlbWVudCBUeXBlLCBCYWNrZ3JvdW5kIElELCBFdmVudCBOYW1lLCBTdGFydCBEYXRldGltZSxcbiAgICAqIEVuZCBEYXRldGltZSwgRHVyYXRpb24sIFJhaWQgU3RhdHVzLCBTb3VyY2UsIEdpcmwgSUQsXG4gICAgKiBHaXJsIE5hbWUsIFJhcml0eSwgTWF4IEdyYWRlLCBGaXJzdCBBcHBlYXJhbmNlLCBTb3VyY2UgSUQsXG4gICAgKiBIYXMgU2tpbihzKVxuICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnbG92ZVJhaWRzUGFyc2VyJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMb3ZlIFJhaWRzIGV4cG9ydFwiLCBcIkFkZCBhIGJ1dHRvbiB0byBjb3B5IG5ldyByYWlkcyBpbiBhIHNwcmVhZHNoZWV0LXJlYWR5IGZvcm1hdC5cIilcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sb3ZlLXJhaWRzLmh0bWwnKVxuICAgIH1cblxuICAgIGNhcGl0YWxpemVGaXJzdChzdHI6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyID8gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpIDogc3RyO1xuICAgIH1cblxuICAgIGdldEFubm91bmNlbWVudFR5cGUodHlwZTogTG92ZVJhaWRbJ2lkX2Fubm91bmNlbWVudF90eXBlJ10pIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiBcIkZ1bGxcIjtcbiAgICAgICAgICAgIGNhc2UgMjogcmV0dXJuIFwiUGFydGlhbFwiO1xuICAgICAgICAgICAgY2FzZSAzOiByZXR1cm4gXCJOb25lXCI7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gXCJVbmtub3duXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTb3VyY2VJRChldmVudDogTG92ZVJhaWQpIHtcbiAgICAgICAgY29uc3Qgc291cmNlX2lkID0gTnVtYmVyKGV2ZW50LnJhaWRfbW9kdWxlX3BrKTtcbiAgICAgICAgc3dpdGNoIChldmVudC5yYWlkX21vZHVsZV90eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzZWFzb24nOiByZXR1cm4gMDtcbiAgICAgICAgICAgIGNhc2UgJ2NoYW1waW9uJzogcmV0dXJuIE51bWJlci5pc0Zpbml0ZShzb3VyY2VfaWQpID8gc291cmNlX2lkIDogLTI7XG4gICAgICAgICAgICBjYXNlICd0cm9sbCc6IHJldHVybiBOdW1iZXIuaXNGaW5pdGUoc291cmNlX2lkKSA/IHNvdXJjZV9pZCArIDEwIDogLTI7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnaXJsSGFzU2tpbnMoZXZlbnQ6IExvdmVSYWlkKSB7XG4gICAgICAgIGNvbnN0IGhhc1NraW5zID0gQXJyYXkuaXNBcnJheShldmVudD8uZ2lybF9kYXRhPy5ncmFkZV9za2lucykgJiYgZXZlbnQuZ2lybF9kYXRhLmdyYWRlX3NraW5zLmxlbmd0aCA+IDA7XG4gICAgICAgIGlmIChoYXNTa2lucykge1xuICAgICAgICAgICAgcmV0dXJuIFwiWFwiO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIFwiT1wiO1xuICAgIH1cblxuICAgIGZvcm1hdEV2ZW50Um93KGV2ZW50OiBMb3ZlUmFpZCkge1xuICAgICAgICBjb25zdCBkdXJhdGlvbkhvdXJzID0gTWF0aC5mbG9vcihOdW1iZXIoZXZlbnQuZXZlbnRfZHVyYXRpb25fc2Vjb25kcykgLyAzNjAwKTtcbiAgICAgICAgY29uc3QgZHVyYXRpb24gPSBgJHtkdXJhdGlvbkhvdXJzfSBob3Vyc2A7XG5cbiAgICAgICAgY29uc3QgZ2lybCA9IHRoaXMuZ2lybERpY3Q/LmdldChTdHJpbmcoZXZlbnQuaWRfZ2lybCkpIHx8IHt9O1xuICAgICAgICBjb25zdCB7IG5hbWUgPSAnVW5rbm93bicsIHJhcml0eSA9ICdOL0EnLCBncmFkZSA9IDAgfSA9IGdpcmw7XG5cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGV2ZW50LmlkX3JhaWQsXG4gICAgICAgICAgICB0aGlzLmdldEFubm91bmNlbWVudFR5cGUoZXZlbnQuaWRfYW5ub3VuY2VtZW50X3R5cGUpLFxuICAgICAgICAgICAgZXZlbnQuYmFja2dyb3VuZF9pZCxcbiAgICAgICAgICAgIGV2ZW50LmV2ZW50X25hbWUsXG4gICAgICAgICAgICBldmVudC5zdGFydF9kYXRldGltZSxcbiAgICAgICAgICAgIGV2ZW50LmVuZF9kYXRldGltZSxcbiAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgZXZlbnQuc3RhdHVzLFxuICAgICAgICAgICAgZXZlbnQucmFpZF9tb2R1bGVfdHlwZSxcbiAgICAgICAgICAgIGV2ZW50LmlkX2dpcmwsXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgdGhpcy5jYXBpdGFsaXplRmlyc3QocmFyaXR5KSxcbiAgICAgICAgICAgIGdyYWRlLFxuICAgICAgICAgICAgXCJcIiwgLy8gb25lIGJsYW5rIHRhYiByZXNlcnZlZCBmb3IgZmlyc3QgYXBwZWFyYW5jZSBpbiBHU2hlZXRzXG4gICAgICAgICAgICB0aGlzLmdldFNvdXJjZUlEKGV2ZW50KSxcbiAgICAgICAgICAgIHRoaXMuZ2lybEhhc1NraW5zKGV2ZW50KVxuICAgICAgICBdLmpvaW4oXCJcXHRcIik7XG4gICAgfVxuXG4gICAgYXN5bmMgY29weVRvQ2xpcGJvYXJkKHRleHQ6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NsaXBib2FyZCBBUEkgZmFpbGVkLCB1c2luZyBleGVjQ29tbWFuZCBmYWxsYmFjazonLCBlcnIpO1xuICAgICAgICAgICAgY29uc3QgdGV4dGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xuICAgICAgICAgICAgdGV4dGFyZWEudmFsdWUgPSB0ZXh0O1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG4gICAgICAgICAgICB0ZXh0YXJlYS5zZWxlY3QoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRleHRhcmVhLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgaGFuZGxlQ29weUNsaWNrKGV2dDogTW91c2VFdmVudCkge1xuICAgICAgICBjb25zdCBzdG9yYWdlS2V5ID0gJ0xhc3RTYXZlZFJhaWRJRCc7XG5cbiAgICAgICAgLy8gU2hpZnQgKyBDdHJsICsgQ2xpY2sg4oaSIGNsZWFyIHN0b3JlZCBJRFxuICAgICAgICBpZiAoZXZ0LnNoaWZ0S2V5ICYmIGV2dC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBjb25zdCBjb25maXJtQ2xlYXIgPSBjb25maXJtKCfimqDvuI8gRG8geW91IHdhbnQgdG8gY2xlYXIgdGhlIHNhdmVkIGxhc3QgcmFpZCBJRCBmb3IgdGhpcyBzaXRlPycpO1xuICAgICAgICAgICAgaWYgKGNvbmZpcm1DbGVhcikge1xuICAgICAgICAgICAgICAgIGxzUm0oc3RvcmFnZUtleSk7XG4gICAgICAgICAgICAgICAgYWxlcnQoJ+KchSBMYXN0IHNhdmVkIElEIGNsZWFyZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb2FkIHJhaWRzXG4gICAgICAgIGNvbnN0IGxvY2FsTG92ZVJhaWRzID0gKHR5cGVvZiBsb3ZlX3JhaWRzICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KGxvdmVfcmFpZHMpKSA/IGxvdmVfcmFpZHMgOiBbXTtcbiAgICAgICAgaWYgKCFsb2NhbExvdmVSYWlkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfimqDvuI8gTm8gbG92ZV9yYWlkcyBmb3VuZCBvbiB0aGlzIHBhZ2UuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZ2lybERpY3QpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfimqDvuI8gVGhlIEhIKysgZ2lybCBkaWN0aW9uYXJ5IGNvdWxkIG5vdCBiZSBsb2FkZWQuIFJlbG9hZCB0aGUgcGFnZSBhbmQgdHJ5IGFnYWluLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxhc3RTYXZlZElkTnVtYmVyID0gcGFyc2VJbnQoU3RyaW5nKGxzR2V0KHN0b3JhZ2VLZXkpKSwgMTApO1xuXG4gICAgICAgIC8vIElmIFNoaWZ0IGlzIGhlbGQgT1Igbm8gc2F2ZWQgSUQgZXhpc3RzIOKGkiBhc2sgYWdhaW5cbiAgICAgICAgaWYgKGlzTmFOKGxhc3RTYXZlZElkTnVtYmVyKSB8fCBldnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RTYXZlZElkID0gcHJvbXB0KCdQbGVhc2UgZW50ZXIgdGhlIGxhc3Qgc2F2ZWQgSUQ6Jyk7XG4gICAgICAgICAgICBsYXN0U2F2ZWRJZE51bWJlciA9IHBhcnNlSW50KFN0cmluZyhsYXN0U2F2ZWRJZCksIDEwKTtcblxuICAgICAgICAgICAgaWYgKGlzTmFOKGxhc3RTYXZlZElkTnVtYmVyKSkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCfinYwgSW52YWxpZCBJRCBlbnRlcmVkLiBQbGVhc2UgZW50ZXIgYSB2YWxpZCBudW1iZXIuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlsdGVyIG5ldyBldmVudHNcbiAgICAgICAgY29uc3QgZmlsdGVyZWREYXRhID0gbG9jYWxMb3ZlUmFpZHMuZmlsdGVyKGV2ZW50ID0+IE51bWJlcihldmVudC5pZF9yYWlkKSA+IGxhc3RTYXZlZElkTnVtYmVyKTtcbiAgICAgICAgaWYgKCFmaWx0ZXJlZERhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbGVydChg4oS577iPIE5vIG5ldyBldmVudHMgZm91bmQgd2l0aCBJRCBncmVhdGVyIHRoYW4gJHtsYXN0U2F2ZWRJZE51bWJlcn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZERhdGEgPSBmaWx0ZXJlZERhdGEubWFwKHRoaXMuZm9ybWF0RXZlbnRSb3cuYmluZCh0aGlzKSkuam9pbihcIlxcblwiKTtcblxuICAgICAgICBpZiAoIWF3YWl0IHRoaXMuY29weVRvQ2xpcGJvYXJkKGZvcm1hdHRlZERhdGEpKSB7XG4gICAgICAgICAgICBhbGVydCgn4p2MIENvdWxkIG5vdCBjb3B5IHRoZSByYWlkcy4gVGhlIGxhc3Qgc2F2ZWQgSUQgd2FzIGtlcHQuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTYXZlIGhpZ2hlc3QgSURcbiAgICAgICAgY29uc3QgbWF4SWQgPSBNYXRoLm1heCguLi5maWx0ZXJlZERhdGEubWFwKGUgPT4gTnVtYmVyKGUuaWRfcmFpZCkpKTtcbiAgICAgICAgbHNTZXQoc3RvcmFnZUtleSwgbWF4SWQpO1xuXG4gICAgICAgIGFsZXJ0KCfinIUgRGF0YSBjb3BpZWQgdG8gY2xpcGJvYXJkISBZb3UgY2FuIG5vdyBwYXN0ZSBpdCBpbnRvIEdTaGVldHMuJyk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ29weUJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uOiBSYWlkQ29weUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgncmVtaW5kZXItY29weScpO1xuICAgICAgICBidXR0b24uc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxODBkZWcsICMwMGFhZmYgMCwgIzAwNjY4OCA1MCUsICMwMDU1NzcgNTElLCAjMDBhYWZmIDEwMCUpO1xuICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgd2lkdGg6IDMycHg7XG4gICAgICAgICAgICBoZWlnaHQ6IDMycHg7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogMTBweDtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgIHJpZ2h0OiA0LjVyZW07XG4gICAgICAgICAgICB0b3A6IDAuMnJlbTtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMThweDtcbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAzMnB4O1xuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAwLjJzIGVhc2U7XG4gICAgICAgIGA7XG4gICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5OLJztcbiAgICAgICAgbGV0IGJ1dHRvblRpdGxlID0gJ0NsaWNrID0gY29weSBuZXcgcmFpZHMuIFNoaWZ0IC8gU2hpZnQgKyBDdHJsIGF2YWlsYWJsZS4nO1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCd0b29sdGlwJywgJycpO1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcblxuICAgICAgICBjb25zdCBfYm91bmRDb3B5S2V5SGFuZGxlciA9IChlOiBLZXlib2FyZEV2ZW50KSA9PiB0aGlzLnVwZGF0ZUNvcHlCdXR0b24oZSwgYnV0dG9uKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBfYm91bmRDb3B5S2V5SGFuZGxlcik7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIF9ib3VuZENvcHlLZXlIYW5kbGVyKTtcbiAgICAgICAgLy8gc3RvcmUgaGFuZGxlciByZWZlcmVuY2Ugc28gY2FsbGVycyBjYW4gcmVtb3ZlIGxpc3RlbmVycyBpZiBidXR0b24gaXMgcmVtb3ZlZCBsYXRlclxuICAgICAgICBidXR0b24uX2JvdW5kQ29weUtleUhhbmRsZXIgPSBfYm91bmRDb3B5S2V5SGFuZGxlcjtcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoZSkgPT4gdGhpcy5oYW5kbGVDb3B5Q2xpY2soZSk7XG4gICAgICAgIHRoaXMudXBkYXRlQ29weUJ1dHRvbih7IHNoaWZ0S2V5OiBmYWxzZSwgY3RybEtleTogZmFsc2UgfSwgYnV0dG9uKTtcbiAgICAgICAgcmV0dXJuIGJ1dHRvbjtcbiAgICB9XG5cbiAgICB1cGRhdGVDb3B5QnV0dG9uKGU6IFBpY2s8S2V5Ym9hcmRFdmVudCwgJ3NoaWZ0S2V5JyB8ICdjdHJsS2V5Jz4sIGJ1dHRvbjogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgbGV0IGJ1dHRvblRpdGxlID0gJyc7XG4gICAgICAgIGlmIChlLnNoaWZ0S2V5ICYmIGUuY3RybEtleSkge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmZjY2NjYgMCwgI2FhMDAwMCAxMDAlKVwiOyAvLyByZWRcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5eR77iPJztcbiAgICAgICAgICAgIGJ1dHRvblRpdGxlID0gJ1NoaWZ0ICsgQ3RybCArIENsaWNrID0gY2xlYXIgc2F2ZWQgSUQnO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmZmRkNjYgMCwgI2NjOTkwMCAxMDAlKVwiOyAvLyB5ZWxsb3dcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfinI/vuI8nO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnU2hpZnQgKyBDbGljayA9IHByb21wdCBmb3IgSUQuJztcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICMwMGFhZmYgMCwgIzAwNjY4OCA1MCUsICMwMDU1NzcgNTElLCAjMDBhYWZmIDEwMCUpXCI7IC8vIGRlZmF1bHQgYmx1ZVxuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ/Cfk4snO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnQ2xpY2sgPSBjb3B5IG5ldyByYWlkcy4gU2hpZnQgLyBTaGlmdCArIEN0cmwgYXZhaWxhYmxlLic7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluc2VydEJ1dHRvbigpIHtcbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbi1ub3RpZmljYXRpb24tYWN0aW9uLm5vdGlmX2J1dHRvbl9zJyk7XG4gICAgICAgIGlmIChub3RpZmljYXRpb25CdXR0b24gJiYgIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW1pbmRlci1jb3B5JykpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvcHlCdXR0b24gPSB0aGlzLmNyZWF0ZUNvcHlCdXR0b24oKTtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbkJ1dHRvbi5wYXJlbnROb2RlPy5pbnNlcnRCZWZvcmUoY29weUJ1dHRvbiwgbm90aWZpY2F0aW9uQnV0dG9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgICAgICB0aGlzLmdpcmxEaWN0ID0gYXdhaXQgZ2V0R2lybERpY3Rpb25hcnkoKTtcblxuICAgICAgICB0aGlzLl9ib3VuZEluc2VydEJ1dHRvbiA9IHRoaXMuaW5zZXJ0QnV0dG9uLmJpbmQodGhpcyk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB0aGlzLmluc2VydEJ1dHRvbigpO1xuICAgICAgICBlbHNlIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcy5fYm91bmRJbnNlcnRCdXR0b24sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuZXhwb3J0IGNsYXNzIEFjdGl2aXR5UGFyc2VyIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2FjdGl2aXR5UGFyc2VyJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJNaXNzaW9uIGNvcGllclwiLCBcIkVuYWJsZSB0aGUgY29weSB0b29sIGZvciBsZWdlbmRhcnkgbWlzc2lvbiBkZXRhaWxzLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ21pc3Npb25Db3BpZXInLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkxlZ2VuZGFyeSBkZXRhaWxzXCIsIFwiQ2xpY2sgYSBsZWdlbmRhcnkgbWlzc2lvbuKAmXMgdGl0bGUsIGRlc2NyaXB0aW9uLCBvciBpbWFnZSB0byBjb3B5IGl0LlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9hY3Rpdml0aWVzLmh0bWwnKVxuICAgIH1cblxuICAgIGFzeW5jIGNvcHlUb0NsaXBib2FyZCh0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgIGNvbnN0IHRvYXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvYXN0LnRleHRDb250ZW50ID0gJ0NvcGllZCEnO1xuICAgICAgICB0b2FzdC5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmJvdHRvbSA9ICcxMHB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUucmlnaHQgPSAnMTBweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmJhY2tncm91bmQgPSAncmdiYSgwLDAsMCwwLjcpJztcbiAgICAgICAgdG9hc3Quc3R5bGUuY29sb3IgPSAnd2hpdGUnO1xuICAgICAgICB0b2FzdC5zdHlsZS5wYWRkaW5nID0gJzVweCAxMHB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUuYm9yZGVyUmFkaXVzID0gJzVweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnpJbmRleCA9ICc5OTk5JztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0b2FzdCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdG9hc3QucmVtb3ZlKCksIDEwMDApO1xuICAgIH1cblxuICAgIHJ1bih7IG1pc3Npb25Db3BpZXIgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGlmIChtaXNzaW9uQ29waWVyKSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1pc3Npb25fZW50cnkubGVnZW5kYXJ5Jyk7XG4gICAgICAgICAgICBpZiAoIWVudHJpZXMubGVuZ3RoKSByZXR1cm47XG5cbiAgICAgICAgICAgIGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW1nRGl2ID0gZW50cnkucXVlcnlTZWxlY3RvcjxIVE1MSW1hZ2VFbGVtZW50PignLm1pc3Npb25faW1hZ2UgaW1nJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGVBbGwgPSBlbnRyeS5xdWVyeVNlbGVjdG9yPEhUTUxIZWFkaW5nRWxlbWVudD4oJy5taXNzaW9uX2RldGFpbHMgaDEnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkZXNjID0gZW50cnkucXVlcnlTZWxlY3RvcjxIVE1MUGFyYWdyYXBoRWxlbWVudD4oJy5taXNzaW9uX2RldGFpbHMgcCcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGltZ0Rpdikge1xuICAgICAgICAgICAgICAgICAgICBpbWdEaXYuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICBpbWdEaXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZChpbWdEaXYuc3JjKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlQWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlQWxsLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3V0ZXJUaXRsZSA9IHRpdGxlQWxsLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcuZXZlbnQtbWlzc2lvbi1jb250ZW50LXRleHQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dGVyVGl0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyVGl0bGUuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJUaXRsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQoKG91dGVyVGl0bGUudGV4dENvbnRlbnQgPz8gJycpLnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlQWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ICYmIGUudGFyZ2V0LmNsb3Nlc3QoJy5ldmVudC1taXNzaW9uLWNvbnRlbnQtdGV4dCcpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUNsb25lID0gdGl0bGVBbGwuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxIZWFkaW5nRWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlQ2xvbmUucXVlcnlTZWxlY3RvcignLmV2ZW50LW1pc3Npb24tY29udGVudC10ZXh0Jyk/LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSAodGl0bGVDbG9uZS50ZXh0Q29udGVudCA/PyAnJykudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQodGl0bGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICAgICAgICBkZXNjLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgZGVzYy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKGRlc2MuaW5uZXJUZXh0LnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsICJbe1widmVyc2lvblwiOlwiMC43LjBcIixcImNoYW5nZXNcIjpbXCJTZWUgd2hhdCBjaGFuZ2VkIGluIEphcnZpcyB0aGUgZmlyc3QgdGltZSBhIG5ldyB2ZXJzaW9uIHJ1bnMuXCIsXCJPcGVuIFZpZXcgY2hhbmdlbG9nIGZyb20gSEgrKyBzZXR0aW5ncyBhdCBhbnkgdGltZSwgZXZlbiB3aXRoIGF1dG9tYXRpYyBub3RpY2VzIHR1cm5lZCBvZmYuXCIsXCJFeHBhbmQgRWFybGllciB2ZXJzaW9ucyB0byByZWFkIHBhc3QgdXBkYXRlcy5cIl19LHtcInZlcnNpb25cIjpcIjAuNi43XCIsXCJjaGFuZ2VzXCI6W1wiTWFrZSBtYXJraW5nIG9uZSBhY3Rpb24gcGVyIHBsYXllciwgYmFja2ZpbGwgbmFtZXMgZm9yIG9sZGVyIG1hcmtzLCB1c2UgdGhlIGJyYWNrZXQtYmFzZWQgcHJvbW90aW9uIHRhcmdldCwgYW5kIHNpbXBsaWZ5IHRoZSBzZWxlY3RlZCBjb250ZXN0IGJ1dHRvbnMgYW5kIHZlcnNpb24gYmFkZ2UuXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuNlwiLFwiY2hhbmdlc1wiOltcIk5hbWUgdGhlIHRlc3RpbmcgaW5zdGFsbCBEZXYsIG1vdmUgSEgrKyB2ZXJzaW9uIGFuZCBzZXR0aW5nIGRldGFpbHMgdG8gdG9vbHRpcHMsIGltcHJvdmUgbWFyayBjb250cmFzdCBhbmQgbWFuYWdlbWVudCwgYW5kIGFkZCBhdXRvbWF0aWMgY29udGVzdCBkZWZhdWx0cy5cIl19LHtcInZlcnNpb25cIjpcIjAuNi41XCIsXCJjaGFuZ2VzXCI6W1wiTW92ZSB0aGUgdXNlcnNjcmlwdCBzb3VyY2UgaW50byBUeXBlU2NyaXB0IG1vZHVsZXMgYW5kIGFkZCBzZXBhcmF0ZSBzdGFibGUgYW5kIHRlc3RpbmcgYnVpbGRzLlwiXX0se1widmVyc2lvblwiOlwiMC42LjRcIixcImNoYW5nZXNcIjpbXCJQcmV2ZW50IHBpbm5lZCBjb250ZXN0IHN0YXJ0dXAgc2Nyb2xsaW5nLCBrZWVwIG5hdGl2ZSBzdGFydHVwIHdpdGhvdXQgYSBwaW4sIGFuZCBjbGVhciBmaW5pc2hlZCBwaW5zXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuM1wiLFwiY2hhbmdlc1wiOltcIlN0b3AgYm90aCBjb250ZXN0IHN0YXJ0dXAgc2Nyb2xscywgaXNvbGF0ZSB0aGUgc2VsZWN0ZWQgbGVhZGVyYm9hcmQsIGFuZCByZXN0b3JlIHBpbm5lZCBjb250ZXN0cyBhdCBUb3Agb3IgTXkgcmFua1wiXX0se1widmVyc2lvblwiOlwiMC42LjJcIixcImNoYW5nZXNcIjpbXCJQaW4gY29udGVzdHMgb24gdGhlaXIgY2FyZHMsIGhpZGUgdGhlIHN0YXJ0dXAgc2Nyb2xsLCBhbmQgdXNlIHJpZ2h0LWNsaWNrIG1hcmtpbmcgd2l0aCBpc29sYXRlZCBzZXR0aW5ncyBzY3JvbGxpbmdcIl19LHtcInZlcnNpb25cIjpcIjAuNi4xXCIsXCJjaGFuZ2VzXCI6W1wiUmVhZCBuYXRpdmUgTWFuZ2EgUlBHIGNvbnRlc3QgdGl0bGVzIGFuZCByZWNvZ25pemUgYWN0aXZlIGNhcmRzIHdoZW4gY29udGVzdCBkYXRhIGlzIHVuYXZhaWxhYmxlXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjYuMFwiLFwiY2hhbmdlc1wiOltcIkFkZCBhIGNvbnRlc3Qgc3RhcnQgcHJlZmVyZW5jZSwgY29udGludW91cyBtYXJraW5nLCBhbmQgY29tcGFjdCBzZXR0aW5ncyB3aXRoIGEgdmVyc2lvbiBsYWJlbFwiXX0se1widmVyc2lvblwiOlwiMC41LjBcIixcImNoYW5nZXNcIjpbXCJBZGQgbGVhZ3VlIGFuZCBjb250ZXN0IHBsYXllciBtYXJraW5nIHdpdGggY3VzdG9tIGNvbG9ycywgY29tcGFjdCBzZXR0aW5ncywgYW5kIGxpbWl0IFRvcCAyMCB0byBwcm9tb3RhYmxlIGxlYWd1ZXNcIl19LHtcInZlcnNpb25cIjpcIjAuNC4yXCIsXCJjaGFuZ2VzXCI6W1wiRml4IG1vZHVsZSBzdGFydHVwLCBsZWFndWUgY29udHJvbHMsIGFuZCByYWlkIGV4cG9ydHM7IGFkZCB0aGUgVG9wIDIwIGxlYWd1ZSB0YXJnZXRcIl19LHtcInZlcnNpb25cIjpcIjAuNC4xXCIsXCJjaGFuZ2VzXCI6W1wiRml4IExvdmUgUmFpZHMgc2hhZG93cyByZXBsYWNlbWVudFwiXX0se1widmVyc2lvblwiOlwiMC40LjBcIixcImNoYW5nZXNcIjpbXCJBZGQgQWN0aXZpdHlQYXJzZXIgbW9kdWxlXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjMuMVwiLFwiY2hhbmdlc1wiOltcIkFkZCBoYXJlbSBsaW5rIGluc2lkZSBsb3ZlIHJhaWQgY2FyZHNcIl19LHtcInZlcnNpb25cIjpcIjAuMy4wXCIsXCJjaGFuZ2VzXCI6W1wiQWRkIExvdmVSYWlkc0FkZG9uIGFuZCBMb3ZlUmFpZHNQYXJzZXIgbW9kdWxlc1wiXX0se1widmVyc2lvblwiOlwiMC4yLjBcIixcImNoYW5nZXNcIjpbXCJBZGQgUmVtb3ZlUGFzc0xvY2sgbW9kdWxlXCJdfSx7XCJ2ZXJzaW9uXCI6XCIwLjEuM1wiLFwiY2hhbmdlc1wiOltcIkJldHRlciBjb2RlIHByYWN0aWNlc1wiXX0se1widmVyc2lvblwiOlwiMC4xLjJcIixcImNoYW5nZXNcIjpbXCJQb2xpc2hpbmcgYW5kIHVwZGF0ZSBsaW5rc1wiXX0se1widmVyc2lvblwiOlwiMC4xLjFcIixcImNoYW5nZXNcIjpbXCJBZGQgRnJpZW5kQW5kRm9lcyBtb2R1bGVcIl19LHtcInZlcnNpb25cIjpcIjAuMC4xXCIsXCJjaGFuZ2VzXCI6W1wiSW5pdGlhbCByZWxlYXNlXCJdfV0iLCAiaW1wb3J0IHsgJCB9IGZyb20gJy4uLy4uL2dhbWUnO1xuXG5pbnRlcmZhY2UgQ2hhbmdlbG9nVmlldyB7XG4gICAgY29udGVudDogSFRNTEVsZW1lbnQ7XG4gICAgY2xvc2VCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xuICAgIHNob3VsZE9wZW46ICgpID0+IGJvb2xlYW47XG4gICAgb25PcGVuOiAoKSA9PiB2b2lkO1xuICAgIG9uQ2xvc2U6ICgpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93Q2hhbmdlbG9nUG9wdXAodmlldzogQ2hhbmdlbG9nVmlldykge1xuICAgIGNvbnN0IHF1ZXVlID0gd2luZG93LnNoYXJlZD8uUG9wdXBRdWV1ZU1hbmFnZXI7XG4gICAgY29uc3QgaG9zdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb21tb24tcG9wdXBzJyk7XG4gICAgaWYgKGhvc3QgJiYgdHlwZW9mIHF1ZXVlPy5hZGQgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHF1ZXVlLmNsb3NlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgd3JhcHBlci5jbGFzc05hbWUgPSAncG9wdXBfd3JhcHBlciBqYXJ2aXMtY2hhbmdlbG9nLW5hdGl2ZSc7XG4gICAgICAgIGNvbnN0IGJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJhY2tkcm9wLmNsYXNzTmFtZSA9ICdwb3B1cF9iYWNrZ3JvdW5kIGNsaWNrYWJsZSc7XG4gICAgICAgIGNvbnN0IHBhbmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHBhbmVsLmNsYXNzTmFtZSA9ICdwb3B1cCBqYXJ2aXMtY2hhbmdlbG9nLXBvcHVwJztcbiAgICAgICAgcGFuZWwuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2RpYWxvZycpO1xuICAgICAgICBwYW5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbW9kYWwnLCAndHJ1ZScpO1xuICAgICAgICBwYW5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsICdqYXJ2aXMtY2hhbmdlbG9nLXRpdGxlJyk7XG4gICAgICAgIHBhbmVsLmFwcGVuZENoaWxkKHZpZXcuY29udGVudCk7XG4gICAgICAgIHdyYXBwZXIuYXBwZW5kKGJhY2tkcm9wLCBwYW5lbCk7XG5cbiAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IGRpc21pc3MgPSAoKSA9PiBxdWV1ZS5jbG9zZSh7IHR5cGU6ICdjb21tb24nIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcXVldWUuYWRkKHsgcG9wdXA6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnY29tbW9uJyxcbiAgICAgICAgICAgICAgICBwb3B1cF9uYW1lOiAnamFydmlzX2NoYW5nZWxvZycsXG4gICAgICAgICAgICAgICAgY2xvc2Vfb25fZXNjOiB0cnVlLFxuICAgICAgICAgICAgICAgICRkb21fZWxlbWVudDogJCh3cmFwcGVyKSxcbiAgICAgICAgICAgICAgICBpbml0OiAoKSA9PiBob3N0LmFwcGVuZENoaWxkKHdyYXBwZXIpLFxuICAgICAgICAgICAgICAgIG9uT3BlbjogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXZpZXcuc2hvdWxkT3BlbigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZU1pY3JvdGFzayhkaXNtaXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIXdyYXBwZXIuaXNDb25uZWN0ZWQpIGhvc3QuYXBwZW5kQ2hpbGQod3JhcHBlcik7XG4gICAgICAgICAgICAgICAgICAgIHZpZXcub25PcGVuKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB2aWV3LmNsb3NlQnV0dG9uLmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhZGRFdmVudExpc3RlbmVyczogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRhcmdldCBvZiBbYmFja2Ryb3AsIHZpZXcuY2xvc2VCdXR0b25dKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkaXNtaXNzLCB7IHNpZ25hbDogaGFuZGxlcnMuc2lnbmFsIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbkNsb3NlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHZpZXcub25DbG9zZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6ICgpID0+IGhhbmRsZXJzLmFib3J0KCksXG4gICAgICAgICAgICAgICAgZGVzdHJveTogZGlzbWlzc1xuICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBoYW5kbGVycy5hYm9ydCgpO1xuICAgICAgICAgICAgd3JhcHBlci5yZW1vdmUoKTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCB1c2UgdGhlIGdhbWUgcG9wdXAgcXVldWU6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdmlldy5zaG91bGRPcGVuKCkpIHtcbiAgICAgICAgdmlldy5vbkNsb3NlKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGlhbG9nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGlhbG9nJyk7XG4gICAgZGlhbG9nLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY2hhbmdlbG9nLXBvcHVwJztcbiAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsbGVkYnknLCAnamFydmlzLWNoYW5nZWxvZy10aXRsZScpO1xuICAgIGRpYWxvZy5hcHBlbmRDaGlsZCh2aWV3LmNvbnRlbnQpO1xuICAgIHZpZXcuY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBkaWFsb2cuY2xvc2UoKSk7XG4gICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICBkaWFsb2cucmVtb3ZlKCk7XG4gICAgICAgIHZpZXcub25DbG9zZSgpO1xuICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgIHZpZXcuY2xvc2VCdXR0b24uZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xuICAgIHZpZXcub25PcGVuKCk7XG59XG4iLCAiaW1wb3J0IHJlbGVhc2VOb3RlcyBmcm9tICcuLi8uLi8uLi9DSEFOR0VMT0cubWQnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgbHNHZXQsIGxzU2V0IH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5pbXBvcnQgeyBzaG93Q2hhbmdlbG9nUG9wdXAgfSBmcm9tICcuL2NoYW5nZWxvZ1BvcHVwJztcblxuY29uc3Qgc2VlbktleSA9IGBDaGFuZ2Vsb2dTZWVuJHtVU0VSU0NSSVBUX0NIQU5ORUx9YDtcblxuZnVuY3Rpb24gcmVhZFNlZW5WZXJzaW9uKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNlZW4gPSBsc0dldChzZWVuS2V5KTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBzZWVuID09PSAnc3RyaW5nJyAmJiAvXlxcZCtcXC5cXGQrXFwuXFxkKyQvLnRlc3Qoc2VlbikgPyBzZWVuIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc05ld2VyKHZlcnNpb246IHN0cmluZywgcHJldmlvdXM6IHN0cmluZyB8IG51bGwpIHtcbiAgICBpZiAoIXByZXZpb3VzKSByZXR1cm4gdHJ1ZTtcblxuICAgIGNvbnN0IG9sZFBhcnRzID0gcHJldmlvdXMuc3BsaXQoJy4nKS5tYXAoTnVtYmVyKTtcbiAgICBjb25zdCBuZXdQYXJ0cyA9IHZlcnNpb24uc3BsaXQoJy4nKS5tYXAoTnVtYmVyKTtcbiAgICBmb3IgKGNvbnN0IFtpbmRleCwgcGFydF0gb2YgbmV3UGFydHMuZW50cmllcygpKSB7XG4gICAgICAgIGlmIChwYXJ0ICE9PSBvbGRQYXJ0c1tpbmRleF0pIHJldHVybiBwYXJ0ID4gb2xkUGFydHNbaW5kZXhdO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHJlbGVhc2VTZWN0aW9uKHJlbGVhc2U6IHR5cGVvZiByZWxlYXNlTm90ZXNbbnVtYmVyXSkge1xuICAgIGNvbnN0IHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgY29uc3QgaGVhZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgaGVhZGluZy50ZXh0Q29udGVudCA9IGB2JHtyZWxlYXNlLnZlcnNpb259YDtcbiAgICBjb25zdCBjaGFuZ2VzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiByZWxlYXNlLmNoYW5nZXMpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgIGl0ZW0udGV4dENvbnRlbnQgPSBjaGFuZ2U7XG4gICAgICAgIGNoYW5nZXMuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gICAgfVxuICAgIHNlY3Rpb24uYXBwZW5kKGhlYWRpbmcsIGNoYW5nZXMpO1xuICAgIHJldHVybiBzZWN0aW9uO1xufVxuXG5leHBvcnQgY2xhc3MgQ2hhbmdlbG9nIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgcGVuZGluZzogJ2F1dG9tYXRpYycgfCAnbWFudWFsJyB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgb3BlbmVyOiBIVE1MQnV0dG9uRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgdmlld2VkVGhpc1BhZ2UgPSBmYWxzZTtcbiAgICBwcml2YXRlIGxvYWRMaXN0ZW5lcjogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdjaGFuZ2Vsb2cnO1xuICAgICAgICBzdXBlcih7IG5hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYToge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscCgnVXBkYXRlIG5vdGljZXMnLCAnU2hvdyB0aGUgY2hhbmdlbG9nIG9uY2UgYWZ0ZXIgYW4gdXBkYXRlLiBVc2UgVmlldyBjaGFuZ2Vsb2cgdG8gb3BlbiBpdCB3aGVuZXZlciB5b3UgbGlrZS4nKSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgfSB9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGluc3RhbGxTZXR0aW5ncygpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRQYWdlICE9PSAnL2hvbWUuaHRtbCcpIHJldHVybjtcblxuICAgICAgICBjb25zdCBzZWxlY3RvciA9ICcuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZ1tyZWw9XCJKQVJWSVNfY2hhbmdlbG9nXCJdJztcbiAgICAgICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKCFjYXJkIHx8IGNhcmQucXVlcnlTZWxlY3RvcignLmphcnZpcy12aWV3LWNoYW5nZWxvZycpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uIGphcnZpcy12aWV3LWNoYW5nZWxvZyc7XG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAnVmlldyBjaGFuZ2Vsb2cnO1xuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5vcGVuKCdtYW51YWwnLCBidXR0b24pKTtcbiAgICAgICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4pIHJldHVybjtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IGNoZWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzUnVuICYmICF0aGlzLnZpZXdlZFRoaXNQYWdlICYmIGlzTmV3ZXIoVVNFUlNDUklQVF9WRVJTSU9OLCByZWFkU2VlblZlcnNpb24oKSkpIHRoaXMub3BlbignYXV0b21hdGljJyk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSBjaGVjaygpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9hZExpc3RlbmVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBjaGVjaywgeyBvbmNlOiB0cnVlLCBzaWduYWw6IHRoaXMubG9hZExpc3RlbmVyLnNpZ25hbCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRlYXJEb3duKCkge1xuICAgICAgICB0aGlzLmxvYWRMaXN0ZW5lcj8uYWJvcnQoKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9wZW4obW9kZTogJ2F1dG9tYXRpYycgfCAnbWFudWFsJywgb3BlbmVyOiBIVE1MQnV0dG9uRWxlbWVudCB8IG51bGwgPSBudWxsKSB7XG4gICAgICAgIGlmIChtb2RlID09PSAnbWFudWFsJykgdGhpcy5vcGVuZXIgPSBvcGVuZXI7XG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmcpIHtcbiAgICAgICAgICAgIGlmIChtb2RlID09PSAnbWFudWFsJykgdGhpcy5wZW5kaW5nID0gbW9kZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBlbmRpbmcgPSBtb2RlO1xuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzID0gcmVhZFNlZW5WZXJzaW9uKCk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGVudC5jbGFzc05hbWUgPSAnY29udGFpbmVyLXNwZWNpYWwtYmcgamFydmlzLWNoYW5nZWxvZy1jb250ZW50JztcbiAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgICAgICB0aXRsZS5pZCA9ICdqYXJ2aXMtY2hhbmdlbG9nLXRpdGxlJztcbiAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSAnSmFydmlzIGNoYW5nZWxvZyc7XG4gICAgICAgIGNvbnN0IG5vdGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG5vdGVzLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY2hhbmdlbG9nLW5vdGVzJztcbiAgICAgICAgY29uc3QgbmV3UmVsZWFzZXMgPSBwcmV2aW91cyAmJiBpc05ld2VyKFVTRVJTQ1JJUFRfVkVSU0lPTiwgcHJldmlvdXMpXG4gICAgICAgICAgICA/IHJlbGVhc2VOb3Rlcy5maWx0ZXIocmVsZWFzZSA9PiBpc05ld2VyKHJlbGVhc2UudmVyc2lvbiwgcHJldmlvdXMpKS5sZW5ndGhcbiAgICAgICAgICAgIDogMTtcbiAgICAgICAgbm90ZXMuYXBwZW5kKC4uLnJlbGVhc2VOb3Rlcy5zbGljZSgwLCBuZXdSZWxlYXNlcykubWFwKHJlbGVhc2VTZWN0aW9uKSk7XG4gICAgICAgIGNvbnN0IGVhcmxpZXIgPSByZWxlYXNlTm90ZXMuc2xpY2UobmV3UmVsZWFzZXMpO1xuICAgICAgICBpZiAoZWFybGllci5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IGhpc3RvcnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkZXRhaWxzJyk7XG4gICAgICAgICAgICBjb25zdCBzdW1tYXJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3VtbWFyeScpO1xuICAgICAgICAgICAgc3VtbWFyeS50ZXh0Q29udGVudCA9ICdFYXJsaWVyIHZlcnNpb25zJztcbiAgICAgICAgICAgIGhpc3RvcnkuYXBwZW5kKHN1bW1hcnksIC4uLmVhcmxpZXIubWFwKHJlbGVhc2VTZWN0aW9uKSk7XG4gICAgICAgICAgICBub3Rlcy5hcHBlbmRDaGlsZChoaXN0b3J5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZvb3RlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvb3RlcicpO1xuICAgICAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBjbG9zZUJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGNsb3NlQnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgICAgICBjbG9zZUJ1dHRvbi50ZXh0Q29udGVudCA9ICdDbG9zZSc7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChjbG9zZUJ1dHRvbik7XG4gICAgICAgIGNvbnRlbnQuYXBwZW5kKHRpdGxlLCBub3RlcywgZm9vdGVyKTtcblxuICAgICAgICBzaG93Q2hhbmdlbG9nUG9wdXAoe1xuICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgIGNsb3NlQnV0dG9uLFxuICAgICAgICAgICAgc2hvdWxkT3BlbjogKCkgPT4gdGhpcy5wZW5kaW5nID09PSAnbWFudWFsJyB8fFxuICAgICAgICAgICAgICAgICh0aGlzLmhhc1J1biAmJiAhdGhpcy52aWV3ZWRUaGlzUGFnZSAmJiBpc05ld2VyKFVTRVJTQ1JJUFRfVkVSU0lPTiwgcmVhZFNlZW5WZXJzaW9uKCkpKSxcbiAgICAgICAgICAgIG9uT3BlbjogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudmlld2VkVGhpc1BhZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc05ld2VyKFVTRVJTQ1JJUFRfVkVSU0lPTiwgcmVhZFNlZW5WZXJzaW9uKCkpKSBsc1NldChzZWVuS2V5LCBVU0VSU0NSSVBUX1ZFUlNJT04pO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB0aGUgdmlld2VkIGNoYW5nZWxvZyB2ZXJzaW9uOicsIGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ2xvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBlbmRpbmcgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMub3BlbmVyPy5mb2N1cyh7IHByZXZlbnRTY3JvbGw6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuZXIgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgaW5pdEdhbWUgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgaW5qZWN0U3R5bGVzLCBwYWNrU2V0dGluZ3MgfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB7IEZyaWVuZEFuZEZvZXMgfSBmcm9tICcuL21vZHVsZXMvcGxheWVycy9GcmllbmRBbmRGb2VzJztcbmltcG9ydCB7IGFybUNvbnRlc3RTdGFydHVwR3VhcmQsIENvbnRlc3RTdGFydCB9IGZyb20gJy4vbW9kdWxlcy9jb250ZXN0cy9Db250ZXN0U3RhcnQnO1xuaW1wb3J0IHsgaW5zdGFsbENvbnRlc3RTZXR0aW5ncyB9IGZyb20gJy4vbW9kdWxlcy9jb250ZXN0cy9jb250ZXN0UHJlZmVyZW5jZXMnO1xuaW1wb3J0IHsgTGVhZ3VlVG9wMjAgfSBmcm9tICcuL21vZHVsZXMvcGxheWVycy9MZWFndWVUb3AyMCc7XG5pbXBvcnQgeyBSZW1vdmVQYXNzTG9jayB9IGZyb20gJy4vbW9kdWxlcy9wcm9ncmVzc2lvbi9SZW1vdmVQYXNzTG9jayc7XG5pbXBvcnQgeyBMb3ZlUmFpZHNBZGRvbiB9IGZyb20gJy4vbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc0FkZG9uJztcbmltcG9ydCB7IExvdmVSYWlkc1BhcnNlciB9IGZyb20gJy4vbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc1BhcnNlcic7XG5pbXBvcnQgeyBBY3Rpdml0eVBhcnNlciB9IGZyb20gJy4vbW9kdWxlcy9hY3Rpdml0aWVzL0FjdGl2aXR5UGFyc2VyJztcbmltcG9ydCB7IENoYW5nZWxvZyB9IGZyb20gJy4vbW9kdWxlcy91cGRhdGVzL0NoYW5nZWxvZyc7XG5cbmFybUNvbnRlc3RTdGFydHVwR3VhcmQoKTtcblxuZnVuY3Rpb24gcnVuSmFydmlzKCkge1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHJ1bkphcnZpcywgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgeyAkIH0gPSB3aW5kb3c7XG5cbiAgICBpZiAoISQpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgcnVuSmFydmlzLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdXQVJOSU5HOiBObyBqUXVlcnkgZm91bmQuIEVuZGluZyBzY3JpcHQuJyk7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKCdIZWxsbywgU2lyLCBKLkEuUi5WLkkuUy4gaXMgcmVhZHkgdG8gaGVscCB5b3UuJyk7XG5cbiAgICBpbml0R2FtZSgkKTtcbiAgICBpbmplY3RTdHlsZXMoKTtcblxuICAgIGNvbnN0IGZyaWVuZHNBbmRGb2VzID0gbmV3IEZyaWVuZEFuZEZvZXMoKTtcbiAgICBjb25zdCBjaGFuZ2Vsb2cgPSBuZXcgQ2hhbmdlbG9nKCk7XG4gICAgY29uc3QgYWxsTW9kdWxlcyA9IFtcbiAgICAgICAgZnJpZW5kc0FuZEZvZXMsXG4gICAgICAgIG5ldyBDb250ZXN0U3RhcnQoKSxcbiAgICAgICAgbmV3IExlYWd1ZVRvcDIwKCksXG4gICAgICAgIG5ldyBSZW1vdmVQYXNzTG9jaygpLFxuICAgICAgICBuZXcgTG92ZVJhaWRzQWRkb24oKSxcbiAgICAgICAgbmV3IExvdmVSYWlkc1BhcnNlcigpLFxuICAgICAgICBuZXcgQWN0aXZpdHlQYXJzZXIoKSxcbiAgICAgICAgY2hhbmdlbG9nXG4gICAgXVxuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJ1blNjcmlwdCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgaGhQbHVzUGx1c0NvbmZpZyB9ID0gd2luZG93XG4gICAgICAgICAgICBpZiAoIWhoUGx1c1BsdXNDb25maWcpIHJldHVybjtcblxuICAgICAgICAgICAgaGhQbHVzUGx1c0NvbmZpZy5yZWdpc3Rlckdyb3VwKHtcbiAgICAgICAgICAgICAgICBrZXk6ICdKQVJWSVMnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdISCBKYXJ2aXMnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgYWxsTW9kdWxlcy5mb3JFYWNoKG1vZHVsZSA9PiB7XG4gICAgICAgICAgICAgICAgaGhQbHVzUGx1c0NvbmZpZy5yZWdpc3Rlck1vZHVsZShtb2R1bGUpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgaGhQbHVzUGx1c0NvbmZpZy5sb2FkQ29uZmlnKClcbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucnVuTW9kdWxlcygpXG4gICAgICAgICAgICBmcmllbmRzQW5kRm9lcy5pbnN0YWxsU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIGluc3RhbGxDb250ZXN0U2V0dGluZ3MoKTtcbiAgICAgICAgICAgIGNoYW5nZWxvZy5pbnN0YWxsU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIHBhY2tTZXR0aW5ncygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpbmRvdy5oaFBsdXNQbHVzQ29uZmlnKSB7XG4gICAgICAgICAgICBydW5TY3JpcHQoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJChkb2N1bWVudCkub25lKCdoaCsrLWJkc206bG9hZGVkJywgcnVuU2NyaXB0KVxuICAgICAgICB9XG4gICAgfSwgMSlcbn1cblxucnVuSmFydmlzKCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQU8sTUFBSTtBQUNKLE1BQUk7QUFFSixXQUFTLFNBQVMsUUFBc0I7QUFDM0MsUUFBSTtBQUNKLGtCQUFjLE9BQU8sU0FBUztBQUFBLEVBQ2xDOzs7QUNOTyxXQUFTLFlBQVksT0FBZSxhQUFxQjtBQUM1RCxVQUFNLFNBQVMsQ0FBQyxTQUFpQixLQUFLLFdBQVcsS0FBSyxPQUFPLEVBQUUsV0FBVyxLQUFLLFFBQVEsRUFDbEYsV0FBVyxLQUFLLE1BQU0sRUFBRSxXQUFXLEtBQUssTUFBTTtBQUNuRCxXQUFPLE9BQU8sS0FBSyxJQUFJLHNGQUNuQixPQUFPLEtBQUssSUFBSSwwQkFBMEIsT0FBTyxXQUFXLElBQUk7QUFBQSxFQUN4RTtBQUVPLFdBQVMsa0JBQWtCLE9BQW9CLFdBQW1CO0FBQ3JFLFVBQU0sVUFBVSxTQUFTLGNBQWMsS0FBSztBQUM1QyxZQUFRLEtBQUs7QUFDYixZQUFRLFlBQVk7QUFDcEIsWUFBUSxhQUFhLFFBQVEsU0FBUztBQUN0QyxVQUFNLFVBQVUsT0FBTyxRQUFRLGdCQUFnQjtBQUMvQyxRQUFJLFFBQVMsU0FBUSxhQUFhLFdBQVcsUUFBUTtBQUFBLFFBQ2hELFNBQVEsU0FBUztBQUN0QixhQUFTLEtBQUssWUFBWSxPQUFPO0FBRWpDLFFBQUksU0FBNkI7QUFDakMsVUFBTSxVQUFVLENBQUMsV0FDYixrQkFBa0IsVUFBVSxPQUFPLFFBQXFCLHFCQUFxQixJQUFJO0FBQ3JGLFVBQU0sUUFBUSxN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QTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFB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
