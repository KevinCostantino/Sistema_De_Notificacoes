import React from 'react';
import { Clock, AlertCircle, CheckCircle, Info, XCircle, Eye, EyeOff, Trash2 } from 'lucide-react';
import SafeText from './SafeText';
import './NotificationCard.css';

const NotificationCard = ({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  loading = false
}) => {
  const getTypeIcon = (type) => {
    const iconProps = { size: 20 };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="text-success" />;
      case 'warning':
        return <AlertCircle {...iconProps} className="text-warning" />;
      case 'error':
        return <XCircle {...iconProps} className="text-error" />;
      default:
        return <Info {...iconProps} className="text-info" />;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Agora';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleToggleRead = () => {
    if (notification.isRead) {
      onMarkAsUnread(notification._id);
    } else {
      onMarkAsRead(notification._id);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja remover esta notificação?')) {
      onDelete(notification._id);
    }
  };

  return (
    <div className={`notification-card ${notification.isRead ? 'read' : 'unread'} ${getPriorityClass(notification.priority)}`}>
      <div className="notification-content">
        <div className="notification-header">
          <div className="notification-type">
            {getTypeIcon(notification.type)}
          </div>
          <div className="notification-meta">
            <span className="notification-time">
              <Clock size={14} />
              {formatDate(notification.createdAt)}
            </span>
            {notification.priority === 'high' && (
              <span className="priority-badge high">Alta</span>
            )}
            {notification.priority === 'medium' && (
              <span className="priority-badge medium">Média</span>
            )}
            {notification.priority === 'low' && (
              <span className="priority-badge low">Baixa</span>
            )}
          </div>
        </div>
        
        <div className="notification-body">
          <h3 className="notification-title">
            <SafeText>{notification.title}</SafeText>
          </h3>
          <p className="notification-message">
            <SafeText>{notification.message}</SafeText>
          </p>
        </div>
      </div>
      
      <div className="notification-actions">
        <button
          className={`btn btn-sm ${notification.isRead ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleToggleRead}
          disabled={loading}
          title={notification.isRead ? 'Marcar como não lida' : 'Marcar como lida'}
        >
          {notification.isRead ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        
        <button
          className="btn btn-sm btn-danger"
          onClick={handleDelete}
          disabled={loading}
          title="Remover notificação"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;