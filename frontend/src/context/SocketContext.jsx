import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

/**
 * SocketProvider manages the lifecycle of the socket connection,
 * ensuring it only connects when a user is authenticated
 * and properly cleans up to avoid duplicate sockets or memory leaks.
 */
export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // If there's no authenticated user, don't initiate a socket connection
        if (!user) {
            setSocket(null);
            return;
        }

        let backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        if (backendUrl.endsWith("/api")) {
            backendUrl = backendUrl.slice(0, -4);
        }
        console.log(`Initializing Socket.IO client, connecting to: ${backendUrl}`);

        const socketInstance = io(backendUrl, {
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        setSocket(socketInstance);

        socketInstance.on("connect", () => {
            console.log("WebSocket client connected. Socket ID:", socketInstance.id);
        });

        socketInstance.on("connect_error", (error) => {
            console.error("WebSocket connection error:", error.message);
        });

        socketInstance.on("disconnect", (reason) => {
            console.log("WebSocket client disconnected. Reason:", reason);
        });

        // Cleanup function executed when component unmounts or user changes
        return () => {
            console.log("Cleaning up WebSocket client...");
            socketInstance.disconnect();
            setSocket(null);
        };
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

/**
 * Hook to consume socket context easily in components
 * @returns {import("socket.io-client").Socket | null}
 */
export const useSocket = () => {
    return useContext(SocketContext);
};

export default SocketContext;
