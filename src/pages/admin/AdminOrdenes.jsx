import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarBoletas } from '../../services/boletasService';
import { formatearDinero, formatearFecha } from '../../utils/formato';
import EstadoOrden from '../../components/EstadoOrden';
import EstadoCarga from '../../components/EstadoCarga';

// Lista de boletas para ADMIN y VENDEDOR (GET /boletas). El backend ya las entrega
// ordenadas de la más reciente a la más antigua.
export default function AdminOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');

  useEffect(() => {
    listarBoletas()
      .then((datos) => setOrdenes(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  // El estado viene del backend en mayúsculas: PAGADA o RECHAZADA
  const ordenesFiltradas = ordenes.filter(
    (o) => filtroEstado === 'todas' || o.estado === filtroEstado
  );

  return (
    <div className="container-fluid text-light">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
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
            <label htmlFor="filtroEstado" className="fw-semibold text-secondary">Filtrar por estado:</label>
          </div>
          <div className="col-auto">
            <select
              id="filtroEstado"
              className="form-select bg-dark text-light border-secondary"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todas">Todas las órdenes</option>
              <option value="PAGADA">Pagadas</option>
              <option value="RECHAZADA">Rechazadas</option>
            </select>
          </div>
        </div>
      </div>

      <EstadoCarga cargando={cargando} error={error} />

      {/* Tabla de Órdenes (cuando ya terminó la carga sin errores) */}
      {!cargando && !error && (
        <div className="card bg-dark border-secondary shadow-sm">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="border-bottom border-secondary text-info">
                  <th>N° Orden</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Correo</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-secondary">
                      No hay órdenes registradas con este criterio.
                    </td>
                  </tr>
                ) : (
                  ordenesFiltradas.map((ord) => (
                    <tr key={ord.id}>
                      <td className="fw-bold text-info">#{ord.numeroOrden}</td>
                      <td>{formatearFecha(ord.fecha)}</td>
                      {/* Datos del formulario de checkout guardados en la boleta (sirven también para visitantes) */}
                      <td>{ord.nombreCliente} {ord.apellidosCliente}</td>
                      <td className="small text-secondary">{ord.correoCliente}</td>
                      <td className="fw-bold text-success">{formatearDinero(ord.total)}</td>
                      <td><EstadoOrden estado={ord.estado} /></td>
                      <td className="text-center">
                        <Link
                          to={`/admin/ordenes/${ord.id}`}
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
      )}
    </div>
  );
}
