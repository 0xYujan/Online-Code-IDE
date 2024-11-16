const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const OT = require('ot'); // Operational Transformation library

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Frontend URL
    methods: ['GET', 'POST'],
  },
});

const projectData = {}; // Stores OT instances for each project

function initProject(projectID) {
  if (!projectData[projectID]) {
    projectData[projectID] = new OT.EditorSocketIOServer(
      JSON.stringify({ content: "", anchor: 0, focus: 0 }), // Ensure 'anchor' and 'focus' exist
      [],
      projectID,
      (transform, revision) => revision,
      (err) => {
        if (err) console.error(`Error initializing OT for project ${projectID}:`, err);
      }
    );
  }
}



io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Example: Adding the `code-change` listener here
  socket.on("code-change", ({ projectID, operation, revision, tab }) => {
    if (!operation || typeof operation.content !== 'string' || !operation.anchor || !operation.focus) {
      console.error("Invalid operation received:", operation);
      return;
    }
  
    console.log("Operation content:", operation.content);
    console.log("Operation anchor:", operation.anchor);
    console.log("Operation focus:", operation.focus);
  
    if (projectData[projectID]) {
      projectData[projectID].onOperation(socket, revision, operation, (err, updatedOperation) => {
        if (err) {
          console.error("OT processing error:", err);
          return;
        }
        socket.to(projectID).emit("code-update", { tab, operation: updatedOperation });
      });
    } else {
      console.error(`Project ${projectID} does not exist`);
    }
  });
  
  
  


  // Additional code for joining and disconnecting
  socket.on('join', ({ projectID, userId }) => {
    console.log(`User ${userId} joined project ${projectID}`);
    socket.join(projectID);
    initProject(projectID);

    const otInstance = projectData[projectID];
    if (otInstance) {
      const latestDocument = otInstance.document;
      socket.emit('code-update', { tab: 'all', operation: latestDocument });
    }

    const clients = Array.from(io.sockets.adapter.rooms.get(projectID) || []).map((socketId) => ({
      socketId,
      userId,
    }));
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit('joined', { clients, userId, socketId: socket.id });
    });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(5000, () => {
  console.log('Server listening on port 5000');
});
