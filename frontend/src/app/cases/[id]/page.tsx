import { prisma } from "@/db";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import DonationForm from "./DonationForm";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تفاصيل حالة غارم | منصة الغارمين",
  description: "ساهم في سداد دين هذه الحالة لتفريج كربتها",
};

export default async function CaseDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  // جلب بيانات الحالة
  const debtCase = await prisma.debtRequest.findUnique({
    where: { id },
    include: {
      payments: true,
      gharim: {
        select: {
          familyMembers: true,
          address: true,
        }
      }
    }
  });

  // التأكد من وجود الحالة وأنها إما مقبولة قابلة للتبرع أو تم سدادها بنجاح
  if (!debtCase || (debtCase.status !== "approved" && debtCase.status !== "paid")) {
    notFound();
  }

  const debtAmount = Number(debtCase.debtAmount);
  const totalPaid = debtCase.payments.reduce((acc, curr) => acc + Number(curr.amountPaid), 0);
  const remainingAmount = debtAmount - totalPaid;
  const progressPercentage = Math.min((totalPaid / debtAmount) * 100, 100);

  const isPaid = debtCase.status === "paid" || remainingAmount <= 0;

  return (
    <div className="min-h-screen bg-surface p-4 sm:p-8">
      <main className="max-w-4xl mx-auto space-y-6">
        
        {/* شريط التنقل */}
        <nav className="text-sm">
          <Link href="/cases" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
             </svg>
             العودة لقائمة الحالات
          </Link>
        </nav>

        {isPaid && (
          <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl font-bold text-center border border-emerald-200 shadow-sm animate-fade-in">
            🎉 بفضل الله ثم بفضل المحسنين، تم سداد هذا الدين بالكامل وإغلاق الملف وإبراء الذمة!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* العمود الأيمن: تفاصيل الحالة والموقف المالي */}
          <div className="lg:col-span-7 space-y-6">
            <Card elevation="low" className="p-6 md:p-8">
              <div className="mb-6 border-b border-outline-variant pb-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block bg-primary-container text-on-primary-container text-xs px-3 py-1.5 rounded-full font-bold">
                    حالة رقم #{debtCase.id.slice(0, 6)}
                  </span>
                  <span className="text-xs text-on-surface-variant">تاريخ النشر: {new Date(debtCase.createdAt).toLocaleDateString('ar-IQ')}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-on-surface leading-tight">
                  تفريج كربة {debtCase.gharim?.familyMembers ? `عائلة مكونة من ${debtCase.gharim.familyMembers} أفراد` : 'شخص متعثر مادياً'}
                </h1>
                <p className="text-on-surface-variant mt-4 leading-relaxed">
                  هذه الحالة تم التحقق منها ميدانياً ومن خلال الأوراق الثبوتية بواسطة لجان المنصة المُختصة. 
                  الغارم متعثر عن سداد دينه المستحق لصالح ({debtCase.creditorName})، وهو مهدد بالملاحقة القانونية.
                  نناشد أهل الخير للمساهمة في إغلاق هذا الملف.
                </p>
              </div>

              {/* موقف المبالغ التفصيلي */}
              <div className="space-y-4">
                <h3 className="font-bold text-on-surface text-lg">الموقف المالي للحالة</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl text-center">
                    <p className="text-xs text-on-surface-variant mb-1">إجمالي الدين المطلوب</p>
                    <p className="text-xl font-black text-on-surface">{debtAmount.toLocaleString('en-US')} <span className="text-sm font-normal">د.ع</span></p>
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl text-center">
                    <p className="text-xs text-on-surface-variant mb-1">ما تم جمعه وسداده</p>
                    <p className="text-xl font-black text-primary">{totalPaid.toLocaleString('en-US')} <span className="text-sm font-normal">د.ع</span></p>
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-on-surface">نسبة الاكتمال</span>
                    <span className="text-primary">{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-4 overflow-hidden relative">
                     <div 
                       className={`h-4 transition-all duration-1000 ease-out rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-primary'}`}
                       style={{ width: `${progressPercentage}%` }}
                     ></div>
                  </div>
                  {!isPaid && (
                    <p className="text-center font-bold text-error mt-4 text-lg">
                      المبلغ المتبقي: {remainingAmount.toLocaleString('en-US')} دينار
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* العمود الأيسر: نموذج التبرع */}
          <div className="lg:col-span-5">
            <div className="sticky top-8">
              {!isPaid ? (
                <DonationForm caseId={debtCase.id} remainingAmount={remainingAmount} />
              ) : (
                <Card elevation="low" className="p-8 text-center bg-surface-container border-2 border-emerald-500 border-dashed">
                  <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-800 mb-2">تم السداد!</h3>
                  <p className="text-on-surface-variant mb-6">
                    شكراً لكل من ساهم في تفريج كربة هذه العائلة. يمكنك تصفح حالات أخرى بحاجة ماسة للمساعدة.
                  </p>
                  <Link href="/cases">
                    <Button variant="primary" className="w-full">تصفح حالات أخرى</Button>
                  </Link>
                </Card>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}