import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email("Endereço de email inválido."),
	password: z.string().min(8, "A senha precise ter ao menos 8 caracteres."),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export interface AuthResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
}

export interface AuthError {
	message: string;
}

export interface RefreshResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
}

export interface User {
	id: number;
	name: string;
	email: string;
}

export interface AuthState {
	token: string | null;
	user: User | null;
	setToken: (token: string | null) => void;
	setUser: (user: User | null) => void;
	logout: () => void;
}
