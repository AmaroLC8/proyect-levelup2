# Guía de estudio – Level-Up Gamer Frontend

Este documento explica cada parte del frontend para poder defenderlo y modificarlo en vivo.
Se completa a medida que el frontend se conecta al backend (tareas F1, F2, ...).
La guía del backend está en `levelup-backend/docs/ESTUDIO.md`.

---

## 1. Conexión con el backend: cómo arrancar

1. Encender el backend (`./mvnw spring-boot:run` en `levelup-backend`). Queda en `http://localhost:8080`.
2. El frontend lee la URL de la API desde el archivo **`.env`**:
   ```
   VITE_API_URL=http://localhost:8080/api/v1
   ```
   - `.env.example` muestra el formato (cada integrante puede copiarlo a `.env`).
   - Vite solo entrega al código las variables que empiezan con `VITE_`, y se leen con `import.meta.env.VITE_API_URL`.
   - Si se cambia el `.env`, hay que **reiniciar** `npm run dev` (Vite lo lee al arrancar).
   - Si no existe `.env`, `api.js` usa `http://localhost:8080/api/v1` por defecto.
3. `npm run dev` → `http://localhost:5173`. El backend permite ese origen en `CorsConfig`.

Si el backend está apagado, las páginas no se caen: muestran la alerta
"No se pudo conectar con el servidor. Revisa que el backend esté encendido."

---

## 2. Flujo de una petición

```
Página (src/pages)            Service (src/services)            api.js                  Backend
─────────────────             ──────────────────────            ──────                  ───────
Productos.jsx                                                                          
  useEffect ──► listarProductos() ──► peticion('/productos') ──► fetch(GET ...) ──► ProductoController
                                                                                        → ProductoService
  setProductos(datos) ◄──────────────────── JSON (lista de productos) ◄─────────────── → MySQL
  o setError(mensaje) ◄── Error("mensaje del backend") si responde 4xx/5xx o no responde
```

Regla del proyecto: **las páginas nunca llaman a `fetch`**. Llaman a una función del service, y el service
usa `peticion` de `api.js`. Así, la URL, el token y el manejo de errores están en un solo lugar.

---

## 3. `src/services/api.js` – la función base

`peticion(ruta, opciones)` hace 4 cosas:

| Paso | Qué hace | Por qué |
|---|---|---|
| 1. URL | `API_URL + ruta`, ej: `http://localhost:8080/api/v1` + `/productos/5` | La URL base sale del `.env` |
| 2. Headers | `Content-Type: application/json` y, si existe `localStorage.getItem('token')`, `Authorization: Bearer <token>` | El backend usa JWT: así sabe quién hace la petición y con qué rol |
| 3. Respuesta | Lee el cuerpo como texto y lo convierte con `JSON.parse`. Si viene vacío (204 al eliminar) devuelve `null` | `respuesta.json()` falla con un cuerpo vacío |
| 4. Errores | Si `respuesta.ok` es `false` (status 400–599) lanza `new Error(mensaje)` | Las páginas usan `.catch` / `try-catch` y muestran `error.message` |

**Qué mensaje se usa en el error.** El backend siempre responde los errores con el mismo JSON (`ErrorResponse`):
```json
{ "status": 409, "error": "Conflict", "mensaje": "Ya existe una categoría con el nombre 'Consolas'", "fecha": "..." }
```
`api.js` usa el campo `mensaje`. En un 400 de validación (`@Valid`) el backend agrega `campos`,
y `api.js` los suma al mensaje:
`"Hay campos con datos inválidos: El precio debe ser mayor a 0"`.

Además, el error lleva **`error.status`** (404, 409...). `DetalleProducto` lo usa para distinguir
"el producto no existe" (404) de "el backend no responde".

**¿Qué pasa si el backend está apagado?** `fetch` no recibe respuesta y lanza un `TypeError`
("Failed to fetch"). `api.js` lo atrapa y lanza el `MENSAJE_SIN_CONEXION`, que es más claro para el usuario.

