import React from "react";
import { Grid, AppBar, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Logout as LogoutIcon } from "@mui/icons-material";
import { signOut } from 'aws-amplify/auth';
import Switch from "./Switch.jsx";
import { ALLOW_MULTLINGUAL_TOGGLE } from "../utilities/constants.js";
import AccessibleColors from "../utilities/accessibleColors";

function AdminAppHeader({ showSwitch }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("idToken");
      localStorage.removeItem("guestMode");
      navigate("/admin", { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if signOut fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("idToken");
      localStorage.removeItem("guestMode");
      navigate("/admin", { replace: true });
    }
  };

  const showHomeButton = true;

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: (theme) => theme.palette.background.header,
        height: "5rem",
        boxShadow: "none",
        borderBottom: (theme) => `1.5px solid ${theme.palette.primary[50]}`,
        padding: "0 3rem",
      }}
    >
      <Grid
        container
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        className="appHeight100"
      >
        <Grid item>
          <Grid container alignItems="center" spacing={2}>
            <Grid item sx={{ display: ALLOW_MULTLINGUAL_TOGGLE && showSwitch ? "flex" : "none" }}>
              <Switch />
            </Grid>

            {showHomeButton && (
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => navigate("/admin-dashboard")}
                  sx={{
                    backgroundColor: AccessibleColors.secondary.light,
                    color: AccessibleColors.text.inverse,
                    borderRadius: "20px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                    padding: "8px 20px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: AccessibleColors.primary.light,
                    },
                  }}
                >
                  Home
                </Button>
              </Grid>
            )}

            <Grid item>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  borderColor: "#ffffff",
                  color: "#ffffff",
                  borderRadius: "20px",
                  padding: "8px 20px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderWidth: "2px",
                  "&:hover": {
                    borderColor: "#ffffff",
                    color: "#ffffff",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderWidth: "2px",
                  },
                }}
              >
                Logout
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </AppBar>
  );
}

export default AdminAppHeader;
