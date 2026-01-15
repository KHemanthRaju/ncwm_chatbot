import React, { useState, useRef, useEffect } from "react";
import { TextField, Box, IconButton, CircularProgress, Tooltip } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { useTheme } from "@mui/material/styles";

function ChatInput({ onSendMessage, processing, message, setMessage }) {
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const theme = useTheme();
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Auto-focus on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [setMessage]);

  const handleTyping = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (message?.trim() !== "" && !processing) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: { xs: 1, sm: 1.5 },
        position: 'relative',
      }}
    >
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          backgroundColor: theme.palette.background.paper,
          borderRadius: { xs: '20px', sm: '24px' },
          border: `2px solid ${isFocused ? theme.palette.primary.main : theme.palette.divider}`,
          transition: 'all 0.3s ease',
          boxShadow: isFocused ? '0 4px 12px rgba(234, 94, 41, 0.15)' : '0 2px 6px rgba(0,0,0,0.08)',
          '&:hover': {
            borderColor: theme.palette.primary.light,
            boxShadow: '0 4px 12px rgba(234, 94, 41, 0.12)',
          },
        }}
      >
        <TextField
          inputRef={inputRef}
          multiline
          maxRows={4}
          fullWidth
          placeholder={!processing ? "Type your message here... (Press Enter to send, Shift+Enter for new line)" : "Processing..."}
          id="USERCHATINPUT"
          value={message || ""}
          disabled={processing}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !processing) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          onChange={handleTyping}
          sx={{
            "& .MuiOutlinedInput-root": {
              padding: { xs: "10px 14px", sm: "12px 18px", md: "14px 20px" },
              fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
              "& fieldset": {
                border: "none",
              },
            },
            "& .MuiInputBase-input": {
              "&::placeholder": {
                color: theme.palette.text.secondary,
                opacity: 0.7,
                fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' },
              },
            },
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: theme.palette.text.disabled,
            },
          }}
        />
      </Box>

      {/* Speech Recognition Button */}
      {speechSupported && (
        <Tooltip title={isListening ? "Stop recording" : "Voice input"} arrow>
          <IconButton
            aria-label="voice input"
            disabled={processing}
            onClick={toggleSpeechRecognition}
            sx={{
              backgroundColor: isListening ? '#EF4444' : theme.palette.secondary.main,
              color: "white",
              width: { xs: "44px", sm: "48px", md: "52px" },
              height: { xs: "44px", sm: "48px", md: "52px" },
              borderRadius: "50%",
              boxShadow: isListening
                ? '0 4px 12px rgba(239, 68, 68, 0.4)'
                : '0 4px 12px rgba(6, 79, 128, 0.3)',
              transition: 'all 0.3s ease',
              animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
              "@keyframes pulse": {
                "0%, 100%": {
                  transform: 'scale(1)',
                  opacity: 1,
                },
                "50%": {
                  transform: 'scale(1.05)',
                  opacity: 0.8,
                },
              },
              "&:hover": {
                backgroundColor: isListening ? '#DC2626' : '#053E66',
                boxShadow: isListening
                  ? '0 6px 16px rgba(239, 68, 68, 0.5)'
                  : '0 6px 16px rgba(6, 79, 128, 0.4)',
                transform: 'scale(1.05)',
              },
              "&:active": {
                transform: 'scale(0.95)',
              },
              "&:disabled": {
                backgroundColor: theme.palette.grey[300],
                color: theme.palette.grey[500],
                boxShadow: 'none',
              },
            }}
          >
            {isListening ? (
              <MicOffIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
            ) : (
              <MicIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
            )}
          </IconButton>
        </Tooltip>
      )}

      <IconButton
        aria-label="send"
        disabled={processing || !message?.trim()}
        onClick={handleSendMessage}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: "white",
          width: { xs: "44px", sm: "48px", md: "52px" },
          height: { xs: "44px", sm: "48px", md: "52px" },
          borderRadius: "50%",
          boxShadow: '0 4px 12px rgba(234, 94, 41, 0.3)',
          transition: 'all 0.3s ease',
          "&:hover": {
            backgroundColor: '#CB5223',
            boxShadow: '0 6px 16px rgba(234, 94, 41, 0.4)',
            transform: 'scale(1.05)',
          },
          "&:active": {
            transform: 'scale(0.95)',
          },
          "&:disabled": {
            backgroundColor: theme.palette.grey[300],
            color: theme.palette.grey[500],
            boxShadow: 'none',
          },
        }}
      >
        {processing ? (
          <CircularProgress size={{ xs: 20, sm: 22, md: 24 }} sx={{ color: 'white' }} />
        ) : (
          <SendIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
        )}
      </IconButton>
    </Box>
  );
}

export default ChatInput;
