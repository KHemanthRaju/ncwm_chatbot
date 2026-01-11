// AdminAnalytics.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  MenuItem,
  Select,
  FormControl,
  Card,
  CardContent,
  Container,
  Paper,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  QuestionAnswer as QuestionIcon,
} from "@mui/icons-material";
import axios from "axios";

import AdminAppHeader from "./AdminAppHeader";
import { DOCUMENTS_API } from "../utilities/constants";
import { getIdToken } from "../utilities/auth";
import AccessibleColors from "../utilities/accessibleColors";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const ANALYTICS_API = `${DOCUMENTS_API}session-logs`;

const defaultCategories = [
  "Training & Courses",
  "Instructor Certification",
  "Learner Support",
  "Administrative Procedures",
  "Course Materials",
  "MHFA Connect Platform",
  "Recertification",
  "Mental Health Resources",
  "Scheduling & Registration",
  "Policies & Guidelines",
  "Technical Support",
  "Unknown",
];

// Color palette for category cards - Using centralized WCAG AA compliant colors
const categoryColors = Object.values(AccessibleColors.categories);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AdminAnalytics() {
  const [timeframe, setTimeframe] = useState("today");
  const [categoryCounts, setCounts] = useState({});
  const [userCount, setUserCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const token = await getIdToken();
        const { data } = await axios.get(ANALYTICS_API, {
          params: { timeframe },
          headers: { Authorization: `Bearer ${token}` },
        });

        // normalize categories
        const counts = {};
        let total = 0;
        defaultCategories.forEach((c) => {
          const count = data.categories?.[c] || 0;
          counts[c] = count;
          total += count;
        });
        setCounts(counts);
        setTotalQuestions(total);

        setUserCount(data.user_count || 0);
      } catch (err) {
        console.error("Analytics fetch failed:", err);
      }
    }
    fetchAnalytics();
  }, [timeframe]);

  // Get top 5 categories
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Fixed header */}
      <Box sx={{ position: "fixed", width: "100%", zIndex: 1200 }}>
        <AdminAppHeader showSwitch={false} />
      </Box>

      <Container maxWidth="xl" sx={{ pt: "7rem", pb: 4 }}>
        {/* Timeframe Selector */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: AccessibleColors.primary.light }}>
            Analytics Dashboard
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              sx={{
                backgroundColor: "white",
                borderRadius: "8px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: AccessibleColors.primary.light,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: AccessibleColors.secondary.light,
                },
              }}
            >
              <MenuItem value="today">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #082745 0%, #0d3a63 100%)",
                color: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(8, 39, 69, 0.4)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: 600, mb: 1, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                      Total Users
                    </Typography>
                    <Typography variant="h3" sx={{ color: "#ffffff", fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                      {userCount}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 60, color: "#ffffff", opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #8B2805 0%, #C23808 100%)",
                color: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(139, 40, 5, 0.4)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: 600, mb: 1, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                      Total Questions
                    </Typography>
                    <Typography variant="h3" sx={{ color: "#ffffff", fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                      {totalQuestions}
                    </Typography>
                  </Box>
                  <QuestionIcon sx={{ fontSize: 60, color: "#ffffff", opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Question Categories */}
          <Grid item xs={12} md={9}>
            <Paper
              sx={{
                p: 3,
                borderRadius: "16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: AccessibleColors.primary.light }}>
                Question Categories
              </Typography>
              <Grid container spacing={2}>
                {defaultCategories.map((category, index) => {
                  const count = categoryCounts[category] || 0;
                  const color = categoryColors[index % categoryColors.length];

                  return (
                    <Grid item xs={12} sm={6} md={4} key={category}>
                      <Card
                        sx={{
                          borderRadius: "12px",
                          border: `2px solid ${color}20`,
                          boxShadow: "none",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 16px ${color}30`,
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 600, color: AccessibleColors.text.primary, mb: 0.5 }}
                              >
                                {category}
                              </Typography>
                              <Typography variant="caption" sx={{ color: AccessibleColors.text.secondary, fontWeight: 500 }}>
                                Questions Asked
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                minWidth: 60,
                                height: 60,
                                borderRadius: "12px",
                                backgroundColor: color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography
                                variant="h4"
                                sx={{ fontWeight: 700, color: "#ffffff !important", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
                                style={{ color: '#ffffff' }}
                              >
                                {count}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>

          {/* Top Categories */}
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 3,
                borderRadius: "16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <TrendingUpIcon sx={{ color: AccessibleColors.secondary.light, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: AccessibleColors.primary.light }}>
                  Top Categories
                </Typography>
              </Box>
              {topCategories.length > 0 ? (
                topCategories.map(([category, count], index) => (
                  <Box
                    key={category}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 2,
                      borderBottom: index < topCategories.length - 1 ? "1px solid #e0e0e0" : "none",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: AccessibleColors.text.primary, fontWeight: 500, flex: 1, pr: 2 }}>
                      {category}
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: categoryColors[defaultCategories.indexOf(category) % categoryColors.length],
                        color: "white",
                        px: 2,
                        py: 0.5,
                        borderRadius: "20px",
                        minWidth: 40,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {count}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: AccessibleColors.text.tertiary, fontWeight: 500, textAlign: "center", py: 2 }}>
                  No category data available
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
