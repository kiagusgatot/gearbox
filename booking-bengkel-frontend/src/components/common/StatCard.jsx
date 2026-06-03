export function StatCard({ icon: Icon, label, value, color = 'text-primary-600', bgColor = 'bg-primary-100' }) {
  return <div className="stat-card">
    <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon size={24} className={color}/>
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>;
}
