import React from "react";
import { Navigate, useLocation } from "react-router";
import { Spin } from "antd";

/**
 * ProtectedRoute component that guards private routes
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Allow access to /subscription if a token is present in the URL path, even if not logged in
  const pathSegments = location.pathname.split('/');
  const hasTokenInPath = pathSegments.length > 2 && pathSegments[2]; // Check if there's a token in the path

  if (isSubscriptionPage && hasTokenInPath) {
    return children;
  }

  // Show loading spinner while checking authentication
  if (window.user === undefined) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  // If no user or empty user object, redirect to login
  if (!window.user || Object.keys(window.user).length === 0) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  // If user exists, render the protected component
  return children;
};

export default ProtectedRoute;
