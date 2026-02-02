import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthProvider from './Components/Auth/AuthProvider.jsx'
import { PermissionProvider } from "./Components/Auth/PermissionProvider.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PermissionProvider>
        <App />
      </PermissionProvider>
    </AuthProvider>
  </StrictMode>,
)
