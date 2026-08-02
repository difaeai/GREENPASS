"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section";
import type { HomeSectionHeading, StatItem } from "@/types";

/** Ease-out curve — fast at the start, settles gently on the final value. */
const easeOut = (t: number) => 1 - (1 - t) ** 3;

function useCountUp(target: number, active: boolean, duration = 1800) {
  const [value, setValue] = useState(0);
  const reduceMotion = useReducedMotion();
  const animate = active && !reduceMotion;

  useEffect(() => {
    if (!animate) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(easeOut(progress) * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, animate, duration]);

  // Without animation the number is shown outright rather than counted up.
  return reduceMotion ? target : value;
}

function StatTile({ stat, active }: { stat: StatItem; active: boolean }) {
  const value = useCountUp(stat.value, active);

  return (
    <div className="group relative flex flex-col items-center gap-3 px-4 py-8 text-center sm:py-10">
      {stat.icon && (
        <span
          aria-hidden
          className="flex size-11 items-center justify-center rounded-2xl bg-white/10 text-brand-300 ring-1 ring-white/12 transition-colors duration-300 group-hover:bg-brand-500/20 group-hover:text-brand-200"
        >
          <Icon name={stat.icon} className="size-5" />
        </span>
      )}

      <p className="font-display text-4xl font-semibold tracking-tight text-white tabular-nums sm:text-5xl">
        {stat.prefix}
        {value.toLocaleString("en-US")}
        {stat.suffix}
      </p>

      <p className="text-[13px] font-medium tracking-wide text-white/55 uppercase">{stat.label}</p>
    </div>
  );
}

export function StatsSection({
  heading,
  items,
}: {
  heading: HomeSectionHeading;
  items: StatItem[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  if (items.length === 0) return null;

  return (
    <section className="band-blue relative isolate overflow-hidden py-20 sm:py-24">
      {/* Light-catching highlights keep the flat gradient from looking dead. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-1"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 55% 60% at 18% 8%, rgba(255,255,255,0.16), transparent 60%), radial-gradient(ellipse 45% 50% at 88% 92%, rgba(255,255,255,0.10), transparent 60%)",
        }}
      />
      <div aria-hidden className="grid-backdrop absolute inset-0 -z-1 opacity-15" />

      <div className="container-page" ref={ref}>
        <SectionHeading
          eyebrow={heading.eyebrow}
          heading={heading.heading}
          description={heading.description}
          className="[&_h2]:text-white [&_p]:text-white/60 [&>span]:border-white/20 [&>span]:bg-white/10 [&>span]:text-white/85"
        />

        <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/18 ring-1 ring-white/20 lg:grid-cols-4">
          {items.map((stat) => (
            <div key={stat.id} className="bg-brand-700/35 backdrop-blur-sm">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <StatTile stat={stat} active={inView} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
