import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TipsAndUpdates as TipsIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import * as Icons from '@mui/icons-material';
import axios from 'axios';
import { DOCUMENTS_API } from '../utilities/constants';
import { getIdToken } from '../utilities/auth';
import { useLanguage } from '../utilities/LanguageContext';
import { RECOMMENDATIONS_TEXT } from '../utilities/recommendationsTranslations';
import { translateRecommendations } from '../utilities/translationService';

const RECOMMENDATIONS_API = `${DOCUMENTS_API}recommendations`;
const USE_TRANSLATE_API = process.env.REACT_APP_USE_TRANSLATE === 'true';

export default function PersonalizedRecommendations({ onQuerySelect }) {
  const { language } = useLanguage();
  const TEXT = RECOMMENDATIONS_TEXT[language] || RECOMMENDATIONS_TEXT.EN;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [language]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');

      const token = await getIdToken();
      const response = await axios.get(RECOMMENDATIONS_API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRole(response.data.role);

      // If Spanish is selected and translation API is enabled, translate content
      let recommendations = response.data.recommendations;
      if (language === 'ES' && USE_TRANSLATE_API) {
        console.log('[Translate] Translating recommendations to Spanish...');
        recommendations = await translateRecommendations(recommendations, 'es');
      }

      setRecommendations(recommendations);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError(err.response?.data?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleQueryClick = (query) => {
    if (onQuerySelect) {
      onQuerySelect(query);
    }
  };

  const getIconComponent = (iconName) => {
    const IconComponent = Icons[iconName] || Icons.Help;
    return <IconComponent sx={{ fontSize: 40, color: '#EA5E29', mb: 1 }} />;
  };

  const getRoleTitle = () => {
    const titles = {
      instructor: TEXT.RECOMMENDATIONS_TITLE_INSTRUCTOR,
      staff: TEXT.RECOMMENDATIONS_TITLE_STAFF,
      learner: TEXT.RECOMMENDATIONS_TITLE_LEARNER,
    };
    return titles[role] || TEXT.RECOMMENDATIONS_TITLE_LEARNER;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          {error}
          <Button
            size="small"
            onClick={fetchRecommendations}
            sx={{ ml: 2 }}
          >
            {TEXT.RETRY_BUTTON}
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!role || !recommendations) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          {TEXT.NO_ROLE_MESSAGE}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography
        variant="h5"
        sx={{
          fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
          fontWeight: 700,
          color: '#064F80',
          mb: 1,
        }}
      >
        {getRoleTitle()}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: '#666',
          mb: 4,
        }}
      >
        {TEXT.RECOMMENDATIONS_SUBTITLE}
      </Typography>

      {/* Quick Actions */}
      <Typography
        variant="h6"
        sx={{
          fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
          fontWeight: 600,
          color: '#064F80',
          mb: 2,
        }}
      >
        {TEXT.QUICK_ACTIONS_TITLE}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {recommendations.quick_actions?.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                {getIconComponent(
                  action.icon?.split('_').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join('') || 'Help'
                )}

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: '#064F80',
                    mb: 1,
                    fontSize: '0.95rem',
                  }}
                >
                  {action.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#666',
                    fontSize: '0.85rem',
                    mb: 2,
                  }}
                >
                  {action.description}
                </Typography>

                {/* Sample Queries */}
                {action.queries?.slice(0, 3).map((query, qIndex) => (
                  <Chip
                    key={qIndex}
                    label={query}
                    size="small"
                    onClick={() => handleQueryClick(query)}
                    sx={{
                      fontSize: '0.7rem',
                      mb: 0.5,
                      mr: 0.5,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#EA5E29',
                        color: 'white',
                      },
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Suggested Topics */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TipsIcon sx={{ color: '#EA5E29', mr: 1 }} />
            <Typography
              sx={{
                fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                fontWeight: 600,
                color: '#064F80',
              }}
            >
              {TEXT.SUGGESTED_TOPICS_TITLE}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {recommendations.suggested_topics?.map((topic, index) => (
              <Chip
                key={index}
                label={topic}
                onClick={() => handleQueryClick(`Tell me about ${topic}`)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#064F80',
                    color: 'white',
                  },
                }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Recent Updates */}
      {recommendations.recent_updates && recommendations.recent_updates.length > 0 && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <UpdateIcon sx={{ color: '#7FD3EE', mr: 1 }} />
              <Typography
                sx={{
                  fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                  fontWeight: 600,
                  color: '#064F80',
                }}
              >
                {TEXT.RECENT_UPDATES_TITLE}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box component="ul" sx={{ pl: 2 }}>
              {recommendations.recent_updates.map((update, index) => (
                <Typography
                  component="li"
                  key={index}
                  variant="body2"
                  sx={{ color: '#666', mb: 1 }}
                >
                  {update}
                </Typography>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}
