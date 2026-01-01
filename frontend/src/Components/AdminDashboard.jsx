import React, { useState, useEffect } from "react";
import { Container, Button, Typography, Box, Card, Grid, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Description as DocumentIcon,
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  NotificationsActive as NotificationIcon,
  Chat as ChatIcon,
  SentimentVerySatisfied as HappyIcon,
  SentimentNeutral as NeutralIcon,
  SentimentVeryDissatisfied as SadIcon,
  TrendingUp as TrendingIcon
} from "@mui/icons-material";
import axios from "axios";
import { DOCUMENTS_API } from "../utilities/constants";
import { getIdToken } from "../utilities/auth";

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
        background: 'linear-gradient(135deg, #064F80 0%, #053E66 100%)',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
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

      <Container maxWidth="lg">
        {/* Real-Time Analytics Summary */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
              fontWeight: 600,
              color: '#ffffff',
              mb: 2,
              textAlign: 'center'
            }}
          >
            Today's Activity
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  }}
                >
                  <HappyIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {analytics.sentiment.positive}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Positive
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #FFC107 0%, #FFA000 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
                  }}
                >
                  <NeutralIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {analytics.sentiment.neutral}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Neutral
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                  }}
                >
                  <SadIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {analytics.sentiment.negative}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Negative
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #7FD3EE 0%, #4FB3D4 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(127, 211, 238, 0.3)',
                  }}
                >
                  <TrendingIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {analytics.avg_satisfaction}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Avg Score
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Action Cards */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
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

          <Grid item xs={12} md={3}>
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

          <Grid item xs={12} md={3}>
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

          <Grid item xs={12} md={3}>
            <Card
              onClick={() => navigate("/admin-conversations")}
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
                  <ChatIcon sx={{ color: 'white', fontSize: 32 }} />
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
                  Conversation Logs
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                    color: '#666',
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
