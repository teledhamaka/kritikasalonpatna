'use client';

import {
  useMemo,
  useState,
} from 'react';

import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';

import type {
  NailLookPreferences,
} from '../../data/nails/nailLookData';

import {
  createEmptyNailQuizAnswers,
  getNailQuizResult,
  getNailQuizQuestions,
  getNailQuizSelectionLabel,
  getQuestionOptions,
  isNailQuizComplete,
  nailQuizConfig,
  setNailQuizAnswer,
} from '../../data/nails/nailQuizData';

interface NailArtQuizProps {
  services: any[];

  onClose: () => void;

  onBookService?: (
    service: any
  ) => void;
}

export default function NailArtQuiz({
  services,
  onClose,
  onBookService,
}: NailArtQuizProps) {
  const questions =
    getNailQuizQuestions();

  const [answers, setAnswers] =
    useState<
      Partial<NailLookPreferences>
    >(
      createEmptyNailQuizAnswers()
    );

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [showResult, setShowResult] =
    useState(false);

  const [error, setError] =
    useState('');

  const question =
    questions[currentIndex];

  const currentAnswer =
    question
      ? answers[
          question.preferenceKey as keyof NailLookPreferences
        ]
      : undefined;

  const result = useMemo(() => {
    if (
      !showResult ||
      !isNailQuizComplete(answers)
    ) {
      return null;
    }

    return getNailQuizResult(
      services,
      answers
    );
  }, [
    showResult,
    answers,
    services,
  ]);

  const selectOption = (
    value: string
  ) => {
    setAnswers(previous =>
      setNailQuizAnswer(
        previous,
        question,
        value
      )
    );

    setError('');
  };

  const next = () => {
    if (!currentAnswer) {
      setError(
        'Please choose one option to continue.'
      );
      return;
    }

    if (
      currentIndex <
      questions.length - 1
    ) {
      setCurrentIndex(
        previous =>
          previous + 1
      );

      setError('');
      return;
    }

    const complete =
      isNailQuizComplete(
        answers
      );

    if (!complete) {
      setError(
        'Please complete the quiz first.'
      );
      return;
    }

    setShowResult(true);
  };

  const back = () => {
    setError('');

    if (currentIndex > 0) {
      setCurrentIndex(
        previous =>
          previous - 1
      );
    }
  };

  const restart = () => {
    setAnswers(
      createEmptyNailQuizAnswers()
    );

    setCurrentIndex(0);
    setShowResult(false);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">

      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5 py-4">

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">
                💅
              </span>

              <h2 className="font-bold text-gray-900">
                {
                  nailQuizConfig
                    .branding
                    .title
                }
              </h2>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              {
                nailQuizConfig
                  .branding
                  .subtitle
              }
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Nail Art Quiz"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto">

          {!showResult ? (
            <QuestionView
              question={question}
              currentIndex={
                currentIndex
              }
              totalQuestions={
                questions.length
              }
              currentAnswer={
                currentAnswer
              }
              error={error}
              onSelect={
                selectOption
              }
              onBack={back}
              onNext={next}
            />
          ) : (
            <ResultView
              result={result}
              answers={answers}
              onRestart={restart}
              onClose={onClose}
              onBookService={
                onBookService
              }
            />
          )}

        </div>
      </div>
    </div>
  );
}

