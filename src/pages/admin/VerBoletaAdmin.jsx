import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerOrdenPorId } from '../../data/ordenes';
import ResumenOrden from '../../components/ResumenOrden';
import EstadoOrden from '../../components/EstadoOrden';

export default function VerBoletaAdmin() {
  const { id } = useParams();
  const orden = obtenerOrdenPorId(id);

  if (!orden) {
    return (
      <div className="container py-5 text-center text-light">
        <h4 className="text-danger mb-3">Orden no encontrada</h4>
        <p className="text-secondary">No se encontró información para la orden solicitada.</p>
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
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 border-bottom border-secondary pb-3 mb-4">
          <div>
            <h3 className="fw-bold text-info mb-0">LEVEL-UP GAMER</h3>
            <p className="small text-secondary mb-0">Comprobante de compra</p>
          </div>
          <div className="text-end">
            <span className="badge bg-info text-dark fs-6 mb-2">BOLETA ELECTRÓNICA</span>
            <h5 className="fw-bold mb-1">N° {orden.numeroOrden}</h5>
            <small className="text-secondary d-block mb-1">
              Fecha: {new Date(orden.fecha).toLocaleString('es-CL')}
            </small>
            <EstadoOrden estado={orden.estado} />
          </div>
        </div>

        <ResumenOrden
          orden={orden}
          etiquetaTotal={orden.estado === 'pagada' ? 'Total pagado' : 'Monto no pagado'}
        />
      </div>
    </div>
  );
}
