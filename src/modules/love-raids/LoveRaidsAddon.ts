import { HHModule } from '../../HHModule';
import type { ModuleSettings } from '../../HHModule';
import { currentPage } from '../../game';
import { getGirlDictionary } from './gameData';

export class LoveRaidsAddon extends HHModule {
    private readonly rarityColors: Record<string, string>;

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

    async run({ raid_id, skin, names, color, fight_icon, shadows }: ModuleSettings) {
        if (this.hasRun || !this.shouldRun()) {return}

        const raids = (typeof love_raids !== 'undefined' && Array.isArray(love_raids)) ? love_raids : [];
        if (!raids.length) return;
        this.hasRun = true

        const girlDict = await getGirlDictionary();
        const raidsById = new Map(raids.map(raid => [String(raid.id_raid), raid]));

        document.querySelectorAll('.raid-card[id_raid]').forEach(raidCard => {
            const raid = raidsById.get(raidCard.getAttribute('id_raid') ?? '');
            if (!raid || raid.id_girl == null) return;

            const { name, rarity, shards = 0 } = girlDict?.get(String(raid.id_girl)) || {};
            const haremLink = window.HHPlusPlus.Helpers.getHref(`/characters/${raid.id_girl}`);
            const raidNameElem = raidCard.querySelector('.raid-name > span > span');
            const name_label = (names && name) || raidNameElem?.textContent?.trim() || raid.event_name || raid.girl_data?.name || '';
            const raid_id_label = raid_id ? `(${raid.id_raid})` : '';
            const skin_label = (skin && Array.isArray(raid?.girl_data?.grade_skins) && raid.girl_data.grade_skins.length > 0) ? '👙' : '';

            const displayParts = [];
            if (raid_id) displayParts.push(raid_id_label);
            displayParts.push(name_label);
            if (skin) displayParts.push(skin_label);
            const displayLabel = displayParts.join(' ').trim();

            if (raidNameElem && displayLabel) {
                raidNameElem.textContent = displayLabel;
            }

            const objectives = raidCard.querySelectorAll('.classic-girl');
            const girl = objectives[0];
            if (girl) {
                const girlNameElem = girl.querySelector('.girl-name');
                if (girlNameElem) {
                    let link = girlNameElem.querySelector('a');
                    if (!link) {
                        link = document.createElement('a');
                        link.className = 'hh-girl-link';
                        while (girlNameElem.firstChild) link.appendChild(girlNameElem.firstChild);
                        girlNameElem.appendChild(link);
                    }
                    if (displayLabel) link.textContent = displayLabel;
                    link.href = haremLink;
                }

                if (shards === 100) {
                    const objElem = girl.querySelector<HTMLElement>('.objective');
                    if (objElem) {
                        objElem.innerText = `I'm already attracted to you. Find me in your Harem!`;
                    }
                }
            }

            if (color && rarity) {
                const raidNameContainer = raidCard.querySelector<HTMLElement>('.raid-name');
                if (raidNameContainer) {
                    raidNameContainer.style.color = this.rarityColors[rarity] || '';
                }
            }

            if (fight_icon) {
                const fightIcon = raidCard.querySelector<HTMLElement>('.hudBattlePts_mix_icn');
                if (fightIcon) {
                    fightIcon.style.backgroundImage = 'url(/images/pictures/design/ic_energy_fight.png)';
                    fightIcon.style.backgroundSize = '24px';
                }
            }

            if (shadows) {
                const leftImage = raidCard.querySelector<HTMLImageElement>('.girl-img.left');
                if (leftImage) {
                    leftImage.src = leftImage.src.replace('-black', '');
                }
                if (raidCard.classList.contains('multiple-girl')) {
                    const rightImage = raidCard.querySelector<HTMLImageElement>('.girl-img.right');
                    if (rightImage) {
                        // rightImage.src = rightImage.src.replace('avb0.png', 'grade_skins/grade_skin1.png');
                        rightImage.src = rightImage.src.replace('-black', '');
                    }
                }
                raidCard.querySelectorAll('.eye').forEach(e => e.remove());
            }
        });
    }
}
