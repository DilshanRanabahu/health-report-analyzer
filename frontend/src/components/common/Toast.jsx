import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast({ toast, removeToast }) {
  const icons = {
    success: <CheckCircle className="toast-icon success" size={20} />,
    error: <AlertCircle className="toast-icon error" size={20} />,
    info: <Info className="toast-icon info" size={20} />,
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-icon-container">
        {icons[toast.type] || icons.info}
      </div>
      <div className="toast-message">
        {toast.message}
      </div>
      <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>
        <X size={16} />
      </button>
    </div>
  );
}
