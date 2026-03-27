"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";

interface DonationFormProps {
  caseId: string;
  remainingAmount: number;
}

export default function DonationForm({ caseId, remainingAmount }: DonationFormProps) {
  const [amount, setAmount] = useState<number | "">("");
  const router = useRouter();

  const quickAmounts = [
    { label: "10,000 د.ع", value: 10000 },
    { label: "25,000 د.ع", value: 25000 },
    { label: "50,000 د.ع", value: 50000 },
    { label: "100,000 د.ع", value: 100000 },
  ];

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/,/g, ""));
    if (isNaN(val)) {
      setAmount("");
    } else {
      // لا نسمح بالتبرع بأكثر من المتبقي
      setAmount(val > remainingAmount ? remainingAmount : val);
    }
  };

  const handleDonate = () => {
    if (!amount || amount <= 0) {
      alert("يرجى إدخال مبلغ التبرع.");
      return;
    }
    // التنقل إلى صفحة Checkout مع تمرير المعطيات
    router.push(`/checkout?caseId=${caseId}&amount=${amount}`);
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-outline-variant space-y-6">
      <h3 className="text-xl font-bold text-on-surface">اختر مبلغ التبرع لتفريج هذه الكربة</h3>
      
      {/* الأزرار السريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickAmounts.map((q) => {
          const isSelected = amount === q.value;
          const isDisabled = q.value > remainingAmount;
          return (
            <button
              key={q.value}
              disabled={isDisabled}
              onClick={() => setAmount(q.value)}
              className={`p-3 rounded-xl border text-sm font-bold transition-all
                ${isDisabled ? 'opacity-40 cursor-not-allowed bg-surface-container-highest border-transparent text-on-surface-variant' : 
                  isSelected 
                    ? 'border-primary bg-primary-container text-on-primary-container' 
                    : 'border-outline-variant hover:border-primary hover:text-primary bg-transparent text-on-surface'
                }`}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 py-2">
         <div className="flex-grow h-px bg-outline-variant"></div>
         <span className="text-xs text-on-surface-variant font-medium">أو أدخل مبلغاً مخصصاً</span>
         <div className="flex-grow h-px bg-outline-variant"></div>
      </div>

      {/* حقل إدخال مخصص */}
      <div>
        <Input 
          type="text"
          label="مبلغ التبرع بالدينار العراقي" 
          value={amount ? amount.toLocaleString('en-US') : ""}
          onChange={handleCustomAmountChange}
          placeholder="مثال: 15,000"
        />
        <p className="text-xs text-on-surface-variant mt-2">
          الدين المتبقي: {remainingAmount.toLocaleString('en-US')} دينار عراقي
        </p>
      </div>

      <div className="space-y-3 pt-4">
        <Button 
          variant="primary" 
          className="w-full text-lg h-14 shadow-md"
          onClick={handleDonate}
          disabled={!amount || amount <= 0}
        >
          {amount ? `تبرع بمبلغ ${amount.toLocaleString()} د.ع الآن` : "اختر مبلغاً للتبرع"}
        </Button>

        <Button 
          variant="secondary" 
          className="w-full h-12"
          onClick={() => setAmount(remainingAmount)}
          disabled={remainingAmount <= 0}
        >
          سداد كلي وإغلاق الملف (التكفل بالمتبقي)
        </Button>
      </div>
      
      <p className="text-xs text-center text-on-surface-variant pt-2 flex items-center justify-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        مدفوعاتك محمية وموجهة مباشرة لحساب الدائن
      </p>
    </div>
  );
}