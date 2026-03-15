const { Server } = require("socket.io");

let io;

const init = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "*", // Ready for production domain
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { init, getIo };
