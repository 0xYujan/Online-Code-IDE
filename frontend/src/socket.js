import { io } from 'socket.io-client';

let socket; 

export const initSocket = async () => {
  if (!socket) {
    socket = io('https://online-code-ide-backend-jvwc.onrender.com', {
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

    socket.on('code-update', ({ tab, operation }) => {
      console.log('Received code update for tab:', tab);
    });
  }

  return socket;
};

export const sendCodeChange = (projectID, operation, revision, tab) => {
  socket.emit('code-change', { projectID, operation, revision, tab });
};
