import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { AuthProvider } from './contexts/AuthContext.jsx';
import { FinanceProvider } from './contexts/FinanceContext.jsx';
import { SplitwiseProvider } from './contexts/SplitwiseContext.jsx';
import { DarkModeProvider } from './contexts/DarkModeContext.jsx'; // ✅ NEW

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DarkModeProvider> {/* ✅ Wrap at root */}
      <AuthProvider>
        <FinanceProvider>
          <SplitwiseProvider>
            <App />
          </SplitwiseProvider>
        </FinanceProvider>
      </AuthProvider>
    </DarkModeProvider>
  </React.StrictMode>
);
