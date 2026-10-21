import React from 'react';
import { Link } from 'react-router-dom';
import { obtenerProductosEnOferta, obtenerPorcentajeDescuento } from '../data/productos';
import ProductCard from '../components/ProductCard';

export default function Ofertas() {
  // Primero los productos con mayor porcentaje de descuento
  const ofertas = obtenerProductosEnOferta().sort(
    (a, b) => obtenerPorcentajeDescuento(b) - obtenerPorcentajeDescuento(a)
  );

  return (
    <div className="container py-4">
      <div
        className="text-center p-4 p-md-5 mb-5"
        style={{
          background: 'linear-gradient(135deg, #7f1d1d 0%, #121620 100%)',
          border: '1px solid #22293a',
          borderRadius: '16px',
        }}
      >
        <h1 className="fw-bold display-6 mb-2" style={{ color: '#ffffff' }}>
          <i className="bi bi-lightning-charge-fill text-warning me-2"></i>Ofertas Level-Up
        </h1>
        <p className="mb-0" style={{ color: '#cbd5e1' }}>
          Productos seleccionados con precio rebajado por tiempo limitado.
        </p>
      </div>

      {ofertas.length > 0 ? (
        <div className="row g-4">
          {ofertas.map((prod) => (
            <div className="col-12 col-md-6 col-lg-4" key={prod.id}>
              <ProductCard producto={prod} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5" style={{ color: '#94a3b8' }}>
          <i className="bi bi-tag" style={{ fontSize: '3rem' }}></i>
          <p className="mt-3">No hay productos en oferta en este momento.</p>
          <Link to="/productos" className="btn btn-info text-dark fw-bold">
            Ver catálogo completo
          </Link>
        </div>
      )}
    </div>
  );
}
