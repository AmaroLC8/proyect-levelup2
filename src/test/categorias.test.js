import { describe, it, expect, beforeEach } from 'vitest';
import {
  obtenerCategorias,
  guardarCategorias,
  obtenerCategoriasActivas,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  contarProductosPorCategoria,
} from '../data/categorias';
import { obtenerProductoPorId } from '../data/productos';

describe('Pruebas unitarias en data/categorias.js', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe retornar las categorías iniciales por defecto si localStorage está vacío', () => {
    const categorias = obtenerCategorias();
    expect(categorias.length).toBeGreaterThan(0);
    expect(categorias[0]).toHaveProperty('nombre');
  });

  it('debe guardar y recuperar nuevas categorías en localStorage', () => {
    const listaPrueba = [
      { id: '100', nombre: 'Categoría Test', descripcion: 'Prueba', activa: true }
    ];

    guardarCategorias(listaPrueba);
    const recuperadas = obtenerCategorias();

    expect(recuperadas.length).toBe(1);
    expect(recuperadas[0].nombre).toBe('Categoría Test');
  });

  it('crearCategoria rechaza nombres repetidos aunque cambien mayúsculas o espacios', () => {
    const repetida = crearCategoria({ nombre: '  consolas ', descripcion: '' });
    expect(repetida.ok).toBe(false);
    expect(repetida.error).toMatch(/ya existe/i);

    const nueva = crearCategoria({ nombre: 'Accesorios', descripcion: 'Fundas y cables' });
    expect(nueva.ok).toBe(true);
    expect(obtenerCategorias()).toHaveLength(6);
  });

  it('actualizarCategoria al renombrar mueve sus productos al nuevo nombre (RF17)', () => {
    const resultado = actualizarCategoria(3, { nombre: 'Sillas Gamer' });

    expect(resultado.ok).toBe(true);
    expect(obtenerProductoPorId(2).categoria).toBe('Sillas Gamer');
    expect(contarProductosPorCategoria('Sillas Gamer')).toBe(1);
  });

  it('eliminarCategoria no permite borrar categorías con productos asociados', () => {
    const conProductos = eliminarCategoria(2); // Periféricos: teclado y mouse
    expect(conProductos.ok).toBe(false);
    expect(conProductos.error).toMatch(/2 producto/);

    const vacia = eliminarCategoria(5); // Computadores Gamer: sin productos
    expect(vacia.ok).toBe(true);
    expect(obtenerCategorias()).toHaveLength(4);
  });

  it('obtenerCategoriasActivas oculta las categorías desactivadas', () => {
    actualizarCategoria(4, { activa: false });

    const nombres = obtenerCategoriasActivas().map((c) => c.nombre);
    expect(nombres).not.toContain('Juegos de Mesa');
    expect(nombres).toHaveLength(4);
  });
});
