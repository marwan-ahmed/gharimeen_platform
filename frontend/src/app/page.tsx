import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-8">
      <main className="flex flex-col items-center text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
          منصة الغارمين
        </h1>
        <p className="text-lg md:text-xl text-on-surface-variant mb-10 leading-relaxed font-body">
          ملاذ رقمي لحفظ الكرامة وتقديم يد العون لتفريج كرب الغارمين في سامراء، خطوة بخطوة نحو مجتمع متكافل وخيّر.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="primary" className="text-lg h-14 px-8 w-full">
              انضم إلينا الآن
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="secondary" className="text-lg h-14 px-8 w-full">
              تسجيل الدخول
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
