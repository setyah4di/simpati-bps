import { createContext, useState, useContext } from 'react';
import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

  const login = async (username, password) => {
    // 1. Ambil data user berdasarkan username (tanpa filter password dulu)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      return { success: false, error: 'Username atau password salah' };
    }

    // 2. Bandingkan password input dengan password hash di database
    const isMatch = await bcrypt.compare(password, data.password);
    if (!isMatch) {
      return { success: false, error: 'Username atau password salah' };
    }
    
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);