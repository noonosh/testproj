import "dotenv/config"
import {trpcServer} from "@hono/trpc-server"
import {Hono} from "hono"
import {cors} from "hono/cors"
import {logger} from "hono/logger"
import {rateLimiter} from "hono-rate-limiter"
import {appRouter, createContext} from "./trpc"

const app = new Hono()

app.use(logger())
app.use(
	"/*",
	cors({
		origin: process.env.CORS_ORIGIN || "http://localhost:3000",
		allowMethods: ["GET", "POST", "OPTIONS"],
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

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({context})
		},
	})
)

app.get("/", (c) => {
	return c.text("OK")
})

const port = process.env.PORT || 3001
console.log(`Server running on http://localhost:${port}`)

export default {
	port,
	fetch: app.fetch,
}
