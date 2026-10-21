import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { carrito, totalMonto, vaciarCarrito } = useCart();

  // Estados del formulario de despacho
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    calle: '',
    depto: '',
    region: 'Región Metropolitana de Santiago',
    comuna: 'Cerrillos',
    indicaciones: '',
  });

  const [error, setError] = useState('');

  const formatearDinero = (monto) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación básica de campos requeridos
    if (!formData.nombre.trim() || !formData.apellidos.trim() || !formData.correo.trim() || !formData.calle.trim()) {
      setError('Por favor completa todos los campos obligatorios (*)');
      return;
    }

    if (!formData.correo.includes('@')) {
      setError('Ingresa un correo electrónico válido');
      return;
    }

    setError('');

    // Guardamos los datos de la última orden simulada
    const orden = {
      numeroOrden: '20240705',
      fecha: new Date().toLocaleDateString('es-CL'),
      cliente: formData,
      items: carrito,
      total: totalMonto,
    };
    localStorage.setItem('levelup_ultima_orden', JSON.stringify(orden));

    // Si el usuario escribe "error@error.com" o un monto 0, simulamos fallo para probar ambas vistas de la pauta
    if (formData.correo.toLowerCase().includes('error')) {
      navigate('/pago-error');
    } else {
      vaciarCarrito();
      navigate('/pago-exitoso');
    }
  };

  if (carrito.length === 0) {
    return (
      <div className="container my-5 text-center">
        <h3 className="text-secondary">No hay productos en el carrito para pagar.</h3>
        <button className="btn btn-info mt-3" onClick={() => navigate('/productos')}>
          Ir al Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: '900px' }}>
      <div className="card shadow-lg border-secondary">
        <div className="card-header bg-dark border-secondary p-4 d-flex justify-content-between align-items-center">
          <h3 className="text-info fw-bold mb-0">Carrito de compra</h3>
          <span className="badge bg-primary fs-6 p-2">
            Total a pagar: {formatearDinero(totalMonto)}
          </span>
        </div>

        <div className="card-body p-4">
          {/* Resumen compacto de productos */}
          <h5 className="text-light mb-3">Resumen de productos</h5>
          <div className="table-responsive mb-4">
            <table className="table table-dark table-sm align-middle">
              <thead>
                <tr className="text-secondary small">
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nombre}</td>
                    <td>{formatearDinero(item.precio)}</td>
                    <td>{item.cantidad}</td>
                    <td className="text-success">{formatearDinero(item.precio * item.cantidad)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Información del Cliente */}
            <h5 className="text-info border-bottom border-secondary pb-2 mb-3">
              Información del cliente
            </h5>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label text-secondary small">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control bg-dark text-light border-secondary"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Pedro"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary small">Apellidos *</label>
                <input
                  type="text"
                  name="apellidos"
                  className="form-control bg-dark text-light border-secondary"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Ej: Hacker"
                />
              </div>
              <div className="col-12">
                <label className="form-label text-secondary small">Correo Electrónico *</label>
                <input
                  type="email"
                  name="correo"
                  className="form-control bg-dark text-light border-secondary"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="pedro.hacker20@example.com"
                />
              </div>
            </div>

            {/* Dirección de Entrega */}
            <h5 className="text-info border-bottom border-secondary pb-2 mb-3">
              Dirección de entrega de los productos
            </h5>
            <div className="row g-3 mb-4">
              <div className="col-md-8">
                <label className="form-label text-secondary small">Calle y Número *</label>
                <input
                  type="text"
                  name="calle"
                  className="form-control bg-dark text-light border-secondary"
                  value={formData.calle}
                  onChange={handleChange}
                  placeholder="Ej: Los Crisantemos, Edificio Norte"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label text-secondary small">Departamento (opcional)</label>
                <input
                  type="text"
                  name="depto"
                  className="form-control bg-dark text-light border-secondary"
                  value={formData.depto}
                  onChange={handleChange}
                  placeholder="Depto 603"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary small">Región</label>
                <select
                  name="region"
                  className="form-select bg-dark text-light border-secondary"
                  value={formData.region}
                  onChange={handleChange}
                >
                  <option value="Región Metropolitana de Santiago">Región Metropolitana de Santiago</option>
                  <option value="Valparaíso">Valparaíso</option>
                  <option value="Biobío">Biobío</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary small">Comuna</label>
                <select
                  name="comuna"
                  className="form-select bg-dark text-light border-secondary"
                  value={formData.comuna}
                  onChange={handleChange}
                >
                  <option value="Cerrillos">Cerrillos</option>
                  <option value="Providencia">Providencia</option>
                  <option value="Santiago Centro">Santiago Centro</option>
                  <option value="Maipú">Maipú</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label text-secondary small">Indicaciones para la entrega (opcional)</label>
                <textarea
                  name="indicaciones"
                  className="form-control bg-dark text-light border-secondary"
                  rows="2"
                  value={formData.indicaciones}
                  onChange={handleChange}
                  placeholder="Ej: El martes no estaremos en el depto, pero puede dejárselo con el conserje"
                ></textarea>
              </div>
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-success btn-lg fw-bold py-3">
                <i className="bi bi-shield-check me-2"></i>Pagar ahora {formatearDinero(totalMonto)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}