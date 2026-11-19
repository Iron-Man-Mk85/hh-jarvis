// ==UserScript==
// @name           HH J.A.R.V.I.S. (Testing)
// @version        0.6.5
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
.hh-plus-plus-config-panel .jarvis-version {
    font-size: .66em;
    font-weight: normal;
    opacity: .8;
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
select.jarvis-contest-rank-start {
    all: unset;
    display: inline-block;
    margin-inline-start: .25em;
    padding-inline: .15em;
    color: inherit;
    font: inherit;
    font-size: .72em;
    text-decoration: underline dotted;
    text-underline-offset: 2px;
    cursor: pointer;
}
.jarvis-contest-rank-start option {
    background: #232936;
    color: #fff;
}
.jarvis-contest-rank-start:focus-visible {
    outline: 1px solid currentColor;
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
td[data-jarvis-mark] > a {
    color: inherit !important;
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

  // src/modules/players/FriendAndFoes.ts
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
        label: '<span tooltip="Right-click a player name to mark it. Press Esc to stop marking.">Show Friends and Foes</span>',
        subSettings: [{
          key: "league",
          label: "Show in League",
          default: true
        }, {
          key: "contests",
          label: "Show in Contests",
          default: true
        }]
      };
      super({ name: baseKey, configSchema });
    }
    shouldRun() {
      return ["/home.html", "/leagues.html", "/activities.html"].includes(currentPage);
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
        friend: typeof saved?.friend === "string" && /^#[\da-f]{6}$/i.test(saved.friend) ? saved.friend : "#72caff",
        foe: typeof saved?.foe === "string" && /^#[\da-f]{6}$/i.test(saved.foe) ? saved.foe : "#ff8383"
      };
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
    addColorSettings() {
      const selector = '.group-panel[rel="JARVIS"] .config-setting[rel="JARVIS_friendAndFoes"] .sub-settings';
      window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
        const settings = document.querySelector(selector);
        if (!settings || settings.querySelector(".jarvis-mark-color")) return;
        for (const [mark, text] of [["friend", "Friend name color"], ["foe", "Foe name color"]]) {
          const label = document.createElement("label");
          label.className = "jarvis-mark-color";
          const title = document.createElement("span");
          title.textContent = text;
          const input = document.createElement("input");
          input.type = "color";
          input.value = this.readColors()[mark];
          input.disabled = !settings.closest(".config-setting")?.classList.contains("enabled");
          input.addEventListener("change", () => {
            const colors = this.readColors();
            if (!this.saveSetting("PlayerMarkColors", { ...colors, [mark]: input.value })) input.value = colors[mark];
          });
          label.append(title, input);
          settings.appendChild(label);
        }
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
      const actions = [["friend", "Mark friend"], ["foe", "Mark foe"], ["clear", "Clear mark"]];
      if (this.mode) actions.push(["", "Stop marking"]);
      for (const [mode, text] of actions) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = text;
        button.addEventListener("click", () => {
          this.closeMarkMenu();
          this.setMode(mode);
          if (mode && this.names.get(name) === id) this.applyMark(id);
          if (mode) name.focus({ preventScroll: true });
        });
        menu.appendChild(button);
      }
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
        } else if (name.dataset.jarvisMark) {
          delete name.dataset.jarvisMark;
        }
      }
      this.setMode(this.mode);
    }
    applyMark(id) {
      const marks = this.readMarks();
      if (this.mode === "clear") delete marks[id];
      else marks[id] = this.mode;
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
      if (currentPage === "/home.html") {
        this.addColorSettings();
        this.hasRun = true;
        return;
      }
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

  // src/modules/contests/ContestStart.ts
  function armContestStartupGuard() {
    "use strict";
    if (location.pathname !== "/activities.html" || new URLSearchParams(location.search).get("tab") !== "contests") return;
    try {
      const pin = lsGet("ContestStartId");
      if (typeof pin !== "string" && typeof pin !== "number" || !pin || JSON.parse(localStorage.getItem("HHPlusPlusConfig") ?? "null")?.JARVIS_contestStart === false) return;
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
    startId = "";
    rankStart = "top";
    list = null;
    right = null;
    restoringCard = null;
    reposition = null;
    stopJump = null;
    constructor() {
      const baseKey = "contestStart";
      const configSchema = {
        baseKey,
        default: true,
        label: "Open a preferred contest without the scroll animation"
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
          label: String(name || contest?.name || contest?.title || (contest?.category_type === "daily" ? "Daily contest" : "Contest")).trim()
        }];
      });
    }
    clearExpiredPin(list, contests, finished) {
      if (!this.preference || contests.some(({ id }) => id === this.preference)) return;
      const active = window.contests?.active;
      const missing = document.readyState === "complete" && list.querySelector(".contest_header") && active && !Object.values(active).some((contest) => String(contest?.id_contest) === this.preference);
      if (!finished.has(this.preference) && !missing) return;
      const expiredId = this.preference;
      this.preference = "";
      this.startId = "";
      this.stopJump?.();
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
              this.startId = "";
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
        pin.title = pinned ? "Pinned. Click to restore the game default." : "Open this contest when the page reloads";
        let position = host.querySelector(":scope > .jarvis-contest-rank-start");
        if (!pinned) {
          position?.remove();
          continue;
        }
        if (!position) {
          const select = document.createElement("select");
          select.className = "jarvis-contest-rank-start";
          select.setAttribute("aria-label", "Leaderboard position on reload");
          select.title = "Where to open the pinned contest leaderboard";
          select.add(new Option("Top", "top"));
          select.add(new Option("My rank", "mine"));
          select.addEventListener("click", (event) => event.stopPropagation());
          select.addEventListener("keydown", (event) => event.stopPropagation());
          select.addEventListener("change", (event) => {
            event.stopPropagation();
            const next = select.value === "mine" ? "mine" : "top";
            try {
              lsSet("ContestRankStart", next);
              this.rankStart = next;
            } catch (err) {
              select.value = this.rankStart;
              console.warn("Jarvis could not save the leaderboard position:", err);
            }
          });
          pin.after(select);
          position = select;
        }
        position.value = this.rankStart;
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
      const placeAtOwnRank = this.rankStart === "mine";
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
          this.startId = "";
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
      if (!this.preference) {
        this.showLeaderboard(right, null);
        document.getElementById("jarvis-contest-startup")?.remove();
        return;
      }
      if (this.reposition) {
        this.reposition();
        return;
      }
      const target = contests.find((contest) => contest.id === this.startId);
      if (target) this.openContest(list, right, target);
      else if (!this.startId) this.showLeaderboard(right, this.getSelectedContestId(list, right));
    }
    run() {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      try {
        const pin = lsGet("ContestStartId");
        this.preference = (typeof pin === "string" || typeof pin === "number") && pin ? String(pin) : "";
      } catch {
        this.preference = "";
      }
      this.startId = this.preference;
      try {
        this.rankStart = lsGet("ContestRankStart") === "mine" ? "mine" : "top";
      } catch {
        this.rankStart = "top";
      }
      const observer = new MutationObserver((mutations) => {
        const list = document.querySelector("#contests .left_part .scroll_area");
        const right = document.querySelector("#contests .right_part");
        if (list !== this.list || right !== this.right || mutations.some(({ target }) => list && (list.contains(target) || target.contains(list)) || right && (right.contains(target) || target.contains(right)))) {
          this.refresh();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style", "hidden", "id_contest"]
      });
      if (document.readyState !== "complete") window.addEventListener("load", () => this.refresh(), { once: true });
      document.body.addEventListener("click", (event) => {
        if (event.isTrusted && event.target instanceof Element && this.preference && this.right && this.list?.contains(event.target) && event.target.closest(".contest_header")) this.showLeaderboard(this.right, null);
      }, true);
      this.refresh();
      this.hasRun = true;
    }
  };

  // src/modules/players/LeagueTop20.ts
  var LeagueTop20 = class extends HHModule {
    constructor() {
      const baseKey = "leagueTop20";
      const configSchema = {
        baseKey,
        default: true,
        label: `Show the Top 20 promotion target in lower leagues`
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
        label: `Remove the lock icon in PoV/PoG Pass/Pass+ for easier reading`,
        subSettings: [{
          key: "pov",
          label: `Remove in PoV`,
          default: true
        }, {
          key: "pog",
          label: `Remove in PoG`,
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
        label: `Visual enhancements for Love Raids page`,
        subSettings: [{
          key: "raid_id",
          label: `Show raid ID before raid name`,
          default: false
        }, {
          key: "names",
          label: `Show names on mysterious girls`,
          default: true
        }, {
          key: "skin",
          label: `Show 👙 icon if a girl has a skin (works on hidden ones)`,
          default: true
        }, {
          key: "color",
          label: `Set the color based on rarity`,
          default: true
        }, {
          key: "fight_icon",
          label: `Show better fight icon`,
          default: true
        }, {
          key: "shadows",
          label: `Replace shadow poses`,
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
        label: `Add a parser in Love Raids page for GSheet management`
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
        label: `Helper for GSheet management`,
        subSettings: [{
          key: "missionCopier",
          label: `Legendary missions info copier`,
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
    const allModules = [
      new FriendAndFoes(),
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
          name: `HH Jarvis <small class="jarvis-version">v${"0.6.5 testing"}</small>`
        });
        allModules.forEach((module) => {
          hhPlusPlusConfig.registerModule(module);
        });
        hhPlusPlusConfig.loadConfig();
        hhPlusPlusConfig.runModules();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzLmNzcyIsICJzcmMvc2V0dGluZ3MudHMiLCAic3JjL0hITW9kdWxlLnRzIiwgInNyYy9zdG9yYWdlLnRzIiwgInNyYy9tb2R1bGVzL3BsYXllcnMvRnJpZW5kQW5kRm9lcy50cyIsICJzcmMvbW9kdWxlcy9jb250ZXN0cy9Db250ZXN0U3RhcnQudHMiLCAic3JjL21vZHVsZXMvcGxheWVycy9MZWFndWVUb3AyMC50cyIsICJzcmMvbW9kdWxlcy9wcm9ncmVzc2lvbi9SZW1vdmVQYXNzTG9jay50cyIsICJzcmMvbW9kdWxlcy9sb3ZlLXJhaWRzL2dhbWVEYXRhLnRzIiwgInNyYy9tb2R1bGVzL2xvdmUtcmFpZHMvTG92ZVJhaWRzQWRkb24udHMiLCAic3JjL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNQYXJzZXIudHMiLCAic3JjL21vZHVsZXMvYWN0aXZpdGllcy9BY3Rpdml0eVBhcnNlci50cyIsICJzcmMvaW5kZXgudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBsZXQgJDogSlF1ZXJ5U3RhdGljO1xuZXhwb3J0IGxldCBjdXJyZW50UGFnZTogc3RyaW5nO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5pdEdhbWUoalF1ZXJ5OiBKUXVlcnlTdGF0aWMpIHtcbiAgICAkID0galF1ZXJ5O1xuICAgIGN1cnJlbnRQYWdlID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xufVxuIiwgIi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLnBhbmVsLWNvbnRlbnRzIHtcbiAgICBhbGlnbi1jb250ZW50OiBzdGFydDtcbiAgICBhbGlnbi1pdGVtczogc3RhcnQ7XG4gICAgb3ZlcmZsb3cteTogYXV0bztcbiAgICBvdmVyc2Nyb2xsLWJlaGF2aW9yOiBjb250YWluO1xuICAgIHNjcm9sbGJhci13aWR0aDogdGhpbjtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsOmhhcyg+IC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0uc2hvd24pIHtcbiAgICBvdmVyZmxvdzogY2xpcDtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJKQVJWSVNcIl0gLmNvbmZpZy1zZXR0aW5nLmhhcy1zdWJzZXR0aW5ncyB7XG4gICAgZ3JpZC1yb3ctZW5kOiBhdXRvO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAuamFydmlzLXBhY2tlZC1zZXR0aW5ncyB7XG4gICAgZ3JpZC1hdXRvLWZsb3c6IHJvdyBkZW5zZTtcbiAgICBncmlkLWF1dG8tcm93czogMXB4O1xuICAgIHJvdy1nYXA6IDA7XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5qYXJ2aXMtcGFja2VkLXNldHRpbmdzIC5jb25maWctc2V0dGluZyB7XG4gICAgZ3JpZC1yb3ctZW5kOiBzcGFuIHZhcigtLWphcnZpcy1zZXR0aW5nLXJvd3MsIDEpO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmphcnZpcy12ZXJzaW9uIHtcbiAgICBmb250LXNpemU6IC42NmVtO1xuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgb3BhY2l0eTogLjg7XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5qYXJ2aXMtbWFyay1jb2xvciBpbnB1dCB7XG4gICAgd2lkdGg6IDMwcHg7XG4gICAgaGVpZ2h0OiAyMHB4O1xuICAgIGZsZXg6IG5vbmU7XG4gICAgcGFkZGluZzogMDtcbn1cbmJ1dHRvbi5qYXJ2aXMtY29udGVzdC1waW4ge1xuICAgIGFsbDogdW5zZXQ7XG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgIG1hcmdpbi1pbmxpbmUtc3RhcnQ6IC4zNWVtO1xuICAgIHBhZGRpbmctaW5saW5lOiAuMmVtO1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIGZvbnQtc2l6ZTogLjllbTtcbiAgICBsaW5lLWhlaWdodDogMTtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uamFydmlzLWNvbnRlc3QtcGluOjpiZWZvcmUge1xuICAgIGNvbnRlbnQ6ICfimIYnO1xufVxuLmphcnZpcy1jb250ZXN0LXBpblthcmlhLXByZXNzZWQ9XCJ0cnVlXCJdOjpiZWZvcmUge1xuICAgIGNvbnRlbnQ6ICfimIUnO1xuICAgIGNvbG9yOiAjZmZkMzZiO1xufVxuLmphcnZpcy1jb250ZXN0LXBpbjpmb2N1cy12aXNpYmxlIHtcbiAgICBvdXRsaW5lOiAxcHggc29saWQgY3VycmVudENvbG9yO1xufVxuc2VsZWN0LmphcnZpcy1jb250ZXN0LXJhbmstc3RhcnQge1xuICAgIGFsbDogdW5zZXQ7XG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgIG1hcmdpbi1pbmxpbmUtc3RhcnQ6IC4yNWVtO1xuICAgIHBhZGRpbmctaW5saW5lOiAuMTVlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIGZvbnQtc2l6ZTogLjcyZW07XG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgZG90dGVkO1xuICAgIHRleHQtdW5kZXJsaW5lLW9mZnNldDogMnB4O1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0IG9wdGlvbiB7XG4gICAgYmFja2dyb3VuZDogIzIzMjkzNjtcbiAgICBjb2xvcjogI2ZmZjtcbn1cbi5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0OmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG59XG4uamFydmlzLW1hcmstbWVudSB7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIHotaW5kZXg6IDEwMDAwO1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ2FwOiAycHg7XG4gICAgcGFkZGluZzogNHB4O1xuICAgIGJvcmRlcjogMXB4IHNvbGlkICM4OTk0YTc7XG4gICAgYm9yZGVyLXJhZGl1czogNnB4O1xuICAgIGJhY2tncm91bmQ6ICMyMzI5MzY7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgYm94LXNoYWRvdzogMCAycHggMTBweCAjMDAwODtcbiAgICBmb250OiAxM3B4LzEuMzUgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xufVxuLmphcnZpcy1tYXJrLW1lbnUgYnV0dG9uIHtcbiAgICBhbGw6IHVuc2V0O1xuICAgIHBhZGRpbmc6IDRweCA5cHg7XG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5qYXJ2aXMtbWFyay1tZW51IGJ1dHRvbjpob3Zlcixcbi5qYXJ2aXMtbWFyay1tZW51IGJ1dHRvbjpmb2N1cy12aXNpYmxlIHtcbiAgICBiYWNrZ3JvdW5kOiAjNDE0ZDY0O1xufVxuI2NvbnRlc3RzIC5sZWZ0X3BhcnQgLnNjcm9sbF9hcmVhLmphcnZpcy1jb250ZXN0LWluc3RhbnQsXG4jY29udGVzdHMgLnJpZ2h0X3BhcnQuamFydmlzLWNvbnRlc3QtaW5zdGFudCAubGVhZF90YWJsZV92aWV3IHtcbiAgICBzY3JvbGwtYmVoYXZpb3I6IGF1dG8gIWltcG9ydGFudDtcbiAgICBvdmVyZmxvdy1hbmNob3I6IG5vbmUgIWltcG9ydGFudDtcbn1cbiNjb250ZXN0cyAuamFydmlzLWNvbnRlc3QtbG9hZGluZyB7XG4gICAgb3BhY2l0eTogMCAhaW1wb3J0YW50O1xuICAgIHRyYW5zaXRpb246IG5vbmUgIWltcG9ydGFudDtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cbiNjb250ZXN0cyAucmlnaHRfcGFydCAucmFua2luZ1tpZF9jb250ZXN0XS5qYXJ2aXMtY29udGVzdC1vdGhlciB7XG4gICAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50O1xufVxuW2RhdGEtamFydmlzLW1hcms9XCJmcmllbmRcIl0ge1xuICAgIGNvbG9yOiB2YXIoLS1qYXJ2aXMtZnJpZW5kLWNvbG9yKSAhaW1wb3J0YW50O1xufVxuW2RhdGEtamFydmlzLW1hcms9XCJmb2VcIl0ge1xuICAgIGNvbG9yOiB2YXIoLS1qYXJ2aXMtZm9lLWNvbG9yKSAhaW1wb3J0YW50O1xufVxudGRbZGF0YS1qYXJ2aXMtbWFya10gPiBhIHtcbiAgICBjb2xvcjogaW5oZXJpdCAhaW1wb3J0YW50O1xufVxuLmphcnZpcy1tYXJrLW1vZGUgW2RhdGEtamFydmlzLXBsYXllcl0ge1xuICAgIGN1cnNvcjogY3Jvc3NoYWlyO1xufVxuLmphcnZpcy1tYXJrLW1vZGUgW2RhdGEtamFydmlzLXBsYXllcl06aG92ZXIsXG4uamFydmlzLW1hcmstbW9kZSBbZGF0YS1qYXJ2aXMtcGxheWVyXTpmb2N1cy12aXNpYmxlIHtcbiAgICBvdXRsaW5lOiAxcHggc29saWQgY3VycmVudENvbG9yO1xufVxuIiwgImltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCBjc3MgZnJvbSAnLi9zZXR0aW5ncy5jc3MnO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0U3R5bGVzKCkge1xuICAgIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZS5jbGFzc05hbWUgPSAnaGgtamFydmlzLXN0eWxlJztcbiAgICBzdHlsZS50ZXh0Q29udGVudCA9IGNzcztcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tTZXR0aW5ncygpIHtcbiAgICBpZiAoY3VycmVudFBhZ2UgIT09ICcvaG9tZS5odG1sJykgcmV0dXJuO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIkpBUlZJU1wiXSAucGFuZWwtY29udGVudHMnO1xuICAgIHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZG9XaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihzZWxlY3Rvcik7XG4gICAgICAgIGlmICghcGFuZWwpIHJldHVybjtcbiAgICAgICAgcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnaGgtc2Nyb2xsJyk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5IHx8ICEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkgfHwgIXBhbmVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY29uc3QgdW5pdCA9IGV2ZW50LmRlbHRhTW9kZSA9PT0gMSA/IDE2IDogZXZlbnQuZGVsdGFNb2RlID09PSAyID8gcGFuZWwuY2xpZW50SGVpZ2h0IDogMTtcbiAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gcGFuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0IC8gcGFuZWwub2Zmc2V0SGVpZ2h0IHx8IDE7XG4gICAgICAgICAgICBwYW5lbC5zY3JvbGxUb3AgKz0gZXZlbnQuZGVsdGFZICogdW5pdCAvIHNjYWxlO1xuICAgICAgICB9LCB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IGZhbHNlIH0pO1xuXG4gICAgICAgIGNvbnN0IGNhcmRzID0gcGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5jb25maWctc2V0dGluZycpO1xuICAgICAgICBjb25zdCBwYWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFwYW5lbC5vZmZzZXRXaWR0aCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcbiAgICAgICAgICAgICAgICBjYXJkLnN0eWxlLnNldFByb3BlcnR5KCctLWphcnZpcy1zZXR0aW5nLXJvd3MnLCBTdHJpbmcoY2FyZC5vZmZzZXRIZWlnaHQgKyAxMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFuZWwuY2xhc3NMaXN0LmFkZCgnamFydmlzLXBhY2tlZC1zZXR0aW5ncycpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBncm91cE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIocGFjayk7XG4gICAgICAgIGlmIChwYW5lbC5wYXJlbnRFbGVtZW50KSBncm91cE9ic2VydmVyLm9ic2VydmUocGFuZWwucGFyZW50RWxlbWVudCwgeyBhdHRyaWJ1dGVGaWx0ZXI6IFsnY2xhc3MnXSB9KTtcbiAgICAgICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcihwYWNrKTtcbiAgICAgICAgICAgIGNhcmRzLmZvckVhY2goY2FyZCA9PiBzaXplT2JzZXJ2ZXIub2JzZXJ2ZShjYXJkKSk7XG4gICAgICAgIH1cbiAgICAgICAgcGFjaygpO1xuICAgIH0pO1xufVxuIiwgImV4cG9ydCB0eXBlIE1vZHVsZVNldHRpbmdzID0gUmVjb3JkPHN0cmluZywgYm9vbGVhbj47XG5cbmludGVyZmFjZSBDb25maWdTY2hlbWEge1xuICAgIGJhc2VLZXk6IHN0cmluZztcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIGRlZmF1bHQ6IGJvb2xlYW47XG4gICAgc3ViU2V0dGluZ3M/OiB7IGtleTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyBkZWZhdWx0OiBib29sZWFuIH1bXTtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhITW9kdWxlIHtcbiAgICByZWFkb25seSBncm91cCA9ICdKQVJWSVMnO1xuICAgIHJlYWRvbmx5IGNvbmZpZ1NjaGVtYTogQ29uZmlnU2NoZW1hO1xuICAgIGhhc1J1biA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoeyBjb25maWdTY2hlbWEgfTogeyBuYW1lOiBzdHJpbmc7IGNvbmZpZ1NjaGVtYTogQ29uZmlnU2NoZW1hIH0pIHtcbiAgICAgICAgdGhpcy5jb25maWdTY2hlbWEgPSBjb25maWdTY2hlbWE7XG4gICAgfVxuXG4gICAgYWJzdHJhY3Qgc2hvdWxkUnVuKCk6IGJvb2xlYW47XG4gICAgYWJzdHJhY3QgcnVuKHNldHRpbmdzOiBNb2R1bGVTZXR0aW5ncyk6IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xufVxuIiwgImV4cG9ydCBjb25zdCBMU19DT05GSUdfTkFNRSA9ICdISFN0YXJrJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxzR2V0KGtleTogc3RyaW5nLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpOiB1bmtub3duIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShgJHtsc19uYW1lfSR7a2V5fWApID8/ICdudWxsJylcbn1cbmV4cG9ydCBmdW5jdGlvbiBsc1NldChrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24sIGxzX25hbWUgPSBMU19DT05GSUdfTkFNRSkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgJHtsc19uYW1lfSR7a2V5fWAsIEpTT04uc3RyaW5naWZ5KHZhbHVlKSlcbn1cbmV4cG9ydCBmdW5jdGlvbiBsc1JtKGtleTogc3RyaW5nLCBsc19uYW1lID0gTFNfQ09ORklHX05BTUUpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oYCR7bHNfbmFtZX0ke2tleX1gKVxufVxuIiwgImltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgdHlwZSB7IENvbnRlc3REYXRhIH0gZnJvbSAnLi4vLi4vZ2FtZS10eXBlcyc7XG5pbXBvcnQgeyBMU19DT05GSUdfTkFNRSwgbHNHZXQsIGxzU2V0IH0gZnJvbSAnLi4vLi4vc3RvcmFnZSc7XG5cbnR5cGUgTWFyayA9ICdmcmllbmQnIHwgJ2ZvZSc7XG50eXBlIE1hcmtNb2RlID0gTWFyayB8ICdjbGVhcicgfCAnJztcblxuZXhwb3J0IGNsYXNzIEZyaWVuZEFuZEZvZXMgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSBuYW1lcyA9IG5ldyBNYXA8SFRNTEVsZW1lbnQsIHN0cmluZz4oKTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGZvY3VzYWJsZU5hbWVzID0gbmV3IE1hcDxIVE1MRWxlbWVudCwgc3RyaW5nIHwgbnVsbD4oKTtcbiAgICBwcml2YXRlIG1vZGU6IE1hcmtNb2RlID0gJyc7XG4gICAgcHJpdmF0ZSBtYXJrTWVudTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJvb3Q6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByb290U2VsZWN0b3IgPSAnJztcbiAgICBwcml2YXRlIGluTGVhZ3VlID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdmcmllbmRBbmRGb2VzJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiAnPHNwYW4gdG9vbHRpcD1cIlJpZ2h0LWNsaWNrIGEgcGxheWVyIG5hbWUgdG8gbWFyayBpdC4gUHJlc3MgRXNjIHRvIHN0b3AgbWFya2luZy5cIj5TaG93IEZyaWVuZHMgYW5kIEZvZXM8L3NwYW4+JyxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ2xlYWd1ZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdTaG93IGluIExlYWd1ZScsXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2NvbnRlc3RzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1Nob3cgaW4gQ29udGVzdHMnLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoeyBuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWEgfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gWycvaG9tZS5odG1sJywgJy9sZWFndWVzLmh0bWwnLCAnL2FjdGl2aXRpZXMuaHRtbCddLmluY2x1ZGVzKGN1cnJlbnRQYWdlKTtcbiAgICB9XG5cbiAgICByZWFkU2V0dGluZyhrZXk6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGxzR2V0KGtleSk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkTWFya3MoKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgICAgICBjb25zdCBzdG9yZWQgPSB0aGlzLnJlYWRTZXR0aW5nKCdQbGF5ZXJNYXJrcycpO1xuICAgICAgICBpZiAoc3RvcmVkICYmIHR5cGVvZiBzdG9yZWQgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHN0b3JlZCkpIHJldHVybiBzdG9yZWQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgICAgICAgY29uc3QgbWFya3M6IFJlY29yZDxzdHJpbmcsIE1hcms+ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgbWFya10gb2YgW1snRnJpZW5kTGlzdCcsICdmcmllbmQnXSwgWydGb2VMaXN0JywgJ2ZvZSddXSBhcyBjb25zdCkge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IHRoaXMucmVhZFNldHRpbmcoa2V5KTtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgaWQgb2YgbGlzdCkge1xuICAgICAgICAgICAgICAgIGlmICgvXlsxLTldXFxkKiQvLnRlc3QoU3RyaW5nKGlkKSkpIG1hcmtzW1N0cmluZyhpZCldID0gbWFyaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFya3M7XG4gICAgfVxuXG4gICAgcmVhZENvbG9ycygpOiBSZWNvcmQ8TWFyaywgc3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IHNhdmVkID0gdGhpcy5yZWFkU2V0dGluZygnUGxheWVyTWFya0NvbG9ycycpIGFzIFBhcnRpYWw8UmVjb3JkPE1hcmssIHVua25vd24+PiB8IG51bGw7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmcmllbmQ6IHR5cGVvZiBzYXZlZD8uZnJpZW5kID09PSAnc3RyaW5nJyAmJiAvXiNbXFxkYS1mXXs2fSQvaS50ZXN0KHNhdmVkLmZyaWVuZCkgPyBzYXZlZC5mcmllbmQgOiAnIzcyY2FmZicsXG4gICAgICAgICAgICBmb2U6IHR5cGVvZiBzYXZlZD8uZm9lID09PSAnc3RyaW5nJyAmJiAvXiNbXFxkYS1mXXs2fSQvaS50ZXN0KHNhdmVkLmZvZSkgPyBzYXZlZC5mb2UgOiAnI2ZmODM4MydcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzYXZlU2V0dGluZyhrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxzU2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgYWxlcnQoJ0phcnZpcyBjb3VsZCBub3Qgc2F2ZSB5b3VyIEZyaWVuZHMgYW5kIEZvZXMgc2V0dGluZ3MuJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRDb2xvclNldHRpbmdzKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvciA9ICcuZ3JvdXAtcGFuZWxbcmVsPVwiSkFSVklTXCJdIC5jb25maWctc2V0dGluZ1tyZWw9XCJKQVJWSVNfZnJpZW5kQW5kRm9lc1wiXSAuc3ViLXNldHRpbmdzJztcbiAgICAgICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICghc2V0dGluZ3MgfHwgc2V0dGluZ3MucXVlcnlTZWxlY3RvcignLmphcnZpcy1tYXJrLWNvbG9yJykpIHJldHVybjtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBbbWFyaywgdGV4dF0gb2YgW1snZnJpZW5kJywgJ0ZyaWVuZCBuYW1lIGNvbG9yJ10sIFsnZm9lJywgJ0ZvZSBuYW1lIGNvbG9yJ11dIGFzIGNvbnN0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1jb2xvcic7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgICAgICBpbnB1dC50eXBlID0gJ2NvbG9yJztcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHRoaXMucmVhZENvbG9ycygpW21hcmtdO1xuICAgICAgICAgICAgICAgIGlucHV0LmRpc2FibGVkID0gIXNldHRpbmdzLmNsb3Nlc3QoJy5jb25maWctc2V0dGluZycpPy5jbGFzc0xpc3QuY29udGFpbnMoJ2VuYWJsZWQnKTtcbiAgICAgICAgICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9ycyA9IHRoaXMucmVhZENvbG9ycygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2F2ZVNldHRpbmcoJ1BsYXllck1hcmtDb2xvcnMnLCB7IC4uLmNvbG9ycywgW21hcmtdOiBpbnB1dC52YWx1ZSB9KSkgaW5wdXQudmFsdWUgPSBjb2xvcnNbbWFya107XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbGFiZWwuYXBwZW5kKHRpdGxlLCBpbnB1dCk7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYXBwZW5kQ2hpbGQobGFiZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjbG9zZU1hcmtNZW51KCkge1xuICAgICAgICB0aGlzLm1hcmtNZW51Py5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5tYXJrTWVudSA9IG51bGw7XG4gICAgfVxuXG4gICAgb3Blbk1hcmtNZW51KGV2ZW50OiBNb3VzZUV2ZW50LCBuYW1lOiBIVE1MRWxlbWVudCwgaWQ6IHN0cmluZykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG5cbiAgICAgICAgY29uc3QgbWVudSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBtZW51LmNsYXNzTmFtZSA9ICdqYXJ2aXMtbWFyay1tZW51JztcbiAgICAgICAgbWVudS5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnZ3JvdXAnKTtcbiAgICAgICAgbWVudS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnTWFyayBwbGF5ZXInKTtcbiAgICAgICAgY29uc3QgYWN0aW9uczogW01hcmtNb2RlLCBzdHJpbmddW10gPSBbWydmcmllbmQnLCAnTWFyayBmcmllbmQnXSwgWydmb2UnLCAnTWFyayBmb2UnXSwgWydjbGVhcicsICdDbGVhciBtYXJrJ11dO1xuICAgICAgICBpZiAodGhpcy5tb2RlKSBhY3Rpb25zLnB1c2goWycnLCAnU3RvcCBtYXJraW5nJ10pO1xuXG4gICAgICAgIGZvciAoY29uc3QgW21vZGUsIHRleHRdIG9mIGFjdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRNb2RlKG1vZGUpO1xuICAgICAgICAgICAgICAgIGlmIChtb2RlICYmIHRoaXMubmFtZXMuZ2V0KG5hbWUpID09PSBpZCkgdGhpcy5hcHBseU1hcmsoaWQpO1xuICAgICAgICAgICAgICAgIGlmIChtb2RlKSBuYW1lLmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbWVudS5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB9XG4gICAgICAgIG1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGljayA9PiBjbGljay5zdG9wUHJvcGFnYXRpb24oKSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWVudSk7XG4gICAgICAgIHRoaXMubWFya01lbnUgPSBtZW51O1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IG5hbWUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHggPSBldmVudC5jbGllbnRYIHx8IGJvdW5kcy5sZWZ0O1xuICAgICAgICBjb25zdCB5ID0gZXZlbnQuY2xpZW50WSB8fCBib3VuZHMuYm90dG9tO1xuICAgICAgICBtZW51LnN0eWxlLmxlZnQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih4LCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggLSBtZW51Lm9mZnNldFdpZHRoKSkgKyAncHgnO1xuICAgICAgICBtZW51LnN0eWxlLnRvcCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHksIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgLSBtZW51Lm9mZnNldEhlaWdodCkpICsgJ3B4JztcbiAgICAgICAgbWVudS5xdWVyeVNlbGVjdG9yKCdidXR0b24nKT8uZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIHNldE1vZGUobW9kZTogTWFya01vZGUpIHtcbiAgICAgICAgdGhpcy5tb2RlID0gbW9kZTtcbiAgICAgICAgdGhpcy5yb290Py5jbGFzc0xpc3QudG9nZ2xlKCdqYXJ2aXMtbWFyay1tb2RlJywgISFtb2RlKTtcblxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5uYW1lcy5rZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChtb2RlICYmIG5hbWUudGFiSW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c2FibGVOYW1lcy5zZXQobmFtZSwgbmFtZS5nZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JykpO1xuICAgICAgICAgICAgICAgIG5hbWUudGFiSW5kZXggPSAwO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghbW9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdG9yZUZvY3VzKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVzdG9yZUZvY3VzKG5hbWU6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHRhYmluZGV4ID0gdGhpcy5mb2N1c2FibGVOYW1lcy5nZXQobmFtZSk7XG4gICAgICAgIGlmICh0YWJpbmRleCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgIGlmICh0YWJpbmRleCA9PT0gbnVsbCkgbmFtZS5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgICAgIGVsc2UgbmFtZS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgdGFiaW5kZXgpO1xuICAgICAgICB0aGlzLmZvY3VzYWJsZU5hbWVzLmRlbGV0ZShuYW1lKTtcbiAgICB9XG5cbiAgICBnZXRDb250ZXN0TmFtZXMocm9vdDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgbmFtZXMgPSBuZXcgTWFwPEhUTUxFbGVtZW50LCBzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IGJ5Q29udGVzdCA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj4+KCk7XG4gICAgICAgIGNvbnN0IGNvbnRlc3RzID0gT2JqZWN0LnZhbHVlcyh3aW5kb3cuY29udGVzdHMgfHwge30pLmZpbHRlcigobGlzdCk6IGxpc3QgaXMgQ29udGVzdERhdGFbXSA9PiBBcnJheS5pc0FycmF5KGxpc3QpKS5mbGF0KCk7XG5cbiAgICAgICAgZm9yIChjb25zdCByb3cgb2Ygcm9vdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxUYWJsZVJvd0VsZW1lbnQ+KCcubGVhZFRhYmxlIHRyJykpIHtcbiAgICAgICAgICAgIGNvbnN0IGNlbGwgPSByb3cuY2VsbHM/LlsxXTtcbiAgICAgICAgICAgIGlmICghY2VsbCB8fCBjZWxsLmxvY2FsTmFtZSAhPT0gJ3RkJykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gY2VsbC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLm5pY2tuYW1lJykgfHwgY2VsbDtcbiAgICAgICAgICAgIGxldCBpZCA9IHJvdy5nZXRBdHRyaWJ1dGUoJ3NvcnRpbmdfaWQnKSB8fCBuYW1lLmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJykgfHxcbiAgICAgICAgICAgICAgICBuYW1lLnF1ZXJ5U2VsZWN0b3IoJ1tpZC1tZW1iZXJdJyk/LmdldEF0dHJpYnV0ZSgnaWQtbWVtYmVyJyk7XG4gICAgICAgICAgICBjb25zdCBjb250ZXN0SWQgPSByb3cuY2xvc2VzdCgnW2lkX2NvbnRlc3RdJyk/LmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKGNvbnRlc3RJZCkge1xuICAgICAgICAgICAgICAgIGxldCBieU5hbWUgPSBieUNvbnRlc3QuZ2V0KGNvbnRlc3RJZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFieU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydGljaXBhbnRzID0gY29udGVzdHMuZmluZChjb250ZXN0ID0+IFN0cmluZyhjb250ZXN0LmlkX2NvbnRlc3QpID09PSBjb250ZXN0SWQpPy5wYXJ0aWNpcGFudHM7XG4gICAgICAgICAgICAgICAgICAgIGJ5TmFtZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IG5pY2tuYW1lLCBpZF9tZW1iZXIgfSBvZiBPYmplY3QudmFsdWVzKHBhcnRpY2lwYW50cyB8fCB7fSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5pY2tuYW1lS2V5ID0gU3RyaW5nKG5pY2tuYW1lID8/ICcnKS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5pY2tuYW1lS2V5IHx8ICEvXlsxLTldXFxkKiQvLnRlc3QoU3RyaW5nKGlkX21lbWJlcikpKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBieU5hbWUuZ2V0KG5pY2tuYW1lS2V5KSB8fCBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZXMuYWRkKFN0cmluZyhpZF9tZW1iZXIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5TmFtZS5zZXQobmlja25hbWVLZXksIG1hdGNoZXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJ5Q29udGVzdC5zZXQoY29udGVzdElkLCBieU5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYnlOYW1lLmdldCgobmFtZS50ZXh0Q29udGVudCA/PyAnJykudHJpbSgpKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcyAmJiAhbWF0Y2hlcy5oYXMoaWQgPz8gJycpKSBpZCA9IG1hdGNoZXMuc2l6ZSA9PT0gMSA/IG1hdGNoZXMudmFsdWVzKCkubmV4dCgpLnZhbHVlIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZCAmJiAvXlsxLTldXFxkKiQvLnRlc3QoaWQpKSBuYW1lcy5zZXQobmFtZSwgaWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYW1lcztcbiAgICB9XG5cbiAgICByZWZyZXNoKCkge1xuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4odGhpcy5yb290U2VsZWN0b3IpO1xuICAgICAgICBpZiAodGhpcy5yb290ICYmIHRoaXMucm9vdCAhPT0gcm9vdCkgdGhpcy5yb290LmNsYXNzTGlzdC5yZW1vdmUoJ2phcnZpcy1tYXJrLW1vZGUnKTtcbiAgICAgICAgdGhpcy5yb290ID0gcm9vdDtcbiAgICAgICAgY29uc3QgbmFtZXMgPSAhcm9vdCA/IG5ldyBNYXA8SFRNTEVsZW1lbnQsIHN0cmluZz4oKSA6IHRoaXMuaW5MZWFndWVcbiAgICAgICAgICAgID8gbmV3IE1hcChBcnJheS5mcm9tKHJvb3QucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5uaWNrbmFtZVtpZC1tZW1iZXJdJyksIG5hbWUgPT4gW25hbWUsIG5hbWUuZ2V0QXR0cmlidXRlKCdpZC1tZW1iZXInKV0gYXMgY29uc3QpXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyByZWFkb25seSBbSFRNTEVsZW1lbnQsIHN0cmluZ10gPT4gISFlbnRyeVsxXSAmJiAvXlsxLTldXFxkKiQvLnRlc3QoZW50cnlbMV0pKSlcbiAgICAgICAgICAgIDogdGhpcy5nZXRDb250ZXN0TmFtZXMocm9vdCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMubmFtZXMua2V5cygpKSB7XG4gICAgICAgICAgICBpZiAobmFtZXMuaGFzKG5hbWUpKSBjb250aW51ZTtcbiAgICAgICAgICAgIGRlbGV0ZSBuYW1lLmRhdGFzZXQuamFydmlzUGxheWVyO1xuICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrO1xuICAgICAgICAgICAgdGhpcy5yZXN0b3JlRm9jdXMobmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5hbWVzID0gbmFtZXM7XG4gICAgICAgIGlmICghcm9vdCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBtYXJrcyA9IHRoaXMucmVhZE1hcmtzKCk7XG4gICAgICAgIGNvbnN0IGNvbG9ycyA9IHRoaXMucmVhZENvbG9ycygpO1xuICAgICAgICBmb3IgKGNvbnN0IFttYXJrLCBjb2xvcl0gb2YgT2JqZWN0LmVudHJpZXMoY29sb3JzKSkge1xuICAgICAgICAgICAgY29uc3QgcHJvcGVydHkgPSAnLS1qYXJ2aXMtJyArIG1hcmsgKyAnLWNvbG9yJztcbiAgICAgICAgICAgIGlmIChyb290LnN0eWxlLmdldFByb3BlcnR5VmFsdWUocHJvcGVydHkpICE9PSBjb2xvcikgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgY29sb3IpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIGlkXSBvZiBuYW1lcykge1xuICAgICAgICAgICAgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNQbGF5ZXIgIT09IGlkKSBuYW1lLmRhdGFzZXQuamFydmlzUGxheWVyID0gaWQ7XG4gICAgICAgICAgICBjb25zdCBtYXJrID0gbWFya3NbaWRdO1xuICAgICAgICAgICAgaWYgKG1hcmsgPT09ICdmcmllbmQnIHx8IG1hcmsgPT09ICdmb2UnKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrICE9PSBtYXJrKSBuYW1lLmRhdGFzZXQuamFydmlzTWFyayA9IG1hcms7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG5hbWUuZGF0YXNldC5qYXJ2aXNNYXJrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0TW9kZSh0aGlzLm1vZGUpO1xuICAgIH1cblxuICAgIGFwcGx5TWFyayhpZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IG1hcmtzID0gdGhpcy5yZWFkTWFya3MoKTtcbiAgICAgICAgaWYgKHRoaXMubW9kZSA9PT0gJ2NsZWFyJykgZGVsZXRlIG1hcmtzW2lkXTtcbiAgICAgICAgZWxzZSBtYXJrc1tpZF0gPSB0aGlzLm1vZGU7XG5cbiAgICAgICAgdGhpcy5zYXZlU2V0dGluZygnUGxheWVyTWFya3MnLCBtYXJrcyk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIG1hcmtQbGF5ZXIoZXZlbnQ6IE1vdXNlRXZlbnQgfCBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGV2ZW50IGluc3RhbmNlb2YgS2V5Ym9hcmRFdmVudCA/IGV2ZW50LmtleSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGtleSA9PT0gJ0VzY2FwZScgJiYgKHRoaXMubW9kZSB8fCB0aGlzLm1hcmtNZW51KSkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5jbG9zZU1hcmtNZW51KCk7XG4gICAgICAgICAgICB0aGlzLnNldE1vZGUoJycpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlICYmIHRoaXMubWFya01lbnU/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdjbGljaycpIHRoaXMuY2xvc2VNYXJrTWVudSgpO1xuXG4gICAgICAgIGNvbnN0IG5hbWUgPSBldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ID8gZXZlbnQudGFyZ2V0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCdbZGF0YS1qYXJ2aXMtcGxheWVyXScpIDogbnVsbDtcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGlkID0gdGhpcy5uYW1lcy5nZXQobmFtZSk7XG4gICAgICAgIGlmICghaWQpIHJldHVybjtcbiAgICAgICAgaWYgKGV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCAmJiAoZXZlbnQudHlwZSA9PT0gJ2NvbnRleHRtZW51JyB8fCAoZXZlbnQudHlwZSA9PT0gJ2NsaWNrJyAmJiBldmVudC5hbHRLZXkpKSkge1xuICAgICAgICAgICAgdGhpcy5vcGVuTWFya01lbnUoZXZlbnQsIG5hbWUsIGlkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMubW9kZSB8fCAoZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nICYmIGtleSAhPT0gJ0VudGVyJyAmJiBrZXkgIT09ICcgJykpIHJldHVybjtcblxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5hcHBseU1hcmsoaWQpO1xuICAgIH1cblxuICAgIHJ1bih7IGxlYWd1ZSwgY29udGVzdHMgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHRoaXMuaW5MZWFndWUgPSBjdXJyZW50UGFnZSA9PT0gJy9sZWFndWVzLmh0bWwnO1xuICAgICAgICBpZiAoY3VycmVudFBhZ2UgPT09ICcvaG9tZS5odG1sJykge1xuICAgICAgICAgICAgdGhpcy5hZGRDb2xvclNldHRpbmdzKCk7XG4gICAgICAgICAgICB0aGlzLmhhc1J1biA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5MZWFndWUgPyAhbGVhZ3VlIDogIWNvbnRlc3RzKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5yb290U2VsZWN0b3IgPSB0aGlzLmluTGVhZ3VlID8gJy5sZWFndWVfdGFibGUnIDogJyNjb250ZXN0cyAucmlnaHRfcGFydCc7XG4gICAgICAgIGNvbnN0IG1hcmtQbGF5ZXIgPSAoZXZlbnQ6IE1vdXNlRXZlbnQgfCBLZXlib2FyZEV2ZW50KSA9PiB0aGlzLm1hcmtQbGF5ZXIoZXZlbnQpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG1hcmtQbGF5ZXIsIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbWFya1BsYXllciwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgbWFya1BsYXllciwgdHJ1ZSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKCFldmVudC5rZXkgfHwgWydQbGF5ZXJNYXJrcycsICdQbGF5ZXJNYXJrQ29sb3JzJywgJ0ZyaWVuZExpc3QnLCAnRm9lTGlzdCddXG4gICAgICAgICAgICAgICAgLnNvbWUoa2V5ID0+IGV2ZW50LmtleSA9PT0gTFNfQ09ORklHX05BTUUgKyBrZXkpKSB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihtdXRhdGlvbnMgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5yb290U2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHJvb3QgIT09IHRoaXMucm9vdCB8fCAocm9vdCAmJiBtdXRhdGlvbnMuc29tZSgoeyB0YXJnZXQgfSkgPT4gcm9vdC5jb250YWlucyh0YXJnZXQpKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZSxcbiAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ3NvcnRpbmdfaWQnLCAnaWQtbWVtYmVyJywgJ2lkX2NvbnRlc3QnXVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgJCwgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGxzR2V0LCBsc1NldCwgbHNSbSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UnO1xuXG5pbnRlcmZhY2UgQ29udGVzdENhcmQge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY2FyZDogSFRNTEVsZW1lbnQ7XG4gICAgaGVhZGVyOiBIVE1MRWxlbWVudDtcbiAgICB0aXRsZTogSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGxhYmVsOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcm1Db250ZXN0U3RhcnR1cEd1YXJkKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZSAhPT0gJy9hY3Rpdml0aWVzLmh0bWwnIHx8IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKS5nZXQoJ3RhYicpICE9PSAnY29udGVzdHMnKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwaW4gPSBsc0dldCgnQ29udGVzdFN0YXJ0SWQnKTtcbiAgICAgICAgaWYgKCh0eXBlb2YgcGluICE9PSAnc3RyaW5nJyAmJiB0eXBlb2YgcGluICE9PSAnbnVtYmVyJykgfHwgIXBpbiB8fFxuICAgICAgICAgICAgSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnSEhQbHVzUGx1c0NvbmZpZycpID8/ICdudWxsJyk/LkpBUlZJU19jb250ZXN0U3RhcnQgPT09IGZhbHNlKSByZXR1cm47XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBLZWVwIGJvdGggcGFuZXMgb3V0IG9mIHZpZXcgdW50aWwgdGhlIHBpbm5lZCBjb250ZXN0IGFuZCBpdHMgbGVhZGVyYm9hcmQgYXJlIHBvc2l0aW9uZWQuXG4gICAgY29uc3QgZ3VhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIGd1YXJkLmlkID0gJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnO1xuICAgIGd1YXJkLnRleHRDb250ZW50ID0gYFxuICAgICAgICAjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEsXG4gICAgICAgICNjb250ZXN0cyAucmlnaHRfcGFydCB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICAgICAgfVxuICAgIGA7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgIGlmICghZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSByZXR1cm47XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChndWFyZCk7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9KTtcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ3VhcmQpO1xuICAgIGVsc2Ugb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwgeyBjaGlsZExpc3Q6IHRydWUgfSk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICBndWFyZC5yZW1vdmUoKTtcbiAgICB9LCA0MDAwKTtcbn1cblxuZXhwb3J0IGNsYXNzIENvbnRlc3RTdGFydCBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHByZWZlcmVuY2UgPSAnJztcbiAgICBwcml2YXRlIHN0YXJ0SWQgPSAnJztcbiAgICBwcml2YXRlIHJhbmtTdGFydDogJ3RvcCcgfCAnbWluZScgPSAndG9wJztcbiAgICBwcml2YXRlIGxpc3Q6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByaWdodDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJlc3RvcmluZ0NhcmQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByZXBvc2l0aW9uOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHN0b3BKdW1wOiAoKGZpbmlzaD86IGJvb2xlYW4pID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdjb250ZXN0U3RhcnQnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGEgcHJlZmVycmVkIGNvbnRlc3Qgd2l0aG91dCB0aGUgc2Nyb2xsIGFuaW1hdGlvbidcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7IG5hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYSB9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZSA9PT0gJy9hY3Rpdml0aWVzLmh0bWwnO1xuICAgIH1cblxuICAgIGdldENvbnRlc3RzKGxpc3Q6IEhUTUxFbGVtZW50LCBmaW5pc2hlZDogUmVhZG9ubHlTZXQ8c3RyaW5nPik6IENvbnRlc3RDYXJkW10ge1xuICAgICAgICBjb25zdCBhY3RpdmUgPSBuZXcgTWFwKE9iamVjdC52YWx1ZXMod2luZG93LmNvbnRlc3RzPy5hY3RpdmUgfHwge30pXG4gICAgICAgICAgICAuZmlsdGVyKGNvbnRlc3QgPT4gY29udGVzdD8uaWRfY29udGVzdCAhPSBudWxsKVxuICAgICAgICAgICAgLm1hcChjb250ZXN0ID0+IFtTdHJpbmcoY29udGVzdC5pZF9jb250ZXN0KSwgY29udGVzdF0pKTtcblxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShsaXN0LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcuY29udGVzdFtpZF9jb250ZXN0XScpKS5mbGF0TWFwKGNhcmQgPT4ge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBjYXJkLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuICAgICAgICAgICAgaWYgKCFpZCkgcmV0dXJuIFtdO1xuICAgICAgICAgICAgY29uc3QgY29udGVzdCA9IGFjdGl2ZS5nZXQoaWQpO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVyID0gY2FyZC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmNvbnRlc3RfaGVhZGVyJyk7XG4gICAgICAgICAgICBpZiAoIWhlYWRlciB8fCBmaW5pc2hlZC5oYXMoaWQpKSByZXR1cm4gW107XG4gICAgICAgICAgICBpZiAoIWNvbnRlc3QgJiYgIWhlYWRlci5tYXRjaGVzKCcuaW5fcHJvZ3Jlc3MnKSkgcmV0dXJuIFtdO1xuXG4gICAgICAgICAgICBjb25zdCB0aXRsZSA9IGhlYWRlci5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLmNvbnRlc3RfdGl0bGUsIC5jb250ZXN0X25hbWUsIGgzLCBoNCwgaDUnKTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSB0aXRsZSAmJiBBcnJheS5mcm9tKHRpdGxlLmNoaWxkTm9kZXMpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihub2RlID0+ICEobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHx8ICFub2RlLm1hdGNoZXMoJy5qYXJ2aXMtY29udGVzdC1waW4sIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JykpXG4gICAgICAgICAgICAgICAgLm1hcChub2RlID0+IG5vZGUudGV4dENvbnRlbnQpLmpvaW4oJycpLnRyaW0oKTtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIGlkLCBjYXJkLCBoZWFkZXIsIHRpdGxlLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBTdHJpbmcobmFtZSB8fCBjb250ZXN0Py5uYW1lIHx8IGNvbnRlc3Q/LnRpdGxlIHx8XG4gICAgICAgICAgICAgICAgICAgIChjb250ZXN0Py5jYXRlZ29yeV90eXBlID09PSAnZGFpbHknID8gJ0RhaWx5IGNvbnRlc3QnIDogJ0NvbnRlc3QnKSkudHJpbSgpXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2xlYXJFeHBpcmVkUGluKGxpc3Q6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdENhcmRbXSwgZmluaXNoZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz4pIHtcbiAgICAgICAgaWYgKCF0aGlzLnByZWZlcmVuY2UgfHwgY29udGVzdHMuc29tZSgoeyBpZCB9KSA9PiBpZCA9PT0gdGhpcy5wcmVmZXJlbmNlKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IHdpbmRvdy5jb250ZXN0cz8uYWN0aXZlO1xuICAgICAgICBjb25zdCBtaXNzaW5nID0gZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyAmJiBsaXN0LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZXN0X2hlYWRlcicpICYmXG4gICAgICAgICAgICBhY3RpdmUgJiYgIU9iamVjdC52YWx1ZXMoYWN0aXZlKS5zb21lKGNvbnRlc3QgPT4gU3RyaW5nKGNvbnRlc3Q/LmlkX2NvbnRlc3QpID09PSB0aGlzLnByZWZlcmVuY2UpO1xuICAgICAgICBpZiAoIWZpbmlzaGVkLmhhcyh0aGlzLnByZWZlcmVuY2UpICYmICFtaXNzaW5nKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZXhwaXJlZElkID0gdGhpcy5wcmVmZXJlbmNlO1xuICAgICAgICB0aGlzLnByZWZlcmVuY2UgPSAnJztcbiAgICAgICAgdGhpcy5zdGFydElkID0gJyc7XG4gICAgICAgIHRoaXMuc3RvcEp1bXA/LigpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKFN0cmluZyhsc0dldCgnQ29udGVzdFN0YXJ0SWQnKSkgPT09IGV4cGlyZWRJZCkgbHNSbSgnQ29udGVzdFN0YXJ0SWQnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0phcnZpcyBjb3VsZCBub3QgY2xlYXIgdGhlIGV4cGlyZWQgY29udGVzdCBwcmVmZXJlbmNlOicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGVQaW5zKGxpc3Q6IEhUTUxFbGVtZW50LCBjb250ZXN0czogQ29udGVzdENhcmRbXSkge1xuICAgICAgICBjb25zdCBob3N0cyA9IG5ldyBTZXQoY29udGVzdHMubWFwKCh7IHRpdGxlLCBoZWFkZXIgfSkgPT4gdGl0bGUgfHwgaGVhZGVyKSk7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbCBvZiBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qYXJ2aXMtY29udGVzdC1waW4sIC5qYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JykpIHtcbiAgICAgICAgICAgIGlmICghY29udHJvbC5wYXJlbnRFbGVtZW50IHx8ICFob3N0cy5oYXMoY29udHJvbC5wYXJlbnRFbGVtZW50KSkgY29udHJvbC5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgeyBpZCwgdGl0bGUsIGhlYWRlciwgbGFiZWwgfSBvZiBjb250ZXN0cykge1xuICAgICAgICAgICAgY29uc3QgaG9zdCA9IHRpdGxlIHx8IGhlYWRlcjtcbiAgICAgICAgICAgIGxldCBwaW4gPSBob3N0LnF1ZXJ5U2VsZWN0b3I8SFRNTEJ1dHRvbkVsZW1lbnQ+KCc6c2NvcGUgPiAuamFydmlzLWNvbnRlc3QtcGluJyk7XG4gICAgICAgICAgICBpZiAoIXBpbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdqYXJ2aXMtY29udGVzdC1waW4nO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlc3RJZCA9IGJ1dHRvbi5jbG9zZXN0KCcuY29udGVzdFtpZF9jb250ZXN0XScpPy5nZXRBdHRyaWJ1dGUoJ2lkX2NvbnRlc3QnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb250ZXN0SWQpIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5wcmVmZXJlbmNlID09PSBjb250ZXN0SWQgPyAnJyA6IGNvbnRlc3RJZDtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0KSBsc1NldCgnQ29udGVzdFN0YXJ0SWQnLCBuZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgbHNSbSgnQ29udGVzdFN0YXJ0SWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJlZmVyZW5jZSA9IG5leHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0SWQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcEp1bXA/LigpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBzYXZlIHRoZSBjb250ZXN0IHByZWZlcmVuY2U6JywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBwaW4gPSBob3N0LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwaW5uZWQgPSB0aGlzLnByZWZlcmVuY2UgPT09IGlkO1xuICAgICAgICAgICAgcGluLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgU3RyaW5nKHBpbm5lZCkpO1xuICAgICAgICAgICAgcGluLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHBpbm5lZCA/IGBVbnBpbiAke2xhYmVsfWAgOiBgUGluICR7bGFiZWx9IHRvIG9wZW4gb24gcmVsb2FkYCk7XG4gICAgICAgICAgICBwaW4udGl0bGUgPSBwaW5uZWQgPyAnUGlubmVkLiBDbGljayB0byByZXN0b3JlIHRoZSBnYW1lIGRlZmF1bHQuJyA6ICdPcGVuIHRoaXMgY29udGVzdCB3aGVuIHRoZSBwYWdlIHJlbG9hZHMnO1xuXG4gICAgICAgICAgICBsZXQgcG9zaXRpb24gPSBob3N0LnF1ZXJ5U2VsZWN0b3I8SFRNTFNlbGVjdEVsZW1lbnQ+KCc6c2NvcGUgPiAuamFydmlzLWNvbnRlc3QtcmFuay1zdGFydCcpO1xuICAgICAgICAgICAgaWYgKCFwaW5uZWQpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbj8ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VsZWN0Jyk7XG4gICAgICAgICAgICAgICAgc2VsZWN0LmNsYXNzTmFtZSA9ICdqYXJ2aXMtY29udGVzdC1yYW5rLXN0YXJ0JztcbiAgICAgICAgICAgICAgICBzZWxlY3Quc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ0xlYWRlcmJvYXJkIHBvc2l0aW9uIG9uIHJlbG9hZCcpO1xuICAgICAgICAgICAgICAgIHNlbGVjdC50aXRsZSA9ICdXaGVyZSB0byBvcGVuIHRoZSBwaW5uZWQgY29udGVzdCBsZWFkZXJib2FyZCc7XG4gICAgICAgICAgICAgICAgc2VsZWN0LmFkZChuZXcgT3B0aW9uKCdUb3AnLCAndG9wJykpO1xuICAgICAgICAgICAgICAgIHNlbGVjdC5hZGQobmV3IE9wdGlvbignTXkgcmFuaycsICdtaW5lJykpO1xuICAgICAgICAgICAgICAgIHNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICAgICAgICAgICAgICBzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2ZW50ID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICAgICAgICAgICAgICBzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHNlbGVjdC52YWx1ZSA9PT0gJ21pbmUnID8gJ21pbmUnIDogJ3RvcCc7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsc1NldCgnQ29udGVzdFJhbmtTdGFydCcsIG5leHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yYW5rU3RhcnQgPSBuZXh0O1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdC52YWx1ZSA9IHRoaXMucmFua1N0YXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdKYXJ2aXMgY291bGQgbm90IHNhdmUgdGhlIGxlYWRlcmJvYXJkIHBvc2l0aW9uOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBwaW4uYWZ0ZXIoc2VsZWN0KTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IHNlbGVjdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvc2l0aW9uLnZhbHVlID0gdGhpcy5yYW5rU3RhcnQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTZWxlY3RlZENvbnRlc3RJZChsaXN0OiBIVE1MRWxlbWVudCwgcmlnaHQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkID0gbGlzdC5xdWVyeVNlbGVjdG9yKCcuY29udGVzdF9oZWFkZXJfYWN0aXZlJyk/LmNsb3Nlc3QoJy5jb250ZXN0W2lkX2NvbnRlc3RdJyk7XG4gICAgICAgIGlmIChzZWxlY3RlZCkgcmV0dXJuIHNlbGVjdGVkLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpO1xuXG4gICAgICAgIGNvbnN0IHBhbmVscyA9IEFycmF5LmZyb20ocmlnaHQucXVlcnlTZWxlY3RvckFsbCgnLnJhbmtpbmdbaWRfY29udGVzdF0nKSlcbiAgICAgICAgICAgIC5maWx0ZXIocGFuZWwgPT4gcGFuZWwuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggJiYgZ2V0Q29tcHV0ZWRTdHlsZShwYW5lbCkudmlzaWJpbGl0eSA9PT0gJ3Zpc2libGUnKTtcbiAgICAgICAgcmV0dXJuIHBhbmVscy5sZW5ndGggPT09IDEgPyBwYW5lbHNbMF0uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0JykgOiBudWxsO1xuICAgIH1cblxuICAgIHNob3dMZWFkZXJib2FyZChyaWdodDogSFRNTEVsZW1lbnQsIGNvbnRlc3RJZDogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgICBpZiAoIWNvbnRlc3RJZCkge1xuICAgICAgICAgICAgcmlnaHQucXVlcnlTZWxlY3RvckFsbCgnLmphcnZpcy1jb250ZXN0LW90aGVyJykuZm9yRWFjaChwYW5lbCA9PiBwYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1vdGhlcicpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBhbmVsIG9mIHJpZ2h0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yYW5raW5nW2lkX2NvbnRlc3RdJykpIHtcbiAgICAgICAgICAgIHBhbmVsLmNsYXNzTGlzdC50b2dnbGUoJ2phcnZpcy1jb250ZXN0LW90aGVyJywgcGFuZWwuZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0JykgIT09IGNvbnRlc3RJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRPd25Sb3coYm9hcmQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IG93biA9IGJvYXJkLnF1ZXJ5U2VsZWN0b3IoJy5sZWFkVGFibGUgdHIubGVhZF90YWJsZV9kZWZhdWx0Jyk7XG4gICAgICAgIGlmIChvd24pIHJldHVybiBvd247XG5cbiAgICAgICAgY29uc3QgaGVyb0lkID0gKHdpbmRvdy5zaGFyZWQ/Lkhlcm8gfHwgd2luZG93Lkhlcm8pPy5pbmZvcz8uaWQ7XG4gICAgICAgIGlmIChoZXJvSWQgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oYm9hcmQucXVlcnlTZWxlY3RvckFsbCgnLmxlYWRUYWJsZSB0cltzb3J0aW5nX2lkXScpKVxuICAgICAgICAgICAgLmZpbmQocm93ID0+IHJvdy5nZXRBdHRyaWJ1dGUoJ3NvcnRpbmdfaWQnKSA9PT0gU3RyaW5nKGhlcm9JZCkpO1xuICAgIH1cblxuICAgIGxvY2tTY3JvbGwoc2Nyb2xsZXI6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgICQoc2Nyb2xsZXIpLnN0b3AodHJ1ZSwgZmFsc2UpO1xuICAgICAgICAvLyBUaGUgZ2FtZSBjYW4gc3RhcnQgYW5vdGhlciBqUXVlcnkgdHdlZW4gYWZ0ZXIgbG9hZC4gQmxvY2sgaXRzIHdyaXRlcyBvbiB0aGlzIHBhbmUgb25seS5cbiAgICAgICAgY29uc3QgaWdub3JlU2Nyb2xsID0gKCkgPT4ge307XG4gICAgICAgIGNvbnN0IGdldCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsICdzY3JvbGxUb3AnKT8uZ2V0O1xuICAgICAgICBjb25zdCBkZXNjcmlwdG9ycyA9IE9iamVjdC5lbnRyaWVzKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogeyBnZXQsIHNldDogaWdub3JlU2Nyb2xsIH0sXG4gICAgICAgICAgICBzY3JvbGw6IHsgdmFsdWU6IGlnbm9yZVNjcm9sbCwgd3JpdGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHNjcm9sbFRvOiB7IHZhbHVlOiBpZ25vcmVTY3JvbGwsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICBzY3JvbGxCeTogeyB2YWx1ZTogaWdub3JlU2Nyb2xsLCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICAgIH0pLmZpbHRlcigoW2tleV0pID0+ICFPYmplY3QuaGFzT3duKHNjcm9sbGVyLCBrZXkpKTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCBkZXNjcmlwdG9yXSBvZiBkZXNjcmlwdG9ycykge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNjcm9sbGVyLCBrZXksIHsgLi4uZGVzY3JpcHRvciwgY29uZmlndXJhYmxlOiB0cnVlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICQoc2Nyb2xsZXIpLnN0b3AodHJ1ZSwgZmFsc2UpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCBkZXNjcmlwdG9yXSBvZiBkZXNjcmlwdG9ycykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNjcm9sbGVyLCBrZXkpO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICYmIGN1cnJlbnQudmFsdWUgPT09IGRlc2NyaXB0b3IudmFsdWUgJiYgY3VycmVudC5zZXQgPT09IGRlc2NyaXB0b3Iuc2V0KSBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHNjcm9sbGVyLCBrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGp1bXBUbyhzY3JvbGxlcjogSFRNTEVsZW1lbnQsIHRhcmdldDogRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQsIGNlbnRlciA9IGZhbHNlKSB7XG4gICAgICAgIGxldCB0b3AgPSAwO1xuICAgICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgICAgICBjb25zdCBib3VuZHMgPSBzY3JvbGxlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gYm91bmRzLmhlaWdodCAvIHNjcm9sbGVyLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgIGlmICghc2NhbGUpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIHRvcCA9IHNjcm9sbGVyLnNjcm9sbFRvcCArIChpdGVtLnRvcCAtIGJvdW5kcy50b3ApIC8gc2NhbGUgLSBzY3JvbGxlci5jbGllbnRUb3A7XG4gICAgICAgICAgICBpZiAoY2VudGVyKSB0b3AgLT0gKHNjcm9sbGVyLmNsaWVudEhlaWdodCAtIGl0ZW0uaGVpZ2h0IC8gc2NhbGUpIC8gMjtcbiAgICAgICAgfVxuICAgICAgICB0b3AgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihzY3JvbGxlci5zY3JvbGxIZWlnaHQgLSBzY3JvbGxlci5jbGllbnRIZWlnaHQsIHRvcCkpO1xuICAgICAgICBpZiAoTWF0aC5hYnModG9wIC0gc2Nyb2xsZXIuc2Nyb2xsVG9wKSA+PSAxKSB7XG4gICAgICAgICAgICBjb25zdCBzY3JvbGxUbyA9IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbFRvIGFzIChvcHRpb25zOiBTY3JvbGxUb09wdGlvbnMpID0+IHZvaWQ7XG4gICAgICAgICAgICBzY3JvbGxUby5jYWxsKHNjcm9sbGVyLCB7IHRvcCwgYmVoYXZpb3I6ICdpbnN0YW50JyB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9wZW5Db250ZXN0KGxpc3Q6IEhUTUxFbGVtZW50LCByaWdodDogSFRNTEVsZW1lbnQsIHsgaWQsIGNhcmQsIGhlYWRlciwgdGl0bGUgfTogQ29udGVzdENhcmQpIHtcbiAgICAgICAgZm9yIChjb25zdCBwYW5lIG9mIFtsaXN0LCByaWdodF0pIHBhbmUuY2xhc3NMaXN0LmFkZCgnamFydmlzLWNvbnRlc3QtaW5zdGFudCcsICdqYXJ2aXMtY29udGVzdC1sb2FkaW5nJyk7XG4gICAgICAgIGNvbnN0IHBsYWNlQXRPd25SYW5rID0gdGhpcy5yYW5rU3RhcnQgPT09ICdtaW5lJztcbiAgICAgICAgY29uc3QgcmVsZWFzZUxpc3QgPSB0aGlzLmxvY2tTY3JvbGwobGlzdCk7XG4gICAgICAgIGxldCBib2FyZDogSFRNTEVsZW1lbnQgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgICAgICBsZXQgcmVsZWFzZUJvYXJkOiAoKCkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCBwb3NpdGlvbmVkID0gZmFsc2U7XG4gICAgICAgIGxldCBsYXN0QXR0ZW1wdDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuICAgICAgICBjb25zdCBnZXRCb2FyZCA9ICgpID0+IEFycmF5LmZyb20ocmlnaHQucXVlcnlTZWxlY3RvckFsbCgnLnJhbmtpbmdbaWRfY29udGVzdF0nKSlcbiAgICAgICAgICAgIC5maW5kKHBhbmVsID0+IHBhbmVsLmdldEF0dHJpYnV0ZSgnaWRfY29udGVzdCcpID09PSBpZCk/LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcubGVhZF90YWJsZV92aWV3Jyk7XG4gICAgICAgIGNvbnN0IHVwZGF0ZUJvYXJkID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV4dCA9IGdldEJvYXJkKCk7XG4gICAgICAgICAgICBpZiAoYm9hcmQgPT09IG5leHQpIHJldHVybjtcbiAgICAgICAgICAgIHJlbGVhc2VCb2FyZD8uKCk7XG4gICAgICAgICAgICBib2FyZCA9IG5leHQ7XG4gICAgICAgICAgICByZWxlYXNlQm9hcmQgPSBib2FyZCA/IHRoaXMubG9ja1Njcm9sbChib2FyZCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJldmVhbCA9ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSBwYW5lLmNsYXNzTGlzdC5yZW1vdmUoJ2phcnZpcy1jb250ZXN0LWxvYWRpbmcnKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqYXJ2aXMtY29udGVzdC1zdGFydHVwJyk/LnJlbW92ZSgpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXN0b3JlID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFsaXN0LmlzQ29ubmVjdGVkIHx8ICFyaWdodC5pc0Nvbm5lY3RlZCB8fCAhbGlzdC5jb250YWlucyhjYXJkKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICB1cGRhdGVCb2FyZCgpO1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KTtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZCAhPT0gaWQgJiYgc2VsZWN0ZWQgIT09IGxhc3RBdHRlbXB0KSB7XG4gICAgICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSBzZWxlY3RlZDtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgKHRpdGxlIHx8IGhlYWRlcikuY2xpY2soKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVCb2FyZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFib2FyZD8uY2xpZW50SGVpZ2h0IHx8IHRoaXMuZ2V0U2VsZWN0ZWRDb250ZXN0SWQobGlzdCwgcmlnaHQpICE9PSBpZCB8fFxuICAgICAgICAgICAgICAgIChwbGFjZUF0T3duUmFuayAmJiAhYm9hcmQucXVlcnlTZWxlY3RvcignLmxlYWRUYWJsZScpKSkgcmV0dXJuO1xuICAgICAgICAgICAgbGFzdEF0dGVtcHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLnNob3dMZWFkZXJib2FyZChyaWdodCwgaWQpO1xuICAgICAgICAgICAgdGhpcy5qdW1wVG8obGlzdCwgY2FyZCk7XG4gICAgICAgICAgICB0aGlzLmp1bXBUbyhib2FyZCwgcGxhY2VBdE93blJhbmsgPyB0aGlzLmdldE93blJvdyhib2FyZCkgOiBudWxsLCBwbGFjZUF0T3duUmFuayk7XG4gICAgICAgICAgICBpZiAoIXBvc2l0aW9uZWQpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgIHJldmVhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvcnJlY3QgYnJvd3Nlci1kcml2ZW4gbW92ZXMsIHN1Y2ggYXMgc2Nyb2xsSW50b1ZpZXcgb24gYSBsZWFkZXJib2FyZCByb3csIGJlZm9yZSBwYWludC5cbiAgICAgICAgY29uc3Qgb25TY3JvbGwgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSBsaXN0IHx8IGV2ZW50LnRhcmdldCA9PT0gYm9hcmQpIHJlc3RvcmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaW5wdXRFdmVudHMgPSBbJ3BvaW50ZXJkb3duJywgJ3RvdWNoc3RhcnQnLCAnd2hlZWwnLCAnY2xpY2snXTtcbiAgICAgICAgY29uc3Qgb25JbnB1dCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5pc1RydXN0ZWQpIHN0b3AoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3RvcE9uS2V5ID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkICYmIFsnVGFiJywgJ0Fycm93VXAnLCAnQXJyb3dEb3duJywgJ1BhZ2VVcCcsICdQYWdlRG93bicsICdIb21lJywgJ0VuZCcsICdFbnRlcicsICcgJ10uaW5jbHVkZXMoZXZlbnQua2V5KSkgc3RvcCgpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBhZnRlckxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICBsYXN0QXR0ZW1wdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJlc3RvcmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3RvcCA9IChmaW5pc2ggPSB0cnVlKSA9PiB7XG4gICAgICAgICAgICByZWxlYXNlTGlzdCgpO1xuICAgICAgICAgICAgcmVsZWFzZUJvYXJkPy4oKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBbbGlzdCwgcmlnaHRdKSB7XG4gICAgICAgICAgICAgICAgcGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBvblNjcm9sbCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcGFuZS5jbGFzc0xpc3QucmVtb3ZlKCdqYXJ2aXMtY29udGVzdC1pbnN0YW50JywgJ2phcnZpcy1jb250ZXN0LWxvYWRpbmcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgaW5wdXRFdmVudHMpIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uSW5wdXQsIHRydWUpO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHN0b3BPbktleSwgdHJ1ZSk7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFmdGVyTG9hZCk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgdGhpcy5zdG9wSnVtcCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnJlcG9zaXRpb24gPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZXN0b3JpbmdDYXJkID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChmaW5pc2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0SWQgPSAnJztcbiAgICAgICAgICAgICAgICByZXZlYWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KHN0b3AsIDQwMDApO1xuICAgICAgICB0aGlzLnN0b3BKdW1wID0gc3RvcDtcbiAgICAgICAgdGhpcy5yZXBvc2l0aW9uID0gcmVzdG9yZTtcbiAgICAgICAgdGhpcy5yZXN0b3JpbmdDYXJkID0gY2FyZDtcbiAgICAgICAgZm9yIChjb25zdCBwYW5lIG9mIFtsaXN0LCByaWdodF0pIHtcbiAgICAgICAgICAgIHBhbmUuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25TY3JvbGwsIHsgcGFzc2l2ZTogdHJ1ZSwgY2FwdHVyZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIGlucHV0RXZlbnRzKSBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBvbklucHV0LCB7IHBhc3NpdmU6IHRydWUsIGNhcHR1cmU6IHRydWUgfSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBzdG9wT25LZXksIHRydWUpO1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBhZnRlckxvYWQsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgcmVzdG9yZSgpO1xuICAgIH1cblxuICAgIHJlZnJlc2goKSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignI2NvbnRlc3RzIC5sZWZ0X3BhcnQgLnNjcm9sbF9hcmVhJyk7XG4gICAgICAgIGNvbnN0IHJpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJyNjb250ZXN0cyAucmlnaHRfcGFydCcpO1xuICAgICAgICBpZiAodGhpcy5zdG9wSnVtcCAmJiAodGhpcy5saXN0ICE9PSBsaXN0IHx8IHRoaXMucmlnaHQgIT09IHJpZ2h0IHx8ICFsaXN0Py5jb250YWlucyh0aGlzLnJlc3RvcmluZ0NhcmQpKSkge1xuICAgICAgICAgICAgdGhpcy5zdG9wSnVtcChmYWxzZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5yaWdodCkgdGhpcy5zaG93TGVhZGVyYm9hcmQodGhpcy5yaWdodCwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5saXN0ID0gbGlzdDtcbiAgICAgICAgdGhpcy5yaWdodCA9IHJpZ2h0O1xuICAgICAgICBpZiAoIWxpc3QgfHwgIXJpZ2h0IHx8ICFsaXN0LmdldENsaWVudFJlY3RzKCkubGVuZ3RoIHx8IGdldENvbXB1dGVkU3R5bGUobGlzdCkudmlzaWJpbGl0eSAhPT0gJ3Zpc2libGUnKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZmluaXNoZWQgPSBuZXcgU2V0KE9iamVjdC52YWx1ZXMod2luZG93LmNvbnRlc3RzPy5maW5pc2hlZCB8fCB7fSlcbiAgICAgICAgICAgIC5maWx0ZXIoY29udGVzdCA9PiBjb250ZXN0Py5pZF9jb250ZXN0ICE9IG51bGwpLm1hcChjb250ZXN0ID0+IFN0cmluZyhjb250ZXN0LmlkX2NvbnRlc3QpKSk7XG4gICAgICAgIGZvciAoY29uc3QgZW5kZWQgb2YgbGlzdC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVzdC5lbmRlZCwgLmNvbnRlc3RfaGVhZGVyLmVuZGVkJykpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZW5kZWQuY2xvc2VzdCgnLmNvbnRlc3RbaWRfY29udGVzdF0nKT8uZ2V0QXR0cmlidXRlKCdpZF9jb250ZXN0Jyk7XG4gICAgICAgICAgICBpZiAoaWQpIGZpbmlzaGVkLmFkZChpZCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29udGVzdHMgPSB0aGlzLmdldENvbnRlc3RzKGxpc3QsIGZpbmlzaGVkKTtcbiAgICAgICAgdGhpcy5jbGVhckV4cGlyZWRQaW4obGlzdCwgY29udGVzdHMsIGZpbmlzaGVkKTtcbiAgICAgICAgdGhpcy51cGRhdGVQaW5zKGxpc3QsIGNvbnRlc3RzKTtcblxuICAgICAgICBpZiAoIXRoaXMucHJlZmVyZW5jZSkge1xuICAgICAgICAgICAgdGhpcy5zaG93TGVhZGVyYm9hcmQocmlnaHQsIG51bGwpO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmVwb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy5yZXBvc2l0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gY29udGVzdHMuZmluZChjb250ZXN0ID0+IGNvbnRlc3QuaWQgPT09IHRoaXMuc3RhcnRJZCk7XG4gICAgICAgIGlmICh0YXJnZXQpIHRoaXMub3BlbkNvbnRlc3QobGlzdCwgcmlnaHQsIHRhcmdldCk7XG4gICAgICAgIGVsc2UgaWYgKCF0aGlzLnN0YXJ0SWQpIHRoaXMuc2hvd0xlYWRlcmJvYXJkKHJpZ2h0LCB0aGlzLmdldFNlbGVjdGVkQ29udGVzdElkKGxpc3QsIHJpZ2h0KSk7XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBpbiA9IGxzR2V0KCdDb250ZXN0U3RhcnRJZCcpO1xuICAgICAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gKCh0eXBlb2YgcGluID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgcGluID09PSAnbnVtYmVyJykgJiYgcGluKSA/IFN0cmluZyhwaW4pIDogJyc7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgdGhpcy5wcmVmZXJlbmNlID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdGFydElkID0gdGhpcy5wcmVmZXJlbmNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5yYW5rU3RhcnQgPSBsc0dldCgnQ29udGVzdFJhbmtTdGFydCcpID09PSAnbWluZScgPyAnbWluZScgOiAndG9wJztcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICB0aGlzLnJhbmtTdGFydCA9ICd0b3AnO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobXV0YXRpb25zID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY29udGVzdHMgLmxlZnRfcGFydCAuc2Nyb2xsX2FyZWEnKTtcbiAgICAgICAgICAgIGNvbnN0IHJpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlc3RzIC5yaWdodF9wYXJ0Jyk7XG4gICAgICAgICAgICBpZiAobGlzdCAhPT0gdGhpcy5saXN0IHx8IHJpZ2h0ICE9PSB0aGlzLnJpZ2h0IHx8IG11dGF0aW9ucy5zb21lKCh7IHRhcmdldCB9KSA9PlxuICAgICAgICAgICAgICAgIChsaXN0ICYmIChsaXN0LmNvbnRhaW5zKHRhcmdldCkgfHwgdGFyZ2V0LmNvbnRhaW5zKGxpc3QpKSkgfHxcbiAgICAgICAgICAgICAgICAocmlnaHQgJiYgKHJpZ2h0LmNvbnRhaW5zKHRhcmdldCkgfHwgdGFyZ2V0LmNvbnRhaW5zKHJpZ2h0KSkpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcycsICdzdHlsZScsICdoaWRkZW4nLCAnaWRfY29udGVzdCddIH0pO1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB0aGlzLnJlZnJlc2goKSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmlzVHJ1c3RlZCAmJiBldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ICYmIHRoaXMucHJlZmVyZW5jZSAmJiB0aGlzLnJpZ2h0ICYmIHRoaXMubGlzdD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSAmJlxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5jbG9zZXN0KCcuY29udGVzdF9oZWFkZXInKSkgdGhpcy5zaG93TGVhZGVyYm9hcmQodGhpcy5yaWdodCwgbnVsbCk7XG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuZXhwb3J0IGNsYXNzIExlYWd1ZVRvcDIwIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xlYWd1ZVRvcDIwJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiBgU2hvdyB0aGUgVG9wIDIwIHByb21vdGlvbiB0YXJnZXQgaW4gbG93ZXIgbGVhZ3Vlc2BcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWVzLmh0bWwnKTtcbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcuc2NyaXB0TGVhZ3VlSW5mbycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2NyaXB0TGVhZ3VlSW5mbycpO1xuICAgICAgICAgICAgaWYgKCFzdW1tYXJ5IHx8IHN1bW1hcnkucXVlcnlTZWxlY3RvcignLmphcnZpc1RvcDIwJykpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgeyBvcHBvbmVudHNfbGlzdCwgY3VycmVudF90aWVyX251bWJlciwgbWF4X2xlYWd1ZSB9ID0gd2luZG93O1xuICAgICAgICAgICAgY29uc3QgdGllciA9IE51bWJlcihjdXJyZW50X3RpZXJfbnVtYmVyKTtcbiAgICAgICAgICAgIGlmICghKHRpZXIgPiAwICYmIHRpZXIgPCBOdW1iZXIobWF4X2xlYWd1ZSkpKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBoZXJvSWQgPSAod2luZG93LnNoYXJlZD8uSGVybyB8fCB3aW5kb3cuSGVybyk/LmluZm9zPy5pZDtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShvcHBvbmVudHNfbGlzdCkgfHwgaGVyb0lkID09IG51bGwpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgcGxheWVyID0gb3Bwb25lbnRzX2xpc3QuZmluZCgoeyBwbGF5ZXIgfSkgPT4gU3RyaW5nKHBsYXllcj8uaWRfZmlnaHRlcikgPT09IFN0cmluZyhoZXJvSWQpKTtcbiAgICAgICAgICAgIGNvbnN0IHJhbmsgPSBOdW1iZXIocGxheWVyPy5wbGFjZSk7XG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc0ludGVnZXIocmFuaykgfHwgcmFuayA8IDEpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgaW5Ub3AyMCA9IHJhbmsgPD0gMjA7XG4gICAgICAgICAgICBjb25zdCBjdXRvZmYgPSBvcHBvbmVudHNfbGlzdC5maW5kKCh7IHBsYWNlIH0pID0+IE51bWJlcihwbGFjZSkgPT09IChpblRvcDIwID8gMjEgOiAyMCkpO1xuICAgICAgICAgICAgaWYgKHBsYXllcj8ucGxheWVyX2xlYWd1ZV9wb2ludHMgPT0gbnVsbCB8fCBjdXRvZmY/LnBsYXllcl9sZWFndWVfcG9pbnRzID09IG51bGwpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3Qgc2NvcmUgPSBOdW1iZXIocGxheWVyLnBsYXllcl9sZWFndWVfcG9pbnRzKTtcbiAgICAgICAgICAgIGNvbnN0IGN1dG9mZlNjb3JlID0gTnVtYmVyKGN1dG9mZi5wbGF5ZXJfbGVhZ3VlX3BvaW50cyk7XG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShzY29yZSkgfHwgIU51bWJlci5pc0Zpbml0ZShjdXRvZmZTY29yZSkpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgZm9ybWF0ID0gbmV3IEludGwuTnVtYmVyRm9ybWF0KCk7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBpblRvcDIwID8gY3V0b2ZmU2NvcmUgOiBjdXRvZmZTY29yZSArIDE7XG4gICAgICAgICAgICBjb25zdCBkaWZmZXJlbmNlID0gaW5Ub3AyMCA/IHNjb3JlIC0gdGFyZ2V0IDogdGFyZ2V0IC0gc2NvcmU7XG4gICAgICAgICAgICBjb25zdCB0b29sdGlwID0gaW5Ub3AyMFxuICAgICAgICAgICAgICAgID8gYFRvcCAyMCBwcm9tb3Rpb24gdGFyZ2V0OiAke2Zvcm1hdC5mb3JtYXQodGFyZ2V0KX0gcG9pbnRzIGF0IHJhbmsgMjEuIFlvdXIgbGVhZDogJHtmb3JtYXQuZm9ybWF0KGRpZmZlcmVuY2UpfSBwb2ludHMuYFxuICAgICAgICAgICAgICAgIDogYFRvcCAyMCBwcm9tb3Rpb24gdGFyZ2V0OiAke2Zvcm1hdC5mb3JtYXQodGFyZ2V0KX0gcG9pbnRzIHRvIHBhc3MgcmFuayAyMC5gO1xuXG4gICAgICAgICAgICBjb25zdCBlbnRyeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIGVudHJ5LmNsYXNzTmFtZSA9ICdtaW5Ub3AyMCBqYXJ2aXNUb3AyMCc7XG4gICAgICAgICAgICBlbnRyeS5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgdG9vbHRpcCk7XG4gICAgICAgICAgICBlbnRyeS5zZXRBdHRyaWJ1dGUoJ3Rvb2x0aXAnLCAnJyk7XG4gICAgICAgICAgICBlbnRyeS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCB0b29sdGlwKTtcblxuICAgICAgICAgICAgY29uc3QgYmFkZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICBiYWRnZS5jbGFzc05hbWUgPSAnc2NyaXB0TGVhZ3VlSW5mb0ljb24nO1xuICAgICAgICAgICAgYmFkZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyMzNzY5YmEnO1xuICAgICAgICAgICAgYmFkZ2Uuc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgICAgICAgICBiYWRnZS50ZXh0Q29udGVudCA9ICcyMCc7XG4gICAgICAgICAgICBlbnRyeS5hcHBlbmQoYmFkZ2UsIGAke2RpZmZlcmVuY2UgPT09IDAgPyAnJyA6IGluVG9wMjAgPyAnLScgOiAnKyd9JHtmb3JtYXQuZm9ybWF0KE1hdGguYWJzKGRpZmZlcmVuY2UpKX1gKTtcbiAgICAgICAgICAgIHN1bW1hcnkuaW5zZXJ0QmVmb3JlKGVudHJ5LCBzdW1tYXJ5LnF1ZXJ5U2VsZWN0b3IoJy5taW5Ub3AzMCwgLnByb21vdGlvbkluZm8nKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuXG5leHBvcnQgY2xhc3MgUmVtb3ZlUGFzc0xvY2sgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBzZWxlY3RvclRvRmluZCA9ICcubG9ja195ZWxsb3dfaWNuJztcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNsYXNzVG9SZW1vdmUgPSAnbG9ja195ZWxsb3dfaWNuJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ3JlbW92ZVBhc3NMb2NrJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogYFJlbW92ZSB0aGUgbG9jayBpY29uIGluIFBvVi9Qb0cgUGFzcy9QYXNzKyBmb3IgZWFzaWVyIHJlYWRpbmdgLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAncG92JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogYFJlbW92ZSBpbiBQb1ZgLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdwb2cnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBgUmVtb3ZlIGluIFBvR2AsXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYXRoLW9mLXZhbG9yLmh0bWwnKSB8fCBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtZ2xvcnkuaHRtbCcpXG4gICAgfVxuXG4gICAgb2JzZXJ2ZVVudGlsKHNlbGVjdG9yOiBzdHJpbmcsIGNhbGxiYWNrOiAoZWxlbWVudHM6IE5vZGVMaXN0T2Y8RWxlbWVudD4pID0+IHZvaWQsIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH0gPSB7fSkge1xuICAgICAgICBsZXQgdGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgICAgICBsZXQgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FsbGJhY2soZWxlbWVudHMpO1xuICAgICAgICAgICAgaWYgKG9uY2UpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAob25jZSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lcikgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZWxlbWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuXG4gICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodGltZW91dCkgJiYgdGltZW91dCA+IDApIHtcbiAgICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3Rvcjogc3RyaW5nLCBjbGFzc1RvUmVtb3ZlOiBzdHJpbmcsIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH0gPSB7fSkge1xuICAgICAgICB0aGlzLm9ic2VydmVVbnRpbChzZWxlY3RvciwgKGVsZW1lbnRzKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGVsID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NUb1JlbW92ZSkpO1xuICAgICAgICB9LCB7IHRpbWVvdXQsIG9uY2UgfSk7XG4gICAgfVxuXG4gICAgcnVuKHsgcG92LCBwb2cgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhdGgtb2YtdmFsb3IuaHRtbCcpICYmIHBvdikge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZSh0aGlzLnNlbGVjdG9yVG9GaW5kLCB0aGlzLmNsYXNzVG9SZW1vdmUpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGF0aC1vZi1nbG9yeS5odG1sJykgJiYgcG9nKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKHRoaXMuc2VsZWN0b3JUb0ZpbmQsIHRoaXMuY2xhc3NUb1JlbW92ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEdpcmxEaWN0aW9uYXJ5KCkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmdldEdpcmxEaWN0aW9uYXJ5KCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignSmFydmlzIGNvdWxkIG5vdCBsb2FkIHRoZSBISCsrIGdpcmwgZGljdGlvbmFyeTonLCBlcnIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGdldEdpcmxEaWN0aW9uYXJ5IH0gZnJvbSAnLi9nYW1lRGF0YSc7XG5cbmV4cG9ydCBjbGFzcyBMb3ZlUmFpZHNBZGRvbiBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJhcml0eUNvbG9yczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xvdmVSYWlkc0FkZG9uJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogYFZpc3VhbCBlbmhhbmNlbWVudHMgZm9yIExvdmUgUmFpZHMgcGFnZWAsXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdyYWlkX2lkJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogYFNob3cgcmFpZCBJRCBiZWZvcmUgcmFpZCBuYW1lYCxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ25hbWVzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogYFNob3cgbmFtZXMgb24gbXlzdGVyaW91cyBnaXJsc2AsXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ3NraW4nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBgU2hvdyDwn5GZIGljb24gaWYgYSBnaXJsIGhhcyBhIHNraW4gKHdvcmtzIG9uIGhpZGRlbiBvbmVzKWAsXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2NvbG9yJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogYFNldCB0aGUgY29sb3IgYmFzZWQgb24gcmFyaXR5YCxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnZmlnaHRfaWNvbicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IGBTaG93IGJldHRlciBmaWdodCBpY29uYCxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnc2hhZG93cycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IGBSZXBsYWNlIHNoYWRvdyBwb3Nlc2AsXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG5cbiAgICAgICAgdGhpcy5yYXJpdHlDb2xvcnMgPSB7XG4gICAgICAgICAgICByYXJlOiAnTGltZUdyZWVuJyxcbiAgICAgICAgICAgIGVwaWM6ICdHb2xkJyxcbiAgICAgICAgICAgIGxlZ2VuZGFyeTogJ01lZGl1bU9yY2hpZCdcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xvdmUtcmFpZHMuaHRtbCcpXG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKHsgcmFpZF9pZCwgc2tpbiwgbmFtZXMsIGNvbG9yLCBmaWdodF9pY29uLCBzaGFkb3dzIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBjb25zdCByYWlkcyA9ICh0eXBlb2YgbG92ZV9yYWlkcyAhPT0gJ3VuZGVmaW5lZCcgJiYgQXJyYXkuaXNBcnJheShsb3ZlX3JhaWRzKSkgPyBsb3ZlX3JhaWRzIDogW107XG4gICAgICAgIGlmICghcmFpZHMubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuXG4gICAgICAgIGNvbnN0IGdpcmxEaWN0ID0gYXdhaXQgZ2V0R2lybERpY3Rpb25hcnkoKTtcbiAgICAgICAgY29uc3QgcmFpZHNCeUlkID0gbmV3IE1hcChyYWlkcy5tYXAocmFpZCA9PiBbU3RyaW5nKHJhaWQuaWRfcmFpZCksIHJhaWRdKSk7XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnJhaWQtY2FyZFtpZF9yYWlkXScpLmZvckVhY2gocmFpZENhcmQgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmFpZCA9IHJhaWRzQnlJZC5nZXQocmFpZENhcmQuZ2V0QXR0cmlidXRlKCdpZF9yYWlkJykgPz8gJycpO1xuICAgICAgICAgICAgaWYgKCFyYWlkIHx8IHJhaWQuaWRfZ2lybCA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHsgbmFtZSwgcmFyaXR5LCBzaGFyZHMgPSAwIH0gPSBnaXJsRGljdD8uZ2V0KFN0cmluZyhyYWlkLmlkX2dpcmwpKSB8fCB7fTtcbiAgICAgICAgICAgIGNvbnN0IGhhcmVtTGluayA9IHdpbmRvdy5ISFBsdXNQbHVzLkhlbHBlcnMuZ2V0SHJlZihgL2NoYXJhY3RlcnMvJHtyYWlkLmlkX2dpcmx9YCk7XG4gICAgICAgICAgICBjb25zdCByYWlkTmFtZUVsZW0gPSByYWlkQ2FyZC5xdWVyeVNlbGVjdG9yKCcucmFpZC1uYW1lID4gc3BhbiA+IHNwYW4nKTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVfbGFiZWwgPSAobmFtZXMgJiYgbmFtZSkgfHwgcmFpZE5hbWVFbGVtPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IHJhaWQuZXZlbnRfbmFtZSB8fCByYWlkLmdpcmxfZGF0YT8ubmFtZSB8fCAnJztcbiAgICAgICAgICAgIGNvbnN0IHJhaWRfaWRfbGFiZWwgPSByYWlkX2lkID8gYCgke3JhaWQuaWRfcmFpZH0pYCA6ICcnO1xuICAgICAgICAgICAgY29uc3Qgc2tpbl9sYWJlbCA9IChza2luICYmIEFycmF5LmlzQXJyYXkocmFpZD8uZ2lybF9kYXRhPy5ncmFkZV9za2lucykgJiYgcmFpZC5naXJsX2RhdGEuZ3JhZGVfc2tpbnMubGVuZ3RoID4gMCkgPyAn8J+RmScgOiAnJztcblxuICAgICAgICAgICAgY29uc3QgZGlzcGxheVBhcnRzID0gW107XG4gICAgICAgICAgICBpZiAocmFpZF9pZCkgZGlzcGxheVBhcnRzLnB1c2gocmFpZF9pZF9sYWJlbCk7XG4gICAgICAgICAgICBkaXNwbGF5UGFydHMucHVzaChuYW1lX2xhYmVsKTtcbiAgICAgICAgICAgIGlmIChza2luKSBkaXNwbGF5UGFydHMucHVzaChza2luX2xhYmVsKTtcbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlMYWJlbCA9IGRpc3BsYXlQYXJ0cy5qb2luKCcgJykudHJpbSgpO1xuXG4gICAgICAgICAgICBpZiAocmFpZE5hbWVFbGVtICYmIGRpc3BsYXlMYWJlbCkge1xuICAgICAgICAgICAgICAgIHJhaWROYW1lRWxlbS50ZXh0Q29udGVudCA9IGRpc3BsYXlMYWJlbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgb2JqZWN0aXZlcyA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jbGFzc2ljLWdpcmwnKTtcbiAgICAgICAgICAgIGNvbnN0IGdpcmwgPSBvYmplY3RpdmVzWzBdO1xuICAgICAgICAgICAgaWYgKGdpcmwpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBnaXJsTmFtZUVsZW0gPSBnaXJsLnF1ZXJ5U2VsZWN0b3IoJy5naXJsLW5hbWUnKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2lybE5hbWVFbGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5rID0gZ2lybE5hbWVFbGVtLnF1ZXJ5U2VsZWN0b3IoJ2EnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsaW5rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluay5jbGFzc05hbWUgPSAnaGgtZ2lybC1saW5rJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChnaXJsTmFtZUVsZW0uZmlyc3RDaGlsZCkgbGluay5hcHBlbmRDaGlsZChnaXJsTmFtZUVsZW0uZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnaXJsTmFtZUVsZW0uYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3BsYXlMYWJlbCkgbGluay50ZXh0Q29udGVudCA9IGRpc3BsYXlMYWJlbDtcbiAgICAgICAgICAgICAgICAgICAgbGluay5ocmVmID0gaGFyZW1MaW5rO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzaGFyZHMgPT09IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvYmpFbGVtID0gZ2lybC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLm9iamVjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob2JqRWxlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqRWxlbS5pbm5lclRleHQgPSBgSSdtIGFscmVhZHkgYXR0cmFjdGVkIHRvIHlvdS4gRmluZCBtZSBpbiB5b3VyIEhhcmVtIWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjb2xvciAmJiByYXJpdHkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByYWlkTmFtZUNvbnRhaW5lciA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCcucmFpZC1uYW1lJyk7XG4gICAgICAgICAgICAgICAgaWYgKHJhaWROYW1lQ29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhaWROYW1lQ29udGFpbmVyLnN0eWxlLmNvbG9yID0gdGhpcy5yYXJpdHlDb2xvcnNbcmFyaXR5XSB8fCAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaWdodF9pY29uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlnaHRJY29uID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5odWRCYXR0bGVQdHNfbWl4X2ljbicpO1xuICAgICAgICAgICAgICAgIGlmIChmaWdodEljb24pIHtcbiAgICAgICAgICAgICAgICAgICAgZmlnaHRJY29uLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9ICd1cmwoL2ltYWdlcy9waWN0dXJlcy9kZXNpZ24vaWNfZW5lcmd5X2ZpZ2h0LnBuZyknO1xuICAgICAgICAgICAgICAgICAgICBmaWdodEljb24uc3R5bGUuYmFja2dyb3VuZFNpemUgPSAnMjRweCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2hhZG93cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRJbWFnZSA9IHJhaWRDYXJkLnF1ZXJ5U2VsZWN0b3I8SFRNTEltYWdlRWxlbWVudD4oJy5naXJsLWltZy5sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGxlZnRJbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICBsZWZ0SW1hZ2Uuc3JjID0gbGVmdEltYWdlLnNyYy5yZXBsYWNlKCctYmxhY2snLCAnJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyYWlkQ2FyZC5jbGFzc0xpc3QuY29udGFpbnMoJ211bHRpcGxlLWdpcmwnKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodEltYWdlID0gcmFpZENhcmQucXVlcnlTZWxlY3RvcjxIVE1MSW1hZ2VFbGVtZW50PignLmdpcmwtaW1nLnJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyaWdodEltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByaWdodEltYWdlLnNyYyA9IHJpZ2h0SW1hZ2Uuc3JjLnJlcGxhY2UoJ2F2YjAucG5nJywgJ2dyYWRlX3NraW5zL2dyYWRlX3NraW4xLnBuZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHRJbWFnZS5zcmMgPSByaWdodEltYWdlLnNyYy5yZXBsYWNlKCctYmxhY2snLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmFpZENhcmQucXVlcnlTZWxlY3RvckFsbCgnLmV5ZScpLmZvckVhY2goZSA9PiBlLnJlbW92ZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB0eXBlIHsgR2lybERhdGEsIExvdmVSYWlkIH0gZnJvbSAnLi4vLi4vZ2FtZS10eXBlcyc7XG5pbXBvcnQgeyBsc0dldCwgbHNTZXQsIGxzUm0gfSBmcm9tICcuLi8uLi9zdG9yYWdlJztcbmltcG9ydCB7IGdldEdpcmxEaWN0aW9uYXJ5IH0gZnJvbSAnLi9nYW1lRGF0YSc7XG5cbnR5cGUgUmFpZENvcHlCdXR0b24gPSBIVE1MRGl2RWxlbWVudCAmIHsgX2JvdW5kQ29weUtleUhhbmRsZXI/OiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHZvaWQgfTtcblxuZXhwb3J0IGNsYXNzIExvdmVSYWlkc1BhcnNlciBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBwcml2YXRlIGdpcmxEaWN0OiBSZWFkb25seU1hcDxzdHJpbmcsIEdpcmxEYXRhPiB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgX2JvdW5kSW5zZXJ0QnV0dG9uPzogKCkgPT4gdm9pZDtcblxuICAgIC8qXG4gICAgKiBSYWlkIElELCBBbm5vdW5jZW1lbnQgVHlwZSwgQmFja2dyb3VuZCBJRCwgRXZlbnQgTmFtZSwgU3RhcnQgRGF0ZXRpbWUsXG4gICAgKiBFbmQgRGF0ZXRpbWUsIER1cmF0aW9uLCBSYWlkIFN0YXR1cywgU291cmNlLCBHaXJsIElELFxuICAgICogR2lybCBOYW1lLCBSYXJpdHksIE1heCBHcmFkZSwgRmlyc3QgQXBwZWFyYW5jZSwgU291cmNlIElELFxuICAgICogSGFzIFNraW4ocylcbiAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2xvdmVSYWlkc1BhcnNlcidcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IGBBZGQgYSBwYXJzZXIgaW4gTG92ZSBSYWlkcyBwYWdlIGZvciBHU2hlZXQgbWFuYWdlbWVudGBcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sb3ZlLXJhaWRzLmh0bWwnKVxuICAgIH1cblxuICAgIGNhcGl0YWxpemVGaXJzdChzdHI6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyID8gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpIDogc3RyO1xuICAgIH1cblxuICAgIGdldEFubm91bmNlbWVudFR5cGUodHlwZTogTG92ZVJhaWRbJ2lkX2Fubm91bmNlbWVudF90eXBlJ10pIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiBcIkZ1bGxcIjtcbiAgICAgICAgICAgIGNhc2UgMjogcmV0dXJuIFwiUGFydGlhbFwiO1xuICAgICAgICAgICAgY2FzZSAzOiByZXR1cm4gXCJOb25lXCI7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gXCJVbmtub3duXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTb3VyY2VJRChldmVudDogTG92ZVJhaWQpIHtcbiAgICAgICAgY29uc3Qgc291cmNlX2lkID0gTnVtYmVyKGV2ZW50LnJhaWRfbW9kdWxlX3BrKTtcbiAgICAgICAgc3dpdGNoIChldmVudC5yYWlkX21vZHVsZV90eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzZWFzb24nOiByZXR1cm4gMDtcbiAgICAgICAgICAgIGNhc2UgJ2NoYW1waW9uJzogcmV0dXJuIE51bWJlci5pc0Zpbml0ZShzb3VyY2VfaWQpID8gc291cmNlX2lkIDogLTI7XG4gICAgICAgICAgICBjYXNlICd0cm9sbCc6IHJldHVybiBOdW1iZXIuaXNGaW5pdGUoc291cmNlX2lkKSA/IHNvdXJjZV9pZCArIDEwIDogLTI7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnaXJsSGFzU2tpbnMoZXZlbnQ6IExvdmVSYWlkKSB7XG4gICAgICAgIGNvbnN0IGhhc1NraW5zID0gQXJyYXkuaXNBcnJheShldmVudD8uZ2lybF9kYXRhPy5ncmFkZV9za2lucykgJiYgZXZlbnQuZ2lybF9kYXRhLmdyYWRlX3NraW5zLmxlbmd0aCA+IDA7XG4gICAgICAgIGlmIChoYXNTa2lucykge1xuICAgICAgICAgICAgcmV0dXJuIFwiWFwiO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIFwiT1wiO1xuICAgIH1cblxuICAgIGZvcm1hdEV2ZW50Um93KGV2ZW50OiBMb3ZlUmFpZCkge1xuICAgICAgICBjb25zdCBkdXJhdGlvbkhvdXJzID0gTWF0aC5mbG9vcihOdW1iZXIoZXZlbnQuZXZlbnRfZHVyYXRpb25fc2Vjb25kcykgLyAzNjAwKTtcbiAgICAgICAgY29uc3QgZHVyYXRpb24gPSBgJHtkdXJhdGlvbkhvdXJzfSBob3Vyc2A7XG5cbiAgICAgICAgY29uc3QgZ2lybCA9IHRoaXMuZ2lybERpY3Q/LmdldChTdHJpbmcoZXZlbnQuaWRfZ2lybCkpIHx8IHt9O1xuICAgICAgICBjb25zdCB7IG5hbWUgPSAnVW5rbm93bicsIHJhcml0eSA9ICdOL0EnLCBncmFkZSA9IDAgfSA9IGdpcmw7XG5cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGV2ZW50LmlkX3JhaWQsXG4gICAgICAgICAgICB0aGlzLmdldEFubm91bmNlbWVudFR5cGUoZXZlbnQuaWRfYW5ub3VuY2VtZW50X3R5cGUpLFxuICAgICAgICAgICAgZXZlbnQuYmFja2dyb3VuZF9pZCxcbiAgICAgICAgICAgIGV2ZW50LmV2ZW50X25hbWUsXG4gICAgICAgICAgICBldmVudC5zdGFydF9kYXRldGltZSxcbiAgICAgICAgICAgIGV2ZW50LmVuZF9kYXRldGltZSxcbiAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgZXZlbnQuc3RhdHVzLFxuICAgICAgICAgICAgZXZlbnQucmFpZF9tb2R1bGVfdHlwZSxcbiAgICAgICAgICAgIGV2ZW50LmlkX2dpcmwsXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgdGhpcy5jYXBpdGFsaXplRmlyc3QocmFyaXR5KSxcbiAgICAgICAgICAgIGdyYWRlLFxuICAgICAgICAgICAgXCJcIiwgLy8gb25lIGJsYW5rIHRhYiByZXNlcnZlZCBmb3IgZmlyc3QgYXBwZWFyYW5jZSBpbiBHU2hlZXRzXG4gICAgICAgICAgICB0aGlzLmdldFNvdXJjZUlEKGV2ZW50KSxcbiAgICAgICAgICAgIHRoaXMuZ2lybEhhc1NraW5zKGV2ZW50KVxuICAgICAgICBdLmpvaW4oXCJcXHRcIik7XG4gICAgfVxuXG4gICAgYXN5bmMgY29weVRvQ2xpcGJvYXJkKHRleHQ6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NsaXBib2FyZCBBUEkgZmFpbGVkLCB1c2luZyBleGVjQ29tbWFuZCBmYWxsYmFjazonLCBlcnIpO1xuICAgICAgICAgICAgY29uc3QgdGV4dGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xuICAgICAgICAgICAgdGV4dGFyZWEudmFsdWUgPSB0ZXh0O1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG4gICAgICAgICAgICB0ZXh0YXJlYS5zZWxlY3QoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRleHRhcmVhLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgaGFuZGxlQ29weUNsaWNrKGV2dDogTW91c2VFdmVudCkge1xuICAgICAgICBjb25zdCBzdG9yYWdlS2V5ID0gJ0xhc3RTYXZlZFJhaWRJRCc7XG5cbiAgICAgICAgLy8gU2hpZnQgKyBDdHJsICsgQ2xpY2sg4oaSIGNsZWFyIHN0b3JlZCBJRFxuICAgICAgICBpZiAoZXZ0LnNoaWZ0S2V5ICYmIGV2dC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBjb25zdCBjb25maXJtQ2xlYXIgPSBjb25maXJtKCfimqDvuI8gRG8geW91IHdhbnQgdG8gY2xlYXIgdGhlIHNhdmVkIGxhc3QgcmFpZCBJRCBmb3IgdGhpcyBzaXRlPycpO1xuICAgICAgICAgICAgaWYgKGNvbmZpcm1DbGVhcikge1xuICAgICAgICAgICAgICAgIGxzUm0oc3RvcmFnZUtleSk7XG4gICAgICAgICAgICAgICAgYWxlcnQoJ+KchSBMYXN0IHNhdmVkIElEIGNsZWFyZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb2FkIHJhaWRzXG4gICAgICAgIGNvbnN0IGxvY2FsTG92ZVJhaWRzID0gKHR5cGVvZiBsb3ZlX3JhaWRzICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KGxvdmVfcmFpZHMpKSA/IGxvdmVfcmFpZHMgOiBbXTtcbiAgICAgICAgaWYgKCFsb2NhbExvdmVSYWlkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfimqDvuI8gTm8gbG92ZV9yYWlkcyBmb3VuZCBvbiB0aGlzIHBhZ2UuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZ2lybERpY3QpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfimqDvuI8gVGhlIEhIKysgZ2lybCBkaWN0aW9uYXJ5IGNvdWxkIG5vdCBiZSBsb2FkZWQuIFJlbG9hZCB0aGUgcGFnZSBhbmQgdHJ5IGFnYWluLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxhc3RTYXZlZElkTnVtYmVyID0gcGFyc2VJbnQoU3RyaW5nKGxzR2V0KHN0b3JhZ2VLZXkpKSwgMTApO1xuXG4gICAgICAgIC8vIElmIFNoaWZ0IGlzIGhlbGQgT1Igbm8gc2F2ZWQgSUQgZXhpc3RzIOKGkiBhc2sgYWdhaW5cbiAgICAgICAgaWYgKGlzTmFOKGxhc3RTYXZlZElkTnVtYmVyKSB8fCBldnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RTYXZlZElkID0gcHJvbXB0KCdQbGVhc2UgZW50ZXIgdGhlIGxhc3Qgc2F2ZWQgSUQ6Jyk7XG4gICAgICAgICAgICBsYXN0U2F2ZWRJZE51bWJlciA9IHBhcnNlSW50KFN0cmluZyhsYXN0U2F2ZWRJZCksIDEwKTtcblxuICAgICAgICAgICAgaWYgKGlzTmFOKGxhc3RTYXZlZElkTnVtYmVyKSkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCfinYwgSW52YWxpZCBJRCBlbnRlcmVkLiBQbGVhc2UgZW50ZXIgYSB2YWxpZCBudW1iZXIuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlsdGVyIG5ldyBldmVudHNcbiAgICAgICAgY29uc3QgZmlsdGVyZWREYXRhID0gbG9jYWxMb3ZlUmFpZHMuZmlsdGVyKGV2ZW50ID0+IE51bWJlcihldmVudC5pZF9yYWlkKSA+IGxhc3RTYXZlZElkTnVtYmVyKTtcbiAgICAgICAgaWYgKCFmaWx0ZXJlZERhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbGVydChg4oS577iPIE5vIG5ldyBldmVudHMgZm91bmQgd2l0aCBJRCBncmVhdGVyIHRoYW4gJHtsYXN0U2F2ZWRJZE51bWJlcn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZERhdGEgPSBmaWx0ZXJlZERhdGEubWFwKHRoaXMuZm9ybWF0RXZlbnRSb3cuYmluZCh0aGlzKSkuam9pbihcIlxcblwiKTtcblxuICAgICAgICBpZiAoIWF3YWl0IHRoaXMuY29weVRvQ2xpcGJvYXJkKGZvcm1hdHRlZERhdGEpKSB7XG4gICAgICAgICAgICBhbGVydCgn4p2MIENvdWxkIG5vdCBjb3B5IHRoZSByYWlkcy4gVGhlIGxhc3Qgc2F2ZWQgSUQgd2FzIGtlcHQuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTYXZlIGhpZ2hlc3QgSURcbiAgICAgICAgY29uc3QgbWF4SWQgPSBNYXRoLm1heCguLi5maWx0ZXJlZERhdGEubWFwKGUgPT4gTnVtYmVyKGUuaWRfcmFpZCkpKTtcbiAgICAgICAgbHNTZXQoc3RvcmFnZUtleSwgbWF4SWQpO1xuXG4gICAgICAgIGFsZXJ0KCfinIUgRGF0YSBjb3BpZWQgdG8gY2xpcGJvYXJkISBZb3UgY2FuIG5vdyBwYXN0ZSBpdCBpbnRvIEdTaGVldHMuJyk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ29weUJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uOiBSYWlkQ29weUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgncmVtaW5kZXItY29weScpO1xuICAgICAgICBidXR0b24uc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxODBkZWcsICMwMGFhZmYgMCwgIzAwNjY4OCA1MCUsICMwMDU1NzcgNTElLCAjMDBhYWZmIDEwMCUpO1xuICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgd2lkdGg6IDMycHg7XG4gICAgICAgICAgICBoZWlnaHQ6IDMycHg7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogMTBweDtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgIHJpZ2h0OiA0LjVyZW07XG4gICAgICAgICAgICB0b3A6IDAuMnJlbTtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMThweDtcbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAzMnB4O1xuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAwLjJzIGVhc2U7XG4gICAgICAgIGA7XG4gICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5OLJztcbiAgICAgICAgbGV0IGJ1dHRvblRpdGxlID0gJ0NsaWNrID0gY29weSBuZXcgcmFpZHMuIFNoaWZ0IC8gU2hpZnQgKyBDdHJsIGF2YWlsYWJsZS4nO1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCd0b29sdGlwJywgJycpO1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcblxuICAgICAgICBjb25zdCBfYm91bmRDb3B5S2V5SGFuZGxlciA9IChlOiBLZXlib2FyZEV2ZW50KSA9PiB0aGlzLnVwZGF0ZUNvcHlCdXR0b24oZSwgYnV0dG9uKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBfYm91bmRDb3B5S2V5SGFuZGxlcik7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIF9ib3VuZENvcHlLZXlIYW5kbGVyKTtcbiAgICAgICAgLy8gc3RvcmUgaGFuZGxlciByZWZlcmVuY2Ugc28gY2FsbGVycyBjYW4gcmVtb3ZlIGxpc3RlbmVycyBpZiBidXR0b24gaXMgcmVtb3ZlZCBsYXRlclxuICAgICAgICBidXR0b24uX2JvdW5kQ29weUtleUhhbmRsZXIgPSBfYm91bmRDb3B5S2V5SGFuZGxlcjtcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoZSkgPT4gdGhpcy5oYW5kbGVDb3B5Q2xpY2soZSk7XG4gICAgICAgIHRoaXMudXBkYXRlQ29weUJ1dHRvbih7IHNoaWZ0S2V5OiBmYWxzZSwgY3RybEtleTogZmFsc2UgfSwgYnV0dG9uKTtcbiAgICAgICAgcmV0dXJuIGJ1dHRvbjtcbiAgICB9XG5cbiAgICB1cGRhdGVDb3B5QnV0dG9uKGU6IFBpY2s8S2V5Ym9hcmRFdmVudCwgJ3NoaWZ0S2V5JyB8ICdjdHJsS2V5Jz4sIGJ1dHRvbjogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgbGV0IGJ1dHRvblRpdGxlID0gJyc7XG4gICAgICAgIGlmIChlLnNoaWZ0S2V5ICYmIGUuY3RybEtleSkge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmZjY2NjYgMCwgI2FhMDAwMCAxMDAlKVwiOyAvLyByZWRcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn5eR77iPJztcbiAgICAgICAgICAgIGJ1dHRvblRpdGxlID0gJ1NoaWZ0ICsgQ3RybCArIENsaWNrID0gY2xlYXIgc2F2ZWQgSUQnO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaGhfdGl0bGUnLCBidXR0b25UaXRsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmZmRkNjYgMCwgI2NjOTkwMCAxMDAlKVwiOyAvLyB5ZWxsb3dcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfinI/vuI8nO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnU2hpZnQgKyBDbGljayA9IHByb21wdCBmb3IgSUQuJztcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hoX3RpdGxlJywgYnV0dG9uVGl0bGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICMwMGFhZmYgMCwgIzAwNjY4OCA1MCUsICMwMDU1NzcgNTElLCAjMDBhYWZmIDEwMCUpXCI7IC8vIGRlZmF1bHQgYmx1ZVxuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ/Cfk4snO1xuICAgICAgICAgICAgYnV0dG9uVGl0bGUgPSAnQ2xpY2sgPSBjb3B5IG5ldyByYWlkcy4gU2hpZnQgLyBTaGlmdCArIEN0cmwgYXZhaWxhYmxlLic7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdoaF90aXRsZScsIGJ1dHRvblRpdGxlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluc2VydEJ1dHRvbigpIHtcbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1dHRvbi1ub3RpZmljYXRpb24tYWN0aW9uLm5vdGlmX2J1dHRvbl9zJyk7XG4gICAgICAgIGlmIChub3RpZmljYXRpb25CdXR0b24gJiYgIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW1pbmRlci1jb3B5JykpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvcHlCdXR0b24gPSB0aGlzLmNyZWF0ZUNvcHlCdXR0b24oKTtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbkJ1dHRvbi5wYXJlbnROb2RlPy5pbnNlcnRCZWZvcmUoY29weUJ1dHRvbiwgbm90aWZpY2F0aW9uQnV0dG9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgICAgICB0aGlzLmdpcmxEaWN0ID0gYXdhaXQgZ2V0R2lybERpY3Rpb25hcnkoKTtcblxuICAgICAgICB0aGlzLl9ib3VuZEluc2VydEJ1dHRvbiA9IHRoaXMuaW5zZXJ0QnV0dG9uLmJpbmQodGhpcyk7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB0aGlzLmluc2VydEJ1dHRvbigpO1xuICAgICAgICBlbHNlIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcy5fYm91bmRJbnNlcnRCdXR0b24sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcblxuZXhwb3J0IGNsYXNzIEFjdGl2aXR5UGFyc2VyIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2FjdGl2aXR5UGFyc2VyJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogYEhlbHBlciBmb3IgR1NoZWV0IG1hbmFnZW1lbnRgLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAnbWlzc2lvbkNvcGllcicsXG4gICAgICAgICAgICAgICAgbGFiZWw6IGBMZWdlbmRhcnkgbWlzc2lvbnMgaW5mbyBjb3BpZXJgLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2FjdGl2aXRpZXMuaHRtbCcpXG4gICAgfVxuXG4gICAgYXN5bmMgY29weVRvQ2xpcGJvYXJkKHRleHQ6IHN0cmluZykge1xuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgICAgY29uc3QgdG9hc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG9hc3QudGV4dENvbnRlbnQgPSAnQ29waWVkISc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICAgICAgdG9hc3Quc3R5bGUuYm90dG9tID0gJzEwcHgnO1xuICAgICAgICB0b2FzdC5zdHlsZS5yaWdodCA9ICcxMHB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUuYmFja2dyb3VuZCA9ICdyZ2JhKDAsMCwwLDAuNyknO1xuICAgICAgICB0b2FzdC5zdHlsZS5jb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgIHRvYXN0LnN0eWxlLnBhZGRpbmcgPSAnNXB4IDEwcHgnO1xuICAgICAgICB0b2FzdC5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNXB4JztcbiAgICAgICAgdG9hc3Quc3R5bGUuekluZGV4ID0gJzk5OTknO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvYXN0KTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0b2FzdC5yZW1vdmUoKSwgMTAwMCk7XG4gICAgfVxuXG4gICAgcnVuKHsgbWlzc2lvbkNvcGllciB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgaWYgKG1pc3Npb25Db3BpZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJpZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWlzc2lvbl9lbnRyeS5sZWdlbmRhcnknKTtcbiAgICAgICAgICAgIGlmICghZW50cmllcy5sZW5ndGgpIHJldHVybjtcblxuICAgICAgICAgICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbWdEaXYgPSBlbnRyeS5xdWVyeVNlbGVjdG9yPEhUTUxJbWFnZUVsZW1lbnQ+KCcubWlzc2lvbl9pbWFnZSBpbWcnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUFsbCA9IGVudHJ5LnF1ZXJ5U2VsZWN0b3I8SFRNTEhlYWRpbmdFbGVtZW50PignLm1pc3Npb25fZGV0YWlscyBoMScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlc2MgPSBlbnRyeS5xdWVyeVNlbGVjdG9yPEhUTUxQYXJhZ3JhcGhFbGVtZW50PignLm1pc3Npb25fZGV0YWlscyBwJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW1nRGl2KSB7XG4gICAgICAgICAgICAgICAgICAgIGltZ0Rpdi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgICAgIGltZ0Rpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKGltZ0Rpdi5zcmMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodGl0bGVBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVBbGwuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvdXRlclRpdGxlID0gdGl0bGVBbGwucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oJy5ldmVudC1taXNzaW9uLWNvbnRlbnQtdGV4dCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob3V0ZXJUaXRsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJUaXRsZS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlclRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZCgob3V0ZXJUaXRsZS50ZXh0Q29udGVudCA/PyAnJykudHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGl0bGVBbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgZS50YXJnZXQuY2xvc2VzdCgnLmV2ZW50LW1pc3Npb24tY29udGVudC10ZXh0JykpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlQ2xvbmUgPSB0aXRsZUFsbC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEhlYWRpbmdFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVDbG9uZS5xdWVyeVNlbGVjdG9yKCcuZXZlbnQtbWlzc2lvbi1jb250ZW50LXRleHQnKT8ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9ICh0aXRsZUNsb25lLnRleHRDb250ZW50ID8/ICcnKS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZCh0aXRsZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkZXNjKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2Muc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgICAgICBkZXNjLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQoZGVzYy5pbm5lclRleHQudHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgICAgICB9XG4gICAgfVxufVxuIiwgImltcG9ydCB7IGluaXRHYW1lIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IGluamVjdFN0eWxlcywgcGFja1NldHRpbmdzIH0gZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBGcmllbmRBbmRGb2VzIH0gZnJvbSAnLi9tb2R1bGVzL3BsYXllcnMvRnJpZW5kQW5kRm9lcyc7XG5pbXBvcnQgeyBhcm1Db250ZXN0U3RhcnR1cEd1YXJkLCBDb250ZXN0U3RhcnQgfSBmcm9tICcuL21vZHVsZXMvY29udGVzdHMvQ29udGVzdFN0YXJ0JztcbmltcG9ydCB7IExlYWd1ZVRvcDIwIH0gZnJvbSAnLi9tb2R1bGVzL3BsYXllcnMvTGVhZ3VlVG9wMjAnO1xuaW1wb3J0IHsgUmVtb3ZlUGFzc0xvY2sgfSBmcm9tICcuL21vZHVsZXMvcHJvZ3Jlc3Npb24vUmVtb3ZlUGFzc0xvY2snO1xuaW1wb3J0IHsgTG92ZVJhaWRzQWRkb24gfSBmcm9tICcuL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNBZGRvbic7XG5pbXBvcnQgeyBMb3ZlUmFpZHNQYXJzZXIgfSBmcm9tICcuL21vZHVsZXMvbG92ZS1yYWlkcy9Mb3ZlUmFpZHNQYXJzZXInO1xuaW1wb3J0IHsgQWN0aXZpdHlQYXJzZXIgfSBmcm9tICcuL21vZHVsZXMvYWN0aXZpdGllcy9BY3Rpdml0eVBhcnNlcic7XG5cbmFybUNvbnRlc3RTdGFydHVwR3VhcmQoKTtcblxuZnVuY3Rpb24gcnVuSmFydmlzKCkge1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHJ1bkphcnZpcywgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgeyAkIH0gPSB3aW5kb3c7XG5cbiAgICBpZiAoISQpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgcnVuSmFydmlzLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2phcnZpcy1jb250ZXN0LXN0YXJ0dXAnKT8ucmVtb3ZlKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdXQVJOSU5HOiBObyBqUXVlcnkgZm91bmQuIEVuZGluZyBzY3JpcHQuJyk7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKCdIZWxsbywgU2lyLCBKLkEuUi5WLkkuUy4gaXMgcmVhZHkgdG8gaGVscCB5b3UuJyk7XG5cbiAgICBpbml0R2FtZSgkKTtcbiAgICBpbmplY3RTdHlsZXMoKTtcblxuICAgIGNvbnN0IGFsbE1vZHVsZXMgPSBbXG4gICAgICAgIG5ldyBGcmllbmRBbmRGb2VzKCksXG4gICAgICAgIG5ldyBDb250ZXN0U3RhcnQoKSxcbiAgICAgICAgbmV3IExlYWd1ZVRvcDIwKCksXG4gICAgICAgIG5ldyBSZW1vdmVQYXNzTG9jaygpLFxuICAgICAgICBuZXcgTG92ZVJhaWRzQWRkb24oKSxcbiAgICAgICAgbmV3IExvdmVSYWlkc1BhcnNlcigpLFxuICAgICAgICBuZXcgQWN0aXZpdHlQYXJzZXIoKVxuICAgIF1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBydW5TY3JpcHQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGhoUGx1c1BsdXNDb25maWcgfSA9IHdpbmRvd1xuICAgICAgICAgICAgaWYgKCFoaFBsdXNQbHVzQ29uZmlnKSByZXR1cm47XG5cbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJHcm91cCh7XG4gICAgICAgICAgICAgICAga2V5OiAnSkFSVklTJyxcbiAgICAgICAgICAgICAgICBuYW1lOiBgSEggSmFydmlzIDxzbWFsbCBjbGFzcz1cImphcnZpcy12ZXJzaW9uXCI+diR7VVNFUlNDUklQVF9WRVJTSU9OX0xBQkVMfTwvc21hbGw+YFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGFsbE1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4ge1xuICAgICAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJNb2R1bGUobW9kdWxlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcubG9hZENvbmZpZygpXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJ1bk1vZHVsZXMoKVxuICAgICAgICAgICAgcGFja1NldHRpbmdzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2luZG93LmhoUGx1c1BsdXNDb25maWcpIHtcbiAgICAgICAgICAgIHJ1blNjcmlwdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbmUoJ2hoKystYmRzbTpsb2FkZWQnLCBydW5TY3JpcHQpXG4gICAgICAgIH1cbiAgICB9LCAxKVxufVxuXG5ydW5KYXJ2aXMoKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTyxNQUFJO0FBQ0osTUFBSTtBQUVKLFdBQVMsU0FBUyxRQUFzQjtBQUMzQyxRQUFJO0FBQ0osa0JBQWMsT0FBTyxTQUFTO0FBQUEsRUFDbEM7OztBQ05BO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFB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LGVBQWU7QUFBQSxJQUN2QjtBQUVBLGVBQVcsTUFBTTtBQUNiLFlBQU0sWUFBWSxNQUFNO0FBQ3BCLGNBQU0sRUFBRSxpQkFBaUIsSUFBSTtBQUM3QixZQUFJLENBQUMsaUJBQWtCO0FBRXZCLHlCQUFpQixjQUFjO0FBQUEsVUFDM0IsS0FBSztBQUFBLFVBQ0wsTUFBTSw0Q0FBNEMsZUFBd0I7QUFBQSxRQUM5RSxDQUFDO0FBQ0QsbUJBQVcsUUFBUSxZQUFVO0FBQ3pCLDJCQUFpQixlQUFlLE1BQU07QUFBQSxRQUMxQyxDQUFDO0FBQ0QseUJBQWlCLFdBQVc7QUFDNUIseUJBQWlCLFdBQVc7QUFDNUIscUJBQWE7QUFBQSxNQUNqQjtBQUVBLFVBQUksT0FBTyxrQkFBa0I7QUFDekIsa0JBQVU7QUFBQSxNQUNkLE9BQU87QUFDSCxRQUFBQSxHQUFFLFFBQVEsRUFBRSxJQUFJLG9CQUFvQixTQUFTO0FBQUEsTUFDakQ7QUFBQSxJQUNKLEdBQUcsQ0FBQztBQUFBLEVBQ1I7QUFFQSxZQUFVOyIsCiAgIm5hbWVzIjogWyJtYXRjaGVzIiwgInBsYXllciIsICJlcnIiLCAiJCJdCn0K
