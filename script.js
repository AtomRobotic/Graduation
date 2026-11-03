// =====================================================
//  SỬA THÔNG TIN CỦA BẠN Ở ĐÂY (chỉ cần sửa phần này)
// =====================================================
const CONFIG = {
  graduateName: "Ngô Đức Luân",
  nickname: "Đức Luân",                // tên gọi thân mật, hiện ở câu "Mình là ..."
  degree: "Cử nhân ngành Khoa học và Kỹ thuật máy tính",
  school: "Trường Đại học Bách Khoa",
  photo: "assets/me/portrait.webp",   // ảnh trong khung vòm giữa thiệp

  // Ngày giờ bắt đầu, giữ nguyên định dạng và đuôi +07:00 (giờ Việt Nam)
  start: "2026-11-29T08:00:00+07:00",
  durationHours: 3,   // giờ kết thúc = giờ bắt đầu + số giờ này (đặt 0 nếu chỉ muốn hiện giờ bắt đầu)

  venueName: "Tòa A3",
  venueAddress: "268 Đ. Lý Thường Kiệt, Diên Hồng, Hồ Chí Minh",
  mapUrl: "https://maps.app.goo.gl/MBMEJ9ifiChC4D2f7", // dán link Google Maps vào đây; để trống thì tự tìm theo địa chỉ

  // Liên hệ trên thiệp (để trống ô nào thì ẩn ô đó)
  facebookUrl: "https://www.facebook.com/Luke.thatsme",   // link Facebook, ví dụ "https://www.facebook.com/ten.cua.ban"
  facebookLabel: "Luân Ngô Đức", // chữ hiện cạnh icon Facebook; để trống thì dùng tên của bạn
  phone: "0868015546",         // số điện thoại có Zalo, ví dụ "0901234567"

  // Ảnh kỷ niệm chạy như thước phim sau khi nhập tên.
  // Bỏ ảnh vào thư mục assets/memories rồi ghi đường dẫn vào đây; để trống thì hiện khung tạm.
  memories: [
    "assets/memories/01.webp",
    "assets/memories/02.webp",
    "assets/memories/03.webp",
    "assets/memories/04.webp",
    "assets/memories/05.webp",
    "assets/memories/06.webp",
    "assets/memories/07.webp",
    "assets/memories/08.webp",
    "assets/memories/09.webp",
    "assets/memories/10.webp",
    "assets/memories/11.webp",
    "assets/memories/12.webp",
  ],   // dải trên chạy theo thứ tự 01 → 12

  newsText: "Tớ tốt nghiệp rồi!",
  // Link Web App của Google Apps Script để nhận câu trả lời "Đương nhiên / Tớ bận rùi"
  // (xem hướng dẫn trong file google-apps-script.gs). Để trống thì chỉ lưu trên máy người xem.
  rsvpEndpoint: "https://script.google.com/macros/s/AKfycbxizleB397uYs77V2FPi-wbFEv7F5K9kFfA5MAsIb6x8rOO3OEhB5YennVkgJRlEYeV/exec",
};
// =====================================================

const $ = (id) => document.getElementById(id);
const TZ = "Asia/Ho_Chi_Minh";
const startDate = new Date(CONFIG.start);
const endDate = new Date(startDate.getTime() + CONFIG.durationHours * 3600 * 1000);
const NAME_KEY = "grad-invite-guest";

// Tên gợi ý sẵn trong ô nhập: lấy từ link (?ten=Minh) hoặc lần trước đã nhập
function suggestedName() {
  const fromLink = new URLSearchParams(location.search).get("ten");
  if (fromLink && fromLink.trim()) return fromLink.trim();
  try { return localStorage.getItem(NAME_KEY) || ""; } catch (e) { return ""; }
}

