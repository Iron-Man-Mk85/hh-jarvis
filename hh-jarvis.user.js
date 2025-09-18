// ==UserScript==
// @name           HH J.A.R.V.I.S.
// @version        0.3.0
// @description    QoL for KK games
// @author         Iron Man
// @match          https://*.pornstarharem.com/*
// @match          https://*.hentaiheroes.com/*
// @match          https://*.comixharem.com/*
// @match          https://*.mangarpg.com/*
// @match          https://*.amouragent.com/*
// @run-at         document-idle
// @namespace      https://github.com/Iron-Man-Mk85/hh-jarvis
// @downloadURL    https://raw.githubusercontent.com/Iron-Man-Mk85/hh-jarvis/main/hh-jarvis.user.js
// @updateURL      https://raw.githubusercontent.com/Iron-Man-Mk85/hh-jarvis/main/hh-jarvis.user.js
// @icon           https://www.google.com/s2/favicons?sz=64&domain=hentaiheroes.com
// @grant          none
// ==/UserScript==

/* =================
*  =   Changelog   =
*  =================
* 0.3.0 - Add LoveRaidsAddon and LoveRaidsParser modules
* 0.2.0 - Add RemovePassLock module
* 0.1.3 - Better code practices
* 0.1.2 - Polishing and update links
* 0.1.1 - Add FriendAndFoes module
* 0.0.1 - Initial release
*/

