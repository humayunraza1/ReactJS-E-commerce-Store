import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthProvider';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GeneralProvider } from './context/GeneralProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <BrowserRouter>
    <GoogleOAuthProvider clientId="305776305367-lh141foi1uso17homkou4lq20cnkkc5g.apps.googleusercontent.com">
    <AuthProvider>
      <GeneralProvider>
      <Routes>
        <Route path="/*" element={<App />}/>
      </Routes>
      </GeneralProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
    </BrowserRouter>
);

