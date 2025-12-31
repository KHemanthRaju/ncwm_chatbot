import React, { useState, useEffect } from "react";
import {
  Avatar,
  Typography,
  CircularProgress,
  Box,
  Chip,
  Paper,
  Fade,
  Link
} from "@mui/material";
import {
  Article as ArticleIcon,
  Psychology as PsychologyIcon,
  OpenInNew as OpenInNewIcon
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import BotAvatar from "../Assets/BotAvatar.svg";
import PdfIcon from "../Assets/pdf_logo.svg";

function BotFileCheckReply({ message, fileName, fileStatus, citations, isLoading }) {
  const theme = useTheme();
  const [animationState, setAnimationState] = useState("checking");
  const [dots, setDots] = useState("");

  // Function to convert URLs in text to clickable links
  const renderMessageWithLinks = (text) => {
    if (!text) return null;

    // Regular expression to match URLs
    // eslint-disable-next-line no-useless-escape
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <Link
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: theme.palette.primary.dark,
                borderBottomColor: theme.palette.primary.dark,
                backgroundColor: theme.palette.primary.main + '08',
              },
            }}
          >
            {part}
            <OpenInNewIcon sx={{ fontSize: '0.85rem' }} />
          </Link>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    let timeout;
    if (animationState === "checking") {
      if (fileStatus === "File page limit check succeeded.") {
        timeout = setTimeout(() => setAnimationState("success"), 1000);
      } else if (fileStatus === "File size limit exceeded." || fileStatus === "Network Error. Please try again later.") {
        timeout = setTimeout(() => setAnimationState("fail"), 1000);
      }
    }
    return () => clearTimeout(timeout);
  }, [animationState, fileStatus]);

  // Animated dots for loading state
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? "" : prev + ".");
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);


  // Loading state
  if (isLoading) {
    return (
      <Fade in={true} timeout={300}>
        <Box display="flex" alignItems="flex-start" mb={2}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: theme.palette.primary.main,
              mr: 1.5,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <PsychologyIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Paper
            elevation={2}
            sx={{
              backgroundColor: theme.palette.background.botMessage,
              px: 2.5,
              py: 1.5,
              borderRadius: '20px 20px 20px 4px',
              maxWidth: "70%",
              boxShadow: '0 2px 8px rgba(234, 94, 41, 0.1)',
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress
                size={20}
                sx={{ color: theme.palette.primary.main }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                  color: theme.palette.text.secondary,
                  fontStyle: 'italic',
                }}
              >
                Thinking{dots}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Fade>
    );
  }

  return (
    <Fade in={true} timeout={300}>
      <Box display="flex" alignItems="flex-start" mb={2}>
        <Avatar
          alt="Bot Avatar"
          src={BotAvatar}
          sx={{
            width: 40,
            height: 40,
            bgcolor: theme.palette.primary.main,
            mr: 1.5,
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        />
        <Paper
          elevation={2}
          sx={{
            backgroundColor: theme.palette.background.botMessage,
            px: 2.5,
            py: 1.5,
            borderRadius: '20px 20px 20px 4px',
            maxWidth: "70%",
            wordBreak: "break-word",
            boxShadow: '0 2px 8px rgba(234, 94, 41, 0.1)',
          }}
        >
          {fileStatus ? (
            <Box>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <img
                  src={PdfIcon}
                  alt="PDF Icon"
                  style={{ width: 36, height: 36, borderRadius: "50%" }}
                />
                <Typography
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {fileName}
                </Typography>
              </Box>
              <Box className={`file-status-box ${animationState}`}>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif' }}
                >
                  {animationState === "checking" ? "Checking file size..." : fileStatus}
                </Typography>
                {animationState === "checking" && (
                  <CircularProgress size={20} sx={{ ml: 1 }} />
                )}
              </Box>
              {animationState === "success" && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    color: theme.palette.success.main,
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                  }}
                >
                  File uploaded successfully
                </Typography>
              )}
              {animationState === "fail" && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    color: theme.palette.error.main,
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                  }}
                >
                  {fileStatus}
                </Typography>
              )}
            </Box>
          ) : (
            <Box>
              <Typography
                variant="body1"
                component="div"
                sx={{
                  fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: theme.palette.text.primary,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {renderMessageWithLinks(message)}
              </Typography>
              {citations && citations.length > 0 && (
                <Box
                  mt={2}
                  pt={1.5}
                  sx={{
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      display: 'block',
                      mb: 1,
                      fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    📚 Sources
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {citations.map((citation, idx) =>
                      citation.references && citation.references.map((ref, refIdx) => (
                        <Chip
                          key={`${idx}-${refIdx}`}
                          icon={<ArticleIcon fontSize="small" />}
                          label={ref.title || `Document ${idx + 1}`}
                          size="small"
                          variant="outlined"
                          clickable
                          onClick={() => {
                            if (ref.source) {
                              window.open(ref.source, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          sx={{
                            fontSize: '0.75rem',
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                            fontWeight: 500,
                            backgroundColor: theme.palette.primary.main + '08',
                            transition: 'all 0.2s ease',
                            cursor: ref.source ? 'pointer' : 'default',
                            '& .MuiChip-icon': {
                              color: theme.palette.primary.main,
                            },
                            '&:hover': {
                              backgroundColor: theme.palette.primary.main + '15',
                              borderColor: theme.palette.primary.dark,
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 8px rgba(234, 94, 41, 0.2)',
                            },
                          }}
                        />
                      ))
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Fade>
  );
}

export default BotFileCheckReply;
