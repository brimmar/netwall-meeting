import { type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
}

interface DialogContentProps {
    children: ReactNode;
    className?: string;
}

interface DialogHeaderProps {
    className?: string;
    children: ReactNode;
}

interface DialogFooterProps {
    className?: string;
    children: ReactNode;
}

interface DialogTitleProps {
    className?: string;
    children: ReactNode;
}

interface DialogDescriptionProps {
    className?: string;
    children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps): ReactNode {
    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onOpenChange?.(false);
                }
            }}
        >
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
            {children}
        </div>,
        document.body
    );
}

export function DialogContent({
    children,
    className,
}: DialogContentProps): ReactNode {
    return (
        <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <div className={cn("grid gap-4", className)}>{children}</div>
        </div>
    );
}

export function DialogHeader({
    className,
    children,
}: DialogHeaderProps): ReactNode {
    return (
        <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
            {children}
        </div>
    );
}

export function DialogFooter({
    className,
    children,
}: DialogFooterProps): ReactNode {
    return (
        <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
            {children}
        </div>
    );
}

export function DialogTitle({
    className,
    children,
}: DialogTitleProps): ReactNode {
    return (
        <div
            className={cn(
                "text-lg font-semibold leading-none tracking-tight",
                className
            )}
        >
            {children}
        </div>
    );
}

export function DialogDescription({
    className,
    children,
}: DialogDescriptionProps): ReactNode {
    return (
        <div
            className={cn("text-sm text-muted-foreground", className)}
        >
            {children}
        </div>
    );
}
