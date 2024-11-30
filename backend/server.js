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

const port = 5000;

let projects = {};

// Socket.io event handling
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('join', ({ projectID, userId }) => {
    socket.join(projectID);
    console.log(`${userId} joined the room`);
    
    if (!projects[projectID]) {
      projects[projectID] = {
        clients: [],
        htmlCode: "<h1>Hello world</h1>",
        cssCode: "body { background-color: #f4f4f4; }",
        jsCode: "// some comment",
      };
    }
    
    projects[projectID].clients.push(userId);
    io.to(projectID).emit('joined', { clients: projects[projectID].clients, userId });
  });

  socket.on('code-change', ({ projectID, tab, operation }) => {
    if (tab === 'html') projects[projectID].htmlCode = operation.content;
    else if (tab === 'css') projects[projectID].cssCode = operation.content;
    else if (tab === 'js') projects[projectID].jsCode = operation.content;

    socket.in(projectID).emit('code-update', { tab, operation });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});