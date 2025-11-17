# Production Fix - CORS and Routing Issues

## Problem
The frontend was trying to connect to `http://localhost:3001` in production, causing CORS errors and network failures.

## Solution

### 1. Fixed Frontend URL Detection
Updated `src/utils/trpc.ts` to:
- Use relative URL `/trpc` in production (works with Vercel rewrites)
- Automatically detect production mode using `import.meta.env.PROD`
- Fall back to localhost only in development

### 2. Improved CORS Configuration
Updated `api/index.ts` to:
- Properly handle same-origin requests (frontend and API on same domain)
- Support explicit CORS_ORIGIN environment variable
- Allow all origins in production (since they're on the same domain)

### 3. Enhanced Routing
Added support for both `/trpc/*` and `/api/trpc/*` paths to ensure compatibility.

## How It Works Now

### Production (Vercel)
1. Frontend makes request to `/trpc/calculate` (relative URL)
2. Vercel rewrite: `/trpc/calculate` → `/api/trpc/calculate`
3. Vercel routes to `api/index.ts` serverless function
4. Hono handles `/trpc/calculate` path
5. Same origin = no CORS issues

### Development
1. Frontend makes request to `http://localhost:3001/trpc/calculate`
2. Local Bun server handles the request
3. CORS allows `http://localhost:3000` origin

## No Environment Variables Needed!

The fix automatically detects production mode, so you **don't need to set `VITE_SERVER_URL`** in Vercel anymore. The frontend will automatically use the correct relative URL.

## Testing

After deploying:
1. The frontend should automatically use `/trpc` (relative URL)
2. No CORS errors should appear
3. API requests should work correctly

If you still see issues, check:
- The build completed successfully
- The `api/index.ts` file is deployed
- Browser console for any remaining errors

