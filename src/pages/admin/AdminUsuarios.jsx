import React, { useEffect, useState } from 'react';
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../../services/usuariosService';
import { listarBoletas, historialUsuario } from '../../services/boletasService';
import { useAuth } from '../../context/AuthContext';
import { esCorreoValido, esPasswordSegura, validarRegistro, validarNombreCompleto } from '../../utils/validaciones';
import { formatearDinero, formatearFecha } from '../../utils/formato';
import EstadoOrden from '../../components/EstadoOrden';
import EstadoCarga from '../../components/EstadoCarga';
import { ROLES, NOMBRE_ROL } from '../../utils/roles';

// Color de la etiqueta de cada rol en la tabla
const COLOR_ROL = {
  ADMIN: 'bg-danger',
  VENDEDOR: 'bg-warning text-dark',
  CLIENTE: 'bg-info text-dark',
};

export default function AdminUsuarios() {
  const { usuario: adminActual, actualizarUsuarioSesion } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [boletas, setBoletas] = useState([]); // todas las boletas, para contar las compras de cada usuario
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(''); // el backend no respondió al listar
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [modoModal, setModoModal] = useState(null); // 'crear' | 'editar' | 'ver' | null
  const [usuarioSel, setUsuarioSel] = useState(null);
  const [errores, setErrores] = useState([]);
  const [errorTabla, setErrorTabla] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Historial del modal "Ver" (GET /boletas/usuario/{id})
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState('');

  // Estado del formulario con el formato de UsuarioRequest del backend
  const [form, setForm] = useState({
    id: null,
    nombre: '',
    apellidos: '',
    correo: '',
    password: '',
    fechaNacimiento: '',
    rol: ROLES.CLIENTE
  });

  // GET /usuarios?rol=... : el filtro por rol lo aplica el backend ("todos" = sin filtro)
  const cargarUsuarios = (rol) =>
    listarUsuarios(rol === 'todos' ? undefined : rol)
      .then((datos) => setUsuarios(datos))
      .catch((err) => setErrorCarga(err.message));

  // Al abrir la página: usuarios y boletas en paralelo. Con las boletas se cuenta cuántas compras
  // tiene cada usuario en una sola llamada (en vez de pedir el historial de cada uno).
  useEffect(() => {
    Promise.all([listarUsuarios(), listarBoletas()])
      .then(([listaUsuarios, listaBoletas]) => {
        setUsuarios(listaUsuarios);
        setBoletas(listaBoletas);
      })
      .catch((err) => setErrorCarga(err.message))
      .finally(() => setCargando(false));
  }, []);

  // Al cambiar el filtro se vuelve a pedir la lista al backend con ?rol=
  const handleCambiarFiltroRol = (rol) => {
    setFiltroRol(rol);
    cargarUsuarios(rol);
  };

  // Compras de un usuario: boletas cuyo "usuario" es él (las de visitantes tienen usuario = null)
  const contarCompras = (user) => boletas.filter((b) => b.usuario?.id === user.id).length;

  const esUsuarioActual = (user) => user?.id === adminActual?.id;

  const handleAbrirCrear = () => {
    setForm({
      id: null,
      nombre: '',
      apellidos: '',
      correo: '',
      password: '',
      fechaNacimiento: '',
      rol: ROLES.CLIENTE
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
      rol: user.rol || ROLES.CLIENTE
    });
    setErrores([]);
    setModoModal('editar');
  };

  // Abre el historial y lo pide al backend: GET /boletas/usuario/{id}
  const handleAbrirVer = (user) => {
    setUsuarioSel(user);
    setModoModal('ver');
    setHistorial([]);
    setErrorHistorial('');
    setCargandoHistorial(true);
    historialUsuario(user.id)
      .then((datos) => setHistorial(datos))
      .catch((err) => setErrorHistorial(err.message))
      .finally(() => setCargandoHistorial(false));
  };

  const handleCerrarModal = () => {
    setModoModal(null);
    setUsuarioSel(null);
  };

  // Mismas reglas que el registro de la tienda (RF1 y ERS 3.3.2). El correo repetido lo revisa
  // el backend (409) y su mensaje se muestra en la misma lista de errores.
  const validarFormulario = () => {
    const mensajes = [];
    if (modoModal === 'crear') {
      mensajes.push(...Object.values(validarRegistro({ ...form, confirmarPassword: form.password })));
    } else {
      const errorNombre = validarNombreCompleto(form.nombre, form.apellidos);
      if (errorNombre) mensajes.push(errorNombre);
      if (!esCorreoValido(form.correo)) mensajes.push('Ingresa un correo electrónico válido');
      if (!form.fechaNacimiento) mensajes.push('La fecha de nacimiento es obligatoria');
      if (form.password && !esPasswordSegura(form.password)) {
        mensajes.push('La contraseña debe tener mínimo 8 caracteres, combinando letras y números');
      }
    }
    // Protección de la propia cuenta: el admin no puede dejarse sin permisos
    if (esUsuarioActual(form) && form.rol !== ROLES.ADMIN) {
      mensajes.push('No puedes quitarte el rol de administrador a ti mismo');
    }
    return mensajes;
  };

  // POST /usuarios (crear) o PUT /usuarios/{id} (editar) con el formato UsuarioRequest
  const handleGuardar = async (e) => {
    e.preventDefault();

    const mensajes = validarFormulario();
    setErrores(mensajes);
    if (mensajes.length > 0) return;

    const datos = {
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      correo: form.correo.trim(),
      // Al editar, vacía = el backend mantiene la contraseña actual
      password: form.password,
      fechaNacimiento: form.fechaNacimiento,
      rol: form.rol, // "ADMIN", "VENDEDOR" o "CLIENTE"
    };

    setGuardando(true);
    try {
      if (modoModal === 'crear') {
        await crearUsuario(datos);
      } else {
        const actualizado = await actualizarUsuario(form.id, datos);
        // Si el admin se editó a sí mismo, la Navbar muestra sus datos nuevos
        if (esUsuarioActual(actualizado)) actualizarUsuarioSesion(actualizado);
      }
      await cargarUsuarios(filtroRol);
      handleCerrarModal();
    } catch (err) {
      // Ej: 409 "Ya existe un usuario registrado con el correo ...", 400 menor de edad
      setErrores([err.message]);
    } finally {
      setGuardando(false);
    }
  };

  // DELETE /usuarios/{id}. El backend responde 409 si el usuario tiene boletas
  const handleEliminar = async (user) => {
    if (esUsuarioActual(user)) {
      setErrorTabla('No puedes eliminar tu propia cuenta mientras tienes la sesión iniciada');
      return;
    }
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await eliminarUsuario(user.id);
      setErrorTabla('');
      await cargarUsuarios(filtroRol);
    } catch (err) {
      setErrorTabla(err.message);
    }
  };

  // La búsqueda por texto se hace en el navegador sobre la lista que ya llegó (filtrada por rol)
  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = busqueda.toLowerCase();
    const nombreCompleto = `${u.nombre || ''} ${u.apellidos || ''}`.toLowerCase();
    return nombreCompleto.includes(texto) || (u.correo || '').toLowerCase().includes(texto);
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
              aria-label="Filtrar por rol"
              value={filtroRol}
              onChange={(e) => handleCambiarFiltroRol(e.target.value)}
            >
              <option value="todos">Todos los roles</option>
              <option value={ROLES.ADMIN}>Administradores</option>
              <option value={ROLES.VENDEDOR}>Vendedores</option>
              <option value={ROLES.CLIENTE}>Clientes</option>
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

      <EstadoCarga cargando={cargando} error={errorCarga} />

      {/* Tabla de Usuarios (cuando ya terminó la carga sin errores) */}
      {!cargando && !errorCarga && (
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
                  const compras = contarCompras(u);

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
                        <span className={`badge ${COLOR_ROL[u.rol] ?? 'bg-secondary'}`}>
                          {NOMBRE_ROL[u.rol] ?? u.rol}
                        </span>
                      </td>
                      <td>
                        <span className="text-warning fw-bold">
                          <i className="bi bi-star-fill me-1"></i>{u.puntos || 0} pts
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-dark border border-info text-info">
                          {compras} compra(s)
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
      )}

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
                      <strong>Rol:</strong> {NOMBRE_ROL[usuarioSel?.rol]}<br />
                      <strong>Puntos LevelUp:</strong> {usuarioSel?.puntos || 0}
                    </div>
                  </div>

                  <h6 className="fw-bold text-info mb-3">Historial de Órdenes Realizadas</h6>
                  <EstadoCarga cargando={cargandoHistorial} error={errorHistorial} />
                  {!cargandoHistorial && !errorHistorial && (historial.length === 0 ? (
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
                          {historial.map((ord) => (
                            <tr key={ord.id}>
                              <td className="fw-bold text-info">#{ord.numeroOrden}</td>
                              <td className="small">{formatearFecha(ord.fecha)}</td>
                              <td className="small">
                                {ord.detalles.map((d) => `${d.producto?.nombre} (x${d.cantidad})`).join(', ')}
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
                  ))}
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
                          {/* Mismos valores que el enum Rol del backend (en mayúsculas) */}
                          <option value={ROLES.CLIENTE}>Cliente</option>
                          <option value={ROLES.VENDEDOR}>Vendedor</option>
                          <option value={ROLES.ADMIN}>Administrador</option>
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
                      {/* Se muestra al crear y al editar: UsuarioRequest del backend siempre la exige */}
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
                    </div>
                  </div>
                  <div className="modal-footer border-secondary">
                    <button type="button" className="btn btn-outline-secondary" onClick={handleCerrarModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-info fw-bold" disabled={guardando}>
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
