'use client';

import {
  ChangeEvent,
  useMemo,
  useState,
} from 'react';

import {
  ArrowRight,
  Camera,
  Check,
  ImagePlus,
  Loader2,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';

import {
  getRecommendedServices,
  nailLookConfig,
  type NailLookPreferences,
} from '../../data/nails/nailLookData';

interface AINailAnalysisProps {
  services: any[];
  onClose: () => void;
  onBookService?: (service: any) => void;
}

interface AnalysisResponse {
  success?: boolean;
  message?: string;

  preferences?: Partial<NailLookPreferences>;

  analysis?: {
    nailLength?: string;
    nailShape?: string;
    currentStyle?: string;
    suggestedColours?: string[];
    suggestedStyles?: string[];
    suggestedFinish?: string;
    confidence?: number;
  };

  recommendations?: string[];
}

const MAX_FILE_SIZE =
  nailLookConfig.aiAnalysis.maxFileSizeMB *
  1024 *
  1024;

const ACCEPTED_TYPES =
  nailLookConfig.aiAnalysis.acceptedTypes;

export default function AINailAnalysis({
  services,
  onClose,
  onBookService,
}: AINailAnalysisProps) {
  const [file, setFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [isDragging, setIsDragging] =
    useState(false);

  const [isAnalysing, setIsAnalysing] =
    useState(false);

  const [result, setResult] =
    useState<AnalysisResponse | null>(null);

  const [error, setError] =
    useState('');

  const handleFile = (
    selectedFile: File
  ) => {
    setError('');
    setResult(null);

    if (
      !ACCEPTED_TYPES.includes(
        selectedFile.type
      )
    ) {
      setError(
        'Please upload a JPG, PNG or WebP image.'
      );
      return;
    }

    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      setError(
        `Please choose an image smaller than ${nailLookConfig.aiAnalysis.maxFileSizeMB} MB.`
      );
      return;
    }

    setFile(selectedFile);

    const url =
      URL.createObjectURL(
        selectedFile
      );

    setPreviewUrl(url);
  };

  const onFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError('');
  };

  const analyse = async () => {
    if (!file) {
      setError(
        'Please upload a nail photo first.'
      );
      return;
    }

    setIsAnalysing(true);
    setError('');

    try {
      const formData =
        new FormData();

      formData.append(
        'image',
        file
      );

      const response =
        await fetch(
          nailLookConfig
            .aiAnalysis
            .endpoint,
          {
            method: 'POST',
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Unable to analyse the image right now.'
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">

      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">
                ✨
              </span>

              <h2 className="font-bold text-gray-900">
                AI Nail Analysis
              </h2>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Discover nail styles that may suit your photo.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI Nail Analysis"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>

        </div>

        <div className="overflow-y-auto">

          {!result ? (
            <UploadView
              file={file}
              previewUrl={previewUrl}
              isDragging={isDragging}
              isAnalysing={
                isAnalysing
              }
              error={error}
              onFileChange={
                onFileChange
              }
              onDrop={event => {
                event.preventDefault();
                setIsDragging(false);

                const dropped =
                  event.dataTransfer
                    .files?.[0];

                if (dropped) {
                  handleFile(
                    dropped
                  );
                }
              }}
              onDragOver={event => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() =>
                setIsDragging(false)
              }
              onClear={clearFile}
              onAnalyse={analyse}
            />
          ) : (
            <AnalysisResult
              result={result}
              services={services}
              onBookService={
                onBookService
              }
              onRetake={clearFile}
              onClose={onClose}
            />
          )}

        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* UPLOAD VIEW */
/* -------------------------------------------------- */

function UploadView({
  file,
  previewUrl,
  isDragging,
  isAnalysing,
  error,
  onFileChange,
  onDrop,
  onDragOver,
  onDragLeave,
  onClear,
  onAnalyse,
}: {
  file: File | null;
  previewUrl: string | null;
  isDragging: boolean;
  isAnalysing: boolean;
  error: string;
  onFileChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  onDrop: (
    event: React.DragEvent<HTMLLabelElement>
  ) => void;
  onDragOver: (
    event: React.DragEvent<HTMLLabelElement>
  ) => void;
  onDragLeave: () => void;
  onClear: () => void;
  onAnalyse: () => void;
}) {
  return (
    <div className="p-5 sm:p-7">

      {/* INTRO */}

      <div className="mb-6 text-center">

        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 text-2xl">
          ✨
        </div>

        <h3 className="text-xl font-bold text-gray-900">
          Find your nail style
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
          Upload a clear photo of your nails and get style suggestions for colour, shape, finish and nail designs.
        </p>

      </div>

      {/* UPLOAD */}

      {!previewUrl ? (
        <label
          htmlFor="ai-nail-photo"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={[
            'flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition sm:p-12',
            isDragging
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-200 bg-gray-50 hover:border-pink-300 hover:bg-pink-50/50',
          ].join(' ')}
        >

          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-pink-500 shadow-sm">
            <ImagePlus size={28} />
          </div>

          <p className="font-bold text-gray-900">
            Upload a nail photo
          </p>

          <p className="mt-1 text-xs text-gray-500">
            JPG, PNG or WebP · Max{' '}
            {nailLookConfig.aiAnalysis.maxFileSizeMB}
            MB
          </p>

          <span className="mt-5 rounded-xl bg-pink-600 px-5 py-2.5 text-xs font-bold text-white">
            Choose Photo
          </span>

          <input
            id="ai-nail-photo"
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={onFileChange}
            className="sr-only"
          />
        </label>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-gray-50">

          {/* PREVIEW */}

          <div className="relative aspect-[4/3] w-full bg-gray-100">

            <img
              src={previewUrl}
              alt="Uploaded nail photo preview"
              className="h-full w-full object-contain"
            />

            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/75"
              aria-label="Remove uploaded photo"
            >
              <X size={17} />
            </button>

          </div>

          {/* FILE */}

          <div className="flex items-center gap-3 p-4">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-pink-500 shadow-sm">
              <Camera size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800">
                {file?.name}
              </p>

              {file && (
                <p className="text-[11px] text-gray-500">
                  {formatFileSize(
                    file.size
                  )}
                </p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TIPS */}

      {!previewUrl && (
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Tip
            icon="💡"
            text="Good lighting"
          />

          <Tip
            icon="📸"
            text="Clear photo"
          />

          <Tip
            icon="💅"
            text="Show your nails"
          />
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-center text-xs font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ACTION */}

      {previewUrl && (
        <button
          type="button"
          onClick={onAnalyse}
          disabled={isAnalysing}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:from-pink-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAnalysing ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />
              Analysing your nail style...
            </>
          ) : (
            <>
              <Sparkles size={17} />
              Analyse My Nail Style
              <ArrowRight size={16} />
            </>
          )}
        </button>
      )}

      {/* DISCLAIMER */}

      <p className="mt-5 text-center text-[10px] leading-relaxed text-gray-400">
        {nailLookConfig.aiAnalysis.disclaimer}
      </p>

    </div>
  );
}

/* -------------------------------------------------- */
/* RESULT */
/* -------------------------------------------------- */

function AnalysisResult({
  result,
  services,
  onBookService,
  onRetake,
  onClose,
}: {
  result: AnalysisResponse;
  services: any[];
  onBookService?: (
    service: any
  ) => void;
  onRetake: () => void;
  onClose: () => void;
}) {
  const preferences =
    result.preferences;

  const recommendations =
    useMemo(() => {
      if (
        !preferences ||
        !isCompletePreferences(
          preferences
        )
      ) {
        return [];
      }

      return getRecommendedServices(
        services,
        preferences as NailLookPreferences
      ).slice(
        0,
        nailLookConfig
          .aiAnalysis
          .maxRecommendations
      );
    }, [
      preferences,
      services,
    ]);

  return (
    <div className="p-5 sm:p-7">

      {/* RESULT HERO */}

      <div className="rounded-3xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-pink-600 p-6 text-center text-white">

        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-2xl">
          ✨
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
          AI Nail Analysis
        </span>

        <h3 className="mt-1 text-2xl font-bold">
          Your Nail Style
        </h3>

        <p className="mt-2 text-sm text-white/80">
          Here are style directions you can explore.
        </p>

      </div>

      {/* ANALYSIS DETAILS */}

      {result.analysis && (
        <div className="mt-5 grid grid-cols-2 gap-3">

          {result.analysis
            .nailLength && (
            <AnalysisCell
              label="Length"
              value={
                result.analysis
                  .nailLength
              }
            />
          )}

          {result.analysis
            .nailShape && (
            <AnalysisCell
              label="Shape"
              value={
                result.analysis
                  .nailShape
              }
            />
          )}

          {result.analysis
            .currentStyle && (
            <AnalysisCell
              label="Current Style"
              value={
                result.analysis
                  .currentStyle
              }
            />
          )}

          {result.analysis
            .suggestedFinish && (
            <AnalysisCell
              label="Suggested Finish"
              value={
                result.analysis
                  .suggestedFinish
              }
            />
          )}

        </div>
      )}

      {/* COLOURS */}

      {result.analysis
        ?.suggestedColours
        ?.length ? (
        <TagSection
          title="Colours to explore"
          items={
            result.analysis
              .suggestedColours
          }
        />
      ) : null}

      {/* STYLES */}

      {result.analysis
        ?.suggestedStyles
        ?.length ? (
        <TagSection
          title="Styles to explore"
          items={
            result.analysis
              .suggestedStyles
          }
        />
      ) : null}

      {/* SERVICES */}

      {recommendations.length > 0 && (
        <div className="mt-6">

          <div className="mb-3">
            <h4 className="font-bold text-gray-900">
              Recommended services
            </h4>

            <p className="mt-1 text-xs text-gray-500">
              Matched from our actual nail service catalogue.
            </p>
          </div>

          <div className="space-y-3">

            {recommendations.map(
              service => (
                <div
                  key={
                    service.id ??
                    service.slug
                  }
                  className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
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
        </div>
      )}

      {/* FALLBACK */}

      {recommendations.length === 0 && (
        <div className="mt-6 rounded-2xl bg-gray-50 p-5 text-center">

          <div className="text-3xl">
            💅
          </div>

          <p className="mt-2 text-sm font-bold text-gray-800">
            Your nail artist can personalise this look for you.
          </p>

          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Use the Colour Wheel or Nail Art Quiz to explore more specific combinations.
          </p>

        </div>
      )}

      {/* ACTIONS */}

      <div className="mt-6 grid grid-cols-2 gap-3">

        <button
          type="button"
          onClick={onRetake}
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Analyse Another
        </button>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-pink-600 px-4 py-3 text-sm font-bold text-white hover:bg-pink-700"
        >
          Done
        </button>

      </div>

      {/* DISCLAIMER */}

      <p className="mt-5 text-center text-[10px] leading-relaxed text-gray-400">
        {nailLookConfig.aiAnalysis.disclaimer}
      </p>

    </div>
  );
}

/* -------------------------------------------------- */
/* SMALL COMPONENTS */
/* -------------------------------------------------- */

function Tip({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-3 text-center">
      <div className="text-lg">
        {icon}
      </div>

      <div className="mt-1 text-[10px] font-medium text-gray-500">
        {text}
      </div>
    </div>
  );
}

function AnalysisCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </div>

      <div className="mt-1 text-sm font-bold text-gray-800">
        {value}
      </div>
    </div>
  );
}

function TagSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="mt-5">

      <h4 className="mb-2 text-sm font-bold text-gray-900">
        {title}
      </h4>

      <div className="flex flex-wrap gap-2">
        {items.map(
          item => (
            <span
              key={item}
              className="rounded-full bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-700"
            >
              {item}
            </span>
          )
        )}
      </div>

    </div>
  );
}

function isCompletePreferences(
  preferences: Partial<NailLookPreferences>
): preferences is NailLookPreferences {
  return Boolean(
    preferences.colourId &&
    preferences.occasionId &&
    preferences.outfitId &&
    preferences.vibeId &&
    preferences.lengthId &&
    preferences.finishId &&
    preferences.shapeId &&
    preferences.harmonyId
  );
}

function formatFileSize(
  bytes: number
): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}