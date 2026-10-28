import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, query, orderBy, limit,
  onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 👇 REEMPLAZA esto con el config de TU proyecto de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const coleccion = collection(db, "comentarios");

const form = document.getElementById("form-comentario");
const inputNombre = document.getElementById("nombre");
const inputMensaje = document.getElementById("mensaje");
const contador = document.getElementById("contador");
const lista = document.getElementById("lista-comentarios");

// Contador de caracteres
inputMensaje.addEventListener("input", () => {
  contador.textContent = `${inputMensaje.value.length}/280`;
});

// Publicar comentario
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const boton = form.querySelector("button");
  boton.disabled = true;

  // Si en 8 segundos no hay respuesta del servidor, avisa
  const aviso = setTimeout(() => {
    alert("El servidor no responde. Revisa: base de datos creada, projectId del config y reglas.");
  }, 8000);

  try {
    await addDoc(coleccion, {
      nombre: inputNombre.value.trim(),
      mensaje: inputMensaje.value.trim(),
      createdAt: serverTimestamp()
    });
    console.log("✅ Guardado en el servidor");
    inputMensaje.value = "";
    contador.textContent = "0/280";
  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
  } finally {
    clearTimeout(aviso);
    boton.disabled = false;
  }
});

// Tiempo relativo: "hace 5 min"
function hace(fecha) {
  const seg = Math.floor((Date.now() - fecha.getTime()) / 1000);
  if (seg < 60) return "ahora";
  if (seg < 3600) return `hace ${Math.floor(seg / 60)} min`;
  if (seg < 86400) return `hace ${Math.floor(seg / 3600)} h`;
  return fecha.toLocaleDateString();
}

// Mostrar los 50 comentarios más recientes en tiempo real
const consulta = query(coleccion, orderBy("createdAt", "desc"), limit(50));

onSnapshot(
  consulta,
  (snapshot) => {
    lista.innerHTML = "";

    snapshot.forEach((doc) => {
      const d = doc.data();
      const fecha = d.createdAt ? d.createdAt.toDate() : new Date();

      const li = document.createElement("li");
      li.className = "comentario";

      const avatar = document.createElement("div");
      avatar.className = "comentario__avatar";
      avatar.textContent = d.nombre.charAt(0).toUpperCase();

      const cuerpo = document.createElement("div");
      cuerpo.className = "comentario__cuerpo";

      const cabecera = document.createElement("div");
      cabecera.className = "comentario__cabecera";

      const nombre = document.createElement("strong");
      nombre.textContent = d.nombre;

      const tiempo = document.createElement("span");
      tiempo.textContent = hace(fecha);

      const texto = document.createElement("p");
      texto.textContent = d.mensaje;

      cabecera.append(nombre, tiempo);
      cuerpo.append(cabecera, texto);
      li.append(avatar, cuerpo);
      lista.append(li);
    });
  },
  (error) => {
    console.error("Error leyendo comentarios:", error);
    alert("Error leyendo: " + error.message);
  }
);