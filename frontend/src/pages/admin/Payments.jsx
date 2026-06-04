import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { Input } from '../../components/common/Input';
import { PAYMENT_METHODS } from '../../utils/constants';

const STATUS_STYLE = {
  success: { label:'Lunas', color:'bg-green-100 text-green-800', icon: CheckCircle },
  pending: { label:'Pending', color:'bg-yellow-100 text-yellow-800', icon: Clock },
  failed:  { label:'Gagal', color:'bg-red-100 text-red-800', icon: XCircle },
};

export function AdminPayments() {
  const [list, setList] = useState([]); const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); const [q, setQ] = useState('');

  useEffect(() => {
    paymentService.getAll().then(data => {
      const arr = Array.isArray(data) ? data : (data?.data || []);
      arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setList(arr);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = list
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => !q || [p.id, p.notes, p.method].some(v => v?.toLowerCase().includes(q.toLowerCase())));

  const getMethodLabel = (v) => PAYMENT_METHODS.find(m => m.value === v)?.label || v;
  const totalSuccess = list.filter(p => p.status === 'success').reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 lg:px-8">
      <div className="max-w-full mx-auto">
        <h1 className="section-title">Riwayat Pembayaran</h1>
        <p className="section-sub">Semua transaksi pembayaran</p>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Transaksi</p>
            <p className="text-2xl font-bold text-gray-900">{list.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Lunas</p>
            <p className="text-2xl font-bold text-green-600">{list.filter(p => p.status === 'success').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Pendapatan</p>
            <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(totalSuccess)}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input icon={Search} placeholder="Cari transaksi..." value={q} onChange={e => setQ(e.target.value)} className="max-w-xs"/>
          <div className="flex gap-2">
            {['all', 'success', 'pending', 'failed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? 'bg-gray-900 text-white font-semibold shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-500'}`}>
                {f === 'all' ? 'Semua' : f === 'success' ? 'Lunas' : f === 'pending' ? 'Pending' : 'Gagal'}
              </button>
            ))}
          </div>
        </div>

        {loading ? <Loading/> : filtered.length === 0 ? <EmptyState icon={CreditCard} title="Tidak ada transaksi"/> : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Kode Booking</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Tanggal</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Nominal</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Metode</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Tipe</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Catatan</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(p => {
                    const st = STATUS_STYLE[p.status] || STATUS_STYLE.pending;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.booking?.booking_code || p.booking_id?.substring(0, 8)}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateTime(p.created_at)}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3 text-gray-600">{getMethodLabel(p.method)}</td>
                        <td className="px-4 py-3 text-gray-600 capitalize">{p.payment_type || '-'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{p.notes || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${st.color}`}>
                            <st.icon size={12}/>{st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              {filtered.length} transaksi ditampilkan
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
