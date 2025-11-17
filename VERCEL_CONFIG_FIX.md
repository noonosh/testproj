# Vercel Deployment Configuration Fix

## Issue
Getting 404 errors for `/trpc/calculate` requests in production.

## Code Changes Made
✅ Fixed CORS configuration  
✅ Updated routing to handle both `/api/trpc/*` and `/trpc/*` paths  
✅ Fixed TypeScript errors

## Vercel Configuration to Check/Update

### 1. Verify Build Settings

In your Vercel project dashboard:

1. Go to **Settings** → **General**
2. Check **Build & Development Settings**:
   - **Framework Preset**: Should be `Vite` or `Other`
   - **Build Command**: `bun run build` (should be auto-detected)
   - **Output Directory**: `dist` (should be auto-detected)
   - **Install Command**: `bun install` (should be auto-detected)

### 2. Verify API Function Detection

Vercel should automatically detect `api/index.ts` as a serverless function. To verify:

1. Go to **Deployments** tab
2. Click on your latest deployment
3. Check the **Functions** section - you should see `api/index.ts` listed
4. If it's not there, the function might not be detected

### 3. Check Runtime Settings

1. Go to **Settings** → **Functions**
2. Ensure **Node.js Version** is set (18.x or 20.x recommended)
3. The function should use Node.js runtime (auto-detected)

### 4. Verify Environment Variables

Go to **Settings** → **Environment Variables**:

You don't need `VITE_SERVER_URL` anymore (code auto-detects production), but you can optionally set:
- `CORS_ORIGIN`: Your Vercel URL (e.g., `https://testproj-beta.vercel.app`)

**Note**: The code will work without this since it allows same-origin requests.

### 5. Check vercel.json is Deployed

1. In your repository, ensure `vercel.json` is committed and pushed
2. The rewrite rule should be:
   ```json
   {
     "rewrites": [
       {
         "source": "/trpc/(.*)",
         "destination": "/api/trpc/$1"
       }
     ]
   }
   ```

### 6. Force Redeploy

If changes aren't taking effect:

1. Go to **Deployments** tab
2. Click the **⋯** menu on your latest deployment
3. Select **Redeploy**
4. Or push a new commit to trigger a new deployment

### 7. Check Function Logs

1. Go to **Deployments** → Your deployment → **Functions** tab
2. Click on `api/index.ts`
3. Check the **Logs** tab for any errors
4. Look for:
   - Import errors
   - Runtime errors
   - Path matching issues

### 8. Test the API Directly

Try accessing these URLs directly in your browser:

1. `https://testproj-beta.vercel.app/api` - Should return "OK"
2. `https://testproj-beta.vercel.app/api/trpc/healthCheck` - Should work if routing is correct

### 9. Alternative: Use Direct API Path

If rewrites aren't working, you can temporarily update the frontend to call `/api/trpc/*` directly:

In `src/utils/trpc.ts`, change:
```typescript
if (import.meta.env.PROD) {
  return "/api/trpc"  // Direct API path instead of /trpc
}
```

This bypasses the rewrite rule and calls the API function directly.

## Most Likely Issues

1. **Function not detected**: `api/index.ts` might not be in the right location or format
2. **Build failing**: Check build logs for TypeScript or import errors
3. **Rewrite not working**: Vercel might need a redeploy to pick up `vercel.json` changes
4. **Path mismatch**: The function might be receiving a different path than expected

## Quick Fix: Test Direct API Access

Update `src/utils/trpc.ts` temporarily to test:

```typescript
const getServerUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) {
    return `${import.meta.env.VITE_SERVER_URL}/trpc`
  }
  
  // In production, try direct API path first
  if (import.meta.env.PROD) {
    return "/api/trpc"  // Direct path - bypasses rewrite
  }
  
  return "http://localhost:3001/trpc"
}
```

This will help determine if the issue is with the rewrite rule or the function itself.

