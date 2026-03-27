// في نسخة Next.js الجديدة، params يمكن أن يكون Promise
// لنتعامل معها بشكل استرجاعي
import { prisma } from "@/db";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// دالة لجلب البيانات
async function getRequestStatus(id: string) {
  const request = await prisma.debtRequest.findUnique({
    where: { id },
    include: { gharim: true }
  });
  return request;
}

export default async function RequestStatusPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params; // Next.js 15+ resolution
  const request = await getRequestStatus(params.id);

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <Card elevation="lowest" className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">الطلب غير موجود</h1>
          <p className="text-on-surface-variant mb-6">لم نتمكن من العثور على أي طلب يطابق هذا المعرّف.</p>
          <Link href="/">
             <Button variant="primary">العودة للرئيسية</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // ترجمة الحالة للغة العربية
  const statusMap = {
    pending: { label: "قيد المراجعة", color: "text-amber-600" },
    approved: { label: "تمت الموافقة وهو مُتاح للتبرع", color: "text-emerald-600" },
    rejected: { label: "مرفوض", color: "text-red-600" },
    paid: { label: "تم السداد", color: "text-blue-600" },
    archived: { label: "مؤرشف", color: "text-gray-600" }
  };

  const statusInfo = statusMap[request.status];

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Card elevation="lowest" className="w-full max-w-2xl text-center space-y-6">
        
        {request.status === "pending" && (
          <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        
        <h1 className="text-3xl font-bold text-primary">تم استلام طلبك بنجاح</h1>
        
        <div className="bg-surface-container-low p-6 rounded-xl border border-surface-container-high text-start">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-on-surface-variant">رقم المعاملة (الطلب):</p>
              <p className="font-mono font-medium">{request.id.slice(0,8)}***</p>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">حالة الطلب الآن:</p>
              <p className={`font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">مقدم الطلب:</p>
              <p className="font-semibold">{request.gharim.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">المبلغ المطلوب سداده:</p>
              <p className="font-bold text-secondary-container">
                {Number(request.debtAmount).toLocaleString('en-US')} دينار عراقي
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-on-surface-variant leading-relaxed">
          يرجى الاحتفاظ برابط هذه الصفحة أو رقم المعاملة لمتابعة طلبك.
          <br/>
          فريق الإدارة سيقوم بمراجعة الطلب والثبوتيات المرفوعة قريباً، وسيتم التواصل معك إذا دعت الحاجة.
        </p>

        <div className="pt-4">
           <Link href="/">
             <Button variant="secondary" className="w-full sm:w-auto h-12">
               العودة للصفحة الرئيسية
             </Button>
           </Link>
        </div>
      </Card>
    </div>
  );
}
