/**
 * Rental process steps and related constants
 */

export const RENTAL_PROCESS_STEPS = [
  'בחרו משחק ומוקד',
  'שלחו בקשה (נדרשת הרשמה)',
  'הרכז יאשר ויתאם איסוף',
  'איסוף המשחק מהמוקד',
  'החזרה תוך שבוע'
] as const;

export const RENT_FORM_STORAGE_KEY = 'rent-form-state';
