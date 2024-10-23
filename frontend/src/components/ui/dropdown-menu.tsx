import type { ReactElement, ReactNode, HTMLAttributes } from "react";
import React, { forwardRef, useCallback, useContext } from "react";

import { cn } from "@/lib/utils";

interface DropdownMenuContext {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContext>({
    open: false,
    setOpen: () => undefined,
});

export interface DropdownMenuProps {
    children: ReactNode;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({
    children,
    defaultOpen = false,
    onOpenChange,
}: DropdownMenuProps): ReactNode {
    const [open, setOpen] = React.useState(defaultOpen);

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
        onOpenChange?.(newOpen);
    }, [onOpenChange]);

    return (
        <DropdownMenuContext.Provider
            value={{ open, setOpen: handleOpenChange }}
        >
            <div className="relative inline-block text-left">
                {children}
            </div>
        </DropdownMenuContext.Provider>
    );
}

export interface DropdownMenuTriggerProps {
    asChild?: boolean;
    children: ReactElement;
    className?: string;
}

type ButtonHTMLProps = HTMLAttributes<HTMLButtonElement> & {
    ref?: React.Ref<HTMLButtonElement>;
    className?: string;
};

export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
    ({ children, asChild = false, className }, ref) => {
        const { open, setOpen } = useContext(DropdownMenuContext);

        const handleClick = useCallback((e: React.MouseEvent) => {
            e.stopPropagation();
            setOpen(!open);
        }, [open, setOpen]);

        if (asChild && React.isValidElement(children)) {
            const childProps = children.props as ButtonHTMLProps;
            return React.cloneElement(children, {
                'aria-expanded': open,
                'aria-haspopup': true,
                onClick: handleClick,
                className: cn(childProps.className, className),
                ref,
            } as ButtonHTMLProps);
        }

        return (
            <button
                type="button"
                ref={ref}
                onClick={handleClick}
                aria-expanded={open}
                aria-haspopup="true"
                className={cn(
                    "inline-flex items-center justify-center text-sm font-medium",
                    "transition-colors focus-visible:outline-none focus-visible:ring-1",
                    "focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    className
                )}
            >
                {children}
            </button>
        );
    }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
    align?: "start" | "center" | "end";
    sideOffset?: number;
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
    ({ className, align = "center", sideOffset = 4, children, ...props }, forwardedRef) => {
        const { open, setOpen } = useContext(DropdownMenuContext);
        const contentRef = React.useRef<HTMLDivElement>(null);

        React.useEffect(() => {
            if (forwardedRef) {
                if (typeof forwardedRef === 'function') {
                    forwardedRef(contentRef.current);
                } else {
                    forwardedRef.current = contentRef.current;
                }
            }
        }, [forwardedRef]);

        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent): void => {
                if (
                    contentRef.current &&
                    !contentRef.current.contains(event.target as Node)
                ) {
                    setOpen(false);
                }
            };

            const handleEscape = (event: KeyboardEvent): void => {
                if (event.key === "Escape") {
                    setOpen(false);
                }
            };

            if (open) {
                document.addEventListener("mousedown", handleClickOutside);
                document.addEventListener("keydown", handleEscape);
            }

            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
                document.removeEventListener("keydown", handleEscape);
            };
        }, [open, setOpen]);

        if (!open) return null;

        return (
            <div
                ref={contentRef}
                className={cn(
                    "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1",
                    "text-popover-foreground shadow-lg data-[state=open]:animate-in",
                    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
                    "data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95",
                    "data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
                    "data-[side=left]:slide-in-from-right-2",
                    "data-[side=right]:slide-in-from-left-2",
                    "data-[side=top]:slide-in-from-bottom-2",
                    {
                        "right-0": align === "end",
                        "left-0": align === "start",
                        "left-1/2 -translate-x-1/2": align === "center",
                    },
                    className
                )}
                style={{
                    marginTop: sideOffset,
                }}
                {...props}
            >
                {children}
            </div>
        );
    }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuLabel = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("px-2 py-1.5 text-sm font-semibold", className)}
        {...props}
    />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuItem = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        role="menuitem"
        className={cn(
            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm",
            "outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
            "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none",
            "data-[disabled]:opacity-50",
            className
        )}
        {...props}
    />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuSeparator = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-muted", className)}
        role="separator"
        {...props}
    />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
