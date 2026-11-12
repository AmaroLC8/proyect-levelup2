import React, { useEffect, useState } from 'react';
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from '../../services/categoriasService';
import { listarProductos } from '../../services/productosService';
import EstadoCarga from '../../components/EstadoCarga';

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]); // solo para contar los productos de cada categoría
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(''); // el backend no respondió al listar
  const [busqueda, setBusqueda] = useState('');
  const [modoModal, setModoModal] = useState(null); // 'crear' | 'editar' | 'ver' | null
  const [categoriaSel, setCategoriaSel] = useState(null);
  const [error, setError] = useState('');
  const [errorTabla, setErrorTabla] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Estado del formulario
  const [form, setForm] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    activa: true
  });

  // GET /categorias (todas, también las inactivas): después de crear, editar o eliminar
  const recargarCategorias = () =>
    listarCategorias()
      .then((datos) => setCategorias(datos))
      .catch((err) => setErrorCarga(err.message));

  // Al abrir la página se piden categorías y productos en paralelo
  useEffect(() => {
    Promise.all([listarCategorias(), listarProductos()])
      .then(([listaCategorias, listaProductos]) => {
        setCategorias(listaCategorias);
        setProductos(listaProductos);
      })
      .catch((err) => setErrorCarga(err.message))
      .finally(() => setCargando(false));
  }, []);

  // Cantidad de productos de una categoría. El producto trae su categoría como objeto,
  // así que se compara por id (antes se comparaba por nombre).
  const contarProductosPorCategoria = (idCategoria) =>
    productos.filter((p) => p.categoria?.id === idCategoria).length;

  const handleAbrirCrear = () => {
    setForm({
      id: null,
      nombre: '',
      descripcion: '',
      activa: true
    });
    setError('');
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
    setError('');
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

  // POST /categorias (crear) o PUT /categorias/{id} (editar).
  // El backend valida los nombres repetidos (409) y su mensaje se muestra en el modal.
  // Los productos guardan el id de la categoría, así que al renombrarla no hay que tocarlos.
  const handleGuardar = async (e) => {
    e.preventDefault();

    // Formato CategoriaRequest del backend: { nombre, descripcion, activa }
    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      activa: form.activa,
    };

    setGuardando(true);
    try {
      if (modoModal === 'crear') {
        await crearCategoria(datos);
      } else {
        await actualizarCategoria(form.id, datos);
      }
      await recargarCategorias();
      handleCerrarModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // DELETE /categorias/{id}
  const handleEliminar = async (cat) => {
    // No se permite eliminar categorías con productos asociados: se avisa sin preguntar ni llamar
    // a la API. El backend también lo revisa (409) por si los datos de la página están desactualizados.
    const cantidad = contarProductosPorCategoria(cat.id);
    if (cantidad > 0) {
      setErrorTabla(`No se puede eliminar: tiene ${cantidad} producto(s) asociado(s)`);
      return;
    }
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await eliminarCategoria(cat.id);
      setErrorTabla('');
      await recargarCategorias();
    } catch (err) {
      setErrorTabla(err.message);
    }
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

      <EstadoCarga cargando={cargando} error={errorCarga} />

      {errorTabla && (
        <div className="alert alert-danger py-2 d-flex justify-content-between align-items-center">
          {errorTabla}
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setErrorTabla('')}></button>
        </div>
      )}

      {/* Tabla de Categorías (cuando ya terminó la carga sin errores) */}
      {!cargando && !errorCarga && (
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
                  const numProds = contarProductosPorCategoria(cat.id);
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
                            onClick={() => handleEliminar(cat)}
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
      )}

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
                      <strong>Productos en el catálogo:</strong> {contarProductosPorCategoria(categoriaSel?.id)}
                    </li>
                  </ul>
                </div>
              ) : (
                <form onSubmit={handleGuardar}>
                  <div className="modal-body">
                    {error && <div className="alert alert-danger py-2">{error}</div>}
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
                      <div className="form-text text-secondary">Las categorías inactivas no se muestran en la tienda.</div>
                    </div>
                  </div>
                  <div className="modal-footer border-secondary">
                    <button type="button" className="btn btn-outline-secondary" onClick={handleCerrarModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-info fw-bold" disabled={guardando}>
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
