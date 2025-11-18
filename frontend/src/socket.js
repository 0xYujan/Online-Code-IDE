import {io} from "socket.io-client";

let socket;

export const initSocket = async () => {
    if (!socket) {
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

        socket.on("code-update", ({tab, operation}) => {
            console.log("📝 Received code update for tab:", tab);
        });

        socket.on("joined", ({clients, userId}) => {
            console.log("👥 User joined:", userId, "Total clients:", clients.length);
        });
    }

    return socket;
};

export const sendCodeChange = (projectID, operation, revision, tab) => {
    socket.emit("code-change", {projectID, operation, revision, tab});
};
