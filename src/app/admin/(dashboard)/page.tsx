"use client";

import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  ArrowRight,
  BarChart3,
  FolderKanban,
  Image as ImageIcon,
  Images,
  Inbox,
  Layers,
  Mail,
  MessageSquareQuote,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminEmpty, AdminPageHeader, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { COLLECTIONS } from "@/lib/constants";
import { getDb } from "@/lib/firebase/client";
import { cn, formatDateTime } from "@/lib/utils";
import type { ContactQuery, PortfolioProject } from "@/types";

interface Counts {
  banners: number;
  services: number;
  projects: number;
  team: number;
  testimonials: number;
  queries: number;
  unread: number;
  subscribers: number;
  media: number;
}

const STATUS_TONES = {
  new: "brand",
  read: "info",
  in_progress: "warning",
  completed: "success",
} as const;

const STATUS_LABELS = {
  new: "New",
  read: "Read",
  in_progress: "In progress",
  completed: "Completed",
} as const;

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const db = getDb();

      try {
        // `getCountFromServer` bills a single document read per aggregation
        // instead of downloading every document just to length it.
        const countOf = async (name: string) =>
          (await getCountFromServer(collection(db, name))).data().count;

        const [
          banners,
          services,
          projectCount,
          team,
          testimonials,
          queryCount,
          subscribers,
          media,
          unreadSnap,
          recentQueries,
          recentProjects,
        ] = await Promise.all([
          countOf(COLLECTIONS.homeBanners),
          countOf(COLLECTIONS.services),
          countOf(COLLECTIONS.portfolio),
          countOf(COLLECTIONS.team),
          countOf(COLLECTIONS.testimonials),
          countOf(COLLECTIONS.contactQueries),
          countOf(COLLECTIONS.newsletterSubscribers),
          countOf(COLLECTIONS.mediaLibrary),
          getCountFromServer(
            query(collection(db, COLLECTIONS.contactQueries), where("status", "==", "new")),
          ),
          getDocs(
            query(
              collection(db, COLLECTIONS.contactQueries),
              orderBy("createdAt", "desc"),
              limit(5),
            ),
          ),
          getDocs(
            query(collection(db, COLLECTIONS.portfolio), orderBy("createdAt", "desc"), limit(4)),
          ),
        ]);

        if (cancelled) return;

        setCounts({
          banners,
          services,
          projects: projectCount,
          team,
          testimonials,
          queries: queryCount,
          unread: unreadSnap.data().count,
          subscribers,
          media,
        });

        setQueries(
          recentQueries.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate?.().toISOString() ?? null,
            submittedAt: docSnap.data().submittedAt?.toDate?.().toISOString() ?? null,
          })) as ContactQuery[],
        );

        setProjects(
          recentProjects.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate?.().toISOString() ?? null,
          })) as PortfolioProject[],
        );
      } catch (error) {
        console.error("[dashboard] Failed to load metrics:", error);
        if (!cancelled) setFailed(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: "Banner slides", value: counts?.banners, href: "/admin/banners", icon: Images },
    { label: "Services", value: counts?.services, href: "/admin/services", icon: Layers },
    { label: "Portfolio projects", value: counts?.projects, href: "/admin/portfolio", icon: FolderKanban },
    { label: "Team members", value: counts?.team, href: "/admin/team", icon: Users },
    { label: "Testimonials", value: counts?.testimonials, href: "/admin/testimonials", icon: MessageSquareQuote },
    { label: "Contact queries", value: counts?.queries, href: "/admin/queries", icon: Inbox, badge: counts?.unread },
    { label: "Subscribers", value: counts?.subscribers, href: "/admin/newsletter", icon: Mail },
    { label: "Media files", value: counts?.media, href: "/admin/media", icon: ImageIcon },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="A snapshot of your published content and recent activity."
      />

      {failed && (
        <Panel className="mb-6 border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="text-[13.5px] text-amber-800 dark:text-amber-200">
            Some metrics couldn&apos;t be loaded. Check that Firestore is reachable and that your
            security rules allow admin reads.
          </p>
        </Panel>
      )}

      {/* Stat cards */}
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((card) => {
          const CardIcon = card.icon;
          return (
            <li key={card.href}>
              <Link
                href={card.href}
                className="group flex h-full flex-col justify-between rounded-2xl border border-navy-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft sm:p-5 dark:border-navy-800 dark:bg-navy-900 dark:hover:border-brand-500/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    aria-hidden
                    className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/12 dark:text-brand-300"
                  >
                    <CardIcon className="size-4" />
                  </span>
                  {typeof card.badge === "number" && card.badge > 0 && (
                    <Badge tone="danger">{card.badge} new</Badge>
                  )}
                </div>

                <div className="mt-4">
                  {card.value === undefined ? (
                    <span className="skeleton block h-8 w-14" />
                  ) : (
                    <p className="font-display text-2xl font-semibold text-navy-950 tabular-nums sm:text-3xl dark:text-white">
                      {card.value.toLocaleString("en-US")}
                    </p>
                  )}
                  <p className="mt-1 text-[12.5px] text-navy-500 dark:text-navy-400">
                    {card.label}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Analytics placeholder */}
      <Panel className="mt-4 sm:mt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-100 text-navy-500 dark:bg-navy-800 dark:text-navy-400"
            >
              <BarChart3 className="size-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-navy-950 dark:text-white">
                Website visitors
              </h3>
              <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-navy-500 dark:text-navy-400">
                Traffic figures come from Google Analytics rather than Firestore. Connect a GA4
                property and surface the numbers here — see{" "}
                <code className="rounded bg-navy-100 px-1 py-0.5 text-[11.5px] dark:bg-navy-800">
                  docs/ANALYTICS.md
                </code>{" "}
                for the wiring.
              </p>
            </div>
          </div>
          <Badge tone="neutral" className="shrink-0">
            Not connected
          </Badge>
        </div>
      </Panel>

      {/* Recent activity */}
      <div className="mt-4 grid gap-4 sm:mt-5 lg:grid-cols-2">
        <Panel padded={false}>
          <div className="flex items-center justify-between border-b border-navy-200 p-5 dark:border-navy-800">
            <h3 className="text-sm font-semibold text-navy-950 dark:text-white">
              Recent contact messages
            </h3>
            <Link
              href="/admin/queries"
              className="flex items-center gap-1 text-[12.5px] font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400"
            >
              View all
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>

          {queries.length === 0 ? (
            <p className="px-5 py-12 text-center text-[13px] text-navy-500 dark:text-navy-400">
              No messages yet.
            </p>
          ) : (
            <ul className="divide-y divide-navy-100 dark:divide-navy-800">
              {queries.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/admin/queries?id=${item.id}`}
                    className="flex items-start gap-3 p-4 transition-colors hover:bg-navy-50 dark:hover:bg-navy-800/50"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        item.status === "new" ? "bg-brand-500" : "bg-navy-300 dark:bg-navy-600",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[13.5px] font-semibold text-navy-950 dark:text-white">
                          {item.fullName}
                        </p>
                        <Badge tone={STATUS_TONES[item.status] ?? "neutral"}>
                          {STATUS_LABELS[item.status] ?? item.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-[12.5px] text-navy-600 dark:text-navy-300">
                        {item.subject}
                      </p>
                      <p className="mt-1 text-[11.5px] text-navy-400">
                        {formatDateTime(item.submittedAt ?? item.createdAt)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel padded={false}>
          <div className="flex items-center justify-between border-b border-navy-200 p-5 dark:border-navy-800">
            <h3 className="text-sm font-semibold text-navy-950 dark:text-white">
              Recently added projects
            </h3>
            <Link
              href="/admin/portfolio"
              className="flex items-center gap-1 text-[12.5px] font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400"
            >
              View all
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <AdminEmpty
              title="No projects yet"
              description="Add your first portfolio project to showcase your work."
              actionLabel="Add a project"
              actionHref="/admin/portfolio/new"
            />
          ) : (
            <ul className="divide-y divide-navy-100 dark:divide-navy-800">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/admin/portfolio/${project.id}`}
                    className="flex items-center gap-3.5 p-4 transition-colors hover:bg-navy-50 dark:hover:bg-navy-800/50"
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-navy-100 dark:bg-navy-800">
                      <SmartImage
                        src={project.featuredImage}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-navy-950 dark:text-white">
                        {project.title}
                      </p>
                      <p className="mt-0.5 truncate text-[12.5px] text-navy-500 dark:text-navy-400">
                        {project.clientName} · {project.categoryName}
                      </p>
                    </div>
                    {project.isFeatured && <Badge tone="brand">Featured</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
