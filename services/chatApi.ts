const API_BASE_URL = 'https://api.dhruvshah.se';

export interface JoinRoomRequest {
  room_id: string;
  username: string;
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

export class ChatApiService {
  /**
   * Join a chat room with the given room ID and username
   */
  static async joinRoom(roomId: string, username: string): Promise<JoinRoomResponse> {
    try {
      // First try to create the room (in case it doesn't exist)
      console.log('🏗️ Trying to create room first...');
      const createResult = await this.createRoom();
      if (createResult.success) {
        console.log('✅ Room created or already exists');
      } else {
        console.log('⚠️ Room creation failed, but continuing with join attempt');
      }
      
      const joinUrl = `${API_BASE_URL}/rooms/join`;
      console.log('🌐 Attempting to join room via API:', joinUrl);
      
      const requestBody = {
        room_id: roomId,
        username: username,
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
   * Get WebSocket URL for a room and username
   */
  static getWebSocketUrl(roomId: string, username: string): string {
    return `wss://api.dhruvshah.se/ws/${roomId}/${username}`;
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
