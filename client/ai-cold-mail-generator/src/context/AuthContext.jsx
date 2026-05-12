import React, { useEffect, useState, useContext, createContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userInfo = sessionStorage.getItem("userInfo");

      if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
    } catch (error) {
      sessionStorage.removeItem("userInfo");
      sessionStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    if (!userData) return;

    sessionStorage.setItem("userInfo", JSON.stringify(userData));

    if (userData.token) {
      sessionStorage.setItem("token", userData.token);
    }

    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("userInfo");
    sessionStorage.removeItem("token");

    setUser(null);
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("userInfo");
      sessionStorage.removeItem("token");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
