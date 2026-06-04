import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../services/bookingService';
import { vehicleService } from '../../services/vehicleService';
import { serviceService } from '../../services/serviceService';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Wrench, 
  Shield, 
  Clock, 
  Star, 
  Droplet, 
  Zap, 
  Gauge, 
  Car, 
  CalendarPlus, 
  ArrowRight, 
  CreditCard, 
  AlertCircle,
  Search,
  Calendar,
  ClipboardList,
  CheckCircle,
  Check,
  Activity,
  Camera,
  ChevronDown,
  User
} from 'lucide-react';

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

  const completedCount = bookings.filter(b => b.status === 'completed').length;

  const needsAction = bookings.filter(b => b.status === 'estimation_sent');

  // Greeting dinamis berdasarkan jam
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';

  const today = new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  // Status mapping to message and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { message: 'Menunggu konfirmasi admin', icon: AlertCircle, colorClass: 'text-amber-805 bg-amber-50 border-amber-200' };
      case 'confirmed':
      case 'ready':
      case 'inspection_done':
        return { message: 'Sedang diproses oleh bengkel', icon: Clock, colorClass: 'text-blue-805 bg-blue-50 border-blue-200' };
      case 'estimation_sent':
        return { message: 'Estimasi biaya perlu persetujuan Anda', icon: AlertCircle, colorClass: 'text-amber-805 bg-amber-50 border-amber-200 animate-pulse' };
      case 'customer_approved':
      case 'service_started':
        return { message: 'Service akan segera dimulai', icon: Wrench, colorClass: 'text-sky-850 bg-sky-50 border-sky-200' };
      case 'in_progress':
        return { message: 'Kendaraan sedang dikerjakan', icon: Wrench, colorClass: 'text-blue-805 bg-blue-50 border-blue-200' };
      case 'waiting_payment':
        return { message: 'Silakan bayar di kasir bengkel', icon: CreditCard, colorClass: 'text-orange-850 bg-orange-50 border-orange-200' };
      default:
        return { message: 'Status tidak diketahui', icon: AlertCircle, colorClass: 'text-gray-805 bg-gray-50 border-gray-200' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 1.1 Welcome Header — DARK Background */}
        <div className="bg-gray-900 rounded-2xl p-6 md:p-8 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-gray-400 text-sm">{today}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
                {greeting}, {user.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Pantau kendaraan dan booking Anda dari sini.
              </p>
            </div>
            
            {/* Stats pills di dalam header */}
            <div className="flex gap-3">
              <div className={`${activeBookings.length > 0 ? 'bg-purple-500' : 'bg-gray-700'} rounded-xl px-4 py-3 text-center min-w-[80px]`}>
                <p className="text-2xl font-bold text-white">{loading ? '—' : activeBookings.length}</p>
                <p className="text-xs text-gray-200 mt-0.5">Booking Aktif</p>
              </div>
              <div className="bg-gray-700 rounded-xl px-4 py-3 text-center min-w-[80px]">
                <p className="text-2xl font-bold text-white">{loading ? '—' : vehicles.length}</p>
                <p className="text-xs text-gray-200 mt-0.5">Kendaraan</p>
              </div>
              <div className="bg-gray-700 rounded-xl px-4 py-3 text-center min-w-[80px]">
                <p className="text-2xl font-bold text-white">{loading ? '—' : completedCount}</p>
                <p className="text-xs text-gray-200 mt-0.5">Selesai</p>
              </div>
            </div>
          </div>
        </div>

        {/* 1.2 Quick Actions — 4 Items Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/services', icon: CalendarPlus, label: 'Booking Baru', 
              desc: 'Pilih layanan', bg: 'bg-yellow-50 hover:bg-yellow-100', 
              color: 'text-yellow-600' },
            { to: '/bookings', icon: Clock, label: 'Booking Saya', 
              desc: `${activeBookings.length} aktif`, bg: 'bg-purple-50 hover:bg-purple-100', 
              color: 'text-purple-600' },
            { to: '/vehicles', icon: Car, label: 'Kendaraan', 
              desc: `${vehicles.length} terdaftar`, bg: 'bg-blue-50 hover:bg-blue-100', 
              color: 'text-blue-600' },
            { to: '/profile', icon: User, label: 'Profil', 
              desc: 'Edit profil', bg: 'bg-green-50 hover:bg-green-100', 
              color: 'text-green-600' },
          ].map(a => (
            <Link key={a.to} to={a.to} 
              className={`${a.bg} rounded-xl p-4 flex items-center gap-3 transition-colors`}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center 
                shadow-sm flex-shrink-0">
                <a.icon size={20} className={a.color}/>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{a.label}</p>
                <p className="text-xs text-gray-505">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* 1.3 Needs Action Alert (BARU) */}
        {!loading && needsAction.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden shadow-sm">
            <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"/>
              <span className="text-sm font-bold text-amber-900">
                Perlu Persetujuan Anda
              </span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-bold">
                {needsAction.length}
              </span>
            </div>
            {needsAction.map(b => (
              <div key={b.id} onClick={() => nav(`/bookings/${b.id}`)}
                className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {b.service?.name || 'Service'} — {b.vehicle?.brand} {b.vehicle?.model} ({b.vehicle?.plate})
                  </p>
                  <p className="text-xs text-amber-600 font-medium mt-0.5">
                    Estimasi biaya menunggu persetujuan Anda
                  </p>
                </div>
                <ArrowRight size={16} className="text-gray-400"/>
              </div>
            ))}
          </div>
        )}

        {/* 1.4 Active Booking Tracker — Show Max 3 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-900">Status Booking Aktif</h2>
            {!loading && activeBookings.length > 3 && (
              <Link to="/bookings" className="text-gray-900 text-sm font-bold flex items-center gap-1 hover:underline underline-offset-2 decoration-primary-500 decoration-2">
                Lihat semua ({activeBookings.length}) <ArrowRight size={14}/>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="card animate-pulse h-32"/>
          ) : activeBookings.length > 0 ? (
            <div className="space-y-4">
              {activeBookings.slice(0, 3).map(b => {
                const statusInfo = getStatusInfo(b.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <div key={b.id} onClick={() => nav(`/bookings/${b.id}`)} className="card-hover">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{b.service?.name || 'Service'}</h3>
                        <p className="text-sm text-gray-505 mt-0.5">
                          {b.vehicle?.brand} {b.vehicle?.model} — {b.vehicle?.plate}
                        </p>
                      </div>
                      <StatusBadge status={b.status}/>
                    </div>

                    <div className="flex gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-primary-500"/>
                        {formatDate(b.scheduled_date)}, {formatTime(b.scheduled_time)}
                      </span>
                      {b.mechanic && (
                        <span className="flex items-center gap-1.5">
                          <Wrench size={14} className="text-primary-500"/>
                          {b.mechanic.name}
                        </span>
                      )}
                    </div>

                    {/* Status Message */}
                    <div className={`flex items-center gap-2 p-3 border rounded-xl text-sm font-medium ${statusInfo.colorClass}`}>
                      <StatusIcon size={16} className="flex-shrink-0"/>
                      {statusInfo.message}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-400">Tap untuk lihat detail</span>
                      <ArrowRight size={16} className="text-gray-400"/>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card text-center py-10">
              <Car size={40} className="text-gray-300 mx-auto mb-3"/>
              <p className="font-semibold text-gray-700 mb-1">Tidak ada booking aktif</p>
              <p className="text-sm text-gray-500 mb-4">Kendaraan Anda belum ada yang sedang diservis</p>
              <Link to="/services" className="inline-flex justify-center items-center bg-primary-500 hover:bg-primary-600 text-gray-900 text-center px-6 py-2.5 rounded-xl font-bold transition duration-200 shadow-sm text-sm">
                Buat Booking Sekarang
              </Link>
            </div>
          )}
        </div>

        {/* 1.5 Riwayat Singkat */}
        {!loading && completedCount > 0 && (
          <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Star size={20} className="text-green-600"/>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Riwayat Service</p>
                <p className="text-xs text-gray-505">{completedCount} service telah selesai</p>
              </div>
            </div>
            <Link to="/bookings" className="text-gray-900 text-sm font-bold flex items-center gap-1 hover:underline underline-offset-2 decoration-primary-500 decoration-2">
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
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    serviceService.getAll()
      .then(data => {
        setServices(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingServices(false));
  }, []);

  const SOCIAL_PROOF = [
    { value: '150+', label: 'Kendaraan Dilayani' },
    { value: '4.8',  label: 'Rating Pelanggan', icon: Star },
    { value: '50+',  label: 'Customer Puas' },
    { value: '3',    label: 'Mekanik Bersertifikat' },
  ];

  const HOW_IT_WORKS = [
    { 
      step: 1, 
      icon: Search, 
      title: 'Pilih Layanan', 
      desc: 'Temukan dan pilih jenis perawatan kendaraan Anda secara online dengan rincian biaya yang transparan dan estimasi waktu yang jelas di awal.' 
    },
    { 
      step: 2, 
      icon: Calendar, 
      title: 'Booking Online', 
      desc: 'Tentukan jadwal kedatangan sesuai ketersediaan bengkel, daftarkan kendaraan, lalu lakukan booking hanya dalam waktu 2 menit.' 
    },
    { 
      step: 3, 
      icon: ClipboardList, 
      title: 'Inspeksi & Estimasi', 
      desc: 'Mekanik andalan kami melakukan inspeksi fisik secara mendetail dan mengirimkan estimasi biaya lengkap langsung ke aplikasi Anda untuk disetujui.' 
    },
    { 
      step: 4, 
      icon: CheckCircle, 
      title: 'Service & Bayar', 
      desc: 'Proses pengerjaan dimulai setelah Anda setuju. Lakukan pembayaran di kasir secara aman setelah seluruh pengerjaan service selesai dilakukan.' 
    },
  ];

  const KEUNGGULAN = [
    {
      icon: CreditCard,
      title: 'Estimasi Biaya di Depan',
      desc: 'Tahu biaya service SEBELUM kendaraan disentuh mekanik. Setuju dulu, baru dikerjakan.',
      mockup: (
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          {/* Mini estimation UI */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Service Umum</span>
              <span className="font-medium text-gray-900">Rp 400.000</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Kampas Rem (tambahan)</span>
              <span className="font-medium text-orange-600">+ Rp 150.000</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between text-xs">
              <span className="font-bold text-gray-900">Total Estimasi</span>
              <span className="font-bold text-yellow-600">Rp 550.000</span>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <div className="flex-1 bg-green-500 text-white text-xs py-1.5 rounded-lg text-center font-medium">Setujui</div>
            <div className="flex-1 bg-gray-200 text-gray-600 text-xs py-1.5 rounded-lg text-center font-medium">Tolak</div>
          </div>
        </div>
      )
    },
    {
      icon: Activity,
      title: 'Tracking Real-Time',
      desc: 'Pantau status service dari HP. Update di setiap tahap pengerjaan.',
      mockup: (
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          {/* Mini tracking UI */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={12} className="text-white"/>
              </div>
              <span className="text-xs text-gray-500 line-through">Booking dikonfirmasi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={12} className="text-white"/>
              </div>
              <span className="text-xs text-gray-500 line-through">Inspeksi selesai</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
                <div className="w-2 h-2 bg-white rounded-full"/>
              </div>
              <span className="text-xs text-gray-900 font-medium">Sedang dikerjakan...</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0"/>
              <span className="text-xs text-gray-400">Pembayaran</span>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Camera,
      title: 'Inspeksi Terdokumentasi',
      desc: 'Foto dan catatan inspeksi bisa dilihat langsung di aplikasi. Transparan & terpercaya.',
      mockup: (
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          {/* Mini inspection report UI */}
          <div className="text-xs text-gray-500 mb-2">Hasil Inspeksi</div>
          <div className="p-2.5 bg-white rounded-lg border border-gray-200 mb-2">
            <p className="text-xs text-gray-800">Oli hitam, kampas rem tipis, filter perlu diganti.</p>
          </div>
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Camera size={14} className="text-gray-400"/>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Camera size={14} className="text-gray-400"/>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">
              +2
            </div>
          </div>
        </div>
      )
    },
  ];

  const TESTIMONIALS = [
    {
      name: 'Budi Santoso',
      vehicle: 'Toyota Avanza',
      rating: 5,
      text: 'Pertama kali service di bengkel yang kasih tau estimasi biaya SEBELUM dikerjakan. No surprise di kasir. Recommended!',
    },
    {
      name: 'Sarah Wijaya',
      vehicle: 'Honda Jazz',
      rating: 5,
      text: 'Booking online-nya gampang banget. Tinggal pilih jadwal, datang, selesai. Mekaniknya juga ramah dan profesional.',
    },
    {
      name: 'Andi Prasetyo',
      vehicle: 'Suzuki Ertiga',
      rating: 5,
      text: 'Suka banget bisa tracking status service dari HP. Jadi tau kendaraan lagi di tahap apa. Sangat transparan!',
    },
  ];

  const FAQ_ITEMS = [
    {
      q: 'Bagaimana jika ditemukan kerusakan tambahan saat inspeksi?',
      a: 'Mekanik akan mengirimkan estimasi biaya tambahan untuk persetujuan Anda terlebih dahulu. Tidak ada perbaikan yang dilakukan tanpa persetujuan customer.'
    },
    {
      q: 'Berapa lama proses booking?',
      a: 'Proses booking online hanya membutuhkan 2 menit. Pilih layanan, pilih jadwal, konfirmasi. Selesai.'
    },
    {
      q: 'Metode pembayaran apa saja yang diterima?',
      a: 'Kami menerima pembayaran tunai, transfer bank, kartu debit/kredit, dan e-wallet.'
    },
    {
      q: 'Bagaimana jika saya tidak setuju dengan estimasi biaya?',
      a: 'Anda bisa menolak estimasi dan booking akan dibatalkan. Tidak ada biaya yang dikenakan untuk inspeksi.'
    },
    {
      q: 'Apakah bisa memantau progress service?',
      a: 'Ya! Anda bisa memantau status service secara real-time dari halaman Booking Saya. Setiap tahap akan di-update.'
    },
    {
      q: 'Apakah ada garansi service?',
      a: 'Ya, semua service kami bergaransi. Jika ada keluhan setelah service, silakan hubungi kami.'
    },
  ];

  const getServiceIcon = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('oli')) return Droplet;
    if (n.includes('listrik')) return Zap;
    if (n.includes('tune')) return Gauge;
    return Wrench;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. HERO */}
      <section style={{ backgroundColor: '#111111' }} className="py-16 md:py-24 px-4 overflow-hidden text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
              Service Kendaraan <span style={{ background: 'rgba(255, 212, 0, 0.15)', padding: '2px 8px', borderRadius: '6px', color: '#FFD400' }}>Transparan,</span><br className="hidden md:inline" />
              Tanpa Biaya Tersembunyi
            </h1>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Booking online dalam 2 menit. Lihat estimasi biaya sebelum service dimulai. Tidak ada kejutan di kasir.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="inline-flex justify-center items-center bg-primary-500 hover:bg-primary-600 text-gray-900 text-center px-8 py-3.5 rounded-xl font-bold transition duration-200 shadow-sm text-base">
                Booking Sekarang
              </Link>
              <Link to="/services" className="inline-flex justify-center items-center bg-transparent hover:bg-white/10 text-white text-center px-8 py-3.5 rounded-xl font-bold border border-white/30 transition duration-200 text-base">
                Lihat Layanan
              </Link>
            </div>
          </div>
          
          {/* Hero right side — App Mockup (Desktop only) */}
          <div className="hidden md:block">
            <div className="relative flex justify-center items-center">
              {/* Floating animation container */}
              <div className="animate-float z-10">
                {/* Screenshot card mockup */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-[320px] text-left border border-gray-100">
                  
                  {/* App header bar */}
                  <div className="bg-[#111111] px-4 py-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-400 ml-2">gearbox.co.id</span>
                  </div>

                  {/* Mock app content */}
                  <div className="p-4 space-y-3">
                    {/* Status tracker mock */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-900">Booking Aktif</span>
                      <span className="text-xs px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                        Sedang Dikerjakan
                      </span>
                    </div>
                    
                    {/* Progress bar mock */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: '70%' }} />
                    </div>
                    
                    {/* Service info mock */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                        <Wrench size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Ganti Oli</p>
                        <p className="text-xs text-gray-500">Honda Civic · B 1234 ABC</p>
                      </div>
                    </div>

                    {/* Checklist mock */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-500 line-through">Inspeksi kendaraan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-500 line-through">Estimasi disetujui</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-500 rounded-full animate-pulse flex-shrink-0" />
                        <span className="text-xs text-gray-900 font-bold">Service dikerjakan...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                        <span className="text-xs text-gray-400">Pembayaran</span>
                      </div>
                    </div>

                    {/* Estimation card mock */}
                    <div className="p-3 bg-[#111111] rounded-xl text-white">
                      <div className="flex justify-between text-xs items-center">
                        <span className="text-gray-400">Total Estimasi</span>
                        <span className="font-extrabold text-primary-500 text-sm">Rp 525.000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background glow effect */}
              <div className="absolute -z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                w-[350px] h-[350px] bg-primary-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SOCIAL PROOF BAR */}
      <section className="bg-white py-8 border-y border-gray-200 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {SOCIAL_PROOF.map((s, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-1.5 justify-center mb-1">
                  {s.icon && <s.icon size={20} className="text-primary-500 fill-primary-500" />}
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{s.value}</span>
                </div>
                <span className="text-sm text-gray-500 font-semibold">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="bg-gray-50 py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Cara Kerja GEARBOX</h2>
            <p className="text-gray-500 font-medium">4 langkah mudah dari booking sampai selesai</p>
          </div>
          <div className="max-w-2xl mx-auto">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative flex gap-6 pb-10 last:pb-0">
                  {/* Vertical line */}
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-px bg-gray-200"/>
                  )}
                  
                  {/* Step number circle */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-400 text-black font-bold 
                      rounded-full flex items-center justify-center text-sm shadow-md">
                      {step.step}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="pt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={20} className="text-gray-900"/>
                      <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. LAYANAN + HARGA */}
      <section className="bg-white py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Layanan Kami</h2>
            <p className="text-gray-500 font-medium">Harga transparan, tanpa biaya tersembunyi</p>
          </div>

          {loadingServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-50 rounded-2xl border border-gray-200 p-6 h-72" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Tidak ada layanan tersedia.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.slice(0, 4).map((service) => {
                const Icon = getServiceIcon(service.name);
                return (
                  <div key={service.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition flex flex-col justify-between h-full">
                    <div>
                      {service.image_url ? (
                        <img src={service.image_url} alt={service.name} 
                          className="w-full h-40 object-cover rounded-xl mb-4"/>
                      ) : (
                        <div className="w-full h-40 bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                          <Wrench size={32} className="text-gray-400"/>
                        </div>
                      )}
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{service.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                        {service.description || 'Layanan service berkualitas tinggi untuk kendaraan Anda.'}
                      </p>
                    </div>
                    <div>
                      <div className="border-t border-gray-100 pt-4 mb-4">
                        <p className="text-xs text-gray-400">Mulai dari</p>
                        <p className="text-xl font-black text-gray-900">{formatCurrency(service.base_price)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">⏱ ± {service.estimated_duration || 60} menit</p>
                      </div>
                      <Link to="/register" className="block bg-primary-500 hover:bg-primary-600 text-gray-900 text-center rounded-xl py-2.5 w-full font-bold transition duration-200 text-sm shadow-sm">
                        Booking Sekarang →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/services" className="inline-flex items-center gap-2 text-gray-900 font-extrabold hover:underline underline-offset-4 decoration-primary-500 decoration-2 transition">
              Lihat Semua Layanan <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. KEUNGGULAN */}
      <section className="bg-white py-16 md:py-24 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Kenapa Memilih GEARBOX?</h2>
            <p className="text-gray-500 font-medium">Bukan sekedar bengkel biasa</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {KEUNGGULAN.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} 
                  className="bg-white rounded-2xl border border-gray-200 p-6 
                    hover:shadow-lg hover:border-yellow-300 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    {/* Mini mockup */}
                    {feature.mockup}
                    
                    {/* Title */}
                    <div className="flex items-center gap-2 mb-2 mt-4">
                      <Icon size={20} className="text-yellow-600"/>
                      <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mt-2">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIAL */}
      <section className="bg-gray-50 py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Apa Kata Pelanggan Kami?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col justify-between shadow-sm">
                <div className="mb-4">
                  <div className="flex gap-1 mb-3 text-primary-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-primary-500 text-primary-500" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed italic">"{t.text}"</p>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.vehicle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="bg-white py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Pertanyaan yang Sering Ditanyakan</h2>
          </div>
          <div className="space-y-2">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="border-b border-gray-200">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left py-4 flex justify-between items-center focus:outline-none group"
                  >
                    <span className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors text-sm md:text-base">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-500' : ''}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? 'max-h-40 pb-4' : 'max-h-0'
                    }`}
                  >
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto bg-gray-900 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl border border-gray-800">
          <h2 className="text-3xl font-black mb-4">Booking Service Pertama Anda</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto text-sm md:text-base">
            Daftar gratis, booking dalam 2 menit. Lihat estimasi biaya sebelum service dimulai.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-gray-900 px-8 py-3.5 rounded-xl font-bold transition duration-200 shadow-lg text-base">
            Daftar & Booking Sekarang <ArrowRight size={20} />
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-white hover:text-primary-500 font-bold underline underline-offset-4 decoration-primary-500 decoration-2 transition">
              Masuk
            </Link>
          </p>
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
