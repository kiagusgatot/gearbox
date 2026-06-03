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
  const { login } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await authService.login(email, password);
      const user  = data.user  || { email, role: 'customer' };
      const token = data.token || data.access_token || '';
      login(user, token);
      if (user.role === 'admin')    nav('/admin');
      else if (user.role === 'mechanic') nav('/mechanic');
      else nav('/');
    } catch (e) {
      setError(e.response?.data?.message || 'Email atau password salah');
    } finally { setLoading(false); }
  };

  return <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Wrench size={40} className="text-primary-600 mx-auto mb-4"/>
        <h1 className="text-2xl font-bold text-gray-900">Selamat Datang</h1>
        <p className="text-gray-500 mt-1">Masuk ke akun Anda</p>
      </div>
      <div className="card">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" icon={Mail} value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.com" required/>
          <Input label="Password" type="password" icon={Lock} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/>
          <div className="flex justify-end text-xs">
            <Link to="/forgot-password" className="text-primary-600 hover:underline font-semibold">Lupa Password?</Link>
          </div>
          <Button type="submit" fullWidth loading={loading}>Masuk</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">Belum punya akun? <Link to="/register" className="text-primary-600 font-semibold hover:underline">Daftar</Link></p>
      </div>
    </div>
  </div>;
}