function QuestionView({
  question,
  currentIndex,
  totalQuestions,
  currentAnswer,
  error,
  onSelect,
  onBack,
  onNext,
}: {
  question: any;
  currentIndex: number;
  totalQuestions: number;
  currentAnswer?: string;
  error: string;
  onSelect: (
    value: string
  ) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  if (!question) {
    return null;
  }

  const options =
    getQuestionOptions(
      question
    );

  const progress =
    ((currentIndex + 1) /
      totalQuestions) *
    100;

  return (
    <div className="p-5 sm:p-7">

      {/* PROGRESS */}

      {nailQuizConfig.settings
        .showProgress && (
        <div className="mb-7">
          <div className="mb-2 flex justify-between text-xs text-gray-500">
            <span>
              Question{' '}
              {currentIndex + 1}{' '}
              of {totalQuestions}
            </span>

            <span className="font-semibold text-pink-600">
              {Math.round(
                progress
              )}
              %
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* QUESTION */}

      <div className="mb-6 text-center">
        <div className="mb-3 text-4xl">
          {question.icon}
        </div>

        <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
          {question.question}
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          {question.subtitle}
        </p>
      </div>

      {/* OPTIONS */}

      <div
        className={
          question.id ===
          'colour'
            ? 'grid grid-cols-3 gap-3 sm:grid-cols-4'
            : 'grid grid-cols-2 gap-3 sm:grid-cols-3'
        }
      >
        {options.map(
          (option: any) => {
            const selected =
              currentAnswer ===
              option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  onSelect(
                    option.id
                  )
                }
                className={[
                  'relative rounded-2xl border p-4 transition-all',
                  'hover:-translate-y-0.5 hover:shadow-md',
                  selected
                    ? 'border-pink-500 bg-pink-50 shadow-md ring-2 ring-pink-200'
                    : 'border-gray-200 bg-white hover:border-pink-300',
                ].join(' ')}
              >

                {selected && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white">
                    <Check size={12} />
                  </span>
                )}

                {option.hex ? (
                  <span
                    className="mx-auto mb-3 block h-12 w-12 rounded-full border-4 border-white shadow-md"
                    style={{
                      backgroundColor:
                        option.hex,
                    }}
                  />
                ) : (
                  <div className="mb-2 text-2xl">
                    {option.emoji}
                  </div>
                )}

                <div className="text-center text-sm font-semibold text-gray-800">
                  {option.label ??
                    option.name}
                </div>
              </button>
            );
          }
        )}
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-center text-xs font-medium text-red-600">
          {error}
        </div>
      )}

      {/* NAVIGATION */}

      <div className="mt-7 flex gap-3">

        {currentIndex > 0 && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft
              size={16}
              className="mr-1 inline"
            />
            Back
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          className="flex-1 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:from-pink-700 hover:to-purple-700"
        >
          {currentIndex ===
          totalQuestions - 1 ? (
            <>
              <Sparkles
                size={16}
                className="mr-1 inline"
              />
              Show My Nail Look
            </>
          ) : (
            <>
              Continue
              <ArrowRight
                size={16}
                className="ml-1 inline"
              />
            </>
          )}
        </button>

      </div>
    </div>
  );
}

