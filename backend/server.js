const http = require('http');
const { Server } = require('socket.io'); 
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Update to your frontend's URL if necessary
    methods: ['GET', 'POST'],
  },
}); 

const userSocketMap = {};

function getAllConnectedClients(projectID) {
  return Array.from(io.sockets.adapter.rooms.get(projectID) || []).map((socketId) => {
    return {
      socketId,
      userId: userSocketMap[socketId],
    };
  });
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Listen for `join` event
  socket.on('join', ({ projectID, userId }) => {
    console.log(`User ${userId} joined project ${projectID}`);
    userSocketMap[socket.id] = userId;
    socket.join(projectID);
    const clients = getAllConnectedClients(projectID);

    // Notify all clients in the room about the new connection
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit('joined', { 
        clients,
        userId,
        socketId: socket.id,
      });
    });
  });

  // Handle `disconnect` event
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Remove the user from the map and notify others
    const userId = userSocketMap[socket.id];
    delete userSocketMap[socket.id];

    // Notify other clients in the same project rooms
    for (const projectID of socket.rooms) {
      const clients = getAllConnectedClients(projectID);
      clients.forEach(({ socketId }) => {
        io.to(socketId).emit('disconnected', { userId, socketId: socket.id });
      });
    }
  });
});

server.listen(5000, () => {
  console.log('Server listening on port 5000');
});
