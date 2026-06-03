import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, Wrench, Home, Bookmark, User, CreditCard, LogOut, Bell } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = user
    ? [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/services', icon: Wrench, label: 'Services' },
        { to: '/bookings', icon: Bookmark, label: 'Booking Saya' },
        { to: '/payments', icon: CreditCard, label: 'Pembayaran' },
      ]
    : [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/services', icon: Wrench, label: 'Services' },
      ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Wrench size={28} className="text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Booking Bengkel</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive(link.to) ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              {user ? (
                <>
                  <Link to="/profile" className={`p-2 rounded-lg transition-colors ${isActive('/profile') ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100 text-gray-600'}`}>
                    <User size={20} />
                  </Link>
                  <button onClick={logout} className="p-2 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg transition-colors">
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Login</Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">Register</Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive(link.to) ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <link.icon size={20} />
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                    <User size={20} /> Profile
                  </Link>
                  <button onClick={() => { logout(); setIsOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                    <LogOut size={20} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Login</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-primary-600 text-white mx-4 mt-2 justify-center">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
