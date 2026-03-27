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

    // جلب بيانات الغارم وجميع طلباته مع المدفوعات المتعلقة بها
    const gharim = await prisma.gharim.findUnique({
      where: { id: uid },
      include: {
        debtRequests: {
          orderBy: { createdAt: 'desc' },
          include: {
            payments: true,
          }
        }
      }
    });

    if (!gharim) {
      return NextResponse.json(
        { success: true, data: { gharim: null, debtRequests: [] } }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        gharim, // إرجاع كافة تفاصيل الغارم
        debtRequests: gharim.debtRequests
      }
    });

  } catch (error) {
    console.error("Gharim Dashboard Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "حدث خطأ غير متوقع أثناء جلب البيانات" } },
      { status: 500 }
    );
  }
}
