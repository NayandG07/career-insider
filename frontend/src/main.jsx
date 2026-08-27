import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Extract OAuth tokens from URL if present before app initializes
const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('accessToken');
const refreshToken = urlParams.get('refreshToken');

if (accessToken && refreshToken) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  // Clean up the URL so tokens aren't left in the address bar and pathname is reset
  const hash = window.location.hash || '#dashboard';
  window.history.replaceState(null, '', `/${hash}`);
} else if (window.location.pathname.startsWith('/oauth/callback')) {
  const hash = window.location.hash || '#dashboard';
  window.history.replaceState(null, '', `/${hash}`);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
