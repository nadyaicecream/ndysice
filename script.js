/* ============================================================
   Ncream — Frontend (v2 with Google Sheets + Apps Script)
   1. Deploy Apps Script (lihat apps-script/Code.gs)
   2. Isi APPS_SCRIPT_URL di bawah
   3. Push ke GitHub Pages
   ============================================================ */
const CONFIG = {
  // ⬇️ Ganti dengan URL Web App setelah deploy Apps Script
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwkjdsgrZLMOuggtIPLDSfCvh4yLw5902Rsbn82F7e7L50WCUVNjK2hawl0aJLUS1Mr/exec',
  // Nomor WhatsApp toko (tanpa +)
  WA_NUMBER: '6285691428657',
  // Cache lokal (ms)
  CACHE_KEY: 'ncream_products_v2',
  CACHE_TTL: 5 * 60 * 1000 // 5 menit
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* ---------- Slider ---------- */
const slides = $$('.slide');
const dots = $('#dots');
let currentSlide = 0;
let autoPlay;

if (slides.length && dots) {
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
  const prev = $('#prevSlide');
  const next = $('#nextSlide');
  if (prev) prev.onclick = () => { showSlide(currentSlide - 1); startAuto(); };
  if (next) next.onclick = () => { showSlide(currentSlide + 1); startAuto(); };
  startAuto();
}

/* ---------- Nav & Search ---------- */
const menuToggle = $('#menuToggle');
if (menuToggle) menuToggle.onclick = () => $('#navLinks').classList.toggle('show');
$$('.nav-links a').forEach(a => a.onclick = () => $('#navLinks') && $('#navLinks').classList.remove('show'));

const searchToggle = $('.search-toggle');
if (searchToggle) {
  searchToggle.onclick = () => {
    $('#searchBar').classList.toggle('show');
    if ($('#searchBar').classList.contains('show')) $('#searchInput').focus();
  };
}

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
    if (translations[lang] && translations[lang][key]) el.innerHTML = translations[lang][key];
  });
  const input = $('#searchInput');
  if (input) {
    input.placeholder = lang === 'id' ? (input.dataset.placeholderId || '') : (input.dataset.placeholderEn || '');
  }
}
const langSelect = $('#language');
if (langSelect) langSelect.onchange = e => setLanguage(e.target.value);

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
  if (!box) return;
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const countEl = $('#cartCount');
  if (countEl) countEl.textContent = count;
  if (!cart.length) {
    box.innerHTML = '<p class="empty-cart" data-i18n="emptyCart">Your cart is empty.</p>';
    const totalEl = $('#cartTotal');
    if (totalEl) totalEl.textContent = 'Rp0';
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
  const totalEl = $('#cartTotal');
  if (totalEl) totalEl.textContent = formatIDR(total);
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
}
window.changeQty = changeQty;

function openCart() {
  $('#cartPanel') && $('#cartPanel').classList.add('open');
  $('#cartOverlay') && $('#cartOverlay').classList.add('show');
}
function closeCart() {
  $('#cartPanel') && $('#cartPanel').classList.remove('open');
  $('#cartOverlay') && $('#cartOverlay').classList.remove('show');
}
const cartOpen = $('#cartOpen');
if (cartOpen) cartOpen.onclick = openCart;
const cartClose = $('#cartClose');
if (cartClose) cartClose.onclick = closeCart;
const cartOverlay = $('#cartOverlay');
if (cartOverlay) cartOverlay.onclick = closeCart;

/* ---------- Products from Google Sheet (with local cache) ---------- */
let allProducts = [];

