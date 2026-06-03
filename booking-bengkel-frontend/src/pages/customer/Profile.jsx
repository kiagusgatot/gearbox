import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Phone, Car, Plus } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { vehicleService } from '../../services/vehicleService';

export function Profile() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]); const [showModal, setShowModal] = useState(false); const [sub, setSub] = useState(false);
  const [form, setForm] = useState({ brand:'', model:'', plate:'', year:'', color:'' });
  const h = e => setForm({...form, [e.target.name]: e.target.value});
  useEffect(() => { vehicleService.getAll().then(setVehicles).catch(()=>{}); }, []);

  const handleAdd = async (e) => {
    e.preventDefault(); setSub(true);
    try { const v = await vehicleService.create({...form, user_id: user?.id}); setVehicles([...vehicles, v]); setShowModal(false); setForm({brand:'',model:'',plate:'',year:'',color:''}); }
    catch(e) { alert(e.response?.data?.message || 'Gagal menambah kendaraan'); }
    finally { setSub(false); }
  };

  return <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="section-title">Profil Saya</h1>

      {/* User info */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center"><User size={32} className="text-primary-600"/></div>
          <div><h2 className="text-xl font-bold text-gray-900">{user?.name}</h2><p className="text-sm text-gray-500 capitalize">{user?.role}</p></div>
        </div>
        <div className="space-y-3">
          {[{i:Mail,l:'Email',v:user?.email},{i:Phone,l:'Telepon',v:user?.phone||'-'}].map(x =>
            <div key={x.l} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <x.i size={18} className="text-primary-600"/><div><p className="text-xs text-gray-400">{x.l}</p><p className="text-sm font-semibold">{x.v}</p></div>
            </div>)}
        </div>
      </div>

      {/* Vehicles */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div><h3 className="text-lg font-bold text-gray-900">Kendaraan Saya</h3><p className="text-sm text-gray-500">{vehicles.length} kendaraan terdaftar</p></div>
          <Button size="sm" onClick={() => setShowModal(true)}><Plus size={18}/>Tambah</Button>
        </div>
        {vehicles.length === 0
          ? <div className="text-center py-8"><Car size={40} className="text-gray-300 mx-auto mb-3"/><p className="text-gray-500 text-sm">Belum ada kendaraan</p></div>
          : <div className="space-y-3">{vehicles.map(v => <div key={v.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><Car size={20} className="text-gray-600"/></div>
              <div><p className="font-semibold text-gray-900">{v.brand} {v.model}</p><p className="text-sm text-gray-500">{v.plate} · {v.year} · {v.color}</p></div>
            </div>)}</div>}
      </div>
    </div>

    <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tambah Kendaraan">
      <form onSubmit={handleAdd} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Merk" name="brand" value={form.brand} onChange={h} placeholder="Toyota" required/>
          <Input label="Model" name="model" value={form.model} onChange={h} placeholder="Avanza" required/>
        </div>
        <Input label="Plat Nomor" name="plate" value={form.plate} onChange={h} placeholder="B 1234 ABC" required/>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Tahun" name="year" type="number" value={form.year} onChange={h} placeholder="2020" required/>
          <Input label="Warna" name="color" value={form.color} onChange={h} placeholder="Putih" required/>
        </div>
        <Button type="submit" fullWidth loading={sub}>Simpan Kendaraan</Button>
      </form>
    </Modal>
  </div>;
}
