import { cn } from "@/lib/utils"
import * as React from "react"
import { FiSend, FiTool } from "react-icons/fi"

const PromptInput = React.forwardRef<
    HTMLFormElement,
    React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => (
    <form
        ref={ref}
        className={cn("flex flex-col gap-0", className)}
        {...props}
    />
))
PromptInput.displayName = "PromptInput"

interface PromptInputTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    submitButton?: React.ReactNode
    toolsButton?: React.ReactNode
}

const PromptInputTextarea = React.forwardRef<
    HTMLTextAreaElement,
    PromptInputTextareaProps
>(({ className, submitButton, toolsButton, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    React.useImperativeHandle(ref, () => textareaRef.current!)

    React.useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            // Reset height to get accurate scrollHeight
            textarea.style.height = "auto"
            // Set height based on content, max 200px
            const newHeight = Math.min(textarea.scrollHeight, 200)
            textarea.style.height = `${newHeight}px`
        }
    }, [props.value])

    return (
        <div className="relative w-full">
            <div className="relative w-full rounded-2xl bg-gray-900 border border-gray-800 shadow-sm focus-within:border-gray-700 focus-within:shadow-md transition-all flex items-center">
                {toolsButton && (
                    <div className="absolute left-2 bottom-2.5 z-10">
                        {toolsButton}
                    </div>
                )}
                <textarea
                    ref={textareaRef}
                    rows={1}
                    className={cn(
                        "w-full resize-none bg-transparent pr-14 pl-4 py-3.5 text-base text-white placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 max-h-[200px] overflow-y-auto leading-normal",
                        toolsButton ? "pl-24" : "pl-4",
                        className
                    )}
                    style={{
                        minHeight: '52px',
                        height: 'auto',
                    }}
                    {...props}
                />
                {submitButton && (
                    <div className="absolute right-2 bottom-2.5">
                        {submitButton}
                    </div>
                )}
            </div>
        </div>
    )
})
PromptInputTextarea.displayName = "PromptInputTextarea"

const PromptInputToolbar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("hidden", className)}
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
            "inline-flex items-center justify-center w-9 h-9 rounded-full text-white bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95",
            className
        )}
        {...props}
    >
        {children || (
            <FiSend className="h-4 w-4 text-black" />
        )}
    </button>
))

interface PromptInputToolsProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    mode: 'agent' | 'rag'
    onModeChange?: (mode: 'agent' | 'rag') => void
}

const PromptInputTools = React.forwardRef<HTMLButtonElement, PromptInputToolsProps>(
    ({ className, mode, onModeChange, ...props }, ref) => (
        <button
            ref={ref}
            type="button"
            onClick={() => onModeChange?.(mode === 'agent' ? 'rag' : 'agent')}
            className={cn(
                "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700",
                mode === 'agent'
                    ? "bg-gray-900 text-white"
                    : "bg-gray-800 text-gray-300",
                className
            )}
            {...props}
        >
            <FiTool className="h-3.5 w-3.5" />
            <span className="capitalize">{mode}</span>
        </button>
    )
)
PromptInputTools.displayName = "PromptInputTools"
PromptInputSubmit.displayName = "PromptInputSubmit"

export {
    PromptInput, PromptInputSubmit, PromptInputTextarea,
    PromptInputToolbar, PromptInputTools
}

