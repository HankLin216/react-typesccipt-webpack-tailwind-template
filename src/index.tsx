import React from 'react';
import ReactDOM from 'react-dom/client';

const App = (): JSX.Element => {
  function test(): void {
    const a = 1;
    const b = a + 1;
    console.log('Hello');
  }

  return <div onClick={test}>Hello, world! Debug!!!</div>;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLInputElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
