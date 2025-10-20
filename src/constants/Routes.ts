export const ROUTES = {
  HOME: '/',
  MAKEUP: '/makeup',
  SKIN: '/skin',
  HAIR: '/hair',
  NAIL: '/nails',
  BLOG: '/blog',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ACCOUNT: '/account',
  SETTINGS: '/settings',
  BOOKING: '/booking',
  SERVICE_DETAIL: '/service-detail',
  CONFIRMATION: '/confirmation',
  ABOUT: '/about',
  FAQ: '/FAQ',
  CONTACT: '/terms',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

export const PROTECTED_ROUTES = [
  ROUTES.ACCOUNT,
  ROUTES.SETTINGS,
  ROUTES.CHECKOUT,
  ROUTES.BOOKING,
];

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.MAKEUP,
  ROUTES.SKIN,
  ROUTES.HAIR,
  ROUTES.BLOG,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.ABOUT,
  ROUTES.CONTACT,
  ROUTES.PRIVACY,
  ROUTES.TERMS,
];