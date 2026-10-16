/**
 * ============================================================
 * Ncream Backend — Google Apps Script
 * ============================================================
 * SETUP:
 * 1. Buat Google Sheet baru dengan 2 sheet: Products & Orders
 * 2. Di Apps Script → Project Settings → Script properties
 *    tambahkan: SPREADSHEET_ID = (ID dari URL sheet)
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Salin URL, tempel di script.js (CONFIG.APPS_SCRIPT_URL)
 * ============================================================
 */

function getProp(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

function getSpreadsheet() {
  const id = getProp('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID belum diset di Script Properties');
  return SpreadsheetApp.openById(id);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function generateOrderId() {
  const now = new Date();
  const date = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyyMMdd');
  const rand = Math.floor(Math.random() * 900) + 100;
  return 'NCR-' + date + '-' + rand;
}

/* ========== GET products ========== */
function getProducts() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('products');
  if (cached) {
    return jsonResponse(JSON.parse(cached));
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Products');
  if (!sheet) return jsonResponse({ ok: false, error: 'Sheet Products tidak ditemukan' });

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).toLowerCase().trim());
  const products = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};
    headers.forEach(function(h, idx) {
      obj[h] = row[idx];
    });

    obj.id = String(obj.id || '');
    obj.name = String(obj.name || '');
    obj.description = String(obj.description || '');
    obj.price = Number(obj.price) || 0;
    obj.category = String(obj.category || 'classic');
    obj.image = String(obj.image || '');
    obj.stock = Number(obj.stock) || 0;
    obj.active = obj.active === true || obj.active === 'TRUE' || obj.active === 'true' || obj.active === 1;
    obj.sort = Number(obj.sort) || 999;

    if (obj.active && obj.name) products.push(obj);
  }

  products.sort(function(a, b) { return a.sort - b.sort; });

  const result = { ok: true, products: products, version: new Date().getTime() };
  cache.put('products', JSON.stringify(result), 300); // 5 menit
  return jsonResponse(result);
}

/* ========== POST order ========== */
function createOrder(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const ss = getSpreadsheet();
    const orderSheet = ss.getSheetByName('Orders');
    const productSheet = ss.getSheetByName('Products');

    if (!orderSheet || !productSheet) {
      return jsonResponse({ ok: false, error: 'Sheet Orders/Products tidak ditemukan' });
    }

    // Map produk: id → {row, stock}
    const productData = productSheet.getDataRange().getValues();
    const headers = productData[0].map(h => String(h).toLowerCase().trim());
    const idCol = headers.indexOf('id');
    const stockCol = headers.indexOf('stock');
    if (idCol < 0 || stockCol < 0) {
      return jsonResponse({ ok: false, error: 'Kolom id/stock tidak ditemukan di Products' });
    }

    const productMap = {};
    for (let i = 1; i < productData.length; i++) {
      const pid = String(productData[i][idCol]);
      productMap[pid] = {
        row: i + 1,
        stock: Number(productData[i][stockCol]) || 0
      };
    }

    const items = payload.items || [];
    for (let j = 0; j < items.length; j++) {
      const item = items[j];
      const p = productMap[String(item.id)];
      if (!p || p.stock < Number(item.qty)) {
        return jsonResponse({
          ok: false,
          error: 'Stok ' + (item.name || item.id) + ' tidak cukup'
        });
      }
    }

    // Kurangi stok
    for (let k = 0; k < items.length; k++) {
      const item = items[k];
      const p = productMap[String(item.id)];
      const newStock = p.stock - Number(item.qty);
      productSheet.getRange(p.row, stockCol + 1).setValue(newStock);
    }

    // Clear cache
    CacheService.getScriptCache().remove('products');

    // Simpan order
    const orderId = generateOrderId();
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

    orderSheet.appendRow([
      orderId,
      timestamp,
      payload.customer_name || '',
      payload.customer_wa || '',
      JSON.stringify(items),
      payload.items_text || '',
      Number(payload.total) || 0,
      payload.notes || '',
      'Baru'
    ]);

    return jsonResponse({
      ok: true,
      orderId: orderId,
      message: 'Pesanan berhasil disimpan'
    });

  } catch (e) {
    return jsonResponse({ ok: false, error: e.message });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

/* ========== GET order status ========== */
function getOrderStatus(orderId) {
  if (!orderId) return jsonResponse({ ok: false, error: 'orderId required' });

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Orders');
  if (!sheet) return jsonResponse({ ok: false, error: 'Sheet Orders tidak ditemukan' });

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(orderId)) {
      return jsonResponse({
        ok: true,
        orderId: data[i][0],
        timestamp: data[i][1],
        customer_name: data[i][2],
        total: data[i][6],
        status: data[i][8],
        items_text: data[i][5]
      });
    }
  }
  return jsonResponse({ ok: false, error: 'Order tidak ditemukan' });
}

/* ========== ENTRY POINTS ========== */
function doGet(e) {
  const action = ((e.parameter && e.parameter.action) || '').toLowerCase();
  try {
    if (action === 'products') return getProducts();
    if (action === 'orderstatus') return getOrderStatus(e.parameter.id);
    return jsonResponse({ ok: false, error: 'Unknown action. Use ?action=products or ?action=orderstatus&id=...' });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = (payload.action || '').toLowerCase();
    if (action === 'order') return createOrder(payload);
    return jsonResponse({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}
