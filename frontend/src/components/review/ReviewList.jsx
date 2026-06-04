import { useState, useEffect } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { serviceService } from '../../services/serviceService';
import { formatDateTime } from '../../utils/formatters';
import { Loading } from '../common/Loading';

export function ReviewList({ serviceId, maxDisplay = 5 }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!serviceId) { setLoading(false); return; }
    serviceService.getReviews(serviceId, 1, 100)
      .then(res => {
        // Handle: { data: [...] } or [...] or { data: { data: [...] } }
        const arr = res?.data || res || [];
        setReviews(Array.isArray(arr) ? arr : []);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [serviceId]);

  if (loading) return <Loading/>;
  if (reviews.length === 0) return (
    <div className="text-center py-8">
      <MessageCircle size={32} className="text-gray-300 mx-auto mb-3"/>
      <p className="text-gray-500">Belum ada review untuk service ini</p>
      <p className="text-xs text-gray-400 mt-1">Jadilah yang pertama memberikan review!</p>
    </div>
  );

  const displayed = showAll ? reviews : reviews.slice(0, maxDisplay);

  return (
    <div className="space-y-4">
      {displayed.map(review => (
        <div key={review.id} className="card">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-semibold text-gray-900">{review.user_name || 'Pelanggan'}</p>
              <p className="text-xs text-gray-500">{formatDateTime(review.created_at)}</p>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} size={16} className={n <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}/>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
        </div>
      ))}

      {reviews.length > maxDisplay && !showAll && (
        <button onClick={() => setShowAll(true)}
          className="w-full text-center py-3 text-gray-900 hover:bg-gray-100 rounded-xl font-semibold transition-colors">
          Lihat {reviews.length - maxDisplay} review lainnya
        </button>
      )}
      {showAll && reviews.length > maxDisplay && (
        <button onClick={() => setShowAll(false)}
          className="w-full text-center py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
          Sembunyikan
        </button>
      )}
    </div>
  );
}
