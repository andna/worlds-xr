import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { sendToVercelAnalytics } from './vitals';
import AppContextProvider from "./AppContextProvider";

ReactDOM.render(
  <React.StrictMode>
      <AppContextProvider>
        <App />
      </AppContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals(sendToVercelAnalytics);
