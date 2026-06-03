import { createContext, useState, useEffect } from 'react';
export const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) try { setUser(JSON.parse(s)); } catch { localStorage.clear(); }
    setLoading(false);
  }, []);
  const login  = (userData, token) => { localStorage.setItem('user', JSON.stringify(userData)); localStorage.setItem('token', token); setUser(userData); };
  const logout = () => { localStorage.clear(); setUser(null); };
  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isAuthenticated: !!user,
      isAdmin:    user?.role === 'admin',
      isMechanic: user?.role === 'mechanic',
      isCustomer: user?.role === 'customer',
    }}>
      {children}
    </AuthContext.Provider>
  );
}
