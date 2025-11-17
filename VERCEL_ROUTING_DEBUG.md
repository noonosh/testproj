# Vercel Routing Debug Guide

## Current Issue
`/api/trpc/calculate` returns 404, meaning the serverless function is being called but routes aren't matching.

## Code Changes Made
✅ Added both `/trpc/*` and `/api/trpc/*` path patterns  
✅ Simplified routing structure  
✅ Fixed CORS configuration

## Next Steps to Debug

### 1. Check Function Logs in Vercel
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment → **Functions** tab
3. Click on `api/index.ts`
4. Check **Logs** tab for:
   - Any import errors
   - Path information
   - Runtime errors

### 2. Test Health Endpoint
Try accessing: `https://testproj-beta.vercel.app/api`

- If this returns "OK" → Function is working, routing issue
- If this returns 404 → Function not detected or export issue

### 3. Check Function Detection
In Vercel Dashboard → Settings → Functions:
- Verify `api/index.ts` is listed as a detected function
- Check Node.js runtime version (should be 18.x or 20.x)

### 4. Verify Export Format
The function exports `export default app` which should work, but Vercel might need:
```typescript
export default {
  fetch: app.fetch
}
```

### 5. Test Different Paths
Try these URLs to see which works:
- `https://testproj-beta.vercel.app/api` → Should return "OK"
- `https://testproj-beta.vercel.app/api/trpc/healthCheck` → Should work if routing is correct
- `https://testproj-beta.vercel.app/trpc/healthCheck` → Should work if rewrite is working

## Most Likely Causes

1. **Path mismatch**: Vercel might be passing a different path than expected
2. **Export format**: Might need `export default { fetch: app.fetch }`
3. **Runtime issue**: Function might not be running correctly
4. **Build issue**: TypeScript might not be compiling correctly

## Quick Fix to Try

If nothing else works, try changing the export in `api/index.ts`:

```typescript
// Instead of: export default app
export default {
  fetch: app.fetch
}
```

This explicitly exports the fetch handler that Vercel expects.

