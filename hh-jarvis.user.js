// ==UserScript==
// @name           HH J.A.R.V.I.S. (Dev)
// @version        0.6.7
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
`;

  // src/settings.ts
  function injectStyles() {
    const style = document.createElement("style");
    style.className = "hh-jarvis-style";
    style.textContent = `${settings_default}
        .hh-plus-plus-config-panel { --jarvis-version: "v${"0.6.7"}"; }
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
    const allModules = [
      friendsAndFoes,
      new ContestStart(),
      new LeagueTop20(),
      new RemovePassLock(),
      new LoveRaidsAddon(),
      new LoveRaidsParser(),
      new ActivityParser()
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzSGVscC50cyIsICJzcmMvc2V0dGluZ3MuY3NzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvSEhNb2R1bGUudHMiLCAic3JjL3N0b3JhZ2UudHMiLCAic3JjL21vZHVsZXMvcGxheWVycy9tYXJrTWFuYWdlci50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0ZyaWVuZEFuZEZvZXMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzLnRzIiwgInNyYy9tb2R1bGVzL2NvbnRlc3RzL0NvbnRlc3RTdGFydC50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0xlYWd1ZVRvcDIwLnRzIiwgInNyYy9tb2R1bGVzL3Byb2dyZXNzaW9uL1JlbW92ZVBhc3NMb2NrLnRzIiwgInNyYy9tb2R1bGVzL2xvdmUtcmFpZHMvZ2FtZURhdGEudHMiLCAic3JjL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNBZGRvbi50cyIsICJzcmMvbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc1BhcnNlci50cyIsICJzcmMvbW9kdWxlcy9hY3Rpdml0aWVzL0FjdGl2aXR5UGFyc2VyLnRzIiwgInNyYy9pbmRleC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCAkOiBKUXVlcnlTdGF0aWM7XG5leHBvcnQgbGV0IGN1cnJlbnRQYWdlOiBzdHJpbmc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0R2FtZShqUXVlcnk6IEpRdWVyeVN0YXRpYykge1xuICAgICQgPSBqUXVlcnk7XG4gICAgY3VycmVudFBhZ2UgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIHNldHRpbmdIZWxwKGxhYmVsOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgICBjb25zdCBlc2NhcGUgPSAodGV4dDogc3RyaW5nKSA9PiB0ZXh0LnJlcGxhY2VBbGwoJyYnLCAnJmFtcDsnKS5yZXBsYWNlQWxsKCdcIicsICcmcXVvdDsnKVxuICAgICAgICAucmVwbGFjZUFsbCgnPCcsICcmbHQ7JykucmVwbGFjZUFsbCgnPicsICcmZ3Q7Jyk7XG4gICAgcmV0dXJuIGVzY2FwZShsYWJlbCkgKyAnIDxzcGFuIGNsYXNzPVwiaXJvbm1hbi1zZXR0aW5nLWhlbHBcIiByb2xlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgYXJpYS1sYWJlbD1cIkFib3V0ICcgK1xuICAgICAgICBlc2NhcGUobGFiZWwpICsgJ1wiIGRhdGEtc2V0dGluZy1oZWxwPVwiJyArIGVzY2FwZShkZXNjcmlwdGlvbikgKyAnXCI+Pzwvc3Bhbj4nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW91bnRTZXR0aW5nc0hlbHAocGFuZWw6IEhUTUxFbGVtZW50LCB0b29sdGlwSWQ6IHN0cmluZykge1xuICAgIGNvbnN0IHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0b29sdGlwLmlkID0gdG9vbHRpcElkO1xuICAgIHRvb2x0aXAuY2xhc3NOYW1lID0gJ2lyb25tYW4tc2V0dGluZy10b29sdGlwJztcbiAgICB0b29sdGlwLnNldEF0dHJpYnV0ZSgncm9sZScsICd0b29sdGlwJyk7XG4gICAgY29uc3QgcG9wb3ZlciA9IHR5cGVvZiB0b29sdGlwLnNob3dQb3BvdmVyID09PSAnZnVuY3Rpb24nO1xuICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLnNldEF0dHJpYnV0ZSgncG9wb3ZlcicsICdtYW51YWwnKTtcbiAgICBlbHNlIHRvb2x0aXAuaGlkZGVuID0gdHJ1ZTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvb2x0aXApO1xuXG4gICAgbGV0IGFuY2hvcjogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBnZXRIZWxwID0gKHRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsKSA9PlxuICAgICAgICB0YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ID8gdGFyZ2V0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCdbZGF0YS1zZXR0aW5nLWhlbHBdJykgOiBudWxsO1xuICAgIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIWFuY2hvcikgcmV0dXJuO1xuICAgICAgICBhbmNob3IucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jyk7XG4gICAgICAgIGFuY2hvciA9IG51bGw7XG4gICAgICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLmhpZGVQb3BvdmVyKCk7XG4gICAgICAgIGVsc2UgdG9vbHRpcC5oaWRkZW4gPSB0cnVlO1xuICAgIH07XG4gICAgY29uc3Qgc2hvdyA9IChoZWxwOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICBpZiAoYW5jaG9yID09PSBoZWxwKSByZXR1cm47XG4gICAgICAgIGNsb3NlKCk7XG4gICAgICAgIGFuY2hvciA9IGhlbHA7XG4gICAgICAgIGhlbHAuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgdG9vbHRpcElkKTtcbiAgICAgICAgdG9vbHRpcC50ZXh0Q29udGVudCA9IGhlbHAuZGF0YXNldC5zZXR0aW5nSGVscCA/PyAnJztcbiAgICAgICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuc2hvd1BvcG92ZXIoKTtcbiAgICAgICAgZWxzZSB0b29sdGlwLmhpZGRlbiA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IGhlbHAuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0V2lkdGgsIG9mZnNldEhlaWdodCB9ID0gdG9vbHRpcDtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoOCwgTWF0aC5taW4oYm91bmRzLmxlZnQsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCAtIG9mZnNldFdpZHRoIC0gOCkpICsgJ3B4JztcbiAgICAgICAgY29uc3QgYmVsb3cgPSBib3VuZHMuYm90dG9tICsgNjtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS50b3AgPSAoYmVsb3cgKyBvZmZzZXRIZWlnaHQgPD0gd2luZG93LmlubmVySGVpZ2h0IC0gOFxuICAgICAgICAgICAgPyBiZWxvdyA6IE1hdGgubWF4KDgsIGJvdW5kcy50b3AgLSBvZmZzZXRIZWlnaHQgLSA2KSkgKyAncHgnO1xuICAgIH07XG5cbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyb3ZlcicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgJiYgZXZlbnQucG9pbnRlclR5cGUgIT09ICd0b3VjaCcpIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm91dCcsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgPT09IGFuY2hvciAmJiBoZWxwICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGhlbHApIGNsb3NlKCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHApIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCBldmVudCA9PiB7XG4gICAgICAgIGlmIChnZXRIZWxwKGV2ZW50LnRhcmdldCkgPT09IGFuY2hvcikgY2xvc2UoKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKCFoZWxwKSByZXR1cm47XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzaG93KGhlbHApO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGhlbHAgPSBnZXRIZWxwKGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGlmIChoZWxwICYmIChldmVudC5rZXkgPT09ICdFbnRlcicgfHwgZXZlbnQua2V5ID09PSAnICcpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBzaG93KGhlbHApO1xuICAgICAgICB9IGVsc2UgaWYgKGFuY2hvciAmJiBldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGdldEhlbHAoZXZlbnQudGFyZ2V0KSAhPT0gYW5jaG9yKSBjbG9zZSgpO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGNsb3NlLCB7IHBhc3NpdmU6IHRydWUgfSk7XG59XG4iLCAiLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAucGFuZWwtY29udGVudHMge1xuICAgIGFsaWduLWNvbnRlbnQ6IHN0YXJ0O1xuICAgIGFsaWduLWl0ZW1zOiBzdGFydDtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIG92ZXJzY3JvbGwtYmVoYXZpb3I6IGNvbnRhaW47XG4gICAgc2Nyb2xsYmFyLXdpZHRoOiB0aGluO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWw6aGFzKD4gLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXS5zaG93bikge1xuICAgIG92ZXJmbG93OiBjbGlwO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmcuaGFzLXN1YnNldHRpbmdzIHtcbiAgICBncmlkLXJvdy1lbmQ6IGF1dG87XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5qYXJ2aXMtcGFja2VkLXNldHRpbmdzIHtcbiAgICBncmlkLWF1dG8tZmxvdzogcm93IGRlbnNlO1xuICAgIGdyaWQtYXV0by1yb3dzOiAxcHg7XG4gICAgcm93LWdhcDogMDtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1wYWNrZWQtc2V0dGluZ3MgLmNvbmZpZy1zZXR0aW5nIHtcbiAgICBncmlkLXJvdy1lbmQ6IHNwYW4gdmFyKC0tamFydmlzLXNldHRpbmctcm93cywgMSk7XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAudGFicyBoNFtyZWw9XCJKQVJWSVNcIl0ge1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC50YWJzIGg0W3JlbD1cIkpBUlZJU1wiXS5zZWxlY3RlZDo6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6IHZhcigtLWphcnZpcy12ZXJzaW9uKTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgaW5zZXQtYmxvY2stc3RhcnQ6IDA7XG4gICAgaW5zZXQtaW5saW5lLWVuZDogLjE1cmVtO1xuICAgIGZvbnQtc2l6ZTogLjYyNXJlbTtcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIHRleHQtdHJhbnNmb3JtOiBub25lO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLmlyb25tYW4tc2V0dGluZy1oZWxwIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtZ3JpZDtcbiAgICBwbGFjZS1pdGVtczogY2VudGVyO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgaW5saW5lLXNpemU6IDEuMjVlbTtcbiAgICBibG9jay1zaXplOiAxLjI1ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICBmb250LXNpemU6IC44ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgdmVydGljYWwtYWxpZ246IC4wOGVtO1xuICAgIGN1cnNvcjogaGVscDtcbn1cbi5pcm9ubWFuLXNldHRpbmctaGVscDpob3Zlcixcbi5pcm9ubWFuLXNldHRpbmctaGVscDpmb2N1cy12aXNpYmxlIHtcbiAgICBvdXRsaW5lOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIG91dGxpbmUtb2Zmc2V0OiAycHg7XG59XG4uaXJvbm1hbi1zZXR0aW5nLXRvb2x0aXAge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICBpbnNldDogYXV0bztcbiAgICB6LWluZGV4OiAxMDAxMDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIG1heC13aWR0aDogbWluKDE4cmVtLCBjYWxjKDEwMHZ3IC0gMTZweCkpO1xuICAgIG1hcmdpbjogMDtcbiAgICBwYWRkaW5nOiAuNWVtIC43ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNGVtO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWNvbmZpZy1zZXR0aW5nLWJhY2tncm91bmQsICMyNDFlMzApO1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGZvbnQ6IDE0cHgvMS40IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1tYXJrLWNvbG9yIGlucHV0IHtcbiAgICB3aWR0aDogMzBweDtcbiAgICBoZWlnaHQ6IDIwcHg7XG4gICAgZmxleDogbm9uZTtcbiAgICBwYWRkaW5nOiAwO1xufVxuYnV0dG9uLmphcnZpcy1jb250ZXN0LXBpbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgbWFyZ2luLWlubGluZS1zdGFydDogLjM1ZW07XG4gICAgcGFkZGluZy1pbmxpbmU6IC4yZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgZm9udC1zaXplOiAuOWVtO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1waW46OmJlZm9yZSB7XG4gICAgY29udGVudDogJ+KYhic7XG59XG4uamFydmlzLWNvbnRlc3QtcGluW2FyaWEtcHJlc3NlZD1cInRydWVcIl06OmJlZm9yZSB7XG4gICAgY29udGVudDogJ+KYhSc7XG4gICAgY29sb3I6ICNmZmQzNmI7XG59XG4uamFydmlzLWNvbnRlc3QtcGluOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICB3aWR0aDogZml0LWNvbnRlbnQ7XG4gICAgZ2FwOiAuMTJlbTtcbiAgICBwYWRkaW5nOiAuMTJlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjb2xvci1taXgoaW4gc3JnYiwgY3VycmVudENvbG9yIDU1JSwgdHJhbnNwYXJlbnQpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40NWVtO1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIGxpbmUtaGVpZ2h0OiAxLjE1O1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b24ge1xuICAgIGFsbDogdW5zZXQ7XG4gICAgcGFkZGluZzogLjE4ZW0gLjM4ZW07XG4gICAgYm9yZGVyLXJhZGl1czogLjI2ZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgZm9udDogaW5oZXJpdDtcbiAgICBsaW5lLWhlaWdodDogaW5oZXJpdDtcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uW2FyaWEtcHJlc3NlZD1cInRydWVcIl0ge1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMjIlLCB0cmFuc3BhcmVudCk7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIGJ1dHRvbjpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAxNSUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2UgYnV0dG9uOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG59XG4uamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCB7XG4gICAgbWFyZ2luLWlubGluZS1zdGFydDogLjI4ZW07XG4gICAgZm9udC1zaXplOiAuN2VtO1xuICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XG59XG4uamFydmlzLWNvbnRlc3Qtc2V0dGluZ3Mge1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ2FwOiAuM2VtO1xuICAgIG1pbi13aWR0aDogMDtcbiAgICBtYXJnaW46IC40NWVtIDAgMDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGJvcmRlcjogMDtcbiAgICBmb250LXNpemU6IC44NWVtO1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzOmRpc2FibGVkIC5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIG9wYWNpdHk6IC41O1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzOmRpc2FibGVkIGJ1dHRvbiB7XG4gICAgY3Vyc29yOiBkZWZhdWx0O1xufVxuLmphcnZpcy1tYXJrLW1lbnUge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB6LWluZGV4OiAxMDAwMDtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdhcDogMnB4O1xuICAgIHBhZGRpbmc6IDRweDtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjODk5NGE3O1xuICAgIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgICBiYWNrZ3JvdW5kOiAjMjMyOTM2O1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGJveC1zaGFkb3c6IDAgMnB4IDEwcHggIzAwMDg7XG4gICAgZm9udDogMTNweC8xLjM1IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbn1cbi5qYXJ2aXMtbWFyay1tZW51IGJ1dHRvbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBwYWRkaW5nOiA0cHggOXB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLW1hcmstbWVudSBidXR0b246aG92ZXIsXG4uamFydmlzLW1hcmstbWVudSBidXR0b246Zm9jdXMtdmlzaWJsZSB7XG4gICAgYmFja2dyb3VuZDogIzQxNGQ2NDtcbn1cbiNjb250ZXN0cyAubGVmdF9wYXJ0IC5zY3JvbGxfYXJlYS5qYXJ2aXMtY29udGVzdC1pbnN0YW50LFxuI2NvbnRlc3RzIC5yaWdodF9wYXJ0LmphcnZpcy1jb250ZXN0LWluc3RhbnQgLmxlYWRfdGFibGVfdmlldyB7XG4gICAgc2Nyb2xsLWJlaGF2aW9yOiBhdXRvICFpbXBvcnRhbnQ7XG4gICAgb3ZlcmZsb3ctYW5jaG9yOiBub25lICFpbXBvcnRhbnQ7XG59XG4jY29udGVzdHMgLmphcnZpcy1jb250ZXN0LWxvYWRpbmcge1xuICAgIG9wYWNpdHk6IDAgIWltcG9ydGFudDtcbiAgICB0cmFuc2l0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4jY29udGVzdHMgLnJpZ2h0X3BhcnQgLnJhbmtpbmdbaWRfY29udGVzdF0uamFydmlzLWNvbnRlc3Qtb3RoZXIge1xuICAgIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrPVwiZnJpZW5kXCJdIHtcbiAgICBjb2xvcjogdmFyKC0tamFydmlzLWZyaWVuZC1jb2xvcikgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrPVwiZm9lXCJdIHtcbiAgICBjb2xvcjogdmFyKC0tamFydmlzLWZvZS1jb2xvcikgIWltcG9ydGFudDtcbn1cbltkYXRhLWphcnZpcy1tYXJrXSxcbnRkW2RhdGEtamFydmlzLW1hcmtdID4gYSB7XG4gICAgdGV4dC1zaGFkb3c6IDFweCAwICMxMTE4MjcsIC0xcHggMCAjMTExODI3LCAwIDFweCAjMTExODI3LCAwIC0xcHggIzExMTgyNyAhaW1wb3J0YW50O1xufVxudGRbZGF0YS1qYXJ2aXMtbWFya10gPiBhIHtcbiAgICBjb2xvcjogaW5oZXJpdCAhaW1wb3J0YW50O1xufVxuLmphcnZpcy1zZXR0aW5nLWFjdGlvbiB7XG4gICAgYXBwZWFyYW5jZTogbm9uZTtcbiAgICBwYWRkaW5nOiAuMmVtIC41ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIGJvcmRlci1yYWRpdXM6IC4zNWVtO1xuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIGZvbnQ6IGluaGVyaXQ7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1zZXR0aW5nLWFjdGlvbjpob3Zlcixcbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246Zm9jdXMtdmlzaWJsZSB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAxNiUsIHRyYW5zcGFyZW50KTtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246ZGlzYWJsZWQge1xuICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICBvcGFjaXR5OiAuNTtcbn1cbi5qYXJ2aXMtbWFyay1zZXR0aW5nLWFjdGlvbnMsXG4uamFydmlzLW1hcmstYWN0aW9ucyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgZ2FwOiAuNGVtO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXIge1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgd2lkdGg6IG1pbigzNHJlbSwgY2FsYygxMDB2dyAtIDJyZW0pKTtcbiAgICBtYXgtaGVpZ2h0OiBjYWxjKDEwMHZoIC0gMnJlbSk7XG4gICAgcGFkZGluZzogMXJlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC42NXJlbTtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jb25maWctc2V0dGluZy1iYWNrZ3JvdW5kLCAjMjQxZTMwKTtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBmb250OiAxNXB4LzEuMzUgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXI6OmJhY2tkcm9wIHtcbiAgICBiYWNrZ3JvdW5kOiAjMDgwYjEyYWE7XG59XG4uamFydmlzLW1hcmstbWFuYWdlciBoMixcbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIGgzLFxuLmphcnZpcy1tYXJrLW1hbmFnZXIgcCB7XG4gICAgbWFyZ2luOiAwO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIHtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgobWluKDEzcmVtLCAxMDAlKSwgMWZyKSk7XG4gICAgZ2FwOiAuOXJlbTtcbiAgICBtYXgtaGVpZ2h0OiA1MHZoO1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgbWFyZ2luLWJsb2NrOiAuOXJlbTtcbn1cbi5qYXJ2aXMtbWFyay1saXN0cyB1bCB7XG4gICAgbWFyZ2luOiAuM2VtIDAgMDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XG59XG4uamFydmlzLW1hcmstbGlzdHMgbGkge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgZ2FwOiAuNDVlbTtcbiAgICBwYWRkaW5nOiAuMmVtIDA7XG4gICAgb3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7XG59XG4uamFydmlzLW1hcmstYWN0aW9ucyB7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xufVxuIiwgImltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IG1vdW50U2V0dGluZ3NIZWxwIH0gZnJvbSAnLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IGNzcyBmcm9tICcuL3NldHRpbmdzLmNzcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RTdHlsZXMoKSB7XG4gICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHN0eWxlLmNsYXNzTmFtZSA9ICdoaC1qYXJ2aXMtc3R5bGUnO1xuICAgIHN0eWxlLnRleHRDb250ZW50ID0gYCR7Y3NzfVxuICAgICAgICAuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCB7IC0tamFydmlzLXZlcnNpb246IFwidiR7VVNFUlNDUklQVF9WRVJTSU9OfVwiOyB9XG4gICAgYDtcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tTZXR0aW5ncygpIHtcbiAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAucGFuZWwtY29udGVudHMnO1xuICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihzZWxlY3Rvcik7XG4gICAgICAgIGlmICghcGFuZWwpIHJldHVybjtcbiAgICAgICAgcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnaGgtc2Nyb2xsJyk7XG4gICAgICAgIG1vdW50U2V0dGluZ3NIZWxwKHBhbmVsLCAnamFydmlzLXNldHRpbmctdG9vbHRpcCcpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuY3RybEtleSB8fCAhKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHx8ICFwYW5lbC5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaXQgPSBldmVudC5kZWx0YU1vZGUgPT09IDEgPyAxNiA6IGV2ZW50LmRlbHRhTW9kZSA9PT0gMiA/IHBhbmVsLmNsaWVudEhlaWdodCA6IDE7XG4gICAgICAgICAgICBjb25zdCBzY2FsZSA9IHBhbmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCAvIHBhbmVsLm9mZnNldEhlaWdodCB8fCAxO1xuICAgICAgICAgICAgcGFuZWwuc2Nyb2xsVG9wICs9IGV2ZW50LmRlbHRhWSAqIHVuaXQgLyBzY2FsZTtcbiAgICAgICAgfSwgeyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiBmYWxzZSB9KTtcblxuICAgICAgICBjb25zdCBjYXJkcyA9IHBhbmVsLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcuY29uZmlnLXNldHRpbmcnKTtcbiAgICAgICAgY29uc3QgcGFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghcGFuZWwub2Zmc2V0V2lkdGgpIHJldHVybjtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBjYXJkIG9mIGNhcmRzKSB7XG4gICAgICAgICAgICAgICAgY2FyZC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1qYXJ2aXMtc2V0dGluZy1yb3dzJywgU3RyaW5nKGNhcmQub2Zmc2V0SGVpZ2h0ICsgMTApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhbmVsLmNsYXNzTGlzdC5hZGQoJ2phcnZpcy1wYWNrZWQtc2V0dGluZ3MnKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZ3JvdXBPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKHBhY2spO1xuICAgICAgICBpZiAocGFuZWwucGFyZW50RWxlbWVudCkgZ3JvdXBPYnNlcnZlci5vYnNlcnZlKHBhbmVsLnBhcmVudEVsZW1lbnQsIHsgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10gfSk7XG4gICAgICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBjb25zdCBzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIocGFjayk7XG4gICAgICAgICAgICBjYXJkcy5mb3JFYWNoKGNhcmQgPT4gc2l6ZU9ic2VydmVyLm9ic2VydmUoY2FyZCkpO1xuICAgICAgICB9XG4gICAgICAgIHBhY2soKTtcbiAgICB9KTtcbn1cbiIsICJleHBvcnQgdHlwZSBNb2R1bGVTZXR0aW5ncyA9IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+O1xuXG5pbnRlcmZhY2UgQ29uZmlnU2NoZW1hIHtcbiAgICBiYXNlS2V5OiBzdHJpbmc7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBkZWZhdWx0OiBib29sZWFuO1xuICAgIHN1YlNldHRpbmdzPzogeyBrZXk6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgZGVmYXVsdDogYm9vbGVhbiB9W107XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBISE1vZHVsZSB7XG4gICAgcmVhZG9ubHkgZ3JvdXAgPSAnSkFSVklTJztcbiAgICByZWFkb25seSBjb25maWdTY2hlbWE6IENvbmZpZ1NjaGVtYTtcbiAgICBoYXNSdW4gPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKHsgY29uZmlnU2NoZW1hIH06IHsgbmFtZTogc3RyaW5nOyBjb25maWdTY2hlbWE6IENvbmZpZ1NjaGVtYSB9KSB7XG4gICAgICAgIHRoaXMuY29uZmlnU2NoZW1hID0gY29uZmlnU2NoZW1hO1xuICAgIH1cblxuICAgIGFic3RyYWN0IHNob3VsZFJ1bigpOiBib29sZWFuO1xuICAgIGFic3RyYWN0IHJ1bihzZXR0aW5nczogTW9kdWxlU2V0dGluZ3MpOiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbn1cbiIsICJleHBvcnQgY29uc3QgTFNfQ09ORklHX05BTUUgPSAnSEhTdGFyayc7XG5cbmV4cG9ydCBmdW5jdGlvbiBsc0dldChrZXk6IHN0cmluZywgbHNfbmFtZSA9IExTX0NPTkZJR19OQU1FKTogdW5rbm93biB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gKSA/PyAnbnVsbCcpXG59XG5leHBvcnQgZnVuY3Rpb24gbHNTZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLnNldEl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gLCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpXG59XG5leHBvcnQgZnVuY3Rpb24gbHNSbShrZXk6IHN0cmluZywgbHNfbmFtZSA9IExTX0NPTkZJR19OQU1FKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGAke2xzX25hbWV9JHtrZXl9YClcbn1cbiIsICJpbXBvcnQgeyBMU19DT05GSUdfTkFNRSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuXG5leHBvcnQgdHlwZSBNYXJrID0gJ2ZyaWVuZCcgfCAnZm9lJztcblxuZXhwb3J0IGludGVyZmFjZSBTYXZlZE1hcmsge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgbmFtZT86IHN0cmluZztcbiAgICBtYXJrOiBNYXJrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3Blbk1hcmtNYW5hZ2VyKHJlYWQ6ICgpID0+IFNhdmVkTWFya1tdLCByZW1vdmU6IChpZDogc3RyaW5nKSA9PiBib29sZWFuLCBjbGVhcjogKCkgPT4gYm9vbGVhbikge1xuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuamFydmlzLW1hcmstbWFuYWdlcicpKSByZXR1cm47XG5cbiAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaWFsb2cnKTtcbiAgICBkaWFsb2cuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLW1hbmFnZXInO1xuICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsICdqYXJ2aXMtbWFyay1tYW5hZ2VyLXRpdGxlJyk7XG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgIHRpdGxlLmlkID0gJ2phcnZpcy1tYXJrLW1hbmFnZXItdGl0bGUnO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gJ0ZyaWVuZHMgYW5kIGZvZXMnO1xuXG4gICAgY29uc3QgbGlzdHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBsaXN0cy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstbGlzdHMnO1xuICAgIGNvbnN0IGFjdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1hY3Rpb25zJztcbiAgICBjb25zdCBjbGVhckFsbCA9IG1ha2VCdXR0b24oJ0NsZWFyIGFsbCBtYXJrcycsICgpID0+IHtcbiAgICAgICAgaWYgKGNvbmZpcm0oJ1JlbW92ZSBhbGwgZnJpZW5kIGFuZCBmb2UgbWFya3MgZm9yIHRoaXMgZ2FtZT8nKSAmJiBjbGVhcigpKSB7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIGNsb3NlLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBjbG9zZSA9IG1ha2VCdXR0b24oJ0Nsb3NlJywgKCkgPT4gZGlhbG9nLmNsb3NlKCkpO1xuICAgIGFjdGlvbnMuYXBwZW5kKGNsZWFyQWxsLCBjbG9zZSk7XG5cbiAgICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSByZWFkKCkuc29ydCgoYSwgYikgPT4gTnVtYmVyKCFhLm5hbWUpIC0gTnVtYmVyKCFiLm5hbWUpIHx8XG4gICAgICAgICAgICAoYS5uYW1lIHx8IGEuaWQpLmxvY2FsZUNvbXBhcmUoYi5uYW1lIHx8IGIuaWQsIHVuZGVmaW5lZCwgeyBudW1lcmljOiB0cnVlIH0pKTtcbiAgICAgICAgY29uc3Qgc2VjdGlvbnMgPSAoWydmcmllbmQnLCAnZm9lJ10gYXMgY29uc3QpLm1hcChtYXJrID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgICAgICAgICBjb25zdCBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBlbnRyaWVzLmZpbHRlcihlbnRyeSA9PiBlbnRyeS5tYXJrID09PSBtYXJrKTtcbiAgICAgICAgICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSAobWFyayA9PT0gJ2ZyaWVuZCcgPyAnRnJpZW5kcycgOiAnRm9lcycpICsgYCAoJHttYXRjaGVzLmxlbmd0aH0pYDtcbiAgICAgICAgICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoaGVhZGluZyk7XG5cbiAgICAgICAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVtcHR5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICAgICAgICAgIGVtcHR5LnRleHRDb250ZW50ID0gJ05vIHNhdmVkIHBsYXllcnMuJztcbiAgICAgICAgICAgICAgICBzZWN0aW9uLmFwcGVuZENoaWxkKGVtcHR5KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VjdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgaWQsIG5hbWUgfSBvZiBtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICAgICAgcGxheWVyLnRleHRDb250ZW50ID0gbmFtZSA/IGAke25hbWV9IMK3ICR7aWR9YCA6IGlkO1xuICAgICAgICAgICAgICAgIGlmICghbmFtZSkgcGxheWVyLnRpdGxlID0gJ1RoZSBuYW1lIHdpbGwgYXBwZWFyIGFmdGVyIEphcnZpcyBzZWVzIHRoaXMgcGxheWVyLic7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gbWFrZUJ1dHRvbignUmVtb3ZlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IEFycmF5LmZyb20obGlzdHMucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJykpLmluZGV4T2YoYnV0dG9uKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZShpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nID0gbGlzdHMucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAocmVtYWluaW5nW01hdGgubWluKGluZGV4LCByZW1haW5pbmcubGVuZ3RoIC0gMSldIHx8IGNsb3NlKS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGBSZW1vdmUgJHtuYW1lIHx8IGBwbGF5ZXIgJHtpZH1gfSBmcm9tICR7bWFyayA9PT0gJ2ZyaWVuZCcgPyAnZnJpZW5kcycgOiAnZm9lcyd9YCk7XG4gICAgICAgICAgICAgICAgcm93LmFwcGVuZChwbGF5ZXIsIGJ1dHRvbik7XG4gICAgICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChyb3cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VjdGlvbi5hcHBlbmRDaGlsZChsaXN0KTtcbiAgICAgICAgICAgIHJldHVybiBzZWN0aW9uO1xuICAgICAgICB9KTtcbiAgICAgICAgbGlzdHMucmVwbGFjZUNoaWxkcmVuKC4uLnNlY3Rpb25zKTtcbiAgICAgICAgY2xlYXJBbGwuZGlzYWJsZWQgPSBlbnRyaWVzLmxlbmd0aCA9PT0gMDtcbiAgICB9XG5cbiAgICByZW5kZXIoKTtcbiAgICBkaWFsb2cuYXBwZW5kKHRpdGxlLCBsaXN0cywgYWN0aW9ucyk7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgZXZlbnQgPT4ge1xuICAgICAgICBpZiAoIWV2ZW50LmtleSB8fCBbJ1BsYXllck1hcmtzJywgJ1BsYXllck1hcmtOYW1lcycsICdGcmllbmRMaXN0JywgJ0ZvZUxpc3QnXVxuICAgICAgICAgICAgLnNvbWUoa2V5ID0+IGV2ZW50LmtleSA9PT0gTFNfQ09ORklHX05BTUUgKyBrZXkpKSByZW5kZXIoKTtcbiAgICB9LCB7IHNpZ25hbDogbGlzdGVuZXJzLnNpZ25hbCB9KTtcbiAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB7XG4gICAgICAgIGxpc3RlbmVycy5hYm9ydCgpO1xuICAgICAgICBkaWFsb2cucmVtb3ZlKCk7XG4gICAgfSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcbiAgICBkaWFsb2cuc2hvd01vZGFsKCk7XG4gICAgY2xvc2UuZm9jdXMoKTtcbn1cblxuZnVuY3Rpb24gbWFrZUJ1dHRvbihsYWJlbDogc3RyaW5nLCBvbkNsaWNrOiAoKSA9PiB2b2lkKSB7XG4gICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICBidXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1zZXR0aW5nLWFjdGlvbic7XG4gICAgYnV0dG9uLnRleHRDb250ZW50ID0gbGFiZWw7XG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljayk7XG4gICAgcmV0dXJuIGJ1dHRvbjtcbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHR5cGUgeyBDb250ZXN0RGF0YSB9IGZyb20gJy4uLy4uL2dhbWUtdHlwZXMnO1xuaW1wb3J0IHsgTFNfQ09ORklHX05BTUUsIGxzR2V0LCBsc1NldCB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgb3Blbk1hcmtNYW5hZ2VyLCB0eXBlIE1hcmssIHR5cGUgU2F2ZWRNYXJrIH0gZnJvbSAnLi9tYXJrTWFuYWdlcic7XG5cbmNvbnN0IERFRkFVTFRfQ09MT1JTOiBSZWNvcmQ8TWFyaywgc3RyaW5nPiA9IHsgZnJpZW5kOiAnIzQ4YTlmZicsIGZvZTogJyNmZjYxNzMnIH07XG5cbmV4cG9ydCBjbGFzcyBGcmllbmRBbmRGb2VzIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgbmFtZXMgPSBuZXcgTWFwPEhUTUxFbGVtZW50LCBzdHJpbmc+KCk7XG4gICAgcHJpdmF0ZSBtYXJrTWVudTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJvb3Q6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByb290U2VsZWN0b3IgPSAnJztcbiAgICBwcml2YXRlIGluTGVhZ3VlID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdmcmllbmRBbmRGb2VzJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkZyaWVuZHMgYW5kIGZvZXNcIiwgXCJSaWdodC1jbGljayBlYWNoIHBsYXllcidzIG5hbWUgdG8gYWRkIG9yIHJlbW92ZSBhIG1hcmsuIE1hbmFnZSBzYXZlZCBtYXJrcyBiZWxvdy5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdsZWFndWUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkluIGxlYWd1ZXNcIiwgXCJTaG93IG1hcmtzIGFuZCBhbGxvdyBtYXJraW5nIGluIGxlYWd1ZSB0YWJsZXMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdjb250ZXN0cycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiSW4gY29udGVzdHNcIiwgXCJTaG93IG1hcmtzIGFuZCBhbGxvdyBtYXJraW5nIG9uIGNvbnRlc3QgbGVhZGVyYm9hcmRzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHsgbmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hIH0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIFsnL2xlYWd1ZXMuaHRtbCcsICcvYWN0aXZpdGllcy5odG1sJ10uaW5jbHVkZXMoY3VycmVudFBhZ2UpO1xuICAgIH1cblxuICAgIHJlYWRTZXR0aW5nKGtleTogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gbHNHZXQoa2V5KTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlYWRNYXJrcygpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgICAgIGNvbnN0IHN0b3JlZCA9IHRoaXMucmVhZFNldHRpbmcoJ1BsYXllck1hcmtzJyk7XG4gICAgICAgIGlmIChzdG9yZWQgJiYgdHlwZW9mIHN0b3JlZCA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoc3RvcmVkKSkgcmV0dXJuIHN0b3JlZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAgICAgICBjb25zdCBtYXJrczogUmVjb3JkPHN0cmluZywgTWFyaz4gPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCBtYXJrXSBvZiBbWydGcmllbmRMaXN0JywgJ2ZyaWVuZCddLCBbJ0ZvZUxpc3QnLCAnZm9lJ11dIGFzIGNvbnN0KSB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gdGhpcy5yZWFkU2V0dGluZyhrZXkpO1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3QpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBpZCBvZiBsaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKC9eWzEtOV1cXGQqJC8udGVzdChTdHJpbmcoaWQpKSkgbWFya3NbU3RyaW5nKGlkKV0gPSBtYXJrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXJrcztcbiAgICB9XG5cbiAgICByZWFkQ29sb3JzKCk6IFJlY29yZDxNYXJrLCBzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgc2F2ZWQgPSB0aGlzLnJlYWRTZXR0aW5nKCdQbGF5ZXJNYXJrQ29sb3JzJykgYXMgUGFydGlhbDxSZWNvcmQ8TWFyaywgdW5rbm93bj4+IHwgbnVsbDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZyaWVuZDogdHlwZW9mIHNhdmVkPy5mcmllbmQgPT09ICdzdHJpbmcnICYmIC9eI1tcXGRhLWZdezZ9JC9pLnRlc3Qoc2F2ZWQuZnJpZW5kKSA/IHNhdmVkLmZyaWVuZCA6IERFRkFVTFRfQ09MT1JTLmZyaWVuZCxcbiAgICAgICAgICAgIGZvZTogdHlwZW9mIHNhdmVkPy5mb2UgPT09ICdzdHJpbmcnICYmIC9eI1tcXGRhLWZdezZ9JC9pLnRlc3Qoc2F2ZWQuZm9lKSA/IHNhdmVkLmZvZSA6IERFRkFVTFRfQ09MT1JTLmZvZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJlYWRTYXZlZE5hbWVzKCk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICAgICAgICBjb25zdCBzYXZlZCA9IHRoaXMucmVhZFNldHRpbmcoJ1BsYXllck1hcmtOYW1lcycpO1xuICAgICAgICBpZiAoIXNhdmVkIHx8IHR5cGVvZiBzYXZlZCAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShzYXZlZCkpIHJldHVybiB7fTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyhzYXZlZCkuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIFtzdHJpbmcsIHN0cmluZ10gPT4gdHlwZW9mIGVudHJ5WzFdID09PSAnc3RyaW5nJykpO1xuICAgIH1cblxuICAgIHNhdmVOYW1lcyhuYW1lczogUmVjb3JkPHN0cmluZywgc3RyaW5nPikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbHNTZXQoJ1BsYXllck1hcmtOYW1lcycsIG5hbWVzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3QgcmVtZW1iZXIgbWFya2VkIHBsYXllciBuYW1lczonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlTWFyayhpZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IG1hcmtzID0gdGhpcy5yZWFkTWFya3MoKTtcbiAgICAgICAgZGVsZXRlIG1hcmtzW2lkXTtcbiAgICAgICAgaWYgKCF0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrcycsIG1hcmtzKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBuYW1lcyA9IHRoaXMucmVhZFNhdmVkTmFtZXMoKTtcbiAgICAgICAgaWYgKGlkIGluIG5hbWVzKSB7XG4gICAgICAgICAgICBkZWxldGUgbmFtZXNbaWRdO1xuICAgICAgICAgICAgdGhpcy5zYXZlTmFtZXMobmFtZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJlYWRTYXZlZE1hcmtzKCkge1xuICAgICAgICBjb25zdCBuYW1lcyA9IHRoaXMucmVhZFNhdmVkTmFtZXMoKTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKHRoaXMucmVhZE1hcmtzKCkpLmZsYXRNYXA8U2F2ZWRNYXJrPigoW2lkLCBtYXJrXSkgPT5cbiAgICAgICAgICAgIC9eWzEtOV1cXGQqJC8udGVzdChpZCkgJiYgKG1hcmsgPT09ICdmcmllbmQnIHx8IG1hcmsgPT09ICdmb2UnKVxuICAgICAgICAgICAgICAgID8gW3sgaWQsIG5hbWU6IG5hbWVzW2lkXSwgbWFyayB9XVxuICAgICAgICAgICAgICAgIDogW10pO1xuICAgIH1cblxuICAgIHNhdmVTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbHNTZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICBhbGVydCgnSmFydmlzIGNvdWxkIG5vdCBzYXZlIHlvdXIgRnJpZW5kcyBhbmQgRm9lcyBzZXR0aW5ncy4nKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluc3RhbGxTZXR0aW5ncygpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRQYWdlICE9PSAnL2hvbWUuaHRtbCcpIHJldHVybjtcblxuICAgICAgICBjb25zdCBzZWxlY3RvciA9ICcuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZ1tyZWw9XCJKQVJWSVNfZnJpZW5kQW5kRm9lc1wiXSAuc3ViLXNldHRpbmdzJztcbiAgICAgICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICghc2V0dGluZ3MgfHwgc2V0dGluZ3MucXVlcnlTZWxlY3RvcignLmphcnZpcy1tYXJrLWNvbG9yJykpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgaW5wdXRzID0gbmV3IE1hcDxNYXJrLCBIVE1MSW5wdXRFbGVtZW50PigpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBbbWFyaywgdGV4dF0gb2YgW1snZnJpZW5kJywgJ0ZyaWVuZCBuYW1lIGNvbG9yJ10sIFsnZm9lJywgJ0ZvZSBuYW1lIGNvbG9yJ11dIGFzIGNvbnN0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1jb2xvcic7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgICAgICBpbnB1dC50eXBlID0gJ2NvbG9yJztcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHRoaXMucmVhZENvbG9ycygpW21hcmtdO1xuICAgICAgICAgICAgICAgIGlucHV0cy5zZXQobWFyaywgaW5wdXQpO1xuICAgICAgICAgICAgICAgIGlucHV0LmRpc2FibGVkID0gIXNldHRpbmdzLmNsb3Nlc3QoJy5jb25maWctc2V0dGluZycpPy5jbGFzc0xpc3QuY29udGFpbnMoJ2VuYWJsZWQnKTtcbiAgICAgICAgICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9ycyA9IHRoaXMucmVhZENvbG9ycygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtDb2xvcnMnLCB7IC4uLmNvbG9ycywgW21hcmtdOiBpbnB1dC52YWx1ZSB9KSkgaW5wdXQudmFsdWUgPSBjb2xvcnNbbWFya107XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbGFiZWwuYXBwZW5kKHRpdGxlLCBpbnB1dCk7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYXBwZW5kQ2hpbGQobGFiZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVzZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIHJlc2V0LnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIHJlc2V0LmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgICAgICAgICAgcmVzZXQudGV4dENvbnRlbnQgPSAnUmVzZXQgY29sb3JzJztcbiAgICAgICAgICAgIHJlc2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya0NvbG9ycycsIHt9KSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW21hcmssIGlucHV0XSBvZiBpbnB1dHMpIGlucHV0LnZhbHVlID0gREVGQVVMVF9DT0xPUlNbbWFya107XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IG1hbmFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgbWFuYWdlLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIG1hbmFnZS5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uJztcbiAgICAgICAgICAgIG1hbmFnZS50ZXh0Q29udGVudCA9ICdNYW5hZ2UgbWFya3MnO1xuICAgICAgICAgICAgbWFuYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gb3Blbk1hcmtNYW5hZ2VyKFxuICAgICAgICAgICAgICAgICgpID0+IHRoaXMucmVhZFNhdmVkTWFya3MoKSxcbiAgICAgICAgICAgICAgICBpZCA9PiB0aGlzLnJlbW92ZU1hcmsoaWQpLFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrcycsIHt9KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVOYW1lcyh7fSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgYWN0aW9ucy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstc2V0dGluZy1hY3Rpb25zJztcbiAgICAgICAgICAgIGFjdGlvbnMuYXBwZW5kKHJlc2V0LCBtYW5hZ2UpO1xuICAgICAgICAgICAgc2V0dGluZ3MuYXBwZW5kQ2hpbGQoYWN0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNsb3NlTWFya01lbnUoKSB7XG4gICAgICAgIHRoaXMubWFya01lbnU/LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLm1hcmtNZW51ID0gbnVsbDtcbiAgICB9XG5cbiAgICBvcGVuTWFya01lbnUoZXZlbnQ6IE1vdXNlRXZlbnQsIG5hbWU6IEhUTUxFbGVtZW50LCBpZDogc3RyaW5nKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcblxuICAgICAgICBjb25zdCBtZW51ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG1lbnUuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLW1lbnUnO1xuICAgICAgICBtZW51LnNldEF0dHJpYnV0ZSgncm9sZScsICdncm91cCcpO1xuICAgICAgICBtZW51LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdNYXJrIHBsYXllcicpO1xuICAgICAgICBjb25zdCBhZGRBY3Rpb24gPSAodGV4dDogc3RyaW5nLCBhY3Q6ICgpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUuaXNDb25uZWN0ZWQgJiYgdGhpcy5uYW1lcy5nZXQobmFtZSkgPT09IGlkKSBhY3QoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbWVudS5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB9O1xuICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCB0ZXh0XSBvZiBbWydmcmllbmQnLCAnTWFyayBhcyBmcmllbmQnXSwgWydmb2UnLCAnTWFyayBhcyBmb2UnXV0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgIGFkZEFjdGlvbih0ZXh0LCAoKSA9PiB0aGlzLmFwcGx5TWFyayhpZCwgbWFyaykpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lLmRhdGFzZXQuamFydmlzTWFyaykgYWRkQWN0aW9uKCdSZW1vdmUgdGhpcyBwbGF5ZXLigJlzIG1hcmsnLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZW1vdmVNYXJrKGlkKSkgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBtZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xpY2sgPT4gY2xpY2suc3RvcFByb3BhZ2F0aW9uKCkpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1lbnUpO1xuICAgICAgICB0aGlzLm1hcmtNZW51ID0gbWVudTtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBuYW1lLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCB4ID0gZXZlbnQuY2xpZW50WCB8fCBib3VuZHMubGVmdDtcbiAgICAgICAgY29uc3QgeSA9IGV2ZW50LmNsaWVudFkgfHwgYm91bmRzLmJvdHRvbTtcbiAgICAgICAgbWVudS5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oeCwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIC0gbWVudS5vZmZzZXRXaWR0aCkpICsgJ3B4JztcbiAgICAgICAgbWVudS5zdHlsZS50b3AgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih5LCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IC0gbWVudS5vZmZzZXRIZWlnaHQpKSArICdweCc7XG4gICAgICAgIG1lbnUucXVlcnlTZWxlY3RvcignYnV0dG9uJyk/LmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBnZXRDb250ZXN0TmFtZXMocm9vdDogSFRNTEVsZW1lbnQsIGNvbnRlc3RzOiBDb250ZXN0RGF0YVtdKSB7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gbmV3IE1hcDxIVE1MRWxlbWVudCwgc3RyaW5nPigpO1xuICAgICAgICBjb25zdCBieUNvbnRlc3QgPSBuZXcgTWFwPHN0cmluZywgTWFwPHN0cmluZywgU2V0PHN0cmluZz4+PigpO1xuXG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHJvb3QucXVlcnlTZWxlY3RvckFsbDxIVE1MVGFibGVSb3dFbGVtZW50PignLmxlYWRUYWJsZSB0cicpKSB7XG4gICAgICAgICAgICBjb25zdCBjZWxsID0gcm93LmNlbGxzPy5bMV07XG4gICAgICAgICAgICBpZiAoIWNlbGwgfHwgY2VsbC5sb2NhbE5hbWUgIT09ICd0ZCcpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGNlbGwucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5uaWNrbmFtZScpIHx8IGNlbGw7XG4gICAgICAgICAgICBsZXQgaWQgPSByb3cuZ2V0QXR0cmlidXRlKCdzb3J0aW5nX2lkJykgfHwgbmFtZS5nZXRBdHRyaWJ1dGUoJ2lkLW1lbWJlcicpIHx8XG4gICAgICAgICAgICAgICAgbmFtZS5xdWVyeVNlbGVjdG9yKCdbaWQtbWVtYmVyXScpPy5nZXRBdHRyaWJ1dGUoJ2lkLW1lbWJlcicpO1xuICAgICAgICAgICAgY29uc3QgY29udGVzdElkID0gcm93LmNsb3Nlc3QoJ1tpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmIChjb250ZXN0SWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgYnlOYW1lID0gYnlDb250ZXN0LmdldChjb250ZXN0SWQpO1xuICAgICAgICAgICAgICAgIGlmICghYnlOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRpY2lwYW50cyA9IGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBTdHJpbmcoY29udGVzdC5pZF9jb250ZXN0KSA9PT0gY29udGVzdElkKT8ucGFydGljaXBhbnRzO1xuICAgICAgICAgICAgICAgICAgICBieU5hbWUgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgeyBuaWNrbmFtZSwgaWRfbWVtYmVyIH0gb2YgT2JqZWN0LnZhbHVlcyhwYXJ0aWNpcGFudHMgfHwge30pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuaWNrbmFtZUtleSA9IFN0cmluZyhuaWNrbmFtZSA/PyAnJykudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFuaWNrbmFtZUtleSB8fCAhL15bMS05XVxcZCokLy50ZXN0KFN0cmluZyhpZF9tZW1iZXIpKSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYnlOYW1lLmdldChuaWNrbmFtZUtleSkgfHwgbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVzLmFkZChTdHJpbmcoaWRfbWVtYmVyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBieU5hbWUuc2V0KG5pY2tuYW1lS2V5LCBtYXRjaGVzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBieUNvbnRlc3Quc2V0KGNvbnRlc3RJZCwgYnlOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGJ5TmFtZS5nZXQoKG5hbWUudGV4dENvbnRlbnQgPz8gJycpLnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMgJiYgIW1hdGNoZXMuaGFzKGlkID8/ICcnKSkgaWQgPSBtYXRjaGVzLnNpemUgPT09IDEgPyBtYXRjaGVzLnZhbHVlcygpLm5leHQoKS52YWx1ZSA6IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQgJiYgL15bMS05XVxcZCokLy50ZXN0KGlkKSkgbmFtZXMuc2V0KG5hbWUsIGlkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmFtZXM7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KHRoaXMucm9vdFNlbGVjdG9yKTtcbiAgICAgICAgdGhpcy5yb290ID0gcm9vdDtcbiAgICAgICAgY29uc3QgY29udGVzdHMgPSB0aGlzLmluTGVhZ3VlID8gW10gOiBbXG4gICAgICAgICAgICAuLi5PYmplY3QudmFsdWVzKHdpbmRvdy5jb250ZXN0cz8uYWN0aXZlID8/IHt9KSxcbiAgICAgICAgICAgIC4uLk9iamVjdC52YWx1ZXMod2luZG93LmNvbnRlc3RzPy5maW5pc2hlZCA/PyB7fSlcbiAgICAgICAgXS5maWx0ZXIoY29udGVzdCA9PiBjb250ZXN0Py5pZF9jb250ZXN0ICE9IG51bGwpO1xuICAgICAgICBjb25zdCBuYW1lcyA9ICFyb290ID8gbmV3IE1hcDxIVE1MRWxlbWVudCwgc3RyaW5nPigpIDogdGhpcy5pbkxlYWd1ZVxuICAgICAgICAgICAgPyBuZXcgTWFwKEFycmF5LmZyb20ocm9vdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLm5pY2tuYW1lW2lkLW1lbWJlcl0nKSwgbmFtZSA9PiBbbmFtZSwgbmFtZS5nZXRBdHRyaWJ1dGUoJ2lkLW1lbWJlcicpXSBhcyBjb25zdClcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIHJlYWRvbmx5IFtIVE1MRWxlbWVudCwgc3RyaW5nXSA9PiAhIWVudHJ5WzFdICYmIC9eWzEtOV1cXGQqJC8udGVzdChlbnRyeVsxXSkpKVxuICAgICAgICAgICAgOiB0aGlzLmdldENvbnRlc3ROYW1lcyhyb290LCBjb250ZXN0cyk7XG5cbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMubmFtZXMua2V5cygpKSB7XG4gICAgICAgICAgICBpZiAobmFtZXMuaGFzKG5hbWUpKSBjb250aW51ZTtcbiAgICAgICAgICAgIGRlbGV0ZSBuYW1lLmRhdGFzZXQuamFydmlzUGxheWVyO1xuICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5uYW1lcyA9IG5hbWVzO1xuICAgICAgICBpZiAoIXJvb3QpIHJldHVybjtcbiAgICAgICAgY29uc3QgbWFya3MgPSB0aGlzLnJlYWRNYXJrcygpO1xuICAgICAgICBjb25zdCBzYXZlZE5hbWVzID0gdGhpcy5yZWFkU2F2ZWROYW1lcygpO1xuICAgICAgICBjb25zdCByb3N0ZXJOYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBsZXQgbmFtZXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHJlbWVtYmVyTmFtZSA9IChpZDogc3RyaW5nLCB0ZXh0Pzogc3RyaW5nIHwgbnVsbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGlzcGxheU5hbWUgPSB0eXBlb2YgdGV4dCA9PT0gJ3N0cmluZycgPyB0ZXh0LnRyaW0oKSA6ICcnO1xuICAgICAgICAgICAgaWYgKCFkaXNwbGF5TmFtZSB8fCAobWFya3NbaWRdICE9PSAnZnJpZW5kJyAmJiBtYXJrc1tpZF0gIT09ICdmb2UnKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKHNhdmVkTmFtZXNbaWRdICE9PSBkaXNwbGF5TmFtZSkge1xuICAgICAgICAgICAgICAgIHNhdmVkTmFtZXNbaWRdID0gZGlzcGxheU5hbWU7XG4gICAgICAgICAgICAgICAgbmFtZXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5pbkxlYWd1ZSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IHBsYXllciwgbmlja25hbWUgfSBvZiB3aW5kb3cub3Bwb25lbnRzX2xpc3QgPz8gW10pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IFN0cmluZyhwbGF5ZXI/LmlkX2ZpZ2h0ZXIpO1xuICAgICAgICAgICAgICAgIGlmIChyZW1lbWJlck5hbWUoaWQsIG5pY2tuYW1lKSkgcm9zdGVyTmFtZXMuYWRkKGlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFByZWZlciB0aGUgYWN0aXZlIHJvc3RlciBpZiBhIHBsYXllciBhcHBlYXJzIGluIGJvdGggb2xkIGFuZCBjdXJyZW50IGNvbnRlc3RzLlxuICAgICAgICAgICAgZm9yIChjb25zdCBjb250ZXN0IG9mIGNvbnRlc3RzKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IGlkX21lbWJlciwgbmlja25hbWUgfSBvZiBPYmplY3QudmFsdWVzKGNvbnRlc3QucGFydGljaXBhbnRzID8/IHt9KSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZCA9IFN0cmluZyhpZF9tZW1iZXIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJvc3Rlck5hbWVzLmhhcyhpZCkgJiYgcmVtZW1iZXJOYW1lKGlkLCBuaWNrbmFtZSkpIHJvc3Rlck5hbWVzLmFkZChpZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbG9ycyA9IHRoaXMucmVhZENvbG9ycygpO1xuICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCBjb2xvcl0gb2YgT2JqZWN0LmVudHJpZXMoY29sb3JzKSkge1xuICAgICAgICAgICAgY29uc3QgcHJvcGVydHkgPSAnLS1qYXJ2aXMtJyArIG1hcmsgKyAnLWNvbG9yJztcbiAgICAgICAgICAgIGlmIChyb290LnN0eWxlLmdldFByb3BlcnR5VmFsdWUocHJvcGVydHkpICE9PSBjb2xvcikgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgY29sb3IpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIGlkXSBvZiBuYW1lcykge1xuICAgICAgICAgICAgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNQbGF5ZXIgIT09IGlkKSBuYW1lLmRhdGFzZXQuamFydmlzUGxheWVyID0gaWQ7XG4gICAgICAgICAgICBjb25zdCBtYXJrID0gbWFya3NbaWRdO1xuICAgICAgICAgICAgaWYgKG1hcmsgPT09ICdmcmllbmQnIHx8IG1hcmsgPT09ICdmb2UnKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrICE9PSBtYXJrKSBuYW1lLmRhdGFzZXQuamFydmlzTWFyayA9IG1hcms7XG4gICAgICAgICAgICAgICAgaWYgKCFyb3N0ZXJOYW1lcy5oYXMoaWQpKSByZW1lbWJlck5hbWUoaWQsIG5hbWUudGV4dENvbnRlbnQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuYW1lLmRhdGFzZXQuamFydmlzTWFyaykge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBuYW1lLmRhdGFzZXQuamFydmlzTWFyaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZXNDaGFuZ2VkKSB0aGlzLnNhdmVOYW1lcyhzYXZlZE5hbWVzKTtcbiAgICB9XG5cbiAgICBhcHBseU1hcmsoaWQ6IHN0cmluZywgbWFyazogTWFyaykge1xuICAgICAgICBjb25zdCBtYXJrcyA9IHRoaXMucmVhZE1hcmtzKCk7XG4gICAgICAgIG1hcmtzW2lkXSA9IG1hcms7XG5cbiAgICAgICAgaWYgKHRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtzJywgbWFya3MpKSB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBoYW5kbGVNYXJrTWVudShldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSAmJiB0aGlzLm1hcmtNZW51Py5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm47XG4gICAgICAgIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuICAgICAgICBpZiAoZXZlbnQudHlwZSAhPT0gJ2NvbnRleHRtZW51JyAmJiAhZXZlbnQuYWx0S2V5KSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgbmFtZSA9IGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgPyBldmVudC50YXJnZXQuY2xvc2VzdDxIVE1MRWxlbWVudD4oJ1tkYXRhLWphcnZpcy1wbGF5ZXJdJykgOiBudWxsO1xuICAgICAgICBpZiAoIW5hbWUpIHJldHVybjtcbiAgICAgICAgY29uc3QgaWQgPSB0aGlzLm5hbWVzLmdldChuYW1lKTtcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLm9wZW5NYXJrTWVudShldmVudCwgbmFtZSwgaWQpO1xuICAgIH1cblxuICAgIHJ1bih7IGxlYWd1ZSwgY29udGVzdHMgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHRoaXMuaW5MZWFndWUgPSBjdXJyZW50UGFnZSA9PT0gJy9sZWFndWVzLmh0bWwnO1xuICAgICAgICBpZiAodGhpcy5pbkxlYWd1ZSA/ICFsZWFndWUgOiAhY29udGVzdHMpIHJldHVybjtcblxuICAgICAgICB0aGlzLnJvb3RTZWxlY3RvciA9IHRoaXMuaW5MZWFndWUgPyAnLmxlYWd1ZV90YWJsZScgOiAnI2NvbnRlc3RzIC5yaWdodF9wYXJ0JztcbiAgICAgICAgY29uc3QgaGFuZGxlTWFya01lbnUgPSAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHRoaXMuaGFuZGxlTWFya01lbnUoZXZlbnQpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZU1hcmtNZW51LCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBoYW5kbGVNYXJrTWVudSwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5ICE9PSAnRXNjYXBlJyB8fCAhdGhpcy5tYXJrTWVudSkgcmV0dXJuO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmICghZXZlbnQua2V5IHx8IFsnUGxheWVyTWFya3MnLCAnUGxheWVyTWFya0NvbG9ycycsICdGcmllbmRMaXN0JywgJ0ZvZUxpc3QnXVxuICAgICAgICAgICAgICAgIC5zb21lKGtleSA9PiBldmVudC5rZXkgPT09IExTX0NPTkZJR19OQU1FICsga2V5KSkgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobXV0YXRpb25zID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMucm9vdFNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChyb290ICE9PSB0aGlzLnJvb3QgfHwgKHJvb3QgJiYgbXV0YXRpb25zLnNvbWUoKHsgdGFyZ2V0IH0pID0+IHJvb3QuY29udGFpbnModGFyZ2V0KSkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgIGNoYXJhY3RlckRhdGE6IHRydWUsXG4gICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydzb3J0aW5nX2lkJywgJ2lkLW1lbWJlcicsICdpZF9jb250ZXN0J11cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgbHNHZXQsIGxzU2V0IH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5cbmV4cG9ydCB0eXBlIENvbnRlc3RLaW5kID0gJ2RhaWx5JyB8ICdldmVudCc7XG5leHBvcnQgdHlwZSBDb250ZXN0UmFuayA9ICd0b3AnIHwgJ21pbmUnO1xuXG5jb25zdCBDT05URVNUX0tJTkRTID0gW1snZGFpbHknLCAnRGFpbHknXSwgWydldmVudCcsICdFdmVudCddXSBhcyBjb25zdDtcbmNvbnN0IENPTlRFU1RfUkFOS1MgPSBbWyd0b3AnLCAnVG9wJ10sIFsnbWluZScsICdNeSByYW5rJ11dIGFzIGNvbnN0O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVhZENvbnRlc3RTZXR0aW5nKGtleTogc3RyaW5nKTogdW5rbm93biB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGxzR2V0KGtleSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRDb250ZXN0RGVmYXVsdHMoKSB7XG4gICAgY29uc3Qga2luZDogQ29udGVzdEtpbmQgPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RLaW5kJykgPT09ICdldmVudCcgPyAnZXZlbnQnIDogJ2RhaWx5JztcbiAgICBjb25zdCByYW5rOiBDb250ZXN0UmFuayA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdFJhbmtTdGFydCcpID09PSAnbWluZScgPyAnbWluZScgOiAndG9wJztcbiAgICByZXR1cm4geyBraW5kLCByYW5rIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkUGlubmVkUmFuayhpZDogc3RyaW5nLCBmYWxsYmFjazogQ29udGVzdFJhbmspOiBDb250ZXN0UmFuayB7XG4gICAgY29uc3Qgc2F2ZWQgPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RQaW5uZWRSYW5rJyk7XG4gICAgaWYgKHNhdmVkICYmIHR5cGVvZiBzYXZlZCA9PT0gJ29iamVjdCcgJiYgJ2lkJyBpbiBzYXZlZCAmJiBzYXZlZC5pZCA9PT0gaWQgJiYgJ3JhbmsnIGluIHNhdmVkKSB7XG4gICAgICAgIGlmIChzYXZlZC5yYW5rID09PSAnbWluZScgfHwgc2F2ZWQucmFuayA9PT0gJ3RvcCcpIHJldHVybiBzYXZlZC5yYW5rO1xuICAgIH1cbiAgICByZXR1cm4gZmFsbGJhY2s7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlUmFua0Nob2ljZShsYWJlbDogc3RyaW5nLCBzZWxlY3Q6IChyYW5rOiBDb250ZXN0UmFuaykgPT4gdm9pZCkge1xuICAgIHJldHVybiBtYWtlQ2hvaWNlKGxhYmVsLCBDT05URVNUX1JBTktTLCBzZWxlY3QpO1xufVxuXG5mdW5jdGlvbiBtYWtlQ2hvaWNlPFQgZXh0ZW5kcyBzdHJpbmc+KGxhYmVsOiBzdHJpbmcsIG9wdGlvbnM6IFJlYWRvbmx5QXJyYXk8cmVhZG9ubHkgW1QsIHN0cmluZ10+LCBzZWxlY3Q6ICh2YWx1ZTogVCkgPT4gdm9pZCkge1xuICAgIGNvbnN0IGdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGdyb3VwLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY29udGVzdC1jaG9pY2UnO1xuICAgIGdyb3VwLnNldEF0dHJpYnV0ZSgncm9sZScsICdncm91cCcpO1xuICAgIGdyb3VwLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGxhYmVsKTtcbiAgICBncm91cC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZlbnQgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpO1xuICAgIGZvciAoY29uc3QgW3ZhbHVlLCB0ZXh0XSBvZiBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICBidXR0b24uZGF0YXNldC5jb250ZXN0Q2hvaWNlID0gdmFsdWU7XG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgc2VsZWN0KHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGdyb3VwLmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgfVxuICAgIHJldHVybiBncm91cDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdENvbnRlc3RDaG9pY2UoZ3JvdXA6IEhUTUxFbGVtZW50LCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgZm9yIChjb25zdCBidXR0b24gb2YgZ3JvdXAucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJykpIHtcbiAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgU3RyaW5nKGJ1dHRvbi5kYXRhc2V0LmNvbnRlc3RDaG9pY2UgPT09IHZhbHVlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbENvbnRlc3RTZXR0aW5ncygpIHtcbiAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmdbcmVsPVwiSkFSVklTX2NvbnRlc3RTdGFydFwiXSc7XG4gICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIGlmICghY2FyZCB8fCBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXMtY29udGVzdC1zZXR0aW5ncycpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZmllbGRzZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmaWVsZHNldCcpO1xuICAgICAgICBmaWVsZHNldC5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3Qtc2V0dGluZ3MnO1xuICAgICAgICBmaWVsZHNldC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnQ29udGVzdCBzdGFydHVwIGRlZmF1bHRzJyk7XG4gICAgICAgIGNvbnN0IHNhdmUgPSAoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGdyb3VwOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsc1NldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGdyb3VwLCB2YWx1ZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB0aGUgY29udGVzdCBkZWZhdWx0OicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGtpbmRzID0gbWFrZUNob2ljZSgnUHJlZmVycmVkIGNvbnRlc3QnLCBDT05URVNUX0tJTkRTLCB2YWx1ZSA9PiBzYXZlKCdDb250ZXN0S2luZCcsIHZhbHVlLCBraW5kcykpO1xuICAgICAgICBjb25zdCByYW5rcyA9IG1ha2VSYW5rQ2hvaWNlKCdEZWZhdWx0IGxlYWRlcmJvYXJkIHBvc2l0aW9uJywgdmFsdWUgPT4gc2F2ZSgnQ29udGVzdFJhbmtTdGFydCcsIHZhbHVlLCByYW5rcykpO1xuICAgICAgICBjb25zdCBkZWZhdWx0cyA9IHJlYWRDb250ZXN0RGVmYXVsdHMoKTtcbiAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShraW5kcywgZGVmYXVsdHMua2luZCk7XG4gICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2UocmFua3MsIGRlZmF1bHRzLnJhbmspO1xuXG4gICAgICAgIGNvbnN0IGtpbmRMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBraW5kTGFiZWwuaW5uZXJIVE1MID0gc2V0dGluZ0hlbHAoJ1ByZWZlcnJlZCBjb250ZXN0JywgJ0RhaWx5IG9wZW5zIHRoZSBmaXJzdCBhY3RpdmUgZGFpbHkgY29udGVzdC4gRXZlbnQgb3BlbnMgdGhlIGxhc3QgYWN0aXZlIGV2ZW50IGNvbnRlc3QsIG9yIHRoZSBkYWlseSBjb250ZXN0IGlmIHRoZXJlIGlzIG5vIGV2ZW50LicpO1xuICAgICAgICBjb25zdCByYW5rTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcmFua0xhYmVsLmlubmVySFRNTCA9IHNldHRpbmdIZWxwKCdMZWFkZXJib2FyZCBzdGFydCcsICdPcGVuIGF0IHRoZSB0b3Agb3IgYXQgeW91ciByYW5rLiBBIHN0YXJyZWQgY29udGVzdCBjYW4gaGF2ZSBpdHMgb3duIHBvc2l0aW9uLicpO1xuICAgICAgICBmaWVsZHNldC5hcHBlbmQoa2luZExhYmVsLCBraW5kcywgcmFua0xhYmVsLCByYW5rcyk7XG4gICAgICAgIGNvbnN0IHJlZnJlc2hFbmFibGVkID0gKCkgPT4gZmllbGRzZXQuZGlzYWJsZWQgPSAhY2FyZC5jbGFzc0xpc3QuY29udGFpbnMoJ2VuYWJsZWQnKTtcbiAgICAgICAgcmVmcmVzaEVuYWJsZWQoKTtcbiAgICAgICAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIocmVmcmVzaEVuYWJsZWQpLm9ic2VydmUoY2FyZCwgeyBhdHRyaWJ1dGVGaWx0ZXI6IFsnY2xhc3MnXSB9KTtcbiAgICAgICAgY2FyZC5hcHBlbmRDaGlsZChmaWVsZHNldCk7XG4gICAgfSk7XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyAkLCBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgbHNHZXQsIGxzU2V0LCBsc1JtIH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5pbXBvcnQgeyBtYWtlUmFua0Nob2ljZSwgcmVhZENvbnRlc3REZWZhdWx0cywgcmVhZENvbnRlc3RTZXR0aW5nLCByZWFkUGlubmVkUmFuaywgc2VsZWN0Q29udGVzdENob2ljZSwgdHlwZSBDb250ZXN0S2luZCB9IGZyb20gJy4vY29udGVzdFByZWZlcmVuY2VzJztcblxuaW50ZXJmYWNlIENvbnRlc3RDYXJkIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIGNhcmQ6IEhUTUxFbGVtZW50O1xuICAgIGhlYWRlcjogSFRNTEVsZW1lbnQ7XG4gICAgdGl0bGU6IEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIGtpbmQ6IENvbnRlc3RLaW5kIHwgbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFybUNvbnRlc3RTdGFydHVwR3VhcmQoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lICE9PSAnL2FjdGl2aXRpZXMuaHRtbCcgfHwgbmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpLmdldCgndGFiJykgIT09ICdjb250ZXN0cycpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIGlmIChKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdISFBsdXNQbHVzQ29uZmlnJykgPz8gJ251bGwnKT8uSkFSVklTX2NvbnRlc3RTdGFydCA9PT0gZmFsc2UpIHJldHVybjtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEtlZXAgYm90aCBwYW5lcyBvdXQgb2YgdmlldyB1bnRpbCB0aGUgY2hvc2VuIGNvbnRlc3QgYW5kIGl0cyBsZWFkZXJib2FyZCBhcmUgcG9zaXRpb25lZC5cbiAgICBjb25zdCBndWFyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgZ3VhcmQuaWQgPSAnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCc7XG4gICAgZ3VhcmQudGV4dENvbnRlbnQgPSBgXG4gICAgICAgICNjb250ZXN0cyAubGVmdF9wYXJ0IC5zY3JvbGxfYXJlYSxcbiAgICAgICAgI2NvbnRlc3RzIC5yaWdodF9wYXJ0IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDAgIWltcG9ydGFudDtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IG5vbmUgIWltcG9ydGFudDtcbiAgICAgICAgICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgICAgICB9XG4gICAgYDtcbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgaWYgKCFkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHJldHVybjtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKGd1YXJkKTtcbiAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH0pO1xuICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChndWFyZCk7XG4gICAgZWxzZSBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LCB7IGNoaWxkTGlzdDogdHJ1ZSB9KTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgIGd1YXJkLnJlbW92ZSgpO1xuICAgIH0sIDQwMDApO1xufVxuXG5leHBvcnQgY2xhc3MgQ29udGVzdFN0YXJ0IGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgcHJlZmVyZW5jZSA9ICcnO1xuICAgIHByaXZhdGUgc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICBwcml2YXRlIGRlZmF1bHRzID0gcmVhZENvbnRlc3REZWZhdWx0cygpO1xuICAgIHByaXZhdGUgbGlzdDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJpZ2h0OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmVzdG9yaW5nQ2FyZDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJlcG9zaXRpb246ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc3RvcEp1bXA6ICgoZmluaXNoPzogYm9vbGVhbikgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIG9ic2VydmVyOiBNdXRhdGlvbk9ic2VydmVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBsaXN0ZW5lcnM6IEFib3J0Q29udHJvbGxlciB8IG51bGwgPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnY29udGVzdFN0YXJ0J1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkNvbnRlc3Qgc3RhcnR1cFwiLCBcIk9wZW4gdGhlIHByZWZlcnJlZCBjb250ZXN0IGFuZCBsZWFkZXJib2FyZCBwb3NpdGlvbiBvbiBsb2FkLiBBIHN0YXJyZWQgY29udGVzdCB0YWtlcyBwcmlvcml0eS5cIilcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7IG5hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYSB9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZSA9PT0gJy9hY3Rpdml0aWVzLmh0bWwnO1xuICAgIH1cblxuICAgIGdldENvbnRlc3RzKGxpc3Q6IEhUTUxFbGVtZW50LCBmaW5pc2hlZDogUmVhZG9ubHlTZXQ8c3RyaW5nPik6IENvbnRlc3RDYXJkW10ge1xuICAgICAgICBjb25zdCBhY3RpdmUgPSBuZXcgTWFwKE9iamVjdC52YWx1ZXMod2luZG93LmNvbnRlc3RzPy5hY3RpdmUgfHwge30pXG4gICAgICAgICAgICAuZmlsdGVyKGNvbnRlc3QgPT4gY29udGVzdD8uaWRfY29udGVzdCAhPSBudWxsKVxuICAgICAgICAgICAgLm1hcChjb250ZXN0ID0+IFtTdHJpbmcoY29udGVzdC5pZF9jb250ZXN0KSwgY29udGVzdF0pKTtcblxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShsaXN0LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcuY29udGVzdFtpZF9jb250ZXN0XScpKS5mbGF0TWFwKGNhcmQgPT4ge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBjYXJkLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKCFpZCkgcmV0dXJuIFtdO1xuICAgICAgICAgICAgY29uc3QgY29udGVzdCA9IGFjdGl2ZS5nZXQoaWQpO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVyID0gY2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmNvbnRlc3RfaGVhZGVyJyk7XG4gICAgICAgICAgICBpZiAoIWhlYWRlciB8fCBmaW5pc2hlZC5oYXMoaWQpKSByZXR1cm4gW107XG4gICAgICAgICAgICBpZiAoIWNvbnRlc3QgJiYgIWhlYWRlci5tYXRjaGVzKCcuaW5fcHJvZ3Jlc3MnKSkgcmV0dXJuIFtdO1xuXG4gICAgICAgICAgICBjb25zdCB0aXRsZSA9IGhlYWRlci5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmNvbnRlc3RfdGl0bGUsIC5jb250ZXN0X25hbWUsIGgzLCBoNCwgaDUnKTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSB0aXRsZSAmJiBBcnJheS5mcm9tKHRpdGxlLmNoaWxkTm9kZXMpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihub2RlID0+ICEobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHx8ICFub2RlLm1hdGNoZXMoJy5qYXJ2aXMtY29udGVzdC1waW4sIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JykpXG4gICAgICAgICAgICAgICAgLm1hcChub2RlID0+IG5vZGUudGV4dENvbnRlbnQpLmpvaW4oJycpLnRyaW0oKTtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIGlkLCBjYXJkLCBoZWFkZXIsIHRpdGxlLFxuICAgICAgICAgICAgICAgIGtpbmQ6IGNvbnRlc3Q/LmNhdGVnb3J5X3R5cGUgPyAoY29udGVzdC5jYXRlZ29yeV90eXBlID09PSAnZGFpbHknID8gJ2RhaWx5JyA6ICdldmVudCcpIDogbnVsbCxcbiAgICAgICAgICAgICAgICBsYWJlbDogU3RyaW5nKG5hbWUgfHwgY29udGVzdD8ubmFtZSB8fCBjb250ZXN0Py50aXRsZSB8fFxuICAgICAgICAgICAgICAgICAgICAoY29udGVzdD8uY2F0ZWdvcnlfdHlwZSA9PT0gJ2RhaWx5JyA/ICdEYWlseSBjb250ZXN0JyA6ICdDb250ZXN0JykpLnRyaW0oKVxuICAgICAgICAgICAgfV07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFRhcmdldChjb250ZXN0czogQ29udGVzdENhcmRbXSkge1xuICAgICAgICBpZiAodGhpcy5wcmVmZXJlbmNlKSByZXR1cm4gY29udGVzdHMuZmluZChjb250ZXN0ID0+IGNvbnRlc3QuaWQgPT09IHRoaXMucHJlZmVyZW5jZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuZGVmYXVsdHMua2luZCA9PT0gJ2V2ZW50Jykge1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBbLi4uY29udGVzdHNdLnJldmVyc2UoKS5maW5kKGNvbnRlc3QgPT4gY29udGVzdC5raW5kID09PSAnZXZlbnQnKTtcbiAgICAgICAgICAgIGlmIChldmVudCkgcmV0dXJuIGV2ZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb250ZXN0cy5maW5kKGNvbnRlc3QgPT4gY29udGVzdC5raW5kID09PSAnZGFpbHknKSA/P1xuICAgICAgICAgICAgY29udGVzdHMuZmluZChjb250ZXN0ID0+IGNvbnRlc3Qua2luZCA9PT0gbnVsbCkgPz8gY29udGVzdHNbMF07XG4gICAgfVxuXG4gICAgY2xlYXJFeHBpcmVkUGluKGxpc3Q6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdENhcmRbXSwgZmluaXNoZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz4pIHtcbiAgICAgICAgaWYgKCF0aGlzLnByZWZlcmVuY2UgfHwgY29udGVzdHMuc29tZSgoeyBpZCB9KSA9PiBpZCA9PT0gdGhpcy5wcmVmZXJlbmNlKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IHdpbmRvdy5jb250ZXN0cz8uYWN0aXZlO1xuICAgICAgICBjb25zdCBtaXNzaW5nID0gZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyAmJiBsaXN0LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZXN0X2hlYWRlcicpICYmXG4gICAgICAgICAgICBhY3RpdmUgJiYgIU9iamVjdC52YWx1ZXMoYWN0aXZlKS5zb21lKGNvbnRlc3QgPT4gU3RyaW5nKGNvbnRlc3Q/LmlkX2NvbnRlc3QpID09PSB0aGlzLnByZWZlcmVuY2UpO1xuICAgICAgICBpZiAoIWZpbmlzaGVkLmhhcyh0aGlzLnByZWZlcmVuY2UpICYmICFtaXNzaW5nKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZXhwaXJlZElkID0gdGhpcy5wcmVmZXJlbmNlO1xuICAgICAgICB0aGlzLnByZWZlcmVuY2UgPSAnJztcbiAgICAgICAgdGhpcy5zdG9wSnVtcD8uKGZhbHNlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChTdHJpbmcobHNHZXQoJ0NvbnRlc3RTdGFydElkJykpID09PSBleHBpcmVkSWQpIGxzUm0oJ0NvbnRlc3RTdGFydElkJyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IGNsZWFyIHRoZSBleHBpcmVkIGNvbnRlc3QgcHJlZmVyZW5jZTonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlUGlucyhsaXN0OiBIVE1MRWxlbWVudCwgY29udGVzdHM6IENvbnRlc3RDYXJkW10pIHtcbiAgICAgICAgY29uc3QgaG9zdHMgPSBuZXcgU2V0KGNvbnRlc3RzLm1hcCgoeyB0aXRsZSwgaGVhZGVyIH0pID0+IHRpdGxlIHx8IGhlYWRlcikpO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbnRyb2wgb2YgbGlzdC5xdWVyeVNlbGVjdG9yQWxsKCcuamFydmlzLWNvbnRlc3QtcGluLCAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpKSB7XG4gICAgICAgICAgICBpZiAoIWNvbnRyb2wucGFyZW50RWxlbWVudCB8fCAhaG9zdHMuaGFzKGNvbnRyb2wucGFyZW50RWxlbWVudCkpIGNvbnRyb2wucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IHsgaWQsIHRpdGxlLCBoZWFkZXIsIGxhYmVsIH0gb2YgY29udGVzdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGhvc3QgPSB0aXRsZSB8fCBoZWFkZXI7XG4gICAgICAgICAgICBsZXQgcGluID0gaG9zdC5xdWVyeVNlbGVjdG9yPEhUTUxCdXR0b25FbGVtZW50PignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXBpbicpO1xuICAgICAgICAgICAgaWYgKCFwaW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgICAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3QtcGluJztcbiAgICAgICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXN0SWQgPSBidXR0b24uY2xvc2VzdCgnLmNvbnRlc3RbaWRfY29udGVzdF0nKT8uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29udGVzdElkKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMucHJlZmVyZW5jZSA9PT0gY29udGVzdElkID8gJycgOiBjb250ZXN0SWQ7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCkgbHNTZXQoJ0NvbnRlc3RTdGFydElkJywgbmV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGxzUm0oJ0NvbnRlc3RTdGFydElkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByZWZlcmVuY2UgPSBuZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFydHVwUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9wSnVtcD8uKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGNvbnRlc3QgcHJlZmVyZW5jZTonLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHBpbiA9IGhvc3QuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBpbm5lZCA9IHRoaXMucHJlZmVyZW5jZSA9PT0gaWQ7XG4gICAgICAgICAgICBwaW4uc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBTdHJpbmcocGlubmVkKSk7XG4gICAgICAgICAgICBwaW4uc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgcGlubmVkID8gYFVucGluICR7bGFiZWx9YCA6IGBQaW4gJHtsYWJlbH0gdG8gb3BlbiBvbiByZWxvYWRgKTtcbiAgICAgICAgICAgIHBpbi50aXRsZSA9IHBpbm5lZCA/ICdQaW5uZWQuIENsaWNrIHRvIHVzZSB5b3VyIGNvbnRlc3QgZGVmYXVsdHMuJyA6ICdPcGVuIHRoaXMgY29udGVzdCB3aGVuIHRoZSBwYWdlIHJlbG9hZHMnO1xuXG4gICAgICAgICAgICBsZXQgcG9zaXRpb24gPSBob3N0LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCc6c2NvcGUgPiAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpO1xuICAgICAgICAgICAgaWYgKCFwaW5uZWQpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbj8ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hvaWNlID0gbWFrZVJhbmtDaG9pY2UoJ1Bpbm5lZCBsZWFkZXJib2FyZCBzdGFydCcsIHJhbmsgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbHNTZXQoJ0NvbnRlc3RQaW5uZWRSYW5rJywgeyBpZCwgcmFuayB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2UoY2hvaWNlLCByYW5rKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB0aGUgbGVhZGVyYm9hcmQgcG9zaXRpb246JywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNob2ljZS5jbGFzc0xpc3QuYWRkKCdqYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgcGluLmFmdGVyKGNob2ljZSk7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSBjaG9pY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKHBvc2l0aW9uLCByZWFkUGlubmVkUmFuayhpZCwgdGhpcy5kZWZhdWx0cy5yYW5rKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0OiBIVE1MRWxlbWVudCwgcmlnaHQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkID0gbGlzdC5xdWVyeVNlbGVjdG9yKCcuY29udGVzdF9oZWFkZXJfYWN0aXZlJyk/LmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk7XG4gICAgICAgIGlmIChzZWxlY3RlZCkgcmV0dXJuIHNlbGVjdGVkLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuXG4gICAgICAgIGNvbnN0IHBhbmVscyA9IEFycmF5LmZyb20ocmlnaHQucXVlcnlTZWxlY3RvckFsbCgnLnJhbmtpbmdbaWRfY29udGVzdF0nKSlcbiAgICAgICAgICAgIC5maWx0ZXIocGFuZWwgPT4gcGFuZWwuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggJiYgZ2V0Q29tcHV0ZWRTdHlsZShwYW5lbCkudmlzaWJpbGl0eSA9PT0gJ3Zpc2libGUnKTtcbiAgICAgICAgcmV0dXJuIHBhbmVscy5sZW5ndGggPT09IDEgPyBwYW5lbHNbMF0uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0JykgOiBudWxsO1xuICAgIH1cblxuICAgIHNob3dMZWFkZXJib2FyZChyaWdodDogSFRNTEVsZW1lbnQsIGNvbnRlc3RJZDogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgICBpZiAoIWNvbnRlc3RJZCkge1xuICAgICAgICAgICAgcmlnaHQucXVlcnlTZWxlY3RvckFsbCgnLmphcnZpcy1jb250ZXN0LW90aGVyJykuZm9yRWFjaChwYW5lbCA9PiBwYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1vdGhlcicpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBhbmVsIG9mIHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYW5raW5nW2lkX2NvbnRlc3RdJykpIHtcbiAgICAgICAgICAgIHBhbmVsLmNsYXNzTGlzdC50b2dnbGUoJ2phcnZpcy1jb250ZXN0LW90aGVyJywgcGFuZWwuZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0JykgIT09IGNvbnRlc3RJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRPd25Sb3coYm9hcmQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IG93biA9IGJvYXJkLnF1ZXJ5U2VsZWN0b3IoJy5sZWFkVGFibGUgdHIubGVhZF90YWJsZV9kZWZhdWx0Jyk7XG4gICAgICAgIGlmIChvd24pIHJldHVybiBvd247XG5cbiAgICAgICAgY29uc3QgaGVyb0lkID0gKHdpbmRvdy5zaGFyZWQ/Lkhlcm8gfHwgd2luZG93Lkhlcm8pPy5pbmZvcz8uaWQ7XG4gICAgICAgIGlmIChoZXJvSWQgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oYm9hcmQucXVlcnlTZWxlY3RvckFsbCgnLmxlYWRUYWJsZSB0cltzb3J0aW5nX2lkXScpKVxuICAgICAgICAgICAgLmZpbmQocm93ID0+IHJvdy5nZXRBdHRyaWJ1dGUoJ3NvcnRpbmdfaWQnKSA9PT0gU3RyaW5nKGhlcm9JZCkpO1xuICAgIH1cblxuICAgIGxvY2tTY3JvbGwoc2Nyb2xsZXI6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgICQoc2Nyb2xsZXIpLnN0b3AodHJ1ZSwgZmFsc2UpO1xuICAgICAgICAvLyBUaGUgZ2FtZSBjYW4gc3RhcnQgYW5vdGhlciBqUXVlcnkgdHdlZW4gYWZ0ZXIgbG9hZC4gQmxvY2sgaXRzIHdyaXRlcyBvbiB0aGlzIHBhbmUgb25seS5cbiAgICAgICAgY29uc3QgaWdub3JlU2Nyb2xsID0gKCkgPT4ge307XG4gICAgICAgIGNvbnN0IGdldCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsICdzY3JvbGxUb3AnKT8uZ2V0O1xuICAgICAgICBjb25zdCBkZXNjcmlwdG9ycyA9IE9iamVjdC5lbnRyaWVzKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogeyBnZXQsIHNldDogaWdub3JlU2Nyb2xsIH0sXG4gICAgICAgICAgICBzY3JvbGw6IHsgdmFsdWU6IGlnbm9yZVNjcm9sbCwgd3JpdGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHNjcm9sbFRvOiB7IHZhbHVlOiBpZ25vcmVTY3JvbGwsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICBzY3JvbGxCeTogeyB2YWx1ZTogaWdub3JlU2Nyb2xsLCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICAgIH0pLmZpbHRlcigoW2tleV0pID0+ICFPYmplY3QuaGFzT3duKHNjcm9sbGVyLCBrZXkpKTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCBkZXNjcmlwdG9yXSBvZiBkZXNjcmlwdG9ycykge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNjcm9sbGVyLCBrZXksIHsgLi4uZGVzY3JpcHRvciwgY29uZmlndXJhYmxlOiB0cnVlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICQoc2Nyb2xsZXIpLnN0b3AodHJ1ZSwgZmFsc2UpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCBkZXNjcmlwdG9yXSBvZiBkZXNjcmlwdG9ycykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNjcm9sbGVyLCBrZXkpO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICYmIGN1cnJlbnQudmFsdWUgPT09IGRlc2NyaXB0b3IudmFsdWUgJiYgY3VycmVudC5zZXQgPT09IGRlc2NyaXB0b3Iuc2V0KSBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHNjcm9sbGVyLCBrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGp1bXBUbyhzY3JvbGxlcjogSFRNTEVsZW1lbnQsIHRhcmdldDogRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQsIGNlbnRlciA9IGZhbHNlKSB7XG4gICAgICAgIGxldCB0b3AgPSAwO1xuICAgICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgICAgICBjb25zdCBib3VuZHMgPSBzY3JvbGxlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gYm91bmRzLmhlaWdodCAvIHNjcm9sbGVyLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgIGlmICghc2NhbGUpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIHRvcCA9IHNjcm9sbGVyLnNjcm9sbFRvcCArIChpdGVtLnRvcCAtIGJvdW5kcy50b3ApIC8gc2NhbGUgLSBzY3JvbGxlci5jbGllbnRUb3A7XG4gICAgICAgICAgICBpZiAoY2VudGVyKSB0b3AgLT0gKHNjcm9sbGVyLmNsaWVudEhlaWdodCAtIGl0ZW0uaGVpZ2h0IC8gc2NhbGUpIC8gMjtcbiAgICAgICAgfVxuICAgICAgICB0b3AgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihzY3JvbGxlci5zY3JvbGxIZWlnaHQgLSBzY3JvbGxlci5jbGllbnRIZWlnaHQsIHRvcCkpO1xuICAgICAgICBpZiAoTWF0aC5hYnModG9wIC0gc2Nyb2xsZXIuc2Nyb2xsVG9wKSA+PSAxKSB7XG4gICAgICAgICAgICBjb25zdCBzY3JvbGxUbyA9IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbFRvIGFzIChvcHRpb25zOiBTY3JvbGxUb09wdGlvbnMpID0+IHZvaWQ7XG4gICAgICAgICAgICBzY3JvbGxUby5jYWxsKHNjcm9sbGVyLCB7IHRvcCwgYmVoYXZpb3I6ICdpbnN0YW50JyB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9wZW5Db250ZXN0KGxpc3Q6IEhUTUxFbGVtZW50LCByaWdodDogSFRNTEVsZW1lbnQsIHsgaWQsIGNhcmQsIGhlYWRlciwgdGl0bGUgfTogQ29udGVzdENhcmQpIHtcbiAgICAgICAgZm9yIChjb25zdCBwYW5lIG9mIFtsaXN0LCByaWdodF0pIHBhbmUuY2xhc3NMaXN0LmFkZCgnamFydmlzLWNvbnRlc3QtaW5zdGFudCcsICdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgIGNvbnN0IHJhbmsgPSBpZCA9PT0gdGhpcy5wcmVmZXJlbmNlID8gcmVhZFBpbm5lZFJhbmsoaWQsIHRoaXMuZGVmYXVsdHMucmFuaykgOiB0aGlzLmRlZmF1bHRzLnJhbms7XG4gICAgICAgIGNvbnN0IHBsYWNlQXRPd25SYW5rID0gcmFuayA9PT0gJ21pbmUnO1xuICAgICAgICBjb25zdCByZWxlYXNlTGlzdCA9IHRoaXMubG9ja1Njcm9sbChsaXN0KTtcbiAgICAgICAgbGV0IGJvYXJkOiBIVE1MRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCByZWxlYXNlQm9hcmQ6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHBvc2l0aW9uZWQgPSBmYWxzZTtcbiAgICAgICAgbGV0IGxhc3RBdHRlbXB0OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgIGNvbnN0IGdldEJvYXJkID0gKCkgPT4gQXJyYXkuZnJvbShyaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcucmFua2luZ1tpZF9jb250ZXN0XScpKVxuICAgICAgICAgICAgLmZpbmQocGFuZWwgPT4gcGFuZWwuZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0JykgPT09IGlkKT8ucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5sZWFkX3RhYmxlX3ZpZXcnKTtcbiAgICAgICAgY29uc3QgdXBkYXRlQm9hcmQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gZ2V0Qm9hcmQoKTtcbiAgICAgICAgICAgIGlmIChib2FyZCA9PT0gbmV4dCkgcmV0dXJuO1xuICAgICAgICAgICAgcmVsZWFzZUJvYXJkPy4oKTtcbiAgICAgICAgICAgIGJvYXJkID0gbmV4dDtcbiAgICAgICAgICAgIHJlbGVhc2VCb2FyZCA9IGJvYXJkID8gdGhpcy5sb2NrU2Nyb2xsKGJvYXJkKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmV2ZWFsID0gKCkgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCBwYW5lIG9mIFtsaXN0LCByaWdodF0pIHBhbmUuY2xhc3NMaXN0LnJlbW92ZSgnamFydmlzLWNvbnRlc3QtbG9hZGluZycpO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlc3RvcmUgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWxpc3QuaXNDb25uZWN0ZWQgfHwgIXJpZ2h0LmlzQ29ubmVjdGVkIHx8ICFsaXN0LmNvbnRhaW5zKGNhcmQpKSByZXR1cm47XG5cbiAgICAgICAgICAgIHVwZGF0ZUJvYXJkKCk7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdCwgcmlnaHQpO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkICE9PSBpZCAmJiBzZWxlY3RlZCAhPT0gbGFzdEF0dGVtcHQpIHtcbiAgICAgICAgICAgICAgICBsYXN0QXR0ZW1wdCA9IHNlbGVjdGVkO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHJpZ2h0LCBudWxsKTtcbiAgICAgICAgICAgICAgICAodGl0bGUgfHwgaGVhZGVyKS5jbGljaygpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZUJvYXJkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWJvYXJkPy5jbGllbnRIZWlnaHQgfHwgdGhpcy5nZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0LCByaWdodCkgIT09IGlkIHx8XG4gICAgICAgICAgICAgICAgKHBsYWNlQXRPd25SYW5rICYmICFib2FyZC5xdWVyeVNlbGVjdG9yKCcubGVhZFRhYmxlJykpKSByZXR1cm47XG4gICAgICAgICAgICBsYXN0QXR0ZW1wdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHJpZ2h0LCBpZCk7XG4gICAgICAgICAgICB0aGlzLmp1bXBUbyhsaXN0LCBjYXJkKTtcbiAgICAgICAgICAgIHRoaXMuanVtcFRvKGJvYXJkLCBwbGFjZUF0T3duUmFuayA/IHRoaXMuZ2V0T3duUm93KGJvYXJkKSA6IG51bGwsIHBsYWNlQXRPd25SYW5rKTtcbiAgICAgICAgICAgIGlmICghcG9zaXRpb25lZCkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgcmV2ZWFsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ29ycmVjdCBicm93c2VyLWRyaXZlbiBtb3Zlcywgc3VjaCBhcyBzY3JvbGxJbnRvVmlldyBvbiBhIGxlYWRlcmJvYXJkIHJvdywgYmVmb3JlIHBhaW50LlxuICAgICAgICBjb25zdCBvblNjcm9sbCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IGxpc3QgfHwgZXZlbnQudGFyZ2V0ID09PSBib2FyZCkgcmVzdG9yZSgpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBpbnB1dEV2ZW50cyA9IFsncG9pbnRlcmRvd24nLCAndG91Y2hzdGFydCcsICd3aGVlbCcsICdjbGljayddO1xuICAgICAgICBjb25zdCBvbklucHV0ID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmlzVHJ1c3RlZCkgc3RvcCgpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzdG9wT25LZXkgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5pc1RydXN0ZWQgJiYgWydUYWInLCAnQXJyb3dVcCcsICdBcnJvd0Rvd24nLCAnUGFnZVVwJywgJ1BhZ2VEb3duJywgJ0hvbWUnLCAnRW5kJywgJ0VudGVyJywgJyAnXS5pbmNsdWRlcyhldmVudC5rZXkpKSBzdG9wKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGFmdGVyTG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIGxhc3RBdHRlbXB0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmVzdG9yZSgpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzdG9wID0gKGZpbmlzaCA9IHRydWUpID0+IHtcbiAgICAgICAgICAgIHJlbGVhc2VMaXN0KCk7XG4gICAgICAgICAgICByZWxlYXNlQm9hcmQ/LigpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBwYW5lIG9mIFtsaXN0LCByaWdodF0pIHtcbiAgICAgICAgICAgICAgICBwYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBwYW5lLmNsYXNzTGlzdC5yZW1vdmUoJ2phcnZpcy1jb250ZXN0LWluc3RhbnQnLCAnamFydmlzLWNvbnRlc3QtbG9hZGluZycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCBldmVudCBvZiBpbnB1dEV2ZW50cykgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgb25JbnB1dCwgdHJ1ZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc3RvcE9uS2V5LCB0cnVlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgYWZ0ZXJMb2FkKTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICB0aGlzLnN0b3BKdW1wID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucmVwb3NpdGlvbiA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnJlc3RvcmluZ0NhcmQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKGZpbmlzaCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXZlYWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KHN0b3AsIDQwMDApO1xuICAgICAgICB0aGlzLnN0b3BKdW1wID0gc3RvcDtcbiAgICAgICAgdGhpcy5yZXBvc2l0aW9uID0gcmVzdG9yZTtcbiAgICAgICAgdGhpcy5yZXN0b3JpbmdDYXJkID0gY2FyZDtcbiAgICAgICAgZm9yIChjb25zdCBwYW5lIG9mIFtsaXN0LCByaWdodF0pIHtcbiAgICAgICAgICAgIHBhbmUuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25TY3JvbGwsIHsgcGFzc2l2ZTogdHJ1ZSwgY2FwdHVyZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIGlucHV0RXZlbnRzKSBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBvbklucHV0LCB7IHBhc3NpdmU6IHRydWUsIGNhcHR1cmU6IHRydWUgfSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBzdG9wT25LZXksIHRydWUpO1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBhZnRlckxvYWQsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgcmVzdG9yZSgpO1xuICAgIH1cblxuICAgIHJlZnJlc2goKSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignI2NvbnRlc3RzIC5sZWZ0X3BhcnQgLnNjcm9sbF9hcmVhJyk7XG4gICAgICAgIGNvbnN0IHJpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJyNjb250ZXN0cyAucmlnaHRfcGFydCcpO1xuICAgICAgICBpZiAodGhpcy5zdG9wSnVtcCAmJiAodGhpcy5saXN0ICE9PSBsaXN0IHx8IHRoaXMucmlnaHQgIT09IHJpZ2h0IHx8ICFsaXN0Py5jb250YWlucyh0aGlzLnJlc3RvcmluZ0NhcmQpKSkge1xuICAgICAgICAgICAgdGhpcy5zdG9wSnVtcChmYWxzZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5yaWdodCkgdGhpcy5zaG93TGVhZGVyYm9hcmQodGhpcy5yaWdodCwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5saXN0ID0gbGlzdDtcbiAgICAgICAgdGhpcy5yaWdodCA9IHJpZ2h0O1xuICAgICAgICBpZiAoIWxpc3QgfHwgIXJpZ2h0IHx8ICFsaXN0LmdldENsaWVudFJlY3RzKCkubGVuZ3RoIHx8IGdldENvbXB1dGVkU3R5bGUobGlzdCkudmlzaWJpbGl0eSAhPT0gJ3Zpc2libGUnKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZmluaXNoZWQgPSBuZXcgU2V0KE9iamVjdC52YWx1ZXMod2luZG93LmNvbnRlc3RzPy5maW5pc2hlZCB8fCB7fSlcbiAgICAgICAgICAgIC5maWx0ZXIoY29udGVzdCA9PiBjb250ZXN0Py5pZF9jb250ZXN0ICE9IG51bGwpLm1hcChjb250ZXN0ID0+IFN0cmluZyhjb250ZXN0LmlkX2NvbnRlc3QpKSk7XG4gICAgICAgIGZvciAoY29uc3QgZW5kZWQgb2YgbGlzdC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVzdC5lbmRlZCwgLmNvbnRlc3RfaGVhZGVyLmVuZGVkJykpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZW5kZWQuY2xvc2VzdCgnLmNvbnRlc3RbaWRfY29udGVzdF0nKT8uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG4gICAgICAgICAgICBpZiAoaWQpIGZpbmlzaGVkLmFkZChpZCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29udGVzdHMgPSB0aGlzLmdldENvbnRlc3RzKGxpc3QsIGZpbmlzaGVkKTtcbiAgICAgICAgdGhpcy5jbGVhckV4cGlyZWRQaW4obGlzdCwgY29udGVzdHMsIGZpbmlzaGVkKTtcbiAgICAgICAgdGhpcy51cGRhdGVQaW5zKGxpc3QsIGNvbnRlc3RzKTtcblxuICAgICAgICBpZiAodGhpcy5yZXBvc2l0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnJlcG9zaXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zdGFydHVwUGVuZGluZykge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5nZXRUYXJnZXQoY29udGVzdHMpO1xuICAgICAgICAgICAgaWYgKHRhcmdldCkgdGhpcy5vcGVuQ29udGVzdChsaXN0LCByaWdodCwgdGFyZ2V0KTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScgJiYgIXRoaXMucHJlZmVyZW5jZSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIHRoaXMuZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdCwgcmlnaHQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGNvbnN0IHBpbiA9IHJlYWRDb250ZXN0U2V0dGluZygnQ29udGVzdFN0YXJ0SWQnKTtcbiAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gKCh0eXBlb2YgcGluID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgcGluID09PSAnbnVtYmVyJykgJiYgcGluKSA/IFN0cmluZyhwaW4pIDogJyc7XG4gICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmRlZmF1bHRzID0gcmVhZENvbnRlc3REZWZhdWx0cygpO1xuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3QgeyBzaWduYWwgfSA9IHRoaXMubGlzdGVuZXJzO1xuICAgICAgICB0aGlzLm9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobXV0YXRpb25zID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEnKTtcbiAgICAgICAgICAgIGNvbnN0IHJpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlc3RzIC5yaWdodF9wYXJ0Jyk7XG4gICAgICAgICAgICBpZiAobGlzdCAhPT0gdGhpcy5saXN0IHx8IHJpZ2h0ICE9PSB0aGlzLnJpZ2h0IHx8IG11dGF0aW9ucy5zb21lKCh7IHRhcmdldCB9KSA9PlxuICAgICAgICAgICAgICAgIChsaXN0ICYmIChsaXN0LmNvbnRhaW5zKHRhcmdldCkgfHwgdGFyZ2V0LmNvbnRhaW5zKGxpc3QpKSkgfHxcbiAgICAgICAgICAgICAgICAocmlnaHQgJiYgKHJpZ2h0LmNvbnRhaW5zKHRhcmdldCkgfHwgdGFyZ2V0LmNvbnRhaW5zKHJpZ2h0KSkpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlLCBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJywgJ3N0eWxlJywgJ2hpZGRlbicsICdpZF9jb250ZXN0J10gfSk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHRoaXMucmVmcmVzaCgpLCB7IG9uY2U6IHRydWUsIHNpZ25hbCB9KTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5pc1RydXN0ZWQgJiYgZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCAmJiB0aGlzLnJpZ2h0ICYmIHRoaXMubGlzdD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSAmJlxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5jbG9zZXN0KCcuY29udGVzdF9oZWFkZXInKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZCh0aGlzLnJpZ2h0LCBudWxsKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgeyBjYXB0dXJlOiB0cnVlLCBzaWduYWwgfSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG5cbiAgICB0ZWFyRG93bigpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlcj8uZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLmxpc3RlbmVycz8uYWJvcnQoKTtcbiAgICAgICAgdGhpcy5zdG9wSnVtcD8uKCk7XG4gICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5saXN0Py5xdWVyeVNlbGVjdG9yQWxsKCcuamFydmlzLWNvbnRlc3QtcGluLCAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpLmZvckVhY2goY29udHJvbCA9PiBjb250cm9sLnJlbW92ZSgpKTtcbiAgICAgICAgaWYgKHRoaXMucmlnaHQpIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHRoaXMucmlnaHQsIG51bGwpO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSBmYWxzZTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuXG5leHBvcnQgY2xhc3MgTGVhZ3VlVG9wMjAgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnbGVhZ3VlVG9wMjAnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUHJvbW90aW9uIHRhcmdldFwiLCBcIlNob3cgdGhlIHBvaW50cyBuZWVkZWQgdG8gcmVhY2ggdGhlIGxhcmdlciBvZiB0aGUgdG9wIDIwIG9yIHRvcCAxNSUgYmVsb3cgdGhlIGhpZ2hlc3QgbGVhZ3VlIHRpZXIuXCIpXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3Vlcy5odG1sJyk7XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZSgnLnNjcmlwdExlYWd1ZUluZm8nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdW1tYXJ5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjcmlwdExlYWd1ZUluZm8nKTtcbiAgICAgICAgICAgIGlmICghc3VtbWFyeSB8fCBzdW1tYXJ5LnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXNUb3AyMCcpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHsgb3Bwb25lbnRzX2xpc3QsIGN1cnJlbnRfdGllcl9udW1iZXIsIG1heF9sZWFndWUgfSA9IHdpbmRvdztcbiAgICAgICAgICAgIGNvbnN0IHRpZXIgPSBOdW1iZXIoY3VycmVudF90aWVyX251bWJlcik7XG4gICAgICAgICAgICBpZiAoISh0aWVyID4gMCAmJiB0aWVyIDwgTnVtYmVyKG1heF9sZWFndWUpKSkgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgaGVyb0lkID0gKHdpbmRvdy5zaGFyZWQ/Lkhlcm8gfHwgd2luZG93Lkhlcm8pPy5pbmZvcz8uaWQ7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkob3Bwb25lbnRzX2xpc3QpIHx8IGhlcm9JZCA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHBsYXllciA9IG9wcG9uZW50c19saXN0LmZpbmQoKHsgcGxheWVyIH0pID0+IFN0cmluZyhwbGF5ZXI/LmlkX2ZpZ2h0ZXIpID09PSBTdHJpbmcoaGVyb0lkKSk7XG4gICAgICAgICAgICBjb25zdCByYW5rID0gTnVtYmVyKHBsYXllcj8ucGxhY2UpO1xuICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKHJhbmspIHx8IHJhbmsgPCAxKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGJyYWNrZXRTaXplID0gb3Bwb25lbnRzX2xpc3QubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3QgcHJvbW90aW9uUmFuayA9IE1hdGgubWF4KDIwLCBNYXRoLmNlaWwoYnJhY2tldFNpemUgKiAxNSAvIDEwMCkpO1xuICAgICAgICAgICAgY29uc3QgaW5Qcm9tb3Rpb24gPSByYW5rIDw9IHByb21vdGlvblJhbms7XG4gICAgICAgICAgICBjb25zdCBjb21wYXJpc29uUmFuayA9IGluUHJvbW90aW9uID8gcHJvbW90aW9uUmFuayArIDEgOiBwcm9tb3Rpb25SYW5rO1xuICAgICAgICAgICAgY29uc3QgY3V0b2ZmID0gb3Bwb25lbnRzX2xpc3QuZmluZCgoeyBwbGFjZSB9KSA9PiBOdW1iZXIocGxhY2UpID09PSBjb21wYXJpc29uUmFuayk7XG4gICAgICAgICAgICBpZiAocGxheWVyPy5wbGF5ZXJfbGVhZ3VlX3BvaW50cyA9PSBudWxsIHx8IGN1dG9mZj8ucGxheWVyX2xlYWd1ZV9wb2ludHMgPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBzY29yZSA9IE51bWJlcihwbGF5ZXIucGxheWVyX2xlYWd1ZV9wb2ludHMpO1xuICAgICAgICAgICAgY29uc3QgY3V0b2ZmU2NvcmUgPSBOdW1iZXIoY3V0b2ZmLnBsYXllcl9sZWFndWVfcG9pbnRzKTtcbiAgICAgICAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHNjb3JlKSB8fCAhTnVtYmVyLmlzRmluaXRlKGN1dG9mZlNjb3JlKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBmb3JtYXQgPSBuZXcgSW50bC5OdW1iZXJGb3JtYXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGluUHJvbW90aW9uID8gY3V0b2ZmU2NvcmUgOiBjdXRvZmZTY29yZSArIDE7XG4gICAgICAgICAgICBjb25zdCBkaWZmZXJlbmNlID0gaW5Qcm9tb3Rpb24gPyBzY29yZSAtIHRhcmdldCA6IHRhcmdldCAtIHNjb3JlO1xuICAgICAgICAgICAgY29uc3QgcnVsZSA9IGBUb3AgJHtwcm9tb3Rpb25SYW5rfSBpcyB0aGUgcHJvbW90aW9uIHRhcmdldC4gVGhlIGN1dG9mZiBpcyB0aGUgbGFyZ2VyIG9mIDIwIHBsYWNlcyBvciAxNSUgb2YgJHtmb3JtYXQuZm9ybWF0KGJyYWNrZXRTaXplKX0gcGxheWVycywgcm91bmRlZCB1cC5gO1xuICAgICAgICAgICAgY29uc3QgY29tcGFyaXNvbiA9IGluUHJvbW90aW9uXG4gICAgICAgICAgICAgICAgPyBgUmFuayAke2NvbXBhcmlzb25SYW5rfSBoYXMgJHtmb3JtYXQuZm9ybWF0KHRhcmdldCl9IHBvaW50cy4gWW91ciBsZWFkIGlzICR7Zm9ybWF0LmZvcm1hdChkaWZmZXJlbmNlKX0gcG9pbnRzLmBcbiAgICAgICAgICAgICAgICA6IGBZb3UgbmVlZCAke2Zvcm1hdC5mb3JtYXQodGFyZ2V0KX0gcG9pbnRzIHRvIHBhc3MgcmFuayAke2NvbXBhcmlzb25SYW5rfS5gO1xuICAgICAgICAgICAgY29uc3QgdG9vbHRpcCA9IGAke3J1bGV9ICR7Y29tcGFyaXNvbn1gO1xuXG4gICAgICAgICAgICBjb25zdCBlbnRyeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIGVudHJ5LmNsYXNzTmFtZSA9ICdqYXJ2aXNUb3AyMCc7XG4gICAgICAgICAgICBlbnRyeS5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgdG9vbHRpcCk7XG4gICAgICAgICAgICBlbnRyeS5zZXRBdHRyaWJ1dGUoJ3Rvb2x0aXAnLCAnJyk7XG4gICAgICAgICAgICBlbnRyeS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCB0b29sdGlwKTtcblxuICAgICAgICAgICAgY29uc3QgYmFkZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICBiYWRnZS5jbGFzc05hbWUgPSAnc2NyaXB0TGVhZ3VlSW5mb0ljb24nO1xuICAgICAgICAgICAgYmFkZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyMzNzY5YmEnO1xuICAgICAgICAgICAgYmFkZ2Uuc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgICAgICAgICBiYWRnZS50ZXh0Q29udGVudCA9IFN0cmluZyhwcm9tb3Rpb25SYW5rKTtcbiAgICAgICAgICAgIGVudHJ5LmFwcGVuZChiYWRnZSwgYCR7ZGlmZmVyZW5jZSA9PT0gMCA/ICcnIDogaW5Qcm9tb3Rpb24gPyAnLScgOiAnKyd9JHtmb3JtYXQuZm9ybWF0KE1hdGguYWJzKGRpZmZlcmVuY2UpKX1gKTtcbiAgICAgICAgICAgIHN1bW1hcnkuaW5zZXJ0QmVmb3JlKGVudHJ5LCBzdW1tYXJ5LnF1ZXJ5U2VsZWN0b3IoJy5taW5Ub3AzMCwgLnByb21vdGlvbkluZm8nKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuXG5leHBvcnQgY2xhc3MgUmVtb3ZlUGFzc0xvY2sgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBzZWxlY3RvclRvRmluZCA9ICcubG9ja195ZWxsb3dfaWNuJztcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNsYXNzVG9SZW1vdmUgPSAnbG9ja195ZWxsb3dfaWNuJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ3JlbW92ZVBhc3NMb2NrJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQYXNzIGxvY2sgaWNvbnNcIiwgXCJIaWRlIGxvY2sgaWNvbnMgb24gcmV3YXJkIHBhc3NlcyBzbyB0aGUgcmV3YXJkcyBhcmUgZWFzaWVyIHRvIHJlYWQuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAncG92JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQYXRoIG9mIFZhbG9yXCIsIFwiSGlkZSBsb2NrIGljb25zIG9uIHRoZSBQYXRoIG9mIFZhbG9yIHBhc3Nlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ3BvZycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUGF0aCBvZiBHbG9yeVwiLCBcIkhpZGUgbG9jayBpY29ucyBvbiB0aGUgUGF0aCBvZiBHbG9yeSBwYXNzZXMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi12YWxvci5odG1sJykgfHwgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLWdsb3J5Lmh0bWwnKVxuICAgIH1cblxuICAgIG9ic2VydmVVbnRpbChzZWxlY3Rvcjogc3RyaW5nLCBjYWxsYmFjazogKGVsZW1lbnRzOiBOb2RlTGlzdE9mPEVsZW1lbnQ+KSA9PiB2b2lkLCB7IG9uY2UgPSB0cnVlLCB0aW1lb3V0ID0gNTAwMCB9ID0ge30pIHtcbiAgICAgICAgbGV0IHRpbWVyOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgICAgICAgbGV0IGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVsZW1lbnRzKTtcbiAgICAgICAgICAgIGlmIChvbmNlKSByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGltZXIpIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVsZW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcblxuICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHRpbWVvdXQpICYmIHRpbWVvdXQgPiAwKSB7XG4gICAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3I6IHN0cmluZywgY2xhc3NUb1JlbW92ZTogc3RyaW5nLCB7IG9uY2UgPSB0cnVlLCB0aW1lb3V0ID0gNTAwMCB9ID0ge30pIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlVW50aWwoc2VsZWN0b3IsIChlbGVtZW50cykgPT4ge1xuICAgICAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbCA9PiBlbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzVG9SZW1vdmUpKTtcbiAgICAgICAgfSwgeyB0aW1lb3V0LCBvbmNlIH0pO1xuICAgIH1cblxuICAgIHJ1bih7IHBvdiwgcG9nIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLXZhbG9yLmh0bWwnKSAmJiBwb3YpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUodGhpcy5zZWxlY3RvclRvRmluZCwgdGhpcy5jbGFzc1RvUmVtb3ZlKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtZ2xvcnkuaHRtbCcpICYmIHBvZykge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZSh0aGlzLnNlbGVjdG9yVG9GaW5kLCB0aGlzLmNsYXNzVG9SZW1vdmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRHaXJsRGljdGlvbmFyeSgpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5nZXRHaXJsRGljdGlvbmFyeSgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3QgbG9hZCB0aGUgSEgrKyBnaXJsIGRpY3Rpb25hcnk6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBnZXRHaXJsRGljdGlvbmFyeSB9IGZyb20gJy4vZ2FtZURhdGEnO1xuXG5leHBvcnQgY2xhc3MgTG92ZVJhaWRzQWRkb24gZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSByZWFkb25seSByYXJpdHlDb2xvcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdsb3ZlUmFpZHNBZGRvbidcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTG92ZSBSYWlkcyBkaXNwbGF5XCIsIFwiQ3VzdG9taXplIG5hbWVzLCBpY29ucywgYW5kIHBvc2VzIG9uIExvdmUgUmFpZCBjYXJkcy5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdyYWlkX2lkJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJSYWlkIElEc1wiLCBcIkFkZCB0aGUgcmFpZCBJRCBiZWZvcmUgaXRzIG5hbWUuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnbmFtZXMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkhpZGRlbiBnaXJsIG5hbWVzXCIsIFwiU2hvdyB0aGUgbmFtZSBvbiBjYXJkcyB0aGF0IHVzZSBhIG15c3RlcmlvdXMgZ2lybCBsYWJlbC5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ3NraW4nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlNraW4gaW5kaWNhdG9yXCIsIFwiTWFyayBjYXJkcyB0aGF0IGluY2x1ZGUgYSBnaXJsIHdpdGggYSBza2luLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnY29sb3InLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlJhcml0eSBjb2xvcnNcIiwgXCJDb2xvciB0aGUgcmFpZCBuYW1lIGJhc2VkIG9uIHRoZSBnaXJs4oCZcyByYXJpdHkuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdmaWdodF9pY29uJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJGaWdodCBpY29uXCIsIFwiVXNlIHRoZSBjbGVhcmVyIGZpZ2h0LWVuZXJneSBpY29uLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnc2hhZG93cycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiVW5zaGFkb3dlZCBwb3Nlc1wiLCBcIlNob3cgdGhlIG5vcm1hbCBhcnR3b3JrIGluIHBsYWNlIG9mIHNoYWRvdyBwb3Nlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG5cbiAgICAgICAgdGhpcy5yYXJpdHlDb2xvcnMgPSB7XG4gICAgICAgICAgICByYXJlOiAnTGltZUdyZWVuJyxcbiAgICAgICAgICAgIGVwaWM6ICdHb2xkJyxcbiAgICAgICAgICAgIGxlZ2VuZGFyeTogJ01lZGl1bU9yY2hpZCdcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xvdmUtcmFpZHMuaHRtbCcpXG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKHsgcmFpZF9pZCwgc2tpbiwgbmFtZXMsIGNvbG9yLCBmaWdodF9pY29uLCBzaGFkb3dzIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBjb25zdCByYWlkcyA9ICh0eXBlb2YgbG92ZV9yYWlkcyAhPT0gJ3VuZGVmaW5lZCcgJiYgQXJyYXkuaXNBcnJheShsb3ZlX3JhaWRzKSkgPyBsb3ZlX3JhaWRzIDogW107XG4gICAgICAgIGlmICghcmFpZHMubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuXG4gICAgICAgIGNvbnN0IGdpcmxEaWN0ID0gYXdhaXQgZ2V0R2lybERpY3Rpb25hcnkoKTtcbiAgICAgICAgY29uc3QgcmFpZHNCeUlkID0gbmV3IE1hcChyYWlkcy5tYXAocmFpZCA9PiBbU3RyaW5nKHJhaWQuaWRfcmFpZCksIHJhaWRdKSk7XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnJhaWQtY2FyZFtpZF9yYWlkXScpLmZvckVhY2gocmFpZENhcmQgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmFpZCA9IHJhaWRzQnlJZC5nZXQocmFpZENhcmQuZ2V0QXR0cmlidXRlKCdpZF9yYWlkJykgPz8gJycpO1xuICAgICAgICAgICAgaWYgKCFyYWlkIHx8IHJhaWQuaWRfZ2lybCA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHsgbmFtZSwgcmFyaXR5LCBzaGFyZHMgPSAwIH0gPSBnaXJsRGljdD8uZ2V0KFN0cmluZyhyYWlkLmlkX2dpcmwpKSB8fCB7fTtcbiAgICAgICAgICAgIGNvbnN0IGhhcmVtTGluayA9IHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZ2V0SHJlZihgL2NoYXJhY3RlcnMvJHtyYWlkLmlkX2dpcmx9YCk7XG4gICAgICAgICAgICBjb25zdCByYWlkTmFtZUVsZW0gPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yKCcucmFpZC1uYW1lID4gc3BhbiA+IHNwYW4nKTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVfbGFiZWwgPSAobmFtZXMgJiYgbmFtZSkgfHwgcmFpZE5hbWVFbGVtPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IHJhaWQuZXZlbnRfbmFtZSB8fCByYWlkLmdpcmxfZGF0YT8ubmFtZSB8fCAnJztcbiAgICAgICAgICAgIGNvbnN0IHJhaWRfaWRfbGFiZWwgPSByYWlkX2lkID8gYCgke3JhaWQuaWRfcmFpZH0pYCA6ICcnO1xuICAgICAgICAgICAgY29uc3Qgc2tpbl9sYWJlbCA9IChza2luICYmIEFycmF5LmlzQXJyYXkocmFpZD8uZ2lybF9kYXRhPy5ncmFkZV9za2lucykgJiYgcmFpZC5naXJsX2RhdGEuZ3JhZGVfc2tpbnMubGVuZ3RoID4gMCkgPyAn8J+RmScgOiAnJztcblxuICAgICAgICAgICAgY29uc3QgZGlzcGxheVBhcnRzID0gW107XG4gICAgICAgICAgICBpZiAocmFpZF9pZCkgZGlzcGxheVBhcnRzLnB1c2gocmFpZF9pZF9sYWJlbCk7XG4gICAgICAgICAgICBkaXNwbGF5UGFydHMucHVzaChuYW1lX2xhYmVsKTtcbiAgICAgICAgICAgIGlmIChza2luKSBkaXNwbGF5UGFydHMucHVzaChza2luX2xhYmVsKTtcbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlMYWJlbCA9IGRpc3BsYXlQYXJ0cy5qb2luKCcgJykudHJpbSgpO1xuXG4gICAgICAgICAgICBpZiAocmFpZE5hbWVFbGVtICYmIGRpc3BsYXlMYWJlbCkge1xuICAgICAgICAgICAgICAgIHJhaWROYW1lRWxlbS50ZXh0Q29udGVudCA9IGRpc3BsYXlMYWJlbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgb2JqZWN0aXZlcyA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jbGFzc2ljLWdpcmwnKTtcbiAgICAgICAgICAgIGNvbnN0IGdpcmwgPSBvYmplY3RpdmVzWzBdO1xuICAgICAgICAgICAgaWYgKGdpcmwpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBnaXJsTmFtZUVsZW0gPSBnaXJsLnF1ZXJ5U2VsZWN0b3IoJy5naXJsLW5hbWUnKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2lybE5hbWVFbGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5rID0gZ2lybE5hbWVFbGVtLnF1ZXJ5U2VsZWN0b3IoJ2EnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsaW5rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluay5jbGFzc05hbWUgPSAnaGgtZ2lybC1saW5rJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChnaXJsTmFtZUVsZW0uZmlyc3RDaGlsZCkgbGluay5hcHBlbmRDaGlsZChnaXJsTmFtZUVsZW0uZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnaXJsTmFtZUVsZW0uYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3BsYXlMYWJlbCkgbGluay50ZXh0Q29udGVudCA9IGRpc3BsYXlMYWJlbDtcbiAgICAgICAgICAgICAgICAgICAgbGluay5ocmVmID0gaGFyZW1MaW5rO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzaGFyZHMgPT09IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvYmpFbGVtID0gZ2lybC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLm9iamVjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob2JqRWxlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqRWxlbS5pbm5lclRleHQgPSBgSSdtIGFscmVhZHkgYXR0cmFjdGVkIHRvIHlvdS4gRmluZCBtZSBpbiB5b3VyIEhhcmVtIWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjb2xvciAmJiByYXJpdHkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByYWlkTmFtZUNvbnRhaW5lciA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcucmFpZC1uYW1lJyk7XG4gICAgICAgICAgICAgICAgaWYgKHJhaWROYW1lQ29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhaWROYW1lQ29udGFpbmVyLnN0eWxlLmNvbG9yID0gdGhpcy5yYXJpdHlDb2xvcnNbcmFyaXR5XSB8fCAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaWdodF9pY29uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlnaHRJY29uID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5odWRCYXR0bGVQdHNfbWl4X2ljbicpO1xuICAgICAgICAgICAgICAgIGlmIChmaWdodEljb24pIHtcbiAgICAgICAgICAgICAgICAgICAgZmlnaHRJY29uLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9ICd1cmwoL2ltYWdlcy9waWN0dXJlcy9kZXNpZ24vaWNfZW5lcmd5X2ZpZ2h0LnBuZyknO1xuICAgICAgICAgICAgICAgICAgICBmaWdodEljb24uc3R5bGUuYmFja2dyb3VuZFNpemUgPSAnMjRweCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2hhZG93cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRJbWFnZSA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEltYWdlRWxlbWVudD4oJy5naXJsLWltZy5sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGxlZnRJbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICBsZWZ0SW1hZ2Uuc3JjID0gbGVmdEltYWdlLnNyYy5yZXBsYWNlKCctYmxhY2snLCAnJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyYWlkQ2FyZC5jbGFzc0xpc3QuY29udGFpbnMoJ211bHRpcGxlLWdpcmwnKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodEltYWdlID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MSW1hZ2VFbGVtZW50PignLmdpcmwtaW1nLnJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyaWdodEltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByaWdodEltYWdlLnNyYyA9IHJpZ2h0SW1hZ2Uuc3JjLnJlcGxhY2UoJ2F2YjAucG5nJywgJ2dyYWRlX3NraW5zL2dyYWRlX3NraW4xLnBuZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHRJbWFnZS5zcmMgPSByaWdodEltYWdlLnNyYy5yZXBsYWNlKCctYmxhY2snLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmFpZENhcmQucXVlcnlTZWxlY3RvckFsbCgnLmV5ZScpLmZvckVhY2goZSA9PiBlLnJlbW92ZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB0eXBlIHsgR2lybERhdGEsIExvdmVSYWlkIH0gZnJvbSAnLi4vLi4vZ2FtZS10eXBlcyc7XG5pbXBvcnQgeyBsc0dldCwgbHNTZXQsIGxzUm0gfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcbmltcG9ydCB7IGdldEdpcmxEaWN0aW9uYXJ5IH0gZnJvbSAnLi9nYW1lRGF0YSc7XG5cbnR5cGUgUmFpZENvcHlCdXR0b24gPSBIVE1MRGl2RWxlbWVudCAmIHsgX2JvdW5kQ29weUtleUhhbmRsZXI/OiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHZvaWQgfTtcblxuZXhwb3J0IGNsYXNzIExvdmVSYWlkc1BhcnNlciBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIGdpcmxEaWN0OiBSZWFkb25seU1hcDxzdHJpbmcsIEdpcmxEYXRhPiB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgX2JvdW5kSW5zZXJ0QnV0dG9uPzogKCkgPT4gdm9pZDtcblxuICAgIC8qXG4gICAgKiBSYWlkIElELCBBbm5vdW5jZW1lbnQgVHlwZSwgQmFja2dyb3VuZCBJRCwgRXZlbnQgTmFtZSwgU3RhcnQgRGF0ZXRpbWUsXG4gICAgKiBFbmQgRGF0ZXRpbWUsIER1cmF0aW9uLCBSYWlkIFN0YXR1cywgU291cmNlLCBHaXJsIElELFxuICAgICogR2lybCBOYW1lLCBSYXJpdHksIE1heCBHcmFkZSwgRmlyc3QgQXBwZWFyYW5jZSwgU291cmNlIElELFxuICAgICogSGFzIFNraW4ocylcbiAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xvdmVSYWlkc1BhcnNlcidcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTG92ZSBSYWlkcyBleHBvcnRcIiwgXCJBZGQgYSBidXR0b24gdG8gY29weSBuZXcgcmFpZHMgaW4gYSBzcHJlYWRzaGVldC1yZWFkeSBmb3JtYXQuXCIpXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbG92ZS1yYWlkcy5odG1sJylcbiAgICB9XG5cbiAgICBjYXBpdGFsaXplRmlyc3Qoc3RyOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHN0ciA/IHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKSA6IHN0cjtcbiAgICB9XG5cbiAgICBnZXRBbm5vdW5jZW1lbnRUeXBlKHR5cGU6IExvdmVSYWlkWydpZF9hbm5vdW5jZW1lbnRfdHlwZSddKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gXCJGdWxsXCI7XG4gICAgICAgICAgICBjYXNlIDI6IHJldHVybiBcIlBhcnRpYWxcIjtcbiAgICAgICAgICAgIGNhc2UgMzogcmV0dXJuIFwiTm9uZVwiO1xuICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIFwiVW5rbm93blwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U291cmNlSUQoZXZlbnQ6IExvdmVSYWlkKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZV9pZCA9IE51bWJlcihldmVudC5yYWlkX21vZHVsZV9wayk7XG4gICAgICAgIHN3aXRjaCAoZXZlbnQucmFpZF9tb2R1bGVfdHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc2Vhc29uJzogcmV0dXJuIDA7XG4gICAgICAgICAgICBjYXNlICdjaGFtcGlvbic6IHJldHVybiBOdW1iZXIuaXNGaW5pdGUoc291cmNlX2lkKSA/IHNvdXJjZV9pZCA6IC0yO1xuICAgICAgICAgICAgY2FzZSAndHJvbGwnOiByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHNvdXJjZV9pZCkgPyBzb3VyY2VfaWQgKyAxMCA6IC0yO1xuICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2lybEhhc1NraW5zKGV2ZW50OiBMb3ZlUmFpZCkge1xuICAgICAgICBjb25zdCBoYXNTa2lucyA9IEFycmF5LmlzQXJyYXkoZXZlbnQ/LmdpcmxfZGF0YT8uZ3JhZGVfc2tpbnMpICYmIGV2ZW50LmdpcmxfZGF0YS5ncmFkZV9za2lucy5sZW5ndGggPiAwO1xuICAgICAgICBpZiAoaGFzU2tpbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBcIlhcIjtcbiAgICAgICAgfSBlbHNlIHJldHVybiBcIk9cIjtcbiAgICB9XG5cbiAgICBmb3JtYXRFdmVudFJvdyhldmVudDogTG92ZVJhaWQpIHtcbiAgICAgICAgY29uc3QgZHVyYXRpb25Ib3VycyA9IE1hdGguZmxvb3IoTnVtYmVyKGV2ZW50LmV2ZW50X2R1cmF0aW9uX3NlY29uZHMpIC8gMzYwMCk7XG4gICAgICAgIGNvbnN0IGR1cmF0aW9uID0gYCR7ZHVyYXRpb25Ib3Vyc30gaG91cnNgO1xuXG4gICAgICAgIGNvbnN0IGdpcmwgPSB0aGlzLmdpcmxEaWN0Py5nZXQoU3RyaW5nKGV2ZW50LmlkX2dpcmwpKSB8fCB7fTtcbiAgICAgICAgY29uc3QgeyBuYW1lID0gJ1Vua25vd24nLCByYXJpdHkgPSAnTi9BJywgZ3JhZGUgPSAwIH0gPSBnaXJsO1xuXG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBldmVudC5pZF9yYWlkLFxuICAgICAgICAgICAgdGhpcy5nZXRBbm5vdW5jZW1lbnRUeXBlKGV2ZW50LmlkX2Fubm91bmNlbWVudF90eXBlKSxcbiAgICAgICAgICAgIGV2ZW50LmJhY2tncm91bmRfaWQsXG4gICAgICAgICAgICBldmVudC5ldmVudF9uYW1lLFxuICAgICAgICAgICAgZXZlbnQuc3RhcnRfZGF0ZXRpbWUsXG4gICAgICAgICAgICBldmVudC5lbmRfZGF0ZXRpbWUsXG4gICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgIGV2ZW50LnN0YXR1cyxcbiAgICAgICAgICAgIGV2ZW50LnJhaWRfbW9kdWxlX3R5cGUsXG4gICAgICAgICAgICBldmVudC5pZF9naXJsLFxuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIHRoaXMuY2FwaXRhbGl6ZUZpcnN0KHJhcml0eSksXG4gICAgICAgICAgICBncmFkZSxcbiAgICAgICAgICAgIFwiXCIsIC8vIG9uZSBibGFuayB0YWIgcmVzZXJ2ZWQgZm9yIGZpcnN0IGFwcGVhcmFuY2UgaW4gR1NoZWV0c1xuICAgICAgICAgICAgdGhpcy5nZXRTb3VyY2VJRChldmVudCksXG4gICAgICAgICAgICB0aGlzLmdpcmxIYXNTa2lucyhldmVudClcbiAgICAgICAgXS5qb2luKFwiXFx0XCIpO1xuICAgIH1cblxuICAgIGFzeW5jIGNvcHlUb0NsaXBib2FyZCh0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdDbGlwYm9hcmQgQVBJIGZhaWxlZCwgdXNpbmcgZXhlY0NvbW1hbmQgZmFsbGJhY2s6JywgZXJyKTtcbiAgICAgICAgICAgIGNvbnN0IHRleHRhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgICAgICAgICAgIHRleHRhcmVhLnZhbHVlID0gdGV4dDtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGV4dGFyZWEpO1xuICAgICAgICAgICAgdGV4dGFyZWEuc2VsZWN0KCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0ZXh0YXJlYS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGhhbmRsZUNvcHlDbGljayhldnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgY29uc3Qgc3RvcmFnZUtleSA9ICdMYXN0U2F2ZWRSYWlkSUQnO1xuXG4gICAgICAgIC8vIFNoaWZ0ICsgQ3RybCArIENsaWNrIOKGkiBjbGVhciBzdG9yZWQgSURcbiAgICAgICAgaWYgKGV2dC5zaGlmdEtleSAmJiBldnQuY3RybEtleSkge1xuICAgICAgICAgICAgY29uc3QgY29uZmlybUNsZWFyID0gY29uZmlybSgn4pqg77iPIERvIHlvdSB3YW50IHRvIGNsZWFyIHRoZSBzYXZlZCBsYXN0IHJhaWQgSUQgZm9yIHRoaXMgc2l0ZT8nKTtcbiAgICAgICAgICAgIGlmIChjb25maXJtQ2xlYXIpIHtcbiAgICAgICAgICAgICAgICBsc1JtKHN0b3JhZ2VLZXkpO1xuICAgICAgICAgICAgICAgIGFsZXJ0KCfinIUgTGFzdCBzYXZlZCBJRCBjbGVhcmVkLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9hZCByYWlkc1xuICAgICAgICBjb25zdCBsb2NhbExvdmVSYWlkcyA9ICh0eXBlb2YgbG92ZV9yYWlkcyAhPT0gJ3VuZGVmaW5lZCcgJiYgQXJyYXkuaXNBcnJheShsb3ZlX3JhaWRzKSkgPyBsb3ZlX3JhaWRzIDogW107XG4gICAgICAgIGlmICghbG9jYWxMb3ZlUmFpZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbGVydCgn4pqg77iPIE5vIGxvdmVfcmFpZHMgZm91bmQgb24gdGhpcyBwYWdlLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmdpcmxEaWN0KSB7XG4gICAgICAgICAgICBhbGVydCgn4pqg77iPIFRoZSBISCsrIGdpcmwgZGljdGlvbmFyeSBjb3VsZCBub3QgYmUgbG9hZGVkLiBSZWxvYWQgdGhlIHBhZ2UgYW5kIHRyeSBhZ2Fpbi4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsYXN0U2F2ZWRJZE51bWJlciA9IHBhcnNlSW50KFN0cmluZyhsc0dldChzdG9yYWdlS2V5KSksIDEwKTtcblxuICAgICAgICAvLyBJZiBTaGlmdCBpcyBoZWxkIE9SIG5vIHNhdmVkIElEIGV4aXN0cyDihpIgYXNrIGFnYWluXG4gICAgICAgIGlmIChpc05hTihsYXN0U2F2ZWRJZE51bWJlcikgfHwgZXZ0LnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBjb25zdCBsYXN0U2F2ZWRJZCA9IHByb21wdCgnUGxlYXNlIGVudGVyIHRoZSBsYXN0IHNhdmVkIElEOicpO1xuICAgICAgICAgICAgbGFzdFNhdmVkSWROdW1iZXIgPSBwYXJzZUludChTdHJpbmcobGFzdFNhdmVkSWQpLCAxMCk7XG5cbiAgICAgICAgICAgIGlmIChpc05hTihsYXN0U2F2ZWRJZE51bWJlcikpIHtcbiAgICAgICAgICAgICAgICBhbGVydCgn4p2MIEludmFsaWQgSUQgZW50ZXJlZC4gUGxlYXNlIGVudGVyIGEgdmFsaWQgbnVtYmVyLicpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbHRlciBuZXcgZXZlbnRzXG4gICAgICAgIGNvbnN0IGZpbHRlcmVkRGF0YSA9IGxvY2FsTG92ZVJhaWRzLmZpbHRlcihldmVudCA9PiBOdW1iZXIoZXZlbnQuaWRfcmFpZCkgPiBsYXN0U2F2ZWRJZE51bWJlcik7XG4gICAgICAgIGlmICghZmlsdGVyZWREYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgYWxlcnQoYOKEue+4jyBObyBuZXcgZXZlbnRzIGZvdW5kIHdpdGggSUQgZ3JlYXRlciB0aGFuICR7bGFzdFNhdmVkSWROdW1iZXJ9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmb3JtYXR0ZWREYXRhID0gZmlsdGVyZWREYXRhLm1hcCh0aGlzLmZvcm1hdEV2ZW50Um93LmJpbmQodGhpcykpLmpvaW4oXCJcXG5cIik7XG5cbiAgICAgICAgaWYgKCFhd2FpdCB0aGlzLmNvcHlUb0NsaXBib2FyZChmb3JtYXR0ZWREYXRhKSkge1xuICAgICAgICAgICAgYWxlcnQoJ+KdjCBDb3VsZCBub3QgY29weSB0aGUgcmFpZHMuIFRoZSBsYXN0IHNhdmVkIElEIHdhcyBrZXB0LicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2F2ZSBoaWdoZXN0IElEXG4gICAgICAgIGNvbnN0IG1heElkID0gTWF0aC5tYXgoLi4uZmlsdGVyZWREYXRhLm1hcChlID0+IE51bWJlcihlLmlkX3JhaWQpKSk7XG4gICAgICAgIGxzU2V0KHN0b3JhZ2VLZXksIG1heElkKTtcblxuICAgICAgICBhbGVydCgn4pyFIERhdGEgY29waWVkIHRvIGNsaXBib2FyZCEgWW91IGNhbiBub3cgcGFzdGUgaXQgaW50byBHU2hlZXRzLicpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNvcHlCdXR0b24oKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbjogUmFpZENvcHlCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3JlbWluZGVyLWNvcHknKTtcbiAgICAgICAgYnV0dG9uLnN0eWxlLmNzc1RleHQgPSBgXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjMDBhYWZmIDAsICMwMDY2ODggNTAlLCAjMDA1NTc3IDUxJSwgIzAwYWFmZiAxMDAlKTtcbiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgICAgIHdpZHRoOiAzMnB4O1xuICAgICAgICAgICAgaGVpZ2h0OiAzMnB4O1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IDEwcHg7XG4gICAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICByaWdodDogNC41cmVtO1xuICAgICAgICAgICAgdG9wOiAwLjJyZW07XG4gICAgICAgICAgICBmb250LXNpemU6IDE4cHg7XG4gICAgICAgICAgICBsaW5lLWhlaWdodDogMzJweDtcbiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IGJhY2tncm91bmQgMC4ycyBlYXNlO1xuICAgICAgICBgO1xuICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAn8J+Tiyc7XG4gICAgICAgIGxldCBidXR0b25UaXRsZSA9ICdDbGljayA9IGNvcHkgbmV3IHJhaWRzLiBTaGlmdCAvIFNoaWZ0ICsgQ3RybCBhdmFpbGFibGUuJztcbiAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgndG9vbHRpcCcsICcnKTtcbiAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG5cbiAgICAgICAgY29uc3QgX2JvdW5kQ29weUtleUhhbmRsZXIgPSAoZTogS2V5Ym9hcmRFdmVudCkgPT4gdGhpcy51cGRhdGVDb3B5QnV0dG9uKGUsIGJ1dHRvbik7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgX2JvdW5kQ29weUtleUhhbmRsZXIpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBfYm91bmRDb3B5S2V5SGFuZGxlcik7XG4gICAgICAgIC8vIHN0b3JlIGhhbmRsZXIgcmVmZXJlbmNlIHNvIGNhbGxlcnMgY2FuIHJlbW92ZSBsaXN0ZW5lcnMgaWYgYnV0dG9uIGlzIHJlbW92ZWQgbGF0ZXJcbiAgICAgICAgYnV0dG9uLl9ib3VuZENvcHlLZXlIYW5kbGVyID0gX2JvdW5kQ29weUtleUhhbmRsZXI7XG4gICAgICAgIGJ1dHRvbi5vbmNsaWNrID0gKGUpID0+IHRoaXMuaGFuZGxlQ29weUNsaWNrKGUpO1xuICAgICAgICB0aGlzLnVwZGF0ZUNvcHlCdXR0b24oeyBzaGlmdEtleTogZmFsc2UsIGN0cmxLZXk6IGZhbHNlIH0sIGJ1dHRvbik7XG4gICAgICAgIHJldHVybiBidXR0b247XG4gICAgfVxuXG4gICAgdXBkYXRlQ29weUJ1dHRvbihlOiBQaWNrPEtleWJvYXJkRXZlbnQsICdzaGlmdEtleScgfCAnY3RybEtleSc+LCBidXR0b246IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGxldCBidXR0b25UaXRsZSA9ICcnO1xuICAgICAgICBpZiAoZS5zaGlmdEtleSAmJiBlLmN0cmxLZXkpIHtcbiAgICAgICAgICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjZmY2NjY2IDAsICNhYTAwMDAgMTAwJSlcIjsgLy8gcmVkXG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAn8J+Xke+4jyc7XG4gICAgICAgICAgICBidXR0b25UaXRsZSA9ICdTaGlmdCArIEN0cmwgKyBDbGljayA9IGNsZWFyIHNhdmVkIElEJztcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGUuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjZmZkZDY2IDAsICNjYzk5MDAgMTAwJSlcIjsgLy8geWVsbG93XG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAn4pyP77iPJztcbiAgICAgICAgICAgIGJ1dHRvblRpdGxlID0gJ1NoaWZ0ICsgQ2xpY2sgPSBwcm9tcHQgZm9yIElELic7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjMDBhYWZmIDAsICMwMDY2ODggNTAlLCAjMDA1NTc3IDUxJSwgIzAwYWFmZiAxMDAlKVwiOyAvLyBkZWZhdWx0IGJsdWVcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5OLJztcbiAgICAgICAgICAgIGJ1dHRvblRpdGxlID0gJ0NsaWNrID0gY29weSBuZXcgcmFpZHMuIFNoaWZ0IC8gU2hpZnQgKyBDdHJsIGF2YWlsYWJsZS4nO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbnNlcnRCdXR0b24oKSB7XG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXR0b24tbm90aWZpY2F0aW9uLWFjdGlvbi5ub3RpZl9idXR0b25fcycpO1xuICAgICAgICBpZiAobm90aWZpY2F0aW9uQnV0dG9uICYmICFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVtaW5kZXItY29weScpKSB7XG4gICAgICAgICAgICBjb25zdCBjb3B5QnV0dG9uID0gdGhpcy5jcmVhdGVDb3B5QnV0dG9uKCk7XG4gICAgICAgICAgICBub3RpZmljYXRpb25CdXR0b24ucGFyZW50Tm9kZT8uaW5zZXJ0QmVmb3JlKGNvcHlCdXR0b24sIG5vdGlmaWNhdGlvbkJ1dHRvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICAgICAgdGhpcy5naXJsRGljdCA9IGF3YWl0IGdldEdpcmxEaWN0aW9uYXJ5KCk7XG5cbiAgICAgICAgdGhpcy5fYm91bmRJbnNlcnRCdXR0b24gPSB0aGlzLmluc2VydEJ1dHRvbi5iaW5kKHRoaXMpO1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykgdGhpcy5pbnNlcnRCdXR0b24oKTtcbiAgICAgICAgZWxzZSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuX2JvdW5kSW5zZXJ0QnV0dG9uLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBBY3Rpdml0eVBhcnNlciBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdhY3Rpdml0eVBhcnNlcidcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTWlzc2lvbiBjb3BpZXJcIiwgXCJFbmFibGUgdGhlIGNvcHkgdG9vbCBmb3IgbGVnZW5kYXJ5IG1pc3Npb24gZGV0YWlscy5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdtaXNzaW9uQ29waWVyJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMZWdlbmRhcnkgZGV0YWlsc1wiLCBcIkNsaWNrIGEgbGVnZW5kYXJ5IG1pc3Npb27igJlzIHRpdGxlLCBkZXNjcmlwdGlvbiwgb3IgaW1hZ2UgdG8gY29weSBpdC5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvYWN0aXZpdGllcy5odG1sJylcbiAgICB9XG5cbiAgICBhc3luYyBjb3B5VG9DbGlwYm9hcmQodGV4dDogc3RyaW5nKSB7XG4gICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpO1xuICAgICAgICBjb25zdCB0b2FzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0b2FzdC50ZXh0Q29udGVudCA9ICdDb3BpZWQhJztcbiAgICAgICAgdG9hc3Quc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgICAgICB0b2FzdC5zdHlsZS5ib3R0b20gPSAnMTBweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnJpZ2h0ID0gJzEwcHgnO1xuICAgICAgICB0b2FzdC5zdHlsZS5iYWNrZ3JvdW5kID0gJ3JnYmEoMCwwLDAsMC43KSc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmNvbG9yID0gJ3doaXRlJztcbiAgICAgICAgdG9hc3Quc3R5bGUucGFkZGluZyA9ICc1cHggMTBweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmJvcmRlclJhZGl1cyA9ICc1cHgnO1xuICAgICAgICB0b2FzdC5zdHlsZS56SW5kZXggPSAnOTk5OSc7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodG9hc3QpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRvYXN0LnJlbW92ZSgpLCAxMDAwKTtcbiAgICB9XG5cbiAgICBydW4oeyBtaXNzaW9uQ29waWVyIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBpZiAobWlzc2lvbkNvcGllcikge1xuICAgICAgICAgICAgY29uc3QgZW50cmllcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5taXNzaW9uX2VudHJ5LmxlZ2VuZGFyeScpO1xuICAgICAgICAgICAgaWYgKCFlbnRyaWVzLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBlbnRyaWVzLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGltZ0RpdiA9IGVudHJ5LnF1ZXJ5U2VsZWN0b3I8SFRNTEltYWdlRWxlbWVudD4oJy5taXNzaW9uX2ltYWdlIGltZycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlQWxsID0gZW50cnkucXVlcnlTZWxlY3RvcjxIVE1MSGVhZGluZ0VsZW1lbnQ+KCcubWlzc2lvbl9kZXRhaWxzIGgxJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVzYyA9IGVudHJ5LnF1ZXJ5U2VsZWN0b3I8SFRNTFBhcmFncmFwaEVsZW1lbnQ+KCcubWlzc2lvbl9kZXRhaWxzIHAnKTtcblxuICAgICAgICAgICAgICAgIGlmIChpbWdEaXYpIHtcbiAgICAgICAgICAgICAgICAgICAgaW1nRGl2LnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgaW1nRGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQoaW1nRGl2LnNyYyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0aXRsZUFsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZUFsbC5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG91dGVyVGl0bGUgPSB0aXRsZUFsbC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmV2ZW50LW1pc3Npb24tY29udGVudC10ZXh0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvdXRlclRpdGxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlclRpdGxlLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyVGl0bGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKChvdXRlclRpdGxlLnRleHRDb250ZW50ID8/ICcnKS50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aXRsZUFsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCAmJiBlLnRhcmdldC5jbG9zZXN0KCcuZXZlbnQtbWlzc2lvbi1jb250ZW50LXRleHQnKSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGl0bGVDbG9uZSA9IHRpdGxlQWxsLmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MSGVhZGluZ0VsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZUNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5ldmVudC1taXNzaW9uLWNvbnRlbnQtdGV4dCcpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gKHRpdGxlQ2xvbmUudGV4dENvbnRlbnQgPz8gJycpLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKHRpdGxlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGRlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzYy5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgICAgIGRlc2MuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZChkZXNjLmlubmVyVGV4dC50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgaW5pdEdhbWUgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgaW5qZWN0U3R5bGVzLCBwYWNrU2V0dGluZ3MgfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB7IEZyaWVuZEFuZEZvZXMgfSBmcm9tICcuL21vZHVsZXMvcGxheWVycy9GcmllbmRBbmRGb2VzJztcbmltcG9ydCB7IGFybUNvbnRlc3RTdGFydHVwR3VhcmQsIENvbnRlc3RTdGFydCB9IGZyb20gJy4vbW9kdWxlcy9jb250ZXN0cy9Db250ZXN0U3RhcnQnO1xuaW1wb3J0IHsgaW5zdGFsbENvbnRlc3RTZXR0aW5ncyB9IGZyb20gJy4vbW9kdWxlcy9jb250ZXN0cy9jb250ZXN0UHJlZmVyZW5jZXMnO1xuaW1wb3J0IHsgTGVhZ3VlVG9wMjAgfSBmcm9tICcuL21vZHVsZXMvcGxheWVycy9MZWFndWVUb3AyMCc7XG5pbXBvcnQgeyBSZW1vdmVQYXNzTG9jayB9IGZyb20gJy4vbW9kdWxlcy9wcm9ncmVzc2lvbi9SZW1vdmVQYXNzTG9jayc7XG5pbXBvcnQgeyBMb3ZlUmFpZHNBZGRvbiB9IGZyb20gJy4vbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc0FkZG9uJztcbmltcG9ydCB7IExvdmVSYWlkc1BhcnNlciB9IGZyb20gJy4vbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc1BhcnNlcic7XG5pbXBvcnQgeyBBY3Rpdml0eVBhcnNlciB9IGZyb20gJy4vbW9kdWxlcy9hY3Rpdml0aWVzL0FjdGl2aXR5UGFyc2VyJztcblxuYXJtQ29udGVzdFN0YXJ0dXBHdWFyZCgpO1xuXG5mdW5jdGlvbiBydW5KYXJ2aXMoKSB7XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcnVuSmFydmlzLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7ICQgfSA9IHdpbmRvdztcblxuICAgIGlmICghJCkge1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBydW5KYXJ2aXMsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1dBUk5JTkc6IE5vIGpRdWVyeSBmb3VuZC4gRW5kaW5nIHNjcmlwdC4nKTtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coJ0hlbGxvLCBTaXIsIEouQS5SLlYuSS5TLiBpcyByZWFkeSB0byBoZWxwIHlvdS4nKTtcblxuICAgIGluaXRHYW1lKCQpO1xuICAgIGluamVjdFN0eWxlcygpO1xuXG4gICAgY29uc3QgZnJpZW5kc0FuZEZvZXMgPSBuZXcgRnJpZW5kQW5kRm9lcygpO1xuICAgIGNvbnN0IGFsbE1vZHVsZXMgPSBbXG4gICAgICAgIGZyaWVuZHNBbmRGb2VzLFxuICAgICAgICBuZXcgQ29udGVzdFN0YXJ0KCksXG4gICAgICAgIG5ldyBMZWFndWVUb3AyMCgpLFxuICAgICAgICBuZXcgUmVtb3ZlUGFzc0xvY2soKSxcbiAgICAgICAgbmV3IExvdmVSYWlkc0FkZG9uKCksXG4gICAgICAgIG5ldyBMb3ZlUmFpZHNQYXJzZXIoKSxcbiAgICAgICAgbmV3IEFjdGl2aXR5UGFyc2VyKClcbiAgICBdXG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29uc3QgcnVuU2NyaXB0ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBoaFBsdXNQbHVzQ29uZmlnIH0gPSB3aW5kb3dcbiAgICAgICAgICAgIGlmICghaGhQbHVzUGx1c0NvbmZpZykgcmV0dXJuO1xuXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJlZ2lzdGVyR3JvdXAoe1xuICAgICAgICAgICAgICAgIGtleTogJ0pBUlZJUycsXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hIIEphcnZpcydcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBhbGxNb2R1bGVzLmZvckVhY2gobW9kdWxlID0+IHtcbiAgICAgICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJlZ2lzdGVyTW9kdWxlKG1vZHVsZSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLmxvYWRDb25maWcoKVxuICAgICAgICAgICAgaGhQbHVzUGx1c0NvbmZpZy5ydW5Nb2R1bGVzKClcbiAgICAgICAgICAgIGZyaWVuZHNBbmRGb2VzLmluc3RhbGxTZXR0aW5ncygpO1xuICAgICAgICAgICAgaW5zdGFsbENvbnRlc3RTZXR0aW5ncygpO1xuICAgICAgICAgICAgcGFja1NldHRpbmdzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2luZG93LmhoUGx1c1BsdXNDb25maWcpIHtcbiAgICAgICAgICAgIHJ1blNjcmlwdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbmUoJ2hoKystYmRzbTpsb2FkZWQnLCBydW5TY3JpcHQpXG4gICAgICAgIH1cbiAgICB9LCAxKVxufVxuXG5ydW5KYXJ2aXMoKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTyxNQUFJO0FBQ0osTUFBSTtBQUVKLFdBQVMsU0FBUyxRQUFzQjtBQUMzQyxRQUFJO0FBQ0osa0JBQWMsT0FBTyxTQUFTO0FBQUEsRUFDbEM7OztBQ05PLFdBQVMsWUFBWSxPQUFlLGFBQXFCO0FBQzVELFVBQU0sU0FBUyxDQUFDLFNBQWlCLEtBQUssV0FBVyxLQUFLLE9BQU8sRUFBRSxXQUFXLEtBQUssUUFBUSxFQUNsRixXQUFXLEtBQUssTUFBTSxFQUFFLFdBQVcsS0FBSyxNQUFNO0FBQ25ELFdBQU8sT0FBTyxLQUFLLElBQUksc0ZBQ25CLE9BQU8sS0FBSyxJQUFJLDBCQUEwQixPQUFPLFdBQVcsSUFBSTtBQUFBLEVBQ3hFO0FBRU8sV0FBUyxrQkFBa0IsT0FBb0IsV0FBbUI7QUFDckUsVUFBTSxVQUFVLFNBQVMsY0FBYyxLQUFLO0FBQzVDLFlBQVEsS0FBSztBQUNiLFlBQVEsWUFBWTtBQUNwQixZQUFRLGFBQWEsUUFBUSxTQUFTO0FBQ3RDLFVBQU0sVUFBVSxPQUFPLFFBQVEsZ0JBQWdCO0FBQy9DLFFBQUksUUFBUyxTQUFRLGFBQWEsV0FBVyxRQUFRO0FBQUEsUUFDaEQsU0FBUSxTQUFTO0FBQ3RCLGFBQVMsS0FBSyxZQUFZLE9BQU87QUFFakMsUUFBSSxTQUE2QjtBQUNqQyxVQUFNLFVBQVUsQ0FBQyxXQUNiLGtCQUFrQixVQUFVLE9BQU8sUUFBcUIscUJBQXFCLElBQUk7QUFDckYsVUFBTSxRQUFRLE1BQU07QUFDaEIsVUFBSSxDQUFDLE9BQVE7QUFDYixhQUFPLGdCQUFnQixrQkFBa0I7QUFDekMsZUFBUztBQUNULFVBQUksUUFBUyxTQUFRLFlBQVk7QUFBQSxVQUM1QixTQUFRLFNBQVM7QUFBQSxJQUMxQjtBQUNBLFVBQU0sT0FBTyxDQUFDLFNBQXNCO0FBQ2hDLFVBQUksV0FBVyxLQUFN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QUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0lPLFdBQVMsZUFBZTtBQUMzQixVQUFNLFFBQVEsU0FB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QUNsRkEseUJBQXVCO0FBRXZCLFdBQVMsWUFBWTtBQUNqQixRQUFJLFNBQVMsZUFBZSxXQUFXO0FBQ25DLGVBQVMsaUJBQWlCLG9CQUFvQixXQUFXLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDdkU7QUFBQSxJQUNKO0FBRUEsVUFBTSxFQUFFLEdBQUFDLEdBQUUsSUFBSTtBQUVkLFFBQUksQ0FBQ0EsSUFBRztBQUNKLFVBQUksU0FBUyxlQUFlLFlBQVk7QUFDcEMsZUFBTyxpQkFBaUIsUUFBUSxXQUFXLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDekQ7QUFBQSxNQUNKO0FBQ0EsZUFBUyxlQUFlLHdCQUF3QixHQUFHLE9BQU87QUFDMUQsY0FBUSxJQUFJLDBDQUEwQztBQUN0RDtBQUFBLElBQ0o7QUFFQSxZQUFRLElBQUksZ0RBQWdEO0FBRTVELGFBQVNBLEVBQUM7QUFDVixpQkFBYTtBQUViLFVBQU0saUJBQWlCLElBQUksY0FBYztBQUN6QyxVQUFNLGFBQWE7QUFBQSxNQUNmO0FBQUEsTUFDQSxJQUFJLGFBQWE7QUFBQSxNQUNqQixJQUFJLFlBQVk7QUFBQSxNQUNoQixJQUFJLGVBQWU7QUFBQSxNQUNuQixJQUFJLGVBQWU7QUFBQSxNQUNuQixJQUFJLGdCQUFnQjtBQUFBLE1BQ3BCLElBQUksZUFBZTtBQUFBLElBQ3ZCO0FBRUEsZUFBVyxNQUFNO0FBQ2IsWUFBTSxZQUFZLE1BQU07QUFDcEIsY0FBTSxFQUFFLGlCQUFpQixJQUFJO0FBQzdCLFlBQUksQ0FBQyxpQkFBa0I7QUFFdkIseUJBQWlCLGNBQWM7QUFBQSxVQUMzQixLQUFLO0FBQUEsVUFDTCxNQUFNO0FBQUEsUUFDVixDQUFDO0FBQ0QsbUJBQVcsUUFBUSxZQUFVO0FBQ3pCLDJCQUFpQixlQUFlLE1BQU07QUFBQSxRQUMxQyxDQUFDO0FBQ0QseUJBQWlCLFdBQVc7QUFDNUIseUJBQWlCLFdBQVc7QUFDNUIsdUJBQWUsZ0JBQWdCO0FBQy9CLCtCQUF1QjtBQUN2QixxQkFBYTtBQUFBLE1BQ2pCO0FBRUEsVUFBSSxPQUFPLGtCQUFrQjtBQUN6QixrQkFBVTtBQUFBLE1BQ2QsT0FBTztBQUNILFFBQUFBLEdBQUUsUUFBUSxFQUFFLElBQUksb0JBQW9CLFNBQVM7QUFBQSxNQUNqRDtBQUFBLElBQ0osR0FBRyxDQUFDO0FBQUEsRUFDUjtBQUVBLFlBQVU7IiwKICAibmFtZXMiOiBbIm1hdGNoZXMiLCAicGxheWVyIiwgImVyciIsICIkIl0KfQo=
