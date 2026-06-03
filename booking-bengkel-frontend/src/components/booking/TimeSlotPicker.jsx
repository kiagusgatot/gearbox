import { Clock } from 'lucide-react';

// Jam operasional:
// Senin-Jumat: 08:00 - 17:00
// Sabtu: 08:00 - 14:00
// Minggu: Tutup (sudah di-handle di AvailabilityCalendar)

const WEEKDAY_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];
const SATURDAY_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00'];

export function TimeSlotPicker({ selectedDate, selectedTime, onTimeSelect, disabled = false }) {
  if (!selectedDate) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Waktu Kedatangan</label>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
          <Clock size={24} className="text-gray-300 mx-auto mb-2"/>
          <p className="text-sm text-gray-400">Pilih tanggal terlebih dahulu</p>
        </div>
      </div>
    );
  }

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const dayOfWeek = dateObj.getDay(); // 6 = Saturday
  const isSaturday = dayOfWeek === 6;
  const slots = isSaturday ? SATURDAY_SLOTS : WEEKDAY_SLOTS;
  const dayLabel = isSaturday ? 'Sabtu (08:00 - 14:00)' : 'Senin-Jumat (08:00 - 17:00)';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Waktu Kedatangan</label>
      <p className="text-xs text-gray-500 mb-3">Jam operasional {dayLabel}</p>
      <div className="grid grid-cols-3 gap-2">
        {slots.map(time => {
          const isSelected = selectedTime === time;
          return (
            <button
              key={time}
              type="button"
              onClick={() => !disabled && onTimeSelect(time)}
              disabled={disabled}
              className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
                isSelected
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
