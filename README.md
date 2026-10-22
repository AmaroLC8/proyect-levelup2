# Level-Up Gamer - E-Commerce Frontend (Evaluación Parcial 2) 🎮

Este proyecto corresponde a la **Evaluación Parcial N° 2** de la asignatura **Desarrollo Fullstack II (DSY1104)** en Duoc UC. Consiste en la migración del sitio web de la Evaluación 1 a una **Single Page Application (SPA)** construida con **React**, con componentes reutilizables, datos simulados con operaciones CRUD persistidas en `localStorage`, un panel de administración con rutas protegidas, diseño responsivo con **Bootstrap** y pruebas unitarias con reporte de cobertura.

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
* **Estado global:** Context API (`AuthContext`, `CartContext`)
* **Testing:** Vitest (sintaxis `describe` / `it` / `expect` compatible con Jasmine), React Testing Library, JSDOM
* **Cobertura de Código:** `@vitest/coverage-v8`

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
| `/carrito` | Carrito con subtotal, descuento Duoc y total |
| `/checkout` | Datos del cliente y dirección de entrega |
| `/pago-exitoso` · `/pago-error` | Resultado del pago con resumen de la orden |
| `/login` · `/registro` | Inicio de sesión y registro (+18 años, descuento Duoc, referidos) |
| `/perfil` | Perfil del cliente: datos, puntos LevelUp e historial de compras |
| `/nosotros` · `/blog` · `/blog/:id` · `/contacto` | Páginas informativas y formulario de contacto |

### Administrador (solo con sesión de administrador)

| Ruta | Vista |
|---|---|
| `/admin` | Dashboard con métricas y accesos a cada sección |
| `/admin/ordenes` · `/admin/ordenes/:id` | Listado de órdenes y detalle de boleta |
| `/admin/productos` | CRUD de productos y listado de stock crítico |
| `/admin/categorias` | CRUD de categorías |
| `/admin/usuarios` | CRUD de usuarios e historial de compras |
| `/admin/reportes` | Ventas, ticket promedio y productos más vendidos |
| `/admin/perfil` | Datos y contraseña del administrador |

---

## 📂 Arquitectura del Proyecto

El código sigue el principio de responsabilidad única (*Single Responsibility*), separando componentes, vistas, estado global, datos y utilidades:

```text
proyect-levelup2/
├── public/                     # Íconos y favicon
├── src/
│   ├── assets/                 # Imágenes de productos y video hero (ps5.mp4)
│   ├── components/
│   │   ├── AdminLayout.jsx     # Layout del panel con menú lateral
│   │   ├── AdminSidebar.jsx    # Menú lateral del administrador
│   │   ├── Button.jsx          # Botón reutilizable (+ Button.test.jsx)
│   │   ├── EstadoOrden.jsx     # Etiqueta de estado de una orden (pagada / rechazada)
│   │   ├── Navbar.jsx          # Barra de navegación con buscador, sesión y carrito
│   │   ├── ProductCard.jsx     # Tarjeta de producto
│   │   ├── ResumenOrden.jsx    # Detalle de una orden (pago y boleta del admin)
│   │   └── RutaProtegida.jsx   # Acceso a /admin solo para administradores
│   ├── context/
│   │   ├── AuthContext.jsx     # Sesión: login, registro y cierre de sesión
│   │   └── CartContext.jsx     # Carrito, subtotal y descuento Duoc
│   ├── data/                   # Base de datos simulada con funciones CRUD sobre localStorage
│   │   ├── blogs.js
│   │   ├── categorias.js       # (+ categorias.test.js)
│   │   ├── ordenes.js
│   │   ├── productos.js
│   │   ├── regiones.js
│   │   └── usuarios.js
│   ├── pages/                  # Vistas de la tienda
│   │   └── admin/              # Vistas del panel de administración
│   ├── test/
│   │   ├── setup.js            # Configuración de jest-dom
│   │   └── tienda.test.jsx     # Pruebas de componentes de la tienda y el admin
│   ├── utils/
│   │   ├── formato.js          # Formato de moneda CLP y fechas (+ formato.test.js)
│   │   └── validaciones.js     # Reglas de correo, contraseña, edad y registro
│   ├── App.jsx                 # Rutas de la aplicación
│   ├── index.css               # Estilos globales
│   └── main.jsx                # Punto de entrada
├── package.json
└── vite.config.js              # Configuración de Vite y Vitest
```

---

## 💻 Instalación y Ejecución Local

Se requiere **Node.js 20 o superior**.

```bash
# 1. Clonar el repositorio
git clone https://github.com/AmaroLC8/proyect-levelup2.git
cd proyect-levelup2

# 2. Instalar las dependencias
npm install

# 3. Ejecutar el servidor de desarrollo
npm run dev
```

La aplicación queda disponible en `http://localhost:5173/`.

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

Las pruebas verifican el renderizado (normal y condicional), las props, el estado de los formularios y la simulación de eventos, según la propuesta de pruebas de la pauta.

---

## 🔑 Cuentas de Prueba

| Rol | Correo | Contraseña | Acceso |
|---|---|---|---|
| Administrador | `admin@levelup.cl` | `admin1234` | Panel `/admin` completo |
| Cliente Duoc | `pedro@duocuc.cl` | `pedro1234` | 20% de descuento automático · código de referido `LVLPEDRO` |

---

## 📝 Notas

* **Pagos simulados:** no hay pasarela real. Si el correo del checkout contiene la palabra `error` (por ejemplo `error@test.com`), el pago se rechaza para mostrar la vista de error.
* **Datos en el navegador:** productos, categorías, usuarios, órdenes, carrito y sesión se guardan en `localStorage`. Para volver a los datos iniciales, ejecuta `localStorage.clear()` en la consola del navegador (F12) y recarga la página.
