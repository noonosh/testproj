import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
	<QueryClientProvider client={queryClient}>
		<App />
		<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
	</QueryClientProvider>
);

