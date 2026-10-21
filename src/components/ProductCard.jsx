import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ producto }) {
  const { agregarAlCarrito } = useCart();

  const precioFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(producto.precio);

  return (
    <div
      className="h-100 d-flex flex-column"
      style={{
        backgroundColor: '#121620',
        border: '1px solid #22293a',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Caja de imagen con tamaño fijo igual para todos los productos (enlaza al detalle) */}
      <Link
        to={`/producto/${producto.id}`}
        style={{
          width: '100%',
          height: '220px',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          borderBottom: '1px solid #22293a',
        }}
      >
        <img
          src={producto.imagen}
          alt={producto.nombre}
          style={{
            maxWidth: '100%',
            maxHeight: '185px',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      </Link>

      {/* Cuerpo de la tarjeta */}
      <div className="p-4 d-flex flex-column flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span
            className="badge"
            style={{
              backgroundColor: 'rgba(14, 165, 233, 0.15)',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
            }}
          >
            {producto.categoria}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
            Stock: {producto.stock}
          </span>
        </div>

        <h5
          className="fw-bold mb-2"
          style={{ fontSize: '1.1rem', minHeight: '2.6rem' }}
        >
          <Link
            to={`/producto/${producto.id}`}
            className="text-decoration-none"
            style={{ color: '#ffffff' }}
          >
            {producto.nombre}
          </Link>
        </h5>

        <p
          className="mb-3 flex-grow-1"
          style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}
        >
          {producto.descripcion}
        </p>

        <div
          className="d-flex justify-content-between align-items-center pt-3 mt-auto"
          style={{ borderTop: '1px solid #22293a' }}
        >
          <span className="fs-5 fw-bold" style={{ color: '#ffffff' }}>
            {precioFormateado}
          </span>
          <button
            className="btn btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-2"
            style={{
              backgroundColor: '#0ea5e9',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
            }}
            onClick={() => agregarAlCarrito(producto)}
          >
            <i className="bi bi-cart-plus"></i> Añadir
          </button>
        </div>
      </div>
    </div>
  );
}