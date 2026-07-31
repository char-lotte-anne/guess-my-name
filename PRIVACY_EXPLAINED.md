# Privacy & Learning Mechanism Explained

## How the Algorithm Learns Without Sending Data to Servers

This document explains how the application can learn from user interactions while maintaining complete privacy.

**Important:** This application uses our own custom-built TensorFlow.js machine learning implementation. **No data is sent to ChatGPT, OpenAI, or any commercial AI services.** All AI/ML processing happens locally in your browser or on GitHub (for global model training).

## The Learning Process

### 1. Data Collection (Local Only)
When you interact with the quiz:
- Your quiz answers (gender, birth decade, state, preferences, etc.)
- Your feedback (whether predictions were correct/wrong)
- Your optional real name (if you choose to provide it)

**All of this data is stored in your browser's localStorage** - a storage mechanism that only your browser can access.

### 2. Local Storage
- **Location**: Browser's localStorage (not cookies, not server storage)
- **Scope**: Only accessible by scripts from the same origin (this website)
- **Persistence**: Data persists across browser sessions until you clear it
- **Limit**: Maximum 1000 training examples stored (oldest are automatically removed)

### 3. Machine Learning Training (In-Memory Only)
Our custom TensorFlow.js neural network:
- Loads training data from localStorage
- Trains the model in your browser's memory
- Updates model weights based on your feedback
- **The trained model is NOT saved** - it only exists in memory during your session
- **No data is sent to ChatGPT, OpenAI, or any commercial AI services** - this is our own implementation

### 4. What Gets Stored vs. What Doesn't

**Stored in localStorage:**
- Quiz answers (anonymized - no identifying information)
- Feedback (correct/wrong)
- Optional real name (if provided)
- Timestamps

**NOT stored:**
- The trained ML model weights
- Any data sent to external servers
- IP addresses or device identifiers
- Session tracking information

## Privacy Guarantees

### ✅ What "Local Learning" Means
- All data stays on your device
- The ML model trains on your device
- No data is transmitted to any server
- No third parties receive your information

### ✅ What "Not Stored" Means
- The trained model is not saved to disk
- Model weights exist only in browser memory
- When you close the browser, the trained model is lost
- Each session starts with a fresh model (though it can train on stored data)

### ✅ Your Control
- You can clear localStorage anytime to delete all stored data
- You can use the quiz without providing your real name
- You can disable JavaScript to prevent any data storage
- All data is stored in standard browser storage you can inspect/delete

## Technical Details

### Storage Format
```javascript
// Example of what's stored in localStorage
{
  "nameGuessingTrainingData": [
    {
      "timestamp": 1234567890,
      "answers": {
        "gender": "F",
        "decade": 1990,
        "state": "CA",
        // ... other quiz answers
      },
      "realName": "Alice", // optional
      "success": true,
      "correctGuess": { "name": "Alice", "confidence": 85 }
    }
    // ... up to 1000 entries
  ]
}
```

### Training Process
1. User completes quiz and provides feedback
2. Data stored in localStorage
3. On next quiz session, model loads stored data
4. Model trains on accumulated data (minimum 10 examples required)
5. Trained model used for predictions
6. Model exists only in memory - not saved

## Why This Approach?

### Privacy-First Design
- No server means no data breaches possible
- No third-party services means no data sharing
- User has complete control over their data

### Limitations
- Model doesn't persist across browser restarts (starts fresh each time)
- Learning is per-device (doesn't benefit from other users' data)
- Limited to 1000 training examples per device

### Benefits
- Complete privacy
- No external dependencies for learning
- User controls all their data
- No risk of data leaks or breaches

## FAQ

**Q: Does my data leave my computer?**  
A: For local learning, no - everything stays in your browser's localStorage. However, if you provide feedback (correct/wrong guesses), training data (quiz answers + success/failure + your first name if you provide it) may be sent to GitHub Issues for global model training. This data is encrypted (AES-256-GCM) and stored as GitHub Issues; other visitors cannot read it, though the project maintainer can. Only first names are sent (no last names, emails, or other identifying info). You can use the app fully without providing your name or participating in global learning.

**Q: Can the developer see my data?**  
A: Your localStorage, no — that never leaves your browser and there is no server that can reach it. But if you submit feedback or your first name, that specific submission *is* sent to the project's repository, and the maintainer can decrypt and read it. They need to in order to train the model. Everything you keep to yourself stays on your device; everything you actively submit is visible to them.

**Q: What if I clear my browser data?**  
A: All stored training data will be deleted, and the model will start fresh.

