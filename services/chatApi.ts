const API_BASE_URL = process.env.EXPO_PUBLIC_HTTP_BASE_URL || 'https://api.dhruvshah.se';
const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_BASE_URL || 'wss://api.dhruvshah.se';

export interface JoinRoomRequest {
  room_id: string;
  userId: string;
}

export interface HistoryMessage {
  sender: string;
  content: string;
  timestamp: string;
}

export interface JoinRoomResponse {
  success: boolean;
  message?: string;
  history?: HistoryMessage[];
}

export interface ApiRoom {
  id: string;
  name: string;
  topic: string;
  created_by: string;
}

export interface ApiUser {
  id: string;
  name: string;
}

export class ChatApiService {
  /**
   * Join a chat room with the given room ID and user ID
   */
  static async joinRoom(roomId: string, userId: string): Promise<JoinRoomResponse> {
    try {
      const joinUrl = `${API_BASE_URL}/rooms/join`;
      console.log('🌐 Attempting to join room via API:', joinUrl);
      
      const requestBody = {
        room_id: roomId,
        userId: userId,
      };
      
      const requestBodyString = JSON.stringify(requestBody);
      console.log('📤 Exact URL:', joinUrl);
      console.log('📤 Request method: POST');
      console.log('📤 Request headers:', {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      });
      console.log('📤 Request body (object):', requestBody);
      console.log('📤 Request body (JSON string):', requestBodyString);
      
      const response = await fetch(joinUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: requestBodyString,
      });

      console.log('📥 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        throw new Error(`Failed to join room: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Join room response:', data);
      return { success: true, ...data };
    } catch (error) {
      console.error('❌ Error joining room:', error);
      
      // For development/testing, we'll return success to allow WebSocket testing
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.log('⚠️ Network request failed, proceeding with WebSocket connection for testing');
        return { 
          success: true, 
          message: 'Proceeding without API join (network error)' 
        };
      }
      
      // Also proceed with WebSocket if we get a 500 error (server issue)
      if (error instanceof Error && error.message.includes('500')) {
        console.log('⚠️ Server error (500), but proceeding with WebSocket connection for testing');
        return { 
          success: true, 
          message: 'Proceeding without API join (server error)' 
        };
      }
      
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Get WebSocket URL for a room and user ID
   */
  static getWebSocketUrl(roomId: string, userId: string): string {
    return `${WS_BASE_URL}/ws/${roomId}/${userId}`;
  }

  /**
   * Get all available chat rooms
   */
  static async getRooms(): Promise<ApiRoom[]> {
    try {
      console.log('📋 Fetching rooms from API:', `${API_BASE_URL}/rooms`);
      
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📥 Get rooms response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get rooms error response:', errorText);
        throw new Error(`Failed to get rooms: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const rooms = await response.json();
      console.log('✅ Rooms fetched:', rooms.length, 'rooms');
      return rooms;
    } catch (error) {
      console.error('❌ Error fetching rooms:', error);
      throw error;
    }
  }

  /**
   * Get all available users
   */
  static async getUsers(): Promise<ApiUser[]> {
    try {
      console.log('👥 Fetching users from API:', `${API_BASE_URL}/users`);
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📥 Get users response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get users error response:', errorText);
        throw new Error(`Failed to get users: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const users = await response.json();
      console.log('✅ Users fetched:', users.length, 'users');
      return users;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Test if the API is reachable
   */
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.log('🔍 API health check failed:', error);
      return false;
    }
  }

  /**
   * Try to create the room first (in case it doesn't exist)
   */
  static async createRoom(): Promise<{ success: boolean; roomId?: string; message?: string }> {
    try {
      console.log('🏗️ Attempting to create room via API:', `${API_BASE_URL}/rooms`);
      
      const requestBody = {
        room_name: "Ethics Discussion",
        topic: "Ethics",
        created_by: "Admin"
      };
      
      console.log('📤 Create room request body:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Create room response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Create room error response:', errorText);
        return { 
          success: false, 
          message: `Failed to create room: ${response.status} ${response.statusText} - ${errorText}` 
        };
      }

      const data = await response.json();
      console.log('✅ Create room response:', data);
      return { success: true, roomId: data.id || data._id, ...data };
    } catch (error) {
      console.error('❌ Error creating room:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
}