const FALLBACK_PRODUCTS = [
  { id: '1', name: 'Strawberry Bliss', description: 'Sweet strawberry', price: 25000, category: 'classic', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=700&q=85', stock: 99, active: true },
  { id: '2', name: 'Choco Dream', description: 'Rich chocolate', price: 27000, category: 'classic', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=700&q=85', stock: 99, active: true },
  { id: '3', name: 'Mint Cloud', description: 'Cool & refreshing', price: 28000, category: 'special', image: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&w=700&q=85', stock: 99, active: true },
  { id: '4', name: 'Vanilla Berry', description: 'Vanilla & berry', price: 30000, category: 'special', image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=700&q=85', stock: 99, active: true }
];

async function loadProducts() {
  const grid = $('#productGrid');
  const loading = $('#loadingMsg');
  if (loading) loading.style.display = 'block';
  if (grid) grid.innerHTML = '';

  // 1. Coba cache lokal dulu (cepat)
  try {
    const cached = localStorage.getItem(CONFIG.CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < CONFIG.CACHE_TTL && Array.isArray(parsed.products)) {
        allProducts = parsed.products;
        if (loading) loading.style.display = 'none';
        renderProducts(allProducts);
        buildFilterPills(allProducts);
        if ($('#flavorCount')) $('#flavorCount').textContent = allProducts.length + '+';
        // refresh di background
        refreshProducts(false);
        return;
      }
    }
  } catch (e) {}

  // 2. Fetch dari server
  await refreshProducts(true);
}

async function refreshProducts(showLoading = true) {
  const loading = $('#loadingMsg');
  try {
    if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
      console.warn('APPS_SCRIPT_URL belum diisi — memakai data fallback lokal.');
      allProducts = FALLBACK_PRODUCTS;
    } else {
      const res = await fetch(CONFIG.APPS_SCRIPT_URL + '?action=products');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (data.ok && Array.isArray(data.products)) {
        allProducts = data.products.filter(p => p.active !== false && p.active !== 'FALSE');
        localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({
          ts: Date.now(),
          products: allProducts
        }));
      } else {
        throw new Error(data.error || 'Invalid response');
      }
    }
  } catch (err) {
    console.error('Gagal load produk:', err);
    if (!allProducts.length) allProducts = FALLBACK_PRODUCTS;
  }

  if (showLoading && loading) loading.style.display = 'none';
  renderProducts(allProducts);
  buildFilterPills(allProducts);
  if ($('#flavorCount')) $('#flavorCount').textContent = allProducts.length + '+';
}

function renderProducts(products) {
  const grid = $('#productGrid');
  if (!grid) return;
  const noResult = $('#noResult');
  if (!products.length) {
    grid.innerHTML = '';
    if (noResult) noResult.style.display = 'block';
    return;
  }
  if (noResult) noResult.style.display = 'none';
  grid.innerHTML = products.map(p => {
    const outOfStock = Number(p.stock) <= 0;
    const stockLabel = outOfStock
      ? '<span class="stock-badge">Habis</span>'
      : (Number(p.stock) <= 5 ? `<span class="stock-badge stock-low">Sisa ${p.stock}</span>` : '');
    return `
    <article class="product-card" data-category="${(p.category || 'classic').toLowerCase()}" data-name="${p.name}">
      <div class="product-image">      
<img
  src="${p.image || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=700&q=85'}"
  alt="${p.name}"
  loading="lazy"
  onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=700&q=85';"
>

        ${outOfStock
          ? stockLabel
          : `<button class="quick-add" data-id="${p.id}" data-product="${p.name}" data-price="${p.price}">+</button>${stockLabel}`}
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
  if (!container) return;
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
      const noResult = $('#noResult');
      if (noResult) noResult.style.display = 'none';
    };
  });
}

const searchInput = $('#searchInput');
if (searchInput) {
  searchInput.addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    let found = 0;
    $$('.product-card').forEach(card => {
      const match = card.dataset.name.toLowerCase().includes(q);
      card.style.display = match ? '' : 'none';
      if (match) found++;
    });
    const noResult = $('#noResult');
    if (noResult) noResult.style.display = found || !q ? 'none' : 'block';
    if (!q) {
      $$('.product-card').forEach(card => card.style.display = '');
      if (noResult) noResult.style.display = 'none';
    }
  });
}

/* ---------- Checkout ---------- */
function openCheckoutModal() {
  if (!cart.length) return;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const summary = $('#modalSummary');
  if (summary) {
    summary.innerHTML = cart.map(i =>
      `<div class="sum-row"><span>${i.name} × ${i.qty}</span><span>${formatIDR(i.price * i.qty)}</span></div>`
    ).join('') + `<div class="sum-row sum-total"><span>Total</span><strong>${formatIDR(total)}</strong></div>`;
  }
  $('#checkoutModal') && $('#checkoutModal').classList.add('show');
  closeCart();
}

function closeCheckoutModal() {
  $('#checkoutModal') && $('#checkoutModal').classList.remove('show');
}

const checkoutBtn = $('#checkoutBtn');
if (checkoutBtn) checkoutBtn.onclick = openCheckoutModal;
const modalClose = $('#modalClose');
if (modalClose) modalClose.onclick = closeCheckoutModal;
const checkoutModal = $('#checkoutModal');
if (checkoutModal) {
  checkoutModal.addEventListener('click', e => {
    if (e.target === checkoutModal) closeCheckoutModal();
  });
}

const checkoutForm = $('#checkoutForm');
if (checkoutForm) {
  checkoutForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = ($('#customerName') && $('#customerName').value.trim()) || '';
    const wa = (($('#customerWA') && $('#customerWA').value.trim()) || '').replace(/\D/g, '');
    const notes = ($('#customerNotes') && $('#customerNotes').value.trim()) || '';
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
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Mengirim...';
    }

    let orderId = null;
    let errorMsg = null;

    try {
      if (CONFIG.APPS_SCRIPT_URL && !CONFIG.APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
        const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(orderPayload)
        });
        const data = await res.json();
        if (data && data.ok) {
          orderId = data.orderId || null;
          // Invalidate product cache supaya stok update
          localStorage.removeItem(CONFIG.CACHE_KEY);
        } else {
          errorMsg = (data && data.error) || 'Gagal menyimpan pesanan';
        }
      }
    } catch (err) {
      console.error('Gagal simpan order:', err);
      // Tetap lanjut ke WhatsApp
    }

    if (errorMsg) {
      alert(errorMsg);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Kirim Pesanan →';
      }
      return;
    }

    // Buka WhatsApp
    let waMsg = `Halo kak, aku mau pesan es krim:\n\n`;
    waMsg += cart.map(i => `• ${i.name} x${i.qty} = ${formatIDR(i.price * i.qty)}`).join('\n');
    waMsg += `\n\nTotal: ${formatIDR(total)}\nNama: ${name}\nWA: ${wa}`;
    if (notes) waMsg += `\nCatatan: ${notes}`;
    if (orderId) waMsg += `\n\nOrder ID: ${orderId}`;

    window.open(`https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(waMsg)}`, '_blank');

    // Reset
    cart.length = 0;
    renderCart();
    closeCheckoutModal();
    checkoutForm.reset();
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Kirim Pesanan →';
    }

    if (orderId) {
      showToast(`Pesanan berhasil! Order ID: ${orderId}`);
    }
  };
}

/* ---------- Toast sederhana ---------- */
function showToast(msg) {
  let t = document.getElementById('ncreamToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'ncreamToast';
    t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#252321;color:#fff;padding:12px 22px;border-radius:99px;font-size:.85rem;z-index:200;box-shadow:0 8px 30px rgba(0,0,0,.2);opacity:0;transition:opacity .3s;pointer-events:none;max-width:90%;text-align:center;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(() => { t.style.opacity = '0'; }, 3500);
}

/* ---------- Track Order (opsional) ---------- */
async function trackOrder(orderId) {
  if (!orderId || !CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    alert('Fitur lacak pesanan belum aktif.');
    return;
  }
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL + '?action=orderstatus&id=' + encodeURIComponent(orderId));
    const data = await res.json();
    if (data.ok) {
      alert(`Order ${data.orderId}\nStatus: ${data.status}\nTotal: ${formatIDR(data.total)}\nWaktu: ${data.timestamp}`);
    } else {
      alert(data.error || 'Order tidak ditemukan');
    }
  } catch (e) {
    alert('Gagal cek status. Coba lagi nanti.');
  }
}
window.trackOrder = trackOrder;

/* ---------- Init ---------- */
setLanguage('id');
renderCart();
loadProducts();

// Update WA links
const waBase = `https://wa.me/${CONFIG.WA_NUMBER}`;
const contactWA = $('#contactWA');
if (contactWA) contactWA.href = waBase;
const waFloat = $('#waFloat');
if (waFloat) waFloat.href = waBase;
