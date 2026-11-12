import React, { useEffect, useState } from 'react';
import { obtenerReporteVentas } from '../../services/reportesService';
import { formatearDinero } from '../../utils/formato';
import Button from '../../components/Button';
import EstadoCarga from '../../components/EstadoCarga';

export default function AdminReportes() {
  // Reporte de ventas (RF19): lo calcula el backend en GET /reportes/ventas.
  // Solo las boletas PAGADAS cuentan como ventas; las rechazadas solo aparecen en pagosRechazados.
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerReporteVentas()
      .then((datos) => setReporte(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  // Mientras no hay reporte se usan listas vacías, así la página se dibuja igual
  const ventasPorCategoria = reporte?.ventasPorCategoria ?? []; // [{ categoria, monto }], de mayor a menor
  const rankingProductos = reporte?.rankingProductos ?? []; // [{ productoId, nombre, unidades, monto }]

  // El % de cada categoría se calcula sobre la suma de las categorías (montos antes del descuento Duoc)
  const totalPorCategorias = ventasPorCategoria.reduce((suma, fila) => suma + fila.monto, 0);

  const kpis = reporte
    ? [
        { titulo: 'Ingresos totales', valor: formatearDinero(reporte.ingresosTotales), nota: `${reporte.ordenesPagadas} órdenes pagadas`, color: 'success' },
        { titulo: 'Ticket promedio', valor: formatearDinero(reporte.ticketPromedio), nota: 'Por compra pagada', color: 'info' },
        { titulo: 'Unidades vendidas', valor: `${reporte.unidadesVendidas} un.`, nota: `${reporte.pagosRechazados} pagos rechazados`, color: 'light' },
        { titulo: 'Descuentos Duoc', valor: formatearDinero(reporte.totalDescuentos), nota: 'Ahorro de clientes', color: 'warning' },
      ]
    : [];

  return (
    <div className="container-fluid text-light">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h2 className="fw-bold text-info mb-1">
            <i className="bi bi-graph-up-arrow me-2"></i>Reportes e Informes de Ventas
          </h2>
          <p className="text-secondary mb-0">
            Análisis de ventas, volumen y productos más populares.
          </p>
        </div>

        <Button variant="outline-info" size="sm" icon="printer" onClick={() => window.print()}>
          Imprimir Informe
        </Button>
      </div>

      <EstadoCarga cargando={cargando} error={error} />

      {reporte && (
      <>
      <div className="row g-3 mb-4">
        {kpis.map((kpi) => (
          <div className="col-12 col-sm-6 col-xl-3" key={kpi.titulo}>
            <div className="card bg-dark border-secondary shadow-sm p-3 h-100">
              <span className="text-secondary small fw-bold text-uppercase">{kpi.titulo}</span>
              <h3 className={`fw-bold text-${kpi.color} mt-2 mb-0`}>{kpi.valor}</h3>
              <small className="text-secondary mt-1">{kpi.nota}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card bg-dark border-secondary h-100 p-3">
            <h5 className="fw-bold text-info mb-3">
              <i className="bi bi-pie-chart me-2"></i>Ventas por Categoría
            </h5>
            {totalPorCategorias === 0 ? (
              <p className="text-secondary text-center py-4">No hay ventas registradas aún.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {/* El backend ya las entrega ordenadas de mayor a menor */}
                {ventasPorCategoria.map(({ categoria, monto }) => {
                  const pct = Math.round((monto / totalPorCategorias) * 100);
                  return (
                    <div key={categoria}>
                      <div className="d-flex justify-content-between text-light small mb-1">
                        <span className="fw-semibold">{categoria}</span>
                        <span>{formatearDinero(monto)} ({pct}%)</span>
                      </div>
                      <div className="progress bg-secondary" style={{ height: '8px' }}>
                        <div className="progress-bar bg-info" role="progressbar" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="card bg-dark border-secondary h-100 p-3">
            <h5 className="fw-bold text-info mb-3">
              <i className="bi bi-trophy me-2"></i>Top 5 Productos Más Vendidos
            </h5>
            {rankingProductos.length === 0 ? (
              <p className="text-secondary text-center py-4">No hay datos de ventas disponibles.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr className="text-secondary small border-bottom border-secondary">
                      <th>#</th>
                      <th>Producto</th>
                      <th className="text-center">Cant. Vendida</th>
                      <th className="text-end">Total Recaudado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingProductos.map((prod, idx) => (
                      <tr key={prod.productoId}>
                        <td className="fw-bold text-info">{idx + 1}</td>
                        <td className="fw-semibold">{prod.nombre}</td>
                        <td className="text-center">
                          <span className="badge bg-primary">{prod.unidades} un.</span>
                        </td>
                        <td className="text-end fw-bold text-success">{formatearDinero(prod.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
