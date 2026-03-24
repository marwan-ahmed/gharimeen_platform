---
name: gharimeen-platform
description: >
  Project Knowledge كامل لمنصة الغارمين — منصة ويب إنسانية إسلامية لسداد ديون الغارمين عبر تبرعات أهل الخير.
  استخدم هذا الـ Skill تلقائياً عند أي ذكر لـ: منصة الغارمين، الغارمين، debt relief platform، gharimeen،
  أي سؤال عن Architecture أو قاعدة البيانات أو الـ API أو التصميم أو Business Rules للمشروع،
  أي طلب كتابة كود أو مكونات أو صفحات للمنصة، أي نقاش حول التحقق الشرعي أو نموذج التبرع،
  وأي طلب تحديث أو توسعة أو مراجعة لأي جزء من المشروع.
  هذا الـ Skill يحتوي على كل السياق اللازم — لا تجب على أي سؤال متعلق بالمشروع دون الرجوع إليه.
---

# منصة الغارمين — Project Knowledge

## الهوية والرؤية

**الاسم:** منصة الغارمين / Gharimeen Platform
**النوع:** Web Application — منصة ويب إنسانية إسلامية
**الرؤية:** الجسر الرقمي الأكثر موثوقية بين أهل الخير والغارمين في العالم العربي — كل تبرع موثق، وكل دين مُسدَّد يُغيّر حياة أسرة.
**المبدأ الشرعي:** مصرف الزكاة "الغارمين" — من ركبه الدين ولا وفاء عنده.
**الميزة الجوهرية:** المال يُحوَّل مباشرةً للدائن — لا يمر بيد الغارم أبداً.

---

## المستخدمون الثلاثة

| الطرف   | الدور            | الصلاحيات                                   |
| ------- | ---------------- | ------------------------------------------- |
| الغارم  | مقدّم طلب السداد | تقديم طلب، رفع وثائق، متابعة الحالة         |
| المحسن  | المتبرع          | تبرع مباشر لحالة أو للصندوق العام           |
| الإداري | بوابة الثقة      | قبول/رفض الحالات، تنفيذ المدفوعات، التقارير |

---

## نموذج التحقق الشرعي — 3 طبقات

### الطبقة 1: التقديم الذاتي

- **الهوية:** الاسم + رقم الهوية الوطنية (UNIQUE KEY — مفتاح منع الاحتيال)
- **وثيقة الدين** (مرتبة قوةً): حكم قضائي > عقد موثق > إيصال بنكي > شهادة خطية
- **الوضع المالي:** دخل + أصول + أفراد الأسرة (اختياري — يحدد الأولوية)
- **الكفيل الاجتماعي:** شخص ضامن معروف يُعزز المصداقية

### الطبقة 2: المراجعة الإدارية البشرية

- التحقق من أصالة المستندات ومطابقة البيانات
- **اتصال مباشر بالدائن** لتأكيد الدين — إلزامي لكل طلب
- زيارة ميدانية للحالات > 1M دينار أو المشكوك فيها

### الطبقة 3: صمامات الأمان التقنية

- `national_id UNIQUE` — حالة نشطة واحدة فقط
- دالة الدفع تستهدف `creditorAccount` حصراً
- سقف مبلغ قابل للضبط من الإدارة
- تقارير شفافية تلقائية بعد كل سداد
- Soft delete فقط — لا حذف للحالات المعتمدة

---

## Business Rules — BR-001 حتى BR-007

```
BR-001: national_id UNIQUE → حالة نشطة واحدة فقط في آنٍ واحد
BR-002: الدفع → creditorAccount فقط، لا يمر بالغارم أبداً
BR-003: عرض الحالات للمتبرعين → status = 'approved' فقط
BR-004: تبرع مباشر → يُقفل الحالة عند totalDonations >= debtAmount
BR-005: الصندوق العام → توزيع يدوي بشري، لا أتمتة
BR-006: اكتمال السداد → إشعار تلقائي للمتبرع + إيصال
BR-007: الحالات المعتمدة → أرشفة فقط (deletedAt)، لا حذف نهائي
```

---

## Tech Stack

```
Frontend:  Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend:   Next.js API Routes
Database:  PostgreSQL + Prisma ORM
Auth:      NextAuth.js (JWT + Role-based)
Storage:   Supabase Storage أو AWS S3
Payments:  Zain Cash / Asia Hawala / Stripe (حسب التوفر في العراق)
Deploy:    Vercel أو Railway
```

