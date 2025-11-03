import { useEffect, useRef, useState } from 'react';
import { FiCpu, FiSettings, FiTrash2 } from 'react-icons/fi';
import { LLMManager } from './components/LLMManager';
import { MCPManager } from './components/MCPManager';
import { Conversation, ConversationContent, ConversationScrollButton } from './components/ui/conversation';
import { Loader } from './components/ui/loader';
import { Markdown } from './components/ui/markdown';
import { Message, MessageActions, MessageAvatar, MessageContent } from './components/ui/message';
import { PromptInput, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar, PromptInputTools } from './components/ui/prompt-input';
import { ToolBadge } from './components/ui/tool-badge';
import { apiClient, type LLMConfig } from './services/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  tools?: string[];
  timestamp?: Date;
}

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with coding questions, explain concepts, and provide guidance on web development topics. What would you like to know?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [mode, setMode] = useState<'agent' | 'rag'>('agent');
  const [isTyping, setIsTyping] = useState(false);
  const [isMCPOpen, setIsMCPOpen] = useState(false);
  const [isLLMOpen, setIsLLMOpen] = useState(false);
  const [mcpCount, setMCPCount] = useState(0);
  const [llmConfig, setLlmConfig] = useState<LLMConfig | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadMCPCount();
    loadLLMConfig();
  }, []);

  const loadMCPCount = async () => {
    try {
      const response = await apiClient.listMCPServers();
      setMCPCount(response.servers.length);
    } catch (error) {
      console.error('Failed to load MCP count:', error);
    }
  };

  const loadLLMConfig = async () => {
    try {
      const response = await apiClient.getLLMConfig();
      setLlmConfig(response.config);
    } catch (error) {
      console.error('Failed to load LLM config:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent, customMessage?: string) => {
    e.preventDefault();

    const messageText = (customMessage || input.trim());
    if (!messageText || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Add empty assistant message placeholder
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: '',
        tools: [],
        timestamp: new Date(),
      },
    ]);

    try {
      let assistantContent = '';
      const tools: string[] = [];

      for await (const data of apiClient.streamMessage({
        message: messageText,
        session_id: sessionId,
        mode: mode,
      })) {
        if (data.tool) {
          tools.push(data.tool);
          // Update tools immediately to show badges
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: assistantContent,
              tools: tools,
              timestamp: new Date(),
            };
            return updated;
          });
        }

        if (data.chunk) {
          assistantContent += data.chunk;
          // Update the last assistant message
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: assistantContent,
              tools: tools.length > 0 ? tools : undefined,
              timestamp: new Date(),
            };
            return updated;
          });
        }

        if (data.done) {
          setIsTyping(false);
        }
        // TypeScript Fix: Type guard for error property
        if ('error' in data && data.error) {
          setIsTyping(false);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: `Error: ${data.error}\n\nPlease check:\n- Ollama is running (if using Ollama)\n- Base URL is correct (for Docker, try http://host.docker.internal:11434)\n- Model name is correct`,
              timestamp: new Date(),
            };
            return updated;
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error streaming message:', error);
      setIsTyping(false);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `Sorry, I encountered an error processing your request: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date(),
        };
        return updated;
      });
    }
  };

  const handleClearChat = async () => {
    try {
      await apiClient.clearSession(sessionId);
      setMessages([
        {
          role: 'assistant',
          content: 'Chat cleared. How can I help you?',
          timestamp: new Date(),
        }
      ]);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  const handleServerAdded = () => {
    loadMCPCount();
  };

  const getModelDisplayName = (config: LLMConfig): string => {
    if (config.type === 'ollama') {
      return config.model || 'Ollama';
    } else if (config.type === 'groq') {
      return config.model || 'Groq';
    } else if (config.type === 'gemini') {
      return config.model || 'Gemini';
    } else {
      // OpenAI
      return config.model || 'GPT-4o';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      {/* Minimal Header - ChatGPT Style */}
      <header className="bg-black border-b border-gray-800 shrink-0 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold text-white">
                {llmConfig ? getModelDisplayName(llmConfig) : 'AI Assistant'}
              </h1>
              <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-900 rounded">
                {mode.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsLLMOpen(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
                title="LLM Settings"
              >
                <FiCpu className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsMCPOpen(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-colors relative"
                title="MCP Servers"
              >
                <FiSettings className="h-4 w-4" />
                {mcpCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-green-500 rounded-full text-[10px] flex items-center justify-center text-white">
                    {mcpCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleClearChat}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
                title="Clear Chat"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages - ChatGPT Style Centered */}
      <Conversation className="flex-1 min-h-0 bg-black">
        <ConversationContent className="max-w-3xl mx-auto px-4 py-6">
          {messages.map((message, index) => {
            const handleCopy = () => {
              navigator.clipboard.writeText(message.content);
              // You could add a toast notification here
            };

            const handleEdit = () => {
              if (message.role === 'user') {
                // Load message content into input field
                setInput(message.content);
                // Scroll to input field
                setTimeout(() => {
                  const textarea = document.querySelector('textarea');
                  if (textarea) {
                    textarea.focus();
                    textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 100);
              } else if (message.role === 'assistant') {
                // For assistant messages, find the previous user message and edit that
                if (index > 0) {
                  const prevMessage = messages[index - 1];
                  if (prevMessage.role === 'user') {
                    setInput(prevMessage.content);
                    // Remove messages from the edited user message onwards
                    setMessages((prev) => prev.slice(0, index - 1));
                    // Scroll to input field
                    setTimeout(() => {
                      const textarea = document.querySelector('textarea');
                      if (textarea) {
                        textarea.focus();
                        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }
                }
              }
            };

            const handleRerun = () => {
              if (message.role === 'assistant') {
                // Find the user message that prompted this assistant response
                if (index > 0) {
                  const userMessage = messages[index - 1];
                  if (userMessage.role === 'user') {
                    // Remove all messages from this assistant response onwards
                    const messageToRerun = userMessage.content;
                    setMessages((prev) => prev.slice(0, index));
                    // Trigger a new response
                    setTimeout(() => {
                      handleSendMessage({ preventDefault: () => { } } as any, messageToRerun);
                    }, 100);
                  }
                }
              } else if (message.role === 'user') {
                // Rerun the user message - remove assistant response and regenerate
                if (index + 1 < messages.length && messages[index + 1].role === 'assistant') {
                  const messageToRerun = message.content;
                  setMessages((prev) => prev.slice(0, index + 1));
                  setTimeout(() => {
                    handleSendMessage({ preventDefault: () => { } } as any, messageToRerun);
                  }, 100);
                }
              }
            };

            const handleThumbsUp = () => {
              console.log('Thumbs up for message:', index);
              // You could send feedback to backend here
            };

            const handleThumbsDown = () => {
              console.log('Thumbs down for message:', index);
              // You could send feedback to backend here
            };

            return (
              <Message key={index} role={message.role}>
                {message.role === 'assistant' && <MessageAvatar role={message.role} />}
                <div className="flex flex-col">
                  <MessageContent role={message.role}>
                    {message.tools && message.tools.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {message.tools.map((tool, idx) => (
                          <ToolBadge key={idx} tool={tool} />
                        ))}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed" style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}>
                      {message.role === 'assistant' ? (
                        message.content === '' && isTyping ? (
                          <Loader />
                        ) : (
                          <Markdown content={message.content} />
                        )
                      ) : (
                        message.content
                      )}
                    </div>
                  </MessageContent>
                  <MessageActions
                    role={message.role}
                    onCopy={handleCopy}
                    onEdit={handleEdit}
                    onRerun={handleRerun}
                    onThumbsUp={message.role === 'assistant' ? handleThumbsUp : undefined}
                    onThumbsDown={message.role === 'assistant' ? handleThumbsDown : undefined}
                  />
                </div>
              </Message>
            );
          })}
          <div ref={messagesEndRef} />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Chat Input - Modern Style */}
      <div className="bg-black border-t border-gray-800 shrink-0 sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <PromptInput onSubmit={handleSendMessage}>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
              placeholder="Ask anything"
              disabled={isTyping}
              toolsButton={
                <PromptInputTools
                  mode={mode}
                  onModeChange={(newMode) => setMode(newMode)}
                />
              }
              submitButton={<PromptInputSubmit disabled={!input.trim() || isTyping} />}
            />
            <PromptInputToolbar />
          </PromptInput>
        </div>
      </div>

      {/* MCP Manager Modal */}
      <MCPManager
        isOpen={isMCPOpen}
        onClose={() => setIsMCPOpen(false)}
        onServerAdded={handleServerAdded}
      />

      {/* LLM Manager Modal */}
      <LLMManager
        isOpen={isLLMOpen}
        onClose={() => setIsLLMOpen(false)}
        onConfigChanged={() => {
          // Reload config when changed
          loadLLMConfig();
          console.log('LLM configuration updated');
        }}
      />
    </div>
  );
}

export default App;
