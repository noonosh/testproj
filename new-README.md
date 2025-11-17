# CalcApp - Mathematical Expression Calculator

A simple Vite app for evaluating mathematical expressions, powered by Califi.

## Features

-   Mathematical expression evaluation (basic operations, trig, logarithms, etc.)
-   Dark mode support
-   Calculation history (stored locally)
-   Rate limiting (30 requests per minute)
-   Clean and modern UI

## Tech Stack

-   **Frontend**: React 19, Vite, Tailwind CSS, shadcn/ui
-   **Backend**: Hono, tRPC
-   **Calculation Engine**: Califi
-   **Package Manager**: Bun

## Project Structure

```
├── src/                 # Frontend source code
│   ├── components/      # React components
│   ├── lib/            # Utility functions
│   ├── utils/          # tRPC client setup
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── server/             # Backend server code
│   ├── index.ts        # Server entry point
│   └── trpc.ts         # tRPC router and context
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies and scripts
```

## Getting Started

1. **Install dependencies**:

    ```bash
    bun install
    ```

2. **Create environment file**:

    ```bash
    cp .env.example .env
    ```

3. **Run the development servers**:

    In one terminal, start the backend server:

    ```bash
    bun run dev:server
    ```

    In another terminal, start the frontend:

    ```bash
    bun run dev
    ```

4. **Open your browser**:
   Navigate to `http://localhost:3001`

## Available Scripts

-   `bun run dev` - Start the frontend development server
-   `bun run dev:server` - Start the backend server
-   `bun run build` - Build the frontend for production
-   `bun run preview` - Preview the production build

## Supported Operations

-   **Basic**: `+`, `-`, `*`, `/`, `^`, `**`
-   **Roots**: `sqrt()`, `cbrt()`
-   **Trigonometric**: `sin()`, `cos()`, `tan()`
-   **Logarithms**: `log()`, `ln()`
-   **Rounding**: `abs()`, `ceil()`, `floor()`
-   **Constants**: `pi`, `e`

## Example Expressions

-   `2 + 2 * 3`
-   `sqrt(144)`
-   `sin(pi / 2)`
-   `10^3`
-   `log(100)`
-   `abs(-42)`