**للتفاصيل التقنية الكاملة:** اقرأ `references/technical.md`
**لقواعد الكود وـ Copilot Rules:** اقرأ `references/code-rules.md`
**لنظام التصميم:** اقرأ `references/design-system.md`

---

## مسارات API الرئيسية

```
# الغارم
POST   /api/gharimeen/apply           تقديم طلب جديد
GET    /api/gharimeen/:id/status       متابعة حالة الطلب

# المحسن
GET    /api/cases/approved            قائمة الحالات للمتبرعين
POST   /api/donations/direct          تبرع مباشر لحالة
POST   /api/donations/fund            تبرع للصندوق العام

# الإداري (محمية بـ ADMIN role)
GET    /admin/requests/pending        طلبات بانتظار المراجعة
PUT    /admin/requests/:id/approve    اعتماد طلب
PUT    /admin/requests/:id/reject     رفض مع سبب إلزامي
POST   /admin/payments/execute        تنفيذ دفعة للدائن
GET    /admin/reports/transparency    تقرير الشفافية
```

**صيغة الاستجابة الموحدة:**

```typescript
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string }; // message بالعربية دائماً
  meta?: { total?: number; page?: number; hasMore?: number };
};
```

---

## نموذج التبرع المزدوج

| النوع      | الآلية                                          | من يتحكم بالتوزيع     |
| ---------- | ----------------------------------------------- | --------------------- |
| تبرع مباشر | يختار المحسن حالة بعينها، يتبرع كلياً أو جزئياً | النظام تلقائياً       |
| صندوق عام  | يودع مبلغاً مفتوحاً في الصندوق                  | الفريق الإداري يدوياً |

---

## قواعد الكود السريعة

```
✅ TypeScript لكل الملفات — لا plain .js
✅ async/await — لا .then()/.catch()
✅ Zod لـ validation كل inputs
✅ رسائل الخطأ للمستخدم بالعربية
✅ اتجاه RTL — tailwind: start/end لا left/right
✅ try/catch لكل async function
❌ any type ممنوع
❌ حذف حالات معتمدة ممنوع
❌ إرسال المبلغ لحساب الغارم ممنوع
❌ عرض حالات pending للمتبرعين ممنوع
```

---

## نظام التصميم — Dignity & Light Framework

**الفلسفة:** "Digital Sanctuary" — تجربة editorial راقية لا transactional.

```
الألوان الأساسية:
surface (base):              #fbf9f6  خلفية parchment
surface-container-low:       #f5f3f0  أقسام ثانوية
surface-container-lowest:    #ffffff  بطاقات عائمة
surface-container-high:      #eae8e5  inputs + جداول
primary (teal):              #005440  → #0f6e56 (gradient CTA)
secondary (amber):           #BA7517  للمبلغ المتبقي فقط
on-background:               #1b1c1a  نصوص (لا أسود خالص #000)
on-surface-variant:          #44483f  body text charcoal

قواعد لا تُكسر:
- لا 1px solid borders لفصل الأقسام — background shifts فقط
- لا أسود خالص #000000
- لا زوايا حادة — 4px minimum، 16px للبطاقات
- الظل: box-shadow: 0px 0px 40px 0px rgba(0,33,23,0.06)
- مسافة بين الأقسام: 7–8rem
- Amber → للمبلغ المتبقي فقط، لا ديكور عام
```

**للتفاصيل الكاملة للتصميم:** اقرأ `references/design-system.md`

---

## هيكل الملف

```
src/
├── app/
│   ├── (public)/        صفحات عامة: landing، cases list
│   ├── (gharim)/        بوابة الغارم: تقديم طلب، متابعة
│   ├── (donor)/         بوابة المحسن: تبرع، حالات
│   └── (admin)/         لوحة التحكم الإدارية
├── components/
│   ├── ui/              مكونات مشتركة
│   ├── gharim/          مكونات الغارم
│   ├── donor/           مكونات المحسن
│   └── admin/           مكونات الإداري
├── lib/
│   ├── db.ts            Prisma client
│   ├── auth.ts          NextAuth config
│   ├── validations/     Zod schemas
│   └── utils/           helpers
└── types/               TypeScript types
```
