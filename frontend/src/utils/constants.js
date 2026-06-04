export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
export const ROLES = { CUSTOMER: 'customer', ADMIN: 'admin', MECHANIC: 'mechanic' };
export const STATUS_CONFIG = {
  pending:            { label: 'Menunggu Konfirmasi',  color: 'bg-orange-100 text-orange-800',  dot: 'bg-orange-500'  },
  confirmed:          { label: 'Dikonfirmasi',         color: 'bg-blue-100 text-blue-800',      dot: 'bg-blue-500'    },
  ready:              { label: 'Siap Inspeksi',        color: 'bg-slate-100 text-slate-800',    dot: 'bg-slate-500'   },
  inspection_done:    { label: 'Inspeksi Selesai',     color: 'bg-cyan-100 text-cyan-800',      dot: 'bg-cyan-500'    },
  estimation_sent:    { label: 'Estimasi Dikirim',     color: 'bg-amber-100 text-amber-800',    dot: 'bg-amber-500'   },
  customer_approved:  { label: 'Estimasi Disetujui',   color: 'bg-lime-100 text-lime-800',      dot: 'bg-lime-500'    },
  service_started:    { label: 'Siap Dikerjakan',      color: 'bg-sky-100 text-sky-800',        dot: 'bg-sky-500'     },
  in_progress:        { label: 'Sedang Dikerjakan',    color: 'bg-blue-100 text-blue-800',      dot: 'bg-blue-500'    },
  waiting_payment:    { label: 'Menunggu Pembayaran',  color: 'bg-orange-100 text-orange-800',  dot: 'bg-orange-500'  },
  completed:          { label: 'Selesai & Lunas',      color: 'bg-green-100 text-green-800',    dot: 'bg-green-500'   },
  cancelled:          { label: 'Dibatalkan',           color: 'bg-red-100 text-red-800',        dot: 'bg-red-500'     },
};
export const PAYMENT_METHODS = [
  { value: 'cash',          label: 'Tunai' },
  { value: 'bank_transfer', label: 'Transfer Bank' },
  { value: 'debit_card',    label: 'Kartu Debit' },
  { value: 'credit_card',   label: 'Kartu Kredit' },
  { value: 'e_wallet',      label: 'E-Wallet' },
];
