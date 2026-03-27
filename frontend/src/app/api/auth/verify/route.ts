import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ success: false, error: "No UID provided" }, { status: 400 });
    }

    // 1. نبحث أولاً إذا كان هذا المستخدم "أدمن" (Admin)
    const admin = await prisma.admin.findUnique({ where: { id: uid } });
    if (admin) {
      const cookieStore = await cookies();
      cookieStore.set("user-role", "admin", { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 86400 });
      return NextResponse.json({ success: true, role: "admin" });
    }

    // 2. إذا لم يكن، نبحث إذا كان "متبرع" (Donor)
    const donor = await prisma.donor.findUnique({ where: { id: uid } });
    if (donor) {
      const cookieStore = await cookies();
      cookieStore.set("user-role", "donor", { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 86400 });
      return NextResponse.json({ success: true, role: "donor" });
    }

    // 3. آخر احتمال، سيكون "غارم" (Gharim) - 
    // ملاحظة: قد لا يكون سجل الغارم موجوداً بعد إذا كانت خطوة تقديم الطلب لم تكتمل (فقط تم التسجيل بفايربيس)،
    // لكننا نعطيه الدور الافتراضي للمستفيد حتى يتمكن من الوصول لصفحة /apply
    const cookieStore = await cookies();
    cookieStore.set("user-role", "gharim", { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 86400 });
    return NextResponse.json({ success: true, role: "gharim" });

  } catch (error: any) {
    console.error("Verify Auth Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
