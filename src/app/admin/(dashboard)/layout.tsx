"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminAuth } from "@/components/admin/auth-provider";

/**
 * Route guard for every authenticated admin page.
 *
 * This is a convenience gate, not the security boundary — `firestore.rules`
 * and `storage.rules` are. Someone who bypasses this UI still cannot read or
 * write anything they are not entitled to.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || admin) return;
    const from = encodeURIComponent(pathname);
    router.replace(`/admin/login?from=${from}`);
  }, [admin, loading, pathname, router]);

  if (loading || !admin) {
    return (
      <div
        className="flex min-h-svh flex-col items-center justify-center gap-3 bg-navy-50 dark:bg-navy-950"
        role="status"
        aria-live="polite"
      >
        <Loader2 aria-hidden className="size-6 animate-spin text-brand-600" />
        <p className="text-sm text-navy-500 dark:text-navy-400">
          {loading ? "Checking your session…" : "Redirecting to sign in…"}
        </p>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
