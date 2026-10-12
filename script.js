/* Encontrémonos — navegación y validaciones de demostración.
   Antes de publicar: configura un backend seguro y cambia el número de WhatsApp. */
"use strict";

const CONFIG = {
  // Formato internacional sin + ni espacios. Ecuador: 593 + número.
  whatsappNumber: "16205420832"
};

const pages = [...document.querySelectorAll("[data-panel]")];
const navLinks = [...document.querySelectorAll("[data-page]")];
const mainNav = document.getElementById("mainNav");
const menuToggle = document.getElementById("menuToggle");
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

function showPage(pageName, updateHistory = true) {
  const target = pages.find(page => page.dataset.panel === pageName);
  if (!target) return;
  pages.forEach(page => page.classList.toggle("active", page === target));
  document.querySelectorAll(".nav-link[data-page]").forEach(link => {
    const active = link.dataset.page === pageName;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  if (updateHistory) history.pushState({ page: pageName }, "", `#${pageName}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleInternalNavigation(event) {
  const link = event.target.closest('a[data-page]');
  if (!link) return;
  event.preventDefault();
  showPage(link.dataset.page);
}
document.addEventListener("click", handleInternalNavigation);

menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
});

window.addEventListener("popstate", () => {
  const pageName = location.hash.replace("#", "") || "inicio";
  showPage(pageName, false);
});

const initialPage = location.hash.replace("#", "");
if (pages.some(page => page.dataset.panel === initialPage)) showPage(initialPage, false);
const yearEl = document.getElementById("currentYear");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Búsqueda de las fichas de ejemplo. */
const caseSearch = document.getElementById("caseSearch");
if (caseSearch) caseSearch.addEventListener("input", () => {
  const query = caseSearch.value.trim().toLocaleLowerCase("es");
  let visible = 0;
  document.querySelectorAll(".case-card").forEach(card => {
    const matches = `${card.dataset.name || ""} ${card.innerText}`.toLocaleLowerCase("es").includes(query);
    card.hidden = !matches;
    if (matches) visible++;
  });
    const noCases = document.getElementById("noCases");
  if (noCases) noCases.hidden = visible > 0;
});
document.querySelectorAll(".demo-detail").forEach(button => button.addEventListener("click", () => {
  showToast("Esta es una ficha de ejemplo. Añade información verificada desde el sistema de administración.");
}));


/* Foto: vista previa local y límites básicos. No se sube a un servidor. */
const photoInput = document.getElementById("personPhoto");
const photoPreview = document.getElementById("photoPreview");
const photoPreviewWrap = document.getElementById("photoPreviewWrap");
let currentPhotoUrl = null;

photoInput.addEventListener("change", () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) return;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    photoInput.value = "";
    showToast("Formato no válido. Usa JPG, PNG o WebP.");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    photoInput.value = "";
    showToast("La imagen supera los 5 MB.");
    return;
  }
  if (currentPhotoUrl) URL.revokeObjectURL(currentPhotoUrl);
  currentPhotoUrl = URL.createObjectURL(file);
  photoPreview.src = currentPhotoUrl;
  photoPreviewWrap.hidden = false;
});
document.getElementById("removePhoto").addEventListener("click", () => {
  photoInput.value = "";
  photoPreview.removeAttribute("src");
  photoPreviewWrap.hidden = true;
  if (currentPhotoUrl) URL.revokeObjectURL(currentPhotoUrl);
  currentPhotoUrl = null;
});

/* Reporte: se guarda en Firebase (solo el administrador puede leerlo). */
document.getElementById("reportForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const campos = ["personName","personId","personAge","birthDate","personHeight",
    "personBuild","hairColor","eyeColor","distinctiveMarks","clothing","lastSeen",
    "lastSeenTime","lastLocation","lastContact","medicalInfo","familyName",
    "familyEmail","familyPhone","officialReport","extraInfo"];

  const data = {};
  campos.forEach(id => {
    const el = document.getElementById(id);
    const valor = el ? el.value.trim() : "";
    if (valor) data[id] = valor;
  });
  data.estado = "nuevo";
  data.createdAt = firebase.database.ServerValue.TIMESTAMP;

  const button = form.querySelector('button[type="submit"]');
  const result = document.getElementById("reportResult");
  button.disabled = true;
  try {
    await db.ref("reportes").push(data);
    form.reset();
    photoPreviewWrap.hidden = true;
    result.hidden = false;
    result.textContent = "Gracias. Tu reporte fue recibido y será revisado por el equipo. Recuerda que esto no reemplaza la denuncia ante las autoridades.";
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    showToast("No se pudo enviar el reporte. Inténtalo de nuevo.");
  } finally {
    button.disabled = false;
  }
});

const whatsappLink = document.getElementById("whatsappLink");
if (whatsappLink) whatsappLink.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent("Hola, necesito orientación sobre la plataforma Encontrémonos.")}`;





document.querySelectorAll(".hero-carousel").forEach((carousel) => {
  const slides = carousel.querySelectorAll(".hero-slide");
  const dots = carousel.querySelectorAll(".carousel-dot");
  const prev = carousel.querySelector(".carousel-btn.prev");
  const next = carousel.querySelector(".carousel-btn.next");

  let current = 0;
  let timer;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === current);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
    });
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => showSlide(current + 1), 4000);
  }

  prev.addEventListener("click", () => {
    showSlide(current - 1);
    startTimer();
  });

  next.addEventListener("click", () => {
    showSlide(current + 1);
    startTimer();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      showSlide(i);
      startTimer();
    });
  });

  showSlide(0);
  startTimer();
});

