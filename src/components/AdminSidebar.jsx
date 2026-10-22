import React from 'react';
import { NavLink } from 'react-router-dom';

const OPCIONES_ADMIN = [
  { to: '/admin', texto: 'Dashboard', icono: 'bi-speedometer2', exact: true },
  { to: '/admin/ordenes', texto: 'Órdenes y Boletas', icono: 'bi-receipt' },
  { to: '/admin/productos', texto: 'Productos', icono: 'bi-box-seam' },
  { to: '/admin/categorias', texto: 'Categorías', icono: 'bi-tags' },
  { to: '/admin/usuarios', texto: 'Usuarios', icono: 'bi-people' },
  { to: '/admin/reportes', texto: 'Reportes', icono: 'bi-bar-chart' },
  { to: '/admin/perfil', texto: 'Mi Perfil', icono: 'bi-person-badge' },
];

export default function AdminSidebar() {
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
          <i className="bi bi-shield-lock me-2"></i>Panel Admin
        </span>
      </div>

      <ul className="nav nav-pills flex-column mb-auto gap-1">
        {OPCIONES_ADMIN.map((item) => (
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
    </div>
  );
}
