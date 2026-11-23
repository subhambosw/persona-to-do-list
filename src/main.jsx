import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Register Service Worker for Complete Offline (PWA) Capability in production only
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // In development mode, actively unregister any service workers and clear caches
    // so Vite Hot Module Replacement (HMR) and fresh code load without blank screens
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
        console.log('Unregistered development ServiceWorker:', registration.scope);
      }
    });
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) caches.delete(name);
      });
    }
  } else {
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
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