// Tách chữ thành từng ký tự để chạy hiệu ứng nảy từng chữ
function splitText(el, text) {
  el.textContent = "";
  let i = 0;
  text.split(" ").forEach((word, wi, arr) => {
    const w = document.createElement("span");
    w.className = "word";
    for (const ch of word) {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = ch;
      s.style.setProperty("--i", i++);
      w.appendChild(s);
    }
    el.appendChild(w);
    if (wi < arr.length - 1) el.appendChild(document.createTextNode(" "));
  });
}

// =====================================================
//  THIỆP
// =====================================================
function fillContent() {
  $("me-photo-card").src = CONFIG.photo;
  $("grad-name").textContent = CONFIG.graduateName;
  $("grad-degree").textContent = CONFIG.degree;
  $("grad-school").textContent = CONFIG.school;

  // Khối ngày kiểu thiệp:  THÁNG 12 / CHỦ NHẬT | 20 | 08:00 / 2026
  const part = (opts) => new Intl.DateTimeFormat("vi-VN", { timeZone: TZ, ...opts }).format(startDate);
  $("db-weekday").textContent = part({ weekday: "long" });
  $("db-day").textContent = part({ day: "2-digit" });
  $("db-month").textContent = "Tháng " + part({ month: "numeric" });

  // Mục THỜI GIAN: 08:00 – 11:00, kèm buổi trong ngày
  const hm = (d) => new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).format(d);
  $("time-range").textContent = CONFIG.durationHours > 0 ? hm(startDate) + " – " + hm(endDate) : hm(startDate);
  const h = parseInt(hm(startDate), 10);   // "08:00" -> 8
  const buoi = h < 11 ? "Buổi sáng" : h < 13 ? "Buổi trưa" : h < 18 ? "Buổi chiều" : "Buổi tối";
  $("time-note").textContent = buoi + ", " + part({ day: "numeric", month: "numeric", year: "numeric" });
  $("class-year").textContent = part({ year: "numeric" });

  $("venue-name").textContent = CONFIG.venueName;
  $("venue-address").textContent = CONFIG.venueAddress;
  $("map-link").href = CONFIG.mapUrl ||
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(CONFIG.venueName + ", " + CONFIG.venueAddress);



  fillContact();
  splitText($("intro-me"), CONFIG.nickname);
  splitText($("intro-news"), CONFIG.newsText);
  $("name-input").value = suggestedName();
}

// Liên hệ: Facebook + số điện thoại (bấm vào mở Zalo)
function fillContact() {
  const fb = $("contact-fb"), zl = $("contact-zalo");
  if (CONFIG.facebookUrl) {
    fb.href = CONFIG.facebookUrl;
    $("fb-text").textContent = CONFIG.facebookLabel || CONFIG.graduateName;
  } else fb.hidden = true;

  const digits = String(CONFIG.phone || "").replace(/\D/g, "");
  if (digits) {
    zl.href = "https://zalo.me/" + digits;
    // 0901234567 -> 0901 234 567
    $("zalo-text").textContent = digits.length === 10 ? digits.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3") : digits;
  } else zl.hidden = true;

  if (fb.hidden && zl.hidden) $("contact").hidden = true;

  // Icon thương hiệu lấy từ bộ icon mã nguồn mở Simple Icons (qua CDN jsDelivr).
  // Nếu không tải được thì hiện chữ "f" / "Z" thay thế.
  document.querySelectorAll("img[data-icon]").forEach((img) => {
    const srcs = ["13", "11"].map((v) => `https://cdn.jsdelivr.net/npm/simple-icons@${v}/icons/${img.dataset.icon}.svg`);
    let k = 0;
    img.onerror = () => {
      k += 1;
      if (k < srcs.length) img.src = srcs[k];
      else img.parentElement.classList.add("no-icon");
    };
    img.src = srcs[0];
  });
}

// Ghi tên người xem lên phần mở đầu và lên thiệp
let currentGuest = "";
function setGuest(name) {
  currentGuest = name;
  splitText($("intro-you"), name);
  $("intro-you").classList.toggle("long", name.length > 14);
  $("guest-name").textContent = name;
  document.title = "Thư mời " + name + " | Lễ tốt nghiệp của " + CONFIG.graduateName;
  try { localStorage.setItem(NAME_KEY, name); } catch (e) { /* bỏ qua nếu trình duyệt chặn */ }
}


