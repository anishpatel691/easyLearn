import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import './index.css'
import LoginStatus from './Loginstatus.jsx'
import { UserProvider } from '../context/authContaxt.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
    <App />
    <LoginStatus/>
    </UserProvider>
  </StrictMode>,
)
