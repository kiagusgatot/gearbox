import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, CreditCard, Wrench, Users, ArrowRight, Bell, CheckCircle, Clock, Settings, UserCheck, Send, Play } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { activityLogService } from '../../services/activityLogService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loading } from '../../components/common/Loading';
import { formatDate, formatCurrency, formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const ADMIN_ACTIONS = {
  pending:           { label:'Assign Mekanik',          icon:UserCheck, color:'text-yellow-600' },
  inspection_done:   { label:'Review & Kirim Estimasi', icon:Send,      color:'text-cyan-600' },
  customer_approved: { label:'Kirim Perintah Mulai',    icon:Play,      color:'text-lime-600' },
};

const LOG_ICONS = {
  'booking.created':             { icon:Bell,         color:'text-yellow-600', bg:'bg-yellow-100' },
  'booking.assigned':            { icon:UserCheck,    color:'text-blue-600',   bg:'bg-blue-100' },
  'booking.accepted':            { icon:CheckCircle,  color:'text-blue-600',   bg:'bg-blue-100' },
  'booking.inspection_done':     { icon:ClipboardList,color:'text-cyan-600',   bg:'bg-cyan-100' },
  'booking.estimation_sent':     { icon:Send,         color:'text-amber-600',  bg:'bg-amber-100' },
  'booking.estimation_approved': { icon:CheckCircle,  color:'text-lime-600',   bg:'bg-lime-100' },
  'booking.estimation_rejected': { icon:Bell,         color:'text-red-600',    bg:'bg-red-100' },
  'booking.service_started':     { icon:Play,         color:'text-sky-600',    bg:'bg-sky-100' },
  'booking.service_confirmed':   { icon:Wrench,       color:'text-blue-600',   bg:'bg-blue-100' },
  'booking.service_completed':   { icon:CheckCircle,  color:'text-green-600',  bg:'bg-green-100' },
  'booking.payment_confirmed':   { icon:CreditCard,   color:'text-orange-600', bg:'bg-orange-100' },
  'booking.completed':           { icon:CheckCircle,  color:'text-green-600',  bg:'bg-green-100' },
  'booking.cancelled':           { icon:Bell,         color:'text-red-600',    bg:'bg-red-100' },
};
const DEFAULT_LOG_ICON = { icon:Clock, color:'text-gray-500', bg:'bg-gray-100' };

export function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      bookingService.getAll().then(d => { const a = Array.isArray(d)?d:(d?.data||[]); a.sort((x,y)=>new Date(y.created_at||0)-new Date(x.created_at||0)); return a; }).catch(()=>[]),
      activityLogService.getAll({ limit: 15 }).then(d => d?.data || d || []).catch(()=>[]),
    ]).then(([bk, logs]) => {
      setBookings(bk);
      setActivityLogs(Array.isArray(logs) ? logs : []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading/>;

  const actionNeeded   = bookings.filter(b => ['pending','inspection_done','customer_approved'].includes(b.status));
  const waitingPayment = bookings.filter(b => b.status === 'waiting_payment');
  const activeBookings = bookings.filter(b => !['completed','cancelled'].includes(b.status));

  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';
  const today = new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gray-900 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-gray-400 text-sm">{today}</p>
              <h1 className="text-2xl font-bold mt-1">{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
            </div>
            <div className="flex gap-4">
              {[
                { value:actionNeeded.length,   label:'Perlu Aksi',   color:actionNeeded.length>0?'bg-red-500':'bg-gray-700' },
                { value:waitingPayment.length,  label:'Tunggu Bayar', color:waitingPayment.length>0?'bg-orange-500':'bg-gray-700' },
                { value:activeBookings.length,  label:'Booking Aktif',color:'bg-gray-700' },
              ].map(s => <div key={s.label} className={`${s.color} rounded-xl px-4 py-3 text-center min-w-[90px]`}><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-gray-200 mt-0.5">{s.label}</p></div>)}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Aksi Cepat</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { to:'/admin/bookings', icon:ClipboardList, label:'Kelola Booking', desc:`${bookings.length} total`, color:'text-gray-900', bg:'bg-primary-50 hover:bg-primary-100' },
              { to:'/admin/payments', icon:CreditCard, label:'Proses Pembayaran', desc:`${waitingPayment.length} pending`, color:'text-orange-600', bg:'bg-orange-50 hover:bg-orange-100' },
              { to:'/admin/users',    icon:Users, label:'Kelola User', desc:'Manage accounts', color:'text-blue-600', bg:'bg-blue-50 hover:bg-blue-100' },
              { to:'/admin/services', icon:Settings, label:'Kelola Layanan', desc:'Manage services', color:'text-green-600', bg:'bg-green-50 hover:bg-green-100' },
            ].map(a => <Link key={a.to} to={a.to} className={`${a.bg} rounded-xl p-4 flex items-center gap-3 transition-colors`}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"><a.icon size={20} className={a.color}/></div>
              <div className="min-w-0"><p className="text-sm font-semibold text-gray-900">{a.label}</p><p className="text-xs text-gray-500">{a.desc}</p></div>
            </Link>)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Action Needed + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Perlu Aksi */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {actionNeeded.length>0 && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>}
                  <h2 className="font-bold text-gray-900">Perlu Aksi Anda</h2>
                  {actionNeeded.length>0 && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">{actionNeeded.length}</span>}
                </div>
                <Link to="/admin/bookings" className="text-xs text-gray-900 font-bold hover:underline flex items-center gap-1">Lihat semua<ArrowRight size={12}/></Link>
              </div>
              {actionNeeded.length===0 ? <div className="px-5 py-8 text-center"><CheckCircle size={32} className="text-green-400 mx-auto mb-2"/><p className="text-sm text-gray-500">Semua up to date!</p></div> : (
                <div className="divide-y divide-gray-100">
                  {actionNeeded.slice(0,5).map(b => { const act=ADMIN_ACTIONS[b.status]; const AI=act?.icon||Bell; return (
                    <div key={b.id} onClick={()=>nav(`/admin/bookings/${b.id}`)} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{b.service?.name} — {b.user?.name}</p><p className="text-xs text-gray-500">{b.vehicle?.brand} {b.vehicle?.model} ({b.vehicle?.plate})</p></div>
                      <StatusBadge status={b.status}/>
                      <div className={`flex items-center gap-1 text-xs font-medium ${act?.color||'text-gray-600'} whitespace-nowrap`}><AI size={14}/>{act?.label}</div>
                      <ArrowRight size={16} className="text-gray-400 flex-shrink-0"/>
                    </div>
                  ); })}
                </div>
              )}
            </div>

            {/* Tunggu Bayar */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 flex items-center gap-2"><CreditCard size={18} className="text-orange-600"/>Menunggu Pembayaran {waitingPayment.length>0 && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">{waitingPayment.length}</span>}</h2>
                <Link to="/admin/payments" className="text-xs text-gray-900 font-bold hover:underline flex items-center gap-1">Kelola<ArrowRight size={12}/></Link>
              </div>
              {waitingPayment.length===0 ? <div className="px-5 py-8 text-center"><p className="text-sm text-gray-500">Tidak ada pembayaran pending</p></div> : (
                <div className="divide-y divide-gray-100">
                  {waitingPayment.slice(0,4).map(b => (
                    <div key={b.id} onClick={()=>nav(`/admin/bookings/${b.id}`)} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{b.service?.name} — {b.user?.name}</p><p className="text-xs text-gray-500">{b.vehicle?.plate} · {formatDate(b.scheduled_date)}</p></div>
                      <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatCurrency(b.service?.base_price||0)}</p>
                      <ArrowRight size={16} className="text-gray-400 flex-shrink-0"/>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Real Activity Feed */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2"><Clock size={18} className="text-gray-600"/>Aktivitas Terbaru</h2>
              </div>
              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {activityLogs.length === 0
                  ? <div className="px-5 py-8 text-center"><p className="text-sm text-gray-500">Belum ada aktivitas</p></div>
                  : activityLogs.slice(0, 15).map((log, i) => {
                      const cfg = LOG_ICONS[log.action] || DEFAULT_LOG_ICON;
                      const Icon = cfg.icon;
                      return (
                        <div key={log.id || i} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => log.booking_id && nav(`/admin/bookings/${log.booking_id}`)}>
                          <div className={`w-8 h-8 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Icon size={14} className={cfg.color}/>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-800 leading-snug">{log.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-400">{formatDateTime(log.created_at)}</p>
                              {log.actor?.name && <span className="text-xs text-gray-400">· {log.actor.name}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
