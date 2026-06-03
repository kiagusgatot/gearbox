import { useState, useEffect } from 'react';
import { Search, Wrench } from 'lucide-react';
import { serviceService } from '../../services/serviceService';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { Input } from '../../components/common/Input';
import { ServiceCard } from '../../components/booking/ServiceCard';

export function Services() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    serviceService.getAll().then(data => {
      // Handle both array and {data: array} responses
      const arr = Array.isArray(data) ? data : (data?.data || data || []);
      setList(Array.isArray(arr) ? arr : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const categories = ['all', 'routine', 'maintenance', 'repair'];
  const categoryLabels = { all: 'Semua', routine: 'Routine', maintenance: 'Maintenance', repair: 'Repair' };

  const filtered = list.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(q.toLowerCase());
    const matchCategory = selectedCategory === 'all' || s.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="section-title">Layanan Service</h1>
        <p className="section-sub">Pilih layanan yang sesuai untuk kendaraan Anda</p>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <Input 
            icon={Search} 
            placeholder="Cari layanan..." 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
            className="max-w-md"
          />
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        {loading ? <Loading /> : filtered.length === 0 ? (
          <EmptyState icon={Search} title="Layanan tidak ditemukan" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
