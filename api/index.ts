import {trpcServer} from "@hono/trpc-server"
import {Hono} from "hono"
import {cors} from "hono/cors"
import {logger} from "hono/logger"
import {rateLimiter} from "hono-rate-limiter"
import {appRouter, createContext} from "../server/trpc"

const app = new Hono()

app.use(logger())
app.use(
	"/*",
	cors({
		origin: (origin, c) => {
			// Allow requests from the same origin (for Vercel deployment)
			// or from explicitly allowed origins
			if (!origin) return origin // Same-origin requests
			if (process.env.CORS_ORIGIN) {
				const allowedOrigins = process.env.CORS_ORIGIN.split(",").map(
					(o) => o.trim()
				)
				return allowedOrigins.includes(origin) ? origin : null
			}
			// In production, allow all origins (since frontend and API are on same domain)
			return origin
		},
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type"],
		credentials: true,
	})
)

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
			)
		},
	})
)

// Health check endpoint
app.get("/", (c) => {
	return c.text("OK")
})

// Handle tRPC routes
// Vercel behavior can vary - try both path patterns
const trpcHandler = trpcServer({
	router: appRouter,
	createContext: (_opts, context) => {
		return createContext({context})
	},
})

// Try /trpc/* first (Vercel strips /api prefix)
app.use("/trpc/*", trpcHandler)

// Also try /api/trpc/* in case Vercel keeps the full path
app.use("/api/trpc/*", trpcHandler)

// Export the Hono app for Vercel serverless functions
// Vercel needs the fetch handler explicitly
export default {
	fetch: app.fetch,
}
