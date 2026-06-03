import { useNavigate } from 'react-router-dom';
import { Clock, Star, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
export function ServiceCard({service}){
  const nav=useNavigate();
  return <div onClick={()=>nav(`/services/${service.id}`)} className="card-hover group">
    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4"><Star size={24} className="text-primary-600"/></div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description||'Layanan profesional untuk kendaraan Anda'}</p>
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4"><Clock size={16}/>{service.estimated_duration||60} menit</div>
    <div className="flex justify-between items-center pt-4 border-t border-gray-100"><p className="text-xl font-bold text-primary-600">{formatCurrency(service.base_price)}</p><ArrowRight size={20} className="text-gray-400 group-hover:text-primary-600 transition-colors"/></div>
  </div>;
}
