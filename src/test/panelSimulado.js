import { vi } from 'vitest';
import * as usuariosService from '../services/usuariosService';
import * as reportesService from '../services/reportesService';
import { PRODUCTOS_PRUEBA, errorDelBackend } from './backendSimulado';
import { BOLETAS_PRUEBA } from './boletasSimuladas';
import { ADMIN, VENDEDOR, PEDRO } from './sesionSimulada';

// Mantenedor de usuarios y reportes simulados para las pruebas del panel (no se llama al backend real).
// Cada archivo de prueba reemplaza los services con
//   vi.mock('../services/usuariosService');
//   vi.mock('../services/reportesService');
// y en beforeEach llama a simularUsuarios() y simularReportes().

const copia = (datos) => JSON.parse(JSON.stringify(datos));

// Edad en años cumplidos (misma regla que UsuarioService.validarMayorDeEdad)
const edad = (fechaNacimiento) => {
  const hoy = new Date();
  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  let anios = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumple =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  return aunNoCumple ? anios - 1 : anios;
};

/**
 * GET/POST/PUT/DELETE /usuarios con los 3 usuarios del DataInitializer.
 * Pedro (id 3) tiene boletas, así que eliminarlo responde 409 como en el backend.
 * Devuelve la "base de datos" para que la prueba revise lo que se guardó.
 */
export const simularUsuarios = () => {
  const db = { usuarios: copia([ADMIN, VENDEDOR, PEDRO]) };
  const idsConBoletas = [PEDRO.id];

  const correoDeOtro = (correo, idPropio) =>
    db.usuarios.some((u) => u.id !== idPropio && u.correo === correo.trim().toLowerCase());

  // Convierte un UsuarioRequest en UsuarioResponse (sin contraseña)
  const aRespuesta = (id, request, anterior = {}) => ({
    puntos: 0, codigoReferido: `LVL${request.nombre.toUpperCase().slice(0, 5)}10`, referidoPor: null,
    ...anterior,
    id,
    nombre: request.nombre, apellidos: request.apellidos, correo: request.correo.trim().toLowerCase(),
    fechaNacimiento: request.fechaNacimiento, rol: request.rol,
    descuentoDuoc: /@(duoc|duocuc)\.cl$/.test(request.correo.trim().toLowerCase()),
  });

  vi.mocked(usuariosService.listarUsuarios).mockImplementation(async (rol) =>
    copia(rol ? db.usuarios.filter((u) => u.rol === rol) : db.usuarios)
  );

  vi.mocked(usuariosService.obtenerUsuario).mockImplementation(async (id) => {
    const encontrado = db.usuarios.find((u) => u.id === Number(id));
    if (!encontrado) throw errorDelBackend(404, `No existe el usuario con id ${id}`);
    return copia(encontrado);
  });

  vi.mocked(usuariosService.crearUsuario).mockImplementation(async (request) => {
    if (correoDeOtro(request.correo)) {
      throw errorDelBackend(409, `Ya existe un usuario registrado con el correo ${request.correo.trim().toLowerCase()}`);
    }
    if (edad(request.fechaNacimiento) < 18) {
      throw errorDelBackend(400, 'Debes ser mayor de 18 años para registrarte');
    }
    if (!request.password) throw errorDelBackend(400, 'La contraseña es obligatoria al crear un usuario');
    const nuevo = aRespuesta(Math.max(...db.usuarios.map((u) => u.id)) + 1, request);
    db.usuarios.push(nuevo);
    return copia(nuevo);
  });

  vi.mocked(usuariosService.actualizarUsuario).mockImplementation(async (id, request) => {
    const indice = db.usuarios.findIndex((u) => u.id === Number(id));
    if (indice === -1) throw errorDelBackend(404, `No existe el usuario con id ${id}`);
    if (correoDeOtro(request.correo, Number(id))) {
      throw errorDelBackend(409, `Ya existe un usuario registrado con el correo ${request.correo.trim().toLowerCase()}`);
    }
    db.usuarios[indice] = aRespuesta(Number(id), request, db.usuarios[indice]);
    return copia(db.usuarios[indice]);
  });

  vi.mocked(usuariosService.eliminarUsuario).mockImplementation(async (id) => {
    const usuario = db.usuarios.find((u) => u.id === Number(id));
    if (!usuario) throw errorDelBackend(404, `No existe el usuario con id ${id}`);
    if (idsConBoletas.includes(usuario.id)) {
      throw errorDelBackend(409, `No se puede eliminar al usuario '${usuario.correo}' porque tiene boletas asociadas`);
    }
    db.usuarios = db.usuarios.filter((u) => u.id !== usuario.id);
    return null; // 204 No Content
  });

  return {
    get usuarios() { return db.usuarios; },
  };
};

// Respuesta de GET /reportes/dashboard (calculada a mano a partir de BOLETAS_PRUEBA y PRODUCTOS_PRUEBA)
export const DASHBOARD_PRUEBA = {
  ventasTotales: 102376, // solo la boleta PAGADA de Pedro
  ordenesRealizadas: 2, // la pagada y la rechazada
  totalProductos: 15,
  totalUsuarios: 3,
  productosCriticos: PRODUCTOS_PRUEBA.filter((p) => p.stock <= p.stockCritico), // 5 productos
  ultimasOrdenes: BOLETAS_PRUEBA,
};

// Respuesta de GET /reportes/ventas para la boleta pagada de Pedro (Catan x1 y Audífonos x2)
export const REPORTE_PRUEBA = {
  ingresosTotales: 102376,
  ordenesPagadas: 1,
  ticketPromedio: 102376,
  unidadesVendidas: 3,
  pagosRechazados: 1,
  totalDescuentos: 25594,
  ventasPorCategoria: [
    { categoria: 'Periféricos', monto: 99980 },
    { categoria: 'Juegos de Mesa', monto: 27990 },
  ],
  rankingProductos: [
    { productoId: 11, nombre: 'Audífonos Gamer 7.1 Surround', unidades: 2, monto: 99980 },
    { productoId: 3, nombre: 'Catan El Juego', unidades: 1, monto: 27990 },
  ],
};

/** GET /reportes/dashboard y GET /reportes/ventas responden los datos de prueba. */
export const simularReportes = () => {
  vi.mocked(reportesService.obtenerDashboard).mockImplementation(async () => copia(DASHBOARD_PRUEBA));
  vi.mocked(reportesService.obtenerReporteVentas).mockImplementation(async () => copia(REPORTE_PRUEBA));
};
