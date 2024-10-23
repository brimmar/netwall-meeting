import { Eye, EyeOff } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { useState, forwardRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
    extends Omit<ComponentPropsWithoutRef<"input">, "type"> {
    wrapperClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, wrapperClassName, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        return (
            <div className={cn("relative", wrapperClassName)}>
                <Input
                    type={showPassword ? "text" : "password"}
                    className={cn("pr-10", className)}
                    ref={ref}
                    {...props}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                        {showPassword ? "Ocultar senha" : "Mostrar senha"}
                    </span>
                </Button>
            </div>
        );
    }
);
PasswordInput.displayName = "PasswordInput";
