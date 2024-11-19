import type { HTMLProps } from 'react'

interface ButtonProps extends HTMLProps<HTMLInputElement> {
  text: string
  onClick: () => void
  className?: string
  disabled?: boolean
  tooltip?: string
}

export default ButtonProps
