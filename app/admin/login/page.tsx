"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/fields";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <main className="grid min-h-screen place-items-center bg-brand-light px-4 py-12">
      <form
        className="w-full max-w-md rounded-card bg-white p-6 shadow-soft"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError("");
          const result = await loginAction(new FormData(event.currentTarget));
          setPending(false);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.push("/admin");
          router.refresh();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hvr-icon.svg" alt="" className="h-16 w-16" />
        <h1 className="mt-4 text-3xl font-bold">Owner sign in</h1>
        <p className="mt-2 text-sm text-slate">Only the business email can open the admin.</p>
        <div className="mt-6">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="username" required />
        </div>
        <div className="mt-4">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {error && <p className="mt-3 text-sm font-medium text-danger" role="alert">{error}</p>}
        <Button className="mt-6 w-full" type="submit" disabled={pending}>{pending ? "Checking…" : "Sign in"}</Button>
        {process.env.NODE_ENV !== "production" && <p className="mt-4 text-sm text-slate">Local development password is the ADMIN_PASSWORD in .env.local, or resort-demo if you have not set one.</p>}
      </form>
    </main>
  );
}
