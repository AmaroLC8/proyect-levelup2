# Level-Up Gamer - E-Commerce Frontend (Evaluación Parcial 2) 🎮

Este proyecto corresponde a la **Evaluación Parcial N° 2** de la asignatura **Desarrollo Fullstack II (DSY1104)** en Duoc UC. Consiste en la evolución y migración del sitio web de la Evaluación 1 hacia una **Single Page Application (SPA)** construida con **React**, implementando componentización modular, persistencia de datos local mediante operaciones CRUD, diseño responsivo con **Bootstrap** y un banco de **10 pruebas unitarias** ejecutadas bajo entorno virtual con reporte de cobertura.

---

## 👥 Integrantes del Equipo
* Lukas Meza
* Maximiliano Mella
* Amaro López

---

## 🚀 Tecnologías y Herramientas

* **Core:** React 18 / 19
* **Tooling / Bundler:** Vite
* **Navegación:** React Router DOM v6
* **Diseño y Maquetación:** Bootstrap 5, Bootstrap Icons, CSS3 personalizado
* **Suite de Testing:** Vitest, Jasmine Syntax, React Testing Library, JSDOM
* **Cobertura de Código:** @vitest/coverage-v8

---

## 📂 Arquitectura del Proyecto

El código fuente sigue el principio de responsabilidad única (*Single Responsibility*), separando vistas, componentes reutilizables, lógica de negocio y pruebas:

```text
levelup-gamer/
├── public/
│   └── ps5.mp4                 # Video hero en autoplay loop
├── src/
│   ├── assets/                 # Recursos multimedia estáticos locales
│   ├── components/
│   │   ├── Navbar.jsx          # Barra de navegación SPA reactiva al carrito
│   │   └── ProductCard.jsx     # Tarjeta de producto modular (Props & Events)
│   ├── context/
│   │   └── CartContext.jsx     # Estado global del carrito sincronizado con localStorage
│   ├── data/
│   │   └── productos.js        # Base de datos simulada y funciones CRUD
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx  # Métricas y monitoreo de stock crítico
│   │   │   └── AdminProductos.jsx  # Gestión CRUD de inventario de productos
│   │   ├── Carrito.jsx         # Tabla interactiva de compra
│   │   ├── Categorias.jsx      # Exploración filtrada por tarjetas de categoría
│   │   ├── Checkout.jsx        # Captura de datos de despacho con validaciones
│   │   ├── Home.jsx            # Portada principal con video hero y destacados
│   │   ├── PagoError.jsx       # Vista de transacción fallida y reintento
│   │   ├── PagoExitoso.jsx     # Comprobante de orden emitida (#20240705)
│   │   └── Productos.jsx       # Catálogo con buscador en tiempo real y filtros
│   ├── test/
│   │   ├── setup.js            # Configuración de aserciones jest-dom
│   │   └── tienda.test.jsx     # 10 pruebas unitarias automatizadas
│   ├── App.jsx                 # Configuración del BrowserRouter y Layout
│   ├── index.css               # Estilos globales y paleta Dark Tech
│   └── main.jsx                # Montaje de la aplicación en el DOM
├── package.json
└── vite.config.js
```

---

## 💻 Instrucciones de Instalación y Ejecución Local

Para levantar el proyecto en el taller o entorno local, se requiere **Node.js** (versión 18 o superior):

### 1. Clonar el repositorio
```bash
git clone [https://github.com/AmaroLC8/TU-NUEVO-REPO.git](https://github.com/AmaroLC8/TU-NUEVO-REPO.git)
cd levelup-gamer
```

### 2. Instalar las dependencias
```bash
npm install
```

### 3. Ejecutar el servidor de desarrollo
```bash
npm run dev
```
La aplicación se desplegará localmente en `http://localhost:5173/`.

---

## 🧪 Ejecución de Pruebas Unitarias y Cobertura

La suite de pruebas valida la lógica del frontend sin depender de navegadores externos:

### Ejecutar las 10 pruebas unitarias:
```bash
npm test
```

### Generar informe detallado de cobertura:
```bash
npm run test:coverage
```
El reporte HTML interactivo se compilará en la carpeta `coverage/index.html`.

---

## 📋 Resumen de Casos de Prueba (10/10)

1. **Renderizado de Props:** Muestra título y descripción del producto.
2. **Propiedades de Categoría:** Renderiza categoría en badge estilizado.
3. **Formateo de Moneda:** Transforma valores a divisa chilena ($CLP).
4. **Mocks y Eventos:** Dispara la función `agregarAlCarrito` al pulsar "Añadir".
5. **Render Condicional (Vacío):** Despliega mensaje cuando el carrito no tiene artículos.
6. **Render Condicional (Con Datos):** Muestra la tabla de compra cuando existen ítems.
7. **Modificación de Cantidad:** Ejecuta eventos de incremento (+1) sobre productos.
8. **Manejo de Estado (State):** Actualiza el valor de los inputs en el formulario de Checkout.
9. **Validación de Formularios:** Muestra aviso de error si se intenta pagar con campos vacíos.
10. **Lógica de Administración:** Verifica la carga de métricas y stock crítico en el Dashboard.