import React from 'react';

// PAGADA y RECHAZADA son los estados que envía el backend (enum EstadoBoleta).
// "pagada" y "rechazada" (minúsculas) son de las órdenes locales de data/ordenes.js,
// que todavía usan el Dashboard y AdminUsuarios (se eliminan en la tarea F4).
const ESTADOS = {
  PAGADA: { texto: 'Pagada', clase: 'bg-success' },
  RECHAZADA: { texto: 'Rechazada', clase: 'bg-danger' },
  pagada: { texto: 'Pagada', clase: 'bg-success' },
  rechazada: { texto: 'Rechazada', clase: 'bg-danger' },
};

// Etiqueta de color según el estado de la orden
export default function EstadoOrden({ estado }) {
  const { texto, clase } = ESTADOS[estado] ?? { texto: estado || 'Sin estado', clase: 'bg-secondary' };
  return <span className={`badge ${clase}`}>{texto}</span>;
}
