"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      // First visit always lands on the light white-and-blue palette, even if
      // the visitor's OS is set to dark. `enableSystem` stays on so "System"
      // is still a choice in the toggle — it is just not the default.
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{ className: "font-sans text-sm" }}
      />
    </ThemeProvider>
  );
}
