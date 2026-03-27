import { NextResponse } from "next/server";
import { prisma } from "@/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { success: false, error: { message: "غير مصرح — يرجى تسجيل الدخول" } },
        { status: 401 }
      );
    }

    // جلب بيانات المتبرع مع كافة تبرعاته وتفاصيل الحالات المرتبطة بها
    const donor = await prisma.donor.findUnique({
      where: { id: uid },
      include: {
        donations: {
          orderBy: { createdAt: 'desc' },
          include: {
            request: {
              select: {
                id: true,
                status: true,
                debtAmount: true,
                creditorName: true,
                gharim: {
                  select: {
                    familyMembers: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!donor) {
      // قد يكون المستخدم سجل للتو ولم يتبرع أو لم يتم مزامنة ملفه بعد
      return NextResponse.json(
        { success: true, data: { donor: null, donations: [] } }
      );
    }

    // حساب الإحصائيات المطلوبة
    const totalDonated = donor.donations.reduce((acc, curr) => acc + Number(curr.amount), 0);
    // تصفية الحالات المتكررة (إذا تبرع لنفس الحالة أكثر من مرة نحسبها حالة واحدة)
    const uniqueCasesHelped = new Set(donor.donations.filter(d => d.requestId).map(d => d.requestId)).size;

    return NextResponse.json({
      success: true,
      data: {
        donor: {
          name: donor.name,
          email: donor.email,
          phone: donor.phone
        },
        stats: {
          totalDonated,
          uniqueCasesHelped
        },
        donations: donor.donations
      }
    });

  } catch (error) {
    console.error("Donor Dashboard Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "حدث خطأ غير متوقع أثناء جلب البيانات" } },
      { status: 500 }
    );
  }
}
