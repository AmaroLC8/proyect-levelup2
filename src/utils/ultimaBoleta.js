// Guarda en el navegador la última boleta que respondió el backend al pagar (POST /boletas).
// La usan las páginas de resultado (/pago-exitoso y /pago-error) y el botón "Volver a realizar el pago",
// que precarga el checkout con los datos del cliente de esa boleta.
// Se guarda en localStorage para que la página de resultado siga funcionando si se recarga.

const CLAVE = 'levelup_ultima_boleta';

export const guardarUltimaBoleta = (boleta) => {
  localStorage.setItem(CLAVE, JSON.stringify(boleta));
};

// Devuelve la boleta guardada, o null si no hay (o si el texto guardado está dañado)
export const obtenerUltimaBoleta = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE));
  } catch {
    return null;
  }
};
