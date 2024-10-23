import { LogOut } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useAuthCheck } from "@/hooks/use-auth";

export function UserNav(): ReactNode {
    const { logout } = useAuth();
    const { data: user, isLoading } = useAuthCheck();

    if (isLoading) {
        return (
            <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
            >
                <span className="flex h-full w-full animate-pulse items-center justify-center rounded-full bg-muted">
                </span>
            </Button>
        );
    }

    const firstLetter = user?.name?.[0] ?? "U";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                >
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                        <span className="text-sm font-medium uppercase">
                            {firstLetter}
                        </span>
                    </span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-56"
            >
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user?.name ?? 'Usuário'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email ?? 'Carregando...'}
                        </p>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