/* ---------- Foro con moderación (Firebase) ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyCck5HYtygspb2fT-rT63UMKZ6GNWaKGUk",
  authDomain: "nex0rg.firebaseapp.com",
  databaseURL: "https://nex0rg-default-rtdb.firebaseio.com",
  projectId: "nex0rg",
  storageBucket: "nex0rg.firebasestorage.app",
  messagingSenderId: "684713151482",
  appId: "1:684713151482:web:722bb2fb9e9619e0113243"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function buildPost(data, statusText, tagText) {
  const post = document.createElement("article");
  post.className = "forum-post";
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = (data.name || "?").charAt(0).toLocaleUpperCase("es");
  const content = document.createElement("div");
  const meta = document.createElement("div");
  meta.className = "post-meta";
  const author = document.createElement("strong");
  author.textContent = data.name;
  const status = document.createElement("span");
  status.textContent = statusText;
  meta.append(author, status);
  const body = document.createElement("p");
  body.textContent = data.message;          // textContent evita inyección de HTML
  const tag = document.createElement("span");
  tag.className = "post-tag";
  tag.textContent = tagText;
  content.append(meta, body, tag);
  post.append(avatar, content);
  return post;
}

/* Enviar: el mensaje va a "pendientes", no se muestra. */
document.getElementById("forumForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const name = document.getElementById("forumName").value.trim().slice(0, 40);
  const topic = document.getElementById("forumTopic").value;
  const message = document.getElementById("forumMessage").value.trim().slice(0, 600);
  if (!name || !message) return;

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await db.ref("foro/pendientes").push({
      name, topic, message,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    });
    form.reset();
    showToast("Gracias. Tu mensaje será publicado cuando sea revisado.");
  } catch (error) {
    showToast("No se pudo enviar el mensaje. Inténtalo de nuevo.");
  } finally {
    button.disabled = false;
  }
});

/* Mostrar solo los aprobados (los 50 más recientes). */
const approvedBox = document.getElementById("approvedMessages");
db.ref("foro/aprobados").orderByChild("createdAt").limitToLast(50).on("value", snapshot => {
  const items = [];
  snapshot.forEach(child => { items.push(child.val()); });
  approvedBox.replaceChildren(
    ...items.reverse().map(item => buildPost(item, "Publicado", `${item.topic}`))
  );
});