function tick() {
  const diff = startDate - Date.now();
  if (diff <= 0) {
    $("countdown").hidden = true;
    const done = $("countdown-done");
    done.hidden = false;
    done.textContent = Date.now() < endDate ? "Buổi lễ đang diễn ra! 🎓" : "Cảm ơn cậu đã đến chung vui! 💙";
    return;
  }
  const pad = (n) => String(n).padStart(2, "0");
  $("cd-days").textContent = pad(Math.floor(diff / 86400000));
  $("cd-hours").textContent = pad(Math.floor(diff / 3600000) % 24);
  $("cd-mins").textContent = pad(Math.floor(diff / 60000) % 60);
  $("cd-secs").textContent = pad(Math.floor(diff / 1000) % 60);
}

// Ném mũ tốt nghiệp bay lên
function tossCaps(n = 5) {
  if (FX.reduce) return;
  for (let i = 0; i < n; i++) {
    const cap = document.createElement("img");
    cap.src = "assets/sticker-cap.svg";
    cap.alt = "";
    cap.className = "sticker toss";
    cap.style.left = 10 + Math.random() * 80 + "%";
    cap.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
    cap.style.setProperty("--r", (Math.random() * 500 - 250) + "deg");
    cap.style.animationDelay = Math.random() * 0.5 + "s";
    cap.style.width = 60 + Math.random() * 30 + "px";
    $("stage").appendChild(cap);
    setTimeout(() => cap.remove(), 3200);
  }
}

// Tim / sao bay lên nhè nhẹ ở cảnh "còn cậu là" (chỉ chạy khi cảnh hiện)
function makeFloaties(n = 16) {
  if (FX.reduce) return;
  const box = $("floaties");
  const glyphs = ["♥", "♥", "✦", "★", "♥"];
  const colors = ["#a3deff", "#ff8fb1", "#ffd54a", "#ffffff", "#5fb8f0"];
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.color = colors[i % colors.length];
    s.style.fontSize = 12 + Math.random() * 20 + "px";
    s.style.setProperty("--dx", (Math.random() * 80 - 40) + "px");
    s.style.setProperty("--r", (Math.random() * 120 - 60) + "deg");
    s.style.setProperty("--o", (0.35 + Math.random() * 0.45).toFixed(2));
    s.style.animationDuration = 6 + Math.random() * 5 + "s";
    s.style.animationDelay = Math.random() * 4 + "s";
    box.appendChild(s);
  }
}

// Dựng 2 dải phim kỷ niệm (mỗi dải lặp 2 lần để chạy vòng liền mạch)
function buildFilm() {
  const photos = (CONFIG.memories || []).filter(Boolean);
  const PH = ["🎓", "📚", "☕", "🏫", "🎉", "📸", "💻", "🌅"];
  const n = Math.max(8, photos.length);
  const frame = (i) => {
    const f = document.createElement("div");
    f.className = "frame";
    if (photos.length) {
      const img = document.createElement("img");
      img.src = photos[i % photos.length];
      img.alt = "";
      img.decoding = "async";
      f.appendChild(img);
    } else {
      f.classList.add("ph");
      f.innerHTML = PH[i % PH.length] + "<small>ảnh kỷ niệm</small>";
    }
    return f;
  };
  ["film-a", "film-b"].forEach((id, row) => {
    const track = $(id);
    // dải dưới bắt đầu lệch để 2 dải không trùng ảnh
    const order = Array.from({ length: n }, (_, i) => (i + row * Math.ceil(n / 2)) % n);
    for (let rep = 0; rep < 2; rep++) order.forEach((i) => track.appendChild(frame(i)));
  });
}

