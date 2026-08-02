import { ArrowRight, Building2, Calendar, ExternalLink, Tag } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectGallery } from "@/components/portfolio/gallery";
import { ProjectCard } from "@/components/public/cards";
import { PageHero } from "@/components/public/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Badge, JsonLd, Prose } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { SmartImage } from "@/components/ui/smart-image";
import { breadcrumbJsonLd, buildMetadata, projectJsonLd } from "@/lib/seo";
import { getProjectBySlug, getProjects, getRelatedProjects } from "@/lib/services/collections";
import { getSeoSettings, getWebsiteSettings } from "@/lib/services/content";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [project, seo] = await Promise.all([getProjectBySlug(slug), getSeoSettings()]);

  if (!project) {
    return { title: "Project not found", robots: { index: false, follow: false } };
  }

  return buildMetadata({
    seo,
    fields: project.seo,
    fallbackTitle: project.title,
    fallbackDescription: project.shortDescription,
    path: `/portfolio/${project.slug}`,
    images: [project.featuredImage],
    type: "article",
    publishedTime: project.completionDate,
  });
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const [related, settings, seo] = await Promise.all([
    getRelatedProjects(project, 3),
    getWebsiteSettings(),
    getSeoSettings(),
  ]);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: project.title, href: `/portfolio/${project.slug}` },
  ];

  const facts = [
    { icon: Building2, label: "Client", value: project.clientName },
    { icon: Tag, label: "Category", value: project.categoryName },
    {
      icon: Calendar,
      label: "Completed",
      value: project.completionDate
        ? formatDate(project.completionDate, { month: "long", year: "numeric" })
        : "Ongoing",
    },
  ];

  return (
    <>
      <JsonLd
        data={[breadcrumbJsonLd(crumbs, seo), projectJsonLd(project, settings, seo)]}
      />

      <PageHero
        eyebrow={project.categoryName}
        title={project.title}
        description={project.shortDescription}
        crumbs={crumbs}
        backgroundImage={project.featuredImage}
      >
        {project.projectUrl && (
          <ButtonLink href={project.projectUrl} size="lg" variant="glass">
            Visit the live site
            <ExternalLink aria-hidden className="size-4" />
          </ButtonLink>
        )}
      </PageHero>

      <Section>
        <div className="container-page">
          {/* Hero image */}
          <Reveal>
            <div className="relative aspect-16/9 overflow-hidden rounded-4xl bg-navy-100 shadow-lift dark:bg-navy-900">
              <SmartImage
                src={project.featuredImage}
                alt={project.title}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1200px"
                quality={88}
                className="object-cover"
                fallbackLabel={project.title}
              />
            </div>
          </Reveal>

          {/* Facts strip */}
          <Reveal delay={0.06}>
            <dl className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-navy-200 bg-navy-200 sm:grid-cols-3 dark:border-navy-800 dark:bg-navy-800">
              {facts.map(({ icon: FactIcon, label, value }) => (
                <div key={label} className="bg-white px-6 py-5 dark:bg-navy-950">
                  <dt className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-navy-400 uppercase">
                    <FactIcon aria-hidden className="size-3.5" />
                    {label}
                  </dt>
                  <dd className="mt-2 text-[15px] font-medium text-navy-900 dark:text-navy-50">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
            <div>
              <Reveal>
                <h2 className="text-2xl font-semibold text-navy-950 sm:text-3xl dark:text-white">
                  About this project
                </h2>
                <Prose text={project.description} className="mt-5" />
              </Reveal>

              {project.images.length > 0 && (
                <Reveal delay={0.08}>
                  <h2 className="mt-14 text-2xl font-semibold text-navy-950 sm:text-3xl dark:text-white">
                    Gallery
                  </h2>
                  <p className="mt-2 text-sm text-navy-500 dark:text-navy-400">
                    Select an image to view it full screen.
                  </p>
                  <div className="mt-6">
                    <ProjectGallery images={project.images} title={project.title} />
                  </div>
                </Reveal>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Reveal direction="left">
                {project.technologies.length > 0 && (
                  <div className="surface-card p-6">
                    <h2 className="text-[11px] font-semibold tracking-[0.16em] text-navy-400 uppercase">
                      Technologies
                    </h2>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <li key={tech}>
                          <Badge tone="brand">{tech}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="surface-card mt-6 p-6">
                  <h2 className="text-lg font-semibold text-navy-950 dark:text-white">
                    Have a similar project?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600 dark:text-navy-300">
                    We&apos;d be glad to talk it through — no obligation, no sales sequence.
                  </p>
                  <ButtonLink href="/contact" className="mt-5 w-full">
                    Start a conversation
                    <ArrowRight aria-hidden className="size-4" />
                  </ButtonLink>
                </div>
              </Reveal>
            </aside>
          </div>
        </div>
      </Section>

      {related.length > 0 && (
        <Section muted>
          <div className="container-page">
            <SectionHeading
              eyebrow="More work"
              heading="Related projects"
              align="left"
            />
            <Stagger as="ul" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <StaggerItem as="li" key={item.id} className="h-full">
                  <ProjectCard project={item} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Section>
      )}
    </>
  );
}
