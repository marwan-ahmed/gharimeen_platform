import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { cookies } from "next/headers";

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
      const existingDonor = await prisma.donor.findUnique({ where: { id: uid } });
      if (!existingDonor) {
        await prisma.donor.create({
          data: { id: uid, email: email },
        });
      }
    } 

    // تخزين الدور كـ Cookie محمي (HttpOnly) لمعرفته في الـ Middleware بأمان
    const cookieStore = await cookies();
    cookieStore.set("user-role", role, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      path: '/', 
      maxAge: 86400 
    });

    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    console.error("Register API Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "حدث خطأ أثناء حفظ المستخدم في قاعدة البيانات" } },
      { status: 500 }
    );
  }
}