// =====================================================
//  PHẦN MỞ ĐẦU: các cảnh lần lượt
// =====================================================
const stage = $("stage");
const scenes = ["scene-me", "scene-you", "scene-memories", "scene-news", "scene-envelope"].map($);
let current = -1;
let timers = [];
let canAdvance = false;
const later = (fn, ms) => timers.push(setTimeout(fn, ms));
const pt = (el) => FX.center(el);

function showHint(ms) {
  later(() => { canAdvance = true; $("tap-hint").classList.add("show"); }, ms);
}

// Kịch bản từng cảnh (ms tính từ lúc cảnh bắt đầu)
const SCRIPT = [
  { // Cảnh 1: Mình là ... (không pháo hoa)
    run() {
      showHint(2700);
      later(next, 5600);
    },
  },
  { // Cảnh 2: còn cậu là ... (chờ người xem nhập tên)
    run() {
      later(() => {
        // chỉ tự focus trên máy tính, tránh bật bàn phím đột ngột trên điện thoại
        if (matchMedia("(hover: hover)").matches) $("name-input").focus();
      }, 900);
    },
  },
  { // Cảnh 3: thước phim kỷ niệm "4 năm / 1 hành trình / cùng vô vàn kỷ niệm" (không pháo hoa)
    // Không tự chuyển: phim chạy mãi cho tới khi người xem chạm màn hình.
    run() {
      showHint(4400);   // hiện "chạm để tiếp tục" sau khi dòng chữ cuối xuất hiện
    },
  },
  { // Cảnh 4: Tớ tốt nghiệp rồi! (bắt đầu có pháo hoa)
    run() {
      later(() => { FX.cannon("left", 80); FX.cannon("right", 80); }, 1500);
      later(() => tossCaps(5), 1700);
      later(() => FX.show(4, 2400), 2000);
      showHint(3800);
      later(next, 7600);
    },
  },
  { // Cảnh 5: phong bì
    run() {},
  },
];

function goTo(i) {
  timers.forEach(clearTimeout);
  timers = [];
  canAdvance = false;
  $("tap-hint").classList.remove("show");

  const prev = scenes[current];
  if (prev) {
    prev.classList.add("leave");
    setTimeout(() => prev.classList.remove("active", "leave"), 450);
  }
  current = i;
  setTimeout(() => {
    scenes[i].classList.add("active");
    SCRIPT[i].run();
  }, prev ? 380 : 0);
}

function next() {
  if (current < scenes.length - 1) goTo(current + 1);
}

// Người xem nhập tên xong
$("name-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("name-input").value.trim().replace(/\s+/g, " ");
  if (!name) {
    $("name-error").textContent = "Cho mình biết tên cậu nhé 😊";
    $("name-input").focus();
    return;
  }
  $("name-error").textContent = "";
  $("name-input").blur();
  setGuest(name);
  postToSheet("name");                         // lưu tên lên Google Sheet ngay (chưa cần hồi âm)
  $("scene-you").classList.add("revealed");   // không pháo hoa ở cảnh này
  showHint(2600);
  later(next, 6800);
});

stage.addEventListener("click", (e) => {
  if (e.target.closest("#envelope, #name-form")) return;
  if (canAdvance) next();
});
document.addEventListener("keydown", (e) => {
  if (!stage.isConnected || e.target.tagName === "INPUT") return;
  if (["Enter", " ", "ArrowRight"].includes(e.key) && canAdvance) { e.preventDefault(); next(); }
});

