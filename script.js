/* ============================================================
   Ncream — Frontend
   Ganti APPS_SCRIPT_URL setelah deploy Google Apps Script
   ============================================================ */
const CONFIG = {
  // ⬇️ PASTE URL Web App Apps Script di sini setelah deploy
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwmqJcRXoodcBppqWNv1HR_fT_1ENgGgHAdjuWdohsoRP96-yA5zEafJwOtXZEYTs3P0w/exec
',
  // Nomor WhatsApp toko (tanpa +)
  WA_NUMBER: '6285691428657'
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* ---------- Slider ---------- */
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

/* ---------- Nav & Search ---------- */
$('#menuToggle').onclick = () => $('#navLinks').classList.toggle('show');
$$('.nav-links a').forEach(a => a.onclick = () => $('#navLinks').classList.remove('show'));

$('.search-toggle').onclick = () => {
  $('#searchBar').classList.toggle('show');
  if ($('#searchBar').classList.contains('show')) $('#searchInput').focus();
};

/* ---------- i18n ---------- */
const translations = {
  id: {
    navHome: 'Home', navAbout: 'About', navMenu: 'Menu', navPromo: 'Promo', navContact: 'Contact',
    eyebrow: 'A LITTLE SCOOP OF HAPPINESS', heroTitle: 'Your happy<br><em>ice cream</em> moment.',
    heroText: 'Es krim creamy dengan rasa yang dibuat untuk menemani hari-hari manismu.',
    explore: 'Explore Menu →', story: 'Our Story', fresh: 'Freshly made, always creamy.',
    aboutTitle: "More than ice cream,<br><em>it's a mood.</em>",
    aboutText: 'Ncream hadir untuk membuat momen sederhana terasa lebih spesial. Kami percaya satu scoop yang enak bisa mengubah mood dalam sekejap.',
    flavors: 'Signature flavors', happy: 'Happy moments', menuEyebrow: 'SCOOP YOUR FAVORITE',
    menuTitle: 'Our <em>favorites</em>', promoTitle: 'Make it a<br><em>double scoop.</em>',
    promoText: 'Tambah satu scoop favoritmu dan dapatkan harga spesial.', seeMenu: 'See Menu →',
    contactTitle: "Let's make your<br><em>day sweeter.</em>", cartTitle: 'Your Cart',
    emptyCart: 'Your cart is empty.'
  },
  en: {
    navHome: 'Home', navAbout: 'About', navMenu: 'Menu', navPromo: 'Promo', navContact: 'Contact',
    eyebrow: 'A LITTLE SCOOP OF HAPPINESS', heroTitle: 'Your happy<br><em>ice cream</em> moment.',
    heroText: 'Creamy ice cream with flavors made to make your sweetest days even better.',
    explore: 'Explore Menu →', story: 'Our Story', fresh: 'Freshly made, always creamy.',
    aboutTitle: "More than ice cream,<br><em>it's a mood.</em>",
    aboutText: 'Ncream is here to make simple moments feel extra special. We believe one delicious scoop can instantly brighten your mood.',
    flavors: 'Signature flavors', happy: 'Happy moments', menuEyebrow: 'SCOOP YOUR FAVORITE',
    menuTitle: 'Our <em>favorites</em>', promoTitle: 'Make it a<br><em>double scoop.</em>',
    promoText: 'Add one more scoop of your favorite flavor and get a special price.', seeMenu: 'See Menu →',
    contactTitle: "Let's make your<br><em>day sweeter.</em>", cartTitle: 'Your Cart',
    emptyCart: 'Your cart is empty.'
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

/* ---------- Cart ---------- */
const cart = [];
const formatIDR = n => 'Rp' + Number(n).toLocaleString('id-ID');

function addToCart(name, price, id) {
  const existing = cart.find(item => item.name === name);
  if (existing) existing.qty++;
  else cart.push({ id: id || '', name, price: Number(price), qty: 1 });
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
    return;
  }
  box.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div><h4>${item.name}</h4><p>${formatIDR(item.price)} × ${item.qty}</p></div>
      <div class="qty">
        <button type="button" onclick="changeQty(${i},-1)">−</button>
        <span>${item.qty}</span>
        <button type="button" onclick="changeQty(${i},1)">+</button>
      </div>
    </div>
  `).join('');
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  $('#cartTotal').textContent = formatIDR(total);
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
}
window.changeQty = changeQty;

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

/* ---------- Products from Google Sheet ---------- */
let allProducts = [];

async function loadProducts() {
  const grid = $('#productGrid');
  const loading = $('#loadingMsg');
  loading.style.display = 'block';
  grid.innerHTML = '';

  // Fallback produk jika URL belum diisi / error
  const fallback = [
    { id: '1', name: 'Strawberry Bliss', description: 'Sweet strawberry', price: 25000, category: 'classic', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=700&q=85', stock: 99, active: true },
    { id: '2', name: 'Choco Dream', description: 'Rich chocolate', price: 27000, category: 'classic', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=700&q=85', stock: 99, active: true },
    { id: '3', name: 'Mint Cloud', description: 'Cool & refreshing', price: 28000, category: 'special', image: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&w=700&q=85', stock: 99, active: true },
    { id: '4', name: 'Vanilla Berry', description: 'Vanilla & berry', price: 30000, category: 'special', image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=700&q=85', stock: 99, active: true }
  ];

  try {
    if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
      console.warn('APPS_SCRIPT_URL belum diisi — memakai data fallback lokal.');
      allProducts = fallback;
    } else {
      const res = await fetch(CONFIG.APPS_SCRIPT_URL + '?action=products');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (data.ok && Array.isArray(data.products)) {
        allProducts = data.products.filter(p => p.active !== false && p.active !== 'FALSE');
      } else {
        throw new Error(data.error || 'Invalid response');
      }
    }
  } catch (err) {
    console.error('Gagal load produk:', err);
    allProducts = fallback;
  }

  loading.style.display = 'none';
  renderProducts(allProducts);
  buildFilterPills(allProducts);
  const activeCount = allProducts.length;
  if ($('#flavorCount')) $('#flavorCount').textContent = activeCount + '+';
}

function renderProducts(products) {
  const grid = $('#productGrid');
  if (!products.length) {
    grid.innerHTML = '';
    $('#noResult').style.display = 'block';
    return;
  }
  $('#noResult').style.display = 'none';
  grid.innerHTML = products.map(p => {
    const outOfStock = Number(p.stock) <= 0;
    return `
    <article class="product-card" data-category="${(p.category || 'classic').toLowerCase()}" data-name="${p.name}">
      <div class="product-image">
        <img src="${p.image || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=700&q=85'}" alt="${p.name}" loading="lazy">
        ${outOfStock
          ? '<span class="stock-badge">Habis</span>'
          : `<button class="quick-add" data-id="${p.id}" data-product="${p.name}" data-price="${p.price}">+</button>`}
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.description || ''}</p>
        <strong>${formatIDR(p.price)}</strong>
      </div>
    </article>`;
  }).join('');

  $$('.quick-add').forEach(btn => {
    btn.onclick = () => addToCart(btn.dataset.product, btn.dataset.price, btn.dataset.id);
  });
}

function buildFilterPills(products) {
  const container = $('#filterPills');
  const cats = [...new Set(products.map(p => (p.category || 'classic').toLowerCase()))];
  container.innerHTML = `<button class="pill active" data-filter="all">All</button>` +
    cats.map(c => `<button class="pill" data-filter="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</button>`).join('');

  $$('.pill').forEach(pill => {
    pill.onclick = () => {
      $$('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      $$('.product-card').forEach(card => {
        card.style.display = filter === 'all' || card.dataset.category === filter ? '' : 'none';
      });
      $('#noResult').style.display = 'none';
    };
  });
}

