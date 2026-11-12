# Level-Up Gamer - E-Commerce Frontend (Evaluación Parcial 3) 🎮

Este proyecto corresponde a la **Evaluación Parcial N° 3** de la asignatura **Desarrollo Fullstack II (DSY1104)** en Duoc UC. Es la tienda online de productos gamer **Level-Up Gamer**: una **Single Page Application (SPA)** en **React** que ahora se conecta a una **API REST en Spring Boot** con autenticación **JWT** y permisos por rol (administrador, vendedor y cliente). Productos, categorías, usuarios, compras (boletas) y reportes se guardan en el backend; el frontend solo conserva en el navegador el carrito y la sesión.

* **Backend (API REST):** [github.com/MaxiMella/levelup-backend](https://github.com/MaxiMella/levelup-backend)
* **Documentación de la API (con el backend encendido):** `http://localhost:8080/swagger-ui/index.html`
* **Guía de estudio del frontend:** [`docs/ESTUDIO.md`](docs/ESTUDIO.md)

---

## 👥 Integrantes del Equipo

* Lukas Meza
* Maximiliano Mella
* Amaro López

---

## 🚀 Tecnologías y Herramientas

* **Core:** React 19
* **Tooling / Bundler:** Vite
* **Navegación:** React Router DOM v7
* **Diseño y Maquetación:** Bootstrap 5, Bootstrap Icons, CSS personalizado (paleta oscura con acentos azul eléctrico)
* **Estado global:** Context API (`AuthContext` para la sesión JWT, `CartContext` para el carrito)
* **Comunicación con el backend:** `fetch` centralizado en `src/services/api.js` (URL en `.env`, token `Authorization: Bearer`)
* **Testing:** Vitest, React Testing Library, JSDOM (la API se simula con `vi.mock`)
* **Cobertura de Código:** `@vitest/coverage-v8`
* **Backend:** Spring Boot 4, Spring Security + JWT, JPA/Hibernate, MySQL, Swagger (repositorio aparte)

---

## ✅ Requisitos

* **Node.js 20 o superior** (incluye `npm`).
* **El backend corriendo** en `http://localhost:8080` (Java 21 y MySQL; ver las instrucciones en su repositorio).
  Al iniciar por primera vez, el backend crea las tablas y carga 6 categorías, 15 productos y 3 usuarios de prueba.

Sin el backend, la tienda se abre igual, pero cada página muestra el aviso
*"No se pudo conectar con el servidor. Revisa que el backend esté encendido."*

---

## 💻 Instalación y Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/AmaroLC8/proyect-levelup2.git
cd proyect-levelup2

# 2. Instalar las dependencias
npm install

# 3. Crear el archivo .env a partir del ejemplo (URL de la API)
cp .env.example .env          # en Windows (cmd): copy .env.example .env

# 4. Con el backend ya encendido, ejecutar el servidor de desarrollo
npm run dev
```

La aplicación queda disponible en `http://localhost:5173/`.

Contenido de `.env` (si no existe, se usa este mismo valor por defecto):

```env
VITE_API_URL=http://localhost:8080/api/v1
```

Si se cambia el `.env`, hay que reiniciar `npm run dev`.

---

## 🔑 Usuarios de Prueba

Los crea el backend al iniciar (datos ficticios del enunciado):

| Rol | Correo | Contraseña | Después del login entra a |
|---|---|---|---|
| Administrador | `admin@levelup.cl` | `admin1234` | `/admin` (dashboard) |
| Vendedor | `vendedor@levelup.cl` | `vendedor1234` | `/admin/productos` |
| Cliente (Duoc) | `pedro@duocuc.cl` | `pedro1234` | `/` (tienda) · 20% de descuento · código de referido `LVLPEDRO` |

También se puede crear una cuenta de cliente desde `/registro`.

---

## 🛡️ Qué ve cada rol

| Vista / acción | Visitante | Cliente | Vendedor | Administrador |
|---|:-:|:-:|:-:|:-:|
| Tienda: home, catálogo, categorías, ofertas, detalle, carrito y checkout | ✅ | ✅ | ✅ | ✅ |
| Perfil de cliente (`/perfil`) con historial de compras | ❌ | ✅ | ❌ | ✅ |
| Enlace "Panel" en la barra de navegación | ❌ | ❌ | ✅ | ✅ |
| Productos del panel: lista y detalle | ❌ | ❌ | ✅ | ✅ |
| Productos del panel: crear, editar y eliminar | ❌ | ❌ | ❌ | ✅ |
| Órdenes y detalle de boletas | ❌ | ❌ | ✅ | ✅ |
| Dashboard, categorías, usuarios, reportes y perfil de administrador | ❌ | ❌ | ❌ | ✅ |

El frontend oculta lo que cada rol no puede usar (rutas protegidas, menú lateral y botones), y además el backend rechaza cualquier petición sin permiso (401 sin sesión, 403 con otro rol).

---

## 🗺️ Vistas de la Aplicación

### Tienda

| Ruta | Vista |
|---|---|
| `/` | Home con video y productos destacados |
| `/productos` | Catálogo con búsqueda, filtro por categoría y precio máximo |
| `/producto/:id` | Detalle de producto y productos relacionados |
| `/categorias` | Productos separados por categoría |
| `/ofertas` | Productos con precio rebajado |
| `/carrito` | Carrito con subtotal, descuento Duoc, neto, IVA (19%) y total |
| `/checkout` | Datos del cliente y dirección de entrega |
| `/pago-exitoso` · `/pago-error` | Resultado del pago con la boleta que devuelve el backend |
| `/login` · `/registro` | Inicio de sesión (JWT) y registro (+18 años, descuento Duoc, referidos) |
| `/perfil` | Perfil del cliente: datos, puntos LevelUp e historial de compras |
| `/nosotros` · `/blog` · `/blog/:id` · `/contacto` | Páginas informativas y formulario de contacto |

### Panel (administrador y vendedor)

| Ruta | Vista | Roles |
|---|---|---|
| `/admin` | Dashboard con métricas, últimas órdenes y stock crítico | Administrador |
| `/admin/ordenes` · `/admin/ordenes/:id` | Listado de órdenes y detalle de boleta | Administrador y vendedor |
| `/admin/productos` | Productos y stock crítico (el vendedor solo consulta) | Administrador y vendedor |
| `/admin/categorias` | CRUD de categorías | Administrador |
| `/admin/usuarios` | CRUD de usuarios con roles e historial de compras | Administrador |
| `/admin/reportes` | Ingresos, ticket promedio, ventas por categoría y ranking de productos | Administrador |
| `/admin/perfil` | Datos y contraseña del administrador | Administrador |

---

## 📂 Arquitectura del Proyecto

Las páginas nunca llaman a `fetch` directamente: usan las funciones de `src/services`, que pasan por `api.js`.

```
Página (src/pages) → Service (src/services) → api.js (fetch + token) → API REST Spring Boot (/api/v1)
```

```text
proyect-levelup2/
├── public/
│   └── img/                    # Imágenes de productos que referencia el backend (/img/ps5.jpg, ...)
├── src/
│   ├── assets/                 # Video del home (ps5.mp4) e imágenes
│   ├── components/             # Navbar, ProductCard, RutaProtegida, AdminSidebar, EstadoCarga, ResumenOrden...
│   ├── context/
│   │   ├── AuthContext.jsx     # Sesión: login, registro y cierre de sesión con JWT
│   │   └── CartContext.jsx     # Carrito, subtotal y descuento Duoc
│   ├── data/                   # Solo datos que no vienen del backend
│   │   ├── blogs.js
│   │   └── regiones.js
│   ├── pages/                  # Vistas de la tienda
│   │   └── admin/              # Vistas del panel
│   ├── services/               # Llamadas a la API
│   │   ├── api.js              # Función base: URL, token, JSON y errores
│   │   ├── authService.js      # /auth (login, registro, sesión y perfil)
│   │   ├── productosService.js # /productos
│   │   ├── categoriasService.js# /categorias
│   │   ├── boletasService.js   # /boletas (checkout, órdenes e historial)
│   │   ├── usuariosService.js  # /usuarios (mantenedor del administrador)
│   │   └── reportesService.js  # /reportes (dashboard y ventas)
│   ├── test/                   # Pruebas y backend simulado para Vitest
│   ├── utils/                  # formato.js, precios.js (IVA), validaciones.js, roles.js, ultimaBoleta.js
│   ├── App.jsx                 # Rutas de la aplicación y permisos por rol
│   └── main.jsx                # Punto de entrada
├── docs/ESTUDIO.md             # Explicación de cada parte del frontend
├── .env.example                # Formato de la variable VITE_API_URL
├── package.json
└── vite.config.js              # Configuración de Vite y Vitest
```

---

## 🧪 Pruebas Unitarias y Cobertura

```bash
# Ejecutar las pruebas
npm test

# Generar el reporte de cobertura (se crea en coverage/index.html)
npm run test:coverage

# Revisar el código con ESLint
npm run lint
```

* Las pruebas **no necesitan el backend encendido**: los services se reemplazan con `vi.mock` por un "backend simulado" en memoria (`src/test/backendSimulado.js`, `sesionSimulada.js`, `boletasSimuladas.js` y `panelSimulado.js`) con los mismos datos que carga el backend.
* Cubren: catálogo y filtros, detalle, login y registro con errores del backend, redirección por rol, rutas protegidas, carrito con IVA, checkout (compra pagada, rechazada y sin stock), panel (productos, categorías, órdenes, usuarios, dashboard y reportes) y la función base `api.js`.
* **En Windows:** si todas las pruebas fallan con `Cannot read properties of undefined (reading 'config')`, abre la terminal en la ruta con la letra de disco en mayúscula (`C:\...`) y vuelve a ejecutar `npm test`.

---

## 📝 Notas

* **Pagos simulados:** no hay pasarela real. Si el correo del checkout contiene la palabra `error` (por ejemplo `error@test.com`), el backend rechaza el pago y se muestra la vista de error. La boleta rechazada también queda registrada.
* **Precios con IVA incluido:** el carrito muestra una estimación del neto y el IVA (19%); el monto final lo calcula el backend al crear la boleta.
* **Datos en el navegador:** solo el carrito (`levelup_cart`), la sesión (`token` y `usuario`) y la última boleta (`levelup_ultima_boleta`). Para empezar de cero: `localStorage.clear()` en la consola del navegador (F12) y recargar.
