"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface RequestDetails {
  id: string;
  status: string;
  debtAmount: string;
  creditorName: string;
  gharim: {
    familyMembers: number | null;
  } | null;
}

interface Donation {
  id: string;
  amount: string;
  type: string;
  paymentStatus: string;
  createdAt: string;
  request: RequestDetails | null;
}

interface DonorStats {
  totalDonated: number;
  uniqueCasesHelped: number;
}

interface DashboardData {
  donor: {
    name: string | null;
    email: string;
    phone: string | null;
  } | null;
  stats: DonorStats;
  donations: Donation[];
}

export default function DonorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/donor-dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData(user.uid);
    }
  }, [user]);

  const fetchDashboardData = async (uid: string) => {
    try {
      const res = await fetch(`/api/donor/dashboard?uid=${uid}`);
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
        <p className="text-on-surface-variant animate-pulse">جاري تحميل سجل الحسنات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <Card className="text-center p-6 bg-error-container text-on-error-container max-w-md w-full">
          <p>{error}</p>
          <Button variant="tertiary" className="mt-4" onClick={() => window.location.reload()}>إعادة المحاولة</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-4 sm:p-8">
      <main className="max-w-5xl mx-auto space-y-6">
        
        {/* الترحيب بالمتبرع */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-700 text-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold">مرحباً بك يا باغي الخير</h1>
            <p className="text-emerald-100 mt-1">
              "وَمَا أَنفَقْتُم مِّن شَيْءٍ فَهُوَ يُخْلِفُهُ ۖ وَهُوَ خَيْرُ الرَّازِقِينَ"
            </p>
          </div>
          <Link href="/cases">
            <Button variant="secondary" className="bg-white text-emerald-800 hover:bg-emerald-50">
              تصفح حالات جديدة
            </Button>
          </Link>
        </div>

        {/* بطاقات الإحصائيات (الأثر) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card elevation="low" className="p-6 flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant font-medium">إجمالي التبرعات المحتسبة</p>
              <h2 className="text-3xl font-black text-on-surface">{data?.stats.totalDonated.toLocaleString('en-US')} <span className="text-base font-normal">د.ع</span></h2>
            </div>
          </Card>
          
          <Card elevation="low" className="p-6 flex items-center gap-4 border-l-4 border-l-primary">
            <div className="p-3 bg-primary-container text-on-primary-container rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant font-medium">عدد الحالات أو الأسر المدعومة</p>
              <h2 className="text-3xl font-black text-on-surface">{data?.stats.uniqueCasesHelped} <span className="text-base font-normal text-on-surface-variant">حالة</span></h2>
            </div>
          </Card>
        </div>

        {/* سجل التبرعات */}
        <div>
          <h2 className="text-xl font-bold text-on-surface mb-4">سجل تبرعاتك (كشف الحساب)</h2>
          
          {!data?.donations || data.donations.length === 0 ? (
            <Card elevation="lowest" className="text-center py-12 border-dashed border-2">
              <p className="text-on-surface-variant mb-4">لم تقم بأي تبراعات مسجلة في حسابك بعد.</p>
              <Link href="/cases">
                 <Button variant="primary">ابدأ بعطائك الأول</Button>
              </Link>
            </Card>
          ) : (
            <Card elevation="low" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant">
                    <tr>
                      <th className="p-4 font-semibold">تاريخ التبرع</th>
                      <th className="p-4 font-semibold">المبلغ</th>
                      <th className="p-4 font-semibold">الحالة الموجهة لها</th>
                      <th className="p-4 font-semibold">موقف الحالة الآن</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {data.donations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="p-4 whitespace-nowrap text-on-surface-variant">
                          {new Date(donation.createdAt).toLocaleDateString('ar-IQ')}
                        </td>
                        <td className="p-4 whitespace-nowrap font-bold text-primary">
                          {Number(donation.amount).toLocaleString()} د.ع
                        </td>
                        <td className="p-4">
                          {donation.request ? (
                            <Link href={`/cases/${donation.request.id}`} className="hover:text-primary transition-colors flex items-center gap-1">
                              <span className="truncate max-w-[200px] inline-block">
                                تفريج عن {donation.request.gharim?.familyMembers ? `عائلة (${donation.request.gharim.familyMembers} أفراد)` : 'غارم'} 
                              </span>
                              <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full mono">#{donation.request.id.slice(0,5)}</span>
                            </Link>
                          ) : (
                            <span className="text-on-surface-variant italic">صندوق الغارمين العام</span>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {donation.request ? (
                            donation.request.status === 'paid' ? 
                              <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">تم التفريج وإغلاق الملف</span> :
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">قيد الجمع للسداد</span>
                          ) : (
                            <span className="text-xs text-on-surface-variant">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

      </main>
    </div>
  );
}