// Authentication utility functions
import { fetchAuthSession, signOut } from 'aws-amplify/auth';

/**
 * Retrieves the ID token from AWS Amplify Auth session
 * @returns {Promise<string>} The ID token string
 */
export async function getIdToken() {
  try {
    // Check if in guest mode first
    const guestMode = localStorage.getItem("guestMode");
    if (guestMode === "true") {
      return "guest-demo-token";
    }

    // Try to fetch fresh token from Amplify
    try {
      const session = await fetchAuthSession({ forceRefresh: true });
      const idToken = session.tokens?.idToken?.toString();

      if (idToken) {
        console.log('[AUTH] Got fresh ID token from Amplify');
        localStorage.setItem("idToken", idToken);
        return idToken;
      }
    } catch (refreshError) {
      console.warn('[AUTH] Failed to refresh token, trying without forceRefresh:', refreshError);

      // Fallback: try without forceRefresh
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (idToken) {
        console.log('[AUTH] Got ID token from Amplify (no refresh)');
        localStorage.setItem("idToken", idToken);
        return idToken;
      }
    }

    throw new Error("No valid authentication token found. Please log in again.");
  } catch (error) {
    console.error("[AUTH] Error getting ID token:", error);
    throw error;
  }
}

/**
 * Retrieves the access token from AWS Amplify Auth session
 * @returns {Promise<string>} The access token string
 */
export async function getAccessToken() {
  try {
    // Check if in guest mode first
    const guestMode = localStorage.getItem("guestMode");
    if (guestMode === "true") {
      return "guest-demo-token";
    }

    // Try to fetch fresh token from Amplify
    try {
      const session = await fetchAuthSession({ forceRefresh: true });
      const accessToken = session.tokens?.accessToken?.toString();

      if (accessToken) {
        console.log('[AUTH] Got fresh access token from Amplify');
        localStorage.setItem("accessToken", accessToken);
        return accessToken;
      }
    } catch (refreshError) {
      console.warn('[AUTH] Failed to refresh token, trying without forceRefresh:', refreshError);

      // Fallback: try without forceRefresh
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();

      if (accessToken) {
        console.log('[AUTH] Got access token from Amplify (no refresh)');
        localStorage.setItem("accessToken", accessToken);
        return accessToken;
      }
    }

    throw new Error("No valid authentication token found. Please log in again.");
  } catch (error) {
    console.error("[AUTH] Error getting access token:", error);
    throw error;
  }
}

/**
 * Checks if the user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated() {
  const guestMode = localStorage.getItem("guestMode");
  const idToken = localStorage.getItem("idToken");
  return guestMode === "true" || !!idToken;
}

/**
 * Clears authentication data from localStorage and signs out from Cognito
 */
export async function logout() {
  try {
    // Sign out from Cognito
    await signOut();
    console.log('[AUTH] Signed out from Cognito');
  } catch (error) {
    console.warn('[AUTH] Error signing out from Cognito:', error);
  }

  // Clear localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("idToken");
  localStorage.removeItem("guestMode");
}
