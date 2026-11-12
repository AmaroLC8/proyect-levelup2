import React from 'react';

// Muestra el estado de una llamada a la API: un spinner mientras se espera la respuesta
// o una alerta de Bootstrap si falló. Cuando ya cargó sin errores no muestra nada.
// Uso: <EstadoCarga cargando={cargando} error={error} />
export default function EstadoCarga({ cargando, error }) {
  if (cargando) {
    return (
      <div className="text-center py-5" style={{ color: '#94a3b8' }}>
        <div className="spinner-border text-info" role="status" aria-hidden="true"></div>
        <p className="mt-3 mb-0">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <span>{error}</span>
      </div>
    );
  }

  return null;
}
