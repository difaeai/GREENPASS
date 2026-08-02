import { Quote } from "lucide-react";

import { TeamCard } from "@/components/public/cards";
import { Icon } from "@/components/ui/icon";
import { EmptyState, Prose } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { SmartImage } from "@/components/ui/smart-image";
import type { AboutContent, TeamMember } from "@/types";

/* ------------------------------------------------------------------ */
/* Introduction                                                        */
/* ------------------------------------------------------------------ */

export function AboutIntro({ intro }: { intro: AboutContent["intro"] }) {
  return (
    <Section spacing="lg">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal direction="right">
          <div className="relative">
            <div className="relative aspect-4/5 overflow-hidden rounded-4xl bg-navy-100 shadow-lift sm:aspect-4/3 lg:aspect-4/5 dark:bg-navy-900">
              <SmartImage
                src={intro.image}
                alt={intro.heading}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                fallbackLabel="Our team"
              />
            </div>

            {intro.secondaryImage && (
              <div className="absolute -right-5 -bottom-8 hidden aspect-4/3 w-2/5 overflow-hidden rounded-3xl border-4 border-white shadow-lift sm:block lg:-right-10 dark:border-navy-950">
                <SmartImage
                  src={intro.secondaryImage}
                  alt=""
                  fill
                  sizes="240px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </Reveal>

        <Reveal direction="left" delay={0.08}>
          <SectionHeading eyebrow={intro.eyebrow} heading={intro.heading} align="left" />
          <Prose text={intro.body} className="mt-6" />
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Vision & mission                                                    */
/* ------------------------------------------------------------------ */

export function VisionMission({
  vision,
  mission,
}: {
  vision: AboutContent["vision"];
  mission: AboutContent["mission"];
}) {
  const panels = [
    { ...vision, tone: "from-brand-700 to-brand-500" },
    { ...mission, tone: "from-accent-600 to-accent-400" },
  ];

  return (
    <Section muted spacing="md">
      <div className="container-page grid gap-6 lg:grid-cols-2">
        {panels.map((panel, index) => (
          <Reveal key={panel.heading} delay={index * 0.1} className="h-full">
            <article className="surface-card group h-full p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-10">
              <span
                aria-hidden
                className={`flex size-13 items-center justify-center rounded-2xl bg-linear-135 ${panel.tone} text-white shadow-[0_10px_26px_-10px_rgba(37,99,235,0.7)] transition-transform duration-300 group-hover:scale-105`}
              >
                <Icon name={panel.icon} className="size-6" />
              </span>

              <h2 className="mt-6 text-2xl font-semibold text-navy-950 dark:text-white">
                {panel.heading}
              </h2>
              <Prose text={panel.body} className="mt-4" />
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Core values                                                         */
/* ------------------------------------------------------------------ */

export function CoreValues({ coreValues }: { coreValues: AboutContent["coreValues"] }) {
  if (coreValues.items.length === 0) return null;

  return (
    <Section>
      <div className="container-page">
        <Reveal>
          <SectionHeading
            eyebrow={coreValues.heading.eyebrow}
            heading={coreValues.heading.heading}
            description={coreValues.heading.description}
            className="mx-auto"
          />
        </Reveal>

        <Stagger as="ul" className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.items.map((value) => (
            <StaggerItem as="li" key={value.id} className="h-full">
              <article className="surface-card group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift dark:hover:border-brand-500/40">
                <span
                  aria-hidden
                  className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/12 dark:text-brand-300"
                >
                  <Icon name={value.icon} className="size-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-navy-950 dark:text-white">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600 dark:text-navy-300">
                  {value.description}
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
/* History timeline                                                    */
/* ------------------------------------------------------------------ */

export function HistoryTimeline({ history }: { history: AboutContent["history"] }) {
  if (history.milestones.length === 0) return null;

  return (
    <Section muted>
      <div className="container-page">
        <Reveal>
          <SectionHeading
            eyebrow={history.heading.eyebrow}
            heading={history.heading.heading}
            description={history.heading.description}
            className="mx-auto"
          />
        </Reveal>

        <ol className="relative mx-auto mt-16 max-w-3xl">
          {/* Spine */}
          <span
            aria-hidden
            className="absolute top-2 bottom-2 left-[7px] w-px bg-linear-to-b from-brand-500 via-brand-300 to-transparent sm:left-1/2 sm:-translate-x-1/2 dark:via-brand-500/40"
          />

          {history.milestones.map((milestone, index) => (
            <li key={milestone.id} className="relative pb-10 last:pb-0">
              <Reveal
                direction={index % 2 === 0 ? "right" : "left"}
                className={`relative pl-9 sm:w-1/2 sm:pl-0 ${
                  index % 2 === 0
                    ? "sm:pr-11 sm:text-right"
                    : "sm:ml-auto sm:pl-11 sm:text-left"
                }`}
              >
                {/* Node */}
                <span
                  aria-hidden
                  className={`absolute top-1.5 left-0 flex size-3.5 items-center justify-center rounded-full bg-brand-600 ring-4 ring-brand-100 sm:left-auto dark:ring-brand-500/20 ${
                    index % 2 === 0
                      ? "sm:right-0 sm:translate-x-1/2"
                      : "sm:left-0 sm:-translate-x-1/2"
                  }`}
                />

                <span className="font-display text-sm font-bold tracking-wide text-brand-600 dark:text-brand-400">
                  {milestone.year}
                </span>
                <h3 className="mt-1.5 text-lg font-semibold text-navy-950 dark:text-white">
                  {milestone.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600 dark:text-navy-300">
                  {milestone.description}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* CEO message                                                         */
/* ------------------------------------------------------------------ */

export function CeoMessageSection({ ceo }: { ceo: AboutContent["ceo"] }) {
  if (!ceo.message) return null;

  return (
    <Section spacing="lg">
      <div className="container-page">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-4xl bg-navy-950 text-white">
            <div
              aria-hidden
              className="absolute inset-0 -z-1"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 55% 65% at 12% 10%, rgba(37,99,235,0.32), transparent 62%), radial-gradient(ellipse 45% 50% at 92% 88%, rgba(14,165,233,0.20), transparent 60%)",
              }}
            />

            <div className="grid gap-0 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div className="relative min-h-72 lg:min-h-full">
                <SmartImage
                  src={ceo.photo}
                  alt={ceo.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-top"
                  fallbackLabel={ceo.name}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-950/25 to-transparent lg:bg-linear-to-r lg:from-transparent lg:via-navy-950/20 lg:to-navy-950"
                />
              </div>

              <div className="relative p-8 sm:p-12 lg:py-16 lg:pr-14 lg:pl-4">
                <Quote aria-hidden className="size-10 text-brand-400/45" />

                <div className="mt-6 space-y-4 text-[15px] leading-[1.8] text-white/72 sm:text-base">
                  {ceo.message
                    .split(/\n\s*\n/)
                    .map((paragraph) => paragraph.trim())
                    .filter(Boolean)
                    .map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                </div>

                <div className="mt-9 flex flex-wrap items-end justify-between gap-6 border-t border-white/12 pt-7">
                  <div>
                    <p className="font-display text-lg font-semibold text-white">{ceo.name}</p>
                    <p className="mt-1 text-sm text-brand-300">{ceo.designation}</p>
                  </div>

                  {ceo.signatureImage && (
                    <div className="relative h-14 w-40 shrink-0">
                      <SmartImage
                        src={ceo.signatureImage}
                        alt={`${ceo.name}'s signature`}
                        fill
                        sizes="160px"
                        className="object-contain object-right brightness-0 invert"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */

export function TeamSection({
  heading,
  members,
}: {
  heading: AboutContent["team"];
  members: TeamMember[];
}) {
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

        {members.length === 0 ? (
          <EmptyState
            className="mt-12"
            title="No team members published yet"
            description="Add team members from the admin panel to introduce your people here."
          />
        ) : (
          <Stagger as="ul" className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((member) => (
              <StaggerItem as="li" key={member.id} className="h-full">
                <TeamCard member={member} className="h-full" />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </Section>
  );
}