`body`: el service pasa un objeto JavaScript y `api.js` lo convierte con `JSON.stringify`.

---

## 4. Services de productos y categorías

### `src/services/productosService.js`

| Función | Petición | Acceso en el backend |
|---|---|---|
| `listarProductos({ categoriaId, buscar })` | `GET /productos?categoriaId=&buscar=` (solo agrega los filtros que vienen) | público |
| `obtenerProducto(id)` | `GET /productos/{id}` → 404 si no existe | público |
| `listarOfertas()` | `GET /productos/ofertas` | público |
| `listarCriticos()` | `GET /productos/criticos` | ADMIN, VENDEDOR |
| `crearProducto(datos)` | `POST /productos` → 201 | ADMIN |
| `actualizarProducto(id, datos)` | `PUT /productos/{id}` | ADMIN |
| `eliminarProducto(id)` | `DELETE /productos/{id}` → 204; 409 si ya se vendió | ADMIN |

Los filtros se arman con `URLSearchParams`, que además codifica los caracteres especiales
(espacios, tildes): `listarProductos({ categoriaId: 2, buscar: 'mouse' })` → `/productos?categoriaId=2&buscar=mouse`.

### `src/services/categoriasService.js`

| Función | Petición | Acceso |
|---|---|---|
| `listarCategorias()` | `GET /categorias` (todas, para el admin) | público |
| `listarCategoriasActivas()` | `GET /categorias/activas` (para la tienda) | público |
| `obtenerCategoria(id)` | `GET /categorias/{id}` | público |
| `crearCategoria(datos)` | `POST /categorias`; 409 si el nombre existe | ADMIN |
| `actualizarCategoria(id, datos)` | `PUT /categorias/{id}`; 409 si el nombre es de otra | ADMIN |
| `eliminarCategoria(id)` | `DELETE /categorias/{id}`; 409 si tiene productos | ADMIN |

Todas las funciones **devuelven una Promesa**: la página usa `.then(...)` o `await`.

---

## 5. Diferencias de formato entre el frontend antiguo y el backend

| Dato | Antes (`src/data/productos.js`) | Ahora (backend) |
|---|---|---|
| Categoría del producto (al leer) | texto: `categoria: "Consolas"` | objeto: `categoria: { id: 1, nombre: "Consolas", descripcion, activa }` |
| Categoría del producto (al guardar) | `categoria: "Consolas"` | `categoriaId: 1` (formato `ProductoRequest`) |
| Producto sin oferta | `precioOferta` ausente o `""` | `precioOferta: null` |
| Números del formulario | se convertían en `data/productos.js` | se convierten en `armarProductoRequest` antes de enviar |
| Imagen | se importaba desde `src/assets` | texto con URL: `"/img/ps5.jpg"` o `https://...` |

Cómo se adaptó cada lugar:
- **Mostrar** la categoría: `producto.categoria?.nombre` (ProductCard, DetalleProducto, AdminProductos).
  El `?.` evita un error si algún producto llegara sin categoría.
- **Filtrar** por categoría: se compara por id (`p.categoria.id === categoria.id`) en Categorías y
  AdminCategorias. En Productos el `<select>` sigue usando el nombre (`p.categoria.nombre`).
- **Ocultar categorías inactivas** en el catálogo: antes se cruzaba con la lista de categorías;
  ahora el producto ya trae `p.categoria.activa`.
- **Guardar** (AdminProductos): el `<select>` usa `value={cat.id}` y el formulario guarda `categoriaId`.
  `armarProductoRequest(form)` arma el JSON que espera el backend:
  ```js
  { nombre, descripcion, precio: Number(...), precioOferta: Number(...) o null,
    stock: Number(...), stockCritico: Number(...), imagen: (o IMAGEN_POR_DEFECTO), categoriaId: Number(...) }
  ```
