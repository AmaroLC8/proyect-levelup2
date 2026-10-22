const CATEGORIAS_INICIALES = [
  { id: '1', nombre: 'Consolas', descripcion: 'Consolas de última generación y retro.', activa: true },
  { id: '2', nombre: 'Juegos', descripcion: 'Títulos físicos y digitales para todas las plataformas.', activa: true },
  { id: '3', nombre: 'Accesorios', descripcion: 'Mandos, audífonos, teclados y controles.', activa: true },
  { id: '4', nombre: 'PC Gamer', descripcion: 'Componentes, monitores y torres gaming.', activa: true },
  { id: '5', nombre: 'Coleccionables', descripcion: 'Figuras, ropa y merchandising oficial.', activa: true }
];

export const obtenerCategorias = () => {
  const guardadas = localStorage.getItem('levelup_categorias');
  if (guardadas) {
    try {
      return JSON.parse(guardadas);
    } catch (error) {
      console.error('Error al parsear categorias:', error);
    }
  }
  localStorage.setItem('levelup_categorias', JSON.stringify(CATEGORIAS_INICIALES));
  return CATEGORIAS_INICIALES;
};

export const guardarCategorias = (lista) => {
  localStorage.setItem('levelup_categorias', JSON.stringify(lista));
};
