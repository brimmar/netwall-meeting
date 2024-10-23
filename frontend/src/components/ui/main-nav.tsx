import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";


import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/rooms", label: "Salas" },
    { href: "/bookings", label: "Reservas" },
] as const;

export const MainNav = (): ReactNode => {
    return (
        <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
                <span className="hidden font-bold sm:inline-block">Salas de Reunião</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                            "transition-colors hover:text-foreground/80",
                            "text-foreground/60"
                        )}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
};
