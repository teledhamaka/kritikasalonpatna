// kritika/src/app/nails/ClientNailPage.tsx
"use client";

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";

import dynamic from "next/dynamic";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

import { Service } from "../../types/service";
import { useAuth } from "../../context/AuthContext";
import { useBooking } from "../../context/BookingContext";

import TrendingCard from "../../components/TrendingCard";
import ServiceCard from "../../components/ServiceCard";

import { useIsMobile } from "../../hooks/useIsMobile";
import { useAutoScroll } from "../../hooks/useAutoScroll";

import { SCROLL_STYLE } from "../../constants/ui";
import { getServiceUrl } from "../../utils/serviceUrl";

/* -------------------------------------------------------------------------- */
/* EXISTING COMPONENTS                                                        */
/* -------------------------------------------------------------------------- */

const ServiceDetailModal = dynamic(
  () =>
    import("../../components/ServiceDetailModal"),
  {
    ssr: false,
  }
);

const TestimonialCard = dynamic(
  () =>
    import("../../components/TestimonialCard")
);

const LoginModal = dynamic(
  () =>
    import("../../components/LoginModal"),
  {
    ssr: false,
  }
);

const BookingFlow = dynamic(
  () =>
    import("../../components/booking/BookingFlow"),
  {
    ssr: false,
  }
);

/* -------------------------------------------------------------------------- */
/* NEW NAIL DISCOVERY COMPONENTS                                              */
/* -------------------------------------------------------------------------- */

const NailLookStudio = dynamic(
  () =>
    import(
      "../../components/nails/NailLookStudio"
    ),
  {
    ssr: false,
  }
);

const NailArtQuiz = dynamic(
  () =>
    import(
      "../../components/nails/NailArtQuiz"
    ),
  {
    ssr: false,
  }
);

const AINailAnalysis = dynamic(
  () =>
    import(
      "../../components/nails/AINailAnalysis"
    ),
  {
    ssr: false,
  }
);

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface ClientNailsPageProps {
  allServices: Service[];
  trendingServices: Service[];
}

/* -------------------------------------------------------------------------- */
/* NAIL SUBCATEGORIES                                                         */
/* -------------------------------------------------------------------------- */

