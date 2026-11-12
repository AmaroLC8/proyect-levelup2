import { peticion } from './api';

// Funciones para los endpoints de autenticación del backend (/api/v1/auth).
// - login y registro son públicos.
// - me y perfil necesitan el token: api.js lo envía solo en el header "Authorization: Bearer <token>".
//   El backend saca el correo del token, así cada usuario solo puede ver y editar sus propios datos.
// Los datos del usuario llegan como UsuarioResponse (sin contraseña):
// { id, nombre, apellidos, correo, fechaNacimiento, rol, descuentoDuoc, puntos, codigoReferido, referidoPor }
// El rol viene en mayúsculas: "ADMIN", "VENDEDOR" o "CLIENTE".

/**
 * POST /auth/login → { token, tipo: "Bearer", usuario }.
 * Si el correo o la contraseña son incorrectos, el backend responde 401 "Correo o contraseña incorrectos".
 */
export const login = (correo, password) =>
  peticion('/auth/login', { method: 'POST', body: { correo, password } });

/**
 * POST /auth/registro → 201 con el usuario creado (rol CLIENTE). NO entrega token:
 * después hay que iniciar sesión (AuthContext.registrarse lo hace automáticamente).
 * Errores: 409 correo repetido, 400 menor de edad, código de referido inexistente o datos inválidos.
 */
export const registro = (datos) => peticion('/auth/registro', { method: 'POST', body: datos });

/** GET /auth/me → el usuario dueño del token. 401 si el token no existe, es inválido o venció. */
export const obtenerSesion = () => peticion('/auth/me');

/** GET /auth/perfil → los datos del perfil del usuario con sesión. */
export const obtenerPerfil = () => peticion('/auth/perfil');

/**
 * PUT /auth/perfil → el perfil actualizado.
 * Recibe { nombre, apellidos, fechaNacimiento, password } (password vacía = mantener la actual).
 * No se puede cambiar el correo, el rol, los puntos ni el descuento Duoc.
 */
export const actualizarPerfil = (datos) => peticion('/auth/perfil', { method: 'PUT', body: datos });
