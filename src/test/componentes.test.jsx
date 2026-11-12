import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ResumenOrden from '../components/ResumenOrden';
import DesgloseTotales from '../components/DesgloseTotales';
import EstadoOrden from '../components/EstadoOrden';
import Navbar from '../components/Navbar';
import { PRODUCTOS_PRUEBA } from './backendSimulado';
import { simularAuth, simularSesion, ADMIN, VENDEDOR, PEDRO } from './sesionSimulada';

// La sesión viene del backend (JWT): se simula authService para no llamar al backend real.
// Las pruebas de RutaProtegida y AdminSidebar están en roles.test.jsx
vi.mock('../services/authService');

// Productos con el formato que entrega el backend (categoría como objeto)
const obtenerProductoPorId = (id) => PRODUCTOS_PRUEBA.find((p) => p.id === id);

// Muestra la ruta actual para comprobar a dónde navegó un componente
const RutaActual = () => {
  const location = useLocation();
  return <div data-testid="ruta">{location.pathname + location.search}</div>;
};

// Renderiza con sesión, carrito y router reales, partiendo en la ruta indicada
const renderConApp = (ui, { ruta = '/' } = {}) =>
  render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter initialEntries={[ruta]}>
          {ui}
          <RutaActual />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );

// Boleta con el formato que responde el backend (POST /boletas, GET /boletas/{id})
const ordenDePrueba = {
  id: 3,
  numeroOrden: '20261021-003',
  estado: 'PAGADA',
  nombreCliente: 'Ana', apellidosCliente: 'Soto', correoCliente: 'ana@duocuc.cl',
  calle: 'Av. Siempre Viva 742', depto: 'Depto 12', region: 'Maule', comuna: 'Talca', indicaciones: 'Dejar en conserjería',
  detalles: [
    { id: 1, producto: obtenerProductoPorId(1), cantidad: 1, precioUnitario: 499990, subtotal: 499990 },
    { id: 2, producto: obtenerProductoPorId(5), cantidad: 2, precioUnitario: 29990, subtotal: 59980 },
  ],
  subtotal: 559970,
  descuento: 111994,
  neto: 376450,
  iva: 71526,
  total: 447976,
};

