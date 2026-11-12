import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { obtenerPerfil, actualizarPerfil } from '../services/authService';
import { misCompras } from '../services/boletasService';
import { formatearDinero, formatearFecha } from '../utils/formato';
import { validarNombreCompleto } from '../utils/validaciones';
import EstadoOrden from '../components/EstadoOrden';
import EstadoCarga from '../components/EstadoCarga';

// Perfil del cliente (RF5). Sin sesión no se llega aquí: RutaProtegida (App.jsx) redirige a /login.
export default function Perfil() {
  const { actualizarUsuarioSesion } = useAuth();
  const [perfil, setPerfil] = useState(null); // datos de GET /auth/perfil
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [form, setForm] = useState({ nombre: '', apellidos: '' });

  // GET /auth/perfil: puntos, descuento Duoc y código de referido actualizados desde el backend
  useEffect(() => {
    obtenerPerfil()
      .then((datos) => setPerfil(datos))
      .catch((err) => setErrorCarga(err.message))
      .finally(() => setCargando(false));
  }, []);

  // Historial de compras: GET /boletas/mis-compras (las boletas del usuario del token,
  // de la más reciente a la más antigua). Tiene su propia carga y error, así un problema
  // con el historial no impide ver los datos del perfil.
  const [compras, setCompras] = useState([]);
  const [cargandoCompras, setCargandoCompras] = useState(true);
  const [errorCompras, setErrorCompras] = useState('');

  useEffect(() => {
    misCompras()
      .then((datos) => setCompras(datos))
      .catch((err) => setErrorCompras(err.message))
      .finally(() => setCargandoCompras(false));
  }, []);

  const handleEditar = () => {
    setForm({ nombre: perfil.nombre, apellidos: perfil.apellidos });
    setEditando(true);
  };

  // PUT /auth/perfil. El cliente solo edita nombre y apellidos: la fecha de nacimiento se envía igual
  // (el backend la exige) y la contraseña vacía significa "mantener la actual".
  // Rol, puntos y descuento no se envían: el backend no permite cambiarlos.
  const handleGuardar = async (e) => {
    e.preventDefault();

    const errorNombre = validarNombreCompleto(form.nombre, form.apellidos);
    if (errorNombre) {
      setMensaje({ tipo: 'danger', texto: errorNombre });
      return;
    }

    setGuardando(true);
    try {
      const actualizado = await actualizarPerfil({
        nombre: form.nombre.trim(),
        apellidos: form.apellidos.trim(),
        fechaNacimiento: perfil.fechaNacimiento,
        password: '',
      });
      setPerfil(actualizado);
      actualizarUsuarioSesion(actualizado); // la Navbar muestra el nombre nuevo
      setEditando(false);
      setMensaje({ tipo: 'success', texto: '¡Datos de perfil actualizados exitosamente!' });
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    } finally {
      setGuardando(false);
    }
  };

  const encabezado = (
    <div className="mb-4">
      <h2 className="fw-bold text-info mb-1">
        <i className="bi bi-person-circle me-2"></i>Mi Perfil de Cliente
      </h2>
      <p className="text-secondary">
        Gestiona tu información personal, revisa tus Puntos LevelUp y tu historial de compras.
      </p>
    </div>
  );

  // Mientras llega el perfil (o si el backend no responde) solo se muestra el estado de la carga
  if (cargando || errorCarga) {
    return (
      <div className="container py-4 text-light" style={{ maxWidth: '950px' }}>
        {encabezado}
        <EstadoCarga cargando={cargando} error={errorCarga} />
      </div>
    );
  }

  const datosUser = perfil;
  const esDuoc = perfil.descuentoDuoc;

  return (
    <div className="container py-4 text-light" style={{ maxWidth: '950px' }}>
      {encabezado}

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`} role="alert">
          <i className={`bi ${mensaje.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {mensaje.texto}
        </div>
      )}

      {/* Tarjetas de Resumen del Cliente */}
      <div className="row g-3 mb-4">
        {/* Puntos LevelUp */}
        <div className="col-md-4">
          <div className="card bg-dark border-warning shadow-sm p-3 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-secondary small fw-bold">PUNTOS LEVELUP</span>
                <h3 className="fw-bold text-warning mb-0 mt-1">
                  <i className="bi bi-star-fill me-1"></i>{datosUser.puntos || 0} pts
                </h3>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle fs-3">
                <i className="bi bi-trophy"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Convenio Duoc */}
        <div className="col-md-4">
          <div className="card bg-dark border-primary shadow-sm p-3 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-secondary small fw-bold">CONVENIO INSTITUCIONAL</span>
                <h5 className="fw-bold text-primary mb-0 mt-2">
                  {esDuoc ? '20% Descuento Duoc' : 'Sin convenio activo'}
                </h5>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle fs-3">
                <i className="bi bi-mortarboard"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Total de Compras */}
        <div className="col-md-4">
          <div className="card bg-dark border-info shadow-sm p-3 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-secondary small fw-bold">COMPRAS REALIZADAS</span>
                <h3 className="fw-bold text-info mb-0 mt-1">
                  {/* Solo cuentan las boletas pagadas (el backend también guarda las rechazadas) */}
                  {compras.filter((o) => o.estado === 'PAGADA').length} pedido(s)
                </h3>
              </div>
              <div className="bg-info bg-opacity-10 text-info p-3 rounded-circle fs-3">
                <i className="bi bi-bag-check"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Datos Personales */}
        <div className="col-md-5">
          <div className="card bg-dark border-secondary shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-info mb-0">
                <i className="bi bi-card-heading me-2"></i>Información Personal
              </h5>
              {!editando && (
                <button
                  className="btn btn-sm btn-outline-warning"
                  onClick={handleEditar}
                >
                  <i className="bi bi-pencil me-1"></i>Editar
                </button>
              )}
            </div>

            {editando ? (
              <form onSubmit={handleGuardar} noValidate>
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">Nombre</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">Apellidos</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    required
                    value={form.apellidos}
                    onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">Correo (No editable)</label>
                  <input
                    type="email"
                    className="form-control bg-dark text-secondary border-secondary"
                    value={perfil.correo}
                    disabled
                  />
                </div>
                <div className="d-flex gap-2 justify-content-end mt-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setEditando(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-sm btn-info fw-bold" disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            ) : (
              <ul className="list-group list-group-flush bg-dark text-light">
                <li className="list-group-item bg-dark text-light border-secondary px-0">
                  <span className="text-secondary small d-block">Nombre Completo:</span>
                  <span className="fw-bold">{datosUser.nombre} {datosUser.apellidos}</span>
                </li>
                <li className="list-group-item bg-dark text-light border-secondary px-0">
                  <span className="text-secondary small d-block">Correo Electrónico:</span>
                  <span>{datosUser.correo}</span>
                </li>
                <li className="list-group-item bg-dark text-light border-secondary px-0">
                  <span className="text-secondary small d-block">Fecha de Nacimiento:</span>
                  {/* Se agrega la hora para que "2002-08-20" se lea en hora de Chile y no en UTC (mostraría el día anterior) */}
                  <span>{formatearFecha(`${datosUser.fechaNacimiento}T00:00:00`)}</span>
                </li>
                <li className="list-group-item bg-dark text-light border-secondary px-0">
                  <span className="text-secondary small d-block">Código de Referido:</span>
                  <span className="badge bg-secondary">{datosUser.codigoReferido || 'N/A'}</span>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Historial de Compras */}
        <div className="col-md-7">
          <div className="card bg-dark border-secondary shadow-sm p-4 h-100">
            <h5 className="fw-bold text-info mb-3">
              <i className="bi bi-clock-history me-2"></i>Mis Compras Recientes
            </h5>

            <EstadoCarga cargando={cargandoCompras} error={errorCompras} />

            {/* La tabla se muestra cuando el historial ya cargó sin errores */}
            {!cargandoCompras && !errorCompras && (compras.length === 0 ? (
              <div className="text-center py-4 text-secondary">
                <i className="bi bi-cart-x fs-1 d-block mb-2"></i>
                Aún no has realizado ninguna compra en la tienda.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr className="text-secondary small border-bottom border-secondary">
                      <th>N° Orden</th>
                      <th>Fecha</th>
                      <th>Productos</th>
                      <th>Estado</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compras.map((ord) => (
                      <tr key={ord.id}>
                        <td className="fw-bold text-info">#{ord.numeroOrden}</td>
                        <td className="small">{formatearFecha(ord.fecha)}</td>
                        <td className="small">
                          {/* Cada detalle de la boleta trae el producto completo */}
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
        </div>
      </div>
    </div>
  );
}
