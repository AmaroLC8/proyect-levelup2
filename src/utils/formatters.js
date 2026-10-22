/**
 * Convierte un valor numérico al formato de moneda local de Chile (CLP).
 * Ejemplo: 12500 -> "$12.500"
 */
export const formatearDinero = (monto) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(monto || 0);
};

/**
 * Formatea una fecha a cadena legible en español de Chile.
 * Ejemplo: "2026-10-21" -> "21/10/2026"
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-CL');
};