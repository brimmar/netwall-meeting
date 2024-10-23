import type { QueryClient } from "@tanstack/react-query";
import type { NavigateOptions } from "@tanstack/react-router";

export interface RouterContext {
	auth: {
		isAuthenticated: boolean;
	};
	queryClient: QueryClient;
}

export interface NavigateFn {
	(
		to: string,
		options?: NavigateOptions & {
			search?: Record<string, string>;
		},
	): void;
}

declare module "@tanstack/react-router" {
	interface Register {
		context: RouterContext;
	}
}
