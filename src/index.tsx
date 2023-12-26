import React from 'react';
import ReactDOM from 'react-dom/client';
import styles from './index.module.css';

const App = (): JSX.Element => {
  function test(): void {
    const a = 1;
    const b = a + 1;
    console.log('Hello');
  }

  return (
    <div onClick={test} className={styles.textColor}>
      Hello, world! Debug!!!!!!~~s
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLInputElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
