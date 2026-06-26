import React, { createContext, useContext } from "react";
import { getSocket } from "../services/socket";

const SocketContext = createContext(null);

/**
 * Thin wrapper around the shared socket service (cookie auth via Vite proxy).
 * Connection lifecycle is managed in AppInitializer + services/socket.js.
 */
export const SocketProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={getSocket()}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

export default SocketContext;
