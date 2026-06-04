import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Wrench, LayoutDashboard, ClipboardList, Bookmark, Users, Settings,
  LogOut, User, PanelLeftOpen, PanelLeftClose, X
} from 'lucide-react';

const ADMIN_NAV = [
  { to:'/admin',          icon:LayoutDashboard, label:'Dashboard' },
  { to:'/admin/bookings', icon:ClipboardList,   label:'Kelola Booking' },
  { to:'/admin/payments', icon:Bookmark,        label:'Pembayaran' },
  { to:'/admin/users',    icon:Users,           label:'Kelola User' },
  { to:'/admin/services', icon:Settings,        label:'Kelola Layanan' },
];

const MECHANIC_NAV = [
  { to:'/mechanic',         icon:LayoutDashboard, label:'Dashboard' },
  { to:'/mechanic/jobs',    icon:ClipboardList,   label:'Antrian Job' },
  { to:'/mechanic/history', icon:Bookmark,        label:'Riwayat' },
];

export function Sidebar() {
  const [open, setOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return true;
    return false;
  });
  const [logoutDialog, setLogoutDialog] = useState(null);
  const { user, logout, isAdmin } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();

  const links = isAdmin ? ADMIN_NAV : MECHANIC_NAV;
  const roleBadge = isAdmin
    ? { label:'Admin', bg:'bg-primary-500/20', text:'text-primary-300', border:'border-primary-500/30' }
    : { label:'Mekanik', bg:'bg-orange-500/20', text:'text-orange-300', border:'border-orange-500/30' };

  const isActive = (path) => loc.pathname === path || (path !== '/admin' && path !== '/mechanic' && loc.pathname.startsWith(path));

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 1024) setOpen(false);
  }, [loc.pathname]);

  const handleLogout = () => {
    setLogoutDialog({
      title: 'Keluar dari Akun?',
      message: 'Anda akan keluar dari sistem. Pastikan semua pekerjaan sudah disimpan.',
      variant: 'danger',
      confirmLabel: 'Ya, Keluar',
      onConfirm: () => { logout(); nav('/login'); },
    });
  };

  return (
    <>
      {/* Floating toggle button — visible when sidebar is CLOSED */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 p-2.5 bg-gray-900 text-gray-400 hover:text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:bg-gray-800 group"
          title="Buka sidebar"
        >
          <PanelLeftOpen size={20}/>
        </button>
      )}

      {/* Overlay — mobile & tablet */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)}/>
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed top-0 left-0 h-full w-[250px] bg-gray-900 z-40
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Link to={isAdmin ? '/admin' : '/mechanic'} className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Wrench size={18} className="text-gray-900"/>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">GEARBOX</p>
              <p className="text-xs text-primary-500 leading-tight">{isAdmin ? 'Admin Portal' : 'Mekanik Portal'}</p>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Tutup sidebar"
          >
            <PanelLeftClose size={18}/>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {links.map(link => (
            <Link key={link.to} to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive(link.to)
                  ? 'bg-primary-500 text-gray-900 shadow-lg shadow-primary-500/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              <link.icon size={20} className="flex-shrink-0"/>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-gray-400"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${roleBadge.bg} ${roleBadge.text} border ${roleBadge.border}`}>
                {roleBadge.label}
              </span>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors">
            <LogOut size={18}/><span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Spacer — only on desktop when sidebar is open */}
      {open && <div className="hidden lg:block flex-shrink-0 w-[250px] transition-all duration-300"/>}

      <ConfirmDialog config={logoutDialog} onClose={() => setLogoutDialog(null)}/>
    </>
  );
}
