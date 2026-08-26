import {
  Calendar,
  ClipboardList,
  FileText,
  ListChecks,
  Megaphone,
  MoreHorizontal,
  Repeat,
  Users,
  Tag,
  Mail,
  BarChart3,
  Globe,
  Palette,
  Video,
  Camera,
  Search,
  Lock,
  type LucideIcon,
} from "lucide-react";

export const ICON_REGISTRY: Record<string, LucideIcon> = {
  Calendar,
  ClipboardList,
  FileText,
  ListChecks,
  Megaphone,
  MoreHorizontal,
  Repeat,
  Users,
  Tag,
  Mail,
  BarChart3,
  Globe,
  Palette,
  Video,
  Camera,
  Search,
  Lock,
};

export const ICON_NAMES = Object.keys(ICON_REGISTRY);

export function resolveIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Tag;
  return ICON_REGISTRY[name] ?? Tag;
}
