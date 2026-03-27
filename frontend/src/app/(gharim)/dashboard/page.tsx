"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Payment {
  id: string;
  amountPaid: string;
  paidAt: string;
}

interface DebtCase {
  id: string;
  debtAmount: string;
  creditorName: string;
  status: "pending" | "approved" | "rejected" | "paid" | "archived";
  createdAt: string;
  payments: Payment[];
}

interface DashboardData {
  gharim: {
    fullName: string;
    phone: string;
    nationalId: string;
    address: string;
    monthlyIncome: string | null;
    familyMembers: number | null;
  } | null;
  debtRequests: DebtCase[];
}

export default function GharimDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData(user.uid);
    }
  }, [user]);

  const fetchDashboardData = async (uid: string) => {
    try {
      const res = await fetch(`/api/gharimeen/dashboard?uid=${uid}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error?.message || "حدث خطأ");
      }
    } catch (err) {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setFetching(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-on-surface-variant animate-pulse">جاري تحميل الملف الشخصي...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Card className="text-center p-6 bg-error-container text-on-error-container">
          <p>{error}</p>
          <Button variant="tertiary" className="mt-4" onClick={() => window.location.reload()}>إعادة المحاولة</Button>
        </Card>
      </div>
    );
  }

  const statusMap = {
    pending: { label: "قيد التدقيق والتحقق", color: "bg-amber-100 text-amber-800" },
    approved: { label: "معتمد (قيد الجمع السداد)", color: "bg-emerald-100 text-emerald-800" },
    rejected: { label: "تم الرفض", color: "bg-red-100 text-red-800" },
    paid: { label: "ذمة بريئة (تم السداد)", color: "bg-blue-100 text-blue-800" },
    archived: { label: "مؤرشف", color: "bg-gray-100 text-gray-800" }
  };

  const activeCase = data?.debtRequests.find(r => ["pending", "approved", "paid"].includes(r.status));
  const hasActiveCase = !!activeCase;

  return (
    <div className="min-h-screen bg-surface p-4 sm:p-8">
      <main className="max-w-5xl mx-auto space-y-6">
        
        {/* الترحيب وتلخيص الحالة */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-primary text-on-primary p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold">لوحة تحكم المستفيد</h1>
            <p className="text-primary-container mt-1 opacity-90">
              {data?.gharim ? "إدارة ملفك المالي والتسديدات" : "يرجى استكمال إعداد ملفك الشخصي"}
            </p>
          </div>
          {!hasActiveCase && (
            <Link href="/apply">
              <Button variant="secondary" className="bg-surface text-primary hover:bg-surface-container">
                {data?.gharim ? "توثيق مديونية جديدة" : "إنشاء الملف المالي"}
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* العمود الجانبي: تفاصيل الحساب والملف الشخصي */}
          <div className="lg:col-span-1 space-y-6">
            <Card elevation="low" className="p-6">
              <h2 className="text-lg font-bold text-on-surface mb-4 border-b border-outline-variant pb-2">بيانات الحساب</h2>
              <div className="space-y-4">
                <div>
                  <span className="block text-xs text-on-surface-variant mb-1">البريد الإلكتروني للولوج</span>
                  <span className="font-mono text-sm font-medium">{user?.email}</span>
                </div>
                <div>
                  <span className="block text-xs text-on-surface-variant mb-1">حالة الحساب الجانبي</span>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-bold">
                    موثق
                  </span>
                </div>
              </div>
            </Card>

            {data?.gharim && (
              <Card elevation="low" className="p-6">
                <div className="flex justify-between items-center border-b border-outline-variant pb-2 mb-4">
                  <h2 className="text-lg font-bold text-on-surface">معلومات الملف الشخصي</h2>
                  <Button variant="tertiary" className="text-xs px-2 py-1 h-auto" onClick={() => alert('التعديل سيتوفر قريباً')}>تعديل</Button>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="block text-xs text-on-surface-variant">الاسم الرباعي</span>
                    <span className="font-medium">{data.gharim.fullName}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant">الرقم الوطني / البطاقة الموحدة</span>
                    <span className="font-mono">{data.gharim.nationalId}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant">رقم الهاتف النشط</span>
                    <span className="font-mono">{data.gharim.phone}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant">عنوان السكن الأساسي</span>
                    <span>{data.gharim.address}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     <div>
                       <span className="block text-xs text-on-surface-variant">الدخل الشهري</span>
                       <span>{data.gharim.monthlyIncome ? `${Number(data.gharim.monthlyIncome).toLocaleString()} د.ع` : 'لا يوجد'}</span>
                     </div>
                     <div>
                       <span className="block text-xs text-on-surface-variant">أفراد الأسرة</span>
                       <span>{data.gharim.familyMembers || 0} فرد</span>
                     </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* العمود الرئيسي: الموقف المالي (المديونية) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-on-surface">الموقف الحالي للمديونية</h2>
            
            {!data?.gharim || data.debtRequests.length === 0 ? (
              <Card elevation="lowest" className="text-center py-16 border-dashed border-2">
                <div className="w-16 h-16 mx-auto bg-surface-container rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">لا يوجد ملف مديونية نشط</h3>
                <p className="text-on-surface-variant mb-6 max-w-sm mx-auto">
                  من يسر على معسر يسر الله عليه. يمكنك الآن توثيق حالة مديونيتك لتقوم اللجان بمراجعتها والبدء بالسداد.
                </p>
                <Link href="/apply">
                  <Button variant="primary">توثيق حالة مديونية لدائن</Button>
                </Link>
              </Card>
            ) : (
               // عرض المديونية النشطة كبطاقة بارزة
               data.debtRequests.map((req) => {
                const debtAmount = Number(req.debtAmount);
                const totalPaid = req.payments.reduce((acc, curr) => acc + Number(curr.amountPaid), 0);
                const progressPercentage = Math.min((totalPaid / debtAmount) * 100, 100);
                const statusInfo = statusMap[req.status];
                const isActive = req.status === 'pending' || req.status === 'approved' || req.status === 'paid';
                
                if (!isActive) return null; // نعرض فقط الحالة النشطة هنا أو في سجل مستقل

                return (
                  <Card key={req.id} elevation="low" className={`p-0 overflow-hidden ${req.status === 'paid' ? 'border-2 border-emerald-500' : ''}`}>
                    <div className="p-6 bg-surface-container-lowest">
                      {req.status === 'paid' && (
                        <div className="bg-emerald-500 text-white text-center py-2 -mx-6 -mt-6 mb-6 font-bold text-sm">
                          🎉 الحمد لله! تم سداد هذه المديونية بالكامل وتم إبراء الذمة 🎉
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-6 border-b border-outline-variant pb-4">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${statusInfo.color}`}>
                            الدائن: {req.creditorName} | {statusInfo.label}
                          </span>
                          <h3 className="text-2xl font-black text-on-surface">إجمالي الدين: {debtAmount.toLocaleString('en-US')} د.ع</h3>
                          <p className="text-sm text-on-surface-variant mt-1">تاريخ فتح الملف المالي: {new Date(req.createdAt).toLocaleDateString('ar-IQ')}</p>
                        </div>
                        <div className="text-left font-mono text-xs text-on-surface-variant">
                          معرف: #{req.id.slice(0, 8)}
                        </div>
                      </div>

                      {/* شريط السداد التفصيلي */}
                      <div className="space-y-3 bg-surface p-4 rounded-xl border border-surface-container-high">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-on-surface">نسبة الإنجاز من السداد</span>
                          <span className="font-bold text-primary">{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full bg-surface-container-highest rounded-full h-4 overflow-hidden relative">
                          <div 
                            className={`h-4 transition-all duration-1000 ease-out rounded-full ${req.status === 'paid' ? 'bg-emerald-500' : 'bg-primary'}`}
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="text-emerald-700 font-semibold">المسدد: {totalPaid.toLocaleString()} د.ع</div>
                          <div className="text-amber-700 font-semibold">المتبقي: {(debtAmount - totalPaid).toLocaleString()} د.ع</div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex flex-wrap gap-3">
                         <Link href={`/status/${req.id}`}>
                            <Button variant="secondary">متابعة الإجراءات ومسار الملف</Button>
                         </Link>
                         {req.status === 'pending' && (
                           <Button variant="tertiary" onClick={() => alert('ستتمكن قريباً من إرفاق مستندات إضافية وتحديث القيمة.')}>تحديث بيانات المديونية</Button>
                         )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}

            {/* الأرشيف والحالات السابقة */}
            {data?.debtRequests && data.debtRequests.filter(r => r.status === 'archived' || r.status === 'rejected').length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-on-surface mb-4">الأرشيف والسجل التاريخي</h3>
                <div className="grid gap-4">
                  {data.debtRequests.filter(r => r.status === 'archived' || r.status === 'rejected').map(req => (
                    <Card key={req.id} className="p-4 flex justify-between items-center opacity-75">
                      <div>
                        <p className="font-semibold text-sm">مديونية الدائن ({req.creditorName})</p>
                        <p className="text-xs text-on-surface-variant">{new Date(req.createdAt).toLocaleDateString('ar-IQ')}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusMap[req.status].color}`}>
                        {statusMap[req.status].label}
                      </span>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
