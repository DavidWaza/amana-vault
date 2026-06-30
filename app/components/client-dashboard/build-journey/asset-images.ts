/**
 * Build-journey image URLs — sourced from `public/assets/` via generated manifest.
 * Run `npm run assets:manifest` after adding files to public/assets or public/assets/lifestyle.
 */

import { GENERATED_ASSET_MANIFEST } from "./generated-asset-manifest";

export const ASSET_ROOT = "/assets";
export const AMBIENCE = '/assets/ambience';
export const LIFESTYLE_ROOT = '/assets/lifestyle';

const FALLBACK = {
  homeTypes: {
    duplex: `${ASSET_ROOT}/duplex.PNG`,
    bungalow: `${ASSET_ROOT}/bungalow.PNG`,
    investment: `${ASSET_ROOT}/investment-property.PNG`,
    multi_family: `${ASSET_ROOT}/multi-family.PNG`,
    villa: `${LIFESTYLE_ROOT}/villa.jpg`,
    apartments: `${LIFESTYLE_ROOT}/apartments.jpg`,
    duplexSuplex: `${ASSET_ROOT}/duplex-suplex.jpeg`,
  },
  styles: {
    modern_tropical: `${LIFESTYLE_ROOT}/modern-tropical.jpg`,
    afro_modern: `${AMBIENCE}/afro-modern.jpeg`,
    contemporary_luxury: `${AMBIENCE}/luxury-contemporary.jpeg`,
    modern_minimalist: `${AMBIENCE}/modern-minimalist.jpeg`,
    classic_nigerian: `${LIFESTYLE_ROOT}/classic-nigerian.jpg`,
    eco_friendly: `${LIFESTYLE_ROOT}/eco-friendly.jpg`,
    neo_classical: `${AMBIENCE}/neoclassic.jpeg`,
    classical: `${AMBIENCE}/classical.jpeg`,
   
  },
  hero: `${LIFESTYLE_ROOT}/hero.jpg`,
} as const;

function pick<K extends string>(
  generated: Record<string, string>,
  fallbacks: Record<K, string>,
  key: K,
): string {
  return generated[key] ?? fallbacks[key];
}

export function homeTypeImage(optionId: string): string | undefined {
  const fallbacks = FALLBACK.homeTypes as Record<string, string>;
  if (optionId in fallbacks || optionId in GENERATED_ASSET_MANIFEST.homeTypes) {
    return pick(GENERATED_ASSET_MANIFEST.homeTypes, fallbacks, optionId);
  }
  return undefined;
}

export function styleImage(optionId: string): string | undefined {
  const fallbacks = FALLBACK.styles as Record<string, string>;
  if (optionId in fallbacks || optionId in GENERATED_ASSET_MANIFEST.styles) {
    return pick(GENERATED_ASSET_MANIFEST.styles, fallbacks, optionId);
  }
  return undefined;
}

export const BUILD_JOURNEY_HERO_IMAGE =
  GENERATED_ASSET_MANIFEST.hero || FALLBACK.hero;

export const IMG = {
  duplex: homeTypeImage("duplex")!,
  bungalow: homeTypeImage("bungalow")!,
  villa: homeTypeImage("villa")!,
  apartments: homeTypeImage("apartments")!,
  investment: homeTypeImage("investment")!,
  multiFamily: homeTypeImage("multi_family")!,
  modernTropical: styleImage("modern_tropical")!,
  afroModern: styleImage("afro_modern")!,
  neoClassical: styleImage("neo_classical")!,
  classical: styleImage("classical")!,
  
  modernMinimalist: styleImage("modern_minimalist")!,
  luxuryContemporary: styleImage("contemporary_luxury")!,
  classicNigerian: styleImage("classic_nigerian")!,
  ecoFriendly: styleImage("eco_friendly")!,
  duplexSuplex: homeTypeImage("duplexSuplex")!,
  hero: BUILD_JOURNEY_HERO_IMAGE,
};
