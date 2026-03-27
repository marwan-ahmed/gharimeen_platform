import { NextResponse } from "next/server";
import { prisma } from "@/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, email, role } = body;

    // التحقق من وصول البيانات المطلوبة
    if (!uid || !email || !role) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "بيانات التسجيل مفقودة" } },
        { status: 400 }
      );
    }

    if (role === "donor") {
      // للمتبرع: لا نحتاج سوى المعرّف (uid) والبريد الإلكتروني לפי الـ Schema الحالية
      const existingDonor = await prisma.donor.findUnique({ where: { id: uid } });
      
      if (!existingDonor) {
        await prisma.donor.create({
          data: {
            id: uid,
            email: email,
          },
        });
      }
    } else if (role === "gharim") {
      // للغارم: الـ Schema للموديل (Gharim) تتطلب حقوق إلزامية مثل الاسم، الرقم الوطني، العنوان، ورقم الهاتف.
      // لذلك لا يمكننا إنشاء السجل هنا بمعلومات البريد الإلكتروني فقط. 
      // سيتم تأجيل إنشاء السجل لمرحلة تعبئة "نموذج تقديم الطلب" (Apply Form)
      // ولكن حساب الفايربيس (Auth) موجود وحقيقي.
      console.log(`Gharim user ${uid} authenticated. Pending DB record creation in /apply.`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Register API Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ أثناء حفظ المستخدم في قاعدة البيانات" } },
      { status: 500 }
    );
  }
}
