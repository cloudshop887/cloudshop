import { io } from "socket.io-client";

// Use the existing React environment variables
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "https://mrklocal.onrender.com";

export const socket = io(SOCKET_URL, {
    autoConnect: false,
});
