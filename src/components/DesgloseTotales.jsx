import React from 'react';
import { formatearDinero } from '../utils/formato';
import { PORCENTAJE_DESCUENTO_DUOC, TASA_IVA, desglosarIva } from '../utils/precios';

// Filas de totales para el <tfoot> de una tabla de productos: subtotal, descuento Duoc,
// neto, IVA y total. Se usa en el carrito, el checkout y el resumen de cada orden.
// columnas: cuántas columnas ocupa la etiqueta; columnasValor: cuántas ocupa el monto.
// neto e iva son opcionales:
// - En una boleta del backend vienen calculados por BoletaService y se muestran tal cual.
// - En el carrito y el checkout (todavía no hay boleta) se calculan aquí con desglosarIva.
export default function DesgloseTotales({
  subtotal,
  descuento = 0,
  total,
  neto: netoRecibido,
  iva: ivaRecibido,
  etiquetaTotal = 'Total',
  columnas = 3,
  columnasValor = 1,
  alineacionValor = 'text-end',
}) {
  const vienenDelBackend = netoRecibido !== undefined && ivaRecibido !== undefined;
  const { neto, iva } = vienenDelBackend ? { neto: netoRecibido, iva: ivaRecibido } : desglosarIva(total);

  const fila = (etiqueta, valor, clase = 'text-secondary') => (
    <tr>
      <td colSpan={columnas} className={`text-end ${clase}`}>{etiqueta}:</td>
      <td colSpan={columnasValor} className={`${alineacionValor} ${clase}`}>{valor}</td>
    </tr>
  );

  return (
    <>
      {descuento > 0 && (
        <>
          {fila('Subtotal', formatearDinero(subtotal))}
          {fila(`Descuento Duoc (${PORCENTAJE_DESCUENTO_DUOC}%)`, `-${formatearDinero(descuento)}`, 'text-warning')}
        </>
      )}
      {fila('Neto', formatearDinero(neto))}
      {fila(`IVA (${TASA_IVA}%)`, formatearDinero(iva))}
      <tr>
        <td colSpan={columnas} className="text-end fs-5 fw-bold text-light py-3">{etiquetaTotal}:</td>
        <td colSpan={columnasValor} className={`${alineacionValor} fs-5 fw-bold text-success py-3`}>
          {formatearDinero(total)}
        </td>
      </tr>
    </>
  );
}
