/**
 * Shaping submissions into training examples.
 *
 * Kept separate from train-model.js so tests can exercise it without loading
 * TensorFlow, and separate from collect-training-data.js so the same rules
 * apply on both sides of the pipeline.
 */

const { decryptPayload, isEnvelope } = require('./training-crypto');

/**
 * Read one issue body into a submission object.
 *
 * Two formats are in circulation and both must keep working: encrypted
 * envelopes, and the plaintext payloads written before encryption existed
 * (issues #1-#24, Nov 2025). Those are readable by anyone and cannot be
 * un-published, so they are still used rather than discarded.
 *
 * Returns null when the body holds no payload at all. Throws when a payload is
 * present but unreadable, so the caller can count failures instead of silently
 * training on less data than it thinks.
 */
function parseIssueBody(body, keyHex) {
    const match = typeof body === 'string' && body.match(/```json\s*([\s\S]*?)\s*```/);
    if (!match) return null;

    const parsed = JSON.parse(match[1]);

    if (isEnvelope(parsed)) {
        if (!keyHex) throw new Error('payload is encrypted but no key was provided');
        return JSON.parse(decryptPayload(parsed, keyHex));
    }
    return parsed;
}

/**
 * Which name should this submission teach the model to predict?
 *
 * realName wins because the user typed it themselves; correctGuess is only
 * available when we happened to guess right. Preferring realName is what makes
 * failed guesses useful -- the guess was wrong, but the answers-to-name pair is
 * still correct signal, and failures are most of the dataset.
 *
 * Returns null for failures where nobody gave a name. Those carry only negative
 * information ("not these three"), which categorical crossentropy cannot
 * consume. They stay in the dataset for a future approach that can.
 */
function getTrainingLabel(submission) {
    if (typeof submission.realName === 'string' && submission.realName.trim()) {
        return submission.realName.trim();
    }
    if (submission.success === true && submission.correctGuess && submission.correctGuess.name) {
        return submission.correctGuess.name;
    }
    return null;
}

/** A submission is usable when we know both the inputs and the answer. */
function isUsableExample(submission) {
    return Boolean(submission && submission.answers && submission.timestamp && getTrainingLabel(submission));
}

/**
 * Assign each distinct name a stable output index.
 *
 * Written as `name in index` rather than a truthiness test: the first name gets
 * index 0, and `if (!index[name])` treats that as absent, reassigning it a new
 * index on every lookup. That silently pointed the first name's training labels
 * at the wrong class.
 */
function buildNameIndex(names) {
    const index = {};
    for (const name of names) {
        if (!(name in index)) {
            index[name] = Object.keys(index).length;
        }
    }
    return index;
}

/**
 * Drop repeat submissions of the same answers at the same instant.
 *
 * Two people can legitimately give identical answers, so the timestamp is part
 * of the key; only an exact duplicate of both is treated as the same event.
 */
function dedupe(submissions) {
    const seen = new Set();
    return submissions.filter(item => {
        const key = `${item.timestamp}_${JSON.stringify(item.answers)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

module.exports = { parseIssueBody, getTrainingLabel, isUsableExample, buildNameIndex, dedupe };
