import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../services/bookingService';
import { vehicleService } from '../../services/vehicleService';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Wrench, Shield, Clock, Star, ChevronRight, Droplet, Zap, Gauge, Car, CalendarPlus, ArrowRight, CreditCard, AlertCircle } from 'lucide-react';

// ============================================================
// CUSTOMER DASHBOARD — tampil ketika sudah login
// ============================================================
function CustomerDashboard({ user }) {
  const [bookings, setBookings]   = useState([]);
  const [vehicles, setVehicles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    Promise.all([
      bookingService.getAll().catch(() => []),
      vehicleService.getAll().catch(() => []),
    ]).then(([b, v]) => {
      setBookings(b);
      setVehicles(v);
    }).finally(() => setLoading(false));
  }, []);

  // Booking aktif = semua selain completed & cancelled
  const activeBookings = bookings.filter(b =>
    !['completed', 'cancelled'].includes(b.status)
  );

  // Tampil 1 paling recent (index 0 = paling baru)
  const latestActive = activeBookings[0] || null;

  const completedCount = bookings.filter(b => b.status === 'completed').length;

  // Greeting dinamis berdasarkan jam
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';

  const today = new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Welcome Header */}
        <div className="bg-primary-600 rounded-3xl p-6 md:p-8 text-white">
          <p className="text-primary-200 text-sm mb-1">{today}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{greeting}, {user.name?.split(' ')[0]}! 👋</h1>
          <p className="text-primary-200 text-sm">Pantau kendaraan dan booking Anda dari sini.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Kendaraan',      value: loading ? '—' : vehicles.length,      color: 'text-blue-600',   bg: 'bg-blue-50',   icon: Car },
            { label: 'Booking Aktif',  value: loading ? '—' : activeBookings.length, color: 'text-purple-600', bg: 'bg-purple-50', icon: Clock },
            { label: 'Selesai',        value: loading ? '—' : completedCount,        color: 'text-green-600',  bg: 'bg-green-50',  icon: Star },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <s.icon size={20} className={s.color}/>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Active Tracker — 1 booking paling recent */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-900">Status Kendaraan Aktif</h2>
            {activeBookings.length > 1 && (
              <Link to="/bookings" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
                +{activeBookings.length - 1} lainnya <ArrowRight size={14}/>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="card animate-pulse h-32"/>
          ) : latestActive ? (
            <div onClick={() => nav(`/bookings/${latestActive.id}`)} className="card-hover">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{latestActive.service?.name || 'Service'}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {latestActive.vehicle?.brand} {latestActive.vehicle?.model} — {latestActive.vehicle?.plate}
                  </p>
                </div>
                <StatusBadge status={latestActive.status}/>
              </div>

              <div className="flex gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary-600"/>{formatDate(latestActive.scheduled_date)}, {formatTime(latestActive.scheduled_time)}</span>
                {latestActive.mechanic && <span className="flex items-center gap-1.5"><Wrench size={14} className="text-primary-600"/>{latestActive.mechanic.name}</span>}
              </div>

              {/* Status-specific message */}
              {latestActive.status === 'waiting_payment' && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800 font-medium">
                  <CreditCard size={16} className="flex-shrink-0"/>
                  Silakan bayar di kasir bengkel untuk mengambil kunci kendaraan
                </div>
              )}
              {latestActive.status === 'in_progress' && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-800 font-medium">
                  <Wrench size={16} className="flex-shrink-0"/>
                  Kendaraan Anda sedang dikerjakan oleh mekanik
                </div>
              )}
              {latestActive.status === 'pending' && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 font-medium">
                  <AlertCircle size={16} className="flex-shrink-0"/>
                  Menunggu konfirmasi dari admin bengkel
                </div>
              )}
              {latestActive.status === 'estimation_sent' && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 font-medium">
                  <AlertCircle size={16} className="flex-shrink-0"/>
                  Estimasi biaya perlu persetujuan Anda — tap untuk review
                </div>
              )}
              {['confirmed','ready','inspection_done'].includes(latestActive.status) && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 font-medium">
                  <Clock size={16} className="flex-shrink-0"/>
                  Sedang diproses oleh bengkel
                </div>
              )}
              {['customer_approved','service_started'].includes(latestActive.status) && (
                <div className="flex items-center gap-2 p-3 bg-violet-50 border border-violet-200 rounded-xl text-sm text-violet-800 font-medium">
                  <Wrench size={16} className="flex-shrink-0"/>
                  Service akan segera dimulai
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400">Tap untuk lihat detail</span>
                <ArrowRight size={16} className="text-gray-400"/>
              </div>
            </div>
          ) : (
            <div className="card text-center py-10">
              <Car size={40} className="text-gray-300 mx-auto mb-3"/>
              <p className="font-semibold text-gray-700 mb-1">Tidak ada booking aktif</p>
              <p className="text-sm text-gray-500 mb-4">Kendaraan Anda belum ada yang sedang diservis</p>
              <Link to="/services" className="btn-primary btn-sm">Buat Booking Sekarang</Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/services" className="card-hover flex flex-col items-center text-center py-6 gap-3 group">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <CalendarPlus size={24} className="text-primary-600"/>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Buat Booking Baru</p>
                <p className="text-xs text-gray-500 mt-0.5">Pilih layanan service</p>
              </div>
            </Link>
            <Link to="/profile" className="card-hover flex flex-col items-center text-center py-6 gap-3 group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Car size={24} className="text-blue-600"/>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Kelola Kendaraan</p>
                <p className="text-xs text-gray-500 mt-0.5">Tambah atau lihat kendaraan</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Riwayat singkat */}
        {completedCount > 0 && (
          <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Star size={20} className="text-green-600"/>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Riwayat Service</p>
                <p className="text-xs text-gray-500">{completedCount} service telah selesai</p>
              </div>
            </div>
            <Link to="/bookings" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
              Lihat <ArrowRight size={14}/>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// GUEST LANDING PAGE — tampil ketika belum login
// ============================================================
function GuestLandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-white py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
              Booking Service Kendaraan <span className="text-primary-600">Jadi Mudah</span>
            </h1>
            <p className="text-lg text-gray-500 mb-8">Pesan layanan perawatan kendaraan Anda secara online. Cepat, transparan, dan terpercaya.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="btn-primary text-center">Daftar Sekarang</Link>
              <Link to="/services" className="btn-outline text-center">Lihat Layanan</Link>
            </div>
          </div>
          <div className="bg-primary-50 rounded-3xl h-64 md:h-80 flex items-center justify-center">
            <Wrench size={80} className="text-primary-200"/>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Kategori Layanan</h2>
          <p className="text-gray-500 mb-8">Pilih jenis service yang Anda butuhkan</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[{icon:Wrench,name:'Service Umum'},{icon:Droplet,name:'Ganti Oli'},{icon:Zap,name:'Kelistrikan'},{icon:Gauge,name:'Tune Up'}].map(c =>
              <Link to="/services" key={c.name} className="bg-white rounded-2xl p-6 border border-gray-200 text-center hover:border-primary-300 hover:shadow-sm transition-all group">
                <c.icon size={32} className="text-primary-600 mx-auto mb-3 group-hover:scale-110 transition-transform"/>
                <p className="text-sm font-semibold text-gray-900">{c.name}</p>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">Mengapa Memilih Kami?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[{i:Clock,t:'Booking Cepat',d:'Proses booking hanya beberapa menit'},{i:Shield,t:'Transparan',d:'Estimasi biaya dikirim sebelum dikerjakan'},{i:Star,t:'Terpercaya',d:'Mekanik berpengalaman dan bersertifikat'}].map(f =>
              <div key={f.t} className="text-center">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><f.i size={28} className="text-primary-600"/></div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.t}</h3>
                <p className="text-gray-500 text-sm">{f.d}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-primary-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Siap Service Kendaraan?</h2>
          <p className="text-primary-200 mb-8">Daftar sekarang dan nikmati kemudahan booking online</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors">
            Mulai Booking <ChevronRight size={20}/>
          </Link>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// HOME — Dynamic routing berdasarkan auth state
// ============================================================
export function Home() {
  const { user, isCustomer } = useAuth();

  if (user && isCustomer) return <CustomerDashboard user={user}/>;
  return <GuestLandingPage/>;
}
