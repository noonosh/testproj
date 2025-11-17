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
		origin: (origin) => {
			// Allow requests from the same origin (for Vercel deployment)
			// or from explicitly allowed origins
			if (!origin) return true // Same-origin requests
			if (process.env.CORS_ORIGIN) {
				const allowedOrigins = process.env.CORS_ORIGIN.split(",").map(o => o.trim())
				return allowedOrigins.includes(origin)
			}
			// In production, allow all origins (since frontend and API are on same domain)
			return true
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

// Handle tRPC routes
// Vercel routes requests to this function, and the path can be either:
// - /trpc/* (if Vercel strips /api prefix)
// - /api/trpc/* (if Vercel keeps full path)
// We handle both cases to be safe
const trpcHandler = trpcServer({
	router: appRouter,
	createContext: (_opts, context) => {
		return createContext({context})
	},
})

app.use("/trpc/*", trpcHandler)
app.use("/api/trpc/*", trpcHandler)

// Health check endpoint
app.get("/", (c) => {
	return c.text("OK")
})

// Export the Hono app for Vercel serverless functions
// Vercel automatically detects this as a serverless function and uses the fetch handler
export default app
