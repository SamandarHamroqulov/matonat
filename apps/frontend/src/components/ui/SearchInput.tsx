import { useEffect, useState } from 'react'
import Input from './Input'

interface SearchInputProps {
  value?: string
  placeholder?: string
  onSearch: (value: string) => void
}

function SearchInput({
  value = '',
  placeholder = 'Qidirish...',
  onSearch,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onSearch(inputValue.trim())
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [inputValue, onSearch])

  return (
    <div className="relative">
      <Input
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        className="pl-10 pr-10"
        placeholder={placeholder}
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </span>
      {inputValue ? (
        <button
          type="button"
          onClick={() => setInputValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-gray-400 transition hover:text-gray-700"
          aria-label="Qidiruvni tozalash"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}

export default SearchInput
