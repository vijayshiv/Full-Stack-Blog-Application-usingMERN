import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("id");

    if (token && userId) {
      // Create socket connection
      const newSocket = io("http://localhost:4000", {
        auth: {
          token: token,
          userId: userId
        },
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true
      });

      newSocket.on("connect", () => {
        console.log("✅ Connected to server");
        console.log("Socket ID:", newSocket.id);
        setIsConnected(true);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from server:", reason);
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("🔌 Socket connection error:", error.message);
        console.error("Error details:", error);
        setIsConnected(false);
      });

      newSocket.on("notification", (notification) => {
        console.log("🔔 New notification received:", notification);
      });

      newSocket.on("test_response", (data) => {
        console.log("✅ Test response from server:", data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // No token, disconnect if connected
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    socket,
    isConnected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired
};
