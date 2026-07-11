import {
  BookOpenCheck, BrainCircuit, BriefcaseBusiness, Building2, Calculator, Cpu,
  Database, DraftingCompass, Factory, Globe2, GraduationCap, HeartPulse, Landmark,
  Languages, Leaf, Megaphone, MonitorCog, Palette, Plane, Scale, Sigma, Stethoscope,
  Tractor, UsersRound, WalletCards, Zap,
} from 'lucide-react';

const icons = {
  all: BookOpenCheck,
  it: MonitorCog,
  database: Database,
  economy: BriefcaseBusiness,
  language: Languages,
  science: BrainCircuit,
  education: GraduationCap,
  media: Megaphone,
  math: Sigma,
  law: Scale,
  design: Palette,
  architecture: DraftingCompass,
  engineering: Factory,
  electronics: Zap,
  medicine: Stethoscope,
  social: UsersRound,
  agriculture: Tractor,
  tourism: Plane,
  finance: WalletCards,
  management: Building2,
  psychology: BrainCircuit,
};

export default function CategoryIcon({ id, size = 24, strokeWidth = 1.7 }) {
  const Icon = icons[id] || Cpu;
  return <Icon size={size} strokeWidth={strokeWidth}/>;
}