- **Imágenes**: el backend guarda `"/img/ps5.jpg"`, `"/img/catan.jpg"` y `"/img/silla.jpg"`. Esos archivos
  se copiaron a `public/img/`. Vite publica la carpeta `public` tal cual en la raíz del sitio, así
  `http://localhost:5173/img/ps5.jpg` existe. (Lo que está en `src/assets` solo funciona con `import`.)

`esOferta`, `obtenerPrecioFinal` y `obtenerPorcentajeDescuento` se movieron a `src/utils/precios.js`
porque son cálculos, no datos. `data/productos.js` los reexporta para que el carrito siga funcionando
hasta que ese archivo se elimine (tarea F4).

---

## 6. Patrón de carga y error en las páginas

Todas las páginas conectadas usan el mismo esquema:

```jsx
const [productos, setProductos] = useState([]);
const [cargando, setCargando] = useState(true);   // empieza en true: aún no llega la respuesta
const [error, setError] = useState('');

useEffect(() => {
  listarProductos()
    .then((datos) => setProductos(datos))          // 200 → guardar los datos
    .catch((err) => setError(err.message))         // error → mensaje del backend o de conexión
    .finally(() => setCargando(false));            // en ambos casos termina la carga
}, []);                                            // [] = solo al abrir la página

return (
  <>
    <EstadoCarga cargando={cargando} error={error} />
    {!cargando && !error && ( ...grilla... )}
  </>
);
```

- `useEffect` existe porque una petición HTTP es un **efecto secundario**: no se puede hacer
  directamente mientras React dibuja el componente.
- `src/components/EstadoCarga.jsx` muestra un spinner ("Cargando...") o una alerta `alert-danger`
  con el error. Cuando todo salió bien no muestra nada.
- `Promise.all([listarProductos(), listarCategoriasActivas()])` pide las dos cosas **en paralelo** y
  espera a que lleguen ambas (Productos, Categorías, AdminProductos, AdminCategorias).

### Qué hace cada página

| Página | Llamadas | Notas |
|---|---|---|
| `Home` | `listarProductos()` | Muestra los 3 primeros (el backend los ordena por id: PS5, Silla, Catan) |
| `Productos` | `listarProductos()` + `listarCategoriasActivas()` | Los filtros (texto, categoría y precio máximo) se aplican en el navegador: responden al instante y el backend no tiene filtro de precio |
| `Categorias` | `listarCategoriasActivas()` + `listarProductos()` | Al hacer clic en una categoría se filtra por `p.categoria.id`, sin volver a llamar a la API |
| `Ofertas` | `listarOfertas()` | El backend ya filtra; la página ordena por % de descuento |
| `DetalleProducto` | `obtenerProducto(id)` y luego `listarProductos({ categoriaId })` | 404 → "Producto no encontrado". Los relacionados usan el **filtro del backend** |
| `AdminProductos` | `listarProductos()` + `listarCategorias()`; `crear/actualizar/eliminarProducto` | Los errores al guardar se ven en el modal; los errores al eliminar, sobre la tabla |
| `AdminCategorias` | `listarCategorias()` + `listarProductos()`; `crear/actualizar/eliminarCategoria` | Los productos se usan para contar cuántos tiene cada categoría |

**`DetalleProducto` y `key={id}`.** Al hacer clic en un producto relacionado cambia el `id` de la URL, pero React
reutiliza el mismo componente. `DetalleProducto` dibuja `<DetalleDeUnProducto key={id} id={id} />`: cuando cambia
la `key`, React crea el componente de nuevo, con su estado inicial (`cargando = true`), y no queda a la vista
el producto anterior mientras llega el nuevo.

**Guardar en el admin (async/await).**
```js
const handleGuardar = async (evento) => {
  evento.preventDefault();
  try {
    await crearProducto(armarProductoRequest(form));  // espera la respuesta del backend
    await recargarProductos();                        // vuelve a pedir la lista actualizada
    handleCerrarModal();
  } catch (err) {
    setError(err.message);                            // ej: 409, 400 o 401 → el modal sigue abierto
  }
};
```
Mientras se espera, el botón queda deshabilitado (`guardando`) para no enviar dos veces.
La validación "oferta menor al precio" se hace también **antes** de enviar, para no hacer una petición
que el backend igual rechazaría.

