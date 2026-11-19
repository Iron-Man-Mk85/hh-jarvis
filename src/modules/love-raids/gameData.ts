export async function getGirlDictionary() {
    try {
        return await window.HHPlusPlus.Helpers.getGirlDictionary();
    } catch (err) {
        console.warn('Jarvis could not load the HH++ girl dictionary:', err);
        return null;
    }
}
