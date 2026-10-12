import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        accent: "bg-leaf-dark text-white shadow-[0_10px_24px_-10px_rgba(36,128,31,.8)] hover:bg-[#1d6a19]",
        primary: "bg-brand text-white hover:bg-brand-dark",
        navy: "bg-navy text-white hover:bg-navy-deep",
        white: "bg-white text-navy hover:bg-brand-light",
        outline: "border-2 border-navy/15 bg-white text-navy hover:border-brand hover:text-brand",
        ghost: "bg-transparent text-navy hover:bg-brand-light",
        whatsapp: "bg-whatsapp text-white hover:brightness-95",
        danger: "border-2 border-danger/30 bg-white text-danger hover:bg-red-50",
      },
      size: {
        lg: "min-h-14 px-7 text-base md:text-lg",
        md: "min-h-12 px-6 text-base",
        sm: "min-h-10 px-4 text-sm",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: { variant: "accent", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
