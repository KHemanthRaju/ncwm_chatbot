import React from "react";
import { Typography, Box, IconButton, Tooltip, Button } from "@mui/material";
import {
  Info as InfoIcon,
  Psychology as PsychologyIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../utilities/LanguageContext";
import { TEXT } from "../utilities/constants";
import { RECOMMENDATIONS_TEXT } from "../utilities/recommendationsTranslations";
import { useTheme } from "@mui/material/styles";

function ChatHeader({ selectedLanguage, onMenuClick }) {
  const navigate = useNavigate();
  const { language: contextLanguage, setLanguage } = useLanguage();
  const language = selectedLanguage || contextLanguage || 'EN';
  const PROFILE_TEXT = RECOMMENDATIONS_TEXT[language] || RECOMMENDATIONS_TEXT.EN;
  const theme = useTheme();

  const handleLanguageToggle = () => {
    const newLanguage = language === 'EN' ? 'ES' : 'EN';
    setLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #064F80 0%, #053E66 100%)',
        py: 2.5,
        px: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: `3px solid ${theme.palette.primary.main}`,
      }}
    >
      {/* Decorative petal shapes */}
      <Box
        sx={{
          position: 'absolute',
          right: -30,
          top: -30,
          width: 100,
          height: 100,
          borderRadius: '50% 50% 0 50%',
          background: 'rgba(234, 94, 41, 0.15)',
          transform: 'rotate(45deg)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: -40,
          bottom: -40,
          width: 120,
          height: 120,
          borderRadius: '50% 50% 50% 0',
          background: 'rgba(127, 211, 238, 0.1)',
          transform: 'rotate(-15deg)',
        }}
      />

      <Box
        sx={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left side - Menu Button, Logo and Title */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Menu Button */}
          <Tooltip title="Open Menu" arrow>
            <IconButton
              onClick={onMenuClick}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EA5E29 0%, #CB5223 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(234, 94, 41, 0.4)',
            }}
          >
            <PsychologyIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.3px',
                lineHeight: 1.2,
              }}
            >
              {TEXT[language]?.CHAT_TITLE || "Learning Navigator"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
              }}
            >
              MHFA Learning Ecosystem
            </Typography>
          </Box>
        </Box>

        {/* Right side - Language, Profile and Info buttons */}
        <Box display="flex" gap={1} alignItems="center">
          {/* Language Toggle Button */}
          <Tooltip title={language === 'EN' ? "Cambiar a Español" : "Switch to English"} arrow>
            <Button
              onClick={handleLanguageToggle}
              startIcon={<LanguageIcon />}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                padding: '6px 16px',
                textTransform: 'none',
                fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              {language === 'EN' ? 'ES' : 'EN'}
            </Button>
          </Tooltip>

          <Tooltip title={PROFILE_TEXT.TOOLTIP_PROFILE || "My Profile"} arrow>
            <IconButton
              onClick={() => navigate('/profile')}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <PersonIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={PROFILE_TEXT.TOOLTIP_INFO || "About Learning Navigator"} arrow>
            <IconButton
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}

export default ChatHeader;
