import React from 'react';
import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  isLoading = false,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title=""
    size="sm"
    footer={
      <>
        <button className="btn-secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </button>
        <button
          className="btn-danger"
          onClick={onConfirm}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Deleting…' : confirmLabel}
        </button>
      </>
    }
  >
    <div style={{ textAlign: 'center', padding: 'var(--space-2) 0' }}>
      <div className="confirm-modal-icon danger">🗑️</div>
      <h3 className="confirm-modal-title">{title}</h3>
      <p className="confirm-modal-message">{message}</p>
    </div>
  </Modal>
);

export default ConfirmModal;