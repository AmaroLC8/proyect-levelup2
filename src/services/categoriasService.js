import { peticion } from './api';

// Funciones para los endpoints de categorías del backend (/api/v1/categorias).
// Cada categoría es { id, nombre, descripcion, activa }. Para crear o actualizar se envía
// un CategoriaRequest: { nombre, descripcion, activa }.
// Acceso (SecurityConfig del backend): los GET son públicos; crear, actualizar y eliminar solo ADMIN.

/** GET /categorias → todas las categorías (las usa el panel de administración). */
export const listarCategorias = () => peticion('/categorias');

/** GET /categorias/activas → solo las activas (las que se muestran en la tienda). */
export const listarCategoriasActivas = () => peticion('/categorias/activas');

/** GET /categorias/{id} → la categoría, o error 404 si no existe. */
export const obtenerCategoria = (id) => peticion(`/categorias/${id}`);

/** POST /categorias → 201 con la categoría creada; 409 si el nombre ya existe. */
export const crearCategoria = (datos) => peticion('/categorias', { method: 'POST', body: datos });

/** PUT /categorias/{id} → la categoría actualizada; 409 si el nombre es de otra categoría. */
export const actualizarCategoria = (id, datos) =>
  peticion(`/categorias/${id}`, { method: 'PUT', body: datos });

/** DELETE /categorias/{id} → 204 sin contenido; 409 si la categoría tiene productos. */
export const eliminarCategoria = (id) => peticion(`/categorias/${id}`, { method: 'DELETE' });