// ----- Mở phong bì -----
let opened = false;
function openEnvelope() {
  if (opened) return;
  opened = true;
  const env = $("envelope");
  $("scene-envelope").classList.add("opening");   // ẩn chữ phía trên để thư bay lên không đè chữ
  env.classList.add("open");
  setTimeout(() => {
    const p = pt(env);
    FX.ring(p.x, p.y, "#ffffff", 1.4);
    FX.burst(p.x, p.y, { count: 110, speed: 18 });
    FX.cannon("left", 70); FX.cannon("right", 70);
  }, 900);
  setTimeout(() => {
    stage.classList.add("fade");
    document.body.classList.remove("locked");
    const inv = $("invitation");
    inv.hidden = false;
    requestAnimationFrame(() => inv.classList.add("show"));
    inv.querySelectorAll(".reveal").forEach((el, i) => setTimeout(() => el.classList.add("in"), 250 + i * 110));
    startRsvpFlow();
    FX.show(3, 2000);
  }, 1250);
  setTimeout(() => stage.remove(), 2200);
}
$("envelope").addEventListener("click", openEnvelope);
$("envelope").addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEnvelope(); }
});

// =====================================================
//  TƯƠNG TÁC TRÊN THIỆP
// =====================================================
// Chạm chibi trong khung vòm: nảy nhẹ + ít pháo giấy
$("me-photo-card").addEventListener("click", (e) => {
  e.stopPropagation();
  const el = e.currentTarget;
  if (el.animate) el.animate([{ scale: "1" }, { scale: "1.08" }, { scale: "1" }], { duration: 400, easing: "ease-out" });
  FX.burst(e.clientX, e.clientY, { count: 24, speed: 8 });
});

// Nút bắn pháo hoa
$("boom-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  FX.cannon("left", 80); FX.cannon("right", 80);
  FX.show(6, 3000);
});

// Chạm vào chỗ trống ngoài thiệp: bắn 1 quả pháo hoa tới chỗ đó
$("invitation").addEventListener("click", (e) => {
  if (e.target.closest(".card-inv, a, button")) return;
  FX.rocket(e.clientX, e.clientY);
});



// =====================================================
//  HỒI ÂM: Đương nhiên / Tớ bận rùi
// =====================================================
const RSVP_KEY = "grad-invite-rsvp";
const ID_KEY = "grad-invite-id";
const rsvpEl = $("rsvp");
let rsvpAnswer = null;
let rsvpSentOk = true;

const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* trình duyệt chặn lưu trữ */ } },
};

// mã ngẫu nhiên cho mỗi máy, để người xem đổi câu trả lời thì cập nhật đúng dòng cũ
function deviceId() {
  let id = store.get(ID_KEY);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
    store.set(ID_KEY, id);
  }
  return id;
}

function showSticker(state) { rsvpEl.dataset.state = state; }
// rời chuột khỏi nút: về ảnh đã chọn, hoặc ảnh "đang chờ" nếu chưa chọn
function restSticker() { showSticker(rsvpAnswer || "wait"); }

function rsvpMessage(answer) {
  const who = currentGuest || store.get(NAME_KEY) || "cậu";
  const day = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "numeric", timeZone: TZ }).format(startDate);
  return answer === "yes"
    ? `Yeahhh! Hẹn gặp ${who} ngày ${day} nhé 🎉`
    : `Tiếc ghê… Cảm ơn ${who} đã báo mình nha 💙`;
}

function markAnswer(answer, flash = true) {
  rsvpAnswer = answer;
  document.querySelectorAll(".rsvp-btn").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.answer === answer)));
  $("rsvp-msg").textContent = rsvpMessage(answer);
  showSticker(answer);
  // nút cuối thiệp đổi chữ để biết là đã hồi âm
  $("cta-text").textContent = answer === "yes" ? "Đã hồi âm: Đương nhiên ✓" : "Đã hồi âm: Tớ bận rùi";
  $("go-rsvp").classList.add("answered");
  updateNudge();
}

