/**
 * Turning a pool of candidate names into a ranked shortlist.
 *
 * Pure functions, so the ranking rules can be tested without a database or a
 * DOM. The parts that need either -- fetching candidates, relaxing the search
 * -- stay in quiz-guessing.js.
 */

/**
 * Shown when the database yields nothing usable and the person selected a
 * non-binary or unstated gender.
 *
 * This exists because those searches can legitimately come back empty, and an
 * empty result page is a worse answer than a generic one. It is a last resort:
 * if it appears for ordinary answers, something upstream is broken rather than
 * merely unlucky. It used to be pasted inline at four points in one function,
 * which made that failure mode easy to mistake for normal operation.
 */
const NEUTRAL_FALLBACK_NAMES = Object.freeze([
    { name: 'Alex', gender: 'NB', totalCount: 2000, score: 50, confidence: 50 },
    { name: 'Jordan', gender: 'NB', totalCount: 1800, score: 48, confidence: 48 },
    { name: 'Taylor', gender: 'NB', totalCount: 1600, score: 46, confidence: 46 },
    { name: 'Casey', gender: 'NB', totalCount: 1400, score: 44, confidence: 44 },
    { name: 'Morgan', gender: 'NB', totalCount: 1200, score: 42, confidence: 42 }
].map(Object.freeze));

/** Gender answers arrive as an array from the multi-select, or bare elsewhere. */
function toGenderArray(gender) {
    if (gender === undefined || gender === null || gender === '') return [];
    return Array.isArray(gender) ? gender : [gender];
}

function includesNonBinary(gender) {
    return toGenderArray(gender).some(g => g === 'NB' || g === 'PREFER_NOT_TO_SAY');
}

/**
 * What to show when ranking produced nothing.
 *
 * Only non-binary and unstated selections get the fallback list: those are the
 * searches that come up empty for benign reasons. For a specific gender an
 * empty result means the filters genuinely excluded everything, and inventing
 * neutral names would misrepresent that.
 */
function fallbackFor(gender) {
    return includesNonBinary(gender) ? NEUTRAL_FALLBACK_NAMES.slice() : [];
}

/** First spelling of a name wins; comparison is case-insensitive. */
function dedupeByName(candidates) {
    const seen = new Set();
    const unique = [];

    for (const candidate of candidates || []) {
        const key = candidate && candidate.name ? candidate.name.toLowerCase() : null;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        unique.push(candidate);
    }
    return unique;
}

/**
 * Score, sort, and take the top `count`.
 *
 * Ties break on total historical usage, so the more common name wins when the
 * quiz answers cannot separate two candidates. `score` is injected rather than
 * imported so this stays testable independently of the scoring rules.
 */
function rankCandidates(candidates, score, count = 5) {
    if (!Array.isArray(candidates)) return [];

    return candidates
        .map(candidate => ({ ...candidate, score: score(candidate) }))
        .sort((a, b) => (b.score - a.score) || ((b.totalCount || 0) - (a.totalCount || 0)))
        .slice(0, count);
}

const candidateRankingApi = {
    NEUTRAL_FALLBACK_NAMES, toGenderArray, includesNonBinary,
    fallbackFor, dedupeByName, rankCandidates
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = candidateRankingApi;
}
if (typeof window !== 'undefined') {
    window.CandidateRanking = candidateRankingApi;
}
