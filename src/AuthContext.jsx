import { createContext, useState, useContext } from 'react';
import { apiRequest } from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

  const login = async (username, password) => {
    const res = await apiRequest({ action: 'login', username, password });
    if (res.success) {
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
    }
    return res;
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