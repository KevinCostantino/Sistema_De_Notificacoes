import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import './CreateNotificationForm.css';

const CreateNotificationForm = ({ onSubmit, loading = false, defaultUserId = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium'
  });
  const [errors, setErrors] = useState({});

  // Removed userId field - will be auto-assigned by parent component

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Título não pode exceder 200 caracteres';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Mensagem é obrigatória';
    } else if (formData.message.length > 1000) {
      newErrors.message = 'Mensagem não pode exceder 1000 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
      
      // Reset form on success
      setFormData({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium'
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setFormData({
      title: '',
      message: '',
      type: 'info',
      priority: 'medium'
    });
    setErrors({});
  };

  if (!isOpen) {
    return (
      <div className="create-notification-trigger">
        <button
          className="btn btn-primary"
          onClick={() => setIsOpen(true)}
        >
          <Plus size={20} />
          Nova Notificação
        </button>
      </div>
    );
  }

  return (
    <div className="create-notification-form">
      <div className="form-header">
        <h3>Criar Nova Notificação</h3>
        <button
          className="btn btn-sm btn-secondary"
          onClick={handleCancel}
          disabled={loading}
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="notification-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Título *
            </label>
            <input
              type="text"
              name="title"
              className={`form-input ${errors.title ? 'error' : ''}`}
              value={formData.title}
              onChange={handleChange}
              placeholder="Digite o título da notificação"
              maxLength={200}
              disabled={loading}
            />
            <div className="char-count">
              {formData.title.length}/200
            </div>
            {errors.title && (
              <div className="form-error">{errors.title}</div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Mensagem *
            </label>
            <textarea
              name="message"
              className={`form-textarea ${errors.message ? 'error' : ''}`}
              value={formData.message}
              onChange={handleChange}
              placeholder="Digite a mensagem da notificação"
              maxLength={1000}
              rows={4}
              disabled={loading}
            />
            <div className="char-count">
              {formData.message.length}/1000
            </div>
            {errors.message && (
              <div className="form-error">{errors.message}</div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select
              name="type"
              className="form-select"
              value={formData.type}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="info">Informação</option>
              <option value="success">Sucesso</option>
              <option value="warning">Aviso</option>
              <option value="error">Erro</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Prioridade</label>
            <select
              name="priority"
              className="form-select"
              value={formData.priority}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Criar Notificação'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNotificationForm;