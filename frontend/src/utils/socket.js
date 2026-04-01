import { io } from "socket.io-client";

// Use environment variable for Socket.IO connection
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
    autoConnect: false,
});
