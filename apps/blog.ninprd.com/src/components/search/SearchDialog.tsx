import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@ninprd/ui/components/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@ninprd/ui/components/dialog'
import { Calendar, FileText, Search, Tag } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useKeyboardShortcut } from './useKeyboardShortcut'
import { useSearch } from './useSearch'

// Helper to strip HTML tags from string
function stripHtml(html: string): string {
  return html.replaceAll(/<[^>]*>/g, '')
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const { search, isLoading, error } = useSearch()

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  const results = query.trim() ? search(query).slice(0, 10) : []

  const handleSelect = (postId: string) => {
    onOpenChange(false)
    // Use setTimeout to ensure dialog closes before navigation
    setTimeout(() => {
      globalThis.location.href = `/blog/${postId}`
    }, 100)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden p-0 max-w-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Search Blog Posts</DialogTitle>
        <DialogDescription className="sr-only">
          Search for blog posts by title, content, or tags
        </DialogDescription>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search posts by title, content, or tags..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[400px]">
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading search index...
              </div>
            )}

            {error && (
              <div className="py-6 text-center text-sm text-destructive">
                Failed to load search data. Please try again.
              </div>
            )}

            {!isLoading && !error && (
              <>
                <CommandEmpty>
                  {query ? (
                    <div className="py-6">
                      <p className="text-sm text-muted-foreground">
                        No results found for "{query}"
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        Try a different search term
                      </p>
                    </div>
                  ) : (
                    <div className="py-6">
                      <p className="text-sm text-muted-foreground">
                        Start typing to search through blog posts
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        Use ↑↓ to navigate • Enter to select
                      </p>
                    </div>
                  )}
                </CommandEmpty>

                {results.length > 0 && (
                  <CommandGroup heading="Posts">
                    {results.map((result) => {
                      const { item } = result
                      // Create searchable value for cmdk
                      const searchValue = `${stripHtml(item.title)} ${stripHtml(item.excerpt)} ${item.tags.join(' ')}`
                      return (
                        <CommandItem
                          key={item.id}
                          value={searchValue}
                          onSelect={() => handleSelect(item.id)}
                          className="flex flex-col items-start gap-2 px-4 py-3"
                        >
                          <div className="flex items-start gap-2 w-full">
                            <FileText className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium line-clamp-1">
                                {stripHtml(item.title)}
                              </div>
                              <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {stripHtml(item.excerpt)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground w-full pl-6">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{item.date}</span>
                            </div>
                            {item.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                <span>{item.tags.slice(0, 2).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

interface SearchButtonProps {
  onClick: () => void
}

export function SearchButton({ onClick }: SearchButtonProps) {
  const handleClick = useCallback(() => {
    onClick()
  }, [onClick])

  // Keyboard shortcut: Cmd+K (Mac) or Ctrl+K (Windows/Linux)
  useKeyboardShortcut({
    key: 'k',
    metaKey: true,
    callback: handleClick,
  })

  useKeyboardShortcut({
    key: 'k',
    ctrlKey: true,
    callback: handleClick,
  })

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-muted/50 transition-colors"
      type="button"
      aria-label="Search"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline text-muted-foreground">Search</span>
      <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  )
}
