/* =========================================================
   MD Shohan Molla | E-Portfolio
   script.js
   1. Settings you can edit
   2. Hero entrance animation
   3. Mobile navigation menu
   4. Header border + current section highlight
   6. Video: show player only when the file exists
   7. Copy email button
   8. Footer year
   ========================================================= */

/* ---------- 1. Settings you can edit ---------- */
// Paste your public LinkedIn profile here, e.g. "https://www.linkedin.com/in/your-name/"
// While it is empty, the LinkedIn row in the Contact section is hidden.
const LINKEDIN_URL = "";

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- 2. Hero entrance animation ---------- */
  requestAnimationFrame(() => {
    document.documentElement.classList.add("is-loaded");
  });

  /* ---------- 3. Mobile navigation menu ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  const toggleLabel = toggle.querySelector(".visually-hidden");

  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggleLabel.textContent = open ? "Close menu" : "Open menu";
  }

  toggle.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Close the menu after choosing a link
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  // Close with the Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  /* ---------- 4. Header border + current section highlight ---------- */
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }, { passive: true });

  const navLinks = [...menu.querySelectorAll('a[href^="#"]')];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-current", active);
          if (active) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- 6. Video: show player only when the file exists ---------- */
  // The placeholder is visible by default. If introduction.mp4 loads,
  // the player is shown. If it is missing, nothing breaks.
  const video = document.getElementById("intro-video");
  const placeholder = document.getElementById("video-placeholder");
  const source = video.querySelector("source");

  video.addEventListener("loadedmetadata", () => {
    video.hidden = false;
    placeholder.hidden = true;
  });

  function showPlaceholder() {
    video.hidden = true;
    placeholder.hidden = false;
  }
  source.addEventListener("error", showPlaceholder);
  video.addEventListener("error", showPlaceholder);

  /* ---------- 7. Copy email button ---------- */
  const toast = document.getElementById("toast");
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3000);
  }

  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        showToast("Email copied");
      } catch {
        showToast("Copy failed. Select the email and copy it manually.");
      }
    });
  });

  /* LinkedIn link */
  const linkedinRow = document.getElementById("linkedin-row");
  if (LINKEDIN_URL) {
    document.getElementById("linkedin-link").href = LINKEDIN_URL;
  } else {
    linkedinRow.hidden = true;
  }

  /* ---------- 7b. Real CV download ----------
     Browsers ignore the "download" attribute when the page is opened from a file
     (file://) and only show the PDF. This makes every Download CV button save the file. */
  function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function base64ToBlob(b64) {
    const bytes = atob(b64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: "application/pdf" });
  }

  function loadOfflineFiles() {
    return new Promise((resolve) => {
      if (window.OFFLINE_FILES) return resolve(window.OFFLINE_FILES);
      const s = document.createElement("script");
      s.src = "offline-files.js";
      s.onload = () => resolve(window.OFFLINE_FILES || {});
      s.onerror = () => resolve({});
      document.head.appendChild(s);
    });
  }

  document.addEventListener("click", async (event) => {
    const link = event.target.closest("a[data-download]");
    if (!link) return;
    event.preventDefault();
    setMenu(false);
    const path = link.getAttribute("href");
    const filename = link.getAttribute("download") || path.split("/").pop();
    try {
      const res = await fetch(path);              // works on GitHub Pages / Live Server
      if (!res.ok) throw new Error("HTTP " + res.status);
      saveBlob(await res.blob(), filename);
      showToast("Download started: " + filename);
    } catch {
      const offline = await loadOfflineFiles();   // works when opened by double-click
      if (offline[path]) {
        saveBlob(base64ToBlob(offline[path]), filename);
        showToast("Download started: " + filename);
      } else {
        window.open(path, "_blank", "noopener");
        showToast("Opened in a new tab. Use the download button there to save it.");
      }
    }
  });

  /* ---------- 8. Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});
