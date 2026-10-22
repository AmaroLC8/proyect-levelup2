import React, { useState, useEffect } from 'react';
import { obtenerCategorias, guardarCategorias } from '../../data/categorias';
import { obtenerProductos } from '../../data/productos';

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modoModal, setModoModal] = useState(null); // 'crear' | 'editar' | 'ver' | null
  const [categoriaSel, setCategoriaSel] = useState(null);

  // Estado del formulario
  const [form, setForm] = useState({
    id: '',
    nombre: '',
    descripcion: '',
    activa: true
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    setCategorias(obtenerCategorias() || []);
    setProductos(obtenerProductos() || []);
  };

  const handleAbrirCrear = () => {
    setForm({
      id: Date.now().toString(),
      nombre: '',
      descripcion: '',
      activa: true
    });
    setModoModal('crear');
  };

  const handleAbrirEditar = (cat) => {
    setCategoriaSel(cat);
    setForm({
      id: cat.id,
      nombre: cat.nombre || '',
      descripcion: cat.descripcion || '',
      activa: cat.activa ?? true
    });
    setModoModal('editar');
  };

  const handleAbrirVer = (cat) => {
    setCategoriaSel(cat);
    setModoModal('ver');
  };

  const handleCerrarModal = () => {
    setModoModal(null);
    setCategoriaSel(null);
  };

  const handleGuardar = (e) => {
    e.preventDefault();
    let listaActualizada = [...categorias];

    if (modoModal === 'crear') {
      listaActualizada.push({ ...form });
    } else if (modoModal === 'editar') {
      listaActualizada = listaActualizada.map((item) =>
        item.id === form.id ? { ...item, ...form } : item
      );
    }

    guardarCategorias(listaActualizada);
    setCategorias(listaActualizada);
    handleCerrarModal();
  };

  const handleEliminar = (idCat) => {
    const cantProds = productos.filter(
      (p) => (p.categoria || '').toLowerCase() === (categorias.find((c) => c.id === idCat)?.nombre || '').toLowerCase()
    ).length;

    if (cantProds > 0) {
      alert(`No se puede eliminar esta categoría porque tiene ${cantProds} producto(s) asociado(s).`);
      return;
    }

    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      const listaActualizada = categorias.filter((item) => item.id !== idCat);
      guardarCategorias(listaActualizada);
      setCategorias(listaActualizada);
    }
  };

  // Contar productos por categoría
  const contarProductosPorCategoria = (nombreCat) => {
    if (!nombreCat) return 0;
    return productos.filter(
      (p) => (p.categoria || '').toLowerCase() === nombreCat.toLowerCase()
    ).length;
  };

  // Filtro de búsqueda
  const categoriasFiltradas = categorias.filter((c) =>
    (c.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container-fluid text-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-info mb-1">
            <i className="bi bi-tags me-2"></i>Gestión de Categorías
          </h2>
          <p className="text-secondary mb-0">
            Organiza las familias de productos para la navegación de la tienda.
          </p>
        </div>
        <button className="btn btn-info fw-semibold" onClick={handleAbrirCrear}>
          <i className="bi bi-plus-circle me-2"></i>Nueva Categoría
        </button>
      </div>

      {/* Búsqueda */}
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
                placeholder="Buscar categoría..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6 text-md-end">
            <span className="badge bg-secondary">
              Total categorías: {categorias.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de Categorías */}
      <div className="card bg-dark border-secondary shadow-sm">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="border-bottom border-secondary text-info">
                <th>Categoría</th>
                <th>Descripción</th>
                <th className="text-center">Productos Asociados</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No se encontraron categorías.
                  </td>
                </tr>
              ) : (
                categoriasFiltradas.map((cat) => {
                  const numProds = contarProductosPorCategoria(cat.nombre);
                  return (
                    <tr key={cat.id}>
                      <td className="fw-bold text-light">
                        <i className="bi bi-tag-fill me-2 text-info"></i>
                        {cat.nombre}
                      </td>
                      <td className="text-secondary small">{cat.descripcion || 'Sin descripción.'}</td>
                      <td className="text-center">
                        <span className="badge bg-dark border border-info text-info">
                          {numProds} producto(s)
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${cat.activa ? 'bg-success' : 'bg-secondary'}`}>
                          {cat.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-info"
                            title="Ver Detalle"
                            onClick={() => handleAbrirVer(cat)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-outline-warning"
                            title="Editar"
                            onClick={() => handleAbrirEditar(cat)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            title="Eliminar"
                            onClick={() => handleEliminar(cat.id)}
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
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-light border-info">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold text-info">
                  {modoModal === 'crear' && <><i className="bi bi-plus-circle me-2"></i>Nueva Categoría</>}
                  {modoModal === 'editar' && <><i className="bi bi-pencil-square me-2"></i>Editar Categoría</>}
                  {modoModal === 'ver' && <><i className="bi bi-eye me-2"></i>Detalle de Categoría</>}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCerrarModal}></button>
              </div>

              {modoModal === 'ver' ? (
                <div className="modal-body">
                  <h4 className="fw-bold text-info mb-2">{categoriaSel?.nombre}</h4>
                  <p className="text-secondary">{categoriaSel?.descripcion || 'Sin descripción.'}</p>
                  <ul className="list-group list-group-flush bg-dark text-light">
                    <li className="list-group-item bg-dark text-light border-secondary">
                      <strong>Estado:</strong> {categoriaSel?.activa ? 'Activa' : 'Inactiva'}
                    </li>
                    <li className="list-group-item bg-dark text-light border-secondary">
                      <strong>Productos en el catálogo:</strong> {contarProductosPorCategoria(categoriaSel?.nombre)}
                    </li>
                  </ul>
                </div>
              ) : (
                <form onSubmit={handleGuardar}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label text-secondary small fw-bold">Nombre de la Categoría</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary"
                        required
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-secondary small fw-bold">Descripción</label>
                      <textarea
                        className="form-control bg-dark text-light border-secondary"
                        rows="3"
                        value={form.descripcion}
                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="switchActiva"
                        checked={form.activa}
                        onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                      />
                      <label className="form-check-label text-light fw-semibold" htmlFor="switchActiva">
                        Categoría Activa
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer border-secondary">
                    <button type="button" className="btn btn-outline-secondary" onClick={handleCerrarModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-info fw-bold">
                      {modoModal === 'crear' ? 'Crear Categoría' : 'Guardar Cambios'}
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