describe('Pruebas de componentes reutilizables', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('ProductCard', () => {
    it('con oferta muestra el precio normal tachado, el precio rebajado y el % de descuento', () => {
      renderConApp(<ProductCard producto={obtenerProductoPorId(2)} />);

      expect(screen.getByText('-19%')).toBeInTheDocument();
      expect(screen.getByText('$159.990')).toHaveClass('text-decoration-line-through');
      expect(screen.getByText('$129.990')).toBeInTheDocument();
    });

    it('sin oferta no muestra descuento y enlaza al detalle del producto (RF10)', () => {
      renderConApp(<ProductCard producto={obtenerProductoPorId(1)} />);

      expect(screen.queryByText(/^-\d+%$/)).not.toBeInTheDocument();
      // La imagen y el nombre son enlaces al detalle
      const enlaces = screen.getAllByRole('link', { name: 'PlayStation 5 Slim 1TB' });
      expect(enlaces).toHaveLength(2);
      enlaces.forEach((enlace) => expect(enlace).toHaveAttribute('href', '/producto/1'));
    });
  });

  describe('ResumenOrden', () => {
    it('renderiza una fila por cada producto de la orden y los datos de entrega', () => {
      render(<ResumenOrden orden={ordenDePrueba} />);

      const filas = within(screen.getByRole('table')).getAllByRole('row');
      // encabezado + 2 productos + subtotal + descuento + neto + IVA + total
      expect(filas).toHaveLength(8);
      expect(screen.getByText('Mouse Gamer 16000 DPI Sensor Óptico')).toBeInTheDocument();
      // Subtotal del detalle tal como lo calculó el backend
      expect(screen.getByText('$59.980')).toBeInTheDocument();
      expect(screen.getByText('ana@duocuc.cl')).toBeInTheDocument();
      expect(screen.getByText(/Av\. Siempre Viva 742 \(Depto 12\), Talca, Maule/)).toBeInTheDocument();
      expect(screen.getByText('"Dejar en conserjería"')).toBeInTheDocument();
    });

    it('muestra la fila de descuento solo si la orden tiene descuento y usa la etiqueta recibida', () => {
      const { rerender } = render(<ResumenOrden orden={ordenDePrueba} />);
      expect(screen.getByText('Descuento Duoc (20%):')).toBeInTheDocument();
      expect(screen.getByText('Total pagado:')).toBeInTheDocument();

      rerender(<ResumenOrden orden={{ ...ordenDePrueba, descuento: 0 }} etiquetaTotal="Monto pendiente" />);
      expect(screen.queryByText('Descuento Duoc (20%):')).not.toBeInTheDocument();
      expect(screen.getByText('Monto pendiente:')).toBeInTheDocument();
    });

    it('desglosa el total en el neto y el IVA que envía el backend', () => {
      render(<ResumenOrden orden={ordenDePrueba} />);
      // Total $447.976 con IVA incluido = neto $376.450 + IVA $71.526 (campos neto e iva de la boleta)
      expect(screen.getByText('Neto:').nextSibling).toHaveTextContent('$376.450');
      expect(screen.getByText('IVA (19%):').nextSibling).toHaveTextContent('$71.526');
    });
  });

  describe('DesgloseTotales', () => {
    const enTabla = (filas) => render(<table><tfoot>{filas}</tfoot></table>);

    it('sin descuento muestra solo neto, IVA y total', () => {
      enTabla(<DesgloseTotales subtotal={11900} total={11900} />);

      expect(screen.queryByText('Subtotal:')).not.toBeInTheDocument();
      expect(screen.getByText('Neto:').nextSibling).toHaveTextContent('$10.000');
      expect(screen.getByText('IVA (19%):').nextSibling).toHaveTextContent('$1.900');
      expect(screen.getByText('Total:').nextSibling).toHaveTextContent('$11.900');
    });

    it('con descuento calcula el IVA sobre el total ya descontado', () => {
      enTabla(<DesgloseTotales subtotal={14875} descuento={2975} total={11900} etiquetaTotal="Total a pagar" />);

      expect(screen.getByText('Subtotal:').nextSibling).toHaveTextContent('$14.875');
      expect(screen.getByText('Descuento Duoc (20%):').nextSibling).toHaveTextContent('-$2.975');
      expect(screen.getByText('IVA (19%):').nextSibling).toHaveTextContent('$1.900');
      expect(screen.getByText('Total a pagar:')).toBeInTheDocument();
    });

    it('si recibe neto e iva (boleta del backend) los muestra sin volver a calcularlos', () => {
      // Valores elegidos a propósito distintos de round(11900 / 1.19) para comprobar que no se recalculan
      enTabla(<DesgloseTotales subtotal={11900} total={11900} neto={9999} iva={1901} />);

      expect(screen.getByText('Neto:').nextSibling).toHaveTextContent('$9.999');
      expect(screen.getByText('IVA (19%):').nextSibling).toHaveTextContent('$1.901');
    });
  });

  describe('EstadoOrden', () => {
    it('muestra una etiqueta verde para PAGADA y roja para RECHAZADA (estados del backend)', () => {
      const { rerender } = render(<EstadoOrden estado="PAGADA" />);
      expect(screen.getByText('Pagada')).toHaveClass('badge', 'bg-success');

      rerender(<EstadoOrden estado="RECHAZADA" />);
      expect(screen.getByText('Rechazada')).toHaveClass('badge', 'bg-danger');
    });

    it('muestra un estado desconocido en gris sin romper la vista', () => {
      render(<EstadoOrden estado="en revisión" />);
      expect(screen.getByText('en revisión')).toHaveClass('bg-secondary');
    });
  });

  describe('Navbar', () => {
    beforeEach(() => {
      simularAuth();
    });

    it('sin sesión muestra los botones de ingreso y oculta el acceso al panel', () => {
      renderConApp(<Navbar />);

      expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login');
      expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/registro');
      expect(screen.queryByRole('link', { name: /panel/i })).not.toBeInTheDocument();
    });

    it('con sesión de administrador saluda, enlaza a su perfil y muestra el acceso al panel', () => {
      simularSesion(ADMIN);
      renderConApp(<Navbar />);

      expect(screen.getByTitle('Ver mi perfil')).toHaveAttribute('href', '/admin/perfil');
      expect(screen.getByTitle('Ver mi perfil')).toHaveTextContent('Hola, Admin');
      expect(screen.getByRole('link', { name: 'Panel' })).toHaveAttribute('href', '/admin');
      expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
      expect(screen.queryByText('Iniciar sesión')).not.toBeInTheDocument();
    });

    it('al vendedor el panel lo lleva a productos y su nombre no enlaza a un perfil', () => {
      simularSesion(VENDEDOR);
      renderConApp(<Navbar />);

      expect(screen.getByRole('link', { name: 'Panel' })).toHaveAttribute('href', '/admin/productos');
      expect(screen.getByText('Vendedor')).toBeInTheDocument();
      expect(screen.queryByTitle('Ver mi perfil')).not.toBeInTheDocument();
    });

    it('al cliente no le muestra el panel y su nombre enlaza a /perfil', () => {
      simularSesion(PEDRO);
      renderConApp(<Navbar />);

      expect(screen.getByTitle('Ver mi perfil')).toHaveAttribute('href', '/perfil');
      expect(screen.getByText('Duoc -20%')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Panel' })).not.toBeInTheDocument();
    });

    it('cerrar sesión vuelve a mostrar los botones de ingreso', () => {
      simularSesion(PEDRO);
      renderConApp(<Navbar />);

      fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));
      expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('muestra el total y la cantidad de productos del carrito', () => {
      localStorage.setItem('levelup_cart', JSON.stringify([{ id: 5, nombre: 'Mouse', precio: 10000, cantidad: 3 }]));
      renderConApp(<Navbar />);

      const botonCarrito = screen.getByRole('link', { name: /carrito/i });
      expect(botonCarrito).toHaveTextContent('Carrito $30.000');
      expect(within(botonCarrito).getByText('3')).toHaveClass('badge');
    });

    it('el buscador lleva al catálogo con el texto en la URL', () => {
      renderConApp(<Navbar />);

      fireEvent.change(screen.getByPlaceholderText('Buscar productos...'), { target: { value: 'silla gamer' } });
      fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

      expect(screen.getByTestId('ruta')).toHaveTextContent('/productos?buscar=silla%20gamer');
    });
  });
});
