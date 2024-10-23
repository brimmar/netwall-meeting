import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { create } from "zustand";

import { api, setNavigate } from "@/lib/axios";
import type {
	AuthError,
	AuthResponse,
	AuthState,
	LoginCredentials,
	RefreshResponse,
	User,
} from "@/types/auth";

export const useAuthStore = create<AuthState>((set) => ({
	token: localStorage.getItem("token"),
	user: null,
	setToken: (token: string | null) => {
		set({ token });
		if (token) {
			localStorage.setItem("token", token);
			api.defaults.headers.common.Authorization = `Bearer ${token}`;
		} else {
			localStorage.removeItem("token");
			delete api.defaults.headers.common.Authorization;
		}
	},
	setUser: (user: User | null) => set({ user }),
	logout: () => {
		set({ token: null, user: null });
		localStorage.removeItem("token");
		delete api.defaults.headers.common.Authorization;
	},
}));

interface UseAuthReturn {
	token: string | null;
	user: User | null;
	login: (credentials: LoginCredentials) => void;
	refresh: () => void;
	logout: () => void;
	isLoading: boolean;
	error: AuthError | null;
}

export const useAuth = (): UseAuthReturn => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { token, user, setToken, setUser, logout: clearAuth } = useAuthStore();

	useEffect(() => {
		setNavigate(navigate);
	}, [navigate]);

	const fetchUserMutation = useMutation({
		mutationFn: async () => {
			const { data } = await api.get<User>("/me");
			return data;
		},
		onSuccess: (userData) => {
			setUser(userData);
		},
	});

	const loginMutation = useMutation<AuthResponse, AuthError, LoginCredentials>({
		mutationFn: async (credentials) => {
			const { data } = await api.post<AuthResponse>("/login", credentials);
			return data;
		},
		onSuccess: async (data) => {
			setToken(data.access_token);
			await fetchUserMutation.mutateAsync();

			const searchParams = new URLSearchParams(window.location.search);
			const redirectTo = searchParams.get("redirect") || "/";
			navigate({ to: redirectTo });
		},
		onError: (error) => {
			clearAuth();
			throw error;
		},
	});

	const refreshMutation = useMutation<RefreshResponse, AuthError>({
		mutationFn: async () => {
			const { data } = await api.post<RefreshResponse>("/refresh");
			return data;
		},
		onSuccess: async (data) => {
			setToken(data.access_token);
			if (!user) {
				await fetchUserMutation.mutateAsync();
			}
		},
		onError: () => {
			clearAuth();
			navigate({ to: "/login" });
		},
	});

	const logoutMutation = useMutation({
		mutationFn: () => api.post("/logout"),
		onSettled: () => {
			clearAuth();
			queryClient.clear();
			navigate({ to: "/login" });
		},
	});

	return {
		token,
		user,
		login: loginMutation.mutate,
		refresh: refreshMutation.mutate,
		logout: logoutMutation.mutate,
		isLoading:
			loginMutation.isPending ||
			refreshMutation.isPending ||
			logoutMutation.isPending ||
			fetchUserMutation.isPending,
		error: (loginMutation.error ??
			refreshMutation.error ??
			logoutMutation.error) as AuthError | null,
	};
};

export const useAuthCheck = (): UseQueryResult<User | null, unknown> => {
	const { token } = useAuthStore();
	const { setUser } = useAuthStore();

	return useQuery({
		queryKey: ["auth", "user"],
		queryFn: async () => {
			if (!token) return null;
			try {
				const { data } = await api.get<User>("/me");
				setUser(data);
				return data;
			} catch (error) {
				return null;
			}
		},
		enabled: !!token,
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
		staleTime: 1000 * 60 * 5,
	});
};
