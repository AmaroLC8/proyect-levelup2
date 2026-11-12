import { vi } from 'vitest';
import * as productosService from '../services/productosService';
import * as categoriasService from '../services/categoriasService';
import { MENSAJE_SIN_CONEXION } from '../services/api';

// Datos y "backend falso" para las pruebas de las páginas.
// Las pruebas NO llaman al backend real: cada archivo de prueba reemplaza los services con
//   vi.mock('../services/productosService');
//   vi.mock('../services/categoriasService');
// y luego simularBackend() le da a cada función simulada una respuesta, usando una
// "base de datos" en memoria con los mismos datos que carga el DataInitializer del backend.

// Las 6 categorías, con el formato que responde GET /categorias
export const CATEGORIAS_PRUEBA = [
  { id: 1, nombre: 'Consolas', descripcion: 'Consolas de última generación y retro.', activa: true },
  { id: 2, nombre: 'Periféricos', descripcion: 'Teclados, mouse, audífonos y controles.', activa: true },
  { id: 3, nombre: 'Sillas', descripcion: 'Sillas gamer ergonómicas para largas sesiones.', activa: true },
  { id: 4, nombre: 'Juegos de Mesa', descripcion: 'Juegos de estrategia y para compartir.', activa: true },
  { id: 5, nombre: 'Computadores Gamer', descripcion: 'Torres, notebooks y monitores gaming.', activa: true },
  { id: 6, nombre: 'Accesorios', descripcion: 'Mousepads, soportes y accesorios para tu setup.', activa: true },
];

// Arma un producto como lo responde el backend: la categoría va como objeto completo
const producto = (id, nombre, idCategoria, precio, precioOferta, stock, stockCritico) => ({
  id,
  nombre,
  descripcion: `Descripción de ${nombre}`,
  precio,
  precioOferta,
  stock,
  stockCritico,
  imagen: '',
  categoria: CATEGORIAS_PRUEBA.find((c) => c.id === idCategoria),
});

// Los 15 productos, en el mismo orden (y con los mismos id) que GET /productos
export const PRODUCTOS_PRUEBA = [
  producto(1, 'PlayStation 5 Slim 1TB', 1, 499990, null, 8, 3),
  producto(2, 'Silla Gamer Ergonómica Pro', 3, 159990, 129990, 4, 5),
  producto(3, 'Catan El Juego', 4, 34990, 27990, 10, 3),
  producto(4, 'Teclado Mecánico RGB Switch Blue', 2, 45990, 34990, 15, 5),
  producto(5, 'Mouse Gamer 16000 DPI Sensor Óptico', 2, 29990, null, 2, 4),
  producto(6, 'Nintendo Switch OLED Mario Edition', 1, 349990, 319990, 2, 4),
  producto(7, 'Xbox Series X 1TB Black', 1, 529990, 489990, 6, 2),
  producto(8, 'Silla Gamer RGB Lumina Edition', 3, 189990, null, 7, 3),
  producto(9, 'Carcassonne Edición Plus', 4, 38990, null, 3, 4),
  producto(10, 'Dixit Odyssey Juego de Mesa', 4, 29990, 24990, 9, 2),
  producto(11, 'Audífonos Gamer 7.1 Surround', 2, 59990, 49990, 11, 3),
  producto(12, 'PC Gamer RTX 4060 Ryzen 5 16GB', 5, 849990, 799990, 5, 2),
  producto(13, 'Notebook Gamer i7 RTX 4070 144Hz', 5, 1299990, null, 1, 3),
  producto(14, 'Mousepad XXL Speed 900x400mm', 6, 18990, 14990, 20, 5),
  producto(15, 'Brazo Hidráulico para Micrófono', 6, 25990, null, 8, 3),
];

// Crea un error igual al que lanza services/api.js cuando el backend responde con error
export const errorDelBackend = (status, mensaje) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

// Copia profunda: así la página recibe objetos nuevos, como si llegaran como JSON por la red
const copia = (datos) => JSON.parse(JSON.stringify(datos));

/**
 * Hace que los services simulados respondan como el backend, con una base de datos en memoria.
 * Devuelve esa base ({ productos, categorias }) para que la prueba pueda revisarla o modificarla.
 */
