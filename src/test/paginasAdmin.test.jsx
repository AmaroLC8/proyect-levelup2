import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import App from '../App';
import { obtenerUsuarios } from '../data/usuarios';
import { crearOrden } from '../data/ordenes';
import { crearProducto, actualizarProducto, eliminarProducto } from '../services/productosService';
import { actualizarPerfil } from '../services/authService';
import { simularBackend, simularBackendCaido, errorDelBackend } from './backendSimulado';
import { simularAuth, simularSesion, ADMIN } from './sesionSimulada';

// La sesión (login con JWT, /auth/me y /auth/perfil) también se simula
vi.mock('../services/authService');

// Productos y categorías vienen del backend: se simulan los services (no se llama al backend real).
// simularBackend() (en beforeEach) les da respuestas con los datos de backendSimulado.js
vi.mock('../services/productosService');
vi.mock('../services/categoriasService');

// Abre la aplicación en una ruta del panel con la sesión del administrador (token + usuario guardados)
const abrirAdminEn = (ruta) => {
  simularSesion(ADMIN);
  window.history.pushState({}, '', ruta);
  return render(<App />);
};

// Las ventanas de crear/editar del admin se recorren por el orden de sus campos
const ventana = () => document.querySelector('.modal');
const camposDeVentana = () => ventana().querySelectorAll('input, textarea');
const escribirEn = (elemento, valor) => fireEvent.change(elemento, { target: { value: valor } });
const filaCon = (texto) => screen.getByText(texto).closest('tr');

// Las páginas piden los datos a la API (asíncrono): se espera a que desaparezca el "Cargando..."
const esperarCarga = () =>
  waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());

