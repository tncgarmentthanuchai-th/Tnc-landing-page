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

/* ---------- เครื่องคำนวณราคาโดยประมาณ ---------- */
const SHIRT_TYPES = {
  crew:   { name: 'เสื้อคอกลม',      price: 229, img: 'images/tools/crew.jpg' },
  vneck:  { name: 'เสื้อคอวี',       price: 229, img: 'images/tools/v-neck.jpg' },
  polo:   { name: 'เสื้อคอปก',       price: 289, img: 'images/tools/polo.jpg' },
  jersey: { name: 'คอปก Jersey',     price: 289, img: 'images/tools/jersey.jpg' },
};
const MIN_QTY = 10;

const priceTypeSelect = document.getElementById('priceType');
const shirtPreview = document.getElementById('shirtPreview');
const shirtPreviewPh = document.getElementById('shirtPreviewPh');
const shirtPreviewPhText = document.getElementById('shirtPreviewPhText');

shirtPreview.addEventListener('load', () => {
  shirtPreview.style.display = 'block';
  shirtPreviewPh.style.display = 'none';
});
shirtPreview.addEventListener('error', () => {
  shirtPreview.style.display = 'none';
  shirtPreviewPh.style.display = 'flex';
  shirtPreviewPhText.textContent = 'วาง ' + SHIRT_TYPES[priceTypeSelect.value].img + ' — 600×800';
});

// กรณีรูปแรกโหลดไม่สำเร็จก่อน listener ถูกผูก (script อยู่ท้าย body)
if (shirtPreview.complete && shirtPreview.naturalWidth === 0) {
  shirtPreview.dispatchEvent(new Event('error'));
}

function updateShirtPreview() {
  const type = SHIRT_TYPES[priceTypeSelect.value];
  shirtPreview.alt = type.name;
  shirtPreview.src = type.img;
}
priceTypeSelect.addEventListener('change', updateShirtPreview);

document.getElementById('priceForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const type = SHIRT_TYPES[priceTypeSelect.value];
  const qty = parseInt(document.getElementById('priceQty').value, 10);
  const result = document.getElementById('priceResult');

  if (qty < MIN_QTY) {
    result.hidden = false;
    result.innerHTML = 'สั่งขั้นต่ำ ' + MIN_QTY + ' ตัว กรุณาเพิ่มจำนวน';
    return;
  }
  const total = type.price * qty;
  result.hidden = false;
  result.innerHTML =
    type.name + ' จำนวน ' + qty.toLocaleString() + ' ตัว<br>' +
    'ราคา <strong>' + type.price.toLocaleString() + '</strong> บาท/ตัว ' +
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
