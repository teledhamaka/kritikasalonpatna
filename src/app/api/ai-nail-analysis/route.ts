import { NextRequest, NextResponse } from 'next/server';

import nailLookConfig from '../../../../public/nail_look_config.json';

export const runtime = 'nodejs';

const MAX_FILE_SIZE =
  nailLookConfig.aiAnalysis.maxFileSizeMB *
  1024 *
  1024;

const ALLOWED_TYPES =
  nailLookConfig.aiAnalysis.acceptedTypes;

type NailLookPreferences = {
  colourId: string;
  occasionId: string;
  outfitId: string;
  vibeId: string;
  lengthId: string;
  finishId: string;
  shapeId: string;
  harmonyId: string;
};

type AIAnalysisResult = {
  preferences: Partial<NailLookPreferences>;
  analysis: {
    nailLength?: string;
    nailShape?: string;
    currentStyle?: string;
    suggestedColours?: string[];
    suggestedStyles?: string[];
    suggestedFinish?: string;
    confidence?: number;
  };
};

function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function getValidId(
  value: unknown,
  validIds: readonly string[]
): string | undefined {
  if (typeof value !== 'string') return undefined;
  return validIds.includes(value) ? value : undefined;
}

function getIds(collection: readonly { id: string }[]): string[] {
  return collection.map(item => item.id);
}

function cleanPreferences(
  raw: Record<string, unknown>
): Partial<NailLookPreferences> {
  const validColourIds = getIds(nailLookConfig.colours);
  const validOccasionIds = getIds(nailLookConfig.occasions);
  const validOutfitIds = getIds(nailLookConfig.outfits);
  const validVibeIds = getIds(nailLookConfig.vibes);
  const validLengthIds = getIds(nailLookConfig.lengths);
  const validFinishIds = getIds(nailLookConfig.finishes);
  const validShapeIds = getIds(nailLookConfig.shapes);
  const validHarmonyIds = getIds(nailLookConfig.harmonies);

  const preferences: Partial<NailLookPreferences> = {};

  const colourId = getValidId(raw.colourId, validColourIds);
  const occasionId = getValidId(raw.occasionId, validOccasionIds);
  const outfitId = getValidId(raw.outfitId, validOutfitIds);
  const vibeId = getValidId(raw.vibeId, validVibeIds);
  const lengthId = getValidId(raw.lengthId, validLengthIds);
  const finishId = getValidId(raw.finishId, validFinishIds);
  const shapeId = getValidId(raw.shapeId, validShapeIds);
  const harmonyId = getValidId(raw.harmonyId, validHarmonyIds);

  if (colourId) preferences.colourId = colourId;
  if (occasionId) preferences.occasionId = occasionId;
  if (outfitId) preferences.outfitId = outfitId;
  if (vibeId) preferences.vibeId = vibeId;
  if (lengthId) preferences.lengthId = lengthId;
  if (finishId) preferences.finishId = finishId;
  if (shapeId) preferences.shapeId = shapeId;
  if (harmonyId) preferences.harmonyId = harmonyId;

  return preferences;
}

function buildAnalysisPrompt(): string {
  const colours = nailLookConfig.colours
    .map(colour => `${colour.id}: ${colour.name}`)
    .join(', ');

  const occasions = nailLookConfig.occasions
    .map(item => `${item.id}: ${item.label}`)
    .join(', ');

  const outfits = nailLookConfig.outfits
    .map(item => `${item.id}: ${item.label}`)
    .join(', ');

  const vibes = nailLookConfig.vibes
    .map(item => `${item.id}: ${item.label}`)
    .join(', ');

  const lengths = nailLookConfig.lengths
    .map(item => `${item.id}: ${item.label}`)
    .join(', ');

  const finishes = nailLookConfig.finishes
    .map(item => `${item.id}: ${item.label}`)
    .join(', ');

  const shapes = nailLookConfig.shapes
    .map(item => `${item.id}: ${item.label}`)
    .join(', ');

  const harmonies = nailLookConfig.harmonies
    .map(item => `${item.id}: ${item.label}`)
    .join(', ');

  return `
You are a nail-style recommendation assistant for a beauty salon.

Your task is STYLE DISCOVERY ONLY.

Analyse the visible nail appearance in the uploaded photograph and suggest
aesthetic nail styling preferences.

Do NOT diagnose:
- nail diseases
- infections
- medical conditions
- nutritional deficiencies
- skin conditions
- health problems

Do NOT make medical claims.

If the photograph is unclear, make conservative style suggestions.

IMPORTANT:
You MUST choose IDs only from the controlled lists below.

COLOURS:
${colours}

OCCASIONS:
${occasions}

OUTFITS:
${outfits}

VIBES:
${vibes}

LENGTHS:
${lengths}

FINISHES:
${finishes}

SHAPES:
${shapes}

HARMONIES:
${harmonies}

Return ONLY valid JSON.

The JSON must have this structure:

{
  "preferences": {
    "colourId": "...",
    "occasionId": "...",
    "outfitId": "...",
    "vibeId": "...",
    "lengthId": "...",
    "finishId": "...",
    "shapeId": "...",
    "harmonyId": "..."
  },
  "analysis": {
    "nailLength": "...",
    "nailShape": "...",
    "currentStyle": "...",
    "suggestedColours": ["...", "..."],
    "suggestedStyles": ["...", "..."],
    "suggestedFinish": "...",
    "confidence": 0
  }
}

Rules:

1. Never invent an ID.
2. If something cannot reasonably be inferred, omit that preference.
3. confidence must be a number from 0 to 100.
4. suggestedColours should contain human-readable colour names.
5. suggestedStyles should contain human-readable style names.
6. Keep currentStyle short and positive.
7. Do not mention medical conditions.
8. Do not recommend a salon service directly.
9. The application will match the resulting preferences against its own service catalogue.
`;
}

