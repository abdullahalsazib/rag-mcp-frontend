import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
    content: string;
    className?: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content, className = '' }) => {
    return (
        <div className={`markdown-content ${className}`} style={{ lineHeight: '1.6', fontSize: '1rem' }}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom styling for markdown elements
                    p: ({ children }) => <p className="mb-2 last:mb-0 text-neutral-300" style={{ lineHeight: '1.6' }}>{children}</p>,
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-3 text-neutral-200 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-1.5 mt-2 text-neutral-200 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold mb-1 mt-2 text-neutral-200 first:mt-0">{children}</h3>,
                    strong: ({ children }) => <strong className="font-semibold text-neutral-200">{children}</strong>,
                    em: ({ children }) => <em className="italic text-neutral-300">{children}</em>,
                    ul: ({ children }) => (
                        <ul className="list-disc list-outside mb-2 ml-6 text-neutral-300" style={{ lineHeight: '1.6' }}>
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-outside mb-2 ml-6 text-neutral-300" style={{ lineHeight: '1.6' }}>
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="pl-2 text-neutral-300 mb-1.5 [&:last-child]:mb-0" style={{ lineHeight: '1.6' }}>
                            {children}
                        </li>
                    ),
                    code: ({ children, className, ...props }) => {
                        const isInline = !className?.includes('language-');
                        if (isInline) {
                            return (
                                <code className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-xs font-mono border border-neutral-700" {...props}>
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className="block bg-neutral-800 text-neutral-200 p-3 rounded text-xs font-mono border border-neutral-700 overflow-x-auto mb-2">
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="bg-neutral-800 p-3 rounded border border-neutral-700 overflow-x-auto mb-2">
                            {children}
                        </pre>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-neutral-700 pl-4 italic text-neutral-400 mb-2">
                            {children}
                        </blockquote>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-200 underline hover:text-neutral-100 transition-colors"
                        >
                            {children}
                        </a>
                    ),
                    hr: () => <hr className="border-neutral-700 my-3" />,
                    table: ({ children }) => (
                        <div className="overflow-x-auto mb-2">
                            <table className="min-w-full border border-neutral-700 rounded">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-neutral-800">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-neutral-700">{children}</tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-neutral-800">{children}</tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-200 border border-neutral-700">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2 text-sm text-neutral-300 border border-neutral-700">
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
