import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import App from '../App';
import { login, actualizarPerfil } from '../services/authService';
import { crearBoleta, misCompras } from '../services/boletasService';
import { simularBackend, simularBackendCaido } from './backendSimulado';
import { simularAuth, simularSesion, PEDRO } from './sesionSimulada';
import { simularBoletas } from './boletasSimuladas';
import { simularReportes } from './panelSimulado';

// Los services se reemplazan por funciones simuladas: las pruebas no llaman al backend real.
// simularBackend(), simularAuth(), simularBoletas() y simularReportes() (en beforeEach) les dan respuestas
// con los datos de prueba. reportesService se necesita porque el login del ADMIN abre el dashboard.
vi.mock('../services/productosService');
vi.mock('../services/categoriasService');
vi.mock('../services/authService');
vi.mock('../services/boletasService');
vi.mock('../services/reportesService');

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

// Las páginas piden los datos a la API (asíncrono): se espera a que desaparezca el "Cargando..."
const esperarCarga = () =>
  waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());

describe('Pruebas de las vistas de la tienda', () => {
  let db; // "base de datos" del backend simulado (productos y categorías)
  let boletas; // boletas y stock del backend simulado

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks(); // borra las llamadas registradas en la prueba anterior (ej: login)
    db = simularBackend();
    simularAuth();
    boletas = simularBoletas();
    simularReportes();
  });

  describe('Home y Catálogo', () => {
    it('el Home muestra 3 productos destacados', async () => {
      abrirEn('/');
      expect(screen.getByText('Productos Destacados')).toBeInTheDocument();
      await esperarCarga();
      expect(tarjetasDeProducto()).toHaveLength(3);
    });

    it('el catálogo renderiza todos los productos que entrega el backend', async () => {
      abrirEn('/productos');
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
      await esperarCarga();
      expect(tarjetasDeProducto()).toHaveLength(15);
    });

    it('si el backend no responde, muestra un mensaje de error sin romper la página', async () => {
      simularBackendCaido();
      abrirEn('/productos');

      expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo conectar con el servidor/i);
      expect(tarjetasDeProducto()).toHaveLength(0);
      expect(screen.getByText('Catálogo Completo')).toBeInTheDocument();
    });

    it('filtra por texto de búsqueda, categoría y precio máximo (RF2)', async () => {
      abrirEn('/productos?buscar=mouse');
      await esperarCarga();
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

    it('muestra un mensaje cuando ningún producto cumple los filtros', async () => {
      abrirEn('/productos?buscar=zzz');
      await esperarCarga();
      expect(tarjetasDeProducto()).toHaveLength(0);
      expect(screen.getByText(/no se encontraron productos/i)).toBeInTheDocument();
    });
  });

  describe('Categorías y Ofertas', () => {
    it('cambia los productos al seleccionar otra categoría sin recargar (RF8)', async () => {
      db.categorias.push({ id: 7, nombre: 'Streaming', descripcion: 'Categoría nueva, todavía sin productos', activa: true });
      abrirEn('/categorias');
      expect(await screen.findByText('PlayStation 5 Slim 1TB')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /sillas/i }));
      expect(screen.getByText('Silla Gamer Ergonómica Pro')).toBeInTheDocument();
      expect(screen.queryByText('PlayStation 5 Slim 1TB')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /computadores gamer/i }));
      expect(screen.getByText('PC Gamer RTX 4060 Ryzen 5 16GB')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /streaming/i }));
      expect(screen.getByText(/aún no hay productos en esta categoría/i)).toBeInTheDocument();
    });

    it('las categorías desactivadas no aparecen en la tienda', async () => {
      db.categorias.find((c) => c.nombre === 'Sillas').activa = false;
      abrirEn('/categorias');
      await esperarCarga();

      expect(screen.queryByRole('button', { name: /sillas/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /consolas/i })).toBeInTheDocument();
    });

    it('ofertas muestra solo productos con descuento, de mayor a menor % (RF9)', async () => {
      abrirEn('/ofertas');
      const descuentos = (await screen.findAllByText(/^-\d+%$/)).map((etiqueta) => etiqueta.textContent);
      expect(descuentos).toEqual(['-24%', '-21%', '-20%', '-19%', '-17%', '-17%', '-9%', '-8%', '-6%']);
      expect(screen.queryByText('PlayStation 5 Slim 1TB')).not.toBeInTheDocument();
    });
  });

  describe('Detalle de producto', () => {
    it('muestra la información del producto y lo agrega al carrito (RF10)', async () => {
      abrirEn('/producto/1');
      expect(await screen.findByRole('heading', { name: 'PlayStation 5 Slim 1TB' })).toBeInTheDocument();
      expect(screen.getByText('Stock disponible: 8 unidades')).toBeInTheDocument();
      // La categoría llega como objeto desde el backend y se muestra su nombre
      expect(screen.getAllByText('Consolas').length).toBeGreaterThan(0);

      fireEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
      expect(screen.getByRole('link', { name: /carrito/i })).toHaveTextContent('Carrito $499.990');
    });

    it('muestra productos relacionados de la misma categoría usando el filtro del backend', async () => {
      abrirEn('/producto/1');
      expect(await screen.findByText('Productos relacionados')).toBeInTheDocument();
      expect(screen.getByText('Nintendo Switch OLED Mario Edition')).toBeInTheDocument();
      expect(screen.getByText('Xbox Series X 1TB Black')).toBeInTheDocument();
    });

    it('muestra "Producto no encontrado" si el backend responde 404', async () => {
      abrirEn('/producto/999');
      expect(await screen.findByText('Producto no encontrado')).toBeInTheDocument();
    });

    it('si el backend no responde, muestra el error en vez de "Producto no encontrado"', async () => {
      simularBackendCaido();
      abrirEn('/producto/1');
      expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo conectar con el servidor/i);
      expect(screen.queryByText('Producto no encontrado')).not.toBeInTheDocument();
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

    // Llena el registro con datos válidos (el correo y el código de referido se pueden cambiar)
    const llenarRegistro = (correo, codigoReferido = '') => {
      escribir('nombre', 'María');
      escribir('apellidos', 'Soto');
      escribir('correo', correo);
      escribir('fechaNacimiento', '2000-01-01');
      escribir('password', 'maria1234');
      escribir('confirmarPassword', 'maria1234');
      escribir('codigoReferido', codigoReferido);
    };

    it('avisa el descuento Duoc y al registrarse entra con la cuenta nueva (RF1)', async () => {
      abrirEn('/registro');
      llenarRegistro('maria@duocuc.cl');
      expect(screen.getByText(/correo duoc detectado/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

      // POST /auth/registro y luego login automático
      expect(await screen.findByTitle('Ver mi perfil')).toHaveTextContent('Hola, María');
      expect(rutaActual()).toBe('/');
      expect(screen.getByText('Duoc -20%')).toBeInTheDocument();
      expect(login).toHaveBeenCalledWith('maria@duocuc.cl', 'maria1234');
    });

    it('el registro muestra el error del backend si el correo ya está registrado', async () => {
      abrirEn('/registro');
      llenarRegistro('pedro@duocuc.cl');
      fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

      expect(await screen.findByRole('alert')).toHaveTextContent(/ya existe un usuario registrado con el correo pedro@duocuc.cl/i);
      expect(rutaActual()).toBe('/registro');
    });

    it('el registro muestra el error del backend si el código de referido no existe', async () => {
      abrirEn('/registro');
      llenarRegistro('maria@gmail.com', 'lvlnoexiste');
      fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

      expect(await screen.findByRole('alert')).toHaveTextContent("El código de referido 'LVLNOEXISTE' no existe");
      expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
    });

    it('el login muestra un error con datos incorrectos', async () => {
      abrirEn('/login');
      fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
      expect(screen.getByText('Ingresa tu correo y contraseña')).toBeInTheDocument();
      expect(login).not.toHaveBeenCalled();

      escribir('correo', 'pedro@duocuc.cl');
      escribir('password', 'incorrecta1');
      fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
      // Mensaje que responde el backend (401)
      expect(await screen.findByText('Correo o contraseña incorrectos')).toBeInTheDocument();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('mientras espera al backend el botón muestra "Ingresando..." y queda deshabilitado', () => {
      vi.mocked(login).mockImplementationOnce(() => new Promise(() => {})); // nunca responde
      abrirEn('/login');
      escribir('correo', 'pedro@duocuc.cl');
      escribir('password', 'pedro1234');
      fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

      expect(screen.getByRole('button', { name: /ingresando/i })).toBeDisabled();
    });

    it('el ADMIN entra directo al dashboard del panel', async () => {
      abrirEn('/login');
      escribir('correo', 'admin@levelup.cl');
      escribir('password', 'admin1234');
      fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

      expect(await screen.findByText('Panel de Administración')).toBeInTheDocument();
      expect(rutaActual()).toBe('/admin');
      expect(localStorage.getItem('token')).toBe('token-1');
    });

    it('el VENDEDOR entra directo a la lista de productos', async () => {
      abrirEn('/login');
      escribir('correo', 'vendedor@levelup.cl');
      escribir('password', 'vendedor1234');
      fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

      expect(await screen.findByText('Gestión de Productos e Inventario')).toBeInTheDocument();
      expect(rutaActual()).toBe('/admin/productos');
    });

    it('el CLIENTE vuelve al inicio de la tienda', async () => {
      abrirEn('/login');
      escribir('correo', 'pedro@duocuc.cl');
      escribir('password', 'pedro1234');
      fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

      expect(await screen.findByTitle('Ver mi perfil')).toHaveTextContent('Hola, Pedro');
      expect(rutaActual()).toBe('/');
    });
  });

  describe('Carrito, checkout y resultado del pago', () => {
    const llenarCheckout = (correo) => {
      escribir('nombre', 'Ana');
      escribir('apellidos', 'Soto');
      escribir('correo', correo);
      escribir('calle', 'Av. Siempre Viva 742');
    };

    it('el carrito de un usuario Duoc muestra subtotal, descuento, impuestos y total', () => {
      simularSesion(PEDRO);
      localStorage.setItem('levelup_cart', JSON.stringify([{ id: 5, nombre: 'Mouse Gamer', precio: 10000, cantidad: 2, imagen: '' }]));
      abrirEn('/carrito');

      expect(screen.getByText(/descuento duoc \(20%\)/i)).toBeInTheDocument();
      expect(screen.getByText('-$4.000')).toBeInTheDocument();
      // $16.000 con IVA incluido = neto $13.445 + IVA $2.555
      expect(screen.getByText('Neto:').nextSibling).toHaveTextContent('$13.445');
      expect(screen.getByText('IVA (19%):').nextSibling).toHaveTextContent('$2.555');
      expect(screen.getByRole('link', { name: /carrito/i })).toHaveTextContent('Carrito $16.000');
    });

    it('el checkout muestra el IVA antes de pagar', () => {
      localStorage.setItem('levelup_cart', JSON.stringify([{ id: 1, nombre: 'PlayStation 5 Slim 1TB', precio: 499990, cantidad: 1 }]));
      abrirEn('/checkout');

      expect(screen.getByText('IVA (19%):').nextSibling).toHaveTextContent('$79.830');
      expect(screen.getByText('Total a pagar:').nextSibling).toHaveTextContent('$499.990');
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

    it('una compra PAGADA envía la boleta al backend, vacía el carrito y muestra el detalle (RF12)', async () => {
      abrirEn('/producto/5');
      fireEvent.click(await screen.findByRole('button', { name: /añadir al carrito/i }));
      fireEvent.click(screen.getByRole('link', { name: /carrito/i }));
      fireEvent.click(screen.getByRole('link', { name: /comprar ahora/i }));

      llenarCheckout('ana@gmail.com');
      fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));

      expect(await screen.findByText('¡Se ha realizado la compra con éxito!')).toBeInTheDocument();
      expect(rutaActual()).toBe('/pago-exitoso');
      // Formato BoletaRequest: datos del cliente, dirección e items { productoId, cantidad }, sin precios
      expect(crearBoleta).toHaveBeenCalledWith({
        nombre: 'Ana', apellidos: 'Soto', correo: 'ana@gmail.com',
        calle: 'Av. Siempre Viva 742', depto: '', region: 'Región Metropolitana de Santiago',
        comuna: expect.any(String), indicaciones: '',
        items: [{ productoId: 5, cantidad: 1 }],
      });
      // La página muestra la boleta del backend: número, producto y montos calculados por el servidor
      expect(screen.getByText(`Orden #${boletas.boletas[0].numeroOrden}`)).toBeInTheDocument();
      expect(screen.getByText('Mouse Gamer 16000 DPI Sensor Óptico')).toBeInTheDocument();
      expect(screen.getByText('Neto:').nextSibling).toHaveTextContent('$25.202');
      expect(screen.getByText('IVA (19%):').nextSibling).toHaveTextContent('$4.788');
      // El stock lo descontó el backend y el carrito quedó vacío
      expect(boletas.productos.find((p) => p.id === 5).stock).toBe(1);
      expect(screen.getByRole('link', { name: /carrito/i })).toHaveTextContent('Carrito $0');
    });

    it('con sesión de cliente precarga sus datos y el backend aplica su descuento Duoc', async () => {
      simularSesion(PEDRO);
      localStorage.setItem('levelup_cart', JSON.stringify([{ id: 5, nombre: 'Mouse Gamer', precio: 29990, cantidad: 1, stock: 2 }]));
      abrirEn('/checkout');

      expect(campo('nombre')).toHaveValue('Pedro');
      expect(campo('correo')).toHaveValue('pedro@duocuc.cl');
      escribir('calle', 'Los Crisantemos 123');
      fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));

      expect(await screen.findByText('¡Se ha realizado la compra con éxito!')).toBeInTheDocument();
      // 29.990 - 20% = 23.992: el total que se muestra es el que calculó el backend
      expect(screen.getByText('Total pagado:').nextSibling).toHaveTextContent('$23.992');
    });

    it('mientras espera al backend el botón muestra "Procesando pago..." y queda deshabilitado', () => {
      vi.mocked(crearBoleta).mockImplementationOnce(() => new Promise(() => {})); // nunca responde
      localStorage.setItem('levelup_cart', JSON.stringify([{ id: 5, nombre: 'Mouse Gamer', precio: 29990, cantidad: 1 }]));
      abrirEn('/checkout');
      llenarCheckout('ana@gmail.com');
      fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));

      expect(screen.getByRole('button', { name: /procesando pago/i })).toBeDisabled();
    });

    it('un pago RECHAZADO mantiene el carrito y al reintentar recupera los datos', async () => {
      localStorage.setItem('levelup_cart', JSON.stringify([{ id: 5, nombre: 'Mouse Gamer', precio: 29990, cantidad: 1 }]));
      abrirEn('/checkout');
      llenarCheckout('error@test.com');
      fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));

      expect(await screen.findByText('No se pudo realizar el pago')).toBeInTheDocument();
      expect(rutaActual()).toBe('/pago-error');
      expect(screen.getByText('Monto pendiente:')).toBeInTheDocument();
      // El carrito no se vació y el stock no cambió
      expect(screen.getByRole('link', { name: /carrito/i })).toHaveTextContent('Carrito $29.990');
      expect(boletas.productos.find((p) => p.id === 5).stock).toBe(2);

      fireEvent.click(screen.getByRole('link', { name: /volver a realizar el pago/i }));
      expect(campo('correo')).toHaveValue('error@test.com');
      expect(campo('calle')).toHaveValue('Av. Siempre Viva 742');
    });

    it('si el backend responde 409 (sin stock suficiente), muestra el mensaje en el checkout', async () => {
      // 5 unidades del Mouse, que solo tiene 2 en stock
      localStorage.setItem('levelup_cart', JSON.stringify([{ id: 5, nombre: 'Mouse Gamer', precio: 29990, cantidad: 5 }]));
      abrirEn('/checkout');
      llenarCheckout('ana@gmail.com');
      fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        "Stock insuficiente para 'Mouse Gamer 16000 DPI Sensor Óptico': disponible 2, solicitado 5"
      );
      expect(rutaActual()).toBe('/checkout');
      expect(screen.getByRole('button', { name: /pagar ahora/i })).toBeEnabled();
      expect(screen.getByRole('link', { name: /carrito/i })).toHaveTextContent('Carrito $149.950');
    });

    it('la vista de pago con error avisa si no hay un pago pendiente', () => {
      abrirEn('/pago-error');
      expect(screen.getByText('No hay un pago pendiente para mostrar.')).toBeInTheDocument();
    });
  });

  describe('Perfil, Contacto y Blog', () => {
    it('el perfil del cliente muestra sus puntos, código de referido e historial (RF5)', async () => {
      simularSesion(PEDRO);
      abrirEn('/perfil');

      // Datos que responde GET /auth/perfil
      expect(await screen.findByText(/100 pts/)).toBeInTheDocument();
      expect(screen.getByText('LVLPEDRO')).toBeInTheDocument();
      expect(screen.getByText('20% Descuento Duoc')).toBeInTheDocument();
      // Historial de GET /boletas/mis-compras: solo la boleta de Pedro (la otra es de un visitante)
      expect(await screen.findByText('#20261112-001')).toBeInTheDocument();
      expect(screen.queryByText('#20261112-002')).not.toBeInTheDocument();
      expect(screen.getByText('Catan El Juego (x1), Audífonos Gamer 7.1 Surround (x2)')).toBeInTheDocument();
      expect(screen.getByText('1 pedido(s)')).toBeInTheDocument();
    });

    it('si el historial falla, el perfil se sigue mostrando con el error en esa tarjeta', async () => {
      simularSesion(PEDRO);
      vi.mocked(misCompras).mockRejectedValueOnce(new Error('No se pudo conectar con el servidor.'));
      abrirEn('/perfil');

      expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor.');
      expect(screen.getByText('LVLPEDRO')).toBeInTheDocument();
    });

    it('sin sesión, el perfil redirige a /login', () => {
      abrirEn('/perfil');
      expect(rutaActual()).toBe('/login');
    });

    it('el perfil valida el nombre al editarlo y actualiza el saludo de la barra (RF5)', async () => {
      simularSesion(PEDRO);
      abrirEn('/perfil');
      fireEvent.click(await screen.findByRole('button', { name: /editar/i }));

      const [nombre] = document.querySelectorAll('main form input[type="text"]');
      fireEvent.change(nombre, { target: { value: 'P3dro!' } });
      fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }));
      expect(screen.getByText(/^El nombre solo puede tener letras/)).toBeInTheDocument();
      expect(actualizarPerfil).not.toHaveBeenCalled();

      fireEvent.change(nombre, { target: { value: 'Pedro Pablo' } });
      fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }));
      expect(await screen.findByText(/actualizados exitosamente/)).toBeInTheDocument();
      // PUT /auth/perfil: sin rol, puntos ni descuento; contraseña vacía = mantener la actual
      expect(actualizarPerfil).toHaveBeenCalledWith({
        nombre: 'Pedro Pablo', apellidos: 'Hacker', fechaNacimiento: '2002-08-20', password: '',
      });
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
