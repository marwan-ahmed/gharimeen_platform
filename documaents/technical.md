# Technical Reference — منصة الغارمين

## Prisma Schema الكامل

```prisma
model Gharim {
  id             String        @id @default(uuid())
  nationalId     String        @unique  // BR-001: يمنع التكرار
  fullName       String
  phone          String
  address        String
  monthlyIncome  Decimal?
  familyMembers  Int?
  guarantorName  String?
  guarantorPhone String?
  debtRequests   DebtRequest[]
  createdAt      DateTime      @default(now())
}

model DebtRequest {
  id               String        @id @default(uuid())
  gharimId         String
  gharim           Gharim        @relation(fields: [gharimId], references: [id])
  creditorName     String
  creditorPhone    String
  creditorAccount  String        // BR-002: وجهة الدفع الوحيدة
  debtAmount       Decimal
  documentType     DocumentType
  documentUrl      String
  status           RequestStatus @default(pending)
  adminNotes       String?
  reviewedBy       String?
  reviewedAt       DateTime?
  donations        Donation[]
  payments         Payment[]
  archivedAt       DateTime?     // BR-007: soft delete
  createdAt        DateTime      @default(now())
}

model Donation {
  id             String        @id @default(uuid())
  donorId        String
  donor          Donor         @relation(fields: [donorId], references: [id])
  requestId      String?       // null = صندوق عام
  request        DebtRequest?  @relation(fields: [requestId], references: [id])
  amount         Decimal
  type           DonationType
  paymentStatus  PaymentStatus @default(pending)
  transactionRef String?
  createdAt      DateTime      @default(now())
}

model Payment {
  id               String      @id @default(uuid())
  requestId        String
  request          DebtRequest @relation(fields: [requestId], references: [id])
  amountPaid       Decimal
  paidToCreditor   String
  paymentMethod    String
  receiptUrl       String?
  paidAt           DateTime    @default(now())
}

model Donor {
  id        String     @id @default(uuid())
  email     String     @unique
  name      String
  phone     String?
  donations Donation[]
  createdAt DateTime   @default(now())
}

model Admin {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      AdminRole @default(reviewer)
  createdAt DateTime @default(now())
}

enum RequestStatus { pending approved rejected paid archived }
enum DonationType  { direct general_fund }
enum PaymentStatus { pending completed refunded }
enum DocumentType  { court_order contract bank_receipt written_testimony }
enum AdminRole     { reviewer manager super_admin }
```

---

## أنماط Prisma الهامة

```typescript
// ✅ Transaction إلزامي للعمليات متعددة الخطوات
await prisma.$transaction(async (tx) => {
  await tx.debtRequest.update({ where: { id }, data: { status: "approved" } });
  await tx.notification.create({
    data: { userId: gharimId, type: "CASE_APPROVED" },
  });
});

// ✅ Soft delete دائماً للحالات المعتمدة (BR-007)
await prisma.debtRequest.update({
  where: { id },
  data: { archivedAt: new Date() },
  // ❌ لا تستخدم: prisma.debtRequest.delete()
});

// ✅ فلترة الحالات العامة (BR-003)
const cases = await prisma.debtRequest.findMany({
  where: { status: "approved", archivedAt: null },
  // ❌ لا تُعرض pending أو rejected للمتبرعين
});

// ✅ التحقق من BR-001 قبل إنشاء طلب جديد
const existing = await prisma.debtRequest.findFirst({
  where: {
    gharim: { nationalId },
    status: { in: ["pending", "approved"] },
  },
});
if (existing) throw new Error("ACTIVE_CASE_EXISTS");
```

---

## Security Patterns

```typescript
// كل endpoint يتطلب authentication
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return Response.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "غير مصرح" } },
      { status: 401 },
    );
  // ...
}

// Admin endpoints تتطلب ADMIN role
export async function isAdmin(session: Session | null): Promise<boolean> {
  return session?.user?.role === "admin";
}

// File upload validation
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
function validateUpload(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("INVALID_FILE_TYPE");
  if (file.size > MAX_SIZE) throw new Error("FILE_TOO_LARGE");
}

// البيانات الحساسة لا تُعاد في الـ API العام
const publicCase = {
  id: req.id,
  description: req.description,
  debtAmount: req.debtAmount,
  // ❌ nationalId, creditorAccount, phone → لا تُرسل للمتبرعين
};
```

---

## رسائل الخطأ — Arabic Error Codes

```typescript
const ERRORS = {
  ACTIVE_CASE_EXISTS: "لديك حالة نشطة بالفعل، لا يمكن تقديم طلب جديد",
  CASE_FULLY_FUNDED: "تم تمويل هذه الحالة بالكامل",
  INVALID_FILE_TYPE: "نوع الملف غير مدعوم، يُقبل PDF و JPG فقط",
  FILE_TOO_LARGE: "حجم الملف يتجاوز الحد المسموح (5 ميغابايت)",
  UNAUTHORIZED: "غير مصرح — يرجى تسجيل الدخول",
  CASE_NOT_FOUND: "الحالة غير موجودة",
  PAYMENT_FAILED: "فشل في تنفيذ الدفع، يرجى المحاولة لاحقاً",
};
```
