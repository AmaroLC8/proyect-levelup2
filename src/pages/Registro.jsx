import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { esCorreoDuoc, validarRegistro } from '../utils/validaciones';

export default function Registro() {
  const navigate = useNavigate();
  const { registrarse } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    fechaNacimiento: '',
    password: '',
    confirmarPassword: '',
    codigoReferido: '',
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // POST /auth/registro y luego login automático (AuthContext.registrarse)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Primero se valida en el navegador (utils/validaciones.js), para no enviar datos que el backend rechazaría
    const nuevosErrores = validarRegistro(formData);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    // Formato RegistroRequest del backend. confirmarPassword solo sirve para validar y no se envía;
    // el código de referido vacío se envía como null (el backend lo trata como "sin referido")
    const datos = {
      nombre: formData.nombre.trim(),
      apellidos: formData.apellidos.trim(),
      correo: formData.correo.trim(),
      fechaNacimiento: formData.fechaNacimiento,
      password: formData.password,
      codigoReferido: formData.codigoReferido.trim() || null,
    };

    setErrorGeneral('');
    setCargando(true);
    try {
      await registrarse(datos);
      navigate('/');
    } catch (err) {
      // Errores del backend: correo ya registrado (409), menor de edad o código de referido inexistente (400)
      setErrorGeneral(err.message);
      setCargando(false);
    }
  };

  // Clase y mensaje de error de Bootstrap para cada input
  const claseInput = (campo) =>
    `form-control bg-dark text-light border-secondary ${errores[campo] ? 'is-invalid' : ''}`;
  const mensajeError = (campo) =>
    errores[campo] && <div className="invalid-feedback">{errores[campo]}</div>;

  return (
    <div className="container my-5" style={{ maxWidth: '640px' }}>
      <div className="card shadow-lg border-secondary">
        <div className="card-header bg-dark border-secondary p-4 text-center">
          <i className="bi bi-person-plus text-info" style={{ fontSize: '3rem' }}></i>
          <h3 className="text-info fw-bold mb-0 mt-2">Crear cuenta</h3>
          <small className="text-secondary">Únete a la comunidad Level-Up Gamer</small>
        </div>

        <div className="card-body p-4">
          {errorGeneral && <div className="alert alert-danger py-2" role="alert">{errorGeneral}</div>}

          {esCorreoDuoc(formData.correo) && (
            <div className="alert alert-success py-2">
              <i className="bi bi-mortarboard-fill me-2"></i>
              ¡Correo Duoc detectado! Tendrás <strong>20% de descuento de por vida</strong>.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-secondary small">Nombre *</label>
                <input type="text" name="nombre" className={claseInput('nombre')}
                  value={formData.nombre} onChange={handleChange} />
                {mensajeError('nombre')}
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary small">Apellidos *</label>
                <input type="text" name="apellidos" className={claseInput('apellidos')}
                  value={formData.apellidos} onChange={handleChange} />
                {mensajeError('apellidos')}
              </div>
              <div className="col-md-7">
                <label className="form-label text-secondary small">Correo electrónico *</label>
                <input type="email" name="correo" className={claseInput('correo')}
                  value={formData.correo} onChange={handleChange} placeholder="tucorreo@duocuc.cl" />
                {mensajeError('correo')}
              </div>
              <div className="col-md-5">
                <label className="form-label text-secondary small">Fecha de nacimiento *</label>
                <input type="date" name="fechaNacimiento" className={claseInput('fechaNacimiento')}
                  value={formData.fechaNacimiento} onChange={handleChange} />
                {mensajeError('fechaNacimiento')}
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary small">Contraseña *</label>
                <input type="password" name="password" className={claseInput('password')}
                  value={formData.password} onChange={handleChange} />
                {mensajeError('password')}
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary small">Confirmar contraseña *</label>
                <input type="password" name="confirmarPassword" className={claseInput('confirmarPassword')}
                  value={formData.confirmarPassword} onChange={handleChange} />
                {mensajeError('confirmarPassword')}
              </div>
              <div className="col-12">
                <label className="form-label text-secondary small">Código de referido (opcional)</label>
                <input type="text" name="codigoReferido" className={claseInput('codigoReferido')}
                  value={formData.codigoReferido} onChange={handleChange} placeholder="Ej: LVLPEDRO" />
                <div className="form-text text-secondary">
                  Si un amigo te invitó, ambos ganan puntos LevelUp.
                </div>
              </div>
            </div>

            <div className="d-grid mt-4">
              {/* Deshabilitado mientras se espera la respuesta del backend */}
              <button type="submit" className="btn btn-info btn-lg fw-bold text-dark" disabled={cargando}>
                {cargando ? (
                  <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Creando cuenta...</>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-secondary small mt-4 mb-0">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-info fw-semibold">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
