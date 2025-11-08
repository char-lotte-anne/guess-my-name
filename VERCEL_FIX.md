# Vercel Deployment Fix

## Problem

The `api/` directory and `vercel.json` are not being deployed because Vercel is configured with Output Directory = `src`, which only deploys files from that directory.

## Solution

The `vercel.json` has been updated to handle this correctly. However, you need to make sure:

1. **The `api/` directory and `vercel.json` are committed to your repository**
   - Check that these files are in your Git repository
   - They should be in the root directory, not in `src/`

2. **Update Vercel Project Settings** (if needed):
   - Go to Vercel Dashboard → Your Project → Settings → General
   - **Root Directory**: `./` (should be root)
   - **Output Directory**: `src` (this is correct)
   - The `vercel.json` will handle the rest

3. **Redeploy**:
   - After committing `api/` and `vercel.json`, push to GitHub
   - Vercel should automatically redeploy
   - Or manually trigger a redeploy in Vercel Dashboard

## Verify Files Are Deployed

After redeploying, check:

1. Go to Vercel Dashboard → Your Project → Deployment → View Files
2. You should see:
   - `/api/create-issue.js` in the deployed files
   - `/vercel.json` in the deployed files
   - All files from `/src/` directory

## If Files Still Don't Appear

1. **Check Git status**:
   ```bash
   git status
   git add api/ vercel.json
   git commit -m "Add Vercel serverless function"
   git push
   ```

2. **Check Vercel build logs**:
   - Look for any errors about missing files
   - The build should show the `api/` directory being processed

3. **Alternative: Move api to src** (if above doesn't work):
   - Move `api/` directory to `src/api/`
   - Update `vercel.json` functions path to `src/api/create-issue.js`
   - Update frontend code to use `/src/api/create-issue` endpoint

## Quick Test

After redeploying, test the API endpoint:
```bash
curl -X POST https://your-vercel-app.vercel.app/api/create-issue \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"Test body","labels":["test"]}'
```

You should get an error about missing GITHUB_TOKEN (which is expected), but NOT a 404 error. If you get 404, the function isn't deployed.

