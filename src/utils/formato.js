// Formatea un monto en pesos chilenos, ej: 499990 -> "$499.990"
export const formatearDinero = (monto) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
