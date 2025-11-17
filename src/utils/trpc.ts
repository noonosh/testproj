import type { AppRouter } from "../../server/trpc";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";

const handleError = (error: Error & { data?: { httpStatus?: number } }) => {
	const errorMessage = error.message.toLowerCase();
	const httpStatus = error.data?.httpStatus;

	const isRateLimitError =
		httpStatus === 429 ||
		errorMessage.includes("429") ||
		errorMessage.includes("rate limit") ||
		errorMessage.includes("rate_limit_exceeded") ||
		errorMessage.includes("too many requests");

	if (isRateLimitError) {
		toast.error("Rate Limit Reached!", {
			description:
				"You've exceeded 30 requests per minute. Please wait a moment before trying again.",
			duration: 5000,
		});
	} else {
		toast.error(error.message, {
			action: {
				label: "retry",
				onClick: () => {
					queryClient.invalidateQueries();
				},
			},
		});
	}
};

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: handleError,
	}),
	mutationCache: new MutationCache({
		onError: handleError,
	}),
});

// Determine the server URL
// In production (Vercel), call API directly at /api/trpc (more reliable than rewrites)
// In development, use the VITE_SERVER_URL or default to localhost
const getServerUrl = () => {
	// If VITE_SERVER_URL is explicitly set, use it
	if (import.meta.env.VITE_SERVER_URL) {
		return `${import.meta.env.VITE_SERVER_URL}/trpc`
	}
	
	// In production (on Vercel), use direct API path
	// This calls the serverless function directly at /api/trpc
	if (import.meta.env.PROD) {
		return "/api/trpc"
	}
	
	// Development fallback
	return "http://localhost:3001/trpc"
}

export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: getServerUrl(),
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});

