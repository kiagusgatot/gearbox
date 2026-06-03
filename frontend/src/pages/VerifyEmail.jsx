import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Wrench, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setError('Token verifikasi atau email tidak lengkap/tidak valid.');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const data = await authService.verifyEmail({ token, email });
        setSuccess(data.message || 'Email Anda berhasil diverifikasi!');
      } catch (e) {
        setError(e.response?.data?.message || 'Token verifikasi tidak valid atau e-mail salah.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <Wrench size={40} className="text-primary-600 mx-auto mb-4"/>
          <h1 className="text-2xl font-bold text-gray-900">Verifikasi Email</h1>
        </div>
        <div className="card text-center py-8">
          {loading && (
            <div className="flex flex-col items-center py-6">
              <Loader2 size={36} className="text-primary-600 animate-spin mb-4"/>
              <p className="text-gray-600">Memproses verifikasi email Anda...</p>
            </div>
          )}

          {!loading && success && (
            <div className="py-4">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4"/>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{success}</h2>
              <p className="text-gray-500 text-sm mb-6">Akun Anda sekarang telah aktif dan Anda dapat menggunakan seluruh layanan kami.</p>
              <Link to="/login" className="btn btn-primary w-full inline-block py-2 rounded-xl font-semibold">Masuk ke Akun</Link>
            </div>
          )}

          {!loading && error && (
            <div className="py-4">
              <XCircle size={48} className="text-red-500 mx-auto mb-4"/>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Verifikasi Gagal</h2>
              <p className="text-red-600 text-sm mb-6">{error}</p>
              <Link to="/login" className="text-primary-600 font-semibold hover:underline block text-sm">Kembali ke Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
