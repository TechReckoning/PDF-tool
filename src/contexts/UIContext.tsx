import React, { createContext, useContext, ReactNode } from 'react'
import { ToolMode, RedactionBox } from '@/types'
import { useUIState } from '@/hooks/useUIState'

interface UIContextType {
  // State
  selectedPages: Set<number>
  splitPoints: Set<number>
  redactions: RedactionBox[]
  currentPage: number
  pageOrder: number[]
  mode: ToolMode
  zoom: number

  // Actions
  setMode: (mode: ToolMode) => void
  togglePageSelection: (pageIndex: number) => void
  toggleSplitPoint: (pageIndex: number) => void
  addRedaction: (redaction: RedactionBox) => void
  removeRedaction: (index: number) => void
  setCurrentPage: (pageIndex: number) => void
  setPageOrder: (order: number[]) => void
  movePageUp: (index: number) => void
  movePageDown: (index: number) => void
  deletePage: (index: number) => void
  setZoom: (zoom: number) => void
  clearSelections: () => void
  initializePageOrder: (count: number) => void
  resetUI: (initialOrder: number[]) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

interface UIProviderProps {
  children: ReactNode
  pageCount: number
}

export function UIProvider({ children, pageCount }: UIProviderProps) {
  const uiState = useUIState(pageCount)

  const contextValue: UIContextType = {
    // State
    selectedPages: uiState.selectedPages,
    splitPoints: uiState.splitPoints,
    redactions: uiState.redactions,
    currentPage: uiState.currentPage,
    pageOrder: uiState.pageOrder,
    mode: uiState.mode,
    zoom: uiState.zoom,

    // Actions
    setMode: uiState.setMode,
    togglePageSelection: uiState.togglePageSelection,
    toggleSplitPoint: uiState.toggleSplitPoint,
    addRedaction: uiState.addRedaction,
    removeRedaction: uiState.removeRedaction,
    setCurrentPage: uiState.setCurrentPage,
    setPageOrder: uiState.setPageOrder,
    movePageUp: uiState.movePageUp,
    movePageDown: uiState.movePageDown,
    deletePage: uiState.deletePage,
    setZoom: uiState.setZoom,
    clearSelections: uiState.clearSelections,
    initializePageOrder: uiState.initializePageOrder,
    resetUI: uiState.resetUI,
  }

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  )
}

export function useUIContext() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error('useUIContext must be used within a UIProvider')
  }
  return context
}
