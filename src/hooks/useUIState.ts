import { useReducer, useCallback } from 'react'
import { UIAction, UIState, ToolMode, RedactionBox } from '@/types'

const initialUIState: UIState = {
  mode: 'view',
  selectedPages: new Set(),
  splitPoints: new Set(),
  redactions: [],
  currentPage: 0,
  pageOrder: [],
  zoom: 100,
  isProcessing: false,
  uploadProgress: 0
}

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        selectedPages: new Set(),
        splitPoints: new Set(),
        currentPage: action.payload === 'redact' ? state.currentPage : 0
      }

    case 'TOGGLE_PAGE_SELECTION': {
      const newSet = new Set(state.selectedPages)
      if (newSet.has(action.payload)) {
        newSet.delete(action.payload)
      } else {
        newSet.add(action.payload)
      }
      return { ...state, selectedPages: newSet }
    }

    case 'TOGGLE_SPLIT_POINT': {
      const newSet = new Set(state.splitPoints)
      if (newSet.has(action.payload)) {
        newSet.delete(action.payload)
      } else {
        newSet.add(action.payload)
      }
      return { ...state, splitPoints: newSet }
    }

    case 'ADD_REDACTION':
      return { ...state, redactions: [...state.redactions, action.payload] }

    case 'REMOVE_REDACTION':
      return {
        ...state,
        redactions: state.redactions.filter((_, index) => index !== action.payload)
      }

    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload }

    case 'SET_PAGE_ORDER':
      return { ...state, pageOrder: action.payload }

    case 'MOVE_PAGE_UP': {
      if (action.payload === 0) return state
      
      const newOrder = [...state.pageOrder]
      const temp = newOrder[action.payload]
      newOrder[action.payload] = newOrder[action.payload - 1]
      newOrder[action.payload - 1] = temp
      return { ...state, pageOrder: newOrder }
    }

    case 'MOVE_PAGE_DOWN': {
      if (action.payload === state.pageOrder.length - 1) return state
      
      const newOrder = [...state.pageOrder]
      const temp = newOrder[action.payload]
      newOrder[action.payload] = newOrder[action.payload + 1]
      newOrder[action.payload + 1] = temp
      return { ...state, pageOrder: newOrder }
    }

    case 'DELETE_PAGE': {
      if (state.pageOrder.length <= 1) return state
      
      const newOrder = [...state.pageOrder]
      newOrder.splice(action.payload, 1)
      return { ...state, pageOrder: newOrder }
    }

    case 'SET_ZOOM':
      return { ...state, zoom: action.payload }

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload }

    case 'SET_UPLOAD_PROGRESS':
      return { ...state, uploadProgress: action.payload }

    case 'CLEAR_SELECTIONS':
      return {
        ...state,
        selectedPages: new Set(),
        splitPoints: new Set(),
        redactions: []
      }

    case 'RESET_UI':
      return {
        ...state,
        selectedPages: new Set(),
        splitPoints: new Set(),
        redactions: [],
        currentPage: 0,
        pageOrder: action.payload || [],
        mode: 'view'
      }

    default:
      return state
  }
}

export function useUIState(initialPageCount: number = 0) {
  const [state, dispatch] = useReducer(uiReducer, {
    ...initialUIState,
    pageOrder: Array.from({ length: initialPageCount }, (_, i) => i)
  })

  const setMode = useCallback((mode: ToolMode) => {
    dispatch({ type: 'SET_MODE', payload: mode })
  }, [])

  const togglePageSelection = useCallback((pageIndex: number) => {
    dispatch({ type: 'TOGGLE_PAGE_SELECTION', payload: pageIndex })
  }, [])

  const toggleSplitPoint = useCallback((pageIndex: number) => {
    dispatch({ type: 'TOGGLE_SPLIT_POINT', payload: pageIndex })
  }, [])

  const addRedaction = useCallback((redaction: RedactionBox) => {
    dispatch({ type: 'ADD_REDACTION', payload: redaction })
  }, [])

  const removeRedaction = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_REDACTION', payload: index })
  }, [])

  const setCurrentPage = useCallback((pageIndex: number) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: pageIndex })
  }, [])

  const movePageUp = useCallback((index: number) => {
    dispatch({ type: 'MOVE_PAGE_UP', payload: index })
  }, [])

  const movePageDown = useCallback((index: number) => {
    dispatch({ type: 'MOVE_PAGE_DOWN', payload: index })
  }, [])

  const deletePage = useCallback((displayIndex: number) => {
    dispatch({ type: 'DELETE_PAGE', payload: displayIndex })
  }, [])

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom })
  }, [])

  const setProcessing = useCallback((isProcessing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', payload: isProcessing })
  }, [])

  const setUploadProgress = useCallback((progress: number) => {
    dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress })
  }, [])

  const clearSelections = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTIONS' })
  }, [])

  const resetUI = useCallback((pageOrder?: number[]) => {
    dispatch({ type: 'RESET_UI', payload: pageOrder })
  }, [])

  const initializePageOrder = useCallback((pageCount: number) => {
    dispatch({ type: 'SET_PAGE_ORDER', payload: Array.from({ length: pageCount }, (_, i) => i) })
  }, [])

  return {
    ...state,
    setMode,
    togglePageSelection,
    toggleSplitPoint,
    addRedaction,
    removeRedaction,
    setCurrentPage,
    movePageUp,
    movePageDown,
    deletePage,
    setZoom,
    setProcessing,
    setUploadProgress,
    clearSelections,
    resetUI,
    initializePageOrder
  }
}
