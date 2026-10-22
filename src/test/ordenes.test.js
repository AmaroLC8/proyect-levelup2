import { describe, it, expect, beforeEach } from 'vitest';
import {
  obtenerOrdenes,
  obtenerOrdenPorId,
  obtenerOrdenesPorUsuario,
  obtenerOrdenesPagadas,
  ordenarPorFechaDesc,
  obtenerUltimaOrden,
  crearOrden,
  actualizarOrden,
  eliminarOrden,
} from '../data/ordenes';

// Orden mínima con los campos que guarda el checkout
const ordenDePrueba = (estado) => ({
  estado,
  usuarioId: null,
  cliente: {
    nombre: 'Ana', apellidos: 'Soto', correo: 'ana@gmail.com',
    calle: 'Av. Siempre Viva 742', depto: '', region: 'Maule', comuna: 'Talca', indicaciones: '',
  },
  items: [{ id: 5, nombre: 'Mouse Gamer', precio: 29990, cantidad: 1 }],
  subtotal: 29990,
  descuento: 0,
  total: 29990,
});

describe('Pruebas unitarias en data/ordenes.js (CRUD)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('carga las 2 órdenes de ejemplo para el panel de administración', () => {
    expect(obtenerOrdenes()).toHaveLength(2);
  });

  it('crearOrden agrega id, fecha y un número de orden con fecha y correlativo', () => {
    const orden = crearOrden(ordenDePrueba('pagada'));

    expect(typeof orden.id).toBe('number');
    expect(orden.numeroOrden).toMatch(/^\d{8}-003$/);
    expect(new Date(orden.fecha).toString()).not.toBe('Invalid Date');
    expect(obtenerUltimaOrden().id).toBe(orden.id);
    expect(obtenerOrdenPorId(orden.id).cliente.nombre).toBe('Ana');
  });

  it('obtenerOrdenesPagadas excluye las órdenes rechazadas', () => {
    crearOrden(ordenDePrueba('rechazada'));

    expect(obtenerOrdenes()).toHaveLength(3);
    expect(obtenerOrdenesPagadas()).toHaveLength(2);
    expect(obtenerOrdenesPagadas().every((o) => o.estado === 'pagada')).toBe(true);
  });

  it('ordenarPorFechaDesc deja primero la más reciente sin modificar la lista original', () => {
    const originales = obtenerOrdenes();
    const ordenadas = ordenarPorFechaDesc(originales);

    expect(ordenadas.map((o) => o.numeroOrden)).toEqual(['20261012-002', '20261001-001']);
    expect(originales[0].numeroOrden).toBe('20261001-001');
  });

  it('filtra por usuario y permite actualizar y eliminar órdenes', () => {
    expect(obtenerOrdenesPorUsuario(2)).toHaveLength(1);

    actualizarOrden(1, { estado: 'rechazada' });
    expect(obtenerOrdenPorId(1).estado).toBe('rechazada');

    eliminarOrden(2);
    expect(obtenerOrdenes()).toHaveLength(1);
  });
});
