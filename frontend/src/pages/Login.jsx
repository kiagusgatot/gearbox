import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Wrench, Mail, Lock } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setUnverifiedEmail(false); setLoading(true);
    try {
      const data = await authService.login(email, password);
      const user  = data.user  || { email, role: 'customer' };
      const token = data.token || data.access_token || '';
      login(user, token);
      if (user.role === 'admin')    nav('/admin');
      else if (user.role === 'mechanic') nav('/mechanic');
      else nav('/');
    } catch (e) {
      if (e.response?.data?.error_code === 'email_not_verified') {
        setError('Email belum diverifikasi. Silakan cek email Anda.');
        setUnverifiedEmail(true);
      } else {
        setError(e.response?.data?.message || 'Email atau password salah');
      }
    } finally { setLoading(false); }
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
            Service kendaraan{' '}
            <span className="text-yellow-400">transparan</span>,{' '}
            tanpa biaya tersembunyi
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Booking online dalam 2 menit. Lihat estimasi biaya 
            sebelum service dimulai. Tidak ada kejutan di kasir.
          </p>
        </div>
        
        {/* Social proof */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-white">150+</p>
            <p className="text-xs text-gray-500">Kendaraan Dilayani</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">⭐ 4.8</p>
            <p className="text-xs text-gray-500">Rating Pelanggan</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">50+</p>
            <p className="text-xs text-gray-500">Customer Puas</p>
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
          
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Masuk ke Akun Anda</h1>
          <p className="text-gray-500 mb-6">Kelola booking dan pantau service kendaraan</p>
          
          {/* Test Credentials Container */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center justify-between">
              <span>Test Credentials</span>
              <span className="text-[10px] uppercase tracking-wider bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-bold">Development</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-gray-800">
              <button 
                type="button" 
                onClick={() => { setEmail('admin@gearbox.co.id'); setPassword('password123'); }}
                className="text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all group"
              >
                <span className="block font-bold group-hover:text-yellow-700">Admin</span>
              </button>
              <button 
                type="button" 
                onClick={() => { setEmail('ahmad@gearbox.co.id'); setPassword('password123'); }}
                className="text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all group"
              >
                <span className="block font-bold group-hover:text-yellow-700">Mechanic</span>
              </button>
              <button 
                type="button" 
                onClick={() => { setEmail('budi@gearbox.co.id'); setPassword('password123'); }}
                className="text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all group col-span-2"
              >
                <span className="block font-bold group-hover:text-yellow-700">Customer</span>
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
              {error}{' '}
              {unverifiedEmail && (
                <Link
                  to={`/verify-email?email=${encodeURIComponent(email)}`}
                  className="underline font-bold text-red-800 ml-1"
                >
                  Verifikasi Sekarang →
                </Link>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" icon={Mail} value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.com" required/>
            <Input label="Password" type="password" icon={Lock} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/>
            <div className="flex justify-end text-xs">
              <Link to="/forgot-password" className="text-gray-900 hover:underline font-bold">Lupa Password?</Link>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-black 
              py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold text-gray-900 hover:underline">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
