import type { CollectionEntry } from 'astro:content'
import { toBlob } from 'html-to-image'
import { useRef, useState } from 'react'

interface ContentShareProps {
  post: CollectionEntry<'blog'>['data']
  url?: string
}

export function ContentShare({ post, url }: Readonly<ContentShareProps>) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const currentUrl =
    url ||
    (globalThis.window === undefined ? '' : globalThis.window.location.href)

  // Get absolute URL for image
  const getAbsoluteUrl = (src: string) => {
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src
    }
    if (globalThis.window === undefined) return src
    const base = globalThis.window.location.origin
    return src.startsWith('/') ? `${base}${src}` : `${base}/${src}`
  }

  // Check if device is mobile
  const isMobile = () => {
    if (globalThis.window === undefined) return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  }

  // Generate image and return as blob
  const generateImage = async () => {
    if (!cardRef.current) return null

    setIsGenerating(true)
    try {
      // Wait for images to load
      const images = cardRef.current.getElementsByTagName('img')
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise((resolve) => {
            img.onload = resolve
            img.onerror = () => resolve(null) // Resolve even on error to not block
            // Add timeout to prevent hanging
            setTimeout(() => resolve(null), 5000)
          })
        }),
      )

      // Small delay to ensure rendering is complete
      await new Promise((resolve) => setTimeout(resolve, 200))

      const blob = await toBlob(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // Higher quality for social media
        width: 1080,
        height: 1920, // Instagram Story dimensions
        skipFonts: true, // Skip font loading to prevent issues
      })

      if (!blob) {
        throw new Error('Failed to generate image blob')
      }

      // Convert blob to data URL for download
      const dataUrl = URL.createObjectURL(blob)

      return { dataUrl, blob }
    } catch (error) {
      console.error('Failed to generate image:', error)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  // Download image helper
  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a')
    link.download = `${post.title.replaceAll(/[^a-z0-9]/gi, '-').toLowerCase()}-story.png`
    link.href = dataUrl
    link.click()

    // Cleanup object URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(dataUrl)
    }, 1000)
  }

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
    globalThis.window.open(facebookUrl, '_blank', 'width=600,height=400')
  }

  const shareToInstagram = async () => {
    const result = await generateImage()
    if (!result) return

    const { dataUrl, blob } = result
    const mobile = isMobile()

    if (mobile) {
      // Mobile: Try native share API first
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], 'story.png', { type: 'image/png' })
          const canShareFiles = navigator.canShare({ files: [file] })

          if (canShareFiles) {
            await navigator.share({
              files: [file],
              title: post.title,
              text: post.excerpt,
            })
            return
          }
        } catch (err) {
          // User cancelled or share failed, fall through to download
          console.log('Share cancelled or failed', err)
        }
      }

      // Fallback: Download and show instructions
      downloadImage(dataUrl)
      alert(
        'Image downloaded! To share on Instagram:\n\n' +
          '1. Open Instagram app\n' +
          '2. Tap + to create a Story\n' +
          '3. Select the downloaded image\n' +
          '4. Share it!',
      )
    } else {
      // Desktop: Download and guide user to mobile
      downloadImage(dataUrl)
      alert(
        'Image downloaded!\n\n' +
          'Instagram Stories can only be posted from mobile devices.\n\n' +
          'To share:\n' +
          '1. Transfer this image to your phone\n' +
          '2. Open Instagram app\n' +
          '3. Tap + to create a Story\n' +
          '4. Select the image and share!',
      )
    }
  }

  return (
    <div className="content-share">
      {/* Hidden card for image generation */}
      <div
        ref={cardRef}
        className="story-card"
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '1080px',
          height: '1920px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '80px 60px',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          opacity: '0',
          pointerEvents: 'none',
          zIndex: '-1',
          transform: 'scale(0.1)',
          transformOrigin: 'top left',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Featured Image */}
          {post.featuredImage && (
            <div
              style={{
                width: '100%',
                height: '600px',
                borderRadius: '24px',
                overflow: 'hidden',
                marginBottom: '40px',
              }}
            >
              <img
                src={getAbsoluteUrl(post.featuredImage.src)}
                alt={post.title}
                crossOrigin="anonymous"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          {/* Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                lineHeight: '1.2',
                marginBottom: '40px',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              {post.title}
            </h1>
            <p
              style={{
                fontSize: '36px',
                lineHeight: '1.6',
                opacity: 0.95,
                marginBottom: '60px',
              }}
            >
              {post.excerpt}
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '40px',
              }}
            >
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '12px 24px',
                    borderRadius: '999px',
                    fontSize: '28px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: '2px solid rgba(255, 255, 255, 0.3)',
              paddingTop: '30px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '28px', opacity: 0.9 }}>{post.date}</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
              blog.ninprd.com
            </div>
          </div>
        </div>
      </div>

      {/* Visible UI */}
      <div className="share-buttons flex gap-3 items-center">
        <button
          type="button"
          onClick={shareToFacebook}
          className="share-btn share-btn-facebook flex items-center gap-2 px-4 py-2 bg-[#1877f2] text-white rounded-lg hover:bg-[#166fe5] transition-colors"
          aria-label="Share to Facebook"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <title>Facebook Icon</title>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>

        <button
          type="button"
          onClick={shareToInstagram}
          disabled={isGenerating}
          className="share-btn share-btn-instagram flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          aria-label="Share to Instagram Story"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <title>Instagram Icon</title>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          {isGenerating ? 'Generating...' : 'Instagram Story'}
        </button>
      </div>
    </div>
  )
}
