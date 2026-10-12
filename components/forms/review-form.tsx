"use client";

import { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { submitReviewAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/fields";
import { BrandIcon } from "@/components/social";
import { cn } from "@/lib/utils";

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export function ReviewForm({ services, googleUrl }: { services: string[]; googleUrl: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState("");

  if (done) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-leaf-dark" aria-hidden />
        <h3 className="mt-4 font-display text-2xl font-bold text-navy">Thank you!</h3>
        <p className="mt-2 text-slate">{done}</p>
        <div className="mt-6 rounded-2xl bg-mist p-5">
          <p className="font-semibold text-navy">Would you share it on Google too?</p>
          <p className="mt-1 text-sm text-slate">It really helps a small local business get found.</p>
          <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-12 items-center gap-2.5 rounded-full bg-white px-5 font-semibold text-navy shadow-card ring-1 ring-line hover:ring-[#4285F4]">
            <BrandIcon name="google" className="h-5 w-5 text-[#4285F4]" /> Post on Google
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      className="card grid gap-4 p-6 md:p-8"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        setErrors({});
        const result = await submitReviewAction({
          name: String(form.get("name") || ""),
          email: String(form.get("email") || ""),
          suburb: String(form.get("suburb") || ""),
          service: String(form.get("service") || ""),
          text: String(form.get("text") || ""),
          rating,
          company_website: String(form.get("company_website") || ""),
        });
        setPending(false);
        if (!result.ok) {
          setErrors({ ...(result.fields || {}), form: result.fields ? "" : result.error });
          return;
        }
        setDone(result.message || "Your review has been sent.");
      }}
    >
      <div>
        <p className="mb-1.5 text-sm font-semibold text-navy" id="rating-label">Your rating</p>
        <div className="flex items-center gap-1" role="radiogroup" aria-labelledby="rating-label" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              onMouseEnter={() => setHover(value)}
              onClick={() => setRating(value)}
              className="rounded-lg p-1 transition hover:scale-110"
            >
              <Star className={cn("h-9 w-9", value <= (hover || rating) ? "fill-sun text-sun" : "text-line")} aria-hidden />
            </button>
          ))}
          <span className="ml-3 font-semibold text-slate">{LABELS[hover || rating]}</span>
        </div>
        <FieldError message={errors.rating} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="review-name">Name</Label><Input id="review-name" name="name" autoComplete="name" placeholder="e.g. Sarah M." /><FieldError message={errors.name} /></div>
        <div><Label htmlFor="review-suburb">Where are you from? (optional)</Label><Input id="review-suburb" name="suburb" autoComplete="address-level2" placeholder="e.g. Melbourne" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="review-service">Room or experience</Label>
          <Select id="review-service" name="service" defaultValue="">
            <option value="">Choose a service</option>
            {services.map((title) => <option key={title} value={title}>{title}</option>)}
          </Select>
        </div>
        <div><Label htmlFor="review-email">Email (optional, never shown)</Label><Input id="review-email" name="email" type="email" autoComplete="email" /><FieldError message={errors.email} /></div>
      </div>
      <div><Label htmlFor="review-text">Your review</Label><Textarea id="review-text" name="text" placeholder="How was your stay? What did you like?" /><FieldError message={errors.text} /></div>
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <FieldError message={errors.form} />
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Sending…" : "Submit review"}</Button>
      <p className="text-xs text-slate">Reviews are checked by our team before they appear on the website.</p>
    </form>
  );
}
