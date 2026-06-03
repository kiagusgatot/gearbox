import { useNavigate } from 'react-router-dom';
import { Clock, Star, DollarSign, Tag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CATEGORY_COLORS = {
  routine:      { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Routine' },
  maintenance:  { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Maintenance' },
  repair:       { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Repair' },
  parts:        { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Parts' },
  other:        { bg: 'bg-gray-100',   text: 'text-gray-700',   label: 'Lainnya' },
};

export function ServiceCard({ service }) {
  const nav = useNavigate();
  const catColor = CATEGORY_COLORS[service.category] || CATEGORY_COLORS.other;
  const rating = service.rating || 0;
  const reviewCount = service.review_count || 0;

  return (
    <div
      onClick={() => nav(`/services/${service.id}`)}
      className="card-hover group cursor-pointer space-y-3"
    >
      {/* Header with category badge */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
            {service.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description || 'Layanan profesional'}</p>
        </div>
        {/* Category badge */}
        <span className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 ${catColor.bg} ${catColor.text}`}>
          {catColor.label}
        </span>
      </div>

      {/* Rating & Review count */}
      {reviewCount > 0 ? (
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
              <Star
                key={n}
                size={14}
                className={n <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-500">({reviewCount} review)</span>
        </div>
      ) : (
        <p className="text-xs text-gray-400">Belum ada review</p>
      )}

      {/* Biaya breakdown */}
      <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tenaga kerja</span>
          <span className="font-semibold text-gray-900">{formatCurrency(service.labor_price)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Suku cadang</span>
          <span className="font-semibold text-gray-900">{formatCurrency(service.parts_price)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between items-center font-bold">
          <span className="text-gray-900">Total</span>
          <span className="text-primary-600 text-base">{formatCurrency(service.base_price || service.labor_price + service.parts_price)}</span>
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock size={16} className="text-primary-600"/>
        {service.estimated_duration} menit
      </div>
    </div>
  );
}