---

## 7. Pruebas (Vitest)

Las pruebas **no llaman al backend real** (no necesitan MySQL ni el backend encendido).

### Páginas: `vi.mock` de los services
```js
vi.mock('../services/productosService');
vi.mock('../services/categoriasService');
```
`vi.mock` reemplaza todas las funciones del service por funciones simuladas (`vi.fn()`).
Luego `simularBackend()` (en `src/test/backendSimulado.js`) les da una respuesta con `mockImplementation`,
usando una "base de datos" en memoria con los mismos 6 categorías y 15 productos del `DataInitializer` del backend:
- `listarProductos` filtra por `categoriaId` y `buscar`, como el backend.
- `obtenerProducto(999)` lanza un error con `status: 404`.
- `crearCategoria` con un nombre repetido lanza un error 409.
- `simularBackend()` devuelve `db` para que la prueba revise lo que se guardó
  (`expect(db.productos).toHaveLength(14)`) o agregue datos antes de abrir la página.
- `simularBackendCaido()` hace que todas las funciones fallen con el mensaje de conexión.

Como los datos llegan de forma asíncrona, las pruebas **esperan**:
- `await screen.findByText('...')`: busca hasta que aparezca (o falla después de un tiempo).
- `await waitFor(() => expect(...))`: repite la comprobación hasta que se cumpla.
- `esperarCarga()`: espera a que desaparezca el texto "Cargando...".

Para revisar **qué se envió** al backend:
```js
expect(crearProducto).toHaveBeenCalledWith(expect.objectContaining({ categoriaId: 2, precioOferta: null }));
```
Para simular un error solo una vez:
```js
vi.mocked(eliminarProducto).mockRejectedValueOnce(errorDelBackend(409, 'No se puede eliminar...'));
```

### `api.js`: `vi.stubGlobal('fetch', ...)`
`src/test/servicios.test.js` reemplaza la función global `fetch` por un mock y revisa:
la URL que se arma, el header `Authorization: Bearer`, el `body` del POST, que un 204 devuelva `null`, que un error
use el `mensaje` del backend (y los `campos` en un 400) y el mensaje cuando el backend está apagado.

### Nota para Windows
Si `npm test` falla en **todos** los archivos con `Cannot read properties of undefined (reading 'config')`,
la terminal quedó abierta en `c:\...` (con c minúscula) y Vitest carga dos copias de sí mismo. Se arregla
ejecutando desde la ruta con mayúscula: `cd C:\Users\...\proyect-levelup2` y luego `npm test`.

---

### Sesión simulada: `src/test/sesionSimulada.js`
Igual que `backendSimulado.js`, pero para `authService` (`vi.mock('../services/authService')`):
- `ADMIN`, `VENDEDOR` y `PEDRO`: los 3 usuarios del `DataInitializer` del backend (ids 1, 2 y 3, rol en mayúsculas).
- `simularAuth()`: `login` revisa correo y contraseña (401 si no coinciden), `registro` rechaza correos repetidos (409)
  y códigos de referido inexistentes (400), y `obtenerSesion` / `obtenerPerfil` responden según el token guardado.
- `simularSesion(PEDRO)`: deja guardados `token` y `usuario` en localStorage, como después de un login.
  Se usa **antes** de renderizar para abrir una página "con sesión iniciada".

---

## 8. Sesión con JWT (tarea F2)

### Archivos
| Archivo | Qué hace |
|---|---|
| `services/authService.js` | `login`, `registro`, `obtenerSesion` (`GET /auth/me`), `obtenerPerfil` y `actualizarPerfil` (`GET`/`PUT /auth/perfil`) |
| `context/AuthContext.jsx` | Guarda la sesión y entrega `usuario`, `esAdmin`, `esVendedor`, `esCliente`, `iniciarSesion`, `registrarse`, `cerrarSesion` y `actualizarUsuarioSesion` |
| `utils/roles.js` | `ROLES` (`'ADMIN'`, `'VENDEDOR'`, `'CLIENTE'`), `NOMBRE_ROL` y `rutaInicialPorRol` |
| `components/RutaProtegida.jsx` | Deja pasar solo a los `rolesPermitidos` |

