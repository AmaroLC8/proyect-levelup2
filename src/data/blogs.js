import ps5Img from '../assets/ps5.jpg';
import sillaImg from '../assets/silla.jpg';

// Publicaciones del blog (solo lectura, no tienen CRUD en esta versión)
const BLOGS = [
  {
    id: 1,
    titulo: "Cómo elegir tu silla gamer sin morir en el intento",
    categoria: "Guías",
    fecha: "2026-10-02",
    autor: "Equipo Level-Up",
    imagen: sillaImg,
    resumen: "Ergonomía, materiales y ajustes: lo que de verdad importa antes de comprar una silla para largas sesiones de juego.",
    contenido: [
      "Pasar horas frente a la pantalla pasa la cuenta si la silla no acompaña. Antes de fijarte en los colores o las luces, revisa tres cosas: el soporte lumbar, la altura regulable y los apoyabrazos.",
      "El soporte lumbar debe calzar con la curva natural de tu espalda baja. Las sillas con cojín ajustable permiten moverlo según tu altura, algo clave si la silla la usará más de una persona.",
      "Los apoyabrazos 4D (altura, profundidad, ancho y giro) permiten dejar los hombros relajados mientras usas teclado y mouse. Si juegas con control, busca que se puedan bajar lo suficiente.",
      "Por último, el material: el cuero sintético es fácil de limpiar pero calienta más; la tela respira mejor en verano. En Chile, con veranos calurosos, la tela suele ser la opción más cómoda.",
    ],
  },
  {
    id: 2,
    titulo: "PS5 Slim: ¿vale la pena el cambio?",
    categoria: "Consolas",
    fecha: "2026-10-15",
    autor: "Equipo Level-Up",
    imagen: ps5Img,
    resumen: "Comparamos la PS5 Slim con el modelo original: tamaño, almacenamiento, consumo y si conviene renovar tu consola.",
    contenido: [
      "La PS5 Slim mantiene el mismo rendimiento que el modelo original: mismo procesador, misma GPU y la misma compatibilidad con todos los juegos de PlayStation 5.",
      "La gran diferencia está en el tamaño, cerca de un 30% más pequeña, y en el almacenamiento, que sube a 1TB de SSD. Para quienes descargan muchos juegos, ese espacio extra se nota.",
      "El lector de discos ahora es desmontable, por lo que puedes comprar la versión digital y agregarlo más adelante si lo necesitas.",
      "¿Conviene cambiarse? Si ya tienes una PS5 original, probablemente no. Pero si vas a comprar tu primera consola de esta generación, la Slim es la opción recomendada.",
    ],
  },
];

export const obtenerBlogs = () => BLOGS;

export const obtenerBlogPorId = (id) => BLOGS.find((b) => b.id === Number(id));
