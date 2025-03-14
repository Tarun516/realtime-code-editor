import { io, Socket } from "socket.io-client";

// This function initializes a socket connection to the server
export const initSocket = async (): Promise<Socket> => {
  const options = {
    "force new connection": true,
    reconnectionAttempt: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };

  const socketUrl = import.meta.env.BACKEND_URL || "http://localhost:5001";

  return io(socketUrl, options);
};
