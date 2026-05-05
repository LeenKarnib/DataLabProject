import { createContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem('token'));

  const login = (userData, tokenValue) => {
    setUser(userData);
    setTokenState(tokenValue);
    localStorage.setItem('token', tokenValue);
  };

  const logout = () => {
    setUser(null);
    setTokenState(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}