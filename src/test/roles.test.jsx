import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import RutaProtegida from '../components/RutaProtegida';
import AdminSidebar from '../components/AdminSidebar';
import { simularBackend } from './backendSimulado';
import { simularAuth, simularSesion, ADMIN, VENDEDOR, PEDRO } from './sesionSimulada';

// Pruebas de lo que puede ver cada rol (pauta del profesor):
// ADMIN = acceso total; VENDEDOR = solo productos y órdenes (lista y detalle); CLIENTE = solo la tienda.
// Los services se simulan: no se llama al backend real.
vi.mock('../services/authService');
vi.mock('../services/productosService');
vi.mock('../services/categoriasService');

// Muestra la ruta actual para comprobar a dónde redirigió RutaProtegida
const RutaActual = () => <div data-testid="ruta">{useLocation().pathname}</div>;

// Mismo esquema de rutas que App.jsx, con textos simples en vez de las páginas reales
const renderRutas = (rutaInicial) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[rutaInicial]}>
        <Routes>
          <Route path="/" element={<p>Inicio de la tienda</p>} />
          <Route path="/login" element={<p>Página de login</p>} />
          <Route element={<RutaProtegida rolesPermitidos={['ADMIN', 'VENDEDOR']} />}>
            <Route path="/admin/productos" element={<p>Lista de productos</p>} />
            <Route element={<RutaProtegida rolesPermitidos={['ADMIN']} />}>
              <Route path="/admin/usuarios" element={<p>Mantenedor de usuarios</p>} />
            </Route>
          </Route>
        </Routes>
        <RutaActual />
      </MemoryRouter>
    </AuthProvider>
  );

// Abre la aplicación completa en una ruta
const abrirApp = (ruta) => {
  window.history.pushState({}, '', ruta);
  return render(<App />);
};

describe('Pruebas de permisos por rol', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    simularAuth();
    simularBackend();
  });

  describe('RutaProtegida', () => {
    it('sin sesión redirige a /login', () => {
      renderRutas('/admin/productos');

      expect(screen.getByText('Página de login')).toBeInTheDocument();
      expect(screen.getByTestId('ruta')).toHaveTextContent('/login');
    });

    it('el CLIENTE no entra al panel: vuelve al inicio de la tienda', () => {
      simularSesion(PEDRO);
      renderRutas('/admin/productos');

      expect(screen.getByText('Inicio de la tienda')).toBeInTheDocument();
      expect(screen.queryByText('Lista de productos')).not.toBeInTheDocument();
      expect(screen.getByTestId('ruta')).toHaveTextContent(/^\/$/);
    });

    it('el VENDEDOR entra a productos, pero no a una ruta solo de ADMIN', () => {
      simularSesion(VENDEDOR);
      const { unmount } = renderRutas('/admin/productos');
      expect(screen.getByText('Lista de productos')).toBeInTheDocument();
      unmount();

      renderRutas('/admin/usuarios');
      expect(screen.queryByText('Mantenedor de usuarios')).not.toBeInTheDocument();
      expect(screen.getByText('Inicio de la tienda')).toBeInTheDocument();
    });

    it('el ADMIN entra a todas las rutas del panel', () => {
      simularSesion(ADMIN);
      const { unmount } = renderRutas('/admin/productos');
      expect(screen.getByText('Lista de productos')).toBeInTheDocument();
      unmount();

      renderRutas('/admin/usuarios');
      expect(screen.getByText('Mantenedor de usuarios')).toBeInTheDocument();
    });

    it('en App.jsx el VENDEDOR que abre el dashboard vuelve al inicio', async () => {
      simularSesion(VENDEDOR);
      abrirApp('/admin');

      expect(await screen.findByText('Productos Destacados')).toBeInTheDocument();
      expect(window.location.pathname).toBe('/');
      expect(screen.queryByText('Panel de Administración')).not.toBeInTheDocument();
    });

    it('en App.jsx el VENDEDOR tampoco entra al perfil de cliente', async () => {
      simularSesion(VENDEDOR);
      abrirApp('/perfil');

      await waitFor(() => expect(window.location.pathname).toBe('/'));
    });
  });

  describe('AdminSidebar', () => {
    const renderSidebar = () =>
      render(
        <AuthProvider>
          <MemoryRouter>
            <AdminSidebar />
          </MemoryRouter>
        </AuthProvider>
      );

    const opcionesDelMenu = () =>
      within(screen.getByRole('list')).getAllByRole('link').map((enlace) => enlace.textContent.trim());

    it('el ADMIN ve todas las secciones del panel', () => {
      simularSesion(ADMIN);
      renderSidebar();

      expect(screen.getByText('Panel Admin')).toBeInTheDocument();
      expect(opcionesDelMenu()).toEqual([
        'Dashboard', 'Órdenes y Boletas', 'Productos', 'Categorías', 'Usuarios', 'Reportes', 'Mi Perfil',
      ]);
    });

    it('el VENDEDOR solo ve Productos y Órdenes', () => {
      simularSesion(VENDEDOR);
      renderSidebar();

      expect(screen.getByText('Panel Vendedor')).toBeInTheDocument();
      expect(opcionesDelMenu()).toEqual(['Órdenes y Boletas', 'Productos']);
      // Siguen disponibles los accesos para volver a la tienda y salir
      expect(screen.getByRole('link', { name: /ver tienda/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
    });
  });

  describe('AdminProductos según el rol', () => {
    const esperarCarga = () =>
      waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());

    it('el VENDEDOR solo ve la lista y el detalle: sin crear, editar ni eliminar', async () => {
      simularSesion(VENDEDOR);
      abrirApp('/admin/productos');
      await esperarCarga();

      expect(screen.getByText('Mostrando: 15 / 15')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /nuevo producto/i })).not.toBeInTheDocument();
      expect(screen.queryAllByTitle('Editar')).toHaveLength(0);
      expect(screen.queryAllByTitle('Eliminar')).toHaveLength(0);
      expect(screen.getAllByTitle('Ver Detalle')).toHaveLength(15);
    });

    it('el ADMIN ve los botones de crear, editar y eliminar', async () => {
      simularSesion(ADMIN);
      abrirApp('/admin/productos');
      await esperarCarga();

      expect(screen.getByRole('button', { name: /nuevo producto/i })).toBeInTheDocument();
      expect(screen.getAllByTitle('Editar')).toHaveLength(15);
      expect(screen.getAllByTitle('Eliminar')).toHaveLength(15);
    });
  });
});
