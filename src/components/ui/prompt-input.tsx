import { cn } from "@/lib/utils"
import * as React from "react"
import { FiSend } from "react-icons/fi"

const PromptInput = React.forwardRef<
    HTMLFormElement,
    React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => (
    <form
        ref={ref}
        className={cn("flex flex-col gap-3", className)}
        {...props}
    />
))
PromptInput.displayName = "PromptInput"

const PromptInputTextarea = React.forwardRef<
    HTMLTextAreaElement,
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    React.useImperativeHandle(ref, () => textareaRef.current!)

    React.useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "auto"
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px"
        }
    }, [props.value])

    return (
        <textarea
            ref={textareaRef}
            rows={1}
            className={cn(
                "min-h-[44px] sm:min-h-[52px] w-full resize-none rounded-lg bg-neutral-800 px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-neutral-200 placeholder-neutral-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-neutral-600 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    )
})
PromptInputTextarea.displayName = "PromptInputTextarea"

const PromptInputToolbar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center justify-between gap-2", className)}
        {...props}
    />
))
PromptInputToolbar.displayName = "PromptInputToolbar"

const PromptInputSubmit = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
    <button
        ref={ref}
        type="submit"
        className={cn(
            "inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 disabled:pointer-events-none disabled:opacity-50 border border-neutral-700 transition-colors",
            className
        )}
        {...props}
    >
        {children || (
            <>
                <span>Send</span>
                <FiSend className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </>
        )}
    </button>
))
PromptInputSubmit.displayName = "PromptInputSubmit"

export {
    PromptInput, PromptInputSubmit, PromptInputTextarea,
    PromptInputToolbar
}

