export function EmptyState({ icon: Icon, title, description }) {
  return <div className="text-center py-20">
    <Icon size={48} className="text-gray-300 mx-auto mb-4"/>
    <p className="font-semibold text-gray-700 mb-1">{title}</p>
    {description && <p className="text-gray-500 text-sm">{description}</p>}
  </div>;
}
