import { useState,useEffect } from 'react';
import { CreditCard,Calendar } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { formatCurrency,formatDate } from '../../utils/formatters';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
export function Payments(){
  const [list,setList]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{paymentService.getAll().then(setList).catch(()=>{}).finally(()=>setLoading(false));},[]);
  return <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4"><div className="max-w-4xl mx-auto">
    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Riwayat Pembayaran</h1><p className="text-gray-600 mb-8">Semua transaksi pembayaran Anda</p>
    {loading?<Loading/>:list.length===0?<EmptyState icon={CreditCard} title="Belum ada pembayaran"/>:<div className="space-y-4">{list.map(p=><div key={p.id} className="card"><div className="flex justify-between items-start"><div><p className="font-semibold text-gray-900">#{p.id?.substring(0,8)}</p><div className="flex items-center gap-2 text-sm text-gray-500 mt-2"><Calendar size={14}/>{formatDate(p.created_at)}</div><p className="text-sm text-gray-500 mt-1">Metode: {p.method||'-'}</p></div><div className="text-right"><p className="text-xl font-bold text-primary-600">{formatCurrency(p.amount)}</p><span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-2 ${p.status==='paid'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>{p.status==='paid'?'Lunas':'Pending'}</span></div></div></div>)}</div>}
  </div></div>;
}