const NAIL_SUBCATEGORIES = [
  {
    id: "manicure",
    title: "Manicure",
    description: "Classic & spa manicures",
    image:
      "/images/nails/gel_manicure.webp",
    color:
      "from-purple-500 to-pink-600",
    targetCategory: "Manicure",
    icon: "💅",
  },

  {
    id: "nail-art",
    title: "Nail Art",
    description:
      "Creative & trendy designs",
    image:
      "/images/nails/nail_art.webp",
    color:
      "from-pink-500 to-rose-600",
    targetCategory: "Nail Art",
    icon: "🎨",
  },

  {
    id: "pedicure",
    title: "Pedicure",
    description:
      "Relaxing foot treatments",
    image:
      "/images/nails/luxury_pedicure.webp",
    color:
      "from-amber-500 to-orange-600",
    targetCategory: "Pedicure",
    icon: "🦶",
  },

  {
    id: "nail-salon",
    title: "Nail Salon",
    description:
      "Full-service nail care",
    image:
      "/images/nails/nail_extension.webp",
    color:
      "from-blue-500 to-indigo-600",
    targetCategory: "Nail Salon",
    icon: "✨",
  },

  {
    id: "bridal-nails",
    title: "Bridal Nails",
    description:
      "Elegant nail designs for special occasions",
    image:
      "/images/nails/bridal_nails.webp",
    color:
      "from-rose-500 to-pink-600",
    targetCategory: "Bridal Nails",
    icon: "💎",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function ClientNailsPage({
  allServices,
  trendingServices,
}: ClientNailsPageProps) {
  const [favorites, setFavorites] =
    useState<Set<string>>(
      new Set()
    );

  const [
    selectedService,
    setSelectedService,
  ] = useState<Service | null>(
    null
  );

  const [
    showServiceDetail,
    setShowServiceDetail,
  ] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* NAIL DISCOVERY STATE                                                    */
  /* ---------------------------------------------------------------------- */

  const [
    showNailLookStudio,
    setShowNailLookStudio,
  ] = useState(false);

  const [
    showNailQuiz,
    setShowNailQuiz,
  ] = useState(false);

  const [
    showAIAnalysis,
    setShowAIAnalysis,
  ] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* EXISTING PAGE STATE                                                     */
  /* ---------------------------------------------------------------------- */

  const [
    showLoginModal,
    setShowLoginModal,
  ] = useState(false);

  const [
    bookingStep,
    setBookingStep,
  ] = useState<
    "browsing" | "booking"
  >("browsing");

  const [
    activeFaq,
    setActiveFaq,
  ] = useState<number | null>(
    null
  );

  const [mounted, setMounted] =
    useState(false);

  /* ---------------------------------------------------------------------- */
  /* HYDRATION                                                               */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ---------------------------------------------------------------------- */
  /* SCROLL                                                                  */
  /* ---------------------------------------------------------------------- */

  const scrollRefs =
    useRef<
      Record<
        string,
        HTMLDivElement | null
      >
    >({});

  const trendingScrollRef =
    useRef<HTMLDivElement>(null);

  const isMobile =
    useIsMobile();

  useAutoScroll(
    trendingScrollRef,
    {
      enabled:
        !isMobile &&
        trendingServices.length >=
          3,
    }
  );

  /* ---------------------------------------------------------------------- */
  /* AUTH / BOOKING                                                          */
  /* ---------------------------------------------------------------------- */

  const { isLoggedIn } =
    useAuth();

  const { addToCart } =
    useBooking();

  /*
   * Keep the existing booking behaviour.
   *
   * The discovery tools add the selected service
   * to the same BookingContext used everywhere else.
   */
  const handleBookService =
    useCallback(
      (service: Service) => {
        addToCart(service);
      },
      [addToCart]
    );

  /* ---------------------------------------------------------------------- */
  /* SERVICES BY CATEGORY                                                    */
  /* ---------------------------------------------------------------------- */

  const servicesByCategory =
    useMemo(() => {
      const map =
        new Map<
          string,
          Service[]
        >();

      NAIL_SUBCATEGORIES.forEach(
        category => {
          const filtered =
            allServices.filter(
              service =>
                service.category ===
                category.targetCategory
            );

          map.set(
            category.id,
            filtered
          );
        }
      );

      return map;
    }, [allServices]);

  /* ---------------------------------------------------------------------- */
  /* FAVORITES                                                               */
  /* ---------------------------------------------------------------------- */

  const toggleFavorite =
    useCallback(
      (id: string) => {
        setFavorites(
          previous => {
            const next =
              new Set(previous);

            if (
              next.has(id)
            ) {
              next.delete(id);
            } else {
              next.add(id);
            }

            return next;
          }
        );
      },
      []
    );

  /* ---------------------------------------------------------------------- */
  /* CATEGORY SCROLL                                                         */
  /* ---------------------------------------------------------------------- */

  const scrollCategory =
    (
      direction:
        | "left"
        | "right",
      categoryId: string
    ) => {
      const element =
        scrollRefs.current[
          categoryId
        ];

      if (!element) return;

      const scrollAmount =
        isMobile
          ? 220
          : 320;

      element.scrollBy({
        left:
          direction === "left"
            ? -scrollAmount
            : scrollAmount,
        behavior: "smooth",
      });
    };

  /* ---------------------------------------------------------------------- */
  /* BOOKING SCREEN                                                          */
  /* ---------------------------------------------------------------------- */

  if (
    bookingStep ===
    "booking"
  ) {
    return (
      <BookingFlow
        onBack={() =>
          setBookingStep(
            "browsing"
          )
        }
      />
    );
  }

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 safe-area-inset overflow-x-hidden w-full">

      <main className="mx-auto w-full max-w-7xl overflow-x-hidden px-4 py-6 pb-6 safe-area-inset md:pb-8">

        {/* ================================================================== */}
        {/* TRENDING NAIL SERVICES                                             */}
        {/* ================================================================== */}

        {trendingServices.length >
          0 && (
          <section className="mb-6 rounded-2xl border border-pink-200 bg-gradient-to-r from-pink-50 via-purple-50 to-rose-50 p-4">

            <div className="mb-4 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Trending Nail Services
                  </h2>

                  <p className="text-xs text-gray-600">
                    Most booked{" "}
                    {
                      trendingServices.length
                    }{" "}
                    this week
                  </p>
                </div>

              </div>

              <span className="rounded-full border border-pink-200 bg-white px-3 py-1 text-xs font-bold text-pink-600">
                {
                  trendingServices.length
                }{" "}
                Trending
              </span>

            </div>

            <div
              ref={
                trendingScrollRef
              }
              className={`flex pb-3 ${
                isMobile
                  ? "scrollbar-hide space-x-3 overflow-x-auto"
                  : "space-x-3 overflow-hidden"
              }`}
              style={SCROLL_STYLE}
            >

              {trendingServices.map(
                (
                  service,
                  index
                ) => (
                  <TrendingCard
                    key={
                      service.id
                    }
                    service={
                      service
                    }
                    href={getServiceUrl(
                      service
                    )}
                    onAddToCart={event => {
                      event.preventDefault();
                      addToCart(
                        service
                      );
                    }}
                    isMobile={
                      isMobile
                    }
                    priority={
                      index === 0
                    }
                    accent="pink"
                  />
                )
              )}

              <div
                className={`group flex flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-pink-200 bg-gradient-to-br from-pink-100 to-rose-100 text-center transition-colors hover:from-pink-200 hover:to-rose-200 ${
                  isMobile
                    ? "min-w-[130px] p-3"
                    : "min-w-[150px] p-4"
                }`}
                onClick={() =>
                  document
                    .getElementById(
                      "nails-services-start"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    })
                }
                role="button"
                tabIndex={0}
              >
                <span className="mb-1 text-3xl transition-transform group-hover:scale-110">
                  ✨
                </span>

                <p className="text-sm font-bold text-gray-800">
                  All Services
                </p>

                <p className="mt-0.5 text-xs text-gray-600">
                  {
                    allServices.length
                  }
                  + choices
                </p>

                <ArrowRight className="mt-1.5 h-4 w-4 text-pink-600 transition-transform group-hover:translate-x-1" />
              </div>

            </div>
          </section>
        )}

        {/* ================================================================== */}
        {/* NAIL SERVICES                                                       */}
        {/* ================================================================== */}

        <div id="nails-services-start">

          {NAIL_SUBCATEGORIES.map(
            category => {
              const services =
                servicesByCategory.get(
                  category.id
                ) || [];

              if (
                services.length ===
                0
              ) {
                return null;
              }

              return (
                <section
                  key={
                    category.id
                  }
                  className="mb-10"
                  data-category={
                    category.title
                  }
                >

                  <div className="mb-3 flex items-center justify-between">

                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {
                          category.icon
                        }
                      </span>

                      <h2 className="text-lg font-bold text-gray-800">
                        {
                          category.title
                        }
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          scrollCategory(
                            "left",
                            category.id
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-pink-200 bg-white shadow-sm transition-colors hover:bg-pink-50"
                        aria-label={`Scroll ${category.title} left`}
                      >
                        <ChevronLeft className="h-4 w-4 text-pink-600" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          scrollCategory(
                            "right",
                            category.id
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-pink-200 bg-white shadow-sm transition-colors hover:bg-pink-50"
                        aria-label={`Scroll ${category.title} right`}
                      >
                        <ChevronRight className="h-4 w-4 text-pink-600" />
                      </button>

                    </div>
                  </div>

                  <div
                    ref={element => {
                      scrollRefs.current[
                        category.id
                      ] =
                        element;
                    }}
                    className="scrollbar-hide flex snap-x snap-mandatory space-x-3 overflow-x-auto pb-2"
                    style={
                      SCROLL_STYLE
                    }
                  >

                    {services.map(
                      (
                        service,
                        index
                      ) => (
                        <div
                          key={
                            service.id
                          }
                          className="w-[175px] flex-shrink-0 snap-start md:w-[200px]"
                        >
                          <ServiceCard
                            service={
                              service
                            }
                            isFavorite={favorites.has(
                              service.id
                            )}
                            onToggleFavorite={() =>
                              toggleFavorite(
                                service.id
                              )
                            }
                            onAddToCart={() =>
                              addToCart(
                                service
                              )
                            }
                            onViewDetails={() => {
                              setSelectedService(
                                service
                              );
                              setShowServiceDetail(
                                true
                              );
                            }}
                            variant="compact"
                            locationSlug="nails"
                            priority={
                              index === 0
                            }
                          />
                        </div>
                      )
                    )}

                  </div>
                </section>
              );
            }
          )}

        </div>

        {/* ================================================================== */}
        {/* NAIL LOOK DISCOVERY                                                */}
        {/* ================================================================== */}

        <section
          className="mb-8"
          aria-labelledby="nail-look-heading"
        >

          <div className="mb-4 text-center">

            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-3 py-1 text-xs font-bold text-pink-600 shadow-sm">
              ✨ Personalised Nail Styling
            </div>

            <h2
              id="nail-look-heading"
              className="text-xl font-bold text-gray-900"
            >
              Find Your Perfect Nail Look
            </h2>

            <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-gray-500">
              Choose a colour, tell us your style,
              or upload a nail photo. We’ll help you
              discover a look that matches you.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

            {/* ============================================================ */}
            {/* COLOUR WHEEL                                                   */}
            {/* ============================================================ */}

            <button
              type="button"
              onClick={() =>
                setShowNailLookStudio(
                  true
                )
              }
              className="group rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-lg active:scale-[0.98]"
            >

              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-2xl shadow-md transition-transform group-hover:scale-110">
                🎨
              </div>

              <h3 className="text-sm font-bold text-purple-800">
                Nail Colour Wheel
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                Start with your favourite colour
                and build your complete nail look.
              </p>

              <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-purple-200 bg-white px-3 py-1.5 text-xs font-semibold text-purple-600">
                Explore Colours
                <ArrowRight className="h-3 w-3" />
              </span>

            </button>

            {/* ============================================================ */}
            {/* NAIL ART QUIZ                                                  */}
            {/* ============================================================ */}

            <button
              type="button"
              onClick={() =>
                setShowNailQuiz(
                  true
                )
              }
              className="group rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 via-white to-rose-50 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-pink-300 hover:shadow-lg active:scale-[0.98]"
            >

              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-2xl shadow-md transition-transform group-hover:scale-110">
                💅
              </div>

              <h3 className="text-sm font-bold text-pink-800">
                Nail Art Quiz
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                Tell us your occasion, outfit and
                style. We’ll match your nail look.
              </p>

              <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-pink-200 bg-white px-3 py-1.5 text-xs font-semibold text-pink-600">
                Start Quiz
                <ArrowRight className="h-3 w-3" />
              </span>

            </button>

            {/* ============================================================ */}
            {/* AI NAIL ANALYSIS                                               */}
            {/* ============================================================ */}

            <button
              type="button"
              onClick={() =>
                setShowAIAnalysis(
                  true
                )
              }
              className="group rounded-2xl border-2 border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-purple-50 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-fuchsia-300 hover:shadow-lg active:scale-[0.98]"
            >

              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 text-2xl shadow-md transition-transform group-hover:scale-110">
                ✨
              </div>

              <h3 className="text-sm font-bold text-fuchsia-800">
                AI Nail Analysis
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                Upload a nail photo for personalised
                colour, shape and style suggestions.
              </p>

              <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-fuchsia-200 bg-white px-3 py-1.5 text-xs font-semibold text-fuchsia-600">
                Analyse My Nails
                <ArrowRight className="h-3 w-3" />
              </span>

            </button>

          </div>
        </section>

        {/* ================================================================== */}
        {/* WHY CHOOSE US                                                      */}
        {/* ================================================================== */}

        <section className="mb-6 rounded-2xl border border-pink-200 bg-gradient-to-r from-pink-50 via-purple-50 to-rose-50 p-6">

          <h2 className="mb-4 text-center text-xl font-bold text-gray-800">
            Why Clients Love Kritika Nail Studio ✨
          </h2>

          <div className="mb-5 flex justify-center">

            <div className="inline-flex items-center gap-2 rounded-full border-2 border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-800 shadow-sm">
              🏆 Premium Nail Artists & Hygienic Studio
            </div>

          </div>

          <div className="grid grid-cols-3 gap-4 text-center">

            <div className="flex flex-col items-center">
              <div className="mb-1 text-3xl">
                💅
              </div>

              <div className="text-2xl font-bold text-gray-900">
                {
                  allServices.length
                }
                +
              </div>

              <div className="text-xs text-gray-500">
                Nail Services
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-1 text-3xl">
                ⭐
              </div>

              <div className="text-2xl font-bold text-gray-900">
                4.8
              </div>

              <div className="text-xs text-gray-500">
                1800+ Reviews
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-1 text-3xl">
                👤
              </div>

              <div className="text-2xl font-bold text-gray-900">
                1800+
              </div>

              <div className="text-xs text-gray-500">
                Happy Clients
              </div>
            </div>

          </div>

          <div className="mt-6 text-center">

            <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-bold text-pink-600 shadow-sm">

              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

              <span>
                Open Now
              </span>

              <span className="font-normal text-gray-600">
                9:00 AM – 8:00 PM
              </span>

            </div>

          </div>
        </section>

        {/* ================================================================== */}
        {/* TESTIMONIALS                                                       */}
        {/* ================================================================== */}

        <section
          className="mb-6"
          aria-label="Customer testimonials"
        >

          <h2 className="mb-4 text-center text-xl font-bold text-gray-800">
            Nail Transformations
          </h2>

          <div
            className="scrollbar-hide flex space-x-4 overflow-x-auto pb-4"
            style={SCROLL_STYLE}
          >

            <TestimonialCard
              name="Priya S."
              text="The gel manicure lasted 3 weeks! Best nail art in town."
              image="/images/nails/manicure.webp"
            />

            <TestimonialCard
              name="Ananya R."
              text="Loved my acrylic extensions – perfect shape and durability."
              image="/images/nails/extensions.webp"
            />

            <TestimonialCard
              name="Maya T."
              text="Nail art is stunning. They replicated my Pinterest board perfectly!"
              image="/images/nails/nailart.webp"
            />

          </div>
        </section>

        {/* ================================================================== */}
        {/* PROMO BANNER                                                        */}
        {/* ================================================================== */}

        <section className="rounded-2xl border border-pink-200 bg-gradient-to-r from-pink-100 via-purple-100 to-rose-100 p-6 text-center">

          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-pink-500 px-3 py-1.5 text-xs font-bold text-white">
            ✨ NAIL SALE
          </div>

          <h3 className="mb-1 text-lg font-bold text-gray-800">
            20% OFF on All Gel & Acrylic Services
          </h3>

          <p className="mb-4 text-sm text-gray-500">
            Get the perfect set for any occasion!
          </p>

          <button
            type="button"
            onClick={() => {
              const salonSection =
                document.querySelector(
                  '[data-category="Nail Salon"]'
                );

              if (
                salonSection
              ) {
                salonSection.scrollIntoView(
                  {
                    behavior:
                      "smooth",
                  }
                );
              }
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md"
          >
            Explore Nail Deals
            <ArrowRight className="h-4 w-4" />
          </button>

        </section>

      </main>

      {/* ==================================================================== */}
      {/* EXISTING SERVICE DETAIL MODAL                                       */}
      {/* ==================================================================== */}

      {mounted &&
        selectedService &&
        showServiceDetail && (
          <ServiceDetailModal
            service={
              selectedService
            }
            isOpen={
              showServiceDetail
            }
            onClose={() =>
              setShowServiceDetail(
                false
              )
            }
            onAddToCart={service =>
              addToCart(
                service
              )
            }
            activeFaq={
              activeFaq
            }
            setActiveFaq={
              setActiveFaq
            }
          />
        )}

      {/* ==================================================================== */}
      {/* NAIL LOOK STUDIO                                                     */}
      {/* ==================================================================== */}

      {showNailLookStudio && (
        <NailLookStudio
          services={
            allServices
          }
          onClose={() =>
            setShowNailLookStudio(
              false
            )
          }
          onBookService={
            handleBookService
          }
        />
      )}

      {/* ==================================================================== */}
      {/* NAIL ART QUIZ                                                        */}
      {/* ==================================================================== */}

      {showNailQuiz && (
        <NailArtQuiz
          services={
            allServices
          }
          onClose={() =>
            setShowNailQuiz(
              false
            )
          }
          onBookService={
            handleBookService
          }
        />
      )}

      {/* ==================================================================== */}
      {/* AI NAIL ANALYSIS                                                     */}
      {/* ==================================================================== */}

      {showAIAnalysis && (
        <AINailAnalysis
          services={
            allServices
          }
          onClose={() =>
            setShowAIAnalysis(
              false
            )
          }
          onBookService={
            handleBookService
          }
        />
      )}

      {/* ==================================================================== */}
      {/* EXISTING LOGIN MODAL                                                 */}
      {/* ==================================================================== */}

      <LoginModal
        isOpen={
          showLoginModal
        }
        onClose={() =>
          setShowLoginModal(
            false
          )
        }
        onLoginSuccess={() => {
          setShowLoginModal(
            false
          );

          setBookingStep(
            "booking"
          );
        }}
        onSkipToHome={() =>
          setShowLoginModal(
            false
          )
        }
      />

    </div>
  );
}