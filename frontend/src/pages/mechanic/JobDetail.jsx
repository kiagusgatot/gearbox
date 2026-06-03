import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Wrench, User, Car, AlertCircle, CheckCircle, Search, Flag, MessageSquare, CreditCard, Plus, Trash2, Play, CheckSquare, Square, Camera, ChevronDown, ChevronUp } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { inspectionService } from '../../services/inspectionService';
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog, AlertDialog } from '../../components/common/ConfirmDialog';
import { PhotoCapture } from '../../components/common/PhotoCapture';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';

export function MechanicJobDetail() {
  const { id } = useParams(); const nav = useNavigate(); const { user } = useAuth();
  const [b, setB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInspect, setShowInspect] = useState(false);
  const [sub, setSub] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [inspForm, setInspForm] = useState({ findings:'', estimated_cost:'', estimated_duration:'', mechanic_notes:'' });
  const [additionalItems, setAdditionalItems] = useState([]);
  const [newItem, setNewItem] = useState({ name:'', qty:1, unit_price:'', duration:'' });
  const [checklist, setChecklist] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [alertDlg, setAlertDlg] = useState(null);

  // Photo documentation per checklist item (keyed by item id)
  const [itemPhotos, setItemPhotos] = useState({});
  // Expanded checklist item (to show photo section)
  const [expandedItem, setExpandedItem] = useState(null);

  const load = () => { bookingService.getById(id).then(setB).catch(()=>nav('/mechanic/jobs')).finally(()=>setLoading(false)); };
  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (b?.service) {
      setInspForm(f => ({ ...f, estimated_cost: f.estimated_cost || String(b.service.base_price||''), estimated_duration: f.estimated_duration || String(b.service.estimated_duration||60) }));
    }
    if (b?.status === 'in_progress') { bookingService.getChecklist(id).then(setChecklist).catch(()=>{}); }
  }, [b]);

  const updateStatus = async (status) => { setUpdating(true); try { await bookingService.updateStatus(id,{status}); load(); } catch { setAlertDlg({title:'Gagal',message:'Gagal update status',variant:'danger'}); } finally { setUpdating(false); } };

  // Additional items
  const handleAddItem = () => {
    if (!newItem.name || !newItem.unit_price || Number(newItem.unit_price) <= 0) return;
    setAdditionalItems([...additionalItems, { id:Date.now(), name:newItem.name, qty:Number(newItem.qty)||1, unit_price:Number(newItem.unit_price), total_price:(Number(newItem.qty)||1)*Number(newItem.unit_price), duration_minutes:Number(newItem.duration)||0 }]);
    setNewItem({ name:'', qty:1, unit_price:'', duration:'' });
  };
  const handleRemoveItem = (itemId) => setAdditionalItems(additionalItems.filter(i=>i.id!==itemId));

  // Calculations
  const additionalCostTotal = additionalItems.reduce((s,i)=>s+i.total_price,0);
  const additionalDurationTotal = additionalItems.reduce((s,i)=>s+i.duration_minutes,0);
  const serviceBasePrice = Number(b?.service?.base_price)||0;
  const estimatedCost = Number(inspForm.estimated_cost)||serviceBasePrice;
  const estimatedDuration = Number(inspForm.estimated_duration)||0;
  const grandTotalCost = estimatedCost + additionalCostTotal;
  const grandTotalDuration = estimatedDuration + additionalDurationTotal;

  const handleInspection = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      await inspectionService.create({ booking_id:id, mechanic_id:user?.id, findings:inspForm.findings, estimated_cost:grandTotalCost, estimated_duration:grandTotalDuration, mechanic_notes:inspForm.mechanic_notes, items:additionalItems.map(i=>({name:i.name,qty:i.qty,unit_price:i.unit_price,duration_minutes:i.duration_minutes,notes:''})) });
      setShowInspect(false); load();
    } catch (err) {
      const msg = err.response?.data?.message || (err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : 'Gagal simpan inspeksi');
      setAlertDlg({title:'Gagal Simpan Inspeksi',message:msg,variant:'danger'});
    } finally { setSub(false); }
  };

  const handleConfirmStart = () => {
    setDialog({ title:'Mulai Service?', message:'Anda akan memulai pengerjaan service. Checklist akan di-generate otomatis.', variant:'success', confirmLabel:'Ya, Mulai',
      onConfirm: async () => { setUpdating(true); try { await bookingService.confirmStart(id); load(); } catch(e) { setAlertDlg({title:'Gagal',message:e.response?.data?.message||'Gagal konfirmasi',variant:'danger'}); } finally { setUpdating(false); } }
    });
  };

  const handleToggleChecklist = async (itemId, currentValue) => {
    setTogglingId(itemId);
    try { await bookingService.toggleChecklist(id,itemId,{is_completed:!currentValue}); const updated = await bookingService.getChecklist(id); setChecklist(updated); }
    catch { setAlertDlg({title:'Gagal',message:'Gagal update checklist',variant:'danger'}); }
    finally { setTogglingId(null); }
  };

  const handleCompleteService = () => {
    setDialog({ title:'Tandai Service Selesai?', message:'Pastikan semua pekerjaan sudah selesai dan terdokumentasi. Status akan berubah ke "Menunggu Pembayaran".', variant:'success', confirmLabel:'Ya, Selesai',
      onConfirm: async () => { setUpdating(true); try { await bookingService.completeService(id); load(); } catch(e) { const msg=e.response?.data?.error||e.response?.data?.message||'Gagal tandai selesai'; setAlertDlg({title:'Belum Bisa Selesai',message:msg,variant:'warning'}); } finally { setUpdating(false); } }
    });
  };

  // Photo handlers
  const updatePhotosForItem = (itemId, photos) => {
    setItemPhotos(prev => ({ ...prev, [itemId]: photos }));
  };

  if (loading) return <Loading/>; if (!b) return null;

  const info = [{i:Wrench,l:'Layanan',v:b.service?.name||'-'},{i:Car,l:'Kendaraan',v:`${b.vehicle?.brand||''} ${b.vehicle?.model||''} (${b.vehicle?.plate||'-'})`},{i:Calendar,l:'Tanggal',v:formatDate(b.scheduled_date)},{i:Clock,l:'Jam',v:formatTime(b.scheduled_time)},{i:User,l:'Customer',v:b.user?.name||'-'}];

  const checklistData = checklist?.data || checklist || [];
  const checklistItems = Array.isArray(checklistData) ? checklistData : [];
  const totalItems = checklist?.total_items || checklistItems.length;
  const completedItems = checklist?.completed_items || checklistItems.filter(c=>c.is_completed).length;
  const allCompleted = checklist?.all_completed || (totalItems > 0 && completedItems === totalItems);
  const totalPhotos = Object.values(itemPhotos).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={()=>nav(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors"><ArrowLeft size={20}/>Kembali</button>
        <div className="card"><div className="flex justify-between items-start mb-6"><div><h1 className="text-xl font-bold text-gray-900">Detail Job</h1><p className="text-sm text-gray-400 mt-1">ID: {b.id?.substring(0,8)}</p></div><StatusBadge status={b.status}/></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{info.map(x=><div key={x.l} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><x.i size={18} className="text-primary-600 flex-shrink-0"/><div><p className="text-xs text-gray-400">{x.l}</p><p className="text-sm font-semibold text-gray-900">{x.v}</p></div></div>)}</div></div>

        {b.notes && <div className="card border-yellow-200 bg-yellow-50"><div className="flex items-start gap-3"><MessageSquare size={20} className="text-yellow-600 mt-0.5 flex-shrink-0"/><div><p className="text-sm font-bold text-yellow-900 mb-1">Keluhan Customer</p><p className="text-sm text-yellow-800">{b.notes}</p></div></div></div>}

        {b.status==='confirmed' && <div className="card"><p className="text-sm text-blue-800 mb-4 font-medium">Job baru di-assign. Konfirmasi?</p><div className="flex gap-3"><Button onClick={()=>updateStatus('ready')} loading={updating}><CheckCircle size={18}/>Terima Job</Button><Button variant="danger" onClick={()=>updateStatus('cancelled')} loading={updating}>Tolak</Button></div></div>}
        {b.status==='ready' && <div className="card"><p className="text-sm text-indigo-800 mb-2 font-medium">Lakukan inspeksi kendaraan.</p><Button onClick={()=>setShowInspect(true)}><Search size={18}/>Mulai Inspeksi</Button></div>}
        {b.status==='inspection_done' && <div className="card border-cyan-200 bg-cyan-50"><div className="flex items-start gap-3"><CheckCircle size={20} className="text-cyan-600 mt-0.5 flex-shrink-0"/><div><p className="font-bold text-cyan-900 mb-1">Inspeksi Selesai</p><p className="text-sm text-cyan-800">Menunggu admin review & kirim estimasi.</p></div></div></div>}
        {b.status==='estimation_sent' && <div className="card border-amber-200 bg-amber-50"><div className="flex items-start gap-3"><Clock size={20} className="text-amber-600 mt-0.5 flex-shrink-0"/><div><p className="font-bold text-amber-900 mb-1">Estimasi Dikirim</p><p className="text-sm text-amber-800">Menunggu customer approve.</p></div></div></div>}
        {b.status==='customer_approved' && <div className="card border-lime-200 bg-lime-50"><div className="flex items-start gap-3"><CheckCircle size={20} className="text-lime-600 mt-0.5 flex-shrink-0"/><div><p className="font-bold text-lime-900 mb-1">Customer Setuju</p><p className="text-sm text-lime-800">Menunggu admin kirim perintah mulai.</p></div></div></div>}
        {b.status==='service_started' && <div className="card"><p className="text-sm text-violet-800 mb-2 font-medium">Admin mengirimkan perintah mulai service. Konfirmasi untuk memulai.</p><Button onClick={handleConfirmStart} loading={updating}><Play size={18}/>Konfirmasi Mulai Service</Button></div>}

        {/* ===== IN_PROGRESS: Checklist + Photo Documentation ===== */}
        {b.status==='in_progress' && <div className="card">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><CheckSquare size={20} className="text-purple-600"/>Checklist Service</h3>
          <p className="text-sm text-gray-500 mb-1">Selesaikan semua item sebelum menandai selesai. ({completedItems}/{totalItems})</p>
          {totalPhotos > 0 && <p className="text-xs text-gray-400 mb-3">📸 {totalPhotos} foto dokumentasi</p>}

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-purple-600 h-2.5 rounded-full transition-all" style={{width:totalItems>0?`${(completedItems/totalItems)*100}%`:'0%'}}/>
          </div>

          {/* Checklist items with photo support */}
          <div className="space-y-2 mb-6">
            {checklistItems.map(item => {
              const photos = itemPhotos[item.id] || [];
              const isExpanded = expandedItem === item.id;

              return (
                <div key={item.id} className={`rounded-xl border-2 transition-all overflow-hidden ${item.is_completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
                  {/* Main row */}
                  <div className="flex items-center gap-3 p-3">
                    {/* Toggle checkbox */}
                    <button onClick={()=>handleToggleChecklist(item.id,item.is_completed)} disabled={togglingId===item.id}
                      className={`flex-shrink-0 ${togglingId===item.id ? 'opacity-50' : ''}`}>
                      {item.is_completed
                        ? <CheckSquare size={22} className="text-green-600"/>
                        : <Square size={22} className="text-gray-400"/>}
                    </button>

                    {/* Item name */}
                    <span className={`flex-1 text-sm font-medium ${item.is_completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                      {item.item_name}
                    </span>

                    {/* Photo count badge */}
                    {photos.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <Camera size={12}/>{photos.length}
                      </span>
                    )}

                    {/* Expand/collapse for photo */}
                    <button onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors">
                      {isExpanded ? <ChevronUp size={16}/> : <Camera size={16}/>}
                    </button>
                  </div>

                  {/* Expanded: Photo documentation section */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-gray-100">
                      <PhotoCapture
                        photos={photos}
                        onPhotosChange={(newPhotos) => updatePhotosForItem(item.id, newPhotos)}
                        maxPhotos={3}
                        label={`Foto dokumentasi — ${item.item_name}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Photo summary */}
          {totalPhotos > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
              <p className="text-sm text-blue-800 flex items-center gap-2"><Camera size={16}/>Total {totalPhotos} foto dokumentasi dari {Object.keys(itemPhotos).filter(k => itemPhotos[k].length > 0).length} item</p>
            </div>
          )}

          {/* Complete service button */}
          <Button variant="success" fullWidth onClick={handleCompleteService} loading={updating} disabled={!allCompleted}>
            <Flag size={18}/>{allCompleted ? 'Tandai Service Selesai' : `Selesaikan ${totalItems-completedItems} item lagi`}
          </Button>
          {!allCompleted && <p className="text-xs text-gray-500 text-center mt-2">Semua checklist harus selesai.</p>}
        </div>}

        {b.status==='waiting_payment' && <div className="card bg-orange-50 border border-orange-200"><div className="flex items-start gap-3"><CreditCard size={20} className="text-orange-600 mt-0.5 flex-shrink-0"/><div><p className="text-sm font-bold text-orange-900 mb-1">Menunggu Pembayaran</p><p className="text-sm text-orange-800">Kendaraan siap diserahkan setelah customer bayar.</p></div></div></div>}
        {b.status==='completed' && <div className="card bg-green-50 border border-green-200 flex items-center gap-3"><CheckCircle size={24} className="text-green-600"/><div><p className="font-bold text-green-900">Job Selesai & Lunas</p></div></div>}
      </div>

      {/* Inspection Modal */}
      <Modal isOpen={showInspect} onClose={()=>setShowInspect(false)} title="Inspeksi Kendaraan">
        <form onSubmit={handleInspection} className="space-y-5">
          {b.notes && <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl"><p className="text-xs font-semibold text-yellow-900 mb-1 flex items-center gap-1.5"><MessageSquare size={14}/>Keluhan Customer</p><p className="text-sm text-yellow-800">{b.notes}</p></div>}
          <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl flex justify-between items-center"><div><p className="text-xs text-gray-500">Layanan</p><p className="text-sm font-bold text-gray-900">{b.service?.name}</p></div><div className="text-right"><p className="font-bold text-primary-600">{formatCurrency(serviceBasePrice)}</p><p className="text-xs text-gray-500">{b.service?.estimated_duration||60} mnt</p></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Hasil Temuan</label><textarea value={inspForm.findings} onChange={e=>setInspForm({...inspForm,findings:e.target.value})} className="input-field min-h-[100px]" placeholder="Kondisi kendaraan..." required/></div>
          <div className="grid grid-cols-2 gap-3"><Input label="Biaya Service (Rp)" type="number" value={inspForm.estimated_cost} onChange={e=>setInspForm({...inspForm,estimated_cost:e.target.value})} required/><Input label="Durasi (menit)" type="number" value={inspForm.estimated_duration} onChange={e=>setInspForm({...inspForm,estimated_duration:e.target.value})} min="1" required/></div>
          <div className="border-t border-gray-200 pt-4"><p className="text-sm font-semibold text-gray-900 mb-1">Tambahan Perbaikan & Parts</p><p className="text-xs text-gray-500 mb-3">Kerusakan lain di luar paket layanan</p>{additionalItems.length>0&&<div className="space-y-2 mb-4">{additionalItems.map(item=><div key={item.id} className="flex items-center gap-2 p-2.5 bg-orange-50 border border-orange-200 rounded-xl"><div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{item.name}</p><p className="text-xs text-gray-500">{item.qty}x @ {formatCurrency(item.unit_price)}{item.duration_minutes>0?` · ${item.duration_minutes} mnt`:''}</p></div><p className="text-sm font-bold text-orange-700 whitespace-nowrap">{formatCurrency(item.total_price)}</p><button type="button" onClick={()=>handleRemoveItem(item.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button></div>)}</div>}<div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2"><div className="grid grid-cols-6 gap-2"><div className="col-span-2"><input value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})} className="input-field text-sm py-2" placeholder="Nama part"/></div><div><input type="number" value={newItem.qty} onChange={e=>setNewItem({...newItem,qty:e.target.value})} className="input-field text-sm py-2 text-center" placeholder="Qty" min="1"/></div><div className="col-span-2"><input type="number" value={newItem.unit_price} onChange={e=>setNewItem({...newItem,unit_price:e.target.value})} className="input-field text-sm py-2" placeholder="Harga"/></div><div><input type="number" value={newItem.duration} onChange={e=>setNewItem({...newItem,duration:e.target.value})} className="input-field text-sm py-2 text-center" placeholder="Mnt"/></div></div><button type="button" onClick={handleAddItem} disabled={!newItem.name||!newItem.unit_price||Number(newItem.unit_price)<=0} className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg border border-dashed border-primary-300 disabled:opacity-40 disabled:cursor-not-allowed"><Plus size={16}/>Tambah</button></div></div>
          <div className="bg-gray-900 text-white rounded-xl p-4 space-y-2"><p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Ringkasan</p><div className="flex justify-between text-sm"><span className="text-gray-400">Service</span><span>{formatCurrency(estimatedCost)}</span></div>{additionalCostTotal>0&&<div className="flex justify-between text-sm"><span className="text-gray-400">Parts ({additionalItems.length})</span><span className="text-orange-400">+{formatCurrency(additionalCostTotal)}</span></div>}<div className="flex justify-between font-bold pt-2 border-t border-gray-700"><span>Total Biaya</span><span className="text-green-400 text-lg">{formatCurrency(grandTotalCost)}</span></div><div className="border-t border-gray-700 pt-2"><div className="flex justify-between text-sm"><span className="text-gray-400">Durasi</span><span>{estimatedDuration} mnt</span></div>{additionalDurationTotal>0&&<div className="flex justify-between text-sm"><span className="text-gray-400">Tambahan</span><span className="text-orange-400">+{additionalDurationTotal} mnt</span></div>}<div className="flex justify-between font-bold pt-2 border-t border-gray-700"><span>Total Durasi</span><span className="text-blue-400">{grandTotalDuration} mnt</span></div></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Catatan Mekanik (opsional)</label><textarea value={inspForm.mechanic_notes} onChange={e=>setInspForm({...inspForm,mechanic_notes:e.target.value})} className="input-field min-h-[60px]" placeholder="Catatan..."/></div>
          <Button type="submit" fullWidth loading={sub}>Simpan Hasil Inspeksi</Button>
        </form>
      </Modal>

      <ConfirmDialog config={dialog} onClose={()=>setDialog(null)}/>
      <AlertDialog config={alertDlg} onClose={()=>setAlertDlg(null)}/>
    </div>
  );
}
