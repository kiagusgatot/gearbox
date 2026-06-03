import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, Wrench, CheckCircle, ArrowRight, AlertCircle, Bell, Play, Search, CheckSquare, Flag } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loading } from '../../components/common/Loading';
import { formatDate, formatTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

// Jobs yang butuh aksi mekanik (prioritas tinggi)
const ACTION_NEEDED = [
  { status: 'confirmed',       icon: Bell,        color: 'border-blue-300 bg-blue-50',    action: 'Terima atau tolak job',       urgency: 'high' },
  { status: 'ready',           icon: Search,      color: 'border-indigo-300 bg-indigo-50', action: 'Lakukan inspeksi kendaraan',  urgency: 'high' },
  { status: 'service_started', icon: Play,        color: 'border-violet-300 bg-violet-50', action: 'Konfirmasi mulai service',    urgency: 'high' },
  { status: 'in_progress',     icon: CheckSquare, color: 'border-purple-300 bg-purple-50', action: 'Selesaikan checklist service', urgency: 'medium' },
];

// Jobs yang sedang menunggu (tidak butuh aksi mekanik)
const WAITING_STATUSES = ['inspection_done', 'estimation_sent', 'customer_approved'];

export function MechanicDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    bookingService.getAll().then(data => {
      const arr = Array.isArray(data) ? data : (data?.data || []);
      setBookings(Array.isArray(arr) ? arr : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading/>;

  // Categorize bookings
  const actionNeeded = bookings.filter(b => ACTION_NEEDED.some(a => a.status === b.status));
  const waiting      = bookings.filter(b => WAITING_STATUSES.includes(b.status));
  const inProgress   = bookings.filter(b => b.status === 'in_progress');
  const completed    = bookings.filter(b => b.status === 'completed');
  const waitPayment  = bookings.filter(b => b.status === 'waiting_payment');
  const totalActive  = bookings.filter(b => !['completed','cancelled'].includes(b.status));

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="section-title">Dashboard Mekanik</h1>
        <p className="section-sub">Selamat datang, {user?.name?.split(' ')[0]}! Berikut status pekerjaan Anda.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Bell}         label="Perlu Aksi"      value={actionNeeded.length} color="text-red-600"    bgColor="bg-red-100"/>
          <StatCard icon={Wrench}       label="Sedang Dikerjakan" value={inProgress.length}  color="text-purple-600" bgColor="bg-purple-100"/>
          <StatCard icon={Clock}        label="Menunggu"        value={waiting.length}      color="text-amber-600"  bgColor="bg-amber-100"/>
          <StatCard icon={CheckCircle}  label="Selesai"         value={completed.length}    color="text-green-600"  bgColor="bg-green-100"/>
        </div>

        {/* ===== ACTION NEEDED — Prioritas Utama ===== */}
        {actionNeeded.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
              <h2 className="text-xl font-bold text-gray-900">Perlu Aksi Anda</h2>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">{actionNeeded.length}</span>
            </div>
            <div className="space-y-3">
              {actionNeeded.map(b => {
                const config = ACTION_NEEDED.find(a => a.status === b.status);
                const Icon = config?.icon || Bell;
                return (
                  <div key={b.id} onClick={() => nav(`/mechanic/jobs/${b.id}`)}
                    className={`card-hover border-2 ${config?.color || 'border-gray-200'}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Icon size={20} className="text-primary-600"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-gray-900">{b.service?.name || 'Service'}</p>
                          <StatusBadge status={b.status}/>
                        </div>
                        <p className="text-sm text-gray-600">{b.user?.name} · {b.vehicle?.brand} {b.vehicle?.model} ({b.vehicle?.plate})</p>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(b.scheduled_date)} · {formatTime(b.scheduled_time)}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm font-semibold text-primary-600 flex items-center gap-1">
                            <AlertCircle size={14}/>{config?.action}
                          </p>
                          <ArrowRight size={16} className="text-gray-400"/>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== NO ACTION NEEDED MESSAGE ===== */}
        {actionNeeded.length === 0 && (
          <div className="card text-center py-10 mb-8">
            <CheckCircle size={40} className="text-green-400 mx-auto mb-3"/>
            <p className="font-semibold text-gray-700 mb-1">Semua pekerjaan up to date!</p>
            <p className="text-sm text-gray-500">Tidak ada job yang membutuhkan aksi Anda saat ini.</p>
          </div>
        )}

        {/* ===== MENUNGGU (tidak perlu aksi mekanik) ===== */}
        {waiting.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-amber-600"/>Menunggu Proses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {waiting.map(b => (
                <div key={b.id} onClick={() => nav(`/mechanic/jobs/${b.id}`)} className="card-hover">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-gray-900">{b.service?.name}</p>
                    <StatusBadge status={b.status}/>
                  </div>
                  <p className="text-sm text-gray-500">{b.user?.name} · {b.vehicle?.plate}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {b.status === 'inspection_done' && 'Menunggu admin review estimasi'}
                    {b.status === 'estimation_sent' && 'Menunggu customer approve'}
                    {b.status === 'customer_approved' && 'Menunggu admin kirim perintah'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== MENUNGGU PEMBAYARAN ===== */}
        {waitPayment.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Flag size={20} className="text-orange-600"/>Selesai — Tunggu Pembayaran
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {waitPayment.map(b => (
                <div key={b.id} onClick={() => nav(`/mechanic/jobs/${b.id}`)} className="card-hover border-orange-200">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-gray-900">{b.service?.name}</p>
                    <StatusBadge status={b.status}/>
                  </div>
                  <p className="text-sm text-gray-500">{b.user?.name} · {b.vehicle?.plate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link to full list */}
        <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-200">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Semua Job ({bookings.length})</p>
            <p className="text-xs text-gray-500">{totalActive.length} aktif · {completed.length} selesai</p>
          </div>
          <Link to="/mechanic/jobs" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
            Lihat semua <ArrowRight size={14}/>
          </Link>
        </div>
      </div>
    </div>
  );
}
