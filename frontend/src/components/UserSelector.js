import React from 'react';
import { User, ChevronDown } from 'lucide-react';
import { MOCK_USERS } from '../utils/mockUsers';
import './UserSelector.css';

const UserSelector = ({ currentUserId, onUserChange, unreadCount }) => {
  const currentUser = MOCK_USERS.find(user => user.id === currentUserId);

  return (
    <div className="user-selector">
      <div className="user-selector-label">
        <User size={16} />
        <span>Usuário Atual:</span>
      </div>
      
      <div className="user-selector-dropdown">
        <select 
          value={currentUserId} 
          onChange={(e) => onUserChange(e.target.value)}
          className="user-select"
        >
          {MOCK_USERS.map(user => (
            <option key={user.id} value={user.id}>
              {user.avatar} {user.name} ({user.role})
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="dropdown-icon" />
      </div>

      {currentUser && (
        <div className="current-user-info">
          <div className="user-avatar">{currentUser.avatar}</div>
          <div className="user-details">
            <div className="user-name">{currentUser.name}</div>
            <div className="user-email">{currentUser.email}</div>
          </div>
          {unreadCount > 0 && (
            <div className="unread-badge">
              {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSelector;