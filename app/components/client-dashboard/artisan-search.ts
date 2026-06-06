import type { AgreementCategoryId } from "../artisan-dashboard/types";
import type { RecommendedArtisan } from "./types";

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function matchesQuery(artisan: RecommendedArtisan, query: string): boolean {
  if (!query) return true;
  const haystack = normalize(
    [
      artisan.fullName,
      artisan.categoryLabel,
      artisan.bio,
      artisan.areaLabel,
      artisan.categoryId,
    ].join(" "),
  );
  return haystack.includes(query);
}

function scoreArtisan(
  artisan: RecommendedArtisan,
  query: string,
  categoryId?: AgreementCategoryId | null,
): number {
  let score = 0;

  if (categoryId && artisan.categoryId === categoryId) {
    score += 1000;
    if (artisan.isRecommended) score += 500;
  } else if (categoryId) {
    score -= 200;
  }

  if (artisan.isRecommended) score += 200;

  if (query) {
    const name = normalize(artisan.fullName);
    const category = normalize(artisan.categoryLabel);
    if (name.includes(query)) score += 150;
    if (category.includes(query)) score += 120;
    if (normalize(artisan.bio).includes(query)) score += 60;
    if (normalize(artisan.areaLabel).includes(query)) score += 40;
  }

  if (artisan.verified) score += 50;
  score += (artisan.rating ?? 0) * 12;
  score += artisan.completedJobs * 3;

  return score;
}

export function searchRecommendedArtisans(
  artisans: RecommendedArtisan[],
  options: {
    query?: string;
    categoryId?: AgreementCategoryId | null;
    limit?: number;
  } = {},
): RecommendedArtisan[] {
  const query = normalize(options.query ?? "");
  const categoryId = options.categoryId ?? null;
  const limit = options.limit ?? artisans.length;

  return artisans
    .filter((artisan) => matchesQuery(artisan, query))
    .map((artisan) => ({
      artisan,
      score: scoreArtisan(artisan, query, categoryId),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ artisan }) => artisan);
}

export function getRecommendedArtisansForCategory(
  artisans: RecommendedArtisan[],
  categoryId: AgreementCategoryId,
): RecommendedArtisan[] {
  return searchRecommendedArtisans(artisans, { categoryId, limit: 6 });
}
