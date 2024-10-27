import React from 'react'
import styles from './styles.module.css'
import type ButtonProps from '../button-type'

const Button17 = (props: ButtonProps): JSX.Element => {
  return (
    <button
      className={`${styles['button-17']} ${props.tailwindStyles !== undefined ? props.tailwindStyles : ''}`}
      onClick={props.onClick}
      disabled={props.disabled ?? false}
    >
      {props.text}
    </button>
  )
}

export default Button17
