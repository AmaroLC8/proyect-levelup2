import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rutaInicialPorRol } from '../utils/roles';

export default function Login() {
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();

  const [formData, setFormData] = useState({ correo: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // POST /auth/login (a través de AuthContext → authService)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.correo.trim() || !formData.password) {
      setError('Ingresa tu correo y contraseña');
      return;
    }

    setError('');
    setCargando(true);
    try {
      const usuario = await iniciarSesion(formData.correo, formData.password);
      // Cada rol entra a su página: ADMIN → /admin, VENDEDOR → /admin/productos, CLIENTE → /
      navigate(rutaInicialPorRol(usuario.rol));
    } catch (err) {
      // Ej: 401 "Correo o contraseña incorrectos", o el backend apagado
      setError(err.message);
      setCargando(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: '460px' }}>
      <div className="card shadow-lg border-secondary">
        <div className="card-header bg-dark border-secondary p-4 text-center">
          <i className="bi bi-person-circle text-info" style={{ fontSize: '3rem' }}></i>
          <h3 className="text-info fw-bold mb-0 mt-2">Iniciar sesión</h3>
        </div>

        <div className="card-body p-4">
          {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-secondary small">Correo electrónico</label>
              <input
                type="email"
                name="correo"
                className="form-control bg-dark text-light border-secondary"
                value={formData.correo}
                onChange={handleChange}
                placeholder="tucorreo@ejemplo.com"
              />
            </div>
            <div className="mb-4">
              <label className="form-label text-secondary small">Contraseña</label>
              <input
                type="password"
                name="password"
                className="form-control bg-dark text-light border-secondary"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
              />
            </div>

            <div className="d-grid">
              {/* Deshabilitado mientras se espera la respuesta del backend */}
              <button type="submit" className="btn btn-info btn-lg fw-bold text-dark" disabled={cargando}>
                {cargando ? (
                  <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Ingresando...</>
                ) : (
                  'Ingresar'
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-secondary small mt-4 mb-0">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-info fw-semibold">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
