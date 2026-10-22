import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';
import { obtenerOrdenes } from '../data/ordenes';
import { obtenerProductoPorId } from '../data/productos';
import { crearCategoria } from '../data/categorias';

// Abre la aplicación completa en la ruta indicada, como lo haría el usuario
const abrirEn = (ruta) => {
  window.history.pushState({}, '', ruta);
  return render(<App />);
};

// Los formularios de la tienda se identifican por el atributo name de cada campo
const campo = (name) => document.querySelector(`main [name="${name}"]`);
const escribir = (name, valor) => fireEvent.change(campo(name), { target: { value: valor } });

const rutaActual = () => window.location.pathname;
const tarjetasDeProducto = () => screen.queryAllByRole('button', { name: /añadir/i });

describe('Pruebas de las vistas de la tienda', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Home y Catálogo', () => {
    it('el Home muestra 3 productos destacados', () => {
      abrirEn('/');
      expect(screen.getByText('Productos Destacados')).toBeInTheDocument();
      expect(tarjetasDeProducto()).toHaveLength(3);
    });

    it('el catálogo renderiza todos los productos del conjunto de datos', () => {
      abrirEn('/productos');
      expect(tarjetasDeProducto()).toHaveLength(15);
    });

    it('filtra por texto de búsqueda, categoría y precio máximo (RF2)', () => {
      abrirEn('/productos?buscar=mouse');
      // "mouse" encuentra el Mouse Gamer y el Mousepad
      expect(tarjetasDeProducto()).toHaveLength(2);

      fireEvent.change(screen.getByPlaceholderText(/buscar producto por nombre/i), { target: { value: '' } });
      fireEvent.change(screen.getByDisplayValue('Todas las Categorías'), { target: { value: 'Periféricos' } });
      expect(tarjetasDeProducto()).toHaveLength(3);

      fireEvent.change(screen.getByPlaceholderText(/precio máximo/i), { target: { value: '30000' } });
      // Teclado ($34.990) y Audífonos ($49.990) quedan fuera; el Mouse ($29.990) queda dentro
      expect(tarjetasDeProducto()).toHaveLength(1);
      expect(screen.getByText('Mouse Gamer 16000 DPI Sensor Óptico')).toBeInTheDocument();
    });

    it('muestra un mensaje cuando ningún producto cumple los filtros', () => {
      abrirEn('/productos?buscar=zzz');
      expect(tarjetasDeProducto()).toHaveLength(0);
      expect(screen.getByText(/no se encontraron productos/i)).toBeInTheDocument();
    });
  });

  describe('Categorías y Ofertas', () => {
    it('cambia los productos al seleccionar otra categoría sin recargar (RF8)', () => {
      crearCategoria({ nombre: 'Streaming', descripcion: 'Categoría nueva, todavía sin productos' });
      abrirEn('/categorias');
      expect(screen.getByText('PlayStation 5 Slim 1TB')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /sillas/i }));
      expect(screen.getByText('Silla Gamer Ergonómica Pro')).toBeInTheDocument();
      expect(screen.queryByText('PlayStation 5 Slim 1TB')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /computadores gamer/i }));
      expect(screen.getByText('PC Gamer RTX 4060 Ryzen 5 16GB')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /streaming/i }));
      expect(screen.getByText(/aún no hay productos en esta categoría/i)).toBeInTheDocument();
    });

    it('ofertas muestra solo productos con descuento, de mayor a menor % (RF9)', () => {
      abrirEn('/ofertas');
      const descuentos = screen.getAllByText(/^-\d+%$/).map((etiqueta) => etiqueta.textContent);
      expect(descuentos).toEqual(['-24%', '-21%', '-20%', '-19%', '-17%', '-17%', '-9%', '-8%', '-6%']);
      expect(screen.queryByText('PlayStation 5 Slim 1TB')).not.toBeInTheDocument();
    });
  });

  describe('Detalle de producto', () => {
    it('muestra la información del producto y lo agrega al carrito (RF10)', () => {
      abrirEn('/producto/1');
      expect(screen.getByRole('heading', { name: 'PlayStation 5 Slim 1TB' })).toBeInTheDocument();
      expect(screen.getByText('Stock disponible: 8 unidades')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
      expect(screen.getByRole('link', { name: /carrito/i })).toHaveTextContent('Carrito $499.990');
    });

    it('muestra "Producto no encontrado" si el id no existe', () => {
      abrirEn('/producto/999');
      expect(screen.getByText('Producto no encontrado')).toBeInTheDocument();
    });
  });

  describe('Registro e inicio de sesión', () => {
    it('el registro muestra un error bajo cada campo inválido', () => {
      abrirEn('/registro');
      escribir('fechaNacimiento', '2015-01-01');
      escribir('password', 'abc');
      fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

      expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
      expect(screen.getByText(/mayor de 18 años/)).toBeInTheDocument();
      expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
      expect(campo('password')).toHaveClass('is-invalid');
      expect(rutaActual()).toBe('/registro');
    });

    it('el registro no acepta símbolos ni números en el nombre y apellidos', () => {
      abrirEn('/registro');
      escribir('nombre', 'J@ime');
      escribir('apellidos', 'Soto#1');
      fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

      expect(screen.getByText(/^El nombre solo puede tener letras/)).toBeInTheDocument();
      expect(screen.getByText(/^El apellido solo puede tener letras/)).toBeInTheDocument();
      expect(campo('nombre')).toHaveClass('is-invalid');
    });

    it('avisa el descuento Duoc y al registrarse entra con la cuenta nueva (RF1)', () => {
      abrirEn('/registro');
      escribir('nombre', 'María');
      escribir('apellidos', 'Soto');
      escribir('correo', 'maria@duocuc.cl');
      expect(screen.getByText(/correo duoc detectado/i)).toBeInTheDocument();

      escribir('fechaNacimiento', '2000-01-01');
      escribir('password', 'maria1234');
      escribir('confirmarPassword', 'maria1234');
      fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

      expect(rutaActual()).toBe('/');
      expect(screen.getByTitle('Ver mi perfil')).toHaveTextContent('Hola, María');
      expect(screen.getByText('Duoc -20%')).toBeInTheDocument();
    });

    it('el login muestra un error con datos incorrectos', () => {
      abrirEn('/login');
      fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
      expect(screen.getByText('Ingresa tu correo y contraseña')).toBeInTheDocument();

      escribir('correo', 'pedro@duocuc.cl');
      escribir('password', 'incorrecta1');
      fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
      expect(screen.getByText('Correo o contraseña incorrectos')).toBeInTheDocument();
    });

    it('el administrador entra directo a su panel', () => {
      abrirEn('/login');
      escribir('correo', 'admin@levelup.cl');
      escribir('password', 'admin1234');
      fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

      expect(rutaActual()).toBe('/admin');
      expect(screen.getByText('Panel de Administración')).toBeInTheDocument();
    });
  });

  describe('Carrito, checkout y resultado del pago', () => {
    const llenarCheckout = (correo) => {
      escribir('nombre', 'Ana');
      escribir('apellidos', 'Soto');
      escribir('correo', correo);
      escribir('calle', 'Av. Siempre Viva 742');
    };

    it('el carrito de un usuario Duoc muestra subtotal, descuento y total', () => {
      localStorage.setItem('levelup_sesion', '2');
      localStorage.setItem('levelup_cart', JSON.stringify([{ id: 5, nombre: 'Mouse Gamer', precio: 10000, cantidad: 2, imagen: '' }]));
      abrirEn('/carrito');

      expect(screen.getByText(/descuento duoc \(20%\)/i)).toBeInTheDocument();
      expect(screen.getByText('-$4.000')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /carrito/i })).toHaveTextContent('Carrito $16.000');
    });

    it('en el checkout las comunas cambian con la región y valida el correo (RF11)', () => {
      localStorage.setItem('levelup_cart', JSON.stringify([{ id: 5, nombre: 'Mouse Gamer', precio: 29990, cantidad: 1 }]));
      abrirEn('/checkout');

      escribir('region', 'Valparaíso');
      const comunas = within(campo('comuna')).getAllByRole('option').map((opcion) => opcion.value);
      expect(comunas).toContain('Viña del Mar');
      expect(campo('comuna')).toHaveValue('Quilpué');

      llenarCheckout('ana@gmail');
      fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));
      expect(screen.getByText('Ingresa un correo electrónico válido')).toBeInTheDocument();
    });

    it('una compra pagada guarda la orden, descuenta stock y vacía el carrito (RF12)', () => {
      abrirEn('/producto/5');
      fireEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
      fireEvent.click(screen.getByRole('link', { name: /carrito/i }));
      fireEvent.click(screen.getByRole('link', { name: /comprar ahora/i }));

      llenarCheckout('ana@gmail.com');
      fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));

      expect(rutaActual()).toBe('/pago-exitoso');
      expect(screen.getByText('¡Se ha realizado la compra con éxito!')).toBeInTheDocument();
      expect(obtenerOrdenes().at(-1).estado).toBe('pagada');
      expect(obtenerProductoPorId(5).stock).toBe(1);
      expect(screen.getByRole('link', { name: /carrito/i })).toHaveTextContent('Carrito $0');
    });

    it('un pago rechazado mantiene el carrito y al reintentar recupera los datos', () => {
      localStorage.setItem('levelup_cart', JSON.stringify([{ id: 5, nombre: 'Mouse Gamer', precio: 29990, cantidad: 1 }]));
      abrirEn('/checkout');
      llenarCheckout('error@test.com');
      fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));

      expect(rutaActual()).toBe('/pago-error');
      expect(screen.getByText('No se pudo realizar el pago')).toBeInTheDocument();
      expect(screen.getByText('Monto pendiente:')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('link', { name: /volver a realizar el pago/i }));
      expect(campo('correo')).toHaveValue('error@test.com');
      expect(campo('calle')).toHaveValue('Av. Siempre Viva 742');
    });

    it('la vista de pago con error avisa si no hay un pago pendiente', () => {
      abrirEn('/pago-error');
      expect(screen.getByText('No hay un pago pendiente para mostrar.')).toBeInTheDocument();
    });
  });

  describe('Perfil, Contacto y Blog', () => {
    it('el perfil del cliente muestra sus puntos, código de referido e historial (RF5)', () => {
      localStorage.setItem('levelup_sesion', '2');
      abrirEn('/perfil');

      expect(screen.getByText(/100 pts/)).toBeInTheDocument();
      expect(screen.getByText('LVLPEDRO')).toBeInTheDocument();
      expect(screen.getByText('#20261001-001')).toBeInTheDocument();
    });

    it('el perfil valida el nombre al editarlo y actualiza el saludo de la barra (RF5)', () => {
      localStorage.setItem('levelup_sesion', '2');
      abrirEn('/perfil');
      fireEvent.click(screen.getByRole('button', { name: /editar/i }));

      const [nombre] = document.querySelectorAll('main form input[type="text"]');
      fireEvent.change(nombre, { target: { value: 'P3dro!' } });
      fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }));
      expect(screen.getByText(/^El nombre solo puede tener letras/)).toBeInTheDocument();

      fireEvent.change(nombre, { target: { value: 'Pedro Pablo' } });
      fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }));
      expect(screen.getByText(/actualizados exitosamente/)).toBeInTheDocument();
      expect(screen.getByTitle('Ver mi perfil')).toHaveTextContent('Hola, Pedro Pablo');
    });

    it('contacto muestra los errores y luego el mensaje enviado (RF7)', () => {
      abrirEn('/contacto');
      fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }));
      expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
      expect(screen.getByText(/al menos 10 caracteres/)).toBeInTheDocument();

      escribir('nombre', 'Ana');
      escribir('correo', 'ana@gmail.com');
      escribir('mensaje', '¿Cuándo llega mi pedido?');
      expect(screen.getByText('24/500')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }));

      expect(screen.getByText(/mensaje enviado/i)).toBeInTheDocument();
      expect(campo('mensaje')).toHaveValue('');
      expect(screen.getByRole('link', { name: /whatsapp/i }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\//);
    });

    it('el blog lista sus artículos y abre el detalle de cada uno', () => {
      abrirEn('/blog');
      const botones = screen.getAllByRole('link', { name: /leer más/i });
      expect(botones).toHaveLength(2);

      fireEvent.click(botones[1]);
      expect(rutaActual()).toBe('/blog/2');
      expect(screen.getByRole('heading', { name: 'PS5 Slim: ¿vale la pena el cambio?' })).toBeInTheDocument();
      expect(screen.getByText('Otras publicaciones')).toBeInTheDocument();
    });

    it('nosotros muestra al equipo del proyecto', () => {
      abrirEn('/nosotros');
      ['Amaro López', 'Lukas Meza', 'Maximiliano Mella'].forEach((nombre) =>
        expect(screen.getByText(nombre)).toBeInTheDocument()
      );
    });
  });
});
