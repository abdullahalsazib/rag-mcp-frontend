import { cn } from "@/lib/utils"
import * as React from "react"
import { FiCopy, FiCpu, FiEdit3, FiMoreVertical, FiRefreshCw, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi"

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
    role: "user" | "assistant"
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
    ({ className, role, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex w-full gap-4 mb-6 group",
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
            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-sm",
            role === "user"
                ? "bg-[#5436DA] text-white"
                : "bg-[#10A37F] text-white",
            className
        )}
        {...props}
    >
        {role === "user" ? <FiUser className="h-4 w-4" /> : <FiCpu className="h-4 w-4" />}
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
            "flex flex-col gap-2 text-left text-base leading-relaxed group",
            role === "user"
                ? "bg-gray-800 text-gray-300 px-6 py-2.5 rounded-full"
                : "text-white",
            className
        )}
        {...props}
    />
))
MessageContent.displayName = "MessageContent"

interface MessageActionsProps extends React.HTMLAttributes<HTMLDivElement> {
    role: "user" | "assistant"
    onCopy?: () => void
    onEdit?: () => void
    onRerun?: () => void
    onThumbsUp?: () => void
    onThumbsDown?: () => void
}

const MessageActions = React.forwardRef<HTMLDivElement, MessageActionsProps>(
    ({ className, role, onCopy, onEdit, onRerun, onThumbsUp, onThumbsDown, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-2",
                role === "user" ? "justify-end" : "justify-start",
                className
            )}
            {...props}
        >
            {role === "assistant" ? (
                <>
                    <button
                        onClick={onCopy}
                        className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-900 transition-colors active:scale-110"
                        title="Copy"
                    >
                        <FiCopy className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onThumbsUp}
                        className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-900 transition-colors active:scale-110"
                        title="Good response"
                    >
                        <FiThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onThumbsDown}
                        className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-900 transition-colors active:scale-110"
                        title="Poor response"
                    >
                        <FiThumbsDown className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-900 transition-colors active:scale-110"
                        title="Edit"
                    >
                        <FiEdit3 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onRerun}
                        className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-900 transition-colors active:scale-110"
                        title="Rerun"
                    >
                        <FiRefreshCw className="h-4 w-4" />
                    </button>
                    <button
                        className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-900 transition-colors active:scale-110"
                        title="More options"
                    >
                        <FiMoreVertical className="h-4 w-4" />
                    </button>
                </>
            ) : (
                <>
                    <button
                        onClick={onCopy}
                        className="p-1.5 text-gray-400 hover:text-gray-300 transition-colors"
                        title="Copy"
                    >
                        <FiCopy className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-1.5 text-gray-400 hover:text-gray-300 transition-colors"
                        title="Edit"
                    >
                        <FiEdit3 className="h-4 w-4" />
                    </button>
                </>
            )}
        </div>
    )
)
MessageActions.displayName = "MessageActions"

export { Message, MessageActions, MessageAvatar, MessageContent }

