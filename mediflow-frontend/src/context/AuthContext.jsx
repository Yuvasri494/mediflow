import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('mediFlowUser');
    const storedToken = localStorage.getItem('mediFlowToken');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('mediFlowUser', JSON.stringify(userData));
    localStorage.setItem('mediFlowToken', userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mediFlowUser');
    localStorage.removeItem('mediFlowToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);