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
  date: "2026-11-28",              // ngày làm lễ (năm-tháng-ngày)
  sessions: [                      // các khung giờ trong ngày (giờ Việt Nam), thêm/bớt dòng tùy ý
    { from: "13:00", to: "15:30" },
    { from: "17:00", to: "18:00" },
  ],

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

  // Nhạc nền (lặp lại khi hết bài). Để trống music thì không có nhạc và ẩn nút 🔊.
  music: "assets/music/bgm.mp3",
  musicVolume: 1,   // 0 → 1; 1 = giữ nguyên âm lượng của file

  newsText: "Tớ tốt nghiệp rồi!",
  // Link Web App của Google Apps Script để nhận câu trả lời "Đương nhiên / Tớ bận rùi"
  // (xem hướng dẫn trong file google-apps-script.gs). Để trống thì chỉ lưu trên máy người xem.
  rsvpEndpoint: "https://script.google.com/macros/s/AKfycbyg5Bl2DVzAbhEX8t8uajhewBdck8VGP0-468DdqugXRv43t7MpDda6VZMe4gl9XrLX/exec",
};
// =====================================================

const $ = (id) => document.getElementById(id);
const TZ = "Asia/Ho_Chi_Minh";
const at = (hhmm) => new Date(`${CONFIG.date}T${hhmm}:00+07:00`);
const SESSIONS = CONFIG.sessions.map((s) => ({ start: at(s.from), end: at(s.to) }));
const startDate = SESSIONS[0].start;                    // giờ bắt đầu sớm nhất (dùng cho đếm ngược)
const endDate = SESSIONS[SESSIONS.length - 1].end;      // giờ kết thúc muộn nhất
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
  const range = $("time-range");
  range.textContent = "";
  SESSIONS.forEach((s) => {
    const line = document.createElement("span");
    line.className = "slot";
    line.textContent = hm(s.start) + " – " + hm(s.end);
    range.appendChild(line);
  });
  range.classList.toggle("multi", SESSIONS.length > 1);
  const h = parseInt(hm(startDate), 10);   // "08:00" -> 8
  const buoi = h < 11 ? "Buổi sáng" : h < 13 ? "Buổi trưa" : h < 18 ? "Buổi chiều" : "Buổi tối";
  $("time-note").textContent = buoi + ", " + part({ day: "numeric", month: "numeric", year: "numeric" });
  setupCalendarLink();
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

