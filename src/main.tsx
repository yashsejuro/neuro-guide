import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BlinkUIProvider, Toaster } from '@blinkdotnew/ui'
import 'bootstrap/dist/css/bootstrap.min.css'
import './lib/chart-setup'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BlinkUIProvider theme="minimal" darkMode="system">
        <Toaster position="top-right" />
        <App />
      </BlinkUIProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
