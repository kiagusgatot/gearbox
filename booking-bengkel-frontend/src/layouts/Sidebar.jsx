import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Wrench, LayoutDashboard, ClipboardList, Bookmark, Users, Settings,
  LogOut, Menu, X, User, PanelLeftClose, PanelLeftOpen
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(null);
  const { user, logout, isAdmin } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();

  const links = isAdmin ? ADMIN_NAV : MECHANIC_NAV;
  const roleBadge = isAdmin
    ? { label:'Admin', bg:'bg-primary-500/20', text:'text-primary-300', border:'border-primary-500/30' }
    : { label:'Mekanik', bg:'bg-orange-500/20', text:'text-orange-300', border:'border-orange-500/30' };

  const isActive = (path) => loc.pathname === path || (path !== '/admin' && path !== '/mechanic' && loc.pathname.startsWith(path));

  const handleLogout = () => {
    setLogoutDialog({
      title: 'Keluar dari Akun?',
      message: 'Anda akan keluar dari sistem. Pastikan semua pekerjaan sudah disimpan.',
      variant: 'danger',
      confirmLabel: 'Ya, Keluar',
      onConfirm: () => { logout(); nav('/login'); },
    });
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Header: Logo + Collapse toggle */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-800 ${collapsed ? 'px-3' : 'px-4'}`}>
        <Link to={isAdmin ? '/admin' : '/mechanic'} className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Wrench size={18} className="text-white"/>
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-white leading-tight">Booking</p>
              <p className="text-xs text-gray-400 leading-tight">Bengkel</p>
            </div>
          )}
        </Link>
        {/* Collapse button — di samping logo (Poin 4a) */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          {collapsed ? <PanelLeftOpen size={18}/> : <PanelLeftClose size={18}/>}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {links.map(link => {
          const active = isActive(link.to);
          return (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? link.label : undefined}>
              <link.icon size={20} className="flex-shrink-0"/>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section (Poin 4b: badge ganti email) */}
      <div className={`p-3 border-t border-gray-800 ${collapsed ? 'px-2' : ''}`}>
        <div className={`flex items-center gap-3 px-3 py-2.5 ${collapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-gray-400"/>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${roleBadge.bg} ${roleBadge.text} border ${roleBadge.border}`}>
                {roleBadge.label}
              </span>
            </div>
          )}
        </div>

        {/* Logout with confirmation (Poin 4c) */}
        <button onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Keluar' : undefined}>
          <LogOut size={18}/>
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-gray-800 transition-colors">
        {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
      </button>

      {mobileOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}/>}

      <aside className={`fixed top-0 left-0 h-full bg-gray-900 z-40 transition-all duration-300 flex flex-col
        ${collapsed ? 'w-[70px]' : 'w-[240px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {content}
      </aside>

      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-[70px]' : 'w-[240px]'}`}/>

      <ConfirmDialog config={logoutDialog} onClose={() => setLogoutDialog(null)}/>
    </>
  );
}
