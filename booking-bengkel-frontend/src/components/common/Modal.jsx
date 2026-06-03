import { X } from 'lucide-react';
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="fixed inset-0 bg-black/40" onClick={onClose}/>
    <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20}/></button>
      </div>
      {children}
    </div>
  </div>;
}