`src/data/usuarios.js` ya **no** se usa para la sesión (solo lo usa AdminUsuarios mientras no se conecte a `/usuarios`).

### Flujo del login
```
Login.jsx ──► iniciarSesion(correo, password)          (AuthContext)
                └► login(correo, password)             (authService)
                     └► POST /api/v1/auth/login        (api.js → backend)
                ◄── { token: "eyJ...", tipo: "Bearer", usuario: { id, nombre, rol: "ADMIN", ... } }
              localStorage: token = "eyJ...", usuario = {...}
Login.jsx ──► navigate(rutaInicialPorRol(usuario.rol))  ADMIN → /admin · VENDEDOR → /admin/productos · CLIENTE → /
```
Desde ese momento `api.js` envía `Authorization: Bearer eyJ...` en **todas** las peticiones (ver sección 3), y el
backend sabe quién es y qué rol tiene. Por eso el CRUD de productos y categorías ya funciona con la sesión del ADMIN.

Errores: si el backend responde 401 ("Correo o contraseña incorrectos"), `iniciarSesion` lanza el Error y `Login.jsx`
lo muestra en una alerta. Mientras espera, el botón dice "Ingresando..." y queda deshabilitado.

### Registro
`registrarse(datos)` hace **dos** llamadas: `POST /auth/registro` (crea la cuenta, no entrega token) y luego
`iniciarSesion` con el mismo correo y contraseña. `Registro.jsx` primero valida en el navegador (`validarRegistro`)
y después muestra los errores del backend: correo repetido (409), menor de edad o código de referido inexistente (400).
`confirmarPassword` no se envía, y el código de referido vacío se envía como `null`.

### Al abrir o recargar la app
1. `useState(leerUsuarioGuardado)`: si hay `token` y `usuario` guardados, la sesión se muestra de inmediato.
2. `useEffect` → `GET /auth/me` para confirmar que el token sigue sirviendo:
   - 200 → se actualizan los datos guardados (ej: el admin le cambió el rol o los puntos).
   - **401** (token vencido, dura 8 horas, o inválido) → `cerrarSesion`.
   - Backend apagado → se mantiene la sesión; cada página muestra su propio error de conexión.

**¿Y si alguien edita el rol en localStorage?** Solo cambia los menús que ve en su navegador. Cada petición al backend
lleva el token, que está **firmado**: el backend saca el rol de su base de datos y responde 403. Además, al recargar,
`/auth/me` reemplaza el usuario guardado por el real.

### Cerrar sesión
`cerrarSesion()` borra `token` y `usuario` de localStorage. No hay endpoint de logout: el backend es *stateless*
(no guarda sesiones), así que basta con que el navegador olvide el token.

### Perfil (`Perfil.jsx` y `AdminPerfil.jsx`)
- Leen los datos con `GET /auth/perfil` (con carga y error, igual que las otras páginas).
- Guardan con `PUT /auth/perfil` enviando `{ nombre, apellidos, fechaNacimiento, password }` (formato `PerfilRequest`).
  La contraseña vacía significa "mantener la actual". **No** se envían correo, rol, puntos ni descuento: el backend
  no los acepta (nadie puede darse más permisos o puntos a sí mismo).
- Después de guardar llaman a `actualizarUsuarioSesion(respuesta)`, para que la Navbar muestre el nombre nuevo.
- En `AdminPerfil` el correo ahora es **solo lectura** (va dentro del token; lo cambia otro ADMIN en Usuarios).
- El historial de compras del cliente sigue saliendo de `data/ordenes.js` hasta la tarea F3.

---

