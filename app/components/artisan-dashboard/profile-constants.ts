export const SERVICE_CATEGORIES = [
  { value: "borehole", label: "Borehole Drilling" },
  { value: "solar", label: "Solar & Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "carpentry", label: "Carpentry & Furniture" },
  { value: "painting", label: "Painting" },
  { value: "pop", label: "POP Ceiling" },
  { value: "tiling", label: "Tiling & Flooring" },
  { value: "other", label: "Other" },
] as const;

export const AREA_OPTIONS = [
  { value: "gwarinpa", label: "Gwarinpa" },
  { value: "wuse", label: "Wuse / Wuse 2" },
  { value: "maitama", label: "Maitama" },
  { value: "garki", label: "Garki" },
  { value: "lugbe", label: "Lugbe" },
  { value: "kubwa", label: "Kubwa" },
  { value: "other", label: "Other Abuja area" },
] as const;

export const TRAVEL_OPTIONS = [
  { value: "", label: "Select range..." },
  { value: "5km", label: "Within 5 km" },
  { value: "10km", label: "Within 10 km" },
  { value: "abuja", label: "Anywhere in Abuja" },
  { value: "fct", label: "Anywhere in FCT" },
] as const;

export const BANK_OPTIONS = [
  "GTBank",
  "Access Bank",
  "Zenith Bank",
  "First Bank",
  "UBA",
  "Stanbic IBTC",
  "Fidelity Bank",
  "Kuda",
  "Opay",
  "Palmpay",
] as const;

export function getCategoryLabel(value: string, otherTrade = ""): string {
  if (value === "other" && otherTrade.trim()) return otherTrade.trim();
  return SERVICE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getAreaLabel(value: string): string {
  return AREA_OPTIONS.find((a) => a.value === value)?.label ?? value;
}