function ResultView({
  result,
  answers,
  onRestart,
  onClose,
  onBookService,
}: {
  result: any;
  answers: Partial<NailLookPreferences>;
  onRestart: () => void;
  onClose: () => void;
  onBookService?: (
    service: any
  ) => void;
}) {
  if (!result) {
    return null;
  }

  return (
    <div className="p-5 sm:p-7">

      {/* HERO */}

      <div className="rounded-3xl bg-gradient-to-br from-pink-600 via-purple-600 to-fuchsia-600 p-6 text-center text-white">

        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-3xl">
          ✨
        </div>

        <div className="text-xs font-semibold uppercase tracking-wider text-white/70">
          {
            nailQuizConfig
              .branding
              .resultTitle
          }
        </div>

        <h3 className="mt-1 text-2xl font-bold">
          {result.title}
        </h3>

        <p className="mt-2 text-sm text-white/80">
          {result.lookTitle}
        </p>
      </div>

      {/* SUMMARY */}

      {nailQuizConfig.result
        .showSelections && (
        <SelectionSummary
          answers={answers}
        />
      )}

      {/* HARMONY */}

      {nailQuizConfig.result
        .showHarmony &&
        result.harmony && (
        <div className="mt-5 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 p-4">
          <div className="font-bold text-gray-900">
            🎨 Colour Harmony
          </div>

          <p className="mt-1 text-xs leading-relaxed text-gray-600">
            {result.harmony}
          </p>
        </div>
      )}

      {/* SERVICES */}

      {nailQuizConfig.result
        .showRecommendedServices &&
        result.recommendations
          ?.length > 0 && (
        <div className="mt-6">

          <h4 className="text-lg font-bold text-gray-900">
            Recommended Nail Services
          </h4>

          <p className="mt-1 text-xs text-gray-500">
            These are matched from our actual nail service catalogue.
          </p>

          <div className="mt-4 space-y-3">
            {result.recommendations.map(
              (service: any) => (
                <div
                  key={
                    service.id ??
                    service.slug
                  }
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                >
                  <div className="flex gap-3 p-3">

                    {service.image && (
                      <img
                        src={
                          service.image
                        }
                        alt={
                          service.title
                        }
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                      />
                    )}

                    <div className="min-w-0 flex-1">

                      <h5 className="font-bold text-gray-900">
                        {
                          service.title
                        }
                      </h5>

                      {service.shortDescription && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {
                            service.shortDescription
                          }
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between gap-2">

                        <span className="font-bold text-pink-600">
                          ₹
                          {
                            service.price
                          }
                        </span>

                        {onBookService && (
                          <button
                            type="button"
                            onClick={() =>
                              onBookService(
                                service
                              )
                            }
                            className="rounded-lg bg-pink-600 px-3 py-2 text-xs font-bold text-white hover:bg-pink-700"
                          >
                            Book
                          </button>
                        )}

                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* NO MATCH */}

      {nailQuizConfig.result
        .showRecommendedServices &&
        result.recommendations
          ?.length === 0 && (
        <div className="mt-6 rounded-2xl bg-gray-50 p-5 text-center">
          <div className="text-3xl">
            💅
          </div>

          <p className="mt-2 text-sm font-semibold text-gray-800">
            We couldn't find an exact match.
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Our nail artist can create a personalised look based on your choices.
          </p>
        </div>
      )}

      {/* ACTIONS */}

      <div className="mt-6 grid grid-cols-2 gap-3">

        {nailQuizConfig.result
          .showRetakeButton && (
          <button
            type="button"
            onClick={onRestart}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw
              size={15}
              className="mr-1 inline"
            />
            Retake Quiz
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-pink-600 px-4 py-3 text-sm font-bold text-white hover:bg-pink-700"
        >
          Done
        </button>

      </div>
    </div>
  );
}

function SelectionSummary({
  answers,
}: {
  answers: Partial<NailLookPreferences>;
}) {
  const items = [
    {
      label: 'Colour',
      value: answers.colourId,
      source: 'colours',
    },
    {
      label: 'Occasion',
      value: answers.occasionId,
      source: 'occasions',
    },
    {
      label: 'Outfit',
      value: answers.outfitId,
      source: 'outfits',
    },
    {
      label: 'Vibe',
      value: answers.vibeId,
      source: 'vibes',
    },
    {
      label: 'Length',
      value: answers.lengthId,
      source: 'lengths',
    },
    {
      label: 'Finish',
      value: answers.finishId,
      source: 'finishes',
    },
    {
      label: 'Shape',
      value: answers.shapeId,
      source: 'shapes',
    },
  ];

  return (
    <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

      <h4 className="text-sm font-bold text-gray-900">
        Your choices
      </h4>

      <div className="mt-3 flex flex-wrap gap-2">
        {items.map(
          item =>
            item.value && (
              <span
                key={item.label}
                className="rounded-full bg-gray-50 px-3 py-1.5 text-xs text-gray-700"
              >
                <strong>
                  {item.label}:
                </strong>{' '}
                {getNailQuizSelectionLabel(
                  item.source,
                  item.value
                )}
              </span>
            )
        )}
      </div>
    </div>
  );
}
