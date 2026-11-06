// Tasas usadas para calcular los totales de una compra

// Descuento de por vida para usuarios registrados con correo Duoc (RF1 y RF3)
export const PORCENTAJE_DESCUENTO_DUOC = 20;

// IVA vigente en Chile. Los precios de la tienda ya lo incluyen (precio bruto)
export const TASA_IVA = 19;

// Separa un monto con IVA incluido en neto + IVA, ej: 11900 -> { neto: 10000, iva: 1900 }
// El IVA se calcula como la diferencia para que neto + iva sea siempre igual al total
export const desglosarIva = (totalConIva) => {
  const neto = Math.round(totalConIva / (1 + TASA_IVA / 100));
  return { neto, iva: totalConIva - neto };
};
