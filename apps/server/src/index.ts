import "dotenv/config"
import {trpcServer} from "@hono/trpc-server"
import {createContext} from "@testproj/api/context"
import {appRouter} from "@testproj/api/routers/index"
import {Hono} from "hono"
import {cors} from "hono/cors"
import {logger} from "hono/logger"
import {rateLimiter} from "hono-rate-limiter"

const app = new Hono()

app.use(logger())
app.use(
	"/*",
	cors({
		origin: process.env.CORS_ORIGIN || "",
		allowMethods: ["GET", "POST", "OPTIONS"],
	})
)

// Rate limiter: 30 requests per minute per IP address
app.use(
	"/*",
	rateLimiter({
		windowMs: 60 * 1000, // 1 minute
		limit: 30, // 30 requests per window
		standardHeaders: "draft-6", // Return rate limit info in the `RateLimit-*` headers
		keyGenerator: (c) =>
			c.req.header("x-forwarded-for") ||
			c.req.header("x-real-ip") ||
			"unknown", // Use IP address as key
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

export default app
