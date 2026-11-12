// Función base para llamar a la API REST del backend (Spring Boot).
// Todos los services (productosService, categoriasService, ...) usan "peticion" en vez de
// llamar a fetch directamente, así la URL, el token y el manejo de errores están en un solo lugar.

// La URL viene del archivo .env (VITE_API_URL). Si no existe, se usa la del backend local.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Mensaje cuando el backend está apagado o no se puede alcanzar (fetch falla sin respuesta)
export const MENSAJE_SIN_CONEXION =
  'No se pudo conectar con el servidor. Revisa que el backend esté encendido.';

// Arma los headers de la petición. Si hay un token guardado (login con JWT),
// se envía como "Authorization: Bearer <token>" para que el backend sepa quién es el usuario.
const armarHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// Lee el cuerpo de la respuesta como JSON. Si viene vacío (ej: 204 No Content al eliminar)
// devuelve null en vez de fallar.
const leerJson = async (respuesta) => {
  const texto = await respuesta.text();
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
};

// Arma el mensaje de error a partir del JSON de error del backend (ErrorResponse):
// { status, error, mensaje, fecha, campos? }. Si hay "campos" (errores de @Valid),
// se agregan al mensaje para que el usuario sepa qué dato corregir.
const armarMensajeError = (datos, respuesta) => {
  let mensaje = datos?.mensaje || `Error ${respuesta.status} al comunicarse con el servidor`;
  if (datos?.campos) {
    mensaje += ': ' + Object.values(datos.campos).join('. ');
  }
  return mensaje;
};

/**
 * Hace una petición a la API y devuelve la respuesta ya convertida a JSON.
 * - ruta: parte final de la URL, ej: '/productos' o '/productos/5'.
 * - opciones: { method, body } (body es un objeto JavaScript; aquí se convierte a JSON).
 * Si el backend responde con error (400, 401, 403, 404, 409, 500...) lanza un Error con el
 * "mensaje" del backend y le agrega "status", para que la página pueda distinguir, por ejemplo,
 * un 404 (no existe) de un backend caído.
 */
export const peticion = async (ruta, opciones = {}) => {
  const configuracion = {
    method: opciones.method || 'GET',
    headers: armarHeaders(),
  };
  if (opciones.body !== undefined) {
    configuracion.body = JSON.stringify(opciones.body);
  }

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, configuracion);
  } catch {
    // fetch solo lanza error cuando no hubo respuesta (servidor apagado, sin red, CORS)
    throw new Error(MENSAJE_SIN_CONEXION);
  }

  const datos = await leerJson(respuesta);

  if (!respuesta.ok) {
    const error = new Error(armarMensajeError(datos, respuesta));
    error.status = respuesta.status;
    throw error;
  }

  return datos;
};
