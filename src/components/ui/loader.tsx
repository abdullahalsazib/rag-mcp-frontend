import { cn } from "@/lib/utils"
import * as React from "react"

export const Loader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        {...props}
    >
        <div className="flex gap-1.5">
            <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
        <span className="text-sm text-neutral-400 font-medium">Processing...</span>
    </div>
))
Loader.displayName = "Loader"

