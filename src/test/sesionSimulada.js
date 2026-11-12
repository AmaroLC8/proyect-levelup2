import { vi } from 'vitest';
import * as authService from '../services/authService';
import { errorDelBackend } from './backendSimulado';

// Sesión simulada para las pruebas (no se llama al backend real).
// Cada archivo de prueba que use la sesión reemplaza el service con
//   vi.mock('../services/authService');
// y en beforeEach llama a simularAuth(), que da respuestas a login, registro, /auth/me y /auth/perfil
// usando los mismos 3 usuarios que crea el DataInitializer del backend.

// Usuarios como los responde el backend (UsuarioResponse: sin contraseña, rol en mayúsculas)
export const ADMIN = {
  id: 1, nombre: 'Admin', apellidos: 'Level-Up', correo: 'admin@levelup.cl', fechaNacimiento: '1995-05-10',
  rol: 'ADMIN', descuentoDuoc: false, puntos: 0, codigoReferido: 'LVLADMIN', referidoPor: null,
};
export const VENDEDOR = {
  id: 2, nombre: 'Vendedor', apellidos: 'Level-Up', correo: 'vendedor@levelup.cl', fechaNacimiento: '1998-03-15',
  rol: 'VENDEDOR', descuentoDuoc: false, puntos: 0, codigoReferido: 'LVLVENDE', referidoPor: null,
};
export const PEDRO = {
  id: 3, nombre: 'Pedro', apellidos: 'Hacker', correo: 'pedro@duocuc.cl', fechaNacimiento: '2002-08-20',
  rol: 'CLIENTE', descuentoDuoc: true, puntos: 100, codigoReferido: 'LVLPEDRO', referidoPor: null,
};

// Contraseñas de prueba (datos ficticios del enunciado)
const PASSWORDS = {
  'admin@levelup.cl': 'admin1234',
  'vendedor@levelup.cl': 'vendedor1234',
  'pedro@duocuc.cl': 'pedro1234',
};

// El token simulado es "token-<id>": así /auth/me sabe de quién es
const tokenDe = (usuario) => `token-${usuario.id}`;

/**
 * Guarda una sesión en localStorage (token + usuario), igual que AuthContext después del login.
 * Usar ANTES de renderizar, junto con simularAuth() para que /auth/me reconozca el token.
 */
export const simularSesion = (usuario) => {
  localStorage.setItem('token', tokenDe(usuario));
  localStorage.setItem('usuario', JSON.stringify(usuario));
};

/**
 * Hace que las funciones simuladas de authService respondan como el backend.
 * Devuelve la "base de datos" de usuarios para que la prueba revise lo que cambió.
 */
export const simularAuth = () => {
  const db = { usuarios: [ADMIN, VENDEDOR, PEDRO].map((u) => ({ ...u })) };
  const passwords = { ...PASSWORDS };

  // Usuario dueño del token guardado, o error 401 como SeguridadErrorHandler
  const usuarioDelToken = () => {
    const encontrado = db.usuarios.find((u) => tokenDe(u) === localStorage.getItem('token'));
    if (!encontrado) throw errorDelBackend(401, 'El token no es válido o expiró. Inicia sesión nuevamente');
    return encontrado;
  };

  vi.mocked(authService.login).mockImplementation(async (correo, password) => {
    const usuario = db.usuarios.find((u) => u.correo === correo.trim().toLowerCase());
    if (!usuario || passwords[usuario.correo] !== password) {
      throw errorDelBackend(401, 'Correo o contraseña incorrectos');
    }
    return { token: tokenDe(usuario), tipo: 'Bearer', usuario: { ...usuario } };
  });

  vi.mocked(authService.registro).mockImplementation(async (datos) => {
    const correo = datos.correo.trim().toLowerCase();
    if (db.usuarios.some((u) => u.correo === correo)) {
      throw errorDelBackend(409, `Ya existe un usuario registrado con el correo ${correo}`);
    }
    const referente = datos.codigoReferido
      ? db.usuarios.find((u) => u.codigoReferido === datos.codigoReferido.trim().toUpperCase())
      : null;
    if (datos.codigoReferido && !referente) {
      throw errorDelBackend(400, `El código de referido '${datos.codigoReferido.toUpperCase()}' no existe`);
    }
    if (referente) referente.puntos += 100;

    const nuevo = {
      id: db.usuarios.length + 1,
      nombre: datos.nombre, apellidos: datos.apellidos, correo, fechaNacimiento: datos.fechaNacimiento,
      rol: 'CLIENTE',
      descuentoDuoc: /@(duoc|duocuc)\.cl$/.test(correo),
      puntos: referente ? 100 : 0,
      codigoReferido: `LVL${datos.nombre.toUpperCase().slice(0, 5)}10`,
      referidoPor: referente ? referente.codigoReferido : null,
    };
    db.usuarios.push(nuevo);
    passwords[correo] = datos.password;
    return { ...nuevo };
  });

  vi.mocked(authService.obtenerSesion).mockImplementation(async () => ({ ...usuarioDelToken() }));
  vi.mocked(authService.obtenerPerfil).mockImplementation(async () => ({ ...usuarioDelToken() }));

  vi.mocked(authService.actualizarPerfil).mockImplementation(async (datos) => {
    const usuario = usuarioDelToken();
    usuario.nombre = datos.nombre;
    usuario.apellidos = datos.apellidos;
    usuario.fechaNacimiento = datos.fechaNacimiento;
    if (datos.password) passwords[usuario.correo] = datos.password;
    return { ...usuario };
  });

  return {
    get usuarios() { return db.usuarios; },
    passwordDe: (correo) => passwords[correo],
  };
};
