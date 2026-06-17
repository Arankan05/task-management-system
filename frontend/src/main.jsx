import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store'
import { setupSocket } from './services/socket'
import ErrorBoundary from './components/ErrorBoundary'
import BootScreen from './components/BootScreen'
import AppInitializer from './components/AppInitializer'
import ThemeApplier from './components/ThemeApplier'
import App from './App.jsx'
import './index.css'

setupSocket(store)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<BootScreen />} persistor={persistor}>
          <ThemeApplier />
          <AppInitializer>
            <App />
          </AppInitializer>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)
