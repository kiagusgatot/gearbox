import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Wrench, User, Car, UserCheck, AlertCircle, CreditCard, CheckCircle, MessageSquare, FileText, Search, ClipboardList, Send, Play } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import { userService } from '../../services/userService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ConfirmDialog, AlertDialog } from '../../components/common/ConfirmDialog';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import { PAYMENT_METHODS } from '../../utils/constants';

export function AdminBookingDetail() {
  const { id } = useParams(); const nav = useNavigate();
  const [b, setB] = useState(null);
  const [mechanics, setMechanics] = useState([]);
  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selMech, setSelMech] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [payForm, setPayForm] = useState({ amount:'', method:'cash', notes:'' });
  const [dialog, setDialog] = useState(null);
  const [alertDlg, setAlertDlg] = useState(null);

  const load = () => {
    Promise.all([bookingService.getById(id).catch(()=>null), userService.getAll().catch(()=>[]), bookingService.getEstimation(id).catch(()=>null)])
    .then(([bk,users,est]) => {
      if(!bk){nav('/admin/bookings');return;}
      setB(bk); setMechanics((Array.isArray(users)?users:users?.data||[]).filter(u=>u.role==='mechanic')); setEstimation(est);
      const cost=est?.summary?.total_cost||est?.inspection?.estimated_cost||bk?.service?.base_price;
      if(cost) setPayForm(f=>({...f,amount:cost}));
    }).finally(()=>setLoading(false));
  };
  useEffect(()=>{load();},[id]);

  const handleAssign = async () => {
    if(!selMech) return setAlertDlg({title:'Pilih Mekanik',message:'Pilih mekanik terlebih dahulu.',variant:'warning'});
    setAssigning(true);
    try { await bookingService.updateStatus(id,{mechanic_id:selMech,status:'confirmed'}); load(); }
    catch { setAlertDlg({title:'Gagal',message:'Gagal assign mekanik',variant:'danger'}); }
    finally { setAssigning(false); }
  };

  const handleSendEstimation = () => {
    setDialog({ title:'Kirim Estimasi?', message:'Estimasi akan dikirim ke customer untuk persetujuan.', variant:'info', confirmLabel:'Kirim',
      onConfirm: async () => {
        setUpdating(true);
        try { await bookingService.sendEstimation(id,{admin_notes:adminNotes}); load(); }
        catch(e) { setAlertDlg({title:'Gagal',message:e.response?.data?.message||'Gagal kirim estimasi',variant:'danger'}); }
        finally { setUpdating(false); }
      },
    });
  };

  const handleStartService = (skip) => {
    setDialog({ title: skip?'Langsung Mulai Service?':'Kirim Perintah Mulai Service?',
      message: skip?'Service akan dimulai tanpa mengirim estimasi ke customer.':'Perintah mulai service akan dikirim ke mekanik.',
      variant:'success', confirmLabel: skip?'Ya, Mulai':'Kirim Perintah',
      onConfirm: async () => {
        setUpdating(true);
        try { await bookingService.startService(id,{skip_estimation:skip,admin_notes:adminNotes}); load(); }
        catch(e) { setAlertDlg({title:'Gagal',message:e.response?.data?.message||'Gagal',variant:'danger'}); }
        finally { setUpdating(false); }
      },
    });
  };

  const handleCancel = () => {
    setDialog({ title:'Batalkan Booking?', message:'Booking yang dibatalkan tidak bisa dikembalikan.', variant:'danger', confirmLabel:'Ya, Batalkan',
      onConfirm: async () => {
        setUpdating(true);
        try { await bookingService.updateStatus(id,{status:'cancelled'}); load(); }
        catch { setAlertDlg({title:'Gagal',message:'Gagal batalkan',variant:'danger'}); }
        finally { setUpdating(false); }
      },
    });
  };

  const handleMarkAsPaid = () => {
    if(!payForm.amount) return setAlertDlg({title:'Nominal Kosong',message:'Masukkan nominal pembayaran.',variant:'warning'});
    setDialog({ title:'Konfirmasi Pembayaran?', message:`Pembayaran ${formatCurrency(payForm.amount)} akan dikonfirmasi LUNAS dan booking otomatis SELESAI.`,
      variant:'success', confirmLabel:'Ya, Konfirmasi',
      onConfirm: async () => {
        setPaying(true);
        try {
          const p=await paymentService.create({booking_id:id,amount:payForm.amount,method:payForm.method,payment_type:'full',status:'pending',notes:payForm.notes});
          await paymentService.markAsPaid(p.id||p.data?.id);
          load(); setAlertDlg({title:'Berhasil!',message:'Pembayaran dikonfirmasi. Booking selesai.',variant:'success'});
        } catch { setAlertDlg({title:'Gagal',message:'Gagal proses pembayaran',variant:'danger'}); }
        finally { setPaying(false); }
      },
    });
  };

  if(loading) return <Loading/>; if(!b) return null;

  const est=estimation; const hasEst=!!est?.inspection;
  const servicePrice=Number(b.service?.base_price)||0;
  const totalCost=est?.summary?.total_cost||est?.inspection?.estimated_cost||servicePrice;
  const totalDuration=est?.summary?.total_duration||est?.inspection?.estimated_duration||0;
  const additionalPrice=est?.summary?.additional_items_price||0;
  const items=est?.items||[];
  const info=[{i:Wrench,l:'Layanan',v:b.service?.name||'-'},{i:Car,l:'Kendaraan',v:`${b.vehicle?.brand||''} ${b.vehicle?.model||''} (${b.vehicle?.plate||'-'})`},{i:Calendar,l:'Tanggal',v:formatDate(b.scheduled_date)},{i:Clock,l:'Jam',v:formatTime(b.scheduled_time)},{i:User,l:'Customer',v:b.user?.name||'-'},{i:UserCheck,l:'Mekanik',v:b.mechanic?.name||'Belum ditentukan'}];

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={()=>nav(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors"><ArrowLeft size={20}/>Kembali</button>
        <div className="card"><div className="flex justify-between items-start mb-6"><div><h1 className="text-xl font-bold text-gray-900">Detail Booking (Admin)</h1><p className="text-sm text-gray-400 mt-1">ID: {b.id?.substring(0,8)}</p></div><StatusBadge status={b.status}/></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{info.map(x=><div key={x.l} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><x.i size={18} className="text-primary-600 flex-shrink-0"/><div><p className="text-xs text-gray-400">{x.l}</p><p className="text-sm font-semibold text-gray-900">{x.v}</p></div></div>)}</div></div>
        {b.notes && <div className="card border-yellow-200 bg-yellow-50"><div className="flex items-start gap-3"><MessageSquare size={20} className="text-yellow-600 mt-0.5 flex-shrink-0"/><div><p className="text-sm font-bold text-yellow-900 mb-1">Catatan Customer</p><p className="text-sm text-yellow-800">{b.notes}</p></div></div></div>}

        {b.status==='pending' && <div className="card"><h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><UserCheck size={20} className="text-primary-600"/>Assign Mekanik</h3><select value={selMech} onChange={e=>setSelMech(e.target.value)} className="input-field mb-4"><option value="">-- Pilih --</option>{mechanics.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select><div className="flex gap-3"><Button onClick={handleAssign} loading={assigning}>Konfirmasi & Assign</Button><Button variant="danger" onClick={handleCancel} loading={updating}>Tolak</Button></div></div>}
        {b.status==='confirmed' && <div className="card border-blue-200 bg-blue-50"><div className="flex items-start gap-3"><Clock size={20} className="text-blue-600 mt-0.5 flex-shrink-0"/><div><p className="font-bold text-blue-900 mb-1">Menunggu Konfirmasi Mekanik</p><p className="text-sm text-blue-800">Menunggu <strong>{b.mechanic?.name}</strong> menerima job.</p></div></div></div>}
        {b.status==='ready' && <div className="card border-indigo-200 bg-indigo-50"><div className="flex items-start gap-3"><Search size={20} className="text-indigo-600 mt-0.5 flex-shrink-0"/><div><p className="font-bold text-indigo-900 mb-1">Menunggu Inspeksi</p><p className="text-sm text-indigo-800">Mekanik sedang inspeksi kendaraan.</p></div></div></div>}

        {b.status==='inspection_done' && <>{hasEst && <EstimationCard est={est} items={items} servicePrice={servicePrice} totalCost={totalCost} totalDuration={totalDuration} additionalPrice={additionalPrice}/>}<div className="card"><h3 className="font-bold text-gray-900 mb-2">Aksi Admin</h3><p className="text-sm text-gray-500 mb-4">{additionalPrice>0?'Ada tambahan biaya. Kirim estimasi ke customer atau langsung mulai.':'Tidak ada tambahan. Bisa langsung mulai.'}</p><div><label className="block text-sm font-medium text-gray-700 mb-2">Catatan (opsional)</label><textarea value={adminNotes} onChange={e=>setAdminNotes(e.target.value)} className="input-field min-h-[60px] mb-4" placeholder="Jelaskan estimasi..."/></div><div className="space-y-3">{additionalPrice>0 && <Button fullWidth onClick={handleSendEstimation} loading={updating}><Send size={18}/>Kirim Estimasi ke Customer</Button>}<Button variant="outline" fullWidth onClick={()=>handleStartService(true)} loading={updating}><Play size={18}/>Langsung Mulai Service</Button><Button variant="danger" fullWidth onClick={handleCancel} loading={updating}>Batalkan</Button></div></div></>}
        {b.status==='estimation_sent' && <>{hasEst && <EstimationCard est={est} items={items} servicePrice={servicePrice} totalCost={totalCost} totalDuration={totalDuration} additionalPrice={additionalPrice}/>}<div className="card border-amber-200 bg-amber-50"><div className="flex items-start gap-3"><Send size={20} className="text-amber-600 mt-0.5 flex-shrink-0"/><div><p className="font-bold text-amber-900 mb-1">Estimasi Terkirim</p><p className="text-sm text-amber-800">Menunggu customer menyetujui <strong>{formatCurrency(totalCost)}</strong>.</p></div></div></div></>}
        {b.status==='customer_approved' && <>{hasEst && <EstimationCard est={est} items={items} servicePrice={servicePrice} totalCost={totalCost} totalDuration={totalDuration} additionalPrice={additionalPrice}/>}<div className="card border-lime-200 bg-lime-50"><div className="flex items-start gap-3 mb-4"><CheckCircle size={20} className="text-lime-600 mt-0.5 flex-shrink-0"/><div><p className="font-bold text-lime-900 mb-1">Customer Setuju</p><p className="text-sm text-lime-800">Kirim perintah mulai service ke mekanik.</p></div></div><Button fullWidth onClick={()=>handleStartService(false)} loading={updating}><Play size={18}/>Kirim Perintah Mulai Service</Button></div></>}
        {b.status==='service_started' && <div className="card border-violet-200 bg-violet-50"><div className="flex items-start gap-3"><Play size={20} className="text-violet-600 mt-0.5 flex-shrink-0"/><div><p className="font-bold text-violet-900 mb-1">Perintah Terkirim</p><p className="text-sm text-violet-800">Menunggu mekanik konfirmasi mulai.</p></div></div></div>}
        {b.status==='in_progress' && <div className="card border-purple-200 bg-purple-50"><div className="flex items-start gap-3"><Wrench size={20} className="text-purple-600 mt-0.5 flex-shrink-0"/><div><p className="font-bold text-purple-900 mb-1">Service Dikerjakan</p><p className="text-sm text-purple-800">Mekanik sedang mengerjakan. Menunggu checklist selesai.</p></div></div></div>}

        {b.status==='waiting_payment' && <div className="card space-y-6">
          <div className="flex items-center gap-3"><CreditCard size={24} className="text-orange-600"/><div><h3 className="font-bold text-gray-900">Pembayaran Kasir</h3><p className="text-sm text-gray-500">Konfirmasi pembayaran customer.</p></div></div>
          <div><p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><FileText size={16} className="text-primary-600"/>Detail</p><div className="bg-gray-50 rounded-xl p-4 space-y-2"><div className="flex justify-between text-sm"><span className="text-gray-600">Layanan</span><span className="font-medium">{b.service?.name}</span></div>{est?.inspection?.findings && <div className="text-sm"><span className="text-gray-600">Temuan:</span><p className="mt-1 p-2 bg-white rounded-lg text-gray-800">{est.inspection.findings}</p></div>}{items.length>0&&items.map(item=><div key={item.id} className="flex justify-between text-sm"><span className="text-gray-600">{item.name} ({item.qty}x)</span><span className="font-medium">{formatCurrency(item.total_price)}</span></div>)}<div className="flex justify-between pt-2 border-t border-gray-200"><span className="font-bold text-gray-900">Total</span><span className="text-xl font-bold text-primary-600">{formatCurrency(totalCost)}</span></div></div></div>
          <div><p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><CreditCard size={16} className="text-orange-600"/>Konfirmasi Pembayaran</p><div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-4"><Input label="Nominal (Rp)" type="number" value={payForm.amount} onChange={e=>setPayForm({...payForm,amount:e.target.value})} required/><div><label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{PAYMENT_METHODS.map(m=><button key={m.value} type="button" onClick={()=>setPayForm({...payForm,method:m.value})} className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-center ${payForm.method===m.value?'border-primary-600 bg-primary-50 text-primary-700':'border-gray-200 bg-white text-gray-700 hover:border-primary-300'}`}>{m.label}</button>)}</div></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Catatan (opsional)</label><textarea value={payForm.notes} onChange={e=>setPayForm({...payForm,notes:e.target.value})} className="input-field min-h-[60px]" placeholder="Nomor resi, dll"/></div><Button variant="success" fullWidth onClick={handleMarkAsPaid} loading={paying}>Konfirmasi Pembayaran Diterima</Button></div></div>
        </div>}

        {b.status==='completed' && <div className="card border-green-200 bg-green-50 flex items-center gap-3"><CheckCircle size={24} className="text-green-600"/><div><p className="font-bold text-green-900">Selesai & Lunas</p></div></div>}
        {b.status==='cancelled' && <div className="card border-red-200 bg-red-50 flex items-center gap-3"><AlertCircle size={24} className="text-red-600"/><div><p className="font-bold text-red-900">Dibatalkan</p></div></div>}
      </div>

      <ConfirmDialog config={dialog} onClose={()=>setDialog(null)}/>
      <AlertDialog config={alertDlg} onClose={()=>setAlertDlg(null)}/>
    </div>
  );
}

function EstimationCard({est,items,servicePrice,totalCost,totalDuration,additionalPrice}) {
  return <div className="card"><h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ClipboardList size={20} className="text-primary-600"/>Hasil Inspeksi & Estimasi</h3>{est?.inspection?.findings && <div className="mb-4"><p className="text-xs font-medium text-gray-500 mb-1">Temuan</p><div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-800">{est.inspection.findings}</div></div>}{est?.inspection?.mechanic_notes && <div className="mb-4"><p className="text-xs font-medium text-gray-500 mb-1">Catatan Mekanik</p><div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-800">{est.inspection.mechanic_notes}</div></div>}{items.length>0 && <div className="mb-4"><p className="text-xs font-medium text-gray-500 mb-2">Tambahan</p><div className="space-y-2">{items.map(item=><div key={item.id} className="flex justify-between items-center p-2.5 bg-orange-50 border border-orange-200 rounded-xl"><div><p className="text-sm font-medium text-gray-900">{item.name}</p><p className="text-xs text-gray-500">{item.qty}x @ {formatCurrency(item.unit_price)}{item.duration_minutes>0?` · ${item.duration_minutes} mnt`:''}</p></div><p className="text-sm font-bold text-orange-700">{formatCurrency(item.total_price)}</p></div>)}</div></div>}<div className="bg-gray-900 text-white rounded-xl p-4 space-y-2"><div className="flex justify-between text-sm"><span className="text-gray-400">Layanan</span><span>{formatCurrency(servicePrice)}</span></div>{additionalPrice>0 && <div className="flex justify-between text-sm"><span className="text-gray-400">Tambahan ({items.length})</span><span className="text-orange-400">+{formatCurrency(additionalPrice)}</span></div>}<div className="flex justify-between font-bold pt-2 border-t border-gray-700"><span>Total</span><span className="text-green-400 text-lg">{formatCurrency(totalCost)}</span></div>{totalDuration>0 && <div className="flex justify-between text-sm pt-2 border-t border-gray-700"><span className="text-gray-400">Durasi</span><span className="text-blue-400">{totalDuration} mnt</span></div>}</div></div>;
}
