import type { Metadata } from "next";

import { AdminAuthProvider } from "@/components/admin/auth-provider";

/** The admin panel is never indexed — reinforced by headers in next.config.ts. */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
