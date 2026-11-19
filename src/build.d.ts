declare const USERSCRIPT_VERSION: string;
declare const USERSCRIPT_CHANNEL: 'Dev' | 'Stable';

declare module '*.css' {
    const css: string;
    export default css;
}

declare module '*.md' {
    const notes: readonly { version: string; changes: readonly string[] }[];
    export default notes;
}
