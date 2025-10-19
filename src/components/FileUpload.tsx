import { memo, useCallback } from 'react'
import { FilePlus, Upload } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  multiple?: boolean
  className?: string
  disabled?: boolean
}

const FileUpload = memo(function FileUpload({ 
  onFileSelect, 
  accept = '.pdf', 
  multiple = false, 
  className,
  disabled = false
}: FileUploadProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (disabled) return
    
    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(f => f.type === 'application/pdf')
    if (pdfFile) {
      onFileSelect(pdfFile)
    }
  }, [onFileSelect, disabled])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      onFileSelect(files[0])
    }
  }, [onFileSelect])

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-muted/20 p-12 transition-colors hover:border-primary/50 hover:bg-muted/40",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload PDF file"
      aria-describedby="upload-description"
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="absolute inset-0 cursor-pointer opacity-0"
        id="pdf-upload"
        disabled={disabled}
        aria-hidden="true"
      />
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <FilePlus className="h-8 w-8 text-primary" weight="regular" />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium text-foreground">
          Trage PDF-ul aici sau apasă pentru a naviga
        </p>
        <p id="upload-description" className="text-xs text-muted-foreground">
          Suportă fișiere PDF până la 50MB
        </p>
      </div>
    </div>
  )
})

export { FileUpload }