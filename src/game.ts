export let $: JQueryStatic;
export let currentPage: string;

export function initGame(jQuery: JQueryStatic) {
    $ = jQuery;
    currentPage = window.location.pathname;
}
