import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { crearOrden, obtenerUltimaOrden } from '../data/ordenes';
import { descontarStock } from '../data/productos';
import { obtenerRegiones, obtenerComunas } from '../data/regiones';
import { esCorreoValido, validarNombreCompleto } from '../utils/validaciones';
import { formatearDinero } from '../utils/formato';

const REGION_POR_DEFECTO = 'Región Metropolitana de Santiago';

// Datos iniciales del formulario: los de la orden rechazada si se reintenta el pago,
// los del usuario si inició sesión (RF11), o vacíos para un visitante
const obtenerDatosIniciales = (usuario, reintentar) => {
  const ultimaOrden = obtenerUltimaOrden();
  if (reintentar && ultimaOrden?.estado === 'rechazada') {
    return { ...ultimaOrden.cliente };
  }
  return {
    nombre: usuario?.nombre ?? '',
    apellidos: usuario?.apellidos ?? '',
    correo: usuario?.correo ?? '',
    calle: '',
    depto: '',
    region: REGION_POR_DEFECTO,
    comuna: obtenerComunas(REGION_POR_DEFECTO)[0],
    indicaciones: '',
  };
};

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { carrito, subtotal, descuento, totalMonto, vaciarCarrito } = useCart();
  const { usuario } = useAuth();

  // Estados del formulario de despacho
  const [formData, setFormData] = useState(() =>
    obtenerDatosIniciales(usuario, location.state?.reintentar)
  );

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Al cambiar de región se selecciona la primera comuna de esa región
  const handleCambioRegion = (e) => {
    const region = e.target.value;
    setFormData({ ...formData, region, comuna: obtenerComunas(region)[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación de campos requeridos
    if (!formData.nombre.trim() || !formData.apellidos.trim() || !formData.correo.trim() || !formData.calle.trim()) {
      setError('Por favor completa todos los campos obligatorios (*)');
      return;
    }

    const errorNombre = validarNombreCompleto(formData.nombre, formData.apellidos);
    if (errorNombre) {
      setError(errorNombre);
      return;
    }

    if (!esCorreoValido(formData.correo)) {
      setError('Ingresa un correo electrónico válido');
      return;
    }

    setError('');

    // Si el correo contiene "error" (ej: error@test.com) simulamos un pago rechazado
    const pagoRechazado = formData.correo.toLowerCase().includes('error');

    crearOrden({
      estado: pagoRechazado ? 'rechazada' : 'pagada',
      usuarioId: usuario?.id ?? null,
      cliente: formData,
      items: carrito.map(({ id, nombre, precio, cantidad, imagen }) => ({ id, nombre, precio, cantidad, imagen })),
      subtotal,
      descuento,
      total: totalMonto,
    });

    if (pagoRechazado) {
      navigate('/pago-error');
    } else {
      descontarStock(carrito);
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
              {descuento > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end text-warning">Descuento Duoc (20%):</td>
                    <td className="text-warning">-{formatearDinero(descuento)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {usuario && !location.state?.reintentar && (
            <div className="alert alert-info py-2 small">
              <i className="bi bi-person-check me-2"></i>Completamos tus datos con la información de tu cuenta.
            </div>
          )}

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
                <label className="form-label text-secondary small">Región *</label>
                <select
                  name="region"
                  className="form-select bg-dark text-light border-secondary"
                  value={formData.region}
                  onChange={handleCambioRegion}
                >
                  {obtenerRegiones().map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary small">Comuna *</label>
                <select
                  name="comuna"
                  className="form-select bg-dark text-light border-secondary"
                  value={formData.comuna}
                  onChange={handleChange}
                >
                  {obtenerComunas(formData.region).map((comuna) => (
                    <option key={comuna} value={comuna}>{comuna}</option>
                  ))}
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
