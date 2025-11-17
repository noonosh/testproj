/**
 * Natural Language Parser for Mathematical Expressions
 * Converts natural language queries to mathematical expressions
 * with comprehensive security safeguards against prompt injection
 */

// Maximum input length to prevent abuse
const MAX_INPUT_LENGTH = 200

// Blocked patterns that indicate prompt injection attempts
const BLOCKED_PATTERNS = [
	// Common prompt injection patterns
	/\b(ignore|forget|disregard)\s+(previous|prior|above|all|the)\s+(instructions?|commands?|prompts?|rules?|directives?)/i,
	/\b(you\s+are|you're|act\s+as|pretend\s+to\s+be|roleplay\s+as)/i,
	/\b(system|assistant|user|admin|root):/i,
	/\b(execute|run|eval|exec|system|shell|command|script)/i,
	/\b(delete|drop|remove|clear|truncate|alter|update|insert|create)\s+/i,
	/\b(password|token|key|secret|api|auth|credential)/i,
	/\b(http|https|ftp|file|data):\/\//i,
	/\b(javascript|python|bash|shell|sql|script):/i,
	/<\s*(script|iframe|object|embed|link|style)/i,
	/\b(jailbreak|override|bypass|hack|exploit)/i,
	/\b(do\s+not|don't|never)\s+(follow|obey|listen|respect)/i,
	/\b(new\s+instructions?|override|replace)\s+(instructions?|rules?|system)/i,
	/\b(print|output|return|display)\s+(everything|all|the\s+prompt|your\s+instructions)/i,
	/\b(what\s+are|tell\s+me|show\s+me|reveal)\s+(your|the)\s+(instructions?|prompt|system|rules?)/i,
]

// Allowed natural language patterns for mathematical operations
const ALLOWED_PATTERNS = [
	// Percentage operations
	{
		pattern: /(\d+(?:\.\d+)?)\s*%\s*(?:of|from)\s*(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) =>
			`(${match[1]} / 100) * ${match[2]}`,
	},
	{
		pattern: /(\d+(?:\.\d+)?)\s*%\s*(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) =>
			`(${match[1]} / 100) * ${match[2]}`,
	},
	// Basic operations
	{
		pattern: /(\d+(?:\.\d+)?)\s+(plus|added\s+to|and)\s+(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) => `${match[1]} + ${match[3]}`,
	},
	{
		pattern:
			/(\d+(?:\.\d+)?)\s+(minus|subtract|subtracted\s+from)\s+(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) => `${match[1]} - ${match[3]}`,
	},
	{
		pattern:
			/(\d+(?:\.\d+)?)\s+(times|multiplied\s+by|multiply)\s+(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) => `${match[1]} * ${match[3]}`,
	},
	{
		pattern:
			/(\d+(?:\.\d+)?)\s+(divided\s+by|divide|over)\s+(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) => `${match[1]} / ${match[3]}`,
	},
	{
		pattern:
			/(\d+(?:\.\d+)?)\s+(to\s+the\s+power\s+of|raised\s+to|power)\s+(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) => `${match[1]} ^ ${match[3]}`,
	},
	// Square root
	{
		pattern: /(?:the\s+)?(?:square\s+)?root\s+of\s+(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) => `sqrt(${match[1]})`,
	},
	// Cube root
	{
		pattern: /(?:the\s+)?cube\s+root\s+of\s+(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) => `cbrt(${match[1]})`,
	},
	// Trigonometric functions
	{
		pattern: /(?:the\s+)?(?:sine|sin)\s+of\s+(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) => `sin(${match[1]})`,
	},
	{
		pattern: /(?:the\s+)?(?:cosine|cos)\s+of\s+(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) => `cos(${match[1]})`,
	},
	{
		pattern: /(?:the\s+)?(?:tangent|tan)\s+of\s+(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) => `tan(${match[1]})`,
	},
	// Logarithms
	{
		pattern: /(?:the\s+)?(?:log|logarithm)\s+(?:of\s+)?(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) => `log(${match[1]})`,
	},
	{
		pattern: /(?:the\s+)?(?:natural\s+)?log\s+(?:of\s+)?(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) => `ln(${match[1]})`,
	},
	// Absolute value
	{
		pattern:
			/(?:the\s+)?(?:absolute\s+value|abs)\s+(?:of\s+)?-(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) => `abs(-${match[1]})`,
	},
	{
		pattern:
			/(?:the\s+)?(?:absolute\s+value|abs)\s+(?:of\s+)?(\d+(?:\.\d+)?)/i,
		converter: (match: RegExpMatchArray) => `abs(${match[1]})`,
	},
]

/**
 * Sanitizes input by removing potentially dangerous characters
 */
function sanitizeInput(input: string): string {
	// Remove null bytes and control characters except newlines and tabs
	return input
		.replace(/\0/g, "")
		.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "")
		.trim()
}

/**
 * Checks if input contains blocked patterns indicating prompt injection
 */
function containsBlockedPatterns(input: string): boolean {
	const normalized = input.toLowerCase()
	return BLOCKED_PATTERNS.some((pattern) => pattern.test(normalized))
}

/**
 * Validates that input only contains safe characters for natural language math
 */
function isValidNaturalLanguageInput(input: string): boolean {
	// Allow: letters, numbers, spaces, basic punctuation, and mathematical operators
	const safePattern = /^[a-z0-9\s.,!?%()+\-*/^]+$/i
	return safePattern.test(input)
}

/**
 * Checks if input contains at least one number
 */
function containsNumber(input: string): boolean {
	return /\d/.test(input)
}

/**
 * Converts natural language to mathematical expression
 */
function convertToExpression(input: string): string | null {
	let expression = input.trim()

	// Try each allowed pattern
	for (const {pattern, converter} of ALLOWED_PATTERNS) {
		const match = expression.match(pattern)
		if (match) {
			return converter(match)
		}
	}

	// If no pattern matches, return null
	return null
}

/**
 * Main function to parse natural language input to mathematical expression
 * with comprehensive security checks
 */
export function parseNaturalLanguage(input: string): {
	success: boolean
	expression?: string
	error?: string
} {
	// 1. Length check
	if (input.length > MAX_INPUT_LENGTH) {
		return {
			success: false,
			error: `Input too long. Maximum length is ${MAX_INPUT_LENGTH} characters.`,
		}
	}

	// 2. Sanitize input
	const sanitized = sanitizeInput(input)

	if (!sanitized) {
		return {
			success: false,
			error: "Input cannot be empty.",
		}
	}

	// 3. Check for blocked patterns (prompt injection)
	if (containsBlockedPatterns(sanitized)) {
		return {
			success: false,
			error: "Invalid input detected. Please use only mathematical expressions.",
		}
	}

	// 4. Validate character set
	if (!isValidNaturalLanguageInput(sanitized)) {
		return {
			success: false,
			error: "Input contains invalid characters.",
		}
	}

	// 5. Check for numbers
	if (!containsNumber(sanitized)) {
		return {
			success: false,
			error: "Input must contain at least one number.",
		}
	}

	// 6. Convert natural language to expression
	const expression = convertToExpression(sanitized)

	if (!expression) {
		return {
			success: false,
			error: "Could not parse natural language. Please use standard mathematical notation or try phrases like '10% of 5' or 'square root of 144'.",
		}
	}

	// 7. Final validation: ensure converted expression is safe
	if (containsBlockedPatterns(expression)) {
		return {
			success: false,
			error: "Invalid expression generated. Please try a different input.",
		}
	}

	return {
		success: true,
		expression,
	}
}
