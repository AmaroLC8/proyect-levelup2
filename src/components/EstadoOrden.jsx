import React from 'react';

const ESTADOS = {
  pagada: { texto: 'Pagada', clase: 'bg-success' },
  rechazada: { texto: 'Rechazada', clase: 'bg-danger' },
};

// Etiqueta de color según el estado de la orden
export default function EstadoOrden({ estado }) {
  const { texto, clase } = ESTADOS[estado] ?? { texto: estado || 'Sin estado', clase: 'bg-secondary' };
  return <span className={`badge ${clase}`}>{texto}</span>;
}
