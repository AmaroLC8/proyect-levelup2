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

// Un producto está en oferta si tiene precio de oferta y es menor al precio normal
export const esOferta = (producto) =>
  Boolean(producto.precioOferta) && producto.precioOferta < producto.precio;

// Precio que paga el cliente: el de oferta si corresponde, si no el normal
export const obtenerPrecioFinal = (producto) =>
  esOferta(producto) ? producto.precioOferta : producto.precio;

// Porcentaje de descuento redondeado, ej: 159.990 → 129.990 = 19%
export const obtenerPorcentajeDescuento = (producto) =>
  esOferta(producto) ? Math.round((1 - producto.precioOferta / producto.precio) * 100) : 0;
