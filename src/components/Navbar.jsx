import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { usuario, esAdmin, cerrarSesion } = useAuth();

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top py-3 shadow">
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

        {/* Enlaces de navegación */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/productos">
                Catálogo
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/categorias">
                Categorías
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/ofertas">
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i>Ofertas
              </NavLink>
            </li>
            {esAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  <i className="bi bi-shield-lock me-1"></i>Admin
                </NavLink>
              </li>
            )}
          </ul>

          {/* Sesión y acceso al Carrito */}
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
            <Link to="/carrito" className="btn btn-outline-info position-relative">
              <i className="bi bi-cart3 fs-5"></i>
              {totalItems > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}