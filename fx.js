// =====================================================
//  HIỆU ỨNG: pháo giấy, pháo hoa, sóng xung kích
//  Dùng: FX.cannon("left"), FX.firework(x, y), FX.rocket(x, y),
//        FX.burst(x, y), FX.ring(x, y), FX.show(soPhao, thoiGianMs), FX.rain(ms)
// =====================================================
const FX = (() => {
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const K = reduce ? 0.2 : 1; // giảm số hạt nếu người xem tắt chuyển động

  const CONFETTI = ["#1488db", "#a3deff", "#ffffff", "#5fb8f0", "#042b92", "#ffd54a", "#ff8fb1", "#1488db", "#a3deff"];
  const FW = [
    ["#1488db", "#a3deff"], ["#ffffff", "#a3deff"], ["#5fb8f0", "#ffffff"],
    ["#ffd54a", "#fff3c4"], ["#ff8fb1", "#ffd6e2"], ["#1488db", "#ffffff"],
  ];
  const MAX = 1600;

  let W = 0, H = 0, dpr = 1, parts = [], running = false, last = 0;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[(Math.random() * a.length) | 0];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
  }
  addEventListener("resize", resize);
  resize();

  function add(p) {
    if (parts.length >= MAX) return;
    parts.push(p);
    if (!running) { running = true; last = 0; requestAnimationFrame(loop); }
  }

  // ---------- các loại hạt ----------
  function confetti(x, y, ang, spd, color) {
    add({ t: "c", x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      w: rand(6, 11), h: rand(9, 16), rot: rand(0, 6.3), vr: rand(-0.25, 0.25),
      tilt: rand(0, 6.3), vt: rand(0.06, 0.16), color: color || pick(CONFETTI),
      round: Math.random() < 0.25 });
  }
  function spark(x, y, ang, spd, color, o = {}) {
    add({ t: "s", x, y, px: x, py: y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      color, life: 1, decay: o.decay || rand(0.011, 0.02), g: o.g ?? 0.05,
      size: o.size || 2.4, glitter: o.glitter || false, drag: o.drag || 0.955 });
  }

  // ---------- API ----------
  // Sóng tròn lan ra
  function ring(x, y, color = "#a3deff", size = 1) {
    add({ t: "w", x, y, r: 6, vr: 11 * size, life: 1, color, lw: 7 });
  }

  // Nổ pháo giấy tỏa tròn từ 1 điểm
  function burst(x, y, o = {}) {
    const n = Math.round((o.count || 90) * K);
    const s = o.speed || 14;
    for (let i = 0; i < n; i++) confetti(x, y, rand(0, Math.PI * 2), rand(s * 0.3, s));
  }

  // Bắn pháo giấy từ góc dưới màn hình
  function cannon(side = "left", count = 130) {
    const left = side === "left";
    const x = left ? -10 : W + 10, y = H + 10;
    const base = left ? -Math.PI / 2 + 0.45 : -Math.PI / 2 - 0.45;
    const sc = Math.max(0.8, H / 800);
    for (let i = 0; i < Math.round(count * K); i++) {
      confetti(x, y, base + rand(-0.32, 0.32), rand(14, 30) * sc);
    }
  }

  // Mưa pháo giấy rơi từ trên
  function rain(ms = 2500) {
    const end = performance.now() + ms;
    (function drop() {
      for (let i = 0; i < Math.round(5 * K) + 1; i++) confetti(rand(0, W), -20, Math.PI / 2, rand(1, 4));
      if (performance.now() < end) setTimeout(drop, 40);
    })();
  }

  // Pháo hoa nổ tại (x, y)
  function firework(x, y, type) {
    const [c1, c2] = pick(FW);
    type = type || pick(["peony", "peony", "ring", "heart", "double", "willow"]);
    const n = Math.round(90 * K) + 8;
    const sc = Math.max(0.85, Math.min(W, H) / 700);
    ring(x, y, c2, 0.6);
    if (type === "ring" || type === "double") {
      for (let i = 0; i < n; i++) spark(x, y, (i / n) * Math.PI * 2, 6.5 * sc, c1, { g: 0.035 });
      if (type === "double")
        for (let i = 0; i < n * 0.6; i++) spark(x, y, (i / (n * 0.6)) * Math.PI * 2, 3.6 * sc, c2, { g: 0.035 });
    } else if (type === "heart") {
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2;
        const hx = 16 * Math.sin(t) ** 3;
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const ang = Math.atan2(hy, hx), spd = Math.hypot(hx, hy) * 0.42 * sc;
        spark(x, y, ang, spd, i % 3 ? "#ff8fb1" : "#ffffff", { g: 0.02, decay: 0.012 });
      }
    } else if (type === "willow") {
      for (let i = 0; i < n; i++) spark(x, y, rand(0, 6.3), rand(1, 6) * sc, "#ffd54a", { g: 0.07, decay: 0.008, glitter: true, size: 1.8 });
    } else {
      for (let i = 0; i < n; i++) spark(x, y, rand(0, 6.3), rand(1.5, 7.5) * sc, Math.random() < 0.7 ? c1 : c2, { glitter: Math.random() < 0.3 });
    }
    // vài mảnh giấy rơi theo cho vui
    for (let i = 0; i < 14 * K; i++) confetti(x, y, rand(0, 6.3), rand(2, 7));
  }

  // Tên lửa bay từ dưới lên rồi nổ tại (x, ty)
  function rocket(x, ty, type) {
    const startY = H + 10;
    const g = 0.14;
    const vy = -Math.sqrt(2 * g * Math.max(60, startY - ty));
    add({ t: "r", x, y: startY, px: x, py: startY, vx: rand(-0.6, 0.6), vy, g, type });
  }

  // Một tràng pháo hoa ngẫu nhiên
  function show(count = 6, ms = 3000) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => rocket(rand(W * 0.12, W * 0.88), rand(H * 0.12, H * 0.45)), (i / count) * ms + rand(0, 200));
    }
  }

  // ---------- vòng lặp vẽ ----------
  function step(p, dt) {
    switch (p.t) {
      case "c":
        p.vx *= Math.pow(0.985, dt); p.vy *= Math.pow(0.985, dt);
        p.vy = Math.min(p.vy + 0.32 * dt, 4.2);
        p.tilt += p.vt * dt; p.rot += p.vr * dt;
        p.x += (p.vx + Math.sin(p.tilt) * 0.9) * dt; p.y += p.vy * dt;
        return p.y < H + 30 && p.x > -60 && p.x < W + 60;
      case "s":
        p.px += (p.x - p.px) * 0.4; p.py += (p.y - p.py) * 0.4;
        p.vx *= Math.pow(p.drag, dt); p.vy *= Math.pow(p.drag, dt);
        p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        p.life -= p.decay * dt;
        return p.life > 0;
      case "r":
        p.px += (p.x - p.px) * 0.35; p.py += (p.y - p.py) * 0.35;
        p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (Math.random() < 0.8) spark(p.x, p.y, rand(1.2, 1.9), rand(0.3, 1.2), "#fff3c4", { decay: 0.05, size: 1.6, g: 0.02 });
        if (p.vy >= -0.6) { firework(p.x, p.y, p.type); return false; }
        return true;
      case "w":
        p.r += p.vr * dt; p.vr *= Math.pow(0.93, dt); p.life -= 0.035 * dt;
        return p.life > 0;
    }
    return false;
  }

  function draw(p) {
    if (p.t === "c") {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.tilt));
      if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w * 0.55, 0, 6.3); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    } else if (p.t === "s" || p.t === "r") {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = p.t === "r" ? 1 : Math.max(0, p.life) * (p.glitter && Math.random() < 0.4 ? 0.2 : 1);
      ctx.strokeStyle = p.t === "r" ? "#ffffff" : p.color;
      ctx.lineWidth = p.t === "r" ? 3 : p.size;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
    } else if (p.t === "w") {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(0, p.life) * 0.9;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.lw * p.life + 0.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.stroke();
    }
  }

  function loop(ts) {
    const dt = last ? Math.min((ts - last) / 16.67, 3) : 1;
    last = ts;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // hạt mới sinh ra trong lúc step (đuôi tên lửa, pháo nổ) được thêm vào cuối mảng,
    // nên chỉ cập nhật n hạt cũ rồi nối phần mới vào sau
    const n = parts.length;
    const alive = [];
    for (let i = 0; i < n; i++) if (step(parts[i], dt)) alive.push(parts[i]);
    parts = alive.concat(parts.slice(n));
    for (const p of parts) draw(p);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    if (parts.length) requestAnimationFrame(loop);
    else { running = false; ctx.clearRect(0, 0, W, H); }
  }

  // Hiệu ứng nhanh theo phần tử trên trang
  function center(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  return { ring, burst, cannon, rain, firework, rocket, show, center, reduce };
})();
