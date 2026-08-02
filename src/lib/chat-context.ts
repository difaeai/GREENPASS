import "server-only";
import { cache } from "react";

import { getServices, getProjects, getTeamMembers } from "@/lib/services/collections";
import { getAboutContent, getHomeContent, getWebsiteSettings } from "@/lib/services/content";
import { toPlainText } from "@/lib/utils";

/**
 * Builds the assistant's knowledge base from the live site content.
 *
 * Everything the chat assistant knows comes from Firestore — the same
 * documents the public pages render. Editing a sector description in the admin
 * panel changes what the assistant says about it, with no code change and no
 * separate knowledge base to keep in sync.
 */

export const buildKnowledgeBase = cache(async (): Promise<string> => {
  const [settings, home, about, services, projects, team] = await Promise.all([
    getWebsiteSettings(),
    getHomeContent(),
    getAboutContent(),
    getServices(),
    getProjects(),
    getTeamMembers(),
  ]);

  const sections: string[] = [];

  sections.push(
    [
      "## Company",
      `Name: ${settings.companyName}`,
      `Tagline: ${settings.tagline}`,
      `Headquarters: ${settings.address.replace(/\n/g, ", ")}`,
      `Email: ${settings.email}`,
      settings.phone ? `Phone: ${settings.phone}` : null,
      settings.whatsapp ? `WhatsApp: ${settings.whatsapp}` : null,
      settings.businessHours.length
        ? `Business hours: ${settings.businessHours.map((h) => `${h.day} ${h.hours}`).join("; ")}`
        : null,
      `About: ${toPlainText(settings.footerText)}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  sections.push(
    [
      "## Vision, mission and story",
      `Vision: ${toPlainText(about.vision.body)}`,
      `Mission: ${toPlainText(about.mission.body)}`,
      `Story: ${toPlainText(about.intro.body)}`,
      about.coreValues.items.length
        ? `Values: ${about.coreValues.items.map((v) => `${v.title} — ${toPlainText(v.description)}`).join(" | ")}`
        : null,
      about.history.milestones.length
        ? `How an engagement runs: ${about.history.milestones
            .map((m) => `${m.year}. ${m.title}: ${toPlainText(m.description)}`)
            .join(" | ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  if (services.length > 0) {
    sections.push(
      [
        "## Focus sectors (public page: /services)",
        ...services.map((service) =>
          [
            `### ${service.title}  (/services/${service.slug})`,
            toPlainText(service.shortDescription),
            toPlainText(service.fullDescription),
            service.features.length ? `Covers: ${service.features.join("; ")}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        ),
      ].join("\n\n"),
    );
  }

  if (projects.length > 0) {
    sections.push(
      [
        "## Active mandates (public page: /portfolio)",
        "These are open opportunities, not completed case studies. Never describe them as delivered work.",
        ...projects.map((project) =>
          [
            `### ${project.title}  (/portfolio/${project.slug})`,
            `Sector: ${project.categoryName}. Open to: ${project.clientName}.`,
            toPlainText(project.shortDescription),
            toPlainText(project.description),
          ]
            .filter(Boolean)
            .join("\n"),
        ),
      ].join("\n\n"),
    );
  }

  if (team.length > 0) {
    sections.push(
      [
        "## Leadership (public page: /about)",
        ...team.map((m) => `${m.name} — ${m.position}. ${toPlainText(m.description)}`),
      ].join("\n"),
    );
  }

  sections.push(
    [
      "## Site map",
      "/ — home",
      "/about — vision, mission, values, leadership",
      "/services — the three focus sectors",
      "/portfolio — active mandates",
      "/contact — request a briefing (contact form)",
      `Call to action: ${toPlainText(home.cta.description)}`,
    ].join("\n"),
  );

  return sections.join("\n\n---\n\n");
});

/** Instructions that govern how the assistant behaves. */
export const buildSystemPrompt = (knowledge: string, companyName: string) =>
  `You are the website assistant for ${companyName}. You answer questions from visitors — prospective partners, investors and clients — about the company.

<rules>
Answer ONLY from the company information below. It is the complete set of facts you have.

If the information does not cover something — pricing, deal terms, specific parcels or reserves, timelines, headcount, financials, past clients, anything at all — say plainly that you don't have that detail and point the visitor to the contact page or ${"email"}. Never guess, never estimate, never fill a gap with something that sounds plausible. An honest "I don't know, here's who does" is the correct answer and is always better than an invented one.

Do not invent statistics, client names, testimonials, deal values, or dates. Do not speculate about what the company might do.

The mandates listed are OPEN OPPORTUNITIES, not completed projects. Never imply the company has delivered them.

Introductions to specific mandates require a qualification conversation — say so rather than promising access.
</rules>

<style>
Keep answers short: two or three sentences for most questions. This is a chat widget, not a document.
Be direct and professional. No bullet lists unless the visitor asks for a comparison.
Link to the relevant page when it helps, using its path — for example /services/real-estate.
Never use markdown headings, bold, or tables. Plain sentences only.
</style>

<company_information>
${knowledge}
</company_information>`;
