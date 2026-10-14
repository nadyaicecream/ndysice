/**
 * Ncream — Google Apps Script (Database API)
 * 
 * Cara pakai:
 * 1. Buka spreadsheet Google Sheet kamu
 * 2. Extensions → Apps Script
 * 3. Hapus kode default, paste seluruh isi file ini
 * 4. Ganti SPREADSHEET_ID di bawah dengan ID Sheet kamu
 * 5. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy URL Web App, paste ke script.js di website (CONFIG.APPS_SCRIPT_URL)
 */

// ⬇️ GANTI dengan ID Spreadsheet kamu (dari URL sheet)
// Contoh URL: https://docs.google.com/spreadsheets/d/1ABC...xyz/edit
// ID-nya = 1ABC...xyz
const SPREADSHEET_ID = 'https://script.google.com/macros/s/AKfycbwmqJcRXoodcBppqWNv1HR_fT_1ENgGgHAdjuWdohsoRP96-yA5zEafJwOtXZEYTs3P0w/exec
';

const SHEET_PRODUCTS = 'Products';
const SHEET_ORDERS = 'Orders';

function doGet(e) {
  const action = (e.parameter && e.parameter.action) || 'products';
  try {
    if (action === 'products') {
      return jsonResponse({ ok: true, products: getProducts() });
    }
    return jsonResponse({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'order') {
      const result = saveOrder(body);
      return jsonResponse(result);
    }
    return jsonResponse({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function getProducts() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_PRODUCTS);
  if (!sheet) throw new Error('Sheet "Products" tidak ditemukan');

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const rows = data.slice(1);

  return rows.map((row, idx) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return {
      id: String(obj.id || idx + 1),
      name: String(obj.name || ''),
      description: String(obj.description || obj.desc || ''),
      price: Number(obj.price) || 0,
      category: String(obj.category || 'classic').toLowerCase(),
      image: String(obj.image || obj.img || ''),
      stock: Number(obj.stock) >= 0 ? Number(obj.stock) : 99,
      active: obj.active === true || obj.active === 'TRUE' || obj.active === 'true' || obj.active === 1 || obj.active === ''
    };
  }).filter(p => p.name);
}

function saveOrder(body) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_ORDERS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_ORDERS);
    sheet.appendRow(['id', 'timestamp', 'customer_name', 'customer_wa', 'items', 'total', 'notes', 'status']);
  }

  const id = Utilities.getUuid().slice(0, 8);
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
  const itemsText = body.items_text || (body.items || []).map(i => i.name + ' x' + i.qty).join(', ');
  const total = Number(body.total) || 0;
  const notes = body.notes || '';
  const name = body.customer_name || '';
  const wa = body.customer_wa || '';

  sheet.appendRow([id, timestamp, name, wa, itemsText, total, notes, 'Baru']);

  // Kurangi stok (opsional, jika kolom stock ada)
  try {
    decreaseStock(ss, body.items || []);
  } catch (err) {
    // tidak gagalkan order jika stok gagal
    console.warn('Stock update failed:', err);
  }

  return { ok: true, order_id: id, message: 'Order saved' };
}

function decreaseStock(ss, items) {
  if (!items || !items.length) return;
  const sheet = ss.getSheetByName(SHEET_PRODUCTS);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const idCol = headers.indexOf('id');
  const nameCol = headers.indexOf('name');
  const stockCol = headers.indexOf('stock');
  if (stockCol < 0) return;

  items.forEach(item => {
    for (let r = 1; r < data.length; r++) {
      const matchId = idCol >= 0 && String(data[r][idCol]) === String(item.id);
      const matchName = nameCol >= 0 && String(data[r][nameCol]) === String(item.name);
      if (matchId || matchName) {
        const current = Number(data[r][stockCol]) || 0;
        const newStock = Math.max(0, current - Number(item.qty || 1));
        sheet.getRange(r + 1, stockCol + 1).setValue(newStock);
        break;
      }
    }
  });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Jalankan sekali dari editor Apps Script untuk setup header Sheets
 * (opsional — kalau kamu sudah buat header manual, skip saja)
 */
function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  let products = ss.getSheetByName(SHEET_PRODUCTS);
  if (!products) products = ss.insertSheet(SHEET_PRODUCTS);
  products.clear();
  products.appendRow(['id', 'name', 'description', 'price', 'category', 'image', 'stock', 'active']);
  products.appendRow(['1', 'Strawberry Bliss', 'Sweet strawberry', 25000, 'classic', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=700&q=85', 50, 'TRUE']);
  products.appendRow(['2', 'Choco Dream', 'Rich chocolate', 27000, 'classic', 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=700&q=85', 50, 'TRUE']);
  products.appendRow(['3', 'Mint Cloud', 'Cool & refreshing', 28000, 'special', 'https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&w=700&q=85', 40, 'TRUE']);
  products.appendRow(['4', 'Vanilla Berry', 'Vanilla & berry', 30000, 'special', 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=700&q=85', 40, 'TRUE']);

  let orders = ss.getSheetByName(SHEET_ORDERS);
  if (!orders) orders = ss.insertSheet(SHEET_ORDERS);
  orders.clear();
  orders.appendRow(['id', 'timestamp', 'customer_name', 'customer_wa', 'items', 'total', 'notes', 'status']);

  Logger.log('Setup selesai! Sheet Products & Orders sudah siap.');
}
