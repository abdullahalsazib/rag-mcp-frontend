import { useEffect, useRef, useState } from 'react';
import { FiCpu, FiServer, FiSettings, FiTrash2 } from 'react-icons/fi';
import { LLMManager } from './components/LLMManager';
import { MCPManager } from './components/MCPManager';
import { Conversation, ConversationContent, ConversationScrollButton } from './components/ui/conversation';
import { Loader } from './components/ui/loader';
import { Markdown } from './components/ui/markdown';
import { Message, MessageAvatar, MessageContent } from './components/ui/message';
import { PromptInput, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar } from './components/ui/prompt-input';
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const messageText = input.trim();
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
    <div className="flex flex-col h-screen bg-neutral-950 overflow-hidden">
      {/* Header */}
      <header className="bg-neutral-900 shadow-xl border-b border-neutral-800 shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-800 rounded-lg flex items-center justify-center shrink-0">
                <FiServer className="text-neutral-300 text-lg sm:text-xl" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-200">
                  AI MCP AGENT
                </h1>
                <p className="text-xs text-neutral-500 hidden sm:block">
                  {llmConfig ? `${getModelDisplayName(llmConfig)} • ` : 'Loading... • '}
                  {mode.toUpperCase()} • MCP Tools
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'agent' | 'rag')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700 transition-all font-medium cursor-pointer text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600 flex-1 sm:flex-none"
              >
                <option value="agent" className="bg-neutral-800">Agent</option>
                <option value="rag" className="bg-neutral-800">RAG</option>
              </select>

              <button
                onClick={() => setIsLLMOpen(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-all font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border border-neutral-700"
              >
                <FiCpu className="text-sm sm:text-base" />
                <span className="hidden sm:inline">LLM</span>
              </button>

              <button
                onClick={() => setIsMCPOpen(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-all font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border border-neutral-700"
              >
                <FiSettings className="text-sm sm:text-base" />
                <span className="hidden sm:inline">Servers</span>
                <span className="sm:hidden">({mcpCount})</span>
                <span className="hidden sm:inline">({mcpCount})</span>
              </button>

              <button
                onClick={handleClearChat}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-all font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border border-neutral-700"
              >
                <FiTrash2 className="text-sm sm:text-base" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className="max-w-6xl mx-auto px-4 sm:px-6">
          {messages.map((message, index) => (
            <Message key={index} role={message.role}>
              <MessageAvatar role={message.role} />
              <MessageContent role={message.role}>
                {message.tools && message.tools.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-neutral-700">
                    {message.tools.map((tool, idx) => (
                      <ToolBadge key={idx} tool={tool} />
                    ))}
                  </div>
                )}
                <div className="whitespace-pre-wrap break-words">
                  {message.role === 'assistant' ? (
                    <Markdown content={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
              </MessageContent>
            </Message>
          ))}
          {isTyping && messages[messages.length - 1]?.content === '' && (
            <Message role="assistant">
              <MessageAvatar role="assistant" />
              <MessageContent role="assistant">
                <Loader />
              </MessageContent>
            </Message>
          )}
          <div ref={messagesEndRef} />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Chat Input */}
      <div className="bg-neutral-900 border-t border-neutral-800 shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
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
              placeholder="Type your message here..."
              disabled={isTyping}
            />
            <PromptInputToolbar>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs text-neutral-500">
                <span>Mode: <span className="text-neutral-300 font-medium">{mode === 'agent' ? 'AGENT' : 'RAG'}</span></span>
              </div>
              <PromptInputSubmit disabled={!input.trim() || isTyping} />
            </PromptInputToolbar>
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
