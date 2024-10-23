import type { ReactNode } from "react";

import { MainNav } from "@/components/ui/main-nav";
import { UserNav } from "@/components/ui/user-nav";
import { useAuth } from "@/hooks/use-auth";

interface AppLayoutProps {
    children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps): ReactNode => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 max-w-full items-center px-4 sm:px-6">
                    <MainNav />
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <UserNav />
                    </div>
                </div>
            </header>
            <main className="flex-1">
                <div className="container max-w-full px-4 py-6 sm:px-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
