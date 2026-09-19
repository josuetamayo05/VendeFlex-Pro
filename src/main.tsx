import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Registro de PWA de forma segura (solo si el navegador lo soporta)
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      const updateSW = registerSW({
        onNeedRefresh() {
          if (confirm('Hay una nueva versión de VendeFlex. ¿Actualizar ahora?')) {
            updateSW(true);
          }
        },
        onOfflineReady() {
          console.log('VendeFlex listo para usar sin conexión');
        },
      });
    })
    .catch((err) => {
      console.warn('PWA Service Worker no registrado en este entorno:', err);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);