import React, { useState, useEffect } from "react";
import { Grid, Avatar, Typography, CircularProgress, Box, Chip } from "@mui/material";
import { Article as ArticleIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import BotAvatar from "../Assets/BotAvatar.svg";
import PdfIcon from "../Assets/pdf_logo.svg";

function BotFileCheckReply({ message, fileName, fileStatus, citations }) {
  const theme = useTheme();
  const messageAlignment = "flex-start";
  

  const [animationState, setAnimationState] = useState("checking");

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
  

  return (
    <Grid container direction="row" justifyContent={messageAlignment} alignItems="center">
      <Grid item>
        <Avatar alt="Bot Avatar" src={BotAvatar} sx={{ bgcolor: theme.palette.primary.main }} />
      </Grid>
      <Grid item style={{ background: theme.palette.background.botMessage, borderRadius: 20, padding: 12, marginLeft: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {fileStatus ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src={PdfIcon} alt="PDF Icon" style={{ width: 40, height: 40, borderRadius: "50%" }} />
              <Typography>{fileName}</Typography>
            </div>
            <div className={`file-status-box ${animationState}`}>
              <Typography>{animationState === "checking" ? "Checking file size..." : fileStatus}</Typography>
              {animationState === "checking" && <CircularProgress size={24} className="loading" />}
            </div>
            {animationState === "success" && <Typography style={{ marginTop: "4px", color: "green" }}>File uploaded successfully</Typography>}
            {animationState === "fail" && <Typography style={{ marginTop: "4px", color: "red" }}>{fileStatus}</Typography>}
          </div>
        ) : (
          <Box>
            <Typography>{message}</Typography>
            {citations && citations.length > 0 && (
              <Box mt={2} sx={{ borderTop: `1px solid ${theme.palette.divider}`, pt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main, display: 'block', mb: 0.5 }}>
                  Sources:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {citations.map((citation, idx) => (
                    citation.references && citation.references.map((ref, refIdx) => (
                      <Chip
                        key={`${idx}-${refIdx}`}
                        icon={<ArticleIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />}
                        label={ref.title || `Document ${idx + 1}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.7rem',
                          borderColor: theme.palette.primary.light,
                          color: theme.palette.primary.main,
                          fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.light + '20',
                          }
                        }}
                      />
                    ))
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Grid>
    </Grid>
  );
}

export default BotFileCheckReply;
