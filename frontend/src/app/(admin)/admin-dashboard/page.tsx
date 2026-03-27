"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface RequestItem {
  id: string;
  status: string;
  debtAmount: string;
  creditorName: string;
  description: string;
  createdAt: string;
  gharim: {
    fullName: string;
    phone: string;
    nationalId: string;
    familyMembers: number;
    monthlyIncome: string;
  };
  _count: {
    donations: number;
  };
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("pending"); // pending, approved, rejected, all
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    // Note: In a real world app, we would verify the user role here is 'admin' 
    // Right now, any authenticated user can view it for demo purposes, 
    // but in production, we should lock this route.
    if (!loading && !user) {
      router.push("/login?redirect=/admin-dashboard");
    }
  }, [user, loading, router]);

  const fetchRequests = async (statusFilter: string) => {
    setFetching(true);
    setError(null);
    try {
      const url = statusFilter === 'all' 
        ? `/api/admin/requests` 
        : `/api/admin/requests?status=${statusFilter}`;
        
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setRequests(json.data);
      } else {
        setError(json.error?.message || "حدث خطأ في عرض الطلبات");
      }
    } catch (err) {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests(filter);
    }
  }, [user, filter]);

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في تحويل الحالة إلى ${newStatus}؟`)) return;
    
    setUpdatingId(requestId);
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: newStatus })
      });
      const json = await res.json();
      
      if (json.success) {
        // تحديث الواجهة محلياً لإزالة/تعديل الطلب
        setRequests(prev => 
          filter === 'all' 
            ? prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r)
            : prev.filter(r => r.id !== requestId)
        );
      } else {
        alert(json.error?.message || 'فشل التحديث');
      }
    } catch (err) {
      alert('خطأ في الاتصال');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-on-surface-variant animate-pulse">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-4 sm:p-8">
      <main className="max-w-7xl mx-auto space-y-6">
        
        {/* رأس اللوحة والفلترة */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-primary text-on-primary p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold">لوحة إدارة المنصة (Admin)</h1>
            <p className="text-primary-100 mt-1">
              مراجعة وتدقيق طلبات الغارمين قبل نشرها للعامة.
            </p>
          </div>
          <div className="flex bg-white/20 p-1 rounded-lg p-1 gap-1">
            <button 
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md transition-colors text-sm font-bold ${filter === 'pending' ? 'bg-white text-primary shadow' : 'text-white hover:bg-white/10'}`}
            >
              قيد المراجعة
            </button>
            <button 
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-md transition-colors text-sm font-bold ${filter === 'approved' ? 'bg-white text-primary shadow' : 'text-white hover:bg-white/10'}`}
            >
              المعتمدة
            </button>
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition-colors text-sm font-bold ${filter === 'all' ? 'bg-white text-primary shadow' : 'text-white hover:bg-white/10'}`}
            >
              الكل
            </button>
          </div>
        </div>

        {/* عرض الطلبات */}
        <Card elevation="low" className="overflow-hidden">
          {fetching ? (
            <div className="p-12 text-center text-on-surface-variant">جاري جلب الطلبات...</div>
          ) : error ? (
            <div className="p-12 text-center text-error font-bold">{error}</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">لا توجد طلبات لعرضها في هذا التصنيف.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant">
                  <tr>
                    <th className="p-4 font-semibold">مقدم الطلب</th>
                    <th className="p-4 font-semibold">الرقم الوطني / الدخل</th>
                    <th className="p-4 font-semibold">قيمة الدين / الدائن</th>
                    <th className="p-4 font-semibold">الحالة</th>
                    <th className="p-4 font-semibold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-on-surface">{req.gharim.fullName || "غير محدد"}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">{req.gharim.phone || "لا يوجد هاتف"}</div>
                        <div className="text-xs text-primary bg-primary-container inline-block px-2 py-0.5 rounded-full mt-2">
                          عدد أفراد الأسرة: {req.gharim.familyMembers}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-on-surface mono">{req.gharim.nationalId}</div>
                        <div className="text-xs text-on-surface-variant mt-2">الدخل: <span className="font-bold text-on-surface">{Number(req.gharim.monthlyIncome).toLocaleString()} د.ع</span></div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-error">{Number(req.debtAmount).toLocaleString()} د.ع</div>
                        <div className="text-xs text-on-surface-variant mt-1">الدائن: {req.creditorName}</div>
                        <div className="text-xs text-on-surface-variant mt-1 max-w-[200px] truncate" title={req.description}>التفاصيل: {req.description}</div>
                        <div className="text-xs text-on-surface-variant mt-1">التاريخ: {new Date(req.createdAt).toLocaleDateString('ar-IQ')}</div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {req.status === 'pending' && <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">قيد المراجعة</span>}
                        {req.status === 'approved' && <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">معتمد (معروض)</span>}
                        {req.status === 'rejected' && <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 font-medium">مرفوض</span>}
                        {req.status === 'paid' && <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-bold">تم السداد</span>}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col gap-2 justify-center items-center">
                          {req.status === 'pending' && (
                            <>
                              <Button 
                                variant="primary" 
                                className="w-full text-xs h-8"
                                disabled={updatingId === req.id}
                                onClick={() => handleUpdateStatus(req.id, 'approved')}
                              >
                                إعتماد النشر
                              </Button>
                              <Button 
                                variant="tertiary" 
                                className="w-full text-xs h-8 border-error text-error hover:bg-error-container hover:text-on-error-container"
                                disabled={updatingId === req.id}
                                onClick={() => handleUpdateStatus(req.id, 'rejected')}
                              >
                                رفض الطلب
                              </Button>
                            </>
                          )}
                          {(req.status === 'approved' || req.status === 'rejected') && (
                            <Button 
                              variant="secondary" 
                              className="w-full text-xs h-8"
                              disabled={updatingId === req.id}
                              onClick={() => handleUpdateStatus(req.id, 'pending')}
                            >
                              إعادة للقيد
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      </main>
    </div>
  );
}