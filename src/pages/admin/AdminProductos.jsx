import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  esOferta,
} from '../../data/productos';
import { obtenerCategorias } from '../../data/categorias';
import { formatearDinero } from '../../utils/formato';

export default function AdminProductos() {
  // ?criticos=1 llega desde el dashboard para abrir el listado de productos críticos (RF15)
  const [searchParams] = useSearchParams();
  const [productos, setProductos] = useState(() => obtenerProductos());
  const [filtro, setFiltro] = useState('');
  const [soloCriticos, setSoloCriticos] = useState(searchParams.get('criticos') === '1');
  const [modoModal, setModoModal] = useState(null); // 'crear' | 'editar' | 'ver' | null
  const [productoSel, setProductoSel] = useState(null);
  const [error, setError] = useState('');
  const categorias = obtenerCategorias();

  // Estado del formulario
  const [form, setForm] = useState({
    id: null,
    nombre: '',
    categoria: '',
    precio: '',
    precioOferta: '',
    stock: '',
    stockCritico: 5,
    descripcion: '',
    imagen: ''
  });

  const recargarProductos = () => setProductos(obtenerProductos());

  const handleAbrirCrear = () => {
    setForm({
      id: null,
      nombre: '',
      categoria: categorias[0]?.nombre ?? '',
      precio: '',
      precioOferta: '',
      stock: '',
      stockCritico: 5,
      descripcion: '',
      imagen: ''
    });
    setError('');
    setModoModal('crear');
  };

  const handleAbrirEditar = (prod) => {
    setProductoSel(prod);
    setForm({
      id: prod.id,
      nombre: prod.nombre,
      categoria: prod.categoria,
      precio: prod.precio,
      precioOferta: prod.precioOferta || '',
      stock: prod.stock,
      stockCritico: prod.stockCritico ?? 5,
      descripcion: prod.descripcion || '',
      imagen: prod.imagen || ''
    });
    setError('');
    setModoModal('editar');
  };

  const handleAbrirVer = (prod) => {
    setProductoSel(prod);
    setModoModal('ver');
  };

  const handleCerrarModal = () => {
    setModoModal(null);
    setProductoSel(null);
  };

  const handleGuardar = (evento) => {
    evento.preventDefault();

    if (form.precioOferta && Number(form.precioOferta) >= Number(form.precio)) {
      setError('El precio de oferta debe ser menor al precio base');
      return;
    }

    // El CRUD de data/productos.js convierte los números y asigna id e imagen por defecto
    const { id, ...datos } = form;
    if (modoModal === 'crear') {
      crearProducto(datos);
    } else if (modoModal === 'editar') {
      actualizarProducto(id, datos);
    }

    recargarProductos();
    handleCerrarModal();
  };

  const handleEliminar = (idProducto) => {
    if (window.confirm('¿Estás seguro de eliminar este producto del inventario?')) {
      eliminarProducto(idProducto);
      recargarProductos();
    }
  };

  const productosFiltrados = productos.filter((item) => {
    const nombre = (item.nombre || item.titulo || '').toLowerCase();
    const cat = (item.categoria || '').toLowerCase();
    const coincideBusqueda = nombre.includes(filtro.toLowerCase()) || cat.includes(filtro.toLowerCase());
    
    const umbralCritico = item.stockCritico ?? 5;
    const esCritico = (item.stock ?? 0) <= umbralCritico;

    if (soloCriticos) {
      return coincideBusqueda && esCritico;
    }
    return coincideBusqueda;
  });

  return (
    <div className="container-fluid text-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-info mb-1">
            <i className="bi bi-box-seam me-2"></i>Gestión de Productos e Inventario
          </h2>
          <p className="text-secondary mb-0">
            Administra los artículos del catálogo, precios, ofertas y alertas de stock crítico.
          </p>
        </div>
        <button className="btn btn-info fw-semibold" onClick={handleAbrirCrear}>
          <i className="bi bi-plus-circle me-2"></i>Nuevo Producto
        </button>
      </div>

      {/* Barra de Búsqueda y Switch de Stock Crítico */}
      <div className="card bg-dark border-secondary mb-4 p-3">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                placeholder="Buscar por nombre o categoría..."
                value={filtro}
                onChange={(evento) => setFiltro(evento.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6 d-flex align-items-center justify-content-md-end">
            <div className="form-check form-switch me-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="checkCriticos"
                checked={soloCriticos}
                onChange={(evento) => setSoloCriticos(evento.target.checked)}
              />
              <label className="form-check-label text-warning fw-semibold" htmlFor="checkCriticos">
                <i className="bi bi-exclamation-triangle me-1"></i>Ver solo Stock Crítico
              </label>
            </div>
            <span className="badge bg-secondary">
              Mostrando: {productosFiltrados.length} / {productos.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="card bg-dark border-secondary shadow-sm">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="border-bottom border-secondary text-info">
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio Base</th>
                <th>Precio Oferta</th>
                <th>Stock</th>
                <th>Stock Crítico</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No se encontraron productos con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((prod) => {
                  const umbralCritico = prod.stockCritico ?? 5;
                  const enCritico = (prod.stock ?? 0) <= umbralCritico;

                  return (
                    <tr key={prod.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {prod.imagen && (
                            <img
                              src={prod.imagen}
                              alt={prod.nombre}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          )}
                          <div>
                            <span className="fw-semibold text-light d-block">{prod.nombre}</span>
                            <small className="text-secondary">ID: #{prod.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{prod.categoria}</span>
                      </td>
                      <td className="fw-bold">{formatearDinero(prod.precio)}</td>
                      <td>
                        {esOferta(prod) ? (
                          <span className="text-success fw-bold">{formatearDinero(prod.precioOferta)}</span>
                        ) : (
                          <span className="text-muted small">Sin Oferta</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${enCritico ? 'bg-danger' : 'bg-success'}`}>
                          {prod.stock ?? 0} un.
                        </span>
                      </td>
                      <td>
                        <span className="text-warning fw-semibold">{umbralCritico} un.</span>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-info"
                            title="Ver Detalle"
                            onClick={() => handleAbrirVer(prod)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-outline-warning"
                            title="Editar"
                            onClick={() => handleAbrirEditar(prod)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            title="Eliminar"
                            onClick={() => handleEliminar(prod.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Crear / Editar / Ver */}
      {modoModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark text-light border-info">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold text-info">
                  {modoModal === 'crear' && <><i className="bi bi-plus-circle me-2"></i>Nuevo Producto</>}
                  {modoModal === 'editar' && <><i className="bi bi-pencil-square me-2"></i>Editar Producto</>}
                  {modoModal === 'ver' && <><i className="bi bi-eye me-2"></i>Detalle de Producto</>}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCerrarModal}
                ></button>
              </div>

              {modoModal === 'ver' ? (
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-4 text-center">
                      <img
                        src={productoSel.imagen}
                        alt={productoSel.nombre}
                        className="img-fluid rounded border border-secondary bg-white"
                      />
                    </div>
                    <div className="col-md-8">
                      <h4 className="fw-bold text-info">{productoSel.nombre}</h4>
                      <p className="text-secondary">{productoSel?.descripcion || 'Sin descripción disponible.'}</p>
                      <ul className="list-group list-group-flush bg-dark text-light">
                        <li className="list-group-item bg-dark text-light border-secondary">
                          <strong>Categoría:</strong> {productoSel?.categoria}
                        </li>
                        <li className="list-group-item bg-dark text-light border-secondary">
                          <strong>Precio Base:</strong> {formatearDinero(productoSel?.precio)}
                        </li>
                        <li className="list-group-item bg-dark text-light border-secondary">
                          <strong>Precio Oferta:</strong>{' '}
                          {esOferta(productoSel) ? formatearDinero(productoSel.precioOferta) : 'Sin oferta'}
                        </li>
                        <li className="list-group-item bg-dark text-light border-secondary">
                          <strong>Stock Disponible:</strong> {productoSel?.stock} unidades
                        </li>
                        <li className="list-group-item bg-dark text-light border-secondary">
                          <strong>Umbral Stock Crítico:</strong> {productoSel?.stockCritico || 5} unidades
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGuardar}>
                  <div className="modal-body">
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    <div className="row g-3">
                      <div className="col-md-8">
                        <label className="form-label text-secondary small fw-bold">Nombre del Producto</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-light border-secondary"
                          required
                          value={form.nombre}
                          onChange={(evento) => setForm({ ...form, nombre: evento.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-secondary small fw-bold">Categoría</label>
                        <select
                          className="form-select bg-dark text-light border-secondary"
                          value={form.categoria}
                          onChange={(evento) => setForm({ ...form, categoria: evento.target.value })}
                        >
                          {categorias.map((cat) => (
                            <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-bold">Precio Base ($ CLP)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control bg-dark text-light border-secondary"
                          required
                          value={form.precio}
                          onChange={(evento) => setForm({ ...form, precio: evento.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-bold">Precio Oferta ($ CLP, opcional)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control bg-dark text-light border-secondary"
                          value={form.precioOferta}
                          onChange={(evento) => setForm({ ...form, precioOferta: evento.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-bold">Stock Actual</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control bg-dark text-light border-secondary"
                          required
                          value={form.stock}
                          onChange={(evento) => setForm({ ...form, stock: evento.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-warning small fw-bold">
                          <i className="bi bi-exclamation-triangle me-1"></i>Umbral Stock Crítico
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="form-control bg-dark text-light border-warning"
                          required
                          value={form.stockCritico}
                          onChange={(evento) => setForm({ ...form, stockCritico: evento.target.value })}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label text-secondary small fw-bold">URL Imagen del Producto</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-light border-secondary"
                          placeholder="Opcional: si la dejas vacía se usa una imagen por defecto"
                          value={form.imagen}
                          onChange={(evento) => setForm({ ...form, imagen: evento.target.value })}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label text-secondary small fw-bold">Descripción</label>
                        <textarea
                          className="form-control bg-dark text-light border-secondary"
                          rows="3"
                          value={form.descripcion}
                          onChange={(evento) => setForm({ ...form, descripcion: evento.target.value })}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-secondary">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCerrarModal}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-info fw-bold">
                      {modoModal === 'crear' ? 'Guardar Producto' : 'Actualizar Cambios'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
