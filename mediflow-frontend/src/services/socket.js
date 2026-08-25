import { io } from 'socket.io-client';

let socket = null;

export const getSocket = (userId) => {
  if (!socket) {
    socket = io('http://localhost:5000');
  }
  if (userId) {
    socket.emit('join_user_room', userId);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};