import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(sessionId) {
  if (socket) return socket;
  const url = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  socket = io(url, { transports: ['websocket'], autoConnect: true });

  socket.on('connect', () => {
    console.log('socket connected', socket.id);
    if (sessionId) socket.emit('start-session', { sessionId });
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected');
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
