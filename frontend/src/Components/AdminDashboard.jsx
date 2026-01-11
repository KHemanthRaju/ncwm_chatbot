import React, { useState, useEffect } from "react";
import { Container, Button, Typography, Box, Card, Grid, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Description as DocumentIcon,
  Analytics as AnalyticsIcon,
  NotificationsActive as NotificationIcon,
  Chat as ChatIcon,
  SentimentVerySatisfied as HappyIcon,
  SentimentVeryDissatisfied as SadIcon,
  TrendingUp as TrendingIcon
} from "@mui/icons-material";
import axios from "axios";
import { DOCUMENTS_API } from "../utilities/constants";
import { getIdToken } from "../utilities/auth";
import MHFALogo from "../Assets/mhfa_logo.png";
import AccessibleColors from "../utilities/accessibleColors";

const ANALYTICS_API = `${DOCUMENTS_API}session-logs`;

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    sentiment: { positive: 0, neutral: 0, negative: 0 },
    avg_satisfaction: 0,
    user_count: 0,
    conversations: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();
      const { data } = await axios.get(ANALYTICS_API, {
        params: { timeframe: 'today' },
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics({
        sentiment: data.sentiment || { positive: 0, neutral: 0, negative: 0 },
        avg_satisfaction: data.avg_satisfaction || 0,
        user_count: data.user_count || 0,
        conversations: data.conversations || []
      });
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${AccessibleColors.primary.dark} 0%, ${AccessibleColors.primary.main} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
        <Box
          sx={{
            height: { xs: 50, sm: 60, md: 70 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: { xs: '0 auto 1.5rem', sm: '0 auto 2rem' },
            padding: { xs: 1, sm: 1.5, md: 2 },
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <img
            src={MHFALogo}
            alt="Mental Health First Aid Logo"
            style={{
              height: '100%',
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
            fontWeight: 700,
            color: AccessibleColors.text.inverse,
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          Learning Navigator
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
            color: AccessibleColors.text.inverse,
            fontWeight: 400,
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        >
          Admin Dashboard
        </Typography>
      </Box>

      <Container maxWidth="lg">
        {/* Real-Time Analytics Summary */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
              fontWeight: 600,
              color: AccessibleColors.text.inverse,
              mb: { xs: 1.5, sm: 2 },
              textAlign: 'center',
              fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.5rem' },
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            Today's Activity
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    p: { xs: 2, sm: 2.5, md: 3 },
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${AccessibleColors.status.success} 0%, #2E7D32 100%)`,
                    color: AccessibleColors.text.inverse,
                    boxShadow: `0 4px 12px ${AccessibleColors.status.success}4D`,
                  }}
                >
                  <HappyIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, mb: 1, color: '#ffffff' }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    {analytics.sentiment.positive}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' }, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                    Positive
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    p: { xs: 2, sm: 2.5, md: 3 },
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${AccessibleColors.status.error} 0%, #C62828 100%)`,
                    color: AccessibleColors.text.inverse,
                    boxShadow: `0 4px 12px ${AccessibleColors.status.error}4D`,
                  }}
                >
                  <SadIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, mb: 1, color: '#ffffff' }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    {analytics.sentiment.negative}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' }, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                    Negative
                  </Typography>
                </Card>
              </Grid>

            </Grid>
          )}
        </Box>

        {/* Action Cards */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              onClick={() => navigate("/admin-documents")}
              sx={{
                p: { xs: 2.5, sm: 3, md: 4 },
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'white',
                border: '3px solid transparent',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 24px ${AccessibleColors.secondary.main}4D`,
                  borderColor: AccessibleColors.secondary.main,
                },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: { xs: 50, sm: 55, md: 60 },
                    height: { xs: 50, sm: 55, md: 60 },
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${AccessibleColors.secondary.dark} 0%, ${AccessibleColors.secondary.main} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: { xs: '0 auto 1rem', sm: '0 auto 1.25rem', md: '0 auto 1.5rem' },
                  }}
                >
                  <DocumentIcon sx={{ color: AccessibleColors.text.inverse, fontSize: { xs: 26, sm: 28, md: 32 } }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    fontWeight: 600,
                    color: AccessibleColors.primary.light,
                    mb: 1,
                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                  }}
                >
                  Manage Documents
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    color: AccessibleColors.text.tertiary,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  }}
                >
                  Upload, edit, and organize knowledge base documents
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              onClick={() => navigate("/admin-analytics")}
              sx={{
                p: { xs: 2.5, sm: 3, md: 4 },
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'white',
                border: '3px solid transparent',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 24px ${AccessibleColors.status.info}4D`,
                  borderColor: AccessibleColors.status.info,
                },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: { xs: 50, sm: 55, md: 60 },
                    height: { xs: 50, sm: 55, md: 60 },
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${AccessibleColors.status.info} 0%, #0277BD 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: { xs: '0 auto 1rem', sm: '0 auto 1.25rem', md: '0 auto 1.5rem' },
                  }}
                >
                  <AnalyticsIcon sx={{ color: AccessibleColors.text.inverse, fontSize: { xs: 26, sm: 28, md: 32 } }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    fontWeight: 600,
                    color: AccessibleColors.primary.light,
                    mb: 1,
                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                  }}
                >
                  Analytics
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    color: AccessibleColors.text.tertiary,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  }}
                >
                  View usage statistics and user query insights
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              onClick={() => navigate("/admin-queries")}
              sx={{
                p: { xs: 2.5, sm: 3, md: 4 },
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'white',
                border: '3px solid transparent',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 24px ${AccessibleColors.secondary.main}4D`,
                  borderColor: AccessibleColors.secondary.main,
                },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: { xs: 50, sm: 55, md: 60 },
                    height: { xs: 50, sm: 55, md: 60 },
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #EA5E29 0%, #CB5223 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: { xs: '0 auto 1rem', sm: '0 auto 1.25rem', md: '0 auto 1.5rem' },
                  }}
                >
                  <NotificationIcon sx={{ color: AccessibleColors.text.inverse, fontSize: { xs: 26, sm: 28, md: 32 } }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    fontWeight: 600,
                    color: AccessibleColors.primary.light,
                    mb: 1,
                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                  }}
                >
                  Escalated Queries
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    color: AccessibleColors.text.tertiary,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  }}
                >
                  Review and respond to user queries requiring admin attention
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              onClick={() => navigate("/admin-conversations")}
              sx={{
                p: { xs: 2.5, sm: 3, md: 4 },
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'white',
                border: '3px solid transparent',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 24px ${AccessibleColors.status.info}4D`,
                  borderColor: AccessibleColors.status.info,
                },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: { xs: 50, sm: 55, md: 60 },
                    height: { xs: 50, sm: 55, md: 60 },
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${AccessibleColors.status.info} 0%, #0277BD 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: { xs: '0 auto 1rem', sm: '0 auto 1.25rem', md: '0 auto 1.5rem' },
                  }}
                >
                  <ChatIcon sx={{ color: AccessibleColors.text.inverse, fontSize: { xs: 26, sm: 28, md: 32 } }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    fontWeight: 600,
                    color: AccessibleColors.primary.light,
                    mb: 1,
                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                  }}
                >
                  Conversation Logs
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    color: AccessibleColors.text.tertiary,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  }}
                >
                  View conversations with sentiment analysis
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
              borderColor: AccessibleColors.text.inverse,
              color: AccessibleColors.text.inverse,
              borderWidth: '2px',
              '&:hover': {
                borderColor: AccessibleColors.secondary.light,
                backgroundColor: `${AccessibleColors.secondary.light}1A`,
                borderWidth: '2px',
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
