/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useRouteError } from 'react-router-dom'
import React from 'react'

function ErrorPage(): JSX.Element {
  const error = useRouteError()
  console.error(error)

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>
          {(error as Error)?.message ||
            (error as { statusText?: string })?.statusText}
        </i>
      </p>
    </div>
  )
}

export default ErrorPage
