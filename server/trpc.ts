import {initTRPC} from "@trpc/server"
import type {Context as HonoContext} from "hono"
import {cf} from "califi"
import {z} from "zod"
import {parseNaturalLanguage} from "./naturalLanguageParser"

// Context
export type CreateContextOptions = {
	context: HonoContext
}

export async function createContext(_opts: CreateContextOptions) {
	return {
		session: null,
	}
}

export type Context = Awaited<ReturnType<typeof createContext>>

// tRPC
const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

// Router
export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK"
	}),
	parseNaturalLanguage: publicProcedure
		.input(
			z.object({
				input: z.string().max(200, "Input too long"),
			})
		)
		.mutation(async ({input}) => {
			const result = parseNaturalLanguage(input.input)
			if (!result.success) {
				throw new Error(
					result.error || "Failed to parse natural language"
				)
			}
			return {expression: result.expression}
		}),
	calculate: publicProcedure
		.input(
			z.object({
				expression: z.string().max(500, "Expression too long"),
				allowNaturalLanguage: z.boolean().optional().default(false),
			})
		)
		.mutation(async ({input}) => {
			let expression = input.expression.trim()

			// If natural language is allowed, try to parse it first
			if (input.allowNaturalLanguage) {
				// Check if input looks like natural language (contains words, not just math)
				// Check for percentage with words, natural language keywords, or words that aren't pure math
				const hasPercentageWithWords = /%\s*(?:of|from)/i.test(
					expression
				)
				const hasNaturalLanguageWords =
					/\b(of|from|plus|minus|times|multiplied|divided|divide|over|added|subtract|power|root|square|cube|sine|cosine|tangent|log|logarithm|absolute|value|abs)\b/i.test(
						expression
					)
				const hasWords = /[a-z]{2,}/i.test(expression)
				const isPureMath = /^[0-9+\-*/().\s^a-z,]+$/i.test(expression)
				const looksLikeNaturalLanguage =
					hasPercentageWithWords ||
					hasNaturalLanguageWords ||
					(hasWords && !isPureMath)

				if (looksLikeNaturalLanguage) {
					const parseResult = parseNaturalLanguage(expression)
					if (parseResult.success && parseResult.expression) {
						expression = parseResult.expression
					} else {
						throw new Error(
							parseResult.error ||
								"Could not parse natural language input"
						)
					}
				}
			}

			// Additional security: Check for prompt injection patterns even in converted expressions
			const blockedPatterns = [
				/\b(ignore|forget|disregard)\s+(previous|prior|above|all|the)\s+(instructions?|commands?|prompts?|rules?|directives?)/i,
				/\b(you\s+are|you're|act\s+as|pretend\s+to\s+be|roleplay\s+as)/i,
				/\b(system|assistant|user|admin|root):/i,
				/\b(execute|run|eval|exec|system|shell|command|script)/i,
			]

			if (blockedPatterns.some((pattern) => pattern.test(expression))) {
				throw new Error("Invalid expression: contains blocked patterns")
			}

			// Server-side validation: must contain at least one number
			const hasNumber = /[0-9]/.test(expression)
			const hasValidConstant = /\b(pi|e)\b/i.test(expression)

			if (!hasNumber && !hasValidConstant) {
				throw new Error(
					"Invalid expression: must contain at least one number or valid constant"
				)
			}

			// Check for invalid characters that could trigger AI responses
			const validPattern = /^[0-9+\-*/().\s^a-z,]+$/i
			if (!validPattern.test(expression)) {
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
			let cleaned = expression.toLowerCase()

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
				const result = await cf(expression)
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
