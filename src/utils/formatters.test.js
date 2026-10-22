import { describe, it, expect } from 'vitest';
import { formatearDinero, formatearFecha } from './formatters';

describe('Pruebas unitarias en formatters.js', () => {
  describe('formatearDinero', () => {
    it('debe formatear un número correctamente a pesos chilenos (CLP)', () => {
      const resultado = formatearDinero(15000);
      // Remueve espacios de no separación para comparación uniforme
      const formateadoLimpio = resultado.replace(/\s/g, ' ');
      expect(formateadoLimpio).toContain('15.000');
    });

    it('debe retornar $0 si se pasa 0 o un valor nulo', () => {
      const resultadoZero = formatearDinero(0).replace(/\s/g, ' ');
      const resultadoNull = formatearDinero(null).replace(/\s/g, ' ');
      
      expect(resultadoZero).toContain('0');
      expect(resultadoNull).toContain('0');
    });
  });

  describe('formatearFecha', () => {
    it('debe retornar una fecha formateada en español', () => {
      const fechaPrueba = '2026-10-21T00:00:00';
      const resultado = formatearFecha(fechaPrueba);
      expect(resultado).toContain('2026');
    });

    it('debe retornar "N/A" si la fecha es nula o indefinida', () => {
      expect(formatearFecha(null)).toBe('N/A');
      expect(formatearFecha(undefined)).toBe('N/A');
    });
  });
});
