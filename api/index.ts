import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { rateLimiter } from "hono-rate-limiter";
import { appRouter, createContext } from "../server/trpc";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: process.env.CORS_ORIGIN || "*",
		allowMethods: ["GET", "POST", "OPTIONS"],
	})
);

// Rate limiter: 30 requests per minute per IP address
app.use(
	"/*",
	rateLimiter({
		windowMs: 60 * 1000, // 1 minute
		limit: 30, // 30 requests per window
		standardHeaders: "draft-6",
		keyGenerator: (c) =>
			c.req.header("x-forwarded-for") ||
			c.req.header("x-real-ip") ||
			"unknown",
		handler: (c) => {
			return c.json(
				{
					error: {
						message:
							"Too many requests. You have exceeded the rate limit of 30 requests per minute. Please try again later.",
						code: "RATE_LIMIT_EXCEEDED",
					},
				},
				429
			);
		},
	})
);

// Handle tRPC routes
// The rewrite rule in vercel.json routes /trpc/* to /api/trpc/*
// So we handle /trpc/* here (which becomes /api/trpc/* after rewrite)
app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	})
);

app.get("/", (c) => {
	return c.text("OK");
});

// Export the Hono app for Vercel serverless functions
// Vercel will automatically handle the fetch handler
export default app;

