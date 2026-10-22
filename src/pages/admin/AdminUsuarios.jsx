import React, { useState, useEffect } from 'react';
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../../data/usuarios';
import { obtenerOrdenes, obtenerOrdenesPorUsuario } from '../../data/ordenes';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [modoModal, setModoModal] = useState(null); // 'crear' | 'editar' | 'ver' | null
  const [usuarioSel, setUsuarioSel] = useState(null);

  // Estado del formulario adaptado a tu usuarios.js
  const [form, setForm] = useState({
    id: null,
    nombre: '',
    apellidos: '',
    correo: '',
    password: '',
    fechaNacimiento: '2000-01-01',
    rol: 'cliente'
  });

  const cargarDatos = () => {
    setUsuarios(obtenerUsuarios() || []);
    setOrdenes(obtenerOrdenes() || []);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAbrirCrear = () => {
    setForm({
      id: null,
      nombre: '',
      apellidos: '',
      correo: '',
      password: 'user1234',
      fechaNacimiento: '2000-01-01',
      rol: 'cliente'
    });
    setModoModal('crear');
  };

  const handleAbrirEditar = (user) => {
    setUsuarioSel(user);
    setForm({
      id: user.id,
      nombre: user.nombre || '',
      apellidos: user.apellidos || '',
      correo: user.correo || '',
      password: user.password || '12345678',
      fechaNacimiento: user.fechaNacimiento || '2000-01-01',
      rol: user.rol || 'cliente'
    });
    setModoModal('editar');
  };

  const handleAbrirVer = (user) => {
    setUsuarioSel(user);
    setModoModal('ver');
  };

  const handleCerrarModal = () => {
    setModoModal(null);
    setUsuarioSel(null);
  };

  const handleGuardar = (e) => {
    e.preventDefault();

    if (modoModal === 'crear') {
      crearUsuario({
        nombre: form.nombre,
        apellidos: form.apellidos,
        correo: form.correo,
        password: form.password,
        fechaNacimiento: form.fechaNacimiento,
        rol: form.rol
      });
    } else if (modoModal === 'editar') {
      actualizarUsuario(form.id, {
        nombre: form.nombre,
        apellidos: form.apellidos,
        correo: form.correo,
        rol: form.rol
      });
    }

    cargarDatos();
    handleCerrarModal();
  };

  const handleEliminar = (idUser) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      eliminarUsuario(idUser);
      cargarDatos();
    }
  };

  // Obtener compras asociadas al usuario usando id o correo
  const obtenerComprasDeUsuario = (user) => {
    if (!user) return [];
    const porId = obtenerOrdenesPorUsuario(user.id);
    if (porId.length > 0) return porId;
    return ordenes.filter(
      (ord) => (ord.cliente?.correo || '').toLowerCase() === (user.correo || '').toLowerCase()
    );
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = busqueda.toLowerCase();
    const nombreCompleto = `${u.nombre || ''} ${u.apellidos || ''}`.toLowerCase();
    const coincideTexto =
      nombreCompleto.includes(texto) ||
      (u.correo || '').toLowerCase().includes(texto);

    const coincideRol = filtroRol === 'todos' || u.rol === filtroRol;

    return coincideTexto && coincideRol;
  });

  const formatearCLP = (monto) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto || 0);

  return (
    <div className="container-fluid text-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-info mb-1">
            <i className="bi bi-people me-2"></i>Gestión de Usuarios e Historial
          </h2>
          <p className="text-secondary mb-0">
            Administra los usuarios registrados, sus roles y consulta su historial de compras.
          </p>
        </div>
        <button className="btn btn-info fw-semibold" onClick={handleAbrirCrear}>
          <i className="bi bi-person-plus me-2"></i>Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
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
                placeholder="Buscar por nombre o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select bg-dark text-light border-secondary"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
            >
              <option value="todos">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="cliente">Clientes</option>
            </select>
          </div>
          <div className="col-md-2 text-md-end">
            <span className="badge bg-secondary">
              Total: {usuariosFiltrados.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="card bg-dark border-secondary shadow-sm">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="border-bottom border-secondary text-info">
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Puntos LevelUp</th>
                <th className="text-center">Compras Realizadas</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => {
                  const compras = obtenerComprasDeUsuario(u);

                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="fw-bold text-light">
                          {u.nombre} {u.apellidos}
                        </div>
                        {u.descuentoDuoc && (
                          <span className="badge bg-primary bg-opacity-20 text-primary small">
                            <i className="bi bi-mortarboard me-1"></i>Convenio Duoc (20%)
                          </span>
                        )}
                      </td>
                      <td className="small">{u.correo}</td>
                      <td>
                        <span className={`badge ${u.rol === 'admin' ? 'bg-danger' : 'bg-info text-dark'}`}>
                          {u.rol === 'admin' ? 'Administrador' : 'Cliente'}
                        </span>
                      </td>
                      <td>
                        <span className="text-warning fw-bold">
                          <i className="bi bi-star-fill me-1"></i>{u.puntos || 0} pts
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-dark border border-info text-info">
                          {compras.length} compra(s)
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-info"
                            title="Ver Historial de Compras"
                            onClick={() => handleAbrirVer(u)}
                          >
                            <i className="bi bi-clock-history me-1"></i>Ver
                          </button>
                          <button
                            className="btn btn-outline-warning"
                            title="Editar"
                            onClick={() => handleAbrirEditar(u)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            title="Eliminar"
                            onClick={() => handleEliminar(u.id)}
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

      {/* Modal de Crear / Editar / Ver Historial */}
      {modoModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark text-light border-info">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold text-info">
                  {modoModal === 'crear' && <><i className="bi bi-person-plus me-2"></i>Nuevo Usuario</>}
                  {modoModal === 'editar' && <><i className="bi bi-pencil-square me-2"></i>Editar Usuario</>}
                  {modoModal === 'ver' && <><i className="bi bi-clock-history me-2"></i>Historial de Compras de {usuarioSel?.nombre} {usuarioSel?.apellidos}</>}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCerrarModal}></button>
              </div>

              {modoModal === 'ver' ? (
                <div className="modal-body">
                  {/* Resumen del Usuario */}
                  <div className="row g-3 mb-4 p-3 bg-body-tertiary rounded text-dark">
                    <div className="col-md-6">
                      <strong>Nombre:</strong> {usuarioSel?.nombre} {usuarioSel?.apellidos}<br />
                      <strong>Correo:</strong> {usuarioSel?.correo}
                    </div>
                    <div className="col-md-6">
                      <strong>Código Referido:</strong> {usuarioSel?.codigoReferido || 'N/A'}<br />
                      <strong>Rol:</strong> {usuarioSel?.rol === 'admin' ? 'Administrador' : 'Cliente'}<br />
                      <strong>Puntos LevelUp:</strong> {usuarioSel?.puntos || 0}
                    </div>
                  </div>

                  <h6 className="fw-bold text-info mb-3">Historial de Órdenes Realizadas</h6>
                  {obtenerComprasDeUsuario(usuarioSel).length === 0 ? (
                    <div className="alert alert-dark text-center text-muted border-secondary">
                      Este usuario aún no ha realizado compras en la tienda.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-dark table-striped align-middle mb-0">
                        <thead>
                          <tr className="text-info small">
                            <th>N° Orden</th>
                            <th>Fecha</th>
                            <th>Productos</th>
                            <th className="text-end">Total Pagado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {obtenerComprasDeUsuario(usuarioSel).map((ord) => (
                            <tr key={ord.id || ord.numeroOrden}>
                              <td className="fw-bold text-info">#{ord.id || ord.numeroOrden}</td>
                              <td className="small">
                                {ord.fecha ? new Date(ord.fecha).toLocaleDateString('es-CL') : 'N/A'}
                              </td>
                              <td className="small">
                                {(ord.items || []).map((i) => `${i.nombre || i.titulo} (x${i.cantidad})`).join(', ')}
                              </td>
                              <td className="text-end fw-bold text-success">
                                {formatearCLP(ord.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleGuardar}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-bold">Nombre</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-light border-secondary"
                          required
                          value={form.nombre}
                          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-bold">Apellidos</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-light border-secondary"
                          required
                          value={form.apellidos}
                          onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-bold">Correo Electrónico</label>
                        <input
                          type="email"
                          className="form-control bg-dark text-light border-secondary"
                          required
                          value={form.correo}
                          onChange={(e) => setForm({ ...form, correo: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-bold">Rol</label>
                        <select
                          className="form-select bg-dark text-light border-secondary"
                          value={form.rol}
                          onChange={(e) => setForm({ ...form, rol: e.target.value })}
                        >
                          <option value="cliente">Cliente</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                      {modoModal === 'crear' && (
                        <>
                          <div className="col-md-6">
                            <label className="form-label text-secondary small fw-bold">Contraseña</label>
                            <input
                              type="password"
                              className="form-control bg-dark text-light border-secondary"
                              required
                              value={form.password}
                              onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-secondary small fw-bold">Fecha de Nacimiento</label>
                            <input
                              type="date"
                              className="form-control bg-dark text-light border-secondary"
                              required
                              value={form.fechaNacimiento}
                              onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer border-secondary">
                    <button type="button" className="btn btn-outline-secondary" onClick={handleCerrarModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-info fw-bold">
                      {modoModal === 'crear' ? 'Crear Usuario' : 'Guardar Cambios'}
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
