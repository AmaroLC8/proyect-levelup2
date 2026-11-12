import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { API_URL, MENSAJE_SIN_CONEXION } from '../services/api';
import { listarProductos, crearProducto, obtenerProducto } from '../services/productosService';
import { eliminarCategoria, listarCategoriasActivas } from '../services/categoriasService';
import * as productosService from '../services/productosService';
import * as categoriasService from '../services/categoriasService';
import * as authService from '../services/authService';
import * as boletasService from '../services/boletasService';
import * as usuariosService from '../services/usuariosService';
import * as reportesService from '../services/reportesService';

// Estas pruebas revisan services/api.js y los services sin llamar al backend real:
// se reemplaza la función global fetch por un mock (vi.stubGlobal) que responde lo que la prueba decide.

// Simula una respuesta HTTP de fetch con el status y el cuerpo JSON indicados
const respuesta = (status, cuerpo) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => (cuerpo === undefined ? '' : JSON.stringify(cuerpo)),
});

describe('Pruebas de services/api.js y los services de la API', () => {
  let fetchSimulado;

  beforeEach(() => {
    localStorage.clear();
    fetchSimulado = vi.fn();
    vi.stubGlobal('fetch', fetchSimulado);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Devuelve la URL y la configuración con que se llamó a fetch
  const ultimaLlamada = () => fetchSimulado.mock.calls.at(-1);

  it('usa la URL del backend y devuelve el JSON de la respuesta', async () => {
    fetchSimulado.mockResolvedValue(respuesta(200, [{ id: 1, nombre: 'Consolas', activa: true }]));

    const categorias = await listarCategoriasActivas();

    expect(categorias).toEqual([{ id: 1, nombre: 'Consolas', activa: true }]);
    const [url, config] = ultimaLlamada();
    expect(url).toBe(`${API_URL}/categorias/activas`);
    expect(config.method).toBe('GET');
    expect(API_URL).toBe('http://localhost:8080/api/v1');
  });

  it('listarProductos agrega a la URL solo los filtros que vienen', async () => {
    fetchSimulado.mockResolvedValue(respuesta(200, []));

    await listarProductos();
    expect(ultimaLlamada()[0]).toBe(`${API_URL}/productos`);

    await listarProductos({ categoriaId: 2, buscar: 'mouse' });
    expect(ultimaLlamada()[0]).toBe(`${API_URL}/productos?categoriaId=2&buscar=mouse`);
  });

  it('envía el token guardado como "Authorization: Bearer <token>"', async () => {
    fetchSimulado.mockResolvedValue(respuesta(200, []));

    await listarProductos();
    expect(ultimaLlamada()[1].headers.Authorization).toBeUndefined();

    localStorage.setItem('token', 'abc.def.ghi');
    await listarProductos();
    expect(ultimaLlamada()[1].headers.Authorization).toBe('Bearer abc.def.ghi');
  });

  it('crearProducto hace un POST con el producto en formato JSON', async () => {
    const request = { nombre: 'Mouse', precio: 9990, stock: 5, stockCritico: 2, categoriaId: 2 };
    fetchSimulado.mockResolvedValue(respuesta(201, { id: 16, ...request }));

    const creado = await crearProducto(request);

    const [url, config] = ultimaLlamada();
    expect(url).toBe(`${API_URL}/productos`);
    expect(config.method).toBe('POST');
    expect(config.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(config.body)).toEqual(request);
    expect(creado.id).toBe(16);
  });

  it('un DELETE con 204 (sin contenido) devuelve null', async () => {
    fetchSimulado.mockResolvedValue(respuesta(204));

    await expect(eliminarCategoria(7)).resolves.toBeNull();
    expect(ultimaLlamada()[0]).toBe(`${API_URL}/categorias/7`);
    expect(ultimaLlamada()[1].method).toBe('DELETE');
  });

  it('si el backend responde con error, lanza un Error con su "mensaje" y su status', async () => {
    fetchSimulado.mockResolvedValue(
      respuesta(404, { status: 404, error: 'Not Found', mensaje: 'No existe el producto con id 99' })
    );

    const error = await obtenerProducto(99).catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('No existe el producto con id 99');
    expect(error.status).toBe(404);
  });

  it('en un 400 de validación agrega al mensaje el error de cada campo', async () => {
    fetchSimulado.mockResolvedValue(
      respuesta(400, {
        status: 400,
        mensaje: 'Hay campos con datos inválidos',
        campos: { precio: 'El precio debe ser mayor a 0' },
      })
    );

    await expect(crearProducto({})).rejects.toThrow(
      'Hay campos con datos inválidos: El precio debe ser mayor a 0'
    );
  });

  it('si el backend está apagado, lanza un mensaje claro de conexión', async () => {
    fetchSimulado.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(listarProductos()).rejects.toThrow(MENSAJE_SIN_CONEXION);
  });

  // Tabla con cada función de los services y la petición que debe hacer al backend.
  // Si alguien cambia una ruta por error (ej: "/usuario" en vez de "/usuarios"), esta prueba lo detecta.
  const LLAMADAS = [
    ['obtenerProducto(5)', () => productosService.obtenerProducto(5), 'GET', '/productos/5'],
    ['listarOfertas()', () => productosService.listarOfertas(), 'GET', '/productos/ofertas'],
    ['listarCriticos()', () => productosService.listarCriticos(), 'GET', '/productos/criticos'],
    ['actualizarProducto(5)', () => productosService.actualizarProducto(5, {}), 'PUT', '/productos/5'],
    ['eliminarProducto(5)', () => productosService.eliminarProducto(5), 'DELETE', '/productos/5'],
    ['listarCategorias()', () => categoriasService.listarCategorias(), 'GET', '/categorias'],
    ['obtenerCategoria(2)', () => categoriasService.obtenerCategoria(2), 'GET', '/categorias/2'],
    ['crearCategoria()', () => categoriasService.crearCategoria({}), 'POST', '/categorias'],
    ['actualizarCategoria(2)', () => categoriasService.actualizarCategoria(2, {}), 'PUT', '/categorias/2'],
    ['login()', () => authService.login('a@b.cl', 'x'), 'POST', '/auth/login'],
    ['registro()', () => authService.registro({}), 'POST', '/auth/registro'],
    ['obtenerSesion()', () => authService.obtenerSesion(), 'GET', '/auth/me'],
    ['obtenerPerfil()', () => authService.obtenerPerfil(), 'GET', '/auth/perfil'],
    ['actualizarPerfil()', () => authService.actualizarPerfil({}), 'PUT', '/auth/perfil'],
    ['crearBoleta()', () => boletasService.crearBoleta({}), 'POST', '/boletas'],
    ['listarBoletas()', () => boletasService.listarBoletas(), 'GET', '/boletas'],
    ['obtenerBoleta(1)', () => boletasService.obtenerBoleta(1), 'GET', '/boletas/1'],
    ['obtenerPorNumero()', () => boletasService.obtenerPorNumero('20261112-001'), 'GET', '/boletas/numero/20261112-001'],
    ['misCompras()', () => boletasService.misCompras(), 'GET', '/boletas/mis-compras'],
    ['historialUsuario(3)', () => boletasService.historialUsuario(3), 'GET', '/boletas/usuario/3'],
    ['listarUsuarios()', () => usuariosService.listarUsuarios(), 'GET', '/usuarios'],
    ['listarUsuarios(VENDEDOR)', () => usuariosService.listarUsuarios('VENDEDOR'), 'GET', '/usuarios?rol=VENDEDOR'],
    ['obtenerUsuario(3)', () => usuariosService.obtenerUsuario(3), 'GET', '/usuarios/3'],
    ['crearUsuario()', () => usuariosService.crearUsuario({}), 'POST', '/usuarios'],
    ['actualizarUsuario(3)', () => usuariosService.actualizarUsuario(3, {}), 'PUT', '/usuarios/3'],
    ['eliminarUsuario(3)', () => usuariosService.eliminarUsuario(3), 'DELETE', '/usuarios/3'],
    ['obtenerDashboard()', () => reportesService.obtenerDashboard(), 'GET', '/reportes/dashboard'],
    ['obtenerReporteVentas()', () => reportesService.obtenerReporteVentas(), 'GET', '/reportes/ventas'],
  ];

  it.each(LLAMADAS)('%s hace %s a la ruta correcta', async (_nombre, llamar, metodo, ruta) => {
    fetchSimulado.mockResolvedValue(respuesta(200, {}));

    await llamar();

    const [url, config] = ultimaLlamada();
    expect(config.method).toBe(metodo);
    expect(url).toBe(`${API_URL}${ruta}`);
  });
});
