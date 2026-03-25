import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BlinkUIProvider, Toaster } from '@blinkdotnew/ui'
import 'bootstrap/dist/css/bootstrap.min.css'
import './lib/chart-setup'
import App from './App'
import './index.css'
import './landing.css'
import './chat.css'
import './features.css'
import { ThemeProvider } from './hooks/useTheme'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BlinkUIProvider theme="minimal" darkMode="system">
          <Toaster richColors theme="dark" />
          <App />
        </BlinkUIProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
