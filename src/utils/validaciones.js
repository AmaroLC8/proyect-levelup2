// Reglas de validación compartidas por los formularios (registro, login, checkout, contacto, perfiles y admin)

export const esCorreoValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim());

// Correos institucionales con 20% de descuento de por vida (RF1)
export const esCorreoDuoc = (correo) => /@(duoc|duocuc)\.cl$/i.test(correo.trim());

// Nombres y apellidos: solo letras (con tildes y ñ), entre 2 y 50 caracteres, y palabras
// separadas por un espacio, guion o apóstrofe. Ej: "María José", "Pérez-Cotapos", "O'Higgins"
export const esNombreValido = (texto) => {
  const limpio = texto.trim();
  return limpio.length >= 2 && limpio.length <= 50 && /^\p{L}+(?:[ '-]\p{L}+)*$/u.test(limpio);
};

const FORMATO_NOMBRE = 'solo puede tener letras, espacios, guiones o apóstrofes (mínimo 2 letras)';

// Para formularios que muestran un solo mensaje: devuelve el primer error o null
export const validarNombreCompleto = (nombre, apellidos) => {
  if (!nombre.trim() || !apellidos.trim()) return 'Nombre y apellidos son obligatorios';
  if (!esNombreValido(nombre)) return `El nombre ${FORMATO_NOMBRE}`;
  if (!esNombreValido(apellidos)) return `El apellido ${FORMATO_NOMBRE}`;
  return null;
};

// Mínimo 8 caracteres, combinando letras y números (ERS 3.3.2)
export const esPasswordSegura = (password) =>
  password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);

export const calcularEdad = (fechaNacimiento, hoy = new Date()) => {
  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumple =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  return aunNoCumple ? edad - 1 : edad;
};

export const esMayorDeEdad = (fechaNacimiento) => calcularEdad(fechaNacimiento) >= 18;

// Devuelve un objeto { campo: mensaje } solo con los campos que tienen error
export const validarRegistro = (datos) => {
  const errores = {};
  if (!datos.nombre.trim()) errores.nombre = 'El nombre es obligatorio';
  else if (!esNombreValido(datos.nombre)) errores.nombre = `El nombre ${FORMATO_NOMBRE}`;
  if (!datos.apellidos.trim()) errores.apellidos = 'Los apellidos son obligatorios';
  else if (!esNombreValido(datos.apellidos)) errores.apellidos = `El apellido ${FORMATO_NOMBRE}`;
  if (!esCorreoValido(datos.correo)) errores.correo = 'Ingresa un correo electrónico válido';
  if (!datos.fechaNacimiento) {
    errores.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
  } else if (!esMayorDeEdad(datos.fechaNacimiento)) {
    errores.fechaNacimiento = 'Debes ser mayor de 18 años para registrarte';
  }
  if (!esPasswordSegura(datos.password)) {
    errores.password = 'Mínimo 8 caracteres, combinando letras y números';
  }
  if (datos.password !== datos.confirmarPassword) {
    errores.confirmarPassword = 'Las contraseñas no coinciden';
  }
  return errores;
};
