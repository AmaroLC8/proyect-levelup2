import { peticion } from './api';

// Funciones para las métricas del panel (/api/v1/reportes). Solo ADMIN.
// Los cálculos los hace ReporteService del backend con los datos de MySQL;
// las páginas solo muestran los números que llegan.

/**
 * GET /reportes/dashboard →
 * { ventasTotales, ordenesRealizadas, totalProductos, totalUsuarios,
 *   productosCriticos: [Producto], ultimasOrdenes: [Boleta] (las 5 más recientes) }
 * ventasTotales solo suma las boletas PAGADAS; ordenesRealizadas cuenta todas.
 */
export const obtenerDashboard = () => peticion('/reportes/dashboard');

/**
 * GET /reportes/ventas → (solo cuentan las boletas PAGADAS)
 * { ingresosTotales, ordenesPagadas, ticketPromedio, unidadesVendidas, pagosRechazados, totalDescuentos,
 *   ventasPorCategoria: [{ categoria, monto }] (de mayor a menor),
 *   rankingProductos: [{ productoId, nombre, unidades, monto }] (top 5 por unidades) }
 */
export const obtenerReporteVentas = () => peticion('/reportes/ventas');
