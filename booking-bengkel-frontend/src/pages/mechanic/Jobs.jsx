import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Calendar, ArrowRight } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate, formatTime } from '../../utils/formatters';

const TABS = [
  { key:'all',             label:'Semua'           },
  { key:'confirmed',       label:'Baru'            },
  { key:'ready',           label:'Siap Inspeksi'   },
  { key:'inspection_done', label:'Inspeksi Done'   },
  { key:'service_started', label:'Mulai Service'   },
  { key:'in_progress',     label:'Dikerjakan'      },
  { key:'waiting_payment', label:'Tunggu Bayar'    },
];

export function MechanicJobs() {
  const [list, setList] = useState([]); const [loading, setLoading] = useState(true); const [tab, setTab] = useState('all');
  const nav = useNavigate();
  useEffect(() => { bookingService.getAll().then(data => { const arr = Array.isArray(data)?data:(data?.data||[]); setList(Array.isArray(arr)?arr:[]); }).catch(()=>{}).finally(()=>setLoading(false)); }, []);
  const filtered = tab === 'all' ? list : list.filter(b => b.status === tab);

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="section-title">Antrian Job</h1>
        <p className="section-sub">Daftar semua pekerjaan</p>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {TABS.map(t => <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${tab===t.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {t.label}</button>)}
        </div>
        {loading ? <Loading/> : filtered.length === 0 ? <EmptyState icon={ClipboardList} title="Tidak ada job"/> :
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(b => <div key={b.id} onClick={() => nav(`/mechanic/jobs/${b.id}`)} className="card-hover">
              <div className="flex justify-between items-start mb-3"><div><p className="font-bold text-gray-900">{b.service?.name||'Service'}</p><p className="text-sm text-gray-500">{b.user?.name||'-'}</p></div><StatusBadge status={b.status}/></div>
              <p className="text-sm text-gray-500 mb-3">{b.vehicle?.brand} {b.vehicle?.model} — {b.vehicle?.plate}</p>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center"><span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12}/>{formatDate(b.scheduled_date)}</span><ArrowRight size={16} className="text-gray-400"/></div>
            </div>)}
          </div>}
      </div>
    </div>
  );
}
