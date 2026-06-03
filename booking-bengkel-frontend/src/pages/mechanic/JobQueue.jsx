import { useState,useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { BookingCard } from '../../components/booking/BookingCard';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
export function JobQueue(){
  const [list,setList]=useState([]);const [loading,setLoading]=useState(true);const [filter,setFilter]=useState('all');
  useEffect(()=>{bookingService.getAll().then(setList).catch(()=>{}).finally(()=>setLoading(false));},[]);
  const tabs=['all','confirmed','ready','in_progress','completed'];
  const labels={all:'Semua',confirmed:'Baru',ready:'Siap',in_progress:'Dikerjakan',completed:'Selesai'};
  const filtered=filter==='all'?list:list.filter(b=>b.status===filter);
  return <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4"><div className="max-w-6xl mx-auto">
    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Antrian Job</h1><p className="text-gray-600 mb-8">Daftar pekerjaan yang perlu dikerjakan</p>
    <div className="flex gap-2 overflow-x-auto pb-4 mb-6">{tabs.map(f=><button key={f} onClick={()=>setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${filter===f?'bg-primary-600 text-white':'bg-white text-gray-600 border border-gray-200'}`}>{labels[f]}</button>)}</div>
    {loading?<Loading/>:filtered.length===0?<EmptyState icon={ClipboardList} title="Tidak ada job"/>:<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map(b=><BookingCard key={b.id} booking={b} basePath="/mechanic/jobs"/>)}</div>}
  </div></div>;
}
