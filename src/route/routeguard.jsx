import { Navigate } from "react-router";

/**
 * Private Route Guard - Protects routes that require authentication
 */
export const PrivateRoute = ({ children }) => {
  const isLoggedIn = window.user && Object.keys(window.user).length > 0;
  
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

/**
 * Public Route Guard - Prevents logged-in users from accessing auth pages
 */
export const PublicRoute = ({ children, redirectTo = "/dashboard" }) => {
  const isLoggedIn = window.user && Object.keys(window.user).length > 0;
  
  if (isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
};

/**
 * Mixed Route - Accessible to both logged-in and non-logged-in users
 */
export const MixedRoute = ({ children }) => {
  return children;
};