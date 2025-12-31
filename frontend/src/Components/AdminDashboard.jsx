import React from "react";
import { Container, Button, Typography, Box, Card, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Description as DocumentIcon,
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  NotificationsActive as NotificationIcon
} from "@mui/icons-material";

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: 'linear-gradient(135deg, #064F80 0%, #053E66 100%)',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: 'linear-gradient(135deg, #EA5E29 0%, #CB5223 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: '0 4px 12px rgba(234, 94, 41, 0.4)',
          }}
        >
          <PsychologyIcon sx={{ color: 'white', fontSize: 48 }} />
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
            fontWeight: 700,
            color: '#ffffff',
            mb: 1,
          }}
        >
          Learning Navigator
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 400,
          }}
        >
          Admin Dashboard
        </Typography>
      </Box>

      {/* Action Cards */}
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card
              onClick={() => navigate("/admin-documents")}
              sx={{
                p: 4,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'white',
                border: '3px solid transparent',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(234, 94, 41, 0.3)',
                  borderColor: '#EA5E29',
                },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #EA5E29 0%, #CB5223 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <DocumentIcon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    fontWeight: 600,
                    color: '#064F80',
                    mb: 1,
                  }}
                >
                  Manage Documents
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    color: '#666',
                  }}
                >
                  Upload, edit, and organize knowledge base documents
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              onClick={() => navigate("/admin-analytics")}
              sx={{
                p: 4,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'white',
                border: '3px solid transparent',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(127, 211, 238, 0.3)',
                  borderColor: '#7FD3EE',
                },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #7FD3EE 0%, #4FB3D4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <AnalyticsIcon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    fontWeight: 600,
                    color: '#064F80',
                    mb: 1,
                  }}
                >
                  Analytics
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    color: '#666',
                  }}
                >
                  View usage statistics and user query insights
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              onClick={() => navigate("/admin-queries")}
              sx={{
                p: 4,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'white',
                border: '3px solid transparent',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(234, 94, 41, 0.3)',
                  borderColor: '#EA5E29',
                },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #EA5E29 0%, #CB5223 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <NotificationIcon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    fontWeight: 600,
                    color: '#064F80',
                    mb: 1,
                  }}
                >
                  Escalated Queries
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    color: '#666',
                  }}
                >
                  Review and respond to user queries requiring admin attention
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Back to Chat Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/chat")}
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: '#EA5E29',
                backgroundColor: 'rgba(234, 94, 41, 0.1)',
              },
            }}
          >
            Back to Chat
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default AdminDashboard;
