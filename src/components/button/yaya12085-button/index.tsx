import React from 'react'
import styles from './styles.module.css'

interface IYaya12085ButtonProps {
  /**
   * The text to display inside the button
   */
  text: string

  // click event
  onClick: () => void
}

const Yaya12085Button = (props: IYaya12085ButtonProps): JSX.Element => {
  return (
    <button className={styles.button} onClick={props.onClick}>
      {props.text}
    </button>
  )
}

export default Yaya12085Button
