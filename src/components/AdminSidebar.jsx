import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/roles';

const { ADMIN, VENDEDOR } = ROLES;

// Cada opción indica qué roles la ven. Deben coincidir con las rutas protegidas de App.jsx:
// el VENDEDOR solo ve Productos y Órdenes (pauta del profesor).
const OPCIONES_ADMIN = [
  { to: '/admin', texto: 'Dashboard', icono: 'bi-speedometer2', exact: true, roles: [ADMIN] },
  { to: '/admin/ordenes', texto: 'Órdenes y Boletas', icono: 'bi-receipt', roles: [ADMIN, VENDEDOR] },
  { to: '/admin/productos', texto: 'Productos', icono: 'bi-box-seam', roles: [ADMIN, VENDEDOR] },
  { to: '/admin/categorias', texto: 'Categorías', icono: 'bi-tags', roles: [ADMIN] },
  { to: '/admin/usuarios', texto: 'Usuarios', icono: 'bi-people', roles: [ADMIN] },
  { to: '/admin/reportes', texto: 'Reportes', icono: 'bi-bar-chart', roles: [ADMIN] },
  { to: '/admin/perfil', texto: 'Mi Perfil', icono: 'bi-person-badge', roles: [ADMIN] },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { usuario, esVendedor, cerrarSesion } = useAuth();

  // Solo las opciones que corresponden al rol del usuario con sesión
  const opcionesVisibles = OPCIONES_ADMIN.filter((opcion) => opcion.roles.includes(usuario?.rol));

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/');
  };

  return (
    <div
      className="p-3 d-flex flex-column min-vh-100"
      style={{
        backgroundColor: '#121620',
        borderRight: '1px solid #22293a',
        width: '260px',
        minWidth: '260px',
      }}
    >
      <div className="pb-3 mb-3 border-bottom border-secondary text-center">
        <span className="fs-5 fw-bold text-info">
          <i className="bi bi-shield-lock me-2"></i>{esVendedor ? 'Panel Vendedor' : 'Panel Admin'}
        </span>
      </div>

      <ul className="nav nav-pills flex-column mb-auto gap-1">
        {opcionesVisibles.map((item) => (
          <li className="nav-item" key={item.to}>
            <NavLink
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 py-2 px-3 fw-semibold ${
                  isActive
                    ? 'bg-info text-dark shadow-sm'
                    : 'text-light opacity-75 hover-opacity-100'
                }`
              }
              style={{ borderRadius: '8px' }}
            >
              <i className={`bi ${item.icono} fs-5`}></i>
              {item.texto}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Accesos finales del menú (Figura 9 de la pauta) */}
      <div className="d-grid gap-2 pt-3 mt-3 border-top border-secondary">
        <Link to="/" className="btn btn-outline-light fw-semibold">
          <i className="bi bi-shop me-2"></i>Ver Tienda
        </Link>
        <button className="btn btn-danger fw-semibold" onClick={handleCerrarSesion}>
          <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
