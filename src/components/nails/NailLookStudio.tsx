'use client';

import { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';

import {
  DEFAULT_NAIL_LOOK,
  getHarmonyDescription,
  getLookTitle,
  getRecommendedServices,
  getSelectedColour,
  nailLookConfig,
  type NailLookPreferences,
} from '../../data/nails/nailLookData';

interface NailLookStudioProps {
  services: any[];
  onClose: () => void;
  onBookService?: (service: any) => void;
}

type SelectionKey = keyof NailLookPreferences;

export default function NailLookStudio({
  services,
  onClose,
  onBookService,
}: NailLookStudioProps) {
  const [preferences, setPreferences] =
    useState<NailLookPreferences>(
      DEFAULT_NAIL_LOOK
    );

  const [showAdvanced, setShowAdvanced] =
    useState(false);

  const recommendations = useMemo(
    () =>
      getRecommendedServices(
        services,
        preferences
      ),
    [services, preferences]
  );

  const selectedColour =
    getSelectedColour(preferences);

  const updatePreference = (
    key: SelectionKey,
    value: string
  ) => {
    setPreferences(previous => ({
      ...previous,
      [key]: value,
    }));
  };

  const reset = () => {
    setPreferences(
      DEFAULT_NAIL_LOOK
    );
    setShowAdvanced(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">
                🎨
              </span>

              <h2 className="font-bold text-gray-900">
                {nailLookConfig.branding.title}
              </h2>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              {nailLookConfig.branding.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Nail Look Studio"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}

        <div className="overflow-y-auto">
          <div className="grid gap-6 p-5 lg:grid-cols-[1.15fr_.85fr] sm:p-7">

            {/* LEFT */}

            <div>

              {/* BADGE */}

              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-600">
                <Sparkles size={13} />
                {nailLookConfig.branding.badge}
              </div>

              {/* COLOUR WHEEL */}

              <ColourWheel
                selectedColourId={
                  preferences.colourId
                }
                onSelect={value =>
                  updatePreference(
                    'colourId',
                    value
                  )
                }
              />

              {/* OCCASION */}

              <OptionSection
                title="What's the occasion?"
                options={
                  nailLookConfig.occasions
                }
                selectedId={
                  preferences.occasionId
                }
                onSelect={value =>
                  updatePreference(
                    'occasionId',
                    value
                  )
                }
              />

              {/* OUTFIT */}

              <OptionSection
                title="What are you wearing?"
                options={
                  nailLookConfig.outfits
                }
                selectedId={
                  preferences.outfitId
                }
                onSelect={value =>
                  updatePreference(
                    'outfitId',
                    value
                  )
                }
              />

              {/* VIBE */}

              <OptionSection
                title="What's your vibe?"
                options={
                  nailLookConfig.vibes
                }
                selectedId={
                  preferences.vibeId
                }
                onSelect={value =>
                  updatePreference(
                    'vibeId',
                    value
                  )
                }
              />

              {/* ADVANCED */}

              <button
                type="button"
                onClick={() =>
                  setShowAdvanced(
                    previous =>
                      !previous
                  )
                }
                className="mt-5 flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-bold text-gray-800"
              >
                <span>
                  Fine-tune my nail look
                </span>

                {showAdvanced ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-4">

                  <OptionSection
                    title="Nail length"
                    options={
                      nailLookConfig.lengths
                    }
                    selectedId={
                      preferences.lengthId
                    }
                    onSelect={value =>
                      updatePreference(
                        'lengthId',
                        value
                      )
                    }
                  />

                  <OptionSection
                    title="Finish"
                    options={
                      nailLookConfig.finishes
                    }
                    selectedId={
                      preferences.finishId
                    }
                    onSelect={value =>
                      updatePreference(
                        'finishId',
                        value
                      )
                    }
                  />

                  <OptionSection
                    title="Shape"
                    options={
                      nailLookConfig.shapes
                    }
                    selectedId={
                      preferences.shapeId
                    }
                    onSelect={value =>
                      updatePreference(
                        'shapeId',
                        value
                      )
                    }
                  />

                  <OptionSection
                    title="Colour harmony"
                    options={
                      nailLookConfig.harmonies
                    }
                    selectedId={
                      preferences.harmonyId
                    }
                    onSelect={value =>
                      updatePreference(
                        'harmonyId',
                        value
                      )
                    }
                  />

                </div>
              )}

            </div>

            {/* RIGHT / MY LOOK */}

            <div className="lg:sticky lg:top-0 lg:self-start">

              <MyNailLook
                preferences={
                  preferences
                }
                recommendations={
                  recommendations
                }
                selectedColour={
                  selectedColour
                }
                onBookService={
                  onBookService
                }
              />

              <button
                type="button"
                onClick={reset}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                <RotateCcw size={15} />
                Reset Look
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* COLOUR WHEEL */
/* -------------------------------------------------- */

function ColourWheel({
  selectedColourId,
  onSelect,
}: {
  selectedColourId: string;
  onSelect: (id: string) => void;
}) {
  const colours =
    nailLookConfig.colours;

  return (
    <section>
      <div className="mb-3">
        <h3 className="text-lg font-bold text-gray-900">
          Choose your colour
        </h3>

        <p className="text-xs text-gray-500">
          Start with the shade you love.
        </p>
      </div>

      <div className="relative mx-auto mb-5 aspect-square w-full max-w-[330px]">

        {/* OUTER RING */}

        <div className="absolute inset-0 rounded-full border border-gray-200 bg-white shadow-inner" />

        {/* COLOURS */}

        {colours.map(
          (colour, index) => {
            const angle =
              (360 / colours.length) *
                index -
              90;

            const radius = 42;

            const x =
              50 +
              radius *
                Math.cos(
                  (angle *
                    Math.PI) /
                    180
                );

            const y =
              50 +
              radius *
                Math.sin(
                  (angle *
                    Math.PI) /
                    180
                );

            const selected =
              selectedColourId ===
              colour.id;

            return (
              <button
                key={colour.id}
                type="button"
                aria-label={`Choose ${colour.name}`}
                onClick={() =>
                  onSelect(
                    colour.id
                  )
                }
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
              >
                <span
                  className={[
                    'block h-12 w-12 rounded-full border-4 border-white shadow-lg sm:h-14 sm:w-14',
                    selected
                      ? 'ring-4 ring-pink-300 ring-offset-2'
                      : '',
                  ].join(' ')}
                  style={{
                    backgroundColor:
                      colour.hex,
                  }}
                />

                {selected && (
                  <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow">
                    <Check size={17} />
                  </span>
                )}
              </button>
            );
          }
        )}

        {/* CENTRE */}

        <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-8 border-white bg-white text-center shadow-lg">
          <span
            className="mb-1 h-7 w-7 rounded-full shadow"
            style={{
              backgroundColor:
                nailLookConfig.colours.find(
                  colour =>
                    colour.id ===
                    selectedColourId
                )?.hex ??
                '#F4C2C2',
            }}
          />

          <span className="px-2 text-[11px] font-bold text-gray-800">
            {
              nailLookConfig.colours.find(
                colour =>
                  colour.id ===
                  selectedColourId
              )?.name
            }
          </span>
        </div>
      </div>

      {/* COLOUR DESCRIPTION */}

      {nailLookConfig.colours.find(
        colour =>
          colour.id ===
          selectedColourId
      ) && (
        <div className="rounded-2xl bg-gray-50 p-4 text-center">
          <p className="text-sm font-bold text-gray-900">
            {
              nailLookConfig.colours.find(
                colour =>
                  colour.id ===
                  selectedColourId
              )?.name
            }
          </p>

          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            {
              nailLookConfig.colours.find(
                colour =>
                  colour.id ===
                  selectedColourId
              )?.description
            }
          </p>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------- */
/* OPTION SECTION */
/* -------------------------------------------------- */

function OptionSection({
  title,
  options,
  selectedId,
  onSelect,
}: {
  title: string;
  options: readonly any[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="mt-6">
      <h3 className="mb-3 text-sm font-bold text-gray-900">
        {title}
      </h3>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {options.map(option => {
          const selected =
            selectedId ===
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
                'shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition',
                selected
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-pink-300',
              ].join(' ')}
            >
              {option.emoji && (
                <span className="mr-1">
                  {option.emoji}
                </span>
              )}

              {option.label ??
                option.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------------------------------------- */
/* MY NAIL LOOK */
/* -------------------------------------------------- */

function MyNailLook({
  preferences,
  recommendations,
  selectedColour,
  onBookService,
}: {
  preferences: NailLookPreferences;
  recommendations: any[];
  selectedColour: any;
  onBookService?: (
    service: any
  ) => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-lg">

      {/* RESULT HEADER */}

      <div className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-purple-600 to-fuchsia-600 p-6 text-white">

        <div
          className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-20"
          style={{
            backgroundColor:
              selectedColour?.hex,
          }}
        />

        <div className="relative">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
            {nailLookConfig.branding.resultTitle}
          </span>

          <h3 className="mt-1 text-2xl font-bold">
            {getLookTitle(
              preferences
            )}
          </h3>

          <p className="mt-2 text-xs text-white/80">
            Your personalised nail styling basket
          </p>
        </div>
      </div>

      {/* MATRIX */}

      <div className="grid grid-cols-2 gap-px bg-gray-100">

        <ResultCell
          label="Colour"
          value={
            selectedColour?.name
          }
          accent={
            selectedColour?.hex
          }
        />

        <ResultCell
          label="Occasion"
          value={getLabel(
            nailLookConfig.occasions,
            preferences.occasionId
          )}
        />

        <ResultCell
          label="Outfit"
          value={getLabel(
            nailLookConfig.outfits,
            preferences.outfitId
          )}
        />

        <ResultCell
          label="Vibe"
          value={getLabel(
            nailLookConfig.vibes,
            preferences.vibeId
          )}
        />

        <ResultCell
          label="Length"
          value={getLabel(
            nailLookConfig.lengths,
            preferences.lengthId
          )}
        />

        <ResultCell
          label="Finish"
          value={getLabel(
            nailLookConfig.finishes,
            preferences.finishId
          )}
        />

        <ResultCell
          label="Shape"
          value={getLabel(
            nailLookConfig.shapes,
            preferences.shapeId
          )}
        />

        <ResultCell
          label="Harmony"
          value={getLabel(
            nailLookConfig.harmonies,
            preferences.harmonyId
          )}
        />

      </div>

      {/* HARMONY DESCRIPTION */}

      <div className="border-t border-gray-100 p-4">
        <p className="text-xs leading-relaxed text-gray-500">
          <strong className="text-gray-800">
            Why this works:
          </strong>{' '}
          {getHarmonyDescription(
            preferences
          )}
        </p>
      </div>

      {/* RECOMMENDATIONS */}

      <div className="border-t border-gray-100 p-4">

        <div className="mb-3 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-900">
              Recommended for you
            </h4>

            <p className="text-[11px] text-gray-500">
              Matched from our nail services
            </p>
          </div>

          <Sparkles
            size={18}
            className="text-pink-500"
          />
        </div>

        {recommendations.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 p-4 text-center">
            <div className="text-2xl">
              💅
            </div>

            <p className="mt-1 text-xs font-semibold text-gray-800">
              Your look can be customised in-studio.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map(
              service => (
                <div
                  key={
                    service.id ??
                    service.slug
                  }
                  className="rounded-2xl border border-gray-100 p-3"
                >
                  <div className="flex gap-3">

                    {service.image && (
                      <img
                        src={
                          service.image
                        }
                        alt={
                          service.title
                        }
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <h5 className="line-clamp-2 text-sm font-bold text-gray-900">
                        {
                          service.title
                        }
                      </h5>

                      <div className="mt-1 flex items-center justify-between gap-2">
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
                            className="rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-pink-700"
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
        )}

      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* RESULT CELL */
/* -------------------------------------------------- */

function ResultCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="bg-white p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </div>

      <div className="mt-1 flex items-center gap-2 text-xs font-bold text-gray-800">
        {accent && (
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-white shadow"
            style={{
              backgroundColor:
                accent,
            }}
          />
        )}

        <span className="truncate">
          {value}
        </span>
      </div>
    </div>
  );
}

function getLabel(
  options: readonly any[],
  id: string
) {
  const option =
    options.find(
      item => item.id === id
    );

  return (
    option?.label ??
    option?.name ??
    id
  );
}