"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitContact } from "@/lib/actions";
import { contactSchema, type ContactInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/fields";

export function ContactForm() {
  const [reference, setReference] = useState("");
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "", company_website: "" },
  });
  if (reference) {
    return <div className="rounded-card bg-white p-6 shadow-card" role="status"><h2 className="text-2xl font-bold">Message sent</h2><p className="mt-2">Your reference is <strong>{reference}</strong>. {"We'll reply by phone or email."}</p></div>;
  }
  return (
    <form className="grid gap-4" noValidate onSubmit={form.handleSubmit(async (values) => {
      const data = new FormData();
      Object.entries(values).forEach(([key, value]) => data.set(key, String(value ?? "")));
      const result = await submitContact(data);
      if (!result.ok) {
        if (result.fields) Object.entries(result.fields).forEach(([key, message]) => form.setError(key as keyof ContactInput, { message }));
        form.setError("root", { message: result.error });
        return;
      }
      setReference(result.reference || "");
    })}>
      <div className="h-0 overflow-hidden" aria-hidden>
        <label htmlFor="contact-company">Company website</label>
        <input id="contact-company" tabIndex={-1} autoComplete="off" {...form.register("company_website")} />
      </div>
      <div>
        <Label htmlFor="contact-name">Name</Label>
        <Input id="contact-name" autoComplete="name" {...form.register("name")} />
        <FieldError message={form.formState.errors.name?.message} />
      </div>
      <div>
        <Label htmlFor="contact-email">Email</Label>
        <Input id="contact-email" type="email" autoComplete="email" {...form.register("email")} />
        <FieldError message={form.formState.errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="contact-phone">Phone (optional)</Label>
        <Input id="contact-phone" autoComplete="tel" {...form.register("phone")} />
        <FieldError message={form.formState.errors.phone?.message} />
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" {...form.register("message")} />
        <FieldError message={form.formState.errors.message?.message} />
      </div>
      {form.formState.errors.root?.message && <p className="text-sm font-medium text-danger" role="alert">{form.formState.errors.root.message}</p>}
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Sending…" : "Send message"}</Button>
    </form>
  );
}
