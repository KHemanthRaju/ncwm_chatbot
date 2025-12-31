import React from "react";
import { Typography, Container, Box } from "@mui/material";
import { useLanguage } from "../utilities/LanguageContext";
import { TEXT } from "../utilities/constants";
import { useTheme } from "@mui/material/styles";

function ChatHeader({ selectedLanguage }) {
  const { language: contextLanguage } = useLanguage();
  const language = selectedLanguage || contextLanguage || 'EN';
  const theme = useTheme();

  return (
    <Box
      sx={{
        background: theme.palette.background.header,
        py: 2,
        px: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle petal shape background */}
      <Box
        sx={{
          position: 'absolute',
          right: -40,
          top: -40,
          width: 120,
          height: 120,
          borderRadius: '50% 50% 0 50%',
          background: 'rgba(234, 94, 41, 0.1)',
          transform: 'rotate(45deg)',
        }}
      />

      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
            fontWeight: 600,
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: '0.5px',
          }}
        >
          {TEXT[language]?.CHAT_TITLE || "Learning Navigator"}
        </Typography>
      </Container>
    </Box>
  );
}

export default ChatHeader;
