import React from 'react';
import { Navigate } from 'react-router';

/**
 * PublicRoute component that guards public routes (login, signup, etc.)
 * Redirects to home if user is already authenticated
 */
const PublicRoute = ({ children }) => {
  // If user exists and is not empty, redirect to home
  if (window.user && Object.keys(window.user).length > 0) {
    return <Navigate to="/dashboard" replace />;
  }

  // If no user, render the public component
  return children;
};

export default PublicRoute;