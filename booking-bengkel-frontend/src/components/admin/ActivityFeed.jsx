import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CreditCard, MessageSquare, Wrench, User, Clock, ArrowRight } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { formatRelativeTime } from '../../utils/formatters';

const ACTION_ICONS = {
  booking: ClipboardList,
  payment: CreditCard,
  review: MessageSquare,
  service: Wrench,
  user: User,
};

const ROLE_CLASSES = {
  admin: 'bg-rose-100 text-rose-700 border-rose-200',
  mechanic: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  customer: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  system: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function ActivityFeed() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchLogs = async () => {
    try {
      const res = await bookingService.getActivityLogs({ limit: 10 });
      setLogs(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch activity logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getActionGroup = (action) => {
    if (action.startsWith('booking.')) return 'booking';
    if (action.startsWith('payment.')) return 'payment';
    if (action.startsWith('review.')) return 'review';
    if (action.startsWith('service.')) return 'service';
    if (action.startsWith('user.')) return 'user';
    return 'system';
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Clock size={18} className="text-primary-600 animate-pulse" />
          Aktivitas Terbaru
        </h3>
        <span className="text-xs text-gray-400 font-medium">Real-time</span>
      </div>

      <div className="p-4 overflow-y-auto max-h-[500px] space-y-4 scrollbar-thin">
        {loading && logs.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">Memuat aktivitas...</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">Belum ada aktivitas terbaru</div>
        ) : (
          logs.map((log) => {
            const group = getActionGroup(log.action);
            const Icon = ACTION_ICONS[group] || ClipboardList;
            const actorName = log.actor?.name || 'System';
            const actorRole = log.actor?.role || 'system';

            return (
              <div
                key={log.id}
                className="group relative flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-primary-50/40 border border-transparent hover:border-primary-100 transition-all duration-300"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {getInitials(actorName)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                    <Icon size={11} className="text-primary-600" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-900 text-xs truncate max-w-[120px]">
                      {actorName}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wider ${
                        ROLE_CLASSES[actorRole] || ROLE_CLASSES.system
                      }`}
                    >
                      {actorRole}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1 font-medium">
                      <Clock size={10} />
                      {formatRelativeTime(log.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 font-normal leading-relaxed">
                    {log.description}
                  </p>
                </div>

                {/* Action button if related to a booking */}
                {log.booking_id && (
                  <button
                    onClick={() => navigate(`/admin/bookings/${log.booking_id}`)}
                    className="self-center p-1.5 text-gray-400 hover:text-primary-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
                    title="Lihat Detail Booking"
                  >
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
