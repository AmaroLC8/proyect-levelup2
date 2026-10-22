import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ResumenOrden from '../components/ResumenOrden';
import EstadoOrden from '../components/EstadoOrden';
import RutaProtegidaAdmin from '../components/RutaProtegida';
import Navbar from '../components/Navbar';
import { obtenerProductoPorId } from '../data/productos';

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

const ordenDePrueba = {
  numeroOrden: '20261021-003',
  cliente: {
    nombre: 'Ana', apellidos: 'Soto', correo: 'ana@duocuc.cl',
    calle: 'Av. Siempre Viva 742', depto: 'Depto 12', region: 'Maule', comuna: 'Talca', indicaciones: 'Dejar en conserjería',
  },
  items: [
    { id: 1, nombre: 'PlayStation 5 Slim 1TB', precio: 499990, cantidad: 1 },
    { id: 5, nombre: 'Mouse Gamer 16000 DPI Sensor Óptico', precio: 29990, cantidad: 2 },
  ],
  subtotal: 559970,
  descuento: 111994,
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
      // encabezado + 2 productos + subtotal + descuento + total
      expect(filas).toHaveLength(6);
      expect(screen.getByText('Mouse Gamer 16000 DPI Sensor Óptico')).toBeInTheDocument();
      expect(screen.getByText(/Av\. Siempre Viva 742 \(Depto 12\), Talca, Maule/)).toBeInTheDocument();
      expect(screen.getByText('"Dejar en conserjería"')).toBeInTheDocument();
    });

    it('muestra la fila de descuento solo si la orden tiene descuento y usa la etiqueta recibida', () => {
      const { rerender } = render(<ResumenOrden orden={ordenDePrueba} />);
      expect(screen.getByText('Descuento Duoc:')).toBeInTheDocument();
      expect(screen.getByText('Total pagado:')).toBeInTheDocument();

      rerender(<ResumenOrden orden={{ ...ordenDePrueba, descuento: 0 }} etiquetaTotal="Monto pendiente" />);
      expect(screen.queryByText('Descuento Duoc:')).not.toBeInTheDocument();
      expect(screen.getByText('Monto pendiente:')).toBeInTheDocument();
    });
  });

  describe('EstadoOrden', () => {
    it('muestra una etiqueta verde para órdenes pagadas y roja para rechazadas', () => {
      const { rerender } = render(<EstadoOrden estado="pagada" />);
      expect(screen.getByText('Pagada')).toHaveClass('badge', 'bg-success');

      rerender(<EstadoOrden estado="rechazada" />);
      expect(screen.getByText('Rechazada')).toHaveClass('badge', 'bg-danger');
    });

    it('muestra un estado desconocido en gris sin romper la vista', () => {
      render(<EstadoOrden estado="en revisión" />);
      expect(screen.getByText('en revisión')).toHaveClass('bg-secondary');
    });
  });

  describe('RutaProtegidaAdmin', () => {
    const rutasProtegidas = (
      <Routes>
        <Route path="/login" element={<p>Página de login</p>} />
        <Route element={<RutaProtegidaAdmin />}>
          <Route path="/admin" element={<p>Panel de administración</p>} />
        </Route>
      </Routes>
    );

    it('redirige a /login si no hay sesión o si el usuario no es administrador', () => {
      localStorage.setItem('levelup_sesion', '2'); // Pedro es cliente
      renderConApp(rutasProtegidas, { ruta: '/admin' });

      expect(screen.getByText('Página de login')).toBeInTheDocument();
      expect(screen.queryByText('Panel de administración')).not.toBeInTheDocument();
      expect(screen.getByTestId('ruta')).toHaveTextContent('/login');
    });

    it('muestra el panel cuando la sesión es de un administrador', () => {
      localStorage.setItem('levelup_sesion', '1');
      renderConApp(rutasProtegidas, { ruta: '/admin' });

      expect(screen.getByText('Panel de administración')).toBeInTheDocument();
    });
  });

  describe('Navbar', () => {
    it('sin sesión muestra los botones de ingreso y oculta el enlace Admin', () => {
      renderConApp(<Navbar />);

      expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login');
      expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/registro');
      expect(screen.queryByRole('link', { name: /admin/i })).not.toBeInTheDocument();
    });

    it('con sesión de administrador saluda, enlaza a su perfil y muestra el acceso Admin', () => {
      localStorage.setItem('levelup_sesion', '1');
      renderConApp(<Navbar />);

      expect(screen.getByTitle('Ver mi perfil')).toHaveAttribute('href', '/admin/perfil');
      expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin');
      expect(screen.queryByText('Iniciar sesión')).not.toBeInTheDocument();
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
