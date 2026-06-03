import { AlertCircle, CheckCircle, AlertTriangle, X, Info } from 'lucide-react';
import { Button } from './Button';

const VARIANTS = {
  success: { icon: CheckCircle, iconColor: 'text-green-600', iconBg: 'bg-green-100', confirmVariant: 'success' },
  danger:  { icon: AlertTriangle, iconColor: 'text-red-600', iconBg: 'bg-red-100', confirmVariant: 'danger' },
  warning: { icon: AlertCircle, iconColor: 'text-orange-600', iconBg: 'bg-orange-100', confirmVariant: 'primary' },
  info:    { icon: Info, iconColor: 'text-blue-600', iconBg: 'bg-blue-100', confirmVariant: 'primary' },
};

export function ConfirmDialog({ config, onClose }) {
  if (!config) return null;

  const {
    title = 'Konfirmasi',
    message = 'Yakin ingin melanjutkan?',
    variant = 'warning',
    confirmLabel = 'Ya, Lanjutkan',
    cancelLabel = 'Batal',
    onConfirm,
    loading = false,
    showCancel = true,
  } = config;

  const v = VARIANTS[variant] || VARIANTS.warning;
  const Icon = v.icon;

  const handleConfirm = () => {
    onConfirm?.();
    if (!loading) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose}/>

      {/* Dialog Card */}
      <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg">
          <X size={18} className="text-gray-400"/>
        </button>

        {/* Icon */}
        <div className={`w-14 h-14 ${v.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
          <Icon size={28} className={v.iconColor}/>
        </div>

        {/* Title & Message */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-600 text-center mb-6">{message}</p>

        {/* Buttons */}
        <div className={`flex gap-3 ${showCancel ? '' : 'justify-center'}`}>
          {showCancel && (
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              {cancelLabel}
            </Button>
          )}
          <Button variant={v.confirmVariant} className="flex-1" onClick={handleConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Alert-only dialog (single button, no cancel)
export function AlertDialog({ config, onClose }) {
  if (!config) return null;
  return <ConfirmDialog config={{ ...config, showCancel: false, confirmLabel: config.confirmLabel || 'OK' }} onClose={onClose}/>;
}
