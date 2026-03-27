import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { GharimApplicationSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, ...data } = body;

    // 1. التأكد أن المستخدم مسجل في الفايربيس (uid موجود)
    if (!uid) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "غير مصرح — يرجى تسجيل الدخول" } },
        { status: 401 }
      );
    }

    // 2. التحقق من صحة المدخلات (Zod)
    const validData = GharimApplicationSchema.parse(data);

    // 3. التحقق من قاعدة الأعمال الجوهرية (BR-001): يمنع التكرار! الغارم يجب ألا يكون لديه طلب نشط
    // سنبحث أولاً عن هل يوجد غارم بنفس المعرّف أو الرقم الوطني
    const existingGharim = await prisma.gharim.findFirst({
      where: {
        OR: [
          { id: uid },
          { nationalId: validData.nationalId }
        ]
      },
      include: {
        debtRequests: {
          where: {
            status: { in: ["pending", "approved"] }
          }
        }
      }
    });

    if (existingGharim && existingGharim.debtRequests.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: "ACTIVE_CASE_EXISTS", message: "لديك حالة نشطة بالفعل، لا يمكن تقديم طلب جديد" } },
        { status: 400 }
      );
    }

    // 4. العمليات المتعددة في Transaction واحد لضمان الأمان
    const result = await prisma.$transaction(async (tx) => {
      let gharimId = existingGharim?.id;

      // إذا لم يكن الغارم موجوداً في الداتا بيس، ننشئه لأول مرة
      if (!gharimId) {
        const newGharim = await tx.gharim.create({
          data: {
            id: uid, // يجب أن يكون متطابق مع Firebase UID
            fullName: validData.fullName,
            nationalId: validData.nationalId,
            phone: validData.phone,
            address: validData.address,
            familyMembers: validData.familyMembers,
            monthlyIncome: validData.monthlyIncome,
            guarantorName: validData.guarantorName,
            guarantorPhone: validData.guarantorPhone,
          }
        });
        gharimId = newGharim.id;
      }

      // إنشاء طلب الدين الجديد (Pending by default)
      const newRequest = await tx.debtRequest.create({
        data: {
          gharimId: gharimId,
          creditorName: validData.creditorName,
          creditorPhone: validData.creditorPhone,
          creditorAccount: validData.creditorAccount,
          debtAmount: validData.debtAmount,
          documentType: validData.documentType,
          documentUrl: validData.documentUrl,
          status: "pending",
        }
      });

      return newRequest;
    });

    return NextResponse.json({ 
      success: true, 
      data: { requestId: result.id, message: "تم تسجيل الطلب بنجاح وهو قيد المراجعة" } 
    });

  } catch (error: any) {
    console.error("Gharim Apply Error:", error);
    
    // إذا كان الخطأ من Zod Validation
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "البيانات المدخلة غير صحيحة", details: error.errors } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ داخلي أثناء معالجة الطلب" } },
      { status: 500 }
    );
  }
}
