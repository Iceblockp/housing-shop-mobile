export const colors = {
  // Primary colors
  primary: '#34D399',
  // primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#93C5FD',

  // Secondary colors
  secondary: '#6366F1',
  secondaryDark: '#4F46E5',
  secondaryLight: '#A5B4FC',

  // Accent colors
  accent: '#F97316',
  accentDark: '#EA580C',
  accentLight: '#FDBA74',

  // Status colors
  success: '#10B981',
  successDark: '#059669',
  successLight: '#6EE7B7',

  warning: '#F59E0B',
  warningDark: '#D97706',
  warningLight: '#FCD34D',

  error: '#EF4444',
  errorDark: '#DC2626',
  errorLight: '#FCA5A5',

  // Neutral colors
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1E293B',
  // textLight: '#64748B',
  textLight: '#64748B',
  textDark: '#0F172A',
  border: '#E2E8F0',
  disabled: '#CBD5E1',

  gray: '#737373',
  lightGray: '#E5E7EB',
  white: '#fff', // Add this line with your desired light gray color
};

// Status colors mapping
export const statusColors = {
  PENDING: colors.warning,
  CONFIRMED: colors.primary,
  PROCESSING: colors.secondary,
  DELIVERING: colors.accent,
  COMPLETED: colors.success,
  CANCELLED: colors.error,
};
