import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary'
import { PageErrorFallback } from './components/common/ErrorFallback'
import { MensajeProvider, AuthProvider } from './contexts'
import './styles/colegio.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ErrorBoundary global: captura cualquier error no manejado */}
    <ErrorBoundary FallbackComponent={PageErrorFallback}>
      {/* AuthProvider: maneja el estado de autenticación */}
      <AuthProvider>
        {/* MensajeProvider: maneja notificaciones en toda la app */}
        <MensajeProvider>
          <App />
        </MensajeProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
