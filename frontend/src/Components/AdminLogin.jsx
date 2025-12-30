// src/Components/AdminLogin.js
import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Logo from "../Assets/logo.svg";
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
    <>
      <Box sx={{ position: "absolute", top: "1rem", left: "2rem" }}>
        <img src={Logo} alt="Admin Logo" height={80} />
      </Box>
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
          Admin Login
        </Typography>

        {loginError && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {loginError}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          type="password"
          label="Password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          variant="contained"
          onClick={handleLogin}
          sx={{
            backgroundColor: "#D63F09",
            "&:hover": { backgroundColor: "#B53207" },
            color: "white",
            fontWeight: "bold",
            padding: "0.75rem 2rem",
            fontSize: "1rem",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
            mb: 2
          }}
        >
          Login
        </Button>

        <Button
          variant="outlined"
          onClick={() => {
            // Set guest mode flags
            localStorage.setItem("guestMode", "true");
            localStorage.setItem("accessToken", "guest-demo-token");
            localStorage.setItem("idToken", "guest-demo-token");
            navigate("/admin/dashboard", { replace: true });
          }}
          sx={{
            borderColor: "#D63F09",
            color: "#D63F09",
            "&:hover": {
              borderColor: "#B53207",
              backgroundColor: "rgba(214, 63, 9, 0.04)"
            },
            fontWeight: "bold",
            padding: "0.75rem 2rem",
            fontSize: "1rem",
            borderRadius: "8px",
          }}
        >
          Continue as Guest
        </Button>

        <Typography variant="caption" sx={{ mt: 2, color: "text.secondary" }}>
          Guest mode provides read-only access for demonstration purposes
        </Typography>
      </Container>
    </>
  );
}

export default AdminLogin;
