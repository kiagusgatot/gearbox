import { STATUS_CONFIG } from '../../utils/constants';
export function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.color}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}/>
    {c.label}
  </span>;
}
