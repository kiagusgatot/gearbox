import { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { serviceService } from '../../services/serviceService';

export function AvailabilityCalendar({ serviceId, selectedDate, onDateSelect, disabled = false }) {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!serviceId) return;
    setLoading(true);
    setError('');
    serviceService.getAvailability(serviceId)
      .then(data => {
        if (data?.availability) setAvailability(data);
        else if (Array.isArray(data)) setAvailability({ availability: data, max_per_day: 8 });
        else setError('Format response tidak dikenali');
      })
      .catch(() => setError('Gagal memuat ketersediaan slot'))
      .finally(() => setLoading(false));
  }, [serviceId]);

  if (loading) {
    return <div className="flex items-center justify-center py-6">
      <Loader2 size={24} className="text-primary-500 animate-spin mr-2"/>
      <span className="text-sm text-gray-500">Memuat ketersediaan...</span>
    </div>;
  }

  if (error || !availability) {
    return <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
      <p className="text-sm text-yellow-800 font-medium mb-2">{error || 'Tidak dapat memuat kalender'}</p>
      <p className="text-xs text-yellow-700">Anda tetap bisa memilih tanggal secara manual di bawah.</p>
      <input type="date" value={selectedDate || ''} onChange={(e) => onDateSelect(e.target.value)}
        className="input-field mt-3"
        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
        max={new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}
        disabled={disabled}/>
    </div>;
  }

  const slots = availability.availability || [];
  const maxPerDay = availability.max_per_day || 8;
  const dateRange = availability.bookable_date_range || {};

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Pilih Tanggal Service</label>

      {dateRange.min && dateRange.max && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
          <AlertCircle size={14} className="flex-shrink-0"/>
          <span>Tersedia dari <strong>{fmtShort(dateRange.min)}</strong> s/d <strong>{fmtShort(dateRange.max)}</strong></span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {slots.map((day) => {
          const dateObj = new Date(day.date + 'T00:00:00');
          const dayOfWeek = dateObj.getDay(); // 0 = Sunday
          const isSunday = dayOfWeek === 0;
          const isSelected = selectedDate === day.date;
          const isAvailable = day.status === 'available' && !isSunday;
          const isFull = day.status === 'full' || isSunday;

          const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'short' });
          const dayNum = dateObj.getDate();
          const monthName = dateObj.toLocaleDateString('id-ID', { month: 'short' });

          return (
            <button key={day.date} type="button"
              onClick={() => !disabled && isAvailable && onDateSelect(day.date)}
              disabled={disabled || !isAvailable}
              className={`p-2.5 rounded-xl border-2 transition-all text-center ${
                isSelected ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100 font-bold'
                : isAvailable ? 'border-green-200 bg-green-50 hover:border-green-400 cursor-pointer'
                : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
              }`}>
              <div className="text-xs text-gray-500">{dayName}</div>
              <div className="text-lg font-bold text-gray-900">{dayNum}</div>
              <div className="text-xs text-gray-500">{monthName}</div>
              <div className={`text-xs mt-0.5 font-semibold ${
                isSunday ? 'text-red-600' : isAvailable ? 'text-green-600' : 'text-red-600'
              }`}>
                {isSunday ? 'Tutup' : day.available > 0 ? `${day.available}/${maxPerDay}` : 'Penuh'}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-200 border border-green-300 rounded"/>Tersedia</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-200 border border-red-300 rounded"/>Penuh/Tutup</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary-200 border border-primary-300 rounded"/>Dipilih</span>
      </div>

      {selectedDate && (
        <div className="p-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm text-primary-900 font-medium">
          📅 {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </div>
      )}
    </div>
  );
}

function fmtShort(s) {
  return new Date(s + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
