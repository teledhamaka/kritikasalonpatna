// src/data/nails/nailLookData.ts

import config from '../../../public/nail_look_config.json';

export type NailLookConfig = typeof config;

export type NailLookPreferences = {
  colourId: string;
  occasionId: string;
  outfitId: string;
  vibeId: string;
  lengthId: string;
  finishId: string;
  shapeId: string;
  harmonyId: string;
};

export const nailLookConfig = config as NailLookConfig;

export const DEFAULT_NAIL_LOOK: NailLookPreferences = {
  colourId: nailLookConfig.colours[8]?.id ?? 'blush',
  occasionId: nailLookConfig.occasions[0]?.id ?? 'everyday',
  outfitId: nailLookConfig.outfits[4]?.id ?? 'casual',
  vibeId: nailLookConfig.vibes[2]?.id ?? 'elegant',
  lengthId: nailLookConfig.lengths[1]?.id ?? 'medium',
  finishId: nailLookConfig.finishes[0]?.id ?? 'glossy',
  shapeId: nailLookConfig.shapes[1]?.id ?? 'oval',
  harmonyId: nailLookConfig.harmonies[0]?.id ?? 'monochromatic',
};

export function normalizeLookText(value: unknown): string {
  if (typeof value !== 'string') return '';

  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function addArrayValue(
  values: string[],
  value: unknown,
): void {
  if (typeof value === 'string') {
    values.push(value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(item => {
      if (typeof item === 'string') {
        values.push(item);
      }
    });
  }
}

export function getServiceSearchText(
  service: unknown,
): string {
  if (!service || typeof service !== 'object') {
    return '';
  }

  const record = service as Record<string, unknown>;

  const values: string[] = [];

  const fields = [
    'id',
    'title',
    'slug',
    'category',
    'categorySlug',
    'primaryCategory',
    'secondaryCategories',
    'eventCategory',
    'description',
    'shortDescription',
    'tags',
    'features',
    'suitableFor',
    'notSuitableFor',
    'skinToneSuitability',
    'occasionSuitability',
    'style',
    'colorFamily',
    'finish',
    'nailLength',
    'nailShape',
    'maintenanceLevel',
    'targetAudience',
    'idealFor',
    'benefits',
    'keyIngredients',
    'whatsIncluded',
    'whatsNotIncluded',
    'seasonalTags',
    'seoKeywords',
  ];

  fields.forEach(field => {
    addArrayValue(values, record[field]);
  });

  return normalizeLookText(values.join(' '));
}

function containsAny(
  text: string,
  keywords: readonly string[],
): boolean {
  return keywords.some(keyword =>
    text.includes(normalizeLookText(keyword)),
  );
}

function getOptionKeywords(
  collection: readonly {
    id: string;
    keywords?: readonly string[];
  }[],
  id: string,
): readonly string[] {
  const option = collection.find(item => item.id === id);

  return option?.keywords ?? [];
}

function getColour(
  colourId: string,
) {
  return nailLookConfig.colours.find(
    colour => colour.id === colourId,
  );
}

export function getSelectedColour(
  preferences: NailLookPreferences,
) {
  return getColour(preferences.colourId);
}

export function getSelectedOptionLabel(
  collection: readonly {
    id: string;
    label: string;
  }[],
  id: string,
): string {
  return (
    collection.find(item => item.id === id)?.label ??
    id
  );
}

export function getColourScore(
  serviceText: string,
  preferences: NailLookPreferences,
): number {
  const colour = getColour(preferences.colourId);

  if (!colour) return 0;

  let score = 0;

  const family = normalizeLookText(colour.family);
  const colourName = normalizeLookText(colour.name);

  if (serviceText.includes(colourName)) {
    score += nailLookConfig.scoring.exactColour;
  }

  if (serviceText.includes(family)) {
    score += nailLookConfig.scoring.colourFamily;
  }

  if (
    containsAny(
      serviceText,
      colour.keywords ?? [],
    )
  ) {
    score += nailLookConfig.scoring.exactColour;
  }

  const harmonyFamilies =
    nailLookConfig.colourHarmonyFamilies as Record<
      string,
      readonly string[]
    >;

  const compatibleFamilies =
    harmonyFamilies[
      colour.family
    ] ?? [];

  if (
    compatibleFamilies.some(familyName =>
      serviceText.includes(
        normalizeLookText(familyName),
      ),
    )
  ) {
    score += nailLookConfig.scoring.compatibleColour;
  }

  return score;
}

export function scoreServiceForLook(
  service: unknown,
  preferences: NailLookPreferences,
): number {
  if (!service || typeof service !== 'object') {
    return -999;
  }

  const record = service as Record<string, unknown>;

  const category =
    typeof record.category === 'string'
      ? record.category
      : '';

  const categorySlug =
    typeof record.categorySlug === 'string'
      ? record.categorySlug
      : '';

  const id =
    typeof record.id === 'string'
      ? record.id
      : '';

  const recommendationConfig =
    nailLookConfig.recommendation;

  if (
    recommendationConfig.excludeCategories.some(
      excluded =>
        normalizeLookText(category) ===
          normalizeLookText(excluded) ||
        normalizeLookText(categorySlug) ===
          normalizeLookText(excluded),
    )
  ) {
    return -999;
  }

  if (
    recommendationConfig.excludeServiceIds.includes(id)
  ) {
    return -999;
  }

  const text = getServiceSearchText(service);

  if (!text) return -999;

  let score = 0;

  const occasionKeywords = getOptionKeywords(
    nailLookConfig.occasions,
    preferences.occasionId,
  );

  if (
    containsAny(text, occasionKeywords)
  ) {
    score += nailLookConfig.scoring.occasion;
  }

  const outfitKeywords = getOptionKeywords(
    nailLookConfig.outfits,
    preferences.outfitId,
  );

  if (
    containsAny(text, outfitKeywords)
  ) {
    score += nailLookConfig.scoring.outfit;
  }

  const vibeKeywords = getOptionKeywords(
    nailLookConfig.vibes,
    preferences.vibeId,
  );

  if (
    containsAny(text, vibeKeywords)
  ) {
    score += nailLookConfig.scoring.vibe;
  }

  const finishKeywords = getOptionKeywords(
    nailLookConfig.finishes,
    preferences.finishId,
  );

  if (
    containsAny(text, finishKeywords)
  ) {
    score += nailLookConfig.scoring.finish;
  }

  const lengthKeywords = getOptionKeywords(
    nailLookConfig.lengths,
    preferences.lengthId,
  );

  if (
    containsAny(text, lengthKeywords)
  ) {
    score += nailLookConfig.scoring.length;
  }

  const shapeKeywords = getOptionKeywords(
    nailLookConfig.shapes,
    preferences.shapeId,
  );

  if (
    containsAny(text, shapeKeywords)
  ) {
    score += nailLookConfig.scoring.shape;
  }

  score += getColourScore(
    text,
    preferences,
  );

  if (record.isBestSeller === true) {
    score += nailLookConfig.scoring.bestSeller;
  }

  if (record.isTrending === true) {
    score += nailLookConfig.scoring.trending;
  }

  if (record.isPopular === true) {
    score += nailLookConfig.scoring.popular;
  }

  const rating =
    typeof record.rating === 'number'
      ? record.rating
      : 0;

  if (rating >= 4.8) {
    score += nailLookConfig.scoring.rating;
  }

  const bookingCount =
    typeof record.bookingCount === 'number'
      ? record.bookingCount
      : 0;

  if (bookingCount >= 100) {
    score += nailLookConfig.scoring.bookingCount;
  }

  return score;
}

export function getRecommendedServices<T>(
  services: T[],
  preferences: NailLookPreferences,
): T[] {
  const scored = services
    .map(service => ({
      service,
      score: scoreServiceForLook(
        service,
        preferences,
      ),
    }))
    .filter(item =>
      item.score >=
      nailLookConfig.recommendation.minimumScore,
    )
    .sort((a, b) => b.score - a.score);

  const unique: T[] = [];
  const seen = new Set<string>();

  for (const item of scored) {
    const record = item.service as Record<
      string,
      unknown
    >;

    const key =
      typeof record.id === 'string'
        ? record.id
        : typeof record.slug === 'string'
          ? record.slug
          : String(unique.length);

    if (seen.has(key)) continue;

    seen.add(key);
    unique.push(item.service);

    if (
      unique.length >=
      nailLookConfig.recommendation.maximumResults
    ) {
      break;
    }
  }

  return unique;
}

export function getLookTitle(
  preferences: NailLookPreferences,
): string {
  const colour = getSelectedColour(preferences);

  const vibe = getSelectedOptionLabel(
    nailLookConfig.vibes,
    preferences.vibeId,
  );

  const occasion = getSelectedOptionLabel(
    nailLookConfig.occasions,
    preferences.occasionId,
  );

  if (!colour) {
    return 'Your Personalised Nail Look';
  }

  if (
    preferences.occasionId === 'bridal'
  ) {
    return `${colour.name} Bridal Elegance`;
  }

  if (
    preferences.finishId === 'chrome'
  ) {
    return `${colour.name} Chrome ${vibe}`;
  }

  if (
    preferences.finishId === 'french'
  ) {
    return `${colour.name} French ${vibe}`;
  }

  return `${colour.name} ${occasion} ${vibe}`;
}

export function getHarmonyDescription(
  preferences: NailLookPreferences,
): string {
  return (
    nailLookConfig.harmonies.find(
      harmony =>
        harmony.id === preferences.harmonyId,
    )?.description ?? ''
  );
}