import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // "Field Notes": solid = ink that turns moss on hover
        default: "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-card text-foreground border border-border hover:bg-accent",
        outline: "border border-foreground/50 bg-transparent hover:border-primary hover:text-primary",
        ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
        link: "text-primary underline underline-offset-4 decoration-primary/60 hover:decoration-primary",
        // mono lowercase treatment used for external links (e.g. "github ↗")
        mono: "border border-foreground/50 bg-transparent font-mono lowercase text-[13px] hover:border-primary hover:text-primary",
      },
      size: {
        default: "h-10 px-[18px]",
        sm: "h-8 rounded-md px-3 text-[13px]",
        lg: "h-[46px] rounded-md px-6 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
