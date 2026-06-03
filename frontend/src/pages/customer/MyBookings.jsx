import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Calendar, Clock, ArrowRight, CreditCard, ClipboardList, AlertCircle } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate, formatTime } from '../../utils/formatters';

const TABS = [
  { key:'active',    label:'Aktif'       },
  { key:'estimation',label:'Perlu Setuju'},
  { key:'completed', label:'Selesai'     },
  { key:'cancelled', label:'Dibatalkan'  },
  { key:'all',       label:'Semua'       },
];

const ACTIVE_STATUSES = ['pending','confirmed','ready','inspection_done','customer_approved','service_started','in_progress','waiting_payment'];

export function MyBookings() {
  const [list, setList] = useState([]); const [loading, setLoading] = useState(true); const [tab, setTab] = useState('active');
  const nav = useNavigate();
  useEffect(() => {
    bookingService.getAll().then(data => {
      const arr = Array.isArray(data) ? data : (data?.data || []);
      setList(Array.isArray(arr) ? arr : []);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = tab === 'all' ? list
    : tab === 'active' ? list.filter(b => ACTIVE_STATUSES.includes(b.status))
    : tab === 'estimation' ? list.filter(b => b.status === 'estimation_sent')
    : tab === 'completed' ? list.filter(b => b.status === 'completed')
    : list.filter(b => b.status === 'cancelled');

  const estimationCount = list.filter(b => b.status === 'estimation_sent').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="section-title">Booking Saya</h1>
        <p className="section-sub">Pantau status semua booking kendaraan Anda</p>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                tab===t.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
              }`}>
              {t.label}
              {t.key === 'estimation' && estimationCount > 0 && (
                <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${tab===t.key ? 'bg-white text-primary-600' : 'bg-red-500 text-white'}`}>{estimationCount}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? <Loading/> : filtered.length === 0 ? <EmptyState icon={Bookmark} title="Tidak ada booking" description="Booking Anda akan muncul di sini"/> :
          <div className="space-y-4">
            {filtered.map(b => (
              <div key={b.id} onClick={() => nav(`/bookings/${b.id}`)} className="card-hover">
                <div className="flex justify-between items-start mb-4">
                  <div><h3 className="font-bold text-gray-900">{b.service?.name || 'Service'}</h3><p className="text-sm text-gray-500 mt-1">{b.vehicle?.brand} {b.vehicle?.model} — {b.vehicle?.plate}</p></div>
                  <StatusBadge status={b.status}/>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-2"><Calendar size={15} className="text-primary-600"/>{formatDate(b.scheduled_date)}</span>
                  <span className="flex items-center gap-2"><Clock size={15} className="text-primary-600"/>{formatTime(b.scheduled_time)}</span>
                </div>
                {b.status === 'estimation_sent' && <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 font-medium flex items-center gap-2"><ClipboardList size={16}/>Estimasi biaya perlu persetujuan Anda</div>}
                {b.status === 'waiting_payment' && <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800 font-medium flex items-center gap-2"><CreditCard size={16}/>Silakan bayar di kasir bengkel</div>}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-400">ID: {b.id?.substring(0,8)}</span>
                  <ArrowRight size={18} className="text-gray-400"/>
                </div>
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}
