import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerOrdenes } from '../../data/ordenes';

export default function AdminOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todas');

  useEffect(() => {
    // Carga las órdenes desde la capa de datos
    const lista = obtenerOrdenes();
    setOrdenes(lista || []);
  }, []);

  const ordenesFiltradas = ordenes.filter((o) => {
    if (filtroEstado === 'todas') return true;
    return o.estado?.toLowerCase() === filtroEstado.toLowerCase();
  });

  const formatearCLP = (monto) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto || 0);

  return (
    <div className="container-fluid text-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-info mb-1">
            <i className="bi bi-receipt me-2"></i>Gestión de Órdenes y Boletas
          </h2>
          <p className="text-secondary mb-0">
            Revisa las compras realizadas por los clientes y sus comprobantes de pago.
          </p>
        </div>
        <span className="badge bg-dark border border-info fs-6 px-3 py-2">
          Total órdenes: {ordenes.length}
        </span>
      </div>

      {/* Filtro por estado */}
      <div className="card bg-dark border-secondary mb-4 p-3">
        <div className="row g-3 align-items-center">
          <div className="col-auto">
            <label className="fw-semibold text-secondary">Filtrar por estado:</label>
          </div>
          <div className="col-auto">
            <select
              className="form-select bg-dark text-light border-secondary"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todas">Todas las órdenes</option>
              <option value="completada">Completadas</option>
              <option value="pendiente">Pendientes</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Órdenes */}
      <div className="card bg-dark border-secondary shadow-sm">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="border-bottom border-secondary text-info">
                <th>N° Orden</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Email</th>
                <th>Total</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No hay órdenes registradas con este criterio.
                  </td>
                </tr>
              ) : (
                ordenesFiltradas.map((ord) => (
                  <tr key={ord.id || ord.numeroOrden}>
                    <td className="fw-bold text-info">#{ord.id || ord.numeroOrden}</td>
                    <td>{ord.fecha ? new Date(ord.fecha).toLocaleDateString('es-CL') : 'N/A'}</td>
                    <td>{ord.cliente?.nombre || ord.nombreCliente || 'Cliente'}</td>
                    <td className="small text-secondary">{ord.cliente?.email || ord.email || 'N/A'}</td>
                    <td className="fw-bold text-success">{formatearCLP(ord.total)}</td>
                    <td>
                      <span
                        className={`badge ${
                          ord.estado?.toLowerCase() === 'completada'
                            ? 'bg-success'
                            : ord.estado?.toLowerCase() === 'pendiente'
                            ? 'bg-warning text-dark'
                            : 'bg-secondary'
                        }`}
                      >
                        {ord.estado || 'Completada'}
                      </span>
                    </td>
                    <td className="text-center">
                      <Link
                        to={`/admin/ordenes/${ord.id || ord.numeroOrden}`}
                        className="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1"
                      >
                        <i className="bi bi-eye"></i> Ver Boleta
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}