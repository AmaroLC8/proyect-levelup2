import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RutaProtegidaAdmin() {
  const { usuario, esAdmin } = useAuth();

  if (!usuario || !esAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}