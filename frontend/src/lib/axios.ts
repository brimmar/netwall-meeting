import type { NavigateFn } from "@tanstack/react-router";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/hooks/use-auth";
import type { RefreshResponse } from "@/types/auth";
import type { ApiErrorResponse } from "@/types/common";

let navigateRef: NavigateFn | null = null;
export const setNavigate = (navigate: NavigateFn): void => {
	navigateRef = navigate;
};

export const api = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL + "/api/v1",
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: unknown) => void;
}> = [];

const processQueue = (
	error: unknown | null,
	token: string | null = null,
): void => {
	failedQueue.forEach((promise) => {
		if (error) {
			promise.reject(error);
		} else if (token) {
			promise.resolve(token);
		}
	});
	failedQueue = [];
};

const getErrorMessage = (error: AxiosError<ApiErrorResponse>): string => {
	if (error.response?.data) {
		const { message, error: errorMessage } = error.response.data;
		return message || errorMessage || "Ocorreu um erro inesperado";
	}

	return "Ocorreu um erro conectando-se ao servidor";
};

api.interceptors.request.use((config) => {
	const token = useAuthStore.getState().token;
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError<ApiErrorResponse>) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		if (!originalRequest) {
			return Promise.reject(new Error(getErrorMessage(error)));
		}

		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!originalRequest.url?.includes("/refresh") &&
			!originalRequest.url?.includes("/login")
		) {
			if (isRefreshing) {
				try {
					const token = await new Promise<string>((resolve, reject) => {
						failedQueue.push({ resolve, reject });
					});
					originalRequest.headers.Authorization = `Bearer ${token}`;
					return api(originalRequest);
				} catch (err) {
					return Promise.reject(err);
				}
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const { setToken } = useAuthStore.getState();
				const response = await api.post<RefreshResponse>("/refresh");
				const { access_token } = response.data;

				setToken(access_token);
				originalRequest.headers.Authorization = `Bearer ${access_token}`;

				processQueue(null, access_token);
				return api(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError);
				const { logout } = useAuthStore.getState();
				logout();

				if (navigateRef && window.location.pathname !== "/login") {
					navigateRef({
						to: "/login",
						search: {
							redirect: window.location.pathname,
						},
					});
				}

				return Promise.reject(
					new Error("Sua sessão expirou. Por favor entre novamente."),
				);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(new Error(getErrorMessage(error)));
	},
);
