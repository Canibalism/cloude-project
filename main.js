/* ============================================================
   VANTERA MEDICAL — shared interactions (vanilla JS)
   Nav toggle, scroll-spy, reveal-on-scroll, animated counters,
   chart bars, smooth anchors, forms, spec-sheet download, toast.
   All motion respects prefers-reduced-motion (ui-ux-pro-max).
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.getElementById("navMenu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------- Scroll-spy: highlight current section in nav ---------- */
  function initScrollSpy() {
    var links = document.querySelectorAll('[data-spy] a[href^="#"]');
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) {
      map[a.getAttribute("href").slice(1)] = a;
    });
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && map[en.target.id]) {
            links.forEach(function (a) { a.removeAttribute("aria-current"); });
            map[en.target.id].setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            obs.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ---------- Animated metric counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target)) return;
    if (reduceMotion) {
      el.innerHTML = prefix + target.toFixed(decimals) + suffix;
      return;
    }
    var dur = 1200, start = null;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      // Keep the accent <em> styling if present by rewriting text node only
      el.innerHTML = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(animateCount);
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateCount(en.target);
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ---------- Chart bars animate on view ---------- */
  function initBars() {
    var bars = document.querySelectorAll(".bar-fill[data-w]");
    if (!bars.length) return;
    function fill() {
      bars.forEach(function (b) { b.style.width = b.getAttribute("data-w") + "%"; });
    }
    if (reduceMotion || !("IntersectionObserver" in window)) { fill(); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.width = en.target.getAttribute("data-w") + "%";
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(function (b) { obs.observe(b); });
  }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ---------- Fake spec-sheet download (demo) ---------- */
  function specSheetText(kind) {
    var title = kind === "knee" ? "VANTERA KNEE System"
      : kind === "overview" ? "VANTERA Orthopedic Platform"
      : "VANTERA HIP System";
    var detail = kind === "knee"
      ? ["Platform: Posterior-stabilized / CR demo concept", "Sizes: Femoral 1-8 / Tibial 1-8 (demo)", "Insert thickness: 9-17 mm (demo)"].join("\n")
      : kind === "overview"
      ? ["Systems: VANTERA HIP + VANTERA KNEE (demo concepts)", "Focus: precision, workflow, data-driven design (demo)", "Content: illustrative summary only (demo)"].join("\n")
      : ["Platform: Press-fit tapered stem demo concept", "Stem sizes: 9-15 mm / Offsets: Std +4 (demo)", "Cup: 44-62 mm, 2 mm increments (demo)"].join("\n");
    return [
      "VANTERA MEDICAL — " + title.toUpperCase(),
      "Illustrative specification summary",
      "========================================",
      "DEMO DATA — FOR DESIGN PRACTICE ONLY.",
      "This document is fictional and does not",
      "describe a real medical device.",
      "",
      detail,
      "",
      "Contact: hello@vantera-medical.example (demo)",
      "Generated from the VANTERA demo website."
    ].join("\n");
  }
  function initSpecDownloads() {
    document.querySelectorAll("[data-spec]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var kind = btn.getAttribute("data-spec");
        var blob = new Blob([specSheetText(kind)], { type: "text/plain" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "vantera-" + kind + "-spec-sheet-DEMO.txt";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          URL.revokeObjectURL(a.href);
          a.remove();
        }, 500);
        toast("Demo spec sheet downloaded");
      });
    });
  }

  /* ---------- Generic form validation ---------- */
  function initForms() {
    document.querySelectorAll("form[data-validate]").forEach(function (form) {
      var status = form.querySelector("[data-form-status]");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = true, firstBad = null;
        form.querySelectorAll("[data-required]").forEach(function (input) {
          var err = form.querySelector('[data-err-for="' + input.id + '"]');
          var val = (input.value || "").trim();
          var valid = val.length > 0;
          if (valid && input.type === "email") {
            valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
          }
          input.setAttribute("aria-invalid", valid ? "false" : "true");
          if (err) err.classList.toggle("visible", !valid);
          if (!valid) { ok = false; firstBad = firstBad || input; }
        });
        if (!ok) {
          if (status) {
            status.textContent = "Please complete the highlighted fields.";
            status.className = "form-status bad";
          }
          if (firstBad) firstBad.focus();
          return;
        }
        var btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
        // Simulated async submit (demo — no backend)
        setTimeout(function () {
          if (status) {
            status.textContent = form.getAttribute("data-success") ||
              "Thank you — your request was received. Our team will reply within one business day. (Demo form, no data sent.)";
            status.className = "form-status ok";
          }
          form.reset();
          if (btn) { btn.disabled = false; btn.textContent = btn.getAttribute("data-label") || "Submit"; }
          toast("Request received — thank you");
        }, 900);
      });
      // Clear error as the user types
      form.querySelectorAll("[data-required]").forEach(function (input) {
        input.addEventListener("input", function () {
          input.setAttribute("aria-invalid", "false");
          var err = form.querySelector('[data-err-for="' + input.id + '"]');
          if (err) err.classList.remove("visible");
        });
      });
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initScrollSpy();
    initReveal();
    initCounters();
    initBars();
    initSpecDownloads();
    initForms();
    initYear();
    if (document.querySelector(".sticky-cta")) {
      document.body.classList.add("has-sticky-cta");
    }
  });

  window.Vantera = { toast: toast };
})();
