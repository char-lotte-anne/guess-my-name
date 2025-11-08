# Vercel Serverless Function Setup Guide

This guide will help you set up the Vercel serverless function to enable GitHub Issues creation for training data collection.

## Why Vercel?

Vercel is the recommended solution because:
- ✅ Free tier is generous (100GB bandwidth, 100 hours function execution per month)
- ✅ Easy to set up and deploy
- ✅ Works seamlessly with GitHub Pages or any static hosting
- ✅ Automatic HTTPS and CDN
- ✅ Simple environment variable management

## Prerequisites

1. A GitHub account
2. A Vercel account (free) - sign up at [vercel.com](https://vercel.com)
3. A GitHub Personal Access Token

## Step 1: Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Direct link: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a descriptive name: `Guess My Name - Issue Creation`
4. Set expiration (recommended: 90 days or "No expiration" for automation)
5. Select the following scope:
   - ✅ `repo` - Full control of private repositories
     - This includes creating issues in public repos
6. Click "Generate token"
7. **IMPORTANT**: Copy the token immediately - you won't be able to see it again!
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository:
   - Click "Import Git Repository"
   - Select `char-lotte-anne/guess-my-name` (or your repo)
   - Click "Import"
4. Configure the project:
   - **Framework Preset**: Other (or leave as default)
   - **Root Directory**: `./` (root)
   - **Build Command**: Leave empty (or `echo 'No build needed'`)
   - **Output Directory**: `src` (or wherever your `index.html` is)
   - **IMPORTANT**: Make sure `api/` directory and `vercel.json` are in the repository root (not in `src/`)
5. **Add Environment Variables** (IMPORTANT):
   - Click "Environment Variables"
   - Add the following:
     - **Name**: `GITHUB_TOKEN`
     - **Value**: (paste your GitHub token from Step 1)
     - **Environment**: Production, Preview, Development (select all)
     - Click "Save"
   - Optionally add (if different from defaults):
     - **Name**: `GITHUB_USERNAME`
     - **Value**: `char-lotte-anne`
     - **Name**: `REPO_NAME`
     - **Value**: `guess-my-name`
6. Click "Deploy"
7. Wait for deployment to complete (usually 1-2 minutes)

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Navigate to your project directory:
   ```bash
   cd /path/to/guess-my-name
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Set environment variables:
   ```bash
   vercel env add GITHUB_TOKEN
   # Paste your token when prompted
   # Select: Production, Preview, Development
   
   # Optional (if different from defaults):
   vercel env add GITHUB_USERNAME
   vercel env add REPO_NAME
   ```

6. Redeploy to apply environment variables:
   ```bash
   vercel --prod
   ```

## Step 3: Update Your Site Configuration

After deployment, Vercel will give you a URL like: `https://guess-my-name.vercel.app`

### If you're using GitHub Pages:

You have two options:

**Option 1: Use Vercel as your primary hosting** (Recommended)
- Update your GitHub Pages settings to point to Vercel
- Or simply use the Vercel URL as your site URL
- Vercel provides free custom domains

**Option 2: Keep GitHub Pages, use Vercel API endpoint**
- Update `src/script.js` to use the Vercel API endpoint:
  ```javascript
  // In sendTrainingDataToGitHub function, change:
  const apiEndpoint = 'https://your-vercel-app.vercel.app/api/create-issue';
  ```

### If you're using Vercel for hosting:

No changes needed! The relative path `/api/create-issue` will work automatically.

## Step 4: Test the Setup

1. Open your deployed site
2. Complete a quiz and enter your name
3. Open browser console (F12)
4. You should see:
   - `📤 Sending training data to GitHub via serverless function...`
   - `✅ Training data sent to GitHub successfully!`
5. Check your GitHub Issues tab - you should see a new issue with the `training-data` label

## Troubleshooting

### Issue: "Server configuration error - GitHub token not configured"

**Solution**: Make sure you've added the `GITHUB_TOKEN` environment variable in Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `GITHUB_TOKEN` is set
3. Redeploy the project

### Issue: "GitHub API error: 401 Unauthorized"

**Solution**: Your GitHub token might be invalid or expired:
1. Generate a new token (see Step 1)
2. Update the `GITHUB_TOKEN` environment variable in Vercel
3. Redeploy

### Issue: "GitHub API error: 404 Not Found"

**Solution**: Check your repository name and username:
1. Verify `GITHUB_USERNAME` and `REPO_NAME` environment variables
2. Make sure the repository exists and is accessible
3. Check that Issues are enabled in the repository settings

### Issue: Function times out

**Solution**: The function has a 10-second timeout. If it's timing out:
1. Check Vercel function logs for errors
2. Verify your GitHub token has the correct permissions
3. Check network connectivity

### Issue: CORS errors

**Solution**: The `vercel.json` file includes CORS headers. If you still see CORS errors:
1. Make sure `vercel.json` is in your project root
2. Redeploy the project
3. Check that the API endpoint URL is correct

## Monitoring

### View Function Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Click on `api/create-issue`
3. View real-time logs and errors

### Check Function Metrics

1. Go to Vercel Dashboard → Your Project → Analytics
2. View function invocations, duration, and errors

## Security Best Practices

1. **Never commit your GitHub token** to the repository
2. **Use environment variables** for all sensitive data
3. **Rotate tokens periodically** (every 90 days recommended)
4. **Use token with minimal required scopes** (`repo` scope is needed for creating issues)
5. **Monitor function logs** for suspicious activity

## Cost

Vercel's free tier includes:
- 100GB bandwidth per month
- 100 hours of function execution per month
- Unlimited requests

For a typical usage scenario (hundreds of quiz completions per month), this is more than sufficient and completely free.

## Next Steps

Once the serverless function is set up and working:

1. ✅ Test with a few quiz completions
2. ✅ Verify issues are being created in GitHub
3. ✅ Run the GitHub Actions workflow to test data collection
4. ✅ Set it and forget it! 🎉

The system is now fully automated - users provide feedback, data flows through the serverless function to GitHub Issues, and the model trains automatically every week!

