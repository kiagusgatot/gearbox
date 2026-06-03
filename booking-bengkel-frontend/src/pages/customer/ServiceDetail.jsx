import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Car, Plus, X, Star, Wrench, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { serviceService } from '../../services/serviceService';
import { bookingService } from '../../services/bookingService';
import { vehicleService } from '../../services/vehicleService';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatters';
import { Loading } from '../../components/common/Loading';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { AvailabilityCalendar } from '../../components/booking/AvailabilityCalendar';
import { TimeSlotPicker } from '../../components/booking/TimeSlotPicker';
import { ReviewList } from '../../components/review/ReviewList';

const COLORS = ['Putih','Hitam','Silver','Merah','Biru','Abu-abu','Coklat','Kuning','Hijau','Orange'];
const CATEGORY_DISPLAY = {
  routine: 'Routine', maintenance: 'Maintenance', repair: 'Repair', parts: 'Parts', other: 'Lainnya'
};
const CATEGORY_COLORS = {
  routine: 'bg-blue-100 text-blue-700', maintenance: 'bg-orange-100 text-orange-700',
  repair: 'bg-red-100 text-red-700', parts: 'bg-purple-100 text-purple-700', other: 'bg-gray-100 text-gray-700'
};

export function ServiceDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // All useState hooks at the TOP
  const [svc, setSvc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [modal, setModal] = useState(false);
  const [sub, setSub] = useState(false);
  const [form, setForm] = useState({ vehicle_id:'', scheduled_date:'', scheduled_time:'', notes:'' });
  const [step, setStep] = useState('form');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vf, setVf] = useState({ brand:'', model:'', plate:'', year:'', color:'' });
  const [vSub, setVSub] = useState(false);
  const [bookError, setBookError] = useState('');

  // All useEffect hooks
  useEffect(() => {
    serviceService.getById(id).then(setSvc).catch(() => nav('/services')).finally(() => setLoading(false));
  }, [id]);

  const loadVehicles = () => vehicleService.getAll().then(data => {
    const arr = Array.isArray(data) ? data : (data?.data || []);
    setVehicles(Array.isArray(arr) ? arr : []);
  }).catch(() => {});

  useEffect(() => { if (modal) loadVehicles(); }, [modal]);

  // Handlers
  const h  = e => setForm({ ...form, [e.target.name]: e.target.value });
  const hv = e => setVf({ ...vf, [e.target.name]: e.target.value });

  const handleAddVehicle = async (e) => {
    e.preventDefault(); setVSub(true);
    try {
      const newV = await vehicleService.create({ ...vf, user_id: user?.id });
      const created = newV?.data || newV;
      await loadVehicles();
      setForm(f => ({ ...f, vehicle_id: created?.id || '' }));
      setVf({ brand:'', model:'', plate:'', year:'', color:'' });
      setShowAddVehicle(false);
    } catch (e) { alert(e.response?.data?.message || 'Gagal menambah kendaraan'); }
    finally { setVSub(false); }
  };

  const handleBook = async () => {
    setSub(true);
    setBookError('');
    const payload = { ...form, service_id: svc.id, user_id: user?.id };
    console.log('Booking payload:', payload);
    try {
      const res = await bookingService.create(payload);
      console.log('Booking response:', res);
      setModal(false); setStep('form'); nav('/bookings');
    } catch (e) {
      console.error('Booking error:', e);
      console.error('Error response:', e.response?.data);
      const msg = e.response?.data?.message
        || e.response?.data?.error
        || (e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : null)
        || 'Error ' + (e.response?.status || 'unknown') + ': Gagal membuat booking';
      setBookError(msg);
    } finally { setSub(false); }
  };

  const openModal = () => {
    setForm({ vehicle_id:'', scheduled_date:'', scheduled_time:'', notes:'' });
    setStep('form');
    setShowAddVehicle(false);
    setBookError('');
    setModal(true);
  };

  const canProceedToPreview = form.vehicle_id && form.scheduled_date && form.scheduled_time;
  const selectedVehicle = vehicles.find(v => v.id === form.vehicle_id);

  if (loading) return <Loading/>;
  if (!svc) return null;

  const name       = svc.name || 'Layanan';
  const desc       = svc.description || 'Layanan profesional untuk kendaraan Anda.';
  const category   = svc.category || 'other';
  const laborPrice = Number(svc.labor_price) || 0;
  const partsPrice = Number(svc.parts_price) || 0;
  const basePrice  = Number(svc.base_price) || (laborPrice + partsPrice);
  const duration   = svc.estimated_duration || 0;
  const maxBooking = svc.max_booking_per_day || 8;
  const terms      = svc.terms_conditions || '';
  const rating     = Number(svc.rating) || 0;
  const reviewCount= Number(svc.review_count) || 0;
  const catDisplay = CATEGORY_DISPLAY[category] || 'Layanan';
  const catColor   = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
          <ArrowLeft size={20}/>Kembali
        </button>

        {/* Service Header Card */}
        <div className="card">
          <div className="bg-primary-50 rounded-2xl h-48 flex items-center justify-center mb-6">
            <CheckCircle size={60} className="text-primary-300"/>
          </div>
          <div className="mb-6 pb-6 border-b border-gray-200">
            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold mb-3 ${catColor}`}>{catDisplay}</span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{name}</h1>
            <p className="text-gray-600">{desc}</p>
          </div>

          {reviewCount > 0 && (
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(n => <Star key={n} size={18} className={n <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}/>)}
              </div>
              <span className="font-semibold text-gray-900">{rating.toFixed(1)}/5</span>
              <span className="text-gray-500">({reviewCount} review)</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-3">Rincian Biaya</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Tenaga Kerja</span><span className="font-semibold">{formatCurrency(laborPrice)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Suku Cadang</span><span className="font-semibold">{formatCurrency(partsPrice)}</span></div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200"><span>Total</span><span className="text-primary-600 text-lg">{formatCurrency(basePrice)}</span></div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-3">Informasi Layanan</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm"><Clock size={16} className="text-primary-600"/><span>Durasi: <strong>{duration} menit</strong></span></div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle size={16} className="text-primary-600"/><span>Slot tersedia: <strong>{maxBooking}/hari</strong></span></div>
              </div>
            </div>
          </div>

          {terms && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">Syarat & Ketentuan</p>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-xl">{terms}</p>
            </div>
          )}

          <Button onClick={() => isAuthenticated ? openModal() : nav('/login')} fullWidth>Booking Sekarang</Button>
        </div>

        {/* Testimonials */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Star size={24} className="text-yellow-400 fill-yellow-400"/>Testimoni Pelanggan
          </h2>
          <p className="text-gray-500 mb-6">Pengalaman pelanggan yang telah menggunakan layanan ini</p>
          <ReviewList serviceId={id} maxDisplay={5}/>
        </div>
      </div>

      {/* ===== BOOKING MODAL ===== */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setStep('form'); setShowAddVehicle(false); setBookError(''); }}
        title={step === 'form' ? 'Buat Booking' : 'Konfirmasi Booking'}>

        {/* Service Summary */}
        <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <Wrench size={20} className="text-primary-700"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{name}</p>
            <p className="text-xs text-gray-600">{catDisplay} · {duration} menit</p>
          </div>
          <p className="font-bold text-primary-600 text-sm whitespace-nowrap">{formatCurrency(basePrice)}</p>
        </div>

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kendaraan</label>
              <select name="vehicle_id" value={form.vehicle_id} onChange={h} className="input-field" required>
                <option value="">-- Pilih Kendaraan --</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} — {v.plate}</option>)}
              </select>
              {!showAddVehicle && (
                <button type="button" onClick={() => setShowAddVehicle(true)}
                  className="mt-2 flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
                  <Plus size={16}/>Daftarkan Kendaraan Baru
                </button>
              )}
            </div>

            {showAddVehicle && (
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-primary-800 flex items-center gap-2"><Car size={16}/>Tambah Kendaraan Baru</p>
                  <button type="button" onClick={() => setShowAddVehicle(false)} className="p-1 hover:bg-primary-100 rounded-lg"><X size={16} className="text-primary-600"/></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Merk" name="brand" value={vf.brand} onChange={hv} placeholder="Toyota" required/>
                  <Input label="Model" name="model" value={vf.model} onChange={hv} placeholder="Avanza" required/>
                </div>
                <Input label="Plat Nomor" name="plate" value={vf.plate} onChange={hv} placeholder="B 1234 ABC" required/>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Tahun" name="year" type="number" value={vf.year} onChange={hv} placeholder="2020" required/>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Warna</label>
                    <select name="color" value={vf.color} onChange={hv} className="input-field" required>
                      <option value="">-- Pilih --</option>
                      {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <Button type="button" onClick={handleAddVehicle} fullWidth size="sm" loading={vSub}>
                  <Plus size={16}/>Simpan & Pilih Kendaraan Ini
                </Button>
              </div>
            )}

            <AvailabilityCalendar serviceId={svc.id} selectedDate={form.scheduled_date}
              onDateSelect={(date) => setForm({...form, scheduled_date: date, scheduled_time: ''})}/>

            <TimeSlotPicker selectedDate={form.scheduled_date} selectedTime={form.scheduled_time}
              onTimeSelect={(time) => setForm({...form, scheduled_time: time})}/>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catatan / Keluhan (opsional)</label>
              <textarea name="notes" value={form.notes} onChange={h} className="input-field min-h-[80px]"
                placeholder="Contoh: Mesin bunyi, rem tidak pakem..."/>
            </div>

            <Button type="button" fullWidth disabled={!canProceedToPreview} onClick={() => setStep('preview')}>
              Lanjut ke Konfirmasi
            </Button>
          </div>
        )}

        {/* STEP 2: PREVIEW */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {[
                { icon: Wrench,   label: 'Layanan',    value: name },
                { icon: Car,      label: 'Kendaraan',  value: selectedVehicle ? (selectedVehicle.brand + ' ' + selectedVehicle.model + ' — ' + selectedVehicle.plate) : '-' },
                { icon: Calendar, label: 'Tanggal',    value: form.scheduled_date ? new Date(form.scheduled_date + 'T00:00:00').toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : '-' },
                { icon: Clock,    label: 'Jam',        value: form.scheduled_time ? form.scheduled_time + ' WIB' : '-' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <item.icon size={18} className="text-primary-600 flex-shrink-0"/>
                  <div><p className="text-xs text-gray-400">{item.label}</p><p className="text-sm font-semibold text-gray-900">{item.value}</p></div>
                </div>
              ))}

              {form.notes && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <AlertCircle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0"/>
                  <div><p className="text-xs text-gray-400">Catatan</p><p className="text-sm text-gray-900">{form.notes}</p></div>
                </div>
              )}

              <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Estimasi Biaya</span>
                <span className="text-lg font-bold text-primary-600">{formatCurrency(basePrice)}</span>
              </div>
            </div>

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-2">
              <CreditCard size={16} className="text-orange-600 mt-0.5 flex-shrink-0"/>
              <p className="text-xs text-orange-800">Pembayaran dilakukan di <strong>kasir bengkel</strong> setelah service selesai. Biaya final akan ditentukan berdasarkan hasil inspeksi mekanik.</p>
            </div>

            {bookError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                <p className="font-medium mb-1">Gagal membuat booking:</p>
                <p>{bookError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => { setStep('form'); setBookError(''); }} className="flex-1">
                Kembali
              </Button>
              <Button type="button" onClick={handleBook} loading={sub} className="flex-1">
                Konfirmasi Booking
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
