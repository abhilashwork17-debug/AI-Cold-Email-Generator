import React, { useEffect, useState, useContext, createContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userInfo = localStorage.getItem("userInfo");

      if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
    } catch (error) {
      localStorage.removeItem("userInfo");
    } finally {
      setLoading(false);
    }
  }, []);

  const Login = (userData) => {
    if (!userData) return;

    localStorage.setItem("userInfo", JSON.stringify(userData));

    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, Login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