## 9. Qué ve cada rol (pauta del profesor)

| Vista / acción | Visitante | CLIENTE | VENDEDOR | ADMIN |
|---|:-:|:-:|:-:|:-:|
| Tienda (home, catálogo, detalle, carrito, checkout…) | ✅ | ✅ | ✅ | ✅ |
| `/perfil` (perfil de cliente) | → `/login` | ✅ | → `/` | ✅ |
| Enlace "Panel" en la Navbar | ❌ | ❌ | ✅ → `/admin/productos` | ✅ → `/admin` |
| Su nombre en la Navbar enlaza a un perfil | – | `/perfil` | ❌ (solo texto) | `/admin/perfil` |
| `/admin/productos` (lista y detalle) | → `/login` | → `/` | ✅ | ✅ |
| Crear, editar y eliminar productos | – | – | ❌ (botones ocultos) | ✅ |
| `/admin/ordenes` y `/admin/ordenes/:id` | → `/login` | → `/` | ✅ | ✅ |
| Dashboard `/admin`, categorías, usuarios, reportes y perfil admin | → `/login` | → `/` | → `/` | ✅ |
| Opciones del menú lateral | – | – | Productos, Órdenes | Todas |
| Página después del login | – | `/` | `/admin/productos` | `/admin` |

Dónde está cada regla:
- **Rutas**: `App.jsx`, con `<RutaProtegida rolesPermitidos={[...]}>` alrededor de las rutas. Hay una
  `RutaProtegida` dentro de otra: la de afuera deja entrar al panel a ADMIN y VENDEDOR, y la de adentro
  deja solo al ADMIN en dashboard, categorías, usuarios, reportes y perfil.
- **Menú lateral**: `AdminSidebar.jsx`, con el campo `roles` de cada opción en `OPCIONES_ADMIN`.
- **Botones**: `AdminProductos.jsx`, con `{esAdmin && (...)}`.
- **Navbar**: `puedeVerPanel = esAdmin || esVendedor`.
- **Seguridad real**: `SecurityConfig` del backend. Aunque alguien muestre un botón oculto, el backend responde 403.

---

## 10. Pendiente (próximas tareas)

- **Carrito, checkout, dashboard, reportes, órdenes y usuarios** siguen usando `src/data` (el checkout todavía
  descuenta stock en `data/productos.js`). El historial de Pedro sale vacío en la app real porque las órdenes de
  ejemplo locales son del `usuarioId` 2 y en el backend Pedro es el id 3 (se arregla en F3).
- **AdminUsuarios** ya usa los roles en mayúsculas y tiene la opción VENDEDOR, pero sigue siendo CRUD local.
- **F4**: eliminar `src/data/productos.js` y `src/data/categorias.js` (y sus pruebas). Antes hay que cambiar
  el import de `obtenerPrecioFinal` en `CartContext.jsx` a `../utils/precios`, y las pruebas de
  `CartContext.test.jsx`, que todavía usan `obtenerProductoPorId` local, a `PRODUCTOS_PRUEBA`.

---

## 11. Ejemplos de modificaciones que podría pedir el profesor

### Cambiar qué ve un rol (ej: que el VENDEDOR también vea Categorías)
1. `App.jsx`: sacar `<Route path="categorias" ...>` de la `RutaProtegida` solo ADMIN y ponerla junto a `productos`.
2. `AdminSidebar.jsx`: en la opción Categorías, `roles: [ADMIN, VENDEDOR]`.
3. `AdminCategorias.jsx`: ocultar crear, editar y eliminar con `{esAdmin && (...)}`, igual que en AdminProductos.
4. Backend: `GET /categorias` ya es público. Si el vendedor también debiera **editar**, hay que cambiar `SecurityConfig`.
5. Pruebas: actualizar `el VENDEDOR solo ve Productos y Órdenes` en `roles.test.jsx`.

### Cambiar a dónde entra cada rol después del login (ej: el VENDEDOR a Órdenes)
Solo `rutaInicialPorRol` en `src/utils/roles.js` (lo usan Login y el enlace "Panel" de la Navbar).