**Q: Does the model improve for other users based on my data?**  
A: Optionally, yes - but only if you provide feedback. When you give feedback (correct/wrong guesses), training data (quiz answers + success/failure + your first name if you provide it) may be sent to GitHub Issues. This data is used to train a global model that improves predictions for all users. Your first name (if you provide it) is included because it's the most valuable data for training - it helps the model learn which names correspond to which characteristics. This data is encrypted before being stored, so it is not readable by other visitors. You can still use the app fully without providing your name or participating in global learning - your local learning will still work perfectly.

**Q: Is the trained model saved?**  
A: No. The model only exists in memory during your browser session.

**Q: Is this using ChatGPT, OpenAI, or other commercial AI services?**  
A: No. This is our own custom-built TensorFlow.js implementation. All AI/ML processing happens locally in your browser. No data is sent to ChatGPT, OpenAI, or any commercial AI services. The code is open source and you can inspect it yourself.

## Summary

The application learns in two ways:

**Local Learning (Primary):**
1. Storing your quiz data and feedback locally in your browser
2. Training the ML model on this local data
3. Using the trained model for personalized predictions
4. Keeping everything on your device - your data stays private

**Global Learning (Optional):**
1. When you provide feedback, training data (quiz answers + success/failure + your first name if you provide it) may be sent to GitHub Issues
2. A global model is trained weekly from aggregated data from all users
3. The global model is automatically downloaded from GitHub Releases
4. This improves predictions for all users. Your first name (if provided) helps the model learn which names correspond to which characteristics - this is the most valuable training data. Note: This data is encrypted before it is stored.

This provides the benefits of machine learning with both personalization and global improvements while maintaining privacy and user control.

## Important Note: Per-User vs. Global Learning

**Primary Design: Per-User Learning**
- Each user's model learns from their own data stored locally
- This provides personalized predictions based on your feedback
- All learning happens on your device - completely private

**Optional: Global Learning (Privacy-Preserving)**
The application now supports optional global learning to improve predictions for all users:

1. **Automatic Data Sharing**: When you provide feedback (correct/wrong guesses), training data may be sent to GitHub Issues for global model training
2. **What Gets Sent**: 
   - Quiz answers (gender, decade, state, preferences)
   - Feedback (success/failure)
   - **First name (if you voluntarily provide it)** - This is the most valuable data for training the model to learn which names correspond to which characteristics
3. **What Doesn't Get Sent**: Last names, email addresses, IP addresses, device identifiers, or any other identifying information beyond first names
4. **Encrypted Before Storage**: Training data is stored as GitHub Issues in a public repository, but the contents are encrypted with AES-256-GCM before they are posted. Anyone can see that an issue exists; nobody can read what is inside it without the key, which is held only by the maintainer and the training workflow.
5. **Automatic Model Updates**: A global model is trained weekly from aggregated data and automatically downloaded from GitHub Releases to improve predictions for all users

**Privacy Guarantees for Global Learning:**
- ✅ Only quiz answers, feedback, and first names (if voluntarily provided) are sent
- ✅ No last names, emails, IP addresses, device IDs, or tracking information
- ✅ Contents are encrypted before being published, so they are not readable by other visitors, search engines, or scrapers
- ✅ You can still use the app fully without providing your name or participating in global learning
- ✅ Providing your name is completely optional - the app works great without it

**Being straight with you about the limits:**
- ⚠️ Encryption protects your data from *other people*, not from the maintainer of this project. They hold the key and can read every submission. That is how the model gets trained.
- ⚠️ Encrypted data is still *published* in a public repository. It is unreadable today, but it is permanently archived by third parties. If the key were ever leaked, past submissions could be read retroactively.
- ⚠️ Submissions made before encryption was added (roughly issues #1–#24, Nov 2025) were stored in **plaintext** and are readable by anyone. If you submitted a name during that period and want it removed, open an issue or contact the maintainer.
- ⚠️ A first name on its own is not very identifying. A first name combined with your birth decade, gender, languages, and values — which are all in the same submission — is considerably more so. This is the main reason the data is now encrypted.
- ⚠️ Encryption means you can no longer independently audit what is being collected about you. The trade-off was deliberate: this document and the source code in `api/create-issue.js` are how you verify what is sent.

**How It Works:**
1. You complete a quiz and provide feedback (and optionally your first name)
2. Training data (quiz answers + success/failure + first name if provided) is sent to GitHub Issues
3. GitHub Actions automatically collects this data weekly
4. A global model is trained on aggregated data (including first names, which are the most valuable training data)
5. The trained model is published as a GitHub Release
6. All users automatically download the latest global model on their next visit

**You're Always in Control:**
- Local learning always happens first (your data stays on your device)
- Global learning is optional and only includes first names if you voluntarily provide them
- You can clear localStorage anytime to delete all local data
- The app works perfectly fine without providing your name or participating in global learning

The rule-based system (70% of predictions) provides core accuracy, while the ML component (30%) provides both personalization per user and global improvements from aggregated data.

