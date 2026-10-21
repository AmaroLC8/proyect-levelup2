import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();

  const [formData, setFormData] = useState({ correo: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.correo.trim() || !formData.password) {
      setError('Ingresa tu correo y contraseña');
      return;
    }

    const resultado = iniciarSesion(formData.correo, formData.password);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }

    // El administrador entra directo a su panel
    navigate(resultado.usuario.rol === 'admin' ? '/admin' : '/');
  };

  return (
    <div className="container my-5" style={{ maxWidth: '460px' }}>
      <div className="card shadow-lg border-secondary">
        <div className="card-header bg-dark border-secondary p-4 text-center">
          <i className="bi bi-person-circle text-info" style={{ fontSize: '3rem' }}></i>
          <h3 className="text-info fw-bold mb-0 mt-2">Iniciar sesión</h3>
        </div>

        <div className="card-body p-4">
          {error && <div className="alert alert-danger py-2">{error}</div>}

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
              <button type="submit" className="btn btn-info btn-lg fw-bold text-dark">
                Ingresar
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
