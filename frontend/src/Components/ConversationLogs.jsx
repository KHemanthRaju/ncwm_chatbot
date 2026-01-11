import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  Grid,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  SentimentVerySatisfied as HappyIcon,
  SentimentNeutral as NeutralIcon,
  SentimentVeryDissatisfied as SadIcon,
} from "@mui/icons-material";
import axios from "axios";
import AdminAppHeader from "./AdminAppHeader";
import { DOCUMENTS_API } from "../utilities/constants";
import { getIdToken } from "../utilities/auth";
import AccessibleColors from "../utilities/accessibleColors";

const ANALYTICS_API = `${DOCUMENTS_API}session-logs`;

const sentimentColors = {
  positive: "#4CAF50",
  neutral: "#FFC107",
  negative: "#F44336",
};

const sentimentIcons = {
  positive: <HappyIcon />,
  neutral: <NeutralIcon />,
  negative: <SadIcon />,
};

function ConversationLogs() {
  const [timeframe, setTimeframe] = useState("today");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedConv, setSelectedConv] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sentiment, setSentiment] = useState({});

  useEffect(() => {
    fetchConversations();
  }, [timeframe]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError("");
      const token = await getIdToken();
      const { data } = await axios.get(ANALYTICS_API, {
        params: { timeframe },
        headers: { Authorization: `Bearer ${token}` },
      });

      setConversations(data.conversations || []);
      setSentiment(data.sentiment || {});
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setError("Failed to load conversation logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (conv) => {
    setSelectedConv(conv);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedConv(null);
  };

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  // Helper function to normalize sentiment value
  const normalizeSentiment = (sentiment) => {
    if (!sentiment) return 'neutral';
    return sentiment.toLowerCase();
  };

  // Helper function to get sentiment color
  const getSentimentColor = (sentiment) => {
    const normalized = normalizeSentiment(sentiment);
    return sentimentColors[normalized] || sentimentColors.neutral;
  };

  // Helper function to get sentiment icon
  const getSentimentIcon = (sentiment) => {
    const normalized = normalizeSentiment(sentiment);
    return sentimentIcons[normalized] || sentimentIcons.neutral;
  };

  // Filter conversations by sentiment
  const filteredConversations = sentimentFilter === "all"
    ? conversations
    : conversations.filter(conv =>
        normalizeSentiment(conv.sentiment) === sentimentFilter.toLowerCase()
      );

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Fixed header */}
      <Box sx={{ position: "fixed", width: "100%", zIndex: 1200 }}>
        <AdminAppHeader showSwitch={false} />
      </Box>

      {/* Main content */}
      <Box sx={{ pt: "6rem", px: 4, pb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "Calibri, Ideal Sans, Arial, sans-serif",
            fontWeight: 700,
            color: "#064F80",
            mb: 3,
          }}
        >
          Conversation Logs & Sentiment Analysis
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              label="Timeframe"
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="weekly">This Week</MenuItem>
              <MenuItem value="monthly">This Month</MenuItem>
              <MenuItem value="yearly">This Year</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Sentiment</InputLabel>
            <Select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              label="Filter by Sentiment"
            >
              <MenuItem value="all">All Sentiments</MenuItem>
              <MenuItem value="positive">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HappyIcon sx={{ color: AccessibleColors.status.success, fontSize: 20 }} />
                  Positive (Thumbs Up)
                </Box>
              </MenuItem>
              <MenuItem value="neutral">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NeutralIcon sx={{ color: AccessibleColors.status.warning, fontSize: 20 }} />
                  Neutral (No Feedback)
                </Box>
              </MenuItem>
              <MenuItem value="negative">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SadIcon sx={{ color: AccessibleColors.status.error, fontSize: 20 }} />
                  Negative (Thumbs Down)
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, textAlign: "center", background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)", color: "white" }}>
              <HappyIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {sentiment.positive || 0}
              </Typography>
              <Typography variant="body1">Positive</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, textAlign: "center", background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)", color: "white" }}>
              <SadIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {sentiment.negative || 0}
              </Typography>
              <Typography variant="body1">Negative</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Results Counter */}
        {!loading && conversations.length > 0 && (
          <Typography
            variant="body2"
            sx={{ mb: 2, color: AccessibleColors.text.secondary, fontWeight: 500 }}
          >
            Showing {filteredConversations.length} of {conversations.length} conversations
            {sentimentFilter !== "all" && ` (${sentimentFilter} only)`}
          </Typography>
        )}

        {/* Conversations Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredConversations.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              {sentimentFilter === "all"
                ? "No conversations found for this timeframe."
                : `No ${sentimentFilter} conversations found for this timeframe.`
              }
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F4EFE8" }}>
                  <TableCell><strong>Time</strong></TableCell>
                  <TableCell><strong>Session</strong></TableCell>
                  <TableCell><strong>Query</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Sentiment</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredConversations.map((conv, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{formatTimestamp(conv.timestamp)}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                        {conv.session_id?.substring(0, 12)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {conv.query}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={conv.category}
                        size="small"
                        sx={{ backgroundColor: "#7FD3EE", color: "white" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getSentimentIcon(conv.sentiment)}
                        label={normalizeSentiment(conv.sentiment).charAt(0).toUpperCase() + normalizeSentiment(conv.sentiment).slice(1)}
                        size="small"
                        sx={{
                          backgroundColor: getSentimentColor(conv.sentiment),
                          color: "white",
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: 'white'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleViewDetails(conv)}
                        sx={{ color: "#064F80" }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Conversation Detail Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #064F80 0%, #053E66 100%)",
            color: "white",
            fontFamily: "Calibri, Ideal Sans, Arial, sans-serif",
          }}
        >
          Conversation Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedConv && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Session ID
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: "monospace", mb: 2 }}>
                {selectedConv.session_id}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Timestamp
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {formatTimestamp(selectedConv.timestamp)}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Category
              </Typography>
              <Chip
                label={selectedConv.category}
                sx={{ mb: 2, backgroundColor: "#7FD3EE", color: "white" }}
              />

              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                User Question
              </Typography>
              <Paper sx={{ p: 2, mb: 2, backgroundColor: "#F4EFE8" }} elevation={0}>
                <Typography variant="body1">{selectedConv.query}</Typography>
              </Paper>

              <Typography variant="subtitle2" color="text.secondary">
                Bot Response
              </Typography>
              <Paper sx={{ p: 2, mb: 3, backgroundColor: "#EAF2F4" }} elevation={0}>
                <Typography variant="body1">{selectedConv.response}</Typography>
              </Paper>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sentiment
                  </Typography>
                  <Chip
                    icon={sentimentIcons[selectedConv.sentiment]}
                    label={selectedConv.sentiment.toUpperCase()}
                    sx={{
                      backgroundColor: sentimentColors[selectedConv.sentiment],
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ConversationLogs;
