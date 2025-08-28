import * as React from "react";

import { cn } from "./utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-white/10 flex h-11 w-full min-w-0 rounded-xl border px-3 py-2 text-base bg-white/5 backdrop-blur-md transition-[box-shadow,border,background] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
          "focus-visible:border-cyan-400/60 focus-visible:ring-[3px] focus-visible:ring-cyan-400/30",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        ref={ref}
        data-slot="input"
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };