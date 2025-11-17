import {publicProcedure, router} from "../index"
import {cf} from "califi"
import {z} from "zod"

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK"
	}),
	calculate: publicProcedure
		.input(z.object({expression: z.string()}))
		.mutation(async ({input}) => {
			// Server-side validation: must contain at least one number
			const hasNumber = /[0-9]/.test(input.expression)
			const hasValidConstant = /\b(pi|e)\b/i.test(input.expression)

			if (!hasNumber && !hasValidConstant) {
				throw new Error(
					"Invalid expression: must contain at least one number or valid constant"
				)
			}

			// Check for invalid characters that could trigger AI responses
			const validPattern = /^[0-9+\-*/().\s^a-z,]+$/i
			if (!validPattern.test(input.expression)) {
				throw new Error(
					"Invalid expression: contains invalid characters"
				)
			}

			// Remove valid functions/constants and check for leftover invalid text
			const validFunctions = [
				"sqrt",
				"cbrt",
				"sin",
				"cos",
				"tan",
				"log",
				"ln",
				"abs",
				"ceil",
				"floor",
				"pi",
				"e",
			]
			let cleaned = input.expression.toLowerCase()

			for (const fn of validFunctions) {
				cleaned = cleaned.replace(new RegExp(fn, "g"), "")
			}
			cleaned = cleaned.replace(/[0-9+\-*/().\s^,]/g, "")

			if (cleaned.length > 0) {
				throw new Error(
					"Invalid expression: contains unrecognized functions or text"
				)
			}

			try {
				const result = await cf(input.expression)
				// Ensure result is a string or number for proper serialization
				const serializedResult =
					typeof result === "string" || typeof result === "number"
						? String(result)
						: JSON.stringify(result)
				return {result: serializedResult}
			} catch (error) {
				throw new Error(
					error instanceof Error
						? error.message
						: "Failed to evaluate expression"
				)
			}
		}),
})
export type AppRouter = typeof appRouter
