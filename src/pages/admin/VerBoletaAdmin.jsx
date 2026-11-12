import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerBoleta } from '../../services/boletasService';
import ResumenOrden from '../../components/ResumenOrden';
import EstadoOrden from '../../components/EstadoOrden';
import EstadoCarga from '../../components/EstadoCarga';

// Lee el id de la URL y dibuja la boleta con key={id}: si cambia el id, React crea el componente
// de nuevo (vuelve a "Cargando...") en vez de mostrar la boleta anterior (igual que DetalleProducto).
export default function VerBoletaAdmin() {
  const { id } = useParams();
  return <BoletaDelPanel key={id} id={id} />;
}

// Detalle de una boleta para ADMIN y VENDEDOR (GET /boletas/{id})
function BoletaDelPanel({ id }) {
  const [orden, setOrden] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerBoleta(id)
      .then((datos) => setOrden(datos))
      .catch((err) => {
        // Un 404 se muestra como "Orden no encontrada" (más abajo); otro error, en la alerta
        if (err.status !== 404) setError(err.message);
      })
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando || error) {
    return (
      <div className="container py-3">
        <EstadoCarga cargando={cargando} error={error} />
        <Link to="/admin/ordenes" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i>Volver al listado
        </Link>
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="container py-5 text-center text-light">
        <h4 className="text-danger mb-3">Orden no encontrada</h4>
        <p className="text-secondary">No se encontró información para la orden solicitada.</p>
        <Link to="/admin/ordenes" className="btn btn-outline-info">
          <i className="bi bi-arrow-left me-2"></i>Volver a Órdenes
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-3 text-light" style={{ maxWidth: '850px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/admin/ordenes" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i>Volver al listado
        </Link>
        <button className="btn btn-info btn-sm" onClick={() => window.print()}>
          <i className="bi bi-printer me-1"></i>Imprimir Boleta
        </button>
      </div>

      <div className="card bg-dark border-info shadow-lg p-4">
        {/* Cabecera Boleta */}
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 border-bottom border-secondary pb-3 mb-4">
          <div>
            <h3 className="fw-bold text-info mb-0">LEVEL-UP GAMER</h3>
            <p className="small text-secondary mb-0">Comprobante de compra</p>
            {/* usuario es null cuando compró un visitante (sin cuenta) */}
            <p className="small text-secondary mb-0">
              {orden.usuario ? `Cliente registrado: ${orden.usuario.correo}` : 'Compra como visitante'}
            </p>
          </div>
          <div className="text-end">
            <span className="badge bg-info text-dark fs-6 mb-2">BOLETA ELECTRÓNICA</span>
            <h5 className="fw-bold mb-1">N° {orden.numeroOrden}</h5>
            <small className="text-secondary d-block mb-1">
              Fecha: {new Date(orden.fecha).toLocaleString('es-CL')}
            </small>
            <EstadoOrden estado={orden.estado} />
          </div>
        </div>

        <ResumenOrden
          orden={orden}
          etiquetaTotal={orden.estado === 'PAGADA' ? 'Total pagado' : 'Monto no pagado'}
        />
      </div>
    </div>
  );
}
