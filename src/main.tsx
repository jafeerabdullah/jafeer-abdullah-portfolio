import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/bebas-neue/latin-400.css'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-600.css'
import '@fontsource/dm-mono/latin-400.css'
import './styles.css'
import App from './App'

const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
const root = document.getElementById('root')!
if (root.dataset.prerendered === 'true') ReactDOM.hydrateRoot(root, app)
else ReactDOM.createRoot(root).render(app)
