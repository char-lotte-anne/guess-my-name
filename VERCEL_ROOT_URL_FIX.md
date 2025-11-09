# Fix Root URL Not Working

## Current Issue

The site only works at `https://guess-my-name-chi.vercel.app/src/index.html` but not at the root `https://guess-my-name-chi.vercel.app/`.

## Solution

The rewrites in `vercel.json` should handle this, but you may need to check your Vercel project settings.

### Step 1: Check Vercel Project Settings

1. Go to Vercel Dashboard → Your Project → Settings → General
2. Scroll to "Build & Development Settings"
3. Check the following:
   - **Root Directory**: Should be `./` (root) or empty
   - **Output Directory**: Should be empty (not `src`)
   - **Build Command**: Can be empty or `echo 'No build needed'`
   - **Framework Preset**: Can be "Other" or left as default

### Step 2: Verify vercel.json

The `vercel.json` should have:
- API routes handled first: `/api/(.*)` → `/api/$1`
- Static files: `/(.*\.(css|js|svg|...))` → `/src/$1`
- Catch-all: `/(.*)` → `/src/index.html`

### Step 3: Alternative - Set Output Directory in Project Settings

If the rewrites still don't work, try this:

1. **In Vercel Dashboard:**
   - Go to Settings → General → Build & Development Settings
   - Set **Output Directory** to: `src`
   - Save

2. **Update vercel.json** to:
   ```json
   {
     "version": 2,
     "functions": {
       "api/*.js": {
         "maxDuration": 10
       }
     },
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "/api/$1"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

   Note: When output directory is `src`, files are served from root, so rewrites should point to `/index.html` not `/src/index.html`.

### Step 4: Test After Redeploy

After making changes:
1. Redeploy (or wait for auto-deploy)
2. Test root URL: `https://guess-my-name-chi.vercel.app/`
3. Should work without needing `/src/index.html`

## Why This Happens

When the output directory is `.` (root), all files are deployed as-is:
- `src/index.html` → `/src/index.html` in deployment
- Rewrites should route `/` → `/src/index.html`

But if the rewrites aren't working, it might be because:
1. Project settings override `vercel.json`
2. Rewrite order matters (API routes must come first)
3. Static file patterns might be catching requests before the catch-all

The simplified rewrites I just committed should fix this, but you may need to adjust the Output Directory setting in Vercel Dashboard.

