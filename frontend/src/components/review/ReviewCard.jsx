import { Star } from 'lucide-react';

export function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(n => (
          <Star key={n} size={16} className={n <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
        ))}
        <span className="text-sm font-semibold text-gray-900 ml-2">{review.rating}/5</span>
      </div>
      <h4 className="font-semibold text-gray-900 mb-1">{review.title || 'Review'}</h4>
      <p className="text-sm text-gray-600">{review.comment}</p>
      <p className="text-xs text-gray-400 mt-3">{review.user?.name || 'Anonim'}</p>
    </div>
  );
}
