import {io} from "socket.io-client";

let socket;

export const initSocket = async () => {
    if (!socket || socket.disconnected) {
        console.log("Initializing Socket.IO connection to http://localhost:3000");
        socket = io("http://localhost:3000", {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            timeout: 10000,
        });

        socket.on("connect", () => {
            console.log("✅ Connected to server:", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Connection error:", err.message);
        });

        socket.on("disconnect", (reason) => {
            console.warn("⚠️ Disconnected from server:", reason);
        });
    } else if (socket.connected) {
        // If socket is already connected, remove all listeners except the base ones
        console.log("♻️ Reusing existing socket connection:", socket.id);
        socket.removeAllListeners();

        // Re-add base listeners
        socket.on("connect", () => {
            console.log("✅ Connected to server:", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Connection error:", err.message);
        });

        socket.on("disconnect", (reason) => {
            console.warn("⚠️ Disconnected from server:", reason);
        });
    }

    return socket;
};

export const sendCodeChange = (projectID, operation, revision, tab) => {
    socket.emit("code-change", {projectID, operation, revision, tab});
};
