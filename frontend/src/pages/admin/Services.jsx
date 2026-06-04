import { useState, useEffect } from 'react';
import { Plus, Trash2, Wrench, Search, Star, Pencil, Image } from 'lucide-react';
import { serviceService } from '../../services/serviceService';
import { formatCurrency } from '../../utils/formatters';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog, AlertDialog } from '../../components/common/ConfirmDialog';

const CAT_STYLE = {
  routine:     { label:'Routine',     color:'bg-blue-100 text-blue-700' },
  maintenance: { label:'Maintenance', color:'bg-orange-100 text-orange-700' },
  repair:      { label:'Repair',      color:'bg-red-100 text-red-700' },
  parts:       { label:'Parts',       color:'bg-teal-100 text-teal-700' },
  other:       { label:'Lainnya',     color:'bg-gray-100 text-gray-700' },
};

const EMPTY_FORM = { name:'', description:'', labor_price:'', parts_price:'', estimated_duration:'', category:'routine', max_booking_per_day:'8', terms_conditions:'', image_url:'' };

export function AdminServices() {
  const [list, setList] = useState([]); const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false); const [editSvc, setEditSvc] = useState(null);
  const [sub, setSub] = useState(false); const [q, setQ] = useState('');
  const [f, setF] = useState({...EMPTY_FORM});
  const [uploading, setUploading] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [alertDlg, setAlertDlg] = useState(null);

  const load = () => serviceService.getAll().then(data => {
    const arr = Array.isArray(data) ? data : (data?.data || []);
    arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    setList(arr);
  }).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditSvc(null); setF({...EMPTY_FORM}); setModal(true); };
  const openEdit = (svc) => {
    setEditSvc(svc);
    setF({ name:svc.name||'', description:svc.description||'', labor_price:svc.labor_price||'', parts_price:svc.parts_price||'',
      estimated_duration:svc.estimated_duration||'', category:svc.category||'routine', max_booking_per_day:svc.max_booking_per_day||'8',
      terms_conditions:svc.terms_conditions||'', image_url:svc.image_url||'' });
    setModal(true);
  };

  // Real image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setAlertDlg({ title:'File Terlalu Besar', message:'Maksimal 2MB.', variant:'warning' }); return; }
    setUploading(true);
    try {
      const result = await serviceService.uploadImage(file);
      setF(prev => ({ ...prev, image_url: result.url || result.path || '' }));
    } catch (err) {
      setAlertDlg({ title:'Gagal Upload', message: err.response?.data?.message || 'Gagal mengupload gambar', variant:'danger' });
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSub(true);
    const payload = { ...f, base_price: Number(f.labor_price) + Number(f.parts_price) };
    try {
      if (editSvc) await serviceService.update(editSvc.id, payload);
      else await serviceService.create(payload);
      setModal(false); load();
    } catch (e) { setAlertDlg({ title:'Gagal', message:e.response?.data?.message || 'Gagal menyimpan', variant:'danger' }); }
    finally { setSub(false); }
  };

  const handleDelete = (svc) => {
    setDialog({ title:'Hapus Layanan?', message:`"${svc.name}" akan dihapus permanen.`, variant:'danger', confirmLabel:'Ya, Hapus',
      onConfirm: async () => { try { await serviceService.delete(svc.id); load(); } catch { setAlertDlg({title:'Gagal',message:'Gagal hapus',variant:'danger'}); } }
    });
  };

  const filtered = list.filter(s => !q || s.name?.toLowerCase().includes(q.toLowerCase()));
  const h = e => setF({...f, [e.target.name]: e.target.value});

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 lg:px-8">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div><h1 className="section-title">Kelola Layanan</h1><p className="text-gray-500">Tambah dan kelola paket service</p></div>
          <Button onClick={openAdd}><Plus size={18}/>Tambah</Button>
        </div>

        <Input icon={Search} placeholder="Cari layanan..." value={q} onChange={e => setQ(e.target.value)} className="max-w-xs mb-6"/>

        {loading ? <Loading/> : filtered.length === 0 ? <EmptyState icon={Wrench} title="Belum ada layanan"/> : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Layanan</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Kategori</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Labor</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Parts</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Durasi</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Rating</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Slot</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(s => { const cat=CAT_STYLE[s.category]||CAT_STYLE.other; const r=Number(s.rating)||0; const total=Number(s.base_price)||(Number(s.labor_price)+Number(s.parts_price)); return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {s.image_url
                            ? <img src={s.image_url} alt={s.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0"/>
                            : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"><Wrench size={16} className="text-gray-400"/></div>
                          }
                          <div><p className="font-medium text-gray-900">{s.name}</p><p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{s.description||'-'}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cat.color}`}>{cat.label}</span></td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(s.labor_price)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(s.parts_price)}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(total)}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{s.estimated_duration} mnt</td>
                      <td className="px-4 py-3 text-center">{r>0?<span className="flex items-center justify-center gap-1 text-yellow-600"><Star size={14} className="fill-yellow-400"/>{r.toFixed(1)}</span>:<span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{s.max_booking_per_day||8}</td>
                      <td className="px-4 py-3"><div className="flex items-center justify-center gap-1"><button onClick={()=>openEdit(s)} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors" title="Edit"><Pencil size={16}/></button><button onClick={()=>handleDelete(s)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors" title="Hapus"><Trash2 size={16}/></button></div></td>
                    </tr>
                  ); })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">{filtered.length} layanan</div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editSvc ? 'Edit Layanan' : 'Tambah Layanan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Layanan" name="name" value={f.name} onChange={h} placeholder="Ganti Oli" required/>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label><textarea name="description" value={f.description} onChange={h} className="input-field min-h-[80px]" placeholder="Jelaskan detail layanan..."/></div>

          {/* Real Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5"><Image size={16}/>Gambar Layanan</label>
            {f.image_url && (
              <div className="relative w-full h-32 rounded-xl bg-gray-100 overflow-hidden mb-2">
                <img src={f.image_url} alt="Preview" className="w-full h-full object-cover"/>
                <button type="button" onClick={() => setF({...f, image_url:''})}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">✕</button>
              </div>
            )}
            {!uploading ? (
              <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <Image size={18} className="text-gray-400"/>
                <span className="text-sm text-gray-600">{f.image_url ? 'Ganti Gambar' : 'Upload Gambar'}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload}/>
              </label>
            ) : (
              <div className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-primary-500 rounded-xl bg-primary-50">
                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"/>
                <span className="text-sm text-gray-900 font-semibold">Mengupload...</span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, WebP. Maksimal 2MB.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Biaya Tenaga Kerja (Rp)" name="labor_price" type="number" value={f.labor_price} onChange={h} placeholder="50000" required/>
            <Input label="Biaya Suku Cadang (Rp)" name="parts_price" type="number" value={f.parts_price} onChange={h} placeholder="100000" required/>
          </div>
          {f.labor_price && f.parts_price && <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl flex justify-between items-center"><span className="text-sm text-gray-700">Total Harga</span><span className="font-extrabold text-gray-900">{formatCurrency(Number(f.labor_price)+Number(f.parts_price))}</span></div>}

          <div className="grid grid-cols-3 gap-4">
            <Input label="Durasi (menit)" name="estimated_duration" type="number" value={f.estimated_duration} onChange={h} placeholder="60"/>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label><select name="category" value={f.category} onChange={h} className="input-field"><option value="routine">Routine</option><option value="maintenance">Maintenance</option><option value="repair">Repair</option><option value="parts">Parts</option><option value="other">Lainnya</option></select></div>
            <Input label="Max Slot/Hari" name="max_booking_per_day" type="number" value={f.max_booking_per_day} onChange={h} placeholder="8"/>
          </div>

          <div><label className="block text-sm font-medium text-gray-700 mb-2">Syarat & Ketentuan</label><textarea name="terms_conditions" value={f.terms_conditions} onChange={h} className="input-field min-h-[60px]" placeholder="Opsional..."/></div>
          <Button type="submit" fullWidth loading={sub}>{editSvc ? 'Simpan Perubahan' : 'Tambah Layanan'}</Button>
        </form>
      </Modal>

      <ConfirmDialog config={dialog} onClose={() => setDialog(null)}/>
      <AlertDialog config={alertDlg} onClose={() => setAlertDlg(null)}/>
    </div>
  );
}
