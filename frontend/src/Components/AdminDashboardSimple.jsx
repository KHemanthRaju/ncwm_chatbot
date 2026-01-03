import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  SentimentVerySatisfied as HappyIcon,
  SentimentNeutral as NeutralIcon,
  SentimentVeryDissatisfied as SadIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import axios from "axios";
import { DOCUMENTS_API } from "../utilities/constants";
import { getIdToken } from "../utilities/auth";
import AdminAppHeader from "./AdminAppHeader";

const ANALYTICS_API = `${DOCUMENTS_API}session-logs`;

function AdminDashboardSimple() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    sentiment: { positive: 0, neutral: 0, negative: 0 },
    avg_satisfaction: 0,
    user_count: 0,
    conversations: []
  });
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 30 seconds for real-time data
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
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

  const toggleRow = (sessionId) => {
    setExpandedRows(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return '#4CAF50';
      case 'negative': return '#F44336';
      default: return '#FFC107';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return <HappyIcon />;
      case 'negative': return <SadIcon />;
      default: return <NeutralIcon />;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ position: "fixed", width: "100%", zIndex: 1200 }}>
        <AdminAppHeader showSwitch={false} />
      </Box>

      <Container maxWidth="xl" sx={{ pt: '100px', pb: 4 }}>
        {/* Page Title */}
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
            fontWeight: 700,
            color: '#064F80',
            mb: 4,
          }}
        >
          Admin Dashboard - Today's Activity
        </Typography>

        {/* Basic Analytics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* User Count */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #064F80 0%, #053E66 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(6, 79, 128, 0.3)',
              }}
            >
              <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {loading ? <CircularProgress size={30} sx={{ color: 'white' }} /> : analytics.user_count}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Total Users
              </Typography>
            </Card>
          </Grid>

          {/* Positive Sentiment */}
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
                {loading ? <CircularProgress size={30} sx={{ color: 'white' }} /> : analytics.sentiment.positive || 0}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Positive
              </Typography>
            </Card>
          </Grid>

          {/* Neutral Sentiment */}
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
                {loading ? <CircularProgress size={30} sx={{ color: 'white' }} /> : analytics.sentiment.neutral || 0}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Neutral
              </Typography>
            </Card>
          </Grid>

          {/* Negative Sentiment */}
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
                {loading ? <CircularProgress size={30} sx={{ color: 'white' }} /> : analytics.sentiment.negative || 0}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Negative
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Average Satisfaction Score */}
        <Card sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #7FD3EE 0%, #4FB3D4 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Average Satisfaction Score
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {loading ? <CircularProgress size={30} sx={{ color: 'white' }} /> : `${analytics.avg_satisfaction}/100`}
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Conversation Logs */}
        <Card sx={{ p: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
              fontWeight: 600,
              color: '#064F80',
              mb: 3,
            }}
          >
            Recent Conversations ({analytics.conversations.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : analytics.conversations.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: '#666' }}>
              No conversations yet today
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, background: '#f5f5f5' }}>Session ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, background: '#f5f5f5' }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 600, background: '#f5f5f5' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600, background: '#f5f5f5' }}>Sentiment</TableCell>
                    <TableCell sx={{ fontWeight: 600, background: '#f5f5f5' }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 600, background: '#f5f5f5' }}>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.conversations.map((conv, index) => (
                    <React.Fragment key={`${conv.session_id}-${index}`}>
                      <TableRow hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {conv.session_id?.substring(0, 8)}...
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {new Date(conv.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={conv.category || 'Unknown'}
                            size="small"
                            sx={{
                              background: '#7FD3EE',
                              color: 'white',
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getSentimentIcon(conv.sentiment)}
                            label={conv.sentiment || 'neutral'}
                            size="small"
                            sx={{
                              background: getSentimentColor(conv.sentiment),
                              color: 'white',
                              fontWeight: 500,
                              '& .MuiChip-icon': {
                                color: 'white'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {conv.satisfaction_score || 50}/100
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleRow(`${conv.session_id}-${index}`)}
                          >
                            {expandedRows[`${conv.session_id}-${index}`] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={6} sx={{ py: 0, borderBottom: expandedRows[`${conv.session_id}-${index}`] ? undefined : 'none' }}>
                          <Collapse in={expandedRows[`${conv.session_id}-${index}`]} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 2, px: 3, background: '#f9f9f9' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#064F80', mb: 1 }}>
                                Query:
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 2, color: '#333' }}>
                                {conv.query || 'No query text'}
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#064F80', mb: 1 }}>
                                Response:
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666', whiteSpace: 'pre-wrap' }}>
                                {conv.response || 'No response text'}
                              </Typography>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Container>
    </Box>
  );
}

export default AdminDashboardSimple;
