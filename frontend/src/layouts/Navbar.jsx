import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Wrench, Menu, X, Home, Bookmark, User, LogOut, Car, ChevronDown } from 'lucide-react';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

const NAV_LINKS = [
  { to: '/',         icon: Home,     label: 'Home' },
  { to: '/services', icon: Wrench,   label: 'Layanan' },
  { to: '/bookings', icon: Bookmark, label: 'Booking Saya' },
];

const GUEST_LINKS = [
  { to: '/',         icon: Home,  label: 'Home' },
  { to: '/services', icon: Wrench, label: 'Layanan' },
];

const PROFILE_MENU = [
  { to: '/profile',  icon: User, label: 'Profil Saya' },
  { to: '/vehicles', icon: Car,  label: 'Kendaraan Saya' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(null);
  const dropdownRef = useRef(null);
  const { user, logout, isCustomer } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();

  const links = user && isCustomer ? NAV_LINKS : GUEST_LINKS;
  const isActive = (p) => loc.pathname === p || (p !== '/' && loc.pathname.startsWith(p));

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    setLogoutDialog({
      title: 'Keluar dari Akun?',
      message: 'Anda akan keluar dari sistem. Yakin ingin melanjutkan?',
      variant: 'danger',
      confirmLabel: 'Ya, Keluar',
      onConfirm: () => { logout(); nav('/login'); },
    });
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Wrench size={26} className="text-primary-500 fill-primary-500"/>
            <span className="text-xl font-black text-gray-900 tracking-wider">GEARBOX</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors py-1.5 border-b-2 ${isActive(l.to) ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
                <l.icon size={18}/>{l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              {user && isCustomer ? (
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <User size={16} className="text-gray-900"/>
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}/>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-gray-200 shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      {PROFILE_MENU.map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${isActive(item.to) ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                          <item.icon size={16}/>{item.label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut size={16}/>Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900">Masuk</Link>
                  <Link to="/register" className="btn-primary btn-sm">Daftar</Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden px-4 pb-4 space-y-1 border-t border-gray-100">
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${isActive(l.to) ? 'bg-primary-500 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>
                <l.icon size={20}/>{l.label}
              </Link>
            ))}
            {user && isCustomer && (
              <div className="border-t border-gray-100 pt-2">
                {PROFILE_MENU.map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${isActive(item.to) ? 'bg-primary-500 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <item.icon size={20}/>{item.label}
                  </Link>
                ))}
              </div>
            )}
            <div className="border-t border-gray-100 pt-2">
              {user
                ? <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl"><LogOut size={20}/>Keluar</button>
                : <><Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded-xl font-semibold">Masuk</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="block text-center btn-primary btn-sm mx-4 mt-2">Daftar</Link></>
              }
            </div>
          </div>
        )}
      </nav>
      <ConfirmDialog config={logoutDialog} onClose={() => setLogoutDialog(null)}/>
    </>
  );
}
