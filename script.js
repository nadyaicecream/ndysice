const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const slides = $$('.slide');
const dots = $('#dots');
let currentSlide = 0;
let autoPlay;

slides.forEach((_, i) => {
  const d = document.createElement('button');
  d.className = 'dot-slide' + (i === 0 ? ' active' : '');
  d.setAttribute('aria-label', `Slide ${i + 1}`);
  d.onclick = () => showSlide(i);
  dots.appendChild(d);
});

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
  $$('.dot-slide').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}
function startAuto() {
  clearInterval(autoPlay);
  autoPlay = setInterval(() => showSlide(currentSlide + 1), 4500);
}
$('#prevSlide').onclick = () => { showSlide(currentSlide - 1); startAuto(); };
$('#nextSlide').onclick = () => { showSlide(currentSlide + 1); startAuto(); };
startAuto();

$('#menuToggle').onclick = () => $('#navLinks').classList.toggle('show');
$$('.nav-links a').forEach(a => a.onclick = () => $('#navLinks').classList.remove('show'));

$('.search-toggle').onclick = () => {
  $('#searchBar').classList.toggle('show');
  if ($('#searchBar').classList.contains('show')) $('#searchInput').focus();
};

const translations = {
  id: {
    navHome:'Home', navAbout:'About', navMenu:'Menu', navPromo:'Promo', navContact:'Contact',
    eyebrow:'A LITTLE SCOOP OF HAPPINESS', heroTitle:'Your happy<br><em>ice cream</em> moment.',
    heroText:'Es krim creamy dengan rasa yang dibuat untuk menemani hari-hari manismu.',
    explore:'Explore Menu →', story:'Our Story', fresh:'Freshly made, always creamy.',
    aboutTitle:"More than ice cream,<br><em>it's a mood.</em>",
    aboutText:'Ncream hadir untuk membuat momen sederhana terasa lebih spesial. Kami percaya satu scoop yang enak bisa mengubah mood dalam sekejap.',
    flavors:'Signature flavors', happy:'Happy moments', menuEyebrow:'SCOOP YOUR FAVORITE',
    menuTitle:'Our <em>favorites</em>', promoTitle:'Make it a<br><em>double scoop.</em>',
    promoText:'Tambah satu scoop favoritmu dan dapatkan harga spesial.', seeMenu:'See Menu →',
    contactTitle:"Let's make your<br><em>day sweeter.</em>", cartTitle:'Your Cart',
    emptyCart:'Your cart is empty.'
  },
  en: {
    navHome:'Home', navAbout:'About', navMenu:'Menu', navPromo:'Promo', navContact:'Contact',
    eyebrow:'A LITTLE SCOOP OF HAPPINESS', heroTitle:'Your happy<br><em>ice cream</em> moment.',
    heroText:'Creamy ice cream with flavors made to make your sweetest days even better.',
    explore:'Explore Menu →', story:'Our Story', fresh:'Freshly made, always creamy.',
    aboutTitle:"More than ice cream,<br><em>it's a mood.</em>",
    aboutText:'Ncream is here to make simple moments feel extra special. We believe one delicious scoop can instantly brighten your mood.',
    flavors:'Signature flavors', happy:'Happy moments', menuEyebrow:'SCOOP YOUR FAVORITE',
    menuTitle:'Our <em>favorites</em>', promoTitle:'Make it a<br><em>double scoop.</em>',
    promoText:'Add one more scoop of your favorite flavor and get a special price.', seeMenu:'See Menu →',
    contactTitle:"Let's make your<br><em>day sweeter.</em>", cartTitle:'Your Cart',
    emptyCart:'Your cart is empty.'
  }
};

function setLanguage(lang) {
  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang][key]) el.innerHTML = translations[lang][key];
  });
  const input = $('#searchInput');
  input.placeholder = lang === 'id' ? input.dataset.placeholderId : input.dataset.placeholderEn;
}
$('#language').onchange = e => setLanguage(e.target.value);

const cart = [];
const formatIDR = n => 'Rp' + n.toLocaleString('id-ID');

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) existing.qty++;
  else cart.push({name, price: Number(price), qty: 1});
  renderCart();
  openCart();
}

function renderCart() {
  const box = $('#cartItems');
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  $('#cartCount').textContent = count;
  if (!cart.length) {
    box.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    $('#cartTotal').textContent = 'Rp0';
    updateCheckout();
    return;
  }
  box.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div><h4>${item.name}</h4><p>${formatIDR(item.price)} × ${item.qty}</p></div>
      <div class="qty">
        <button onclick="changeQty(${i},-1)">−</button><span>${item.qty}</span><button onclick="changeQty(${i},1)">+</button>
      </div>
    </div>
  `).join('');
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  $('#cartTotal').textContent = formatIDR(total);
  updateCheckout();
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
}
window.changeQty = changeQty;

function updateCheckout() {
  const lines = cart.length
    ? cart.map(i => `${i.name} x ${i.qty}`).join(', ')
    : 'pesanan';
  const text = `Halo kak aku mau pesan ${lines} ya;`;
  $('#checkoutBtn').href = `https://wa.me/6285691428657?text=${encodeURIComponent(text)}`;
}
function openCart() {
  $('#cartPanel').classList.add('open');
  $('#cartOverlay').classList.add('show');
}
function closeCart() {
  $('#cartPanel').classList.remove('open');
  $('#cartOverlay').classList.remove('show');
}
$('#cartOpen').onclick = openCart;
$('#cartClose').onclick = closeCart;
$('#cartOverlay').onclick = closeCart;

$$('.quick-add').forEach(btn => {
  btn.onclick = () => addToCart(btn.dataset.product, btn.dataset.price);
});

$$('.pill').forEach(pill => {
  pill.onclick = () => {
    $$('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const filter = pill.dataset.filter;
    $$('.product-card').forEach(card => {
      card.style.display = filter === 'all' || card.dataset.category === filter ? '' : 'none';
    });
  };
});

$('#searchInput').addEventListener('input', e => {
  const q = e.target.value.toLowerCase().trim();
  let found = 0;
  $$('.product-card').forEach(card => {
    const match = card.dataset.name.toLowerCase().includes(q);
    card.style.display = match ? '' : 'none';
    if (match) found++;
  });
  $('#noResult').style.display = found ? 'none' : 'block';
  if (!q) {
    $$('.product-card').forEach(card => card.style.display = '');
    $('#noResult').style.display = 'none';
  }
});

setLanguage('id');
renderCart();
