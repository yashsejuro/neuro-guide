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
import { ThemeProvider, useTheme } from './hooks/useTheme'

const queryClient = new QueryClient()

function ThemedApp() {
  const { theme } = useTheme()
  return (
    <BlinkUIProvider theme="minimal" darkMode={theme}>
      <Toaster richColors theme={theme} />
      <App />
    </BlinkUIProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
