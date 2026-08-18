import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './index.css';

declare const __PWA__: boolean;

const container = document.getElementById('root');
if (container === null) {
  throw new Error('Elemento #root non trovato: impossibile montare Tessera.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/**
 * Registrazione del service worker per l'uso offline. Guardata a più livelli:
 * solo nella build multi-file (__PWA__), solo con l'API disponibile, e mai su
 * `file://` (dove i service worker non sono ammessi). Gli errori sono silenziati.
 */
if (__PWA__ && 'serviceWorker' in navigator && globalThis.location.protocol.startsWith('http')) {
  globalThis.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL;
    navigator.serviceWorker.register(`${base}sw.js`).catch(() => {
      /* offline non disponibile: l'app funziona comunque online */
    });
  });
}
