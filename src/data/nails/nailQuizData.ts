import quizConfig from '../../../public/nail_quiz_config.json';

import {
  getHarmonyDescription,
  getLookTitle,
  getRecommendedServices,
  nailLookConfig,
  type NailLookPreferences,
} from './nailLookData';

export type NailQuizConfig = typeof quizConfig;

export const nailQuizConfig =
  quizConfig as NailQuizConfig;

export type NailQuizQuestion =
  (typeof nailQuizConfig.questions)[number];

export function createEmptyNailQuizAnswers(): Partial<NailLookPreferences> {
  return {};
}

export function getNailQuizQuestions() {
  return nailQuizConfig.questions;
}

export function getNailQuizQuestion(
  index: number
) {
  return nailQuizConfig.questions[index];
}

export function getQuestionOptions(
  question: NailQuizQuestion
): readonly any[] {
  // Each question in nail_quiz_config.json embeds its own
  // `options` array directly (colours included, with `hex`
  // instead of `emoji`) — there is no `source` field to look
  // up against nailLookConfig's collections.
  return question.options ?? [];
}

export function setNailQuizAnswer(
  answers: Partial<NailLookPreferences>,
  question: NailQuizQuestion,
  value: string
): Partial<NailLookPreferences> {
  return {
    ...answers,
    [question.preferenceKey]:
      value,
  };
}

export function isNailQuizComplete(
  answers: Partial<NailLookPreferences>
): answers is NailLookPreferences {
  return nailQuizConfig.questions.every(
    question =>
      Boolean(
        answers[
          question.preferenceKey as keyof NailLookPreferences
        ]
      )
  );
}

export function getNailQuizResult(
  services: any[],
  answers: NailLookPreferences
) {
  const recommendations =
    getRecommendedServices(
      services,
      answers
    ).slice(
      0,
      nailQuizConfig.settings
        .maximumRecommendations
    );

  return {
    title: getNailQuizResultTitle(
      answers
    ),

    lookTitle:
      getLookTitle(answers),

    harmony:
      getHarmonyDescription(
        answers
      ),

    recommendations,
  };
}

export function getNailQuizResultTitle(
  answers: NailLookPreferences
): string {
  if (
    answers.occasionId ===
    'bridal'
  ) {
    return nailQuizConfig
      .result
      .titles
      .bridal;
  }

  if (
    answers.vibeId ===
    'glam'
  ) {
    return nailQuizConfig
      .result
      .titles
      .glam;
  }

  if (
    answers.vibeId ===
    'minimal'
  ) {
    return nailQuizConfig
      .result
      .titles
      .minimal;
  }

  if (
    answers.vibeId ===
    'classic'
  ) {
    return nailQuizConfig
      .result
      .titles
      .classic;
  }

  if (
    answers.vibeId ===
    'bold'
  ) {
    return nailQuizConfig
      .result
      .titles
      .bold;
  }

  return nailQuizConfig
    .result
    .titles
    .default;
}

export function getNailQuizSelectionLabel(
  source: string,
  id: string
): string {
  const collections: Record<
    string,
    readonly any[]
  > = {
    colours:
      nailLookConfig.colours,

    occasions:
      nailLookConfig.occasions,

    outfits:
      nailLookConfig.outfits,

    vibes:
      nailLookConfig.vibes,

    lengths:
      nailLookConfig.lengths,

    finishes:
      nailLookConfig.finishes,

    shapes:
      nailLookConfig.shapes,
  };

  const item =
    collections[source]?.find(
      option =>
        option.id === id
    );

  return (
    item?.label ??
    item?.name ??
    id
  );
}