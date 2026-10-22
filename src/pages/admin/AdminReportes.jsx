import React from 'react';
import { obtenerOrdenes, obtenerOrdenesPagadas } from '../../data/ordenes';
import { obtenerProductoPorId } from '../../data/productos';
import { formatearDinero } from '../../utils/formato';
import Button from '../../components/Button';

export default function AdminReportes() {
  // Solo las órdenes pagadas cuentan como ventas (RF19)
  const ordenes = obtenerOrdenesPagadas();
  const rechazadas = obtenerOrdenes().length - ordenes.length;

  // 1. Cálculos de métricas clave
  const totalVentas = ordenes.reduce((acc, o) => acc + o.total, 0);
  const totalOrdenes = ordenes.length;
  const ticketPromedio = totalOrdenes > 0 ? Math.round(totalVentas / totalOrdenes) : 0;
  const totalDescuentos = ordenes.reduce((acc, o) => acc + (o.descuento || 0), 0);

  const todosLosItems = ordenes.flatMap((o) => o.items);
  const unidadesVendidas = todosLosItems.reduce((acc, item) => acc + item.cantidad, 0);

  // 2. Ingresos por categoría: la orden no guarda la categoría, se busca en el producto
  const ventasPorCategoria = todosLosItems.reduce((acc, item) => {
    const cat = obtenerProductoPorId(item.id)?.categoria ?? 'Producto eliminado';
    acc[cat] = (acc[cat] || 0) + item.precio * item.cantidad;
    return acc;
  }, {});
  const totalPorCategorias = Object.values(ventasPorCategoria).reduce((a, b) => a + b, 0);

  // 3. Ranking de productos más vendidos
  const conteoProductos = todosLosItems.reduce((acc, item) => {
    if (!acc[item.id]) acc[item.id] = { nombre: item.nombre, cantidad: 0, total: 0 };
    acc[item.id].cantidad += item.cantidad;
    acc[item.id].total += item.precio * item.cantidad;
    return acc;
  }, {});

  const rankingProductos = Object.values(conteoProductos)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  const kpis = [
    { titulo: 'Ingresos totales', valor: formatearDinero(totalVentas), nota: `${totalOrdenes} órdenes pagadas`, color: 'success' },
    { titulo: 'Ticket promedio', valor: formatearDinero(ticketPromedio), nota: 'Por compra pagada', color: 'info' },
    { titulo: 'Unidades vendidas', valor: `${unidadesVendidas} un.`, nota: `${rechazadas} pagos rechazados`, color: 'light' },
    { titulo: 'Descuentos Duoc', valor: formatearDinero(totalDescuentos), nota: 'Ahorro de clientes', color: 'warning' },
  ];

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
                {Object.entries(ventasPorCategoria)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, monto]) => {
                    const pct = Math.round((monto / totalPorCategorias) * 100);
                    return (
                      <div key={cat}>
                        <div className="d-flex justify-content-between text-light small mb-1">
                          <span className="fw-semibold">{cat}</span>
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
                      <tr key={prod.nombre}>
                        <td className="fw-bold text-info">{idx + 1}</td>
                        <td className="fw-semibold">{prod.nombre}</td>
                        <td className="text-center">
                          <span className="badge bg-primary">{prod.cantidad} un.</span>
                        </td>
                        <td className="text-end fw-bold text-success">{formatearDinero(prod.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