// Gửi 1 sự kiện lên Google Sheet.
//   type "name": người xem vừa nhập tên  -> Sheet ghi tên, trạng thái "Chưa hồi âm"
//   type "rsvp": người xem bấm hồi âm   -> Sheet cập nhật đúng dòng đó
// Trả về false nếu chưa cấu hình hoặc gửi lỗi.
async function postToSheet(type, extra = {}) {
  if (!CONFIG.rsvpEndpoint) {
    console.info("[Google Sheet] Chưa đặt CONFIG.rsvpEndpoint nên chưa gửi:", type, extra);
    return false;
  }
  try {
    // text/plain để không bị trình duyệt chặn (CORS) khi gửi sang Google Apps Script
    await fetch(CONFIG.rsvpEndpoint, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,   // vẫn gửi xong dù người xem đóng trang ngay sau đó
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        type,
        id: deviceId(),
        name: currentGuest || store.get(NAME_KEY) || "(không tên)",
        ...extra,
      }),
    });
    return true;
  } catch (e) {
    return false;
  }
}

async function sendRsvp(answer) {
  const status = $("rsvp-status");
  if (!CONFIG.rsvpEndpoint) {
    status.textContent = "";
    await postToSheet("rsvp", { answer });
    return;
  }
  status.textContent = "Đang gửi…";
  if (await postToSheet("rsvp", { answer })) {
    status.textContent = "Đã gửi cho " + CONFIG.nickname + " ✓";
    rsvpSentOk = true;
  } else {
    status.textContent = "Chưa gửi được, cậu bấm lại giúp mình nhé.";
    rsvpSentOk = false;
  }
}

document.querySelectorAll(".rsvp-btn").forEach((btn) => {
  const answer = btn.dataset.answer;
  btn.addEventListener("mouseenter", () => showSticker(answer));
  btn.addEventListener("focus", () => showSticker(answer));
  btn.addEventListener("mouseleave", restSticker);
  btn.addEventListener("blur", restSticker);
  btn.addEventListener("click", () => {
    const changed = rsvpAnswer !== answer;
    markAnswer(answer);
    store.set(RSVP_KEY, answer);
    if (answer === "yes" && changed) {
      const p = FX.center(document.querySelector(".rsvp-frame"));
      FX.burst(p.x, p.y, { count: 60, speed: 11 });
      FX.cannon("left", 50); FX.cannon("right", 50);
    }
    if (changed || !rsvpSentOk) sendRsvp(answer);
  });
});


// ----- Đưa người xem tới trang hồi âm -----
const rsvpPage = $("rsvp-page");
const nudge = $("rsvp-nudge");
let rsvpInView = false;
let nudgeReady = false;   // chỉ nhắc sau khi đã xem thiệp vài giây

function goRsvp() { rsvpPage.scrollIntoView({ behavior: "smooth", block: "start" }); }
function updateNudge() {
  const show = nudgeReady && !rsvpAnswer && !rsvpInView;
  nudge.classList.toggle("show", show);
  nudge.setAttribute("aria-hidden", String(!show));
  nudge.tabIndex = show ? 0 : -1;
}
$("go-rsvp").addEventListener("click", (e) => { e.stopPropagation(); goRsvp(); });
nudge.addEventListener("click", goRsvp);
$("back-card").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

if ("IntersectionObserver" in window) {
  new IntersectionObserver(([en]) => {
    rsvpInView = en.isIntersecting;
    if (rsvpInView) rsvpEl.classList.add("in");
    updateNudge();
  }, { threshold: 0.35 }).observe(rsvpPage);
} else {
  rsvpEl.classList.add("in");
}

// gọi khi thiệp vừa mở ra
function startRsvpFlow() {
  rsvpPage.hidden = false;
  setTimeout(() => { nudgeReady = true; updateNudge(); }, 6000);
}

// mở lại trang: hiện câu trả lời đã chọn trước đó
(function restoreRsvp() {
  const saved = store.get(RSVP_KEY);
  if (saved === "yes" || saved === "busy") markAnswer(saved);
})();

// =====================================================
//  KHỞI ĐỘNG
// =====================================================
// Tải lại trang: luôn bắt đầu lại từ phần mở đầu, không để trình duyệt tự cuộn về vị trí cũ
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

document.body.classList.add("locked");
fillContent();
buildFilm();
makeFloaties();
tick();
setInterval(tick, 1000);
goTo(0);
