(() => {
  "use strict";

  // 1. Print / PDF Export triggers
  document.querySelectorAll("[data-print]").forEach((btn) => {
    btn.addEventListener("click", () => window.print());
  });

  // 2. Active navigation highlight on scroll
  const navLinks = Array.from(document.querySelectorAll(".nav-link[href^='#']"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length > 0) {
    const observer = new IntersectionObserver(
      () => {
        const activeSection = sections.find((section) => {
          const bounds = section.getBoundingClientRect();
          return bounds.top < window.innerHeight * 0.44 && bounds.bottom > window.innerHeight * 0.28;
        });
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${activeSection?.id}`);
        });
      },
      { rootMargin: "-28% 0px -56% 0px", threshold: 0.01 }
    );
    sections.forEach((sec) => observer.observe(sec));
  }

  // 3. Screenshot Lightbox Modal
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  const lbImg = document.getElementById("lightbox-img");
  const lbTitle = document.getElementById("lightbox-title");
  const lbLink = document.getElementById("lightbox-link");
  const lbClose = document.getElementById("lightbox-close");
  let lastTrigger = null;
  let previousOverflow = "";
  let backgroundElements = [];

  function getFocusableElements() {
    return Array.from(lightbox.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((element) => element.getClientRects().length > 0);
  }

  function openLightbox(trigger) {
    const src = trigger.dataset.src;
    const title = trigger.dataset.title || "";
    const href = trigger.dataset.href || "";

    if (!src) return;
    lastTrigger = trigger;
    previousOverflow = document.body.style.overflow;

    lbImg.src = src;
    lbImg.alt = title;
    lbTitle.textContent = title;

    if (href) {
      lbLink.href = href;
      lbLink.style.display = "inline-flex";
    } else {
      lbLink.style.display = "none";
    }

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    backgroundElements = Array.from(document.body.children)
      .filter((element) => element !== lightbox && element.tagName !== "SCRIPT")
      .map((element) => ({ element, wasInert: element.inert }));
    backgroundElements.forEach(({ element }) => { element.inert = true; });
    document.body.style.overflow = "hidden";
    lbClose.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!lightbox.classList.contains("is-open")) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousOverflow;
    backgroundElements.forEach(({ element, wasInert }) => { element.inert = wasInert; });
    backgroundElements = [];
    if (lastTrigger) {
      lastTrigger.focus({ preventScroll: true });
      lastTrigger = null;
    }
  }

  document.querySelectorAll("[data-lightbox]").forEach((btn) => {
    btn.addEventListener("click", () => openLightbox(btn));
  });

  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeLightbox();
      return;
    }
    if (e.key === "Tab") {
      const focusable = getFocusableElements();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  document.addEventListener("focusin", (e) => {
    if (lightbox.classList.contains("is-open") && !lightbox.contains(e.target)) {
      lbClose.focus({ preventScroll: true });
    }
  });
})();
