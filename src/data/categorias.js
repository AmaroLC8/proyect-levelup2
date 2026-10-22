import { obtenerProductos, reemplazarCategoriaEnProductos } from './productos';

// Los nombres deben coincidir con el campo "categoria" de los productos
const CATEGORIAS_INICIALES = [
  { id: 1, nombre: 'Consolas', descripcion: 'Consolas de última generación y retro.', activa: true },
  { id: 2, nombre: 'Periféricos', descripcion: 'Teclados, mouse, audífonos y controles.', activa: true },
  { id: 3, nombre: 'Sillas', descripcion: 'Sillas gamer ergonómicas para largas sesiones.', activa: true },
  { id: 4, nombre: 'Juegos de Mesa', descripcion: 'Juegos de estrategia y para compartir.', activa: true },
  { id: 5, nombre: 'Computadores Gamer', descripcion: 'Torres, notebooks y monitores gaming.', activa: true },
  { id: 6, nombre: 'Accesorios', descripcion: 'Mousepads, soportes y accesorios para tu setup.', activa: true },
];

const STORAGE_KEY = 'levelup_categorias';

const inicializarStorage = () => {
  const guardadas = localStorage.getItem(STORAGE_KEY);
  if (!guardadas) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(CATEGORIAS_INICIALES));
    return CATEGORIAS_INICIALES;
  }
  return JSON.parse(guardadas);
};

export const guardarCategorias = (lista) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
};

const mismoNombre = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

export const obtenerCategorias = () => inicializarStorage();

// Solo las activas se muestran en la tienda
export const obtenerCategoriasActivas = () => obtenerCategorias().filter((c) => c.activa);

export const obtenerCategoriaPorId = (id) => obtenerCategorias().find((c) => c.id === Number(id));

export const contarProductosPorCategoria = (nombre) =>
  obtenerProductos().filter((p) => mismoNombre(p.categoria, nombre)).length;

// Retornan { ok, error } para que el formulario muestre el mensaje
export const crearCategoria = (nuevaCategoria) => {
  const categorias = obtenerCategorias();
  if (categorias.some((c) => mismoNombre(c.nombre, nuevaCategoria.nombre))) {
    return { ok: false, error: 'Ya existe una categoría con ese nombre' };
  }
  const categoriaConId = { activa: true, ...nuevaCategoria, nombre: nuevaCategoria.nombre.trim(), id: Date.now() };
  guardarCategorias([...categorias, categoriaConId]);
  return { ok: true, categoria: categoriaConId };
};

export const actualizarCategoria = (id, datosActualizados) => {
  const categorias = obtenerCategorias();
  const anterior = categorias.find((c) => c.id === Number(id));
  if (!anterior) return { ok: false, error: 'La categoría no existe' };

  const nuevoNombre = (datosActualizados.nombre ?? anterior.nombre).trim();
  if (categorias.some((c) => c.id !== anterior.id && mismoNombre(c.nombre, nuevoNombre))) {
    return { ok: false, error: 'Ya existe una categoría con ese nombre' };
  }

  guardarCategorias(
    categorias.map((c) => (c.id === anterior.id ? { ...c, ...datosActualizados, nombre: nuevoNombre, id: c.id } : c))
  );

  // Si cambió el nombre, los productos de esa categoría se mueven al nuevo nombre
  if (anterior.nombre !== nuevoNombre) reemplazarCategoriaEnProductos(anterior.nombre, nuevoNombre);
  return { ok: true };
};

export const eliminarCategoria = (id) => {
  const categoria = obtenerCategoriaPorId(id);
  if (!categoria) return { ok: false, error: 'La categoría no existe' };

  const cantidad = contarProductosPorCategoria(categoria.nombre);
  if (cantidad > 0) {
    return { ok: false, error: `No se puede eliminar: tiene ${cantidad} producto(s) asociado(s)` };
  }
  guardarCategorias(obtenerCategorias().filter((c) => c.id !== categoria.id));
  return { ok: true };
};
