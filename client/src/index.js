import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthProvider';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GeneralProvider } from './context/GeneralProvider';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <GeneralProvider>
      <Routes>
        <Route path="/*" element={<App />}/>
      </Routes>
      </GeneralProvider>
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

