"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// When the server is redeployed, any browser tab that still holds the old
// page will have server action IDs that no longer exist on the new build.
// Next.js throws "Failed to find Server Action …" in that case.
// We detect it here and reload automatically so users recover silently.
function isStaleDeployment(error: unknown): boolean {
	return (
		error instanceof Error &&
		/failed to find server action/i.test(error.message)
	);
}

export default function QueryProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
						retry: (failureCount, error) => {
							if (isStaleDeployment(error)) return false;
							return failureCount < 1;
						},
					},
					mutations: {
						onError: (error) => {
							if (isStaleDeployment(error)) {
								window.location.reload();
							}
						},
					},
				},
			}),
	);

	// Also catch stale-deployment errors that surface outside TanStack Query
	// (e.g. direct server action calls in useEffect or event handlers).
	useEffect(() => {
		function handleUnhandledRejection(event: PromiseRejectionEvent) {
			if (isStaleDeployment(event.reason)) {
				window.location.reload();
			}
		}
		window.addEventListener("unhandledrejection", handleUnhandledRejection);
		return () =>
			window.removeEventListener(
				"unhandledrejection",
				handleUnhandledRejection,
			);
	}, []);

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
