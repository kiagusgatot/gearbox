import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, Wrench, CheckCircle, ArrowRight, AlertCircle, Bell, Play, Search, CheckSquare, Flag, Bookmark, Calendar } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loading } from '../../components/common/Loading';
import { formatDate, formatTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const ACTION_NEEDED = [
  { status:'confirmed',       icon:Bell,        action:'Terima atau tolak job' },
  { status:'ready',           icon:Search,      action:'Lakukan inspeksi kendaraan' },
  { status:'service_started', icon:Play,        action:'Konfirmasi mulai service' },
  { status:'in_progress',     icon:CheckSquare, action:'Selesaikan checklist service' },
];

const WAITING_STATUSES = ['inspection_done','estimation_sent','customer_approved'];

export function MechanicDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    bookingService.getAll().then(data => {
      const arr = Array.isArray(data) ? data : (data?.data || []);
      arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setBookings(arr);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading/>;

  const actionNeeded = bookings.filter(b => ACTION_NEEDED.some(a => a.status === b.status));
  const waiting      = bookings.filter(b => WAITING_STATUSES.includes(b.status));
  const inProgress   = bookings.filter(b => b.status === 'in_progress');
  const completed    = bookings.filter(b => b.status === 'completed');
  const waitPayment  = bookings.filter(b => b.status === 'waiting_payment');

  // Today's schedule
  const today = new Date().toISOString().split('T')[0];
  const todayJobs = bookings
    .filter(b => b.scheduled_date === today && !['completed','cancelled'].includes(b.status))
    .sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''));

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';
  const todayStr = new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Welcome Header */}
        <div className="bg-gray-900 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-gray-400 text-sm">{todayStr}</p>
              <h1 className="text-2xl font-bold mt-1">{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
            </div>
            <div className="flex gap-4">
              {[
                { value: actionNeeded.length, label: 'Perlu Aksi',  color: actionNeeded.length > 0 ? 'bg-red-500' : 'bg-gray-700' },
                { value: inProgress.length,   label: 'Dikerjakan',  color: inProgress.length > 0 ? 'bg-blue-500' : 'bg-gray-700' },
                { value: completed.length,    label: 'Selesai',     color: 'bg-gray-700' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-xl px-4 py-3 text-center min-w-[90px]`}>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-gray-200 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Aksi Cepat</h2>
          <div className="grid grid-cols-3 gap-3">
            <Link to="/mechanic/jobs" className="bg-primary-50 hover:bg-primary-100 rounded-xl p-4 flex items-center gap-3 transition-colors">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <ClipboardList size={20} className="text-gray-900"/>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">Antrian Job</p>
                <p className="text-xs text-gray-500">{bookings.filter(b => !['completed','cancelled'].includes(b.status)).length} aktif</p>
              </div>
            </Link>
            <Link to="/mechanic/history" className="bg-green-50 hover:bg-green-100 rounded-xl p-4 flex items-center gap-3 transition-colors">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <Bookmark size={20} className="text-green-600"/>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">Riwayat Service</p>
                <p className="text-xs text-gray-500">{completed.length} selesai</p>
              </div>
            </Link>
            <Link to="/mechanic/jobs?tab=in_progress" className="bg-blue-50 hover:bg-blue-100 rounded-xl p-4 flex items-center gap-3 transition-colors">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <Wrench size={20} className="text-blue-600"/>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">Sedang Dikerjakan</p>
                <p className="text-xs text-gray-500">{inProgress.length} job</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Jadwal Hari Ini */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={18} className="text-gray-900"/>
              Jadwal Hari Ini
              {todayJobs.length > 0 && <span className="px-2 py-0.5 bg-primary-500 text-gray-900 rounded-full text-xs font-bold">{todayJobs.length}</span>}
            </h2>
            <p className="text-xs text-gray-400">{todayStr}</p>
          </div>
          {todayJobs.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <CheckCircle size={32} className="text-green-400 mx-auto mb-2"/>
              <p className="text-sm text-gray-500">Tidak ada jadwal hari ini</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {todayJobs.map(b => {
                const config = ACTION_NEEDED.find(a => a.status === b.status);
                return (
                  <div key={b.id} onClick={() => nav(`/mechanic/jobs/${b.id}`)}
                    className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    {/* Time */}
                    <div className="w-14 text-center flex-shrink-0">
                      <p className="text-lg font-bold text-gray-900">{formatTime(b.scheduled_time)}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200 flex-shrink-0"/>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{b.service?.name} — {b.user?.name}</p>
                      <p className="text-xs text-gray-500">{b.vehicle?.brand} {b.vehicle?.model} ({b.vehicle?.plate})</p>
                    </div>
                    <StatusBadge status={b.status}/>
                    <ArrowRight size={16} className="text-gray-400 flex-shrink-0"/>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Perlu Aksi */}
        {actionNeeded.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
                <h2 className="font-bold text-gray-900">Perlu Aksi Anda</h2>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">{actionNeeded.length}</span>
              </div>
              <Link to="/mechanic/jobs" className="text-xs text-gray-900 font-bold hover:underline flex items-center gap-1">Lihat semua <ArrowRight size={12}/></Link>
            </div>
            <div className="divide-y divide-gray-100">
              {actionNeeded.slice(0, 5).map(b => {
                const config = ACTION_NEEDED.find(a => a.status === b.status);
                const Icon = config?.icon || Bell;
                return (
                  <div key={b.id} onClick={() => nav(`/mechanic/jobs/${b.id}`)}
                    className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-gray-900"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{b.service?.name} — {b.user?.name}</p>
                      <p className="text-xs text-gray-900 font-semibold mt-0.5">{config?.action}</p>
                    </div>
                    <StatusBadge status={b.status}/>
                    <ArrowRight size={16} className="text-gray-400 flex-shrink-0"/>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No action needed */}
        {actionNeeded.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 px-5 py-8 text-center">
            <CheckCircle size={32} className="text-green-400 mx-auto mb-2"/>
            <p className="font-semibold text-gray-700 mb-1">Semua pekerjaan up to date!</p>
            <p className="text-sm text-gray-500">Tidak ada job yang membutuhkan aksi saat ini.</p>
          </div>
        )}

        {/* Menunggu Proses */}
        {waiting.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Clock size={18} className="text-amber-600"/>Menunggu Proses
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">{waiting.length}</span>
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {waiting.map(b => (
                <div key={b.id} onClick={() => nav(`/mechanic/jobs/${b.id}`)}
                  className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{b.service?.name} — {b.user?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {b.status === 'inspection_done' && 'Menunggu admin review estimasi'}
                      {b.status === 'estimation_sent' && 'Menunggu customer approve'}
                      {b.status === 'customer_approved' && 'Menunggu admin kirim perintah'}
                    </p>
                  </div>
                  <StatusBadge status={b.status}/>
                  <ArrowRight size={16} className="text-gray-400 flex-shrink-0"/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tunggu Pembayaran */}
        {waitPayment.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Flag size={18} className="text-orange-600"/>Selesai — Tunggu Pembayaran
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">{waitPayment.length}</span>
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {waitPayment.map(b => (
                <div key={b.id} onClick={() => nav(`/mechanic/jobs/${b.id}`)}
                  className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{b.service?.name} — {b.user?.name}</p>
                    <p className="text-xs text-gray-500">{b.vehicle?.plate}</p>
                  </div>
                  <StatusBadge status={b.status}/>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
