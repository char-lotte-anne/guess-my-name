# Privacy Explained

What this app does with your data, in plain terms. Nothing here is aspirational —
if something is a limitation, it says so.

## The short version

Playing the quiz sends nothing anywhere. Everything the app needs to guess your
name runs in your browser.

Two things are different, and both are optional and only happen if you choose
them:

- Telling us whether the guess was right
- Typing in your actual first name

Either of those sends **that one submission** to this project's GitHub
repository, encrypted, so the shared model can learn from it. You can play as
many times as you like without ever doing this.

## What stays on your device

Your quiz answers, your feedback, and your name if you gave one are kept in your
browser's `localStorage`. Only pages from this site can read it, and you can
delete it any time by clearing site data.

The app also trains a small personal model in your browser from that history.
It lives in memory for the length of the session and is never saved to disk or
uploaded — closing the tab discards it.

## What leaves your device, and when

Only when you submit feedback or a name. That submission contains:

- Your quiz answers (gender, birth decade, state, preferences, values, languages)
- Whether the guess was right
- Your first name, if you typed one

It does **not** contain a last name, email address, or any account identifier.

It is sent to `/api/create-issue`, a small serverless function, which encrypts it
(AES-256-GCM) and stores it as an issue in this project's public GitHub
repository. Anyone can see that a submission exists. Nobody can read what is
inside it without the key.

Once a week, a GitHub Actions workflow decrypts the collected submissions,
trains a shared model, and publishes it. Your browser downloads that model on
your next visit.

## Who can see what

**Other visitors, search engines, scrapers:** nothing. The stored submissions
are ciphertext.

**The maintainer of this project:** everything you submit. They hold the
decryption key, and they need it to train the model. This is the honest shape of
the trade — encryption protects you from strangers, not from the person running
the project.

**Anyone else:** the data passes through Vercel (which runs the function) and
GitHub (which stores it). Both are third-party companies with their own privacy
policies.

## Limitations worth knowing

- **A first name plus everything else is more identifying than a first name.**
  Your birth decade, gender, languages, and values all travel in the same
  submission. That combination narrows things down much further than a name
  alone. It is the main reason submissions are encrypted.
- **Encrypted data is still published.** It is unreadable today, but it sits in
  a public repository that third parties archive. If the key ever leaked, past
  submissions could be read retroactively. This cannot be undone.
- **Losing the key destroys the data.** There is no recovery path. That is a
  deliberate trade for not storing your name somewhere readable.
- **Submissions from before encryption existed are plaintext.** Roughly issues
  #1–#24, from November 2025, are readable by anyone. They cannot be
  unpublished. If you submitted a name then and want it removed, open an issue
  or contact the maintainer.
- **You can no longer audit your own submission.** Encryption means you cannot
  open the issue and check what was sent about you. That was a deliberate
  trade-off; this document and the source of `api/create-issue.js` are how you
  verify it instead.
- **Client-side rate limiting is not a real limit.** It prevents accidental
  spam, not a determined person.

## Is this using ChatGPT, OpenAI, or another AI service?

Not for anything touching your data. The predictions come from a TensorFlow.js
model that runs in your browser, trained by this project's own GitHub Actions.
No request goes to an external AI provider at any point in the quiz.

Separately, AI coding assistants were used while writing this codebase. That is
a question about how the software was built, not about where your answers go.
The code is open source and you can read it.

## Your control

- Play without submitting anything — the quiz is fully functional
- Give feedback without giving a name
- Clear site data to delete everything stored locally
- Read `api/create-issue.js` to see exactly what a submission contains

## For developers

`LEARNING_ARCHITECTURE.md` covers how the two models work and why the design is
shaped this way.
