import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserContextHook } from '../contexts/UserContexts';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser } = UserContextHook();

  // If user is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required and user doesn't have any of them, redirect to home
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
