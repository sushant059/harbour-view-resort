import { Armchair, BedDouble, Building2, Car, Crown, Flower2, Frame, KeyRound, Layers, PawPrint, Siren, Sofa, Sun, Users, UtensilsCrossed, Waves, Wine, type LucideIcon } from "lucide-react";
import type { IconName } from "@/lib/types";

const ICONS: Record<IconName, LucideIcon> = {
  layers: Layers,
  sofa: Sofa,
  bed: BedDouble,
  rug: Frame,
  armchair: Armchair,
  paw: PawPrint,
  siren: Siren,
  key: KeyRound,
  building: Building2,
  crown: Crown,
  waves: Waves,
  spa: Flower2,
  utensils: UtensilsCrossed,
  glass: Wine,
  car: Car,
  users: Users,
  sun: Sun,
};

export function ServiceIcon({ name, className }: { name: IconName; className?: string }) {
  const Icon = ICONS[name] ?? Layers;
  return <Icon className={className} aria-hidden />;
}
