import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  esOferta,
} from '../../data/productos';

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  // Estado del formulario para crear/editar
  const [form, setForm] = useState({
    nombre: '',
    categoria: 'Consolas',
    precio: '',
    precioOferta: '',
    stock: '',
    stockCritico: '5',
    imagen: '',
    descripcion: '',
  });

  const cargarLista = () => {
    setProductos(obtenerProductos());
  };

  useEffect(() => {
    cargarLista();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: '',
      categoria: 'Consolas',
      precio: '',
      precioOferta: '',
      stock: '',
      stockCritico: '5',
      imagen: '',
      descripcion: '',
    });
    setModoEdicion(false);
    setIdEditando(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.precio || !form.stock) {
      alert('Nombre, precio y stock son campos obligatorios');
      return;
    }

    if (form.precioOferta && Number(form.precioOferta) >= Number(form.precio)) {
      alert('El precio de oferta debe ser menor al precio normal');
      return;
    }

    if (modoEdicion) {
      actualizarProducto(idEditando, form);
    } else {
      crearProducto({
        ...form,
        imagen: form.imagen.trim() || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop',
      });
    }

    limpiarFormulario();
    cargarLista();
  };

  const iniciarEdicion = (prod) => {
    setModoEdicion(true);
    setIdEditando(prod.id);
    setForm({
      nombre: prod.nombre,
      categoria: prod.categoria,
      precio: prod.precio,
      precioOferta: prod.precioOferta || '',
      stock: prod.stock,
      stockCritico: prod.stockCritico || 5,
      imagen: prod.imagen,
      descripcion: prod.descripcion,
    });
  };

  const handleEliminar = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
      eliminarProducto(id);
      cargarLista();
    }
  };

  return (
    <div className="container-fluid my-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-info fw-bold mb-0">Gestión de Inventario (CRUD)</h2>
          <small className="text-secondary">Crea, modifica o elimina productos de la tienda</small>
        </div>
        <Link to="/admin" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i>Volver al Dashboard
        </Link>
      </div>

      <div className="row g-4">
        {/* Formulario (Crear / Editar) */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-secondary">
            <div className="card-header bg-dark border-secondary py-3">
              <h5 className="text-light fw-bold mb-0">
                <i className={`bi ${modoEdicion ? 'bi-pencil-square' : 'bi-plus-circle'} me-2 text-info`}></i>
                {modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}
              </h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-secondary small">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control bg-dark text-light border-secondary"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small">Categoría</label>
                  <select
                    name="categoria"
                    className="form-select bg-dark text-light border-secondary"
                    value={form.categoria}
                    onChange={handleChange}
                  >
                    <option value="Consolas">Consolas</option>
                    <option value="Periféricos">Periféricos</option>
                    <option value="Sillas">Sillas</option>
                    <option value="Juegos de Mesa">Juegos de Mesa</option>
                  </select>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label text-secondary small">Precio ($CLP) *</label>
                    <input
                      type="number"
                      name="precio"
                      className="form-control bg-dark text-light border-secondary"
                      value={form.precio}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-secondary small">Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      className="form-control bg-dark text-light border-secondary"
                      value={form.stock}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small">Precio oferta ($CLP)</label>
                  <input
                    type="number"
                    name="precioOferta"
                    className="form-control bg-dark text-light border-secondary"
                    value={form.precioOferta}
                    onChange={handleChange}
                    placeholder="Opcional, déjalo vacío si no está en oferta"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small">URL de Imagen</label>
                  <input
                    type="url"
                    name="imagen"
                    className="form-control bg-dark text-light border-secondary"
                    value={form.imagen}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small">Descripción</label>
                  <textarea
                    name="descripcion"
                    className="form-control bg-dark text-light border-secondary"
                    rows="3"
                    value={form.descripcion}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className={`btn ${modoEdicion ? 'btn-warning' : 'btn-success'} flex-grow-1 fw-bold`}>
                    {modoEdicion ? 'Guardar Cambios' : 'Registrar Producto'}
                  </button>
                  {modoEdicion && (
                    <button type="button" className="btn btn-outline-secondary" onClick={limpiarFormulario}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Tabla de Productos Existentes */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-secondary">
            <div className="card-header bg-dark border-secondary py-3 d-flex justify-content-between align-items-center">
              <h5 className="text-light fw-bold mb-0">Inventario Registrado</h5>
              <span className="badge bg-info text-dark">{productos.length} artículos</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr className="text-secondary small">
                      <th>Foto</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img
                            src={p.imagen}
                            alt={p.nombre}
                            style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </td>
                        <td className="fw-bold text-light">{p.nombre}</td>
                        <td>{p.categoria}</td>
                        <td>
                          ${Number(p.precio).toLocaleString('es-CL')}
                          {esOferta(p) && (
                            <div className="small text-warning">
                              Oferta: ${Number(p.precioOferta).toLocaleString('es-CL')}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${p.stock <= (p.stockCritico || 5) ? 'bg-danger' : 'bg-success'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-info me-2"
                            onClick={() => iniciarEdicion(p)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleEliminar(p.id)}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}