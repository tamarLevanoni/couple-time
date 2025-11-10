import { GameCategory, TargetAudience, Area, Role } from '@/types';

/**
 * Get Hebrew label for game category
 * @param category - The game category enum value
 * @returns Hebrew translation of the category
 */
export function getCategoryLabel(category: GameCategory): string {
  const labels: Record<GameCategory, string> = {
    COMMUNICATION: 'תקשורת',
    INTIMACY: 'אינטימיות',
    FUN: 'כיף ובידור',
    THERAPY: 'טיפול',
    PERSONAL_DEVELOPMENT: 'פיתוח אישי'
  };
  return labels[category];
}

/**
 * Get Hebrew label for target audience
 * @param audience - The target audience enum value
 * @returns Hebrew translation of the audience
 */
export function getAudienceLabel(audience: TargetAudience): string {
  const labels: Record<TargetAudience, string> = {
    SINGLES: 'רווקים',
    MARRIED: 'נשואים',
    GENERAL: 'כללי'
  };
  return labels[audience];
}

/**
 * Get Hebrew label for area
 * @param area - The area enum value
 * @returns Hebrew translation of the area
 */
export function getAreaLabel(area: Area): string {
  const labels: Record<Area, string> = {
    NORTH: 'צפון',
    CENTER: 'מרכז',
    SOUTH: 'דרום',
    JERUSALEM: 'ירושלים והסביבה',
    JUDEA_SAMARIA: 'יו״שׁ'
  };
  return labels[area];
}

/**
 * Get Hebrew label for role
 * @param role - The role enum value
 * @returns Hebrew translation of the role
 */
export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    ADMIN: 'אדמין',
    SUPER_COORDINATOR: 'רכז על',
    CENTER_COORDINATOR: 'רכז מוקד'
  };
  return labels[role];
}
