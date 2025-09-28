// Centralized app configuration using environment variables
export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  AI_SERVICE_URL: import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8000", 
  HOST_IP: import.meta.env.VITE_HOST_IP || "localhost",
  
  // WebRTC Configuration
  WEBRTC: {
    STUN_SERVER: import.meta.env.VITE_WEBRTC_STUN_SERVER || "stun:stun.l.google.com:19302",
    VIDEO_ENABLED: import.meta.env.VITE_ENABLE_VIDEO_CALLS === "true",
    AUDIO_ENABLED: true
  },
  
  // Meeting Configuration  
  MEETING: {
    ROOM_BASE_URL: `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/meeting`,
    REQUEST_TIMEOUT: 30000
  },
  
  // Socket.io Configuration
  SOCKET: {
    URL: import.meta.env.VITE_API_URL || "http://localhost:4000",
    OPTIONS: {
      transports: ['websocket', 'polling']
    }
  }
};

export default APP_CONFIG;