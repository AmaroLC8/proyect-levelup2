import { peticion } from './api';

// Funciones para el mantenedor de usuarios del backend (/api/v1/usuarios). Todos los endpoints son solo ADMIN.
// Cada usuario llega como UsuarioResponse (SIN contraseña):
// { id, nombre, apellidos, correo, fechaNacimiento, rol, descuentoDuoc, puntos, codigoReferido, referidoPor }
// Para crear o editar se envía un UsuarioRequest: { nombre, apellidos, correo, password, fechaNacimiento, rol }
// - rol en mayúsculas: "ADMIN", "VENDEDOR" o "CLIENTE".
// - password: obligatoria al crear; al editar, vacía = se mantiene la actual.

/**
 * GET /usuarios?rol=VENDEDOR → lista filtrada por rol. Sin rol, devuelve todos.
 * Un rol que no existe responde 400.
 */
export const listarUsuarios = (rol) =>
  peticion(rol ? `/usuarios?rol=${encodeURIComponent(rol)}` : '/usuarios');

/** GET /usuarios/{id} → el usuario, o 404 si no existe. */
export const obtenerUsuario = (id) => peticion(`/usuarios/${id}`);

/** POST /usuarios → 201 con el usuario creado. 400 datos inválidos o menor de 18; 409 correo repetido. */
export const crearUsuario = (datos) => peticion('/usuarios', { method: 'POST', body: datos });

/** PUT /usuarios/{id} → el usuario actualizado (el descuento Duoc se recalcula según el correo). 409 si el correo es de otro. */
export const actualizarUsuario = (id, datos) =>
  peticion(`/usuarios/${id}`, { method: 'PUT', body: datos });

/** DELETE /usuarios/{id} → 204 sin contenido; 409 si el usuario tiene boletas asociadas. */
export const eliminarUsuario = (id) => peticion(`/usuarios/${id}`, { method: 'DELETE' });
