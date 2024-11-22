import React from 'react'
import styles from './styles.module.css'
import type ButtonProps from '../button-type'

const Button17 = ({ className = '', ...props }: ButtonProps): JSX.Element => {
  return (
    <button
      className={`${styles['button-17']} ${className} hover:cursor-pointer`}
      onClick={props.onClick}
      disabled={props.disabled ?? false}
      title={props.tooltip ?? ''}
    >
      {props.text}
    </button>
  )
}

export default Button17
