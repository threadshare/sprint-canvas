import type {
  Room,
  Foundation,
  Differentiation,
  Approach,
  CreateRoomRequest,
  AgentRequest,
  AgentResponse,
  ApiError,
} from './types';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8080/api/v1') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  // Health check
  async checkHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }

  // Room management
  async createRoom(data: CreateRoomRequest): Promise<Room> {
    return this.request<Room>('/foundation/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRoom(roomId: string): Promise<Room> {
    return this.request<Room>(`/foundation/rooms/${roomId}`);
  }

  async updateFoundation(roomId: string, foundation: Foundation): Promise<Room> {
    return this.request<Room>(`/foundation/rooms/${roomId}/foundation`, {
      method: 'PUT',
      body: JSON.stringify(foundation),
    });
  }

  async updateDifferentiation(
    roomId: string,
    differentiation: Differentiation
  ): Promise<Room> {
    return this.request<Room>(`/foundation/rooms/${roomId}/differentiation`, {
      method: 'PUT',
      body: JSON.stringify(differentiation),
    });
  }

  async updateApproach(roomId: string, approach: Approach): Promise<Room> {
    return this.request<Room>(`/foundation/rooms/${roomId}/approach`, {
      method: 'PUT',
      body: JSON.stringify(approach),
    });
  }

  async updateRoomStatus(
    roomId: string, 
    status: 'foundation' | 'differentiation' | 'approach' | 'completed'
  ): Promise<Room> {
    return this.request<Room>(`/foundation/rooms/${roomId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // AI Agents
  async askThinkAgent(request: AgentRequest): Promise<AgentResponse> {
    return this.request<AgentResponse>('/agents/think', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async askCritiqueAgent(request: AgentRequest): Promise<AgentResponse> {
    return this.request<AgentResponse>('/agents/critique', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async askResearchAgent(request: AgentRequest): Promise<AgentResponse> {
    return this.request<AgentResponse>('/agents/research', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // WebSocket URL generator
  getWebSocketUrl(roomId: string, userId: string): string {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = this.baseUrl.replace(/^https?:\/\//, '');
    return `${wsProtocol}//${wsHost}/ws/${roomId}?userId=${userId}`;
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export default ApiClient;