import { FileUpload } from '@/components/FileUpload'
import { PDFPageGrid } from '@/components/PDFPageGrid'
import { RedactionCanvas } from '@/components/RedactionCanvas'
import { PageReorder } from '@/components/PageReorder'
import { Toolbar } from '@/components/Toolbar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Toaster } from '@/components/ui/sonner'
import { File as FileIcon } from '@phosphor-icons/react'
import { PDFProvider, usePDFContext } from '@/contexts/PDFContext'
import { UIProvider, useUIContext } from '@/contexts/UIContext'
import { useFileUpload } from '@/hooks/useFileUpload'
import { usePDFOperationsWithContext } from '@/hooks/usePDFOperationsWithContext'
import { formatFileSize } from '@/lib/pdf-utils'
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP, DEFAULT_PAGE_WIDTH } from '@/constants'
import { ToolMode, RedactionBox } from '@/types'
import { toast } from 'sonner'
import { useCallback } from 'react'

function AppContent() {
  // App state management from context
  const appState = usePDFContext()
  
  // UI state management from context
  const uiState = useUIContext()
  
  // File upload hook
  const fileUpload = useFileUpload({
    onPDFLoaded: (docData) => {
      appState.addDocument(docData)
      uiState.initializePageOrder(docData.pageCount)
      uiState.resetUI(Array.from({ length: docData.pageCount }, (_, i) => i))
    }
  })
  
  // PDF operations
  const pdfOperations = usePDFOperationsWithContext()


  // PDF operations are now handled by context in individual components

  // Event handlers for components that still need them

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-card" role="banner">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">Editează, împarte și comprimă PDF-urile tale</p>
          </div>
          {appState.currentDoc && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-4 py-2">
                <FileIcon className="h-5 w-5 text-primary" weight="regular" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{appState.currentDoc.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {appState.currentDoc.pageCount} pagini • {formatFileSize(appState.currentDoc.fileSize)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto flex-1 space-y-6 px-6 py-6" role="main" aria-label="PDF Editor Main Content">
        {!appState.currentDoc ? (
          <div className="flex h-[calc(100vh-180px)] items-center justify-center">
            <FileUpload onFileSelect={fileUpload.handleFileSelect} className="w-full max-w-2xl" />
          </div>
        ) : (
          <>
                <Toolbar />

            {fileUpload.uploadProgress > 0 && fileUpload.uploadProgress < 100 && (
              <div className="space-y-2 rounded-lg border bg-card p-4" role="status" aria-live="polite">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processing PDF...</span>
                  <span className="font-medium" aria-label={`${fileUpload.uploadProgress} percent complete`}>
                    {fileUpload.uploadProgress}%
                  </span>
                </div>
                <Progress value={fileUpload.uploadProgress} aria-label="Upload progress" />
              </div>
            )}

            {uiState.mode === 'redact' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Desenează casete de redactare</h3>
                    <p className="text-sm text-muted-foreground">
                      Apasă și trage pentru a acoperi conținutul sensibil
                    </p>
                  </div>
                  {uiState.redactions.length > 0 && (
                    <Badge variant="secondary">{uiState.redactions.length} redaction{uiState.redactions.length !== 1 ? 's' : ''}</Badge>
                  )}
                </div>
                <Separator />
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="flex flex-col items-center gap-6 p-6">
                        {appState.currentDoc.pages.map((page, index) => {
                          const maxWidth = `${Math.round((DEFAULT_PAGE_WIDTH * uiState.zoom) / 100)}px`
                          return (
                            <div key={index} style={{ width: maxWidth }}>
                              <RedactionCanvas
                                pageIndex={index}
                                pageWidth={page.width}
                                pageHeight={page.height}
                                thumbnail={page.thumbnail}
                              />
                            </div>
                          )
                        })}
                  </div>
                </ScrollArea>
              </div>
            ) : uiState.mode === 'reorder' ? (
              <div className="space-y-4">
                <Separator />
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="p-6">
                    <PageReorder pages={appState.currentDoc.pages} />
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">
                      {uiState.mode === 'extract' && 'Selectează paginile de extras'}
                      {uiState.mode === 'split' && 'Alege unde să împărți'}
                      {uiState.mode === 'view' && 'Toate paginile'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {uiState.mode === 'extract' && 'Apasă pe pagini pentru a le selecta'}
                      {uiState.mode === 'split' && 'Apasă pe butoanele + dintre pagini pentru a adăuga puncte de împărțire'}
                      {uiState.mode === 'view' && 'Folosește bara de instrumente de mai sus pentru a edita PDF-ul'}
                    </p>
                  </div>
                </div>
                <Separator />
                    <div className="h-[calc(100vh-400px)]">
                      <PDFPageGrid pages={appState.currentDoc.pages} />
                    </div>
              </div>
            )}
          </>
        )}
      </main>
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <PDFProvider>
      <AppWithUI />
    </PDFProvider>
  )
}

function AppWithUI() {
  const { currentDoc } = usePDFContext()
  
  return (
    <UIProvider pageCount={currentDoc?.pageCount || 0}>
      <AppContent />
    </UIProvider>
  )
}

export default App