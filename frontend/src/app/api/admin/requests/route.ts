import { NextResponse } from 'next/server';
import { prisma } from '@/db';
import { RequestStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    // تحويل النص إلى Enum الخاص بريسما إذا كان موجوداً
    let whereClause: any = {};
    if (statusParam && ['pending', 'approved', 'rejected', 'paid'].includes(statusParam)) {
      whereClause = { status: statusParam as RequestStatus };
    }

    // جلب كل الطلبات مع بيانات الغارم وتفاصيل المعاملات
    const requests = await prisma.debtRequest.findMany({
      where: whereClause,
      include: {
        gharim: true,
        _count: {
          select: { donations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: requests }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ success: false, error: { message: "فشل في جلب البيانات" } }, { status: 500 });
  }
}

// تحديث حالة الطلب
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { requestId, status } = body;

    if (!requestId || !status) {
      return NextResponse.json({ success: false, error: { message: "معلومات غير مكتملة" } }, { status: 400 });
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ success: false, error: { message: "حالة غير صالحة" } }, { status: 400 });
    }

    const updatedRequest = await prisma.debtRequest.update({
      where: { id: requestId },
      data: { status }
    });

    return NextResponse.json({ success: true, data: updatedRequest }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating request:", error);
    return NextResponse.json({ success: false, error: { message: "فشل في تحديث حالة الطلب" } }, { status: 500 });
  }
}