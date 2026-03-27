import { NextResponse } from "next/server";
import { prisma } from "@/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, caseId, donorId, paymentMethod = "bank_transfer" } = body;

    // 1. التحقق من صحة البيانات
    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "مبلغ التبرع غير صحيح" }, { status: 400 });
    }

    // 2. التحقق من صحة الحالة (الدين) ومقدار المتبقي
    const debtCase = await prisma.debtRequest.findUnique({
      where: { id: caseId },
      include: { payments: true }
    });

    if (!debtCase || debtCase.status !== "approved") {
      return NextResponse.json({ success: false, error: "الطلب غير متاح للتبرع" }, { status: 400 });
    }

    const debtAmount = Number(debtCase.debtAmount);
    const totalPaid = debtCase.payments.reduce((acc, curr) => acc + Number(curr.amountPaid), 0);
    const remaining = debtAmount - totalPaid;

    if (amount > remaining) {
      return NextResponse.json({ 
        success: false, 
        error: `المبلغ يتجاوز المتبقي. المتبقي فقط هو ${remaining.toLocaleString()} د.ع` 
      }, { status: 400 });
    }

    // 3. إنشاء العملية في إطار تعامل واحد (Transaction) لضمان عدم حدوث تضارب
    const result = await prisma.$transaction(async (tx) => {
      // أ. تسجيل التبرع في جدول Donation (باسم المتبرع إن وجد)
      const donation = await tx.donation.create({
        data: {
          requestId: caseId,
          amount: amount,
          type: "direct",
          paymentStatus: "completed", // نعتبره مكتملاً حالياً لأغراض المحاكاة
          donorId: donorId || "anonymous", // في حال كان المتبرع مجهولاً نتعامل مع معرف عام
        }
      });

      // ب. تسجيل دفعة (Payment) لصالح الدائن ليتم إضافتها في حسابات الحالة
      const payment = await tx.payment.create({
        data: {
          requestId: caseId,
          amountPaid: amount,
          paidToCreditor: debtCase.creditorAccount || "حساب الدائن مسجل لدينا",
          paymentMethod: paymentMethod,
        }
      });

      // ج. التحقق مما إذا كان هذا التبرع سيسدد كامل المبلغ المتبقي، وإذا كان كذلك نغلق الحالة
      const isCompletelyPaid = (remaining - amount) <= 0;
      if (isCompletelyPaid) {
        await tx.debtRequest.update({
          where: { id: caseId },
          data: { status: "paid" }
        });
      }

      return { donation, payment, isCompletelyPaid };
    });

    return NextResponse.json({ 
      success: true, 
      message: "تم تسجيل التبرع بنجاح",
      isCompletelyPaid: result.isCompletelyPaid
    });

  } catch (error) {
    console.error("Donation processing error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ غير متوقع أثناء معالجة التبرع" },
      { status: 500 }
    );
  }
}
