import React from 'react';
import { Link } from 'react-router-dom';

export default function PagoError() {
  const orden = JSON.parse(localStorage.getItem('levelup_ultima_orden')) || {
    numeroOrden: '20240705',
    cliente: { nombre: 'Pedro', apellidos: 'Hacker', correo: 'pedro.hacker20@example.com', calle: 'Los Crisantemos, Edificio Norte', depto: 'Depto 603', comuna: 'Cerrillos', region: 'Región Metropolitana de Santiago' },
    items: [],
    total: 28775,
  };

  const formatearDinero = (monto) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);

  return (
    <div className="container my-5" style={{ maxWidth: '850px' }}>
      <div className="card shadow-lg border-danger">
        <div className="card-header bg-danger text-light text-center py-4">
          <i className="bi bi-x-octagon-fill fs-1"></i>
          <h3 className="fw-bold mt-2 mb-0">No se pudo realizar el pago</h3>
          <span className="badge bg-dark mt-1">Orden #{orden.numeroOrden}</span>
        </div>

        <div className="card-body p-4 text-center">
          <p className="text-secondary mb-4">
            Ocurrió un problema de validación con el medio de pago o la conexión. Tus productos siguen guardados en el carrito.
          </p>

          <Link to="/checkout" className="btn btn-success btn-lg px-5 py-3 fw-bold mb-4 shadow">
            <i className="bi bi-arrow-repeat me-2"></i>VOLVER A REALIZAR EL PAGO
          </Link>

          <div className="text-start border-top border-secondary pt-4">
            <h5 className="text-info border-bottom border-secondary pb-2 mb-3">Detalle de intento de compra</h5>
            <div className="row g-2 mb-3 text-light small">
              <div className="col-sm-4"><strong>Nombre:</strong> {orden.cliente.nombre}</div>
              <div className="col-sm-4"><strong>Apellidos:</strong> {orden.cliente.apellidos}</div>
              <div className="col-sm-4"><strong>Correo:</strong> {orden.cliente.correo}</div>
            </div>

            <p className="text-light small">
              <strong>Dirección:</strong> {orden.cliente.calle}, {orden.cliente.comuna}, {orden.cliente.region}
            </p>

            <div className="alert alert-dark border-secondary d-flex justify-content-between align-items-center mt-3">
              <span className="text-secondary">Monto pendiente:</span>
              <span className="fs-5 fw-bold text-danger">{formatearDinero(orden.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}