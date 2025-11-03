import { cn } from "@/lib/utils"
import * as React from "react"
import { FiCpu, FiUser } from "react-icons/fi"

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
    role: "user" | "assistant"
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
    ({ className, role, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex w-full gap-3 sm:gap-4 mb-4 sm:mb-6",
                role === "user" ? "justify-end" : "justify-start",
                className
            )}
            {...props}
        />
    )
)
Message.displayName = "Message"

const MessageAvatar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { role?: "user" | "assistant" }
>(({ className, role, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 select-none items-center justify-center rounded-full",
            role === "user"
                ? "bg-neutral-800 text-neutral-300"
                : "bg-neutral-900 text-neutral-400 border border-neutral-800",
            className
        )}
        {...props}
    >
        {role === "user" ? <FiUser className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <FiCpu className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
    </div>
))
MessageAvatar.displayName = "MessageAvatar"

const MessageContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { role?: "user" | "assistant" }
>(({ className, role, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col gap-2 rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 text-base sm:text-base max-w-[90%] sm:max-w-[85%]",
            role === "user"
                ? "bg-neutral-800 text-neutral-200 border border-neutral-700"
                : "bg-neutral-900 text-neutral-300 border border-neutral-800",
            className
        )}
        {...props}
    />
))
MessageContent.displayName = "MessageContent"

export { Message, MessageAvatar, MessageContent }

