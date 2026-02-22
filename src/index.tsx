import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './styles/responsive.css';
import App from './App';

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, reloading...');
    // Since autoUpdate is on, this might happen automatically or need reload
  },
  onOfflineReady() {
    console.log('App is ready for offline use.');
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
