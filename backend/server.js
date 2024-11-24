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
      JSON.stringify({ content: "", anchor: 0, focus: 0 }), 
      [], 
      projectID,
      (transform, revision) => revision, // Handling the revision update
      (err) => {
        if (err) console.error(`Error initializing OT for project ${projectID}:`, err);
      }
    );
  }
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Listen for 'code-change' event from client
  socket.on('code-change', ({ projectID, operation, revision, tab }) => {
    console.log("Received operation:", operation);
    console.log("Current revision:", revision);
    console.log("For tab:", tab);
  
    // Validate the operation object to ensure 'anchor' and 'focus' are defined
    if (!operation || typeof operation.anchor === 'undefined' || typeof operation.focus === 'undefined') {
      console.error("Invalid operation received. Missing 'anchor' or 'focus'.");
      return;
    }
  
    // Process the operation using OT if the project exists
    if (projectData[projectID]) {
      projectData[projectID].onOperation(socket, revision, operation, (err, updatedOperation) => {
        if (err) {
          console.error("OT processing error:", err);
          return;
        }
  
        // Broadcast the update to all clients, including the sender
        io.to(projectID).emit("code-update", { tab, operation: updatedOperation });
      });
    } else {
      console.error(`Project ${projectID} does not exist`);
    }
  });
  

  // Handle joining a project room
  socket.on('join', ({ projectID, userId }) => {
    console.log(`User ${userId} joined project ${projectID}`);
    socket.join(projectID);
    initProject(projectID); // Initialize OT for this project

    const otInstance = projectData[projectID];
    if (otInstance) {
      const latestDocument = otInstance.document;
      socket.emit('code-change', { tab: 'all', operation: latestDocument });
    }

    // Broadcast to other clients in the room that a new client has joined
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
