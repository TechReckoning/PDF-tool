import React, { createContext, useContext, ReactNode } from 'react'
import { PDFDocument } from 'pdf-lib'
import { PDFDocumentData } from '@/types'
import { useAppState } from '@/hooks/useAppState'

interface PDFContextType {
  // State
  documents: PDFDocumentData[]
  currentDoc: PDFDocumentData | null
  workingDoc: PDFDocument | null
  operationHistory: string[]
  isProcessing: boolean

  // Actions
  addDocument: (docData: PDFDocumentData) => void
  removeDocument: (docId: string) => void
  reorderDocuments: (newOrder: number[]) => void
  setCurrentDoc: (docData: PDFDocumentData | null) => void
  setWorkingDoc: (pdfDoc: PDFDocument | null) => void
  addOperation: (operationName: string) => void
  setIsProcessing: (processing: boolean) => void
  resetAll: () => void
}

const PDFContext = createContext<PDFContextType | undefined>(undefined)

interface PDFProviderProps {
  children: ReactNode
}

export function PDFProvider({ children }: PDFProviderProps) {
  const appState = useAppState()

  const contextValue: PDFContextType = {
    // State
    documents: appState.documents,
    currentDoc: appState.currentDoc,
    workingDoc: appState.workingDoc,
    operationHistory: appState.operationHistory,
    isProcessing: appState.isProcessing,

    // Actions
    addDocument: appState.addDocument,
    removeDocument: appState.removeDocument,
    reorderDocuments: appState.reorderDocuments,
    setCurrentDoc: appState.setCurrentDoc,
    setWorkingDoc: appState.setWorkingDoc,
    addOperation: appState.addOperation,
    setIsProcessing: appState.setIsProcessing,
    resetAll: appState.resetAll,
  }

  return (
    <PDFContext.Provider value={contextValue}>
      {children}
    </PDFContext.Provider>
  )
}

export function usePDFContext() {
  const context = useContext(PDFContext)
  if (context === undefined) {
    throw new Error('usePDFContext must be used within a PDFProvider')
  }
  return context
}
