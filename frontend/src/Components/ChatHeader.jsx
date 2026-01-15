import React from "react";
import { Typography, Box, IconButton, Tooltip, Button, Select, MenuItem, FormControl } from "@mui/material";
import {
  Menu as MenuIcon,
  Language as LanguageIcon,
  School as InstructorIcon,
  Work as StaffIcon,
  Person as LearnerIcon,
} from "@mui/icons-material";
import { useLanguage } from "../utilities/LanguageContext";
import { TEXT } from "../utilities/constants";
import { useTheme } from "@mui/material/styles";
import MHFALogo from "../Assets/mhfa_logo.png";

function ChatHeader({ selectedLanguage, onMenuClick, onLanguageChange, userRole, onRoleChange }) {
  const { language: contextLanguage, setLanguage } = useLanguage();
  const language = selectedLanguage || contextLanguage || 'EN';
  const theme = useTheme();

  const handleLanguageToggle = () => {
    const newLanguage = language === 'EN' ? 'ES' : 'EN';
    setLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);

    // Reset the chat conversation when switching languages
    if (onLanguageChange) {
      onLanguageChange();
    }
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #064F80 0%, #053E66 100%)',
        py: { xs: 1.5, sm: 2, md: 2.5 },
        px: { xs: 1.5, sm: 2, md: 3 },
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
        <Box display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1, md: 2 }}>
          {/* Menu Button - Hidden on desktop when sidebar is visible */}
          <Tooltip title="Open Menu" arrow sx={{ display: { xs: 'inline-flex', lg: 'none' } }}>
            <IconButton
              onClick={onMenuClick}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: { xs: '6px', sm: '8px' },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <MenuIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          </Tooltip>

          {/* MHFA Logo */}
          <Box
            sx={{
              height: { xs: 35, sm: 40, md: 50 },
              display: 'flex',
              alignItems: 'center',
              padding: { xs: 0.5, sm: 0.75, md: 1 },
              background: 'white',
              borderRadius: '8px',
            }}
          >
            <img
              src={MHFALogo}
              alt="Mental Health First Aid Logo"
              style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
            />
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
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.5rem' },
              }}
            >
              {TEXT[language]?.CHAT_TITLE || "Learning Navigator"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.65rem', sm: '0.65rem', md: '0.75rem' },
                letterSpacing: '0.5px',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              AI-Powered Training Support
            </Typography>
          </Box>
        </Box>

        {/* Right side - Role Switcher, Language, Profile and Info buttons */}
        <Box display="flex" gap={{ xs: 0.5, sm: 0.75, md: 1 }} alignItems="center">
          {/* Role Switcher Dropdown */}
          {userRole && onRoleChange && (
            <Tooltip title="Switch Role" arrow>
              <FormControl size="small">
                <Select
                  value={userRole}
                  onChange={(e) => onRoleChange(e.target.value)}
                  sx={{
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    minWidth: { xs: '90px', sm: '110px' },
                    height: { xs: '28px', sm: '32px', md: '36px' },
                    '& .MuiSelect-select': {
                      padding: { xs: '4px 32px 4px 10px', sm: '5px 36px 5px 14px', md: '6px 40px 6px 16px' },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                  renderValue={(value) => (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {value === 'instructor' ? <InstructorIcon sx={{ fontSize: { xs: 14, sm: 16 } }} /> :
                       value === 'staff' ? <StaffIcon sx={{ fontSize: { xs: 14, sm: 16 } }} /> :
                       <LearnerIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                      <span style={{ textTransform: 'capitalize' }}>{value}</span>
                    </Box>
                  )}
                >
                  <MenuItem value="instructor">
                    <InstructorIcon sx={{ mr: 1, fontSize: 18, color: '#EA5E29' }} />
                    Instructor
                  </MenuItem>
                  <MenuItem value="staff">
                    <StaffIcon sx={{ mr: 1, fontSize: 18, color: '#064F80' }} />
                    Staff
                  </MenuItem>
                  <MenuItem value="learner">
                    <LearnerIcon sx={{ mr: 1, fontSize: 18, color: '#7FD3EE' }} />
                    Learner
                  </MenuItem>
                </Select>
              </FormControl>
            </Tooltip>
          )}

          {/* Language Toggle Button */}
          <Tooltip
            title={
              <Box sx={{ textAlign: 'center', p: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {language === 'EN' ? 'Cambiar a Español' : 'Switch to English'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#ffeb3b', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                  {language === 'EN'
                    ? '⚠️ La conversación actual se perderá'
                    : '⚠️ Current conversation will be lost'}
                </Typography>
              </Box>
            }
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: 'rgba(0, 0, 0, 0.9)',
                  '& .MuiTooltip-arrow': {
                    color: 'rgba(0, 0, 0, 0.9)',
                  },
                },
              },
            }}
          >
            <Button
              onClick={handleLanguageToggle}
              startIcon={<LanguageIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                padding: { xs: '4px 10px', sm: '5px 14px', md: '6px 16px' },
                textTransform: 'none',
                fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                minWidth: { xs: 'auto', sm: 'auto' },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              {language === 'EN' ? 'ES' : 'EN'}
            </Button>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}

export default ChatHeader;
