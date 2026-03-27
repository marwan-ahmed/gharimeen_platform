"use client";

import React, { useState, Suspense } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // جلب وتوثيق دور المستخدم من قاعدة البيانات وتعيين كوكيز الحماية
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userCredential.user.uid }),
      });
      const verifyData = await verifyRes.json();
      
      // توجيه ذكي: نتحقق إذا كان هناك مسار قادم منه
      let redirectUrl = searchParams.get("redirect");
      
      if (!redirectUrl) {
        if (verifyData.role === "admin") redirectUrl = "/admin-dashboard";
        else if (verifyData.role === "donor") redirectUrl = "/donor-dashboard";
        else redirectUrl = "/dashboard";
      }

      router.push(redirectUrl);
    } catch (err: any) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Card elevation="lowest" className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">تسجيل الدخول</h1>
        <Suspense fallback={<p className="text-center text-on-surface-variant">جاري التحميل...</p>}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
