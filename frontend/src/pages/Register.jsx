import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Wrench, Mail, Lock, User, Phone, CheckCircle, Check } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export function Register() {
  const [f, setF] = useState({ name:'', email:'', phone:'', password:'', password_confirmation:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();
  const h = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (f.password !== f.password_confirmation) { setError('Password tidak sama'); return; }
    setLoading(true);
    try {
      await authService.register({ ...f, role: 'customer' });
      nav('/verify-email?email=' + encodeURIComponent(f.email));
    } catch (e) { setError(e.response?.data?.message || 'Registrasi gagal'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE — Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 p-12 flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Wrench size={20} className="text-gray-900"/>
            </div>
            <span className="text-xl font-bold text-white">GEARBOX</span>
          </div>
          
          {/* Tagline */}
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Bergabung dengan <span className="text-yellow-400">GEARBOX</span> dan nikmati kemudahan booking service kendaraan
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            Dapatkan akses penuh ke tracking service real-time, riwayat servis kendaraan Anda, dan persetujuan estimasi secara instan.
          </p>
        </div>
        
        {/* Benefit list */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-yellow-400/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Check size={14} className="text-yellow-400" />
            </div>
            <span className="text-gray-300 text-sm font-medium">Estimasi biaya transparan</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-yellow-400/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Check size={14} className="text-yellow-400" />
            </div>
            <span className="text-gray-300 text-sm font-medium">Tracking service real-time</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-yellow-400/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Check size={14} className="text-yellow-400" />
            </div>
            <span className="text-gray-300 text-sm font-medium">Inspeksi terdokumentasi</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo (hidden on desktop) */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Wrench size={20} className="text-gray-900"/>
            </div>
            <span className="text-xl font-bold text-gray-900">GEARBOX</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Daftar Akun Baru</h1>
          <p className="text-gray-500 mb-8">Mulai booking service kendaraan</p>
          
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nama Lengkap" name="name" icon={User} value={f.name} onChange={h} placeholder="John Doe" required/>
            <Input label="Email" name="email" type="email" icon={Mail} value={f.email} onChange={h} placeholder="nama@email.com" required/>
            <Input label="Nomor HP" name="phone" icon={Phone} value={f.phone} onChange={h} placeholder="08123456789" required/>
            <Input label="Password" name="password" type="password" icon={Lock} value={f.password} onChange={h} placeholder="Min. 8 karakter" required/>
            <Input label="Konfirmasi Password" name="password_confirmation" type="password" icon={Lock} value={f.password_confirmation} onChange={h} placeholder="Ulangi password" required/>
            <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-black 
              py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Memproses...' : 'Buat Akun'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-gray-900 font-bold hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

