import type { ReactNode } from "react";

import bgImage from "@/assets/login_bg.webp";
import { cn } from "@/lib/utils";

interface GuestLayoutProps {
    className?: string;
    children: ReactNode;
}

export function GuestLayout({ className, children }: GuestLayoutProps): ReactNode {
    return (
        <div className={cn("", className)}>
            <div className="relative flex min-h-screen w-full overflow-hidden justify-center">
                <div className="hidden md:flex md:flex-grow md:w-1/2 lg:w-4/6">
                    <div className="relative flex w-full items-center justify-center">
                        <div className="absolute inset-0">
                            <div
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                style={{
                                    backgroundImage: `url("${bgImage}")`
                                }}
                            />
                            <div className="absolute inset-0 bg-black/70" />
                        </div>

                        <div className="relative flex flex-col gap-4 z-10 text-center px-8">
                            <h1 className="text-4xl font-bold tracking-tight text-white">
                                Netwall Reservas
                            </h1>
                            <p className="text-lg text-white/80">
                                Todas as suas salas e reservas em um só lugar
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative flex md:w-1/2 lg:w-2/6 items-center justify-center flex-grow">
                    <div className="relative w-full bg-card p-8">
                        <div className="relative">
                            {children}
                        </div>
                    </div>
                </div>

                <div className="fixed inset-0 -z-10 md:hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background/5" />
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url("${bgImage}")`
                        }}
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </div>
            </div>
        </div>
    );
}
