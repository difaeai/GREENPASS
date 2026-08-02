import { ArrowUpRight, Calendar, Mail as MailIcon, Quote } from "lucide-react";
import Link from "next/link";
import type { SVGProps } from "react";

import { Icon } from "@/components/ui/icon";
import { Badge, Rating } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
} from "@/components/ui/social-icons";
import { cn, formatDate, initials } from "@/lib/utils";
import type { PortfolioProject, Service, TeamMember, Testimonial } from "@/types";

type SocialGlyph = (props: SVGProps<SVGSVGElement>) => React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Service card                                                        */
/* ------------------------------------------------------------------ */

export function ServiceCard({
  service,
  className,
}: {
  service: Service;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group surface-card relative flex h-full flex-col overflow-hidden p-0",
        "transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift",
        "dark:hover:border-brand-500/40",
        className,
      )}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-navy-100 dark:bg-navy-900">
        <SmartImage
          src={service.image}
          alt={service.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackLabel={service.title}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-navy-950/55 via-transparent to-transparent"
        />
        <span
          aria-hidden
          className="absolute bottom-4 left-4 flex size-11 items-center justify-center rounded-2xl bg-white/95 text-brand-600 shadow-soft backdrop-blur-sm dark:bg-navy-900/95 dark:text-brand-300"
        >
          <Icon name={service.icon} className="size-5" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold text-navy-950 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
          {service.title}
        </h3>
        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-navy-600 dark:text-navy-300">
          {service.shortDescription}
        </p>

        {service.features.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {service.features.slice(0, 3).map((feature) => (
              <li
                key={feature}
                className="rounded-full bg-navy-50 px-2.5 py-1 text-[11px] font-medium text-navy-600 dark:bg-navy-800/70 dark:text-navy-300"
              >
                {feature.length > 28 ? `${feature.slice(0, 27)}…` : feature}
              </li>
            ))}
          </ul>
        )}

        <Link
          href={`/services/${service.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          <span className="absolute inset-0" aria-hidden />
          Learn more
          <ArrowUpRight
            aria-hidden
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
          <span className="sr-only">about {service.title}</span>
        </Link>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Project card                                                        */
/* ------------------------------------------------------------------ */

export function ProjectCard({
  project,
  className,
  priority = false,
}: {
  project: PortfolioProject;
  className?: string;
  priority?: boolean;
}) {
  return (
    <article
      className={cn(
        "group surface-card relative flex h-full flex-col overflow-hidden p-0",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-navy-100 dark:bg-navy-900">
        <SmartImage
          src={project.featuredImage}
          alt={project.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-600 group-hover:scale-105"
          fallbackLabel={project.title}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-navy-950/80 via-navy-950/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95"
        />

        <div className="absolute inset-x-0 bottom-0 p-5">
          <Badge tone="brand" className="bg-white/90 text-brand-700 ring-white/40 backdrop-blur-sm">
            {project.categoryName}
          </Badge>
          <h3 className="mt-2.5 text-lg leading-snug font-semibold text-white">{project.title}</h3>
          <p className="mt-1 text-[13px] text-white/70">{project.clientName}</p>
        </div>

        <span
          aria-hidden
          className="absolute top-4 right-4 flex size-9 translate-y-1 items-center justify-center rounded-full bg-white/95 text-navy-900 opacity-0 shadow-soft transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex-1 text-sm leading-relaxed text-navy-600 dark:text-navy-300">
          {project.shortDescription}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-navy-50 px-2 py-0.5 text-[11px] font-medium text-navy-600 dark:bg-navy-800/70 dark:text-navy-300"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="text-[11px] font-medium text-navy-400">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>

        {project.completionDate && (
          <p className="mt-4 flex items-center gap-1.5 border-t border-navy-100 pt-3.5 text-[12px] text-navy-400 dark:border-navy-800 dark:text-navy-500">
            <Calendar aria-hidden className="size-3.5" />
            Completed {formatDate(project.completionDate, { month: "long", year: "numeric" })}
          </p>
        )}
      </div>

      <Link href={`/portfolio/${project.slug}`} className="absolute inset-0">
        <span className="sr-only">View the {project.title} case study</span>
      </Link>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Team card                                                           */
/* ------------------------------------------------------------------ */

export function TeamCard({ member, className }: { member: TeamMember; className?: string }) {
  const socials = [
    { href: member.linkedinUrl, Icon: LinkedInIcon, label: "LinkedIn" },
    { href: member.twitterUrl, Icon: XIcon, label: "X (Twitter)" },
    { href: member.facebookUrl, Icon: FacebookIcon, label: "Facebook" },
    { href: member.instagramUrl, Icon: InstagramIcon, label: "Instagram" },
    { href: member.email ? `mailto:${member.email}` : null, Icon: MailIcon, label: "Email" },
  ].filter(
    (social): social is { href: string; Icon: SocialGlyph; label: string } => Boolean(social.href),
  );

  return (
    <article
      className={cn(
        "group surface-card overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-4/5 overflow-hidden bg-navy-100 dark:bg-navy-900">
        {member.photo ? (
          <SmartImage
            src={member.photo}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-linear-135 from-brand-600 to-accent-500 text-4xl font-semibold text-white">
            {initials(member.name)}
          </div>
        )}

        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-navy-950/85 via-navy-950/5 to-transparent"
        />

        {socials.length > 0 && (
          <ul className="absolute inset-x-0 bottom-0 flex translate-y-3 justify-center gap-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {socials.map(({ href, Icon: SocialIcon, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={`${member.name} on ${label}`}
                  className="relative z-1 flex size-8.5 items-center justify-center rounded-full bg-white/95 text-navy-800 transition-colors hover:bg-brand-600 hover:text-white"
                >
                  <SocialIcon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-5 text-center">
        <h3 className="text-base font-semibold text-navy-950 dark:text-white">{member.name}</h3>
        <p className="mt-1 text-[13px] font-medium text-brand-600 dark:text-brand-400">
          {member.position}
        </p>
        {member.description && (
          <p className="mt-3 text-[13px] leading-relaxed text-navy-500 dark:text-navy-400">
            {member.description}
          </p>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Testimonial card                                                    */
/* ------------------------------------------------------------------ */

export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "surface-card flex h-full flex-col gap-5 p-7 sm:p-8",
        className,
      )}
    >
      <Quote aria-hidden className="size-8 shrink-0 text-brand-200 dark:text-brand-500/35" />

      <blockquote className="flex-1 text-[15px] leading-[1.75] text-navy-700 sm:text-base dark:text-navy-200">
        &ldquo;{testimonial.feedback}&rdquo;
      </blockquote>

      <Rating value={testimonial.rating} />

      <figcaption className="flex items-center gap-3.5 border-t border-navy-100 pt-5 dark:border-navy-800">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
          {testimonial.photo ? (
            <SmartImage
              src={testimonial.photo}
              alt={testimonial.name}
              fill
              sizes="44px"
              className="object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-sm font-semibold text-navy-500">
              {initials(testimonial.name)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-navy-950 dark:text-white">
            {testimonial.name}
          </p>
          <p className="truncate text-[13px] text-navy-500 dark:text-navy-400">
            {testimonial.designation
              ? `${testimonial.designation}, ${testimonial.company}`
              : testimonial.company}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
