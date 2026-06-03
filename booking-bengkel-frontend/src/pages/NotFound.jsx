import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
export function NotFound() {
  return <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="text-center">
      <p className="text-8xl font-bold text-primary-200 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-gray-500 mb-8">Halaman yang Anda cari tidak tersedia</p>
      <Link to="/" className="btn-primary"><Home size={18}/>Kembali ke Home</Link>
    </div>
  </div>;
}
