# Deploying to Vercel

This guide will help you deploy your CalcApp to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Vercel CLI installed (optional, for CLI deployment):
    ```bash
    npm i -g vercel
    ```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

    - Make sure your code is in a Git repository
    - Push it to GitHub, GitLab, or Bitbucket

2. **Import your project on Vercel**

    - Go to [vercel.com/new](https://vercel.com/new)
    - Click "Import Git Repository"
    - Select your repository
    - Vercel will auto-detect the settings from `vercel.json`

3. **Configure Environment Variables**

    - In the Vercel dashboard, go to your project settings
    - Navigate to "Environment Variables"
    - Add the following variables:
        - `CORS_ORIGIN`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
        - `VITE_SERVER_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

    **Note:** After the first deployment, Vercel will provide you with the deployment URL. You can update these variables with the actual URL.

4. **Deploy**
    - Click "Deploy"
    - Wait for the build to complete
    - Your app will be live at `https://your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):

    ```bash
    npm i -g vercel
    ```

2. **Login to Vercel**:

    ```bash
    vercel login
    ```

3. **Deploy**:

    ```bash
    vercel
    ```

    Follow the prompts:

    - Link to existing project or create new one
    - Confirm project settings
    - Deploy to production? (y/n)

4. **Set Environment Variables**:

    ```bash
    vercel env add CORS_ORIGIN
    vercel env add VITE_SERVER_URL
    ```

    Enter the values when prompted (use your Vercel deployment URL)

5. **Redeploy** (to apply environment variables):
    ```bash
    vercel --prod
    ```

## Project Structure

The deployment is configured as follows:

-   **Frontend**: Built with Vite, output to `dist/` directory
-   **API**: Serverless functions in `api/` directory using Hono
-   **Server Logic**: Shared code in `server/` directory (imported by `api/index.ts`)
-   **Build Command**: `bun run build`
-   **Output Directory**: `dist`
-   **Framework**: Vite

## How It Works

1. The frontend (React + Vite) is built and served as static files from `dist/`
2. API routes (`/trpc/*`) are handled by serverless functions in `api/index.ts`
3. The `api/index.ts` imports shared server logic from `server/trpc.ts` (same code used locally)
4. The `vercel.json` rewrites `/trpc/*` requests to `/api/trpc/*`
5. Vercel automatically detects `api/index.ts` as a serverless function
6. The Hono server handles tRPC requests

**Important**: Both your frontend and backend are hosted in the same repository and deployed together on Vercel. The server code in `server/trpc.ts` is shared between local development and Vercel deployment.

## Environment Variables

Make sure to set these in your Vercel project settings:

-   `CORS_ORIGIN`: Your Vercel deployment URL (for CORS configuration)
-   `VITE_SERVER_URL`: Your Vercel deployment URL (for frontend API calls)

**Important:** After your first deployment, update these variables with your actual Vercel URL.

## Troubleshooting

### Build Fails

-   Make sure `bun` is available (Vercel should auto-detect it from `packageManager` in `package.json`)
-   Check build logs in Vercel dashboard

### API Routes Not Working

-   Verify environment variables are set correctly
-   Check that `api/index.ts` exists and exports the Hono app correctly
-   Ensure `vercel.json` rewrite rules are correct

### CORS Errors

-   Make sure `CORS_ORIGIN` environment variable matches your deployment URL
-   Check that the frontend `VITE_SERVER_URL` is set correctly

## Updating Your Deployment

After making changes:

1. Push to your Git repository
2. Vercel will automatically redeploy (if auto-deploy is enabled)
3. Or manually trigger a deployment from the Vercel dashboard

## Custom Domain

To add a custom domain:

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update environment variables with your custom domain URL
