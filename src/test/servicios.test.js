import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { API_URL, MENSAJE_SIN_CONEXION } from '../services/api';
import { listarProductos, crearProducto, obtenerProducto } from '../services/productosService';
import { eliminarCategoria, listarCategoriasActivas } from '../services/categoriasService';

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
});
