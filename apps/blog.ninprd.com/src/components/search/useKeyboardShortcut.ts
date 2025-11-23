import { useEffect } from 'react'

interface UseKeyboardShortcutOptions {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  callback: () => void
}

export function useKeyboardShortcut({
  key,
  ctrlKey = false,
  metaKey = false,
  shiftKey = false,
  callback,
}: UseKeyboardShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCorrectKey = event.key.toLowerCase() === key.toLowerCase()
      const isCorrectCtrl = ctrlKey ? event.ctrlKey : !event.ctrlKey
      const isCorrectMeta = metaKey ? event.metaKey : !event.metaKey
      const isCorrectShift = shiftKey ? event.shiftKey : !event.shiftKey

      if (isCorrectKey && isCorrectCtrl && isCorrectMeta && isCorrectShift) {
        event.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, ctrlKey, metaKey, shiftKey, callback])
}
