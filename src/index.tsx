/**
 * Application entry point
 */

//import React from 'react';
import { RecoilRoot } from 'recoil';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Remove <React.StrictMode> just while testing API polling

/* root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); */

root.render(
    <RecoilRoot>
        <App />
    </RecoilRoot>
);
