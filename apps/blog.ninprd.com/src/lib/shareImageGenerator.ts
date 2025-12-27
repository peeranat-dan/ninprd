export interface ShareImageOptions {
  title: string
  backgroundImageUrl: string
  width?: number
  height?: number
}

interface TextLine {
  text: string
  x: number
  y: number
}

export class ShareImageGenerator {
  private backgroundImage: HTMLImageElement | null = null
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly canvasWidth: number = 1080
  private readonly canvasHeight: number = 1350
  private readonly maxTextWidth: number = 800
  private readonly baseFontSize: number = 80
  private readonly minFontSize: number = 40
  private readonly lineHeight: number = 1.2
  private readonly fontFamily: string =
    "'IBM Plex Sans Thai', 'IBM Plex Sans Thai Looped', 'Sora', sans-serif"

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.canvasWidth
    this.canvas.height = this.canvasHeight
    const context = this.canvas.getContext('2d')
    if (!context) {
      throw new Error('Failed to get 2D context from canvas')
    }
    this.ctx = context
  }

  /**
   * Load and cache the background image
   */
  async loadBackground(url: string): Promise<void> {
    if (this.backgroundImage) {
      return
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        this.backgroundImage = img
        resolve()
      }

      img.onerror = () => {
        reject(new Error('Failed to load background image'))
      }

      img.src = url
    })
  }

  /**
   * Measure text width with a given font size
   */
  private measureText(text: string, fontSize: number): number {
    this.ctx.font = `${fontSize}px ${this.fontFamily}`
    return this.ctx.measureText(text).width
  }

  /**
   * Split text into words and wrap them into lines
   */
  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    this.ctx.font = `${fontSize}px ${this.fontFamily}`

    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = this.ctx.measureText(testLine)

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  /**
   * Calculate the optimal font size that fits the text within constraints
   */
  private calculateOptimalFontSize(
    text: string,
    maxWidth: number,
    maxHeight: number,
  ): number {
    let fontSize = this.baseFontSize
    let lines: string[] = []

    // Try to find a font size that fits
    while (fontSize >= this.minFontSize) {
      lines = this.wrapText(text, maxWidth, fontSize)
      const totalHeight = lines.length * fontSize * this.lineHeight

      // Check if it fits within height constraint (max 4 lines as reasonable limit)
      if (totalHeight <= maxHeight && lines.length <= 4) {
        return fontSize
      }

      // Reduce font size and try again
      fontSize -= 5
    }

    // Return minimum font size if nothing fits
    return this.minFontSize
  }

  /**
   * Calculate text positions for centering
   */
  private calculateTextPositions(
    lines: string[],
    fontSize: number,
  ): TextLine[] {
    const lineHeightPx = fontSize * this.lineHeight
    const totalTextHeight = lines.length * lineHeightPx
    const startY = (this.canvasHeight - totalTextHeight) / 2 + fontSize

    return lines.map((text, index) => ({
      text,
      x: this.canvasWidth / 2,
      y: startY + index * lineHeightPx,
    }))
  }

  /**
   * Draw text with shadow for better readability
   */
  private drawText(textLines: TextLine[], fontSize: number): void {
    this.ctx.font = `bold ${fontSize}px ${this.fontFamily}`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'top'

    // Draw shadow first
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    this.ctx.shadowOffsetX = 2
    this.ctx.shadowOffsetY = 2
    this.ctx.shadowBlur = 4

    // Draw text
    this.ctx.fillStyle = '#FFFFFF'

    for (const line of textLines) {
      this.ctx.fillText(line.text, line.x, line.y)
    }

    // Reset shadow
    this.ctx.shadowColor = 'transparent'
    this.ctx.shadowOffsetX = 0
    this.ctx.shadowOffsetY = 0
    this.ctx.shadowBlur = 0
  }

  /**
   * Wait for fonts to be loaded
   */
  private async waitForFonts(): Promise<void> {
    if (typeof document === 'undefined' || !document.fonts) {
      return
    }

    try {
      // Wait for fonts to be ready
      await document.fonts.ready

      // Additionally, try to load specific fonts we need
      const fontFaces = [
        new FontFace('IBM Plex Sans Thai', 'local("IBM Plex Sans Thai")'),
        new FontFace(
          'IBM Plex Sans Thai Looped',
          'local("IBM Plex Sans Thai Looped")',
        ),
        new FontFace('Sora', 'local("Sora")'),
      ]

      await Promise.allSettled(
        fontFaces.map(async (fontFace) => {
          try {
            await fontFace.load()
          } catch {
            // Ignore individual font load failures
          }
        }),
      )
    } catch {
      // If font loading fails, continue anyway
      // The system will fall back to default fonts
    }
  }

  /**
   * Generate the share image
   */
  async generate(options: ShareImageOptions): Promise<Blob> {
    const { title, backgroundImageUrl } = options

    // Wait for fonts to load
    await this.waitForFonts()

    // Load background image if not already loaded
    await this.loadBackground(backgroundImageUrl)

    if (!this.backgroundImage) {
      throw new Error('Background image not loaded')
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

    // Draw background
    this.ctx.drawImage(
      this.backgroundImage,
      0,
      0,
      this.canvasWidth,
      this.canvasHeight,
    )

    // Calculate optimal font size and wrap text
    const maxHeight = 400 // Maximum height for text area
    const fontSize = this.calculateOptimalFontSize(
      title,
      this.maxTextWidth,
      maxHeight,
    )
    const lines = this.wrapText(title, this.maxTextWidth, fontSize)

    // Calculate text positions
    const textLines = this.calculateTextPositions(lines, fontSize)

    // Draw text
    this.drawText(textLines, fontSize)

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to generate image blob'))
          }
        },
        'image/png',
        0.95,
      )
    })
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.backgroundImage = null
  }
}
