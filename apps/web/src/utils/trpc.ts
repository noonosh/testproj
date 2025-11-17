import type {AppRouter} from "@testproj/api/routers/index"
import {MutationCache, QueryCache, QueryClient} from "@tanstack/react-query"
import {createTRPCClient, httpBatchLink} from "@trpc/client"
import {createTRPCOptionsProxy} from "@trpc/tanstack-react-query"
import {toast} from "sonner"

const handleError = (error: Error & {data?: {httpStatus?: number}}) => {
	// Check if it's a rate limit error (HTTP 429)
	const errorMessage = error.message.toLowerCase()
	const httpStatus = error.data?.httpStatus

	const isRateLimitError =
		httpStatus === 429 ||
		errorMessage.includes("429") ||
		errorMessage.includes("rate limit") ||
		errorMessage.includes("rate_limit_exceeded") ||
		errorMessage.includes("too many requests")

	if (isRateLimitError) {
		toast.error("Rate Limit Reached!", {
			description:
				"You've exceeded 30 requests per minute. Please wait a moment before trying again.",
			duration: 5000,
		})
	} else {
		toast.error(error.message, {
			action: {
				label: "retry",
				onClick: () => {
					queryClient.invalidateQueries()
				},
			},
		})
	}
}

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: handleError,
	}),
	mutationCache: new MutationCache({
		onError: handleError,
	}),
})

export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${import.meta.env.VITE_SERVER_URL}/trpc`,
		}),
	],
})

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
})
