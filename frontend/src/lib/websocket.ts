import type { WebSocketMessage } from './api/types';

export type WebSocketEventType = 
  | 'foundation_update'
  | 'differentiation_update'
  | 'approach_update'
  | 'status_update'
  | 'user_join'
  | 'user_leave'
  | 'cursor_update'
  | 'chat_message'
  | 'ping'
  | 'pong';

export interface WebSocketEvents {
  connect: () => void;
  disconnect: () => void;
  message: (message: WebSocketMessage) => void;
  error: (error: Event) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private roomId: string = '';
  private userId: string = '';
  private listeners: Map<keyof WebSocketEvents, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  // 心跳保活
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30秒发送一次心跳
  private readonly HEARTBEAT_TIMEOUT = 5000; // 5秒未收到pong则认为连接异常

  constructor() {
    this.listeners.set('connect', new Set());
    this.listeners.set('disconnect', new Set());
    this.listeners.set('message', new Set());
    this.listeners.set('error', new Set());
  }

  connect(roomId: string, userId: string) {
    // 避免重复连接
    if (this.ws?.readyState === WebSocket.OPEN && this.roomId === roomId && this.userId === userId) {
      return;
    }
    
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      this.disconnect();
    }

    this.roomId = roomId;
    this.userId = userId;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname === 'localhost' ? 'localhost:8080' : window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/ws/${roomId}?userId=${userId}`;

    console.log(`Connecting to WebSocket: ${wsUrl}`);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log(`Connected to room ${roomId} as ${userId}`);
      this.reconnectAttempts = 0;
      this.startHeartbeat(); // 开始心跳
      this.emit('connect');
    };

    this.ws.onclose = (event) => {
      console.log(`WebSocket connection closed (code: ${event.code}, reason: ${event.reason || 'none'})`);
      this.stopHeartbeat(); // 停止心跳
      this.emit('disconnect');
      
      // 只在非正常关闭时才重连 (1000是正常关闭)
      if (event.code !== 1000) {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        // 处理pong响应
        if (message.type === 'pong') {
          this.handlePong();
          return;
        }
        
        this.emit('message', message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  disconnect() {
    this.stopHeartbeat(); // 停止心跳
    
    if (this.ws) {
      // 清理事件监听器，避免在关闭过程中触发重连
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onopen = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }
  }

  send(type: WebSocketEventType, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        room_id: this.roomId,
        type,
        data,
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  on<T extends keyof WebSocketEvents>(
    event: T,
    callback: WebSocketEvents[T]
  ) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.add(callback as Function);
    }
  }

  off<T extends keyof WebSocketEvents>(
    event: T,
    callback: WebSocketEvents[T]
  ) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as Function);
    }
  }

  private emit<T extends keyof WebSocketEvents>(
    event: T,
    ...args: Parameters<WebSocketEvents[T]>
  ) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          (callback as Function)(...args);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.roomId && this.userId) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(this.roomId, this.userId);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  getConnectionStatus(): 'connecting' | 'open' | 'closing' | 'closed' {
    if (!this.ws) return 'closed';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'open';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'closed';
    }
  }

  // 心跳保活方法
  private startHeartbeat() {
    this.stopHeartbeat(); // 先清理现有的心跳
    
    this.heartbeatInterval = setInterval(() => {
      this.sendPing();
    }, this.HEARTBEAT_INTERVAL);
    
    console.log('💓 心跳保活已启动');
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
    
    console.log('💔 心跳保活已停止');
  }

  private sendPing() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('🏓 发送ping');
      this.send('ping', { timestamp: Date.now() });
      
      // 设置pong超时
      this.heartbeatTimeout = setTimeout(() => {
        console.error('💔 心跳超时，未收到pong响应');
        // 关闭连接，触发重连
        this.ws?.close(1001, 'Heartbeat timeout');
      }, this.HEARTBEAT_TIMEOUT);
    }
  }

  private handlePong() {
    console.log('🏓 收到pong响应');
    
    // 清除超时
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();

// Export the class for testing or custom instances
export default WebSocketService;