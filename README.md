# Mathematical Expression Evaluator

A modern, clean, and minimalist mathematical expression calculator powered by **Califi**. Built with Better-T-Stack for a seamless full-stack TypeScript experience.

## About

This application provides a simple, elegant interface for evaluating mathematical expressions. The design philosophy emphasizes:

- **Minimalism** - Clean lines, neutral colors, focused layout
- **Authenticity** - Feels like a professional mathematical tool
- **Simplicity** - Single page, no authentication, just pure functionality
- **Usability** - Persistent history, quick examples, keyboard-friendly

## Key Features

- ✨ **Instant Evaluation** - Calculate complex mathematical expressions in real-time
- 📚 **History Tracking** - Persistent calculation history using localStorage
- 🎯 **Quick Examples** - Clickable sample expressions to get started
- 🌓 **Dark Mode** - Beautiful light and dark themes
- 📱 **Responsive** - Works seamlessly on all devices
- ⌨️ **Keyboard Friendly** - Press Enter to calculate, autofocus on input

## Supported Operations

- **Basic**: `+`, `-`, `*`, `/`, `^`, `**`
- **Roots**: `sqrt()`, `cbrt()`
- **Trigonometry**: `sin()`, `cos()`, `tan()`
- **Logarithms**: `log()`, `ln()`
- **Rounding**: `abs()`, `ceil()`, `floor()`
- **Constants**: `pi`, `e`

## Technology Stack

- **Frontend**: React + TanStack Router
- **Backend**: Hono + tRPC
- **Math Engine**: [Califi](https://www.npmjs.com/package/califi)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite + Turborepo
- **Runtime**: Bun

## Getting Started

First, install the dependencies:

```bash
bun install
```


Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).







## Project Structure

```
testproj/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   ├── docs/        # Documentation site (Astro Starlight)
│   └── server/      # Backend API (Hono, TRPC)
├── packages/
│   ├── api/         # API layer / business logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:server`: Start only the server
- `bun run check-types`: Check TypeScript types across all apps
- `cd apps/docs && bun run dev`: Start documentation site
- `cd apps/docs && bun run build`: Build documentation site
