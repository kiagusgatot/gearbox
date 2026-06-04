import { useState, useEffect } from 'react';
import { Car, Plus, Pencil, Trash2, Calendar, Palette, Hash, Fuel, Settings } from 'lucide-react';
import { vehicleService } from '../../services/vehicleService';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog, AlertDialog } from '../../components/common/ConfirmDialog';

const BRANDS = ['Honda','Toyota','Suzuki','Daihatsu','Mitsubishi','Nissan','Hyundai','KIA','Mazda','BMW','Mercedes-Benz','Audi','Wuling','Lainnya'];
const TRANSMISSIONS = [{ value:'manual', label:'Manual' }, { value:'automatic', label:'Otomatis' }];
const FUEL_TYPES = [{ value:'bensin', label:'Bensin' }, { value:'diesel', label:'Diesel' }, { value:'electric', label:'Electric' }, { value:'hybrid', label:'Hybrid' }];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

const EMPTY_FORM = { brand:'', model:'', year:'', color:'', plate:'', transmission:'manual', fuel_type:'bensin' };

export function Vehicles() {
  const [list, setList] = useState([]); const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false); const [editVehicle, setEditVehicle] = useState(null);
  const [sub, setSub] = useState(false);
  const [form, setForm] = useState({...EMPTY_FORM});
  const [dialog, setDialog] = useState(null);
  const [alertDlg, setAlertDlg] = useState(null);

  const load = () => vehicleService.getAll().then(data => {
    const arr = Array.isArray(data) ? data : (data?.data || []);
    setList(arr);
  }).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditVehicle(null); setForm({...EMPTY_FORM}); setModal(true); };
  const openEdit = (v) => {
    setEditVehicle(v);
    setForm({
      brand: v.brand || '', model: v.model || '', year: v.year || '',
      color: v.color || '', plate: v.plate || '',
      transmission: v.transmission || 'manual', fuel_type: v.fuel_type || 'bensin',
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      if (editVehicle) await vehicleService.update(editVehicle.id, form);
      else await vehicleService.create(form);
      setModal(false); load();
      setAlertDlg({ title: 'Berhasil!', message: editVehicle ? 'Kendaraan berhasil diperbarui.' : 'Kendaraan berhasil ditambahkan.', variant: 'success' });
    } catch (e) {
      setAlertDlg({ title: 'Gagal', message: e.response?.data?.message || 'Gagal menyimpan kendaraan', variant: 'danger' });
    } finally { setSub(false); }
  };

  const handleDelete = (v) => {
    setDialog({
      title: 'Hapus Kendaraan?',
      message: `${v.brand} ${v.model} (${v.plate}) akan dihapus. Pastikan tidak ada booking aktif untuk kendaraan ini.`,
      variant: 'danger', confirmLabel: 'Ya, Hapus',
      onConfirm: async () => {
        try { await vehicleService.delete(v.id); load(); }
        catch { setAlertDlg({ title: 'Gagal', message: 'Gagal menghapus. Mungkin ada booking aktif.', variant: 'danger' }); }
      }
    });
  };

  const h = e => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="section-title">Kendaraan Saya</h1>
            <p className="text-gray-500">{list.length} kendaraan terdaftar</p>
          </div>
          <Button onClick={openAdd}><Plus size={18}/>Tambah Kendaraan</Button>
        </div>

        {loading ? <Loading/> : list.length === 0 ? (
          <EmptyState icon={Car} title="Belum ada kendaraan" description="Tambahkan kendaraan untuk mulai booking service."/>
        ) : (
          <div className="space-y-4">
            {list.map(v => (
              <div key={v.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Car size={24} className="text-gray-900"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{v.brand} {v.model}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5"><Hash size={14} className="text-blue-500"/>{v.plate}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="text-green-500"/>{v.year}</span>
                      <span className="flex items-center gap-1.5"><Palette size={14} className="text-pink-500"/>{v.color || '-'}</span>
                      {v.transmission && <span className="flex items-center gap-1.5"><Settings size={14} className="text-orange-500"/>{v.transmission === 'automatic' ? 'Otomatis' : 'Manual'}</span>}
                      {v.fuel_type && <span className="flex items-center gap-1.5"><Fuel size={14} className="text-amber-500"/>{v.fuel_type}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(v)} className="p-2 hover:bg-blue-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                      <Pencil size={18}/>
                    </button>
                    <button onClick={() => handleDelete(v)} className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors" title="Hapus">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Vehicle Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 -mt-2 mb-2">Isi informasi kendaraan Anda dengan lengkap untuk memudahkan proses service di bengkel.</p>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Merk Kendaraan</label>
            <select name="brand" value={form.brand} onChange={h} className="input-field" required>
              <option value="">— Pilih merk —</option>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Model */}
          <Input label="Model / Tipe" name="model" value={form.model} onChange={h} placeholder="cth: Civic, Avanza, Ertiga" required/>

          {/* Year + Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
              <select name="year" value={form.year} onChange={h} className="input-field" required>
                <option value="">— Pilih —</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <Input label="Warna" name="color" value={form.color} onChange={h} placeholder="cth: Hitam, Putih, Silver"/>
          </div>

          {/* Plate */}
          <Input label="Nomor Plat" name="plate" value={form.plate} onChange={h} placeholder="cth: B 1234 ABC" required/>

          {/* Transmission + Fuel */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transmisi</label>
              <div className="flex gap-2">
                {TRANSMISSIONS.map(t => (
                  <button key={t.value} type="button" onClick={() => setForm({...form, transmission: t.value})}
                    className={`flex-1 p-2.5 rounded-xl border-2 text-sm font-bold text-center transition-all ${
                      form.transmission === t.value ? 'border-primary-500 bg-primary-50 text-gray-900 font-bold' : 'border-gray-200 bg-white text-gray-600 hover:border-primary-500'
                    }`}>{t.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bahan Bakar</label>
              <select name="fuel_type" value={form.fuel_type} onChange={h} className="input-field">
                {FUEL_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          {/* Preview */}
          {form.brand && form.model && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-xs text-gray-400 mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center"><Car size={20} className="text-gray-900"/></div>
                <div>
                  <p className="font-bold text-gray-900">{form.brand} {form.model}</p>
                  <p className="text-xs text-gray-500">{form.plate || '—'} · {form.year || '—'} · {form.color || '—'} · {form.transmission === 'automatic' ? 'AT' : 'MT'} · {form.fuel_type}</p>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" fullWidth loading={sub}>
            {editVehicle ? 'Simpan Perubahan' : 'Tambah Kendaraan'}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog config={dialog} onClose={() => setDialog(null)}/>
      <AlertDialog config={alertDlg} onClose={() => setAlertDlg(null)}/>
    </div>
  );
}
