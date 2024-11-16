import React, { useEffect, useState } from "react";
import { initSocket } from "../socket";

const Collaboration = ({ projectID, userID }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const setupSocket = async () => {
      const socketInstance = await initSocket();
      setSocket(socketInstance);

      // Join the project
      socketInstance.emit("join", { projectID, userId: userID });

      // Listen for code updates
      socketInstance.on("code-update", ({ tab, operation }) => {
        console.log("Received code update:", { tab, operation });
        // Apply the operation to your editor
      });

      // Handle other events
      socketInstance.on("joined", ({ clients }) => {
        console.log("Other clients:", clients);
      });

      socketInstance.on("disconnect", (reason) => {
        console.warn("Socket disconnected:", reason);
      });
    };

    setupSocket();

    // Cleanup on unmount
    return () => {
      if (socket) socket.disconnect();
    };
  }, [projectID, userID]);

  return <div>Collaborative Editor for Project: {projectID}</div>;
};

export default Collaboration;
