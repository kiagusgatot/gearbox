import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Wrench, Mail, Check } from 'lucide-react';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const data = await authService.resendVerification(email);
      setMessage(data.message || 'Link verifikasi berhasil dikirim ulang.');
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal mengirim ulang email verifikasi.');
    } finally {
      setLoading(false);
    }
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
            Langkah terakhir untuk mengaktifkan akun <span className="text-yellow-400">GEARBOX</span> Anda
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            Verifikasi email Anda diperlukan untuk memastikan keamanan akun dan menerima notifikasi update servis kendaraan secara langsung.
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

      {/* RIGHT SIDE — Pending View */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md text-center">
          {/* Mobile logo (hidden on desktop) */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Wrench size={20} className="text-gray-900"/>
            </div>
            <span className="text-xl font-bold text-gray-900">GEARBOX</span>
          </div>

          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
            <Mail size={32} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cek Email Anda</h1>
          <p className="text-gray-600 mb-6">
            Kami telah mengirimkan link verifikasi ke email{' '}
            <span className="font-bold text-gray-900">{email || 'Anda'}</span>. 
            Klik link di email tersebut untuk mengaktifkan akun Anda.
          </p>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-5 text-left">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5 text-left">
              {error}
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full bg-yellow-400 text-black py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {loading ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
          </button>

          <p className="text-sm text-gray-500">
            Sudah verifikasi?{' '}
            <Link to="/login" className="font-bold text-gray-900 hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
