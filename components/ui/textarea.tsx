import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-white/10 placeholder:text-muted-foreground focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-xl border bg-white/5 backdrop-blur-md px-3 py-2 text-base transition-[box-shadow,border,background] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
