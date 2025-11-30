/**
 * Predefined color palette for category icons
 * These are commonly used colors that work well with icons
 */
export const CATEGORY_COLORS = [
  { name: 'Blue', value: '#155DFC', label: 'Blue' },
  { name: 'Green', value: '#4CAF50', label: 'Green' },
  { name: 'Orange', value: '#FF9800', label: 'Orange' },
  { name: 'Purple', value: '#9C27B0', label: 'Purple' },
  { name: 'Red', value: '#F44336', label: 'Red' },
  { name: 'Pink', value: '#E91E63', label: 'Pink' },
  { name: 'Teal', value: '#009688', label: 'Teal' },
  { name: 'Cyan', value: '#00BCD4', label: 'Cyan' },
  { name: 'Indigo', value: '#3F51B5', label: 'Indigo' },
  { name: 'Brown', value: '#795548', label: 'Brown' },
  { name: 'Amber', value: '#FFC107', label: 'Amber' },
  { name: 'Deep Orange', value: '#FF5722', label: 'Deep Orange' },
  { name: 'Light Blue', value: '#03A9F4', label: 'Light Blue' },
  { name: 'Lime', value: '#CDDC39', label: 'Lime' },
  { name: 'Deep Purple', value: '#673AB7', label: 'Deep Purple' },
] as const;

export const DEFAULT_CATEGORY_COLOR = '#155DFC'; // Blue

/**
 * Get color by value
 */
export const getColorByValue = (value: string) => {
  return CATEGORY_COLORS.find(color => color.value === value);
};

