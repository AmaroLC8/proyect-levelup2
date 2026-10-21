import React from 'react';
import { Link } from 'react-router-dom';

export default function PagoExitoso() {
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
      <div className="card shadow-lg border-success">
        <div className="card-header bg-success text-dark text-center py-4">
          <i className="bi bi-check-circle-fill fs-1"></i>
          <h3 className="fw-bold mt-2 mb-0">¡Se ha realizado la compra con éxito!</h3>
          <span className="badge bg-dark text-light mt-1">Orden #{orden.numeroOrden}</span>
        </div>

        <div className="card-body p-4">
          <h5 className="text-info border-bottom border-secondary pb-2 mb-3">Información del Cliente</h5>
          <div className="row g-2 mb-4 text-light small">
            <div className="col-sm-4"><strong>Nombre:</strong> {orden.cliente.nombre}</div>
            <div className="col-sm-4"><strong>Apellidos:</strong> {orden.cliente.apellidos}</div>
            <div className="col-sm-4"><strong>Correo:</strong> {orden.cliente.correo}</div>
          </div>

          <h5 className="text-info border-bottom border-secondary pb-2 mb-3">Dirección de Entrega</h5>
          <p className="text-light small mb-1">
            {orden.cliente.calle} {orden.cliente.depto && `(${orden.cliente.depto})`}, {orden.cliente.comuna}, {orden.cliente.region}
          </p>
          {orden.cliente.indicaciones && (
            <p className="text-secondary small fst-italic">"{orden.cliente.indicaciones}"</p>
          )}

          <h5 className="text-info border-bottom border-secondary pb-2 mt-4 mb-3">Detalle de Compra</h5>
          <div className="table-responsive">
            <table className="table table-dark table-sm align-middle">
              <thead>
                <tr className="text-secondary small">
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orden.items.length > 0 ? (
                  orden.items.map((it, idx) => (
                    <tr key={idx}>
                      <td>{it.nombre}</td>
                      <td>{it.cantidad}</td>
                      <td>{formatearDinero(it.precio)}</td>
                      <td className="text-end text-success">{formatearDinero(it.precio * it.cantidad)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>PlayStation 5 Slim 1TB</td>
                    <td>1</td>
                    <td>{formatearDinero(orden.total)}</td>
                    <td className="text-end text-success">{formatearDinero(orden.total)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end fs-5 fw-bold text-light py-3">Total pagado:</td>
                  <td className="text-end fs-5 fw-bold text-success py-3">{formatearDinero(orden.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-center mt-4">
            <Link to="/" className="btn btn-primary px-4 fw-bold">
              <i className="bi bi-house-door me-1"></i>Volver a la Tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}