const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const OT = require('ot'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'],
  },
});

const projectData = {}; 

function initProject(projectID) {
  if (!projectData[projectID]) {
    projectData[projectID] = new OT.EditorSocketIOServer(
      JSON.stringify({ content: "", anchor: 0, focus: 0 }), 
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

  socket.on("code-change", ({ projectID, operation, revision, tab }) => {

    if (!operation || typeof operation.anchor === "undefined" || typeof operation.focus === "undefined") {
      console.error("Invalid operation received:", operation);
      return; 
    }

    if (projectData[projectID]) {
      projectData[projectID].onOperation(socket, revision, operation, (err, updatedOperation) => {
        if (err) {
          console.error("OT processing error:", err);
          return;
        }
        socket.to(projectID).emit("code-update", { tab, operation: updatedOperation });
      });
    }
  });

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
