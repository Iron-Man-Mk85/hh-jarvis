export function getLoveRaids() {
    return typeof love_raids !== 'undefined' && Array.isArray(love_raids) ? love_raids : [];
}

export async function getGirlDictionary() {
    try {
        return await window.HHPlusPlus.Helpers.getGirlDictionary();
    } catch (err) {
        console.warn('Jarvis could not load the HH++ girl dictionary:', err);
        return null;
    }
}
