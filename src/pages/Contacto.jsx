import React, { useState } from 'react';
import { esCorreoValido } from '../utils/validaciones';

// Número de soporte técnico para el enlace directo de WhatsApp (RF7)
const WHATSAPP_SOPORTE = '56912345678';
const MAX_CARACTERES = 500;

export default function Contacto() {
  const [formData, setFormData] = useState({ nombre: '', correo: '', asunto: 'Consulta general', mensaje: '' });
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevosErrores = {};
    if (!formData.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!esCorreoValido(formData.correo)) nuevosErrores.correo = 'Ingresa un correo electrónico válido';
    if (formData.mensaje.trim().length < 10) nuevosErrores.mensaje = 'El mensaje debe tener al menos 10 caracteres';

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    // Sin backend: el envío es simulado
    setEnviado(true);
    setFormData({ nombre: '', correo: '', asunto: 'Consulta general', mensaje: '' });
  };

  const claseInput = (campo) =>
    `form-control bg-dark text-light border-secondary ${errores[campo] ? 'is-invalid' : ''}`;

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-1" style={{ color: '#ffffff' }}>Contacto</h2>
      <p className="mb-4" style={{ color: '#94a3b8' }}>
        ¿Tienes dudas sobre un producto o tu pedido? Escríbenos y te responderemos a la brevedad.
      </p>

      <div className="row g-4">
        {/* Formulario */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-secondary">
            <div className="card-body p-4">
              {enviado && (
                <div className="alert alert-success alert-dismissible py-2">
                  <i className="bi bi-check-circle me-2"></i>¡Mensaje enviado! Te contactaremos pronto.
                  <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setEnviado(false)}></button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-secondary small">Nombre *</label>
                    <input type="text" name="nombre" className={claseInput('nombre')}
                      value={formData.nombre} onChange={handleChange} />
                    {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary small">Correo electrónico *</label>
                    <input type="email" name="correo" className={claseInput('correo')}
                      value={formData.correo} onChange={handleChange} />
                    {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
                  </div>
                  <div className="col-12">
                    <label className="form-label text-secondary small">Asunto</label>
                    <select name="asunto" className="form-select bg-dark text-light border-secondary"
                      value={formData.asunto} onChange={handleChange}>
                      <option>Consulta general</option>
                      <option>Estado de mi pedido</option>
                      <option>Servicio técnico</option>
                      <option>Devoluciones</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-secondary small">Mensaje *</label>
                    <textarea name="mensaje" rows="5" maxLength={MAX_CARACTERES} className={claseInput('mensaje')}
                      value={formData.mensaje} onChange={handleChange}></textarea>
                    {errores.mensaje && <div className="invalid-feedback">{errores.mensaje}</div>}
                    <div className="form-text text-secondary text-end">
                      {formData.mensaje.length}/{MAX_CARACTERES}
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-info text-dark fw-bold px-4 mt-3">
                  <i className="bi bi-send me-2"></i>Enviar mensaje
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Datos de contacto y WhatsApp */}
        <div className="col-12 col-lg-4">
          <div className="p-4 mb-3" style={{ backgroundColor: '#121620', border: '1px solid #22293a', borderRadius: '14px' }}>
            <h5 className="fw-bold mb-3" style={{ color: '#ffffff' }}>¿Necesitas ayuda urgente?</h5>
            <p className="small" style={{ color: '#94a3b8' }}>
              Nuestro equipo de soporte técnico te atiende directamente por WhatsApp.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_SOPORTE}?text=${encodeURIComponent('Hola Level-Up Gamer, necesito soporte técnico')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success w-100 fw-bold"
            >
              <i className="bi bi-whatsapp me-2"></i>Escribir por WhatsApp
            </a>
          </div>

          <div className="p-4" style={{ backgroundColor: '#121620', border: '1px solid #22293a', borderRadius: '14px', color: '#cbd5e1' }}>
            <p className="mb-2"><i className="bi bi-envelope text-info me-2"></i>contacto@levelup.cl</p>
            <p className="mb-2"><i className="bi bi-clock text-info me-2"></i>Lunes a viernes, 9:00 a 18:00</p>
            <p className="mb-0"><i className="bi bi-geo-alt text-info me-2"></i>Tienda 100% online · Chile</p>
          </div>
        </div>
      </div>
    </div>
  );
}
