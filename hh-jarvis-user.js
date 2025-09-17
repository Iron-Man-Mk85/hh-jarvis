// ==UserScript==
// @name           HH J.A.R.V.I.S.
// @version        0.2.0
// @description    QoL for KK games
// @author         Iron Man
// @match          https://*.pornstarharem.com/*
// @match          https://*.hentaiheroes.com/*
// @match          https://*.comixharem.com/*
// @match          https://*.mangarpg.com/*
// @match          https://*.amouragent.com/*
// @run-at         document-idle
// @namespace      https://github.com/Iron-Man-Mk85/hh-jarvis
// @downloadURL    https://raw.githubusercontent.com/Iron-Man-Mk85/hh-jarvis/main/hh-jarvis-user.js
// @updateURL      https://raw.githubusercontent.com/Iron-Man-Mk85/hh-jarvis/main/hh-jarvis-user.js
// @icon           https://www.google.com/s2/favicons?sz=64&domain=hentaiheroes.com
// @grant          none
// ==/UserScript==

/* =================
*  =   Changelog   =
*  =================
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

    if (!$) {
        console.log('WARNING: No jQuery found. Ending script.');
        return
    }

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

    const allModules = [
        new FriendAndFoes(),
        new RemovePassLock()
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
