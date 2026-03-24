# Code Rules — منصة الغارمين

## قواعد الكود وـ Copilot Instructions

---

## Naming Conventions

```typescript
// Variables & functions: camelCase
const gharimId = "...";
async function approveGharimRequest() {}

// Types & Interfaces: PascalCase
interface DebtRequest { ... }
type DonationType = 'direct' | 'general_fund';

// Constants: UPPER_SNAKE_CASE
const MAX_DEBT_AMOUNT = 5_000_000;
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg'];

// Database columns: snake_case (Prisma maps automatically)
// national_id, debt_amount, created_at, archived_at
```

---

## RTL Rules (Arabic UI)

```tsx
// Root layout — إلزامي
<html lang="ar" dir="rtl">

// Tailwind — استخدم start/end لا left/right
// ✅ ms-4 (margin-start)     ❌ ml-4
// ✅ ps-4 (padding-start)    ❌ pl-4
// ✅ text-start              ❌ text-left
// ✅ rounded-s-lg            ❌ rounded-l-lg

// رسائل الخطأ بالعربية دائماً
const ERRORS = {
  ACTIVE_CASE_EXISTS: 'لديك حالة نشطة بالفعل',
  UNAUTHORIZED: 'غير مصرح — يرجى تسجيل الدخول',
  INVALID_FILE_TYPE: 'نوع الملف غير مدعوم، يُقبل PDF و JPG فقط',
};
```

---

## Critical Anti-Patterns — ممنوع تماماً

```typescript
// ❌ 1: إرسال مبلغ لحساب الغارم
await pay(gharimAccount, amount); // خطأ فادح

// ✅ 1: الدفع للدائن فقط (BR-002)
await pay(request.creditorAccount, amount);

// ❌ 2: عرض حالات pending للمتبرعين
const cases = await prisma.debtRequest.findMany(); // يكشف حالات غير معتمدة

// ✅ 2: approved فقط (BR-003)
const cases = await prisma.debtRequest.findMany({
  where: { status: 'approved', archivedAt: null }
});

// ❌ 3: حذف حالة معتمدة
await prisma.debtRequest.delete({ where: { id } }); // يُخل بالشفافية

// ✅ 3: soft delete (BR-007)
await prisma.debtRequest.update({
  where: { id },
  data: { archivedAt: new Date() }
});

// ❌ 4: تجاهل التحقق من التكرار
await prisma.debtRequest.create({ data: { gharimId, ... } }); // قد يُكرر الحالة

// ✅ 4: التحقق أولاً (BR-001)
const existing = await prisma.debtRequest.findFirst({
  where: { gharim: { nationalId }, status: { in: ['pending', 'approved'] } }
});
if (existing) throw new Error('ACTIVE_CASE_EXISTS');
```

---

## API Response Standard

```typescript
// Success
return Response.json({
  success: true,
  data: result,
  meta: { total: count, page: 1, hasMore: false },
});

// Error
return Response.json(
  {
    success: false,
    error: { code: "NOT_FOUND", message: "الحالة غير موجودة" },
  },
  { status: 404 },
);
```

---

## Authentication Pattern

```typescript
// في كل API route:
const session = await getServerSession(authOptions);
if (!session) {
  return Response.json(
    {
      success: false,
      error: { code: "UNAUTHORIZED", message: "غير مصرح" },
    },
    { status: 401 },
  );
}

// للـ Admin routes:
if (session.user.role !== "admin") {
  return Response.json(
    {
      success: false,
      error: { code: "FORBIDDEN", message: "هذه الصفحة للمديرين فقط" },
    },
    { status: 403 },
  );
}
```

---

## Zod Validation Examples

```typescript
// نموذج تقديم الغارم
const GharimApplicationSchema = z.object({
  fullName: z.string().min(4, "الاسم يجب أن يكون 4 أحرف على الأقل"),
  nationalId: z.string().length(12, "رقم الهوية يجب أن يكون 12 رقماً"),
  phone: z.string().regex(/^07[0-9]{9}$/, "رقم الهاتف غير صحيح"),
  address: z.string().min(10),
  familyMembers: z.number().int().min(1).max(20),
  monthlyIncome: z.number().positive().optional(),
  guarantorName: z.string().min(4).optional(),
});

// طلب التبرع المباشر
const DirectDonationSchema = z.object({
  requestId: z.string().uuid(),
  amount: z.number().positive().min(1000, "الحد الأدنى للتبرع 1,000 دينار"),
});
```

---

## File Structure Quick Reference

```
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              Landing Page
│   │   └── cases/page.tsx        قائمة الحالات
│   ├── (gharim)/
│   │   ├── apply/page.tsx        نموذج التقديم
│   │   └── status/[id]/page.tsx  متابعة الحالة
│   ├── (donor)/
│   │   ├── cases/[id]/page.tsx   تفاصيل الحالة
│   │   └── donate/page.tsx       صفحة التبرع
│   └── (admin)/
│       ├── dashboard/page.tsx    لوحة التحكم
│       ├── requests/page.tsx     الطلبات المعلقة
│       └── payments/page.tsx     إدارة المدفوعات
├── api/
│   ├── gharimeen/route.ts
│   ├── cases/route.ts
│   ├── donations/route.ts
│   └── admin/
│       ├── requests/route.ts
│       └── payments/route.ts
```
