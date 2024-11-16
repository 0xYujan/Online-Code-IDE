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
  }

  return socket;
};
