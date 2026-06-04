import { Wrench, MapPin, Phone, Mail } from 'lucide-react';
export function Footer() {
  return <footer className="bg-gray-900 text-gray-400 py-12 px-4 mt-auto">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-4"><Wrench size={22} className="text-primary-500 fill-primary-500"/><span className="text-lg font-extrabold text-white tracking-wider">GEARBOX</span></div>
        <p className="text-sm">Solusi booking service kendaraan yang cepat, mudah, dan terpercaya.</p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Kontak</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2"><MapPin size={14}/>Jl. Bengkel No. 123, Jakarta</div>
          <div className="flex items-center gap-2"><Phone size={14}/>(021) 1234-5678</div>
          <div className="flex items-center gap-2"><Mail size={14}/>info@gearbox.co.id</div>
        </div>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Jam Operasional</h4>
        <div className="text-sm space-y-1">
          <p>Senin – Jumat: 08.00 – 17.00</p>
          <p>Sabtu: 08.00 – 14.00</p>
          <p className="text-red-400">Minggu: Tutup</p>
        </div>
      </div>
    </div>
    <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-800 text-center text-sm">&copy; {new Date().getFullYear()} GEARBOX. All rights reserved.</div>
  </footer>;
}
