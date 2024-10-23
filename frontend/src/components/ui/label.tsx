import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/lib/utils";

const Label = forwardRef<HTMLLabelElement, ComponentPropsWithoutRef<"label">>(
    ({ className, ...props }, ref) => (
        <label
            ref={ref}
            className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                className
            )}
            {...props}
        />
    )
);
Label.displayName = "Label";

export { Label };
