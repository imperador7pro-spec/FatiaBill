import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initSentry } from './sentry.js';
import { initAnalytics } from './analytics.js';
import { ToastProvider } from './toast.jsx';
import { registerServiceWorker } from './pwa.js';

initSentry();
initAnalytics();
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
