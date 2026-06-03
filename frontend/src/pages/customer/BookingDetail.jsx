import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Wrench, User, Car, AlertCircle, FileText, Camera, Star, CheckCircle, CreditCard, ClipboardList, ThumbsUp, X as XIcon } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { formatDate, formatTime, formatCurrency, formatDateTime } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog, AlertDialog } from '../../components/common/ConfirmDialog';
import { ReviewForm } from '../../components/review/ReviewForm';

export function BookingDetail() {
  const { id } = useParams(); const nav = useNavigate();
  const [b, setB] = useState(null);
  const [estimation, setEstimation] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [approving, setApproving] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [alertDlg, setAlertDlg] = useState(null);

  const load = () => {
    Promise.all([
      bookingService.getById(id).catch(()=>null), bookingService.getEstimation(id).catch(()=>null),
      bookingService.getInvoice(id).catch(()=>null), bookingService.getDocumentation(id).catch(()=>null),
    ]).then(([bk,est,inv,doc]) => { if(!bk){nav('/bookings');return;} setB(bk);setEstimation(est);setInvoice(inv);setDocs(doc); }).finally(()=>setLoading(false));
  };
  useEffect(()=>{load();},[id]);

  const handleApproveEstimation = (action) => {
    const isApprove = action === 'approve';
    setDialog({
      title: isApprove ? 'Setujui Estimasi?' : 'Tolak Estimasi?',
      message: isApprove ? 'Dengan menyetujui, bengkel akan mulai mengerjakan kendaraan Anda.' : 'Jika ditolak, booking akan dibatalkan dan tidak bisa di-undo.',
      variant: isApprove ? 'success' : 'danger',
      confirmLabel: isApprove ? 'Setujui' : 'Ya, Tolak',
      onConfirm: async () => {
        setApproving(true);
        try { await bookingService.approveEstimation(id,{action}); load(); }
        catch(e) { setAlertDlg({ title:'Gagal', message:e.response?.data?.message||'Terjadi kesalahan', variant:'danger' }); }
        finally { setApproving(false); }
      },
    });
  };

  const handleCancel = () => {
    setDialog({
      title: 'Batalkan Booking?', message: 'Booking yang dibatalkan tidak bisa dikembalikan.', variant: 'danger', confirmLabel: 'Ya, Batalkan',
      onConfirm: async () => { try { await bookingService.updateStatus(id,{status:'cancelled'}); load(); } catch { setAlertDlg({title:'Gagal',message:'Gagal membatalkan booking',variant:'danger'}); } },
    });
  };

  if (loading) return <Loading/>; if (!b) return null;

  const est = estimation;
  const items = est?.items || [];
  const totalCost = est?.summary?.total_cost || est?.inspection?.estimated_cost || Number(b.service?.base_price) || 0;
  const totalDuration = est?.summary?.total_duration || est?.inspection?.estimated_duration || 0;
  const servicePrice = est?.summary?.service_price || Number(b.service?.base_price) || 0;
  const showEstimation = ['estimation_sent','customer_approved','service_started','in_progress','waiting_payment','completed'].includes(b.status) && est;

  const infoItems = [
    {i:Wrench,l:'Layanan',v:b.service?.name||'-'},{i:Car,l:'Kendaraan',v:`${b.vehicle?.brand||''} ${b.vehicle?.model||''} (${b.vehicle?.plate||'-'})`},
    {i:Calendar,l:'Tanggal',v:formatDate(b.scheduled_date)},{i:Clock,l:'Jam',v:formatTime(b.scheduled_time)},
    {i:User,l:'Mekanik',v:b.mechanic?.name||'Belum ditentukan'}
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={()=>nav(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors"><ArrowLeft size={20}/>Kembali</button>
        <div className="card">
          <div className="flex justify-between items-start mb-6"><div><h1 className="text-xl font-bold text-gray-900">Detail Booking</h1><p className="text-sm text-gray-400 mt-1">ID: {b.id?.substring(0,8)}</p></div><StatusBadge status={b.status}/></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">{infoItems.map(x=><div key={x.l} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><x.i size={18} className="text-primary-600 flex-shrink-0"/><div><p className="text-xs text-gray-400">{x.l}</p><p className="text-sm font-semibold text-gray-900">{x.v}</p></div></div>)}</div>
          {b.notes && <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3"><AlertCircle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0"/><div><p className="text-sm font-medium text-yellow-900">Catatan Anda</p><p className="text-sm text-yellow-800">{b.notes}</p></div></div>}
          {b.status==='pending' && <div className="mt-4"><Button variant="danger" size="sm" onClick={handleCancel}>Batalkan Booking</Button></div>}
        </div>

        {/* ESTIMATION_SENT: Approve/Reject */}
        {b.status==='estimation_sent' && est && <div className="card border-amber-200">
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><ClipboardList size={20} className="text-amber-600"/>Estimasi Biaya dari Bengkel</h2>
          <p className="text-sm text-gray-500 mb-4">Bengkel telah mengirimkan estimasi biaya. Mohon review dan setujui untuk melanjutkan service.</p>
          {est?.inspection?.admin_notes && <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 mb-4"><p className="font-medium mb-1">Pesan dari Bengkel:</p><p>{est.inspection.admin_notes}</p></div>}
          {est?.inspection?.findings && <div className="mb-4"><p className="text-xs font-medium text-gray-500 mb-1">Temuan Inspeksi</p><div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-800">{est.inspection.findings}</div></div>}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-4">
            <div className="flex justify-between text-sm"><span className="text-gray-600">Harga Layanan</span><span className="font-medium">{formatCurrency(servicePrice)}</span></div>
            {items.length>0 && <><p className="text-xs font-medium text-gray-500 pt-2 border-t border-gray-200">Perbaikan Tambahan:</p>{items.map(item=><div key={item.id} className="flex justify-between text-sm pl-3"><span className="text-gray-600">{item.name} ({item.qty}x)</span><span className="font-medium">{formatCurrency(item.total_price)}</span></div>)}</>}
            <div className="flex justify-between font-bold pt-2 border-t border-gray-200"><span className="text-gray-900">Total Estimasi</span><span className="text-primary-600 text-xl">{formatCurrency(totalCost)}</span></div>
            {totalDuration>0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Estimasi Durasi</span><span className="font-medium">{totalDuration} menit</span></div>}
          </div>
          <div className="flex gap-3">
            <Button variant="success" className="flex-1" onClick={()=>handleApproveEstimation('approve')} loading={approving}><ThumbsUp size={18}/>Setujui Estimasi</Button>
            <Button variant="danger" className="flex-1" onClick={()=>handleApproveEstimation('reject')} loading={approving}><XIcon size={18}/>Tolak</Button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">Jika ditolak, booking akan dibatalkan.</p>
        </div>}

        {/* Estimation for other statuses */}
        {showEstimation && b.status!=='estimation_sent' && <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><ClipboardList size={20} className="text-primary-600"/>Estimasi Biaya</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-600">Harga Layanan</span><span className="font-medium">{formatCurrency(servicePrice)}</span></div>
            {items.length>0 && items.map(item=><div key={item.id} className="flex justify-between text-sm"><span className="text-gray-600">{item.name} ({item.qty}x)</span><span className="font-medium">{formatCurrency(item.total_price)}</span></div>)}
            <div className="flex justify-between font-bold pt-2 border-t border-gray-200"><span>Total</span><span className="text-primary-600 text-lg">{formatCurrency(totalCost)}</span></div>
          </div>
          {b.status==='customer_approved' && <div className="mt-3 p-3 bg-lime-50 border border-lime-200 rounded-xl text-sm text-lime-800 flex items-center gap-2"><CheckCircle size={16}/>Estimasi disetujui. Menunggu bengkel memulai service.</div>}
        </div>}

        {/* Status messages */}
        {['confirmed','ready','inspection_done'].includes(b.status) && <div className="card border-blue-200 bg-blue-50"><p className="text-sm text-blue-800 font-medium">{b.status==='confirmed'?'Booking dikonfirmasi. Menunggu mekanik menerima job.':b.status==='ready'?'Mekanik sedang inspeksi kendaraan Anda.':'Inspeksi selesai. Menunggu estimasi biaya.'}</p></div>}
        {['service_started','in_progress'].includes(b.status) && <div className="card border-purple-200 bg-purple-50 flex items-center gap-3"><Wrench size={20} className="text-purple-600 flex-shrink-0"/><div><p className="text-sm font-bold text-purple-900">{b.status==='service_started'?'Service akan segera dimulai':'Kendaraan sedang dikerjakan'}</p><p className="text-xs text-purple-700 mt-1">Mekanik: {b.mechanic?.name||'-'}</p></div></div>}
        {b.status==='waiting_payment' && <div className="card border-orange-200 bg-orange-50 flex items-start gap-3"><CreditCard size={20} className="text-orange-600 mt-0.5 flex-shrink-0"/><div><p className="text-sm font-bold text-orange-900 mb-1">Menunggu Pembayaran</p><p className="text-sm text-orange-800">Silakan bayar di kasir bengkel untuk mengambil kunci kendaraan.</p></div></div>}

        {/* Completed: Invoice + Review */}
        {b.status==='completed' && invoice && <div className="card"><h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={20} className="text-primary-600"/>Invoice</h2><div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-4"><div className="flex justify-between text-sm"><span className="text-gray-600">Layanan</span><span className="font-medium">{b.service?.name}</span></div><div className="flex justify-between font-bold pt-2 border-t border-gray-200"><span>Total</span><span className="text-primary-600 text-lg">{formatCurrency(invoice.payment?.amount||totalCost)}</span></div></div><div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2"><CheckCircle size={18} className="text-green-600"/><p className="text-sm text-green-800 font-medium">Pembayaran Lunas</p></div></div>}
        {docs && ['waiting_payment','completed'].includes(b.status) && docs.findings && <div className="card"><h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Camera size={20} className="text-primary-600"/>Dokumentasi</h2><div className="p-4 bg-gray-50 rounded-xl"><p className="text-sm text-gray-800">{docs.findings}</p></div></div>}
        {b.status==='completed' && <div className="card"><h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><Star size={20} className="text-primary-600"/>Beri Ulasan</h2>{!reviewSubmitted?<Button onClick={()=>setShowReview(true)}>Tulis Review</Button>:<div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2"><CheckCircle size={18} className="text-green-600"/><p className="text-sm text-green-800 font-medium">Review sudah dikirim!</p></div>}</div>}
      </div>

      <Modal isOpen={showReview} onClose={()=>setShowReview(false)} title="Tulis Ulasan">
        <ReviewForm bookingId={b.id} serviceId={b.service?.id} onSuccess={()=>{setShowReview(false);setReviewSubmitted(true);}}/>
      </Modal>
      <ConfirmDialog config={dialog} onClose={()=>setDialog(null)}/>
      <AlertDialog config={alertDlg} onClose={()=>setAlertDlg(null)}/>
    </div>
  );
}
