"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ExternalLink,
  Image as ImageIcon,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Layers,
  FolderKanban,
  Tags,
  Users,
  Info,
  Home,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAdminAuth } from "@/components/admin/auth-provider";
import { ThemeToggle } from "@/components/public/theme-toggle";
import { cn, initials } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Pages",
    items: [
      { label: "Home page", href: "/admin/home", icon: Home },
      { label: "Banner slides", href: "/admin/banners", icon: Images },
      { label: "About page", href: "/admin/about", icon: Info },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Services", href: "/admin/services", icon: Layers },
      { label: "Portfolio", href: "/admin/portfolio", icon: FolderKanban },
      { label: "Categories", href: "/admin/categories", icon: Tags },
      { label: "Team", href: "/admin/team", icon: Users },
      { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
    ],
  },
  {
    title: "Engagement",
    items: [
      { label: "Contact queries", href: "/admin/queries", icon: Inbox },
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Media library", href: "/admin/media", icon: ImageIcon },
      { label: "SEO settings", href: "/admin/seo", icon: Search },
      { label: "Website settings", href: "/admin/settings", icon: Settings },
      { label: "Administrators", href: "/admin/users", icon: ShieldCheck },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, signOut } = useAdminAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile drawer whenever the route changes. Navigation is an
  // external event, not derivable from render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setSidebarOpen(false), [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [sidebarOpen]);

  const currentTitle = useMemo(() => {
    // Longest matching prefix wins, so /admin/portfolio/new resolves to Portfolio.
    const match = [...ALL_ITEMS]
      .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0];
    return match?.label ?? "Admin";
  }, [pathname]);

  async function handleSignOut() {
    try {
      await signOut();
      toast.success("Signed out.");
      router.replace("/admin/login");
    } catch {
      toast.error("Could not sign out. Please try again.");
    }
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebar = (
    <div className="flex h-full flex-col border-r border-brand-100 bg-white dark:border-navy-800 dark:bg-navy-900">
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-brand-100 px-5 dark:border-navy-800">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-xl bg-linear-135 from-brand-600 to-accent-500 text-white"
          >
            <Sparkles className="size-4" />
          </span>
          <span className="font-display text-[15px] font-semibold text-navy-950 dark:text-white">Control Panel</span>
        </Link>

        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close the menu"
          className="flex size-8 items-center justify-center rounded-lg text-navy-400 transition-colors hover:bg-brand-50 hover:text-navy-900 lg:hidden dark:hover:bg-navy-800"
        >
          <X aria-hidden className="size-4.5" />
        </button>
      </div>

      <nav
        aria-label="Admin sections"
        className="scrollbar-slim flex-1 space-y-6 overflow-y-auto px-3 py-5"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="px-3 text-[10px] font-semibold tracking-[0.16em] text-navy-400 uppercase">
              {group.title}
            </p>
            <ul className="mt-2 space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const ItemIcon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-150",
                        active
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-500/12 dark:text-brand-300"
                          : "text-navy-600 hover:bg-brand-50/70 hover:text-navy-950 dark:text-navy-300 dark:hover:bg-navy-800 dark:hover:text-white",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="admin-nav-active"
                          aria-hidden
                          className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand-600 dark:bg-brand-400"
                          transition={{ type: "spring", stiffness: 400, damping: 34 }}
                        />
                      )}
                      <ItemIcon
                        aria-hidden
                        className={cn("size-4 shrink-0", active && "text-brand-600 dark:text-brand-300")}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-brand-100 p-3 dark:border-navy-800">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-navy-600 transition-colors hover:bg-brand-50/70 hover:text-navy-950 dark:text-navy-300 dark:hover:bg-navy-800"
        >
          <ExternalLink aria-hidden className="size-4 shrink-0" />
          View live site
        </a>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-svh bg-[var(--surface-muted)]">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">{sidebar}</div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-55 w-72 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-navy-200 bg-white/85 px-4 backdrop-blur-lg sm:px-6 dark:border-navy-800 dark:bg-navy-950/85">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open the menu"
              className="flex size-9 items-center justify-center rounded-lg border border-navy-200 text-navy-700 transition-colors hover:bg-navy-50 lg:hidden dark:border-navy-700 dark:text-navy-200 dark:hover:bg-navy-900"
            >
              <Menu aria-hidden className="size-4.5" />
            </button>

            <h1 className="truncate text-[15px] font-semibold text-navy-950 dark:text-white">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-navy-200 py-1 pr-2.5 pl-1 transition-colors hover:bg-navy-50 dark:border-navy-700 dark:hover:bg-navy-900"
              >
                <span
                  aria-hidden
                  className="flex size-7 items-center justify-center rounded-full bg-linear-135 from-brand-600 to-accent-500 text-[11px] font-bold text-white"
                >
                  {initials(admin?.name || admin?.email || "A")}
                </span>
                <span className="hidden max-w-32 truncate text-[13px] font-medium text-navy-800 sm:block dark:text-navy-100">
                  {admin?.name || admin?.email}
                </span>
                <ChevronDown aria-hidden className="size-3.5 text-navy-400" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                      aria-hidden
                    />
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-navy-200 bg-white shadow-lift dark:border-navy-800 dark:bg-navy-900"
                    >
                      <div className="border-b border-navy-100 px-4 py-3.5 dark:border-navy-800">
                        <p className="truncate text-sm font-semibold text-navy-950 dark:text-white">
                          {admin?.name || "Administrator"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-navy-500 dark:text-navy-400">
                          {admin?.email}
                        </p>
                        <p className="mt-2 inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-brand-700 uppercase dark:bg-brand-500/12 dark:text-brand-300">
                          {admin?.role ?? "admin"}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13.5px] font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        <LogOut aria-hidden className="size-4" />
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
