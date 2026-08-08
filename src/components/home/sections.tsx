import { ArrowRight, Check } from "lucide-react";

import { ProjectCard, ServiceCard } from "@/components/public/cards";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState, Prose } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { SmartImage } from "@/components/ui/smart-image";
import type {
  HomeCta,
  HomeIntro,
  HomeSectionHeading,
  PortfolioProject,
  Service,
  WhyChooseUsItem,
} from "@/types";

/* ------------------------------------------------------------------ */
/* Company introduction                                                */
/* ------------------------------------------------------------------ */

export function IntroSection({ intro }: { intro: HomeIntro }) {
  return (
    <Section spacing="lg">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal direction="right" className="relative">
          {/*
            Portrait box with `object-contain`: admins upload photos at whatever
            ratio they have, and cropping a person's head off is worse than a
            little empty space on the sides.
          */}
          <div className="relative aspect-4/5 overflow-hidden rounded-4xl bg-navy-100 shadow-lift dark:bg-navy-900">
            <SmartImage
              src={intro.image}
              alt={intro.heading}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain"
              fallbackLabel="Company photo"
            />
          </div>

          {/* Decorative accent block, hidden from assistive tech. */}
          <div
            aria-hidden
            className="absolute -right-4 -bottom-6 hidden size-40 rounded-3xl bg-linear-135 from-brand-600 to-accent-500 opacity-90 blur-[1px] sm:block lg:-right-8"
          />
          <div
            aria-hidden
            className="absolute -top-6 -left-6 hidden size-24 rounded-2xl border-2 border-brand-200 lg:block dark:border-brand-500/25"
          />
        </Reveal>

        <Reveal direction="left" delay={0.08}>
          <SectionHeading
            eyebrow={intro.eyebrow}
            heading={intro.heading}
            align="left"
          />

          <Prose text={intro.body} className="mt-5" />

          {intro.highlights.length > 0 && (
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {intro.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2.5">
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-relaxed text-navy-700 dark:text-navy-300">
                    {highlight}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {intro.buttonLabel && intro.buttonLink && (
            <ButtonLink href={intro.buttonLink} className="mt-9" size="lg">
              {intro.buttonLabel}
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          )}
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Why choose us                                                       */
/* ------------------------------------------------------------------ */

export function WhyChooseUsSection({
  heading,
  items,
}: {
  heading: HomeSectionHeading;
  items: WhyChooseUsItem[];
}) {
  if (items.length === 0) return null;

  return (
    <Section muted>
      <div className="container-page">
        <Reveal>
          <SectionHeading
            eyebrow={heading.eyebrow}
            heading={heading.heading}
            description={heading.description}
            className="mx-auto"
          />
        </Reveal>

        <Stagger as="ul" className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <StaggerItem as="li" key={item.id}>
              <article className="group surface-card h-full p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift dark:hover:border-brand-500/40">
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center rounded-2xl bg-linear-135 from-brand-600 to-accent-500 text-white shadow-[0_8px_22px_-8px_rgba(34,197,94,0.7)] transition-transform duration-300 group-hover:scale-105"
                >
                  <Icon name={item.icon} className="size-5.5" />
                </span>

                <h3 className="mt-5 text-lg font-semibold text-navy-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-navy-600 dark:text-navy-300">
                  {item.description}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Featured services                                                   */
/* ------------------------------------------------------------------ */

export function FeaturedServicesSection({
  heading,
  services,
}: {
  heading: HomeSectionHeading;
  services: Service[];
}) {
  return (
    <Section>
      <div className="container-page">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <SectionHeading
              eyebrow={heading.eyebrow}
              heading={heading.heading}
              description={heading.description}
              align="left"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <ButtonLink href="/services" variant="outline" className="shrink-0">
              All sectors
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </Reveal>
        </div>

        {services.length === 0 ? (
          <EmptyState
            className="mt-12"
            title="No services published yet"
            description="Add your first service from the admin panel and it will appear here."
          />
        ) : (
          <Stagger as="ul" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <StaggerItem as="li" key={service.id} className="h-full">
                <ServiceCard service={service} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Featured portfolio                                                  */
/* ------------------------------------------------------------------ */

export function FeaturedPortfolioSection({
  heading,
  projects,
}: {
  heading: HomeSectionHeading;
  projects: PortfolioProject[];
}) {
  return (
    <Section muted>
      <div className="container-page">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <SectionHeading
              eyebrow={heading.eyebrow}
              heading={heading.heading}
              description={heading.description}
              align="left"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <ButtonLink href="/portfolio" variant="outline" className="shrink-0">
              View all mandates
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </Reveal>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            className="mt-12"
            title="No mandates published yet"
            description="Publish a mandate from the admin panel to list it here."
          />
        ) : (
          <Stagger as="ul" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <StaggerItem as="li" key={project.id} className="h-full">
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Call to action                                                      */
/* ------------------------------------------------------------------ */

export function CtaSection({ cta }: { cta: HomeCta }) {
  return (
    <Section spacing="lg">
      <div className="container-page">
        <Reveal>
          <div className="band-blue relative isolate overflow-hidden rounded-4xl px-6 py-16 text-center shadow-[0_24px_60px_-24px_rgb(37_99_235_/_0.6)] sm:px-14 sm:py-20">
            {cta.backgroundImage && (
              <div aria-hidden className="absolute inset-0 -z-2">
                <SmartImage
                  src={cta.backgroundImage}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover opacity-15 mix-blend-overlay"
                />
              </div>
            )}

            <div
              aria-hidden
              className="absolute inset-0 -z-1"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 60% 70% at 50% 0%, rgba(255,255,255,0.18), transparent 65%), radial-gradient(ellipse 45% 50% at 85% 100%, rgba(255,255,255,0.10), transparent 60%)",
              }}
            />

            <div className="relative mx-auto max-w-2xl">
              {cta.eyebrow && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-white/85 uppercase">
                  <span aria-hidden className="size-1.5 rounded-full bg-brand-400" />
                  {cta.eyebrow}
                </span>
              )}

              <h2 className="mt-6 text-3xl leading-[1.1] font-semibold text-white sm:text-4xl lg:text-[2.9rem]">
                {cta.heading}
              </h2>

              {cta.description && (
                <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/65 sm:text-base">
                  {cta.description}
                </p>
              )}

              {/* White button on the blue band — the strongest contrast pair
                  available, so the primary action stays unmistakable. */}
              <ButtonLink
                href={cta.buttonLink}
                size="lg"
                className="mt-9 bg-white bg-none text-brand-700 shadow-[0_10px_30px_-10px_rgb(0_0_0_/_0.35)] hover:bg-brand-50 hover:text-brand-800"
              >
                {cta.buttonLabel}
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