function extractJson(text: string): Record<string, unknown> {
  const cleaned = text
    .trim()
    .replace(/^```json/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error('AI returned invalid JSON.');
  }
}

function extractResponseText(data: any): string {
  // Gemini response structure: candidates[0].content.parts[0].text
  if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }
  // Fallback for other possible formats
  if (typeof data?.text === 'string') return data.text;
  return '';
}

function cleanAnalysis(raw: Record<string, unknown>) {
  const result: {
    nailLength?: string;
    nailShape?: string;
    currentStyle?: string;
    suggestedColours?: string[];
    suggestedStyles?: string[];
    suggestedFinish?: string;
    confidence?: number;
  } = {};

  if (isValidString(raw.nailLength)) result.nailLength = raw.nailLength;
  if (isValidString(raw.nailShape)) result.nailShape = raw.nailShape;
  if (isValidString(raw.currentStyle)) result.currentStyle = raw.currentStyle;
  if (Array.isArray(raw.suggestedColours)) {
    result.suggestedColours = raw.suggestedColours
      .filter((value): value is string => typeof value === 'string')
      .slice(0, 4);
  }
  if (Array.isArray(raw.suggestedStyles)) {
    result.suggestedStyles = raw.suggestedStyles
      .filter((value): value is string => typeof value === 'string')
      .slice(0, 4);
  }
  if (isValidString(raw.suggestedFinish)) result.suggestedFinish = raw.suggestedFinish;
  if (typeof raw.confidence === 'number') {
    result.confidence = Math.max(0, Math.min(100, Math.round(raw.confidence)));
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Gemini API key is not configured yet.',
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image');

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please upload a nail photo.',
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(image.type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Only JPG, PNG and WebP images are supported.',
        },
        { status: 400 }
      );
    }

    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `Image must be smaller than ${nailLookConfig.aiAnalysis.maxFileSizeMB} MB.`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64 = buffer.toString('base64');

    // Gemini request body
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: buildAnalysisPrompt(),
            },
            {
              inline_data: {
                mime_type: image.type,
                data: base64,
              },
            },
          ],
        },
      ],
    };

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiPayload),
      }
    );

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', geminiData);
      return NextResponse.json(
        {
          success: false,
          message: 'AI analysis is temporarily unavailable. Please try again.',
        },
        { status: 502 }
      );
    }

    const outputText = extractResponseText(geminiData);

    if (!outputText) {
      throw new Error('No analysis returned by AI.');
    }

    const parsed = extractJson(outputText);

    const rawPreferences = parsed.preferences;
    const preferences =
      rawPreferences && typeof rawPreferences === 'object'
        ? cleanPreferences(rawPreferences as Record<string, unknown>)
        : {};

    const rawAnalysis = parsed.analysis;
    const analysis =
      rawAnalysis && typeof rawAnalysis === 'object'
        ? cleanAnalysis(rawAnalysis as Record<string, unknown>)
        : {};

    const response: AIAnalysisResult = {
      preferences,
      analysis,
    };

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error('AI Nail Analysis failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'We could not analyse this photo right now. Please try again.',
      },
      { status: 500 }
    );
  }
}