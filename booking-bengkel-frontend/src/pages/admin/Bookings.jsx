import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Search, ArrowRight } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { Input } from '../../components/common/Input';
import { formatDate, formatTime } from '../../utils/formatters';

const TABS = [
  { key:'all', label:'Semua' },
  { key:'pending', label:'Menunggu' },
  { key:'confirmed', label:'Dikonfirmasi' },
  { key:'inspection_done', label:'Inspeksi' },
  { key:'estimation_sent', label:'Estimasi' },
  { key:'customer_approved', label:'Approved' },
  { key:'service_started', label:'Siap Service' },
  { key:'in_progress', label:'Dikerjakan' },
  { key:'waiting_payment', label:'Tunggu Bayar' },
  { key:'completed', label:'Selesai' },
];

export function AdminBookings() {
  const [list, setList] = useState([]); const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all'); const [q, setQ] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    bookingService.getAll().then(data => {
      const arr = Array.isArray(data) ? data : (data?.data || []);
      // Sort newest first
      arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setList(arr);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = list
    .filter(b => tab === 'all' || b.status === tab)
    .filter(b => !q || [b.service?.name, b.user?.name, b.vehicle?.plate, b.id]
      .some(v => v?.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 lg:px-8">
      <div className="max-w-full mx-auto">
        <h1 className="section-title">Kelola Booking</h1>
        <p className="section-sub">Konfirmasi, assign mekanik, dan pantau semua booking</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input icon={Search} placeholder="Cari booking..." value={q} onChange={e => setQ(e.target.value)} className="max-w-xs"/>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {TABS.map(t => <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${tab === t.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
            {t.label} {t.key !== 'all' && `(${list.filter(b => b.status === t.key).length})`}
          </button>)}
        </div>

        {loading ? <Loading/> : filtered.length === 0 ? <EmptyState icon={ClipboardList} title="Tidak ada booking"/> : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Layanan</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Kendaraan</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Jadwal</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Mekanik</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(b => (
                    <tr key={b.id} onClick={() => nav(`/admin/bookings/${b.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{b.id?.substring(0, 8)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{b.service?.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{b.user?.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{b.vehicle?.brand} {b.vehicle?.model} <span className="text-gray-400">({b.vehicle?.plate})</span></td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(b.scheduled_date)} <span className="text-gray-400">{formatTime(b.scheduled_time)}</span></td>
                      <td className="px-4 py-3 text-gray-600">{b.mechanic?.name || <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status}/></td>
                      <td className="px-4 py-3"><ArrowRight size={16} className="text-gray-400"/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              {filtered.length} booking ditampilkan
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
