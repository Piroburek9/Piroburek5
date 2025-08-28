import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 relative overflow-hidden min-h-[44px] min-w-[44px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 rounded-lg",
        destructive: "bg-error text-error-foreground hover:opacity-90 shadow-md hover:shadow-lg rounded-lg",
        outline: "border border-border bg-surface hover:bg-surface-hover text-foreground rounded-lg",
        secondary: "bg-surface hover:bg-surface-hover text-foreground border border-border rounded-lg",
        ghost: "hover:bg-surface-hover text-foreground rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2", // 44px min height
        sm: "h-11 px-3 text-sm",   // keep readable, min 44px
        lg: "h-12 px-6",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        data-slot="button"
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };