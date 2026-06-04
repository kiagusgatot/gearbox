import { Link } from 'react-router-dom';
import { Wrench, CheckCircle, Check } from 'lucide-react';

export function EmailVerified() {
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
            Akun Anda sekarang telah aktif dan siap digunakan
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            Nikmati kemudahan pendaftaran kendaraan, monitoring status perbaikan secara transparan, dan persetujuan estimasi biaya dari genggaman Anda.
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

      {/* RIGHT SIDE — Verified View */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md text-center">
          {/* Mobile logo (hidden on desktop) */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Wrench size={20} className="text-gray-900"/>
            </div>
            <span className="text-xl font-bold text-gray-900">GEARBOX</span>
          </div>

          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle size={32} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Berhasil Diverifikasi!</h1>
          <p className="text-gray-600 mb-8">
            Akun Anda sudah aktif. Silakan login untuk mulai melakukan booking service kendaraan Anda.
          </p>

          <Link
            to="/login"
            className="block w-full bg-yellow-400 text-black py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors text-center"
          >
            Masuk ke Akun Anda →
          </Link>
        </div>
      </div>
    </div>
  );
}
