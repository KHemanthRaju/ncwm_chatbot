import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { LanguageProvider } from './utilities/LanguageContext';
import { TranscriptProvider } from './utilities/TranscriptContext';
import LandingPage from './Components/LandingPage';
import ChatBody from './Components/ChatBody';
import AdminLogin from './Components/AdminLogin';
import AdminMain from './Components/AdminMain';

function App() {
  return (
    <CookiesProvider>
      <LanguageProvider>
        <TranscriptProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/chat" element={<ChatBody />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminMain />} />
            </Routes>
          </Router>
        </TranscriptProvider>
      </LanguageProvider>
    </CookiesProvider>
  );
}

export default App;
