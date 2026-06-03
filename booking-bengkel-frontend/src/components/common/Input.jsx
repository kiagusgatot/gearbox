export function Input({ label, error, icon: Icon, className = '', ...props }) {
  return <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
    <div className="relative">
      {Icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={18}/></div>}
      <input className={`input-field ${Icon ? 'pl-11' : ''} ${error ? 'border-red-500' : ''}`} {...props}/>
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>;
}
