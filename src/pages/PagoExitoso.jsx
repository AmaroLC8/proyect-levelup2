import React from 'react';
import { Link } from 'react-router-dom';
import { obtenerUltimaOrden } from '../data/ordenes';
import ResumenOrden from '../components/ResumenOrden';

export default function PagoExitoso() {
  const orden = obtenerUltimaOrden();

  if (!orden || orden.estado !== 'pagada') {
    return (
      <div className="container my-5 text-center">
        <h3 className="text-secondary">No hay una compra reciente para mostrar.</h3>
        <Link to="/productos" className="btn btn-info mt-3 text-dark fw-bold">
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: '850px' }}>
      <div className="card shadow-lg border-success">
        <div className="card-header bg-success text-dark text-center py-4">
          <i className="bi bi-check-circle-fill fs-1"></i>
          <h3 className="fw-bold mt-2 mb-0">¡Se ha realizado la compra con éxito!</h3>
          <span className="badge bg-dark text-light mt-1">Orden #{orden.numeroOrden}</span>
        </div>

        <div className="card-body p-4">
          <p className="text-secondary small text-end mb-3">
            Fecha: {new Date(orden.fecha).toLocaleString('es-CL')}
          </p>

          <ResumenOrden orden={orden} />

          <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
            {/* El navegador permite guardar la boleta como PDF desde el diálogo de impresión */}
            <button className="btn btn-outline-light fw-bold" onClick={() => window.print()}>
              <i className="bi bi-printer me-1"></i>Imprimir boleta
            </button>
            <Link to="/" className="btn btn-primary px-4 fw-bold">
              <i className="bi bi-house-door me-1"></i>Volver a la Tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
