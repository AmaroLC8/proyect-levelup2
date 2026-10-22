import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerOrdenes } from '../../data/ordenes';
import { obtenerProductos } from '../../data/productos';

export default function AdminDashboard() {
  const [ordenes, setOrdenes] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    // Cargamos la información real acumulada en la aplicación
    const listaOrdenes = obtenerOrdenes() || [];
    const listaProductos = obtenerProductos() || [];

    setOrdenes(listaOrdenes);
    setProductos(listaProductos);
  }, []);

  // 1. Cálculo de Métricas Clave
  const totalVentas = ordenes.reduce((acc, ord) => acc + (ord.total || 0), 0);
  const totalOrdenes = ordenes.length;
  const totalProductos = productos.length;
  const productosStockCritico = productos.filter((p) => (p.stock ?? 0) <= 5);

  // Formateador de moneda CLP
  const formatearCLP = (monto) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto || 0);

  return (
    <div className="container-fluid text-light">
      {/* Título de la vista */}
      <div className="mb-4">
        <h2 className="fw-bold text-info mb-1">
          <i className="bi bi-speedometer2 me-2"></i>Dashboard Principal
        </h2>
        <p className="text-secondary">
          Métricas clave en tiempo real y resumen operativo de Level-Up Gamer.
        </p>
      </div>

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="row g-3 mb-4">
        {/* KPI 1: Ventas Totales */}
        <div className="col-md-3">
          <div className="card bg-dark border-info shadow-sm h-100 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-secondary small fw-semibold">VENTAS TOTALES</span>
                <h3 className="fw-bold text-success mb-0">{formatearCLP(totalVentas)}</h3>
              </div>
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle fs-3">
                <i className="bi bi-currency-dollar"></i>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Órdenes */}
        <div className="col-md-3">
          <div className="card bg-dark border-secondary shadow-sm h-100 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-secondary small fw-semibold">ÓRDENEN REALIZADAS</span>
                <h3 className="fw-bold text-light mb-0">{totalOrdenes}</h3>
              </div>
              <div className="bg-info bg-opacity-10 text-info p-3 rounded-circle fs-3">
                <i className="bi bi-receipt"></i>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3: Productos en Catálogo */}
        <div className="col-md-3">
          <div className="card bg-dark border-secondary shadow-sm h-100 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-secondary small fw-semibold">PRODUCTOS EN CATALOGO</span>
                <h3 className="fw-bold text-light mb-0">{totalProductos}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle fs-3">
                <i className="bi bi-box-seam"></i>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 4: Stock Crítico */}
        <div className="col-md-3">
          <div className="card bg-dark border-warning shadow-sm h-100 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-secondary small fw-semibold">STOCK CRÍTICO</span>
                <h3 className="fw-bold text-warning mb-0">{productosStockCritico.length}</h3>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle fs-3">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablas Resumen: Últimas Órdenes y Stock Crítico */}
      <div className="row g-4">
        {/* Tabla: Últimas Órdenes */}
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
                  {ordenes.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        No hay compras registradas aún.
                      </td>
                    </tr>
                  ) : (
                    ordenes.slice(0, 5).map((ord) => (
                      <tr key={ord.id || ord.numeroOrden}>
                        <td className="fw-bold text-info">#{ord.id || ord.numeroOrden}</td>
                        <td>{ord.cliente?.nombre || ord.nombreCliente || 'Cliente'}</td>
                        <td className="fw-bold text-success">{formatearCLP(ord.total)}</td>
                        <td className="text-center">
                          <span className="badge bg-success">Completada</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Alerta: Productos con Bajo Stock */}
        <div className="col-lg-5">
          <div className="card bg-dark border-secondary h-100">
            <div className="card-header bg-dark border-secondary d-flex justify-content-between align-items-center py-3">
              <h5 className="fw-bold text-warning mb-0">
                <i className="bi bi-exclamation-circle me-2"></i>Bajo Inventario (≤ 5)
              </h5>
              <Link to="/admin/productos" className="btn btn-sm btn-outline-warning">
                Gestionar
              </Link>
            </div>
            <div className="card-body p-0">
              {productosStockCritico.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-check-circle fs-2 d-block mb-2 text-success"></i>
                  Inventario en niveles óptimos.
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {productosStockCritico.map((prod) => (
                    <li
                      key={prod.id}
                      className="list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <span className="fw-semibold d-block">{prod.nombre || prod.titulo}</span>
                        <small className="text-secondary">Categoría: {prod.categoria || 'Gamer'}</small>
                      </div>
                      <span className="badge bg-danger fs-6 px-2 py-1">
                        Stock: {prod.stock}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}