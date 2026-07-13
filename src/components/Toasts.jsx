import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const icons = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

export default function Toasts() {
  const { toasts, removeToast } = useApp();
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;
        return (
          <div key={toast.id} className={`toast toast--${toast.type}`}>
            <Icon size={19} />
            <span>{toast.message}</span>
            <button type="button" onClick={() => removeToast(toast.id)} aria-label="Đóng">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
