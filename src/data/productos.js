// Importamos tus imágenes locales desde src/assets/
import ps5Img from '../assets/ps5.jpg';
import catanImg from '../assets/catan.jpg';
import sillaImg from '../assets/silla.jpg';

const PRODUCTOS_INICIALES = [
  {
    id: 1,
    nombre: "PlayStation 5 Slim 1TB",
    categoria: "Consolas",
    precio: 499990,
    stock: 8,
    stockCritico: 3,
    imagen: ps5Img,
    descripcion: "Consola Sony PlayStation 5 con lector de discos y 1TB SSD ultra rápido."
  },
  {
    id: 2,
    nombre: "Silla Gamer Ergonómica Pro",
    categoria: "Sillas",
    precio: 159990,
    precioOferta: 129990,
    stock: 4,
    stockCritico: 5,
    imagen: sillaImg,
    descripcion: "Silla gamer reclinable 180° con soporte lumbar y apoya brazos 4D."
  },
  {
    id: 3,
    nombre: "Catan El Juego",
    categoria: "Juegos de Mesa",
    precio: 34990,
    precioOferta: 27990,
    stock: 10,
    stockCritico: 3,
    imagen: catanImg,
    descripcion: "Juego de mesa clásico de comercio y colonización de islas."
  },
  {
    id: 4,
    nombre: "Teclado Mecánico RGB Switch Blue",
    categoria: "Periféricos",
    precio: 45990,
    precioOferta: 34990,
    stock: 15,
    stockCritico: 5,
    imagen: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop",
    descripcion: "Teclado mecánico con retroiluminación RGB configurable y switches táctiles."
  },
  {
    id: 5,
    nombre: "Mouse Gamer 16000 DPI Sensor Óptico",
    categoria: "Periféricos",
    precio: 29990,
    stock: 2,
    stockCritico: 4,
    imagen: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop",
    descripcion: "Mouse ultra liviano con 6 botones programables y sensor de alta precisión."
  }
];

const STORAGE_KEY = "levelup_productos";

const inicializarStorage = () => {
  const guardados = localStorage.getItem(STORAGE_KEY);
  if (!guardados) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PRODUCTOS_INICIALES));
    return PRODUCTOS_INICIALES;
  }
  return JSON.parse(guardados);
};

// Convierte a número los campos que llegan como texto desde los formularios
const normalizarProducto = (producto) => ({
  ...producto,
  precio: Number(producto.precio),
  stock: Number(producto.stock),
  stockCritico: Number(producto.stockCritico || 5),
  precioOferta: producto.precioOferta ? Number(producto.precioOferta) : null,
});

export const obtenerProductos = () => inicializarStorage();

export const obtenerProductoPorId = (id) => {
  const productos = obtenerProductos();
  return productos.find((p) => p.id === Number(id));
};

export const crearProducto = (nuevoProducto) => {
  const productos = obtenerProductos();
  const productoConId = {
    ...normalizarProducto(nuevoProducto),
    id: Date.now(),
  };
  const listaActualizada = [...productos, productoConId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listaActualizada));
  return productoConId;
};

export const actualizarProducto = (id, datosActualizados) => {
  const productos = obtenerProductos();
  const listaActualizada = productos.map((p) =>
    p.id === Number(id) ? { ...normalizarProducto({ ...p, ...datosActualizados }), id: Number(id) } : p
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listaActualizada));
  return true;
};

export const eliminarProducto = (id) => {
  const productos = obtenerProductos();
  const listaActualizada = productos.filter((p) => p.id !== Number(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listaActualizada));
  return true;
};

// Resta del inventario las unidades vendidas en una orden pagada
export const descontarStock = (items) => {
  const productos = obtenerProductos();
  const listaActualizada = productos.map((p) => {
    const vendido = items.find((item) => item.id === p.id);
    return vendido ? { ...p, stock: Math.max(0, p.stock - vendido.cantidad) } : p;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listaActualizada));
};

export const obtenerProductosCriticos = () => {
  const productos = obtenerProductos();
  return productos.filter((p) => p.stock <= p.stockCritico);
};

// Un producto está en oferta si tiene precio de oferta y es menor al precio normal
export const esOferta = (producto) =>
  Boolean(producto.precioOferta) && producto.precioOferta < producto.precio;

// Precio que paga el cliente: el de oferta si corresponde, si no el normal
export const obtenerPrecioFinal = (producto) =>
  esOferta(producto) ? producto.precioOferta : producto.precio;

export const obtenerPorcentajeDescuento = (producto) =>
  esOferta(producto) ? Math.round((1 - producto.precioOferta / producto.precio) * 100) : 0;

export const obtenerProductosEnOferta = () => obtenerProductos().filter(esOferta);