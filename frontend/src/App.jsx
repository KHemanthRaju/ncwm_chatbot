import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LanguageProvider } from './utilities/LanguageContext';
import { TranscriptProvider } from './utilities/TranscriptContext';
import nationalCouncilTheme from './theme/nationalCouncilTheme';
import LandingPage from './Components/LandingPage';
import ChatBody from './Components/ChatBody';
import AdminLogin from './Components/AdminLogin';
import AdminMain from './Components/AdminMain';

function App() {
  return (
    <ThemeProvider theme={nationalCouncilTheme}>
      <CssBaseline />
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
    </ThemeProvider>
  );
}

export default App;
