// Importamos tus imágenes locales desde src/assets/
import ps5Img from '../assets/ps5.jpg';
import catanImg from '../assets/catan.jpg';
import sillaImg from '../assets/silla.jpg';

const PRODUCTOS_INICIALES = [
  // ================= CONSOLAS =================
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
    nombre: "Nintendo Switch OLED Mario Edition",
    categoria: "Consolas",
    precio: 349990,
    precioOferta: 319990,
    stock: 2, // Stock Crítico
    stockCritico: 4,
    imagen: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&auto=format&fit=crop",
    descripcion: "Pantalla OLED de 7 pulgadas con soporte ajustable y audio optimizado."
  },
  {
    id: 3,
    nombre: "Xbox Series X 1TB Black",
    categoria: "Consolas",
    precio: 529990,
    precioOferta: 489990,
    stock: 6,
    stockCritico: 2,
    imagen: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=500&auto=format&fit=crop",
    descripcion: "La Xbox más potente de la historia con resolución 4K nativa a 120 FPS."
  },

  // ================= SILLAS =================
  {
    id: 4,
    nombre: "Silla Gamer Ergonómica Pro",
    categoria: "Sillas",
    precio: 159990,
    precioOferta: 129990,
    stock: 4, // Stock Crítico
    stockCritico: 5,
    imagen: sillaImg,
    descripcion: "Silla gamer reclinable 180° con soporte lumbar y apoya brazos 4D."
  },
  {
    id: 5,
    nombre: "Silla Gamer RGB Lumina Edition",
    categoria: "Sillas",
    precio: 189990,
    stock: 7,
    stockCritico: 3,
    imagen: "https://media.falabella.com/falabellaCL/148583525_01/w=1500,h=1500,fit=cover",
    descripcion: "Iluminación LED RGB perimetral con control remoto y cuero sintético transpirable."
  },

  // ================= JUEGOS DE MESA =================
  {
    id: 6,
    nombre: "Catan El Juego",
    categoria: "Juegos de Mesa",
    precio: 34990,
    precioOferta: 27990,
    stock: 10,
    stockCritico: 3,
    imagen: catanImg,
    descripcion: "Juego de mesa clásico de comercio y colonización de islas para toda la familia."
  },
  {
    id: 7,
    nombre: "Carcassonne Edición Plus",
    categoria: "Juegos de Mesa",
    precio: 38990,
    stock: 3, // Stock Crítico
    stockCritico: 4,
    imagen: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=500&auto=format&fit=crop",
    descripcion: "Estrategia medieval construyendo caminos, monasterios y castillos por losas."
  },
  {
    id: 8,
    nombre: "Dixit Odyssey Juego de Mesa",
    categoria: "Juegos de Mesa",
    precio: 29990,
    precioOferta: 24990,
    stock: 9,
    stockCritico: 2,
    imagen: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=500&auto=format&fit=crop",
    descripcion: "Juego poético y visual de deducción mediante cartas con ilustraciones únicas."
  },

  // ================= PERIFÉRICOS =================
  {
    id: 9,
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
    id: 10,
    nombre: "Mouse Gamer 16000 DPI Sensor Óptico",
    categoria: "Periféricos",
    precio: 29990,
    stock: 2, // Stock Crítico
    stockCritico: 4,
    imagen: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop",
    descripcion: "Mouse ultra liviano con 6 botones programables y sensor de alta precisión."
  },
  {
    id: 11,
    nombre: "Audífonos Gamer 7.1 Surround",
    categoria: "Periféricos",
    precio: 59990,
    precioOferta: 49990,
    stock: 11,
    stockCritico: 3,
    imagen: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop",
    descripcion: "Audio espacial 7.1 con drivers de 50mm y micrófono con cancelación de ruido."
  },

  // ================= COMPUTADORES GAMER =================
  {
    id: 12,
    nombre: "PC Gamer RTX 4060 Ryzen 5 16GB",
    categoria: "Computadores",
    precio: 849990,
    precioOferta: 799990,
    stock: 5,
    stockCritico: 2,
    imagen: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop",
    descripcion: "Equipo armado de alto desempeño con 1TB NVMe, refrigeración líquida y vidrio templado."
  },
  {
    id: 13,
    nombre: "Notebook Gamer i7 RTX 4070 144Hz",
    categoria: "Computadores",
    precio: 1299990,
    stock: 1, // Stock Crítico
    stockCritico: 3,
    imagen: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop",
    descripcion: "Pantalla IPS de 15.6 pulgadas a 144Hz, 32GB RAM DDR5 y chasis de aluminio."
  },

  // ================= ACCESORIOS =================
  {
    id: 14,
    nombre: "Mousepad XXL Speed 900x400mm",
    categoria: "Accesorios",
    precio: 18990,
    precioOferta: 14990,
    stock: 20,
    stockCritico: 5,
    imagen: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=500&auto=format&fit=crop",
    descripcion: "Superficie de microfibra de baja fricción, bordes cosidos y base antideslizante."
  },
  {
    id: 15,
    nombre: "Brazo Hidráulico para Micrófono",
    categoria: "Accesorios",
    precio: 25990,
    stock: 8,
    stockCritico: 3,
    imagen: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop",
    descripcion: "Brazo articulado resistente con gestión interna de cables para streamers y podcast."
  }
];

const STORAGE_KEY = "levelup_productos";

// Imagen usada cuando el administrador crea un producto sin URL de imagen
export const IMAGEN_POR_DEFECTO = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop";

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
    imagen: nuevoProducto.imagen?.trim() || IMAGEN_POR_DEFECTO,
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

// Usado al renombrar una categoría desde el admin
export const reemplazarCategoriaEnProductos = (nombreAnterior, nombreNuevo) => {
  const productos = obtenerProductos();
  const listaActualizada = productos.map((p) =>
    p.categoria === nombreAnterior ? { ...p, categoria: nombreNuevo } : p
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listaActualizada));
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