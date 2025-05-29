import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { NotesProvider } from './context/NotesContext.jsx'
import { SidebarProvider } from './components/Sidebar.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SidebarProvider>
        <NotesProvider>
          <App />
        </NotesProvider>
      </SidebarProvider>
    </BrowserRouter>
  </StrictMode>,
)