(async function () {
    'use strict';

    const { $, localStorage, location } = window
    const LS_CONFIG_NAME = 'HHStark'
    const currentPage = location.pathname
    const tab = location.search
    const girlDict = await HHPlusPlus.Helpers.getGirlDictionary();

    if (!$) {
        console.log('WARNING: No jQuery found. Ending script.');
        return
    }

    console.log('Hello, Sir, J.A.R.V.I.S. is ready to help you.');

    // Define CSS
    const sheet = (() => {
        const style = document.createElement('style')
        style.setAttribute('class', 'hh-jarvis-style')
        document.head.appendChild(style)
        style.sheet.insertRules = (rules) => {
            rules.replace(/ {4}/g, '').split(/(?<=})\n/g).map(rule => rule.replace(/\n/g, '')).forEach(rule => {
                try {
                    style.sheet.insertRule(rule)
                } catch {
                    console.log(`Error adding style rules:\n${rule}`)
                }
            })
        }
        return style.sheet
    })();

    function lsGet(key, ls_name = LS_CONFIG_NAME) {
        return JSON.parse(localStorage.getItem(`${ls_name}${key}`))
    }
    function lsSet(key, value, ls_name = LS_CONFIG_NAME) {
        return localStorage.setItem(`${ls_name}${key}`, JSON.stringify(value))
    }
    function lsRm(key, ls_name = LS_CONFIG_NAME) {
        return localStorage.removeItem(`${ls_name}${key}`)
    }

    class HHModule {
        constructor({ group, configSchema }) {
            this.group = 'JARVIS'
            this.configSchema = configSchema
            this.hasRun = false
        }
    }

    class FriendAndFoes extends HHModule {
        constructor() {
            const baseKey = 'friendAndFoes'
            const configSchema = {
                baseKey,
                default: true,
                label: `Show Friends and Foes`,
                subSettings: [{
                    key: 'league',
                    label: `Show in League`,
                    default: true
                }, {
                    key: 'contests',
                    label: `Show in Contests`,
                    default: true
                }]
            }
            super({ name: baseKey, configSchema });

            this.friendIcon = this.createIcon('starkFriend');
            this.foeIcon = this.createIcon('starkFoe');
        }

        shouldRun() {
            return currentPage.includes('/leagues.html') || currentPage.includes('/activities.html')
        }

        updateList(listName, id, add) {
            let list = lsGet(listName) || [];
            if (add && !list.includes(id)) {
                list.push(id);
            } else if (!add && list.includes(id)) {
                list = list.filter(item => item !== id);
            }
            if (listName === 'FriendList') this.updateFriendButtonVisibility(id, add);
            else this.updateFoeButtonVisibility(id, add);
            lsSet(listName, list);
        }

        createIcon(className) {
            const div = document.createElement('div');
            const span = document.createElement('span');
            div.className = className;
            span.className = className + 'Icon';
            div.appendChild(span);
            return div;
        }

        createButton(className, iconUrl) {
            const btn = document.createElement('button');
            const img = document.createElement('img');
            btn.className = className;
            img.className = className + 'Icon';
            img.src = iconUrl;
            btn.appendChild(img);
            btn.style.display = 'none';
            return btn;
        }

        updateFriendButtonVisibility(memberId, isPlus) {
            const memberElement = document.querySelector(`[id-member="${memberId}"]`);
            const addFriendButton = memberElement.previousElementSibling.querySelector('.starkAddFriendButton');
            const removeFriendButton = memberElement.previousElementSibling.querySelector('.starkRemoveFriendButton');
            if (isPlus) {
                addFriendButton.style.display = 'none';
                removeFriendButton.style.display = 'inline';
                memberElement.appendChild(this.friendIcon.cloneNode(true));
                memberElement.style.color = 'rgb(0, 0, 204)';
                memberElement.style.webkitTextStroke = '0.01em #FFFFFF';
            } else {
                addFriendButton.style.display = 'inline';
                removeFriendButton.style.display = 'none';
                memberElement.removeChild(memberElement.querySelector('.starkFriend'));
                memberElement.style.removeProperty('color');
                memberElement.style.removeProperty('-webkit-text-stroke');
            }
        }

        updateFoeButtonVisibility(memberId, isPlus) {
            const memberElement = document.querySelector(`[id-member="${memberId}"]`);
            const AddFoeButton = memberElement.previousElementSibling.querySelector('.starkAddFoeButton');
            const RemoveFoeButton = memberElement.previousElementSibling.querySelector('.starkRemoveFoeButton');
            if (isPlus) {
                AddFoeButton.style.display = 'none';
                RemoveFoeButton.style.display = 'inline';
                memberElement.appendChild(this.foeIcon.cloneNode(true));
                memberElement.style.color = 'rgb(204, 0, 0)';
                memberElement.style.webkitTextStroke = '0.01em #FFFFFF';
            } else {
                AddFoeButton.style.display = 'inline';
                RemoveFoeButton.style.display = 'none';
                memberElement.removeChild(memberElement.querySelector('.starkFoe'));
                memberElement.style.removeProperty('color');
                memberElement.style.removeProperty('-webkit-text-stroke');
            }
        }

        addFriendLogos() {
            let friendList = lsGet('FriendList');
            if (friendList !== null) {
                const nicknameElements = document.querySelectorAll('.nickname');
                nicknameElements.forEach((nicknameElement) => {
                    const memberId = nicknameElement.getAttribute('id-member');
                    if (friendList.includes(memberId)) {
                        nicknameElement.appendChild(this.friendIcon.cloneNode(true));
                        nicknameElement.style.color = 'rgb(0, 0, 204)';
                        nicknameElement.style.webkitTextStroke = '0.01em #FFFFFF';
                    }
                });
            }
        }

        addFoeLogos() {
            let foeList = lsGet('FoeList');
            if (foeList !== null) {
                const nicknameElements = document.querySelectorAll('.nickname');
                nicknameElements.forEach((nicknameElement) => {
                    const memberId = nicknameElement.getAttribute('id-member');
                    if (foeList.includes(memberId)) {
                        nicknameElement.appendChild(this.foeIcon.cloneNode(true));
                        nicknameElement.style.color = 'rgb(204, 0, 0)';
                        nicknameElement.style.webkitTextStroke = '0.01em #FFFFFF';
                    }
                });
            }
        }

        addFriendLogosContests() {
            let friendList = lsGet('FriendList');
            if (friendList !== null) {
                const panels = document.querySelectorAll('.ranking');
                panels.forEach((panel) => {
                    const table = panel.querySelector('.leadTable');
                    const tableRows = table.querySelectorAll('tr[sorting_id]');
                    tableRows.forEach((contestant) => {
                        const memberId = contestant.getAttribute('sorting_id');
                        if (friendList.includes(memberId)) {
                            const row = contestant.querySelector('td:nth-child(2)');
                            row.appendChild(this.friendIcon.cloneNode(true));
                            row.style.color = 'rgb(0, 0, 204)';
                            row.style.webkitTextStroke = '0.01em #FFFFFF';
                        }
                    })
                });
            }
        }

        addFoeLogosContests() {
            let foeList = lsGet('FoeList');
            if (foeList !== null) {
                const panels = document.querySelectorAll('.ranking');
                panels.forEach((panel) => {
                    const table = panel.querySelector('.leadTable');
                    const tableRows = table.querySelectorAll('tr[sorting_id]');
                    tableRows.forEach((contestant) => {
                        const memberId = contestant.getAttribute('sorting_id');
                        if (foeList.includes(memberId)) {
                            const row = contestant.querySelector('td:nth-child(2)');
                            row.appendChild(this.foeIcon.cloneNode(true));
                            row.style.color = 'rgb(204, 0, 0)';
                            row.style.webkitTextStroke = '0.01em #FFFFFF';
                        }
                    })
                });
            }
        }

        run({ league, contests }) {
            if (this.hasRun || !this.shouldRun()) { return }

            const starkFriendsIcon = 'https://i.imgur.com/vjzKcJg.png';
            const starkFriendsStrokeIcon = 'https://i.imgur.com/DJ5pJHC.png';
            const starkFoesIcon = 'https://i.imgur.com/QdVFN7l.png';
            const starkFoesStrokeIcon = 'https://i.imgur.com/WYxso6g.png';

            if (currentPage.includes('/leagues.html') && league) {
                // friends/foes button
                const friendsButton = document.createElement('div');
                friendsButton.textContent = 'Friends';
                friendsButton.className = 'switch-tab tab-switcher-fade-out friends-button';
                const foesButton = document.createElement('div');
                foesButton.textContent = 'Foes';
                foesButton.className = 'switch-tab tab-switcher-fade-out foes-button';
                const tabsContainer = document.querySelector('.tabs');
                tabsContainer.appendChild(friendsButton);
                tabsContainer.appendChild(foesButton);

                // +/- buttons++
                const addFriendElement = this.createButton('starkAddFriendButton', starkFriendsStrokeIcon);
                const removeFriendElement = this.createButton('starkRemoveFriendButton', starkFriendsStrokeIcon);
                const addFoeElement = this.createButton('starkAddFoeButton', starkFoesStrokeIcon);
                const removeFoeElement = this.createButton('starkRemoveFoeButton', starkFoesStrokeIcon);

                // friend/foes variables
                let friendList = lsGet('FriendList');
                let foeList = lsGet('FoeList');
                let friendsShown = 0;
                let foesShown = 0;

                // append +/- buttons to their container
                const nicknameElements = document.querySelectorAll('.nickname');
                nicknameElements.forEach((nicknameElement) => {
                    const buttonContainer = document.createElement('span');
                    buttonContainer.classList.add('starkButtons');
                    buttonContainer.style.marginRight = '5px';
                    buttonContainer.appendChild(addFriendElement.cloneNode(true));
                    buttonContainer.appendChild(removeFriendElement.cloneNode(true));
                    buttonContainer.appendChild(addFoeElement.cloneNode(true));
                    buttonContainer.appendChild(removeFoeElement.cloneNode(true));
                    nicknameElement.parentNode.insertBefore(buttonContainer, nicknameElement);
                });

                // friends button listener
                friendsButton.addEventListener('click', () => {
                    if (!friendsShown) {
                        friendList = lsGet('FriendList');
                        nicknameElements.forEach((nicknameElement) => {
                            const memberId = nicknameElement.getAttribute('id-member');
                            const plusButton = nicknameElement.parentNode.querySelector('.starkAddFriendButton');
                            const minusButton = nicknameElement.parentNode.querySelector('.starkRemoveFriendButton');
                            if (friendList !== null && friendList.includes(memberId)) {
                                minusButton.style.display = 'inline';
                            } else {
                                plusButton.style.display = 'inline';
                            }
                        });
                        friendsShown = 1;
                    } else {
                        friendList = lsGet('FriendList');
                        nicknameElements.forEach((nicknameElement) => {
                            const memberId = nicknameElement.getAttribute('id-member');
                            const plusButton = nicknameElement.parentNode.querySelector('.starkAddFriendButton');
                            const minusButton = nicknameElement.parentNode.querySelector('.starkRemoveFriendButton');
                            if (friendList !== null && friendList.includes(memberId)) {
                                minusButton.style.display = 'none';
                            } else {
                                plusButton.style.display = 'none';
                            }
                        });
                        friendsShown = 0;
                    }
                });

                // foes button listener
                foesButton.addEventListener('click', () => {
                    if (!foesShown) {
                        foeList = lsGet('FoeList');
                        nicknameElements.forEach((nicknameElement) => {
                            const memberId = nicknameElement.getAttribute('id-member');
                            const plusButton = nicknameElement.parentNode.querySelector('.starkAddFoeButton');
                            const minusButton = nicknameElement.parentNode.querySelector('.starkRemoveFoeButton');
                            if (foeList !== null && foeList.includes(memberId)) {
                                minusButton.style.display = 'inline';
                            } else {
                                plusButton.style.display = 'inline';
                            }
                        });
                        foesShown = 1;
                    } else {
                        foeList = lsGet('FoeList');
                        nicknameElements.forEach((nicknameElement) => {
                            const memberId = nicknameElement.getAttribute('id-member');
                            const plusButton = nicknameElement.parentNode.querySelector('.starkAddFoeButton');
                            const minusButton = nicknameElement.parentNode.querySelector('.starkRemoveFoeButton');
                            if (foeList !== null && foeList.includes(memberId)) {
                                minusButton.style.display = 'none';
                            } else {
                                plusButton.style.display = 'none';
                            }
                        });
                        foesShown = 0;
                    }
                });

                // +/- buttons listeners
                document.querySelectorAll('.starkAddFriendButton').forEach(button => {
                    button.addEventListener('click', event => {
                        const id = event.target.parentNode.parentNode.querySelector('[id-member]').getAttribute('id-member');
                        this.updateList('FriendList', id, true);
                    });
                });
                document.querySelectorAll('.starkRemoveFriendButton').forEach(button => {
                    button.addEventListener('click', event => {
                        const id = event.target.parentNode.parentNode.querySelector('[id-member]').getAttribute('id-member');
                        this.updateList('FriendList', id, false);
                    });
                });
                document.querySelectorAll('.starkAddFoeButton').forEach(button => {
                    button.addEventListener('click', event => {
                        const id = event.target.parentNode.parentNode.querySelector('[id-member]').getAttribute('id-member');
                        this.updateList('FoeList', id, true);
                    });
                });
                document.querySelectorAll('.starkRemoveFoeButton').forEach(button => {
                    button.addEventListener('click', event => {
                        const id = event.target.parentNode.parentNode.querySelector('[id-member]').getAttribute('id-member');
                        this.updateList('FoeList', id, false);
                    });
                });

                $(document).ready(() => {
                    this.addFriendLogos();
                    this.addFoeLogos();
                })

            } else if (tab.includes('?tab=contests') && contests) {
                $(document).ready(() => {
                    this.addFriendLogosContests();
                    this.addFoeLogosContests();
                })
            }

            sheet.insertRules(`
            .friends-button {
                color: #A1624A;
                border: none;
                padding: 8px;
                font-size: 16px;
                cursor: pointer;
            }

            .foes-button {
                color: #A1624A;
                border: none;
                padding: 8px;
                font-size: 16px;
                cursor: pointer;
            }

            .starkFriendColor {
                color = 'rgb(0, 0, 204)';
                text-shadow: 0 0 0 1px #FFFFFF;
            }

            .starkFoeColor {
                color = 'rgb(204, 0, 0)';
                text-shadow: 0 0 0 1px #FFFFFF;
            }

            .addFriend {
                background-color: #51CB20;
                border: none;
                border-radius: 50%;
                color: #FFFFFF;
                cursor: pointer;
                font-size: 11px;
                height: 20px;
                width: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .removeFriend {
                background-color: #F71735;
                border: none;
                border-radius: 50%;
                color: #FFFFFF;
                cursor: pointer;
                font-size: 11px;
                height: 20px;
                width: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .starkAddFriendButton {
                background-color: #51CB20;
                border: none;
                border-radius: 50%;
                color: #FFFFFF;
                cursor: pointer;
                font-size: 11px;
                height: 20px;
                width: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 2px;
                padding: 0;
            }

            .starkRemoveFriendButton {
                background-color: #F71735;
                border: none;
                border-radius: 50%;
                color: #FFFFFF;
                cursor: pointer;
                font-size: 11px;
                height: 20px;
                width: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 2px;
                padding: 0;
            }

            .starkAddFoeButton {
                background-color: #51CB20;
                border: none;
                border-radius: 50%;
                color: #FFFFFF;
                cursor: pointer;
                font-size: 11px;
                height: 20px;
                width: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 2px;
                padding: 0;
            }

            .starkRemoveFoeButton {
                background-color: #F71735;
                border: none;
                border-radius: 50%;
                color: #FFFFFF;
                cursor: pointer;
                font-size: 11px;
                height: 20px;
                width: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 2px;
                padding: 0;
            }

            .starkFriend {
                display: inline-flex;
                height: 100%;
                flex-direction: column;
                justify-content: center;
            }

            .starkFoe {
                display: inline-flex;
                height: 100%;
                flex-direction: column;
                justify-content: center;
            }

            .starkFriendIcon {
                text-rendering: optimizeLegibility;
                border-spacing: 0;
                border-collapse: separate;
                color: #ffffff;
                cursor: pointer;
                box-sizing: inherit;
                vertical-align: bottom;
                font: inherit;
                display: block;
                background-image: url(${starkFriendsIcon});
                background-position: center center;
                background-repeat: no-repeat;
                padding: 0;
                margin: 0;
                margin-left: 5px;
                height: 21px;
                width: 21px;
                background-size: contain;
            }

            .starkFoeIcon {
                text-rendering: optimizeLegibility;
                border-spacing: 0;
                border-collapse: separate;
                color: #ffffff;
                cursor: pointer;
                box-sizing: inherit;
                vertical-align: bottom;
                font: inherit;
                display: block;
                background-image: url(${starkFoesIcon});
                background-position: center center;
                background-repeat: no-repeat;
                padding: 0;
                margin: 0;
                margin-left: 5px;
                height: 21px;
                width: 21px;
                background-size: contain;
            }

            .starkAddFriendButtonIcon,
            .starkRemoveFriendButtonIcon {
                border: none;
                height: 15px;
                width: 15px;
                pointer-events: none;
            }

            .starkAddFoeButtonIcon,
            .starkRemoveFoeButtonIcon {
                border: none;
                height: 15px;
                width: 15px;
                pointer-events: none;
            }`)

            this.hasRun = true
        }
    }

    class RemovePassLock extends HHModule {
        constructor() {
            const baseKey = 'removePassLock'
            const configSchema = {
                baseKey,
                default: false,
                label: `Remove the lock icon in PoV/PoG Pass/Pass+ for easier reading`,
                subSettings: [{
                    key: 'pov',
                    label: `Remove in PoV`,
                    default: true
                }, {
                    key: 'pog',
                    label: `Remove in PoG`,
                    default: true
                }]
            }
            super({name: baseKey, configSchema});

            this.selectorToFind = '.lock_yellow_icn';
            this.classToRemove = 'lock_yellow_icn';
        }

        shouldRun() {
            return currentPage.includes('/path-of-valor.html') || currentPage.includes('/path-of-glory.html')
        }

        observeUntil(selector, callback, { once = true, timeout = 5000 } = {}) {
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

        removeClassWhenSelectorAvailable(selector, classToRemove, { once = true, timeout = 5000 } = {}) {
            this.observeUntil(selector, (elements) => {
                elements.forEach(el => el.classList.remove(classToRemove));
            }, { timeout, once });
        }

        run({pov, pog}) {
            if (this.hasRun || !this.shouldRun()) {return}

            if (currentPage.includes('/path-of-valor.html') && pov) {
                this.removeClassWhenSelectorAvailable(this.selectorToFind, this.classToRemove);
            } else if (currentPage.includes('/path-of-glory.html') && pog) {
                this.removeClassWhenSelectorAvailable(this.selectorToFind, this.classToRemove);
            }

            this.hasRun = true
        }
    }

    class LoveRaidsAddon extends HHModule {
        constructor() {
            const baseKey = 'loveRaidsAddon'
            const configSchema = {
                baseKey,
                default: false,
                label: `Visual enhancements for Love Raids page`,
                subSettings: [{
                    key: 'raid_id',
                    label: `Show raid ID before raid name`,
                    default: false
                }, {
                    key: 'names',
                    label: `Show names on mysterious girls`,
                    default: true
                }, {
                    key: 'skin',
                    label: `Show 👙 icon if a girl has a skin (works on hidden ones)`,
                    default: true
                }, {
                    key: 'color',
                    label: `Set the color based on rarity`,
                    default: true
                }, {
                    key: 'fight_icon',
                    label: `Show better fight icon`,
                    default: true
                }, {
                    key: 'shadows',
                    label: `Replace shadow poses`,
                    default: true
                }]
            }
            super({name: baseKey, configSchema});

            this.rarityColors = {
                rare: 'LimeGreen',
                epic: 'Gold',
                legendary: 'MediumOrchid'
            };
        }

        shouldRun() {
            return currentPage.includes('/love-raids.html')
        }

        getGirls(ids) {
            return ids.map(id => girlDict.get(id.toString()) || {});
        }

        run({raid_id, skin, names, color, fight_icon, shadows}) {
            if (this.hasRun || !this.shouldRun()) {return}

            const girls = this.getGirls(love_raids.map(raid => raid.id_girl));

            document.querySelectorAll('.raid-card').forEach((raidCard, i) => {
                const raid = love_raids[i];
                const { name = 'Unknown', rarity = 'N/A', shards = 0 } = girls[i];
                const name_label = names ? `${name}` : raidCard.querySelector('.raid-name > span')?.innerHTML || `Mysterious Girl ${GT.design.love_raid}`;
                const raid_id_label = raid_id ? `(${raid.id_raid})` : '';
                const skin_label = (skin && Array.isArray(raid?.girl_data?.grade_skins) && raid.girl_data.grade_skins.length > 0) ? '👙' : '';

                const displayParts = [];
                if (raid_id) displayParts.push(raid_id_label);
                displayParts.push(name_label);
                if (skin) displayParts.push(skin_label);
                const displayLabel = displayParts.join(' ').trim();

                const raidNameElem = raidCard.querySelector('.raid-name > span');
                if (raidNameElem) {
                    raidNameElem.innerHTML = displayLabel;
                }

                const objectives = raidCard.querySelectorAll('.classic-girl');
                const girl = objectives[0];
                if (girl) {
                    const girlNameElem = girl.querySelector('.girl-name');
                    if (girlNameElem) {
                        girlNameElem.innerHTML = displayLabel;
                    }
                    if (shards === 100) {
                        const objElem = girl.querySelector('.objective');
                        if (objElem) {
                            objElem.innerText = `I'm already attracted to you. Find me in your Harem!`;
                        }
                    }
                }

                if (color) {
                    const raidNameContainer = raidCard.querySelector('.raid-name');
                    if (raidNameContainer && color) {
                        raidNameContainer.style.color = this.rarityColors[rarity] || '';
                    }
                }

                if (fight_icon) {
                    const fightIcon = raidCard.querySelector('.hudBattlePts_mix_icn');
                    if (fightIcon) {
                        fightIcon.style.backgroundImage = 'url(/images/pictures/design/ic_energy_fight.png)';
                        fightIcon.style.backgroundSize = '24px';
                    }
                }

                if (shadows) {
                    const leftImage = raidCard.querySelector('.girl-img.left');
                    if (leftImage) {
                        leftImage.src = leftImage.src.replace('avb0', 'ava0');
                    }
                    if (raidCard.classList.contains('multiple-girl')) {
                        const rightImage = raidCard.querySelector('.girl-img.right');
                        if (rightImage) {
                            rightImage.src = rightImage.src.replace('avb0.png', 'grade_skins/grade_skin1.png');
                        }
                    }
                }
            });

            if (shadows) document.querySelectorAll('.raid-card .eye').forEach(e => e.remove());

            this.hasRun = true
        }
    }

    class LoveRaidsParser extends HHModule {
        /*
        * Raid ID, Announcement Type, Background ID, Event Name, Start Datetime,
        * End Datetime, Duration, Raid Status, Source, Girl ID,
        * Girl Name, Rarity, Max Grade, First Appearance, Source ID,
        * Has Skin(s)
        */
        constructor() {
            const baseKey = 'loveRaidsParser'
            const configSchema = {
                baseKey,
                default: false,
                label: `Add a parser in Love Raids page for GSheet management`
            }
            super({name: baseKey, configSchema});
        }

        shouldRun() {
            return currentPage.includes('/love-raids.html')
        }

        capitalizeFirst(str) {
            return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
        }

        getAnnouncementType(type) {
            switch (type) {
                case 1: return "Full";
                case 2: return "Partial";
                case 3: return "None";
                default: return "Unknown";
            }
        }

        getSourceID(event) {
            const source_id = Number(event.raid_module_pk);
            switch (event.raid_module_type) {
                case 'season': return 0;
                case 'champion': return Number.isFinite(source_id) ? source_id : -2;
                case 'troll': return Number.isFinite(source_id) ? source_id + 10 : -2;
                default: return -1;
            }
        }

        girlHasSkins(event) {
            const hasSkins = Array.isArray(event?.girl_data?.grade_skins) && event.girl_data.grade_skins.length > 0;
            if (hasSkins) {
                return "X";
            } else return "O";
        }

        formatEventRow(event) {
            const durationHours = Math.floor(event.event_duration_seconds / 3600);
            const duration = `${durationHours} hours`;

            const girl = girlDict.get(String(event.id_girl)) || {};
            const { name = 'Unknown', rarity = 'N/A', grade = 0 } = girl;

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
                "", // one blank tab reserved for first appearance in GSheets
                this.getSourceID(event),
                this.girlHasSkins(event)
            ].join("\t");
        }

        async copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.warn('Clipboard API failed, using execCommand fallback:', err);
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return false;
            }
        }

        async handleCopyClick(evt) {
            const storageKey = 'LastSavedRaidID';

            // Shift + Ctrl + Click → clear stored ID
            if (evt.shiftKey && evt.ctrlKey) {
                const confirmClear = confirm('⚠️ Do you want to clear the saved last raid ID for this site?');
                if (confirmClear) {
                    lsRm(storageKey);
                    alert('✅ Last saved ID cleared.');
                }
                return;
            }

            // Load raids
            const localLoveRaids = (typeof love_raids !== 'undefined' && Array.isArray(love_raids)) ? love_raids : [];
            if (!localLoveRaids.length) {
                alert('⚠️ No love_raids found on this page.');
                return;
            }

            let lastSavedIdNumber = parseInt(lsGet(storageKey), 10);

            // If Shift is held OR no saved ID exists → ask again
            if (isNaN(lastSavedIdNumber) || evt.shiftKey) {
                const lastSavedId = prompt('Please enter the last saved ID:');
                lastSavedIdNumber = parseInt(lastSavedId, 10);

                if (isNaN(lastSavedIdNumber)) {
                    alert('❌ Invalid ID entered. Please enter a valid number.');
                    return;
                }

                lsSet(storageKey, lastSavedIdNumber);
            }

            // Filter new events
            const filteredData = localLoveRaids.filter(event => event.id_raid > lastSavedIdNumber);
            if (!filteredData.length) {
                alert(`ℹ️ No new events found with ID greater than ${lastSavedIdNumber}`);
                return;
            }

            const formattedData = filteredData.map(this.formatEventRow.bind(this)).join("\n");

            await this.copyToClipboard(formattedData);

            // Save highest ID
            const maxId = Math.max(...filteredData.map(e => e.id_raid));
            lsSet(storageKey, maxId);

            alert('✅ Data copied to clipboard! You can now paste it into GSheets.');
        }

        createCopyButton() {
            const button = document.createElement('div');
            button.classList.add('reminder-copy');
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
            button.textContent = '📋';
            let buttonTitle = 'Click = copy new raids. Shift / Shift + Ctrl available.';
            button.setAttribute('tooltip', '');
            button.setAttribute('hh_title', buttonTitle);

            const _boundCopyKeyHandler = (e) => this.updateCopyButton(e, button);
            window.addEventListener('keydown', _boundCopyKeyHandler);
            window.addEventListener('keyup', _boundCopyKeyHandler);
            // store handler reference so callers can remove listeners if button is removed later
            button._boundCopyKeyHandler = _boundCopyKeyHandler;
            button.onclick = (e) => this.handleCopyClick(e);
            this.updateCopyButton({ shiftKey: false, ctrlKey: false }, button);
            return button;
        }

        updateCopyButton(e, button) {
            let buttonTitle = '';
            if (e.shiftKey && e.ctrlKey) {
                button.style.background = "linear-gradient(180deg, #ff6666 0, #aa0000 100%)"; // red
                button.textContent = '🗑️';
                buttonTitle = 'Shift + Ctrl + Click = clear saved ID';
                button.setAttribute('hh_title', buttonTitle);
            } else if (e.shiftKey) {
                button.style.background = "linear-gradient(180deg, #ffdd66 0, #cc9900 100%)"; // yellow
                button.textContent = '✏️';
                buttonTitle = 'Shift + Click = prompt for ID.';
                button.setAttribute('hh_title', buttonTitle);
            } else {
                button.style.background = "linear-gradient(180deg, #00aaff 0, #006688 50%, #005577 51%, #00aaff 100%)"; // default blue
                button.textContent = '📋';
                buttonTitle = 'Click = copy new raids. Shift / Shift + Ctrl available.';
                button.setAttribute('hh_title', buttonTitle);
            }
        }

        insertButton() {
            const notificationButton = document.querySelector('.button-notification-action.notif_button_s');
            if (notificationButton && !document.querySelector('.reminder-copy')) {
                const copyButton = this.createCopyButton();
                notificationButton.parentNode.insertBefore(copyButton, notificationButton);
            }
        }

        run() {
            if (this.hasRun || !this.shouldRun()) {return}

            this._boundInsertButton = this.insertButton.bind(this);
            window.addEventListener('load', this._boundInsertButton);
            if (document.readyState === 'complete') this.insertButton();

            this.hasRun = true
        }
    }

    const allModules = [
        new FriendAndFoes(),
        new RemovePassLock(),
        new LoveRaidsAddon(),
        new LoveRaidsParser()
    ]

    setTimeout(() => {
        if (window.HHPlusPlus) {
            const runScript = () => {
                const { hhPlusPlusConfig } = window

                hhPlusPlusConfig.registerGroup({
                    key: 'JARVIS',
                    name: 'HH Jarvis'
                })
                allModules.forEach(module => {
                    hhPlusPlusConfig.registerModule(module)
                })
                hhPlusPlusConfig.loadConfig()
                hhPlusPlusConfig.runModules()
            }

            if (window.hhPlusPlusConfig) {
                runScript()
            } else {
                $(document).on('hh++-bdsm:loaded', runScript)
            }
        } else if (!(['/integrations/', '/index.php'].some(path => path === location.pathname) && location.hostname.includes('nutaku'))) {
            console.log('WARNING: HH++ BDSM not found. Ending the script here')
        }
    }, 1)
})();
