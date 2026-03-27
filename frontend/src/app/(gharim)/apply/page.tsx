"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/providers/AuthProvider";
import { GharimApplicationSchema, type GharimApplicationData } from "@/lib/schemas";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

export default function GharimApplyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // إعداد النموذج مع Zod للتحقق
  const { register, handleSubmit, formState: { errors } } = useForm<GharimApplicationData>({
    resolver: zodResolver(GharimApplicationSchema),
  });

  const onSubmit = async (data: GharimApplicationData) => {
    if (!user) {
      setSubmitError("يجب تسجيل الدخول لتقديم الطلب");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/gharimeen/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, uid: user.uid }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "حدث خطأ أثناء تقديم الطلب");
      }

      // توجيه لصفحة متابعة الحالة أو رسالة نجاح
      router.push(`/status/${result.data.requestId}`);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return <div className="p-8 text-center">جاري التحميل...</div>;
  if (!user) return <div className="p-8 text-center text-red-500">غير مصرح لك بالدخول لهذه الصفحة. (يجب تسجيل الدخول)</div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4 py-12">
      <Card elevation="lowest" className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">تقديم طلب تفريج كربة (غارم)</h1>
          <p className="text-on-surface-variant text-sm">
            يرجى ملء كافة البيانات بدقة والتأكد من إرفاق الإثباتات اللازمة ليتم دراسة حالتك بشكل شفاف.
          </p>
        </div>

        {submitError && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200/50 font-medium">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* القسم الأول: البيانات الشخصية */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-container mb-4 border-b border-surface-container-high pb-2">البيانات الشخصية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Input label="الاسم الرباعي" {...register("fullName")} placeholder="اكتب اسمك الكامل" />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <Input label="الرقم الوطني" {...register("nationalId")} placeholder="12 رقماً" />
                {errors.nationalId && <p className="text-red-500 text-xs mt-1">{errors.nationalId.message}</p>}
              </div>

              <div>
                <Input label="رقم الهاتف" type="tel" {...register("phone")} placeholder="07XXXXXXXXX" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <Input label="العنوان السكني (سامراء)" {...register("address")} placeholder="المنطقة - الشارع - أقرب نقطة دالة" />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>

              <div>
                <Input label="عدد أفراد الأسرة" type="number" {...register("familyMembers", { valueAsNumber: true })} />
                {errors.familyMembers && <p className="text-red-500 text-xs mt-1">{errors.familyMembers.message}</p>}
              </div>

              <div>
                <Input label="الدخل الشهري (دينار عراقي) - اختياري" type="number" {...register("monthlyIncome", { valueAsNumber: true })} />
                {errors.monthlyIncome && <p className="text-red-500 text-xs mt-1">{errors.monthlyIncome.message}</p>}
              </div>
            </div>
          </div>

          {/* القسم الثاني: الدائن والمبلغ */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-container mb-4 border-b border-surface-container-high pb-2">تفاصيل الدّين والدائن</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Input label="اسم الدائن (الشخص أو الجهة)" {...register("creditorName")} placeholder="جهة الطلب" />
                {errors.creditorName && <p className="text-red-500 text-xs mt-1">{errors.creditorName.message}</p>}
              </div>
              <div>
                <Input label="رقم هاتف الدائن" {...register("creditorPhone")} />
                {errors.creditorPhone && <p className="text-red-500 text-xs mt-1">{errors.creditorPhone.message}</p>}
              </div>
              <div className="md:col-span-2">
                <Input label="حساب الدائن المالي أو المحفظة الإلكترونية لغرض الدفع" {...register("creditorAccount")} placeholder="IBAN المالي، أو حساب محفظة زين كاش" />
                <p className="text-xs text-on-surface-variant mt-1">ملاحظة: سيتم تحويل الأموال مباشرة لهذا الحساب ولا تُسلم للغارم.</p>
                {errors.creditorAccount && <p className="text-red-500 text-xs mt-1">{errors.creditorAccount.message}</p>}
              </div>
              <div className="md:col-span-2">
                <Input label="مبلغ الدّين (دينار عراقي)" type="number" {...register("debtAmount", { valueAsNumber: true })} />
                {errors.debtAmount && <p className="text-red-500 text-xs mt-1">{errors.debtAmount.message}</p>}
              </div>
            </div>
          </div>

          {/* الثبوتيات */}
          <div>
             <h2 className="text-xl font-semibold text-secondary-container mb-4 border-b border-surface-container-high pb-2">الثبوتيات (المستندات)</h2>
             <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-start text-sm font-semibold text-on-surface-variant mb-1.5">نوع الوثيقة</label>
                  <select 
                    {...register("documentType")} 
                    className="flex h-12 w-full rounded-md bg-surface-container-high px-3 py-2 text-sm text-on-background outline-none border-b-2 border-transparent focus:bg-surface-container-lowest focus:border-secondary"
                  >
                    <option value="">-- اختر نوع الوثيقة --</option>
                    <option value="court_order">أمر قضائي</option>
                    <option value="contract">عقد موثق</option>
                    <option value="bank_receipt">وصل بنكي/كمبيالة</option>
                    <option value="written_testimony">شهادة خطية للديون العرفية</option>
                  </select>
                  {errors.documentType && <p className="text-red-500 text-xs mt-1">{errors.documentType.message}</p>}
                </div>

                <div>
                  <Input label="رابط الوثيقة المرفوعة" {...register("documentUrl")} placeholder="https://..." />
                  <p className="text-xs text-on-surface-variant/80 mt-1">
                    (في الإصدار القادم سيتم توفير رفع الملفات برمجياً، رجاءً ضع رابطاً مؤقتاً كصورة أو درايف)
                  </p>
                  {errors.documentUrl && <p className="text-red-500 text-xs mt-1">{errors.documentUrl.message}</p>}
                </div>
             </div>
          </div>

          <Button type="submit" className="w-full h-14 text-lg" disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ وإرسال الطلب..." : "تقديم الطلب النهائي"}
          </Button>

        </form>
      </Card>
    </div>
  );
}