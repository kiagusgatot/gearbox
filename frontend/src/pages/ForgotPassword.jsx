import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Wrench, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await authService.forgotPassword(email);
      setSuccess(data.message || 'Link reset password telah dikirim ke email Anda.');
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal mengirim email reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Wrench size={40} className="text-primary-600 mx-auto mb-4"/>
          <h1 className="text-2xl font-bold text-gray-900">Lupa Password</h1>
          <p className="text-gray-500 mt-1">Masukkan email terdaftar untuk reset password</p>
        </div>
        <div className="card">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-5">{success}</div>}
          
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email" type="email" icon={Mail} value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.com" required/>
              <Button type="submit" fullWidth loading={loading}>Kirim Link Reset</Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 text-sm mb-4">Silakan cek file log Laravel Anda (`backend/storage/logs/laravel.log`) untuk melihat email simulasi link reset password.</p>
              <Link to="/login" className="text-primary-600 font-semibold hover:underline block text-sm">Kembali ke halaman login</Link>
            </div>
          )}
          
          <div className="mt-6 border-t border-gray-100 pt-4 text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-primary-600">
              <ArrowLeft size={16} className="mr-2"/> Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
