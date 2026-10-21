import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerProductos, obtenerProductosCriticos } from '../../data/productos';

export default function AdminDashboard() {
  const [productos, setProductos] = useState([]);
  const [criticos, setCriticos] = useState([]);

  useEffect(() => {
    setProductos(obtenerProductos());
    setCriticos(obtenerProductosCriticos());
  }, []);

  return (
    <div className="container-fluid my-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary">
        <div>
          <h2 className="text-info fw-bold mb-0">
            <i className="bi bi-speedometer2 me-2"></i>Panel de Administración
          </h2>
          <small className="text-secondary">Resumen general y métricas del sistema Level-Up Gamer</small>
        </div>
        <Link to="/admin/productos" className="btn btn-primary fw-bold">
          <i className="bi bi-box-seam me-2"></i>Gestionar Inventario
        </Link>
      </div>

      {/* Tarjetas de Métricas (Inspiradas en Figura 9) */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-4">
          <div className="card bg-primary text-white p-3 shadow-sm border-0">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-uppercase small mb-1">Órdenes Realizadas</h6>
                <h2 className="fw-bold mb-0">1,234</h2>
                <small className="text-light opacity-75">+20% esta semana</small>
              </div>
              <i className="bi bi-cart-check fs-1 opacity-50"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card bg-success text-white p-3 shadow-sm border-0">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-uppercase small mb-1">Total Productos</h6>
                <h2 className="fw-bold mb-0">{productos.length}</h2>
                <small className="text-light opacity-75">En catálogo activo</small>
              </div>
              <i className="bi bi-boxes fs-1 opacity-50"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card bg-danger text-white p-3 shadow-sm border-0">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-uppercase small mb-1">Stock Crítico</h6>
                <h2 className="fw-bold mb-0">{criticos.length}</h2>
                <small className="text-light opacity-75">Requieren reposición urgente</small>
              </div>
              <i className="bi bi-exclamation-triangle fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Listado de Productos Críticos (Requerimiento explícito del flujo admin) */}
      <div className="card shadow-sm border-secondary mb-4">
        <div className="card-header bg-dark border-secondary d-flex justify-content-between align-items-center py-3">
          <h5 className="text-warning fw-bold mb-0">
            <i className="bi bi-bell-fill me-2"></i>Alertas de Inventario (Stock Crítico)
          </h5>
          <span className="badge bg-danger">{criticos.length} Productos</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="text-secondary small">
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Stock Actual</th>
                  <th>Umbral Crítico</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {criticos.length > 0 ? (
                  criticos.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-bold text-light">{item.nombre}</td>
                      <td>{item.categoria}</td>
                      <td className="text-danger fw-bold fs-5">{item.stock} u.</td>
                      <td className="text-secondary">{item.stockCritico} u.</td>
                      <td>
                        <span className="badge bg-danger">Bajo Stock</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-secondary">
                      No hay productos con stock crítico en este momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}