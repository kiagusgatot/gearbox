import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Wrench, Lock, Check, CheckCircle } from 'lucide-react';
import { Input } from '../components/common/Input';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [f, setF] = useState({ password: '', password_confirmation: '' });
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    const e = searchParams.get('email');
    if (t) setToken(t);
    if (e) setEmail(e);
  }, [searchParams]);

  const h = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (f.password !== f.password_confirmation) {
      setError('Password tidak sama');
      return;
    }

    if (!token || !email) {
      setError('Token reset password atau email tidak valid.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email,
        token,
        password: f.password,
        password_confirmation: f.password_confirmation
      });
      setSuccess(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal merubah password. Pastikan link reset valid.');
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
            Buat password baru dan amankan akun <span className="text-yellow-400">GEARBOX</span> Anda
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            Pilihlah password yang kuat dan unik yang belum pernah digunakan di situs lain untuk memastikan keamanan maksimal.
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
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Buat Password Baru</h1>
              <p className="text-gray-500 mb-8">Masukkan password baru untuk akun Anda.</p>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Password Baru"
                  name="password"
                  type="password"
                  icon={Lock}
                  value={f.password}
                  onChange={h}
                  placeholder="Min. 8 karakter"
                  required
                />
                <Input
                  label="Konfirmasi Password"
                  name="password_confirmation"
                  type="password"
                  icon={Lock}
                  value={f.password_confirmation}
                  onChange={h}
                  placeholder="Ulangi password"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-400 text-black py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? 'Mengubah...' : 'Reset Password'}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                <CheckCircle size={32} />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Berhasil Diubah!</h1>
              <p className="text-gray-600 mb-8">
                Silakan login dengan password baru Anda.
              </p>

              <Link
                to="/login"
                className="block w-full bg-yellow-400 text-black py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors text-center"
              >
                Masuk ke Akun →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
