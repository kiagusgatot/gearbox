import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Wrench, Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export function Register() {
  const [f, setF] = useState({ name:'', email:'', phone:'', password:'', password_confirmation:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const nav = useNavigate();
  const h = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (f.password !== f.password_confirmation) { setError('Password tidak sama'); return; }
    setLoading(true);
    try {
      const data = await authService.register({ ...f, role: 'customer' });
      setSuccess(data.message || 'Registrasi berhasil. Silakan cek email Anda untuk melakukan verifikasi.');
    } catch (e) { setError(e.response?.data?.message || 'Registrasi gagal'); }
    finally { setLoading(false); }
  };

  return <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Wrench size={40} className="text-primary-600 mx-auto mb-4"/>
        <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
        <p className="text-gray-500 mt-1">Daftar dan mulai booking service</p>
      </div>
      <div className="card">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">{error}</div>}
        
        {!success ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Nama Lengkap" name="name" icon={User} value={f.name} onChange={h} placeholder="John Doe" required/>
              <Input label="Email" name="email" type="email" icon={Mail} value={f.email} onChange={h} placeholder="nama@email.com" required/>
              <Input label="Nomor HP" name="phone" icon={Phone} value={f.phone} onChange={h} placeholder="08123456789" required/>
              <Input label="Password" name="password" type="password" icon={Lock} value={f.password} onChange={h} placeholder="Min. 8 karakter" required/>
              <Input label="Konfirmasi Password" name="password_confirmation" type="password" icon={Lock} value={f.password_confirmation} onChange={h} placeholder="Ulangi password" required/>
              <Button type="submit" fullWidth loading={loading}>Buat Akun</Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">Sudah punya akun? <Link to="/login" className="text-primary-600 font-semibold hover:underline">Masuk</Link></p>
          </>
        ) : (
          <div className="text-center py-6">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4"/>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Registrasi Sukses</h2>
            <p className="text-gray-600 text-sm mb-6">{success}</p>
            <p className="text-gray-500 text-xs mb-6 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
              Silakan cek log Laravel Anda (`backend/storage/logs/laravel.log`) untuk melihat link simulasi verifikasi email Anda.
            </p>
            <Link to="/login" className="text-primary-600 font-semibold hover:underline block text-sm">Kembali ke Halaman Login</Link>
          </div>
        )}
      </div>
    </div>
  </div>;
}

