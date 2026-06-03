import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Wrench, Lock } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  
  const [f, setF] = useState({ password: '', password_confirmation: '' });
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');
    
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
      const data = await authService.resetPassword({
        email,
        token,
        password: f.password,
        password_confirmation: f.password_confirmation
      });
      setSuccess(data.message || 'Password berhasil diubah.');
      setTimeout(() => {
        nav('/login');
      }, 3000);
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal merubah password. Pastikan link reset valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Wrench size={40} className="text-primary-600 mx-auto mb-4"/>
          <h1 className="text-2xl font-bold text-gray-900">Buat Password Baru</h1>
          <p className="text-gray-500 mt-1">Masukkan password baru Anda di bawah ini</p>
        </div>
        <div className="card">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-5">{success}</div>}
          
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Password Baru" name="password" type="password" icon={Lock} value={f.password} onChange={h} placeholder="Min. 6 karakter" required/>
              <Input label="Konfirmasi Password" name="password_confirmation" type="password" icon={Lock} value={f.password_confirmation} onChange={h} placeholder="Ulangi password" required/>
              <Button type="submit" fullWidth loading={loading}>Reset Password</Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 text-sm mb-4">Mengalihkan ke halaman login...</p>
              <Link to="/login" className="text-primary-600 font-semibold hover:underline block text-sm">Masuk sekarang</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
