"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // بعد تسجيل الدخول، مفترض توجيه المستخدم حسب نوعه أو للرئيسية
      router.push("/");
    } catch (err: any) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Card elevation="lowest" className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">تسجيل الدخول</h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200/50">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="البريد الإلكتروني" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="أدخل بريدك الإلكتروني"
          />
          <Input 
            label="كلمة المرور" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="أدخل كلمة المرور"
          />

          <Button 
            type="submit" 
            className="w-full h-12 text-base mt-2" 
            disabled={loading}
          >
            {loading ? "جاري تسجيل الدخول..." : "دخول"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            إنشاء حساب جديد
          </Link>
        </p>
      </Card>
    </div>
  );
}
