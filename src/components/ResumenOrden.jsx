import React from 'react';
import { formatearDinero } from '../utils/formato';
import DesgloseTotales from './DesgloseTotales';

// Detalle de una boleta del backend: cliente, dirección, productos y totales.
// Se reutiliza en compra exitosa, pago con error y en la boleta del panel (ADMIN y VENDEDOR).
// La boleta trae los datos del cliente con el sufijo "Cliente" (nombreCliente, correoCliente...)
// porque así se llaman las columnas en la tabla boleta. Los montos (subtotal, descuento, neto,
// iva, total) y el precio de cada detalle los calculó el backend: aquí solo se muestran.
export default function ResumenOrden({ orden, etiquetaTotal = 'Total pagado' }) {
  const { detalles, subtotal, descuento, neto, iva, total } = orden;

  return (
    <>
      <h5 className="text-info border-bottom border-secondary pb-2 mb-3">Información del cliente</h5>
      <div className="row g-2 mb-4 text-light small">
        <div className="col-sm-4"><strong>Nombre:</strong> {orden.nombreCliente}</div>
        <div className="col-sm-4"><strong>Apellidos:</strong> {orden.apellidosCliente}</div>
        <div className="col-sm-4"><strong>Correo:</strong> {orden.correoCliente}</div>
      </div>

      <h5 className="text-info border-bottom border-secondary pb-2 mb-3">Dirección de entrega</h5>
      <p className="text-light small mb-1">
        {[orden.depto ? `${orden.calle} (${orden.depto})` : orden.calle, orden.comuna, orden.region].join(', ')}
      </p>
      {orden.indicaciones && (
        <p className="text-secondary small fst-italic">"{orden.indicaciones}"</p>
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
            {/* precioUnitario es el precio cobrado al momento de la compra (con oferta si tenía) */}
            {detalles.map((detalle) => (
              <tr key={detalle.id}>
                <td>{detalle.producto?.nombre}</td>
                <td>{formatearDinero(detalle.precioUnitario)}</td>
                <td>{detalle.cantidad}</td>
                <td className="text-end text-success">{formatearDinero(detalle.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <DesgloseTotales
              subtotal={subtotal}
              descuento={descuento}
              neto={neto}
              iva={iva}
              total={total}
              etiquetaTotal={etiquetaTotal}
            />
          </tfoot>
        </table>
      </div>
    </>
  );
}
