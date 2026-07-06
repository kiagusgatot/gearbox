import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function Input({ label, error, icon: Icon, type = 'text', className = '', ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
    <div className="relative">
      {Icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={18}/></div>}
      <input 
        type={inputType}
        className={`input-field ${Icon ? 'pl-11' : ''} ${isPassword ? 'pr-11' : ''} ${error ? 'border-red-500' : ''}`} 
        {...props}
      />
      {isPassword && (
        <button 
          type="button" 
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>;
}
