import { useState,useEffect } from 'react';
import { Plus,Edit2,Trash2,Wrench } from 'lucide-react';
import { serviceService } from '../../services/serviceService';
import { formatCurrency } from '../../utils/formatters';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
export function ServicesManage(){
  const [list,setList]=useState([]);const [loading,setLoading]=useState(true);const [modal,setModal]=useState(false);const [sub,setSub]=useState(false);
  const [form,setForm]=useState({name:'',description:'',base_price:'',estimated_duration:'',category:''});
  useEffect(()=>{load();},[]);
  const load=()=>serviceService.getAll().then(setList).catch(()=>{}).finally(()=>setLoading(false));
  const h=e=>setForm({...form,[e.target.name]:e.target.value});
  const handleSubmit=async(e)=>{e.preventDefault();try{setSub(true);await serviceService.create(form);setModal(false);setForm({name:'',description:'',base_price:'',estimated_duration:'',category:''});load();}catch(e){alert(e.response?.data?.message||'Gagal');}finally{setSub(false);}};
  const handleDelete=async(id)=>{if(!confirm('Hapus service ini?'))return;try{await serviceService.delete(id);load();}catch{alert('Gagal hapus');}};
  return <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4"><div className="max-w-6xl mx-auto">
    <div className="flex justify-between items-start mb-8"><div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Kelola Service</h1><p className="text-gray-600">Tambah, edit, dan hapus layanan</p></div><Button onClick={()=>setModal(true)}><Plus size={18}/>Tambah Service</Button></div>
    {loading?<Loading/>:list.length===0?<EmptyState icon={Wrench} title="Belum ada service"/>:
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{list.map(s=><div key={s.id} className="card"><h3 className="font-bold text-gray-900 mb-2">{s.name}</h3><p className="text-sm text-gray-600 mb-4 line-clamp-2">{s.description||'-'}</p><div className="flex justify-between items-center"><p className="text-lg font-bold text-primary-600">{formatCurrency(s.base_price)}</p><div className="flex gap-2"><button onClick={()=>handleDelete(s.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button></div></div></div>)}</div>}
    <Modal isOpen={modal} onClose={()=>setModal(false)} title="Tambah Service"><form onSubmit={handleSubmit} className="space-y-4"><Input label="Nama" name="name" value={form.name} onChange={h} required/><div><label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label><textarea name="description" value={form.description} onChange={h} className="input-field min-h-[80px]"/></div><Input label="Harga (Rp)" name="base_price" type="number" value={form.base_price} onChange={h} required/><Input label="Estimasi Durasi (menit)" name="estimated_duration" type="number" value={form.estimated_duration} onChange={h}/><Input label="Kategori" name="category" value={form.category} onChange={h} placeholder="routine / repair / etc"/><Button type="submit" fullWidth loading={sub}>Simpan</Button></form></Modal>
  </div></div>;
}
