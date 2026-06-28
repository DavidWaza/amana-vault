export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export type NigerianState = (typeof NIGERIAN_STATES)[number];

export type LandPriceOption = {
  id: string;
  label: string;
  description: string;
};

const TIER_1: NigerianState[] = ["Lagos", "Federal Capital Territory", "Rivers"];
const TIER_2: NigerianState[] = [
  "Ogun",
  "Oyo",
  "Edo",
  "Delta",
  "Enugu",
  "Anambra",
  "Kano",
  "Kaduna",
  "Kwara",
  "Nasarawa",
  "Akwa Ibom",
  "Cross River",
];

function stateSlug(state: string): string {
  return state.toLowerCase().replace(/\s+/g, "-");
}

function tierForState(state: string): 1 | 2 | 3 {
  if (TIER_1.includes(state as NigerianState)) return 1;
  if (TIER_2.includes(state as NigerianState)) return 2;
  return 3;
}

const TIER_RANGES: Record<
  1 | 2 | 3,
  Omit<LandPriceOption, "id">[]
> = {
  1: [
    {
      label: "Residential plot (outskirts)",
      description: "₦8M – ₦25M per plot",
    },
    {
      label: "Established neighbourhood",
      description: "₦25M – ₦80M per plot",
    },
    {
      label: "Prime / high-demand area",
      description: "₦80M – ₦200M+ per plot",
    },
    {
      label: "Commercial or mixed-use plot",
      description: "₦50M – ₦300M+ per plot",
    },
  ],
  2: [
    {
      label: "Residential plot (outskirts)",
      description: "₦3M – ₦12M per plot",
    },
    {
      label: "Established neighbourhood",
      description: "₦12M – ₦35M per plot",
    },
    {
      label: "Prime / high-demand area",
      description: "₦35M – ₦90M per plot",
    },
    {
      label: "Commercial or mixed-use plot",
      description: "₦20M – ₦120M per plot",
    },
  ],
  3: [
    {
      label: "Residential plot (outskirts)",
      description: "₦1.5M – ₦6M per plot",
    },
    {
      label: "Established neighbourhood",
      description: "₦6M – ₦18M per plot",
    },
    {
      label: "Prime / high-demand area",
      description: "₦18M – ₦45M per plot",
    },
    {
      label: "Commercial or mixed-use plot",
      description: "₦10M – ₦60M per plot",
    },
  ],
};

export function getLandPriceOptions(state: string): LandPriceOption[] {
  if (!state) return [];
  const tier = tierForState(state);
  const slug = stateSlug(state);
  return TIER_RANGES[tier].map((option, index) => ({
    id: `${slug}-tier${tier}-${index}`,
    ...option,
  }));
}

export function labelForLandPrice(state: string, rangeId: string): string {
  const option = getLandPriceOptions(state).find((item) => item.id === rangeId);
  if (!option) return "—";
  return `${option.label} (${option.description})`;
}

export const LAND_OWNERSHIP_DOC_HINTS = [
  "Certificate of Occupancy (C of O)",
  "Survey plan or beacon sheet",
  "Deed of assignment / conveyance",
  "Purchase receipt or allocation letter",
] as const;
