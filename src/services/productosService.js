import { peticion } from './api';

// Funciones para los endpoints de productos del backend (/api/v1/productos).
// Cada producto llega con su categoría como objeto: { id, nombre, ..., categoria: { id, nombre, descripcion, activa } }.
// Para crear o actualizar, el backend espera un ProductoRequest, donde la categoría va solo como "categoriaId".
// Acceso (SecurityConfig del backend): los GET son públicos, salvo /criticos (ADMIN y VENDEDOR);
// crear, actualizar y eliminar son solo para ADMIN.

/**
 * GET /productos?categoriaId=&buscar=
 * Los dos filtros son opcionales: solo se agregan a la URL los que vienen.
 * Ej: listarProductos({ categoriaId: 2 }) → GET /productos?categoriaId=2
 */
export const listarProductos = (filtros = {}) => {
  const parametros = new URLSearchParams();
  if (filtros.categoriaId) parametros.append('categoriaId', filtros.categoriaId);
  if (filtros.buscar) parametros.append('buscar', filtros.buscar);

  const consulta = parametros.toString();
  return peticion(consulta ? `/productos?${consulta}` : '/productos');
};

/** GET /productos/{id} → el producto, o error 404 si no existe. */
export const obtenerProducto = (id) => peticion(`/productos/${id}`);

/** GET /productos/ofertas → productos con precio de oferta menor al precio normal. */
export const listarOfertas = () => peticion('/productos/ofertas');

/** GET /productos/criticos → productos con stock menor o igual a su stock crítico (requiere token ADMIN o VENDEDOR). */
export const listarCriticos = () => peticion('/productos/criticos');

/** POST /productos → crea el producto (datos en formato ProductoRequest) y responde 201 con el producto guardado. */
export const crearProducto = (datos) => peticion('/productos', { method: 'POST', body: datos });

/** PUT /productos/{id} → actualiza el producto y responde el producto actualizado. */
export const actualizarProducto = (id, datos) =>
  peticion(`/productos/${id}`, { method: 'PUT', body: datos });

/** DELETE /productos/{id} → 204 sin contenido; 409 si el producto ya aparece en una boleta. */
export const eliminarProducto = (id) => peticion(`/productos/${id}`, { method: 'DELETE' });
