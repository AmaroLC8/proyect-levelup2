# Reglas del proyecto Level-Up Gamer – Frontend

## Contexto
- Proyecto académico DSY1104 Desarrollo Fullstack II (Duoc UC), caso Level-Up Gamer, Evaluación Parcial 3.
- Tienda online de productos gamer en Chile, con panel de administración. Usuarios: visitantes, clientes, vendedores y administradores.
- Tecnologías: React + Vite, React Router, Bootstrap 5 + Bootstrap Icons, Context API (AuthContext, CartContext), Vitest + React Testing Library. Datos ficticios.
- Backend: API REST Spring Boot en http://localhost:8080/api/v1 (proyecto aparte en C:\Users\maxim\Desktop\levelup-backend; su documentación está en docs/ESTUDIO.md y en Swagger: http://localhost:8080/swagger-ui/index.html). Autenticación con JWT: el token se envía en el header "Authorization: Bearer <token>".
- Roles (pauta del profesor):
  - ADMIN: acceso total.
  - VENDEDOR: solo puede ver la lista de productos y su detalle, y la lista de órdenes y su detalle. Todos los demás accesos NO deben aparecer en su vista.
  - CLIENTE: solo puede acceder a la tienda.
- Vistas evaluadas: compra exitosa, compra fallida (pago rechazado), carrito con detalle incluyendo impuestos (IVA 19% incluido en los precios) y checkout con datos del cliente y dirección de entrega.
- Estructura: src/components (componentes reutilizables), src/pages (tienda), src/pages/admin (panel), src/context (estado global), src/services (llamadas a la API), src/data (datos estáticos que no vienen del backend, ej: regiones y blogs), src/utils (formato, precios, validaciones), src/test (pruebas).
- Proyecto en equipo: respetar el estilo y la estructura que ya existen; no reescribir archivos completos si basta con un cambio puntual.

## Nivel del código
- Código simple y al nivel de un curso universitario: nada de librerías que no hayamos visto en clases (ej: Redux, React Query, TypeScript). Para las llamadas HTTP usar fetch (o axios si ya está instalado).
- Preferir código claro aunque sea un poco más largo, antes que código corto difícil de explicar.
- Separar responsabilidades: las páginas no llaman a fetch directamente; usan funciones de src/services. Las validaciones de formularios van en src/utils/validaciones.js.
- Toda llamada a la API muestra un estado de carga y, si falla, un mensaje claro (alerta de Bootstrap) sin que la página se caiga.
- La URL del backend va en una variable de entorno VITE_API_URL (archivo .env), con http://localhost:8080/api/v1 como valor por defecto.
- Diseño responsive con Bootstrap, manteniendo el estilo visual actual (tema oscuro, acentos azules).

## Cambios
- Hacer solo lo que pide la tarea: no cambiar código, diseño ni archivos que no estén relacionados.
- No borrar los comentarios existentes; actualizarlos si el código cambia.
- En tareas grandes, mostrar primero el plan de archivos antes de escribir código.
- Al terminar, ejecutar npm test y npm run build para confirmar que no se rompió nada. En las pruebas, simular la API con vi.mock en vez de llamar al backend real.

## Documentación (el estudiante debe defender y modificar este código en vivo)
- Comentarios en español explicando qué hace cada componente y función y por qué.
- Después de cada cambio, explicar qué archivos se tocaron y cómo se conectan entre sí (página → service → API del backend).
- Mantener docs/ESTUDIO.md con la explicación de cada parte y ejemplos de modificaciones que el profesor podría pedir en la defensa (ej: mostrar un campo nuevo, cambiar qué ve un rol, agregar una llamada a la API).

## Git
- No hacer commits ni push. Al terminar cada tarea, sugerir un mensaje de commit técnico (feat:, fix:, refactor:, docs:, test:).
- Hacer una tarea a la vez.
