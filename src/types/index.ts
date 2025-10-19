import { PDFDocument } from 'pdf-lib'

// Core PDF types
export interface PDFPageInfo {
  pageNumber: number
  thumbnail: string
  width: number
  height: number
}

export interface PDFDocumentData {
  id: string
  name: string
  file: File
  pdfDoc: PDFDocument
  pages: PDFPageInfo[]
  pageCount: number
  fileSize: number
}

export interface RedactionBox {
  pageIndex: number
  x: number
  y: number
  width: number
  height: number
}

// UI State types
export type ToolMode = 'view' | 'extract' | 'split' | 'redact' | 'reorder'

export interface UIState {
  mode: ToolMode
  selectedPages: Set<number>
  splitPoints: Set<number>
  redactions: RedactionBox[]
  currentPage: number
  pageOrder: number[]
  zoom: number
  isProcessing: boolean
  uploadProgress: number
}

export interface AppState {
  documents: PDFDocumentData[]
  currentDoc: PDFDocumentData | null
  workingDoc: PDFDocument | null
  operationHistory: string[]
}

// Action types for useReducer
export type AppAction =
  | { type: 'SET_DOCUMENTS'; payload: PDFDocumentData[] }
  | { type: 'SET_CURRENT_DOC'; payload: PDFDocumentData | null }
  | { type: 'SET_WORKING_DOC'; payload: PDFDocument | null }
  | { type: 'ADD_OPERATION'; payload: string }
  | { type: 'RESET_OPERATIONS' }
  | { type: 'RESET_ALL' }
  | { type: 'REMOVE_DOCUMENT'; payload: string }
  | { type: 'REORDER_DOCUMENTS'; payload: number[] }

export type UIAction =
  | { type: 'SET_MODE'; payload: ToolMode }
  | { type: 'TOGGLE_PAGE_SELECTION'; payload: number }
  | { type: 'TOGGLE_SPLIT_POINT'; payload: number }
  | { type: 'ADD_REDACTION'; payload: RedactionBox }
  | { type: 'REMOVE_REDACTION'; payload: number }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_PAGE_ORDER'; payload: number[] }
  | { type: 'MOVE_PAGE_UP'; payload: number }
  | { type: 'MOVE_PAGE_DOWN'; payload: number }
  | { type: 'DELETE_PAGE'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_UPLOAD_PROGRESS'; payload: number }
  | { type: 'CLEAR_SELECTIONS' }
  | { type: 'RESET_UI' }

// Error types
export class PDFError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'PDFError'
  }
}

export class ValidationError extends PDFError {
  constructor(message: string, originalError?: Error) {
    super(message, 'VALIDATION_ERROR', originalError)
    this.name = 'ValidationError'
  }
}

export class ProcessingError extends PDFError {
  constructor(message: string, originalError?: Error) {
    super(message, 'PROCESSING_ERROR', originalError)
    this.name = 'ProcessingError'
  }
}

// Component prop types
export interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  multiple?: boolean
  className?: string
  disabled?: boolean
}

export interface PDFPageGridProps {
  pages: PDFPageInfo[]
  selectedPages: Set<number>
  onPageSelect?: (pageIndex: number) => void
  selectable?: boolean
  splitPoints?: Set<number>
  onSplitPointToggle?: (pageIndex: number) => void
  redactionMode?: boolean
  onPageClick?: (pageIndex: number) => void
  currentPage?: number
  zoom?: number
}

export interface RedactionCanvasProps {
  pageIndex: number
  pageWidth: number
  pageHeight: number
  redactions: RedactionBox[]
  onRedactionAdd: (redaction: RedactionBox) => void
  onRedactionRemove: (index: number) => void
  thumbnail?: string
  className?: string
}

export interface PageReorderProps {
  pages: PDFPageInfo[]
  pageOrder: number[]
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onDeletePage: (index: number) => void
  zoom?: number
}

export interface ToolbarProps {
  mode: ToolMode
  onModeChange: (mode: ToolMode) => void
  onExtract: () => void
  onSplit: () => void
  onMerge: () => void
  onCompress: () => void
  onApplyRedactions: () => void
  onApplyReorder: () => void
  onDownload: () => void
  onReset: () => void
  onResetToOriginal: () => void
  onAddPDF: () => void
  selectedCount?: number
  splitPointCount?: number
  redactionCount?: number
  documentCount?: number
  hasDocument: boolean
  hasOperations?: boolean
  isProcessing?: boolean
  zoom?: number
  onZoomIn?: () => void
  onZoomOut?: () => void
}
