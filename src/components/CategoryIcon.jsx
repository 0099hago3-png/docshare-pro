import {
  Atom,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Code2,
  Cog,
  Cpu,
  Database,
  Dna,
  DraftingCompass,
  FlaskConical,
  Globe2,
  GraduationCap,
  Landmark,
  Languages,
  MonitorCog,
  Scale,
  ShieldCheck,
  Sigma,
  Stethoscope,
  TrendingUp,
  UsersRound,
  Zap,
} from 'lucide-react';

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const rules = [
  { keys: ['cong nghe thong tin', 'cntt', 'information technology'], icon: MonitorCog, key: 'it' },
  { keys: ['lap trinh', 'programming', 'phan mem'], icon: Code2, key: 'programming' },
  { keys: ['phat trien web', 'web', 'frontend', 'backend'], icon: Globe2, key: 'web' },
  { keys: ['co so du lieu', 'database', 'sql', 'postgresql'], icon: Database, key: 'database' },
  { keys: ['tri tue nhan tao', 'artificial intelligence', 'machine learning'], icon: BrainCircuit, key: 'ai' },
  { keys: ['an toan thong tin', 'bao mat', 'cyber', 'security'], icon: ShieldCheck, key: 'security' },
  { keys: ['toan hoc', 'math'], icon: Sigma, key: 'math' },
  { keys: ['vat ly', 'physics'], icon: Atom, key: 'physics' },
  { keys: ['hoa hoc', 'chemistry'], icon: FlaskConical, key: 'chemistry' },
  { keys: ['sinh hoc', 'biology'], icon: Dna, key: 'biology' },
  { keys: ['kinh te', 'economics'], icon: TrendingUp, key: 'economics' },
  { keys: ['quan tri kinh doanh', 'business', 'marketing'], icon: BriefcaseBusiness, key: 'business' },
  { keys: ['ke toan', 'kiem toan', 'accounting'], icon: Calculator, key: 'accounting' },
  { keys: ['tai chinh', 'ngan hang', 'finance', 'banking'], icon: Landmark, key: 'finance' },
  { keys: ['ngoai ngu', 'language', 'tieng anh'], icon: Languages, key: 'language' },
  { keys: ['luat', 'law'], icon: Scale, key: 'law' },
  { keys: ['y duoc', 'y hoc', 'duoc hoc', 'medicine', 'pharmacy'], icon: Stethoscope, key: 'medicine' },
  { keys: ['dien dien tu', 'dien tu', 'electrical', 'electronics'], icon: Zap, key: 'electronics' },
  { keys: ['co khi', 'mechanical', 'oto', 'o to'], icon: Cog, key: 'mechanical' },
  { keys: ['xay dung', 'kien truc', 'construction', 'architecture'], icon: DraftingCompass, key: 'construction' },
  { keys: ['giao duc', 'su pham', 'education'], icon: GraduationCap, key: 'education' },
  { keys: ['ky nang mem', 'giao tiep', 'lam viec nhom', 'soft skill'], icon: UsersRound, key: 'soft-skills' },
  { keys: ['quan tri', 'management'], icon: Building2, key: 'management' },
];

export function getCategoryIconInfo(category) {
  const source = normalize([
    typeof category === 'object' ? category?.name : category,
    typeof category === 'object' ? category?.slug : '',
    typeof category === 'object' ? category?.id : '',
  ].filter(Boolean).join(' '));

  const matched = rules.find((rule) => rule.keys.some((key) => source.includes(normalize(key))));

  return matched || {
    icon: Cpu,
    key: 'general',
  };
}

export default function CategoryIcon({
  category,
  id,
  name,
  slug,
  size = 25,
  strokeWidth = 1.8,
  className = '',
}) {
  const info = getCategoryIconInfo(category || { id, name, slug });
  const Icon = info.icon || BookOpenCheck;

  return (
    <Icon
      className={className}
      data-category-icon={info.key}
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}