describe('Pruebas del panel de administración', () => {
  let db; // "base de datos" del backend simulado
  let authDb; // usuarios del backend simulado (login y perfil)

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks(); // borra las llamadas registradas en la prueba anterior (ej: crearProducto)
    db = simularBackend();
    authDb = simularAuth();
    // Simula que el administrador acepta los mensajes de confirmación al eliminar
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Dashboard y menú lateral', () => {
    it('muestra las métricas reales, los accesos a cada sección y las órdenes más recientes primero (RF13)', () => {
      abrirAdminEn('/admin');

      expect(screen.getByText('$87.372')).toBeInTheDocument(); // 22.392 + 64.980 de las órdenes pagadas
      ['Órdenes', 'Productos', 'Categorías', 'Usuarios', 'Reportes', 'Perfil'].forEach((seccion) =>
        expect(screen.getAllByRole('link', { name: new RegExp(seccion) }).length).toBeGreaterThan(0)
      );
      const numeros = screen.getAllByRole('link', { name: /^#\d{8}-\d{3}$/ }).map((enlace) => enlace.textContent);
      expect(numeros).toEqual(['#20261012-002', '#20261001-001']);
      expect(screen.getByText('5 críticos')).toBeInTheDocument();
    });

    it('el menú lateral permite volver a la tienda y cerrar sesión', () => {
      abrirAdminEn('/admin');
      expect(screen.getByRole('link', { name: /ver tienda/i })).toHaveAttribute('href', '/');

      // La Navbar también tiene "Cerrar sesión": se usa el botón del menú lateral (el que no está en <nav>)
      const botonDelMenu = screen
        .getAllByRole('button', { name: /cerrar sesión/i })
        .find((boton) => !boton.closest('nav'));
      fireEvent.click(botonDelMenu);
      expect(window.location.pathname).toBe('/');
      expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Productos (RF14 y RF15)', () => {
    it('lista todos los productos y filtra los de stock crítico desde el dashboard', async () => {
      abrirAdminEn('/admin/productos');
      expect(await screen.findByText('Mostrando: 15 / 15')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText(/ver solo stock crítico/i));
      expect(screen.getByText('Mostrando: 5 / 15')).toBeInTheDocument();
      expect(screen.getByText('Mouse Gamer 16000 DPI Sensor Óptico')).toBeInTheDocument();
      expect(screen.queryByText('PlayStation 5 Slim 1TB')).not.toBeInTheDocument();
    });

    it('si el backend no responde, muestra el error en vez de la tabla', async () => {
      simularBackendCaido();
      abrirAdminEn('/admin/productos');

      expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo conectar con el servidor/i);
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('crea un producto nuevo enviando categoriaId y valida que la oferta sea menor al precio base', async () => {
      abrirAdminEn('/admin/productos');
      await esperarCarga();
      fireEvent.click(screen.getByRole('button', { name: /nuevo producto/i }));

      const [nombre, precio, oferta, stock] = camposDeVentana();
      escribirEn(nombre, 'Audífonos Inalámbricos');
      // Las opciones del select usan el id de la categoría (2 = Periféricos)
      fireEvent.change(ventana().querySelector('select'), { target: { value: '2' } });
      escribirEn(precio, '39990');
      escribirEn(oferta, '45990');
      escribirEn(stock, '12');
      fireEvent.click(within(ventana()).getByRole('button', { name: /guardar producto/i }));
      expect(screen.getByText('El precio de oferta debe ser menor al precio base')).toBeInTheDocument();
      expect(crearProducto).not.toHaveBeenCalled();

      escribirEn(oferta, '');
      fireEvent.click(within(ventana()).getByRole('button', { name: /guardar producto/i }));

      await waitFor(() => expect(ventana()).toBeNull());
      expect(await screen.findByText('Audífonos Inalámbricos')).toBeInTheDocument();
      // Se envió el formato ProductoRequest: números y la categoría solo como categoriaId
      expect(crearProducto).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Audífonos Inalámbricos', categoriaId: 2, precio: 39990, precioOferta: null, stock: 12 })
      );
      expect(db.productos.at(-1)).toMatchObject({ nombre: 'Audífonos Inalámbricos', categoria: { nombre: 'Periféricos' } });
    });

    it('si el backend rechaza el producto, el modal queda abierto con su mensaje', async () => {
      vi.mocked(crearProducto).mockRejectedValueOnce(
        errorDelBackend(401, 'Debes iniciar sesión para acceder a este recurso')
      );
      abrirAdminEn('/admin/productos');
      await esperarCarga();
      fireEvent.click(screen.getByRole('button', { name: /nuevo producto/i }));

      const [nombre, precio, , stock] = camposDeVentana();
      escribirEn(nombre, 'Control Inalámbrico');
      escribirEn(precio, '49990');
      escribirEn(stock, '3');
      fireEvent.click(within(ventana()).getByRole('button', { name: /guardar producto/i }));

      expect(await within(ventana()).findByText('Debes iniciar sesión para acceder a este recurso')).toBeInTheDocument();
      expect(db.productos).toHaveLength(15);
    });

    it('edita el stock de un producto y lo elimina previa confirmación', async () => {
      abrirAdminEn('/admin/productos');
      await esperarCarga();

      fireEvent.click(within(filaCon('PlayStation 5 Slim 1TB')).getByTitle('Editar'));
      escribirEn(camposDeVentana()[3], '2');
      fireEvent.click(within(ventana()).getByRole('button', { name: /actualizar cambios/i }));
      await waitFor(() => expect(ventana()).toBeNull());
      expect(actualizarProducto).toHaveBeenCalledWith(1, expect.objectContaining({ stock: 2, categoriaId: 1 }));
      expect(db.productos.find((p) => p.id === 1).stock).toBe(2);

      fireEvent.click(within(filaCon('PlayStation 5 Slim 1TB')).getByTitle('Eliminar'));
      expect(window.confirm).toHaveBeenCalled();
      await waitFor(() => expect(screen.queryByText('PlayStation 5 Slim 1TB')).not.toBeInTheDocument());
      expect(eliminarProducto).toHaveBeenCalledWith(1);
      expect(db.productos).toHaveLength(14);
    });

    it('muestra el mensaje del backend si no se puede eliminar un producto (409)', async () => {
      vi.mocked(eliminarProducto).mockRejectedValueOnce(
        errorDelBackend(409, 'No se puede eliminar el producto porque ya fue vendido')
      );
      abrirAdminEn('/admin/productos');
      await esperarCarga();

      fireEvent.click(within(filaCon('Catan El Juego')).getByTitle('Eliminar'));
      expect(await screen.findByText('No se puede eliminar el producto porque ya fue vendido')).toBeInTheDocument();
      expect(screen.getByText('Catan El Juego')).toBeInTheDocument();
    });

    it('muestra el detalle de un producto en modo lectura', async () => {
      abrirAdminEn('/admin/productos');
      await esperarCarga();
      fireEvent.click(within(filaCon('Silla Gamer Ergonómica Pro')).getByTitle('Ver Detalle'));

      expect(within(ventana()).getByText('Detalle de Producto')).toBeInTheDocument();
      expect(within(ventana()).getByText('$129.990')).toBeInTheDocument();
      expect(within(ventana()).getByText('Sillas')).toBeInTheDocument();
      expect(within(ventana()).queryByRole('button', { name: /actualizar/i })).not.toBeInTheDocument();
    });
  });

  describe('Categorías (RF17)', () => {
    it('crea una categoría nueva y muestra el error del backend si el nombre se repite', async () => {
      abrirAdminEn('/admin/categorias');
      await esperarCarga();

      fireEvent.click(screen.getByRole('button', { name: /nueva categoría/i }));
      escribirEn(camposDeVentana()[0], 'consolas');
      fireEvent.click(within(ventana()).getByRole('button', { name: /crear categoría/i }));
      expect(await screen.findByText("Ya existe una categoría con el nombre 'consolas'")).toBeInTheDocument();

      escribirEn(camposDeVentana()[0], 'Streaming');
      fireEvent.click(within(ventana()).getByRole('button', { name: /crear categoría/i }));
      await waitFor(() => expect(ventana()).toBeNull());
      expect(await screen.findByText('Streaming')).toBeInTheDocument();
      expect(db.categorias).toHaveLength(7);
    });

    it('no elimina categorías con productos y sí elimina las vacías', async () => {
      db.categorias.push({ id: 7, nombre: 'Streaming', descripcion: 'Sin productos todavía', activa: true });
      abrirAdminEn('/admin/categorias');
      await esperarCarga();

      fireEvent.click(within(filaCon('Sillas')).getByTitle('Eliminar'));
      expect(screen.getByText(/no se puede eliminar: tiene 2 producto/i)).toBeInTheDocument();
      expect(window.confirm).not.toHaveBeenCalled();

      fireEvent.click(within(filaCon('Streaming')).getByTitle('Eliminar'));
      await waitFor(() => expect(screen.queryByText('Streaming')).not.toBeInTheDocument());
      expect(db.categorias).toHaveLength(6);
    });
  });

  describe('Usuarios (RF18)', () => {
    it('al crear un usuario aplica las reglas del registro', () => {
      abrirAdminEn('/admin/usuarios');
      fireEvent.click(screen.getByRole('button', { name: /nuevo usuario/i }));

      const [nombre, apellidos, correo, password, fecha] = camposDeVentana();
      escribirEn(nombre, 'Diego');
      escribirEn(apellidos, 'Rojas');
      escribirEn(correo, 'pedro@duocuc.cl');
      escribirEn(password, 'abc');
      escribirEn(fecha, '2012-06-01');
      fireEvent.click(within(ventana()).getByRole('button', { name: /crear usuario/i }));

      const errores = within(ventana()).getAllByRole('listitem').map((item) => item.textContent);
      expect(errores).toEqual(expect.arrayContaining([
        'Debes ser mayor de 18 años para registrarte',
        'Mínimo 8 caracteres, combinando letras y números',
        'Ya existe un usuario con ese correo',
      ]));

      escribirEn(correo, 'diego@gmail.com');
      escribirEn(password, 'diego1234');
      escribirEn(fecha, '1999-06-01');
      fireEvent.click(within(ventana()).getByRole('button', { name: /crear usuario/i }));
      expect(screen.getByText('diego@gmail.com')).toBeInTheDocument();
      expect(obtenerUsuarios()).toHaveLength(3);
    });

    it('protege la cuenta del administrador con sesión iniciada', () => {
      abrirAdminEn('/admin/usuarios');

      fireEvent.click(within(filaCon('admin@levelup.cl')).getByTitle('Eliminar'));
      expect(screen.getByText(/no puedes eliminar tu propia cuenta/i)).toBeInTheDocument();
      expect(obtenerUsuarios()).toHaveLength(2);

      fireEvent.click(within(filaCon('admin@levelup.cl')).getByTitle('Editar'));
      fireEvent.change(ventana().querySelector('select'), { target: { value: 'CLIENTE' } });
      fireEvent.click(within(ventana()).getByRole('button', { name: /guardar cambios/i }));
      expect(screen.getByText('No puedes quitarte el rol de administrador a ti mismo')).toBeInTheDocument();
    });

    it('muestra el historial de compras de un cliente', () => {
      abrirAdminEn('/admin/usuarios');
      fireEvent.click(within(filaCon('pedro@duocuc.cl')).getByTitle(/historial/i));

      expect(within(ventana()).getByText('#20261001-001')).toBeInTheDocument();
      expect(within(ventana()).getByText('Catan El Juego (x1)')).toBeInTheDocument();
      expect(within(ventana()).getByText('Pagada')).toBeInTheDocument();
    });
  });

  describe('Órdenes, boletas y reportes (RF16 y RF19)', () => {
    const ordenRechazada = {
      estado: 'rechazada',
      usuarioId: null,
      cliente: {
        nombre: 'Ana', apellidos: 'Soto', correo: 'error@test.com',
        calle: 'Av. Siempre Viva 742', depto: '', region: 'Maule', comuna: 'Talca', indicaciones: '',
      },
      items: [{ id: 1, nombre: 'PlayStation 5 Slim 1TB', precio: 499990, cantidad: 1 }],
      subtotal: 499990,
      descuento: 0,
      total: 499990,
    };

    it('filtra las órdenes por estado y abre la boleta con los datos del cliente', () => {
      crearOrden(ordenRechazada);
      abrirAdminEn('/admin/ordenes');
      expect(screen.getByText('Total órdenes: 3')).toBeInTheDocument();
      expect(screen.getByText('camila.rojas@gmail.com')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/filtrar por estado/i), { target: { value: 'rechazada' } });
      expect(screen.getAllByRole('link', { name: /ver boleta/i })).toHaveLength(1);

      fireEvent.click(screen.getByRole('link', { name: /ver boleta/i }));
      expect(screen.getByText('BOLETA ELECTRÓNICA')).toBeInTheDocument();
      expect(screen.getByText(/Av\. Siempre Viva 742, Talca, Maule/)).toBeInTheDocument();
      expect(screen.getByText('Monto no pagado:')).toBeInTheDocument();
    });

    it('avisa cuando la boleta solicitada no existe', () => {
      abrirAdminEn('/admin/ordenes/123');
      expect(screen.getByText('Orden no encontrada')).toBeInTheDocument();
    });

    it('los reportes suman solo las ventas pagadas y agrupan por categoría', () => {
      crearOrden(ordenRechazada);
      abrirAdminEn('/admin/reportes');

      expect(screen.getByText('$87.372')).toBeInTheDocument();
      expect(screen.getByText('1 pagos rechazados')).toBeInTheDocument();
      expect(screen.getByText('Juegos de Mesa')).toBeInTheDocument();
      expect(screen.getByText('Periféricos')).toBeInTheDocument();
      // La PS5 solo estaba en la orden rechazada, así que no aparece en el ranking
      expect(screen.queryByText('PlayStation 5 Slim 1TB')).not.toBeInTheDocument();
    });
  });

  describe('Perfil del administrador (RF20)', () => {
    it('carga los datos con /auth/perfil y el correo no se puede editar', async () => {
      abrirAdminEn('/admin/perfil');

      expect(await screen.findByLabelText('Nombre')).toHaveValue('Admin');
      expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue('admin@levelup.cl');
      expect(screen.getByLabelText(/correo electrónico/i)).toBeDisabled();
    });

    it('rechaza una contraseña débil y guarda los cambios válidos con PUT /auth/perfil', async () => {
      abrirAdminEn('/admin/perfil');

      fireEvent.change(await screen.findByLabelText('Nueva contraseña'), { target: { value: 'abc' } });
      fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));
      expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
      expect(actualizarPerfil).not.toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Valentina' } });
      fireEvent.change(screen.getByLabelText('Nueva contraseña'), { target: { value: 'clave2026' } });
      fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'clave2026' } });
      fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

      expect(await screen.findByText(/actualizado correctamente/i)).toBeInTheDocument();
      // Formato PerfilRequest: sin correo, rol, puntos ni descuento
      expect(actualizarPerfil).toHaveBeenCalledWith({
        nombre: 'Valentina', apellidos: 'Level-Up', fechaNacimiento: '1995-05-10', password: 'clave2026',
      });
      expect(authDb.usuarios[0].nombre).toBe('Valentina');
      expect(authDb.passwordDe('admin@levelup.cl')).toBe('clave2026');
      expect(screen.getByTitle('Ver mi perfil')).toHaveTextContent('Hola, Valentina');
    });
  });
});
