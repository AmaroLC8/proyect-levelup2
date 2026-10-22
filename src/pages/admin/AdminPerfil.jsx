import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { actualizarUsuario, obtenerUsuarioPorCorreo } from '../../data/usuarios';
import { esCorreoValido, esPasswordSegura, validarNombreCompleto } from '../../utils/validaciones';

export default function AdminPerfil() {
  // RutaProtegidaAdmin asegura que aquí siempre hay un administrador con sesión
  const { usuario, refrescarUsuario } = useAuth();

  const [adminData, setAdminData] = useState({
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    correo: usuario.correo,
    password: '',
    confirmarPassword: '',
  });
  const [mensaje, setMensaje] = useState(null);

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  // Devuelve el primer error encontrado o null si los datos son válidos
  const validar = () => {
    const errorNombre = validarNombreCompleto(adminData.nombre, adminData.apellidos);
    if (errorNombre) return errorNombre;
    if (!esCorreoValido(adminData.correo)) return 'Ingresa un correo electrónico válido';
    const otro = obtenerUsuarioPorCorreo(adminData.correo);
    if (otro && otro.id !== usuario.id) return 'Ese correo ya pertenece a otra cuenta';
    if (adminData.password) {
      if (!esPasswordSegura(adminData.password)) return 'La contraseña debe tener mínimo 8 caracteres, con letras y números';
      if (adminData.password !== adminData.confirmarPassword) return 'Las contraseñas no coinciden';
    }
    return null;
  };

  const handleGuardar = (e) => {
    e.preventDefault();

    const error = validar();
    if (error) {
      setMensaje({ tipo: 'danger', texto: error });
      return;
    }

    actualizarUsuario(usuario.id, {
      nombre: adminData.nombre.trim(),
      apellidos: adminData.apellidos.trim(),
      correo: adminData.correo.trim().toLowerCase(),
      // Si no escribe una nueva contraseña se mantiene la actual
      ...(adminData.password && { password: adminData.password }),
    });
    refrescarUsuario();

    setAdminData({ ...adminData, password: '', confirmarPassword: '' });
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
          Consulta y actualiza tus datos personales y la contraseña de tu cuenta.
        </p>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} py-2`} role="alert">
          <i className={`bi ${mensaje.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {mensaje.texto}
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
                {(usuario.nombre?.[0] || 'A').toUpperCase()}
              </div>
            </div>
            <h5 className="fw-bold text-light mb-1">
              {usuario.nombre} {usuario.apellidos}
            </h5>
            <span className="badge bg-danger mb-3 align-self-center">Administrador</span>
            <p className="text-secondary small mb-0">
              <i className="bi bi-envelope me-1"></i>{usuario.correo}
            </p>
          </div>
        </div>

        {/* Formulario de actualización */}
        <div className="col-md-8">
          <div className="card bg-dark border-secondary shadow-sm p-4">
            <h5 className="fw-bold text-info mb-3">
              <i className="bi bi-pencil-square me-2"></i>Editar Información
            </h5>
            <form onSubmit={handleGuardar} noValidate>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="adminNombre" className="form-label text-secondary small fw-bold">Nombre</label>
                  <input id="adminNombre" type="text" name="nombre"
                    className="form-control bg-dark text-light border-secondary"
                    value={adminData.nombre} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="adminApellidos" className="form-label text-secondary small fw-bold">Apellidos</label>
                  <input id="adminApellidos" type="text" name="apellidos"
                    className="form-control bg-dark text-light border-secondary"
                    value={adminData.apellidos} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label htmlFor="adminCorreo" className="form-label text-secondary small fw-bold">Correo Electrónico</label>
                  <input id="adminCorreo" type="email" name="correo"
                    className="form-control bg-dark text-light border-secondary"
                    value={adminData.correo} onChange={handleChange} />
                </div>

                <div className="col-12 pt-2 border-top border-secondary">
                  <span className="text-secondary small">Cambiar contraseña (déjalo vacío para mantener la actual)</span>
                </div>
                <div className="col-md-6">
                  <label htmlFor="adminPassword" className="form-label text-secondary small fw-bold">Nueva contraseña</label>
                  <input id="adminPassword" type="password" name="password"
                    className="form-control bg-dark text-light border-secondary"
                    value={adminData.password} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="adminConfirmar" className="form-label text-secondary small fw-bold">Confirmar contraseña</label>
                  <input id="adminConfirmar" type="password" name="confirmarPassword"
                    className="form-control bg-dark text-light border-secondary"
                    value={adminData.confirmarPassword} onChange={handleChange} />
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
