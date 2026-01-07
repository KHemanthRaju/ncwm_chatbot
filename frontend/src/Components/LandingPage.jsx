import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Radio, RadioGroup, FormControlLabel, Stepper, Step, StepLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppHeader from './AppHeader';
import ChatHeader from './ChatHeader'; // Import ChatHeader
import RoleSelector from './RoleSelector';
import { useLanguage } from '../utilities/LanguageContext';
import { useCookies } from 'react-cookie';
import Grid from "@mui/material/Grid";
import { LANDING_PAGE_TEXT } from '../utilities/constants'; // Adjust the import path

const LandingPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [activeStep, setActiveStep] = useState(0);
  const { setLanguage } = useLanguage();
  const [, setCookie] = useCookies(['language']);
  const navigate = useNavigate();

  // Check if user already has language saved
  useEffect(() => {
    const storedLanguage = localStorage.getItem('preferredLanguage');
    if (storedLanguage) {
      setSelectedLanguage(storedLanguage);
    }
  }, []);

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const handleLanguageContinue = () => {
    setLanguage(selectedLanguage);
    setCookie('language', selectedLanguage, { path: '/' });
    localStorage.setItem('preferredLanguage', selectedLanguage);
    setActiveStep(1); // Move to role selection step
  };

  const handleRoleSelected = (role) => {
    console.log('Role selected on landing page:', role);
    // Don't store in localStorage - user will select role every time
    // Enable guest mode for chatbot users
    localStorage.setItem("guestMode", "true");
    // Navigate directly to chat and pass the role
    navigate('/chat', { state: { userRole: role } });
  };

  const texts = LANDING_PAGE_TEXT[selectedLanguage];

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <AppHeader showSwitch={false} />
      <Grid container direction="column" justifyContent="flex-start" alignItems="center" flex={1} p={2}>
        <Box mt={0} mb={4}>
          <ChatHeader selectedLanguage={selectedLanguage} />
        </Box>

        {/* Progress Stepper */}
        <Box sx={{ width: '100%', maxWidth: 600, mb: 4 }}>
          <Stepper activeStep={activeStep}>
            <Step>
              <StepLabel>Choose Language</StepLabel>
            </Step>
            <Step>
              <StepLabel>Select Your Role</StepLabel>
            </Step>
          </Stepper>
        </Box>

        {/* Step 0: Language Selection */}
        {activeStep === 0 && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
            <Typography variant="h5" gutterBottom>
              {texts.CHOOSE_LANGUAGE}
            </Typography>
            <RadioGroup value={selectedLanguage} onChange={handleLanguageChange}>
              <FormControlLabel value="EN" control={<Radio />} label={texts.ENGLISH} />
              <FormControlLabel value="ES" control={<Radio />} label={texts.SPANISH} />
            </RadioGroup>
            <Button variant="contained" onClick={handleLanguageContinue} sx={{ mt: 2 }}>
              {texts.SAVE_CONTINUE}
            </Button>
          </Box>
        )}

        {/* Step 1: Role Selection */}
        {activeStep === 1 && (
          <Box sx={{ width: '100%', maxWidth: 900 }}>
            <RoleSelector onRoleSelected={handleRoleSelected} skipLocalStorage={true} />
          </Box>
        )}
      </Grid>
    </Box>
  );
};

export default LandingPage;
