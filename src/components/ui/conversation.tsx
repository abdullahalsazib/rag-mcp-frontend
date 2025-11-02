import { cn } from "@/lib/utils"
import * as React from "react"
import { FiChevronDown } from "react-icons/fi"

const Conversation = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("relative flex flex-col overflow-hidden", className)}
        {...props}
    />
))
Conversation.displayName = "Conversation"

const ConversationContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex-1 overflow-y-auto scroll-smooth py-4 sm:py-6",
            className
        )}
        {...props}
    />
))
ConversationContent.displayName = "ConversationContent"

const ConversationScrollButton = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
    const [show, setShow] = React.useState(false)
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const content = contentRef.current?.parentElement
        if (!content) return

        const handleScroll = () => {
            const isNearBottom = content.scrollHeight - content.scrollTop - content.clientHeight < 100
            setShow(!isNearBottom)
        }

        content.addEventListener("scroll", handleScroll)
        return () => content.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToBottom = () => {
        const content = contentRef.current?.parentElement
        if (content) {
            content.scrollTo({ top: content.scrollHeight, behavior: "smooth" })
        }
    }

    return (
        <button
            ref={ref}
            onClick={scrollToBottom}
            className={cn(
                "fixed bottom-24 sm:bottom-20 right-4 sm:right-6 z-10 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 shadow-lg transition-all hover:bg-neutral-700 border border-neutral-700",
                show ? "opacity-100" : "opacity-0 pointer-events-none",
                className
            )}
            {...props}
        >
            <FiChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
    )
})
ConversationScrollButton.displayName = "ConversationScrollButton"

export { Conversation, ConversationContent, ConversationScrollButton }

