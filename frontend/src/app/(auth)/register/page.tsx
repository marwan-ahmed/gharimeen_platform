"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type UserRole = "donor" | "gharim";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("donor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // استدعاء API المخصص لنا لحفظ المستخدم في قاعدة بيانات Neon 
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          role: role,
        }),
      });

      if (!response.ok) {
        console.error("Failed to sync user with Neon database");
      }

      // التوجيه بناءً على الهدف من التسجيل
      if (role === "gharim") {
        router.push("/dashboard"); // توجيه الغارم للوحة التحكم لإدارة حسابه وتقديم طلب منه
      } else {
        router.push("/donor-dashboard"); // توجيه المتبرع لوحة تحكم المتبرع
      }
    } catch (err: any) {
      // التعامل مع أخطاء Firebase
      if (err.code === "auth/email-already-in-use") {
        setError("البريد الإلكتروني مستخدم مسبقاً");
      } else if (err.code === "auth/weak-password") {
        setError("كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل.");
      } else {
        setError("حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4 pt-10">
      <Card elevation="lowest" className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary mb-2 text-center">إنشاء حساب</h1>
        <p className="text-center text-sm text-on-surface-variant mb-6">
          انضم إلينا في منصة الغارمين
        </p>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200/50">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-start text-sm font-semibold text-on-surface-variant mb-2">
              ما هو الغرض من التسجيل؟
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("donor")}
                className={cn(
                  "flex h-12 items-center justify-center rounded-lg border-2 transition-colors",
                  role === "donor" 
                    ? "border-secondary bg-surface-container-lowest text-primary font-semibold shadow-sm" 
                    : "border-transparent bg-surface-container-high text-on-surface-variant hover:bg-surface-container-low"
                )}
              >
                أرغب بالتبرع
              </button>
              <button
                type="button"
                onClick={() => setRole("gharim")}
                className={cn(
                  "flex h-12 items-center justify-center rounded-lg border-2 transition-colors",
                  role === "gharim" 
                    ? "border-secondary bg-surface-container-lowest text-primary font-semibold shadow-sm" 
                    : "border-transparent bg-surface-container-high text-on-surface-variant hover:bg-surface-container-low"
                )}
              >
                تقديم طلب سداد (غارم)
              </button>
            </div>
          </div>

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
            placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
          />

          <Button 
            type="submit" 
            className="w-full h-12 text-base mt-4" 
            disabled={loading}
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            تسجيل الدخول هنا
          </Link>
        </p>
      </Card>
    </div>
  );
}
