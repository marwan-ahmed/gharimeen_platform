import { prisma } from "@/db";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "حالات الغارمين | منصة الغارمين",
  description: "تصفح حالات الغارمين المعتمدة وساهم في تفريج كربهم",
};

// Next.js Server Component لجلب البيانات بسرعة وحمايتها من جهة الخادم
export default async function CasesExplorerPage() {
  // جلب جميع الطلبات التي حالتها "مقبول - approved" مع المدفوعات وبدائل بيانات الغارم
  const approvedCases = await prisma.debtRequest.findMany({
    where: {
      status: "approved",
    },
    include: {
      payments: true,
      gharim: {
        select: {
          familyMembers: true,
          address: true, // قد نستخدم مقطعاً من العنوان لتحديد المنطقة
        }
      }
    },
    orderBy: {
      createdAt: 'asc', // الأقدم أولاً ليكون لهم أولوية السداد
    }
  });

  return (
    <div className="min-h-screen bg-surface p-4 sm:p-8">
      <main className="max-w-6xl mx-auto space-y-10">
        
        {/* الترويسة العليا للمتبرعين */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-3xl md:text-4xl font-black text-primary">المساهمة في تفريج الكرب</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            جميع الحالات المعروضة هنا تمت دراستها والتحقق منها من قبل لجاننا المختصة.
            مساهمتك تذهب مباشرة لسداد الدين عبر حسابات الدائنين لضمان الشفافية.
          </p>
        </div>

        {/* صندوق التبرع العام (General Fund) */}
        <Card elevation="low" className="p-6 bg-secondary-container text-on-secondary-container md:flex md:items-center md:justify-between border-none">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              صندوق الغارمين العام
            </h2>
            <p className="text-sm mt-1 opacity-90">
              دعنا نختار الحالة الأشد حاجة بالنيابة عنك ونسدد عنها. تبرعك هنا يوزع بمرونة على ملفات متعددة.
            </p>
          </div>
          <Link href="/cases/general-fund" className="block mt-4 md:mt-0">
            <Button variant="primary" className="whitespace-nowrap px-8 w-full md:w-auto">
              تبرع للصندوق العام
            </Button>
          </Link>
        </Card>

        {/* شبكة الحالات المعروضة */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-outline-variant pb-2">
            <h2 className="text-2xl font-bold text-on-surface">الحالات قيد التبرع ({approvedCases.length})</h2>
            {/* هنا يمكن إضافة أزرار فلترة مستقبلاً */}
          </div>

          {approvedCases.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-on-surface-variant font-medium">بفضل الله، لا توجد حالات معتمدة تنتظر السداد حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedCases.map((req) => {
                const debtAmount = Number(req.debtAmount);
                const totalPaid = req.payments.reduce((acc, curr) => acc + Number(curr.amountPaid), 0);
                const remainingAmount = debtAmount - totalPaid;
                const progressPercentage = Math.min((totalPaid / debtAmount) * 100, 100);

                return (
                  <Card key={req.id} elevation="low" className="flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="p-5 flex-grow">
                      
                      {/* معلومات الحالة المجهولة (لحفظ الكرامة) */}
                      <div className="mb-4">
                        <span className="inline-block bg-primary-container text-on-primary-container text-xs px-2 py-1 rounded font-bold mb-2">
                          حالة #{req.id.slice(0, 5)}
                        </span>
                        <h3 className="text-lg font-bold text-on-surface">
                          سداد دين عن {req.gharim?.familyMembers ? `لأسرة تتكون من ${req.gharim.familyMembers} أفراد` : 'شخص متعفف'}
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                          الدين مستحق لصالح ({req.creditorName})، ونأمل بمساهمتكم الكريمة لإغلاق هذا الملف نهائياً.
                        </p>
                      </div>

                      {/* إحصائيات المبالغ */}
                      <div className="space-y-2 mt-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-on-surface-variant">المبلغ الكلي</span>
                          <span className="font-bold">{debtAmount.toLocaleString('en-US')} د.ع</span>
                        </div>
                        
                        <div className="w-full bg-surface-container-highest rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-primary h-3 transition-all duration-500 rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-primary">مُحصل: {totalPaid.toLocaleString()} د.ع ({Math.round(progressPercentage)}%)</span>
                          <span className="text-error">المتبقي: {remainingAmount.toLocaleString()} د.ع</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 border-t border-outline-variant bg-surface-container-lowest">
                      <Link href={`/cases/${req.id}`} className="block w-full">
                        <Button variant="primary" className="w-full h-12 text-base shadow-sm">
                          ساهم في السداد
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}