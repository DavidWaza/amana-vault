import type { ReactNode } from "react";

export type JourneyOption = {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  image?: string;
};

/** Local Lagos / Nigeria residential photography (Ferdinand Asakome @oshorhenoya, Unsplash). */
const BJ = "/build-journey";

const IMG = {
  duplex: `${BJ}/duplex.jpg`,
  bungalow: `${BJ}/bungalow.jpg`,
  villa: `${BJ}/villa.jpg`,
  apartments: `${BJ}/apartments.jpg`,
  investment: `${BJ}/investment.jpg`,
  multiFamily: `${BJ}/multi-family.jpg`,
  modernTropical: `${BJ}/modern-tropical.jpg`,
  afroModern: `${BJ}/afro-modern.jpg`,
  contemporary: `${BJ}/interior-1.jpg`,
  classicNigerian: `${BJ}/classic-nigerian.jpg`,
  ecoFriendly: `${BJ}/eco-friendly.jpg`,
  hero: `${BJ}/hero.jpg`,
};

export const BUILD_JOURNEY_HERO = IMG.hero;

export const PROJECT_TYPE_OPTIONS: JourneyOption[] = [
  {
    id: "family_home",
    label: "Family Home",
    description: "A comfortable home built for everyday living and long-term family life.",
  },
  {
    id: "apartments",
    label: "Apartments",
    description: "Multi-unit residential buildings for rental or personal investment.",
  },
  {
    id: "commercial",
    label: "Commercial",
    description: "Office, retail, or mixed-use spaces designed for business growth.",
  },
  {
    id: "hospitality",
    label: "Hospitality",
    description: "Hotels, guest houses, and leisure properties with standout guest experiences.",
  },
  {
    id: "renovation",
    label: "Renovation",
    description: "Transform or expand an existing structure with a clear scope and budget.",
  },
  {
    id: "community",
    label: "Community",
    description: "Schools, worship centres, and shared spaces that serve many people.",
  },
  {
    id: "something_else",
    label: "Something Else",
    description: "A unique project vision that does not fit the categories above.",
  },
];

export const HOME_TYPE_OPTIONS: JourneyOption[] = [
  {
    id: "duplex",
    label: "Duplex",
    description: "Two-level home with shared or separate living spaces.",
    image: IMG.duplex,
  },
  {
    id: "bungalow",
    label: "Bungalow",
    description: "Single-storey home with easy access and efficient layout.",
    image: IMG.bungalow,
  },
  {
    id: "villa",
    label: "Villa / Mansion",
    description: "Spacious luxury residence with premium finishes.",
    image: IMG.villa,
  },
  {
    id: "apartments",
    label: "Apartments",
    description: "Stacked units designed for density and rental yield.",
    image: IMG.apartments,
  },
  {
    id: "investment",
    label: "Investment Property",
    description: "Built primarily for income, resale, or portfolio growth.",
    image: IMG.investment,
  },
  {
    id: "multi_family",
    label: "Multi-family Home",
    description: "Several households under one coordinated build programme.",
    image: IMG.multiFamily,
  },
];

export const STYLE_OPTIONS: JourneyOption[] = [
  {
    id: "modern_tropical",
    label: "Modern Tropical",
    description: "Open plans, natural ventilation, and warm contemporary lines.",
    image: IMG.modernTropical,
  },
  {
    id: "afro_modern",
    label: "Afro Modern",
    description: "Contemporary design rooted in African materials and identity.",
    image: `${BJ}/interior-2.jpg`,
  },
  {
    id: "contemporary_luxury",
    label: "Contemporary Luxury",
    description: "Premium finishes, statement architecture, and refined detail.",
    image: IMG.contemporary,
  },
  {
    id: "classic_nigerian",
    label: "Classic Nigerian",
    description: "Timeless forms with familiar proportions and local character.",
    image: IMG.classicNigerian,
  },
  {
    id: "eco_friendly",
    label: "Eco-Friendly",
    description: "Sustainable materials, passive cooling, and efficient systems.",
    image: IMG.ecoFriendly,
  },
];

export const FEEL_OPTIONS: JourneyOption[] = [
  { id: "warm_family", label: "Warm & Family-Oriented" },
  { id: "modern_elegant", label: "Modern & Elegant" },
  { id: "luxurious", label: "Luxurious" },
  { id: "smart_home", label: "Smart Home Ready" },
  { id: "peaceful", label: "Peaceful & Private" },
  { id: "entertaining", label: "Great for Entertaining" },
  { id: "minimal", label: "Minimal & Calm" },
  { id: "bold", label: "Bold & Statement-Making" },
  { id: "natural", label: "Connected to Nature" },
  { id: "heritage", label: "Rooted in Heritage" },
  { id: "resort", label: "Resort-Like Escape" },
  { id: "practical", label: "Practical & Low-Maintenance" },
];

export const JOURNEY_STAGE_OPTIONS: JourneyOption[] = [
  {
    id: "own_land",
    label: "I already own land",
    description: "You have a plot and are ready to move into design or construction.",
  },
  {
    id: "looking_for_land",
    label: "I am looking for land",
    description: "You need help finding or evaluating land before design begins.",
  },
  {
    id: "only_design",
    label: "I only need a design",
    description: "You want architectural drawings before choosing a contractor.",
  },
  {
    id: "have_drawings",
    label: "I already have drawings",
    description: "Your plans are ready and you need contractor bids or vault setup.",
  },
  {
    id: "have_contractor",
    label: "I already have a contractor",
    description: "Your build team is chosen and you want milestone protection next.",
  },
];

export const PROJECT_RANGE_OPTIONS: JourneyOption[] = [
  {
    id: "starter",
    label: "Starter",
    description: "₦20M – ₦50M",
  },
  {
    id: "family",
    label: "Family",
    description: "₦50M – ₦150M",
  },
  {
    id: "premium",
    label: "Premium",
    description: "₦150M – ₦300M",
  },
  {
    id: "luxury",
    label: "Luxury",
    description: "₦300M+",
  },
];

export const PRIORITY_OPTIONS: JourneyOption[] = [
  { id: "security", label: "Security & Privacy" },
  { id: "natural_light", label: "Natural Light" },
  { id: "fast_completion", label: "Fast Completion" },
  { id: "future_expansion", label: "Future Expansion" },
  { id: "energy_efficiency", label: "Energy Efficiency" },
  { id: "outdoor_living", label: "Outdoor Living" },
  { id: "smart_home", label: "Smart Home Ready" },
  { id: "low_maintenance", label: "Low Maintenance" },
  { id: "accessibility", label: "Accessibility" },
  { id: "rental_yield", label: "Rental Yield" },
];

export const ARCHITECT_FEE_PERCENTS = [3, 5, 7.5, 10, 12.5, 15] as const;

export const WELCOME_TRUST_ITEMS = [
  "Trusted Professionals",
  "Transparent Process",
  "Secure & Confidential",
] as const;

export function labelForOption(
  options: JourneyOption[],
  id: string,
  fallback = "—",
): string {
  return options.find((item) => item.id === id)?.label ?? fallback;
}

export function labelForStyle(form: { style: string; customStyle: string }): string {
  if (form.style === "custom") return form.customStyle.trim() || "Custom Style";
  return labelForOption(STYLE_OPTIONS, form.style);
}
