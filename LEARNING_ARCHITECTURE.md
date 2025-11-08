# Machine Learning Architecture & Design Decisions

## Current Design: Privacy-First, Per-User Learning

### How It Works Now

The current implementation is designed with **privacy as the top priority**:

1. **Per-User Learning**: Each user's model learns only from their own data
2. **No Data Transmission**: All data stays on the user's device
3. **No Model Persistence**: The trained model exists only in memory during the session
4. **No Cross-User Learning**: Users don't benefit from other users' data

### Limitations of Current Approach

- ❌ **No Global Learning**: The model doesn't improve across all users
- ❌ **Model Resets**: Each session starts with a fresh model (though it can train on stored user data)
- ❌ **Isolated Learning**: Each user's model only learns from their own feedback
- ❌ **Limited Training Data**: Each user only has their own data (up to 1000 examples)

### Why This Design?

This is an **intentional design choice** prioritizing:
- ✅ Complete user privacy
- ✅ No server costs or infrastructure
- ✅ No data breaches possible
- ✅ User control over their data
- ✅ Works entirely client-side (can be hosted on GitHub Pages)

## Options for Global Learning

If you want the model to learn and improve across all users, you have several options:

### Option 1: Backend with Aggregated Data (Traditional Approach)

**How it works:**
- Frontend hosted on GitHub Pages (static files)
- Backend hosted on separate service (API + database)
- Users send anonymized training data to backend API
- Backend aggregates data from all users
- Backend trains a global model
- Backend serves the trained model to all users

**Pros:**
- ✅ True global learning
- ✅ Model improves for all users
- ✅ Can use more training data
- ✅ Frontend can still be on GitHub Pages (free)
- ✅ Many free/cheap backend options available

**Cons:**
- ❌ Requires backend infrastructure (server, database)
- ❌ Data leaves user devices
- ❌ Privacy concerns (even if anonymized)
- ❌ Backend costs (though many free tiers available)
- ❌ More complex architecture (two services to manage)

**Can You Use GitHub Pages?**
- ✅ **Yes for frontend** - GitHub Pages can host your HTML/CSS/JS
- ❌ **No for backend** - GitHub Pages cannot run server-side code
- ✅ **Solution** - Use GitHub Pages for frontend + separate backend service

**Backend Options That Work with GitHub Pages:**

1. **Firebase (Google)** - Free tier available
   - Firestore database
   - Cloud Functions for training
   - Cloud Storage for model files
   - Easy to set up

2. **Supabase** - Open source Firebase alternative
   - PostgreSQL database
   - Edge Functions for training
   - Storage for model files
   - Generous free tier

3. **Vercel/Netlify Functions** - Serverless functions
   - Can host frontend too (but GitHub Pages works)
   - Serverless functions for API
   - Need separate database (e.g., PlanetScale, Supabase)

4. **Railway/Render** - Full backend hosting
   - Can host Node.js/Python backend
   - PostgreSQL database
   - Free tiers available

5. **GitHub Actions + GitHub Releases** (Hybrid)
   - Frontend on GitHub Pages
   - GitHub Actions periodically trains model
   - Model saved as GitHub Release asset
   - Frontend downloads from releases
   - No real-time API, but works with static hosting

**Implementation Example (Firebase):**
```javascript
// Frontend (hosted on GitHub Pages)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Send training data to Firebase
const db = getFirestore();
await addDoc(collection(db, 'trainingData'), {
  answers: {...},
  correctGuess: {...},
  timestamp: Date.now(),
  // No personally identifiable information
});

// Load trained model from Firebase Storage
const modelUrl = await getModelUrl(); // From Firebase Storage
const model = await tf.loadLayersModel(modelUrl);
```

**Implementation Example (GitHub Actions - No Backend Needed):**
```yaml
# .github/workflows/train-model.yml
name: Train Model
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
  workflow_dispatch:  # Manual trigger

jobs:
  train:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Train model
        run: |
          # Download training data from somewhere
          # Train model
          # Save model weights
      - name: Create Release
        uses: actions/create-release@v1
        # Upload model as release asset
```

### Option 2: Federated Learning (Privacy-Preserving)

**How it works:**
- Users train models locally on their data
- Users send only model weight updates (not raw data) to server
- Server aggregates weight updates
- Server distributes improved global model

**Pros:**
- ✅ Privacy-preserving (raw data never leaves device)
- ✅ Global learning possible
- ✅ Better than Option 1 for privacy

