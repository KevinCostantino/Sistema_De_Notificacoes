import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { toast } from 'react-toastify';
import { smartFixPortugueseText, processNotificationsArraySync } from '../utils/textUtils';

export const useNotifications = (userId, initialParams = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    includeRead: true,
    ...initialParams
  });

  // Fetch notifications
  const fetchNotifications = useCallback(async (customParams = {}) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const finalParams = { ...params, ...customParams };
      const result = await notificationService.getByUser(userId, finalParams);
      
      // Fix Portuguese characters in notifications usando função genérica
      const fixedNotifications = processNotificationsArraySync(result.data || []);
      
      setNotifications(fixedNotifications);
      setPagination(result.pagination || {});
      setUnreadCount(result.meta?.unreadCount || 0);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar notificações';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, params]);

  // Create notification
  const createNotification = useCallback(async (notificationData) => {
    try {
      const result = await notificationService.create(notificationData);
      toast.success('Notificação criada com sucesso!');
      
      console.log('Debug - Creating notification:', {
        notificationUserId: notificationData.userId,
        currentUserId: userId,
        shouldRefresh: notificationData.userId === userId
      });
      
      // Refresh notifications if it's for the current user
      if (notificationData.userId === userId) {
        console.log('Refreshing notifications...');
        await fetchNotifications();
      }
      
      // Return result with fixed Portuguese characters
      const fixedResult = processNotificationsArraySync([result])[0];
      return fixedResult;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar notificação';
      toast.error(errorMessage);
      throw err;
    }
  }, [userId, fetchNotifications]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      toast.success('Notificação marcada como lida');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao marcar como lida';
      toast.error(errorMessage);
    }
  }, []);

  // Mark as unread
  const markAsUnread = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsUnread(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: false }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      toast.success('Notificação marcada como não lida');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao marcar como não lida';
      toast.error(errorMessage);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationService.markAllAsRead(userId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
      
      toast.success(`${result.data?.modifiedCount || 0} notificações marcadas como lidas`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao marcar todas como lidas';
      toast.error(errorMessage);
    }
  }, [userId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.delete(notificationId);
      
      // Remove from local state
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
      
      // Update unread count if notification was unread
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notificação removida com sucesso');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao remover notificação';
      toast.error(errorMessage);
    }
  }, [notifications]);

  // Update params and refetch
  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Go to specific page
  const goToPage = useCallback((page) => {
    updateParams({ page });
  }, [updateParams]);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    pagination,
    unreadCount,
    params,
    // Actions
    fetchNotifications,
    createNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    updateParams,
    goToPage,
    refresh
  };
};