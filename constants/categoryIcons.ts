/**
 * Predefined list of education-related icons for categories
 * These are Ionicons names that can be used with IconSymbol component
 */
export const EDUCATION_ICONS = [
  { name: 'laptop-outline', label: 'Computer / Technology' },
  { name: 'calculator-outline', label: 'Mathematics' },
  { name: 'flask-outline', label: 'Chemistry' },
  { name: 'nuclear-outline', label: 'Physics' },
  { name: 'book-outline', label: 'Literature / Reading' },
  { name: 'globe-outline', label: 'Languages' },
  { name: 'map-outline', label: 'Geography' },
  { name: 'time-outline', label: 'History' },
  { name: 'color-palette-outline', label: 'Arts' },
  { name: 'musical-notes-outline', label: 'Music' },
  { name: 'fitness-outline', label: 'Physical Education' },
  { name: 'leaf-outline', label: 'Biology' },
  { name: 'planet-outline', label: 'Astronomy' },
  { name: 'business-outline', label: 'Business / Economics' },
  { name: 'people-outline', label: 'Social Studies' },
  { name: 'medical-outline', label: 'Medicine / Health' },
  { name: 'construct-outline', label: 'Engineering' },
  { name: 'code-outline', label: 'Programming' },
  { name: 'stats-chart-outline', label: 'Statistics' },
  { name: 'school-outline', label: 'General Education' },
  { name: 'library-outline', label: 'Library / Research' },
  { name: 'pencil-outline', label: 'Writing' },
  { name: 'brush-outline', label: 'Drawing / Design' },
  { name: 'videocam-outline', label: 'Media / Film' },
  { name: 'newspaper-outline', label: 'Journalism' },
  { name: 'bulb-outline', label: 'Science' },
  { name: 'git-branch-outline', label: 'Philosophy' },
  { name: 'cube-outline', label: 'Geometry' },
  { name: 'flash-outline', label: 'Electronics' },
  { name: 'water-outline', label: 'Marine Science' },
] as const;

export type EducationIconName = typeof EDUCATION_ICONS[number]['name'];

/**
 * Get icon by name
 */
export const getIconByName = (name: string) => {
  return EDUCATION_ICONS.find(icon => icon.name === name);
};

/**
 * Get default icon (fallback)
 */
export const DEFAULT_CATEGORY_ICON = 'folder-outline';

