import { describe, it, expect } from 'vitest';
import { desglosarIva, TASA_IVA, PORCENTAJE_DESCUENTO_DUOC } from '../utils/precios';

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
});