### Mostrar el rol del usuario en la Navbar
En `Navbar.jsx`, dentro de `saludo`: `<span className="badge bg-secondary ms-2">{NOMBRE_ROL[usuario.rol]}</span>`
(importar `NOMBRE_ROL` desde `../utils/roles`).

### Permitir que el cliente cambie su fecha de nacimiento o su contraseña en el perfil
El backend ya lo acepta (`PerfilRequest`). En `Perfil.jsx`: agregar el campo al estado `form` y un `<input>`, y enviar
`fechaNacimiento: form.fechaNacimiento` (o `password: form.password`) en `actualizarPerfil`, en vez del valor fijo.

### Cerrar la sesión automáticamente cuando el token vence mientras se usa la app
Hoy se detecta al recargar (con `/auth/me`). Para detectarlo en cualquier petición: en `api.js`, si
`respuesta.status === 401` y había token, borrar `token` y `usuario` de localStorage y redirigir con
`window.location.href = '/login'`.

### Mostrar un campo nuevo del producto (ej: `marca`)
1. Backend: agregar `marca` a `Producto`, `ProductoRequest` y `ProductoService.copiarDatos` (ver la guía del backend).
2. Mostrarlo: en `ProductCard.jsx` o `DetalleProducto.jsx`, `<small>{producto.marca}</small>`.
   No hay que tocar el service: el JSON ya trae el campo nuevo.
3. Editarlo en el admin:
   - agregar `marca: ''` al estado `form` (y en `handleAbrirCrear`/`handleAbrirEditar`, `marca: prod.marca || ''`);
   - agregar un `<input>` en el modal;
   - agregar `marca: form.marca.trim()` en `armarProductoRequest`. **Si se olvida este paso, el campo nunca llega al backend.**
4. Prueba: agregar `marca` a un producto de `backendSimulado.js` y buscarlo con `screen.getByText`.

### Usar la búsqueda del backend en vez del filtro local
En `Productos.jsx`, un `useEffect` que dependa del texto:
```js
useEffect(() => {
  listarProductos({ buscar: busqueda })
    .then(setProductos)
    .catch((err) => setError(err.message));
}, [busqueda]);
```
Desventaja: hace una petición por cada letra escrita (se podría esperar a que el usuario deje de escribir).

### Mostrar el stock crítico con el endpoint del backend
En `AdminProductos`, cuando `soloCriticos` está activo, llamar a `listarCriticos()` en vez de filtrar localmente.
Ese endpoint exige token de ADMIN o VENDEDOR (sin token → 401).

### Agregar una llamada a un endpoint nuevo (ej: `GET /productos/agotados`)
1. Backend: crear el endpoint (guía del backend, sección 12).
2. `productosService.js`: `export const listarAgotados = () => peticion('/productos/agotados');`
3. En la página: `useEffect` + `listarAgotados().then(...).catch(...)` con `EstadoCarga`.
4. Prueba: en `backendSimulado.js`, `vi.mocked(productosService.listarAgotados).mockImplementation(async () => ...)`.

### Cambiar la URL del backend (ej: otro puerto o un servidor en la nube)
Solo el `.env`: `VITE_API_URL=http://localhost:9090/api/v1`, y reiniciar `npm run dev`. No se toca código.

### Cambiar el mensaje cuando el backend está apagado
`MENSAJE_SIN_CONEXION` en `src/services/api.js` (y la prueba de `servicios.test.js` que lo usa).

### Cambiar la imagen por defecto de los productos nuevos
`IMAGEN_POR_DEFECTO` en `src/pages/admin/AdminProductos.jsx`.

### Mostrar el spinner con otro texto o color
`src/components/EstadoCarga.jsx`: cambia en todas las páginas a la vez. Si se cambia el texto "Cargando...",
actualizar `esperarCarga()` en `paginasTienda.test.jsx` y `paginasAdmin.test.jsx`.
