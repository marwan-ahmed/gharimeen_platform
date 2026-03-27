"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const caseId = searchParams.get("caseId");
  const amountParam = searchParams.get("amount");
  const amount = amountParam ? parseInt(amountParam) : 0;

  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!caseId || amount <= 0) {
    return (
      <div className="text-center p-10">
        <p className="text-error">بيانات الدفع غير صالحة. يرجى العودة لصفحة الحالات.</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push('/cases')}>العودة</Button>
      </div>
    );
  }

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setError(null);

    // محاكاة تأخير بوابة الدفع (زين كاش، اسياسيل المحفظة، إلخ)
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          amount,
          donorId: user?.uid || "anonymous_donor_temp_id", // يجب تعديل النظام لاحقاً لدعم التبرع كزائر
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "فشلت عملية الدفع");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <Card className="text-center p-8 border-2 border-emerald-500 border-dashed">
        <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
           </svg>
        </div>
        <h2 className="text-2xl font-bold text-emerald-800 mb-2">جزاك الله خيراً!</h2>
        <p className="text-on-surface-variant mb-6">
          تم استلام تبرعك بمبلغ {amount.toLocaleString('en-US')} دينار عراقي وستذهب مباشرة لسداد الدين.
          <br/> "صنائع المعروف تقي مصارع السوء"
        </p>
        <Button variant="primary" onClick={() => router.push(`/cases/${caseId}`)}>العودة للحالة</Button>
      </Card>
    );
  }

  return (
    <Card elevation="low" className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-on-surface mb-6 border-b border-outline-variant pb-4">تأكيد عملية التبرع</h1>
      
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-8 text-center">
        <p className="text-sm text-on-surface-variant mb-2">المبلغ المراد التبرع به</p>
        <p className="text-4xl font-black text-primary">{amount.toLocaleString('en-US')} <span className="text-lg font-normal">د.ع</span></p>
        <p className="text-xs text-on-surface-variant mt-3 bg-surface-container inline-block px-3 py-1 rounded-full">
          موجه للحالة رقم: #{caseId.slice(0, 6)}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <h3 className="font-bold text-sm text-on-surface-variant">اختر وسيلة الدفع (محاكاة)</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="border-2 border-primary bg-primary-container/20 rounded-xl p-4 flex items-center gap-3 cursor-pointer">
            <input type="radio" name="payment" defaultChecked className="accent-primary" />
            <span className="font-bold">Zain Cash - زين كاش</span>
          </label>
          <label className="border-2 border-outline-variant rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-primary">
            <input type="radio" name="payment" className="accent-primary" />
            <span className="font-bold">AsiaHawala - آسيا حوالة</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button 
          variant="primary" 
          className="flex-1 h-14 text-lg"
          onClick={handleConfirmPayment}
          disabled={isProcessing}
        >
          {isProcessing ? "جاري المعالجة..." : "تأكيد واستقطاع المبلغ"}
        </Button>
        <Button 
          variant="secondary" 
          className="h-14 px-6"
          onClick={() => router.back()}
          disabled={isProcessing}
        >
          إلغاء
        </Button>
      </div>
    </Card>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-surface p-4 sm:p-8 flex items-center justify-center">
      <main className="w-full max-w-2xl">
        <Suspense fallback={<p className="text-center text-on-surface-variant">جاري تحميل بيانات الدفع...</p>}>
          <CheckoutContent />
        </Suspense>
      </main>
    </div>
  );
}