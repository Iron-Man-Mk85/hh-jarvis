// ==UserScript==
// @name           HH J.A.R.V.I.S. (Dev)
// @version        0.6.6
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
    box-shadow: inset 0 -1px currentColor;
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
.jarvis-mark-mode [data-jarvis-player] {
    cursor: crosshair;
}
.jarvis-mark-mode [data-jarvis-player]:hover,
.jarvis-mark-mode [data-jarvis-player]:focus-visible {
    outline: 1px solid currentColor;
}
`;

  // src/settings.ts
  function injectStyles() {
    const style = document.createElement("style");
    style.className = "hh-jarvis-style";
    style.textContent = settings_default;
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
      const entries = read().sort((a, b) => a.name.localeCompare(b.name, void 0, { numeric: true }));
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
          player.textContent = name;
          player.title = `Player ID ${id}`;
          const button = makeButton("Remove", () => {
            const index = Array.from(lists.querySelectorAll("button")).indexOf(button);
            if (remove(id)) {
              render();
              const remaining = lists.querySelectorAll("button");
              (remaining[Math.min(index, remaining.length - 1)] || close).focus();
            }
          });
          button.setAttribute("aria-label", `Remove ${name} from ${mark === "friend" ? "friends" : "foes"}`);
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
    dialog.addEventListener("close", () => dialog.remove(), { once: true });
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
    focusableNames = /* @__PURE__ */ new Map();
    mode = "";
    markMenu = null;
    root = null;
    rootSelector = "";
    inLeague = false;
    constructor() {
      const baseKey = "friendAndFoes";
      const configSchema = {
        baseKey,
        default: true,
        label: settingHelp("Friends and foes", "Right-click a name to mark or unmark it. Click more names to keep marking and press Esc to exit. Manage saved marks below."),
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
      return Object.entries(this.readMarks()).flatMap(([id, mark]) => /^[1-9]\d*$/.test(id) && (mark === "friend" || mark === "foe") ? [{ id, name: names[id] || `Player #${id}`, mark }] : []);
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
          act();
          if (name.isConnected && this.mode) name.focus({ preventScroll: true });
        });
        menu.appendChild(button);
      };
      for (const [mode, text] of [["friend", "Mark as friend"], ["foe", "Mark as foe"]]) {
        addAction(text, () => {
          this.setMode(mode);
          if (this.names.get(name) === id) this.applyMark(id);
        });
      }
      if (name.dataset.jarvisMark) addAction("Remove this player’s mark", () => {
        if (this.removeMark(id)) this.refresh();
      });
      if (this.mode) addAction("Exit marking mode (Esc)", () => this.setMode(""));
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
    setMode(mode) {
      this.mode = mode;
      this.root?.classList.toggle("jarvis-mark-mode", !!mode);
      for (const name of this.names.keys()) {
        if (mode && name.tabIndex < 0) {
          this.focusableNames.set(name, name.getAttribute("tabindex"));
          name.tabIndex = 0;
        } else if (!mode) {
          this.restoreFocus(name);
        }
      }
    }
    restoreFocus(name) {
      const tabindex = this.focusableNames.get(name);
      if (tabindex === void 0) return;
      if (tabindex === null) name.removeAttribute("tabindex");
      else name.setAttribute("tabindex", tabindex);
      this.focusableNames.delete(name);
    }
    getContestNames(root) {
      const names = /* @__PURE__ */ new Map();
      const byContest = /* @__PURE__ */ new Map();
      const contests = Object.values(window.contests || {}).filter((list) => Array.isArray(list)).flat();
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
      if (this.root && this.root !== root) this.root.classList.remove("jarvis-mark-mode");
      this.root = root;
      const names = !root ? /* @__PURE__ */ new Map() : this.inLeague ? new Map(Array.from(root.querySelectorAll(".nickname[id-member]"), (name) => [name, name.getAttribute("id-member")]).filter((entry) => !!entry[1] && /^[1-9]\d*$/.test(entry[1]))) : this.getContestNames(root);
      for (const name of this.names.keys()) {
        if (names.has(name)) continue;
        delete name.dataset.jarvisPlayer;
        delete name.dataset.jarvisMark;
        this.restoreFocus(name);
      }
      this.names = names;
      if (!root) return;
      const marks = this.readMarks();
      const savedNames = this.readSavedNames();
      let namesChanged = false;
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
          const displayName = name.textContent?.trim();
          if (displayName && savedNames[id] !== displayName) {
            savedNames[id] = displayName;
            namesChanged = true;
          }
        } else if (name.dataset.jarvisMark) {
          delete name.dataset.jarvisMark;
        }
      }
      if (namesChanged) this.saveNames(savedNames);
      this.setMode(this.mode);
    }
    applyMark(id) {
      if (!this.mode) return;
      const marks = this.readMarks();
      marks[id] = this.mode;
      this.saveSetting("PlayerMarks", marks);
      this.refresh();
    }
    markPlayer(event) {
      const key = event instanceof KeyboardEvent ? event.key : void 0;
      if (key === "Escape" && (this.mode || this.markMenu)) {
        event.preventDefault();
        event.stopPropagation();
        this.closeMarkMenu();
        this.setMode("");
        return;
      }
      if (event.target instanceof Node && this.markMenu?.contains(event.target)) return;
      if (event.type === "click") this.closeMarkMenu();
      const name = event.target instanceof Element ? event.target.closest("[data-jarvis-player]") : null;
      if (!name) return;
      const id = this.names.get(name);
      if (!id) return;
      if (event instanceof MouseEvent && (event.type === "contextmenu" || event.type === "click" && event.altKey)) {
        this.openMarkMenu(event, name, id);
        return;
      }
      if (!this.mode || event.type === "keydown" && key !== "Enter" && key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      this.applyMark(id);
    }
    run({ league, contests }) {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      this.inLeague = currentPage === "/leagues.html";
      if (this.inLeague ? !league : !contests) return;
      this.rootSelector = this.inLeague ? ".league_table" : "#contests .right_part";
      const markPlayer = (event) => this.markPlayer(event);
      document.addEventListener("click", markPlayer, true);
      document.addEventListener("keydown", markPlayer, true);
      document.addEventListener("contextmenu", markPlayer, true);
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
        label: settingHelp("Top 20 promotion target", "Show points needed for 20th place below the highest league tier.")
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
        const inTop20 = rank <= 20;
        const cutoff = opponents_list.find(({ place }) => Number(place) === (inTop20 ? 21 : 20));
        if (player?.player_league_points == null || cutoff?.player_league_points == null) return;
        const score = Number(player.player_league_points);
        const cutoffScore = Number(cutoff.player_league_points);
        if (!Number.isFinite(score) || !Number.isFinite(cutoffScore)) return;
        const format = new Intl.NumberFormat();
        const target = inTop20 ? cutoffScore : cutoffScore + 1;
        const difference = inTop20 ? score - target : target - score;
        const tooltip = inTop20 ? `Top 20 promotion target: ${format.format(target)} points at rank 21. Your lead: ${format.format(difference)} points.` : `Top 20 promotion target: ${format.format(target)} points to pass rank 20.`;
        const entry = document.createElement("span");
        entry.className = "minTop20 jarvisTop20";
        entry.setAttribute("hh_title", tooltip);
        entry.setAttribute("tooltip", "");
        entry.setAttribute("aria-label", tooltip);
        const badge = document.createElement("span");
        badge.className = "scriptLeagueInfoIcon";
        badge.style.backgroundColor = "#3769ba";
        badge.style.textAlign = "center";
        badge.textContent = "20";
        entry.append(badge, `${difference === 0 ? "" : inTop20 ? "-" : "+"}${format.format(Math.abs(difference))}`);
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
          name: `<span tooltip="By Iron Man · v${"0.6.6 Dev"}">HH Jarvis</span>`
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzSGVscC50cyIsICJzcmMvc2V0dGluZ3MuY3NzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvSEhNb2R1bGUudHMiLCAic3JjL3N0b3JhZ2UudHMiLCAic3JjL21vZHVsZXMvcGxheWVycy9tYXJrTWFuYWdlci50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0ZyaWVuZEFuZEZvZXMudHMiLCAic3JjL21vZHVsZXMvY29udGVzdHMvY29udGVzdFByZWZlcmVuY2VzLnRzIiwgInNyYy9tb2R1bGVzL2NvbnRlc3RzL0NvbnRlc3RTdGFydC50cyIsICJzcmMvbW9kdWxlcy9wbGF5ZXJzL0xlYWd1ZVRvcDIwLnRzIiwgInNyYy9tb2R1bGVzL3Byb2dyZXNzaW9uL1JlbW92ZVBhc3NMb2NrLnRzIiwgInNyYy9tb2R1bGVzL2xvdmUtcmFpZHMvZ2FtZURhdGEudHMiLCAic3JjL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNBZGRvbi50cyIsICJzcmMvbW9kdWxlcy9sb3ZlLXJhaWRzL0xvdmVSYWlkc1BhcnNlci50cyIsICJzcmMvbW9kdWxlcy9hY3Rpdml0aWVzL0FjdGl2aXR5UGFyc2VyLnRzIiwgInNyYy9pbmRleC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCAkOiBKUXVlcnlTdGF0aWM7XG5leHBvcnQgbGV0IGN1cnJlbnRQYWdlOiBzdHJpbmc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0R2FtZShqUXVlcnk6IEpRdWVyeVN0YXRpYykge1xuICAgICQgPSBqUXVlcnk7XG4gICAgY3VycmVudFBhZ2UgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIHNldHRpbmdIZWxwKGxhYmVsOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgICBjb25zdCBlc2NhcGUgPSAodGV4dDogc3RyaW5nKSA9PiB0ZXh0LnJlcGxhY2VBbGwoJyYnLCAnJmFtcDsnKS5yZXBsYWNlQWxsKCdcIicsICcmcXVvdDsnKVxuICAgICAgICAucmVwbGFjZUFsbCgnPCcsICcmbHQ7JykucmVwbGFjZUFsbCgnPicsICcmZ3Q7Jyk7XG4gICAgcmV0dXJuIGVzY2FwZShsYWJlbCkgKyAnIDxzcGFuIGNsYXNzPVwiaXJvbm1hbi1zZXR0aW5nLWhlbHBcIiByb2xlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgYXJpYS1sYWJlbD1cIkFib3V0ICcgK1xuICAgICAgICBlc2NhcGUobGFiZWwpICsgJ1wiIGRhdGEtc2V0dGluZy1oZWxwPVwiJyArIGVzY2FwZShkZXNjcmlwdGlvbikgKyAnXCI+Pzwvc3Bhbj4nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW91bnRTZXR0aW5nc0hlbHAocGFuZWw6IEhUTUxFbGVtZW50LCB0b29sdGlwSWQ6IHN0cmluZykge1xuICAgIGNvbnN0IHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0b29sdGlwLmlkID0gdG9vbHRpcElkO1xuICAgIHRvb2x0aXAuY2xhc3NOYW1lID0gJ2lyb25tYW4tc2V0dGluZy10b29sdGlwJztcbiAgICB0b29sdGlwLnNldEF0dHJpYnV0ZSgncm9sZScsICd0b29sdGlwJyk7XG4gICAgY29uc3QgcG9wb3ZlciA9IHR5cGVvZiB0b29sdGlwLnNob3dQb3BvdmVyID09PSAnZnVuY3Rpb24nO1xuICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLnNldEF0dHJpYnV0ZSgncG9wb3ZlcicsICdtYW51YWwnKTtcbiAgICBlbHNlIHRvb2x0aXAuaGlkZGVuID0gdHJ1ZTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvb2x0aXApO1xuXG4gICAgbGV0IGFuY2hvcjogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBnZXRIZWxwID0gKHRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsKSA9PlxuICAgICAgICB0YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ID8gdGFyZ2V0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCdbZGF0YS1zZXR0aW5nLWhlbHBdJykgOiBudWxsO1xuICAgIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIWFuY2hvcikgcmV0dXJuO1xuICAgICAgICBhbmNob3IucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jyk7XG4gICAgICAgIGFuY2hvciA9IG51bGw7XG4gICAgICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLmhpZGVQb3BvdmVyKCk7XG4gICAgICAgIGVsc2UgdG9vbHRpcC5oaWRkZW4gPSB0cnVlO1xuICAgIH07XG4gICAgY29uc3Qgc2hvdyA9IChoZWxwOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICBpZiAoYW5jaG9yID09PSBoZWxwKSByZXR1cm47XG4gICAgICAgIGNsb3NlKCk7XG4gICAgICAgIGFuY2hvciA9IGhlbHA7XG4gICAgICAgIGhlbHAuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgdG9vbHRpcElkKTtcbiAgICAgICAgdG9vbHRpcC50ZXh0Q29udGVudCA9IGhlbHAuZGF0YXNldC5zZXR0aW5nSGVscCA/PyAnJztcbiAgICAgICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuc2hvd1BvcG92ZXIoKTtcbiAgICAgICAgZWxzZSB0b29sdGlwLmhpZGRlbiA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IGhlbHAuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0V2lkdGgsIG9mZnNldEhlaWdodCB9ID0gdG9vbHRpcDtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoOCwgTWF0aC5taW4oYm91bmRzLmxlZnQsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCAtIG9mZnNldFdpZHRoIC0gOCkpICsgJ3B4JztcbiAgICAgICAgY29uc3QgYmVsb3cgPSBib3VuZHMuYm90dG9tICsgNjtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS50b3AgPSAoYmVsb3cgKyBvZmZzZXRIZWlnaHQgPD0gd2luZG93LmlubmVySGVpZ2h0IC0gOFxuICAgICAgICAgICAgPyBiZWxvdyA6IE1hdGgubWF4KDgsIGJvdW5kcy50b3AgLSBvZmZzZXRIZWlnaHQgLSA2KSkgKyAncHgnO1xuICAgIH07XG5cbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyb3ZlcicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgJiYgZXZlbnQucG9pbnRlclR5cGUgIT09ICd0b3VjaCcpIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm91dCcsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgPT09IGFuY2hvciAmJiBoZWxwICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGhlbHApIGNsb3NlKCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHApIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCBldmVudCA9PiB7XG4gICAgICAgIGlmIChnZXRIZWxwKGV2ZW50LnRhcmdldCkgPT09IGFuY2hvcikgY2xvc2UoKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKCFoZWxwKSByZXR1cm47XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzaG93KGhlbHApO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGhlbHAgPSBnZXRIZWxwKGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGlmIChoZWxwICYmIChldmVudC5rZXkgPT09ICdFbnRlcicgfHwgZXZlbnQua2V5ID09PSAnICcpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBzaG93KGhlbHApO1xuICAgICAgICB9IGVsc2UgaWYgKGFuY2hvciAmJiBldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGdldEhlbHAoZXZlbnQudGFyZ2V0KSAhPT0gYW5jaG9yKSBjbG9zZSgpO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGNsb3NlLCB7IHBhc3NpdmU6IHRydWUgfSk7XG59XG4iLCAiLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAucGFuZWwtY29udGVudHMge1xuICAgIGFsaWduLWNvbnRlbnQ6IHN0YXJ0O1xuICAgIGFsaWduLWl0ZW1zOiBzdGFydDtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIG92ZXJzY3JvbGwtYmVoYXZpb3I6IGNvbnRhaW47XG4gICAgc2Nyb2xsYmFyLXdpZHRoOiB0aGluO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWw6aGFzKD4gLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXS5zaG93bikge1xuICAgIG92ZXJmbG93OiBjbGlwO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuY29uZmlnLXNldHRpbmcuaGFzLXN1YnNldHRpbmdzIHtcbiAgICBncmlkLXJvdy1lbmQ6IGF1dG87XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5qYXJ2aXMtcGFja2VkLXNldHRpbmdzIHtcbiAgICBncmlkLWF1dG8tZmxvdzogcm93IGRlbnNlO1xuICAgIGdyaWQtYXV0by1yb3dzOiAxcHg7XG4gICAgcm93LWdhcDogMDtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmphcnZpcy1wYWNrZWQtc2V0dGluZ3MgLmNvbmZpZy1zZXR0aW5nIHtcbiAgICBncmlkLXJvdy1lbmQ6IHNwYW4gdmFyKC0tamFydmlzLXNldHRpbmctcm93cywgMSk7XG59XG4uaXJvbm1hbi1zZXR0aW5nLWhlbHAge1xuICAgIGRpc3BsYXk6IGlubGluZS1ncmlkO1xuICAgIHBsYWNlLWl0ZW1zOiBjZW50ZXI7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBpbmxpbmUtc2l6ZTogMS4yNWVtO1xuICAgIGJsb2NrLXNpemU6IDEuMjVlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgIGZvbnQtc2l6ZTogLjhlbTtcbiAgICBsaW5lLWhlaWdodDogMTtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogLjA4ZW07XG4gICAgY3Vyc29yOiBoZWxwO1xufVxuLmlyb25tYW4tc2V0dGluZy1oZWxwOmhvdmVyLFxuLmlyb25tYW4tc2V0dGluZy1oZWxwOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbi5pcm9ubWFuLXNldHRpbmctdG9vbHRpcCB7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIGluc2V0OiBhdXRvO1xuICAgIHotaW5kZXg6IDEwMDEwO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgbWF4LXdpZHRoOiBtaW4oMThyZW0sIGNhbGMoMTAwdncgLSAxNnB4KSk7XG4gICAgbWFyZ2luOiAwO1xuICAgIHBhZGRpbmc6IC41ZW0gLjdlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40ZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogMTRweC8xLjQgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuamFydmlzLW1hcmstY29sb3IgaW5wdXQge1xuICAgIHdpZHRoOiAzMHB4O1xuICAgIGhlaWdodDogMjBweDtcbiAgICBmbGV4OiBub25lO1xuICAgIHBhZGRpbmc6IDA7XG59XG5idXR0b24uamFydmlzLWNvbnRlc3QtcGluIHtcbiAgICBhbGw6IHVuc2V0O1xuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICBtYXJnaW4taW5saW5lLXN0YXJ0OiAuMzVlbTtcbiAgICBwYWRkaW5nLWlubGluZTogLjJlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250LXNpemU6IC45ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jb250ZXN0LXBpbjo6YmVmb3JlIHtcbiAgICBjb250ZW50OiAn4piGJztcbn1cbi5qYXJ2aXMtY29udGVzdC1waW5bYXJpYS1wcmVzc2VkPVwidHJ1ZVwiXTo6YmVmb3JlIHtcbiAgICBjb250ZW50OiAn4piFJztcbiAgICBjb2xvcjogI2ZmZDM2Yjtcbn1cbi5qYXJ2aXMtY29udGVzdC1waW46Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1jaG9pY2Uge1xuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgIHdpZHRoOiBmaXQtY29udGVudDtcbiAgICBnYXA6IC4xMmVtO1xuICAgIHBhZGRpbmc6IC4xMmVtO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgNTUlLCB0cmFuc3BhcmVudCk7XG4gICAgYm9yZGVyLXJhZGl1czogLjQ1ZW07XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgbGluZS1oZWlnaHQ6IDEuMTU7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIGJ1dHRvbiB7XG4gICAgYWxsOiB1bnNldDtcbiAgICBwYWRkaW5nOiAuMThlbSAuMzhlbTtcbiAgICBib3JkZXItcmFkaXVzOiAuMjZlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGxpbmUtaGVpZ2h0OiBpbmhlcml0O1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b25bYXJpYS1wcmVzc2VkPVwidHJ1ZVwiXSB7XG4gICAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIGN1cnJlbnRDb2xvciAyMiUsIHRyYW5zcGFyZW50KTtcbiAgICBib3gtc2hhZG93OiBpbnNldCAwIC0xcHggY3VycmVudENvbG9yO1xufVxuLmphcnZpcy1jb250ZXN0LWNob2ljZSBidXR0b246aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMTUlLCB0cmFuc3BhcmVudCk7XG59XG4uamFydmlzLWNvbnRlc3QtY2hvaWNlIGJ1dHRvbjpmb2N1cy12aXNpYmxlIHtcbiAgICBvdXRsaW5lOiAxcHggc29saWQgY3VycmVudENvbG9yO1xufVxuLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQge1xuICAgIG1hcmdpbi1pbmxpbmUtc3RhcnQ6IC4yOGVtO1xuICAgIGZvbnQtc2l6ZTogLjdlbTtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xufVxuLmphcnZpcy1jb250ZXN0LXNldHRpbmdzIHtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdhcDogLjNlbTtcbiAgICBtaW4td2lkdGg6IDA7XG4gICAgbWFyZ2luOiAuNDVlbSAwIDA7XG4gICAgcGFkZGluZzogMDtcbiAgICBib3JkZXI6IDA7XG4gICAgZm9udC1zaXplOiAuODVlbTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5nczpkaXNhYmxlZCAuamFydmlzLWNvbnRlc3QtY2hvaWNlIHtcbiAgICBvcGFjaXR5OiAuNTtcbn1cbi5qYXJ2aXMtY29udGVzdC1zZXR0aW5nczpkaXNhYmxlZCBidXR0b24ge1xuICAgIGN1cnNvcjogZGVmYXVsdDtcbn1cbi5qYXJ2aXMtbWFyay1tZW51IHtcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgei1pbmRleDogMTAwMDA7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBnYXA6IDJweDtcbiAgICBwYWRkaW5nOiA0cHg7XG4gICAgYm9yZGVyOiAxcHggc29saWQgIzg5OTRhNztcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgYmFja2dyb3VuZDogIzIzMjkzNjtcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBib3gtc2hhZG93OiAwIDJweCAxMHB4ICMwMDA4O1xuICAgIGZvbnQ6IDEzcHgvMS4zNSBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7XG59XG4uamFydmlzLW1hcmstbWVudSBidXR0b24ge1xuICAgIGFsbDogdW5zZXQ7XG4gICAgcGFkZGluZzogNHB4IDlweDtcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmphcnZpcy1tYXJrLW1lbnUgYnV0dG9uOmhvdmVyLFxuLmphcnZpcy1tYXJrLW1lbnUgYnV0dG9uOmZvY3VzLXZpc2libGUge1xuICAgIGJhY2tncm91bmQ6ICM0MTRkNjQ7XG59XG4jY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEuamFydmlzLWNvbnRlc3QtaW5zdGFudCxcbiNjb250ZXN0cyAucmlnaHRfcGFydC5qYXJ2aXMtY29udGVzdC1pbnN0YW50IC5sZWFkX3RhYmxlX3ZpZXcge1xuICAgIHNjcm9sbC1iZWhhdmlvcjogYXV0byAhaW1wb3J0YW50O1xuICAgIG92ZXJmbG93LWFuY2hvcjogbm9uZSAhaW1wb3J0YW50O1xufVxuI2NvbnRlc3RzIC5qYXJ2aXMtY29udGVzdC1sb2FkaW5nIHtcbiAgICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7XG4gICAgdHJhbnNpdGlvbjogbm9uZSAhaW1wb3J0YW50O1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuI2NvbnRlc3RzIC5yaWdodF9wYXJ0IC5yYW5raW5nW2lkX2NvbnRlc3RdLmphcnZpcy1jb250ZXN0LW90aGVyIHtcbiAgICBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFyaz1cImZyaWVuZFwiXSB7XG4gICAgY29sb3I6IHZhcigtLWphcnZpcy1mcmllbmQtY29sb3IpICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFyaz1cImZvZVwiXSB7XG4gICAgY29sb3I6IHZhcigtLWphcnZpcy1mb2UtY29sb3IpICFpbXBvcnRhbnQ7XG59XG5bZGF0YS1qYXJ2aXMtbWFya10sXG50ZFtkYXRhLWphcnZpcy1tYXJrXSA+IGEge1xuICAgIHRleHQtc2hhZG93OiAxcHggMCAjMTExODI3LCAtMXB4IDAgIzExMTgyNywgMCAxcHggIzExMTgyNywgMCAtMXB4ICMxMTE4MjcgIWltcG9ydGFudDtcbn1cbnRkW2RhdGEtamFydmlzLW1hcmtdID4gYSB7XG4gICAgY29sb3I6IGluaGVyaXQgIWltcG9ydGFudDtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb24ge1xuICAgIGFwcGVhcmFuY2U6IG5vbmU7XG4gICAgcGFkZGluZzogLjJlbSAuNWVtO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbiAgICBib3JkZXItcmFkaXVzOiAuMzVlbTtcbiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtc2V0dGluZy1hY3Rpb246aG92ZXIsXG4uamFydmlzLXNldHRpbmctYWN0aW9uOmZvY3VzLXZpc2libGUge1xuICAgIGJhY2tncm91bmQ6IGNvbG9yLW1peChpbiBzcmdiLCBjdXJyZW50Q29sb3IgMTYlLCB0cmFuc3BhcmVudCk7XG59XG4uamFydmlzLXNldHRpbmctYWN0aW9uOmRpc2FibGVkIHtcbiAgICBjdXJzb3I6IGRlZmF1bHQ7XG4gICAgb3BhY2l0eTogLjU7XG59XG4uamFydmlzLW1hcmstc2V0dGluZy1hY3Rpb25zLFxuLmphcnZpcy1tYXJrLWFjdGlvbnMge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC13cmFwOiB3cmFwO1xuICAgIGdhcDogLjRlbTtcbn1cbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIHtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIHdpZHRoOiBtaW4oMzRyZW0sIGNhbGMoMTAwdncgLSAycmVtKSk7XG4gICAgbWF4LWhlaWdodDogY2FsYygxMDB2aCAtIDJyZW0pO1xuICAgIHBhZGRpbmc6IDFyZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNjVyZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogMTVweC8xLjM1IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbn1cbi5qYXJ2aXMtbWFyay1tYW5hZ2VyOjpiYWNrZHJvcCB7XG4gICAgYmFja2dyb3VuZDogIzA4MGIxMmFhO1xufVxuLmphcnZpcy1tYXJrLW1hbmFnZXIgaDIsXG4uamFydmlzLW1hcmstbWFuYWdlciBoMyxcbi5qYXJ2aXMtbWFyay1tYW5hZ2VyIHAge1xuICAgIG1hcmdpbjogMDtcbn1cbi5qYXJ2aXMtbWFyay1saXN0cyB7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KG1pbigxM3JlbSwgMTAwJSksIDFmcikpO1xuICAgIGdhcDogLjlyZW07XG4gICAgbWF4LWhlaWdodDogNTB2aDtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIG1hcmdpbi1ibG9jazogLjlyZW07XG59XG4uamFydmlzLW1hcmstbGlzdHMgdWwge1xuICAgIG1hcmdpbjogLjNlbSAwIDA7XG4gICAgcGFkZGluZzogMDtcbiAgICBsaXN0LXN0eWxlOiBub25lO1xufVxuLmphcnZpcy1tYXJrLWxpc3RzIGxpIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgIGdhcDogLjQ1ZW07XG4gICAgcGFkZGluZzogLjJlbSAwO1xuICAgIG92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1xufVxuLmphcnZpcy1tYXJrLWFjdGlvbnMge1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2Vlbjtcbn1cbi5qYXJ2aXMtbWFyay1tb2RlIFtkYXRhLWphcnZpcy1wbGF5ZXJdIHtcbiAgICBjdXJzb3I6IGNyb3NzaGFpcjtcbn1cbi5qYXJ2aXMtbWFyay1tb2RlIFtkYXRhLWphcnZpcy1wbGF5ZXJdOmhvdmVyLFxuLmphcnZpcy1tYXJrLW1vZGUgW2RhdGEtamFydmlzLXBsYXllcl06Zm9jdXMtdmlzaWJsZSB7XG4gICAgb3V0bGluZTogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbn1cbiIsICJpbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBtb3VudFNldHRpbmdzSGVscCB9IGZyb20gJy4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCBjc3MgZnJvbSAnLi9zZXR0aW5ncy5jc3MnO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0U3R5bGVzKCkge1xuICAgIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZS5jbGFzc05hbWUgPSAnaGgtamFydmlzLXN0eWxlJztcbiAgICBzdHlsZS50ZXh0Q29udGVudCA9IGNzcztcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tTZXR0aW5ncygpIHtcbiAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAucGFuZWwtY29udGVudHMnO1xuICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihzZWxlY3Rvcik7XG4gICAgICAgIGlmICghcGFuZWwpIHJldHVybjtcbiAgICAgICAgcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnaGgtc2Nyb2xsJyk7XG4gICAgICAgIG1vdW50U2V0dGluZ3NIZWxwKHBhbmVsLCAnamFydmlzLXNldHRpbmctdG9vbHRpcCcpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuY3RybEtleSB8fCAhKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUpIHx8ICFwYW5lbC5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaXQgPSBldmVudC5kZWx0YU1vZGUgPT09IDEgPyAxNiA6IGV2ZW50LmRlbHRhTW9kZSA9PT0gMiA/IHBhbmVsLmNsaWVudEhlaWdodCA6IDE7XG4gICAgICAgICAgICBjb25zdCBzY2FsZSA9IHBhbmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCAvIHBhbmVsLm9mZnNldEhlaWdodCB8fCAxO1xuICAgICAgICAgICAgcGFuZWwuc2Nyb2xsVG9wICs9IGV2ZW50LmRlbHRhWSAqIHVuaXQgLyBzY2FsZTtcbiAgICAgICAgfSwgeyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiBmYWxzZSB9KTtcblxuICAgICAgICBjb25zdCBjYXJkcyA9IHBhbmVsLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcuY29uZmlnLXNldHRpbmcnKTtcbiAgICAgICAgY29uc3QgcGFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghcGFuZWwub2Zmc2V0V2lkdGgpIHJldHVybjtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBjYXJkIG9mIGNhcmRzKSB7XG4gICAgICAgICAgICAgICAgY2FyZC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1qYXJ2aXMtc2V0dGluZy1yb3dzJywgU3RyaW5nKGNhcmQub2Zmc2V0SGVpZ2h0ICsgMTApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhbmVsLmNsYXNzTGlzdC5hZGQoJ2phcnZpcy1wYWNrZWQtc2V0dGluZ3MnKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZ3JvdXBPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKHBhY2spO1xuICAgICAgICBpZiAocGFuZWwucGFyZW50RWxlbWVudCkgZ3JvdXBPYnNlcnZlci5vYnNlcnZlKHBhbmVsLnBhcmVudEVsZW1lbnQsIHsgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10gfSk7XG4gICAgICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBjb25zdCBzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIocGFjayk7XG4gICAgICAgICAgICBjYXJkcy5mb3JFYWNoKGNhcmQgPT4gc2l6ZU9ic2VydmVyLm9ic2VydmUoY2FyZCkpO1xuICAgICAgICB9XG4gICAgICAgIHBhY2soKTtcbiAgICB9KTtcbn1cbiIsICJleHBvcnQgdHlwZSBNb2R1bGVTZXR0aW5ncyA9IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+O1xuXG5pbnRlcmZhY2UgQ29uZmlnU2NoZW1hIHtcbiAgICBiYXNlS2V5OiBzdHJpbmc7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBkZWZhdWx0OiBib29sZWFuO1xuICAgIHN1YlNldHRpbmdzPzogeyBrZXk6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgZGVmYXVsdDogYm9vbGVhbiB9W107XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBISE1vZHVsZSB7XG4gICAgcmVhZG9ubHkgZ3JvdXAgPSAnSkFSVklTJztcbiAgICByZWFkb25seSBjb25maWdTY2hlbWE6IENvbmZpZ1NjaGVtYTtcbiAgICBoYXNSdW4gPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKHsgY29uZmlnU2NoZW1hIH06IHsgbmFtZTogc3RyaW5nOyBjb25maWdTY2hlbWE6IENvbmZpZ1NjaGVtYSB9KSB7XG4gICAgICAgIHRoaXMuY29uZmlnU2NoZW1hID0gY29uZmlnU2NoZW1hO1xuICAgIH1cblxuICAgIGFic3RyYWN0IHNob3VsZFJ1bigpOiBib29sZWFuO1xuICAgIGFic3RyYWN0IHJ1bihzZXR0aW5nczogTW9kdWxlU2V0dGluZ3MpOiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbn1cbiIsICJleHBvcnQgY29uc3QgTFNfQ09ORklHX05BTUUgPSAnSEhTdGFyayc7XG5cbmV4cG9ydCBmdW5jdGlvbiBsc0dldChrZXk6IHN0cmluZywgbHNfbmFtZSA9IExTX0NPTkZJR19OQU1FKTogdW5rbm93biB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gKSA/PyAnbnVsbCcpXG59XG5leHBvcnQgZnVuY3Rpb24gbHNTZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLnNldEl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gLCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpXG59XG5leHBvcnQgZnVuY3Rpb24gbHNSbShrZXk6IHN0cmluZywgbHNfbmFtZSA9IExTX0NPTkZJR19OQU1FKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGAke2xzX25hbWV9JHtrZXl9YClcbn1cbiIsICJleHBvcnQgdHlwZSBNYXJrID0gJ2ZyaWVuZCcgfCAnZm9lJztcblxuZXhwb3J0IGludGVyZmFjZSBTYXZlZE1hcmsge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIG1hcms6IE1hcms7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcGVuTWFya01hbmFnZXIocmVhZDogKCkgPT4gU2F2ZWRNYXJrW10sIHJlbW92ZTogKGlkOiBzdHJpbmcpID0+IGJvb2xlYW4sIGNsZWFyOiAoKSA9PiBib29sZWFuKSB7XG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qYXJ2aXMtbWFyay1tYW5hZ2VyJykpIHJldHVybjtcblxuICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpYWxvZycpO1xuICAgIGRpYWxvZy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstbWFuYWdlcic7XG4gICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JywgJ2phcnZpcy1tYXJrLW1hbmFnZXItdGl0bGUnKTtcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgdGl0bGUuaWQgPSAnamFydmlzLW1hcmstbWFuYWdlci10aXRsZSc7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSAnRnJpZW5kcyBhbmQgZm9lcyc7XG5cbiAgICBjb25zdCBsaXN0cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxpc3RzLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1saXN0cyc7XG4gICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGFjdGlvbnMuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLWFjdGlvbnMnO1xuICAgIGNvbnN0IGNsZWFyQWxsID0gbWFrZUJ1dHRvbignQ2xlYXIgYWxsIG1hcmtzJywgKCkgPT4ge1xuICAgICAgICBpZiAoY29uZmlybSgnUmVtb3ZlIGFsbCBmcmllbmQgYW5kIGZvZSBtYXJrcyBmb3IgdGhpcyBnYW1lPycpICYmIGNsZWFyKCkpIHtcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgY2xvc2UuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IGNsb3NlID0gbWFrZUJ1dHRvbignQ2xvc2UnLCAoKSA9PiBkaWFsb2cuY2xvc2UoKSk7XG4gICAgYWN0aW9ucy5hcHBlbmQoY2xlYXJBbGwsIGNsb3NlKTtcblxuICAgIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IHJlYWQoKS5zb3J0KChhLCBiKSA9PiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUsIHVuZGVmaW5lZCwgeyBudW1lcmljOiB0cnVlIH0pKTtcbiAgICAgICAgY29uc3Qgc2VjdGlvbnMgPSAoWydmcmllbmQnLCAnZm9lJ10gYXMgY29uc3QpLm1hcChtYXJrID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgICAgICAgICBjb25zdCBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBlbnRyaWVzLmZpbHRlcihlbnRyeSA9PiBlbnRyeS5tYXJrID09PSBtYXJrKTtcbiAgICAgICAgICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSAobWFyayA9PT0gJ2ZyaWVuZCcgPyAnRnJpZW5kcycgOiAnRm9lcycpICsgYCAoJHttYXRjaGVzLmxlbmd0aH0pYDtcbiAgICAgICAgICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoaGVhZGluZyk7XG5cbiAgICAgICAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVtcHR5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICAgICAgICAgIGVtcHR5LnRleHRDb250ZW50ID0gJ05vIHNhdmVkIHBsYXllcnMuJztcbiAgICAgICAgICAgICAgICBzZWN0aW9uLmFwcGVuZENoaWxkKGVtcHR5KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VjdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgaWQsIG5hbWUgfSBvZiBtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICAgICAgcGxheWVyLnRleHRDb250ZW50ID0gbmFtZTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIudGl0bGUgPSBgUGxheWVyIElEICR7aWR9YDtcbiAgICAgICAgICAgICAgICBjb25zdCBidXR0b24gPSBtYWtlQnV0dG9uKCdSZW1vdmUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gQXJyYXkuZnJvbShsaXN0cy5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKSkuaW5kZXhPZihidXR0b24pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3ZlKGlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmcgPSBsaXN0cy5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIChyZW1haW5pbmdbTWF0aC5taW4oaW5kZXgsIHJlbWFpbmluZy5sZW5ndGggLSAxKV0gfHwgY2xvc2UpLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgYFJlbW92ZSAke25hbWV9IGZyb20gJHttYXJrID09PSAnZnJpZW5kJyA/ICdmcmllbmRzJyA6ICdmb2VzJ31gKTtcbiAgICAgICAgICAgICAgICByb3cuYXBwZW5kKHBsYXllciwgYnV0dG9uKTtcbiAgICAgICAgICAgICAgICBsaXN0LmFwcGVuZENoaWxkKHJvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWN0aW9uLmFwcGVuZENoaWxkKGxpc3QpO1xuICAgICAgICAgICAgcmV0dXJuIHNlY3Rpb247XG4gICAgICAgIH0pO1xuICAgICAgICBsaXN0cy5yZXBsYWNlQ2hpbGRyZW4oLi4uc2VjdGlvbnMpO1xuICAgICAgICBjbGVhckFsbC5kaXNhYmxlZCA9IGVudHJpZXMubGVuZ3RoID09PSAwO1xuICAgIH1cblxuICAgIHJlbmRlcigpO1xuICAgIGRpYWxvZy5hcHBlbmQodGl0bGUsIGxpc3RzLCBhY3Rpb25zKTtcbiAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiBkaWFsb2cucmVtb3ZlKCksIHsgb25jZTogdHJ1ZSB9KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgIGNsb3NlLmZvY3VzKCk7XG59XG5cbmZ1bmN0aW9uIG1ha2VCdXR0b24obGFiZWw6IHN0cmluZywgb25DbGljazogKCkgPT4gdm9pZCkge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IGxhYmVsO1xuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spO1xuICAgIHJldHVybiBidXR0b247XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB0eXBlIHsgQ29udGVzdERhdGEgfSBmcm9tICcuLi8uLi9nYW1lLXR5cGVzJztcbmltcG9ydCB7IExTX0NPTkZJR19OQU1FLCBsc0dldCwgbHNTZXQgfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcbmltcG9ydCB7IG9wZW5NYXJrTWFuYWdlciwgdHlwZSBNYXJrLCB0eXBlIFNhdmVkTWFyayB9IGZyb20gJy4vbWFya01hbmFnZXInO1xuXG50eXBlIE1hcmtNb2RlID0gTWFyayB8ICcnO1xuY29uc3QgREVGQVVMVF9DT0xPUlM6IFJlY29yZDxNYXJrLCBzdHJpbmc+ID0geyBmcmllbmQ6ICcjNDhhOWZmJywgZm9lOiAnI2ZmNjE3MycgfTtcblxuZXhwb3J0IGNsYXNzIEZyaWVuZEFuZEZvZXMgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBuYW1lcyA9IG5ldyBNYXA8SFRNTEVsZW1lbnQsIHN0cmluZz4oKTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGZvY3VzYWJsZU5hbWVzID0gbmV3IE1hcDxIVE1MRWxlbWVudCwgc3RyaW5nIHwgbnVsbD4oKTtcbiAgICBwcml2YXRlIG1vZGU6IE1hcmtNb2RlID0gJyc7XG4gICAgcHJpdmF0ZSBtYXJrTWVudTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJvb3Q6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByb290U2VsZWN0b3IgPSAnJztcbiAgICBwcml2YXRlIGluTGVhZ3VlID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdmcmllbmRBbmRGb2VzJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkZyaWVuZHMgYW5kIGZvZXNcIiwgXCJSaWdodC1jbGljayBhIG5hbWUgdG8gbWFyayBvciB1bm1hcmsgaXQuIENsaWNrIG1vcmUgbmFtZXMgdG8ga2VlcCBtYXJraW5nIGFuZCBwcmVzcyBFc2MgdG8gZXhpdC4gTWFuYWdlIHNhdmVkIG1hcmtzIGJlbG93LlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ2xlYWd1ZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiSW4gbGVhZ3Vlc1wiLCBcIlNob3cgbWFya3MgYW5kIGFsbG93IG1hcmtpbmcgaW4gbGVhZ3VlIHRhYmxlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2NvbnRlc3RzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJJbiBjb250ZXN0c1wiLCBcIlNob3cgbWFya3MgYW5kIGFsbG93IG1hcmtpbmcgb24gY29udGVzdCBsZWFkZXJib2FyZHMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoeyBuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWEgfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gWycvbGVhZ3Vlcy5odG1sJywgJy9hY3Rpdml0aWVzLmh0bWwnXS5pbmNsdWRlcyhjdXJyZW50UGFnZSk7XG4gICAgfVxuXG4gICAgcmVhZFNldHRpbmcoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBsc0dldChrZXkpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVhZE1hcmtzKCk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICAgICAgY29uc3Qgc3RvcmVkID0gdGhpcy5yZWFkU2V0dGluZygnUGxheWVyTWFya3MnKTtcbiAgICAgICAgaWYgKHN0b3JlZCAmJiB0eXBlb2Ygc3RvcmVkID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShzdG9yZWQpKSByZXR1cm4gc3RvcmVkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gICAgICAgIGNvbnN0IG1hcmtzOiBSZWNvcmQ8c3RyaW5nLCBNYXJrPiA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIG1hcmtdIG9mIFtbJ0ZyaWVuZExpc3QnLCAnZnJpZW5kJ10sIFsnRm9lTGlzdCcsICdmb2UnXV0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSB0aGlzLnJlYWRTZXR0aW5nKGtleSk7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdCkpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGxpc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoL15bMS05XVxcZCokLy50ZXN0KFN0cmluZyhpZCkpKSBtYXJrc1tTdHJpbmcoaWQpXSA9IG1hcms7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcmtzO1xuICAgIH1cblxuICAgIHJlYWRDb2xvcnMoKTogUmVjb3JkPE1hcmssIHN0cmluZz4ge1xuICAgICAgICBjb25zdCBzYXZlZCA9IHRoaXMucmVhZFNldHRpbmcoJ1BsYXllck1hcmtDb2xvcnMnKSBhcyBQYXJ0aWFsPFJlY29yZDxNYXJrLCB1bmtub3duPj4gfCBudWxsO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZnJpZW5kOiB0eXBlb2Ygc2F2ZWQ/LmZyaWVuZCA9PT0gJ3N0cmluZycgJiYgL14jW1xcZGEtZl17Nn0kL2kudGVzdChzYXZlZC5mcmllbmQpID8gc2F2ZWQuZnJpZW5kIDogREVGQVVMVF9DT0xPUlMuZnJpZW5kLFxuICAgICAgICAgICAgZm9lOiB0eXBlb2Ygc2F2ZWQ/LmZvZSA9PT0gJ3N0cmluZycgJiYgL14jW1xcZGEtZl17Nn0kL2kudGVzdChzYXZlZC5mb2UpID8gc2F2ZWQuZm9lIDogREVGQVVMVF9DT0xPUlMuZm9lXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmVhZFNhdmVkTmFtZXMoKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IHNhdmVkID0gdGhpcy5yZWFkU2V0dGluZygnUGxheWVyTWFya05hbWVzJyk7XG4gICAgICAgIGlmICghc2F2ZWQgfHwgdHlwZW9mIHNhdmVkICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHNhdmVkKSkgcmV0dXJuIHt9O1xuICAgICAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKHNhdmVkKS5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgW3N0cmluZywgc3RyaW5nXSA9PiB0eXBlb2YgZW50cnlbMV0gPT09ICdzdHJpbmcnKSk7XG4gICAgfVxuXG4gICAgc2F2ZU5hbWVzKG5hbWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsc1NldCgnUGxheWVyTWFya05hbWVzJywgbmFtZXMpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCByZW1lbWJlciBtYXJrZWQgcGxheWVyIG5hbWVzOicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVNYXJrKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgbWFya3MgPSB0aGlzLnJlYWRNYXJrcygpO1xuICAgICAgICBkZWxldGUgbWFya3NbaWRdO1xuICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtzJywgbWFya3MpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gdGhpcy5yZWFkU2F2ZWROYW1lcygpO1xuICAgICAgICBpZiAoaWQgaW4gbmFtZXMpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBuYW1lc1tpZF07XG4gICAgICAgICAgICB0aGlzLnNhdmVOYW1lcyhuYW1lcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmVhZFNhdmVkTWFya3MoKSB7XG4gICAgICAgIGNvbnN0IG5hbWVzID0gdGhpcy5yZWFkU2F2ZWROYW1lcygpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmVudHJpZXModGhpcy5yZWFkTWFya3MoKSkuZmxhdE1hcDxTYXZlZE1hcms+KChbaWQsIG1hcmtdKSA9PlxuICAgICAgICAgICAgL15bMS05XVxcZCokLy50ZXN0KGlkKSAmJiAobWFyayA9PT0gJ2ZyaWVuZCcgfHwgbWFyayA9PT0gJ2ZvZScpXG4gICAgICAgICAgICAgICAgPyBbeyBpZCwgbmFtZTogbmFtZXNbaWRdIHx8IGBQbGF5ZXIgIyR7aWR9YCwgbWFyayB9XVxuICAgICAgICAgICAgICAgIDogW10pO1xuICAgIH1cblxuICAgIHNhdmVTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbHNTZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICBhbGVydCgnSmFydmlzIGNvdWxkIG5vdCBzYXZlIHlvdXIgRnJpZW5kcyBhbmQgRm9lcyBzZXR0aW5ncy4nKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluc3RhbGxTZXR0aW5ncygpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRQYWdlICE9PSAnL2hvbWUuaHRtbCcpIHJldHVybjtcblxuICAgICAgICBjb25zdCBzZWxlY3RvciA9ICcuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZ1tyZWw9XCJKQVJWSVNfZnJpZW5kQW5kRm9lc1wiXSAuc3ViLXNldHRpbmdzJztcbiAgICAgICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICghc2V0dGluZ3MgfHwgc2V0dGluZ3MucXVlcnlTZWxlY3RvcignLmphcnZpcy1tYXJrLWNvbG9yJykpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgaW5wdXRzID0gbmV3IE1hcDxNYXJrLCBIVE1MSW5wdXRFbGVtZW50PigpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBbbWFyaywgdGV4dF0gb2YgW1snZnJpZW5kJywgJ0ZyaWVuZCBuYW1lIGNvbG9yJ10sIFsnZm9lJywgJ0ZvZSBuYW1lIGNvbG9yJ11dIGFzIGNvbnN0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1jb2xvcic7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgICAgICBpbnB1dC50eXBlID0gJ2NvbG9yJztcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHRoaXMucmVhZENvbG9ycygpW21hcmtdO1xuICAgICAgICAgICAgICAgIGlucHV0cy5zZXQobWFyaywgaW5wdXQpO1xuICAgICAgICAgICAgICAgIGlucHV0LmRpc2FibGVkID0gIXNldHRpbmdzLmNsb3Nlc3QoJy5jb25maWctc2V0dGluZycpPy5jbGFzc0xpc3QuY29udGFpbnMoJ2VuYWJsZWQnKTtcbiAgICAgICAgICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9ycyA9IHRoaXMucmVhZENvbG9ycygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtDb2xvcnMnLCB7IC4uLmNvbG9ycywgW21hcmtdOiBpbnB1dC52YWx1ZSB9KSkgaW5wdXQudmFsdWUgPSBjb2xvcnNbbWFya107XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbGFiZWwuYXBwZW5kKHRpdGxlLCBpbnB1dCk7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYXBwZW5kQ2hpbGQobGFiZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVzZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIHJlc2V0LnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIHJlc2V0LmNsYXNzTmFtZSA9ICdqYXJ2aXMtc2V0dGluZy1hY3Rpb24nO1xuICAgICAgICAgICAgcmVzZXQudGV4dENvbnRlbnQgPSAnUmVzZXQgY29sb3JzJztcbiAgICAgICAgICAgIHJlc2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya0NvbG9ycycsIHt9KSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW21hcmssIGlucHV0XSBvZiBpbnB1dHMpIGlucHV0LnZhbHVlID0gREVGQVVMVF9DT0xPUlNbbWFya107XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IG1hbmFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgbWFuYWdlLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIG1hbmFnZS5jbGFzc05hbWUgPSAnamFydmlzLXNldHRpbmctYWN0aW9uJztcbiAgICAgICAgICAgIG1hbmFnZS50ZXh0Q29udGVudCA9ICdNYW5hZ2UgbWFya3MnO1xuICAgICAgICAgICAgbWFuYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gb3Blbk1hcmtNYW5hZ2VyKFxuICAgICAgICAgICAgICAgICgpID0+IHRoaXMucmVhZFNhdmVkTWFya3MoKSxcbiAgICAgICAgICAgICAgICBpZCA9PiB0aGlzLnJlbW92ZU1hcmsoaWQpLFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNhdmVTZXR0aW5nKCdQbGF5ZXJNYXJrcycsIHt9KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVOYW1lcyh7fSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgYWN0aW9ucy5jbGFzc05hbWUgPSAnamFydmlzLW1hcmstc2V0dGluZy1hY3Rpb25zJztcbiAgICAgICAgICAgIGFjdGlvbnMuYXBwZW5kKHJlc2V0LCBtYW5hZ2UpO1xuICAgICAgICAgICAgc2V0dGluZ3MuYXBwZW5kQ2hpbGQoYWN0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNsb3NlTWFya01lbnUoKSB7XG4gICAgICAgIHRoaXMubWFya01lbnU/LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLm1hcmtNZW51ID0gbnVsbDtcbiAgICB9XG5cbiAgICBvcGVuTWFya01lbnUoZXZlbnQ6IE1vdXNlRXZlbnQsIG5hbWU6IEhUTUxFbGVtZW50LCBpZDogc3RyaW5nKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLmNsb3NlTWFya01lbnUoKTtcblxuICAgICAgICBjb25zdCBtZW51ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG1lbnUuY2xhc3NOYW1lID0gJ2phcnZpcy1tYXJrLW1lbnUnO1xuICAgICAgICBtZW51LnNldEF0dHJpYnV0ZSgncm9sZScsICdncm91cCcpO1xuICAgICAgICBtZW51LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdNYXJrIHBsYXllcicpO1xuICAgICAgICBjb25zdCBhZGRBY3Rpb24gPSAodGV4dDogc3RyaW5nLCBhY3Q6ICgpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG4gICAgICAgICAgICAgICAgYWN0KCk7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUuaXNDb25uZWN0ZWQgJiYgdGhpcy5tb2RlKSBuYW1lLmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbWVudS5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB9O1xuICAgICAgICBmb3IgKGNvbnN0IFttb2RlLCB0ZXh0XSBvZiBbWydmcmllbmQnLCAnTWFyayBhcyBmcmllbmQnXSwgWydmb2UnLCAnTWFyayBhcyBmb2UnXV0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgIGFkZEFjdGlvbih0ZXh0LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRNb2RlKG1vZGUpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm5hbWVzLmdldChuYW1lKSA9PT0gaWQpIHRoaXMuYXBwbHlNYXJrKGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lLmRhdGFzZXQuamFydmlzTWFyaykgYWRkQWN0aW9uKCdSZW1vdmUgdGhpcyBwbGF5ZXLigJlzIG1hcmsnLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZW1vdmVNYXJrKGlkKSkgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5tb2RlKSBhZGRBY3Rpb24oJ0V4aXQgbWFya2luZyBtb2RlIChFc2MpJywgKCkgPT4gdGhpcy5zZXRNb2RlKCcnKSk7XG4gICAgICAgIG1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGljayA9PiBjbGljay5zdG9wUHJvcGFnYXRpb24oKSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWVudSk7XG4gICAgICAgIHRoaXMubWFya01lbnUgPSBtZW51O1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IG5hbWUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHggPSBldmVudC5jbGllbnRYIHx8IGJvdW5kcy5sZWZ0O1xuICAgICAgICBjb25zdCB5ID0gZXZlbnQuY2xpZW50WSB8fCBib3VuZHMuYm90dG9tO1xuICAgICAgICBtZW51LnN0eWxlLmxlZnQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih4LCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggLSBtZW51Lm9mZnNldFdpZHRoKSkgKyAncHgnO1xuICAgICAgICBtZW51LnN0eWxlLnRvcCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHksIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgLSBtZW51Lm9mZnNldEhlaWdodCkpICsgJ3B4JztcbiAgICAgICAgbWVudS5xdWVyeVNlbGVjdG9yKCdidXR0b24nKT8uZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIHNldE1vZGUobW9kZTogTWFya01vZGUpIHtcbiAgICAgICAgdGhpcy5tb2RlID0gbW9kZTtcbiAgICAgICAgdGhpcy5yb290Py5jbGFzc0xpc3QudG9nZ2xlKCdqYXJ2aXMtbWFyay1tb2RlJywgISFtb2RlKTtcblxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5uYW1lcy5rZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChtb2RlICYmIG5hbWUudGFiSW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c2FibGVOYW1lcy5zZXQobmFtZSwgbmFtZS5nZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JykpO1xuICAgICAgICAgICAgICAgIG5hbWUudGFiSW5kZXggPSAwO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghbW9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdG9yZUZvY3VzKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVzdG9yZUZvY3VzKG5hbWU6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHRhYmluZGV4ID0gdGhpcy5mb2N1c2FibGVOYW1lcy5nZXQobmFtZSk7XG4gICAgICAgIGlmICh0YWJpbmRleCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgIGlmICh0YWJpbmRleCA9PT0gbnVsbCkgbmFtZS5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgICAgIGVsc2UgbmFtZS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgdGFiaW5kZXgpO1xuICAgICAgICB0aGlzLmZvY3VzYWJsZU5hbWVzLmRlbGV0ZShuYW1lKTtcbiAgICB9XG5cbiAgICBnZXRDb250ZXN0TmFtZXMocm9vdDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgbmFtZXMgPSBuZXcgTWFwPEhUTUxFbGVtZW50LCBzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IGJ5Q29udGVzdCA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj4+KCk7XG4gICAgICAgIGNvbnN0IGNvbnRlc3RzID0gT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHMgfHwge30pLmZpbHRlcigobGlzdCk6IGxpc3QgaXMgQ29udGVzdERhdGFbXSA9PiBBcnJheS5pc0FycmF5KGxpc3QpKS5mbGF0KCk7XG5cbiAgICAgICAgZm9yIChjb25zdCByb3cgb2Ygcm9vdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxUYWJsZVJvd0VsZW1lbnQ+KCcubGVhZFRhYmxlIHRyJykpIHtcbiAgICAgICAgICAgIGNvbnN0IGNlbGwgPSByb3cuY2VsbHM/LlsxXTtcbiAgICAgICAgICAgIGlmICghY2VsbCB8fCBjZWxsLmxvY2FsTmFtZSAhPT0gJ3RkJykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gY2VsbC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLm5pY2tuYW1lJykgfHwgY2VsbDtcbiAgICAgICAgICAgIGxldCBpZCA9IHJvdy5nZXRBdHRyaWJ1dGUoJ3NvcnRpbmdfaWQnKSB8fCBuYW1lLmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJykgfHxcbiAgICAgICAgICAgICAgICBuYW1lLnF1ZXJ5U2VsZWN0b3IoJ1tpZC1tZW1iZXJdJyk/LmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJyk7XG4gICAgICAgICAgICBjb25zdCBjb250ZXN0SWQgPSByb3cuY2xvc2VzdCgnW2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKGNvbnRlc3RJZCkge1xuICAgICAgICAgICAgICAgIGxldCBieU5hbWUgPSBieUNvbnRlc3QuZ2V0KGNvbnRlc3RJZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFieU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydGljaXBhbnRzID0gY29udGVzdHMuZmluZChjb250ZXN0ID0+IFN0cmluZyhjb250ZXN0LmlkX2NvbnRlc3QpID09PSBjb250ZXN0SWQpPy5wYXJ0aWNpcGFudHM7XG4gICAgICAgICAgICAgICAgICAgIGJ5TmFtZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IG5pY2tuYW1lLCBpZF9tZW1iZXIgfSBvZiBPYmplY3QudmFsdWVzKHBhcnRpY2lwYW50cyB8fCB7fSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5pY2tuYW1lS2V5ID0gU3RyaW5nKG5pY2tuYW1lID8/ICcnKS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5pY2tuYW1lS2V5IHx8ICEvXlsxLTldXFxkKiQvLnRlc3QoU3RyaW5nKGlkX21lbWJlcikpKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBieU5hbWUuZ2V0KG5pY2tuYW1lS2V5KSB8fCBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZXMuYWRkKFN0cmluZyhpZF9tZW1iZXIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5TmFtZS5zZXQobmlja25hbWVLZXksIG1hdGNoZXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJ5Q29udGVzdC5zZXQoY29udGVzdElkLCBieU5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYnlOYW1lLmdldCgobmFtZS50ZXh0Q29udGVudCA/PyAnJykudHJpbSgpKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcyAmJiAhbWF0Y2hlcy5oYXMoaWQgPz8gJycpKSBpZCA9IG1hdGNoZXMuc2l6ZSA9PT0gMSA/IG1hdGNoZXMudmFsdWVzKCkubmV4dCgpLnZhbHVlIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZCAmJiAvXlsxLTldXFxkKiQvLnRlc3QoaWQpKSBuYW1lcy5zZXQobmFtZSwgaWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYW1lcztcbiAgICB9XG5cbiAgICByZWZyZXNoKCkge1xuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4odGhpcy5yb290U2VsZWN0b3IpO1xuICAgICAgICBpZiAodGhpcy5yb290ICYmIHRoaXMucm9vdCAhPT0gcm9vdCkgdGhpcy5yb290LmNsYXNzTGlzdC5yZW1vdmUoJ2phcnZpcy1tYXJrLW1vZGUnKTtcbiAgICAgICAgdGhpcy5yb290ID0gcm9vdDtcbiAgICAgICAgY29uc3QgbmFtZXMgPSAhcm9vdCA/IG5ldyBNYXA8SFRNTEVsZW1lbnQsIHN0cmluZz4oKSA6IHRoaXMuaW5MZWFndWVcbiAgICAgICAgICAgID8gbmV3IE1hcChBcnJheS5mcm9tKHJvb3QucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5uaWNrbmFtZVtpZC1tZW1iZXJdJyksIG5hbWUgPT4gW25hbWUsIG5hbWUuZ2V0QXR0cmlidXRlKCdpZC1tZW1iZXInKV0gYXMgY29uc3QpXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyByZWFkb25seSBbSFRNTEVsZW1lbnQsIHN0cmluZ10gPT4gISFlbnRyeVsxXSAmJiAvXlsxLTldXFxkKiQvLnRlc3QoZW50cnlbMV0pKSlcbiAgICAgICAgICAgIDogdGhpcy5nZXRDb250ZXN0TmFtZXMocm9vdCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMubmFtZXMua2V5cygpKSB7XG4gICAgICAgICAgICBpZiAobmFtZXMuaGFzKG5hbWUpKSBjb250aW51ZTtcbiAgICAgICAgICAgIGRlbGV0ZSBuYW1lLmRhdGFzZXQuamFydmlzUGxheWVyO1xuICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrO1xuICAgICAgICAgICAgdGhpcy5yZXN0b3JlRm9jdXMobmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5hbWVzID0gbmFtZXM7XG4gICAgICAgIGlmICghcm9vdCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBtYXJrcyA9IHRoaXMucmVhZE1hcmtzKCk7XG4gICAgICAgIGNvbnN0IHNhdmVkTmFtZXMgPSB0aGlzLnJlYWRTYXZlZE5hbWVzKCk7XG4gICAgICAgIGxldCBuYW1lc0NoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgY29sb3JzID0gdGhpcy5yZWFkQ29sb3JzKCk7XG4gICAgICAgIGZvciAoY29uc3QgW21hcmssIGNvbG9yXSBvZiBPYmplY3QuZW50cmllcyhjb2xvcnMpKSB7XG4gICAgICAgICAgICBjb25zdCBwcm9wZXJ0eSA9ICctLWphcnZpcy0nICsgbWFyayArICctY29sb3InO1xuICAgICAgICAgICAgaWYgKHJvb3Quc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eSkgIT09IGNvbG9yKSByb290LnN0eWxlLnNldFByb3BlcnR5KHByb3BlcnR5LCBjb2xvcik7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgaWRdIG9mIG5hbWVzKSB7XG4gICAgICAgICAgICBpZiAobmFtZS5kYXRhc2V0LmphcnZpc1BsYXllciAhPT0gaWQpIG5hbWUuZGF0YXNldC5qYXJ2aXNQbGF5ZXIgPSBpZDtcbiAgICAgICAgICAgIGNvbnN0IG1hcmsgPSBtYXJrc1tpZF07XG4gICAgICAgICAgICBpZiAobWFyayA9PT0gJ2ZyaWVuZCcgfHwgbWFyayA9PT0gJ2ZvZScpIHtcbiAgICAgICAgICAgICAgICBpZiAobmFtZS5kYXRhc2V0LmphcnZpc01hcmsgIT09IG1hcmspIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrID0gbWFyaztcbiAgICAgICAgICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IG5hbWUudGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBpZiAoZGlzcGxheU5hbWUgJiYgc2F2ZWROYW1lc1tpZF0gIT09IGRpc3BsYXlOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHNhdmVkTmFtZXNbaWRdID0gZGlzcGxheU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIG5hbWVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChuYW1lLmRhdGFzZXQuamFydmlzTWFyaykge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBuYW1lLmRhdGFzZXQuamFydmlzTWFyaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZXNDaGFuZ2VkKSB0aGlzLnNhdmVOYW1lcyhzYXZlZE5hbWVzKTtcbiAgICAgICAgdGhpcy5zZXRNb2RlKHRoaXMubW9kZSk7XG4gICAgfVxuXG4gICAgYXBwbHlNYXJrKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1vZGUpIHJldHVybjtcbiAgICAgICAgY29uc3QgbWFya3MgPSB0aGlzLnJlYWRNYXJrcygpO1xuICAgICAgICBtYXJrc1tpZF0gPSB0aGlzLm1vZGU7XG5cbiAgICAgICAgdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya3MnLCBtYXJrcyk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIG1hcmtQbGF5ZXIoZXZlbnQ6IE1vdXNlRXZlbnQgfCBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGV2ZW50IGluc3RhbmNlb2YgS2V5Ym9hcmRFdmVudCA/IGV2ZW50LmtleSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGtleSA9PT0gJ0VzY2FwZScgJiYgKHRoaXMubW9kZSB8fCB0aGlzLm1hcmtNZW51KSkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG4gICAgICAgICAgICB0aGlzLnNldE1vZGUoJycpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlICYmIHRoaXMubWFya01lbnU/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdjbGljaycpIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuXG4gICAgICAgIGNvbnN0IG5hbWUgPSBldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ID8gZXZlbnQudGFyZ2V0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCdbZGF0YS1qYXJ2aXMtcGxheWVyXScpIDogbnVsbDtcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGlkID0gdGhpcy5uYW1lcy5nZXQobmFtZSk7XG4gICAgICAgIGlmICghaWQpIHJldHVybjtcbiAgICAgICAgaWYgKGV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCAmJiAoZXZlbnQudHlwZSA9PT0gJ2NvbnRleHRtZW51JyB8fCAoZXZlbnQudHlwZSA9PT0gJ2NsaWNrJyAmJiBldmVudC5hbHRLZXkpKSkge1xuICAgICAgICAgICAgdGhpcy5vcGVuTWFya01lbnUoZXZlbnQsIG5hbWUsIGlkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMubW9kZSB8fCAoZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nICYmIGtleSAhPT0gJ0VudGVyJyAmJiBrZXkgIT09ICcgJykpIHJldHVybjtcblxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5hcHBseU1hcmsoaWQpO1xuICAgIH1cblxuICAgIHJ1bih7IGxlYWd1ZSwgY29udGVzdHMgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHRoaXMuaW5MZWFndWUgPSBjdXJyZW50UGFnZSA9PT0gJy9sZWFndWVzLmh0bWwnO1xuICAgICAgICBpZiAodGhpcy5pbkxlYWd1ZSA/ICFsZWFndWUgOiAhY29udGVzdHMpIHJldHVybjtcblxuICAgICAgICB0aGlzLnJvb3RTZWxlY3RvciA9IHRoaXMuaW5MZWFndWUgPyAnLmxlYWd1ZV90YWJsZScgOiAnI2NvbnRlc3RzIC5yaWdodF9wYXJ0JztcbiAgICAgICAgY29uc3QgbWFya1BsYXllciA9IChldmVudDogTW91c2VFdmVudCB8IEtleWJvYXJkRXZlbnQpID0+IHRoaXMubWFya1BsYXllcihldmVudCk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbWFya1BsYXllciwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBtYXJrUGxheWVyLCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBtYXJrUGxheWVyLCB0cnVlKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3N0b3JhZ2UnLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoIWV2ZW50LmtleSB8fCBbJ1BsYXllck1hcmtzJywgJ1BsYXllck1hcmtDb2xvcnMnLCAnRnJpZW5kTGlzdCcsICdGb2VMaXN0J11cbiAgICAgICAgICAgICAgICAuc29tZShrZXkgPT4gZXZlbnQua2V5ID09PSBMU19DT05GSUdfTkFNRSArIGtleSkpIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKG11dGF0aW9ucyA9PiB7XG4gICAgICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnJvb3RTZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAocm9vdCAhPT0gdGhpcy5yb290IHx8IChyb290ICYmIG11dGF0aW9ucy5zb21lKCh7IHRhcmdldCB9KSA9PiByb290LmNvbnRhaW5zKHRhcmdldCkpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICBjaGFyYWN0ZXJEYXRhOiB0cnVlLFxuICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFsnc29ydGluZ19pZCcsICdpZC1tZW1iZXInLCAnaWRfY29udGVzdCddXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuXG5leHBvcnQgdHlwZSBDb250ZXN0S2luZCA9ICdkYWlseScgfCAnZXZlbnQnO1xuZXhwb3J0IHR5cGUgQ29udGVzdFJhbmsgPSAndG9wJyB8ICdtaW5lJztcblxuY29uc3QgQ09OVEVTVF9LSU5EUyA9IFtbJ2RhaWx5JywgJ0RhaWx5J10sIFsnZXZlbnQnLCAnRXZlbnQnXV0gYXMgY29uc3Q7XG5jb25zdCBDT05URVNUX1JBTktTID0gW1sndG9wJywgJ1RvcCddLCBbJ21pbmUnLCAnTXkgcmFuayddXSBhcyBjb25zdDtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRDb250ZXN0U2V0dGluZyhrZXk6IHN0cmluZyk6IHVua25vd24ge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBsc0dldChrZXkpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQ29udGVzdERlZmF1bHRzKCkge1xuICAgIGNvbnN0IGtpbmQ6IENvbnRlc3RLaW5kID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0S2luZCcpID09PSAnZXZlbnQnID8gJ2V2ZW50JyA6ICdkYWlseSc7XG4gICAgY29uc3QgcmFuazogQ29udGVzdFJhbmsgPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RSYW5rU3RhcnQnKSA9PT0gJ21pbmUnID8gJ21pbmUnIDogJ3RvcCc7XG4gICAgcmV0dXJuIHsga2luZCwgcmFuayB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZFBpbm5lZFJhbmsoaWQ6IHN0cmluZywgZmFsbGJhY2s6IENvbnRlc3RSYW5rKTogQ29udGVzdFJhbmsge1xuICAgIGNvbnN0IHNhdmVkID0gcmVhZENvbnRlc3RTZXR0aW5nKCdDb250ZXN0UGlubmVkUmFuaycpO1xuICAgIGlmIChzYXZlZCAmJiB0eXBlb2Ygc2F2ZWQgPT09ICdvYmplY3QnICYmICdpZCcgaW4gc2F2ZWQgJiYgc2F2ZWQuaWQgPT09IGlkICYmICdyYW5rJyBpbiBzYXZlZCkge1xuICAgICAgICBpZiAoc2F2ZWQucmFuayA9PT0gJ21pbmUnIHx8IHNhdmVkLnJhbmsgPT09ICd0b3AnKSByZXR1cm4gc2F2ZWQucmFuaztcbiAgICB9XG4gICAgcmV0dXJuIGZhbGxiYWNrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVJhbmtDaG9pY2UobGFiZWw6IHN0cmluZywgc2VsZWN0OiAocmFuazogQ29udGVzdFJhbmspID0+IHZvaWQpIHtcbiAgICByZXR1cm4gbWFrZUNob2ljZShsYWJlbCwgQ09OVEVTVF9SQU5LUywgc2VsZWN0KTtcbn1cblxuZnVuY3Rpb24gbWFrZUNob2ljZTxUIGV4dGVuZHMgc3RyaW5nPihsYWJlbDogc3RyaW5nLCBvcHRpb25zOiBSZWFkb25seUFycmF5PHJlYWRvbmx5IFtULCBzdHJpbmddPiwgc2VsZWN0OiAodmFsdWU6IFQpID0+IHZvaWQpIHtcbiAgICBjb25zdCBncm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBncm91cC5jbGFzc05hbWUgPSAnamFydmlzLWNvbnRlc3QtY2hvaWNlJztcbiAgICBncm91cC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnZ3JvdXAnKTtcbiAgICBncm91cC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBsYWJlbCk7XG4gICAgZ3JvdXAuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICBmb3IgKGNvbnN0IFt2YWx1ZSwgdGV4dF0gb2Ygb3B0aW9ucykge1xuICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgYnV0dG9uLmRhdGFzZXQuY29udGVzdENob2ljZSA9IHZhbHVlO1xuICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHNlbGVjdCh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBncm91cC5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgIH1cbiAgICByZXR1cm4gZ3JvdXA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RDb250ZXN0Q2hvaWNlKGdyb3VwOiBIVE1MRWxlbWVudCwgdmFsdWU6IHN0cmluZykge1xuICAgIGZvciAoY29uc3QgYnV0dG9uIG9mIGdyb3VwLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpKSB7XG4gICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIFN0cmluZyhidXR0b24uZGF0YXNldC5jb250ZXN0Q2hvaWNlID09PSB2YWx1ZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxDb250ZXN0U2V0dGluZ3MoKSB7XG4gICAgaWYgKGN1cnJlbnRQYWdlICE9PSAnL2hvbWUuaHRtbCcpIHJldHVybjtcblxuICAgIGNvbnN0IHNlbGVjdG9yID0gJy5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmNvbmZpZy1zZXR0aW5nW3JlbD1cIkpBUlZJU19jb250ZXN0U3RhcnRcIl0nO1xuICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICBpZiAoIWNhcmQgfHwgY2FyZC5xdWVyeVNlbGVjdG9yKCcuamFydmlzLWNvbnRlc3Qtc2V0dGluZ3MnKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGZpZWxkc2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZmllbGRzZXQnKTtcbiAgICAgICAgZmllbGRzZXQuY2xhc3NOYW1lID0gJ2phcnZpcy1jb250ZXN0LXNldHRpbmdzJztcbiAgICAgICAgZmllbGRzZXQuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ0NvbnRlc3Qgc3RhcnR1cCBkZWZhdWx0cycpO1xuICAgICAgICBjb25zdCBzYXZlID0gKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBncm91cDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbHNTZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShncm91cCwgdmFsdWUpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGNvbnRlc3QgZGVmYXVsdDonLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBraW5kcyA9IG1ha2VDaG9pY2UoJ1ByZWZlcnJlZCBjb250ZXN0JywgQ09OVEVTVF9LSU5EUywgdmFsdWUgPT4gc2F2ZSgnQ29udGVzdEtpbmQnLCB2YWx1ZSwga2luZHMpKTtcbiAgICAgICAgY29uc3QgcmFua3MgPSBtYWtlUmFua0Nob2ljZSgnRGVmYXVsdCBsZWFkZXJib2FyZCBwb3NpdGlvbicsIHZhbHVlID0+IHNhdmUoJ0NvbnRlc3RSYW5rU3RhcnQnLCB2YWx1ZSwgcmFua3MpKTtcbiAgICAgICAgY29uc3QgZGVmYXVsdHMgPSByZWFkQ29udGVzdERlZmF1bHRzKCk7XG4gICAgICAgIHNlbGVjdENvbnRlc3RDaG9pY2Uoa2luZHMsIGRlZmF1bHRzLmtpbmQpO1xuICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKHJhbmtzLCBkZWZhdWx0cy5yYW5rKTtcblxuICAgICAgICBjb25zdCBraW5kTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAga2luZExhYmVsLmlubmVySFRNTCA9IHNldHRpbmdIZWxwKCdQcmVmZXJyZWQgY29udGVzdCcsICdEYWlseSBvcGVucyB0aGUgZmlyc3QgYWN0aXZlIGRhaWx5IGNvbnRlc3QuIEV2ZW50IG9wZW5zIHRoZSBsYXN0IGFjdGl2ZSBldmVudCBjb250ZXN0LCBvciB0aGUgZGFpbHkgY29udGVzdCBpZiB0aGVyZSBpcyBubyBldmVudC4nKTtcbiAgICAgICAgY29uc3QgcmFua0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHJhbmtMYWJlbC5pbm5lckhUTUwgPSBzZXR0aW5nSGVscCgnTGVhZGVyYm9hcmQgc3RhcnQnLCAnT3BlbiBhdCB0aGUgdG9wIG9yIGF0IHlvdXIgcmFuay4gQSBzdGFycmVkIGNvbnRlc3QgY2FuIGhhdmUgaXRzIG93biBwb3NpdGlvbi4nKTtcbiAgICAgICAgZmllbGRzZXQuYXBwZW5kKGtpbmRMYWJlbCwga2luZHMsIHJhbmtMYWJlbCwgcmFua3MpO1xuICAgICAgICBjb25zdCByZWZyZXNoRW5hYmxlZCA9ICgpID0+IGZpZWxkc2V0LmRpc2FibGVkID0gIWNhcmQuY2xhc3NMaXN0LmNvbnRhaW5zKCdlbmFibGVkJyk7XG4gICAgICAgIHJlZnJlc2hFbmFibGVkKCk7XG4gICAgICAgIG5ldyBNdXRhdGlvbk9ic2VydmVyKHJlZnJlc2hFbmFibGVkKS5vYnNlcnZlKGNhcmQsIHsgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10gfSk7XG4gICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoZmllbGRzZXQpO1xuICAgIH0pO1xufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgJCwgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCwgbHNSbSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgbWFrZVJhbmtDaG9pY2UsIHJlYWRDb250ZXN0RGVmYXVsdHMsIHJlYWRDb250ZXN0U2V0dGluZywgcmVhZFBpbm5lZFJhbmssIHNlbGVjdENvbnRlc3RDaG9pY2UsIHR5cGUgQ29udGVzdEtpbmQgfSBmcm9tICcuL2NvbnRlc3RQcmVmZXJlbmNlcyc7XG5cbmludGVyZmFjZSBDb250ZXN0Q2FyZCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBjYXJkOiBIVE1MRWxlbWVudDtcbiAgICBoZWFkZXI6IEhUTUxFbGVtZW50O1xuICAgIHRpdGxlOiBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBraW5kOiBDb250ZXN0S2luZCB8IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcm1Db250ZXN0U3RhcnR1cEd1YXJkKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZSAhPT0gJy9hY3Rpdml0aWVzLmh0bWwnIHx8IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKS5nZXQoJ3RhYicpICE9PSAnY29udGVzdHMnKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBpZiAoSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnSEhQbHVzUGx1c0NvbmZpZycpID8/ICdudWxsJyk/LkpBUlZJU19jb250ZXN0U3RhcnQgPT09IGZhbHNlKSByZXR1cm47XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBLZWVwIGJvdGggcGFuZXMgb3V0IG9mIHZpZXcgdW50aWwgdGhlIGNob3NlbiBjb250ZXN0IGFuZCBpdHMgbGVhZGVyYm9hcmQgYXJlIHBvc2l0aW9uZWQuXG4gICAgY29uc3QgZ3VhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIGd1YXJkLmlkID0gJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnO1xuICAgIGd1YXJkLnRleHRDb250ZW50ID0gYFxuICAgICAgICAjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEsXG4gICAgICAgICNjb250ZXN0cyAucmlnaHRfcGFydCB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICAgICAgfVxuICAgIGA7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgIGlmICghZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSByZXR1cm47XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChndWFyZCk7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9KTtcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ3VhcmQpO1xuICAgIGVsc2Ugb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwgeyBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICBndWFyZC5yZW1vdmUoKTtcbiAgICB9LCA0MDAwKTtcbn1cblxuZXhwb3J0IGNsYXNzIENvbnRlc3RTdGFydCBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHByZWZlcmVuY2UgPSAnJztcbiAgICBwcml2YXRlIHN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBkZWZhdWx0cyA9IHJlYWRDb250ZXN0RGVmYXVsdHMoKTtcbiAgICBwcml2YXRlIGxpc3Q6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByaWdodDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJlc3RvcmluZ0NhcmQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByZXBvc2l0aW9uOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHN0b3BKdW1wOiAoKGZpbmlzaD86IGJvb2xlYW4pID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBvYnNlcnZlcjogTXV0YXRpb25PYnNlcnZlciB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgbGlzdGVuZXJzOiBBYm9ydENvbnRyb2xsZXIgfCBudWxsID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2NvbnRlc3RTdGFydCdcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJDb250ZXN0IHN0YXJ0dXBcIiwgXCJPcGVuIHRoZSBwcmVmZXJyZWQgY29udGVzdCBhbmQgbGVhZGVyYm9hcmQgcG9zaXRpb24gb24gbG9hZC4gQSBzdGFycmVkIGNvbnRlc3QgdGFrZXMgcHJpb3JpdHkuXCIpXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoeyBuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWEgfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UgPT09ICcvYWN0aXZpdGllcy5odG1sJztcbiAgICB9XG5cbiAgICBnZXRDb250ZXN0cyhsaXN0OiBIVE1MRWxlbWVudCwgZmluaXNoZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz4pOiBDb250ZXN0Q2FyZFtdIHtcbiAgICAgICAgY29uc3QgYWN0aXZlID0gbmV3IE1hcChPYmplY3QudmFsdWVzKHdpbmRvdy5jb250ZXN0cz8uYWN0aXZlIHx8IHt9KVxuICAgICAgICAgICAgLmZpbHRlcihjb250ZXN0ID0+IGNvbnRlc3Q/LmlkX2NvbnRlc3QgIT0gbnVsbClcbiAgICAgICAgICAgIC5tYXAoY29udGVzdCA9PiBbU3RyaW5nKGNvbnRlc3QuaWRfY29udGVzdCksIGNvbnRlc3RdKSk7XG5cbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obGlzdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLmNvbnRlc3RbaWRfY29udGVzdF0nKSkuZmxhdE1hcChjYXJkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gY2FyZC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgIGlmICghaWQpIHJldHVybiBbXTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlc3QgPSBhY3RpdmUuZ2V0KGlkKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IGNhcmQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jb250ZXN0X2hlYWRlcicpO1xuICAgICAgICAgICAgaWYgKCFoZWFkZXIgfHwgZmluaXNoZWQuaGFzKGlkKSkgcmV0dXJuIFtdO1xuICAgICAgICAgICAgaWYgKCFjb250ZXN0ICYmICFoZWFkZXIubWF0Y2hlcygnLmluX3Byb2dyZXNzJykpIHJldHVybiBbXTtcblxuICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBoZWFkZXIucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5jb250ZXN0X3RpdGxlLCAuY29udGVzdF9uYW1lLCBoMywgaDQsIGg1Jyk7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gdGl0bGUgJiYgQXJyYXkuZnJvbSh0aXRsZS5jaGlsZE5vZGVzKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIobm9kZSA9PiAhKG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSB8fCAhbm9kZS5tYXRjaGVzKCcuamFydmlzLWNvbnRlc3QtcGluLCAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpKVxuICAgICAgICAgICAgICAgIC5tYXAobm9kZSA9PiBub2RlLnRleHRDb250ZW50KS5qb2luKCcnKS50cmltKCk7XG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICBpZCwgY2FyZCwgaGVhZGVyLCB0aXRsZSxcbiAgICAgICAgICAgICAgICBraW5kOiBjb250ZXN0Py5jYXRlZ29yeV90eXBlID8gKGNvbnRlc3QuY2F0ZWdvcnlfdHlwZSA9PT0gJ2RhaWx5JyA/ICdkYWlseScgOiAnZXZlbnQnKSA6IG51bGwsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFN0cmluZyhuYW1lIHx8IGNvbnRlc3Q/Lm5hbWUgfHwgY29udGVzdD8udGl0bGUgfHxcbiAgICAgICAgICAgICAgICAgICAgKGNvbnRlc3Q/LmNhdGVnb3J5X3R5cGUgPT09ICdkYWlseScgPyAnRGFpbHkgY29udGVzdCcgOiAnQ29udGVzdCcpKS50cmltKClcbiAgICAgICAgICAgIH1dO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRUYXJnZXQoY29udGVzdHM6IENvbnRlc3RDYXJkW10pIHtcbiAgICAgICAgaWYgKHRoaXMucHJlZmVyZW5jZSkgcmV0dXJuIGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmlkID09PSB0aGlzLnByZWZlcmVuY2UpO1xuXG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRzLmtpbmQgPT09ICdldmVudCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gWy4uLmNvbnRlc3RzXS5yZXZlcnNlKCkuZmluZChjb250ZXN0ID0+IGNvbnRlc3Qua2luZCA9PT0gJ2V2ZW50Jyk7XG4gICAgICAgICAgICBpZiAoZXZlbnQpIHJldHVybiBldmVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29udGVzdHMuZmluZChjb250ZXN0ID0+IGNvbnRlc3Qua2luZCA9PT0gJ2RhaWx5JykgPz9cbiAgICAgICAgICAgIGNvbnRlc3RzLmZpbmQoY29udGVzdCA9PiBjb250ZXN0LmtpbmQgPT09IG51bGwpID8/IGNvbnRlc3RzWzBdO1xuICAgIH1cblxuICAgIGNsZWFyRXhwaXJlZFBpbihsaXN0OiBIVE1MRWxlbWVudCwgY29udGVzdHM6IENvbnRlc3RDYXJkW10sIGZpbmlzaGVkOiBSZWFkb25seVNldDxzdHJpbmc+KSB7XG4gICAgICAgIGlmICghdGhpcy5wcmVmZXJlbmNlIHx8IGNvbnRlc3RzLnNvbWUoKHsgaWQgfSkgPT4gaWQgPT09IHRoaXMucHJlZmVyZW5jZSkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBhY3RpdmUgPSB3aW5kb3cuY29udGVzdHM/LmFjdGl2ZTtcbiAgICAgICAgY29uc3QgbWlzc2luZyA9IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScgJiYgbGlzdC5xdWVyeVNlbGVjdG9yKCcuY29udGVzdF9oZWFkZXInKSAmJlxuICAgICAgICAgICAgYWN0aXZlICYmICFPYmplY3QudmFsdWVzKGFjdGl2ZSkuc29tZShjb250ZXN0ID0+IFN0cmluZyhjb250ZXN0Py5pZF9jb250ZXN0KSA9PT0gdGhpcy5wcmVmZXJlbmNlKTtcbiAgICAgICAgaWYgKCFmaW5pc2hlZC5oYXModGhpcy5wcmVmZXJlbmNlKSAmJiAhbWlzc2luZykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGV4cGlyZWRJZCA9IHRoaXMucHJlZmVyZW5jZTtcbiAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gJyc7XG4gICAgICAgIHRoaXMuc3RvcEp1bXA/LihmYWxzZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoU3RyaW5nKGxzR2V0KCdDb250ZXN0U3RhcnRJZCcpKSA9PT0gZXhwaXJlZElkKSBsc1JtKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBjbGVhciB0aGUgZXhwaXJlZCBjb250ZXN0IHByZWZlcmVuY2U6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZVBpbnMobGlzdDogSFRNTEVsZW1lbnQsIGNvbnRlc3RzOiBDb250ZXN0Q2FyZFtdKSB7XG4gICAgICAgIGNvbnN0IGhvc3RzID0gbmV3IFNldChjb250ZXN0cy5tYXAoKHsgdGl0bGUsIGhlYWRlciB9KSA9PiB0aXRsZSB8fCBoZWFkZXIpKTtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sIG9mIGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLmphcnZpcy1jb250ZXN0LXBpbiwgLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKSkge1xuICAgICAgICAgICAgaWYgKCFjb250cm9sLnBhcmVudEVsZW1lbnQgfHwgIWhvc3RzLmhhcyhjb250cm9sLnBhcmVudEVsZW1lbnQpKSBjb250cm9sLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCB7IGlkLCB0aXRsZSwgaGVhZGVyLCBsYWJlbCB9IG9mIGNvbnRlc3RzKSB7XG4gICAgICAgICAgICBjb25zdCBob3N0ID0gdGl0bGUgfHwgaGVhZGVyO1xuICAgICAgICAgICAgbGV0IHBpbiA9IGhvc3QucXVlcnlTZWxlY3RvcjxIVE1MQnV0dG9uRWxlbWVudD4oJzpzY29wZSA+IC5qYXJ2aXMtY29udGVzdC1waW4nKTtcbiAgICAgICAgICAgIGlmICghcGluKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lID0gJ2phcnZpcy1jb250ZXN0LXBpbic7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVzdElkID0gYnV0dG9uLmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRlc3RJZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLnByZWZlcmVuY2UgPT09IGNvbnRlc3RJZCA/ICcnIDogY29udGVzdElkO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQpIGxzU2V0KCdDb250ZXN0U3RhcnRJZCcsIG5leHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBsc1JtKCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gbmV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcnR1cFBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcEp1bXA/LigpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBzYXZlIHRoZSBjb250ZXN0IHByZWZlcmVuY2U6JywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBwaW4gPSBob3N0LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwaW5uZWQgPSB0aGlzLnByZWZlcmVuY2UgPT09IGlkO1xuICAgICAgICAgICAgcGluLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgU3RyaW5nKHBpbm5lZCkpO1xuICAgICAgICAgICAgcGluLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHBpbm5lZCA/IGBVbnBpbiAke2xhYmVsfWAgOiBgUGluICR7bGFiZWx9IHRvIG9wZW4gb24gcmVsb2FkYCk7XG4gICAgICAgICAgICBwaW4udGl0bGUgPSBwaW5uZWQgPyAnUGlubmVkLiBDbGljayB0byB1c2UgeW91ciBjb250ZXN0IGRlZmF1bHRzLicgOiAnT3BlbiB0aGlzIGNvbnRlc3Qgd2hlbiB0aGUgcGFnZSByZWxvYWRzJztcblxuICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gaG9zdC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignOnNjb3BlID4gLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKTtcbiAgICAgICAgICAgIGlmICghcGlubmVkKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24/LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNob2ljZSA9IG1ha2VSYW5rQ2hvaWNlKCdQaW5uZWQgbGVhZGVyYm9hcmQgc3RhcnQnLCByYW5rID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxzU2V0KCdDb250ZXN0UGlubmVkUmFuaycsIHsgaWQsIHJhbmsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RDb250ZXN0Q2hvaWNlKGNob2ljZSwgcmFuayk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGxlYWRlcmJvYXJkIHBvc2l0aW9uOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjaG9pY2UuY2xhc3NMaXN0LmFkZCgnamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpO1xuICAgICAgICAgICAgICAgIHBpbi5hZnRlcihjaG9pY2UpO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gY2hvaWNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0Q29udGVzdENob2ljZShwb3NpdGlvbiwgcmVhZFBpbm5lZFJhbmsoaWQsIHRoaXMuZGVmYXVsdHMucmFuaykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IGxpc3QucXVlcnlTZWxlY3RvcignLmNvbnRlc3RfaGVhZGVyX2FjdGl2ZScpPy5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpO1xuICAgICAgICBpZiAoc2VsZWN0ZWQpIHJldHVybiBzZWxlY3RlZC5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcblxuICAgICAgICBjb25zdCBwYW5lbHMgPSBBcnJheS5mcm9tKHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYW5raW5nW2lkX2NvbnRlc3RdJykpXG4gICAgICAgICAgICAuZmlsdGVyKHBhbmVsID0+IHBhbmVsLmdldENsaWVudFJlY3RzKCkubGVuZ3RoICYmIGdldENvbXB1dGVkU3R5bGUocGFuZWwpLnZpc2liaWxpdHkgPT09ICd2aXNpYmxlJyk7XG4gICAgICAgIHJldHVybiBwYW5lbHMubGVuZ3RoID09PSAxID8gcGFuZWxzWzBdLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpIDogbnVsbDtcbiAgICB9XG5cbiAgICBzaG93TGVhZGVyYm9hcmQocmlnaHQ6IEhUTUxFbGVtZW50LCBjb250ZXN0SWQ6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgaWYgKCFjb250ZXN0SWQpIHtcbiAgICAgICAgICAgIHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1vdGhlcicpLmZvckVhY2gocGFuZWwgPT4gcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnamFydmlzLWNvbnRlc3Qtb3RoZXInKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwYW5lbCBvZiByaWdodC5xdWVyeVNlbGVjdG9yQWxsKCcucmFua2luZ1tpZF9jb250ZXN0XScpKSB7XG4gICAgICAgICAgICBwYW5lbC5jbGFzc0xpc3QudG9nZ2xlKCdqYXJ2aXMtY29udGVzdC1vdGhlcicsIHBhbmVsLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpICE9PSBjb250ZXN0SWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0T3duUm93KGJvYXJkOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBvd24gPSBib2FyZC5xdWVyeVNlbGVjdG9yKCcubGVhZFRhYmxlIHRyLmxlYWRfdGFibGVfZGVmYXVsdCcpO1xuICAgICAgICBpZiAob3duKSByZXR1cm4gb3duO1xuXG4gICAgICAgIGNvbnN0IGhlcm9JZCA9ICh3aW5kb3cuc2hhcmVkPy5IZXJvIHx8IHdpbmRvdy5IZXJvKT8uaW5mb3M/LmlkO1xuICAgICAgICBpZiAoaGVyb0lkID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGJvYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5sZWFkVGFibGUgdHJbc29ydGluZ19pZF0nKSlcbiAgICAgICAgICAgIC5maW5kKHJvdyA9PiByb3cuZ2V0QXR0cmlidXRlKCdzb3J0aW5nX2lkJykgPT09IFN0cmluZyhoZXJvSWQpKTtcbiAgICB9XG5cbiAgICBsb2NrU2Nyb2xsKHNjcm9sbGVyOiBIVE1MRWxlbWVudCkge1xuICAgICAgICAkKHNjcm9sbGVyKS5zdG9wKHRydWUsIGZhbHNlKTtcbiAgICAgICAgLy8gVGhlIGdhbWUgY2FuIHN0YXJ0IGFub3RoZXIgalF1ZXJ5IHR3ZWVuIGFmdGVyIGxvYWQuIEJsb2NrIGl0cyB3cml0ZXMgb24gdGhpcyBwYW5lIG9ubHkuXG4gICAgICAgIGNvbnN0IGlnbm9yZVNjcm9sbCA9ICgpID0+IHt9O1xuICAgICAgICBjb25zdCBnZXQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEVsZW1lbnQucHJvdG90eXBlLCAnc2Nyb2xsVG9wJyk/LmdldDtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRvcnMgPSBPYmplY3QuZW50cmllcyh7XG4gICAgICAgICAgICBzY3JvbGxUb3A6IHsgZ2V0LCBzZXQ6IGlnbm9yZVNjcm9sbCB9LFxuICAgICAgICAgICAgc2Nyb2xsOiB7IHZhbHVlOiBpZ25vcmVTY3JvbGwsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICBzY3JvbGxUbzogeyB2YWx1ZTogaWdub3JlU2Nyb2xsLCB3cml0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgc2Nyb2xsQnk6IHsgdmFsdWU6IGlnbm9yZVNjcm9sbCwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgICB9KS5maWx0ZXIoKFtrZXldKSA9PiAhT2JqZWN0Lmhhc093bihzY3JvbGxlciwga2V5KSk7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgZGVzY3JpcHRvcl0gb2YgZGVzY3JpcHRvcnMpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzY3JvbGxlciwga2V5LCB7IC4uLmRlc2NyaXB0b3IsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAkKHNjcm9sbGVyKS5zdG9wKHRydWUsIGZhbHNlKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgZGVzY3JpcHRvcl0gb2YgZGVzY3JpcHRvcnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzY3JvbGxlciwga2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudCAmJiBjdXJyZW50LnZhbHVlID09PSBkZXNjcmlwdG9yLnZhbHVlICYmIGN1cnJlbnQuc2V0ID09PSBkZXNjcmlwdG9yLnNldCkgUmVmbGVjdC5kZWxldGVQcm9wZXJ0eShzY3JvbGxlciwga2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBqdW1wVG8oc2Nyb2xsZXI6IEhUTUxFbGVtZW50LCB0YXJnZXQ6IEVsZW1lbnQgfCBudWxsIHwgdW5kZWZpbmVkLCBjZW50ZXIgPSBmYWxzZSkge1xuICAgICAgICBsZXQgdG9wID0gMDtcbiAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgICAgY29uc3QgYm91bmRzID0gc2Nyb2xsZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBjb25zdCBzY2FsZSA9IGJvdW5kcy5oZWlnaHQgLyBzY3JvbGxlci5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICBpZiAoIXNjYWxlKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0b3AgPSBzY3JvbGxlci5zY3JvbGxUb3AgKyAoaXRlbS50b3AgLSBib3VuZHMudG9wKSAvIHNjYWxlIC0gc2Nyb2xsZXIuY2xpZW50VG9wO1xuICAgICAgICAgICAgaWYgKGNlbnRlcikgdG9wIC09IChzY3JvbGxlci5jbGllbnRIZWlnaHQgLSBpdGVtLmhlaWdodCAvIHNjYWxlKSAvIDI7XG4gICAgICAgIH1cbiAgICAgICAgdG9wID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oc2Nyb2xsZXIuc2Nyb2xsSGVpZ2h0IC0gc2Nyb2xsZXIuY2xpZW50SGVpZ2h0LCB0b3ApKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKHRvcCAtIHNjcm9sbGVyLnNjcm9sbFRvcCkgPj0gMSkge1xuICAgICAgICAgICAgY29uc3Qgc2Nyb2xsVG8gPSBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxUbyBhcyAob3B0aW9uczogU2Nyb2xsVG9PcHRpb25zKSA9PiB2b2lkO1xuICAgICAgICAgICAgc2Nyb2xsVG8uY2FsbChzY3JvbGxlciwgeyB0b3AsIGJlaGF2aW9yOiAnaW5zdGFudCcgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvcGVuQ29udGVzdChsaXN0OiBIVE1MRWxlbWVudCwgcmlnaHQ6IEhUTUxFbGVtZW50LCB7IGlkLCBjYXJkLCBoZWFkZXIsIHRpdGxlIH06IENvbnRlc3RDYXJkKSB7XG4gICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSBwYW5lLmNsYXNzTGlzdC5hZGQoJ2phcnZpcy1jb250ZXN0LWluc3RhbnQnLCAnamFydmlzLWNvbnRlc3QtbG9hZGluZycpO1xuICAgICAgICBjb25zdCByYW5rID0gaWQgPT09IHRoaXMucHJlZmVyZW5jZSA/IHJlYWRQaW5uZWRSYW5rKGlkLCB0aGlzLmRlZmF1bHRzLnJhbmspIDogdGhpcy5kZWZhdWx0cy5yYW5rO1xuICAgICAgICBjb25zdCBwbGFjZUF0T3duUmFuayA9IHJhbmsgPT09ICdtaW5lJztcbiAgICAgICAgY29uc3QgcmVsZWFzZUxpc3QgPSB0aGlzLmxvY2tTY3JvbGwobGlzdCk7XG4gICAgICAgIGxldCBib2FyZDogSFRNTEVsZW1lbnQgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgICAgICBsZXQgcmVsZWFzZUJvYXJkOiAoKCkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCBwb3NpdGlvbmVkID0gZmFsc2U7XG4gICAgICAgIGxldCBsYXN0QXR0ZW1wdDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuICAgICAgICBjb25zdCBnZXRCb2FyZCA9ICgpID0+IEFycmF5LmZyb20ocmlnaHQucXVlcnlTZWxlY3RvckFsbCgnLnJhbmtpbmdbaWRfY29udGVzdF0nKSlcbiAgICAgICAgICAgIC5maW5kKHBhbmVsID0+IHBhbmVsLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpID09PSBpZCk/LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcubGVhZF90YWJsZV92aWV3Jyk7XG4gICAgICAgIGNvbnN0IHVwZGF0ZUJvYXJkID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV4dCA9IGdldEJvYXJkKCk7XG4gICAgICAgICAgICBpZiAoYm9hcmQgPT09IG5leHQpIHJldHVybjtcbiAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICBib2FyZCA9IG5leHQ7XG4gICAgICAgICAgICByZWxlYXNlQm9hcmQgPSBib2FyZCA/IHRoaXMubG9ja1Njcm9sbChib2FyZCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJldmVhbCA9ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSBwYW5lLmNsYXNzTGlzdC5yZW1vdmUoJ2phcnZpcy1jb250ZXN0LWxvYWRpbmcnKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXN0b3JlID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFsaXN0LmlzQ29ubmVjdGVkIHx8ICFyaWdodC5pc0Nvbm5lY3RlZCB8fCAhbGlzdC5jb250YWlucyhjYXJkKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICB1cGRhdGVCb2FyZCgpO1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KTtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZCAhPT0gaWQgJiYgc2VsZWN0ZWQgIT09IGxhc3RBdHRlbXB0KSB7XG4gICAgICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSBzZWxlY3RlZDtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgKHRpdGxlIHx8IGhlYWRlcikuY2xpY2soKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVCb2FyZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFib2FyZD8uY2xpZW50SGVpZ2h0IHx8IHRoaXMuZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdCwgcmlnaHQpICE9PSBpZCB8fFxuICAgICAgICAgICAgICAgIChwbGFjZUF0T3duUmFuayAmJiAhYm9hcmQucXVlcnlTZWxlY3RvcignLmxlYWRUYWJsZScpKSkgcmV0dXJuO1xuICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgaWQpO1xuICAgICAgICAgICAgdGhpcy5qdW1wVG8obGlzdCwgY2FyZCk7XG4gICAgICAgICAgICB0aGlzLmp1bXBUbyhib2FyZCwgcGxhY2VBdE93blJhbmsgPyB0aGlzLmdldE93blJvdyhib2FyZCkgOiBudWxsLCBwbGFjZUF0T3duUmFuayk7XG4gICAgICAgICAgICBpZiAoIXBvc2l0aW9uZWQpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgIHJldmVhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvcnJlY3QgYnJvd3Nlci1kcml2ZW4gbW92ZXMsIHN1Y2ggYXMgc2Nyb2xsSW50b1ZpZXcgb24gYSBsZWFkZXJib2FyZCByb3csIGJlZm9yZSBwYWludC5cbiAgICAgICAgY29uc3Qgb25TY3JvbGwgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSBsaXN0IHx8IGV2ZW50LnRhcmdldCA9PT0gYm9hcmQpIHJlc3RvcmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaW5wdXRFdmVudHMgPSBbJ3BvaW50ZXJkb3duJywgJ3RvdWNoc3RhcnQnLCAnd2hlZWwnLCAnY2xpY2snXTtcbiAgICAgICAgY29uc3Qgb25JbnB1dCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5pc1RydXN0ZWQpIHN0b3AoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3RvcE9uS2V5ID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkICYmIFsnVGFiJywgJ0Fycm93VXAnLCAnQXJyb3dEb3duJywgJ1BhZ2VVcCcsICdQYWdlRG93bicsICdIb21lJywgJ0VuZCcsICdFbnRlcicsICcgJ10uaW5jbHVkZXMoZXZlbnQua2V5KSkgc3RvcCgpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBhZnRlckxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICBsYXN0QXR0ZW1wdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJlc3RvcmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3RvcCA9IChmaW5pc2ggPSB0cnVlKSA9PiB7XG4gICAgICAgICAgICByZWxlYXNlTGlzdCgpO1xuICAgICAgICAgICAgcmVsZWFzZUJvYXJkPy4oKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSB7XG4gICAgICAgICAgICAgICAgcGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcGFuZS5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1pbnN0YW50JywgJ2phcnZpcy1jb250ZXN0LWxvYWRpbmcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgaW5wdXRFdmVudHMpIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uSW5wdXQsIHRydWUpO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHN0b3BPbktleSwgdHJ1ZSk7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFmdGVyTG9hZCk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgdGhpcy5zdG9wSnVtcCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnJlcG9zaXRpb24gPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZXN0b3JpbmdDYXJkID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChmaW5pc2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV2ZWFsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dChzdG9wLCA0MDAwKTtcbiAgICAgICAgdGhpcy5zdG9wSnVtcCA9IHN0b3A7XG4gICAgICAgIHRoaXMucmVwb3NpdGlvbiA9IHJlc3RvcmU7XG4gICAgICAgIHRoaXMucmVzdG9yaW5nQ2FyZCA9IGNhcmQ7XG4gICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSB7XG4gICAgICAgICAgICBwYW5lLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIG9uU2Nyb2xsLCB7IHBhc3NpdmU6IHRydWUsIGNhcHR1cmU6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBldmVudCBvZiBpbnB1dEV2ZW50cykgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgb25JbnB1dCwgeyBwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiB0cnVlIH0pO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc3RvcE9uS2V5LCB0cnVlKTtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgYWZ0ZXJMb2FkLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgIHJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICByZWZyZXNoKCkge1xuICAgICAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJyNjb250ZXN0cyAubGVmdF9wYXJ0IC5zY3JvbGxfYXJlYScpO1xuICAgICAgICBjb25zdCByaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcjY29udGVzdHMgLnJpZ2h0X3BhcnQnKTtcbiAgICAgICAgaWYgKHRoaXMuc3RvcEp1bXAgJiYgKHRoaXMubGlzdCAhPT0gbGlzdCB8fCB0aGlzLnJpZ2h0ICE9PSByaWdodCB8fCAhbGlzdD8uY29udGFpbnModGhpcy5yZXN0b3JpbmdDYXJkKSkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcEp1bXAoZmFsc2UpO1xuICAgICAgICAgICAgaWYgKHRoaXMucmlnaHQpIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHRoaXMucmlnaHQsIG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGlzdCA9IGxpc3Q7XG4gICAgICAgIHRoaXMucmlnaHQgPSByaWdodDtcbiAgICAgICAgaWYgKCFsaXN0IHx8ICFyaWdodCB8fCAhbGlzdC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCB8fCBnZXRDb21wdXRlZFN0eWxlKGxpc3QpLnZpc2liaWxpdHkgIT09ICd2aXNpYmxlJykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGZpbmlzaGVkID0gbmV3IFNldChPYmplY3QudmFsdWVzKHdpbmRvdy5jb250ZXN0cz8uZmluaXNoZWQgfHwge30pXG4gICAgICAgICAgICAuZmlsdGVyKGNvbnRlc3QgPT4gY29udGVzdD8uaWRfY29udGVzdCAhPSBudWxsKS5tYXAoY29udGVzdCA9PiBTdHJpbmcoY29udGVzdC5pZF9jb250ZXN0KSkpO1xuICAgICAgICBmb3IgKGNvbnN0IGVuZGVkIG9mIGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlc3QuZW5kZWQsIC5jb250ZXN0X2hlYWRlci5lbmRlZCcpKSB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IGVuZGVkLmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKGlkKSBmaW5pc2hlZC5hZGQoaWQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbnRlc3RzID0gdGhpcy5nZXRDb250ZXN0cyhsaXN0LCBmaW5pc2hlZCk7XG4gICAgICAgIHRoaXMuY2xlYXJFeHBpcmVkUGluKGxpc3QsIGNvbnRlc3RzLCBmaW5pc2hlZCk7XG4gICAgICAgIHRoaXMudXBkYXRlUGlucyhsaXN0LCBjb250ZXN0cyk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVwb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy5yZXBvc2l0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc3RhcnR1cFBlbmRpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuZ2V0VGFyZ2V0KGNvbnRlc3RzKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXQpIHRoaXMub3BlbkNvbnRlc3QobGlzdCwgcmlnaHQsIHRhcmdldCk7XG4gICAgICAgICAgICBlbHNlIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnICYmICF0aGlzLnByZWZlcmVuY2UpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnamFydmlzLWNvbnRlc3Qtc3RhcnR1cCcpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHJpZ2h0LCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBjb25zdCBwaW4gPSByZWFkQ29udGVzdFNldHRpbmcoJ0NvbnRlc3RTdGFydElkJyk7XG4gICAgICAgIHRoaXMucHJlZmVyZW5jZSA9ICgodHlwZW9mIHBpbiA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHBpbiA9PT0gJ251bWJlcicpICYmIHBpbikgPyBTdHJpbmcocGluKSA6ICcnO1xuICAgICAgICB0aGlzLnN0YXJ0dXBQZW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kZWZhdWx0cyA9IHJlYWRDb250ZXN0RGVmYXVsdHMoKTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IHsgc2lnbmFsIH0gPSB0aGlzLmxpc3RlbmVycztcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKG11dGF0aW9ucyA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlc3RzIC5sZWZ0X3BhcnQgLnNjcm9sbF9hcmVhJyk7XG4gICAgICAgICAgICBjb25zdCByaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZXN0cyAucmlnaHRfcGFydCcpO1xuICAgICAgICAgICAgaWYgKGxpc3QgIT09IHRoaXMubGlzdCB8fCByaWdodCAhPT0gdGhpcy5yaWdodCB8fCBtdXRhdGlvbnMuc29tZSgoeyB0YXJnZXQgfSkgPT5cbiAgICAgICAgICAgICAgICAobGlzdCAmJiAobGlzdC5jb250YWlucyh0YXJnZXQpIHx8IHRhcmdldC5jb250YWlucyhsaXN0KSkpIHx8XG4gICAgICAgICAgICAgICAgKHJpZ2h0ICYmIChyaWdodC5jb250YWlucyh0YXJnZXQpIHx8IHRhcmdldC5jb250YWlucyhyaWdodCkpKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcycsICdzdHlsZScsICdoaWRkZW4nLCAnaWRfY29udGVzdCddIH0pO1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB0aGlzLnJlZnJlc2goKSwgeyBvbmNlOiB0cnVlLCBzaWduYWwgfSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkICYmIGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgdGhpcy5yaWdodCAmJiB0aGlzLmxpc3Q/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkgJiZcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQuY2xvc2VzdCgnLmNvbnRlc3RfaGVhZGVyJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQodGhpcy5yaWdodCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHsgY2FwdHVyZTogdHJ1ZSwgc2lnbmFsIH0pO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxuXG4gICAgdGVhckRvd24oKSB7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnM/LmFib3J0KCk7XG4gICAgICAgIHRoaXMuc3RvcEp1bXA/LigpO1xuICAgICAgICB0aGlzLnN0YXJ0dXBQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGlzdD8ucXVlcnlTZWxlY3RvckFsbCgnLmphcnZpcy1jb250ZXN0LXBpbiwgLmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQnKS5mb3JFYWNoKGNvbnRyb2wgPT4gY29udHJvbC5yZW1vdmUoKSk7XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0KSB0aGlzLnNob3dMZWFkZXJib2FyZCh0aGlzLnJpZ2h0LCBudWxsKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuaGFzUnVuID0gZmFsc2U7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuZXhwb3J0IGNsYXNzIExlYWd1ZVRvcDIwIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xlYWd1ZVRvcDIwJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlRvcCAyMCBwcm9tb3Rpb24gdGFyZ2V0XCIsIFwiU2hvdyBwb2ludHMgbmVlZGVkIGZvciAyMHRoIHBsYWNlIGJlbG93IHRoZSBoaWdoZXN0IGxlYWd1ZSB0aWVyLlwiKVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZXMuaHRtbCcpO1xuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoJy5zY3JpcHRMZWFndWVJbmZvJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY3JpcHRMZWFndWVJbmZvJyk7XG4gICAgICAgICAgICBpZiAoIXN1bW1hcnkgfHwgc3VtbWFyeS5xdWVyeVNlbGVjdG9yKCcuamFydmlzVG9wMjAnKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCB7IG9wcG9uZW50c19saXN0LCBjdXJyZW50X3RpZXJfbnVtYmVyLCBtYXhfbGVhZ3VlIH0gPSB3aW5kb3c7XG4gICAgICAgICAgICBjb25zdCB0aWVyID0gTnVtYmVyKGN1cnJlbnRfdGllcl9udW1iZXIpO1xuICAgICAgICAgICAgaWYgKCEodGllciA+IDAgJiYgdGllciA8IE51bWJlcihtYXhfbGVhZ3VlKSkpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGhlcm9JZCA9ICh3aW5kb3cuc2hhcmVkPy5IZXJvIHx8IHdpbmRvdy5IZXJvKT8uaW5mb3M/LmlkO1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG9wcG9uZW50c19saXN0KSB8fCBoZXJvSWQgPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBvcHBvbmVudHNfbGlzdC5maW5kKCh7IHBsYXllciB9KSA9PiBTdHJpbmcocGxheWVyPy5pZF9maWdodGVyKSA9PT0gU3RyaW5nKGhlcm9JZCkpO1xuICAgICAgICAgICAgY29uc3QgcmFuayA9IE51bWJlcihwbGF5ZXI/LnBsYWNlKTtcbiAgICAgICAgICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihyYW5rKSB8fCByYW5rIDwgMSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBpblRvcDIwID0gcmFuayA8PSAyMDtcbiAgICAgICAgICAgIGNvbnN0IGN1dG9mZiA9IG9wcG9uZW50c19saXN0LmZpbmQoKHsgcGxhY2UgfSkgPT4gTnVtYmVyKHBsYWNlKSA9PT0gKGluVG9wMjAgPyAyMSA6IDIwKSk7XG4gICAgICAgICAgICBpZiAocGxheWVyPy5wbGF5ZXJfbGVhZ3VlX3BvaW50cyA9PSBudWxsIHx8IGN1dG9mZj8ucGxheWVyX2xlYWd1ZV9wb2ludHMgPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBzY29yZSA9IE51bWJlcihwbGF5ZXIucGxheWVyX2xlYWd1ZV9wb2ludHMpO1xuICAgICAgICAgICAgY29uc3QgY3V0b2ZmU2NvcmUgPSBOdW1iZXIoY3V0b2ZmLnBsYXllcl9sZWFndWVfcG9pbnRzKTtcbiAgICAgICAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHNjb3JlKSB8fCAhTnVtYmVyLmlzRmluaXRlKGN1dG9mZlNjb3JlKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBmb3JtYXQgPSBuZXcgSW50bC5OdW1iZXJGb3JtYXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGluVG9wMjAgPyBjdXRvZmZTY29yZSA6IGN1dG9mZlNjb3JlICsgMTtcbiAgICAgICAgICAgIGNvbnN0IGRpZmZlcmVuY2UgPSBpblRvcDIwID8gc2NvcmUgLSB0YXJnZXQgOiB0YXJnZXQgLSBzY29yZTtcbiAgICAgICAgICAgIGNvbnN0IHRvb2x0aXAgPSBpblRvcDIwXG4gICAgICAgICAgICAgICAgPyBgVG9wIDIwIHByb21vdGlvbiB0YXJnZXQ6ICR7Zm9ybWF0LmZvcm1hdCh0YXJnZXQpfSBwb2ludHMgYXQgcmFuayAyMS4gWW91ciBsZWFkOiAke2Zvcm1hdC5mb3JtYXQoZGlmZmVyZW5jZSl9IHBvaW50cy5gXG4gICAgICAgICAgICAgICAgOiBgVG9wIDIwIHByb21vdGlvbiB0YXJnZXQ6ICR7Zm9ybWF0LmZvcm1hdCh0YXJnZXQpfSBwb2ludHMgdG8gcGFzcyByYW5rIDIwLmA7XG5cbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgZW50cnkuY2xhc3NOYW1lID0gJ21pblRvcDIwIGphcnZpc1RvcDIwJztcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCB0b29sdGlwKTtcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgndG9vbHRpcCcsICcnKTtcbiAgICAgICAgICAgIGVudHJ5LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHRvb2x0aXApO1xuXG4gICAgICAgICAgICBjb25zdCBiYWRnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIGJhZGdlLmNsYXNzTmFtZSA9ICdzY3JpcHRMZWFndWVJbmZvSWNvbic7XG4gICAgICAgICAgICBiYWRnZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIzM3NjliYSc7XG4gICAgICAgICAgICBiYWRnZS5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICAgICAgICAgIGJhZGdlLnRleHRDb250ZW50ID0gJzIwJztcbiAgICAgICAgICAgIGVudHJ5LmFwcGVuZChiYWRnZSwgYCR7ZGlmZmVyZW5jZSA9PT0gMCA/ICcnIDogaW5Ub3AyMCA/ICctJyA6ICcrJ30ke2Zvcm1hdC5mb3JtYXQoTWF0aC5hYnMoZGlmZmVyZW5jZSkpfWApO1xuICAgICAgICAgICAgc3VtbWFyeS5pbnNlcnRCZWZvcmUoZW50cnksIHN1bW1hcnkucXVlcnlTZWxlY3RvcignLm1pblRvcDMwLCAucHJvbW90aW9uSW5mbycpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBSZW1vdmVQYXNzTG9jayBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNlbGVjdG9yVG9GaW5kID0gJy5sb2NrX3llbGxvd19pY24nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgY2xhc3NUb1JlbW92ZSA9ICdsb2NrX3llbGxvd19pY24nO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAncmVtb3ZlUGFzc0xvY2snXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlBhc3MgbG9jayBpY29uc1wiLCBcIkhpZGUgbG9jayBpY29ucyBvbiByZXdhcmQgcGFzc2VzIHNvIHRoZSByZXdhcmRzIGFyZSBlYXNpZXIgdG8gcmVhZC5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdwb3YnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlBhdGggb2YgVmFsb3JcIiwgXCJIaWRlIGxvY2sgaWNvbnMgb24gdGhlIFBhdGggb2YgVmFsb3IgcGFzc2VzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAncG9nJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQYXRoIG9mIEdsb3J5XCIsIFwiSGlkZSBsb2NrIGljb25zIG9uIHRoZSBQYXRoIG9mIEdsb3J5IHBhc3Nlcy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLXZhbG9yLmh0bWwnKSB8fCBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtZ2xvcnkuaHRtbCcpXG4gICAgfVxuXG4gICAgb2JzZXJ2ZVVudGlsKHNlbGVjdG9yOiBzdHJpbmcsIGNhbGxiYWNrOiAoZWxlbWVudHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4pID0+IHZvaWQsIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH0gPSB7fSkge1xuICAgICAgICBsZXQgdGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgICAgICBsZXQgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FsbGJhY2soZWxlbWVudHMpO1xuICAgICAgICAgICAgaWYgKG9uY2UpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAob25jZSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lcikgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZWxlbWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuXG4gICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodGltZW91dCkgJiYgdGltZW91dCA+IDApIHtcbiAgICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3Rvcjogc3RyaW5nLCBjbGFzc1RvUmVtb3ZlOiBzdHJpbmcsIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH0gPSB7fSkge1xuICAgICAgICB0aGlzLm9ic2VydmVVbnRpbChzZWxlY3RvciwgKGVsZW1lbnRzKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGVsID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NUb1JlbW92ZSkpO1xuICAgICAgICB9LCB7IHRpbWVvdXQsIG9uY2UgfSk7XG4gICAgfVxuXG4gICAgcnVuKHsgcG92LCBwb2cgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtdmFsb3IuaHRtbCcpICYmIHBvdikge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZSh0aGlzLnNlbGVjdG9yVG9GaW5kLCB0aGlzLmNsYXNzVG9SZW1vdmUpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi1nbG9yeS5odG1sJykgJiYgcG9nKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKHRoaXMuc2VsZWN0b3JUb0ZpbmQsIHRoaXMuY2xhc3NUb1JlbW92ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEdpcmxEaWN0aW9uYXJ5KCkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmdldEdpcmxEaWN0aW9uYXJ5KCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBsb2FkIHRoZSBISCsrIGdpcmwgZGljdGlvbmFyeTonLCBlcnIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGdldEdpcmxEaWN0aW9uYXJ5IH0gZnJvbSAnLi9nYW1lRGF0YSc7XG5cbmV4cG9ydCBjbGFzcyBMb3ZlUmFpZHNBZGRvbiBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJhcml0eUNvbG9yczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xvdmVSYWlkc0FkZG9uJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMb3ZlIFJhaWRzIGRpc3BsYXlcIiwgXCJDdXN0b21pemUgbmFtZXMsIGljb25zLCBhbmQgcG9zZXMgb24gTG92ZSBSYWlkIGNhcmRzLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ3JhaWRfaWQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlJhaWQgSURzXCIsIFwiQWRkIHRoZSByYWlkIElEIGJlZm9yZSBpdHMgbmFtZS5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICduYW1lcycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiSGlkZGVuIGdpcmwgbmFtZXNcIiwgXCJTaG93IHRoZSBuYW1lIG9uIGNhcmRzIHRoYXQgdXNlIGEgbXlzdGVyaW91cyBnaXJsIGxhYmVsLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnc2tpbicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiU2tpbiBpbmRpY2F0b3JcIiwgXCJNYXJrIGNhcmRzIHRoYXQgaW5jbHVkZSBhIGdpcmwgd2l0aCBhIHNraW4uXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdjb2xvcicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUmFyaXR5IGNvbG9yc1wiLCBcIkNvbG9yIHRoZSByYWlkIG5hbWUgYmFzZWQgb24gdGhlIGdpcmzigJlzIHJhcml0eS5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2ZpZ2h0X2ljb24nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkZpZ2h0IGljb25cIiwgXCJVc2UgdGhlIGNsZWFyZXIgZmlnaHQtZW5lcmd5IGljb24uXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdzaGFkb3dzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJVbnNoYWRvd2VkIHBvc2VzXCIsIFwiU2hvdyB0aGUgbm9ybWFsIGFydHdvcmsgaW4gcGxhY2Ugb2Ygc2hhZG93IHBvc2VzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcblxuICAgICAgICB0aGlzLnJhcml0eUNvbG9ycyA9IHtcbiAgICAgICAgICAgIHJhcmU6ICdMaW1lR3JlZW4nLFxuICAgICAgICAgICAgZXBpYzogJ0dvbGQnLFxuICAgICAgICAgICAgbGVnZW5kYXJ5OiAnTWVkaXVtT3JjaGlkJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbG92ZS1yYWlkcy5odG1sJylcbiAgICB9XG5cbiAgICBhc3luYyBydW4oeyByYWlkX2lkLCBza2luLCBuYW1lcywgY29sb3IsIGZpZ2h0X2ljb24sIHNoYWRvd3MgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGNvbnN0IHJhaWRzID0gKHR5cGVvZiBsb3ZlX3JhaWRzICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KGxvdmVfcmFpZHMpKSA/IGxvdmVfcmFpZHMgOiBbXTtcbiAgICAgICAgaWYgKCFyYWlkcy5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG5cbiAgICAgICAgY29uc3QgZ2lybERpY3QgPSBhd2FpdCBnZXRHaXJsRGljdGlvbmFyeSgpO1xuICAgICAgICBjb25zdCByYWlkc0J5SWQgPSBuZXcgTWFwKHJhaWRzLm1hcChyYWlkID0+IFtTdHJpbmcocmFpZC5pZF9yYWlkKSwgcmFpZF0pKTtcblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucmFpZC1jYXJkW2lkX3JhaWRdJykuZm9yRWFjaChyYWlkQ2FyZCA9PiB7XG4gICAgICAgICAgICBjb25zdCByYWlkID0gcmFpZHNCeUlkLmdldChyYWlkQ2FyZC5nZXRBdHRyaWJ1dGUoJ2lkX3JhaWQnKSA/PyAnJyk7XG4gICAgICAgICAgICBpZiAoIXJhaWQgfHwgcmFpZC5pZF9naXJsID09IG51bGwpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgeyBuYW1lLCByYXJpdHksIHNoYXJkcyA9IDAgfSA9IGdpcmxEaWN0Py5nZXQoU3RyaW5nKHJhaWQuaWRfZ2lybCkpIHx8IHt9O1xuICAgICAgICAgICAgY29uc3QgaGFyZW1MaW5rID0gd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5nZXRIcmVmKGAvY2hhcmFjdGVycy8ke3JhaWQuaWRfZ2lybH1gKTtcbiAgICAgICAgICAgIGNvbnN0IHJhaWROYW1lRWxlbSA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3IoJy5yYWlkLW5hbWUgPiBzcGFuID4gc3BhbicpO1xuICAgICAgICAgICAgY29uc3QgbmFtZV9sYWJlbCA9IChuYW1lcyAmJiBuYW1lKSB8fCByYWlkTmFtZUVsZW0/LnRleHRDb250ZW50Py50cmltKCkgfHwgcmFpZC5ldmVudF9uYW1lIHx8IHJhaWQuZ2lybF9kYXRhPy5uYW1lIHx8ICcnO1xuICAgICAgICAgICAgY29uc3QgcmFpZF9pZF9sYWJlbCA9IHJhaWRfaWQgPyBgKCR7cmFpZC5pZF9yYWlkfSlgIDogJyc7XG4gICAgICAgICAgICBjb25zdCBza2luX2xhYmVsID0gKHNraW4gJiYgQXJyYXkuaXNBcnJheShyYWlkPy5naXJsX2RhdGE/LmdyYWRlX3NraW5zKSAmJiByYWlkLmdpcmxfZGF0YS5ncmFkZV9za2lucy5sZW5ndGggPiAwKSA/ICfwn5GZJyA6ICcnO1xuXG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5UGFydHMgPSBbXTtcbiAgICAgICAgICAgIGlmIChyYWlkX2lkKSBkaXNwbGF5UGFydHMucHVzaChyYWlkX2lkX2xhYmVsKTtcbiAgICAgICAgICAgIGRpc3BsYXlQYXJ0cy5wdXNoKG5hbWVfbGFiZWwpO1xuICAgICAgICAgICAgaWYgKHNraW4pIGRpc3BsYXlQYXJ0cy5wdXNoKHNraW5fbGFiZWwpO1xuICAgICAgICAgICAgY29uc3QgZGlzcGxheUxhYmVsID0gZGlzcGxheVBhcnRzLmpvaW4oJyAnKS50cmltKCk7XG5cbiAgICAgICAgICAgIGlmIChyYWlkTmFtZUVsZW0gJiYgZGlzcGxheUxhYmVsKSB7XG4gICAgICAgICAgICAgICAgcmFpZE5hbWVFbGVtLnRleHRDb250ZW50ID0gZGlzcGxheUxhYmVsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBvYmplY3RpdmVzID0gcmFpZENhcmQucXVlcnlTZWxlY3RvckFsbCgnLmNsYXNzaWMtZ2lybCcpO1xuICAgICAgICAgICAgY29uc3QgZ2lybCA9IG9iamVjdGl2ZXNbMF07XG4gICAgICAgICAgICBpZiAoZ2lybCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdpcmxOYW1lRWxlbSA9IGdpcmwucXVlcnlTZWxlY3RvcignLmdpcmwtbmFtZScpO1xuICAgICAgICAgICAgICAgIGlmIChnaXJsTmFtZUVsZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmsgPSBnaXJsTmFtZUVsZW0ucXVlcnlTZWxlY3RvcignYScpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWxpbmspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rLmNsYXNzTmFtZSA9ICdoaC1naXJsLWxpbmsnO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGdpcmxOYW1lRWxlbS5maXJzdENoaWxkKSBsaW5rLmFwcGVuZENoaWxkKGdpcmxOYW1lRWxlbS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdpcmxOYW1lRWxlbS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZGlzcGxheUxhYmVsKSBsaW5rLnRleHRDb250ZW50ID0gZGlzcGxheUxhYmVsO1xuICAgICAgICAgICAgICAgICAgICBsaW5rLmhyZWYgPSBoYXJlbUxpbms7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHNoYXJkcyA9PT0gMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9iakVsZW0gPSBnaXJsLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcub2JqZWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmpFbGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpFbGVtLmlubmVyVGV4dCA9IGBJJ20gYWxyZWFkeSBhdHRyYWN0ZWQgdG8geW91LiBGaW5kIG1lIGluIHlvdXIgSGFyZW0hYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvbG9yICYmIHJhcml0eSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhaWROYW1lQ29udGFpbmVyID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5yYWlkLW5hbWUnKTtcbiAgICAgICAgICAgICAgICBpZiAocmFpZE5hbWVDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFpZE5hbWVDb250YWluZXIuc3R5bGUuY29sb3IgPSB0aGlzLnJhcml0eUNvbG9yc1tyYXJpdHldIHx8ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZpZ2h0X2ljb24pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWdodEljb24gPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmh1ZEJhdHRsZVB0c19taXhfaWNuJyk7XG4gICAgICAgICAgICAgICAgaWYgKGZpZ2h0SWNvbikge1xuICAgICAgICAgICAgICAgICAgICBmaWdodEljb24uc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybCgvaW1hZ2VzL3BpY3R1cmVzL2Rlc2lnbi9pY19lbmVyZ3lfZmlnaHQucG5nKSc7XG4gICAgICAgICAgICAgICAgICAgIGZpZ2h0SWNvbi5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9ICcyNHB4JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzaGFkb3dzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGVmdEltYWdlID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MSW1hZ2VFbGVtZW50PignLmdpcmwtaW1nLmxlZnQnKTtcbiAgICAgICAgICAgICAgICBpZiAobGVmdEltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlZnRJbWFnZS5zcmMgPSBsZWZ0SW1hZ2Uuc3JjLnJlcGxhY2UoJy1ibGFjaycsICcnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJhaWRDYXJkLmNsYXNzTGlzdC5jb250YWlucygnbXVsdGlwbGUtZ2lybCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0SW1hZ2UgPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxJbWFnZUVsZW1lbnQ+KCcuZ2lybC1pbWcucmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJpZ2h0SW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJpZ2h0SW1hZ2Uuc3JjID0gcmlnaHRJbWFnZS5zcmMucmVwbGFjZSgnYXZiMC5wbmcnLCAnZ3JhZGVfc2tpbnMvZ3JhZGVfc2tpbjEucG5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodEltYWdlLnNyYyA9IHJpZ2h0SW1hZ2Uuc3JjLnJlcGxhY2UoJy1ibGFjaycsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yQWxsKCcuZXllJykuZm9yRWFjaChlID0+IGUucmVtb3ZlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHR5cGUgeyBHaXJsRGF0YSwgTG92ZVJhaWQgfSBmcm9tICcuLi8uLi9nYW1lLXR5cGVzJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCwgbHNSbSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuaW1wb3J0IHsgZ2V0R2lybERpY3Rpb25hcnkgfSBmcm9tICcuL2dhbWVEYXRhJztcblxudHlwZSBSYWlkQ29weUJ1dHRvbiA9IEhUTUxEaXZFbGVtZW50ICYgeyBfYm91bmRDb3B5S2V5SGFuZGxlcj86IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gdm9pZCB9O1xuXG5leHBvcnQgY2xhc3MgTG92ZVJhaWRzUGFyc2VyIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIHByaXZhdGUgZ2lybERpY3Q6IFJlYWRvbmx5TWFwPHN0cmluZywgR2lybERhdGE+IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBfYm91bmRJbnNlcnRCdXR0b24/OiAoKSA9PiB2b2lkO1xuXG4gICAgLypcbiAgICAqIFJhaWQgSUQsIEFubm91bmNlbWVudCBUeXBlLCBCYWNrZ3JvdW5kIElELCBFdmVudCBOYW1lLCBTdGFydCBEYXRldGltZSxcbiAgICAqIEVuZCBEYXRldGltZSwgRHVyYXRpb24sIFJhaWQgU3RhdHVzLCBTb3VyY2UsIEdpcmwgSUQsXG4gICAgKiBHaXJsIE5hbWUsIFJhcml0eSwgTWF4IEdyYWRlLCBGaXJzdCBBcHBlYXJhbmNlLCBTb3VyY2UgSUQsXG4gICAgKiBIYXMgU2tpbihzKVxuICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnbG92ZVJhaWRzUGFyc2VyJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMb3ZlIFJhaWRzIGV4cG9ydFwiLCBcIkFkZCBhIGJ1dHRvbiB0byBjb3B5IG5ldyByYWlkcyBpbiBhIHNwcmVhZHNoZWV0LXJlYWR5IGZvcm1hdC5cIilcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sb3ZlLXJhaWRzLmh0bWwnKVxuICAgIH1cblxuICAgIGNhcGl0YWxpemVGaXJzdChzdHI6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyID8gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpIDogc3RyO1xuICAgIH1cblxuICAgIGdldEFubm91bmNlbWVudFR5cGUodHlwZTogTG92ZVJhaWRbJ2lkX2Fubm91bmNlbWVudF90eXBlJ10pIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiBcIkZ1bGxcIjtcbiAgICAgICAgICAgIGNhc2UgMjogcmV0dXJuIFwiUGFydGlhbFwiO1xuICAgICAgICAgICAgY2FzZSAzOiByZXR1cm4gXCJOb25lXCI7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gXCJVbmtub3duXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTb3VyY2VJRChldmVudDogTG92ZVJhaWQpIHtcbiAgICAgICAgY29uc3Qgc291cmNlX2lkID0gTnVtYmVyKGV2ZW50LnJhaWRfbW9kdWxlX3BrKTtcbiAgICAgICAgc3dpdGNoIChldmVudC5yYWlkX21vZHVsZV90eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzZWFzb24nOiByZXR1cm4gMDtcbiAgICAgICAgICAgIGNhc2UgJ2NoYW1waW9uJzogcmV0dXJuIE51bWJlci5pc0Zpbml0ZShzb3VyY2VfaWQpID8gc291cmNlX2lkIDogLTI7XG4gICAgICAgICAgICBjYXNlICd0cm9sbCc6IHJldHVybiBOdW1iZXIuaXNGaW5pdGUoc291cmNlX2lkKSA/IHNvdXJjZV9pZCArIDEwIDogLTI7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnaXJsSGFzU2tpbnMoZXZlbnQ6IExvdmVSYWlkKSB7XG4gICAgICAgIGNvbnN0IGhhc1NraW5zID0gQXJyYXkuaXNBcnJheShldmVudD8uZ2lybF9kYXRhPy5ncmFkZV9za2lucykgJiYgZXZlbnQuZ2lybF9kYXRhLmdyYWRlX3NraW5zLmxlbmd0aCA+IDA7XG4gICAgICAgIGlmIChoYXNTa2lucykge1xuICAgICAgICAgICAgcmV0dXJuIFwiWFwiO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIFwiT1wiO1xuICAgIH1cblxuICAgIGZvcm1hdEV2ZW50Um93KGV2ZW50OiBMb3ZlUmFpZCkge1xuICAgICAgICBjb25zdCBkdXJhdGlvbkhvdXJzID0gTWF0aC5mbG9vcihOdW1iZXIoZXZlbnQuZXZlbnRfZHVyYXRpb25fc2Vjb25kcykgLyAzNjAwKTtcbiAgICAgICAgY29uc3QgZHVyYXRpb24gPSBgJHtkdXJhdGlvbkhvdXJzfSBob3Vyc2A7XG5cbiAgICAgICAgY29uc3QgZ2lybCA9IHRoaXMuZ2lybERpY3Q/LmdldChTdHJpbmcoZXZlbnQuaWRfZ2lybCkpIHx8IHt9O1xuICAgICAgICBjb25zdCB7IG5hbWUgPSAnVW5rbm93bicsIHJhcml0eSA9ICdOL0EnLCBncmFkZSA9IDAgfSA9IGdpcmw7XG5cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGV2ZW50LmlkX3JhaWQsXG4gICAgICAgICAgICB0aGlzLmdldEFubm91bmNlbWVudFR5cGUoZXZlbnQuaWRfYW5ub3VuY2VtZW50X3R5cGUpLFxuICAgICAgICAgICAgZXZlbnQuYmFja2dyb3VuZF9pZCxcbiAgICAgICAgICAgIGV2ZW50LmV2ZW50X25hbWUsXG4gICAgICAgICAgICBldmVudC5zdGFydF9kYXRldGltZSxcbiAgICAgICAgICAgIGV2ZW50LmVuZF9kYXRldGltZSxcbiAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgZXZlbnQuc3RhdHVzLFxuICAgICAgICAgICAgZXZlbnQucmFpZF9tb2R1bGVfdHlwZSxcbiAgICAgICAgICAgIGV2ZW50LmlkX2dpcmwsXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgdGhpcy5jYXBpdGFsaXplRmlyc3QocmFyaXR5KSxcbiAgICAgICAgICAgIGdyYWRlLFxuICAgICAgICAgICAgXCJcIiwgLy8gb25lIGJsYW5rIHRhYiByZXNlcnZlZCBmb3IgZmlyc3QgYXBwZWFyYW5jZSBpbiBHU2hlZXRzXG4gICAgICAgICAgICB0aGlzLmdldFNvdXJjZUlEKGV2ZW50KSxcbiAgICAgICAgICAgIHRoaXMuZ2lybEhhc1NraW5zKGV2ZW50KVxuICAgICAgICBdLmpvaW4oXCJcXHRcIik7XG4gICAgfVxuXG4gICAgYXN5bmMgY29weVRvQ2xpcGJvYXJkKHRleHQ6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NsaXBib2FyZCBBUEkgZmFpbGVkLCB1c2luZyBleGVjQ29tbWFuZCBmYWxsYmFjazonLCBlcnIpO1xuICAgICAgICAgICAgY29uc3QgdGV4dGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xuICAgICAgICAgICAgdGV4dGFyZWEudmFsdWUgPSB0ZXh0O1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG4gICAgICAgICAgICB0ZXh0YXJlYS5zZWxlY3QoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRleHRhcmVhLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgaGFuZGxlQ29weUNsaWNrKGV2dDogTW91c2VFdmVudCkge1xuICAgICAgICBjb25zdCBzdG9yYWdlS2V5ID0gJ0xhc3RTYXZlZFJhaWRJRCc7XG5cbiAgICAgICAgLy8gU2hpZnQgKyBDdHJsICsgQ2xpY2sg4oaSIGNsZWFyIHN0b3JlZCBJRFxuICAgICAgICBpZiAoZXZ0LnNoaWZ0S2V5ICYmIGV2dC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBjb25zdCBjb25maXJtQ2xlYXIgPSBjb25maXJtKCfimqDvuI8gRG8geW91IHdhbnQgdG8gY2xlYXIgdGhlIHNhdmVkIGxhc3QgcmFpZCBJRCBmb3IgdGhpcyBzaXRlPycpO1xuICAgICAgICAgICAgaWYgKGNvbmZpcm1DbGVhcikge1xuICAgICAgICAgICAgICAgIGxzUm0oc3RvcmFnZUtleSk7XG4gICAgICAgICAgICAgICAgYWxlcnQoJ+KchSBMYXN0IHNhdmVkIElEIGNsZWFyZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb2FkIHJhaWRzXG4gICAgICAgIGNvbnN0IGxvY2FsTG92ZVJhaWRzID0gKHR5cGVvZiBsb3ZlX3JhaWRzICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KGxvdmVfcmFpZHMpKSA/IGxvdmVfcmFpZHMgOiBbXTtcbiAgICAgICAgaWYgKCFsb2NhbExvdmVSYWlkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfimqDvuI8gTm8gbG92ZV9yYWlkcyBmb3VuZCBvbiB0aGlzIHBhZ2UuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZ2lybERpY3QpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfimqDvuI8gVGhlIEhIKysgZ2lybCBkaWN0aW9uYXJ5IGNvdWxkIG5vdCBiZSBsb2FkZWQuIFJlbG9hZCB0aGUgcGFnZSBhbmQgdHJ5IGFnYWluLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxhc3RTYXZlZElkTnVtYmVyID0gcGFyc2VJbnQoU3RyaW5nKGxzR2V0KHN0b3JhZ2VLZXkpKSwgMTApO1xuXG4gICAgICAgIC8vIElmIFNoaWZ0IGlzIGhlbGQgT1Igbm8gc2F2ZWQgSUQgZXhpc3RzIOKGkiBhc2sgYWdhaW5cbiAgICAgICAgaWYgKGlzTmFOKGxhc3RTYXZlZElkTnVtYmVyKSB8fCBldnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RTYXZlZElkID0gcHJvbXB0KCdQbGVhc2UgZW50ZXIgdGhlIGxhc3Qgc2F2ZWQgSUQ6Jyk7XG4gICAgICAgICAgICBsYXN0U2F2ZWRJZE51bWJlciA9IHBhcnNlSW50KFN0cmluZyhsYXN0U2F2ZWRJZCksIDEwKTtcblxuICAgICAgICAgICAgaWYgKGlzTmFOKGxhc3RTYXZlZElkTnVtYmVyKSkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCfinYwgSW52YWxpZCBJRCBlbnRlcmVkLiBQbGVhc2UgZW50ZXIgYSB2YWxpZCBudW1iZXIuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlsdGVyIG5ldyBldmVudHNcbiAgICAgICAgY29uc3QgZmlsdGVyZWREYXRhID0gbG9jYWxMb3ZlUmFpZHMuZmlsdGVyKGV2ZW50ID0+IE51bWJlcihldmVudC5pZF9yYWlkKSA+IGxhc3RTYXZlZElkTnVtYmVyKTtcbiAgICAgICAgaWYgKCFmaWx0ZXJlZERhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbGVydChg4oS577iPIE5vIG5ldyBldmVudHMgZm91bmQgd2l0aCBJRCBncmVhdGVyIHRoYW4gJHtsYXN0U2F2ZWRJZE51bWJlcn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZERhdGEgPSBmaWx0ZXJlZERhdGEubWFwKHRoaXMuZm9ybWF0RXZlbnRSb3cuYmluZCh0aGlzKSkuam9pbihcIlxcblwiKTtcblxuICAgICAgICBpZiAoIWF3YWl0IHRoaXMuY29weVRvQ2xpcGJvYXJkKGZvcm1hdHRlZERhdGEpKSB7XG4gICAgICAgICAgICBhbGVydCgn4p2MIENvdWxkIG5vdCBjb3B5IHRoZSByYWlkcy4gVGhlIGxhc3Qgc2F2ZWQgSUQgd2FzIGtlcHQuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTYXZlIGhpZ2hlc3QgSURcbiAgICAgICAgY29uc3QgbWF4SWQgPSBNYXRoLm1heCguLi5maWx0ZXJlZERhdGEubWFwKGUgPT4gTnVtYmVyKGUuaWRfcmFpZCkpKTtcbiAgICAgICAgbHNTZXQoc3RvcmFnZUtleSwgbWF4SWQpO1xuXG4gICAgICAgIGFsZXJ0KCfinIUgRGF0YSBjb3BpZWQgdG8gY2xpcGJvYXJkISBZb3UgY2FuIG5vdyBwYXN0ZSBpdCBpbnRvIEdTaGVldHMuJyk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ29weUJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uOiBSYWlkQ29weUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgncmVtaW5kZXItY29weScpO1xuICAgICAgICBidXR0b24uc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxODBkZWcsICMwMGFhZmYgMCwgIzAwNjY4OCA1MCUsICMwMDU1NzcgNTElLCAjMDBhYWZmIDEwMCUpO1xuICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgd2lkdGg6IDMycHg7XG4gICAgICAgICAgICBoZWlnaHQ6IDMycHg7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogMTBweDtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgIHJpZ2h0OiA0LjVyZW07XG4gICAgICAgICAgICB0b3A6IDAuMnJlbTtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMThweDtcbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAzMnB4O1xuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAwLjJzIGVhc2U7XG4gICAgICAgIGA7XG4gICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5OLJztcbiAgICAgICAgbGV0IGJ1dHRvblRpdGxlID0gJ0NsaWNrID0gY29weSBuZXcgcmFpZHMuIFNoaWZ0IC8gU2hpZnQgKyBDdHJsIGF2YWlsYWJsZS4nO1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCd0b29sdGlwJywgJycpO1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcblxuICAgICAgICBjb25zdCBfYm91bmRDb3B5S2V5SGFuZGxlciA9IChlOiBLZXlib2FyZEV2ZW50KSA9PiB0aGlzLnVwZGF0ZUNvcHlCdXR0b24oZSwgYnV0dG9uKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBfYm91bmRDb3B5S2V5SGFuZGxlcik7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIF9ib3VuZENvcHlLZXlIYW5kbGVyKTtcbiAgICAgICAgLy8gc3RvcmUgaGFuZGxlciByZWZlcmVuY2Ugc28gY2FsbGVycyBjYW4gcmVtb3ZlIGxpc3RlbmVycyBpZiBidXR0b24gaXMgcmVtb3ZlZCBsYXRlclxuICAgICAgICBidXR0b24uX2JvdW5kQ29weUtleUhhbmRsZXIgPSBfYm91bmRDb3B5S2V5SGFuZGxlcjtcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoZSkgPT4gdGhpcy5oYW5kbGVDb3B5Q2xpY2soZSk7XG4gICAgICAgIHRoaXMudXBkYXRlQ29weUJ1dHRvbih7IHNoaWZ0S2V5OiBmYWxzZSwgY3RybEtleTogZmFsc2UgfSwgYnV0dG9uKTtcbiAgICAgICAgcmV0dXJuIGJ1dHRvbjtcbiAgICB9XG5cbiAgICB1cGRhdGVDb3B5QnV0dG9uKGU6IFBpY2s8S2V5Ym9hcmRFdmVudCwgJ3NoaWZ0S2V5JyB8ICdjdHJsS2V5Jz4sIGJ1dHRvbjogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgbGV0IGJ1dHRvblRpdGxlID0gJyc7XG4gICAgICAgIGlmIChlLnNoaWZ0S2V5ICYmIGUuY3RybEtleSkge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmZjY2NjYgMCwgI2FhMDAwMCAxMDAlKVwiOyAvLyByZWRcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5eR77iPJztcbiAgICAgICAgICAgIGJ1dHRvblRpdGxlID0gJ1NoaWZ0ICsgQ3RybCArIENsaWNrID0gY2xlYXIgc2F2ZWQgSUQnO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmZmRkNjYgMCwgI2NjOTkwMCAxMDAlKVwiOyAvLyB5ZWxsb3dcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfinI/vuI8nO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnU2hpZnQgKyBDbGljayA9IHByb21wdCBmb3IgSUQuJztcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICMwMGFhZmYgMCwgIzAwNjY4OCA1MCUsICMwMDU1NzcgNTElLCAjMDBhYWZmIDEwMCUpXCI7IC8vIGRlZmF1bHQgYmx1ZVxuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ/Cfk4snO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnQ2xpY2sgPSBjb3B5IG5ldyByYWlkcy4gU2hpZnQgLyBTaGlmdCArIEN0cmwgYXZhaWxhYmxlLic7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluc2VydEJ1dHRvbigpIHtcbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbi1ub3RpZmljYXRpb24tYWN0aW9uLm5vdGlmX2J1dHRvbl9zJyk7XG4gICAgICAgIGlmIChub3RpZmljYXRpb25CdXR0b24gJiYgIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW1pbmRlci1jb3B5JykpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvcHlCdXR0b24gPSB0aGlzLmNyZWF0ZUNvcHlCdXR0b24oKTtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbkJ1dHRvbi5wYXJlbnROb2RlPy5pbnNlcnRCZWZvcmUoY29weUJ1dHRvbiwgbm90aWZpY2F0aW9uQnV0dG9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgICAgICB0aGlzLmdpcmxEaWN0ID0gYXdhaXQgZ2V0R2lybERpY3Rpb25hcnkoKTtcblxuICAgICAgICB0aGlzLl9ib3VuZEluc2VydEJ1dHRvbiA9IHRoaXMuaW5zZXJ0QnV0dG9uLmJpbmQodGhpcyk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB0aGlzLmluc2VydEJ1dHRvbigpO1xuICAgICAgICBlbHNlIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcy5fYm91bmRJbnNlcnRCdXR0b24sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuZXhwb3J0IGNsYXNzIEFjdGl2aXR5UGFyc2VyIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2FjdGl2aXR5UGFyc2VyJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJNaXNzaW9uIGNvcGllclwiLCBcIkVuYWJsZSB0aGUgY29weSB0b29sIGZvciBsZWdlbmRhcnkgbWlzc2lvbiBkZXRhaWxzLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ21pc3Npb25Db3BpZXInLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkxlZ2VuZGFyeSBkZXRhaWxzXCIsIFwiQ2xpY2sgYSBsZWdlbmRhcnkgbWlzc2lvbuKAmXMgdGl0bGUsIGRlc2NyaXB0aW9uLCBvciBpbWFnZSB0byBjb3B5IGl0LlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9hY3Rpdml0aWVzLmh0bWwnKVxuICAgIH1cblxuICAgIGFzeW5jIGNvcHlUb0NsaXBib2FyZCh0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgIGNvbnN0IHRvYXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvYXN0LnRleHRDb250ZW50ID0gJ0NvcGllZCEnO1xuICAgICAgICB0b2FzdC5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmJvdHRvbSA9ICcxMHB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUucmlnaHQgPSAnMTBweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLmJhY2tncm91bmQgPSAncmdiYSgwLDAsMCwwLjcpJztcbiAgICAgICAgdG9hc3Quc3R5bGUuY29sb3IgPSAnd2hpdGUnO1xuICAgICAgICB0b2FzdC5zdHlsZS5wYWRkaW5nID0gJzVweCAxMHB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUuYm9yZGVyUmFkaXVzID0gJzVweCc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnpJbmRleCA9ICc5OTk5JztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0b2FzdCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdG9hc3QucmVtb3ZlKCksIDEwMDApO1xuICAgIH1cblxuICAgIHJ1bih7IG1pc3Npb25Db3BpZXIgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGlmIChtaXNzaW9uQ29waWVyKSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1pc3Npb25fZW50cnkubGVnZW5kYXJ5Jyk7XG4gICAgICAgICAgICBpZiAoIWVudHJpZXMubGVuZ3RoKSByZXR1cm47XG5cbiAgICAgICAgICAgIGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW1nRGl2ID0gZW50cnkucXVlcnlTZWxlY3RvcjxIVE1MSW1hZ2VFbGVtZW50PignLm1pc3Npb25faW1hZ2UgaW1nJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGVBbGwgPSBlbnRyeS5xdWVyeVNlbGVjdG9yPEhUTUxIZWFkaW5nRWxlbWVudD4oJy5taXNzaW9uX2RldGFpbHMgaDEnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkZXNjID0gZW50cnkucXVlcnlTZWxlY3RvcjxIVE1MUGFyYWdyYXBoRWxlbWVudD4oJy5taXNzaW9uX2RldGFpbHMgcCcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGltZ0Rpdikge1xuICAgICAgICAgICAgICAgICAgICBpbWdEaXYuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICBpbWdEaXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZChpbWdEaXYuc3JjKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlQWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlQWxsLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3V0ZXJUaXRsZSA9IHRpdGxlQWxsLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcuZXZlbnQtbWlzc2lvbi1jb250ZW50LXRleHQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dGVyVGl0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyVGl0bGUuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJUaXRsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQoKG91dGVyVGl0bGUudGV4dENvbnRlbnQgPz8gJycpLnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlQWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ICYmIGUudGFyZ2V0LmNsb3Nlc3QoJy5ldmVudC1taXNzaW9uLWNvbnRlbnQtdGV4dCcpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUNsb25lID0gdGl0bGVBbGwuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxIZWFkaW5nRWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlQ2xvbmUucXVlcnlTZWxlY3RvcignLmV2ZW50LW1pc3Npb24tY29udGVudC10ZXh0Jyk/LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSAodGl0bGVDbG9uZS50ZXh0Q29udGVudCA/PyAnJykudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQodGl0bGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVzYykge1xuICAgICAgICAgICAgICAgICAgICBkZXNjLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgZGVzYy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKGRlc2MuaW5uZXJUZXh0LnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBpbml0R2FtZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBpbmplY3RTdHlsZXMsIHBhY2tTZXR0aW5ncyB9IGZyb20gJy4vc2V0dGluZ3MnO1xuaW1wb3J0IHsgRnJpZW5kQW5kRm9lcyB9IGZyb20gJy4vbW9kdWxlcy9wbGF5ZXJzL0ZyaWVuZEFuZEZvZXMnO1xuaW1wb3J0IHsgYXJtQ29udGVzdFN0YXJ0dXBHdWFyZCwgQ29udGVzdFN0YXJ0IH0gZnJvbSAnLi9tb2R1bGVzL2NvbnRlc3RzL0NvbnRlc3RTdGFydCc7XG5pbXBvcnQgeyBpbnN0YWxsQ29udGVzdFNldHRpbmdzIH0gZnJvbSAnLi9tb2R1bGVzL2NvbnRlc3RzL2NvbnRlc3RQcmVmZXJlbmNlcyc7XG5pbXBvcnQgeyBMZWFndWVUb3AyMCB9IGZyb20gJy4vbW9kdWxlcy9wbGF5ZXJzL0xlYWd1ZVRvcDIwJztcbmltcG9ydCB7IFJlbW92ZVBhc3NMb2NrIH0gZnJvbSAnLi9tb2R1bGVzL3Byb2dyZXNzaW9uL1JlbW92ZVBhc3NMb2NrJztcbmltcG9ydCB7IExvdmVSYWlkc0FkZG9uIH0gZnJvbSAnLi9tb2R1bGVzL2xvdmUtcmFpZHMvTG92ZVJhaWRzQWRkb24nO1xuaW1wb3J0IHsgTG92ZVJhaWRzUGFyc2VyIH0gZnJvbSAnLi9tb2R1bGVzL2xvdmUtcmFpZHMvTG92ZVJhaWRzUGFyc2VyJztcbmltcG9ydCB7IEFjdGl2aXR5UGFyc2VyIH0gZnJvbSAnLi9tb2R1bGVzL2FjdGl2aXRpZXMvQWN0aXZpdHlQYXJzZXInO1xuXG5hcm1Db250ZXN0U3RhcnR1cEd1YXJkKCk7XG5cbmZ1bmN0aW9uIHJ1bkphcnZpcygpIHtcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBydW5KYXJ2aXMsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgJCB9ID0gd2luZG93O1xuXG4gICAgaWYgKCEkKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJ1bkphcnZpcywgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICBjb25zb2xlLmxvZygnV0FSTklORzogTm8galF1ZXJ5IGZvdW5kLiBFbmRpbmcgc2NyaXB0LicpO1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnSGVsbG8sIFNpciwgSi5BLlIuVi5JLlMuIGlzIHJlYWR5IHRvIGhlbHAgeW91LicpO1xuXG4gICAgaW5pdEdhbWUoJCk7XG4gICAgaW5qZWN0U3R5bGVzKCk7XG5cbiAgICBjb25zdCBmcmllbmRzQW5kRm9lcyA9IG5ldyBGcmllbmRBbmRGb2VzKCk7XG4gICAgY29uc3QgYWxsTW9kdWxlcyA9IFtcbiAgICAgICAgZnJpZW5kc0FuZEZvZXMsXG4gICAgICAgIG5ldyBDb250ZXN0U3RhcnQoKSxcbiAgICAgICAgbmV3IExlYWd1ZVRvcDIwKCksXG4gICAgICAgIG5ldyBSZW1vdmVQYXNzTG9jaygpLFxuICAgICAgICBuZXcgTG92ZVJhaWRzQWRkb24oKSxcbiAgICAgICAgbmV3IExvdmVSYWlkc1BhcnNlcigpLFxuICAgICAgICBuZXcgQWN0aXZpdHlQYXJzZXIoKVxuICAgIF1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBydW5TY3JpcHQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGhoUGx1c1BsdXNDb25maWcgfSA9IHdpbmRvd1xuICAgICAgICAgICAgaWYgKCFoaFBsdXNQbHVzQ29uZmlnKSByZXR1cm47XG5cbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJHcm91cCh7XG4gICAgICAgICAgICAgICAga2V5OiAnSkFSVklTJyxcbiAgICAgICAgICAgICAgICBuYW1lOiBgPHNwYW4gdG9vbHRpcD1cIkJ5IElyb24gTWFuIMK3IHYke1VTRVJTQ1JJUFRfVkVSU0lPTl9MQUJFTH1cIj5ISCBKYXJ2aXM8L3NwYW4+YFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGFsbE1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4ge1xuICAgICAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJNb2R1bGUobW9kdWxlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcubG9hZENvbmZpZygpXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJ1bk1vZHVsZXMoKVxuICAgICAgICAgICAgZnJpZW5kc0FuZEZvZXMuaW5zdGFsbFNldHRpbmdzKCk7XG4gICAgICAgICAgICBpbnN0YWxsQ29udGVzdFNldHRpbmdzKCk7XG4gICAgICAgICAgICBwYWNrU2V0dGluZ3MoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aW5kb3cuaGhQbHVzUGx1c0NvbmZpZykge1xuICAgICAgICAgICAgcnVuU2NyaXB0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uZSgnaGgrKy1iZHNtOmxvYWRlZCcsIHJ1blNjcmlwdClcbiAgICAgICAgfVxuICAgIH0sIDEpXG59XG5cbnJ1bkphcnZpcygpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFPLE1BQUk7QUFDSixNQUFJO0FBRUosV0FBUyxTQUFTLFFBQXNCO0FBQzNDLFFBQUk7QUFDSixrQkFBYyxPQUFPLFNBQVM7QUFBQSxFQUNsQzs7O0FDTk8sV0FBUyxZQUFZLE9BQWUsYUFBcUI7QUFDNUQsVUFBTSxTQUFTLENBQUMsU0FBaUIsS0FBSyxXQUFXLEtBQUssT0FBTyxFQUFFLFdBQVcsS0FBSyxRQUFRLEVBQ2xGLFdBQVcsS0FBSyxNQUFNLEVBQUUsV0FBVyxLQUFLLE1BQU07QUFDbkQsV0FBTyxPQUFPLEtBQUssSUFBSSxzRkFDbkIsT0FBTyxLQUFLLElBQUksMEJBQTBCLE9BQU8sV0FBVyxJQUFJO0FBQUEsRUFDeEU7QUFFTyxXQUFTLGtCQUFrQixPQUFvQixXQUFtQjtBQUNyRSxVQUFNLFVBQVUsU0FBUyxjQUFjLEtBQUs7QUFDNUMsWUFBUSxLQUFLO0FBQ2IsWUFBUSxZQUFZO0FBQ3BCLFlBQVEsYUFBYSxRQUFRLFNBQVM7QUFDdEMsVUFBTSxVQUFVLE9BQU8sUUFBUSxnQkFBZ0I7QUFD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QTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFB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QUFBLE1BQ2xCO0FBQUEsSUFDSjtBQUFBLEVBQ0o7OztBQ2xGQSx5QkFBdUI7QUFFdkIsV0FBUyxZQUFZO0FBQ2pCLFFBQUksU0FBUyxlQUFlLFdBQVc7QUFDbkMsZUFBUyxpQkFBaUIsb0JBQW9CLFdBQVcsRUFBRSxNQUFNLEtBQUssQ0FBQztBQUN2RTtBQUFBLElBQ0o7QUFFQSxVQUFNLEVBQUUsR0FBQUMsR0FBRSxJQUFJO0FBRWQsUUFBSSxDQUFDQSxJQUFHO0FBQ0osVUFBSSxTQUFTLGVBQWUsWUFBWTtBQUNwQyxlQUFPLGlCQUFpQixRQUFRLFdBQVcsRUFBRSxNQUFNLEtBQUssQ0FBQztBQUN6RDtBQUFBLE1BQ0o7QUFDQSxlQUFTLGVBQWUsd0JBQXdCLEdBQUcsT0FBTztBQUMxRCxjQUFRLElBQUksMENBQTBDO0FBQ3REO0FBQUEsSUFDSjtBQUVBLFlBQVEsSUFBSSxnREFBZ0Q7QUFFNUQsYUFBU0EsRUFBQztBQUNWLGlCQUFhO0FBRWIsVUFBTSxpQkFBaUIsSUFBSSxjQUFjO0FBQ3pDLFVBQU0sYUFBYTtBQUFBLE1BQ2Y7QUFBQSxNQUNBLElBQUksYUFBYTtBQUFBLE1BQ2pCLElBQUksWUFBWTtBQUFBLE1BQ2hCLElBQUksZUFBZTtBQUFBLE1BQ25CLElBQUksZUFBZTtBQUFBLE1BQ25CLElBQUksZ0JBQWdCO0FBQUEsTUFDcEIsSUFBSSxlQUFlO0FBQUEsSUFDdkI7QUFFQSxlQUFXLE1BQU07QUFDYixZQUFNLFlBQVksTUFBTTtBQUNwQixjQUFNLEVBQUUsaUJBQWlCLElBQUk7QUFDN0IsWUFBSSxDQUFDLGlCQUFrQjtBQUV2Qix5QkFBaUIsY0FBYztBQUFBLFVBQzNCLEtBQUs7QUFBQSxVQUNMLE1BQU0saUNBQWlDLFdBQXdCO0FBQUEsUUFDbkUsQ0FBQztBQUNELG1CQUFXLFFBQVEsWUFBVTtBQUN6QiwyQkFBaUIsZUFBZSxNQUFNO0FBQUEsUUFDMUMsQ0FBQztBQUNELHlCQUFpQixXQUFXO0FBQzVCLHlCQUFpQixXQUFXO0FBQzVCLHVCQUFlLGdCQUFnQjtBQUMvQiwrQkFBdUI7QUFDdkIscUJBQWE7QUFBQSxNQUNqQjtBQUVBLFVBQUksT0FBTyxrQkFBa0I7QUFDekIsa0JBQVU7QUFBQSxNQUNkLE9BQU87QUFDSCxRQUFBQSxHQUFFLFFBQVEsRUFBRSxJQUFJLG9CQUFvQixTQUFTO0FBQUEsTUFDakQ7QUFBQSxJQUNKLEdBQUcsQ0FBQztBQUFBLEVBQ1I7QUFFQSxZQUFVOyIsCiAgIm5hbWVzIjogWyJtYXRjaGVzIiwgInBsYXllciIsICJlcnIiLCAiJCJdCn0K
