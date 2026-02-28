import { useEffect, useState } from 'react'

import { Button } from '@ninprd/ui/components/button'
import { cn } from '@ninprd/ui/lib/utils'

const STORAGE_KEY = 'cookie-consent'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function handleConsent(value: 'accepted' | 'rejected') {
    localStorage.setItem(STORAGE_KEY, value)
    if (value === 'accepted') {
      // @ts-expect-error - posthog is loaded via script tag and not typed in this project
      window.posthog?.opt_in_capturing()
    } else {
      // @ts-expect-error - posthog is loaded via script tag and not typed in this project
      window.posthog?.opt_out_capturing()
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <dialog
      open
      aria-label="Cookie consent"
      aria-describedby="cookie-consent-description"
      className={cn(
        'fixed bottom-4 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 rounded-lg bg-background p-4 shadow-lg overflow-hidden border',
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
      )}
    >
      <h2 className="text-sm font-semibold">Cookie Preferences</h2>
      <p
        id="cookie-consent-description"
        className="mt-1 text-sm text-muted-foreground"
      >
        We use cookies to improve your experience and analyze site traffic. You
        can accept or reject non-essential cookies.
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => handleConsent('accepted')}>
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleConsent('rejected')}
        >
          Reject
        </Button>
      </div>
    </dialog>
  )
}
