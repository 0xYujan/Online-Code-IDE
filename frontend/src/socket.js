// socket.js
import { io } from 'socket.io-client';

export const initSocket = async () => {
  const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
    transports: ['websocket'],
    reconnectionAttempts: 'Infinity',
    timeout: 10000,
    forceNew: true,
  });

  socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
  });

  return socket;
};