// "Nhắc tớ nhé": thêm vào lịch của người xem 1 sự kiện = khung giờ ĐẦU TIÊN (13:00 – 15:00)
//   - iPhone / iPad / Mac: mở file .ics -> hiện ngay màn hình "Thêm vào Lịch" của Apple (kèm nhắc trước 1 ngày, 1 tiếng)
//   - Android / máy khác: mở Google Calendar với sự kiện điền sẵn
const ICS_FILE = "assets/le-tot-nghiep.ics";
function toCalTime(d) {   // 2026-11-29T01:00:00.000Z -> 20261129T010000Z
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
const CAL = SESSIONS[0];   // sự kiện thêm vào lịch: khung giờ đầu tiên
function setupCalendarLink() {
  const link = $("cal-link");
  const title = "Lễ tốt nghiệp của " + CONFIG.graduateName;
  const where = CONFIG.venueName + ", " + CONFIG.venueAddress;
  const google = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(title) +
    "&dates=" + toCalTime(CAL.start) + "/" + toCalTime(CAL.end) +
    "&details=" + encodeURIComponent("Hẹn gặp cậu ở lễ tốt nghiệp của " + CONFIG.nickname + " 🎓") +
    "&location=" + encodeURIComponent(where);
  link.href = google;
  const apple = /iPhone|iPad|iPod|Macintosh|Mac OS X/.test(navigator.userAgent);
  if (!apple) return;
  // chỉ dùng file .ics nếu nó khớp đúng ngày giờ trong CONFIG (lỡ đổi ngày mà quên cập nhật file thì vẫn dùng Google)
  fetch(ICS_FILE, { cache: "no-store" })
    .then((r) => (r.ok ? r.text() : ""))
    .then((txt) => {
      if (txt.includes("DTSTART:" + toCalTime(CAL.start)) && txt.includes("DTEND:" + toCalTime(CAL.end))) {
        link.href = ICS_FILE;
        link.removeAttribute("target");   // mở ngay tại trang, iPhone sẽ hiện bảng "Thêm vào Lịch"
      }
    })
    .catch(() => { /* giữ link Google */ });
}

// Ghi tên người xem lên phần mở đầu và lên thiệp
let currentGuest = "";
function setGuest(name) {
  currentGuest = name;
  splitText($("intro-you"), name);
  $("intro-you").classList.toggle("long", name.length > 14);
  $("guest-name").textContent = name;
  $("guest-name").classList.toggle("long", name.length > 15);
  $("guest-name").classList.toggle("xlong", name.length > 21);
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
function shuffle(arr) {   // xáo trộn ngẫu nhiên (Fisher–Yates)
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function buildFilm() {
  // mỗi lần mở web, thứ tự ảnh kỷ niệm được xáo ngẫu nhiên
  const photos = shuffle((CONFIG.memories || []).filter(Boolean));
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
    // dải dưới bắt đầu lệch nửa vòng để 2 dải không hiện cùng 1 ảnh một lúc
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
      showHint(2700);   // không tự chuyển: người xem chạm để sang cảnh tiếp
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
      showHint(3800);   // không tự chuyển
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

let nudgedName = null;   // đã nhắc "thêm họ / tên lót" cho tên này chưa

// Người xem nhập tên xong
$("name-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("name-input").value.trim().replace(/\s+/g, " ");
  if (name && !name.includes(" ") && nudgedName !== name) {
    nudgedName = name;
    $("name-error").textContent = "Thêm họ hoặc tên lót giúp tớ nhé, để tớ biết chính xác là ai 😉 (bấm lần nữa nếu vẫn giữ nguyên)";
    $("name-input").focus();
    return;
  }
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
  showHint(2600);   // không tự chuyển
});

stage.addEventListener("click", (e) => {
  if (e.target.closest("#envelope, #name-form")) return;
  if (canAdvance) next();
});
document.addEventListener("keydown", (e) => {
  if (!stage.isConnected || e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
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
// Đếm số lần người xem bấm nút pháo hoa -> ghi vào Google Sheet (cột "Số lần bắn pháo hoa").
// Không gửi mỗi lần bấm: gộp lại, gửi 1 lần sau khi ngừng bấm ~2 giây hoặc khi rời trang.
let fireworksCount = 0;     // tổng số lần bấm trong lần xem này
let fireworksPending = 0;   // số lần bấm chưa gửi lên Sheet
let fireworksTimer = null;
function flushFireworks() {
  clearTimeout(fireworksTimer);
  if (!fireworksPending || !CONFIG.rsvpEndpoint) return;
  const n = fireworksPending;
  fireworksPending = 0;
  postToSheet("fireworks", { count: n }).then((ok) => { if (!ok) fireworksPending += n; });   // lỗi mạng: để gửi lại lần sau
}

$("boom-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  FX.cannon("left", 80); FX.cannon("right", 80);
  FX.show(6, 3000);
  fireworksCount += 1;
  fireworksPending += 1;
  clearTimeout(fireworksTimer);
  fireworksTimer = setTimeout(flushFireworks, 2000);
});
// rời trang / chuyển tab / khóa máy: gửi ngay số lần còn lại
document.addEventListener("visibilitychange", () => { if (document.hidden) flushFireworks(); });
window.addEventListener("pagehide", flushFireworks);

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
    ? `Yeahhh! Hẹn gặp ${who} ngày ${day} nhé 😘`
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
//  NHẠC NỀN
// =====================================================
const bgm = $("bgm");
const musicBtn = $("music-btn");
// Mặc định nhạc LUÔN BẬT mỗi lần mở web (không nhớ việc tắt nhạc sang lần sau).
let musicOff = false;        // người xem tự bấm tắt trong lần xem này
let resumeOnShow = false;

// Nút hiện 🔊 khi nhạc đang bật (kể cả lúc còn chờ lần chạm đầu tiên để trình duyệt cho phát), 🔇 khi đã tắt
function setMusicUI() {
  const on = !musicOff;
  musicBtn.textContent = on ? "🔊" : "🔇";
  musicBtn.classList.toggle("on", !bgm.paused);          // vòng sáng nhịp chỉ khi thực sự đang phát
  musicBtn.setAttribute("aria-pressed", String(on));
  musicBtn.setAttribute("aria-label", on ? "Tắt nhạc" : "Bật nhạc");
}
function playMusic() {
  const p = bgm.play();
  if (p && p.catch) p.catch(() => { /* trình duyệt chặn tự phát: chờ lần chạm đầu tiên */ });
}

// Trình duyệt thường chỉ cho phát nhạc sau khi người xem chạm / bấm phím lần đầu
const GESTURES = ["pointerup", "touchend", "click", "keydown"];
function onFirstGesture(e) {
  if (gateOpen) return;                                                          // đang hiện thông báo bật loa: chờ bấm "Đóng"
  if (e.target && e.target.closest && e.target.closest("#music-btn")) return;   // nút nhạc tự xử lý
  if (!musicOff) playMusic();
}
function stopListeningFirstGesture() {
  GESTURES.forEach((ev) => document.removeEventListener(ev, onFirstGesture, true));
}

function initMusic() {
  if (!CONFIG.music) return;              // không cấu hình nhạc: ẩn nút
  bgm.src = CONFIG.music;
  bgm.volume = Math.max(0, Math.min(1, CONFIG.musicVolume ?? 1));
  musicBtn.hidden = false;
  setMusicUI();
  bgm.addEventListener("play", () => { setMusicUI(); stopListeningFirstGesture(); });
  bgm.addEventListener("pause", setMusicUI);
  GESTURES.forEach((ev) => document.addEventListener(ev, onFirstGesture, true));

  musicBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!musicOff && bgm.paused) { playMusic(); return; }   // đang chờ được phép phát: lần bấm này cho phát luôn
    musicOff = !musicOff;
    if (musicOff) bgm.pause(); else playMusic();
    setMusicUI();
  });

  // chuyển tab / khóa màn hình thì tạm dừng, quay lại thì phát tiếp
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      resumeOnShow = !bgm.paused;
      if (resumeOnShow) bgm.pause();
    } else if (resumeOnShow && !musicOff) {
      playMusic();
    }
  });

  // có thông báo bật loa: nhạc bắt đầu khi bấm "Đóng" (xem openSoundGate)
}

