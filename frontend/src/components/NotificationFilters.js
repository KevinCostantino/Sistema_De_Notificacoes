import React, { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import './NotificationFilters.css';

const NotificationFilters = ({
  filters,
  onFiltersChange,
  unreadCount,
  onMarkAllAsRead,
  loading = false
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filtering
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 10,
      includeRead: true
    });
  };

  const hasActiveFilters = () => {
    return !filters.includeRead || filters.type || filters.priority || filters.isRead !== undefined;
  };

  return (
    <div className="notification-filters">
      <div className="filters-header">
        <div className="filters-info">
          <span className="unread-count">
            {unreadCount > 0 && (
              <span className="badge">
                {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
              </span>
            )}
          </span>
        </div>

        <div className="filters-actions">
          {unreadCount > 0 && (
            <button
              className="btn btn-sm btn-success"
              onClick={onMarkAllAsRead}
              disabled={loading}
              title="Marcar todas como lidas"
            >
              <Check size={16} />
              Marcar todas como lidas
            </button>
          )}

          <button
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filtros
            {hasActiveFilters() && <span className="filter-indicator" />}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-row">
            <div className="filter-group">
              <label className="filter-label">Status de Leitura:</label>
              <select
                className="form-select"
                value={filters.isRead !== undefined ? filters.isRead.toString() : 'all'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'all') {
                    const newFilters = { ...filters };
                    delete newFilters.isRead;
                    handleFilterChange('isRead', undefined);
                    onFiltersChange({ ...newFilters, includeRead: true });
                  } else {
                    handleFilterChange('isRead', value === 'true');
                    handleFilterChange('includeRead', true);
                  }
                }}
              >
                <option value="all">Todas</option>
                <option value="false">Não lidas</option>
                <option value="true">Lidas</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Tipo:</label>
              <select
                className="form-select"
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              >
                <option value="">Todos os tipos</option>
                <option value="info">Informação</option>
                <option value="success">Sucesso</option>
                <option value="warning">Aviso</option>
                <option value="error">Erro</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Prioridade:</label>
              <select
                className="form-select"
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
              >
                <option value="">Todas as prioridades</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Itens por página:</label>
              <select
                className="form-select"
                value={filters.limit || 10}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {hasActiveFilters() && (
            <div className="filters-footer">
              <button
                className="btn btn-sm btn-secondary"
                onClick={clearFilters}
              >
                <X size={16} />
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationFilters;