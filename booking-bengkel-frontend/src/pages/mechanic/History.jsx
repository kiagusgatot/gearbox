import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
export function MechanicHistory() {
  const [list, setList] = useState([]); const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  useEffect(() => { bookingService.getAll().then(d=>setList(d.filter(b=>b.status==='completed'))).catch(()=>{}).finally(()=>setLoading(false)); }, []);
  return <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4"><div className="max-w-6xl mx-auto">
    <h1 className="section-title">Riwayat Service</h1><p className="section-sub">Job yang sudah selesai</p>
    {loading?<Loading/>:list.length===0?<EmptyState icon={CheckCircle} title="Belum ada riwayat"/>:
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{list.map(b=><div key={b.id} onClick={()=>nav(`/mechanic/jobs/${b.id}`)} className="card-hover">
      <div className="flex justify-between items-start mb-3"><div><p className="font-bold text-gray-900">{b.service?.name||'Service'}</p><p className="text-sm text-gray-500">{b.user?.name||'-'}</p></div><StatusBadge status={b.status}/></div>
      <p className="text-sm text-gray-500 mb-3">{b.vehicle?.brand} {b.vehicle?.model} — {b.vehicle?.plate}</p>
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center"><span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12}/>{formatDate(b.scheduled_date)}</span><ArrowRight size={16} className="text-gray-400"/></div>
    </div>)}</div>}
  </div></div>;
}
