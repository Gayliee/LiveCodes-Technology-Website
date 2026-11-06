// LiveCodes Technology landing page (storytelling version)

const CONTACT_EMAIL = "francis.natividad@livecodes.ph";

// ---------- Analytics hook (PRD F6) ----------
// Sends contact clicks to Google Analytics / Tag Manager if either is added to the page.
function track(event, detail = {}) {
  if (typeof window.gtag === "function") window.gtag("event", event, detail);
  if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event, ...detail });
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-track]");
  if (el) track("contact_click", { method: el.dataset.track });
});

// ---------- Mobile menu ----------
const menuBtn = document.querySelector(".menu-toggle");
const nav = document.getElementById("site-nav");
function setMenu(open) {
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  nav.classList.toggle("is-open", open);
}
menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); }
});

// ---------- Header: tucks away while scrolling down, returns when scrolling up ----------
const header = document.querySelector(".site-header");
let lastY = window.scrollY;
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  const menuOpen = menuBtn.getAttribute("aria-expanded") === "true";
  header.classList.toggle("is-hidden", !menuOpen && y > 240 && y > lastY);
  lastY = y;
}, { passive: true });
// Keyboard users always get the header back when focus moves into it.
header.addEventListener("focusin", () => header.classList.remove("is-hidden"));

// ---------- Ordering tablet demo ----------
const peso = (n) => "₱" + n.toLocaleString("en-PH"); // ₱
const order = new Map();
let orderNo = 15;
const lines = document.querySelector(".pos-lines");
const totalEl = document.querySelector(".pos-total-value");
const sendBtn = document.querySelector(".pos-send");
const ticket = document.querySelector(".pos-ticket");
let ticketTimer;

function renderOrder() {
  lines.innerHTML = "";
  let total = 0;
  for (const [name, { price, qty }] of order) {
    total += price * qty;
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = `${qty}× ${name}`; // "2× Tapsilog"
    const amount = document.createElement("span");
    amount.textContent = peso(price * qty);
    li.append(label, amount);
    lines.append(li);
  }
  totalEl.textContent = peso(total);
  sendBtn.disabled = order.size === 0;
}

document.querySelectorAll(".pos-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    const { name, price } = btn.dataset;
    const line = order.get(name) || { price: Number(price), qty: 0 };
    line.qty += 1;
    order.set(name, line);
    ticket.classList.remove("is-shown");
    renderOrder();
  });
});

sendBtn.addEventListener("click", () => {
  const count = [...order.values()].reduce((n, l) => n + l.qty, 0);
  orderNo += 1;
  ticket.textContent = `Order #${String(orderNo).padStart(3, "0")} sent to the kitchen: ${count} item${count === 1 ? "" : "s"} for table 4.`;
  ticket.classList.add("is-shown");
  order.clear();
  renderOrder();
  clearTimeout(ticketTimer);
  ticketTimer = setTimeout(() => ticket.classList.remove("is-shown"), 4500);
});

// ---------- Contact form (PRD F5) ----------
// No backend yet: a valid message opens the visitor's email app, addressed to LiveCodes.
// To receive submissions directly, point the form at a form service (e.g. Formspree) instead.
const form = document.querySelector(".contact-form");
const statusEl = form.querySelector(".form-status");
const fields = {
  name: { el: form.elements.name, check: (v) => v.length >= 2 || "Enter your name." },
  reach: {
    el: form.elements.reach,
    check: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\+?[\d\s()-]{7,}$/.test(v) ||
      "Enter an email address or a phone number, like 0917 123 4567.",
  },
  message: { el: form.elements.message, check: (v) => v.length >= 10 || "Tell us a little about what you need (at least 10 characters)." },
};

function validate(key) {
  const { el, check } = fields[key];
  const result = check(el.value.trim());
  const err = document.getElementById(`${el.id}-err`);
  const ok = result === true;
  el.setAttribute("aria-invalid", String(!ok));
  el.setAttribute("aria-describedby", err.id);
  err.textContent = ok ? "" : result;
  return ok;
}
Object.keys(fields).forEach((key) => {
  fields[key].el.addEventListener("blur", () => { if (fields[key].el.value) validate(key); });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  if (form.elements.company.value) return; // spam trap filled
  const results = Object.keys(fields).map(validate);
  if (results.includes(false)) {
    const firstBad = Object.values(fields).find((f) => f.el.getAttribute("aria-invalid") === "true");
    firstBad.el.focus();
    return;
  }
  const name = fields.name.el.value.trim();
  const subject = `Website inquiry from ${name}`;
  const body = `${fields.message.el.value.trim()}\n\nName: ${name}\nReach me at: ${fields.reach.el.value.trim()}`;
  track("contact_click", { method: "form_submit" });
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  statusEl.textContent = "Your email app should open with your message ready. Press send there to reach us. If nothing opened, email " + CONTACT_EMAIL + ".";
});

// ---------- Footer year ----------
document.querySelector(".year").textContent = new Date().getFullYear();
