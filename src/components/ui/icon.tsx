import * as Lucide from "lucide-react";
import type { LucideIcon, LucideProps } from "lucide-react";

/**
 * Renders a Lucide icon by its string name.
 *
 * Admins pick icons by name in the CMS, so the mapping has to happen at
 * runtime. Unknown names degrade to `Sparkles` instead of breaking the page.
 */

const ICON_MAP = Lucide as unknown as Record<string, LucideIcon>;

export const FALLBACK_ICON = "Sparkles";

export function resolveIcon(name?: string | null): LucideIcon {
  if (!name) return Lucide.Sparkles;
  const icon = ICON_MAP[name];
  return typeof icon === "function" || typeof icon === "object" ? icon : Lucide.Sparkles;
}

interface IconProps extends Omit<LucideProps, "ref" | "name"> {
  name?: string | null;
}

export function Icon({ name, ...props }: IconProps) {
  // Looked up, not constructed: `resolveIcon` returns the same module-level
  // component reference for a given name, so identity is stable across renders
  // and there is no state to reset. Admins pick icons by name in the CMS, so
  // the mapping has to happen at runtime.
  const Component = resolveIcon(name);
  // eslint-disable-next-line react-hooks/static-components
  return <Component aria-hidden {...props} />;
}

/**
 * Curated list offered in the admin icon picker. Kept short on purpose —
 * a searchable list of 1,400 icons is worse than 60 good ones.
 */
export const ICON_CHOICES = [
  "Sparkles", "Rocket", "Compass", "Target", "Eye", "Gem", "Lightbulb", "KeyRound",
  "ShieldCheck", "Lock", "Fingerprint", "BadgeCheck", "Award", "Trophy", "Star", "Heart",
  "Users", "UserCheck", "Handshake", "MessageSquare", "Headphones", "LifeBuoy", "PhoneCall", "Mail",
  "Globe2", "Map", "Building2", "Briefcase", "Factory", "Store", "Truck", "Plane",
  "Code2", "Terminal", "Braces", "GitBranch", "Cpu", "Server", "Database", "Cloud",
  "Smartphone", "Tablet", "Monitor", "Laptop", "Wifi", "Network", "Boxes", "Layers",
  "PenTool", "Palette", "Brush", "Figma", "LayoutDashboard", "Frame", "Wand2", "Component",
  "BrainCircuit", "Bot", "Zap", "TrendingUp", "BarChart3", "LineChart", "PieChart", "Activity",
  "Clock", "CalendarClock", "Timer", "Gauge", "Settings2", "Wrench", "Puzzle", "CheckCircle2",
] as const;
