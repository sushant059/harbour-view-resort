import Link from "next/link";
import { Logo } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4 text-center">
      <div>
        <div className="flex justify-center"><Logo /></div>
        <p className="mt-10 font-display text-7xl font-extrabold text-navy">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy">That page isn’t here.</h1>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-full bg-navy px-6 font-bold text-white">Home</Link>
          <Link href="/free-quote" className="inline-flex min-h-12 items-center justify-center rounded-full bg-leaf-dark px-6 font-bold text-white">Free quote</Link>
        </div>
      </div>
    </main>
  );
}