// =====================================================
//  THÔNG BÁO BẬT LOA (hiện ngay khi mở link)
// =====================================================
let gateOpen = false;
function openSoundGate(onDone) {
  const gate = $("sound-gate");
  if (!CONFIG.music) { gate.remove(); onDone(); return; }   // không có nhạc thì bỏ qua thông báo
  gateOpen = true;
  gate.hidden = false;
  requestAnimationFrame(() => gate.classList.add("show"));
  if (matchMedia("(hover: hover)").matches) setTimeout(() => $("sg-close").focus(), 350);
  $("sg-close").addEventListener("click", (e) => {
    e.stopPropagation();
    if (!gateOpen) return;
    gateOpen = false;
    musicOff = false;
    playMusic();          // gọi ngay trong lúc bấm để iPhone cho phép phát nhạc
    setMusicUI();
    gate.classList.remove("show");
    gate.classList.add("hide");
    setTimeout(() => { gate.remove(); onDone(); }, 420);
  });
}

// =====================================================
//  KHỞI ĐỘNG
// =====================================================
// Tải lại trang: luôn bắt đầu lại từ phần mở đầu, không để trình duyệt tự cuộn về vị trí cũ
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

document.body.classList.add("locked");
fillContent();
initMusic();
buildFilm();
makeFloaties();
tick();
setInterval(tick, 1000);
openSoundGate(() => goTo(0));
