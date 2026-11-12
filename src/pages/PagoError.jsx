import React from 'react';
import { Link } from 'react-router-dom';
import { obtenerUltimaBoleta } from '../utils/ultimaBoleta';
import ResumenOrden from '../components/ResumenOrden';

// Muestra la boleta RECHAZADA que respondió el backend en POST /boletas (la guarda Checkout.jsx).
// El backend también guarda las boletas rechazadas, así queda registro del intento.
export default function PagoError() {
  const orden = obtenerUltimaBoleta();

  if (!orden || orden.estado !== 'RECHAZADA') {
    return (
      <div className="container my-5 text-center">
        <h3 className="text-secondary">No hay un pago pendiente para mostrar.</h3>
        <Link to="/carrito" className="btn btn-info mt-3 text-dark fw-bold">
          Ir al Carrito
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: '850px' }}>
      <div className="card shadow-lg border-danger">
        <div className="card-header bg-danger text-light text-center py-4">
          <i className="bi bi-x-octagon-fill fs-1"></i>
          <h3 className="fw-bold mt-2 mb-0">No se pudo realizar el pago</h3>
          <span className="badge bg-dark mt-1">Orden #{orden.numeroOrden}</span>
        </div>

        <div className="card-body p-4">
          <p className="text-secondary small text-end mb-3">
            Fecha: {new Date(orden.fecha).toLocaleString('es-CL')}
          </p>

          <div className="text-center">
            <p className="text-secondary mb-4">
              Ocurrió un problema con el medio de pago. Tus productos siguen guardados en el carrito.
            </p>

            {/* reintentar: el checkout se rellena con los datos de esta orden */}
            <Link
              to="/checkout"
              state={{ reintentar: true }}
              className="btn btn-success btn-lg px-5 py-3 fw-bold mb-4 shadow"
            >
              <i className="bi bi-arrow-repeat me-2"></i>VOLVER A REALIZAR EL PAGO
            </Link>
          </div>

          <ResumenOrden orden={orden} etiquetaTotal="Monto pendiente" />
        </div>
      </div>
    </div>
  );
}
