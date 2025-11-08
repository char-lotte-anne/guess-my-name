# Fix: API Directory Not Deploying

## Problem

The `api/` directory is not being deployed because Vercel's Output Directory setting (`src`) only deploys files from that directory. Serverless functions need to be at the root level.

## Solution

You have two options:

### Option 1: Remove Output Directory Setting (Recommended)

1. Go to Vercel Dashboard → Your Project → Settings → General
2. Scroll to "Build & Development Settings"
3. **Clear the "Output Directory" field** (leave it empty)
4. Save changes
5. Redeploy

The `vercel.json` will handle routing static files from `src/` while keeping `api/` at the root.

### Option 2: Keep Output Directory, Move API

If you want to keep the Output Directory setting, move the API function:

1. Move `api/` to `src/api/`
2. Update `vercel.json`:
   ```json
   {
     "functions": {
       "src/api/create-issue.js": {
         "maxDuration": 10
       }
     }
   }
   ```
3. Update frontend code to use `/src/api/create-issue` endpoint
4. Redeploy

**However, Option 1 is recommended** because it's cleaner and follows Vercel best practices.

## After Fixing

After removing the Output Directory setting and redeploying:

1. Check deployed files - you should see:
   - `/api/create-issue.js`
   - `/vercel.json`
   - All files from `/src/`

2. Test the API endpoint:
   ```bash
   curl -X POST https://your-app.vercel.app/api/create-issue \
     -H "Content-Type: application/json" \
     -d '{"title":"Test","body":"Test"}'
   ```

3. You should get an error about missing GITHUB_TOKEN (expected), NOT a 404.

