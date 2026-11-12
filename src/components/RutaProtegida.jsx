import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protege un grupo de rutas según el rol del usuario (pauta del profesor):
// <Route element={<RutaProtegida rolesPermitidos={['ADMIN', 'VENDEDOR']} />}> ...rutas hijas... </Route>
// - Sin sesión → /login.
// - Con sesión, pero su rol no está en rolesPermitidos → / (inicio de la tienda).
// - Con permiso → muestra la ruta hija (<Outlet />).
// Ojo: esto solo decide qué se ve en el navegador. La seguridad real está en el backend
// (SecurityConfig responde 401/403 aunque alguien edite el rol guardado en localStorage).
export default function RutaProtegida({ rolesPermitidos }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
