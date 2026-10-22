import React, { useState, useEffect } from 'react';
import { obtenerOrdenes } from '../../data/ordenes';
import { obtenerProductos } from '../../data/productos';
import { formatearDinero } from '../../utils/formatters';
import Button from '../../components/Button';

export default function AdminReportes() {
  const [ordenes, setOrdenes] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    setOrdenes(obtenerOrdenes() || []);
    setProductos(obtenerProductos() || []);
  }, []);

  // 1. Cálculos de métricas clave
  const totalVentas = ordenes.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalOrdenes = ordenes.length;
  const ticketPromedio = totalOrdenes > 0 ? totalVentas / totalOrdenes : 0;
  const totalDescuentos = ordenes.reduce((acc, o) => acc + (o.descuento || 0), 0);

  // 2. Unidades vendidas acumuladas
  const unidadesVendidas = ordenes.reduce((acc, o) => {
    const cantItems = (o.items || []).reduce((sum, item) => sum + (item.cantidad || 1), 0);
    return acc + cantItems;
  }, 0);

  // 3. Distribución de ingresos por categoría
  const ventasPorCategoria = ordenes.reduce((acc, o) => {
    (o.items || []).forEach((item) => {
      const cat = item.categoria || 'General';
      const montoItem = (item.precio || 0) * (item.cantidad || 1);
      acc[cat] = (acc[cat] || 0) + montoItem;
    });
    return acc;
  }, {});

  // 4. Ranking de productos más vendidos
  const conteoProductos = ordenes.reduce((acc, o) => {
    (o.items || []).forEach((item) => {
      const nombre = item.nombre || item.titulo || 'Producto';
      if (!acc[nombre]) {
        acc[nombre] = { nombre, cantidad: 0, total: 0 };
      }
      acc[nombre].cantidad += item.cantidad || 1;
      acc[nombre].total += (item.precio || 0) * (item.cantidad || 1);
    });
    return acc;
  }, {});

  const rankingProductos = Object.values(conteoProductos)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  return (
    <div className="container-fluid text-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-info mb-1">
            <i className="bi bi-graph-up-arrow me-2"></i>Reportes e Informes de Ventas
          </h2>
          <p className="text-secondary mb-0">
            Análisis financiero, volumen de ventas y productos más populares.
          </p>
        </div>
        
        {/* Uso del componente reutilizable Button */}
        <Button
          variant="outline-info"
          size="sm"
          icon="printer"
          onClick={() => window.print()}
        >
          Imprimir Informe
        </Button>
      </div>

      {/* Tarjetas KPI usando el helper formatearDinero */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-dark border-info shadow-sm p-3 h-100">
            <span className="text-secondary small fw-bold">INGRESOS TOTALES</span>
            <h3 className="fw-bold text-success mt-2 mb-0">{formatearDinero(totalVentas)}</h3>
            <small className="text-muted mt-1">Bruto acumulado</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark border-secondary shadow-sm p-3 h-100">
            <span className="text-secondary small fw-bold">TICKET PROMEDIO</span>
            <h3 className="fw-bold text-info mt-2 mb-0">{formatearDinero(ticketPromedio)}</h3>
            <small className="text-muted mt-1">Por compra realizada</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark border-secondary shadow-sm p-3 h-100">
            <span className="text-secondary small fw-bold">UNIDADES VENDIDAS</span>
            <h3 className="fw-bold text-light mt-2 mb-0">{unidadesVendidas} un.</h3>
            <small className="text-muted mt-1">En {totalOrdenes} órdenes</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark border-warning shadow-sm p-3 h-100">
            <span className="text-secondary small fw-bold">DESCUENTOS DUOC / PUNTOS</span>
            <h3 className="fw-bold text-warning mt-2 mb-0">{formatearDinero(totalDescuentos)}</h3>
            <small className="text-muted mt-1">Ahorro clientes</small>
          </div>
        </div>
      </div>

      {/* Resumen por Categoría y Ranking */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card bg-dark border-secondary h-100 p-3">
            <h5 className="fw-bold text-info mb-3">
              <i className="bi bi-pie-chart me-2"></i>Ventas por Categoría
            </h5>
            {Object.keys(ventasPorCategoria).length === 0 ? (
              <p className="text-muted text-center py-4">No hay ventas registradas aún.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {Object.entries(ventasPorCategoria).map(([cat, monto]) => {
                  const pct = totalVentas > 0 ? Math.round((monto / totalVentas) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="d-flex justify-content-between text-light small mb-1">
                        <span className="fw-semibold">{cat}</span>
                        <span>{formatearDinero(monto)} ({pct}%)</span>
                      </div>
                      <div className="progress bg-secondary" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-info"
                          role="progressbar"
                          style={{ width: `${pct}%` }}
                        ></div>
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
              <p className="text-muted text-center py-4">No hay datos de ventas disponibles.</p>
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
                      <tr key={idx}>
                        <td className="fw-bold text-info">{idx + 1}</td>
                        <td className="fw-semibold">{prod.nombre}</td>
                        <td className="text-center">
                          <span className="badge bg-primary">{prod.cantidad} un.</span>
                        </td>
                        <td className="text-end fw-bold text-success">
                          {formatearDinero(prod.total)}
                        </td>
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