export const simularBackend = () => {
  const db = { productos: copia(PRODUCTOS_PRUEBA), categorias: copia(CATEGORIAS_PRUEBA) };
  const siguienteId = (lista) => Math.max(0, ...lista.map((x) => x.id)) + 1;

  // ---------- Productos ----------
  vi.mocked(productosService.listarProductos).mockImplementation(async (filtros = {}) =>
    copia(
      db.productos.filter(
        (p) =>
          (!filtros.categoriaId || p.categoria.id === Number(filtros.categoriaId)) &&
          (!filtros.buscar || p.nombre.toLowerCase().includes(filtros.buscar.toLowerCase()))
      )
    )
  );

  vi.mocked(productosService.obtenerProducto).mockImplementation(async (id) => {
    const encontrado = db.productos.find((p) => p.id === Number(id));
    if (!encontrado) throw errorDelBackend(404, `No existe el producto con id ${id}`);
    return copia(encontrado);
  });

  vi.mocked(productosService.listarOfertas).mockImplementation(async () =>
    copia(db.productos.filter((p) => p.precioOferta && p.precioOferta < p.precio))
  );

  vi.mocked(productosService.listarCriticos).mockImplementation(async () =>
    copia(db.productos.filter((p) => p.stock <= p.stockCritico))
  );

  // Recibe un ProductoRequest (con categoriaId) y guarda el producto con la categoría completa
  const guardarProducto = (id, request) => {
    const categoria = db.categorias.find((c) => c.id === request.categoriaId);
    if (!categoria) throw errorDelBackend(404, `No existe la categoría con id ${request.categoriaId}`);
    const datos = { ...request };
    delete datos.categoriaId; // en la respuesta va "categoria" (objeto), no "categoriaId"
    return { id, ...datos, categoria };
  };

  vi.mocked(productosService.crearProducto).mockImplementation(async (request) => {
    const nuevo = guardarProducto(siguienteId(db.productos), request);
    db.productos.push(nuevo);
    return copia(nuevo);
  });

  vi.mocked(productosService.actualizarProducto).mockImplementation(async (id, request) => {
    const indice = db.productos.findIndex((p) => p.id === Number(id));
    if (indice === -1) throw errorDelBackend(404, `No existe el producto con id ${id}`);
    db.productos[indice] = guardarProducto(Number(id), request);
    return copia(db.productos[indice]);
  });

  vi.mocked(productosService.eliminarProducto).mockImplementation(async (id) => {
    db.productos = db.productos.filter((p) => p.id !== Number(id));
    return null; // 204 No Content
  });

  // ---------- Categorías ----------
  const nombreRepetido = (nombre, idPropio) =>
    db.categorias.some((c) => c.id !== idPropio && c.nombre.toLowerCase() === nombre.trim().toLowerCase());

  vi.mocked(categoriasService.listarCategorias).mockImplementation(async () => copia(db.categorias));

  vi.mocked(categoriasService.listarCategoriasActivas).mockImplementation(async () =>
    copia(db.categorias.filter((c) => c.activa))
  );

  vi.mocked(categoriasService.obtenerCategoria).mockImplementation(async (id) => {
    const encontrada = db.categorias.find((c) => c.id === Number(id));
    if (!encontrada) throw errorDelBackend(404, `No existe la categoría con id ${id}`);
    return copia(encontrada);
  });

  vi.mocked(categoriasService.crearCategoria).mockImplementation(async (request) => {
    if (nombreRepetido(request.nombre)) {
      throw errorDelBackend(409, `Ya existe una categoría con el nombre '${request.nombre}'`);
    }
    const nueva = { id: siguienteId(db.categorias), activa: true, ...request };
    db.categorias.push(nueva);
    return copia(nueva);
  });

  vi.mocked(categoriasService.actualizarCategoria).mockImplementation(async (id, request) => {
    if (nombreRepetido(request.nombre, Number(id))) {
      throw errorDelBackend(409, `Ya existe una categoría con el nombre '${request.nombre}'`);
    }
    db.categorias = db.categorias.map((c) => (c.id === Number(id) ? { ...c, ...request } : c));
    return copia(db.categorias.find((c) => c.id === Number(id)));
  });

  vi.mocked(categoriasService.eliminarCategoria).mockImplementation(async (id) => {
    if (db.productos.some((p) => p.categoria.id === Number(id))) {
      throw errorDelBackend(409, 'No se puede eliminar la categoría porque tiene productos asociados');
    }
    db.categorias = db.categorias.filter((c) => c.id !== Number(id));
    return null; // 204 No Content
  });

  // Se devuelve un objeto con getters para que la prueba siempre vea las listas actuales
  return {
    get productos() { return db.productos; },
    get categorias() { return db.categorias; },
  };
};

/** Simula que el backend está apagado: todas las llamadas fallan como lo haría services/api.js. */
export const simularBackendCaido = () => {
  const fallar = async () => {
    throw new Error(MENSAJE_SIN_CONEXION);
  };
  [productosService, categoriasService].forEach((service) => {
    Object.values(service).forEach((funcion) => vi.mocked(funcion).mockImplementation(fallar));
  });
};
