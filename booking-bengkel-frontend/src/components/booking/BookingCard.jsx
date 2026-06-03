import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate, formatTime } from '../../utils/formatters';
export function BookingCard({booking,basePath='/bookings'}){
  const nav=useNavigate();
  return <div onClick={()=>nav(`${basePath}/${booking.id}`)} className="card-hover">
    <div className="flex justify-between items-start mb-4"><div><h3 className="font-bold text-gray-900">{booking.service?.name||'Service'}</h3><p className="text-sm text-gray-500 mt-1">{booking.vehicle?.brand} {booking.vehicle?.model} — {booking.vehicle?.plate}</p></div><StatusBadge status={booking.status}/></div>
    <div className="flex flex-wrap gap-4 text-sm text-gray-600"><div className="flex items-center gap-2"><Calendar size={16} className="text-primary-600"/>{formatDate(booking.scheduled_date)}</div><div className="flex items-center gap-2"><Clock size={16} className="text-primary-600"/>{formatTime(booking.scheduled_time)}</div></div>
    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center"><span className="text-xs text-gray-400">ID: {booking.id?.substring(0,8)}</span><ArrowRight size={18} className="text-gray-400"/></div>
  </div>;
}
