import { useState,useEffect } from 'react';
import { Users,Shield,Wrench,User } from 'lucide-react';
import { userService } from '../../services/userService';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
const roleIcon={admin:Shield,mechanic:Wrench,customer:User};
const roleColor={admin:'bg-red-100 text-red-700',mechanic:'bg-orange-100 text-orange-700',customer:'bg-blue-100 text-blue-700'};
export function UsersManage(){
  const [list,setList]=useState([]);const [loading,setLoading]=useState(true);const [filter,setFilter]=useState('all');
  useEffect(()=>{userService.getAll().then(setList).catch(()=>{}).finally(()=>setLoading(false));},[]);
  const filtered=filter==='all'?list:list.filter(u=>u.role===filter);
  return <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4"><div className="max-w-6xl mx-auto">
    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Kelola User</h1><p className="text-gray-600 mb-8">Lihat dan kelola semua pengguna</p>
    <div className="flex gap-2 mb-6">{['all','customer','mechanic','admin'].map(f=><button key={f} onClick={()=>setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium ${filter===f?'bg-primary-600 text-white':'bg-white text-gray-600 border border-gray-200'}`}>{f==='all'?'Semua':f.charAt(0).toUpperCase()+f.slice(1)}</button>)}</div>
    {loading?<Loading/>:filtered.length===0?<EmptyState icon={Users} title="Tidak ada user"/>:
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map(u=>{const RI=roleIcon[u.role]||User;return <div key={u.id} className="card"><div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><RI size={24} className="text-gray-600"/></div><div><h3 className="font-bold text-gray-900">{u.name}</h3><p className="text-sm text-gray-500">{u.email}</p></div></div><div className="flex justify-between items-center"><span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${roleColor[u.role]||'bg-gray-100 text-gray-700'}`}>{u.role}</span><span className="text-xs text-gray-400">{u.phone||'-'}</span></div></div>})}</div>}
  </div></div>;
}
