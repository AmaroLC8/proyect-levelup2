// Regiones de Chile con algunas de sus comunas para el formulario de despacho
const REGIONES = {
  "Región Metropolitana de Santiago": [
    "Cerrillos", "Las Condes", "La Florida", "Maipú", "Ñuñoa", "Providencia", "Puente Alto", "San Bernardo", "Santiago Centro",
  ],
  "Valparaíso": ["Quilpué", "San Antonio", "Valparaíso", "Villa Alemana", "Viña del Mar"],
  "Libertador General Bernardo O'Higgins": ["Machalí", "Rancagua", "Rengo", "San Fernando"],
  "Maule": ["Curicó", "Linares", "Talca"],
  "Biobío": ["Chillán", "Concepción", "Los Ángeles", "Talcahuano"],
  "La Araucanía": ["Angol", "Temuco", "Villarrica"],
  "Los Lagos": ["Osorno", "Puerto Montt", "Puerto Varas"],
  "Antofagasta": ["Antofagasta", "Calama"],
  "Coquimbo": ["Coquimbo", "La Serena", "Ovalle"],
};

export const obtenerRegiones = () => Object.keys(REGIONES);

export const obtenerComunas = (region) => REGIONES[region] ?? [];
