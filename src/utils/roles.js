// Roles de usuario. Se escriben en mayúsculas porque así los envía el backend (enum Rol de Spring Boot).
// Pauta: ADMIN = acceso total; VENDEDOR = solo productos y órdenes (lista y detalle); CLIENTE = solo la tienda.
export const ROLES = {
  ADMIN: 'ADMIN',
  VENDEDOR: 'VENDEDOR',
  CLIENTE: 'CLIENTE',
};

// Texto para mostrar cada rol en pantalla
export const NOMBRE_ROL = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  CLIENTE: 'Cliente',
};

// Página a la que se envía a cada rol después de iniciar sesión.
// El VENDEDOR no tiene dashboard: entra directo a la lista de productos.
export const rutaInicialPorRol = (rol) => {
  if (rol === ROLES.ADMIN) return '/admin';
  if (rol === ROLES.VENDEDOR) return '/admin/productos';
  return '/';
};
