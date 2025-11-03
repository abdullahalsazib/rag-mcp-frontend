/**
 * API Service for AI MCP Agent Backend
 */

// API URL from environment variable (set via .env file)
// Default to localhost for local development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  session_id: string;
  mode: 'agent' | 'rag';
}

export interface ChatResponse {
  response: string;
  session_id: string;
  mode: string;
  tools_used: string[];
}

export interface MCPServer {
  name: string;
  url: string;
  api_key?: string;
  has_api_key?: boolean; // Indicates if API key exists (for display purposes)
}

export interface MCPServersResponse {
  status: string;
  count: number;
  servers: MCPServer[];
}

export interface SessionInfo {
  session_id: string;
  message_count: number;
  messages: ChatMessage[];
}

export interface LLMConfig {
  type: 'openai' | 'groq' | 'ollama' | 'gemini';
  model: string;
  api_key?: string;
  base_url?: string;
  api_base?: string;
}

export interface LLMConfigResponse {
  status: string;
  config: LLMConfig;
  has_api_key: boolean;
}

export interface LLMConfigSaveResponse {
  status: 'success' | 'warning';
  message: string;
  config: {
    type: string;
    model: string;
    has_api_key: boolean;
  };
}

/**
 * API Client
 */
export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Send chat message (non-streaming)
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Send chat message with streaming
   */
  async *streamMessage(request: ChatRequest): AsyncGenerator<{
    chunk: string;
    done: boolean;
    tool?: string;
    tools_used?: string[];
  }> {
    const response = await fetch(`${this.baseURL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data;
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  }

  /**
   * Get session info
   */
  async getSession(sessionId: string): Promise<SessionInfo> {
    const response = await fetch(`${this.baseURL}/api/session/${sessionId}`);
    return response.json();
  }

  /**
   * Clear session
   */
  async clearSession(sessionId: string): Promise<void> {
    await fetch(`${this.baseURL}/api/session/${sessionId}`, {
      method: 'DELETE',
    });
  }

  /**
   * List all sessions
   */
  async listSessions(): Promise<{ sessions: Array<{ session_id: string; message_count: number }> }> {
    const response = await fetch(`${this.baseURL}/api/sessions`);
    return response.json();
  }

  /**
   * List MCP servers
   */
  async listMCPServers(): Promise<MCPServersResponse> {
    const response = await fetch(`${this.baseURL}/api/mcp-servers`);
    return response.json();
  }

  /**
   * Add MCP server
   */
  async addMCPServer(server: MCPServer): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/mcp-servers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(server),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add server');
    }

    return response.json();
  }

  /**
   * Delete MCP server
   */
  async deleteMCPServer(serverName: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/mcp-servers/${encodeURIComponent(serverName)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete server');
    }

    return response.json();
  }

  /**
   * Update MCP server
   */
  async updateMCPServer(serverName: string, server: MCPServer): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/mcp-servers/${encodeURIComponent(serverName)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(server),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update server');
    }

    return response.json();
  }

  /**
   * Get tools info
   */
  async getToolsInfo(): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/tools`);
    return response.json();
  }

  /**
   * Get LLM configuration
   */
  async getLLMConfig(): Promise<LLMConfigResponse> {
    const response = await fetch(`${this.baseURL}/api/llm-config`);
    return response.json();
  }

  /**
   * Set LLM configuration
   */
  async setLLMConfig(config: LLMConfig): Promise<LLMConfigSaveResponse> {
    const response = await fetch(`${this.baseURL}/api/llm-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to set LLM configuration');
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new APIClient();

