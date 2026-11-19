export const LS_CONFIG_NAME = 'HHStark';

export function lsGet(key: string, ls_name = LS_CONFIG_NAME): unknown {
    return JSON.parse(localStorage.getItem(`${ls_name}${key}`) ?? 'null')
}
export function lsSet(key: string, value: unknown, ls_name = LS_CONFIG_NAME) {
    return localStorage.setItem(`${ls_name}${key}`, JSON.stringify(value))
}
export function lsRm(key: string, ls_name = LS_CONFIG_NAME) {
    return localStorage.removeItem(`${ls_name}${key}`)
}
