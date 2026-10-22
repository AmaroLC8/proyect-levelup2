import { describe, it, expect, beforeEach } from 'vitest';
import {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  descontarStock,
  obtenerProductosCriticos,
  esOferta,
  obtenerPrecioFinal,
  obtenerPorcentajeDescuento,
  obtenerProductosEnOferta,
  reemplazarCategoriaEnProductos,
  IMAGEN_POR_DEFECTO,
} from '../data/productos';

describe('Pruebas unitarias en data/productos.js (CRUD)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('carga los 5 productos iniciales y los guarda en localStorage', () => {
    expect(obtenerProductos()).toHaveLength(5);
    expect(JSON.parse(localStorage.getItem('levelup_productos'))).toHaveLength(5);
  });

  it('crearProducto asigna id numérico, convierte los números e imagen por defecto', () => {
    const nuevo = crearProducto({
      nombre: 'Monitor 27"',
      categoria: 'Computadores Gamer',
      precio: '199990',
      stock: '7',
      stockCritico: '2',
      imagen: '',
    });

    expect(typeof nuevo.id).toBe('number');
    expect(nuevo.precio).toBe(199990);
    expect(nuevo.stock).toBe(7);
    expect(nuevo.imagen).toBe(IMAGEN_POR_DEFECTO);
    expect(obtenerProductoPorId(nuevo.id).nombre).toBe('Monitor 27"');
  });

  it('actualizarProducto cambia solo los datos indicados y mantiene el id', () => {
    actualizarProducto(1, { precio: '450000', stock: '3' });

    const ps5 = obtenerProductoPorId(1);
    expect(ps5.precio).toBe(450000);
    expect(ps5.stock).toBe(3);
    expect(ps5.nombre).toBe('PlayStation 5 Slim 1TB');
  });

  it('eliminarProducto quita el producto de la lista', () => {
    eliminarProducto(3);

    expect(obtenerProductoPorId(3)).toBeUndefined();
    expect(obtenerProductos()).toHaveLength(4);
  });

  it('obtenerProductosCriticos devuelve los productos con stock igual o menor a su stock crítico (RF15)', () => {
    const nombres = obtenerProductosCriticos().map((p) => p.nombre);
    expect(nombres).toEqual(['Silla Gamer Ergonómica Pro', 'Mouse Gamer 16000 DPI Sensor Óptico']);
  });

  it('descontarStock resta lo vendido sin bajar de 0', () => {
    descontarStock([
      { id: 1, cantidad: 2 },
      { id: 5, cantidad: 10 },
    ]);

    expect(obtenerProductoPorId(1).stock).toBe(6);
    expect(obtenerProductoPorId(5).stock).toBe(0);
  });

  it('calcula precio final y % de descuento solo cuando la oferta es menor al precio (RF9)', () => {
    const silla = obtenerProductoPorId(2);
    expect(esOferta(silla)).toBe(true);
    expect(obtenerPrecioFinal(silla)).toBe(129990);
    expect(obtenerPorcentajeDescuento(silla)).toBe(19);

    const ps5 = obtenerProductoPorId(1);
    expect(esOferta(ps5)).toBe(false);
    expect(obtenerPrecioFinal(ps5)).toBe(499990);
    expect(esOferta({ precio: 1000, precioOferta: 1500 })).toBe(false);

    expect(obtenerProductosEnOferta()).toHaveLength(3);
  });

  it('reemplazarCategoriaEnProductos mueve los productos al nuevo nombre de categoría', () => {
    reemplazarCategoriaEnProductos('Periféricos', 'Accesorios');

    const categorias = obtenerProductos().map((p) => p.categoria);
    expect(categorias).not.toContain('Periféricos');
    expect(categorias.filter((c) => c === 'Accesorios')).toHaveLength(2);
  });
});
