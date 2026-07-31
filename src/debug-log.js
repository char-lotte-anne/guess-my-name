/**
 * Diagnostic logging, off unless asked for.
 *
 * Enable with ?debug=1 on any URL, or `localStorage.debug = '1'` to keep it on
 * across reloads. The tracing here is genuinely useful when a prediction looks
 * wrong -- it just should not run in a visitor's console by default.
 *
 * Errors and warnings are always shown: those indicate something is broken and
 * suppressing them would hide real failures.
 */

const DEBUG = (() => {
    try {
        const fromQuery = new URLSearchParams(window.location.search).get('debug');
        if (fromQuery !== null) return fromQuery !== '0';
        return window.localStorage.getItem('debug') === '1';
    } catch {
        // Private browsing can throw on localStorage access.
        return false;
    }
})();

const log = {
    debug: DEBUG ? console.log.bind(console) : () => {},
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    enabled: DEBUG
};

if (typeof window !== 'undefined') {
    window.log = log;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = log;
}
