import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Wrench, Mail, Check, ArrowLeft } from 'lucide-react';
import { Input } from '../components/common/Input';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const data = await authService.forgotPassword(email);
      setSuccess(true);
      setMessage(data.message || 'Link reset password berhasil dikirim ke email Anda.');
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal mengirim email reset password.');
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
            Pulihkan akses ke akun <span className="text-yellow-400">GEARBOX</span> Anda dengan mudah
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            Cukup masukkan email terdaftar Anda, dan kami akan mengirimkan link untuk mengatur ulang password Anda dengan aman.
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

      {/* RIGHT SIDE — Form / Success */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo (hidden on desktop) */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Wrench size={20} className="text-gray-900"/>
            </div>
            <span className="text-xl font-bold text-gray-900">GEARBOX</span>
          </div>

          {!success ? (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Lupa Password?</h1>
              <p className="text-gray-500 mb-8">Masukkan email Anda untuk menerima link reset password.</p>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email"
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-400 text-black py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Mengirim...' : 'Kirim Link Reset Password'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link to="/login" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900">
                  <ArrowLeft size={16} className="mr-2"/> Ingat password? Masuk
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
                <Mail size={32} />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Reset Dikirim!</h1>
              <p className="text-gray-600 mb-8">
                Silakan cek email Anda untuk link reset password.
              </p>

              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-5 text-left">
                  {message}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Mengirim...' : 'Kirim Ulang'}
                </button>
                <Link
                  to="/login"
                  className="flex-1 bg-yellow-400 text-black py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors text-center"
                >
                  Kembali ke Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
