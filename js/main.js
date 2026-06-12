/* ============================================================
   TNC Garment — main.js
   ============================================================ */

/* ---------- Mobile hamburger menu ---------- */
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');

hamburger.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});

// ปิดเมนูเมื่อกดลิงก์ (มือถือ)
mainNav.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    mainNav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

/* ---------- Hero slider ---------- */
const slides = document.querySelectorAll('.hero-slide');
const dotsWrap = document.getElementById('heroDots');
let current = 0;
let timer;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.setAttribute('aria-label', 'สไลด์ที่ ' + (i + 1));
  if (i === 0) dot.classList.add('is-active');
  dot.addEventListener('click', () => { goTo(i); restart(); });
  dotsWrap.appendChild(dot);
});
const dots = dotsWrap.querySelectorAll('button');

function goTo(i) {
  slides[current].classList.remove('is-active');
  dots[current].classList.remove('is-active');
  current = i;
  slides[current].classList.add('is-active');
  dots[current].classList.add('is-active');
}

function next() { goTo((current + 1) % slides.length); }
function restart() { clearInterval(timer); timer = setInterval(next, 4500); }
restart();

/* ---------- Marquee: ทำสำเนาโลโก้เพื่อให้วนลูปไร้รอยต่อ ---------- */
const track = document.getElementById('marqueeTrack');
track.innerHTML += track.innerHTML;

/* ---------- Scroll reveal ---------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

/* ---------- FAQ accordion ---------- */
document.querySelectorAll('.acc-item').forEach((item) => {
  const head = item.querySelector('.acc-head');
  const body = item.querySelector('.acc-body');
  head.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // ปิดอันอื่นก่อน เปิดทีละอัน
    document.querySelectorAll('.acc-item.open').forEach((o) => {
      o.classList.remove('open');
      o.querySelector('.acc-body').style.maxHeight = null;
      o.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      body.style.maxHeight = body.scrollHeight + 'px';
      head.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ---------- เครื่องคำนวณราคาโดยประมาณ ----------
   TODO: ปรับตารางราคาให้ตรงกับราคาจริงของ TNC */
const PRICE_TABLE = {
  print: { name: 'เสื้อพิมพ์ลาย (Sublimation)', tiers: [[20, 350], [50, 320], [100, 290], [300, 260], [Infinity, 240]] },
  polo:  { name: 'เสื้อโปโลปัก',               tiers: [[20, 300], [50, 280], [100, 255], [300, 230], [Infinity, 210]] },
  ready: { name: 'เสื้อสำเร็จรูป + สกรีน',      tiers: [[10, 220], [50, 195], [100, 175], [300, 155], [Infinity, 140]] },
};

document.getElementById('priceForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const type = PRICE_TABLE[document.getElementById('priceType').value];
  const qty = parseInt(document.getElementById('priceQty').value, 10);
  const result = document.getElementById('priceResult');

  const minQty = type.tiers[0][0];
  if (qty < minQty) {
    result.hidden = false;
    result.innerHTML = type.name + ' สั่งขั้นต่ำ ' + minQty + ' ตัว กรุณาเพิ่มจำนวน';
    return;
  }
  const perUnit = type.tiers.find(([max]) => qty <= max)[1];
  const total = perUnit * qty;
  result.hidden = false;
  result.innerHTML =
    type.name + ' จำนวน ' + qty.toLocaleString() + ' ตัว<br>' +
    'ราคาประมาณ <strong>' + perUnit.toLocaleString() + '</strong> บาท/ตัว ' +
    'รวมประมาณ <strong>' + total.toLocaleString() + '</strong> บาท (รวม VAT)';
});

/* ---------- เครื่องช่วยเลือกไซซ์ ----------
   TODO: ปรับเกณฑ์ให้ตรงกับตารางไซซ์จริงของ TNC */
const SIZE_CHART = [
  { size: 'SS', maxW: 45,  maxH: 155 },
  { size: 'S',  maxW: 55,  maxH: 165 },
  { size: 'M',  maxW: 65,  maxH: 172 },
  { size: 'L',  maxW: 75,  maxH: 178 },
  { size: 'XL', maxW: 85,  maxH: 184 },
  { size: '2XL', maxW: 95, maxH: 190 },
  { size: '3XL', maxW: 110, maxH: 200 },
  { size: '4XL', maxW: Infinity, maxH: Infinity },
];

document.getElementById('sizeForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const w = parseFloat(document.getElementById('sizeWeight').value);
  const h = parseFloat(document.getElementById('sizeHeight').value);
  const loose = document.getElementById('sizeFit').value === 'loose';
  const result = document.getElementById('sizeResult');

  let idx = SIZE_CHART.findIndex((s) => w <= s.maxW && h <= s.maxH);
  if (idx === -1) idx = SIZE_CHART.length - 1;
  if (loose) idx = Math.min(idx + 1, SIZE_CHART.length - 1);

  result.hidden = false;
  result.innerHTML =
    'น้ำหนัก ' + w + ' กก. / ส่วนสูง ' + h + ' ซม.' +
    (loose ? ' (ทรงหลวมสบาย)' : ' (ทรงพอดีตัว)') + '<br>' +
    'ไซซ์แนะนำ: <strong>' + SIZE_CHART[idx].size + '</strong>';
});

/* ---------- Active nav ตามตำแหน่ง scroll ---------- */
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

window.addEventListener('scroll', () => {
  let active = '#top';
  sections.forEach((sec) => {
    if (window.scrollY >= sec.offsetTop - 120) active = '#' + sec.id;
  });
  navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === active));
}, { passive: true });
