export const ROUTES = {
  HOME: '/',
  GAMES: '/games',
  CENTERS: '/centers',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
} as const

export type Route = typeof ROUTES[keyof typeof ROUTES]