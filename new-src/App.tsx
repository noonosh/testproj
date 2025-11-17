import {useState, useEffect} from "react"
import {useMutation} from "@tanstack/react-query"
import {trpc} from "./utils/trpc"
import {Input} from "./components/ui/input"
import {Button} from "./components/ui/button"
import {Card, CardContent} from "./components/ui/card"
import {ThemeProvider} from "./components/theme-provider"
import Header from "./components/header"
import {Toaster} from "./components/ui/sonner"

type HistoryItem = {
	expression: string
	result: string
	timestamp: number
}

function App() {
	const [expression, setExpression] = useState("")
	const [result, setResult] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [history, setHistory] = useState<HistoryItem[]>([])

	const calculateMutation = useMutation(trpc.calculate.mutationOptions())

	// Validate expression before sending to server
	const isValidExpression = (expr: string): boolean => {
		const hasNumber = /[0-9]/.test(expr)
		const hasValidConstant = /\b(pi|e)\b/i.test(expr)

		if (!hasNumber && !hasValidConstant) {
			return false
		}

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
		let cleaned = expr.toLowerCase()

		for (const fn of validFunctions) {
			cleaned = cleaned.replace(new RegExp(fn, "g"), "")
		}

		cleaned = cleaned.replace(/[0-9+\-*/().\s^,]/g, "")

		return cleaned.length === 0
	}

	// Load history from localStorage on mount
	useEffect(() => {
		const savedHistory = localStorage.getItem("calc-history")
		if (savedHistory) {
			try {
				setHistory(JSON.parse(savedHistory))
			} catch (e) {
				console.error("Failed to load history:", e)
			}
		}
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setResult(null)

		if (!expression.trim()) {
			setError("Please enter an expression")
			return
		}

		if (!isValidExpression(expression.trim())) {
			setError(
				"Invalid expression. Please use valid mathematical operations and numbers."
			)
			return
		}

		try {
			const response = await calculateMutation.mutateAsync({
				expression,
			})
			setResult(response.result)

			const newHistory = [
				{
					expression: expression.trim(),
					result: response.result,
					timestamp: Date.now(),
				},
				...history.slice(0, 9),
			]
			setHistory(newHistory)
			localStorage.setItem("calc-history", JSON.stringify(newHistory))
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Invalid expression"
			const isRateLimitError = errorMessage
				.toLowerCase()
				.includes("rate limit")

			if (!isRateLimitError) {
				setError(errorMessage)
			}
		}
	}

	const handleExampleClick = (example: string) => {
		setExpression(example)
		setError(null)
		setResult(null)
	}

	const handleHistoryClick = (item: HistoryItem) => {
		setExpression(item.expression)
		setResult(item.result)
		setError(null)
	}

	const clearHistory = () => {
		setHistory([])
		localStorage.removeItem("calc-history")
	}

	const examples = [
		"2 + 2 * 3",
		"sqrt(144)",
		"sin(pi / 2)",
		"10^3",
		"log(100)",
		"abs(-42)",
	]

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="light"
			disableTransitionOnChange
			storageKey="vite-ui-theme">
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-1">
					<div className="min-h-screen bg-gray-50 dark:bg-gray-950">
						<div className="container mx-auto max-w-4xl px-4 py-12">
							{/* Header */}
							<div className="text-center mb-12">
								<h1 className="text-3xl font-light text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
									Mathematical Expression Evaluator
								</h1>
								<p className="text-sm text-gray-500 dark:text-gray-500 font-mono">
									powered by califi
								</p>
							</div>

							<div className="grid md:grid-cols-5 gap-6">
								{/* Main Calculator */}
								<div className="md:col-span-3">
									<Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
										<CardContent className="p-8">
											<form
												onSubmit={handleSubmit}
												className="space-y-6">
												<div className="space-y-3">
													<label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500 font-medium">
														Expression
													</label>
													<Input
														type="text"
														placeholder="2 + 2 * 3"
														value={expression}
														onChange={(e) =>
															setExpression(
																e.target.value
															)
														}
														className="text-2xl h-16 px-4 font-mono border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-300 transition-colors"
														autoFocus
													/>
												</div>

												{/* Result Display */}
												{result !== null && (
													<div className="py-6 border-y border-gray-200 dark:border-gray-800">
														<div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500 font-medium mb-3">
															Result
														</div>
														<div className="text-4xl font-mono text-gray-900 dark:text-gray-100 break-all">
															{result}
														</div>
													</div>
												)}

												{/* Error Display */}
												{error && (
													<div className="py-6 border-y border-red-200 dark:border-red-900">
														<div className="text-xs uppercase tracking-wider text-red-600 dark:text-red-400 font-medium mb-2">
															Error
														</div>
														<div className="text-sm font-mono text-red-900 dark:text-red-200">
															{error}
														</div>
													</div>
												)}

												<Button
													type="submit"
													size="lg"
													className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 font-medium transition-colors"
													disabled={
														calculateMutation.isPending
													}>
													{calculateMutation.isPending
														? "Evaluating..."
														: "Evaluate"}
												</Button>
											</form>

											{/* Examples */}
											<div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
												<div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500 font-medium mb-4">
													Examples
												</div>
												<div className="grid grid-cols-2 gap-2">
													{examples.map((example) => (
														<button
															key={example}
															onClick={() =>
																handleExampleClick(
																	example
																)
															}
															className="text-left px-3 py-2 text-sm font-mono border border-gray-200 dark:border-gray-800 rounded hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
															{example}
														</button>
													))}
												</div>
											</div>
										</CardContent>
									</Card>
								</div>

								{/* Sidebar */}
								<div className="md:col-span-2 space-y-6">
									{/* History */}
									<Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
										<CardContent className="p-6">
											<div className="flex items-center justify-between mb-4">
												<div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500 font-medium">
													History
												</div>
												{history.length > 0 && (
													<button
														onClick={clearHistory}
														className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
														Clear
													</button>
												)}
											</div>

											{history.length === 0 ? (
												<div className="py-8 text-center text-sm text-gray-400 dark:text-gray-600">
													<p>No history yet</p>
												</div>
											) : (
												<div className="space-y-1 max-h-[400px] overflow-y-auto">
													{history.map((item) => (
														<button
															key={item.timestamp}
															onClick={() =>
																handleHistoryClick(
																	item
																)
															}
															className="w-full text-left px-3 py-2 rounded border border-transparent hover:border-gray-200 dark:hover:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
															<div className="font-mono text-sm text-gray-900 dark:text-gray-100 mb-1 break-all">
																{
																	item.expression
																}
															</div>
															<div className="font-mono text-xs text-gray-500 dark:text-gray-500">
																= {item.result}
															</div>
														</button>
													))}
												</div>
											)}
										</CardContent>
									</Card>

									{/* Functions Reference */}
									<Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
										<CardContent className="p-6">
											<div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500 font-medium mb-4">
												Supported Operations
											</div>
											<div className="space-y-3 text-xs font-mono">
												<div>
													<span className="text-gray-500 dark:text-gray-500">
														Basic:
													</span>{" "}
													<span className="text-gray-900 dark:text-gray-100">
														+ - * / ^ **
													</span>
												</div>
												<div>
													<span className="text-gray-500 dark:text-gray-500">
														Roots:
													</span>{" "}
													<span className="text-gray-900 dark:text-gray-100">
														sqrt() cbrt()
													</span>
												</div>
												<div>
													<span className="text-gray-500 dark:text-gray-500">
														Trig:
													</span>{" "}
													<span className="text-gray-900 dark:text-gray-100">
														sin() cos() tan()
													</span>
												</div>
												<div>
													<span className="text-gray-500 dark:text-gray-500">
														Log:
													</span>{" "}
													<span className="text-gray-900 dark:text-gray-100">
														log() ln()
													</span>
												</div>
												<div>
													<span className="text-gray-500 dark:text-gray-500">
														Round:
													</span>{" "}
													<span className="text-gray-900 dark:text-gray-100">
														abs() ceil() floor()
													</span>
												</div>
												<div>
													<span className="text-gray-500 dark:text-gray-500">
														Constants:
													</span>{" "}
													<span className="text-gray-900 dark:text-gray-100">
														pi e
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>
							</div>

							{/* Footer */}
							<div className="text-center mt-16 text-xs text-gray-400 dark:text-gray-600">
								<p className="font-mono">
									Better-T-Stack × Califi
								</p>
							</div>
						</div>
					</div>
				</main>
			</div>
			<Toaster richColors />
		</ThemeProvider>
	)
}

export default App
