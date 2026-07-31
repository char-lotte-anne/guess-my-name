# Learning Architecture

How the model works, and why the non-obvious parts are the way they are.
For what users are told about their data, see `PRIVACY_EXPLAINED.md`.

## Two models, not one

**Local.** Trained in the browser on that person's own submissions from
`localStorage`. Never saved, never uploaded — it exists for the length of a
session. This is what lets the app personalise with no backend at all.

**Global.** Trained weekly in GitHub Actions on everyone's submissions and
published as a release. Clients download it on load.

They share `src/feature-encoding.js` and nothing else. The local model is a
personalisation layer; the global model is the shared prior.

## Why GitHub Issues are the database

There is no server and no database. Submissions are stored as issues, and the
training workflow reads them back. The app is a static site plus one serverless
function, and this keeps it that way.

The consequence to keep in mind: **issues are the only durable copy.**
`data/training-data.json` is gitignored and rebuilt from scratch on every run, so
the collector must never close or delete an issue. A failed run then costs
nothing, because nothing was consumed.

## Why submissions are encrypted

The repository is public, so anything posted to an issue is world-readable. A
first name alone is not very identifying; a first name alongside birth decade,
gender, languages, and political values is a good deal more so, and that is one
submission.

`api/create-issue.js` encrypts with AES-256-GCM before posting;
`scripts/collect-training-data.js` decrypts. The key lives in exactly two
places — `TRAINING_DATA_KEY` in the Vercel environment, and the identically named
Actions secret.

- **Lose the key and every past submission is unreadable.** There is no recovery.
- The serverless function **fails closed**: no key means no issue is created,
  rather than falling back to plaintext.
- Issues #1–#24 (Nov 2025) predate this and are plaintext. They cannot be
  unpublished, so they are still read; `parseIssueBody` handles both formats.
- GCM rather than CBC so tampering fails loudly instead of decrypting into
  garbage the trainer would learn from.

## Why the label is `realName`

Training pairs quiz answers with a name. That name comes from `realName` when the
user typed one, falling back to `correctGuess.name` on a confirmed correct guess.

Originally only `correctGuess` was used, which required the app to have already
guessed right. Across the first 24 submissions that produced **zero** usable
examples — nobody had ever confirmed a correct guess — so the model could never
train. Preferring `realName` is what makes a *failed* guess useful: the guess was
wrong, but the answers-to-name pair is still true.

Failures where nobody supplied a name are kept in the dataset but not trained on.
They carry only negative information ("not these three names"), which categorical
crossentropy cannot consume. Using them would need a different loss function.

## Why the encoder is its own file

`src/feature-encoding.js` is loaded as a plain `<script>` in the browser and
`require`d by the trainer. It used to be two copies, which drifted.

A mismatch here fails silently in the worst way: the model trains on inputs laid
out one way and predicts on inputs laid out another, with no error anywhere —
just quietly worse guesses. `tests/encoder-parity.test.js` fails if a second
implementation reappears.

Field offsets are positional. Adding a value to an existing field is safe if it
fits the reserved width; new fields, wider fields, or reordering invalidate every
previously trained model. Bump `FEATURE_LAYOUT_VERSION` when that happens —
clients compare it against the release and ignore models they can no longer feed
correctly.

## Why a model can be refused

`MIN_UNIQUE_NAMES` (currently 10) stops the workflow publishing a model trained
on too few distinct names. A classifier that knows four names will recommend
those four to everyone, confidently, which is worse than the rule-based guesser
it feeds into. Below the threshold nothing is published and the rules stand alone.

The client refuses a release that is missing `name-index.json`, or whose
`featureLayoutVersion` does not match. Both cases fall back to the local model.

## Interpreting training output

`name-index.json` ships with each release because the model outputs a bare
probability per class. `names[i]` is the label for output `i`; without it the
predictions are indices into an unknown dictionary.

Two numbers in the training log that mislead:

- **Accuracy under a few hundred examples is training accuracy on a set the model
  has memorised.** It says nothing about new visitors.
- **A validation split needs shuffling first.** tfjs slices the validation set
  off the end of the array *before* shuffling, and submissions arrive in
  chronological order, so an unshuffled split lands on a contiguous block that
  often shares one name and reports a perfect score. `shuffleTogether` runs
  first, and validation is skipped entirely below `MIN_EXAMPLES_FOR_VALIDATION`.
