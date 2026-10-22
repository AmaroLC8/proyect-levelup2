import React from 'react';
import { formatearDinero } from '../utils/formato';

// Detalle de una orden: cliente, dirección, productos y totales.
// Se reutiliza en compra exitosa, pago con error y en la boleta del administrador.
export default function ResumenOrden({ orden, etiquetaTotal = 'Total pagado' }) {
  const { cliente, items, subtotal, descuento, total } = orden;

  return (
    <>
      <h5 className="text-info border-bottom border-secondary pb-2 mb-3">Información del cliente</h5>
      <div className="row g-2 mb-4 text-light small">
        <div className="col-sm-4"><strong>Nombre:</strong> {cliente.nombre}</div>
        <div className="col-sm-4"><strong>Apellidos:</strong> {cliente.apellidos}</div>
        <div className="col-sm-4"><strong>Correo:</strong> {cliente.correo}</div>
      </div>

      <h5 className="text-info border-bottom border-secondary pb-2 mb-3">Dirección de entrega</h5>
      <p className="text-light small mb-1">
        {[cliente.depto ? `${cliente.calle} (${cliente.depto})` : cliente.calle, cliente.comuna, cliente.region].join(', ')}
      </p>
      {cliente.indicaciones && (
        <p className="text-secondary small fst-italic">"{cliente.indicaciones}"</p>
      )}

      <h5 className="text-info border-bottom border-secondary pb-2 mt-4 mb-3">Detalle de compra</h5>
      <div className="table-responsive">
        <table className="table table-dark table-sm align-middle">
          <thead>
            <tr className="text-secondary small">
              <th>Nombre</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th className="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.nombre}</td>
                <td>{formatearDinero(item.precio)}</td>
                <td>{item.cantidad}</td>
                <td className="text-end text-success">{formatearDinero(item.precio * item.cantidad)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {descuento > 0 && (
              <>
                <tr>
                  <td colSpan="3" className="text-end text-secondary">Subtotal:</td>
                  <td className="text-end text-light">{formatearDinero(subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end text-warning">Descuento Duoc:</td>
                  <td className="text-end text-warning">-{formatearDinero(descuento)}</td>
                </tr>
              </>
            )}
            <tr>
              <td colSpan="3" className="text-end fs-5 fw-bold text-light py-3">{etiquetaTotal}:</td>
              <td className="text-end fs-5 fw-bold text-success py-3">{formatearDinero(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
