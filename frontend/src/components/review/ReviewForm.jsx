import { useState } from 'react';
import { Star } from 'lucide-react';
import { serviceService } from '../../services/serviceService';
import { Button } from '../common/Button';

export function ReviewForm({ bookingId, serviceId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!rating) { setError('Pilih rating terlebih dahulu'); return; }
    if (comment.length < 10) { setError('Komentar minimal 10 karakter'); return; }

    setLoading(true);
    try {
      await serviceService.submitReview({
        booking_id: bookingId,
        service_id: serviceId,
        rating,
        comment
      });
      
      // Reset form
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal mengirim review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">{error}</div>}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110"
            >
              <Star 
                size={32} 
                className={n <= (hover || rating) 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
                }
              />
            </button>
          ))}
        </div>
        {rating > 0 && <p className="text-sm text-gray-600 mt-2">{rating} dari 5 bintang</p>}
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Komentar</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input-field min-h-[120px]"
          placeholder="Bagikan pengalaman Anda..."
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/500 karakter (min. 10)
        </p>
      </div>

      <Button type="submit" fullWidth loading={loading}>Kirim Review</Button>
    </form>
  );
}
