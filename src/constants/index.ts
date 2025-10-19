// File size limits
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
export const MAX_FILE_SIZE_MB = 50

// Zoom limits
export const MIN_ZOOM = 50
export const MAX_ZOOM = 200
export const ZOOM_STEP = 25

// Thumbnail settings
export const THUMBNAIL_SCALE = 1.5
export const THUMBNAIL_QUALITY = 0.95

// UI constants
export const UPLOAD_PROGRESS_STEP = 10
export const UPLOAD_PROGRESS_MAX = 90
export const UPLOAD_PROGRESS_FINAL = 100

// PDF processing settings
export const PDF_SAVE_OPTIONS = {
  useObjectStreams: true,
  addDefaultPage: false,
  objectsPerTick: 50
} as const

// Default page dimensions
export const DEFAULT_PAGE_WIDTH = 800
export const DEFAULT_PAGE_HEIGHT = 1100

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  PDF: 'application/pdf',
  PDF_EXTENSION: '.pdf'
} as const

// Error messages
export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: 'Tip de fișier invalid',
  INVALID_FILE_TYPE_DESC: 'Vă rugăm să selectați un fișier PDF',
  FILE_TOO_LARGE: 'Fișier prea mare',
  FILE_TOO_LARGE_DESC: `Vă rugăm să selectați un fișier PDF sub ${MAX_FILE_SIZE_MB}MB`,
  PDF_LOADING_ERROR: 'Eroare la încărcarea PDF',
  PDF_LOADING_ERROR_DESC: 'Vă rugăm să încercați un alt fișier',
  PDF_PROCESSING_ERROR: 'Eroare la procesarea PDF',
  NO_PAGES_SELECTED: 'Nu au fost selectate pagini',
  INVALID_PAGE_INDICES: 'Indici de pagini invalizi',
  CANNOT_DELETE_LAST_PAGE: 'Nu se poate șterge ultima pagină rămasă',
  NO_SPLIT_POINTS: 'Nu au fost furnizate puncte de împărțire',
  INVALID_SPLIT_POINTS: 'Puncte de împărțire invalide',
  NO_REDACTIONS: 'Nu au fost furnizate redacții',
  INVALID_REDACTION_DIMENSIONS: 'Dimensiuni de redactare invalide'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  PDF_LOADED: 'PDF încărcat cu succes',
  PDF_EXTRACTED: 'Paginile extrase cu succes',
  PDF_SPLIT: 'PDF împărțit cu succes',
  PDF_COMPRESSED: 'PDF comprimat',
  PDF_REDACTED: 'Redacțiile aplicate cu succes',
  PDF_REORDERED: 'Paginile reordonate cu succes',
  PDF_DOWNLOADED: 'PDF descărcat',
  WORKSPACE_CLEARED: 'Spațiul de lucru curățat',
} as const

// Toast durations
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 4000
} as const

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280
} as const

// Grid configurations
export const GRID_CONFIG = {
  REORDER_COLUMNS: {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 3
  }
} as const
