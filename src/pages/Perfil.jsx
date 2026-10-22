import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { obtenerUsuarios, actualizarUsuario } from '../data/usuarios';
import { obtenerOrdenes, obtenerOrdenesPorUsuario } from '../data/ordenes';

export default function Perfil() {
  const { usuario, setUsuario } = useAuth ? useAuth() : { usuario: null };
  const [datosUser, setDatosUser] = useState(null);
  const [compras, setCompras] = useState([]);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    correo: ''
  });

  useEffect(() => {
    cargarPerfil();
  }, [usuario]);

  const cargarPerfil = () => {
    const listaUsuarios = obtenerUsuarios() || [];
    const correoBuscar = usuario?.correo || usuario?.email || 'juan.perez@duocuc.cl';

    const encontrado = listaUsuarios.find(
      (u) => (u.correo || u.email || '').toLowerCase() === correoBuscar.toLowerCase()
    );

    if (encontrado) {
      setDatosUser(encontrado);
      setForm({
        nombre: encontrado.nombre || '',
        apellidos: encontrado.apellidos || '',
        correo: encontrado.correo || encontrado.email || ''
      });

      // Cargar historial de compras del cliente
      const ordenesTodas = obtenerOrdenes() || [];
      const porId = typeof obtenerOrdenesPorUsuario === 'function' ? obtenerOrdenesPorUsuario(encontrado.id) : [];
      const porEmail = ordenesTodas.filter(
        (o) => (o.cliente?.correo || o.cliente?.email || o.email || '').toLowerCase() === correoBuscar.toLowerCase()
      );

      setCompras(porId.length > 0 ? porId : porEmail);
    }
  };

  const handleGuardar = (e) => {
    e.preventDefault();
    if (!datosUser) return;

    actualizarUsuario(datosUser.id, {
      nombre: form.nombre,
      apellidos: form.apellidos
    });

    const actualizado = {
      ...datosUser,
      nombre: form.nombre,
      apellidos: form.apellidos
    };

    setDatosUser(actualizado);
    if (setUsuario) {
      setUsuario(actualizado);
    }

    setEditando(false);
    setMensaje({ tipo: 'success', texto: '¡Datos de perfil actualizados exitosamente!' });
    setTimeout(() => setMensaje(null), 3000);
  };

  const formatearCLP = (monto) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto || 0);

  if (!datosUser) {
    return (
      <div className="container py-5 text-center text-light">
        <h4 className="text-info">Cargando perfil de cliente...</h4>
      </div>
    );
  }

  const esDuoc = (datosUser.correo || datosUser.email || '').endsWith('@duocuc.cl') || datosUser.descuentoDuoc;

  return (
    <div className="container py-4 text-light" style={{ maxWidth: '950px' }}>
      <div className="mb-4">
        <h2 className="fw-bold text-info mb-1">
          <i className="bi bi-person-circle me-2"></i>Mi Perfil de Cliente
        </h2>
        <p className="text-secondary">
          Gestiona tu información personal, revisa tus Puntos LevelUp y tu historial de compras.
        </p>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`} role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>{mensaje.texto}
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
                <h3 className="fw-bold text-info mb-0 mt-1">{compras.length} pedido(s)</h3>
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
                  onClick={() => setEditando(true)}
                >
                  <i className="bi bi-pencil me-1"></i>Editar
                </button>
              )}
            </div>

            {editando ? (
              <form onSubmit={handleGuardar}>
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
                    value={form.correo}
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
                  <button type="submit" className="btn btn-sm btn-info fw-bold">
                    Guardar
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
                  <span>{datosUser.correo || datosUser.email}</span>
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

            {compras.length === 0 ? (
              <div className="text-center py-4 text-muted">
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
                      <th className="text-end">Total Pagado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compras.map((ord) => (
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
        </div>
      </div>
    </div>
  );
}
