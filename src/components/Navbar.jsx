import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();

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
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin">
                <i className="bi bi-shield-lock me-1"></i>Admin
              </NavLink>
            </li>
          </ul>

          {/* Acceso al Carrito */}
          <div className="d-flex align-items-center gap-3">
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