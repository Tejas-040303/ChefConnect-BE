// Updated WebSocketService class for better message filtering
import { jwtDecode } from "jwt-decode";

class WebSocketService {
  static instance = null;
  static listeners = [];
  
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectTimeout = null;
    this.messageQueue = [];
    this.currentUser = null; // Store current user info
  }
  
  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }
  
  connect(token) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.socket = new WebSocket("ws://localhost:8080");
    
    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.isConnected = true;
      
      if (token) {
        const decoded = jwtDecode(token);
        const userId = decoded.id || decoded._id;
        this.currentUser = { id: userId }; // Store current user ID
        this.send(JSON.stringify({
          type: "AUTH",
          userId
        }));
      }
      
      this.notifyListeners({ type: "CONNECT" });
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        
        // Filter private messages not intended for the current user
        if (data.type === "NEW_PRIVATE_MESSAGE" && this.currentUser) {
          const message = data.message;
          const currentUserId = this.currentUser.id;
          
          // Only forward private messages to listeners if they're for the current user
          if (message) {
            const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
            const recipientId = typeof message.recipient === 'object' ? message.recipient._id : message.recipient;
            
            if (senderId === currentUserId || recipientId === currentUserId) {
              this.notifyListeners(data);
            } else {
              console.log("Filtering out private message not intended for current user");
            }
          }
        } else {
          // For all other message types, pass through to listeners
          this.notifyListeners(data);
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    };
    
    this.socket.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      this.isConnected = false;
      this.notifyListeners({ type: "DISCONNECT" });
      
      if (event.code !== 1000) {
        this.reconnectTimeout = setTimeout(() => {
          console.log("Attempting to reconnect WebSocket...");
          this.connect(token);
        }, 3000);
      }
    };
    
    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.isConnected = false;
      this.notifyListeners({ type: "ERROR", error });
    };
  }
  
  send(data) {
    const dataToSend = typeof data === 'string' ? data : JSON.stringify(data);
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(dataToSend);
      return true;
    } else if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
      console.warn("WebSocket is connecting... queueing message");
      this.messageQueue.push(dataToSend);
      this.socket.addEventListener('open', () => {
        this.flushQueue();
      }, { once: true });
      return true;
    } else {
      console.warn("WebSocket is not connected, queueing message");
      this.messageQueue.push(dataToSend);
      return false;
    }
  }
  
  flushQueue() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.messageQueue.length > 0) {
      console.log(`Flushing ${this.messageQueue.length} queued messages`);
      this.messageQueue.forEach(msg => this.socket.send(msg));
      this.messageQueue = [];
    }
  }
  
  addListener(listener) {
    WebSocketService.listeners.push(listener);
    return () => this.removeListener(listener);
  }
  
  removeListener(listener) {
    const index = WebSocketService.listeners.indexOf(listener);
    if (index !== -1) {
      WebSocketService.listeners.splice(index, 1);
    }
  }
  
  notifyListeners(data) {
    WebSocketService.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error("Error in WebSocket listener:", error);
      }
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, "Disconnecting");
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.isConnected = false;
    this.currentUser = null; // Clear user info
  }
  
  getConnectionStatus() {
    return this.isConnected;
  }
}

export default WebSocketService;