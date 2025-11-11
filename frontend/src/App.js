import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { Bell, RefreshCw } from 'lucide-react';

import { useNotifications } from './hooks/useNotifications';
import NotificationCard from './components/NotificationCard';
import NotificationFilters from './components/NotificationFilters';
import Pagination from './components/Pagination';
import CreateNotificationForm from './components/CreateNotificationForm';
import UserSelector from './components/UserSelector';
import { getDefaultUser } from './utils/mockUsers';

import './styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [currentUserId, setCurrentUserId] = useState(getDefaultUser().id);
  
  const {
    notifications,
    loading,
    error,
    pagination,
    unreadCount,
    params,
    // Actions
    createNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    updateParams,
    goToPage,
    refresh
  } = useNotifications(currentUserId);

  const handleFiltersChange = (newFilters) => {
    updateParams(newFilters);
  };

  const handleCreateNotification = async (notificationData) => {
    // Auto-assign the current user ID to the notification
    const notificationWithUserId = {
      ...notificationData,
      userId: currentUserId
    };
    return await createNotification(notificationWithUserId);
  };

  const handleUserChange = (newUserId) => {
    setCurrentUserId(newUserId);
  };

  const renderContent = () => {
    if (loading && notifications.length === 0) {
      return (
        <div className="loading">
          <RefreshCw className="animate-spin" size={24} />
          Carregando notificações...
        </div>
      );
    }

    if (error && notifications.length === 0) {
      return (
        <div className="error">
          <p>Erro ao carregar notificações: {error}</p>
          <button className="btn btn-primary" onClick={refresh}>
            Tentar Novamente
          </button>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="empty-state">
          <Bell size={64} className="mb-4" style={{ color: '#bdc3c7' }} />
          <h3>Nenhuma notificação encontrada</h3>
          <p>
            {params.includeRead === false || params.isRead === false
              ? 'Você não tem notificações não lidas no momento.'
              : 'Você ainda não tem notificações. Que tal criar uma nova?'
            }
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="notifications-list">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onMarkAsUnread={markAsUnread}
              onDelete={deleteNotification}
              loading={loading}
            />
          ))}
        </div>

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={goToPage}
        />
      </>
    );
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>
            <Bell size={32} style={{ marginRight: '1rem', verticalAlign: 'middle' }} />
            Sistema de Notificações
          </h1>
        </div>
      </header>

      <main className="container">
        <UserSelector 
          currentUserId={currentUserId}
          onUserChange={handleUserChange}
          unreadCount={unreadCount}
        />

        <CreateNotificationForm
          onSubmit={handleCreateNotification}
          loading={loading}
        />

        <NotificationFilters
          filters={params}
          onFiltersChange={handleFiltersChange}
          unreadCount={unreadCount}
          onMarkAllAsRead={markAllAsRead}
          loading={loading}
        />

        {renderContent()}
      </main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;