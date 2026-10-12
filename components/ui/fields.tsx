import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("mb-1.5 block text-sm font-semibold text-navy", className)} {...props} />;
}

const base = "w-full rounded-input border border-line bg-white px-4 text-ink placeholder:text-slate/60 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-sky/20";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(base, "min-h-12", className)} {...props} />;
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(base, "min-h-12 pr-8", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(base, "min-h-32 py-3", className)} {...props} />;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm font-medium text-danger" role="alert">{message}</p>;
}
