// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token'); // Check if there's a token in localStorage

  if (!token) {
    // If no token is found, redirect to the login page
    return <Navigate to="/login" />;
  }

  // If there's a token, render the child routes (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
