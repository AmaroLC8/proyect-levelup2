import { describe, it, expect, beforeEach } from 'vitest';
import { obtenerCategorias, guardarCategorias } from './categorias';

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
});
