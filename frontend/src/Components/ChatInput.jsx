import React, { useState } from "react";
import { TextField, Grid, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useTheme } from "@mui/material/styles";
import { useLanguage } from "../utilities/LanguageContext";
import { TEXT } from "../utilities/constants";

function ChatInput({ onSendMessage, processing }) {
  const [message, setMessage] = useState("");
  const [helperText, setHelperText] = useState("");
  const { language } = useLanguage();
  const theme = useTheme();

  const handleTyping = (event) => {
    if (helperText) {
      setHelperText("");
    }
    setMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      onSendMessage(message);
      setMessage("");
    } else {
      setHelperText(TEXT[language].HELPER_TEXT);
    }
  };

  return (
    <Grid container item xs={12} alignItems="center" className="sendMessageContainer">
      <Grid item xs={11.5}>
        <TextField
          multiline
          maxRows={4}
          fullWidth
          placeholder={TEXT["EN"].CHAT_INPUT_PLACEHOLDER}
          id="USERCHATINPUT"
          value={message}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !processing) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          onChange={handleTyping}
          helperText={helperText}
          sx={{ "& fieldset": { border: "none" } }}
        />
      </Grid>
      <Grid item xs={0.5}>
        <IconButton
          aria-label="send"
          disabled={processing}
          onClick={handleSendMessage}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            boxShadow: '0 2px 8px rgba(234, 94, 41, 0.3)',
            "&:hover": {
              backgroundColor: '#CB5223',
              boxShadow: '0 4px 12px rgba(234, 94, 41, 0.4)',
            },
            "&:disabled": {
              backgroundColor: theme.palette.grey[300],
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}

export default ChatInput;
