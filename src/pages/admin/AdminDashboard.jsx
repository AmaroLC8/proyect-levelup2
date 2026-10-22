import React from 'react';
import { Link } from 'react-router-dom';
import { obtenerOrdenes, obtenerOrdenesPagadas, ordenarPorFechaDesc } from '../../data/ordenes';
import { obtenerProductos, obtenerProductosCriticos } from '../../data/productos';
import { obtenerUsuarios } from '../../data/usuarios';
import { formatearDinero } from '../../utils/formato';
import EstadoOrden from '../../components/EstadoOrden';

// Accesos a cada sección del panel (Figura 9 de la pauta)
const SECCIONES = [
  { to: '/admin/ordenes', titulo: 'Órdenes', texto: 'Compras realizadas y boletas.', icono: 'bi-receipt' },
  { to: '/admin/productos', titulo: 'Productos', texto: 'Inventario, precios y ofertas.', icono: 'bi-box-seam' },
  { to: '/admin/categorias', titulo: 'Categorías', texto: 'Organiza el catálogo de la tienda.', icono: 'bi-tags' },
  { to: '/admin/usuarios', titulo: 'Usuarios', texto: 'Cuentas, roles e historial.', icono: 'bi-people' },
  { to: '/admin/reportes', titulo: 'Reportes', texto: 'Ventas y productos más vendidos.', icono: 'bi-bar-chart' },
  { to: '/admin/perfil', titulo: 'Perfil', texto: 'Tus datos de administrador.', icono: 'bi-person-badge' },
];

export default function AdminDashboard() {
  // Métricas calculadas en cada render a partir de los datos guardados (RF13)
  const ordenes = obtenerOrdenes();
  const totalVentas = obtenerOrdenesPagadas().reduce((acc, ord) => acc + ord.total, 0);
  const totalProductos = obtenerProductos().length;
  const totalUsuarios = obtenerUsuarios().length;
  const criticos = obtenerProductosCriticos();
  const ultimasOrdenes = ordenarPorFechaDesc(ordenes).slice(0, 5);

  const kpis = [
    { titulo: 'Ventas totales', valor: formatearDinero(totalVentas), icono: 'bi-currency-dollar', color: 'success' },
    { titulo: 'Órdenes realizadas', valor: ordenes.length, icono: 'bi-receipt', color: 'info' },
    { titulo: 'Productos en catálogo', valor: totalProductos, icono: 'bi-box-seam', color: 'primary' },
    { titulo: 'Usuarios registrados', valor: totalUsuarios, icono: 'bi-people', color: 'warning' },
  ];

  return (
    <div className="container-fluid text-light">
      <div className="mb-4">
        <h2 className="fw-bold text-info mb-1">
          <i className="bi bi-speedometer2 me-2"></i>Panel de Administración
        </h2>
        <p className="text-secondary">Resumen de las actividades de Level-Up Gamer.</p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="row g-3 mb-4">
        {kpis.map((kpi) => (
          <div className="col-12 col-sm-6 col-xl-3" key={kpi.titulo}>
            <div className={`card bg-dark border-${kpi.color} shadow-sm h-100 p-3`}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-secondary small fw-semibold text-uppercase">{kpi.titulo}</span>
                  <h3 className={`fw-bold text-${kpi.color} mb-0`}>{kpi.valor}</h3>
                </div>
                <i className={`bi ${kpi.icono} fs-2 text-${kpi.color} opacity-75`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Accesos a las secciones */}
      <div className="row g-3 mb-4">
        {SECCIONES.map((seccion) => (
          <div className="col-6 col-md-4 col-xl-2" key={seccion.to}>
            <Link
              to={seccion.to}
              className="card bg-dark border-secondary h-100 p-3 text-center text-decoration-none text-light"
            >
              <i className={`bi ${seccion.icono} fs-3 text-info`}></i>
              <span className="fw-bold mt-2">{seccion.titulo}</span>
              <small className="text-secondary">{seccion.texto}</small>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Últimas órdenes */}
        <div className="col-lg-7">
          <div className="card bg-dark border-secondary h-100">
            <div className="card-header bg-dark border-secondary d-flex justify-content-between align-items-center py-3">
              <h5 className="fw-bold text-info mb-0">
                <i className="bi bi-clock-history me-2"></i>Últimas Órdenes
              </h5>
              <Link to="/admin/ordenes" className="btn btn-sm btn-outline-info">
                Ver todas
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr className="text-secondary small border-bottom border-secondary">
                    <th>N° Orden</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th className="text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasOrdenes.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-secondary">
                        No hay compras registradas aún.
                      </td>
                    </tr>
                  ) : (
                    ultimasOrdenes.map((ord) => (
                      <tr key={ord.id}>
                        <td>
                          <Link to={`/admin/ordenes/${ord.id}`} className="fw-bold text-info text-decoration-none">
                            #{ord.numeroOrden}
                          </Link>
                        </td>
                        <td>{ord.cliente.nombre} {ord.cliente.apellidos}</td>
                        <td className="fw-bold text-success">{formatearDinero(ord.total)}</td>
                        <td className="text-center"><EstadoOrden estado={ord.estado} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Productos con stock igual o menor a su stock crítico (RF15) */}
        <div className="col-lg-5">
          <div className="card bg-dark border-secondary h-100">
            <div className="card-header bg-dark border-secondary d-flex justify-content-between align-items-center py-3">
              <h5 className="fw-bold text-warning mb-0">
                <i className="bi bi-exclamation-circle me-2"></i>Alertas de inventario
              </h5>
              <span className="badge bg-danger">{criticos.length} críticos</span>
            </div>
            <div className="card-body p-0">
              {criticos.length === 0 ? (
                <div className="p-4 text-center text-secondary">
                  <i className="bi bi-check-circle fs-2 d-block mb-2 text-success"></i>
                  Inventario en niveles óptimos.
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {criticos.map((prod) => (
                    <li
                      key={prod.id}
                      className="list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <span className="fw-semibold d-block">{prod.nombre}</span>
                        <small className="text-secondary">
                          {prod.categoria} · crítico: {prod.stockCritico} u.
                        </small>
                      </div>
                      <span className="badge bg-danger fs-6 px-2 py-1">Stock: {prod.stock}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card-footer bg-dark border-secondary text-end">
              <Link to="/admin/productos?criticos=1" className="btn btn-sm btn-outline-warning">
                Gestionar inventario
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
