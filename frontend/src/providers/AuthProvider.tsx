"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // مزامنة حالة تسجيل الدخول مع الكوكيز ليقرأها הـ Middleware
      if (currentUser) {
        const token = await currentUser.getIdToken();
        document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
      } else {
        document.cookie = `auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
