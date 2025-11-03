import React, { useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
    content: string;
    className?: string;
}

interface CodeBlockProps {
    code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    return (
        <div className="relative group mb-3">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={handleCopy}
                    className="p-2 rounded-md bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors border border-gray-700"
                    title={copied ? 'Copied!' : 'Copy code'}
                >
                    {copied ? (
                        <FiCheck className="h-4 w-4 text-green-400" />
                    ) : (
                        <FiCopy className="h-4 w-4" />
                    )}
                </button>
            </div>
            <pre className="bg-gray-900 p-4 rounded-lg border border-gray-800 overflow-x-auto">
                <code className="block text-white text-sm font-mono">
                    {code}
                </code>
            </pre>
        </div>
    );
};

export const Markdown: React.FC<MarkdownProps> = ({ content, className = '' }) => {
    return (
        <div className={`markdown-content ${className}`} style={{ lineHeight: '1.75', fontSize: '1rem' }}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom styling for markdown elements - Black/White/Gray theme
                    p: ({ children }) => <p className="mb-3 last:mb-0 text-white" style={{ lineHeight: '1.75' }}>{children}</p>,
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-3 mt-4 text-white first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mb-2 mt-3 text-white first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-3 text-white first:mt-0">{children}</h3>,
                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                    em: ({ children }) => <em className="italic text-gray-400">{children}</em>,
                    ul: ({ children }) => (
                        <ul className="list-disc list-outside mb-3 ml-6 text-white" style={{ lineHeight: '1.75' }}>
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-outside mb-3 ml-6 text-white" style={{ lineHeight: '1.75' }}>
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="pl-2 text-white mb-2 [&:last-child]:mb-0" style={{ lineHeight: '1.75' }}>
                            {children}
                        </li>
                    ),
                    code: ({ children, className, ...props }) => {
                        const isInline = !className?.includes('language-');
                        if (isInline) {
                            return (
                                <code className="bg-gray-900 text-white px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                    {children}
                                </code>
                            );
                        }

                        // For code blocks, return the code element as-is (pre will wrap it)
                        return (
                            <code className="block text-white text-sm font-mono" {...props}>
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => {
                        // Helper function to extract text content from React nodes
                        const extractTextContent = (node: React.ReactNode): string => {
                            if (typeof node === 'string') {
                                return node;
                            }
                            if (typeof node === 'number') {
                                return String(node);
                            }
                            if (Array.isArray(node)) {
                                return node.map(extractTextContent).join('');
                            }
                            if (React.isValidElement(node) && 'props' in node && node.props) {
                                const props = node.props as { children?: React.ReactNode };
                                if (props.children) {
                                    return extractTextContent(props.children);
                                }
                            }
                            return '';
                        };

                        // Check if this pre contains a code element (code block)
                        // ReactMarkdown wraps code blocks in pre > code structure
                        const codeElement = React.isValidElement(children) &&
                            typeof children === 'object' &&
                            'type' in children &&
                            children.type === 'code'
                            ? (children as React.ReactElement<{ children: React.ReactNode; className?: string }>)
                            : null;

                        if (codeElement) {
                            // Extract code content from the code element
                            const codeString = extractTextContent(codeElement.props.children || '').replace(/\n$/, '');
                            return <CodeBlock code={codeString} />;
                        }

                        // Regular pre element (not a code block)
                        return (
                            <pre className="bg-gray-900 p-4 rounded-lg border border-gray-800 overflow-x-auto mb-3">
                                {children}
                            </pre>
                        );
                    },
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-700 pl-4 italic text-gray-400 mb-3">
                            {children}
                        </blockquote>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white underline hover:text-gray-300 transition-colors"
                        >
                            {children}
                        </a>
                    ),
                    hr: () => <hr className="border-gray-800 my-3" />,
                    table: ({ children }) => (
                        <div className="overflow-x-auto mb-2">
                            <table className="min-w-full border border-gray-800 rounded">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-gray-900">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-gray-800">{children}</tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-gray-900">{children}</tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-2 text-left text-sm font-semibold text-white border border-gray-800">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2 text-sm text-white border border-gray-800">
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
