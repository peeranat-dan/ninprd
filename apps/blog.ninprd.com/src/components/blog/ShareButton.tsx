import { Button } from '@ninprd/ui/components/button'
import { Download, Loader2, Share2 } from 'lucide-react'
import { useState } from 'react'
import backgroundImage from '../../assets/blog-background.png'
import { ShareImageGenerator } from '../../lib/shareImageGenerator'

interface ShareButtonProps {
  title: string
  url?: string
}

export function ShareButton({ title, url }: Readonly<ShareButtonProps>) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if Web Share API with file sharing is supported
  const canShare =
    typeof navigator !== 'undefined' &&
    navigator.share !== undefined &&
    navigator.canShare !== undefined

  /**
   * Generate the share image blob
   */
  const generateImage = async (): Promise<Blob> => {
    const generator = new ShareImageGenerator()
    try {
      const blob = await generator.generate({
        title,
        backgroundImageUrl: backgroundImage.src,
      })
      return blob
    } finally {
      generator.dispose()
    }
  }

  /**
   * Handle share via Web Share API
   */
  const handleShare = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Generate the image
      const blob = await generateImage()

      // Create a file from the blob
      const file = new File([blob], 'blog-share.png', { type: 'image/png' })

      // Check if we can share files
      const canShareFiles = navigator.canShare?.({ files: [file] })

      if (!canShareFiles) {
        // Fallback to download if file sharing not supported
        handleDownload()
        return
      }

      // Share using Web Share API
      await navigator.share({
        files: [file],
        title: title,
        ...(url && { url }),
      })
    } catch (err) {
      // User cancelled the share
      if (err instanceof Error && err.name === 'AbortError') {
        // Silently ignore user cancellation
        return
      }

      // Other errors
      console.error('Share failed:', err)
      setError('Unable to share. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Handle download fallback for browsers without share support
   */
  const handleDownload = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Generate the image
      const blob = await generateImage()

      // Create a download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title.slice(0, 50).replaceAll(/[^a-z0-9]/gi, '-')}-share.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the URL
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch (err) {
      console.error('Download failed:', err)
      setError('Unable to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="outline"
        onClick={canShare ? handleShare : handleDownload}
        disabled={isGenerating}
        className="min-h-[44px] min-w-[44px]"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : canShare ? (
          <>
            <Share2 className="mr-2 h-4 w-4" />
            Share to Social
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download Share Image
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
