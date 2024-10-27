import React from 'react'
import styles from './styles.module.css'
import type ButtonProps from '../button-type'

const Yaya12085Button = (props: ButtonProps): JSX.Element => {
  return (
    <button className={styles.button} onClick={props.onClick}>
      {props.text}
    </button>
  )
}

export default Yaya12085Button