**Cons:**
- ❌ More complex to implement
- ❌ Still requires backend
- ❌ More computationally intensive
- ❌ Still some privacy concerns (weight updates can leak information)

**Implementation:**
```javascript
// User trains model locally
const localModel = await trainLocalModel(userData);

// Extract weight updates (deltas)
const weightUpdates = extractWeightDeltas(localModel);

// Send only weight updates (not data)
fetch('/api/federated-update', {
  method: 'POST',
  body: JSON.stringify(weightUpdates)
});
```

### Option 3: Opt-In Data Sharing (Hybrid)

**How it works:**
- Default: Privacy-first (current behavior)
- Optional: Users can opt-in to share anonymized data
- Opt-in users contribute to global model
- Global model available to all users

**Pros:**
- ✅ Respects user choice
- ✅ Privacy-first by default
- ✅ Global learning from opt-in users
- ✅ Can still work mostly client-side

**Cons:**
- ❌ Still requires backend for opt-in users
- ❌ Two-tier system (opt-in vs opt-out)
- ❌ More complex implementation

**Implementation:**
```javascript
// User chooses to opt-in
if (userOptedIn) {
  // Send anonymized data to server
  sendToServer(anonymizedData);
}

// Load global model if available
const globalModel = await loadGlobalModel();
```

### Option 4: Pre-Trained Model Updates (Static Approach)

**How it works:**
- Periodically retrain model on aggregated data (manually or via CI/CD)
- Commit updated model weights to repository
- Users download latest model on page load
- No real-time learning, but model improves over time

**Pros:**
- ✅ Can use GitHub for hosting
- ✅ No backend needed
- ✅ Model improves over time
- ✅ Still privacy-focused (no real-time data collection)

**Cons:**
- ❌ Requires manual data collection/aggregation
- ❌ Not real-time learning
- ❌ Model file size increases
- ❌ Still need way to collect data

## Recommendation

### For GitHub Pages Hosting (Current Setup)

**Keep the current privacy-first approach** and update documentation to clarify:
- This is a **design choice**, not a limitation
- The model learns **per-user** for privacy
- The rule-based system (70% of predictions) provides the core accuracy
- ML component (30%) provides personalization per user

### If You Want Global Learning with GitHub Pages

**Yes, you can use Option 1 with GitHub Pages!** Here's how:

**Architecture:**
- Frontend: GitHub Pages (static files)
- Backend: Separate service (Firebase, Supabase, etc.)

**Best options:**

1. **Firebase + GitHub Pages** (Recommended)
   - Frontend on GitHub Pages (free)
   - Backend on Firebase (free tier available)
   - Real-time global learning
   - Easy to set up
   - See [BACKEND_OPTIONS.md](BACKEND_OPTIONS.md) for detailed setup

2. **GitHub Actions + Releases** (No external backend)
   - Frontend on GitHub Pages
   - Model training via GitHub Actions (scheduled)
   - Model served via GitHub Releases
   - Not real-time, but completely free
   - See [BACKEND_OPTIONS.md](BACKEND_OPTIONS.md) for setup

3. **Supabase + GitHub Pages**
   - Similar to Firebase but open source
   - PostgreSQL database
   - Good free tier

**See [BACKEND_OPTIONS.md](BACKEND_OPTIONS.md) for complete implementation guide.**

## Code Changes Needed for Global Learning

### To Save Model Weights (Option 4)

```javascript
// After training
const modelWeights = await this.model.getWeights();
const modelJson = await this.model.save('indexeddb://model-v1');

// Load saved model
this.model = await tf.loadLayersModel('indexeddb://model-v1');
```

### To Send Data to Server (Option 1 or 3)

```javascript
// In storeTrainingData()
if (userOptedIn) {
  fetch('/api/training-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answers: data.answers,
      correctGuess: data.correctGuess,
      // No realName or identifying info
    })
  });
}
```

## Summary

**Current State:**
- Privacy-first design
- Per-user learning only
- No global improvement
- Works entirely client-side

**If You Want Global Learning:**
- Need to decide: Privacy vs. Global Learning
- Options range from simple (pre-trained updates) to complex (federated learning)
- All options require some compromise on privacy or complexity

**Recommendation:**
- Keep current design for now (it's a feature, not a bug!)
- Update documentation to clarify this is intentional
- Consider Option 4 (pre-trained updates) if you want gradual improvement without real-time data collection

