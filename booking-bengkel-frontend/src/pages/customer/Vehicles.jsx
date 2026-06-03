import { useState, useEffect } from 'react';
import { Car, Plus, Trash2 } from 'lucide-react';
import { vehicleService } from '../../services/vehicleService';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';

const COLORS = ['Putih','Hitam','Silver','Merah','Biru','Abu-abu','Coklat','Kuning','Hijau','Orange'];

export function Vehicles() {
  const { user } = useAuth();
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sub, setSub]           = useState(false);
  const [form, setForm]         = useState({ brand:'', model:'', plate:'', year:'', color:'' });
  const h = e => setForm({ ...form, [e.target.name]: e.target.value });

  const load = () => vehicleService.getAll().then(setList).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      await vehicleService.create({ ...form, user_id: user?.id });
      setShowModal(false);
      setForm({ brand:'', model:'', plate:'', year:'', color:'' });
      load();
    } catch (e) { alert(e.response?.data?.message || 'Gagal menambah kendaraan'); }
    finally { setSub(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="section-title">Kendaraan Saya</h1>
            <p className="text-gray-500">{list.length} kendaraan terdaftar</p>
          </div>
          <Button onClick={() => setShowModal(true)}><Plus size={18}/>Tambah Kendaraan</Button>
        </div>

        {/* List */}
        {loading ? <Loading/> : list.length === 0 ? (
          <div className="card text-center py-16">
            <Car size={48} className="text-gray-300 mx-auto mb-4"/>
            <h3 className="font-bold text-gray-700 mb-2">Belum ada kendaraan</h3>
            <p className="text-sm text-gray-500 mb-6">Tambahkan kendaraan Anda untuk mulai booking service</p>
            <Button onClick={() => setShowModal(true)}><Plus size={18}/>Tambah Kendaraan Pertama</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map(v => (
              <div key={v.id} className="card flex items-center gap-4">
                {/* Color dot */}
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Car size={24} className="text-gray-500"/>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{v.brand} {v.model}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <span className="text-sm text-gray-500">🔢 {v.plate}</span>
                    <span className="text-sm text-gray-500">📅 {v.year}</span>
                    <span className="text-sm text-gray-500">🎨 {v.color}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tambah Kendaraan">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Merk" name="brand" value={form.brand} onChange={h} placeholder="Toyota" required/>
            <Input label="Model" name="model" value={form.model} onChange={h} placeholder="Avanza" required/>
          </div>
          <Input label="Plat Nomor" name="plate" value={form.plate} onChange={h} placeholder="B 1234 ABC" required/>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tahun" name="year" type="number" value={form.year} onChange={h} placeholder="2020" min="1990" max={new Date().getFullYear()+1} required/>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warna</label>
              <select name="color" value={form.color} onChange={h} className="input-field" required>
                <option value="">-- Pilih --</option>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <Button type="submit" fullWidth loading={sub}>Simpan Kendaraan</Button>
        </form>
      </Modal>
    </div>
  );
}
