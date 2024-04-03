import React from 'react'
interface ICatracoButtonButtonProps {
  /**
   * The text to display inside the button
   */
  text: string

  // click event
  onClick: () => void
}

const CatracoButton = (props: ICatracoButtonButtonProps): JSX.Element => {
  return (
    <button
      className="bg-gray-900 text-gray-400 border border-gray-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group"
      onClick={props.onClick}
    >
      <span className="bg-gray-400 shadow-gray-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
      {props.text}
    </button>
  )
}

export default CatracoButton
