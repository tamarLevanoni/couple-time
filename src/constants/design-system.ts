// Design System for Couple Time - Hebrew-focused

export const colors = {
  // Brand colors
  brand: {
    50: '#fef7f7',
    100: '#feeaea',
    200: '#fed8d8',
    300: '#fcb8b8',
    400: '#f88b8b',
    500: '#f15555', // Primary brand color
    600: '#dc3030',
    700: '#b82323',
    800: '#991f1f',
    900: '#821f1f',
    950: '#470d0d',
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

export const typography = {
  // Hebrew font families
  fontFamily: {
    hebrew: ['var(--font-heebo)', 'Heebo', 'David', 'system-ui', 'sans-serif'],
    body: ['var(--font-assistant)', 'Assistant', 'David', 'system-ui', 'sans-serif'],
    display: ['var(--font-heebo)', 'Heebo', 'David', 'system-ui', 'sans-serif'],
  },
  
  // Hebrew-optimized font sizes
  fontSize: {
    'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
    'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
    'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
    'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
    'xl': ['1.25rem', { lineHeight: '1.6', letterSpacing: '0' }],
    '2xl': ['1.5rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
    '3xl': ['1.875rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
    '4xl': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.03em' }],
    '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.04em' }],
    '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.05em' }],
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const spacing = {
  // RTL-friendly spacing scale
  0: '0',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
} as const;

export const animations = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  
  timing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Hebrew text constants
export const hebrewLabels = {
  // Common actions
  actions: {
    save: 'שמור',
    cancel: 'בטל',
    delete: 'מחק',
    edit: 'ערוך',
    add: 'הוסף',
    remove: 'הסר',
    search: 'חפש',
    filter: 'סנן',
    sort: 'מיין',
    submit: 'שלח',
    confirm: 'אשר',
    close: 'סגור',
    back: 'חזור',
    next: 'הבא',
    previous: 'הקודם',
    refresh: 'רענן',
    download: 'הורד',
    upload: 'העלה',
    print: 'הדפס',
    export: 'ייצא',
    import: 'ייבא',
  },
  
  // Status labels
  status: {
    active: 'פעיל',
    inactive: 'לא פעיל',
    pending: 'ממתין',
    approved: 'מאושר',
    rejected: 'נדחה',
    completed: 'הושלם',
    inProgress: 'בטיפול',
    available: 'זמין',
    borrowed: 'מושאל',
    unavailable: 'לא זמין',
    overdue: 'באיחור',
  },
  
  // Form labels
  form: {
    name: 'שם',
    email: 'אימייל',
    phone: 'טלפון',
    password: 'סיסמה',
    confirmPassword: 'אמת סיסמה',
    description: 'תיאור',
    notes: 'הערות',
    date: 'תאריך',
    time: 'שעה',
    address: 'כתובת',
    city: 'עיר',
    area: 'אזור',
  },
  
  // Navigation
  navigation: {
    home: 'בית',
    dashboard: 'לוח בקרה',
    profile: 'פרופיל',
    settings: 'הגדרות',
    logout: 'התנתק',
    login: 'התחבר',
    register: 'הרשם',
    games: 'משחקים',
    centers: 'מוקדים',
    rentals: 'השאלות',
    users: 'משתמשים',
    reports: 'דוחות',
  },
  
  // Messages
  messages: {
    success: 'הפעולה בוצעה בהצלחה',
    error: 'אירעה שגיאה',
    loading: 'טוען...',
    noData: 'אין נתונים להצגה',
    confirmDelete: 'האם אתה בטוח שברצונך למחוק?',
    unsavedChanges: 'יש שינויים שלא נשמרו',
    required: 'שדה חובה',
    invalid: 'נתון לא תקין',
  },
} as const;

// Component size variants
export const sizes = {
  xs: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.75rem',
    height: '2rem',
  },
  sm: {
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    height: '2.25rem',
  },
  md: {
    padding: '0.75rem 1.25rem',
    fontSize: '1rem',
    height: '2.5rem',
  },
  lg: {
    padding: '0.875rem 1.5rem',
    fontSize: '1.125rem',
    height: '3rem',
  },
  xl: {
    padding: '1rem 2rem',
    fontSize: '1.25rem',
    height: '3.5rem',
  },
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;