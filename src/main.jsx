import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Register Service Worker for Complete Offline (PWA) Capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL || './';
    const swPath = base.endsWith('/') ? `${base}sw.js` : `${base}/sw.js`;
    navigator.serviceWorker.register(swPath).then((registration) => {
      console.log('Take-Your-Time ServiceWorker registered: ', registration.scope);
    }).catch((err) => {
      console.warn('Take-Your-Time ServiceWorker registration failed: ', err);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
