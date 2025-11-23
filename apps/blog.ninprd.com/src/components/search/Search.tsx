import { useState } from 'react'
import { SearchButton, SearchDialog } from './SearchDialog'

export function Search() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <SearchButton onClick={() => setOpen(true)} />
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
