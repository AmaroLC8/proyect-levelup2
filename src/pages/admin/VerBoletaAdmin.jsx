import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerOrdenPorId } from '../../data/ordenes';

export default function VerBoletaAdmin() {
  const { id } = useParams();
  const [orden, setOrden] = useState(null);

  useEffect(() => {
    if (id) {
      const encontrada = obtenerOrdenPorId(id);
      setOrden(encontrada);
    }
  }, [id]);

  const formatearCLP = (monto) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto || 0);

  if (!orden) {
    return (
      <div className="container py-5 text-center text-light">
        <h4 className="text-danger mb-3">Orden no encontrada</h4>
        <p className="text-secondary">No se encontró información para la orden #{id}.</p>
        <Link to="/admin/ordenes" className="btn btn-outline-info">
          <i className="bi bi-arrow-left me-2"></i>Volver a Órdenes
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-3 text-light" style={{ maxWidth: '850px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/admin/ordenes" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i>Volver al listado
        </Link>
        <button className="btn btn-info btn-sm" onClick={() => window.print()}>
          <i className="bi bi-printer me-1"></i>Imprimir Boleta
        </button>
      </div>

      <div className="card bg-dark border-info shadow-lg p-4">
        {/* Cabecera Boleta */}
        <div className="d-flex justify-content-between align-items-start border-bottom border-secondary pb-3 mb-4">
          <div>
            <h3 className="fw-bold text-info mb-0">LEVEL-UP GAMER</h3>
            <p className="small text-secondary mb-0">Comprobante Oficial de Compra</p>
            <p className="small text-secondary">RUT: 76.543.210-K · Santiago, Chile</p>
          </div>
          <div className="text-end">
            <span className="badge bg-info text-dark fs-6 mb-2">BOLETA ELECTRÓNICA</span>
            <h5 className="fw-bold mb-0">N° #{orden.id || orden.numeroOrden}</h5>
            <small className="text-secondary">
              Fecha: {orden.fecha ? new Date(orden.fecha).toLocaleString('es-CL') : 'N/A'}
            </small>
          </div>
        </div>

        {/* Datos Cliente */}
        <div className="row g-3 mb-4 p-3 bg-body-tertiary rounded text-dark">
          <div className="col-md-6">
            <strong className="d-block text-secondary small">DATOS DEL CLIENTE</strong>
            <span className="fw-bold">{orden.cliente?.nombre || orden.nombreCliente || 'N/A'}</span>
            <br />
            <small>{orden.cliente?.email || orden.email}</small>
          </div>
          <div className="col-md-6">
            <strong className="d-block text-secondary small">DIRECCIÓN DE ENVÍO</strong>
            <span>{orden.despacho?.direccion || 'Despacho a domicilio'}</span>
            <br />
            <small>{orden.despacho?.comuna || ''}, {orden.despacho?.region || ''}</small>
          </div>
        </div>

        {/* Detalle Productos */}
        <h6 className="fw-bold text-info mb-3">Detalle de Productos</h6>
        <div className="table-responsive mb-4">
          <table className="table table-dark table-striped align-middle">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-center">Cant.</th>
                <th className="text-end">Precio Unit.</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(orden.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td>{item.nombre || item.titulo}</td>
                  <td className="text-center">{item.cantidad}</td>
                  <td className="text-end">{formatearCLP(item.precio)}</td>
                  <td className="text-end fw-semibold">
                    {formatearCLP((item.precio || 0) * (item.cantidad || 1))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="row justify-content-end">
          <div className="col-md-5">
            <div className="d-flex justify-content-between py-1 border-bottom border-secondary">
              <span className="text-secondary">Subtotal:</span>
              <span>{formatearCLP(orden.subtotal || orden.total)}</span>
            </div>
            {orden.descuento > 0 && (
              <div className="d-flex justify-content-between py-1 border-bottom border-secondary text-success">
                <span>Descuento Duoc (20%):</span>
                <span>-{formatearCLP(orden.descuento)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between py-2 fw-bold fs-5 text-info">
              <span>Total Pagado:</span>
              <span>{formatearCLP(orden.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}