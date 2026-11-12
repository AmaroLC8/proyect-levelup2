import { describe, it, expect } from 'vitest';
import {
  desglosarIva,
  TASA_IVA,
  PORCENTAJE_DESCUENTO_DUOC,
  esOferta,
  obtenerPrecioFinal,
  obtenerPorcentajeDescuento,
} from '../utils/precios';
import { PRODUCTOS_PRUEBA } from './backendSimulado';

const producto = (id) => PRODUCTOS_PRUEBA.find((p) => p.id === id);

describe('Pruebas unitarias en utils/precios.js', () => {
  it('usa el IVA de Chile (19%) y el descuento Duoc (20%)', () => {
    expect(TASA_IVA).toBe(19);
    expect(PORCENTAJE_DESCUENTO_DUOC).toBe(20);
  });

  it('desglosarIva separa un precio con IVA incluido en neto e IVA', () => {
    expect(desglosarIva(11900)).toEqual({ neto: 10000, iva: 1900 });
    expect(desglosarIva(499990)).toEqual({ neto: 420160, iva: 79830 });
  });

  it('neto + IVA siempre suma exactamente el total, aunque haya redondeo', () => {
    [1, 99, 29990, 34990, 159990, 1299990].forEach((total) => {
      const { neto, iva } = desglosarIva(total);
      expect(neto + iva).toBe(total);
      expect(Number.isInteger(neto)).toBe(true);
    });
  });

  it('un total de 0 no genera IVA', () => {
    expect(desglosarIva(0)).toEqual({ neto: 0, iva: 0 });
  });

  it('calcula precio final y % de descuento solo cuando la oferta es menor al precio (RF9)', () => {
    const silla = producto(2); // 159.990 en oferta a 129.990
    expect(esOferta(silla)).toBe(true);
    expect(obtenerPrecioFinal(silla)).toBe(129990);
    expect(obtenerPorcentajeDescuento(silla)).toBe(19);

    const ps5 = producto(1); // sin oferta (precioOferta: null)
    expect(esOferta(ps5)).toBe(false);
    expect(obtenerPrecioFinal(ps5)).toBe(499990);
    expect(obtenerPorcentajeDescuento(ps5)).toBe(0);

    // Una "oferta" más cara que el precio normal no cuenta como oferta
    expect(esOferta({ precio: 1000, precioOferta: 1500 })).toBe(false);
  });

  it('de los 15 productos de prueba, 9 están en oferta', () => {
    expect(PRODUCTOS_PRUEBA.filter(esOferta)).toHaveLength(9);
  });
});
