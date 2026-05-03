import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check API for previously logged in user.
    // For this simple app, we can just fetch the single user.
    api.getUser().then(data => {
      if (data) {
        // Check if there's a logged in flag in localStorage just to preserve session state
        const session = localStorage.getItem('fitness_session');
        if (session && session === data.email) {
          setUser(data);
        }
      }
      setLoading(false);
    }).catch(err => {
      console.error("API error", err);
      setLoading(false);
    });
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('fitness_session', data.email);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const data = await api.saveUser({ name, email, password });
      setUser(data);
      localStorage.setItem('fitness_session', data.email);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateProfile = async (data) => {
    const updatedUser = { ...user, ...data };
    
    // Calculate BMI if weight and height are provided
    if (updatedUser.weight && updatedUser.height) {
      const heightInMeters = updatedUser.height / 100;
      updatedUser.bmi = (updatedUser.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    
    setUser(updatedUser);
    try {
      await api.saveUser(updatedUser);
    } catch(e) {
      console.error(e);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fitness_session');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