$('#searchInput').addEventListener('input', e => {
  const q = e.target.value.toLowerCase().trim();
  let found = 0;
  $$('.product-card').forEach(card => {
    const match = card.dataset.name.toLowerCase().includes(q);
    card.style.display = match ? '' : 'none';
    if (match) found++;
  });
  $('#noResult').style.display = found || !q ? 'none' : 'block';
  if (!q) {
    $$('.product-card').forEach(card => card.style.display = '');
    $('#noResult').style.display = 'none';
  }
});

/* ---------- Checkout Modal ---------- */
function openCheckoutModal() {
  if (!cart.length) return;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  $('#modalSummary').innerHTML = cart.map(i =>
    `<div class="sum-row"><span>${i.name} × ${i.qty}</span><span>${formatIDR(i.price * i.qty)}</span></div>`
  ).join('') + `<div class="sum-row sum-total"><span>Total</span><strong>${formatIDR(total)}</strong></div>`;
  $('#checkoutModal').classList.add('show');
  closeCart();
}

function closeCheckoutModal() {
  $('#checkoutModal').classList.remove('show');
}

$('#checkoutBtn').onclick = openCheckoutModal;
$('#modalClose').onclick = closeCheckoutModal;
$('#checkoutModal').addEventListener('click', e => {
  if (e.target === $('#checkoutModal')) closeCheckoutModal();
});

$('#checkoutForm').onsubmit = async (e) => {
  e.preventDefault();
  const name = $('#customerName').value.trim();
  const wa = $('#customerWA').value.trim().replace(/\D/g, '');
  const notes = $('#customerNotes').value.trim();
  if (!name || !wa) return;

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemsText = cart.map(i => `${i.name} x${i.qty}`).join(', ');
  const orderPayload = {
    action: 'order',
    customer_name: name,
    customer_wa: wa,
    items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    items_text: itemsText,
    total: total,
    notes: notes
  };

  const btn = $('#submitOrderBtn');
  btn.disabled = true;
  btn.textContent = 'Mengirim...';

  let saved = false;
  try {
    if (CONFIG.APPS_SCRIPT_URL && !CONFIG.APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
      const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      saved = data && data.ok;
      if (!saved) console.warn('Order save response:', data);
    }
  } catch (err) {
    console.error('Gagal simpan order:', err);
  }

  // Selalu buka WhatsApp
  const waMsg = `Halo kak, aku mau pesan es krim:\n\n${cart.map(i => `• ${i.name} x${i.qty} = ${formatIDR(i.price * i.qty)}`).join('\n')}\n\nTotal: ${formatIDR(total)}\nNama: ${name}\nWA: ${wa}${notes ? '\nCatatan: ' + notes : ''}`;
  window.open(`https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(waMsg)}`, '_blank');

  // Reset
  cart.length = 0;
  renderCart();
  closeCheckoutModal();
  $('#checkoutForm').reset();
  btn.disabled = false;
  btn.textContent = 'Kirim Pesanan →';

  if (saved) {
    // optional subtle feedback
  }
};

/* ---------- Init ---------- */
setLanguage('id');
renderCart();
loadProducts();

// Update WA links
const waBase = `https://wa.me/${CONFIG.WA_NUMBER}`;
$('#contactWA').href = waBase;
$('#waFloat').href = waBase;
