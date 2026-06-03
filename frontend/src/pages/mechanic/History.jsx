import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Search, ArrowRight, Star } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { Input } from '../../components/common/Input';
import { formatDate, formatCurrency } from '../../utils/formatters';

export function MechanicHistory() {
  const [list, setList] = useState([]); const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    bookingService.getAll().then(data => {
      const arr = Array.isArray(data) ? data : (data?.data || []);
      const completed = arr.filter(b => b.status === 'completed');
      completed.sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));
      setList(completed);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = list.filter(b => !q || [b.service?.name, b.user?.name, b.vehicle?.plate]
    .some(v => v?.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 lg:px-8">
      <div className="max-w-full mx-auto">
        <h1 className="section-title">Riwayat Service</h1>
        <p className="section-sub">Job yang sudah selesai</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input icon={Search} placeholder="Cari riwayat..." value={q} onChange={e => setQ(e.target.value)} className="max-w-xs"/>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-2 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600"/>
            <span className="text-sm text-gray-600"><strong className="text-gray-900">{list.length}</strong> service selesai</span>
          </div>
        </div>

        {loading ? <Loading/> : filtered.length === 0 ? <EmptyState icon={CheckCircle} title="Belum ada riwayat"/> : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Layanan</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Kendaraan</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Tanggal</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(b => (
                    <tr key={b.id} onClick={() => nav(`/mechanic/jobs/${b.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{b.id?.substring(0, 8)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{b.service?.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{b.user?.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{b.vehicle?.brand} {b.vehicle?.model} <span className="text-gray-400">({b.vehicle?.plate})</span></td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(b.scheduled_date)}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status}/></td>
                      <td className="px-4 py-3"><ArrowRight size={16} className="text-gray-400"/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              {filtered.length} riwayat ditampilkan
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
