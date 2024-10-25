import React, { useState, useEffect } from 'react'

interface DebouncedInputProps {
  value: string
  onChange: (value: string) => void
  debounce?: number
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: DebouncedInputProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>): JSX.Element => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => {
      clearTimeout(timeout)
    }
  }, [value])

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
      }}
    />
  )
}

export default DebouncedInput
