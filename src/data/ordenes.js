// Órdenes de ejemplo para que el panel de administración tenga datos desde el inicio
const ORDENES_INICIALES = [
  {
    id: 1,
    numeroOrden: "20261001-001",
    fecha: "2026-10-01T15:30:00",
    estado: "pagada",
    usuarioId: 2,
    cliente: {
      nombre: "Pedro", apellidos: "Hacker", correo: "pedro@duocuc.cl",
      calle: "Los Crisantemos 123", depto: "Depto 603",
      region: "Región Metropolitana de Santiago", comuna: "Cerrillos", indicaciones: "",
    },
    items: [{ id: 3, nombre: "Catan El Juego", precio: 27990, cantidad: 1 }],
    subtotal: 27990,
    descuento: 5598,
    total: 22392,
  },
  {
    id: 2,
    numeroOrden: "20261012-002",
    fecha: "2026-10-12T11:05:00",
    estado: "pagada",
    usuarioId: null,
    cliente: {
      nombre: "Camila", apellidos: "Rojas", correo: "camila.rojas@gmail.com",
      calle: "Av. Libertad 456", depto: "",
      region: "Valparaíso", comuna: "Viña del Mar", indicaciones: "Dejar en conserjería",
    },
    items: [
      { id: 5, nombre: "Mouse Gamer 16000 DPI Sensor Óptico", precio: 29990, cantidad: 1 },
      { id: 4, nombre: "Teclado Mecánico RGB Switch Blue", precio: 34990, cantidad: 1 },
    ],
    subtotal: 64980,
    descuento: 0,
    total: 64980,
  },
];

const STORAGE_KEY = "levelup_ordenes";

const inicializarStorage = () => {
  const guardadas = localStorage.getItem(STORAGE_KEY);
  if (!guardadas) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ORDENES_INICIALES));
    return ORDENES_INICIALES;
  }
  return JSON.parse(guardadas);
};

const guardarOrdenes = (ordenes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ordenes));
};

// Número de orden con la fecha y un correlativo, ej: 20261021-003
const generarNumeroOrden = (fecha, correlativo) =>
  `${fecha.toISOString().slice(0, 10).replaceAll('-', '')}-${String(correlativo).padStart(3, '0')}`;

export const obtenerOrdenes = () => inicializarStorage();

export const obtenerOrdenPorId = (id) => {
  const ordenes = obtenerOrdenes();
  return ordenes.find((o) => o.id === Number(id));
};

export const obtenerOrdenesPorUsuario = (usuarioId) => {
  const ordenes = obtenerOrdenes();
  return ordenes.filter((o) => o.usuarioId === Number(usuarioId));
};

// Las rechazadas no cuentan como ventas en el dashboard ni en los reportes
export const obtenerOrdenesPagadas = () => obtenerOrdenes().filter((o) => o.estado === 'pagada');

// De la más reciente a la más antigua
export const ordenarPorFechaDesc = (ordenes) =>
  [...ordenes].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

export const obtenerUltimaOrden = () => {
  const ordenes = obtenerOrdenes();
  return ordenes[ordenes.length - 1] ?? null;
};

export const crearOrden = (nuevaOrden) => {
  const ordenes = obtenerOrdenes();
  const ahora = new Date();
  const ordenConId = {
    ...nuevaOrden,
    id: Date.now(),
    numeroOrden: generarNumeroOrden(ahora, ordenes.length + 1),
    fecha: ahora.toISOString(),
  };
  guardarOrdenes([...ordenes, ordenConId]);
  return ordenConId;
};

export const actualizarOrden = (id, datosActualizados) => {
  const ordenes = obtenerOrdenes();
  const listaActualizada = ordenes.map((o) =>
    o.id === Number(id) ? { ...o, ...datosActualizados, id: Number(id) } : o
  );
  guardarOrdenes(listaActualizada);
  return true;
};

export const eliminarOrden = (id) => {
  const ordenes = obtenerOrdenes();
  guardarOrdenes(ordenes.filter((o) => o.id !== Number(id)));
  return true;
};
