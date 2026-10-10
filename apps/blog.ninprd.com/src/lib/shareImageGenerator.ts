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
  // Thai tone marks and vowels stack above and below, so it needs more room than Latin.
  private readonly lineHeight: number = 1.4
  private readonly fontWeight: number = 700
  // Astro renames fonts to hashed families (e.g. "Sora-22acff5dc4e5d4bd"), so a
  // literal "Sora" never matches. Resolved from Astro's CSS variables at generate time.
  private fontFamily = '"Sora", "IBM Plex Sans Thai", sans-serif'

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

  private fontString(fontSize: number): string {
    return `${this.fontWeight} ${fontSize}px ${this.fontFamily}`
  }

  /**
   * Split into wrappable chunks that keep their trailing spaces. Thai has no
   * spaces between words, so a plain split(' ') would never wrap it.
   */
  private segment(text: string): string[] {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const segmenter = new Intl.Segmenter('th', { granularity: 'word' })
      return Array.from(segmenter.segment(text), (part) => part.segment)
    }
    return text.split(/(?<= )/)
  }

  /**
   * Split text into words and wrap them into lines
   */
  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    this.ctx.font = this.fontString(fontSize)

    const words = this.segment(text)
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine + word
      const metrics = this.ctx.measureText(testLine)

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine.trim())
        currentLine = word.trimStart()
      } else {
        currentLine = testLine
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim())
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
    this.ctx.font = this.fontString(fontSize)
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
   * Load the exact weight and glyph subsets the canvas will draw. Canvas does not
   * trigger @font-face downloads on its own, and the Thai subset is split by
   * unicode-range, so pass the real text or the fallback font gets drawn.
   */
  private async waitForFonts(text: string): Promise<void> {
    if (typeof document === 'undefined' || !document.fonts) {
      return
    }

    // Same order as --font-sans in globals.css. That one is `@theme inline`, so it
    // is not a real custom property; read Astro's variables instead.
    const root = getComputedStyle(document.documentElement)
    const stack = ['--font-sora', '--font-ibm-plex-sans-thai']
      .map((name) => root.getPropertyValue(name).trim())
      .filter(Boolean)
    if (stack.length > 0) this.fontFamily = `${stack.join(', ')}, sans-serif`

    const font = this.fontString(this.baseFontSize)
    try {
      await Promise.all([
        document.fonts.load(font, text),
        document.fonts.load(font, 'Abc'),
      ])
      await document.fonts.ready
    } catch {
      // Fall back to the next font in the stack.
    }
  }

  /**
   * Generate the share image
   */
  async generate(options: ShareImageOptions): Promise<Blob> {
    const { title, backgroundImageUrl } = options

    // Wait for fonts to load
    await this.waitForFonts(title)

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
