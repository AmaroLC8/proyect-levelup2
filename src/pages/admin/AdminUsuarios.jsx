import React, { useState } from 'react';
import {
  obtenerUsuarios,
  obtenerUsuarioPorCorreo,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../../data/usuarios';
import { obtenerOrdenes, obtenerOrdenesPorUsuario, ordenarPorFechaDesc } from '../../data/ordenes';
import { useAuth } from '../../context/AuthContext';
import { esCorreoValido, esPasswordSegura, validarRegistro } from '../../utils/validaciones';
import { formatearDinero, formatearFecha } from '../../utils/formato';
import EstadoOrden from '../../components/EstadoOrden';

export default function AdminUsuarios() {
  const { usuario: adminActual } = useAuth();
  const [usuarios, setUsuarios] = useState(() => obtenerUsuarios());
  const [ordenes] = useState(() => obtenerOrdenes());
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [modoModal, setModoModal] = useState(null); // 'crear' | 'editar' | 'ver' | null
  const [usuarioSel, setUsuarioSel] = useState(null);
  const [errores, setErrores] = useState([]);
  const [errorTabla, setErrorTabla] = useState('');

  // Estado del formulario adaptado a usuarios.js
  const [form, setForm] = useState({
    id: null,
    nombre: '',
    apellidos: '',
    correo: '',
    password: '',
    fechaNacimiento: '',
    rol: 'cliente'
  });

  const cargarDatos = () => setUsuarios(obtenerUsuarios());

  const esUsuarioActual = (user) => user?.id === adminActual?.id;

  const handleAbrirCrear = () => {
    setForm({
      id: null,
      nombre: '',
      apellidos: '',
      correo: '',
      password: '',
      fechaNacimiento: '',
      rol: 'cliente'
    });
    setErrores([]);
    setModoModal('crear');
  };

  const handleAbrirEditar = (user) => {
    setUsuarioSel(user);
    setForm({
      id: user.id,
      nombre: user.nombre || '',
      apellidos: user.apellidos || '',
      correo: user.correo || '',
      // Vacía: solo se cambia la contraseña si el admin escribe una nueva
      password: '',
      fechaNacimiento: user.fechaNacimiento || '',
      rol: user.rol || 'cliente'
    });
    setErrores([]);
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

  // Mismas reglas que el registro de la tienda (RF1 y ERS 3.3.2), más correo único
  const validarFormulario = () => {
    const mensajes = [];
    if (modoModal === 'crear') {
      mensajes.push(...Object.values(validarRegistro({ ...form, confirmarPassword: form.password })));
    } else {
      if (!form.nombre.trim() || !form.apellidos.trim()) mensajes.push('Nombre y apellidos son obligatorios');
      if (!esCorreoValido(form.correo)) mensajes.push('Ingresa un correo electrónico válido');
      if (form.password && !esPasswordSegura(form.password)) {
        mensajes.push('La contraseña debe tener mínimo 8 caracteres, combinando letras y números');
      }
    }
    const existente = esCorreoValido(form.correo) ? obtenerUsuarioPorCorreo(form.correo) : null;
    if (existente && existente.id !== form.id) mensajes.push('Ya existe un usuario con ese correo');
    if (esUsuarioActual(form) && form.rol !== 'admin') {
      mensajes.push('No puedes quitarte el rol de administrador a ti mismo');
    }
    return mensajes;
  };

  const handleGuardar = (e) => {
    e.preventDefault();

    const mensajes = validarFormulario();
    setErrores(mensajes);
    if (mensajes.length > 0) return;

    if (modoModal === 'crear') {
      crearUsuario({
        nombre: form.nombre.trim(),
        apellidos: form.apellidos.trim(),
        correo: form.correo,
        password: form.password,
        fechaNacimiento: form.fechaNacimiento,
        rol: form.rol
      });
    } else if (modoModal === 'editar') {
      actualizarUsuario(form.id, {
        nombre: form.nombre.trim(),
        apellidos: form.apellidos.trim(),
        correo: form.correo.trim().toLowerCase(),
        rol: form.rol,
        ...(form.password && { password: form.password })
      });
    }

    cargarDatos();
    handleCerrarModal();
  };

  const handleEliminar = (user) => {
    if (esUsuarioActual(user)) {
      setErrorTabla('No puedes eliminar tu propia cuenta mientras tienes la sesión iniciada');
      return;
    }
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      eliminarUsuario(user.id);
      setErrorTabla('');
      cargarDatos();
    }
  };

  // Obtener compras asociadas al usuario usando id o correo
  const obtenerComprasDeUsuario = (user) => {
    if (!user) return [];
    const porId = obtenerOrdenesPorUsuario(user.id);
    if (porId.length > 0) return ordenarPorFechaDesc(porId);
    // Compras hechas como visitante con el mismo correo
    return ordenarPorFechaDesc(
      ordenes.filter((ord) => ord.cliente.correo.toLowerCase() === user.correo.toLowerCase())
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

      {errorTabla && (
        <div className="alert alert-danger py-2 d-flex justify-content-between align-items-center">
          {errorTabla}
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setErrorTabla('')}></button>
        </div>
      )}

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
                            onClick={() => handleEliminar(u)}
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
                            <th>Estado</th>
                            <th className="text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {obtenerComprasDeUsuario(usuarioSel).map((ord) => (
                            <tr key={ord.id}>
                              <td className="fw-bold text-info">#{ord.numeroOrden}</td>
                              <td className="small">{formatearFecha(ord.fecha)}</td>
                              <td className="small">
                                {ord.items.map((i) => `${i.nombre} (x${i.cantidad})`).join(', ')}
                              </td>
                              <td><EstadoOrden estado={ord.estado} /></td>
                              <td className="text-end fw-bold text-success">
                                {formatearDinero(ord.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleGuardar} noValidate>
                  <div className="modal-body">
                    {errores.length > 0 && (
                      <div className="alert alert-danger py-2">
                        <ul className="mb-0 ps-3">
                          {errores.map((msg) => <li key={msg}>{msg}</li>)}
                        </ul>
                      </div>
                    )}
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
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-bold">
                          {modoModal === 'crear' ? 'Contraseña' : 'Nueva contraseña (opcional)'}
                        </label>
                        <input
                          type="password"
                          className="form-control bg-dark text-light border-secondary"
                          value={form.password}
                          placeholder={modoModal === 'crear' ? 'Mín. 8 caracteres, letras y números' : 'Déjala vacía para no cambiarla'}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                      </div>
                      {modoModal === 'crear' && (
                        <>
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
