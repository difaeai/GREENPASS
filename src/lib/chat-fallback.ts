import "server-only";

import { getServices, getProjects } from "@/lib/services/collections";
import { getAboutContent, getWebsiteSettings } from "@/lib/services/content";
import { toPlainText, truncate } from "@/lib/utils";

/**
 * Keyword-matched answers, used when no `ANTHROPIC_API_KEY` is configured.
 *
 * This is not an AI — it retrieves the most relevant passage from the site's
 * own content and says so. It exists so the chat widget is useful out of the
 * box, and so a missing key degrades to something honest rather than a broken
 * button. It never fabricates: if nothing matches, it says nothing matched.
 */

interface Entry {
  keywords: string[];
  answer: string;
}

/**
 * Longer keywords score higher, so a specific phrase ("who leads") outranks a
 * generic word ("company") that happens to appear in the same question.
 */
function score(question: string, keywords: string[]): number {
  const text = question.toLowerCase();
  return keywords.reduce(
    (total, keyword) => (text.includes(keyword) ? total + keyword.length : total),
    0,
  );
}

export async function localAnswer(question: string): Promise<string> {
  const [settings, about, services, projects] = await Promise.all([
    getWebsiteSettings(),
    getAboutContent(),
    getServices(),
    getProjects(),
  ]);

  const entries: Entry[] = [
    {
      keywords: ["about", "what do you do", "greenpass", "background", "tell me about"],
      // The footer text is a sentence fragment starting with a capital, so it
      // is spliced in lowercased to read as one sentence.
      answer:
        `${settings.companyName} is ` +
        toPlainText(settings.footerText).replace(/^./, (c) => c.toLowerCase()),
    },
    {
      keywords: ["vision"],
      answer: `Our vision: ${toPlainText(about.vision.body)}`,
    },
    {
      keywords: ["mission"],
      answer: `Our mission: ${toPlainText(about.mission.body)}`,
    },
    {
      keywords: ["value", "principle", "how you work", "approach"],
      answer: about.coreValues.items
        .map((value) => `${value.title}: ${toPlainText(value.description)}`)
        .join(" "),
    },
    {
      keywords: [
        "ceo",
        "leader",
        "leads",
        "leadership",
        "founder",
        "team",
        "who runs",
        "who leads",
        "chief",
        "executive",
        "management",
        "in charge",
      ],
      answer: `${about.ceo.name}, ${about.ceo.designation}. ${truncate(toPlainText(about.ceo.message), 240)} You can read more on the /about page.`,
    },
    {
      keywords: ["contact", "email", "reach", "phone", "whatsapp", "call", "briefing", "talk"],
      answer: [
        `Email ${settings.email}`,
        settings.whatsapp ? `WhatsApp ${settings.whatsapp}` : null,
        settings.phone ? `phone ${settings.phone}` : null,
      ]
        .filter(Boolean)
        .join(", ") + `. Or use the form on /contact — introductions to specific mandates follow a short qualification conversation.`,
    },
    {
      keywords: ["where", "location", "based", "office", "address", "islamabad", "pakistan"],
      answer: `We're headquartered at ${settings.address.replace(/\n/g, ", ")}. We work across Pakistan and Saudi Arabia.`,
    },
    {
      keywords: ["hour", "open", "time", "when"],
      answer: settings.businessHours.length
        ? `Our hours: ${settings.businessHours.map((h) => `${h.day} ${h.hours}`).join("; ")}.`
        : `Email ${settings.email} and we'll come back to you.`,
    },
    {
      keywords: ["sector", "service", "offer", "focus", "what areas"],
      answer:
        `We work across three sectors: ${services.map((s) => s.title).join(", ")}. ` +
        `See /services for the detail on each.`,
    },
    {
      keywords: ["mandate", "opportunity", "project", "portfolio", "invest", "deal"],
      answer:
        `We currently have ${projects.length} active mandates across our three sectors — these are open opportunities, not completed projects. See /portfolio, and note that introductions happen after a short qualification conversation.`,
    },
  ];

  // Each sector answers to its own name.
  for (const service of services) {
    entries.push({
      keywords: [service.title.toLowerCase(), service.slug.replace(/-/g, " ")],
      answer: `${service.title}: ${toPlainText(service.shortDescription)} More at /services/${service.slug}.`,
    });
  }

  const best = entries
    .map((entry) => ({ entry, hits: score(question, entry.keywords) }))
    .filter((candidate) => candidate.hits > 0)
    .sort((a, b) => b.hits - a.hits)[0];

  if (!best) {
    return (
      `I don't have an answer to that in the site content I can search. ` +
      `Email ${settings.email} or use the form on /contact and someone will get back to you.`
    );
  }

  return truncate(best.entry.answer, 480);
}
