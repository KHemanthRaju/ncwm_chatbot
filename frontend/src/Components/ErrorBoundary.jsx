import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
      hasError: true
    }));

    // If errors keep happening, prevent infinite loops
    if (this.state.errorCount > 3) {
      this.setState({ hasError: true });
    }
  }

  logErrorToService = (error, errorInfo) => {
    // Send error to monitoring service (e.g., CloudWatch, Sentry, DataDog)
    try {
      // Example: Send to CloudWatch Logs via API endpoint
      const errorData = {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };

      // In production, you would send this to your logging endpoint
      // fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // });

      console.error('[ErrorBoundary] Error logged:', errorData);
    } catch (loggingError) {
      // Fail silently if logging fails
      console.error('[ErrorBoundary] Failed to log error:', loggingError);
    }
  };

  handleReload = () => {
    // Clear error state and reload
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Reload the page
    window.location.reload();
  };

  handleGoHome = () => {
    // Navigate to home page
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <Container maxWidth="md">
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                textAlign: 'center',
                backgroundColor: '#fff',
                borderRadius: 2
              }}
            >
              <ErrorIcon
                sx={{
                  fontSize: { xs: 60, sm: 80 },
                  color: 'error.main',
                  mb: 2
                }}
              />

              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
              >
                Oops! Something went wrong
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mb: 4,
                  maxWidth: 500,
                  mx: 'auto',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                We're sorry, but something unexpected happened. Our team has been notified and is working on a fix.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Paper
                  sx={{
                    p: 2,
                    mb: 3,
                    backgroundColor: '#f5f5f5',
                    textAlign: 'left',
                    maxHeight: 200,
                    overflow: 'auto'
                  }}
                >
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: 'error.main',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </Typography>
                </Paper>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.handleReload}
                  startIcon={<RefreshIcon />}
                  sx={{
                    px: 3,
                    py: 1,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Reload Page
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  onClick={this.handleGoHome}
                  sx={{
                    px: 3,
                    py: 1,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Go to Home
                </Button>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mt: 4,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                }}
              >
                Error ID: {Date.now().toString(36)}
              </Typography>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;