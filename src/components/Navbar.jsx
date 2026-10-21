import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatearDinero } from '../utils/formato';

const ENLACES = [
  { to: '/', texto: 'Home' },
  { to: '/productos', texto: 'Catálogo' },
  { to: '/categorias', texto: 'Categorías' },
  { to: '/ofertas', texto: 'Ofertas', icono: 'bi-lightning-charge-fill text-warning' },
  { to: '/nosotros', texto: 'Nosotros' },
  { to: '/blog', texto: 'Blog' },
  { to: '/contacto', texto: 'Contacto' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { totalItems, totalMonto } = useCart();
  const { usuario, esAdmin, cerrarSesion } = useAuth();
  const [textoBusqueda, setTextoBusqueda] = useState('');

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/');
  };

  // El buscador lleva al catálogo con el texto en la URL (?buscar=...)
  const handleBuscar = (e) => {
    e.preventDefault();
    const texto = textoBusqueda.trim();
    navigate(texto ? `/productos?buscar=${encodeURIComponent(texto)}` : '/productos');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top py-2 shadow">
      <div className="container">
        {/* Logo / Marca */}
        <Link className="navbar-brand fw-bold text-info fs-4" to="/">
          <i className="bi bi-controller me-2"></i>LEVEL-UP GAMER
        </Link>

        {/* Botón responsive para móviles */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse flex-column align-items-stretch" id="navbarContent">
          {/* Fila superior: buscador, sesión y carrito */}
          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2 py-2">
            <form className="d-flex flex-grow-1 mx-lg-4" role="search" onSubmit={handleBuscar}>
              <input
                type="search"
                className="form-control form-control-sm bg-dark text-light border-secondary me-2"
                placeholder="Buscar productos..."
                aria-label="Buscar productos"
                value={textoBusqueda}
                onChange={(e) => setTextoBusqueda(e.target.value)}
              />
              <button type="submit" className="btn btn-sm btn-outline-info">
                Buscar
              </button>
            </form>

            <div className="d-flex flex-wrap align-items-center gap-2">
              {usuario ? (
                <>
                  <span className="text-light small me-1">
                    <i className="bi bi-person-circle text-info me-1"></i>
                    Hola, <strong>{usuario.nombre}</strong>
                    {usuario.descuentoDuoc && (
                      <span className="badge bg-warning text-dark ms-2">Duoc -20%</span>
                    )}
                  </span>
                  <button className="btn btn-sm btn-outline-danger" onClick={handleCerrarSesion}>
                    <i className="bi bi-box-arrow-right me-1"></i>Salir
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-sm btn-outline-light">
                    Iniciar sesión
                  </Link>
                  <Link to="/registro" className="btn btn-sm btn-info text-dark fw-semibold">
                    Crear cuenta
                  </Link>
                </>
              )}
              <Link to="/carrito" className="btn btn-sm btn-success fw-semibold position-relative">
                <i className="bi bi-cart3 me-1"></i>Carrito {formatearDinero(totalMonto)}
                {totalItems > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Fila inferior: enlaces de navegación */}
          <ul className="navbar-nav justify-content-lg-center mb-2 mb-lg-0">
            {ENLACES.map((enlace) => (
              <li className="nav-item" key={enlace.to}>
                <NavLink className="nav-link py-1" to={enlace.to} end={enlace.to === '/'}>
                  {enlace.icono && <i className={`bi ${enlace.icono} me-1`}></i>}
                  {enlace.texto}
                </NavLink>
              </li>
            ))}
            {esAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link py-1" to="/admin">
                  <i className="bi bi-shield-lock me-1"></i>Admin
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
