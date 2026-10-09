// wupz.vaked.dev — the spatial zen field.
// Dependency-free: one canvas, one pointer, three trits. All motion is derived,
// nothing is fetched. Machines, sci-fi and fantasy welcome.
(() => {
  "use strict";

  const canvas = document.getElementById("field");
  const ctx = canvas.getContext("2d", { alpha: false });

  const state = {
    w: 0,
    h: 0,
    dpr: 1,
    t: 0,
    mode: "ultra", // "ultra" (Goku UI / silver) | "zeno" (Zeno / violet-gold)
    intensity: 1,
    bg: null, // cached background gradient (rebuilt on resize / mode change)
    particles: [],
    pulses: [],
    pointer: { x: 0.5, y: 0.5, px: 0.5, py: 0.5, down: false, active: false },
  };

  const PALETTES = {
    ultra: ["#dff6ff", "#8fd0ff", "#4b7bff", "#c9d6ff", "#ffffff"],
    zeno: ["#ffe6a6", "#e0b6ff", "#8a5cff", "#ff8ad8", "#ffffff"],
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function palette() {
    return PALETTES[state.mode] || PALETTES.ultra;
  }

  function resize() {
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.w = canvas.clientWidth;
    state.h = canvas.clientHeight;
    canvas.width = Math.floor(state.w * state.dpr);
    canvas.height = Math.floor(state.h * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    const target = Math.min(900, Math.round((state.w * state.h) / 2600));
    const n = Math.max(120, target);
    state.bg = null; // the cached gradient is sized to the viewport
    state.particles = new Array(n);
    for (let i = 0; i < n; i++) {
      state.particles[i] = {
        x: Math.random() * state.w,
        y: Math.random() * state.h,
        vx: 0,
        vy: 0,
        ph: Math.random() * Math.PI * 2,
        sp: 0.4 + Math.random() * 0.9,
      };
    }
  }

  // A cheap, deterministic flow field — sums of sines, no noise library.
  function flowAngle(x, y, t) {
    const s = 0.0016;
    return (
      Math.sin(x * s * state.intensity + t * 0.6) * 1.4 +
      Math.cos(y * s * 1.3 - t * 0.45) * 1.2 +
      Math.sin((x + y) * s * 0.7 + t * 0.25) * 0.9
    );
  }

  function step(dt) {
    const { w, h, particles, pointer } = state;
    const px = pointer.x * w;
    const py = pointer.y * h;
    const force = 26 * state.intensity;

    for (const p of particles) {
      const a = flowAngle(p.x, p.y, state.t);
      p.vx += Math.cos(a) * force * dt * p.sp;
      p.vy += Math.sin(a) * force * dt * p.sp;

      // the pointer is a soft attractor (Zeno's watchfulness — all, of the
      // attention, none of the erasing).
      const dx = px - p.x;
      const dy = py - p.y;
      const d2 = dx * dx + dy * dy + 4000;
      const pull = (pointer.down ? 900 : 260) / d2;
      p.vx += dx * pull * dt * 60;
      p.vy += dy * pull * dt * 60;

      p.vx *= 0.965;
      p.vy *= 0.965;
      p.x += p.vx * dt * 60 * 0.05;
      p.y += p.vy * dt * 60 * 0.05;

      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
    }
  }

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, state.h);
    if (state.mode === "zeno") {
      g.addColorStop(0, "#0b0714");
      g.addColorStop(0.55, "#120a1e");
      g.addColorStop(1, "#050308");
    } else {
      g.addColorStop(0, "#030811");
      g.addColorStop(0.55, "#04101d");
      g.addColorStop(1, "#01030a");
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, state.w, state.h);
    state.bg = g;
  }

  // the Ghost-in-the-Shell horizon: a perspective grid converging on the pointer.
  function drawHorizon() {
    const { w, h, pointer } = state;
    const horizon = h * 0.66;
    const vx = pointer.x * w;
    const pal = palette();
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = pal[2];
    ctx.globalAlpha = 0.18;
    ctx.lineWidth = 1;

    const cols = Math.floor(w / 46);
    for (let i = 0; i <= cols; i++) {
      const xTop = (i / cols) * w;
      const xBot = vx + (xTop - vx) * 3.4;
      ctx.beginPath();
      ctx.moveTo(xTop, horizon);
      ctx.lineTo(xBot, h + 40);
      ctx.stroke();
    }
    const rows = 18;
    const scroll = (state.t * 0.35) % 1;
    for (let j = 0; j < rows; j++) {
      const f = (j + scroll) / rows;
      const y = horizon + Math.pow(f, 2.2) * (h - horizon + 40);
      ctx.globalAlpha = 0.18 * (1 - f * 0.7);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawParticles() {
    const { particles, pointer } = state;
    const pal = palette();
    const px = pointer.x * state.w;
    const py = pointer.y * state.h;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = p.x - px;
      const dy = p.y - py;
      const d = Math.sqrt(dx * dx + dy * dy);
      const near = Math.max(0, 1 - d / 260);
      const col = pal[(i + Math.floor(state.t * 2)) % pal.length];
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.12 + near * 0.6;
      ctx.lineWidth = 0.6 + near * 1.8;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.9, p.y - p.vy * 0.9);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Zeno's halo: a slow orbit of watchful dots.
  function drawHalo() {
    const cx = state.w * 0.5;
    const cy = state.h * 0.42;
    const r = Math.min(state.w, state.h) * 0.34;
    const pal = palette();
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(cx, cy);
    ctx.rotate(state.t * 0.14);
    const n = 108;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const wobble = Math.sin(state.t * 1.2 + i * 0.35) * 5;
      const rad = r + wobble;
      ctx.fillStyle = pal[i % pal.length];
      ctx.globalAlpha = 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(state.t * 2 + i));
      ctx.beginPath();
      ctx.arc(Math.cos(a) * rad, Math.sin(a) * rad, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawPulses(dt) {
    const pal = palette();
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = state.pulses.length - 1; i >= 0; i--) {
      const s = state.pulses[i];
      s.r += 260 * dt;
      s.life -= dt * 0.9;
      if (s.life <= 0) {
        state.pulses.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = pal[0];
      ctx.globalAlpha = Math.max(0, s.life) * 0.6;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = Math.max(0, s.life) * 0.25;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── QuantTern: the emotional ternary code, live in the browser ─────────────
  const THRESHOLD = 0.33;
  function trit(x) {
    if (x >= THRESHOLD) return 1;
    if (x <= -THRESHOLD) return -1;
    return 0;
  }
  function encode(vad) {
    const trits = vad.map(trit);
    const bytes = [];
    for (let i = 0; i < trits.length; i += 4) {
      let b = 0;
      for (let j = 0; j < 4; j++) {
        const t = i + j < trits.length ? trits[i + j] : 0;
        b |= ((t + 1) & 3) << (2 * j);
      }
      bytes.push(b);
    }
    const hex = "qt:" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
    const magnitude = trits.filter((t) => t !== 0).length;
    return { trits, hex, magnitude };
  }
  function glyph(t) {
    return t > 0 ? "+" : t < 0 ? "\u2212" : "0";
  }

  function wireQuantTern() {
    const axes = ["v", "a", "d"].map((id) => document.getElementById("q-" + id));
    const out = document.getElementById("q-out");
    const glyphs = document.getElementById("q-glyphs");
    if (!out || axes.some((el) => !el)) return;

    const render = () => {
      const vad = axes.map((el) => parseFloat(el.value));
      const code = encode(vad);
      out.textContent = code.hex;
      if (glyphs) glyphs.textContent = code.trits.map(glyph).join(" ");
      for (const el of axes) {
        const v = parseFloat(el.value);
        el.style.setProperty("--t", String(Math.abs(v)));
      }
      document.documentElement.style.setProperty("--q-mag", String(code.magnitude / 3));
    };
    for (const el of axes) el.addEventListener("input", render);
    render();
  }

  function wireModes() {
    for (const id of ["ultra", "zeno"]) {
      const el = document.getElementById("mode-" + id);
      if (el) {
        el.addEventListener("click", () => {
          state.mode = id;
          state.bg = null; // repaint the base wash in the new palette
          document.body.dataset.mode = id;
          for (const other of ["ultra", "zeno"]) {
            const o = document.getElementById("mode-" + other);
            if (o) o.setAttribute("aria-pressed", String(other === id));
          }
        });
      }
    }
    const intensity = document.getElementById("intensity");
    if (intensity) {
      const apply = () => {
        state.intensity = parseFloat(intensity.value);
      };
      intensity.addEventListener("input", apply);
      apply();
    }
  }

  function onPointer(x, y, down) {
    state.pointer.x = x / state.w;
    state.pointer.y = y / state.h;
    state.pointer.active = true;
    if (down !== undefined) state.pointer.down = down;
  }

  window.addEventListener("pointermove", (e) => onPointer(e.clientX, e.clientY));
  window.addEventListener("pointerdown", (e) => {
    onPointer(e.clientX, e.clientY, true);
    state.pulses.push({ x: e.clientX, y: e.clientY, r: 6, life: 1 });
  });
  window.addEventListener("pointerup", () => {
    state.pointer.down = false;
  });
  window.addEventListener("pointerleave", () => {
    state.pointer.active = false;
  });

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    state.t += dt;

    // trail fade — reuse the cached background gradient so the base wash
    // survives instead of decaying to flat black.
    ctx.globalCompositeOperation = "source-over";
    if (!state.bg) drawBackground();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = state.bg;
    ctx.fillRect(0, 0, state.w, state.h);
    ctx.globalAlpha = 1;

    step(dt);
    drawHorizon();
    drawHalo();
    drawParticles();
    drawPulses(dt);

    requestAnimationFrame(frame);
  }

  function staticFrame() {
    drawBackground();
    drawHorizon();
    drawHalo();
    drawParticles();
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduced) staticFrame();
  });

  resize();
  wireQuantTern();
  wireModes();
  if (reduced) {
    staticFrame();
  } else {
    requestAnimationFrame(frame);
  }

  // mode default + the deep-link hash glow
  document.body.dataset.mode = state.mode;
})();
