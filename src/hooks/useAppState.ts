import { useReducer, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import { AppAction, AppState, PDFDocumentData } from '@/types'

const initialAppState: AppState = {
  documents: [],
  currentDoc: null,
  workingDoc: null,
  operationHistory: []
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload }

    case 'SET_CURRENT_DOC':
      return { 
        ...state, 
        currentDoc: action.payload,
        workingDoc: action.payload?.pdfDoc || null
      }

    case 'SET_WORKING_DOC':
      return { ...state, workingDoc: action.payload }

    case 'ADD_OPERATION':
      return { ...state, operationHistory: [...state.operationHistory, action.payload] }

    case 'RESET_OPERATIONS':
      return { ...state, operationHistory: [] }

    case 'REMOVE_DOCUMENT': {
      const newDocuments = state.documents.filter(doc => doc.id !== action.payload)
      const newCurrentDoc = state.currentDoc?.id === action.payload 
        ? (newDocuments.length > 0 ? newDocuments[0] : null)
        : state.currentDoc
      return { 
        ...state, 
        documents: newDocuments,
        currentDoc: newCurrentDoc,
        workingDoc: newCurrentDoc?.pdfDoc || null
      }
    }

    case 'REORDER_DOCUMENTS': {
      const reorderedDocs = action.payload.map(index => state.documents[index])
      return { ...state, documents: reorderedDocs }
    }

    case 'RESET_ALL':
      return initialAppState

    default:
      return state
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialAppState)

  const addDocument = useCallback((docData: PDFDocumentData) => {
    dispatch({ type: 'SET_DOCUMENTS', payload: [...state.documents, docData] })
    dispatch({ type: 'SET_CURRENT_DOC', payload: docData })
  }, [state.documents])

  const setCurrentDoc = useCallback((docData: PDFDocumentData | null) => {
    dispatch({ type: 'SET_CURRENT_DOC', payload: docData })
  }, [])

  const setWorkingDoc = useCallback((pdfDoc: PDFDocument | null) => {
    dispatch({ type: 'SET_WORKING_DOC', payload: pdfDoc })
  }, [])

  const addOperation = useCallback((operation: string) => {
    dispatch({ type: 'ADD_OPERATION', payload: operation })
  }, [])

  const resetOperations = useCallback(() => {
    dispatch({ type: 'RESET_OPERATIONS' })
  }, [])

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' })
  }, [])

  const removeDocument = useCallback((docId: string) => {
    dispatch({ type: 'REMOVE_DOCUMENT', payload: docId })
  }, [])

  const reorderDocuments = useCallback((newOrder: number[]) => {
    dispatch({ type: 'REORDER_DOCUMENTS', payload: newOrder })
  }, [])


  return {
    ...state,
    addDocument,
    removeDocument,
    reorderDocuments,
    setCurrentDoc,
    setWorkingDoc,
    addOperation,
    resetOperations,
    resetAll
  }
}
