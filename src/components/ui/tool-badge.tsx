import { cn } from "@/lib/utils"
import * as React from "react"
import { FiTool } from "react-icons/fi"

const ToolBadge = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { tool: string }
>(({ className, tool, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium bg-neutral-800 text-neutral-400 border border-neutral-700",
            className
        )}
        {...props}
    >
        <FiTool className="h-3 w-3" />
        <span>{tool}</span>
    </div>
))
ToolBadge.displayName = "ToolBadge"

export { ToolBadge }

