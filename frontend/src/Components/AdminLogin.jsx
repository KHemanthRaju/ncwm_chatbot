// src/Components/AdminLogin.js
import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Psychology as PsychologyIcon, AdminPanelSettings as AdminIcon } from "@mui/icons-material";
import { Amplify } from 'aws-amplify';
import { signIn, fetchAuthSession } from 'aws-amplify/auth';
import { COGNITO_CONFIG } from '../utilities/constants';

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: COGNITO_CONFIG.userPoolId,
      userPoolClientId: COGNITO_CONFIG.userPoolWebClientId,
      region: COGNITO_CONFIG.region
    }
  }
});

function AdminLogin() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoginError("");
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: fullName,
        password: password
      });

      if (isSignedIn) {
        // Get tokens
        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken?.toString();
        const idToken = session.tokens?.idToken?.toString();

        if (accessToken && idToken) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("idToken", idToken);
          navigate("/admin-dashboard", { replace: true });
        }
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        const newPass = window.prompt(
          "Your password must be reset. Please enter a new password:"
        );
        if (newPass) {
          // Handle new password requirement
          setLoginError("Password reset required. Please contact administrator.");
        } else {
          setLoginError("A new password is required to continue.");
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || "Authentication failed");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: 'linear-gradient(135deg, #064F80 0%, #053E66 100%)',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 5,
            borderRadius: '16px',
            background: 'white',
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
                margin: '0 auto 1.5rem',
                boxShadow: '0 4px 12px rgba(234, 94, 41, 0.4)',
              }}
            >
              <AdminIcon sx={{ color: 'white', fontSize: 42 }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                fontWeight: 700,
                color: '#064F80',
                mb: 0.5,
              }}
            >
              Admin Portal
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                color: '#666',
              }}
            >
              Learning Navigator - MHFA Ecosystem
            </Typography>
          </Box>

          {loginError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
              {loginError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            sx={{
              background: 'linear-gradient(135deg, #EA5E29 0%, #CB5223 100%)',
              color: 'white',
              fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
              fontWeight: 600,
              padding: '12px',
              fontSize: '1rem',
              borderRadius: '8px',
              boxShadow: '0px 4px 12px rgba(234, 94, 41, 0.3)',
              mb: 2,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #CB5223 0%, #B3421C 100%)',
                boxShadow: '0px 6px 16px rgba(234, 94, 41, 0.4)',
              },
            }}
          >
            Sign In
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              // Set guest mode flags
              localStorage.setItem("guestMode", "true");
              localStorage.setItem("accessToken", "guest-demo-token");
              localStorage.setItem("idToken", "guest-demo-token");
              navigate("/admin-dashboard", { replace: true });
            }}
            sx={{
              borderColor: "#064F80",
              color: "#064F80",
              fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
              fontWeight: 600,
              padding: '12px',
              fontSize: '1rem',
              borderRadius: '8px',
              borderWidth: '2px',
              textTransform: 'none',
              '&:hover': {
                borderColor: "#064F80",
                borderWidth: '2px',
                backgroundColor: "rgba(6, 79, 128, 0.04)"
              },
            }}
          >
            Continue as Guest
          </Button>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 2,
              textAlign: 'center',
              color: "text.secondary",
              fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
            }}
          >
            Guest mode provides read-only access for demonstration purposes
          </Typography>

          {/* Back to Chat Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="text"
              onClick={() => navigate("/")}
              sx={{
                color: '#064F80',
                fontFamily: 'Calibri, Ideal Sans, Arial, sans-serif',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(6, 79, 128, 0.04)',
                },
              }}
            >
              ← Back to Chat
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default AdminLogin;
