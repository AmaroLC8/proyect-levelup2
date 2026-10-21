import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Carrito() {
  const { carrito, modificarCantidad, eliminarDelCarrito, vaciarCarrito, totalMonto } = useCart();

  const formatearDinero = (monto) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);

  return (
    <div className="container my-5">
      {/* Alerta de notificación según Figura 5 de la pauta */}
      <div className="alert alert-info alert-dismissible fade show d-flex align-items-center justify-content-between shadow-sm" role="alert">
        <div>
          <strong>¡Guía Carrito de compra!</strong> Esta vista fue diseñada para aprender y determinar la implementación mediante el uso del carrito de compras.
        </div>
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-info fw-bold mb-0">
          <i className="bi bi-cart3 me-2"></i>Carrito de Compras
        </h2>
        {carrito.length > 0 && (
          <button className="btn btn-outline-danger btn-sm" onClick={vaciarCarrito}>
            <i className="bi bi-trash me-1"></i>Vaciar Carrito
          </button>
        )}
      </div>

      {carrito.length === 0 ? (
        <div className="card text-center py-5 shadow-sm border-secondary">
          <div className="card-body">
            <i className="bi bi-cart-x text-secondary" style={{ fontSize: '4rem' }}></i>
            <h4 className="mt-3 text-light">Tu carrito está vacío</h4>
            <p className="text-secondary">Parece que aún no has agregado productos de Level-Up Gamer.</p>
            <Link to="/productos" className="btn btn-info mt-2 text-dark fw-bold">
              Ir al Catálogo
            </Link>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-secondary">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="text-secondary small text-uppercase">
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th style={{ width: '140px' }}>Cantidad</th>
                  <th>Subtotal</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    </td>
                    <td className="fw-bold text-light">{item.nombre}</td>
                    <td>{formatearDinero(item.precio)}</td>
                    <td>
                      <div className="input-group input-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => modificarCantidad(item.id, -1)}
                        >
                          -
                        </button>
                        <span className="input-group-text bg-dark text-light border-secondary px-3">
                          {item.cantidad}
                        </span>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => modificarCantidad(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="fw-bold text-success">
                      {formatearDinero(item.precio * item.cantidad)}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => eliminarDelCarrito(item.id)}
                      >
                        <i className="bi bi-x-lg me-1"></i>Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="text-end fs-5 fw-bold text-light py-3">
                    Total:
                  </td>
                  <td colSpan="2" className="fs-4 fw-bold text-info py-3">
                    {formatearDinero(totalMonto)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="card-footer bg-dark border-secondary p-3 d-flex justify-content-between align-items-center">
            <Link to="/productos" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-1"></i>Seguir Comprando
            </Link>
            <Link to="/checkout" className="btn btn-success btn-lg px-4 fw-bold">
              <i className="bi bi-credit-card me-2"></i>Comprar Ahora
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}