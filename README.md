# Ncream — Ice Cream World (GitHub Pages + Google Sheets)

Website es krim siap deploy ke **GitHub Pages**, database gratis pakai **Google Sheets + Apps Script**.

Tidak ada secret di frontend. Semua config sensitif (Spreadsheet ID) disimpan di **Script Properties**.

---

## Isi Zip

```
ncream/
├── index.html          ← halaman utama
├── style.css           ← styling
├── script.js           ← frontend (isi APPS_SCRIPT_URL di sini)
├── favicon.svg
├── favicon.png
├── apps-script/
│   └── Code.gs         ← backend Google Apps Script
└── README.md           ← file ini
```

---

## Langkah Deploy (sekali saja)

### 1. Buat Google Sheet

1. Buka [sheets.google.com](https://sheets.google.com) → Blank spreadsheet
2. Rename spreadsheet: **Ncream DB**
3. Buat 2 sheet dengan nama persis:

#### Sheet `Products` (baris 1 = header)

| id | name | description | price | category | image | stock | active | sort |
|----|------|-------------|-------|----------|-------|-------|--------|------|
| 1 | Strawberry Bliss | Sweet strawberry | 25000 | classic | https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=700&q=85 | 20 | TRUE | 1 |
| 2 | Choco Dream | Rich chocolate | 27000 | classic | https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=700&q=85 | 15 | TRUE | 2 |
| 3 | Mint Cloud | Cool & refreshing | 28000 | special | https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&w=700&q=85 | 10 | TRUE | 3 |
| 4 | Vanilla Berry | Vanilla & berry | 30000 | special | https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=700&q=85 | 8 | TRUE | 4 |

#### Sheet `Orders` (baris 1 = header)

| orderId | timestamp | customer_name | customer_wa | items_json | items_text | total | notes | status |
|---------|-----------|---------------|-------------|------------|------------|-------|-------|--------|

(biarkan kosong, data akan masuk otomatis)

4. Salin **Spreadsheet ID** dari URL:
   `https://docs.google.com/spreadsheets/d/XXXXXXX/edit` → ambil `XXXXXXX`

---

### 2. Setup Apps Script

1. Di spreadsheet → **Extensions → Apps Script**
2. Hapus semua kode default
3. Paste isi file `apps-script/Code.gs`
4. Klik **Project Settings** (ikon gear kiri)
5. Scroll ke **Script properties** → **Add script property**:
   - Property: `SPREADSHEET_ID`
   - Value: ID spreadsheet yang tadi disalin
6. Klik **Save**

### 3. Deploy Web App

1. Klik **Deploy → New deployment**
2. Pilih type: **Web app**
3. Description: `Ncream v1`
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Klik **Deploy**
7. Authorize (pilih akun Google → Advanced → Go to ... → Allow)
8. **Salin URL** yang muncul (bentuk `https://script.google.com/macros/s/AKfycb.../exec`)

---

### 4. Update frontend

1. Buka file `script.js`
2. Ganti baris ini:

```js
APPS_SCRIPT_URL: 'PASTE_YOUR_APPS_SCRIPT_URL_HERE',
```

dengan URL yang baru saja disalin.

3. (Opsional) Ganti nomor WhatsApp:

```js
WA_NUMBER: '6285691428657',
```

---

### 5. Deploy ke GitHub Pages

1. Buat repo baru di GitHub (atau pakai repo yang sudah ada)
2. Upload semua file di root repo (index.html, style.css, script.js, favicon.*, dll)
3. Settings → Pages → Source: **Deploy from a branch** → branch `main` / `master` → folder `/ (root)`
4. Tunggu 1–2 menit, situs hidup di `https://username.github.io/repo` atau custom domain

---

## Fitur yang sudah aktif

- Menu produk dari Google Sheet (real-time)
- Stok otomatis berkurang saat order
- Cache lokal 5 menit → load menu super cepat
- Order tersimpan ke sheet + buka WhatsApp otomatis
- Order ID (contoh: `NCR-20261016-123`)
- Badge “Habis” / “Sisa X” saat stok rendah
- Fallback produk lokal kalau backend offline

---

## Update stok / harga / rasa

Cukup edit di Google Sheet → refresh website (atau tunggu max 5 menit karena cache).

Untuk force refresh stok setelah order, cache otomatis di-clear.

---

## Cek status order (opsional)

Di console browser bisa panggil:

```js
trackOrder('NCR-20261016-123')
```

Atau buat tombol sendiri nanti.

---

## Keamanan

| Item | Lokasi |
|------|--------|
| Spreadsheet ID | Script Properties (tidak terlihat publik) |
| URL Web App | Boleh publik (hanya endpoint) |
| Data order | Hanya di Google Sheet milikmu |

Tidak ada API key atau password di GitHub Pages.

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Menu pakai data fallback | Cek `APPS_SCRIPT_URL` sudah benar & deploy “Anyone” |
| Error “SPREADSHEET_ID belum diset” | Isi Script Properties |
| Stok tidak berkurang | Pastikan kolom `id` dan `stock` di sheet Products |
| CORS / fetch gagal | Deploy ulang Web App sebagai “Anyone” |

---

Made with 🍦 for Ncream
