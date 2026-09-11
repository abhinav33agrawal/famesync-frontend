import { useState, useEffect } from 'react';
import { notificationsApi, Notification } from '@/lib/api/notifications';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchUnread = async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    setLoading(true);
    try {
      const data = await notificationsApi.getUnread();
      setNotifications(data);
      setUnreadCount(data.length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await notificationsApi.markAsRead();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchUnread();
  }, [isAuthenticated]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchUnread,
    markAsRead,
  };
};
