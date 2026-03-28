(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Particle network (canvas) --- */
  var canvas = document.getElementById("particle-canvas");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  if (canvas && ctx && !prefersReduced) {
    var particles = [];
    var n = 72;
    var maxDist = 130;
    var w = 0;
    var h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      particles = [];
      for (var i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
        });
      }
    }

    function tick() {
      if (!ctx) return;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += w;
        else if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        else if (p.y > h) p.y -= h;
      }

      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            var alpha = (1 - dist / maxDist) * 0.22;
            ctx.strokeStyle = "rgba(55, 62, 75, " + alpha + ")";
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      for (var k = 0; k < particles.length; k++) {
        ctx.fillStyle = "rgba(75, 85, 100, 0.55)";
        ctx.beginPath();
        ctx.arc(particles[k].x, particles[k].y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(tick);
    }

    resize();
    initParticles();
    window.addEventListener("resize", function () {
      resize();
      initParticles();
    });
    requestAnimationFrame(tick);
  }

  /* --- Mobile nav --- */
  var nav = document.querySelector(".site-nav");
  var toggle = document.querySelector(".nav-toggle");

  function setNavOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setNavOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNavOpen(false);
    });

    document.addEventListener(
      "click",
      function (e) {
        if (!document.body.classList.contains("nav-open")) return;
        if (nav.contains(e.target) || toggle.contains(e.target)) return;
        setNavOpen(false);
      },
      true
    );
  }

  function pathKey(url) {
    var p = url.pathname;
    if (!p || p === "/") return "/";
    var lower = p.toLowerCase();
    if (lower === "/index.html" || lower.endsWith("/index.html")) {
      var base = p.slice(0, -10);
      return !base || base === "/" ? "/" : base.replace(/\/$/, "") || "/";
    }
    return p.replace(/\/$/, "") || "/";
  }

  function sameDocumentUrl(dest, here) {
    if (dest.origin !== here.origin) return false;
    return pathKey(dest) === pathKey(here) && dest.search === here.search;
  }

  /* --- Scroll reveal --- */
  if (!prefersReduced && "IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    }
  }
  if (prefersReduced || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* --- Page transition --- */
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
        if (sameDocumentUrl(dest, here)) return;

        e.preventDefault();
        document.body.classList.remove("page-enter");
        document.body.classList.add("page-exit");

        window.setTimeout(function () {
          window.location.href = href;
        }, 280);
      });
    });
  }

  /* --- Calendar (terminarz.html) --- */
  var calRoot = document.getElementById("calendar-app");
  if (calRoot) {
    var monthLabel = document.getElementById("cal-month-label");
    var gridEl = document.getElementById("cal-grid");
    var prevBtn = document.getElementById("cal-prev");
    var nextBtn = document.getElementById("cal-next");

    var monthNames = [
      "Styczeń",
      "Luty",
      "Marzec",
      "Kwiecień",
      "Maj",
      "Czerwiec",
      "Lipiec",
      "Sierpień",
      "Wrzesień",
      "Październik",
      "Listopad",
      "Grudzień",
    ];

    var state = {
      y: new Date().getFullYear(),
      m: new Date().getMonth(),
    };

    /* Demo status by day-of-month for current view (rotating pattern) */
    function statusForDay(day) {
      var r = (day + state.m * 3) % 7;
      if (r === 0 || r === 5) return "urgent";
      if (r === 2 || r === 4) return "busy";
      if (r === 1) return "focus";
      return "free";
    }

    function render() {
      if (!gridEl || !monthLabel) return;
      monthLabel.textContent = monthNames[state.m] + " " + state.y;

      var first = new Date(state.y, state.m, 1);
      var startPad = (first.getDay() + 6) % 7;
      var daysInMonth = new Date(state.y, state.m + 1, 0).getDate();

      gridEl.innerHTML = "";

      for (var i = 0; i < startPad; i++) {
        var pad = document.createElement("div");
        pad.className = "cal-cell cal-cell--muted";
        pad.textContent = "";
        gridEl.appendChild(pad);
      }

      var today = new Date();
      for (var d = 1; d <= daysInMonth; d++) {
        var cell = document.createElement("div");
        cell.className = "cal-cell";
        cell.textContent = String(d);
        cell.setAttribute("role", "gridcell");
        cell.setAttribute("tabindex", "0");

        var isToday =
          today.getDate() === d && today.getMonth() === state.m && today.getFullYear() === state.y;

        var st = statusForDay(d);
        if (isToday) {
          cell.classList.add("cal-cell--focus");
        } else if (st === "urgent") {
          cell.classList.add("cal-cell--urgent");
        } else if (st === "busy") {
          cell.classList.add("cal-cell--busy");
        } else {
          cell.classList.add("cal-cell--free");
        }

        var statusLabel = isToday
          ? "dziś"
          : st === "urgent"
            ? "pilne"
            : st === "busy"
              ? "zajęte"
              : "wolne / plan";

        cell.title = d + " " + monthNames[state.m] + " " + state.y + " — " + statusLabel;

        gridEl.appendChild(cell);
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        state.m--;
        if (state.m < 0) {
          state.m = 11;
          state.y--;
        }
        render();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        state.m++;
        if (state.m > 11) {
          state.m = 0;
          state.y++;
        }
        render();
      });
    }

    render();
  }
})();
