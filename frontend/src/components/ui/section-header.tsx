import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function SectionHeader({
    title,
    description,
    action,
    className
}: SectionHeaderProps): ReactNode {
    return (
        <div className={cn("flex items-center justify-between", className)}>
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {action && (
                <div className="ml-4">{action}</div>
            )}
        </div>
    );
}
