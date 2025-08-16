export interface WebSocketMessage {
  type: 'message' | 'user_joined' | 'user_left' | 'error';
  content?: string;
  username?: string;
  timestamp?: string;
  data?: any;
}

export interface WebSocketServiceCallbacks {
  onMessage: (message: WebSocketMessage) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onError: (error: Event) => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private callbacks: WebSocketServiceCallbacks;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;

  constructor(url: string, callbacks: WebSocketServiceCallbacks) {
    this.url = url;
    this.callbacks = callbacks;
  }

  connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    console.log('🔌 Connecting to WebSocket:', this.url);

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.callbacks.onConnect();
      };

      this.ws.onmessage = (event) => {
        console.log('📨 Raw WebSocket data received:', event.data);
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 Parsed WebSocket message:', message);
          this.callbacks.onMessage(message);
        } catch (error) {
          console.log('📨 Received plain text message:', event.data);
          // Handle plain text messages - assume they are chat messages
          const textMessage: WebSocketMessage = {
            type: 'message',
            content: event.data,
            username: 'Unknown User',
            timestamp: new Date().toISOString()
          };
          console.log('📨 Created text message object:', textMessage);
          this.callbacks.onMessage(textMessage);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.callbacks.onDisconnect();
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        this.callbacks.onError(error);
      };
    } catch (error) {
      console.error('❌ Error creating WebSocket:', error);
      this.isConnecting = false;
      this.callbacks.onError(error as Event);
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect();
      }
    }, delay);
  }

  sendMessage(content: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not connected, cannot send message');
      return false;
    }

    try {
      const message = {
        type: 'message',
        content,
        timestamp: new Date().toISOString()
      };
      
      this.ws.send(JSON.stringify(message));
      console.log('📤 Message sent:', content);
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return false;
    }
  }

  disconnect(): void {
    if (this.ws) {
      console.log('🔌 Disconnecting WebSocket');
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getReadyState(): number | null {
    return this.ws ? this.ws.readyState : null;
  }
}
