// Formatea un monto en pesos chilenos, ej: 499990 -> "$499.990"
export const formatearDinero = (monto) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto ?? 0);

// Formatea una fecha ISO a dd-mm-aaaa, ej: "2026-10-21T15:30:00" -> "21-10-2026"
export const formatearFecha = (fecha) => (fecha ? new Date(fecha).toLocaleDateString('es-CL') : 'N/A');
