import { z } from "zod";

// نموذج تقديم الغارم (المعلومات الشخصية)
export const GharimApplicationSchema = z.object({
  fullName: z.string().min(4, "الاسم يجب أن يكون 4 أحرف على الأقل"),
  nationalId: z.string().length(12, "رقم الهوية يجب أن يكون 12 رقماً"),
  phone: z.string().regex(/^07[0-9]{9}$/, "رقم الهاتف يجب أن يبدأ بـ 07 ويتكون من 11 رقماً"),
  address: z.string().min(10, "العنوان يجب أن يكون 10 أحرف على الأقل"),
  familyMembers: z.number().int().min(1, "يجب تحديد عدد أفراد الأسرة").max(20, "عدد أفراد الأسرة غير منطقي"),
  monthlyIncome: z.number().nonnegative().optional(),
  guarantorName: z.string().optional(),
  guarantorPhone: z.string().optional(),
  
  // معلومات الدّين
  creditorName: z.string().min(4, "اسم الدائن يجب أن يكون 4 أحرف على الأقل"),
  creditorPhone: z.string().min(10, "رقم هاتف الدائن مطلوب"),
  creditorAccount: z.string().min(5, "الحساب البنكي / المحفظة الإستلام للدائن مطلوب (BR-002: وجهة الدفع الوحيدة)"),
  debtAmount: z.number().positive("قيمة الدين يجب أن تكون أكبر من الصفر"),
  documentType: z.enum(["court_order", "contract", "bank_receipt", "written_testimony"], {
    message: "يجب اختيار نوع الوثيقة",
  }),
  documentUrl: z.string().url("يجب إرفاق رابط صحيح للوثيقة المرفقة"),
});

export type GharimApplicationData = z.infer<typeof GharimApplicationSchema>;
