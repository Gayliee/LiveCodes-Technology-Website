document.documentElement.classList.add("js");

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isExpanded));
    menuButton.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !isExpanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
      navigation.classList.remove("is-open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("is-open")) {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
      navigation.classList.remove("is-open");
      menuButton.focus();
    }
  });
}

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const form = document.querySelector("#contact-form");
if (form) {
  const emailField = form.querySelector("#email");
  const phoneField = form.querySelector("#phone");
  const status = form.querySelector("#form-status");
  const honeypot = form.querySelector("#website");

  const validateContact = () => {
    const hasContact = Boolean(emailField.value.trim() || phoneField.value.trim());
    emailField.setCustomValidity(hasContact ? "" : "Please add an email address or phone number so we can reply.");
  };
  emailField.addEventListener("input", validateContact);
  phoneField.addEventListener("input", validateContact);
  validateContact();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";
    validateContact();

    if (honeypot.value.trim()) {
      status.textContent = "Thanks — your message could not be prepared. Please contact us directly by email.";
      return;
    }
    if (!form.reportValidity()) return;

    const name = form.querySelector("#name").value.trim();
    const email = emailField.value.trim();
    const phone = phoneField.value.trim();
    const message = form.querySelector("#message").value.trim();
    const contactLine = [email && `Email: ${email}`, phone && `Phone: ${phone}`].filter(Boolean).join(" | ");
    const body = `Hi LiveCodes Technology,\n\n${message}\n\nFrom: ${name}\n${contactLine}`;
    const subject = `Website inquiry from ${name}`;
    const mailto = `mailto:francis.natividad@livecodes.ph?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    status.textContent = "Opening your email app with the message ready to send…";
    window.location.href = mailto;
  });
}

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());
