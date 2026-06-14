import { Check, Laptop, Moon, Sun } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@ninprd/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ninprd/ui/components/dropdown-menu'

type ThemeChoice = 'light' | 'dark' | 'system'

const getStoredChoice = (): ThemeChoice => {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  }
  return 'system'
}

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeChoice>(getStoredChoice)

  const setThemeChoice = (choice: ThemeChoice) => {
    localStorage.setItem('theme', choice)
    window.__applyTheme()
    setTheme(choice)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {theme === 'system' ? (
            <Laptop className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setThemeChoice(option.value)}
            className="flex items-center justify-between gap-4"
          >
            {option.label}
            {theme === option.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
