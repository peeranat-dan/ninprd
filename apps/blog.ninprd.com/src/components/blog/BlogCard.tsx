import type { CollectionEntry } from 'astro:content'
import { forwardRef } from 'react'

interface BlogCardProps {
  post: CollectionEntry<'blog'>['data']
  getAbsoluteUrl: (src: string) => string
}

export const BlogCard = forwardRef<HTMLDivElement, BlogCardProps>(
  ({ post, getAbsoluteUrl }, ref) => {
    return (
      <div
        ref={ref}
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
    )
  },
)

BlogCard.displayName = 'BlogCard'
