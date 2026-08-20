import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Matches your backend URL
const SOCKET_URL = 'http://localhost:5000';

const RealTimeNotifications = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user || !user._id) return;

    // 1. Connect to backend
    const socket = io(SOCKET_URL);

    // 2. Join private room using User ID
    socket.emit('join_user_room', user._id);

    // 3. Listen for targeted status updates
    socket.on('appointment_status_update', (data) => {
      showToast(data.message, 'info');
      // Optional: If on the Appointments page, you could trigger a refetch here!
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [user]);

  return null; // Invisible component
};

export default RealTimeNotifications;