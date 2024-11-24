// src/socket.js
import { io } from 'socket.io-client';

let socket; // Singleton socket instance

export const initSocket = async () => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.warn('Disconnected from server:', reason);
    });

    // Listen for 'code-update' event from server and process it
    socket.on('code-update', ({ tab, operation }) => {
      console.log('Received code update for tab:', tab);
      // Apply the operation to your document or update your UI here
    });
  }

  return socket;
};

// Emit the 'code-change' event to server with project ID and operation data
export const sendCodeChange = (projectID, operation, revision, tab) => {
  socket.emit('code-change', { projectID, operation, revision, tab });
};
