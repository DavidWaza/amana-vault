import type { AgreementCategoryId } from "./types";

export type AgreementOption = { id: string; label: string };

export type AgreementSection = {
  id: string;
  title: string;
  multi: boolean;
  options: AgreementOption[];
  allowOther?: boolean;
  allowCustomInput?: boolean;
  customInputLabel?: string;
  customInputKey?: string;
};

export type AgreementCategoryConfig = {
  id: AgreementCategoryId;
  emoji: string;
  label: string;
  sections: AgreementSection[];
};

export const AGREEMENT_CATEGORIES: AgreementCategoryConfig[] = [
  {
    id: "plumbing",
    emoji: "🔧",
    label: "Plumbing",
    sections: [
      {
        id: "work_type",
        title: "What plumbing work?",
        multi: true,
        allowOther: true,
        options: [
          { id: "leak", label: "Fix leaking pipe" },
          { id: "new_pipes", label: "Install new pipes" },
          { id: "heater", label: "Install water heater" },
          { id: "fixtures", label: "Install toilet/bathroom fixtures" },
          { id: "pressure", label: "Fix water pressure issue" },
          { id: "tank", label: "Install water tank" },
        ],
      },
      {
        id: "work_location",
        title: "Where is the work?",
        multi: true,
        options: [
          { id: "kitchen", label: "Kitchen" },
          { id: "bathroom", label: "Bathroom" },
          { id: "house", label: "Entire house" },
          { id: "compound", label: "Compound/outside" },
          { id: "commercial", label: "Commercial building" },
        ],
      },
      {
        id: "materials_by",
        title: "Materials provided by",
        multi: false,
        options: [
          { id: "artisan", label: "Artisan" },
          { id: "customer", label: "Customer" },
          { id: "both", label: "Both" },
        ],
      },
      {
        id: "materials_included",
        title: "Materials included",
        multi: true,
        allowOther: true,
        options: [
          { id: "pipes", label: "Pipes" },
          { id: "taps", label: "Taps/faucets" },
          { id: "toilet", label: "Toilet fixtures" },
          { id: "heater_unit", label: "Water heater" },
          { id: "tank_fittings", label: "Tank fittings" },
        ],
      },
      {
        id: "completion",
        title: "Completion includes",
        multi: true,
        options: [
          { id: "install_only", label: "Installation only" },
          { id: "install_test", label: "Installation + testing" },
          { id: "remove_old", label: "Remove old materials" },
          { id: "cleanup", label: "Clean work area" },
        ],
      },
    ],
  },
  {
    id: "electrical",
    emoji: "💡",
    label: "Electrical",
    sections: [
      {
        id: "work_type",
        title: "What electrical work?",
        multi: true,
        allowOther: true,
        options: [
          { id: "new_wiring", label: "New wiring" },
          { id: "repair_fault", label: "Repair wiring fault" },
          { id: "lights", label: "Install lights" },
          { id: "sockets", label: "Install sockets/switches" },
          { id: "breaker", label: "Install/change breaker" },
          { id: "generator", label: "Generator connection" },
        ],
      },
      {
        id: "property_area",
        title: "Property area",
        multi: true,
        options: [
          { id: "one_room", label: "One room" },
          { id: "multi_room", label: "Multiple rooms" },
          { id: "full_house", label: "Full house" },
          { id: "office", label: "Office/shop" },
          { id: "compound", label: "Compound" },
        ],
      },
      {
        id: "materials",
        title: "Materials",
        multi: true,
        allowOther: true,
        options: [
          { id: "wires", label: "Wires" },
          { id: "sockets", label: "Sockets" },
          { id: "switches", label: "Switches" },
          { id: "breakers", label: "Breakers" },
          { id: "fixtures", label: "Light fixtures" },
        ],
      },
      {
        id: "completion_proof",
        title: "Completion proof",
        multi: true,
        options: [
          { id: "power_test", label: "Power test completed" },
          { id: "photos", label: "Photos uploaded" },
          { id: "safety", label: "Safety check completed" },
        ],
      },
    ],
  },
  {
    id: "carpentry",
    emoji: "🪵",
    label: "Carpentry/Furniture",
    sections: [
      {
        id: "work_type",
        title: "What work?",
        multi: true,
        allowOther: true,
        options: [
          { id: "cabinets", label: "Kitchen cabinets" },
          { id: "wardrobe", label: "Wardrobe" },
          { id: "doors", label: "Doors" },
          { id: "bed", label: "Bed/frame" },
          { id: "tables", label: "Tables/chairs" },
          { id: "repairs", label: "Repairs" },
        ],
      },
      {
        id: "material_type",
        title: "Material type",
        multi: false,
        options: [
          { id: "mdf", label: "MDF" },
          { id: "hdf", label: "HDF" },
          { id: "plywood", label: "Plywood" },
          { id: "hardwood", label: "Hardwood" },
          { id: "client_choice", label: "Client choice" },
        ],
      },
      {
        id: "finish",
        title: "Finish",
        multi: false,
        options: [
          { id: "painted", label: "Painted" },
          { id: "polished", label: "Polished" },
          { id: "laminated", label: "Laminated" },
          { id: "natural", label: "Natural wood" },
        ],
      },
      {
        id: "includes",
        title: "Includes",
        multi: true,
        options: [
          { id: "measurements", label: "Measurements" },
          { id: "materials", label: "Materials" },
          { id: "building", label: "Building" },
          { id: "delivery", label: "Delivery" },
          { id: "installation", label: "Installation" },
        ],
      },
    ],
  },
  {
    id: "borehole",
    emoji: "🚰",
    label: "Borehole/Water",
    sections: [
      {
        id: "service_needed",
        title: "Service needed",
        multi: true,
        allowOther: true,
        options: [
          { id: "drilling", label: "New borehole drilling" },
          { id: "repair", label: "Borehole repair" },
          { id: "pump", label: "Pump installation" },
          { id: "treatment", label: "Water treatment" },
          { id: "tank", label: "Tank installation" },
        ],
      },
      {
        id: "agreement_includes",
        title: "Agreement includes",
        multi: true,
        options: [
          { id: "drilling", label: "Drilling" },
          { id: "casing", label: "Casing" },
          { id: "pump", label: "Pump" },
          { id: "pipes", label: "Pipes" },
          { id: "electrical", label: "Electrical connection" },
          { id: "testing", label: "Water testing" },
        ],
      },
      {
        id: "expected_depth",
        title: "Expected depth",
        multi: false,
        allowCustomInput: true,
        customInputLabel: "Specific depth (metres)",
        customInputKey: "depth_metres",
        options: [
          { id: "recommendation", label: "Artisan recommendation" },
          { id: "specific", label: "Specific depth" },
        ],
      },
      {
        id: "completion_proof",
        title: "Completion proof",
        multi: true,
        options: [
          { id: "water_flows", label: "Water flows successfully" },
          { id: "video", label: "Video proof" },
          { id: "pump_installed", label: "Pump installed" },
          { id: "inspection", label: "Client inspection" },
        ],
      },
    ],
  },
  {
    id: "solar",
    emoji: "☀️",
    label: "Solar/Inverter",
    sections: [
      {
        id: "work_needed",
        title: "Work needed",
        multi: true,
        options: [
          { id: "new_install", label: "New installation" },
          { id: "battery", label: "Battery replacement" },
          { id: "panels", label: "Panel installation" },
          { id: "repair", label: "Inverter repair" },
          { id: "upgrade", label: "Upgrade existing system" },
        ],
      },
      {
        id: "equipment",
        title: "Equipment",
        multi: true,
        options: [
          { id: "panels", label: "Panels" },
          { id: "inverter", label: "Inverter" },
          { id: "batteries", label: "Batteries" },
          { id: "cables", label: "Cables" },
          { id: "mounting", label: "Mounting" },
        ],
      },
      {
        id: "brand",
        title: "Brand",
        multi: false,
        options: [
          { id: "installer", label: "Installer recommendation" },
          { id: "customer", label: "Customer requested brand" },
        ],
      },
      {
        id: "completion",
        title: "Completion",
        multi: true,
        options: [
          { id: "powers_on", label: "System powers on" },
          { id: "load_test", label: "Load test completed" },
          { id: "warranty", label: "Warranty explained" },
        ],
      },
    ],
  },
  {
    id: "ac",
    emoji: "❄️",
    label: "AC/Refrigeration",
    sections: [
      {
        id: "work",
        title: "Work",
        multi: true,
        options: [
          { id: "install", label: "Install AC" },
          { id: "service", label: "Service AC" },
          { id: "repair", label: "Repair AC" },
          { id: "gas", label: "Gas refill" },
          { id: "parts", label: "Replace parts" },
        ],
      },
      {
        id: "unit",
        title: "Unit",
        multi: false,
        options: [
          { id: "split", label: "Split AC" },
          { id: "standing", label: "Standing AC" },
          { id: "central", label: "Central AC" },
        ],
      },
      {
        id: "includes",
        title: "Includes",
        multi: true,
        options: [
          { id: "labour", label: "Labour" },
          { id: "parts", label: "Parts" },
          { id: "transport", label: "Transport" },
          { id: "testing", label: "Testing" },
        ],
      },
    ],
  },
  {
    id: "painting",
    emoji: "🏠",
    label: "Painting/Renovation",
    sections: [
      {
        id: "work",
        title: "Work",
        multi: true,
        options: [
          { id: "interior", label: "Interior painting" },
          { id: "exterior", label: "Exterior painting" },
          { id: "full_house", label: "Full house" },
          { id: "room", label: "Room only" },
          { id: "office", label: "Office/shop" },
        ],
      },
      {
        id: "paint",
        title: "Paint",
        multi: false,
        options: [
          { id: "matte", label: "Matte" },
          { id: "gloss", label: "Gloss" },
          { id: "textured", label: "Textured" },
          { id: "customer", label: "Customer choice" },
        ],
      },
      {
        id: "includes",
        title: "Includes",
        multi: true,
        options: [
          { id: "paint_supply", label: "Paint" },
          { id: "prep", label: "Scraping/prep" },
          { id: "filling", label: "Filling cracks" },
          { id: "cleanup", label: "Cleanup" },
        ],
      },
    ],
  },
  {
    id: "mechanic",
    emoji: "🚗",
    label: "Mechanic",
    sections: [
      {
        id: "work",
        title: "Work",
        multi: true,
        options: [
          { id: "engine", label: "Engine repair" },
          { id: "servicing", label: "Servicing" },
          { id: "body", label: "Body work" },
          { id: "electrical", label: "Electrical issue" },
          { id: "parts", label: "Parts replacement" },
        ],
      },
      {
        id: "parts",
        title: "Parts",
        multi: false,
        options: [
          { id: "new", label: "New parts" },
          { id: "used", label: "Used parts" },
          { id: "customer", label: "Customer provides" },
        ],
      },
      {
        id: "proof",
        title: "Proof",
        multi: true,
        options: [
          { id: "test_drive", label: "Test drive" },
          { id: "old_parts", label: "Old parts returned" },
          { id: "receipt", label: "Receipt uploaded" },
        ],
      },
    ],
  },
  {
    id: "other",
    emoji: "➕",
    label: "Other",
    sections: [
      {
        id: "work_description",
        title: "Describe the work",
        multi: false,
        allowCustomInput: true,
        customInputLabel: "Work description",
        customInputKey: "work_description",
        options: [{ id: "custom", label: "Custom job" }],
      },
      {
        id: "completion",
        title: "Completion includes",
        multi: true,
        options: [
          { id: "install", label: "Installation/work completed" },
          { id: "testing", label: "Testing & handover" },
          { id: "cleanup", label: "Site cleanup" },
        ],
      },
    ],
  },
];

export function getCategoryConfig(
  categoryId: AgreementCategoryId,
): AgreementCategoryConfig {
  return (
    AGREEMENT_CATEGORIES.find((c) => c.id === categoryId) ??
    AGREEMENT_CATEGORIES[AGREEMENT_CATEGORIES.length - 1]
  );
}

export function mapProfileCategoryToAgreement(
  profileCategory: string,
): AgreementCategoryId {
  const map: Record<string, AgreementCategoryId> = {
    plumbing: "plumbing",
    solar: "solar",
    borehole: "borehole",
    carpentry: "carpentry",
    painting: "painting",
    pop: "painting",
    tiling: "painting",
    other: "other",
  };
  return map[profileCategory] ?? "plumbing";
}

export const WARRANTY_OPTIONS = [
  { id: "none", label: "None" },
  { id: "7_days", label: "7 days" },
  { id: "30_days", label: "30 days" },
  { id: "custom", label: "Custom" },
] as const;

export const CHANGES_OPTIONS = [
  { id: "ask_approval", label: "Ask approval first" },
  { id: "new_payment", label: "Add new payment request" },
] as const;
