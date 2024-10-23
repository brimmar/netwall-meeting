import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";

import PageTitle from "@/components/layouts/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/hooks/use-auth";
import type { LoginCredentials } from "@/types/auth";
import { loginSchema } from "@/types/auth";

export function LoginPage(): ReactNode {
    const navigate = useNavigate();
    const { redirect } = useSearch({ from: '/login' });
    const { login, isLoading, error } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCredentials>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = handleSubmit(async (data) => {
        try {
            await login(data);
            navigate({ to: redirect || "/" });
        } catch (err) {
            //
        }
    });

    return (
        <>
            <PageTitle title="Entrar" />
            <div className="flex flex-grow items-center justify-center">
                <div className="max-w-md w-full space-y-8 p-8 bg-white">
                    <div>
                        <h2 className="text-center text-3xl font-extrabold text-gray-900">
                            Reservas de Salas de Reunião
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Por favor, entre para continuar
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                                {error.message}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email
                                </label>
                                <div className="mt-1">
                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        {...register("email")}
                                        aria-invalid={errors.email ? "true" : "false"}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Senha
                                </label>
                                <div className="mt-1">
                                    <PasswordInput
                                        id="password"
                                        autoComplete="current-password"
                                        {...register("password")}
                                        aria-invalid={errors.password ? "true" : "false"}
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Entrando..." : "Entrar"}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}
