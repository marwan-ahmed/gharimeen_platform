# Design System — Dignity & Light Framework

## منصة الغارمين

**الفلسفة:** "The Digital Sanctuary" — تجربة editorial راقية تُكرِّم المتبرع والمستفيد معاً.
**المرجع الأصلي:** DESIGN.md (Dignity & Light Framework)

---

## Design Tokens

```css
/* Surfaces — من الأفتح للأغمق */
--surface: #fbf9f6; /* base parchment — الخلفية الرئيسية */
--surface-container-low: #f5f3f0; /* أقسام ثانوية */
--surface-container-lowest: #ffffff; /* بطاقات عائمة */
--surface-container-high: #eae8e5; /* inputs resting + جداول */

/* Brand */
--primary: #005440; /* نقطة بداية CTA gradient */
--primary-container: #0f6e56; /* نقطة نهاية CTA gradient */
--secondary: #ba7517; /* Amber — المبلغ المتبقي فقط */
--on-background: #1b1c1a; /* نصوص — لا أسود خالص */
--on-surface-variant: #44483f; /* body text charcoal */

/* Gradient CTA */
--gradient-cta: linear-gradient(135deg, #005440, #0f6e56);

/* Ambient Shadow */
--shadow-ambient: 0px 0px 40px 0px rgba(0, 33, 23, 0.06);
```

---

## قواعد التصميم الصارمة

### ✅ افعل دائماً

- **فصل الأقسام:** background color shifts فقط — `surface` ↔ `surface-container-low`
- **الكروت:** `surface-container-lowest` (#fff) على خلفية `surface-container-low`
- **مسافات الأقسام:** 7–8rem بين كل section رئيسية
- **الـ RTL:** `dir="rtl"` على `<html>`، Tailwind: `ms-`/`me-`/`ps-`/`pe-` لا `ml-`/`mr-`
- **النمط الإسلامي:** 3% opacity كـ watermark فقط — لا خلفية عالية التباين
- **الـ Amber:** للمبلغ المتبقي في الحالة فقط — `يتبقى XXX د.ع`

### ❌ لا تفعل أبداً

- لا `1px solid borders` لفصل الأقسام
- لا `#000000` — استخدم `#1b1c1a`
- لا زوايا حادة — 4px minimum، 16px للبطاقات
- لا `box-shadow` قوي — ambient shadow فقط
- لا Amber كلون ديكور عام

---

## Components

### Primary Button (CTA)

```tsx
<button
  className="bg-gradient-to-br from-[#005440] to-[#0f6e56] text-white
  rounded-[8px] px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
>
  تبرع الآن
</button>
```

### Secondary Button (Ghost)

```tsx
<button
  className="border border-[#005440]/20 text-[#005440] bg-transparent
  rounded-[8px] px-6 py-3 text-sm font-medium hover:border-[#005440]/40"
>
  أنا غارم — قدّم طلبك
</button>
```

### Case Card

```tsx
// Card على خلفية surface-container-low — بدون border
<div
  className="bg-white rounded-[16px] p-8"
  style={{ boxShadow: "0px 0px 40px 0px rgba(0,33,23,0.06)" }}
>
  <h3 className="text-[#1b1c1a] font-semibold">عنوان الحالة</h3>
  <p className="text-[#44483f] text-sm mt-2">وصف مختصر للحالة...</p>
  {/* Progress Bar */}
  <div className="bg-[#eae8e5] rounded-full h-2 mt-4">
    <div className="bg-[#0f6e56] h-2 rounded-full" style={{ width: "65%" }} />
  </div>
  {/* المبلغ المتبقي بالـ Amber فقط */}
  <span className="text-[#BA7517] font-semibold text-sm">
    يتبقى ٤٢٠,٠٠٠ د.ع
  </span>
</div>
```

### Form Input

```tsx
// Resting: surface-container-high background, no border
// Focused: white bg + amber bottom border only
<div className="flex flex-col gap-1.5">
  <label className="text-right text-xs text-[#44483f] font-medium">
    رقم الهوية الوطنية
  </label>
  <input
    className="bg-[#eae8e5] rounded-[8px] px-4 py-3 text-right
    text-[#1b1c1a] text-sm outline-none
    focus:bg-white focus:border-b-2 focus:border-[#BA7517]
    border-b-2 border-transparent transition-all"
  />
  <span className="text-xs text-[#44483f] text-right">
    يُستخدم رقم هويتك مرة واحدة فقط
  </span>
</div>
```

### Navbar (Glassmorphism)

```tsx
<nav
  className="fixed top-0 w-full z-50 px-8 py-4"
  style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)" }}
>
  {/* محتوى الـ nav */}
</nav>
```

### Stats Bar

```tsx
// Section بـ background shift — بدون borders
<section className="bg-[#f5f3f0] py-16">
  <div className="flex justify-around">
    <div className="text-center">
      <p className="text-4xl font-bold text-[#0f6e56]">١٢٤</p>
      <p className="text-sm text-[#44483f] mt-1">حالة مسددة</p>
    </div>
    {/* ... */}
  </div>
</section>
```

---

## Typography

| الاستخدام       | الخط            | الحجم   | اللون          |
| --------------- | --------------- | ------- | -------------- |
| Display / Hero  | beVietnamPro    | 48px+   | `#1b1c1a`      |
| Section Titles  | beVietnamPro    | 28-36px | `#1b1c1a`      |
| Body            | plusJakartaSans | 16px    | `#44483f`      |
| Labels / Helper | plusJakartaSans | 12-14px | `#44483f`      |
| Stats Numbers   | beVietnamPro    | 40px+   | `#0f6e56`      |
| Amber Callout   | plusJakartaSans | 14px    | `#BA7517` bold |

---

## Section Alternation Pattern

```
Landing Page من أعلى لأسفل:
Navbar:         glassmorphism (rgba white 80%)
Hero:           #fbf9f6 + Islamic pattern watermark 3%
Stats Bar:      #f5f3f0  ← background shift (لا divider)
Active Cases:   #fbf9f6  ← background shift
How It Works:   #f5f3f0  ← background shift
Trust Section:  #fbf9f6  ← background shift
Footer:         #1b1c1a  ← dark warm (لا أسود خالص)
```

---

## Stitch Prompts Reference

أوامر توليد الواجهة جاهزة في: `references/stitch-prompts.md`
تشمل 4 شاشات: Landing Page، Application Form، Donation Page، Admin Dashboard.
