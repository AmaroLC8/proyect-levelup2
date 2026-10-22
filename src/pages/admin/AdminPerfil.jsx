import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerUsuarios, actualizarUsuario } from '../../data/usuarios';

export default function AdminPerfil() {
  const { usuario } = useAuth ? useAuth() : { usuario: null };
  const [adminData, setAdminData] = useState({
    id: '1',
    nombre: 'Administrador',
    apellidos: 'General',
    correo: 'admin@levelup.cl',
    rol: 'admin',
    puntos: 0
  });

  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    const lista = obtenerUsuarios() || [];
    const actual = lista.find(
      (u) => (u.correo || '').toLowerCase() === (usuario?.correo || 'admin@levelup.cl').toLowerCase() || u.rol === 'admin'
    );

    if (actual) {
      setAdminData(actual);
    }
  }, [usuario]);

  const handleGuardar = (e) => {
    e.preventDefault();
    if (adminData.id) {
      actualizarUsuario(adminData.id, {
        nombre: adminData.nombre,
        apellidos: adminData.apellidos,
        correo: adminData.correo,
        rol: 'admin'
      });
    }
    setMensaje({ tipo: 'success', texto: '¡Perfil de administrador actualizado correctamente!' });
    setTimeout(() => setMensaje(null), 3000);
  };

  return (
    <div className="container py-3 text-light" style={{ maxWidth: '850px' }}>
      <div className="mb-4">
        <h2 className="fw-bold text-info mb-1">
          <i className="bi bi-person-badge me-2"></i>Perfil de Administrador
        </h2>
        <p className="text-secondary">
          Consulta y actualiza tus credenciales y datos personales del sistema.
        </p>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`} role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>{mensaje.texto}
        </div>
      )}

      <div className="row g-4">
        {/* Resumen lateral */}
        <div className="col-md-4">
          <div className="card bg-dark border-info shadow-sm text-center p-4 h-100">
            <div className="mb-3">
              <div
                className="bg-info text-dark rounded-circle d-inline-flex align-items-center justify-content-center fw-bold fs-1 shadow"
                style={{ width: '90px', height: '90px' }}
              >
                {(adminData.nombre?.[0] || 'A').toUpperCase()}
              </div>
            </div>
            <h5 className="fw-bold text-light mb-1">
              {adminData.nombre} {adminData.apellidos}
            </h5>
            <span className="badge bg-danger mb-3">Administrador Principal</span>
            <p className="text-secondary small mb-0">
              <i className="bi bi-envelope me-1"></i>{adminData.correo}
            </p>
          </div>
        </div>

        {/* Formulario de actualización */}
        <div className="col-md-8">
          <div className="card bg-dark border-secondary shadow-sm p-4">
            <h5 className="fw-bold text-info mb-3">
              <i className="bi bi-pencil-square me-2"></i>Editar Información
            </h5>
            <form onSubmit={handleGuardar}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-bold">Nombre</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    required
                    value={adminData.nombre || ''}
                    onChange={(e) => setAdminData({ ...adminData, nombre: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-bold">Apellidos</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    required
                    value={adminData.apellidos || ''}
                    onChange={(e) => setAdminData({ ...adminData, apellidos: e.target.value })}
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label text-secondary small fw-bold">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control bg-dark text-light border-secondary"
                    required
                    value={adminData.correo || ''}
                    onChange={(e) => setAdminData({ ...adminData, correo: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-bold">Nivel de Acceso</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-secondary border-secondary"
                    value="Administrador (Acceso Total)"
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-bold">Puntos LevelUp</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-warning border-secondary fw-bold"
                    value={`${adminData.puntos || 0} pts`}
                    disabled
                  />
                </div>
              </div>
              <div className="mt-4 text-end">
                <button type="submit" className="btn btn-info fw-bold">
                  <i className="bi bi-save me-2"></i>Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}