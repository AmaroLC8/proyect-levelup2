import { peticion } from './api';

// Funciones para los endpoints de boletas (órdenes de compra) del backend: /api/v1/boletas.
// La respuesta es la entidad Boleta:
// { id, numeroOrden, fecha, estado: "PAGADA" | "RECHAZADA", usuario (o null),
//   nombreCliente, apellidosCliente, correoCliente, calle, depto, region, comuna, indicaciones,
//   subtotal, descuento, neto, iva, total,
//   detalles: [{ id, producto: {...}, cantidad, precioUnitario, subtotal }] }
// Los montos los calcula el backend: el frontend nunca envía precios.

/**
 * POST /boletas (checkout). Acceso público: con token de CLIENTE la boleta queda a su nombre
 * (y aplica su descuento Duoc); sin token es una compra de visitante.
 * datos = { nombre, apellidos, correo, calle, depto, region, comuna, indicaciones,
 *           items: [{ productoId, cantidad }] }
 * Responde 201 con la boleta en estado PAGADA o RECHAZADA (pago simulado: correo con "error").
 * Errores: 400 datos inválidos, 404 producto inexistente, 409 stock insuficiente.
 */
export const crearBoleta = (datos) => peticion('/boletas', { method: 'POST', body: datos });

/** GET /boletas → todas, de la más reciente a la más antigua (ADMIN y VENDEDOR). */
export const listarBoletas = () => peticion('/boletas');

/** GET /boletas/{id} → una boleta con sus detalles; 404 si no existe (ADMIN y VENDEDOR). */
export const obtenerBoleta = (id) => peticion(`/boletas/${id}`);

/** GET /boletas/numero/{numeroOrden} → búsqueda por el número que ve el cliente, ej: 20261106-001. */
export const obtenerPorNumero = (numeroOrden) => peticion(`/boletas/numero/${numeroOrden}`);

/** GET /boletas/mis-compras → las boletas del usuario del token (CLIENTE y ADMIN). */
export const misCompras = () => peticion('/boletas/mis-compras');

/**
 * GET /boletas/usuario/{usuarioId} → historial de un usuario, de la más reciente a la más antigua
 * (lista vacía si no ha comprado). ADMIN puede ver el de cualquiera; un CLIENTE solo el suyo (403 si no).
 */
export const historialUsuario = (usuarioId) => peticion(`/boletas/usuario/${usuarioId}`);
