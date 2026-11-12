import { vi } from 'vitest';
import * as boletasService from '../services/boletasService';
import { PRODUCTOS_PRUEBA, errorDelBackend } from './backendSimulado';
import { ADMIN, PEDRO } from './sesionSimulada';

// Boletas simuladas para las pruebas (no se llama al backend real).
// Cada archivo de prueba reemplaza el service con
//   vi.mock('../services/boletasService');
// y en beforeEach llama a simularBoletas(), que calcula las boletas igual que BoletaService del backend:
// precio de oferta, 20% de descuento Duoc, neto, IVA, pago rechazado si el correo contiene "error"
// y error 409 si no hay stock suficiente.

const copia = (datos) => JSON.parse(JSON.stringify(datos));
const producto = (id) => copia(PRODUCTOS_PRUEBA.find((p) => p.id === id));

// Arma un detalle como lo responde el backend: { id, producto, cantidad, precioUnitario, subtotal }
const detalle = (id, idProducto, cantidad, precioUnitario) => ({
  id, producto: producto(idProducto), cantidad, precioUnitario, subtotal: precioUnitario * cantidad,
});

// Dos boletas de ejemplo para el panel (formato de la entidad Boleta del backend)
export const BOLETAS_PRUEBA = [
  {
    id: 2,
    numeroOrden: '20261112-002',
    fecha: '2026-11-12T11:05:00',
    estado: 'RECHAZADA',
    usuario: null,
    nombreCliente: 'Ana', apellidosCliente: 'Soto', correoCliente: 'ana.error@gmail.com',
    calle: 'Av. Siempre Viva 742', depto: '', region: 'Maule', comuna: 'Talca', indicaciones: '',
    detalles: [detalle(3, 1, 1, 499990)],
    subtotal: 499990, descuento: 0, neto: 420160, iva: 79830, total: 499990,
  },
  {
    id: 1,
    numeroOrden: '20261112-001',
    fecha: '2026-11-12T09:30:00',
    estado: 'PAGADA',
    usuario: { ...PEDRO },
    nombreCliente: 'Pedro', apellidosCliente: 'Hacker', correoCliente: 'pedro@duocuc.cl',
    calle: 'Los Crisantemos 123', depto: 'Depto 603', region: 'Región Metropolitana de Santiago',
    comuna: 'Cerrillos', indicaciones: 'Dejar en conserjería',
    detalles: [detalle(1, 3, 1, 27990), detalle(2, 11, 2, 49990)],
    subtotal: 127970, descuento: 25594, neto: 86030, iva: 16346, total: 102376,
  },
];

// Usuario dueño del token guardado por simularSesion ("token-<id>"), o null si es visitante
const usuarioDelToken = () =>
  [ADMIN, PEDRO].find((u) => localStorage.getItem('token') === `token-${u.id}`) ?? null;

/**
 * Hace que las funciones simuladas de boletasService respondan como el backend.
 * Devuelve la "base de datos" ({ boletas, productos }) para que la prueba revise lo que se guardó.
 */
export const simularBoletas = () => {
  const db = { boletas: copia(BOLETAS_PRUEBA), productos: copia(PRODUCTOS_PRUEBA) };

  // POST /boletas: misma lógica que BoletaService.crear
  vi.mocked(boletasService.crearBoleta).mockImplementation(async (request) => {
    let idDetalle = 100;
    const detalles = request.items.map((item) => {
      const prod = db.productos.find((p) => p.id === item.productoId);
      if (!prod) throw errorDelBackend(404, `No existe el producto con id ${item.productoId}`);
      if (prod.stock < item.cantidad) {
        throw errorDelBackend(409, `Stock insuficiente para '${prod.nombre}': disponible ${prod.stock}, solicitado ${item.cantidad}`);
      }
      const precio = prod.precioOferta && prod.precioOferta < prod.precio ? prod.precioOferta : prod.precio;
      idDetalle += 1;
      return { id: idDetalle, producto: copia(prod), cantidad: item.cantidad, precioUnitario: precio, subtotal: precio * item.cantidad };
    });

    const usuario = usuarioDelToken();
    const subtotal = detalles.reduce((suma, d) => suma + d.subtotal, 0);
    const descuento = usuario?.descuentoDuoc ? Math.round(subtotal * 0.2) : 0;
    const total = subtotal - descuento;
    const neto = Math.round(total / 1.19);
    const estado = request.correo.toLowerCase().includes('error') ? 'RECHAZADA' : 'PAGADA';

    // Solo una boleta pagada descuenta stock
    if (estado === 'PAGADA') {
      request.items.forEach((item) => {
        db.productos.find((p) => p.id === item.productoId).stock -= item.cantidad;
      });
    }

    const id = Math.max(0, ...db.boletas.map((b) => b.id)) + 1;
    const boleta = {
      id,
      numeroOrden: `20261112-${String(id).padStart(3, '0')}`,
      fecha: '2026-11-12T15:00:00',
      estado,
      usuario,
      nombreCliente: request.nombre, apellidosCliente: request.apellidos, correoCliente: request.correo,
      calle: request.calle, depto: request.depto, region: request.region, comuna: request.comuna,
      indicaciones: request.indicaciones,
      detalles, subtotal, descuento, neto, iva: total - neto, total,
    };
    db.boletas.unshift(boleta); // la más reciente primero, como GET /boletas
    return copia(boleta);
  });

  vi.mocked(boletasService.listarBoletas).mockImplementation(async () => copia(db.boletas));

  vi.mocked(boletasService.obtenerBoleta).mockImplementation(async (id) => {
    const encontrada = db.boletas.find((b) => b.id === Number(id));
    if (!encontrada) throw errorDelBackend(404, `No existe la boleta con id ${id}`);
    return copia(encontrada);
  });

  vi.mocked(boletasService.obtenerPorNumero).mockImplementation(async (numeroOrden) => {
    const encontrada = db.boletas.find((b) => b.numeroOrden === numeroOrden);
    if (!encontrada) throw errorDelBackend(404, `No existe la boleta con número ${numeroOrden}`);
    return copia(encontrada);
  });

  vi.mocked(boletasService.misCompras).mockImplementation(async () => {
    const usuario = usuarioDelToken();
    if (!usuario) throw errorDelBackend(401, 'Debes iniciar sesión para acceder a este recurso');
    return copia(db.boletas.filter((b) => b.usuario?.id === usuario.id));
  });

  return {
    get boletas() { return db.boletas; },
    get productos() { return db.productos; },
  };
};
