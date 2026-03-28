(function () {
  "use strict";

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Mobile navigation */
  var nav = document.querySelector(".site-nav");
  var toggle = document.querySelector(".nav-toggle");

  function setNavOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      setNavOpen(open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNavOpen(false);
    });
  }

  /* Typewriter effect (index only) */
  var tw = document.getElementById("typewriter");
  if (tw && tw.dataset.text) {
    var full = tw.dataset.text;
    var i = 0;
    tw.textContent = "";

    var cursor = document.querySelector(".cursor-blink");

    function tick() {
      if (i < full.length) {
        tw.textContent += full.charAt(i);
        i += 1;
        var delay = full.charAt(i - 1) === "." ? 280 : 28 + Math.random() * 32;
        window.setTimeout(tick, delay);
      } else if (cursor) {
        cursor.style.visibility = "hidden";
      }
    }

    window.setTimeout(tick, 400);
  }

  /* Page transition: exit animation before navigation */
  var prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReduced) {
    document.querySelectorAll('a[href$=".html"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var href = anchor.getAttribute("href");
        if (!href || href.indexOf("#") === 0) return;
        if (anchor.target && anchor.target !== "_self") return;
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

        var dest;
        var here;
        try {
          dest = new URL(href, window.location.href);
          here = new URL(window.location.href);
        } catch (err) {
          return;
        }

        if (dest.origin !== here.origin) return;
        if (dest.pathname === here.pathname && dest.search === here.search) return;

        e.preventDefault();
        document.body.classList.remove("page-enter");
        document.body.classList.add("page-exit");

        window.setTimeout(function () {
          window.location.href = href;
        }, 320);
      });
    });
  }
})();
