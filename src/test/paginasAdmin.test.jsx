import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';
import { obtenerProductos, obtenerProductoPorId } from '../data/productos';
import { obtenerCategorias, crearCategoria } from '../data/categorias';
import { obtenerUsuarios, obtenerUsuarioPorId } from '../data/usuarios';
import { crearOrden } from '../data/ordenes';

// Abre la aplicación en una ruta del panel con la sesión del administrador (id 1)
const abrirAdminEn = (ruta) => {
  localStorage.setItem('levelup_sesion', '1');
  window.history.pushState({}, '', ruta);
  return render(<App />);
};

// Las ventanas de crear/editar del admin se recorren por el orden de sus campos
const ventana = () => document.querySelector('.modal');
const camposDeVentana = () => ventana().querySelectorAll('input, textarea');
const escribirEn = (elemento, valor) => fireEvent.change(elemento, { target: { value: valor } });
const filaCon = (texto) => screen.getByText(texto).closest('tr');

describe('Pruebas del panel de administración', () => {
  beforeEach(() => {
    localStorage.clear();
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

      fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));
      expect(window.location.pathname).toBe('/');
      expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument();
    });
  });

  describe('Productos (RF14 y RF15)', () => {
    it('lista todos los productos y filtra los de stock crítico desde el dashboard', () => {
      abrirAdminEn('/admin/productos');
      expect(screen.getByText('Mostrando: 15 / 15')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText(/ver solo stock crítico/i));
      expect(screen.getByText('Mostrando: 5 / 15')).toBeInTheDocument();
      expect(screen.getByText('Mouse Gamer 16000 DPI Sensor Óptico')).toBeInTheDocument();
      expect(screen.queryByText('PlayStation 5 Slim 1TB')).not.toBeInTheDocument();
    });

    it('crea un producto nuevo y valida que la oferta sea menor al precio base', () => {
      abrirAdminEn('/admin/productos');
      fireEvent.click(screen.getByRole('button', { name: /nuevo producto/i }));

      const [nombre, precio, oferta, stock] = camposDeVentana();
      escribirEn(nombre, 'Audífonos Inalámbricos');
      fireEvent.change(ventana().querySelector('select'), { target: { value: 'Periféricos' } });
      escribirEn(precio, '39990');
      escribirEn(oferta, '45990');
      escribirEn(stock, '12');
      fireEvent.click(within(ventana()).getByRole('button', { name: /guardar producto/i }));
      expect(screen.getByText('El precio de oferta debe ser menor al precio base')).toBeInTheDocument();

      escribirEn(oferta, '');
      fireEvent.click(within(ventana()).getByRole('button', { name: /guardar producto/i }));

      expect(ventana()).toBeNull();
      expect(screen.getByText('Audífonos Inalámbricos')).toBeInTheDocument();
      const creado = obtenerProductos().at(-1);
      expect(creado).toMatchObject({ nombre: 'Audífonos Inalámbricos', categoria: 'Periféricos', precio: 39990, stock: 12 });
    });

    it('edita el stock de un producto y lo elimina previa confirmación', () => {
      abrirAdminEn('/admin/productos');

      fireEvent.click(within(filaCon('PlayStation 5 Slim 1TB')).getByTitle('Editar'));
      escribirEn(camposDeVentana()[3], '2');
      fireEvent.click(within(ventana()).getByRole('button', { name: /actualizar cambios/i }));
      expect(obtenerProductoPorId(1).stock).toBe(2);

      fireEvent.click(within(filaCon('PlayStation 5 Slim 1TB')).getByTitle('Eliminar'));
      expect(window.confirm).toHaveBeenCalled();
      expect(screen.queryByText('PlayStation 5 Slim 1TB')).not.toBeInTheDocument();
      expect(obtenerProductos()).toHaveLength(14);
    });

    it('muestra el detalle de un producto en modo lectura', () => {
      abrirAdminEn('/admin/productos');
      fireEvent.click(within(filaCon('Silla Gamer Ergonómica Pro')).getByTitle('Ver Detalle'));

      expect(within(ventana()).getByText('Detalle de Producto')).toBeInTheDocument();
      expect(within(ventana()).getByText('$129.990')).toBeInTheDocument();
      expect(within(ventana()).queryByRole('button', { name: /actualizar/i })).not.toBeInTheDocument();
    });
  });

  describe('Categorías (RF17)', () => {
    it('crea una categoría nueva y rechaza un nombre repetido', () => {
      abrirAdminEn('/admin/categorias');

      fireEvent.click(screen.getByRole('button', { name: /nueva categoría/i }));
      escribirEn(camposDeVentana()[0], 'consolas');
      fireEvent.click(within(ventana()).getByRole('button', { name: /crear categoría/i }));
      expect(screen.getByText('Ya existe una categoría con ese nombre')).toBeInTheDocument();

      escribirEn(camposDeVentana()[0], 'Streaming');
      fireEvent.click(within(ventana()).getByRole('button', { name: /crear categoría/i }));
      expect(ventana()).toBeNull();
      expect(screen.getByText('Streaming')).toBeInTheDocument();
      expect(obtenerCategorias()).toHaveLength(7);
    });

    it('no elimina categorías con productos y sí elimina las vacías', () => {
      crearCategoria({ nombre: 'Streaming', descripcion: 'Sin productos todavía' });
      abrirAdminEn('/admin/categorias');

      fireEvent.click(within(filaCon('Sillas')).getByTitle('Eliminar'));
      expect(screen.getByText(/no se puede eliminar: tiene 2 producto/i)).toBeInTheDocument();
      expect(window.confirm).not.toHaveBeenCalled();

      fireEvent.click(within(filaCon('Streaming')).getByTitle('Eliminar'));
      expect(screen.queryByText('Streaming')).not.toBeInTheDocument();
      expect(obtenerCategorias()).toHaveLength(6);
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
      fireEvent.change(ventana().querySelector('select'), { target: { value: 'cliente' } });
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
    it('rechaza una contraseña débil y guarda los cambios válidos', () => {
      abrirAdminEn('/admin/perfil');

      fireEvent.change(screen.getByLabelText('Nueva contraseña'), { target: { value: 'abc' } });
      fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));
      expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Valentina' } });
      fireEvent.change(screen.getByLabelText('Nueva contraseña'), { target: { value: 'clave2026' } });
      fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'clave2026' } });
      fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

      expect(screen.getByText(/actualizado correctamente/i)).toBeInTheDocument();
      expect(obtenerUsuarioPorId(1)).toMatchObject({ nombre: 'Valentina', password: 'clave2026' });
      expect(screen.getByTitle('Ver mi perfil')).toHaveTextContent('Hola, Valentina');
    });
  });
});
