import { useEffect } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RealTimeNotifications = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user || !user._id) return;

    // 1. Get shared socket connection
    const socket = getSocket(user._id);

    // 2. Listen for targeted status updates
    socket.on('appointment_status_update', (data) => {
      showToast(data.message, 'info');
    });

    // Cleanup: remove this listener only (don't kill the shared connection)
    return () => {
      socket.off('appointment_status_update');
    };
  }, [user]);

  return null;
};

export default RealTimeNotifications;