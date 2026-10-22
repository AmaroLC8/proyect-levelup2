# Level-Up Gamer - E-Commerce Frontend (Evaluación Parcial 2) 🎮

Este proyecto corresponde a la **Evaluación Parcial N° 2** de la asignatura **Desarrollo Fullstack II (DSY1104)** en Duoc UC. Consiste en la evolución y migración del sitio web hacia una **Single Page Application (SPA)** construida con **React**, implementando componentización modular, persistencia de datos local mediante operaciones CRUD, un completo panel de administración con rutas protegidas, diseño responsivo con **Bootstrap** y una suite de **pruebas unitarias** ejecutadas con reporte de cobertura.

---

## 👥 Integrantes del Equipo

* **Lukas Meza**
* **Maximiliano Mella**
* **Amaro López**

---

## 🚀 Tecnologías y Herramientas

* **Core:** React 18 / 19
* **Tooling / Bundler:** Vite
* **Navegación:** React Router DOM v6 / v7
* **Diseño y Maquetación:** Bootstrap 5, Bootstrap Icons, CSS3 personalizado (Dark Neón)
* **Gestión de Estado:** Context API (`AuthContext`, `CartContext`)
* **Suite de Testing:** Vitest, React Testing Library, JSDOM
* **Cobertura de Código:** `@vitest/coverage-v8`

---

## 📂 Arquitectura del Proyecto

El código fuente sigue el principio de responsabilidad única (*Single Responsibility*), separando vistas, componentes reutilizables, utilitarios, lógica de datos y pruebas:

```text
proyect-levelup2/
├── public/                     # Íconos y favicon
├── src/
│   ├── assets/                 # Imágenes de productos y video hero (ps5.mp4)
│   ├── components/
│   │   ├── AdminLayout.jsx     # Layout del panel de administración con sidebar
│   │   ├── AdminSidebar.jsx    # Menú lateral navegable del administrador
│   │   ├── Button.jsx          # Componente de botón reutilizable
│   │   ├── Navbar.jsx          # Barra de navegación SPA reactiva al carrito
│   │   ├── ProductCard.jsx     # Tarjeta de producto modular (Props & Events)
│   │   ├── ResumenOrden.jsx    # Componente reutilizable para boletas y compras
│   │   └── RutaProtegida.jsx   # Control de acceso según rol de usuario
│   ├── context/
│   │   ├── AuthContext.jsx     # Autenticación y gestión de sesión activa
│   │   └── CartContext.jsx     # Estado global del carrito y descuentos Duoc
│   ├── data/
│   │   ├── blogs.js            # Publicaciones y guías para el blog
│   │   ├── categorias.js       # Gestión de categorías de productos
│   │   ├── ordenes.js          # Persistencia e historial de órdenes de compra
│   │   ├── productos.js        # Base de datos simulada de productos y stock
│   │   ├── regiones.js         # Listado de regiones y comunas de Chile
│   │   └── usuarios.js         # Usuarios, roles, puntos LevelUp y referidos
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminCategorias.jsx # CRUD de categorías con validación de borrado
│   │   │   ├── AdminDashboard.jsx  # Métricas KPI y monitoreo de stock crítico
│   │   │   ├── AdminOrdenes.jsx    # Gestión de órdenes y visualización de boleta
│   │   │   ├── AdminPerfil.jsx     # Perfil y edición de datos del administrador
│   │   │   ├── AdminProductos.jsx  # Gestión CRUD de inventario de productos
│   │   │   ├── AdminReportes.jsx   # Informes de ventas y productos más vendidos
│   │   │   ├── AdminUsuarios.jsx   # Gestión de cuentas e historial de clientes
│   │   │   └── VerBoletaAdmin.jsx  # Vista detallada e imprimible de orden
│   │   ├── Blog.jsx            # Artículos y guías gamer
│   │   ├── Carrito.jsx         # Tabla interactiva de compra
│   │   ├── Categorias.jsx      # Exploración filtrada por tarjetas de categoría
│   │   ├── Checkout.jsx        # Captura de datos de despacho y pago
│   │   ├── Contacto.jsx        # Formulario de contacto y soporte WhatsApp
│   │   ├── DetalleBlog.jsx     # Lectura completa de artículo del blog
│   │   ├── DetalleProducto.jsx # Vista detallada de producto y relacionados
│   │   ├── Home.jsx            # Portada principal con video hero y destacados
│   │   ├── Login.jsx           # Inicio de sesión de usuarios
│   │   ├── Nosotros.jsx        # Misión, visión, valores y equipo
│   │   ├── Ofertas.jsx         # Catálogo de productos con descuento
│   │   ├── PagoError.jsx       # Vista de transacción fallida
│   │   ├── PagoExitoso.jsx     # Comprobante de orden emitida
│   │   ├── Perfil.jsx          # Perfil de cliente, puntos e historial
│   │   ├── Productos.jsx       # Catálogo con buscador en tiempo real y filtros
│   │   └── Registro.jsx        # Registro de usuarios y detección de correo Duoc
│   ├── test/
│   │   ├── setup.js            # Configuración de aserciones jest-dom
│   │   └── tienda.test.jsx     # Pruebas unitarias automatizadas
│   ├── utils/
│   │   ├── formatters.js       # Formateo de moneda CLP y fechas
│   │   └── validaciones.js     # Validaciones de formularios y correos Duoc
│   ├── App.jsx                 # Enrutador principal (BrowserRouter y Routes)
│   ├── index.css               # Estilos globales y paleta Dark Neón
│   └── main.jsx                # Punto de entrada y montaje en el DOM
├── INFORME_COBERTURA.md        # Reporte detallado de pruebas unitarias
├── ERS_UPDATE.md               # Matriz de especificación de requisitos
├── package.json
└── vite.config.js

💻 Instrucciones de Instalación y Ejecución Local
Para levantar el proyecto en el entorno local o taller, se requiere Node.js (versión 20 o superior):
1. Clonar el repositorio
git clone https://github.com/AmaroLC8/proyect-levelup2.git
cd proyect-levelup2

2. Instalar las dependencias
npm install

3. Ejecutar el servidor de desarrollo
npm run dev
La aplicación se desplegará en http://localhost:5173/.

🧪 Ejecución de Pruebas Unitarias y Cobertura

# Ejecutar la suite de pruebas unitarias
npm run test

# Generar informe de cobertura de código (Coverage)
npm run coverage
🔑 Credenciales de Prueba
Rol            |    Correo          |      Contraseña    |    Beneficio / Acceso
Administrador     admin@levelup.cl          admin1234        Acceso completo al panel /admin
Cliente Duoc      pedro@duocuc.cl           pedro1234        20% Descuento Duoc UC automático
Cliente General   maria.gonzalez@gmail.com  user1234          Cuenta cliente estándar

---

